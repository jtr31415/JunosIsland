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
import { activeIds, fillToCap, nextToOpen, heldBack, isComplete } from './unlock'
import type { UnlockState } from './unlock'
import type { Rng } from '../../core/rng'

/**
 * How many members of each collection are BUILT, by collection id.
 *
 * >>> THIS IS A PARAMETER AND NOT AN IMPORT, AND THAT IS THE DESIGN. The honest
 * >>> answer lives in `built.ts`, which costs three.js through both `kit.ts` and
 * >>> `registry.ts`. This module's header promises no three.js, and `save.ts`
 * >>> imports this module — so importing `built.ts` here would put a renderer
 * >>> inside the save path and inside every headless test that touches it.
 * >>> `main.ts` already pays for three and is where the map is filled.
 *
 * There is still exactly ONE predicate. Nobody re-derives "built" anywhere; it
 * is computed once from `built.ts`'s `builtIn` and threaded through.
 */
export type BuiltCounts = Readonly<Record<string, number>>

/**
 * The one collection that is open before anything is earned.
 *
 * They are dealt from it on their very first egg (`collection.ts`, primed from
 * the live 24), so it is open by definition rather than by a draw — and Joe's
 * ruling of 1 Aug is that it occupies one of the four slots like any other
 * album. `unlock.ts` never opens it: `candidates` excludes `base` explicitly, so
 * it can only ever get into `open` from here.
 */
export const BASE_COLLECTION = 'base'

/** What the save carries, and what `advance` returns. */
export interface Opened {
  /** Every collection id opened so far, base first, then in the order drawn. */
  open: readonly string[]
  /** The id drawn most recently. Only the relatedness rule reads it. */
  lastOpened: string | null
  /**
   * EVERY COLLECTION THIS ISLAND HAS EVER FINISHED. Append-only. THE RATCHET.
   *
   * JT-047. `completion` divides by the BUILT members now, and Joe has said he
   * *"might make some more"* — so a collection is 14 of 14 and COMPLETE today
   * and 14 of 16 and INCOMPLETE tomorrow. This field is the memory that stops
   * that costing a child something she earned, and it has to be a memory
   * because after the push "she has 13 of 14" and "she once had all of them"
   * are the same present state. There is nothing left to derive it from.
   *
   * `unlock.ts`'s `isComplete` reads it and ratchets both consequences at once
   * — the freed active slot and the 80% trigger. The COUNTER is not ratcheted
   * and must never be: she is honestly shown "13 of 14" and can go and collect
   * the new ones. See `UnlockState.everCompleted` for the argument in full.
   *
   * IT IS CLEARED BY A WIPE, with `open` and for the same reason. It must NOT
   * be kept in `onceFlags`, which survive a wipe — a stale completion on a
   * fresh island would free a slot and satisfy the trigger with no animals
   * owned at all.
   */
  completed: readonly string[]
}

/** A fresh island: base and nothing else. `advance` fills the other three. */
export const NOTHING_OPENED: Opened = {
  open: [BASE_COLLECTION], lastOpened: null, completed: [],
}

