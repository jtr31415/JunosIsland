/**
 * The eagle owl — the biggest owl in the world, and here the tallest thing in
 * Raptors that is not a placeholder: 1.9617 against the other two owls' 1.4312.
 *
 * That height is the whole separation and it is a part choice, not a scale.
 * `box-21`, the fox's shell, is the tallest in the bank at 1.5051 and its crown
 * therefore sits at y = 1.68630 rather than the cube's 1.43125 — so the tufts
 * stand from there and the bird finishes 0.276 over the two owls beside it. It
 * is the same lever `animal-golden-eagle.ts` uses, spent on an owl.
 *
 * The tufts are two `cone-01` standing UNSPUN, which is `animal-owlet.ts`'s
 * placement exactly: the shape's own attachment is `y +1`, so an owl's tufts are
 * the one feature in this project that needed no derivation at all. At x = 0.200
 * they sit inside `box-21`'s flat crown with 0.112 to spare on the outer side.
 *
 * ORANGE eyes on the pack's biggest card, which is the eagle owl's other half —
 * and the one thing that keeps it off `animal-owlet`, which is amber on the same
 * card with the same tufts. Height and colour, and they are both real.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155
/** `box-21`'s own crown: centre 0.93375 plus half of 1.5051. */
const CROWN_Y = 1.6863
/** `animal-owlet.ts`'s station, which clears `cone-01`'s 0.3286 base with room. */
const TUFT_X = 0.2

export const EAGLE_OWL_ASSEMBLY = defineCreature('animal-eagle-owl', {
  palette: {
    coat: 0x8a6634,    // UNREVIEWED: orange-brown
    belly: 0xd8bf90,   // UNREVIEWED: paler below
    bar: 0x4a341c,     // UNREVIEWED: the dark bars and the tufts
    limb: 0xc0a274,    // UNREVIEWED: feathered legs
    bill: 0x2e2a24,    // UNREVIEWED: black
    hook: 0x171512,    // UNREVIEWED: the tip
    eye: 0xe07a10,     // UNREVIEWED: ORANGE — the loudest eye in the collection
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The fox's shell — the tallest in the bank. See the header. */
  hull: { part: 'box-21' },
  belly: 0.4375,

  eyes: { part: 'plate-14', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-18', paint: 'coat', spin: [{ axis: 'y' as const, deg: 180 }], at: [0, 0.93375, -0.625] },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'blade-02', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 70 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    { name: 'wing', part: 'wedge-19', paint: 'coat', kind: 'pair' as const },
    /* Unspun on the tall shell's own crown — `animal-owlet.ts`'s placement. */
    { name: 'tuft', part: 'cone-01', paint: 'bar', kind: 'pair' as const, at: [TUFT_X, CROWN_Y, 0] },
    /* The barring, by pure donor transfer — `animal-snowy-owl.ts`'s idiom. */
    { name: 'bar', part: 'plate-11', paint: 'bar', kind: 'pair' as const },
  ],

  flag: 'THIS BIRD IS animal-owlet AT A DIFFERENT HEIGHT AND A DIFFERENT COLOUR, and those are '
    + 'the only two things holding them apart — both are plate-14 with cone-01 tufts. The '
    + 'height is a PART CHOICE and not a scale: box-21, the fox\'s shell, is the tallest in the '
    + 'bank at 1.5051, so its crown is at 1.68630 rather than the cube\'s 1.43125 and the bird '
    + 'finishes 1.9617 against the barn owl\'s and the tawny\'s 1.4312. The colour is ORANGE to '
    + 'the rim against the owlet\'s amber. If that is not enough, the lever left is the barring '
    + '— plate-11 by pure donor transfer, which the owlet does not wear — or dropping its tufts, '
    + 'which would cost this bird its own. NEW PALETTE, UNREVIEWED.',
})
