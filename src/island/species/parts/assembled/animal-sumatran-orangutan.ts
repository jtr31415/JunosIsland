/**
 * The Sumatran orangutan — the cheek flanges are the animal, and the bank had
 * the shape all along.
 *
 * Eight primates are built (the frozen `animal-monkey`, `animal-gorilla`,
 * `animal-baboon`, `animal-gibbon`, `animal-howler-monkey`, `animal-lemur`,
 * `animal-tarsier`, `animal-bushbaby`) and six of them sit on `box-33`, the
 * monkey's own shell. This one does not:
 *
 *   - **`box-12`, THE WIDEST SHELL IN THE BANK, AND IT IS AN ARGUMENT RATHER
 *     THAN A CHOICE.** Rule 3 fuses head and body into one mass, so on this kit
 *     the shell IS the face. A flanged male orangutan is the widest-faced ape
 *     alive. 1.539484 across is the widest face this project can build, and no
 *     primate is on it.
 *   - **THE FLANGES ARE `box-25`, THE KOALA'S EAR** — the only large RADIAL
 *     shape in the bank, 0.743 across and 0.348 thick, attaching `x +1` so a
 *     `pair` mounts on the sides of the head with no spin at all.
 *     `animal-beluga.ts` spends it as a melon by turning it; here it is left on
 *     its own attachment and it is a cheek pad, which is what a disc on the side
 *     of a face is.
 *
 * Two coordinates of the donor transfer are moved and both are argued: a koala
 * wears this disc as an EAR, at the back of the cheek and high, and an
 * orangutan's flanges frame the face, so they come forward to z = 0.28 (the
 * last station wholly on the flat side plate) and down to eye height.
 *
 * There is no tail, which is a fact about apes and the same separation
 * `animal-gorilla.ts` makes.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own side face — 1.539484 / 2. The flanges join here. */
const SIDE_X = 0.769742
/** `box-12`'s front face, which is `box-03`'s. */
const FRONT_Z = 0.625

export const SUMATRAN_ORANGUTAN_ASSEMBLY = defineCreature('animal-sumatran-orangutan', {
  palette: {
    coat: 0xa8542c,    // UNREVIEWED: the rufous orange of a Sumatran, redder than a Bornean
    face: 0x3b2a22,    // UNREVIEWED: the bare dark face, the muzzle pad and the beard
    sclera: 0xe8dcc8,  // UNREVIEWED: named because there is no belly slot to default to
    limb: 0x8e4423,    // UNREVIEWED: the long arms and short legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell in the bank, and on a one-mass animal the shell is the
   * face. See the header — this is the argument, not a preference. */
  hull: { part: 'box-12' },
  /* No belly line: an orangutan is one colour all over, so the pale slot has to
   * be named or the sclera goes rust. */
  under: 'sclera',

  /* Short and set wide, which is how a heavy-fronted ape stands. */
  legs: { x: 0.38, z: 0.28 },

  /* Small, dark and close-set — the bank's smallest card, at x = 0.20 rather
   * than plate-06's own 0.227, because this face is 1.539 wide and eyes that
   * hold the midline are what stop it reading as a cow. */
  eyes: { part: 'plate-06', x: 0.2, paint: 'sclera' },

  /* The hog's nose disc as a muzzle pad, slightly wider than tall. */
  snout: { part: 'box-24', paint: 'face', stretch: [1.2, 1, 1], at: [0, 0.72, FRONT_Z] },

  /* The bunny's nose-tip on the pad's own placed front plane. */
  nose: { part: 'box-09', paint: 'face', on: 'snout' },

  extras: [
    /* THE FLANGES. No spin and no stretch — box-25's own `x +1` attachment and
     * its own 0.533662 burial, which leaves 0.346 of disc standing clear of
     * each side of the face. */
    { name: 'flange', part: 'box-25', paint: 'coat', kind: 'pair', at: [SIDE_X, 0.98, 0.28] },

    /* THE BEARD. The cat's ear turned 135 degrees so it hangs down and forward
     * off the chin — the same shape animal-gorilla.ts stands UP as a sagittal
     * crest, doing the opposite job at the other end of the face. */
    { name: 'beard', part: 'wedge-06', paint: 'coat', spin: [{ axis: 'x', deg: 135 }], at: [0, 0.55, FRONT_Z] },
  ],

  flag: 'THE FLANGES ARE THE ANIMAL AND THEY COST NOTHING — box-25, the koala\'s ear, is the '
    + 'only large RADIAL shape in the bank and it attaches `x +1`, so a mirrored pair lands on '
    + 'the sides of the head with no spin, no stretch and its own recorded burial. '
    + 'animal-beluga.ts turns the same disc up onto the crown as a melon; left alone it is a '
    + 'cheek pad. THE SHELL IS AN ARGUMENT: rule 3 fuses head and body, so the hull IS the '
    + 'face, and box-12 at 1.539484 across is the widest face this project can build for the '
    + 'widest-faced ape alive. Six of the eight primates already built share box-33; this one '
    + 'is alone on box-12. WHAT IS MISSING IS THE ARMS, and it is the same gap '
    + 'animal-gorilla.ts names: an orangutan\'s reach is the thing a child draws, and the leg '
    + 'row is four copies of one shape at one height, so the front pair cannot be longer than '
    + 'the back. NO TAIL, which is a fact about apes rather than a saving. NEW PALETTE, '
    + 'UNREVIEWED — and the flange placement is two coordinates off the koala\'s own, both '
    + 'argued in the header, so it is the first thing to drag if the pads sit wrong.',
})
