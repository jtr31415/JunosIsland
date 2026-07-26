import { describe, it, expect } from 'vitest'
import { GREEN, RED, CONFUSABLE, groupOf } from '../../src/core/wordlists'

describe('wordlists', () => {
  it('has the expected list sizes', () => {
    // v0:368-374 (GREEN) and v0:377-383 (RED), counted by executing the literals
    expect(GREEN).toHaveLength(56)
    expect(RED).toHaveLength(41)
  })

  it('GREEN words are plain — no bracket markup', () => {
    for (const w of GREEN) expect(w).not.toMatch(/[[\]]/)
  })

  it('every RED word carries balanced bracket markup', () => {
    // v0:375-376 — brackets wrap the tricky bit that breaks the taught code
    for (const w of RED) {
      const opens = (w.match(/\[/g) ?? []).length
      const closes = (w.match(/\]/g) ?? []).length
      expect(opens).toBe(closes)
      expect(opens).toBeGreaterThan(0)
    }
  })

  it('groupOf maps every confusable word to its group index', () => {
    // v0:394-395
    expect(groupOf['to']).toBe(groupOf['too'])
    expect(groupOf['to']).toBe(groupOf['two'])
    expect(groupOf['of']).toBe(groupOf['off'])
    expect(groupOf['then']).toBe(groupOf['them'])
    expect(groupOf['to']).not.toBe(groupOf['of'])
    expect(groupOf['cat']).toBeUndefined()
  })

  it('CONFUSABLE groups are disjoint', () => {
    const seen = new Set<string>()
    for (const g of CONFUSABLE) for (const w of g) {
      expect(seen.has(w)).toBe(false)
      seen.add(w)
    }
  })
})
