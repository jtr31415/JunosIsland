/**
 * The assembled squirrel — what is true of THIS animal and nothing else.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`, called once below: one mass, lineage back to the bank,
 * the absolute eye card, no transform on a placed node, rule 9's budgets, the
 * detached texture, the measured pupil, the leg row, and the height band checked
 * first. They were four hundred lines of the hedgehog's file and two hundred of
 * this one, re-derived, and about to be re-derived eleven more times.
 *
 * The hedgehog proved repeat-and-sink. This animal exists to prove the other half
 * (`docs/building-animals-from-parts.md` §6), so the assertions left here are the
 * ones about those two things, and nothing asserts that a function was called:
 *
 *   1. THE TAIL WAS FOUND BY MEASUREMENT. `BRUSH_QUERY` names no species, no
 *      role and no form, and this file pins what it returns — three shapes out
 *      of 129 — and then pins the three measurements that chose between them.
 *      A query that quietly stops discriminating is the failure that matters.
 *   2. THE TAIL IS CARRIED UP, ON THE CUBE'S MEASURED CHAMFER. §8's idiom on a
 *      new edge: the join is the +y/-z chamfer's midpoint and the facing is that
 *      plane's outward normal, both derived from `box-03`'s own 32 points. This
 *      is the whole difference between a squirrel and the fox it borrows the
 *      shape from, so it is measured off the built vertices.
 *   3. THE BELLY BOUNDARY IS PAINTED, NOT CUT. §4's second way in, which nothing
 *      had used. The test asserts the hull gained NO geometry, that the line
 *      sits at the hull's own equator, and that the equator is the one point on
 *      the pack's 1/16 grid inside the tiger's measured belly zone — re-derived
 *      here from the bank rather than quoted.
 *   4. EVERY OTHER PLACEMENT IS A DONOR'S OWN NUMBER. The ear, the muzzle and
 *      the eye card each land on the offset the pack recorded for that shape.
 *      Where that is a recovery rather than a copy — the ear — the recovery is
 *      what is asserted, because it is evidence and the copy would not be.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  assembledSpecies, buildAssembled, buildAssembly, findShapes, BRUSH_QUERY,
  SQUIRREL_ASSEMBLY, PACK_PUPIL, SLOT_PX, SLOT_W, patchUv, EYE_CARD_Z,
  type AssemblyBuild,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { GARDEN_SPECIES } from '../../src/island/species/collections/garden'
import { SPECIES_NAMES } from '../../src/island/species/roster'
import { assertAssembly } from './assembly-assert'

/* ------------------------------------------------------ the shared floor --- */

/**
 * Every invariant the method has, on this animal. Unlike the hedgehog it strains
 * none of the budgets, so there is nothing to declare.
 */
assertAssembly({
  id: 'animal-squirrel',
  parts: ['box-01', 'box-03', 'box-23', 'cone-01', 'plate-01', 'tube-01', 'wedge-06'],
  height: 1.9763,
  verts: 452,
  tris: 597,
  // The tail is the biggest thing after the hull — it is meant to be — but a
  // squirrel is not two bodies. The 72 were scrapped for a head box beside a body
  // box at roughly a quarter of its volume; this is under a third of it and it is
  // not on the neck. `assertAssembly` also checks the exact guard that catches
  // the real fault: no feature wears a shape the pack used as a hull.
  massRatio: 3,
  // One spun feature, and it is the whole silhouette.
  spinsAtLeast: 1,
})

/* ---------------------------------------------------------------- tools --- */

type P3 = readonly [number, number, number]

const meshesOf = (g: THREE.Object3D): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh) })
  return out
}

const posOf = (m: THREE.Mesh): P3[] => {
  const a = m.geometry.getAttribute('position')
  const out: P3[] = []
  for (let i = 0; i < a.count; i++) out.push([a.getX(i), a.getY(i), a.getZ(i)])
  return out
}