/**
 * How many members of each collection they own, counting SPECIES, not pets.
 *
 * The distinction is the whole of Joe's "one slot per species" ruling expressed
 * as arithmetic, and it is load-bearing rather than tidy: `completion` divides
 * this by the collection's size, so counting pets would let a child who owned
 * four foxes and nothing else read as 4/24 through the base set — and at the
 * exhausted end of a pack, where `collection.ts` starts dealing duplicates
 * again, a count of pets could exceed the collection's size outright and open a
 * new album for animals they have not met. (`completion` clamps to 1, so the
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
export function stateOf(
  species: readonly string[], opened: Opened, built: BuiltCounts,
): UnlockState {
  return {
    open: opened.open,
    owned: ownedByCollection(species),
    lastOpened: opened.lastOpened,
    roster: COLLECTIONS,
    built,
    everCompleted: opened.completed,
  }
}

/**
 * Everything that should be open right now, given what they own.
 *
 * THE ORDER OF THE THREE STEPS IS THE DESIGN, so it is written down rather than
 * left to be inferred:
 *
 *   0. THE PRUNE, AND ONLY FOR SAVES WRITTEN BEFORE PB-058. `heldBack` stops an
 *      unbuilt collection being DRAWN; it does nothing whatever about the ones a
 *      child has already been given. Juno's live save has up to three of them
 *      open right now, and they are ugly — an album whose every frame is empty —
 *      so they are taken back here, once, on the way past. Nothing downstream
 *      does it for us: `readOpened` keeps the id, this function used to copy it
 *      through verbatim, `candidates` only ever filtered what could be OPENED,
 *      and `albumsToShow` happily draws it.
 *
 *      >>> UNTIL JT-047 THIS STEP WAS ALSO LOAD-BEARING FOR A SECOND REASON,
 *      >>> AND IT NO LONGER IS. `completion` used to divide by the collection's
 *      >>> ROSTER size (sixteen) rather than by the number actually built
 *      >>> (zero), so a dead album sat at 0% forever, never completed, never
 *      >>> stopped counting as ACTIVE, and held one of Joe's four slots for
 *      >>> good. Three such albums and the child had one working slot and would
 *      >>> never be given a new album again. That wedge is now closed by
 *      >>> arithmetic instead: a collection with nothing built reads as 1 and so
 *      >>> occupies no slot at all (`unlock.ts`'s `completion`). The prune
 *      >>> survives because an empty album is still not a gift, not because the
 *      >>> cadence depends on it.
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
 * oscillate, because everything it removes is in `heldBack` and everything step
 * 2 puts back is drawn from `candidates`, which filters `heldBack` out — so no
 * id the prune drops can ever be re-drawn into the hole it left, and the second
 * call finds nothing to prune. It matters because `main.ts` calls this on every
 * arrival, not on an event.
 *
 * `base` is forced into `open` rather than assumed to be there, so a save that
 * lost it — hand-edited, or truncated — comes back with their own album rather
 * than a hole where the twenty-four they are actually collecting should be.
 */
