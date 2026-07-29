/**
 * The built-animal bench: the join, the progress arithmetic, and the one claim
 * the whole surface rests on — that the models Joe signs off are built by the
 * game's own kits and not by a preview pipeline that can drift from them.
 *
 * The viewer is three.js and a DOM and cannot be asserted about from here. What
 * CAN be, and is what matters, is everything underneath it: which creatures are
 * benched, in what order, carrying whose name, and how "34 of 50 signed off" is
 * counted. `built.ts` is deliberately free of three.js so that this file can
 * exist.
 */
import { describe, it, expect } from 'vitest'
import {
  builtBench, progressOf, readFacts, SIGNED_OFF, STRUCK, VERIFIED,
  type AuditRow, type Sources,
} from '../../tools/workbench/public/built'
import { SHIPPED_SPECIES } from '../../src/island/species/registry'
import { buildSpecies, KITS } from '../../src/island/species/kit'
import { COLLECTIONS } from '../../src/island/species/roster'
import { givenName, NATURAL_SET } from '../../src/island/species/naming'
import type { Collection, Species } from '../../src/island/species/types'

/* A roster that cannot move under the test, for the join and the arithmetic. */
const spec = (height: number) => ({
  kit: 'quadruped' as const, height, body: 1, head: 1, legs: 1,
  ears: 'round' as const, tail: 'stub' as const, palette: { coat: 0x998877 },
})

const FAKE_COLLECTIONS: readonly Collection[] = [
  { id: 'base', name: 'Base Set', ship: 0, band: 'short', members: ['animal-fox'] },
  { id: 'woodland', name: 'Woodland', ship: 9, band: 'medium', members: ['animal-otter', 'animal-elk'] },
  { id: 'garden', name: 'Garden', ship: 1, band: 'short', members: ['animal-mole', 'animal-newt'] },
]

const FAKE_SPECIES: readonly Species[] = [
  /* No `build`: an authored GLB, and never on this bench. */
  { id: 'animal-fox', name: 'Fox', kit: 'kenney', collection: 'base' },
  { id: 'animal-otter', name: 'Otter', kit: 'quadruped', collection: 'woodland', build: spec(1.6) },
  { id: 'animal-elk', name: 'Elk', kit: 'quadruped', collection: 'woodland', build: spec(2.4) },
  { id: 'animal-mole', name: 'Mole', kit: 'quadruped', collection: 'garden', build: spec(1.3) },
  { id: 'animal-newt', name: 'Newt', kit: 'quadruped', collection: 'garden', build: spec(1.2) },
]

const FAKE: Sources = {
  species: FAKE_SPECIES,
  collections: FAKE_COLLECTIONS,
  given: id => 'Name-' + id.replace('animal-', ''),
  naturalSet: 'natural',
}

const rowFor = (speciesId: string, extra: Partial<AuditRow> = {}): AuditRow => ({
  id: `natural/${speciesId}`,
  setId: 'natural',
  speciesId,
  species: speciesId,
  collection: '',
  band: '',
  name: 'Name-' + speciesId.replace('animal-', ''),
  verdict: '', replacement: '', note: '',
  ...extra,
})

describe('the bench is every species a kit BUILDS, and only those', () => {
  it('leaves the frozen 24 out — they are authored GLBs, not kit output', () => {
    const bench = builtBench([], new Map(), FAKE)
    expect(bench.map(c => c.speciesId)).not.toContain('animal-fox')
    expect(bench).toHaveLength(4)
  })

  it('reads ship order first, then the roster order inside a collection', () => {
    /* Garden ships at 1 and Woodland at 9, so Garden comes first however the
     * COLLECTIONS array happens to be written — which is the order
     * joe/names-audit.json is generated in, so his place in one is his place in
     * the other. */
    expect(builtBench([], new Map(), FAKE).map(c => c.speciesId)).toEqual([
      'animal-mole', 'animal-newt', 'animal-otter', 'animal-elk',
    ])
  })

  it('takes the collection name, band and ship slot off the collection, not the row', () => {
    /* The audit row's own `collection` and `band` are left deliberately blank
     * above: a generated file goes stale, and the code's table does not. */
    const elk = builtBench([rowFor('animal-elk')], new Map(), FAKE)
      .find(c => c.speciesId === 'animal-elk')!
    expect(elk).toMatchObject({
      collection: 'woodland', collectionName: 'Woodland', ship: 9, band: 'medium', kit: 'quadruped',
    })
  })
})

