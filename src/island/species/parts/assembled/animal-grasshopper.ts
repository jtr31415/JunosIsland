/**
 * The grasshopper — and the whole animal is one shape placed where nobody drew
 * it.
 *
 * A child reads a grasshopper off ONE thing: the raised hind femur, folded up
 * above the body like a drawn bow. **That is `box-06`/`box-07`, THE BUNNY'S
 * EARS** — 0.482 x 0.913 x 0.306, a handed pair, taper 0.849, the biggest ear
 * in the pack and the longest broad shape on it. Tilted 35 degrees back off the
 * rear flank it is a jumping leg, and that is §3.1 exactly: *a part's identity
 * comes from where it is placed, not from what Kenney called it*. Nineteen
 * species in this repo already wear it as an ear; this is the first that does
 * not.
 *
 * **SIX LIMBS, AND FOUR OF THEM ARE THE PACK'S OWN ROW.** The four walking legs
 * are `box-01` on the standard row, pulled forward to z = +0.3125 and +0.0625 so
 * the femora own the back half. That is a grasshopper's actual arrangement — two
 * pairs forward, one enormous pair behind — and it means this species does not
 * need the sixth-leg extra the rest of the collection carries.
 *
 * The tegmina are `wedge-19`, the chick's and the parrot's real wing, laid flat
 * over the back and swept back: a grasshopper at rest roofs its forewings over
 * its abdomen and its hindwings are folded away underneath, so one visible pair
 * is the correct count rather than a shortfall.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own top face — its centre 0.80625 plus its own half-height. */
const TOP_Y = 1.43125
const LEG_Y = 0.18125

/** §3's 0.125 floor over a 0.200-thick wing. See `animal-butterfly.ts`. */
const WING_SINK = 0.625

export const GRASSHOPPER_ASSEMBLY = defineCreature('animal-grasshopper', {
  /* NEW AND UNREVIEWED — the first grasshopper ever built here. Brief §19 is
   * "bright, never scary": a fresh meadow green, which is also the one colour
   * that separates it from the mantis further down this collection. */
  palette: {
    coat: 0x7fa93f,   // UNREVIEWED: a fresh meadow green
    belly: 0xe4e9b8,  // UNREVIEWED: the pale underside, and the sclera
    limb: 0x5c8129,   // UNREVIEWED: the legs and the great hind femora
    wing: 0xa8bd6a,   // UNREVIEWED: the tegmina, a shade over the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.375,

  /* Both walking pairs pulled FORWARD, so the back half of the animal belongs
   * to the femora. z = +5/16 and +1/16 on the pack's own grid. */
  legs: { x: 0.27, z: 0.3125 },

  /* The round card five donors share. A grasshopper's eyes are round and set
   * high on a long face. */
  eyes: { part: 'plate-08', y: 1.0 },

  /* The bee's and the caterpillar's own antenna. A grasshopper's are short —
   * that is what tells it from a cricket — so the transfer is left alone. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE HIND FEMUR. The bunny's own ear, tilted 35 degrees back off the upper
     * rear flank at its own measured 0.366 burial. A diagonal facing has no hull
     * face to solve against, so the join point is stated. */
    {
      name: 'femur',
      part: 'box-06',
      paint: 'limb',
      kind: 'pair',
      spin: [{ axis: 'x', deg: -35 }],
      at: [0.42, 1.20, -0.25],
    },
    /* THE TEGMINA, roofed over the abdomen. One visible pair is what a resting
     * grasshopper has; the hindwings are folded away underneath. Already flat
     * (0.200 thin in y), so `axis`/`dir` re-point the facing rather than a spin
     * turning the blade on edge. */
    { name: 'wing', part: 'wedge-19', paint: 'wing', kind: 'pair', axis: 'y', dir: 1, sink: WING_SINK, at: [0.28, TOP_Y, -0.15] },
    /* The second walking pair, forward with the first. */
    { name: 'leg-fore', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, LEG_Y, 0.0625] },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, 0.635] },
  ],

  flag: 'THE FEMUR IS ONE STRAIGHT LENGTH AND A GRASSHOPPER\'S LEG IS A HINGE — femur up, '
    + 'tibia back down to the ground, which is the shape of the drawn bow the whole animal '
    + 'reads as. `docs/how-the-animals-are-made.md` §14 wants "a segmented leg" for this '
    + 'collection and here that half of the sentence is TRUE: the bank\'s 100 records hold '
    + 'one leg shape, `box-01`, a 0.375 taper-1.000 stub, and nothing with a joint. So the '
    + 'femur is the bunny\'s ear at 35 degrees and the tibia is simply absent. `on` could '
    + 'chain a second shape off the femur\'s TIP, which is a spear rather than a knee. What '
    + 'would fix it is one commissioned shape — a limb with a bend — and it would also '
    + 'finish `animal-spider` and `animal-mantis`. ALSO: NEW PALETTE, UNREVIEWED, and the '
    + 'green is deliberately the LIGHTER of the two greens in this collection, because the '
    + 'mantis is the darker one and they must not be one animal.',
})
