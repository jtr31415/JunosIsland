import { describe, it, expect } from 'vitest'
import {
  createFlow, tapEgg, tapSum, challengePassed, challengeFailed,
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

/** Answer enough sums to earn one tile, whatever the curve currently asks. */
function sumsUntilTile(f: Flow): Flow {
  const need = sumsForTile(f)
  for (let i = 0; i < need; i++) f = challengePassed(tapSum({ ...f, phase: 'free' }))
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

  it('tapping the sum board opens a maths challenge', () => {
    const f = tapSum(createFlow())
    expect(f.phase).toBe('challenge')
    expect(f.challenge).toBe('sum')
  })

  it('the first tile costs a single sum, and later ones cost more', () => {
    // Maths earns land (brief §4); the curve makes the first nearly free
    let f = challengePassed(tapSum(createFlow()))
    expect(f.bankedTiles).toBe(1)
    expect(f.tilesEarned).toBe(1)

    const second = sumsForTile(f)
    expect(second).toBeGreaterThan(1)
    for (let i = 1; i < second; i++) {
      f = challengePassed(tapSum({ ...f, phase: 'free' }))
      expect(f.bankedTiles).toBe(1)       // still only the first
    }
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.bankedTiles).toBe(2)
  })

  it('a banked tile offers three types to choose from', () => {
    const f = sumsUntilTile(createFlow())
    const offer = tileOffer(f)
    expect(offer).toHaveLength(3)
  })

  it('choosing then placing consumes the tile and grows the island', () => {
    let f = sumsUntilTile(createFlow())
    f = chooseTile(f, 'water')
    const before = count(f.island)
    f = placeTile(f, { q: 1, r: 0 })
    expect(count(f.island)).toBe(before + 1)
    expect(f.bankedTiles).toBe(0)
    expect(f.phase).toBe('free')
  })

  it('places the type that was chosen', () => {
    let f = sumsUntilTile(createFlow())
    f = chooseTile(f, 'water')
    f = placeTile(f, { q: 1, r: 0 })
    expect(f.island.tiles.get('1,0')).toBe('water')
  })

  it('cannot place where there is no socket', () => {
    let f = sumsUntilTile(createFlow())
    f = chooseTile(f, 'grass')
    const before = count(f.island)
    f = placeTile(f, { q: 9, r: 9 })   // far out at sea
    expect(count(f.island)).toBe(before)
    expect(f.bankedTiles).toBe(1)       // still owed the tile
  })

  it('a wrong answer costs nothing — no tile, no pet, nothing lost', () => {
    // Brief section 18: wrong answers cost nothing but a wobble
    let f = tapSum(createFlow())
    const tilesBefore = count(f.island)
    f = challengeFailed(f)
    expect(f.bankedTiles).toBe(0)
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

  it('ignores a tile placement when none is banked', () => {
    const f = createFlow()
    const g = placeTile(f, { q: 1, r: 0 })
    expect(count(g.island)).toBe(count(f.island))
  })

  it('offers only tile types the child can actually use', () => {
    const f = sumsUntilTile(createFlow())
    for (const t of tileOffer(f)) expect(['grass', 'water']).toContain(t)
  })
})

describe('flow — land owed is always reachable', () => {
  it('stays in placing while more tiles are owed', () => {
    // Found at the M1 gate: returning to 'free' with a surplus made the offer
    // invisible, and no transition re-entered 'placing' except another sum —
    // so a tile she had earned became permanently unreachable.
    let f = sumsUntilTile(createFlow())
    f = sumsUntilTile({ ...f, phase: 'free' })
    expect(f.bankedTiles).toBe(2)
    f = chooseTile(f, 'grass')
    f = placeTile(f, { q: 1, r: 0 })
    expect(f.bankedTiles).toBe(1)
    expect(f.phase).toBe('placing')      // still owed one, so still placing
    f = chooseTile(f, 'water')
    f = placeTile(f, { q: 0, r: 1 })
    expect(f.bankedTiles).toBe(0)
    expect(f.phase).toBe('free')
  })

  it('never lets a tile be chosen or placed mid-challenge', () => {
    let f = sumsUntilTile(createFlow())
    f = { ...f, phase: 'challenge', challenge: 'read' }
    const chosen = chooseTile(f, 'water')
    expect(chosen.chosen).toBeNull()
    const placed = placeTile(f, { q: 1, r: 0 })
    expect(placed.bankedTiles).toBe(1)   // still owed
    expect(count(placed.island)).toBe(count(f.island))
  })
})
