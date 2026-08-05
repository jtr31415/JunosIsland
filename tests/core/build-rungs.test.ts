import { describe, it, expect } from 'vitest'
import { generateBuild, FINGER_SPACE } from '../../src/core/generators/build'
import type { BuildState } from '../../src/core/generators/build'
import { buildStageFor } from '../../src/island/deal'
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

  it('puts a finger space between the words of a phrase', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1), drawGreen: () => 'he has', level: 6, phrase: true,
    })
    expect(s.history[0]!.segs).toEqual(['he', FINGER_SPACE, 'has'])
    expect(s.history[0]!.tray).toContain(FINGER_SPACE)
  })
})
