/**
 * The sun bear — the smallest bear there is, and the collection's first answer
 * to a problem three of its members share: **three black bears, one chest mark
 * each, and only one of them can have Kenney's.**
 *
 * `box-39` carries band 3, the one forward-facing band in any of the pack's ten
 * hulls — real geometry, no cards, and `animal-toucan.ts` and `animal-robin.ts`
 * already spend it as a bib. There is exactly one of it. `animal-moon-bear` gets
 * it, because a moon bear's crescent is the sharpest-edged of the three and a
 * geometry band has a hard edge. **This one gets a CARD instead**, and the two
 * files together are the worked comparison: the same marking said two ways.
 *
 * The card is `plate-11`, the bigger of the two flat markings, **turned to face
 * FORWARD** — `{ y, -90 }` takes an `x +1` part to `z +1` — and stretched 1.7x
 * on its own long axis, which after the turn is its WIDTH. Built, it is 0.736
 * across and 0.400 tall, hung on the chest at the hull's own 0.010 of daylight.
 * No marking card in the project has been turned this way before; every one of
 * them so far sits on a flank or on a spine.
 *
 * **The three bears also share one muzzle at three lengths, and that is the
 * family.** `tube-07` is the giraffe's, the deepest nose in the bank at 0.266
 * through, and `animal-bear` (Woodland) wears it at its own size. Here it is cut
 * to 0.7 of its reach, because a sun bear's face is short and broad; on
 * `animal-sloth-bear` it is 1.5x, because that animal's is a long mobile snout.
 * One shape, three animals, told apart by a number that is measured off the
 * animals rather than chosen.
 *
 * `box-36` is the panda's shell and it is a plain 1.250 cube. The shell is not a
 * separation for any bear here — all four of the pack's cubes are the same size
 * — and this file does not pretend it is.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-36`'s flat front plate, plus the 0.010 of daylight the pack gives a card. */
const CHEST_Z = 0.635

/**
 * 1.7x on `plate-11`'s own long axis. The turn onto `z +1` swaps that axis into
 * the card's width, so the built bib is 0.433 x 1.7 = 0.736 across and its
 * height is the card's own untouched 0.400.
 */
const BIB_STRETCH: [number, number, number] = [1, 1, 1.7]

export const SUN_BEAR_ASSEMBLY = defineCreature('animal-sun-bear', {
  palette: {
    coat: 0x211d1b,    // UNREVIEWED: near-black, the first ever proposed for this species
    belly: 0xe6dcc6,   // UNREVIEWED: the sclera only — a sun bear has no pale underside
    bib: 0xd9a338,     // UNREVIEWED: THE HORSESHOE, and the animal is named for it
    muzzle: 0xc9b48c,  // UNREVIEWED: the pale grey-gold face, which every sun bear has
    mark: 0x120f0e,    // UNREVIEWED: the nose pad
    limb: 0x171413,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's shell, and it is the plain 1.250 cube. See the header: the shell
   * separates no bear from any other and this file does not claim it does. */
  hull: { part: 'box-36' },

  /* NO BELLY LINE. A sun bear is one colour from chin to tail apart from the
   * chest mark, and painting a pale underside on it would be inventing. */

  /* Short and planted. A sun bear is the size of a large dog. */
  legs: { x: 0.32, z: 0.27 },

  /* The beaver's and the polar bear's round button ear, on the donor transfer
   * alone — both donors wear it on a 1.250 cube, so the transfer onto this one
   * is exact rather than inferred (§8). */
  ears: { part: 'box-02', paint: 'coat' },

  /* THE SHORT MUZZLE. tube-07 at 0.7 of its own reach — see the header for the
   * three-bear family this number belongs to. */
  snout: { part: 'tube-07', paint: 'muzzle', stretch: [1.15, 1, 0.7] },

  /* The koala's nose-tip on the muzzle's own placed front plane. */
  nose: { part: 'box-26', paint: 'mark' },

  /* The bank's only stub, turned to hang off the back — a bear has almost no
   * tail and box-18 at 0.425 of reach is the shortest thing there is. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, 0.80625, -0.625] },

  extras: [
    /* THE HORSESHOE. See the header and BIB_STRETCH. */
    {
      name: 'bib',
      part: 'plate-11',
      paint: 'bib',
      stretch: BIB_STRETCH,
      spin: [{ axis: 'y', deg: -90 }],
      at: [0, 0.62, CHEST_Z],
    },
  ],

  flag: 'THE CHEST MARK IS A CARD AND THE MOON BEAR\'S IS KENNEY\'S OWN GEOMETRY — read the two '
    + 'side by side, because that is the judgement this file is asking for. There is exactly ONE '
    + 'forward-facing band in the pack\'s ten hulls (box-39\'s band 3), three bears in this '
    + 'collection want a chest mark, and it went to the moon bear because a crescent has the '
    + 'hardest edge of the three. This one is plate-11 TURNED TO FACE FORWARD — { y, -90 } takes '
    + 'an x+1 card to z+1 — and stretched 1.7x on its own long axis, which the turn swaps into '
    + 'its width: built, 0.736 across and 0.400 tall. No marking card in this project has been '
    + 'turned onto the chest before; they all sit on flanks or spines. If it reads as a sticker '
    + 'rather than as a marking, the moon bear is what it should have been and the fix is to '
    + 'trade the two hulls. A SUN BEAR\'S HORSESHOE IS A HORSESHOE and a card is a rectangle; '
    + 'that gap is real and cannot be closed by any mechanism here. THE MUZZLE IS tube-07 AT 0.7 '
    + 'OF ITS REACH, which is one of three: animal-bear wears the same shape at 1.0 and '
    + 'animal-sloth-bear at 1.5, so the three bears differ by a measured number rather than by a '
    + 'choice. THE SHELL IS NOT A SEPARATION — box-36 is a plain 1.250 cube like box-03, box-20 '
    + 'and box-33, and this bear is small only in the sense that the file says so. Nothing else '
    + 'is stretched. NEW PALETTE, UNREVIEWED.',
})
