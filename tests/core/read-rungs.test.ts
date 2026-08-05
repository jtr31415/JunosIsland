import { describe, it, expect } from 'vitest'
import { generateRead } from '../../src/core/generators/read'
import type { ReadState } from '../../src/core/generators/read'
import { buildNeighbours, buildPool } from '../../src/core/neighbours'
import { mulberry32 } from '../../src/core/rng'

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
})
