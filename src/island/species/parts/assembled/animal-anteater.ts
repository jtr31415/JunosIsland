/**
 * The anteater — a CONE where `animal-aardvark.ts` has a TUBE, and that one
 * measurement is the whole separation between them.
 *
 * Africa already holds an aardvark and it is the same animal to a five-year-old:
 * long snout, small eyes, big claws, eats ants. So the separation is made where
 * the two really differ, and both halves are measured:
 *
 *   - **THE SNOUT.** The aardvark's is `tube-07` at 0.65 across and 2.0 along —
 *     a blunt tube, taper 1.000, that does not narrow. This one is `cone-06`, one
 *     of only two records in the whole bank with **taper 0**, a true point: cut
 *     to 0.6 across and 3.0 along it is 0.240 at the face and nothing at the tip,
 *     standing 0.550 clear. A giant anteater's head IS a cone and an aardvark's
 *     is a pipe.
 *   - **THE EARS.** The aardvark wears `box-06`, the bunny's, the tallest in the
 *     bank at 0.913 and standing 0.579 proud. This one wears `box-05`, the
 *     smallest at 0.232, at `animal-cheetah.ts`'s own re-solved burial — 9/16,
 *     which buries 0.130, past §3's 0.125 floor. A 3.9x gap in the one feature
 *     that sits above the outline.
 *   - **THE TAIL.** `box-38`, the parrot's fan — 0.626 x 0.912 x 0.642, the
 *     broadest and flattest tail in the bank — against the aardvark's tapering
 *     beaver paddle. A giant anteater's tail is a banner of hair.
 *
 * The black shoulder wedge is one `plate-11` a side, which no other long-snouted
 * animal in the project carries.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown, front face and card shell. */
const CROWN_Y = 1.43125
const FRONT_Z = 0.625
const CARD_X = 0.635
/** The hull's own centre — where a tail that continues the back roots. */
const HULL_MID_Y = 0.80625

/** 0.6 across, 3.0 along: 0.240 at the face, a point at the tip. */
const SNOUT_STRETCH: [number, number, number] = [0.6, 0.6, 3.0]

export const ANTEATER_ASSEMBLY = defineCreature('animal-anteater', {
  palette: {
    coat: 0x8b7f74,    // UNREVIEWED: the coarse grey-brown of a giant anteater
    belly: 0xd6cbbc,   // UNREVIEWED: the paler underside, and the sclera
    mark: 0x241f1b,    // UNREVIEWED: the black shoulder wedge and the snout tip
    limb: 0x6e6259,    // UNREVIEWED: the digging forelegs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.4375,

  /* Long and low said with the wheelbase, never with the body — `pets.ts`
   * charges keep-out on the bounding box, so a stretched hull cannot walk
   * between two trees. `africa.ts` argues the same for the mongoose. */
  legs: { x: 0.3, z: 0.375 },

  /* An anteater's eyes are famously tiny. The pack's smallest card, and there is
   * nothing under it to reach for. */
  eyes: { part: 'plate-06' },

  /* THE SMALLEST EAR IN THE BANK, at animal-cheetah.ts's own re-solved numbers:
   * the shape's own record is a burial of ZERO at z = 0.573, which is the bee's
   * placement on a hull that is not this one and would stand the whole ear on
   * the front chamfer. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.5625, at: [0.2, CROWN_Y, 0.2] },

  /* THE CONE. See SNOUT_STRETCH and the header. */
  snout: { part: 'cone-06', paint: 'mark', stretch: SNOUT_STRETCH, at: [0, 0.72, FRONT_Z] },

  /* The broadest flat tail in the bank, rooted at the body's own centre rather
   * than at the parrot's high 1.0998, so it continues the line of the back. */
  tail: { part: 'box-38', paint: 'coat', at: [0, HULL_MID_Y, -0.625] },

  extras: [
    /* THE SHOULDER WEDGE — the black stripe over the shoulder is the one marking
     * on the animal, and `plate-11` is the biggest card the bank has for it. */
    {
      name: 'shoulder',
      part: 'plate-11',
      kind: 'pair' as const,
      paint: 'mark',
      at: [CARD_X, 0.86, 0.2] as [number, number, number],
    },
  ],

  flag: 'NO CLAWS, AND DIGGING IS WHAT THIS ANIMAL IS FOR. The `claw` role occurs ZERO times '
    + 'in the bank — the crab\'s, the lion\'s, the tiger\'s and the polar bear\'s pincers and '
    + 'claws are in GLBs in this repo and the generator has never emitted them — and a giant '
    + 'anteater walks on its knuckles because its foreclaws are too long to put down. '
    + 'animal-aardvark.ts records the same absence and animal-mole.ts stands a nose-tip in '
    + 'for them, which is a shape doing a job. Left off here rather than borrowed. THE '
    + 'SEPARATION FROM animal-aardvark IS THREE MEASURED THINGS and they are in the header: a '
    + 'cone (taper 0) against a tube (taper 1), the bank\'s smallest ear against its tallest, '
    + 'and the parrot\'s broad flat fan against the beaver\'s tapering paddle. NEW PALETTE, '
    + 'UNREVIEWED.',
})
