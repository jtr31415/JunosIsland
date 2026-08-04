/**
 * B3's last piece: a month of days, walked, and the one promise that has to
 * survive all of them.
 *
 * `docs/pet-island-runA.md:239-240`, verbatim: *"refusal-inertness and ratchet
 * asserted in the month-walk. Nothing demotes, ever."* That sentence is the
 * whole of this file. The other three quarters of the slice — the 65/35
 * weakness lean, the invisible in-session mercy runs, the whisper retirement —
 * are stated as rules and tested as rules in `tests/island/harness.test.ts`,
 * and nothing here repeats them. What is left over is the part a rule cannot
 * state on its own: that thirty consecutive days of the rules ACTING TOGETHER
 * never take anything away from a child.
 *
 * WHY IT IS A WALK AND NOT MORE UNIT TESTS. `docs/HANDOFF.md:588-601` records
 * the class of fault this project actually ships: three in two days, all in one
 * seam, every one of them invisible to the unit tests on either side because
 * each side was individually correct and only their AGREEMENT was wrong. The
 * adaptive dials are exactly that shape again, and worse, because they are
 * coupled through TIME rather than through a function call — a mercy run arms
 * on Tuesday's answers, a whisper budget is a fact about one sitting, a decline
 * is honoured in days-they-played, a probe ring fills over a fortnight, and
 * `solid` is recomputed from scratch on every read. Every one of those is
 * correct in isolation. Only a walk can ask whether a child who lives inside
 * all of them at once ever loses ground.
 *
 * SO THIS FILE HAS EXACTLY ONE ASSERTION, applied about a hundred times: the
 * census of what the child may be dealt, and of what they have banked, is taken
 * at the end of every single day and compared with yesterday's. Nothing in it
 * may go backwards. Everything else below is the business of getting three
 * different children into states where that claim is worth something — a child
 * who says no to everything, a child having a terrible fortnight, and a child
 * who is getting good.
 *
 * `src/island/main.ts` cannot be imported (it boots a WebGL island), so the
 * loop this walk imitates is pinned by source text instead, the way
 * `offer.test.ts:35-36` pins its wiring. If the island's own deal loop ever
 * stops being the three lines below, this walk is measuring something the
 * island no longer does, and the pin says so.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAttainment, createHarness, STAGES, LIVE_PATHS, MATHS_PATHS,
} from '../../src/island/harness'
import type { Attainment, Harness, Offer, Path } from '../../src/island/harness'
import type { AttemptEvent } from '../../src/island/attempts'
import { dayKey } from '../../src/platform/clock'
import { mulberry32 } from '../../src/core/rng'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string): string => readFileSync(resolve(here, rel), 'utf8')

/** An attempt with everything switched off, so a test states only what it means. */
const attempt = (over: Partial<AttemptEvent> = {}): AttemptEvent => ({
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0, ...over,
})

/* ------------------------------------------------------------------ the pin */

describe('the loop this walk is a copy of', () => {
  it('deals, marks what was dealt, and records — main.ts\'s own three lines', () => {
    /*
     * A walk is only evidence about the island if it walks what the island
     * walks. These three calls, in this order, are the entire circuit between
     * the harness and a child: `dealMaths` chooses, `dealt` says it was really
     * put in front of them (which is where the mercy and whisper budgets are
     * spent), and `recordAttempt` says what they did with it. `playDay` below
     * does those three and nothing else.
     *
     * The fourth line is the offer's, and it is here for the same reason: the
     * refuser's walk answers offers through `noteOffer`, which is what the
     * island's own panel calls.
     */
    const main = read('../../src/island/main.ts')
    expect(main).toContain('const got = harness.dealMaths(defaultRng)')
    expect(main).toContain('harness.dealt(dealtSum.path, dealtSum.stage, dealtSum.probe)')
    expect(main).toContain('onAttempt: evt => { harness.recordAttempt(evt) }')
    expect(main).toContain('harness.noteOffer(due.path, accepted)')
  })
})

/* ------------------------------------------------------------------ the rig */

const DAY_MS = 86_400_000
/** A month, which is what the spec line calls this. */
const DAYS = 30
/** The whisper budget the spec caps a sitting at — runA.md:237. */
const WHISPERS_PER_SESSION = 2
/** Consecutive wrong answers that arm a mercy run, and how long it lasts. */
const MERCY_TRIGGER = 3
const MERCY_RUN = 2
/** The session ring's depth in `harness.ts`. A day may only leave it by rolling. */
const SESSION_KEEP = 6

/**
 * NOON LOCAL, and a fixed one.
 *
 * `clock.ts:82-88` gives the reason in its own words: noon is far enough from
 * both boundaries that no daylight-saving shift can reach it, so day N of this
 * walk is always the calendar day after day N-1 however the clocks behave in
 * the middle of it. A walk whose thirty days occasionally turned out to be
 * twenty-nine would fail somewhere subtle and once a year.
 */
