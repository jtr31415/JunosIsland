/**
 * The hippo — the widest shell in the pack, and the mouth is the whole read.
 *
 * `box-12`, the cow's and the deer's, is the only hull wider than it is tall
 * (1.539 x 1.250 x 1.250). A hippo is the animal that wants exactly that and
 * nothing else in Africa is on it for the same reason: the hyena takes it for
 * shoulders and the wildebeest for a forequarter, and this one takes it for
 * BULK.
 *
 * **The muzzle is `tube-07`, the giraffe's nose, stretched 1.7x across and 1.2x
 * up.** §3 measured the pack's own snouts varying 2.90x naturally, so this is
 * well inside what Kenney himself drew, and the RATIO is the animal: a hippo's
 * muzzle is roughly twice as wide as it is deep. The nose pad on the front of it
 * is `box-24`, the hog's own, hung off the muzzle's placed plane by `on`.
 *
 * **The ears are `box-05`, the smallest in the bank** (0.221 x 0.232) — tiny
 * round ears on a huge head, which is the second thing a child draws. Its
 * recorded burial is ZERO and its recorded z is the bee's 0.573, neither of
 * which transfers to this shell, so both are re-solved below.
 *
 * NO TEETH, deliberately, for the crocodile's reason: brief §19 is "bright,
 * never scary" and a hippo's tusks are where that bites.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own recorded centre, and the flat rear plate. Both `box-03`'s. */
const HULL_CENTRE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** 10/16 wide and 12/16 tall of the giraffe's own nose. See the header. */
const MUZZLE_STRETCH: [number, number, number] = [1.7, 1.2, 1]

export const HIPPO_ASSEMBLY = defineCreature('animal-hippo', {
  palette: {
    coat: 0x8a7a80,    // UNREVIEWED: wet slate-mauve, which is what a hippo is
    belly: 0xd9a89c,   // UNREVIEWED: the pink underside, and the sclera
    muzzle: 0x9b8a8c,  // UNREVIEWED: the muzzle, a shade up from the coat
    limb: 0x6f6165,    // UNREVIEWED: the short legs, a shade under it
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-12' },
  belly: 0.375,

  /* Short and set WIDE, which is how a barrel stands. The default x scales with
   * the hull, so only the wheelbase is named. */
  legs: { z: 0.28 },

  /* High on the head, because a hippo's eyes sit on top of its skull — the one
   * thing rule 5 leaves free is where on the plate the card goes. */
  eyes: { y: 1.02 },

  /* Both numbers re-solved, not the shape's own: `box-05` records a burial of
   * ZERO at z = 0.573, which is the bee's placement on a hull that is not this
   * one and would stand the whole ear out over the front chamfer. 9/16 buries
   * 0.130 — past §3's 0.125 floor — and the station keeps the footprint inside
   * the flat top square. `animal-cheetah.ts` takes the same solve. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.5625, at: [0.22, 1.43125, 0.2] },

  /* The bank's only stub, turned to face backwards at the hull's own centre —
   * a hippo's tail is a short flat paddle and this is as near as the bank gets. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
  },

  snout: { part: 'tube-07', paint: 'muzzle', stretch: MUZZLE_STRETCH },
  nose: { part: 'box-24', paint: 'muzzle' },
})
