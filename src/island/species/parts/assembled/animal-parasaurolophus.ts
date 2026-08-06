/**
 * The Parasaurolophus — the crest, and the fourth thing the elephant's trunk has
 * now been.
 *
 * `box-18` is filed in the bank as the elephant's TAIL. It has been a crocodile's
 * jaw, a terrapin's neck, a goose's neck, an ostrich's neck and an ankylosaur's
 * club-arm; here it is a **hollow tube swept up and back off the skull roof**,
 * which is the one feature every child draws on this animal. §3.1 is the whole
 * reason that is allowed — *"a part's identity comes from where it is placed, how
 * many there are, and how deep it is sunk, not from what Kenney called it"* — and
 * this is the shape that has proved it hardest.
 *
 * **THE ANGLE IS -45 AND IT IS A SIGN, NOT A SIZE.** `creature.ts` builds the
 * base facing from `axis`/`dir` and then spins it, so a `y +1` part under
 * `{ axis: 'x', deg: d }` ends up facing `(0, cos d, sin d)`. A POSITIVE d
 * carries the crest up and FORWARD over the face, which is a rhinoceros; -45
 * carries it up and BACK over the shoulders, which is this animal. Two of the
 * three necks in this collection use the positive sign and this one does not, and
 * that is the only difference in the arithmetic.
 *
 * **THE BILL IS `tube-07`, THE GIRAFFE'S NOSE-TIP, STRETCHED WIDE.**
 * `animal-goose.ts` measured that shape at **1.7733 wide-over-tall — the only
 * short broad blunt thing in reach** — and spent it as a bird's tail for exactly
 * that ratio. A hadrosaur's bill is the same measurement asked for the same
 * reason, and this is the first species to wear it on the face it came off.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and centre. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

/** The goose's own crown station: 3/16 forward of the midline. */
const CREST_Z = 0.1875

/** 1.6x on `box-18`'s 0.623004 of height, giving 0.996806. */
const CREST_STRETCH = 1.6

/**
 * -45 degrees: up and BACK, where every neck in this collection is up and
 * forward. See the header — the sign is the whole feature.
 */
const CREST_LEAN = -45

/**
 * 6/16, solved at this lean and this width.
 *
 * The crest is stretched to 0.8 on x and z as well, so its root face is
 * 0.425211 x 0.8 = 0.340169 across the slope and the burial has to cover
 * `(0.340169 / 2) x tan(45) = 0.170085`. 6/16 of 0.996806 is 0.373802 — 2.2x
 * what is needed and 3.0x §3's 0.125 floor.
 */
const CREST_SINK = 0.375

export const PARASAUROLOPHUS_ASSEMBLY = defineCreature('animal-parasaurolophus', {
  palette: {
    coat: 0x88906b,    // UNREVIEWED: a soft olive-grey
    belly: 0xe0d7b6,   // UNREVIEWED: the pale underside, and the sclera
    crest: 0xd08a3c,   // UNREVIEWED: the amber crest, which is the animal
    limb: 0x707a58,    // UNREVIEWED: the four legs
    hide: 0x7c8461,    // UNREVIEWED: the coat one step down — bill and tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's own mammal line made exact, and the cube's equator. It
   * splits the `coat` CELL, so the crest, the bill and the tail all take slots of
   * their own — animal-stoat.ts's landmine. */
  belly: 0.5,

  legs: { x: 0.4375, z: 0.375, paint: 'limb' },

  /* THE BILL. The giraffe's nose-tip, which animal-goose.ts measured at 1.7733
   * wide-over-tall — the only short broad blunt shape in the bank — stretched
   * wider still and flattened. A hadrosaur's bill is that ratio and nothing else. */
  snout: { part: 'tube-07', paint: 'hide', stretch: [1.25, 0.75, 1], at: [0, 0.80625, 0.625] },

  /* The lion's tail laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.25,
    at: [0, HULL_MID_Y, -0.625],
  },

  extras: [
    /* THE CREST. The elephant's trunk stood on end and swept BACK — the goose's
     * neck idiom with the sign of the lean reversed. */
    {
      name: 'crest',
      part: 'box-18',
      paint: 'crest',
      axis: 'y',
      dir: 1,
      stretch: [0.8, CREST_STRETCH, 0.8],
      spin: [{ axis: 'x', deg: CREST_LEAN }],
      sink: CREST_SINK,
      at: [0, CROWN_Y, CREST_Z],
    },
  ],

  flag: 'THE FOURTH THING THE ELEPHANT\'S TRUNK HAS BEEN. box-18 is filed in the bank as the '
    + 'elephant\'s TAIL and it has already been a crocodile\'s jaw, a terrapin\'s neck, a '
    + 'goose\'s and an ostrich\'s neck and an ankylosaur\'s club-arm. Here it is a hollow tube '
    + 'swept up and BACK off the skull roof, which is the one feature every child draws on this '
    + 'animal. THE ANGLE IS A SIGN, NOT A SIZE: creature.ts builds the base facing from '
    + 'axis/dir and then spins it, so a y +1 part under {axis:x, deg:d} faces (0, cos d, sin '
    + 'd). A POSITIVE d carries the crest up and FORWARD over the face, which is a rhinoceros; '
    + '-45 carries it up and back over the shoulders, which is this animal. Both sauropods in '
    + 'this collection use the positive sign on the same part and that sign is the only '
    + 'difference in the arithmetic. THE BILL IS tube-07, THE GIRAFFE\'S NOSE-TIP: '
    + 'animal-goose.ts measured it at 1.7733 wide-over-tall, the only short broad blunt shape '
    + 'in the bank, and spent it as a bird\'s tail for exactly that ratio. A hadrosaur\'s bill '
    + 'is the same measurement asked for the same reason, and this is the first species to wear '
    + 'it on the face it came off. THE SINK IS SOLVED at this lean and this width: the crest is '
    + 'stretched 0.8 on x and z too, so its root face is 0.340169 across the slope and needs '
    + '(0.340169/2) x tan(45) = 0.170085 of burial; 6/16 of 0.996806 is 0.373802, 2.2x what is '
    + 'needed. NEW PALETTE, UNREVIEWED.',
})
