import { describe, it, expect, beforeEach } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { createDurableStore, RING_SIZE } from '../../src/platform/durable'
import type { TextStore } from '../../src/platform/durable'
import { openIdb, DOCS } from '../../src/platform/idb'
import type { IdbStore } from '../../src/platform/idb'
import { seal, checksum, canonical } from '../../src/platform/envelope'
import type { Envelope } from '../../src/platform/envelope'
import type { ProfileMeta } from '../../src/platform/storage'

/**
 * Item 1's acceptance criteria, and the guardrail behind them: nothing a child
 * owns can be lost (brief §19).
 *
 * A REAL IndexedDB (fake-indexeddb's implementation) rather than a hand-rolled
 * double. This project's own lesson is that mocked ports hide dead features —
 * four of them, each passing a suite that only asserted a mock had been
 * called. A double that agrees with my assumptions would prove nothing.
 */

/** localStorage, near enough, and pokeable. */
function memoryText(): TextStore & { raw: Map<string, string> } {
  const raw = new Map<string, string>()
  return {
    raw,
    read: k => raw.get(k) ?? null,
    write: (k, v) => { raw.set(k, v) },
    drop: k => { raw.delete(k) },
  }
}

const noProfiles = {
  list: async (): Promise<ProfileMeta[]> => [],
  addProfile: async (): Promise<void> => {},
  removeProfile: async (): Promise<void> => {},
}

const ISLAND = {
  tiles: [['0,0', 'grass'], ['1,0', 'water']],
  pets: [{ id: 'p1', species: 'animal-fox', name: 'Bimo' }],
  bankedTiles: 0, openingSeen: true, childName: 'Juno',
}

let idb: IdbStore | null
let ticks: number

beforeEach(async () => {
  idb = await openIdb(new IDBFactory())
  ticks = 1000
})

const clock = (): number => ++ticks

describe('the two copies', () => {
  it('writes both, and both hold the same island', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', ISLAND)

    expect(text.raw.size).toBe(1)
    const fromIdb = await idb?.get<Envelope<unknown>>(DOCS, 'p1/save')
    expect(fromIdb?.data).toEqual(ISLAND)
  })

  it('reads back what it wrote', async () => {
    const store = createDurableStore(noProfiles, { text: memoryText(), idb, now: clock })
    await store.put('p1', 'save', ISLAND)
    expect(await store.get('p1', 'save')).toEqual(ISLAND)
    expect(store.lastLoad('p1', 'save')?.outcome).toBe('loaded')
  })

  it('takes the higher revision when the copies disagree, and says so', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { bankedTiles: 1 })
    await store.put('p1', 'save', { bankedTiles: 2 })

    // A tab killed mid-write: IndexedDB landed, localStorage did not.
    const stale = seal({ bankedTiles: 1 }, 1, 1)
    text.write('petIsland.v1.p1.save', JSON.stringify(stale))

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await back.get('p1', 'save')).toEqual({ bankedTiles: 2 })
    expect(back.lastLoad('p1', 'save')?.divergence).toEqual({ local: 1, idb: 2 })
  })

  it('does not decide by the clock', async () => {
    /*
     * A tablet whose clock jumped backwards — daylight saving, a dead battery,
     * a corrected sync — must not lose an afternoon's work. The newer save
     * here carries the EARLIER timestamp on purpose.
     */
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { bankedTiles: 1 })
    await store.put('p1', 'save', { bankedTiles: 9 })   // rev 2, in both copies

    /*
     * Now localStorage is replaced by an OLDER save (rev 1) carrying a much
     * LATER timestamp — which is what a clock jumping backwards and then
     * forwards again actually produces. IndexedDB still holds rev 2.
     */
    text.write('petIsland.v1.p1.save', JSON.stringify({
      schemaVersion: 2, rev: 1, updatedAt: 999_999_999,
      data: { bankedTiles: 1 },
      checksum: checksum(canonical({ bankedTiles: 1 })),
    }))

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await back.get('p1', 'save')).toEqual({ bankedTiles: 9 })
  })

  it('still works with no IndexedDB at all', async () => {
    // Private browsing, a blocked database, plain jsdom. One copy is worse
    // than two and infinitely better than refusing to play.
    const store = createDurableStore(noProfiles, { text: memoryText(), idb: null, now: clock })
    await store.put('p1', 'save', ISLAND)
    expect(await store.get('p1', 'save')).toEqual(ISLAND)
  })

  it('reports null for a profile that has never played', async () => {
    const store = createDurableStore(noProfiles, { text: memoryText(), idb, now: clock })
    expect(await store.get('nobody', 'save')).toBeNull()
    expect(store.lastLoad('nobody', 'save')?.outcome).toBe('fresh')
  })
})

