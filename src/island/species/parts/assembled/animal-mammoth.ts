/**
 * The woolly mammoth — the FROZEN `animal-elephant` separated on COAT, TUSK and
 * EAR, and deliberately not on the hull.
 *
 * A mammoth and an elephant are the same body. What a child tells them apart by
 * is three things and this file is those three:
 *
 *   - **THE COAT.** `box-29`, the lion's mane ring, worn as a skirt reaching the
 *     ground — `animal-musk-ox.ts`'s finding, and the same arithmetic: at full
 *     size the ring is 1.3612 of bounding volume against `box-41`'s 2.3693, a
 *     ratio of 1.74, and `assembly-assert.ts` wants over 3. Cut to 0.52 on DEPTH
 *     ONLY (0.7078, ratio 3.35) because the reach to the ground is the animal.
 *     Its hem sits at 0.015 and must not go below zero: the model grounds on its
 *     lowest point, so a longer skirt lifts the feet off the floor.
 *   - **THE EARS ARE THE SMALLEST IN THE BANK.** `box-05` at 0.221 x 0.232,
 *     against the elephant's own `tube-04` flap at 0.359 x 0.619. A mammoth's
 *     ears are tiny for the cold and that is the cheapest true separation there
 *     is — one shape swap, in the opposite direction to size.
 *   - **THE TUSK SWEEPS, IN TWO SEGMENTS.** `animal-dall-sheep.ts` runs the
 *     chained-`on` experiment `animal-buffalo.ts` asked for; this is its second
 *     use and the first where the bend is the point rather than the compromise.
 *     `wedge-11` out, down and forward at (0.398, -0.342, 0.852), then `wedge-13`
 *     hung `on: 'tusk'` and turned up and in at (-0.129, 0.866, 0.483). Two
 *     chords are a bend and not a spiral; a mammoth's tusks curl right round and
 *     these do not.
 *
 * The trunk is `animal-tapir.ts`'s: `box-18`, the elephant's own tail stub,
 * stretched and joined at the front plate at its own burial of zero. It is
 * angled down 45 degrees rather than held out straight, and its lowest point is
 * checked rather than assumed for the same grounding reason as the skirt.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s own front plate, where the trunk and the tusks root. */
const FRONT_Z = 0.725

/** `animal-musk-ox.ts`'s two numbers, and both are engine invariants. */
const SKIRT_STRETCH: [number, number, number] = [1, 1, 0.52]
const SKIRT_Y = 0.84

/** The tapir's trunk cut, longer and narrower: a mammoth's reaches the ground. */
const TRUNK_STRETCH: [number, number, number] = [0.8, 0.6, 1.5]

