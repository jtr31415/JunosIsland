import { describe, it, expect, beforeEach } from 'vitest'
import { toSave, fromSave, loadIsland, saveIsland } from '../../src/island/save'
import { createFlow, challengePassed, tapEgg, tapSum, chooseTile, placeTile } from '../../src/island/flow'
import { count, tileAt } from '../../src/island/world/grid'
import { createLocalStore } from '../../src/platform/storage'

class MemStorage implements Storage {
  private m = new Map<string, string>()
  get length(): number { return this.m.size }
  clear(): void { this.m.clear() }
  getItem(k: string): string | null { return this.m.get(k) ?? null }
  key(i: number): string | null { return [...this.m.keys()][i] ?? null }
  removeItem(k: string): void { this.m.delete(k) }
  setItem(k: string, v: string): void { this.m.set(k, v) }
  [name: string]: unknown
}

let mem: MemStorage
beforeEach(() => { mem = new MemStorage() })

/** An island with some history: a pet, and a placed water tile. */
function playedFlow() {
  let f = tapEgg(createFlow())
  f = challengePassed(f, { name: 'Bimo', species: 'animal-fox' })
  f = tapSum(f)
  f = challengePassed(f)
  f = chooseTile(f, 'water')
  f = placeTile(f, { q: 1, r: 0 })
  return f
}

describe('island save', () => {
  it('round-trips tiles, pets and their names', async () => {
    const store = createLocalStore(mem)
    const before = playedFlow()
    await saveIsland(store, 'p1', before, true)

    const { flow: after, openingSeen } = await loadIsland(store, 'p1')
    expect(count(after.island)).toBe(count(before.island))
    expect(tileAt(after.island, { q: 1, r: 0 })).toBe('water')
    expect(after.pets.map(p => p.name)).toEqual(['Bimo'])
    expect(after.pets[0]!.species).toBe('animal-fox')
    expect(openingSeen).toBe(true)
  })

  it('a fresh profile gets Fred\'s lonely rock and an unseen opening', async () => {
    const store = createLocalStore(mem)
    const { flow, openingSeen } = await loadIsland(store, 'nobody')
    expect(count(flow.island)).toBe(1)
    expect(flow.pets).toHaveLength(0)
    expect(openingSeen).toBe(false)
  })

  it('keeps banked tiles across a reload — nothing owed is lost', async () => {
    // Brief section 18: nothing a child owns can be lost or expire
    const store = createLocalStore(mem)
    let f = tapSum(createFlow())
    f = challengePassed(f)
    expect(f.bankedTiles).toBe(1)
    await saveIsland(store, 'p1', f, true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.bankedTiles).toBe(1)
  })

  it('always resumes in free play, never mid-challenge', async () => {
    // A reload must never strand the child inside a round she cannot finish
    const store = createLocalStore(mem)
    const mid = tapEgg(createFlow())
    expect(mid.phase).toBe('challenge')
    await saveIsland(store, 'p1', mid, true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.phase).toBe('free')
    expect(flow.challenge).toBeNull()
  })

  it('survives a corrupt save by starting fresh rather than crashing', async () => {
    mem.setItem('petIsland.v1.p1.save', '{not json at all')
    const store = createLocalStore(mem)
    const { flow } = await loadIsland(store, 'p1')
    expect(count(flow.island)).toBe(1)
  })

  it('ignores a save with no tiles', () => {
    const { flow } = fromSave({ tiles: [], pets: [], bankedTiles: 0, openingSeen: true })
    expect(count(flow.island)).toBe(1)
  })

  it('serialises to plain JSON with no Maps', () => {
    const save = toSave(playedFlow(), false)
    const json = JSON.stringify(save)
    expect(json).toContain('"tiles"')
    expect(JSON.parse(json).tiles.length).toBeGreaterThan(1)
  })

  it('keeps two profiles apart', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'juno', playedFlow(), true)
    await saveIsland(store, 'sam', createFlow(), false)
    const juno = await loadIsland(store, 'juno')
    const sam = await loadIsland(store, 'sam')
    expect(juno.flow.pets).toHaveLength(1)
    expect(sam.flow.pets).toHaveLength(0)
    expect(count(sam.flow.island)).toBe(1)
  })
})

describe('island save — owed land survives visibly', () => {
  it('resumes in placing when tiles are still owed', async () => {
    // Otherwise the offer never reappears after a reload and the tile, though
    // faithfully saved, can never be spent (brief section 18).
    const store = createLocalStore(mem)
    const owed = challengePassed(tapSum(createFlow()))
    expect(owed.bankedTiles).toBe(1)
    await saveIsland(store, 'p1', owed, true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.bankedTiles).toBe(1)
    expect(flow.phase).toBe('placing')
  })

  it('resumes in free play when nothing is owed', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', playedFlow(), true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.bankedTiles).toBe(0)
    expect(flow.phase).toBe('free')
  })
})
