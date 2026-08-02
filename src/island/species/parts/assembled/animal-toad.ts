/**
 * The toad's assembly, as a definition.
 *
 * ONE SPECIES, ONE FILE. Adding a species is this file and one appended line in
 * `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * `collections/garden.ts` names frog/toad as a confusable pair in its own
 * header, and roster §4 names it too. **Neither animal has an ear or a tail** —
 * a frog with either would be a lie — so the whole of the separation has to come
 * from somewhere else, and here it comes from four places at once:
 *
 *   1. **The warty back.** Nine `box-05` DOMES, three to a row, on the back and
 *      the two shoulder chamfers. The frog is smooth.
 *   2. **A blunt face.** `tube-03`, the deer's broad rounded nose — 0.532 wide
 *      by 0.300 tall and only 0.231 deep — against the frog's wide flat mouth
 *      plate. Toad snub, frog gape.
 *   3. **Hull depth.** This is `box-03`, 1.250 deep; the frog is on the lion's
 *      `box-31` at 1.125. Choosing a different authored hull is not a stretch
 *      (see `hulls.ts`), so the difference costs nothing and needs no `why`.
 *   4. **The palette**, which is the signed-off drab olive against the frog's
 *      signed-off bright green, and one shade duller in every slot.
 *
 * **The warts are the point, and they are deliberately not spikes.** The
 * hedgehog in this same collection wears twenty `cone-01`, and if a toad's back
 * reads as spiny rather than as bumpy the animal is wrong and the hedgehog is
 * damaged with it. The two shapes are measurably opposite:
 *
 *   | | `cone-01`, the hedgehog's | `box-05`, this |
 *   |---|---|---|
 *   | taper | **0.000** — a true point | **1.000** — no point at all |
 *   | size | 0.160 x 0.400 x 0.329 | 0.221 x 0.232 x 0.191 |
 *   | profile | radius 0 at the tip | radius 0.110 at the MIDDLE, 0 at both poles |
 *   | stands | 0.275 proud, 1.7x taller than wide | 0.116 proud, **1.9x wider than proud** |
 *
 * `box-05`'s 108 points sit on six rings — radius 0.000 at y = -0.116, 0.068 at
 * -0.0938, 0.110 at -0.0358, and the same three mirrored above. It is a squashed
 * ball, radially symmetric, and its taper of 1.000 says the two ends of it are
 * identical rather than that it comes to a point. Half of it above a surface is
 * a **dome**: 0.221 across and 0.116 tall. That is a wart.
 *
 * ## Every number, and where it came from
 *
 *   - **The hull, the legs and the eye plane are not mentioned below**, because
 *     all three are what `defineCreature` gives a definition that says nothing:
 *     `box-03` at the pack's own `[0, 0.80625, 0]`, four `box-01` sunk 0.408163
 *     on the row at y = 0.18125 that never moves, and two `plate-01` at the
 *     card's own recorded (0.2625, 0.933646) on the absolute z = 0.6350.
 *
 *     **The eye height is left alone on purpose.** The frog carries its eyes
 *     HIGH and round, which is the frog's own separation; the toad's sit on the
 *     card's own recorded 0.933646, which is not a number this species chose. A
 *     face that differs because the other animal moved is a stronger claim than
 *     two faces both hand-placed away from each other.
 *
 *   - **HEIGHT WAS CHECKED FIRST, and it is the warts that carry it.** A bare
 *     cube on standard legs is 1.43125 — the pack's floor, cleared by 0.00125 —
 *     and the top row of warts stands 0.116 above the cube's own top face, so
 *     the animal measures **1.547**. Inside 1.43-2.02 with room either side, and
 *     it is the only thing on this species that reaches above its own back.
 *     `garden.ts` calls the toad "lower, squatter" and that part is unsayable
 *     here rather than ignored: `HEIGHT_FLOOR` in `hulls.ts` is explicit that the
 *     method has no headroom underneath the cube at all.
 *
 *   - **Nine warts, three rows, and two of the three are one line.** `ridge`
 *     with `rows: ['top', 'chamfer']` is §8's chamfer idiom minus its flanks: the
 *     top face, and the two edge chamfers between the top and the sides, which
 *     mirror to three rows of three. The facings are then -45, 0 and +45 degrees
 *     — three even steps, the hedgehog's five without the two that would wrap the
 *     warts round onto the belly. **A toad is warty on its back, not on its
 *     flanks**, so the `side` row is dropped and the count is Joe's nine rather
 *     than the fifteen all three rows would give.
 *
 *     The stations are the builder's, not chosen: the flat top face reaches
 *     z = 0.3125 and a wart buried 0.116 stays embedded to 0.4285, inside which
 *     the span snaps down to the pack's own 1/16 grid — 6/16 — putting the three
 *     at **z = +0.375, 0 and -0.375**. Same three on every row, which is what
 *     makes nine warts read as one warty back rather than as three rows.
 *
 *     At 0.375 apart and 0.221 across they do NOT overlap, and that is the whole
 *     difference from a ridge: the hedgehog's spikes are 0.250 apart on a 0.329
 *     depth so a row welds into one serrated edge, and these stand apart as
 *     separate lumps.
 *
 *   - **Sunk 0.5, and it is the one number this species chooses.** `box-05`'s
 *     own measured burial is 0.000 — the bee and the caterpillar wore it on a
 *     round head, where a tangent ball is fine — and on a flat cube face 0.000
 *     leaves it touching at a single pole vertex, which is a ball balanced on the
 *     skin. §3 is explicit that depth is "a dial rather than a floor", and for a
 *     radially symmetric shape whose two ends are identical there is exactly one
 *     depth that needs no argument: **half**. That is the hedgehog's own reason
 *     for its nose sphere's `sink: 0.5`, and 0.500 is also the pack's measured
 *     ear mean (0.548) to within a twentieth.
 *
 *     `pets:creature` prints these nine as `THIN`, because half of a 0.232 shape
 *     is 0.116 and its threshold is 0.125. That threshold is §3's ear line, and
 *     §3.1 demoted it in writing — "it is now a dial rather than a floor". To
 *     clear it here would mean burying MORE than half a symmetric ball, which
 *     makes a smaller dome rather than a better-attached one. Nothing floats:
 *     half of every wart is inside the hull.
 *
 *   - **The snout is `tube-03`, the deer's nose, and the transfer RECOVERS the
 *     donor's own centre.** Joined at this cube's front face z = 0.625 and sunk
 *     its own measured 0.000, its centre lands on z = 0.740710 — which is the
 *     bank's recorded offset for the shape, to six decimals, arrived at without
 *     using it. Its height is the one coordinate the join does not move,
 *     y = 0.757432, and that transfers exactly rather than by inference: the
 *     deer's hull is `box-12`, whose centre is the same 0.80625 and whose front
 *     face is the same 0.625. §8 gives a nose's z as 1.080 +/- 0.074 of the hull
 *     bbox and this sits at 1.093, inside it.
 *
 *     It is painted from the accent slot with the legs, so the jaw reads as one
 *     dark blunt line across the front of the face.
 *
 *   - **No nose, no ears, no tail.** The ears and the tail are anatomy. The nose
 *     is a choice and it is a deliberate absence: the pack's nose family is
 *     mammal buttons and beaks, an amphibian has neither, and the only honest
 *     alternative — the cow's `plate-12` nostril card — is a two-triangle flat
 *     card that would have to be floated off a z nobody measured. §3's "nothing
 *     floats" is worth more than two nostrils.
 *
 *   - **The belly is PAINTED at 8/16**, §4's second way: no second shape, no
 *     split triangle, no geometry. 0.5 is the tiger's own belly boundary made
 *     exact — the only point on the pack's 1/16 grid inside the 0.4808-0.5481
 *     zone it wanders across — and it is also the hull's own equator.
 *
 *   - **The palette is `garden.ts`'s own signed-off four** for this species —
 *     drab olive coat, sandy belly, a darker olive for the warts and the darkest
 *     for legs and jaw — plus the measured pupil. Nothing here is a new colour,
 *     and every one of the four is duller than the frog's opposite number.
 *
 * **No flag.** Nothing was strained: 744 triangles against the pack's 422-951,
 * height 1.547 inside 1.43-2.02, keep-out 0.74 against the fox's 1.15, every
 * part joined at a face its donor joined its own to, and one sink chosen with its
 * reason above.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const TOAD_ASSEMBLY = defineCreature('animal-toad', {
  palette: {
    coat: 0x8e7c4c,
    belly: 0xd8ca9f,
    wart: 0x6a5b33,
    limb: 0x4c4023,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  snout: 'tube-03',
  ridge: {
    part: 'box-05',
    paint: 'wart',
    name: 'wart',
    count: 3,
    rows: ['top', 'chamfer'],
    sink: 0.5,
  },
})
