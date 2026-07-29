/**
 * The one animal approver: the join, the single approval action, and the promise
 * that no assembled species can fall off the bench without anyone noticing.
 *
 * The viewer is three.js and a DOM and cannot be asserted about from here. What
 * CAN be, and is what matters, is everything underneath it: which creatures are
 * benched, carrying whose name and whose fact, what one click actually writes,
 * and how "3 of 12 approved" is counted. `approver.ts` is deliberately free of
 * three.js so that this file can exist — the same discipline `built.ts` kept
 * before the seventy-two it served were scrapped.
 *
 * Two of the assertions below are here because of things that have already gone
 * wrong on this project rather than because of anything the code looks like: a
 * gallery that inherited an unwritten `else` once listed props to Joe, so the
 * bench is asserted EXHAUSTIVE against the real assembled set; and a name ticked
 * in a list once stood in for an animal he had looked at, so the three verdicts
 * are asserted to stay separate in the data even though one click writes them.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  approverBench, progressOf, readFacts, approvePatch, reopenPatch,
  APPROVED, STRUCK, VERIFIED, APPROVE_LABEL, REOPEN_LABEL, NO_AUDIT_ROW,
  type AuditRow, type Creature,
} from '../../tools/workbench/public/approver'
import { assembledRows, type AssembledEntry } from '../../tools/workbench/public/assembled'
import { assembledSpecies } from '../../src/island/species/parts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/* A bench that cannot move under the test. The ids are real species so that the
 * collection lookup is a real lookup, but the SET of them is ours. */
const ENTRIES: readonly AssembledEntry[] = [
  { id: 'animal-hedgehog', name: 'Hedgehog', collection: 'garden' },
  { id: 'animal-mole', name: 'Mole', collection: 'garden', flag: 'the snout strained rule 4' },
  { id: 'animal-otter', name: 'Otter', collection: 'woodland' },
  { id: 'animal-elk', name: 'Elk', collection: 'woodland' },
]

const ROWS = assembledRows(ENTRIES)

const rowFor = (speciesId: string, extra: Partial<AuditRow> = {}): AuditRow => ({
  id: `natural/${speciesId}`,
  setId: 'natural',
  speciesId,
  species: speciesId.replace('animal-', ''),
  collection: '',
  band: '',
  name: 'Name-' + speciesId.replace('animal-', ''),
  verdict: '', replacement: '', note: '',
  ...extra,
})

const bench = (audit: AuditRow[] = [], facts: unknown = null): Creature[] =>
  approverBench(ROWS, audit, readFacts(facts))

const find = (b: readonly Creature[], id: string): Creature =>
  b.find(c => c.speciesId === id)!

describe('the bench is EVERY assembled species, and never a subset', () => {
  it('produces one creature per row, in the order the assembler emitted them', () => {
    /* Never re-sorted, and never filtered: he works down a list, and a row that
     * moves or vanishes under the cursor takes his place with it. */
    expect(bench().map(c => c.speciesId)).toEqual(ENTRIES.map(e => e.id))
  })

  it('benches a species with no audit row and no fact at all', () => {
    /* This is the assertion the whole file is written around. A gallery that
     * inherited an unwritten `else` once listed props to Joe; a bench that drops
     * a creature because the audit file has not caught up with it would make the
     * progress count a lie in exactly the same silent way. */
    const b = bench([rowFor('animal-hedgehog')], {
      facts: [{ speciesId: 'animal-hedgehog', fact: 'A hedgehog has spines.', check: VERIFIED }],
    })
    expect(b).toHaveLength(4)
    const elk = find(b, 'animal-elk')
    expect(elk).toMatchObject({
      onBench: false, given: '', benched: '', fact: '', factCheck: '',
      signoff: '', verdict: '', replacement: '', note: '', factVerdict: '', factNote: '',
    })
    /* And it is still a real, printable row — the name and collection come off
     * the roster, which has not gone anywhere. */
    expect(elk.species).toBe('Elk')
    expect(elk.collectionName).toBe('Woodland')
    expect(elk.auditId).toBe('natural/animal-elk')
  })

  it('carries the flag, the collection and the unknown-collection mark across', () => {
    const b = bench()
    expect(find(b, 'animal-mole')).toMatchObject({
      flagged: true, flag: 'the snout strained rule 4', unknownCollection: false,
    })
    expect(find(b, 'animal-hedgehog').flagged).toBe(false)
  })

  it('shows a build filed under a collection the roster does not know', () => {
    const odd = approverBench(assembledRows([{ id: 'x', name: 'X', collection: 'nowhere' }]), [], [])
    expect(odd).toHaveLength(1)
    expect(odd[0]).toMatchObject({ unknownCollection: true, collectionName: 'nowhere' })
  })
})

