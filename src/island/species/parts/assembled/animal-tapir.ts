/**
 * The tapir — a short trunk and a white saddle, and both are parts the pack drew
 * for exactly those jobs on other animals.
 *
 *   - **THE TRUNK IS `box-18`, WHICH KENNEY DREW AS THE ELEPHANT'S TRUNK** and
 *     the bank files under `tail`. §3.1 is the whole point of that: a shape is
 *     named for what it IS. Cut to 0.72 across and 0.55 tall and stretched 1.25
 *     along, it is a narrow mobile snout standing 0.531 clear of the face — half
 *     the reach `animal-crocodile.ts` spends on the same shape at the opposite
 *     ratio, and a tapir's trunk IS a short elephant's.
 *   - **THE SADDLE IS `box-35`, THE PANDA'S RUMP SHELL** — the one band in the
 *     bank that joins on the REAR (`z -1`), and the panda wears it as exactly
 *     this: a pale block over the back half of the animal. Cut to 0.45 of its
 *     depth it is a narrow white band standing 0.0465 proud all the way round the
 *     rump, which is a Malayan tapir and nothing else in the project.
 *   - **THE EARS ARE `box-16`, THE ELEPHANT'S**, and nothing in the project had
 *     spent it. It is a `z +1` ear and is mounted here on the crown with
 *     `axis: 'y'`, buried 0.4 so 0.204 stands proud; §8 step 4 puts the outer
 *     corner at 0.352 against an embedded bound of 0.4485, so nothing floats.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown and front face. */
const CROWN_Y = 1.43125
const FRONT_Z = 0.625

/** 0.72 across, 0.55 tall, 1.25 along: a narrow trunk out of a broad stub. */
const TRUNK_STRETCH: [number, number, number] = [0.72, 0.55, 1.25]

export const TAPIR_ASSEMBLY = defineCreature('animal-tapir', {
  palette: {
    coat: 0x2b2a2c,    // UNREVIEWED: the near-black front and hind quarters
    saddle: 0xe6e2d6,  // UNREVIEWED: the white band, and the sclera
    limb: 0x1e1d1f,    // UNREVIEWED: the short heavy legs
    mark: 0x4a4548,    // UNREVIEWED: the trunk and the nose, a shade off black
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No belly line at all: a Malayan tapir's boundary runs the WRONG WAY for
   * `Paint.patch`, which takes a height and paints everything below it. The
   * band below is a real part instead, and it is the panda's own. */
  under: 'saddle',

  /* Stocky and short-legged. */
  legs: { x: 0.32, z: 0.3 },

  /* THE EARS. See the header — the elephant's, unspent until now, remounted. */
  ears: {
    part: 'box-16',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    sink: 0.4,
    at: [0.2, CROWN_Y, 0.18],
  },

  /* THE TRUNK. Joined at the front face at its own recorded burial of ZERO, so
   * every millimetre of it is outside the body, and hung at 0.75, which keeps the
   * whole of a 0.343-tall part inside the flat front face's 0.49375-1.11875. */
  snout: { part: 'box-18', paint: 'mark', stretch: TRUNK_STRETCH, at: [0, 0.75, FRONT_Z] },

  /* The bunny's small nose-tip on the trunk's placed front plane — 0.182 wide
   * against the trunk's 0.248, so it is backed everywhere. */
  nose: { part: 'box-09', paint: 'mark' },

  extras: [
    /* THE SADDLE. A pure donor transfer on the rear face at the shape's own
     * burial of 1.000, so the band is fully buried along its own axis and shows
     * only where it is WIDER than the hull — 1.343 against 1.250, which is 0.0465
     * of white rim all the way round. Cut to 0.45 deep so it reads as a band
     * rather than as a second body. */
    {
      name: 'saddle',
      part: 'box-35',
      paint: 'saddle',
      stretch: [1, 1, 0.45] as [number, number, number],
    },
  ],

  flag: 'THE WHITE SADDLE IS A BAND AND NOT A PAINTED LINE, and that is forced rather than '
    + 'chosen: `Paint.patch` takes ONE number and that number is a HEIGHT, so it can say '
    + '"pale below" and cannot say "pale in the middle" — which is exactly what a Malayan '
    + 'tapir is. box-35, the panda\'s own rump shell, is the honest answer: the pack drew it '
    + 'as a pale block over the back half of an animal, it joins on the REAR, and cut to 0.45 '
    + 'deep it stands 0.0465 proud all the way round. It is a narrower band than the real '
    + 'animal\'s and it has a hard edge where a tapir\'s is soft. NO TAIL: a tapir\'s is a '
    + 'stub you cannot see, and leaving it off is what stops this reading as one more pig. '
    + 'NEW PALETTE, UNREVIEWED.',
})
