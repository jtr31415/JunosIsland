/**
 * The emu — `animal-ostrich.ts`'s neck idiom, shorter, on a plain cube, with the
 * separation carried by what this bird HAS NOT GOT.
 *
 * Read the ostrich first: the neck is `box-18`, the elephant's trunk, stood on
 * end with its axis overridden to `y`, buried 6/16, joined at the crown's own
 * flat square at z = 3/16 — `animal-goose.ts`'s four numbers, and none of them
 * is re-derived here. Only the LENGTH and the LEAN are this bird's.
 *
 * **The two big ratites are the hardest separation in this collection and it is
 * made on three measured things, not on colour:**
 *
 *   - **THE SHELL.** The ostrich takes `box-12`, the widest in the pack at
 *     1.5395, because an ostrich's body is a barrel carried high. This one takes
 *     `box-20`, the fish's plain 1.250 cube — 0.29 narrower, and the ONLY
 *     collection-level dial the mechanism offers, since a hull is never scaled.
 *   - **THE NECK STANDS LOWER.** 1.25x at 55 degrees against the ostrich's 1.5x
 *     at 45. An ostrich's neck is a mast; an emu's is shorter, thicker and
 *     carried forward, and the two numbers together are the only place that can
 *     be said.
 *   - **NO WINGS AND NO TAIL, and both are true rather than convenient.** An
 *     emu's wing is a 20cm vestige buried under shaggy plumage, and the ostrich
 *     wears `box-06` at the nine-bird folded idiom precisely because its wing
 *     plumes ARE a silhouette. An emu has no tail fan either, where the ostrich
 *     takes `box-38`. Subtraction is the sharpest separator this bank has.
 *
 * The eye is `plate-08`, the pack's round bird card, on the BODY at the neck's
 * root — the goose's own solve, because `EYE_CARD_Z` is an absolute 0.6350 and
 * rule 5 makes it unsayable on a head 0.8 above that plane.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-20`'s crown — the cube's own 1.43125, shared by nine of the ten hulls. */
const CROWN_Y = 1.43125

/** The goose's neck numbers, transferred entire. See that file for each solve. */
const NECK_Z = 0.1875
const NECK_SINK = 0.375

/**
 * 1.25x and 55 degrees, where the ostrich is 1.5x and 45 and the goose is forced
 * to 1.75x and 60.
 *
 * The ostrich's own file records that at the goose's 1.75x and 45 degrees a big
 * ratite comes out 2.0634 tall, over the pack's 2.02, and shortens to 1.5x to
 * buy the lean back. This bird goes one notch further in both directions on
 * purpose: an emu's neck is shorter than an ostrich's and carried further
 * forward, so 1.25x and 55 degrees is the anatomy AND the headroom, and it is
 * the difference a child would read between the two birds from the side.
 */
const NECK_STRETCH = 1.25
const NECK_LEAN = 55

export const EMU_ASSEMBLY = defineCreature('animal-emu', {
  palette: {
    coat: 0x6d6154,    // UNREVIEWED: the shaggy grey-brown double plumage
    flight: 0x554a40,  // UNREVIEWED: that brown one shade down, for the rump
    skin: 0x4a5a68,    // UNREVIEWED: THE BLUE NECK — bare skin, and an emu's own
    limb: 0x8a7b68,    // UNREVIEWED: the long scaled legs
    eye: 0x7a4326,     // UNREVIEWED: the orange-brown iris
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fish's plain cube. Narrower than the ostrich's box-12 by 0.29, which is
   * the only size difference between two ratites this mechanism can express. */
  hull: { part: 'box-20', paint: 'coat' },

  /* The pack's round bird card, on the body at the neck's root — the goose's own
   * placement, for the goose's own reason. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK. The goose's four numbers; the length and the lean are this bird's,
   * and they are what separate it from the ostrich. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'skin',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* THE HEAD, hung off the neck's own placed tip by `on`. The fox's muzzle,
   * which is the goose's, the terrapin's and the ostrich's choice for this job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'skin' },

  legs: false,
  extras: [
    /* TWO legs on the pack's own row, at `box-01`'s own recorded x and the hull's
     * midline — the only station a biped's legs can be at. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE BILL, off the head's own placed plane. Short, broad and blunt, which
     * is `tube-02` — the chick's and penguin's bar — and not the parrot's point. */
    { name: 'bill', part: 'tube-02', paint: 'limb', on: 'head' },
  ],

  flag: 'THE SEPARATION FROM animal-ostrich IS THE WHOLE JUDGEMENT HERE, so look at the two '
    + 'side by side. It is made on three measured things and none of them is colour: the SHELL '
    + '(box-20, the fish\'s plain 1.250 cube, against the ostrich\'s box-12 at 1.5395 — 0.29 '
    + 'narrower, and the only size dial there is, since a hull is never scaled); the NECK (1.25x '
    + 'at 55 degrees against 1.5x at 45, an emu\'s being shorter, thicker and carried further '
    + 'forward); and SUBTRACTION — no wing and no tail. Those last two are anatomy rather than '
    + 'convenience: an emu\'s wing is a 20cm vestige under shaggy plumage where an ostrich\'s '
    + 'plumes are a silhouette, and an emu has no tail fan where the ostrich takes box-38. THE '
    + 'LEGS ARE THE SAME THING THIS BIRD CANNOT HAVE AS THE OSTRICH: one leg shape, 0.30625 '
    + 'tall, at one absolute height, so this is a tall NECK on a normal body and not a body on '
    + 'stilts. THE EYE IS ON THE BODY at the neck\'s root — EYE_CARD_Z is an absolute 0.635 and '
    + 'rule 5 makes it unsayable on a head 0.8 above that plane, which is animal-goose.ts\'s own '
    + 'flag. NEW PALETTE, UNREVIEWED, and the BLUE NECK is the one to look at: it is real on a '
    + 'bare-skinned emu and it will read oddly beside the ostrich\'s pink. AND IT IS THE '
    + 'LIGHTEST ANIMAL IN THE PROJECT — 278 vertices and 372 triangles against the pack\'s '
    + 'measured 405-1626 and 422-951, which are FLOORS this bird is under. That is subtraction '
    + 'showing up in the budget rather than a fault: an emu with no wing and no tail has seven '
    + 'meshes. animal-dolphin (302/402) and animal-eel (278/410) are already under it and the '
    + 'band reports rather than fails, so it is your call.',
})
