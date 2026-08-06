/**
 * The Spinosaurus — and the animal that retires the last of §14's three words.
 *
 * `docs/how-the-animals-are-made.md` §14: *"Dinosaurs (16) — no frill, no plate,
 * no spine."* `animal-triceratops.ts` answers the frill and
 * `animal-stegosaurus.ts` the plate, both out of `blade-05`. **The spine is the
 * same shape a third time, and it is the cheapest silhouette in the project: 18
 * triangles for the whole sail.**
 *
 * A spinosaur's sail is one membrane running the length of the back, not a row of
 * anything. `blade-05` — the lion's muzzle, measured 1.000 x 1.000 x 0.125 —
 * turned a quarter about y becomes a slab **0.125 thick, 1.000 tall and 1.000
 * long**, which on a 1.250 back covers 80% of it in one part. The stegosaur takes
 * the same turn and then narrows the plate to 0.300 and repeats it four times;
 * this one leaves it whole. **Same part, same spin, opposite animal — §3.1
 * working exactly as Joe described it.**
 *
 * **THE JAW IS `animal-crocodile.ts`'s, UNCHANGED IN RATIO.** That file stretches
 * `box-18` to 10/16 wide by 5/16 tall because *"a crocodile's jaw is twice as wide
 * as it is deep"*, and a spinosaur's is the one theropod skull that is honestly
 * crocodilian. It is the only place in this collection where a jaw is copied
 * rather than re-proportioned, and that is the point: the T-Rex's is 10/16 by
 * 10/16 and the difference between the two animals is that one ratio.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown, and the plane the sail is centred on. */
const CROWN_Y = 1.43125

/** The centre-landing join: `blade-05` shifts +0.0625 along its spun `x +1` facing. */
const SAIL_X = -0.0625

/** `box-18`'s own extents, measured off the bank. */
const JAW_OWN_WIDE = 0.345
const JAW_OWN_TALL = 0.623004

/** animal-crocodile.ts's own 10/16 by 5/16 — twice as wide as it is deep. */
const JAW_WIDE = 0.625
const JAW_TALL = 0.3125

/**
 * The lowest the jaw can hang and stay on flat geometry.
 *
 * `box-03`'s flat front face runs 0.49375 to 1.11875 — the hull centre plus or
 * minus its own `topFlatZ` of 0.3125 — so a jaw 0.3125 tall cannot be centred
 * below 0.65. The crocodile takes 0.6875, the next notch up; this animal takes
 * 0.75, one notch higher again, because the eye card has to sit above it and
 * `EYE_CARD_Z` leaves height as the only dial.
 */
const JAW_Y = 0.75

export const SPINOSAURUS_ASSEMBLY = defineCreature('animal-spinosaurus', {
  palette: {
    coat: 0x5f6f7a,    // UNREVIEWED: a cool slate blue-grey, a river animal
    belly: 0xcbd2c4,   // UNREVIEWED: the pale underside, and the sclera
    sail: 0xb8564a,    // UNREVIEWED: the deep red sail, which is the animal
    limb: 0x4e5c66,    // UNREVIEWED: the two legs and the long jaw
    hide: 0x54646e,    // UNREVIEWED: the coat one step down, for the tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube, 60 triangles. The sail is 18 and the tail is 212, so nothing
   * here needs an expensive shell. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL and nothing
   * else here paints from `coat` — the tail takes `hide`, which is the same
   * colour under a second name, exactly as animal-stoat.ts had to. */
  belly: 0.4375,

  /* The eye above the jaw: the card's own 0.933646 would land inside a jaw that
   * spans 0.594 to 0.906, so it goes to 1.15 and spans 0.99 to 1.31, inside the
   * flat front face's 1.11875 at its lower edge and over the chamfer above it. */
  eyes: { y: 1.1 },

  /* THE SAIL. blade-05 turned a quarter about y — 0.125 thick, 1.000 tall, 1.000
   * long — joined at x = -0.0625 so the transfer's own +0.0625 shift lands its
   * centre on the midline, and at the crown so exactly half of it is inside the
   * shell. Eighteen triangles for the whole thing. */
  extras: [
    {
      name: 'sail',
      part: 'blade-05',
      paint: 'sail',
      spin: [{ axis: 'y', deg: 90 }],
      at: [SAIL_X, CROWN_Y, 0],
    },

    /* TWO legs at the chicken's and the goose's biped station. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
  ],

  /* THE JAW, at the crocodile's own ratio and nothing else changed. */
  snout: {
    part: 'box-18',
    paint: 'limb',
    stretch: [JAW_WIDE / JAW_OWN_WIDE, JAW_TALL / JAW_OWN_TALL, 1],
    at: [0, JAW_Y, 0.625],
  },

  legs: false,

  /* The tiger's whip, the thinnest long tail in the bank, laid straight back. */
  tail: {
    part: 'wedge-18',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, 0.80625, -0.625],
  },

  flag: 'THIS RETIRES THE LAST OF SECTION 14\'S THREE WORDS. "No frill, no plate, no spine" — '
    + 'and all three are blade-05, the lion\'s muzzle plate, measured 1.000 x 1.000 x 0.125 at '
    + '18 triangles. The triceratops stands it up and leans it as a shield; the stegosaur turns '
    + 'it a quarter about y, narrows it to 0.300 and repeats it four times; THIS ONE TAKES THE '
    + 'SAME TURN AND LEAVES IT WHOLE, so one part 0.125 thick, 1.000 tall and 1.000 long covers '
    + '80% of a 1.250 back. THAT IS THE ENTIRE SAIL, FOR 18 TRIANGLES — the cheapest silhouette '
    + 'in this project by a wide margin, and section 3.1 working exactly as you described it: '
    + 'one shape, three animals, told apart by placement. THE JAW IS animal-crocodile.ts\'s AND '
    + 'IT IS THE ONLY COPIED PROPORTION IN THE COLLECTION: box-18 stretched 10/16 wide by 5/16 '
    + 'tall, because that file argues a crocodile\'s jaw is twice as wide as it is deep and a '
    + 'spinosaur\'s is the one theropod skull that honestly is crocodilian. animal-t-rex.ts '
    + 'takes the same part at 10/16 by 10/16 and that one ratio is the difference between the '
    + 'two animals. THE EYE IS PUSHED UP to 1.1 because the jaw occupies 0.594-0.906 of the '
    + 'same front plate; rule 5 pins the card\'s z and its size, so height is the only dial. '
    + 'IT WANTS THE LONG HIND LEG like every biped here. NEW PALETTE, UNREVIEWED.',
})
