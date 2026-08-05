/**
 * The orca — the dorsal is the animal, and it is `box-06`, the bunny's ear.
 *
 * Three cetaceans are already built and all three wear `wedge-19`, the parrot's
 * wing, stood on end as a dorsal: the shark at z = -0.0625, the dolphin at
 * -0.25, the whale at -0.3125. `wedge-19` is 0.573 x 0.200 x 0.600 and stands
 * about 0.5 proud. **A bull orca's dorsal is taller than a man**, and it is the
 * one fact anyone knows about the animal, so a fourth copy of that blade at a
 * fourth z would have been a fourth of the same fish.
 *
 * `box-06` is the tallest shape in the ear family — 0.482 x 0.913 x 0.306 — and
 * its own attachment is `y +1`, which means an unspun copy stands straight up
 * off whatever it is placed on. It is 1.52x the reach of the wing blade. Turned
 * `{ y, 90 }` so its broad axis runs fore-and-aft rather than across the back,
 * it is a tall thin triangular blade on the spine, which is exactly the shape
 * that is missing. §3.1 taken seriously: a hare's ear, a bird's folded wing and
 * a killer whale's fin are one shape doing three jobs.
 *
 * **`sink: 0.25` is not a taste, it is the ceiling.** At its own recorded 0.366
 * the blade would put this animal at 2.026 against the pack's 2.02 maximum. At
 * 0.25 it measures inside the band with room. Height was decided first here,
 * exactly as `hulls.ts` says it must be.
 *
 * Everything else is separation from the three that exist:
 *
 *   - **The fluke is HORIZONTAL** (`box-38` spun `{ z, 90 }`) — the whale's and
 *     the dolphin's idiom, and correct, because an orca is a dolphin. The shark
 *     is the one with a vertical fin and that is a fish.
 *   - **No beak.** The dolphin's separation from the shark is `tube-03`; an
 *     orca has no beak at all, so it has none here, and that is what holds it
 *     apart from the dolphin at the front.
 *   - **The eye patch** is `plate-11`, the flank card, painted white and set
 *     high and forward. It is the second thing anyone draws on an orca.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-36`'s flat crown — the shared cube's, 1.250 above `HULL_BOTTOM_Y`. */
const CROWN_Y = 1.43125

/**
 * The dorsal's burial, and it is solved against the pack's height CEILING
 * rather than chosen. `box-06` is 0.913146 along its own facing; at the shape's
 * own recorded 0.366259 its tip lands at 2.2074 world, which is 2.026 of model
 * height against `PACK_HEIGHT_MAX` of 2.02. At 0.25 the tip is 2.1163 and the
 * animal measures 1.935.
 */
const DORSAL_SINK = 0.25

export const ORCA_ASSEMBLY = defineCreature('animal-orca', {
  palette: {
    coat: 0x15181d,    // UNREVIEWED: the black, which is not quite black
    belly: 0xf6f8f9,   // UNREVIEWED: the white underside and the eye patch
    fin: 0x1c2027,     // UNREVIEWED: dorsal, fluke and pectorals, a shade off the coat
    mouth: 0x33383f,   // UNREVIEWED: the mouth line
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-36' },
  belly: 0.4375,
  legs: false,

  /* Small and low, and set forward where the white patch sits behind it. */
  eyes: { part: 'plate-06', x: 0.28, y: 0.86 },

  /* HORIZONTAL, like the whale's and the dolphin's: a mammal's fluke, not a
   * fish's fin. The shark is the one with a vertical tail. */
  tail: { part: 'box-38', paint: 'fin', spin: [{ axis: 'z', deg: 90 }], sink: 0.3 },

  extras: [
    /* THE DORSAL, and it is the animal. See the header for why it is the
     * bunny's ear and why the sink is the ceiling rather than a preference. */
    {
      name: 'dorsal',
      part: 'box-06',
      paint: 'fin',
      spin: [{ axis: 'y', deg: 90 }],
      sink: DORSAL_SINK,
      at: [0, CROWN_Y, -0.0625],
    },

    /* Big paddle pectorals — the penguin's wing, which already is a flipper. */
    {
      name: 'pectoral',
      part: 'blade-06',
      paint: 'fin',
      kind: 'pair',
      spin: [{ axis: 'z', deg: -90 }, { axis: 'y', deg: -25 }],
      sink: 0.45,
      at: [0.625, 0.55, 0.1875],
    },

    /* THE EYE PATCH, high and forward of the eye. The flank card at its own
     * size, painted white — the second thing anybody draws on an orca. */
    { name: 'patch', part: 'plate-11', paint: 'belly', kind: 'pair', stretch: [1, 0.6, 0.7], at: [0.635, 0.98, 0.30] },

    /* THE SADDLE PATCH — the pale grey saddle behind the dorsal, which is the
     * marking field biologists identify individual orcas by. The flank card
     * again, further back and higher. */
    { name: 'saddle', part: 'plate-11', paint: 'mouth', kind: 'pair', stretch: [1, 0.5, 1.1], at: [0.635, 1.16, -0.22] },

    /* And the white jaw, low and forward — an orca's chin is white and it runs
     * back along the underside. `plate-10` at its own size. */
    { name: 'jaw', part: 'plate-10', paint: 'belly', kind: 'pair', stretch: [1, 1.2, 1.4], at: [0.635, 0.62, 0.28] },

    /* The mouth line, run wide and low. */
    { name: 'mouth', part: 'plate-13', paint: 'mouth', stretch: [2.2, 1, 1], at: [0, 0.70, 0.635] },
  ],

  flag: 'THE DORSAL IS box-06, THE BUNNY\'S EAR, AND IT IS THE WHOLE ANIMAL. Three cetaceans '
    + 'are already built and all three stand wedge-19 (the parrot\'s wing) on the crown as a '
    + 'dorsal; a fourth copy at a fourth z would have been a fourth of the same fish. box-06 is '
    + 'the tallest shape in the ear family at 0.913 of reach — 1.52x the wing blade — its own '
    + 'attachment is y +1 so an unspun copy stands straight up, and { y, 90 } turns its broad '
    + 'axis fore-and-aft. That is §3.1 paying out: a hare\'s ear, a folded bird wing and a bull '
    + 'orca\'s fin are one shape doing three jobs. THE SINK IS THE CEILING AND NOT A TASTE: at '
    + 'the shape\'s own 0.366 this animal measures 2.026 against the pack\'s 2.02 maximum, and '
    + 'at 0.25 it measures 1.935. If you want a taller fin you are trading against that number, '
    + 'not against anything else. NO BEAK, deliberately — tube-03 is what separates the dolphin '
    + 'from the shark and an orca has none — and the FLUKE IS HORIZONTAL, which is the whale\'s '
    + 'idiom and is right, because an orca is a dolphin. NEW PALETTE, UNREVIEWED.',
})
