/**
 * PLACEHOLDER — THERE IS NO POUCH, AND A PELICAN IS A POUCH. Everything else
 * about this bird is here and correct; the one thing that names it is absent and
 * cannot be approximated, so this is an entry to open rather than an animal.
 *
 * ## WHY THE POUCH IS A COMMISSION AND NOT A SEARCH
 *
 * Measured over the whole bank: **every one of the 129 shapes is solid and
 * convex.** There is no bag, no sac, no hollow and nothing with an opening in
 * it — the pack was drawn as a set of blocks and lumps and a pouch is neither.
 * The nearest thing by volume is `box-24`, the hog's nose pad at 0.400 x 0.400
 * x 0.200, which is a PAD and reads as one however it is placed. Hanging it
 * under the bill would give a pelican a second nose, which is worse than the
 * absence.
 *
 * So this is one of the clearest commissions the roster has produced: a shape
 * the pack simply does not contain, wanted by exactly one species, and §5 is
 * explicit that we do not invent the missing parts.
 *
 * ## WHAT IS HERE
 *
 * **The longest bill in the bank that is a BILL**, which is `tube-07`, the
 * giraffe's nose: it stands 0.1660 proud, against `cone-06`'s 0.1833 and
 * `tube-06`'s 0.2314. It is chosen over both of those on SHAPE rather than
 * length — it is the broadest, blunt-ended tube of the three and a pelican's
 * upper mandible is a broad flat blade, where `cone-06` is a point and `tube-06`
 * is a furred mammal muzzle with a two-tone cut this bird has no use for.
 *
 * **A short neck on the goose's idiom**, and a pelican's really is short and
 * thick, so this is the one long-necked-bird placeholder whose neck is not a
 * compromise.
 *
 * **`box-41`, the pack's biggest shell.** A pelican is a big heavy bird and this
 * is the only hull bigger on all three axes.
 *
 * If you want to try the pouch by hand before anything is commissioned, the
 * thing to reach for is a hull-sized lump hung under the bill — and every hull
 * shape is refused by the builder for any feature (rule 3, one mass), so it
 * cannot be done from the editor either. That refusal is deliberate and it is
 * the reason this file says commission rather than workaround.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own flat crown and flat plates — NOT its recorded (0, 0.83125, 0.05). */
const HULL_CROWN_Y = 1.43125
const HULL_SIDE_X = 0.625
const FLANK_CENTRE_Y = 0.80625
const NECK_Z = 0.1875

/** Short, because a pelican's neck IS short and thick. The one placeholder here
 * whose neck length is not a compromise. */
const NECK_STRETCH = 1.15
const NECK_SINK = 0.375
const NECK_LEAN = 50

const WING_SINK = 0.5
const FOOT_AT = 0.25

export const PELICAN_ASSEMBLY = defineCreature('animal-pelican', {
  palette: {
    coat: 0xf2efe6,
    flight: 0x8d8c86,
    bill: 0xe8b850,
    pouch: 0xe0a038,
    limb: 0xd8a24c,
    foot: 0xb47e2c,
    eye: 0x241f1a,
    pupil: PACK_PUPIL,
  },

  hull: { part: 'box-41', paint: 'coat' },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK — short and thick, which is a pelican's. */
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

  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'coat' },

  tail: { part: 'tube-07', paint: 'flight', spin: [{ axis: 'y', deg: 180 }] },

  legs: false,
  extras: [
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
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

    /* THE BILL, and the `pouch` slot beside it in the palette is deliberately
     * spent on nothing yet — it is there so a commissioned pouch has a colour
     * waiting rather than needing the palette reshaped around it. */
    { name: 'bill', part: 'tube-07', paint: 'bill', on: 'head' },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, AND THERE IS NO POUCH — which on a pelican is the whole animal. Measured '
    + 'over the whole bank, every one of the 129 shapes is SOLID AND CONVEX: there is no bag, '
    + 'no sac, no hollow and nothing with an opening in it, because the pack was drawn as '
    + 'blocks and lumps. The nearest thing by volume is box-24, the hog\'s nose pad at 0.400 x '
    + '0.400 x 0.200, and hanging that under the bill gives a pelican a SECOND NOSE, which is '
    + 'worse than the absence. So this is the clearest commission the roster has produced: a '
    + 'shape the pack does not contain, wanted by one species, and §5 is explicit that we do '
    + 'not invent the missing parts. Note you cannot do it from the editor either — a '
    + 'hull-sized lump is what a pouch wants and the builder refuses every hull shape for every '
    + 'feature under rule 3, one mass. That refusal is deliberate and it is why this says '
    + 'commission rather than workaround. WHAT IS HERE: tube-07, the giraffe\'s nose, as the '
    + 'bill — chosen on SHAPE over cone-06 (a point) and tube-06 (a furred mammal muzzle), '
    + 'because it is the broadest blunt-ended tube of the three and a pelican\'s upper mandible '
    + 'is a broad flat blade. A SHORT NECK on animal-goose.ts\'s idiom, and this is the one '
    + 'long-necked-bird placeholder whose neck is not a compromise, because a pelican\'s really '
    + 'is short and thick. And box-41, the pack\'s only shell bigger on all three axes. The '
    + '`pouch` palette slot is deliberately spent on nothing, so a commissioned pouch has a '
    + 'colour waiting rather than needing the palette reshaped around it. NEW PALETTE, '
    + 'UNREVIEWED.',
})