const referenced = (p: BakedPart): P3[] => {
  const seen = new Set<number>()
  const out: P3[] = []
  for (const vi of p.indices) {
    if (seen.has(vi)) continue
    seen.add(vi)
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/**
 * A rigid-motion invariant fingerprint: distances from the vertex centroid.
 *
 * Written out here rather than imported from the hedgehog's file. A shared
 * helper lets a bug in the helper agree with itself, which is the reason
 * `parts-bank.test.ts` duplicates its glTF reader too.
 */
function fingerprint(ps: readonly P3[]): string[] {
  const seen = new Map<string, P3>()
  for (const p of ps) seen.set(p.map(n => Math.round(n * 1000) / 1000).join(','), p)
  const u = [...seen.values()]
  const c = u.reduce((a, p) => [a[0] + p[0] / u.length, a[1] + p[1] / u.length,
    a[2] + p[2] / u.length] as P3, [0, 0, 0] as P3)
  return u.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]).toFixed(3)).sort()
}

/**
 * Why world-space comparisons here are to four decimals and not six.
 *
 * The group is grounded by translating until its bounding box's floor is zero,
 * and that box is measured on FLOAT32 attributes — so the feet, which the solve
 * puts at exactly 0, come back at 2.95e-5 and the whole animal is shifted down
 * by that much. It is one rounding step of a float32 near 0.18, it applies
 * equally to every mesh, and it is not a placement error. Four decimals is still
 * four orders below the 1/16 grid the pack is authored on, so a placement that
 * was genuinely wrong could not hide inside it.
 */
const world = (o: THREE.Object3D): THREE.Vector3 => {
  o.updateMatrixWorld(true)
  return o.getWorldPosition(new THREE.Vector3())
}

const worldBox = (o: THREE.Object3D): THREE.Box3 => {
  o.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(o)
}

const named = (g: THREE.Group, prefix: string): THREE.Mesh[] =>
  meshesOf(g).filter(m => m.name === prefix || m.name.startsWith(`${prefix}-`))

const build = (): THREE.Group => {
  const g = buildAssembled('animal-squirrel')
  g.updateMatrixWorld(true)
  return g
}

const thinnest = (p: BakedPart): number => Math.min(...p.size)

/* ------------------------------------------------------------- the mass --- */