const DAY_ZERO = new Date(2026, 6, 1, 12, 0, 0, 0).getTime()

/**
 * THE MERCY RUN, RECONSTRUCTED FROM OUTSIDE THE HARNESS.
 *
 * A run is deliberately invisible: it is not persisted, not announced and not
 * readable anywhere on the interface (`harness.ts:620-638`), so a walk that
 * needs to know whether one is live has to count the same thing the harness
 * counts — three wrong in a row on a path, spent over the next two items they
 * are actually dealt. Mirroring the rule rather than exposing it keeps the
 * invisibility intact, and the mirror is checked against the real thing by the
 * struggler's walk, which asserts what the run actually deals them.
 *
 * IT IS NEEDED FOR THE WHISPER COUNT, and this is the trap it exists to avoid:
 * a mercy run puts them on the bottom rung, that rung may well be a settled
 * one, and `harness.ts:1013-1021` is explicit that a mercy item is NOT a
 * whisper — *"the run put them there, so charging the whisper budget for it
 * would retire a stage they were sent to for comfort."* A count that could not
 * tell them apart would report whispers on a day that had none, and would pass
 * the *"1–2 per session"* cap by measuring the wrong thing.
 */
const mercyShadow = () => {
  const wrong = new Map<Path, number>()
  const left = new Map<Path, number>()
  return {
    /** Is a run live on this path, as `dealMaths` reads it? */
    live: (p: Path): boolean => (left.get(p) ?? 0) > 0,
    /** An item was actually put in front of them: `dealt` spends the run here. */
    spend: (p: Path): void => {
      const n = left.get(p) ?? 0
      if (n > 0) left.set(p, n - 1)
    },
    /** They answered. True if THIS answer armed a run. */
    answered: (p: Path, correct: boolean): boolean => {
      if (correct) { wrong.set(p, 0); return false }
      const n = (wrong.get(p) ?? 0) + 1
      wrong.set(p, n < MERCY_TRIGGER ? n : 0)
      if (n < MERCY_TRIGGER) return false
      left.set(p, MERCY_RUN)
      return true
    },
  }
}

/**
 * An island with a calendar a test can walk, day by day, without waiting.
 *
 * The same mechanism `harness.test.ts:389-394` uses and no second one: the
 * harness is handed a `now` the test owns, and the day key comes out of the
 * platform clock exactly as it does in production. Nothing is stubbed, patched
 * or faked at module level.
 */
const walk = (seed: number) => {
  const a = createAttainment()
  let day = 0
  const at = (): number => DAY_ZERO + day * DAY_MS
  return {
    a,
    h: createHarness(a, at),
    roll: mulberry32(seed),
    mercy: mercyShadow(),
    today: (): string => dayKey(at()),
    advance: (): void => { day += 1 },
  }
}
type Walk = ReturnType<typeof walk>

/** One item, as it was chosen, and what they did with it. */
interface Dealt {
  path: Path
  stage: number
  probe: boolean
  correct: boolean
  /** Was this rung SETTLED at the moment it was chosen? */
  settled: boolean
  /** Was a mercy run live when it was chosen? Then it is not a whisper. */
  mercy: boolean
  /** A settled rung met of their own accord: the whisper the budget counts. */
  whisper: boolean
  /** Did THIS answer arm a mercy run? */
  armed: boolean
}

/**
 * A realistic sitting: `items` maths questions, dealt and answered.
 *
 * `accuracy` is the chance they get one right, drawn from the same seeded
 * stream as the deal — so a walk is one deterministic sequence end to end and
 * a failure on day nineteen is a failure on day nineteen tomorrow as well.
 *
 * THEY ARE NEVER DEALT NOTHING. The assertion sits here rather than in a test
 * of its own because it has to hold on every item of every day of every walk:
 * `harness.ts:830` promises it, and the failure it guards against is a child
 * tapping a plot and finding no question there.
 */
const playDay = (w: Walk, items: number, accuracy: number): Dealt[] => {
  const out: Dealt[] = []
  for (let i = 0; i < items; i++) {
    const got = w.h.dealMaths(w.roll)
    expect(got, `nothing to deal on ${w.today()}`).not.toBeNull()
    if (got === null) continue
    const settled = w.h.settledStages(got.path).includes(got.stage)
    const mercy = w.mercy.live(got.path)
    w.h.dealt(got.path, got.stage, got.probe)
    w.mercy.spend(got.path)
    const correct = w.roll() < accuracy
    w.h.recordAttempt(attempt({
      correct, latencyMs: 1500 + Math.floor(w.roll() * 2000),
    }))
    const armed = w.mercy.answered(got.path, correct)
    out.push({ ...got, correct, settled, mercy, whisper: settled && !mercy, armed })
  }
  return out
}

