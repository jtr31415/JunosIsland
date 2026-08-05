/**
 * The reindeer — the second antlered animal in the project, and it had to be a
 * different rack from the first.
 *
 * `animal-elk.ts` established that **the bank has no antler** and that a rack is
 * a PLACEMENT: two pairs of `wedge-11`, the elephant's tusk, at two angles off
 * one crown. That argument holds and is not repeated. What this file owes is the
 * separation, because an elk and a reindeer are the same silhouette to anyone
 * who is not looking, and it is made three ways:
 *
 *   - **A different shell.** The elk is `box-21`, the pack's one tall hull. This
 *     is `box-12`, the cow's and the deer's, which is 1.539 WIDE — and which
 *     `animal-badger.ts` measured as the standard cube with two lugs on its
 *     SIDES. So this animal has no ear feature either, and must never be given
 *     one, and band 5 is Kenney's own cut on those lugs: twelve triangles at
 *     z = 0.500, x out to +/-0.723, which is the inner face of each side lug and
 *     is a pale inner ear for one palette entry.
 *   - **Two SHAPES in the rack rather than two angles of one.** The elk's beam
 *     and brow tine are both `wedge-11`. Here the beam is `wedge-11` and the
 *     BROW SHOVEL is `wedge-13`, the hog's tusk — a genuinely different record,
 *     0.260 x 0.323 x 0.411 against 0.309 x 0.307 x 0.445, taper 0.59 against
 *     0.39. A reindeer's brow tine is a flattened palm hanging over the muzzle
 *     and it is the one antler in nature that is not a spike.
 *   - **The angles are opposite.** `{ x, deg }` takes a `z +1` facing to
 *     (0, -sin, cos). The beam is -140, which is (0, 0.643, -0.766) — swept back
 *     harder than the elk's -120. The shovel is -40, which is (0, 0.643, 0.766)
 *     — the SAME rise, thrown forward instead of back. The elk's two angles both
 *     lean back; this one's straddle the vertical, which is what a reindeer's
 *     rack does and an elk's does not.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * Every one of the pack's ten hulls presents the same flat rear plate — world
 * z = -0.625, x +/-0.3125, y 0.49375 to 1.11875 — and this is its centre.
 * `animal-badger.ts` measured it and every stub in the project takes this solve.
 */
const REAR_PLATE_Y = 0.80625
/** `box-12`'s flat crown: its bottom is `HULL_BOTTOM_Y` and it is 1.250 tall. */
const CROWN_Y = 1.43125
/** Inside the flat top face's own 0.3125 reach, clear of the side lugs. */
const RACK_X = 0.22

export const REINDEER_ASSEMBLY = defineCreature('animal-reindeer', {
  palette: {
    coat: 0x8b7660,    // UNREVIEWED: winter dun
    belly: 0xece2d2,   // UNREVIEWED: the pale underside, and a reindeer's pale neck
    inner: 0xd6c0ae,   // UNREVIEWED: band 5, the inner face of box-12's ear lugs
    antler: 0xc4ad8a,  // UNREVIEWED: velvet bone
    mark: 0x2e261e,    // UNREVIEWED: the nose
    limb: 0x5f4f3d,    // UNREVIEWED: the legs, darker than the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cervid shell, wide. Band 5 is the inner face of the two side lugs, so a
   * pale inner ear costs one entry and there is NO ear feature — a pair on top
   * of this shell would be four ears, which `animal-badger.ts` refused first. */
  hull: { part: 'box-12', paint: { base: 'coat', byBand: { 5: 'inner' } } },
  belly: 0.5,

  /* Wide-standing, because the shell is 1.539 across and the builder's default
   * 0.27 scales with it — stated rather than left to arithmetic nobody reads. */
  legs: { x: 0.34 },

  /* The deer's own muzzle and nose-tip. A reindeer IS a deer and the pack has
   * exactly one cervid face; the separation is carried by the shell and the
   * rack, as it is on the elk. */
  snout: { part: 'tube-03', paint: 'coat' },
  nose: { part: 'box-14', paint: 'mark' },

  /* The bank's only stub, on the flat rear plate's own centre. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE MAIN BEAM, swept back harder than the elk's: -140 degrees about x
     * takes `wedge-11`'s `z +1` to (0, 0.643, -0.766). Stretched 1.5x along its
     * own length, which is the only stretch on this animal. */
    {
      name: 'antler-beam',
      part: 'wedge-11',
      paint: 'antler',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -140 }],
      stretch: [1, 1, 1.5],
      at: [RACK_X, CROWN_Y, -0.12],
    },

    /* THE BROW SHOVEL — a DIFFERENT SHAPE, not a second angle of the same one.
     * `wedge-13`, the hog's tusk, at -40 degrees: (0, 0.643, 0.766), the same
     * rise thrown forward. A reindeer's brow palm hangs over its muzzle and is
     * the one antler in nature that is not a spike. */
    {
      name: 'antler-shovel',
      part: 'wedge-13',
      paint: 'antler',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -40 }],
      stretch: [1.4, 1, 1.2],
      at: [RACK_X, CROWN_Y, 0.22],
    },
  ],

  flag: 'THE RACK HAS TO BE A DIFFERENT RACK FROM THE ELK\'S AND THAT IS WHAT TO LOOK AT. The '
    + 'bank still has no antler — animal-elk.ts established that every horn-shaped record in '
    + 'it is a TUSK — so this is the same trick with two things changed. First, TWO SHAPES '
    + 'rather than two angles of one: the beam is wedge-11 (the elephant\'s, taper 0.39) and '
    + 'the brow shovel is wedge-13 (the hog\'s, taper 0.59, and stretched 1.4x across to make a '
    + 'palm), because a reindeer\'s brow tine is a flattened shovel over the muzzle and is the '
    + 'one antler in nature that is not a spike. Second, the angles STRADDLE the vertical — '
    + 'beam -140 = (0, 0.643, -0.766), shovel -40 = (0, 0.643, 0.766), the same rise thrown '
    + 'opposite ways — where the elk\'s two both lean back. THE SHELL IS box-12 AND THERE IS NO '
    + 'EAR PART: animal-badger.ts measured it as the standard cube with two lugs on its SIDES, '
    + 'so a pair on top would be four ears; band 5 is Kenney\'s own cut on those lugs and is a '
    + 'pale inner ear for one entry. NEW PALETTE, UNREVIEWED. The rack is stretched and nothing '
    + 'else is.',
})