describe('the join to what Joe has already said', () => {
  it('carries his verdicts across and names the id a patch must use', () => {
    const rows = [rowFor('animal-mole', {
      verdict: STRUCK, replacement: 'Dig', note: 'trips the tongue',
      signoff: SIGNED_OFF, factVerdict: STRUCK, factNote: 'moles are not blind',
    })]
    const mole = builtBench(rows, new Map(), FAKE)[0]!
    expect(mole.auditId).toBe('natural/animal-mole')
    expect(mole).toMatchObject({
      verdict: STRUCK, replacement: 'Dig', note: 'trips the tongue',
      signoff: SIGNED_OFF, factVerdict: STRUCK, factNote: 'moles are not blind',
      onBench: true,
    })
  })

  it('benches a species with no audit row at all, and marks it unsignable', () => {
    const bench = builtBench([rowFor('animal-mole')], new Map(), FAKE)
    const newt = bench.find(c => c.speciesId === 'animal-newt')!
    expect(newt.onBench).toBe(false)
    expect(newt.signoff).toBe('')
    /* Present, not hidden: the registry builds it, so it is a real creature and
     * a bench that dropped it would make the progress count a lie. */
    expect(bench).toHaveLength(4)
    expect(progressOf(bench).unsignable).toBe(3)
  })

  it('flags a row whose name the code no longer generates', () => {
    const bench = builtBench([
      rowFor('animal-mole'),
      rowFor('animal-newt', { name: 'Something-Else' }),
    ], new Map(), FAKE)
    expect(bench.find(c => c.speciesId === 'animal-mole')!.drift).toBe(false)
    const newt = bench.find(c => c.speciesId === 'animal-newt')!
    expect(newt.drift).toBe(true)
    expect(newt.benched).toBe('Something-Else')
    expect(newt.given).toBe('Name-newt')
  })

  it('a row that carries no name at all is not drift — it is silence', () => {
    const bench = builtBench([rowFor('animal-mole', { name: '' })], new Map(), FAKE)
    expect(bench[0]!.drift).toBe(false)
  })
})

describe('the facts, which this code reads and never writes', () => {
  it('reads a list of records, keyed either way round', () => {
    const facts = readFacts({
      schemaVersion: 1,
      facts: [
        { speciesId: 'animal-mole', fact: 'A mole can dig.', check: VERIFIED, source: 'RSPB' },
        { id: 'natural/animal-newt', text: 'A newt is an amphibian.', status: 'flagged' },
      ],
    })
    expect(facts.get('animal-mole')).toEqual({
      speciesId: 'animal-mole', fact: 'A mole can dig.', check: VERIFIED, source: 'RSPB',
    })
    /* The audit file keys `natural/animal-newt` and the roster keys
     * `animal-newt`. Either is accepted; both mean one creature. */
    expect(facts.get('animal-newt')?.fact).toBe('A newt is an amphibian.')
    expect(facts.get('animal-newt')?.check).toBe('flagged')
  })

  it('reads a map keyed by species id, and joins a source list', () => {
    const facts = readFacts({
      facts: { 'animal-elk': { fact: 'An elk is large.', sources: ['IUCN', 'WWF'] } },
    })
    expect(facts.get('animal-elk')?.source).toBe('IUCN · WWF')
  })

  it('never turns a FAILED check into a missing one', () => {
    /* `verified: false` is a fact that was checked and did not survive it —
     * a different statement from one nobody has looked at, and the difference
     * is the whole reason the field is separate from the sentence. */
    expect(readFacts({ facts: [{ speciesId: 'a', fact: 'x', verified: false }] }).get('a')?.check)
      .toBe('flagged')
    expect(readFacts({ facts: [{ speciesId: 'a', fact: 'x', verified: true }] }).get('a')?.check)
      .toBe(VERIFIED)
    expect(readFacts({ facts: [{ speciesId: 'a', fact: 'x' }] }).get('a')?.check).toBe('')
  })

  it('an absent file is an empty bench of facts, not a crash', () => {
    /* The fact agent lands after this surface does, so `null` is the state the
     * viewer opens in on the day it ships. */
    for (const shape of [null, undefined, {}, { facts: null }, 'nonsense', 42]) {
      expect(readFacts(shape).size).toBe(0)
    }
  })

  it('puts the fact and its check onto the creature, and says so when there is none', () => {
    const bench = builtBench(
      [rowFor('animal-mole'), rowFor('animal-newt')],
      readFacts({ facts: [{ speciesId: 'animal-mole', fact: 'A mole can dig.', check: VERIFIED }] }),
      FAKE,
    )
    expect(bench[0]).toMatchObject({ fact: 'A mole can dig.', factCheck: VERIFIED })
    expect(bench[1]).toMatchObject({ fact: '', factCheck: '', factSource: '' })
  })
})

