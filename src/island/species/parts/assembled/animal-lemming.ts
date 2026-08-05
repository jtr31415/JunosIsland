/**
 * The lemming — the rodent whose separation is SUBTRACTION.
 *
 * There are already six small rodents on the shared cube with `tube-01` barrel
 * muzzles and `box-09` nose-tips: the mouse, the vole, the dormouse, the shrew,
 * the gerbil and the degu. A seventh with a slightly different ear is a seventh
 * mouse. So this one is built by taking things AWAY, which is what a lemming
 * actually is:
 *
 *   - **`box-05`, the smallest ear in the bank** (0.221 x 0.232), and it is
 *     buried at 0.70 rather than at its own recorded 0.000, so it shows 0.070
 *     — `animal-sheep.ts` measured that figure and called it invisible on a
 *     sheep, which is precisely right here. A lemming's ears are inside its
 *     fur. The mouse wears `box-25`, the koala's dish, which is 3.4x across.
 *   - **No belly line at all.** Every other cube rodent in the project splits
 *     its coat at 8/16. A lemming in winter is one white all the way round and
 *     the absence is the marking.
 *   - **The stub, not the rope.** `box-18` at the rear plate against the
 *     mouse's `wedge-07`, which is 1.047 long and 212 triangles.
 *
 * `box-03` and not something rounder, because a hull is worn at its own size
 * (`HullDef.stretch` is `never`) and a lemming is a small animal, so its
 * roundness has to be carried by the palette and the absence of anything
 * sticking out. Which is the whole design of it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — `animal-badger.ts`'s solve for every stub. */
const REAR_PLATE_Y = 0.80625

/**
 * The ear, buried until it barely shows. `box-05`'s own recorded burial is
 * 0.000 — the bee and the caterpillar wear it on the surface — and 0.70 leaves
 * 0.070 proud, which is the figure `animal-sheep.ts` §5 measured on `box-02` and
 * called invisible. Here that is the intent.
 */
const EAR_SINK = 0.7

export const LEMMING_ASSEMBLY = defineCreature('animal-lemming', {
  palette: {
    coat: 0xf0f3f6,    // UNREVIEWED: winter white — a collared lemming turns white
    fur: 0xe3e8ed,     // UNREVIEWED: the ears and the tail, a shade under the coat
    mark: 0x33302c,    // UNREVIEWED: the nose and the eye
    limb: 0xdadfe4,    // UNREVIEWED: the feet, which are furred to the claw
    pale: 0xffffff,    // UNREVIEWED: the sclera
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* No `belly`. Every other cube rodent in the project splits at 8/16 and the
   * absence is this animal's marking — see the header. */
  under: 'pale',

  /* Short-legged and close to the ground. */
  legs: { z: 0.22 },

  /* The bank's smallest ear, buried until 0.070 shows. Its own donor station is
   * z = 0.573, which is the bee's — past this hull's flat top face, which reaches
   * only 0.3125 — so the join is given explicitly at 0.14, well inside it. */
  ears: { part: 'box-05', paint: 'fur', sink: EAR_SINK, at: [0.228, 1.43125, 0.14] },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },

  /* The stub, against the mouse's 1.047 rope. */
  tail: { part: 'box-18', paint: 'fur', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  eyes: { paint: 'pale' },

  extras: [
    /* THE COLLAR, and it is the animal's own name. A collared lemming is called
     * that for the pale band across its shoulders, and `box-11` — the
     * caterpillar's body segment — is the one shell-ring in the bank narrow
     * enough to sit on the 1.250 cube without becoming a second mass:
     * 1.444 x 0.877 x 0.446 is 0.5648 of volume against the cube's 1.9531, a
     * ratio of 3.46 where `assembly-assert.ts` demands over 3. It stands 0.097
     * proud all round, which `animal-sheep.ts` §2 measured as the middle of the
     * five rings on this hull.
     *
     * Every number is the donor's: no `at`, no `sink`, no `stretch`, so the
     * transfer joins it at this cube's top face and its centre recovers the
     * caterpillar's own recorded y of 1.071. */
    { name: 'collar', part: 'box-11', paint: 'pale' },

    /* Whiskers, on `animal-nightjar.ts`'s own spun-`cone-01` idiom: `{ x, 78 }`
     * takes the shape's `y +1` facing to (0, 0.208, 0.978), nearly straight
     * ahead, and `{ y, 35 }` splays each side off the muzzle. A rodent this
     * short-faced is mostly whisker from the front. */
    {
      name: 'whisker',
      part: 'cone-01',
      paint: 'fur',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 78 }, { axis: 'y', deg: 35 }],
      sink: 0.45,
      at: [0.12, 0.80, 0.70],
    },
  ],

  flag: 'THE SEPARATION HERE IS SUBTRACTION AND THAT IS THE THING TO JUDGE. Six small rodents '
    + 'are already built on the shared cube with tube-01 muzzles and box-09 noses — mouse, '
    + 'vole, dormouse, shrew, gerbil, degu — so a seventh with a slightly different ear would '
    + 'be a seventh mouse. This one takes things away instead: box-05, the SMALLEST ear in the '
    + 'bank at 0.221 x 0.232, buried at 0.70 so only 0.070 shows (the figure animal-sheep.ts '
    + 'measured and called invisible, which is exactly what a lemming\'s ear is), against the '
    + 'mouse\'s box-25 koala dish at 3.4x across; NO BELLY LINE at all, where every other cube '
    + 'rodent splits at 8/16; and box-18, the stub, against the mouse\'s 1.047 rope. If it '
    + 'still reads as a mouse, the ear sink and the missing belly line are the two dials. NEW '
    + 'PALETTE, UNREVIEWED — this is the winter coat of a collared lemming, which is the only '
    + 'rodent in the world that turns white, and that is why it is worth having in Ice at all.',
})
