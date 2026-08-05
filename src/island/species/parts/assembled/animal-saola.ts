/**
 * The saola — the Asian unicorn, and the one bovid in this project whose horns
 * are supposed to be straight.
 *
 * Nine horned or antlered animals are built (`animal-buffalo`, `animal-ox`,
 * `animal-water-buffalo`, `animal-goat`, `animal-wildebeest`, `animal-antelope`,
 * `animal-elk`, `animal-reindeer`, `animal-dall-sheep`) and **every single one
 * of them is flagged for the same reason: the bank holds no curve.** A saola's
 * horns are long, straight and very nearly parallel, so this is the animal where
 * the bank's whole vocabulary of straight tapers is exactly right rather than a
 * compromise.
 *
 *   - **`wedge-11` stood on end** by `animal-warthog.ts`'s own spin, at −110
 *     degrees rather than −90 so the pair leans BACK by twenty. No splay at all:
 *     `animal-warthog.ts` splays its tusks 20 degrees out and `animal-goat.ts`
 *     solved a 13-to-29 window for the same station; a saola's horns want the
 *     bottom of that range, which is zero.
 *   - **Stretched 2.0x along the shape's own long axis**, which puts the tips at
 *     y = 1.953 against the pack's 2.02 ceiling. That is the number that caps
 *     it, not taste.
 *   - **THE WHITE FACE.** Four `plate-13` cards, two over the brows and two down
 *     the cheeks, which is the marking every photograph of this animal shows and
 *     the only one this bank can place exactly.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown and its own centre height. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625
/** Rule 5's eye plane, which is also where a flat face card belongs. */
const FACE_Z = 0.635

/**
 * 2.0x along `wedge-11`'s own longest axis (z, 0.445163) before the spin stands
 * it up: 0.8904 of reach, tips at 1.953 against `PACK_HEIGHT_MAX` of 2.02.
 * 2.2x is 2.005 and 2.4x is over. The ceiling is what sets it.
 */
const HORN_LONG: [number, number, number] = [1, 1, 2]

export const SAOLA_ASSEMBLY = defineCreature('animal-saola', {
  palette: {
    coat: 0x4a3a2e,    // UNREVIEWED: dark chocolate brown, which is nearly the whole animal
    belly: 0xefe6d6,   // UNREVIEWED: the pale throat and underside, and the sclera
    mark: 0xf7f2e6,    // UNREVIEWED: the white face cards — the animal's one marking
    horn: 0x2e2a26,    // UNREVIEWED: near-black, which a saola's horns are
    limb: 0x3a2e24,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* Low — a saola's pale part is its throat and the line under it, not a flank
   * belly, so 6/16 sits below the pack's own 0.4808-0.5481 mammal zone. */
  belly: 0.375,

  legs: { x: 0.3, z: 0.3 },

  /* The panda's ear — the biggest ROUND ear in the bank, and only four species
   * wear it. A saola's ears are large, round and set wide. The burial is
   * re-solved from the panda's own 0.778 to 0.45, which leaves 0.173 proud
   * instead of 0.070; at the panda's own depth this ear does not read at all. */
  ears: { part: 'box-34', paint: 'coat', sink: 0.45, at: [0.28, CROWN_Y, 0.2] },

  /* The giraffe's nose-tip, by pure donor transfer, and the deer's tip on its
   * placed front plane. A saola is a small forest bovine with a plain muzzle. */
  snout: { part: 'tube-07', paint: 'limb' },
  nose: { part: 'box-14', paint: 'horn' },

  /* The bank's only stub, turned to face backwards at the hull's own centre. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, -0.625] },

  extras: [
    /* THE HORNS. Stood on end and leaned back twenty degrees, with NO splay —
     * see the header. Joined on the flat crown at 4/16 out and 2.4/16 forward,
     * both stations wholly inside the top face's own +/-0.3125. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair',
      paint: 'horn',
      stretch: HORN_LONG,
      spin: [{ axis: 'x', deg: -110 }],
      at: [0.2, CROWN_Y, 0.15],
    },

    /* THE WHITE FACE. Two cards over the brows, clear of the eye card's own
     * 0.7736-1.0936 band so nothing is coplanar with anything, and two down the
     * cheeks below it. `animal-cheetah.ts` stretches this same face plate for
     * its tear lines and flags it; these are the same class of stretch and are
     * flagged in the same place. */
    {
      name: 'brow',
      part: 'plate-13',
      kind: 'pair',
      paint: 'mark',
      stretch: [1.4, 1, 1],
      at: [0.24, 1.16, FACE_Z],
    },
    {
      name: 'cheek',
      part: 'plate-13',
      kind: 'pair',
      paint: 'mark',
      stretch: [1, 1.6, 1],
      at: [0.3, 0.66, FACE_Z],
    },
  ],

  flag: 'THIS IS THE ONE HORNED ANIMAL IN THE PROJECT THAT IS NOT COMPROMISED BY THE MISSING '
    + 'CURVE. Nine are built and every one of them — buffalo, ox, water buffalo, goat, '
    + 'wildebeest, antelope, elk, reindeer, Dall sheep — carries a flag saying the bank holds '
    + 'no curve and its horns are straight because of it. A saola\'s really are straight and '
    + 'very nearly parallel, so wedge-11 stood on end with ZERO splay is the animal rather than '
    + 'the nearest thing to it. THE LENGTH IS CAPPED BY THE PACK, NOT BY TASTE: 2.0x puts the '
    + 'tips at 1.953 against the 2.02 ceiling animal-orca.ts found, and 2.4x goes over. THE '
    + 'FACE CARDS ARE STRETCHED and that is the one strained rule here — plate-13 is Kenney\'s '
    + 'own face plate and the pack measures its face plates varying only 1.07x, so 1.4x and '
    + '1.6x are outside the measurement and inside rule 5, exactly as animal-cheetah.ts argues '
    + 'for its tear lines. THE EAR BURIAL IS RE-SOLVED from the panda\'s 0.778 to 0.45: at the '
    + 'panda\'s own depth only 0.070 of this ear stands clear and a saola\'s ears are large. '
    + 'NEW PALETTE, UNREVIEWED.',
})
