import { describe, it, expect } from 'vitest'
import { generateRead } from '../../../src/core/generators/read'
import type { ReadState } from '../../../src/core/generators/read'
import { makeDeck } from '../../../src/core/decks'
import { mulberry32 } from '../../../src/core/rng'
import { GREEN, RED, groupOf } from '../../../src/core/wordlists'
import { buildPool, buildNeighbours } from '../../../src/core/neighbours'
import { plainWord } from '../../../src/core/segmentation'

function harness(level = 1, seed = 1) {
  const rng = mulberry32(seed)
  return {
    state: { history: [], idx: -1 } as ReadState,
    deps: {
      rng,
      drawGreen: makeDeck(rng, GREEN),
      drawRed: makeDeck(rng, RED),
      neigh: buildNeighbours(buildPool()),
      level,
    },
  }
}

describe('generateRead — level 1', () => {
  it('starts at MIN words and grows by one per round, capped at MAX', () => {
    // v0:791 — n = min(MAX, MIN + history.length); MIN 3, MAX 12 (v0:697)
    const { state, deps } = harness()
    for (let i = 0; i < 20; i++) generateRead(state, deps)
    expect(state.history[0]).toHaveLength(3)
    expect(state.history[1]).toHaveLength(4)
    expect(state.history[9]).toHaveLength(12)
    expect(state.history[19]).toHaveLength(12)
  })

  it('sets idx to the newest round', () => {
    // v0:836
    const { state, deps } = harness()
    generateRead(state, deps)
    generateRead(state, deps)
    expect(state.idx).toBe(1)
    expect(state.idx).toBe(state.history.length - 1)
  })

  it('never repeats a plain word within a round', () => {
    // v0:794-797 clash() guards on the plained form
    const { state, deps } = harness(1, 42)
    for (let i = 0; i < 60; i++) generateRead(state, deps)
    for (const round of state.history) {
      const plains = round.map(p => plainWord(p.w))
      expect(new Set(plains).size).toBe(plains.length)
    }
  })

  it('never shows two words from the same confusable group in one round', () => {
    // v0:796 — "to" and "two" on screen together is a trap, not a test
    const { state, deps } = harness(1, 7)
    for (let i = 0; i < 60; i++) generateRead(state, deps)
    for (const round of state.history) {
      const groups = round
        .map(p => groupOf[plainWord(p.w)])
        .filter((g): g is number => g !== undefined)
      expect(new Set(groups).size).toBe(groups.length)
    }
  })

  it('mixes both word classes once rounds are large', () => {
    // NOT an exact count: neighbour substitution replaces a victim with
    // {w: nb.raw, cls: nb.cls} (v0:828), which can shift the red/green split
    // after the initial 35% draw (v0:792). Assert the guarantee, not the ratio.
    const { state, deps } = harness(1, 11)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    const big = state.history[29]!
    expect(big.filter(p => p.cls === 'red').length).toBeGreaterThan(0)
    expect(big.filter(p => p.cls === 'green').length).toBeGreaterThan(0)
  })

  it('plants at least one near-twin pair in a large round', () => {
    // v0:809-832 — the whole point: first-letter guessing must lose
    const { state, deps } = harness(1, 3)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    const neigh = buildNeighbours(buildPool())
    const round = state.history[29]!.map(p => plainWord(p.w))
    const hasTwin = round.some(a =>
      round.some(b => a !== b && (neigh[a] ?? []).some(e => plainWord(e.raw) === b)),
    )
    expect(hasTwin).toBe(true)
  })

  it('only emits words that exist in the curriculum', () => {
    const { state, deps } = harness(1, 13)
    const known = new Set([...GREEN, ...RED.map(plainWord)])
    for (let i = 0; i < 40; i++) generateRead(state, deps)
    for (const round of state.history) {
      for (const p of round) expect(known.has(plainWord(p.w))).toBe(true)
    }
  })
})

describe('generateRead — level 2 (alien words)', () => {
  it('caps rounds at 8 words', () => {
    // v0:778 — min(8, ...) rather than MAX; alien rounds stay shorter
    const { state, deps } = harness(2)
    for (let i = 0; i < 20; i++) generateRead(state, deps)
    expect(state.history[0]).toHaveLength(3)
    expect(state.history[19]).toHaveLength(8)
  })

  it('marks every alien word green and never repeats within a round', () => {
    // v0:784 — alien words are all 'green'; v0:782 dedupes
    const { state, deps } = harness(2, 5)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    for (const round of state.history) {
      expect(round.every(p => p.cls === 'green')).toBe(true)
      expect(new Set(round.map(p => p.w)).size).toBe(round.length)
    }
  })
})
