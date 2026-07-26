import { describe, it, expect } from 'vitest'
import {
  createFlow, tapEgg, tapSum, askForLand, challengePassed, challengeFailed,
  chooseTile, placeTile, tileOffer,
} from '../../src/island/flow'
import { hatchProgress, landProgress, pagesForEgg, sumsForTile } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { count } from '../../src/island/world/grid'

/**
 * Read enough pages to actually hatch. The cost comes from the CURVE, so
 * these helpers ask the flow what it wants rather than assuming a constant —
 * a test that hardcoded 5 would quietly rot the moment balance.json changed.
 */
function readUntilHatch(f: Flow, name = 'Bimo', species = 'animal-fox'): Flow {
  const need = pagesForEgg(f)
  for (let i = 0; i < need; i++) f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name, species })
  return f
}

/**
 * Site a plot at `at`, then answer enough sums to finish it.
 *
 * Spec section 2 order throughout: ask for land, pick a type, pick a socket,
 * THEN do the maths that builds it. A helper that skipped straight to the
 * sums would be testing a flow the game no longer has.
 */
function buildTile(f: Flow, at = { q: 1, r: 0 }, type: 'grass' | 'water' = 'grass'): Flow {
  f = askForLand({ ...f, phase: 'free' })
  f = chooseTile(f, type)
  f = placeTile(f, at)
  // A one-sum tile is finished by siting alone, so there may be nothing left.
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

describe('flow — the earn loop', () => {
  it('starts in free play with one rock and no pets', () => {
    const f = createFlow()
    expect(f.phase).toBe('free')
    expect(count(f.island)).toBe(1)
    expect(f.pets).toHaveLength(0)
    expect(f.bankedTiles).toBe(0)
  })

  it('tapping the egg opens a reading challenge', () => {
    // Reading hatches eggs (brief section 4) — the world law, not a menu
    const f = tapEgg(createFlow())
    expect(f.phase).toBe('challenge')
    expect(f.challenge).toBe('read')
  })

  it('the FIRST egg costs a single page, so the loop teaches itself', () => {
    // Slice-1 spec §1 beat 2 and §4: base 1. The very first hatch must be
    // almost free, or the child never sees what reading is FOR.
    const f = challengePassed(tapEgg(createFlow()), { name: 'Bimo', species: 'animal-fox' })
    expect(f.pets).toHaveLength(1)
  })

  it('later eggs cost progressively more', () => {
    let f = readUntilHatch(createFlow())
    const second = pagesForEgg(f)
    expect(second).toBeGreaterThan(1)
    for (let i = 1; i < second; i++) {
      f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Two', species: 'animal-bee' })
      expect(f.pets).toHaveLength(1)      // not yet
    }
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Two', species: 'animal-bee' })
    expect(f.pets).toHaveLength(2)
    expect(f.readProgress).toBe(0)
  })

  it('reports progress toward the next hatch and the next tile', () => {
    let f = readUntilHatch(createFlow())          // past the free first egg
    const need = pagesForEgg(f)
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'B', species: 'animal-bee' })
    expect(hatchProgress(f)).toBeCloseTo(1 / need)
    expect(landProgress(createFlow())).toBe(0)
  })

  it('progress is never lost by a wrong answer', () => {
    let f = readUntilHatch(createFlow())
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'B', species: 'animal-bee' })
    const before = f.readProgress
    f = challengeFailed(tapEgg(f))
    expect(f.readProgress).toBe(before)
  })

  it('a hatched pet keeps its name and species forever', () => {
    let f = readUntilHatch(createFlow(), 'Sheptun', 'animal-crab')
    f = readUntilHatch(f, 'Corbell', 'animal-bee')
    expect(f.pets.map(p => p.name)).toEqual(['Sheptun', 'Corbell'])
    expect(f.pets.map(p => p.species)).toEqual(['animal-crab', 'animal-bee'])
  })

  it('asking for land opens the bank, not a sum', () => {
    /*
     * Spec section 2: "pick 1 of 3 tile types -> pick a socket -> ghost hex
     * appears -> each correct sum advances the build". With nothing under
     * construction there is no plot for a sum to advance, so the first tap
     * opens the offer instead. Doing the maths first is exactly the invisible
     * progress the growing plot exists to abolish.
     */
    const f = askForLand(createFlow())
    expect(f.phase).toBe('placing')
    expect(f.plot).toBeNull()
    expect(tileOffer(f)).toHaveLength(3)
  })

  it('asking again once a plot is under construction opens the sum', () => {
    let f = askForLand(createFlow())
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    // The intro tile costs one sum and is finished on siting, so build a
    // second plot, which the curve prices above one.
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    expect(f.plot).not.toBeNull()

    const g = askForLand({ ...f, phase: 'free' })
    expect(g.phase).toBe('challenge')
    expect(g.challenge).toBe('sum')
  })

  it('refuses a sum when there is no plot to advance', () => {
    const f = createFlow()
    expect(tapSum(f)).toBe(f)
  })

  it('the INTRO tile costs exactly one sum once sited', () => {
    /*
     * The curve prices the first tile at 1. Spec section 2's "Intro tile =
     * all ten in one go" is about the INCREMENTS — ten pieces of scenery
     * arriving in a single burst because there is only one sum to spread
     * them over — not about the tile being free.
     */
    let f = askForLand(createFlow())
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    expect(sumsForTile(f)).toBe(1)
    expect(f.plot).not.toBeNull()

    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.plot).toBeNull()
    expect(count(f.island)).toBe(2)
    expect(f.tilesEarned).toBe(1)
  })

  it('later tiles are built by sums, one plot at a time', () => {
    let f = buildTile(createFlow())                    // the free intro tile
    const need = sumsForTile(f)
    expect(need).toBeGreaterThan(1)

    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    expect(f.plot).toEqual({ at: { q: 0, r: 1 }, type: 'grass' })

    const before = count(f.island)
    for (let i = 1; i < need; i++) {
      f = challengePassed(tapSum({ ...f, phase: 'free' }))
      // Under construction, and NOT yet on the island.
      expect(f.plot).not.toBeNull()
      expect(count(f.island)).toBe(before)
    }
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.plot).toBeNull()
    expect(count(f.island)).toBe(before + 1)
    expect(f.sumProgress).toBe(0)
  })

  it('the bank offers three types to choose from', () => {
    const f = askForLand(createFlow())
    expect(tileOffer(f)).toHaveLength(3)
  })

  it('builds the type that was chosen', () => {
    const f = buildTile(createFlow(), { q: 1, r: 0 }, 'water')
    expect(f.island.tiles.get('1,0')).toBe('water')
  })

  it('cannot site a plot where there is no socket', () => {
    let f = askForLand(createFlow())
    f = chooseTile(f, 'grass')
    const before = count(f.island)
    const g = placeTile(f, { q: 9, r: 9 })   // far out at sea
    expect(count(g.island)).toBe(before)
    expect(g.plot).toBeNull()
    expect(g.chosen).toBe('grass')           // the choice is kept
  })

  it('cannot site a plot before a type is chosen', () => {
    const f = askForLand(createFlow())
    expect(placeTile(f, { q: 1, r: 0 })).toBe(f)
  })

  it('a wrong answer costs nothing — no tile, no pet, nothing lost', () => {
    // Brief section 18: wrong answers cost nothing but a wobble
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    const progressBefore = f.sumProgress
    const tilesBefore = count(f.island)

    f = challengeFailed(tapSum({ ...f, phase: 'free' }))
    // The plot stands exactly where it stood. Nothing un-grows (spec 2).
    expect(f.sumProgress).toBe(progressBefore)
    expect(f.plot).not.toBeNull()
    expect(count(f.island)).toBe(tilesBefore)
    expect(f.phase).toBe('free')

    let g = tapEgg(createFlow())
    g = challengeFailed(g)
    expect(g.pets).toHaveLength(0)
    expect(g.phase).toBe('free')
  })

  it('never consumes the egg on a failed reading challenge', () => {
    // The egg must still be there to try again — nothing expires
    let f = tapEgg(createFlow())
    f = challengeFailed(f)
    expect(f.eggPresent).toBe(true)
    f = tapEgg(f)
    expect(f.phase).toBe('challenge')
  })

  it('a fresh egg arrives after a hatch, so there is always something to read to', () => {
    let f = tapEgg(createFlow())
    f = challengePassed(f, { name: 'Bimo', species: 'animal-fox' })
    expect(f.eggPresent).toBe(true)
  })

  it('is immutable — every transition returns a new state', () => {
    const a = createFlow()
    const b = tapEgg(a)
    expect(a.phase).toBe('free')
    expect(b.phase).toBe('challenge')
    expect(a).not.toBe(b)
  })

  it('ignores a siting when the bank was never opened', () => {
    const f = createFlow()
    const g = placeTile(f, { q: 1, r: 0 })
    expect(count(g.island)).toBe(count(f.island))
    expect(g.plot).toBeNull()
  })

  it('offers only tile types the child can actually use', () => {
    const f = askForLand(createFlow())
    for (const t of tileOffer(f)) expect(['grass', 'water']).toContain(t)
  })

  it('offers nothing outside the bank', () => {
    expect(tileOffer(createFlow())).toHaveLength(0)
  })
})

