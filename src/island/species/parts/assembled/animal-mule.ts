/**
 * The mule — Farm's own definition of the animal, cashed in directly:
 * `collections/farm.ts` calls it *"the donkey's ears on something closer to
 * the horse's build."* No other Farm species is this literally its own brief,
 * so this file is the most explicitly derived in the collection and is kept
 * SHORT on purpose. **Read `animal-horse.ts` first — this file restates
 * nothing it already argued and points at it by section instead.**
 *
 * ## THE HULL IS `box-41`, THE HORSE'S OWN — "closer to the horse's build" taken literally
 *
 * Every number `animal-horse.ts` §1 measured off this shell — the muzzle boss
 * at z = 0.725 stopping short of the eye card, `TOP_PLATE_Y = 1.43125`
 * IDENTICAL to `box-03`'s own top, the two transverse crown pads at 1.48125 —
 * transfers unchanged, because it is the same shell. Band 3 (§3 there) is
 * still the underline and the whole muzzle boss in one entry, still refuses
 * `belly` for the same JT-044 reason, and the giraffe's `tube-07` (§4 there)
 * still fits it for the same three coincidences. None of that is re-argued
 * here.
 *
 * ## THE EARS ARE THE DONKEY'S — `box-06`/`box-07`, and the height ceiling decides the join
 *
 * `box-06` is the bunny's ear, reserved in the digest for exactly the donkey
 * and the mule, and it is the biggest ear in the bank — `animal-fennec-fox.ts`
 * spent one whole species proving it is 0.913298 tall and that its natural
 * home is a 1.250-cube's own top face. That is this hull's `TOP_PLATE_Y` too,
 * to the digit (`animal-horse.ts` §1), so the fennec fox's own donor transfer
 * carries over verbatim: joined at `TOP_PLATE_Y`, sunk the shape's own
 * `sunkFractionMean` (0.366259, untouched), the ear's own recorded x and z
 * (0.286975, 0.347082) reproduce exactly — because 0.347082 sits outside
 * `box-41`'s crown-pad z-span of 0.1383–0.2575, so the plate under it is
 * flat and identical to `box-03`'s.
 *
 * **The join is `TOP_PLATE_Y` and not the horse's own `CROWN_Y`, and that is
 * forced rather than chosen.** The horse's `cone-01` is short enough to stand
 * on the raised crown pad and clear the pack's ceiling with room to spare; this
 * ear is not. At `CROWN_Y` the crown reaches 2.060044 — 0.040044 OVER
 * `PACK_HEIGHT_MAX`'s 2.02. At `TOP_PLATE_Y` it reaches **2.010044**, which is
 * `animal-fennec-fox`'s own shipped height to six decimals, because both ride
 * the same ear joined to the same effective plate — the fennec fox's own
 * hull happens to BE that plate, and this one only touches it 0.050 lower
 * than its crown. **Nothing may stand above this ear**, exactly as the fennec
 * fox already committed to, and if that margin ever needs opening the fix is a
 * shorter ear, never a shaved hull.
 *
 * ## THE THIRD COLOUR — colour is the only free separation once the ears are shared
 *
 * The horse is golden chestnut, the donkey is dove grey (digest §"four
 * equids"). This animal is neither: **a dark seal-brown / mouse-dun**, the
 * one hue a child has not already been shown on this hull. `pale` keeps the
 * horse's band-3 mealy pattern — muzzle, underline, sclera — muted rather
 * than cream, because a working animal's markings read as "faded", not
 * "flaxen". `hoof` is the darkest slot on any equid built so far, which is
 * the other half of the same argument: nothing warm is left for this animal.
 *
 * ## THE TAIL IS THE HORSE'S, NOT THE DONKEY'S — argued, not defaulted
 *
 * The donkey's own tail (a thin tuft — `wedge-07` or the stub `box-18`) was
 * considered and set aside: a mule's tail is a horse's tail, hair to the hock,
 * which the digest itself flags as the defensible read. So this is
 * `animal-horse.ts` §5's `box-38` flipped, verbatim — same hull, so
 * `TAIL_JOIN_Y` and `REAR_PLATE_Z` are the same numbers for the same reason.
 * Painted `coat`, not `pale`: this animal has no flaxen anywhere, so its tail
 * matches its body rather than lightening at the switch.
 *
 * ## NO MANE, NO FORELOCK — a real absence, not a shortcut
 *
 * A working mule's mane is traditionally roached — clipped short to the
 * crest — where the horse's is long and flaxen. That is an actual point of
 * separation and it is also why this file has no `extras`: the horse's two
 * `bespoke-square-01` entries are dropped rather than shrunk, and the crown
 * pads they stood on carry nothing here.
 *
 * ## EVERYTHING ELSE IS THE HORSE'S, UNCHANGED
 *
 * The JT-044 hoof line (`legs.paint.patch.at: 0.25`), the giraffe muzzle, the
 * deer nose on `on: 'snout'`, the default eyes — all copied rather than
 * re-derived, because nothing about a mule changes what a leg, a face or an
 * eye on this hull already is. See `animal-horse.ts` §§3–4 and §6 for the
 * arithmetic and the refusals (a second two-tone line, `box-29`'s mane ring, a
 * mouth card) — all of it applies here unchanged and none of it is re-argued.
 *
 * Measured on the built model: height **2.0100** (0.0100 under the pack's own
 * 2.02 ceiling — the fennec fox's own margin, for the reason above), keep-out
 * **1.056** (under the horse's own 1.0556 and well under the fox's 1.15),
 * **714 triangles** against `MODEL_TRIS_MAX` and **583 vertices**. Not one
 * budget is strained, and nothing here is stretched or authored — the only
 * shapes worn are bank parts already spent elsewhere in this collection.
 * NOT reviewed — the palette is new and nobody has signed it off.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* `box-41`'s own numbers, identical to `animal-horse.ts`'s — same hull, see
 * that file's header for the measurement. Not re-derived here. */
