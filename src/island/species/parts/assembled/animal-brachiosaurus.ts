/**
 * The Brachiosaurus — the tallest animal this project has ever built, and the
 * one that spends the pack's own height norm rather than obeying it.
 *
 * **THE NECK IS `animal-goose.ts`'s NECK AND EVERY NUMBER IS ITS.** `box-18` is
 * the elephant's TRUNK, the bank's only tail attaching `z +1`; `axis: 'y',
 * dir: 1` stands it on end so it runs along its 0.623004 of HEIGHT rather than
 * its 0.425211 of depth, and a stretch is free because it costs no geometry.
 * `animal-terrapin.ts` established a trunk worn forwards as a neck; the goose
 * stood it up; the ostrich shortened it and leaned it less. This one leans it
 * less again — **25 degrees off vertical, where the goose is forced to 60 and the
 * ostrich takes 45** — because the ONE thing a brachiosaur is, is a neck held up.
 *
 * **AND THAT PUTS IT OVER `PACK_HEIGHT_MAX`, DELIBERATELY.** The goose measured
 * the wall exactly: *"a goose that stands its neck up cannot be built in this
 * pack"*, 2.02 being the tallest of Kenney's twenty-four. Since 3 August the band
 * REPORTS rather than fails (`assembly-assert.ts`, and `budget`'s note that Joe's
 * deliberate silhouettes were arriving as regressions with an authoritative
 * number attached), so a sauropod is now sayable. It is the first species in the
 * project to use that ruling in the tall direction — Ocean used it in the short
 * one, six of its sixteen under the floor.
 *
 * `box-41`, the tiger's, is the only shell in the bank bigger than the cube on
 * all three axes, and its FLAT crown is `box-03`'s own 1.43125 (the goose measured
 * that its bounding box lies on three faces). The neck joins that flat square.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT crown — not its bounding box's 1.48125. `animal-goose.ts` §2. */
const HULL_CROWN_Y = 1.43125

/** The goose's own crown station, transferred entire: see that file for the solve. */
const NECK_Z = 0.1875

/**
 * 2.0x on `box-18`'s 0.623004 of height, giving 1.246008.
 *
 * The goose takes 1.75 and records that 2.0 also clears at 2.004712 — 0.0153
 * under the ceiling — and declines it as too little margin. Here the ceiling is
 * already being spent, so the larger of the two measured values is taken.
 */
const NECK_STRETCH = 2

/**
 * 25 degrees off vertical, against the goose's forced 60 and the ostrich's 45.
 *
 * Both of those were shortened until they fitted under 2.02. This one is not, so
 * the lean is free to say what the animal is: a brachiosaur's neck is the most
 * upright neck in the fossil record and 25 degrees is as near vertical as the
 * burial rule below allows without deepening the sink past what fits on the
 * crown's flat square.
 */
const NECK_LEAN = 25

/**
 * 6/16, and it is the goose's SOLVE re-run at this lean rather than copied.
 *
 * A leaned root face rides up as it leans, so `sink * L >= (0.425211 / 2) *
 * tan(lean)`. At 25 degrees that is 0.09913, so `s >= 0.0796` — far below the
 * goose's 0.3378 at 60 degrees. 6/16 is kept anyway: it buries 0.467253, which is
 * 3.7x §3's 0.125 floor, and a neck this long wants its root deep.
 */
const NECK_SINK = 0.375

export const BRACHIOSAURUS_ASSEMBLY = defineCreature('animal-brachiosaurus', {
  palette: {
    coat: 0x8a8f6a,    // UNREVIEWED: a pale grey-green, the colour of an elephant
    belly: 0xdcd6b4,   // UNREVIEWED: the pale underside, and the sclera
    hide: 0x767b59,    // UNREVIEWED: the coat one step down — neck, head and tail
    limb: 0x6a6f50,    // UNREVIEWED: the four pillar legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE BIGGEST SHELL IN THE BANK — 1.350 x 1.300 x 1.350, the tiger's, the only
   * one over the cube on all three axes. Expensive at 262 triangles and taken
   * because a sauropod's body has to out-mass its own neck. */
  hull: { part: 'box-41', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL, so the neck,
   * the head and the tail all take `hide` — animal-stoat.ts's landmine, and on
   * this animal it would have bleached the longest part of the silhouette. */
  belly: 0.4375,

  /* Wide and long, at the crocodile's own limit: 0.5625 puts each leg's outer
   * face on 0.75, just inside this hull's flat flank at 0.625 plus its pads. */
  legs: { x: 0.5, z: 0.4375, paint: 'limb' },

  /* THE NECK. The goose's four numbers, three of them re-solved at this lean. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'hide',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD: the fox's muzzle on the neck's own built tip, a pure donor transfer
   * with no `at`, no `sink` and no `spin` — animal-goose.ts's and
   * animal-terrapin.ts's shape for exactly this job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'hide' },

  /* The lion's tail laid BACK as a counterweight, on the frilled lizard's idiom:
   * `axis: 'y', dir: 1` then a -90 turn about x, which sends (0,1,0) to (0,0,-1)
   * so it joins the rear face after the turn. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.25,
    at: [0, 0.83125, -0.625],
  },

  flag: 'THE TALLEST ANIMAL THIS PROJECT HAS BUILT, AND IT IS OVER THE PACK\'S HEIGHT NORM ON '
    + 'PURPOSE. 2.02 is the tallest of Kenney\'s twenty-four and since your 3 August ruling the '
    + 'band REPORTS rather than fails — assembly-assert.ts says so in as many words, because '
    + 'your own deliberate silhouettes were arriving as regressions with an authoritative '
    + 'number attached. This is the first species to spend that in the TALL direction; Ocean '
    + 'spent it in the short one with six of sixteen under the floor. If a sauropod at this '
    + 'height is wrong, NECK_STRETCH and NECK_LEAN are the two numbers and both are one edit. '
    + 'THE NECK IS animal-goose.ts\'s NECK: box-18, the elephant\'s trunk, stood on end with '
    + 'axis y dir 1 so it runs along its 0.623004 of height rather than its 0.425211 of depth, '
    + 'then stretched — which is free, a stretch costs no geometry. The goose takes 1.75 and '
    + 'RECORDS that 2.0 also clears at 2.004712; this takes the 2.0 because the ceiling is '
    + 'already being spent. THE LEAN IS 25 DEGREES against the goose\'s forced 60 and the '
    + 'ostrich\'s 45, and both of those were shortened until they fitted under 2.02 — a '
    + 'brachiosaur is the most upright neck there is and it does not have to be. The SINK is '
    + 'the goose\'s solve re-run rather than copied: sink x L >= (0.425211/2) x tan(lean) needs '
    + 'only 0.0796 at 25 degrees against 0.3378 at 60, and 6/16 is kept anyway because it '
    + 'buries 3.7x section 3\'s floor. THE EYE IS ON THE BODY AND NOT ON THE HEAD, which is '
    + 'animal-goose.ts\'s and animal-terrapin.ts\'s own compromise: EYE_CARD_Z is an absolute '
    + '0.635 and CreatureDef.eyes has no z, so on any long-necked animal there is NO placement '
    + 'that lands a card on the head. That is rule 5 and it is your call, not this species\'. '
    + 'NEW PALETTE, UNREVIEWED.',
})
