import { describe, it, expect } from 'vitest'
import { generateAdd, generateSub } from '../../../src/core/generators/sums'
import type { SumState } from '../../../src/core/generators/sums'
import { mulberry32 } from '../../../src/core/rng'
import { STAGES } from '../../../src/island/harness'

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
    for (const level of [1, 2, 3, 4, 5, 6, 7]) {
      const rng = mulberry32(13)
      let draws = 0
      const counted = () => { draws++; return rng() }
      generateAdd(fresh(), counted, level)
      expect(draws, `level ${level}`).toBe(2)
    }
  })

  /* ------------------------------------- the four rungs added on 4 August --- */

  /*
   * Joe: *"add some more summation levels."* Three rungs became seven; see
   * `STAGES.sums` in `harness.ts` for the ladder and why the ids are not in
   * numeric order. Levels 1, 2 and 3 above are untouched, which is what keeps
   * `golden.json` anchored — it pins ids 1 and 2 and may never be re-blessed.
   */
  it('level 4 stays within five — the gentlest rung, below where anyone starts', () => {
    const s = fresh(), rng = mulberry32(4)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 4)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.a + p.b).toBeLessThanOrEqual(5)
    }
    // And it really does use the room it has, rather than sitting on 1 + 1.
    expect(Math.max(...s.history.map(p => p.a + p.b))).toBe(5)
  })

  it('level 5 adds whole tens and never leaves a units digit', () => {
    const s = fresh(), rng = mulberry32(5)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 5)
    for (const p of s.history) {
      expect(p.a % 10, `a=${p.a}`).toBe(0)
      expect(p.b % 10, `b=${p.b}`).toBe(0)
      expect(p.a).toBeGreaterThanOrEqual(10)
      expect(p.b).toBeGreaterThanOrEqual(10)
      expect(p.a + p.b, `${p.a}+${p.b}`).toBeLessThanOrEqual(100)
    }
  })

  it('level 6 adds units to a two-digit number and NEVER carries', () => {
    const s = fresh(), rng = mulberry32(6)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 6)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(20)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeLessThanOrEqual(9)
      // THE GUARANTEE: the units never reach ten, so the tens digit sits still.
      expect((p.a % 10) + p.b, `${p.a}+${p.b} carries`).toBeLessThanOrEqual(9)
      expect(Math.floor((p.a + p.b) / 10), `${p.a}+${p.b} moved the tens`)
        .toBe(Math.floor(p.a / 10))
      expect(p.a + p.b).toBeLessThan(100)
    }
  })

  it('level 7 adds units to a two-digit number and ALWAYS carries', () => {
    const s = fresh(), rng = mulberry32(7)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 7)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(11)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeLessThanOrEqual(9)
      // The mirror of level 6, and of level 2 at a bigger size: the ten always
      // has to be broken open.
      expect((p.a % 10) + p.b, `${p.a}+${p.b} does not bridge`).toBeGreaterThanOrEqual(10)
      expect(p.a + p.b).toBeLessThan(100)
    }
  })

  it('gives every rung on the ladder a generator that answers', () => {
    /*
     * The tripwire the ladder needs: `STAGES.sums` is the list of rungs a child
     * can be dealt, and a rung whose id falls through to the `else` branch would
     * silently deal bridging-ten sums under another name. Asked over the real
     * ladder, so adding a rung without a branch is a red test here rather than a
     * wrong sum in front of a child.
     */
    const seen = new Map<number, string>()
    for (const level of STAGES.sums) {
      const s = fresh(), rng = mulberry32(99)
      for (let i = 0; i < 200; i++) generateAdd(s, rng, level)
      seen.set(level, s.history.map(p => `${p.a}+${p.b}`).join(' '))
    }
    // Every rung generates a DIFFERENT stream from every other: two rungs that
    // agree are two rungs where one has no branch of its own.
    const streams = [...seen.values()]
    expect(new Set(streams).size, 'two rungs generate identical sums').toBe(streams.length)
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
