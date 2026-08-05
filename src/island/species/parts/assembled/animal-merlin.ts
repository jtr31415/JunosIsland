/**
 * The merlin — the smallest thing in Raptors, and small is the only claim this
 * file is making, so it is worth saying exactly how small the pack allows.
 *
 * **KEEP-OUT 0.9302, the smallest in Raptors, against the collection's 1.1135 and
 * the fox's own 1.15.**
 * That is `box-31` (the lion's shell, the shallowest and smallest by volume at
 * 1.7578), the falcon wing laid over the back rather than out from the flank,
 * and `box-18` — the elephant's tail, the bank's only stub — turned 180 for a
 * short square tail. Nothing here is scaled; every one of those is a part
 * choice, and together they are the whole of what "small" can mean in this pack.
 *
 * It is still not small enough. A merlin is roughly a fifth of a peregrine and
 * this bird is 0.86 of one. `animal-sparrowhawk.ts` carries the same measurement
 * for the same reason; this is the second pair in the collection it bites.
 *
 * The palette is the male: slate-blue above, warm buff below, and no moustache
 * at all — which is genuinely how a merlin differs from the other three falcons
 * rather than a way of saving a card.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/** `box-31`'s rear face — see `animal-sparrowhawk.ts`: it is -0.625, not -0.500. */
const REAR_Z = -0.625

export const MERLIN_ASSEMBLY = defineCreature('animal-merlin', {
  palette: {
    coat: 0x4a5570,    // UNREVIEWED: slate blue above — the male
    belly: 0xd8a878,   // UNREVIEWED: warm buff below
    flight: 0x39415a,  // UNREVIEWED: darker wings and the stub tail
    limb: 0xe8c02e,    // UNREVIEWED: yellow foot
    bill: 0x252a36,    // UNREVIEWED: small and dark
    hook: 0x12151c,    // UNREVIEWED: the tip
    eye: 0x2f2a26,     // UNREVIEWED: near-black, the falcon eye
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The smallest shell in the bank by volume. See the header. */
  hull: { part: 'box-31' },
  belly: 0.5625,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },

  /* The bank's only stub, turned back to front — `animal-owlet.ts`'s move. */
  tail: { part: 'box-18', paint: 'flight', spin: [{ axis: 'y' as const, deg: 180 }], at: [0, 0.80625, REAR_Z] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'blade-06', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THIS IS AS SMALL AS THE PACK GOES AND IT IS NOT SMALL ENOUGH. Keep-out 0.9302 against '
    + 'this collection\'s 1.1135 and the fox\'s own 1.15 — built out of three part choices and '
    + 'no scaling at all: box-31 (the smallest shell by volume, 1.7578), the falcon wing over '
    + 'the back rather than out from the flank, and box-18 (the bank\'s only stub) turned 180 '
    + 'for a square tail. A merlin is about a fifth of a peregrine in life and this bird is '
    + '0.86 of one. IT COMES IN AT 399 VERTICES against rule 9\'s measured floor of 405 — a '
    + 'PACK NORM that reports rather than fails, by your ruling of 3 August, and the mole, the '
    + 'goldfish, the budgie and four of Birds\' passerines already ship under it. NO '
    + 'MOUSTACHE, which is a real difference from the peregrine and the hobby rather than a '
    + 'saving. NEW PALETTE, UNREVIEWED.',
})
