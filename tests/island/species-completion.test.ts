/**
 * JT-047 — COMPLETION IS MEASURED IN ANIMALS THAT EXIST, AND UNLOCKS RATCHET.
 *
 * Joe, 3 August 2026: *"the unlocker and counters on the page should go of the
 * number of animals pushed on that collection at any one time. i might make
 * some more, needs to be dynamic."*
 *
 * Two things are proved here and they are not the same thing:
 *
 *   1. **The denominator is the BUILT members.** `album.ts:874` had already
 *      switched to counting built animals when PB-083 landed, but
 *      `completion()` still divided by the roster — so the album told a child
 *      "13 of 13" for Night Time while the unlocker read 13/16 = 81% and never
 *      opened her next album. Africa was worse at 1 of 16. Both were masked
 *      only because neither happened to be the collection in progress.
 *   2. **An unlock, once earned, is never taken away** — brief §19. This is the
 *      half that is NOT obvious, and it only exists because of Joe's second
 *      sentence. If he builds two more Night Time animals, a collection that
 *      was 13 of 13 and COMPLETE becomes 13 of 15 and INCOMPLETE. Completion
 *      can therefore FALL, and anything it paid for must not be clawed back.
 *
 * WHERE THE FIXTURES COME FROM. The built counts are read from `built.ts`, the
 * one predicate, so this file cannot drift from what the album draws. Where a
 * case needs a shape today's registry does not have — Joe having built MORE
 * animals, or a collection arriving from zero — the built map is written out
 * explicitly and the test says so. No collection and no species is invented:
 * every id used here is a real roster id.
 */
import { describe, it, expect } from 'vitest'
import {
  completion, isComplete, activeIds, candidates, nextToOpen, heldBack,
  MAX_ACTIVE, HELD_BACK_BY_JOE,
} from '../../src/island/species/unlock'
import type { UnlockState } from '../../src/island/species/unlock'
import { advance, NOTHING_OPENED, BASE_COLLECTION } from '../../src/island/species/opened'
import type { Opened } from '../../src/island/species/opened'
import { COLLECTIONS, collection } from '../../src/island/species/roster'
import { builtIn } from '../../src/island/species/built'
import { mulberry32 } from '../../src/core/rng'

/** Today's real built counts, from the one predicate the album also reads. */
const REAL: Record<string, number> = {}
for (const c of COLLECTIONS) REAL[c.id] = builtIn(c.id).length

function state(o: Partial<UnlockState> & { open: readonly string[] }): UnlockState {
  return {
    owned: {}, lastOpened: null, roster: COLLECTIONS,
    built: REAL, everCompleted: [], ...o,
  }
}

/** How many animals a collection actually has today. Absent reads as none. */
const built = (id: string): number => REAL[id] ?? 0

/** Every collection that has at least one animal in it today. */
const LIVE = COLLECTIONS.map(c => c.id).filter(id => built(id) > 0)

/* ------------------------------------------------------------------ */

