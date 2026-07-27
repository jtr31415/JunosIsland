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
 */
import type { Flow } from './flow'
import { balance } from './balance'
import { sockets } from './world/grid'

export type Governor = 'none' | 'space-surplus' | 'nursery-queue'

/** Fred's line for each. Want-framed: what to do next, never what is barred. */
export const GOVERNOR_LINE: Record<Exclude<Governor, 'none'>, string> = {
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
}

/**
 * The island is still new. Governors stay silent for the opening stretch so a
 * child learning the loop is never redirected (§5).
 */
export function inGracePeriod(f: Flow): boolean {
  return f.pets.length < 2 && f.island.tiles.size < 4
}

/**
 * How many fields this many pets want.
 *
 * Joe, 28 July: *"for every tile, there needs to be one animal. we can be a bit
 * more relaxed with that, say 3 tiles for 2 animals."*
 */
export const fieldsWanted = (pets: number): number =>
  pets * balance.governor.tilesPerPet

/**
 * Land beyond what the current pets want — the number both governors read.
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
 * equilibrium this function sets. Now the corridor is `wanted ± the two
 * constants`, so at ten pets she may hold 11 to 19 fields — a ratio of 1.1 to
 * 1.9, converging on 1.5 rather than on 1.
 *
 * FIELDS ONLY: not rock, which is land but cannot be stood on, and not water.
 * See the note in the loop.
 */
export function spaceSurplus(f: Flow): number {
  /*
   * FIELDS ONLY. Rock is land but it is not LODGING, and the distinction is
   * deliberate rather than an oversight — `isLand` is the right question for the
   * coastline and the wrong one here.
   *
   * A mountain hex is planted at the model's native size and centred, so the
   * mound covers its tile and `footprintBelow(WALKING_HEIGHT)` blocks very nearly
   * the whole hex. There is nowhere on it for a pet to stand. Counting it as room
   * would have the governor believe she has space she cannot use, and pets would
   * fail placement quietly — a silent failure rather than a visible shortage,
   * which is the worse of the two.
   *
   * The cost is that mountains do not advance the pet economy: a girl who builds
   * a range still gets asked to read. That is honest, but it is a pacing decision
   * Joe should see rather than infer — carded.
   */
  let habitable = 0
  for (const type of f.island.tiles.values()) if (type === 'grass') habitable++
  return habitable - fieldsWanted(f.pets.length)
}

/**
 * Which governor, if any, currently applies.
 *
 * Returns what should PAUSE, not what is forbidden: the caller turns this
 * into an invitation.
 */
export function activeGovernor(f: Flow): Governor {
  if (inGracePeriod(f)) return 'none'
  const surplus = spaceSurplus(f)
  if (surplus >= balance.governor.maxEmptySurplus) return 'space-surplus'
  /*
   * ...and the mirror. A pet with nowhere of its own to be is "waiting", which
   * now means the fields fall short of what her pets want by `maxWaitingPets`.
   *
   * Written as the negative surplus rather than as
   * `pets - Math.max(0, surplus + pets)`, which is what stood here. That
   * expression reduces to exactly `-surplus` for any non-negative field count —
   * so it was correct, but it read as though it were computing something else,
   * and it silently depended on `surplus` being `habitable - pets` with a
   * coefficient of one. Under a ratio target that identity no longer holds, and
   * the roundabout form would have quietly gone on meaning the old thing.
   */
  if (-surplus >= balance.governor.maxWaitingPets) return 'nursery-queue'
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
