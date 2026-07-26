import { describe, it, expect, beforeEach } from 'vitest'
import { toSave, fromSave, loadIsland, saveIsland } from '../../src/island/save'
import {
  createFlow, challengePassed, tapEgg, tapSum, askForLand, chooseTile, placeTile,
  pagesForEgg,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
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

/** An island with some history: a pet, and a finished water tile. */
function playedFlow(): Flow {
  let f: Flow = createFlow()
  for (let i = 0, n = pagesForEgg(f); i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Bimo', species: 'animal-fox' })
  }
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'water'), { q: 1, r: 0 })
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

/** An island with a plot half built: sited, some sums paid, not finished. */
function midBuildFlow(): Flow {
  let f = playedFlow()
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
  f = challengePassed(tapSum({ ...f, phase: 'free' }))
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

  it('keeps a half-built plot across a reload, site and all', async () => {
    /*
     * Brief section 18: nothing a child owns can be lost. The plot is the
     * only record of which socket she chose and how many sums she has
     * already spent on it, so dropping it from the save quietly throws both
     * away and starts her over on the next tile.
     */
    const store = createLocalStore(mem)
    const before = midBuildFlow()
    expect(before.plot).not.toBeNull()
    expect(before.sumProgress).toBeGreaterThan(0)

    await saveIsland(store, 'p1', before, true)
    const { flow } = await loadIsland(store, 'p1')

    expect(flow.plot).toEqual(before.plot)
    expect(flow.sumProgress).toBe(before.sumProgress)
  })

  it('ignores a plot that has been corrupted rather than crashing', () => {
    const bad = { tiles: [['0,0', 'grass']] as Array<[string, 'grass']>, pets: [],
      bankedTiles: 0, openingSeen: true, plot: { at: { q: 'x' }, type: 'lava' } }
    const { flow } = fromSave(bad as never)
    expect(flow.plot).toBeNull()
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

describe('island save — land already earned survives visibly', () => {
  it('converts an OLD banked tile into a plot that is already paid for', () => {
    /*
     * Saves written under the previous flow banked a finished tile that had
     * never been placed. Under the new flow there is nowhere to put that, and
     * simply dropping it would take back land she had worked for.
     *
     * So it resumes in 'placing' with the work credited: she picks a type and
     * a socket, and the tile completes on siting rather than being charged
     * for a second time.
     */
    const { flow } = fromSave({
      tiles: [['0,0', 'grass']], pets: [], bankedTiles: 1, openingSeen: true,
      readProgress: 0, sumProgress: 0, tilesEarned: 1,
    })
    expect(flow.phase).toBe('placing')

    const sited = placeTile(chooseTile(flow, 'grass'), { q: 1, r: 0 })
    expect(sited.plot).toBeNull()               // finished on the spot
    expect(count(sited.island)).toBe(2)
  })

  it('resumes in free play when nothing is owed', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', playedFlow(), true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.phase).toBe('free')
    expect(flow.plot).toBeNull()
  })
})
