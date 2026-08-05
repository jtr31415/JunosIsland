/**
 * The warthog — the frozen `animal-hog` is the design problem, so read it first.
 *
 * `animal-hog` is one of the base 24 and cannot be edited, and it donated
 * `cone-04` (its ear), `box-24` (its nose pad) and `wedge-13` (its tusk) to the
 * bank. Two of those are worn here on purpose — a warthog's ear and a warthog's
 * nose disc ARE a hog's, and inventing different ones would be inventing — and
 * the separation is carried by three things a hog has none of:
 *
 *   - **THE TUSKS ARE THE ELEPHANT'S, NOT THE HOG'S.** `wedge-11` is 0.445 of
 *     reach against `wedge-13`'s 0.411 and it is square in section where the
 *     hog's is 1.24x deeper than wide, so it is the bigger, blunter curve — and
 *     taking the hog's own tusk would have put the two animals side by side on
 *     the one feature that has to hold them apart. Stood on end and splayed at
 *     `animal-goat.ts`'s own solved 25 degrees.
 *   - **THE MANE.** Four `cone-01` in a single TOP row, which is
 *     `animal-crocodile.ts`'s scute idiom: a top row is not mirrored, so four
 *     stations cost four parts rather than twelve.
 *   - **THE TAIL HELD UP.** `chamfer: true` carries `wedge-18` up the rear
 *     chamfer at 45 degrees. Same shape the meerkat wears trailing; §3.1 is
 *     exactly this — a part's identity is where it is put.
 *
 * `box-31`, the lion's shallow shell, because a warthog is low and long in the
 * body and depth is what `pets.ts` charges keep-out for.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-31`'s crown, and its front plate — the lion's shell is 0.500 at the front. */
const CROWN_Y = 1.43125
const FRONT_PLATE_Z = 0.5

/** `animal-goat.ts`'s own solved horn station, transferred: 4/16 out, 3/16 forward. */
const TUSK_X = 0.25
const TUSK_Z = 0.1875

/**
 * 20 degrees of splay, inside `animal-goat.ts`'s measured 13-to-29 window.
 *
 * That file takes 25 for `wedge-13`. This one takes the ELEPHANT's `wedge-11`
 * and 20 rather than 25, for a reason that is about the HARNESS rather than the
 * animal: `assembly-assert.ts` traces every mesh back to its bank record by
 * un-spinning it and sorting both point sets on coordinates SNAPPED to 1/1000,
 * and at 22, 25 and 28 degrees two of this shape's 24 points land either side of
 * a snap boundary and the two sorts disagree. 20 and 30 are clean; 20 is nearer
 * the window's centre. Nothing about the seating changes — the splay window is
 * the goat's measurement and 20 is inside it.
 */
const TUSK_SPLAY = -20

export const WARTHOG_ASSEMBLY = defineCreature('animal-warthog', {
  palette: {
    coat: 0x8a7768,    // UNREVIEWED: dusty grey-brown, the colour of the mud it wears
    mane: 0x3d332b,    // UNREVIEWED: the dorsal bristles and the tail switch
    tusk: 0xe4dcc4,    // UNREVIEWED: pale ivory — the tusks and the sclera
    limb: 0x6b5b4e,    // UNREVIEWED: the short legs and the nose disc
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-31' },
  /* No `belly` slot, so the pale one has to be named or the sclera goes muddy. */
  under: 'tusk',

  /* The hog's own ear, at its own recorded burial. */
  ears: { part: 'cone-04', paint: 'coat' },

  /* THE MANE. One row, on the top only, because a warthog's bristles run in a
   * single line down the spine — the chamfer idiom makes a back read ROUND and
   * this is the second animal in the project that must not. */
  ridge: { part: 'cone-01', paint: 'mane', name: 'bristle', count: 4, rows: ['top'] },

  /* Carried UP the rear chamfer. `chamfer: true` solves the midpoint and the
   * 45-degree turn onto its normal together; giving one and not the other is
   * how a tail floats. */
  tail: { part: 'wedge-18', paint: { base: 'mane', byBand: { 3: 'coat' } }, chamfer: true },

  /* The hog's own nose disc, worn as the whole muzzle — no `nose`, because this
   * part IS the pack's nose-tip. */
  snout: { part: 'box-24', paint: 'limb', at: [0, 0.70, FRONT_PLATE_Z] },

  extras: [
    /* THE TUSKS. The elephant's, stood on end by `{ x, -90 }` and splayed by
     * `{ z, -20 }` — `animal-goat.ts`'s window, measured there as 13 to 29
     * degrees of splay on the cube's own crown, and this shell's crown is the
     * cube's at the same world height. See TUSK_SPLAY for why 20 and not 25. */
    {
      name: 'tusk',
      part: 'wedge-11',
      kind: 'pair' as const,
      paint: 'tusk',
      spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: TUSK_SPLAY }],
      at: [TUSK_X, CROWN_Y, TUSK_Z] as [number, number, number],
    },

    /* THE WARTS, and they are the animal's name. `box-09` is the bunny's
     * nose-tip and the smallest solid box in the bank; two of them on the cheek
     * beside the muzzle is what a warthog has. */
    {
      name: 'wart',
      part: 'box-09',
      kind: 'pair' as const,
      paint: 'coat',
      at: [0.2, 0.86, FRONT_PLATE_Z] as [number, number, number],
    },
  ],

  motion: [{ kind: 'wag', parts: ['tail'] }],

  flag: 'THE TUSKS COME OUT OF THE CROWN, NOT THE JAW, and that is the compromise to look '
    + 'at. A warthog\'s tusks grow from the upper jaw and sweep out and up; rule 3 fuses head '
    + 'and body into one mass so there is no jaw to hang them from, and the only station on '
    + 'this shell that a stood-on-end wedge is provably embedded in is the crown — '
    + 'animal-goat.ts solved that window at 13 to 29 degrees of splay and this takes 20. '
    + 'So they read as horns placed forward rather than as tusks, and dragging them down the '
    + 'front plate in the editor is the obvious thing to try. THEY ARE THE ELEPHANT\'S TUSK '
    + 'AND NOT THE HOG\'S ON PURPOSE: wedge-13 is the frozen animal-hog\'s own, and putting it '
    + 'on this animal would have matched the two on the one feature that has to separate them. '
    + 'The ear and the nose disc ARE the hog\'s, because a warthog\'s are. NEW PALETTE, '
    + 'UNREVIEWED.',
})
