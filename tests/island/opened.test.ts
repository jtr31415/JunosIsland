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
import { shippedIn } from '../../src/island/species/registry'
import { toSave, fromSave, readOpened } from '../../src/island/save'
import { createFlow } from '../../src/island/flow'
import type { Pet } from '../../src/island/flow'

const rng = (): ReturnType<typeof mulberry32> => mulberry32(20260801)

const BASE = collection('base')?.members ?? []

const pet = (species: string, n = 0): Pet =>
  ({ id: `${species}-${n}`, name: `friend ${n}`, species, at: { q: 0, r: 0 } })

/** Every species of a collection, as if the child had collected the lot. */
const allOf = (id: string): string[] => [...(collection(id)?.members ?? [])]

describe('what counts as owned', () => {
  it('counts species, not pets', () => {
    /*
     * The whole of "one slot per species" as arithmetic. Four foxes is one fox
     * as far as an album is concerned, and if it were not, a child who had
     * exhausted the base pack could push a collection past 100% on duplicates
     * and open an album for animals they had never met.
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
    // The first half of Joe's sentence. Under the cadence alone they would see
    // one album until they owned twenty of the twenty-four.
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
    /*
     * "random order" (JT-027). If every island opened the same three beside
     * base, the playground currency roster §3 is after would be worthless.
     *
     * THE PROPERTY IS WEAKER THAN IT LOOKS SINCE PB-058, and the two seeds are
     * now chosen rather than arbitrary. Three drawn from a pool of five is ten
     * combinations before order, so two children colliding outright is common
     * and would be no evidence of a bug — it is the true consequence of only
     * five collections having any animals built. What this can still honestly
     * prove is that the seed reaches the draw at all, which is what it proves.
     * The property gets its strength back when the pool does.
     */
    const a = advance([], NOTHING_OPENED, mulberry32(1)).open.join()
    const b = advance([], NOTHING_OPENED, mulberry32(9)).open.join()
    expect(a).not.toBe(b)
  })

  it('opens nothing but albums that actually have animals in them', () => {
    // PB-058 stated directly, at the seam where a child would meet it: before
    // this, four drawn at random from twenty-one meant most of what they opened
    // was a page of empty frames.
    for (let seed = 1; seed < 40; seed++) {
      const opened = advance([], NOTHING_OPENED, mulberry32(seed))
      for (const id of opened.open) {
        expect(shippedIn(id).length, `${id} was opened with no models built`)
          .toBeGreaterThan(0)
      }
    }
  })
})

describe('and then nothing, until they finish one', () => {
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
    // The finished one is still there — see `albumsToShow`. The child keeps
    // their trophy; it simply stops occupying a slot.
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

    /*
     * DERIVED, not `MAX_ACTIVE + 2`, since 2 Aug. Two completions used to earn
     * two more albums outright, and that assumed there were always two more to
     * give. Deleting the 59 kit-built species left FIVE collections with any
     * animals in them at all — base, garden, home-pets, africa, night-time — so
     * the loop now runs out of pool before it runs out of entitlement.
     *
     * Computed rather than typed as 5 so this corrects itself the moment a
     * collection is rebuilt on the assembly route, which is the whole plan. The
     * behaviour under test is unchanged: it catches up on both completions at
     * once rather than one per call, and that is what the `Math.min` still
     * proves as long as the pool is the binding limit.
     */
    const withAnimals = COLLECTIONS.filter(c => shippedIn(c.id).length > 0).length
    expect(opened.open).toHaveLength(Math.min(MAX_ACTIVE + 2, withAnimals))
  })
})

