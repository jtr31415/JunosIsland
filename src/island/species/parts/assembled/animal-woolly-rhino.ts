/**
 * The woolly rhino — the fourth rhinoceros in the tree, and the only one whose
 * horn is a BLADE rather than a spike.
 *
 * `animal-white-rhino`, `animal-black-rhino` and `animal-sumatran-rhino` are all
 * built, and all three make the same move: `cone-01` — the one shape in the bank
 * with taper 0.000, ending in a point where everything else ends in a face —
 * stretched and spun off the crown's front edge. This one takes the same shape
 * and cuts it the other way:
 *
 *   - **2.4 x 2.4 x 1.1**, so it is WIDE and THIN where the white rhino's is
 *     1.6 x 1.9 x 1.6 and round. *Coelodonta*'s nasal horn is a flattened
 *     snow-plough, nearly half a metre across the base, and the flat is the one
 *     thing that separates it from every other rhino at tablet distance. 2.4x is
 *     inside the pack's own measured 2.97x ear-and-snout range with room to
 *     spare, and it is still the largest stretch in this collection.
 *   - **Leaned to (0, 0.469, 0.883)** — 62 degrees on x, much further forward
 *     than the white rhino's 45, because the whole point of the horn is that the
 *     animal swept snow with it. Rooted at y 1.30 rather than on the crown, which
 *     is inside the hull's own top-front chamfer and therefore real geometry.
 *
 * The shag is `animal-warthog.ts`'s bristle row, `rows: ['top']` only, which
 * `animal-sumatran-rhino.ts` also runs: the chamfer rows are §8's idiom for
 * making a cubic back read ROUND, and a woolly rhino's is a straight ridge with
 * a shoulder hump at the front, so it must not. The ears are the elephant's flap
 * stood on end and cut short — `animal-llama.ts`'s remount, `animal-white-rhino`'s
 * cut — because a woolly rhino's ears are short furred tubes, not banana flaps.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown, front face and rear plate centre. */
const CROWN_Y = 1.43125
const FRONT_Z = 0.625
const REAR_PLATE_Y = 0.80625

/** WIDE and THIN, where every other rhino here is round. See the header. */
const HORN_FRONT: [number, number, number] = [2.4, 2.4, 1.1]
/** The second horn is a third of the first, the same shape and the same idiom. */
const HORN_REAR: [number, number, number] = [1.6, 1.1, 0.9]

export const WOOLLY_RHINO_ASSEMBLY = defineCreature('animal-woolly-rhino', {
  palette: {
    coat: 0x6f5a42,    // UNREVIEWED: the thick grey-brown wool
    hair: 0x4d3d2b,    // UNREVIEWED: the dorsal shag and the tail
    horn: 0xd3c4a4,    // UNREVIEWED: the two horns, and the sclera
    mark: 0x3a3128,    // UNREVIEWED: the lip pad
    limb: 0x5c4a36,    // UNREVIEWED: the short heavy legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The plain 1.250 cube — `animal-sumatran-rhino.ts`'s shell, and the right one
   * for a stocky animal whose bulk is coat rather than frame. No belly line: a
   * woolly rhino is one colour from spine to sole, so the pale slot is the horn
   * and the sclera. */
  hull: { part: 'box-03' },
  under: 'horn',

  /* Short and wide — this animal was built low to the ground. */
  legs: { x: 0.32, z: 0.28 },

  /* Raised to clear the lip pad, at `animal-white-rhino.ts`'s height. */
  eyes: { y: 1.0625 },

  /* The elephant's side flap STOOD ON END and cut to two thirds — a woolly
   * rhino's ear is a short furred tube. `axis: 'y'` overrides its recorded
   * `x +1` so it rises off the crown, which is `animal-llama.ts`'s remount. */
  ears: {
    part: 'tube-04',
    paint: 'hair',
    axis: 'y',
    dir: 1,
    stretch: [0.85, 0.66, 0.85],
    sink: 0.32,
    at: [0.26, CROWN_Y, -0.14],
  },

  /* The hog's nose disc worn as the whole square lip, on the front face. */
  snout: { part: 'box-24', paint: 'mark', stretch: [1.35, 0.9, 1], at: [0, 0.7, FRONT_Z] },

  /* The bank's only stub, on the flat rear plate's own centre. */
  tail: { part: 'box-18', paint: 'hair', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  /* THE SHAG, one row down the spine only — the chamfer rows make a back read
   * ROUND and this animal's is a straight ridge into a shoulder hump. */
  ridge: { part: 'cone-01', paint: 'hair', name: 'shag', count: 4, rows: ['top'] },

  extras: [
    /* THE NASAL BLADE. Same shape as every other rhino here, cut WIDE and THIN
     * instead of round, and leaned further forward. Rule 3 fuses head and body,
     * so there is no nose to stand it on and the crown's front edge IS the nose. */
    {
      name: 'horn',
      part: 'cone-01',
      paint: 'horn',
      stretch: HORN_FRONT,
      spin: [{ axis: 'x', deg: 62 }],
      sink: 0.28,
      at: [0, 1.30, 0.36],
    },

    /* THE SECOND HORN, behind and a third the size. */
    {
      name: 'horn-rear',
      part: 'cone-01',
      paint: 'horn',
      stretch: HORN_REAR,
      spin: [{ axis: 'x', deg: 28 }],
      sink: 0.35,
      at: [0, CROWN_Y - 0.02, 0.09],
    },
  ],

  flag: 'THE 2.4x STRETCH ON THE NASAL HORN IS THE LARGEST IN THIS COLLECTION AND IT IS THE '
    + 'THING TO RULE ON. cone-01 is the one shape in the bank with taper 0.000 and all three '
    + 'built rhinos already wear it; what makes this one a WOOLLY rhino is that it is cut wide '
    + 'and THIN — 2.4 x 2.4 x 1.1 against animal-white-rhino.ts\'s round 1.6 x 1.9 x 1.6 — '
    + 'because Coelodonta\'s horn is a flattened snow-plough and the flat is the whole '
    + 'separation. Rule 1 sanctions a stretch on an EAR (the pack\'s own vary 2.97x) and '
    + 'cone-01 is filed as one, so it is inside the letter with room to spare. THE COAT '
    + 'IS FOUR BRISTLES AND NOT A FLEECE: animal-mammoth in this same collection wears box-29 '
    + 'as a skirt to the ground, and giving this animal the same ring would have made the two '
    + 'twins — so the wool is said with animal-warthog.ts\'s top-row-only ridge instead, which '
    + 'is the weaker half of the truth and is named as such. IF IT READS AS A BALD RHINO TO '
    + 'YOU, the box-29 skirt is the thing to try and the cost is that it then looks like the '
    + 'mammoth. THE SHOULDER HUMP IS ABSENT: the hull is never scaled and no band in the bank '
    + 'sits over a shoulder rather than round a body. NEW PALETTE, UNREVIEWED.',
})
