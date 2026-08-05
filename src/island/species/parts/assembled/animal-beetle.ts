/**
 * The beetle — a stag beetle, because the jaws are the one thing this bank can
 * say loudly about a beetle.
 *
 * The collection already holds a ladybird and (in Night Time) a firefly, and all
 * three are the same animal underneath: a hard-shelled box on six legs. **So
 * this one is separated on a shape neither of the others has** — `wedge-13` /
 * `wedge-14`, the HOG'S OWN TUSKS, a handed pair 0.260 x 0.323 x 0.411
 * attaching `z +1` at its own 0.390 burial. Worn on the face at the eye-card
 * plane they are a stag beetle's mandibles, which is §3.1 in its purest form:
 * one shape, filed by geometry rather than by Kenney's label, doing a job
 * nobody drew it for.
 *
 * The hull is `box-36`, the PANDA'S cube — geometrically the same 1.250
 * silhouette as `box-03` (same bottom, same front face, same eye plane) for 72
 * triangles against 60. `animal-firefly.ts` took it for the same reason: a small
 * insect is threatened by rule 9's FLOOR rather than its ceiling, and the hull
 * is the one place geometry can be bought without adding a shape to the
 * silhouette.
 *
 * `box-05` antennae — the bank's smallest shape, and a beetle's are short clubs.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-36`'s own recorded centre — the same point seven other pack hulls use. */
const HULL_MID_Y = 0.80625

export const BEETLE_ASSEMBLY = defineCreature('animal-beetle', {
  /* NEW AND UNREVIEWED — the first beetle ever built here. Brief §19 is
   * "bright, never scary", so a glossy chestnut rather than a beetle black, and
   * jaws the same colour as the shell so they read as armour and not as teeth. */
  palette: {
    coat: 0x6b3b1e,   // UNREVIEWED: the elytra, a glossy warm chestnut
    belly: 0xe0c9a6,  // UNREVIEWED: the pale underside, and the sclera
    horn: 0x8f5a2c,   // UNREVIEWED: THE JAWS — a lighter shade, so they read
    limb: 0x4a2814,   // UNREVIEWED: legs and antennae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube: the same silhouette as the default for 12 more triangles,
   * bought because a small insect runs at rule 9's floor rather than its top. */
  hull: 'box-36',

  belly: 0.375,

  legs: { x: 0.27, z: 0.3125 },

  eyes: { part: 'plate-01' },

  /* The bank's smallest shape, the bee's and the caterpillar's own — short
   * clubs, which is what a beetle has and what separates it from the
   * butterfly's long `cone-01` point. */
  ears: { part: 'box-05', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE MANDIBLES. The hog's own tusks, handed, worn forward off the face at
     * the eye-card plane and swept up 20 degrees so they read as jaws held open
     * rather than as tusks pointing out of a snout. */
    { name: 'jaw', part: 'wedge-13', paint: 'horn', kind: 'pair', spin: [{ axis: 'x', deg: -20 }], sink: 0.39, at: [0.16, 0.72, 0.625] },
    /* The bee's own face card, at the bank's own recorded height. */
    { name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, 0.635] },
    /* A single raised shell line across the back, where the elytra meet the
     * thorax. `box-04` at its own diameter and half its thickness — the ant's
     * own measurement, reused rather than re-derived. */
    { name: 'shell-line', part: 'box-04', paint: 'limb', stretch: [1, 1, 0.5], sink: 0.5, at: [0, HULL_MID_Y, 0.3125] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, 0.18125, 0] },
  ],

  flag: 'THE ELYTRA SEAM CANNOT BE SAID and on a beetle it is the back: two hard wing '
    + 'cases meeting down the middle. `animal-firefly.ts` measured this and the '
    + 'measurement is the same here — `Paint.patch` takes one number and that number is a '
    + 'HEIGHT, so it paints one level boundary with no z or x term, and `byBand` can only '
    + 'cut where Kenney already cut. So the seam is unsayable rather than awkward. ALSO: '
    + 'THIS IS A STAG BEETLE BY CHOICE, not by measurement. "Beetle" is a quarter of all '
    + 'animals on earth and the roster does not say which one; the jaws were picked '
    + 'because they are the only beetle feature this bank can state loudly, and a different '
    + 'beetle is a different file rather than a different shape. ALSO: SIX LEGS, see the '
    + 'collection header. ALSO: NEW PALETTE, UNREVIEWED.',
})
