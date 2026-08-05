/**
 * The cassowary — the third big ratite, and the first one whose separation is
 * something it HAS rather than something it has not.
 *
 * `animal-ostrich.ts` established the neck idiom (`box-18` stood on end with its
 * axis overridden to `y`, buried 6/16, joined at the crown's own flat square)
 * and `animal-emu.ts` separated from it on three measured things — a narrower
 * shell, a shorter neck at a steeper lean, and no wing and no tail. Those two
 * used up "big brown ratite" between them. A cassowary is not one:
 *
 *   - **THE CASQUE.** A tall flattened helmet rising off the front of the head.
 *     `cone-06`, the parrot's beak, is a deep triangular blade — turn it a
 *     quarter turn about x so its `z +1` facing becomes `y +1` and it stands up
 *     instead of pointing forward, stretch it 1.7x on its own reach and cut it to
 *     0.85 across, and it is a casque. It is hung `on: 'head'`, so it travels
 *     with the head rather than with a coordinate.
 *   - **THE NECK IS SHORT AND THICK, and it is the only neck in the project that
 *     is stretched to be SHORTER than the pack drew it.** `[1.2, 0.9, 1.2]`: nine
 *     tenths of `box-18`'s own length, a fifth again across and through. The
 *     ostrich is 1.5x long and the emu 1.25x; a cassowary's neck is a thick blue
 *     column and going the other way is the whole point.
 *   - **THE WATTLES.** Two `cone-01` hung below the head, spun 150 degrees so
 *     they point down and forward.
 *
 * ## Every position on this bird is solved rather than chosen
 *
 * The neck's facing after `{ x, 50 }` is (0, 0.6428, 0.766). A spin turns the
 * copy's vertices AND the facing together, so the projection along the facing is
 * the projection of the unspun box along `y` — which makes the span exactly
 * ±0.280352, and the join solves to a centre at (0, 1.47631, 0.24119) and an
 * outer face at **(0, 1.65651, 0.45592)**. That point is where the head hangs,
 * and the head's own front face is then (0, 1.65651, 0.68730), which is where
 * the casque and the bill hang. The wattles are the only hand-placed thing on
 * the animal and they are placed against those numbers.
 *
 * The bird stands **1.968** at the top of the casque, inside the pack's
 * 1.43–2.02 band with 0.05 to spare — which is what the neck's 0.9 and the
 * casque's 1.7 were solved against, in that order.
 *
 * ## What is not here
 *
 * **The hair-like plumage.** `animal-kiwi.ts` and `animal-sloth-bear.ts` both
 * spend a row of `cone-01` on shagginess, and this bird would want the same.
 * It is left off because a cassowary's black is a silhouette rather than a
 * texture at tablet distance, and because the animal already carries five
 * features nobody else does.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s crown — the cube's own 1.43125, shared by nine of the ten hulls. */
const CROWN_Y = 1.43125

/** The goose's neck numbers, transferred entire. See that file for each solve. */
const NECK_Z = 0.1875
const NECK_SINK = 0.375

/**
 * SHORTER than the pack drew it, which no other neck in the project is. The
 * ostrich stretches `box-18` 1.5x along its length and the emu 1.25x; a
 * cassowary's neck is a thick blue column carried close to the body, so it goes
 * to 0.9 and takes the fifth it loses in length back across and through.
 */
const NECK_STRETCH: [number, number, number] = [1.2, 0.9, 1.2]
const NECK_LEAN = 50

