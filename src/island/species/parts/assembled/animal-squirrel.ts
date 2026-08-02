/**
 * The squirrel's assembly, as a DEFINITION. Garden's second animal built the new
 * way, and the second converted to the declarative builder.
 *
 * ONE SPECIES, ONE FILE. No three.js is reachable from a collection through this
 * file beyond the palette constant, and — the reason for the split — every
 * measured number in the record below carries the reasoning that produced it. A
 * comment lost in a merge is a reason lost with no trace that it was ever there,
 * so no two species share a file. Adding a species is a new file beside this one
 * and one line in `index.ts`; `register.ts` says why that one line is enough.
 *
 * ## Converted to `defineCreature`, 29 July — and it is the same animal
 *
 * This was 80 lines of hand-typed `AssemblyBuild` and it is now nine lines of
 * definition. **The built geometry is byte-identical**: same meshes, same
 * vertices, same normals, same UVs, same indices, same node translations, same
 * fingerprint — pinned in `tests/island/assembly-fingerprint.test.ts`. The one
 * difference is that the tuft is now the LAST node in the group rather than the
 * fourth, because the builder emits its roles in a fixed order and `extras` come
 * last. Nothing anybody can see moved.
 *
 * **What the builder now supplies, that used to be typed here:** the hull, the
 * four legs, the eye pair entire (part, x, y, z, sink, sclera and pupil), the
 * snout's join point, the ear's join point, the rear chamfer's midpoint and the
 * 45-degree turn onto its normal, and every default sink — each of which was a
 * measured number this file used to carry a copy of. The derivations stay,
 * because they are the evidence the numbers are the pack's and not ours.
 *
 * This species carries the half of the risk the hedgehog did not (§6): **a real
 * lifted tail** and **a boundary painted into the texture**. It is also the
 * hardest version of "does it look like a guest", because the animal it stands
 * next to is `animal-fox` and the tail it wears is the fox's own.
 *
 * ## 1. The tail, found by measurement
 *
 * `BRUSH_QUERY` in `query.ts` — *big, thick, joined to the back* — names no
 * species, no role and no form and returns **three** shapes out of 129, all of
 * them tails:
 *
 *   | shape | size | thinnest | taper | tris | donor |
 *   |---|---|---|---|---|---|
 *   | `box-23`  | 0.744 x 0.910 x 0.910 | 0.744 | 0.961 | 92 | fox |
 *   | `box-38`  | 0.626 x 0.912 x 0.642 | 0.626 | 0.839 | 48 | parrot |
 *   | `wedge-03`| 0.726 x 0.862 x 0.589 | 0.589 | 0.577 | 92 | beaver |
 *
 * The measurements then choose `box-23`, on three counts and no names:
 *
 *   - **It barely tapers** — 0.961, against the parrot's 0.839 and the beaver's
 *     0.577. A plume holds its bulk to the tip; a fan and a paddle narrow.
 *   - **Its section is ROUND**: y and z are 0.910248 and 0.910248, identical to
 *     six decimals. The other two are 1.42 and 1.47 to one. A squirrel's tail is
 *     a cylinder of fur, not a blade.
 *   - **It is 1.67x the volume of either other candidate** (0.616 against 0.367
 *     and 0.368), and the brief for this animal is that the tail carries it.
 *
 * **`minThinnest` is a new query axis and it is why the query works at all.**
 * On `longest` the fox's brush (0.910) sits between the parrot's fan (0.912) and
 * the tiger's whip (1.047); on `taper` the brush and the fan are 0.12 apart. The
 * seven tails only separate on absolute thickness, where they fall into 0.20 -
 * 0.28 (cat, lion, tiger) and 0.59 - 0.74 (beaver, parrot, fox) with a 2.1x gap
 * and nothing in it. Asking for a big tail without asking for a thick one
 * returns a whip, which is a cat. See `query.ts` for why this is the SIZE axis
 * §3.2 kept and not the `aspect` axis it deleted.
 *
 * ## 2. Where the tail goes — §8's chamfer idiom, on a new edge, in one word
 *
 * A squirrel's tail is carried UP, and that is the single thing separating this
 * animal from the fox it borrows the shape from. The placement is the hedgehog's
 * chamfer idiom (§8) turned to the back of the same cube, and it is now
 * `chamfer: true`, which solves the point and the turn together:
 *
 *   - `box-23`'s measured facing is **`z -1`**, so an unspun copy trails
 *     backwards, which is exactly how the fox wears it.
 *   - The edge chamfer between `box-03`'s **+y and -z** faces runs from
 *     (y 0.625, z -0.3125) to (y 0.3125, z -0.625). Midpoint
 *     **(0.46875, -0.46875)** off the hull centre — the same 0.46875 the
 *     hedgehog's rows sit on, because it is the same cube — and its outward
 *     normal is (0, 0.7071, -0.7071). The builder measures both off the hull's
 *     own vertices rather than assuming a 1.000-wide face, which is the mistake
 *     §8 says costs a whole row.
 *   - `{ axis: 'x', deg: 45 }` takes `z -1` to exactly that normal, and
 *     `chamfer: true` is what emits it. **Giving the point without the turn is
 *     how a tail floats**, so the builder refuses `chamfer` beside a hand-written
 *     `spin` or `at` rather than letting the two disagree.
 *   - **Sunk 0.177404 — the fox's own measured burial, the only number the pack
 *     ever gave this shape** — and it is now the builder's default for it, not a
 *     number this file carries. That is 0.1615 of it inside the hull, comfortably
 *     past §3's "nothing floats" floor of 0.125.
 *
 * Nothing there is chosen. The result stands 1.976 tall with its plume topping
 * out 0.39 above the ears, and it is 0.92 in keep-out radius against **the
 * fox's own 1.15** — the squirrel is a fifth SHORTER front-to-back than the
 * animal it sits beside, because its tail goes up where the fox's goes back.
 * `pets.ts:652` charges keep-out from `max(width, depth) / 2`, so that is the
 * number that matters and it is the one carrying the animal's whole silhouette.
 *
 * ## 3. The belly boundary is PAINTED, and the line is the pack's own
 *
 * §4 gives two ways to two-tone and this is the second, which nothing had used.
 * It is now the single word `belly: 0.5`, which the builder turns into
 * `paint: { base: 'coat', patch: { below: 'belly', at: 0.5 } }` on the HULL.
 * No second shape, no split triangle, no geometry at all. `texture.ts` draws the
 * `coat` cell as two colours and the hull's vertices read across that cell by
 * their own height, so the boundary is the plane y = half the hull, dead level
 * across every face and every chamfer.
 *
 * **0.5 is measured, not picked.** Three of the pack's ten hulls carry a pale
 * underside and the tiger's is the mammal case — a belly running the length of
 * the body, which is the squirrel's case too. On `box-41` the pale band 3 tops
 * out at local y +0.0625 and the dark band 15 bottoms at -0.025, on a hull
 * 1.300 tall: fractions **0.4808 and 0.5481**. Kenney's boundary is therefore
 * not a line but a 0.067-wide ZONE, because a split-triangle boundary can only
 * follow edges the model already has. **The one point on the pack's 1/16 grid
 * inside that zone is 8/16**, and 8/16 is also the hull's own equator. So the
 * squirrel's belly line is the tiger's, made exact.
 *
 * That is the whole argument for painting rather than splitting, in one
 * measurement: same boundary, no wander, no triangles. `SLOT_PX` is 16 for the
 * same reason — the pack is authored on a 1/16 grid, so every boundary a builder
 * can ask for lands on one of Kenney's own lines, and `defineCreature` throws on
 * a `belly` that falls between two.
 *
 * ## 4. Everything else is a donor's own placement, transferred
 *
 * Every one of these lands on a number the pack already had, which is the only
 * reason to trust them — and every one is now the BUILDER's donor transfer (§8)
 * rather than a number typed into this file:
 *
 *   - **Hull `box-03` at [0, 0.80625, 0]**, unstretched, and not mentioned at
 *     all below because it is the default. No `stretchWhy`, because there is
 *     nothing to say: Joe's "body cubic" is the whole ruling and a squirrel is
 *     not an exception to it. The centre is the hedgehog's solve — leg 0.30625
 *     tall, sunk 0.408163, feet on zero — and it is also `box-03`'s own recorded
 *     offset, which is the BEAVER's hull centre, because the beaver is this
 *     shape's first donor. That matters below.
 *
 *   - **The snout is `tube-01`, the beaver's, and the beaver is the pack's
 *     rodent.** A squirrel and a beaver are both Rodentia and the pack has
 *     exactly one of them; its muzzle is a rounded barrel, taper 1.000, that
 *     does not narrow — which is a squirrel's blunt face and the opposite of the
 *     hedgehog's pointed `cone-06`. It attaches `z +1` with a measured sink of
 *     **0.000**, so joined at the cube's front face z = 0.625 its centre lands at
 *     z = 0.710803: the beaver's own recorded offset, to six decimals. And
 *     because `box-03`'s recorded offset IS the beaver's hull centre, the height
 *     y = 0.815078 transfers with certainty rather than by argument. All of that
 *     is what `snout: 'tube-01'` now means.
 *
 *   - **The ears are `wedge-06`, the cat's, and the arithmetic proves the
 *     transfer.** The cat is the only donor of this shape, so its recorded
 *     offset (0.336, 1.404599, 0.320549) is unambiguous, and its measured sink
 *     is 0.573575. Joining at the cube's TOP FACE, y = 1.43125, puts the ear's
 *     centre at **1.404599** — recovered to one part in a million, which is the
 *     evidence that the cat wears this ear on this cube at this height. It is
 *     mirror-symmetric, so it is one mesh placed twice (rule 6), and its own
 *     band 1 is a five-triangle patch on its front face: the cat's INNER EAR,
 *     which is painted `belly` for free. That is §4's FIRST way to two-tone, on
 *     the same animal as the second, which is the honest way to show the
 *     difference between them.
 *
 *   - **The tufts are `cone-01` — the hedgehog's spike, doing a third job.**
 *     `garden.ts` says this species is "the only `tufted` ear" in the collection
 *     and that the tufts "are the whole read". §3.1 is that a part's identity is
 *     its placement, not Kenney's label: this shape is filed as the bee's
 *     antenna, was used as twenty hedgehog spines, and one copy on each ear tip
 *     is an ear tuft. Joined at the ear's own apex — `wedge-06`'s local top,
 *     y = 1.404599 + 0.181100 = **1.585699** — and sunk 0.312222, the shape's
 *     own measured burial, the same number the hedgehog uses. They cost nothing
 *     in height: at 1.861 they stand 0.115 BELOW the tail.
 *
 *     **The `at` is written out and the builder's `on: 'ear'` is not used, on
 *     purpose.** `on` would put the tuft on the ear's real apex, at 1.5857011 —
 *     2e-6 lower, because the builder solves the ear's centre from the join
 *     rather than reading the bank's six-decimal rounding of it. That is arguably
 *     the more correct number and it is not worth spending the proof that this
 *     conversion changed nothing. New species use `on`; this one keeps its
 *     history.
 *
 *   - **Eyes are `plate-01`, at the card's own recorded offset**, and the
 *     definition below does not mention them at all, because that IS the
 *     builder's default: x 0.2625, **y 0.933646**, z 0.6350, sink 0, sclera from
 *     the pale slot, pupil `PACK_PUPIL`. The hedgehog chose 0.95 for the height
 *     and had to say so; this does not choose, because the bank records the eye
 *     card at one point across the sixteen species that donate it and that point
 *     is on this cube. No `stretch`, ever — rule 5 is now unsayable rather than
 *     merely unsaid.
 *
 *   - **Four legs, `box-01`**, also unmentioned: the hedgehog's line exactly, two
 *     along z, mirrored in x, sunk 0.408163 into the belly, on the row at
 *     y = 0.18125 that never moves.
 *
 * ## 5. The palette is the record's own, and no colour is new
 *
 * `garden.ts` already carries this species' signed-off four — coat 0xc4692f,
 * belly 0xfbf1e2, detail 0x9c4a1e, accent 0x6e3413 — and every slot below is one
 * of them, plus the measured pupil. `belly` does three jobs: the painted patch,
 * the eye card's light region and the cat ear's inner. Nothing here is invented.
 *
 * Result: **1.976 tall, 1.250 wide, feet on zero**; 452 verts and 597 triangles,
 * inside every one of rule 9's measured bands.
 */
