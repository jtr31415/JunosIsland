/**
 * The antelope — the slight one, and the horns are two stretched points.
 *
 * Africa holds three bovids and they are separated by SIZE first: this one is on
 * the plain cube, the wildebeest on the cow's wider shell and the buffalo on the
 * tiger's bigger one. Against the built `animal-ox`, `animal-water-buffalo`,
 * `animal-goat` and `animal-elk`, and the frozen `animal-deer` and `animal-cow`,
 * the separation is the HORN:
 *
 * **`cone-01` STRETCHED 1.9x TALL.** It is one of only two records in the bank
 * with `taper: 0` — a true point — and stretched it is a long straight spike,
 * which is what a gazelle's horn is and what nothing else in the project wears.
 * Every other horned animal here takes a tusk: the ox and the wildebeest
 * `wedge-11`, the goat and the buffalo `wedge-13`. 1.9 rather than 2.2 is set by
 * the ceiling — at 2.2 this animal measures 2.036 against the pack's 2.02.
 *
 * The ears are `tube-04`, the elephant's, held out sideways at its own 0.126
 * burial: 0.314 of ear standing clear on each side is the second thing a child
 * reads on an impala. The flank line is one stretched `plate-11` a side, the
 * zebra's mechanism run long instead of narrow.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The cube's crown, and the flat rear plate. */
const CROWN_Y = 1.43125
const REAR_PLATE_Z = -0.625
const HULL_CENTRE_Y = 0.80625

/** The pack's own card shell. */
const CARD_X = 0.635

/** 1.9x tall, and it is the ceiling that sets it — see the header. */
const HORN_STRETCH: [number, number, number] = [1, 1.9, 1]

export const ANTELOPE_ASSEMBLY = defineCreature('animal-antelope', {
  palette: {
    coat: 0xc08a4e,    // UNREVIEWED: warm rufous tan
    belly: 0xf6efdf,   // UNREVIEWED: the white underside, the rump and the sclera
    mark: 0x2b2219,    // UNREVIEWED: the flank line, the muzzle and the horns
    limb: 0xa06f38,    // UNREVIEWED: the slender legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* Slight and long-striding: the wheelbase goes out rather than the body being
   * stretched, because keep-out is charged on the bounding box. */
  legs: { x: 0.24, z: 0.3125 },

  /* The elephant's ear, held out at its own burial — 0.314 standing clear a side. */
  ears: { part: 'tube-04', paint: 'coat' },

  /* The bank's only stub, turned to face backwards and painted white: an impala's
   * tail is a small pale flag and nothing more. */
  tail: {
    part: 'box-18',
    paint: 'belly',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, HULL_CENTRE_Y, REAR_PLATE_Z],
  },

  /* The deer's own nose and nose-tip, by pure donor transfer. */
  snout: { part: 'tube-03', paint: 'coat' },
  nose: { part: 'box-14', paint: 'mark' },

  extras: [
    /* THE HORNS. The bank's only true point, stretched tall and splayed the
     * goat's 25 degrees — its attachment is `y +1` so it stands unspun, and the
     * splay is what seats a stood-up shape on a chamfered crown. */
    {
      name: 'horn',
      part: 'cone-01',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: HORN_STRETCH,
      spin: [{ axis: 'z', deg: -12 }],
      at: [0.15, CROWN_Y, 0.125] as [number, number, number],
    },

    /* THE FLANK LINE. The zebra's stretched card run the other way — long and
     * shallow rather than short and narrow. */
    {
      name: 'flank-line',
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      stretch: [1, 0.22, 1.25] as [number, number, number],
      at: [CARD_X, 0.72, 0] as [number, number, number],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
