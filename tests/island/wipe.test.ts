/**
 * PB-047 — what a wipe actually wipes.
 *
 * "Start again" used to be one red button that took everything. Joe's card
 * splits it into three tick-boxes — their island and animals, what they are
 * working on, their name — and THE INDEPENDENCE IS THE WHOLE CARD: ticking
 * one must not quietly take another with it.
 *
 * So these tests are mostly a matrix. For each box, and for each pair, they
 * build a lived-in save, wipe, put it back through the loader the game itself
 * uses, and assert both halves: that what was ticked is gone, and — the half
 * that is easy to forget and expensive to get wrong — that what was NOT ticked
 * came back byte for byte. A partial wipe that leaves half of a child's
 * academic record behind is worse than no wipe at all, because it produces a
 * child whose measured ability disagrees with what the grown-up asked for.
 *
 * Everything goes through the REAL `fromSave`, not through an inspection of
 * the blob, because the blob is not what the game reads. That is not
 * pedantry: `fromSave`'s fresh branch drops `childName` when the tile array is
 * empty, so an island wipe written the obvious way would silently take their
 * name — a coupling invisible to any test that only looked at the JSON.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { toSave, fromSave, wipeSave, wipeIsland, loadIsland } from '../../src/island/save'
import type { WipeChoice } from '../../src/island/save'
import { createLocalStore } from '../../src/platform/storage'
import { createAttainment, LIVE_PATHS, STAGES } from '../../src/island/harness'
import type { Attainment } from '../../src/island/harness'
import {
  createFlow, challengePassed, tapEgg, tapSum, askForLand, chooseTile, placeTile,
  pagesForEgg, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { count, tileAt } from '../../src/island/world/grid'
import { NOTHING_OPENED } from '../../src/island/species/opened'
import type { Opened } from '../../src/island/species/opened'

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

/** An island with a history: a pet, a finished water tile, work in hand. */
function playedFlow(): Flow {
  let f: Flow = createFlow()
  for (let i = 0, n = pagesForEgg(f); i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Bimo', species: 'animal-fox' })
  }
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'water'), { q: 1, r: 0 })
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  // Part-paid work toward the next of each, and a honeymoon behind them.
  return { ...f, readProgress: 5, sumProgress: 3, honeymoonTiles: 1 }
}

/**
 * An attainment record with EVERY field carrying a distinctive value.
 *
 * Written out rather than played, deliberately. The point of the academic box
 * is that it clears the WHOLE harness record, and the only way to show that is
 * to put something recognisable in every corner of it and then look for the
 * corners. Every value here is one `readAttainment` accepts, so anything that
 * comes back changed came back changed because of the wipe.
 */
function livedInAttainment(): Attainment {
  const a = createAttainment()
  for (const path of LIVE_PATHS) {
    a[path].mode = 'manual'
    a[path].honeymoonFrom = '2026-07-01'
    a[path].offer = {
      lastOfferDay: '2026-07-10',
      declinedDay: '2026-07-14',
      daysSinceDecline: 1,
      lastCountedDay: '2026-07-15',
    }
    for (const stage of STAGES[path]) {
      a[path].stages[stage] = {
        ticked: true,
        attempts: 42,
        ewma: 0.87,
        latencies: [900, 800, 700],
        early: [1200, 1100],
        sessions: [{ date: '2026-07-15', correct: 8, total: 10 }],
        rescues: [1_700_000_000_000],
        probes: [1, 0, 1],
      }
    }
  }
  return a
}

/**
 * An album roster with a history: one drawn, and one FINISHED.
 *
 * The completions are here for the same reason every other fixture in this file
 * carries a distinctive value — the island box has to take the whole album
 * record, and JT-047 added a third field to it. `completedCollections` is the
 * one that would be easiest to leave behind, because it looks like a once-flag
 * and once-flags deliberately SURVIVE a wipe. It is not one: a completion
 * remembered on a fresh island frees one of the four slots and satisfies the 80%
 * trigger with no animals owned at all.
 */
const LIVED_IN_OPENED: Opened = {
  open: [...NOTHING_OPENED.open, 'collection-woodland'],
  lastOpened: 'collection-woodland',
  completed: ['collection-woodland'],
}

const LIVED_IN_FLAGS = ['INTRO-TEN']
const NAME = 'Juno'

/** The save as it stands before any grown-up opens the gear. */
const lived = (): ReturnType<typeof toSave> =>
  toSave(playedFlow(), true, NAME, true, livedInAttainment(), LIVED_IN_FLAGS,
    true, LIVED_IN_OPENED)

const NOTHING: WipeChoice = { island: false, academic: false, name: false }
const box = (over: Partial<WipeChoice>): WipeChoice => ({ ...NOTHING, ...over })

/** Wipe, then read it back the way the game reads it on the next boot. */
const wipeAndLoad = (what: Partial<WipeChoice>) =>
  fromSave(wipeSave(lived(), box(what)))

/** What the same save loads as with nothing wiped — the control. */
const untouched = () => fromSave(lived())

