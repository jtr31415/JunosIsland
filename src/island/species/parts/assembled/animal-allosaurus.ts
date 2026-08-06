/**
 * The Allosaurus — the middle theropod, and the one held apart by SUBTRACTION.
 *
 * Three big bipedal carnivores stand in this collection and they are the densest
 * look-alike group in it. The separations are structural rather than tonal:
 *
 *   - **`animal-t-rex`** — `box-21`, the TALLEST shell in the bank (1.5051), with
 *     `box-18` stretched 10/16 by 10/16 into a skull as deep as it is wide, and
 *     the smallest arms of the three.
 *   - **THIS ONE** — the 1.250 cube, with the bank's straight rigid TUBE as a
 *     jaw rather than a stretched box, a pair of low brow ridges, and arms that
 *     are the LARGEST of the three because an allosaur's actually were.
 *   - **`animal-carnotaurus`** — the cube again, but a SHORT deep jaw and two
 *     horns stepped onto the front-top chamfers.
 *
 * **THE JAW IS `tube-03` AND THE CHOICE IS ITS TAPER, NOT ITS SIZE.** The deer's
 * muzzle is 0.532 of forward reach at a recorded burial of ZERO — every
 * millimetre of it stands clear — and `taper: 1.000`, so it is the same section
 * all the way out. `box-18` tapers to 0.994 and is a box; stretched it reads as a
 * blunt crocodilian snout, which is the T-Rex's and the spinosaur's. A narrow
 * even jaw is what separates this animal from both without a colour doing it.
 *
 * **THE BROW RIDGES ARE `wedge-16`, THE TIGER'S EAR** — handed, `y +1`, taper
 * 0.680, the BLUNTEST of the pack's `y +1` wedges — placed on the flat top face
 * rather than on a chamfer and leaned forward. `animal-carnotaurus` takes the
 * pointed `cone-04` on the CHAMFER instead: same job, different shape, different
 * row, which is the whole of §3.1.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and centre. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

export const ALLOSAURUS_ASSEMBLY = defineCreature('animal-allosaurus', {
  palette: {
    coat: 0x8b6a4a,    // UNREVIEWED: a warm chestnut brown
    belly: 0xdcc9a6,   // UNREVIEWED: the pale underside, and the sclera
    ridge: 0x59422c,   // UNREVIEWED: the dark brow ridges
    limb: 0x74563b,    // UNREVIEWED: the legs, the arms and the jaw
    hide: 0x7d5f42,    // UNREVIEWED: the coat one step down, for the tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The 1.250 cube, 60 triangles, against the T-Rex's 184 of box-21. The height
   * difference is the separation and it is worth what it costs. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL; the tail takes
   * `hide`, which is the coat under a second name — animal-stoat.ts's landmine. */
  belly: 0.4375,

  /* The eye above the jaw. The jaw hangs at 0.85 and is 0.270 tall, so it spans
   * 0.715 to 0.985 and would swallow the card at its own recorded 0.933646.
   * 1.15 puts the card at 0.990-1.310, clear of the jaw's crown by 0.005. */
  eyes: { y: 1.15 },

  /* THE JAW. The deer's muzzle: 0.532 of reach at a recorded burial of ZERO, so
   * every millimetre stands clear, and taper 1.000 so it is the same section all
   * the way out. Stretched on depth alone — the length is the animal. */
  snout: { part: 'tube-03', paint: 'limb', stretch: [0.9, 0.9, 1.35], at: [0, 0.85, 0.625] },

  /* The cat's rope laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-07',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, HULL_MID_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs at the chicken's and the goose's biped station. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE ARMS, the largest of the three theropods here: the leg shape at 0.8
     * rather than the T-Rex's 0.55, named `arm` so the harness does not demand
     * that its foot be on the floor. */
    {
      name: 'arm',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      stretch: [0.8, 0.8, 0.8],
      sink: 0.2,
      at: [0.34, 0.82, 0.36],
    },

    /* THE BROW RIDGES. The tiger's ear — the bluntest `y +1` wedge in the bank at
     * taper 0.680 — on the FLAT top face and leaned forward, where the carnotaur
     * takes the pointed cone-04 on the chamfer. */
    {
      name: 'ridge',
      part: 'wedge-16',
      paint: 'ridge',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 30 }],
      sink: 0.5,
      at: [0.17, CROWN_Y - 0.03, 0.28],
    },
  ],

  flag: 'THE MIDDLE OF THREE BIG BIPEDAL CARNIVORES AND THE ONE HELD APART BY SUBTRACTION. '
    + 'animal-t-rex takes box-21, the tallest shell in the bank at 1.5051, with box-18 '
    + 'stretched 10/16 by 10/16 into a skull as deep as it is wide. animal-carnotaurus takes '
    + 'the cube with a SHORT deep jaw and two horns on the front-top chamfers. This one takes '
    + 'the cube with the bank\'s straight rigid TUBE as a jaw, and the choice is its TAPER and '
    + 'not its size: tube-03, the deer\'s muzzle, is 0.532 of reach at a recorded burial of '
    + 'ZERO and taper 1.000, so it is the same section all the way out. box-18 stretched reads '
    + 'as a blunt crocodilian snout, which is already spoken for twice. THE BROW RIDGES ARE '
    + 'wedge-16, the tiger\'s ear — the BLUNTEST y +1 wedge in the bank at taper 0.680 — on the '
    + 'FLAT TOP FACE and leaned forward, where the carnotaur takes the pointed cone-04 on the '
    + 'CHAMFER. Same job, different shape, different row, which is the whole of section 3.1. '
    + 'THE ARMS ARE THE BIGGEST OF THE THREE at 0.8 of a box-01 against the T-Rex\'s 0.55, '
    + 'because an allosaur\'s actually were, and they are named `arm` and not `leg` because the '
    + 'harness asserts every mesh called leg* has its foot on the floor. IT WANTS THE LONG HIND '
    + 'LEG. NEW PALETTE, UNREVIEWED.',
})