/** Deals over a deterministic sweep of [0,1), tallied. Measures a SPLIT, not an rng. */
const deals = (h: Harness, N = 600): Record<string, number> => {
  const tally: Record<string, number> = {}
  for (let i = 0; i < N; i++) {
    const got = h.dealMaths(() => i / N)
    const key = got ? got.path + ':' + got.stage : 'none'
    tally[key] = (tally[key] ?? 0) + 1
  }
  return tally
}

/** The same sweep, collapsed to the only thing JT-010(1) is about. */
const pathShare = (h: Harness, N = 600): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const p of MATHS_PATHS) out[p] = 0
  for (const [key, n] of Object.entries(deals(h, N))) {
    const path = key.split(':')[0] as string
    out[path] = (out[path] ?? 0) + n
  }
  return out
}

/* ------------------------------------------------------- the one assertion */

/** Everything known about one rung at the close of one day. */
interface Census {
  ticked: boolean
  attempts: number
  /** Ring lengths. Every one of them is push-and-trim, so none may shrink. */
  sessions: number
  latencies: number
  early: number
  probes: number
  rescues: number
  /** The banked day-records themselves, by date. */
  days: Record<string, { correct: number; total: number }>
}

/**
 * The full tick structure and the evidence standing behind it, flattened.
 *
 * Built from the STAGE TABLE outward rather than from the record's own keys,
 * for the reason `harness.ts:392-399` gives about saves: a census that read the
 * object's keys would report a vanished stage as "no change" instead of as the
 * demotion it is. The key set is asserted below, so a stage that disappears
 * fails loudly.
 */
const censusOf = (a: Attainment): Record<string, Census> => {
  const out: Record<string, Census> = {}
  for (const p of LIVE_PATHS) {
    for (const s of STAGES[p]) {
      const st = a[p].stages[s]!
      const days: Record<string, { correct: number; total: number }> = {}
      for (const rec of st.sessions) days[rec.date] = { correct: rec.correct, total: rec.total }
      out[`${p}:${s}`] = {
        ticked: st.ticked,
        attempts: st.attempts,
        sessions: st.sessions.length,
        latencies: st.latencies.length,
        early: st.early.length,
        probes: st.probes.length,
        rescues: st.rescues.length,
        days,
      }
    }
  }
  return out
}

/** The ticked rungs, as keys, in table order. The set that may never shrink. */
const tickedKeys = (a: Attainment): string[] =>
  Object.entries(censusOf(a)).filter(([, c]) => c.ticked).map(([k]) => k)

/** `levelFor` for all four paths, read through the harness rather than the record. */
const levelsOf = (h: Harness): Record<string, number[]> => {
  const out: Record<string, number[]> = {}
  for (const p of LIVE_PATHS) out[p] = h.levelFor(p)
  return out
}

/**
 * The record with the MEASUREMENT taken out of it: mode, ticks, offer
 * bookkeeping, honeymoon. What they have been ALLOWED, as opposed to what they
 * have done.
 *
 * Used wherever a test needs to say "nothing but honest attempt records
 * changed": snapshot this, do the thing, snapshot again, compare. Anything the
 * harness writes that is not a record of an answer shows up here.
 */
const shapeOf = (a: Attainment): string => JSON.stringify(LIVE_PATHS.map(p => ({
  path: p,
  mode: a[p].mode,
  honeymoonFrom: a[p].honeymoonFrom,
  offer: a[p].offer,
  stages: STAGES[p].map(s => ({ stage: s, ticked: a[p].stages[s]!.ticked })),
})))

/**
 * NOTHING DEMOTES, EVER — runA.md:240, as one function.
 *
 * Called at the end of every day of every walk. It is deliberately the only
 * place this claim is written down: a dozen scattered assertions about ticks
 * would each be true of the day they were written on, and this one is true of
 * all thirty at once, in three different lives, against whatever the dials did
 * in between.
 *
 * WHAT COUNTS AS GOING BACKWARDS, in the order they are checked:
 *
 *   - a rung that existed stops existing;
 *   - a tick that was on goes off (Auto may only ever tick — runA.md:240);
 *   - `attempts` falls, or a ring shortens — they cannot un-answer a question;
 *   - a day already banked is revised DOWN, or disappears from the session ring
 *     while that ring is not yet full. The ring is six deep by design, so a day
 *     leaving a FULL ring is the documented cap and not a loss.
 */
