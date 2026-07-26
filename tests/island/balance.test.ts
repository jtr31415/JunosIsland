import { describe, it, expect } from 'vitest'
import { eggCost, tileCost, pageKind, balance } from '../../src/island/balance'

describe('the cost curve', () => {
  it('matches the spec formula for tiles', () => {
    /*
     * Slice-1 spec §4: base 1, cap 16, tau 6.
     *
     * NOTE: the spec's worked TABLE disagrees with its own FORMULA at n=5, 6
     * and 8 — it lists 9/10/12 where cost() gives 8/9/11. No single tau fits
     * both ends (tau 5.25 reproduces those three but then breaks n=2), so the
     * table has drifted from the constants rather than implying different
     * ones. The formula and constants are authoritative here, because they are
     * what balance.json actually encodes; the table is an illustration.
     */
    const table: Array<[number, number]> = [
      [1, 1], [2, 3], [3, 5], [4, 7], [5, 8], [6, 9], [8, 11], [12, 14], [20, 15],
    ]
    for (const [n, expected] of table) expect(tileCost(n)).toBe(expected)
  })

  it('matches the spec table for eggs', () => {
    // Slice-1 spec §4: base 1, cap 14, tau 5
    const table: Array<[number, number]> = [
      [1, 1], [2, 3], [3, 5], [4, 7], [5, 8], [6, 9], [8, 11], [12, 13],
    ]
    for (const [n, expected] of table) expect(eggCost(n)).toBe(expected)
  })

  it('starts at base and never exceeds cap', () => {
    expect(eggCost(1)).toBe(balance.egg.base)
    expect(tileCost(1)).toBe(balance.tile.base)
    for (let n = 1; n < 200; n++) {
      expect(eggCost(n)).toBeLessThanOrEqual(balance.egg.cap)
      expect(tileCost(n)).toBeLessThanOrEqual(balance.tile.cap)
    }
  })

  it('never decreases — work should not get cheaper as you go', () => {
    for (let n = 2; n < 60; n++) {
      expect(tileCost(n)).toBeGreaterThanOrEqual(tileCost(n - 1))
      expect(eggCost(n)).toBeGreaterThanOrEqual(eggCost(n - 1))
    }
  })

  it('flattens rather than running away', () => {
    // The fiftieth tile must not be punishment for having played a lot
    expect(tileCost(50) - tileCost(20)).toBeLessThanOrEqual(2)
  })

  it('treats n below 1 as the first', () => {
    expect(tileCost(0)).toBe(tileCost(1))
    expect(tileCost(-5)).toBe(tileCost(1))
  })
})

describe('page kinds', () => {
  it('alternates find and build so practice is never all one shape', () => {
    // §3: pages alternate roughly 50/50
    expect(pageKind(0)).toBe('find')
    expect(pageKind(1)).toBe('build')
    expect(pageKind(2)).toBe('find')
    expect(pageKind(3)).toBe('build')
  })

  it('the first egg is a single page, so its only page is a find', () => {
    // §1 beat 2 and §3: egg #1 is the scripted single word
    expect(eggCost(1)).toBe(1)
    expect(pageKind(0)).toBe('find')
  })
})
