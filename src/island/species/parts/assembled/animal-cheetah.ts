/**
 * The cheetah — spots and tear lines, which nothing else in the project has.
 *
 * Four cats are already in the tree and two of them are FROZEN: `animal-lion`
 * and `animal-tiger` cannot be edited, and `animal-lynx` and `animal-wildcat`
 * both sit on the plain cube. So this animal does NOT try to separate on the
 * shell — it takes the same cube — and separates on the two markings a cheetah
 * has that no other cat does:
 *
 *   - **THE SPOTS.** Four pairs of `plate-10`, the cow's, dog's and giraffe's
 *     flank patch, at the pack's own card shell x = 0.635. It is
 *     `animal-civet.ts`'s idiom spent on the animal it was made for.
 *   - **THE TEAR LINES.** Two `plate-13` — the pack's own FACE plate, a z-facing
 *     card — cut narrow and tall and hung under each eye on the eye plane. That
 *     is the one marking on a cheetah's face and it is the only face card in the
 *     project that is not a mouth.
 *
 * The ears are `box-05`, the smallest in the bank, against the lynx's tufts and
 * the wildcat's `wedge-06` — both its numbers re-solved, because the shape's own
 * are the bee's and do not transfer; and the tail is `wedge-15`, the
 * lion's, with its own end band painted white — a cheetah's tail tip is white
 * where a stoat's is black, and it is the same mechanism on the opposite colour.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The pack's own card shell — every flat flank marking sits here. */
const CARD_X = 0.635
/** Rule 5's eye plane, which is also where a face card belongs. */
const EYE_CARD_PLANE_Z = 0.635
/** `plate-01`'s own recorded x. The tear line hangs under the card, not beside it. */
const EYE_X = 0.2625

/** Four stations along the flank and two heights, on the pack's 1/16 grid. */
const SPOT: readonly [number, number][] = [
  [0.9375, 0.3125], [0.9375, -0.0625], [0.75, 0.1875], [0.75, -0.1875],
]

export const CHEETAH_ASSEMBLY = defineCreature('animal-cheetah', {
  palette: {
    coat: 0xd9b475,    // UNREVIEWED: dry tan — the ground the spots sit on
    belly: 0xf6eedd,   // UNREVIEWED: the cream underside, the tail tip and the sclera
    mark: 0x2a231c,    // UNREVIEWED: the spots, the tear lines and the nose
    limb: 0xc29a5c,    // UNREVIEWED: the long legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.5,

  /* Long-legged, which a cheetah is and the other three cats are not: the
   * wheelbase goes out rather than the body being stretched, because
   * `pets.ts` charges keep-out on the bounding box. */
  legs: { z: 0.3125 },

  /* The smallest ear in the bank. Its own record is a burial of ZERO at z =
   * 0.573 — the bee's placement, on a hull that is not this one — which would
   * stand the whole ear on the front chamfer with nothing holding it. So both
   * numbers are re-solved here: 9/16 buries 0.130, past §3's own 0.125 floor,
   * and the station keeps the ear's whole 0.221 x 0.191 footprint inside the
   * cube's flat top square of +/-0.3125. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.5625, at: [0.2, 1.43125, 0.2] },

  /* The lion's tail, and its own end band 5 painted cream. Paint, not a second
   * part, so the tip cannot come adrift — `animal-stoat.ts`'s finding, inverted. */
  tail: { part: 'wedge-15', paint: { base: 'coat', byBand: { 5: 'belly' } } },

  /* No muzzle. A cheetah's face is short and round, which is what having no
   * snout on this shell actually looks like — the lynx and the wildcat agree. */
  nose: { part: 'box-32', paint: 'mark' },

  extras: [
    ...SPOT.map(([y, z], i) => ({
      name: `spot-${i}`,
      part: 'plate-10',
      kind: 'pair' as const,
      paint: 'mark',
      at: [CARD_X, y, z] as [number, number, number],
    })),

    /* THE TEAR LINE. `plate-13` is the pack's own face plate — 0.219 x 0.100,
     * z-facing — cut to 0.35 of its width and 3.2x its height so it runs from
     * under the eye to the mouth. Same class of stretch as the zebra's stripe
     * and flagged for the same reason. */
    {
      name: 'tear',
      part: 'plate-13',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: [0.35, 3.2, 1] as [number, number, number],
      at: [EYE_X, 0.72, EYE_CARD_PLANE_Z] as [number, number, number],
    },
  ],

  flag: 'THE TEAR LINES ARE A STRETCHED FACE CARD, and they are the one place a rule was '
    + 'strained. plate-13 is Kenney\'s own z-facing face plate at 0.219 x 0.100, cut to 0.35 '
    + 'of its width and 3.2x its height so it reads as the line from eye to mouth that is the '
    + 'only marking on a cheetah\'s face. RULE 5 forbids stretching an EYE card and the pack '
    + 'measures its own face plates varying only 1.07x — plate-13 is a face plate, not an eye '
    + 'card, so this is inside rule 5 and outside the measurement, which is why it is flagged '
    + 'rather than taken quietly. THE SPOTS ARE NOT STRETCHED: eight plate-10 at their own '
    + 'size on the pack\'s own card shell, animal-civet.ts\'s idiom on the animal it was made '
    + 'for. THE SHELL IS DELIBERATELY THE SAME CUBE animal-lynx and animal-wildcat wear — this '
    + 'animal separates on markings, not on silhouette, and if it still reads as a spotted '
    + 'wildcat to you the fix is the palette. NEW PALETTE, UNREVIEWED.',
})