const assertNoDemotion = (
  before: Record<string, Census>, after: Record<string, Census>, when: string,
): void => {
  expect(Object.keys(after), `a rung vanished on ${when}`).toEqual(Object.keys(before))
  for (const key of Object.keys(before)) {
    const b = before[key]!
    const a = after[key]!
    if (b.ticked) expect(a.ticked, `${key} was unticked on ${when}`).toBe(true)
    expect(a.attempts, `${key} lost attempts on ${when}`).toBeGreaterThanOrEqual(b.attempts)
    expect(a.sessions, `${key} lost sessions on ${when}`).toBeGreaterThanOrEqual(b.sessions)
    expect(a.latencies, `${key} lost latencies on ${when}`).toBeGreaterThanOrEqual(b.latencies)
    expect(a.early, `${key} lost its baseline on ${when}`).toBeGreaterThanOrEqual(b.early)
    expect(a.probes, `${key} lost probes on ${when}`).toBeGreaterThanOrEqual(b.probes)
    expect(a.rescues, `${key} lost rescues on ${when}`).toBeGreaterThanOrEqual(b.rescues)
    for (const [date, was] of Object.entries(b.days)) {
      const now = a.days[date]
      if (now === undefined) {
        expect(a.sessions, `${key} dropped ${date} from a ring that was not full`)
          .toBe(SESSION_KEEP)
        continue
      }
      expect(now.total, `${key} unbanked answers on ${date}`)
        .toBeGreaterThanOrEqual(was.total)
      expect(now.correct, `${key} unbanked a right answer on ${date}`)
        .toBeGreaterThanOrEqual(was.correct)
    }
  }
}

/** `levelFor` is monotone too: a path's ticked list may grow, never shrink. */
const assertLevelsHeld = (
  before: Record<string, number[]>, after: Record<string, number[]>, when: string,
): void => {
  for (const p of LIVE_PATHS) {
    for (const stage of before[p] ?? []) {
      expect(after[p], `levelFor(${p}) dropped ${stage} on ${when}`).toContain(stage)
    }
    expect((after[p] ?? []).length).toBeGreaterThanOrEqual((before[p] ?? []).length)
  }
}

interface MarchOpts {
  days?: number
  items: number
  accuracy: number
  /** What they say when the island puts an offer to them. Never asked, if absent. */
  offer?: (due: Offer, day: number) => void
  onItem?: (got: Dealt) => void
  onDay?: (day: number, dealt: Dealt[]) => void
}

/**
 * The walk itself: `days` sittings, and the census compared across every one.
 *
 * The offer is put once a sitting AFTER the day's questions, which is the order
 * the island produces: `pendingOffer` is consulted at a moment in the flow that
 * a child has already been playing through, and the days-they-played counter
 * that governs the cooldown is bumped by `recordAttempt`.
 */
const march = (w: Walk, o: MarchOpts): void => {
  let census = censusOf(w.a)
  let levels = levelsOf(w.h)
  for (let day = 0; day < (o.days ?? DAYS); day++) {
    const dealt = playDay(w, o.items, o.accuracy)
    for (const got of dealt) o.onItem?.(got)
    if (o.offer) {
      const due = w.h.pendingOffer()
      if (due) o.offer(due, day)
    }
    o.onDay?.(day, dealt)

    const when = `day ${day} (${w.today()})`
    const now = censusOf(w.a)
    assertNoDemotion(census, now, when)
    census = now
    const levelsNow = levelsOf(w.h)
    assertLevelsHeld(levels, levelsNow, when)
    levels = levelsNow
    w.advance()
  }
}

/* --------------------------------------------------------------- the walks */

