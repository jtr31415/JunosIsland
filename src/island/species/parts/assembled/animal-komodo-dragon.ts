/**
 * The Komodo dragon — a lizard with NO crest and NO ears, and both absences are
 * the design.
 *
 * Four reptiles stand near it and the two that matter are `animal-crocodile` and
 * `animal-iguana`, which are already separated from each other by the COUNT and
 * the SPAN of one shared row of `wedge-06` scutes — five at 1/2 against six at
 * 3/16. A third animal cannot be a third count of the same row. So this one has
 * no row at all, which is also true: a monitor's back is smooth-scaled and
 * unkeeled, and the crocodile's own file argues that a single spine row is the
 * silhouette a child draws for those two. Taking it away is the separation.
 *
 *   - **`box-12`, the widest shell**, which `animal-badger.ts` measured as the
 *     1.250 cube with **two fused lugs on its SIDES**. That finding is normally a
 *     warning — a species on this hull must not add ears or it has four — and
 *     here it is the point: **a monitor lizard has no external ear at all**, so
 *     this is the one hull whose own geometry says the right thing for free.
 *   - **THE FORKED TONGUE, and it is the first in the project.** `wedge-08` is
 *     the caterpillar's tooth — 0.174 x 0.167 x 0.050, 16 triangles, the
 *     smallest solid part in the bank — mirrored, splayed 18 degrees and drawn
 *     out along its own facing. Two pink prongs out of the jaw tip is the one
 *     image everybody has of this animal, and it costs 32 triangles.
 *   - **The jaw is `box-18` at a DIFFERENT ratio to the crocodile's.** That file
 *     stretches the elephant's trunk to 10/16 wide by 5/16 tall — twice as wide
 *     as deep, which is a crocodile. A monitor's head is deep and narrow, so
 *     this is 1.35 x 0.65 x 1: taller than it is wide, on the same shape.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own centre and its flat front face — the cow's and deer's shell. */
const HULL_MID_Y = 0.80625
const FRONT_Z = 0.625
const REAR_Z = -0.625

/** As low as the jaw can sit and stay on flat geometry — `animal-crocodile.ts`'s solve. */
const JAW_Y = 0.72

/** The jaw's own reach: `box-18` is 0.425211 deep at a recorded burial of zero. */
const JAW_TIP_Z = FRONT_Z + 0.425211

export const KOMODO_DRAGON_ASSEMBLY = defineCreature('animal-komodo-dragon', {
  palette: {
    coat: 0x6e6759,    // UNREVIEWED: the dusty grey-brown of an adult monitor
    belly: 0xbdb49c,   // UNREVIEWED: the paler venter, and the sclera
    limb: 0x5b5548,    // UNREVIEWED: the sprawled legs and the jaw
    tongue: 0xd4718a,  // UNREVIEWED: the pink forked tongue — the animal's one colour
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The widest shell, and the one whose fused SIDE LUGS mean this species needs
   * no ear part — which is what a monitor lizard actually has. */
  hull: { part: 'box-12', paint: 'coat' },

  /* A lizard's pale part is the venter only, so 7/16 — below the 0.4808-0.5481
   * zone §7 measured for the pack's mammals, and the reading animal-gecko.ts,
   * animal-crocodile.ts and animal-iguana.ts all make. */
  belly: 0.4375,

  /* THE SPRAWL at this hull's own limit. `box-12` is 1.539484 across, so its
   * side is 0.769742; `box-01` is 0.375 across, so a station at 0.5625 (9/16)
   * puts each leg's outer face at 0.75, one fiftieth inside the body's own
   * footprint. The pack's inside-the-footprint axiom, checked over 23 of 23, at
   * its bound on the widest shell there is. */
  legs: { x: 0.5625, z: 0.4375, paint: 'limb' },

  /* The pack's smallest card. A monitor's eye is a small bead in a heavy head. */
  eyes: { part: 'plate-06' },

  /* THE JAW. The same shape animal-crocodile.ts stretches to twice as wide as it
   * is deep; this is the other way about — 1.35 x 0.65 — because a monitor's
   * head is deep and narrow where a crocodile's is broad and flat. */
  snout: {
    part: 'box-18',
    paint: 'limb',
    stretch: [1.35, 0.65, 1],
    at: [0, JAW_Y, FRONT_Z],
  },

  /* The lion's tail — taper 0.516, the strongest in the bank — continuing the
   * line of the back off the rear plate's centre. A monitor's tail is as long as
   * the rest of it and this is the longest tapering tail there is. */
  tail: { part: 'wedge-15', paint: 'coat', at: [0, HULL_MID_Y, REAR_Z] },

  extras: [
    /* THE FORKED TONGUE. The caterpillar's tooth, the smallest solid shape in
     * the bank, mirrored and splayed 18 degrees off the midline and drawn out
     * 3.2x along its own facing so it reaches clear of the jaw tip. An explicit
     * `at` is required because a spun part faces a diagonal and the builder
     * refuses to guess a hull face for one. */
    {
      name: 'tongue',
      part: 'wedge-08',
      paint: 'tongue',
      kind: 'pair' as const,
      stretch: [0.8, 0.8, 3.2] as [number, number, number],
      spin: [{ axis: 'y' as const, deg: -18 }],
      at: [0.05, 0.66, JAW_TIP_Z - 0.03] as [number, number, number],
    },
  ],

  flag: 'TWO ABSENCES ARE THE DESIGN AND BOTH ARE TRUE OF THE ANIMAL. (1) NO SCUTE ROW. '
    + 'animal-crocodile and animal-iguana are already separated from each other by the count '
    + 'and span of one shared wedge-06 row — five at 1/2 against six at 3/16 — and a third '
    + 'lizard cannot be a third count of the same row. A monitor\'s back is smooth and '
    + 'unkeeled, so it has none, and that is the separation. (2) NO EARS. box-12 is the 1.250 '
    + 'cube with two fused lugs on its SIDES (animal-badger.ts measured it), which normally '
    + 'means a species on this hull must not add an ear or it has four — here it is exactly '
    + 'right, because a monitor lizard has no external ear. WHAT IS NEW: the FORKED TONGUE is '
    + 'the first in the project. wedge-08, the caterpillar\'s tooth and the smallest solid '
    + 'shape in the bank at 16 triangles, mirrored, splayed 18 degrees and drawn out 3.2x '
    + 'along its own facing. THE STRAIN IS THAT DRAW: §3 sanctions a stretch on an EAR or a '
    + 'SNOUT and a tooth is neither, so 3.2 is the dial and it is yours — at 1.0 the tongue is '
    + '0.05 long and invisible, which is why it was taken. THE JAW shares box-18 with the '
    + 'crocodile at the opposite ratio: 1.35 x 0.65 (deep and narrow) against its 1.81 x 0.50 '
    + '(broad and flat). NEW PALETTE, UNREVIEWED.',
})
