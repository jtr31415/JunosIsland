/**
 * The dire wolf — `animal-wolf` on the bigger shell, and the separation is
 * deliberately made on WEIGHT rather than on shape.
 *
 * A dire wolf is a grey wolf built heavier: same family, same face, more of it.
 * Pretending otherwise would mean giving it a feature no canid has, so the four
 * dials moved are the four that say "heavier", and every one of them is a swap
 * for a measured bigger shape:
 *
 *   - **`box-41` for `box-21`.** The wolf wears the FOX's shell, which
 *     `animal-wolf.ts` measured as the 1.250 cube with two fused ear lugs. This
 *     one wears the tiger's, the only shell bigger than the cube on all three
 *     axes — and because it has no lugs, this animal needs a real ear.
 *   - **`wedge-16` for nothing.** The tiger's own ear, 0.347 x 0.389, the
 *     biggest in the cat-and-canid range. Hand-placed at z = 0.05 inside
 *     `box-41`'s flat crown band, because `animal-bear.ts` measured that this
 *     shell's crown is only flat for |z| <= 0.0833 and a transferred ear floats.
 *   - **`tube-07` for `tube-06`.** The giraffe's muzzle, the deepest in the bank
 *     at 0.266 through, against the fox's 0.231. A dire wolf's jaw is the part
 *     of it the fossils are famous for.
 *   - **`wedge-15` for `box-38`.** The lion's tail — 1.082 of reach, taper
 *     0.517 — where the wolf takes the parrot's 0.912 fan. Longer and thinner,
 *     trailing, and NOT the fox's brush, which `animal-wolf.ts` refuses at
 *     length and which is refused here for the same three measurements.
 *
 * `box-41`'s front face stands at 0.725 and `EYE_CARD_Z` is an absolute 0.635,
 * so the eye card sits 0.09 inside the head. Ten built species carry that; this
 * is another, and it is named rather than corrected, because rule 5 makes the
 * card's z unsayable on purpose.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat crown band — `animal-bear.ts` ray-cast it at |z| <= 0.0833. */
const CROWN_Y = 1.43125
const CROWN_Z = 0.05

export const DIRE_WOLF_ASSEMBLY = defineCreature('animal-dire-wolf', {
  palette: {
    coat: 0x7d6f5f,    // UNREVIEWED: a warmer, browner grey than animal-wolf's timber
    belly: 0xdfd6c6,   // UNREVIEWED: the pale underside and inner ear
    mark: 0x2e2822,    // UNREVIEWED: the nose pad and the dark bridge
    limb: 0x62574a,    // UNREVIEWED: the heavy legs, a shade under the coat
    eye: 0xb8862c,     // UNREVIEWED: amber, the same look decision animal-wolf.ts flags
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only shell bigger than the cube on all three axes, and the reason this
   * animal has a real ear where `animal-wolf` has fused lugs instead. */
  hull: { part: 'box-41' },
  /* 8/16 on this shell, not the wolf's 7/16: `patch` takes its fraction of the
   * part's OWN height, and this hull's 1.300 is all body where `box-21`'s 1.505
   * includes ears. 0.5 lands inside §7's measured 0.4808-0.5481 mammal zone,
   * which is the tiger's own boundary and this is the tiger's own shell. */
  belly: 0.5,

  /* Wide and planted. `animal-wolf.ts` widens to 0.375 on a 1.250 shell to stay
   * one sixteenth inside the flank; this shell's flank is at 0.675, so 0.40
   * leaves the same daylight and the stance stays inside the footprint. */
  legs: { x: 0.4, z: 0.32 },

  /* Inside the muzzle-boss's shadow, at `animal-white-rhino.ts`'s height. */
  eyes: { paint: 'eye', y: 1.0625 },

  /* The tiger's ear, hand-placed inside the flat crown band. */
  ears: { part: 'wedge-16', paint: { base: 'coat', byBand: { 5: 'belly' } }, sink: 0.6, at: [0.30, CROWN_Y, CROWN_Z] },

  /* The giraffe's muzzle, the deepest in the bank, on this hull's own 0.725. */
  snout: { part: 'tube-07', paint: 'belly' },

  /* The lion's and the tiger's nose pad, the biggest of the two canid options,
   * on the muzzle's own placed front plane. */
  nose: { part: 'box-32', paint: 'mark' },

  /* The lion's tail: longer and thinner than the wolf's fan, trailing, and
   * emphatically not the fox's brush. */
  tail: { part: 'wedge-15', paint: 'coat' },

  flag: 'THE SEPARATION FROM animal-wolf IS FOUR SWAPS AND NO NEW SHAPE, which is a decision '
    + 'rather than a shortage: a dire wolf is a grey wolf built heavier, and giving it a '
    + 'feature no canid has would be a lie about both animals. The four are box-41 for box-21 '
    + '(the only shell bigger than the cube on all three axes, against the FOX shell the wolf '
    + 'wears), wedge-16 for the wolf\'s fused ear lugs (the tiger\'s ear, the biggest in the '
    + 'range, HAND-PLACED because animal-bear.ts measured box-41\'s crown as flat only for '
    + '|z| <= 0.0833 and a donor transfer would float), tube-07 for tube-06 (the deepest muzzle '
    + 'in the bank at 0.266 through), and wedge-15 for box-38 (1.082 of reach against 0.912). '
    + 'THE FOX\'S BRUSH IS REFUSED AGAIN, for animal-wolf.ts\'s own three measurements — taper '
    + '0.961, round section, 1.67x the volume of any other tail — and its argument holds '
    + 'unchanged here. THE EYE CARD SITS 0.09 INSIDE THE HEAD, because box-41\'s front face is '
    + '0.725 and EYE_CARD_Z is an absolute 0.635 that rule 5 makes unsayable. Ten built species '
    + 'carry that; it is named, not corrected. NEW PALETTE, UNREVIEWED.',
})
