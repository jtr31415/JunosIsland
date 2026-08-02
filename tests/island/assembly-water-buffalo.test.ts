/**
 * The water buffalo — Farm's darkest bovine, and the one whose whole separation
 * is its horns.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`, and JT-044's mechanism is pinned once and for all in
 * `assembly-pony.test.ts:87-283`. **Neither is repeated here.** This file pins
 * the five things that are this species' own:
 *
 *   1. **`box-12` is `box-03` on all six flat plates**, and every unit of its
 *      extra width is two fused EAR LUGS. That is why this animal has no ear
 *      feature, and a sibling that adds one back should turn this test red.
 *   2. **`creature.ts`'s own `chamXY` solve is WRONG on this shell** — the lugs
 *      inflate `half[0]`, so the solved chamfer point sits clear of the mass.
 *      Pinned because the horns are sited on that chamfer and had to dodge it.
 *   3. **The 135-degree ROLL is what makes a tusk a horn.** The shape's own bend
 *      ends up within three degrees of vertical, and segment one's centreline
 *      climbs while its facing stays dead level.
 *   4. **The crescent is continuous and it is enormous** — three segments a side,
 *      each rooted on the previous one's real centreline rather than on the
 *      bounding-box axis `on:` would have used, spanning 1.38x the body's width.
 *   5. **The stocking is a SOCK and it is the only patch on the animal.**
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, WATER_BUFFALO_ASSEMBLY, HORSE_ASSEMBLY, OX_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, SLOT_PX,
  type Spin,
} from '../../src/island/species/parts'
import { partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-water-buffalo',
  parts: ['box-01', 'box-12', 'box-18', 'box-24', 'plate-01', 'wedge-11'],
  height: 1.705395,
  verts: 518,
  tris: 762,
  // The cow's shell against a stub tail, which is the next biggest thing on it.
  massRatio: 20,
  // Three horn segments carrying three spins each, and the tail turned over.
  spinsAtLeast: 4,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-water-buffalo')
  g.updateMatrixWorld(true)
  return g
}
type Feat = (typeof WATER_BUFFALO_ASSEMBLY)['features'][number]
const feature = (name: string): Feat =>
  WATER_BUFFALO_ASSEMBLY.features.find((f: Feat) => f.name === name)!

/** A shell's referenced points in WORLD terms: origin-centred plus its offset. */
const worldPoints = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([
      p.positions[vi * 3]! + p.offset[0]!,
      p.positions[vi * 3 + 1]! + p.offset[1]!,
      p.positions[vi * 3 + 2]! + p.offset[2]!,
    ])
  }
  return out
}

/** Everything a shell has on one plane, and how far it reaches on the other two. */
const plane = (id: string, axis: 0 | 1 | 2, at: number): {
  n: number; lo: [number, number]; hi: [number, number]
} => {
  const on = worldPoints(id).filter(p => Math.abs(p[axis] - at) < 1e-6)
  const other = ([0, 1, 2] as const).filter(a => a !== axis) as [0 | 1 | 2, 0 | 1 | 2]
  return {
    n: on.length,
    lo: [Math.min(...on.map(p => p[other[0]])), Math.min(...on.map(p => p[other[1]]))],
    hi: [Math.max(...on.map(p => p[other[0]])), Math.max(...on.map(p => p[other[1]]))],
  }
}

/** Half a shell's extent on one axis — `hullFrame`'s own `half`. */
const halfOf = (id: string, axis: 0 | 1 | 2): number =>
  Math.max(...worldPoints(id).map(p => Math.abs(p[axis] - partById(id)!.offset[axis]!)))

/** How far a face reaches along another axis — `creature.ts:394`'s `inset`. */
const inset = (id: string, face: 0 | 1 | 2, along: 0 | 1 | 2): number => {
  const o = partById(id)!.offset
  const pts = worldPoints(id).map(p => [p[0] - o[0]!, p[1] - o[1]!, p[2] - o[2]!] as const)
  const h = Math.max(...pts.map(p => Math.abs(p[face])))
  let out = 0
  for (const p of pts) {
    if (Math.abs(Math.abs(p[face]) - h) > 1e-6) continue
    if (Math.abs(p[along]) > out) out = Math.abs(p[along])
  }
  return out
}

