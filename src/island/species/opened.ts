/**
 * WHICH ALBUMS THIS ISLAND HAS OPEN. The seam between `unlock.ts` and the save.
 *
 * `unlock.ts` was built pure and deliberately unwired — its own header says so:
 * *"THIS MODULE IS PURE AND IS NOT WIRED UP... nothing this file decides reaches
 * a child yet"*. This is the file that reaches the child. It owns the two things
 * `unlock.ts` refused to own, and nothing else:
 *
 *   1. WHAT COUNTS AS OWNED. `UnlockState.owned` is a count per collection, and
 *      the only honest count is DISTINCT SPECIES — see `ownedByCollection`.
 *   2. WHEN THE RULES RUN, and in what order the cadence and the seeding go.
 *
 * It stays pure: no three.js, no store, no DOM. `main.ts` hands it the pets and
 * the previous answer and puts the new answer in the save. That keeps the whole
 * unlock question testable as data in, data out, which is how `unlock.ts` earned
 * its twenty-seven tests.
 *
 * Joe, 1 Aug, on the album: *"4 albums always on show, next one shows when one
 * is completed"* — the first half is `fillToCap`, the second is `nextToOpen`,
 * and `advance` below is the one place they meet.
 */
import { COLLECTIONS, SPECIES_COLLECTION } from './roster'
import { activeIds, fillToCap, nextToOpen } from './unlock'
import type { UnlockState } from './unlock'
import type { Rng } from '../../core/rng'

/**
 * The one collection that is open before anything is earned.
 *
 * She is dealt from it on her very first egg (`collection.ts`, primed from the
 * live 24), so it is open by definition rather than by a draw — and Joe's ruling
 * of 1 Aug is that it occupies one of the four slots like any other album.
 * `unlock.ts` never opens it: `candidates` excludes `base` explicitly, so it can
 * only ever get into `open` from here.
 */
export const BASE_COLLECTION = 'base'

/** What the save carries, and what `advance` returns. */
export interface Opened {
  /** Every collection id opened so far, base first, then in the order drawn. */
  open: readonly string[]
  /** The id drawn most recently. Only the relatedness rule reads it. */
  lastOpened: string | null
}

/** A fresh island: base and nothing else. `advance` fills the other three. */
export const NOTHING_OPENED: Opened = { open: [BASE_COLLECTION], lastOpened: null }

/**
 * How many members of each collection she owns, counting SPECIES, not pets.
 *
 * The distinction is the whole of Joe's "one slot per species" ruling expressed
 * as arithmetic, and it is load-bearing rather than tidy: `completion` divides
 * this by the collection's size, so counting pets would let a child who owned
 * four foxes and nothing else read as 4/24 through the base set — and at the
 * exhausted end of a pack, where `collection.ts` starts dealing duplicates
 * again, a count of pets could exceed the collection's size outright and open a
 * new album for animals she has not met. (`completion` clamps to 1, so the
 * damage would be silent rather than loud, which is worse.)
 *
 * A species with no known collection is ignored — a save from a later build can
 * name one, exactly as `roster.ts`'s `collectionOf` anticipates.
 */
export function ownedByCollection(
  species: readonly string[],
): Readonly<Record<string, number>> {
  const seen = new Set<string>()
  const out: Record<string, number> = {}
  for (const id of species) {
    if (seen.has(id)) continue
    seen.add(id)
    const collection = SPECIES_COLLECTION[id]
    if (collection === undefined) continue
    out[collection] = (out[collection] ?? 0) + 1
  }
  return out
}

/** The snapshot `unlock.ts` reasons over, assembled from what this island has. */
export function stateOf(species: readonly string[], opened: Opened): UnlockState {
  return {
    open: opened.open,
    owned: ownedByCollection(species),
    lastOpened: opened.lastOpened,
    roster: COLLECTIONS,
  }
}

/**
 * Everything that should be open right now, given what she owns.
 *
 * THE ORDER OF THE TWO STEPS IS THE DESIGN, so it is written down rather than
 * left to be inferred:
 *
 *   1. THE CADENCE FIRST. `nextToOpen` is Joe's ratified rule and gets first
 *      refusal on every slot. Called in a loop, not once, because a single call
 *      answers "does anything open now" and a save can arrive several
 *      completions behind — a build that was away for a version, or a child who
 *      finished two albums in one sitting.
 *   2. THE SEEDING SECOND, and normally never. `fillToCap` only has anything to
 *      do when fewer than four are active and rule 2 was not satisfied, which is
 *      a fresh island, or a save written before this field existed. Once the
 *      four are seeded the cadence owns every subsequent opening, because being
 *      at the cap is exactly what makes a completion the only thing that
 *      releases the next one.
 *
 * IDEMPOTENT ON A STEADY STATE: called twice with the same pets it returns the
 * same `open` the second time, because four are active and both steps decline.
 * That matters because `main.ts` calls it on every arrival, not on an event.
 *
 * `base` is forced into `open` rather than assumed to be there, so a save that
 * lost it — hand-edited, or truncated — comes back with her own album rather
 * than a hole where the twenty-four she is actually collecting should be.
 */
export function advance(
  species: readonly string[], opened: Opened, rng: Rng,
): Opened {
  const open = opened.open.includes(BASE_COLLECTION)
    ? [...opened.open]
    : [BASE_COLLECTION, ...opened.open]
  let last = opened.lastOpened

  // Step 1. The cadence, until it has nothing more to say.
  for (;;) {
    const id = nextToOpen(stateOf(species, { open, lastOpened: last }), rng)
    if (id === null) break
    open.push(id)
    last = id
  }

  // Step 2. The seeding, which on any island past its first four does nothing.
  for (const id of fillToCap(stateOf(species, { open, lastOpened: last }), rng)) {
    open.push(id)
    last = id
  }

  return { open, lastOpened: last }
}

/**
 * The albums the child should be looking at, in the order they were opened.
 *
 * COMPLETED COLLECTIONS STAY. `activeIds` deliberately drops them — that is what
 * frees a slot — but an album she has finished is the one she is proudest of,
 * and hiding it the moment she completes it would take the trophy away at the
 * exact instant she earned it. So this returns everything open, which is four
 * while she is mid-collection and grows by one each time she finishes one.
 *
 * Ids this build cannot resolve are dropped HERE rather than on the way out of
 * the save — see `readOpened` in `save.ts` for why they are kept on disk.
 */
export function albumsToShow(opened: Opened): readonly string[] {
  const known = new Set(COLLECTIONS.map(c => c.id))
  return opened.open.filter(id => known.has(id))
}

/** How many of the shown albums are still being worked on. For tests and debug. */
export function activeCount(species: readonly string[], opened: Opened): number {
  return activeIds(stateOf(species, opened)).length
}
