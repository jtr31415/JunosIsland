/**
 * FOUR ALBUMS, ALWAYS, AND THE FIFTH ONLY FOR FINISHING ONE.
 *
 * Joe, 1 Aug: *"4 albums always on show, next one shows when one is completed."*
 * Both halves of that sentence are load-bearing and they pull in opposite
 * directions — the first wants collections opened for free, the second wants
 * them earned — so this file asserts them together rather than one at a time.
 *
 * `unlock.ts` already has twenty-seven tests and they are not repeated here.
 * What is new is the wiring: what counts as owned, when the rules run, and
 * whether the answer survives a save. The interesting failures all live in that
 * seam, not in the rules.
 */
import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../../src/core/rng'
import {
  advance, albumsToShow, activeCount, ownedByCollection, BASE_COLLECTION,
  NOTHING_OPENED,
} from '../../src/island/species/opened'
import { MAX_ACTIVE, HELD_BACK } from '../../src/island/species/unlock'
import { COLLECTIONS, collection } from '../../src/island/species/roster'
import { toSave, fromSave, readOpened } from '../../src/island/save'
import { createFlow } from '../../src/island/flow'
import type { Pet } from '../../src/island/flow'

const rng = (): ReturnType<typeof mulberry32> => mulberry32(20260801)

const BASE = collection('base')?.members ?? []

const pet = (species: string, n = 0): Pet =>
  ({ id: `${species}-${n}`, name: `friend ${n}`, species, at: { q: 0, r: 0 } })

/** Every species of a collection, as if she had collected the lot. */
const allOf = (id: string): string[] => [...(collection(id)?.members ?? [])]

describe('what counts as owned', () => {
  it('counts species, not pets', () => {
    /*
     * The whole of "one slot per species" as arithmetic. Four foxes is one fox
     * as far as an album is concerned, and if it were not, a child who had
     * exhausted the base pack could push a collection past 100% on duplicates
     * and open an album for animals she had never met.
     */
    const owned = ownedByCollection(['animal-fox', 'animal-fox', 'animal-fox'])
    expect(owned[BASE_COLLECTION]).toBe(1)
  })

  it('ignores a species from a build this one has never heard of', () => {
    const owned = ownedByCollection(['animal-fox', 'animal-from-the-future'])
    expect(owned[BASE_COLLECTION]).toBe(1)
    expect(Object.values(owned).reduce((a, b) => a + b, 0)).toBe(1)
  })
})

describe('a fresh island', () => {
  it('opens four albums straight away, base among them', () => {
    // The first half of Joe's sentence. Under the cadence alone she would see
    // one album until she owned twenty of the twenty-four.
    const opened = advance([], NOTHING_OPENED, rng())
    expect(opened.open).toHaveLength(MAX_ACTIVE)
    expect(opened.open[0]).toBe(BASE_COLLECTION)
    expect(activeCount([], opened)).toBe(MAX_ACTIVE)
  })

  it('never seeds one Joe is holding back', () => {
    for (let seed = 1; seed < 40; seed++) {
      const opened = advance([], NOTHING_OPENED, mulberry32(seed))
      for (const id of opened.open) expect(HELD_BACK).not.toContain(id)
    }
  })

  it('seeds four that actually exist in the roster', () => {
    const known = new Set(COLLECTIONS.map(c => c.id))
    const opened = advance([], NOTHING_OPENED, rng())
    for (const id of opened.open) expect(known.has(id)).toBe(true)
    expect(albumsToShow(opened)).toHaveLength(MAX_ACTIVE)
  })

  it('draws a different four for different children', () => {
    // "random order" (JT-027). If every island opened the same three beside
    // base, the playground currency roster §3 is after would be worthless.
    const a = advance([], NOTHING_OPENED, mulberry32(1)).open.join()
    const b = advance([], NOTHING_OPENED, mulberry32(9)).open.join()
    expect(a).not.toBe(b)
  })
})

