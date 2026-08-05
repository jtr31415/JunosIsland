/**
 * The butterfly — and the species that proves this collection was never blocked.
 *
 * `docs/how-the-animals-are-made.md` §14 says Critters "cannot be built from
 * these parts at all — no membranous insect wing, no segmented leg." **The first
 * half is false and this animal is the proof.** `blade-06`/`blade-07` are in
 * `PARTS_BANK` with `roles: ["wing"]` and provenance `bee:wing-left` FIRST — the
 * pack's own bee's wing, which is a true membranous insect wing, baked on 4
 * August for the budgie. Three species wear it today (ray, turtle, whale) and
 * all three call it the penguin's flipper, because the two are bit-identical and
 * Ocean got there first. This is the first time it is worn as what it was drawn
 * as.
 *
 * **Four wings out of TWO real wing shapes, and no stretch on either.** The
 * forewing is `blade-06` (0.693 x 0.200 x 0.600, taper 1.000 — broad and
 * untapered) and the hindwing is `wedge-19` (0.573 x 0.200 x 0.600, taper 0.594
 * — smaller and tapered), which is the fore/hind relationship a butterfly
 * actually has, arrived at by taking two shapes Kenney drew rather than by
 * scaling one. `wedge-19` attaches `x +1`, so a quarter turn about z lays it in
 * the same plane as the forewing.
 *
 * Six legs: see the collection header. `withDefaultFlap` gives all four wings a
 * wingbeat with no `motion` line, because the bank knows they are wings.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s top face: its own centre 0.80625 plus its own half-height. */
const HULL_TOP_Y = 1.43125

/** Three leg pairs at +/-5/16 and 0 — the pack's own 1/16 grid. See the header. */
const LEG_X = 0.27
const LEG_Y = 0.18125

/**
 * Every wing in this collection is sunk 0.625 of itself, and the number is
 * forced rather than chosen.
 *
 * All six wing shapes in the bank are **0.200 thick**, and §3's measured floor
 * — "every eared species embeds its ear by at least 0.125" — is an ABSOLUTE
 * distance. 0.125 / 0.200 = 0.625, so that is the shallowest a wing can be worn
 * and still meet the pack's own minimum. A wing shows its plan area rather than
 * its thickness, so burying five eighths of 0.2 costs the read nothing.
 */
const WING_SINK = 0.625

export const BUTTERFLY_ASSEMBLY = defineCreature('animal-butterfly', {
  /* NEW AND UNREVIEWED — the first butterfly ever built here and the first
   * colours ever proposed for it. Brief §19 is "bright, never scary", and a
   * butterfly is the one animal in this collection where bright IS the animal. */
  palette: {
    coat: 0x4a3a2e,   // UNREVIEWED: the body, a quiet dark brown under the wings
    belly: 0xf0e4cd,  // UNREVIEWED: the pale underside, and the sclera
    wing: 0xef8f3c,   // UNREVIEWED: THE ANIMAL — a warm orange upper wing
    mark: 0x2e2419,   // UNREVIEWED: the wing border, near-black
    limb: 0x6b5540,   // UNREVIEWED: legs and antennae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.375,

  /* Three pairs at z = +/-5/16 and 0. */
  legs: { x: LEG_X, z: 0.3125 },

  /* Round compound eyes — the chick's, the fish's, the monkey's, the parrot's
   * and the penguin's shared 0.400 circle, at the card's own recorded height. */
  eyes: { part: 'plate-08' },

  /* The bee's and the caterpillar's own antenna, taper 0.000, a true point, by
   * pure donor transfer onto this hull's own top face. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE FOREWING. `blade-06`, the bee's own wing — the pack's membranous
     * insect wing, worn for the first time as one. Laid flat over the back at
     * its own attachment (`y +1`) and pulled out to x = 0.42 so the pair spans
     * 1.53, inside the collection's 1.6 ceiling. */
    {
      name: 'wing-fore',
      part: 'blade-06',
      paint: { base: 'wing', byBand: { 15: 'mark' } },
      kind: 'pair',
      sink: WING_SINK,
      at: [0.42, HULL_TOP_Y, 0.1875],
    },
    /* THE HINDWING. `wedge-19`, the chick's and the parrot's — smaller and
     * tapered where the forewing is broad and square, which is the fore/hind
     * relationship without a single scaled copy. It is ALREADY flat (0.200 thin
     * in y); only its FACING is wrong, so `axis`/`dir` re-point it upward rather
     * than a spin turning the geometry on edge. */
    {
      name: 'wing-hind',
      part: 'wedge-19',
      paint: { base: 'wing', byBand: { 15: 'mark' } },
      kind: 'pair',
      axis: 'y',
      dir: 1,
      sink: WING_SINK,
      at: [0.38, HULL_TOP_Y, -0.25],
    },
    /* The mouth: the bee's, the caterpillar's, the fish's and the monkey's own
     * flat face card, at the height the bank recorded it. */
    {
      name: 'mouth',
      part: 'plate-03',
      paint: 'pupil',
      at: [0, 0.686849, 0.635],
    },
    /* The sixth leg. See the collection header for why this collection counts. */
    {
      name: 'leg-mid',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: 0.408163,
      at: [LEG_X, LEG_Y, 0],
    },
  ],

  flag: 'THE PROBOSCIS CANNOT BE SAID and on a butterfly it is the one organ that is not '
    + 'a wing: a coiled feeding tube under the head. Rule 4 as amended bakes a ROTATION '
    + 'into a copy\'s vertices — it turns a part and cannot bend one — and there is no '
    + 'curved shape in any of the bank\'s 100 records, which is the same wall the seahorse '
    + 'and the flamingo\'s bill each hit. ALSO: THE WING PATTERN. A butterfly is its '
    + 'pattern and all this build can say is a border, from `blade-06`\'s own band 15; '
    + '`Paint.patch` takes one number and that number is a HEIGHT, so it cannot draw an eye '
    + 'spot or a vein anywhere. ALSO: SIX LEGS, which is a departure from `animal-firefly` '
    + 'and `animal-glow-worm`, both of which argue four is the pack\'s own answer for an '
    + 'insect — the collection header says why this collection overrides them. ALSO: NEW '
    + 'PALETTE, UNREVIEWED.',
})
