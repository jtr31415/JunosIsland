/**
 * The donkey — Farm's small grey equid, cut from `animal-horse.ts` on purpose:
 * same hoof, same muzzle family, same eyes and legs. It differs from the horse
 * in exactly three places (hull, ears, tail) and this file argues those three
 * and nothing else.
 *
 * ## READ `animal-horse.ts` FIRST. This file does not restate it.
 *
 * JT-044 (the two-tone hoof), the eye-card standoff, and the tube-06/tube-07
 * muzzle-family argument are all the horse's, derived once and pinned by
 * `assembly-pony.test.ts`. Copied verbatim below; not re-argued.
 *
 * This file's own three findings:
 *
 *   1. **The ear the pony refused is the ear this species was built to wear**,
 *      and its seating is measured fresh rather than assumed — §1.
 *   2. **`box-03` has no band split at all** (one band, all 60 triangles), so
 *      the horse's free "band 3 = muzzle + belly" trick does not transfer here.
 *      The pony's OLDER two-entry version of the same idea does, verbatim — §2.
 *   3. **The bank's two thin tails (`wedge-07`/`wedge-18`) are baked curling
 *      UP, cat-fashion, not hanging down**, and nobody has used one as a
 *      hanging tail before. Spun, one becomes a donkey's rope — §3.
 *
 * ## 1. THE EAR: `box-06`, the shape the pony measured and handed forward
 *
 * `animal-pony.ts` rejected `box-06` by name: on `box-03` it stands 0.5788
 * proud at its own burial, making the animal 2.0101 tall — "a donkey's
 * silhouette on a Shetland." That is not a flaw in the shape, it is the
 * pony recognising whose ear it was measuring. This species is that donkey.
 *
 * **The recorded offset is not usable as-is, and the reason is new: `box-06`'s
 * donor (the bunny) is ALSO built on `box-03`** — it is in the hull's own
 * provenance list — so its recorded offset (0.286975, 1.553396, 0.347082) looks
 * like a pure donor transfer, the way `cone-01`'s was for the pony. It is not
 * one. Both the bunny's recorded x and its recorded z sit further out than the
 * pony's own ear ever reached, and box-03's flat top plate is only 0.3125
 * across (`|x|,|z| <= 0.3125`, measured off the 12 top-face vertices, and
 * identical to `box-41`'s per the horse's own header). Ray-casting `box-06`'s
 * own 24 sub-join-plane vertices against `box-03`'s actual triangles (not the
 * bounding box) at the raw donor offset finds **5 of them standing proud of the
 * hull, worst case 0.0490 of daylight** — a real, small float, of exactly the
 * kind §3 says not to ship.
 *
 * Walking the x inward at the pony's own z (0.25, the pack's 4/16 grid line,
 * the same value the pony and the horse both solved to) finds the float's
 * threshold at **x = 0.2140**: above it, five vertices break the surface; at or
 * below it, all 24 are embedded. This species takes **x = 0.20**, one grid step
 * short of the threshold, which leaves the tightest vertex embedded by 0.0093 —
 * a real margin, not a coincidence of rounding. (`z` stays the pony's 0.25;
 * moving it did not change which vertices floated, only `x` did — the float is
 * a corner of the ear's OWN footprint clearing the plate's side edge, not the
 * front one.)
 *
 * **The height consequence is the point of the file.** Proud extent is
 * unchanged by where the ear sits in x and z — `size[1] x (1 -
 * sunkFractionMean)` = `0.913298 x 0.633741` = **0.578794** — so joined at this
 * hull's own flat top (`TOP_PLATE_Y`, identical to `box-03`'s top, 1.43125),
 * this donkey stands **2.010044** tall against `PACK_HEIGHT_MAX`'s 2.02: 0.0100
 * to spare. The tallest ears in the collection, on the smallest body, and it
 * clears the ceiling by less than a centimetre of scale. That is not a
 * coincidence either — it is the exact number the pony read off this shape and
 * declined for itself.
 *
 * No stretch: `box-06` is an actual ear, aspect [1, 0.528, 0.335], not a blade
 * standing in for one the way the pony's `cone-01` was. It is placed, not
 * reshaped.
 *
 * ## 2. THE MUZZLE AND BELLY: the horse's trick doesn't transfer, so this is the
 * pony's older, two-entry version of it, restored
 *
 * The brief's free pale-muzzle-and-belly trick is real on `box-41` because that
 * hull is cut into three bands and band 3 happens to be both the muzzle boss
 * and the underline at once. **`box-03` is not cut at all** — every one of its
 * 60 triangles carries `bands: 5` (verified against the raw array, not
 * inferred) — so there is no band to redirect and the horse's one-entry version
 * of the trick is not available here.
 *
 * The same pale-muzzle-and-pale-belly marking is still free, though, because
 * `animal-pony.ts` solved it first and for a cheaper reason: `belly: 0.5`
 * patches the hull at the tiger's own mammal line (8/16, this hull's own
 * equator) for zero geometry, and `tube-06`'s own Kenney cut gives a second
 * free line — band 3, the fox muzzle's lower 20 triangles — for the snout
 * alone. Two entries where the horse spent one, same zero triangles either
 * way. The horse's own header names this explicitly: *"Recorded so a sibling
 * on `box-03` knows to put it back: on the cube's 0.625 square front face it
 * fits, and there the fox's own 2-band cut is worth having."* This is that
 * sibling. `tube-07` (the horse's giraffe muzzle, sunk to bed against a muzzle
 * BOSS `box-03` does not have) is refused for the same reason `tube-06` was
 * refused on the horse — it is the other hull's fit, not this one's.
 *
 * ## 3. THE TAIL: `wedge-07`, spun over, because it is baked to curl the wrong
 * way for a donkey
 *
 * The brief is right that a donkey's tail is a thin rope and not a horse's
 * switch, which refuses `box-38` on shape and `box-18` on length (a 0.623-tall
 * stub reads as a dock, not a rope). `wedge-07` (0.2 wide, 1.047 long, the
 * cat's own tail, `wedge-18` is the tiger's identical twin) is sized right. But
 * measured off its own baked vertices, **it is not a hanging shape**: its
 * attachment axis is `z` (it roots at the hull's rear face) while its LONGEST
 * dimension sits on local y, and the sub-join-plane cluster — the part actually
 * meant to bury into the hull — occupies local y **-0.5233 to -0.1113**, the
 * BOTTOM of its own range, with the free-standing material reaching up to
 * **+0.5233**. Placed as baked, this tail roots low and curls its tip UP to
 * world y 1.71 — a cat's tail lifted at rest, which is exactly what the donor
 * was. No species has worn either `wedge-07` or `wedge-18` before this one.
 *
 * `spin: [{ axis: 'z', deg: 180 }]` negates x and y and leaves the z-facing
 * alone, precisely the pony's own box-38 idiom (`animal-pony.ts:171-178`) —
 * applied here to a part with the opposite native problem. After the spin the
 * root cluster occupies local y **+0.1113 to +0.5233** (the TOP of the range
 * now) and the free fall reaches down to -0.5233: a dock at the rump with a
 * thin fall hanging off it, the same READ as the pony's own tail, from a
 * differently-baked donor.
 *
 * The join height is then solved exactly as the pony's own tail was — the
 * highest y at which the whole spun root still sits on the rear plate's flat
 * geometry, not its chamfer: `REAR_PLATE_TOP_Y - 0.5233` = **0.59545** (this
 * hull's rear plate top, identical to the horse's, at 1.11875). Ray-cast
 * against `box-03`'s actual rear face, all 42 of the root's sub-plane vertices
 * come out embedded, worst case 0.0012 — thin, like the box-18/pony fit the
 * digest already accepts, but never floating. The fall then reaches world y
 * **0.0721**, just above the ground, a rope the right length for the shape
 * that carries it.
 *
 * ## Legs, eyes, nose: unchanged from the horse
 *
 * `legs`, `snout`'s only remaining choice being `tube-06` (above), `nose`, and
 * `eyes` are the horse's own lines, character for character — same hull family
 * (`box-03` is `box-41` at the four faces that matter, per the horse's own
 * header), same JT-044 hoof, same deer nose. Not re-argued.
 *
 * ## The dorsal stripe: not free, spent anyway, and said so
 *
 * The brief asks for it "from a band, if you can — say so either way." §2 just
 * showed `box-03` carries no band split, so the answer is no: this is not
 * free. It is one more entry of the same primitive the horse used for its mane
 * (`bespoke-square-01`, JT-041, no flag needed) cut almost flat — `stretch:
 * [0.12, 0.05, 0.5]`, actual size 0.15 x 0.0625 x 0.625 — sunk at the
 * primitive's own declared half, so it stands **0.03125** proud: a painted
 * line's worth of relief, not a mane's. It runs the flat top plate's own full
 * 0.625 length, same z-span as the horse's mane and for the same reason (both
 * ends stop where the plate does), painted `hoof` — the same dark that already
 * does the horn and the nose, now a third job. Spending one primitive's worth
 * of triangles for one of the animal's four named markings, on a hull that
 * costs 202 fewer triangles than the horse's own `box-41` to begin with, reads
 * as the right trade rather than a hidden one.
 *
 * ## Silhouette and budget
 *
 * Height **2.010044**, inside 1.43-2.02 with 0.0100 to the ceiling — tightest
 * in the collection, and the reason is the ear the pony would not wear. Keep-out
 * and stockiness track the pony's own numbers, since the hull is identical and
 * unstretched. **742 triangles, 549 vertices**, against `MODEL_TRIS_MAX`'s 951 —
 * comfortably inside, even after paying `wedge-07`'s real cost of 212 triangles
 * for the tail, because the hull itself is 202 triangles cheaper than the
 * horse's `box-41` (60 against 262). The hull is 14.5x the next-biggest
 * bounding box on the animal — the EAR, not the tail, by volume. Nothing is
 * over budget; the only authored geometry is one of JT-041's three sanctioned
 * primitives, used once, needing no flag.
 *
 * The signature against the other three equids: **the smallest hull, the
 * longest ears in the pack, dove grey with a pale mealy muzzle and belly, and a
 * thin rope tail — the only one of the four hanging rather than switching or
 * curling.** The pony is a bay Shetland with an upright ear; the horse is a
 * golden chestnut draught on the bigger shell; the mule takes this donkey's own
 * ear onto a build closer to the horse's.
 *
 * **NOT FLAGGED, and the palette is UNREVIEWED** — `farm.ts` gives this species
 * a one-line record and no colours, so all five below are the first ever
 * proposed for it. These animals ship unsigned; there is no `signoff` field
 * anywhere.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

/* ===================================================================== *
 * `box-03`, MEASURED where this file's three findings needed it.
 * ===================================================================== */

