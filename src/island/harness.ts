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
 * Run B surface — `probeWanted`, `offerDue`, `noteOffer` — is declared and
 * inert, pinned so by tests, so B's shape is fixed while A4–A6 are built
 * against it and no half-wired probe can start dealing extra questions.
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
}

export interface PathAttainment { mode: Mode; stages: Record<number, StageStats> }
export type Attainment = Record<Path, PathAttainment>

const LATENCY_RING = 30
const EARLY_SAMPLE = 10
const SESSION_KEEP = 6
const RESCUE_RING = 10
/** How fast one answer moves the accuracy estimate. A5's constant. */
export const EWMA_ALPHA = 0.15

/**
 * What a stage looks like before anything has happened on it.
 *
 * Honest zeroes: nothing is invented for work nobody has watched. A stage with
 * no attempts reads as unpractised, which is why A6 shows dashes rather than a
 * tier until there is enough to say something true.
 */
const freshStage = (ticked: boolean): StageStats => ({
  ticked, attempts: 0, ewma: null,
  latencies: [], early: [], sessions: [], rescues: [],
})

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
    out[path] = { mode: 'auto', stages }
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
  dealMaths(roll: Roll): { path: Path; stage: number } | null
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
  /** What was just dealt, so the attempts that follow have somewhere to go. */
  dealt(path: Path, stage: number): void
  /** An attempt resolved. Attributed to the last `dealt`. */
  recordAttempt(evt: AttemptEvent): void
  /** A rescue fired on this path. In-session only; never persisted. */
  noteRescue(path: Path): void
  rescuedThisSession(path: Path): boolean
  /* Declared for Run B, inert in Run A. Tests assert the inertness. */
  probeWanted(path: Path): boolean
  offerDue(path: Path): boolean
  noteOffer(path: Path, accepted: boolean): void
}

/** Local YYYY-MM-DD. A session is a day in the child's own timezone. */
function dayKey(at: number): string {
  const d = new Date(at)
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0')
}

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
  let current: { path: Path; stage: number } | null = null

  /** Transient rescue memory, per path. Deliberately not in `state`. */
  const rescuedIn = new Set<Path>()

  const statsFor = (path: Path, stage: number): StageStats | null =>
    state[path]?.stages[stage] ?? null

  const live = (path: Path): boolean =>
    (LIVE_PATHS as readonly string[]).includes(path)

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
      return pool[i] as { path: Path; stage: number }
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

    dealt(path, stage) {
      current = live(path) && statsFor(path, stage) ? { path, stage } : null
    },

    recordAttempt(evt) {
      if (!current) return
      const st = statsFor(current.path, current.stage)
      if (!st) return

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

      const at = now()
      const date = dayKey(at)
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

    /*
     * Run B's surface. Inert by construction rather than by a flag: there is
     * no policy here to switch off, so nothing can half-fire while A4–A6 are
     * built. `noteOffer` takes its arguments so B's call sites compile today
     * and change behaviour rather than shape when B lands.
     */
    probeWanted() { return false },
    offerDue() { return false },
    noteOffer() { /* Run B */ },
  }
}
