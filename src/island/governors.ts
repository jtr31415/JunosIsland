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
  'space-surplus': "We've got lots of lovely space — let's read some friends home first!",
  'nursery-queue': 'They need homes first!',
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
  activeGovernor(f) === 'space-surplus' && f.bankedTiles === 0

/** May a new egg be worked on right now? */
export const eggsPaused = (f: Flow): boolean =>
  activeGovernor(f) === 'nursery-queue'

/** Sockets available to build on, for the surplus calculation and the UI. */
export const openSockets = (f: Flow): number => sockets(f.island).length
