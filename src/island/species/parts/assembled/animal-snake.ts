/**
 * The snake — the third legless animal in the project, and the only one whose
 * markings are flat CARDS rather than a ridge.
 *
 * `animal-slow-worm.ts` and `animal-corn-snake.ts` settled what leglessness
 * costs and how it is paid, and none of that is re-derived here: **the coil is
 * theirs, deliberately.** `box-04`, the bee's abdomen ring, laid flat with
 * `{ axis: 'x', deg: 90 }`, cut to 1.000 across and sunk 0.602522 so its
 * underside lands on y = 0 — the plane the feet would have stood on. It is the
 * kit's ANSWER to leglessness rather than a decoration any of the three chose,
 * and re-deriving it with a different ring to look original would put an
 * unproven transform where a proven one already works.
 *
 * **Where the three separate is above the belly, and this one separates on the
 * marking.** The slow worm wears fine `box-08` annulations (0.081 proud), the
 * corn snake coarse `wedge-04` saddles (0.119 proud) and the eel a dorsal run —
 * all three are RIDGES. This one wears twelve `plate-10` flank blotches, which
 * cost no silhouette at all, so it is the only smooth-backed snake in the tree.
 * The forked tongue is two `wedge-08`, the caterpillar's tooth, at a third of
 * its width and three times its reach.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The pack's own card shell on a 1.250 hull. */
const CARD_X = 0.635
/** `plate-13`'s own recorded half-width. Two copies abut at x = 0. */
const GAPE_HALF = 0.10961
/** Where the coil joins: the hull's own bottom plane, on all nine usual shells. */
const HULL_BOTTOM_Y = 0.18125

/** Two rows of three, spaced so no two coplanar cards ever overlap. */
const BLOTCH: readonly [number, number][] = [
  [0.9375, 0.26], [0.9375, 0], [0.9375, -0.26],
  [0.6875, 0.26], [0.6875, 0], [0.6875, -0.26],
]

export const SNAKE_ASSEMBLY = defineCreature('animal-snake', {
  palette: {
    coat: 0xc9b184,    // UNREVIEWED: the pale tan ground of a young python
    belly: 0xf2ead6,   // UNREVIEWED: the cream venter, and the sclera
    mark: 0x6b4a25,    // UNREVIEWED: the twelve flank blotches
    tongue: 0xb03a4a,  // UNREVIEWED: the forked tongue, and only it
    dark: 0x35291a,    // UNREVIEWED: the mouth line
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* Any of the pack's five 1.250 cubes is the same silhouette, and this one is
   * taken for its TRIANGLE COUNT: 114 against `box-03`'s 60. Rule 9's budget is
   * a floor as well as a ceiling and leglessness is what makes that bite — four
   * legs are 176 triangles and this animal has none. `animal-kinkajou.ts` makes
   * the same argument for `box-36`. */
  hull: { part: 'box-33' },

  /* A snake's pale part is the venter, and a python's ventral scales wrap onto
   * the flank, so 7/16 — `animal-corn-snake.ts`'s own reading. */
  belly: 0.4375,
  legs: false,

  /* The pack's smallest card. A snake's eye is small, lidless and set well
   * forward, and there is nothing under `plate-06` to reach for. */
  eyes: { part: 'plate-06' },

  extras: [
    /* THE COIL — the slow worm's and the corn snake's, unchanged. See the
     * header for why that is the point rather than a copy. */
    {
      name: 'coil',
      part: 'box-04',
      paint: 'belly',
      spin: [{ axis: 'x' as const, deg: 90 }],
      stretch: [0.749064, 0.749064, 1] as [number, number, number],
      axis: 'z' as const,
      dir: 1 as const,
      sink: 0.6025219298245615,
      at: [0, HULL_BOTTOM_Y, 0] as [number, number, number],
    },

    /* THE BLOTCHES. Six a side, and the two spacings are solved rather than
     * picked: `plate-10` is 0.244 tall by 0.253 deep, so rows 0.25 apart and
     * columns 0.26 apart are the closest two cards can sit without becoming
     * coplanar and overlapping — which is the z-fight nothing in the texture
     * route breaks (`animal-gecko.ts` found it between four face cards). */
    ...BLOTCH.map(([y, z], i) => ({
      name: `blotch-${i}`,
      part: 'plate-10',
      kind: 'pair' as const,
      paint: 'mark',
      at: [CARD_X, y, z] as [number, number, number],
    })),

    /* THE MOUTH LINE — two `plate-13` abutted at the midline, 0.438 across,
     * `animal-gecko.ts`'s idiom on the animal whose gape IS its head. */
    {
      name: 'mouth',
      part: 'plate-13',
      kind: 'pair' as const,
      paint: 'dark',
      at: [GAPE_HALF, 0.66, 0.635] as [number, number, number],
    },

    /* THE TONGUE. The caterpillar's tooth at 0.5 across and 3x its reach —
     * two prongs 0.100 apart, standing 0.150 clear of the mouth. */
    {
      name: 'tongue',
      part: 'wedge-08',
      kind: 'pair' as const,
      paint: 'tongue',
      stretch: [0.5, 0.5, 3] as [number, number, number],
      at: [0.05, 0.7, 0.625] as [number, number, number],
    },
  ],

  flag: 'THE COIL IS THE SLOW WORM\'S AND THE CORN SNAKE\'S, DELIBERATELY — same ring, same '
    + 'spin, same solved 0.602522 that lands its underside on y = 0 where the feet would '
    + 'have been. It is the kit\'s answer to having no legs, not a thing any of the three '
    + 'animals chose, and giving this one a different transform to look original would put an '
    + 'unproven number where a proven one works. WHERE IT SEPARATES IS THE MARKING: the slow '
    + 'worm, the corn snake and the eel all carry a RIDGE and this is the only smooth-backed '
    + 'snake in the project — twelve flat plate-10 blotches that cost no silhouette at all. A '
    + 'python\'s real pattern is a net of joined dark shapes and twelve separate cards are a '
    + 'coarse reading of it; colour is a texture lookup with no positional information, so '
    + 'that is as fine as it gets. NEW PALETTE, UNREVIEWED.',
})
