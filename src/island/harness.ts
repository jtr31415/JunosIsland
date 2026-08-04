/**
 * The harness (Run A, item A3): the island's single choke point for policy.
 *
 * WHAT IT IS FOR. Before this, the level a generator was asked for was a
 * literal in `main.ts` — `level: 1` on the reading deps, `1` in the `dealSum`
 * call — and every outcome a child produced was computed by `attempts.ts` and
 * dropped on the floor, because nothing was listening. This module is both
 * ends of that: what they may be dealt, and what happened when they were.
 *
 * THE SHAPE IS THE SPEC'S. `levelFor(path)` says which stages of a path are
 * ticked; `recordAttempt(evt)` moves the stats for whatever was last dealt;
 * `noteRescue(path)` is in-session memory that never touches the save. The
 * Run B surface — `probeWanted`, `offerDue`, `pendingOffer`, `noteOffer` — was
 * declared and inert through A4–A6 so B's shape was fixed before it had any
 * behaviour; it is now LIVE, headless. It probes, it gates, it offers, and on
 * an accepted offer it ticks. It still renders nothing: the offer surface that
 * puts the universal line on screen is a separate slice, and so is the
 * honeymoon's pay-3 half — this file only stamps the marker that half reads.
 *
 * WHAT IT DOES NOT DO, and this is the interesting part: it does not choose
 * which PATH a deal moment takes. The island has two ways into a challenge and
 * each covers two paths — a plot could be `sums` or `takingAway`, the egg could
 * be `reading` or `building` — so something must pick the path before
 * `levelFor` can pick a stage inside it. That knob decides how much subtraction
 * and how much word-building a child actually gets, which makes it Joe's
 * (JT-010) and not this file's. Until it is answered, callers name the path
 * themselves and this module is honest about only knowing the rest.
 *
 * NO DOM, NO GENERATORS, NO STORAGE. It holds a reference to the attainment
 * record and mutates it in place; A5 serialises that record and `main.ts`
 * persists it. Keeping it pure is what lets the rules be tested as rules.
 */
import type { AttemptEvent } from './attempts'
import { pageKind } from './balance'
import type { PageKind } from './balance'
import { dayKey } from '../platform/clock'

/** The paths a child can actually be dealt today. */
export const LIVE_PATHS = ['sums', 'takingAway', 'reading', 'building'] as const
export type Path = typeof LIVE_PATHS[number]

/**
 * Named, greyed, and empty — A4's "coming later" slots.
 *
 * They exist here so the panel can render them and a save can carry them
 * without either inventing the list, and so that adding one later is a stage
 * table entry rather than a new concept.
 */
export const RESERVED_PATHS =
  ['storySums', 'fractions', 'multiplication', 'division'] as const
export type ReservedPath = typeof RESERVED_PATHS[number]

/**
 * The stages that have a generator behind them.
 *
 * Reading and building have exactly ONE each, and that is a ruling rather than
 * an omission: level 2 of both is the alien generator (`read.ts:29`,
 * `build.ts:25`) and aliens are retired. A future rung on those paths is a new
 * generator, not a new number here.
 */
export const STAGES: Record<Path, readonly number[]> = {
  /*
   * DO NOT "TIDY" THIS INTO [1, 2, 3, ...]. The NUMBER is a generator id; the
   * ARRAY POSITION is the ladder rung. `generateAdd` reads the number, and
   * `tools/golden/golden.json` is FROZEN against ids 1 and 2. Renumbering so the
   * rungs read in order would change what each rung generates and redden the
   * golden — which may never be re-blessed to make a test pass.
   *
   * THE LADDER, in rung order, with the id in brackets:
   *
   *   1. within five            (4)  NEW, 4 Aug. Below where anyone starts.
   *   2. to ten                 (1)  where every island begins
   *   3. teens plus units       (3)  no regrouping
   *   4. bridging ten           (2)  the ten has to be broken open
   *   5. whole tens to a hundred(5)  NEW. 20 + 30 — place value, no new sum
   *   6. two-digit plus units   (6)  NEW. 34 + 5 — rung 3, past twenty
   *   7. two-digit, bridging    (7)  NEW. 37 + 5 — rung 4, past twenty
   *
   * Joe, 4 August 2026: *"add some more summation levels."* Three became seven.
   * The four that were there are UNTOUCHED — same ids, same generators, same
   * order relative to each other — so no child moves rung and the golden still
   * anchors. `docs/PHASE4.1-EDUCATIONAL-HARNESS.md` §3 is the table of record.
   *
   * WITHIN FIVE SITS BELOW THE START ON PURPOSE. `STARTS_TICKED` ticks sums 1,
   * so the cadence never walks down to rung 1 and no child is moved onto it.
   * It exists for a grown-up who needs to go gentler than ten, which is the one
   * direction this ladder could not go before.
   *
   * Everything that walks the ladder — `tickedStages`, `topTicked`,
   * `nextStage`, `settledOn` — walks THIS ORDER and never the numeric one.
   */
  sums: [4, 1, 3, 2, 5, 6, 7],
  takingAway: [1, 2, 3],
  reading: [1],
  building: [1],
}

/**
 * The two ways into a challenge, and the paths each of them covers.
 *
 * THIS IS THE THING THE SPEC DID NOT HAVE. `levelFor(path)` presumes the
 * caller knows the path, and at a deal moment nothing does: a plot could be a
 * sum or a take-away, an egg could be a word to find or a word to build. So a
 * moment is the unit that actually gets dealt, and the two of them are chosen
 * by different rules on Joe's own ruling (JT-010) — maths by the ticks, reading
 * by the mix.
 */
export const MATHS_PATHS = ['sums', 'takingAway'] as const
export const READING_PATHS = ['reading', 'building'] as const
/** Which renderer a reading path puts on screen. */
const READING_PATH_OF: Record<PageKind, Path> = { find: 'reading', build: 'building' }

export type Mode = 'auto' | 'manual' | 'hold'

/** One day's work on one stage. The consistency tier's raw material. */
export interface SessionRecord { date: string; correct: number; total: number }

