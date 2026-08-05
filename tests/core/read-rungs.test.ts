import { describe, it, expect } from 'vitest'
import { generateRead } from '../../src/core/generators/read'
import type { ReadState } from '../../src/core/generators/read'
import { buildNeighbours, buildPool } from '../../src/core/neighbours'
import { mulberry32 } from '../../src/core/rng'
import { makeDeck } from '../../src/core/decks'

const deps = (level: number, words: string[]) => {
  const rng = mulberry32(42)
  let i = 0
  return {
    rng,
    drawGreen: () => 'cat',
    drawRed: () => '[I]',
    neigh: buildNeighbours(buildPool()),
    level,
    drawRung: (l: number) =>
      l === level && words.length ? () => words[i++ % words.length] as string : null,
  }
}

const fresh = (): ReadState => ({ history: [], idx: -1 })

describe('a rung page', () => {
  it('draws only from that rung\'s approved words', () => {
    const s = fresh()
    generateRead(s, deps(5, ['frog', 'nest', 'sock']))
    const page = s.history[0]!.map(p => p.w)
    for (const w of page) expect(['frog', 'nest', 'sock']).toContain(w)
  })

  it('deals nothing from GREEN or RED on a rung level', () => {
    const s = fresh()
    generateRead(s, deps(5, ['frog', 'nest', 'sock']))
    expect(s.history[0]!.map(p => p.w)).not.toContain('cat')
  })

  it('falls through to the old page when the rung has no approved words', () => {
    const s = fresh()
    generateRead(s, deps(5, []))
    // the level-1 body ran, so GREEN's word is present
    expect(s.history[0]!.map(p => p.w)).toContain('cat')
  })

  it('leaves level 1 exactly as it was', () => {
    const a = fresh(), b = fresh()
    generateRead(a, { ...deps(1, []), drawRung: undefined })
    generateRead(b, deps(1, ['frog']))
    expect(b.history[0]).toEqual(a.history[0])
  })

  /*
   * The confusable guard (wordlists.ts's CONFUSABLE / groupOf), which the spec
   * lists under "what this does not change" — but the rung branch dedupes on
   * exact string only, and a drafted ledger can perfectly well contain `to`
   * alongside `too` at the same rung. A listening game with both on screen at
   * once is a trap, not a test.
   */
  it('never deals two words from the same confusable group on one rung page (5 Aug fix)', () => {
    const s = fresh()
    generateRead(s, deps(5, ['to', 'too', 'frog']))
    const words = s.history[0]!.map(p => p.w)
    expect(words.includes('to') && words.includes('too')).toBe(false)
    /* And it is not merely refusing the whole page — the word with no
     * confusable conflict still gets dealt. */
    expect(words).toContain('frog')
  })

  /*
   * Fix 5: a thin rung must not grind. With three approved words and n = 12
   * (MIN + 9 rounds of history), the old loop burned ~480 deck draws and ~160
   * reshuffles to arrive at the very same three-word page. `makeDeck` never
   * repeats within one pass through its source list — it only reshuffles a
   * fresh pass once that list is exhausted — so the FIRST raw repeat is proof
   * the rung has nothing left to offer, and the fix stops there instead of
   * grinding to the guard. The resulting page must be unchanged: exactly the
   * three approved words, no more, no fewer.
   */
  it('stops drawing once a thin rung is exhausted, rather than grinding to the guard (5 Aug fix)', () => {
    const s: ReadState = { history: Array.from({ length: 9 }, () => []), idx: 8 } // n = min(12, 3+9) = 12
    const rng = mulberry32(7)
    const words = ['frog', 'nest', 'sock']
    const deck = makeDeck(rng, words)
    let calls = 0
    generateRead(s, {
      rng,
      drawGreen: () => 'cat',
      drawRed: () => '[I]',
      neigh: buildNeighbours(buildPool()),
      level: 5,
      drawRung: l => l === 5 ? () => { calls++; return deck() } : null,
    })
    const page = s.history[9]!.map(p => p.w)
    expect([...page].sort()).toEqual(['frog', 'nest', 'sock'])
    /* Old behaviour allowed up to n * 40 = 480 draws to reach this same page. */
    expect(calls).toBeLessThan(10)
  })
})
