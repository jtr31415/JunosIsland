/**
 * The Animal list, held against the two authorities it refuses to copy.
 *
 * `status.ts` stores nothing: every status on screen is recomputed from
 * `joe/names-audit.json` and from `signoff.ts` on every draw, precisely so the
 * list cannot go stale against them. That decision is what this file tests. So
 * nothing below stubs the roster or `signoffView` — a fixture roster would let
 * the list and the game disagree about which animals exist, which is the one
 * failure the module's header says it was written to prevent.
 *
 * Three things here are load-bearing rather than decorative.
 *
 * `signedOff` first, because after Joe's ruling of 2 August it is about to
 * decide which animals reach the game at all. Every way of NOT being signed off
 * gets its own assertion, because each of them is a way an unapproved creature
 * could slip past a gate that has not been built yet.
 *
 * Then `signed` outranking `untouched`. A creature ticked on the Animals bench
 * but never opened in this editor has no draft, and a naive reading of "no
 * draft" is "not started" — a list that told Joe to redo finished work.
 *
 * Then the shape of the list itself, which is his own wording twice over: *"no
 * saving of drafts in the bottom of the list"* is the one-row-per-animal test,
 * and *"group them by collection, so i can prioritize"* is the ship-order test.
 * Both are asserted against the real roster, whose declared order and whose ship
 * order genuinely differ — Home Pets is declared eighth and ships second — so
 * getting that right is not something a passing test could do by accident.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SIGNED_OFF, auditIdFor, signedOff, statusOf, subjectGroups, rowLabel,
  collectionName, OFF_ROSTER, STATUSES, STATUS_LABEL,
  type AuditRow, type DraftRow, type Status, type SubjectGroup, type SubjectInput,
} from '../../tools/workbench/public/editor/status'
import { COLLECTIONS, SPECIES_COLLECTION, SPECIES_NAMES, collection } from '../../src/island/species/roster'
import { titleFromId } from '../../tools/workbench/public/editor/signoff'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const auditDoc = JSON.parse(readFileSync(resolve(root, 'joe/names-audit.json'), 'utf8')) as {
  names: readonly (AuditRow & { id: string })[]
}

/* ------------------------------------------------------------- the fixtures --- */

/*
 * Real animals, one per collection this file needs, and their collections are
 * LOOKED UP rather than typed. A test that hard-coded "garden" would keep
 * passing after somebody moved the hedgehog, and would be asserting the wrong
 * thing quietly rather than failing loudly.
 */
const HEDGEHOG = 'animal-hedgehog'
const SQUIRREL = 'animal-squirrel'
const MOUSE = 'animal-mouse'
const HAMSTER = 'animal-hamster'
const ROBIN = 'animal-robin'
const BUTTERFLY = 'animal-butterfly'
const ZEBRA = 'animal-zebra'
const FENNEC = 'animal-fennec-fox'
const UNICORN = 'animal-unicorn'

/** An id the ratified roster has never heard of, and never will. */
const STRAY = 'animal-fen-hare'
const OTHER_STRAY = 'animal-bog-badger'

/** The collection a species belongs to, the roster's answer. */
const groupOf = (speciesId: string): string => SPECIES_COLLECTION[speciesId] ?? ''

/** Where `roster.ts` DECLARES a collection, as against where it ships it. */
const declaredAt = (id: string): number => COLLECTIONS.findIndex(c => c.id === id)

/** A sentence the real fact gate is happy with, so nothing else is masked. */
const GOOD_FACT = 'A hedgehog rolls into a tight ball when it feels afraid.'

const draft = (speciesId: string, fact = GOOD_FACT, givenName = ''): DraftRow =>
  ({ speciesId, givenName, fact })

const tick = (speciesId: string): AuditRow => ({ speciesId, signoff: SIGNED_OFF })

/** The list, with everything the caller did not care about left empty. */
const list = (input: Partial<SubjectInput>): readonly SubjectGroup[] =>
  subjectGroups({ built: [], drafts: [], audit: [], filter: 'all', ...input })

const idsIn = (group: SubjectGroup | undefined): readonly string[] =>
  (group?.rows ?? []).map(r => r.speciesId)