describe('the refuser — a month of saying no, and nothing is taken away', () => {
  it('is offered things all month, declines every one, and loses nothing at all', () => {
    /*
     * REFUSAL-INERTNESS, which is the half of runA.md:239 that protects a
     * child's answer from the island. `noteOffer(path, false)` is documented as
     * costing nothing beyond two sessions of quiet (harness.ts:1219-1226), and
     * the danger in a rule like that is not the line that implements it — it is
     * that fourteen refusals over a month might, between them, hold their ewma
     * still while a probe ring fills and a `solid` read flickers, and quietly
     * leave them somewhere worse than they started.
     *
     * So this asserts the decline THIRTEEN OR SO TIMES OVER, once per offer,
     * against the whole record each time: the entire attainment is cloned, the
     * decline is taken, and the clone is compared field for field with only the
     * declining path's offer block set aside. Anything a refusal touches
     * anywhere else in the record — a tick, a stat, another path's cadence —
     * fails immediately.
     */
    const w = walk(0x11117501)
    const opening = tickedKeys(w.a)
    const kinds = new Set<string>()
    const lastAsked = new Map<Path, number>()
    const gaps: number[] = []
    let declines = 0

    march(w, {
      items: 8,
      accuracy: 0.95,
      offer: (due, day) => {
        kinds.add(due.kind)
        const prev = lastAsked.get(due.path)
        if (prev !== undefined) gaps.push(day - prev)
        lastAsked.set(due.path, day)
        const before = JSON.parse(JSON.stringify(w.a))
        w.h.noteOffer(due.path, false)
        declines += 1

        const after = JSON.parse(JSON.stringify(w.a))
        after[due.path].offer = before[due.path].offer
        expect(after, `declining ${due.kind} moved something on ${w.today()}`)
          .toEqual(before)

        /*
         * And the cooldown is EXACTLY the documented one — the two sessions of
         * runA.md:231 and not a day more. A decline that quietly widened its own
         * penalty would still pass the comparison above.
         */
        expect(w.a[due.path].offer).toEqual({
          lastOfferDay: w.today(),
          declinedDay: w.today(),
          daysSinceDecline: 0,
          lastCountedDay: w.today(),
        })
      },
    })

    /*
     * The walk has to have been worth walking. A month that happened to offer
     * them nothing would pass every assertion above by doing nothing at all,
     * and that is precisely the dead test this repo has shipped four of.
     */
    expect(declines).toBeGreaterThanOrEqual(8)
    expect(kinds).toContain('takingAway')
    expect(kinds).toContain('trickier')

    /*
     * AND THE COOLDOWN IS TWO SESSIONS, measured in the only way a walk can
     * measure it: the days between the island asking the same thing twice. They
     * played every day of this month, so a session is a day.
     *
     * The SHORTEST gap is the assertion, not every gap: a path that was ready
     * to ask again can still be kept waiting a day by the other one, because
     * only one offer may be made in a sitting (harness.ts:1143-1149). Two is
     * the floor, and a floor of one would be an island that answered a refusal
     * by asking again tomorrow.
     */
    expect(Math.min(...gaps), 'the island came back too soon').toBe(2)
    expect(gaps.every(g => g >= 2)).toBe(true)
    expect(w.a.sums.stages[1]!.attempts).toBeGreaterThan(150)

    /*
     * And the whole point, stated at the end: after a month of refusing, they
     * are exactly where they started. Not diminished — the ticked set is
     * identical, not merely a superset — because Auto ticks only what they say
     * yes to, and they said yes to nothing.
     */
    expect(tickedKeys(w.a)).toEqual(opening)
    expect(w.h.levelFor('sums')).toEqual([1])
    expect(w.h.levelFor('takingAway')).toEqual([])
    expect(w.h.levelFor('reading')).toEqual([1])
    expect(w.h.levelFor('building')).toEqual([1])
  })
})

