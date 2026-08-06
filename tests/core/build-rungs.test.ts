import { describe, it, expect } from 'vitest'
import { generateBuild, FINGER_SPACE } from '../../src/core/generators/build'
import type { BuildState } from '../../src/core/generators/build'
import { buildStageFor, dealReading } from '../../src/island/deal'
import { mulberry32 } from '../../src/core/rng'

const fresh = (): BuildState => ({ history: [], idx: -1 })

describe('build follows reading, one rung behind', () => {
  it('is the rung below the reading rung', () => {
    // STAGES.reading is [3, 4, 1, 5, ...]; the rung below id 1 is id 4.
    expect(buildStageFor(1)).toBe(4)
  })

  it('stays at the bottom rung rather than falling off it', () => {
    expect(buildStageFor(3)).toBe(3)
  })

  it('returns the stage itself if it is not on the ladder', () => {
    expect(buildStageFor(99)).toBe(99)
  })
})

describe('the build tray', () => {
  it('keeps digraphs whole by default', () => {
    const s = fresh()
    generateBuild(s, { rng: mulberry32(1), drawGreen: () => 'fish', level: 1 })
    expect(s.history[0]!.segs).toContain('sh')
  })

  it('splits digraphs into letters when granularity says so', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1), drawGreen: () => 'fish', level: 1, granularity: 'letters',
    })
    expect(s.history[0]!.segs).toEqual(['f', 'i', 's', 'h'])
    expect(s.history[0]!.tray).not.toContain('sh')
    /*
     * ADDED beyond the brief: `not.toContain('sh')` only proves the decoy
     * pool didn't happen to draw THAT one digraph for THIS seed — a mutation
     * check on the pool filter (removing it entirely) still passed this
     * assertion, because mulberry32(1) never drew a multi-char decoy for
     * 'fish' either way. The actual claim the filter line makes is seed
     * independent: with `granularity: 'letters'`, NO tray entry may be
     * longer than one character, ever. This is that claim, stated directly.
     */
    for (const tk of s.history[0]!.tray) expect(tk.length).toBe(1)
  })

  it('puts a finger space between the words of a phrase, with nobody having to say so', () => {
    /* Derived from the target, not declared by the caller — see the generator.
       A flag could not serve rung id 8, which holds five-letter nouns AND
       phrases on one list, so `torch` and `the plant` arrive from the same deck. */
    const s = fresh()
    generateBuild(s, { rng: mulberry32(1), drawGreen: () => 'he has', level: 6 })
    expect(s.history[0]!.segs).toEqual(['he', FINGER_SPACE, 'has'])
    expect(s.history[0]!.tray).toContain(FINGER_SPACE)
  })

  it('leaves a single word alone on that same mixed rung', () => {
    const s = fresh()
    generateBuild(s, { rng: mulberry32(1), drawGreen: () => 'torch', level: 8 })
    expect(s.history[0]!.segs).not.toContain(FINGER_SPACE)
    expect(s.history[0]!.tray).not.toContain(FINGER_SPACE)
  })

  it('spells the RUNG\'s word, not a GREEN one, when the rung is stocked', () => {
    /* PB-088: buildStageFor computed a stage nothing consumed, so the build page
       spelt a GREEN word whatever rung she had climbed to. */
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1),
      drawGreen: () => 'cat',
      level: 9,
      drawRung: (l: number) => (l === 9 ? () => 'bike' : null),
    })
    expect(s.history[0]!.w).toBe('bike')
  })

  it('falls back to GREEN when the rung has no approved words', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1), drawGreen: () => 'cat', level: 9, drawRung: () => null,
    })
    expect(s.history[0]!.w).toBe('cat')
  })

  it('never takes a rung word at level 1, because golden pins that stream', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1),
      drawGreen: () => 'cat',
      level: 1,
      drawRung: () => () => 'bike',
    })
    expect(s.history[0]!.w).toBe('cat')
  })
})

describe('PB-088: dealReading actually hands the rung through to the builder', () => {
  /*
   * These go through `dealReading` rather than `generateBuild` because the bug
   * was in the WIRING, not the generator: deal.ts passed { rng, drawGreen,
   * level } and dropped everything else. Deleting `drawRung:` from that object
   * left the whole 6800-test suite green, which is how it survived a whole-branch
   * review. Both assertions below fail if that line goes.
   */
  const stores = () => ({
    read: { history: [], idx: -1 },
    build: { history: [], idx: -1 },
  })
  const deps = (level: number, word: string) => ({
    rng: mulberry32(3),
    drawGreen: () => 'cat',
    drawRed: () => '[I]',
    neigh: {},
    level,
    drawRung: (l: number) => (l === level ? () => word : null),
  })

  it('spells the rung word rather than a GREEN one', () => {
    const card = dealReading(stores(), deps(9, 'bike'), 'build', false)
    expect(card.kind).toBe('build')
    if (card.kind === 'build') expect(card.item.w).toBe('bike')
  })

  it('drops the digraph tiles at the top of the ladder, and only there', () => {
    /* id 11 is the last position on STAGES.reading, so letters-only; id 4 is
       mid-ladder and keeps `sh` whole. */
    const top = dealReading(stores(), deps(11, 'fish'), 'build', false)
    if (top.kind === 'build') {
      expect(top.item.segs).toEqual(['f', 'i', 's', 'h'])
      for (const tk of top.item.tray) expect(tk.length).toBe(1)
    }
    const mid = dealReading(stores(), deps(4, 'fish'), 'build', false)
    if (mid.kind === 'build') expect(mid.item.segs).toContain('sh')
  })
})
