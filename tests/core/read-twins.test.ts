import { describe, it, expect } from 'vitest'
import { twinTarget } from '../../src/core/generators/read'

describe('twin density', () => {
  it('plants the old two at the bottom of the ladder', () => {
    // The behaviour every page has had since v0, kept for the lowest rung.
    expect(twinTarget(0, 12)).toBe(2)
  })

  it('climbs with the rung', () => {
    expect(twinTarget(9, 12)).toBeGreaterThan(twinTarget(0, 12))
  })

  it('never asks for more twins than there are words to replace', () => {
    for (let r = 0; r < 10; r++) {
      for (const n of [3, 5, 8, 12]) {
        expect(twinTarget(r, n)).toBeLessThanOrEqual(Math.floor(n / 2))
      }
    }
  })

  it('never asks for fewer than one', () => {
    expect(twinTarget(0, 3)).toBeGreaterThanOrEqual(1)
  })
})
