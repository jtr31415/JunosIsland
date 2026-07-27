import { describe, it, expect } from 'vitest'
import {
  dayKey, daysBetween, distinctDays,
  createClock, createAdjustableClock, createFrozenClock,
} from '../../src/platform/clock'

/**
 * Item 2's acceptance: the visitor rollover and the consolidation gate must be
 * unit-testable without waiting for real midnight. A test that waits for
 * midnight is a test nobody runs.
 */

describe('dayKey', () => {
  it('is the LOCAL calendar day, not the UTC one', () => {
    /*
     * The distinction that matters. A child's day starts when she wakes up,
     * not at 1am British Summer Time — and a daily visitor arriving in the
     * middle of the night, or twice in one afternoon, is the bug this
     * prevents.
     */
    const local = new Date(2026, 6, 27, 0, 30)         // half past midnight, local
    expect(dayKey(local.getTime())).toBe('2026-07-27')

    const lateEvening = new Date(2026, 6, 27, 23, 30)
    expect(dayKey(lateEvening.getTime())).toBe('2026-07-27')
  })

  it('pads, so keys sort as dates', () => {
    expect(dayKey(new Date(2026, 0, 5).getTime())).toBe('2026-01-05')
  })

  it('rolls over at local midnight and not before', () => {
    const before = new Date(2026, 6, 27, 23, 59, 59, 999).getTime()
    const after = new Date(2026, 6, 28, 0, 0, 0, 0).getTime()
    expect(dayKey(before)).toBe('2026-07-27')
    expect(dayKey(after)).toBe('2026-07-28')
  })
})

describe('daysBetween', () => {
  it('counts calendar days', () => {
    expect(daysBetween('2026-07-27', '2026-07-28')).toBe(1)
    expect(daysBetween('2026-07-27', '2026-07-27')).toBe(0)
    expect(daysBetween('2026-07-28', '2026-07-27')).toBe(-1)
  })

  it('crosses a month and a year', () => {
    expect(daysBetween('2026-07-31', '2026-08-01')).toBe(1)
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1)
  })

  it('handles a leap day', () => {
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2)
  })

  it('survives the clocks changing', () => {
    /*
     * The reason the keys are parsed at NOON. A 23-hour day would otherwise
     * round to zero and the "held across two distinct days" gate would never
     * open; a 25-hour day would round to two and it would open a day early.
     * In the UK the clocks go forward on 29 March 2026 and back on 25 October.
     */
    expect(daysBetween('2026-03-28', '2026-03-29')).toBe(1)
    expect(daysBetween('2026-03-29', '2026-03-30')).toBe(1)
    expect(daysBetween('2026-10-24', '2026-10-25')).toBe(1)
    expect(daysBetween('2026-10-25', '2026-10-26')).toBe(1)
  })

  it('spans a whole year without drifting', () => {
    expect(daysBetween('2026-01-01', '2027-01-01')).toBe(365)
  })
})

describe('distinctDays', () => {
  it('counts days, not sessions', () => {
    // Difficulty §1: "the current mix held across >= 2 distinct calendar days
    // (one hot afternoon is not consolidation)".
    expect(distinctDays(['2026-07-27', '2026-07-27', '2026-07-27'])).toBe(1)
    expect(distinctDays(['2026-07-27', '2026-07-28'])).toBe(2)
    expect(distinctDays([])).toBe(0)
  })
})

describe('createClock', () => {
  it('reports the source it was given', () => {
    const clock = createClock(() => 1_700_000_000_000)
    expect(clock.now()).toBe(1_700_000_000_000)
    expect(clock.today()).toBe(dayKey(1_700_000_000_000))
  })

  it('follows a moving source', () => {
    let t = 1000
    const clock = createClock(() => t)
    expect(clock.now()).toBe(1000)
    t = 2000
    expect(clock.now()).toBe(2000)
  })
})

describe('createAdjustableClock', () => {
  it('starts where it was told to', () => {
    const start = new Date(2026, 6, 27, 9, 0).getTime()
    const clock = createAdjustableClock(start, () => 0)
    expect(clock.now()).toBe(start)
    expect(clock.today()).toBe('2026-07-27')
  })

  it('advances a day, which is the debug button', () => {
    const clock = createAdjustableClock(new Date(2026, 6, 27, 9, 0).getTime(), () => 0)
    clock.advanceDays(1)
    expect(clock.today()).toBe('2026-07-28')
    clock.advanceDays(7)
    expect(clock.today()).toBe('2026-08-04')
  })

  it('goes backwards too — the past is a valid place to test', () => {
    const clock = createAdjustableClock(new Date(2026, 6, 27, 9, 0).getTime(), () => 0)
    clock.advanceDays(-1)
    expect(clock.today()).toBe('2026-07-26')
  })

  it('resets exactly', () => {
    const start = new Date(2026, 6, 27, 9, 0).getTime()
    const clock = createAdjustableClock(start, () => 0)
    clock.advanceDays(30)
    clock.reset()
    expect(clock.now()).toBe(start)
  })

  it('keeps ticking with real time underneath the offset', () => {
    // A debug session that has jumped a week still needs seconds to pass, or
    // every animation driven off the clock freezes.
    let real = 0
    const clock = createAdjustableClock(new Date(2026, 6, 27).getTime(), () => real)
    const before = clock.now()
    real += 5000
    expect(clock.now()).toBe(before + 5000)
  })
})

describe('createFrozenClock', () => {
  it('does not tick', () => {
    /*
     * For assertions on an exact instant. A clock that advances a millisecond
     * between two reads turns "the same day" into a coin flip for a test that
     * happens to run at 23:59:59.999 — rare, and so the worst kind of flake to
     * chase down months later.
     */
    const clock = createFrozenClock(1000)
    expect(clock.now()).toBe(1000)
    expect(clock.now()).toBe(1000)
  })

  it('moves only when pushed', () => {
    const clock = createFrozenClock(new Date(2026, 6, 27, 12, 0).getTime())
    expect(clock.today()).toBe('2026-07-27')
    clock.advanceMs(1)
    clock.advanceDays(2)
    expect(clock.today()).toBe('2026-07-29')
  })

  it('walks a fortnight one day at a time, for the simulator', () => {
    const clock = createFrozenClock(new Date(2026, 6, 27, 12, 0).getTime())
    const seen: string[] = []
    for (let i = 0; i < 14; i++) { seen.push(clock.today()); clock.advanceDays(1) }
    expect(distinctDays(seen)).toBe(14)
    expect(seen[0]).toBe('2026-07-27')
    expect(seen[13]).toBe('2026-08-09')
  })
})