export interface StageStats {
  /** May they be dealt this? The whole of the capability model. */
  ticked: boolean
  attempts: number
  /**
   * Exponentially weighted accuracy, α .15. Null until the first attempt.
   *
   * Seeded with the first answer rather than with zero. A stage seeded at zero
   * says a child who has got everything right is at .15, which is a statement
   * about the seed and not about them.
   */
  ewma: number | null
  /** The last 30 CORRECT latencies, in ms, raw. */
  latencies: number[]
  /**
   * The first 10 correct latencies, frozen.
   *
   * NOT IN THE SPEC'S SHAPE, and needed by it: A6 measures speed as the recent
   * correct-median against *"the stage's own early-attempt baseline"*, and a
   * ring of 30 cannot answer that — by the time there is a trend to see, the
   * beginning has been overwritten by the trend itself.
   */
  early: number[]
  /** The last 6 days they worked on this stage. */
  sessions: SessionRecord[]
  /** The last 10 rescue timestamps. */
  rescues: number[]
  /**
   * The last 12 PROBE outcomes on this stage, 1 correct / 0 wrong.
   *
   * A ring of its own, and nothing a probe does may leak into the fields
   * above it. Run B (runA.md:227-229) gates promotion on *"probe accuracy
   * ≥ .70 over ≥ 8"*, and the stage being probed is one they have never
   * been taught — so the probe is a QUESTION ABOUT READINESS and not a
   * record of their work. Two of those fields would be actively damaged by it:
   *
   *   - `ewma` is seeded by the first answer (see `recordAttempt` below), so
   *     one failed first probe would seed an unticked stage at 0 and damn it
   *     for dozens of attempts once it finally opens. Brief §19 says wrong
   *     answers cost nothing; that would be the ledger charging for one.
   *   - `early` FREEZES once it holds ten samples, and A6 measures speed
   *     against it. Probe latencies — on unseen work, so slow — would poison
   *     that baseline permanently and read as a child who got faster.
   *
   * `attempts`, `sessions` and `rescues` are left out for the plainer reason
   * that they are the promotion gate's own evidence: letting probes feed the
   * counters that decide whether to probe is a loop, not a measurement.
   */
  probes: number[]
}

/**
 * What has been OFFERED on this path, and how the refusal is honoured.
 *
 * Run B's cadence in three facts (runA.md:230-232): at most one offer a
 * session, a decline costs nothing, and a decline is respected for two
 * sessions. `daysSinceDecline` counts DAYS THEY PLAYED rather than days on the
 * calendar — a child who does not open the island for a week has not declined
 * anything twice — so it is bumped from the one day key `recordAttempt`
 * already computes, and `lastCountedDay` is the cursor that keeps that bump
 * idempotent within a day and honest across a reload.
 */
export interface OfferState {
  lastOfferDay: string | null
  declinedDay: string | null
  daysSinceDecline: number
  /** The last day already counted against `daysSinceDecline`. */
  lastCountedDay: string | null
}

export interface PathAttainment {
  mode: Mode
  stages: Record<number, StageStats>
  offer: OfferState
  /**
   * The day an offer on this path was accepted, or null.
   *
   * A MARKER ONLY. Run B's honeymoon is *"pay 3, 2 sessions, cost-index
   * frozen"* (runA.md:233) and none of that lives here: `src/island/balance/`
   * owns payment and this module owns policy, and a harness that reached into
   * the economy would be the second write path this project has been bitten by
   * four times. So this slice records WHEN, exposes `honeymoonActive(path)`,
   * and the pay-3 / frozen-cost-index half is the next slice's work.
   */
  honeymoonFrom: string | null
}
export type Attainment = Record<Path, PathAttainment>

const LATENCY_RING = 30
const EARLY_SAMPLE = 10
const SESSION_KEEP = 6
const RESCUE_RING = 10
const PROBE_RING = 12
/** How fast one answer moves the accuracy estimate. A5's constant. */
export const EWMA_ALPHA = 0.15

/* Run B's gate, all of it, from runA.md:227-229. */
/** Probes start once the stage below is comfortable, not once it is mastered. */
const PROBE_FROM_EWMA = 0.75
/** One question in eight, so a probe is a taste and not a lesson. */
const PROBE_RATE = 1 / 8
const PROMOTE_EWMA = 0.85
const PROMOTE_ATTEMPTS = 20
const PROBE_MIN = 8
const PROBE_ACCURACY = 0.7
/** Distinct days on the source stage, and sessions a decline is honoured for. */
const PROMOTE_DAYS = 2
const DECLINE_COOLDOWN = 2
/** Sessions the honeymoon covers, counting the one it was accepted on. */
const HONEYMOON_SESSIONS = 2

/*
 * ------------------------------------------------------------------------
 * THE THREE ADAPTIVE DIALS — the weakness lean, the mercy run, the whisper.
 *
 * >>> PROVISIONAL, AND THIS IS THE MARK JOE ASKED FOR ON NUMBERS THAT PLAY
 * >>> WILL PROBABLY MOVE. The JT-021 precedent is `src/island/balance/
 * >>> index.ts:369-379`: values that were ratified for now rather than
 * >>> settled get a marker so nobody has to go looking for them. Retuning
 * >>> any of the eight below is an edit to THIS BLOCK and nothing else —
 * >>> no new concept, no second write path, no test rewrite beyond the
 * >>> tolerances the tests state out loud.
 *
 * THE WEAKNESS LEAN. runA.md:236 asks for a *"weakness-lean between paths
 * bounded 65/35 on persistent estimates only"*, and on its face that is a
 * clamp on the SHARE — which would supersede JT-010(1), where Joe says in
 * terms that *"share of maths stays by tick"* and gives his own worked
 * example of 2/3 sums to 1/3 subtraction. The conflict was put to Fable with
 * the real code and Fable chose option C: read *bounded 65/35* as a bound on
 * the STRENGTH of the lean — a multiplier on the weaker path's tick weight —
 * rather than as a clamp on the resulting share. The reason is that the ticks
 * must always dominate, because they are the parent's statement of what
 * their child may be dealt, and a lean that could invert which path leads
 * would be quietly overruling them with an accuracy estimate.
 *
 * WHAT THE MULTIPLIER BUYS, in the only two shapes worth naming:
 *
 *   1:1 ticks (one sum rung, one subtraction rung), full lean:
 *     weights 1.857 : 1 → .65 / .35 — EXACTLY the spec's number, arrived at
 *     from the other end. That is the calibration of LEAN_MAX.
 *   2:1 ticks (Joe's example, subtraction the weaker), full lean:
 *     weights 2 : 1.857 → about .519 sums / .481 subtraction. The parent's
 *     ticks still lead, and subtraction has bought most of the practice it
 *     needed without the lean taking the decision away from them.
 *
 * The lean reads PERSISTED estimates only — the spec's own words — so
 * nothing that happened in this sitting can move the share of maths.
 */

/**
 * Attempts a path must have behind its estimate before it may be leaned on.
 *
 * BOTH paths must clear it or the lean is off entirely, which is deliberate:
 * a freshly introduced `takingAway` has almost no history, and a lean
 * computed from the OTHER path's data alone would force-feed a five-year-old
 * a brand-new kind of maths on the strength of no evidence about it at all.
 * Below this bar they are dealt at their tick share, which is Joe's answer.
 */
const LEAN_MIN_ATTEMPTS = 8
/** A gap this small is noise in an ewma, not a weakness. */
const LEAN_DEAD_ZONE = 0.05
/** The gap at which the lean is fully on. Beyond it nothing more happens. */
const LEAN_FULL_GAP = 0.30
/** The strongest the lean may ever pull: 65/35 at a 1:1 tick baseline. */
const LEAN_MAX = 65 / 35

/**
 * Consecutive wrong answers on one path that arm a mercy run.
 *
 * Three is the point at which a child has stopped being stretched and
 * started being ground down, and it is high enough that a slip and a guess
 * do not reach it.
 */
