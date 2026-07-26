import { describe, it, expect } from 'vitest'
import { INCREMENTS, incrementsShown, isComplete } from '../../src/island/world/increments'

describe('the increment sequence', () => {
  it('has ten steps, and puts the TILE down first', () => {
    /*
     * §2 lists ten steps and opens with a soil mound and flooded colour.
     * Joe's call, which overrides it: start with the tile itself and spend the
     * rest on props. The hex appearing is the moment the plot stops being an
     * idea and becomes a place; three of ten steps spent before anything looks
     * like land is three too many.
     */
    expect(INCREMENTS).toHaveLength(10)
    expect(INCREMENTS[0]).toBe('tile')
    expect(INCREMENTS[9]).toBe('flourish')
  })

  it('spends its middle entirely on scenery', () => {
    // Everything between the tile and the flourish is a thing that grows on
    // it, which is what makes the sequence read as a place being furnished.
    expect(INCREMENTS.slice(1, 9)).toHaveLength(8)
    expect(INCREMENTS).not.toContain('soil')
  })

  it('shows the TILE before any sum at all — the ghost hex', () => {
    /*
     * §2: "pick a socket (pulsing rims) -> ghost hex appears -> each correct
     * sum advances the build". The hex is what siting buys; the sums buy what
     * grows on it. Spreading all ten across the cost left a freshly sited
     * plot rendering nothing, so the child chose a spot and saw no change.
     */
    expect(incrementsShown(0, 10)).toBe(1)
    expect(incrementsShown(0, 1)).toBe(1)
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
    // §2: "When tile cost < 10, each sum advances multiple increments".
    // One for the hex, then nine spread across the cost.
    expect(incrementsShown(1, 5)).toBe(1 + 2)
    expect(incrementsShown(3, 5)).toBe(1 + 5)
  })

  it('advances roughly one every other sum on an expensive tile', () => {
    expect(incrementsShown(8, 16)).toBe(1 + 5)
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
