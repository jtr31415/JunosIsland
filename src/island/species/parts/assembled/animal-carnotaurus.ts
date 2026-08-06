/**
 * The Carnotaurus — the bull horns, and §8's chamfer idiom used on TWO stations
 * rather than on a row.
 *
 * The last of five bipedal theropods here and the third of the three big ones, so
 * the separation had to be structural. It is: a SHORT deep jaw where the T-Rex's
 * is long and deep and the allosaur's is long and narrow, the SMALLEST arms in
 * the collection, and a pair of horns turned out onto the front-top edge
 * chamfers.
 *
 * **THE HORNS ARE `cone-04`, THE HOG'S EAR, ON THE FRONT-TOP EDGE CHAMFER.** §8
 * step 2: to sit a part on an edge chamfer, spin it so its facing is the
 * chamfer's outward direction, which for a `y +1` part on a +x/+y edge is
 * `{ axis: 'z', deg: -45 }` — and that 45 is not "the plane's normal" but the
 * BISECTOR of the edge's two measured bevel normals, (2,3,0)/√13 and (3,2,0)/√13,
 * which average to (0.7071, 0.7071, 0). The join is `box-03`'s own measured
 * chamfer midpoint of **0.46875 on both axes, not the 0.5625 you get by assuming
 * a 1.000-wide face** — the mistake §8 says costs a whole row when it is assumed.
 *
 * **THE ANGLE IS -30 AND NOT THE IDIOM'S -45, AND THAT IS DELIBERATE.** At the
 * bisector these horns stand out of the chamfer at exactly 45 degrees and the
 * animal's own crown is still its highest point — `cone-04` has only 0.296 of
 * extent along its facing, so half of that is spent sideways. At -30 they lean
 * up rather than out and the tips clear the crown, which is what a brow horn has
 * to do to exist in silhouette. `animal-ankylosaurus.ts` takes the idiom's own
 * -45, unaltered, because a scute is *supposed* to follow the shell.
 *
 * `animal-allosaurus` takes the BLUNT `wedge-16` on the flat TOP face; this takes
 * the POINTED `cone-04` (taper 0.249 against 0.680) on the CHAMFER. Same job,
 * different shape, different row — §3.1 twice over in one collection.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own centre. */
const HULL_MID_Y = 0.80625

/**
 * `box-03`'s x/y edge chamfer MIDPOINT, measured: its 32 welded points are the
 * permutations of (±0.625, ±0.3125, ±0.3125) and (±0.5, ±0.5, ±0.5), so each flat
 * face is only 0.625 square and the midpoint is (0.625 + 0.3125) / 2. §8 step 1.
 */
const CHAMFER = 0.46875

/** `box-18`'s own extents, measured off the bank. */
const JAW_OWN_WIDE = 0.345
const JAW_OWN_TALL = 0.623004

/**
 * 10/16 wide and 9/16 tall, and SHORTENED on depth to 0.7 as well.
 *
 * The three big theropods here are separated by this block and nothing else:
 * animal-t-rex is 10/16 x 10/16 at full depth (long and deep), animal-spinosaurus
 * is 10/16 x 5/16 at full depth (long and flat, the crocodile's own ratio), and
 * this is 10/16 x 9/16 at 0.7 of depth — 0.298 of reach against their 0.425, the
 * short bulldog skull an abelisaur actually has.
 */
const JAW_WIDE = 0.625
const JAW_TALL = 0.5625
const JAW_DEEP = 0.7

