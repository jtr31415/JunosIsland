/**
 * The porcupine — spiny, and it has to not be `animal-hedgehog`.
 *
 * The bank holds exactly one shape that puts a point on a body — `cone-01`,
 * taper 0, one of two records in the whole bank with a true point — so the
 * quills and the hedgehog's spines are the same part and the separation has to
 * be made by PLACEMENT, which is §3.1's own claim.
 *
 * Two things do it, and both are structural:
 *
 *   - **The rows are `top` and `chamfer` only.** The hedgehog takes all three,
 *     which is what makes a cube read as a ball of spines from any angle; a
 *     porcupine is quilled on its BACK and rump and bare on the flanks and
 *     face, so the `side` row is left off — spiny from above, smooth from the
 *     side. Twelve copies against the hedgehog's twenty.
 *   - **The face is blunt.** The hedgehog's snout is `cone-06`, a long true
 *     point. This one wears `box-08`, the bunny's muzzle — which attaches
 *     `y +1`, so the donor transfer puts it high on the front of the head
 *     rather than out in front of it, recovering the bunny's own 1.348827.
 *
 * The tail is `wedge-03`, the beaver's paddle: the only tail in the bank with a
 * flattened section, and a porcupine's is a thick club rather than a rope.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The panda's nose-tip at its own recovered station.
 *
 * The join is written out rather than left to `on: 'snout'`, and that is forced:
 * `box-08` attaches `y +1`, so its outer face — what `on` anchors to — is the
 * TOP of the muzzle, and a nose belongs on its front. `[0, 0.744379, 0.625]` is
 * the hull's own front face at the shape's own recorded height, which is exactly
 * what the donor transfer would give a species with no snout at all.
 */
const NOSE_AT = [0, 0.744379, 0.625] as const

export const PORCUPINE_ASSEMBLY = defineCreature('animal-porcupine', {
  palette: {
    coat: 0x3f342a,
    belly: 0xbfae93,
    quill: 0xe8dcc0,
    mark: 0x211a15,
    limb: 0x2e251d,
    pupil: PACK_PUPIL,
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* THE QUILLS. `top` and `chamfer` and NOT `side` — see the header. Four a row
   * over two rows is twelve copies against the hedgehog's twenty, and the span
   * is solved off the hull's own flat face so every station stays embedded
   * (§8 step 4, in code). */
  ridge: { part: 'cone-01', paint: 'quill', count: 4, rows: ['top', 'chamfer'] },

  /* The bunny's muzzle, which attaches `y +1` — so it sits high on the FRONT of
   * the head rather than standing out in front of it, and its centre recovers
   * the bunny's own recorded 1.348827. That is a blunt rodent face, and it is
   * the opposite of the hedgehog's long `cone-06` point. */
  snout: { part: 'box-08', paint: 'coat' },

  /* The panda's nose-tip, on the hull's own front face at its own height. See
   * `NOSE_AT` for why this is written out rather than anchored to the snout. */
  nose: { part: 'box-37', paint: 'mark', at: [...NOSE_AT] as [number, number, number] },

  /* The beaver's paddle — the ONLY tail in the bank with a flattened section
   * (0.726 across against 0.589 through) — which is a porcupine's thick club
   * and is nothing the three water mammals in this collection may take. */
  tail: { part: 'wedge-03', paint: 'quill' },

  flag: 'THIS ANIMAL AND animal-hedgehog SHARE THEIR SPINE, because the bank has exactly one '
    + 'shape that puts a point on a body: cone-01, taper 0, one of only two true points in it. '
    + 'So the separation is PLACEMENT, which is §3.1\'s own claim, and it is two structural '
    + 'things rather than a tuning. FIRST, THE ROWS ARE top AND chamfer AND NOT side: the '
    + 'hedgehog takes all three, which is what makes a cube read as a ball of spines from every '
    + 'angle, and a porcupine is quilled on the BACK and rump and bare on the flanks — so this '
    + 'one is spiny from above and smooth from the side, which is the read a child gets. Four a '
    + 'row over two rows is twelve copies against the hedgehog\'s twenty, which is also why this '
    + 'animal needs no RULE 9 declaration where the hedgehog does. SECOND, THE FACE IS BLUNT: '
    + 'the hedgehog\'s snout is cone-06, a long true point, and this wears box-08, the bunny\'s '
    + 'muzzle — which attaches y +1, so the donor transfer puts it high on the FRONT of the head '
    + 'and recovers the bunny\'s own 1.348827 rather than standing out in front. The nose is '
    + 'written out rather than anchored with on: "snout" for the same reason: box-08\'s outer '
    + 'face is its TOP, so an anchored nose would sit on the bridge. THE TAIL IS THE BEAVER\'S '
    + 'PADDLE, the only flattened-section tail in the bank, which is a porcupine\'s thick club '
    + '— and it is a shape the otter, the mink and the coypu are all explicitly refused, because '
    + 'they are the three this collection has to hold apart from animal-beaver. NEW PALETTE, '
    + 'UNREVIEWED. Nothing is stretched and nothing is authored.',
})
