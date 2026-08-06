/**
 * The terror bird — the ratite neck idiom carrying the raptor hook, which is the
 * first time those two have been on one animal.
 *
 * *Phorusrhacos* is a two-metre flightless bird whose head is a hatchet. Every
 * piece of that already exists in this project and none of it had ever been
 * combined:
 *
 *   - **THE NECK** is the goose's four numbers (`animal-goose.ts`, transferred
 *     by `animal-ostrich.ts` and `animal-emu.ts`): `box-18` stood on `y +1`,
 *     stretched, leaned on x, and buried 6/16 so a leaned root stays covered.
 *     1.1x and 48 degrees here — shorter than the ostrich's 1.5x at 45, because
 *     a terror bird carried its head over its feet rather than out in front, and
 *     because the height ceiling is 2.02 and the head on this neck carries a
 *     stretched hatchet of a bill where a ratite's carries a pea. At the
 *     ostrich's own numbers this bird measures 2.0747 and is over.
 *   - **THE HEAD** is `tube-06` hung `on: 'neck'`, so it rides the neck's own
 *     built tip rather than a coordinate this file would carry a stale copy of.
 *   - **THE HOOK** is `collections/raptors.ts`'s two-part bill, hung on the head
 *     in turn: `cone-06` stretched 2x along its own reach with Kenney's band 15
 *     painted dark, then `wedge-01` turned down 65 degrees off the bill's own
 *     tip. Three features chained by `on`, which is the deepest chain in the
 *     project and the reason `PartDef.on` exists at all.
 *
 * The wings are `box-06` folded at the nine-bird idiom and they are meant to be
 * almost invisible: this bird's forelimbs were vestigial, so the folded read is
 * the accurate one rather than the cheap one.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-36`'s crown — the cube's own 1.43125, shared by nine of the ten hulls. */
const CROWN_Y = 1.43125
const FLANK_X = 0.625
const FLANK_MID_Y = 0.80625

/** The goose's neck numbers, transferred entire. See that file for each solve. */
const NECK_Z = 0.1875
const NECK_SINK = 0.375

/**
 * 1.1x and 48 degrees, where the ostrich is 1.5x/45 and the emu 1.25x/55.
 *
 * A terror bird's neck is short, thick and near-vertical, and the head on the
 * end of it is a hatchet rather than a ratite's pea. Both numbers are held down
 * by the same ceiling the ostrich records: at the goose's 1.75x and 45 a big
 * bird comes out 2.0634 against the pack's 2.02, and this one carries a stretched
 * beak on top of its head, so it buys headroom from the neck rather than the
 * bill — which is the right way round, because the bill is the animal.
 */
const NECK_STRETCH = 1.1
const NECK_LEAN = 48

