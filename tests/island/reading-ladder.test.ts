import { describe, it, expect } from 'vitest'
import { STAGES } from '../../src/island/harness'
import { STAGE_LABELS, stageLabel } from '../../src/island/grownups'

describe('the reading ladder', () => {
  it('keeps id 1 as the third rung, where Juno already is', () => {
    // Array POSITION is the rung; the NUMBER is a generator id. Juno is ticked
    // on id 1, so id 1 moving position would move her.
    expect(STAGES.reading[2]).toBe(1)
  })

  it('climbs from below the start to two-syllable', () => {
    expect(STAGES.reading).toEqual([3, 4, 1, 5, 6, 7, 8, 9, 10, 11])
  })

  it('never repeats a generator id', () => {
    expect(new Set(STAGES.reading).size).toBe(STAGES.reading.length)
  })

  it('does not reuse id 2, which is the alien-word generator', () => {
    expect(STAGES.reading).not.toContain(2)
  })

  it('has wording for every rung it can deal', () => {
    for (const id of STAGES.reading) {
      expect(STAGE_LABELS.reading[id], `id ${id} has no label`).toBeTruthy()
      expect(stageLabel('reading', id)).not.toMatch(/^stage /)
    }
  })

  it('matches the length read.ts mirrors for the twin dial', async () => {
    const src = await import('node:fs').then(fs =>
      fs.readFileSync('src/core/generators/read.ts', 'utf8'))
    const m = src.match(/STAGES_READING_LENGTH = (\d+)/)
    expect(Number(m?.[1])).toBe(STAGES.reading.length)
  })
})