const groupIds = (found: readonly SubjectGroup[]): readonly string[] => found.map(g => g.id)

const find = (found: readonly SubjectGroup[], id: string): SubjectGroup | undefined =>
  found.find(g => g.id === id)

describe('the animals these tests are written around are the roster\'s own', () => {
  /*
   * The honesty guard for everything below. These ids are spelled by hand, and
   * a misspelled one would silently become an off-roster stray — which is a
   * real case this file also tests, so the failure would hide inside a passing
   * assertion instead of announcing itself.
   */
  it('uses real species, and a stray that really is not one', () => {
    for (const id of [HEDGEHOG, SQUIRREL, MOUSE, HAMSTER, ROBIN, BUTTERFLY, ZEBRA, FENNEC, UNICORN]) {
      expect(SPECIES_NAMES[id], id).toBeDefined()
      expect(groupOf(id), id).not.toBe('')
    }
    for (const id of [STRAY, OTHER_STRAY]) {
      expect(SPECIES_NAMES[id], id).toBeUndefined()
      expect(groupOf(id), id).toBe('')
    }
  })
})

/* ------------------------------------------------------------- signed off --- */

describe('signed off is one call, and everything else in the game will ask it', () => {
  it('says yes only to a row that carries his tick for that very animal', () => {
    const audit = [tick(HEDGEHOG)]
    expect(signedOff(audit, HEDGEHOG)).toBe(true)
    expect(signedOff(audit, SQUIRREL), 'another animal\'s tick is not this one\'s').toBe(false)
    expect(signedOff([], HEDGEHOG), 'an empty audit has ticked nothing').toBe(false)
  })

  /*
   * Three separate ways of not being approved, and each one is a way an
   * unapproved creature could reach the game if the check were a truthiness
   * test rather than an equality one. `''` is what a regenerated row carries
   * before he has looked at it; `'reject'` is him having looked and said no;
   * absent is every row in the file today.
   */
  it('says no to an empty verdict, to a rejection, and to a row with no signoff field at all', () => {
    for (const signoff of ['', 'reject', 'ok ', 'OK', 'yes']) {
      expect(signedOff([{ speciesId: HEDGEHOG, signoff }], HEDGEHOG), JSON.stringify(signoff)).toBe(false)
    }
    expect(signedOff([{ speciesId: HEDGEHOG }], HEDGEHOG), 'no signoff field').toBe(false)
  })

  it('says no to an empty species id, so a list with nothing open never reads as approved', () => {
    expect(signedOff([], '')).toBe(false)
    expect(signedOff([{ speciesId: '', signoff: SIGNED_OFF }], '')).toBe(false)
  })

  /*
   * Matched on the species and not on the row id, because the audit is a NAME
   * set — one creature could one day carry a row per colour set — while the
   * tick is on the creature. A check that went looking for `natural/<id>` would
   * answer no for a creature he had plainly signed off.
   */
  it('finds his tick on a row from a name set that does not exist yet', () => {
    const seasonal = { id: 'seasonal/animal-hedgehog', speciesId: HEDGEHOG, signoff: SIGNED_OFF }
    expect(signedOff([seasonal], HEDGEHOG)).toBe(true)
  })

  it('spells the audit row id the way the rows on disk already spell it', () => {
    const sample = auditDoc.names[0]
    expect(sample, 'joe/names-audit.json has no rows to compare against').toBeDefined()
    expect(auditIdFor(sample!.speciesId!)).toBe(sample!.id)
  })

  /*
   * THE ONE THAT IS SUPPOSED TO GO RED ONE DAY.
   *
   * His ruling of 2 August is retroactive: only animals he has signed off reach
   * the game, and none of the thirty built so far has been signed off. So the
   * true statement about this repo today is that the audit contains no tick at
   * all. The day he ticks his first animal this test fails, and that failure is
   * the signal — delete it then, and the gate it was standing in for should be
   * the thing that replaces it.
   */
  it('finds nothing signed off in joe/names-audit.json today, and is meant to go red the day Joe ticks his first animal', () => {
    expect(auditDoc.names.length).toBeGreaterThan(0)
    const ticked = auditDoc.names.filter(row => row.signoff === SIGNED_OFF)
    expect(ticked.map(r => r.speciesId), 'somebody has been signed off — that is news, not a bug').toEqual([])
    for (const row of auditDoc.names) {
      expect(signedOff(auditDoc.names, row.speciesId ?? ''), row.speciesId).toBe(false)
    }
  })
})

