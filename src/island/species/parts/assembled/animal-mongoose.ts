/**
 * The mongoose — the meerkat's sibling, separated on the tail and the ear.
 *
 * Read `animal-meerkat.ts` first: the two are one family and this collection
 * holds both, so the separation is made once and both files carry it. It is
 * three numbers and every one is a measurement rather than a preference.
 *
 *   - **THE TAIL is `box-23`, the fox's brush, at 0.744 across** — the thickest
 *     in the bank — against the meerkat's `wedge-18` at 0.200. That is a 3.7x
 *     gap and it is the widest the bank offers between two long tails. A
 *     mongoose's tail is a tapering plume; a meerkat's is a rod.
 *   - **THE EARS are `box-02`**, the beaver's and the polar bear's round button,
 *     sunk its own 0.778 so only 0.070 stands proud — round and flush against
 *     the meerkat's small dark `wedge-04`.
 *   - **NO DARK EYE PATCH.** The meerkat spends the panda's card on one; this
 *     animal takes the standard `plate-01`, which is the whole difference on the
 *     face.
 *
 * Long and low is expressed by the WHEELBASE, never by the body: `africa.ts` has
 * argued that for the mongoose since phase 2, because `pets.ts` charges the
 * obstacle keep-out off the bounding box and a stretched body cannot walk
 * between two trees.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const MONGOOSE_ASSEMBLY = defineCreature('animal-mongoose', {
  palette: {
    coat: 0x8f8270,    // UNREVIEWED: grizzled grey-brown, the ticked coat
    belly: 0xdcd2bc,   // UNREVIEWED: the paler underside, and the sclera
    inner: 0xb8a68a,   // UNREVIEWED: the ear hollow and the brush's pale ground
    limb: 0x5f5548,    // UNREVIEWED: the short dark legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* THE WHEELBASE, not the body. 5/16 back from the midline against the
   * builder's own 0.25 — the crocodile's argument, applied to the other long low
   * animal in this collection. */
  legs: { z: 0.375 },

  /* Round and nearly flush: 0.070 proud at the shape's own 0.778 burial. */
  ears: { part: 'box-02', paint: { base: 'coat', byBand: { 7: 'inner' } } },

  /* THE PLUME. The fox's brush, trailing rather than carried up — the squirrel
   * and the skunk both take this shape up the rear chamfer and a mongoose's
   * tail is held out behind. Kenney's own two bands give it a paler ground. */
  tail: { part: 'box-23', paint: { base: 'coat', byBand: { 5: 'inner' } } },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'limb' },
})
