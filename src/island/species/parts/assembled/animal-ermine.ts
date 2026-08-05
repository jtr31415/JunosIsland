/**
 * The ermine — and the honest thing to say first is that an ermine IS a stoat.
 *
 * `animal-stoat` is built, in Woodland, and the two names are the same animal in
 * two coats: *stoat* in summer chestnut, *ermine* in winter white. The roster
 * lists both, so both get built, and pretending they are different creatures
 * would be the kind of invented shape difference `animal-mink.ts` refused —
 * *"a lie a child can check against a picture book"*. Two of the three
 * separations below are therefore about colour, which is where the difference
 * actually is, and the third is a measured shape choice rather than a fiction:
 *
 *   - **NO BELLY LINE AT ALL.** The stoat's is 10/16, the highest in the
 *     project, and its own file says that split is what makes it a bright
 *     chestnut over an unbroken cream underside. A winter ermine has no
 *     counter-shading — it is white top to bottom — so this animal has no
 *     `belly` and the absence is the marking. It also means the fault
 *     `animal-stoat.ts` documents at length (a `patch` is a property of the SLOT,
 *     so every part painted from `coat` reads the split cell, and the stoat
 *     shipped with cream ears) cannot arise here at all: there is no split cell.
 *   - **`wedge-15`, THE LION'S TUFT, and not the stoat's `wedge-18`.** Both are
 *     rope tails of the same reach, and the black tip on either is Kenney's own
 *     end band rather than a second part. But they are different records with
 *     different numbers: `wedge-15` is 0.280 across against 0.200, and its dark
 *     end is **band 5, 40 triangles running local y 0.290 to 0.541 — the far
 *     third from the join**, measured, which is the same place `wedge-18`'s band
 *     3 sits. A thicker tail is what a winter animal in full coat has.
 *   - **THE FULL CUBE**, against the stoat's `box-31`, the lion's shallow shell.
 *     That is the mink's separation from the stoat as well and it is taken here
 *     for the same reason: the stoat is the lowest, longest thing of the three.
 *
 * `box-05`, the smallest ear in the bank, IS shared with both the stoat and the
 * mink, on purpose. All three animals have ears you can barely see.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const ERMINE_ASSEMBLY = defineCreature('animal-ermine', {
  palette: {
    coat: 0xf4f7fa,    // UNREVIEWED: winter white with a cool cast
    chin: 0xffffff,    // UNREVIEWED: a true white, and the sclera
    mark: 0x1b1815,    // UNREVIEWED: the nose and the tail tip — the only dark on it
    limb: 0xe6ebf0,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* NO `belly`. The stoat's 10/16 is what makes it a two-tone animal; a winter
   * ermine has no counter-shading at all and the absence is the separation. */
  under: 'chin',

  /* 6/16, the longest stance the pack's grid allows — `animal-ferret.ts` derives
   * it and `animal-mink.ts` takes it: `box-01` is 0.375 deep, so each leg's
   * outer face lands on 0.5625, one sixteenth inside the hull's own 0.625. */
  legs: { z: 0.375 },

  /* The bank's smallest ear, shared with the stoat and the mink because all
   * three animals have ears you can barely see. */
  ears: { part: 'box-05', paint: 'coat' },

  snout: 'tube-01',
  nose: { part: 'box-09', paint: 'mark' },

  /* THE LION'S TUFT, and its dark end is band 5 — 40 triangles at local y 0.290
   * to 0.541, the far third from the join, measured off the bank. The stoat
   * spends `wedge-18`'s band 3 in the same place; this is the same idea on a
   * thicker rope (0.280 across against 0.200). */
  tail: { part: 'wedge-15', paint: { base: 'coat', byBand: { 5: 'mark' } } },

  flag: 'AN ERMINE IS A STOAT AND THIS FILE SAYS SO RATHER THAN PRETENDING OTHERWISE. The '
    + 'roster lists both and they are one animal in two coats — stoat in summer chestnut, '
    + 'ermine in winter white — so inventing a shape difference would be the exact lie '
    + 'animal-mink.ts refused to tell about its own twin. The separations are: NO BELLY LINE '
    + 'AT ALL, against the stoat\'s 10/16, because a winter ermine has no counter-shading and '
    + 'the absence is the marking (it also means the cream-eared fault animal-stoat.ts '
    + 'documents cannot arise here — there is no split cell for a part to inherit); '
    + 'wedge-15, THE LION\'S TUFT, in place of the stoat\'s wedge-18 tiger whip, which is a '
    + 'genuinely different record — 0.280 across against 0.200 — whose dark end is band 5, 40 '
    + 'triangles at local y 0.290 to 0.541, the far third from the join, measured; and THE FULL '
    + 'CUBE against the stoat\'s shallow box-31. The EAR is box-05 on all three mustelids and '
    + 'that is the animals agreeing rather than one build copying another. NEW PALETTE, '
    + 'UNREVIEWED, and it is doing nearly all the work: this is a white animal whose only dark '
    + 'is a nose and a tail tip.',
})
