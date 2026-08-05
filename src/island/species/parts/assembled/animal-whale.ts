/**
 * The whale — the biggest hull in the bank that a face still fits on.
 *
 * `box-12`, the cow's and the deer's, is 1.5395 across against the shared cube's
 * 1.250: the widest shell the pack owns, and the only one whose extra size is on
 * the axis a whale wants it. `box-41` is bigger by volume but its front face
 * stands at z = 0.725, which is 0.09 IN FRONT of the absolute eye plane, so an
 * eye card on it is buried. That is why this animal is not on the tiger's shell.
 *
 * THE FLUKE IS THE PARROT'S FAN LAID FLAT — `box-38` spun a quarter turn about
 * z, so the shape that stands upright on `animal-turkey` lies horizontal here.
 * A whale's tail is the one tail in nature that is wider than it is tall, and
 * the fan is the one tail in this bank that can be turned into it.
 *
 * The flippers are `blade-06`, the penguin's wing, which already is a flipper.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const WHALE_ASSEMBLY = defineCreature('animal-whale', {
  palette: {
    coat: 0x3f6ea3,
    belly: 0xeef2f4,
    fin: 0x33587f,
    mouth: 0x24384d,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-12',
  belly: 0.4375,
  legs: false,
  /* Low and wide: a whale's eye sits back near the corner of its mouth. */
  eyes: { part: 'plate-01', x: 0.55, y: 0.75 },

  /* The parrot's fan turned HORIZONTAL — see the header. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -35 }],
      sink: 0.7,
      at: [0.75, 0.5625, 0.1875],
    },
    /* The blowhole: the cow's and the hog's nostril card, the smallest flat
     * shape in the bank, turned to lie on the crown rather than face forward. */
    {
      name: 'blowhole',
      part: 'plate-12',
      paint: 'mouth',
      spin: [{ axis: 'x', deg: -90 }],
      stretch: [2, 1, 2],
      at: [0, 1.43125, 0.25],
    },
    /* A small dorsal, well back. It is also what lifts the animal off the
     * legless hull's own 1.250, which is under the pack's floor.
     *
     * ONE spin and not two, deliberately. A second `{ x: -20 }` to sweep it
     * back is what the animal wants and the harness cannot recover the shape
     * through it (`assembly-assert.ts:562`), so the sweep is expressed by
     * sitting the fin BACK at z = -0.3125 instead of leaning it. The shark
     * wears the same shape at the same single spin, upright and further
     * forward, which is the difference between the two silhouettes anyway. */
    {
      name: 'dorsal',
      part: 'wedge-19',
      paint: 'fin',
      spin: [{ axis: 'z', deg: 90 }],
      sink: 0.4,
      at: [0, 1.43125, -0.3125],
    },
    /* The mouth line, run the full width — a whale is mostly mouth. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [3, 1, 1], at: [0, 0.6875, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first whale ever built and the first colours '
    + 'ever proposed for it. THE FLUKE IS box-38, THE PARROT\'S FAN, SPUN FLAT, and it '
    + 'is the whole gamble: a whale\'s tail is wider than it is tall and no tail in this '
    + 'bank is, so the fan is turned rather than chosen. Look at whether it reads as a '
    + 'fluke or as a bird\'s tail lying down. THE ANIMAL IS ALSO NOT LONG ENOUGH and it '
    + 'cannot be: HullDef.stretch is `never`, so a hull is worn at its own size, and '
    + 'box-12 at 1.5395 is the widest the pack owns. A whale that is genuinely '
    + 'whale-shaped needs a hull the pack does not contain.',
})
