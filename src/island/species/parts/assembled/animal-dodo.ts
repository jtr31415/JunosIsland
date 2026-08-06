/**
 * The dodo — a very fat pigeon with a very large hooked bill, and the bill is
 * the whole animal.
 *
 * **THE BILL IS THE TWO-PART HOOK**, which `collections/raptors.ts` added to the
 * vocabulary and `animal-vulture.ts` half-invented before it: `cone-06`, the
 * parrot's beak and the bank's longest bill, stretched 1.8x along its own reach,
 * with Kenney's own band 15 — measured by `animal-canary.ts` as standing 0.0419
 * proud of band 13 — painted dark so the overhang reads. Then a second shape,
 * `wedge-10`, hung `on: 'bill'` and turned down at (0, -0.866, 0.500), which is
 * the downturned tip a straight shape cannot say on its own. A dodo's bill is
 * roughly a fifth of the animal and this one is stretched to say so.
 *
 * **TWO LEGS, NOT FOUR.** `animal-vulture.ts`'s station: `box-01` as a `pair` at
 * the shape's own recorded x = 0.25 on `LEG_ROW.y`, which is the only place a
 * biped's legs can be. The `legs` line is `false` because the builder's default
 * is a four-station row.
 *
 * **THE WINGS ARE FOLDED AND THAT IS THE TRUTH, NOT A SAVING.** `box-06` along
 * the flank at the nine-bird idiom (`animal-chicken.ts` §3). A dodo could not
 * fly and its wings were vestigial, so the folded read is the accurate one —
 * which is the opposite of `animal-ostrich.ts`, where the folded wing was a
 * keep-out decision the file had to argue for.
 *
 * The tail is `box-38`, the parrot's fan, unspun and small: a dodo's is a tuft
 * of curled plumes carried high, and the fan is the only shape in the tail bank
 * that reads as a bunch rather than as a rope.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-33`'s flank plate and its own mid height — the cube's, shared by nine. */
const FLANK_X = 0.625
const FLANK_MID_Y = 0.80625

export const DODO_ASSEMBLY = defineCreature('animal-dodo', {
  palette: {
    coat: 0x9a9187,    // UNREVIEWED: dusty grey-brown plumage
    belly: 0xc6bfb3,   // UNREVIEWED: the paler underside, and the sclera
    flight: 0x776f66,  // UNREVIEWED: the stubby wings and the tail tuft
    bill: 0xc8a06a,    // UNREVIEWED: the horn-yellow base of the bill
    hook: 0x4a3a28,    // UNREVIEWED: Kenney's own band 15 — the overhang, and the tip
    limb: 0xd0b06c,    // UNREVIEWED: the heavy yellow legs
    eye: 0x241d17,     // UNREVIEWED: the small dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The monkey's plain 1.250 cube. A dodo is a barrel and nothing else. */
  hull: { part: 'box-33', paint: 'coat' },
  belly: 0.4375,

  /* The bank's smallest card — a dodo's eye is a bead in a lot of face. */
  eyes: { part: 'plate-06', paint: 'eye' },

  /* THE BILL. The parrot's beak, stretched along its own reach, with Kenney's
   * band 15 painted dark: that band stands 0.0419 proud of band 13, which
   * animal-canary.ts called "where a hook begins". */
  snout: {
    part: 'cone-06',
    name: 'bill',
    paint: { base: 'bill', byBand: { 15: 'hook' } },
    stretch: [1.1, 1.1, 1.8],
  },

  /* THE HOOK. The dog's and monkey's own nose-tip, hung on the bill's own built
   * front plane and turned down to (0, -0.866, 0.500). Two straight parts
   * meeting at 60 degrees is the nearest the bank comes to a downcurved bill. */
  nose: {
    part: 'wedge-10',
    name: 'hook',
    on: 'bill',
    paint: 'hook',
    stretch: [1.6, 1.6, 1.6],
    spin: [{ axis: 'x', deg: 60 }],
  },

  /* The parrot's fan, by pure donor transfer: a tuft rather than a rope. */
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    /* TWO legs, at `box-01`'s own recorded x on the pack's own row. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE WING, HELD FOLDED — the nine-bird idiom, and here it is the truth. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: 0.5,
      at: [FLANK_X, FLANK_MID_Y, 0],
    },
  ],

  flag: 'THE BILL IS THE ANIMAL AND IT IS TWO PARTS PRETENDING TO BE ONE CURVE. cone-06, the '
    + 'parrot\'s beak and the bank\'s longest at 0.1833 of reach, stretched 1.8x along that '
    + 'reach with Kenney\'s own band 15 painted dark — animal-canary.ts measured that band '
    + 'standing 0.041900 proud of band 13 and called it "where a hook begins" — and then '
    + 'wedge-10 hung on: "bill" and turned down 60 degrees for the tip. THE BANK HAS NO CURVE '
    + 'and this is the eighth collection to say so; a real dodo\'s bill hooks in one continuous '
    + 'bend and this one has a corner in it. THE 1.8x STRETCH IS THE THING TO RULE ON: rule 1 '
    + 'sanctions a stretch on a SNOUT (the pack\'s own vary 2.90x) and cone-06 is filed as a '
    + 'nose, so this is inside the letter of it, but a bill a fifth of the animal long is a '
    + 'look and it is yours. THE WINGS ARE FOLDED box-06, the nine-bird idiom, and here that is '
    + 'accurate rather than economical — a dodo could not fly. THERE IS NO NECK: rule 3 fuses '
    + 'head and body, so the bill comes straight off the barrel, which for this bird is nearly '
    + 'right and for animal-terror-bird was not. NEW PALETTE, UNREVIEWED.',
})