describe('the island and animals box', () => {
  it('takes their island, their animals and the work saved toward the next of each', () => {
    const after = wipeAndLoad({ island: true })
    expect(after.flow.pets).toEqual([])
    // One grass tile at the origin: exactly what a brand-new island starts as.
    expect(count(after.flow.island)).toBe(1)
    expect(tileAt(after.flow.island, { q: 0, r: 0 })).toBe('grass')
    expect(after.flow.bankedTiles).toBe(0)
    expect(after.flow.plot).toBeNull()
    expect(after.flow.readProgress).toBe(0)
    expect(after.flow.sumProgress).toBe(0)
    expect(after.flow.tilesEarned).toBe(0)
    expect(after.flow.honeymoonTiles).toBe(0)
  })

  it('plays the story again, because a new island gets its opening', () => {
    expect(untouched().openingSeen).toBe(true)
    expect(wipeAndLoad({ island: true }).openingSeen).toBe(false)
  })

  it('closes the album roster, which is a fact about animals they no longer have', () => {
    /*
     * Left alone it would show collections standing open with nothing in them
     * and `lastOpened` pointing at a collection that is not theirs any more.
     * `advance` re-seeds from the pets on the next load.
     *
     * AND IT TAKES THE COMPLETIONS WITH IT — JT-047. This is the field that
     * looks like a once-flag and must not be treated as one: a collection
     * remembered as finished on a fresh island would free one of `MAX_ACTIVE`'s
     * four slots and satisfy the 80% trigger with no animals owned at all, so a
     * child who started again would be given an album for nothing.
     */
    expect(untouched().opened.lastOpened).toBe('collection-woodland')
    expect(untouched().opened.completed).toEqual(['collection-woodland'])
    expect(wipeAndLoad({ island: true }).opened).toEqual(NOTHING_OPENED)
    expect(wipeAndLoad({ island: true }).opened.completed).toEqual([])
  })

  it('DOES NOT TAKE THEIR NAME — the trap this whole card exists to break', () => {
    /*
     * `fromSave` treats an empty tile array as "no save at all", and its fresh
     * branch hands back `childName: ''`. So an island wipe written as
     * `tiles: []` would destroy their name without anybody ticking the name box.
     * This is the tripwire on that; see the note in `save.ts:wipeSave`.
     */
    expect(wipeAndLoad({ island: true }).childName).toBe(NAME)
  })

  it('does not touch a single field of what they are working on', () => {
    expect(wipeAndLoad({ island: true }).attainment).toEqual(untouched().attainment)
    expect(wipeAndLoad({ island: true }).onceFlags).toEqual(LIVED_IN_FLAGS)
  })
})

describe('the academic progress box', () => {
  it('puts them back to the start of Year 1, which is a virgin record', () => {
    // Joe: "reset to essentially start of y1 level". `createAttainment()` IS
    // that: sums 1, reading 1, building 1, mode auto, nothing measured.
    expect(wipeAndLoad({ academic: true }).attainment).toEqual(createAttainment())
  })

  it('leaves no corner of the harness record behind', () => {
    /*
     * Field by field, because a half-cleared record is the specific failure
     * that produces a child whose measured ability disagrees with their ticks —
     * a fresh ladder priced off last month's EWMA.
     */
    const after = wipeAndLoad({ academic: true }).attainment
    for (const path of LIVE_PATHS) {
      expect(after[path].mode).toBe('auto')
      expect(after[path].honeymoonFrom).toBeNull()
      expect(after[path].offer).toEqual({
        lastOfferDay: null, declinedDay: null, daysSinceDecline: 0, lastCountedDay: null,
      })
      for (const stage of STAGES[path]) {
        const s = after[path].stages[stage]!
        expect(s.attempts).toBe(0)
        expect(s.ewma).toBeNull()
        expect(s.latencies).toEqual([])
        expect(s.early).toEqual([])
        expect(s.sessions).toEqual([])
        expect(s.rescues).toEqual([])
        expect(s.probes).toEqual([])
      }
    }
  })

  it('un-ticks the rungs they had climbed, back to the three a new island starts on', () => {
    const before = untouched().attainment
    const after = wipeAndLoad({ academic: true }).attainment
    const ticks = (a: Attainment): string[] =>
      LIVE_PATHS.flatMap(p =>
        STAGES[p].filter(s => a[p].stages[s]?.ticked === true).map(s => `${p}${s}`))
    // Everything was ticked; only what a fresh island starts with survives.
    expect(ticks(before).length).toBeGreaterThan(ticks(after).length)
    expect(ticks(after)).toEqual(ticks(createAttainment()))
  })

  it('clears the once-only teaching moments, so they are introduced to tens again', () => {
    /*
     * They are keyed to where the child is on the ladder. Reset the ladder and
     * leave them and the child re-climbs to the rung that introduces tens
     * carrying a save that says the game already showed it to them.
     */
    expect(untouched().onceFlags).toEqual(LIVED_IN_FLAGS)
    expect(wipeAndLoad({ academic: true }).onceFlags).toEqual([])
  })

  it('leaves their island, their animals and their work exactly where they were', () => {
    const after = wipeAndLoad({ academic: true })
    const before = untouched()
    expect(after.flow.pets).toEqual(before.flow.pets)
    expect(after.flow.pets.length).toBeGreaterThan(0)
    expect([...after.flow.island.tiles]).toEqual([...before.flow.island.tiles])
    expect(after.flow.readProgress).toBe(before.flow.readProgress)
    expect(after.flow.sumProgress).toBe(before.flow.sumProgress)
    expect(after.flow.tilesEarned).toBe(before.flow.tilesEarned)
    expect(after.openingSeen).toBe(true)
    expect(after.opened).toEqual(before.opened)
  })

  it('leaves their name alone', () => {
    expect(wipeAndLoad({ academic: true }).childName).toBe(NAME)
  })

  it('does not re-price the land they have left', () => {
    /*
     * `honeymoonFrom` (a live discount, cleared here) and `honeymoonTiles` (a
     * price offset for tiles they already bought) are NOT two halves of one
     * switch. Zeroing the offset would quietly make their next tile dearer —
     * the same half-wipe this card is about, pointing the other way.
     */
    const before = untouched().flow
    const after = wipeAndLoad({ academic: true }).flow
    expect(after.honeymoonTiles).toBe(before.honeymoonTiles)
    expect(sumsForTile(after)).toBe(sumsForTile(before))
  })
})

