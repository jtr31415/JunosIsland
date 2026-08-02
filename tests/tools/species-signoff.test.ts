/**
 * The name-and-fact panel, held against the two files it would actually write to.
 *
 * `signoff.ts` is a second copy of rules that already exist elsewhere, and that
 * is the whole class of failure this file exists to catch. The fact bounds are
 * `tests/island/species-facts.test.ts` read backwards; the species name, the
 * collection, the band and the generated name are the roster's and `naming.ts`'s
 * answers, restated at a keyboard. Every one of those restatements can drift,
 * and drift in either direction hurts: a rule the panel enforces more tightly
 * than the gate refuses a sentence that was fine, and one it enforces more
 * loosely turns the suite red an hour after Joe typed it, against a box he can
 * no longer see.
 *
 * So the important assertions here are not fixtures. The fact checks are run
 * over all hundred sentences ALREADY IN `joe/species-facts.json` — every one of
 * which the real gate passes today — and the derived fields are asserted against
 * the live roster rather than against a species invented for the test. The two
 * row builders are asserted against a row read off disk, key for key, because a
 * row that is merely plausible is the kind of thing that appends cleanly and
 * fails a gate on the next run.
 *
 * The one assertion that looks like a triviality and is not is `ready`. It is
 * defined as "no BLOCKING problem", and a name clash is deliberately not one —
 * two animals sharing a name is Joe's call to make out loud, and a panel that
 * refused the push over it would be a validator overruling him.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  factProblems, signoffView, auditRowFor, factRowFor,
  JOE, UNSOURCED_NOTE, type SignoffView,
} from '../../tools/workbench/public/editor/signoff'
import { COLLECTIONS, SPECIES_NAMES, SPECIES_COLLECTION, collection } from '../../src/island/species/roster'
import { NAME_PINS, _allocate, givenName, nameBandOf } from '../../src/island/species/naming'
import { REGISTRY } from '../../src/island/species/registry'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

type FactRow = {
  speciesId: string
  species: string
  collection: string
  fact: string
  check: string
  source: string
  sourceNote: string
  proposedRewrite: string
  verdict: string
  replacement: string
  note: string
}

type AuditRow = {
  id: string
  setId: string
  speciesId: string
  species: string
  collection: string
  band: string
  name: string
  verdict: string
  replacement: string
  note: string
}

const factDoc = JSON.parse(readFileSync(resolve(root, 'joe/species-facts.json'), 'utf8')) as {
  coveredCollections: readonly string[]
  facts: readonly FactRow[]
}
const auditDoc = JSON.parse(readFileSync(resolve(root, 'joe/names-audit.json'), 'utf8')) as {
  names: readonly AuditRow[]
}
const covers = new Set(factDoc.coveredCollections)

/* The roster in its one canonical order, which is also the naming allocation's
 * priority order — see `naming.ts ROSTER_ORDER`. */
const ROSTER_IDS: readonly string[] = COLLECTIONS.flatMap(c => c.members)

/* A species the roster has ratified but nothing has built yet. This is the case
 * the panel is FOR — Joe is drawing it in the editor, so it cannot be in the
 * registry — and the point of using a real one is that its name, collection and
 * band are real answers rather than a fixture's. */
const UNBUILT: string = ROSTER_IDS.find(id => !REGISTRY.has(id)) ?? ''

/* A species that has shipped AND already carries a fact, so a row built for it
 * is a row `tests/island/species-facts.test.ts` would accept whole. */
const BUILT: string = factDoc.facts[0]?.speciesId ?? ''

/** A sentence the fact gate is happy with, so nothing else under test is masked. */
const GOOD_FACT = 'A mole digs long tunnels under the grass and hunts for worms.'

const view = (speciesId: string, givenNameOverride = '', fact = GOOD_FACT): SignoffView =>
  signoffView(speciesId, { givenName: givenNameOverride, fact })

/* Exactly `n` words, ending in a full stop, so a length assertion is only ever
 * about the length. */
const ofWords = (n: number): string =>
  Array.from({ length: n }, (_, i) => (i === 0 ? 'A' : 'mole')).join(' ') + '.'

