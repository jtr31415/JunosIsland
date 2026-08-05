/**
 * The husky — the tail is carried, not trailed, and that is the whole of the
 * separation from `animal-wolf`.
 *
 * A husky beside a grey wolf is roster §4's worst case in this collection, and
 * the two animals share a family shape by right. So the separation is made in
 * the mechanism §3.1 recommends — *one shape, two animals, told apart by
 * placement* — rather than by giving one of them geometry the other should have:
 *
 *   - **Both wear `box-38`, the parrot's fan.** The wolf takes it by pure donor
 *     transfer and it TRAILS off the rear plate. This one takes it with
 *     `chamfer: true`, which solves the rear-top chamfer midpoint and the 45
 *     degree turn onto its normal together, so the same tail is carried UP over
 *     the rump. That is a husky's sickle tail and it is the first thing anyone
 *     looks at on one.
 *   - **The hull is `box-03` and NOT `box-21`.** `animal-wolf.ts` measured
 *     `box-21` as the standard cube with two erect ear lugs fused on top, so a
 *     wolf has no ear part at all. This animal has ears of its own — `cone-04`,
 *     the hog's, taper 0.25, the sharpest point in the ear family — standing up
 *     off the flat crown. A husky's ears are small, thick and pricked, and
 *     having them as PARTS rather than as a shell is what lets them be.
 *   - **The nose is `box-15`, the DOG's.** The wolf's is `box-32`, the lion's
 *     and the tiger's pad, chosen there for being bigger on all three axes. A
 *     husky is a dog and takes the dog's.
 *   - **The eyes are ice blue**, which is the one fact a child is told about
 *     this animal, against the wolf's amber.
 *
 * The mask is `tube-06`'s own cut — band 3 is its lower 20 triangles, band 7 its
 * upper 14 — so a pale muzzle under a dark bridge costs one entry. The two brow
 * spots are `plate-13`, the flat face-plate card the crab, dog, lion and tiger
 * share, put on the forehead at the absolute eye plane.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/** `box-03`'s flat crown, +/-0.3125 in x and z before the chamfer falls away. */
const CROWN_Y = 1.43125
/** The eye plane. A card on the brow sits on it, like every other flat sheet. */
const CARD_Z = 0.635

export const HUSKY_ASSEMBLY = defineCreature('animal-husky', {
  palette: {
    coat: 0x4a505a,    // UNREVIEWED: charcoal, the saddle and the head
    mask: 0xf2f5f8,    // UNREVIEWED: the white mask, muzzle, brows and underside
    mark: 0x1e2126,    // UNREVIEWED: the nose and the ear backs
    limb: 0xe4e9ee,    // UNREVIEWED: white legs, which a husky has
    eye: 0x7fb8d8,     // UNREVIEWED: ice blue, and it is a look rather than a measurement
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  hull: { part: 'box-03' },
  /* The pale slot is a MASK and not a belly — it is doing four jobs on this
   * animal and only one of them is an underside. */
  under: 'mask',
  belly: 0.5,

  /* The hog's ear, standing. taper 0.25 is the sharpest point in the ear family
   * and a husky's ear is a small thick triangle. Its own burial of 0.71 is
   * taken, which leaves it short and thick rather than tall. */
  ears: { part: 'cone-04', paint: 'mark', at: [0.26, CROWN_Y, 0.22] },

  /* Kenney's own horizontal cut, used the way `animal-wolf.ts` and
   * `animal-badger.ts` use it: pale to the lip, dark over the bridge. */
  snout: { part: 'tube-06', paint: { base: 'mask', byBand: { 7: 'coat' } } },

  /* THE DOG'S nose, not the lion's — see the header. */
  nose: { part: 'box-15', paint: 'mark' },

  /* THE SICKLE. The same shape the wolf trails, carried UP the rear-top
   * chamfer. `chamfer: true` solves the midpoint and the 45 degree turn onto
   * its normal together; giving one by hand and not the other is how a tail
   * floats (`creature.ts`). */
  tail: { part: 'box-38', paint: 'coat', chamfer: true },

  eyes: { paint: 'eye' },

  extras: [
    /* THE BROW SPOTS. A husky's are the marking people describe as eyebrows,
     * and `plate-13` is the smallest flat face card in the bank at 14
     * triangles. On the absolute eye plane, above the cards. */
    { name: 'brow', part: 'plate-13', paint: 'mask', kind: 'pair', at: [0.2625, 1.12, CARD_Z] },
  ],

  flag: 'THE TAIL IS THE SEPARATION FROM animal-wolf AND IT IS THE SAME SHAPE. Both wear '
    + 'box-38, the parrot\'s fan; the wolf takes it by donor transfer and it trails, and this '
    + 'one takes it with `chamfer: true` so it is carried UP over the rump. That is §3.1 '
    + 'exactly — one shape, two animals, told apart by placement — and it is a husky\'s sickle '
    + 'tail, which is the first thing anybody looks at on one. If the two still twin, this is '
    + 'the dial. THE HULL IS box-03 AND NOT box-21 on purpose: animal-wolf.ts measured box-21 '
    + 'as the cube with two fused ear lugs, so a wolf cannot have an ear PART, and this animal '
    + 'wears cone-04, the hog\'s ear, taper 0.25 — the sharpest point in the ear family and the '
    + 'shape a pricked husky ear is. THE NOSE IS THE DOG\'S box-15 where the wolf takes the '
    + 'lion\'s box-32. THE ICE-BLUE EYE is a look and it is yours; it is also the one fact a '
    + 'six-year-old knows about this animal. NEW PALETTE, UNREVIEWED.',
})
