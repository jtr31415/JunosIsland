/**
 * The bilby — the biggest ear in the bank over the longest snout, and a tail
 * that is painted rather than built.
 *
 * Three animals in this project now wear `box-06`, the bunny's ear: the fennec
 * fox, the hare and this one. That is honest — all three genuinely have outsized
 * upright ears and inventing a difference would be inventing — so the separation
 * is made everywhere else:
 *
 *   - **`tube-07`, the giraffe's nose-tip**, which is the longest muzzle in the
 *     bank at 0.532 and sits at a recorded burial of 0.376 rather than zero, so
 *     it grows OUT of the face instead of being stuck on the front of it. A hare
 *     has a blunt face and a fennec a tiny one; a bilby's is a long pointed
 *     probe and this is the only shape that says so.
 *   - **`wedge-18`, the tiger's whip, painted in two.** A bilby's tail is dark
 *     at the root and WHITE for its outer half with a crest. `byBand` puts the
 *     pale slot on band 3 — Kenney's own cut at the third of the whip furthest
 *     from the join — so the white is paint and cannot come adrift from the tail
 *     it is on. `animal-stoat.ts` established the idiom and this is its
 *     inversion: that animal paints a black tip on a chestnut rope.
 *   - **THE COAT IS BLUE-GREY**, which nothing else in the project is, against
 *     the hare's fawn and the fennec's sand.
 *
 * **The height is the tightest number here and it is not this file's.**
 * `animal-fennec-fox.ts` solved it on the same shape and the same shell: joined
 * at the cube's top face and sunk the bunny's own 0.366259, the ear's crown
 * lands at **2.0100 against the pack's 2.02 ceiling**. Nothing may be added
 * above it, which is why the tail trails rather than being carried up the rear
 * chamfer.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The cube's own centre, which is where `animal-opossum.ts` puts a whip: the
 * flat rear plate runs 0.4938 to 1.1187 and no tail in the bank is short enough
 * for its whole root to fit inside that, so the root is CENTRED on the plate
 * rather than hung at the donor's own height. A bilby's tail leaves the body low.
 */
const TAIL_Y = 0.8125

export const BILBY_ASSEMBLY = defineCreature('animal-bilby', {
  palette: {
    coat: 0x8e94a0,    // UNREVIEWED: the blue-grey coat, unique in the project
    belly: 0xefe9dd,   // UNREVIEWED: the white underside, the tail's outer half, the sclera
    mark: 0x2c2a29,    // UNREVIEWED: the black root of the tail and the nose
    limb: 0xa8a094,    // UNREVIEWED: the pale legs and the long muzzle
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The builder's default cube — the bunny's own shell, which is what makes the
   * ear's placement a recovery rather than an inference. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* Narrow and short: a bilby is a small hopping digger. */
  legs: { x: 0.3125, z: 0.28125 },

  /* THE EAR. The bunny's own, on the bunny's own hull, at the bunny's own
   * burial — animal-fennec-fox.ts's solve, unchanged, crown at 2.0100 against a
   * 2.02 ceiling. Painted pale entire: box-06 is the one ear in the bank with no
   * band cut in it, so there is no inner ear to reach. */
  ears: { part: 'box-06', paint: 'belly' },

  /* THE SNOUT. The longest in the bank, and the only long one that grows out of
   * the face rather than standing on it — its recorded burial is 0.376. */
  snout: { part: 'tube-07', paint: 'limb' },

  /* The bunny's nose-tip, the smallest solid nose in the bank, on the muzzle's
   * own placed front plane. */
  nose: { part: 'box-09', paint: 'mark', on: 'snout' },

  /* THE TAIL, painted in two. Band 3 is Kenney's own cut at the third furthest
   * from the join, so the white outer half is paint rather than a second part.
   * animal-stoat.ts's idiom, inverted: dark root, pale tip.
   *
   * At the opossum's own station rather than the tiger's recorded 1.187, which
   * is a cat's raised tail: `animal-opossum.ts` centres a whip on the cube's
   * flat rear plate instead, and a bilby's tail leaves the body low. */
  tail: { part: 'wedge-18', paint: { base: 'mark', byBand: { 3: 'belly' } }, at: [0, TAIL_Y, -0.625] },

  flag: 'THE HEIGHT IS 2.0100 AGAINST A 2.02 CEILING and every millimetre of the margin is '
    + 'EAR — animal-fennec-fox.ts\'s own number, on the same box-06 and the same box-03, where '
    + 'joining at the cube\'s top face and sinking the bunny\'s own 0.366259 lands the crown on '
    + '1.553395 against the bank\'s recorded 1.553396. NOTHING MAY BE ADDED ABOVE IT, which is '
    + 'why the tail trails instead of being carried up the rear chamfer — that idiom alone '
    + 'reaches 1.976 on an earless animal. THIS IS THE THIRD SPECIES TO WEAR THE BUNNY\'S EAR '
    + '(the fennec and the hare are the others) and that is deliberate: all three really do have '
    + 'outsized upright ears and inventing a difference would be inventing, so the separation is '
    + 'made on the SNOUT — tube-07, the longest in the bank at 0.532 and the only long one with '
    + 'a non-zero recorded burial, so it grows out of the face rather than being stuck on it — '
    + 'and on the TAIL, where band 3 is Kenney\'s own cut and the white outer half is paint. '
    + 'That is animal-stoat.ts\'s trick run backwards: dark root, pale tip. AND THE COAT IS '
    + 'BLUE-GREY, which nothing else in the project is. NEW PALETTE, UNREVIEWED.',
})