export const CASSOWARY_ASSEMBLY = defineCreature('animal-cassowary', {
  palette: {
    coat: 0x1a1718,    // UNREVIEWED: the hair-like black plumage
    belly: 0xdad3c6,   // UNREVIEWED: the sclera only — a cassowary is black underneath
    skin: 0x2f7fb8,    // UNREVIEWED: THE BLUE NECK, bare skin and the bird's own colour
    wattle: 0xc0392b,  // UNREVIEWED: the two red lappets
    casque: 0x8d6a3f,  // UNREVIEWED: the horn helmet — keratin, not feather
    bill: 0x4a4340,    // UNREVIEWED: the short grey bill, and the foot claws
    limb: 0x6a625a,    // UNREVIEWED: the heavy scaled legs
    eye: 0x8a5a22,     // UNREVIEWED: the amber iris
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The shared 1.250 cube. The ostrich took the widest shell and the emu the
   * fish's; this bird's separation is on its head and the file does not pretend
   * the shell is doing any of it. */
  hull: { part: 'box-03' },

  /* The pack's round bird card, on the BODY at the neck's root — the goose's own
   * solve, because EYE_CARD_Z is an absolute 0.6350 and rule 5 makes an eye on a
   * head half a unit above that plane unsayable. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK. The goose's four numbers; the STRETCH is this bird's and it is the
   * one that goes the other way. See NECK_STRETCH. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'skin',
    axis: 'y',
    dir: 1,
    stretch: NECK_STRETCH,
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* THE HEAD, hung off the neck's own placed tip. The fox's muzzle, which is the
   * goose's, the terrapin's, the ostrich's and the emu's choice for this job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'skin' },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at box-01's own recorded x. A cassowary's
     * legs are the heaviest of any bird and the bank has one leg shape, so that
     * is carried by the palette and by nothing else. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE CASQUE, standing off the head's own front face. `{ x, -90 }` takes a
     * `z +1` part to `y +1`; the stretch is on its own reach, which the turn then
     * makes its height. Top of the built bird: 1.968. */
    {
      name: 'casque',
      part: 'cone-06',
      paint: 'casque',
      on: 'head',
      spin: [{ axis: 'x', deg: -90 }],
      stretch: [0.85, 1, 1.7],
    },

    /* THE BILL, off the same face. Short, broad and blunt — the chick's and the
     * penguin's bar, which is what the emu and the ostrich wear. */
    { name: 'bill', part: 'tube-02', paint: 'bill', on: 'head' },

    /* THE WATTLES. The only hand-placed thing on this bird, and they are placed
     * against the head's solved centre (0, 1.65651, 0.68730): just under and
     * behind it, spun 150 degrees so they hang down and forward. */
    {
      name: 'wattle',
      part: 'cone-01',
      paint: 'wattle',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 150 }],
      at: [0.075, 1.53, 0.57],
    },

    /* THE INNER CLAW. A cassowary's foot is the one thing everybody knows about
     * it. The hog's tusk, cut down and tipped forward off the front of each
     * foot.
     *
     * **The station is set by an ENGINE INVARIANT and not by eye.**
     * `buildAssembly` grounds the model on its lowest point, so a claw dipping
     * under y = 0 lifts the legs off the floor and `assembly-assert.ts` fails
     * that outright — it did, at the first attempt, by 0.0115. Built, this copy
     * runs 0.415 long with a half-height of 0.113; at a 15-degree tip its
     * extent along y is 0.168 and its centre lands at y = 0.2071, so its lowest
     * point is 0.039 and the FEET are what the animal stands on. */
    {
      name: 'claw',
      part: 'wedge-13',
      paint: 'bill',
      kind: 'pair',
      stretch: [0.85, 0.7, 1.1],
      spin: [{ axis: 'x', deg: 15 }],
      at: [0.25, 0.22, 0.24],
    },
  ],

  flag: 'THE CASQUE IS cone-06 STOOD ON END AND IT IS THE ONE THING TO LOOK AT. The parrot\'s '
    + 'beak is a deep triangular blade; turn it a quarter turn about x so its z+1 facing becomes '
    + 'y+1 and stretch it 1.7x on its own reach, and it is a helmet. It hangs `on: \'head\'`, so '
    + 'it travels with the head rather than with a coordinate. If it reads as a beak stuck on '
    + 'upside down rather than as a casque, the dial is the 0.85 across — thinner is more '
    + 'helmet-like — and then the stretch. THE NECK IS THE ONLY ONE IN THE PROJECT STRETCHED '
    + 'SHORTER THAN THE PACK DREW IT: [1.2, 0.9, 1.2] against the ostrich\'s 1.5x long and the '
    + 'emu\'s 1.25x, because a cassowary\'s neck is a thick blue column and not a mast. EVERY '
    + 'POSITION ON THE HEAD IS SOLVED, not chosen: a spin turns the copy\'s vertices and the '
    + 'facing together, so the span along the leaned facing is the unspun box\'s own ±0.280352, '
    + 'and the neck\'s outer face lands at (0, 1.65651, 0.45592) with the head\'s front then at '
    + '(0, 1.65651, 0.68730). The casque, the bill and — by hand, against those numbers — the '
    + 'wattles all hang off that. THE BIRD IS 1.968 TALL, inside the pack\'s 1.43-2.02 with 0.05 '
    + 'to spare, and that margin is what the neck\'s 0.9 and the casque\'s 1.7 were solved '
    + 'against. THE HAIR-LIKE PLUMAGE IS ABSENT: animal-kiwi and animal-sloth-bear both spend a '
    + 'cone-01 row on shagginess and this bird would want one, but its black reads as silhouette '
    + 'at tablet distance and it already carries five features nobody else has. NEW PALETTE, '
    + 'UNREVIEWED — the BLUE NECK against animal-emu\'s is the comparison to make, since both '
    + 'are real and both are bare skin.',
})
