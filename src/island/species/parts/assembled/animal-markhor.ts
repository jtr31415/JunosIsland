/**
 * PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. What is
 * missing is A CURVE, and on this animal it is a HELIX: a markhor's horns are
 * corkscrews standing a metre out of its skull, and without them this is a goat.
 * The measurement is `collections/ice.ts`'s and it has not changed — all 100
 * baked shapes are straight or tapered along a single axis, and rule 4 as
 * amended bakes a ROTATION into a copy's vertices, which turns a part and cannot
 * bend one. `animal-dall-sheep.ts` shipped as a placeholder for the same gap,
 * and Ocean's seahorse, Birds' flamingo, Outback's frilled lizard and Critters'
 * snail all priced it before that.
 *
 * WHAT IS HERE IS THE FURTHEST ANYONE HAS TAKEN IT, and it is worth judging on
 * its own terms. `animal-water-buffalo.ts` found that a ROLL about a tusk's own
 * long axis, applied FIRST, turns `wedge-11`'s built-in 15.5-out / 15.0-down
 * bend into a curl — *"the crescent curves because the SHAPE curves"* — and it
 * chained three segments that way to make a horn that genuinely bends. This runs
 * that idiom with the roll ADVANCED 120 degrees per segment instead of held
 * constant, which is what a corkscrew is: three straight chords, each turned a
 * third of a revolution about the axis of the last. WHAT TO TRY FIRST: change
 * `HORN_ROLL_STEP` to 90 or 144 and see which reads; then add a fourth segment
 * on `on: 'horn-tip'` for 38 triangles, watching the height, which is already
 * 1.94 of the pack's 2.02.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `animal-ox.ts`'s solved horn station: the cube's own x/y chamfer chord. */
const BEVEL_CHORD_X = 0.46875
const BEVEL_CHORD_Y = 1.275
const HORN_Z = 0.0625

/**
 * A third of a turn per segment. This is the whole experiment: the water buffalo
 * holds its roll constant across three chords and gets a crescent; advancing it
 * is the only difference between a crescent and a screw.
 */
const HORN_ROLL_STEP = 120

/** `animal-goat.ts`'s beard station — rule 3 leaves no chin, so it hangs off the
 * front-bottom chamfer chord. `animal-wildebeest.ts` uses the same two numbers. */
const CHIN_Y = 0.3375
const CHIN_Z = 0.46875

const REAR_PLATE_Y = 0.80625

