import { describe, it, expect } from 'vitest'
import { generateBuild } from '../../../src/core/generators/build'
import type { BuildState } from '../../../src/core/generators/build'
import { makeDeck } from '../../../src/core/decks'
import { mulberry32 } from '../../../src/core/rng'
import { GREEN } from '../../../src/core/wordlists'
import { markDigraphs } from '../../../src/core/segmentation'

function harness(level = 1, seed = 1) {
  const rng = mulberry32(seed)
  return {
    state: { history: [], idx: -1 } as BuildState,
    deps: { rng, drawGreen: makeDeck(rng, GREEN), level },
  }
}

describe('generateBuild', () => {
  it('segments the word into graphemes that rejoin to the word', () => {
    const { state, deps } = harness()
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) expect(item.segs.join('')).toBe(item.w)
  })

  it('splits plain runs into single letters but keeps digraphs whole', () => {
    // v0:1167 — flatMap keeps 'di' segments intact and splits plain runs
    const { state, deps } = harness(1, 5)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const expected = markDigraphs(item.w).flatMap(d => d.k === 'di' ? [d.txt] : d.txt.split(''))
      expect(item.segs).toEqual(expected)
    }
  })

  it('adds exactly three decoys to the tray', () => {
    // v0:1173 — while(decoys.length < 3 ...)
    const { state, deps } = harness(1, 9)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      expect(item.tray).toHaveLength(item.segs.length + 3)
    }
  })

  it('tray contains every needed segment', () => {
    // v0:1177 — tray is shuffle([...segs, ...decoys])
    const { state, deps } = harness(1, 11)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const tray = [...item.tray]
      for (const seg of item.segs) {
        const at = tray.indexOf(seg)
        expect(at).toBeGreaterThanOrEqual(0)
        tray.splice(at, 1)
      }
    }
  })

  it('decoys are never segments the word needs', () => {
    // v0:1175 — !segSet.has(c) && !decoys.includes(c)
    const { state, deps } = harness(1, 13)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const extra = [...item.tray]
      for (const s of item.segs) extra.splice(extra.indexOf(s), 1)
      expect(new Set(extra).size).toBe(extra.length)
      for (const d of extra) expect(item.segs).not.toContain(d)
    }
  })

  it('level 2 builds alien words', () => {
    // v0:1165 — level 2 takes the alienWord branch and never draws from GREEN
    const { state, deps } = harness(2, 17)
    const known = new Set(GREEN)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) expect(known.has(item.w)).toBe(false)
  })

  it('sets idx to the newest item', () => {
    // v0:1178
    const { state, deps } = harness()
    generateBuild(state, deps)
    generateBuild(state, deps)
    expect(state.idx).toBe(1)
  })
})
