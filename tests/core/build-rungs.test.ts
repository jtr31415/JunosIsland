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
