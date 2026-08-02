/**
 * Africa — roster row 4, ship 7, name band `medium`.
 *
 * PB-036 phase 2. `roster.ts` says which sixteen species this collection holds;
 * this file says what ONE of them is. `registry.ts` already states the shape of
 * that gap: "A species in the roster with no record here is a species that has
 * not shipped."
 *
 * >>> THIS FILE HELD FOURTEEN RECORDS UNTIL 2 AUGUST 2026 AND NOW HOLDS ONE.
 * >>> Everything below the import is `animal-crocodile`. Thirteen quadruped
 * >>> records were DELETED by PB-036 (`eedb6ef`) when Joe retired the kit-built
 * >>> route — *"remove all the blocky ones from the game completely, including
 * >>> the album"* — and the prose in this header was not updated with them, so
 * >>> it went on claiming "FOURTEEN of sixteen" for a file holding one. That is
 * >>> the whole of what JT-047 corrected here; no record changed.
 *
 * SO AFRICA IS 1 OF 16, and the fifteen absences are of two different kinds,
 * which is worth keeping apart because they are undone by different work:
 *
 *   - THIRTEEN were built once, on the quadruped kit, and were deleted. They
 *     come back when somebody builds them on the assembly route, the way the
 *     crocodile came back. Nothing about them is a design question.
 *   - TWO WERE NEVER BUILT AT ALL, deliberately, and must not be filled in
 *     without building a kit first:
 *
 *       - `animal-ostrich` — two legs, a neck longer than its body, no tail as
 *         this kit means the word. Wants `songbird`/`bespoke`.
 *       - `animal-vulture` — hooked beak, broad wings, tail fan. Wants
 *         `raptor`, declared in `types.ts` and not built.
 *
 * BOTH WANT WINGS, AND THE BANK HAS NONE. Measured, not assumed: the `wing` role
 * is declared in `bank.generated.ts` and occurs zero times in the data, alongside
 * `horn` and `claw`; and the pack's own three birds — parrot, chick, penguin —
 * are a fused hull plus a beak, legs and eye cards, with no wing between them.
 * So there is no shape to adapt and rule 1 has nothing to work on. How those two
 * should read is a LOOK decision and it belongs to Joe, not to a measurement.
 *
 * `animal-crocodile` WAS on this list until 2 August 2026 and left it the only
 * honest way, by being built on the route the entry already named: `bespoke`, on
 * the assembly kit. The ruling that kept it off — that the quadruped kit's legs
 * stand under the body and its skull is a cube — is not overturned by that; it is
 * satisfied by it. Its record below carries no `build` at all.
 *
 * Africa therefore ships PARTIAL, ONE of sixteen. The count is asserted in
 * `tests/island/species-built.test.ts`'s PINNED table (`['africa', 16, 1]`), so
 * a number here going stale again fails a test rather than sitting in a comment.
 *
 * (`tests/island/species-africa.test.ts` is cited by no test runner and does not
 * exist — it went with the thirteen records. It used to assert the two absences
 * by name so nobody half-filled the collection by improvising a shape for them.
 * That improvisation is still the exact failure roster §1's "kits before
 * species" rules out, and the paragraph above is now the only thing saying so.)
 *
 * WHAT THE NUMBERS MEAN. Every field except `height` is a multiplier off the
 * kit's reference silhouette (`kits/quadruped.ts` REF), which is fox-shaped on
 * purpose. `height` is absolute in Kenney units. The measured pack runs
 * 1.43–2.02 tall with a mean width/height of 0.97, so these are all in
 * 1.5–2.2 and all deliberately CHUNKIER than the animal really is: a
 * correctly-proportioned cheetah is a stranger beside `animal-fox`, which
 * roster §1 forbids. The hippo and the meerkat here differ by 0.7 units where
 * reality would say a factor of thirty, and that is correct for this pack.
 *
 * Long-and-low is expressed by dropping `legs` and `height`, never by pushing
 * `body`. `kits/quadruped.ts` LIMIT explains why: `pets.ts:652` takes the
 * obstacle keep-out from `max(width, depth) / 2`, so body LENGTH is charged for
 * in trees the creature cannot walk between. Hence the mongoose and the
 * aardvark sit at `legs: 0.60` rather than at `body: 1.5`.
 *
 * NO `threat` IS RECORDED. Six of these thirteen are genuinely threatened, but
 * `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory — `registry.ts:55-76` makes that argument in full, and
 * writing categories here from recall would produce records that LOOK checked.
 * Absent is the honest state.
 */
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line the crocodile below
 * would find no assembly and would build as a bare hull.
 * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.
 */
import '../parts/assembled'
import type { Species } from '../types'

export const AFRICA_SPECIES: readonly Species[] = [

  /*
   * THE CROCODILE — once the fourteenth of fourteen, and now the only one.
   *
   * It was written as the first of this collection's three absences to be
   * filled. It ended up the sole survivor instead: the thirteen quadrupeds it
   * joined were deleted the same week, and this record outlived them precisely
   * BECAUSE it took the assembly route rather than the kit. That is not luck,
   * it is the reason the route was taken, and it is the argument for building
   * the other thirteen the same way rather than reviving the kit.
   *
   * It has no `build` and no numbers here at all, which is the whole point. The
   * ruling above still stands word for word — the quadruped kit stands its legs
   * under the body and gives it a cube skull, and a crocodile expressed through
   * it is a lizard-shaped dog — so it was never going to be filled in by adding
   * numbers to this file. `bespoke` sends it to the ASSEMBLY kit, which places
   * bank parts one at a time, and `parts/assembled/animal-crocodile.ts` carries
   * every measurement with the reason beside it: the elephant's trunk stretched
   * flat as a jaw, the cat's ear repeated as dorsal scutes, the beaver's paddle
   * as the tail, and the leg row pushed out to the exact edge of the hull's
   * footprint, which is as sprawled as a fixed leg row can honestly go.
   *
   * THE OSTRICH AND THE VULTURE ARE STILL ABSENT AND STILL MUST NOT BE
   * IMPROVISED. Both want wings; the bank has no `wing` shape at all, and the
   * pack's own birds have none either. That is a look decision and it is Joe's.
   *
   * Its palette is proposed there rather than agreed here, because this species
   * was never in this file to be given one. It is FLAGGED and Joe has not seen
   * it — along with the deliberate absence of teeth, which brief §19's "bright,
   * never scary" is the reason for.
   */
  defineSpecies('animal-crocodile', 'bespoke'),

]
