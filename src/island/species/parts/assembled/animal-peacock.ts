/**
 * PLACEHOLDER — THIS IS A PEACOCK WITH NO TRAIN, WHICH IS A BLUE TURKEY. The
 * bird is right and the thing it is famous for is missing, and the measurement
 * that kills it is short enough to check.
 *
 * ## WHY THERE IS ONE FAN AND A SECOND IS IMPOSSIBLE
 *
 * `box-38`, the parrot's fan, is the only fan in the bank, and
 * `animal-turkey.ts` derived both numbers that stand it upright — `+30` on x,
 * because the shape's own root-to-tip axis is `(0, 0.866025, -0.500000)`, which
 * is 60.000 degrees above horizontal and 60 + 30 = 90; and `8/16` of burial,
 * because stood upright its root quad faces DOWNWARD and its recorded 0.269738
 * leaves it floating 0.028014 clear of the shell. Both are arithmetic. Sited at
 * the rear plate's own top corner it spans y 0.649806 to 1.587694 and clears the
 * crown by 0.106444.
 *
 * **A SECOND COPY HAS NOWHERE TO GO.** `box-38` is 0.625879 across and the flat
 * rear plate is 0.625000 — the part is 0.000879 WIDER than the whole plate it
 * joins to, so there is no x at which a second fan has any plate under it. That
 * is not a budget or a taste; it is the shell.
 *
 * A peacock's train is several times the length of the bird and made of a
 * hundred feathers. One fan is a gesture at it. THE TRAIN IS A COMMISSION, and
 * it is the only thing this species is waiting on.
 */
/*
 * ## EVERYTHING ELSE IS RIGHT AND IS NOT A PLACEHOLDER
 *
 *   - The crest is `cone-01` — the bank's one true point, taper 0 — three of
 *     them standing on the flat crown, which is `animal-chicken.ts`'s comb idiom
 *     used for the thing a peacock actually has on its head.
 *   - `box-41`, the pack's only shell bigger on all three axes, with its band 15
 *     (168 triangles of back and shoulders) in the green a peacock carries there
 *     against the blue of its neck and breast. Third reading of that band after
 *     `animal-bear.ts` and `animal-wolverine.ts`.
 *   - The galliform idiom, unchanged: two legs on `LEG_ROW` with JT-044's foot
 *     patch, `box-06` as the folded flank wing, `tube-02` as the bill,
 *     `plate-08` as the round eye. A peacock IS a galliform, so this is the
 *     animal agreeing rather than the builder repeating himself.
 *
 * So if the train is ever commissioned, this file needs one feature added and
 * nothing else changed. That is why it is worth having as an entry.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s flat rear plate — z = -0.625, and identical to `box-03`'s. */
const REAR_PLATE_Z = -0.625

/** That plate's upper edge, the highest station on the shell a fan can join. */
const REAR_PLATE_TOP_Y = 1.11875

/** The flank plate's own x and centre — NOT the hull's recorded 0.83125. */
const FLANK_PLATE_X = 0.625
const FLANK_PLATE_MID_Y = 0.80625

/** `box-41`'s flat crown. The crest stands here. */
const CROWN_Y = 1.43125

/** +30, the unique x spin that stands `box-38`'s own 60-degree axis vertical. */
const FAN_SPIN = 30

/** 8/16, forced: at the shape's recorded 0.269738 the upright fan floats. */
const FAN_SINK = 0.5

const WING_SINK = 0.5
const FOOT_AT = 0.25

export const PEACOCK_ASSEMBLY = defineCreature('animal-peacock', {
  palette: {
    coat: 0x1d4e8c,
    back: 0x1d6b52,
    train: 0x14624f,
    crest: 0x2a7fb8,
    limb: 0x8a8478,
    foot: 0x5f5a50,
    eye: 0x141118,
    pupil: PACK_PUPIL,
  },

  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 15: 'back' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'tube-02', paint: 'limb' },

  tail: {
    part: 'box-38',
    paint: 'train',
    sink: FAN_SINK,
    spin: [{ axis: 'x', deg: FAN_SPIN }],
    at: [0, REAR_PLATE_TOP_Y, REAR_PLATE_Z],
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

    {
      name: 'wing',
      part: 'box-06',
      paint: 'back',
      kind: 'pair',
      axis: 'z',
      dir: -1,
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }],
      sink: WING_SINK,
      at: [FLANK_PLATE_X, FLANK_PLATE_MID_Y, 0],
    },

    {
      name: 'crest',
      part: 'cone-01',
      paint: 'crest',
      kind: 'pair',
      at: [0.16, CROWN_Y, 0.02],
    },

    {
      name: 'crest-mid',
      part: 'cone-01',
      paint: 'crest',
      at: [0, CROWN_Y, 0.02],
    },
  ],

  motion: [{ kind: 'flap', parts: ['wing'] }],

  flag: 'PLACEHOLDER, AND WITHOUT ITS TRAIN THIS IS A BLUE TURKEY. The bird is right and the '
    + 'thing it is famous for is missing, and the measurement that kills it is short enough to '
    + 'check: box-38, the parrot\'s fan, is the only fan in the bank, and it is 0.625879 ACROSS '
    + 'where the flat rear plate it joins to is 0.625000 — the part is 0.000879 wider than the '
    + 'whole plate, so there is no x at which a SECOND fan has any plate under it. That is not '
    + 'a budget or a taste, it is the shell. A peacock\'s train is several times the length of '
    + 'the bird and made of a hundred feathers; one fan is a gesture at it, and THE TRAIN IS A '
    + 'COMMISSION. The one fan sits at animal-turkey.ts\'s two derived numbers, both arithmetic: '
    + '+30 on x, because the shape\'s own root-to-tip axis is (0, 0.866025, -0.500000), 60.000 '
    + 'degrees above horizontal, and 60 + 30 = 90; and 8/16 of burial, because stood upright '
    + 'its root quad faces downward and its recorded 0.269738 leaves it floating 0.028014 '
    + 'clear. EVERYTHING ELSE IS RIGHT AND IS NOT A PLACEHOLDER: the crest is three cone-01 on '
    + 'the flat crown, which is the hen\'s comb idiom spent on the thing a peacock actually '
    + 'wears there; box-41\'s band 15 carries the green of the back against the blue of the neck '
    + 'and breast, the third reading of that band after animal-bear.ts and animal-wolverine.ts; '
    + 'and the galliform idiom is unchanged, because a peacock IS a galliform. So if the train '
    + 'is ever commissioned, this file needs ONE feature added and nothing else changed, which '
    + 'is why it is worth having as an entry. NEW PALETTE, UNREVIEWED.',
})