/* ----------------------------------------------------------------- status --- */

describe('how far along one animal is, computed and never recorded', () => {
  it('calls an animal nobody has saved untouched', () => {
    expect(statusOf(HEDGEHOG, undefined, [])).toBe('untouched')
  })

  /*
   * `save` records the resolved name whether or not Joe typed one, so in
   * practice the only thing left blocking a saved animal is the fact — which is
   * why `started` and "the fact still needs writing" are almost the same
   * sentence.
   */
  it('calls a saved animal with no fact yet started, not ready', () => {
    expect(statusOf(HEDGEHOG, draft(HEDGEHOG, ''), [])).toBe('started')
  })

  /*
   * Each of these is a sentence the real gate in `tests/island/species-facts.
   * test.ts` would refuse hours later. A list that called any of them `ready`
   * would be telling Joe an animal could be pushed when the push would fail.
   * The rules are `signoff.ts`'s and are deliberately not restated here.
   */
  it('calls a fact the gate would refuse started, however finished it looks', () => {
    const bad = [
      'A hedgehog rolls.',
      'A hedgehog rolls into a tight ball and snuffles about the garden after dark, hunting all night long for slugs and beetles.',
      'A hedgehog rolls up. It eats slugs. It sleeps all winter.',
      'A hedgehog rolls into a tight ball when it feels afraid',
      'A hedgehog has gray spines and rolls into a tight ball.',
    ]
    for (const fact of bad) {
      expect(statusOf(HEDGEHOG, draft(HEDGEHOG, fact), []), fact).toBe('started')
    }
  })

  it('calls a roster animal with a settled name and a good fact ready', () => {
    expect(statusOf(HEDGEHOG, draft(HEDGEHOG), [])).toBe('ready')
  })

  /*
   * `ready` is the state immediately BEFORE approval and must never be mistaken
   * for it — this editor has no tick of its own, and the difference is the whole
   * reason `signedOff` and `statusOf` are separate calls.
   */
  it('keeps ready and signed apart, because this editor has no tick of its own', () => {
    expect(statusOf(HEDGEHOG, draft(HEDGEHOG), [])).toBe('ready')
    expect(statusOf(HEDGEHOG, draft(HEDGEHOG), [tick(HEDGEHOG)])).toBe('signed')
  })

  it('lets his tick outrank a draft that is nowhere near finished', () => {
    expect(statusOf(HEDGEHOG, draft(HEDGEHOG, ''), [tick(HEDGEHOG)])).toBe('signed')
  })

  /*
   * The case the module's header calls out by name. A creature can be ticked on
   * the Animals bench without ever being opened in this editor, so it has no
   * draft — and "no draft" read literally is `untouched`, which would put
   * finished work back on his to-do list.
   */
  it('calls a ticked animal signed even with no draft at all, so finished work never reads as not started', () => {
    expect(statusOf(HEDGEHOG, undefined, [tick(HEDGEHOG)])).toBe('signed')
  })

  /*
   * `signoffView` blocks on an id off the roster — it has no collection, no
   * band and no audited name — so no fact, however good, can make one ready.
   * Off-roster is deliberately not a status of its own: it is which shelf the
   * animal is on, not how far along it is, which is what the stray group below
   * is for.
   */
  it('never calls an animal the ratified roster has not heard of ready, however good its fact', () => {
    expect(statusOf(STRAY, draft(STRAY), [])).toBe('started')
    expect(statusOf(STRAY, undefined, [])).toBe('untouched')
  })

  it('offers the four statuses in work order, each with his words for it', () => {
    expect(STATUSES).toEqual(['untouched', 'started', 'ready', 'signed'])
    expect(Object.keys(STATUS_LABEL).sort()).toEqual([...STATUSES].sort())
    for (const status of STATUSES) expect(STATUS_LABEL[status].length).toBeGreaterThan(0)
  })
})

