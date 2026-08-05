/**
 * A3 — the harness, the island's single choke point for policy.
 *
 * These tests drive the module directly. It is deliberately pure: no DOM, no
 * clock it does not own, no generators. What it knows is which stages a child
 * is allowed to be dealt and how they have been doing on them; what it never
 * does is render, deal or persist.
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
/* The new rung is a change to the STAGE TABLE, so the two things that read
 * that table from outside — the save loader and the parent's wording — are
 * part of what has to be shown still working. */
import { toSave, fromSave } from '../../src/island/save'
import { createFlow } from '../../src/island/flow'
import { stageLabel } from '../../src/island/grownups'

/** An attempt with everything switched off, so a test states only what it means. */
const attempt = (over: Partial<AttemptEvent> = {}): AttemptEvent => ({
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0, ...over,
})

describe('the stages that exist', () => {
  it('lists only generators that are actually built', () => {
    // A4: sums [1 to-ten, 3 teens-plus-units, 2 to-twenty bridging] ·
    // takingAway [1,2,3 as v0] · reading [1] · building [1].
    //
    // SUMS IS OUT OF NUMERIC ORDER ON PURPOSE and this test pins it that way.
    // The number is a generator id and the POSITION is the ladder rung: 3 is
    // the newer, easier rung and sits between them. Renumbering it to [1,2,3]
    // would change what the second rung generates and redden the frozen
    // golden.
    /* SEVEN RUNGS since 4 August — Joe: "add some more summation levels."
     * The original four are untouched and in the same relative order; ids 4, 5,
     * 6 and 7 are new. See STAGES in harness.ts for the ladder and why the ids
     * are not in numeric order. */
    expect(STAGES.sums).toEqual([4, 1, 3, 5, 2, 6, 7])
    expect(STAGES.takingAway).toEqual([1, 2, 3])
    expect(STAGES.reading).toEqual([3, 4, 1, 5, 6, 7, 8, 9, 10, 11])
    expect(STAGES.building).toEqual([1])
  })

  it('gives building exactly one stage, because level 2 is the alien', () => {
    /*
     * Not an oversight and not a placeholder. `generateBuild` level 2 is the
     * ALIEN generator (build.ts:25), and the no-aliens ruling retires it. So
     * the tickbox on this path is a capability switch with no ladder behind it,
     * and a future rung means a new generator rather than a new number here.
     * Reading, by contrast, has acquired new generators (3–11) and a full ladder.
     */
    expect(STAGES.reading).toHaveLength(10)
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
     * The first rung of each path they are already playing, and nothing else.
     * takingAway starts UNTICKED because the island has never dealt a
     * subtraction — ticking it would hand them something new on the strength of
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

describe('levelFor — which stages the child may be dealt', () => {
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
    /* A hand-edited save, a rolled-back build, a future stage id: all the same
     * kind of untrusted input, and none of them may reach a generator.
     *
     * THE FIXTURE WAS `7` UNTIL 4 AUGUST, when 7 became a real rung
     * (two-digit, bridging) and this test quietly started asserting that a
     * legitimate stage was refused. 99 is chosen to be far past anything the
     * ladder could plausibly grow into. */
    a.sums.stages[99] = { ...a.sums.stages[1]!, ticked: true }
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

  it('gives back null when the path is empty, rather than a stage they cannot do', () => {
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

/**
 * Probes on the rung above sums 1 — which is stage 3, `teens plus units`, and
 * not stage 2. Ladder order, not numeric order. `n` of them, `right` correct;
 * eight at .875 clears .70.
 */
const probeNextSum = ({ h }: Island, right = 7, n = 8): void => {
  h.dealt('sums', 3, true)
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
  probeNextSum(it)
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

  it('wants none where there is no rung above — reading ends at two-syllable', () => {
    const it = island()
    // Tick all reading stages INCLUDING id 11, so that id 11 becomes the
    // topTicked stage. topTicked returns the LAST stage in LADDER ORDER that
    // has .ticked = true, so we must tick stage 11 itself (position 9) to make
    // it topTicked. This exercises the invariant that when topTicked is at the
    // top rung, nextStage is null and probeWanted returns false via the guard
    // 'if (top === null || nextStage(path) === null) return false'.
    const ladder = STAGES.reading as readonly number[]
    const targetIndex = ladder.indexOf(11)
    const stages = it.a.reading.stages as Record<number, any>
    // Tick from position 0 through position of id 11 (inclusive)
    for (let i = 0; i <= targetIndex; i++) {
      const stageId = ladder[i]
      if (stageId === undefined) continue
      if (!stages[stageId]) {
        stages[stageId] = {}
      }
      stages[stageId].ticked = true
    }
    // Now id 11 is the topTicked stage (last rung). Deal it and record
    // many correct attempts to build up its ewma.
    it.h.dealt('reading', 11)
    for (let i = 0; i < 20; i++) it.h.recordAttempt(attempt({ kind: 'find' }))
    // Since there is no rung above id 11, nextStage('reading') is null,
    // so probeWanted must return false via the early-return guard:
    // 'if (top === null || nextStage(path) === null) return false'.
    // Without this guard, the code would check ewma on stage 11, which after 20
    // correct attempts should be high enough to return true, breaking the invariant.
    expect(it.h.probeWanted('reading')).toBe(false)
  })

  it('wants none on a path a parent took off Auto — JT-011(a)', () => {
    // Joe: "Manual persists, and Run B must skip it." A parent who said they
    // move this path's ticks is not to be answered back by extra questions.
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
      .toEqual({ path: 'sums', stage: 3, probe: true })
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
  const trickier = { path: 'sums', stage: 3, kind: 'trickier' }

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
    probeNextSum(it)
    it.on('2026-07-03')
    expect(it.a.sums.stages[1]!.attempts).toBe(18)
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses on fewer than eight probes, however good they are', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it, 7, 7)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('refuses on probe accuracy under .70', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it, 5, 8)
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
    probeNextSum(it)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('lets a rescue age out of the last two sessions', () => {
    // The clause is zero-rescue RECENT, not zero-rescue ever. A child who
    // needed a hand a week ago has since shown they do not.
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    it.h.dealt('sums', 1)
    it.on('2026-07-01')
    it.h.recordAttempt(attempt({ correct: false, rescued: true }))
    for (const d of ['2026-07-02', '2026-07-03']) {
      it.on(d)
      for (let i = 0; i < 12; i++) it.h.recordAttempt(attempt({ correct: true }))
    }
    probeNextSum(it)
    it.on('2026-07-04')
    expect(it.a.sums.stages[1]!.rescues).toHaveLength(1)
    expect(it.h.pendingOffer()).toEqual(trickier)
  })

  it('refuses on a single day of work, however much of it there is', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it, ['2026-07-01', '2026-07-01'])
    probeNextSum(it)
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
  it('ticks the target and stamps the honeymoon when they say yes', () => {
    const it = gateReady()
    it.h.noteOffer('sums', true)
    expect(it.a.sums.stages[3]!.ticked).toBe(true)
    expect(it.h.levelFor('sums')).toEqual([1, 3])
    expect(it.a.sums.honeymoonFrom).toBe('2026-07-03')
    expect(it.h.honeymoonActive('sums')).toBe(true)
  })

  it('asks nothing else that session, accepted or declined', () => {
    // runA.md:230, max 1/session. Two questions in one sitting is a sales
    // pitch, and the second is the one they agree to to make it stop.
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
     * the questions for the sitting whichever way they answered: a second ask
     * is the one they say yes to only to make it stop.
     */
    for (const answer of [true, false]) {
      const it = island()
      masterSums1(it)
      probeNextSum(it)
      it.on('2026-07-03')
      expect(it.h.pendingOffer()?.kind).toBe('takingAway')
      it.h.noteOffer('takingAway', answer)
      expect(it.h.pendingOffer()).toBeNull()
      expect(it.h.offerDue('sums')).toBe(false)
    }
  })

  it('costs them nothing to decline', () => {
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

    // The session they declined in is not one of the two: the count starts on
    // the next day they play, and reaches 2 on the second of them.
    it.on('2026-07-04')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.offer.daysSinceDecline).toBe(1)
    expect(it.h.pendingOffer()).toBeNull()
    it.on('2026-07-05')
    it.h.recordAttempt(attempt({ correct: true }))
    expect(it.a.sums.offer.daysSinceDecline).toBe(2)
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
  })

  it('counts the cooldown in days they played, not days on the calendar', () => {
    // A child who did not open the island for a fortnight has not declined
    // anything twice. Two SESSIONS is what the spec says and what they get.
    const it = gateReady()
    it.h.noteOffer('sums', false)
    it.on('2026-07-20')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('counts a day once, however much of it they play', () => {
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
    // stage, because a tick is the one thing here that changes what they get.
    const it = gateReady()
    it.h.noteOffer('takingAway', true)
    expect(it.a.takingAway.stages[2]!.ticked).toBe(false)
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
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
    // the kind they are already doing.
    const it = island()
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toEqual(intro)
    expect(it.h.offerDue('sums')).toBe(false)
  })

  it('lets the trickier offer through the next session once it is settled', () => {
    const it = island()
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')
    it.h.noteOffer('takingAway', true)
    expect(it.a.takingAway.stages[1]!.ticked).toBe(true)
    it.on('2026-07-04')
    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
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

  it('does not offer it when a parent holds the path themselves — JT-011(a)', () => {
    const it = island()
    masterSums1(it)
    it.h.setMode('takingAway', 'manual')
    it.on('2026-07-03')
    expect(it.h.pendingOffer()).toBeNull()
    expect(it.a.takingAway.stages[1]!.ticked).toBe(false)
  })

  it('comes round again after a decline, though they play no subtraction', () => {
    /*
     * THE ONE THAT WOULD HAVE SHIPPED BROKEN. The cooldown counts days they
     * played, and before this offer is accepted they cannot play takingAway at
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
   * wrong answers — loses NOTHING they have already been given. Untick is a
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
    expect(back.sums.stages[3]?.probes).toEqual(it.a.sums.stages[3]!.probes)
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

  it('gives them every page as a find when building is unticked', () => {
    // The tickbox is a capability and the mix is a preference: where the two
    // disagree the parent wins, or a data file would be overruling them.
    const a = createAttainment()
    a.building.stages[1]!.ticked = false
    expect(new Set(kinds(a, 8))).toEqual(new Set(['find']))
  })

  it('gives them every page as a build when reading is unticked', () => {
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

describe('a save can never strand the child in a round that cannot be dealt', () => {
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
    // and it is the only record of what they have actually done.
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

  it('changes nothing about what they may be dealt', () => {
    // Mode says WHO moves the ticks. It is not itself a tick, and a panel
    // switching to Hold must not quietly narrow what they are given.
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

/* ------------------------------------- adaptive selection: lean, mercy, whisper */

/**
 * The three mechanisms runA.md:236-237 asks for, all of them landing in the one
 * draw: *"weakness-lean between paths bounded 65/35 on persistent estimates
 * only, invisible in-session mercy runs, whisper retirement (1–2 items per
 * session from mastered stages, feeding the settled-✓ that can quietly wake)."*
 *
 * They are tested TOGETHER because they share a vehicle, and because the thing
 * most worth pinning down is how they are kept apart: the lean sets the weight
 * of a PATH, the other two set the weight of a STAGE WITHIN a path, and the
 * stage weights are renormalised inside their path before the path weight
 * multiplies them. So JT-010(1) — *"share of maths stays by tick"* — is
 * answered by the lean alone, and no amount of mercy or retirement can touch
 * it. Nearly every test below is a test of that boundary.
 */
type Att = ReturnType<typeof createAttainment>
type H = ReturnType<typeof createHarness>

/** An island with exactly these maths stages ticked and nothing else said. */
const mathsIsland = (keys: readonly string[]): Att => {
  const a = createAttainment()
  for (const p of ['sums', 'takingAway'] as const) {
    for (const s of STAGES[p]) a[p]!.stages[s]!.ticked = keys.includes(`${p}:${s}`)
  }
  return a
}

/** The pool the harness draws from, in the harness's own order. */
const mathsPool = (a: Att): string[] => {
  const out: string[] = []
  for (const p of ['sums', 'takingAway'] as const) {
    for (const s of STAGES[p]) if (a[p]!.stages[s]!.ticked) out.push(`${p}:${s}`)
  }
  return out
}

/** A persisted estimate, stated directly: a save is only ever a record. */
const persist = (
  a: Att, path: 'sums' | 'takingAway', stage: number, ewma: number, attempts: number,
): void => {
  const st = a[path]!.stages[stage]!
  st.ticked = true
  st.ewma = ewma
  st.attempts = attempts
}

/** Deals over a deterministic sweep of [0,1), tallied. Measures a SPLIT, not an rng. */
const deals = (h: H, N = 1000): Record<string, number> => {
  const tally: Record<string, number> = {}
  for (let i = 0; i < N; i++) {
    const got = h.dealMaths(() => i / N)
    const key = got ? got.path + ':' + got.stage : 'none'
    tally[key] = (tally[key] ?? 0) + 1
  }
  return tally
}

/**
 * A count from a sweep, to within a rounding boundary.
 *
 * A deterministic sweep of [0,1) measures a share exactly EXCEPT at the one
 * index that straddles a cumulative boundary, where a weight of 1/1.2 · 2 is
 * not the same double as 5/3. One item in six hundred either way is that, and
 * asserting through it would be asserting about IEEE 754 rather than about
 * what a child is dealt.
 */
const about = (got: number | undefined, want: number, slack = 2): void => {
  expect(got ?? 0).toBeGreaterThanOrEqual(want - slack)
  expect(got ?? 0).toBeLessThanOrEqual(want + slack)
}

/** The same sweep, collapsed to the only thing JT-010(1) is about. */
const pathShare = (h: H, N = 1000): Record<string, number> => {
  const out: Record<string, number> = { sums: 0, takingAway: 0 }
  for (const [key, n] of Object.entries(deals(h, N))) {
    const path = key.split(':')[0] as string
    out[path] = (out[path] ?? 0) + n
  }
  return out
}

describe('the weighted draw — the vehicle all three mechanisms ride on', () => {
  /*
   * THE REGRESSION NET FOR EVERY TEST ABOVE THIS LINE. The uniform index that
   * `dealMaths` used to compute is Joe's JT-010(1) and it is not superseded: it
   * is now the case where every weight happens to be equal, and it must come
   * out of the cumulative walk unchanged down to the last boundary case.
   */
  const uniformPick = (n: number, r: number): number =>
    Math.min(n - 1, Math.max(0, Math.floor(r * n)))

  /** Boundaries, an out-of-contract roll at each end, and a long sweep. */
  const ROLLS = [
    0, 1e-12, 0.05, 0.2, 0.25, 1 / 3, 0.4, 0.5, 0.6, 2 / 3, 0.75, 0.8,
    0.9999999999, -0.5, 1.5,
    ...Array.from({ length: 997 }, (_, i) => i / 997),
  ]

  const CONFIGS = [
    ['sums:1'],
    ['sums:1', 'takingAway:1'],
    ['sums:1', 'sums:2', 'takingAway:1'],
    ['sums:1', 'sums:2', 'takingAway:1', 'takingAway:2', 'takingAway:3'],
  ]

  it('picks exactly what the uniform draw picked, roll for roll', () => {
    for (const keys of CONFIGS) {
      const a = mathsIsland(keys)
      const h = createHarness(a)
      const pool = mathsPool(a)
      for (const r of ROLLS) {
        const got = h.dealMaths(() => r)
        expect(`${got?.path}:${got?.stage}`).toBe(pool[uniformPick(pool.length, r)])
      }
    }
  })

  it('spends exactly one roll, as the uniform draw did', () => {
    /*
     * The island's rng is a single shared sequence and `main.ts` hands the same
     * one to the generators immediately afterwards. A weighted draw that
     * rejected and re-rolled would cost a different number of draws depending
     * on its own outcome, which is how a deterministic test stops being
     * deterministic and nobody's fault stays findable.
     */
    let drawn = 0
    const counted = () => { drawn++; return 0.5 }
    const h = createHarness(mathsIsland(['sums:1', 'sums:2', 'takingAway:1']))
    h.dealMaths(counted)
    expect(drawn).toBe(1)
  })

  it('still deals nothing at all when the whole of maths is unticked', () => {
    expect(createHarness(mathsIsland([])).dealMaths(() => 0)).toBeNull()
  })
})

describe('the weakness lean — runA.md:236, and JT-010 survives it', () => {
  it('does not lean until BOTH paths have enough attempts behind them', () => {
    /*
     * The gate is on both sides at once, and the path it protects is the newly
     * introduced one: `takingAway` arrives with almost no history, and a lean
     * computed from the sums data alone would force-feed a five-year-old a
     * brand-new kind of maths on the strength of no evidence about it at all.
     * Under the bar they are dealt at their TICK share, which is Joe's answer.
     */
    const a = mathsIsland(['sums:1', 'takingAway:1'])
    persist(a, 'sums', 1, 1, 20)
    persist(a, 'takingAway', 1, 0.2, 7)
    expect(pathShare(createHarness(a))).toEqual({ sums: 500, takingAway: 500 })

    a.takingAway.stages[1]!.attempts = 8
    expect(pathShare(createHarness(a))).toEqual({ sums: 350, takingAway: 650 })
  })

  it('ignores a gap that is only the noise in an ewma', () => {
    // .04 apart is two estimates saying the same thing. A lean that answered
    // it would be re-weighting a child's maths on a rounding difference.
    const a = mathsIsland(['sums:1', 'takingAway:1'])
    persist(a, 'sums', 1, 0.9, 20)
    persist(a, 'takingAway', 1, 0.86, 20)
    expect(pathShare(createHarness(a))).toEqual({ sums: 500, takingAway: 500 })
  })

  it('comes on gradually once the gap clears the dead zone', () => {
    // Nothing snaps: a gap a hair over the dead zone buys a hair of a lean.
    const a = mathsIsland(['sums:1', 'takingAway:1'])
    persist(a, 'sums', 1, 0.9, 20)
    persist(a, 'takingAway', 1, 0.84, 20)
    const share = pathShare(createHarness(a))
    expect(share.takingAway).toBeGreaterThan(share.sums as number)
    expect(share.takingAway).toBeLessThan(550)
  })

  it('lands on exactly 65/35 at a 1:1 tick baseline, the spec\'s own number', () => {
    /*
     * runA.md:236 says *"bounded 65/35"* and this is where that number is
     * kept: one rung ticked on each path, a gap wide enough to pull as hard as
     * the lean ever pulls, and the weaker path gets 65% of their maths. Read as
     * a bound on the STRENGTH of the lean (Fable's option C), the spec's
     * figure is the calibration of LEAN_MAX rather than a clamp on the share.
     */
    const a = mathsIsland(['sums:1', 'takingAway:1'])
    persist(a, 'sums', 1, 0.95, 20)
    persist(a, 'takingAway', 1, 0.55, 20)
    expect(pathShare(createHarness(a))).toEqual({ sums: 350, takingAway: 650 })
  })

  it('never inverts which path leads, at Joe\'s own 2:1 example', () => {
    /*
     * THE REASON THE LEAN IS A MULTIPLIER AND NOT A CLAMP. Joe's worked
     * example is two sum rungs to one subtraction rung, which he calls 2/3
     * sums. With subtraction the weaker path and the lean fully on it moves to
     * about .519/.481 — subtraction has bought nearly all the practice it
     * needed and the PARENT'S TICKS STILL LEAD. A 65/35 clamp would have
     * flipped his 2:1 into a 35/65 against him, which is an accuracy estimate
     * overruling a father.
     */
    const a = mathsIsland(['sums:1', 'sums:2', 'takingAway:1'])
    persist(a, 'sums', 1, 0.95, 20)
    persist(a, 'sums', 2, 0.95, 20)
    persist(a, 'takingAway', 1, 0.55, 20)
    const share = pathShare(createHarness(a))
    expect(share.sums).toBeGreaterThan(share.takingAway as number)
    about(share.sums, 519)
    about(share.takingAway, 481)
  })

  it('leans the other way just as hard, and still does not invert the ticks', () => {
    // Symmetry, and the same refusal: whichever path is behind gets the pull,
    // and whichever path has the ticks keeps the lead.
    const a = mathsIsland(['sums:1', 'takingAway:1', 'takingAway:2'])
    persist(a, 'sums', 1, 0.55, 20)
    persist(a, 'takingAway', 1, 0.95, 20)
    persist(a, 'takingAway', 2, 0.95, 20)
    const share = pathShare(createHarness(a))
    expect(share.takingAway).toBeGreaterThan(share.sums as number)
    about(share.sums, 481)
  })

  it('weights the estimate by attempts, so one answer cannot speak for a path', () => {
    /*
     * Twenty answers on the bottom rung and one on the rung above is mostly a
     * statement about the bottom rung. Flat across stages, a single unlucky
     * answer on a newly ticked stage would halve a path's estimate and swing
     * the whole of their maths at it.
     */
    const a = mathsIsland(['sums:1', 'sums:2', 'takingAway:1'])
    persist(a, 'sums', 1, 0.95, 40)
    persist(a, 'sums', 2, 0.15, 1)   // one bad answer on a brand-new rung
    persist(a, 'takingAway', 1, 0.9, 20)
    // The weighted mean is ~.93, near enough .9 to stay inside the dead zone.
    expect(pathShare(createHarness(a))).toEqual({ sums: 667, takingAway: 333 })
  })

  it('says nothing about a path with no answered stage at all', () => {
    // A gap measured against nothing is not a weakness. `takingAway` on the
    // evening JT-007 ticked it has a tickbox and no history whatsoever.
    const a = mathsIsland(['sums:1', 'takingAway:1'])
    persist(a, 'sums', 1, 1, 40)
    expect(a.takingAway.stages[1]!.ewma).toBeNull()
    expect(pathShare(createHarness(a))).toEqual({ sums: 500, takingAway: 500 })
  })

  it('reads persisted estimates only, never anything from this session', () => {
    /*
     * *"on persistent estimates only"* — runA.md:236, and it is a rule with
     * teeth: a rescue, a probe and an armed mercy run are all real in-session
     * facts, and none of them may move the share of maths. Only what is in the
     * save speaks here.
     */
    const a = mathsIsland(['sums:1', 'sums:2', 'takingAway:1'])
    persist(a, 'sums', 1, 0.9, 20)
    persist(a, 'sums', 2, 0.9, 20)
    persist(a, 'takingAway', 1, 0.9, 20)
    const h = createHarness(a)
    const before = pathShare(h)

    h.noteRescue('sums')
    h.dealt('sums', 2, true)
    for (let i = 0; i < 3; i++) h.recordAttempt(attempt({ correct: false }))
    expect(a.sums.stages[2]!.ewma).toBe(0.9)   // a probe moved no persisted stat

    expect(pathShare(h)).toEqual(before)
  })
})

describe('the mercy run — invisible, in-session, and silent', () => {
  /*
   * runA.md:236, *"invisible in-session mercy runs"*, under brief §19: wrong
   * answers cost them nothing. Nothing is announced, nothing is rendered, there
   * is no read for it on the interface at all, and the attempts they make
   * during one are recorded exactly as honestly as any others. They simply find
   * the next two questions on the bottom rung, and nobody tells them why. These
   * tests can only watch it through the deals, which is the point.
   */
  const struggling = (): { a: Att; h: H } => {
    const a = mathsIsland(['sums:1', 'sums:2'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    for (let i = 0; i < 3; i++) h.recordAttempt(attempt({ correct: false }))
    return { a, h }
  }

  it('drops to the bottom rung for two items after three wrong in a row', () => {
    const { h } = struggling()
    // A roll of .99 is the top of the pool and would deal sums 2 every time.
    expect(h.dealMaths(() => 0.99)).toEqual({ path: 'sums', stage: 1, probe: false })
    h.dealt('sums', 1)
    expect(h.dealMaths(() => 0.99)).toEqual({ path: 'sums', stage: 1, probe: false })
    h.dealt('sums', 1)
    expect(h.dealMaths(() => 0.99)).toEqual({ path: 'sums', stage: 2, probe: false })
  })

  it('spends the run on items actually dealt, not on rounds merely considered', () => {
    // `dealMaths` may be called without anything being put in front of them. A
    // run that drained itself on questions nobody asked is a mercy they never
    // received.
    const { h } = struggling()
    for (let i = 0; i < 20; i++) h.dealMaths(() => 0.99)
    expect(h.dealMaths(() => 0.99)?.stage).toBe(1)
  })

  it('is disarmed by a single right answer, because the trouble has passed', () => {
    const a = mathsIsland(['sums:1', 'sums:2'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    h.recordAttempt(attempt({ correct: false }))
    h.recordAttempt(attempt({ correct: false }))
    h.recordAttempt(attempt({ correct: true }))
    h.recordAttempt(attempt({ correct: false }))
    h.recordAttempt(attempt({ correct: false }))
    expect(h.dealMaths(() => 0.99)?.stage).toBe(2)
  })

  it('keeps the paths apart — one path\'s bad run is not the other\'s', () => {
    const a = mathsIsland(['sums:1', 'sums:2', 'takingAway:1', 'takingAway:2'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    for (let i = 0; i < 3; i++) h.recordAttempt(attempt({ correct: false }))
    const got = deals(h, 400)
    expect(got['sums:2']).toBeUndefined()
    expect(got['takingAway:2']).toBeGreaterThan(0)
  })

  it('CANNOT move the share of maths, which is what protects JT-010(1)', () => {
    /*
     * THE INVARIANT THE WHOLE RENORMALISATION EXISTS FOR. The control is a
     * SECOND harness over the very same attainment record: identical persisted
     * stats, no session state, therefore no mercy run. The stage mix differs —
     * that is the mercy — and the sum-versus-subtraction split is identical to
     * the last deal.
     */
    const a = mathsIsland(['sums:1', 'sums:2', 'takingAway:1'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    for (let i = 0; i < 3; i++) h.recordAttempt(attempt({ correct: false }))
    const control = createHarness(a)

    expect(pathShare(h, 600)).toEqual(pathShare(control, 600))
    expect(deals(h, 600)['sums:2']).toBeUndefined()
    expect(deals(control, 600)['sums:2']).toBeGreaterThan(0)
  })

  it('silences the probe on that path, and spends no roll doing it', () => {
    /*
     * The run exists because three answers in a row went wrong. Answering that
     * by slipping them a question from the rung ABOVE would be the island
     * making a bad ten minutes worse. The counter is fed here by wrong PROBES,
     * which move no persisted stat — so `sums` 1 is still comfortable and a
     * probe is still wanted, and it is the mercy alone that stops it.
     */
    const it = island()
    masterSums1(it)
    expect(it.h.probeWanted('sums')).toBe(true)
    it.h.dealt('sums', 2, true)
    for (let i = 0; i < 3; i++) it.h.recordAttempt(attempt({ correct: false }))

    let drawn = 0
    const counted = () => { drawn++; return 0 }
    expect(it.h.dealMaths(counted)).toEqual({ path: 'sums', stage: 1, probe: false })
    expect(drawn).toBe(1)
  })

  it('records their attempts as honestly during a run as outside one', () => {
    // Brief §19 cuts both ways: the kindness is in what they are DEALT, never
    // in what is written down. A mercy that quietly stopped counting would be
    // a measurement system lying to the parent who reads it.
    const a = mathsIsland(['sums:1', 'sums:2'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    for (let i = 0; i < 3; i++) h.recordAttempt(attempt({ correct: false }))
    expect(a.sums.stages[2]!.attempts).toBe(3)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    expect(a.sums.stages[1]!.attempts).toBe(1)
  })

  it('writes nothing of itself into the attainment', () => {
    // A run of three wrong answers is a bad ten minutes, not a capability. In
    // the save it would follow them into every session afterwards.
    const a = mathsIsland(['sums:1', 'sums:2'])
    const h = createHarness(a)
    h.dealt('sums', 2)
    h.recordAttempt(attempt({ correct: false }))
    const was = JSON.parse(JSON.stringify(a))
    h.recordAttempt(attempt({ correct: false }))
    h.recordAttempt(attempt({ correct: false }))
    h.dealMaths(() => 0.99)
    h.dealt('sums', 1)
    const after = JSON.parse(JSON.stringify(a))
    // The two further attempts are the ONLY difference: no run, no counter.
    was.sums.stages[2].attempts = after.sums.stages[2].attempts
    was.sums.stages[2].ewma = after.sums.stages[2].ewma
    was.sums.stages[2].sessions = after.sums.stages[2].sessions
    expect(after).toEqual(was)
  })
})

describe('whisper retirement — mastered, superseded, and quietly awake', () => {
  /*
   * runA.md:237: *"whisper retirement (1–2 items per session from mastered
   * stages, feeding the settled-✓ that can quietly wake)."* A stage they have
   * mastered and moved past is not deleted and not unticked; it drops to the
   * occasional item, and then to none for the rest of the sitting.
   */
  const settled = (): Island => {
    const it = island()
    masterSums1(it)                        // 20 right across two days: solid
    it.a.sums.stages[2]!.ticked = true     // and now superseded
    it.on('2026-07-03')
    return it
  }

  it('is mastered AND superseded, never merely mastered', () => {
    /*
     * The top rung they are on can never be settled, however well they are
     * doing — it is the work. Retiring it would leave a child who had just got
     * good at something being dealt anything but that.
     */
    const it = island()
    masterSums1(it)
    expect(it.h.settledStages('sums')).toEqual([])   // solid, but still the top
    it.a.sums.stages[2]!.ticked = true
    expect(it.h.settledStages('sums')).toEqual([1])
  })

  it('says nothing about a path with no ticks or no mastery', () => {
    const it = settled()
    expect(it.h.settledStages('takingAway')).toEqual([])
    expect(it.h.settledStages('reading')).toEqual([])
  })

  it('drops a settled stage to a whisper — one item in six, not none', () => {
    // Retirement is not deletion. They still meet it, occasionally, and it is
    // still theirs.
    const got = deals(settled().h, 600)
    about(got['sums:1'], 100)
    about(got['sums:2'], 500)
  })

  it('stops after two whispers a session, and that is the retirement', () => {
    const it = settled()
    it.h.dealt('sums', 1)
    it.h.dealt('sums', 1)
    expect(deals(it.h, 600)).toEqual({ 'sums:2': 600 })
  })

  it('counts only the items they were actually dealt on the settled stage', () => {
    const it = settled()
    it.h.dealt('sums', 2)          // the live rung is not a whisper
    it.h.dealt('sums', 2, true)
    it.h.dealt('sums', 1)          // one whisper spent, one still to come
    about(deals(it.h, 600)['sums:1'], 100)
  })

  it('gives the budget back with the session, because it was never in the save', () => {
    const it = settled()
    const before = JSON.stringify(it.a)
    it.h.dealt('sums', 1)
    it.h.dealt('sums', 1)
    expect(JSON.stringify(it.a)).toBe(before)
    // Tomorrow is a new harness over the same record, and they meet it again.
    about(deals(createHarness(it.a), 600)['sums:1'], 100)
  })

  it('CANNOT move the share of maths either — the same renormalisation', () => {
    /*
     * Both ends of the retirement, measured against the tick share Joe ruled
     * for: two sum rungs to one subtraction rung is 2/3 sums, whether sums 1 is
     * whispering or retired for the rest of the sitting.
     */
    const it = settled()
    it.a.takingAway.stages[1]!.ticked = true
    const whispering = pathShare(it.h, 600)
    it.h.dealt('sums', 1)
    it.h.dealt('sums', 1)
    const retired = pathShare(it.h, 600)
    expect(retired).toEqual(whispering)
    about(whispering.sums, 400)
    about(whispering.takingAway, 200)
  })

  it('never deals them nothing, whatever the weights have done', () => {
    // A defensive guarantee rather than a reachable state — the top rung is
    // never settled, so something on the path always carries weight. It is
    // asserted anyway because the failure it guards against is a child tapping
    // a plot and finding no question there.
    const it = settled()
    it.h.dealt('sums', 1)
    it.h.dealt('sums', 1)
    for (let i = 0; i < 200; i++) expect(it.h.dealMaths(() => i / 200)).not.toBeNull()
  })

  it('wakes quietly on a wrong answer, with nothing unticked and nothing lost', () => {
    /*
     * WHY NOTHING ABOUT `settled` IS PERSISTED. There is no flag to unset and
     * no demotion to reverse: a stage is settled because `solid` says so this
     * instant, so a wrong answer takes its ewma under the bar and it is simply
     * back in full rotation. That is the whole of *"can quietly wake"*, and it
     * is emergent rather than implemented. (Two wrong answers rather than one:
     * one lands the ewma on exactly .85, which is still solid.)
     */
    const it = settled()
    expect(it.h.settledStages('sums')).toEqual([1])
    it.h.dealt('sums', 1)
    it.h.recordAttempt(attempt({ correct: false }))
    it.h.recordAttempt(attempt({ correct: false }))

    expect(it.h.settledStages('sums')).toEqual([])
    expect(it.h.levelFor('sums')).toEqual([1, 2])           // nothing unticked
    expect(it.a.sums.stages[1]!.attempts).toBe(22)          // nothing lost
    expect(deals(it.h, 600)).toEqual({ 'sums:1': 300, 'sums:2': 300 })
  })
})

/* ------------------------------- the rung between: sums 3, teens plus units */

describe('the sums ladder is array order, not numeric order', () => {
  /*
   * `STAGES.sums` is [1, 3, 2]. The NUMBER is a generator id — 2 is the
   * bridging generator that `tools/golden/golden.json` is frozen against — and
   * the ARRAY POSITION is the rung. The new middle rung had to be numbered 3
   * because renumbering it 2 would have changed what the second rung
   * generates. So every read of "the next rung", "the top rung" and "below the
   * top rung" has to walk the array, and these tests are what stops anyone
   * quietly tidying the table back into numeric order.
   */

  /** Sums-only, with every ticked rung already comfortable. */
  const ladder = (ticked: number[]): Att => {
    const a = createAttainment()
    for (const s of STAGES.sums) {
      const st = a.sums.stages[s]!
      st.ticked = ticked.includes(s)
      if (st.ticked) { st.ewma = 0.9; st.attempts = 20 }
    }
    return a
  }

  /**
   * The rung the harness would probe next, read through the only door there
   * is: `dealMaths` swaps the stage for `nextStage` on the one round in eight.
   * Null when there is nothing above to ask about.
   */
  const rungAbove = (a: Att): number | null => {
    const got = createHarness(a).dealMaths(rolls(0, 0.1))
    return got?.probe ? got.stage : null
  }

  it('offers 3 above rung one, because 3 is the rung and 2 is a generator id', () => {
    expect(rungAbove(ladder([1]))).toBe(3)
  })

  it('offers whole tens above teens-plus-units, since the 4/5 swap', () => {
    /* Rungs 4 and 5 were swapped on 4 August (Joe: "switch rung 4 and 5"), so
     * the rung above teens-plus-units is now whole tens rather than bridging. */
    expect(rungAbove(ladder([1, 3]))).toBe(5)
  })

  it('offers two-digit work above bridging, which is no longer the top', () => {
    /* Bridging WAS the last position; rungs were added above it on 4 August, so
     * a child who has earned it has somewhere to go. After the 4/5 swap the rung
     * above bridging is 6 — two-digit plus units — and whole tens sits below it.
     *
     * A child who earned bridging under the OLD order therefore skips whole
     * tens, which is the right way round: she already has the harder skill. */
    expect(rungAbove(ladder([1, 3, 2]))).toBe(6)
  })

  it('offers nothing above the last rung in the array', () => {
    expect(rungAbove(ladder([...STAGES.sums]))).toBeNull()
  })

  it('reads the ticked rungs back in ladder order, never sorted', () => {
    expect(createHarness(ladder([1, 3, 2])).levelFor('sums')).toEqual([1, 3, 2])
    expect(createHarness(ladder([1, 2])).levelFor('sums')).toEqual([1, 2])
  })

  it('labels the new rung in words a parent can act on', () => {
    expect(stageLabel('sums', 3)).toBe('teens plus units')
  })

  it('does not start it ticked — a new rung is nobody’s until it is earned', () => {
    const a = createAttainment()
    expect(a.sums.stages[3]?.ticked).toBe(false)
    expect(createHarness(a).levelFor('sums')).toEqual([1])
  })
})

describe('a child already on the bridging rung is never moved down to 3', () => {
  /*
   * THE MIGRATION CASE, and the one that would actually hurt. A child who has
   * been ticked on `sums` 1 and 2 for weeks wakes up on a build where a rung
   * has been inserted BELOW their top one. Auto may only ever tick
   * (runA.md:240) and inserting a rung is not an exception to that: they are
   * not demoted, they are not offered the easier rung as though it were
   * progress, and they are not dealt it behind their back.
   */
  const settledChild = (): Island => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true   // takes the intro offer off the table
    it.a.sums.stages[2]!.ticked = true         // ticked on 1 and 2, NOT on 3
    masterSums1(it)
    it.on('2026-07-03')
    return it
  }

  it('keeps their top rung at 2 with 3 left untouched', () => {
    const it = settledChild()
    expect(it.h.levelFor('sums')).toEqual([1, 2])
    expect(it.a.sums.stages[3]!.ticked).toBe(false)
    expect(it.a.sums.stages[3]!.attempts).toBe(0)
  })

  it('offers them nothing, because there is no rung above the one they are on', () => {
    const it = settledChild()
    expect(it.h.pendingOffer()).toBeNull()
    expect(it.h.offerDue('sums')).toBe(false)
    expect(it.h.probeWanted('sums')).toBe(false)
  })

  it('never deals them the rung they skipped, over a whole sweep', () => {
    const it = settledChild()
    const got = deals(it.h, 600)
    expect(got['sums:3']).toBeUndefined()
    expect(it.h.levelFor('sums')).toEqual([1, 2])
  })
})

describe('settledOn is BELOW in ladder order — the latent comparison', () => {
  /*
   * `settledOn` filtered `s < top`, comparing generator IDS, while `topTicked`
   * and `nextStage` have always walked the array. The two agreed for as long as
   * every ladder happened to be numbered in its own order, and stopped agreeing
   * the moment `STAGES.sums` became [1, 3, 2]: a child ticked on all three has
   * top = 2, and rung 3 — one place BELOW them — would compare 3 < 2 and never
   * retire. They would be dealt the middle rung at full weight forever.
   */
  const allThree = (): Island => {
    const it = island()
    for (const stage of [1, 3]) {
      it.h.dealt('sums', stage)
      for (const d of ['2026-07-01', '2026-07-02']) {
        it.on(d)
        for (let i = 0; i < 10; i++) it.h.recordAttempt(attempt({ correct: true }))
      }
    }
    it.a.sums.stages[3]!.ticked = true
    it.a.sums.stages[2]!.ticked = true
    it.on('2026-07-03')
    return it
  }

  it('settles rung 3 as well as rung 1, because both sit below the top', () => {
    const it = allThree()
    expect(it.h.levelFor('sums')).toEqual([1, 3, 2])
    expect(it.h.settledStages('sums')).toEqual([1, 3])
  })

  it('still never settles the top rung itself, whatever it is numbered', () => {
    const it = allThree()
    expect(it.h.settledStages('sums')).not.toContain(2)
  })

  it('drops the settled middle rung to a whisper instead of full weight', () => {
    // The behaviour the comparison actually buys: rung 3 is retired to the
    // occasional item rather than dealt as though it were live work.
    const it = allThree()
    const got = deals(it.h, 600)
    expect(got['sums:2']).toBeGreaterThan((got['sums:3'] ?? 0) * 2)
  })
})

describe('Juno’s own save survives the new rung arriving beneath them', () => {
  /*
   * Not a hand-built record: the attainment goes out through `toSave`, through
   * JSON, and back in through `fromSave` — the path a reload actually takes.
   * `readAttainment` rebuilds outward from `STAGES`, so a rung added to that
   * table is exactly the kind of change that could quietly drop a field or
   * reset a tick, and this is the test that would catch it.
   */
  const junoSaved = () => {
    const it = island()
    it.h.dealt('sums', 1)
    for (const d of ['2026-07-01', '2026-07-02']) {
      it.on(d)
      for (let i = 0; i < 9; i++) it.h.recordAttempt(attempt({ correct: true }))
      it.h.recordAttempt(attempt({ correct: false, latencyMs: 4000 }))
    }
    const before = JSON.parse(JSON.stringify(it.a.sums.stages[1])) as unknown
    const raw = JSON.parse(JSON.stringify(
      toSave(createFlow(), true, 'Juno', true, it.a)))
    return { before, loaded: fromSave(raw) }
  }

  it('brings their rung-one ticks, ewma, attempts and sessions back byte for byte', () => {
    const { before, loaded } = junoSaved()
    expect(loaded.attainment.sums.stages[1]).toEqual(before)
    expect(loaded.attainment.sums.stages[1]?.ticked).toBe(true)
    expect(loaded.attainment.sums.stages[1]?.attempts).toBe(20)
    expect(loaded.attainment.sums.stages[1]?.sessions).toHaveLength(2)
  })

  it('gives them the new rung fresh and unticked, not backdated', () => {
    const { loaded } = junoSaved()
    expect(loaded.attainment.sums.stages[3]).toEqual({
      ticked: false, attempts: 0, ewma: null,
      latencies: [], early: [], sessions: [], rescues: [], probes: [],
    })
  })

  it('leaves them being dealt exactly what they were being dealt', () => {
    const { loaded } = junoSaved()
    expect(createHarness(loaded.attainment).levelFor('sums')).toEqual([1])
  })
})