export function advance(
  species: readonly string[], opened: Opened, rng: Rng, built: BuiltCounts,
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
   *   (a) the collection is in `heldBack`, so the cadence would refuse to draw
   *       it today; and
   *   (b) the child owns NOTHING from it.
   *
   * For a collection with no shipped species (b) is always true — no model
   * means no pet means no species means no count — so on today's data the
   * prune is provably lossless and (a) alone would do the same work. The guard
   * is here because "provably" is doing a lot of work in that sentence and the
   * proof rots. `heldBack` is a union (see `unlock.ts`), and Joe's half of it
   * is not about models at all: the day he releases `legendary` he may well do
   * it while a child already has some of it open and half collected, and an
   * (a)-only prune would quietly take their unicorns off the shelf. With (b) in
   * place the rule is lossless BY CONSTRUCTION rather than by an argument about
   * what happens to be true this week. If a child owns anything in a held-back
   * collection, it keeps its album and its slot, and the cadence simply never
   * offers them a second one like it.
   *
   * `base` is never pruned. It is not in `heldBack` so (a) already excludes it,
   * but it is spelled out because base going missing is the one failure here
   * nobody would forgive — it is the album the child has actually been
   * collecting since their first egg — and a guard that is obvious to read is
   * worth more than one that has to be traced through two files.
   *
   * `lastOpened` is deliberately left alone even when it names something pruned.
   * `RELATED_GROUP` is total over every non-base id, so the relatedness rule
   * still resolves against a pruned id perfectly well, and it remains an honest
   * record of what was drawn last — which is what the field is for.
   */
  const owned = ownedByCollection(species)
  const open = was.filter(id =>
    id === BASE_COLLECTION || !heldBack(built, id) || (owned[id] ?? 0) > 0,
  )

  /*
   * Step 0.5. RECORD ANY COMPLETION, BEFORE ANYTHING SPENDS IT. JT-047.
   *
   * This runs before the cadence deliberately. A completion is what PAYS for
   * the album step 1 is about to open, so it has to be on the books first —
   * and once written it is never removed, which is the whole of the ratchet.
   *
   * `isComplete` is asked with an EMPTY history on purpose, so that this loop
   * only ever adds genuinely LIVE completions; anything recorded on an earlier
   * arrival is already in the set and stays there untouched. `Set` keeps it
   * append-only and duplicate-free however many times `advance` runs, which is
   * once per arrival and again on every hatch.
   *
   * >>> THE `built > 0` GUARD IS NOT BELT AND BRACES. `completion` returns 1
   * >>> for a collection with NOTHING BUILT — that rule exists to stop a dead
   * >>> album wedging one of `MAX_ACTIVE`'s four slots open forever, and it is
   * >>> right for that job. It would be very wrong here. Without this guard, a
   * >>> collection whose models were all deleted (PB-036 did exactly that to
   * >>> fifty-nine species without touching the roster) would be written into
   * >>> the permanent record as FINISHED, and when Joe rebuilt it she would own
   * >>> 3 of 14 in a collection the game considered complete for good.
   * >>>
   * >>> Freeing a slot is a reading of the present and may be revised. This
   * >>> record is a claim about her past, and nothing that never had an animal
   * >>> in it can be something she finished.
   *
   * Only collections she has actually OPENED are considered at all.
   *
   * >>> IT RUNS TWICE, BEFORE AND AFTER THE OPENING STEPS, AND BOTH ARE NEEDED.
   * >>> Before, because a completion is what PAYS for the album step 1 is about
   * >>> to open, so it must be on the books first. After, because a collection
   * >>> can be opened by steps 1 and 2 and be complete THE INSTANT IT OPENS —
   * >>> she may already own every animal in it, having been dealt them from a
   * >>> collection that had not yet been given to her as an album. With only the
   * >>> first pass that completion went unrecorded until her NEXT arrival, so a
   * >>> `built` count that rose in between would find no record and take back a
   * >>> slot she had earned. Caught by the idempotence test, which is what that
   * >>> test is for: `advance` runs on every arrival and must settle in one.
   */
  const completed = new Set(opened.completed)
  const record = (ids: readonly string[]): void => {
    const now = stateOf(species, { open: ids, lastOpened: last, completed: [] }, built)
    for (const id of ids) {
      if ((built[id] ?? 0) > 0 && isComplete(now, id)) completed.add(id)
    }
  }
  record(open)

  // Step 1. The cadence, until it has nothing more to say.
  for (;;) {
    const id = nextToOpen(
      stateOf(species, { open, lastOpened: last, completed: [...completed] }, built), rng,
    )
    if (id === null) break
    open.push(id)
    last = id
  }

  // Step 2. The seeding, which on any island past its first four does nothing.
  const seed = fillToCap(
    stateOf(species, { open, lastOpened: last, completed: [...completed] }, built), rng,
  )
  for (const id of seed) {
    open.push(id)
    last = id
  }

  // And again, for anything the two steps above opened that was already finished.
  record(open)

  return { open, lastOpened: last, completed: [...completed] }
}

/**
 * The albums the child should be looking at, in the order they were opened.
 *
 * COMPLETED COLLECTIONS STAY. `activeIds` deliberately drops them — that is what
 * frees a slot — but an album they have finished is the one they are proudest
 * of, and hiding it the moment they complete it would take the trophy away at
 * the exact instant they earned it. So this returns everything open, which is
 * four while they are mid-collection and grows by one each time they finish one.
 *
 * Ids this build cannot resolve are dropped HERE rather than on the way out of
 * the save — see `readOpened` in `save.ts` for why they are kept on disk.
 */
export function albumsToShow(opened: Opened): readonly string[] {
  const known = new Set(COLLECTIONS.map(c => c.id))
  return opened.open.filter(id => known.has(id))
}

/** How many of the shown albums are still being worked on. For tests and debug. */
export function activeCount(
  species: readonly string[], opened: Opened, built: BuiltCounts,
): number {
  return activeIds(stateOf(species, opened, built)).length
}
