/**
 * The dingo — the pack's own dog parts on a sand-coloured animal, deliberately.
 *
 * There are four canids in this project and three of them are already built:
 * the FROZEN `animal-dog` and `animal-fox`, plus `animal-wolf` and
 * `animal-fennec-fox`. A dingo is a dog, so the question is not what to invent
 * but what to keep and what to spend:
 *
 *   - **`cone-02`, the dog's and pig's own pricked ear.** `africa.ts` records
 *     that *"no canid in the project wears an ear at all — the wolf has none"*,
 *     because `box-21`'s fused lugs are its ears. This is the first canid here
 *     to wear a real ear part, and it is the DOG's, because a dingo's ear is a
 *     dog's ear held permanently upright.
 *   - **`box-23`, the fox's brush**, but painted the other way about: the fennec
 *     paints Kenney's band 5 at the top of the tip half DARK for a black tip,
 *     and a dingo's brush ends WHITE. One `byBand` entry, no geometry, and the
 *     inversion is the whole difference between the two tails.
 *   - **WHITE SOCKS, on JT-044's two-tone foot.** `{ patch: { below: 'sock',
 *     at: 0.25 } }` — 4/16 is derived in `animal-chicken.ts` off `box-01`'s own
 *     bevel: 3/16 lands inside the bevel and the boundary follows a sloping
 *     face, 4/16 clears it by 0.014063 onto the straight shank. A dingo's white
 *     feet are the second thing anyone names about it.
 *   - **`tube-06`, the fox's muzzle**, for Kenney's own horizontal cut — pale to
 *     the lip (band 3) with the coat over it (band 7) — which is a dingo's own
 *     cream jaw. `animal-wolf.ts` is the standing derivation.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const DINGO_ASSEMBLY = defineCreature('animal-dingo', {
  palette: {
    coat: 0xc4783c,    // UNREVIEWED: the ginger sand of a desert dingo
    belly: 0xf0e2c6,   // UNREVIEWED: the cream chest, jaw, socks and tail tip
    mark: 0x33281f,    // UNREVIEWED: the black nose
    limb: 0xb06c34,    // UNREVIEWED: the legs, a shade under the coat
    sock: 0xf0e2c6,    // UNREVIEWED: the white feet — JT-044's second tone
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The builder's default cube. A dingo is a medium dog and this is the medium
   * shell; box-21, the taller one, is the WOLF's and is taken for its ear lugs. */
  hull: { part: 'box-03', paint: 'coat' },

  /* 8/16 — the tiger's mammal line made exact, and this cube's own equator. */
  belly: 0.5,

  /* 6/16, the wolf's own stance: each leg's outer face at 0.5625, one sixteenth
   * inside the hull's side. A dingo is cursorial and must not sprawl. */
  legs: { x: 0.375, paint: { base: 'limb', patch: { below: 'sock', at: 0.25 } } },

  /* The dog's own pricked ear, and the first real ear on a canid in this project. */
  ears: { part: 'cone-02', paint: 'coat' },

  /* The fox's muzzle, for Kenney's own cut: cream to the lip, coat over the
   * bridge. animal-wolf.ts's derivation, with the two slots swapped. */
  snout: { part: 'tube-06', paint: { base: 'belly', byBand: { 7: 'coat' } } },

  /* The dog's own nose, on the muzzle's own placed front plane. */
  nose: { part: 'box-15', paint: 'mark', on: 'snout' },

  /* The fox's brush with band 5 — Kenney's own cut at the top of the tip half —
   * painted CREAM. The fennec paints the same band dark for a black tip; a
   * dingo's ends white, and the inversion is the whole separation. */
  tail: { part: 'box-23', paint: { base: 'coat', byBand: { 5: 'belly' } } },

  flag: 'NEW PALETTE, UNREVIEWED — the first dingo ever built. THIS IS THE FOURTH CANID IN THE '
    + 'PROJECT and it deliberately wears the DOG\'s own parts: cone-02, the dog\'s and pig\'s '
    + 'pricked ear, which makes it the first canid here to wear an ear at all (africa.ts notes '
    + 'that no canid in the project has one, because box-21\'s fused lugs are the wolf\'s), and '
    + 'box-15, the dog\'s nose. A dingo IS a dog and inventing a difference would be inventing. '
    + 'WHAT SEPARATES IT from animal-fennec-fox, which wears the same box-23 brush, is Kenney\'s '
    + 'own band 5 painted the other way about: the fennec makes it a BLACK tip and this makes it '
    + 'a WHITE one, one byBand entry and no geometry either time. And the SOCKS are JT-044\'s '
    + 'two-tone foot at 4/16, which animal-chicken.ts derived off box-01\'s own bevel — 3/16 '
    + 'lands inside the bevel and follows a sloping face, 4/16 clears it by 0.014063 onto the '
    + 'straight shank. WATCH THE KEEP-OUT: 1.170 against the fox\'s 1.15, all of it the '
    + 'brush\'s 0.910 of reach off a 1.250 cube, which is what decides whether a pet fits '
    + 'between two trees. It is inside Woodland\'s ceiling of 1.6 and beside animal-lovebird\'s '
    + '1.199, but it is the fifth-widest animal built. Nothing is stretched and nothing is '
    + 'authored.',
})
