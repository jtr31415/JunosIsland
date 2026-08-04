/**
 * The coypu — the third water mammal, and the one that separates on TEETH.
 *
 * A coypu is a big semi-aquatic rodent with two things nothing else in this
 * collection has: bright orange incisors, and a long naked rope of a tail where
 * the beaver beside it has a paddle. Both are said here and neither is authored.
 *
 *   - **The incisors are `blade-02`, the bunny's own nose-tip** — a flat slab
 *     0.402 x 0.270 x 0.050 — hung low on the muzzle's front and painted orange.
 *     At tablet distance a rodent's paired incisors ARE a flat orange plate, and
 *     the bank's actual tooth records (`wedge-04`, `wedge-11`, `wedge-13`) are
 *     tusks that stand out sideways rather than down.
 *   - **The tail is `wedge-07`, the cat's and the monkey's rope** — 0.200 across,
 *     the thinnest in the bank, painted skin-grey rather than coat-brown so it
 *     reads as bare. `wedge-03`, the beaver's paddle, is refused by name: it is
 *     the only flattened-section tail there is and it reads as a beaver whatever
 *     it is painted.
 *
 * The muzzle IS `tube-01`, the beaver's barrel, and that is the one beaver part
 * this animal takes — deliberately, because it is the pack's rodent muzzle and
 * fourteen mammals wear it. A coypu is a rodent; the separation is carried by
 * the tail and the teeth, which are the two things a beaver is known by.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The front plane of `tube-01` as this hull places it, solved rather than
 * guessed: joined at `box-03`'s front face z = 0.625 and sunk its own measured
 * 0.000, its centre lands on the beaver's recorded 0.710803 and its half-depth
 * is 0.085803, so its front face is 0.796605.
 */
const MUZZLE_FRONT_Z = 0.796605

/**
 * Low on that face — `tube-01` runs y 0.718370 to 0.911786, so this is 0.012
 * under its own bottom edge. The incisor's upper half is backed by muzzle and
 * its lower half hangs clear, which is what an incisor does.
 */
const INCISOR_Y = 0.73

/**
 * 17/16, and it is a bound rather than a taste. `wedge-07`'s buried root — the
 * material inboard of the join plane — runs local y -0.5233 to -0.1113, and the
 * flat rear plate every hull shares runs world y 0.49375 to 1.11875, so the join
 * has to sit in [1.0171, 1.2300] for the whole root to be backed by real face.
 * This is the lowest point on the pack's own 1/16 grid inside it, which is as
 * near to trailing as a coypu's tail can get and still be attached — 0.124 below
 * the height the cat and the monkey carry the same shape at.
 */
const TAIL_Y = 1.0625

export const COYPU_ASSEMBLY = defineCreature('animal-coypu', {
  palette: {
    coat: 0x8a7048,
    belly: 0xd4c39c,
    incisor: 0xd98a1e,
    skin: 0x9c8c7c,
    mark: 0x2b231a,
    limb: 0x6a5334,
    pupil: PACK_PUPIL,
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* The beaver's and the polar bear's round button ear, small and set high.
   * Its own band 7 inner disc is left alone: at this burial only the top of it
   * shows, and `animal-ferret.ts` measured that a `byBand` there buys a 0.018
   * crescent rather than an inner ear. */
  ears: { part: 'box-02', paint: 'coat' },

  /* The pack's rodent muzzle. A coypu is a rodent and this is the shape fourteen
   * of the pack's mammals wear; the separation from the beaver is the tail and
   * the teeth, not the nose. */
  snout: { part: 'tube-01', paint: 'coat' },

  /* The beaver's own nose-tip on the muzzle's placed front plane. */
  nose: { part: 'blade-01', paint: 'mark' },

  /* The cat's and the monkey's rope, 0.200 across — the thinnest in the bank —
   * painted skin rather than coat so it reads as bare. The beaver's paddle is
   * refused by name: see the header. */
  tail: { part: 'wedge-07', paint: 'skin', at: [0, TAIL_Y, -0.625] },

  extras: [
    /* THE INCISORS. The bunny's own nose-tip, a flat 0.402 x 0.270 x 0.050 slab,
     * hung low on the muzzle's own solved front plane and painted orange. A
     * rodent's paired incisors read as one flat plate at this scale, and the
     * bank's real tooth records are tusks that stand out sideways. */
    {
      name: 'incisor',
      part: 'blade-02',
      paint: 'incisor',
      at: [0, INCISOR_Y, MUZZLE_FRONT_Z],
    },
  ],

  flag: 'THE ORANGE INCISORS ARE THE ANIMAL AND THEY ARE A REPURPOSED NOSE. blade-02 is the '
    + 'bunny\'s own nose-tip, a flat slab 0.402 x 0.270 x 0.050, hung low on the muzzle\'s own '
    + 'solved front plane (z = 0.796605, recovered from the beaver\'s recorded 0.710803 plus its '
    + 'half-depth) and painted orange. That is §3.1 doing what it is for — a part\'s identity is '
    + 'its placement — and it is chosen over the bank\'s ACTUAL tooth records (wedge-04, '
    + 'wedge-11, wedge-13) because every one of those is a tusk that stands out sideways where '
    + 'an incisor hangs down. Its lower half hangs clear of the muzzle, which is what a tooth '
    + 'does, so it is the one part on this animal that is not fully embedded. THE TAIL IS THE '
    + 'CAT\'S ROPE PAINTED AS SKIN, 0.200 across and the thinnest in the bank, because a '
    + 'coypu\'s tail is bare and round. wedge-03, THE BEAVER\'S PADDLE, IS REFUSED BY NAME: it '
    + 'is the only tail in the bank with a flattened section (0.726 across against 0.589 '
    + 'through) and it reads as a beaver whatever colour it is, and animal-beaver is one of the '
    + 'frozen 24 sitting beside this one. THE MUZZLE IS THE BEAVER\'S, deliberately — tube-01 is '
    + 'the pack\'s rodent muzzle and fourteen mammals wear it, so refusing it would have been '
    + 'inventing a difference rather than finding one. NEW PALETTE, UNREVIEWED, all seven slots.',
})
