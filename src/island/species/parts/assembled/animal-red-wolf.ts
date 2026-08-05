/**
 * The red wolf — the grey wolf's own tail, hung LOW, and that is the whole
 * separation from it.
 *
 * `animal-wolf.ts` is the file to read beside this one. It takes `box-21` — the
 * pack's tallest shell, which it measures as *"the standard 1.250 cube with two
 * fused EAR LUGS on top"* — and it takes `box-38`, the parrot's fan, by a pure
 * donor transfer that lands its centre on the parrot's own recorded
 * z = -0.772857 at y = 1.099846. Both of those decisions are what this animal
 * has to be different from, and both are answered by placement rather than by
 * new shapes:
 *
 *   - **`box-03`, the plain cube, so this wolf HAS EARS.** A red wolf is smaller
 *     than a grey wolf and its large pricked ears are the first thing anybody
 *     says about it. `box-21` makes an ear part impossible — four ears — so the
 *     smaller hull is not a compromise here, it is what buys the ears.
 *     `cone-02`, the dog's and pig's own pricked ear, is the biggest cone in the
 *     bank at 0.153 proud.
 *   - **THE SAME FAN, HUNG AT THE BODY'S OWN CENTRE.** `box-38` joined at
 *     y = 0.80625 rather than at the parrot's 1.0998 drops the tail nearly a
 *     quarter of a body, so it trails low off the rump instead of being carried.
 *     A red wolf holds its tail down. One shape, two animals, told apart by
 *     placement — §3.1, and the argument `collections/ice.ts` makes for husky
 *     against wolf on this exact shape.
 *   - **`tube-03`, the muzzle with NO cut.** The grey wolf takes `tube-06` for
 *     Kenney's own horizontal split — pale to the lip, dark over the bridge —
 *     and the dingo takes the same cut the other way about. A red wolf's muzzle
 *     is one unbroken cinnamon, so the shape with no cut is the right one and
 *     the split is refused rather than repainted.
 *
 * The nose is `box-32`, the lion's and the tiger's, which is the grey wolf's own
 * — taken deliberately, because a red wolf IS a wolf and inventing a difference
 * where the animals have none is what `animal-dingo.ts` warns against.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s rear plate — its own centre, which is where a low tail roots. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const RED_WOLF_ASSEMBLY = defineCreature('animal-red-wolf', {
  palette: {
    coat: 0xa2643a,    // UNREVIEWED: the cinnamon of a red wolf's flanks
    belly: 0xe4d3b6,   // UNREVIEWED: the pale underside, and the sclera
    ear: 0xb96f2f,     // UNREVIEWED: the rufous ears, brighter than the coat
    mark: 0x2e2620,    // UNREVIEWED: the nose
    limb: 0x8a5330,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The plain cube, and it is what buys the ears: box-21 is the grey wolf's and
   * its two fused lugs ARE its ears, so a species on it cannot have a pair. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator.
   * animal-wolf.ts has to use 7/16 because its hull's height includes the ear
   * lugs; this hull is all body, so the usual number is the right one. */
  belly: 0.5,

  /* Narrower than the grey wolf's 0.375: a red wolf is the lighter animal, and
   * the wheelbase is all the kit has to say so once the hull has said smaller. */
  legs: { x: 0.34, z: 0.32, paint: 'limb' },

  /* The dog's and pig's pricked ear, the biggest cone in the bank at 0.153
   * proud, painted a brighter rufous than the coat. */
  ears: { part: 'cone-02', paint: 'ear' },

  /* The deer's muzzle, which is the one in the family Kenney did NOT split —
   * same bounding box as the fox's to six decimals, different mesh. A red wolf's
   * muzzle is one unbroken cinnamon, so the cut is refused, not repainted. */
  snout: { part: 'tube-03', paint: 'coat' },

  /* The lion's and the tiger's pad, which is the grey wolf's own. A red wolf IS
   * a wolf and this is not a difference worth inventing. */
  nose: { part: 'box-32', paint: 'mark' },

  /* THE FAN, HUNG LOW. Joined at the body's own centre rather than at the
   * parrot's recorded 1.0998, so it trails off the rump instead of being
   * carried — a quarter of a body lower than animal-wolf's. */
  tail: { part: 'box-38', paint: 'coat', at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  flag: 'THE SEPARATION FROM animal-wolf IS THE PLACEMENT OF ONE SHARED SHAPE, and it is the '
    + 'thing to look at. Both wear box-38, the parrot\'s fan. The grey wolf takes it by a pure '
    + 'donor transfer that lands its centre on the parrot\'s own recorded y = 1.099846; this '
    + 'joins it at the body\'s own centre, y = 0.80625, so it hangs nearly a quarter of a body '
    + 'lower and trails instead of being carried. §3.1 exactly, and it is the argument '
    + 'collections/ice.ts makes for husky against wolf on the very same tail. THE SECOND '
    + 'SEPARATION IS THAT THIS WOLF HAS EARS: animal-wolf.ts measured box-21 as the 1.250 cube '
    + 'with two FUSED EAR LUGS on top, so a species on that shell cannot have an ear pair '
    + 'without having four. Dropping to the plain cube is what buys cone-02, the biggest cone '
    + 'ear in the bank, and a red wolf\'s large pricked ears are the first thing anybody names '
    + 'about it. THE MUZZLE REFUSES KENNEY\'S CUT: tube-06 is split into a pale lip and a dark '
    + 'bridge and both animal-wolf and animal-dingo spend that split; a red wolf\'s muzzle is '
    + 'one unbroken cinnamon, so this takes tube-03, the same bounding box to six decimals '
    + 'with no cut in it. The NOSE is deliberately the grey wolf\'s own box-32 — a red wolf IS '
    + 'a wolf, and animal-dingo.ts is the standing warning against inventing a difference the '
    + 'animals have not got. Nothing here is stretched. NEW PALETTE, UNREVIEWED.',
})