describe('the progress he asked to see', () => {
  const bench = (...rows: AuditRow[]) => builtBench(rows, readFacts({
    facts: [
      { speciesId: 'animal-mole', fact: 'A mole can dig.', check: VERIFIED },
      { speciesId: 'animal-newt', fact: 'A newt is an amphibian.' },
    ],
  }), FAKE)

  it('counts only a real sign-off, and says it the way he asked', () => {
    const p = progressOf(bench(
      rowFor('animal-mole', { signoff: SIGNED_OFF }),
      /* A struck NAME is not a sign-off and is not the absence of one either. */
      rowFor('animal-newt', { verdict: STRUCK }),
      rowFor('animal-otter', { signoff: '' }),
      rowFor('animal-elk'),
    ))
    expect(p).toMatchObject({ done: 1, total: 4, left: 3, label: '1 of 4 signed off' })
  })

  it('separates a fact that is missing from one nobody checked', () => {
    const p = progressOf(bench(
      rowFor('animal-mole'), rowFor('animal-newt'), rowFor('animal-otter'), rowFor('animal-elk'),
    ))
    /* Two of the four have no sentence at all; of the two that do, one carries
     * no check. */
    expect(p.withoutFact).toBe(2)
    expect(p.unverified).toBe(1)
  })

  it('counts a tick that landed before any fact existed to cover it', () => {
    /* JT-031 makes the fact part of the sign-off, so this is the number that
     * says which ticks could not possibly have covered one. It is counted, not
     * prevented: locking the surface until the fact agent lands would leave him
     * unable to judge fifty models he asked to see. */
    const p = progressOf(bench(
      rowFor('animal-mole', { signoff: SIGNED_OFF }),
      rowFor('animal-elk', { signoff: SIGNED_OFF }),
    ))
    expect(p.done).toBe(2)
    expect(p.signedWithoutFact).toBe(1)
  })
})

/*
 * The claim the whole surface rests on.
 *
 * Joe is signing off what SHIPS. The viewer renders `buildSpecies(record.build)`
 * — the same call, on the same records, that `pets.ts` will make at the
 * integration seam — rather than a baked preview, precisely so that what he
 * approves cannot drift from what a child is dealt. These assertions are that
 * claim held to: the live registry, the live kits, real geometry out.
 *
 * Written against `KITS` rather than a hard-coded fifty so that a collection
 * whose kit has not been built yet — which `kit.ts` makes a loud, named error
 * rather than an empty group — does not read as a failure of this surface.
 */
describe('the models on the turntable are the real kit output', () => {
  const buildable = SHIPPED_SPECIES.filter(s => s.build && KITS[s.kit])

  it('has a real bench to show, off the live registry', () => {
    expect(buildable.length).toBeGreaterThanOrEqual(50)
    const live = builtBench([])
    expect(live.length).toBeGreaterThanOrEqual(buildable.length)
    /* And the frozen 24 are on the other side of the line, as roster §1 has it. */
    for (const id of ['animal-fox', 'animal-tiger', 'animal-panda']) {
      expect(live.map(c => c.speciesId)).not.toContain(id)
    }
  })

  it('every one of them constructs, with geometry in it', () => {
    for (const s of buildable) {
      const group = buildSpecies(s.build!)
      expect(group.children.length, `${s.id} built an empty group`).toBeGreaterThan(0)
    }
  })

  it('the live bench carries the name the hatch will actually use', () => {
    const live = builtBench([])
    for (const c of live) {
      expect(c.given).toBe(givenName(c.speciesId))
      expect(c.auditId).toBe(`${NATURAL_SET}/${c.speciesId}`)
    }
  })

  it('every benched creature belongs to a collection the roster knows', () => {
    const known = new Set(COLLECTIONS.map(c => c.id))
    for (const c of builtBench([])) {
      expect(known.has(c.collection), `${c.speciesId} → ${c.collection}`).toBe(true)
      expect(c.collectionName).not.toBe('')
    }
  })
})
