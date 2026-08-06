/**
 * The Irish elk — the first PALMATE antler in the project, and it is a shape
 * nobody had read as an antler before.
 *
 * `animal-elk.ts` records the wall: *"the bank has no antler in it — every
 * horn-shaped record is a TUSK"*, and makes a rack out of two pairs of
 * `wedge-11` at two angles. `animal-reindeer` does the same with two shapes.
 * Both are BEAMS, and both are right for their animal. *Megaloceros* is not a
 * beam animal: its antlers are two flat sheets three and a half metres across,
 * and a beam-and-tine rack on it would be an elk with the wrong palette.
 *
 * **So the palm is `blade-05`, the lion's flat muzzle plate** — 1.000 x 1.000 x
 * 0.125, by a distance the largest flat shape in the bank, and until now worn by
 * exactly three species and always as a FACE (`animal-sloth`'s mask,
 * `animal-frog`'s, `animal-platypus`'s bill). Laid flat by `{ x, -90 }`, which
 * takes its `z +1` facing to `y +1` and puts its 1.000 x 1.000 into the
 * horizontal plane, then tilted out and up by `{ z, -35 }`. It is 18 triangles a
 * copy, which is why an animal can afford two of the biggest shapes in the bank
 * on its head at all.
 *
 * Two `wedge-11` brow tines forward of them are `animal-elk.ts`'s own shape at
 * `animal-elk.ts`'s own idiom, kept deliberately: a Megaloceros palm carries
 * real tines and the two files should read as the same family.
 *
 * The hull is `box-21`, the elk's and the zebra's, whose two fused lugs are the
 * ears — so there is no ear feature, and `belly` is 7/16 rather than 8/16 for
 * `animal-wolf.ts`'s derivation on this shell.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s BODY crown at 1.43125 — NOT its bounding top of 1.6863, which is
 * the two ear lugs. `animal-elk.ts` records that trap; the rack joins the body. */
const CROWN_Y = 1.43125
const REAR_PLATE_Y = 0.934

/**
 * Where the palms root. `animal-elk.ts` joins its rack at `CROWN_Y` because
 * `box-21`'s bounding top of 1.6863 is the two ear lugs and a beam joined there
 * would float. A palm is not a beam: at 1.000 x 0.106 x 0.950 it is bigger than
 * the lugs, so it is joined 0.069 ABOVE the body cube and its own mass does the
 * embedding — measured on the built mesh, the sheet runs y 1.184 to 1.729 and
 * the cube's crown is 1.43125, so a quarter of it is inside the shell.
 */
const PALM_X = 0.4
const PALM_Y = 1.5
const PALM_Z = -0.05
const TINE_Z = 0.24

export const IRISH_ELK_ASSEMBLY = defineCreature('animal-irish-elk', {
  palette: {
    coat: 0xa8865a,    // UNREVIEWED: a warm fawn, paler than animal-elk's
    belly: 0xe0cfae,   // UNREVIEWED: the pale underside, and the sclera
    neck: 0x5c4326,    // UNREVIEWED: the dark throat and the inner ear lug
    antler: 0xcbb68d,  // UNREVIEWED: the two palms and the two tines
    mark: 0x2a211a,    // UNREVIEWED: the nose
    limb: 0x6d5432,    // UNREVIEWED: the long legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fox's shell, taken for its EARS exactly as `animal-elk.ts` takes it: a
   * 1.250 cube with two erect forward lugs fused on top. Band 5 is Kenney's own
   * inner-ear cut on those lugs, so a dark ear costs one entry and no geometry —
   * and there is no `ears` line, because that would be four. */
  hull: { part: 'box-21', paint: { base: 'coat', byBand: { 5: 'neck' } } },
  /* 7/16 and NOT the usual 8/16 — `animal-wolf.ts`'s derivation on this shell. */
  belly: 0.4375,

  /* Long-legged: this animal stood two metres at the shoulder. */
  legs: { x: 0.3, z: 0.3 },

  /* The deer's own muzzle and the deer's own nose-tip. An Irish elk IS a deer
   * and the pack has one cervid face; taking it is adaptation, and the
   * separation from `animal-deer` and `animal-elk` is carried by the rack. */
  snout: { part: 'tube-03', paint: 'neck' },
  nose: { part: 'box-14', paint: 'mark' },

  /* The bank's only stub, turned to hang off the back. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE PALM. `{ x, -90 }` takes blade-05's `z +1` to `y +1` and lays its
     * 1.000 x 1.000 flat; `{ z, -35 }` then tilts the outer edge up, so the
     * facing is (0.574, 0.819, 0) and the sheet spreads sideways the way a
     * Megaloceros's actually did. The two palms meet across the midline — the
     * right one's inner edge lands at x = -0.020 — so they read as one
     * continuous sheet over the crown rather than as two separate boards. */
    {
      name: 'palm',
      part: 'blade-05',
      paint: 'antler',
      kind: 'pair',
      stretch: [0.95, 1, 0.85],
      spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: -35 }],
      sink: 0.5,
      at: [PALM_X, PALM_Y, PALM_Z],
    },

    /* THE BROW TINE, up and forward at -70 degrees — (0, 0.940, 0.342). This is
     * `animal-elk.ts`'s own shape at its own angle, kept on purpose so the two
     * animals read as the same family. */
    {
      name: 'tine',
      part: 'wedge-11',
      paint: 'antler',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -70 }],
      at: [0.22, CROWN_Y, TINE_Z],
    },
  ],

  flag: 'THE PALM IS THE ANIMAL AND IT IS blade-05, WHICH NOBODY HAD EVER READ AS AN ANTLER. '
    + 'animal-elk.ts records that the bank has no antler and every horn-shaped record is a '
    + 'TUSK, and it makes a rack out of two pairs of wedge-11 at two angles; that is a BEAM '
    + 'rack and it is right for an elk. A Megaloceros is not a beam animal — its antlers are '
    + 'two flat sheets — so this takes the LION\'S FLAT MUZZLE PLATE, 1.000 x 1.000 x 0.125, '
    + 'the largest flat shape in the bank and until now worn by three species and always as a '
    + 'FACE. `{ x, -90 }` lays it horizontal and `{ z, -35 }` tilts the outer edge up. At 18 '
    + 'triangles a copy it is nearly free, which is the only reason two of the biggest shapes '
    + 'in the bank can sit on one head. WHAT IS MISSING IS THE FINGERS: a real palm is notched '
    + 'into six or eight points along its outer edge and this is a smooth sheet, because '
    + 'nothing in the bank forks and byBand cuts only where Kenney already cut — blade-05\'s '
    + 'band 5 is its bottom strip and runs the wrong way. WHAT TO TRY BY HAND is three or four '
    + 'wedge-11 hung `on: "palm"`, which would put them at the sheet\'s own outer face. '
    + 'IGNORE THE "sunk 0.053 THIN" LINE pets:creature prints for the palms — that number '
    + 'measures burial along a part\'s OWN FACING, and a 0.106-thick sheet cannot be buried '
    + '0.125 along its thickness by any sink at all. The embedding is sideways: measured on the '
    + 'built mesh the sheet runs x -0.020 to 0.759 and y 1.184 to 1.729, so a quarter of it is '
    + 'inside the body cube, whose crown is 1.43125. THE '
    + 'SPREAD IS THE OTHER THING TO RULE ON — a real rack is wider than the animal is long and '
    + 'this one is not, because pets.ts:652 charges keep-out from max(width, depth)/2 and that '
    + 'is what decides whether a pet can walk between two trees. NEW PALETTE, UNREVIEWED.',
})