describe('the save they are already carrying, with albums that were never worth giving', () => {
  /*
   * The half of PB-058 that a one-line change to HELD_BACK does not touch.
   * Juno's live save has up to three empty collections open right now, and they
   * are not merely ugly — they are permanent. `completion` divides what the
   * child owns by the ROSTER size, so a collection with no models sits at 0%
   * forever, never completes, never stops being active, and holds one of Joe's
   * four slots for good. Three of them and Juno has one working slot and is
   * never given another album for the rest of the game.
   */
  const STUCK = { open: ['base', 'ocean', 'ice', 'jungle'], lastOpened: 'jungle' }

  it('takes back the empty albums and gives the child live ones in their place', () => {
    const after = advance(['animal-fox'], STUCK, rng())
    for (const id of ['ocean', 'ice', 'jungle']) expect(after.open).not.toContain(id)
    expect(after.open).toContain(BASE_COLLECTION)
    expect(after.open).toHaveLength(MAX_ACTIVE)
    expect(activeCount(['animal-fox'], after)).toBe(MAX_ACTIVE)
    for (const id of after.open) expect(shippedIn(id).length).toBeGreaterThan(0)
  })

  it('loses the child nothing they own — brief §19 — because base is untouched', () => {
    const after = advance(BASE.slice(0, 5), STUCK, rng())
    expect(after.open).toContain(BASE_COLLECTION)
    // The count they had is the count they have. Nothing about the prune ever
    // reaches their pets; it only removes a page they could not collect from.
    expect(ownedByCollection(BASE.slice(0, 5))[BASE_COLLECTION]).toBe(5)
  })

  it('KEEPS a held-back album they have already collected from, which is the §19 guard', () => {
    /*
     * The case the (b) guard exists for, and it is built out of real roster data
     * rather than a mock: `animal-unicorn` is a genuine member of `legendary` in
     * `roster.ts`, so `ownedByCollection` gives them a real count of 1 there even
     * though not one legendary species has been modelled yet. That is exactly
     * the shape of the day Joe releases `legendary` to a child who already has
     * some of it — and on that day an (a)-only prune would take their unicorn's
     * page off the shelf. It does not.
     */
    expect(HELD_BACK).toContain('legendary')
    const owning = { open: [BASE_COLLECTION, 'legendary'], lastOpened: 'legendary' }
    const after = advance(['animal-unicorn'], owning, rng())
    expect(after.open).toContain('legendary')
    expect(after.open).toHaveLength(MAX_ACTIVE)
  })

  it('leaves lastOpened alone even when it names an album that has just gone', () => {
    // It is still an honest record of what was drawn last, and `RELATED_GROUP`
    // is total over every non-base id, so the relatedness rule resolves against
    // a pruned id perfectly well. Rewriting it would be a second lie.
    const after = advance([], { open: ['base', 'ocean'], lastOpened: 'ocean' }, rng())
    expect(after.open).not.toContain('ocean')
    expect(after.lastOpened).not.toBeNull()
  })

  it('is idempotent across the prune — the second arrival changes nothing', () => {
    /*
     * The prune could in principle oscillate: drop three, refill three, drop
     * them again next time. It cannot, and this is the proof. Everything the
     * prune removes is in `HELD_BACK`, and everything the refill draws comes
     * from `candidates`, which filters `HELD_BACK` out — so no pruned id can be
     * drawn back into the hole it left, and the second call finds nothing to
     * take. `main.ts` calls `advance` on every arrival, so an oscillation would
     * reshuffle their albums every time they came back to the island.
     */
    const once = advance(['animal-fox'], STUCK, rng())
    const twice = advance(['animal-fox'], once, rng())
    expect(twice.open).toEqual(once.open)
    expect(twice.lastOpened).toBe(once.lastOpened)
  })

  it('never lets the cadence run past the cap however many arrivals there are', () => {
    let opened = advance(['animal-fox'], STUCK, rng())
    for (let i = 0; i < 20; i++) {
      opened = advance(['animal-fox'], opened, rng())
      expect(activeCount(['animal-fox'], opened)).toBeLessThanOrEqual(MAX_ACTIVE)
    }
    expect(opened.open).toHaveLength(MAX_ACTIVE)
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
    // open, not be refused. Refusing costs the child their island.
    const flow = { ...createFlow(), pets: [] as Pet[] }
    const save = toSave(flow, true) as unknown as Record<string, unknown>
    delete save.openCollections
    delete save.lastOpened
    const back = fromSave(save as unknown as Parameters<typeof fromSave>[0])
    expect(back.opened).toEqual(NOTHING_OPENED)
    expect(advance([], back.opened, rng()).open).toHaveLength(MAX_ACTIVE)
  })
})
