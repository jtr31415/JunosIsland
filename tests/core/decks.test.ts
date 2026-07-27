import { describe, it, expect } from 'vitest'
import { makeDeck, makeMemoryDeck } from '../../src/core/decks'
import { mulberry32, ri } from '../../src/core/rng'

describe('makeDeck', () => {
  it('deals every item once before repeating any', () => {
    // v0:714 — no-repeat-until-exhausted is what stops the same word twice in a round
    const src = ['a', 'b', 'c', 'd', 'e']
    const draw = makeDeck(mulberry32(1), src)
    expect([draw(), draw(), draw(), draw(), draw()].sort()).toEqual([...src].sort())
  })

  it('reshuffles and deals a full second pass', () => {
    const draw = makeDeck(mulberry32(2), [1, 2, 3, 4])
    const got = Array.from({ length: 8 }, draw)
    expect(got.slice(0, 4).sort()).toEqual([1, 2, 3, 4])
    expect(got.slice(4, 8).sort()).toEqual([1, 2, 3, 4])
  })

  it('does not mutate the source array', () => {
    // v0:714 copies with [...src] before shuffling
    const src = ['x', 'y', 'z']
    const draw = makeDeck(mulberry32(3), src)
    draw(); draw(); draw(); draw()
    expect(src).toEqual(['x', 'y', 'z'])
  })

  it('is deterministic for a given seed', () => {
    const a = makeDeck(mulberry32(5), [1, 2, 3, 4, 5])
    const b = makeDeck(mulberry32(5), [1, 2, 3, 4, 5])
    expect(Array.from({ length: 12 }, a)).toEqual(Array.from({ length: 12 }, b))
  })

  it('handles a single-item source', () => {
    const draw = makeDeck(mulberry32(6), ['only'])
    expect([draw(), draw(), draw()]).toEqual(['only', 'only', 'only'])
  })

  it('consumes no RNG until the first draw', () => {
    // v0:714 shuffles lazily inside the returned closure, not at creation.
    // The golden reproduction depends on this: deck creation order must not
    // shift the shared number stream.
    let calls = 0
    const rng = () => { calls++; return mulberry32(1)() }
    const draw = makeDeck(rng, [1, 2, 3])
    expect(calls).toBe(0)
    draw()
    expect(calls).toBeGreaterThan(0)
  })
})

/**
 * The gentler dealer, added for the species draw.
 *
 * Joe, from playtesting: *"investigate: two cats spawned in a row."* A uniform
 * pick over 24 repeats one hatch in 24, which is correct and reads as broken.
 * `makeDeck` fixes that completely and costs too much — see the design tests at
 * the bottom, which are the argument for the short window written down.
 *
 * Everything here is seeded, so "statistical" means "a large deterministic
 * sample", not "a test that sometimes passes".
 */