describe('the join to what Joe has already said', () => {
  it('carries his verdicts across and names the id a patch must use', () => {
    const b = bench([rowFor('animal-mole', {
      verdict: STRUCK, replacement: 'Dig', note: 'trips the tongue',
      signoff: APPROVED, factVerdict: STRUCK, factNote: 'moles are not blind',
    })])
    expect(find(b, 'animal-mole')).toMatchObject({
      auditId: 'natural/animal-mole', onBench: true,
      verdict: STRUCK, replacement: 'Dig', note: 'trips the tongue',
      signoff: APPROVED, factVerdict: STRUCK, factNote: 'moles are not blind',
    })
  })

  it('flags a row whose species name disagrees with the roster', () => {
    /* `naming.ts` warns that inserting a species mid-roster renames the ones
     * after it, and a stale audit file is what that looks like from the outside.
     * He must not approve a creature the file no longer agrees with. */
    const b = bench([
      rowFor('animal-otter', { species: 'Otter' }),
      rowFor('animal-elk', { species: 'Moose' }),
    ])
    expect(find(b, 'animal-otter').drift).toBe(false)
    expect(find(b, 'animal-elk').drift).toBe(true)
  })

  it('a row that names no species at all is silence, not drift', () => {
    expect(find(bench([rowFor('animal-elk', { species: '' })]), 'animal-elk').drift).toBe(false)
  })

  it('takes the given name off the audit row, because that word is the audit file\'s', () => {
    expect(find(bench([rowFor('animal-elk')]), 'animal-elk').given).toBe('Name-elk')
  })
})

describe('the facts, which this code reads and never writes', () => {
  it('reads the real file\'s shape, rewrite and source note included', () => {
    const facts = readFacts({
      schemaVersion: 1,
      facts: [{
        speciesId: 'animal-mole', species: 'Mole', collection: 'garden',
        fact: 'A mole digs tunnels.', check: VERIFIED, source: 'RSPB',
        sourceNote: 'RSPB: moles dig extensive tunnel systems.',
        proposedRewrite: 'A mole digs long tunnels underground.',
      }],
    })
    expect(facts).toHaveLength(1)
    expect(facts[0]).toEqual({
      speciesId: 'animal-mole', fact: 'A mole digs tunnels.', check: VERIFIED,
      source: 'RSPB', sourceNote: 'RSPB: moles dig extensive tunnel systems.',
      proposedRewrite: 'A mole digs long tunnels underground.',
    })
  })

  it('keys a fact either way round', () => {
    /* The audit file keys `natural/animal-newt` and the roster keys
     * `animal-newt`. Either is accepted; both mean one creature. */
    const facts = readFacts({ facts: [{ id: 'natural/animal-elk', text: 'An elk is large.' }] })
    expect(facts[0]?.speciesId).toBe('animal-elk')
    expect(facts[0]?.fact).toBe('An elk is large.')
  })

  it('never turns a FAILED check into a missing one', () => {
    /* `verified: false` is a fact that was checked and did not survive it — a
     * different statement from one nobody has looked at, and the difference is
     * the whole reason the field is separate from the sentence. */
    const check = (r: unknown) => readFacts({ facts: [r] })[0]?.check
    expect(check({ speciesId: 'a', fact: 'x', verified: false })).toBe('flagged')
    expect(check({ speciesId: 'a', fact: 'x', verified: true })).toBe(VERIFIED)
    expect(check({ speciesId: 'a', fact: 'x' })).toBe('')
  })

  it('an absent file is an empty list of facts, not a crash', () => {
    for (const shape of [null, undefined, {}, { facts: null }, 'nonsense', 42]) {
      expect(readFacts(shape)).toEqual([])
    }
  })

  it('puts the fact and its check onto the creature, and says so when there is none', () => {
    const b = bench([], {
      facts: [{ speciesId: 'animal-mole', fact: 'A mole digs.', check: 'flagged', sourceNote: 'thin' }],
    })
    expect(find(b, 'animal-mole')).toMatchObject({
      fact: 'A mole digs.', factCheck: 'flagged', sourceNote: 'thin',
    })
    expect(find(b, 'animal-elk')).toMatchObject({
      fact: '', factCheck: '', factSource: '', sourceNote: '', proposedRewrite: '',
    })
  })
})

