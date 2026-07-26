import { describe, it, expect } from 'vitest'
import {
  createFlow, tapEgg, tapSum, challengePassed, challengeFailed,
  chooseTile, placeTile, tileOffer,
} from '../../src/island/flow'
import { count } from '../../src/island/world/grid'

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

  it('passing a reading challenge hatches exactly one pet', () => {
    let f = tapEgg(createFlow())
    f = challengePassed(f, { name: 'Bimo', species: 'animal-fox' })
    expect(f.pets).toHaveLength(1)
    expect(f.pets[0]!.name).toBe('Bimo')
    expect(f.phase).toBe('free')
  })

  it('a hatched pet keeps its name and species forever', () => {
    let f = tapEgg(createFlow())
    f = challengePassed(f, { name: 'Sheptun', species: 'animal-crab' })
    f = tapEgg(f)
    f = challengePassed(f, { name: 'Corbell', species: 'animal-bee' })
    expect(f.pets.map(p => p.name)).toEqual(['Sheptun', 'Corbell'])
    expect(f.pets.map(p => p.species)).toEqual(['animal-crab', 'animal-bee'])
  })

  it('tapping the sum board opens a maths challenge', () => {
    const f = tapSum(createFlow())
    expect(f.phase).toBe('challenge')
    expect(f.challenge).toBe('sum')
  })

  it('passing a maths challenge banks exactly one tile', () => {
    // Maths earns land (brief section 4)
    let f = tapSum(createFlow())
    f = challengePassed(f)
    expect(f.bankedTiles).toBe(1)
    expect(f.phase).toBe('placing')
  })

  it('a banked tile offers three types to choose from', () => {
    let f = tapSum(createFlow())
    f = challengePassed(f)
    const offer = tileOffer(f)
    expect(offer).toHaveLength(3)
  })

  it('choosing then placing consumes the tile and grows the island', () => {
    let f = tapSum(createFlow())
    f = challengePassed(f)
    f = chooseTile(f, 'water')
    const before = count(f.island)
    f = placeTile(f, { q: 1, r: 0 })
    expect(count(f.island)).toBe(before + 1)
    expect(f.bankedTiles).toBe(0)
    expect(f.phase).toBe('free')
  })

  it('places the type that was chosen', () => {
    let f = challengePassed(tapSum(createFlow()))
    f = chooseTile(f, 'water')
    f = placeTile(f, { q: 1, r: 0 })
    expect(f.island.tiles.get('1,0')).toBe('water')
  })

  it('cannot place where there is no socket', () => {
    let f = challengePassed(tapSum(createFlow()))
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
    let f = challengePassed(tapSum(createFlow()))
    for (const t of tileOffer(f)) expect(['grass', 'water']).toContain(t)
  })
})

describe('flow — land owed is always reachable', () => {
  it('stays in placing while more tiles are owed', () => {
    // Found at the M1 gate: returning to 'free' with a surplus made the offer
    // invisible, and no transition re-entered 'placing' except another sum —
    // so a tile she had earned became permanently unreachable.
    let f = challengePassed(tapSum(createFlow()))
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
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
    let f = challengePassed(tapSum(createFlow()))
    f = { ...f, phase: 'challenge', challenge: 'read' }
    const chosen = chooseTile(f, 'water')
    expect(chosen.chosen).toBeNull()
    const placed = placeTile(f, { q: 1, r: 0 })
    expect(placed.bankedTiles).toBe(1)   // still owed
    expect(count(placed.island)).toBe(count(f.island))
  })
})