describe('the fact rules are the gate\'s rules, not the panel\'s own', () => {
  /*
   * The assertion this whole file is written around.
   *
   * Every sentence in `joe/species-facts.json` passes `npm test` today. If
   * `factProblems` refuses any of them, then the panel is stricter than the gate
   * and would have refused a fact that shipped — a push blocked at Joe's
   * keyboard for a rule nothing else in the repo believes in. The bounds are
   * deliberately not restated here; the corpus is the assertion.
   */
  it('refuses none of the hundred facts the repo has already accepted', () => {
    expect(factDoc.facts.length).toBeGreaterThan(0)
    for (const f of factDoc.facts) {
      expect(factProblems(f.fact), `${f.speciesId}: "${f.fact}"`).toEqual([])
    }
  })

  it('says nothing about a good sentence typed fresh', () => {
    expect(factProblems(GOOD_FACT)).toEqual([])
  })

  /*
   * And the converse, one failure at a time. Each of these is a way the gate
   * goes red hours later, so each has to be caught while the box is still open —
   * and every one of them BLOCKS, because there is no version of these that is
   * merely worth mentioning.
   */
  it('catches each way the gate would go red, one sentence at a time', () => {
    const only = (fact: string): string => {
      const problems = factProblems(fact)
      expect(problems, fact).toHaveLength(1)
      for (const p of problems) {
        expect(p.field, fact).toBe('fact')
        expect(p.blocks, fact).toBe(true)
      }
      return problems[0]!.say
    }

    expect(only(ofWords(5))).toContain('5 words')
    expect(only(ofWords(21))).toContain('21 words')
    expect(only('A mole digs. It eats worms. It lives here.')).toContain('3 sentences')
    expect(only('A mole digs long tunnels under the grass')).toContain('full stop')
    expect(only('A mole has gray fur and digs long tunnels.')).toContain('gray')
    expect(only('A mole has a dark color and digs long tunnels.')).toContain('color')
  })

  it('treats a sentence at each bound as fine, so the panel is not off by one', () => {
    expect(factProblems(ofWords(6))).toEqual([])
    expect(factProblems(ofWords(20))).toEqual([])
    expect(factProblems('A mole digs tunnels. It eats worms all day.')).toEqual([])
  })

  it('an empty box is a blocking problem and not a crash', () => {
    for (const nothing of ['', '   ', '\n']) {
      const problems = factProblems(nothing)
      expect(problems, JSON.stringify(nothing)).toHaveLength(1)
      expect(problems[0]!.blocks).toBe(true)
    }
  })
})

describe('the panel is the roster answering, not a fixture', () => {
  /*
   * Everything except the fact is data that already exists, and asking Joe to
   * retype any of it would be asking him to get it subtly wrong. So each field
   * is asserted against the module that owns it — and against an UNBUILT
   * species, because roster membership and not registry membership is what makes
   * a name and a collection real.
   */
  it('takes the name, the collection, the band and the given name off the roster', () => {
    expect(UNBUILT).not.toBe('')
    expect(REGISTRY.has(UNBUILT), 'the case under test is a species nobody has built yet').toBe(false)

    const v = view(UNBUILT)
    expect(v.inRoster).toBe(true)
    expect(v.species).toBe(SPECIES_NAMES[UNBUILT])
    expect(v.collection).toBe(SPECIES_COLLECTION[UNBUILT])
    expect(v.collectionName).toBe(collection(SPECIES_COLLECTION[UNBUILT]!)?.name)
    expect(v.band).toBe(nameBandOf(UNBUILT))
    expect(v.generated).toBe(givenName(UNBUILT))
    expect(v.ready).toBe(true)
  })

  /*
   * The guard. A push is refusable BY NAME only because the id is checked
   * against the roster: an id off it has no collection, no band and no audited
   * name, so a row written for it would be a row nothing can join to.
   */
  it('refuses an id the ratified roster has never heard of, and names it', () => {
    const v = view('animal-nonesuch')
    expect(v.inRoster).toBe(false)
    const blocking = v.problems.filter(p => p.blocks)
    expect(blocking).toHaveLength(1)
    expect(blocking[0]!.field).toBe('species')
    expect(blocking[0]!.say).toContain('animal-nonesuch')
    expect(v.ready).toBe(false)
  })

  it('refuses an empty id rather than drawing a name for nothing', () => {
    const v = view('')
    expect(v.generated).toBe('')
    expect(v.ready).toBe(false)
    expect(v.problems.some(p => p.field === 'species' && p.blocks)).toBe(true)
  })
})

