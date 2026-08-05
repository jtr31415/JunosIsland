/**
 * The eel — the third legless animal in this project, so the design problem is
 * `animal-corn-snake` and `animal-slow-worm` rather than the geometry.
 *
 * All three pay the same toll. A hull with no legs has its own bottom as its
 * lowest point and measures 1.250, under the pack's floor, and all three answer
 * it with `box-04` — the bee's abdomen band — stretched and spun twice into a
 * COIL behind the body. That is the slow worm's shape, reused by the corn snake
 * and reused again here, for the reason the corn snake gave: a solved toll
 * should be paid the same way twice.
 *
 * What makes this one an eel and not a snake is the DORSAL RUN — five `wedge-04`
 * along the top row, a continuous fin from the head to the tail, which no snake
 * has and which is the single feature a child names an eel by. The corn snake
 * wears the same shape on the CHAMFER as saddles; this wears it on the TOP as a
 * fin, which is §3.1 exactly: one shape, two animals, told apart by placement.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const EEL_ASSEMBLY = defineCreature('animal-eel', {
  palette: {
    coat: 0x5c6b46,
    belly: 0xe4dcb4,
    fin: 0x44502f,
    mouth: 0x241f16,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 1.05 },

  /* The dorsal run — the fin, on the TOP row, where the corn snake puts its
   * saddles on the chamfer. Same shape, different animal. */
  ridge: {
    part: 'wedge-04',
    paint: 'fin',
    name: 'fin',
    count: 5,
    rows: ['top'],
    span: 0.5,
  },

  extras: [
    /* The coil, at the slow worm's own two spins and the corn snake's stretch. */
    {
      name: 'coil',
      part: 'box-04',
      paint: 'coat',
      spin: [{ axis: 'x', deg: 90 }, { axis: 'x', deg: 90 }],
      stretch: [0.75, 0.75, 1],
      axis: 'z',
      dir: 1,
      sink: 0.6,
      at: [0, 0.725, -0.65],
    },
    /* A long mouth line — an eel's gape runs most of its head. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [2, 1, 1], at: [0, 0.7625, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first eel ever built and the first colours ever '
    + 'proposed for it. ROSTER §4 IS THE RISK and the twin is animal-corn-snake, which '
    + 'is also a legless animal on a cube paying the height floor with the same box-04 '
    + 'coil. The separation is the DORSAL RUN — five wedge-04 along the top, where the '
    + 'corn snake wears the same shape on the chamfer as saddles. If the two still '
    + 'twin, raise the fin count or lengthen the run; the coil cannot change, because '
    + 'it is the only thing in this bank that pays a legless animal\'s height toll.',
})
