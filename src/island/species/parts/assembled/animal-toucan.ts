/**
 * PLACEHOLDER — THE BILL IS STRETCHED 3x AND THAT IS THE THING YOU ARE BEING
 * ASKED TO RULE ON. Look at it and either keep it or strike it; this file exists
 * so that decision can be made by eye rather than by reading a paragraph.
 *
 * ## THE ONE QUESTION
 *
 * A toucan is a bill with a bird behind it, and the bank is short only on
 * LENGTH. Measured over every nose the pack has, at each shape's own donor
 * burial:
 *
 *       tube-03 / tube-06   0.2314    the deer's and the fox's muzzle
 *       box-24              0.2000    the hog's nose pad
 *       cone-06             0.1833    the parrot's point — the longest BILL
 *       tube-02             0.1000    the chick's and the penguin's bar
 *
 * A toucan's bill is about a third of the whole bird, which on a 1.250 body is
 * roughly 0.6. So the shape family is right — `cone-06` is already a deep
 * triangular bill, and it is the same shape `animal-puffin.ts` wears at its
 * natural size — and the length is 3.3x short.
 *
 * **So this bird wears `cone-06` stretched `[1, 1, 3]`**, which takes it from
 * 0.1833 proud to about 0.55. Nothing else on the animal is stretched.
 *
 * ## WHY THAT IS ARGUABLE RATHER THAN WRONG
 *
 * `PartDef.stretch` is legal on a nose and says so: *"Rule 1. Safe for ears and
 * snouts (§3 measured 2.97x and 2.90x); think twice elsewhere."* A 3x on a
 * snout is therefore just inside what Kenney's own pack varies by, rather than
 * outside it — which is the difference between adapting a part and inventing
 * one.
 *
 * **And you flagged stretched parts on three animals on 2 August**, so it is not
 * ours to take. If 3x reads as a rubber nose, the honest fallback is `cone-06`
 * at its natural size, which is a toucan with a starling's bill — and that is a
 * worse animal, not a safer one. The third option is a commissioned long bill,
 * which would also serve `animal-heron.ts` and `animal-stork.ts`.
 *
 * ## WHAT IS NOT HERE
 *
 * **The bill's bands.** A real toucan's bill carries three or four colours in
 * stripes ALONG its length. `byBand` can only cut where Kenney already cut, and
 * `cone-06` has exactly two bands — the upper mandible and the lower. Those two
 * are spent (orange over a dark base), and there is no third.
 *
 * **The blue eye patch**, for the reason four other animals in this project
 * carry a flag about: rule 3 is one mass, so there is no head to paint.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — every one of the pack's ten hulls shares it. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/**
 * THE NUMBER UNDER REVIEW. 3x along `cone-06`'s own facing axis, which takes it
 * from 0.1833 proud to about 0.55 — a toucan's own proportion on a 1.250 body.
 * §3 measured the pack's snouts varying 2.90x naturally, so this is just inside
 * what Kenney himself drew. Set it to 1 and you have a starling.
 */
const BILL_STRETCH = 3

export const TOUCAN_ASSEMBLY = defineCreature('animal-toucan', {
  palette: {
    coat: 0x1c1a1e,
    bib: 0xf4e9c0,
    flight: 0x141216,
    bill: 0xe08a1c,
    lower: 0x3a2410,
    limb: 0x5a5560,
    eye: 0x120f12,
    pupil: PACK_PUPIL,
  },

  /* `box-39`'s band 3 — Kenney's own white FRONT, the one forward-facing band in
   * any of the pack's ten hulls — as the toucan's yellow bib. Same find
   * `animal-robin.ts` paints red. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'bib' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE BILL, AND THE QUESTION. Kenney's own upper/lower cut carries the only
   * two colours it can have; a real toucan has three or four along its length
   * and there is no third band to give it. */
  snout: {
    part: 'cone-06',
    paint: { base: 'bill', byBand: { 13: 'lower' } },
    stretch: [1, 1, BILL_STRETCH],
  },

  tail: { part: 'box-38', paint: 'flight', at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'PLACEHOLDER, AND THE BILL IS STRETCHED 3x — THAT IS THE ONE THING TO RULE ON. This file '
    + 'exists so you can decide it by eye instead of by reading a paragraph. A toucan is a bill '
    + 'with a bird behind it and the bank is short only on LENGTH: measured over every nose the '
    + 'pack has, at each shape\'s own donor burial, tube-03 and tube-06 stand 0.2314 proud, '
    + 'box-24 0.2000, cone-06 0.1833 (the longest actual BILL) and tube-02 0.1000 — against '
    + 'roughly 0.6 for a toucan on a 1.250 body. The SHAPE family is right: cone-06 is already '
    + 'a deep triangular bill and animal-puffin.ts wears the same shape at its natural size. So '
    + 'this one wears it stretched [1, 1, 3], which takes it from 0.1833 proud to about 0.55, '
    + 'and NOTHING ELSE on the animal is stretched. WHY IT IS ARGUABLE RATHER THAN WRONG: '
    + 'PartDef.stretch is legal on a nose and says so in its own doc — safe for ears and '
    + 'snouts, because §3 measured the pack\'s ears varying 2.97x and its snouts 2.90x — so a 3x '
    + 'on a snout is just inside what Kenney\'s own pack varies by rather than outside it. But '
    + 'you flagged stretched parts on three animals on 2 August, so it is not ours to take. If '
    + '3x reads as a rubber nose, the fallback is cone-06 at its natural size, which is a '
    + 'toucan with a starling\'s bill and is a WORSE animal rather than a safer one; the third '
    + 'option is a commissioned long bill, which would also serve animal-heron.ts and '
    + 'animal-stork.ts. WHAT IS NOT HERE: the bill\'s stripes — a real toucan carries three or '
    + 'four colours ALONG its length, byBand can only cut where Kenney already cut, and cone-06 '
    + 'has exactly two bands, both spent. And the blue eye patch, for the reason four other '
    + 'animals here carry a flag about: rule 3 is one mass, so there is no head to paint. NEW '
    + 'PALETTE, UNREVIEWED.',
})