describe('the snapshot ring', () => {
  it('recovers when BOTH copies are corrupt', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { bankedTiles: 1 })
    await store.put('p1', 'save', { bankedTiles: 2 })
    await store.put('p1', 'save', { bankedTiles: 3 })

    // Corrupt both current copies, leaving their checksums claiming otherwise.
    const wreck = (env: Envelope<unknown>): Envelope<unknown> =>
      ({ ...env, data: { bankedTiles: 999 } })
    const current = await store.envelope('p1', 'save') as Envelope<unknown>
    text.write('petIsland.v1.p1.save', JSON.stringify(wreck(current)))
    await idb?.put(DOCS, 'p1/save', wreck(current))

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await back.get('p1', 'save')).toEqual({ bankedTiles: 3 })
    expect(back.lastLoad('p1', 'save')?.outcome).toBe('restored')
  })

  it('keeps the NEWEST eight, not the oldest eight', async () => {
    /*
     * The zero-padded key exists for this. Unpadded, "10" sorts before "9" and
     * the ring evicts the wrong end — quietly keeping the eight oldest saves
     * and throwing away everything recent, which is the opposite of a backup.
     */
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    for (let i = 1; i <= RING_SIZE + 5; i++) await store.put('p1', 'save', { bankedTiles: i })

    const rows = await idb?.prefix<Envelope<unknown>>('ring', 'p1/save/') ?? []
    expect(rows).toHaveLength(RING_SIZE)
    const revs = rows.map(r => r.value.rev).sort((a, b) => a - b)
    expect(revs[revs.length - 1]).toBe(RING_SIZE + 5)
    expect(revs[0]).toBe(6)
  })

  it('gives up honestly when there is nothing usable anywhere', async () => {
    const text = memoryText()
    text.write('petIsland.v1.p1.save', '{"schemaVersion":2,"rev":4,"checksum":"deadbeef","updatedAt":1,"data":{"x":1}}')
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await store.get('p1', 'save')).toBeNull()
    expect(store.lastLoad('p1', 'save')?.outcome).toBe('empty')
  })

  it('ignores junk in localStorage rather than throwing', async () => {
    const text = memoryText()
    text.write('petIsland.v1.p1.save', 'not json at all')
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await store.get('p1', 'save')).toBeNull()
  })
})

describe('the tab-kill case — acceptance (a)', () => {
  it('loses nothing when the tab dies between the award and the ceremony', async () => {
    /*
     * The bug class this whole item exists to make unexpressible. A pet was
     * hatched, the ceremony began, and for about two seconds the pet existed
     * on screen and nowhere else. Close the tab in that window and the friend
     * the child had just read home was gone.
     */
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { pets: [], bankedTiles: 0 })

    const awarded = { pets: [{ id: 'p9', name: 'Sheptun' }], bankedTiles: 0 }
    await store.put('p1', 'save', awarded)      // award, committed...
    // ...and here the tab dies. No ceremony, no further writes, new process:

    const afterReload = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await afterReload.get('p1', 'save')).toEqual(awarded)
  })

  it('keeps the revision climbing across a reload', async () => {
    // Otherwise the next write restarts at 1 and looks older than what it
    // replaces — and the next load would prefer the save it just superseded.
    const text = memoryText()
    const first = createDurableStore(noProfiles, { text, idb, now: clock })
    await first.put('p1', 'save', { bankedTiles: 1 })
    await first.put('p1', 'save', { bankedTiles: 2 })

    const second = createDurableStore(noProfiles, { text, idb, now: clock })
    await second.get('p1', 'save')
    await second.put('p1', 'save', { bankedTiles: 3 })

    expect((await second.envelope('p1', 'save'))?.rev).toBe(3)
    const third = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await third.get('p1', 'save')).toEqual({ bankedTiles: 3 })
  })
})

