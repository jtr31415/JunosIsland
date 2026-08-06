/**
 * The Triceratops — and the animal that retires "the pack has no frill".
 *
 * `docs/how-the-animals-are-made.md` §14 has said since 29 July that Dinosaurs is
 * impossible for want of *"no frill, no plate, no spine"*. **The frill is
 * `blade-05` and it was in the bank the whole time.** Measured off all 100
 * records: the lion's muzzle plate, **1.000 x 1.000 x 0.125, 18 triangles, 16
 * welded points, two atlas bands** — an octagonal slab as wide and as tall as
 * three quarters of a hull and one eighth as thick. It is the only large flat
 * plate the pack drew and nothing had ever stood it up.
 *
 * **IT HAS TO LEAN, AND THAT IS A CAMERA FACT, NOT A POSE.** `animal-goose.ts`
 * measured it: the island camera looks DOWN, so what a child sees of an upright
 * plate is its ground projection, which for a vertical frill is a line. At 45
 * degrees off vertical the same plate shows 0.707 of itself from above. The lean
 * is what makes the frill exist on screen at all.
 *
 * **THE OTHER TWO FEATURES ARE THE PACK'S OWN, UNSTRETCHED.** The brow horns are
 * `wedge-11`, the elephant's tusk — handed, `z +1`, taper 0.391, a recorded
 * burial of 0.39 — mirrored into a pair and joined to the front face above the
 * eyes. The beak is `cone-06`, the PARROT's, which is the bank's only true point
 * facing forward and is literally the shape a ceratopsian's rostrum is named for.
 *
 * `box-12`, the cow's and the deer's shell — 1.5395 wide, the WIDEST in the bank
 * — because breadth is what a horned quadruped reads as from above.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own measured crown and centre. Bottom on the shared 0.18125. */
const HULL_MID_Y = 0.80625

/**
 * 45 degrees off vertical, leaning BACK, and it is forced by the camera.
 *
 * A point at the plate's top under a rotation of `deg` about x moves to
 * `z' = y sin(deg)`, so a NEGATIVE angle tips the top towards -z. At -45 the
 * plate's own `z +1` facing becomes (0, 0.7071, 0.7071) — the outward normal of a
 * shield leaning back over the shoulders — and its ground projection is 0.707 of
 * its height rather than 0.125 of its thickness.
 */
const FRILL_LEAN = -45

/**
 * 1.0x by 1.05x on the lion's own plate: 1.000 across a 1.5395 body, 1.050 tall.
 *
 * It is barely a stretch and the CEILING is what holds it there. The harness's
 * one-mass rule asks that the hull be more than three times the next biggest
 * thing on the animal, and a plate leaned 45 degrees presents a bounding box in
 * all three axes rather than in two: at 1.1 x 1.15 this frill measures 0.727
 * against the shell's 2.405, a ratio of 3.31, and at 1.0 x 1.05 it is 3.98.
 * A frill is the second largest mass here whatever it does, so the margin is
 * bought at the only place it is for sale.
 */
const FRILL_STRETCH: readonly [number, number, number] = [1, 1.05, 1]

