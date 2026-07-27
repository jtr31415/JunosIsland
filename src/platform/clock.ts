/**
 * What time it is, as something that can be told a lie.
 *
 * Phase 3 item 2. Four separate features need to ask what day it is — the
 * daily visitor, difficulty's "held across two distinct days" gate, the
 * seasonal calendar, and the persona simulator — and every one of them is
 * untestable if it reads `Date.now()` directly. A test that has to wait for
 * real midnight is a test nobody runs.
 *
 * Injectable rather than mockable. The island is handed a clock; a test hands
 * it a different one. No module-level patching, no global stubbing, nothing
 * that leaks between test files.
 *
 * ---
 *
 * WHAT MUST NOT GO BEHIND THIS CLOCK.
 *
 * There are two kinds of time in this game and only one of them belongs here.
 *
 *   - CALENDAR time — what day is it. The visitor's day latch, difficulty's
 *     two-distinct-days gate, the seasonal calendar. This is the clock.
 *   - ELAPSED time — how long since that tap. The input locks and reward
 *     windows in `src/challenges/*` (`Date.now() + 1800`, and the rest), all
 *     of them faithful ports of v0.
 *
 * Elapsed-time gates must keep reading the real clock. Press advance-day in
 * the debug panel while one of them is armed and an adjustable clock jumps its
 * deadline a day into the past: every input lock releases at once, every
 * reward window is already over, and the mash-rescue that exists to protect a
 * frustrated child silently stops working. The bug would appear only in debug
 * sessions, which is where nobody is looking for it.
 *
 * So item 2's sweep converts the calendar reads and deliberately leaves the
 * challenge timers alone. They are also v0 ports, where HANDOFF rule 1 permits
 * dependency injection and nothing else.
 */

export interface Clock {
  /** Milliseconds since the epoch, as `Date.now()` would report them. */
  now(): number
  /**
   * The LOCAL calendar day, as `YYYY-MM-DD`.
   *
   * Local, emphatically, and not UTC. A child's day starts when she wakes up,
   * not at 1am British Summer Time — and the daily visitor arriving in the
   * middle of the night, or twice on the same afternoon, is exactly the class
   * of bug this exists to prevent.
   */
  today(): string
}

/** A clock a test or the debug panel can push around. */
export interface AdjustableClock extends Clock {
  /** Jump forward. Negative is allowed; the past is a valid place to test. */
  advanceMs(ms: number): void
  advanceDays(days: number): void
  /** Put it back where it started. */
  reset(): void
}

const MS_PER_DAY = 86_400_000

/** `YYYY-MM-DD` for an instant, in the machine's own timezone. */
export function dayKey(ms: number): string {
  const d = new Date(ms)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

/**
 * Whole days between two day keys, by calendar rather than by arithmetic.
 *
 * Parsed as NOON local rather than midnight. A day that is 23 or 25 hours long
 * because the clocks changed would otherwise round to zero or two, and the
 * difficulty gate that wants "two distinct days" would either never open or
 * open a day early. Noon is far enough from both boundaries that no daylight
 * saving shift can reach it.
 */
export function daysBetween(from: string, to: string): number {
  const at = (key: string): number => {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12).getTime()
  }
  return Math.round((at(to) - at(from)) / MS_PER_DAY)
}

/** How many DISTINCT days appear in a list of day keys. */
export const distinctDays = (keys: readonly string[]): number => new Set(keys).size

/** The real one. */
export function createClock(source: () => number = Date.now): Clock {
  return {
    now: source,
    today: () => dayKey(source()),
  }
}

/**
 * A clock that can be moved, for tests, the debug panel and the simulator.
 *
 * The offset is kept separately from the base so `reset()` is exact and so a
 * debug session can report how far it has travelled.
 */
export function createAdjustableClock(
  start: number, source: () => number = Date.now,
): AdjustableClock {
  const base = source()
  let offset = start - base
  const initial = offset
  const now = (): number => source() + offset
  return {
    now,
    today: () => dayKey(now()),
    advanceMs(ms) { offset += ms },
    advanceDays(days) { offset += days * MS_PER_DAY },
    reset() { offset = initial },
  }
}

/**
 * A clock that does not tick at all.
 *
 * For tests that assert on an exact instant. A clock that advances by a
 * millisecond between two reads turns "the same day" into a coin flip when the
 * test happens to run at 23:59:59.999 — rare, and therefore the worst kind of
 * flake to chase down later.
 */
export function createFrozenClock(at: number): AdjustableClock {
  let t = at
  return {
    now: () => t,
    today: () => dayKey(t),
    advanceMs(ms) { t += ms },
    advanceDays(days) { t += days * MS_PER_DAY },
    reset() { t = at },
  }
}