describe('export and import — acceptance (c)', () => {
  it('round-trips through a wipe', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', ISLAND)

    const exported = await store.envelope('p1', 'save') as Envelope<unknown>
    const asFile = JSON.stringify(exported)

    // Wipe everything, as an uninstall or a cleared browser would.
    const wiped = memoryText()
    const freshIdb = await openIdb(new IDBFactory())
    const after = createDurableStore(noProfiles, { text: wiped, idb: freshIdb, now: clock })
    expect(await after.get('p1', 'save')).toBeNull()

    await after.restore('p1', 'save', JSON.parse(asFile) as Envelope<unknown>)
    expect(await after.get('p1', 'save')).toEqual(ISLAND)
  })

  it('snapshots the current island before an import overwrites it', async () => {
    // The one moment a grown-up can destroy an island on purpose. Being able
    // to undo a mistaken import is the difference between a feature and a trap.
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { bankedTiles: 42 })

    await store.restore('p1', 'save', seal({ bankedTiles: 7 }, 1, 1))
    expect(await store.get('p1', 'save')).toEqual({ bankedTiles: 7 })

    const ring = await idb?.prefix<Envelope<unknown>>('ring', 'p1/save/') ?? []
    expect(ring.some(r => JSON.stringify(r.value.data) === JSON.stringify({ bankedTiles: 42 })))
      .toBe(true)
  })

  it('an imported save outranks what it replaced', async () => {
    // An import carrying rev 1 must not lose to the rev 9 it overwrote.
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    for (let i = 1; i <= 9; i++) await store.put('p1', 'save', { bankedTiles: i })
    await store.restore('p1', 'save', seal({ bankedTiles: 100 }, 1, 1))

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await back.get('p1', 'save')).toEqual({ bankedTiles: 100 })
  })
})

describe('removing a profile', () => {
  it('takes the snapshots with it', async () => {
    // Siblings must never affect each other's islands (brief §19) — and a
    // deleted profile that left eight recoverable copies behind is not deleted.
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', ISLAND)
    await store.put('p1', 'save', { bankedTiles: 2 })
    await store.removeProfile('p1')

    expect(text.raw.size).toBe(0)
    expect(await idb?.get(DOCS, 'p1/save')).toBeNull()
    expect(await idb?.prefix('ring', 'p1/save/')).toEqual([])
  })
})

