import { describe, it, expect } from 'vitest'
import { INCREMENTS, incrementsShown, isComplete } from '../../src/island/world/increments'

describe('the increment sequence', () => {
  it('has the ten canonical steps from the spec', () => {
    // §2: soil, ground colour, pebbles, rock, tufts, bush, sapling, tree,
    //     second prop, completion flourish
    expect(INCREMENTS).toHaveLength(10)
    expect(INCREMENTS[0]).toBe('soil')
    expect(INCREMENTS[9]).toBe('flourish')
  })

  it('shows nothing before the first sum', () => {
    expect(incrementsShown(0, 10)).toBe(0)
  })

  it('shows all ten once the tile is paid for', () => {
    expect(incrementsShown(10, 10)).toBe(10)
    expect(isComplete(10, 10)).toBe(true)
  })

  it('plays ALL ten at once for a one-sum intro tile', () => {
    // §2: "Intro tile = all ten in one go" — and the curve makes the first
    // tile cost exactly one, so this is the path every child sees first.
    expect(incrementsShown(1, 1)).toBe(10)
    expect(isComplete(1, 1)).toBe(true)
  })

  it('advances several increments per sum when a tile is cheap', () => {
    // §2: "When tile cost < 10, each sum advances multiple increments"
    expect(incrementsShown(1, 5)).toBe(2)
    expect(incrementsShown(3, 5)).toBe(6)
  })

  it('advances roughly one every other sum on an expensive tile', () => {
    expect(incrementsShown(8, 16)).toBe(5)
    expect(incrementsShown(16, 16)).toBe(10)
  })

  it('never regresses as sums accumulate — pieces do not un-grow', () => {
    // §2: "Wrong answers advance nothing and remove nothing."
    let last = 0
    for (let n = 0; n <= 16; n++) {
      const shown = incrementsShown(n, 16)
      expect(shown).toBeGreaterThanOrEqual(last)
      last = shown
    }
  })

  it('never exceeds ten, however many sums arrive', () => {
    expect(incrementsShown(99, 5)).toBe(10)
  })

  it('treats a zero-cost tile as finished rather than dividing by zero', () => {
    expect(incrementsShown(0, 0)).toBe(10)
  })
})
