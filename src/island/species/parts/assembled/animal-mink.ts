/**
 * The mink — the second of the three water mammals, and the one that has to
 * stay clear of `animal-stoat` as well as of `animal-beaver`.
 *
 * A mink and a stoat are the same genus with the same tiny ears and the same
 * rope tail, and in life the difference is entirely COLOUR: a stoat is bright
 * chestnut over a white belly with a black tail tip, and a mink is one near-
 * black chocolate from nose to tail with a white chin and nothing else. So
 * that is where the separation is made here, and the shapes are allowed to
 * agree, which is the honest way round:
 *
 *   - **Same ear, `box-05`** — the smallest in the bank at 0.221 x 0.232. Both
 *     animals have ears you can barely see and giving one of them a bigger ear
 *     would be a lie a child can check against a picture book.
 *   - **Same family of tail, `wedge-18`, painted FLAT.** The stoat spends
 *     Kenney's band 3 — the third of the whip furthest from the join — on a
 *     black tip. This one deliberately does not, and that absence is the
 *     separation: a mink's tail is the same colour as the rest of it.
 *   - **A different hull.** The stoat is `box-31`, the lion's shallow shell at
 *     1.125 deep, and this is the full 1.250 cube on a 6/16 wheelbase, which
 *     makes it the longer and heavier of the two.
 *
 * Against the beaver, which is FROZEN: no paddle tail, no `box-02` ear, no
 * `tube-01` barrel muzzle. `collections/woodland.ts` names that trio.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const MINK_ASSEMBLY = defineCreature('animal-mink', {
  palette: {
    coat: 0x35281f,
    chin: 0xe6dccb,
    mark: 0x15100c,
    limb: 0x241b14,
    pupil: PACK_PUPIL,
  },

  /* The pale slot is a CHIN and not a belly, and it is named because a mink has
   * no pale underside at all — there is deliberately no `belly` line on this
   * animal, which is half of what holds it apart from the stoat's 10/16. It is
   * also the sclera. */
  under: 'chin',

  /* 6/16, the longest stance the pack's grid allows: `box-01` is 0.375 deep, so
   * each leg's outer face lands on 0.5625, one sixteenth inside the hull's own
   * 0.625. `animal-ferret.ts` derives it. */
  legs: { z: 0.375 },

  /* The smallest ear in the bank, and the stoat's — see the header for why that
   * is the animals agreeing rather than the builder repeating himself. */
  ears: { part: 'box-05', paint: 'coat' },

  /* The fox's muzzle, for Kenney's own horizontal cut: band 3 is its lower 20
   * triangles, painted cream for the white chin, and band 7 its upper 14, left
   * dark. That is the whole of a mink's marking. */
  snout: { part: 'tube-06', paint: { base: 'chin', byBand: { 7: 'coat' } } },

  /* The cat's and the polar bear's nose-tip, on the muzzle's placed front
   * plane, sunk its own measured 0.147004 so it beds in rather than sits on. */
  nose: { part: 'box-10', paint: 'mark' },

  /* The tiger's whip, painted FLAT. It is the same shape the stoat wears and
   * the absence of the stoat's band-3 black tip is the separation. */
  tail: { part: 'wedge-18', paint: 'coat' },

  flag: 'THE MINK AND THE STOAT SHARE THEIR EAR AND THEIR TAIL SHAPE, ON PURPOSE, and that is '
    + 'the decision to look at. woodland.ts\'s header names otter/mink/coypu against each other '
    + 'and against the frozen animal-beaver as this collection\'s hardest separation, and mink '
    + 'against stoat is the fourth edge of it. In life those two are the same genus with the '
    + 'same barely-visible ears and the same rope tail, and the difference is entirely COLOUR: '
    + 'a stoat is bright chestnut over a white belly with a BLACK TAIL TIP, and a mink is one '
    + 'near-black chocolate from nose to tail with a white chin. So the shapes agree — box-05, '
    + 'the bank\'s smallest ear, and wedge-18, the tiger\'s whip — and the separation is made '
    + 'where it really is. The tail is painted FLAT and the ABSENCE of the stoat\'s band-3 tip '
    + 'is deliberate; there is also no belly line at all here against the stoat\'s 10/16, and '
    + 'the hull is the full 1.250 cube against the stoat\'s shallow box-31. Giving one of them a '
    + 'bigger ear to tell them apart would have been a lie a child can check against a picture '
    + 'book. AGAINST THE BEAVER: no paddle tail, no box-02 ear, no tube-01 barrel muzzle. NEW '
    + 'PALETTE, UNREVIEWED — and it is doing more work on this animal than on any other in the '
    + 'collection.',
})
