/**
 * The pheasant — Woodland's first game bird, and the long tail is the whole
 * silhouette.
 *
 * **Read `animal-chicken.ts` first.** It is the exemplar every galliform in this
 * project is cut from and this file inherits four things from it and does not
 * re-argue any of them: the two-leg stance on `LEG_ROW` with JT-044's foot
 * patch at 4/16 (§5), the `box-06` solid-flank wing at `sink: 0.5` (§3), the
 * `plate-08` round eye (§6), and `tube-02` as the bill (§6). Nine birds now
 * share that wing; this is the fourteenth galliform-shaped animal built on it.
 *
 * What is new here is one thing. **`wedge-18`, the tiger's whip, worn as a
 * tail.** It is 1.047 of reach on a 0.200 section — the longest, thinnest thing
 * in the bank — and a cock pheasant's tail is exactly that: a rope carried out
 * behind, longer than the bird. Its band 3 is the third of its length furthest
 * from the join (64 triangles), so the darker barring at the tip is Kenney's own
 * cut and costs nothing.
 *
 * The red face wattle is `plate-10`, the pack's small marking card, at a station
 * on the flat side face clear of the wing — the same idiom `animal-quail.ts`
 * uses for its cheek fleck and `animal-nightjar.ts` for its mottle.
 *
 * The white neck ring is NOT here and cannot be: it is a boundary that runs
 * around the animal, `Paint.patch` paints one level line and `box-03` has one
 * band. Flagged.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own recorded centre, and where its side and rear plates sit. */
const HULL_MID_Y = 0.80625
const HULL_SIDE_X = 0.625
const HULL_REAR_Z = -0.625

/** The cage birds' and the hen's shared wing burial — `animal-chicken.ts` §3. */
const WING_SINK = 0.5

/** 4/16, derived off `box-01`'s own bevel in `animal-chicken.ts` §5. */
const FOOT_AT = 0.25

/**
 * 17/16, and it is a bound rather than a taste. `wedge-18`'s buried root runs
 * local y -0.5233 to -0.3411, and the flat rear plate every one of the pack's
 * hulls shares runs world y 0.49375 to 1.11875, so the join has to sit in
 * [1.0171, 1.4598] for the root to be backed by face at all. At the rear plate's
 * own centre the whole root lands BELOW the plate and the tail floats. This is
 * the lowest grid point inside the bound, so the tail is carried as low as it
 * can be and still be attached — 0.124 under the tiger's own 1.1867.
 */
const TAIL_Y = 1.0625

/**
 * The wattle's station, and it is chosen to stay OFF the wing.
 *
 * `plate-10` mounts `x +1` and its recorded x is 0.635 — the flat side face at
 * 0.625 plus the 0.010 of daylight the pack gives a card. The wing occupies the
 * middle of that face, centred on `HULL_MID_Y` and reaching about 1.05 at its
 * top, so the card goes above it and forward, still inside the flat square
 * (y 0.49375-1.11875, z +/-0.3125).
 */
const WATTLE_Y = 1.09375
const WATTLE_Z = 0.25
const CARD_SHELL = 0.635

export const PHEASANT_ASSEMBLY = defineCreature('animal-pheasant', {
  palette: {
    coat: 0x9a5a28,
    belly: 0x5c3a1c,
    hood: 0x1f3a33,
    flight: 0x6b4a26,
    face: 0xb5372c,
    limb: 0xa89a7c,
    foot: 0x6f6450,
    eye: 0xd2a336,
    pupil: PACK_PUPIL,
  },

  /* Copper above, dark chestnut below. 8/16 is the only point on the pack's
   * 1/16 grid inside its own measured split zone and is this hull's equator. */
  belly: 0.5,

  /* `plate-08`, the pack's one round card, painted amber. A pheasant's eye sits
   * in the middle of a red face and wants to be the darkest thing on it — but
   * the pupil is already PACK_PUPIL, so the sclera carries the amber. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* The chick's and the penguin's bill, by pure donor transfer, exactly as
   * every galliform in this project wears it. */
  snout: { part: 'tube-02', paint: 'limb' },

  /* THE TAIL, AND THE ANIMAL. The tiger's whip: 1.047 of reach on a 0.200
   * section, the longest thinnest shape in the bank. Joined at the rear plate's
   * own centre rather than at the tiger's own 1.1867, which is above this cube's
   * flat rear face. Band 3 is Kenney's own far third, so the dark barring at the
   * tip is paint. */
  tail: {
    part: 'wedge-18',
    paint: { base: 'coat', byBand: { 3: 'belly' } },
    at: [0, TAIL_Y, HULL_REAR_Z],
  },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: { base: 'limb', patch: { below: 'foot', at: FOOT_AT } },
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    /* The nine-bird wing, byte for byte from `animal-chicken.ts` §3: `box-06`
     * turned onto the flank and buried half its depth, so it reads as a folded
     * wing lying against the body rather than as a second shape. */
    {
      name: 'wing',
      part: 'box-06',
      paint: 'flight',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [HULL_SIDE_X, HULL_MID_Y, 0],
    },

    /* THE RED FACE. `plate-10` at the card shell, high and forward on the flat
     * side face and clear of the wing — `animal-quail.ts`'s cheek-fleck idiom
     * spent on the marking a cock pheasant is actually known for. */
    {
      name: 'wattle',
      part: 'plate-10',
      paint: 'face',
      kind: 'pair',
      at: [CARD_SHELL, WATTLE_Y, WATTLE_Z],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'THE TAIL IS THE ANIMAL AND IT IS THE TIGER\'S WHIP. wedge-18 is 1.047 of reach on a '
    + '0.200 section — the longest, thinnest shape in the bank — and a cock pheasant\'s tail is '
    + 'exactly that: a rope carried out behind, longer than the bird. It is joined at the rear '
    + 'plate\'s own centre (0, 0.80625, -0.625) and NOT at the tiger\'s recorded 1.1867, which '
    + 'is above this cube\'s flat rear face entirely, and its band 3 — Kenney\'s own far third, '
    + '64 triangles — carries the darker barring at the tip for no geometry. The same shape is '
    + 'on animal-stoat in this collection at a fifth the animal\'s size, which is worth knowing '
    + 'and is not a clash: a bird and a weasel. EVERYTHING ELSE IS THE GALLIFORM IDIOM, '
    + 'unchanged and not re-argued — two legs on LEG_ROW with JT-044\'s foot patch at 4/16, the '
    + 'box-06 solid-flank wing at 8/16, plate-08 as the round eye, tube-02 as the bill — all of '
    + 'it derived in animal-chicken.ts and shared with nine other birds. THE WHITE NECK RING IS '
    + 'NOT HERE AND CANNOT BE: it is a boundary that runs AROUND the animal, Paint.patch paints '
    + 'one level line, byBand can only cut where Kenney already cut and box-03 has one band. '
    + 'What is here instead is the RED FACE — plate-10, the pack\'s small marking card, at the '
    + 'card shell x = 0.635, placed high and forward at y 1.09375 so it clears the wing, which '
    + 'is animal-quail.ts\'s own cheek-fleck idiom. NEW PALETTE, UNREVIEWED, all nine slots.',
})
