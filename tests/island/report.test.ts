/**
 * A6 — the grown-ups report, the pure half.
 *
 * These tests drive the computation directly: a `StageStats` in, a
 * `StageReport` out. There is no panel here and there deliberately cannot be
 * one, because what is being pinned is not how the dots are drawn but what a
 * parent is TOLD about his daughter — the boundaries, the honesty gates, and
 * the one arithmetic decision (median, never mean) that keeps a butterfly
 * walking past the screen from reading as a child who has got slower.
 *
 * The threshold numbers are written out as literals rather than read back from
 * balance.json. Reading them back would make the suite agree with whatever the
 * file said and prove nothing; these pin the shipped values, and retuning the
 * data file is meant to be a decision loud enough to change a test.
 */
import { describe, it, expect } from 'vitest'
import {
  stageReport, autoWouldDo, TIER_WORDS,
} from '../../src/island/report'
import { LIVE_PATHS, createAttainment, createHarness } from '../../src/island/harness'
import type { StageStats } from '../../src/island/harness'
import type { AttemptEvent } from '../../src/island/attempts'
import { dayKey } from '../../src/platform/clock'

/** A stage with nothing on it, so a test states only what it varies. */
const stage = (over: Partial<StageStats> = {}): StageStats => ({
  ticked: true, attempts: 0, ewma: null,
  latencies: [], early: [], sessions: [], rescues: [], probes: [], ...over,
})

/** Noon local on a given day — far enough from both boundaries to be stable. */
const noon = (y: number, m: number, d: number): number =>
  new Date(y, m - 1, d, 12).getTime()

/** The `YYYY-MM-DD` the island would write for that day, in this machine's zone. */
const day = (y: number, m: number, d: number): string => dayKey(noon(y, m, d))

/** Enough attempts for accuracy to be willing to speak. */
const graded = (ewma: number): StageStats => stage({ attempts: 20, ewma })

/** Ten early latencies, so speed is past its sample floor. */
const tenEarly = (ms: number): number[] => Array<number>(10).fill(ms)

describe('the tier words and their dots', () => {
  it('says the three soft words the spec asks for', () => {
    // settling · steady · solid. Not good/better/best: a parent reads a scale
    // as a grade, and settling has to be a fine thing for a child to be.
    expect(TIER_WORDS).toEqual({
      settling: 'settling', steady: 'steady', solid: 'solid',
    })
  })

  it('fills one dot, two dots, three dots', () => {
    expect(stageReport(graded(0.5)).accuracy).toEqual({ tier: 'settling', filled: 1 })
    expect(stageReport(graded(0.8)).accuracy).toEqual({ tier: 'steady', filled: 2 })
    expect(stageReport(graded(0.9)).accuracy).toEqual({ tier: 'solid', filled: 3 })
  })

  it('fills no dots when it has nothing to say', () => {
    expect(stageReport(stage()).accuracy).toEqual({ tier: null, filled: 0 })
  })
})

describe('accuracy — the EWMA, banded', () => {
  it('reads settling just below .70', () => {
    expect(stageReport(graded(0.699)).accuracy.tier).toBe('settling')
  })

  it('reads steady exactly at .70, because the band is inclusive', () => {
    expect(stageReport(graded(0.70)).accuracy.tier).toBe('steady')
  })

  it('reads steady just below .85', () => {
    expect(stageReport(graded(0.849)).accuracy.tier).toBe('steady')
  })

  it('reads solid exactly at .85', () => {
    expect(stageReport(graded(0.85)).accuracy.tier).toBe('solid')
  })

  it('reads solid above .85', () => {
    expect(stageReport(graded(0.851)).accuracy.tier).toBe('solid')
  })

  it('shows dashes at 14 attempts and a tier at 15', () => {
    // Small-sample honesty: a tier drawn from fourteen attempts is a statement
    // about the sample, and the person reading it would take it as a statement
    // about a five-year-old.
    expect(stageReport(stage({ attempts: 14, ewma: 0.95 })).accuracy.tier).toBeNull()
    expect(stageReport(stage({ attempts: 15, ewma: 0.95 })).accuracy.tier).toBe('solid')
  })

  it('shows dashes when there is no estimate at all, however many attempts', () => {
    // A null EWMA means nothing has ever been answered here. Zero would be a
    // lie about that, and a lie in the pessimistic direction.
    expect(stageReport(stage({ attempts: 40, ewma: null })).accuracy.tier).toBeNull()
  })
})

