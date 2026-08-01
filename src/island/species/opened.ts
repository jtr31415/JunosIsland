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
import { activeIds, fillToCap, nextToOpen, HELD_BACK } from './unlock'
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
 * THE ORDER OF THE THREE STEPS IS THE DESIGN, so it is written down rather than
 * left to be inferred:
 *
 *   0. THE PRUNE, AND ONLY FOR SAVES WRITTEN BEFORE PB-058. Adding the twelve
 *      unbuilt collections to `HELD_BACK` stops them being DRAWN; it does
 *      nothing whatever about the ones a child has already been given. Juno's
 *      live save has up to three of them open right now, and they are wedged
 *      there forever rather than merely ugly: `completion` divides what she owns
 *      by the collection's ROSTER size (sixteen), never by the number actually
 *      shipped (zero), so an empty collection sits at 0% permanently, never
 *      completes, never stops counting as ACTIVE, and therefore holds one of
 *      Joe's four slots for good. Three such albums and she has one working slot
 *      and will never be given a new album again. Nothing downstream saves her:
 *      `readOpened` keeps the id, this function used to copy it through
 *      verbatim, `candidates` only ever filtered what could be OPENED, and
 *      `albumsToShow` happily draws it. So it has to be undone here, once, on
 *      the way past.
 *   1. THE CADENCE NEXT. `nextToOpen` is Joe's ratified rule and gets first
 *      refusal on every slot. Called in a loop, not once, because a single call
 *      answers "does anything open now" and a save can arrive several
 *      completions behind — a build that was away for a version, or a child who
 *      finished two albums in one sitting.
 *   2. THE SEEDING LAST, and normally never. `fillToCap` only has anything to
 *      do when fewer than four are active and rule 2 was not satisfied, which is
 *      a fresh island, a save written before this field existed, or — new since
 *      PB-058 — a save that step 0 has just taken slots away from. That last
 *      case is the whole point of the prune: the freed slots are refilled in the
 *      same pass, so a child who was stuck on three dead albums arrives with
 *      four live ones and never sees the gap.
 *
 * IDEMPOTENT ON A STEADY STATE, INCLUDING ACROSS THE PRUNE: called twice with
 * the same pets it returns the same `open` the second time, because four are
 * active and all three steps decline. The prune does not break that and cannot
 * oscillate, because everything it removes is in `HELD_BACK` and everything step
 * 2 puts back is drawn from `candidates`, which filters `HELD_BACK` out — so no
 * id the prune drops can ever be re-drawn into the hole it left, and the second
 * call finds nothing to prune. It matters because `main.ts` calls this on every
 * arrival, not on an event.
 *
 * `base` is forced into `open` rather than assumed to be there, so a save that
 * lost it — hand-edited, or truncated — comes back with her own album rather
 * than a hole where the twenty-four she is actually collecting should be.
 */
export function advance(
  species: readonly string[], opened: Opened, rng: Rng,
): Opened {
  const was = opened.open.includes(BASE_COLLECTION)
    ? [...opened.open]
    : [BASE_COLLECTION, ...opened.open]
  let last = opened.lastOpened

  /*
   * Step 0. Take back the albums that were never worth giving, and ONLY those.
   *
   * Two conditions, both required, and the second one is BRIEF §19 — nothing a
   * child owns may be lost — so it is not an optimisation and it is not
   * optional:
   *
   *   (a) the collection is in `HELD_BACK`, so the cadence would refuse to draw
   *       it today; and
   *   (b) she owns NOTHING from it.
   *
   * For a collection with no shipped species (b) is always true — no model
   * means no pet means no species means no count — so on today's data the
   * prune is provably lossless and (a) alone would do the same work. The guard
   * is here because "provably" is doing a lot of work in that sentence and the
   * proof rots. `HELD_BACK` is a union (see `unlock.ts`), and Joe's half of it
   * is not about models at all: the day he releases `legendary` he may well do
   * it while a child already has some of it open and half collected, and an
   * (a)-only prune would quietly take her unicorns off the shelf. With (b) in
   * place the rule is lossless BY CONSTRUCTION rather than by an argument about
   * what happens to be true this week. If she owns anything in a held-back
   * collection, it keeps its album and its slot, and the cadence simply never
   * offers her a second one like it.
   *
   * `base` is never pruned. It is not in `HELD_BACK` so (a) already excludes it,
   * but it is spelled out because base going missing is the one failure here
   * nobody would forgive — it is the album she has actually been collecting
   * since her first egg — and a guard that is obvious to read is worth more than
   * one that has to be traced through two files.
   *
   * `lastOpened` is deliberately left alone even when it names something pruned.
   * `RELATED_GROUP` is total over every non-base id, so the relatedness rule
   * still resolves against a pruned id perfectly well, and it remains an honest
   * record of what was drawn last — which is what the field is for.
   */
  const owned = ownedByCollection(species)
  const open = was.filter(id =>
    id === BASE_COLLECTION || !HELD_BACK.includes(id) || (owned[id] ?? 0) > 0,
  )

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