export const TRICERATOPS_ASSEMBLY = defineCreature('animal-triceratops', {
  palette: {
    coat: 0x8d7a5c,    // UNREVIEWED: a dusty sand-brown body
    belly: 0xded0ae,   // UNREVIEWED: the pale underside, and the sclera
    frill: 0xb5713f,   // UNREVIEWED: the rust-orange shield, which is the animal
    horn: 0xe8dfc6,    // UNREVIEWED: pale bone, for three horns and the beak
    limb: 0x77664c,    // UNREVIEWED: the heavy legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL IN THE BANK, 1.5395, the cow's and the deer's. A ceratopsian
   * is read from above and breadth is what it is read by. */
  hull: { part: 'box-12', paint: 'coat' },

  /* 7/16, below the pack's own 0.4808-0.5481 mammal zone. It splits the `coat`
   * CELL, so every other part here is painted from a slot of its own —
   * animal-stoat.ts is what happens when they are not. */
  belly: 0.4375,

  /* At 0.625 each leg's outer face lands on 0.76975 — 0.145 inside this hull's
   * own side, which is wider than the cube's and gives a heavy animal a stance
   * the cube cannot. The wheelbase is long for animal-crocodile.ts's reason:
   * length is expressed by moving the legs, never by stretching the body. */
  legs: { x: 0.5, z: 0.375, paint: 'limb' },

  /* THE BEAK. cone-06 is the parrot's and it is the bank's ONLY true point facing
   * forward — taper 0.000, one of two zero-taper shapes in all 100 records — at
   * its own recorded burial of 0.36. A ceratopsian's rostrum is a parrot beak and
   * this is the pack's parrot beak. */
  snout: { part: 'cone-06', paint: 'horn', at: [0, 0.6875, 0.625] },

  /* The beaver's paddle at the body's own centre line, animal-crocodile.ts's
   * placement: a heavy tapering tail that continues the line of the back. */
  tail: { part: 'wedge-03', paint: 'limb', at: [0, HULL_MID_Y, -0.625] },

  extras: [
    /* THE FRILL. blade-05, the lion's muzzle plate, stood up and leaned back 45
     * degrees. Its own recorded burial is ZERO and it needs none: joined at
     * y = 1.15 the plate's lower half is inside the shell and its upper half is
     * the shield. This is the part §14 said the pack did not contain. */
    {
      name: 'frill',
      part: 'blade-05',
      paint: 'frill',
      stretch: FRILL_STRETCH,
      spin: [{ axis: 'x', deg: FRILL_LEAN }],
      at: [0, 1.22, 0.18],
    },

    /* THE BROW HORNS. The elephant's tusk, mirrored, at its own facing and its
     * own 0.39 burial — a pure donor transfer with only the join point moved to
     * this hull's front face above the eye plane. */
    { name: 'horn-brow', part: 'wedge-11', paint: 'horn', kind: 'pair', at: [0.24, 1.15, 0.625] },

    /* THE NOSE HORN. cone-01, the bank's other zero-taper point, spun up and
     * forward off the front-top chamfer. It is the same shape the hedgehog, the
     * porcupine and the echidna wear as a spine — §3.1 exactly: one shape, four
     * animals, told apart by where it is put and how many there are. */
    {
      name: 'horn-nose',
      part: 'cone-01',
      paint: 'horn',
      spin: [{ axis: 'x', deg: 40 }],
      sink: 0.2,
      at: [0, 1.0, 0.60],
    },
  ],

  flag: 'THIS ANIMAL RETIRES A SENTENCE. docs/how-the-animals-are-made.md 14 has said since 29 '
    + 'July that Dinosaurs is impossible for "no frill, no plate, no spine". THE FRILL IS '
    + 'blade-05 AND IT WAS ALWAYS IN THE BANK: the lion\'s muzzle plate, measured 1.000 x 1.000 '
    + 'x 0.125, 18 triangles, 16 welded points, two atlas bands — the only large flat slab the '
    + 'pack drew, and nothing in 250 species had ever stood it up. It is barely stretched — 1.0 '
    + 'by 1.05 — and the CEILING is the ONE-MASS RULE rather than taste: a plate leaned 45 '
    + 'degrees presents a bounding box on all three axes, so at 1.1 by 1.15 the frill measures '
    + '3.31x under the shell and at 1.0 by 1.05 it measures 3.98x, against a harness floor of '
    + '3. That is your first dial and it is nearly spent. It is LEANED 45 DEGREES BACK, which '
    + 'is not a pose: animal-goose.ts measured '
    + 'that the island camera looks DOWN, so an upright plate projects to a LINE and a 45-degree '
    + 'one shows 0.707 of itself. The lean is what makes the frill visible at all. NOTE FOR '
    + 'animal-frilled-lizard: that placeholder censused only ZERO-thickness parts and so never '
    + 'saw blade-05, which at 1.000 across is 2.5x the biggest card it did find. It would '
    + 'finish that animal too, and it needs no RULE 1 flag because it is lifted geometry. THE '
    + 'HORNS ARE PURE DONOR TRANSFERS: wedge-11, the elephant\'s tusk, mirrored at its own z+1 '
    + 'facing and its own 0.39 burial, and cone-01 as the nose horn — the same zero-taper point '
    + 'the hedgehog, porcupine and echidna wear as a spine. THE BEAK IS cone-06, the parrot\'s, '
    + 'which is the bank\'s only forward-facing true point and is the shape a ceratopsian\'s '
    + 'rostrum is actually named for. NEW PALETTE, UNREVIEWED.',
})
