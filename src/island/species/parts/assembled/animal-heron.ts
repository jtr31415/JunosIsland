/**
 * PLACEHOLDER — THE BILL IS A TIGER'S TAIL AND IT IS TOO LONG. It is here so you
 * can open it and cut it back, and the two things wrong with it are both
 * measurements rather than taste.
 *
 * ## WHAT IS ACTUALLY IN FRONT OF YOU
 *
 * A heron is a neck and a spear, and until this file neither existed. Both do
 * now, and neither is invented:
 *
 *   - **THE NECK is `animal-goose.ts`'s idiom** — `box-18`, the elephant's
 *     trunk, stood on end by overriding its own `z +1` to `axis: 'y', dir: 1`,
 *     stretched, leaned and buried. Its four numbers are named constants below
 *     and `NECK_LEAN` is the one to pull.
 *   - **THE SPEAR is `wedge-18`, the tiger's tail, stood on end the same way** —
 *     1.0466 long on a 0.200 section at taper 0.52, the longest tapering blade
 *     in the whole bank. Measured over every nose the pack has, the furthest any
 *     of them stands proud is 0.2314 and the longest actual BILL is `cone-06` at
 *     0.1833, against roughly 0.5 for a heron on this scale. So the noses are
 *     2.7x short and this blade is the only thing that reaches at all.
 *
 * ## THE TWO THINGS TO FIX BY HAND
 *
 * **THE BILL OVERSHOOTS.** Unstretched it stands about 0.90 proud where a heron
 * wants roughly 0.5 — the opposite problem from `animal-toucan.ts`, which is 3x
 * short. It is left long ON PURPOSE rather than tuned, because a measured
 * overshoot is a dial you can see and a guess is not: put `stretch: [1, 0.55, 1]`
 * on the bill and it comes back to a heron's own proportion. That stretch is
 * legal on a nose (§3 measured the pack's own snouts varying 2.90x naturally)
 * and it is yours to allow, exactly as the toucan's is.
 *
 * **AND §3.2 SAYS TO LOOK AT IT BEFORE ACCEPTING IT.** That section names a BEAK
 * as one of the handful of shapes whose read survives being moved — a tongue, a
 * beak, a horn, a claw, an eye — and warns that repurposing those is where a
 * part's identity being its placement stops paying and starts costing. This is a
 * TAIL on a bird's face. The geometry says a long tapering blade is exactly a
 * heron's bill; §3.2 says no measured axis will ever tell you whether it READS
 * as one. That is a thing to judge with your eyes and it is the whole reason
 * this animal is a placeholder rather than a build.
 *
 * **THE CEILING REFUSES THE REAL HEIGHT.** `PACK_HEIGHT_MAX` is 2.02 and a
 * heron is mostly leg and neck. The goose measured the same wall: its neck
 * upright is 2.2627 and only 60 degrees of lean brings it under. This bird's
 * neck is shorter than the goose's for that reason alone, and shortening a
 * heron's neck is the compromise that hurts most.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The shared 1.250 cube's own flat crown, which is every hull's. */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625
const FLANK_CENTRE_Y = 0.80625

/** 3/16 forward — the goose's own station, the lowest whose root face is flat. */
const NECK_Z = 0.1875

/**
 * Shorter than the goose's 1.75, because this bird spends its headroom on a bill
 * instead. Raise it and lower `NECK_LEAN` together, watching 2.02.
 */
const NECK_STRETCH = 1.4

/** 6/16, solved against the lean. See `animal-goose.ts`. */
const NECK_SINK = 0.375

/** THE DIAL. Lower it and the bird stands taller; the ceiling is 2.02. */
const NECK_LEAN = 57

/** The nine-bird solid-flank wing burial. */
const WING_SINK = 0.5

export const HERON_ASSEMBLY = defineCreature('animal-heron', {
  palette: {
    coat: 0x9aa2ab,
    belly: 0xeceade,
    flight: 0x4a5058,
    bill: 0xd8b53c,
    limb: 0xc8a860,
    eye: 0xd8c23a,
    pupil: PACK_PUPIL,
  },

  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK — the goose's own idiom, at this bird's own two numbers. */
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

  /* THE HEAD, on the neck's own tip. */
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

    /* THE SPEAR. The tiger's tail stood on end and turned forward — the same
     * move the goose makes with the elephant's trunk. `axis: y, dir: 1`
     * overrides the shape's own `z -1`, and `{ x, 90 }` takes that to (0, 0, 1).
     * Left UNSTRETCHED and therefore too long; see the header. */
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

  flag: 'PLACEHOLDER, AND THE BILL IS A TIGER\'S TAIL. Open it and cut it back. A heron is a neck '
    + 'and a spear and until now neither existed, so both are here and neither is invented: the '
    + 'NECK is animal-goose.ts\'s idiom (box-18 stood on end by overriding z +1 to axis: y, dir: '
    + '1) and the SPEAR is wedge-18, the tiger\'s tail, stood on end the same way — 1.0466 long '
    + 'on a 0.200 section at taper 0.52, the longest tapering blade in the bank. It is the only '
    + 'thing that reaches: measured over every nose the pack has, the furthest any stands proud '
    + 'is 0.2314 and the longest actual bill is cone-06 at 0.1833, against roughly 0.5 for a '
    + 'heron. TWO THINGS TO FIX BY HAND. The bill OVERSHOOTS — about 0.90 proud against the 0.5 '
    + 'wanted, the opposite of animal-toucan.ts, which is 3x short — and it is left long on '
    + 'purpose, because a measured overshoot is a dial you can see and a guess is not. stretch: '
    + '[1, 0.55, 1] on the bill brings it back, and that stretch is yours to allow exactly as '
    + 'the toucan\'s is. AND §3.2 SAYS LOOK BEFORE ACCEPTING: it names a BEAK as one of the few '
    + 'shapes whose read survives being moved, and warns that repurposing those is where the '
    + 'multiplier stops paying. The geometry says a long tapering blade IS a heron\'s bill; §3.2 '
    + 'says no measured axis will ever tell you whether it READS as one. That is your eyes\' job '
    + 'and it is the whole reason this is a placeholder. THE CEILING refuses the real height: '
    + 'PACK_HEIGHT_MAX is 2.02, the goose\'s neck upright measures 2.2627, and this neck is '
    + 'shorter than the goose\'s only so the bill can exist. Shortening a heron\'s neck is the '
    + 'compromise that hurts most.',
})
