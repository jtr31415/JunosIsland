/**
 * **PLACEHOLDER. A stick insect is nothing but elongation, and elongation is the
 * one thing this route cannot express.** Measured, not assumed: the pack drew
 * TEN hull shells and every one of them is within 0.90 to 1.23 of cubic —
 * 1.125 to 1.5395 on the long axis — and `HullDef.stretch` is `never`, which is
 * your own ruling given twice and quoted in `hulls.ts`. A real *Carausius* is
 * fifteen to twenty times its own width, with legs as long again. There is no
 * arrangement of 100 straight shapes that gets a cube to that.
 *
 * **What is here instead** is the nearest honest thing the bank has: a plain
 * twig-brown body with the longest chain it can make behind it — two `box-18`
 * links, 0.345 across and 0.85 of reach, joined by `PartDef.on` off the first
 * one's own built outer face — plus six legs and long `cone-01` antennae. It is
 * a brown insect. It is not a stick.
 *
 * **What I would try first.** Not a new part: this one is a RULING rather than a
 * commission. `Hull.stretch` was made `never` on 2 August after *"the body/cube
 * should always be the standard size, its often bigger"*, and it is the right
 * rule for 295 of the 296 — but it also makes the worm, the centipede and this
 * animal unbuildable by construction. The cheapest fix is a single elongated
 * hull SHAPE authored once (`primitiveStretched` already re-cuts the pack's own
 * 0.25 chamfer at any size), which needs no dial and no exception: it would be
 * the eleventh shell, and three species in this collection would take it.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre and rear face. */
const HULL_MID_Y = 0.80625
const REAR_Z = -0.625

export const STICK_INSECT_ASSEMBLY = defineCreature('animal-stick-insect', {
  /* NEW AND UNREVIEWED — the first stick insect ever built here. Brief §19 is
   * "bright, never scary": a pale twig brown with a green cast, which is what a
   * pet Indian stick insect looks like. */
  palette: {
    coat: 0x8f8351,   // UNREVIEWED: a pale twig brown with a green cast
    belly: 0xdad2a6,  // UNREVIEWED: the pale underside, and the sclera
    limb: 0x74683e,   // UNREVIEWED: legs and antennae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  legs: { x: 0.27, z: 0.3125 },

  /* The caterpillar's own card, the smallest in the pack. A stick insect's eyes
   * are small and dark and it does nothing with them. */
  eyes: { part: 'plate-06', y: 0.92 },

  /* The bee's and the caterpillar's own antenna, by pure donor transfer. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE ABDOMEN, TWO LINKS — the longest narrow thing this bank can make, and
     * the whole of what stands in for a body fifteen times its own width.
     * `animal-dragonfly.ts` established the chain and this reuses it. */
    { name: 'abdomen', part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, REAR_Z] },
    { name: 'abdomen-tip', part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], on: 'abdomen' },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, 0.18125, 0] },
  ],

  flag: 'PLACEHOLDER — A STICK INSECT IS ELONGATION AND NOTHING ELSE, AND ELONGATION IS '
    + 'UNSAYABLE. Measured: the pack\'s ten hulls run 1.125 to 1.5395 on their long axis and '
    + 'every one is within 0.90-1.23 of cubic, and `HullDef.stretch` is `never` — your own '
    + 'ruling, twice ("the body/cube should always be the standard size, its often '
    + 'bigger"). A stick insect is fifteen to twenty times its own width. What is here is a '
    + 'twig-brown insect with the longest chain the bank can make behind it (two `box-18`, '
    + '0.345 across, 0.85 of reach) and six legs. It reads as a beetle. WHAT WOULD FIX IT '
    + 'is NOT a new dial and not an exception to your ruling — it is ONE MORE HULL SHAPE, '
    + 'authored long once, taking its place beside the pack\'s ten. `primitiveStretched` '
    + 'already re-cuts the pack\'s own 0.25 chamfer at any size, so the machinery exists; '
    + 'what does not exist is a ruling, because `authored.ts` §1 scopes authoring to the '
    + 'three base shapes you named. THREE species in this collection would take that shell '
    + 'the day it landed: this one, `animal-worm` and `animal-centipede`. ALSO: THE LEGS '
    + 'ARE 0.375 STUBS where a stick insect\'s are longer than its body — the same missing '
    + 'hinged limb `animal-spider`, `animal-grasshopper` and `animal-mantis` each name. '
    + 'ALSO: NEW PALETTE, UNREVIEWED.',
})
