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
function measure(positions: readonly number[]): PartShape {
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
    /* The generated bank's `form` union has no `sphere` in it and this file does
     * not get to add one — `bank.generated.ts` is generated. `tube` is the
     * nearest member (a solid of revolution) and §7 is explicit that `form` is a
     * LABEL that no query ever filters on, so nothing turns on the choice. */
    form: 'tube',
    aspect: [1, sorted[1]! / sorted[0]!, sorted[2]! / sorted[0]!] as const,
    /* Both ends of a sphere are points, so the cross-section at the narrow end
     * over the wide end is zero, the same as `cone-06`'s. */
    taper: 0,
    symmetry: 'radial',
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

export const BESPOKE_SPHERE: BakedPart = {
  id: 'bespoke-sphere-01',
  shape: measure(NOSE.positions),
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
  size: measure(NOSE.positions).size,
  tris: NOSE.indices.length / 3,
  verts: NOSE.positions.length / 3,
  offset: [0, 0, 0],
}

/** Every authored shape. Deliberately not merged into `PARTS_BANK`. */
export const AUTHORED_PARTS: readonly BakedPart[] = [BESPOKE_SPHERE]

/** By id, for `assembly.ts`'s lookup. Returns nothing for a bank id. */
export const authoredById = (id: string): BakedPart | undefined =>
  AUTHORED_PARTS.find(p => p.id === id)
