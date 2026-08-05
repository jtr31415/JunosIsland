/**
 * The gibbon — the only primate in the project on the TALLEST shell, and the
 * second ape with no tail.
 *
 * Five primates now stand in the tree and each is separated on a different axis:
 * the FROZEN `animal-monkey` is Kenney's own cube; `animal-baboon` takes that
 * same cube with a long dog-like muzzle; `animal-gorilla` takes `box-41`, the
 * biggest shell in the pack, and has no tail; `animal-howler-monkey` takes the
 * monkey's shell again for its throat and its prehensile rope. This one takes
 * **`box-21`, the fox's shell at 1.5051 tall** — the only hull in the bank taller
 * than it is wide — because a gibbon is the slight, upright, long-limbed one and
 * that is the single fact about it a child would draw.
 *
 * The face is carried by two things and neither is a shape anybody has spent on
 * a primate: **`tube-01`, the beaver's short barrel muzzle**, which is the small
 * end of the muzzle family at 0.312 against the fox's 0.532; and **two `plate-03`
 * as the pale BROW RING**, set at 1.15 where they clear the eye card's own top at
 * 1.0936 with room to spare.
 *
 * **NO TAIL AND NO EARS.** An ape has neither, and between them they are the
 * whole separation from the lemur, the coati and the howler.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-21`'s front face: its own half-depth, and its offset z is zero. */
const FRONT_Z = 0.625
/** The eye plane, where a face card belongs. */
const CARD_Z = 0.635

export const GIBBON_ASSEMBLY = defineCreature('animal-gibbon', {
  palette: {
    coat: 0x6a5a48,    // UNREVIEWED: the buff-brown of a lar gibbon
    belly: 0xcdbb9c,   // UNREVIEWED: the paler front, and the sclera
    face: 0xf2e7d2,    // UNREVIEWED: the white brow ring, and only it
    limb: 0x50432f,    // UNREVIEWED: the long arms and legs, darker
    dark: 0x241d16,    // UNREVIEWED: the bare black face and the nose
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE TALLEST SHELL IN THE BANK, 1.5051 against every other hull's 1.250-1.300.
   * A hull is never scaled, so an upright animal is a hull choice or nothing. */
  hull: { part: 'box-21' },

  /* The tiger's mammal line made exact, and this hull's own equator. */
  belly: 0.5,

  /* Narrow: a gibbon is slight, and the wheelbase is the only way the kit can
   * say so once the hull has said tall. */
  legs: { x: 0.24, z: 0.24 },

  /* The beaver's short barrel, painted from the dark slot so the muzzle reads
   * as bare skin on a buff head. Hung at 0.86 rather than at the beaver's own
   * 0.815, because this hull's centre is 0.9338 and not 0.80625. */
  snout: { part: 'tube-01', paint: 'dark', at: [0, 0.86, FRONT_Z] },

  /* The dog's and the MONKEY's own nose-tip — 0.120 x 0.108, the smallest solid
   * nose in the bank — on the muzzle's placed front plane. */
  nose: { part: 'wedge-10', paint: 'dark' },

  extras: [
    /* THE BROW RING. `plate-03` is the pack's own face plate, 0.2366 x 0.1009,
     * one a side above the eye. The eye card's own top is 1.0936 and this sits
     * 1.0996-1.2004, so the two are never coplanar and overlapping — which is
     * the z-fight `animal-gecko.ts` had to solve between two cards. */
    {
      name: 'brow',
      part: 'plate-03',
      kind: 'pair' as const,
      paint: 'face',
      at: [0.2625, 1.15, CARD_Z] as [number, number, number],
    },
  ],

  flag: 'THE ARMS ARE MISSING AND THEY ARE THE ANIMAL. A gibbon\'s arms are longer than its '
    + 'body and it swings on them; the leg row is four copies of ONE shape at ONE height, so '
    + 'the front pair cannot be longer than the back and there is no arm feature to add. '
    + 'animal-gorilla.ts records the same gap for the same reason. What stands in for it is '
    + 'the HULL: box-21 is the only shell in the bank taller than it is wide, and a narrow '
    + 'wheelbase under it is as upright and slight as this kit can be. NO TAIL AND NO EARS, '
    + 'both deliberate — an ape has neither, and between them they are what hold this animal '
    + 'apart from the lemur and the howler monkey. NEW PALETTE, UNREVIEWED.',
})
