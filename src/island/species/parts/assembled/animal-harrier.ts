/**
 * The harrier — the pale grey one, and the only bird in this project with a
 * marking on its BACK.
 *
 * **THE WHITE RUMP.** Every card in the collection so far faces forward off the
 * face. This one is `plate-10` spun `{y, +90}` instead of `-90`, which turns its
 * `x +1` face to `z -1`, placed as a `single` on the midline at z = -0.630 — the
 * rear face's own 0.010 of daylight, the same `CARD_STANDOFF` the pack gives an
 * eye. A ringtail harrier is named for that patch and it is the only thing that
 * identifies one at any distance, so it is worth 10 triangles and a sign flip.
 *
 * The rest is the long-and-lazy build: `wedge-19` out from the flank at pure
 * donor transfer (2.1960), `wedge-18` laid flat and trailing 0.520 behind. Long
 * wings and a long tail on a plain cube is what a harrier is, and it is the only
 * member here with both at full length.
 *
 * The V-glide is not sayable and no part of it is. `moves.ts` has four words,
 * a pose is not one of them, and a harrier's dihedral is a pose.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/** The rear card plane: `box-03`'s rear face at -0.625, plus the pack's 0.010. */
const RUMP_Z = -0.63

export const HARRIER_ASSEMBLY = defineCreature('animal-harrier', {
  palette: {
    coat: 0x9aa3ad,    // UNREVIEWED: pale grey — the male hen harrier
    belly: 0xf6f6f4,   // UNREVIEWED: white below
    mark: 0xffffff,    // UNREVIEWED: the rump patch, whiter than the belly on purpose
    limb: 0xe0b83c,    // UNREVIEWED: long yellow legs, which this bird has
    bill: 0x2b2f36,    // UNREVIEWED: small and dark
    hook: 0x15181d,    // UNREVIEWED: the tip
    eye: 0xd8a41e,     // UNREVIEWED: yellow
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.5625,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'wedge-18', paint: 'coat', spin: [{ axis: 'x' as const, deg: 90 }], at: [0, 0.80625, -0.625] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' as const },
    /* THE WHITE RUMP — a card facing BACKWARDS. See the header. */
    { name: 'rump', part: 'plate-10', paint: 'mark', at: [0, 1.09, RUMP_Z], spin: [{ axis: 'y' as const, deg: 90 }] },
  ],

  flag: 'THIS IS THE FIRST MARKING CARD IN THE PROJECT THAT FACES BACKWARDS. plate-10 spun '
    + '{y,+90} rather than the {y,-90} three other birds here use, so its x +1 face turns to '
    + 'z -1, placed single on the midline at z -0.630 — the rear face plus the pack\'s own '
    + '0.010 of card daylight. A ringtail harrier is named for that white rump and nothing else '
    + 'identifies one, so it is worth ten triangles and a sign flip. THE V-GLIDE IS NOT SAYABLE '
    + 'AND NOTHING APPROXIMATES IT: a harrier holds its wings in a shallow dihedral and quarters '
    + 'low over a field, which is a POSE and a BEHAVIOUR, and this game has one static model per '
    + 'species and four locomotion words. THE ROSTER SAYS "HARRIER" AND NOT WHICH ONE — this is '
    + 'the male hen harrier, pale grey; a marsh harrier is brown with a cream crown, which the '
    + 'inverted belly patch would give you in one line. NEW PALETTE, UNREVIEWED.',
})
