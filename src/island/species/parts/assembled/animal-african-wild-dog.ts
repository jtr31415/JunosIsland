/**
 * The African wild dog — the same dish ear as `animal-hyena`, because the bank
 * has exactly one and two African carnivores are defined by exactly that shape.
 *
 * This is the hardest separation in the collection and it is worth stating
 * plainly rather than hiding. `animal-hyena.ts`'s first line is *"the biggest
 * ears in the bank"*, and it wears `box-25` — the koala's dish, 0.743 across,
 * where the next biggest ear shape is `box-06`'s 0.482 — for the same reason
 * this animal must: a wild dog's ears are round satellite dishes and there is no
 * second candidate. The shape is therefore SHARED, deliberately, and everything
 * else is where the two are told apart:
 *
 *   - **The hull.** The hyena takes `box-12`, the widest shell, for heavy
 *     forequarters. This takes the plain 1.250 cube, because a wild dog is the
 *     leggiest, slightest canid there is.
 *   - **The stance.** Narrow and long — 0.30 by 0.36 against the hyena's own —
 *     which is the only thing the kit has to say "built for running all day".
 *   - **The tail.** The hyena's is a short brush; this is `wedge-15`, the lion's,
 *     the most strongly tapering long tail in the bank at 0.516, with Kenney's
 *     own band 5 painted WHITE. A white tail tip is the second thing anybody
 *     names about this animal and it costs no geometry.
 *   - **No mane and no spots.** The hyena carries both; this carries neither,
 *     and the mottle it should carry instead is not sayable at all — see the
 *     flag.
 *
 * The ears are lifted to 1.18, above the koala's own mid-head station, so they
 * sit on top of the skull where a wild dog's do; at their own 0.533 burial they
 * stand 0.347 clear each side, for a keep-out of 0.972.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own flat side, and the rear plate's own centre. */
const FLANK_X = 0.625
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const AFRICAN_WILD_DOG_ASSEMBLY = defineCreature('animal-african-wild-dog', {
  palette: {
    coat: 0xc98a34,    // UNREVIEWED: the tawny ground the blotches would sit on
    mark: 0x2b241d,    // UNREVIEWED: the black muzzle, the nose, the ear backs
    pale: 0xf3ecdc,    // UNREVIEWED: the white tail tip, and the sclera
    limb: 0x9c6a28,    // UNREVIEWED: the long legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* No `belly` line: a painted-on pale underside is exactly the marking this
   * animal does NOT have, and adding one would be inventing a difference from
   * the hyena that the animals do not have either. `under` is named so the
   * sclera has somewhere to come from. */
  under: 'pale',

  /* Narrow and long. A wild dog is the leggiest canid there is and the
   * wheelbase is the whole of what the kit can say about that — the leg row is
   * four copies of one shape at one absolute height. */
  legs: { x: 0.30, z: 0.36, paint: 'limb' },

  /* THE DISH, shared with animal-hyena on purpose — see the header. Lifted from
   * the koala's own mid-head 1.057 to 1.18, so it sits on top of the skull
   * rather than beside the jaw. Kenney's own band 13 is the dish's back face,
   * painted dark, which is where a wild dog's ear is black. */
  ears: {
    part: 'box-25',
    paint: { base: 'coat', byBand: { 13: 'mark' } },
    at: [FLANK_X, 1.18, 0.14],
  },

  /* The fox's muzzle painted dark ENTIRE, both of Kenney's bands together: a
   * wild dog's whole face forward of the eyes is black, which is the opposite
   * of the two-tone reading animal-wolf.ts and animal-dingo.ts each take off
   * this same shape. */
  snout: { part: 'tube-06', paint: 'mark' },
  nose: { part: 'box-15', paint: 'mark' },

  /* The lion's tail — taper 0.516, the strongest in the bank — trailing at the
   * rear plate's own centre, with band 5 (Kenney's own end cut) painted white. */
  tail: {
    part: 'wedge-15',
    paint: { base: 'coat', byBand: { 5: 'pale' } },
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  flag: 'THE PAINTED DOGS ARE NOT PAINTED, and the blotches ARE the animal — no two wild dogs '
    + 'carry the same pattern and that is the fact a child is told about them. Colour here is '
    + 'a texture LOOKUP with no positional information: Paint.patch takes one HEIGHT and '
    + 'byBand can only recolour where Kenney already cut, so an irregular tricolour blotch is '
    + 'unsayable. Five files in collections/jungle.ts say the same thing for rosettes, chains '
    + 'and tail rings; this is another. THE SEPARATION TO LOOK AT FIRST IS animal-hyena, and '
    + 'it deliberately WEARS THE SAME EAR: box-25, the koala\'s dish, 0.743 across where the '
    + 'next biggest ear shape is 0.482, and there is no second candidate in the bank for a '
    + 'round satellite ear that two African carnivores both genuinely have. So the shape is '
    + 'shared and the separations are elsewhere — the plain 1.250 cube against the hyena\'s '
    + 'box-12 widest shell, a narrow long stance against its heavy forequarters, wedge-15 with '
    + 'a WHITE band-5 tip against its short brush, and no mane and no spots where it has both. '
    + 'If the two still twin, the ear station (1.18 here) and the hull are the two dials. '
    + 'NEW PALETTE, UNREVIEWED.',
})
