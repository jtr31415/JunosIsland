/**
 * The pangolin — the only mammal with scales, and the scale is a PLATE rather
 * than a point, which is what keeps it off the hedgehog's silhouette.
 *
 * Four species already spend §8's repeat-and-sink and every one of them uses
 * `cone-01`, the bank's true point: `animal-hedgehog` (twenty, all three rows),
 * `animal-porcupine` (top and chamfer only), `animal-echidna` (fifteen, sparse)
 * and `animal-warthog` (one row of bristles). A pangolin is not spiny, it is
 * ARMOURED, so this one takes a different shape entirely:
 *
 *   - **`wedge-04`, THE BUNNY'S TOOTH AND THE CHICK'S EAR** — 0.304 x 0.341 x
 *     0.299, taper 0.605 against `cone-01`'s 0. It is a broad blunt plate, not a
 *     spike, and §3.1 is the whole argument for reaching for it: a shape is
 *     named for what it is, and eleven species already wear this one as an ear,
 *     a cheek and a tooth. Fifteen of them — three on the flat top, three on
 *     each chamfer, three on each flank — is a shell of overlapping plates.
 *   - **NO EARS AT ALL**, which is a fact about pangolins and the same kind of
 *     subtraction `animal-beluga.ts` makes.
 *   - **`box-31`, the lion's shallow shell**, because a pangolin walks low with
 *     its back arched, and `animal-echidna.ts` already argues that this is the
 *     lowest thing in the bank that still has legs.
 *
 * The tail is `box-38` laid FLAT by the cetaceans' own `{ z, 90 }` spin — broad,
 * heavy and dragging, which is what a pangolin's is. It is painted as scale and
 * it is NOT scaled, which the flag says out loud.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s own centre height and its rear face. */
const HULL_MID_Y = 0.80625
const REAR_Z = -0.625

export const PANGOLIN_ASSEMBLY = defineCreature('animal-pangolin', {
  palette: {
    coat: 0x6b5a44,    // UNREVIEWED: the bare skin between and under the scales
    belly: 0xd9c6a8,   // UNREVIEWED: the soft pale underside, and the sclera
    scale: 0xa8895c,   // UNREVIEWED: warm horn brown — fifteen plates and the tail
    limb: 0x5c4c3a,    // UNREVIEWED: the short digging legs and the snout
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shallow shell — 1.125 deep, the lowest thing in the bank that
   * still has legs. animal-echidna.ts's finding, on the animal it also fits. */
  hull: { part: 'box-31', paint: 'coat' },
  belly: 0.4375,

  /* Wide and short, a digging animal's stance. */
  legs: { x: 0.4, z: 0.32 },

  /* The bank's smallest card — a pangolin's eyes are tiny and half shut. */
  eyes: { part: 'plate-06' },

  /* The giraffe's nose-tip by pure donor transfer: short, blunt and conical,
   * against animal-echidna.ts's tube-03 at 0.532 of reach on the same shell.
   * A pangolin's snout is stubby where an echidna's is a straight rigid tube. */
  snout: { part: 'tube-07', paint: 'limb' },

  /* THE SCALES. Fifteen wedge-04 across all three row kinds — the plate family,
   * not the point family. Span 4/16, well inside §3's nothing-floats bound for
   * a shape buried its own 0.651. */
  ridge: {
    part: 'wedge-04',
    paint: 'scale',
    name: 'scale',
    count: 3,
    span: 0.25,
  },

  /* THE TAIL, LAID FLAT. The parrot's fan spun a quarter turn about z — the
   * fluke idiom every cetacean here uses — so it is 0.912 broad and 0.626 deep
   * rather than standing on edge. Hung at the body's own centre so it continues
   * the line of the back and drags. */
  tail: { part: 'box-38', paint: 'scale', spin: [{ axis: 'z', deg: 90 }], at: [0, HULL_MID_Y, REAR_Z] },

  flag: 'THE TAIL IS NOT SCALED AND ON a REAL PANGOLIN IT IS THE MOST SCALED PART OF ALL. A '
    + 'tail is ONE mesh here, byBand can only cut where Kenney already cut, and box-38 carries '
    + 'no band that runs across it — so the tail is painted the scale colour and the plates '
    + 'stop at the hull. WHAT TO TRY BY HAND: a short second ridge is not available (a species '
    + 'has one `ridge`), so it would be three or four wedge-04 as individual extras hung along '
    + 'the tail with `on`, each one anchored off the last. THE SCALE IS wedge-04 AND NOT '
    + 'cone-01, which is the whole separation from animal-hedgehog, animal-porcupine and '
    + 'animal-echidna: taper 0.605 against taper 0, a broad blunt plate against a true point. '
    + 'If it still reads as a hedgehog to you, the dial is the burial — deeper is more armoured '
    + 'and less spiky. IT HAS NO EARS, deliberately. THE OTHER MISSING THING IS THE POSE: a '
    + 'pangolin walks on its hind legs with its front claws curled up, and the leg row is four '
    + 'copies of one shape at one height, so it cannot. NEW PALETTE, UNREVIEWED.',
})
