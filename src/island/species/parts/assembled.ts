/**
 * Species built by the assembly kit, as data. No three.js here — a collection
 * file imports this, and importing a species record must not drag a renderer in.
 *
 * ONE SPECIES AT A TIME (§6, Joe's delivery rule): "make the available one at a
 * time, so we can step in if its going wrong early on." Two are here, in the
 * order §6 sets: the hedgehog for repeat-and-sink, then the squirrel for the
 * lifted tail and the painted boundary. The remaining eleven Garden species are
 * variations on those two and are not started until these are ruled on.
 */
import type { AssemblyBuild } from './assembly'
import { PACK_PUPIL } from './texture'

/**
 * The hedgehog. Garden's first, because it is the only member that exercises
 * repeat-and-sink — the newest and least-proven mechanism in the whole method,
 * and Joe's own idea (§3.1).
 *
 * ## Revised 29 July against Joe's review of the first build
 *
 * Three notes, applied in one pass. His words:
 *
 *   1. 16:53 — *"nose higher, body cubic, its currently too wide. spikes 3 rows
 *      of 4 on each the top and the sides and turn them backwards 180 degrees."*
 *   2. 16:56, superseding the spike LAYOUT only — *"spikes not 3 rows of 4 on
 *      each side, but one row of 4, on each the top and the both sides (middle)
 *      and one set each rotated 45 deg and placed on the chamfer between sides
 *      and top, creating like a rounding effect. all else from previous comment
 *      sustained."*
 *   3. 16:57 — *"add a pink pointy element to the nose. small sphere will do"*
 *
 * ## Every number below, and where it came from
 *
 * The pack is the source of all of them. Nothing is eyeballed.
 *
 *   - **The hull is `box-03`, and it is now the authored cube.** No `stretch`.
 *     It shipped stretched to 1.350 x 1.150 x 1.250 and Joe's note is the whole
 *     argument against it: the shape 14 of the 24 share, changed. The stretch was
 *     defended at length in a comment, which is not where he reviews. The general
 *     fault behind it is fixed at source rather than here — `Hull.stretch` now
 *     requires a `stretchWhy` beside it, so the next species cannot depart from
 *     an authored proportion quietly. See `assembly.ts`.
 *
 *   - **The hull centre is y = 0.80625**, re-solved rather than nudged. The
 *     pack's leg (`box-01`) is 0.30625 tall and its measured `sunkFractionMax` is
 *     0.408163, so a leg joined at a hull bottom `B` has its foot at
 *     `B - 0.30625 x (1 - 0.408163)` = `B - 0.18125`. Feet on zero therefore
 *     wants `B = 0.18125`, and a 1.250 cube sitting on that has its centre at
 *     0.80625. That is **exactly where the pack itself puts `box-03`** — the
 *     bank's own recorded offset for the shape is `[0, 0.80625, 0]`. The legs
 *     then arrive at y = 0.153125, to six decimal places the pack's own leg
 *     offset, without that having been aimed at. The previous 0.7563 was the same
 *     solve run against the stretched 1.150 hull.
 *
 *   - **Twenty spikes, five rows of four.** Joe's second note. `cone-01`, sunk
 *     0.312222 — the part's own measured burial, the only value the pack ever
 *     gave it — which buries exactly 0.125 of it on every row and leaves 0.275
 *     standing. 0.125 is also §3's floor: "every eared species embeds its ear
 *     into the hull by at least 0.125".
 *
 *     The five rows are the three face middles and the two chamfers between
 *     them, so their facings are **0, +/-45 and +/-90 degrees around the body**
 *     — five equal 45-degree steps through a half turn. That is not arithmetic
 *     dressed up; it is why the chamfer rows do what Joe says they should. His
 *     stated intent is that the back read as CURVED rather than as three flat
 *     faces, and evenly stepping the facing is the thing that delivers it.
 *
 *       * top     x = 0,         y = 1.43125 (the cube's top face)
 *       * chamfer x = +/-0.46875, y = 1.27500 (the edge chamfer's midpoint)
 *       * side    x = +/-0.625,   y = 0.80625 (the side face, at its middle)
 *
 *     **`box-03`'s chamfer is measured, and it is not where it looks.** Its 32
 *     welded points are the 24 permutations of (+/-0.625, +/-0.3125, +/-0.3125)
 *     plus the 8 of (+/-0.5, +/-0.5, +/-0.5). So every edge AND every corner is
 *     cut (rule 2), each flat face is only 0.625 square, and the edge chamfer
 *     between the +x and +y faces is the quad from (0.625, 0.3125) to
 *     (0.3125, 0.625). Its midpoint is **(0.46875, 0.46875)** — not the
 *     (0.5625, 0.5625) you get by assuming a 1.000-wide face — and its outward
 *     normal is (0.7071, 0.7071, 0), which is precisely the facing a 45-degree
 *     spin produces.
 *
 *   - **Four to a row, and z = +/-0.375, +/-0.125 is the widest they can go.**
 *     Each flat face runs z in [-0.3125, +0.3125] and then falls away 1:1 along
 *     the edge chamfer. A spike joined at the nominal plane and buried 0.125 has
 *     its base 0.125 below that plane, so it stays embedded while its station
 *     satisfies |z| <= 0.3125 + 0.125 = 0.4375. **0.375 and 0.125 are the widest
 *     stations on the pack's own 1/16 grid inside that bound**, and §3's "nothing
 *     floats" is what sets the bound. Spacing is then 0.250 against the spike's
 *     own 0.329 depth, so neighbours overlap by a quarter and a row reads as one
 *     serrated ridge. The same four z stations on all five rows is what makes the
 *     twenty read as one shell rather than five separate rows.
 *
 *   - **Turned 180 degrees backwards** (`spin: [{ axis: 'y', deg: 180 }]`, first
 *     in every row's list). `cone-01` leans FORWARD: measured, its tip sits at
 *     z = +0.0628 and its base at z = -0.0086, and its mass runs from z = +0.164
 *     high to z = -0.164 low. A half turn about y sends that lean back over the
 *     rump, which is which way a hedgehog's spines go and what Joe asked for.
 *     The rotation is baked into the copy's vertices and normals — **no placed
 *     node carries it** — exactly as mirroring already was. Rule 4 has been
 *     amended to say so, because as written it forbade what he asked for.
 *
 *   - **The top row lands on the pack's own number.** Join at the cube's top
 *     y = 1.43125, plus 0.200178 - 0.125, puts the spike's centre at y = 1.506428
 *     — which is `cone-01`'s recorded offset in the bee, to six decimal places.
 *     The bee wears this shape on this cube at this depth. Nothing was aimed at
 *     that either; it is what "derive it, don't choose it" buys.
 *
 *   - **WHY `cone-01` AND NOT THE HOG'S EAR.** Unchanged, and still the §3.2
 *     acceptance test passing: `SPIKE_QUERY` returns the hog's ear and the hog's
 *     tusk without naming a species, and the measurements chose against both.
 *     `wedge-13` (tusk) has its LONGEST axis in z, so a row of them lies flat.
 *     `cone-04` (hog ear) is 62 triangles to `cone-01`'s 34 — at twenty copies
 *     that is 1,240 triangles against 680. `cone-01` tapers to a true point
 *     (taper 0.000 against the ear's 0.249), stands 0.400 tall, and is thin in x
 *     (0.160) and deep in z (0.329) so it reads as a quill from the side and
 *     disappears from the front. It is also the BEE's antenna and the
 *     caterpillar's: filed as an ear, used as a spine.
 *
 *   - **Eyes are `plate-01`, placed as a `pair`.** One mesh, mirrored (rule 6) —
 *     and the mirror IS `plate-02`, so the bank's two eye records collapse to
 *     one authored shape. z = 0.6350 and sink 0, the measured constants across
 *     all 48 eye cards in the pack. No `stretch`, ever: rule 5. Untouched by this
 *     revision except for the pupil colour, because the eyes are the face.
 *
 *   - **The nose is higher, and the height is the parrot's own.** The snout is
 *     `cone-06`, the parrot's beak, and **the parrot's hull is `box-03` at the
 *     same centre** — so the part arrives with a placement that transfers
 *     exactly. Measured off the file, the parrot joins its beak at
 *     (x 0, y 0.718036, z 0.625), where 0.625 is that same cube's front face.
 *     The snout was at y = 0.58; it is now at 0.718036, up 0.138. §8 gives the
 *     nose's z as 1.080 +/- 0.074 of the hull bbox and this sits at 1.032, inside
 *     it, unchanged. §8 gives no derivable y — so the y comes from the one donor
 *     that wears this exact part on this exact hull.
 *
 *   - **The nose tip is AUTHORED, and it is the first thing this method has ever
 *     authored.** Joe first asked for "a pink pointy element to the nose. small
 *     sphere will do", and the bank answered: `findShapes({ maxLongest: 0.22 })`
 *     — a size window, no name, no role, no form — returned ten shapes, of which
 *     `wedge-10` is the dog's and monkey's **nose-tip**, 0.120 x 0.108 x 0.164,
 *     taper 0.707, mirror-symmetric, attaching z +1 as a nose tip must, and the
 *     smallest solid nose-tip in the pack. It was even already the right pink:
 *     `#e792bd`, its own texels sampled off `colormap.png` and averaged by
 *     triangle area.
 *
 *     **Every measurement said yes and the thing reads as a tongue.** Joe, 18:08:
 *     *"all good but the pink tongue as the nose. create a bespoke sphere for
 *     that."* That is him overruling rule 1 for one part having seen the
 *     alternative, and it is the first deliberate use of §2's escape clause in
 *     the direction the clause exists for — a flagged shape becoming a
 *     commission. Searching the bank again would return `wedge-10` again, so it
 *     was not searched again.
 *
 *     So the tip is `bespoke-sphere-01`: a 0.125 sphere, 48 triangles over 26
 *     vertices, GENERATED in `authored.ts` rather than typed, and deliberately
 *     NOT in `PARTS_BANK` — nothing can find it by search and no other species
 *     can reach it by accident. The diameter is 2/16 on the pack's own authoring
 *     grid and sits just under the pack's own small nose-tip family (the bunny's
 *     and cat's 0.1368, the dog's and fox's 0.1505). The pink is unchanged and
 *     still measured, still a texture slot and never a material tint (rule 8).
 *
 *     It sits with its **centre on the snout's own apex** — `cone-06`'s
 *     front-most point, local (0, +0.1122, +0.1434), world (0, 0.830236,
 *     0.808311) — at `sink: 0.5`, which for a sphere is the one placement that
 *     needs no number: exactly half of it stands proud.
 *
 *     **The lesson is bigger than the hedgehog.** The search matched on SHAPE and
 *     returned a part whose IDENTITY was wrong, with size, taper, symmetry,
 *     attachment and even colour all correct at once. No measured axis separates
 *     a nose from a tongue, and adding one is not a measurement problem — see
 *     the note in `query.ts`.
 *
 *   - **The pupil is `PACK_PUPIL`, and it is the fault Joe caught.** It was
 *     `0x000000`, a number nobody measured. It is now `#4c4f5e`, the area-
 *     weighted mean of 544 real eye-card texels across all 24 species. The full
 *     working, and the answer to "did we paint it or carry it", is in
 *     `texture.ts` beside the constant — because it corrects every animal built
 *     by this method, not this one.
 *
 *   - **The rest of the palette is the four colours already on the hedgehog's
 *     record** in `collections/garden.ts` — "Buff face, dark spines" — plus the
 *     measured pupil and the measured nose pink. Nothing here is a new colour.
 *
 * Result: 1.707 tall, feet on zero, inside the pack's measured 1.43-2.02.
 */
