/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry.
 *
 * ## What is missing, measured
 *
 * **THE TAIL IS THE ANIMAL AND THE BANK HAS ONE FAN.** A lyrebird in display is
 * two long curved lyre feathers with a shimmering veil of filaments between
 * them, thrown forward over the bird's own head — it is roughly twice the bird
 * long. The bank's only fan is `box-38`, the parrot's, at 0.626 x 0.912 x 0.642,
 * and it is spent on the turkey, the canary, the ostrich, the wolf and this
 * collection's own cockatoo and kookaburra. Worn here it reads as a turkey.
 *
 * Two shapes would finish it and neither exists:
 *
 *   - **A CURVE.** All 100 baked shapes are straight or tapered along a single
 *     axis, and rule 4 as amended bakes a ROTATION into a copy's vertices — it
 *     turns a part and cannot bend one. `collections/ocean.ts` priced the
 *     seahorse against this wall and `collections/birds.ts` the flamingo's bill;
 *     this is the third collection to name it, which is now evidence rather than
 *     a coincidence.
 *   - **A FILAMENT.** Nothing in the bank is a thin translucent sheet. The
 *     thinnest parts are the eye and marking cards, which are opaque, and §4's
 *     texture route has no alpha in it — `animal-jellyfish.ts` found the same
 *     thing from the other end.
 *
 * ## What is standing in
 *
 * The galliform body, unchanged and honestly right — a lyrebird is a big
 * ground-running bird and `animal-chicken.ts` built exactly that: `box-03`, two
 * legs on the pack's row, `box-06` held folded along the flank at the nine-bird
 * sink of 8/16, `tube-02` as the slender bill. The tail is `box-38` carried UP
 * the rear chamfer by `chamfer: true`, which at least throws it over the back
 * the way a displaying lyrebird's goes, rather than trailing.
 *
 * **If you are doing this by hand:** the body needs nothing. Every judgement is
 * in the tail, and the two dials that exist are its burial and whether it is
 * carried or trailed. Anything better than that is a commissioned shape.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own centre and side face — animal-chicken.ts's wing station. */
const HULL_CENTRE_Y = 0.80625
const HULL_SIDE_X = 0.625

/**
 * The nine-bird wing sink, taken unchanged. `box-06`'s tip reaches |z| =
 * 0.456649 where this shell's flat side face reaches only 0.312500, so the tip
 * stands over a surface receded 0.144149 — 0.471328 of the part's own thickness
 * — and the pack's 1/16 grid snaps that up to 8/16. `animal-chicken.ts` §3.
 */
const WING_SINK = 0.5

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const LYREBIRD_ASSEMBLY = defineCreature('animal-lyrebird', {
  palette: {
    coat: 0x6d5a48,    // UNREVIEWED: the plain sooty brown of the body
    flight: 0x8a6a3e,  // UNREVIEWED: the rufous wing and throat
    tail: 0xcbb489,    // UNREVIEWED: the silvered display tail
    limb: 0x59514a,    // UNREVIEWED: the long grey legs and the slender bill
    foot: 0x3d3833,    // UNREVIEWED: JT-044's second tone — the big scaled toes
    eye: 0x211a15,     // UNREVIEWED: the dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The pack's own bird body, and animal-chicken.ts's default. */
  hull: { part: 'box-03', paint: 'coat' },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The chick's and penguin's bar. A lyrebird's bill is slender and slightly
   * downcurved; the curve is the thing the bank has not got, so what is left is
   * the blunt one. `cone-06` is refused for being a parrot's hook. */
  snout: { part: 'tube-02', paint: 'limb' },

  /* THE STAND-IN. The parrot's fan carried UP the rear chamfer — `chamfer: true`
   * solves the midpoint and the 45-degree turn onto its normal together — which
   * at least throws the tail over the back the way a display does. */
  tail: { part: 'box-38', paint: 'tail', chamfer: true },

  legs: false,
  extras: [
    /* Two legs on the pack's own row with JT-044's two-tone foot. A lyrebird's
     * feet and legs are genuinely big; the row height is not a dial. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING, HELD FOLDED, at the nine-bird idiom. A lyrebird barely flies and
     * holds its wings tight; the cheaper read is also the true one. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, HULL_CENTRE_Y, 0],
    },
  ],

  /* `box-06` carries no `wing` role, so the flap is declared rather than
   * automatic — the ostrich's, the seagull's and the hen's own line. */
  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE BODY IS '
    + 'FINE AND THE TAIL IS THE WHOLE PROBLEM. A displaying lyrebird is two long CURVED lyre '
    + 'feathers with a veil of FILAMENTS between them, thrown forward over its own head, and '
    + 'it is about twice the bird long. The bank has one fan, box-38 the parrot\'s, 0.626 x '
    + '0.912 x 0.642, already worn by the turkey, the canary, the ostrich, the wolf and this '
    + 'collection\'s own cockatoo and kookaburra — and on this bird it reads as a turkey. Two '
    + 'shapes would finish it and neither exists. A CURVE: all 100 baked shapes are straight or '
    + 'tapered along one axis and rule 4 bakes a ROTATION into a copy, which turns a part and '
    + 'cannot bend one — collections/ocean.ts priced the seahorse against this and '
    + 'collections/birds.ts the flamingo\'s bill, so this is the third collection to name it. '
    + 'A FILAMENT: nothing in the bank is a thin translucent sheet, the thinnest parts being '
    + 'the opaque eye and marking cards, and the texture route has no alpha in it either — '
    + 'animal-jellyfish.ts reached the same place from the other end. WHAT IS HERE is '
    + 'animal-chicken.ts\'s galliform body unchanged, which is honestly right for a big '
    + 'ground-running bird, with the fan carried UP the rear chamfer by chamfer: true so that it '
    + 'at least goes over the back rather than trailing. Your two dials are its burial and '
    + 'whether it is carried or trailed; anything better is a commission. IT IS ALSO LIGHT — '
    + '389 vertices and 408 triangles against floors of 405 and 422 — which is the same '
    + 'symptom: the real animal\'s tail is most of its geometry and this one\'s is one fan. '
    + 'NEW PALETTE, UNREVIEWED.',
})
