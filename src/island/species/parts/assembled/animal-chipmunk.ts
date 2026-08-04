/**
 * The chipmunk — a small squirrel that has to not BE the squirrel.
 *
 * `animal-squirrel` is already shipped and wears `box-23`, the fox's brush,
 * carried up. Woodland's chipmunk sits on the same album page as a red squirrel,
 * so the two are separated on the only two axes a child reads at this size:
 *
 *   - **The tail is `wedge-15`, a whip, not a plume.** 0.28 across against the
 *     brush's 0.74 — a third of the width, and the widest gap the bank offers
 *     between two tails that are both long.
 *   - **The ears are `box-02`, the pack's small top-face button.** The squirrel's
 *     are tufted and stand proud; a chipmunk's are round and close to the head.
 *
 * The stripes a chipmunk is actually named for are NOT here, and that is the
 * honest limit rather than an oversight: `byBand` paints a shape's own recorded
 * bands, and `box-03` carries no band that runs front-to-back along the spine.
 * Faking them would mean authoring geometry, which rule 1 refuses while an
 * adaptation exists — so the animal is separated on tail and ear instead, and
 * this paragraph is here so nobody "fixes" it by drawing a stripe.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const CHIPMUNK_ASSEMBLY = defineCreature('animal-chipmunk', {
  palette: {
    coat: 0xb0763c,
    belly: 0xf6ecd8,
    inner: 0xdca978,
    limb: 0x6a4526,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'inner' } } },
  // Carried UP off the back, which is what a squirrel-family tail does and what
  // keeps this animal from reading as a mouse with a long tail.
  tail: { part: 'wedge-15', paint: 'coat', at: [0, 1.15, -0.625] },
  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'limb' },
})
