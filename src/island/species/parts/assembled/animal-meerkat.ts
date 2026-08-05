/**
 * The meerkat — the dark eye patch is the animal, and it is the panda's card.
 *
 * A meerkat and a mongoose are the same family and this collection holds both,
 * so the separation is made once, here and in `animal-mongoose.ts`, on three
 * measured axes:
 *
 *   - **THE EYE.** `plate-14`, the panda's own card and the biggest in the bank
 *     at 0.435 x 0.443, painted near-black to the rim. A meerkat's dark patch IS
 *     the panda's job, and rule 5 says a big eye is a part choice rather than a
 *     scale, so this is the only way to have one.
 *   - **THE TAIL.** `wedge-18`, the tiger's whip and the THINNEST in the bank at
 *     0.200 across, with its own end band 3 painted dark — against the
 *     mongoose's `box-23`, the fox's plume at 0.744. A 3.7x gap in thickness is
 *     the widest the bank offers between two long tails.
 *   - **THE EARS.** `wedge-04` at its own burial, small and set low.
 *
 * **THE SENTRY POSE IS NOT HERE and cannot be.** A leg row is `kind: 'row'` with
 * one y for all four, and `africa.ts` has said since phase 2 that the upright
 * stance is "as far as a four-legged kit can say it". The banded back is absent
 * for `animal-chipmunk.ts`'s reason: `byBand` paints only where Kenney cut, and
 * the cube has one band.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const MEERKAT_ASSEMBLY = defineCreature('animal-meerkat', {
  palette: {
    coat: 0xc9a878,    // UNREVIEWED: pale desert sand
    belly: 0xf2e6cd,   // UNREVIEWED: the paler front, and nothing else
    mark: 0x322820,    // UNREVIEWED: the eye patch, the ears, the nose, the tail tip
    limb: 0xa88a5c,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.5,

  /* THE PANDA'S CARD, painted to the rim. The pupil band 15 still reads, so it
   * is a dark patch with an eye in it rather than a black disc. */
  eyes: { part: 'plate-14', paint: 'mark' },

  /* Small, dark and low — the second half of the separation from the mongoose,
   * whose `box-02` buttons are round and set on top. */
  ears: { part: 'wedge-04', paint: 'mark' },

  /* The bank's thinnest, with the black tip painted onto Kenney's own end band —
   * `animal-stoat.ts`'s mechanism, and the stoat's own warning applies: the tip
   * costs no geometry and cannot come adrift from the tail it is on. */
  tail: { part: 'wedge-18', paint: { base: 'coat', byBand: { 3: 'mark' } } },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },
})