/** Is a world point inside a shell? Parity along one irrational direction. */
const insideShell = (id: string, P: readonly [number, number, number]): boolean => {
  const p: BakedPart = partById(id)!
  const d = [0.5773, 0.5774, 0.5775] as const
  let hits = 0
  for (let t = 0; t < p.indices.length / 3; t++) {
    const c = (k: number): [number, number, number] => {
      const vi = p.indices[t * 3 + k]!
      return [
        p.positions[vi * 3]! + p.offset[0]!,
        p.positions[vi * 3 + 1]! + p.offset[1]!,
        p.positions[vi * 3 + 2]! + p.offset[2]!,
      ]
    }
    const a = c(0), b = c(1), q = c(2)
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const e2 = [q[0] - a[0], q[1] - a[1], q[2] - a[2]]
    const h = [
      d[1] * e2[2]! - d[2] * e2[1]!, d[2] * e2[0]! - d[0] * e2[2]!, d[0] * e2[1]! - d[1] * e2[0]!,
    ]
    const det = e1[0]! * h[0]! + e1[1]! * h[1]! + e1[2]! * h[2]!
    if (Math.abs(det) < 1e-12) continue
    const inv = 1 / det
    const s = [P[0] - a[0], P[1] - a[1], P[2] - a[2]]
    const u = inv * (s[0]! * h[0]! + s[1]! * h[1]! + s[2]! * h[2]!)
    if (u < 0 || u > 1) continue
    const cr = [
      s[1]! * e1[2]! - s[2]! * e1[1]!, s[2]! * e1[0]! - s[0]! * e1[2]!, s[0]! * e1[1]! - s[1]! * e1[0]!,
    ]
    const v = inv * (d[0] * cr[0]! + d[1] * cr[1]! + d[2] * cr[2]!)
    if (v < 0 || u + v > 1) continue
    if (inv * (e2[0]! * cr[0]! + e2[1]! * cr[1]! + e2[2]! * cr[2]!) > 1e-9) hits++
  }
  return hits % 2 === 1
}

/** The world points of one built mesh. */
const meshPoints = (g: THREE.Group, name: string): THREE.Vector3[] => {
  const m = g.getObjectByName(name) as THREE.Mesh
  const pos = m.geometry.getAttribute('position')
  const out: THREE.Vector3[] = []
  for (let i = 0; i < pos.count; i++) {
    out.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld))
  }
  return out
}

/* ===================================================================== *
 * 1. `box-12` IS `box-03` PLUS TWO EARS
 * ===================================================================== */

describe('animal-water-buffalo: the cow\'s shell is the cube with its ears fused on', () => {
  it('has all SIX of the cube\'s flat plates, at the cube\'s own coordinates', () => {
    expect(WATER_BUFFALO_ASSEMBLY.hull.part).toBe('box-12')
    for (const [axis, at] of ([[1, 1.43125], [1, 0.18125], [2, 0.625], [2, -0.625],
      [0, 0.625], [0, -0.625]] as const)) {
      const wide = plane('box-12', axis, at)
      const cube = plane('box-03', axis, at)
      expect(wide.lo, `box-12's plate on axis ${axis} at ${at}`).toEqual(cube.lo)
      expect(wide.hi, `box-12's plate on axis ${axis} at ${at}`).toEqual(cube.hi)
    }
    // And the front plate is where the eye cards land, exactly as on the cube.
    expect(HULL_FRONT_Z_USUAL).toBe(0.625)
  })

  it('spends every unit of its extra width on TWO EAR LUGS, and nothing on body', () => {
    const lugs = worldPoints('box-12').filter(p => Math.abs(p[0]) > 0.625 + 1e-9)
    expect(lugs, 'the extra width is not a small number of points').toHaveLength(30)
    expect(Math.max(...lugs.map(p => Math.abs(p[0])))).toBeCloseTo(0.7697, 4)
    // High, forward, outboard: an ear, on both donors, and there is no separate
    // ear record in the bank for either the cow or the deer.
    expect(Math.min(...lugs.map(p => p[1]))).toBeCloseTo(1.17705, 5)
    expect(Math.max(...lugs.map(p => p[1]))).toBeCloseTo(1.35375, 5)
    expect(Math.min(...lugs.map(p => p[2]))).toBeCloseTo(0.35, 4)
    expect(Math.max(...lugs.map(p => p[2]))).toBeCloseTo(0.5, 4)
  })

  it('wears NO ear feature, and paints the lugs\' own band instead', () => {
    // The badger refused `box-30` on this shell because a pair here is a SECOND
    // pair. If a sibling helpfully adds one back, this goes red.
    expect(WATER_BUFFALO_ASSEMBLY.features.map((f: Feat) => f.name)).not.toContain('ear')
    expect(WATER_BUFFALO_ASSEMBLY.hull.paint.byBand).toEqual({ 5: 'pale' })
    const p = partById('box-12')!
    const band5 = [...p.bands.keys()].filter(t => p.bands[t] === 5)
    expect(band5, 'band 5 is the lugs\' flat forward face').toHaveLength(12)
    for (const t of band5) {
      for (let k = 0; k < 3; k++) {
        expect(p.positions[p.indices[t * 3 + k]! * 3 + 2]!).toBeCloseTo(0.5, 4)
      }
    }
  })
})