describe('makeMemoryDeck', () => {
  const ABC = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  /** The shortest gap between two equal items in a sequence. Infinity if none. */
  const closestRepeat = <T,>(seq: readonly T[]): number => {
    const last = new Map<T, number>()
    let best = Infinity
    seq.forEach((v, i) => {
      const at = last.get(v)
      if (at !== undefined) best = Math.min(best, i - at)
      last.set(v, i)
    })
    return best
  }

  it('never repeats anything inside the memory window', () => {
    /*
     * The property, over a large sample rather than one lucky sequence: with a
     * memory of 3, no two equal items may be fewer than 4 apart, anywhere.
     */
    for (const seed of [1, 2, 3, 4, 5]) {
      const draw = makeMemoryDeck(mulberry32(seed), ABC, 3)
      const seq = Array.from({ length: 20000 }, draw)
      expect(closestRepeat(seq), `seed ${seed}`).toBeGreaterThan(3)
    }
  })

  it('remembers exactly that many and not one more', () => {
    /*
     * The other half, and the half that stops this quietly becoming a full
     * deck: an item must be free again the moment it leaves the window. Over
     * 20,000 draws with memory 3 the minimum gap must be exactly 4 — seen, not
     * merely permitted.
     */
    const draw = makeMemoryDeck(mulberry32(7), ABC, 3)
    const seq = Array.from({ length: 20000 }, draw)
    expect(closestRepeat(seq)).toBe(4)
  })

  it('still deals every item, and deals them evenly', () => {
    /*
     * A memory changes the ORDER, not the odds. Nothing may become rare: the
     * long-run share of each item stays 1/n, which is what keeps "any friend
     * could be next" true.
     */
    const draw = makeMemoryDeck(mulberry32(11), ABC, 3)
    const counts = new Map<string, number>(ABC.map(v => [v, 0]))
    const n = 80000
    for (let i = 0; i < n; i++) {
      const v = draw()
      counts.set(v, (counts.get(v) as number) + 1)
    }
    const want = n / ABC.length
    for (const v of ABC) {
      expect(counts.get(v) as number, v).toBeGreaterThan(want * 0.9)
      expect(counts.get(v) as number, v).toBeLessThan(want * 1.1)
    }
  })

  it('does not starve when the memory is larger than the pack', () => {
    // Clamped to n-1, so there is always at least one item to deal. Asking for
    // a window of 10 over three items must cycle, not hang and not throw.
    const draw = makeMemoryDeck(mulberry32(13), ['x', 'y', 'z'], 10)
    const seq = Array.from({ length: 300 }, draw)
    expect(seq).toHaveLength(300)
    expect(new Set(seq)).toEqual(new Set(['x', 'y', 'z']))
    expect(closestRepeat(seq)).toBe(3)
  })

  it('handles a single-item source, and a memory of nought', () => {
    expect(Array.from({ length: 5 }, makeMemoryDeck(mulberry32(17), ['only'], 4)))
      .toEqual(['only', 'only', 'only', 'only', 'only'])
    const none = makeMemoryDeck(mulberry32(19), ABC, 0)
    expect(Array.from({ length: 50 }, none)).toHaveLength(50)
  })

  it('takes a history it did not deal itself', () => {
    /*
     * How the island survives a reload without a save change: the memory is
     * primed from the pets she already owns. Remembering a, b, c must make the
     * next three draws avoid them.
     */
    const draw = makeMemoryDeck(mulberry32(23), ABC, 3)
    draw.remember(['a', 'b', 'c'])
    expect(['a', 'b', 'c']).not.toContain(draw())
  })

  it('REPLACES the history rather than adding to it', () => {
    // remember() states what has been seen. Two calls must not stack up into a
    // window longer than the deck was asked for.
    const draw = makeMemoryDeck(mulberry32(29), ABC, 3)
    draw.remember(['a', 'b', 'c'])
    draw.remember(['d'])
    const got = Array.from({ length: 200 }, draw)
    expect(got).toContain('a')
  })

  it('ignores a history item that is not in the pack', () => {
    // An old save could name a species that no longer ships. It must not eat a
    // memory slot and it must not throw.
    const draw = makeMemoryDeck(mulberry32(31), ABC, 2)
    draw.remember(['ghost', 'a'])
    const got = Array.from({ length: 20 }, draw)
    expect(got[0]).not.toBe('a')
  })

  it('does not mutate the source array', () => {
    const src = ['x', 'y', 'z']
    const draw = makeMemoryDeck(mulberry32(37), src, 1)
    for (let i = 0; i < 10; i++) draw()
    expect(src).toEqual(['x', 'y', 'z'])
  })

  it('is deterministic for a given seed', () => {
    const a = makeMemoryDeck(mulberry32(41), ABC, 3)
    const b = makeMemoryDeck(mulberry32(41), ABC, 3)
    expect(Array.from({ length: 40 }, a)).toEqual(Array.from({ length: 40 }, b))
  })

  it('consumes no RNG until the first draw', () => {
    // Same contract as makeDeck, for the same reason: constructing a dealer
    // must not shift a shared number stream.
    let calls = 0
    const rng = (): number => { calls++; return mulberry32(1)() }
    const draw = makeMemoryDeck(rng, ABC, 3)
    draw.remember(['a'])
    expect(calls).toBe(0)
    draw()
    expect(calls).toBeGreaterThan(0)
  })
})

