/**
 * The Arctic hare — the third lagomorph, and the ears go the other way.
 *
 * `animal-bunny` is FROZEN and `animal-hare` is built, and that file's whole
 * argument is that a hare is *"the tallest ear in the bank"* — `box-06` at
 * 0.913, unstretched, paired with `box-18`, the shortest tail. So this animal
 * cannot be a third animal with big ears, and happily it does not want to be:
 * **an Arctic hare has the shortest ears of any hare**, because a long ear
 * loses heat, and they are BLACK AT THE TIP.
 *
 * So it takes the same shape and turns the dial the other way:
 *
 *   - **`box-06` stretched to 0.55 on its own long axis** — 0.502 of reach
 *     against the Woodland hare's 0.913. §3 measured that ears vary 2.97x
 *     naturally across the pack, so shortening one is inside what Kenney himself
 *     drew and is the one place rule 1 says a stretch is safe rather than bold.
 *   - **Black tips, and they have to be PARTS.** `box-06` arrives as one band
 *     (5, all 60 triangles), so there is no cut to paint into and a `byBand`
 *     here would be a silent no-op — `animal-hare.ts` found that first. The tips
 *     are two `cone-01` hung `on: 'ear'`, which anchors each to the ear's own
 *     built outer face rather than to a coordinate this file would keep a stale
 *     copy of.
 *
 * Everything else is a white rabbit: `box-36`, `tube-01`, `box-09`, and the
 * Woodland hare's own `box-18` scut, shared because both animals have the same
 * dot of a tail and inventing a difference would be a lie.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — `animal-badger.ts`'s solve for every stub. */
const REAR_PLATE_Y = 0.80625
/** `box-36`'s flat crown, +/-0.3125 in x and z. */
const CROWN_Y = 1.43125

/**
 * The ear, cut to 55%. `box-06` is 0.913146 tall and the Woodland hare wears it
 * whole; 0.55 leaves 0.502, which is still the second tallest ear in the
 * project and is inside the pack's own 2.97x natural spread (§3).
 */
const EAR_STRETCH: [number, number, number] = [1, 0.55, 1]

export const ARCTIC_HARE_ASSEMBLY = defineCreature('animal-arctic-hare', {
  palette: {
    coat: 0xeef2f6,    // UNREVIEWED: winter white with a cool cast
    belly: 0xffffff,   // UNREVIEWED: a true white underside
    mark: 0x22252a,    // UNREVIEWED: the ear tips and the nose — the only dark on it
    inner: 0xd9b6ae,   // UNREVIEWED: nothing wears it but the sclera would be worse white
    limb: 0xdde5ec,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-36' },
  belly: 0.5,

  /* THE SHORT EAR. Same shape as the Woodland hare, cut to 0.55 of its own
   * length — the one stretch §3 calls measured-safe. Joined on the flat crown. */
  ears: { part: 'box-06', paint: 'coat', stretch: EAR_STRETCH, at: [0.26, CROWN_Y, 0.05] },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },

  /* The Woodland hare's scut, shared on purpose: both animals have the same dot
   * of a tail and a shape difference between them would be invented. */
  tail: { part: 'box-18', paint: 'belly', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE BLACK TIPS, and they are the fact a child is told. `box-06` is one
     * band so there is nothing to paint into; `on: 'ear'` hangs each cone on
     * the ear's own BUILT outer face, so moving the ear moves the tip. */
    { name: 'ear-tip', part: 'cone-01', paint: 'mark', kind: 'pair', on: 'ear', sink: 0.45 },
  ],

  flag: 'THE EARS GO THE OTHER WAY AND THAT IS THE ANIMAL. animal-hare\'s whole argument is '
    + 'that a hare is the TALLEST ear in the bank (box-06, 0.913, unstretched); an Arctic hare '
    + 'has the SHORTEST ears of any hare, because a long ear loses heat. So this wears the same '
    + 'shape cut to 0.55 of its own length — 0.502 of reach — which is the one place rule 1 '
    + 'calls a stretch measured-safe, since §3 puts the pack\'s own natural ear spread at '
    + '2.97x. THE BLACK TIPS HAVE TO BE PARTS: box-06 arrives as ONE band (5, all 60 '
    + 'triangles), so a byBand would be a silent no-op — animal-hare.ts found that first — and '
    + 'the tips are two cone-01 hung with `on: \'ear\'`, anchored to the ear\'s own built outer '
    + 'face so that moving the ear moves the tip. THE SCUT IS SHARED with the Woodland hare '
    + 'deliberately: both animals have the same dot of a tail. NEW PALETTE, UNREVIEWED, and it '
    + 'is another white animal — the tips and the nose are the only dark on it, so if it does '
    + 'not read, they are the dial.',
})
