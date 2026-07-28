/**
 * A3 — the harness, the island's single choke point for policy.
 *
 * These tests drive the module directly. It is deliberately pure: no DOM, no
 * clock it does not own, no generators. What it knows is which stages a child
 * is allowed to be dealt and how she has been doing on them; what it never does
 * is render, deal or persist.
 *
 * NOT COVERED HERE, and deliberately: which PATH a deal moment picks when two
 * of them are live (sums vs takingAway, reading vs building). That is JT-010,
 * open with Joe — see docs/pet-island-runA.md, FIELD NOTES — A3.
 */
import { describe, it, expect } from 'vitest'
import {
  createAttainment, createHarness, readAttainment, STAGES, LIVE_PATHS, RESERVED_PATHS,
} from '../../src/island/harness'
import { createFrozenClock, dayKey } from '../../src/platform/clock'
import type { AttemptEvent } from '../../src/island/attempts'

/** An attempt with everything switched off, so a test states only what it means. */
const attempt = (over: Partial<AttemptEvent> = {}): AttemptEvent => ({
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0, ...over,
})

describe('the stages that exist', () => {
  it('lists only generators that are actually built', () => {
    // A4: sums [1 to-ten, 2 to-twenty bridging] · takingAway [1,2,3 as v0] ·
    // reading [1] · building [1].
    expect(STAGES.sums).toEqual([1, 2])
    expect(STAGES.takingAway).toEqual([1, 2, 3])
    expect(STAGES.reading).toEqual([1])
    expect(STAGES.building).toEqual([1])
  })

  it('gives reading and building exactly one stage, because level 2 is the alien', () => {
    /*
     * Not an oversight and not a placeholder. `generateRead` level 2 is the
     * ALIEN generator (read.ts:29) and `generateBuild` level 2 likewise
     * (build.ts:25), and the no-aliens ruling retires both. So the tickbox on
     * these two paths is a capability switch with no ladder behind it, and a
     * future rung means a new generator rather than a new number here.
     */
    expect(STAGES.reading).toHaveLength(1)
    expect(STAGES.building).toHaveLength(1)
  })

  it('names the four reserved paths without giving them stages', () => {
    // A4: greyed, empty, "coming later" — slots only.
    expect(RESERVED_PATHS).toEqual(
      ['storySums', 'fractions', 'multiplication', 'division'])
    for (const p of RESERVED_PATHS) {
      expect(Object.prototype.hasOwnProperty.call(STAGES, p)).toBe(false)
    }
  })

  it('has four live paths and no overlap with the reserved ones', () => {
    expect(LIVE_PATHS).toEqual(['sums', 'takingAway', 'reading', 'building'])
    for (const p of LIVE_PATHS) expect(RESERVED_PATHS).not.toContain(p)
  })
})

describe('a fresh island', () => {
  it('starts every path in auto with honest zeroes', () => {
    const a = createAttainment()
    for (const p of LIVE_PATHS) {
      expect(a[p].mode).toBe('auto')
      for (const s of STAGES[p]) {
        const st = a[p].stages[s]
        expect(st).toBeDefined()
        expect(st?.attempts).toBe(0)
        expect(st?.ewma).toBeNull()
        expect(st?.latencies).toEqual([])
        expect(st?.sessions).toEqual([])
        expect(st?.rescues).toEqual([])
      }
    }
  })

  it('ticks exactly what the island can already deal today', () => {
    /*
     * The first rung of each path she is already playing, and nothing else.
     * takingAway starts UNTICKED because the island has never dealt a
     * subtraction — ticking it would hand her something new on the strength of
     * a migration rather than of a decision (JT-007 is Joe ticking it himself).
     */
    const a = createAttainment()
    expect(a.sums.stages[1]?.ticked).toBe(true)
    expect(a.sums.stages[2]?.ticked).toBe(false)
    expect(a.reading.stages[1]?.ticked).toBe(true)
    expect(a.building.stages[1]?.ticked).toBe(true)
    for (const s of STAGES.takingAway) {
      expect(a.takingAway.stages[s]?.ticked).toBe(false)
    }
  })

  it('is not the same object twice, so two islands cannot share a stage', () => {
    const a = createAttainment()
    const b = createAttainment()
    a.sums.stages[1]!.attempts = 99
    expect(b.sums.stages[1]?.attempts).toBe(0)
  })
})

describe('levelFor — which stages she may be dealt', () => {
  it('returns the ticked stages of the path, in order', () => {
    const h = createHarness(createAttainment())
    expect(h.levelFor('sums')).toEqual([1])
    expect(h.levelFor('reading')).toEqual([1])
    expect(h.levelFor('takingAway')).toEqual([])
  })

  it('follows a tick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    a.sums.stages[2]!.ticked = true
    expect(h.levelFor('sums')).toEqual([1, 2])
  })

  it('follows an untick, because untick is a parent\'s hand', () => {
    const a = createAttainment()
    const h = createHarness(a)
    a.sums.stages[1]!.ticked = false
    expect(h.levelFor('sums')).toEqual([])
  })

  it('never returns a stage that has no generator behind it', () => {
    const a = createAttainment()
    // A hand-edited save, a rolled-back build, a future stage id: all the same
    // kind of untrusted input, and none of them may reach a generator.
    a.sums.stages[7] = { ...a.sums.stages[1]!, ticked: true }
    const h = createHarness(a)
    expect(h.levelFor('sums')).toEqual([1])
  })

  it('returns nothing at all for a reserved path', () => {
    const h = createHarness(createAttainment())
    // Typed out of reach; asked anyway, because a save is untrusted input.
    expect(h.levelFor('fractions' as never)).toEqual([])
  })
})

