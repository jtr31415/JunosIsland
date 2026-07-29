/**
 * A7 — the economy re-base, and the proof that it changed nothing.
 *
 * Every cost doubled and every item now pays 2. The point is Run B: probes and
 * honeymoon periods pay 3, and the old denomination had no way to express a
 * rate between "one" and "double". The requirement is that a child cannot tell
 * — the same number of sums buys the same tile, at every n.
 *
 * That does NOT come free with the doubling, which is why this file exists.
 * The survey expected it to hold "by construction"; it does not, because
 * rounding does not commute with scaling. Rounding the doubled curve directly
 * prices the second tile at 7 units — four sums where it has always been three
 * — and moves ten values on the tile curve and five on the egg curve. `cost()`
 * therefore rounds to a whole item and converts, and these are the tests that
 * hold it there.
 */
import { describe, it, expect } from 'vitest'
import {
  cost, itemsFor, itemPay, honeymoonPay, pagesRead, eggCost, tileCost, balance,
} from '../../src/island/balance'

/**
 * The pre-A7 curves, verbatim: base 1 / cap 16 / tau 6 for tiles, base 1 /
 * cap 14 / tau 5 for eggs, rounded straight to whole items.
 *
 * Kept as an independent reimplementation rather than a table so the
 * comparison covers every n rather than the handful someone thought to type.
 */
const PRE_A7 = {
  tile: { base: 1, cap: 16, tau: 6 },
  egg: { base: 1, cap: 14, tau: 5 },
}
const preCost = (c: { base: number; cap: number; tau: number }, n: number): number =>
  Math.round(c.cap - (c.cap - c.base) * Math.exp((1 - Math.max(1, n)) / c.tau))

describe('the A7 re-base is invisible', () => {
  it('doubled the curves and the payment together', () => {
    expect(itemPay()).toBe(2)
    expect(balance.tile).toMatchObject({ base: 2, cap: 32, tau: 6 })
    expect(balance.egg).toMatchObject({ base: 2, cap: 28, tau: 5 })
  })

  it('costs the same number of SUMS per tile at every n', () => {
    for (let n = 1; n <= 200; n++) {
      expect(itemsFor(balance.tile, n)).toBe(preCost(PRE_A7.tile, n))
    }
  })

  it('costs the same number of PAGES per egg at every n', () => {
    for (let n = 1; n <= 200; n++) {
      expect(itemsFor(balance.egg, n)).toBe(preCost(PRE_A7.egg, n))
    }
  })

  it('is an exact doubling of every old price, not merely a close one', () => {
    for (let n = 1; n <= 200; n++) {
      expect(tileCost(n)).toBe(2 * preCost(PRE_A7.tile, n))
      expect(eggCost(n)).toBe(2 * preCost(PRE_A7.egg, n))
    }
  })

  it('never prices anything at a fraction of an item', () => {
    // The failure this is really guarding: an odd cost means the last item of
    // a tile overpays, which is how the naive re-base raised prices.
    for (let n = 1; n <= 200; n++) {
      expect(tileCost(n) % itemPay()).toBe(0)
      expect(eggCost(n) % itemPay()).toBe(0)
    }
  })

  it('catches the naive re-base that rounds the doubled curve directly', () => {
    /*
     * The bug that was nearly shipped, pinned so it cannot come back as a
     * "simplification". round(2x) is 7 for the second tile; 2·round(x) is 6.
     */
    const naive = (c: { base: number; cap: number; tau: number }, n: number): number =>
      Math.round(c.cap - (c.cap - c.base) * Math.exp((1 - Math.max(1, n)) / c.tau))
    expect(naive(balance.tile, 2)).toBe(7)      // what it would have cost
    expect(tileCost(2)).toBe(6)                 // what it does cost
    expect(itemsFor(balance.tile, 2)).toBe(3)   // three sums, as it always was
  })
})

/**
 * A month of play, walked item by item.
 *
 * The per-n assertions above compare prices. This spends them: it answers
 * items one at a time exactly as the flow does — accrue `itemPay()`, and when
 * the total reaches the cost, take the thing and reset — and checks that the
 * child hands over the same number of answers for the same island she would
 * have before A7. A pricing table can be right at every n and still drift here
 * if the accrual and the reset disagree about the denomination.
 */