describe('the assembled squirrel is ONE mass, and it is cubic', () => {
  it('carries exactly one tail, and it is a detail rather than a second body', () => {
    expect(SQUIRREL_ASSEMBLY.features.filter(f => f.name === 'tail')).toHaveLength(1)
    // `box-23` is filed `tail`, never `hull` — which is the exact statement
    // `assertAssembly` makes about the fault that scrapped the 72, and the
    // reason a raised tail a third of the hull's volume is not that fault.
    expect(partById('box-23')!.roles).toContain('tail')
    expect(partById('box-23')!.roles).not.toContain('hull')
  })

  it('wears the authored 1.250 cube with no stretch and nothing to explain', () => {
    const g = build()
    const s = worldBox(g.getObjectByName('hull')!).getSize(new THREE.Vector3())
    expect(partById('box-03')!.size).toEqual([1.25, 1.25, 1.25])
    expect(s.x).toBeCloseTo(1.25, 3)
    expect(s.y).toBeCloseTo(1.25, 3)
    expect(s.z).toBeCloseTo(1.25, 3)
    // Joe rejected a stretched hull once ("body cubic, its currently too wide")
    // and the second species is where that ruling either holds or quietly goes.
    expect(SQUIRREL_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(g.userData['hullStretchWhy']).toBeUndefined()
    expect(assembledSpecies().find(r => r.id === 'animal-squirrel')!.hullStretchWhy)
      .toBeUndefined()
    // The same solve the hedgehog runs: leg 0.30625 tall, sunk 0.408163, feet on
    // zero puts a 1.250 cube's centre at 0.80625 — `box-03`'s own recorded offset.
    expect(SQUIRREL_ASSEMBLY.hull.at[1]).toBeCloseTo(partById('box-03')!.offset[1], 5)
  })
})

/* ---------------------------------------------------------- the tail ------ */

describe('the tail was found by measurement, not by name', () => {
  it('returns exactly three shapes, and all three are tails', () => {
    const hits = findShapes(BRUSH_QUERY)
    expect(hits.map(p => p.id)).toEqual(['wedge-03', 'box-23', 'box-38'])
    for (const p of hits) expect(p.roles, p.id).toContain('tail')
    // No species, no role, no form in the query itself — §3.2's discipline.
    expect(Object.keys(BRUSH_QUERY).sort())
      .toEqual(['attachAxis', 'attachDir', 'minLongest', 'minThinnest'])
  })

  it('needs minThinnest — longest and taper cannot tell a plume from a whip', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    // The pack's seven tails fall into two clean groups on absolute thickness —
    // four thin ones at 0.200-0.345 and three thick ones at 0.589-0.744, a 1.7x
    // gap with nothing inside it.
    const thin = tails.map(thinnest).sort((a, b) => a - b)
    expect(thin[3]).toBeLessThan(0.35)
    expect(thin[4]).toBeGreaterThan(0.55)
    // And on the two axes that were already there, the fox's brush and the
    // tiger's whip are neighbours — which is the whole reason the axis was added.
    const brush = partById('box-23')!, whip = partById('wedge-18')!
    expect(Math.abs(brush.shape.longest - whip.shape.longest)).toBeLessThan(0.14)
    expect(findShapes({ minLongest: 0.8, attachAxis: 'z', attachDir: -1 }).map(p => p.id))
      .toContain('wedge-18')
    expect(findShapes(BRUSH_QUERY).map(p => p.id)).not.toContain('wedge-18')
  })

  it('chooses the fox brush on three measurements and no names', () => {
    const [beaver, fox, parrot] =
      ['wedge-03', 'box-23', 'box-38'].map(id => partById(id)!) as [BakedPart, BakedPart, BakedPart]
    // 1. It barely narrows: a plume holds its bulk to the tip.
    expect(fox.shape.taper).toBeGreaterThan(parrot.shape.taper)
    expect(fox.shape.taper).toBeGreaterThan(beaver.shape.taper)
    expect(fox.shape.taper).toBeGreaterThan(0.95)
    // 2. Its section is ROUND — y and z identical to six decimals. A fan and a
    //    paddle are blades; a squirrel's tail is a cylinder of fur.
    expect(fox.size[1]).toBeCloseTo(fox.size[2], 6)
    for (const p of [beaver, parrot]) {
      expect(Math.abs(p.size[1] / p.size[2] - 1), p.id).toBeGreaterThan(0.4)
    }
    // 3. It is the biggest, and the brief for this animal is that the tail
    //    carries it.
    const vol = (p: BakedPart) => p.size[0] * p.size[1] * p.size[2]
    expect(vol(fox) / vol(parrot)).toBeGreaterThan(1.6)
    expect(vol(fox) / vol(beaver)).toBeGreaterThan(1.6)
    expect(named(build(), 'tail')[0]!.userData['part']).toBe('box-23')
  })
})