describe('pick — the draw across ticked stages', () => {
  it('draws uniformly, which is Run A policy and Run B\'s to replace', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    const h = createHarness(a)
    const seen = new Set<number>()
    // A deterministic sweep rather than a random one: the draw must reach both
    // ends of the set and nothing outside it.
    for (const r of [0, 0.49, 0.5, 0.99]) seen.add(h.pick('sums', () => r)!)
    expect([...seen].sort()).toEqual([1, 2])
  })

  it('gives back null when the path is empty, rather than a stage she cannot do', () => {
    const h = createHarness(createAttainment())
    expect(h.pick('takingAway', () => 0)).toBeNull()
  })

  it('never runs off the end on an rng that returns exactly 1', () => {
    // Rng contracts say [0,1), and a hand-written stub in some future test will
    // eventually say 1. That must not deal `undefined` to a generator.
    const h = createHarness(createAttainment())
    expect(h.pick('sums', () => 1)).toBe(1)
  })
})

describe('recordAttempt — the stats a report will read', () => {
  it('attributes to the stage the harness last dealt', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt())
    expect(a.sums.stages[1]?.attempts).toBe(1)
    expect(a.sums.stages[2]?.attempts).toBe(0)
  })

  it('drops an attempt that arrives before anything was dealt', () => {
    /*
     * Not defensive noise: the overlay emits from a tally that outlives a
     * single round, and a mis-wire that attributed stray attempts to whatever
     * was dealt last would corrupt a stage silently — the one failure mode a
     * measurement system must not have.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.recordAttempt(attempt())
    for (const p of LIVE_PATHS) {
      for (const s of STAGES[p]) expect(a[p].stages[s]?.attempts).toBe(0)
    }
  })

  it('seeds the EWMA with the first answer instead of climbing out of zero', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    // Seeding at 0 would say a child who has got everything right is at .15.
    expect(a.sums.stages[1]?.ewma).toBe(1)
  })

  it('moves the EWMA by alpha .15 thereafter', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    h.recordAttempt(attempt({ correct: false }))
    // 1 + .15 * (0 - 1)
    expect(a.sums.stages[1]?.ewma).toBeCloseTo(0.85, 10)
  })

  it('keeps the latencies of CORRECT attempts only', () => {
    /*
     * A6 takes a correct-only median, so a wrong attempt's latency is not
     * merely unused — it is a different measurement. A child who taps
     * instantly and wrongly would otherwise read as fast.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true, latencyMs: 900 }))
    h.recordAttempt(attempt({ correct: false, latencyMs: 20 }))
    expect(a.sums.stages[1]?.latencies).toEqual([900])
  })

  it('drops a null latency without dropping the attempt', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('reading', 1)
    h.recordAttempt(attempt({ kind: 'find', correct: true, latencyMs: null }))
    expect(a.reading.stages[1]?.latencies).toEqual([])
    expect(a.reading.stages[1]?.attempts).toBe(1)
    expect(a.reading.stages[1]?.ewma).toBe(1)
  })

  it('holds the last 30 latencies and no more', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 40; i++) h.recordAttempt(attempt({ latencyMs: i }))
    const ring = a.sums.stages[1]?.latencies ?? []
    expect(ring).toHaveLength(30)
    expect(ring[0]).toBe(10)
    expect(ring[29]).toBe(39)
  })

  it('freezes an early baseline the ring would otherwise evict', () => {
    /*
     * A6 wants speed as "recent correct-median vs the stage's own EARLY
     * baseline". A ring of 30 cannot answer that — by the time there is a
     * trend to see, the beginning has been overwritten by it. So the first ten
     * correct latencies are kept once and never touched again.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 40; i++) h.recordAttempt(attempt({ latencyMs: i }))
    expect(a.sums.stages[1]?.early).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('counts a rescued attempt as rescued on the session it lands in', () => {
    const a = createAttainment()
    const h = createHarness(a, () => Date.parse('2026-07-28T10:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: false, rescued: true }))
    expect(a.sums.stages[1]?.rescues).toHaveLength(1)
  })
})

describe('sessions — the consistency raw material', () => {
  const day = (iso: string) => () => Date.parse(iso)

  it('opens a session on the first attempt of a date', () => {
    const a = createAttainment()
    const h = createHarness(a, day('2026-07-28T09:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    h.recordAttempt(attempt({ correct: false }))
    expect(a.sums.stages[1]?.sessions).toEqual([
      { date: '2026-07-28', correct: 1, total: 2 },
    ])
  })

  it('starts a new one when the date changes', () => {
    const a = createAttainment()
    let iso = '2026-07-28T09:00:00Z'
    const h = createHarness(a, () => Date.parse(iso))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    iso = '2026-07-29T09:00:00Z'
    h.recordAttempt(attempt({ correct: true }))
    const s = a.sums.stages[1]?.sessions ?? []
    expect(s).toHaveLength(2)
    expect(s[1]).toEqual({ date: '2026-07-29', correct: 1, total: 1 })
  })

  it('keeps the last six and drops the oldest', () => {
    const a = createAttainment()
    let d = 1
    const h = createHarness(a, () => Date.parse(`2026-06-${String(d).padStart(2, '0')}T09:00:00Z`))
    h.dealt('sums', 1)
    for (d = 1; d <= 9; d++) h.recordAttempt(attempt({ correct: true }))
    const s = a.sums.stages[1]?.sessions ?? []
    expect(s).toHaveLength(6)
    expect(s[0]?.date).toBe('2026-06-04')
    expect(s[5]?.date).toBe('2026-06-09')
  })

  it('counts sessions per stage, not per island', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    const h = createHarness(a, day('2026-07-28T09:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt())
    h.dealt('sums', 2)
    h.recordAttempt(attempt())
    expect(a.sums.stages[1]?.sessions).toHaveLength(1)
    expect(a.sums.stages[2]?.sessions).toHaveLength(1)
  })

  it('buckets by the clock it was handed, not by the wall clock', () => {
    /*
     * A5's defect, pinned. `createHarness` defaults `now` to `Date.now()`, and
     * main.ts took that default while threading a real clock — an adjustable
     * one under ?debug — into everything else it built. The one calendar read
     * the harness makes, WHICH DAY an attempt's session belongs to, therefore
     * sat outside the clock: press advance-day and the visitor moved, the save
     * moved, and attainment's sessions stayed in today. A6's consistency
     * measure is the two-distinct-days gate over exactly these records, which
     * clock.ts's header names as calendar time and so as the clock's business,
     * and which nobody could walk without waiting for real midnight.
     *
     * Noon, four hundred days back: far enough from both boundaries that no
     * daylight-saving shift can reach it, and far enough from today that "not
     * the wall clock" is a statement about the clock rather than about luck.
     */
    const noon = new Date()
    noon.setHours(12, 0, 0, 0)
    noon.setDate(noon.getDate() - 400)
    const then = noon.getTime()

    const clock = createFrozenClock(then)
    const a = createAttainment()
    const h = createHarness(a, () => clock.now())
    h.dealt('sums', 1)
    h.recordAttempt(attempt())
    clock.advanceDays(1)
    h.recordAttempt(attempt())

    const dates = (a.sums.stages[1]?.sessions ?? []).map(s => s.date)
    expect(dates).toEqual([dayKey(then), dayKey(then + 86_400_000)])
    expect(dates).not.toContain(dayKey(Date.now()))
  })
})