export const HEDGEHOG_ASSEMBLY: AssemblyBuild = {
  kit: 'assembly',

  palette: {
    coat: 0xb2946c,   // buff face
    spine: 0x53412c,  // dark spines
    limb: 0x6b533a,   // legs and snout
    eye: 0xf4e6cc,    // the eye card's light region
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
    nose: 0xe792bd,   // the dog and monkey nose-tip's own pink, area-weighted
  },

  /* The authored 1.250 cube, unstretched. Joe: "body cubic". */
  hull: {
    part: 'box-03',
    at: [0, 0.80625, 0],
    paint: { base: 'coat' },
  },

  features: [
    /* Four legs, from one shape and one line: two along z, mirrored in x. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb' },
      sink: 0.408163,
      placement: {
        kind: 'row',
        from: [0.27, 0.18125, 0.25],
        to: [0.27, 0.18125, -0.25],
        count: 2,
        mirror: true,
      },
    },

    /* Repeat-and-sink, five rows of four. The mechanism this species exists to
     * prove, now carrying the chamfer idiom as well (spec §8). Every row is the
     * same shape, the same depth and the same four z stations; only the facing
     * differs, by 45 degrees a row. */
    {
      name: 'spike-top',
      part: 'cone-01',
      paint: { base: 'spine' },
      sink: 0.312222,
      spin: [{ axis: 'y', deg: 180 }],
      placement: {
        kind: 'row',
        from: [0, 1.43125, 0.375],
        to: [0, 1.43125, -0.375],
        count: 4,
      },
    },
    {
      name: 'spike-chamfer',
      part: 'cone-01',
      paint: { base: 'spine' },
      sink: 0.312222,
      spin: [{ axis: 'y', deg: 180 }, { axis: 'z', deg: -45 }],
      placement: {
        kind: 'row',
        from: [0.46875, 1.275, 0.375],
        to: [0.46875, 1.275, -0.375],
        count: 4,
        mirror: true,
      },
    },
    {
      name: 'spike-side',
      part: 'cone-01',
      paint: { base: 'spine' },
      sink: 0.312222,
      spin: [{ axis: 'y', deg: 180 }, { axis: 'z', deg: -90 }],
      placement: {
        kind: 'row',
        from: [0.625, 0.80625, 0.375],
        to: [0.625, 0.80625, -0.375],
        count: 4,
        mirror: true,
      },
    },

    /* The face. Absolute, unstretched, sitting ON the front plane. */
    {
      name: 'eye',
      part: 'plate-01',
      paint: { base: 'eye', byBand: { 15: 'pupil' } },
      sink: 0,
      placement: { kind: 'pair', at: [0.2625, 0.95, 0.635] },
    },

    {
      name: 'snout',
      part: 'cone-06',
      paint: { base: 'limb', byBand: { 15: 'spine' } },
      sink: 0.360878,
      placement: { kind: 'single', at: [0, 0.718036, 0.625] },
    },

    /* Joe's pink element, on the snout's own measured apex. AUTHORED — the one
     * piece of geometry in this method the pack did not give us, and it is here
     * because he looked at the lifted alternative and rejected it by name. See
     * `authored.ts`; the `flag` below says so where he reads. */
    {
      name: 'nose-tip',
      part: 'bespoke-sphere-01',
      paint: { base: 'nose' },
      sink: 0.5,
      placement: { kind: 'single', at: [0, 0.830236, 0.808311] },
    },
  ],

  flag: 'RULE 1 OVERRULED, BY JOE: the nose is AUTHORED geometry — a bespoke 0.125 '
    + 'sphere, the only shape in this method the pack did not give us. His words, '
    + '29 July: "all good but the pink tongue as the nose. create a bespoke sphere for '
    + 'that." The bank\'s own answer was wedge-10, the dog and monkey nose-tip, right '
    + 'size and measurably the right pink — and it reads as a TONGUE, which no '
    + 'measurement catches. See authored.ts. '
    + 'Spines are cone-01 — the bee and caterpillar antenna — not the hog ear. '
    + 'The query returns the hog ear and the hog tusk too; the measurements chose '
    + 'against both. cone-01 tapers to a true point, stands 0.400 tall and costs 34 '
    + 'triangles against the hog ear\'s 62. Joe\'s call to overturn. '
    + 'RULE 9 STRAINED: twenty spikes is 680 triangles, and the whole animal comes to '
    + '1,046 against the pack\'s measured 422-951. Rule 9\'s own budget is vertices and '
    + 'this is well inside it; no pack animal wears twenty protrusions, so the triangle '
    + 'envelope is the one Joe\'s count leaves.',
}

