/**
 * The grown-ups report (Run A, item A6): what a stage's numbers are willing to
 * say out loud.
 *
 * WHAT IT IS FOR. The harness has been recording since A3 — attempts, an EWMA,
 * a ring of correct latencies, the first ten of them frozen, the last six days,
 * the last ten rescues. None of that is a sentence a parent can read. This
 * module is the translation, and it is the whole of it: three measures per
 * stage, each of them a tier word and a count of filled dots, plus the two
 * plain facts (how many attempts, when they last worked on it) that stop the
 * tiers from being the only thing on the page.
 *
 * IT IS PURE, AND THAT IS THE POINT. No DOM, no clock of its own, no storage —
 * it takes a `StageStats` and returns a `StageReport`. The panel that draws
 * this is being built alongside it against the exported shape, and the reason
 * the split is worth having is that the rules below decide what a parent is
 * told about their child. Rules that decide that should be testable as rules,
 * at the boundary, without a browser in the way.
 *
 * THE HONESTY RULES ARE LOAD-BEARING. A6 asks for dashes rather than a tier
 * until there is enough to say something true — fifteen attempts for accuracy,
 * ten early latencies for speed, three sessions for consistency. A tier drawn
 * from four attempts is a statement about the sample, and the person reading it
 * would take it as a statement about a five-year-old. So `tier: null` is a
 * first-class answer here and not an error case, and every measure can return
 * it.
 *
 * NO VERDICTS BEYOND THE THREE WORDS. The spec is explicit: no colours as
 * verdict, no child-visible anything, strictly local. Nothing in here ranks a
 * child against anything except their own earlier self on the same stage.
 */
import { reportRules } from './balance'
import { dayKey } from '../platform/clock'
import type { Harness, Mode, Path, SessionRecord, StageStats } from './harness'

/**
 * The three soft words. Deliberately not good/better/best: a parent reads a
 * scale as a grade, and 'settling' has to be a fine thing for a child to be.
 */
export type Tier = 'settling' | 'steady' | 'solid'

/**
 * One measure, ready to draw.
 *
 * `filled` is carried alongside the tier rather than derived in the panel so
 * that the mapping from word to dots lives in exactly one place. `tier: null`
 * with `filled: 0` is "not enough yet" — the panel draws dashes.
 */
export interface Measure { tier: Tier | null; filled: number }

export interface StageReport {
  attempts: number
  /** YYYY-MM-DD of the newest session, or null if this stage was never worked. */
  lastActive: string | null
  accuracy: Measure
  speed: Measure
  consistency: Measure
}

/** The word for each tier, in one place, because the panel must not invent it. */
export const TIER_WORDS: Record<Tier, string> = {
  settling: 'settling',
  steady: 'steady',
  solid: 'solid',
}

/** How many of the three dots each tier fills. */
const FILLED: Record<Tier, number> = { settling: 1, steady: 2, solid: 3 }

const measure = (tier: Tier): Measure => ({ tier, filled: FILLED[tier] })

/**
 * Not enough to say anything. A fresh object every time rather than one shared
 * constant: these go out to a panel that may hold or adapt them, and a shared
 * literal that someone later writes through would corrupt every other stage's
 * report at once.
 */
const dashes = (): Measure => ({ tier: null, filled: 0 })

/**
 * The middle value, with the mean of the two middle values on an even count.
 *
 * MEDIAN AND NEVER MEAN, everywhere in this file. A child gets up mid-question,
 * or a butterfly goes past, and one latency comes back at four minutes. A mean
 * over a ring of thirty is dragged far enough by that one number to report a
 * child who has genuinely got faster as having got slower — and the parent
 * reading it has no way to know a butterfly caused it. The median does not
 * notice the butterfly at all, which is the only reason the speed measure is
 * trustworthy enough to show.
 */
function median(xs: readonly number[]): number | null {
  if (!xs.length) return null
  const sorted = [...xs].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  if (sorted.length % 2 === 1) return sorted[mid] as number
  return ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2
}

/**
 * Accuracy: the EWMA, banded.
 *
 * The estimate itself is the harness's (α .15, seeded with the first answer),
 * so all this does is decide where the bands fall. Dashes below the sample
 * floor, and dashes when there is no estimate at all — a null EWMA means
 * nothing has ever been answered here, and zero would be a lie about that.
 */
function accuracyOf(stats: StageStats): Measure {
  const r = reportRules()
  if (stats.attempts < r.samples.accuracy || stats.ewma === null) return dashes()
  if (stats.ewma >= r.accuracy.solid) return measure('solid')
  if (stats.ewma >= r.accuracy.steady) return measure('steady')
  return measure('settling')
}

/**
 * Speed: the recent correct-median against the stage's OWN early baseline.
 *
 * Against their own beginning and against nothing else — not another child, not
 * another stage, not a target time. A stage that is genuinely harder is slower
 * for everybody, and the only interesting question is whether the child is
 * pulling away from where they started on it.
 *
 * MECHANICAL CALL. The spec names one threshold — *"settling until trend
 * flattens ≥ 15% below baseline"* — and a three-tier scale needs two, so
 * `solid` at 30% is a chosen number. It lives in balance.json so that the first
 * month of real use can move it without a code change; nothing here would
 * change if it did.
 *
 * The `baseline <= 0` guard is not defensive noise. Early latencies come off a
 * save and a save is untrusted input, and a zero or negative baseline makes the
 * gain infinite or backwards. A nonsense baseline is not a verdict, so it reads
 * as "not enough yet" rather than as a child who has become infinitely fast.
 */
