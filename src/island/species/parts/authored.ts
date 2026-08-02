/**
 * Geometry WE authored. Nothing gets in here without Joe's word.
 *
 * ## Why this file exists at all
 *
 * `docs/building-animals-from-parts.md` §1 is Joe's, and it is the whole method:
 *
 * > we then use those parts to build new animals as far as we can, either by new
 * > assembly or by adjusting a copy of a primitive. **we should not create our
 * > own primitives. they won't look right.**
 *
 * So authoring is not a tool a builder reaches for. Rule 1 is adapt-before-
 * author and §5 says in as many words "we do not invent the missing parts". The
 * escape clause covers a species that cannot be built under the rules: best
 * attempt, FLAGGED, with the rule it strained named — and the flag is what tells
 * Joe a bespoke part is worth commissioning.
 *
 * **This file is what happens after he commissions one.** Joe, 29 July, on the
 * hedgehog's nose:
 *
 * > all good but the pink tongue as the nose. create a bespoke sphere for that
 *
 * That is him overruling rule 1 for one part, having seen the alternative. The
 * bank search had already been run and it returned `wedge-10`, filed as the
 * dog's and monkey's **nose-tip**, the smallest solid nose-tip in the pack, the
 * right size and measurably the right pink. Every measurement said yes and the
 * thing reads as a TONGUE. Searching again would return it again.
 *
 * ## The three rules this file lives under
 *
 *   1. **Authored shapes are NOT in `PARTS_BANK` and never will be.** They are
 *      not searchable and `findShapes` cannot return one, so no future builder
 *      can "adapt before authoring" its way into geometry Kenney never drew. The
 *      generated bank stays exactly what §6 says it is — a thing produced from
 *      the `.glb` files and never hand-edited.
 *   2. **The id says so.** Every one is `bespoke-*`. It shows up in the mesh's
 *      `userData.part`, in the anatomy view and in any trace, and it cannot be
 *      mistaken for a lifted shape by anything that reads a string.
 *   3. **The species that wears one carries a `flag` naming it.** §2's escape
 *      clause is only worth something if Joe sees it where he reviews, not in a
 *      comment. `HEDGEHOG_ASSEMBLY.flag` names this part, the rule it strains
 *      and the fact that he sanctioned it.
 *
 * ## What is honest about the record below and what is not
 *
 * A `BakedPart`'s `shape` block is measured off its own vertices, and that is
 * still true here — the numbers are computed from the generated positions rather
 * than typed. Two fields cannot be honest and are marked as such:
 *
 *   - **`provenance` is empty.** There is no donor. That empty array is the
 *     signal, and it is checkable: `provenance.length === 0` is exactly the set
 *     of shapes the pack did not give us.
 *   - **`attachment` is a DECLARATION, not a measurement.** The pack never
 *     joined this shape to anything, so `sunkFraction*` says what we chose. On
 *     every bank record those numbers are evidence; on this one they are intent.
 */
import type { BakedPart, PartShape } from './bank.generated'

/**
 * A low-poly UV sphere, origin-centred, smooth-shaded.
 *
 * Written as a generator rather than a list of numbers so the geometry is
 * derived and re-derivable, and so the poly count is a decision with a reason
 * beside it rather than whatever a modelling tool emitted.
 *
 * - **Smooth-shaded on exact normals** (rule 7). A sphere's normal at a point IS
 *   that point over the radius, so these are analytic rather than averaged, and
 *   there is no hard edge anywhere on it to split a corner for.
 * - **No UV seam split.** §4 is that we own the UVs, so the ring that would
 *   normally be duplicated to carry a wrap-around u is not duplicated here. That
 *   is `segments * rings` vertices saved for nothing given up.
 * - **Rule 2, "every edge has at least one chamfer cut", is satisfied
 *   vacuously**: a sphere has no edges. It is the one shape in this method that
 *   cannot fail that rule.
 */
