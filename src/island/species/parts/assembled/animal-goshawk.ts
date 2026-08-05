/**
 * The goshawk — `animal-sparrowhawk.ts`'s twin, and read that file first: the
 * measurement of how little size this pack can spend lives there, and it is the
 * argument this bird exists inside.
 *
 * Two things are its own, and both are chosen because size could not be.
 *
 * **THE WHITE BROW.** `plate-10`, the cow's and giraffe's small flank card,
 * spun `{y, -90}` so its `x +1` face turns forward, placed as a pair at
 * y = 1.090 — which puts it x 0.114..0.366 and y 0.968..1.212, sitting on the
 * top edge of a `plate-08` eye card that finishes at 1.094. A goshawk's white
 * supercilium is the single field mark that separates it from a sparrowhawk at
 * any distance, and here it is 20 triangles.
 *
 * **THE WIDEST SHELL IN THE BANK.** `box-12`, the cow's and the deer's, 1.5395
 * across, and the legs go out to 0.31 with it — 0.27 scaled by the shell's own
 * extra width, which is what `creature.ts` would have done had they not been
 * placed by hand for the talons.
 *
 * The eye goes ORANGE rather than the sparrowhawk's chrome yellow, which is a
 * real difference in the adult birds and costs nothing.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/** The face card plane: 0.005 behind `EYE_CARD_Z`, so the eyes stay in front. */
const FACE_Z = 0.63
/** 0.27 scaled by `box-12`'s own width — the wider body stands wider. */
const LEG_X = 0.31

export const GOSHAWK_ASSEMBLY = defineCreature('animal-goshawk', {
  palette: {
    coat: 0x6e7480,    // UNREVIEWED: pale slate above
    belly: 0xf4f0e8,   // UNREVIEWED: white below
    /* The coat's own colour under a second name, and it exists because
     * `belly` splits the CELL of the slot the HULL is painted from — so a
     * part that also said `coat` was reading the wrong half of it. See
     * `animal-stoat.ts`'s header and the note in `collections/raptors.ts`. */
    flight: 0x6e7480,  // UNREVIEWED: wings and tail — the coat's slate, under its own name
    mark: 0xffffff,    // UNREVIEWED: the brow card, whiter than the belly on purpose
    limb: 0xe0b83c,    // UNREVIEWED: heavy yellow legs
    bill: 0x2c2f34,    // UNREVIEWED: dark
    hook: 0x16181b,    // UNREVIEWED: the tip
    eye: 0xd05a1e,     // UNREVIEWED: orange — an adult goshawk's, against the sparrowhawk's yellow
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The cow's shell, the widest in the bank. See `animal-sparrowhawk.ts`. */
  hull: { part: 'box-12' },
  belly: 0.5625,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'wedge-18', paint: 'flight', spin: [{ axis: 'x' as const, deg: 90 }], at: [0, 0.80625, -0.625] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [LEG_X, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [LEG_X, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'box-43', paint: 'flight', kind: 'pair' as const },
    /* THE WHITE BROW — see the header for where the card lands against the eye. */
    { name: 'brow', part: 'plate-10', paint: 'mark', kind: 'pair' as const, at: [0.24, 1.09, FACE_Z], spin: [{ axis: 'y' as const, deg: -90 }] },
  ],

  flag: 'THE WHITE BROW IS DOING THE WORK THAT SIZE CANNOT — read animal-sparrowhawk.ts first, '
    + 'where the measurement is. These two are one hawk at a fifth of the mass in life and the '
    + 'pack can only spend 1.37x of hull volume on the difference. So this bird gets the field '
    + 'mark instead: plate-10, the cow\'s flank card, spun {y,-90} to turn its x +1 face '
    + 'forward, at y 1.090 — landing x 0.114..0.366, y 0.968..1.212, on the top edge of an eye '
    + 'card that finishes at 1.094. Twenty triangles. THE FLANK CARD FACING FORWARD IS THE '
    + 'IDIOM three birds here share: it is a brow on this one, a moustache on the peregrine and '
    + 'a facial disc on the barn owl, and §3.1 says a part\'s identity is its placement. THE '
    + 'EYE IS ORANGE against the sparrowhawk\'s chrome yellow, which is true of the adults and '
    + 'costs nothing. NEW PALETTE, UNREVIEWED.',
})
