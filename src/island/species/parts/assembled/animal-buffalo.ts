/**
 * The buffalo — the Cape buffalo, and the BOSS is a stand-in.
 *
 * >>> **PLACEHOLDER ON ONE FEATURE, and it is the feature.** A Cape buffalo's
 * >>> horns fuse into a helmet across the forehead — the boss — and then drop
 * >>> and hook back up. Rule 4 as amended BAKES A ROTATION into a copy's
 * >>> vertices; it cannot BEND one, and there is no curved shape among the
 * >>> bank's 100. So the hook is unsayable and what is here instead is a
 * >>> straight pair of `wedge-13` pointing out of the temples plus a flat
 * >>> `bespoke-square-01` bar across the brow standing in for the boss. **What
 * >>> to try first by hand:** a second, shorter pair of `wedge-13` spun up at
 * >>> the outer end of the first — the bank cannot join one part to another's
 * >>> tip except through `on`, which takes the outer FACE, so it is worth
 * >>> seeing whether that lands.
 *
 * Everything else is real. `box-41` is the only shell bigger on all three axes
 * and a Cape buffalo is the biggest thing in this collection; neither
 * `animal-ox` nor `animal-water-buffalo` is on it — both take `box-12` — so the
 * shell alone separates it from the two bovids already built, before the colour
 * does. The horns are the HOG's tusk where those two wear the elephant's, which
 * is the second separation and it is a part choice rather than a number.
 *
 * The nose is `box-24` on `box-41`'s own muzzle boss at z = 0.725 — the boss is
 * geometry this shell already carries and a bovine's slate muzzle pad is what it
 * is for.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT plates, which are `box-03`'s at the same world coordinates. */
const CROWN_Y = 1.43125
const FLANK_PLATE_X = 0.625
const FLANK_PLATE_MID_Y = 0.80625
const REAR_PLATE_Z = -0.625
/** The bounding front — the tiger's muzzle boss, 0.100 proud of the flat plate. */
const BOSS_Z = 0.725

export const BUFFALO_ASSEMBLY = defineCreature('animal-buffalo', {
  palette: {
    coat: 0x3a3330,    // UNREVIEWED: near-black brown, wet with mud
    pale: 0xd6cdbc,    // UNREVIEWED: the horn and the sclera
    mark: 0x6b6055,    // UNREVIEWED: the boss bar, paler than the horn's tips
    limb: 0x2b2523,    // UNREVIEWED: the heavy legs, darker than the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-41' },
  /* No belly line: a Cape buffalo is one colour all over. */
  under: 'pale',

  /* Heavy and wide-standing. */
  legs: { x: 0.34, z: 0.30 },

  /* Drooping under the horns, which is where a Cape buffalo's ears sit. Pinned
   * to the FLAT crown at 1.43125 rather than to `box-41`'s bounding 1.48125 —
   * the goose's §5 warning: that extra 0.05 is two transverse ridges. */
  ears: { part: 'cone-02', paint: 'coat', at: [0.26, CROWN_Y, 0.2] },

  /* The bank's only stub, on the flat rear plate's own centre. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, FLANK_PLATE_MID_Y, REAR_PLATE_Z],
  },

  /* The hog's nose disc as a bovine muzzle pad, on the boss this shell carries. */
  snout: { part: 'box-24', paint: 'limb', stretch: [1.4, 0.8, 1], at: [0, 0.70, BOSS_Z] },

  extras: [
    /* THE HORNS. The hog's tusk turned sideways by `{ y, 90 }` — which takes a
     * `z +1` facing to `x +1`, `animal-ox.ts`'s own first spin — then tipped 15
     * degrees up by `{ z, 15 }`, so it leaves the temple almost level and rises,
     * which is the outer half of a Cape buffalo's sweep. Joined on `box-41`'s
     * FLAT flank plate at x = 0.625, not its bounding 0.675, which is two pads.
     * Stretched 1.5x along its own length: the extent along the facing is then
     * 0.617 and the shape's own 0.390 burial puts 0.240 of that inside the head,
     * nearly twice §3's floor. */
    {
      name: 'horn',
      part: 'wedge-13',
      kind: 'pair' as const,
      paint: 'pale',
      stretch: [1, 1, 1.5] as [number, number, number],
      spin: [{ axis: 'y' as const, deg: 90 }, { axis: 'z' as const, deg: 15 }],
      at: [FLANK_PLATE_X, 1.05, 0.1875] as [number, number, number],
    },

    /* THE BOSS, standing in for a shape the bank has not got. One of JT-041's
     * three base solids, cut flat and wide and half buried in the crown. */
    {
      name: 'boss',
      part: 'bespoke-square-01',
      paint: 'mark',
      stretch: [0.36, 0.09, 0.22] as [number, number, number],
      at: [0, CROWN_Y, 0.1875] as [number, number, number],
    },
  ],

  flag: 'THE BOSS IS A STAND-IN AND THE HOOK IS MISSING — this is the one placeholder in the '
    + 'animal and it is the feature a Cape buffalo is known by. Its horns fuse into a helmet '
    + 'across the forehead and then drop and sweep back up; rule 4 as amended bakes a ROTATION '
    + 'into a copy\'s vertices and cannot BEND one, and not one of the bank\'s 100 shapes is '
    + 'curved along any axis. So what is here is a straight pair of wedge-13 (the HOG\'S tusk, '
    + 'not the elephant\'s, which is what animal-ox and animal-water-buffalo both wear) driven '
    + 'out of the temples by animal-ox.ts\'s own first spin and tipped 15 degrees up, plus a '
    + 'flat bespoke-square-01 bar across the '
    + 'brow standing in for the boss. WHAT TO TRY FIRST BY HAND: a second shorter pair of '
    + 'wedge-13 spun up at the outer end of the first, hung off the horn with `on`. THE SHELL '
    + 'IS THE OTHER SEPARATION and it is real: box-41 is the only hull bigger on all three '
    + 'axes and neither bovid already built is on it. NEW PALETTE, UNREVIEWED.',
})
