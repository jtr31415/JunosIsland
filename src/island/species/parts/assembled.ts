/**
 * Species built by the assembly kit, as data. No three.js here — a collection
 * file imports this, and importing a species record must not drag a renderer in.
 *
 * ONE SPECIES AT A TIME (§6, Joe's delivery rule): "make the available one at a
 * time, so we can step in if its going wrong early on." The hedgehog is here
 * alone on purpose, and the squirrel is the next one, not a batch of thirteen.
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
 *   - **The pink pointy tip is `wedge-10`, and the bank had it.** Joe: "add a
 *     pink pointy element to the nose. small sphere will do." Rule 1 is
 *     adapt-before-author and "a small sphere will do" is permission to keep it
 *     simple, not an instruction to author geometry. `findShapes({ maxLongest:
 *     0.22 })` — a size window, no name, no role, no form — returns ten shapes,
 *     of which `wedge-10` is the dog's and monkey's **nose-tip**: 0.120 x 0.108 x
 *     0.164, taper 0.707, mirror-symmetric so one copy is whole, attaching z +1
 *     as a nose tip must. It is the smallest solid nose-tip in the pack.
 *
 *     And it is **already pink**. Its texels, sampled off `colormap.png` through
 *     its own UVs and averaged by triangle area, are `#e792bd` — the same pink as
 *     the bunny's nose-tip at `#e68fb8`. So the colour is measured off the pack
 *     too, not chosen, and rule 8 is satisfied by a texture lookup rather than a
 *     material tint. Nothing is authored and the escape clause is not needed.
 *
 *     It joins at the snout's own apex — `cone-06`'s front-most point, measured
 *     at local (0, +0.1122, +0.1434), which puts it at world (0, 0.830236,
 *     0.808311) — sunk 0.267146, `wedge-10`'s own measured mean burial.
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

    /* Joe's pink pointy element, on the snout's own measured apex. */
    {
      name: 'nose-tip',
      part: 'wedge-10',
      paint: { base: 'nose' },
      sink: 0.267146,
      placement: { kind: 'single', at: [0, 0.830236, 0.808311] },
    },
  ],

  flag: 'Spines are cone-01 — the bee and caterpillar antenna — not the hog ear. '
    + 'The query returns the hog ear and the hog tusk too; the measurements chose '
    + 'against both. cone-01 tapers to a true point, stands 0.400 tall and costs 34 '
    + 'triangles against the hog ear\'s 62. Joe\'s call to overturn. '
    + 'RULE 9 STRAINED: twenty spikes is 680 triangles, and the whole animal comes to '
    + '1,044 against the pack\'s measured 422-951. Rule 9\'s own budget is vertices and '
    + 'this is well inside it (636 body verts against 236-1114); no pack animal wears '
    + 'twenty protrusions, so the triangle envelope is the one Joe\'s count leaves.',
}

/** Every species the assembly kit can build, by species id. */
export const ASSEMBLED_BUILDS: Readonly<Record<string, AssemblyBuild>> = {
  'animal-hedgehog': HEDGEHOG_ASSEMBLY,
}
