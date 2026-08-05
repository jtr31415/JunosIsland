/**
 * The thorny devil — the fourth species to spend `cone-01` as a spine, and the
 * one that spends the most of them.
 *
 * The bank has exactly ONE shape that puts a point on a body — `cone-01`, taper
 * 0, one of only two true points in all 100 records — so §3.1's rule applies for
 * the fourth time: the separation between spiny animals is PLACEMENT. Against
 * the three already built:
 *
 *   - **`animal-hedgehog`** takes all three row kinds at four a row on the cube,
 *     spun back over the rump: a ball of spines.
 *   - **`animal-porcupine`** takes `top` and `chamfer` only: spiny above, bare
 *     on the flanks.
 *   - **`animal-echidna`** takes all three at three a row on this same shallow
 *     hull: sparse and everywhere.
 *   - **This one takes all three at four a row on the shallow hull — twenty
 *     copies — UNSPUN, and adds two BROW HORNS the others have none of.**
 *     Unspun matters: `cone-01`'s
 *     own attachment is `y +1`, so a copy stands straight OUT of whatever it is
 *     placed on, where the hedgehog's are swept backwards. A thorny devil's
 *     thorns are radial, not swept, and that is the whole read.
 *
 * **THE BROW HORNS ARE `cone-04`, THE HOG'S EAR** — 0.403 x 0.296, taper 0.25,
 * three and a half times the base area of a `cone-01` — sitting on the top
 * chamfer either side of the head and turned onto it at 45 degrees, which is
 * §8's own idiom. Those two are the thing a child names this animal by, and
 * `docs/building-animals-from-parts.md` §3.1 is Joe's own note that a hog's ear
 * doubles as a spike.
 *
 * **RULE 9 IS STRAINED and it is declared.** Twenty-two protrusions is 804
 * triangles and the whole animal comes to **1,080** against the pack's measured
 * 422–951 — measured off the built model, not estimated. `animal-hedgehog.ts`
 * has the same declaration for the same reason and its argument holds here: rule
 * 9's own budget is VERTICES and 796 is well inside 405–1626, and no pack animal
 * wears twenty-two protrusions, so the triangle envelope is the one Joe's count
 * leaves.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * `box-31`'s x/y edge chamfer midpoint, measured: half-extents 0.625 and 0.625
 * with a flat-face inset of 0.3125 each way, so the midpoint is 0.46875 on both
 * — §8 step 1's own number, and NOT the 0.5625 you get by assuming a 1.000-wide
 * face. Assuming it once put a whole row 0.09 out.
 */
const CHAMFER = 0.46875

/** The hull's own centre. `box-31`'s recorded `offset[1]`. */
const HULL_MID_Y = 0.80625

/** As far forward as a brow horn can sit and stay on the chamfer's flat run. */
const BROW_Z = 0.25

export const THORNY_DEVIL_ASSEMBLY = defineCreature('animal-thorny-devil', {
  palette: {
    coat: 0xc08a44,    // UNREVIEWED: the desert ochre a thorny devil goes when warm
    belly: 0xe8d8b4,   // UNREVIEWED: the pale underside, and the sclera
    thorn: 0x6e4a26,   // UNREVIEWED: the dark thorns and the two brow horns
    limb: 0xa8763a,    // UNREVIEWED: the short sprawled legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallow shell — 1.125 deep, the lowest hull that still stands on
   * legs, and the right body for a flat desert lizard. Its front face is at
   * 0.500, so the eye card floats 0.135 proud rather than the usual 0.010; that
   * is exactly what the lion does and is not a fault. */
  hull: { part: 'box-31', paint: 'coat' },

  /* 7/16, under the pack's own 0.4808-0.5481 mammal zone: a lizard's pale part
   * is the whole underside and it stops below the flank. */
  belly: 0.4375,

  /* THE SPRAWL, at the crocodile's own station: 7/16 puts each leg's outer face
   * exactly on this hull's side at 0.625, the inside-the-footprint axiom at its
   * exact limit. */
  legs: { x: 0.4375, z: 0.375 },

  /* THE THORNS. All three row kinds at four a row — twenty copies, the top row
   * being unmirrored and the other two mirrored — and UNSPUN,
   * so every one stands straight out of the face it is on rather than sweeping
   * back the way the hedgehog's do. That is the difference between a thorn and a
   * quill and it costs nothing. */
  ridge: { part: 'cone-01', paint: 'thorn', name: 'thorn', count: 4 },

  /* The smallest eye card in the bank. A thorny devil's eye is a bead in a pit. */
  eyes: { part: 'plate-06', paint: 'belly' },

  extras: [
    /* THE TWO BROW HORNS. The hog's ear — §3.1 is Joe's own note that it doubles
     * as a spike — on the top chamfer either side of the head, turned onto its
     * own normal at 45 degrees. `{ axis: 'z', deg: -45 }` takes a `y +1` facing
     * to the bisector of the edge's two bevel normals, which is §8 step 2. */
    {
      name: 'brow',
      part: 'cone-04',
      paint: 'thorn',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -45 }],
      sink: 0.4,
      at: [CHAMFER, HULL_MID_Y + CHAMFER, BROW_Z],
    },
  ],

  flag: 'RULE 9 STRAINED, DECLARED: twenty-two protrusions is 804 triangles and the whole '
    + 'animal measures 1,080 against the pack\'s 422-951. animal-hedgehog.ts carries the same '
    + 'declaration for the same reason and its argument holds — rule 9\'s own budget is '
    + 'VERTICES and 796 is well inside 405-1626, and no pack animal wears twenty-two '
    + 'protrusions, so the triangle envelope is the one your own count leaves. If it is too '
    + 'many, the cheapest cut is the side row (eight copies, 272 triangles, taking it to 808 '
    + 'and inside the ceiling) and the animal is then a porcupine shape. THIS IS THE FOURTH '
    + 'SPECIES TO SPEND cone-01 AS A SPINE and the separation is '
    + 'placement, which is §3.1: the hedgehog takes all three rows at four on the cube SPUN '
    + 'BACK, the porcupine takes top and chamfer only, the echidna takes all three at three on '
    + 'this same shallow hull, and this takes all three at four UNSPUN — cone-01\'s own '
    + 'attachment is y +1 so an unspun copy stands straight out of the face it is on, and a '
    + 'thorny devil\'s thorns are radial where a hedgehog\'s sweep. THE BROW HORNS ARE THE HOG\'S '
    + 'EAR, cone-04, three and a half times the base area of a cone-01, on the top chamfer at '
    + 'its measured 0.46875 midpoint turned 45 degrees onto its own normal. That is your own '
    + 'note in §3.1 — the hog ear doubling as a spike — spent on the two thorns a child would '
    + 'name this animal by. THERE IS NO TAIL: a thorny devil has one and box-18 would have '
    + 'mounted free, but it is 80 triangles this animal has not got. NEW PALETTE, UNREVIEWED.',
})