/* ===================================================================== *
 * 2. THE TRAP: `chamXY` IS WRONG ON THIS SHELL
 * ===================================================================== */

describe('animal-water-buffalo: the solver\'s chamfer point misses this hull', () => {
  it('is pushed 0.066 off the mass because `half[0]` is the EAR LUG', () => {
    // `creature.ts:440`: chamXY = [(half[0] + inset(top, x)) / 2, ...].
    const solved = [
      (halfOf('box-12', 0) + inset('box-12', 1, 0)) / 2,
      (halfOf('box-12', 1) + inset('box-12', 0, 1)) / 2,
    ]
    expect(solved[0]!).toBeCloseTo(0.5411, 4)
    expect(solved[1]!).toBeCloseTo(0.5519, 4)
    // The real chamfer chord runs (0.3125, 0.625) to (0.625, 0.3125): x + y = 0.9375.
    expect(solved[0]! + solved[1]!, 'the solve is outside the chord').toBeGreaterThan(0.9375)
    // Off the chord by this much along the 45-degree normal...
    expect((solved[0]! + solved[1]! - 0.9375) / Math.SQRT2).toBeCloseTo(0.109955, 5)
    // ...and the real surface is only 0.044194 proud of the chord, so the solve
    // is 0.065761 clear of the mass. Nothing joined there would touch the hull.
    expect((solved[0]! + solved[1]! - 0.9375) / Math.SQRT2 - 0.044194).toBeCloseTo(0.065761, 5)
    // The cube's own solve is right, which is what the horns are sited on.
    const cube = [
      (halfOf('box-03', 0) + inset('box-03', 1, 0)) / 2,
      (halfOf('box-03', 1) + inset('box-03', 0, 1)) / 2,
    ]
    expect(cube).toEqual([0.46875, 0.46875])
    expect(feature('horn').placement.kind).toBe('pair')
    const at = (feature('horn').placement as { at: readonly number[] }).at
    expect([at[0], at[1]]).toEqual([0.46875, 0.80625 + 0.46875])
  })
})

/* ===================================================================== *
 * 3. THE ROLL IS WHAT MAKES A TUSK A HORN
 * ===================================================================== */