import { defineCreature } from '../creature'
import { PACK_PUPIL } from '../texture'

export const SQUIRREL_ASSEMBLY = defineCreature('animal-squirrel', {
  palette: {
    coat: 0xc4692f,
    belly: 0xfbf1e2,
    limb: 0x9c4a1e,
    tuft: 0x6e3413,
    pupil: PACK_PUPIL,  // the pack's own measured pupil; see texture.ts
  },

  belly: 0.5,
  legs: { x: 0.2625, y: 0.1875, z: 0.25 },
  ears: { part: 'wedge-06', paint: { base: 'coat', byBand: { 1: 'belly' } } },
  tail: { part: 'box-23', spin: [{ axis: 'x', deg: 45 }], at: [0, 0.55, -0.4875] },
  snout: 'tube-01',
  extras: [
    {
      name: 'tuft',
      part: 'cone-01',
      paint: 'tuft',
      kind: 'pair',
      at: [0.3375, 1.45, 0.325],
    },
  ],
  flag: 'The raised tail makes this the TALLEST animal here: 1.98 against the pack\'s '
    + '1.43-2.02, and width/height 0.63 against the pack\'s mean 0.97. Every number in '
    + 'the tail is the pack\'s own — the fox\'s brush, the cube\'s own 45-degree rear '
    + 'chamfer, the fox\'s own burial depth — so nothing is tuned; the height is what '
    + 'those numbers give. Burying it deeper than the fox did would bring it to 1.79 '
    + 'and stockier, at the cost of the plume standing clear of the back. Joe\'s call. '
    + 'Front-to-back it is SHORTER than the fox (0.92 keep-out against 1.15), because '
    + 'the tail goes up where the fox\'s goes back.',
})