describe('speed — the recent median against her own beginning', () => {
  it('reads settling while the gain is under 15%', () => {
    const s = stage({ early: tenEarly(1000), latencies: [900, 900, 900] })
    expect(stageReport(s).speed.tier).toBe('settling')
  })

  it('reads steady exactly at a 15% gain', () => {
    const s = stage({ early: tenEarly(1000), latencies: [850, 850, 850] })
    expect(stageReport(s).speed.tier).toBe('steady')
  })

  it('reads solid exactly at a 30% gain', () => {
    // 30% is the MECHANICAL CALL: the spec names only the 15% rung and a
    // three-tier scale needs two. It is in balance.json so it can be retuned.
    const s = stage({ early: tenEarly(1000), latencies: [700, 700, 700] })
    expect(stageReport(s).speed.tier).toBe('solid')
  })

  it('reads settling when she has got slower, rather than refusing to say', () => {
    const s = stage({ early: tenEarly(1000), latencies: [1400, 1400, 1400] })
    expect(stageReport(s).speed.tier).toBe('settling')
  })

  it('is not fooled by the butterfly gap — one enormous latency, median not mean', () => {
    /*
     * A child gets up mid-question, or a butterfly goes past, and one latency
     * comes back at four minutes. The mean of these five is 48,600ms — against
     * a 1000ms baseline that is a gain of MINUS forty-seven, and the panel
     * would tell a parent his daughter had got dramatically slower on a stage
     * she has in fact nearly halved. The median is 600 and does not notice.
     */
    const s = stage({ early: tenEarly(1000), latencies: [600, 600, 600, 600, 240_000] })
    expect(stageReport(s).speed.tier).toBe('solid')
  })

  it('takes the mean of the two middle values on an even-length array', () => {
    // Baseline: five 100s and five 300s, so median 200 (a value that appears
    // nowhere in the list). Recent: two 140s, median 140. Gain is exactly .30.
    const early = [100, 100, 100, 100, 100, 300, 300, 300, 300, 300]
    const s = stage({ early, latencies: [140, 140] })
    expect(stageReport(s).speed.tier).toBe('solid')
  })

  it('shows dashes at 9 early latencies and a tier at 10', () => {
    const nine = stage({ early: Array<number>(9).fill(1000), latencies: [500] })
    const ten = stage({ early: tenEarly(1000), latencies: [500] })
    expect(stageReport(nine).speed.tier).toBeNull()
    expect(stageReport(ten).speed.tier).toBe('solid')
  })

  it('shows dashes on a zero baseline, because a nonsense baseline is not a verdict', () => {
    // Latencies come off a save and a save is untrusted input. A zero baseline
    // makes the gain infinite, which would read as a child who has become
    // infinitely fast.
    const s = stage({ early: tenEarly(0), latencies: [500] })
    expect(stageReport(s).speed.tier).toBeNull()
  })

  it('shows dashes on a negative baseline too', () => {
    const s = stage({ early: tenEarly(-5), latencies: [500] })
    expect(stageReport(s).speed.tier).toBeNull()
  })

  it('shows dashes when there are early latencies but no recent ones', () => {
    expect(stageReport(stage({ early: tenEarly(1000) })).speed.tier).toBeNull()
  })
})

describe('consistency — is it holding up across days, unaided', () => {
  /** Three good sessions on three different days: the solid case. */
  const goodThree = () => [
    { date: day(2026, 7, 20), correct: 8, total: 10 },
    { date: day(2026, 7, 21), correct: 9, total: 10 },
    { date: day(2026, 7, 22), correct: 8, total: 10 },
  ]

  it('reads solid when all three conditions hold', () => {
    expect(stageReport(stage({ sessions: goodThree() })).consistency.tier).toBe('solid')
  })

  it('reads settling when one session in the window fell below .75', () => {
    const sessions = goodThree()
    sessions[1] = { date: day(2026, 7, 21), correct: 5, total: 10 }
    expect(stageReport(stage({ sessions })).consistency.tier).toBe('settling')
  })

  it('reads steady when a rescue landed inside the window', () => {
    // The work is there; the evidence that she did it unaided is not. That
    // middle rung is the MECHANICAL CALL — the spec defines consistency as one
    // boolean and this scale has three rungs.
    const s = stage({ sessions: goodThree(), rescues: [noon(2026, 7, 21)] })
    expect(stageReport(s).consistency.tier).toBe('steady')
  })

  it('reads steady when it all happened on one day', () => {
    // One lucky afternoon is not the same as something that survived a night's
    // sleep, and the report should not call it the same.
    const oneDay = goodThree().map(s => ({ ...s, date: day(2026, 7, 20) }))
    expect(stageReport(stage({ sessions: oneDay })).consistency.tier).toBe('steady')
  })

  it('is not spoiled by a rescue from before the window', () => {
    // The rescue ring holds ten and the window holds three days. An old rescue
    // that has not been pushed out yet must not follow her around.
    const s = stage({ sessions: goodThree(), rescues: [noon(2026, 7, 4)] })
    expect(stageReport(s).consistency.tier).toBe('solid')
  })

  it('is not spoiled by a rescue from after the window either', () => {
    const s = stage({ sessions: goodThree(), rescues: [noon(2026, 7, 26)] })
    expect(stageReport(s).consistency.tier).toBe('solid')
  })

  it('shows dashes at 2 sessions and a tier at 3', () => {
    const two = goodThree().slice(0, 2)
    expect(stageReport(stage({ sessions: two })).consistency.tier).toBeNull()
    expect(stageReport(stage({ sessions: goodThree() })).consistency.tier).toBe('solid')
  })

  it('looks at the LAST three sessions and not at an older bad one', () => {
    const sessions = [
      { date: day(2026, 7, 19), correct: 1, total: 10 },
      ...goodThree(),
    ]
    expect(stageReport(stage({ sessions })).consistency.tier).toBe('solid')
  })

  it('refuses a session with no attempts in it rather than dividing by zero', () => {
    const sessions = goodThree()
    sessions[2] = { date: day(2026, 7, 22), correct: 0, total: 0 }
    expect(stageReport(stage({ sessions })).consistency.tier).toBe('settling')
  })
})