const MERCY_TRIGGER = 3
/** How many items the run lasts. Long enough to land, short enough to be invisible. */
const MERCY_RUN = 2
/** What a settled stage is worth against a live one: one item in five or so. */
const WHISPER_WEIGHT = 0.2
/** *"1–2 items per session from mastered stages"* — runA.md:237, the upper end. */
const WHISPER_PER_SESSION = 2

/**
 * What a stage looks like before anything has happened on it.
 *
 * Honest zeroes: nothing is invented for work nobody has watched. A stage with
 * no attempts reads as unpractised, which is why A6 shows dashes rather than a
 * tier until there is enough to say something true.
 */
const freshStage = (ticked: boolean): StageStats => ({
  ticked, attempts: 0, ewma: null,
  latencies: [], early: [], sessions: [], rescues: [], probes: [],
})

/** Nothing offered, nothing declined: the state of a path nobody has asked about. */
const freshOffer = (): OfferState =>
  ({ lastOfferDay: null, declinedDay: null, daysSinceDecline: 0, lastCountedDay: null })

/**
 * Which stages a brand-new island starts with ticked: exactly what it can
 * already deal.
 *
 * The A5 spec says *"existing saves get sums 1 ticked, everything else honest
 * zeroes"*, which read literally would leave an island unable to deal a reading
 * page — the egg would never hatch again. The honest reading, and the one taken
 * here, is that the zeroes are the STATS and the ticks are what the child
 * is already playing. `takingAway` is NOT among them: the island has never
 * dealt a subtraction, and starting one on the strength of a migration would be
 * handing a child new work that nobody decided to give them. JT-007 is Joe
 * ticking it himself, deliberately, which is the right way for it to arrive.
 */
const STARTS_TICKED: ReadonlyArray<readonly [Path, number]> =
  [['sums', 1], ['reading', 1], ['building', 1]]

export function createAttainment(): Attainment {
  const out = {} as Attainment
  for (const path of LIVE_PATHS) {
    const stages: Record<number, StageStats> = {}
    for (const stage of STAGES[path]) {
      stages[stage] = freshStage(
        STARTS_TICKED.some(([p, s]) => p === path && s === stage))
    }
    out[path] = { mode: 'auto', stages, offer: freshOffer(), honeymoonFrom: null }
  }
  return out
}

/* ------------------------------------------------------- reading a save */

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

/** A list of finite numbers, capped from the RIGHT — a ring keeps its newest. */
function numbers(v: unknown, keep: number, fromStart = false): number[] {
  if (!Array.isArray(v)) return []
  const xs = v.map(num).filter((n): n is number => n !== null)
  return fromStart ? xs.slice(0, keep) : xs.slice(-keep)
}

/**
 * A day key, or null. `dayKey` writes `YYYY-MM-DD` and only that shape is
 * ever compared against one, so anything else is garbage that would sit in the
 * save forever pretending to be a date.
 */
const dayString = (v: unknown): string | null =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null

/** A probe ring: strictly ones and zeroes, because their MEAN is a gate. */
function probeRing(v: unknown): number[] {
  if (!Array.isArray(v)) return []
  return v.filter((n): n is number => n === 0 || n === 1).slice(-PROBE_RING)
}

/**
 * The offer bookkeeping, repaired rather than trusted.
 *
 * A hand-edited `daysSinceDecline` of -5, or of 10^9, is the difference
 * between a cooldown that never ends and one that was never served, so it is
 * clamped at both ends. A missing block is a save that predates Run B, and
 * "nobody has ever been offered anything" is exactly right for one.
 */
function offerState(v: unknown): OfferState {
  const out = freshOffer()
  if (!v || typeof v !== 'object') return out
  const o = v as Record<string, unknown>
  out.lastOfferDay = dayString(o.lastOfferDay)
  out.declinedDay = dayString(o.declinedDay)
  out.lastCountedDay = dayString(o.lastCountedDay)
  const since = num(o.daysSinceDecline)
  if (since !== null) {
    out.daysSinceDecline = Math.min(DECLINE_COOLDOWN, Math.max(0, Math.floor(since)))
  }
  /*
   * A cooldown with no decline behind it is not a cooldown. Dropping the
   * counter with the day it belongs to keeps the pair meaningful, so a garbled
   * `declinedDay` cannot leave a path silently unable to offer anything.
   */
  if (out.declinedDay === null) {
    out.daysSinceDecline = 0
    out.lastCountedDay = null
  }
  return out
}

function sessions(v: unknown): SessionRecord[] {
  if (!Array.isArray(v)) return []
  const out: SessionRecord[] = []
  for (const r of v) {
    if (!r || typeof r !== 'object') continue
    const s = r as Partial<SessionRecord>
    const correct = num(s.correct)
    const total = num(s.total)
    if (typeof s.date !== 'string' || correct === null || total === null) continue
    out.push({ date: s.date, correct, total })
  }
  return out.slice(-SESSION_KEEP)
}

/**
 * Rebuild an attainment record from whatever was on disk.
 *
 * Anything read off a save is untrusted input — hand-edited, half written, or
 * written by a build that no longer exists (envelope.ts). Two rules make that
 * safe, and both matter:
 *
 * 1. The result is built from the STAGE TABLE outward, never from the file's
 *    own keys. A stage id with no generator behind it cannot survive the trip,
 *    so it can never reach a generator that would not know what to do with it.
 * 2. Every field falls back to the fresh default rather than to zero. A save
 *    that predates this field entirely therefore wakes up ticked for what the
 *    island already deals — which is the corrected reading of A5's migration
 *    line, and the difference between an island that still hatches eggs and one
 *    that quietly cannot.
 */
