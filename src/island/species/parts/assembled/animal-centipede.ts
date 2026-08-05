/**
 * The centipede — **fourteen legs, which is more than any other species in this
 * project, and the count is the entire design.**
 *
 * A centipede is a long body with a leg on every segment, and one of those two
 * things is buildable here. Length is not: `HullDef.stretch` is `never` and the
 * pack's ten shells run 1.125 to 1.5395 deep. Legs are — `Placement.pair` takes
 * any station, `box-01` costs 44 triangles, and rule 9's ceiling of 951 pays for
 * seven pairs with room for a face. So the whole budget went on legs.
 *
 * Seven pairs at z = +/-0.500, +/-0.3125, +/-0.125 and 0 — every station on the
 * pack's own 1/16 grid, all inside the hull's own footprint, all on the leg row
 * at `HULL_BOTTOM_Y` where `box-01`'s measured 0.408163 burial puts the feet on
 * zero. The row never moves and this species did not move it; it just used it
 * seven times.
 *
 * **NO RINGS, deliberately.** `animal-glow-worm` is five `box-11` hoops on a
 * cube and `animal-worm` two rows down is seven `box-04` ones, so a third ringed
 * tube would be one animal three times. This one has none at all, and what a
 * child counts on it is legs.
 *
 * The forcipules are `wedge-08`/`wedge-09`, the caterpillar's own mouthparts —
 * the only insect jaw in the bank, shared with `animal-ant`.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The leg row, which never moves: `HULL_BOTTOM_Y`, and `box-01`'s own burial. */
const LEG_Y = 0.18125
const LEG_SINK = 0.408163
const LEG_X = 0.29

/** Seven pairs, all on the pack's own 1/16 grid and all inside the footprint. */
const LEG_Z = [0.5, 0.3125, 0.125, 0, -0.125, -0.3125, -0.5] as const

export const CENTIPEDE_ASSEMBLY = defineCreature('animal-centipede', {
  /* NEW AND UNREVIEWED — the first centipede ever built here. Brief §19 is
   * "bright, never scary": a warm chestnut with amber legs, which is what a
   * British Lithobius actually looks like and is friendlier than it sounds. */
  palette: {
    coat: 0x9c5a2c,   // UNREVIEWED: a warm chestnut
    belly: 0xefd7ab,  // UNREVIEWED: the pale underside, and the sclera
    limb: 0xd98f36,   // UNREVIEWED: THE LEGS — amber, so fourteen of them read
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* Every leg is an `extra` below, so the standard row is off. */
  legs: false,

  /* The caterpillar's own card, the smallest in the pack. A centipede's eyes
   * are simple ocelli or absent entirely. */
  eyes: { part: 'plate-06', y: 0.88 },

  /* The bee's and the caterpillar's own antenna, by pure donor transfer. A
   * centipede's are long and forward-waving, which is what this shape is. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE FOURTEEN. Seven mirrored pairs, one shape, one depth, one colour —
     * which is what makes them read as a repeat rather than as fourteen
     * features. Same part and same burial as every other leg in the project. */
    ...LEG_Z.map((z, i) => ({
      name: `leg-${i}`,
      part: 'box-01',
      paint: 'limb',
      kind: 'pair' as const,
      sink: LEG_SINK,
      at: [LEG_X, LEG_Y, z] as [number, number, number],
    })),
    /* THE FORCIPULES. The caterpillar's own mouthparts, mirror-symmetric, on
     * the absolute eye-card plane at the bank's own recorded height. */
    { name: 'jaw', part: 'wedge-08', paint: 'limb', kind: 'pair', at: [0.13, 0.6101, 0.635] },
  ],

  flag: 'A CENTIPEDE IS LONG AND THIS ONE IS A CUBE, so the legs are doing all the work. '
    + '`HullDef.stretch` is `never` — your own ruling, twice, quoted in `hulls.ts` — and '
    + 'the deepest shell the pack drew is 1.3500, so a body four or six times its own width '
    + 'is not sayable at all. Fourteen legs on a cube is the nearest honest thing and it is '
    + 'genuinely the most legs in this project. WHAT WOULD FIX IT is an elongated hull, '
    + 'which is the same commission `animal-stick-insect.ts` is a placeholder for and the '
    + 'same wall `animal-worm.ts` reports. ALSO: THE LEGS DO NOT LENGTHEN TOWARD THE BACK, '
    + 'which a real centipede\'s do — `box-01` is the bank\'s only leg shape and stretching '
    + 'it would make seven different-sized legs out of the one part the whole pack shares '
    + '86 times, which is worse than the flaw. ALSO: NEW PALETTE, UNREVIEWED, and the '
    + 'amber legs are a deliberate contrast against the body so that fourteen of them '
    + 'actually count at tablet distance.',
})
