/**
 * The T-Rex — the biggest thing in the collection, on the pack's tallest shell.
 *
 * **Three theropods stand on two legs in this collection and the separation is
 * the SHELL first and the jaw second.** This one takes `box-21`, the fox's — the
 * tallest hull in the bank at 1.5051 and the only one over 1.4 — because a
 * tyrannosaur's read is a deep chest carried high. The allosaur and the
 * carnotaur are both on the 1.250 cube for that reason and no other.
 *
 * **THE JAW IS THE CROCODILE'S IDIOM AT ITS OTHER EXTREME.** `box-18`, the
 * elephant's trunk, is the bank's longest forward reach (0.425211) at a recorded
 * burial of exactly ZERO — `animal-crocodile.ts` stretches it 10/16 wide by 5/16
 * tall to make a gharial-flat snout. A tyrannosaur's skull is the opposite
 * proportion: as DEEP as it is wide. 10/16 by 10/16, so the same part says the
 * other animal.
 *
 * **TWO LEGS, AT `animal-chicken.ts`'S BIPED STATION** — `legs: false` and one
 * mirrored `box-01` pair on `LEG_ROW`'s own row, on the midline, which is the
 * only station a biped's legs can take. The forelimbs are a SECOND `box-01` pair
 * named `arm` and stretched to 0.55, hung high on the chest. Naming matters: the
 * harness asserts every mesh called `leg*` has its feet on zero, so a raised
 * forelimb has to be called something else — and an arm is what it is.
 *
 * **THE LONG HIND LEG IS THE THING THIS ANIMAL WANTS AND CANNOT HAVE**, and it
 * is the standing commission. `box-01` is one shape at one size across 86
 * instances, 0.30625 tall, and `LEG_ROW` is an absolute. So this is a tyrannosaur
 * on a chicken's legs. The register now counts nine species behind that one part.
 *
 * NO TEETH, on `animal-crocodile.ts`'s ruling: brief §19 is "bright, never
 * scary", the bank's two tooth shapes would have mounted on the jaw for free, and
 * they are left off deliberately. A child meeting this animal should want it.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s own measured centre and crown — 1.5051 tall, bottom on 0.18125. */
const HULL_MID_Y = 0.93380

/** `box-18`'s own extents, measured off the bank: the numbers the stretch is against. */
const JAW_OWN_WIDE = 0.345
const JAW_OWN_TALL = 0.623004

/**
 * 10/16 by 10/16 — as deep as it is wide, where the crocodile's is 10/16 by 5/16.
 *
 * Both are on the pack's own 1/16 authoring grid and both are inside the 2.90x
 * §3 measured for the pack's own snouts. The ratio is the whole separation
 * between a gharial and a tyrannosaur, and it costs no geometry.
 */
const JAW_WIDE = 0.625
const JAW_TALL = 0.625

/**
 * `box-21`'s flat FRONT face runs y 0.49385 to 1.37375 — its centre plus or minus
 * its own measured inset of 0.43995. A jaw 0.625 tall centred at 0.85 spans
 * 0.5375 to 1.1625 and every corner of it is on that flat plate.
 */
const JAW_Y = 0.85

/**
 * The eye is pushed UP to 1.1875, off `plate-01`'s own recorded 0.933646.
 *
 * Rule 5 pins the card's z and its size and neither is touchable; its HEIGHT is
 * the one dial, and it is spent here because the jaw occupies 0.5375-1.1625 of
 * the same plate. At 1.1875 the card spans 1.0275 to 1.3475, clear of the jaw's
 * crown and inside the flat front face's 1.37375.
 */
const EYE_Y = 1.1875

