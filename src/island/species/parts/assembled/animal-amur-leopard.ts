/**
 * The Amur leopard — the fifth spotted cat in this project, and the separations
 * are all measured rather than felt.
 *
 * `animal-jaguar` is on `box-12`, the widest shell, with eight big `plate-11`
 * rosettes. `animal-ocelot`, `animal-cheetah`, `animal-lynx` and
 * `animal-wildcat` are all on the plain 1.250 cube. So this one takes **`box-41`
 * — the only shell bigger on all three axes, and no cat in the project is on
 * it** — which means it reads as the biggest cat here before a child looks at a
 * single spot.
 *
 * Then three things that are true of this leopard and not of the others:
 *
 *   - **FOUR rosettes a side, not eight.** An Amur leopard's rosettes are
 *     larger and further apart than any other leopard's. `plate-11` is the
 *     biggest marking card in the bank and the COUNT is the separation from
 *     `animal-jaguar`, exactly as twelve `plate-10` separate the ocelot from
 *     the cheetah's eight.
 *   - **THE CAT'S OWN TAIL, WHICH NO CAT HERE WEARS.** `wedge-07` is
 *     `cat:tail` and `monkey:tail` in the bank's own provenance, 1.0466 of
 *     reach at 0.200 across, and fourteen species spend it — not one of them a
 *     cat. An Amur leopard's tail is the longest of any leopard's, carried for
 *     balance in snow.
 *   - **A PALE WINTER COAT.** Cream-gold rather than the jaguar's deep gold,
 *     the ocelot's tan or the cheetah's dry tan.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-41`'s FLAT plates, which are `box-03`'s at the same world coordinates. */
const CROWN_Y = 1.43125
const HULL_MID_Y = 0.80625
const REAR_PLATE_Z = -0.625
/** The flat flank plate at 0.625, plus the 0.010 the pack floats a card by. */
const CARD_X = 0.635

/** Four stations a side. Two columns, two rows, and nothing between them. */
const ROSETTE: readonly [number, number][] = [
  [1.03, 0.32], [1.03, -0.30], [0.62, 0.32], [0.62, -0.30],
]

export const AMUR_LEOPARD_ASSEMBLY = defineCreature('animal-amur-leopard', {
  palette: {
    coat: 0xe0d2a8,    // UNREVIEWED: pale winter cream-gold, the palest cat here
    belly: 0xfaf5ea,   // UNREVIEWED: the near-white underside
    mark: 0x33291f,    // UNREVIEWED: the rosettes and the nose
    limb: 0xcbbc92,    // UNREVIEWED: the long legs, a shade under the coat
    eye: 0xb9c47a,     // UNREVIEWED: the pale green-yellow this leopard has
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The only shell bigger on all three axes, and the only cat in the project on
   * it. `animal-buffalo.ts` and `animal-gorilla.ts` are the neighbours here and
   * neither is a cat. */
  hull: { part: 'box-41' },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone. Every cat in the project takes it. */
  belly: 0.5,

  legs: { x: 0.34, z: 0.32 },

  eyes: { paint: 'eye' },

  /* The smallest ear in the bank, at animal-cheetah.ts's own re-solved burial
   * and a station of this shell's own: `box-05` records a burial of ZERO on the
   * bee, which would stand the whole ear on the chamfer with nothing holding
   * it. 9/16 buries 0.130, past §3's own 0.125 floor. */
  ears: { part: 'box-05', paint: 'coat', sink: 0.5625, at: [0.22, CROWN_Y, 0.24] },

  /* The lion's and the tiger's own nose-tip, which the jaguar and the cheetah
   * both wear. A big cat's nose IS this shape; inventing one would be a lie. */
  nose: { part: 'box-32', paint: 'mark' },

  /* THE CAT'S OWN TAIL — `cat:tail` in the bank's provenance, and no cat in the
   * project has spent it. Hung at the body's own centre rather than the cat's
   * high root, so it continues the line of the back. */
  tail: { part: 'wedge-07', paint: 'coat', at: [0, HULL_MID_Y, REAR_PLATE_Z] },

  extras: ROSETTE.map(([y, z], i) => ({
    name: `rosette-${i}`,
    part: 'plate-11',
    kind: 'pair' as const,
    paint: 'mark',
    at: [CARD_X, y, z] as [number, number, number],
  })),

  flag: 'ROSTER §4 IS THE WHOLE RISK ON THIS ANIMAL: it is the FIFTH spotted cat in the '
    + 'project, after the jaguar, the ocelot, the cheetah and the frozen lion and tiger, and '
    + 'the sixth if you count the lynx. Three things are meant to carry it and all three are '
    + 'measurements. (1) THE SHELL: box-41 is the only hull bigger on all three axes and no '
    + 'other cat here is on it — the jaguar has box-12, the widest, and the other four share '
    + 'the plain cube. (2) THE COUNT: four plate-11 a side against the jaguar\'s eight, because '
    + 'an Amur leopard\'s rosettes really are larger and further apart than any other '
    + 'leopard\'s. (3) THE TAIL: wedge-07 is the domestic CAT\'S own tail in the bank\'s '
    + 'provenance and fourteen species wear it, not one of them a cat — so the longest-tailed '
    + 'leopard gets the cat\'s own rope and no other cat here does. THE ROSETTES ARE SOLID '
    + 'CARDS AND A LEOPARD\'S ARE OPEN RINGS, which is the project\'s oldest wall: colour is a '
    + 'texture LOOKUP with no positional information, Paint.patch takes one HEIGHT, and byBand '
    + 'cuts only where Kenney already cut. animal-jaguar.ts and animal-ocelot.ts say the same '
    + 'thing. If it still twins with the jaguar for you, the dial is the palette — this coat '
    + 'is deliberately the palest of the five. NEW PALETTE, UNREVIEWED. Nothing is stretched.',
})
