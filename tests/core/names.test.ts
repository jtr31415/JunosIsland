import { describe, it, expect } from 'vitest'
import { petName, _rejected } from '../../src/core/names'
import { mulberry32 } from '../../src/core/rng'
import { AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, REAL_BLOCK } from '../../src/core/alien'

/**
 * Parse a name against the ACTUAL pools.
 *
 * A markDigraphs round-trip would prove nothing here: markDigraphs is total and
 * lossless, so every string round-trips, including "xqzw". Decodability means
 * the name decomposes into the syllable shapes the generator claims to build,
 * using only graphemes the child has been taught.
 */
function parses(name: string): boolean {
  const w = name.toLowerCase()
  const longestFirst = (xs: readonly string[]) => [...new Set(xs)].sort((a, b) => b.length - a.length)
  const ON = longestFirst(AL_ONSETS)
  const VO = longestFirst(AL_VOWELS)
  const CO = longestFirst(AL_CODAS_SHORT)

  // open = onset + vowel; closed = onset + vowel + coda
  const syllables = (at: number, closed: boolean): number[] => {
    const outs: number[] = []
    for (const o of ON) {
      if (!w.startsWith(o, at)) continue
      for (const v of VO) {
        if (!w.startsWith(v, at + o.length)) continue
        if (!closed) { outs.push(at + o.length + v.length); continue }
        for (const c of CO) {
          if (w.startsWith(c, at + o.length + v.length)) outs.push(at + o.length + v.length + c.length)
        }
      }
    }
    return outs
  }

  // Either open+closed or closed+open, consuming the whole name.
  for (const [first, second] of [[false, true], [true, false]] as const) {
    for (const mid of syllables(0, first)) {
      for (const end of syllables(mid, second)) if (end === w.length) return true
    }
  }
  return false
}

describe('petName', () => {
  it('is capitalised', () => {
    const rng = mulberry32(1)
    for (let i = 0; i < 500; i++) {
      const n = petName(rng)
      expect(n[0]).toBe(n[0]!.toUpperCase())
      expect(n.slice(1)).toBe(n.slice(1).toLowerCase())
    }
  })

  it('decomposes into two syllables built only from the taught pools', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 3000; i++) {
      const n = petName(rng)
      expect(parses(n), `"${n}" does not parse against the pools`).toBe(true)
    }
  })

  it('is never a real word', () => {
    const rng = mulberry32(2)
    for (let i = 0; i < 3000; i++) {
      expect(REAL_BLOCK.has(petName(rng).toLowerCase())).toBe(false)
    }
  })

  it('never produces a scary, rude or insulting name', () => {
    // All four of these are constructible from the pools and were reachable
    // before the screen existed. The game is for a five-year-old and the
    // brief's first principle is "bright, never scary".
    for (const bad of ['satan', 'demon', 'vomit', 'moron', 'poobum', 'devil', 'killo', 'bumbo']) {
      expect(_rejected(bad), `"${bad}" must be rejected`).toBe(true)
    }
  })

  it('rejects triple letters and a final bare e', () => {
    expect(_rejected('belllo')).toBe(true)   // undecodable cluster at the join
    expect(_rejected('tunbe')).toBe(true)    // invites the silent-e reading
    expect(_rejected('bimon')).toBe(false)   // control: fine
  })

  it('never emits a name ending in a bare e or containing a triple letter', () => {
    const rng = mulberry32(9)
    for (let i = 0; i < 3000; i++) {
      const n = petName(rng).toLowerCase()
      expect(n.endsWith('e')).toBe(false)
      expect(/(.)\1\1/.test(n)).toBe(false)
    }
  })

  it('stays a sayable length', () => {
    // Minimum is really 5 (onset+vowel+onset+vowel+coda), not 3
    const rng = mulberry32(4)
    for (let i = 0; i < 2000; i++) {
      const n = petName(rng)
      expect(n.length).toBeGreaterThanOrEqual(5)
      expect(n.length).toBeLessThanOrEqual(9)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = mulberry32(7), b = mulberry32(7)
    for (let i = 0; i < 50; i++) expect(petName(a)).toBe(petName(b))
  })

  it('has a large name space — 1900+ distinct in 2000 draws', () => {
    // The space is ~647k before screening, so near-total distinctness is the
    // real expectation. A loose threshold would pass even if it collapsed.
    const rng = mulberry32(8)
    const seen = new Set<string>()
    for (let i = 0; i < 2000; i++) seen.add(petName(rng))
    expect(seen.size).toBeGreaterThan(1900)
  })

  it('never falls back to the default under normal use', () => {
    // 'Bimo' is the 60-attempt escape hatch; if the screen were too aggressive
    // it would show up constantly.
    const rng = mulberry32(21)
    let fallbacks = 0
    for (let i = 0; i < 5000; i++) if (petName(rng) === 'Bimo') fallbacks++
    expect(fallbacks).toBeLessThan(5)
  })
})
