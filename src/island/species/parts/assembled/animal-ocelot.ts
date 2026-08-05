/**
 * The ocelot — the small spotted cat, and the one that has to survive standing
 * next to `animal-jaguar` on the same album page.
 *
 * Seven cats now. Two are FROZEN (`animal-lion`, `animal-tiger`), three are built
 * on the plain cube (`animal-cheetah`, `animal-lynx`, `animal-wildcat`) and the
 * jaguar is the only one on `box-12`. This one is deliberately on the cube with
 * the other three, because an ocelot IS a small cat and giving it an odd body to
 * look different would be inventing. Every separation is therefore made on the
 * three things a cat actually varies:
 *
 *   - **AGAINST THE JAGUAR — the SHELL and the TAIL.** 1.250 against 1.5395
 *     across, and `wedge-18` at 0.200 thick against `box-23` at 0.744. §7 splits
 *     the pack's seven tails on thickness and that 3.7x is the widest gap the
 *     bank offers between two long tails; `africa.ts` spends the same gap on the
 *     meerkat and the mongoose.
 *   - **AGAINST THE CHEETAH — the COUNT and the EAR.** Twelve `plate-10` in two
 *     rows of three a side, running in CHAINS along the flank, against the
 *     cheetah's eight scattered singly. The ear is `box-30`, the LION's own,
 *     which only `animal-otter` has ever spent, against the cheetah's `box-05` —
 *     the biggest cat ear in the bank against the smallest ear in it.
 *   - **AGAINST THE LYNX AND THE WILDCAT — the EYE.** `plate-08`, the pack's
 *     round card, painted gold to the rim. The lynx wears the panda's oval and
 *     the wildcat the default.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s own crown, card shell and centre height. */
const CROWN_Y = 1.43125
const CARD_X = 0.635
const HULL_MID_Y = 0.80625

/**
 * Two rows of three, and both spacings are the closest two `plate-10` can sit
 * without becoming coplanar and overlapping: the card is 0.244 tall by 0.253
 * deep, so 0.25 between rows and 0.26 between columns.
 */
const SPOT: readonly [number, number][] = [
  [0.9375, 0.26], [0.9375, 0], [0.9375, -0.26],
  [0.6875, 0.26], [0.6875, 0], [0.6875, -0.26],
]

export const OCELOT_ASSEMBLY = defineCreature('animal-ocelot', {
  palette: {
    coat: 0xd0a463,    // UNREVIEWED: warm tan, lighter than the jaguar's gold
    belly: 0xf5eddc,   // UNREVIEWED: the white underside
    mark: 0x3a2b1c,    // UNREVIEWED: the chained spots and the nose
    limb: 0xb88f4f,    // UNREVIEWED: the short legs
    eye: 0xd9b446,     // UNREVIEWED: gold, to the rim
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  eyes: { part: 'plate-08', paint: 'eye' },

  /* THE LION'S OWN EAR, and only `animal-otter` has spent it. It is a `z +1` ear
   * — the lion wears it forward on the head — so `axis: 'y'` remounts it on the
   * crown, buried its own 0.51 of 0.331, which leaves 0.163 proud. */
  ears: {
    part: 'box-30',
    paint: 'coat',
    axis: 'y',
    dir: 1,
    sink: 0.51,
    at: [0.25, CROWN_Y, 0.2],
  },

  /* The cat's own nose-tip, which `animal-wildcat.ts` also wears. A cat's nose
   * IS this shape and inventing a difference would be a lie; the separation
   * from that animal is the ear, the eye and the spots. */
  nose: { part: 'box-10', paint: 'mark' },

  /* The tiger's whip at the body's own centre — 0.200 across, the thin end of
   * §7's split, against the jaguar's 0.744 brush. */
  tail: { part: 'wedge-18', paint: 'coat', at: [0, HULL_MID_Y, -0.625] },

  extras: SPOT.map(([y, z], i) => ({
    name: `spot-${i}`,
    part: 'plate-10',
    kind: 'pair' as const,
    paint: 'mark',
    at: [CARD_X, y, z] as [number, number, number],
  })),

  flag: 'AN OCELOT\'S MARKINGS ARE OPEN-CENTRED ROSETTES RUNNING IN CHAINS and what is here '
    + 'is twelve solid cards. Colour is a texture LOOKUP with no positional information: '
    + '`Paint.patch` takes one HEIGHT and `byBand` cuts only where Kenney already cut, so a '
    + 'ring with a paler middle cannot be said and neither can a chain that joins up. Twelve '
    + 'plate-10 in two rows of three a side is the honest approximation and the COUNT is what '
    + 'separates it from animal-cheetah\'s eight. THE SHELL IS DELIBERATELY THE SAME CUBE the '
    + 'cheetah, the lynx and the wildcat wear — an ocelot is a small cat and giving it an odd '
    + 'body to look different would be inventing — so if it still reads as one more spotted '
    + 'cat to you, the fix is the palette or the spot stations, not the hull. NEW PALETTE, '
    + 'UNREVIEWED.',
})