/**
 * The squirrel. Garden's second, and it carries the half of the risk the
 * hedgehog did not (§6): **a real lifted tail** and **a boundary painted into
 * the texture**. It is also the hardest version of "does it look like a guest",
 * because the animal it stands next to is `animal-fox` and the tail it wears is
 * the fox's own.
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
 * ## 2. Where the tail goes — §8's chamfer idiom, on a new edge
 *
 * A squirrel's tail is carried UP, and that is the single thing separating this
 * animal from the fox it borrows the shape from. The placement is the hedgehog's
 * chamfer idiom (§8) turned to the back of the same cube:
 *
 *   - `box-23`'s measured facing is **`z -1`**, so an unspun copy trails
 *     backwards, which is exactly how the fox wears it.
 *   - The edge chamfer between `box-03`'s **+y and -z** faces runs from
 *     (y 0.625, z -0.3125) to (y 0.3125, z -0.625). Midpoint
 *     **(0.46875, -0.46875)** off the hull centre — the same 0.46875 the
 *     hedgehog's rows sit on, because it is the same cube — and its outward
 *     normal is (0, 0.7071, -0.7071).
 *   - `spin: [{ axis: 'x', deg: 45 }]` takes `z -1` to exactly that normal. So
 *     the tail leaves the rump at 45 degrees, up and back, and `sink` still
 *     measures along the way it actually points.
 *   - **Sunk 0.177404 — the fox's own measured burial, the only number the pack
 *     ever gave this shape.** That is 0.1615 of it inside the hull, comfortably
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
 * §4 gives two ways to two-tone and this is the second, which nothing had used:
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
 * can ask for lands on one of Kenney's own lines.
 *
 * ## 4. Everything else is a donor's own placement, transferred
 *
 * Every one of these lands on a number the pack already had, which is the only
 * reason to trust them:
 *
 *   - **Hull `box-03` at [0, 0.80625, 0]**, unstretched. No `stretchWhy`,
 *     because there is nothing to say: Joe's "body cubic" is the whole ruling
 *     and a squirrel is not an exception to it. The centre is the hedgehog's
 *     solve — leg 0.30625 tall, sunk 0.408163, feet on zero — and it is also
 *     `box-03`'s own recorded offset, which is the BEAVER's hull centre, because
 *     the beaver is this shape's first donor. That matters below.
 *
 *   - **The snout is `tube-01`, the beaver's, and the beaver is the pack's
 *     rodent.** A squirrel and a beaver are both Rodentia and the pack has
 *     exactly one of them; its muzzle is a rounded barrel, taper 1.000, that
 *     does not narrow — which is a squirrel's blunt face and the opposite of the
 *     hedgehog's pointed `cone-06`. It attaches `z +1` with a measured sink of
 *     **0.000**, so joined at the cube's front face z = 0.625 its centre lands at
 *     z = 0.710803: the beaver's own recorded offset, to six decimals. And
 *     because `box-03`'s recorded offset IS the beaver's hull centre, the height
 *     y = 0.815078 transfers with certainty rather than by argument.
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
 *   - **Eyes are `plate-01`, at the card's own recorded offset.** x 0.2625,
 *     **y 0.933646**, z 0.6350, sink 0. The hedgehog chose 0.95 for the height;
 *     this does not choose, because the bank records the eye card at one point
 *     across the sixteen species that donate it and that point is on this cube.
 *     No `stretch`, ever (rule 5). Pupil `PACK_PUPIL`, per `texture.ts`.
 *
 *   - **Four legs, `box-01`**, the hedgehog's line exactly: two along z,
 *     mirrored in x, sunk 0.408163 into the belly.
 *
 * ## 5. The palette is the record's own, and no colour is new
 *
 * `garden.ts` already carries this species' signed-off four — coat 0xc4692f,
 * belly 0xfbf1e2, detail 0x9c4a1e, accent 0x6e3413 — and every slot below is one
 * of them, plus the measured pupil. `belly` does three jobs: the painted patch,
 * the eye card's light region and the cat ear's inner. Nothing here is invented.
 *
 * Result: **1.976 tall, 1.250 wide, feet on zero**; 460 verts (332 outside the
 * legs) and 597 triangles, inside every one of rule 9's measured bands.
 */
