/**
 * The blackbird — one colour, and two things that are not it.
 *
 * **Read `animal-robin.ts` first.** It settles the passerine idiom and this file
 * takes every part of it unchanged. What a blackbird needs that a robin does not
 * is nothing at all in geometry, and that is the design rather than a shortfall:
 * a cock blackbird is black from bill to tail, with a bright yellow BILL and a
 * yellow ring round the eye, and there is no third thing.
 *
 * So `box-39`'s band 3 — the forward-facing band the robin spends on its breast
 * and the blue tit on its bib — is deliberately painted the same black as the
 * rest of the shell. That is the collection's own mechanism REFUSED, once, on
 * purpose, and it is the thing to look at: this bird is plain where its
 * neighbours are marked, and if it reads as unfinished beside them that is the
 * judgement to make rather than a gap to fill. `animal-canary.ts` makes exactly
 * the same argument for exactly the same reason.
 *
 * The eye-ring is the SCLERA, painted yellow on `plate-08` with the pupil left
 * at the pack's own grey. A round card with a yellow surround and a dark centre
 * is a blackbird's eye, and it costs neither a part nor a band.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — see `animal-robin.ts`. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

export const BLACKBIRD_ASSEMBLY = defineCreature('animal-blackbird', {
  palette: {
    coat: 0x1b1a1c,
    flight: 0x121113,
    bill: 0xe8a91c,
    limb: 0x3a3226,
    pupil: PACK_PUPIL,
  },

  /* Band 3 is NOT spent, and that is a decision rather than an omission: the
   * robin and the blue tit both colour it and a blackbird has no colour break
   * anywhere on it. Painted the coat's own black. */
  hull: { part: 'box-39', paint: 'coat' },

  /* THE EYE-RING. The sclera goes yellow and `creatureSpec` maps band 15 to the
   * pupil on every eye card whatever a species writes, so a bright ring with a
   * dark centre falls out of one word and no geometry. */
  eyes: { part: 'plate-08', paint: 'bill' },

  /* The parrot's pointed bill, painted the same yellow — the one bright thing
   * on the animal, and the reason the palette has five slots rather than six. */
  snout: { part: 'cone-06', paint: 'bill' },

  tail: { part: 'box-38', paint: 'flight', at: [0, REAR_PLATE_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },
  ],

  flag: 'THIS BIRD IS DELIBERATELY PLAIN AND THAT IS THE WHOLE DESIGN — if it looks unfinished '
    + 'beside the robin and the blue tit, that is the thing to judge and not a gap to fill. '
    + 'box-39\'s band 3, the forward-facing band those two spend on a breast and a bib, is '
    + 'painted the same black as the rest of the shell here, because a cock blackbird has no '
    + 'colour break anywhere on it. The collection\'s own free mechanism, refused once, on '
    + 'purpose — which is the argument animal-canary.ts makes for itself in the same words. '
    + 'WHAT IS HERE INSTEAD IS TWO USES OF ONE YELLOW: the bill (cone-06, the parrot\'s point) '
    + 'and the EYE-RING, which is the SCLERA — creatureSpec maps band 15 of every eye card to '
    + 'the pupil slot regardless of what a species writes, so painting the card yellow gives a '
    + 'bright ring round the pack\'s own grey centre for one word and no geometry. That is the '
    + 'whole animal and there is no third thing on it. NEW PALETTE, UNREVIEWED, five slots — one '
    + 'fewer than any other bird here, which is the point.',
})
