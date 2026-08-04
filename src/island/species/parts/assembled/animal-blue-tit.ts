/**
 * The blue tit — the same band in yellow, and one card that is the whole bird.
 *
 * **Read `animal-robin.ts` first.** It settles the passerine idiom every small
 * bird here shares — `box-39` on two legs with `cone-06`, `plate-08` and a
 * `wedge-19` wing placed by pure donor transfer — and this file does not
 * re-argue any of it. What follows is only what a blue tit needs that a robin
 * does not.
 *
 * The band goes YELLOW rather than red, which gets the breast right and leaves
 * the bird looking like every other small yellow bird in the world. What makes
 * it a blue tit is the FACE: a white cheek under a blue cap with a dark line
 * through the eye. The cap and the eye-line are unsayable — `Paint.patch` takes
 * a height and `box-39` has two bands, both already spent — but the cheek is a
 * flat white patch on the side of the head, which is exactly what the pack's
 * marking cards are.
 *
 * So `plate-11` — the bigger of the two, 0.400 x 0.433 — sits at the card shell
 * on the flat side face, high and forward, where a blue tit's cheek is. It is
 * `animal-nightjar.ts`'s idiom and `animal-quail.ts`'s station, spent on the
 * marking this species is actually known by.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The rear plate's own centre — see `animal-robin.ts`. */
const REAR_PLATE_Y = 0.80625
const REAR_PLATE_Z = -0.625

/**
 * The card shell: the flat side face at 0.625 plus the 0.010 of daylight the
 * pack itself gives a flat card, which is `plate-10`'s own recorded x.
 */
const CARD_SHELL = 0.635

/**
 * High and forward on that face, and both numbers are bounded rather than
 * chosen: the flat side square runs y 0.49375 to 1.11875 and z +/-0.3125, so a
 * 0.400 x 0.433 card centred here is inside it with 0.025 to spare in y and
 * 0.096 in z. It sits above and in front of the wing, which joins at y 0.64375.
 */
const CHEEK_Y = 1.0
const CHEEK_Z = 0.2

export const BLUE_TIT_ASSEMBLY = defineCreature('animal-blue-tit', {
  palette: {
    coat: 0x3f68b8,
    breast: 0xecc63a,
    cheek: 0xf6f3ea,
    flight: 0x2f4f8f,
    limb: 0x5a6472,
    eye: 0x14110d,
    pupil: PACK_PUPIL,
  },

  /* The robin's own band, in yellow. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'breast' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'cone-06', paint: 'limb' },

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

    /* THE CHEEK, and the one thing on this bird that is not the robin's. The
     * bigger marking card at the card shell, high and forward on the flat side
     * face — a white patch on the side of a blue head, which is what a child
     * names this bird by. */
    {
      name: 'cheek',
      part: 'plate-11',
      paint: 'cheek',
      kind: 'pair',
      at: [CARD_SHELL, CHEEK_Y, CHEEK_Z],
    },
  ],

  flag: 'THE WHITE CHEEK IS THE BIRD AND IT IS ONE CARD. The yellow breast is animal-robin.ts\'s '
    + 'own band 3 in a different colour, which gets a blue tit halfway and leaves it looking '
    + 'like every other small yellow bird — what a child actually names this one by is the FACE, '
    + 'a white cheek under a blue cap with a dark line through the eye. THE CAP AND THE EYE-LINE '
    + 'ARE NOT HERE AND CANNOT BE: Paint.patch takes a HEIGHT and paints one level line, box-39 '
    + 'has exactly two bands and both are already spent, and rule 3 is one mass so there is no '
    + 'head to paint on its own. The CHEEK is sayable because it is a flat patch on the side of '
    + 'the head, which is precisely what the pack\'s marking cards are: plate-11, the bigger of '
    + 'the two at 0.400 x 0.433, at the card shell x = 0.635 (the flat side face plus the 0.010 '
    + 'of daylight the pack gives a card), high and forward at y 1.0, z 0.2 — inside the flat '
    + 'square with 0.025 to spare in y and 0.096 in z, and above the wing\'s own join at 0.64375. '
    + 'That is animal-nightjar.ts\'s idiom spent on the marking that matters most. EVERYTHING '
    + 'ELSE IS animal-robin.ts UNCHANGED and is not re-argued here. NEW PALETTE, UNREVIEWED.',
})