describe('completion counts the animals that exist, not the ones the roster plans', () => {
  it('finishes Home Pets at fifteen, because fifteen is all there are', () => {
    /*
     * THE EXACT BUG JT-047 CLOSED, written as the numbers that cause it today.
     * Sixteen rostered, fifteen a child can be dealt — `animal-rat` is built and
     * Joe has not pushed it. Dividing by the ROSTER this reads 15/16 = 0.9375:
     * over `OPEN_AT`, so it keeps triggering, but never 1, so it never completes,
     * never frees its slot, and holds one of MAX_ACTIVE's four for good.
     *
     * >>> The example was Night Time at 13 of 16 until 4 August, when the album
     * >>> and the unlocker moved from BUILT to RELEASED and Night Time went to
     * >>> zero — built end to end, pushed nowhere. Home Pets is the live case
     * >>> now, and it is the same shape for a better reason: the gap is one Joe
     * >>> has not pushed rather than one nobody can model.
     */
    expect(collection('home-pets')!.members).toHaveLength(16)
    expect(REAL['home-pets']).toBe(15)

    const s = state({ open: ['home-pets'], owned: { 'home-pets': 15 } })
    expect(completion(s, 'home-pets')).toBe(1)
    expect(isComplete(s, 'home-pets')).toBe(true)
    // The old answer, named so a regression is recognisable rather than merely red.
    expect(15 / 16).toBeCloseTo(0.9375, 4)
  })

  it('gives a collection with nothing pushed no route to completion at all', () => {
    /* Africa used to be the "1 of 16, and no route to 100%" case. It is 0 of 16
     * now — built and unpushed — so it is not offered at all, which is
     * `unlock.ts`'s hold rather than a completion question. Asserted here so the
     * two files cannot drift about what zero means. */
    expect(REAL['africa']).toBe(0)
    expect(REAL['night-time']).toBe(0)
    expect(REAL['farm']).toBe(0)
  })

  it('lets a child finish EVERY live collection by owning what exists', () => {
    /*
     * The general form, and the one that keeps this true as Farm lands: owning
     * every built member of a collection is being finished with it. This is the
     * property that failed before — for Night Time and Africa it was
     * unreachable — and it is asserted over the real registry rather than over
     * a list, so a new collection is covered the day it appears.
     */
    for (const id of LIVE) {
      const s = state({ open: [id], owned: { [id]: built(id) } })
      expect(completion(s, id), id).toBe(1)
      expect(isComplete(s, id), id).toBe(true)
    }
  })

  it('is not fooled by owning a species whose model has since been deleted', () => {
    // PB-036 deleted fifty-nine species without touching the roster, so `owned`
    // can exceed `built`. It clamps rather than reading over 1.
    const s = state({ open: ['africa'], owned: { africa: 9 } })
    expect(completion(s, 'africa')).toBe(1)
  })

  it('reads a collection with nothing built as 1, so it cannot wedge a slot', () => {
    /*
     * DELIBERATE, AND THE OPPOSITE OF WHAT IT LOOKS LIKE. 1 means "there is
     * nothing left to collect here", so a dead album frees its slot. 0 would
     * hold one of Joe's four open forever with an empty album in it, which is
     * the PB-058 wedge `opened.ts` step 0 was written to undo by hand.
     */
    expect(REAL['ocean']).toBe(0)
    const s = state({ open: ['ocean'], owned: {} })
    expect(completion(s, 'ocean')).toBe(1)
    expect(activeIds(s)).not.toContain('ocean')
  })

  it('still reads an id the roster has never heard of as 0, not as empty', () => {
    const s = state({ open: ['no-such-collection'], owned: {} })
    expect(completion(s, 'no-such-collection')).toBe(0)
  })
})

/* ------------------------------------------------------------------ */

describe('the hold on unbuilt collections is now derived, so it cannot rot', () => {
  it('refuses exactly the collections with nothing built, plus Joe\'s three', () => {
    for (const c of COLLECTIONS) {
      const expected = HELD_BACK_BY_JOE.includes(c.id) || REAL[c.id] === 0
      expect(heldBack(REAL, c.id), c.id).toBe(expected)
    }
  })

  it('offers a collection the moment it has one animal, with no list to edit', () => {
    /*
     * THE WOODLAND CASE. This is the whole reason the hand-written
     * `NOT_BUILT_YET` was deleted: it had to be edited by a person, and its
     * tripwire measured `shippedIn` — REGISTERED RECORDS — which goes positive
     * when a collection's records are committed and before a single animal is
     * modelled. Obeying it would have handed a child an album the album view
     * itself refuses to draw one frame of.
     *
     * >>> THIS WAS WRITTEN AS THE FARM CASE, BEFORE FARM LANDED — and it did its
     * >>> job. Farm arrived whole on 3 August (PB-074, sixteen of sixteen), so
     * >>> `farm` is no longer a collection with nothing built and cannot stand
     * >>> for one. `woodland` takes over: no records, no models, not on Joe's
     * >>> list. Note what did NOT have to change to make Farm offerable — the
     * >>> hold is arithmetic over live built counts, so sixteen new species
     * >>> released Farm on their own and no list was edited, which is precisely
     * >>> the property this test was written to protect.
     */
    expect(REAL['woodland']).toBe(0)
    expect(heldBack(REAL, 'woodland')).toBe(true)

    // Woodland with a single animal built. Nothing else changes; no list touched.
    const withOneWoodlandAnimal = { ...REAL, woodland: 1 }
    expect(heldBack(withOneWoodlandAnimal, 'woodland')).toBe(false)

    const s = state({ open: [BASE_COLLECTION], built: withOneWoodlandAnimal })
    expect(candidates(s)).toContain('woodland')
  })

  it('never offers a collection with nothing built, however the pool is shaped', () => {
    const s = state({ open: [BASE_COLLECTION] })
    for (const id of candidates(s)) expect(REAL[id], id).toBeGreaterThan(0)
  })
})