describe('the plain facts beside the tiers', () => {
  it('passes the attempt count straight through', () => {
    expect(stageReport(stage({ attempts: 37 })).attempts).toBe(37)
  })

  it('reports the newest session as the last-active date', () => {
    const sessions = [
      { date: day(2026, 7, 20), correct: 3, total: 4 },
      { date: day(2026, 7, 23), correct: 3, total: 4 },
    ]
    expect(stageReport(stage({ sessions })).lastActive).toBe(day(2026, 7, 23))
  })

  it('reads a never-worked stage as all dashes and no date', () => {
    // The commonest row in a fresh save. Nothing is invented for work nobody
    // has watched.
    const r = stageReport(stage())
    expect(r.attempts).toBe(0)
    expect(r.lastActive).toBeNull()
    expect(r.accuracy).toEqual({ tier: null, filled: 0 })
    expect(r.speed).toEqual({ tier: null, filled: 0 })
    expect(r.consistency).toEqual({ tier: null, filled: 0 })
  })

  it('does not hand the same Measure object to two stages', () => {
    // The panel may hold or adapt these. A shared literal written through once
    // would corrupt every other stage's report at the same instant.
    const a = stageReport(stage())
    const b = stageReport(stage())
    expect(a.accuracy).not.toBe(b.accuracy)
    expect(a.accuracy).not.toBe(a.speed)
  })

  it('does not mutate the stats it was handed', () => {
    // The median sorts, and sorting in place would silently reorder the
    // latency ring that A5 persists.
    const s = stage({ early: tenEarly(1000), latencies: [900, 100, 500] })
    stageReport(s)
    expect(s.latencies).toEqual([900, 100, 500])
  })
})

/* ------------------------------------------------- B2: what Auto would do */

/**
 * A REAL harness on a clock a test can walk.
 *
 * Not a stub, and the difference matters more here than anywhere else in this
 * file: every branch of the line is an assertion that the island IS about to do
 * something, and a mocked `pendingOffer` would only prove that the sentence
 * quotes whatever it was handed. What is worth pinning is that the sentence and
 * the gate cannot come apart — so the states below are reached the way the game
 * reaches them, by answering questions and by accepting an offer.
 *
 * The clock is walkable because every Run B rule is a rule about DAYS: two
 * distinct ones for mastery, one offer a session, a honeymoon of two. Noon-ish
 * UTC on each, the convention `harness.test.ts` uses.
 */
const island = () => {
  const a = createAttainment()
  let today = '2026-07-01'
  const h = createHarness(a, () => Date.parse(`${today}T09:00:00Z`))
  return { a, h, on: (d: string) => { today = d } }
}

type Island = ReturnType<typeof island>

const rightAnswer = (): AttemptEvent => ({
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0,
})

/** Twenty right answers on sums 1, across the days given. The mastery half. */
const masterSums1 = (
  { h, on }: Island, days = ['2026-07-01', '2026-07-02'],
): void => {
  h.dealt('sums', 1)
  for (const d of days) {
    on(d)
    for (let i = 0; i < 10; i++) h.recordAttempt(rightAnswer())
  }
}

/**
 * Eight probes on the rung above sums 1 — which is stage 3, `teens plus
 * units`, and not stage 2: `STAGES.sums` is [1, 3, 2] and the ladder is array
 * order. Seven right, so past *"≥ .70 over ≥ 8"*.
 */