/* ------------------------------------------------------------------ groups --- */

describe('the list is the animals, once each, and not a pile of saves', () => {
  /*
   * *"no saving of drafts in the bottom of the list"*, in one assertion. The
   * list he had grew a second entry every time he saved; this one cannot,
   * because a draft for an animal already in it is a fact ABOUT that row rather
   * than a row of its own.
   */
  it('shows an animal with a saved draft exactly once, not twice', () => {
    const found = list({ built: [HEDGEHOG, SQUIRREL], drafts: [draft(HEDGEHOG)] })
    const everyRow = found.flatMap(g => g.rows)
    expect(everyRow.filter(r => r.speciesId === HEDGEHOG)).toHaveLength(1)
    expect(everyRow).toHaveLength(2)
    expect(everyRow.find(r => r.speciesId === HEDGEHOG)?.mine, 'his saved edits are marked, not duplicated').toBe(true)
    expect(everyRow.find(r => r.speciesId === SQUIRREL)?.mine).toBe(false)
  })

  it('gives an animal he has only ever drafted a row of its own', () => {
    const found = list({ drafts: [draft(HAMSTER, '')] })
    expect(idsIn(find(found, groupOf(HAMSTER)))).toEqual([HAMSTER])
  })

  it('shows a built animal he has never opened, because that is what needs doing', () => {
    const found = list({ built: [HEDGEHOG] })
    const row = find(found, groupOf(HEDGEHOG))?.rows[0]
    expect(row?.status).toBe('untouched')
    expect(row?.name).toBe(SPECIES_NAMES[HEDGEHOG])
  })
})

describe('collections come back in the order Juno meets them', () => {
  /*
   * Ship order and declaration order genuinely differ, and this test proves it
   * before it relies on it — otherwise a list that simply walked `COLLECTIONS`
   * would pass. Home Pets is declared eighth and ships second; Critters is
   * declared after Africa and ships before it.
   */
  it('orders by ship and not by the order roster.ts happens to declare them', () => {
    const homePets = groupOf(HAMSTER)
    const birds = groupOf(ROBIN)
    const critters = groupOf(BUTTERFLY)
    const africa = groupOf(ZEBRA)

    expect(collection(homePets)!.ship).toBeLessThan(collection(birds)!.ship)
    expect(declaredAt(homePets), 'the two orders must differ, or this test proves nothing')
      .toBeGreaterThan(declaredAt(birds))
    expect(collection(critters)!.ship).toBeLessThan(collection(africa)!.ship)
    expect(declaredAt(critters)).toBeGreaterThan(declaredAt(africa))

    const found = list({ built: [ZEBRA, ROBIN, BUTTERFLY, HAMSTER, HEDGEHOG] })
    expect(groupIds(found)).toEqual([groupOf(HEDGEHOG), homePets, birds, critters, africa])
  })

  /*
   * `groupShapes` in `library.ts` settled this once already: a header over
   * nothing is a scroll stop that teaches Joe the library has a drawer he
   * cannot open. It is live rather than hypothetical here, because most of the
   * twenty collections have nothing built in them at all.
   */
  it('prints no header at all over a collection with nothing in it', () => {
    const found = list({ built: [HEDGEHOG] })
    expect(groupIds(found)).toEqual([groupOf(HEDGEHOG)])
    expect(found.length).toBeLessThan(COLLECTIONS.length)
  })

  it('keeps the roster\'s own member order within a collection, whatever order they arrive in', () => {
    const members = collection(groupOf(HEDGEHOG))!.members
    const three = [HEDGEHOG, SQUIRREL, MOUSE]
    const expected = members.filter(id => three.includes(id))
    expect(expected, 'the fixture must span three members of one collection').toHaveLength(3)

    const found = list({ built: [...three].reverse() })
    expect(idsIn(find(found, groupOf(HEDGEHOG)))).toEqual(expected)
  })
})

