import { describe, it, expect } from 'vitest'
import { generateAdd, generateSub } from '../../../src/core/generators/sums'
import type { SumState } from '../../../src/core/generators/sums'
import { mulberry32 } from '../../../src/core/rng'

const fresh = (): SumState => ({ history: [], idx: -1 })

describe('generateAdd', () => {
  it('level 1 stays within 10', () => {
    // v0:979-980 — a in 1..9, b in 1..(10-a)
    const s = fresh(), rng = mulberry32(1)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 1)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.a + p.b).toBeLessThanOrEqual(10)
      expect(p.op).toBe('add')
    }
  })

  it('level 2 bridges 10 — every sum exceeds 10 but stays within 20', () => {
    // v0:982-984 — bmin = max(1, 11-a) forces the total over ten
    const s = fresh(), rng = mulberry32(2)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 2)
    for (const p of s.history) {
      expect(p.a + p.b).toBeGreaterThan(10)
      expect(p.a + p.b).toBeLessThanOrEqual(20)
    }
  })

  it('rarely repeats the immediately previous sum', () => {
    // v0:986 — the guard gives up after 6 collisions, so a repeat is
    // permitted, just very unlikely. Assert the guard works, not perfection.
    const s = fresh(), rng = mulberry32(3)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 1)
    let repeats = 0
    for (let i = 1; i < s.history.length; i++) {
      if (s.history[i]!.a === s.history[i - 1]!.a && s.history[i]!.b === s.history[i - 1]!.b) repeats++
    }
    expect(repeats).toBeLessThan(5)
  })

  it('sets idx to the newest item', () => {
    // v0:988
    const s = fresh(), rng = mulberry32(4)
    generateAdd(s, rng, 1)
    generateAdd(s, rng, 1)
    expect(s.idx).toBe(1)
  })
})

describe('generateSub', () => {
  it('level 1 never goes negative and stays within 10', () => {
    // v0:996-997 — b in 1..a guarantees a non-negative answer
    const s = fresh(), rng = mulberry32(5)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 1)
    for (const p of s.history) {
      expect(p.a).toBeLessThanOrEqual(9)
      expect(p.b).toBeLessThanOrEqual(p.a)
      expect(p.a - p.b).toBeGreaterThanOrEqual(0)
      expect(p.op).toBe('sub')
    }
  })

  it('level 2 subtracts a single digit from the teens', () => {
    // v0:999-1000 — a in 11..20, b in 1..9
    const s = fresh(), rng = mulberry32(6)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 2)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(11)
      expect(p.a).toBeLessThanOrEqual(20)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeLessThanOrEqual(9)
      expect(p.a - p.b).toBeGreaterThanOrEqual(0)
    }
  })

  it('level 3 works to 20 and never goes negative', () => {
    // v0:1002-1003
    const s = fresh(), rng = mulberry32(7)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 3)
    for (const p of s.history) {
      expect(p.a).toBeLessThanOrEqual(20)
      expect(p.a - p.b).toBeGreaterThanOrEqual(0)
    }
  })
})
