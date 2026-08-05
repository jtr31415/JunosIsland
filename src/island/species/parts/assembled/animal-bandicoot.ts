/**
 * The bandicoot — the plain one, and it is held apart from its own family by
 * subtraction.
 *
 * This collection carries three small long-nosed marsupials — the bilby, the
 * numbat and this — and every one of them wants a long snout, so `tube-07` is
 * spent three times over deliberately: they really do all have one, and §3.1 is
 * that a part's identity is its placement rather than Kenney's label. The
 * separations are therefore made on everything else, and they are big:
 *
 *   - **AGAINST THE BILBY, the EAR, and it is a 2.7x gap.** That animal wears
 *     `box-06` at 0.913 tall — the biggest in the bank, taking it to the pack's
 *     own 2.02 ceiling. This one wears `wedge-04`, the chick's and monkey's, at
 *     0.341. Nothing else in the bank sits between them at a useful size.
 *   - **AGAINST THE NUMBAT, the TAIL and the STRIPES.** That animal carries the
 *     fox's brush UP the rear chamfer and wears six white flank cards; this one
 *     trails `wedge-18`, the tiger's whip and the bank's thinnest long tail at
 *     0.200 across, and is unmarked. A bandicoot's tail is a thin bare rope held
 *     low, which is what that shape is.
 *   - **AND THE COAT IS GRIZZLED BROWN**, against the bilby's blue-grey and the
 *     numbat's rufous — one plain animal among two loud ones, which a collection
 *     of sixteen needs.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** The cube's own centre — `animal-opossum.ts`'s station for a trailing whip. */
const TAIL_Y = 0.8125

export const BANDICOOT_ASSEMBLY = defineCreature('animal-bandicoot', {
  palette: {
    coat: 0x7d6a4e,    // UNREVIEWED: the coarse grizzled brown
    belly: 0xd6c8ac,   // UNREVIEWED: the pale underside, and the sclera
    mark: 0x352d26,    // UNREVIEWED: the nose and the bare tail
    limb: 0x6b5a41,    // UNREVIEWED: the legs and the long muzzle
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The builder's default cube. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* Narrow and long-wheelbased: a bandicoot is a scurrier with its hindquarters
   * higher than its front, and the wheelbase is the only half of that sayable. */
  legs: { x: 0.3125, z: 0.34375 },

  /* Small, pointed, upright — a third of the bilby's, which is the separation. */
  ears: { part: 'wedge-04', paint: 'coat' },

  /* The longest muzzle in the bank, at its own 0.376 burial so it grows out of
   * the head. Shared with the bilby and the numbat, honestly: all three have one. */
  snout: { part: 'tube-07', paint: 'limb' },

  nose: { part: 'box-09', paint: 'mark', on: 'snout' },

  /* The tiger's whip — the bank's thinnest long tail at 0.200 across — bare and
   * trailing LOW, at the opossum's own station rather than the tiger's recorded
   * 1.187, which is a cat's raised tail. */
  tail: { part: 'wedge-18', paint: 'mark', at: [0, TAIL_Y, -0.625] },

  flag: 'NEW PALETTE, UNREVIEWED — the first bandicoot ever built. IT SHARES ITS SNOUT WITH '
    + 'animal-bilby AND animal-numbat and that is deliberate: tube-07 is the longest muzzle in '
    + 'the bank and all three of these animals genuinely have one, so inventing a difference '
    + 'would be inventing. THE SEPARATIONS ARE BIG AND THEY ARE ELSEWHERE. Against the bilby it '
    + 'is the EAR and the gap is 2.7x — box-06 at 0.913 tall, which takes that animal to the '
    + 'pack\'s own 2.02 ceiling, against wedge-04 at 0.341 here, with nothing in the bank '
    + 'between them at a useful size. Against the numbat it is the TAIL and the MARKINGS — that '
    + 'animal carries the fox\'s brush up the rear chamfer and wears six white flank cards, and '
    + 'this one trails the tiger\'s whip, the thinnest long tail in the bank at 0.200 across, '
    + 'and is unmarked. This is the plain animal of the three on purpose; a collection of '
    + 'sixteen needs one.',
})
