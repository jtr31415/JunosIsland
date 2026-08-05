/**
 * The buzzard — the plain one, deliberately, and the bird that spends `sink` as
 * a WINGSPAN DIAL rather than as a burial depth.
 *
 * Britain's commonest raptor is a mid-brown bird with a pale chest crescent and
 * nothing else a child would name it by, so this file's whole job is to be the
 * middle of the collection and let the others be strange. It is the only member
 * with no card, no crest, no fork and no tuft.
 *
 * **`sink` IS THE WINGSPAN DIAL, measured.** `wedge-19` at its donor's own
 * 0.175 puts a bird at 2.1960 across; at 0.35 it is 1.9949 and at 0.55 it is
 * 1.7657. The part is the same part and nothing is stretched — the join simply
 * buries more of it in the flank. A buzzard's wings are broad but shorter than
 * an eagle's, so it takes 0.35 and comes out 0.201 narrower than the two eagles
 * on either side of it in the album.
 *
 * The pale chest is `box-36`'s band 3 painted from the belly slot — the panda's
 * shell, whose two bands are its own eye patches, used here as a breast — plus
 * the painted line low at 7/16 so the underside is pale and the back is not.
 */
import { defineCreature } from '../creature'
import { LEG_ROW } from '../hulls'
import { PACK_PUPIL } from '../texture'

const TALON_Z = 0.1875
const TALON_Y = 0.16155

export const BUZZARD_ASSEMBLY = defineCreature('animal-buzzard', {
  palette: {
    coat: 0x6b533a,    // UNREVIEWED: mid brown, and nothing more
    belly: 0xe4d8c2,   // UNREVIEWED: the cream chest crescent and underside
    flight: 0x4b3a27,  // UNREVIEWED: wings and tail
    limb: 0xdcb63e,    // UNREVIEWED: yellow foot
    bill: 0x3a332b,    // UNREVIEWED: dark horn
    hook: 0x1e1a16,    // UNREVIEWED: the tip
    eye: 0x8a7350,     // UNREVIEWED: brown — a buzzard's eye is dark, unlike a hawk's
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The panda's cube, whose band 3 is painted pale for the chest crescent. */
  hull: { part: 'box-36', paint: { base: 'coat', byBand: { 3: 'belly' } } },
  belly: 0.4375,

  eyes: { part: 'plate-08', paint: 'eye' },
  snout: { part: 'cone-06', paint: 'bill' },
  tail: { part: 'box-38', paint: 'flight' },

  legs: false,
  extras: [
    { name: 'leg', part: 'box-01', paint: 'limb', kind: 'pair' as const, sink: LEG_ROW.sink, at: [0.25, LEG_ROW.y, 0] },
    { name: 'hook', part: 'box-24', paint: 'hook', on: 'snout', spin: [{ axis: 'x' as const, deg: 55 }] },
    { name: 'talon', part: 'wedge-13', paint: 'limb', kind: 'pair' as const, at: [0.25, TALON_Y, TALON_Z], axis: 'z' as const, dir: 1 },
    /* 0.35 rather than the donor's 0.175 — the wingspan dial. See the header. */
    { name: 'wing', part: 'wedge-19', paint: 'flight', kind: 'pair' as const, sink: 0.35 },
  ],

  flag: 'THIS BIRD IS DELIBERATELY THE PLAIN ONE and that is the thing to judge: it is the '
    + 'only member of Raptors with no card, no crest, no fork and no tuft, because Britain\'s '
    + 'commonest raptor is a mid-brown bird with a cream chest and nothing else. If it looks '
    + 'empty beside its neighbours, that is the design and not an omission. WINGSPAN IS `sink` '
    + 'HERE, measured: wedge-19 at the donor\'s own 0.175 gives 2.1960 across, at 0.35 gives '
    + '1.9949 and at 0.55 gives 1.7657, with nothing stretched and the same part throughout — '
    + 'the join just buries more of it. This bird takes 0.35 so it sits 0.201 inside the '
    + 'eagles. THE CHEST CRESCENT is box-36\'s band 3, which on the panda is an eye patch. '
    + 'NEW PALETTE, UNREVIEWED.',
})