describe('noteRescue — transient, in-session only', () => {
  it('remembers a rescue for the rest of the session', () => {
    const h = createHarness(createAttainment())
    expect(h.rescuedThisSession('sums')).toBe(false)
    h.noteRescue('sums')
    expect(h.rescuedThisSession('sums')).toBe(true)
  })

  it('keeps the paths apart', () => {
    const h = createHarness(createAttainment())
    h.noteRescue('sums')
    expect(h.rescuedThisSession('reading')).toBe(false)
  })

  it('writes nothing into the attainment, which is what makes it transient', () => {
    const a = createAttainment()
    const before = JSON.stringify(a)
    createHarness(a).noteRescue('sums')
    expect(JSON.stringify(a)).toBe(before)
  })
})

/* ------------------------------------------------------ Run B, live and headless */

/**
 * An island with a clock a test can walk, day by day, without waiting.
 *
 * Every Run B rule is a rule about DAYS — two distinct ones on the source
 * stage, a decline honoured for two sessions, one offer per session, a
 * honeymoon of two — so a test that cannot move the calendar cannot state any
 * of them. Noon-ish UTC on each day, the convention the session tests above
 * already use, so no timezone can push a day key over a boundary.
 */
const island = () => {
  const a = createAttainment()
  let today = '2026-07-01'
  const h = createHarness(a, () => Date.parse(`${today}T09:00:00Z`))
  return { a, h, on: (d: string) => { today = d } }
}

type Island = ReturnType<typeof island>

/**
 * Twenty right answers on sums 1 across two days: the mastery half of the
 * gate, and nothing else. No probes, no rescues.
 */
const masterSums1 = ({ h, on }: Island, days = ['2026-07-01', '2026-07-02']): void => {
  h.dealt('sums', 1)
  for (const d of days) {
    on(d)
    for (let i = 0; i < 10; i++) h.recordAttempt(attempt({ correct: true }))
  }
}

/** Probes on sums 2: `n` of them, `right` correct. Eight at .875 clears .70. */
const probeSums2 = ({ h }: Island, right = 7, n = 8): void => {
  h.dealt('sums', 2, true)
  for (let i = 0; i < n; i++) h.recordAttempt(attempt({ correct: i < right }))
  h.dealt('sums', 1)
}

/**
 * The whole gate passed, with subtraction already open.
 *
 * takingAway 1 is ticked up front deliberately: its INTRODUCTION outranks a
 * trickier offer, so a test about the same-path gate has to take that offer
 * off the table or it would be measuring the other rule.
 */
const gateReady = (): Island => {
  const it = island()
  it.a.takingAway.stages[1]!.ticked = true
  masterSums1(it)
  probeSums2(it)
  it.on('2026-07-03')
  return it
}

/** A roll that reads from a script, then settles on 0. */
const rolls = (...xs: number[]) => {
  let i = 0
  return () => xs[i++] ?? 0
}

