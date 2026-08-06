import { describe, it, expect } from 'vitest'
import { generateRead } from '../../src/core/generators/read'
import type { ReadState } from '../../src/core/generators/read'
import { buildNeighbours, buildPool, lev1 } from '../../src/core/neighbours'
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
   * A "stop once the rung repeats" optimisation was tried here and reverted
   * the same day: it broke the very thing this test pins.
   *
   * `main.ts:190, 194-195` keeps ONE deck per rung for the WHOLE SESSION —
   * "created once and kept" — because `makeDeck`'s no-repeat promise only
   * means anything if the deck outlives a single deal. A "first raw repeat
   * this call means the rung is exhausted" check is only true if a deal
   * STARTS on a fresh pass boundary. A deal that then stops early leaves the
   * deck mid-pass, having popped and discarded one item of the NEXT pass just
   * to detect the repeat — so the following deal starts already missing that
   * word from ITS OWN fresh per-call bookkeeping, hits a repeat early, and
   * breaks before ever drawing it. Measured against a persistent 3-word deck
   * at n=12: 1224 of 2000 consecutive deals (61%) silently dropped one of the
   * rung's three approved words. Joe is about to hand-approve words a few at
   * a time, so a thin rung is not an edge case — it is the normal state for
   * weeks.
   *
   * This deals against ONE deck, created once, across several consecutive
   * rounds — main.ts's own pattern — and pins that every round still
   * surfaces every approved word. The old grind-to-guard loop this reverts to
   * always does, because guard (`n * 40`) draws far more than one pass no
   * matter where the deck happens to sit.
   */
  it('surfaces every approved word on every deal against a PERSISTENT deck, not just the first', () => {
    const rng = mulberry32(11)
    const words = ['frog', 'nest', 'sock']
    const deck = makeDeck(rng, words) // ONE deck, made once — main.ts's own pattern.
    const s: ReadState = { history: [], idx: -1 }
    const baseDeps = {
      rng,
      drawGreen: () => 'cat',
      drawRed: () => '[I]',
      neigh: buildNeighbours(buildPool()),
      level: 5,
      drawRung: (l: number) => (l === 5 ? deck : null),
    }
    // Grow history so n sits at MAX (12) for every round below — the exact
    // shape the guard exists to survive: a twelve-word page from a
    // three-word rung, deal after deal, forever.
    for (let i = 0; i < 9; i++) s.history.push([])
    s.idx = s.history.length - 1

    for (let round = 0; round < 25; round++) {
      generateRead(s, baseDeps)
      const page = s.history[s.idx]!.map(p => p.w)
      expect([...page].sort(), `round ${round}`).toEqual(['frog', 'nest', 'sock'])
    }
  })
})

describe('PB-087: a rung page plants near-twins, like every other page', () => {
  /*
   * ORDER IS THE WHOLE TEST. The deck deals in list order, so the first page
   * takes `pig`, `bed`, `sun` — no two of which are one edit apart. Their twins
   * (`pin`, `bad`, `sin`) sit further down the list, reachable ONLY through the
   * neighbour map. So a pair on the page can only have been planted.
   *
   * The first draft of this test used ['cat','cot',…] and was VACUOUS: the deck
   * dealt the pair adjacently, so it passed with the planting call deleted.
   * Caught by mutation, which is the only reason this comment exists.
   */
  const WORDS = ['pig', 'bed', 'sun', 'pin', 'bad', 'sin', 'dog', 'hat']

  const rungDeps = (withNeigh: boolean) => {
    const rng = mulberry32(7)
    let i = 0
    const deck = () => WORDS[i++ % WORDS.length] as string
    return {
      rng,
      drawGreen: () => 'cat',
      drawRed: () => '[I]',
      neigh: buildNeighbours(buildPool()),
      level: 5,
      rungIndex: 9,                       // top of the ladder: densest twins
      drawRung: (l: number) => (l === 5 ? deck : null),
      rungNeigh: withNeigh
        ? (l: number) => (l === 5
            ? buildNeighbours(WORDS.map(w => ({ raw: w, cls: 'green' as const })))
            : null)
        : undefined,
    }
  }

  it('puts a one-edit twin on the page', () => {
    /* `cat`/`cot` are one edit apart. With the map supplied, plantTwins swaps a
       word for a neighbour of one already picked, so a pair must be present —
       the whole point of the dial Joe asked for. */
    const s: ReadState = { history: [], idx: -1 }
    generateRead(s, rungDeps(true))
    const page = s.history[0]!.map(p => p.w)
    const paired = page.some((a, i) => page.some((b, j) => i !== j && lev1(a, b)))
    expect(paired, `no near-twin on the page: ${page.join(' ')}`).toBe(true)
  })

  it('still deals a page when the caller supplies no rung neighbours', () => {
    /* An older caller, or a rung whose words have no twins at all, must not
       throw or deal nothing — it simply gets an unpaired page. */
    const s: ReadState = { history: [], idx: -1 }
    generateRead(s, rungDeps(false))
    expect(s.history[0]!.length).toBeGreaterThan(0)
  })
})
