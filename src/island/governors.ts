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
 *
 *      THIS SENTENCE USED TO BE HALF FALSE, and PB-042 is the card that caught
 *      it. `activeGovernor` answered honestly, but both call sites in
 *      `interactions.ts` invited and then returned the flow unchanged — so
 *      nothing greyed out, nothing was taken away, and the tap could be
 *      repeated forever, yet the round she asked for never opened. Ignoring
 *      Fred was the one thing she could not do. Joe found it deployed, with
 *      Juno on it: *"erroneously forcing tile building"*.
 *      The override lives in `invite()` in `main.ts` and is asserted in
 *      `tests/island/interactions.test.ts`: Fred asks once, and the next tap
 *      on the same thing goes through. This file decides WHEN he asks; it has
 *      never been the thing that refused, and now nothing is.

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
import { balance, emptySteps, crowdedSteps } from './balance'
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

/**
 * The FEWEST fields this many pets can live on — the CROWDED wall, in fields.
 *
 * Two animals for every three tiles, 1.5 fields per pet. Below this the island
 * is overcrowded and Fred asks for maths.
 *
 * It used to mean the fields her pets WANT, a target that both walls hung off
 * at an absolute offset. JT-012 moved the target to 2.0 tiles per pet and put
 * the walls at 1.5 and 3.0, so this number is no longer a target at all — it is
 * one wall of the corridor, and the value happens to be unchanged. See
 * `balance.governor.corridor`, which is now where both walls are stated.
 */
export const fieldsWanted = (pets: number): number =>
  pets * balance.governor.corridor.crowded

/**
 * How many pets this much land can house before it is crowded — the same wall,
 * read from the other side.
 *
 * The mirror of `fieldsWanted`, and written as a mirror on purpose: one says the
 * least land these friends can live on, the other the most friends this land can
 * hold, and Fred asks for maths the moment she passes it.
 *
 * WHOLE PETS. It used to be `fields · 1.5`, a separate ratio for a separate
 * floor (PB-039), and the floor and the ceiling were two independent numbers.
 * JT-012 replaced both with ONE corridor, so this is now genuinely the inverse
 * of `fieldsWanted` and floors to a whole animal, because half an animal cannot
 * be housed or hatched.
 */
export const petsHoused = (fields: number): number =>
  Math.floor(fields / balance.governor.corridor.crowded)

/**
 * The fields a pet could actually stand on.
 *
 * FIELDS ONLY: not rock, which is land but cannot be stood on, and not water.
 *
 * Rock is land but it is not LODGING, and the distinction is deliberate rather
 * than an oversight — `isLand` is the right question for the coastline and the
 * wrong one here.
 *
 * A mountain hex is planted at the model's native size and centred, so the mound
 * covers its tile and `footprintBelow(WALKING_HEIGHT)` blocks very nearly the
 * whole hex. There is nowhere on it for a pet to stand. Counting it as room
 * would have the governor believe she has space she cannot use, and pets would
 * fail placement quietly — a silent failure rather than a visible shortage,
 * which is the worse of the two.
 *
 * The cost is that mountains do not advance the pet economy: a girl who builds a
 * range still gets asked to read. That is honest, but it is a pacing decision
 * Joe should see rather than infer — carded.
 */
export function habitableFields(f: Flow): number {
  let habitable = 0
  for (const type of f.island.tiles.values()) if (type === 'grass') habitable++
  return habitable
}

/**
 * Land beyond the crowded wall — how much room she has spare.
 *
 * IT IS NO LONGER A THRESHOLD. Until JT-012 the ceiling fired at
 * `spaceSurplus >= maxEmptySurplus`, an absolute offset from one ratio; the
 * ceiling is now the `empty` wall in its own right and is read through
 * `emptySteps`, so this survives as a readout — how far off the crowded wall she
 * is standing — and nothing branches on it. The history below is kept because it
 * is the reason the walls are ratios at all.
 *
 * IT IS MEASURED AGAINST A RATIO, and that correction is the whole of Joe's
 * report. He said the ratio *"seems to be 1:1, think that was more relaxed
 * before"*, and he was right on both counts.
 *
 * This used to be `habitable - pets`, an ABSOLUTE difference, with the corridor
 * either side of it absolute too: land paused at a surplus of 4, eggs paused at a
 * deficit of 3. A constant gap of four is generous when she owns five fields and
 * nothing at all when she owns forty, so the RATIO was driven to 1:1 as the
 * island grew — while the early game, where four is most of the island, genuinely
 * was more relaxed. He was describing real behaviour, not misremembering it.
 *
 * A ratio target cannot be written as a constant difference, which is why the
 * cost curves were the wrong place to look: `egg` and `tile` are the same curve
 * to within rounding, and making one dearer would not have changed the
 * equilibrium this function sets. The ceiling is now `wanted + maxEmptySurplus`,
 * so at ten pets land pauses at 19 fields rather than at 11 — 1.9 tiles per pet.
 *
 * IT IS THE CEILING'S NUMBER ONLY. The floor used to be read off it too, as a
 * negative surplus, and that was PB-039's fault: see `activeGovernor`.
 *
 * FIELDS ONLY — see `habitableFields`, which is where that is decided.
 */
