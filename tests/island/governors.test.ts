import { describe, it, expect } from 'vitest'
import {
  activeGovernor, inGracePeriod, landPaused, eggsPaused, GOVERNOR_LINE,
  fieldsWanted, petsHoused, habitableFields, tileSteps, eggSteps,
} from '../../src/island/governors'
import {
  createFlow, challengePassed, tapEgg, tapSum, chooseTile, placeTile,
  pagesForEgg, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { sockets } from '../../src/island/world/grid'
import {
  balance, tileCost, eggCost, tileCostPast, eggCostPast,
  emptySteps, crowdedSteps, scarcityMultiplier, itemPay,
} from '../../src/island/balance'

/**
 * Grow the island by n grass tiles, ignoring the economy.
 *
 * Prepaid: sumProgress well past any price the curve can name, so siting the
 * plot finishes it on the spot and the helper stays one step per tile.
 */
function grow(f: Flow, n: number): Flow {
  for (let i = 0; i < n; i++) {
    let g: Flow = { ...f, phase: 'placing', chosen: null, plot: null, sumProgress: 999 }
    g = chooseTile(g, 'grass')
    const s = sockets(g.island)[0]!
    f = placeTile(g, s)
  }
  return f
}

/** Hatch n pets, ignoring the economy. */
function withPets(f: Flow, n: number): Flow {
  for (let i = 0; i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free', readProgress: 999 }),
      { name: 'P' + i, species: 'animal-fox' })
  }
  return f
}

/* ------------------------------------------------------------------------- *
 * The two walls, found by walking rather than by arithmetic.
 *
 * Both answer in FIELDS, counting the hex the island is born with — so
 * `grow(f, n)` leaves `n + 1` of them. `ceiling` used to answer in calls to
 * `grow` and so read one low, which nothing asserted against it noticed; PB-039
 * put a `floor` next to it, and two neighbouring helpers that disagree about
 * what a number means is how the next reader gets caught out.
 *
 * They walk the real `activeGovernor` over real flows on purpose. A helper that
 * recomputed the threshold from `balance` would agree with a broken governor.
 * ------------------------------------------------------------------------- */

/** The largest field count that does not pause new land, at `pets` pets. */
function ceiling(pets: number): number {
  for (let n = 0; n < 400; n++) {
    const f = withPets(grow(createFlow(), n), pets)
    if (activeGovernor(f) === 'space-surplus') return n
  }
  throw new Error('never paused')
}

/** The fewest fields that do NOT pause eggs, at `pets` pets — the mirror. */
function floor(pets: number): number {
  for (let n = 0; n < 400; n++) {
    const f = withPets(grow(createFlow(), n), pets)
    if (activeGovernor(f) !== 'nursery-queue') return n + 1
  }
  throw new Error('never freed')
}

describe('the grace period', () => {
  it('holds while the island is new, so a beginner is never redirected', () => {
    // §5: governors never fire during the first ten minutes
    expect(inGracePeriod(createFlow())).toBe(true)
    expect(activeGovernor(createFlow())).toBe('none')
  })

  it('ends once there is a real island and real friends', () => {
    const f = withPets(grow(createFlow(), 5), 2)
    expect(inGracePeriod(f)).toBe(false)
  })

  it('suppresses BOTH governors while it lasts, not just the one she is near', () => {
    /*
     * §5, and it is asserted over the whole opening rather than at one point,
     * because the two thresholds are DATA. With the shipped ratios no island
     * small enough to be in grace can reach either wall — a ceiling needs four
     * fields and grace ends at four tiles; a floor needs more pets than 1.5
     * fields will house and grace ends at two pets. So today this guard is a
     * floor under `balance.json` rather than under any reachable state, and if
     * either ratio is ever retuned toward the middle this is what catches it.
     */
    for (let tiles = 0; tiles <= 6; tiles++) {
      for (let pets = 0; pets <= 3; pets++) {
        const f = withPets(grow(createFlow(), tiles), pets)
        if (!inGracePeriod(f)) continue
        expect(activeGovernor(f), `${tiles + 1} fields, ${pets} pets`).toBe('none')
      }
    }
  })
})

