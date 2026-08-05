/**
 * PLACEHOLDER — SAME TIGER'S-TAIL BILL AS THE HERON, and on a stork it is a
 * BETTER fit than on that bird, which is the one thing worth knowing before you
 * open it.
 *
 * **Read `animal-heron.ts` first.** The neck and the spear are both its idioms
 * and the derivations live there: `box-18` stood on end for the neck
 * (`animal-goose.ts`'s own move), and `wedge-18`, the tiger's tail, stood on end
 * and turned forward for the bill.
 *
 * ## WHY THIS BIRD IS THE ONE TO TRY IT ON
 *
 * A heron's bill is a fine dagger and a stork's is straight, thick and blunt.
 * `wedge-18` is 0.200 across on a 1.0466 length — THICK for its length rather
 * than fine — so the shape the survey called an approximation for the heron is
 * closer to right here. If the stood-on-end blade is going to be accepted
 * anywhere, it should be accepted on this animal first and the heron judged
 * against it.
 *
 * It is also left UNSTRETCHED for the same reason the heron's is: about 0.90
 * proud where a stork wants roughly 0.55. `stretch: [1, 0.6, 1]` on the bill is
 * the fix and it is one number.
 *
 * ## WHAT IS STILL MISSING
 *
 * **The red.** A stork's bill and legs are scarlet and its body is white with
 * black flight feathers. All three of those are here. What is not is the bare
 * red FACE — rule 3 is one mass, so there is no head to paint separately, and
 * `Paint.patch` takes a height with no z term. The same wall four other animals
 * in this project carry a flag about.
 *
 * **The height.** `PACK_HEIGHT_MAX` is 2.02 and a stork is mostly leg. The neck
 * is short and leaned for that reason alone; `NECK_LEAN` is the dial.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** Every hull's own flat crown and flat plates. See `animal-heron.ts`. */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625
const FLANK_CENTRE_Y = 0.80625
const NECK_Z = 0.1875

/** The heron's, unchanged: this bird spends its headroom on the bill too. */
const NECK_STRETCH = 1.4
const NECK_SINK = 0.375

/** THE DIAL. Lower it and the bird stands taller; the ceiling is 2.02. */
const NECK_LEAN = 57

const WING_SINK = 0.5

export const STORK_ASSEMBLY = defineCreature('animal-stork', {
  palette: {
    coat: 0xf4f2e8,
    flight: 0x24262a,
    bill: 0xc4372a,
    limb: 0xb8332a,
    eye: 0x1a1614,
    pupil: PACK_PUPIL,
  },

  hull: { part: 'box-03', paint: 'coat' },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK — `animal-goose.ts`'s idiom by way of `animal-heron.ts`. */
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

    /* THE SPEAR, thick rather than fine, which is what a stork has. */
    {
      name: 'bill',
      part: 'wedge-18',
      paint: 'bill',
      on: 'head',
      axis: 'y',
      dir: 1,
      spin: [{ axis: 'x', deg: 90 }],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, AND IT IS THE BIRD TO JUDGE THE STOOD-ON-END BILL ON. It wears the same '
    + 'wedge-18 spear as animal-heron.ts — the tiger\'s tail, stood on end and turned forward, '
    + 'which is animal-goose.ts\'s own move applied to a bill — and on a stork it fits BETTER '
    + 'than on a heron: a heron\'s bill is a fine dagger and a stork\'s is straight, thick and '
    + 'blunt, and wedge-18 is 0.200 across on a 1.0466 length, which is thick for its length. '
    + 'If that reuse is going to be accepted anywhere it should be accepted here first and the '
    + 'heron judged against it. §3.2 still says look before accepting: it names a BEAK as one '
    + 'of the shapes whose read survives being moved, and no measured axis will tell you '
    + 'whether a tail READS as a bill. Left UNSTRETCHED and therefore too long — about 0.90 '
    + 'proud where a stork wants roughly 0.55 — on purpose, because a measured overshoot is a '
    + 'dial you can see; stretch: [1, 0.6, 1] on the bill is the fix and it is one number. THE '
    + 'BARE RED FACE IS NOT HERE: rule 3 is one mass so there is no head to paint on its own, '
    + 'and Paint.patch takes a height with no z term. The bill and the legs carry the scarlet '
    + 'instead. THE HEIGHT is the usual wall — PACK_HEIGHT_MAX is 2.02 and a stork is mostly '
    + 'leg, so the neck is short and leaned and NECK_LEAN is the dial. NEW PALETTE, UNREVIEWED.',
})
