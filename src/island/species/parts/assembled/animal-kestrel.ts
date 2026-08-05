/**
 * The kestrel — the second bird in this collection to wear the belly patch
 * upside down, and the one that shows what it is really for.
 *
 * `animal-bald-eagle.ts` uses the inversion for a white head. A male kestrel
 * wants the same mechanism for a different fact: a **blue-grey head over a
 * chestnut back**. Coat grey, `belly` chestnut, line at 12/16 — so the top
 * quarter of the shell is grey and everything below it is chestnut, and the two
 * halves of the bird a child would draw are one painted line and no geometry.
 *
 * Two things separate it from the peregrine beside it. The TAIL is `wedge-18`
 * laid flat by `{x, 90}` at the rear face, trailing 0.520 behind the shell — a
 * kestrel is a long-tailed falcon and a peregrine is not — and there is **no
 * moustache**, because a kestrel's is a thin smudge where a peregrine's is a
 * black wedge, and a card that is nearly absent is better absent.
 *
 * The hovering is not sayable. `moves.ts` has four words and none of them is
 * hover; `air` is the nearest and it is what this bird has.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155

export const KESTREL_ASSEMBLY = defineCreature('animal-kestrel', {
  palette: {
    coat: 0x8d95a4,    // UNREVIEWED: the blue-grey head — the TOP of the inverted patch
    belly: 0xb0623a,   // UNREVIEWED: the chestnut back and body, below 12/16
    flight: 0x6e4128,  // UNREVIEWED: the wings, a deeper chestnut
    limb: 0xe8c02e,    // UNREVIEWED: yellow foot
    bill: 0x2c3038,    // UNREVIEWED: small and dark
    hook: 0x161a20,    // UNREVIEWED: the tip
    eye: 0x33302c,     // UNREVIEWED: near-black, the falcon eye
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* INVERTED, at 12/16 — grey above, chestnut below. See the header. */
  belly: 0.75,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },

  /* Laid flat and trailing: the long tail is half of what a kestrel is. */
  tail: { part: 'wedge-18', paint: 'coat', spin: [{ axis: 'x' as const, deg: 90 }], at: [0, 0.80625, -0.625] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* The falcon wing — see `animal-peregrine-falcon.ts`, where it is argued. */
    { name: 'wing', part: 'blade-06', paint: 'flight', kind: 'pair' as const },
  ],

  flag: 'THE GREY HEAD IS THE BELLY PATCH UPSIDE DOWN, second use in this collection after '
    + 'animal-bald-eagle.ts — coat grey, belly chestnut, line at 12/16, so the top quarter of '
    + 'the shell is the head and the rest is the back. That is a male kestrel; a female is '
    + 'chestnut throughout, which is one line (delete the belly and set coat to the chestnut). '
    + 'THE HOVER IS NOT SAYABLE AND IT IS THE FIRST THING A CHILD KNOWS ABOUT THIS BIRD. '
    + 'moves.ts has four words — land, air, water, amphibian — and `air` hovers a pet at '
    + 'TREE_HEIGHT, which is the nearest this game has and is what it is given. NO MOUSTACHE, '
    + 'deliberately: a kestrel\'s is a thin smudge where the peregrine\'s is a black wedge, and '
    + 'a card that is nearly absent is better absent. NEW PALETTE, UNREVIEWED.',
})
