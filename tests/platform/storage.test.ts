import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalStore, SCHEMA_VERSION } from '../../src/platform/storage'

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
let now: number
const store = () => createLocalStore(mem, () => now)

beforeEach(() => { mem = new MemStorage(); now = 1_000 })

describe('createLocalStore', () => {
  it('returns null for a document that was never written', async () => {
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('round-trips a document', async () => {
    const s = store()
    await s.put('p1', 'save', { score: 12, owned: ['ocean:0'] })
    expect(await s.get('p1', 'save')).toEqual({ score: 12, owned: ['ocean:0'] })
  })

  it('keeps profiles isolated from each other', async () => {
    // Brief section 18: sibling profiles cannot affect each other's islands
    const s = store()
    await s.put('p1', 'save', { score: 1 })
    await s.put('p2', 'save', { score: 2 })
    expect(await s.get('p1', 'save')).toEqual({ score: 1 })
    expect(await s.get('p2', 'save')).toEqual({ score: 2 })
  })

  it('stamps schemaVersion and updatedAt on every write', async () => {
    now = 5_555
    await store().put('p1', 'save', { score: 3 })
    const raw = JSON.parse(mem.getItem('petIsland.v1.p1.save')!)
    expect(raw.schemaVersion).toBe(SCHEMA_VERSION)
    expect(raw.updatedAt).toBe(5_555)
    expect(raw.data).toEqual({ score: 3 })
  })

  it('refreshes updatedAt on rewrite', async () => {
    const s = store()
    await s.put('p1', 'save', { score: 1 })
    now = 9_000
    await s.put('p1', 'save', { score: 2 })
    expect(JSON.parse(mem.getItem('petIsland.v1.p1.save')!).updatedAt).toBe(9_000)
  })

  it('returns null rather than throwing on corrupt JSON', async () => {
    // Nothing a child owns may be lost, but a corrupt blob must not crash the
    // island either — start fresh rather than white-screen.
    mem.setItem('petIsland.v1.p1.save', '{not json')
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('returns null for a document from a future schema version', async () => {
    mem.setItem('petIsland.v1.p1.save', JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 99, updatedAt: 1, data: { score: 1 },
    }))
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('lists profiles in insertion order', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '\u{1F984}' })
    await s.addProfile({ id: 'p2', name: 'Sam', avatar: '\u{1F98A}' })
    expect((await s.list()).map(p => p.name)).toEqual(['Juno', 'Sam'])
  })

  it('does not duplicate a profile added twice', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '\u{1F984}' })
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '\u{1F984}' })
    expect(await s.list()).toHaveLength(1)
  })

  it('removing a profile also removes its documents', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '\u{1F984}' })
    await s.put('p1', 'save', { score: 7 })
    await s.removeProfile('p1')
    expect(await s.list()).toEqual([])
    expect(await s.get('p1', 'save')).toBeNull()
  })

  it('a sibling profile is untouched when another is deleted', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '\u{1F984}' })
    await s.addProfile({ id: 'p2', name: 'Sam', avatar: '\u{1F98A}' })
    await s.put('p2', 'save', { score: 4 })
    await s.removeProfile('p1')
    expect(await s.get('p2', 'save')).toEqual({ score: 4 })
    expect((await s.list()).map(p => p.id)).toEqual(['p2'])
  })

  it('survives a corrupt profile list', async () => {
    mem.setItem('petIsland.v1.profiles', 'not an array')
    expect(await store().list()).toEqual([])
  })

  it('every method returns a Promise, so a network store can drop in', async () => {
    // The whole point of the async interface (spec section 6): call sites must
    // already await, or swapping the implementation is a viral refactor.
    const s = store()
    expect(s.get('p1', 'save')).toBeInstanceOf(Promise)
    expect(s.put('p1', 'save', {})).toBeInstanceOf(Promise)
    expect(s.list()).toBeInstanceOf(Promise)
    expect(s.addProfile({ id: 'x', name: 'x', avatar: 'x' })).toBeInstanceOf(Promise)
    expect(s.removeProfile('x')).toBeInstanceOf(Promise)
  })
})
