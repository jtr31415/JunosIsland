/**
 * The quokka — the small round-faced one, and the collection's cheapest animal.
 *
 * A quokka is a macropod and it hops, and this build does not say so — see the
 * kangaroo's file for why a hopping stance is unsayable here. It gets away with
 * it where the kangaroo cannot: a quokka is small, squat and sits on its
 * haunches most of the time, so a four-legged round animal is very close to what
 * it looks like anyway. That is luck rather than method and it is worth saying.
 *
 * What carries it is the FACE, which is the one thing a child is told about a
 * quokka:
 *
 *   - **`box-02`, the beaver's and polar bear's ear** — small, round, radial and
 *     buried its own 0.778, which is a short ear on a round head. It is what
 *     holds this animal apart from `animal-bilby` and the frozen `animal-bunny`,
 *     both of which wear `box-06` at 0.913 — a 3.9x gap in ear height.
 *   - **`tube-01`, the beaver's muzzle and the SMALLEST in the bank** (0.312 x
 *     0.193). `animal-fennec-fox.ts` reached for it for the same reason: the
 *     hull is the standard cube and always will be, so a small face is the only
 *     way an animal can say it is small.
 *   - **`wedge-07`, the cat's rope**, at the opossum's own station on the flat
 *     rear face. A quokka's tail is a thin bare rope and this is the bank's
 *     thinnest long one.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The lowest 1/16 notch that keeps the whole root of `wedge-07` on the cube's
 * flat rear face — `animal-opossum.ts`'s own solve, transferred unchanged. The
 * flat face runs 0.4938 to 1.1187 and the rope's half-height is 0.2775.
 */
const TAIL_Y = 0.8125

export const QUOKKA_ASSEMBLY = defineCreature('animal-quokka', {
  palette: {
    coat: 0x9c7a52,    // UNREVIEWED: the coarse grizzled brown
    belly: 0xd8c3a4,   // UNREVIEWED: the pale cheek and underside, and the sclera
    nose: 0x4b3b30,    // UNREVIEWED: the small dark nose
    limb: 0x7e6242,    // UNREVIEWED: the short legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* Short and close: a quokka is a compact animal and the stance says so. */
  legs: { x: 0.3125, z: 0.28125 },

  /* Small, round and deeply set. The separation from every long-eared animal in
   * this collection, and it is a 3.9x gap rather than a taste. */
  ears: { part: 'box-02', paint: 'coat' },

  /* The smallest muzzle in the bank, on the standard cube. */
  snout: 'tube-01',

  /* The bunny's nose-tip on the muzzle's own placed front plane. */
  nose: { part: 'box-09', paint: 'nose', on: 'snout' },

  /* The cat's rope, bare rather than furred, at the opossum's own station. */
  tail: { part: 'wedge-07', paint: 'limb', at: [0, TAIL_Y, -0.625] },

  flag: 'NEW PALETTE, UNREVIEWED — the first quokka ever built. THE HOP IS NOT HERE AND IT '
    + 'IS NOT MISSING BY ACCIDENT: a quokka is a macropod, the bank has one leg shape at one '
    + 'absolute height, and a hull carries no rotation, so no macropod in this collection '
    + 'stands the way it really does — animal-kangaroo.ts prices that in full. This species '
    + 'gets away with it and the kangaroo does not, because a quokka is small and squats, so '
    + 'a round four-legged animal is close to the truth. If it reads as a rodent to you, the '
    + 'thing that would fix it is a long hind leg, which is a commission.',
})