/*
 * ONE ACTION, THREE VERDICTS — the decision this whole run turns on.
 *
 * Joe asked for a single approval per animal covering the name, the fact and the
 * model. The three must still land in three fields, because folding them into
 * one would let a name ticked in the old names list count as an animal he had
 * actually looked at. And a strike he made BEFORE approving is a considered
 * judgement, so approving the creature around it must not quietly overwrite it.
 */
describe('the single approval action', () => {
  const plain = (over: Partial<Creature> = {}): Creature =>
    ({ ...find(bench([rowFor('animal-elk')]), 'animal-elk'), ...over })

  it('writes all three fields from one click', () => {
    expect(approvePatch(plain())).toEqual({
      signoff: APPROVED, verdict: APPROVED, factVerdict: APPROVED,
    })
  })

  it('keeps a struck NAME struck through an approve', () => {
    expect(approvePatch(plain({ verdict: STRUCK }))).toEqual({
      signoff: APPROVED, verdict: STRUCK, factVerdict: APPROVED,
    })
  })

  it('keeps a struck FACT struck through an approve', () => {
    expect(approvePatch(plain({ factVerdict: STRUCK }))).toEqual({
      signoff: APPROVED, verdict: APPROVED, factVerdict: STRUCK,
    })
  })

  it('re-opening clears the approvals and never his strikes', () => {
    expect(reopenPatch(plain({ signoff: APPROVED, verdict: APPROVED, factVerdict: APPROVED })))
      .toEqual({ signoff: '', verdict: '', factVerdict: '' })
    expect(reopenPatch(plain({ signoff: APPROVED, verdict: STRUCK, factVerdict: STRUCK })))
      .toEqual({ signoff: '', verdict: STRUCK, factVerdict: STRUCK })
  })

  it('says on the button what the click actually does', () => {
    expect(APPROVE_LABEL).toContain('name')
    expect(APPROVE_LABEL).toContain('fact')
    expect(APPROVE_LABEL).toContain('model')
    expect(REOPEN_LABEL).toContain('approved')
    expect(NO_AUDIT_ROW).toContain('joe/names-audit.json')
  })

  it('writes only fields the merge actually owns', () => {
    /* Read out of `merge.mjs` rather than trusted: a patch naming a field the
     * names record does not own is dropped by `/api/save` without a word, and
     * the surface would show a tick that never reached the disk. */
    const merge = readFileSync(resolve(root, 'tools/workbench/merge.mjs'), 'utf8')
    const block = /names:\s*\{[\s\S]*?owns:\s*\{([\s\S]*?)\n\s*\},/.exec(merge)
    expect(block, 'could not find the names record in merge.mjs').not.toBeNull()
    const owned = new Set([...block![1]!.matchAll(/^\s*(\w+):/gm)].map(m => m[1]!))
    expect(owned.size).toBeGreaterThan(0)
    const c = plain()
    for (const key of [...Object.keys(approvePatch(c)), ...Object.keys(reopenPatch(c))]) {
      expect(owned.has(key), `merge.mjs names.owns has no '${key}'`).toBe(true)
    }
  })
})

describe('the progress he asked to see', () => {
  const facts = {
    facts: [
      { speciesId: 'animal-hedgehog', fact: 'A hedgehog has spines.', check: VERIFIED },
      { speciesId: 'animal-mole', fact: 'A mole digs.', check: 'flagged' },
    ],
  }

  it('counts only a real approval, and says it the way he asked', () => {
    const p = progressOf(bench([
      rowFor('animal-hedgehog', { signoff: APPROVED }),
      /* A struck NAME is neither an approval nor the absence of one. */
      rowFor('animal-mole', { verdict: STRUCK }),
      rowFor('animal-otter'),
      rowFor('animal-elk'),
    ], facts))
    expect(p).toMatchObject({ total: 4, approved: 1, left: 3, label: '1 of 4 approved' })
  })

  it('separates a fact that is missing from one nobody could verify', () => {
    const p = progressOf(bench([
      rowFor('animal-hedgehog'), rowFor('animal-mole'),
      rowFor('animal-otter'), rowFor('animal-elk'),
    ], facts))
    /* Two of the four have no sentence at all; of the two that do, one was
     * checked and flagged, and a flagged fact is never counted as fine. */
    expect(p.withoutFact).toBe(2)
    expect(p.unverified).toBe(1)
  })

  it('counts his strikes and the creatures the audit file has never heard of', () => {
    const p = progressOf(bench([
      rowFor('animal-hedgehog', { verdict: STRUCK }),
      rowFor('animal-mole', { factVerdict: STRUCK }),
    ], facts))
    expect(p).toMatchObject({ struckName: 1, struckFact: 1, unsignable: 2 })
  })

  it('says the non-zero clauses plainly, in one order, and stays silent otherwise', () => {
    const p = progressOf(bench([
      rowFor('animal-hedgehog', { signoff: APPROVED }),
      rowFor('animal-mole', { verdict: STRUCK, factVerdict: STRUCK }),
      rowFor('animal-otter'),
    ], facts))
    expect(p.meta).toEqual([
      /* Four on the bench and one approved, so three to go — the elk, which no
       * audit row mentions, is one of the three and is counted twice over: it is
       * left to do AND it is unapprovable until the file catches up. */
      '3 to go', '1 fact unverified', '2 with no fact yet',
      '1 name struck', '1 fact struck', '1 not in the audit file',
    ])
  })

  it('an empty bench is zeroes and no clauses, not a crash', () => {
    expect(progressOf([])).toMatchObject({
      total: 0, approved: 0, left: 0, label: '0 of 0 approved', meta: [],
    })
  })
})

/*
 * The claim the surface rests on, held against the live data rather than a
 * fixture: every animal the assembler can build is in front of him, exactly once.
 */
describe('the real bench, off the real files', () => {
  const live = assembledRows(assembledSpecies())
  const audit = (JSON.parse(readFileSync(resolve(root, 'joe/names-audit.json'), 'utf8')) as
    { names: AuditRow[] }).names
  const facts = readFacts(JSON.parse(readFileSync(resolve(root, 'joe/species-facts.json'), 'utf8')))

  it('has exactly one creature per assembled species, and nothing else', () => {
    const real = approverBench(live, audit, facts)
    expect(live.length).toBeGreaterThan(0)
    expect(real.map(c => c.speciesId)).toEqual(live.map(r => r.id))
    expect(new Set(real.map(c => c.speciesId)).size).toBe(real.length)
  })

  it('joins each of them to the audit file and the fact file on the real ids', () => {
    /* If the id join ever breaks, it breaks silently — a fact that never appears
     * and an animal approved blind — so it is asserted rather than looked at. */
    const real = approverBench(live, audit, facts)
    for (const c of real) {
      expect(c.auditId, c.speciesId).toBe(`natural/${c.speciesId}`)
      expect(c.onBench, `${c.speciesId} ${NO_AUDIT_ROW}`).toBe(true)
      expect(c.fact, `${c.speciesId} has no drafted fact`).not.toBe('')
    }
  })

  it('shows real progress over the real bench', () => {
    const p = progressOf(approverBench(live, audit, facts))
    expect(p.total).toBe(live.length)
    expect(p.approved + p.left).toBe(p.total)
    expect(p.label).toBe(`${p.approved} of ${p.total} approved`)
  })
})
