/**
 * The three base shapes Joe asked for on 2 August — triangle, circle, square.
 *
 * The file exists for one assertion above all the others: **at size 1.250 the
 * square prism reproduces `box-03` exactly.** That is what "same chamfer in the
 * game" is taken to mean — not a chamfer that resembles the pack's, but the
 * pack's own cube, generalised to any size. If that test ever goes red, either
 * the generator drifted or the bank was regenerated; check which before touching
 * the assertion, and never relax it to fit.
 *
 * Everything here measures the geometry rather than the record. `size` and
 * `shape` are computed off the positions by `authored.ts` itself, so asserting
 * them against the positions again is worth nothing; what is worth something is
 * asserting the positions against `bank.generated.ts`.
 */
import { describe, expect, it } from 'vitest'
import {
  AUTHORED_PARTS, PRIMITIVE_IDS, PRIMITIVE_SIZE, isPrimitive, primitiveStretched,
  BESPOKE_SQUARE, BESPOKE_TRIANGLE, BESPOKE_CIRCLE,
} from '../../src/island/species/parts/authored'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { findShapes } from '../../src/island/species/parts/query'
import type { BakedPart } from '../../src/island/species/parts/bank.generated'

type Vec3 = [number, number, number]

const vertsOf = (p: BakedPart): Vec3[] => {
  const out: Vec3[] = []
  for (let i = 0; i < p.positions.length; i += 3) {
    out.push([p.positions[i]!, p.positions[i + 1]!, p.positions[i + 2]!])
  }
  return out
}
const key = (v: readonly number[], dp = 6): string => v.map(n => n.toFixed(dp)).join(',')
const welded = (p: BakedPart): Set<string> => new Set(vertsOf(p).map(v => key(v)))

const trianglesOf = (p: BakedPart): Vec3[][] => {
  const v = vertsOf(p)
  const out: Vec3[][] = []
  for (let i = 0; i < p.indices.length; i += 3) {
    out.push([v[p.indices[i]!]!, v[p.indices[i + 1]!]!, v[p.indices[i + 2]!]!])
  }
  return out
}

const cross = (a: Vec3, b: Vec3): Vec3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const len = (a: Vec3): number => Math.hypot(a[0], a[1], a[2])

/** Every distinct plane the surface lies in: the FACES, however triangulated. */
const planes = (p: BakedPart): Set<string> => {
  const out = new Set<string>()
  for (const t of trianglesOf(p)) {
    const n = cross(sub(t[1]!, t[0]!), sub(t[2]!, t[0]!))
    const l = len(n)
    const u: Vec3 = [n[0] / l, n[1] / l, n[2] / l]
    out.add(`${key(u, 5)}|${dot(u, t[0]!).toFixed(5)}`)
  }
  return out
}

/** The measured bounding box, low and high. */
const bbox = (p: BakedPart): { lo: Vec3; hi: Vec3 } => {
  const lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity]
  for (const v of vertsOf(p)) {
    for (let c = 0; c < 3; c++) {
      if (v[c]! < lo[c]!) lo[c] = v[c]!
      if (v[c]! > hi[c]!) hi[c] = v[c]!
    }
  }
  return { lo, hi }
}