export function sphere(radius: number, segments: number, rings: number): {
  positions: number[]; normals: number[]; indices: number[]
} {
  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  /* Poles first, then `rings - 1` latitude circles between them. A pole is ONE
   * vertex, not a ring of coincident ones. */
  positions.push(0, radius, 0)
  normals.push(0, 1, 0)
  for (let j = 1; j < rings; j++) {
    const phi = (j * Math.PI) / rings
    const s = Math.sin(phi), c = Math.cos(phi)
    for (let i = 0; i < segments; i++) {
      const th = (i * 2 * Math.PI) / segments
      const n: [number, number, number] = [s * Math.sin(th), c, s * Math.cos(th)]
      normals.push(n[0], n[1], n[2])
      positions.push(n[0] * radius, n[1] * radius, n[2] * radius)
    }
  }
  positions.push(0, -radius, 0)
  normals.push(0, -1, 0)

  const south = 1 + (rings - 1) * segments
  const ring = (j: number, i: number): number => 1 + (j - 1) * segments + (i % segments)

  for (let i = 0; i < segments; i++) indices.push(0, ring(1, i + 1), ring(1, i))
  for (let j = 1; j < rings - 1; j++) {
    for (let i = 0; i < segments; i++) {
      const a = ring(j, i), b = ring(j, i + 1), c = ring(j + 1, i), d = ring(j + 1, i + 1)
      indices.push(a, b, c, b, d, c)
    }
  }
  for (let i = 0; i < segments; i++) indices.push(south, ring(rings - 1, i), ring(rings - 1, i + 1))

  return { positions, normals, indices }
}

/** The `shape` block, measured off the geometry rather than asserted about it. */
function measure(
  positions: readonly number[],
  form: PartShape['form'],
  taper: number,
  symmetry: PartShape['symmetry'],
): PartShape {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      const v = positions[i + c]!
      if (v < lo[c]!) lo[c] = v
      if (v > hi[c]!) hi[c] = v
    }
  }
  const size = [0, 1, 2].map(c => hi[c]! - lo[c]!) as [number, number, number]
  const longest = Math.max(...size)
  const sorted = [...size].sort((a, b) => b - a)
  return {
    form,
    aspect: [1, sorted[1]! / sorted[0]!, sorted[2]! / sorted[0]!] as const,
    taper,
    symmetry,
    size,
    longest,
  }
}

/**
 * The hedgehog's nose. Joe: *"create a bespoke sphere for that"*.
 *
 * **Diameter 0.125.** Not eyeballed and not tuned: 0.125 is 2/16 on the pack's
 * own authoring grid, and it sits just under the pack's own small nose-tip
 * family — the bunny's, cat's and polar bear's `box-09`/`box-10` measure 0.1368
 * tall and the dog's, deer's and fox's `box-14`/`box-15`/`box-22` measure
 * 0.1505. A hedgehog's whole snout is 0.40 wide, so the smallest end of that
 * family is where a hedgehog's nose belongs.
 *
 * **48 triangles over 26 vertices** — 8 segments by 4 rings. Rule 9's budget is
 * vertices and 26 is one more than a lifted eye card costs. It is also within
 * two triangles of the `wedge-10` it replaces (46), so the hedgehog's triangle
 * count moves by 2 and the record of its being over §7's envelope is unchanged.
 */
const NOSE = sphere(0.0625, 8, 4)

/**
 * The sphere's own `shape` arguments, which are its and not the measurer's.
 *
 * - **`form: 'tube'`.** The generated bank's `form` union has no `sphere` in it
 *   and this file does not get to add one — `bank.generated.ts` is generated.
 *   `tube` is the nearest member (a solid of revolution) and §7 is explicit that
 *   `form` is a LABEL that no query ever filters on, so nothing turns on it.
 * - **`taper: 0`.** Both ends of a sphere are points, so the cross-section at
 *   the narrow end over the wide end is zero, the same as `cone-06`'s.
 */
const NOSE_SHAPE = measure(NOSE.positions, 'tube', 0, 'radial')

export const BESPOKE_SPHERE: BakedPart = {
  id: 'bespoke-sphere-01',
  shape: NOSE_SHAPE,
  /* DECLARED, not measured. The pack never joined this shape to anything, so
   * these three numbers are our intent: it points forward, and it is placed by
   * its centre, which for a sphere is the only placement that needs no number. */
  attachment: {
    axis: 'z', dir: 1, n: 0,
    sunkUnitsMin: 0.0625, sunkUnitsMean: 0.0625, sunkUnitsMax: 0.0625,
    sunkFractionMin: 0.5, sunkFractionMean: 0.5, sunkFractionMax: 0.5,
  },
  roles: ['nose'],
  /* EMPTY, and that is the point: `provenance.length === 0` is exactly the set
   * of shapes the pack did not give us, and it is checkable rather than stated. */
  provenance: [],
  positions: NOSE.positions,
  normals: NOSE.normals,
  indices: NOSE.indices,
  triVariants: [NOSE.indices.length / 3],
  bands: new Array<number>(NOSE.indices.length / 3).fill(0),
  size: NOSE_SHAPE.size,
  tris: NOSE.indices.length / 3,
  verts: NOSE.positions.length / 3,
  offset: [0, 0, 0],
}

