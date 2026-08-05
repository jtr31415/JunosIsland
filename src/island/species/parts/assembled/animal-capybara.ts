/**
 * The capybara — the biggest rodent there is, and the only one in the project
 * with NO TAIL.
 *
 * Six rodents already stand in the tree and three of them are the problem:
 * `animal-coypu` (Woodland) is a capybara-shaped animal built to be told apart
 * from the FROZEN `animal-beaver`, and `animal-guinea-pig` is the same body plan
 * again at half the size. The separations here are all subtraction and they are
 * all true of the animal:
 *
 *   - **NO TAIL AT ALL.** A capybara has none. The coypu carries `wedge-07`, the
 *     bank's thin rope; the beaver carries its own paddle; the guinea pig has a
 *     stub. This is the only rodent in the project with nothing off the back, and
 *     it is the separation a child would actually see.
 *   - **THE EYES AND EARS ARE SET HIGH AND BACK.** A capybara is a swimmer and
 *     its face is built like a hippo's: eyes at y 1.05 rather than the pack's own
 *     0.9336, and `box-02` at z -0.05 — behind the crown's midpoint, where every
 *     other species in the project puts an ear forward of it.
 *   - **THE MUZZLE IS BLUNT AND WIDE.** `tube-03`, the deer's, at 1.15 across and
 *     0.9 along: 0.612 wide on a 0.625 flat face and only 0.208 of reach. The
 *     coypu's face is a barrel and the beaver's is a rodent's; this is a brick.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and front face. */
const CROWN_Y = 1.43125
const FRONT_Z = 0.625

/** 1.15 across, 1.1 up, 0.9 along — wide and blunt, with little reach. */
const MUZZLE_STRETCH: [number, number, number] = [1.15, 1.1, 0.9]

export const CAPYBARA_ASSEMBLY = defineCreature('animal-capybara', {
  palette: {
    coat: 0xa5754a,    // UNREVIEWED: the coarse reddish brown
    pale: 0xd8bb93,    // UNREVIEWED: the sclera, and the lighter muzzle
    limb: 0x855c37,    // UNREVIEWED: the short heavy legs
    mark: 0x3b2a1c,    // UNREVIEWED: the broad dark nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No belly line: a capybara is one colour from chin to foot, which is unusual
   * enough among the project's mammals to be a separation on its own. */
  under: 'pale',

  /* Heavy and square: wide wheelbase, short between the axles. */
  legs: { x: 0.34, z: 0.3 },

  /* HIGH ON THE HEAD. 1.05 against the pack's own 0.933646, which puts the card
   * at 0.89-1.21 and still wholly on the hull's flat front face. */
  eyes: { y: 1.05 },

  /* SET BACK. The beaver's own round ear, buried its own 0.778 so only 0.070
   * breaks the outline, and placed BEHIND the crown's midpoint at z = -0.05
   * where every other species in the project places one in front of it. */
  ears: { part: 'box-02', paint: 'coat', at: [0.3, CROWN_Y, -0.05] },

  /* THE BRICK. See MUZZLE_STRETCH. */
  snout: { part: 'tube-03', paint: 'coat', stretch: MUZZLE_STRETCH, at: [0, 0.7, FRONT_Z] },

  /* The polar bear's nose — 0.400 x 0.320 — on the muzzle's placed front plane.
   * The muzzle is 0.612 x 0.330 there, so it is backed on both axes, which the
   * hog's 0.400-square disc would not have been. */
  nose: { part: 'box-40', paint: 'mark' },
})
