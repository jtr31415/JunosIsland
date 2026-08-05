/**
 * The wasp — and roster §4 is the whole design problem, because `animal-bee` is
 * one of the FROZEN 24 and a wasp is a bee that nobody likes.
 *
 * The bee cannot move — roster §1 freezes it — so every separation is made on
 * this side, and there are four, none of them a colour:
 *
 *   - **`box-31`, the lion's SHALLOWER shell** (1.250 x 1.250 x 1.125). The
 *     slenderest hull the pack drew, against the bee's own 1.250 cube. A wasp is
 *     narrow-bodied and hairless where a bee is round and furry.
 *   - **TWO abdominal rings, not one.** `box-04` is the bee's own abdomen
 *     shell-ring and the bee wears a single copy at its waist; this animal wears
 *     two, at z = 0 and z = -0.25, which is a wasp's banded gaster.
 *   - **A STING.** `box-18` turned back to front and hung flush on the rear
 *     face, reaching 0.425 clear — the pointed tip a bee's rounded abdomen has
 *     not got.
 *   - **Six legs**, against the pack's own four on the bee.
 *
 * The wings are `blade-06`/`blade-07`, which ARE the bee's own wings. That is
 * not a collision: they are the pack's only membranous insect wing and a wasp's
 * is the same organ. Reusing them is rule 1 rather than a duplication.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own recorded centre [0, 0.80625, -0.0625], its top and its rear. */
const HULL_MID_Y = 0.80625
const TOP_Y = 1.43125
const REAR_Z = -0.625

/** §3's 0.125 floor over a 0.200-thick wing. See `animal-butterfly.ts`. */
const WING_SINK = 0.625

/** `box-04` halved for rule 3 — the ant's own measurement. Ratio 2.40 to 4.81. */
const BAND_THIN = 0.5

export const WASP_ASSEMBLY = defineCreature('animal-wasp', {
  /* NEW AND UNREVIEWED — the first wasp ever built here. Brief §19 is "bright,
   * never scary", which is a real tension on this animal: the yellow is the
   * brightest thing in the collection and nothing about the model is sharp
   * except one blunt tail stub. */
  palette: {
    coat: 0xf2c53a,   // UNREVIEWED: THE ANIMAL — a bright wasp yellow
    belly: 0xfaeab6,  // UNREVIEWED: the pale underside, and the sclera
    mark: 0x2b2620,   // UNREVIEWED: the two bands and the sting, near-black
    wing: 0xdfe4e6,   // UNREVIEWED: the wings, a pale smoky grey
    limb: 0x4a4136,   // UNREVIEWED: legs and antennae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallower shell — the slenderest of the pack's ten, and the
   * first axis of separation from the frozen bee. Its front face is 0.500 and
   * the eye card still sits at the absolute 0.6350, floating 0.135 proud
   * exactly as the lion's own does. */
  hull: 'box-31',

  belly: 0.375,

  legs: { x: 0.27, z: 0.3125 },

  /* The round card five donors share. */
  eyes: { part: 'plate-08' },

  /* The bee's and the caterpillar's own antenna, by pure donor transfer. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE WINGS. `blade-06`, the pack's own bee wing — the same organ on the
     * same insect order, which is rule 1 rather than a collision. */
    { name: 'wing', part: 'blade-06', paint: 'wing', kind: 'pair', sink: WING_SINK, at: [0.40, TOP_Y, -0.0625] },
    /* TWO BANDS, where the bee wears one. Centred by `sink: 0.5`, at their own
     * diameter and half their own thickness. */
    { name: 'band-fore', part: 'box-04', paint: 'mark', stretch: [1, 1, BAND_THIN], sink: 0.5, at: [0, HULL_MID_Y, -0.0625] },
    { name: 'band-aft', part: 'box-04', paint: 'mark', stretch: [1, 1, BAND_THIN], sink: 0.5, at: [0, HULL_MID_Y, -0.375] },
    /* THE STING. `box-18` — the bank's only stub, measured `z +1` at a burial of
     * exactly zero — turned back to front so it sits flush on the rear face and
     * reaches 0.4252 clear. `animal-firefly.ts` hangs the same shape at the same
     * height for a lamp tip; here it is the point a bee has not got. */
    { name: 'sting', part: 'box-18', paint: 'mark', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, REAR_Z] },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, 0.18125, 0] },
  ],

  flag: 'ROSTER §4, AND IT IS THE SHARPEST CASE IN THIS COLLECTION: `animal-bee` is one of '
    + 'the frozen 24 and a wasp is genuinely the same silhouette. Four measured things hold '
    + 'them apart and none of them is the yellow — the SHALLOWER `box-31` hull against the '
    + 'bee\'s cube, TWO abdominal rings against its one, a `box-18` STING it has not got, '
    + 'and six legs against its four. If it still reads as the bee in a different colour, '
    + 'the thing to change is the hull, not the palette. ALSO: THE WAIST IS DRAWN, NOT '
    + 'BUILT. A wasp\'s petiole is a genuine pinch between two masses and rule 3 allows one, '
    + 'so it is a ring on a single shell — the same wall `animal-ant.ts` reports. ALSO: THE '
    + 'STING IS A BLUNT 0.345 STUB, which is deliberate under brief §19 ("bright, never '
    + 'scary") as well as forced by the bank; a real point would want a `cone` and the '
    + 'nearest, `cone-01`, is this collection\'s antenna everywhere else. ALSO: NEW '
    + 'PALETTE, UNREVIEWED.',
})