/* =======================================================================
 * THE THREE BASE SHAPES — triangle, circle, square
 * ======================================================================= */

/**
 * Joe, 2 August:
 *
 * > please also add some base shapes: triangle, circle, square, all with same
 * > chamfer in the game and ability for me to resize.
 *
 * ## This reverses §1, and the boundary is the whole of the ruling
 *
 * §1 is his own — *"we should not create our own primitives. they won't look
 * right."* He has now asked for exactly three and ruled the scope himself
 * (`JT-041`): **PRIMITIVES ONLY.** A triangle, a circle and a square. Not a fin,
 * flipper, fluke, membranous wing, segmented leg, frill, plate, spine, hooked
 * beak, talon, spread wing, hoof, trunk, shell or long neck, however obviously
 * §5's 64 "impossible" species want one. If a later builder finds itself
 * reaching for one of those from this file, that is a different ruling and Joe
 * has not given it.
 *
 * They are parts in a 3D game, so they are read as PRISMS: a square prism (a
 * cube), a triangular prism, and a circular prism (a cylinder). "Same chamfer"
 * is taken at its strongest: not a chamfer that resembles the pack's, but the
 * pack's own cube construction with the pack's own numbers, generalised.
 *
 * ## The chamfer is MEASURED, and the bank is what it was measured against
 *
 * `how-the-animals-are-made.md`, over 4,354 Kenney corners: 72% carry a single
 * flat 45° cut, and the cut is *"about 0.20 to 0.25 of the part's own smallest
 * dimension... a quarter for the bodies"*. `box-03`, the 1.250 cube that 13 of
 * the 24 animals wear, puts its flat faces at ±0.625 and its plateau edges at
 * ±0.3125 — a cut of 0.3125, which is exactly 0.25 × 1.250, the top of the
 * documented range and on the pack's 1/16 grid.
 *
 * **So `CHAMFER_OF_SMALLEST = 0.25`, and `box-03` is the evidence.** Verified
 * against `bank.generated.ts` itself, not against the doc: `box-03`'s 32 welded
 * points are exactly the permutations of (±0.625, ±0.3125, ±0.3125) together
 * with the eight (±0.5, ±0.5, ±0.5), with no float noise and no odd point.
 *
 * ## Where the bank and the doc part company, and why the bank wins
 *
 * `building-animals-from-parts.md` §8 says `box-03` *"cuts every edge AND every
 * corner"*. Its 32 points are right and its edge midpoint of 0.46875 is right.
 * Its topology is not: **`box-03` has no corner face at all.** Measured off the
 * bank — 30 planar faces, 60 triangles:
 *
 *   - 6 flat axis-aligned faces, each 0.625 square;
 *   - 24 bevel quads, TWO per cube edge, normals the permutations of
 *     (±2, ±3, 0)/√13 — **33.69° from the flat face each one BORDERS and 56.31°
 *     from the one across the ridge** (atan(2/3) and atan(3/2)), not a single
 *     45°. This line used to say "56.31° from the neighbouring flat face", which
 *     had the two angles the wrong way round: take the bevel with normal
 *     (−0.555, −0.832, 0), whose points are (−0.5, −0.5, ±0.5) and
 *     (−0.3125, −0.625, ±0.3125), and the face it actually shares an edge with is
 *     −y, at acos(0.832) = 33.69°. The two angles plus the 22.62° between the
 *     bevels sum to exactly 90°, which is the check;
 *   - 0 corner facets. The eight (±0.5, ±0.5, ±0.5) are single vertices where
 *     six bevel quads meet.
 *
 * The reason is arithmetic, and it is worth writing down because it is the one
 * number in this file that is not derivable. Three 45° edge-bevel planes meet at
 * `h − c/2` on every axis — for `box-03`, 0.625 − 0.15625 = **0.46875**. That is
 * 7.5/16. The pack is hand-authored on a 1/16 grid, and 0.46875 is not on it;
 * **0.5 is (8/16)**. Kenney rounded the corner outward by 0.03125 to land on the
 * grid, and that one snap is what splits each flat hexagonal bevel into two
 * quads with a shallow ridge between them.
 *
 * We keep the pack's number rather than the ideal one, because the pack is the
 * evidence and Joe's whole method is that the pack looks right and we do not.
 * Expressed so it survives being resized: the corner sits **20% of the way from
 * the exact 45° triple point toward the true corner**, which at 1.250 is exactly
 * 0.46875 + 0.2 × (0.625 − 0.46875) = 0.5. That is `CORNER_TOWARD_TRUE`.
 *
 * ## What "same chamfer" buys, checkably
 *
 * At size 1.250 the square prism reproduces `box-03` **exactly** — the same 32
 * points, the same 30 faces, the same 60 triangles, and the same normals to
 * within the bank's own 4dp rounding. `tests/island/authored-primitives.test.ts`
 * asserts all four. It costs 32 vertices against `box-03`'s 120, because the
 * pack's exporter split every corner and then gave the copies identical normals;
 * welding them changes nothing anybody can see. `how-the-animals-are-made.md`
 * predicted this: *"A hand-built 60-triangle chamfered box would match the pack
 * exactly and cost less."*
 *
 * ## The circle is chamfered on its rims only, deliberately
 *
 * A cylinder's barrel is one smooth surface; the joins between its facets are
 * tessellation, not edges, and rule 2 is about edges. Chamfering them would also
 * be geometrically impossible at this cut size — at 12 segments a 0.25 cut eats
 * more than a facet is long, and the solid self-intersects. So the circle cuts
 * the two rims, which are its only real edges, at a clean 45°: the single flat
 * cut that 72% of the pack's own corners carry.
 *
 * ## Resizing REGENERATES; it does not scale
 *
 * A chamfer baked at one size and then multiplied is no longer a chamfer of
 * 0.25 × the smallest dimension, and under a non-uniform stretch it is no longer
 * at 45° either. So `primitiveStretched` re-cuts the solid from a box of
 * `nominal × stretch` and hands back a part with the geometry that size wants.
 * `assembly.ts` does that swap at the one point where a stretch is baked.
 *
 * ## `roles` is empty, and that is the honest answer
 *
 * `PartRole` is declared in `bank.generated.ts`, which is generated and never
 * hand-edited, so there is no `'primitive'` to write even if it belonged there —
 * and it does not, because `PartRole` is documented as *"what a part was in the
 * animal it came out of"* and these came out of no animal. An empty `roles` is
 * the same kind of statement as the empty `provenance` beside it: checkable,
 * and true. The editor's dropdown groups by role and already has a bucket for
 * shapes that have none; `library.ts` names that bucket `primitive` when the row
 * is authored, which is the only place the word is a UI label rather than a
 * claim about the pack.
 */