describe("the save already on Juno's tablet", () => {
  /**
   * The most dangerous case in the whole item, and the one that would have
   * shipped silently.
   *
   * This is byte-for-byte what `createLocalStore.put` writes today
   * (storage.ts:71-78): a schemaVersion, an updatedAt, and the payload. No
   * rev, no checksum, because neither existed when it was written. An envelope
   * reader calls that "not one of ours", resolves it to null, and boots a
   * brand new island — so upgrading the game would have wiped everything they
   * own. Brief §19: nothing a child owns can be lost.
   */
  const THEIR_ACTUAL_SAVE = {
    schemaVersion: 1,
    updatedAt: 1_753_000_000_000,
    data: {
      tiles: [['0,0', 'grass'], ['1,0', 'grass'], ['0,1', 'water']],
      pets: [
        { id: 'p1', species: 'animal-fox', name: 'Bimo', at: { q: 0, r: 0 } },
        { id: 'p2', species: 'animal-bunny', name: 'Sheptun', at: { q: 1, r: 0 } },
      ],
      bankedTiles: 0, openingSeen: true, childName: 'Juno',
      readProgress: 2, sumProgress: 3, tilesEarned: 3,
    },
  }

  it('loads, with every friend and every tile still there', async () => {
    const text = memoryText()
    text.write('petIsland.v1.p1.save', JSON.stringify(THEIR_ACTUAL_SAVE))

    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    const loaded = await store.get<Record<string, unknown>>('p1', 'save')

    expect(loaded).not.toBeNull()
    expect(loaded?.pets).toHaveLength(2)
    expect(loaded?.tiles).toHaveLength(3)
    expect(loaded?.childName).toBe('Juno')
    expect(loaded?.tilesEarned).toBe(3)
    expect(store.lastLoad('p1', 'save')?.outcome).toBe('loaded')
  })

  it('brings it up to the current schema on the way in', async () => {
    const text = memoryText()
    text.write('petIsland.v1.p1.save', JSON.stringify(THEIR_ACTUAL_SAVE))
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    const loaded = await store.get<Record<string, unknown>>('p1', 'save')
    // v1 -> v2 adds the persist() answer without disturbing their progress.
    expect(loaded?.persistGranted).toBeNull()
    expect(loaded?.readProgress).toBe(2)
    expect(loaded?.sumProgress).toBe(3)
  })

  it('is outranked by the first proper save written after it', async () => {
    // Adopted at rev 0, so the next write (rev 1) wins rather than tying.
    const text = memoryText()
    text.write('petIsland.v1.p1.save', JSON.stringify(THEIR_ACTUAL_SAVE))
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.get('p1', 'save')
    await store.put('p1', 'save', { pets: [{ id: 'p3' }], tiles: [] })

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    const loaded = await back.get<Record<string, unknown>>('p1', 'save')
    expect(loaded?.pets).toHaveLength(1)
  })

  it('still refuses things that are genuinely not saves', async () => {
    // Adopting a legacy shape must not become "adopt any object at all".
    const text = memoryText()
    text.write('petIsland.v1.p1.save', JSON.stringify({ hello: 'world' }))
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await store.get('p1', 'save')).toBeNull()
  })
})

describe('two saves at once — the race the barrier could not protect against', () => {
  /**
   * Found by review. `put` read the revision counter, then awaited three times
   * before writing it back, so two overlapping puts both read the stale count
   * and both wrote the SAME rev. Equal revisions tie on load, the tie goes to
   * localStorage, and whichever landed there last won regardless of which was
   * newer.
   *
   * Overlapping puts are ordinary here: refresh() persists fire-and-forget
   * while a hatch commits and awaits. On a slow tablet the earlier one is
   * still in flight.
   */
  it('never gives two concurrent saves the same revision', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })

    await Promise.all([
      store.put('p1', 'save', { pets: [] }),
      store.put('p1', 'save', { pets: ['Sheptun'] }),
      store.put('p1', 'save', { pets: ['Sheptun', 'Bimo'] }),
    ])

    /*
     * Three saves must have claimed three revisions. Deliberately NOT asserted
     * by counting distinct revs in the ring — the ring is keyed BY rev, so a
     * collision silently overwrites itself and the duplicate disappears. That
     * first version of this test passed against the bug.
     */
    expect((await store.envelope('p1', 'save'))?.rev).toBe(3)
  })

  it('keeps the LAST save issued, not whichever write finished last', async () => {
    /*
     * The losing interleaving, in full: a stale pre-award save whose write is
     * slow, then the award. Both used to land on rev 1 with the stale one
     * reaching localStorage second — so reload returned the island WITHOUT
     * the pet the child had just hatched, ceremony and all, despite the awaited
     * receipt that was supposed to make that impossible.
     */
    const text = memoryText()
    /*
     * The first write is made slow on purpose, which is what a real tablet
     * does under load. Without it the two writes happen to interleave in the
     * order they were issued and the bug hides.
     */
    let writes = 0
    const slowFirst: IdbStore = {
      get: (store, key) => (idb as IdbStore).get(store, key),
      put: async (store, key, value) => {
        if (store === DOCS && writes++ === 0) await new Promise(r => setTimeout(r, 20))
        return (idb as IdbStore).put(store, key, value)
      },
      remove: (store, key) => (idb as IdbStore).remove(store, key),
      prefix: (store, p) => (idb as IdbStore).prefix(store, p),
    }
    const store = createDurableStore(noProfiles, { text, idb: slowFirst, now: clock })

    const stale = store.put('p1', 'save', { pets: [] })
    const award = store.put('p1', 'save', { pets: ['Sheptun'] })
    await Promise.all([stale, award])

    const back = createDurableStore(noProfiles, { text, idb, now: clock })
    expect(await back.get('p1', 'save')).toEqual({ pets: ['Sheptun'] })
  })

  it('serialises writes so both copies agree afterwards', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await Promise.all(
      Array.from({ length: 12 }, (_, i) => store.put('p1', 'save', { n: i })))

    const local = JSON.parse(text.raw.get('petIsland.v1.p1.save') as string) as Envelope<unknown>
    const remote = await idb?.get<Envelope<unknown>>(DOCS, 'p1/save')
    expect(local.rev).toBe(remote?.rev)
    expect(local.data).toEqual(remote?.data)
  })
})