/* ------------------------------------------------------------------ */

describe('THE RATCHET — a finished album is never unfinished by a content push', () => {
  /*
   * Joe: *"i might make some more."* So this is not a hypothetical. `built` can
   * RISE, and every number that divides by it can therefore FALL.
   *
   * The fixture is his exact stated case: Night Time is 13 of 13 and she has
   * finished it. He then builds the bat and the sugar glider, so it becomes 13
   * of 15. Nothing she owns changed.
   */
  const AFTER_PUSH: Record<string, number> = { ...REAL, 'night-time': 15 }
  const OWNS_ALL_NIGHT = { 'night-time': 13 }

  it('shows her the HONEST counter — the number moves, and it should', () => {
    const s = state({
      open: ['night-time'], owned: OWNS_ALL_NIGHT,
      built: AFTER_PUSH, everCompleted: ['night-time'],
    })
    // 13 of 15. She is told the truth and can go and collect the two new ones.
    expect(completion(s, 'night-time')).toBeCloseTo(13 / 15, 6)
    expect(completion(s, 'night-time')).toBeLessThan(1)
  })

  it('keeps it COMPLETE anyway, so the slot she earned is not taken back', () => {
    const s = state({
      open: ['night-time'], owned: OWNS_ALL_NIGHT,
      built: AFTER_PUSH, everCompleted: ['night-time'],
    })
    expect(isComplete(s, 'night-time')).toBe(true)
    expect(activeIds(s)).not.toContain('night-time')
  })

  it('AND THE RATCHET IS WHAT DOES IT — the same state without the record fails', () => {
    /*
     * The orders require that a fix be watched to fail when reverted. Reverting
     * this one is deleting the `everCompleted` entry, so both states are built
     * here and contrasted. Without the record she is put back to work on an
     * album she had finished, and it retakes one of MAX_ACTIVE's four slots.
     */
    const withRatchet = state({
      open: ['night-time'], owned: OWNS_ALL_NIGHT,
      built: AFTER_PUSH, everCompleted: ['night-time'],
    })
    const without = state({
      open: ['night-time'], owned: OWNS_ALL_NIGHT,
      built: AFTER_PUSH, everCompleted: [],
    })

    expect(isComplete(withRatchet, 'night-time')).toBe(true)
    expect(isComplete(without, 'night-time')).toBe(false)
    expect(activeIds(withRatchet)).not.toContain('night-time')
    expect(activeIds(without)).toContain('night-time')
  })

  it('does not let a content push silently stop her being given new albums', () => {
    /*
     * THE FAILURE THE RATCHET EXISTS FOR, AND IT LANDS AT THE MOMENT OF
     * TRIUMPH. The game teaches one rule — finish an album and a new one
     * appears. She holds four active albums and has finished a fifth, so a slot
     * is free and the cadence owes her a draw. Joe then pushes two animals into
     * the finished one. Without the ratchet that collection silently becomes
     * active again, the count is back at the cap, and the next album she earns
     * never comes. Nobody at the screen could explain it.
     *
     * The built map is written out rather than measured because the case needs
     * a pool wider than today's four collections, and the RULE is what is under
     * test, not this week's registry.
     */
    const wide: Record<string, number> = {
      ...REAL, farm: 16, woodland: 16, ocean: 16, 'night-time': 15,
    }
    /* Every slot but one still being worked on, plus the one she finished. That
     * is the whole shape of the promise: completing the last of them is what
     * frees a slot, so the ratchet has to hold her one BELOW the cap.
     *
     * Sized off `MAX_ACTIVE` rather than typed out, because the cap went from
     * four to three on 4 August ("have 3 albums on the go") and this test is
     * about the ratchet, not about the number. */
    const open = ['base', 'garden', 'home-pets', 'night-time']
      .slice(0, MAX_ACTIVE - 1).concat('night-time')
    // Night Time finished at the OLD count of thirteen; the rest barely started.
    const owned = { base: 1, garden: 1, 'home-pets': 1, 'night-time': 13 }

    const withRatchet = state({
      open, owned, built: wide, everCompleted: ['night-time'], lastOpened: 'night-time',
    })
    const without = state({
      open, owned, built: wide, everCompleted: [], lastOpened: 'night-time',
    })

    // The freed slot is the thing at stake, and it is exactly one slot.
    expect(activeIds(withRatchet)).toHaveLength(MAX_ACTIVE - 1)
    expect(activeIds(without)).toHaveLength(MAX_ACTIVE)

    // With the ratchet she is still owed her album. Without it, nothing comes.
    expect(nextToOpen(withRatchet, mulberry32(7))).not.toBeNull()
    expect(nextToOpen(without, mulberry32(7))).toBeNull()
  })

  it('keeps the 80% trigger satisfied even when the push drops it below 80%', () => {
    /*
     * The subtle half. Rule 2 asks for something open at or above `OPEN_AT`, and
     * a completed collection used to satisfy it by sitting at 100%. If Joe adds
     * SIX animals, a finished 14 becomes 14/20 = 70% — under the threshold. Rule
     * 1 would already have freed her slot on the strength of the ratchet, and
     * rule 2 would then refuse to fill it: owed an album by one half of the rule
     * and denied it by the other. Both halves ratchet, so this holds.
     */
    const wide: Record<string, number> = { ...REAL, garden: 20, farm: 16, ocean: 16 }
    const s = state({
      open: ['base', 'garden'], owned: { base: 0, garden: 14 },
      built: wide, everCompleted: ['garden'],
    })
    expect(completion(s, 'garden')).toBeCloseTo(0.7, 6)
    expect(isComplete(s, 'garden')).toBe(true)
    expect(nextToOpen(s, mulberry32(3))).not.toBeNull()
  })
})

