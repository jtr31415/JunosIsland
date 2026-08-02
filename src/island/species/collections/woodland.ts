/**
 * The Woodland collection — roster row 9, `ship: 10`, name band `medium`.
 *
 * PB-036 phases 2 and 3. `roster.ts` says which species exist; this file says
 * what all sixteen of Woodland's members ARE, as build data. Nothing here builds
 * geometry — every number is a multiplier off a kit's one reference silhouette,
 * so retuning the whole collection is an edit to a `REF` and not to this file.
 *
 * COMPLETE, AND THE FIRST COLLECTION THAT IS. Phase 2 shipped fourteen and left
 * `animal-pheasant` and `animal-capercaillie` out on purpose: they are game
 * birds, the songbird kit did not exist, and a bird pressed into the quadruped
 * kit is a four-legged pheasant — the exact failure roster §1's "kits before
 * species" rule exists to prevent. Phase 3 built the songbird kit
 * (`kits/songbird.ts`), so the two of them are here now, as `SongbirdBuild`
 * records, and Woodland is 16/16.
 *
 * SO THIS FILE IS TWO-KITTED, which nothing else in `collections/` is yet.
 * Fourteen quadrupeds and two songbirds, and the tests read the build union
 * rather than assuming `QuadrupedBuild` — see the note at the top of
 * `tests/island/species-woodland.test.ts`, where the old "these two are absent"
 * assertion became "these two must not resolve to a frozen pack animal".
 *
 * WHY THE NUMBERS ARE STOCKIER THAN THE ANIMALS. All 24 live GLBs were measured
 * (see the `REF` comment in `kits/quadruped.ts`): the pack is 1.43–2.02 tall,
 * mean 1.65, mean width/height 0.97. A brown bear built at true anatomical
 * proportions beside `animal-fox` (1.25 x 1.69 x 2.31, W/H 0.74) is a stranger,
 * which roster §1 forbids. So this collection's bear and its chipmunk differ by
 * far less than reality — 2.00 against 1.50 — and that is correct for this pack.
 *
 * WHY NO LENGTH IS EXPRESSED THROUGH `body`. `pets.ts:652` sets a pet's obstacle
 * keep-out to `max(width, depth) / 2`, so LENGTH IS CHARGED FOR: the kit header
 * records a `body: 1.9` stoat coming out 4.0 units deep, unable to walk between
 * two trees. `body` clamps at 1.55, and no member here goes near it by accident.
 *
 * AND A COROLLARY THE KIT HEADER DOES NOT STATE, found by measuring this
 * collection rather than by reading. The kit's advice is to express long-and-low
 * by "dropping `legs` and `height` instead, which costs nothing" — but the fit
 * (`quadruped.ts:588-597`) is UNIFORM and solves for height, so dropping `legs`
 * lowers the raw silhouette, raises the fit scale, and the body gets LONGER in
 * world units. A stoat at `body: 1.55, legs: 0.28` measured 3.56 deep, a keep-out
 * of 1.78 — worse than the pack's widest (the fox, 1.17) and worse than the kit's
 * own worked "plausible stoat" (`kit-quadruped.test.ts:93`, which measures 1.59).
 * So low legs are not free: every long member below is tuned against the measured
 * keep-out, not against the multipliers, and the ceiling held is 1.6.
 *
 * WHY THERE ARE NO `threat` RECORDS. Roster §5 wants statuses "true, checkable",
 * and `Threat.checkedDate` exists so a status is a dated reading of the Red List
 * rather than a memory. Writing categories here from recall would produce
 * records that LOOK checked. Absent means "not recorded yet", which is honest;
 * `registry.ts:55-76` holds the same line for the base 24.
 *
 * ROSTER §4 LIVES HERE. Woodland carries more of the confusable-silhouette list
 * than any other collection: otter/mink/coypu against each other and against
 * `animal-beaver`; hare against `animal-bunny`; bear against `animal-polar` and
 * `animal-panda`; plus three mustelids and two cats internally. The live 24 are
 * FROZEN, so every one of those separations is made on this side, in proportion
 * and palette, and is written down at the species it belongs to.
 */
import type { Species } from '../types'

/**
 * EMPTY, on Joe's ruling of 2 August 2026, and deliberately still here.
 *
 * All sixteen were kit-built, and he retired that route: *"only the garden
 * animals have been built to spec… the old blocky ones… do not build any more
 * of them"*, then *"remove all the blocky ones from the game completely,
 * including the album."* Deletion rather than replacement was safe because he
 * confirmed the state that made it safe — *"she has not collected any of them
 * yet"* — so no save points at a Woodland species.
 *
 * This file used to open by calling itself "COMPLETE, AND THE FIRST COLLECTION
 * THAT IS", which was true of the kit and not of the standard, and that sentence
 * is why a count of 100 built species was reported to Joe when the real figure
 * to spec was 17. A file describing its own output is not evidence about
 * whether the output is wanted.
 *
 * `roster.ts` still lists all sixteen members and is untouched: the roster says
 * what a collection WILL hold, this file says what is BUILT. Sixteen rostered
 * and none built is the ordinary "not made yet" state.
 *
 * The file survives its own contents because `registry.ts` imports
 * `WOODLAND_SPECIES`, and because the header above is the measured separation
 * work for all sixteen, which applies to whoever rebuilds them on the assembly
 * route. It also held the only two-kit collection in the repo — fourteen
 * quadrupeds and two songbirds — and that is worth knowing before someone
 * assumes a collection is one shape of animal.
 */
export const WOODLAND_SPECIES: readonly Species[] = []
