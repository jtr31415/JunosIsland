/**
 * The newt's assembly, as a definition.
 *
 * ONE SPECIES, ONE FILE. `index.ts` already carries its line; `register.ts` says
 * why that one line is enough.
 *
 * ## What this animal has to do, and how it does it
 *
 * `collections/garden.ts`'s header names **newt/salamander** as a confusable
 * pair — "two small long-bodied amphibians with thin tails and no ears" — and
 * this file has to separate them. It is worth being blunt about what does NOT:
 *
 * **The tails will not do it.** The bank's thin family is four whips and the two
 * animals both want one; whatever the salamander takes, the two silhouettes will
 * carry near-identical tapering blades off the rump and nobody at 0.16 scale will
 * tell them apart on that. Claiming otherwise would be a comment that is false.
 *
 * **The extra does it, and the belly does it.** A great crested newt wears a
 * DORSAL CREST and a vivid orange underside; the salamander wears neither. So
 * this animal's whole separation is a raised, tapering fin down the spine — a
 * thing that changes the top edge of the silhouette, which is the only edge a
 * whip does not touch — and an orange painted below its waterline. Those two are
 * the read, and the tail is just an honest tail.
 *
 * ## Every number, and where it came from
 *
 *   - **HEIGHT FIRST, and the hull is `box-31`.** A newt is low and long in life
 *     and the pack has no room for that: a bare 1.250 cube on standard legs is
 *     1.43125 against a floor of 1.43, so there is no headroom underneath at all
 *     (`HEIGHT_FLOOR`). Low is therefore expressed by the HULL — `box-31`, the
 *     lion's, 1.125 deep instead of 1.250 — which is the pack's own shallow body,
 *     unmodified, at the proportions Kenney gave it. That is adaptation, not a
 *     stretch, so there is no `stretchWhy` and there should not be one. Its front
 *     face is 0.500 and the eye card still sits at the absolute 0.6350, floating
 *     0.135 proud: exactly what the lion does, and `hulls.ts` says so.
 *
 *   - **The legs and the eyes are not mentioned, because they are given.** Four
 *     `box-01` sunk 0.408163 on the row that never moves at y = 0.18125 — the
 *     same row, because `box-31`'s bottom is `HULL_BOTTOM_Y` like every other
 *     hull's — and two `plate-01` on the pack's own eye plane. The eye's BASE is
 *     the one thing said about it: `accent`, the signed-off gold, because a great
 *     crested newt's iris is golden and the pale slot here is belly orange.
 *
 *   - **The tail is `wedge-07`, the cat's and the monkey's whip, and the reason
 *     is its THINNEST axis.** §7 splits the pack's seven tails on thickness, not
 *     length, and this one is the thinnest thing in the bank at **0.200** across
 *     against 1.047 tall — a laterally FLATTENED blade, which is what a newt
 *     sculls with. A fox's round 0.910 brush could never be this animal.
 *     Everything about its placement is the pack's own except one coordinate:
 *     sunk its measured 0.159043 mean over its two donors, joined at THIS hull's
 *     rear face z = -0.625, and carried at **y = 0.80625** — the hull's own
 *     recorded centre, not a number this file invented. The donor transfer would
 *     leave it at the cat's 1.186701, up on the rump; a newt's tail is the spine
 *     CONTINUING, so it leaves the body on the body's own axis.
 *
 *   - **The crest is `blade-03` — the DOG'S NOSE — stood on end, five times.**
 *     §3.1 is the whole of this: a part's identity is where you put it, not what
 *     Kenney called it. The shape is a 0.400 x 0.321 blade only 0.100 thick, and
 *     turned so that its thin axis is the animal's WIDTH it is a fin: 0.100
 *     across, 0.400 tall, 0.321 along the back. `STAND_ON_END` is the two quarter
 *     turns that do it (rule 4 as amended — baked into the copy's vertices), and
 *     `axis: 'x'` is the override that re-points its measured `z +1` attachment
 *     at the direction the fin now grows, which is straight up out of the back.
 *
 *   - **The crest TAPERS, and it tapers by DEPTH rather than by size.** A `row`
 *     is a straight line of identical copies, so `ridge:` can only give a uniform
 *     crest — and it could not give this one at all, since a ridge row takes its
 *     facing from the part's own attachment axis and has no override, which
 *     stands `blade-03` up as a flat plate lying on the back rather than as a
 *     fin. So the five blades are `extras`. They are the SAME shape at the same
 *     size — no stretch, nothing authored — and the profile comes from §3.1's
 *     other half, "depth is a dial, not a floor": sunk 8/16, 6/16, 5/16, 7/16
 *     and 9/16, they stand 0.200, 0.250, 0.275, 0.225 and 0.175 proud, which
 *     rises off the head, peaks over the hull's own centre and falls away toward
 *     the tail. Every one of them is buried at least 0.125 — the pack's own
 *     floor for an embedded part, and what stops any of them reading as loose.
 *
 *   - **Their stations are 3/16 apart on the pack's own grid**, five of them
 *     across the hull's own centre at z = 0.3125, 0.125, -0.0625, -0.25 and
 *     -0.4375 — a spacing well under the blade's own 0.321 length, so they
 *     overlap into ONE continuous fin with a wavy top edge rather than reading as
 *     five fence posts. The overlap costs nothing visually because every blade is
 *     the same shape in the same slot: two coplanar side faces there are the same
 *     colour and the same normal. `box-31`'s flat top reaches z = +/-0.375 of its
 *     centre and its y/z chamfer then falls 0.125 over 0.1875, so the outer
 *     blades' far corners sit ~0.09 and ~0.12 INSIDE the surface above them. §3,
 *     nothing floats — checked at the corners, not at the station.
 *
 *   - **The belly is PAINTED at 6/16**, §4's second way: no second shape, no
 *     split triangle, no geometry. Deliberately NOT the tiger's mammal 8/16 that
 *     the mouse and the squirrel use — that line puts a pale flank on an animal,
 *     and a great crested newt's orange is strictly an UNDERSIDE. 6/16 sits
 *     between the fox's own low chest patch (0.208) and the tiger's (0.548) and
 *     shows from the island's three-quarter camera as the strip `garden.ts` says
 *     it should be.
 *
 * **No flag.** Nothing was strained: 617 triangles against the pack's 422-951 and
 * 422 vertices against its 405-1626, height 1.7062 inside 1.43-2.02 with the
 * crest as its tallest point, keep-out 0.863 against the fox's own 1.15,
 * every shape lifted from the bank at the size Kenney drew it, and every sink
 * either the shape's own measured value or a station on the pack's 1/16 grid.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'
import type { Spin, Vec3 } from '../assembly'

/**
 * The two quarter turns that take the dog's nose off the dog's face and stand it
 * up as a fin: the blade's 0.400 span goes to +y, its 0.321 span to +z along the
 * back, and its 0.100 thickness to +x, which is the axis a crest has to be thin
 * on. The part's `z +1` attachment lands on +x under the same pair, which is why
 * the blades carry `axis: 'x'` — the facing is spun with the vertices.
 */
