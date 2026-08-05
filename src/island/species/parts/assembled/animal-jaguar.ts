/**
 * The jaguar — the heaviest cat in the project, and the only one not on a
 * 1.250-wide shell.
 *
 * Six cats are now in the tree and two of them are FROZEN. `animal-lion` and
 * `animal-tiger` cannot be edited; `animal-cheetah` (Africa), `animal-lynx` and
 * `animal-wildcat` (Woodland) all sit on the plain cube, and `collections/africa.ts`
 * already spent the cheetah's separation on markings rather than silhouette. So
 * this one separates FIRST on the shell and only then on the coat:
 *
 *   - **`box-12`, the widest in the bank at 1.5395** — the cow's and the deer's,
 *     and no cat in the project wears it. A jaguar is short, broad and
 *     heavy-headed, which is the one thing that is true of it and of no other
 *     spotted cat.
 *   - **THE ROSETTES ARE `plate-11`, the BIGGER marking card** — 0.400 x 0.433
 *     against the cheetah's `plate-10` at 0.244 x 0.253, four a side rather than
 *     four in total. A jaguar's rosettes are large and few; a cheetah's spots are
 *     small and many, and that is a 1.7x gap in the card rather than an opinion.
 *   - **`box-23`, the fox's brush** — 0.744 across, the thickest tail in the bank
 *     and 1.67x the volume of any other. No cat in the project has it; the
 *     cheetah, the wildcat and the lynx are all on thin ropes or a stub.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-12`'s own side (0.769742) plus the 0.010 the pack floats a card by. */
const CARD_X = 0.779742

/** Four stations a side: two rows on the flat flank, two columns. */
const ROSETTE: readonly [number, number][] = [
  [1.05, 0.22], [1.05, -0.24], [0.62, 0.22], [0.62, -0.24],
]

export const JAGUAR_ASSEMBLY = defineCreature('animal-jaguar', {
  palette: {
    coat: 0xd8a54e,    // UNREVIEWED: a deeper gold than the cheetah's dry tan
    belly: 0xf3e8cf,   // UNREVIEWED: the cream underside
    mark: 0x2b2119,    // UNREVIEWED: the rosettes and the nose
    limb: 0xbb8b3c,    // UNREVIEWED: the heavy legs, a shade under the coat
    eye: 0xc2922c,     // UNREVIEWED: amber, to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE WIDEST SHELL IN THE BANK. Its extra 0.289 is two fused ear lugs high on
   * the head (`animal-badger.ts` measured them), which on a cat reads as the
   * broad heavy skull that is the whole point of the animal. */
  hull: { part: 'box-12' },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* Stocky rather than long: the wheelbase goes WIDE, and the outer face of each
   * leg lands on 0.5875 against this shell's own 0.7697, well inside the pack's
   * footprint axiom. */
  legs: { x: 0.4, z: 0.3 },

  /* The beaver's and the polar bear's round ear, at its own recorded station —
   * small and round, against the lynx's tufts and the cheetah's `box-05`. */
  ears: { part: 'box-02', paint: 'coat' },

  eyes: { paint: 'eye' },

  /* The lion's and the tiger's own nose-tip. A big cat's nose IS this shape and
   * inventing a different one would be a lie; the cheetah wears it too. */
  nose: { part: 'box-32', paint: 'mark' },

  /* The fattest tail in the bank, at the body's own centre rather than the fox's
   * high root — a jaguar's tail continues the line of the back. */
  tail: { part: 'box-23', paint: 'coat', at: [0, 0.80625, -0.625] },

  extras: ROSETTE.map(([y, z], i) => ({
    name: `rosette-${i}`,
    part: 'plate-11',
    kind: 'pair' as const,
    paint: 'mark',
    at: [CARD_X, y, z] as [number, number, number],
  })),

  flag: 'THE ROSETTES ARE FLAT CARDS AND A JAGUAR\'S ARE RINGS WITH A SPOT INSIDE. Colour is '
    + 'a texture LOOKUP with no positional information at all, `Paint.patch` takes one HEIGHT '
    + 'and `byBand` cuts only where Kenney already cut, so a ring inside a ring cannot be '
    + 'said. Eight plate-11 at their own size — the biggest marking card in the bank — are '
    + 'the honest approximation: large and few, which is what separates them from '
    + 'animal-cheetah\'s eight small plate-10. THE SHELL IS THE SEPARATION THAT DOES THE WORK: '
    + 'box-12 at 1.5395 across is the widest in the bank and no other cat in the project is '
    + 'on it, so this animal reads as heavy before a child looks at a single spot. NOTHING IS '
    + 'STRETCHED. NEW PALETTE, UNREVIEWED.',
})
