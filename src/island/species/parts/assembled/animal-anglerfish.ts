/**
 * The anglerfish — the lure, and the lure is `animal-goose`'s neck idiom put to
 * a completely different job.
 *
 * A stalk rising off the crown with something on the end of it is EXACTLY what
 * the goose solved: `box-18`, the elephant's trunk, re-axised to `y +1` so it
 * stands instead of reaching forward, stretched along its own facing, joined at
 * the hull's flat crown — and then a second part hung off its tip with `on`,
 * which anchors to the previous part's built vertices rather than to a number
 * anybody chose. The goose hangs a head there. This hangs a light.
 *
 * The bulb is `box-08`, the bunny's nose — the roundest small solid in the bank
 * at taper 0.89 — and NOT the authored sphere, which would have been the lazy
 * reach. Rule 1 needs no exception here.
 *
 * The teeth are `wedge-13`, the hog's tusk, three a side, pointing up out of the
 * lower jaw.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The hull's own flat crown, where the stalk joins. */
const CROWN_Y = 1.43125

export const ANGLERFISH_ASSEMBLY = defineCreature('animal-anglerfish', {
  palette: {
    coat: 0x3a3340,
    belly: 0x5b5060,
    lure: 0xf2e07a,
    tooth: 0xf6f2e6,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  hull: 'box-03',
  belly: 0.375,
  legs: false,
  eyes: { part: 'plate-08', y: 1.05 },

  tail: { part: 'wedge-03', paint: 'coat', sink: 0.25 },

  extras: [
    /* THE STALK: the goose's neck, at a third of its length and straight up. */
    {
      name: 'stalk',
      part: 'box-18',
      paint: 'coat',
      axis: 'y',
      dir: 1,
      stretch: [0.35, 1.1, 0.35],
      sink: 0.375,
      at: [0, CROWN_Y, 0.1875],
    },
    /* THE BULB, anchored to the stalk's own built tip rather than to a number. */
    { name: 'lure', part: 'box-08', paint: 'lure', on: 'stalk', stretch: [1.3, 1.3, 1.3] },

    /* Three teeth a side, turned to stand UP out of the jaw. */
    {
      name: 'tooth', part: 'wedge-13', paint: 'tooth', kind: 'pair',
      spin: [{ axis: 'x', deg: -90 }], sink: 0.4, at: [0.1875, 0.6875, 0.5625],
    },
    {
      name: 'tooth-2', part: 'wedge-13', paint: 'tooth', kind: 'pair',
      spin: [{ axis: 'x', deg: -90 }], sink: 0.4, at: [0.375, 0.6875, 0.5],
    },
    {
      name: 'tooth-3', part: 'wedge-13', paint: 'tooth', kind: 'pair',
      spin: [{ axis: 'x', deg: -90 }], sink: 0.4, at: [0.5, 0.6875, 0.375],
    },

    { name: 'mouth', part: 'plate-13', paint: 'lure', stretch: [2.5, 1, 1], at: [0, 0.75, 0.635] },
  ],

  flag: 'NEW PALETTE, UNREVIEWED — the first anglerfish ever built and the first colours '
    + 'ever proposed for it. THE LURE IS THE GOOSE\'S NECK IDIOM: box-18 re-axised to '
    + 'stand off the crown, with the bulb anchored to its built tip by `on` rather than '
    + 'by a number — the same mechanism that hangs a goose\'s head on a goose\'s neck. '
    + 'The bulb is box-08, the bunny\'s nose, and NOT the authored sphere: nothing here '
    + 'is authored. The thing to judge is whether the lure GLOWS, which it cannot — the '
    + 'palette can make it a pale yellow and nothing in this renderer can make it emit '
    + 'light, and an anglerfish\'s lure is a light before it is a shape.',
})