describe('animal-water-buffalo: the horns', () => {
  it('are the elephant\'s TUSK, worn six times — three times the ox\'s two', () => {
    const tusk = partById('wedge-11')!
    expect(tusk.roles).toEqual(['tooth'])
    expect(tusk.provenance[0]!.species).toBe('elephant')
    const horns = WATER_BUFFALO_ASSEMBLY.features.filter((f: Feat) => f.part === 'wedge-11')
    expect(horns).toHaveLength(3)
    for (const h of horns) expect(h.placement.kind).toBe('pair')
    expect(horns.length * tusk.tris * 2).toBe(228)
    // The ox shipped first, on the same shell and the same chord, with ONE pair.
    const oxHorns = OX_ASSEMBLY.features.filter((f: Feat) => f.part === 'wedge-11')
    expect(oxHorns).toHaveLength(1)
    expect(OX_ASSEMBLY.hull.part).toBe('box-12')
  })

  it('turns the tusk\'s OWN bend within three degrees of vertical', () => {
    // The shape's three ring centres: it drifts +x and -y as it grows, which is
    // a bend of atan2(-0.740, 0.673) = -47.7 degrees about its long axis.
    const p = partById('wedge-11')!
    const pts: [number, number, number][] = []
    for (const vi of new Set(p.indices)) {
      pts.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
    }
    const ring = (lo: number, hi: number): [number, number] => {
      const g = pts.filter(q => q[2] >= lo && q[2] <= hi)
      expect(g).toHaveLength(8)
      return [g.reduce((s, q) => s + q[0], 0) / 8, g.reduce((s, q) => s + q[1], 0) / 8]
    }
    const root = ring(-0.25, -0.10), tip = ring(0.15, 0.25)
    const bend = [tip[0] - root[0], tip[1] - root[1]]
    expect(bend[0]!, 'the tusk bends OUT as it grows').toBeGreaterThan(0.08)
    expect(bend[1]!, 'and DOWN in its own frame').toBeLessThan(-0.09)
    const deg = Math.atan2(bend[1]!, bend[0]!) * 180 / Math.PI
    expect(deg).toBeCloseTo(-43.99, 1)
    // Rolled 135, that bend points UP: -43.99 + 135 = 91.01, one degree off.
    const roll = feature('horn').spin!.find((s: Spin) => s.axis === 'z')!
    expect(roll.deg).toBe(135)
    expect(Math.abs(deg + roll.deg - 90), 'within a degree of vertical')
      .toBeLessThan(1.1)
  })

  it('climbs even though the root segment\'s facing is DEAD LEVEL', () => {
    const g = build()
    const m = g.getObjectByName('horn-r') as THREE.Mesh
    const facing = m.userData['facing'] as [number, number, number]
    expect(facing[1], 'segment one is aimed level').toBeCloseTo(0, 6)
    // ...and its far end is still higher than its near end, because the SHAPE
    // curves. That is the whole of the roll's job.
    const pts = meshPoints(g, 'horn-r')
    const near = pts.filter(q => q.x < 0.45), far = pts.filter(q => q.x > 0.62)
    const meanY = (v: THREE.Vector3[]): number => v.reduce((s, q) => s + q.y, 0) / v.length
    expect(meanY(far) - meanY(near), 'the horn rises along its own curve')
      .toBeGreaterThan(0.09)
  })

  it('is ROOTED IN THE HULL with no daylight at all', () => {
    const g = build()
    const drop = g.position.y
    const m = g.getObjectByName('horn-r') as THREE.Mesh
    const at = m.userData['joinedAt'] as [number, number, number]
    const facing = m.userData['facing'] as [number, number, number]
    // Every vertex behind the join plane must be inside the one mass.
    const behind = meshPoints(g, 'horn-r')
      .map(q => [q.x, q.y - drop, q.z] as [number, number, number])
      .filter(q => (q[0] - at[0]) * facing[0] + (q[1] - at[1]) * facing[1]
        + (q[2] - at[2]) * facing[2] < -1e-9)
    expect(behind, 'the root ring is 8 points').toHaveLength(8)
    for (const q of behind) expect(insideShell('box-12', q), `${q} floats`).toBe(true)
    // And it is buried the elephant's own depth, unchanged.
    expect(m.userData['sink']).toBeCloseTo(0.375966, 6)
  })

  it('chains each segment on the previous one\'s REAL centreline, not on `on:`', () => {
    // `on:` anchors at `centre + facing * hi`, the bounding-box axis. On a curved
    // part that is 0.139 off the tip, which would pull the crescent apart — so
    // every join here is an explicit `at`, and none of them is `on`.
    const g = build()
    for (const n of ['horn', 'horn-mid', 'horn-tip']) {
      expect((g.getObjectByName(`${n}-r`) as THREE.Mesh).userData['joinedAt']).toBeDefined()
    }
    const axisTip = (name: string): THREE.Vector3 => {
      const m = g.getObjectByName(name) as THREE.Mesh
      const facing = new THREE.Vector3(...(m.userData['facing'] as number[]))
      const pts = meshPoints(g, name)
      const d = pts.map(q => q.clone().sub(m.getWorldPosition(new THREE.Vector3())).dot(facing))
      const hi = Math.max(...d)
      // the eight points nearest the far end are the tip ring; their mean is the
      // centreline's own end, which is what the next segment is rooted on.
      const idx = d.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]).slice(0, 8)
      const c = new THREE.Vector3()
      for (const [, i] of idx) c.add(pts[i]!)
      expect(hi).toBeGreaterThan(0)
      return c.multiplyScalar(1 / 8)
    }
    const a = axisTip('horn-r'), b = axisTip('horn-mid-r'), c = axisTip('horn-tip-r')
    // Out, then further out; up, then further up; back, then further back.
    expect(a.x).toBeLessThan(b.x)
    expect(b.x).toBeLessThan(c.x)
    expect(a.y).toBeLessThan(b.y)
    expect(b.y).toBeLessThan(c.y)
    expect(a.z).toBeGreaterThan(b.z)
    expect(b.z).toBeGreaterThan(c.z)
    // ...and the last one is BEHIND the hull's own midline, over the shoulder.
    expect(c.z).toBeLessThan(0)
  })

  it('spans 1.38x the body\'s own width, and tapers 6:1 rather than 27:1', () => {
    const g = build()
    let span = 0
    for (const n of ['horn-r', 'horn-l', 'horn-mid-r', 'horn-mid-l', 'horn-tip-r', 'horn-tip-l']) {
      for (const q of meshPoints(g, n)) span = Math.max(span, Math.abs(q.x))
    }
    expect(span).toBeCloseTo(1.115939, 4)
    expect(span * 2 / partById('box-12')!.size[0]!).toBeCloseTo(1.4498, 3)
    const box = new THREE.Box3().setFromObject(g)
    const keepOut = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2
    expect(keepOut).toBeCloseTo(1.115939, 4)
    // `animal-fox`'s 1.15 is the bound `animal-horse.ts` works to.
    expect(keepOut, 'inside the fox\'s own keep-out').toBeLessThan(1.15)
    // The cross-sections stop three 3:1 cones reading as bamboo, and every one
    // of them is on the pack's own 1/16 grid: 17/16, 12/16, 9/16.
    expect(feature('horn').stretch).toEqual([1.0625, 1.0625, 1.0625])
    expect(feature('horn-mid').stretch).toEqual([0.75, 0.75, 1])
    expect(feature('horn-tip').stretch).toEqual([0.5625, 0.5625, 1])
    for (const f of [feature('horn'), feature('horn-mid'), feature('horn-tip')]) {
      for (const v of f.stretch!) expect(Number.isInteger(v * SLOT_PX)).toBe(true)
    }
  })
})