/* ------------------------------------------------------------------ */

describe('advance records completions, and never takes an album back', () => {
  /** Every built species of a collection, so `ownedByCollection` counts it. */
  const speciesOf = (id: string): string[] => [...builtIn(id)]

  it('writes a completion into the save the moment it happens', () => {
    const owned = speciesOf('night-time')
    const out = advance(owned, NOTHING_OPENED, mulberry32(11), REAL)
    // She cannot have night-time recorded unless it was open; advance seeds four.
    if (out.open.includes('night-time')) {
      expect(out.completed).toContain('night-time')
    }
    expect(out.completed.every(id => out.open.includes(id))).toBe(true)
  })

  it('never removes an id from the completed record, however built moves', () => {
    /* Home Pets since 4 August — Night Time is 0 released and so cannot be
     * completed at all now. The property is unchanged and so is the point:
     * finishing a set is permanent, whatever Joe pushes afterwards. */
    const owned = speciesOf('home-pets')
    const first: Opened = {
      open: [BASE_COLLECTION, 'home-pets'], lastOpened: 'home-pets', completed: [],
    }
    const done = advance(owned, first, mulberry32(5), REAL)
    expect(done.completed).toContain('home-pets')

    // Joe pushes the rat. The record survives; the album survives.
    const after = advance(owned, done, mulberry32(5), { ...REAL, 'home-pets': 16 })
    expect(after.completed).toContain('home-pets')
    expect(after.open).toContain('home-pets')
    for (const id of done.open) expect(after.open, id).toContain(id)
  })

  it('NEVER records a collection that has nothing built as finished', () => {
    /*
     * The guard that stops the slot-freeing rule leaking into the permanent
     * record. `completion` reads 1 for a collection with nothing built, on
     * purpose — but owning nothing from an empty album is not an achievement,
     * and writing it down would mean that if Joe later BUILT that collection it
     * would count as finished forever while she owned none of it.
     */
    const openWithDead: Opened = {
      open: [BASE_COLLECTION, 'ocean'], lastOpened: 'ocean', completed: [],
    }
    expect(REAL['ocean']).toBe(0)
    const out = advance([], openWithDead, mulberry32(2), REAL)
    expect(out.completed).not.toContain('ocean')
  })

  it('is idempotent on the completed record as well as on the open one', () => {
    const owned = speciesOf('home-pets')
    const once = advance(owned, NOTHING_OPENED, mulberry32(9), REAL)
    const twice = advance(owned, once, mulberry32(9), REAL)
    expect([...twice.completed].sort()).toEqual([...once.completed].sort())
    expect(twice.open).toEqual(once.open)
  })

  it('keeps an album from a LATER build that this one has never heard of', () => {
    /*
     * BRIEF §19, AND THE SHARPEST CASE OF IT, because the loss would be
     * PERMANENT AND SILENT. `save.ts`'s `readOpened` deliberately keeps
     * collection ids this build does not know — its comment says dropping them
     * "would mean a downgrade, then an upgrade, silently loses an album they
     * had already been given" — and `albumsToShow` drops them from the VIEW
     * only. But `main.ts` writes whatever `advance` returns straight back
     * through `toSave`, so anything `advance` prunes is gone from disk for good.
     *
     * JT-047 nearly broke this. The prune's first condition used to be a
     * membership test against a hand-written list, which by construction held
     * only ids this build knew, so an unknown id was never a candidate for it.
     * Deriving the hold from built COUNTS silently changed that: an id nobody
     * here has heard of has no count, so it reads as held back AND as owning
     * nothing, and both prune conditions fire. A child who opened Atlantis on a
     * newer build and then launched an older one would have lost it forever.
     *
     * The prune may only judge collections this build actually knows.
     */
    const fromTheFuture: Opened = {
      open: [BASE_COLLECTION, 'garden', 'atlantis'],
      lastOpened: 'atlantis',
      completed: [],
    }
    const out = advance(speciesOf('garden'), fromTheFuture, mulberry32(6), REAL)
    expect(out.open).toContain('atlantis')
  })

  it('keeps a COMPLETION recorded by a later build, for the same reason', () => {
    const fromTheFuture: Opened = {
      open: [BASE_COLLECTION, 'atlantis'],
      lastOpened: 'atlantis',
      completed: ['atlantis'],
    }
    const out = advance([], fromTheFuture, mulberry32(6), REAL)
    expect(out.completed).toContain('atlantis')
  })

  it('keeps every album a save arrived with, even as built counts move', () => {
    /*
     * BRIEF §19 AS A PROPERTY RATHER THAN A CASE. Whatever the built map does,
     * an album she has been given stays given — the only ids `advance` may drop
     * are held-back ones she owns NOTHING from, and here she owns something in
     * each. Run across a moving built map so a future change to the prune has
     * to come past this test.
     */
    /* The pair moved from garden+africa to garden+home-pets on 4 August, because
     * Africa has nothing released and a child cannot own something in it. The
     * property is the same and the maps below still move underneath it — one of
     * them takes garden to ZERO, which is the case that matters most. */
    const owned = [...speciesOf('garden'), ...speciesOf('home-pets')]
    const start: Opened = {
      open: [BASE_COLLECTION, 'garden', 'home-pets'], lastOpened: 'home-pets', completed: [],
    }
    const maps = [
      REAL,
      { ...REAL, garden: 20 },
      { ...REAL, africa: 16, farm: 16 },
      { ...REAL, garden: 0 },
    ]
    let at = start
    for (const map of maps) {
      const next = advance(owned, at, mulberry32(4), map)
      for (const id of ['garden', 'home-pets', BASE_COLLECTION]) {
        expect(next.open, `${id} survives`).toContain(id)
      }
      at = next
    }
  })
})
