/**
 * Spix's macaw — all blue, with a tail longer than its body and a bare grey
 * face. Five parrots are built now and this one separates on two things.
 *
 *   - **THE TAIL IS `wedge-07`, WHICH NO BIRD WEARS.** Every parrot here takes
 *     `box-38`, the real parrot's fan — `animal-cockatoo`, `animal-cockatiel`,
 *     `animal-budgie`, `animal-lovebird`, and thirty other species besides. A
 *     macaw's tail is longer than the rest of it, and the bank's long thin
 *     tails are `wedge-07` (the cat's, 1.0466 of reach at 0.200 across),
 *     `wedge-15` and `wedge-18`. Fourteen species spend `wedge-07` and not one
 *     is a bird, so a macaw's streamer is available and unclaimed.
 *   - **THE PALE HEAD IS THE BELLY LINE RUN BACKWARDS** —
 *     `animal-skunk.ts`'s trick, which `animal-gorilla.ts` spends on a silver
 *     back. `coat` is the ashy blue-grey of the head and `under` is the vivid
 *     blue of the body, split at 12/16, so the top quarter of the animal is the
 *     head. On a one-mass creature where head and body are the same shell, that
 *     is the only way to colour a head at all, and it costs no geometry.
 *
 * The bare face is two `plate-13` cards under the eyes at 1.6x, low enough that
 * nothing is coplanar with the round eye card's own 0.694-1.094 band.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-36`'s own centre and rear face — the panda's cube, `box-03`'s numbers. */
const HULL_MID_Y = 0.80625
const REAR_Z = -0.625
/** Rule 5's eye plane, which is also where a flat face card belongs. */
const FACE_Z = 0.635

export const SPIXS_MACAW_ASSEMBLY = defineCreature('animal-spixs-macaw', {
  palette: {
    coat: 0xa9c4dd,    // UNREVIEWED: the ashy blue-grey HEAD — see the header, this is the top
    body: 0x3f6fb8,    // UNREVIEWED: the vivid blue of everything under the line
    flight: 0x2f5a9e,  // UNREVIEWED: wings and tail, a shade deeper still
    bare: 0x9b9a92,    // UNREVIEWED: the bare grey face patch, and the sclera
    bill: 0x35373a,    // UNREVIEWED: the heavy dark bill
    limb: 0x6b6a66,    // UNREVIEWED: the grey feet
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube. No parrot in the project is on it — animal-cockatoo takes
   * box-03 and the small cage birds take box-39. */
  hull: { part: 'box-36' },

  /* THE INVERSION. `under` is the BODY here and `coat` is the head, so the
   * painted line puts the pale ashy blue on the top quarter and the vivid blue
   * everywhere below it. animal-skunk.ts's finding; animal-gorilla.ts is the
   * only other species that wears it this way up. */
  under: 'body',
  belly: 0.75,

  /* The pack's one ROUND card. `under` is the body blue now, so the sclera has
   * to be named or the eye inverts — animal-ferret.ts measured that. */
  eyes: { part: 'plate-08', paint: 'bare' },

  /* The parrot's own beak, by pure donor transfer. A macaw is a parrot and
   * inventing a different bill would be inventing. */
  snout: { part: 'cone-06', paint: 'bill' },

  /* THE STREAMER. The cat's own rope tail at the body's centre, so it trails
   * straight back rather than dropping from a high root. */
  tail: { part: 'wedge-07', paint: 'flight', at: [0, HULL_MID_Y, REAR_Z] },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at box-01's recorded x. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* The chick's and the parrot's wing, by pure donor transfer. It carries the
     * `wing` role, so the wingbeat attaches with nothing declared. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' },

    /* THE BARE FACE. Two face plates at 1.6x, at y = 0.62 — below the round eye
     * card's own 0.694 lower edge, so no two flat cards share the 0.6350 plane
     * anywhere and nothing z-fights. */
    {
      name: 'lore',
      part: 'plate-13',
      kind: 'pair',
      paint: 'bare',
      stretch: [1.6, 1, 1],
      at: [0.26, 0.62, FACE_Z],
    },
  ],

  flag: 'THE TAIL IS THE SEPARATION AND IT IS A SHAPE NO BIRD HAS WORN. Every parrot built '
    + 'here takes box-38, the real parrot\'s fan, and so do thirty other species; a macaw\'s '
    + 'tail is longer than the rest of the bird, and wedge-07 — the domestic CAT\'S own tail, '
    + '1.0466 of reach at 0.200 across — is spent by fourteen species, not one of them a bird. '
    + 'THE PALE HEAD IS THE BELLY LINE RUN BACKWARDS, animal-skunk.ts\'s trick and only the '
    + 'second species after animal-gorilla to wear it that way up: coat is the ashy head, '
    + 'under is the vivid body, split at 12/16. On a one-mass animal that is the ONLY way to '
    + 'colour a head, and the proportion is one number to drag. WHAT IS MISSING is the bare '
    + 'facial skin as skin — a real Spix\'s has a grey face with feather lines through it, and '
    + 'colour here is a lookup with no positional information, so two flat cards under the eyes '
    + 'are the honest version. THEY SIT LOW ON PURPOSE: any higher and they share the 0.6350 '
    + 'plane with the round eye card and the two z-fight. NEW PALETTE, UNREVIEWED.',
})