function speedOf(stats: StageStats): Measure {
  const r = reportRules()
  if (stats.early.length < r.samples.speed) return dashes()
  const baseline = median(stats.early)
  const recent = median(stats.latencies)
  if (baseline === null || recent === null || baseline <= 0) return dashes()
  const gain = (baseline - recent) / baseline
  if (gain >= r.speed.solid) return measure('solid')
  if (gain >= r.speed.steady) return measure('steady')
  return measure('settling')
}

/**
 * Consistency: is it holding up across days, unaided?
 *
 * The spec's definition is *"last 3 sessions each ≥ .75 AND no rescue in them
 * AND ≥ 2 distinct days"* — three conditions, one boolean. The three matter for
 * different reasons: the sessions say they can do it, the distinct days say it
 * survived a night's sleep rather than being one lucky afternoon, and the
 * absence of a rescue says they did it without the game quietly helping.
 *
 * MECHANICAL CALL. That definition is a boolean and this scale has three rungs,
 * so the middle one is a reading rather than the spec's word: accurate across
 * the window but short of a second day, or accurate but rescued, reads as
 * `steady`. It is the truthful thing to show — the work is there and the
 * evidence that it has settled is not yet — and both the window and the day
 * count are in balance.json so the reading can be retuned.
 *
 * The rescue check goes through `dayKey` from the platform clock rather than
 * through a local copy. There is already a second copy inside `harness.ts`, and
 * a third would be exactly the drift this repo has been bitten by: three
 * functions that agree until one of them is fixed.
 */
function consistencyOf(stats: StageStats): Measure {
  const r = reportRules()
  if (stats.sessions.length < r.samples.sessions) return dashes()

  const window: SessionRecord[] = stats.sessions.slice(-r.consistency.sessions)
  /*
   * `total > 0` is required and not implied: a session record with no attempts
   * in it makes correct/total a NaN, and NaN >= threshold is false, so the
   * comparison alone would already refuse it — but silently, and for the wrong
   * reason. Saying it out loud is what stops a later refactor from "fixing" the
   * NaN into a passing zero.
   */
  const accurateAll =
    window.every(s => s.total > 0 && s.correct / s.total >= r.consistency.session)
  const days = new Set(window.map(s => s.date))
  const noRescue = !stats.rescues.some(at => days.has(dayKey(at)))

  if (accurateAll && noRescue && days.size >= r.consistency.days) return measure('solid')
  return measure(accurateAll ? 'steady' : 'settling')
}

/**
 * Everything the panel shows for one stage.
 *
 * A never-worked stage is a perfectly ordinary input and comes back all dashes
 * with a null date — the panel has to render the row either way, and a stage
 * nobody has touched is the commonest thing in a fresh save.
 */
export function stageReport(stats: StageStats): StageReport {
  const last = stats.sessions[stats.sessions.length - 1]
  return {
    attempts: stats.attempts,
    lastActive: last ? last.date : null,
    accuracy: accuracyOf(stats),
    speed: speedOf(stats),
    consistency: consistencyOf(stats),
  }
}

/**
 * The "what Auto would do" line, per path (B2).
 *
 * A6 shipped this inert — it read *"watching"* whatever the island was about
 * to do — because the gate logic behind it was Run B's and only the line's
 * plumbing belonged to A. B's gate is live and headless now, so this is the
 * one place it becomes a sentence: the panel already draws the line, and what
 * changes here is what it says rather than where it goes.
 *
 * IT ASKS, IT NEVER DECIDES. Every branch below is a READ of the harness, and
 * the harness is the single choke point for all of this policy. A line that
 * re-derived "is a probe wanted" from the stats would be a second copy of the
 * gate, and the day the two disagreed the panel would be telling a parent
 * something about their child that the island was not doing.
 *
 * MOST SPECIFIC FIRST, and the order is the point:
 *
 *   1. A standing offer, because it is the only branch that names something
 *      that will happen to THEM, today, and which rung it is about.
 *   2. The honeymoon, which is above the mode check deliberately: it is a
 *      promise already made, and it goes on being kept for its two sessions
 *      even if a parent moves the path off Auto in the middle of it.
 *   3. Probes, which are the quiet thing Auto does between offers.
 *   4. Not on Auto at all — said last of the real answers, because a path on
 *      Hold or Manual reaches none of the branches above it anyway (the gate
 *      itself refuses a non-Auto path, JT-011(a)) and this is the plain-English
 *      version of that refusal rather than a second rule.
 *   5. `watching`, the A6 word, kept exactly as it was so that the commonest
 *      state on a fresh island is the one nothing about B has changed.
 *
 * The wording is for a PARENT and in the register of `TIER_WORDS`: lower case,
 * short, no exclamation. They are reading it to decide whether to leave the
 * island to it, and a line that shouted would be a line they stopped believing.
 *
 * `mode` is passed rather than read, because `Harness` exposes `setMode` and no
 * getter — the record is the panel's to read and the harness's to write.
 */
export function autoWouldDo(path: Path, h: Harness, mode: Mode): string {
  /*
   * ONE CALL, and the offer itself rather than `offerDue(path)`. The line has
   * to name the rung and tell B's two offers apart, which only the offer object
   * can do — and `offerDue` would resolve the whole gate a second time to
   * answer less.
   */
  const offer = h.pendingOffer()
  if (offer && offer.path === path) {
    return offer.kind === 'takingAway'
      ? 'offering taking away'
      : `offering the next step (stage ${offer.stage})`
  }
  if (h.honeymoonActive(path)) return 'going easy after a yes'
  if (h.probeWanted(path)) return 'slipping in a harder question now and then'
  if (mode !== 'auto') return `standing back while this path is on ${mode}`
  return 'watching'
}
