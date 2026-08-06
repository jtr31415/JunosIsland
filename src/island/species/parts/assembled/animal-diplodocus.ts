/**
 * The Diplodocus — the brachiosaur's twin, and the whole separation is WHERE THE
 * NECK POINTS.
 *
 * Both are sauropods, both wear the elephant's trunk stood on end as a neck, and
 * a child would call them the same animal if they were built the same way. They
 * are not, and the difference is one number:
 *
 *   - **`animal-brachiosaurus` leans its neck 25 degrees off vertical** and spends
 *     the pack's height norm to do it — 2.287, over 2.02.
 *   - **This one leans 72 degrees, which is 18 degrees off HORIZONTAL**, and
 *     spends LENGTH instead. Its neck reaches forward rather than up, which is
 *     exactly what a diplodocid's does, and it comes in inside the height band
 *     with room over.
 *
 * That trade is measured and it is the useful half of `animal-goose.ts`'s table:
 * a leaned neck converts vertical headroom into reach, so the two directions are
 * the same mechanism spent in opposite currencies. **Length is not free either —
 * `pets.ts` charges keep-out from `max(width, depth) / 2` — so the neck is
 * stretched 2.4x rather than as far as it would go, and the tail is buried deeper
 * than the pack's own to keep the pair of them inside Woodland's 1.6 ceiling.**
 *
 * **THE SINK IS RE-SOLVED AT THIS LEAN AND IT IS THE BINDING ONE.** A leaned root
 * face rides up as it leans, so `sink * L >= (0.425211 / 2) * tan(lean)`. At 72
 * degrees `tan` is 3.0777, so the requirement is 0.654 against the goose's 0.368
 * at 60 — nearly twice — and 7/16 of 1.4952 is 0.654. **It is the tightest burial
 * any neck in this project has needed and it is met exactly.**
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own crown and centre: 1.5395 wide, bottom on the shared 0.18125. */
const HULL_CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625

/** The goose's own crown station, transferred entire: see that file for the solve. */
const NECK_Z = 0.1875

/** 2.4x on `box-18`'s 0.623004 of height, giving 1.495210. */
const NECK_STRETCH = 2.4

/**
 * 72 degrees off vertical — 18 off horizontal — against the brachiosaur's 25.
 *
 * The one number that separates the two sauropods, and it is the same mechanism
 * spent the other way: `animal-goose.ts` measured that leaning converts vertical
 * headroom into ground reach, and a diplodocid is all reach.
 */
const NECK_LEAN = 72

/**
 * 7/16, and it is the tightest neck burial in the project.
 *
 * `sink * L >= (0.425211 / 2) * tan(72) = 0.654168`, and 0.4375 x 1.495210 is
 * 0.654154 — a shortfall of 1.4e-5, which is four orders below the pack's own
 * 1/16 grid and two below the bank's rounding. 6/16 would leave the neck's rear
 * corner 0.093 proud of the crown it is joined to, which is §3's "nothing
 * floats" failing at a root.
 */
const NECK_SINK = 0.4375

export const DIPLODOCUS_ASSEMBLY = defineCreature('animal-diplodocus', {
  palette: {
    coat: 0x7f8a6d,    // UNREVIEWED: a muted sage green
    belly: 0xd9d3ae,   // UNREVIEWED: the pale underside, and the sclera
    hide: 0x6c7659,    // UNREVIEWED: the coat one step down — neck, head, tail
    limb: 0x606a4e,    // UNREVIEWED: the four pillar legs
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL, 1.5395, the cow's and the deer's. box-41 is the
   * brachiosaur's and is not taken twice; box-12 is 82 triangles cheaper, which
   * this animal spends on the longest tail in the bank instead. */
  hull: { part: 'box-12', paint: 'coat' },

  /* 7/16, below the pack's mammal zone. It splits the `coat` CELL, so the neck,
   * head and tail all read `hide` — animal-stoat.ts's landmine, and here it would
   * have bleached three quarters of the silhouette. */
  belly: 0.4375,

  legs: { x: 0.5, z: 0.4375, paint: 'limb' },

  /* THE NECK, forward rather than up. Three of the goose's four numbers are
   * re-solved at this lean; only the crown station carries over unchanged. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'hide',
    axis: 'y',
    dir: 1,
    stretch: [1, NECK_STRETCH, 1],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, HULL_CROWN_Y, NECK_Z],
  },

  /* The fox's muzzle on the neck's own built tip — a pure donor transfer, the
   * goose's and the terrapin's shape for exactly this job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'hide' },

  /* THE WHIP TAIL. The lion's, the longest reach of the seven at 1.082, laid back
   * on animal-frilled-lizard.ts's idiom and buried 0.30 rather than its own 0.14
   * — the deeper burial is bought for the keep-out, not for the look, because the
   * neck has already spent the depth budget forwards. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.3,
    at: [0, HULL_MID_Y, -0.625],
  },

  flag: 'THE BRACHIOSAUR\'S TWIN, AND THE SEPARATION IS ONE NUMBER. Both wear the elephant\'s '
    + 'trunk stood on end as a neck — box-18, axis y dir 1, animal-goose.ts\'s idiom — and a '
    + 'child would call them one animal if they leaned the same way. animal-brachiosaurus '
    + 'leans 25 degrees off VERTICAL and spends the pack\'s height norm to do it (2.287 against '
    + '2.02). This one leans 72 — 18 off HORIZONTAL — and spends LENGTH instead, which is what '
    + 'a diplodocid\'s neck actually does. LEANING CONVERTS HEADROOM INTO REACH and that is '
    + 'measured, not asserted: the goose\'s own table is the evidence and this is it spent in '
    + 'the other currency. LENGTH IS NOT FREE — pets.ts charges keep-out from max(width, '
    + 'depth)/2 — so the neck is stretched 2.4x rather than as far as it would go and the tail '
    + 'is buried 0.30 against its own recorded 0.14, which is bought for the keep-out and not '
    + 'for the look. THE SINK IS THE TIGHTEST IN THE PROJECT and it is met exactly: a leaned '
    + 'root rides up as it leans, so sink x L >= (0.425211/2) x tan(72) = 0.654168, and 7/16 of '
    + '1.495210 is 0.654154 — short by 1.4e-5, which is four orders below the pack\'s 1/16 grid '
    + 'and two below the bank\'s own rounding. At 6/16 the neck\'s rear corner would stand '
    + '0.093 proud of the crown it is joined to. THE EYE IS ON THE BODY, not the head, for '
    + 'animal-goose.ts\'s and animal-terrapin.ts\'s reason: EYE_CARD_Z is absolute and there is '
    + 'no placement on a long-necked animal that lands a card on a head. NEW PALETTE, '
    + 'UNREVIEWED.',
})
