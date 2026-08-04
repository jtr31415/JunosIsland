/**
 * The Woodland collection — roster row 9, `ship: 10`, name band `medium`.
 *
 * PB-036 phases 2 and 3. `roster.ts` says which species exist; this file says
 * what all sixteen of Woodland's members ARE, as build data. Nothing here builds
 * geometry — every number is a multiplier off a kit's one reference silhouette,
 * so retuning the whole collection is an edit to a `REF` and not to this file.
 *
 * >>> EVERYTHING FROM HERE TO THE END OF THIS HEADER IS THE KIT ERA, AND THE
 * >>> KITS ARE GONE. Joe retired that route on 2 August 2026 and all sixteen
 * >>> kit builds were deleted; the header was kept because the SEPARATION work
 * >>> in it is measured and survives the mechanism, and it is what the assembly
 * >>> rebuild below was written against. Read the numbers as proportions, not as
 * >>> fields: there is no `REF`, no `body` multiplier and no kit to retune, and
 * >>> a hull is never scaled at all (`HullDef.stretch` is `never`). What still
 * >>> binds is the keep-out ceiling of 1.6, the stockiness argument, and roster
 * >>> §4's look-alike list at the bottom.
 * >>>
 * >>> THE TWO GAME BIRDS ARE BUILDABLE NOW and the paragraph below is out of
 * >>> date on that too. It was written when a bird meant a kit; on the assembly
 * >>> route `animal-chicken` and its four Farm siblings established a galliform
 * >>> idiom out of the pack's own parts — two legs, `box-06` as a folded flank
 * >>> wing, `tube-02` as the bill, `plate-08` as the round eye — and the
 * >>> pheasant and the capercaillie are built on it, not pressed into a
 * >>> quadruped. `tests/island/species-woodland.test.ts` no longer exists; the
 * >>> sixty per-animal test files went on Joe's ruling of 4 August.
 *
 * The paragraph this replaces claimed the collection was COMPLETE, which was
 * true of the kit and not of the standard, and that sentence is why a count of
 * 100 built species was once reported to Joe when the real figure to spec was
 * 17. A file describing its own output is not evidence about whether the output
 * is wanted.
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
import { defineSpecies } from '../define'
/*
 * Evaluated for its SIDE EFFECT, not for a name: each species module under
 * `parts/assembled/` registers its own build as it defines it, and
 * `defineSpecies` picks that up by id. Without this line every record below
 * would find no assembly and would build as a bare hull.
 */
import '../parts/assembled'
import type { Species } from '../types'

/**
 * BEING REBUILT ON THE ASSEMBLY ROUTE, 4 August 2026. Empty before that.
 *
 * All sixteen were once kit-built, and Joe retired that route: *"only the garden
 * animals have been built to spec… the old blocky ones… do not build any more
 * of them"*, then *"remove all the blocky ones from the game completely,
 * including the album."* Deletion rather than replacement was safe because he
 * confirmed the state that made it safe — *"she has not collected any of them
 * yet"* — so no save pointed at a Woodland species. The header above SURVIVED
 * that deletion on purpose: it is the measured separation work for all sixteen
 * and it is the design brief this rebuild was written against.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:194-198` lists them and the
 * order the album shows them. A collection whose file order disagrees with its
 * roster order is a trap `species-garden.test.ts:149` already exists to catch,
 * so a member arriving later is INSERTED at its rostered place, never appended.
 *
 * Every record below is one line. The reasoning for a species' SHAPE — which
 * hull, which part stands in for the antler or the quill the bank does not have,
 * what was refused and why — lives in its own `parts/assembled/animal-<id>.ts`,
 * beside the number it justifies. What belongs here is what is true of the
 * COLLECTION: the header's look-alike work, and one line per species saying
 * which field holds it apart from its nearest neighbour.
 */
export const WOODLAND_SPECIES: readonly Species[] = [

  /* The small squirrel that has to not BE `animal-squirrel`: a whip tail
   * against that animal's plume, and small round ears against its tufts. */
  defineSpecies('animal-chipmunk', 'bespoke'),

  /* The black tail tip is the one fact a child is told about a stoat, and it
   * is Kenney's own end-band on the tiger's whip — paint, not a second part. */
  defineSpecies('animal-stoat', 'bespoke'),

  /* Held apart from the FROZEN `animal-bunny` by the bank's biggest ear paired
   * with its smallest tail. A hare that reads as a big rabbit has failed. */
  defineSpecies('animal-hare', 'bespoke'),
]
