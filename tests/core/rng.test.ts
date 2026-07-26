import { describe, it, expect } from 'vitest'
import { mulberry32, ri, shuffle } from '../../src/core/rng'

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = [a(), a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('differs between seeds', () => {
    expect(mulberry32(1)()).not.toEqual(mulberry32(2)())
  })
})

describe('ri', () => {
  it('returns integers in [0, n)', () => {
    const r = mulberry32(3)
    for (let i = 0; i < 500; i++) {
      const v = ri(r, 10)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10)
    }
  })
})

describe('shuffle', () => {
  it('mutates in place and returns the same array reference', () => {
    const a = [1, 2, 3, 4, 5]
    const out = shuffle(mulberry32(1), a)
    expect(out).toBe(a)
  })

  it('preserves the multiset of elements', () => {
    const a = [1, 2, 3, 4, 5, 5, 5]
    const out = [...shuffle(mulberry32(9), a)].sort()
    expect(out).toEqual([1, 2, 3, 4, 5, 5, 5])
  })

  it('is deterministic for a given seed', () => {
    const x = shuffle(mulberry32(11), [1, 2, 3, 4, 5, 6, 7, 8])
    const y = shuffle(mulberry32(11), [1, 2, 3, 4, 5, 6, 7, 8])
    expect(x).toEqual(y)
  })
})