describe('the space-surplus governor', () => {
  it('pauses new land when there is far more room than friends', () => {
    // Seven fields for two friends: past 3.0 tiles per pet, the EMPTY wall.
    const f = withPets(grow(createFlow(), 6), 2)
    expect(habitableFields(f)).toBe(7)
    expect(habitableFields(f)).toBeGreaterThan(3 * f.pets.length)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(true)
  })

  it('lets a plot already under construction finish anyway', () => {
    // §5: a plot mid-build always finishes; work is never taken back. The
    // governor pauses STARTING land, never finishing it.
    let f = withPets(grow(createFlow(), 6), 2)
    f = { ...f, plot: { at: { q: 4, r: 0 }, type: 'grass' } }
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(false)
  })

  it('lifts once enough friends have come home', () => {
    // Seven fields hold three friends comfortably: inside both walls, so Fred
    // has nothing to say and neither price is dearer than the list.
    const f = withPets(grow(createFlow(), 6), 3)
    expect(activeGovernor(f)).toBe('none')
    expect(landPaused(f)).toBe(false)
    expect(eggsPaused(f)).toBe(false)
  })

  it('never pauses reading — only new land', () => {
    const f = withPets(grow(createFlow(), 6), 2)
    expect(eggsPaused(f)).toBe(false)
  })
})

describe('the governor lines', () => {
  it('are want-framed: they ask for the other thing, never forbid this one', () => {
    for (const line of Object.values(GOVERNOR_LINE)) {
      expect(line).not.toMatch(/can'?t|cannot|not allowed|no more|stop/i)
      expect(line.length).toBeGreaterThan(10)
    }
    expect(GOVERNOR_LINE['space-surplus']).toMatch(/read/i)
    expect(GOVERNOR_LINE['nursery-queue']).toMatch(/home/i)
  })
})

describe('the corridor is a RATIO, not a fixed gap — Joe, 28 July', () => {
  /*
   * *"the tile/animal ratio seems to be 1:1, think that was more relaxed
   * before"*, then: *"for every tile, there needs to be one animal. we can be a
   * bit more relaxed with that, say 3 tiles for 2 animals. bit more maths than
   * reading since the maths goes quicker."*
   *
   * He was right about the symptom AND about it having been looser once. The
   * governors held `habitable - pets` inside an absolute corridor, so the gap
   * could never exceed four however big the island got — which drives the ratio
   * to 1:1 asymptotically while leaving the early game, where four is most of the
   * island, genuinely relaxed.
   *
   * These tests are written as PROPERTIES of the ratio rather than against
   * particular tile counts, so the target can be retuned in balance.json without
   * anything failing for the wrong reason. What must not silently come back is
   * the absolute corridor.
   */

  it('holds the crowded wall at three tiles for every two animals', () => {
    expect(fieldsWanted(0)).toBe(0)
    expect(fieldsWanted(2)).toBe(3)
    expect(fieldsWanted(10)).toBe(15)
    expect(balance.governor.corridor.crowded).toBe(1.5)
  })

  it('holds the empty wall at three tiles for every one animal', () => {
    expect(balance.governor.corridor.empty).toBe(3)
    // JT-012's target is 2.0 tiles per pet, and the two walls straddle it —
    // evenly, in the unit Joe said it in. In ANIMALS PER TILE they are 2/3, 1/2
    // and 1/3: a sixth either side of the target. In tiles per pet the same
    // three numbers read 1.5, 2.0, 3.0, which is lopsided only because taking
    // reciprocals does not preserve a midpoint.
    const animalsPerTile = (tilesPerPet: number) => 1 / tilesPerPet
    const target = 1 / 2
    const crowded = animalsPerTile(balance.governor.corridor.crowded)
    const empty = animalsPerTile(balance.governor.corridor.empty)
    expect(crowded - target).toBeCloseTo(target - empty, 10)
    expect(crowded - target).toBeCloseTo(1 / 6, 10)
  })

  it('lets the island hold MORE land per pet as the pets multiply', () => {
    /*
     * The property the old code could not have: with an absolute corridor the
     * ceiling rises by exactly one per pet, so this difference would be flat.
     */
    const low = ceiling(2)
    const high = ceiling(8)
    expect(high - low).toBeGreaterThan(8 - 2)
  })

  it('does not drive the ratio to 1:1 as the island grows', () => {
    // The actual complaint. At a decent number of pets the permitted field count
    // must be comfortably above one-for-one.
    const pets = 10
    expect(ceiling(pets) / pets).toBeGreaterThan(1.2)
  })

  it('still pauses land eventually, so the island cannot run away from her', () => {
    const f = withPets(grow(createFlow(), 40), 2)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(true)
  })

  it('keeps the two governors mutually exclusive', () => {
    /*
     * They are two separate walls now (PB-039), so "mutually exclusive" is no
     * longer a property of one number read from both ends — it is a claim about
     * `1.5·pets + 4` lying above `pets / 1.5` everywhere, and it has to be walked.
     *
     * The grid is widened past the old 24×12 for that reason: the old floor
     * converged on the ceiling as pets grew, so the interesting region was the
     * far end, and 12 pets was not far enough to be convincing. The island is
     * grown once per tile count and the pets hatched into it one at a time, which
     * is what keeps a 32×24 sweep cheaper than the 24×12 one it replaces.
     */
    for (let tiles = 0; tiles <= 32; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 0; pets <= 24; pets++) {
        if (pets > 0) f = withPets(f, 1)
        if (inGracePeriod(f)) continue
        expect(landPaused(f) && eggsPaused(f), `${tiles + 1} fields, ${pets} pets`).toBe(false)
      }
    }
  })
})

