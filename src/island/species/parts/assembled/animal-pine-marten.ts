/**
 * The pine marten — and its cream BIB is a band on the hull, which nothing else
 * has found a use for.
 *
 * A marten is a dark chocolate mustelid with one marking: a big pale-orange bib
 * across the throat and chest. That is a marking on the FRONT of the animal, and
 * `Paint.patch` has no z term at all — it is the exact thing `animal-badger.ts`,
 * `animal-ferret.ts` and `animal-civet.ts` each had to flag as unsayable.
 *
 * **`box-39` says it.** The penguin's shell is the 1.250 cube and its band 3 is
 * 22 triangles running x +/-0.500, local y -0.625 to 0.426 and z -0.313 to
 * 0.625 — Kenney's own white FRONT, from the chin down to the belly. It is the
 * only band in any of the pack's ten hulls that faces forward rather than up or
 * sideways, and painting it cream is a marten's bib for zero geometry. No other
 * species has spent it; `animal-canary.ts` wears the shell and leaves the band
 * alone.
 *
 * The rest holds it apart from the two mustelids beside it on the page: it is
 * the only one with a bushy CARRIED tail (`box-38` at the parrot's own height,
 * where the stoat and the mink wear ropes) and the only one with big rounded
 * ears (`cone-04`, the hog's, where they wear the bank's two smallest).
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const PINE_MARTEN_ASSEMBLY = defineCreature('animal-pine-marten', {
  palette: {
    coat: 0x5a4130,
    bib: 0xe3b768,
    mark: 0x241a13,
    limb: 0x3c2a1e,
    pupil: PACK_PUPIL,
  },

  /* The pale slot is the BIB and it is named, because there is no `belly` slot
   * to default to and a marten has no pale underside — it has a throat patch,
   * which is a different claim. This is also the sclera. */
  under: 'bib',

  /* THE BIB. The penguin's shell, for its band 3 — Kenney's own white FRONT,
   * 22 triangles from the chin to the belly, and the only band in any of the
   * pack's ten hulls that faces forward rather than up or sideways. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'bib' } } },

  /* Long-bodied, but less so than the ferret's 6/16: 5/16 puts each leg's outer
   * face on 0.500, a full chamfer's width inside the hull's own 0.625.
   * `animal-civet.ts` derives it. */
  legs: { z: 0.3125 },

  /* The hog's ear — big, low and rounded, and the biggest ear on any mustelid
   * in this collection. The stoat and the mink wear the bank's two smallest. */
  ears: { part: 'cone-04', paint: 'coat' },

  /* The deer's muzzle, taken for having NO cut: a marten's face is one dark
   * tone and the fox's two-band `tube-06` would have to be painted back to one. */
  snout: { part: 'tube-03', paint: 'coat' },

  /* The fox's nose-tip, on the muzzle's own placed front plane. */
  nose: { part: 'box-22', paint: 'mark' },

  /* The parrot's fan at the parrot's own height, entirely by donor transfer:
   * joined at this cube's rear face and sunk the parrot's own 0.269738, its
   * centre recovers the bank's recorded z = -0.772857 and its y = 1.099846 is
   * untouched by the join. Carried rather than trailing, which is what a
   * marten's tail does and what the stoat's and the mink's ropes do not. */
  tail: { part: 'box-38', paint: 'coat' },

  flag: 'THE BIB IS THE ANIMAL AND IT IS A HULL BAND, which is a find rather than a choice. A '
    + 'marten\'s one marking is a big cream throat-and-chest patch, and a patch on the FRONT of '
    + 'an animal is exactly what animal-badger.ts, animal-ferret.ts and animal-civet.ts each had '
    + 'to flag as unsayable — Paint.patch takes a HEIGHT and has no z term. box-39, the '
    + 'penguin\'s shell, says it: it is the 1.250 cube and its band 3 is 22 triangles running '
    + 'x +/-0.500, local y -0.625 to 0.426 and z -0.313 to 0.625, which is Kenney\'s own white '
    + 'FRONT from the chin to the belly. It is the ONLY band in any of the pack\'s ten hulls '
    + 'that faces forward rather than up or sideways, no species has spent it (animal-canary.ts '
    + 'wears the shell and leaves the band alone), and painting it cream costs zero triangles. '
    + 'If the bib is too big or sits too low, that is Kenney\'s own boundary and not a number '
    + 'anyone can move — the alternative is no bib at all. AGAINST THE THREE MUSTELIDS BESIDE '
    + 'IT: this is the only one with a bushy CARRIED tail (box-38 at the parrot\'s own 1.0998, '
    + 'where the stoat and the mink wear 0.200 ropes) and the only one with big rounded ears '
    + '(cone-04, where they wear the bank\'s two smallest). NEW PALETTE, UNREVIEWED. Nothing is '
    + 'stretched.',
})
