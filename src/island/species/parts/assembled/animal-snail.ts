/**
 * **PLACEHOLDER. The shell is not a spiral, because there is no curve anywhere
 * in the parts bank — all 100 shapes are straight or tapered along a single
 * axis, and rule 4 as amended bakes a ROTATION into a copy's vertices, which
 * turns a part and cannot bend one.** What stands in for it is `box-19`, the
 * fish's body-shell overlay, a radial hoop 1.404 across, thinned to half and
 * carried high on the back: a FLAT DISC seen edge-on where a snail has a fat
 * conical coil. What I would try first is the same commission
 * `animal-seahorse.ts` and `collections/birds.ts`'s flamingo already ask for —
 * ONE curved or coiled shape, authored once — and it would finish three species
 * across three collections rather than this one.
 *
 * Everything else here is real and is worth keeping when the shell is replaced:
 *
 *   - **The eye stalks are `cone-01`, the bee's own antenna, worn TWICE** — an
 *     upper pair on the crown carrying the eyes and a shorter lower pair on the
 *     face, which is a pulmonate snail's actual arrangement and is the second
 *     thing a child names one by.
 *   - **The foot is `box-04` LAID FLAT**, which is `animal-slow-worm.ts`'s own
 *     idiom: its `x +1` ring turned a quarter about x so it lies in the ground
 *     plane, giving the sole a snail creeps on.
 *   - `legs: false`, and it pays the legless height toll.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The shell is halved in thickness and the foot thinned to 0.35, both for rule 3.
 *
 * `box-19` at its own 0.520 is 1.404 x 1.404 x 0.520 = **1.0251 against the
 * hull's 1.9531, a ratio of 1.91** — well under the 3 `assertAssembly` wants,
 * because a hoop's bounding box is mostly hole. Halved it is 0.5126 and the
 * ratio is 3.81. `box-04` laid flat at 0.35 is 1.335 x 0.160 x 1.335 = 0.2852
 * and the ratio is 6.8.
 */
const SHELL_THIN = 0.5
const FOOT_THIN = 0.35

export const SNAIL_ASSEMBLY = defineCreature('animal-snail', {
  /* NEW AND UNREVIEWED — the first snail ever built here. Brief §19 is "bright,
   * never scary": a pale putty body under a banded amber shell. */
  palette: {
    coat: 0xcbb79b,   // UNREVIEWED: the body, a pale putty grey
    belly: 0xece2d2,  // UNREVIEWED: the sole and the sclera
    shell: 0xb1762f,  // UNREVIEWED: THE SHELL — a warm banded amber
    limb: 0xb2a086,   // UNREVIEWED: the four tentacles
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.375,

  legs: false,

  /* The caterpillar's own card, the smallest in the pack. A snail's eyes are
   * two dark points on stalk tips and small is the honest reading — see the
   * flag for why they cannot actually be ON the stalks. */
  eyes: { part: 'plate-06', x: 0.18, y: 1.02 },

  /* THE UPPER TENTACLES. The bee's own antenna by pure donor transfer onto this
   * hull's top face, which recovers the bank's recorded (0.227581, 1.506428,
   * 0.469709) without ever using it. */
  ears: { part: 'cone-01', name: 'tentacle-upper', paint: 'limb' },

  extras: [
    /* THE SHELL — and this is the part that makes the species a placeholder.
     * See the header and the flag. Carried high and slightly back, halved in
     * thickness, centred by `sink: 0.5` rather than joined to a face. */
    { name: 'shell', part: 'box-19', paint: 'shell', stretch: [1, 1, SHELL_THIN], sink: 0.5, at: [0, 1.02, -0.125] },
    /* THE LOWER TENTACLES, shorter and on the face — a quarter turn about x
     * takes `cone-01`'s `y +1` facing to `z +1` so the pair points forward. */
    { name: 'tentacle-lower', part: 'cone-01', paint: 'limb', kind: 'pair', spin: [{ axis: 'x', deg: 90 }], at: [0.18, 0.72, 0.625] },
    /* THE FOOT. `box-04` laid flat into the ground plane — `animal-slow-worm.ts`'s
     * own rotation, reused rather than re-derived. */
    { name: 'foot', part: 'box-04', paint: 'belly', stretch: [1, 1, FOOT_THIN], spin: [{ axis: 'x', deg: 90 }], axis: 'z', dir: 1, sink: 0.5, at: [0, 0.24, 0] },
  ],

  flag: 'PLACEHOLDER — THE SHELL IS NOT A SPIRAL AND A SNAIL IS ITS SHELL. Measured, not '
    + 'assumed: all 100 records in `PARTS_BANK` are straight or tapered along ONE axis and '
    + 'not one of them curves, and rule 4 as amended bakes a rotation into a copy\'s '
    + 'vertices — it turns a part and cannot bend one. So what is on the back is `box-19`, '
    + 'the fish\'s shell-ring, halved and stood on edge: a flat disc 1.404 across where a '
    + 'snail has a fat conical coil. WHAT WOULD FIX IT is one authored shape — a coil, or '
    + 'even a plain dome — and it is the SAME commission `animal-seahorse.ts` names for an '
    + 'S-curve and `collections/birds.ts` names for a flamingo\'s downcurved bill, so one '
    + 'part finishes three species in three collections. `authored.ts` §1 is explicit that '
    + 'the three base shapes were scoped PRIMITIVES ONLY and anything else is a fresh '
    + 'ruling, which is why nothing was authored here. EVERYTHING ELSE ON THIS ANIMAL IS '
    + 'REAL and should survive the fix: four `cone-01` tentacles in two pairs, and a flat '
    + '`box-04` sole. ALSO: THE EYES ARE ON THE FACE AND NOT ON THE STALK TIPS. An eye card '
    + 'is pinned to the absolute z = 0.6350 with no `z` field at all — rule 5, made '
    + 'unsayable in `creature.ts` — so it cannot travel out to a tentacle tip. ALSO: AT 282 '
    + 'VERTICES IT IS UNDER THE PACK\'S 405 FLOOR, which is a norm that reports (your ruling '
    + 'of 3 August) and is what a legless animal costs; `animal-goldfish` ships at 342. '
    + 'ALSO: NEW PALETTE, UNREVIEWED.',
})