describe('exporting the right copy', () => {
  it('exports the newer copy, not whichever localStorage happens to hold', async () => {
    /*
     * `browserText.write` swallows quota errors by design, so on a
     * storage-squeezed device localStorage falls behind IndexedDB — and that
     * is exactly the device where a backup matters. Exporting the stale copy
     * would be discovered only after the tablet was lost.
     */
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { bankedTiles: 1 })
    await store.put('p1', 'save', { bankedTiles: 2 })

    // localStorage stuck a revision behind, as a quota failure would leave it.
    text.write('petIsland.v1.p1.save', JSON.stringify(seal({ bankedTiles: 1 }, 1, 1)))

    const exported = await store.envelope('p1', 'save')
    expect(exported?.data).toEqual({ bankedTiles: 2 })
  })
})

describe('importing a damaged backup', () => {
  it('refuses it rather than re-sealing it as valid', async () => {
    /*
     * `restore` re-seals the payload with a freshly computed checksum, so a
     * bit-rotted-but-parseable backup would have been laundered into a
     * perfectly valid save. The import path is the only one where the file has
     * lived outside our storage, and it was the one place not checking.
     */
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.put('p1', 'save', { pets: ['Bimo'] })

    const rotted = { ...seal({ pets: ['Bimo'] }, 1, 1), data: { pets: [] } }
    await expect(store.restore('p1', 'save', rotted)).rejects.toThrow()

    // And nothing was changed.
    expect(await store.get('p1', 'save')).toEqual({ pets: ['Bimo'] })
  })

  it('still accepts an intact one', async () => {
    const text = memoryText()
    const store = createDurableStore(noProfiles, { text, idb, now: clock })
    await store.restore('p1', 'save', seal({ pets: ['Corbell'] }, 1, 1))
    expect(await store.get('p1', 'save')).toEqual({ pets: ['Corbell'] })
  })
})

describe('when the snapshot ring cannot be written', () => {
  it('does not take the ceremony down with it', async () => {
    /*
     * Both primaries are written by the time the ring is appended, so the save
     * HAS happened — but an unguarded throw rejected commitState(), and `void
     * passed(more)` turned that into an unhandled rejection with no hatch. The
     * child would finish their fifth page, the pet would be saved, and nothing
     * would happen. Most likely on a full device, where quota errors live.
     */
    const text = memoryText()
    const full: IdbStore = {
      get: async () => null,
      put: async (store: string) => {
        if (store === 'ring') throw new Error('QuotaExceededError')
      },
      remove: async () => {},
      prefix: async () => [],
    }
    const store = createDurableStore(noProfiles, { text, idb: full, now: clock })

    await expect(store.put('p1', 'save', { pets: ['Bimo'] })).resolves.toBeUndefined()
    expect(await store.get('p1', 'save')).toEqual({ pets: ['Bimo'] })
  })
})