describe('flow — work in progress is never lost', () => {
  it('keeps a half-built plot across a wrong answer and a walk away', () => {
    /*
     * The plot is the only record of sums already done, so anything that
     * clears it silently destroys work the child has finished (brief 18).
     */
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    f = challengePassed(tapSum({ ...f, phase: 'free' }))

    const plot = f.plot
    const progress = f.sumProgress
    f = challengeFailed(tapSum({ ...f, phase: 'free' }))
    f = tapEgg({ ...f, phase: 'free' })
    f = challengeFailed(f)

    expect(f.plot).toEqual(plot)
    expect(f.sumProgress).toBe(progress)
  })

  it('finishes a plot that was already paid for the moment it is sited', () => {
    /*
     * How a save from the OLD flow lands here: it banked a finished tile,
     * which save.ts restores as fully-paid progress. Charging for it again
     * would take back land she had already earned.
     */
    let f = createFlow()
    f = { ...f, phase: 'placing', sumProgress: 999 }
    f = placeTile(chooseTile(f, 'water'), { q: 1, r: 0 })
    expect(f.plot).toBeNull()
    expect(f.island.tiles.get('1,0')).toBe('water')
    expect(f.sumProgress).toBe(0)
  })

  it('never lets a plot be chosen or sited mid-challenge', () => {
    let f = buildTile(createFlow())
    f = { ...f, phase: 'challenge', challenge: 'read' }
    expect(chooseTile(f, 'water').chosen).toBeNull()
    const placed = placeTile(f, { q: 0, r: 1 })
    expect(count(placed.island)).toBe(count(f.island))
  })

  it('cannot open the bank twice and lose the first plot', () => {
    let f = buildTile(createFlow())
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
    const plot = f.plot
    // Asking again with a plot under construction advances it, never
    // replaces it - otherwise the sums already paid would vanish.
    const g = askForLand({ ...f, phase: 'free' })
    expect(g.plot).toEqual(plot)
  })
})
