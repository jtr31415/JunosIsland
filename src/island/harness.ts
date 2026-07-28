/**
 * The harness (Run A, item A3): the island's single choke point for policy.
 *
 * WHAT IT IS FOR. Before this, the level a generator was asked for was a
 * literal in `main.ts` — `level: 1` on the reading deps, `1` in the `dealSum`
 * call — and every outcome a child produced was computed by `attempts.ts` and
 * dropped on the floor, because nothing was listening. This module is both
 * ends of that: what she may be dealt, and what happened when she was.
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
  sums: [1, 2],
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
  /** May she be dealt this? The whole of the capability model. */
  ticked: boolean
  attempts: number
  /**
   * Exponentially weighted accuracy, α .15. Null until the first attempt.
   *
   * Seeded with the first answer rather than with zero. A stage seeded at zero
   * says a child who has got everything right is at .15, which is a statement
   * about the seed and not about her.
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
  /** The last 6 days she worked on this stage. */
  sessions: SessionRecord[]
  /** The last 10 rescue timestamps. */
  rescues: number[]
  /**
   * The last 12 PROBE outcomes on this stage, 1 correct / 0 wrong.
   *
   * A ring of its own, and nothing a probe does may leak into the fields
   * above it. Run B (runA.md:227-229) gates promotion on *"probe accuracy
   * ≥ .70 over ≥ 8"*, and the stage being probed is one she has never been
   * taught — so the probe is a QUESTION ABOUT READINESS and not a record of
   * her work. Two of those fields would be actively damaged by it:
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
 * sessions. `daysSinceDecline` counts DAYS SHE PLAYED rather than days on the
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
 * here, is that the zeroes are the STATS and the ticks are what she is already
 * playing. `takingAway` is NOT among them: the island has never dealt a
 * subtraction, and starting one on the strength of a migration would be handing
 * a child new work that nobody decided to give her. JT-007 is Joe ticking it
 * himself, deliberately, which is the right way for it to arrive.
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
   * The ticks are repaired and the STATS are not: measurement is the record of
   * what she has actually done, and nothing about a broken tickbox makes it
   * untrue.
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
   * both paths go in one pool and the draw is uniform over it, so the share is
   * a consequence of the ladder rather than a number anybody sets.
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
   * The one offer to put to her right now, or null.
   *
   * The single question the offer surface asks, so it must be complete on its
   * own: the cadence, the cooldown, the gate and the ordering between B's two
   * offers are all resolved before it answers.
   */
  pendingOffer(): Offer | null
  /**
   * She was asked, and this is what she said.
   *
   * Accept ticks the target and stamps the honeymoon; decline costs her
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
   * What the last deal handed her.
   *
   * Null until something is dealt, and an attempt arriving against null is
   * DROPPED rather than guessed at. The overlay's tally outlives a single
   * round, so a mis-wire that attributed stray attempts to whatever was dealt
   * last would corrupt a stage quietly — which is the one failure a
   * measurement system must not have, because its output is a parent deciding
   * what his daughter can do.
   */
  let current: { path: Path; stage: number; probe: boolean } | null = null

  /** Transient rescue memory, per path. Deliberately not in `state`. */
  const rescuedIn = new Set<Path>()

  const statsFor = (path: Path, stage: number): StageStats | null =>
    state[path]?.stages[stage] ?? null

  const live = (path: Path): boolean =>
    (LIVE_PATHS as readonly string[]).includes(path)

  /* --------------------------------------------------------- Run B's reads */

  /** The top rung she is allowed, which is the one the gate judges. */
  const topTicked = (path: Path): number | null => {
    if (!live(path)) return null
    const set = STAGES[path].filter(s => statsFor(path, s)?.ticked === true)
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
   * because a rescue is only evidence about the days she was actually here.
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

  return {
    levelFor(path) {
      if (!live(path)) return []
      const stages = state[path]?.stages ?? {}
      /*
       * Driven by the STAGE TABLE, not by the keys of the save. A hand-edited
       * file, a rolled-back build or a future stage id are all untrusted input
       * and none of them may reach a generator that cannot render them.
       */
      return STAGES[path].filter(s => stages[s]?.ticked === true)
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
       */
      const pool: Array<{ path: Path; stage: number }> = []
      for (const path of MATHS_PATHS) {
        for (const stage of this.levelFor(path)) pool.push({ path, stage })
      }
      if (!pool.length) return null
      const i = Math.min(pool.length - 1, Math.max(0, Math.floor(roll() * pool.length)))
      const drawn = pool[i] as { path: Path; stage: number }

      /*
       * THE PROBE RIDES ON THE DRAW, it does not replace it.
       *
       * The uniform draw above is Joe's JT-010(1) and stays exactly as it was;
       * the probe then takes one round in eight (runA.md:229) and swaps the
       * STAGE for the rung above — same path, so the share of maths is
       * untouched and a probe cannot quietly hand her subtraction she has not
       * been offered. `probeWanted` is asked FIRST so that a path with nothing
       * to probe does not consume a roll it has no use for: the island's rng
       * is a shared sequence and spending from it invisibly is how a
       * deterministic test stops being deterministic.
       */
      if (this.probeWanted(drawn.path) && roll() < PROBE_RATE) {
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
       * statement that his daughter cannot do a thing yet.
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
      current = live(path) && statsFor(path, stage) ? { path, stage, probe } : null
    },

    recordAttempt(evt) {
      if (!current) return
      const st = statsFor(current.path, current.stage)
      if (!st) return

      /*
       * A DAY SHE PLAYED, counted once, for every path at once.
       *
       * The cooldown is measured in sessions and a session is a day the island
       * was open — not a day she happened to work on the declining path. It
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
       * Null means she tapped before the prompt was ever put, which is not a
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
       * one is the one she says yes to just to make it stop.
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
       * with the minus sign popping on debut"* — on a question she was given
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
       * kind she is already doing.
       */
      const sums1 = statsFor('sums', 1)
      if (
        auto('takingAway') && statsFor('takingAway', 1)?.ticked === false
        && cadenceOk('takingAway', today) && sums1 !== null && solid(sums1)
      ) {
        return { path: 'takingAway' as Path, stage: 1, kind: 'takingAway' as const }
      }

      /* The same-path offer: *"trickier questions"* on a rung she has earned. */
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
         * is recorded against her, no stat moves: the island simply stops
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
       * *"2 sessions"* counted the way the cooldown is: days she was here.
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
