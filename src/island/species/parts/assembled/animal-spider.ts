/**
 * The spider — eight legs, and the count is the animal.
 *
 * **THIS IS THE MOST LEGS ANY SPECIES IN THIS PROJECT CARRIED UNTIL THE
 * CENTIPEDE**, and it is the whole design. A child tells a spider from an insect
 * by counting, so the legs are spent on and everything else is spent down.
 *
 * **THE LEG IS `box-18`, NOT `box-01`.** The bank holds exactly ONE leg shape —
 * `box-01`, 0.375 x 0.306 x 0.375, taper 1.000, a stub used 86 times — and eight
 * stubs under a cube is a woodlouse. `box-18` is the elephant's trunk under the
 * bank's own name-for-what-it-is: 0.345 across and **0.623 long**, the longest
 * narrow shape the bank has. Eight of them hang straight down at four z stations
 * on the hull's own bottom plane, and at 0.4984 of clear reach apiece they lift
 * the body to 1.8022 — a spider standing high on long legs. That is §14's "no
 * segmented leg" being true and not being what stops the animal.
 *
 * **THEY ARE NOT SPLAYED, AND TWO SEPARATE THINGS SAY SO.** The first is §8 step
 * 1 and it is the real one: `box-03`'s flat bottom face is only **0.625 square**
 * — |x| <= 0.3125 — so a leg any further out is over the chamfer and floating,
 * and the only honest way to angle one outward is to join the chamfer itself,
 * which needs a `z` spin. The second is a harness finding worth writing down: a
 * z-spin of `box-18` fails `assembly-assert.ts`'s *"is a copy of box-18"* while
 * PASSING its rigid fingerprint, because the check un-spins the mesh and sorts
 * both point sets on x first, and `box-18` has many vertices sharing an exact x
 * that a rotation perturbs in the sixteenth decimal. The geometry is right and
 * the comparison is order-fragile. Small cards and `cone-01` (the hedgehog's
 * chamfer rows) do not trip it; a 42-point part does.
 *
 * **THE ABDOMEN IS A RING, NOT A SECOND MASS.** A spider is two lumps joined at
 * a waist and rule 3 allows one — the same wall `animal-ant.ts` hits. `box-35`,
 * the panda's rump shell, is the bank's only REAR-worn band (`z -1`), so a
 * single thinned copy on the back face is the pedicel line and the rear of the
 * animal reads as separate without being separate.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own bottom face — `HULL_BOTTOM_Y`, where every leg row starts. */
const BOTTOM_Y = 0.18125

/**
 * `box-35` is halved in thickness, and rule 3 is the reason.
 *
 * At its own 0.4975 the hoop is 1.343 x 1.343 x 0.4975 = **0.8978 against the
 * hull's 1.9531, a ratio of 2.175** — under the 3 `assertAssembly` demands,
 * because a hoop's bounding box is mostly hole. This is `animal-tortoise.ts`'s
 * own halving, which `animal-firefly.ts` and `animal-goldfish.ts` also reuse
 * rather than re-derive.
 */
const BAND_THIN = 0.5

/**
 * The four leg stations along z, on the pack's own 1/16 grid.
 *
 * `LEG_OUT` is 0.3125, which is not a taste: §8 step 1 measures `box-03`'s flat
 * bottom face at 0.625 square, so that is the furthest out a leg can be joined
 * and still be embedded (§3, nothing floats).
 */
const LEG_OUT = 0.3125
const LEG_Z = [0.3125, 0.125, -0.125, -0.3125] as const

export const SPIDER_ASSEMBLY = defineCreature('animal-spider', {
  /* NEW AND UNREVIEWED — the first spider ever built here. Brief §19 is
   * "bright, never scary" and a spider is the species in this collection where
   * that bites hardest: a warm sandy garden spider, not a black one, and no
   * fangs anywhere. */
  palette: {
    coat: 0xb08a5a,   // UNREVIEWED: a warm sandy brown, deliberately not black
    belly: 0xf0e2c8,  // UNREVIEWED: the pale underside, and the sclera
    mark: 0x6d5030,   // UNREVIEWED: the abdomen ring and the legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* No `box-01` row at all — see the header. The eight limbs below are the legs. */
  legs: false,

  /* The caterpillar's own card, the smallest in the pack. A garden spider's
   * eyes are eight small dark points and small is the honest reading. */
  eyes: { part: 'plate-06', x: 0.2, y: 0.98 },

  extras: [
    /* THE EIGHT LEGS. Four mirrored pairs on the hull's own bottom plane at the
     * outermost station that flat face allows, hanging on `box-18`'s length with
     * its `y -1` base facing. The model is re-grounded on whatever is lowest
     * (`buildAssembly` ends on `group.position.y = -box.min.y`), so the body
     * rides up on the legs rather than the legs reaching down to it. */
    ...LEG_Z.map((z, i) => ({
      name: `limb-${i}`,
      part: 'box-18',
      paint: 'mark',
      kind: 'pair' as const,
      axis: 'y' as const,
      dir: -1 as const,
      /* A quarter of its own 0.623, which buries 0.1558 — clear of §3's
       * measured 0.125 floor, where 0.2 would have sat 0.0004 under it. */
      sink: 0.25,
      at: [LEG_OUT, BOTTOM_Y, z] as [number, number, number],
    })),
    /* THE PEDICEL LINE. The panda's rear band, halved, on the back face at its
     * own measured burial — the rear of the animal reading as an abdomen
     * without becoming a second mass. */
    { name: 'abdomen', part: 'box-35', paint: 'mark', stretch: [1, 1, BAND_THIN] },
    /* A SECOND PAIR OF EYES, higher and wider than the first. Eight is not
     * sayable; four is nearer than two and costs 50 triangles. */
    { name: 'ocellus', part: 'plate-06', paint: { base: 'belly', byBand: { 15: 'pupil' } }, kind: 'pair', at: [0.33, 1.09, 0.635] },
  ],

  flag: 'THE LEGS ARE NOT SEGMENTED AND A SPIDER\'S ARE THE ANIMAL. `docs/how-the-animals-'
    + 'are-made.md` §14 says Critters wants "a segmented leg" and on this species that half '
    + 'of the sentence is TRUE: the bank holds exactly one leg shape, `box-01`, a 0.375 '
    + 'taper-1.000 stub used 86 times, and no jointed limb of any kind in its other 99 '
    + 'records. What is here instead is `box-18`, the longest narrow shape the bank has at '
    + '0.623, hung straight down — one straight length where a spider has three, and no '
    + 'splay either, because `box-03`\'s flat bottom face is 0.625 square so a leg further '
    + 'out than 0.3125 floats over the chamfer. What would fix it is one shape: a limb with '
    + 'a knee, which is a commission and would also finish `animal-grasshopper` and '
    + '`animal-mantis` in this same collection. ALSO: FOUR EYES, NOT '
    + 'EIGHT. Every eye is an absolute-size card at an absolute z (rule 5, unsayable), so '
    + 'eight of them do not fit across a 1.250 face without overlapping. ALSO: THE ABDOMEN '
    + 'IS A RING, NOT A LUMP — rule 3 allows one mass, so a spider\'s two-part body is drawn '
    + 'rather than built. ALSO: NEW PALETTE, UNREVIEWED, and deliberately sandy rather than '
    + 'black because brief §19 is "bright, never scary" and this is the species that tests '
    + 'it.',
})
