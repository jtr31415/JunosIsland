/**
 * The mandrill — a baboon with a painted face, and the face is the only thing
 * that makes it one.
 *
 * `animal-baboon.ts` is already built on `box-33`, the FROZEN `animal-monkey`'s
 * own shell, and its header argues that a baboon IS a monkey and that giving it
 * a different body to look different would be inventing. **That argument binds
 * here twice over, because a mandrill is not merely a monkey — it is a baboon.**
 * So this file takes the same hull and the same muzzle shape deliberately, and
 * spends every bit of its separation on the one place a mandrill actually
 * differs, which is its face.
 *
 * Three measured differences from `animal-baboon`, and one of them is new
 * vocabulary:
 *
 *   - **THE RIBS.** A mandrill's muzzle carries raised blue ridges down each
 *     side and a red stripe along the top. Three `plate-10` — the cow's, dog's
 *     and giraffe's flank card — are laid ON THE MUZZLE: a mirrored pair on its
 *     flanks and one turned onto its top. **Nothing in this project has put a
 *     marking card on a feature rather than on the hull before**, and it works
 *     because the muzzle's placed geometry is arithmetic this file can do: joined
 *     at the cube's front face z = 0.625 with `box-18` at zero burial and 1.45x
 *     its own reach, its centre lands at z = 0.933278 and its half-extents are
 *     0.11385 across and 0.205591 up. Every station below is that solve plus the
 *     pack's own 0.010 of card daylight.
 *   - **THE MUZZLE IS LONGER AND LOWER.** `[0.66, 0.66, 1.45]` at y = 0.74
 *     against the baboon's `[0.62, 0.62, 1.35]` at 0.78 — 7% longer, 7% thicker
 *     and 0.04 lower on the face. On its own that is a tuning difference and this
 *     file does not claim otherwise; it is the ribs that do the work.
 *   - **THE TAIL IS A STUB.** A mandrill's tail is a few centimetres held
 *     upright, where a baboon's is `wedge-15` carried up the rear chamfer and
 *     dropping. One `cone-01` standing on the rear plate is the whole of it, and
 *     subtraction is the sharpest separator this bank has (`animal-emu.ts`).
 *
 * ## What is not here
 *
 * **The bare rump**, for the reason five other files carry: `Paint.patch` takes
 * a HEIGHT and has no z term, so "the back end of this hull is coloured" cannot
 * be said, and `box-33` has one band.
 *
 * **The ridges are cards and a mandrill's are relief.** They are ridges of bone
 * under skin — geometry, not paint — and a zero-thickness card is the nearest
 * this bank gets. That is the honest gap and it is what the flag says.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-33`'s flat front plate — the cube's own +0.625. */
const FRONT_PLATE_Z = 0.625

/**
 * The muzzle, solved. `box-18` is 0.345 x 0.623004 x 0.425211 at zero burial;
 * stretched, its reach is 0.425211 x 1.45 = 0.616556, so joined at the front
 * plate its centre sits half that in front, and its half-extents are the
 * stretched size halved.
 */
const MUZZLE_STRETCH: [number, number, number] = [0.66, 0.66, 1.45]
const MUZZLE_Y = 0.74
const MUZZLE_Z = FRONT_PLATE_Z + (0.425211 * 1.45) / 2   // 0.933278
const MUZZLE_HALF_X = (0.345 * 0.66) / 2                 // 0.113850
const MUZZLE_HALF_Y = (0.623004 * 0.66) / 2              // 0.205591

/** The pack's own card daylight: 0.010 proud of whatever it is laid on. */
const CARD_GAP = 0.01