/**
 * The FLOOR is a ratio too — PB-039, Joe, 28 July.
 *
 * *"currently the min balance is 3 tiles vs 2 animals, ie for 2 animals, she can
 * have 3 tiles, ie she will have to do some reading to do more maths. on the
 * other end of the scale, which i dont think we have bound properly, so she
 * should be pushed to do maths only at 3 animals on 2 tiles as the other end of
 * the balance."*
 *
 * He was right that it was never bound properly. Both ends used to hang off ONE
 * target ratio: the ceiling at `1.5·pets + 4`, the floor at `1.5·pets - 3`. An
 * absolute shortfall measured from the same target converges on that target, so
 * the floor crept up to 1.2 tiles per pet by ten pets and would have reached 1.4
 * by twenty — a floor sitting almost on the ceiling's own number.
 *
 * The whole ratio suite above was written against `ceiling()` and there was no
 * `floor()`, which is exactly why the fault survived the fix at the other wall.
 * This block is the mirror. Like the block above it, these are PROPERTIES of the
 * ratio rather than assertions about particular tile counts, so `balance.json`
 * can be retuned without anything failing for the wrong reason.
 */
describe('the floor is a RATIO too — PB-039, moved by JT-012', () => {
  it('houses two animals for every three tiles, in whole animals', () => {
    expect(petsHoused(0)).toBe(0)
    expect(petsHoused(3)).toBe(2)
    expect(petsHoused(15)).toBe(10)
    // Whole animals: two fields hold one friend and not one and a third.
    expect(petsHoused(2)).toBe(1)
    expect(petsHoused(4)).toBe(2)
  })

  it("is the corridor's number exactly: three fields hold two friends, and stall at three", () => {
    // JT-012 read literally at the crowded wall — 1.5 fields per pet. Three
    // tiles is `grow(_, 2)`; the island is born with one hex.
    const two = withPets(grow(createFlow(), 2), 2)
    expect(activeGovernor(two)).toBe('none')
    expect(eggsPaused(two)).toBe(false)

    const three = withPets(grow(createFlow(), 2), 3)
    expect(activeGovernor(three)).toBe('nursery-queue')
    expect(eggsPaused(three)).toBe(true)
    expect(landPaused(three)).toBe(false)      // it asks for maths, it bars nothing
  })

  it('rises in step with the pets, at one and a half fields each', () => {
    /*
     * PB-039 put the floor at two thirds of a field per pet, so it rose SLOWER
     * than the pets; JT-012 moves it to the crowded wall, 1.5 fields per pet, so
     * it rises with them. The property that matters either way is that it is a
     * RATIO — an absolute shortfall would give a constant difference here.
     */
    expect(floor(8) - floor(2)).toBe(Math.ceil(1.5 * 8) - Math.ceil(1.5 * 2))
    expect(floor(8) - floor(2)).toBe(9)
  })

  it('stays at 1.5 fields per pet however large the island grows', () => {
    // The fault PB-039 found was a floor that DRIFTED as the island grew. It no
    // longer drifts in either direction: it is one wall of a fixed corridor.
    for (const pets of [2, 4, 10, 20]) {
      expect(floor(pets), `${pets} pets`).toBe(Math.ceil(1.5 * pets))
    }
  })

  it('asks for maths at 1.5 tiles per pet at ten pets, not at 0.7', () => {
    // 0.7 is where PB-039's floor sat, and JT-012 moved it: the crowded wall is
    // now the same 2:3 ratio at every island size.
    const pets = 10
    expect(floor(pets)).toBe(15)
    expect(floor(pets) / pets).toBe(1.5)
  })

  it('leaves a wide corridor between the two walls at every size', () => {
    // The two ends are separate ratios, so the room she has to play in must grow
    // with the island rather than staying a fixed handful of hexes.
    for (const pets of [2, 6, 10, 20]) {
      expect(ceiling(pets) - floor(pets), `${pets} pets`).toBeGreaterThan(2)
    }
    expect(ceiling(20) - floor(20)).toBeGreaterThan(ceiling(2) - floor(2))
  })
})