export const T_REX_ASSEMBLY = defineCreature('animal-t-rex', {
  palette: {
    coat: 0x6b7355,    // UNREVIEWED: a dull olive-drab, not a monster green
    belly: 0xcfc39c,   // UNREVIEWED: the pale underside, and the sclera
    hide: 0x5a6146,    // UNREVIEWED: the coat's own olive under a second name
    limb: 0x4f5640,    // UNREVIEWED: the legs and the arms
    jaw: 0x7d8564,     // UNREVIEWED: the muzzle, a shade over the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TALLEST SHELL IN THE BANK, 1.5051, and the whole separation from the two
   * other bipedal theropods here. 184 triangles against the cube's 60. */
  hull: { part: 'box-21', paint: 'coat' },

  /* 7/16, under the pack's own 0.4808-0.5481 mammal zone: a reptile's pale part
   * is its underside and it stops below the flank. It splits the `coat` CELL, so
   * nothing else on this animal may be painted from `coat` — see
   * animal-stoat.ts, where a 10/16 split silently gave a stoat cream ears. */
  belly: 0.4375,

  eyes: { y: EYE_Y },

  /* THE JAW, at the crocodile's own idiom and the opposite proportion. */
  snout: {
    part: 'box-18',
    paint: 'jaw',
    stretch: [JAW_WIDE / JAW_OWN_WIDE, JAW_TALL / JAW_OWN_TALL, 1],
    at: [0, JAW_Y, 0.625],
  },

  /* THE TAIL. The lion's, the longest single reach of the seven (1.082), laid
   * BACK rather than carried: `axis: 'y', dir: 1` declares the pre-spin facing
   * and the -90 turn about x sends (0,1,0) to (0,0,-1), so it joins the rear
   * face after the turn. animal-frilled-lizard.ts is the precedent and its
   * header explains why declaring `z -1` here would stand the tail on end. */
  tail: {
    part: 'wedge-15',
    paint: 'hide',
    spin: [{ axis: 'x', deg: -90 }],
    axis: 'y',
    dir: 1,
    sink: 0.2,
    at: [0, HULL_MID_Y, -0.625],
  },

  legs: false,
  extras: [
    /* TWO legs, the chicken's and the goose's biped station: `box-01`'s own
     * recorded x and the hull's midline, on `LEG_ROW`'s row at its own sink. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE FAMOUS ARMS. The same leg shape at 0.55, hung high and forward on the
     * chest and named `arm` so the harness charges it as one — a mesh called
     * `leg*` must have its foot on the floor, and this one must not. */
    {
      name: 'arm',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      stretch: [0.55, 0.55, 0.55],
      sink: 0.2,
      at: [0.34, 0.86, 0.34],
    },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first T-Rex ever built. IT WANTS THE LONG HIND LEG and '
    + 'that is the collection\'s and the register\'s biggest standing commission: box-01 is ONE '
    + 'shape at ONE size across all 86 legs in the pack, 0.30625 tall, and LEG_ROW.y is an '
    + 'absolute, so this is a tyrannosaur standing on a chicken\'s legs. Nine species now wait '
    + 'on that one part. WHAT IT DOES HAVE is the tallest shell in the bank — box-21, 1.5051, '
    + 'the fox\'s, 184 triangles against the cube\'s 60 — which is the entire separation from '
    + 'animal-allosaurus and animal-carnotaurus, both of which are on the 1.250 cube. THE JAW '
    + 'IS animal-crocodile.ts\'s IDIOM AT THE OPPOSITE PROPORTION: box-18, the elephant\'s '
    + 'trunk, is the longest forward reach in the bank (0.425211) at a recorded burial of zero, '
    + 'and the crocodile stretches it 10/16 wide by 5/16 tall to get a flat gharial snout. A '
    + 'tyrannosaur\'s skull is as DEEP as it is wide, so 10/16 by 10/16 — same part, other '
    + 'animal, no geometry spent. THE EYE IS PUSHED UP to 1.1875 from the card\'s own 0.933646 '
    + 'because the jaw occupies 0.5375-1.1625 of the same front plate; height is the one dial '
    + 'rule 5 leaves and this is what it is spent on. NO TEETH, deliberately, on the '
    + 'crocodile\'s ruling — brief 19 is "bright, never scary" and the two tooth shapes would '
    + 'have mounted for free.',
})
