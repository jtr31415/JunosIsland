import { describe, it, expect } from 'vitest'
import {
  activeGovernor, inGracePeriod, landPaused, eggsPaused, GOVERNOR_LINE,
  fieldsWanted, petsHoused, habitableFields, tileSteps, eggSteps,
  governorLine, restoreCount,
} from '../../src/island/governors'
import {
  createFlow, challengePassed, tapEgg, tapSum, chooseTile, placeTile,
  pagesForEgg, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import type { Nudge } from '../../src/island/governors'
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
 *
 * BOTH NOW REFUSE PET COUNTS INSIDE GRACE, and the guard is JT-016's doing
 * rather than fussiness. They climb from a ONE-HEX island upward, and grace now
 * covers everything up to five animals and ten tiles — so at five animals or
 * fewer every island they meet on the way up is a sandbox in which
 * `activeGovernor` answers 'none' by fiat, and the first island past it already
 * has eleven fields in it. `floor(2)` said 3 before the ruling and says 1 after
 * it, having measured the sandbox and not the corridor; `ceiling(2)` says 10,
 * which is where grace ends rather than where the empty wall stands. Six animals
 * is the first count at which no island is ever in grace, so it is the first
 * count at which walking up from one hex measures a wall at all.
 * ------------------------------------------------------------------------- */

/** Neither helper can see a wall through the sandbox — refuse rather than lie. */
function pastGrace(pets: number): void {
  if (pets <= balance.governor.grace.pets) {
    throw new Error(
      `ceiling/floor cannot measure a wall at ${pets} pets: grace (JT-016) hides ` +
      `every island below ${balance.governor.grace.tiles + 1} tiles, so call them ` +
      `with more than ${balance.governor.grace.pets} pets`)
  }
}

/** The largest field count that does not pause new land, at `pets` pets. */
function ceiling(pets: number): number {
  pastGrace(pets)
  for (let n = 0; n < 400; n++) {
    const f = withPets(grow(createFlow(), n), pets)
    if (activeGovernor(f) === 'space-surplus') return n
  }
  throw new Error('never paused')
}

/** The fewest fields that do NOT pause eggs, at `pets` pets — the mirror. */
function floor(pets: number): number {
  pastGrace(pets)
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
    /*
     * JT-016 widened the opening stretch to five animals and ten tiles, so a
     * "real island" is now eleven fields and six friends rather than six and
     * two. The boundary is checked in the same breath because `inGracePeriod`
     * reads `island.tiles.size` and `pets.length` — the WIRING, which is the
     * half `balance-governor.test.ts` cannot see when it calls `graceHolds` with
     * two loose numbers.
     */
    const f = withPets(grow(createFlow(), 10), 6)
    expect(inGracePeriod(f)).toBe(false)

    // Exactly on both of Joe's numbers is still the sandbox; either one growing
    // up ends it, which is the AND said in flows rather than in integers.
    expect(inGracePeriod(withPets(grow(createFlow(), 9), 5))).toBe(true)
    expect(inGracePeriod(withPets(grow(createFlow(), 10), 5))).toBe(false)
    expect(inGracePeriod(withPets(grow(createFlow(), 9), 6))).toBe(false)
  })

  it('suppresses BOTH governors while it lasts, not just the one she is near', () => {
    /*
     * §5, and it is asserted over the whole opening rather than at one point,
     * because the two thresholds are DATA.
     *
     * THIS USED TO BE A GUARD OVER NOTHING, and JT-016 gave it teeth. With grace
     * at two pets and four tiles no island small enough to be inside it could
     * reach either wall, so the suppression never actually suppressed anything
     * and the test was a floor under `balance.json` rather than under any state
     * a child could stand in. At five animals and ten tiles she can be a long
     * way past the empty wall and still hear nothing — seven bare fields for two
     * friends is four steps out — so the `witnesses` count below is not
     * decoration: it fails if grace is ever narrowed back to where the
     * suppression is vacuous, which is the only way this test could pass for the
     * wrong reason.
     */
    let witnesses = 0
    for (let tiles = 0; tiles <= 12; tiles++) {
      for (let pets = 0; pets <= 7; pets++) {
        const f = withPets(grow(createFlow(), tiles), pets)
        if (!inGracePeriod(f)) continue
        expect(activeGovernor(f), `${tiles + 1} fields, ${pets} pets`).toBe('none')
        const fields = habitableFields(f)
        if (emptySteps(fields, pets) > 0 || crowdedSteps(fields, pets) > 0) witnesses++
      }
    }
    expect(witnesses, 'grace never actually held a wall back').toBeGreaterThan(0)
  })

  it('puts the crowded wall out of reach below six animals — JT-016', () => {
    /*
     * A real consequence of the ruling, and one worth stating out loud because
     * it is not obvious from either number on its own. Grace holds while pets
     * <= 5 AND tiles <= 10, so at five animals or fewer she must own at least
     * eleven fields to hear from Fred at all — and eleven fields house seven
     * animals before the crowded wall is anywhere near. The nursery queue is
     * therefore UNREACHABLE until the sixth friend comes home: for the whole of
     * the opening the only governor that can ever speak is the empty one.
     *
     * Walked over grass islands, which is what `grow` lays. Grace counts every
     * tile and the crowded wall counts only the habitable ones, so an island of
     * mountains could in principle part the two numbers; nothing in the game
     * hands a child eleven rock tiles and five animals, and if that ever changes
     * it is a pacing decision rather than a bug in this test.
     */
    for (let tiles = 0; tiles <= 40; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 0; pets <= balance.governor.grace.pets; pets++) {
        if (pets > 0) f = withPets(f, 1)
        expect(activeGovernor(f), `${tiles + 1} fields, ${pets} pets`)
          .not.toBe('nursery-queue')
      }
    }
    // ...and the sixth friend is where it becomes reachable at all: one hex,
    // six animals, nowhere for any of them to live.
    expect(activeGovernor(withPets(createFlow(), 6))).toBe('nursery-queue')
  })
})

