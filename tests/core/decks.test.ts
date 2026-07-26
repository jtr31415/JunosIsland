import { describe, it, expect } from 'vitest'
import { makeDeck } from '../../src/core/decks'
import { mulberry32 } from '../../src/core/rng'

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
