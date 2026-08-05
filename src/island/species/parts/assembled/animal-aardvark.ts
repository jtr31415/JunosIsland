/**
 * The aardvark — a long tube snout and the bunny's ears, and both are measured.
 *
 * Two features carry this animal and nothing else has to:
 *
 *   - **THE SNOUT IS `tube-07` CUT LONG.** The giraffe's nose, taken to 0.65 of
 *     its width and height and 2.0x its length, which is a narrow tube standing
 *     0.332 clear of the face. Rule 1 sanctions a stretch on a snout by name and
 *     §3 measured the pack's own varying 2.90x, so this is inside what Kenney
 *     drew rather than outside it — and it is a TUBE being made longer, which is
 *     the one thing an aardvark's face is.
 *   - **THE EARS ARE `box-06`**, the bunny's, the tallest in the bank at 0.913
 *     and standing 0.5788 proud at its own burial. `animal-donkey.ts` measured
 *     that this puts an animal at 2.010 on the cube's crown, 0.010 under the
 *     pack's ceiling, and this one is in exactly the same place.
 *
 * The tail is `wedge-03`, the beaver's paddle — the only tail in the bank that is
 * thick at the root and strongly tapering (0.577), which is what an aardvark's
 * is. The wheelbase goes long rather than the body, for the crocodile's reason.
 *
 * **NO CLAWS.** The `claw` role occurs zero times in the bank, and digging is
 * what this animal is for; `animal-mole.ts` stands `wedge-01` in for them and
 * that shape is a nose-tip doing a job. Left off here rather than borrowed.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `animal-donkey.ts`'s own solved ear station on this shell: inward, so nothing floats. */
const EAR_X = 0.2
const EAR_Z = 0.25
const CROWN_Y = 1.43125

/** 0.65 across and up, 2.0 along. See the header — a tube made into a longer tube. */
const SNOUT_STRETCH: [number, number, number] = [0.65, 0.65, 2.0]

export const AARDVARK_ASSEMBLY = defineCreature('animal-aardvark', {
  palette: {
    coat: 0xbaa793,    // UNREVIEWED: pinkish clay-grey, near-naked skin
    pale: 0xe8dcca,    // UNREVIEWED: the sclera and the ear hollow
    snout: 0xa1907e,   // UNREVIEWED: the long snout, a shade under the coat
    limb: 0x7d6d5e,    // UNREVIEWED: the heavy digging legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No belly line — an aardvark is one clay colour — so the pale one is named. */
  under: 'pale',

  /* Long and low, said with the wheelbase because keep-out is charged on the
   * bounding box and a stretched body cannot walk between two trees. */
  legs: { z: 0.375 },

  /* THE EARS, at animal-donkey.ts's own solved station rather than the shape's
   * recorded one — the bunny is built on this same cube, so its offset LOOKS
   * like a pure donor transfer and is not: five of the ear's own vertices stand
   * proud there. */
  ears: { part: 'box-06', paint: 'coat', at: [EAR_X, CROWN_Y, EAR_Z] },

  /* The beaver's paddle: the bank's one flat strongly-tapering tail. */
  tail: { part: 'wedge-03', paint: 'coat' },

  /* THE SNOUT. See SNOUT_STRETCH. */
  snout: { part: 'tube-07', paint: 'snout', stretch: SNOUT_STRETCH },
  nose: { part: 'box-09', paint: 'limb' },

  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
