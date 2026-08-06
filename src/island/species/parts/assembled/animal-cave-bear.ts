/**
 * The cave bear — the fifth bear in the tree, and the only one separated on the
 * shape of its HEAD rather than on a chest mark.
 *
 * `animal-bear`, `animal-moon-bear`, `animal-sun-bear` and `animal-sloth-bear`
 * are all built and three of them are told apart by a marking: a silvered back
 * (band 15 on `box-41`), a crescent (`box-39`'s band 3, the pack's one
 * forward-facing hull band), a turned marking card. A cave bear has no marking
 * at all. What it has is a skull, and palaeontologists tell it from a brown bear
 * by exactly one feature — **a steep domed forehead** — so that is what this
 * animal is built on:
 *
 *   - **`box-25`, the koala's ear, ON THE CROWN.** 0.743 square, the only RADIAL
 *     shape of any size in the bank. `animal-beluga.ts` spins it onto a whale's
 *     head as a melon and calls it a disc rather than a dome, and says so; this
 *     is that same reading on a skull, where a disc across the brow is much
 *     nearer the truth than it is on a beluga. `animal-moon-bear.ts` wears the
 *     same shape as an EAR, which is what §3.1 means by a part's identity being
 *     its placement.
 *   - **`tube-02` for `animal-bear`'s `tube-07`.** The chick's and penguin's
 *     short broad bill, 0.460 x 0.252 x 0.200, against the giraffe's muzzle at
 *     0.532 x 0.300 x 0.266 — the DEEPEST in the bank, which that file took
 *     precisely because a brown bear's face is long and straight. A cave bear's
 *     is short under the dome, and this is that difference said in one swap.
 *   - **`box-02` for `box-34`.** The beaver's and the POLAR bear's own ear,
 *     against the panda's. Same size to six decimals, different mesh, and the
 *     polar bear is the frozen animal this one should stand nearest.
 *
 * `box-41`'s front face is 0.725 and `EYE_CARD_Z` is an absolute 0.635, so the
 * eye cards sit 0.09 inside the head. Ten built species carry that.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat crown band — `animal-bear.ts` ray-cast it at |z| <= 0.0833. */
const CROWN_Y = 1.43125
const CROWN_Z = 0.05
/** The rear plate's own centre — `animal-badger.ts`'s solve for every stub. */
const REAR_PLATE_Y = 0.83125

export const CAVE_BEAR_ASSEMBLY = defineCreature('animal-cave-bear', {
  palette: {
    coat: 0x5a4a3c,    // UNREVIEWED: cold grey-brown, paler than animal-bear's chocolate
    belly: 0xd2c4ae,   // UNREVIEWED: the muzzle, and the sclera
    dome: 0x6b5a49,    // UNREVIEWED: the brow, one shade up so the forehead reads
    mark: 0x201a15,    // UNREVIEWED: the nose pad
    limb: 0x453729,    // UNREVIEWED: the heavy legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only shell bigger than the cube on all three axes — and unlike
   * `animal-bear` it is painted flat, because a cave bear has no silvered back
   * and no chest mark and the whole separation is above the eyes. */
  hull: { part: 'box-41', paint: 'coat' },

  /* Heavy and planted. */
  legs: { x: 0.36, z: 0.30 },

  /* Low under the brow — the dome sits where a raised card would want to be. */
  eyes: { y: 1.0 },

  /* The beaver's and the POLAR bear's own ear, hand-placed inside the flat crown
   * band. The donor transfer is refused for `animal-bear.ts`'s reason: this
   * shell's crown is flat only for |z| <= 0.0833 and the recorded z would float. */
  ears: { part: 'box-02', paint: 'coat', sink: 0.7, at: [0.36, CROWN_Y, CROWN_Z] },

  /* SHORT and broad, against `animal-bear`'s deepest-in-the-bank giraffe muzzle. */
  snout: { part: 'tube-02', paint: 'belly' },

  /* The polar bear's own nose, on the muzzle's own placed front plane. */
  nose: { part: 'box-40', paint: 'mark' },

  /* A bear has almost no tail, and `box-18` is the bank's only stub. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE DOME. The koala's ear across the brow — the only radial shape of any
     * size in the bank — remounted on y so it rises out of the crown's front. */
    {
      name: 'dome',
      part: 'box-25',
      paint: 'dome',
      axis: 'y',
      dir: 1,
      stretch: [1.15, 1, 0.9],
      sink: 0.62,
      at: [0, CROWN_Y - 0.02, 0.24],
    },
  ],

  flag: 'THE DOMED FOREHEAD IS THE WHOLE SEPARATION FROM FOUR BUILT BEARS, and it is a DISC '
    + 'rather than a dome. box-25 is the koala\'s ear, 0.743 square and the only RADIAL shape '
    + 'of any size in the bank; animal-beluga.ts spins it onto a whale\'s crown as a melon and '
    + 'says plainly that it is a disc, and animal-moon-bear.ts wears the same shape as an EAR. '
    + 'This is its third reading. THE BANK HAS NO DOME — Ocean priced one for the jellyfish and '
    + 'the sea turtle, Ice for the beluga, Outback for a frill and animal-glyptodon in this same '
    + 'collection for a carapace, which makes six askings — and a cave bear\'s brow is the one '
    + 'feature palaeontologists tell it from a brown bear by, so this is the animal that most '
    + 'wants the real shape. THE OTHER TWO SWAPS ARE MEASURED: tube-02 (0.460 x 0.252 x 0.200) '
    + 'for animal-bear\'s tube-07, which is the DEEPEST muzzle in the bank and was taken there '
    + 'because a brown bear\'s face is long; and box-02, the POLAR bear\'s own ear, for the '
    + 'panda\'s box-34 — same bounding box, different mesh, and the polar bear is the frozen '
    + 'animal this one should stand nearest. THERE IS NO CHEST MARK, DELIBERATELY: three of the '
    + 'four built bears are told apart by one, and the absence is this animal\'s. NEW PALETTE, '
    + 'UNREVIEWED.',
})
