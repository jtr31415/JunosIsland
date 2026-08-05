/**
 * The moon bear — the biggest ears of any bear, and the one chest mark in this
 * collection that is Kenney's own geometry rather than a card.
 *
 * ## The ears, and why they are the animal
 *
 * An Asiatic black bear's ears are enormous, round and set wide on the sides of
 * the head — proportionally the largest of any bear, and the first thing anybody
 * notices about one. **`box-25` is the koala's ear, 0.743 x 0.743, the biggest
 * ear shape in the bank by a factor of two**, radial rather than pointed, and it
 * attaches along `x` — which means it goes on the SIDE of the head, which is
 * where a moon bear's are.
 *
 * `animal-beluga.ts` is the only other species that has reached for it, and that
 * one wears it spun onto the crown as a stand-in for a melon. **This is the
 * first time it is used as an ear since Kenney drew it as one**, and it goes on
 * by the donor transfer alone: joined at this cube's side face x = 0.625 and
 * sunk the koala's own 0.533662, the centre lands on **x = 0.600 against the
 * bank's recorded 0.600** — the agreement §8 calls the evidence that a transfer
 * is legitimate, exact here because the koala's own hull is a 1.250 cube and so
 * is this one.
 *
 * ## The crescent, and why this bear got it
 *
 * `box-39` carries **band 3 — the one forward-facing band in any of the pack's
 * ten hulls**. It is real geometry with a hard edge, it costs nothing, and there
 * is exactly one of it. Three bears in this collection want a chest mark and
 * `animal-sun-bear.ts` argues the allocation: the moon bear's crescent is the
 * sharpest-edged of the three, so it takes the hard edge and the sun bear takes
 * a card. Read the two together — that comparison is the point of building them
 * the same week.
 *
 * A moon bear's mark is a V and Kenney's band is a panel. That gap is real and
 * nothing here closes it.
 *
 * The muzzle is `tube-07` at [1.15, 1, 0.85] — the middle of the three-bear
 * family the sun bear's file sets out (0.7, 0.85, 1.5 against `animal-bear`'s
 * own 1.0), broad and slightly short, which is a moon bear's blunt face.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** Every one of the pack's ten hulls presents this same flat rear plate centre. */
const REAR_PLATE_Y = 0.80625

export const MOON_BEAR_ASSEMBLY = defineCreature('animal-moon-bear', {
  palette: {
    coat: 0x1c1a1a,    // UNREVIEWED: black, the first ever proposed for this species
    belly: 0xe4dccb,   // UNREVIEWED: the sclera only — a moon bear is black underneath too
    crescent: 0xf1e7cf, // UNREVIEWED: THE MOON, and it is box-39's own band 3
    muzzle: 0xa89478,  // UNREVIEWED: the fawn muzzle every moon bear has
    mark: 0x0e0c0c,    // UNREVIEWED: the nose pad
    limb: 0x131111,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE PENGUIN'S SHELL, for its band 3 alone — Kenney's own white front, the
   * only forward-facing band in any of the ten hulls. Same find animal-robin.ts
   * paints red and animal-toucan.ts paints yellow. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'crescent' } } },

  /* NO BELLY LINE. A moon bear is black from chin to tail apart from the
   * crescent, and the crescent is the hull's own band. */

  legs: { x: 0.33, z: 0.28 },

  /* THE BIGGEST EAR IN THE BANK, on the donor transfer alone. See the header:
   * the solve recovers the bank's recorded x = 0.600 exactly, because both this
   * hull and the koala's are 1.250 cubes. */
  ears: { part: 'box-25', paint: 'coat' },

  /* The middle of the three-bear muzzle family — broad and slightly short. */
  snout: { part: 'tube-07', paint: 'muzzle', stretch: [1.15, 1, 0.85] },

  /* The polar bear's nose, on the muzzle's own placed front plane. */
  nose: { part: 'box-40', paint: 'mark' },

  /* The bank's only stub, turned to hang off the rear plate. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  flag: 'THE EARS ARE THE ANIMAL AND THEY ARE THE BIGGEST SHAPE IN THE EAR BANK. box-25 is the '
    + 'koala\'s ear at 0.743 x 0.743 — twice the size of anything else filed as one — it is '
    + 'RADIAL rather than pointed, and it attaches along x, so it sits on the SIDE of the head. '
    + 'That is exactly where a moon bear\'s are and they are exactly that big, which is the one '
    + 'thing anybody notices about the animal. animal-beluga wears this shape spun onto the '
    + 'crown as a stand-in for a melon; THIS IS THE FIRST TIME IT HAS BEEN USED AS AN EAR since '
    + 'Kenney drew it as one, and it goes on by the DONOR TRANSFER ALONE — joined at the cube\'s '
    + 'side face 0.625 and sunk the koala\'s own 0.533662, the centre recovers the bank\'s '
    + 'recorded 0.600 exactly, because both hulls are 1.250 cubes. Nothing is hand-placed and '
    + 'nothing is stretched but the muzzle. THE CRESCENT IS KENNEY\'S OWN GEOMETRY, not a card: '
    + 'box-39\'s band 3 is the ONE forward-facing band in any of the pack\'s ten hulls, and '
    + 'there is exactly one of it. Three bears here want a chest mark and this one got it '
    + 'because its mark has the hardest edge; animal-sun-bear.ts wears a turned plate-11 instead '
    + 'and the two are meant to be looked at together. A MOON BEAR\'S MARK IS A V AND KENNEY\'S '
    + 'BAND IS A PANEL — that gap is real, byBand can only cut where Kenney already cut, and '
    + 'nothing here closes it. NEW PALETTE, UNREVIEWED.',
})
