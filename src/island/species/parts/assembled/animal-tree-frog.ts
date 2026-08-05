/**
 * The tree frog — the red eyes are the animal, and everything else is
 * subtraction from `animal-frog.ts`.
 *
 * Garden already holds a frog and a toad and `garden.ts` names them as the pair
 * most likely to read as duplicates. A third frog therefore has to separate from
 * BOTH, and the four usual separators are unavailable to all three of them: no
 * ears, no tail, no snout, no nose, because a frog with any of those is a lie.
 * So it is spent where a red-eyed tree frog actually differs:
 *
 *   - **THE EYES.** `plate-14`, the pack's biggest card, painted RED to the rim
 *     and set at `animal-frog.ts`'s own solved corner station — high and wide, so
 *     they sit on top of the head where a tree frog's are. The frog's are the
 *     default oval; the toad's are lower still.
 *   - **THE TOE PADS.** JT-044's two-tone leg — Joe ruled it for hooves, *"just
 *     use a two tone leg for hooves"* — with the bottom 4/16 of each leg painted
 *     orange. A tree frog's discs are the thing it climbs with and no other
 *     amphibian in the project has them. `limb` is painted by nothing else here,
 *     which is what makes the split safe: a patch belongs to a SLOT, not a part.
 *   - **THE FLANK BARS.** Four `plate-11` on the pack's own card shell. A common
 *     frog has none and a toad has none.
 *   - **NO EARDRUM CARD**, which the frog has and this one deliberately has not.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The pack's own card shell on a 1.250 hull — the side face plus its 0.010. */
const CARD_X = 0.635
/** `plate-03`'s own recorded half-width. Two copies abut at x = 0. */
const GAPE_HALF = 0.118291

export const TREE_FROG_ASSEMBLY = defineCreature('animal-tree-frog', {
  palette: {
    coat: 0x63c22e,    // UNREVIEWED: the leaf green, brighter than the frog's
    belly: 0xf4f0d2,   // UNREVIEWED: the cream venter, and the sclera
    eye: 0xd12f2a,     // UNREVIEWED: the red that names the animal
    limb: 0x4aa022,    // UNREVIEWED: the climbing legs
    toe: 0xe8913a,     // UNREVIEWED: the orange discs, and only them
    flank: 0x3a5fc0,   // UNREVIEWED: the blue bars down the sides
    mark: 0x24501a,    // UNREVIEWED: the mouth line, and nothing else
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fish's cube. The same 1.250 silhouette as `box-03`, taken so this animal
   * is not on the frog's own shell — and its 78 triangles against the cube's 60
   * count toward rule 9's FLOOR, which is what binds on a species with no ears,
   * no tail and no snout. `animal-kinkajou.ts` makes the same argument. */
  hull: { part: 'box-20' },

  /* A frog's pale part is the venter only, so 7/16 — below the 0.4808-0.5481
   * zone §7 measured for the pack's mammals. */
  belly: 0.4375,

  /* The crouch, at the flat underside's own half-width, and the toe discs. */
  legs: { x: 0.3125, paint: { base: 'limb', patch: { below: 'toe', at: 0.25 } } },

  /* THE ANIMAL. The pack's biggest card at animal-frog.ts's own solved station:
   * as wide and as high as a card can sit and still be over the head. */
  eyes: { part: 'plate-14', paint: 'eye', x: 0.3, y: 1.15 },

  extras: [
    /* THE GRIN — two `plate-03` abutted at the midline, `animal-nightjar.ts`'s
     * measurement and `animal-gecko.ts`'s idiom: 0.473162 across, the widest line
     * this pack can draw, on a 1.250 head. Well clear of the eye cards above it,
     * which is the overlap the gecko had to solve for. */
    {
      name: 'mouth',
      part: 'plate-03',
      kind: 'pair' as const,
      paint: 'mark',
      at: [GAPE_HALF, 0.6875, 0.635] as [number, number, number],
    },

    /* THE BLUE FLANK BARS. Two a side on the pack's own card shell, spaced so no
     * two cards are coplanar and overlapping — which is the z-fight nothing in
     * `assembly.ts` breaks. */
    {
      name: 'bar-fore',
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'flank',
      at: [CARD_X, 0.80625, 0.24] as [number, number, number],
    },
    {
      name: 'bar-aft',
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'flank',
      at: [CARD_X, 0.80625, -0.24] as [number, number, number],
    },
  ],

  flag: 'THE EYES ARE THE WHOLE ANIMAL and they are as big as this kit allows: plate-14, the '
    + 'pack\'s biggest card at 0.4355 x 0.4426, painted red to the rim. RULE 5 makes '
    + 'stretching an eye unsayable — there is no stretch field on one and its z is not a '
    + 'parameter — so there is nothing above it to reach for, and a real red-eyed tree frog\'s '
    + 'eyes are proportionally larger than that. THE VERTICAL SLIT PUPIL IS NOT THERE: the '
    + 'pupil is a `byBand` recolour of Kenney\'s own cut and that cut is a round one. THE TOE '
    + 'PADS ARE JT-044\'s TWO-TONE LEG, the bottom quarter of each leg painted orange — your '
    + 'own hoof ruling doing a climbing frog\'s job. NEW PALETTE, UNREVIEWED, and note the '
    + 'green is deliberately brighter than animal-frog\'s signed-off 0x5fae33.',
})
