/**
 * The barn owl — and **the facial disc, which two files in this repo say cannot
 * be built.**
 *
 * `animal-owlet.ts`: *"THE FACIAL DISC IS NOT and cannot be: it is a flat pale
 * ring around the front of the head, `Paint.patch` takes a HEIGHT with no z
 * term."* That is a correct statement about the PAINT and a wrong conclusion
 * about the animal, in the same shape as the neck claim `collections/birds.ts`
 * had to withdraw. A disc is not paint; it is a flat pale card on the face, and
 * the bank has four of them.
 *
 * **`plate-11` SPUN `{y, -90}`, AS A PAIR, AT z = 0.630.** It is the cow's,
 * dog's and giraffe's flank marking, 0.400 x 0.433, attaching `x +1`; the spin
 * turns that face forward. The two copies land x -0.006..0.426 and -0.426..0.006
 * over y 0.730..1.130 — they meet on the midline and give one pale panel 0.852
 * across the front of the head, sitting 0.005 IN FRONT of the hull's face and
 * 0.005 BEHIND the eye cards, which stay at the pack's absolute `EYE_CARD_Z`.
 *
 * It is a panel, not a heart, and that is the honest limit: the bank holds no
 * curve and no lobe. But an owl whose face is a pale shield with two dark eyes
 * in it is a barn owl at tablet distance, and this bird's eyes go NEAR-BLACK
 * where `animal-snowy-owl.ts` and `animal-owlet.ts` both go yellow — which is
 * true of the species and is what keeps three white-ish owls apart.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/** The face card plane: 0.005 behind `EYE_CARD_Z`, so the eyes stay in front. */
const FACE_Z = 0.63
const REAR: [number, number, number] = [0, 0.80625, -0.625]

export const BARN_OWL_ASSEMBLY = defineCreature('animal-barn-owl', {
  palette: {
    coat: 0xc79a4e,    // UNREVIEWED: the golden-buff back, which is the half nobody draws
    belly: 0xfdfbf6,   // UNREVIEWED: white underside, from 12/16 down
    /* The coat's own colour under a second name, and it exists because
     * `belly` splits the CELL of the slot the HULL is painted from — so a
     * part that also said `coat` was reading the wrong half of it. See
     * `animal-stoat.ts`'s header and the note in `collections/raptors.ts`. */
    flight: 0xc79a4e,  // UNREVIEWED: wings and tail — the coat's gold, under its own name
    disc: 0xfdfbf6,    // UNREVIEWED: the facial disc, the same white
    limb: 0xe6dcc8,    // UNREVIEWED: feathered legs
    bill: 0xe8e2d4,    // UNREVIEWED: pale ivory, which a barn owl's is
    hook: 0xc9bfa8,    // UNREVIEWED: a shade deeper so the bend still reads
    eye: 0x2a2622,     // UNREVIEWED: NEAR-BLACK — see the header
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'belly' } } },
  belly: 0.75,

  /* The panda's card, the biggest in the bank — rule 5 makes eye SIZE a part
   * choice and an owl is its eyes. `animal-owlet.ts` established it. */
  eyes: { part: 'plate-14', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-18', paint: 'flight', spin: [{ axis: 'y' as const, deg: 180 }], at: REAR },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const },
    /* THE FACIAL DISC — see the header for the measured landing. */
    { name: 'disc', part: 'plate-11', paint: 'disc', kind: 'pair' as const, at: [0.21, 0.93, FACE_Z], spin: [{ axis: 'y' as const, deg: -90 }] },
  ],

  flag: 'THE FACIAL DISC EXISTS AND animal-owlet.ts SAYS IT CANNOT — that is the thing to '
    + 'judge here. Its header reads "THE FACIAL DISC IS NOT and cannot be ... Paint.patch takes '
    + 'a HEIGHT with no z term", which is true of the paint and wrong about the animal, exactly '
    + 'as collections/birds.ts was about the neck. A disc is a flat pale CARD: plate-11 (the '
    + 'cow\'s flank marking, 0.400 x 0.433, attaching x +1) spun {y,-90} to face forward, as a '
    + 'pair at z 0.630. The two copies meet on the midline and give one pale panel 0.852 across '
    + 'the head, 0.005 in front of the hull face and 0.005 behind the eye cards. IT IS A PANEL '
    + 'AND NOT A HEART: the bank holds no curve and no lobe, so the heart shape is the one thing '
    + 'genuinely missing, and if you want it that is a commission. THE EYES ARE NEAR-BLACK, '
    + 'which is true of barn owls and is what holds this bird apart from animal-snowy-owl and '
    + 'animal-owlet, both yellow-eyed. NEW PALETTE, UNREVIEWED.',
})