/** The cut, as a fraction of the part's own smallest dimension. `box-03`: 0.25. */
const CHAMFER_OF_SMALLEST = 0.25

/**
 * How far the corner sits from the exact 45° triple point toward the true
 * corner. `box-03`'s grid snap, as a ratio: 0.46875 → 0.5 at size 1.250.
 */
const CORNER_TOWARD_TRUE = 0.2

/** The circle's facet count. The pack's own precedent: the pig's snout is a
 * twelve-sided cylinder. */
const CIRCLE_SEGMENTS = 12

/** A cross-section point, in the XZ plane. The prism is extruded along y. */
type Vec2 = readonly [number, number]

/** One side of the cross-section, as its outward normal and plane offset. */
interface Side { nx: number; nz: number; d: number }

/** A convex polyhedron as welded points and polygon faces, before triangulation. */
interface Solid { points: (readonly [number, number, number])[]; faces: number[][] }

/**
 * The cross-section's sides. `section` is convex and wound counter-clockwise in
 * (x, z), for which the outward normal of the edge a→b is (dz, −dx).
 */
function sidesOf(section: readonly Vec2[]): Side[] {
  return section.map((a, i) => {
    const b = section[(i + 1) % section.length]!
    const dx = b[0] - a[0], dz = b[1] - a[1]
    const len = Math.hypot(dx, dz)
    const nx = dz / len, nz = -dx / len
    return { nx, nz, d: nx * a[0] + nz * a[1] }
  })
}

/** Where two cross-section lines meet, each given as its side and an offset. */
function meet(a: Side, da: number, b: Side, db: number): Vec2 {
  const det = a.nx * b.nz - a.nz * b.nx
  return [(da * b.nz - a.nz * db) / det, (a.nx * db - da * b.nx) / det]
}