/**
 * No state she cannot leave — the doctrine, walked rather than argued.
 *
 * `governors.ts:8-14`: they are INVITATIONS, and an invitation she cannot accept
 * is a lockout with a friendly voice. Whatever Fred asks for must be the thing
 * that clears him, and ONE of it must be enough — a six-year-old who does two
 * sums and finds the same sentence waiting has learnt that the game does not
 * mean what it says.
 */
describe('the tap is diverted, never stranded — PB-039, re-walked for JT-012', () => {
  /*
   * THE WAY OUT IS NOW UP TO TWO OF THE ASKED-FOR THING, not always one, and
   * that is a real consequence of JT-012's numbers rather than a slackened test.
   *
   * The crowded wall is 1.5 fields per pet, so a field is worth two thirds of a
   * friend and half the time it takes two of them to house one more. And the
   * empty wall is 3 fields per pet, so an island that reaches four bare fields
   * during the grace period — the first thing Fred ever mentions — is four steps
   * out, and needs two friends rather than one. PB-039's floor was two thirds of
   * a field per pet, where one always sufficed.
   *
   * Two is still short, still the thing Fred just asked for, and (since PB-042)
   * she may ignore him entirely and pay the surcharge instead. What is asserted
   * is that the way out exists, is short, and never drops her into the OTHER
   * governor — which would satisfy the letter of the doctrine and none of it.
   */
  it('lifts the nursery queue within two fields, and hands her nothing else', () => {
    for (let tiles = 0; tiles <= 20; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 1; pets <= 40; pets++) {
        f = withPets(f, 1)
        if (activeGovernor(f) !== 'nursery-queue') continue
        expect(eggsPaused(f)).toBe(true)
        const where = `${tiles + 1} fields, ${pets} pets`
        const out = [1, 2].map(n => activeGovernor(grow(f, n)))
        const free = out.indexOf('none')
        expect(free, where).toBeGreaterThanOrEqual(0)
        // ...and the road out never runs through the other governor. Only what
        // she does AFTER she is free is her own business: laying a third and a
        // fourth field would eventually empty the island, and Fred may say so.
        expect(out.slice(0, free), where).not.toContain('space-surplus')
        break
      }
    }
  })

  it('lifts the space surplus within two friends, and hands her nothing else', () => {
    for (let pets = 0; pets <= 12; pets++) {
      let f = withPets(createFlow(), pets)
      for (let tiles = 1; tiles <= 60; tiles++) {
        f = grow(f, 1)
        if (activeGovernor(f) !== 'space-surplus') continue
        expect(landPaused(f)).toBe(true)
        const where = `${tiles + 1} fields, ${pets} pets`
        const out = [1, 2].map(n => activeGovernor(withPets(f, n)))
        const free = out.indexOf('none')
        expect(free, where).toBeGreaterThanOrEqual(0)
        // The mirror, and the same caveat: hatching a SECOND friend after she is
        // already free may crowd the island, and Fred is entitled to mention it.
        expect(out.slice(0, free), where).not.toContain('nursery-queue')
        break
      }
    }
  })
})