const TOP_PLATE_Y = 1.43125
const TAIL_JOIN_Y = 0.662654
const REAR_PLATE_Z = -0.625

/* `box-06`'s own recorded offset (the bunny's ear, on its own donor hull),
 * reproduced rather than chosen — see the header. */
const EAR_X = 0.286975
const EAR_Z = 0.347082

export const MULE_ASSEMBLY = defineCreature('animal-mule', {
  palette: {
    coat: 0x5a4632,    // UNREVIEWED: seal-brown / mouse-dun — neither the horse's gold nor the donkey's grey
    pale: 0xd9c9a8,    // UNREVIEWED: muted mealy — band-3 muzzle and underline, sclera
    limb: 0x40311f,    // UNREVIEWED: the leg above the hoof, a shade under the coat
    hoof: 0x241c15,    // UNREVIEWED: the darkest slot on any equid built so far
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  under: 'pale',

  /* THE HORSE'S HULL, unchanged: band 3 is the underline and the whole muzzle
   * boss in one entry. See `animal-horse.ts` §1 and §3. */
  hull: { part: 'box-41', paint: { base: 'coat', byBand: { 3: 'pale' } } },

  /* JT-044, VERBATIM — see `animal-horse.ts` for the full derivation. */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  /* THE DONKEY'S EAR, THE HORSE'S HULL. Joined at `TOP_PLATE_Y`, not the
   * horse's own `CROWN_Y` — that join alone clears the pack's height ceiling
   * by 0.0398 where the crown join would bust it by 0.0400. x and z are
   * `box-06`'s own recorded offset, reproduced because they land on flat
   * plate outside this hull's crown pads. See the header. */
  ears: {
    part: 'box-06',
    at: [EAR_X, TOP_PLATE_Y, EAR_Z],
    paint: 'coat',
  },

  /* The giraffe's muzzle, unchanged — see `animal-horse.ts` §4. */
  snout: { part: 'tube-07', paint: 'pale' },

  /* The deer's nose, unchanged — see `animal-horse.ts`. */
  nose: { part: 'box-14', paint: 'hoof' },

  /* The horse's switch, verbatim: same hull, same join. Painted `coat`, not
   * `pale` — this animal has no flaxen, so the tail matches the body rather
   * than lightening at the switch. See the header. */
  tail: {
    part: 'box-38',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
    paint: 'coat',
  },

  motion: [
    { kind: 'wag', parts: ['tail'] },
    { kind: 'twitch', parts: ['ear'] },
  ],
})