describe('what a name he typed himself does, and does not, stop', () => {
  it('uses the generated name until he types over it', () => {
    const v = view(UNBUILT, '')
    expect(v.name).toBe(v.generated)
    expect(v.name).toBe(givenName(UNBUILT))
    expect(v.overridden).toBe(false)
  })

  it('does not call it overridden when he types the generated name back in', () => {
    /* The regenerate button clears the box, but he may equally have typed the
     * same word; either way nothing was overruled and the panel must not claim
     * it was. */
    const v = view(UNBUILT, givenName(UNBUILT))
    expect(v.name).toBe(givenName(UNBUILT))
    expect(v.overridden).toBe(false)
  })

  it('takes his word over the generator when the two differ', () => {
    const v = view(UNBUILT, 'Sprocket')
    expect(v.name).toBe('Sprocket')
    expect(v.generated).toBe(givenName(UNBUILT))
    expect(v.overridden).toBe(true)
  })

  /*
   * `ready` is exactly "no BLOCKING problem", and this is the case that proves
   * the two are not the same thing. `naming.ts` allocates collision-free across
   * all 320, so a clash can only be something Joe typed on purpose — worth
   * saying out loud, never worth refusing a push over.
   */
  it('says a name clash out loud and still lets the push through', () => {
    const allocated = _allocate(NAME_PINS)
    const takenBy = BUILT
    const taken = allocated[takenBy]!
    expect(takenBy).not.toBe(UNBUILT)
    expect(taken).not.toBe(givenName(UNBUILT))

    const v = view(UNBUILT, taken)
    expect(v.clashesWith).toBe(takenBy)
    const clash = v.problems.filter(p => p.field === 'name')
    expect(clash).toHaveLength(1)
    expect(clash[0]!.blocks).toBe(false)
    expect(clash[0]!.say).toContain(takenBy)
    expect(clash[0]!.say).toContain(taken)
    expect(v.problems.some(p => p.blocks)).toBe(false)
    expect(v.ready).toBe(true)
  })

  it('never invents a clash out of the name the generator itself drew', () => {
    expect(view(UNBUILT).clashesWith).toBe('')
    expect(view(BUILT).clashesWith).toBe('')
  })

  it('a fact that fails the gate blocks the push even with everything else settled', () => {
    const v = view(UNBUILT, '', ofWords(21))
    expect(v.problems.some(p => p.field === 'fact' && p.blocks)).toBe(true)
    expect(v.ready).toBe(false)
  })
})

