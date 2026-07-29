/**
 * `joe/species-facts.json` is a proposal for a human, and the join is the risk.
 *
 * The file carries one child-facing fact per BUILT species, for Joe to sign off
 * alongside the model, the collection and the name. The review surface joins it
 * to the registry on `speciesId`, and that join is exactly the kind that fails
 * silently: a typo'd or renamed id produces no error anywhere, just a fact that
 * never appears in his bench and an animal he signs off blind. So the id join is
 * asserted in BOTH directions — every fact resolves to a shipped species, and
 * every shipped species has a fact.
 *
 * The second half asserts the honesty rules rather than the data. A flagged row
 * is the whole point of the file — the instruction was that a fact which could
 * not be verified stays visibly flagged rather than being quietly reworded until
 * it sounds safe — so the tests below pin the two ways that discipline could rot:
 * a verified row with no source (checked against nothing), and a flagged row with
 * no note (flagged for reasons nobody wrote down).
 *
 * The length bounds are the reading-age guardrail. Juno is six and learning to
 * read; a fact that grows to thirty words has stopped being for her.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SHIPPED_SPECIES, REGISTRY } from '../../src/island/species/registry'
import { SPECIES_NAMES, SPECIES_COLLECTION } from '../../src/island/species/roster'

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

const raw = readFileSync(resolve(root, 'joe/species-facts.json'), 'utf8')
const doc = JSON.parse(raw) as {
  schemaVersion: number
  coveredCollections: readonly string[]
  facts: readonly FactRow[]
}
const facts = doc.facts
const covers = new Set(doc.coveredCollections)

describe('joe/species-facts.json — shape', () => {
  it('is versioned', () => {
    expect(doc.schemaVersion).toBe(1)
  })

  it('is stored with LF endings, like every other joe/ file', () => {
    expect(raw).not.toContain('\r')
  })

  it('gives every row the fields the review surface reads', () => {
    for (const f of facts) {
      for (const k of [
        'speciesId', 'species', 'collection', 'fact', 'check',
        'source', 'sourceNote', 'proposedRewrite', 'verdict', 'replacement', 'note',
      ]) {
        expect(typeof (f as unknown as Record<string, unknown>)[k], `${f.speciesId}.${k}`)
          .toBe('string')
      }
    }
  })

  it('leaves Joe his three fields blank — they are his to fill', () => {
    for (const f of facts) {
      expect([f.verdict, f.replacement, f.note], f.speciesId).toEqual(['', '', ''])
    }
  })
})

describe('joe/species-facts.json — the id join', () => {
  it('names no species twice', () => {
    const ids = facts.map(f => f.speciesId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keys every fact to a species that has actually shipped', () => {
    for (const f of facts) expect(REGISTRY.has(f.speciesId), f.speciesId).toBe(true)
  })

  /**
   * Scoped to `coveredCollections` ON PURPOSE, and it is a real trade.
   *
   * Asserting against all of `SHIPPED_SPECIES` would mean the species manager
   * shipping a new collection breaks a test they did not write and cannot fix,
   * which is a bad way for two agents to share a tree. Scoping it means a newly
   * shipped collection instead goes quietly factless — so whoever ships one has
   * to add its id to `coveredCollections`, and the tripwire only arms when they
   * do. That is the honest shape of the compromise, not a gap nobody noticed.
   */
  it('covers every shipped species in the collections it claims to cover', () => {
    const covered = new Set(facts.map(f => f.speciesId))
    const missing = SHIPPED_SPECIES
      .filter(s => covers.has(s.collection) && !covered.has(s.id))
      .map(s => s.id)
    expect(missing).toEqual([])
  })

  it('claims no collection that does not exist', () => {
    const real = new Set(SHIPPED_SPECIES.map(s => s.collection))
    for (const c of doc.coveredCollections) expect(real.has(c), c).toBe(true)
  })

  it('files every fact under a collection it claims to cover', () => {
    for (const f of facts) expect(covers.has(f.collection), f.speciesId).toBe(true)
  })

  it('spells the printed name and the collection the way the roster does', () => {
    for (const f of facts) {
      expect(f.species, f.speciesId).toBe(SPECIES_NAMES[f.speciesId])
      expect(f.collection, f.speciesId).toBe(SPECIES_COLLECTION[f.speciesId])
    }
  })
})

describe('joe/species-facts.json — the checking discipline', () => {
  it('records a verdict of verified or flagged and nothing else', () => {
    for (const f of facts) expect(['verified', 'flagged'], f.speciesId).toContain(f.check)
  })

  it('never calls a fact verified without the source it was checked against', () => {
    for (const f of facts.filter(f => f.check === 'verified')) {
      expect(f.source, f.speciesId).toMatch(/^https:\/\//)
      expect(f.sourceNote.length, f.speciesId).toBeGreaterThan(0)
    }
  })

  it('never flags a fact without saying why', () => {
    for (const f of facts.filter(f => f.check === 'flagged')) {
      expect(f.sourceNote.length, f.speciesId).toBeGreaterThan(0)
    }
  })

  it('only offers a proposed rewrite on a flagged row', () => {
    for (const f of facts.filter(f => f.check === 'verified')) {
      expect(f.proposedRewrite, f.speciesId).toBe('')
    }
  })
})

describe('joe/species-facts.json — written for a six-year-old', () => {
  it('keeps every fact short enough to read aloud', () => {
    for (const f of facts) {
      const words = f.fact.trim().split(/\s+/).length
      expect(words, `${f.speciesId}: "${f.fact}"`).toBeGreaterThanOrEqual(6)
      expect(words, `${f.speciesId}: "${f.fact}"`).toBeLessThanOrEqual(20)
    }
  })

  it('keeps every fact to one or two sentences', () => {
    for (const f of facts) {
      const sentences = f.fact.trim().split(/[.!?]+/).filter(s => s.trim().length > 0)
      expect(sentences.length, f.speciesId).toBeLessThanOrEqual(2)
      expect(f.fact.trim().endsWith('.'), f.speciesId).toBe(true)
    }
  })

  it('uses no American spelling the roster would not use', () => {
    // Not exhaustive, and not meant to be — these are the ones a US-trained
    // draft actually reaches for on animal copy.
    const american = /\b(color|colors|gray|behavior|burrowing in the fall|fall)\b/i
    for (const f of facts) expect(american.test(f.fact), `${f.speciesId}: "${f.fact}"`).toBe(false)
  })
})