describe('Run B — probes, the taste of the next rung', () => {
  it('wants one once the rung below is comfortable rather than mastered', () => {
    // runA.md:229 — probes start at .75, which is well under the .85 that
    // promotes. The point is to have evidence ready by the time the gate asks.
    const it = island()
    it.h.dealt('sums', 1)
    for (let i = 0; i < 10; i++) it.h.recordAttempt(attempt({ correct: true }))
    expect(it.h.probeWanted('sums')).toBe(true)
  })

  it('wants none while the rung below is still shaky', () => {
    const it = island()
    it.h.dealt('sums', 1)
    for (let i = 0; i < 10; i++) it.h.recordAttempt(attempt({ correct: i % 2 === 0 }))
    expect(it.a.sums.stages[1]!.ewma!).toBeLessThan(0.75)
    expect(it.h.probeWanted('sums')).toBe(false)
  })

  it('wants none where there is no rung above — reading has exactly one', () => {
    const it = island()
    it.h.dealt('reading', 1)
    for (let i = 0; i < 20; i++) it.h.recordAttempt(attempt({ kind: 'find' }))
    expect(it.h.probeWanted('reading')).toBe(false)
  })

  it('wants none on a path a parent took off Auto — JT-011(a)', () => {
    // Joe: "Manual persists, and Run B must skip it." A parent who said he
    // moves this path's ticks is not to be answered back by extra questions.
    const it = island()
    masterSums1(it)
    for (const mode of ['manual', 'hold'] as const) {
      it.h.setMode('sums', mode)
      expect(it.h.probeWanted('sums')).toBe(false)
    }
    it.h.setMode('sums', 'auto')
    expect(it.h.probeWanted('sums')).toBe(true)
  })

  it('wants none on taking away, which has no rung to earn from', () => {
    // Nothing ticked means no top rung, so no probe can ever be wanted here —
    // which is exactly why its introduction is gated on sums instead.
    const it = island()
    masterSums1(it)
    expect(it.h.probeWanted('takingAway')).toBe(false)
  })

  it('swaps the stage, and only the stage, on the one round in eight', () => {
    const it = island()
    masterSums1(it)
    // First roll draws from the pool (one entry), second is the 1-in-8.
    expect(it.h.dealMaths(rolls(0, 0.1)))
      .toEqual({ path: 'sums', stage: 2, probe: true })
  })

  it('leaves the other seven rounds exactly as they were', () => {
    const it = island()
    masterSums1(it)
    expect(it.h.dealMaths(rolls(0, 0.9)))
      .toEqual({ path: 'sums', stage: 1, probe: false })
  })

  it('never probes across paths, so the share of maths is untouched', () => {
    /*
     * A probe swaps the STAGE within the path that was drawn. If it could
     * swap the path it would be dealing subtraction nobody had introduced —
     * and it would also silently move JT-010(1)'s split.
     */
    const it = island()
    masterSums1(it)
    for (let i = 0; i < 200; i++) {
      const got = it.h.dealMaths(rolls(i / 200, (i % 8) / 8))
      expect(got?.path).toBe('sums')
    }
  })

  it('does not spend a roll it has no use for', () => {
    /*
     * The rng is one shared sequence, and main.ts hands `defaultRng` to the
     * generators straight after this call. A probe check that drew a number
     * even when no probe was possible would shift every downstream draw on the
     * island — the kind of change that makes a deterministic test flaky and
     * nobody's fault findable.
     */
    let drawn = 0
    const counted = () => { drawn++; return 0 }
    const it = island()
    it.h.dealMaths(counted)
    expect(drawn).toBe(1)
    masterSums1(it)
    it.h.dealMaths(counted)
    expect(drawn).toBe(3)
  })

  it('records a probe in its own ring and moves nothing else', () => {
    /*
     * THE RULE THE WHOLE PROBE DESIGN RESTS ON. A wrong first probe that
     * seeded `ewma` would leave the unticked stage at 0 and take dozens of
     * real attempts to climb out — brief §19 says wrong answers cost nothing,
     * and that would be the ledger charging for one. `early` is worse: it
     * freezes, so a slow probe would sit in A6's speed baseline forever.
     */
    const it = island()
    it.h.dealt('sums', 2, true)
    it.h.recordAttempt(attempt({ correct: false, latencyMs: 9000, rescued: true }))
    const st = it.a.sums.stages[2]!
    expect(st.probes).toEqual([0])
    expect(st.attempts).toBe(0)
    expect(st.ewma).toBeNull()
    expect(st.latencies).toEqual([])
    expect(st.early).toEqual([])
    expect(st.sessions).toEqual([])
    expect(st.rescues).toEqual([])
  })

  it('leaves the SOURCE stage alone too — a probe is nobody\'s attempt', () => {
    const it = island()
    masterSums1(it)
    const before = JSON.stringify(it.a.sums.stages[1])
    it.h.dealt('sums', 2, true)
    for (let i = 0; i < 5; i++) it.h.recordAttempt(attempt({ correct: false }))
    expect(JSON.stringify(it.a.sums.stages[1])).toBe(before)
  })

  it('keeps the last twelve probe outcomes and no more', () => {
    const it = island()
    it.h.dealt('sums', 2, true)
    for (let i = 0; i < 20; i++) it.h.recordAttempt(attempt({ correct: i >= 18 }))
    expect(it.a.sums.stages[2]!.probes).toHaveLength(12)
    expect(it.a.sums.stages[2]!.probes.slice(-2)).toEqual([1, 1])
  })

  it('goes back to plain recording as soon as a plain round is dealt', () => {
    const it = island()
    it.h.dealt('sums', 2, true)
    it.h.recordAttempt(attempt({ correct: true }))
    it.h.dealt('sums', 1)
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.stages[2]!.probes).toEqual([1])
    expect(it.a.sums.stages[1]!.attempts).toBe(1)
    expect(it.a.sums.stages[2]!.attempts).toBe(0)
  })
})

describe('Run B — the promotion gate', () => {
  /*
   * runA.md:226-228: EWMA ≥ .85, ≥ 20 attempts, probe accuracy ≥ .70 over
   * ≥ 8, zero-rescue recent sessions, ≥ 2 distinct days. Every clause below
   * is knocked out on its own from a passing island, because a gate that
   * passes for the wrong reason is a gate that promotes a child who is not
   * ready and calls it evidence.
   */
  const trickier = { path: 'sums', stage: 2, kind: 'trickier' }

  it('offers trickier questions when the whole of it is passed', () => {
    const it = gateReady()
    expect(it.h.pendingOffer()).toEqual(trickier)
    expect(it.h.offerDue('sums')).toBe(true)
  })

  it('refuses on accuracy under .85', () => {
    const it = gateReady()
    it.h.dealt('sums', 1)
    it.h.recordAttempt(attempt({ correct: false }))
    it.h.recordAttempt(attempt({ correct: false }))
    expect(it.a.sums.stages[1]!.ewma!).toBeLessThan(0.85)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses under twenty attempts', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    it.h.dealt('sums', 1)
    for (const d of ['2026-07-01', '2026-07-02']) {
      it.on(d)
      for (let i = 0; i < 9; i++) it.h.recordAttempt(attempt({ correct: true }))
    }
    probeSums2(it)
    it.on('2026-07-03')
    expect(it.a.sums.stages[1]!.attempts).toBe(18)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses on fewer than eight probes, however good they are', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeSums2(it, 7, 7)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses on probe accuracy under .70', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeSums2(it, 5, 8)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses while a rescue sits in either of the last two sessions', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    it.h.dealt('sums', 1)
    it.on('2026-07-01')
    it.h.recordAttempt(attempt({ correct: false, rescued: true }))
    for (let i = 0; i < 10; i++) it.h.recordAttempt(attempt({ correct: true }))
    it.on('2026-07-02')
    for (let i = 0; i < 15; i++) it.h.recordAttempt(attempt({ correct: true }))
    probeSums2(it)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('lets a rescue age out of the last two sessions', () => {
    // The clause is zero-rescue RECENT, not zero-rescue ever. A child who
    // needed a hand a week ago has since shown she does not.
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    it.h.dealt('sums', 1)
    it.on('2026-07-01')
    it.h.recordAttempt(attempt({ correct: false, rescued: true }))
    for (const d of ['2026-07-02', '2026-07-03']) {
      it.on(d)
      for (let i = 0; i < 12; i++) it.h.recordAttempt(attempt({ correct: true }))
    }
    probeSums2(it)
    it.on('2026-07-04')
    expect(it.a.sums.stages[1]!.rescues).toHaveLength(1)
    expect(it.h.pendingOffer()).toEqual(trickier)
  })

  it('refuses on a single day of work, however much of it there is', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it, ['2026-07-01', '2026-07-01'])
    probeSums2(it)
    it.on('2026-07-02')
    expect(it.a.sums.stages[1]!.attempts).toBe(20)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses a path a parent took off Auto — JT-011(a)', () => {
    const it = gateReady()
    it.h.setMode('sums', 'manual')
    expect(it.h.offerDue('sums')).toBe(false)
    expect(it.h.pendingOffer()?.path).not.toBe('sums')
    it.h.setMode('sums', 'hold')
    expect(it.h.offerDue('sums')).toBe(false)
    it.h.setMode('sums', 'auto')
    expect(it.h.offerDue('sums')).toBe(true)
  })

  it('has nothing to offer once the top rung is ticked', () => {
    const it = gateReady()
    it.h.setTicked('sums', 2, true)
    expect(it.h.pendingOffer()).toBeNull()
  })
})

