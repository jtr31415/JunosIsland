/**
 * The otter — first of Woodland's three water mammals, and the one that has to
 * stay clear of `animal-beaver`, which is FROZEN and cannot move.
 *
 * The header of `collections/woodland.ts` names otter/mink/coypu against each
 * other and against the beaver as this collection's hardest separation. The
 * beaver's own three parts are its paddle tail (`wedge-03`), its round `box-02`
 * ear and its barrel muzzle (`tube-01`), and this animal takes NONE of them —
 * not because they are wrong for an otter but because they are the beaver.
 *
 * What it takes instead:
 *
 *   - **`wedge-15`, the lion's tail**, trailing at the rear plate's own centre.
 *     It is the most strongly tapering long tail in the bank (0.517) and the
 *     thickest of the thin group at 0.280 — thick at the root, pointed at the
 *     tip, which is an otter's rudder and is the opposite of a paddle.
 *   - **`box-30`, the lion's ear** — small, set high and FORWARD on the face
 *     (it attaches `z +1`), which is where an otter's ears are and where a
 *     beaver's are not. It is unspent by every other species built so far.
 *   - **`box-40`, the polar bear's nose** — the broadest flat pad in the bank
 *     after the hog's, and an otter's rhinarium is exactly that.
 *
 * The long body is the wheelbase, 6/16, since a hull is never scaled.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s rear plate's own centre — the flat square runs y 0.49375-1.11875. */
const REAR_PLATE = [0, 0.80625, -0.625] as const

export const OTTER_ASSEMBLY = defineCreature('animal-otter', {
  palette: {
    coat: 0x6d5340,    // UNREVIEWED: wet dark brown — the first ever proposed for this species
    belly: 0xd9c8ae,   // UNREVIEWED: the pale throat and chest, the muzzle, and the sclera
    mark: 0x2a211a,    // UNREVIEWED: the nose pad
    limb: 0x4d3a2c,    // UNREVIEWED: the short legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* 6/16, the longest stance the pack's grid allows: `box-01` is 0.375 deep, so
   * each leg's outer face lands on 0.5625, one sixteenth inside the hull's own
   * 0.625. `animal-ferret.ts` derives it; an otter is the same shape of animal. */
  legs: { z: 0.375 },

  /* The lion's ear, which attaches to the FRONT of the head rather than the top
   * — small, high and forward, and unspent anywhere else. Kenney's own band 5 is
   * its inner face, so the pale costs nothing. */
  ears: { part: 'box-30', paint: { base: 'coat', byBand: { 5: 'belly' } } },

  /* The deer's muzzle, taken for having NO cut: an otter's face is one pale
   * tone from the chin to the whiskers and the fox's two-band `tube-06` would
   * have to be painted back to one. Same bounding box, different mesh. */
  snout: { part: 'tube-03', paint: 'belly' },

  /* The polar bear's broad flat nose, on the muzzle's own placed front plane. */
  nose: { part: 'box-40', paint: 'mark' },

  /* Thick at the root and pointed at the tip — taper 0.517, the strongest in the
   * bank — trailing straight back off the rear plate's own centre rather than at
   * the lion's own 1.2046, which is above this hull's flat rear face entirely. */
  tail: { part: 'wedge-15', paint: 'coat', at: [...REAR_PLATE] as [number, number, number] },

  flag: 'NEW PALETTE, UNREVIEWED — the first otter ever built here. THE SEPARATION TO CHECK IS '
    + 'AGAINST animal-beaver, WHICH IS FROZEN: woodland.ts\'s own header names otter/mink/coypu '
    + 'against each other and against the beaver as this collection\'s hardest problem, and the '
    + 'beaver\'s three signature parts are its paddle tail (wedge-03), its round ear (box-02) '
    + 'and its barrel muzzle (tube-01). This animal takes NONE of them, and that is a refusal '
    + 'rather than an oversight — wedge-03 is the only tail in the bank with a flattened '
    + 'section (0.726 across against 0.589 through) and it reads as a paddle whatever it is '
    + 'painted. It wears wedge-15 instead, the most strongly tapering long tail there is '
    + '(0.517), trailing at the rear plate\'s own centre. THE EAR IS box-30, THE LION\'S, and it '
    + 'is unspent by every other species built so far: it attaches z +1, so the donor transfer '
    + 'puts it on the FRONT of the head at x 0.375, y 1.337 — small, high and forward, which is '
    + 'an otter and is nothing a beaver does. Nothing is stretched.',
})
