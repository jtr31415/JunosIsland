/**
 * The beluga — the animal with no dorsal fin, and that absence is the design.
 *
 * Four cetaceans are built and every one of them stands a blade on its back: the
 * shark, the dolphin and the whale wear `wedge-19` and the orca wears `box-06`.
 * **A beluga is the only whale in the world with no dorsal fin at all** — it
 * swims under ice and a fin would catch — and it has a low knuckled RIDGE
 * instead. So this species is separated from its four neighbours by subtracting
 * the one part they all share, which is a stronger separation than any part
 * could have been, and by two things it has that they do not:
 *
 *   - **THE MELON.** A beluga's forehead is a soft round dome it can change the
 *     shape of. `collections/ocean.ts` priced a DOME as the clearest commission
 *     in that collection — three species wanted one — and this is a fourth. What
 *     stands in is `box-25`, the koala's ear, which is the only RADIAL shape in
 *     the bank of any size: 0.743 x 0.743 x 0.348, round in its own plane, and
 *     `{ z, 90 }` takes its `x +1` attachment to `y +1` so it stands on the
 *     crown. It is a disc rather than a hemisphere and it says so.
 *   - **THE RIDGE.** Five `cone-01` along the spine, buried to 0.85 so each
 *     shows about 0.060. That is real anatomy rather than decoration — the
 *     dorsal ridge with its knuckles is what a beluga has where a fin would be.
 *
 * The melon also happens to fix the legless height toll: a bare cube with no
 * legs measures 1.250 against the pack's 1.43 floor, and the dome takes the
 * animal to roughly 1.51, inside the band. That was not why it is here, but it
 * is worth knowing before anybody flattens it.
 *
 * Against `animal-narwhal`, which is its twin in every other respect: no tusk,
 * and white rather than mottled. Those two ARE the same family and the file for
 * that one says so from the other side.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z before the chamfer falls away. */
const CROWN_Y = 1.43125

/**
 * The melon's burial. `box-25` is 0.743 along its own facing; at 0.65 it stands
 * 0.260 above the crown, which puts this animal at about 1.51 — inside the
 * pack's 1.43-2.02 band, where a bare legless cube is 1.250 and under the floor.
 */
const MELON_SINK = 0.65

export const BELUGA_ASSEMBLY = defineCreature('animal-beluga', {
  palette: {
    coat: 0xf1f5f8,    // UNREVIEWED: the whole animal, white with a cool cast
    belly: 0xffffff,   // UNREVIEWED: a true white underside and the sclera
    fin: 0xdfe7ed,     // UNREVIEWED: flippers and fluke, a shade under the coat
    mouth: 0x8f9aa4,   // UNREVIEWED: the smile, and it needs to be soft
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  belly: 0.5,
  legs: false,

  /* Small, dark and low. A beluga's eye is a bead behind the corner of the
   * mouth and is nearly the only mark on the animal. */
  eyes: { part: 'plate-06', x: 0.2625, y: 0.95 },

  /* Horizontal, like the whale's and the dolphin's and the orca's. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* THE MELON, and it is a stand-in for a dome — see the header and
     * `collections/ocean.ts`, which prices that commission. `box-25` is the only
     * radial shape in the bank of any size; `{ z, 90 }` takes its `x +1`
     * attachment to `y +1` so it stands on the crown rather than off a cheek. */
    {
      name: 'melon',
      part: 'box-25',
      paint: 'coat',
      spin: [{ axis: 'z', deg: 90 }],
      sink: MELON_SINK,
      at: [0, CROWN_Y, 0.22],
    },

    /* THE DORSAL RIDGE, in place of the fin every other cetacean here has.
     * Five knuckles, buried to 0.85 so each shows about 0.060. Stations on the
     * pack's own 1/16 grid, from -0.0625 back to -0.5625, all inside the flat
     * crown's own reach plus the burial. */
    { name: 'knuckle-1', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.0625] },
    { name: 'knuckle-2', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.1875] },
    { name: 'knuckle-3', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.3125] },
    { name: 'knuckle-4', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.4375] },
    { name: 'knuckle-5', part: 'cone-01', paint: 'coat', sink: 0.85, at: [0, CROWN_Y, -0.5625] },

    /* Short round flippers — the penguin's wing, which already is a flipper. */
    {
      name: 'flipper',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -30 }],
      sink: 0.6,
      at: [0.625, 0.52, 0.1875],
    },

    /* The smile. A beluga's mouth line curves up at the corner and that is the
     * second thing anyone knows about it; a straight card is as near as a flat
     * sheet gets, and it is stretched wide rather than bent. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [1.8, 1, 1], at: [0, 0.74, 0.635] },
  ],

  flag: 'THE POINT OF THIS ANIMAL IS A PART THAT IS NOT THERE. Four cetaceans are built and '
    + 'every one stands a blade on its back — wedge-19 on the shark, dolphin and whale, box-06 '
    + 'on the orca — and a beluga is the only whale in the world with NO DORSAL FIN, because it '
    + 'swims under ice. So the separation is subtraction, plus a low knuckled RIDGE of five '
    + 'cone-01 buried to 0.85, which is what a beluga has where a fin would be. THE MELON IS A '
    + 'STAND-IN FOR A DOME AND SAYS SO: collections/ocean.ts prices a dome as that collection\'s '
    + 'clearest commission (the jellyfish, the tortoise and the sea turtle all want one) and '
    + 'this is a FOURTH species asking for the same shape. What is here is box-25, the koala\'s '
    + 'ear — the only radial shape of any size in the bank — spun { z, 90 } so its x +1 '
    + 'attachment stands up off the crown. It is a disc, not a hemisphere. IT IS ALSO WHAT GETS '
    + 'THE ANIMAL OFF THE FLOOR: a legless cube measures 1.250 against the pack\'s 1.43 minimum '
    + 'and the melon takes it to about 1.51, so flattening the dome costs the height too. '
    + 'AGAINST animal-narwhal, its twin: no tusk, and white rather than mottled. NEW PALETTE, '
    + 'UNREVIEWED — and it is a white animal, so the eye, the mouth line and the melon\'s own '
    + 'shading are all it has.',
})