/** Twice the area vector of a planar polygon — Newell, so it needs no triangle. */
function faceNormal(
  points: readonly (readonly [number, number, number])[], face: readonly number[],
): [number, number, number] {
  let nx = 0, ny = 0, nz = 0
  for (let i = 0; i < face.length; i++) {
    const a = points[face[i]!]!, b = points[face[(i + 1) % face.length]!]!
    nx += (a[1] - b[1]) * (a[2] + b[2])
    ny += (a[2] - b[2]) * (a[0] + b[0])
    nz += (a[0] - b[0]) * (a[1] + b[1])
  }
  return [nx, ny, nz]
}

/**
 * Wind a face so it faces out.
 *
 * Sound rather than a fudge, and only because of what these solids are: every
 * one of them is CONVEX and built about the origin, so the origin is strictly
 * inside and a face is wound correctly exactly when its normal agrees with its
 * own centroid. Doing it here rather than getting six winding conventions right
 * by hand is what keeps the triangle and the circle honest as well as the
 * square; the test asserts the property afterwards rather than trusting it.
 */
function outward(
  points: readonly (readonly [number, number, number])[], face: number[],
): number[] {
  const [nx, ny, nz] = faceNormal(points, face)
  let cx = 0, cy = 0, cz = 0
  for (const i of face) { cx += points[i]![0]; cy += points[i]![1]; cz += points[i]![2] }
  return nx * cx + ny * cy + nz * cz >= 0 ? face : [...face].reverse()
}

/**
 * Cut a prism out of a box of `size`, chamfering every edge and every corner.
 *
 * `sharpSides` is what separates the square and the triangle from the circle:
 * false leaves the barrel a single smooth surface and cuts only the two rims.
 *
 * The construction, for a chamfer `c` and half-height `hy`:
 *
 *   - each face keeps a PLATEAU, its own plane inset by `c` on every side;
 *   - each real edge gets a bevel band between the two plateaus it separates;
 *   - each corner is a single point — the meet of its three 45° bevel planes,
 *     at `c/2` in from each, moved `CORNER_TOWARD_TRUE` of the way out to the
 *     true corner, which is `box-03`'s own grid snap.
 *
 * With n sides that is 8n points, 7n+2 faces and 16n−4 triangles. At n = 4:
 * 32, 30 and 60 — `box-03` exactly.
 */