describe('the tail is CARRIED UP, on the cube\'s own measured chamfer', () => {
  it('joins the +y/-z edge chamfer at its midpoint, which is not where it looks', () => {
    // `box-03` cuts every edge AND every corner (rule 2). Its 32 welded points
    // are the permutations of (+/-0.625, +/-0.3125, +/-0.3125) and (+/-0.5,
    // +/-0.5, +/-0.5), so each flat face is only 0.625 square and the chamfer
    // between the +y and -z faces runs (0.625, -0.3125) to (0.3125, -0.625).
    // Midpoint (0.46875, -0.46875) — the same 0.46875 the hedgehog's rows use,
    // because it is the same cube, on a different edge.
    const shells = new Set(referenced(partById('box-03')!).map(p =>
      p.map(Math.abs).sort((a, b) => b - a).map(n => n.toFixed(4)).join(',')))
    expect([...shells].sort()).toEqual(['0.5000,0.5000,0.5000', '0.6250,0.3125,0.3125'])

    const g = build()
    const j = named(g, 'tail')[0]!.userData['joinedAt'] as [number, number, number]
    const cy = SQUIRREL_ASSEMBLY.hull.at[1]
    expect(j[0]).toBeCloseTo(0, 6)
    expect(j[1] - cy).toBeCloseTo(0.46875, 6)
    expect(j[2]).toBeCloseTo(-0.46875, 6)
    // ON the chamfer plane, which is y - z = 0.9375 in hull-local terms.
    expect((j[1] - cy) - j[2]).toBeCloseTo(0.9375, 6)
  })

  it('points along that chamfer\'s outward normal, and the spin is what turned it', () => {
    const g = build()
    const tail = named(g, 'tail')[0]!
    // `box-23` is measured `z -1`, so an UNSPUN copy trails backwards, which is
    // exactly how the fox wears it. The 45-degree spin is the whole animal.
    expect(partById('box-23')!.attachment!.axis).toBe('z')
    expect(partById('box-23')!.attachment!.dir).toBe(-1)
    const f = tail.userData['facing'] as [number, number, number]
    expect(Math.hypot(f[0], f[1], f[2])).toBeCloseTo(1, 6)
    expect(f[0]).toBeCloseTo(0, 6)
    expect(f[1]).toBeCloseTo(Math.SQRT1_2, 6)
    expect(f[2]).toBeCloseTo(-Math.SQRT1_2, 6)
    // Rule 4 as amended: the rotation lives in the vertices, and the shape is
    // still rigidly the pack's after it. Rotation-invariant, so this holds
    // without consulting the declared spin at all.
    expect(fingerprint(posOf(tail))).toEqual(fingerprint(referenced(partById('box-23')!)))
    expect(tail.quaternion.toArray()).toEqual([0, 0, 0, 1])
    expect(tail.scale.toArray()).toEqual([1, 1, 1])
  })

  it('buries it by the fox\'s own measured amount, and nothing floats', () => {
    const g = build()
    const tail = named(g, 'tail')[0]!
    const part = partById('box-23')!
    expect(SQUIRREL_ASSEMBLY.features.find(f => f.name === 'tail')!.sink)
      .toBeCloseTo(part.attachment!.sunkFractionMean, 6)
    const f = tail.userData['facing'] as [number, number, number]
    const j = tail.userData['joinedAt'] as [number, number, number]
    const p = tail.geometry.getAttribute('position')
    let lo = Infinity
    for (let i = 0; i < p.count; i++) {
      lo = Math.min(lo, p.getX(i) * f[0] + p.getY(i) * f[1] + p.getZ(i) * f[2])
    }
    const near = (tail.position.x * f[0] + tail.position.y * f[1] + tail.position.z * f[2]) + lo
    const buried = (j[0] * f[0] + j[1] * f[1] + j[2] * f[2]) - near
    expect(buried / part.size[2]).toBeCloseTo(part.attachment!.sunkFractionMean, 4)
    // §3: "every eared species embeds its ear into the hull by at least 0.125".
    expect(buried).toBeGreaterThan(0.125)
  })

  it('is the animal — tallest thing on it, and above the ears', () => {
    const g = build()
    const top = worldBox(g).max.y
    expect(worldBox(named(g, 'tail')[0]!).max.y).toBeCloseTo(top, 6)
    expect(top - worldBox(named(g, 'ear')[0]!).max.y).toBeGreaterThan(0.3)
    // And it goes UP rather than back, which is what stops it being the fox. The
    // fox wears this exact shape at z = -0.918642 trailing behind its hull; the
    // squirrel's centre is 0.24 further FORWARD and 0.61 higher.
    const fox = partById('box-23')!.offset
    const c = named(g, 'tail')[0]!.position
    expect(c.z).toBeGreaterThan(fox[2])
    expect(c.y).toBeGreaterThan(fox[1] + 0.5)
  })

  it('stays SHORTER front-to-back than the fox it stands beside', () => {
    // `pets.ts:652` charges obstacle keep-out from `max(width, depth) / 2`, so
    // depth is the number a long animal pays for. The fox's own parts put it at
    // 1.15: its tail reaches z = -1.3737 and its nose-tip z = +0.9347.
    const foxTail = partById('box-23')!, foxNose = partById('box-22')!
    const foxDepth = (foxNose.offset[2] + foxNose.size[2] / 2)
      - (foxTail.offset[2] - foxTail.size[2] / 2)
    expect(foxDepth / 2).toBeGreaterThan(1.1)

    const b = worldBox(build())
    const keepout = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2
    expect(keepout).toBeLessThan(foxDepth / 2)
    expect(keepout).toBeLessThan(0.95)
  })
})

/* ------------------------------------------------- the painted boundary --- */