export const CARNOTAURUS_ASSEMBLY = defineCreature('animal-carnotaurus', {
  palette: {
    coat: 0x9a5f4a,    // UNREVIEWED: a brick red-brown
    belly: 0xdfc7a8,   // UNREVIEWED: the pale underside, and the sclera
    horn: 0x4a382a,    // UNREVIEWED: the two dark brow horns
    limb: 0x7e4c3a,    // UNREVIEWED: the two legs, the tiny arms and the jaw
    hide: 0x8a5442,    // UNREVIEWED: the coat one step down, for the tail
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL and everything
   * else here paints from a slot of its own — animal-stoat.ts's landmine. */
  belly: 0.4375,

  /* The card up to 1.25. The jaw spans 0.619 to 1.181 and the card 1.090 to
   * 1.410, so 0.091 of its lower edge is behind the jaw — the same small overlap
   * `animal-crocodile.ts` ships (0.070) and the pack's own "nothing floats"
   * habit of letting parts bury into each other. `box-03`'s flat front face runs
   * only 0.49375 to 1.11875, so on this shell a jaw and an eye cannot both be
   * clear of the chamfer; `animal-t-rex.ts` avoids it entirely by taking
   * `box-21`, whose flat front runs to 1.37375. */
  eyes: { y: 1.25 },

  /* THE JAW: short, deep and wide. See the constants for how the three big
   * theropods here are told apart by this one block. */
  snout: {
    part: 'box-18',
    paint: 'limb',
    stretch: [JAW_WIDE / JAW_OWN_WIDE, JAW_TALL / JAW_OWN_TALL, JAW_DEEP],
    at: [0, 0.90, 0.625],
  },

  /* The lion's tail laid straight back on animal-frilled-lizard.ts's idiom. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.22,
    at: [0, HULL_MID_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs at the chicken's and the goose's biped station. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE SMALLEST ARMS IN THE COLLECTION: 0.4 of a box-01 against the T-Rex's
     * 0.55 and the allosaur's 0.8, because an abelisaur's really were the
     * smallest of any theropod. Named `arm`, not `leg*`, so the harness does not
     * demand its foot be on the floor. */
    {
      name: 'arm',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      stretch: [0.4, 0.4, 0.4],
      sink: 0.2,
      at: [0.33, 0.86, 0.30],
    },

    /* THE HORNS, on the front-top edge chamfers at §8's own measured midpoint and
     * its own bisector angle. See CHAMFER and the header. */
    {
      name: 'horn',
      part: 'cone-04',
      paint: 'horn',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -30 }],
      sink: 0.2,
      at: [CHAMFER, HULL_MID_Y + CHAMFER, 0.30],
    },
  ],

  flag: 'SECTION 8\'S CHAMFER IDIOM ON TWO STATIONS RATHER THAN ON A ROW. The horns are '
    + 'cone-04, the hog\'s ear, joined at box-03\'s own MEASURED chamfer midpoint of 0.46875 on '
    + 'both axes — NOT the 0.5625 you get by assuming a 1.000-wide face, which section 8 says '
    + 'once put a whole row 0.09 out. THE ANGLE IS -30 AND NOT THE IDIOM\'S -45, DELIBERATELY: '
    + 'at the bisector (which is what the 45 is — the average of the edge\'s two measured bevel '
    + 'normals (2,3,0)/root13 and (3,2,0)/root13) the horns stand out at 45 degrees and the '
    + 'crown is still the animal\'s highest point, because cone-04 has only 0.296 of extent '
    + 'along its facing and half of it goes sideways. At -30 the tips clear the crown by 0.035, '
    + 'which is what a brow horn has to do to exist in silhouette. THAT IS YOUR DIAL: less '
    + 'negative is more upright and more horn, and the sink at 0.2 is the other one. '
    + 'animal-ankylosaurus.ts takes the idiom\'s -45 unaltered, because a scute is supposed to '
    + 'follow the shell. THE SEPARATION FROM THE OTHER TWO BIG '
    + 'THEROPODS IS THE JAW BLOCK AND NOTHING ELSE: animal-t-rex is box-18 at 10/16 x 10/16 and '
    + 'full depth (long and deep), animal-spinosaurus is 10/16 x 5/16 at full depth (the '
    + 'crocodile\'s own flat ratio), and this is 10/16 x 9/16 at 0.7 of depth — 0.298 of reach '
    + 'against their 0.425, which is the short bulldog skull an abelisaur has. THE HORNS ALSO '
    + 'SEPARATE IT FROM animal-allosaurus, which takes the BLUNT wedge-16 (taper 0.680) on the '
    + 'FLAT TOP FACE where this takes the POINTED cone-04 (taper 0.249) on the CHAMFER. AND THE '
    + 'ARMS ARE THE SMALLEST HERE at 0.4 of a box-01, against the T-Rex\'s 0.55 and the '
    + 'allosaur\'s 0.8, because an abelisaur\'s really were. IT WANTS THE LONG HIND LEG. NEW '
    + 'PALETTE, UNREVIEWED.',
})