function chamferedPrism(
  section: readonly Vec2[], size: readonly [number, number, number], sharpSides: boolean,
): Solid {
  const [sx, sy, sz] = size
  const hy = sy / 2
  const c = CHAMFER_OF_SMALLEST * Math.min(sx, sy, sz)
  const n = section.length
  const E = sidesOf(section)
  const prev = (i: number): number => (i + n - 1) % n
  const next = (i: number): number => (i + 1) % n

  const points: (readonly [number, number, number])[] = []
  const seen = new Map<string, number>()
  const at = (x: number, y: number, z: number): number => {
    const k = `${x.toFixed(9)},${y.toFixed(9)},${z.toFixed(9)}`
    let i = seen.get(k)
    if (i === undefined) { i = points.length; points.push([x, y, z]); seen.set(k, i) }
    return i
  }

  /* The cap plateau ring: the cross-section with every side moved in by `c`. An
   * offset ellipse is not an ellipse, so the circle's ring is solved the same
   * way as the square's — per side plane, then re-intersected. */
  const W = section.map((_, i) => meet(E[prev(i)]!, E[prev(i)]!.d - c, E[i]!, E[i]!.d - c))
  const py = hy - c
  const faces: number[][] = []

  faces.push(W.map(w => at(w[0], hy, w[1])))
  faces.push(W.map(w => at(w[0], -hy, w[1])))

  if (!sharpSides) {
    /* One smooth barrel, and a single flat 45° cut on each rim. */
    for (let i = 0; i < n; i++) {
      const k = next(i), a = section[i]!, b = section[k]!
      faces.push([at(a[0], py, a[1]), at(b[0], py, b[1]), at(b[0], -py, b[1]), at(a[0], -py, a[1])])
      faces.push([at(a[0], py, a[1]), at(b[0], py, b[1]), at(W[k]![0], hy, W[k]![1]),
        at(W[i]![0], hy, W[i]![1])])
      faces.push([at(a[0], -py, a[1]), at(b[0], -py, b[1]), at(W[k]![0], -hy, W[k]![1]),
        at(W[i]![0], -hy, W[i]![1])])
    }
    return { points, faces: faces.map(f => outward(points, f)) }
  }

  /* The corner: the three 45° bevel planes meet `c/2` in from each side plane
   * and at `hy − c/2` in y — that identity holds for any convex cross-section,
   * which is why the triangle needs no separate arithmetic. Then the snap. */
  const T = section.map((_, i) => meet(E[prev(i)]!, E[prev(i)]!.d - c / 2, E[i]!, E[i]!.d - c / 2))
  const C = section.map((v, i) => [
    T[i]![0] + CORNER_TOWARD_TRUE * (v[0] - T[i]![0]),
    T[i]![1] + CORNER_TOWARD_TRUE * (v[1] - T[i]![1]),
  ] as const)
  const cy = hy - c / 2 + CORNER_TOWARD_TRUE * (c / 2)
  /* Where a side plateau stops, near its start and end corners: on the side's
   * own line, at the neighbouring side's inset plane. */
  const A = section.map((_, i) => meet(E[i]!, E[i]!.d, E[prev(i)]!, E[prev(i)]!.d - c))
  const B = section.map((_, i) => meet(E[i]!, E[i]!.d, E[next(i)]!, E[next(i)]!.d - c))

  for (let i = 0; i < n; i++) {
    const j = prev(i), k = next(i)
    const ai = A[i]!, bi = B[i]!, bj = B[j]!
    faces.push([at(ai[0], py, ai[1]), at(bi[0], py, bi[1]),
      at(bi[0], -py, bi[1]), at(ai[0], -py, ai[1])])
    /* The vertical bevel at corner i: a hexagon, split by the ridge between the
     * corner's two points — the split `box-03`'s grid snap forces. */
    const ct = at(C[i]![0], cy, C[i]![1]), cb = at(C[i]![0], -cy, C[i]![1])
    faces.push([at(bj[0], py, bj[1]), ct, cb, at(bj[0], -py, bj[1])])
    faces.push([ct, at(ai[0], py, ai[1]), at(ai[0], -py, ai[1]), cb])
    /* The two cap bevels above and below side i, each split the same way. */
    for (const s of [1, -1]) {
      faces.push([at(ai[0], s * py, ai[1]), at(bi[0], s * py, bi[1]),
        at(C[k]![0], s * cy, C[k]![1]), at(C[i]![0], s * cy, C[i]![1])])
      faces.push([at(C[i]![0], s * cy, C[i]![1]), at(C[k]![0], s * cy, C[k]![1]),
        at(W[k]![0], s * hy, W[k]![1]), at(W[i]![0], s * hy, W[i]![1])])
    }
  }
  return { points, faces: faces.map(f => outward(points, f)) }
}

/**
 * Buffers from a solid: re-centred on its own bounding box, smooth-shaded, and
 * fan-triangulated.
 *
 * **Angle-weighted** vertex normals, not area-weighted, and that is measured
 * rather than chosen: against `box-03`'s own stored normals the angle-weighted
 * ones agree to 0.00009 — the bank's 4dp rounding — while area-weighted ones are
 * out by up to 6.7°. Rule 7 is smooth-shaded with split corners only where a
 * hard edge is wanted, and `box-03` splits none: every one of its 120 exported
 * copies of its 32 points carries the same normal as its twins.
 */
