/**
 * The ladybird — seven spots, and every one of them is a real Kenney card.
 *
 * The spots are `plate-16`, the PIG'S NOSTRIL CARD — a flat radial disc 0.1131
 * across, 2 triangles, the cheapest shape in the bank. Turned a quarter about x
 * it stops facing forward and lies on the back, which is the idiom
 * `animal-whale.ts` established for a blowhole. Stretched to 2.0 it is 0.226
 * across, which is 0.18 of the hull — a seven-spot's own proportion.
 *
 * **WHERE A SPOT CAN GO IS MEASURED, NOT CHOSEN, and it is tighter than it
 * looks.** §8 step 1: `box-03`'s flat top face is only **0.625 square** — the
 * hull is 1.250 across but two thirds of that width is chamfer. So four spots
 * ride the flat top and the other three go on the +x/+y EDGE CHAMFER at its own
 * measured midpoint (0.46875, 0.46875 off the hull centre), turned onto the
 * chamfer's own 45-degree ridge. That is §8's chamfer idiom carrying a MARKING
 * rather than a spike, which is its first use for one.
 *
 * The antennae are `box-05`, the bee's and the caterpillar's own — the SMALLEST
 * shape in the bank at 0.221 x 0.232 — because a ladybird's antennae are short
 * clubs and the butterfly beside it wears the long `cone-01` point.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s top face, and its own flat half-reach: §8 step 1, measured. */
const TOP_Y = 1.43125
/** `CARD_STANDOFF`'s own 0.010 — the daylight the pack gives a flat card. */
const PROUD = 0.01

/**
 * The +x/+y edge chamfer's midpoint, off the hull centre, and its own ridge.
 *
 * (0.625, 0.3125) to (0.3125, 0.625) has midpoint **(0.46875, 0.46875)** — not
 * the (0.5625, 0.5625) you get by assuming a 1.000-wide face, which §8 records
 * as having put a whole row 0.09 out once. The ridge direction is the bisector
 * of the two bevel normals, (0.7071, 0.7071, 0).
 */
const CHAM = 0.46875
const HULL_MID_Y = 0.80625
const CHAM_X = CHAM + 0.7071 * PROUD
const CHAM_Y = HULL_MID_Y + CHAM + 0.7071 * PROUD

/** A spot is 0.226 across at this stretch — 0.18 of the hull, a 7-spot's own. */
const SPOT = 2.0

export const LADYBIRD_ASSEMBLY = defineCreature('animal-ladybird', {
  /* NEW AND UNREVIEWED — the first ladybird ever built here. Brief §19 is
   * "bright, never scary" and this animal is the brightest thing in the
   * collection by a distance. */
  palette: {
    coat: 0xd83a2c,   // UNREVIEWED: THE ANIMAL — the elytra, a warm pillar-box red
    belly: 0x2b2723,  // UNREVIEWED: the dark underside, and the sclera
    mark: 0x1d1a17,   // UNREVIEWED: the spots, near-black
    limb: 0x312c26,   // UNREVIEWED: legs and antennae
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* A beetle's dark part is the venter and the legs. 6/16 is the nearest notch
   * on the pack's own grid below the 0.4808-0.5481 zone §7 measured. */
  belly: 0.375,

  legs: { x: 0.27, z: 0.3125 },

  /* The default oval, sixteen donors' own. A ladybird's eyes are small and
   * unremarkable and the SPOTS are what a child reads. */
  eyes: { part: 'plate-01' },

  /* The bank's smallest shape, and the bee's own. Short clubs, against the
   * butterfly's long point — which is how the two beetles here stay apart. */
  ears: { part: 'box-05', name: 'antenna', paint: 'limb' },

  extras: [
    /* THE SCUTELLAR SPOT — the seventh, on the midline at the front of the
     * elytra, which is where a seven-spot's odd one actually sits. */
    { name: 'spot-mid', part: 'plate-16', paint: 'mark', stretch: [SPOT, 1, SPOT], spin: [{ axis: 'x', deg: -90 }], at: [0, TOP_Y + PROUD, 0.25] },
    /* TWO PAIRS ON THE FLAT TOP, inside its measured +/-0.3125. */
    { name: 'spot-top-a', part: 'plate-16', paint: 'mark', kind: 'pair', stretch: [SPOT, 1, SPOT], spin: [{ axis: 'x', deg: -90 }], at: [0.1875, TOP_Y + PROUD, 0] },
    { name: 'spot-top-b', part: 'plate-16', paint: 'mark', kind: 'pair', stretch: [SPOT, 1, SPOT], spin: [{ axis: 'x', deg: -90 }], at: [0.1875, TOP_Y + PROUD, -0.3125] },
    /* ONE PAIR ON THE EDGE CHAMFER, turned onto its own 45-degree ridge — §8's
     * idiom carrying a marking instead of a spike. */
    { name: 'spot-cham', part: 'plate-16', paint: 'mark', kind: 'pair', stretch: [SPOT, 1, SPOT], spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: -45 }], at: [CHAM_X, CHAM_Y, -0.125] },
    /* The bee's and the caterpillar's own face card, at the bank's own height. */
    { name: 'mouth', part: 'plate-03', paint: 'mark', at: [0, 0.686849, 0.635] },
    /* The sixth leg. See the collection header. */
    { name: 'leg-mid', part: 'box-01', paint: 'limb', kind: 'pair', sink: 0.408163, at: [0.27, 0.18125, 0] },
  ],

  flag: 'THE ELYTRA SEAM AND THE BLACK HEAD CANNOT BE SAID, and they are the two things '
    + 'that are not spots. `animal-firefly.ts` measured this on the same hull and the '
    + 'measurement holds: `Paint.patch` takes ONE number and that number is a HEIGHT, so '
    + 'it paints one level boundary and has no z or x term at all; and `byBand` can only '
    + 'cut where Kenney already cut, which on `box-03` is a single band across all 60 '
    + 'triangles. So the seam down the middle of the wing cases and the white-cheeked '
    + 'black head are unsayable rather than awkward, and no geometry was invented to fake '
    + 'them. ALSO: SEVEN SPOTS IS A CHOICE — Coccinella septempunctata is the British '
    + 'one, and a two-spot or a harlequin is a different count, which is a line in this '
    + 'file rather than a shape. ALSO: SIX LEGS, see the collection header. ALSO: NEW '
    + 'PALETTE, UNREVIEWED — whether that red reads as a ladybird rather than as a red '
    + 'box at tablet distance is a look, and yours.',
})
