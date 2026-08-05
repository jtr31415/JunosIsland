/**
 * The sparrowhawk — the smallest footprint here but one, and the bird that has
 * to be told apart from `animal-goshawk` on a lever the pack barely has.
 *
 * **THESE TWO ARE THE SAME BIRD AT A FIFTH OF THE MASS IN LIFE, AND THE PACK CAN
 * SPEND 1.37x ON IT.** A sparrowhawk and a goshawk share plumage almost exactly
 * — slate above, barred rufous below, a yellow eye — and a birdwatcher separates
 * them on size and on the goshawk's white brow. The hull is never scaled, so the
 * only size vocabulary is the ten real shells: this one takes `box-31`, the
 * lion's, the SHALLOWEST at 1.125 deep and the smallest by volume at 1.7578, and
 * the goshawk takes `box-12` at 2.4054. That is the whole 1.37x, and it buys a
 * measured 1.8835 x 1.9585 against the goshawk's 2.1729 x 2.2208.
 *
 * The rest of the difference is spent on WING SHAPE, which is honest anatomy
 * rather than a workaround: `box-43`, the pack's own fish fin, is 0.3624 long
 * against `wedge-19`'s 0.5730, so this bird's wings reach 0.3167 clear of the
 * flank instead of 0.4727 — short and round, which is what an ambusher in a
 * hedge has. The tail is `wedge-18` laid flat and long, because the other half
 * of a sparrowhawk is that it is mostly tail.
 *
 * The barring is `plate-11` by pure donor transfer, `animal-snowy-owl.ts`'s move.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/**
 * `box-31`'s rear face, and it is NOT what its depth suggests. The shell is
 * 1.125 deep but offset back 0.0625, so it runs z 0.500 to -0.625: the front
 * face is the shallow one and the rear sits exactly where every cube's does.
 */
const REAR_Z = -0.625

export const SPARROWHAWK_ASSEMBLY = defineCreature('animal-sparrowhawk', {
  palette: {
    coat: 0x5a6472,    // UNREVIEWED: slate blue-grey above
    belly: 0xf0e6da,   // UNREVIEWED: cream below
    bar: 0xa8613c,     // UNREVIEWED: the rufous barring cards
    limb: 0xe0b83c,    // UNREVIEWED: long yellow legs, which this bird has
    bill: 0x2c2f34,    // UNREVIEWED: small and dark
    hook: 0x16181b,    // UNREVIEWED: the tip
    eye: 0xd8a41e,     // UNREVIEWED: chrome yellow — the hawk eye
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The lion's shell: shallowest and smallest in the bank. See the header. Note
   * its front face is z 0.500 while the eye card stays at the pack's absolute
   * 0.6350, so the cards float 0.135 proud — which is what the lion itself does. */
  hull: { part: 'box-31' },
  belly: 0.5625,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },

  /* Laid flat by {x,90} at this shell's own rear face — a long trailing tail. */
  tail: { part: 'wedge-18', paint: 'coat', spin: [{ axis: 'x' as const, deg: 90 }], at: [0, 0.80625, REAR_Z] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* The pack's own FISH FIN as a short round wing — 0.3624 against wedge-19's
     * 0.5730. It carries the `wing` role, so the wingbeat attaches by itself. */
    { name: 'wing', part: 'box-43', paint: 'coat', kind: 'pair' as const },
    /* The barring, by pure donor transfer at the cow's and giraffe's own flank
     * station — `animal-snowy-owl.ts`'s idiom, used here for a barred bird. */
    { name: 'bar', part: 'plate-11', paint: 'bar', kind: 'pair' as const },
  ],

  flag: 'THIS BIRD AND animal-goshawk ARE ONE ANIMAL AT TWO SIZES IN LIFE, AND THE PACK CAN '
    + 'ONLY SPEND 1.37x ON IT. A sparrowhawk is roughly a fifth of a goshawk\'s mass and they '
    + 'are otherwise the same slate-and-barred hawk. The hull is never scaled, so all the size '
    + 'there is is the ten real shells, and their whole volume range is 1.7578 (box-31, this '
    + 'one) to 2.4054 (box-12, the goshawk). Measured, that lands 1.8835 x 1.9585 against '
    + '2.1729 x 2.2208. THE REST IS WING SHAPE AND IT IS HONEST: box-43, the pack\'s own fish '
    + 'fin, reaches 0.3167 clear of the flank where wedge-19 reaches 0.4727 — short and round, '
    + 'which is what a hedge ambusher has. If they still read as twins, the lever left is the '
    + 'goshawk\'s white brow card, and the other lever would be a hull ruling. NEW PALETTE, '
    + 'UNREVIEWED.',
})
