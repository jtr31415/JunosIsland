/**
 * The manatee — the second half of the pair, and the PADDLE is the whole of it.
 *
 * Read `animal-dugong.ts` first: it carries the argument for building these two
 * as one animal twice, and it is the same argument `collections/ice.ts` made for
 * the beluga and the narwhal. The short version is that a dugong and a manatee
 * differ in exactly one visible thing, and the bank contains both halves of it:
 *
 *   - the dugong's tail is a **fluke** — `box-38`, the parrot's fan spun flat;
 *   - the manatee's is a **rounded paddle**, and `wedge-03` is one, because it is
 *     the BEAVER'S OWN PADDLE and the beaver is the animal the shape was drawn
 *     for.
 *
 * **`wedge-03` is turned a quarter turn about z and stretched on its own height
 * before it is turned**, which is the only stretch on this animal. Native it is
 * 0.726 across, 0.862 tall and 0.589 of reach — a tall narrow paddle standing on
 * a beaver's back. `stretch: [1, 1.5, 1]` takes the height to 1.293, and
 * `{ z, 90 }` then swaps that onto x, so the built part is **1.293 wide, 0.726
 * tall and 0.589 long**: a broad flat spoon trailing off the rump. The stretch
 * and the spin are one idea and neither works without the other.
 *
 * It is joined at the hull's own centre y = 0.80625 rather than at the bank's
 * recorded 1.050919, because that number is where a beaver carries its paddle —
 * high, off the back — and a manatee's tail continues the line of the body.
 *
 * Everything else is the dugong's, on purpose. The one other difference is the
 * SNOUT: a manatee's muzzle is shorter, blunter and points forward rather than
 * down, so the same `box-24` is worn untilted and less deep.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own centre — its recorded `offset[1]`, and where this tail joins. */
const HULL_MID_Y = 0.80625

/**
 * The one stretch on this animal, and it is spent on the paddle's HEIGHT because
 * a spin about z then turns that height into width. See the header: 0.862 x 1.5
 * = 1.293, which is the built paddle's span across.
 */
const PADDLE_STRETCH: [number, number, number] = [1, 1.5, 1]

export const MANATEE_ASSEMBLY = defineCreature('animal-manatee', {
  palette: {
    coat: 0x8f8b84,    // UNREVIEWED: warm grey, the first ever proposed for this species
    belly: 0xcfc9bd,   // UNREVIEWED: the paler underside, and the sclera
    skin: 0x7a766f,    // UNREVIEWED: the muzzle, a shade under the coat
    fin: 0x6e6a64,     // UNREVIEWED: the paddle and the flippers
    mark: 0x35322e,    // UNREVIEWED: the mouth line and the nostrils
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.4375,
  legs: false,

  /* The smallest eye card in the bank, as the dugong wears it and for the same
   * reason: a sirenian's eye is a pinhole in a very large face. */
  eyes: { part: 'plate-06' },

  /* THE MUZZLE, forward and blunt. The dugong's own shape at the dugong's own
   * station, without the thirty-degree downward tilt and less deep — which is
   * the second real difference between the two animals and the smaller one. */
  snout: { part: 'box-24', paint: 'skin', stretch: [1.4, 1.2, 0.85] },

  /* THE PADDLE. See PADDLE_STRETCH and the header — the beaver's own tail, made
   * broad and laid flat, joined at the body's own centre rather than at the
   * beaver's high recorded root. */
  tail: {
    part: 'wedge-03',
    paint: 'fin',
    stretch: PADDLE_STRETCH,
    spin: [{ axis: 'z', deg: 90 }],
    at: [0, HULL_MID_Y, -0.625],
  },

  extras: [
    /* The penguin's wing, which already is a flipper. A manatee's forelimbs are
     * set further forward and lower than a dugong's and are used like hands. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -25 }],
      sink: 0.7,
      at: [0.625, 0.50, 0.26],
    },
    /* The nostrils, on the front of the muzzle rather than high on a downturned
     * rostrum — the same card, moved with the animal's face. */
    {
      name: 'nostril',
      part: 'plate-16',
      paint: 'mark',
      kind: 'pair',
      stretch: [1.4, 1.4, 1],
      at: [0.08, 0.86, 0.80],
    },
    { name: 'mouth', part: 'plate-13', paint: 'mark', stretch: [1.5, 1, 1], at: [0, 0.66, 0.80] },
  ],

  flag: 'THE PADDLE IS THE ANIMAL AND IT IS THE BEAVER\'S OWN TAIL. wedge-03 is the shape Kenney '
    + 'drew for a beaver, and a manatee\'s tail is the same object: a broad rounded spoon. It is '
    + 'stretched 1.5x ON ITS OWN HEIGHT and then spun a quarter turn about z, which swaps that '
    + 'height onto x — so the built part is 1.293 wide, 0.726 tall and 0.589 long. The stretch '
    + 'and the spin are ONE idea; setting either to nothing gives a tall narrow fin standing on '
    + 'the rump, which is a beaver. It is the only stretch on the animal. THIS AND animal-dugong '
    + 'ARE ONE BUILD TWICE OVER, deliberately, on the beluga/narwhal precedent — but with a '
    + 'better excuse than theirs, because the real difference between the two orders is exactly '
    + 'this part: a dugong has a whale\'s FLUKE and a manatee has a PADDLE, and the bank holds '
    + 'both. The second difference is the muzzle, which here points FORWARD and is shallower, '
    + 'where the dugong\'s is tilted thirty degrees down at the seabed. Nothing else differs and '
    + 'nothing else should. MEASURED: 1.2778 tall, feet on zero, 448 triangles, 282 vertices, '
    + 'keep-out 0.9202 — under the pack\'s 1.43 height floor and its 405 vertex floor, which is '
    + 'what a legless animal with no legs and no ears measures and which reports rather than '
    + 'fails. NEW PALETTE, UNREVIEWED.',
})
