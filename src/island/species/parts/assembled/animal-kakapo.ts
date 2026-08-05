/**
 * The kakapo — a parrot with an owl's face, and the first FACIAL DISC in the
 * project. It falls out of one hull choice and no numbers at all.
 *
 * `blade-05` is the lion's muzzle plate: 1.000 x 1.000 x 0.125, the only broad
 * flat SOLID sheet in the bank, attaching `z +1` at a recorded burial of zero.
 * It is exactly a facial disc and it has been unusable as one, because on every
 * usual hull its front face lands at 0.750 — in front of `EYE_CARD_Z`, so it
 * would bury the eyes it is supposed to surround.
 *
 * **`box-31` is what makes it work, and it works EXACTLY.** The lion's shallow
 * shell has its front face at 0.500 rather than 0.625, so a pure donor transfer
 * — no `at`, no `sink`, no spin — puts the plate's centre at 0.5625 and its
 * front face at 0.6250. The eye cards then sit at the absolute 0.6350, floating
 * **0.010 proud of the disc**, which is `CARD_STANDOFF`: the pack's own daylight
 * for a card, recovered rather than chosen. `hulls.ts` calls box-31's 0.135 of
 * extra eye clearance "the lion's own arrangement"; this animal spends it.
 *
 * **NO WINGS AT ALL, AND THAT IS THE DESIGN.** A kakapo is the only parrot in
 * the world that cannot fly. `animal-beluga.ts` argues subtraction the same way
 * for the only whale with no dorsal fin, and it is also what keeps this bird
 * from twinning with `animal-cockatoo`, which wears four parrot parts.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

/** The disc's own front plane, solved: box-31's front 0.500 plus half of 0.125. */
const DISC_FRONT_Z = 0.625
/** box-31's flat flank plate, plus the 0.010 the pack floats a card by. */
const CARD_X = 0.635

/** Four stations of barring a side. */
const MOTTLE: readonly [number, number][] = [
  [1.05, 0.15], [1.05, -0.25], [0.75, 0.15], [0.75, -0.25],
]

export const KAKAPO_ASSEMBLY = defineCreature('animal-kakapo', {
  palette: {
    coat: 0x7f8f3e,    // UNREVIEWED: moss green, which is the whole point of the bird
    belly: 0xc4c877,   // UNREVIEWED: the yellow-green underside, and the disc
    bar: 0x4b4a22,     // UNREVIEWED: the dark barring cards, and the bristles
    bill: 0xd8d2bc,    // UNREVIEWED: the pale ivory bill
    limb: 0x8f8a76,    // UNREVIEWED: the big grey scaly feet
    eye: 0x241f18,     // UNREVIEWED: the dark bead
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE LION'S SHALLOW SHELL, and it is the whole reason the face works — see
   * the header. Its front face is 0.500, not 0.625. */
  hull: { part: 'box-31' },
  belly: 0.4375,

  /* The pack's one ROUND card, dark. A kakapo's eye is a bead in a pale face. */
  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE FACIAL DISC. A pure donor transfer with nothing said about it: the
   * plate's own `z +1` attachment and its own zero burial on a hull whose front
   * face is 0.500. Everything in the header follows from that one line. */
  snout: { part: 'blade-05', name: 'disc', paint: 'belly' },

  /* The parrot's own beak, on the disc's placed front plane rather than on the
   * hull's — so it moves with the disc if the disc is ever moved. */
  nose: { part: 'cone-06', paint: 'bill', on: 'disc' },

  /* The parrot's fan, short, at the rear plate's own centre. */
  tail: { part: 'box-38', paint: 'coat', at: [0, 0.80625, -0.625] },

  legs: false,
  extras: [
    /* Two legs on the pack's own row at box-01's recorded x — the only station
     * a biped's legs can be at. A kakapo's feet are famously huge and grey. */
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair', sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },

    /* THE RICTAL BRISTLES, which a kakapo uses to feel its way about at night
     * and which every photograph of one shows. cone-01 is one of two records in
     * the whole bank with taper 0 — a true point — turned 135 degrees so it
     * hangs down and forward, and joined ON the disc's own face rather than on
     * the hull, at a station wholly inside the plate's 1.000 square. */
    {
      name: 'bristle',
      part: 'cone-01',
      paint: 'bar',
      kind: 'pair',
      spin: [{ axis: 'x', deg: 135 }],
      at: [0.3, 0.45, DISC_FRONT_Z],
    },

    /* THE BARRING. A green bird on green grass has no outline, so eight flat
     * cards go dark — `animal-snowy-owl.ts`'s argument, which is the same
     * problem in the opposite colour. */
    ...MOTTLE.map(([y, z], i) => ({
      name: `bar-${i}`,
      part: 'plate-10',
      kind: 'pair' as const,
      paint: 'bar',
      at: [CARD_X, y, z] as [number, number, number],
    })),
  ],

  flag: 'THE FACIAL DISC IS NEW TO THIS PROJECT AND IT COST NO NUMBERS. blade-05 is the '
    + 'LION\'S muzzle plate, 1.000 x 1.000 x 0.125, the only broad flat solid sheet in the '
    + 'bank — and it has been unusable as a face because on a normal hull its front lands at '
    + '0.750, in front of the 0.6350 eye plane, so it would bury the eyes. box-31\'s front face '
    + 'is 0.500, so a PURE donor transfer puts the disc\'s front at exactly 0.6250 and the eye '
    + 'cards float 0.010 proud of it — CARD_STANDOFF, the pack\'s own daylight for a card. That '
    + 'is a hull choice doing the work of a commission, and any owl or harrier built after this '
    + 'one should take the same shell. IT HAS NO WINGS, DELIBERATELY: the only parrot in the '
    + 'world that cannot fly, argued the way animal-beluga.ts argues the only whale with no '
    + 'dorsal fin, and it is also what keeps this bird off animal-cockatoo\'s four-parrot-parts '
    + 'silhouette. WHAT IS NOT HERE is the moss-green mottling a kakapo actually wears — colour '
    + 'is a lookup with no positional information, so eight flat cards are the honest version '
    + 'and they are doing the silhouette rather than the pattern. NEW PALETTE, UNREVIEWED.',
})