describe('Run B — the cadence of an offer', () => {
  it('ticks the target and stamps the honeymoon when she says yes', () => {
    const it = gateReady()
    it.h.noteOffer('sums', true)
    expect(it.a.sums.stages[2]!.ticked).toBe(true)
    expect(it.h.levelFor('sums')).toEqual([1, 2])
    expect(it.a.sums.honeymoonFrom).toBe('2026-07-03')
    expect(it.h.honeymoonActive('sums')).toBe(true)
  })

  it('asks nothing else that session, accepted or declined', () => {
    // runA.md:230, max 1/session. Two questions in one sitting is a sales
    // pitch, and the second is the one she agrees to to make it stop.
    for (const answer of [true, false]) {
      const it = gateReady()
      it.h.noteOffer('sums', answer)
      expect(it.h.pendingOffer()).toBeNull()
    }
  })

  it('asks nothing else that session on ANY path, accepted or declined', () => {
    /*
     * The cadence is stored per path, because a decline is about a path — but
     * the LIMIT is about the child. With subtraction due to be introduced and
     * a trickier sums offer standing behind it, answering the first must end
     * the questions for the sitting whichever way she answered: a second ask
     * is the one she says yes to only to make it stop.
     */
    for (const answer of [true, false]) {
      const it = island()
      masterSums1(it)
      probeSums2(it)
      it.on('2026-07-03')
      expect(it.h.pendingOffer()?.kind).toBe('takingAway')
      it.h.noteOffer('takingAway', answer)
      expect(it.h.pendingOffer()).toBeNull()
      expect(it.h.offerDue('sums')).toBe(false)
    }
  })

  it('costs her nothing to decline', () => {
    const it = gateReady()
    const stats = JSON.stringify(it.a.sums.stages)
    it.h.noteOffer('sums', false)
    expect(JSON.stringify(it.a.sums.stages)).toBe(stats)
    expect(it.a.sums.honeymoonFrom).toBeNull()
  })

  it('honours a decline for two sessions, then asks once more', () => {
    const it = gateReady()
    it.h.noteOffer('sums', false)
    it.h.dealt('sums', 1)

    // The session she declined in is not one of the two: the count starts on
    // the next day she plays, and reaches 2 on the second of them.
    it.on('2026-07-04')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.offer.daysSinceDecline).toBe(1)
    expect(it.h.pendingOffer()).toBeNull()
    it.on('2026-07-05')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.offer.daysSinceDecline).toBe(2)
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 2, kind: 'trickier' })
  })

  it('counts the cooldown in days she played, not days on the calendar', () => {
    // A child who did not open the island for a fortnight has not declined
    // anything twice. Two SESSIONS is what the spec says and what she gets.
    const it = gateReady()
    it.h.noteOffer('sums', false)
    it.on('2026-07-20')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('counts a day once, however much of it she plays', () => {
    const it = gateReady()
    it.h.noteOffer('sums', false)
    it.h.dealt('sums', 1)
    it.on('2026-07-04')
    for (let i = 0; i < 30; i++) it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.offer.daysSinceDecline).toBe(1)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('does nothing at all when nothing is due', () => {
    const it = island()
    const before = JSON.stringify(it.a)
    it.h.noteOffer('sums', true)
    it.h.noteOffer('sums', false)
    expect(JSON.stringify(it.a)).toBe(before)
  })

  it('refuses an answer to an offer it is not making', () => {
    // A stale overlay, a double tap, a replayed event: none of them may tick a
    // stage, because a tick is the one thing here that changes what she gets.
    const it = gateReady()
    it.h.noteOffer('takingAway', true)
    expect(it.a.takingAway.stages[2]!.ticked).toBe(false)
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 2, kind: 'trickier' })
  })

  it('runs the honeymoon for two sessions and then stops', () => {
    const it = gateReady()
    it.h.noteOffer('sums', true)
    it.h.dealt('sums', 2)
    expect(it.h.honeymoonActive('sums')).toBe(true)
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.h.honeymoonActive('sums')).toBe(true)
    it.on('2026-07-04')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.h.honeymoonActive('sums')).toBe(true)
    it.on('2026-07-05')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.h.honeymoonActive('sums')).toBe(false)
  })

  it('has no honeymoon on a path nobody accepted anything for', () => {
    const it = gateReady()
    for (const p of LIVE_PATHS) expect(it.h.honeymoonActive(p)).toBe(false)
  })

  it('leaves the economy alone, which is the next slice\'s half', () => {
    // runA.md:233 is "pay 3, 2 sessions, cost-index frozen" and only the WHEN
    // of that lives here. A harness that reached into balance/ would be the
    // second write path this project has been bitten by four times.
    const it = gateReady()
    it.h.noteOffer('sums', true)
    expect(Object.keys(it.a.sums).sort())
      .toEqual(['honeymoonFrom', 'mode', 'offer', 'stages'])
  })
})

