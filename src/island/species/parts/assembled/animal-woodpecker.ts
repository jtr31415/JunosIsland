/**
 * The woodpecker — a chisel, a red crown and a tail that is a PROP.
 *
 * **Read `animal-robin.ts` first.** The passerine idiom is settled there and the
 * hull, the legs, the bill and the wing come from it unchanged. Two things are
 * this bird's own and both are anatomy rather than decoration:
 *
 *   - **The tail is `wedge-03`, the beaver's paddle — the ONLY tail in the bank
 *     with a flattened section** (0.726 across against 0.589 through, a ratio of
 *     0.811 where every other tail is 0.97 or rounder). A woodpecker's tail is
 *     stiff and flattened because it is a third leg: the bird props it against
 *     the trunk and leans back on it. So the one shape in the bank that is a
 *     blade rather than a rope is the one this species actually needs, and it
 *     arrives for the right reason rather than by elimination.
 *   - **The red crown is a card lying on the top face.** `plate-10`, spun
 *     `{ axis: 'z', deg: 90 }` so its `x +1` attachment becomes `y +1`, at the
 *     hull's own top plus the 0.010 of daylight the pack gives a flat card —
 *     which is `animal-civet.ts`'s crest idiom, spent here on a patch the island
 *     camera actually looks down on.
 *
 * Band 3 goes white: a great spotted woodpecker is black and white with one red
 * patch, and the hull's own forward band is the white half of that for nothing.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/**
 * The top face plus the card shell. `box-39` is the shared 1.250 cube, so its
 * flat crown is 1.43125 and `CARD_STANDOFF` is the 0.010 the pack itself gives
 * a zero-thickness card — the same sum `animal-civet.ts` writes as `BACK_Y`.
 */
const CROWN_Y = 0.80625 + 0.635

/** `plate-10`'s own recorded z, kept rather than picked. */
const CROWN_Z = 0.18606

export const WOODPECKER_ASSEMBLY = defineCreature('animal-woodpecker', {
  palette: {
    coat: 0x24242a,
    belly: 0xf0eee6,
    flight: 0x1a1a20,
    crown: 0xc0342c,
    limb: 0x585048,
    eye: 0x141210,
    pupil: PACK_PUPIL,
  },

  /* Kenney's own white FRONT, painted white — which on a pied woodpecker is
   * exactly what it is rather than an approximation of something else. */
  hull: { part: 'box-39', paint: { base: 'coat', byBand: { 3: 'belly' } } },

  eyes: { part: 'plate-08', paint: 'eye' },

  /* The parrot\'s point, painted slate. It is the bank\'s only true point and a
   * woodpecker\'s bill is a chisel, so the shape is right even though the length
   * is short — see the flag. */
  snout: { part: 'cone-06', paint: 'limb' },

  /* THE PROP. The only flattened-section tail in the bank, by donor transfer. */
  tail: { part: 'wedge-03', paint: 'flight' },

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

    /* THE RED CROWN. `animal-civet.ts`\'s crest idiom: a marking card turned off
     * the flank and onto the top face, where the island\'s downward camera can
     * see it. One, on the midline, because a woodpecker has one. */
    {
      name: 'crown',
      part: 'plate-10',
      paint: 'crown',
      spin: [{ axis: 'z', deg: 90 }],
      at: [0, CROWN_Y, CROWN_Z],
    },
  ],

  flag: 'THE TAIL IS THE ONE PART IN THE BANK THIS SPECIES ACTUALLY NEEDS, which does not happen '
    + 'often. wedge-03, the beaver\'s paddle, is the ONLY tail of the seven with a flattened '
    + 'section — 0.726 across against 0.589 through, a ratio of 0.811 where every other tail is '
    + '0.97 or rounder — and a woodpecker\'s tail is stiff and flattened because it is a third '
    + 'leg it props against the trunk. So the shape arrives for the right reason rather than by '
    + 'elimination. THE RED CROWN IS A CARD ON THE TOP FACE: plate-10 spun { axis: z, deg: 90 } '
    + 'so its x +1 attachment becomes y +1, at the crown plus the 0.010 of daylight the pack '
    + 'gives a flat card. That is animal-civet.ts\'s crest idiom, and the island camera looks '
    + 'DOWN, so this is the one marking on the bird a child is guaranteed to see. THE BILL IS '
    + 'SHORT AND THAT IS THE HONEST LIMIT: cone-06 is the bank\'s only true point (taper 0) and '
    + 'it reaches 0.183, where a woodpecker\'s chisel is nearly the length of its head. There is '
    + 'nothing longer and stretching a nose is exactly what you flagged on 2 August, so the '
    + 'shape is right and the proportion is not. THE BARRED WING AND THE RED VENT are not here '
    + 'for the usual reason — box-39 has two bands and both are spent, and one part takes one '
    + 'hue. NEW PALETTE, UNREVIEWED.',
})