describe('the space-surplus governor', () => {
  it('pauses new land when there is far more room than friends', () => {
    /*
     * Eleven fields for two friends: past 3.0 tiles per pet, the EMPTY WARNING
     * wall, and past ten tiles, so JT-016's grace has ended on the tile count
     * alone. Seven fields did this job before the ruling and now sits inside the
     * sandbox, where Fred says nothing at all.
     */
    const f = withPets(grow(createFlow(), 10), 2)
    expect(habitableFields(f)).toBe(11)
    expect(habitableFields(f)).toBeGreaterThan(3 * f.pets.length)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(true)
  })

  it('lets a plot already under construction finish anyway', () => {
    // §5: a plot mid-build always finishes; work is never taken back. The
    // governor pauses STARTING land, never finishing it.
    let f = withPets(grow(createFlow(), 10), 2)
    f = { ...f, plot: { at: { q: 4, r: 0 }, type: 'grass' } }
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(landPaused(f)).toBe(false)
  })

  it('lifts once enough friends have come home', () => {
    /*
     * The same eleven fields with four friends on them: inside both walls, so
     * Fred has nothing to say and neither price is dearer than the list. Four is
     * not a guess — it is two more than the island above, which is exactly the
     * number Fred names there (`restoreCount`, JT-019).
     */
    const f = withPets(grow(createFlow(), 10), 4)
    expect(activeGovernor(f)).toBe('none')
    expect(landPaused(f)).toBe(false)
    expect(eggsPaused(f)).toBe(false)
  })

  it('never pauses reading — only new land', () => {
    const f = withPets(grow(createFlow(), 10), 2)
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

/**
 * Fred names the number — JT-019.
 *
 * Joe: *"we get fred to tell her how many she needs to restore balance."*
 *
 * The ARITHMETIC of the way back is `tilesShortOfCorridor` and
 * `petsShortOfCorridor`, and it is walked over every island size in
 * `tests/island/balance-governor.test.ts`; it is not repeated here. What this
 * block tests is the SENTENCE — the thing a six-year-old actually hears, which
 * is where a template can go wrong in ways an integer cannot. A line that says
 * "1 more friends" to a child learning to read is a worse failure than a count
 * that is one out, because she will believe the spelling.
 */
describe('Fred names the number — JT-019', () => {
  const NUDGES = Object.keys(GOVERNOR_LINE) as Nudge[]

  it('fills the count into both island lines', () => {
    expect(governorLine('nursery-queue', 3))
      .toBe('They need homes! 3 more tiles will do it.')
    expect(governorLine('space-surplus', 2))
      .toBe("Let's read with the egg — 2 more friends will fill it up!")
  })

  it('says "1 more friend", never "1 more friends"', () => {
    /*
     * The whole reason the templates spell both forms out instead of bolting an
     * `s` on: one is the count a child meets most often, because Fred speaks the
     * moment she steps over the wall and one step is usually all she is out by.
     */
    expect(governorLine('space-surplus', 1))
      .toBe("Let's read with the egg — 1 more friend will fill it up!")
    expect(governorLine('nursery-queue', 1))
      .toBe('They need homes! 1 more tile will do it.')
    // ...and every other count takes the plural, including nought.
    for (const n of [0, 2, 3, 11, 40]) {
      expect(governorLine('space-surplus', n), `${n} friends`).toMatch(/more friends/)
      expect(governorLine('nursery-queue', n), `${n} tiles`).toMatch(/more tiles/)
    }
  })

  it('never shows a child a brace, at any count or any nudge', () => {
    // The failure mode this guards is the one that ships: a template edited
    // into a form `governorLine` does not recognise, delivered verbatim.
    for (const which of NUDGES) {
      for (let n = 0; n <= 12; n++) {
        expect(governorLine(which, n), `${which} at ${n}`).not.toMatch(/[{}|]/)
      }
    }
  })

  it('leaves the wriggle-break line exactly as written, whatever count it is handed', () => {
    /*
     * It reads the CHILD rather than the island (`createBreakWatch`), so there
     * is no number to give her and nothing in the sentence to fill. The caller
     * hands it whatever `restoreCount` said — which is 0 — and it must come back
     * untouched rather than growing a stray digit.
     */
    for (const n of [0, 1, 2, 7, 99]) {
      expect(governorLine('wriggle-break', n), `count ${n}`)
        .toBe(GOVERNOR_LINE['wriggle-break'])
    }
  })

  it('asks for nothing at all on behalf of wriggle-break', () => {
    // The mirror of the line above, at the other end of the same call: no island
    // state can make a break into an errand with a number on it.
    for (const f of [createFlow(),
      withPets(grow(createFlow(), 10), 2),      // 11 fields, two friends: too bare
      withPets(grow(createFlow(), 8), 8)]) {    // 9 fields, eight friends: too full
      expect(restoreCount(f, 'wriggle-break')).toBe(0)
    }
  })

  it('speaks a number that is the real way out, on a real island', () => {
    /*
     * End to end, which is the only place the count and the sentence meet: the
     * island Fred is looking at, the number he says, and the island she reaches
     * by doing exactly what he asked. Both walls, and both grammatical numbers,
     * so the singular is proved on a state a child can actually stand in rather
     * than only on a literal.
     */
    const bare = withPets(grow(createFlow(), 10), 2)       // 11 fields, two friends
    expect(activeGovernor(bare)).toBe('space-surplus')
    expect(governorLine('space-surplus', restoreCount(bare, 'space-surplus')))
      .toBe("Let's read with the egg — 2 more friends will fill it up!")
    expect(activeGovernor(withPets(bare, 2))).toBe('none')

    const nearlyBare = withPets(grow(createFlow(), 10), 3) // 11 fields, three friends
    expect(activeGovernor(nearlyBare)).toBe('space-surplus')
    expect(governorLine('space-surplus', restoreCount(nearlyBare, 'space-surplus')))
      .toBe("Let's read with the egg — 1 more friend will fill it up!")
    expect(activeGovernor(withPets(nearlyBare, 1))).toBe('none')

    const full = withPets(grow(createFlow(), 9), 8)        // 10 fields, eight friends
    expect(activeGovernor(full)).toBe('nursery-queue')
    expect(governorLine('nursery-queue', restoreCount(full, 'nursery-queue')))
      .toBe('They need homes! 2 more tiles will do it.')
    expect(activeGovernor(grow(full, 2))).toBe('none')

    const nearlyFull = withPets(grow(createFlow(), 7), 6)  // 8 fields, six friends
    expect(activeGovernor(nearlyFull)).toBe('nursery-queue')
    expect(governorLine('nursery-queue', restoreCount(nearlyFull, 'nursery-queue')))
      .toBe('They need homes! 1 more tile will do it.')
    expect(activeGovernor(grow(nearlyFull, 1))).toBe('none')
  })

  it('stays want-framed once the number is in it', () => {
    // The guard above this block reads the TABLE; a child is only ever shown
    // what comes out of `governorLine`, so the same promise is re-checked on
    // the filled sentence at every count.
    for (const which of NUDGES) {
      for (let n = 0; n <= 6; n++) {
        const line = governorLine(which, n)
        expect(line, `${which} at ${n}`).not.toMatch(/can'?t|cannot|not allowed|no more|stop/i)
        expect(line.length).toBeGreaterThan(10)
      }
    }
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
     *
     * Six and twelve rather than two and eight, because `ceiling` cannot see a
     * wall through JT-016's sandbox at five animals or fewer — see `pastGrace`.
     */
    const low = ceiling(6)
    const high = ceiling(12)
    expect(high - low).toBeGreaterThan(12 - 6)
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

  it("is the corridor's number exactly: nine fields hold six friends, and stall at seven", () => {
    /*
     * JT-012 read literally at the crowded wall — 1.5 fields per pet, so six
     * friends want nine fields. Nine tiles is `grow(_, 8)`; the island is born
     * with one hex.
     *
     * SIX FRIENDS AND NOT TWO, because of JT-016. The old worked example was
     * three fields holding two friends and stalling at three, and every island
     * in that sentence is now inside grace, where Fred is silent whatever the
     * ratio says. Six is the first animal count at which the crowded wall exists
     * at all — see 'puts the crowded wall out of reach below six animals'.
     */
    const six = withPets(grow(createFlow(), 8), 6)
    expect(habitableFields(six)).toBe(9)
    expect(activeGovernor(six)).toBe('none')
    expect(eggsPaused(six)).toBe(false)

    const seven = withPets(grow(createFlow(), 8), 7)
    expect(activeGovernor(seven)).toBe('nursery-queue')
    expect(eggsPaused(seven)).toBe(true)
    expect(landPaused(seven)).toBe(false)      // it asks for maths, it bars nothing
  })

  it('rises in step with the pets, at one and a half fields each', () => {
    /*
     * PB-039 put the floor at two thirds of a field per pet, so it rose SLOWER
     * than the pets; JT-012 moves it to the crowded wall, 1.5 fields per pet, so
     * it rises with them. The property that matters either way is that it is a
     * RATIO — an absolute shortfall would give a constant difference here.
     *
     * Twelve and six rather than eight and two: `floor` measures the sandbox
     * rather than the wall below six animals (JT-016, see `pastGrace`). The span
     * is the same nine fields, so what this test says is unchanged.
     */
    expect(floor(12) - floor(6)).toBe(Math.ceil(1.5 * 12) - Math.ceil(1.5 * 6))
    expect(floor(12) - floor(6)).toBe(9)
  })

  it('stays at 1.5 fields per pet however large the island grows', () => {
    // The fault PB-039 found was a floor that DRIFTED as the island grew. It no
    // longer drifts in either direction: it is one wall of a fixed corridor.
    // The list starts at six because grace hides the wall below it (JT-016).
    for (const pets of [6, 8, 10, 20]) {
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
    // with the island rather than staying a fixed handful of hexes. Six upward,
    // for the same reason as the block above: below it there is no wall to see.
    for (const pets of [6, 8, 10, 20]) {
      expect(ceiling(pets) - floor(pets), `${pets} pets`).toBeGreaterThan(2)
    }
    expect(ceiling(20) - floor(20)).toBeGreaterThan(ceiling(6) - floor(6))
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
describe('the tap is diverted, never stranded — PB-039, re-walked for JT-019', () => {
  /*
   * THE WAY OUT IS NOW A NUMBER FRED SAYS OUT LOUD, and that supersedes the
   * "within two" doctrine this block used to assert.
   *
   * The old promise was a WINDOW: whatever Fred asked for, one or two of it
   * would clear him. JT-016 broke it honestly — one field for six friends is
   * five fields short of the crowded wall, not two — and Joe's answer was not to
   * widen the window but to remove the guesswork: *"we get fred to tell her how
   * many she needs to restore balance."* So the promise the game now makes is
   * stronger and simpler than "short": it is EXACT. `restoreCount` is the number
   * in Fred's sentence, and it is asserted from both sides, because a number
   * that overshoots is a game asking for work it does not need and a number that
   * falls short is a game that does not mean what it says.
   *
   * She may still ignore him entirely and pay the surcharge instead (PB-042).
   * What is asserted here is that the way out exists, is exactly as long as she
   * was told, and never drops her into the OTHER governor on the way — which
   * would satisfy the letter of the doctrine and none of it.
   */
  it('lifts the nursery queue in exactly the fields Fred names, and hands her nothing else', () => {
    for (let tiles = 0; tiles <= 20; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 1; pets <= 40; pets++) {
        f = withPets(f, 1)
        if (activeGovernor(f) !== 'nursery-queue') continue
        expect(eggsPaused(f)).toBe(true)
        const where = `${tiles + 1} fields, ${pets} pets`

        const need = restoreCount(f, 'nursery-queue')
        expect(need, where).toBeGreaterThan(0)
        // Exactly enough clears him, and eggs run again.
        const cleared = grow(f, need)
        expect(activeGovernor(cleared), where).toBe('none')
        expect(eggsPaused(cleared), where).toBe(false)
        // One fewer does NOT, so the number is not a rounded encouragement.
        expect(activeGovernor(grow(f, need - 1)), where).toBe('nursery-queue')
        // ...and the road out never runs through the other governor. Only what
        // she does AFTER she is free is her own business: laying a further field
        // would eventually empty the island, and Fred may say so.
        for (let n = 1; n <= need; n++) {
          expect(activeGovernor(grow(f, n)), `${where}, +${n} fields`)
            .not.toBe('space-surplus')
        }
        break
      }
    }
  })

  it('lifts the space surplus in exactly the friends Fred names, and hands her nothing else', () => {
    for (let pets = 0; pets <= 12; pets++) {
      let f = withPets(createFlow(), pets)
      for (let tiles = 1; tiles <= 60; tiles++) {
        f = grow(f, 1)
        if (activeGovernor(f) !== 'space-surplus') continue
        expect(landPaused(f)).toBe(true)
        const where = `${tiles + 1} fields, ${pets} pets`

        const need = restoreCount(f, 'space-surplus')
        expect(need, where).toBeGreaterThan(0)
        const cleared = withPets(f, need)
        expect(activeGovernor(cleared), where).toBe('none')
        expect(landPaused(cleared), where).toBe(false)
        expect(activeGovernor(withPets(f, need - 1)), where).toBe('space-surplus')
        // The mirror, and the same caveat: hatching a friend BEYOND the number
        // she was given may crowd the island, and Fred is entitled to mention it.
        for (let n = 1; n <= need; n++) {
          expect(activeGovernor(withPets(f, n)), `${where}, +${n} friends`)
            .not.toBe('nursery-queue')
        }
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

  it('never rises without an announcement — and now Fred may speak for free', () => {
    /*
     * THE COHERENCE REQUIREMENT, AS JT-014 LEFT IT — an IMPLICATION, and no
     * longer a biconditional.
     *
     * It used to read `tileSteps(f) > 0` **iff** 'space-surplus', because the
     * warning and the bill fired at the same wall. Joe pulled them apart: the
     * corridor (1.5 / 3.0) is where Fred speaks and `price` (1.2 / 4.0) is where
     * the till opens, and the price walls sit strictly outside the warning ones.
     * So exactly one direction survives, and it is the direction that protects
     * her — a price cannot rise unless Fred has already asked. The converse is
     * now deliberately FALSE: there is a band in which she has been told and is
     * being charged nothing.
     *
     * WHICH IS WHY THE BAND IS COUNTED rather than merely permitted. An
     * implication on its own would still hold under the old one-wall code, so a
     * test that asserted only the implication would pass against the thing
     * JT-014 replaced and prove nothing about the ruling. The two `told*Free`
     * counters are the ruling itself: if the price walls are ever collapsed back
     * onto the warning walls, both fall to zero and this test goes red.
     *
     * Walked over the whole grid INCLUDING the grace period, where a one-hex
     * island is already a step past the empty wall and must still cost the list
     * price.
     */
    let toldTileFree = 0
    let toldEggFree = 0
    for (let tiles = 0; tiles <= 24; tiles++) {
      let f = grow(createFlow(), tiles)
      for (let pets = 0; pets <= 18; pets++) {
        if (pets > 0) f = withPets(f, 1)
        const where = `${tiles + 1} fields, ${pets} pets`
        const governor = activeGovernor(f)
        const dearerTile = sumsForTile(f) > tileCost(f.tilesEarned + 1)
        const dearerEgg = pagesForEgg(f) > eggCost(f.pets.length + 1)

        // The surviving half: a charge implies an announcement, never the other
        // way about — and that holds of the price a child is shown, not only of
        // the step count behind it.
        if (tileSteps(f) > 0) expect(governor, where).toBe('space-surplus')
        if (eggSteps(f) > 0) expect(governor, where).toBe('nursery-queue')
        if (dearerTile) expect(governor, where).toBe('space-surplus')
        if (dearerEgg) expect(governor, where).toBe('nursery-queue')

        // ...and the side that pays is the side that is out of balance. Under
        // 'space-surplus' the TILE may or may not have got dearer — inside the
        // band it has not — but the egg never pays for bare land, and that half
        // is absolute.
        if (governor === 'none') {
          expect(dearerTile || dearerEgg, where).toBe(false)
        } else if (governor === 'space-surplus') {
          expect(dearerEgg, where).toBe(false)
          if (!dearerTile) toldTileFree++
        } else {
          expect(dearerTile, where).toBe(false)
          if (!dearerEgg) toldEggFree++
        }
      }
    }
    expect(toldTileFree, 'no island where Fred asks her to read and land is list price')
      .toBeGreaterThan(0)
    expect(toldEggFree, 'no island where Fred asks for maths and the egg is list price')
      .toBeGreaterThan(0)
  })

  it('reaches the price a child actually sees, at both walls', () => {
    /*
     * The wiring, pinned end to end rather than asserted as a property: the flow
     * she is in, the steps it is out by, and the number of sums or pages the
     * overlay will count out. Prices are in units; one item pays two.
     *
     * BOTH FIXTURES MOVED, and by both rulings at once. The old pair — nine
     * fields for one friend, three fields for four — are now inside JT-016's
     * grace, where the till is shut; and the step counts they quoted were read
     * off the WARNING walls, which JT-014 is no longer what the price reads.
     * Each number below therefore names its wall explicitly, because the whole
     * point of the ruling is that the two are different.
     */
    const bare = withPets(grow(createFlow(), 10), 1)     // 11 fields, one friend
    expect(emptySteps(habitableFields(bare), 1)).toBe(8) // 11 − 3·1: Fred spoke
    expect(tileSteps(bare)).toBe(7)                      // 11 − 4·1: the till too
    expect(tileCost(bare.tilesEarned + 1)).toBe(26)      // the list price
    expect(sumsForTile(bare)).toBe(72)                   // ×2.75, and it is charged
    expect(pagesForEgg(bare)).toBe(eggCost(bare.pets.length + 1))

    const crowded = withPets(grow(createFlow(), 8), 8)   // 9 fields, eight friends
    expect(crowdedSteps(habitableFields(crowded), 8)).toBe(2)   // 8 − ⌊9/1.5⌋
    expect(eggSteps(crowded)).toBe(1)                    // 8 − ⌊9/1.2⌋
    expect(eggCost(crowded.pets.length + 1)).toBe(22)
    expect(pagesForEgg(crowded)).toBe(28)                // ×1.25, and it is charged
    expect(sumsForTile(crowded)).toBe(tileCost(crowded.tilesEarned + 1))

    /*
     * ...and the band between the two walls, which is what PB-042 bought her:
     * ten fields for eight friends is past the crowded WARNING wall and inside
     * the crowded PRICE wall, so Fred asks for maths and the egg costs exactly
     * what it has always cost.
     */
    const warned = withPets(grow(createFlow(), 9), 8)    // 10 fields, eight friends
    expect(activeGovernor(warned)).toBe('nursery-queue')
    expect(eggSteps(warned)).toBe(0)                     // 8 − ⌊10/1.2⌋
    expect(pagesForEgg(warned)).toBe(eggCost(warned.pets.length + 1))
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
    // Walked through the real machine: eleven bare fields and one friend is
    // eight steps past the empty warning wall and seven past the pricing one, so
    // this tile carries a real surcharge. Nine fields did before JT-016 and is
    // now a sandbox, where the price never moves at all.
    let f = withPets(grow(createFlow(), 10), 1)
    expect(activeGovernor(f)).toBe('space-surplus')
    expect(tileSteps(f)).toBeGreaterThan(0)

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
    // The mirror: nine fields and eight friends is past the crowded warning wall
    // and one step past the pricing one, so this egg carries a real surcharge
    // too. Three fields and four friends did before JT-016 widened the sandbox.
    let f = withPets(grow(createFlow(), 8), 8)
    expect(activeGovernor(f)).toBe('nursery-queue')
    expect(eggSteps(f)).toBeGreaterThan(0)

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
