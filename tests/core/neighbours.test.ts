import { describe, it, expect } from 'vitest'
import { lev1, buildPool, buildNeighbours } from '../../src/core/neighbours'
import { plainWord } from '../../src/core/segmentation'

describe('lev1', () => {
  it('accepts single substitutions', () => {
    // v0:434-438 — equal length, exactly one differing position
    expect(lev1('sat', 'sit')).toBe(true)
    expect(lev1('cat', 'cot')).toBe(true)
  })

  it('accepts single insertions and deletions', () => {
    // v0:439-446
    expect(lev1('at', 'sat')).toBe(true)
    expect(lev1('sat', 'at')).toBe(true)
  })

  it('rejects identical words', () => {
    // v0:437 requires d === 1, so zero differences is false
    expect(lev1('sat', 'sat')).toBe(false)
  })

  it('rejects two or more substitutions', () => {
    expect(lev1('sat', 'sip')).toBe(false)
  })

  it('rejects a length difference greater than one', () => {
    // v0:433
    expect(lev1('a', 'sat')).toBe(false)
  })
})

describe('buildNeighbours', () => {
  const neigh = buildNeighbours(buildPool())

  it('pairs true single-edit neighbours', () => {
    // The point of the whole map: sat/sit defeats first-letter guessing (v0:809)
    expect((neigh['sat'] ?? []).map(e => plainWord(e.raw))).toContain('sit')
  })

  it('never lists a word as its own neighbour', () => {
    // v0:457 pa !== pb
    for (const [w, list] of Object.entries(neigh)) {
      expect(list.map(e => plainWord(e.raw))).not.toContain(w)
    }
  })

  it('excludes same-confusable-group pairs — "then" must not offer "them"', () => {
    // v0:458 — a listening game with both on screen is a trap, not a test
    expect((neigh['then'] ?? []).map(e => plainWord(e.raw))).not.toContain('them')
  })

  it('excludes "of"/"off" as neighbours of each other', () => {
    expect((neigh['of'] ?? []).map(e => plainWord(e.raw))).not.toContain('off')
  })

  it('has an entry for every pool word', () => {
    for (const e of buildPool()) expect(neigh[plainWord(e.raw)]).toBeDefined()
  })

  it('every listed neighbour really is one edit away', () => {
    for (const [w, list] of Object.entries(neigh)) {
      for (const e of list) expect(lev1(w, plainWord(e.raw))).toBe(true)
    }
  })

  it('preserves each entry class alongside its marked form', () => {
    // v0:449-451 — pool entries keep {raw, cls} so substitution can carry class
    for (const list of Object.values(neigh)) {
      for (const e of list) {
        expect(['green', 'red']).toContain(e.cls)
        expect(typeof e.raw).toBe('string')
      }
    }
  })
})

describe('buildPool', () => {
  it('lists green words before red, in list order', () => {
    // v0:448-451 — order matters; NEIGH iteration order derives from it
    const pool = buildPool()
    const firstRed = pool.findIndex(e => e.cls === 'red')
    expect(pool.slice(0, firstRed).every(e => e.cls === 'green')).toBe(true)
    expect(pool.slice(firstRed).every(e => e.cls === 'red')).toBe(true)
  })
})