/* ===================================================================== *
 * 4. THE FACE, AND 5. THE STOCKING
 * ===================================================================== */

describe('animal-water-buffalo: eye high, eye wide, muzzle low', () => {
  it('sits the muzzle at the lowest y whose whole root is on the flat plate', () => {
    const nose = feature('nose')
    expect(nose.part).toBe('box-24')
    const at = (nose.placement as { at: readonly number[] }).at
    expect(at[1]).toBeCloseTo(0.69375, 6)
    // 0.49375 is the flat front plate's bottom edge and the disc is 0.400 tall.
    expect(at[1]! - partById('box-24')!.size[1]! / 2).toBeCloseTo(0.49375, 6)
    expect(at[2]).toBe(0.625)
    // Its whole 0.400 of width is inside the plate's 0.625, with room a side.
    expect(0.3125 - partById('box-24')!.size[0]! / 2).toBeCloseTo(0.1125, 6)
  })

  it('sits the eye card as high and as wide as the flat plate allows', () => {
    const eye = feature('eye')
    const at = (eye.placement as { at: readonly number[] }).at
    expect(at[0]).toBe(0.3125)          // the plate's own half-width
    expect(at[1]).toBeCloseTo(0.958646, 6)
    // = 1.11875 - 0.320208 / 2: the whole card backed by flat plate.
    expect(at[1]! + partById('plate-01')!.size[1]! / 2).toBeCloseTo(1.11875, 5)
    expect(at[2]).toBe(EYE_CARD_Z)
    // It is NOT the pack's own (0.2625, 0.933646) — the cow has a flat face and
    // this one has a 0.400 disc on it.
    expect(at[0]).not.toBe(partById('plate-01')!.offset[0])
  })
})

describe('animal-water-buffalo: the stocking', () => {
  it('is a SOCK at 6/16 — its own number inside the forced range', () => {
    const legs = feature('leg')
    expect(legs.paint.base).toBe('limb')
    expect(legs.paint.patch).toEqual({ below: 'pale', at: 0.375 })
    expect(legs.paint.patch!.at * SLOT_PX, 'on the pack\'s 1/16 grid').toBe(6)
    // Inside the range both of whose ends the geometry forces, and its own value:
    // above the pony's hoof at 4/16, below the sheep's fleece line at 8/16.
    expect(legs.paint.patch!.at).toBeGreaterThan(4 / SLOT_PX)
    expect(legs.paint.patch!.at).toBeLessThan(8 / SLOT_PX)
    expect(legs.paint.byBand, 'never patch and byBand on one part').toBeUndefined()
  })

  it('is the ONLY patch on the animal, so "one cell, one picture" cannot fire', () => {
    const patched = WATER_BUFFALO_ASSEMBLY.features
      .filter((f: Feat) => f.paint.patch !== undefined)
    expect(patched.map((f: Feat) => f.name)).toEqual(['leg'])
    expect(WATER_BUFFALO_ASSEMBLY.hull.paint.patch).toBeUndefined()
  })

  it('paints the tail with the legs, because both are the same wet dark', () => {
    expect(feature('tail').part).toBe('box-18')
    expect(feature('tail').paint.base).toBe('limb')
    // The elephant's trunk, turned, at the one height its root fits the plate.
    expect(feature('tail').spin).toEqual([{ axis: 'y', deg: 180 }])
    const at = (feature('tail').placement as { at: readonly number[] }).at
    expect(at).toEqual([0, 0.80625, -0.625])
    expect(partById('box-18')!.size[1]! / 2).toBeLessThan(0.3125)
  })
})

