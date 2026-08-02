/**
 * WHO CAN BE IN AN EGG — the one list the deck draws from.
 *
 * ## Why this file exists
 *
 * Dealing used to take `SPECIES` straight from `pets.ts`: the 24 Kenney GLB
 * basenames, and nothing else, ever. That was invisible for as long as the 24
 * were the whole game, and then thirty hand-assembled animals were built and
 * none of them could ever be dealt. Joe could have signed off all thirty and
 * Juno would still never have met one — a sign-off that changed nothing, which
 * is the worst possible shape for a review gate to have (PB-070).
 *
 * ## The rule, which is Joe's and is settled
 *
 * *"unsigned animals never ship, signed ones always do"*, ruled twice and
 * recorded in `docs/MANAGER-ORDERS.md` as a standing order: a signed-off animal
 * goes live with the next push, **always**. So the pool is exactly
 *
 *     the base pack  +  every registered species Joe has signed off
 *
 * and a newly signed-off animal joins it with no further ceremony — no flag to
 * flip, no list to append to, no second approval. If you find yourself adding a
 * step here, you have misread the ruling. The only judgement in the whole path
 * is his tick, and it is made somewhere else entirely (`signed-off.ts` says
 * where, and how it reaches this side of the fence).
 *
 * ## Registered, as well as signed off
 *
 * A signed-off id that no `defineSpecies` record answers to is a typo, not an
 * animal: an egg would be dealt for it, `pets.ts` would fail to build it, and
 * the child would watch an egg hatch into nothing. `tests/island/signed-off.test.ts`
 * already refuses that at the data end, so this filter should never fire — but
 * it is the cheap half of the belt and braces, and the expensive half is a
 * six-year-old's disappointment.
 *
 * ## Order is part of the contract
 *
 * `makeCollectionDeck` draws by index against an `Rng`, so the ORDER of this
 * list decides which animal a given seed deals. Base pack first, in its own
 * frozen order, then the signed-off ids in the order the mirror holds them
 * (which is sorted). Deterministic, and stable as the mirror grows: appending a
 * newly signed-off animal cannot renumber the 24 that came before it.
 */
import { SIGNED_OFF_SPECIES } from './signed-off'
import { speciesRecord } from './registry'

/**
 * Every species an egg may hold.
 *
 * `base` is passed in rather than imported so this module stays a leaf of the
 * species layer — `pets.ts` reads `species/`, and a `species/` file reading
 * `pets.ts` back would be the cycle. It is also what lets a test state the
 * whole pool in one line.
 *
 * `signedOff` defaults to the real mirror and is a parameter for the same
 * reason: Joe's tick is DATA, so a test can hand this function a tick and
 * assert what the game does with it, rather than asserting that a mock ran
 * (`docs/HANDOFF.md` §5, which this project has paid for four times).
 */
export function dealPool(
  base: readonly string[],
  signedOff: readonly string[] = SIGNED_OFF_SPECIES,
): readonly string[] {
  const pool = [...base]
  const seen = new Set(pool)
  for (const id of signedOff) {
    if (seen.has(id)) continue
    if (!speciesRecord(id)) continue
    seen.add(id)
    pool.push(id)
  }
  return pool
}