describe('the name box', () => {
  it('forgets what they are called, so they are asked again', () => {
    expect(wipeAndLoad({ name: true }).childName).toBe('')
  })

  it('takes nothing else with it', () => {
    const after = wipeAndLoad({ name: true })
    const before = untouched()
    expect(after.flow).toEqual(before.flow)
    expect(after.attainment).toEqual(before.attainment)
    expect(after.onceFlags).toEqual(before.onceFlags)
    expect(after.opened).toEqual(before.opened)
    expect(after.openingSeen).toBe(true)
  })
})

describe('the boxes in combination', () => {
  it('leaves what they are working on when the other two go', () => {
    // A child who keeps their maths and starts a fresh island.
    const after = wipeAndLoad({ island: true, name: true })
    expect(after.attainment).toEqual(untouched().attainment)
    expect(after.flow.pets).toEqual([])
    expect(after.childName).toBe('')
  })

  it('leaves their animals when the other two go', () => {
    // A child who keeps their animals but restarts their maths.
    const after = wipeAndLoad({ academic: true, name: true })
    expect(after.flow.pets).toEqual(untouched().flow.pets)
    expect(after.flow.pets.length).toBeGreaterThan(0)
    expect(after.attainment).toEqual(createAttainment())
    expect(after.childName).toBe('')
  })

  it('leaves their name when the other two go', () => {
    const after = wipeAndLoad({ island: true, academic: true })
    expect(after.childName).toBe(NAME)
    expect(after.flow.pets).toEqual([])
    expect(after.attainment).toEqual(createAttainment())
  })

  it('with nothing ticked, changes nothing at all', () => {
    expect(wipeAndLoad({})).toEqual(untouched())
  })

  it('with all three ticked, hands back the island a new child starts on', () => {
    const after = wipeAndLoad({ island: true, academic: true, name: true })
    const fresh = fromSave(null)
    expect(after.flow.pets).toEqual([])
    expect(count(after.flow.island)).toBe(1)
    expect(after.childName).toBe('')
    expect(after.attainment).toEqual(fresh.attainment)
    expect(after.onceFlags).toEqual([])
    expect(after.openingSeen).toBe(false)
  })

  it('keeps the two settings no box asked about', () => {
    /*
     * Colour comfort is an accessibility choice a grown-up made and none of
     * the three questions mentioned, and `persistGranted` is the browser's
     * answer rather than the child's — re-asking for storage would be a worse
     * experience for no gain.
     */
    const all = wipeAndLoad({ island: true, academic: true, name: true })
    expect(all.calmColours).toBe(true)
    expect(all.persistGranted).toBe(true)
  })
})

describe('wipeIsland, over a real store', () => {
  const PROFILE = 'juno'

  const seeded = async () => {
    const store = createLocalStore(mem)
    await store.put(PROFILE, 'save', lived())
    return store
  }

  it('writes the partial wipe to disk, where the next boot finds it', async () => {
    const store = await seeded()
    await wipeIsland(store, PROFILE, box({ academic: true }))
    const after = await loadIsland(store, PROFILE)
    expect(after.attainment).toEqual(createAttainment())
    // And their island survived the trip through the disk, not only through JS.
    expect(after.flow.pets.length).toBeGreaterThan(0)
    expect(after.childName).toBe(NAME)
  })

  it('does not write at all when a grown-up ticked nothing', async () => {
    const store = await seeded()
    const before = mem.getItem('petIsland.v1.juno.save')
    await wipeIsland(store, PROFILE, NOTHING)
    expect(mem.getItem('petIsland.v1.juno.save')).toBe(before)
  })

  it('survives being asked to wipe an island that is not there', async () => {
    const store = createLocalStore(mem)
    await wipeIsland(store, PROFILE, box({ island: true, academic: true, name: true }))
    const after = await loadIsland(store, PROFILE)
    expect(after.flow.pets).toEqual([])
    expect(after.childName).toBe('')
  })
})
