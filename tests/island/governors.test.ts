import { describe, it, expect } from 'vitest'
import {
  activeGovernor, inGracePeriod, spaceSurplus, landPaused, eggsPaused, GOVERNOR_LINE,
  fieldsWanted, petsHoused,
} from '../../src/island/governors'
import { createFlow, challengePassed, tapEgg, chooseTile, placeTile } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { sockets } from '../../src/island/world/grid'
import { balance } from '../../src/island/balance'

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
    const f = withPets(grow(createFlow(), 6), 2)
    expect(spaceSurplus(f)).toBeGreaterThanOrEqual(4)
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
    const f = withPets(grow(createFlow(), 6), 6)
    expect(activeGovernor(f)).toBe('none')
    expect(landPaused(f)).toBe(false)
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

  it('wants half again as many fields as pets', () => {
    expect(fieldsWanted(0)).toBe(0)
    expect(fieldsWanted(2)).toBe(3)
    expect(fieldsWanted(10)).toBe(15)
    expect(balance.governor.tilesPerPet).toBeGreaterThan(1)
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
describe('the floor is a RATIO too — PB-039', () => {
  it('houses three animals for every two tiles', () => {
    expect(petsHoused(0)).toBe(0)
    expect(petsHoused(2)).toBe(3)
    expect(petsHoused(10)).toBe(15)
    expect(balance.governor.petsPerTile).toBeGreaterThan(1)
  })

  it("is Joe's number exactly: two fields hold two friends, and stall at three", () => {
    // The card, read literally. Two tiles is `grow(_, 1)` — the island is born
    // with one hex.
    const two = withPets(grow(createFlow(), 1), 2)
    expect(activeGovernor(two)).toBe('none')
    expect(eggsPaused(two)).toBe(false)

    const three = withPets(grow(createFlow(), 1), 3)
    expect(activeGovernor(three)).toBe('nursery-queue')
    expect(eggsPaused(three)).toBe(true)
    expect(landPaused(three)).toBe(false)      // it asks for maths, it bars nothing
  })

  it('rises SLOWER than the pets, which a fixed shortfall could not do', () => {
    /*
     * The property the old floor could not have. `1.5·pets - 3` climbs by one and
     * a half fields per pet, so this difference was 9 across these six pets; a
     * ratio of two-thirds climbs by two thirds of a field, so it is now 4.
     */
    expect(floor(8) - floor(2)).toBeLessThan(8 - 2)
  })

  it('does not drift toward 1.5 tiles per pet as the island grows', () => {
    // The actual fault. The floor must stay a floor however many friends she has,
    // rather than creeping up to meet the ceiling's own target.
    expect(floor(20) / 20).toBeLessThanOrEqual(floor(4) / 4)
    expect(floor(20) / 20).toBeLessThan(0.8)
  })

  it('sits near two thirds of a field per pet at ten pets, not at 1.2', () => {
    // 1.2 is what the old absolute shortfall gave here, and it is what Joe was
    // being pushed to maths at. 0.667 is what he asked for; 7 fields is the first
    // whole number above it.
    const pets = 10
    expect(floor(pets)).toBe(7)
    expect(floor(pets) / pets).toBeLessThan(0.8)
    expect(floor(pets) / pets).toBeGreaterThan(0.6)
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
describe('the tap is diverted, never stranded — PB-039', () => {
  it('lifts the nursery queue the moment she earns one more field', () => {
    /*
     * Walked from the first pet count that trips the floor at each island size,
     * which is the only way in: eggs are paused past it, so she cannot be deeper
     * in than one hatch. The assertion is `none` rather than "not the queue",
     * because being handed the OTHER governor instead would satisfy the letter of
     * the doctrine and none of it.
     */
    for (let tiles = 0; tiles <= 20; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 1; pets <= 40; pets++) {
        f = withPets(f, 1)
        if (activeGovernor(f) !== 'nursery-queue') continue
        expect(eggsPaused(f)).toBe(true)
        expect(activeGovernor(grow(f, 1)), `${tiles + 1} fields, ${pets} pets`).toBe('none')
        break
      }
    }
  })

  it('lifts the space surplus the moment one more friend comes home', () => {
    // The mirror, and the same reasoning: the ceiling is only ever entered by
    // laying one field too many, so one friend is the whole of the way back out.
    for (let pets = 0; pets <= 12; pets++) {
      let f = withPets(createFlow(), pets)
      for (let tiles = 1; tiles <= 60; tiles++) {
        f = grow(f, 1)
        if (activeGovernor(f) !== 'space-surplus') continue
        expect(landPaused(f)).toBe(true)
        expect(activeGovernor(withPets(f, 1)), `${tiles + 1} fields, ${pets} pets`).toBe('none')
        break
      }
    }
  })
})