describe('the two rows the push would append', () => {
  /*
   * Both builders are asserted against a row read off disk rather than against a
   * literal, keys and key ORDER included. A row with a field missing, spelled
   * differently or in a different place is the kind of thing that appends
   * cleanly and fails somebody else's gate on the next run.
   */
  it('builds an audit row shaped exactly like the ones already in the file', () => {
    /*
     * Compared against a row STRIPPED OF `signoff`, and that is the point rather
     * than a concession. Since 2 August a successful push writes `signoff` onto
     * the row it just wrote — pressing the button is Joe signing the animal off —
     * so rows on disk fall into two shapes: ten keys before he has pushed the
     * animal, eleven after. `auditRowFor` builds the row that TRAVELS IN THE
     * REQUEST, before the server has written a byte, and it must keep building
     * the ten-key one: a `signoff` in it would be a sign-off issued in advance of
     * the thing it signs off, and it would survive a push that turned out to
     * write nothing at all. That is PB-076 exactly.
     *
     * So the assertion below is still keys AND key order against a real row, and
     * the two assertions after it are what stop this weakening into "any subset
     * will do": `signoff` must be the ONLY key it is allowed to lack, and it must
     * be absent from the built row rather than present and empty.
     */
    const sample = auditDoc.names[0]
    expect(sample, 'joe/names-audit.json has no rows to compare against').toBeDefined()
    const built = Object.keys(auditRowFor(view(UNBUILT)))
    const onDisk = Object.keys(sample!)
    expect(built).toEqual(onDisk.filter(k => k !== 'signoff'))
    expect(onDisk.filter(k => !built.includes(k))).toEqual(
      onDisk.includes('signoff') ? ['signoff'] : [])
    expect(built).not.toContain('signoff')
  })

  /*
   * `name` is asserted against the GENERATOR rather than against the view, and
   * that is the file's rule and not a convenience: `tests/island/naming.test.ts`
   * "cannot drift from the generator" demands `e.name === givenName(e.speciesId)`
   * of every row on disk. The audit row records what the generator DREW; a name
   * Joe wanted instead of it is what `replacement` is for — `merge.mjs` says so
   * in as many words — which is also why nothing here may pre-fill it.
   */
  it('derives the audit row the way tests/island/naming.test.ts checks the file', () => {
    const row = auditRowFor(view(UNBUILT))
    expect(row.setId).toBe('natural')
    expect(row.id).toBe(`${row.setId}/${row.speciesId}`)
    expect(row.speciesId).toBe(UNBUILT)
    expect(row.species).toBe(SPECIES_NAMES[UNBUILT])
    expect(row.collection).toBe(collection(SPECIES_COLLECTION[UNBUILT]!)?.id)
    expect(row.band).toBe(collection(SPECIES_COLLECTION[UNBUILT]!)?.band)
    expect(row.name).toBe(givenName(UNBUILT))
  })

  /*
   * The row keeps the DRAWN name whatever Joe typed, and his word goes to
   * `replacement`. Two separate reasons, and either alone would settle it: the
   * gate above demands `name === givenName(speciesId)` of every row on disk, and
   * `merge.mjs` records that the row list is REGENERATED whenever the roster
   * moves — only `verdict`, `replacement` and `note` survive that. A name parked
   * in `name` would go red today and vanish tomorrow.
   */
  it('keeps the drawn name and files his own word as the replacement', () => {
    const row = auditRowFor(view(UNBUILT, 'Sprocket'))
    expect(row.name).toBe(givenName(UNBUILT))
    expect(row.replacement).toBe('Sprocket')
  })

  /* `verdict` and `note` are judgements and are never pre-filled; and with no
   * override there is nothing to put in `replacement` either. */
  it('leaves the audit verdict and note his to fill, and replacement empty until he types one', () => {
    const row = auditRowFor(view(UNBUILT))
    expect([row.verdict, row.replacement, row.note]).toEqual(['', '', ''])
  })

  it('builds a fact row shaped exactly like the ones already in the file', () => {
    const sample = factDoc.facts[0]
    expect(sample, 'joe/species-facts.json has no rows to compare against').toBeDefined()
    expect(Object.keys(factRowFor(view(BUILT)))).toEqual(Object.keys(sample!))
  })

  /*
   * The claim worth making about the fact row is not what it contains but that
   * `tests/island/species-facts.test.ts` would accept it, so the rules below are
   * that test's rules applied to a freshly built row: every field a string, a
   * check of `verified` or `flagged`, a flagged row that says WHY it is flagged,
   * the species and collection spelled the roster's way, and Joe's three fields
   * untouched.
   */
  it('builds a fact row the real fact gate would accept', () => {
    expect(BUILT).not.toBe('')
    const row = factRowFor(view(BUILT))
    const asRecord = row as unknown as Record<string, unknown>

    for (const k of [
      'speciesId', 'species', 'collection', 'fact', 'check',
      'source', 'sourceNote', 'proposedRewrite', 'verdict', 'replacement', 'note',
    ]) {
      expect(typeof asRecord[k], k).toBe('string')
    }

    expect(['verified', 'flagged']).toContain(row.check)
    expect(REGISTRY.has(row.speciesId), row.speciesId).toBe(true)
    expect(covers.has(row.collection), row.collection).toBe(true)
    expect(row.species).toBe(SPECIES_NAMES[BUILT])
    expect(row.collection).toBe(SPECIES_COLLECTION[BUILT])

    const words = row.fact.trim().split(/\s+/).length
    expect(words).toBeGreaterThanOrEqual(6)
    expect(words).toBeLessThanOrEqual(20)
    expect(row.fact.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length)
      .toBeLessThanOrEqual(2)
    expect(row.fact.trim().endsWith('.')).toBe(true)
    expect(/\b(color|colors|gray|behavior|burrowing in the fall|fall)\b/i.test(row.fact)).toBe(false)
  })

  /*
   * A sentence of Joe's own is `flagged` — not as a slur on it, but because
   * unchecked is what it is, and the gate refuses a flagged row that does not
   * say why. The note is that reason, written down.
   */
  it('marks his own sentence unchecked and writes down why it is flagged', () => {
    const row = factRowFor(view(BUILT))
    expect(row.check).toBe('flagged')
    expect(row.sourceNote).toBe(UNSOURCED_NOTE)
    expect(row.sourceNote.length).toBeGreaterThan(0)
  })

  it('proposes no rewrite of his sentence and leaves his three fields empty', () => {
    const row = factRowFor(view(BUILT))
    expect(row.proposedRewrite).toBe('')
    expect([row.verdict, row.replacement, row.note]).toEqual(['', '', ''])
  })

  it('writes the trimmed sentence, so trailing whitespace never reaches the file', () => {
    expect(factRowFor(view(BUILT, '', `  ${GOOD_FACT}  `)).fact).toBe(GOOD_FACT)
  })

  /* `main.ts:713` writes this string into the draft's `factSource`, so the value
   * is the join between an editor session and a sentence nobody has checked. */
  it('names Joe as the author of the sentence, in the spelling main.ts writes', () => {
    expect(JOE).toBe('joe')
    expect(view(BUILT).factSource).toBe('joe')
  })
})
