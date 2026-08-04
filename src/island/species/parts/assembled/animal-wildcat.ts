/**
 * The wildcat — and the animal it must not be is `animal-cat`, which is FROZEN.
 *
 * A Scottish wildcat and a tabby are the same animal to a child unless the
 * difference is structural, and there is exactly one structural difference in
 * life: the tail. A domestic cat's is a thin rope that tapers to a point; a
 * wildcat's is thick, blunt, and ends in a black club.
 *
 * The bank splits its tails on thickness with a gap and nothing in it, and the
 * frozen cat wears `wedge-07` at 0.200 across. This animal wears `wedge-15`,
 * the lion's, at 0.280 — 1.4x — and Kenney's own band 5 on that shape is the
 * TUFT at its far end, 40 triangles, so the black club is paint rather than a
 * second part and cannot come adrift.
 *
 * Everything else is the cat's, on purpose: `wedge-06` is the cat's own ear and
 * `box-10` its own nose-tip, because a wildcat's are the same and separating
 * them would be inventing a difference. The palette carries the rest — a heavy
 * grey-brown tabby against whatever the pack's cat is.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * The tail's join, on `box-03`'s flat rear face — which runs y 0.49375 to
 * 1.11875 — and 15/16, high in it. A wildcat carries its tail level with the
 * back rather than trailing on the ground, which is the second half of the
 * separation from `animal-cat` and the first half of it from `animal-otter`,
 * which wears the same shape at the plate's own centre.
 */
const TAIL_Y = 0.9375

export const WILDCAT_ASSEMBLY = defineCreature('animal-wildcat', {
  palette: {
    coat: 0x8c7f68,
    belly: 0xe4dac4,
    mark: 0x2f2a22,
    nose: 0xc9938c,
    limb: 0x6b6053,
    eye: 0xbba33d,
    pupil: PACK_PUPIL,
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* Amber to the rim, which is the one thing a wildcat's eye is and a tabby's
   * mostly is not. */
  eyes: { paint: 'eye' },

  /* The cat's own ear, unchanged, with its own band-1 inner disc pale. Taking
   * the cat's ear for a wildcat is the animals agreeing rather than the builder
   * repeating himself — the separation is the tail. */
  ears: { part: 'wedge-06', paint: { base: 'coat', byBand: { 1: 'belly' } } },

  /* The cat's own nose-tip, straight onto the hull's front face. No snout: a
   * cat's muzzle is short and every tube in the bank stands 0.17 or more
   * forward. */
  nose: { part: 'box-10', paint: 'nose' },

  /* THE SEPARATION. The lion's tail at 0.280 across against the frozen cat's
   * `wedge-07` at 0.200 — 1.4x, and the widest gap the bank offers between two
   * tails that are both long. Band 5 is Kenney's own TUFT at the far end, 40
   * triangles, so the black club is paint. */
  tail: { part: 'wedge-15', paint: { base: 'coat', byBand: { 5: 'mark' } }, at: [0, TAIL_Y, -0.625] },

  flag: 'THE WHOLE ANIMAL IS ONE SEPARATION AND IT IS THE TAIL, because animal-cat is one of '
    + 'the frozen 24 and a wildcat is a tabby to a child unless the difference is structural. '
    + 'In life there is exactly one: a domestic cat\'s tail is a thin rope tapering to a point '
    + 'and a wildcat\'s is thick, blunt and ends in a black club. The bank splits its seven '
    + 'tails on THICKNESS with a 1.7x gap and nothing in it; the frozen cat wears wedge-07 at '
    + '0.200 across and this animal wears wedge-15, the lion\'s, at 0.280 — and Kenney\'s own '
    + 'band 5 on that shape is the TUFT at its far end, 40 triangles, so the black club is '
    + 'PAINT and cannot come adrift from the tail it is on. It is carried at 15/16 of the rear '
    + 'plate rather than at its centre, level with the back, which is also what holds it apart '
    + 'from animal-otter, which wears the same shape trailing. EVERYTHING ELSE IS THE CAT\'S ON '
    + 'PURPOSE: wedge-06 is the cat\'s own ear and box-10 its own nose-tip, and inventing a '
    + 'difference there would be a lie a child can check against a picture book. THE TABBY '
    + 'STRIPES ARE NOT HERE — box-03 carries one band and `patch` paints one level line — so '
    + 'the coat is a flat heavy grey-brown, named as an approximation. NEW PALETTE, UNREVIEWED. '
    + 'Nothing is stretched.',
})
