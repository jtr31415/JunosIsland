/**
 * PLACEHOLDER — THIS IS A GOOSE. It is here so you can open it and reshape it,
 * not because it is right, and the thing that is wrong is that its neck cannot
 * be any longer than `animal-goose`'s and cannot curve at all.
 *
 * ## WHAT TO DO WITH IT, if you are the one doing it by hand
 *
 * The neck is the whole animal and it has four numbers, all of them below as
 * named constants. They came off `animal-goose.ts`, which derived them:
 *
 *   - `NECK_STRETCH` — how long. The goose ships 1.75. This is **2.00**, which
 *     is the longest that fits at all, and the goose refused it in writing:
 *     *"2.0x clears too, at 2.004712 against a ceiling of 2.02, and 0.0153 of
 *     margin is not something to ship."* This bird takes it and buys the margin
 *     back by leaning further instead — see the next number.
 *   - `NECK_LEAN` — how far back off vertical. **This is the dial to pull.**
 *     `PACK_HEIGHT_MAX` is 2.02 and the goose measured its own neck upright at
 *     2.2627, at 15 degrees 2.2394, at 30 degrees 2.1713, at 45 degrees 2.0634 —
 *     every one over the ceiling — and 1.9560 at 60. A swan that stands its neck
 *     up cannot be built in this pack, and neither can a goose. Lower this
 *     number and the bird stands taller; raise it and the neck lies back.
 *   - `NECK_SINK` — 6/16, and it is SOLVED rather than chosen: a leaned root
 *     face rides up as it leans, so the burial has to keep up. Leave it unless
 *     you change the lean a long way, and if you do, the goose's own inequality
 *     is `sink * length >= (0.425211 / 2) * tan(lean)`.
 *   - `NECK_Z` — 3/16 forward of the midline, the lowest station at which the
 *     neck's whole root face is still on the crown's flat square. It seats the
 *     neck over the shoulders rather than over the breast.
 *
 * **THE S-CURVE IS NOT HERE AND NO NUMBER GIVES IT TO YOU.** Rule 4 as amended
 * bakes a ROTATION into a copy's vertices: it turns a part and it cannot bend
 * one, and there is no curved shape among the bank's 129. A swan's neck is an S
 * and this one is a straight line leaning back. If that is the thing that has to
 * be right, it is a shape to commission rather than a placement to find.
 *
 * ## AND THE QUESTION THAT IS BIGGER THAN THE ANIMAL
 *
 * **This bird and `animal-goose` are the same bird.** Same shell, same neck
 * idiom, same head, same bill, and that goose is already warm white (0xf2efe4).
 * Roster §4 calls that a duplicate, and there are only two honest ways out:
 * either the SWAN becomes the big white long-necked one and the goose is retuned
 * smaller and greyer, or this stays a placeholder until a taller hull or a
 * curved part exists. Both are yours. Nothing here can decide it, because the
 * two animals genuinely are one shape.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own flat crown — NOT its bounding-box top, which is 1.48125. */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625

/** The flat FLANK plate's own centre. `box-41`'s recorded centre is 0.83125. */
const FLANK_CENTRE_Y = 0.80625

/** 3/16 forward: the lowest station whose whole root face is on the flat crown. */
const NECK_Z = 0.1875

/** 2.00 — the longest that fits. The goose ships 1.75 and refused this one. */
const NECK_STRETCH = 2

/** 6/16, SOLVED against the lean rather than chosen. See the header. */
const NECK_SINK = 0.375

/** THE DIAL. Lower it and the bird stands taller; the ceiling is 2.02. */
const NECK_LEAN = 66

/** The cage birds', the hen's, the goose's and the turkey's shared wing burial. */
const WING_SINK = 0.5

export const SWAN_ASSEMBLY = defineCreature('animal-swan', {
  palette: {
    coat: 0xf6f4ec,
    flight: 0xdedad0,
    bill: 0xe08a24,
    knob: 0x241f1c,
    limb: 0x30302e,
    eye: 0x241f1c,
    pupil: PACK_PUPIL,
  },

  hull: { part: 'box-41', paint: 'coat' },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK: the elephant\'s trunk stood on end, which is `animal-goose.ts`\'s
   * own idiom and the only long neck this project has. Every number is a
   * constant above so it can be pulled by hand. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* THE HEAD, hung on the neck\'s own tip by the builder\'s anchor. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'coat' },

  /* The giraffe\'s nose worn backwards, which is the goose\'s answer to a
   * standing bird\'s tail being wider than it is tall. */
  tail: { part: 'tube-07', paint: 'flight', spin: [{ axis: 'y', deg: 180 }] },

  legs: false,
  extras: [
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, FLANK_CENTRE_Y, 0],
    },

    /* THE BILL, on the head\'s own outer face. */
    { name: 'bill', part: 'tube-02', paint: 'bill', on: 'head' },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, AND IT IS A GOOSE. It exists so you can open it and reshape it by hand, '
    + 'because a species with no entry cannot be opened at all. Two things are wrong with it and '
    + 'both are measurements. FIRST, THE NECK CANNOT BE LONGER. PACK_HEIGHT_MAX is 2.02 and '
    + 'animal-goose.ts measured its own neck upright at 2.2627, at 15 degrees 2.2394, at 30 '
    + 'degrees 2.1713 and at 45 degrees 2.0634 — every one over the ceiling. This bird takes the '
    + '2.0 stretch the goose refused as too tight (2.0047 against 2.02) and buys the margin back '
    + 'by leaning further, and NECK_LEAN is the dial: lower it and the bird stands taller. '
    + 'SECOND, THE S-CURVE IS NOT THERE AND NO NUMBER GIVES IT TO YOU — rule 4 bakes a ROTATION '
    + 'into a copy\'s vertices, which turns a part and cannot bend one, and none of the bank\'s '
    + '129 shapes is curved. A swan\'s neck is an S and this one is a straight line leaning back. '
    + 'AND THE BIGGER QUESTION: this bird and animal-goose are the SAME BIRD — same shell, same '
    + 'neck idiom, same head, same bill, and that goose is already warm white. Roster §4 calls '
    + 'that a duplicate and there are two honest ways out: the swan becomes the big white '
    + 'long-necked one and the goose is retuned smaller and greyer, or this waits for a taller '
    + 'hull or a curved shape. Both are yours; nothing here can decide it.',
})