describe('the header answers "what still needs doing" before he opens the drawer', () => {
  it('carries the collection, the rows shown and the number still to do', () => {
    const found = list({
      built: [HEDGEHOG, SQUIRREL, MOUSE],
      drafts: [draft(HEDGEHOG)],
      audit: [tick(MOUSE)],
    })
    const garden = find(found, groupOf(HEDGEHOG))!
    expect(garden.todo).toBe(2)
    expect(garden.label).toBe(`${collection(garden.id)!.name} (3) — 2 to do`)
  })

  it('says "all signed off" rather than "0 to do" when a collection is finished', () => {
    const found = list({ built: [HEDGEHOG, SQUIRREL], audit: [tick(HEDGEHOG), tick(SQUIRREL)] })
    const garden = find(found, groupOf(HEDGEHOG))!
    expect(garden.todo).toBe(0)
    expect(garden.label).toBe(`${collection(garden.id)!.name} (2) — all signed off`)
  })

  /* `label` and `todo` are computed separately in the module, so they are two
   * chances to say a different number about the same rows. */
  it('never lets the label and the todo count disagree about the same rows', () => {
    const found = list({
      built: [HEDGEHOG, SQUIRREL, HAMSTER, ROBIN],
      drafts: [draft(HAMSTER), draft(STRAY, '')],
      audit: [tick(SQUIRREL)],
    })
    for (const group of found) {
      expect(group.todo, group.label).toBe(group.rows.filter(r => r.status !== 'signed').length)
      expect(group.label, group.label).toContain(`(${group.rows.length})`)
      expect(group.label, group.label).toContain(group.todo === 0 ? 'all signed off' : `${group.todo} to do`)
    }
  })
})

describe('animals the ratified roster has never heard of', () => {
  /*
   * These are creatures Joe started from scratch under a name the roster does
   * not carry. `signoffView` refuses to push one and says why, so the group's
   * job is to stop him hunting for it among the collections — and it is LAST
   * because it is the shelf nothing on it can leave.
   */
  it('gathers them into their own group, after every collection including the last to ship', () => {
    const found = list({ built: [UNICORN, HEDGEHOG], drafts: [draft(STRAY, '')] })
    expect(groupIds(found)).toEqual([groupOf(HEDGEHOG), groupOf(UNICORN), OFF_ROSTER])
    expect(collection(groupOf(UNICORN))!.ship, 'the collection it follows is the last to ship')
      .toBe(Math.max(...COLLECTIONS.map(c => c.ship)))
    expect(idsIn(found[found.length - 1])).toEqual([STRAY])
  })

  it('does not exist at all when every animal is on the roster', () => {
    const found = list({ built: [HEDGEHOG, HAMSTER], drafts: [draft(HEDGEHOG)] })
    expect(groupIds(found)).not.toContain(OFF_ROSTER)
  })

  /* The header string is written out in `subjectGroups` and again in
   * `collectionName`; two spellings of one shelf is two names for it on screen. */
  it('is named the same way in the header as collectionName names it', () => {
    const found = list({ drafts: [draft(STRAY, '')] })
    expect(find(found, OFF_ROSTER)!.label.startsWith(collectionName(OFF_ROSTER))).toBe(true)
    expect(collectionName(groupOf(HEDGEHOG))).toBe(collection(groupOf(HEDGEHOG))!.name)
  })

  /*
   * Spelled by `signoff.ts`'s own `titleFromId`, and imported from there rather
   * than reproduced. The name-and-fact panel sits two inches to the right of
   * this list and prints the same id; one animal spelled two ways on one screen
   * is the kind of small wrongness that makes a man distrust the rest of it.
   */
  it('spells a stray the way the panel beside it spells the same animal', () => {
    const found = list({ drafts: [draft(STRAY, ''), draft(OTHER_STRAY, '')] })
    const rows = find(found, OFF_ROSTER)!.rows
    expect(rows.map(r => r.name), 'sorted by name, since the roster has no order to offer')
      .toEqual([titleFromId(OTHER_STRAY), titleFromId(STRAY)])
    expect(rows.map(r => r.name)).toEqual(['Bog badger', 'Fen hare'])
    expect(rows.every(r => r.status === 'started')).toBe(true)
  })
})

