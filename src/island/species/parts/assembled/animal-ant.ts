/**
 * The ant — three body sections out of one mass, and the pack's own jaws.
 *
 * **AN ANT IS THREE LUMPS AND RULE 3 ALLOWS ONE.** Head, mesosoma and gaster
 * cannot be three shapes: `CreatureDef` has no plural hull and a feature wearing
 * a hull shape throws by name, because a head box beside a body box is the fault
 * that scrapped 72 animals. So the divisions are drawn with **two `box-04`
 * rings** — the bee's own abdomen shell-ring, worn concentric exactly as its
 * donor wears it — at z = +0.125 and z = -0.375. Two raised bands across a
 * single shell is the nearest honest reading of a three-part body, and it is
 * geometry Kenney drew for an insect in the first place.
 *
 * **A RADIAL RING SUNK 0.5 PUTS ITS CENTRE ON ITS `at`, EXACTLY.** The shift
 * `creature.ts` applies is `-lo - sink x extent`, and for a symmetric shape
 * `lo = -extent/2`, so at `sink: 0.5` the shift is zero. That is why both bands
 * are stated as centres rather than as joins; a station on a body is a place,
 * not a face.
 *
 * **THE JAWS ARE `wedge-08`/`wedge-09`, THE CATERPILLAR'S OWN MOUTHPARTS**, 0.174
 * x 0.167 x 0.050, mirror-symmetric, attaching `z +1` at a burial of zero — and
 * nothing in this repo had ever worn them but `animal-tortoise`. They are the
 * only insect jaw the pack contains.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The hull's own centre — `box-03`'s recorded offset, and where a band rides. */
const HULL_MID_Y = 0.80625

/**
 * The rings are thinned to half, and rule 3 is the reason, measured.
 *
 * `box-04` is 1.335 x 1.335 x 0.456 = **0.8128 against the hull's 1.9531, a
 * ratio of 2.40** — under the 3 `assertAssembly` demands, because a hoop's
 * bounding box is mostly hole. Halved in thickness it is 0.4064 and the ratio is
 * 4.81. The x and y are untouched on purpose: at 1.335 across a 1.250 hull the
 * ring stands **0.0425 proud all the way round**, which is the entire read, and
 * `animal-slow-worm.ts` measured that shrinking it instead takes it INSIDE the
 * hull where nothing can see it.
 */
const BAND_THIN = 0.5

export const ANT_ASSEMBLY = defineCreature('animal-ant', {
  /* NEW AND UNREVIEWED — the first ant ever built here. Brief §19 is "bright,
   * never scary", so a warm red-brown wood ant rather than a black one. */
  palette: {
    coat: 0x8a4a2a,   // UNREVIEWED: the head and mesosoma, a warm red-brown
    belly: 0xd8b48c,  // UNREVIEWED: the pale underside, and the sclera
    gaster: 0x40281a, // UNREVIEWED: the two rings, a dark shade under the coat
    limb: 0x5e3520,   // UNREVIEWED: legs, antennae and jaws
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  belly: 0.375,

  legs: { x: 0.27, z: 0.3125 },

  /* The caterpillar's own card, the SMALLEST in the pack at 0.330 x 0.276. An
   * ant's eyes are small and its antennae do the work; `animal-glow-worm.ts`
   * spends the same pair for the same reason and rule 5 keeps it a real claim. */
  eyes: { part: 'plate-06' },

  /* The bee's and the caterpillar's own antenna, by pure donor transfer. An
   * ant's are elbowed, which cannot be said — see the flag. */
  ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE WAIST, and THE GASTER LINE. Two of the bee's own rings across one
     * shell, at their own diameter and half their own thickness. */
    { name: 'waist', part: 'box-04', paint: 'gaster', stretch: [1, 1, BAND_THIN], sink: 0.5, at: [0, HULL_MID_Y, 0.125] },
    { name: 'gaster', part: 'box-04', paint: 'gaster', stretch: [1, 1, BAND_THIN], sink: 0.5, at: [0, HULL_MID_Y, -0.375] },
    /* THE JAWS. The caterpillar's own mouthparts, mirror-symmetric, at the
     * bank's own recorded height on the absolute eye-card plane. */
    { name: 'jaw', part: 'wedge-08', paint: 'limb', kind: 'pair', at: [0.12, 0.6101, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, 0.18125, 0] },
  ],

  flag: 'THE ELBOWED ANTENNA CANNOT BE SAID, and on an ant it is genuinely diagnostic — '
    + 'the bend is what tells an ant from every other small insect at a glance. Rule 4 as '
    + 'amended bakes a ROTATION into a copy\'s vertices; it turns a part and cannot bend '
    + 'one, and there is no bent or curved shape in any of the bank\'s 100 records. `on` '
    + 'could chain two `cone-01` at an angle, but the second would join the first\'s TIP '
    + 'rather than its mid-length, which is a fork and not an elbow. ALSO: THE THREE-PART '
    + 'BODY IS DRAWN AND NOT BUILT — rule 3 allows one mass, so the head, mesosoma and '
    + 'gaster are two raised rings on a single shell rather than three shapes. That is the '
    + 'strongest constraint on this whole collection and it is the same one that stops a '
    + 'spider having two. ALSO: SIX LEGS, see the collection header. ALSO: NEW PALETTE, '
    + 'UNREVIEWED.',
})
