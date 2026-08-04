/**
 * The capercaillie — the biggest grouse there is, and the display fan is the
 * whole animal.
 *
 * **Read `animal-chicken.ts` and then `animal-turkey.ts`.** The first is the
 * galliform exemplar and this file takes four things from it unchanged — two
 * legs on `LEG_ROW` with JT-044's foot patch at 4/16, the `box-06` solid-flank
 * wing at `sink: 0.5`, the `plate-08` round eye, and `tube-02` as the bill. The
 * second derived the two numbers that stand `box-38` upright, and they are both
 * arithmetic rather than taste:
 *
 *   - **`FAN_SPIN` = 30.** `box-38`'s own root-to-tip axis is
 *     (0, 0.866025, -0.500000), 60.000 degrees above horizontal, and 60 + 30 =
 *     90, so thirty is the unique x spin that stands it exactly vertical.
 *   - **`FAN_SINK` = 8/16.** Stood upright the fan's root quad faces DOWNWARD
 *     and cannot meet a vertical rear plate at all, so its recorded 0.269738
 *     stops describing anything and leaves it floating 0.028 clear. At 8/16 the
 *     shift solves to zero and the plate bisects the fan's own thickness.
 *
 * A displaying capercaillie fans its tail and holds it rigid, which is exactly
 * what the turkey does and is why the same placement is right twice. What is
 * NOT copied is the turkey's snood, its comb-shaped absence and its bronze: this
 * bird is near-black with a green-glossed breast, an ivory bill and a red brow —
 * and the brow is `box-41`'s band 3, the bare-skin mask `animal-sheep.ts` found
 * and the turkey paints red for the same reason.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat rear plate — z = -0.625, and IDENTICAL to `box-03`'s. */
const REAR_PLATE_Z = -0.625

/** That plate's upper edge, and the highest station on the shell a fan can join. */
const REAR_PLATE_TOP_Y = 1.11875

/** The flank plate's own x and vertical centre — NOT the hull's recorded
 * (0, 0.83125, 0.05). `animal-turkey.ts` §2 is the trap and the measurement. */
const FLANK_PLATE_X = 0.625
const FLANK_PLATE_MID_Y = 0.80625

/** 30 degrees, and it is the unique x spin that stands `box-38` vertical. */
const FAN_SPIN = 30

/** 8/16, overruling the shape's recorded 0.269738 — forced, see the header. */
const FAN_SINK = 0.5

/** The cage birds' and the hen's shared wing burial. */
const WING_SINK = 0.5

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

export const CAPERCAILLIE_ASSEMBLY = defineCreature('animal-capercaillie', {
  palette: {
    coat: 0x2b2c31,
    sheen: 0x1d3a35,
    flight: 0x4a3a2c,
    face: 0xb0362b,
    limb: 0x2f2a24,
    foot: 0x1a1714,
    bill: 0xe4dcc4,
    eye: 0x100d0a,
    pupil: PACK_PUPIL,
  },

  /* The one shell bigger than the cube on all three axes, which is what "the
   * biggest grouse" means when a hull is never scaled. Band 3 is the bare-skin
   * mask — 31 triangles of front plate with the muzzle boss standing 0.100 out
   * of the middle of it — painted red for the brow wattle; band 15 is the back
   * and shoulders, taking the green gloss a displaying cock carries there. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'face', 15: 'sheen' } } },

  /* `plate-08`, painted near-black: on a red face the darkest possible bead is
   * the highest-contrast eye available, which is the turkey's own reasoning. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* The chick's and the penguin's bill, by pure donor transfer. On this shell
   * the solve lands it on `frame.front` = 0.725 and recovers the bank's recorded
   * y = 0.72775 exactly, as the hen's and the turkey's do. Ivory, which is the
   * one colour a capercaillie's bill certainly is. */
  snout: { part: 'tube-02', paint: 'bill' },

  /* THE FAN. `animal-turkey.ts` derives both numbers and neither is a taste:
   * +30 on x is the unique spin that stands `box-38`'s own 60-degree axis
   * vertical, and 8/16 is the only burial at which the rear plate bisects the
   * fan rather than letting it float. Sited at the plate's own top corner, which
   * is the highest station on the shell rather than a point in the air above it. */
  tail: {
    part: 'box-38',
    paint: 'coat',
    sink: FAN_SINK,
    spin: [{ axis: 'x', deg: FAN_SPIN }],
    at: [0, REAR_PLATE_TOP_Y, REAR_PLATE_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
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
      at: [FLANK_PLATE_X, FLANK_PLATE_MID_Y, 0],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THIS BIRD AND animal-turkey WEAR THE SAME UPRIGHT FAN, and that is deliberate rather '
    + 'than lazy: a displaying capercaillie and a displaying tom do the same thing with the same '
    + 'anatomy, and animal-turkey.ts already derived both numbers as arithmetic — +30 on x is '
    + 'the UNIQUE spin that stands box-38\'s own (0, 0.866025, -0.500000) root-to-tip axis '
    + 'vertical (60 + 30 = 90), and 8/16 is the only burial at which the rear plate BISECTS the '
    + 'fan, because stood upright its root quad faces downward and its recorded 0.269738 leaves '
    + 'it floating 0.028 clear. They are on different album pages (Farm and Woodland) and are '
    + 'held apart by colour before shape: the turkey is a bronze bird with a bare RED head and a '
    + 'drooping snood, and this is a near-black bird with a green-glossed back, an IVORY bill '
    + 'and no snood at all. IF YOU WANT THEM FURTHER APART the fan\'s join height is the single '
    + 'dial and animal-turkey.ts tabulates five rows of what each notch costs. THE RED BROW is '
    + 'box-41\'s band 3 — animal-sheep.ts\'s find, 31 triangles of front plate with the muzzle '
    + 'boss standing out of the middle of it — and the GREEN GLOSS is its band 15, 168 triangles '
    + 'of back and shoulders. Both are Kenney\'s own cuts and cost nothing. Everything else is '
    + 'the galliform idiom unchanged: two legs on LEG_ROW with the 4/16 foot patch, the box-06 '
    + 'solid-flank wing at 8/16, plate-08 as the eye, tube-02 as the bill. NEW PALETTE, '
    + 'UNREVIEWED, all nine slots. Nothing is stretched.',
})