describe('Run B — introducing taking away', () => {
  const intro = { path: 'takingAway', stage: 1, kind: 'takingAway' }

  it('offers it on sums 1 alone, with no subtraction probes at all', () => {
    /*
     * Fable's ruling. takingAway starts with NOTHING ticked, so it can never
     * accumulate a probe ring of its own and the probe clause has to be
     * dropped rather than faked.
     *
     * REJECTED: dealing subtraction probes before the path is open — that
     * ambushes a five-year-old with a minus sign nobody introduced and spends
     * the debut (runA.md:234-236) on an accident. REJECTED: waiting for sums
     * 2 — Joe's JT-010 worked example has subtraction arriving ALONGSIDE the
     * second sum rung, not queued behind it.
     */
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')
    expect(it.a.takingAway.stages[1]!.probes).toEqual([])
    expect(it.h.pendingOffer()).toEqual(intro)
  })

  it('never deals a subtraction before the offer is accepted', () => {
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')
    for (let i = 0; i < 200; i++) {
      expect(it.h.dealMaths(rolls(i / 200, (i % 8) / 8))?.path).toBe('sums')
    }
  })

  it('wins the session when a trickier offer is due as well', () => {
    // Only one offer may be made, so the two have to be ordered, and this one
    // is the larger event: a whole new kind of maths against one rung more of
    // the kind she is already doing.
    const it = island()
    masterSums1(it)
    probeSums2(it)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toEqual(intro)
    expect(it.h.offerDue('sums')).toBe(false)
  })

  it('lets the trickier offer through the next session once it is settled', () => {
    const it = island()
    masterSums1(it)
    probeSums2(it)
    it.on('2026-07-03')
    it.h.noteOffer('takingAway', true)
    expect(it.a.takingAway.stages[1]!.ticked).toBe(true)
    it.on('2026-07-04')
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 2, kind: 'trickier' })
  })

  it('splits the deal moment evenly the moment it is accepted — JT-007\'s evening', () => {
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')
    it.h.noteOffer('takingAway', true)
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      const got = it.h.dealMaths(rolls(i / 200, 0.9))
      seen.add(`${got?.path}:${got?.stage}`)
    }
    expect([...seen].sort()).toEqual(['sums:1', 'takingAway:1'])
  })

  it('stops offering it once it is open', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('does not offer it when a parent holds the path himself — JT-011(a)', () => {
    const it = island()
    masterSums1(it)
    it.h.setMode('takingAway', 'manual')
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
    expect(it.a.takingAway.stages[1]!.ticked).toBe(false)
  })

  it('comes round again after a decline, though she plays no subtraction', () => {
    /*
     * THE ONE THAT WOULD HAVE SHIPPED BROKEN. The cooldown counts days she
     * played, and before this offer is accepted she cannot play takingAway at
     * all — nothing on it is ticked, so nothing on it is ever recorded. Counted
     * per path, a declined introduction would never be made again.
     */
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')
    it.h.noteOffer('takingAway', false)
    it.h.dealt('sums', 1)
    for (const d of ['2026-07-04', '2026-07-05']) {
      it.on(d)
      it.h.recordAttempt(attempt({ correct: true }))
    }
    expect(it.h.pendingOffer()).toEqual(intro)
  })
})