const STAND_ON_END: readonly Spin[] = [{ axis: 'z', deg: 90 }, { axis: 'y', deg: 90 }]

/** `box-31`'s own top face: its centre 0.80625 plus its half-height 0.625. */
const BACK_Y = 1.43125

/** One blade of the crest. Same shape, same size; only the station and the depth. */
const crest = (n: number, z: number, sink: number): {
  name: string; part: string; paint: string; axis: 'x'; spin: readonly Spin[]
  sink: number; at: Vec3
} => ({
  name: `crest-${n}`, part: 'blade-03', paint: 'detail',
  axis: 'x', spin: STAND_ON_END, sink, at: [0, BACK_Y, z],
})

export const NEWT_ASSEMBLY = defineCreature('animal-newt', {
  palette: {
    coat: 0x4b4636,    // signed-off coat: warty brown-black above
    belly: 0xe8992c,   // signed-off belly: the vivid orange underside
    detail: 0x35322a,  // signed-off detail: the legs and the crest, darker still
    accent: 0xe0b23f,  // signed-off accent: the golden iris
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },
  limb: 'detail',

  /* The lion's hull: 1.125 deep where the cube is 1.250. The pack's own shallow
   * body, unmodified — a different authored hull is adaptation, not a stretch. */
  hull: 'box-31',

  /* An UNDERSIDE, not a flank — below the tiger's mammal 8/16 on purpose. */
  belly: 0.375,

  /* No ears, said by omission: an amphibian has no external one, and the
   * salamander has none either, so this is not where the pair separates. */

  /* The bank's thinnest tail, 0.200 across — laterally flattened, which is what
   * a newt swims with. Carried on the hull's OWN centre line, because a newt's
   * tail is its spine continuing rather than an appendage on its rump. */
  tail: { part: 'wedge-07', at: [0, 0.80625, -0.625] },

  /* Golden, not orange: the pale slot on this animal is its belly. */
  eyes: { paint: 'accent' },

  /* THE ANIMAL: the dog's nose, stood on end five times down the spine, sunk
   * deeper toward the tail so the fin tapers without a stretch or a new shape. */
  extras: [
    crest(1, 0.3125, 0.5), crest(2, 0.125, 0.375), crest(3, -0.0625, 0.3125),
    crest(4, -0.25, 0.4375), crest(5, -0.4375, 0.5625),
  ],
})