describe('the struggler — a bad fortnight, and the ratchet holds', () => {
  it('answers mostly wrong for a month and is demoted from nothing', () => {
    /*
     * THE RATCHET, the other half of runA.md:239-240. Their estimate falls
     * through the floor, mercy runs arm over and over, and not one rung comes
     * off: `setTicked` is the only writer of a tick and Auto only ever calls it
     * with `true` (runA.md:240). What a walk adds to that reading is the
     * accumulation — sixty wrong answers, a dozen armed runs and a session ring
     * that rolls over twice, none of which any single-rule test puts together.
     *
     * The second sum rung and subtraction are opened by a PARENT'S HAND before
     * the child starts, which is how they would really arrive (JT-007 is Joe
     * ticking `takingAway` himself). Without a rung above the bottom there is
     * nothing for a demotion to be visible against.
     */
    const w = walk(0x57a06611)
    expect(w.h.setTicked('sums', 2, true)).toBe(true)
    expect(w.h.setTicked('takingAway', 1, true)).toBe(true)
    const opening = tickedKeys(w.a)

    let mercies = 0
    let inspected = false
    /** Stage-1 attempts when the FIRST mercy armed. See the end of the walk. */
    let mercyLow = Infinity
    let watching: { shape: string; attempts: number; left: number } | null = null

    march(w, {
      items: 10,
      accuracy: 0.3,
      onItem: got => {
        /*
         * The two mercy items, watched as they are dealt. A run is *"the bottom
         * rung, alone, until the run is spent"* (harness.ts:826-827), so on the
         * path that armed it every following item must be stage 1 — including
         * the probe that would otherwise have ridden on the draw, because
         * answering three wrongs with a question from the rung ABOVE would be
         * the island making a bad ten minutes worse.
         */
        if (watching && got.path === 'sums') {
          expect(got.stage, 'a mercy run dealt them something above the bottom rung')
            .toBe(1)
          expect(got.probe, 'a mercy run let a probe through').toBe(false)
          expect(got.mercy, 'the run was over before it had dealt them anything')
            .toBe(true)
          watching.left -= 1
          if (watching.left === 0) {
            /*
             * THE SNAPSHOT THE BRIEF ASKS FOR. Across the whole run the only
             * thing that may have changed is the record of what they answered:
             * `shapeOf` carries every tick, mode, offer and honeymoon in the
             * file, and it is byte-identical either side. A mercy is a fact
             * about ten minutes, and ten minutes may not become a fact about a
             * child.
             */
            expect(shapeOf(w.a), 'a mercy run changed what they are allowed')
              .toBe(watching.shape)
            /*
             * NOT GREATER, GREATER-OR-EQUAL, and the strong form of this claim
             * moved to the end of the walk ("the record kept counting").
             *
             * The assertion fires at DEAL time of the last mercy item, so at
             * most `MERCY_RUN - 1` answers have been banked by then — and when
             * the ladder grew from three rungs to seven on 4 August the walk's
             * trajectory shifted and it began landing on a mercy where none had
             * been. That is a fact about where a seeded month-long walk happens
             * to be, not about whether the record counts, so the trajectory-
             * dependent half of it is gone and the durable half is asserted
             * once, below, where it cannot move.
             */
            expect(w.a.sums.stages[1]!.attempts, 'a mercy run LOST attempts')
              .toBeGreaterThanOrEqual(watching.attempts)
            mercyLow = Math.min(mercyLow, watching.attempts)
            watching = null
          }
        }

        if (!got.armed) return
        mercies += 1
        if (got.path !== 'sums' || inspected) return
        inspected = true

        /*
         * THE SHARE IS UNTOUCHED, measured the moment the run is armed. The
         * control is a SECOND harness over the very same record: identical
         * persisted stats, no session state, therefore no mercy. The stage mix
         * differs — that is the mercy — and the sums-versus-subtraction split is
         * identical, because the stage weights are renormalised inside their
         * path before the path weight multiplies them (harness.ts:879-889). That
         * renormalisation is the only thing standing between JT-010(1) and a
         * mechanism that reaches into the same draw.
         */
        const control = createHarness(w.a)
        expect(pathShare(w.h)).toEqual(pathShare(control))
        expect(deals(w.h)['sums:2'], 'the mercy was not actually on').toBeUndefined()
        expect(deals(control)['sums:2']).toBeGreaterThan(0)

        watching = {
          shape: shapeOf(w.a),
          attempts: w.a.sums.stages[1]!.attempts,
          left: MERCY_RUN,
        }
      },
    })

    /* Again: a walk that armed nothing would prove nothing. */
    /* THE RECORD KEPT COUNTING THROUGH THE MERCIES. The durable half of the
     * in-flight assertion above: whatever the walk's trajectory, stage 1 has
     * more attempts on it at the end of the month than it had when the first
     * mercy armed. A mercy is ten minutes of gentler questions, not ten minutes
     * the island forgets. */
    expect(mercyLow, 'no mercy ever armed, so nothing was measured').toBeLessThan(Infinity)
    expect(w.a.sums.stages[1]!.attempts, 'the record stopped counting')
      .toBeGreaterThan(mercyLow)

    expect(mercies).toBeGreaterThanOrEqual(5)
    expect(inspected, 'no mercy run ever armed on the path with two rungs').toBe(true)

    /*
     * THEIR ESTIMATE FELL AND THE TICKS DID NOT MOVE. That is the ratchet in
     * one line: `ewma` is what the island knows about today, the tick is what
     * their parent said they may be dealt, and the first has no authority over
     * the second.
     */
    expect(w.a.sums.stages[1]!.ewma!).toBeLessThan(0.5)
    expect(w.a.sums.stages[2]!.ewma!).toBeLessThan(0.5)
    expect(tickedKeys(w.a)).toEqual(opening)
    expect(w.h.levelFor('sums')).toEqual([1, 2])
    expect(w.h.levelFor('takingAway')).toEqual([1])

    /*
     * And nothing was offered to them either, which is the same rule seen from
     * the other end: the gate reads `solid`, `solid` reads a fallen estimate,
     * and the island's answer to a bad month is silence rather than a demotion.
     */
    expect(w.h.pendingOffer()).toBeNull()
  })
})

