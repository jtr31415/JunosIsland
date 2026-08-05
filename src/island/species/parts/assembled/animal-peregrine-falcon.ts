/**
 * The peregrine — the biggest of this collection's four falcons, and the bird
 * that settles the FALCON IDIOM the other three inherit.
 *
 * **THE FALCON WING IS `blade-06` LEFT UNSPUN.** It is the bee's and the
 * penguin's, 0.6930 x 0.2000 x 0.6000, attaching `y +1` — so a pure donor
 * transfer joins it to the hull's flat CROWN and lays it over the back, running
 * x -0.049 to 0.644 a side and y 1.349 to 1.549. The bird measures 1.2875 across
 * where every broad-winged member here measures 1.9949 to 2.2270. That is not a
 * compromise: a perched falcon crosses its long wings over its tail and reads as
 * a narrow bird, and the four that wear it are the four that should.
 *
 * **THE MOUSTACHE.** `plate-13`, the crab's, dog's, lion's and tiger's face
 * plate, as a pair at [0.24, 0.64] on the card plane — x 0.110..0.330, y
 * 0.670..0.770, which sits just under an eye card that starts at 0.694. The
 * black malar stripe is the one thing a child could use to pick a peregrine out
 * of a line of grey birds, and it is 28 triangles.
 *
 * The white breast is `box-39`'s band 3, the only band in any of the pack's ten
 * hulls that faces FORWARD — `collections/birds.ts` found it, five passerines
 * spend it, and it is free.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
const FACE_Z = 0.63

export const PEREGRINE_FALCON_ASSEMBLY = defineCreature('animal-peregrine-falcon', {
  palette: {
    coat: 0x4d5b6e,    // UNREVIEWED: blue-grey above
    belly: 0xf2ece0,   // UNREVIEWED: the white breast, straight off band 3
    mark: 0x2a3140,    // UNREVIEWED: the moustache
    limb: 0xe8c02e,    // UNREVIEWED: yellow foot
    bill: 0x2a3140,    // UNREVIEWED: dark slate
    hook: 0x141820,    // UNREVIEWED: the tip
    eye: 0x2f2a26,     // UNREVIEWED: near-black — a falcon's eye, unlike a hawk's yellow
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The penguin's cube, for band 3 — the pack's only forward-facing band. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'belly' } } },

  eyes: { part: 'plate-08', paint: 'eye' },
  /* The DEEP hook: a peregrine has the heaviest bill of the four falcons. */
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-38', paint: 'coat' },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* THE FALCON WING — unspun, over the back. See the header. */
    { name: 'wing', part: 'blade-06', paint: 'coat', kind: 'pair' as const },
    { name: 'moustache', part: 'plate-13', paint: 'mark', kind: 'pair' as const, at: [0.24, 0.64, FACE_Z] },
  ],

  flag: 'THE FALCON WING IS blade-06 LEFT ENTIRELY ALONE and it is what holds four birds apart '
    + 'from the other twelve. The bee\'s and the penguin\'s wing attaches y +1, so a pure donor '
    + 'transfer joins it to the CROWN and lays it over the back — x -0.049 to 0.644 a side, y '
    + '1.349 to 1.549 — and the bird comes out 1.2875 across where every broad-winged member '
    + 'here is 1.9949 to 2.2270. A perched falcon really does cross its wings over its tail, so '
    + 'this is anatomy rather than economy, but JUDGE IT: at album scale it may read as a shell '
    + 'rather than as wings, and the fallback is wedge-19 at sink 0.55, which is 1.7657 across. '
    + 'THE MOUSTACHE is plate-13 as a pair just under the eye cards. THE WHITE BREAST is box-39 '
    + 'band 3, the pack\'s only forward-facing band, and it is free. NEW PALETTE, UNREVIEWED.',
})