export function readAttainment(v: unknown): Attainment {
  const out = createAttainment()
  if (!v || typeof v !== 'object') return out
  const raw = v as Record<string, unknown>

  for (const path of LIVE_PATHS) {
    const got = raw[path]
    if (!got || typeof got !== 'object') continue
    const p = got as { mode?: unknown; stages?: unknown }

    if (p.mode === 'auto' || p.mode === 'manual' || p.mode === 'hold') {
      out[path].mode = p.mode
    }
    /*
     * Run B's bookkeeping rides in the same record, and rule 2 above applies
     * to it unchanged: a save written before these fields existed simply
     * yields the fresh default, and a save carrying garbage in them yields the
     * fresh default too. Neither one may be dropped SILENTLY, which is what
     * happens to any field this reader does not name — it rebuilds outward
     * from `STAGES` and copies, so an unlisted field is a field that does not
     * survive the trip.
     */
    out[path].offer = offerState((got as { offer?: unknown }).offer)
    out[path].honeymoonFrom = dayString((got as { honeymoonFrom?: unknown }).honeymoonFrom)
    if (!p.stages || typeof p.stages !== 'object') continue
    const stages = p.stages as Record<string, unknown>

    for (const id of STAGES[path]) {
      const got2 = stages[String(id)]
      if (!got2 || typeof got2 !== 'object') continue
      const s = got2 as Record<string, unknown>
      const into = out[path].stages[id] as StageStats
      if (typeof s.ticked === 'boolean') into.ticked = s.ticked
      const attempts = num(s.attempts)
      if (attempts !== null && attempts >= 0) into.attempts = Math.floor(attempts)
      const ewma = num(s.ewma)
      if (ewma !== null) into.ewma = Math.min(1, Math.max(0, ewma))
      into.latencies = numbers(s.latencies, LATENCY_RING)
      into.early = numbers(s.early, EARLY_SAMPLE, true)
      into.sessions = sessions(s.sessions)
      into.rescues = numbers(s.rescues, RESCUE_RING)
      into.probes = probeRing(s.probes)
    }
  }

  /*
   * A MOMENT WITH NOTHING TICKED IS CORRUPTION, NOT A PREFERENCE.
   *
   * `openRead`/`openSum` decline when their moment is empty, and a port that
   * declines leaves the flow in 'challenge' with no overlay and no way out but
   * a reload — a fault this island has already had once (main.ts, the
   * InteractionPorts note). The panel cannot produce that state, because
   * JT-010(3) refuses the last untick; a hand-edited or half-written save can.
   * So the invariant is restored where the untrusted data comes IN, and not
   * only where a parent's finger does.
   *
   * The ticks are repaired and the STATS are not: measurement is the record
   * of what the child has actually done, and nothing about a broken tickbox
   * makes it untrue.
   */
  for (const moment of [MATHS_PATHS, READING_PATHS]) {
    if (moment.some(p => STAGES[p].some(s => out[p].stages[s]?.ticked))) continue
    for (const [path, stage] of STARTS_TICKED) {
      if ((moment as readonly Path[]).includes(path)) {
        (out[path].stages[stage] as StageStats).ticked = true
      }
    }
  }
  return out
}

/** A number in [0,1). The island's `Rng`, narrowed to what this needs. */
type Roll = () => number

/**
 * What a maths moment turned out to be.
 *
 * `probe` is the whole of Run B's presence in a deal: the same generator, the
 * same round, one rung higher, and an answer that goes somewhere else.
 */
export interface MathsDeal { path: Path; stage: number; probe: boolean }

/** An offer waiting to be put to the child, and which of B's two it is. */
export interface Offer { path: Path; stage: number; kind: 'trickier' | 'takingAway' }

export interface Harness {
  /** The ticked stages of a path, in ladder order. Empty is a real answer. */
  levelFor(path: Path): number[]
  /** One of them, drawn uniformly. Null when the path is empty. */
  pick(path: Path, roll: Roll): number | null
  /**
   * What a maths round should be. Null when nothing in maths is ticked.
   *
   * Joe, JT-010(1): *"share of maths stays by tick."* The ticked stages of
   * both paths go in one pool and the draw is over that pool, so the share is
   * a consequence of the ladder rather than a number anybody sets. The three
   * adaptive mechanisms weight the pool — see the dial block near the top of
   * this file — and only the weakness lean is allowed anywhere near the share.
   */
  dealMaths(roll: Roll): MathsDeal | null
  /**
   * Which kind of reading page belongs at this page index, or null when
   * neither reading path is ticked.
   *
   * Joe, JT-010(2): *"reading mix should be 3 build, 1 find. period."* — so
   * the mix in `balance.json` decides, and the tickboxes only gate it.
   */
  dealReading(pageIndex: number): PageKind | null
  /** May this tick come off? JT-010(3). */
  canUntick(path: Path, stage: number): boolean
  /** Set it, if allowed. Returns whether it took. */
  setTicked(path: Path, stage: number, ticked: boolean): boolean
  /**
   * Who moves this path's ticks: Auto, a parent's hand, or nobody.
   *
   * It lives here for the same reason the ticks do. Mode is per-path persisted
   * state, and this module is the single choke point for every read and write
   * of `attainment` — a panel reaching into the record directly would be a
   * SECOND path that has to agree with the first one, which is precisely the
   * shape that has bitten this project three times. Returns false when the path
   * is not live, so a reserved slot cannot quietly grow a mode.
   */
  setMode(path: Path, mode: Mode): boolean
  /**
   * What was just dealt, so the attempts that follow have somewhere to go.
   *
   * `probe` defaults to false so that every caller that predates Run B still
   * says what it meant: a plain deal, recorded plainly.
   */
  dealt(path: Path, stage: number, probe?: boolean): void
  /** An attempt resolved. Attributed to the last `dealt`. */
  recordAttempt(evt: AttemptEvent): void
  /** A rescue fired on this path. In-session only; never persisted. */
  noteRescue(path: Path): void
  rescuedThisSession(path: Path): boolean
  /**
   * The stages of this path that are MASTERED AND SUPERSEDED — solid, and with
   * a higher rung ticked above them.
   *
   * runA.md:237 wants *"whisper retirement (1–2 items per session from
   * mastered stages, feeding the settled-✓ that can quietly wake)"*, and this
   * is the read the ✓ will be drawn from. Nothing renders it yet; it is here
   * because the definition belongs with the rule that acts on it and not with
   * the panel that will one day draw it.
   *
   * IT IS DERIVED, NEVER STORED. A settled stage is settled because `solid`
   * says so this instant, so one wrong answer takes its `ewma` under the bar
   * and it is simply back in full rotation — the *"quietly wake"* of the spec,
   * with no flag to unset, nothing unticked and nothing demoted.
   */
  settledStages(path: Path): number[]

  /* -------------------------------------------------- Run B, live and headless */

  /**
   * Should this path be slipping in the occasional harder question?
   *
   * True once the top ticked stage is COMFORTABLE (ewma ≥ .75) rather than
   * mastered, and only while there is a rung above it to ask about.
   */
  probeWanted(path: Path): boolean
  /** Is this path's own offer standing today? A thin read of `pendingOffer`. */
  offerDue(path: Path): boolean
  /**
   * The one offer to put to them right now, or null.
   *
   * The single question the offer surface asks, so it must be complete on its
   * own: the cadence, the cooldown, the gate and the ordering between B's two
   * offers are all resolved before it answers.
   */
  pendingOffer(): Offer | null
  /**
   * They were asked, and this is what they said.
   *
   * Accept ticks the target and stamps the honeymoon; decline costs them
   * nothing at all beyond two sessions of quiet. Neither ever unticks.
   */
  noteOffer(path: Path, accepted: boolean): void
  /** Is this path inside the two sessions that follow an accepted offer? */
  honeymoonActive(path: Path): boolean
}

/*
 * A session is a day in the child's own timezone, and `dayKey` is where that
 * is decided — the platform clock's, imported rather than reimplemented.
 *
 * This module had its own copy, byte-identical in behaviour, while
 * `report.ts` already imported the platform one. Two implementations of one
 * rule with a third correctly avoided is the shape HANDOFF §5 names as this
 * project's four-time offender: they agree only for as long as somebody keeps
 * them agreeing by hand, and the day they drift the sessions a harness WRITES
 * would stop matching the days the report READS them back on — a consistency
 * tier that is wrong in a way nothing would flag.
 */