describe('the improver — settled rungs whisper, and wake without falling', () => {
  it('earns their way up a month, retires a rung to a whisper, and wakes it intact', () => {
    /*
     * The third life, and the only one where the record is supposed to MOVE.
     * They answer well, they are offered the next thing and say yes, and a rung
     * they have mastered drops to the occasional item. Every one of those is a
     * chance for something to be quietly lost — an accepted offer that unticks
     * the rung below it, a retirement that stops dealing a stage instead of
     * whispering it, a settled stage that never comes back. The census catches
     * the first; the counts below catch the other two.
     */
    const w = walk(0x600d1a55)
    let whispers = 0
    let accepted = 0

    march(w, {
      /*
       * A LONG SITTING, and the length is load-bearing. The whisper budget is a
       * cap on a SESSION, so a day short enough that the weights alone would
       * never reach two whispers cannot tell a budget of two from a budget of
       * five — it would assert the cap while measuring the weight. Two dozen
       * questions is a heavy day for a five-year-old and it is the one that
       * makes *"1–2 items per session"* an actual claim.
       */
      items: 24,
      accuracy: 0.92,
      offer: due => {
        const before = tickedKeys(w.a)
        w.h.noteOffer(due.path, true)
        accepted += 1
        // Yes means the target rung, and NOTHING ELSE, changed hands.
        const won = `${due.path}:${due.stage}`
        const after = tickedKeys(w.a)
        expect(after, `saying yes to ${due.kind} ticked nothing`).toContain(won)
        expect(after.filter(k => k !== won), 'saying yes cost them a rung')
          .toEqual(before)
      },
      onDay: (day, dealt) => {
        /*
         * *"1–2 items per session from mastered stages"* — runA.md:237, and the
         * upper end is a cap on a SITTING. Counted per path per day against the
         * stage's settledness AT THE MOMENT IT WAS CHOSEN, because settledness
         * is derived rather than stored and flickers with their last answer;
         * and against `whisper` rather than `settled`, because an item a mercy
         * run put them on is not one the budget pays for (`mercyShadow` above).
         */
        for (const p of MATHS_PATHS) {
          const spent = dealt.filter(d => d.path === p && d.whisper).length
          expect(spent, `${spent} whispers on ${p} in one sitting, day ${day}`)
            .toBeLessThanOrEqual(WHISPERS_PER_SESSION)
          whispers += spent
        }
      },
    })

    /*
     * The month has to have gone somewhere. Subtraction was introduced and
     * accepted, BOTH sum rungs above the first were earned — 3 (teens plus
     * units) and then 2 (bridging ten), in ladder order and not numeric order —
     * and the first sum rung has been mastered AND superseded, which is the
     * state the whole retirement rule is about.
     */
    expect(accepted).toBeGreaterThanOrEqual(2)
    /*
     * THEY CLIMBED, AND IN LADDER ORDER — stated as the property rather than as
     * the exact set. The ladder grew from three rungs to seven on 4 August, so a
     * good month now carries a child further than [1, 3, 2] and a literal here
     * would need editing every time Joe adds a level. What must hold is that
     * they hold the first three in order and that whatever else they earned came
     * off the ladder in its own order.
     */
    const climbed = w.h.levelFor('sums')
    /* A CONTIGUOUS RUN UP THE LADDER FROM WHERE THEY STARTED. Written against
     * the ladder rather than as a literal so it survives Joe reordering the
     * rungs, which he did hours after adding them ("switch rung 4 and 5").
     * They begin ticked on sums 1 and climb; nothing may be skipped and nothing
     * may arrive out of order. */
    const from = STAGES.sums.indexOf(1)
    expect(climbed.length, 'a good month climbed nothing').toBeGreaterThanOrEqual(3)
    expect(climbed).toEqual(STAGES.sums.slice(from, from + climbed.length))
    expect(w.h.levelFor('takingAway')).toContain(1)
    expect(whispers, 'a retired rung was never visited again').toBeGreaterThan(0)

    /*
     * SETTLED IS NOT GONE. They finish the month on a good run — right answers
     * on the retired rung put its estimate back over the bar — and the rung is
     * settled again, which is the state the wake has to be measured from. The
     * loop is bounded because an unbounded one would hang rather than fail.
     */
    w.h.dealt('sums', 1)
    for (let i = 0; i < 40 && !w.h.settledStages('sums').includes(1); i++) {
      w.h.recordAttempt(attempt({ correct: true }))
    }
    expect(w.h.settledStages('sums'), 'the rung never settled').toContain(1)

    // Its whisper budget spent, a settled rung is out of rotation for the rest
    // of the sitting — the retirement, at its far end.
    w.h.dealt('sums', 1)
    w.h.dealt('sums', 1)
    const asleep = deals(w.h)
    /*
     * AGAINST THE OTHER RUNGS AS A GROUP, not against rung 2 alone.
     *
     * The claim is that a retired rung whispers — it is dealt far less than the
     * rungs still in rotation. Comparing it with ONE named sibling was a fair
     * proxy while the ladder was three rungs and the sweep gave each of them a
     * third of the sums weight; with seven rungs (4 August) the same sweep
     * spreads thinner and which particular sibling this deterministic walk lands
     * on is an accident of the weights. The group is what the rule is about.
     */
    const elsewhere = Object.entries(asleep)
      .filter(([k]) => k.startsWith('sums:') && k !== 'sums:1')
      .reduce((n, [, v]) => n + v, 0)
    expect(elsewhere, 'no other sums rung was dealt, so nothing was measured')
      .toBeGreaterThan(0)
    expect(asleep['sums:1'] ?? 0, 'a retired rung was still in full rotation')
      .toBeLessThan(elsewhere / 2)

    /*
     * AND NOW THE WAKE, which is the assertion this describe exists for.
     *
     * Two wrong answers take the estimate under the bar and the rung is simply
     * back in full rotation. It is emergent rather than implemented — there is
     * no flag to unset, because nothing about settledness was ever stored
     * (harness.ts:546-549) — and the thing worth proving is that it is NOT A
     * DEMOTION: the shape of the record is byte-identical either side, both
     * rungs are still ticked, and every attempt they ever made is still there.
     * `settledStages` simply stops listing it.
     *
     * Two rather than one: one wrong answer lands the ewma on exactly the bar,
     * which is still solid.
     */
    const shape = shapeOf(w.a)
    const banked = w.a.sums.stages[1]!.attempts
    const census = censusOf(w.a)
    w.h.recordAttempt(attempt({ correct: false }))
    w.h.recordAttempt(attempt({ correct: false }))

    expect(w.h.settledStages('sums')).not.toContain(1)
    expect(shapeOf(w.a), 'waking changed what they are allowed').toBe(shape)
    expect(w.a.sums.stages[1]!.attempts).toBe(banked + 2)
    assertNoDemotion(census, censusOf(w.a), 'the wake')
    expect(w.h.levelFor('sums')).toEqual(climbed)

    /*
     * BACK IN FULL ROTATION, stated against its FAIR SHARE of the path.
     *
     * It used to read "the two rungs now weigh the same" and compared rung 1
     * with rung 2 to within 3 deals. That was true while sums had three rungs
     * and the sweep split the path evenly between the ticked ones; with seven
     * (4 August) the rungs no longer carry equal weight and pinning two of them
     * to each other measures the weighting rather than the wake.
     *
     * What waking means is that the rung is dealt like a rung again — so it is
     * compared with what an even split of the path would give it. Half of fair
     * share is a wide floor on purpose: the point is that it is no longer a
     * whisper, not that the weights are flat.
     */
    const awake = deals(w.h)
    expect(awake['sums:1'] ?? 0).toBeGreaterThan(asleep['sums:1'] ?? 0)
    const sumsDeals = Object.entries(awake)
      .filter(([k]) => k.startsWith('sums:'))
      .reduce((n, [, v]) => n + v, 0)
    const rungs = climbed.length
    expect(awake['sums:1'] ?? 0, 'the woken rung is still being whispered')
      .toBeGreaterThan(sumsDeals / rungs / 2)
  })
})