describe('the month-walk', () => {
  /** Items answered to reach the nth thing, under a given cost/pay regime. */
  function walk(
    priceOf: (n: number) => number, pay: number, count: number,
  ): { perThing: number[]; total: number } {
    const perThing: number[] = []
    let total = 0
    for (let n = 1; n <= count; n++) {
      let progress = 0
      let items = 0
      // The flow's own loop: answer, accrue, stop when the price is met.
      while (progress < priceOf(n)) { progress += pay; items++ }
      perThing.push(items)
      total += items
    }
    return { perThing, total }
  }

  it('buys 30 tiles for exactly the sums it used to', () => {
    const now = walk(n => tileCost(n), itemPay(), 30)
    const before = walk(n => preCost(PRE_A7.tile, n), 1, 30)
    expect(now.perThing).toEqual(before.perThing)
    expect(now.total).toBe(before.total)
  })

  it('hatches 30 pets for exactly the pages it used to', () => {
    const now = walk(n => eggCost(n), itemPay(), 30)
    const before = walk(n => preCost(PRE_A7.egg, n), 1, 30)
    expect(now.perThing).toEqual(before.perThing)
    expect(now.total).toBe(before.total)
  })

  it('never leaves a part-paid thing when the price is met', () => {
    // Overshoot would mean an item's pay was silently discarded — work done
    // and not counted, which §18 forbids. Whole items into whole prices.
    for (let n = 1; n <= 60; n++) {
      const items = Math.ceil(tileCost(n) / itemPay())
      expect(items * itemPay()).toBe(tileCost(n))
    }
  })
})

/**
 * The other denomination A7 was built for — Run B's honeymoon (runA.md:233).
 *
 * The doubling exists so that "pay 3" is expressible at all. These pin the
 * second rate as a SIBLING: it is 3, and nothing that reads `itemPay()` moved
 * because of it. The dangerous one is the third assertion — `save.ts` stamps
 * `itemPay()` into every save and `fromSave` rescales banked work by it, so a
 * honeymoon that changed what `itemPay()` answers would corrupt the next load.
 */
describe('the honeymoon rate is a sibling, not a replacement', () => {
  it('pays 3 for a honeymoon item', () => {
    expect(honeymoonPay()).toBe(3)
    expect(balance.pay.honeymoon).toBe(3)
  })

  it('leaves the ordinary rate at 2', () => {
    expect(itemPay()).toBe(2)
    expect(balance.pay.item).toBe(2)
  })

  it('never pays less than an ordinary item, however balance.json is tuned', () => {
    // "Going easy on her" that charged MORE would be a punishment for saying
    // yes, so the floor is part of the contract rather than a coincidence of
    // the shipped numbers.
    const saved = balance.pay.honeymoon
    try {
      balance.pay.honeymoon = 1
      expect(honeymoonPay()).toBe(itemPay())
    } finally {
      balance.pay.honeymoon = saved
    }
  })

  it('leaves itemsFor counting in ordinary items at every n', () => {
    // The pacing figure. If it ever divided by 3 the whole month-walk above
    // would be measuring a different game.
    for (let n = 1; n <= 200; n++) {
      expect(itemsFor(balance.tile, n)).toBe(tileCost(n) / itemPay())
      expect(itemsFor(balance.egg, n)).toBe(eggCost(n) / itemPay())
    }
  })

  it('leaves pagesRead striding the find/build mix in twos', () => {
    // PB-038 / JT-010(2): the page index is units ÷ 2. At 3 it would read the
    // four-long mix at the wrong stride and deal find pages one in two.
    for (let units = 0; units <= 40; units += 2) expect(pagesRead(units)).toBe(units / 2)
  })
})

describe('the curve still obeys its old shape rules', () => {
  it('starts at base, never exceeds cap, and never goes backwards', () => {
    expect(tileCost(1)).toBe(balance.tile.base)
    expect(eggCost(1)).toBe(balance.egg.base)
    for (let n = 2; n < 200; n++) {
      expect(tileCost(n)).toBeLessThanOrEqual(balance.tile.cap)
      expect(tileCost(n)).toBeGreaterThanOrEqual(tileCost(n - 1))
      expect(eggCost(n)).toBeLessThanOrEqual(balance.egg.cap)
      expect(eggCost(n)).toBeGreaterThanOrEqual(eggCost(n - 1))
    }
  })

  it('leaves the dev overlay a whole number of items too', () => {
    // The preview curve is tuned for a fast demo, but a half-priced item there
    // would make the dev channel lie about pacing.
    const dev = { base: 2, cap: 6, tau: 2 }
    for (let n = 1; n <= 20; n++) expect(cost(dev, n) % itemPay()).toBe(0)
  })
})
