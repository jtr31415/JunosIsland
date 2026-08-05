/**
 * The wildebeest — `animal-ox.ts`'s horn, unchanged, and a beard.
 *
 * The horn station here is the ox's own, character for character: `wedge-11`
 * stretched 1.125/1.125/1.5, spun sideways then up by `{ y: 90 }, { z: 45 }`,
 * joined at `box-12`'s top-side bevel chord (0.46875, 1.275, 0.125). **That is
 * deliberate and it is the honest call.** A wildebeest's horns and an ox's are
 * the same bovid sweep — out, then up — and inventing a difference between them
 * would be a lie about the animal. The ox solved the seating on this exact
 * shell; re-deriving it would produce the same numbers less carefully.
 *
 * **So the separation from `animal-ox` and `animal-water-buffalo` is made
 * everywhere else:**
 *
 *   - **THE BEARD.** `cone-01`, the bank's only true point and its narrowest ear,
 *     hung off the front-bottom chamfer at `animal-goat.ts`'s own 135 degrees.
 *     Neither bovid has one and a wildebeest is the animal a child draws a beard
 *     on.
 *   - **THE TAIL.** `wedge-07`, a long dark switch — the same shape and the same
 *     hang as `animal-zebra.ts`, because in life those two animals' tails are the
 *     same thing and they walk in the same herd.
 *   - **COLOUR.** Slate-grey with a black face, against the ox's ruby red and the
 *     water buffalo's blue-slate.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s recorded centre, and its flat rear plate — both `box-03`'s. */
const HULL_CENTRE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/** `animal-ox.ts`'s own solved horn station on this shell. Not re-derived. */
const BEVEL_CHORD_X = 0.46875
const BEVEL_CHORD_Y = 1.275
const HORN_Z = 0.125

/** `animal-goat.ts`'s front-bottom chamfer, where a beard can hang from at all. */
const CHAMFER_OFF = 0.46875
const CHAMFER_DOWN_Y = HULL_CENTRE_Y - CHAMFER_OFF

export const WILDEBEEST_ASSEMBLY = defineCreature('animal-wildebeest', {
  palette: {
    coat: 0x6b6a68,    // UNREVIEWED: dust-grey, the blue wildebeest's slate
    pale: 0xd8d2c4,    // UNREVIEWED: the horns and the sclera — there is no belly line
    mark: 0x241f1c,    // UNREVIEWED: the black face, the beard, the mane and the tail
    limb: 0x504e4b,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-12' },
  /* No belly line — a wildebeest is one grey — so the pale one is named for the
   * sclera and the horns. */
  under: 'pale',

  /* The dog's and the pig's ear, low under the horns. */
  ears: { part: 'cone-02', paint: 'coat' },

  /* The long dark switch. The cat's rope spun 180 so it hangs rather than
   * curls — animal-donkey.ts's line, and animal-zebra.ts's. */
  tail: {
    part: 'wedge-07',
    paint: 'mark',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
  },

  /* The giraffe's nose as a heavy black muzzle. */
  snout: { part: 'tube-07', paint: 'mark' },

  extras: [
    /* THE HORNS — animal-ox.ts's own line, on animal-ox.ts's own shell. */
    {
      name: 'horn',
      part: 'wedge-11',
      kind: 'pair' as const,
      paint: 'pale',
      stretch: [1.125, 1.125, 1.5] as [number, number, number],
      spin: [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 45 }],
      at: [BEVEL_CHORD_X, BEVEL_CHORD_Y, HORN_Z] as [number, number, number],
    },

    /* THE BEARD. animal-goat.ts's own placement: rule 3 fuses head and body and
     * leaves no chin, so the front-bottom chamfer is where a beard hangs from. */
    {
      name: 'beard',
      part: 'cone-01',
      paint: 'mark',
      stretch: [1.4, 1.3, 1.4] as [number, number, number],
      spin: [{ axis: 'x', deg: 135 }],
      at: [0, CHAMFER_DOWN_Y, CHAMFER_OFF] as [number, number, number],
    },
  ],

  motion: [{ kind: 'wag', parts: ['tail'] }],
})