describe('filtering and grouping compose, instead of leaving a page of empty headers', () => {
  /*
   * The counts are over the rows SHOWN. Under a filter a header claiming the
   * whole collection's totals would be describing a list that is not on screen.
   */
  it('leaves headers over the survivors, counting the filtered view and not the whole collection', () => {
    const input = {
      built: [HEDGEHOG, SQUIRREL, MOUSE, HAMSTER],
      drafts: [draft(HEDGEHOG), draft(HAMSTER)],
    }
    expect(find(list({ ...input, filter: 'all' }), groupOf(HEDGEHOG))!.rows).toHaveLength(3)

    const ready = list({ ...input, filter: 'ready' })
    const garden = find(ready, groupOf(HEDGEHOG))!
    expect(idsIn(garden)).toEqual([HEDGEHOG])
    expect(garden.label).toBe(`${collection(garden.id)!.name} (1) — 1 to do`)
    expect(idsIn(find(ready, groupOf(HAMSTER)))).toEqual([HAMSTER])
  })

  it('drops a group whose every row the filter removed', () => {
    const found = list({
      built: [HEDGEHOG, SQUIRREL, HAMSTER],
      drafts: [draft(HAMSTER)],
      filter: 'ready',
    })
    expect(groupIds(found)).toEqual([groupOf(HAMSTER)])
    expect(groupIds(found), 'nothing in the garden is ready, so the garden is not on screen')
      .not.toContain(groupOf(HEDGEHOG))
  })

  it('returns nothing at all rather than a page of headers when the filter matches no animal', () => {
    expect(list({ built: [HEDGEHOG, HAMSTER], filter: 'signed' })).toEqual([])
  })

  it('filters the stray group too, and takes it away with the rest', () => {
    const input = { built: [HEDGEHOG], drafts: [draft(STRAY, '')] }
    expect(groupIds(list({ ...input, filter: 'started' }))).toEqual([OFF_ROSTER])
    expect(groupIds(list({ ...input, filter: 'untouched' }))).toEqual([groupOf(HEDGEHOG)])
  })

  it('shows every animal once under each of the four filters, and all of them under none', () => {
    const input = {
      built: [HEDGEHOG, SQUIRREL, MOUSE, HAMSTER, ROBIN],
      drafts: [draft(HEDGEHOG), draft(HAMSTER, '')],
      audit: [tick(ROBIN)],
    }
    const all = list({ ...input, filter: 'all' }).flatMap(g => g.rows)
    expect(all).toHaveLength(5)

    const perFilter = STATUSES.flatMap((status: Status) =>
      list({ ...input, filter: status }).flatMap(g => g.rows))
    expect(perFilter.map(r => r.speciesId).sort()).toEqual(all.map(r => r.speciesId).sort())
  })
})

describe('what one row says', () => {
  /*
   * *"i need to see and filter by status, so i can tell from the list what still
   * needs doing"* — a list that needed a click per animal to answer that is the
   * list he already had. An `<option>` cannot carry a badge, so the text does.
   */
  it('puts the status in the row text, so the list answers his question without a click', () => {
    const found = list({
      built: [HEDGEHOG, SQUIRREL, MOUSE],
      drafts: [draft(HEDGEHOG), draft(SQUIRREL, '')],
      audit: [tick(MOUSE)],
    })
    const rows = find(found, groupOf(HEDGEHOG))!.rows
    for (const row of rows) {
      expect(rowLabel(row), row.speciesId).toContain(STATUS_LABEL[row.status])
      expect(rowLabel(row), row.speciesId).toContain(row.name)
    }
    const byId = new Map(rows.map(r => [r.speciesId, rowLabel(r)]))
    expect(byId.get(HEDGEHOG)).toBe(`${SPECIES_NAMES[HEDGEHOG]} · ready to sign off`)
    expect(byId.get(SQUIRREL)).toBe(`${SPECIES_NAMES[SQUIRREL]} · in progress`)
    expect(byId.get(MOUSE)).toBe(`${SPECIES_NAMES[MOUSE]} · signed off`)
  })

  it('reads an untouched animal as not started, in his words rather than a state name', () => {
    const row = list({ built: [FENNEC] }).flatMap(g => g.rows)[0]!
    expect(rowLabel(row)).toBe(`${SPECIES_NAMES[FENNEC]} · not started`)
  })
})