/**
 * The other half of JT-012: past the wall, the reward gets dearer.
 *
 * Joe: *"it should start with invitation first, then let the user run with
 * whatever they want to do up to a point otherwise we risk breaking the balance
 * of the island. we then make the reward really really tough to reach if it
 * pushes imbalance further if its too far out of balance. with an
 * announcement."*
 *
 * So: an invitation first (the governors above, and PB-042 made them ignorable),
 * then a price that climbs the further out she runs, then a ceiling on the price
 * — "up to a point" at both ends. Nothing is ever barred.
 */
describe('the surcharge past the walls — JT-012', () => {
  it('is exactly 1 inside the corridor, so a balanced island is unchanged', () => {
    expect(scarcityMultiplier(0)).toBe(1)
    for (let tiles = 0; tiles <= 24; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 0; pets <= 18; pets++) {
        if (pets > 0) f = withPets(f, 1)
        if (activeGovernor(f) !== 'none') continue
        const where = `${tiles + 1} fields, ${pets} pets`
        expect(sumsForTile(f), where).toBe(tileCost(f.tilesEarned + 1))
        expect(pagesForEgg(f), where).toBe(eggCost(f.pets.length + 1))
      }
    }
  })

  it('starts where Fred starts — no rise without an announcement', () => {
    /*
     * THE COHERENCE REQUIREMENT, and the reason the governors and the prices
     * call the same two functions. A price that moved while Fred said nothing
     * would be a silent tax on a six-year-old. Walked over the whole grid,
     * INCLUDING the grace period, where a one-hex island is already a step past
     * the empty wall and must still cost the list price.
     */
    for (let tiles = 0; tiles <= 24; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 0; pets <= 18; pets++) {
        if (pets > 0) f = withPets(f, 1)
        const where = `${tiles + 1} fields, ${pets} pets`
        const dearerTile = sumsForTile(f) > tileCost(f.tilesEarned + 1)
        const dearerEgg = pagesForEgg(f) > eggCost(f.pets.length + 1)
        expect(tileSteps(f) > 0, where).toBe(activeGovernor(f) === 'space-surplus')
        expect(eggSteps(f) > 0, where).toBe(activeGovernor(f) === 'nursery-queue')
        // ...and the side that pays is the side that is out of balance.
        if (activeGovernor(f) === 'none') {
          expect(dearerTile || dearerEgg, where).toBe(false)
        } else if (activeGovernor(f) === 'space-surplus') {
          expect(dearerTile, where).toBe(true)          // too much bare land
          expect(dearerEgg, where).toBe(false)
        } else {
          expect(dearerEgg, where).toBe(true)           // too many friends
          expect(dearerTile, where).toBe(false)
        }
      }
    }
  })

  it('reaches the price a child actually sees, at both walls', () => {
    /*
     * The wiring, pinned end to end rather than asserted as a property: the flow
     * she is in, the steps it is out by, and the number of sums or pages the
     * overlay will count out. Prices are in units; one item pays two.
     */
    const bare = withPets(grow(createFlow(), 8), 1)      // 9 fields, one friend
    expect(tileSteps(bare)).toBe(6)                      // 9 − 3·1
    expect(tileCost(bare.tilesEarned + 1)).toBe(24)      // the list price
    expect(sumsForTile(bare)).toBe(60)                   // ×2.5, and it is charged
    expect(pagesForEgg(bare)).toBe(eggCost(bare.pets.length + 1))

    const crowded = withPets(grow(createFlow(), 2), 4)   // 3 fields, four friends
    expect(eggSteps(crowded)).toBe(2)                    // 4 − ⌊3/1.5⌋
    expect(eggCost(crowded.pets.length + 1)).toBe(16)
    expect(pagesForEgg(crowded)).toBe(24)                // ×1.5, and it is charged
    expect(sumsForTile(crowded)).toBe(tileCost(crowded.tilesEarned + 1))
  })

  it('is a quarter dearer per step and never more than treble', () => {
    expect(scarcityMultiplier(1)).toBe(1.25)
    expect(scarcityMultiplier(3)).toBe(1.75)
    expect(scarcityMultiplier(8)).toBe(3)
    expect(scarcityMultiplier(9)).toBe(3)
    expect(scarcityMultiplier(400)).toBe(3)
    expect(balance.governor.escalation.slope).toBe(0.25)
    expect(balance.governor.escalation.capMultiple).toBe(3)
  })

  it("hits Joe's numbers near the top of the tile curve", () => {
    /*
     * The nineteenth tile, where the exact curve is ~30.5 units — near enough the
     * cap to be the honest worst case. Prices are in UNITS; one sum pays two.
     */
    const n = 19
    expect(tileCost(n)).toBe(30)
    expect(tileCostPast(n, 1)).toBe(38)
    expect(tileCostPast(n, 3)).toBe(54)
    expect(tileCostPast(n, 8)).toBe(tileCostPast(n, 40))   // capped
  })

  it('never asks for more than treble the cap, at either wall', () => {
    let dearestTile = 0
    let dearestEgg = 0
    for (let n = 1; n <= 400; n++) {
      for (let steps = 0; steps <= 40; steps++) {
        dearestTile = Math.max(dearestTile, tileCostPast(n, steps))
        dearestEgg = Math.max(dearestEgg, eggCostPast(n, steps))
      }
    }
    expect(dearestTile).toBe(96)    // 3 × the tile cap of 32
    expect(dearestEgg).toBe(84)     // 3 × the egg cap of 28
  })

  it('climbs monotonically, and always in whole items', () => {
    const pay = itemPay()
    for (let n = 1; n <= 60; n++) {
      let previous = -1
      for (let steps = 0; steps <= 20; steps++) {
        const tile = tileCostPast(n, steps)
        expect(tile, `tile ${n} at ${steps}`).toBeGreaterThanOrEqual(previous)
        expect(tile % pay, `tile ${n} at ${steps}`).toBe(0)
        expect(eggCostPast(n, steps) % pay).toBe(0)
        previous = tile
      }
    }
  })

  it('counts the first thing past the wall as one step, at both walls', () => {
    for (let pets = 1; pets <= 20; pets++) {
      // The EMPTY wall: 3 fields per pet, so 3·pets is the last field inside.
      expect(emptySteps(3 * pets, pets), `${pets} pets`).toBe(0)
      expect(emptySteps(3 * pets + 1, pets), `${pets} pets`).toBe(1)
      expect(emptySteps(3 * pets + 4, pets), `${pets} pets`).toBe(4)
      // The CROWDED wall: 1.5 fields per pet, read in whole animals.
      const fields = Math.ceil(1.5 * pets)
      expect(crowdedSteps(fields, pets), `${pets} pets`).toBe(0)
      expect(crowdedSteps(fields, pets + 1), `${pets} pets`).toBe(1)
    }
  })
})

