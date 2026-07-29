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

  it('level 3 adds units to a teen number and NEVER bridges ten', () => {
    /*
     * The rung between the two above it: the ten sits there untouched and the
     * units are counted on. `(a % 10) + b <= 9` is the whole of it — the
     * moment that sum reaches 10 the child is regrouping, which is level 2's
     * job and not this one's.
     */
    const s = fresh(), rng = mulberry32(11)
    for (let i = 0; i < 2000; i++) generateAdd(s, rng, 3)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(10)
      expect(p.a).toBeLessThanOrEqual(18)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeLessThanOrEqual(9)
      expect(p.a + p.b).toBeGreaterThanOrEqual(11)
      expect(p.a + p.b).toBeLessThanOrEqual(19)
      expect((p.a % 10) + p.b).toBeLessThanOrEqual(9)
      expect(p.op).toBe('add')
    }
  })

  it('level 3 reaches both ends of its range over many draws', () => {
    // A branch that only ever emits 10 + 1 would satisfy every invariant
    // above and teach nothing. Assert it is actually a range.
    const s = fresh(), rng = mulberry32(12)
    for (let i = 0; i < 3000; i++) generateAdd(s, rng, 3)
    const as = new Set(s.history.map(p => p.a))
    expect(as.has(10)).toBe(true)
    expect(as.has(18)).toBe(true)
    expect(s.history.some(p => p.b === 9)).toBe(true)   // only reachable at a = 10
    expect(s.history.some(p => (p.a % 10) + p.b === 9)).toBe(true)  // right up to the ten
  })

  it('spends the same two rng draws on every level, so the golden stays pinned', () => {
    /*
     * `tools/golden/golden.json` is frozen against levels 1 and 2. The new
     * branch may not cost a different number of draws from the ones either
     * side of it, or a stream that happens to pass through it would shift
     * every number after it.
     */
    for (const level of [1, 2, 3]) {
      const rng = mulberry32(13)
      let draws = 0
      const counted = () => { draws++; return rng() }
      generateAdd(fresh(), counted, level)
      expect(draws).toBe(2)
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