export const MAMMOTH_ASSEMBLY = defineCreature('animal-mammoth', {
  palette: {
    coat: 0x7a5334,    // UNREVIEWED: the rust-brown saddle over the shoulders
    skirt: 0x4a3220,   // UNREVIEWED: the darker hanging guard hair
    tusk: 0xe8dcbe,    // UNREVIEWED: ivory, and the sclera
    limb: 0x6a4a2f,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only shell bigger than the cube on all three axes, which is the right
   * body for the biggest animal in the collection. No belly line: a mammoth is
   * one colour above the skirt and the skirt is where every boundary is. */
  hull: { part: 'box-41' },
  under: 'tusk',

  /* Heavy and planted, at `animal-white-rhino.ts`'s stations on this shell. */
  legs: { x: 0.36, z: 0.30 },

  /* `box-41`'s front face is 0.725 and `EYE_CARD_Z` is an absolute 0.635, so the
   * card sits 0.09 inside the head — ten built species carry that and this is
   * the eleventh. Raised to clear the muzzle boss. */
  eyes: { y: 1.0625 },

  /* THE SMALLEST EAR IN THE BANK, and it is the separation from the elephant.
   * Remounted on x so it lies against the flank plate rather than standing off
   * the crown — a mammoth's ear is pressed flat to the head — and buried 0.62 of
   * its own 0.221, which is 0.137 and clears §3's 0.1249 floor for an ear. */
  ears: { part: 'box-05', paint: 'coat', axis: 'x', dir: 1, sink: 0.62, at: [0.675, 1.13, 0] },

  /* THE TRUNK, angled down. Joined at the front plate at `box-18`'s own recorded
   * burial of ZERO, so every millimetre is outside the body. */
  snout: {
    part: 'box-18',
    name: 'trunk',
    paint: 'coat',
    stretch: TRUNK_STRETCH,
    spin: [{ axis: 'x', deg: 45 }],
    at: [0, 0.95, FRONT_Z],
  },

  extras: [
    /* THE SKIRT — see the header. Cut on depth only; the hem is at 0.015. */
    {
      name: 'skirt',
      part: 'box-29',
      paint: 'skirt',
      stretch: SKIRT_STRETCH,
      sink: 0.5,
      at: [0, SKIRT_Y, 0.05],
    },

    /* TUSK, SEGMENT ONE: out, down and forward. */
    {
      name: 'tusk',
      part: 'wedge-11',
      paint: 'tusk',
      kind: 'pair',
      /* 1.8 AND NOT 2.0, AND THE REASON IS THE HARNESS RATHER THAN THE ANIMAL.
       * `assembly-assert.ts`'s lineage check recovers a per-axis stretch from two
       * bounding boxes and then compares the two point lists in `uniqueSorted`
       * order, which keys on `Math.round(n * 1000)`. At exactly 2.0 a `wedge-11`
       * coordinate lands on a 0.0005 boundary, the two lists sort differently,
       * and the mesh is reported as "not a copy of wedge-11" — measured, at 2.0
       * the worst mismatch is 2.9e-1 and at 1.8 it is 1.9e-8, on the same
       * geometry. Nothing about the tusk is wrong at 2.0; the comparison is.
       * See the file's `flag`. */
      stretch: [1, 1, 1.8],
      spin: [{ axis: 'x', deg: 20 }, { axis: 'y', deg: 25 }],
      at: [0.28, 0.92, 0.66],
    },

    /* TUSK, SEGMENT TWO: up and in, hung off segment one's own built outer face
     * so the join is solved from geometry rather than carried as a stale number. */
    {
      name: 'tusk-tip',
      part: 'wedge-13',
      paint: 'tusk',
      kind: 'pair',
      stretch: [1, 1, 1.6],
      spin: [{ axis: 'x', deg: -60 }, { axis: 'y', deg: -15 }],
      on: 'tusk',
    },
  ],

  flag: 'THE SEPARATION FROM THE FROZEN animal-elephant IS THE WHOLE JUDGEMENT HERE, and it '
    + 'is deliberately NOT made on the body — a mammoth and an elephant are the same shape and '
    + 'pretending otherwise would be a lie about both. It is made on three things. THE COAT: '
    + 'box-29, the lion\'s mane ring, worn as a skirt to the ground, which is animal-musk-ox.ts\'s '
    + 'reading of that shape and the same forced number — cut to 0.52 on DEPTH ONLY, because at '
    + 'full size the ring is 1.3612 against box-41\'s 2.3693, a ratio of 1.74 where '
    + 'assembly-assert.ts demands over 3, and cutting x or y would shorten the reach to the '
    + 'ground. THE EARS: box-05, the SMALLEST shape in the ear bank at 0.221 x 0.232, against '
    + 'the elephant\'s own tube-04 flap at 0.359 x 0.619. THE TUSKS: two chained segments, '
    + 'wedge-11 out-down-forward and wedge-13 hung on: "tusk" turned up and in — '
    + 'animal-dall-sheep.ts\'s mechanism, second use. A REAL MAMMOTH\'S TUSKS CURL RIGHT ROUND '
    + 'AND THESE DO NOT: the bank holds no curve, rule 4 bakes a rotation and cannot bend a '
    + 'part, and two chords meeting at an angle is the half a straight shape can say. This is '
    + 'the SEVENTH collection to price that gap. THE TRUNK IS animal-tapir.ts\'s box-18, '
    + 'stretched and dropped 45 degrees; docs/how-the-animals-are-made.md §14 still lists "no '
    + 'trunk" among the missing shapes and that line is now two animals out of date. ONE NUMBER '
    + 'HERE IS THE TEST HARNESS AND NOT THE ANIMAL, so do not tidy it: the tusk is stretched '
    + '1.8x along its own axis and NOT 2.0, because assembly-assert.ts\'s lineage check sorts '
    + 'two point lists by Math.round(n * 1000), and at exactly 2.0 a wedge-11 coordinate lands '
    + 'on a 0.0005 boundary so the two lists order differently and the mesh is reported as "not '
    + 'a copy of wedge-11". Measured on the same geometry: worst mismatch 2.9e-1 at 2.0 and '
    + '1.9e-8 at 1.8. If you drag this tusk to a round number and the suite goes red, that is '
    + 'what happened, and the bug is the comparison. WHAT WAS '
    + 'CUT FOR RULE 9: a domed crown from box-25, the melon idiom, which would have taken this '
    + 'animal to 1036 triangles against the pack\'s 951. It is the first thing to add by hand '
    + 'if something else comes off. NEW PALETTE, UNREVIEWED.',
})