describe('the square prism IS box-03, generalised', () => {
  const box = partById('box-03')!

  it('has the bank record it claims to reproduce', () => {
    expect(box).toBeDefined()
    expect(box.size).toEqual([1.25, 1.25, 1.25])
    expect(box.tris).toBe(60)
  })

  it('reproduces box-03\'s 32 welded points exactly, none missing and none extra', () => {
    const mine = welded(BESPOKE_SQUARE), theirs = welded(box)
    expect(theirs.size).toBe(32)
    expect([...theirs].filter(k => !mine.has(k))).toEqual([])
    expect([...mine].filter(k => !theirs.has(k))).toEqual([])
    expect(mine.size).toBe(32)
  })

  it('is the same 32 points the doc names — permutations of the two families', () => {
    const want = new Set<string>()
    for (const s of [1, -1]) for (const t of [1, -1]) for (const u of [1, -1]) {
      want.add(key([0.625 * s, 0.3125 * t, 0.3125 * u]))
      want.add(key([0.3125 * s, 0.625 * t, 0.3125 * u]))
      want.add(key([0.3125 * s, 0.3125 * t, 0.625 * u]))
      want.add(key([0.5 * s, 0.5 * t, 0.5 * u]))
    }
    expect(want.size).toBe(32)
    expect(welded(BESPOKE_SQUARE)).toEqual(want)
  })

  it('is the same SOLID: 30 faces and 60 triangles, whatever the triangulation', () => {
    expect(BESPOKE_SQUARE.tris).toBe(60)
    expect(planes(BESPOKE_SQUARE).size).toBe(30)
    expect(planes(BESPOKE_SQUARE)).toEqual(planes(box))
  })

  it('shades the same: angle-weighted normals match the bank\'s to its own 4dp', () => {
    const theirs = new Map<string, Vec3>()
    for (let i = 0; i < box.positions.length; i += 3) {
      theirs.set(key([box.positions[i]!, box.positions[i + 1]!, box.positions[i + 2]!]),
        [box.normals[i]!, box.normals[i + 1]!, box.normals[i + 2]!])
    }
    let worst = 0
    vertsOf(BESPOKE_SQUARE).forEach((v, i) => {
      const b = theirs.get(key(v))!
      expect(b).toBeDefined()
      const mine: Vec3 = [BESPOKE_SQUARE.normals[i * 3]!,
        BESPOKE_SQUARE.normals[i * 3 + 1]!, BESPOKE_SQUARE.normals[i * 3 + 2]!]
      worst = Math.max(worst, len(sub(mine, b)))
    })
    /* The bank stores its normals rounded to 4dp, so 1e-4 is the bank's own
     * precision and not a tolerance we chose to make this pass. */
    expect(worst).toBeLessThan(1e-4)
  })

  it('costs 32 vertices where the pack\'s exporter spent 120, for the same surface', () => {
    expect(box.verts).toBe(120)
    expect(BESPOKE_SQUARE.verts).toBe(32)
  })
})

describe('the chamfer is 0.25 of the smallest dimension, at any size', () => {
  /**
   * Measured off the solid, not read off a constant: the flat plateau of the
   * face at +x is bounded in y and z by the cut, so `half - plateau` IS the cut.
   */
  const cutOf = (p: BakedPart): number => {
    const { hi } = bbox(p)
    const onFace = vertsOf(p).filter(v => Math.abs(v[0]! - hi[0]!) < 1e-9)
    const plateau = Math.max(...onFace.map(v => Math.abs(v[1]!)))
    return hi[1]! - plateau
  }

  it('is 0.3125 on box-03 itself — 0.25 x 1.250, the top of the measured range', () => {
    expect(cutOf(partById('box-03')!)).toBeCloseTo(0.3125, 9)
    expect(cutOf(BESPOKE_SQUARE)).toBeCloseTo(0.25 * 1.25, 9)
  })

  it('follows the SMALLEST dimension when the square is stretched unevenly', () => {
    const wide = primitiveStretched('bespoke-square-01', [4, 1, 1])
    expect(wide.size[1]).toBeCloseTo(1.25, 9)
    expect(cutOf(wide)).toBeCloseTo(0.25 * 1.25, 9)
    const flat = primitiveStretched('bespoke-square-01', [4, 0.5, 1])
    expect(cutOf(flat)).toBeCloseTo(0.25 * 0.625, 9)
  })

  it('REGENERATES rather than scales — the two are measurably different', () => {
    const wide = primitiveStretched('bespoke-square-01', [4, 1, 1])
    /* What multiplying the baked positions would have given: a cut of 4 x 0.3125
     * on the stretched axis, which is no longer 0.25 of anything and no longer
     * at 45 degrees. This is the behaviour the seam in assembly.ts replaces. */
    const scaledCut = 4 * 0.3125
    const { hi } = bbox(wide)
    expect(hi[0]!).toBeCloseTo(2.5, 9)
    const onTop = vertsOf(wide).filter(v => Math.abs(v[1]! - hi[1]!) < 1e-9)
    const cutAlongX = hi[0]! - Math.max(...onTop.map(v => Math.abs(v[0]!)))
    expect(cutAlongX).toBeCloseTo(0.3125, 9)
    expect(cutAlongX).not.toBeCloseTo(scaledCut, 3)
  })

  it('gives an unstretched part back verbatim', () => {
    expect(primitiveStretched('bespoke-square-01', [1, 1, 1])).toBe(BESPOKE_SQUARE)
  })
})