export function spaceSurplus(f: Flow): number {
  return habitableFields(f) - fieldsWanted(f.pets.length)
}

/**
 * Which governor, if any, currently applies.
 *
 * Returns what should PAUSE, not what is forbidden: the caller turns this
 * into an invitation.
 */
export function activeGovernor(f: Flow): Governor {
  if (inGracePeriod(f)) return 'none'

  const fields = habitableFields(f)
  const pets = f.pets.length

  /*
   * BOTH WALLS ARE THE CORRIDOR'S OWN, and both are read through the very
   * functions that price the rewards. That is JT-012's coherence requirement
   * rather than a tidy-up: Joe asked for the escalation to come *"with an
   * announcement"*, and Fred's ask IS the announcement. A price that started
   * anywhere the invitation did not would be a silent tax on a six-year-old, so
   * `emptySteps(...) > 0` and 'space-surplus' are not two conditions that agree
   * today — they are one condition, written once.
   *
   * Joe gave the corridor in ANIMALS PER TILE: *"target ratio i think should be
   * 1 animal per 2 tiles, with a buffer to 2:3 either way"* — 1/2 at the target,
   * 2/3 and 1/3 at the walls, evenly spaced. Inverted, the walls are 1.5 and 3.0
   * tiles per pet, which only looks lopsided in the unit he did not use.
   *
   * The CEILING: more bare land than one friend per three tiles. Fred asks her
   * to read, and every further empty field makes the next tile dearer.
   */
  if (emptySteps(fields, pets) > 0) return 'space-surplus'

  /*
   * ...and the FLOOR, its mirror: more friends than two for every three tiles,
   * so Fred asks for maths and every further friend makes the next egg dearer.
   *
   * IT USED TO SIT SOMEWHERE ELSE ENTIRELY, and so did the ceiling. The ceiling
   * fired at `spaceSurplus >= 4` — an absolute offset from a target ratio — and
   * the floor at `pets >= 1.5 · fields`, a second unrelated ratio (PB-039).
   * Neither is the corridor Joe eventually specified, and the old reasoning for
   * the pair is kept below because it is why they are ratios at all.
   *
   * IT USED TO BE `-surplus >= maxWaitingPets`: the fields falling short of
   * `fieldsWanted` by an absolute three. That reads as symmetric with the
   * ceiling and is not, because both ends were then hung off ONE target ratio.
   * `1.5 * pets - 3` converges on 1.5 tiles per pet from below as the island
   * grows, so at ten pets she was pushed to maths the moment she dropped under
   * twelve fields — 1.2 tiles per pet, which is nearly the ceiling's own target
   * and nowhere near a floor. Three is generous when she owns four fields and
   * nothing at all when she owns forty: exactly the fault 17ad266 corrected at
   * the other wall, left standing at this one.
   *
   * Joe, PB-039: *"on the other end of the scale, which i dont think we have
   * bound properly, so she should be pushed to do maths only at 3 animals on 2
   * tiles as the other end of the balance."* So the floor is bound to the land
   * she has, not to the land her pets want — `petsHoused`, three animals for
   * every two tiles. At ten pets it now sits at seven fields, 0.7 tiles per pet,
   * and it stays near two-thirds however large the island gets.
   *
   * The two walls cannot both stand at once: the ceiling needs `fields > 3·pets`
   * and the floor needs `fields < 1.5·pets`, and both together would need
   * `3·pets < 1.5·pets`, which no pet count satisfies. Brute-forced in the tests
   * rather than trusted to that sentence.
   */
  if (crowdedSteps(fields, pets) > 0) return 'nursery-queue'
  return 'none'
}

/* ------------------------------------------------------------------------- *
 * What the PRICES read — and they read it from here, on purpose.
 *
 * JT-012 asks for the escalation to arrive *"with an announcement"*, and Fred's
 * ask is that announcement. So these two must be exactly the states in which
 * `activeGovernor` speaks: `tileSteps(f) > 0` if and only if it returns
 * 'space-surplus', `eggSteps(f) > 0` if and only if 'nursery-queue'. Anything
 * else is a tax levied without a word said, which the card rules out.
 *
 * WHICH IS WHY THE GRACE PERIOD IS HERE TOO, and it is not decoration: a brand
 * new island is one hex with nobody on it, which is a whole step past the empty
 * wall. Priced off the wall alone, the very first tile of the game would cost a
 * quarter more while Fred stood silent — a beginner taxed for a state she has no
 * idea exists and could not have avoided. §5 keeps him quiet for the opening;
 * these keep the till shut with him.
 * ------------------------------------------------------------------------- */

/** Steps past the EMPTY wall, for pricing the next tile. Silent in grace. */
export const tileSteps = (f: Flow): number =>
  inGracePeriod(f) ? 0 : emptySteps(habitableFields(f), f.pets.length)

/** Steps past the CROWDED wall, for pricing the next egg. Silent in grace. */
export const eggSteps = (f: Flow): number =>
  inGracePeriod(f) ? 0 : crowdedSteps(habitableFields(f), f.pets.length)

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
