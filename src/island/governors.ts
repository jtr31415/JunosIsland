/**
 * The governors (slice-1 spec §5).
 *
 * They keep the two halves of the loop in step: an island of empty land with
 * no friends on it, or a queue of friends with nowhere to live, are both
 * failures of pacing rather than of the child.
 *
 * Three rules make them acceptable under the guardrails:
 *   1. They are INVITATIONS, never lockouts. Nothing greys out; Fred asks for
 *      the other thing instead, and the child may ignore him.
 *   2. They are SYMMETRIC. Too much land pauses land; too many waiting pets
 *      pauses eggs. Neither half is privileged.
 *   3. They never fire in the first ten minutes, because a child still
 *      learning what the buttons do must never be told "not that one".
 *
 * Work already in progress always finishes — a plot mid-build completes.
 *
 * THERE IS NOW A THIRD, and it reads the CHILD rather than the island. See
 * `createBreakWatch` at the foot of this file.
 */
import type { Flow } from './flow'
import { balance } from './balance'
import { sockets } from './world/grid'

/** The two governors that read the ISLAND's state. `activeGovernor` answers. */
export type Governor = 'none' | 'space-surplus' | 'nursery-queue'

/**
 * Every nudge Fred has, including the one that is not a function of the island.
 *
 * `wriggle-break` cannot come out of `activeGovernor`, because nothing in
 * `Flow` records how the last few minutes went — deliberately, since a run of
 * struggle is a fact about a sitting and must not be persisted and served back
 * to her tomorrow. It is watched separately (`createBreakWatch`) and delivered
 * through the same want-framed channel, which is why it shares this table.
 */
export type Nudge = Exclude<Governor, 'none'> | 'wriggle-break'

/** Fred's line for each. Want-framed: what to do next, never what is barred. */
export const GOVERNOR_LINE: Record<Nudge, string> = {
  /*
   * Joe: *"'lets read some friends home first' sounds aweful. lets put it as
   * 'Lets read with the egg to get some more friends'"*.
   *
   * He is right, and the reason is worth keeping: "read some friends home" uses
   * the world-law vocabulary as if the child already shares it, which reads as
   * whimsy rather than instruction. The new line names the OBJECT she has to tap
   * — the egg — so it tells her what to do rather than describing what will
   * happen. Kept want-framed, and the apostrophe is deliberate in a reading game.
   */
  'space-surplus': "Let's read with the egg to get some more friends!",
  'nursery-queue': 'They need homes first!',

  /*
   * Joe: *"we have a button mash guard, but repeated mashing on successive
   * pages should lead to a suggestion for a break or to get up, run around for
   * a minute and then come back."*
   *
   * FRED OWNS THE NEED FOR IT, and that is the whole design of the sentence.
   * Brief §19 forbids shame, and a six-year-old will read any line about her
   * own performance as a report on it — "shall we have a rest?" after nine
   * wrong taps is a scoreboard with a kind voice. So the line does not mention
   * her, her answers, or the work. It is Fred's legs that have gone wriggly,
   * and she is being invited along.
   *
   * Want-framed like the other two: it names what to do next (jump up, run
   * about) and bars nothing. And the last clause is brief §19 said out loud —
   * her island will be right here, because nothing here expires, locks or is
   * taken back while she is away.
   */
  'wriggle-break': "Ooh, my legs have gone all wriggly! Let's jump up and have a run about — then come back, your island will be right here.",
}

/**
 * The island is still new. Governors stay silent for the opening stretch so a
 * child learning the loop is never redirected (§5).
 */
export function inGracePeriod(f: Flow): boolean {
  return f.pets.length < 2 && f.island.tiles.size < 4
}

/** Empty habitable land beyond what the current pets need. */
export function spaceSurplus(f: Flow): number {
  // Every owned grass tile is somewhere a pet could live.
  let habitable = 0
  for (const type of f.island.tiles.values()) if (type === 'grass') habitable++
  return habitable - f.pets.length
}

/**
 * Which governor, if any, currently applies.
 *
 * Returns what should PAUSE, not what is forbidden: the caller turns this
 * into an invitation.
 */
export function activeGovernor(f: Flow): Governor {
  if (inGracePeriod(f)) return 'none'
  if (spaceSurplus(f) >= balance.governor.maxEmptySurplus) return 'space-surplus'
  // A pet with nowhere of its own to be is "waiting". Until habitats land in
  // M2, that means more pets than habitable tiles.
  const waiting = f.pets.length - Math.max(0, spaceSurplus(f) + f.pets.length)
  if (waiting >= balance.governor.maxWaitingPets) return 'nursery-queue'
  return 'none'
}