/** Push onto a ring, dropping from the front once it is full. */
function ring(xs: number[], v: number, keep: number): void {
  xs.push(v)
  if (xs.length > keep) xs.splice(0, xs.length - keep)
}

export function createHarness(
  state: Attainment, now: () => number = Date.now,
): Harness {
  /**
   * What the last deal handed them.
   *
   * Null until something is dealt, and an attempt arriving against null is
   * DROPPED rather than guessed at. The overlay's tally outlives a single
   * round, so a mis-wire that attributed stray attempts to whatever was dealt
   * last would corrupt a stage quietly — which is the one failure a
   * measurement system must not have, because its output is a parent deciding
   * what their child can do.
   */
  let current: { path: Path; stage: number; probe: boolean } | null = null

  /** Transient rescue memory, per path. Deliberately not in `state`. */
  const rescuedIn = new Set<Path>()

  /*
   * THE IN-SESSION HALF OF ADAPTIVE SELECTION, and it lives here beside
   * `rescuedIn` for exactly the same reason that does: none of it is a fact
   * about the child.
   *
   * A run of three wrong answers is a bad ten minutes, not a capability, and
   * writing it into `attainment` would mean a Tuesday afternoon followed them
   * into every session afterwards — visible in a save, arguable over, and one
   * more field the migration has to repair. The whisper budget is the same
   * statement about a sitting: *"1–2 items per session"* is a sentence about
   * TODAY. So all three counters die with the session, which also makes them
   * untestable through the save and therefore only observable where they
   * actually matter — in what they get dealt.
   *
   * Brief §19 governs the mercy run in particular: wrong answers cost them
   * nothing. It is silent, it is never announced, there is no read for it on
   * the interface, and the attempts they make during one are recorded exactly
   * as honestly as any others. They simply find the next two questions on the
   * bottom rung, and nobody tells them why.
   */
  /** Consecutive wrong answers on a path, reset by any correct one. */
  const wrongRun = new Map<Path, number>()
  /** Items still owed on an armed mercy run. */
  const mercyLeft = new Map<Path, number>()
  /** Whisper items already spent on a path this session. */
  const whispered = new Map<Path, number>()

  const statsFor = (path: Path, stage: number): StageStats | null =>
    state[path]?.stages[stage] ?? null

  const live = (path: Path): boolean =>
    (LIVE_PATHS as readonly string[]).includes(path)

  /**
   * The ticked stages of a path, in ladder order — the one implementation.
   *
   * Driven by the STAGE TABLE, not by the keys of the save. A hand-edited
   * file, a rolled-back build or a future stage id are all untrusted input and
   * none of them may reach a generator that cannot render them.
   *
   * `levelFor`, `topTicked` and the weighted draw all read it from here rather
   * than each filtering the table themselves: three copies of one rule agree
   * only for as long as somebody keeps them agreeing by hand, which is the
   * shape HANDOFF §5 names as this project's repeat offender.
   */
  const tickedStages = (path: Path): number[] =>
    live(path) ? STAGES[path].filter(s => statsFor(path, s)?.ticked === true) : []

  /* --------------------------------------------------------- Run B's reads */

  /** The top rung they are allowed, which is the one the gate judges. */
  const topTicked = (path: Path): number | null => {
    const set = tickedStages(path)
    return set.length ? (set[set.length - 1] as number) : null
  }

  /**
   * The rung directly above the top ticked one, when there is one to want.
   *
   * Null for `takingAway` on a fresh island by construction — it starts with
   * NOTHING ticked, so there is no rung below to earn from, which is precisely
   * why its introduction cannot be gated on its own probes (see `pendingOffer`).
   */
  const nextStage = (path: Path): number | null => {
    const top = topTicked(path)
    if (top === null) return null
    const ids = STAGES[path]
    const next = ids[ids.indexOf(top) + 1]
    if (next === undefined || statsFor(path, next)?.ticked) return null
    return next
  }

  /**
   * Joe, JT-011(a): *"Manual persists, and Run B must skip it."*
   *
   * A parent who took a path off Auto said who moves its ticks, and Auto is
   * not to answer back — no probes, no offers, no ticking. Hold is the same
   * statement with more force.
   */
  const auto = (path: Path): boolean => live(path) && state[path]?.mode === 'auto'

  /**
   * The mastery half of the gate on ONE stage: accuracy, volume, no rescues in
   * the last two sessions, and two distinct days.
   *
   * Zero-rescue is read against the sessions rather than against the clock,
   * because a rescue is only evidence about the days they were actually here.
   */
  const solid = (st: StageStats): boolean => {
    if (st.ewma === null || st.ewma < PROMOTE_EWMA) return false
    if (st.attempts < PROMOTE_ATTEMPTS) return false
    const recent = st.sessions.slice(-PROMOTE_DAYS).map(s => s.date)
    if (recent.length < PROMOTE_DAYS) return false
    if (!st.rescues.every(t => !recent.includes(dayKey(t)))) return false
    return new Set(st.sessions.map(s => s.date)).size >= PROMOTE_DAYS
  }

  /** *"probe accuracy ≥ .70 over ≥ 8"* — runA.md:227-228, on the TARGET rung. */
  const probesPass = (st: StageStats): boolean =>
    st.probes.length >= PROBE_MIN
    && st.probes.reduce((n, v) => n + v, 0) / st.probes.length >= PROBE_ACCURACY

  /**
   * May this path be offered anything today?
   *
   * Two refusals, and the second is the one that matters to a child: a decline
   * costs nothing, so the island must not answer it by asking again tomorrow.
   */
  const cadenceOk = (path: Path, today: string): boolean => {
    const o = state[path]?.offer
    if (!o) return false
    if (o.lastOfferDay === today) return false
    return o.declinedDay === null || o.daysSinceDecline >= DECLINE_COOLDOWN
  }

  /* ------------------------------------------- the weights behind a draw */

  const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

  /**
   * A path's PERSISTENT accuracy estimate, and the volume standing behind it.
   *
   * The attempts-weighted mean of `ewma` across the path's ticked stages,
   * counting only stages that have an ewma at all — a stage nobody has
   * answered says nothing, and averaging it in as a zero would say something
   * false and cruel. Weighted by attempts rather than flat across stages
   * because twenty answers on the bottom rung and one on the top is mostly a
   * statement about the bottom rung.
   *
   * Null when the path has no ticked stage with any history.
   */
  const estimate = (path: Path): { mean: number; attempts: number } | null => {
    let attempts = 0
    let sum = 0
    for (const s of tickedStages(path)) {
      const st = statsFor(path, s)
      if (!st || st.ewma === null) continue
      attempts += st.attempts
      sum += st.attempts * st.ewma
    }
    return attempts > 0 ? { mean: sum / attempts, attempts } : null
  }

  /**
   * THE WEAKNESS LEAN — the ONLY thing that sets the share between the two
   * maths paths, and therefore the only thing JT-010(1) has to be defended
   * against.
   *
   * A path's weight starts at its number of ticked stages, which IS Joe's
   * answer: the share stays by tick. The weaker path's weight is then
   * multiplied by λ, which is 1 (no lean at all, today's behaviour exactly)
   * until the two paths' persisted estimates differ by more than the dead
   * zone, and rises to LEAN_MAX across the gap after that. See the dial block
   * near the top of this file for what λ buys at the two tick shapes that
   * matter, and for why *"bounded 65/35"* is read as a bound on the lean's
   * strength.
   *
   * THE GATE IS ON BOTH PATHS AT ONCE. If either side is short of
   * LEAN_MIN_ATTEMPTS, or has no ticked stage, or has no answered stage to
   * average, there is no lean — not a half lean, and not a lean computed from
   * one path's data. A gap measured against nothing is not a weakness.
   */
  const pathWeights = (): Map<Path, number> => {
    const out = new Map<Path, number>()
    for (const p of MATHS_PATHS) out.set(p, tickedStages(p).length)
    const [first, second] = MATHS_PATHS
    const a = estimate(first)
    const b = estimate(second)
    if (!a || !b) return out
    if (a.attempts < LEAN_MIN_ATTEMPTS || b.attempts < LEAN_MIN_ATTEMPTS) return out
    const weak = a.mean <= b.mean ? first : second
    const gap = Math.abs(a.mean - b.mean)
    const s = clamp01((gap - LEAN_DEAD_ZONE) / (LEAN_FULL_GAP - LEAN_DEAD_ZONE))
    out.set(weak, (out.get(weak) ?? 0) * (1 + s * (LEAN_MAX - 1)))
    return out
  }

  /**
   * The stages of a path that are mastered AND superseded — see
   * `Harness.settledStages` for what the word means and why nothing about it
   * is stored.
   *
   * The spec's third clause — that a path must keep at least one non-settled
   * ticked stage — is satisfied by construction rather than by a test here:
   * the comparison is strictly BELOW the top ticked rung, so the top rung
   * itself can never be settled and is always left in full rotation.
   *
   * "BELOW" IS LADDER ORDER, NOT NUMERIC ORDER, and that is the correction.
   * This read `s < top`, comparing generator IDS, while `topTicked` and
   * `nextStage` have always walked the position of the id in `STAGES[path]`.
   * The bug was latent for as long as every ladder happened to be numbered in
   * its own order, and became reachable the moment `STAGES.sums` became
   * [1, 3, 2]: a child ticked on all three has top = 2, and stage 3 — the
   * EASIER rung, one place below them — would compare 3 < 2 and never retire.
   * They would go on being dealt the middle rung at full weight forever. The
   * doc comment above already said "below the top ticked rung" in words; this
   * makes the code agree with it.
   */
  const settledOn = (path: Path): number[] => {
    const top = topTicked(path)
    if (top === null) return []
    const ids = STAGES[path]
    const topAt = ids.indexOf(top)
    return tickedStages(path).filter(s => {
      const st = statsFor(path, s)
      return ids.indexOf(s) < topAt && st !== null && solid(st)
    })
  }

  /**
   * How much each ticked stage of ONE path is worth against its siblings.
   *
   * These are renormalised within the path by the caller, which is the whole
   * architecture of this draw: whatever happens here — a mercy run collapsing
   * everything onto the bottom rung, a retirement taking two stages to zero —
   * the path's share of maths is unchanged, because the numbers below only
   * ever decide WHICH rung of a path is dealt and never HOW OFTEN the path is.
   * That is what keeps JT-010(1) safe from all of it.
   *
   * A MERCY RUN outranks everything: the bottom rung, alone, until the run is
   * spent. A SETTLED stage is worth a whisper until the session's budget is
   * gone and nothing after that, which is the retirement.
   *
   * THE FALLBACK IS NOT OPTIONAL. A path whose every ticked stage has gone to
   * zero — all settled, budget spent — must still be dealable, so everything
   * goes back to 1. The child is never dealt nothing.
   */
  const stageWeights = (path: Path, stages: number[]): number[] => {
    if ((mercyLeft.get(path) ?? 0) > 0) return stages.map((_, i) => (i === 0 ? 1 : 0))
    const settled = new Set(settledOn(path))
    const spent = (whispered.get(path) ?? 0) >= WHISPER_PER_SESSION
    const out = stages.map(s => (settled.has(s) ? (spent ? 0 : WHISPER_WEIGHT) : 1))
    return out.some(w => w > 0) ? out : stages.map(() => 1)
  }

  return {
    levelFor(path) {
      return tickedStages(path)
    },

    pick(path, roll) {
      const set = this.levelFor(path)
      if (!set.length) return null
      // Clamped because an rng contract of [0,1) is a contract, not a
      // guarantee, and dealing `undefined` to a generator is unrecoverable.
      const i = Math.min(set.length - 1, Math.max(0, Math.floor(roll() * set.length)))
      return set[i] as number
    },

    dealMaths(roll) {
      /*
       * ONE POOL ACROSS BOTH PATHS, which is Joe's answer read literally and
       * his worked example proves the reading: *"one easy sum, one easy sub
       * and one medium sum, is 2/3 sum 1/3 sub."* Three ticked stages, two of
       * them sums. He was shown the drift this causes — ticking another sum
       * rung quietly cuts subtraction's share — and chose it, because the
       * ladder is what corrects it: *"as soon as sub becomes proficient for the
       * next level, the next triggers and the share is 1:1 again."*
       *
       * THE POOL AND ITS ORDER ARE UNCHANGED; what was a uniform index is now
       * a cumulative walk over the same entries, and with every weight equal
       * the two are the same selection down to the last boundary case. That is
       * deliberate — it means the mechanisms below are additions to this draw
       * and not a replacement of it, and that Joe's ruling is still the thing
       * being computed when nothing else has anything to say.
       */
      const pool: Array<{ path: Path; stage: number }> = []
      const weights: number[] = []
      const byPath = pathWeights()
      for (const path of MATHS_PATHS) {
        const stages = this.levelFor(path)
        if (!stages.length) continue
        /*
         * RENORMALISED WITHIN THE PATH, and this one line is the guarantee.
         *
         * Each path's stage weights are divided by their own sum before the
         * path weight multiplies them, so every path contributes exactly its
         * `pathWeight` to the total no matter what the stage layer did. A
         * mercy run, a retirement, a stage at zero: none of them can move the
         * sum-versus-subtraction share by so much as a rounding error, which
         * is how JT-010(1) survives two mechanisms that had to reach into the
         * same draw.
         */
        const stage = stageWeights(path, stages)
        const total = stage.reduce((n, w) => n + w, 0)
        const share = byPath.get(path) ?? stages.length
        for (let k = 0; k < stages.length; k++) {
          pool.push({ path, stage: stages[k] as number })
          weights.push(share * (stage[k] as number) / total)
        }
      }
      if (!pool.length) return null

      /*
       * ONE ROLL, SPENT EXACTLY WHERE THE UNIFORM DRAW SPENT IT.
       *
       * A cumulative walk rather than a rejection loop, because the island's
       * rng is a single shared sequence and a draw whose COST depends on its
       * outcome would shift every downstream number by an amount nobody can
       * predict from the test. With every weight equal this reduces exactly to
       * the `floor(roll() * n)` it replaces — the weights are then all 1, the
       * total is n, and the first cumulative sum above `roll() * n` is at
       * index `floor(roll() * n)` — so every test written against the uniform
       * draw is still a test of this one.
       *
       * Clamped at both ends as before: an rng contract of [0,1) is a
       * contract, not a guarantee, and dealing `undefined` to a generator is
       * unrecoverable. Zero-weight entries are skipped outright so that a
       * below-range roll cannot land on a stage the weights had retired.
       */
      const totalWeight = weights.reduce((n, w) => n + w, 0)
      const target = roll() * totalWeight
      let i = weights.reduce((last, w, k) => (w > 0 ? k : last), pool.length - 1)
      let seen = 0
      for (let k = 0; k < weights.length; k++) {
        seen += weights[k] as number
        if ((weights[k] as number) > 0 && seen > target) { i = k; break }
      }
      const drawn = pool[i] as { path: Path; stage: number }

      /*
       * THE PROBE RIDES ON THE DRAW, it does not replace it.
       *
       * The uniform draw above is Joe's JT-010(1) and stays exactly as it was;
       * the probe then takes one round in eight (runA.md:229) and swaps the
       * STAGE for the rung above — same path, so the share of maths is
       * untouched and a probe cannot quietly hand them subtraction they have
       * not been offered. `probeWanted` is asked FIRST so a path with nothing
       * to probe does not consume a roll it has no use for: the island's rng
       * is a shared sequence and spending from it invisibly is how a
       * deterministic test stops being deterministic.
       *
       * A MERCY RUN SILENCES THE PROBE on its own path, and it has to: the
       * run exists because three answers in a row went wrong, and answering
       * that by slipping them a question from the rung ABOVE would be the
       * island making a bad ten minutes worse. Asked before `probeWanted` and
       * so it spends no roll either.
       */
      const mercy = (mercyLeft.get(drawn.path) ?? 0) > 0
      if (!mercy && this.probeWanted(drawn.path) && roll() < PROBE_RATE) {
        const target = nextStage(drawn.path)
        if (target !== null) return { path: drawn.path, stage: target, probe: true }
      }
      return { path: drawn.path, stage: drawn.stage, probe: false }
    },

    dealReading(pageIndex) {
      const wanted = pageKind(pageIndex)
      /*
       * THE TICKBOX IS A CAPABILITY, THE MIX IS A PREFERENCE. Where they
       * disagree the tickbox wins and the mix chooses among what is left —
       * the other way round would let a data file overrule a parent's
       * statement that their child cannot do a thing yet.
       */
      if (this.levelFor(READING_PATH_OF[wanted]).length) return wanted
      const other: PageKind = wanted === 'find' ? 'build' : 'find'
      return this.levelFor(READING_PATH_OF[other]).length ? other : null
    },

    canUntick(path, stage) {
      if (!live(path) || !statsFor(path, stage)?.ticked) return false
      /*
       * Joe, JT-010(3): *"prevent unticking the last tick on each path."*
       *
       * Read as the DEAL MOMENT rather than the single path, and his own
       * earlier card is why. JT-007 has him ticking `takingAway 1` to try it
       * and says in terms that *"untick is a parent's hand, not a demotion, so
       * it is safe to try"* — a literal per-path guard would make that tick
       * permanent the instant he made it, which is the opposite of safe to
       * try. The harm he was actually shown is a child tapping a plot, or an
       * egg, and finding nothing there. So a MOMENT always keeps one ticked
       * stage, and inside a moment either path may go empty: reading off with
       * building on is a coherent thing for a parent to want, and the egg
       * still hatches.
       */
      const moment: readonly Path[] =
        (MATHS_PATHS as readonly Path[]).includes(path) ? MATHS_PATHS : READING_PATHS
      const ticked = moment.reduce((n, p) => n + this.levelFor(p).length, 0)
      return ticked > 1
    },

    setTicked(path, stage, ticked) {
      const st = live(path) && STAGES[path]?.includes(stage)
        ? statsFor(path, stage) : null
      if (!st) return false
      if (st.ticked === ticked) return true
      if (!ticked && !this.canUntick(path, stage)) return false
      st.ticked = ticked
      return true
    },

    setMode(path, mode) {
      const p = live(path) ? state[path] : undefined
      if (!p) return false
      p.mode = mode
      return true
    },

    dealt(path, stage, probe = false) {
      const real = live(path) && statsFor(path, stage) !== null
      current = real ? { path, stage, probe } : null
      if (!real) return

      /*
       * THE TWO SESSION BUDGETS ARE SPENT HERE, at the moment something is
       * actually put in front of them, and not at the moment it was chosen.
       * `dealMaths` may be called speculatively, and a run that drained itself
       * on questions nobody asked would be a mercy they never received.
       *
       * A mercy item is not a whisper even when the bottom rung happens to be
       * a settled one: the run put them there, so charging the whisper budget
       * for it would retire a stage they were sent to for comfort. A PROBE is
       * never a whisper either, and needs no test of its own for it: a probe
       * is always on the rung ABOVE the top ticked one, and a settled stage is
       * always below it.
       */
      const left = mercyLeft.get(path) ?? 0
      if (left > 0) { mercyLeft.set(path, left - 1); return }
      if (settledOn(path).includes(stage)) {
        whispered.set(path, (whispered.get(path) ?? 0) + 1)
      }
    },

    recordAttempt(evt) {
      if (!current) return
      const st = statsFor(current.path, current.stage)
      if (!st) return

      /*
       * THE MERCY COUNTER, and it counts every answer they gave — probes
       * included, which is the one place this file lets a probe touch
       * anything outside its own ring.
       *
       * It is not an inconsistency: the rule that a probe moves no stat is
       * about the RECORD, and about a wrong answer on a rung nobody has given
       * them permanently marking that rung. This counter is not a record of
       * anything. It is a count of how the last few minutes have felt, it is
       * gone when the tab closes, and from where they are sitting three
       * wrong in a row is three wrong in a row whether or not the island
       * privately labelled one of them a taste of the next rung.
       */
      if (evt.correct) wrongRun.set(current.path, 0)
      else {
        const n = (wrongRun.get(current.path) ?? 0) + 1
        if (n >= MERCY_TRIGGER) {
          wrongRun.set(current.path, 0)
          mercyLeft.set(current.path, MERCY_RUN)
        } else wrongRun.set(current.path, n)
      }

      /*
       * A DAY THEY PLAYED, counted once, for every path at once.
       *
       * The cooldown is measured in sessions and a session is a day the island
       * was open — not a day they happened to work on the declining path. It
       * has to be all paths, because `takingAway` before its introduction has
       * nothing ticked and therefore records no attempts at all: counted
       * per-path, a declined introduction would never come round again.
       *
       * Read off `now()` below rather than from a clock of its own. One
       * calendar read in this module was the point of the `dayKey` import.
       */
      const at = now()
      const date = dayKey(at)
      for (const path of LIVE_PATHS) {
        const o = state[path]?.offer
        if (!o || o.declinedDay === null) continue
        if (o.lastCountedDay === date) continue
        if (o.lastCountedDay !== null) o.daysSinceDecline++
        o.lastCountedDay = date
      }

      /*
       * A PROBE IS NOT AN ATTEMPT ON THE STAGE IT PROBES. It touches its own
       * ring and nothing else — see `StageStats.probes` for the two fields
       * that would be permanently damaged if it did otherwise, and for why
       * brief §19's *"wrong answers cost nothing"* is the rule being kept.
       */
      if (current.probe) {
        ring(st.probes, evt.correct ? 1 : 0, PROBE_RING)
        return
      }

      st.attempts++
      const score = evt.correct ? 1 : 0
      st.ewma = st.ewma === null ? score : st.ewma + EWMA_ALPHA * (score - st.ewma)

      /*
       * Correct-only, because A6 takes a correct-only median and a wrong
       * attempt's latency is a different measurement rather than an unused
       * one: a child who taps instantly and wrongly would otherwise read fast.
       * Null means they tapped before the prompt was ever put, which is not a
       * time at all.
       */
      if (evt.correct && evt.latencyMs !== null) {
        ring(st.latencies, evt.latencyMs, LATENCY_RING)
        if (st.early.length < EARLY_SAMPLE) st.early.push(evt.latencyMs)
      }

      const last = st.sessions[st.sessions.length - 1]
      if (last && last.date === date) {
        last.total++
        if (evt.correct) last.correct++
      } else {
        st.sessions.push({ date, correct: score, total: 1 })
        if (st.sessions.length > SESSION_KEEP) {
          st.sessions.splice(0, st.sessions.length - SESSION_KEEP)
        }
      }

      if (evt.rescued) ring(st.rescues, at, RESCUE_RING)
    },

    noteRescue(path) { if (live(path)) rescuedIn.add(path) },
    rescuedThisSession(path) { return rescuedIn.has(path) },

    settledStages(path) { return settledOn(path) },

    /* ------------------------------------------------ Run B, live and headless */

    probeWanted(path) {
      if (!auto(path)) return false
      const top = topTicked(path)
      if (top === null || nextStage(path) === null) return false
      const st = statsFor(path, top)
      return st !== null && st.ewma !== null && st.ewma >= PROBE_FROM_EWMA
    },

    offerDue(path) {
      const due = this.pendingOffer()
      return due !== null && due.path === path
    },

    pendingOffer() {
      const today = dayKey(now())

      /*
       * ONE OFFER A SESSION, ISLAND-WIDE (runA.md:230). The cadence is stored
       * per path because a decline is about a path, but the LIMIT is about the
       * child: two questions in one sitting is a sales pitch, and the second
       * one is the one they say yes to just to make it stop.
       */
      if (LIVE_PATHS.some(p => state[p]?.offer.lastOfferDay === today)) return null

      /*
       * TAKING AWAY GOES FIRST, and it is gated on `sums` 1 ALONE.
       *
       * Fable's ruling, and the shape of the path is the argument for it:
       * `takingAway` starts with nothing ticked (STARTS_TICKED above), so it
       * has no rung to probe FROM and can never accumulate a probe ring of its
       * own. Something else has to speak for it, and the only honest witness
       * is the addition it is the mirror of — so the mastery half of the gate
       * runs on `sums` 1 and the probe clause is DROPPED rather than faked.
       *
       * REJECTED: dealing subtraction probes before the path is open. That
       * ambushes a five-year-old with a minus sign nobody has introduced, and
       * it spends the debut runA.md:234-236 is explicit about — *"dealt MIXED
       * with the minus sign popping on debut"* — on a question they were given
       * by accident. The debut has to still be a debut.
       *
       * REJECTED: waiting for `sums` 2. Joe's own worked example in JT-010 —
       * *"one easy sum, one easy sub and one medium sum, is 2/3 sum 1/3 sub"*
       * — has subtraction arriving ALONGSIDE the second sum rung, not queued
       * behind it. Gating on sums 2 would make his three-stage example a state
       * the island can only reach by his hand.
       *
       * It wins the tie because only one offer may be made and this one is the
       * larger event: a whole new kind of maths, against one rung more of the
       * kind they are already doing.
       */
      const sums1 = statsFor('sums', 1)
      if (
        auto('takingAway') && statsFor('takingAway', 1)?.ticked === false
        && cadenceOk('takingAway', today) && sums1 !== null && solid(sums1)
      ) {
        return { path: 'takingAway' as Path, stage: 1, kind: 'takingAway' as const }
      }

      /* The same-path offer: *"trickier questions"* on a rung they have earned. */
      for (const path of MATHS_PATHS) {
        if (!auto(path) || !cadenceOk(path, today)) continue
        const top = topTicked(path)
        const target = nextStage(path)
        if (top === null || target === null) continue
        const src = statsFor(path, top)
        const tgt = statsFor(path, target)
        if (!src || !tgt || !solid(src) || !probesPass(tgt)) continue
        return { path: path as Path, stage: target, kind: 'trickier' as const }
      }
      return null
    },

    noteOffer(path, accepted) {
      /*
       * RESOLVED AGAINST THE OFFER THAT WAS ACTUALLY DUE, never against the
       * arguments alone. A surface that answers an offer the harness is not
       * making — a stale overlay, a double tap, a replayed event — must not be
       * able to tick a stage, because a tick is the one thing here that
       * changes what a child is given.
       */
      const due = this.pendingOffer()
      if (!due || due.path !== path) return
      const rec = state[path]
      if (!rec) return
      const o = rec.offer
      const today = dayKey(now())

      if (accepted) {
        this.setTicked(path, due.stage, true)
        rec.honeymoonFrom = today
      } else {
        /*
         * A DECLINE COSTS NOTHING (runA.md:231). Nothing is unticked, nothing
         * is recorded against them, no stat moves: the island simply stops
         * asking for two sessions. Auto may only ever tick (runA.md:240), and
         * that is true of a refusal as much as of a collapse in accuracy.
         */
        o.declinedDay = today
        o.daysSinceDecline = 0
        o.lastCountedDay = today
      }
      o.lastOfferDay = today
    },

    honeymoonActive(path) {
      /*
       * *"2 sessions"* counted the way the cooldown is: days they were here.
       * The acceptance day itself is the first, so a child who accepts and
       * plays on gets the rest of that sitting and the next one.
       *
       * A MARKER ONLY — this says WHEN, and the pay-3 with the frozen cost
       * index that reads it belongs to the next slice, in `balance/`.
       */
      const from = live(path) ? state[path]?.honeymoonFrom : null
      if (!from) return false
      const days = new Set<string>()
      for (const s of STAGES[path]) {
        for (const rec of statsFor(path, s)?.sessions ?? []) {
          if (rec.date >= from) days.add(rec.date)
        }
      }
      return days.size <= HONEYMOON_SESSIONS
    },
  }
}
