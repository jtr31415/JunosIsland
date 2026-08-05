/**
 * The white rhino — the biggest shell in the pack, and the only nose horn in the
 * project.
 *
 * ONE SPECIES, ONE FILE. `register.ts` says why the one appended line in
 * `index.ts` is the whole of the wiring.
 *
 * **The horn is the animal and there is no horn shape in the bank**, so it is
 * `cone-01` — the bee's and the caterpillar's ear, taper 0.000, the only shape
 * in the hundred that comes to a POINT — stretched and stood on the front of the
 * crown at 45 degrees, twice, big then small. That is the pack's own spike doing
 * §3.1's job: a part's identity is its placement and its count.
 *
 * **The lip is the species mark and it is a lifted part, not a marking.** A
 * white rhino is the SQUARE-lipped rhino; `box-24`, the hog's nose disc, cut 1.5
 * wide and 0.85 tall, is a flat broad mouth on the tiger boss `box-41` already
 * carries. `animal-buffalo.ts` and `animal-musk-ox.ts` use the same disc as a
 * bovine muzzle pad; here it is wider than it is tall, which is the whole word
 * "square".
 *
 * **Against the FROZEN `animal-elephant`**: no trunk, no ear flap — the ears are
 * `tube-04` STOOD UP as short tubes, which is what a rhino's are and what an
 * elephant's are not. **Against `animal-hippo`**, which holds the widest shell
 * and the widest muzzle: this one is on `box-41`, the biggest, and the hippo has
 * nothing on its head at all.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * `box-41`'s FLAT plates, not its bounding box. `animal-goose.ts` measured all
 * three and the warning is its: the crown bounds at 1.48125 and is flat to
 * 1.43125, the front bounds at 0.725 (the tiger's muzzle boss) and is flat to
 * 0.625, the flank bounds at 0.675 and is flat to 0.625. Nothing solved off
 * `size` lands.
 */
const CROWN_Y = 1.43125
const BOSS_Z = 0.725
const REAR_PLATE_Z = -0.625

/** The rear plate's own centre — the same square on all ten hulls (`animal-hare.ts`). */
const REAR_PLATE_Y = 0.80625

export const WHITE_RHINO_ASSEMBLY = defineCreature('animal-white-rhino', {
  palette: {
    coat: 0x8f8d87,    // UNREVIEWED: dust-grey, which is what "white" rhino actually is
    pale: 0xd7d0bf,    // UNREVIEWED: the two horns, and the sclera
    mark: 0x4b4740,    // UNREVIEWED: the square lip
    limb: 0x77746e,    // UNREVIEWED: the heavy legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only hull bigger on all three axes. No belly line: a rhino is one grey
   * from spine to sole, so the pale slot is named for the sclera and the horns. */
  hull: { part: 'box-41' },
  under: 'pale',

  /* Wide and planted, at `animal-buffalo.ts`'s stations on this same shell. */
  legs: { x: 0.34, z: 0.30 },

  /* 17/16, and it is the boss that sets it: `animal-goose.ts` measured the
   * tiger's muzzle boss standing 0.100 proud over |x| <= 0.200, y 0.494-0.894.
   * `plate-01` is 0.320 tall, so at 1.0625 its bottom edge is 0.9025 and clears
   * the boss's top by 0.0085 — the pack's own daylight, near enough. */
  eyes: { y: 1.0625 },

  /* THE SQUARE LIP. Joined on the BOSS's own front plane rather than the flat
   * plate behind it, so the disc reads as the end of a heavy muzzle instead of a
   * pad stuck to a cheek. 0.600 across a 0.625 plate, 0.340 tall. */
  snout: { part: 'box-24', paint: 'mark', stretch: [1.5, 0.85, 1], at: [0, 0.66, BOSS_Z] },

  /* The elephant's side flap STOOD ON END, `animal-llama.ts`'s remount of the
   * same shape — `axis: 'y'` overrides its recorded `x +1` so it rises off the
   * crown. Cut to three quarters: a rhino's ear is a short tube, not a banana. */
  ears: {
    part: 'tube-04',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    stretch: [0.9, 0.75, 0.9],
    sink: 0.3,
    at: [0.28, CROWN_Y, -0.125],
  },

  /* The bank's only stub, on the flat rear plate's own centre. */
  tail: {
    part: 'box-18',
    paint: 'coat',
    spin: [{ axis: 'y', deg: 180 }],
    at: [0, REAR_PLATE_Y, REAR_PLATE_Z],
  },

  extras: [
    /* THE NASAL HORN. `cone-01` is the one shape in the bank with taper 0.000 —
     * it ends in a point where every other candidate ends in a face — and it is
     * stretched 1.6 x 1.9 x 1.6, which is inside the pack's own 2.97x ear range
     * on all three axes. Spun 45 on x so it rises out of the crown's front edge
     * and leans forward over the muzzle: rule 3 fuses head and body, so there is
     * no nose to stand it on and the crown's front IS the nose. */
    {
      name: 'horn',
      part: 'cone-01',
      paint: 'pale',
      stretch: [1.6, 1.9, 1.6],
      spin: [{ axis: 'x', deg: 45 }],
      sink: 0.4,
      at: [0, CROWN_Y - 0.0625, 0.28125],
    },

    /* THE SECOND HORN, behind and smaller — a white rhino has two and the rear
     * one is a third the size. Same shape, same idiom, less of both. */
    {
      name: 'horn-rear',
      part: 'cone-01',
      paint: 'pale',
      stretch: [1.2, 1.0, 1.2],
      spin: [{ axis: 'x', deg: 30 }],
      sink: 0.4,
      at: [0, CROWN_Y, 0.0625],
    },
  ],

  motion: [{ kind: 'twitch', parts: ['ear'] }],
})
