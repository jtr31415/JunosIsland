/**
 * The Birds collection — roster row 5, `ship: 3`, name band `short`.
 *
 * NEW FILE, 4 August 2026. Birds is the next collection in `PIPELINE_ORDER`
 * with nothing in it: Farm, Night Time and Africa are BUILT and merely unpushed,
 * and Woodland closed the same day. `roster.ts:104-115` says which eighteen
 * exist; this file says what is BUILT, and it is deliberately partial.
 *
 * ===========================================================================
 * ## WHAT THE PACK CAN AND CANNOT MAKE A BIRD OF
 * ===========================================================================
 *
 * `docs/how-the-animals-are-made.md` §14 called Birds "partial: there are two
 * beak designs in the whole pack, against a list that wants a swan, a heron, a
 * flamingo, a pelican and a toucan." That is still the right reading, and §3.1
 * warns that the same document's headline counts were made under the assumption
 * that a part's role is fixed by its label — which is wrong. So the survey below
 * is made against the BANK rather than against that paragraph.
 *
 * **THE BILLS.** Two, and they are genuinely different animals:
 *
 *   - `tube-02` — the chick's and the penguin's, 0.460 x 0.252 x 0.200, a blunt
 *     bar. Every galliform in the project wears it and so do the kiwi and the
 *     nightjar. It is the bill for a bird that picks things off the ground.
 *   - `cone-06` — the parrot's, taper 0, a true point, 0.400 x 0.401 x 0.287,
 *     reaching 0.183 against `tube-02`'s 0.100. The four cage birds wear it. It
 *     is the bill for a bird that takes an insect or a seed.
 *
 * Between them they carry every PASSERINE on the list. What they cannot carry
 * is a spatulate bill (the duck), a spear (the heron, the stork), a pouch (the
 * pelican), a filter (the flamingo) or an outsized coloured hook (the toucan,
 * the puffin). Nothing in the bank is any of those, and §5 of
 * `docs/building-animals-from-parts.md` is explicit that we do not invent the
 * missing parts — a species that needs one goes through the escape clause or
 * waits for Joe to commission a shape.
 *
 * **THE NECK IS THE OTHER WALL, and it is worse than the bill.** Rule 3 is one
 * mass: head and body are a single form and there is no seam at the neck on any
 * of the 24 originals. A swan, a heron, a stork and a flamingo are all NECK —
 * it is the first thing a child names them by — and there is no mechanism in
 * this method that puts one on an animal. A hull is never scaled
 * (`HullDef.stretch` is `never`), so it cannot even be faked by proportion.
 * Those four are the collection's hard core.
 *
 * **THE WINGS ARE FINE**, and this is the half that is better than the old
 * paragraph says. The bank holds six wing shapes across three families —
 * `wedge-19`/`wedge-20` (the chick's and the parrot's), `blade-06`/`blade-07`
 * (the bee's and the penguin's) and `box-42`/`box-43` (the fish's fins) — and
 * `withDefaultFlap` in `creature.ts` gives anything carrying the `wing` role a
 * wingbeat with no `motion` line to remember. On top of that nine birds already
 * share the `box-06` SOLID-FLANK idiom `animal-chicken.ts` §3 derived, which is
 * an ear shape turned onto the flank and buried half its depth so it reads as a
 * folded wing. Wings are a solved problem here.
 *
 * ===========================================================================
 * ## THE PASSERINE IDIOM, WHICH IS WHAT THIS FILE IS BUILT ON
 * ===========================================================================
 *
 * Five of the eighteen are small perching birds and they are one animal with
 * five palettes, which is honest rather than lazy: a robin, a wren, a blue tit,
 * a blackbird and a magpie ARE the same shape at different sizes and colours,
 * and every difference a child reads between them is a MARKING.
 *
 * So the shape is settled once — `box-39` on two legs with `cone-06`,
 * `plate-08` and a `wedge-19` wing — and the collection's design problem becomes
 * where each marking comes from. Three mechanisms carry all of it and none of
 * them costs a triangle:
 *
 *   - **`box-39`'s band 3** is 22 triangles of Kenney's own white FRONT, running
 *     x +/-0.500, local y -0.625 to 0.426 and z -0.313 to 0.625 — the only band
 *     in any of the pack's ten hulls that faces FORWARD rather than up or
 *     sideways. It is a bird's breast, exactly, and it is what makes a robin
 *     red and a blue tit yellow for nothing. (`animal-pine-marten.ts` found it
 *     one collection earlier, for a mustelid's bib.)
 *   - **`belly`**, the painted line, for a bird whose underside is pale rather
 *     than whose breast is coloured.
 *   - **The marking cards**, `plate-10` and `plate-11`, at the card shell
 *     x = 0.635 — a white cheek, a wing flash — which is the idiom
 *     `animal-nightjar.ts` established and `animal-quail.ts` spends.
 *
 * ===========================================================================
 * ## WHY THE NUMBERS ARE STOCKIER THAN THE ANIMALS
 * ===========================================================================
 *
 * The same reason every other collection gives, and it bites hardest here. All
 * 24 live GLBs measure 1.43 to 2.02 tall, mean 1.65, and `HEIGHT_FLOOR` is
 * 1.43125 — a bare hull standing on the pack's own leg row. **A wren cannot be
 * small.** It stands the same height a swan would, and roster §1 forbids the
 * alternative, which is an animal that reads as a stranger beside the fox. So
 * size is spent on SHAPE and PALETTE, never on scale, and the wren below is the
 * roundest and plainest rather than the smallest.
 *
 * ## FOUR OF THE FIVE COME IN UNDER THE PACK'S VERTEX FLOOR, AND IT IS SAID HERE
 *
 * Rule 9's measured band is 405 to 1626 vertices and these birds run 345 to 439:
 * the wren 345, the blackbird 357, the robin 361, the blue tit 385, the magpie
 * 439. That is a PACK NORM and it reports rather than fails — Joe's ruling of 3
 * August, because the band is a measurement of Kenney's twenty-four and his own
 * deliberate designs were arriving as failures with an authoritative number
 * attached — and the mole (389), the goldfish (342) and the budgie (370) already
 * ship under it.
 *
 * It is stated here because the CAUSE is a design decision rather than an
 * accident, and it is one Joe could reverse in a line. These birds wear
 * `wedge-19`, the chick's and the parrot's REAL wing, placed by pure donor
 * transfer; nine other birds in the project wear `box-06`, an ear turned onto
 * the flank, which is heavier and carries no `wing` role and therefore has to
 * declare its own `motion`. The real wing is rule 1's own answer — adapt before
 * authoring, and prefer the part the pack actually drew for the job — and it
 * costs about sixty vertices a bird. If the counts matter more than the
 * provenance, the swap is one line per species.
 *
 * ## WHY THERE ARE NO `threat` RECORDS
 *
 * Roster §5 wants statuses "true, checkable", and `Threat.checkedDate` exists so
 * a status is a dated reading of the Red List rather than a memory. Writing
 * categories here from recall would produce records that LOOK checked. Absent
 * means "not recorded yet", which is honest.
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
 * FIVE OF EIGHTEEN, and the thirteen missing are a queue rather than a hole
 * somebody forgot. The survey above says which of them are waiting on effort
 * and which are waiting on a shape the pack does not contain.
 *
 * IN ROSTER ORDER, which is the order `roster.ts:108-114` lists them and the
 * order the album shows them. A member arriving later is INSERTED at its
 * rostered place, never appended — `species-garden.test.ts:149` is the trap
 * that catches a file whose order has drifted from the roster's.
 *
 * Every record below is one line. The reasoning for a species' SHAPE lives in
 * its own `parts/assembled/animal-<id>.ts`, beside the number it justifies.
 * What belongs here is what is true of the COLLECTION — the survey above — and
 * one line per species saying which marking holds it apart from its neighbours.
 */
export const BIRDS_SPECIES: readonly Species[] = [

  /* The exemplar the other four passerines are cut from, and the one that
   * spends `box-39`'s forward band on the marking it was made for. */
  defineSpecies('animal-robin', 'bespoke'),

  /* The same band in yellow, plus the white cheek that is the only thing
   * holding a blue tit apart from every other small yellow bird. */
  defineSpecies('animal-blue-tit', 'bespoke'),

  /* The pied one, and the only passerine here with a long tail. */
  defineSpecies('animal-magpie', 'bespoke'),

  /* The roundest and plainest — the forward band deliberately UNSPENT, which is
   * what a wren is — and the only cocked tail in the project. */
  defineSpecies('animal-wren', 'bespoke'),

  /* One colour and one contrast: black everywhere, with the yellow bill and
   * eye-ring that are the whole of a blackbird. */
  defineSpecies('animal-blackbird', 'bespoke'),
]