function emit(solid: Solid): { positions: number[]; normals: number[]; indices: number[] } {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]
  for (const p of solid.points) {
    for (let c = 0; c < 3; c++) {
      if (p[c]! < lo[c]!) lo[c] = p[c]!
      if (p[c]! > hi[c]!) hi[c] = p[c]!
    }
  }
  const mid = [0, 1, 2].map(c => (lo[c]! + hi[c]!) / 2)
  const points = solid.points.map(p =>
    [p[0] - mid[0]!, p[1] - mid[1]!, p[2] - mid[2]!] as const)

  const acc = points.map(() => [0, 0, 0])
  const indices: number[] = []
  for (const f of solid.faces) {
    const [fx, fy, fz] = faceNormal(points, f)
    const flen = Math.hypot(fx, fy, fz)
    for (let i = 0; i < f.length; i++) {
      const cur = points[f[i]!]!
      const before = points[f[(i + f.length - 1) % f.length]!]!
      const after = points[f[(i + 1) % f.length]!]!
      const u = [before[0] - cur[0], before[1] - cur[1], before[2] - cur[2]]
      const v = [after[0] - cur[0], after[1] - cur[1], after[2] - cur[2]]
      const ul = Math.hypot(u[0]!, u[1]!, u[2]!), vl = Math.hypot(v[0]!, v[1]!, v[2]!)
      const dot = (u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!) / (ul * vl)
      const w = Math.acos(Math.min(1, Math.max(-1, dot)))
      const a = acc[f[i]!]!
      a[0] = a[0]! + (fx / flen) * w
      a[1] = a[1]! + (fy / flen) * w
      a[2] = a[2]! + (fz / flen) * w
    }
    /* Every face here is convex and planar, verified by the test, so a fan off
     * its first point is a correct triangulation of it. */
    for (let i = 1; i + 1 < f.length; i++) indices.push(f[0]!, f[i]!, f[i + 1]!)
  }

  const positions: number[] = []
  const normals: number[] = []
  points.forEach((p, i) => {
    positions.push(p[0], p[1], p[2])
    const a = acc[i]!, l = Math.hypot(a[0]!, a[1]!, a[2]!)
    normals.push(a[0]! / l, a[1]! / l, a[2]! / l)
  })
  return { positions, normals, indices }
}

/** Fit a unit cross-section to the requested x and z, centred on the origin. */
function fitted(unit: readonly Vec2[], sx: number, sz: number): Vec2[] {
  const xs = unit.map(v => v[0]), zs = unit.map(v => v[1])
  const x0 = Math.min(...xs), x1 = Math.max(...xs)
  const z0 = Math.min(...zs), z1 = Math.max(...zs)
  return unit.map(v => [
    (v[0] - (x0 + x1) / 2) * (sx / (x1 - x0)),
    (v[1] - (z0 + z1) / 2) * (sz / (z1 - z0)),
  ] as const)
}

/** A regular n-gon, counter-clockwise in (x, z), first vertex at `start`. */
const polygon = (n: number, start: number): Vec2[] =>
  Array.from({ length: n }, (_, i) => {
    const t = start + (i * 2 * Math.PI) / n
    return [Math.cos(t), Math.sin(t)] as const
  })

/**
 * The three cross-sections, each FILLING the requested bounding box.
 *
 * Filling it is what makes `size` mean something under resize: the same dial
 * moves all three shapes the same way, and a non-uniform stretch gives a
 * rectangle, a scalene triangle and an ellipse rather than a shape that keeps
 * its proportions and floats inside the box it was asked for. The square's
 * cut faces then reach the box exactly, which is why its measured size is
 * `box-03`'s 1.250 on the nose; the triangle's apex is cut back by the chamfer,
 * so its measured size is honestly smaller than the box it came out of.
 */
const SECTIONS = {
  'bespoke-square-01': (sx: number, sz: number) =>
    fitted([[1, -1], [1, 1], [-1, 1], [-1, -1]], sx, sz),
  'bespoke-triangle-01': (sx: number, sz: number) =>
    fitted(polygon(3, Math.PI / 2), sx, sz),
  'bespoke-circle-01': (sx: number, sz: number) =>
    fitted(polygon(CIRCLE_SEGMENTS, 0), sx, sz),
} as const

/** Which of the three keep sharp vertical edges. The circle's barrel is smooth. */
const SHARP_SIDES: Record<PrimitiveId, boolean> = {
  'bespoke-square-01': true,
  'bespoke-triangle-01': true,
  'bespoke-circle-01': false,
}

/**
 * `form` is a LABEL — §7 is explicit that no query filters on it — but an honest
 * one: the square is the same `box` `box-03` is, a triangular prism is the
 * nearest thing the union has to a `wedge`, and a cylinder is a `tube`.
 */
const FORMS: Record<PrimitiveId, PartShape['form']> = {
  'bespoke-square-01': 'box',
  'bespoke-triangle-01': 'wedge',
  'bespoke-circle-01': 'tube',
}

export type PrimitiveId = keyof typeof SECTIONS

/**
 * The size each is cut from before any stretch: `box-03`'s own 1.250 cube.
 *
 * It is the pack's hull size, it is on the 1/16 grid, and taking it means the
 * square arrives in the editor as the exact solid 13 of the 24 animals wear.
 */
export const PRIMITIVE_SIZE: readonly [number, number, number] = [1.25, 1.25, 1.25]

