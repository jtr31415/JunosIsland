import { describe, it, expect } from 'vitest'
import { plainWord, parseMark, markDigraphs, GRAPHS } from '../../src/core/segmentation'
import { GREEN, RED } from '../../src/core/wordlists'

describe('plainWord', () => {
  it('strips bracket markup', () => {
    // v0:398
    expect(plainWord('s[ai]d')).toBe('said')
    expect(plainWord('[who]')).toBe('who')
    expect(plainWord('c[o]m[e]')).toBe('come')
  })

  it('leaves unmarked words untouched', () => {
    expect(plainWord('jump')).toBe('jump')
  })
})

describe('parseMark', () => {
  it('splits into plain and tricky segments', () => {
    // v0:400-409
    expect(parseMark('s[ai]d')).toEqual([
      { txt: 's', k: 'plain' },
      { txt: 'ai', k: 'tricky' },
      { txt: 'd', k: 'plain' },
    ])
  })

  it('handles a word that is entirely tricky', () => {
    expect(parseMark('[who]')).toEqual([{ txt: 'who', k: 'tricky' }])
  })

  it('handles multiple tricky bits', () => {
    expect(parseMark('c[o]m[e]')).toEqual([
      { txt: 'c', k: 'plain' },
      { txt: 'o', k: 'tricky' },
      { txt: 'm', k: 'plain' },
      { txt: 'e', k: 'tricky' },
    ])
  })

  it('round-trips: concatenated segments equal the plain word', () => {
    for (const w of RED) {
      expect(parseMark(w).map(s => s.txt).join('')).toBe(plainWord(w))
    }
  })
})

describe('markDigraphs', () => {
  it('finds a digraph', () => {
    // v0:417-428
    expect(markDigraphs('shop')).toEqual([
      { txt: 'sh', k: 'di' },
      { txt: 'op', k: 'plain' },
    ])
  })

  it('prefers longer graphemes — trigraphs win', () => {
    // v0:411 "longest first so trigraphs win"
    expect(markDigraphs('night')).toEqual([
      { txt: 'n', k: 'plain' },
      { txt: 'igh', k: 'di' },
      { txt: 't', k: 'plain' },
    ])
  })

  it('coalesces consecutive plain letters into one segment', () => {
    // v0:423 appends to the previous plain run rather than starting a new one
    expect(markDigraphs('stop')).toEqual([{ txt: 'stop', k: 'plain' }])
  })

  it('round-trips every GREEN word', () => {
    for (const w of GREEN) {
      expect(markDigraphs(w).map(s => s.txt).join('')).toBe(w)
    }
  })

  it('round-trips every RED word once plained', () => {
    for (const w of RED) {
      const p = plainWord(w)
      expect(markDigraphs(p).map(s => s.txt).join('')).toBe(p)
    }
  })

  it('lists trigraphs before digraphs so longest-first matching works', () => {
    // v0:412-415 — order in GRAPHS is the matching priority
    expect(GRAPHS.indexOf('igh')).toBeLessThan(GRAPHS.indexOf('ch'))
    expect(GRAPHS.indexOf('ear')).toBeLessThan(GRAPHS.indexOf('ea'))
  })
})