export const SQUIRREL_ASSEMBLY: AssemblyBuild = {
  kit: 'assembly',

  palette: {
    coat: 0xc4692f,    // signed-off coat: ginger
    belly: 0xfbf1e2,   // signed-off belly: the painted patch, the sclera, the inner ear
    limb: 0x9c4a1e,    // signed-off detail: legs and muzzle
    tuft: 0x6e3413,    // signed-off accent: the ear tufts
    pupil: PACK_PUPIL, // measured off 544 real eye texels; see texture.ts
  },

  /* The authored 1.250 cube, unstretched (Joe: "body cubic"), wearing §4's
   * second kind of two-tone: the belly boundary is drawn INTO the coat's cell at
   * half the hull's height and no triangle is cut to make it. */
  hull: {
    part: 'box-03',
    at: [0, 0.80625, 0],
    paint: { base: 'coat', patch: { below: 'belly', at: 0.5 } },
  },

  features: [
    /* Four legs, from one shape and one line: two along z, mirrored in x. */
    {
      name: 'leg',
      part: 'box-01',
      paint: { base: 'limb' },
      sink: 0.408163,
      placement: {
        kind: 'row',
        from: [0.27, 0.18125, 0.25],
        to: [0.27, 0.18125, -0.25],
        count: 2,
        mirror: true,
      },
    },

    /* THE ANIMAL. The fox's brush, carried up the rear chamfer at 45 degrees
     * instead of trailing — which is the whole difference between a squirrel and
     * the fox it stands next to. */
    {
      name: 'tail',
      part: 'box-23',
      paint: { base: 'coat' },
      sink: 0.177404,
      spin: [{ axis: 'x', deg: 45 }],
      placement: { kind: 'single', at: [0, 1.275, -0.46875] },
    },

    /* The cat's ear on the cat's own numbers, with the cat's own inner ear. */
    {
      name: 'ear',
      part: 'wedge-06',
      paint: { base: 'coat', byBand: { 1: 'belly' } },
      sink: 0.573575,
      placement: { kind: 'pair', at: [0.336, 1.43125, 0.320549] },
    },

    /* Ear tufts: the hedgehog's spike, on the ear's own apex. §3.1. */
    {
      name: 'tuft',
      part: 'cone-01',
      paint: { base: 'tuft' },
      sink: 0.312222,
      placement: { kind: 'pair', at: [0.336, 1.585699, 0.320549] },
    },

    /* The face. Absolute, unstretched, sitting ON the front plane. */
    {
      name: 'eye',
      part: 'plate-01',
      paint: { base: 'belly', byBand: { 15: 'pupil' } },
      sink: 0,
      placement: { kind: 'pair', at: [0.2625, 0.933646, 0.635] },
    },

    {
      name: 'snout',
      part: 'tube-01',
      paint: { base: 'limb' },
      sink: 0,
      placement: { kind: 'single', at: [0, 0.815078, 0.625] },
    },
  ],

  flag: 'The raised tail makes this the TALLEST animal here: 1.98 against the pack\'s '
    + '1.43-2.02, and width/height 0.63 against the pack\'s mean 0.97. Every number in '
    + 'the tail is the pack\'s own — the fox\'s brush, the cube\'s own 45-degree rear '
    + 'chamfer, the fox\'s own burial depth — so nothing is tuned; the height is what '
    + 'those numbers give. Burying it deeper than the fox did would bring it to 1.79 and '
    + 'stockier, at the cost of the plume standing clear of the back. Joe\'s call. '
    + 'Front-to-back it is SHORTER than the fox (0.92 keep-out against 1.15), because '
    + 'the tail goes up where the fox\'s goes back.',
}

/** Every species the assembly kit can build, by species id. */
export const ASSEMBLED_BUILDS: Readonly<Record<string, AssemblyBuild>> = {
  'animal-hedgehog': HEDGEHOG_ASSEMBLY,
  'animal-squirrel': SQUIRREL_ASSEMBLY,
}
