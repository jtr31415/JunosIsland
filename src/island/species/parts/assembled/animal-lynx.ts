/**
 * The lynx — the ear tufts are the animal, and they are the squirrel's idiom
 * put where it belongs most.
 *
 * A lynx is a cat with three things no other cat has: black ear tufts, a stub
 * tail, and a huge face. Two of the three are shapes the bank already holds and
 * the third is a refusal:
 *
 *   - **`wedge-16`, the TIGER's ear** — the biggest cat ear in the bank
 *     (0.347 x 0.389 against the domestic cat's 0.328 x 0.362) and UNSPENT by
 *     every other species built so far. Its band 5 is Kenney's own inner-ear
 *     patch, so the pale inside costs no geometry.
 *   - **`cone-01` on the ear's own apex, via `on: 'ear'`** — the builder anchors
 *     it to the placed ear's outer face rather than to an arithmetic this file
 *     would carry a stale copy of. `animal-squirrel.ts` invented this placement
 *     and wrote out its `at` by hand to protect a fingerprint; a new species
 *     uses `on`, which is what its own note says to do.
 *   - **NO SNOUT.** A lynx's face is flat and wide, and every muzzle in the bank
 *     stands 0.17 to 0.27 forward. `blade-04`, the lion's own nose-tip, is
 *     radial, 0.400 square and only 0.100 deep — a flat pink cat nose on a flat
 *     face, straight onto the hull's front.
 *
 * The eye is `plate-14`, the panda's — the BIGGEST card in the pack at 0.435 x
 * 0.443 — because a lynx's eyes are the biggest thing on its face. The cat's own
 * `plate-04` was the obvious pick and is REFUSED: it carries ONE band (15), so a
 * pupil cannot be painted into it at all, and an eye card with no pupil is the
 * thing rule 5 exists to prevent. Recorded here so nobody puts it back.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/**
 * Every one of the pack's ten hulls presents the SAME flat rear plate — world
 * z = -0.625, x +/-0.3125, y 0.49375 to 1.11875 — and this is its centre.
 *
 * `box-18`'s own recorded y is 0.482248, which is 0.0115 BELOW that plate, so a
 * stub taken by pure donor transfer meets a chamfer that has already fallen away
 * and stands clear of the body. `animal-badger.ts` measured that and solved it
 * with this number; every stub in Woodland takes the same solve.
 */
const REAR_PLATE_Y = 0.80625

export const LYNX_ASSEMBLY = defineCreature('animal-lynx', {
  palette: {
    coat: 0xb59a72,
    belly: 0xf0e6d2,
    tuft: 0x2a241d,
    mark: 0xd0a08f,
    limb: 0x8d7350,
    eye: 0xc9a23a,
    pupil: PACK_PUPIL,
  },

  /* The tiger's own mammal line made exact — the only 1/16 point inside the
   * pack's measured 0.4808-0.5481 zone, and this hull's own equator. */
  belly: 0.5,

  /* The panda's card — the biggest in the pack — amber to the rim. The cat's own
   * plate-04 has ONE band and therefore no pupil; see the header. */
  eyes: { part: 'plate-14', paint: 'eye' },

  /* The tiger's ear — the biggest cat ear in the bank, and unspent. Kenney's own
   * band 5 is its inner patch. */
  ears: { part: 'wedge-16', paint: { base: 'coat', byBand: { 5: 'belly' } } },

  /* The lion's own nose-tip, straight onto the hull's front face: radial, 0.400
   * square, 0.100 deep. No snout at all — see the header. */
  nose: { part: 'blade-04', paint: 'mark' },

  /* A lynx's tail is a black-tipped stub, and the bank's only stub is box-18 —
   * 0.425 of reach against the next shortest at 0.555. It carries one band, so
   * the tip cannot be painted separately and the whole stub goes dark, which is
   * what a lynx's reads as anyway. */
  tail: { part: 'box-18', paint: 'tuft', spin: [{ axis: 'y', deg: 180 }], at: [0, REAR_PLATE_Y, -0.625] },

  extras: [
    /* THE TUFTS, on the ear's own apex. `on: 'ear'` measures the placed ear's
     * outer face off the built vertices, so a tuft that floats or buries is a
     * thing that cannot happen quietly. cone-01 is one of only two records in
     * the whole bank with taper 0 — a true point. */
    {
      name: 'tuft',
      part: 'cone-01',
      paint: 'tuft',
      kind: 'pair',
      on: 'ear',
    },
  ],

  flag: 'THE EAR TUFTS ARE THE ANIMAL. cone-01 — the bee\'s antenna, the hedgehog\'s spine and '
    + 'the squirrel\'s own tuft — one copy on each ear apex, anchored with on: "ear" so the '
    + 'builder solves the join off the placed ear\'s built vertices rather than off a number '
    + 'this file would carry a stale copy of. The ear under them is wedge-16, THE TIGER\'S, '
    + 'which no species built so far has spent: at 0.347 x 0.389 it is the biggest cat ear in '
    + 'the bank against the domestic cat\'s 0.328 x 0.362, and its band 5 is Kenney\'s own inner '
    + 'patch, so the pale inside costs nothing. THERE IS NO SNOUT, DELIBERATELY: a lynx\'s face '
    + 'is flat and wide and every muzzle in the bank stands 0.17 to 0.27 forward of the hull, so '
    + 'the nose is blade-04 — the lion\'s own nose-tip, radial, 0.400 square and 0.100 deep — '
    + 'straight onto the front face. THE SPOTS ARE NOT HERE and cannot be: byBand can only cut '
    + 'where Kenney already cut and box-03 has one band, and the flat marking cards the civet '
    + 'spends read as blotches rather than as a lynx\'s fine speckle. THE EYE IS plate-14, THE '
    + 'PANDA\'S — the biggest card in the pack at 0.435 x 0.443, painted amber to the rim, '
    + 'because a lynx\'s eyes are the biggest thing on its face. The cat\'s own plate-04 was the '
    + 'obvious pick and is REFUSED on a measurement rather than a taste: it carries ONE band, so '
    + 'no pupil can be painted into it at all. NEW PALETTE, '
    + 'UNREVIEWED, all seven slots. Nothing is stretched.',
})
