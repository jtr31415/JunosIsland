/**
 * The red panda — rust above, BLACK below, and the pale face is two cards that
 * deliberately do not meet.
 *
 * Five procyonid-shaped animals stand near this one and the separation is made
 * against each: `animal-panda` is FROZEN and shares only a word; `animal-raccoon`
 * wears `box-36` with a dark mask bar, `animal-coati` an upturned `tube-07`,
 * `animal-kinkajou` one uniform gold, `animal-lemur` the panda cube's own cut.
 *
 *   - **THE BELLY LINE IS RUN BACKWARDS**, which is `animal-skunk.ts`'s trick and
 *     `animal-gorilla.ts`'s after it. `under` is the BLACK here, so 7/16 puts
 *     rust on the flank and black on the underside and the legs — and a dark
 *     underside is the one thing no other small procyonid in this project has.
 *   - **THE FACE IS TWO `plate-11` THAT DO NOT MEET.** `animal-raccoon.ts` puts
 *     the mirrored pair at half the card's own width so the two build ONE bar
 *     across the face. Placed at 0.28 they stop 0.0635 short of the midline, and
 *     the 0.127 of rust left between them is the stripe down a red panda's nose.
 *     Same shape, same spin, one number apart, opposite animal.
 *   - **The ear is `wedge-06`, the cat's**, 0.1545 proud at its own burial — a
 *     rounded triangle held wide, painted pale to the rim.
 *   - **The tail is `box-23`**, the fox's brush: round in section (0.910248 on
 *     both axes), taper 0.961, 1.67x the volume of any other tail. A red panda's
 *     tail is exactly that, and Kenney's own band 5 gives it ONE dark ring where
 *     the animal has six. The rings are the flagged loss.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import { EYE_CARD_Z } from '../hulls'

/** The midpoint of the pack's own card daylight — `animal-raccoon.ts`'s solve. */
const CARD_Z = (0.625 + EYE_CARD_Z) / 2

/**
 * 0.28, which is `animal-raccoon.ts`'s 0.2165 (half the card's own width, where
 * the pair meets exactly) plus 4/64. The pair stops short of the midline and
 * leaves 0.127 of rust between the two cheeks.
 */
const CHEEK_X = 0.28

export const RED_PANDA_ASSEMBLY = defineCreature('animal-red-panda', {
  palette: {
    coat: 0xb5561e,    // UNREVIEWED: the rust of a red panda's back
    dark: 0x2b211c,    // UNREVIEWED: the BLACK underside and legs — `under`
    pale: 0xf2ece0,    // UNREVIEWED: the cheeks, the muzzle, the sclera
    mark: 0x1c1613,    // UNREVIEWED: the nose and the tail's one ring
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03', paint: 'coat' },

  /* THE INVERSION. `under` is the black, so `belly` paints the underside DARK
   * rather than pale — animal-skunk.ts's finding, spent a third time. 7/16
   * rather than the usual 8/16 because a red panda's black starts below the
   * flank, not at the equator. */
  under: 'dark',
  belly: 0.4375,

  legs: { paint: 'dark' },

  /* `under` is the black, so the sclera has to be named or the eye inverts —
   * animal-ferret.ts measured that and animal-gorilla.ts pays it too. */
  eyes: { paint: 'pale' },

  /* The cat's ear at its own recorded station: 0.1545 proud, the shallowest
   * burial of any `y +1` wedge, painted pale to the rim. */
  ears: { part: 'wedge-06', paint: 'pale' },

  /* The beaver's short barrel, painted pale — a red panda's muzzle is white and
   * blunt where the raccoon's and the coati's are long. */
  snout: { part: 'tube-01', paint: 'pale' },
  nose: { part: 'box-09', paint: 'mark' },

  /* Pure donor transfer: its own facing, its own 0.177404 burial, no spin, no
   * stretch. Band 5 is the top half of the tip half — ONE ring. */
  tail: { part: 'box-23', paint: { base: 'coat', byBand: { 5: 'mark' } } },

  extras: [
    /* THE CHEEKS. animal-raccoon.ts's mask card, at a station where the pair
     * does NOT meet. See CHEEK_X. */
    {
      name: 'cheek',
      part: 'plate-11',
      paint: 'pale',
      kind: 'pair' as const,
      spin: [{ axis: 'y' as const, deg: -90 }],
      at: [CHEEK_X, 0.70, CARD_Z] as [number, number, number],
    },
  ],

  flag: 'THE TAIL RINGS ARE NOT THERE and a red panda has six. Colour is a texture LOOKUP '
    + 'with no positional information: byBand can only recolour where Kenney already cut, and '
    + 'box-23 carries exactly one cut (band 5, the top half of the tip half), so the tail gets '
    + 'ONE dark ring. animal-lemur.ts and animal-coati.ts hit the same wall for the same '
    + 'animal-shaped reason. WHAT IS RIGHT AND IS THE THING TO LOOK AT: the belly line is RUN '
    + 'BACKWARDS — `under` is the BLACK, so 7/16 paints the underside and legs dark and leaves '
    + 'rust on the flank, which is animal-skunk.ts\'s trick and the one thing no other small '
    + 'procyonid here has. And the FACE is animal-raccoon.ts\'s mask card moved ONE NUMBER: it '
    + 'places the mirrored pair at 0.2165, half the card\'s own width, where the two meet '
    + 'exactly and build a single bar; this places them at 0.28, where they stop 0.0635 short '
    + 'and leave 0.127 of rust down the middle. Same shape, same spin, opposite animal. THE '
    + 'BRUSH IS SHARED with animal-fennec-fox, animal-dingo, animal-squirrel and '
    + 'animal-raccoon — it is the only round, thick, untapering tail in the bank and a red '
    + 'panda\'s is one, so it is taken on its measurements rather than avoided. NEW PALETTE, '
    + 'UNREVIEWED.',
})