describe('the belly boundary is PAINTED into the image (§4, way two)', () => {
  it('adds no geometry at all — the hull is still box-03\'s 32 welded points', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    const part = partById('box-03')!
    const welded = new Set<string>()
    for (const vi of new Set(part.indices)) {
      welded.add([part.positions[vi * 3], part.positions[vi * 3 + 1], part.positions[vi * 3 + 2],
        part.normals[vi * 3], part.normals[vi * 3 + 1], part.normals[vi * 3 + 2]].join(','))
    }
    // This is the whole point of painting rather than splitting. The hedgehog's
    // hull and the squirrel's are the SAME 32 vertices and the same 60
    // triangles; one of them has a two-tone coat.
    expect(hull.geometry.getAttribute('position').count).toBe(welded.size)
    expect(hull.geometry.getAttribute('position').count).toBe(32)
    expect(hull.geometry.getIndex()!.count / 3).toBe(part.tris)
  })

  it('reads ACROSS one cell — many rows, all of them the coat\'s', () => {
    const g = build()
    const uv = (g.getObjectByName('hull') as THREE.Mesh).geometry.getAttribute('uv')
    const slots = Object.keys(SQUIRREL_ASSEMBLY.palette)
    const i = slots.indexOf('coat')
    const vs = new Set<number>()
    for (let k = 0; k < uv.count; k++) {
      expect(uv.getX(k)).toBeCloseTo(0.5, 6)
      vs.add(uv.getY(k))
    }
    // More than one, or nothing painted in the cell could ever be seen — which
    // is the correction this build makes to texture.ts's old note.
    expect(vs.size).toBeGreaterThan(1)
    // And every one of them INSIDE the coat cell, inset by half a texel, so no
    // vertex can sample the slot next door.
    for (const v of vs) {
      expect(v).toBeGreaterThanOrEqual((i * SLOT_PX + 0.5) / (slots.length * SLOT_PX))
      expect(v).toBeLessThanOrEqual((i * SLOT_PX + SLOT_PX - 0.5) / (slots.length * SLOT_PX))
    }
    // The hedgehog, which paints no boundary, still reads exactly one point.
    const hog = buildAssembled('animal-hedgehog')
    const huv = (hog.getObjectByName('hull') as THREE.Mesh).geometry.getAttribute('uv')
    const hvs = new Set<string>()
    for (let k = 0; k < huv.count; k++) hvs.add(huv.getY(k).toFixed(6))
    expect(hvs.size).toBe(1)
  })

  it('puts the line on the hull\'s own equator, exactly', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    const slots = Object.keys(SQUIRREL_ASSEMBLY.palette)
    const i = slots.indexOf('coat')
    const uv = hull.geometry.getAttribute('uv')
    const pos = hull.geometry.getAttribute('position')

    // `v` is an affine function of y and barycentric interpolation of an affine
    // function is exact, so the boundary is a PLANE and this recovers it: solve
    // for the y whose v lands on the texel edge above row 8.
    const edge = (i * SLOT_PX + SLOT_PX * 0.5) / (slots.length * SLOT_PX)
    const a = { y: pos.getY(0), v: uv.getY(0) }
    let b = a
    for (let k = 1; k < uv.count; k++) {
      if (Math.abs(uv.getY(k) - a.v) > 1e-9) { b = { y: pos.getY(k), v: uv.getY(k) } }
    }
    const yAtEdge = a.y + (edge - a.v) * (b.y - a.y) / (b.v - a.v)
    // Local y = 0 is the cube's own mid-height, and the hull sits at 0.80625.
    expect(yAtEdge).toBeCloseTo(0, 6)
    expect(patchUv(i, slots.length, 0.5)[1]).toBeCloseTo(edge, 9)
  })

  it('draws the cell as exactly two colours, stepping at row 8 of 16', () => {
    const g = build()
    const img = ((g.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial)
      .map!.image as ImageData
    const slots = Object.keys(SQUIRREL_ASSEMBLY.palette)
    expect(img.width).toBe(SLOT_W)
    expect(img.height).toBe(slots.length * SLOT_PX)
    const row = (y: number): number => {
      const o = y * img.width * 4
      return (img.data[o]! << 16) | (img.data[o + 1]! << 8) | img.data[o + 2]!
    }
    const i = slots.indexOf('coat')
    for (let k = 0; k < SLOT_PX; k++) {
      const want = k < SLOT_PX / 2 ? SQUIRREL_ASSEMBLY.palette['belly'] : SQUIRREL_ASSEMBLY.palette['coat']
      expect(row(i * SLOT_PX + k), `coat cell row ${k}`).toBe(want)
    }
    // Every other cell is still flat: only the patched slot is two-tone.
    for (let s = 0; s < slots.length; s++) {
      if (s === i) continue
      for (let k = 0; k < SLOT_PX; k++) {
        expect(row(s * SLOT_PX + k), `${slots[s]} row ${k}`).toBe(SQUIRREL_ASSEMBLY.palette[slots[s]!])
      }
    }
  })

  it('takes 0.5 off the TIGER, and 0.5 is the only grid line in its zone', () => {
    // Re-derived here from the bank rather than quoted. Three of the pack's ten
    // hulls carry a pale underside; the tiger's is the mammal case, a belly
    // running the length of the body, which is the squirrel's case too.
    const tiger = partById('box-41')!
    const runs = new Map<number, { lo: number; hi: number }>()
    for (let t = 0; t < tiger.tris; t++) {
      const b = tiger.bands[t]!
      const r = runs.get(b) ?? { lo: Infinity, hi: -Infinity }
      for (let k = 0; k < 3; k++) {
        const y = tiger.positions[tiger.indices[t * 3 + k]! * 3 + 1]!
        r.lo = Math.min(r.lo, y); r.hi = Math.max(r.hi, y)
      }
      runs.set(b, r)
    }
    const frac = (y: number) => (y + tiger.size[1] / 2) / tiger.size[1]
    const paleTop = frac(runs.get(3)!.hi)     // band 3, the pale belly
    const darkBottom = frac(runs.get(15)!.lo) // band 15, the dark coat
    expect(paleTop).toBeCloseTo(0.548077, 5)
    expect(darkBottom).toBeCloseTo(0.480769, 5)

    // Kenney's boundary is not a line, it is a ZONE 0.067 of the hull deep,
    // because a split-triangle boundary can only follow edges the model has.
    // That is the argument for painting it, in one measurement.
    expect(paleTop - darkBottom).toBeGreaterThan(0.06)

    // And exactly one point on the pack's own 1/16 authoring grid falls inside.
    const inside = []
    for (let k = 1; k < SLOT_PX; k++) {
      if (k / SLOT_PX > darkBottom && k / SLOT_PX < paleTop) inside.push(k / SLOT_PX)
    }
    expect(inside).toEqual([0.5])
    expect(SQUIRREL_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
  })

  it('refuses a boundary that falls between two grid lines', () => {
    // A number nobody can quote back at the pack is a number nobody can check.
    const off: AssemblyBuild = {
      ...SQUIRREL_ASSEMBLY,
      hull: {
        ...SQUIRREL_ASSEMBLY.hull,
        paint: { base: 'coat', patch: { below: 'belly', at: 0.42 } },
      },
    }
    expect(() => buildAssembly(off)).toThrow(/1\/16 grid/)
  })
})