describe('every base shape is a sound solid, at every size the dials reach', () => {
  /* The editor's SIZE sliders run 0.25x to 4x per axis, independently. */
  const DIAL = [0.25, 0.5, 1, 2, 4]

  const audit = (p: BakedPart): { inward: number; degenerate: number; unwelded: number } => {
    const v = vertsOf(p)
    let inward = 0, degenerate = 0
    for (const t of trianglesOf(p)) {
      const n = cross(sub(t[1]!, t[0]!), sub(t[2]!, t[0]!))
      if (len(n) < 1e-12) { degenerate++; continue }
      const c: Vec3 = [(t[0]![0] + t[1]![0] + t[2]![0]) / 3,
        (t[0]![1] + t[1]![1] + t[2]![1]) / 3, (t[0]![2] + t[1]![2] + t[2]![2]) / 3]
      /* Convex and origin-centred, so an outward face's normal agrees with its
       * own centroid. This is the property `outward()` claims; assert it. */
      if (dot(n, c) <= 0) inward++
    }
    return { inward, degenerate, unwelded: v.length - new Set(v.map(x => key(x, 7))).size }
  }

  it('is origin-centred and honestly measured at rest', () => {
    for (const p of [BESPOKE_SQUARE, BESPOKE_TRIANGLE, BESPOKE_CIRCLE]) {
      const { lo, hi } = bbox(p)
      for (let c = 0; c < 3; c++) {
        expect(lo[c]! + hi[c]!).toBeCloseTo(0, 9)
        expect(hi[c]! - lo[c]!).toBeCloseTo(p.size[c]!, 9)
        /* The chamfer can only take material away, never add it. */
        expect(p.size[c]!).toBeLessThanOrEqual(PRIMITIVE_SIZE[c]! + 1e-9)
      }
      expect(p.shape.size).toEqual(p.size)
    }
  })

  it('the square fills its box and the triangle honestly does not', () => {
    expect(BESPOKE_SQUARE.size).toEqual([1.25, 1.25, 1.25])
    expect(BESPOKE_CIRCLE.size).toEqual([1.25, 1.25, 1.25])
    /* The apex is a vertex, not a face, so the chamfer cuts it back. Saying so
     * in `size` is the point of measuring rather than declaring. */
    expect(BESPOKE_TRIANGLE.size[2]!).toBeLessThan(1.25)
  })

  it('never self-intersects, inverts a face or leaves a point unwelded', () => {
    let checked = 0
    for (const x of DIAL) for (const y of DIAL) for (const z of DIAL) {
      for (const id of PRIMITIVE_IDS) {
        const p = primitiveStretched(id, [x, y, z])
        expect(audit(p), `${id} at ${x},${y},${z}`).toEqual(
          { inward: 0, degenerate: 0, unwelded: 0 })
        expect(p.verts).toBe(p.positions.length / 3)
        expect(p.normals.length).toBe(p.positions.length)
        expect(Math.max(...p.indices)).toBeLessThan(p.verts)
        checked++
      }
    }
    expect(checked).toBe(DIAL.length ** 3 * PRIMITIVE_IDS.length)
  })

  it('keeps every normal a unit vector', () => {
    for (const id of PRIMITIVE_IDS) {
      const p = primitiveStretched(id, [3, 0.5, 2])
      for (let i = 0; i < p.normals.length; i += 3) {
        expect(len([p.normals[i]!, p.normals[i + 1]!, p.normals[i + 2]!])).toBeCloseTo(1, 9)
      }
    }
  })

  it('stays inside rule 9\'s budget — a body is 236 to 1114 verts', () => {
    expect(BESPOKE_SQUARE.verts).toBe(32)
    expect(BESPOKE_TRIANGLE.verts).toBe(24)
    expect(BESPOKE_CIRCLE.verts).toBe(48)
    expect(BESPOKE_SQUARE.tris).toBe(60)
    expect(BESPOKE_TRIANGLE.tris).toBe(44)
    expect(BESPOKE_CIRCLE.tris).toBe(92)
  })

  it('cuts the circle on its rims only, because a barrel facet is not an edge', () => {
    /* 12 barrel quads + 12 per rim + 2 caps = 38 faces. A chamfered barrel joint
     * would multiply that and, at this cut size, self-intersect. */
    expect(planes(BESPOKE_CIRCLE).size).toBe(38)
  })
})

