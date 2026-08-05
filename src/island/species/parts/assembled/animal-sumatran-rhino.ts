/**
 * The Sumatran rhino — the smallest rhino in the world, and the hairy one. Both
 * of those are the separation from `animal-black-rhino` in this same collection,
 * and both are said in geometry rather than in prose.
 *
 *   - **THE PLAIN 1.250 CUBE against `box-41`.** The black rhino takes the
 *     biggest shell in the bank because it is the second-largest land animal
 *     alive; this one takes the smallest body the pack has, because it is the
 *     smallest rhino there is. Two shells, one fact each.
 *   - **TWO SHORT HORNS against one long one.** The same `wedge-11` stood on end
 *     by `animal-warthog.ts`'s spin, at 1.4x and 0.8x rather than 2.4x and 1.2x.
 *     A Sumatran rhino's front horn is a stub and its rear one is barely a bump,
 *     and both stations are solved so that each breaks the surface rather than
 *     hiding under the chamfer.
 *   - **HAIR, which no other rhino has.** A `cone-01` row of four down the
 *     spine, behind the horns, and a tuft on each ear tip hung `on: 'ear'` —
 *     `animal-lynx.ts`'s anchor, so the fringe travels with the ear.
 *   - **A SKIN FOLD.** `box-11`, the caterpillar's body segment, cut to 0.75 of
 *     its depth and dropped to shoulder height: 1.4445 across a 1.250 shell, so
 *     0.097 of it stands proud all the way round. Three species wear this ring
 *     and none of them as a fold.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, its own centre and its front face. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625
const FRONT_Z = 0.625

/**
 * The fold, cut on DEPTH ONLY — `animal-musk-ox.ts`'s trade, for the same
 * reason. `box-11` is 1.4445 x 0.877 x 0.4458 and at full size it is 0.565 of
 * volume against the cube's 1.953, a one-mass ratio of 3.46 with no margin. At
 * 0.75 of its depth it is 0.424 and the ratio is 4.61. Cutting x would take away
 * the 0.097 of proud rim that makes it visible at all, which IS the fold.
 */
const FOLD_CUT: [number, number, number] = [1, 1, 0.75]

/** 1.4x and 0.8x of `wedge-11`'s own long axis: a stub and a bump. */
const HORN_FRONT: [number, number, number] = [1, 1, 1.4]
const HORN_REAR: [number, number, number] = [1, 1, 0.8]

export const SUMATRAN_RHINO_ASSEMBLY = defineCreature('animal-sumatran-rhino', {
  palette: {
    coat: 0x6b4f3e,    // UNREVIEWED: reddish-brown hide, warmer than the black rhino's grey
    hair: 0x8a6144,    // UNREVIEWED: the long rufous hair — the spine row and the ear fringe
    fold: 0x5c4335,    // UNREVIEWED: the shoulder fold, a shade under the hide
    horn: 0xcbbca4,    // UNREVIEWED: the two short horns
    pale: 0xdcd2c2,    // UNREVIEWED: named because there is no belly slot for the sclera
    limb: 0x5a4234,    // UNREVIEWED: the short legs and the muzzle pad
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The plain cube. See the header: this is the argument against box-41, not a
   * default that nobody thought about. */
  hull: { part: 'box-03' },
  /* No belly line — a rhino is one colour all over — so the pale slot has to be
   * named or the sclera goes rust. */
  under: 'pale',

  legs: { x: 0.3, z: 0.28 },

  /* THE SAME EARS AS animal-black-rhino, remounted the same way, because a
   * rhino's ear is a rhino's ear and inventing a difference would be inventing.
   * `tube-04` is the elephant's at `x +1`; `axis: 'y'` stands it on the crown
   * (animal-ocelot.ts's remount) at a re-solved 0.35 burial. */
  ears: { part: 'tube-04', paint: 'coat', axis: 'y', dir: 1, sink: 0.35, at: [0.22, CROWN_Y, -0.05] },

  /* The hog's nose disc as a muzzle pad, on the hull's own front face. */
  snout: { part: 'box-24', paint: 'limb', stretch: [1.05, 0.85, 1], at: [0, 0.7, FRONT_Z] },

  /* THE HAIR ON THE SPINE, placed BEHIND the horns so the two rows do not meet:
   * four cone-01 from z = 0 back to -0.375, at a span of 3/16 about a centre of
   * -3/16. Only the top row — a rhino is not spiny on its flanks. */
  ridge: {
    part: 'cone-01',
    paint: 'hair',
    name: 'hair',
    count: 4,
    rows: ['top'],
    span: 0.1875,
    place: { top: [0, CROWN_Y, -0.1875] },
  },

  /* The bank's only stub, turned to face backwards at the hull's own centre. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, -0.625] },

  extras: [
    /* THE FRONT HORN. Stood on end and joined at [0, 1.05, 0.50] — a point 0.19
     * below the local chamfer surface, so the base is embedded and 0.195 of horn
     * breaks through on the nose. */
    {
      name: 'horn-front',
      part: 'wedge-11',
      paint: 'horn',
      stretch: HORN_FRONT,
      spin: [{ axis: 'x', deg: -90 }],
      at: [0, 1.05, 0.5],
    },

    /* THE REAR HORN, barely a bump: joined higher and further back so 0.111 of
     * it clears the flat crown. */
    {
      name: 'horn-rear',
      part: 'wedge-11',
      paint: 'horn',
      stretch: HORN_REAR,
      spin: [{ axis: 'x', deg: -90 }],
      at: [0, 1.32, 0.22],
    },

    /* THE FOLD. Cut on depth only — see FOLD_CUT, which is a one-mass invariant
     * and not a preference — and dropped from the caterpillar's own high station
     * to the shoulder. */
    { name: 'fold', part: 'box-11', paint: 'fold', stretch: FOLD_CUT, at: [0, 1.3, -0.1] },

    /* THE EAR FRINGE. cone-01 on each ear's own placed tip, anchored with
     * `on: 'ear'` so the builder solves the join off the built vertices —
     * animal-lynx.ts's idiom, and the only way to say "hairy ear" at all. */
    { name: 'fringe', part: 'cone-01', paint: 'hair', kind: 'pair', on: 'ear' },
  ],

  flag: 'THIS ANIMAL EXISTS TO BE UNLIKE animal-black-rhino IN THE SAME COLLECTION, and every '
    + 'difference is a fact rather than a dressing. THE SHELL: the plain 1.250 cube against '
    + 'box-41, the biggest in the bank, because this is the smallest rhino in the world and '
    + 'that is the largest land animal after the elephant. THE HORNS: 1.4x and 0.8x of '
    + 'wedge-11 against 2.4x and 1.2x — a stub and a bump against a spike. THE HAIR: four '
    + 'cone-01 down the spine and a tuft on each ear tip, which no other rhino gets and this '
    + 'one is named for. THE FOLD: box-11, the caterpillar\'s body ring, cut on DEPTH ONLY to '
    + '0.75 — animal-musk-ox.ts\'s own trade — because cutting x would remove the 0.097 of '
    + 'proud rim that IS the fold, and at full size the ring measures a one-mass ratio of 3.46 '
    + 'against a hard floor of 3. THE HORNS ARE STRAIGHT, which on this animal barely matters '
    + 'because a Sumatran rhino\'s barely curve, but it is the same CURVE commission the black '
    + 'rhino\'s flag prices. NEW PALETTE, UNREVIEWED.',
})