/* ------------------------------------------------------------- the face --- */

describe('every other placement is a donor\'s own recorded number', () => {
  it('wears the CAT\'s ear, and the join recovers the cat\'s offset', () => {
    const g = build()
    const ear = partById('wedge-06')!
    // The cat is this shape's only donor, so the recorded offset is unambiguous.
    expect(ear.provenance.map(p => p.species)).toEqual(['cat', 'cat'])
    // Joined at the cube's TOP FACE and sunk the cat's own 0.573575, the ear's
    // centre lands on the cat's own y to one part in a million. Nothing was
    // aimed at that; it is the evidence the cat wears this ear on this cube.
    const join = SQUIRREL_ASSEMBLY.features.find(f => f.name === 'ear')!.placement
    expect(join.kind).toBe('pair')
    expect((join as { at: readonly number[] }).at[1]).toBeCloseTo(0.80625 + 0.625, 6)
    for (const m of named(g, 'ear')) {
      expect(world(m).y).toBeCloseTo(ear.offset[1], 4)
      expect(Math.abs(world(m).x)).toBeCloseTo(ear.offset[0], 4)
      expect(world(m).z).toBeCloseTo(ear.offset[2], 4)
    }
    // Mirror-symmetric, so it is one mesh placed twice (rule 6).
    expect(ear.shape.symmetry).toBe('mirror')
    expect(named(g, 'ear')).toHaveLength(2)
    expect(named(g, 'ear')[1]!.userData['mirror']).toBe(true)
  })

  it('paints the cat\'s own inner ear from its own bands — §4\'s FIRST way', () => {
    // Five triangles of `wedge-06` are band 1, a patch on its front face. Both
    // of §4's routes to two-tone are on this one animal on purpose: the ear is
    // split at Kenney's edges, the hull is painted where there are none.
    expect(new Set(partById('wedge-06')!.bands)).toEqual(new Set([13, 1]))
    expect(SQUIRREL_ASSEMBLY.features.find(f => f.name === 'ear')!.paint.byBand)
      .toEqual({ 1: 'belly' })
    const uv = named(build(), 'ear')[0]!.geometry.getAttribute('uv')
    const vs = new Set<string>()
    for (let i = 0; i < uv.count; i++) vs.add(uv.getY(i).toFixed(6))
    expect(vs.size).toBe(2)
  })

  it('wears the BEAVER\'s muzzle, and the beaver\'s hull is literally this cube', () => {
    const g = build()
    const nose = partById('tube-01')!
    expect(nose.provenance.map(p => p.species)).toEqual(['beaver'])
    // `box-03`'s recorded offset is its FIRST donor's, and its first donor is
    // the beaver — so the height transfers with certainty rather than by
    // argument, which is the one thing the hedgehog's snout could not claim.
    expect(partById('box-03')!.provenance[0]!.species).toBe('beaver')
    expect(partById('box-03')!.offset[1]).toBeCloseTo(SQUIRREL_ASSEMBLY.hull.at[1], 5)
    // Joined at the cube's front face with the beaver's own sink of zero, the
    // muzzle's centre lands on the beaver's own point, all three axes.
    const snout = named(g, 'snout')[0]!
    expect(nose.attachment!.sunkFractionMax).toBe(0)
    expect(world(snout).x).toBeCloseTo(nose.offset[0], 6)
    expect(world(snout).y).toBeCloseTo(nose.offset[1], 4)
    expect(world(snout).z).toBeCloseTo(nose.offset[2], 4)
    // Blunt, not pointed: taper 1.000, the opposite of the hedgehog's cone-06.
    expect(nose.shape.taper).toBe(1)
    expect(partById('cone-06')!.shape.taper).toBe(0)
  })

  it('puts the eye card at ITS OWN recorded offset, in all three axes', () => {
    // `assertAssembly` pins z, the card's own size and the absence of any scale
    // on every species. What is the squirrel's is that it did not CHOOSE the
    // height: the hedgehog picked 0.95, and this lands on `plate-01`'s own
    // recorded x and y, the one point the sixteen species that donate it share.
    const g = build()
    const card = partById('plate-01')!
    for (const e of named(g, 'eye')) {
      expect(world(e).z).toBeCloseTo(EYE_CARD_Z, 4)
      expect(world(e).y).toBeCloseTo(card.offset[1], 4)
      expect(Math.abs(world(e).x)).toBeCloseTo(card.offset[0], 4)
    }
    expect(SQUIRREL_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
  })

  it('makes the tufts out of the hedgehog\'s spike, on the ear\'s own apex', () => {
    // §3.1: a part's identity is its placement, not Kenney's label. This shape
    // is filed as the bee's antenna, was used as twenty hedgehog spines, and is
    // an ear tuft here — the multiplier paying out a third time.
    const spike = partById('cone-01')!
    expect(spike.roles).toContain('ear')
    expect(spike.provenance.map(p => p.species)).toContain('bee')
    const g = build()
    const ear = partById('wedge-06')!
    const apex = ear.offset[1] + Math.max(...referenced(ear).map(p => p[1]))
    const join = SQUIRREL_ASSEMBLY.features.find(f => f.name === 'tuft')!.placement
    expect((join as { at: readonly number[] }).at[1]).toBeCloseTo(apex, 5)
    for (const t of named(g, 'tuft')) {
      expect(t.userData['part']).toBe('cone-01')
      expect(t.userData['sink']).toBeCloseTo(spike.attachment!.sunkFractionMean, 6)
      // They cost nothing in height: the tail is still the tallest thing.
      expect(worldBox(t).max.y).toBeLessThan(worldBox(g).max.y)
    }
    expect(named(g, 'tuft')).toHaveLength(2)
  })

})

/* --------------------------------------------------------- the discipline --- */

describe('the spin lives in the vertices, and it is the whole silhouette', () => {
  it('spins the TAIL and nothing else', () => {
    // `assertAssembly` checks that no node carries a rotation or a scale and
    // that at least one feature is spun, so the check is not vacuous. Which
    // feature is this animal's own claim: on a squirrel the spin IS the animal.
    expect(SQUIRREL_ASSEMBLY.features.filter(f => (f.spin ?? []).length > 0)
      .map(f => f.name)).toEqual(['tail'])
  })

  it('turns the spun tail\'s normals with its vertices', () => {
    const g = build()
    const n = named(g, 'tail')[0]!.geometry.getAttribute('normal')
    const part = partById('box-23')!
    // Unspun, `box-23`'s normals are symmetric in y and z. Spun 45 degrees about
    // x they must have come with the vertices — a part lit by unspun normals is
    // lit from the wrong side and no bounding box notices.
    let maxY = -Infinity
    for (let i = 0; i < n.count; i++) maxY = Math.max(maxY, n.getY(i))
    let was = -Infinity
    for (const vi of new Set(part.indices)) {
      const [ny, nz] = [part.normals[vi * 3 + 1]!, part.normals[vi * 3 + 2]!]
      was = Math.max(was, ny * Math.SQRT1_2 - nz * Math.SQRT1_2)
    }
    expect(maxY).toBeCloseTo(was, 3)
  })

  it('says in the viewer that it is near the top of the height band', () => {
    // `assertAssembly` pins the band, the budgets and the exact counts. The
    // claim here is §2's: this animal sits at 1.976 against a ceiling of 2.02
    // because the tail is carried up, that is a decision Joe may want to take
    // back, and the `flag` is where he reads it rather than a test file.
    expect(SQUIRREL_ASSEMBLY.flag).toMatch(/1\.98|1\.976/)
  })
})

/* --------------------------------------------------------------- roster --- */

describe('the roster stays the authority on names and facts', () => {
  it('reads its printed name off the roster', () => {
    // `assertAssembly` checks the name, the collection and the flag against the
    // roster on every species. The printed spelling is this file's own pin.
    const row = assembledSpecies().find(r => r.id === 'animal-squirrel')!
    expect(row.name).toBe(SPECIES_NAMES['animal-squirrel'])
    expect(row.name).toBe('Squirrel')
  })

  it('adds the assembly beside the scrapped kit build, changing nothing', () => {
    const sq = GARDEN_SPECIES.find(s => s.id === 'animal-squirrel')!
    expect(sq.assembly).toBe(SQUIRREL_ASSEMBLY)
    // JT-034 is Joe's to rule on; until then the old build stays exactly as it
    // shipped, byte for byte. A surface listing the new method must key off
    // `assembly`, never off the ABSENCE of `build` (§9.2).
    expect(sq.kit).toBe('quadruped')
    expect(sq.build).toEqual({
      kit: 'quadruped', height: 1.72, body: 0.85, head: 1.05, legs: 0.85,
      ears: 'tufted', tail: 'bushy',
      palette: { coat: 0xc4692f, belly: 0xfbf1e2, detail: 0x9c4a1e, accent: 0x6e3413 },
    })
    // Every colour on the assembly is one of the record's own, or the measured
    // pupil. Nothing here invented a colour.
    const signed = new Set(Object.values(sq.build!.palette as unknown as Record<string, number>))
    for (const [slot, c] of Object.entries(SQUIRREL_ASSEMBLY.palette)) {
      expect(signed.has(c) || c === PACK_PUPIL, `${slot} is a new colour`).toBe(true)
    }
  })
})
