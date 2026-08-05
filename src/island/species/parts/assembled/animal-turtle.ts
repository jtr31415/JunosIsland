/**
 * The sea turtle — and the third shelled animal in this project, which makes
 * roster §4 the design problem rather than the geometry.
 *
 * `animal-tortoise` and `animal-terrapin` are both built and the tortoise is
 * signed off, so this one is separated on three measured axes, not on palette:
 *
 *   |  | tortoise | terrapin | turtle |
 *   |---|---|---|---|
 *   | shell | `box-19` square, halved | `box-11` oval, unstretched | **`box-35`** radial, halved |
 *   | limbs | four `box-01` legs | four `box-01` legs, webbed | **four `blade-06` FLIPPERS, no leg at all** |
 *   | front | nothing | 0.765 of neck and snout | a short `box-18` head, no neck |
 *
 * The flipper is `blade-06`, the bee's and the PENGUIN'S wing — and a penguin's
 * wing already is a flipper, which is the one place in this collection where a
 * lifted part needs no reinterpretation whatsoever.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The flipper, spun out of the vertical onto the flank and swept back. */
const FLIPPER = {
  part: 'blade-06',
  paint: 'limb' as const,
  kind: 'pair' as const,
  sink: 0.7,
}

export const TURTLE_ASSEMBLY = defineCreature('animal-turtle', {
  palette: {
    coat: 0x4f7f5e,
    belly: 0xe9dca6,
    limb: 0x3f6a4e,
    shell: 0x7a5a33,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.4375,
  legs: false,
  eyes: { part: 'plate-01', x: 0.2625, y: 0.9875 },

  extras: [
    /* The carapace: the panda's rump band laid FLAT and halved in thickness,
     * which is the tortoise's own halving reused rather than re-derived — at its
     * own 0.498 it is a second mass and rule 3 refuses it. */
    {
      name: 'carapace',
      part: 'box-35',
      paint: 'shell',
      spin: [{ axis: 'x', deg: 90 }],
      axis: 'z',
      dir: -1,
      stretch: [1, 1, 0.5],
      sink: 0.55,
      at: [0, 1.05, -0.0625],
    },
    /* Four flippers, front pair swept forward and rear pair back. */
    {
      ...FLIPPER, name: 'flipper-fore',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: 30 }], at: [0.5625, 0.5, 0.3125],
    },
    {
      ...FLIPPER, name: 'flipper-aft',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }], at: [0.5625, 0.5, -0.3125],
    },
    /* The head: the elephant's trunk worn FORWARDS and short, which is the
     * terrapin's own part at a third of its reach — this animal has no neck. */
    {
      name: 'head',
      part: 'box-18',
      paint: 'coat',
      stretch: [1, 1, 0.6],
      sink: 0.5,
      at: [0, 0.75, 0.625],
    },
    { name: 'mouth', part: 'plate-03', paint: 'shell', at: [0, 0.75, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first sea turtle ever built and the first '
    + 'colours ever proposed for it. IT IS THE THIRD SHELLED ANIMAL and roster §4 is '
    + 'the risk, so look at it beside the Garden tortoise: the separation is meant to '
    + 'be the FLIPPERS — four blade-06, the penguin\'s own wing, and not one box-01 leg '
    + 'anywhere on it — plus a different shell shape and no neck. If it still reads as '
    + 'the tortoise in blue, the flippers are not doing enough and the carapace is the '
    + 'next thing to change. The pack still has no DOME, which is what all three of '
    + 'these animals actually want, and it remains the one bespoke part this project '
    + 'would most obviously pay to author.',
})
