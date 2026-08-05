/**
 * The osprey — a white bird with a dark line through its eye, which is exactly
 * the two things this pack can do well and nothing it cannot.
 *
 * **THE EYE-STRIPE.** `plate-10` spun `{y, -90}` so its `x +1` face turns
 * forward, as a pair at y = 0.900 — landing x 0.114..0.366, y 0.778..1.022,
 * across the middle of a `plate-08` eye card that runs 0.694..1.094. The card is
 * the same one `animal-goshawk.ts` wears as a brow, 0.200 higher. §3.1: one
 * shape, two animals, told apart by placement.
 *
 * **THE CROOKED WING IS NOT HERE AND IT COULD HAVE BEEN.** An osprey's wing
 * kinks at the wrist, and `PartDef.on` will anchor a second `wedge-19` to the
 * first one's built tip and spin it — measured, it works, and it puts the bird
 * at 3.0956 across with a keep-out of 1.5478 against the fox's own 1.15. That is
 * the widest thing this project has ever built and `pets.ts:652` charges keep-out
 * for walking between trees, so it is recorded in `collections/raptors.ts` as an
 * available idiom and deliberately not spent. The bird flies straight-winged.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.15345
const FACE_Z = 0.63

export const OSPREY_ASSEMBLY = defineCreature('animal-osprey', {
  palette: {
    coat: 0x54432f,    // UNREVIEWED: dark brown back and wings
    belly: 0xf7f4ee,   // UNREVIEWED: the white head and underside, up to 11/16
    mark: 0x3a2d1e,    // UNREVIEWED: the eye-stripe
    limb: 0xd6d0c2,    // UNREVIEWED: pale grey-blue foot, which this bird has
    bill: 0x24211c,    // UNREVIEWED: black
    hook: 0x121110,    // UNREVIEWED: blacker
    eye: 0xd0a52a,     // UNREVIEWED: yellow
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The penguin's cube for band 3, the forward-facing one, painted white — an
   * osprey is white from the chin down and this band is exactly its front. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'belly' } } },
  belly: 0.6875,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-38', paint: 'coat' },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    /* The big talon: an osprey's feet are the most specialised of any raptor. */
    { name: 'talon', part: 'wedge-11', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' as const },
    /* THE EYE-STRIPE. See the header. */
    { name: 'stripe', part: 'plate-10', paint: 'mark', kind: 'pair' as const, at: [0.24, 0.9, FACE_Z], spin: [{ axis: 'y' as const, deg: -90 }] },
  ],

  flag: 'THE HINGED WING WORKS AND IS DELIBERATELY NOT SPENT HERE, which is the one thing on '
    + 'this bird you might want to overrule. An osprey\'s wing kinks at the wrist, and '
    + 'PartDef.on will anchor a second wedge-19 to the first one\'s BUILT TIP and spin it — '
    + 'measured, it builds, and it puts the bird at 3.0956 across with a keep-out of 1.5478 '
    + 'against the fox\'s own 1.15. pets.ts:652 charges keep-out for walking between trees, so '
    + 'a bird that wide may not path. If you want the kink, it is one extra with on: \'wing\' '
    + 'and a spin, and the number to watch is the keep-out. THE EYE-STRIPE is plate-10 spun to '
    + 'face forward at y 0.900, across the middle of the eye card — the same card '
    + 'animal-goshawk.ts wears 0.200 higher as a white brow. NEW PALETTE, UNREVIEWED.',
})