describe('Run B — nothing demotes, ever', () => {
  /*
   * runA.md:240, and the whole reason Auto is safe to leave on. A child who
   * has a bad fortnight — accuracy collapsing, rescue after rescue, a run of
   * wrong answers — loses NOTHING she has already been given. Untick is a
   * parent's hand and Auto has no hand at all.
   */
  it('leaves every tick standing through a collapse, a rescue storm and a wrong streak', () => {
    const it = island()
    it.a.sums.stages[2]!.ticked = true
    it.a.takingAway.stages[1]!.ticked = true
    const ticksBefore = LIVE_PATHS.map(p => it.h.levelFor(p))

    for (const [path, stage] of [['sums', 1], ['sums', 2], ['takingAway', 1]] as const) {
      it.h.dealt(path, stage)
      for (let d = 4; d <= 9; d++) {
        it.on(`2026-07-0${d}`)
        for (let i = 0; i < 20; i++) {
          it.h.recordAttempt(attempt({ correct: false, rescued: true }))
        }
      }
      expect(it.a[path].stages[stage]!.ewma).toBeLessThan(0.05)
    }
    it.h.dealt('sums', 2, true)
    for (let i = 0; i < 20; i++) it.h.recordAttempt(attempt({ correct: false }))

    expect(LIVE_PATHS.map(p => it.h.levelFor(p))).toEqual(ticksBefore)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('never unticks on a decline either', () => {
    const it = gateReady()
    const before = LIVE_PATHS.map(p => it.h.levelFor(p))
    it.h.noteOffer('sums', false)
    expect(LIVE_PATHS.map(p => it.h.levelFor(p))).toEqual(before)
  })
})

describe('Run B\'s bookkeeping survives a save', () => {
  /*
   * `attainment` is persisted wholesale, but `readAttainment` rebuilds outward
   * from STAGES and copies field by field — so a field it does not name is a
   * field that silently does not come back. These are the fields.
   */
  const roundTrip = (a: ReturnType<typeof createAttainment>) =>
    readAttainment(JSON.parse(JSON.stringify(a)))

  it('carries the probe ring, the offer state and the honeymoon', () => {
    const it = gateReady()
    it.h.noteOffer('sums', true)
    const back = roundTrip(it.a)
    expect(back.sums.stages[2]?.probes).toEqual(it.a.sums.stages[2]!.probes)
    expect(back.sums.offer.lastOfferDay).toBe('2026-07-03')
    expect(back.sums.honeymoonFrom).toBe('2026-07-03')
  })

  it('carries a decline, so a reload is not a way to be asked again', () => {
    const it = gateReady()
    it.h.noteOffer('sums', false)
    const back = roundTrip(it.a)
    expect(back.sums.offer.declinedDay).toBe('2026-07-03')
    expect(back.sums.offer.daysSinceDecline).toBe(0)
    expect(createHarness(back, () => Date.parse('2026-07-04T09:00:00Z')).pendingOffer())
      .toBeNull()
  })

  it('wakes a save written before any of this existed with honest defaults', () => {
    // The pre-Run-B shape, exactly: mode and stages, and no idea that probes
    // or offers were ever going to exist.
    const back = readAttainment({
      sums: {
        mode: 'auto',
        stages: { 1: { ticked: true, attempts: 42, ewma: 0.9 }, 2: { ticked: false } },
      },
    })
    expect(back.sums.stages[1]?.attempts).toBe(42)
    expect(back.sums.stages[1]?.probes).toEqual([])
    expect(back.sums.offer)
      .toEqual({ lastOfferDay: null, declinedDay: null, daysSinceDecline: 0, lastCountedDay: null })
    expect(back.sums.honeymoonFrom).toBeNull()
  })

  it('drops garbage rather than letting it decide what a child is given', () => {
    /*
     * A hand-edited save is untrusted input. A probe ring of strings would
     * make the .70 mean meaningless; a `daysSinceDecline` of -5 is a cooldown
     * that never ends; a `declinedDay` of "soon" is a suppression with no day
     * behind it to ever clear it.
     */
    const back = readAttainment({
      sums: {
        mode: 'auto',
        offer: {
          lastOfferDay: 'yesterday', declinedDay: 'soon',
          daysSinceDecline: -5, lastCountedDay: 7,
        },
        honeymoonFrom: 'forever',
        stages: { 1: { ticked: true, probes: ['1', null, 3, 1, 0] }, 2: { ticked: false } },
      },
    })
    expect(back.sums.stages[1]?.probes).toEqual([1, 0])
    expect(back.sums.offer)
      .toEqual({ lastOfferDay: null, declinedDay: null, daysSinceDecline: 0, lastCountedDay: null })
    expect(back.sums.honeymoonFrom).toBeNull()
  })

  it('keeps a probe ring to twelve however long the file says it is', () => {
    const back = readAttainment({
      sums: { mode: 'auto', stages: { 2: { ticked: false, probes: Array(40).fill(1) } } },
    })
    expect(back.sums.stages[2]?.probes).toHaveLength(12)
  })
})

describe('a deal moment — JT-010(1), the share of maths stays by tick', () => {
  /*
   * Joe: *"share of maths stays by tick, one easy sum, one easy sub and one
   * medium sum, is 2/3 sum 1/3 sub. but as soon as sub becomes proficient for
   * the next level, the next triggers and the share is 1:1 again."*
   *
   * So the maths deal moment pools the ticked stages of BOTH paths and draws
   * uniformly over the pool — the share is a consequence of the ladder rather
   * than a number anyone sets, and the drift he was shown is the drift he
   * wants, because Run B ticking the next sub rung is what levels it again.
   */
  const mathsShare = (a: ReturnType<typeof createAttainment>): Record<string, number> => {
    const h = createHarness(a)
    const tally: Record<string, number> = {}
    const N = 600
    for (let i = 0; i < N; i++) {
      // A deterministic sweep of [0,1), so this measures the SPLIT and not an rng.
      const got = h.dealMaths(() => i / N)
      const key = got ? got.path + ':' + got.stage : 'none'
      tally[key] = (tally[key] ?? 0) + 1
    }
    return tally
  }

  it('deals only sums when only sums are ticked', () => {
    expect(mathsShare(createAttainment())).toEqual({ 'sums:1': 600 })
  })

  it('splits evenly the moment a take-away is ticked — JT-007\'s evening', () => {
    const a = createAttainment()
    a.takingAway.stages[1]!.ticked = true
    expect(mathsShare(a)).toEqual({ 'sums:1': 300, 'takingAway:1': 300 })
  })

  it('is 2/3 sums and 1/3 take-aways on Joe\'s own worked example', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    a.takingAway.stages[1]!.ticked = true
    expect(mathsShare(a)).toEqual({ 'sums:1': 200, 'sums:2': 200, 'takingAway:1': 200 })
  })

  it('is level again once the next take-away rung ticks, exactly as he said', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    a.takingAway.stages[1]!.ticked = true
    a.takingAway.stages[2]!.ticked = true
    const share = mathsShare(a)
    const sums = (share['sums:1'] ?? 0) + (share['sums:2'] ?? 0)
    const subs = (share['takingAway:1'] ?? 0) + (share['takingAway:2'] ?? 0)
    expect(sums).toBe(subs)
  })

  it('deals nothing at all when the whole of maths is unticked', () => {
    const a = createAttainment()
    a.sums.stages[1]!.ticked = false
    expect(createHarness(a).dealMaths(() => 0)).toBeNull()
  })
})

describe('a reading page — JT-010(2), three builds to one find', () => {
  /*
   * Joe: *"reading mix should be 3 build, 1 find. period."* — which is what
   * balance.json has said all along. The bug was never the data (PB-038).
   */
  const kinds = (a: ReturnType<typeof createAttainment>, n: number): string[] => {
    const h = createHarness(a)
    return Array.from({ length: n }, (_, page) => h.dealReading(page) ?? 'none')
  }

  it('gives one find page in four', () => {
    expect(kinds(createAttainment(), 8)).toEqual(
      ['find', 'build', 'build', 'build', 'find', 'build', 'build', 'build'])
  })

  it('gives her every page as a find when building is unticked', () => {
    // The tickbox is a capability and the mix is a preference: where they
    // disagree the parent wins, or a data file would be overruling him.
    const a = createAttainment()
    a.building.stages[1]!.ticked = false
    expect(new Set(kinds(a, 8))).toEqual(new Set(['find']))
  })

  it('gives her every page as a build when reading is unticked', () => {
    const a = createAttainment()
    a.reading.stages[1]!.ticked = false
    expect(new Set(kinds(a, 8))).toEqual(new Set(['build']))
  })

  it('deals nothing when neither is ticked', () => {
    const a = createAttainment()
    a.reading.stages[1]!.ticked = false
    a.building.stages[1]!.ticked = false
    expect(createHarness(a).dealReading(0)).toBeNull()
  })
})

