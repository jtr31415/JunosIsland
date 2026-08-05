/**
 * PLACEHOLDER — NOT A FINISHED ANIMAL. Joe, 5 August: *"put something in for the
 * unbuildable ones anyway so i can do it manually."* This is that entry.
 *
 * ## What is missing, measured
 *
 * **A CURVE. There is not one anywhere in the bank.** All 100 baked shapes are
 * straight or tapered along a single axis, and rule 4 as amended bakes a
 * ROTATION into a copy's vertices — it turns a part and cannot bend one. A
 * seahorse is two curves and nothing else: an S through the body and a spiral in
 * the tail. `collections/birds.ts` priced the flamingo's downcurved bill against
 * the same wall and reached the same answer.
 *
 * **THE HEAD SITS AT A RIGHT ANGLE TO THE BODY**, which is sayable — the goose's
 * neck idiom turns `box-18` to any angle — but head plus upright body runs at
 * the pack's height ceiling. `animal-goose` measured that exactly: upright
 * 2.2627, and it ships at 60 degrees and 1.9560 against a 2.02 ceiling with
 * 0.064 of headroom in the whole pack. This animal is on `box-21`, which is
 * 0.255 TALLER than the cube the goose used, so it has even less to give.
 *
 * ## What is standing in
 *
 * The tallest hull in the bank stood upright as the body; `box-18` as a short
 * forward head at the crown with `tube-03`, the longest muzzle in the bank, as
 * the tubular snout on the end of it; `box-04` as a coil at the base, which is
 * the slow worm's and corn snake's own answer to a legless height toll and is
 * the nearest this bank comes to a curled tail; and `wedge-19` as the dorsal.
 *
 * **If you are doing this by hand:** the coil is the only part here that even
 * gestures at a spiral, and sliding it down and back is the cheapest thing that
 * makes the animal read. The head angle is the other dial and it is capped by
 * the ceiling, not by taste — check the height after every move.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own crown, where the head joins. */
const CROWN_Y = 1.68633

export const SEAHORSE_ASSEMBLY = defineCreature('animal-seahorse', {
  palette: {
    coat: 0xd9a12c,
    belly: 0xf3dfa8,
    fin: 0xb87f1c,
    snout: 0xc08f24,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-21',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 1.3 },

  extras: [
    /* THE HEAD: the goose's neck idiom, short and leaned forward. */
    {
      name: 'head',
      part: 'box-18',
      paint: 'coat',
      axis: 'y',
      dir: 1,
      stretch: [1, 0.6, 1],
      spin: [{ axis: 'x', deg: 72 }],
      sink: 0.35,
      at: [0, CROWN_Y, 0.0625],
    },
    /* THE SNOUT: the longest muzzle in the bank, on the head's own built tip. */
    { name: 'snout', part: 'tube-03', paint: 'snout', on: 'head' },
    /* THE COIL, standing in for a spiral tail — the slow worm's shape. */
    {
      name: 'coil',
      part: 'box-04',
      paint: 'coat',
      spin: [{ axis: 'x', deg: 90 }, { axis: 'x', deg: 90 }],
      stretch: [0.6, 0.6, 0.8],
      axis: 'z',
      dir: 1,
      sink: 0.6,
      at: [0, 0.35, -0.5625],
    },
    /* The dorsal, on the back where a seahorse's single fin sits. */
    {
      name: 'dorsal', part: 'wedge-19', paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }, { axis: 'y', deg: 90 }], sink: 0.3, at: [0, 1.0, -0.625],
    },
  ],

  flag: 'PLACEHOLDER, NOT A FINISHED ANIMAL — put in so you can do it by hand. THE BANK '
    + 'HAS NO CURVE AT ALL: all 100 shapes are straight or tapered along one axis, and '
    + 'rule 4 bakes a ROTATION into a copy, which turns a part and cannot bend one. A '
    + 'seahorse is an S-curved body and a spiral tail and neither is sayable at any '
    + 'price. What is here is the tallest hull stood upright, the goose\'s neck idiom '
    + 'as a right-angled head with the bank\'s longest muzzle on it, and the slow '
    + 'worm\'s box-04 coil standing in for the spiral. WATCH THE HEIGHT if you move the '
    + 'head: the goose measured 2.2627 upright against a 2.02 ceiling and had to lean '
    + '60 degrees to fit, and box-21 is 0.255 taller than the cube it did that on.',
})
