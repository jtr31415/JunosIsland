/**
 * The magpie — pied, and the only passerine here with a long tail.
 *
 * **Read `animal-robin.ts` first.** The passerine idiom is settled there and
 * this file changes exactly two things, which are the two things a magpie is:
 *
 *   - **The tail.** `wedge-18`, the tiger's whip — 1.047 of reach on a 0.200
 *     section, the longest thinnest shape in the bank. Every other bird on this
 *     page wears the parrot's short fan; a magpie's tail is longer than its
 *     body and it is the first thing a child sees. Carried at 17/16, which is a
 *     BOUND rather than a taste: `wedge-18`'s buried root runs local y -0.5233
 *     to -0.3411 and the flat rear plate every hull shares runs world y 0.49375
 *     to 1.11875, so the join has to sit in [1.0171, 1.4598] for the root to be
 *     backed by real face at all. At the plate's own centre the whole root lands
 *     BELOW it and the tail floats. `animal-pheasant.ts` derives the same bound.
 *   - **The white.** `box-39`'s band 3 — the forward-facing band the robin
 *     paints red — goes white, which is a magpie's breast exactly. And
 *     `plate-10`, the smaller marking card, sits on each flank as the white
 *     scapular patch a magpie carries over the shoulder.
 *
 * Everything else is black, including the wing, which is right: the wing's own
 * blue-green gloss is a hue this mechanism has no way to say on one part.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The flat rear plate every one of the pack's ten hulls shares. */
const REAR_PLATE_Z = -0.625

/**
 * 17/16, and it is a bound rather than a taste — see the header. It is the
 * lowest point on the pack's own 1/16 grid inside [1.0171, 1.4598], so the tail
 * is carried as low as it can be and still be attached: 0.124 under the tiger's
 * own recorded 1.1867.
 */
const TAIL_Y = 1.0625

/** The card shell: the flat side face at 0.625 plus the pack's own 0.010. */
const CARD_SHELL = 0.635

/**
 * `plate-10`'s own recorded station, taken unmodified — the bare donor transfer
 * `animal-salamander.ts` verified lands edge-on to this solid's flat side face
 * and `animal-quail.ts` spends as a cheek fleck. Here it is the scapular.
 */
const SCAPULAR_Y = 0.99675
const SCAPULAR_Z = -0.18606

export const MAGPIE_ASSEMBLY = defineCreature('animal-magpie', {
  palette: {
    coat: 0x1a191d,
    white: 0xf2f0ea,
    flight: 0x101216,
    limb: 0x2a2721,
    eye: 0x0d0b09,
    pupil: PACK_PUPIL,
  },

  /* The robin's own band, in white — which on this bird is not a patch but the
   * whole front of it. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'white' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  snout: { part: 'cone-06', paint: 'coat' },

  /* THE LONG TAIL. See the header for why 17/16 is a bound and not a choice. */
  tail: { part: 'wedge-18', paint: 'flight', at: [0, TAIL_Y, REAR_PLATE_Z] },

  legs: false,
  extras: [
    {
      name: 'leg-front',
      part: 'box-01',
      paint: 'limb',
      kind: 'pair',
      sink: LEG_ROW.sink,
      at: [0.25, LEG_ROW.y, 0],
    },

    {
      name: 'wing',
      part: 'wedge-19',
      paint: 'flight',
      kind: 'pair',
    },

    /* THE SCAPULAR. `plate-10` at its own recorded station, a bare donor
     * transfer — the white patch a magpie carries over each shoulder, which is
     * the half of its pied marking the hull's own band cannot reach. */
    {
      name: 'scapular',
      part: 'plate-10',
      paint: 'white',
      kind: 'pair',
      at: [CARD_SHELL, SCAPULAR_Y, SCAPULAR_Z],
    },
  ],

  flag: 'TWO THINGS MAKE THIS BIRD AND BOTH ARE WORTH YOUR EYE. THE TAIL is wedge-18, the '
    + 'tiger\'s whip — 1.047 of reach on a 0.200 section, the longest thinnest shape in the bank '
    + '— where every other bird on this page wears the parrot\'s short fan, because a magpie\'s '
    + 'tail is longer than its body. Its height is a BOUND rather than a taste: the shape\'s '
    + 'buried root runs local y -0.5233 to -0.3411 and the flat rear plate every one of the '
    + 'pack\'s ten hulls shares runs world y 0.49375 to 1.11875, so the join has to sit in '
    + '[1.0171, 1.4598] for the root to be backed by face at all — at the plate\'s own centre the '
    + 'whole root lands below it and the tail floats. 17/16 is the lowest grid point inside that, '
    + 'so it is carried as low as it can be and still be attached. THE WHITE is two mechanisms: '
    + 'box-39\'s band 3, the forward-facing band animal-robin.ts paints red, which on a magpie is '
    + 'not a patch but the whole front of the bird; and plate-10 at its own recorded station, a '
    + 'bare donor transfer, as the white scapular over each shoulder. THE WING IS FLAT BLACK '
    + 'rather than glossed: a magpie\'s primaries carry a blue-green sheen and one part takes one '
    + 'hue (rule 8), so it is left as the honest black. NEW PALETTE, UNREVIEWED.',
})