/** May the child start a NEW plot right now? A plot mid-build always finishes. */
export const landPaused = (f: Flow): boolean =>
  activeGovernor(f) === 'space-surplus' && f.plot === null

/** May a new egg be worked on right now? */
export const eggsPaused = (f: Flow): boolean =>
  activeGovernor(f) === 'nursery-queue'

/** Sockets available to build on, for the surplus calculation and the UI. */
export const openSockets = (f: Flow): number => sockets(f.island).length

/* ------------------------------------------------------------------------- *
 * The third governor: a run of struggle, across pages.
 * ------------------------------------------------------------------------- */

/**
 * How many wrong taps on ONE page count as a mash.
 *
 * THREE, because that is already the number: `wordFind.ts`, `build.ts` and
 * `sum.ts` each summon their own help at three wrongs (brief §19, "three
 * stumbles summon help"), and it is field-tested on the child this is for. A
 * different number here would mean two definitions of "mashing" in one game,
 * and the wrong one would be the one nobody had watched her hit.
 */
export const MASH_WRONGS = 3

/**
 * How many mashed pages IN A ROW earn the suggestion.
 *
 * THREE, and the reasoning is about what each number can mean:
 *
 *   - One is already handled. The per-page rescue fires, the word comes back
 *     slowly or the counting dots open, and most of the time that is the end
 *     of it. Suggesting a break there would be answering a stumble with an
 *     exit.
 *   - Two is a coincidence you can name: one awkward word and one sum that
 *     crossed ten. Reading pages alternate find and build, so two in a row are
 *     often not even the same skill.
 *   - Three is a pattern. Nine wrong taps across three consecutive pages, with
 *     three rescues already spent and none of them landing, is no longer about
 *     the phonics — it is a child whose problem is her body, and Joe's answer
 *     (get up, run around, come back) is the right one.
 *
 * It also cannot fire inside Fred's story, which is worth knowing rather than
 * special-casing: the opening hands over exactly one page before it resumes, so
 * a beginner's first exploratory taps can only ever reach a streak of one.
 */
export const MASH_PAGES = 3

/**
 * Watches for a run of struggle across successive pages.
 *
 * Deliberately has no clock, no storage and no timers — see the guarantees on
 * `pageEnded`. It counts taps and pages, and that is all it can do.
 */
export interface BreakWatch {
  /** A wrong answer landed on the page in progress (`ChallengeDeps.onWrong`). */
  wrong(): void
  /** A fresh page is on screen. Its tally starts at nothing. */
  pageStarted(): void
  /**
   * The page in progress has ended, however it ended.
   *
   * Returns true exactly once per run of struggle: on the page that completes
   * `MASH_PAGES` mashed pages in a row. Returning true is a SUGGESTION and
   * nothing else — it locks nothing, spends nothing and cannot expire, because
   * there is nothing here for a timer to be attached to.
   */
  pageEnded(): boolean
  /** How many mashed pages in a row so far. For tests and diagnostics. */
  streak(): number
}

/**
 * The reset rule, which is the other half of the threshold.
 *
 * A page she got through with FEWER than `MASH_WRONGS` wrongs clears the streak
 * outright. Two reasons, and both matter more than the counting:
 *
 *   - What is being detected is a RUN. A page that went well is evidence the
 *     wobble has passed, and carrying a stale count forward would land the
 *     suggestion in the middle of a good spell — which reads as the game
 *     keeping score on her rather than noticing her.
 *   - "Clean" here means "not mashed", not "perfect". One or two wrong taps is
 *     ordinary learning and must never count against her; a rule that let them
 *     accumulate would eventually suggest a break to a child who is doing fine.
 *
 * The streak also resets when the suggestion is made, so a rough patch earns
 * one invitation rather than one after every page from there on.
 */
export function createBreakWatch(): BreakWatch {
  let wrongsThisPage = 0
  let mashedPages = 0

  return {
    wrong: () => { wrongsThisPage++ },
    pageStarted: () => { wrongsThisPage = 0 },
    pageEnded: () => {
      const mashed = wrongsThisPage >= MASH_WRONGS
      wrongsThisPage = 0
      if (!mashed) { mashedPages = 0; return false }
      if (++mashedPages < MASH_PAGES) return false
      mashedPages = 0
      return true
    },
    streak: () => mashedPages,
  }
}