describe('the last tick is protected — JT-010(3)', () => {
  /*
   * Joe: *"prevent unticking the last tick on each path."*
   *
   * READ AS THE DEAL MOMENT rather than the single path, and the reason is his
   * own earlier card. JT-007 has him ticking takingAway 1 to try it, and says
   * in terms that *"untick is a parent's hand, not a demotion, so it is safe to
   * try"* — a literal per-path rule would make that tick permanent the instant
   * he made it, which is the opposite of safe to try. What the guard is for is
   * the harm he was actually shown: a child tapping a plot, or an egg, and
   * finding nothing there. So each DEAL MOMENT keeps at least one ticked stage,
   * and inside a moment either path may go empty.
   */
  it('refuses the last maths tick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.canUntick('sums', 1)).toBe(false)
    expect(h.setTicked('sums', 1, false)).toBe(false)
    expect(a.sums.stages[1]?.ticked).toBe(true)
  })

  it('allows it once a take-away is standing behind it', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.setTicked('takingAway', 1, true)
    expect(h.canUntick('sums', 1)).toBe(true)
    expect(h.setTicked('sums', 1, false)).toBe(true)
    expect(createHarness(a).dealMaths(() => 0))
      .toEqual({ path: 'takingAway', stage: 1, probe: false })
  })

  it('lets Joe undo the evening he tried subtraction — JT-007 stays safe to try', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.setTicked('takingAway', 1, true)
    expect(h.canUntick('takingAway', 1)).toBe(true)
    expect(h.setTicked('takingAway', 1, false)).toBe(true)
    expect(a.takingAway.stages[1]?.ticked).toBe(false)
  })

  it('lets one whole path inside a moment go empty', () => {
    // Reading unticked with building still ticked: the egg still hatches, and
    // a parent who wants only word-building may have it.
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.setTicked('reading', 1, false)).toBe(true)
    expect(h.canUntick('building', 1)).toBe(false)
  })

  it('never blocks a tick, only an untick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.setTicked('sums', 2, true)).toBe(true)
    expect(a.sums.stages[2]?.ticked).toBe(true)
  })

  it('refuses a stage that has no generator rather than inventing one', () => {
    const h = createHarness(createAttainment())
    expect(h.setTicked('reading', 2, true)).toBe(false)
    expect(h.levelFor('reading')).toEqual([1])
  })
})

describe('a save can never strand her in a round that cannot be dealt', () => {
  /*
   * `openRead`/`openSum` decline when their moment has nothing ticked, and a
   * port that declines leaves the flow in 'challenge' with no overlay and no
   * way out but a reload — the exact fault main.ts:1669 records having already
   * been fixed once. The panel cannot produce that state (JT-010(3) refuses
   * the last untick), but a save is untrusted input and a hand-edited one can.
   *
   * So the invariant is enforced where the untrusted data enters, not only at
   * the UI: a moment with nothing ticked is not a preference, it is corruption,
   * and corruption yields the default rather than an unplayable island.
   */
  it('gives maths back its first rung when a save has emptied the whole moment', () => {
    const a = readAttainment({
      sums: { mode: 'manual', stages: { 1: { ticked: false }, 2: { ticked: false } } },
      takingAway: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(createHarness(a).dealMaths(() => 0))
      .toEqual({ path: 'sums', stage: 1, probe: false })
  })

  it('gives reading back its first rung the same way', () => {
    const a = readAttainment({
      reading: { mode: 'manual', stages: { 1: { ticked: false } } },
      building: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(createHarness(a).dealReading(0)).not.toBeNull()
  })

  it('leaves a moment alone when one of its paths is still ticked', () => {
    // Reading off, building on, is a coherent thing for a parent to want.
    const a = readAttainment({
      reading: { mode: 'manual', stages: { 1: { ticked: false } } },
      building: { mode: 'manual', stages: { 1: { ticked: true } } },
    })
    expect(a.reading.stages[1]?.ticked).toBe(false)
    expect(createHarness(a).dealReading(0)).toBe('build')
  })

  it('keeps the stats it repaired the ticks on', () => {
    // Repairing capability must not throw away measurement — that is history,
    // and it is the only record of what she has actually done.
    const a = readAttainment({
      sums: { mode: 'manual', stages: { 1: { ticked: false, attempts: 42, ewma: 0.9 } } },
      takingAway: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(a.sums.stages[1]?.ticked).toBe(true)
    expect(a.sums.stages[1]?.attempts).toBe(42)
    expect(a.sums.stages[1]?.ewma).toBe(0.9)
  })
})

describe('who moves a path’s ticks', () => {
  it('sets the mode and says that it took', () => {
    const a = createAttainment()
    const h = createHarness(a)
    expect(a.sums.mode).toBe('auto')
    expect(h.setMode('sums', 'manual')).toBe(true)
    expect(a.sums.mode).toBe('manual')
    expect(h.setMode('sums', 'hold')).toBe(true)
    expect(a.sums.mode).toBe('hold')
  })

  it('is per path, so one hand does not move the others', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.setMode('takingAway', 'manual')
    expect(a.takingAway.mode).toBe('manual')
    expect(a.sums.mode).toBe('auto')
    expect(a.reading.mode).toBe('auto')
    expect(a.building.mode).toBe('auto')
  })

  it('refuses a path that is not live, so a reserved slot cannot grow a mode', () => {
    // The panel renders the reserved slots; nothing about rendering one should
    // be able to give it state a save would then carry.
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.setMode('fractions' as never, 'manual')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(a, 'fractions')).toBe(false)
  })

  it('changes nothing about what she may be dealt', () => {
    // Mode says WHO moves the ticks. It is not itself a tick, and a panel
    // switching to Hold must not quietly narrow what she is given.
    const a = createAttainment()
    const h = createHarness(a)
    const before = LIVE_PATHS.map(p => h.levelFor(p))
    for (const mode of ['manual', 'hold', 'auto'] as const) {
      for (const p of LIVE_PATHS) h.setMode(p, mode)
      expect(LIVE_PATHS.map(q => h.levelFor(q))).toEqual(before)
    }
  })

  it('survives the trip through a save', () => {
    const a = createAttainment()
    createHarness(a).setMode('reading', 'hold')
    const back = readAttainment(JSON.parse(JSON.stringify(a)))
    expect(back.reading.mode).toBe('hold')
  })
})
