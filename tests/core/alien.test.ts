import { describe, it, expect } from 'vitest'
import { alienWord, REAL_BLOCK, AL_ONSETS, AL_VOWELS } from '../../src/core/alien'
import { mulberry32 } from '../../src/core/rng'
import { markDigraphs } from '../../src/core/segmentation'

describe('alienWord', () => {
  it('never produces a real word', () => {
    // v0:500 — the REAL_BLOCK filter is the whole point of the screening check
    const rng = mulberry32(1)
    for (let i = 0; i < 5000; i++) expect(REAL_BLOCK.has(alienWord(rng))).toBe(false)
  })

  it('never exceeds five characters', () => {
    // v0:499
    const rng = mulberry32(2)
    for (let i = 0; i < 5000; i++) expect(alienWord(rng).length).toBeLessThanOrEqual(5)
  })

  it('never ends with the grapheme it starts with', () => {
    // v0:497 skips any draw where onset === coda, so no "bab"/"dad" shapes
    const rng = mulberry32(3)
    const onsets = [...AL_ONSETS].sort((a, b) => b.length - a.length)
    const vowels = [...AL_VOWELS].sort((a, b) => b.length - a.length)
    for (let i = 0; i < 2000; i++) {
      const w = alienWord(rng)
      const on = onsets.find(o => w.startsWith(o)) as string
      const rest = w.slice(on.length)
      const v = vowels.find(x => rest.startsWith(x)) as string
      expect(rest.slice(v.length)).not.toBe(on)
    }
  })

  it('is built only from taught graphemes', () => {
    // Every alien word must segment cleanly, or a child cannot decode it
    const rng = mulberry32(4)
    for (let i = 0; i < 2000; i++) {
      const w = alienWord(rng)
      expect(markDigraphs(w).map(s => s.txt).join('')).toBe(w)
      expect(AL_VOWELS.some(v => w.includes(v))).toBe(true)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = mulberry32(99), b = mulberry32(99)
    for (let i = 0; i < 50; i++) expect(alienWord(a)).toBe(alienWord(b))
  })

  it('produces variety — at least 100 distinct words in 1000 draws', () => {
    const rng = mulberry32(5)
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) seen.add(alienWord(rng))
    expect(seen.size).toBeGreaterThan(100)
  })

  it('consumes the RNG in vowel, onset, coda order', () => {
    // v0:493-496 — the order fixes which word comes out of a given seed.
    // Reordering the three draws still yields "valid" words, so only this
    // reproduces the original's stream. The golden diff depends on it.
    const draws: number[] = []
    const spy = () => { const r = mulberry32(7); return () => { const v = r(); draws.push(v); return v } }
    const rng = spy()
    const w = alienWord(rng)
    const v = AL_VOWELS[Math.floor(draws[0] as number * AL_VOWELS.length)] as string
    expect(w.startsWith(AL_ONSETS[Math.floor(draws[1] as number * AL_ONSETS.length)] as string)).toBe(true)
    expect(w).toContain(v)
  })
})

describe('REAL_BLOCK', () => {
  it('contains every taught word so alien words never collide with the curriculum', () => {
    // v0:468 spreads GREEN and RED (plained) into the set
    expect(REAL_BLOCK.has('jump')).toBe(true)
    expect(REAL_BLOCK.has('said')).toBe(true)
    expect(REAL_BLOCK.has('cat')).toBe(true)
  })
})
