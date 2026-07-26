import { describe, it, expect } from 'vitest'
import { stageFor } from '../../src/island/egg'

describe('egg stages', () => {
  it('follows the spec thresholds', () => {
    // Slice-1 spec §3: 25% / 50% / 75% / 90%
    expect(stageFor(0)).toBe('intact')
    expect(stageFor(0.24)).toBe('intact')
    expect(stageFor(0.25)).toBe('hairline')
    expect(stageFor(0.49)).toBe('hairline')
    expect(stageFor(0.5)).toBe('crack')
    expect(stageFor(0.74)).toBe('crack')
    expect(stageFor(0.75)).toBe('big')
    expect(stageFor(0.89)).toBe('big')
    expect(stageFor(0.9)).toBe('wobble')
    expect(stageFor(1)).toBe('wobble')
  })

  it('never regresses as progress climbs — cracks do not heal', () => {
    const order = ['intact', 'hairline', 'crack', 'big', 'wobble']
    let seen = 0
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const at = order.indexOf(stageFor(p))
      expect(at).toBeGreaterThanOrEqual(seen)
      seen = at
    }
  })

  it('handles a single-page egg, where one read goes straight to hatching', () => {
    // The curve makes the first egg cost 1, so its progress jumps 0 -> 1
    expect(stageFor(1)).toBe('wobble')
  })
})
