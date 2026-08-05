/**
 * The moth — the butterfly's twin, and every difference between them is real.
 *
 * These two are the same insect to a five-year-old, so the separation is made on
 * four measured axes and no palette is asked to carry it alone:
 *
 *   |  | butterfly | moth |
 *   |---|---|---|
 *   | hull | `box-03`, the 1.250 cube | **`box-12`, the cow's WIDER shell (1.5395)** |
 *   | wings | four, two shapes, spread | **two, one shape, roofed back** |
 *   | antennae | `cone-01`, a fine point | **`cone-04`/`cone-05`, the hog's ear — broad and plumed** |
 *   | eyes | `plate-08`, round 0.400 | **`plate-14`, the panda's — the BIGGEST in the pack** |
 *
 * **The cat's `plate-04` was the obvious card here and it is unusable.** It is
 * the pack's only eye drawn for an animal awake at night, and measured off its
 * own `bands` field **every one of its triangles is band 15** — it is all pupil
 * and has no sclera at all. `assembly-assert.ts` requires an eye card to read
 * TWO palette slots, so `plate-04`/`plate-05` fail the harness on any species.
 * That is a fact about the bank rather than about this animal and it is recorded
 * here because nothing else had found it.
 *
 * **TWO WINGS IS THE CORRECT COUNT, not a shortfall.** A moth at rest holds its
 * forewings roofed over its back with the hindwings folded away completely
 * underneath, which is the pose it is in whenever a child sees one on a wall.
 * The butterfly beside it shows four because a butterfly at rest holds them out.
 *
 * The hull is the only WIDER shell the pack drew (the cow's and the deer's), and
 * a moth being broad and heavy-bodied where a butterfly is narrow is the
 * difference a silhouette carries at tablet distance.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own top face — the same 1.43125 nine of the pack's ten hulls share. */
const TOP_Y = 1.43125

/** §3's 0.125 floor over a 0.200-thick wing. See `animal-butterfly.ts`. */
const WING_SINK = 0.625

export const MOTH_ASSEMBLY = defineCreature('animal-moth', {
  /* NEW AND UNREVIEWED — the first moth ever built here. Brief §19 is "bright,
   * never scary", so a warm dusty fawn with a cream collar rather than the
   * greys a moth is usually drawn in. */
  palette: {
    coat: 0x9a7c5c,   // UNREVIEWED: the furry thorax and abdomen, a dusty fawn
    belly: 0xf2e8d4,  // UNREVIEWED: the pale underside, and the sclera
    wing: 0xb69a76,   // UNREVIEWED: the roofed forewings, a shade over the coat
    mark: 0x5f4a34,   // UNREVIEWED: the wing band, and the antennae
    limb: 0x6f5942,   // UNREVIEWED: the legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cow's and the deer's shell — the only WIDER hull the pack drew, and the
   * one axis on which a moth is not a butterfly. */
  hull: 'box-12',

  /* A moth's pale part runs higher than a beetle's: the whole underside and the
   * lower flanks. 9/16 is the nearest notch above the 0.4808-0.5481 zone §7
   * measured for the pack's own mammals. */
  belly: 0.5625,

  legs: { z: 0.3125 },

  /* THE BIGGEST CARD IN THE PACK — the panda's, 0.435 x 0.443 against the
   * butterfly's round 0.400. A moth flies in the dark and rule 5 keeps the size
   * absolute, so "biggest in the pack" is a claim rather than a scale. The
   * cat's `plate-04` was the first choice and is unusable; see the header. */
  eyes: { part: 'plate-14' },

  /* THE HOG'S OWN EAR as a plumed antenna. Taper 0.249, 0.403 x 0.296 x 0.406,
   * a handed pair — broad and feathered against the butterfly's fine `cone-01`
   * point, which is the single loudest difference between the two silhouettes. */
  ears: { part: 'cone-04', name: 'antenna', paint: 'mark' },

  extras: [
    /* THE FOREWINGS, roofed back over the abdomen. `blade-06`, the bee's own
     * membranous wing — the same shape the butterfly wears in front, worn here
     * as the only pair. Already flat, so the facing is re-pointed rather than
     * the geometry turned. */
    { name: 'wing', part: 'blade-06', paint: { base: 'wing', byBand: { 15: 'mark' } }, kind: 'pair', sink: WING_SINK, at: [0.44, TOP_Y, -0.0625] },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'mark', at: [0, 0.686849, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.3325, 0.18125, 0] },
  ],

  flag: 'THE WING PATTERN IS THE MOTH and all this build can say is one band, off '
    + '`blade-06`\'s own band 15. A moth is camouflage — bark, lichen, a dead leaf — and '
    + '`Paint.patch` takes ONE number which is a HEIGHT, so it paints a level boundary and '
    + 'nothing that could be a mottle, a stripe across the wing or an eye spot; `byBand` '
    + 'cuts only where Kenney already cut. That is the same wall `animal-butterfly.ts` '
    + 'reports and it costs this species more, because a butterfly is at least a bright '
    + 'colour and a moth is a pattern. ALSO: TWO WINGS AND NOT FOUR is deliberate and is '
    + 'the resting pose — say so if it reads as half a butterfly rather than as a moth. '
    + 'ALSO: SIX LEGS, see the collection header. ALSO: NEW PALETTE, UNREVIEWED.',
})