export const MARKHOR_ASSEMBLY = defineCreature('animal-markhor', {
  palette: {
    coat: 0xa8926f,    // UNREVIEWED: sandy grey-fawn, a wild goat's winter coat
    pale: 0xe6ddc9,    // UNREVIEWED: the sclera. There is no belly line on this animal
    face: 0x6f5f48,    // UNREVIEWED: the darker head and ears
    horn: 0x5b4a35,    // UNREVIEWED: dark horn — a markhor's are almost black
    mark: 0x2a231a,    // UNREVIEWED: the beard and the nose
    limb: 0x8f7a5c,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lean cube — `animal-goat.ts`'s shell, because this animal is a goat and
   * pretending otherwise with a shape would be inventing. No belly line: a
   * markhor is one sandy colour with dark points, so `pale` is the sclera. */
  hull: { part: 'box-03' },
  under: 'pale',

  /* JT-044 at the HOOF end, 4/16 — `animal-sheep.ts` §4 predicts this k by name
   * for every lean caprid and `animal-goat.ts` and `animal-dall-sheep.ts` both
   * take it. Not retuned: it is a measurement off `box-01`'s own bevel. */
  legs: { paint: { base: 'limb', patch: { below: 'horn', at: 0.25 } } },

  /* THE HOG'S EAR ON ITS SIDE — `animal-goat.ts`'s own placement, part, axis and
   * station, because a markhor's ears are a goat's ears and this file is not
   * going to invent a difference that is not there. */
  ears: { part: 'cone-04', paint: 'face', axis: 'x', sink: 0.6, at: [0.625, 1.0625, 0.125] },

  /* The fox's muzzle on the cube's 0.625 front plate, the goat's own face. */
  snout: { part: 'tube-06', paint: 'face' },
  nose: { part: 'box-14', paint: 'mark' },

  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* SEGMENT ONE. Roll 0, then aim: `{ y, 90 }` takes `wedge-11`'s `z +1` to
     * `x +1` — `animal-ox.ts`'s own first spin — and `{ z, 65 }` stands it up to
     * (0.423, 0.906, 0), which is steep, because a markhor's horns rise rather
     * than sweep. Unstretched: the height budget is spent on the other two. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'horn',
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 65 }],
      at: [BEVEL_CHORD_X, BEVEL_CHORD_Y, HORN_Z],
    },

    /* SEGMENT TWO, hung off segment one's own built outer face and ROLLED a
     * third of a turn. Cut to 0.85 so the profile keeps narrowing. */
    {
      name: 'horn-mid',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'horn',
      stretch: [0.85, 0.85, 0.85],
      spin: [
        { axis: 'z', deg: HORN_ROLL_STEP },
        { axis: 'y', deg: 90 },
        { axis: 'z', deg: 72 },
      ],
      on: 'horn',
    },

    /* SEGMENT THREE, rolled two thirds of a turn and standing nearly vertical.
     * Cut to 0.7. The three tips run 0.445, 0.378, 0.312 of length, which is the
     * taper a horn has, and the top lands at about 1.94 against a 2.02 ceiling. */
    {
      name: 'horn-tip',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'horn',
      stretch: [0.7, 0.7, 0.7],
      spin: [
        { axis: 'z', deg: HORN_ROLL_STEP * 2 },
        { axis: 'y', deg: 90 },
        { axis: 'z', deg: 80 },
      ],
      on: 'horn-mid',
    },

    /* THE BEARD — `animal-wildebeest.ts`'s part on `animal-goat.ts`'s station,
     * cut long, because a markhor's is the other thing anyone notices. */
    {
      name: 'beard',
      part: 'cone-01',
      paint: 'mark',
      /* 1.35 and not longer, which is the longest beard this pack can hang.
       * `buildAssembly` grounds the model on its LOWEST point, so a beard that
       * reaches the floor lifts the FEET off it: at 2.2 this animal built with
       * its legs 0.144 in the air and at 1.5 with them 0.012 in the air.
       * `animal-wildebeest.ts` hangs the same shape at 1.3 from the same
       * y = 0.3375 chord, which is where that ceiling comes from. */
      stretch: [1.3, 1.35, 1.3],
      spin: [{ axis: 'x', deg: 135 }],
      at: [0, CHIN_Y, CHIN_Z],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. WHAT IS MISSING '
    + 'IS A CURVE, and on this animal it is a HELIX: a markhor is a corkscrew horn on a goat, '
    + 'and without the screw it is just a goat. All 100 baked shapes are straight or tapered '
    + 'along one axis, and rule 4 as amended bakes a ROTATION into a copy\'s vertices — it '
    + 'turns a part and cannot BEND one. animal-dall-sheep.ts is a placeholder for the same '
    + 'gap, and Ocean\'s seahorse, Birds\' flamingo, Outback\'s frilled lizard and Critters\' '
    + 'snail all priced it first. WHAT IS HERE IS THE FURTHEST THE IDIOM GOES: '
    + 'animal-water-buffalo.ts found that a ROLL about a tusk\'s own long axis, applied FIRST, '
    + 'turns wedge-11\'s built-in 15.5-out/15.0-down bend into a curl — "the crescent curves '
    + 'because the SHAPE curves" — and chained three segments with the roll HELD CONSTANT. '
    + 'This chains three with the roll ADVANCED 120 degrees each time, which is the only '
    + 'difference between a crescent and a screw. Whether three chords at a third of a turn '
    + 'apart read as a spiral at tablet distance is the thing on the bench and I cannot judge '
    + 'it from the numbers. WHAT TO TRY FIRST: change HORN_ROLL_STEP to 90 or 144; then a '
    + 'fourth segment on `on: "horn-tip"` costs 38 triangles, but watch the height, which is '
    + 'already about 1.94 against the pack\'s 2.02. Everything else is animal-goat.ts\'s, '
    + 'deliberately and without a shape invented to make the two differ: the same lean cube, '
    + 'the same hog\'s ear worn on its side at the same station, the same fox muzzle, JT-044 at '
    + 'the same 4/16. A markhor IS a goat and the horn is the whole of the difference. NEW '
    + 'PALETTE, UNREVIEWED.',
})
