/**
 * The echidna — the hedgehog's five rows of spines, on a long-beaked animal.
 *
 * This is the third species in the project to spend `cone-01` as a spine, and
 * §3.1 is the reason that is allowed: the bank has exactly ONE shape that puts a
 * point on a body — `cone-01`, taper 0, one of only two true points in all 100
 * records — so the separation between spiny animals is PLACEMENT, and here it is
 * two structural things:
 *
 *   - **ALL FIVE ROWS at count 3, on `box-31`.** `animal-hedgehog.ts` takes all
 *     three row kinds at count 4 (twenty copies, and it declares RULE 9 for it);
 *     `animal-porcupine.ts` takes `top` and `chamfer` only, so it is spiny from
 *     above and bare on the flanks. An echidna is spined on every surface but
 *     SPARSELY and on a low body, so it takes all three rows at three a row —
 *     fifteen copies, 510 triangles, which is what keeps the whole animal at 835
 *     against rule 9's 951 with no declaration needed.
 *   - **THE BEAK, which neither of them has.** `tube-03`, the deer's muzzle,
 *     0.532 of forward reach at a recorded burial of ZERO, so every millimetre
 *     of it stands clear of the face. The hedgehog wears `cone-06`, a true point
 *     that tapers away, and the porcupine wears `box-08`, a blunt rodent muzzle
 *     that does not stand out at all. An echidna's beak is a straight rigid tube
 *     and this is the only shape in the bank that is one at that length.
 *
 * **`box-31`, the lion's shallow shell** — 1.125 deep against the cube's 1.250,
 * and the lowest hull in the bank that still stands on legs. An echidna is a low
 * animal and depth is the axis a child reads that on from the side.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const ECHIDNA_ASSEMBLY = defineCreature('animal-echidna', {
  palette: {
    coat: 0x4a3c30,    // UNREVIEWED: the dark fur between the spines
    belly: 0x8a7660,   // UNREVIEWED: the paler underside, and the sclera
    spine: 0xd9b874,   // UNREVIEWED: the straw-yellow quills with dark tips
    beak: 0x38302a,    // UNREVIEWED: the bare dark beak
    limb: 0x584839,    // UNREVIEWED: the short digging legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallow shell — 1.125 deep, the lowest thing that still has legs.
   * Its front face is at 0.500, so the eye card floats 0.135 proud rather than
   * the usual 0.010, which is exactly what the lion does; see EYE_CARD_Z. */
  hull: { part: 'box-31', paint: 'coat' },

  /* 7/16, under the pack's own 0.4808-0.5481 mammal zone: an echidna's pale part
   * is the belly only, and the spines start low on the flank. */
  belly: 0.4375,

  /* Wide and short — a digging animal's sprawl. 7/16 puts each leg's outer face
   * exactly on this hull's own side at 0.625, the crocodile's own station. */
  legs: { x: 0.4375, z: 0.3125 },

  /* THE SPINES. All three row kinds at three a row — fifteen copies against the
   * hedgehog's twenty and the porcupine's twelve — spun back over the rump the
   * way the hedgehog's are. */
  ridge: {
    part: 'cone-01',
    paint: 'spine',
    name: 'spine',
    count: 3,
    spin: [{ axis: 'y', deg: 180 }],
  },

  /* THE BEAK. The deer's muzzle at its own zero burial, so joining it at this
   * hull's front face of 0.500 puts all 0.532 of it outside the body. */
  snout: { part: 'tube-03', paint: 'beak' },

  /* The bunny's nose-tip on the beak's own placed front plane — the smallest
   * solid nose in the bank, which is what sits on the end of a beak that thin. */
  nose: { part: 'box-09', paint: 'beak', on: 'snout' },

  flag: 'NEW PALETTE, UNREVIEWED — the first echidna ever built. IT SHARES ITS SPINE WITH '
    + 'animal-hedgehog AND animal-porcupine and it has to: cone-01 is the only shape in all '
    + '100 bank records that puts a point on a body, taper 0, one of two true points in the '
    + 'pack. So the separation is placement, and it is two things. FIRST THE ROWS: all three '
    + 'kinds at THREE a row — fifteen copies — where the hedgehog takes all three at four '
    + '(twenty, and it declares RULE 9 for it) and the porcupine takes top and chamfer only so '
    + 'it is bare on the flanks. Sparse and everywhere is what an echidna is, and fifteen '
    + 'copies is also what keeps this animal at 835 triangles against the 951 ceiling with no '
    + 'declaration. SECOND THE BEAK, which neither of them has: tube-03, the deer\'s muzzle, '
    + '0.532 of reach at a recorded burial of ZERO, so all of it stands clear. The hedgehog\'s '
    + 'cone-06 tapers to a point and the porcupine\'s box-08 does not stand out at all; an '
    + 'echidna\'s beak is a straight rigid tube and this is the only one in the bank at that '
    + 'length. THE SHELL IS THE LION\'S SHALLOW box-31, which puts the eye card 0.135 proud of '
    + 'the front face instead of the usual 0.010 — that is the lion\'s own arrangement and not '
    + 'a fault; see hulls.ts on EYE_CARD_Z before correcting it.',
})
