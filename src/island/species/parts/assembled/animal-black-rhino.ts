/**
 * The black rhino — two horns in a line down the nose, and the hooked lip it is
 * actually named for.
 *
 * "Black" is not a colour a child can see on this animal; both African rhinos
 * are grey, and the real name is the **hook-lipped rhino**. So the build spends
 * itself on the two things a five-year-old would draw:
 *
 *   - **TWO HORNS, ON THE NOSE, IN LINE.** `wedge-11` — the elephant's tusk —
 *     stood on end by `{ x, -90 }`, which is `animal-warthog.ts`'s own idiom.
 *     Nothing else in the project puts a horn on the NOSE: the warthog's tusks
 *     and the buffalo's, the goat's and the ox's all come off the crown or the
 *     temples. Both join well inside the hull and emerge through the front-top
 *     chamfer, which on a one-mass animal is where a nose is.
 *   - **THE HOOK.** `wedge-10`, the dog's and monkey's nose-tip, turned 30
 *     degrees DOWN off the muzzle pad with `on: 'snout'`, so the lip travels
 *     with the pad rather than with a coordinate.
 *
 * `box-41` is the biggest shell in the bank and this is the second-largest land
 * animal in the world; `animal-sumatran-rhino` in this same collection takes the
 * plain 1.250 cube for the opposite reason, and the two shells ARE the
 * separation between them.
 *
 * The front horn is stretched 2.4x along its own long axis — the largest stretch
 * in this collection — and it is still straight, which is the collection's
 * standing CURVE commission and is named in the flag.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT plates, which are `box-03`'s at the same world coordinates. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625
const REAR_PLATE_Z = -0.625
/** The bounding front — the tiger's muzzle boss, 0.100 proud of the flat plate. */
const BOSS_Z = 0.725

/**
 * The front horn, along `wedge-11`'s own longest axis (z, 0.445163) before the
 * spin stands it up. 2.4x is 1.0685 of reach, which puts its tip 0.286 clear of
 * the crown — a black rhino's front horn is the tallest thing on it.
 *
 * §3 measured the pack stretching its own snouts 2.90x and its ears 2.97x, and
 * `animal-narwhal.ts` took this same shape to 3.2x for a tusk, so the amount is
 * inside what has already been shown to hold. It is named in the flag anyway.
 */
const FRONT_HORN: [number, number, number] = [1, 1, 2.4]
/** The rear horn, half the front one's reach, which is the real proportion. */
const REAR_HORN: [number, number, number] = [1, 1, 1.2]

