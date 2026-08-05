/**
 * PLACEHOLDER — THE BILL DOES NOT BEND AND ONLY ONE LEG CAN EVER BE RAISED,
 * WHICH IS NONE. Both of those are commissions rather than numbers, and they are
 * the two things a child draws when you say flamingo.
 *
 * ## THE TWO COMMISSIONS, stated so they can be ruled on
 *
 * **A DOWNCURVED BILL, and there is no curve anywhere in the bank.** All 129
 * shapes are straight or tapered along a single axis — measured, not assumed —
 * and rule 4 as amended bakes a ROTATION into a copy's vertices, which turns a
 * part and cannot bend one. A flamingo's bill has a kink in the middle and drops
 * to a black tip; what is here is `cone-06`, the parrot's point, angled down by
 * a spin so at least it aims the right way. **That angle is a gesture, not a
 * joint**, and the same sentence `animal-quail.ts` had to write about its
 * topknot applies here for the same reason.
 *
 * **THE ONE RAISED LEG IS UNSAYABLE, AND IT IS RULE 6 RATHER THAN AN OVERSIGHT.**
 * Paired parts are ONE mesh, mirrored — authored once and placed twice — so there
 * is no way to say "this leg is up and that one is down". Two legs of different
 * lengths would need two separate placements, which `CreatureDef` deliberately
 * does not offer, because the rule exists to stop a left ear and a right ear
 * drifting apart. The pose that names this bird is the price of that rule.
 *
 * ## WHAT DID LAND
 *
 * The neck, which the survey once said was impossible: `animal-goose.ts`'s
 * `box-18` stood on end, at this bird's own lean. And the colour, which on a
 * flamingo is half the animal — one pink over everything, with black flight
 * feathers that only show when it opens its wings.
 *
 * The legs are the pack's own `box-01` on the standard row and are therefore
 * SHORT. A flamingo's are longer than its body. There is no long leg in the
 * bank, `LEG_ROW.y` is what puts feet on zero, and raising the row drops the
 * body rather than lengthening the leg — so this is a stilt bird with no stilts,
 * and that is the third thing to look at.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** Every hull's own flat crown and flat plates. See `animal-heron.ts`. */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625
const FLANK_CENTRE_Y = 0.80625
const NECK_Z = 0.1875

const NECK_STRETCH = 1.6
const NECK_SINK = 0.375

/** THE DIAL. Lower it and the bird stands taller; the ceiling is 2.02. */
const NECK_LEAN = 58

const WING_SINK = 0.5

/**
 * The bill's droop, and it is a GESTURE rather than a joint.
 *
 * `cone-06` attaches `z +1`, and `{ axis: 'x', deg }` takes that facing to
 * `(0, -sin, cos)` — so a positive angle aims it downward. 35 degrees is enough
 * to read as pointing down without the bill disappearing into the throat. There
 * is no value of this that puts a KINK in it, because no shape in the bank is
 * curved and a rotation turns a part rather than bending it.
 */
const BILL_DROOP = 35

export const FLAMINGO_ASSEMBLY = defineCreature('animal-flamingo', {
  palette: {
    coat: 0xea8ea4,
    flight: 0x2a2226,
    bill: 0xf0c8b4,
    tip: 0x1e1a1c,
    limb: 0xd8788e,
    eye: 0xf2e8c0,
    pupil: PACK_PUPIL,
  },

  hull: { part: 'box-03', paint: 'coat' },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK — the goose's idiom, which is the one thing on this bird the
   * survey was wrong to call impossible. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'coat' },

  tail: {
    part: 'box-18',
    paint: 'flight',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, FLANK_CENTRE_Y, -0.625],
  },

  legs: false,
  extras: [
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, FLANK_CENTRE_Y, 0],
    },

    /* THE BILL, aimed down by a spin. Band 15 is its upper mandible and band 13
     * its lower, Kenney's own cut, so the black tip is paint — which is the one
     * part of a flamingo's bill this mechanism can actually say. */
    {
      name: 'bill',
      part: 'cone-06',
      paint: { base: 'bill', byBand: { 13: 'tip' } },
      on: 'head',
      spin: [{ axis: 'x', deg: BILL_DROOP }],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, AND IT CARRIES TWO COMMISSIONS RATHER THAN TWO NUMBERS. FIRST, THERE IS NO '
    + 'CURVE ANYWHERE IN THE BANK: all 129 shapes are straight or tapered along a single axis, '
    + 'and rule 4 as amended bakes a ROTATION into a copy\'s vertices — it turns a part and '
    + 'cannot bend one. A flamingo\'s bill has a kink in it and drops to a black tip; what is '
    + 'here is cone-06 angled down 35 degrees so it at least aims the right way, and that angle '
    + 'is a GESTURE and not a joint. The black tip IS real — Kenney\'s own band 13 on that shape '
    + '— and it is the only part of the bill this mechanism can say. SECOND, THE ONE RAISED LEG '
    + 'IS UNSAYABLE AND IT IS RULE 6: paired parts are ONE mesh mirrored, authored once and '
    + 'placed twice, so there is no way to say this leg is up and that one is down. That rule '
    + 'exists to stop a left ear and a right ear drifting apart, and the pose that names this '
    + 'bird is its price. THIRD, AND WORTH YOUR EYE AS MUCH AS THE OTHER TWO: the legs are the '
    + 'pack\'s own box-01 on the standard row and are therefore SHORT, where a flamingo\'s are '
    + 'longer than its body. There is no long leg in the bank, LEG_ROW.y is what puts feet on '
    + 'zero, and raising the row drops the body rather than lengthening the leg — so this is a '
    + 'stilt bird with no stilts. WHAT DID LAND is the neck, which an earlier survey wrongly '
    + 'called impossible: animal-goose.ts\'s box-18 stood on end, at this bird\'s own lean. NEW '
    + 'PALETTE, UNREVIEWED, and on a flamingo the colour is half the animal.',
})