describe('the three rules authored.ts lives under still hold', () => {
  it('names every one bespoke-*, so no reader can mistake it for a lifted shape', () => {
    for (const p of AUTHORED_PARTS) expect(p.id.startsWith('bespoke-')).toBe(true)
    for (const id of PRIMITIVE_IDS) expect(isPrimitive(id)).toBe(true)
    expect(isPrimitive('bespoke-sphere-01')).toBe(false)
    expect(isPrimitive('box-03')).toBe(false)
  })

  it('keeps them OUT of the parts bank, so nothing can search its way in', () => {
    const banked = new Set(PARTS_BANK.map(p => p.id))
    for (const id of PRIMITIVE_IDS) expect(banked.has(id)).toBe(false)
    expect(findShapes({}).some(p => p.id.startsWith('bespoke-'))).toBe(false)
    for (const id of PRIMITIVE_IDS) expect(partById(id)).toBeUndefined()
  })

  it('leaves provenance empty — the checkable signal that the pack gave us nothing', () => {
    for (const id of PRIMITIVE_IDS) {
      const p = AUTHORED_PARTS.find(q => q.id === id)!
      expect(p.provenance.length).toBe(0)
      /* And roles empty: PartRole says what a part WAS in the animal it came out
       * of, and these came out of no animal. */
      expect(p.roles.length).toBe(0)
    }
  })

  it('adds exactly three, and the sphere is untouched', () => {
    expect(AUTHORED_PARTS.length).toBe(4)
    expect(new Set(AUTHORED_PARTS.map(p => p.id)).size).toBe(4)
    const sphere = AUTHORED_PARTS.find(p => p.id === 'bespoke-sphere-01')!
    expect(sphere.verts).toBe(26)
    expect(sphere.tris).toBe(48)
    expect(sphere.roles).toEqual(['nose'])
    expect(sphere.shape.form).toBe('tube')
    expect(sphere.shape.taper).toBe(0)
  })

  /*
   * REHOMED FROM `tests/island/assembly-hedgehog.test.ts`, 2 August.
   *
   * This was `is a real sphere, generated rather than typed, and small` and it
   * lived in the hedgehog's file because the hedgehog was the only species that
   * ever wore `bespoke-sphere-01`. Joe took it off the hedgehog from the editor,
   * so NO species wears it now — but the part still exists, is still registered
   * in `AUTHORED_PARTS`, and is still a selectable row in his editor's shape
   * library. Retiring it is his call and not a test's, so the pin moves here
   * rather than dying with the block that described the nose it used to be.
   */
  it('keeps the sphere a real sphere, generated rather than typed, and small', () => {
    const s = AUTHORED_PARTS.find(p => p.id === 'bespoke-sphere-01')!
    // Round to a thousandth on all three axes, and every vertex the same
    // distance from the centre — which is what makes it a sphere rather than a
    // blob somebody typed.
    expect(s.size[0]).toBeCloseTo(0.125, 3)
    expect(s.size[1]).toBeCloseTo(0.125, 3)
    expect(s.size[2]).toBeCloseTo(0.125, 3)
    const radii = new Set(vertsOf(s).map(p => Math.hypot(p[0], p[1], p[2]).toFixed(6)))
    expect(radii.size).toBe(1)
    expect(Number([...radii][0])).toBeCloseTo(0.0625, 6)
    // Smooth-shaded on exact normals (rule 7): a sphere's normal IS its point
    // over its radius, so no normal is averaged and no corner is split.
    for (let i = 0; i < s.positions.length; i += 3) {
      for (let c = 0; c < 3; c++) {
        expect(s.normals[i + c]).toBeCloseTo(s.positions[i + c]! / 0.0625, 6)
      }
    }
    // 2/16 on the pack's grid, and under its own smallest solid nose-tips —
    // including `box-09`, which is the part that has now replaced it.
    expect(s.size[1] * 16).toBeCloseTo(2, 6)
    expect(s.size[1]).toBeLessThan(partById('box-09')!.size[1])
    expect(s.size[1]).toBeLessThan(partById('box-22')!.size[1])
  })

  it('declares its attachment rather than measuring one, and says so in the numbers', () => {
    for (const id of PRIMITIVE_IDS) {
      const p = AUTHORED_PARTS.find(q => q.id === id)!
      /* `n: 0` is the honest count of donors the pack gave us for this join. */
      expect(p.attachment?.n).toBe(0)
      expect(p.attachment?.sunkFractionMean).toBe(0.5)
    }
  })
})