export const BLACK_RHINO_ASSEMBLY = defineCreature('animal-black-rhino', {
  palette: {
    coat: 0x6f6b67,    // UNREVIEWED: dry hide grey — a rhino is the colour of its mud
    horn: 0xd6cdbb,    // UNREVIEWED: the two horns, and the sclera
    lip: 0x4e4a47,     // UNREVIEWED: the hooked upper lip, darker than the hide
    limb: 0x5a5652,    // UNREVIEWED: the heavy legs and the muzzle pad
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The biggest shell in the bank. No belly line: a rhino is one colour from
   * chin to tail, and `under` has to be named or the sclera goes grey on grey. */
  hull: { part: 'box-41' },
  under: 'horn',

  /* Heavy and wide-standing, `animal-buffalo.ts`'s own stance on this shell. */
  legs: { x: 0.34, z: 0.30 },

  /* THE EARS, and they are the one part here that is remounted rather than
   * transferred. `tube-04` is the elephant's ear and its attachment is `x +1`,
   * so a donor transfer hangs it off the side of the head as a flap; a rhino's
   * ears are upright tubes. `axis: 'y'` stands it on the crown —
   * `animal-ocelot.ts`'s remount — and the burial is re-solved to 0.35, which
   * leaves 0.402 of the tube standing clear. */
  ears: { part: 'tube-04', paint: 'coat', axis: 'y', dir: 1, sink: 0.35, at: [0.24, CROWN_Y, -0.05] },

  /* The hog's nose disc as a muzzle pad, on the boss this shell already carries
   * — `animal-buffalo.ts`'s finding, at a squarer cut. */
  snout: { part: 'box-24', paint: 'limb', stretch: [1.1, 0.9, 1], at: [0, 0.68, BOSS_Z] },

  /* THE HOOK. Turned 30 degrees down so it reaches over the front of the pad,
   * and anchored `on: 'snout'` so it cannot come adrift of the pad it hangs on. */
  nose: { part: 'wedge-10', paint: 'lip', spin: [{ axis: 'x', deg: 30 }], on: 'snout' },

  /* The bank's only stub, turned to face backwards at the rear plate's centre. */
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y', deg: 180 }], at: [0, HULL_MID_Y, REAR_PLATE_Z] },

  extras: [
    /* THE FRONT HORN. Stood on end by animal-warthog.ts's own spin and joined
     * at [0, 1.05, 0.52] — a point 0.17 inside the front-top chamfer, so the
     * base is embedded and the horn breaks the surface on the nose rather than
     * on the crown. That station is what makes this a rhino and not a goat. */
    {
      name: 'horn-front',
      part: 'wedge-11',
      paint: 'horn',
      stretch: FRONT_HORN,
      spin: [{ axis: 'x', deg: -90 }],
      at: [0, 1.05, 0.52],
    },

    /* THE REAR HORN, shorter and further back up the same line. */
    {
      name: 'horn-rear',
      part: 'wedge-11',
      paint: 'horn',
      stretch: REAR_HORN,
      spin: [{ axis: 'x', deg: -90 }],
      at: [0, 1.18, 0.24],
    },
  ],

  flag: 'THE HORNS ARE STRAIGHT AND A RHINO\'S FRONT HORN CURVES — that is the one thing '
    + 'wrong with this animal and it is the collection\'s standing CURVE commission, priced '
    + 'before now by Ocean\'s seahorse, Birds\' flamingo, Ice\'s Dall ram and narwhal and '
    + 'Outback\'s lyrebird. Rule 4 as amended bakes a ROTATION into a copy\'s vertices and '
    + 'cannot BEND one, and all 100 baked shapes are straight or tapered along a single axis. '
    + 'It ships anyway, unlike Ice\'s Dall sheep, because a rhino still reads as a rhino with '
    + 'two straight spikes on its nose and a ram does not read at all without its curl. THE '
    + 'FRONT HORN IS STRETCHED 2.4x along wedge-11\'s own long axis, which is the largest '
    + 'stretch in this collection; animal-narwhal.ts took the same shape to 3.2x and section 3 '
    + 'measured the pack stretching its own snouts 2.90x, so it is inside what has been shown '
    + 'to hold — said out loud rather than hidden. THE EARS ARE REMOUNTED, NOT TRANSFERRED: '
    + 'tube-04 is the elephant\'s ear at `x +1` and a donor transfer hangs it off the side of '
    + 'the head, so axis is overridden to y and the burial re-solved to 0.35. THERE ARE THREE '
    + 'RHINOS IN THE TREE NOW and two of them are on this shell: animal-white-rhino landed in '
    + 'a sibling collection while this was being built and it is box-41 with the same remounted '
    + 'tube-04 ears and the same box-24 pad. That is honest — the two African rhinos ARE alike '
    + 'and the real difference is the LIP — so the separation is made where the animals make '
    + 'it: a SQUARE lip there (box-24 stretched 1.5x wide) against a HOOKED one here (wedge-10 '
    + 'turned 30 degrees down off the pad), and cone-01 horns there against wedge-11 here. '
    + 'AGAINST animal-sumatran-rhino, the other twin: box-41 against the plain cube, one long '
    + 'horn against two short ones, bare hide against hair, and no skin fold. NEW PALETTE, '
    + 'UNREVIEWED.',
})