/**
 * Brief §19, at a price that moves: nothing she owns can be lost.
 *
 * A rise must never strand progress she has already banked toward a purchase,
 * and must never un-earn a tile or a friend. The two walls move in OPPOSITE
 * directions, so this needed checking honestly rather than asserting.
 *
 * The answer is that it cannot happen, and the reason is structural. A tile's
 * price rises with bare fields, and fields only rise by committing a plot —
 * which zeroes `sumProgress` and hands her the tile. An egg's price rises with
 * friends, and friends only arrive by hatching — which zeroes `readProgress` and
 * hands her the friend. So while she is part-paid toward either thing, the only
 * moves open to her are the ones the governor is asking for, and every one of
 * them makes the thing she is part-way through CHEAPER, never dearer.
 */
describe('a price that rises never strands what she has banked — §19', () => {
  it('never raises the tile price when a friend comes home', () => {
    // The direction that matters mid-round, over the whole grid.
    for (let fields = 0; fields <= 40; fields++) {
      for (let pets = 0; pets <= 20; pets++) {
        const before = tileCostPast(9, emptySteps(fields, pets))
        const after = tileCostPast(9, emptySteps(fields, pets + 1))
        expect(after, `${fields} fields, ${pets} pets`).toBeLessThanOrEqual(before)
      }
    }
  })

  it('never raises the egg price when a field is laid', () => {
    for (let fields = 0; fields <= 40; fields++) {
      for (let pets = 0; pets <= 20; pets++) {
        const before = eggCostPast(9, crowdedSteps(fields, pets))
        const after = eggCostPast(9, crowdedSteps(fields + 1, pets))
        expect(after, `${fields} fields, ${pets} pets`).toBeLessThanOrEqual(before)
      }
    }
  })

  it('keeps every sum banked on a standing plot when the island changes', () => {
    // Walked through the real machine: nine bare fields and one friend is five
    // steps past the empty wall, so this tile carries a real surcharge.
    let f = withPets(grow(createFlow(), 8), 1)
    expect(activeGovernor(f)).toBe('space-surplus')

    let g: Flow = { ...f, phase: 'placing', chosen: null, plot: null, sumProgress: 0 }
    g = chooseTile(g, 'grass')
    g = placeTile(g, sockets(g.island)[0]!)
    expect(g.plot, 'the plot stands unpaid').not.toBeNull()

    g = challengePassed(tapSum({ ...g, phase: 'free' }))
    const banked = g.sumProgress
    expect(banked).toBeGreaterThan(0)
    expect(g.plot, 'still not paid off').not.toBeNull()
    const priced = sumsForTile(g)

    // She does the thing Fred asked for instead: a friend comes home.
    const after = withPets(g, 1)
    expect(after.sumProgress, 'not one sum lost').toBe(banked)
    expect(after.plot, 'the site she chose still stands').toEqual(g.plot)
    expect(sumsForTile(after), 'and the price did not move under her').toBeLessThanOrEqual(priced)
    expect(after.tilesEarned).toBe(g.tilesEarned)
    expect(after.pets.length).toBe(g.pets.length + 1)
  })

  it('keeps every page banked on an egg when the island changes', () => {
    // The mirror: three fields and four friends is past the crowded wall.
    let f = withPets(grow(createFlow(), 2), 4)
    expect(activeGovernor(f)).toBe('nursery-queue')

    f = challengePassed(tapEgg({ ...f, phase: 'free' }),
      { name: 'Pip', species: 'animal-fox' })
    const banked = f.readProgress
    expect(banked).toBeGreaterThan(0)          // part-read, not yet hatched
    const priced = pagesForEgg(f)

    // She does the thing Fred asked for instead: a field is laid.
    const after = grow({ ...f, sumProgress: 0 }, 1)
    expect(after.readProgress, 'not one page lost').toBe(banked)
    expect(pagesForEgg(after), 'and the egg did not get dearer').toBeLessThanOrEqual(priced)
    expect(after.pets.length).toBe(f.pets.length)
  })

  it('un-earns nothing when the price moves: tiles and friends only ever climb', () => {
    /*
     * The other half of §19. Walked across a mixed session that crosses BOTH
     * walls — land, land, friend, land, friend — with the counts checked at every
     * step. A surcharge is a price on the NEXT thing; it can never reach back.
     */
    let f = createFlow()
    let tiles = f.tilesEarned
    let pets = f.pets.length
    for (const move of ['land', 'land', 'land', 'friend', 'land', 'land', 'friend', 'land']) {
      f = move === 'land' ? grow(f, 1) : withPets(f, 1)
      expect(f.tilesEarned).toBeGreaterThanOrEqual(tiles)
      expect(f.pets.length).toBeGreaterThanOrEqual(pets)
      expect(f.bankedTiles).toBe(0)
      tiles = f.tilesEarned
      pets = f.pets.length
    }
    expect(tiles).toBeGreaterThan(0)
    expect(pets).toBe(2)
  })
})