/**
 * Why a WINDOW and not a full deck — the design decision, as numbers.
 *
 * Both dealers stop "two cats in a row". They differ in what they do to the
 * gap between one cat and the next, and that is the whole argument.
 */
describe('a short memory against a full deck, over 24 items', () => {
  const PACK = Array.from({ length: 24 }, (_, i) => i)
  const gaps = (next: () => number, n: number): number[] => {
    const last = new Map<number, number>()
    const out: number[] = []
    for (let i = 0; i < n; i++) {
      const v = next()
      const at = last.get(v)
      if (at !== undefined) out.push(i - at)
      last.set(v, i)
    }
    return out
  }
  const mean = (a: readonly number[]): number =>
    a.reduce((s, v) => s + v, 0) / a.length
  const share = (a: readonly number[], p: (v: number) => boolean): number =>
    a.filter(p).length / a.length

  it('leaves a favourite as likely to return as chance ever made her', () => {
    /*
     * Mean gap is ~24 under all three dealers, so the memory is not a tax on
     * anybody's favourite — it is purely a rearrangement.
     */
    const rngA = mulberry32(101)
    const flat = gaps(() => ri(rngA, 24), 60000)
    const window5 = gaps(makeMemoryDeck(mulberry32(102), PACK, 5), 60000)
    const full = gaps(makeDeck(mulberry32(103), PACK), 60000)

    for (const [name, g] of [['flat', flat], ['window', window5], ['deck', full]] as const) {
      expect(mean(g), name).toBeGreaterThan(22)
      expect(mean(g), name).toBeLessThan(26)
    }
  })

  it('is what a full deck costs: a favourite is always about 24 away', () => {
    /*
     * The full deck's gaps pile up around 24 — a quarter of them within ±4 of
     * it, and almost none short. That is a collection that reads as a rota. The
     * window keeps chance's own long tail of short gaps, so an animal she loved
     * can turn up again the same afternoon.
     */
    const window5 = gaps(makeMemoryDeck(mulberry32(211), PACK, 5), 60000)
    const full = gaps(makeDeck(mulberry32(212), PACK), 60000)

    // Measured over 60,000: 0.136 for the deck against 0.315 for the window.
    expect(share(full, g => g <= 12)).toBeLessThan(0.16)
    expect(share(window5, g => g <= 12)).toBeGreaterThan(0.25)
  })

  it('and a full deck does not even fix the reported bug — the seam repeats', () => {
    /*
     * The finding that settles it. `makeDeck` reshuffles when it runs dry, and
     * nothing stops the last card of one pass matching the first of the next:
     * a 1-in-24 chance at every seam. MEASURED over 60,000 draws: 110 of them,
     * which is one back-to-back pair every ~545 hatches — better than the 2,477
     * a memoryless draw gives, and still not never.
     *
     * So "reuse makeDeck" would have left Joe's exact symptom in the game, at a
     * fifth of the rate and with the whole cost of a rota. A window forbids it
     * outright, because the window straddles the seam by construction.
     */
    const rng = mulberry32(313)
    const flat = Array.from({ length: 60000 }, () => ri(rng, 24))
    const window5 = Array.from({ length: 60000 }, makeMemoryDeck(mulberry32(314), PACK, 5))
    const full = Array.from({ length: 60000 }, makeDeck(mulberry32(315), PACK))

    const adjacent = (s: readonly number[]): number =>
      s.filter((v, i) => i > 0 && v === s[i - 1]).length

    expect(adjacent(flat)).toBeGreaterThan(2000)   // the bug, measured
    expect(adjacent(full)).toBeGreaterThan(0)      // the near-miss, measured
    expect(adjacent(window5)).toBe(0)              // the fix
  })
})