describe('nothing demotes, ever — runA.md:240, over all three lives at once', () => {
  it('walks a refuser, a struggler and an improver and never takes anything back', () => {
    /*
     * The three walks above each assert their own contract and this one asserts
     * only the shared promise, stated where it can be read on its own: whatever
     * they do for a month — refuse everything, get everything wrong, or get
     * good — the set of rungs they may be dealt only ever grows, and the
     * evidence behind them only ever accumulates. `march` compares the full
     * census at the close of every day, so the loop below is thirty comparisons
     * apiece and the assertions here are the endpoints.
     *
     * The improver is the only one whose ticked set may legitimately grow, and
     * the superset check is deliberately not an equality: a walk that could
     * never gain anything would make "never loses anything" a much smaller
     * claim than the spec is making.
     */
    const lives = [
      { name: 'the refuser', seed: 0x1efa5e01, items: 8, accuracy: 0.95, yes: false },
      { name: 'the struggler', seed: 0x5c1a6b02, items: 10, accuracy: 0.3, yes: false },
      { name: 'the improver', seed: 0x600d0003, items: 12, accuracy: 0.92, yes: true },
    ]

    for (const life of lives) {
      const w = walk(life.seed)
      const opening = tickedKeys(w.a)
      march(w, {
        items: life.items,
        accuracy: life.accuracy,
        offer: due => { w.h.noteOffer(due.path, life.yes) },
      })
      for (const key of opening) {
        expect(tickedKeys(w.a), `${life.name} lost ${key}`).toContain(key)
      }
      for (const p of LIVE_PATHS) {
        expect(w.h.levelFor(p).length, `${life.name} lost a rung of ${p}`)
          .toBeGreaterThanOrEqual(createHarness(createAttainment()).levelFor(p).length)
      }
      /*
       * And they were really there: a month of questions, all of them answered.
       * Summed across the maths rungs rather than read off one of them, because
       * the improver's month opens two more and spreads their work over them —
       * which is the growth this test is refusing to call a loss.
       */
      const answered = MATHS_PATHS.reduce((n, p) =>
        n + STAGES[p].reduce((m, s) => m + w.a[p].stages[s]!.attempts, 0), 0)
      expect(answered, `${life.name} barely played`).toBeGreaterThan(200)
    }
  })
})