const probeNextSum = ({ h }: Island): void => {
  h.dealt('sums', 3, true)
  for (let i = 0; i < 8; i++) h.recordAttempt({ ...rightAnswer(), correct: i < 7 })
  h.dealt('sums', 1)
}

describe('what Auto would do', () => {
  it('reads "watching" for every live path on a fresh island', () => {
    // The commonest state there is, and the A6 word kept exactly as it was:
    // nothing about B landing may change what an island says on day one.
    const it = island()
    for (const path of LIVE_PATHS) expect(autoWouldDo(path, it.h, 'auto')).toBe('watching')
  })

  it('names the rung when a trickier offer is standing', () => {
    /*
     * takingAway 1 is ticked up front because its INTRODUCTION outranks a
     * trickier offer, and this test is about the other one.
     */
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')

    expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
    expect(autoWouldDo('sums', it.h, 'auto')).toBe('offering the next step (stage 3)')
  })

  it('calls taking away by its own name, because it is a different event', () => {
    // A whole new kind of maths is not "the next step", and a parent reading
    // the line is deciding whether to be in the room for it.
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')

    expect(it.h.pendingOffer()?.kind).toBe('takingAway')
    expect(autoWouldDo('takingAway', it.h, 'auto')).toBe('offering taking away')
  })

  it('does not let one path claim another path’s offer', () => {
    /*
     * The gate answers ONE offer island-wide, so `pendingOffer` is not null for
     * any of the four sections that ask it. Only the path it names may say so;
     * sums here reports its own probing and nothing about subtraction.
     */
    const it = island()
    masterSums1(it)
    it.on('2026-07-03')

    expect(it.h.pendingOffer()?.path).toBe('takingAway')
    expect(autoWouldDo('sums', it.h, 'auto'))
      .toBe('slipping in a harder question now and then')
    expect(autoWouldDo('reading', it.h, 'auto')).toBe('watching')
  })

  it('says she is being gone easy on for the sessions after a yes', () => {
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')
    it.h.noteOffer('sums', true)

    expect(it.a.sums.stages[3]!.ticked).toBe(true)
    expect(it.h.honeymoonActive('sums')).toBe(true)
    expect(autoWouldDo('sums', it.h, 'auto')).toBe('going easy after a yes')
  })

  it('keeps saying it after the path comes off Auto, because it is a promise made', () => {
    // The honeymoon outranks the mode deliberately. A parent taking the ticks
    // into his own hand does not un-say the two easy sessions she was given.
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')
    it.h.noteOffer('sums', true)

    expect(autoWouldDo('sums', it.h, 'manual')).toBe('going easy after a yes')
  })

  it('says it is slipping in harder questions once the rung below is comfortable', () => {
    // One day and ten answers: comfortable (ewma ≥ .75) and nowhere near the
    // gate, which is exactly the window probes exist to fill.
    const it = island()
    masterSums1(it, ['2026-07-01'])

    expect(it.h.pendingOffer()).toBeNull()
    expect(autoWouldDo('sums', it.h, 'auto'))
      .toBe('slipping in a harder question now and then')
  })

  it('says Auto is not driving a path a parent took over', () => {
    const it = island()
    expect(autoWouldDo('sums', it.h, 'manual'))
      .toBe('standing back while this path is on manual')
    expect(autoWouldDo('sums', it.h, 'hold'))
      .toBe('standing back while this path is on hold')
  })

  it('stands back rather than describing work the gate has already refused', () => {
    /*
     * JT-011(a): *"Manual persists, and Run B must skip it."* The harness
     * refuses probes and offers on a path off Auto, so a line that reported
     * them would be describing something that cannot happen — and the parent it
     * would mislead is the one who just said he was driving.
     */
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')
    it.h.setMode('sums', 'hold')

    expect(it.h.pendingOffer()).toBeNull()
    expect(it.h.probeWanted('sums')).toBe(false)
    expect(autoWouldDo('sums', it.h, 'hold'))
      .toBe('standing back while this path is on hold')
  })

  it('is in the register of the tier words: lower case, and no shouting', () => {
    /*
     * The line sits an inch from "settling · steady · solid" on the same page,
     * and it is read by someone deciding whether to trust the island with his
     * daughter's next step. A tripwire, because register is the kind of thing a
     * later edit breaks without noticing.
     */
    const it = island()
    it.a.takingAway.stages[1]!.ticked = true
    masterSums1(it)
    probeNextSum(it)
    it.on('2026-07-03')

    const lines = [
      ...LIVE_PATHS.map(p => autoWouldDo(p, it.h, 'auto')),
      autoWouldDo('sums', it.h, 'hold'),
      autoWouldDo('reading', it.h, 'manual'),
    ]
    for (const line of lines) {
      expect(line).toBe(line.toLowerCase())
      expect(line).not.toContain('!')
    }
  })
})