export const TERROR_BIRD_ASSEMBLY = defineCreature('animal-terror-bird', {
  palette: {
    coat: 0x8d6a45,    // UNREVIEWED: coarse rufous body plumage
    belly: 0xc9ab84,   // UNREVIEWED: the paler underside, and the sclera
    flight: 0x6b4e33,  // UNREVIEWED: the vestigial wings and the tail
    skin: 0x9a8368,    // UNREVIEWED: the bare neck and head
    bill: 0xd8c07a,    // UNREVIEWED: the horn-yellow bill
    hook: 0x3b3126,    // UNREVIEWED: Kenney's own band 15 — the overhang, and the tip
    limb: 0xbfa06a,    // UNREVIEWED: the long bare legs
    eye: 0x241c15,     // UNREVIEWED: the dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's 1.250 cube. `animal-ostrich` takes the widest shell and
   * `animal-emu` the fish's; a terror bird is deeper than either and narrower
   * than the ostrich, so it takes the third plain cube nothing else here wears. */
  hull: { part: 'box-36', paint: 'coat' },
  belly: 0.4375,

  /* The bird card. `plate-04` — the CAT's, 0.400 x 0.350, and unspent by all 200
   * built species — was tried first and is unusable: it carries band 15 ONLY, so
   * `creatureSpec`'s `byBand: { 15: pupil }` paints the whole card the pupil grey
   * and the sclera has nowhere to go. That is why nobody has ever spent it, and
   * it is worth knowing before somebody else tries. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE NECK. The goose's own four numbers; only the stretch and the lean are
   * this bird's, and both are argued at NECK_STRETCH above. */
  snout: {
    part: 'box-18',
    name: 'neck',
    paint: 'skin',
    axis: 'y',
    dir: 1,
    stretch: [1.15, NECK_STRETCH, 1.15],
    spin: [{ axis: 'x', deg: NECK_LEAN }],
    sink: NECK_SINK,
    at: [0, CROWN_Y, NECK_Z],
  },

  /* THE HEAD, on the neck's own placed tip. The fox's muzzle, which is the
   * goose's, the ostrich's and the emu's choice for the same job. */
  nose: { part: 'tube-06', name: 'head', on: 'neck', paint: 'skin' },

  legs: false,
  extras: [
    /* TWO legs at `box-01`'s own recorded x on the pack's own row. */
    {
      name: 'leg',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* THE BILL, on the head's own front. Stretched 2x along its own reach, with
     * band 15 dark: animal-canary.ts measured that band standing 0.0419 proud of
     * band 13 and called it "where a hook begins". */
    {
      name: 'bill',
      part: 'cone-06',
      on: 'head',
      paint: { base: 'bill', byBand: { 15: 'hook' } },
      stretch: [1, 1.2, 2],
    },

    /* THE HOOK, off the bill's own tip and turned down 65 degrees. Two straight
     * parts meeting at an angle is what this bank can say instead of a curve. */
    {
      name: 'hook',
      part: 'wedge-01',
      on: 'bill',
      paint: 'hook',
      stretch: [1.6, 1.6, 1.6],
      spin: [{ axis: 'x', deg: 65 }],
      /* 0.6 rather than `wedge-01`'s own 0.219: this shape is 0.206 through
       * after the stretch, so the pack's own burial is 0.045 and §3 wants an
       * ear buried 0.1249. The anchor guarantees the join is ON the bill's
       * built face, so deepening it costs nothing and buys the floor. */
      sink: 0.6,
    },

    /* THE WING, HELD FOLDED — accurate rather than economical on this bird. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: 0.5,
      at: [FLANK_X, FLANK_MID_Y, 0],
    },

    /* The parrot's fan, low and short: this bird's tail is a stub of coverts. */
    { name: 'tail', part: 'box-38', paint: 'flight', stretch: [0.8, 0.8, 0.8] },
  ],

  flag: 'THIS IS THE FIRST ANIMAL TO CHAIN THREE FEATURES WITH `on`: neck -> head -> bill -> '
    + 'hook, each joined to the built outer face of the one before it, so not one of those four '
    + 'positions is a number this file carries. That is what PartDef.on was added for and '
    + 'nothing had used it more than two deep. THE BILL IS THE ANIMAL AND IT IS TWO STRAIGHT '
    + 'PARTS: cone-06 stretched 2x along its own reach with Kenney\'s band 15 painted dark, then '
    + 'wedge-01 turned down 65 degrees off its tip. THE BANK HAS NO CURVE and a real '
    + 'phorusrhacid\'s bill hooks in one bend; this is the eighth collection to price that gap '
    + 'and animal-vulture.ts was the first to work round it. THE NECK IS SHORTER AND STRAIGHTER '
    + 'THAN THE OSTRICH\'S ON PURPOSE — 1.1x and 48 degrees against 1.5x and 45 — because the '
    + 'pack\'s height ceiling is 2.02 and this bird spends its headroom on the bill instead, '
    + 'which is the right way round. THE 2x BILL STRETCH IS THE THING TO RULE ON: rule 1 '
    + 'sanctions a stretch on a snout and cone-06 is filed as a nose, so it is inside the '
    + 'letter, but the size of that bill is a look and it is yours. THE LONG HIND LEG this bird '
    + 'wants is the standing commission animal-kangaroo.ts, animal-ostrich.ts, animal-emu.ts, '
    + 'animal-maned-wolf.ts and animal-jerboa.ts all name. NEW PALETTE, UNREVIEWED.',
})