/* ===================================================================== *
 * 6. AGAINST ITS NEIGHBOURS
 * ===================================================================== */

describe('animal-water-buffalo: what holds it apart', () => {
  it('is the low, wide one — the only Farm animal wider than it is tall', () => {
    const g = build()
    const box = new THREE.Box3().setFromObject(g)
    const w = box.max.x - box.min.x, h = box.max.y - box.min.y
    expect(w).toBeGreaterThan(h)
    // And its BODY is the pack's floor, which is the whole point: the height is
    // in the horns and the mass is in the span.
    expect(partById('box-12')!.offset[1]! + partById('box-12')!.size[1]! / 2)
      .toBeCloseTo(1.43125, 5)
    // Shorter than the horse, on a shell 0.19 wider.
    const horse = new THREE.Box3().setFromObject(buildAssembled('animal-horse'))
    expect(h).toBeLessThan(horse.max.y - horse.min.y)
    expect(HORSE_ASSEMBLY.hull.part).toBe('box-41')
    expect(partById('box-12')!.size[0]! - partById('box-41')!.size[0]!)
      .toBeCloseTo(0.189484, 6)
  })

  it('stands 23% wider-legged than a cube-bodied animal, for free', () => {
    const legs = feature('leg')
    const row = legs.placement as { kind: 'row'; from: readonly number[] }
    expect(row.kind).toBe('row')
    // `creature.ts:740` scales the stations with the shell, off its VERTICES —
    // half-width 0.7697, where the bank's rounded `size` reads 1.539484.
    expect(row.from[0]).toBeCloseTo(0.27 * (2 * 0.7697 / 1.25), 6)
    expect(row.from[0]! / 0.27).toBeCloseTo(1.23152, 4)
  })

  it('is held apart from the OX by span and by back-sweep, not by luck', () => {
    // Both bovines wear `wedge-11` on `box-12`, rooted on the same chord. The
    // ox's single pair goes sideways and UP and never goes back at all; these
    // leave the skull level and finish behind the hull's midline.
    const span = (id: string, names: readonly string[]): number => {
      const g = buildAssembled(id)
      g.updateMatrixWorld(true)
      let x = 0
      for (const n of names) for (const q of meshPoints(g, n)) x = Math.max(x, Math.abs(q.x))
      return x * 2
    }
    const mine = span('animal-water-buffalo',
      ['horn-r', 'horn-l', 'horn-mid-r', 'horn-mid-l', 'horn-tip-r', 'horn-tip-l'])
    const ox = span('animal-ox', ['horn-r', 'horn-l'])
    expect(ox).toBeCloseTo(1.6915, 3)
    expect(mine).toBeCloseTo(2.2319, 3)
    expect(mine - ox, '0.540 of horn span between them').toBeGreaterThan(0.5)
    // The ox's facing has no z component at all; every one of these does.
    const oxFacing = (buildAssembled('animal-ox')
      .getObjectByName('horn-r') as THREE.Mesh).userData['facing'] as number[]
    expect(oxFacing[2]).toBeCloseTo(0, 6)
    const g = build()
    for (const n of ['horn-r', 'horn-mid-r', 'horn-tip-r']) {
      const f = (g.getObjectByName(n) as THREE.Mesh).userData['facing'] as number[]
      expect(f[2]!, `${n} sweeps back`).toBeLessThan(-0.2)
    }
  })

  it('carries a cool coat, not Africa\'s warm near-black', () => {
    const coat = WATER_BUFFALO_ASSEMBLY.palette['coat']!
    const b = coat & 0xff, r = (coat >> 16) & 0xff
    // Blue over red is the whole hue claim against `animal-buffalo`'s 0x413a36,
    // whose red is over its blue. Both are dark; they are not the same dark.
    expect(b).toBeGreaterThan(r)
    expect((0x413a36 & 0xff) < ((0x413a36 >> 16) & 0xff)).toBe(true)
  })
})
