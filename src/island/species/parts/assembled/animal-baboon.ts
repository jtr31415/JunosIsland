/**
 * The baboon — the monkey's own shell with a dog's muzzle on it.
 *
 * `box-33` is the FROZEN `animal-monkey`'s hull and this animal takes it
 * deliberately, on `animal-chicken.ts`'s argument about the frozen chick: a
 * baboon IS a monkey, and giving it a different body to look different would be
 * inventing. The separation is carried by the two things a baboon has that a
 * monkey has not, and by the one thing the gorilla has not:
 *
 *   - **THE MUZZLE.** `box-18` — the elephant's trunk, which the bank files as a
 *     tail — cut to 0.62 of its width and height and 1.35x its reach, so it is a
 *     long narrow box standing 0.574 clear of the face. `animal-crocodile.ts`
 *     wears the same shape at the opposite ratio (wide and flat); this is the
 *     other end of the same dial and §3.1 is exactly that.
 *   - **THE ARCHED TAIL.** `wedge-15` with `chamfer: true`, which solves the
 *     rear-top chamfer's midpoint and the 45-degree turn onto its normal
 *     together. A baboon's tail leaves the body upright and then drops, and this
 *     is the first half of that.
 *   - **A TAIL AT ALL**, which `animal-gorilla.ts` deliberately has not.
 *
 * The bare rump and the coloured face are absent: `Paint.patch` takes a HEIGHT
 * and nothing else, `byBand` cuts only where Kenney cut, and `box-33` carries one
 * band. That is `animal-skunk.ts`'s finding on a fifth animal.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-33`'s flat front plate — the cube's own +0.625. */
const FRONT_PLATE_Z = 0.625

/**
 * 0.62 across and up, 1.35 along. `box-18` is 0.345 x 0.623 x 0.425 at zero
 * burial, so the copy is 0.214 x 0.386 with 0.574 of reach — a long narrow
 * muzzle. Hung at 0.78, which puts its lower edge at 0.587, inside the flat
 * front plate's own 0.494 to 1.119.
 */
const MUZZLE_STRETCH: [number, number, number] = [0.62, 0.62, 1.35]
const MUZZLE_Y = 0.78

export const BABOON_ASSEMBLY = defineCreature('animal-baboon', {
  palette: {
    coat: 0x8a7350,    // UNREVIEWED: olive-brown, the coat of an olive baboon
    belly: 0xcdbc99,   // UNREVIEWED: the paler underside, and the sclera
    skin: 0x4a3b30,    // UNREVIEWED: the bare muzzle and ears — skin, not hair
    limb: 0x6b573a,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-33' },
  belly: 0.4375,

  /* Small, bare and close to the head, painted skin rather than coat. */
  ears: { part: 'wedge-04', paint: 'skin' },

  /* THE MUZZLE. See the header and MUZZLE_STRETCH for both numbers. */
  snout: {
    part: 'box-18',
    paint: 'skin',
    stretch: MUZZLE_STRETCH,
    at: [0, MUZZLE_Y, FRONT_PLATE_Z],
  },

  /* On the muzzle's own placed front plane — automatic, once a snout exists. */
  nose: { part: 'box-09', paint: 'skin' },

  /* CARRIED UP. animal-squirrel.ts and animal-kinkajou.ts are the worked
   * examples; here it is a baboon's upright tail root. */
  tail: { part: 'wedge-15', paint: 'coat', chamfer: true },
})
