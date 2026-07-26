import { describe, it, expect } from 'vitest'
import { petName } from '../../src/core/names'
import { mulberry32 } from '../../src/core/rng'
import { REAL_BLOCK } from '../../src/core/alien'
import { markDigraphs } from '../../src/core/segmentation'

describe('petName', () => {
  it('is capitalised', () => {
    const rng = mulberry32(1)
    for (let i = 0; i < 500; i++) {
      const n = petName(rng)
      expect(n[0]).toBe(n[0]!.toUpperCase())
      expect(n.slice(1)).toBe(n.slice(1).toLowerCase())
    }
  })

  it('is never a real word', () => {
    const rng = mulberry32(2)
    for (let i = 0; i < 2000; i++) {
      expect(REAL_BLOCK.has(petName(rng).toLowerCase())).toBe(false)
    }
  })

  it('is decodable — segments cleanly into taught graphemes', () => {
    // The name is shown large at hatch and tappable forever after, so the
    // child must be able to read it. Built only from AL_* pools.
    const rng = mulberry32(3)
    for (let i = 0; i < 2000; i++) {
      const n = petName(rng).toLowerCase()
      expect(markDigraphs(n).map(s => s.txt).join('')).toBe(n)
    }
  })

  it('stays a sayable length', () => {
    const rng = mulberry32(4)
    for (let i = 0; i < 2000; i++) {
      const n = petName(rng)
      expect(n.length).toBeGreaterThanOrEqual(3)
      expect(n.length).toBeLessThanOrEqual(9)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = mulberry32(7), b = mulberry32(7)
    for (let i = 0; i < 50; i++) expect(petName(a)).toBe(petName(b))
  })

  it('has a large name space — 900+ distinct in 2000 draws', () => {
    // 768 pet variants each want a distinct-feeling name (brief section 5)
    const rng = mulberry32(8)
    const seen = new Set<string>()
    for (let i = 0; i < 2000; i++) seen.add(petName(rng))
    expect(seen.size).toBeGreaterThan(900)
  })
})
