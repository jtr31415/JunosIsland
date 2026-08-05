/**
 * The gharial — a crocodile turned inside out, and the snout is the whole of it.
 *
 * `animal-crocodile.ts` measured `box-18` — the elephant's trunk, filed as a
 * tail — as the bank's longest forward reach at a burial of exactly zero, and
 * stretched it **to 10/16 wide by 5/16 tall**, saying the ratio is the animal: a
 * crocodile's jaw is twice as wide as it is deep. **A gharial's is the opposite
 * animal at the opposite ratio.** So the same shape goes the other way:
 *
 *   - **3/16 wide, 3/16 tall, and 1.8x LONG** — 0.7654 of reach against the
 *     crocodile's 0.4252, on a snout that is square in section rather than
 *     flattened. §3 measured the pack stretching its own snouts 2.90x, so 1.8 is
 *     inside it; the depth is what the keep-out is spent on and nothing else
 *     here is lengthened.
 *   - **THE GHARA**, the bulb on the tip that gives the animal its name:
 *     `box-24`, the hog's nose disc, cut to 0.6 and hung `on: 'snout'` so it
 *     travels with the snout rather than with a coordinate.
 *   - **`box-31`, the lion's shallow shell**, against the crocodile's cube — so
 *     the two reptiles do not share a body as well as a jaw.
 *   - **SCUTES THAT ARE NOT THE CROCODILE'S.** Four `box-08`, the bunny's
 *     muzzle, low and rounded at a re-solved burial, against five `wedge-06`
 *     keels. A gharial's back is knobbled where a crocodile's is ridged.
 *
 * No teeth, for `animal-crocodile.ts`'s reason and not a new one: brief §19 is
 * "bright, never scary", and this is the animal where that bites hardest.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s front face (0.500, not 0.625), its centre and its rear. */
const FRONT_Z = 0.5
const HULL_MID_Y = 0.80625
const REAR_Z = -0.625
/** `box-31`'s flat crown, which is `box-03`'s at the same world height. */
const CROWN_Y = 1.43125

/** `box-18`'s own extents, measured: the bank's x and y for the shape. */
const JAW_OWN_WIDE = 0.345
const JAW_OWN_TALL = 0.623004

/** 3/16 each way — square in section, where the crocodile's is 10/16 by 5/16. */
const JAW_SIDE = 0.1875
/** 1.8x on z: 0.7654 of reach against the crocodile's 0.4252. */
const JAW_LONG = 1.8

/**
 * As low on the face as the snout can sit and still be on flat geometry.
 *
 * `animal-crocodile.ts` solved this for a 0.3125-tall jaw: the flat front face
 * runs 0.49375 to 1.11875 and the chamfer starts below it. This jaw is 0.1875
 * tall, so at 0.6875 it spans 0.594 to 0.781 and is wholly inside that band with
 * room to spare — the same station, for a narrower animal.
 */
const JAW_Y = 0.6875

/** Four low scutes down the spine, forward to aft. */
const SCUTE_Z: readonly number[] = [0.2, 0, -0.2, -0.4]

export const GHARIAL_ASSEMBLY = defineCreature('animal-gharial', {
  palette: {
    coat: 0x6b7a5e,    // UNREVIEWED: olive-grey, cooler than the crocodile's warm olive
    belly: 0xe4dfc4,   // UNREVIEWED: the pale underside, and the sclera
    scute: 0x4e5a44,   // UNREVIEWED: the four dorsal knobs, darker than the back
    pale: 0xd8cba8,    // UNREVIEWED: the ghara — a gharial's bulb is paler than its snout
    limb: 0x5c6a52,    // UNREVIEWED: the weak sprawled legs and the snout
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallow shell, against animal-crocodile.ts's cube. */
  hull: { part: 'box-31' },
  belly: 0.4375,

  /* Sprawled, but less than the crocodile's 0.4375 — a gharial's legs are weak
   * and it barely walks. The outer face of each leg lands at 0.5875, inside
   * this shell's own 0.625. */
  legs: { x: 0.4, z: 0.35 },

  /* HIGH ON THE HEAD, which is the one thing about a gharial's face that is not
   * the snout: its eyes sit on top of the skull, clear of the water. */
  eyes: { part: 'plate-06', y: 1.05 },

  /* THE SNOUT. Square in section and 1.8x long — see the header for why that is
   * the crocodile's own stretch turned the other way. */
  snout: {
    part: 'box-18',
    paint: 'limb',
    stretch: [JAW_SIDE / JAW_OWN_WIDE, JAW_SIDE / JAW_OWN_TALL, JAW_LONG],
    at: [0, JAW_Y, FRONT_Z],
  },

  /* THE GHARA, on the snout's own placed front plane. */
  nose: { part: 'box-24', paint: 'pale', stretch: [0.6, 0.6, 1] },

  /* Deep and flattened, standing on edge — box-38 unspun is 0.912 tall and
   * 0.626 across, which is a swimming crocodilian's tail seen from behind. */
  tail: { part: 'box-38', paint: 'coat', at: [0, HULL_MID_Y, REAR_Z] },

  extras: SCUTE_Z.map((z, i) => ({
    /* Low rounded knobs rather than the crocodile's tall keels. `box-08` is the
     * bunny's muzzle — mirror-symmetric, `y +1`, so its burial transfers to a
     * crown mount, which animal-crocodile.ts names as the one safe condition —
     * re-solved from its own 0.752 to 0.5, leaving 0.164 proud. */
    name: `scute-${i}`,
    part: 'box-08',
    paint: 'scute',
    sink: 0.5,
    at: [0, CROWN_Y, z] as [number, number, number],
  })),

  flag: 'THE SNOUT IS animal-crocodile.ts\'s OWN STRETCH RUN BACKWARDS and it is the whole '
    + 'animal. That file cuts box-18 to 10/16 wide by 5/16 tall and says "the RATIO is the '
    + 'animal"; a gharial is square in section and very long, so this is 3/16 by 3/16 by 1.8x, '
    + '0.7654 of reach against the crocodile\'s 0.4252. §3 measured the pack stretching its own '
    + 'snouts 2.90x so 1.8 is inside it, and the reach is what the keep-out is spent on — '
    + 'nothing else here is lengthened, for that reason. THE GHARA IS box-24 CUT TO 0.6, hung '
    + 'on the snout\'s own placed front plane. It is a flat DISC and a real ghara is a bulb, '
    + 'which is the DOME collections/ocean.ts prices as its clearest commission (jellyfish, '
    + 'tortoise, sea turtle) and animal-beluga.ts asks for a fourth time. A disc on the end of '
    + 'a long snout still reads, so this ships rather than waiting. THE SCUTES ARE NOT THE '
    + 'CROCODILE\'S: four box-08 knobs at a re-solved 0.5 burial against five wedge-06 keels, '
    + 'and a gharial\'s tall doubled TAIL crest is simply absent — a tail is one mesh here. NO '
    + 'TEETH, for animal-crocodile.ts\'s reason: brief §19 is bright, never scary. NEW PALETTE, '
    + 'UNREVIEWED.',
})