/** `box-03`'s own flat top plate, world y. Identical to `box-41`'s. */
const TOP_PLATE_Y = 1.43125
/** Where the flat REAR plate stops. Identical to `box-41`'s. */
const REAR_PLATE_TOP_Y = 1.11875
/** The rear plate itself. Identical to `box-41`'s -0.625. */
const REAR_PLATE_Z = -0.625
/** §1: one grid step short of the measured float threshold of 0.2140. */
const EAR_X = 0.20
/** §1: the pony's and the horse's own 4/16 — inside the flat plate either way. */
const EAR_Z = 0.25
/** §3: `REAR_PLATE_TOP_Y` less `wedge-07`'s own spun-root peak (0.5233 local). */
const TAIL_JOIN_Y = REAR_PLATE_TOP_Y - 0.5233

export const DONKEY_ASSEMBLY = defineCreature('animal-donkey', {
  /* Five slots, the horse's own economy, but `hoof` now does THREE jobs where
   * the horse's did two: the horn-coloured patch, the nose, and (new here) the
   * dorsal stripe — a donkey's horn, muzzle-skin and spine marking are all one
   * dark on a grey coat. */
  palette: {
    coat: 0x8a8478,   // UNREVIEWED: dove/mouse grey
    pale: 0xe6ddc9,   // UNREVIEWED: the mealy pale — muzzle, belly, sclera
    limb: 0x6e685e,   // UNREVIEWED: the leg above the hoof, a shade under the coat
    hoof: 0x2b2723,   // UNREVIEWED: dark horn. JT-044's two-tone leg, the nose, the stripe
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* No `belly` slot, so name the pale one, exactly as the horse did. */
  under: 'pale',

  /* The plain cube, deliberately smaller than the horse's `box-41` — 202 fewer
   * triangles (60 against 262) and no muzzle boss, which is why the pale
   * marking below is two entries instead of the horse's one. See header §2. */
  hull: 'box-03',

  /* §2: the pony's own tiger-line belly, unchanged — this hull's own equator,
   * the only 1/16 grid point inside the measured mammal-line zone. */
  belly: 0.5,

  /* JT-044, VERBATIM — derived at `animal-pony.ts:289-321`, pinned by
   * `assembly-pony.test.ts:112-165`, restated by the horse's own header. Not
   * retuned: this is a measurement off the leg, not a preference about this
   * animal. */
  legs: { paint: { base: 'limb', patch: { below: 'hoof', at: 0.25 } } },

  /* §1: the ear the pony measured and declined. `EAR_X` is one grid step
   * inside the float threshold this file measured fresh (0.2140); `EAR_Z` is
   * the pony's and the horse's own 4/16. No stretch — this is an actual ear,
   * not a blade standing in for one. */
  ears: {
    part: 'box-06',
    at: [EAR_X, TOP_PLATE_Y, EAR_Z],
    paint: 'coat',
  },

  /* §2: the fox's own 2-band cut, restored to the hull the horse pointed it
   * back at. Band 3 (the lower 20 triangles) pale, for the mealy muzzle. */
  snout: { part: 'tube-06', paint: { base: 'coat', byBand: { 3: 'pale' } } },

  /* The deer's nose, on `on: 'snout'` exactly as the horse's is. Painted
   * `hoof`: on a grey donkey the horn and the muzzle skin are the same dark. */
  nose: { part: 'box-14', paint: 'hoof' },

  /* §3: `wedge-07`, the cat's tail, spun 180 degrees on z to invert which end
   * is the root. Baked, it curls UP from a low root (a cat's own posture);
   * spun, it roots at the rear plate's own top edge and hangs down to just
   * above the ground. `TAIL_JOIN_Y` is solved, not copied — the highest y at
   * which the whole spun root still sits on flat geometry, ray-cast against
   * the hull's actual triangles at 0.0012 to spare. */
  tail: {
    part: 'wedge-07',
    spin: [{ axis: 'z', deg: 180 }],
    at: [0, TAIL_JOIN_Y, REAR_PLATE_Z],
    paint: 'coat',
  },

  extras: [
    /* The dorsal stripe — not free (§2 shows this hull has no band to spend),
     * so it is one more of the horse's own sanctioned primitive, cut almost
     * flat: 0.15 x 0.0625 x 0.625, half-buried, standing 0.03125 proud. Runs
     * the flat top plate's full length, same span as the horse's mane and for
     * the same reason. Painted `hoof`, its third job on this animal. */
    {
      name: 'stripe',
      part: 'bespoke-square-01',
      stretch: [0.12, 0.05, 0.5],
      at: [0, TOP_PLATE_Y, 0],
      paint: 'hoof',
    },
  ],

  /* Small and patient does not mean still. Both name features this species
   * actually has. */
  motion: [
    { kind: 'wag', parts: ['tail'] },
    { kind: 'twitch', parts: ['ear'] },
  ],
})
