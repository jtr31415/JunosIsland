/**
 * The emperor penguin — built beside a FROZEN penguin, which is the hardest
 * version of roster §4 there is.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * `animal-penguin` is one of the live 24 and can never be edited, so every part
 * of the separation is made on this side, and there are three:
 *
 *   - **THE SHELL.** `box-41` is the only hull bigger on all three axes and this
 *     is the only bird on it except `animal-goose`. The frozen penguin is on its
 *     own 1.250 cube, `box-39`, which fifteen songbirds also wear. An emperor is
 *     the biggest penguin there is, so size is the honest separation and the
 *     pack has exactly one way to say it.
 *   - **THE AURICULAR PATCH.** Two `plate-10` cards on the head sides, orange —
 *     the cow's, dog's and giraffe's flank patch doing §3.1's job. Nothing else
 *     in the project carries a colour patch on the side of its head, and it is
 *     the first thing anyone names about this bird.
 *   - **THE BILL.** `tube-02` is the chick's and the penguin's own beak, cut to
 *     2.2 of its length and painted orange: long, thin and down-curved in life,
 *     long and thin here, because the bank holds no curve.
 *
 * `animal-goose.ts` measured all three of `box-41`'s flat plates and its warning
 * governs every join below: the crown bounds at 1.48125 and is flat to 1.43125,
 * the front bounds at 0.725 (the tiger's muzzle boss) and is flat to 0.625, the
 * flank bounds at 0.675 and is flat to 0.625.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { LEG_ROW } from '../hulls'

const BOSS_Z = 0.725
const FLANK_PLATE_X = 0.625
const REAR_PLATE_Z = -0.625
const REAR_PLATE_Y = 0.80625
/** The card shell — where the pack puts every flat flank marking, 0.010 proud. */
const CARD_X = 0.635

export const EMPEROR_PENGUIN_ASSEMBLY = defineCreature('animal-emperor-penguin', {
  palette: {
    coat: 0x2b3038,    // UNREVIEWED: the blue-black back and head — the HULL only
    belly: 0xf7f4ea,   // UNREVIEWED: the white front, high up the chest
    /* The coat's own blue-black under a second name, and it is not decoration.
     * `animal-stoat.ts` measured the fault: a `patch` is a property of the SLOT,
     * not of the part that declared it, so a flipper painted `coat` reads the
     * belly split — and at 12/16 the split is high enough to swallow it, which
     * is exactly the stoat's own case. The flippers rendered WHITE. */
    flipper: 0x2b3038, // UNREVIEWED: the same blue-black — the two flippers
    flash: 0xe8a83c,   // UNREVIEWED: the orange-yellow ear patch and bill
    mark: 0x1a1d22,    // UNREVIEWED: the eye card and the stiff tail
    limb: 0x413a33,    // UNREVIEWED: the two feet
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The biggest shell in the pack. */
  hull: { part: 'box-41' },
  /* 12/16, and it is HIGH on purpose: an emperor's white runs up the belly and
   * chest to the throat, and `box-39`'s own donor — the frozen penguin — carries
   * its pale to 0.841 of the hull, which is the number this is reaching for. */
  belly: 0.75,

  /* Dark on a dark head. The round card is the penguin's own eye shape and
   * `plate-08` is what the frozen bird wears, so this is a transfer, not a pick.
   * 17/16 clears the tiger boss `animal-goose.ts` measured at y 0.494-0.894. */
  eyes: { part: 'plate-08', paint: 'mark', y: 1.0625 },

  /* THE BILL, on the boss's own front plane so it reads as the end of a face
   * rather than a peg on a cheek. Cut 2.2 along its own length — the pack's own
   * beak, made an emperor's. */
  snout: { part: 'tube-02', paint: 'flash', stretch: [0.85, 0.8, 2.2], at: [0, 0.74, BOSS_Z] },

  /* The stiff little tail a standing penguin drags, on the flat rear plate. */
  tail: {
    part: 'box-18',
    paint: 'mark',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    /* TWO feet on the pack's own row at the midline — `animal-chicken.ts`'s
     * biped station, and the only one there is. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE FLIPPERS. `blade-06` is the penguin's own wing and is a flipper
     * already — `collections/ocean.ts` carried that correction back. A net
     * -130 degrees about z takes its `y +1` facing to (0.766, -0.643, 0): out
     * and DOWN the flank, which is how a standing emperor holds them. They flap,
     * and that is correct rather than accidental: `creature.ts`'s
     * `withDefaultFlap` gives any wing-role part a wingbeat, and a penguin
     * swimming is the one bird for which that motion is literal. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'flipper',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -135 }],
      sink: 0.45,
      at: [FLANK_PLATE_X, 0.78, 0.0],
    },

    /* THE EAR PATCH — see the header. Cut a fifth taller and deeper than the
     * card's own 0.244 x 0.253, on the pack's own 0.010 of daylight. */
    {
      name: 'patch',
      part: 'plate-10',
      paint: 'flash',
      kind: 'pair',
      stretch: [1, 1.2, 1.2],
      at: [CARD_X, 1.09, 0.125],
    },
  ],

  flag: 'THIS ANIMAL STANDS BESIDE A FROZEN ONE and that is the whole risk. animal-penguin is '
    + 'one of the live 24 and can never be edited, so all three separations are made here: the '
    + 'SHELL (box-41, the only hull bigger on all three axes, where the frozen bird is on the '
    + '1.250 cube fifteen songbirds also wear — an emperor is the biggest penguin and size is '
    + 'the honest difference); the AURICULAR PATCH (two plate-10 flank cards in orange on the '
    + 'sides of the head, which nothing else in the project carries); and the BILL (tube-02, '
    + 'the pack\'s own penguin beak, cut 2.2 long and painted orange). If it still reads as the '
    + 'same bird, the dial is the ear patch — its size and its station — because it is the only '
    + 'one of the three that changes the animal from the front. TWO SIMPLIFICATIONS ARE '
    + 'DELIBERATE: an emperor\'s bill is DOWN-CURVED and this one is straight, which is the '
    + 'curve the bank does not hold and five collections have now priced; and only the lower '
    + 'mandible is really orange, where this paints the whole bill, because a bill 0.2 across '
    + 'has no band to cut and byBand can only cut where Kenney already did. NEW PALETTE, '
    + 'UNREVIEWED.',
})
