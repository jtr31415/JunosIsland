/**
 * The octopus — eight arms, and the answer to "the pack has no tentacle" is that
 * it has EIGHT of them and calls them something else.
 *
 * The arm is `box-18`, the ELEPHANT'S TRUNK, re-axised to `y -1` so it hangs
 * instead of reaching forward, and stretched along its own facing. That is the
 * same shape `animal-goose.ts` stands on end as a neck and `animal-tortoise.ts`
 * wears backwards as a stub tail — §3.1's multiplier paying out for a third
 * time, and a trunk is the one thing in this bank that is already a boneless
 * tapering limb.
 *
 * The eight sit on the odd multiples of 22.5 degrees and each is its OWN
 * feature rather than half of a mirrored pair — see `BEARINGS`, where that is
 * a measurement and not a preference. Each is tilted 25 degrees off vertical
 * and then turned to its bearing, so the eight splay rather than hang; an
 * octopus with parallel arms reads as a mop.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** Where an arm joins, on the hull's own bottom plane. */
const ARM_Y = 0.18125

/**
 * EIGHT SINGLES, NOT FOUR MIRRORED PAIRS — and the arm is THINNED, which is the
 * part of this file most likely to be "tidied" back into a bug.
 *
 * Two things were learned the hard way here and both are worth writing down,
 * because the next radial animal will hit them.
 *
 * **1. A MIRRORED COPY OF A TWICE-SPUN PART DOES NOT INVERT.** The first draft
 * used `kind: 'pair'` four times and `assembly-engine.test.ts` refused it.
 * Measured on the built model by un-spinning each arm's own vertices and
 * comparing the bounding box against the bank's:
 *
 *       arm-bow-r    ratio 1.0000  1.2000  1.0000   <- the declared stretch, exactly
 *       arm-bow-l    ratio 1.2852  1.3016  0.9819
 *       arm-aft-l    ratio 2.2139  0.8904  0.9819
 *
 * Every starboard copy inverted perfectly and every mirrored one did not.
 * `assembly-assert.ts:294` un-mirrors before it un-spins, on the stated ground
 * that the kit builds `M . R . v`, and for a two-spin composition that does not
 * recover the shape. A radial ring is not a mirrored pair in the first place —
 * `animal-starfish` places its five arms as singles for the same reason — so
 * each arm here is its own feature and none is mirrored.
 *
 * **2. AN x/z STRETCH OF EXACTLY 1.0 IS WHAT ACTUALLY BROKE IT.** Singles alone
 * did not fix it: `arm-0` still failed at `stretch: [1, 1.2, 1]`, with ANY spin
 * and with none of the four tilts tried. Bisected against the real harness
 * rather than a model of it:
 *
 *       stretch [1,   1.2, 1  ] + any spin   FAILS
 *       stretch [1,   1.2, 1  ] + no spin    passes
 *       stretch [0.8, 1.2, 0.8] + both spins passes
 *
 * So the trigger is an unstretched axis under rotation, and thinning the arm to
 * 0.8 is what makes it recoverable. **Do not "simplify" that 0.8 back to 1.** A
 * thinner arm is also the better octopus, which is why this is a fix and not a
 * workaround, but the number is load-bearing either way.
 *
 * `at` is the bearing resolved onto the hull's bottom plane at radius 0.45, and
 * `deg` is the y-spin that carries the tilt round to it: the `{ z: 25 }` tilt
 * points the arm at bearing 90, so reaching bearing A is a turn of A - 90.
 */
const ARM_R = 0.45
const BEARINGS: readonly number[] = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]

const ARMS = BEARINGS.map((a, i) => {
  const rad = (a * Math.PI) / 180
  return {
    name: `arm-${i}`,
    deg: a - 90,
    at: [ARM_R * Math.sin(rad), ARM_Y, ARM_R * Math.cos(rad)] as const,
  }
})

/** Every arm is this shape; only the bearing changes. */
const ARM = {
  part: 'box-18',
  paint: 'arm' as const,
  axis: 'y' as const,
  dir: -1 as const,
  stretch: [0.8, 1.2, 0.8] as const,
  sink: 0.2,
}

export const OCTOPUS_ASSEMBLY = defineCreature('animal-octopus', {
  palette: {
    coat: 0xa8523f,
    belly: 0xf0c9ae,
    arm: 0x93452f,
    sucker: 0xf3d8c4,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-08', y: 1.05 },

  extras: [
    /* Eight singles on eight bearings — see `BEARINGS` for why not four pairs. */
    ...ARMS.map(a => ({
      ...ARM,
      name: a.name,
      spin: [{ axis: 'z' as const, deg: 25 }, { axis: 'y' as const, deg: a.deg }],
      at: a.at,
    })),
    { name: 'mouth', part: 'plate-03', paint: 'arm', at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first octopus ever built and the first colours '
    + 'ever proposed for it. THE ARM IS THE ELEPHANT\'S TRUNK box-18, re-axised to hang '
    + 'and stretched along its own facing, because the bank has no tentacle and a trunk '
    + 'is the only boneless tapering limb in it. Two things are yours to judge: whether '
    + 'eight trunks read as an octopus or as an animal wearing eight trunks, and the '
    + 'SPLAY, which is 25 degrees — the arms hang nearly straight and a real octopus '
    + 'curls. There is no curve in this bank, so a curled arm is not available at any '
    + 'price; a wider splay is one number.',
})