describe('and then nothing, until she finishes one', () => {
  it('stays at four however many friends come home', () => {
    /*
     * The second half of the sentence, and the case that would break if the
     * seeding ever ran again: twenty-three of twenty-four is past the 80% mark,
     * so rule 2 is satisfied and only the cap is holding the line.
     */
    const opened = advance([], NOTHING_OPENED, rng())
    const nearly = BASE.slice(0, BASE.length - 1)
    const after = advance(nearly, opened, rng())
    expect(after.open).toHaveLength(MAX_ACTIVE)
  })

  it('opens exactly one more when a collection is completed', () => {
    const opened = advance([], NOTHING_OPENED, rng())
    const after = advance(allOf(BASE_COLLECTION), opened, rng())
    expect(after.open).toHaveLength(MAX_ACTIVE + 1)
    // The finished one is still there — see `albumsToShow`. She keeps her
    // trophy; it simply stops occupying a slot.
    expect(after.open).toContain(BASE_COLLECTION)
    expect(activeCount(allOf(BASE_COLLECTION), after)).toBe(MAX_ACTIVE)
  })

  it('is idempotent — called again with the same friends it adds nobody', () => {
    // main.ts calls `advance` on every arrival rather than on an event, so a
    // second call that opened a fifth album would open one per hatch.
    const once = advance(allOf(BASE_COLLECTION), advance([], NOTHING_OPENED, rng()), rng())
    const twice = advance(allOf(BASE_COLLECTION), once, rng())
    expect(twice.open).toEqual(once.open)
  })

  it('catches up on several completions at once', () => {
    /*
     * A save can arrive behind: a build that was away for a version, or a child
     * who finished two albums in one sitting. The cadence is a loop for this.
     */
    let opened = advance([], NOTHING_OPENED, rng())
    const two = opened.open.slice(0, 2)
    const owned = [...allOf(two[0] as string), ...allOf(two[1] as string)]
    opened = advance(owned, opened, rng())
    expect(opened.open).toHaveLength(MAX_ACTIVE + 2)
  })
})

describe('a save that lost its roster', () => {
  it('puts base back rather than leaving a hole', () => {
    const opened = advance([], { open: ['garden'], lastOpened: 'garden' }, rng())
    expect(opened.open).toContain(BASE_COLLECTION)
  })

  it('keeps ids this build has never heard of on disk, and hides them on screen', () => {
    /*
     * A later build opens an album today's roster does not have. Dropping it on
     * read would mean a downgrade, then an upgrade, silently takes an album away
     * — and the slot with it, so a different one is drawn in its place.
     */
    const read = readOpened(['base', 'atlantis'], 'atlantis')
    expect(read.open).toContain('atlantis')
    expect(albumsToShow(read)).not.toContain('atlantis')
  })

  it('reads junk as a fresh roster rather than throwing', () => {
    expect(readOpened(undefined, undefined)).toEqual(NOTHING_OPENED)
    expect(readOpened([1, {}, null], 42)).toEqual(NOTHING_OPENED)
    expect(readOpened(['garden', 'garden'], 'garden').open).toEqual(['garden'])
  })
})

describe('through the save and back', () => {
  it('round-trips the four, in the order they were opened', () => {
    const opened = advance([], NOTHING_OPENED, rng())
    const flow = { ...createFlow(), pets: [pet('animal-fox')] }
    const back = fromSave(toSave(flow, true, 'Juno', null, undefined, undefined, false, opened))
    expect(back.opened.open).toEqual(opened.open)
    expect(back.opened.lastOpened).toBe(opened.lastOpened)
  })

  it('a save written before this field existed reads as a fresh roster', () => {
    // The reason this is additive and not a version bump: an older save must
    // open, not be refused. Refusing costs the child her island.
    const flow = { ...createFlow(), pets: [] as Pet[] }
    const save = toSave(flow, true) as unknown as Record<string, unknown>
    delete save.openCollections
    delete save.lastOpened
    const back = fromSave(save as unknown as Parameters<typeof fromSave>[0])
    expect(back.opened).toEqual(NOTHING_OPENED)
    expect(advance([], back.opened, rng()).open).toHaveLength(MAX_ACTIVE)
  })
})