/** Every base shape's id, in the order Joe named them. */
export const PRIMITIVE_IDS: readonly PrimitiveId[] =
  ['bespoke-triangle-01', 'bespoke-circle-01', 'bespoke-square-01']

/** Whether an id names one of the three, rather than a commissioned bespoke part. */
export const isPrimitive = (id: string): id is PrimitiveId =>
  (PRIMITIVE_IDS as readonly string[]).includes(id)

/** Cut one of the three out of a box of `size`. */
function primitiveAt(id: PrimitiveId, size: readonly [number, number, number]): BakedPart {
  const geo = emit(chamferedPrism(SECTIONS[id](size[0], size[2]), size, SHARP_SIDES[id]))
  const tris = geo.indices.length / 3
  /* A prism's cross-section is the same at both ends, which is what `taper: 1`
   * says — a bar. `box-03` records 1 for the same reason. */
  const shape = measure(geo.positions, FORMS[id], 1, 'radial')
  return {
    id,
    shape,
    /* DECLARED, not measured — the pack never joined these to anything, so these
     * numbers are our intent and not evidence. A prism is extruded along y and
     * has no interesting end, so it is placed by its centre: half of it buried,
     * which is the one placement that needs no number. */
    attachment: {
      axis: 'y', dir: 1, n: 0,
      sunkUnitsMin: size[1] / 2, sunkUnitsMean: size[1] / 2, sunkUnitsMax: size[1] / 2,
      sunkFractionMin: 0.5, sunkFractionMean: 0.5, sunkFractionMax: 0.5,
    },
    /* EMPTY, and argued in the header: `PartRole` says what a part WAS in the
     * animal it came out of, and these came out of no animal. */
    roles: [],
    /* EMPTY, and that is the point: `provenance.length === 0` is exactly the set
     * of shapes the pack did not give us, and it is checkable rather than stated. */
    provenance: [],
    positions: geo.positions,
    normals: geo.normals,
    indices: geo.indices,
    triVariants: [tris],
    bands: new Array<number>(tris).fill(0),
    size: shape.size,
    tris,
    verts: geo.positions.length / 3,
    offset: [0, 0, 0],
  }
}

/**
 * The same shape, re-cut from a box of `PRIMITIVE_SIZE × stretch`.
 *
 * This is the whole of "ability for me to resize" and it is why the chamfer
 * stays right: `assembly.ts` calls this instead of multiplying the baked
 * positions, so at any size the cut is still 0.25 of the smallest dimension and
 * still at 45°. At `[1, 1, 1]` it returns the part verbatim.
 */
export function primitiveStretched(
  id: PrimitiveId, stretch: readonly [number, number, number],
): BakedPart {
  if (stretch[0] === 1 && stretch[1] === 1 && stretch[2] === 1) return PRIMITIVES[id]
  return primitiveAt(id, [
    PRIMITIVE_SIZE[0] * stretch[0],
    PRIMITIVE_SIZE[1] * stretch[1],
    PRIMITIVE_SIZE[2] * stretch[2],
  ])
}

const PRIMITIVES: Record<PrimitiveId, BakedPart> = {
  'bespoke-square-01': primitiveAt('bespoke-square-01', PRIMITIVE_SIZE),
  'bespoke-triangle-01': primitiveAt('bespoke-triangle-01', PRIMITIVE_SIZE),
  'bespoke-circle-01': primitiveAt('bespoke-circle-01', PRIMITIVE_SIZE),
}

/** The square prism. At 1.250 it IS `box-03` — same points, faces, triangles. */
export const BESPOKE_SQUARE = PRIMITIVES['bespoke-square-01']
/** The triangular prism, its cross-section filling the box it is cut from. */
export const BESPOKE_TRIANGLE = PRIMITIVES['bespoke-triangle-01']
/** The circular prism — a twelve-sided cylinder, chamfered on its two rims. */
export const BESPOKE_CIRCLE = PRIMITIVES['bespoke-circle-01']

/** Every authored shape. Deliberately not merged into `PARTS_BANK`. */
export const AUTHORED_PARTS: readonly BakedPart[] =
  [BESPOKE_SPHERE, BESPOKE_TRIANGLE, BESPOKE_CIRCLE, BESPOKE_SQUARE]

/** By id, for `assembly.ts`'s lookup. Returns nothing for a bank id. */
export const authoredById = (id: string): BakedPart | undefined =>
  AUTHORED_PARTS.find(p => p.id === id)