export const MANDRILL_ASSEMBLY = defineCreature('animal-mandrill', {
  palette: {
    coat: 0x6f6a4e,    // UNREVIEWED: olive-brown, the first ever proposed for this species
    belly: 0xd8cfae,   // UNREVIEWED: the pale underside, and the sclera
    skin: 0x2f5f9c,    // UNREVIEWED: THE BLUE RIDGES — bare skin, not hair
    stripe: 0xc4402b,  // UNREVIEWED: the red down the middle of the muzzle and the nose
    hide: 0x5a4a3c,    // UNREVIEWED: the bare ears and the muzzle's own ground colour
    limb: 0x55503a,    // UNREVIEWED: the legs, a shade under the coat
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* THE MONKEY'S OWN SHELL, taken on animal-baboon.ts's argument and not in
   * spite of it: a mandrill is a baboon and a baboon is a monkey. */
  hull: { part: 'box-33' },
  belly: 0.4375,

  /* Heavy and short — a mandrill is the largest monkey in the world and stands
   * on all fours. */
  legs: { x: 0.34, z: 0.28 },

  /* Small, bare and close to the head, painted skin rather than coat — the
   * baboon's own choice, and correct for the same reason. */
  ears: { part: 'wedge-04', paint: 'hide' },

  /* THE MUZZLE. See MUZZLE_STRETCH and the header for what it is measured
   * against. box-18 is the elephant's trunk, which the bank files as a tail;
   * animal-baboon.ts found it and animal-crocodile.ts wears it at the opposite
   * ratio. */
  snout: {
    part: 'box-18',
    paint: 'hide',
    stretch: MUZZLE_STRETCH,
    at: [0, MUZZLE_Y, FRONT_PLATE_Z],
  },

  /* On the muzzle's own placed front plane — automatic, once a snout exists —
   * and painted the same red as the stripe it terminates. */
  nose: { part: 'box-09', paint: 'stripe' },

  extras: [
    /* THE RIBS, on the muzzle's own flanks. A mirrored pair, laid long and
     * shallow: 0.506 down the muzzle and 0.171 deep. */
    {
      name: 'rib',
      part: 'plate-10',
      paint: 'skin',
      kind: 'pair',
      stretch: [1, 0.7, 2],
      at: [MUZZLE_HALF_X + CARD_GAP, MUZZLE_Y, MUZZLE_Z],
    },
    /* THE STRIPE, turned onto the muzzle's top. `{ z, 90 }` takes an `x +1`
     * card to `y +1`, and it is `single` because a stripe is on the midline. */
    {
      name: 'stripe',
      part: 'plate-10',
      paint: 'stripe',
      stretch: [1, 1, 2],
      spin: [{ axis: 'z', deg: 90 }],
      at: [0, MUZZLE_Y + MUZZLE_HALF_Y + CARD_GAP, MUZZLE_Z],
    },
    /* THE STUB. Held upright on the rear plate, where the baboon's is carried up
     * the chamfer and drops. */
    { name: 'tail', part: 'cone-01', paint: 'coat', at: [0, 1.05, -0.625] },
  ],

  flag: 'THE MARKING CARDS ARE ON THE MUZZLE AND NOT ON THE HULL, WHICH IS NEW. Three plate-10 '
    + '— a mirrored pair on the muzzle\'s flanks and one turned onto its top — are the blue '
    + 'ridges and the red stripe that make a mandrill a mandrill. Every marking card in this '
    + 'project so far sits on a flank or a spine of the BODY; these sit on a feature, and the '
    + 'stations are the muzzle\'s own solve rather than numbers anyone eyeballed: box-18 at 1.45x '
    + 'its reach joined at the cube\'s front plate puts its centre at z = 0.933278 with '
    + 'half-extents 0.113850 and 0.205591, and each card is that plus the pack\'s own 0.010 of '
    + 'daylight. THEY ARE CARDS AND A MANDRILL\'S RIDGES ARE RELIEF — real bone under skin, '
    + 'geometry rather than paint — and a zero-thickness card is the nearest this bank gets. '
    + 'That is the gap. THIS ANIMAL IS DELIBERATELY animal-baboon ON THE SAME HULL WITH THE SAME '
    + 'MUZZLE SHAPE, because a mandrill is a baboon and animal-baboon.ts\'s own argument about '
    + 'the frozen monkey binds twice as hard here. The three differences are the ribs, a muzzle '
    + '7% longer and 0.04 lower, and A STUB TAIL where the baboon has wedge-15 carried up the '
    + 'chamfer — and only the first and the third would be visible to a child. THE BARE RUMP IS '
    + 'ABSENT for the reason five other files carry: Paint.patch takes a HEIGHT and has no z '
    + 'term, so "the back end is coloured" is unsayable, and box-33 has one band. NEW PALETTE, '
    + 'UNREVIEWED — and this one is worth a hard look, because a blue-and-red face on an olive '
    + 'body is either the animal or a clown.',
})
