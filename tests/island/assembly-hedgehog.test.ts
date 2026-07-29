/**
 * The assembled hedgehog, checked against the bank it claims to be made of.
 *
 * Four dead features shipped in this repo behind tests that only proved a mock
 * ran, so nothing below asserts that a function was called. Every assertion here
 * measures the geometry that came out and compares it to a number that was
 * measured off Kenney's own `.glb` files — the same discipline
 * `tests/island/parts-bank.test.ts` applies to the bank itself.
 *
 * The seven that would catch a real regression, in the order they matter:
 *
 *   1. ONE MASS, AND IT IS THE AUTHORED CUBE. Two boxes at the neck is what
 *      scrapped the 72 (`docs/building-animals-from-parts.md` §0). And after
 *      Joe's "body cubic, its currently too wide", a hull that leaves its
 *      authored proportions is a compile error unless it says why — which this
 *      file pins from both directions.
 *   2. NOTHING AUTHORED. Every mesh's vertices are matched back to a bank record
 *      by position, not by the label the builder stapled on. A mesh whose
 *      `userData` says `box-03` and whose vertices are something else fails.
 *      Spun parts are matched twice: once rotation-invariantly, so the shape is
 *      the pack's whatever was done to it, and once against the declared spin.
 *   3. THE EYE IS ABSOLUTE. z = 0.6350 and the card's own 0.4000 x 0.3202, with
 *      no scale anywhere in the chain. Rule 5, and the one rule a fit-to-height
 *      would break silently.
 *   4. REPEAT-AND-SINK, FIVE ROWS OF FOUR. Joe's revised layout, each buried
 *      inside the range the pack itself demonstrated for that shape, and the
 *      five facings stepping 45 degrees through a half turn — which is the
 *      acceptance test for his stated intent, that the back read as CURVED.
 *   5. THE SPINES POINT BACKWARDS. Measured off the built vertices, not trusted
 *      from the spec, and compared against the unspun part to prove the spin is
 *      what turned them.
 *   6. THE PUPIL IS THE PACK'S. Re-derived on every run from the 24 real `.glb`
 *      files and the real `colormap.png`, because "we measured it once" is
 *      exactly the claim `parts-bank.test.ts` refuses to take on trust.
 *   7. THE TEXTURE IS DETACHED, NOT DISPOSED. Disposing one breaks every pet of
 *      the set including ones a child already owns (brief §19). A comment cannot
 *      enforce that, so the test listens for the `dispose` event and fails if it
 *      ever fires.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'
import { weldedComponents, componentFacts, orderComponents, namesFor }
  from '../../tools/workbench/public/anatomy'
import {
  assembledSpecies, buildAssembled, findShapes, SPIKE_QUERY,
  assemblyTextureCount, detachAssemblyTextures, HEDGEHOG_ASSEMBLY,
  buildAssembly, PACK_PUPIL, type AssemblyBuild, type Hull, type Spin,
} from '../../src/island/species/parts'
import { ASSEMBLED_BUILDS } from '../../src/island/species/parts/assembled'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { GARDEN_SPECIES } from '../../src/island/species/collections/garden'
import { SPECIES_NAMES, SPECIES_COLLECTION } from '../../src/island/species/roster'

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

/** Positions a part's indices actually reference, three at a time. */
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

const bbox = (ps: readonly P3[]): { min: P3; max: P3; size: P3 } => {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const p of ps) for (let i = 0; i < 3; i++) {
    if (p[i]! < min[i]!) min[i] = p[i]!
    if (p[i]! > max[i]!) max[i] = p[i]!
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] }
}

/**
 * Snap to a thousandth before comparing or ordering.
 *
 * Both halves of it are load-bearing and both were paid for. Float32 attributes
 * put the pack's 0.1135 back as 0.11349999, so a raw key straddles the rounding
 * boundary; and a 180-degree rotation leaves `sin` dust of 1e-16, which turns an
 * exact x = 0 into +/-2e-18 — enough for a sort that ties on x to stop tying, and
 * the two point lists then come out in DIFFERENT orders and compare as different
 * shapes. Snapping first makes the dust vanish and the tie hold.
 */
const snap = (n: number): number => Math.round(n * 1000) / 1000

const uniqueSorted = (ps: readonly P3[]): P3[] => {
  const seen = new Map<string, P3>()
  for (const p of ps) seen.set(p.map(n => snap(n)).join(','), p)
  return [...seen.values()].sort((a, b) =>
    snap(a[0]) - snap(b[0]) || snap(a[1]) - snap(b[1]) || snap(a[2]) - snap(b[2]))
}

/**
 * Rotate a point, the same way `assembly.ts` does. Written out here rather than
 * imported, so a wrong rotation in the kit cannot agree with itself.
 */
function turn(p: P3, s: Spin): P3 {
  const t = (s.deg * Math.PI) / 180
  const c = Math.cos(t), n = Math.sin(t)
  if (s.axis === 'x') return [p[0], p[1] * c - p[2] * n, p[1] * n + p[2] * c]
  if (s.axis === 'y') return [p[0] * c + p[2] * n, p[1], -p[0] * n + p[2] * c]
  return [p[0] * c - p[1] * n, p[0] * n + p[1] * c, p[2]]
}

/** Undo a spin list: reverse the order and negate every angle. */
const unspin = (ps: readonly P3[], spins: readonly Spin[]): P3[] => {
  const inverse = [...spins].reverse().map(s => ({ axis: s.axis, deg: -s.deg }))
  return ps.map(p => inverse.reduce(turn, p))
}

/**
 * A rigid-motion invariant fingerprint: distances from the vertex centroid.
 *
 * The centroid moves with the shape under any rotation, reflection or
 * translation, so this identifies a shape WITHOUT knowing what was done to it —
 * which is what makes "the spikes are still the pack's geometry" checkable
 * independently of the spin the builder claims.
 */
function fingerprint(ps: readonly P3[]): string[] {
  const u = uniqueSorted(ps)
  const c = u.reduce((a, p) => [a[0] + p[0] / u.length, a[1] + p[1] / u.length,
    a[2] + p[2] / u.length] as P3, [0, 0, 0] as P3)
  return u.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]).toFixed(3)).sort()
}

/**
 * Does this mesh's geometry come out of `part`, allowing a per-axis stretch and
 * an x-mirror — the only two things the kit is permitted to do to a part copy
 * beyond a declared spin, which the caller has already undone?
 *
 * The stretch is RECOVERED from the two bounding boxes rather than taken from
 * the spec, so a mesh that claims a stretch it does not have still fails.
 */
function isCopyOf(points: readonly P3[], part: BakedPart, mirror: boolean): boolean {
  const mp = mirror ? points.map(p => [-p[0], p[1], p[2]] as P3) : points
  const pp = referenced(part)
  const bm = bbox(mp), bp = bbox(pp)
  const s: P3 = [0, 1, 2].map(i =>
    bp.size[i]! < 1e-9 ? 1 : bm.size[i]! / bp.size[i]!) as unknown as P3
  const cm = uniqueSorted(mp.map(p => [
    p[0] - (bm.min[0] + bm.max[0]) / 2,
    p[1] - (bm.min[1] + bm.max[1]) / 2,
    p[2] - (bm.min[2] + bm.max[2]) / 2,
  ] as P3))
  const cp = uniqueSorted(pp.map(p => [
    p[0] * s[0] - (bp.min[0] + bp.max[0]) / 2 * s[0],
    p[1] * s[1] - (bp.min[1] + bp.max[1]) / 2 * s[1],
    p[2] * s[2] - (bp.min[2] + bp.max[2]) / 2 * s[2],
  ] as P3))
  if (cm.length !== cp.length) return false
  for (let i = 0; i < cm.length; i++) {
    for (let k = 0; k < 3; k++) if (Math.abs(cm[i]![k]! - cp[i]![k]!) > 2e-3) return false
  }
  return true
}

/** Which bank record this mesh's vertices came out of — found, not trusted. */
function traceToBank(mesh: THREE.Mesh): string | null {
  const spins = (mesh.userData['spin'] ?? []) as readonly Spin[]
  const raw = posOf(mesh)
  /* The kit builds M . R . v — spin, then mirror — so the inverse has to un-
   * mirror BEFORE it un-spins. Doing it the other way round recovers a shape
   * nothing in the bank matches, which is a true statement about the wrong
   * points. Both candidates are tried, so neither the spin nor the mirror is
   * taken on trust. */
  const candidates = [
    unspin(raw, spins),
    unspin(raw.map(p => [-p[0], p[1], p[2]] as P3), spins),
  ]
  for (const p of PARTS_BANK) {
    for (const c of candidates) if (isCopyOf(c, p, false)) return p.id
  }
  return null
}

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
  const g = buildAssembled('animal-hedgehog')
  g.updateMatrixWorld(true)
  return g
}

/* ------------------------------------------------------------- the mass --- */

describe('the assembled hedgehog is ONE mass', () => {
  it('has one hull and no second large shape', () => {
    const g = build()
    const vols = meshesOf(g)
      .map(m => {
        const s = worldBox(m).getSize(new THREE.Vector3())
        return { name: m.name, vol: s.x * s.y * s.z, part: m.userData['part'] as string }
      })
      .sort((a, b) => b.vol - a.vol)

    // The 72 were scrapped for emitting a head box and a body box and never
    // merging them. A separate head would be roughly a quarter of the hull's
    // volume; the largest detail here is a spike at a few percent of it.
    expect(vols[0]!.name).toBe('hull')
    expect(vols[0]!.vol / vols[1]!.vol).toBeGreaterThan(10)
    expect(meshesOf(g).filter(m => m.userData['role'] === 'hull')).toHaveLength(1)
  })

  it('is CUBIC — the authored 1.250 cube, with no stretch at all', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    const id = traceToBank(hull)
    expect(id).toBe('box-03')
    expect(partById(id!)!.roles).toContain('hull')
    // The 1.250 cube 14 of the 24 share, adapted (rule 1) rather than authored —
    // and after Joe's "body cubic, its currently too wide", not adapted at all.
    expect(partById('box-03')!.size).toEqual([1.25, 1.25, 1.25])
    const s = worldBox(hull).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.25, 3)
    expect(s.y).toBeCloseTo(1.25, 3)
    expect(s.z).toBeCloseTo(1.25, 3)
    expect(HEDGEHOG_ASSEMBLY.hull.stretch).toBeUndefined()
    // z is what keeps the eye card's absolute z real; x and y are Joe's note.
    expect(worldBox(hull).max.z).toBeCloseTo(0.625, 3)
  })

  it('sits where the pack itself puts this cube, because the solve says so', () => {
    // Not chosen. The pack's leg is 0.30625 tall with a measured sunkFractionMax
    // of 0.408163, so feet on zero wants the hull's bottom at 0.18125 and a
    // 1.250 cube's centre at 0.80625 — which is `box-03`'s own recorded offset.
    const leg = partById('box-01')!
    const foot = leg.size[1] * (1 - leg.attachment!.sunkFractionMax)
    expect(foot).toBeCloseTo(0.18125, 5)
    expect(foot + partById('box-03')!.size[1] / 2).toBeCloseTo(0.80625, 5)
    expect(HEDGEHOG_ASSEMBLY.hull.at[1]).toBeCloseTo(partById('box-03')!.offset[1], 5)
  })
})

/* -------------------------------------------- the hull stretch is guarded --- */

describe('a hull cannot leave its authored proportions quietly', () => {
  it('will not COMPILE a stretched hull that does not say why', () => {
    // @ts-expect-error `stretch` without `stretchWhy` is not a `Hull`. If this
    // line ever stops erroring, the type guard has been lost and `tsc` fails
    // HERE rather than in some future species nobody looks at.
    const unsaid: Hull = {
      part: 'box-03',
      paint: { base: 'coat' },
      at: [0, 0.80625, 0],
      stretch: [1.08, 0.92, 1] as [number, number, number],
    }
    expect(unsaid.part).toBe('box-03')
  })

  it('refuses to BUILD one either, for callers that are not TypeScript', () => {
    const sneaky = {
      ...HEDGEHOG_ASSEMBLY,
      hull: { ...HEDGEHOG_ASSEMBLY.hull, stretch: [1.08, 0.92, 1] },
    } as unknown as AssemblyBuild
    expect(() => buildAssembly(sneaky)).toThrow(/stretchWhy/)
  })

  it('builds one that does, and carries the reason out to the viewer', () => {
    const said: AssemblyBuild = {
      ...HEDGEHOG_ASSEMBLY,
      hull: {
        ...HEDGEHOG_ASSEMBLY.hull,
        stretch: [1.08, 0.92, 1],
        stretchWhy: 'the tiger\'s hull width, the widest the pack goes',
      },
    }
    const g = buildAssembly(said)
    expect(worldBox(g.getObjectByName('hull')!).getSize(new THREE.Vector3()).x)
      .toBeCloseTo(1.35, 3)
    expect(g.userData['hullStretchWhy']).toMatch(/tiger/)
    // And the shipped hedgehog says nothing, because it stretches nothing.
    expect(build().userData['hullStretchWhy']).toBeUndefined()
    expect(assembledSpecies()[0]!.hullStretchWhy).toBeUndefined()
  })
})

/* -------------------------------------------------------------- lineage --- */

describe('nothing in the hedgehog is authored', () => {
  it('traces every mesh back to a bank record by its vertices', () => {
    const g = build()
    const found = new Set<string>()
    for (const m of meshesOf(g)) {
      const id = traceToBank(m)
      expect(id, `${m.name} matches no shape in the bank`).not.toBeNull()
      // And it is the shape the builder SAYS it is.
      expect(id, `${m.name} claims ${m.userData['part']}`).toBe(m.userData['part'])
      found.add(id!)
    }
    expect([...found].sort())
      .toEqual(['box-01', 'box-03', 'cone-01', 'cone-06', 'plate-01', 'wedge-10'])
  })

  it('keeps a spun part rigid — its shape survives the rotation exactly', () => {
    const g = build()
    // Rotation-invariant, so this holds without consulting the declared spin at
    // all: whatever the kit did to a spike, it did not deform it.
    const want = fingerprint(referenced(partById('cone-01')!))
    for (const m of named(g, 'spike')) {
      expect(fingerprint(posOf(m)), m.name).toEqual(want)
    }
    expect(named(g, 'spike')).toHaveLength(20)
  })

  it('welds away the exporter\'s UV seams and nothing else', () => {
    const g = build()
    // §4 says we own the UVs, so a vertex split only to carry Kenney's atlas
    // coordinates carries nothing here. Position AND normal, never position
    // alone — rule 7's hard edges ARE one position with two normals.
    for (const m of meshesOf(g)) {
      const part = partById(m.userData['part'] as string)!
      const keys = new Set<string>()
      for (const vi of new Set(part.indices)) {
        keys.add([part.positions[vi * 3], part.positions[vi * 3 + 1], part.positions[vi * 3 + 2],
          part.normals[vi * 3], part.normals[vi * 3 + 1], part.normals[vi * 3 + 2]].join(','))
      }
      // How many slots this copy actually reads, measured off its own UVs rather
      // than assumed: a two-tone part legitimately splits a vertex per slot.
      const uv = m.geometry.getAttribute('uv')
      const rows = new Set<string>()
      for (let i = 0; i < uv.count; i++) rows.add(uv.getY(i).toFixed(6))
      const count = m.geometry.getAttribute('position').count
      expect(count, m.name).toBeLessThanOrEqual(keys.size * rows.size)
      expect(count, m.name).toBeLessThanOrEqual(part.verts)
    }
    // The spike is the one that matters: 68 stored, 24 distinct. Twenty copies
    // of 68 is 1,360 verts, over rule 9's measured body ceiling on its own.
    expect(named(g, 'spike')[0]!.geometry.getAttribute('position').count).toBe(24)
    expect(partById('cone-01')!.verts).toBe(68)
  })

  it('places by translation only — no node carries a rotation or a scale', () => {
    const g = build()
    expect(g.scale.toArray()).toEqual([1, 1, 1])
    expect(g.quaternion.toArray()).toEqual([0, 0, 0, 1])
    // The whole rig is grounded in y and nowhere else, so z stays absolute.
    expect(g.position.x).toBe(0)
    expect(g.position.z).toBe(0)
    for (const m of meshesOf(g)) {
      expect(m.scale.toArray(), m.name).toEqual([1, 1, 1])
      expect(m.quaternion.toArray(), m.name).toEqual([0, 0, 0, 1])
    }
    // And this is only worth anything because something IS rotated: rule 4 as
    // amended says the rotation lives in the vertices, and a build with no
    // rotation in it would pass the loop above for the wrong reason.
    expect(HEDGEHOG_ASSEMBLY.features.filter(f => (f.spin ?? []).length > 0).length)
      .toBeGreaterThanOrEqual(3)
  })

  it('is smooth-shaded on the pack\'s own normals, not recomputed ones', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    expect((hull.material as THREE.MeshStandardMaterial).flatShading).toBe(false)

    const n = hull.geometry.getAttribute('normal')
    const got = new Set<string>()
    for (let i = 0; i < n.count; i++) {
      got.add([n.getX(i), n.getY(i), n.getZ(i)].map(v => v.toFixed(3)).join(','))
    }
    const part = partById('box-03')!
    const want = new Set<string>()
    for (const vi of new Set(part.indices)) {
      want.add([part.normals[vi * 3]!, part.normals[vi * 3 + 1]!, part.normals[vi * 3 + 2]!]
        .map(v => v.toFixed(3)).join(','))
    }
    expect([...got].sort()).toEqual([...want].sort())
  })

  it('turns a spun part\'s normals with its vertices', () => {
    const g = build()
    const side = named(g, 'spike-side')[0]!
    const n = side.geometry.getAttribute('normal')
    let longest = -Infinity
    for (let i = 0; i < n.count; i++) longest = Math.max(longest, Math.abs(n.getX(i)))
    // Unspun, `cone-01` is thin in x and its normals lean that way; spun onto the
    // side it points x +1, so the normals must have come with it. Leaving them
    // behind lights the spike from the wrong side and no bounding box notices.
    const part = partById('cone-01')!
    let wasLongest = -Infinity
    for (const vi of new Set(part.indices)) {
      wasLongest = Math.max(wasLongest, Math.abs(part.normals[vi * 3 + 1]!))
    }
    expect(longest).toBeCloseTo(wasLongest, 3)
  })
})

/* ------------------------------------------------------------ the face --- */

describe('the eye cards are absolute (rule 5)', () => {
  it('sits at the pack\'s measured z = 0.6350, on the face and not in it', () => {
    const g = build()
    const eyes = named(g, 'eye')
    expect(eyes).toHaveLength(2)
    for (const e of eyes) expect(world(e).z).toBeCloseTo(0.635, 4)
    // The hull's front plane. 0.010 of daylight, which is what the pack does.
    const front = worldBox(g.getObjectByName('hull')!).max.z
    expect(front).toBeCloseTo(0.625, 3)
    expect(0.635 - front).toBeCloseTo(0.01, 3)
  })

  it('is never scaled — its size is the bank card\'s, to the digit', () => {
    const g = build()
    const card = partById('plate-01')!
    for (const e of named(g, 'eye')) {
      const s = worldBox(e).getSize(new THREE.Vector3())
      expect(s.x).toBeCloseTo(card.size[0], 4)
      expect(s.y).toBeCloseTo(card.size[1], 4)
      expect(s.z).toBeCloseTo(card.size[2], 4)
      expect(e.userData['stretch']).toEqual([1, 1, 1])
      expect(e.userData['sink']).toBe(0)
    }
    // And nothing in the spec can quietly grow one later.
    const eye = HEDGEHOG_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.stretch).toBeUndefined()
  })

  it('is one mesh mirrored, so the bank\'s two eye records collapse to one', () => {
    const g = build()
    const [r, l] = named(g, 'eye')
    const rp = uniqueSorted(posOf(r!).map(p => [-p[0], p[1], p[2]] as P3))
    const lp = uniqueSorted(posOf(l!))
    expect(rp).toHaveLength(lp.length)
    for (let i = 0; i < rp.length; i++) {
      for (let k = 0; k < 3; k++) expect(rp[i]![k]).toBeCloseTo(lp[i]![k]!, 4)
    }
    expect(world(r!).x).toBeCloseTo(-world(l!).x, 4)
  })
})

describe('the nose is higher, and the height is derived (Joe, 16:53)', () => {
  it('wears the parrot\'s beak exactly where the parrot wears it', () => {
    const g = build()
    const snout = named(g, 'snout')[0]!
    const beak = partById('cone-06')!
    // `cone-06` is the parrot's beak and the parrot's hull is `box-03` at the
    // same centre, so the donor's own placement transfers whole. §8 gives no
    // derivable y for a nose; this is the one donor that settles it.
    expect(partById('box-03')!.provenance.map(p => p.species)).toContain('parrot')
    expect(world(snout).y).toBeCloseTo(beak.offset[1], 4)
    expect(world(snout).z).toBeCloseTo(beak.offset[2], 4)
    expect(world(snout).x).toBeCloseTo(0, 6)
    // It shipped at y = 0.58. That is the "nose higher" in model units.
    expect(world(snout).y - 0.58).toBeGreaterThan(0.08)
  })

  it('still lands inside §8\'s derivable nose z of 1.080 +/- 0.074 of the hull', () => {
    const g = build()
    const hull = worldBox(g.getObjectByName('hull')!)
    const z = world(named(g, 'snout')[0]!).z
    const frac = (z - hull.min.z) / (hull.max.z - hull.min.z)
    expect(frac).toBeGreaterThan(1.080 - 0.074)
    expect(frac).toBeLessThan(1.080 + 0.074)
  })
})

describe('the pink pointy nose tip came out of the bank (Joe, 16:57)', () => {
  it('is a shape a size query returns, not something authored', () => {
    // Rule 1 is adapt-before-author, and "small sphere will do" is permission to
    // keep it simple rather than an instruction to author geometry. The query
    // names no species, no role and no form — only a size.
    const small = findShapes({ maxLongest: 0.22 }).map(p => p.id)
    expect(small).toContain('wedge-10')
    const tip = partById('wedge-10')!
    expect(tip.roles).toContain('nose')
    expect(tip.provenance.map(p => p.species).sort()).toEqual(['dog', 'monkey'])
    // Pointy: it narrows. And mirror-symmetric, so one copy is a whole nose tip
    // rather than a handed half needing its partner.
    expect(tip.shape.taper).toBeLessThan(0.75)
    expect(tip.shape.symmetry).toBe('mirror')
    expect(tip.attachment!.axis).toBe('z')
    expect(tip.attachment!.dir).toBe(1)
    // The smallest solid nose-tip in the pack.
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose') && p.size[2] > 0)
    expect(Math.min(...noses.map(p => p.shape.longest))).toBe(tip.shape.longest)
    expect(HEDGEHOG_ASSEMBLY.flag).not.toMatch(/authored/i)
  })

  it('sits on the snout\'s own measured apex, and forward of everything', () => {
    const g = build()
    const tip = named(g, 'nose-tip')[0]!
    const snout = named(g, 'snout')[0]!
    expect(tip).toBeTruthy()
    // The apex of `cone-06` is its front-most welded point, measured at local
    // (0, +0.1122, +0.1434) off the bank's own numbers.
    const beak = partById('cone-06')!
    let apex: P3 = [0, 0, -Infinity]
    for (const p of referenced(beak)) if (p[2] > apex[2]) apex = p
    expect(world(tip).y).toBeCloseTo(world(snout).y + apex[1], 3)
    expect(worldBox(tip).max.z).toBeGreaterThan(worldBox(snout).max.z)
    // Nothing floats (§3): it is sunk into the beak by the pack's own amount.
    expect(worldBox(tip).min.z).toBeLessThan(worldBox(snout).max.z)
  })

  it('is PINK by texture lookup, and the pink is the pack\'s own (rule 8)', () => {
    const pink = HEDGEHOG_ASSEMBLY.palette['nose']!
    const [r, gc, b] = [(pink >> 16) & 255, (pink >> 8) & 255, pink & 255]
    // Red-dominant, blue above green: a pink, not a red and not a mauve.
    expect(r).toBeGreaterThan(b)
    expect(b).toBeGreaterThan(gc)
    expect(pink).toBe(0xe792bd)
    // And it is a texture lookup, never a material tint: one material, one map.
    const g = build()
    const tipMat = (named(g, 'nose-tip')[0]!.material as THREE.MeshStandardMaterial)
    expect(tipMat).toBe(g.getObjectByName('hull')!['material' as never])
    expect(tipMat.color.getHex()).toBe(0xffffff)
  })
})

/* ------------------------------------------------------ repeat-and-sink --- */

describe('twenty spikes, five rows of four (Joe, 16:56)', () => {
  it('places four on the top, four on each side and four on each chamfer', () => {
    const g = build()
    expect(named(g, 'spike')).toHaveLength(20)
    expect(named(g, 'spike-top')).toHaveLength(4)
    expect(named(g, 'spike-side')).toHaveLength(8)
    expect(named(g, 'spike-chamfer')).toHaveLength(8)
    for (const row of ['spike-top', 'spike-side', 'spike-chamfer']) {
      for (const m of named(g, row)) expect(m.userData['part']).toBe('cone-01')
    }
  })

  it('stands every row on the same four z stations, so they read as one shell', () => {
    const g = build()
    const stations = (row: string) =>
      [...new Set(named(g, row).map(m => world(m).z.toFixed(4)))].sort()
    // The quarter points of the 1.000-wide flat face every row stands on.
    expect(stations('spike-top')).toEqual(['-0.1250', '-0.3750', '0.1250', '0.3750'])
    expect(stations('spike-side')).toEqual(stations('spike-top'))
    expect(stations('spike-chamfer')).toEqual(stations('spike-top'))

    // And 0.375 is the WIDEST station that keeps §3's "nothing floats" true. Each
    // flat face runs to z = +/-0.3125 and the edge chamfer then falls away 1:1,
    // so a spike buried 0.125 below the nominal plane leaves the hull at
    // |z| > 0.4375. Push a row out to the corner and it hangs in the air.
    for (const m of named(g, 'spike')) {
      expect(Math.abs(world(m).z), m.name).toBeLessThanOrEqual(0.4375)
    }
  })

  it('steps the five facings 45 degrees apart through a half turn', () => {
    const g = build()
    // Joe's stated intent is the acceptance test: the chamfer rows exist so the
    // spiked back reads as CURVED rather than as three flat faces. Evenly
    // stepping the direction the spikes point is what delivers that, and it is
    // measurable in a way "does it look round" is not.
    const angles = new Set<number>()
    for (const m of named(g, 'spike')) {
      const f = m.userData['facing'] as [number, number, number]
      expect(Math.hypot(f[0], f[1], f[2])).toBeCloseTo(1, 6)
      expect(f[2]).toBeCloseTo(0, 6)
      angles.add(Math.round((Math.atan2(f[0], f[1]) * 180) / Math.PI))
    }
    expect([...angles].sort((a, b) => a - b)).toEqual([-90, -45, 0, 45, 90])
  })

  it('puts the chamfer rows on the cube\'s real chamfer, not on a sharp corner', () => {
    // `box-03` cuts every edge AND every corner (rule 2): its 32 welded points
    // are the permutations of (+/-0.625, +/-0.3125, +/-0.3125) and (+/-0.5,
    // +/-0.5, +/-0.5). So each flat face is 0.625 square, and the edge chamfer
    // between the +x and +y faces runs (0.625, 0.3125) to (0.3125, 0.625) —
    // midpoint (0.46875, 0.46875), NOT the (0.5625, 0.5625) you get by assuming
    // a 1.000-wide face. This assertion exists because that was assumed once.
    const box = partById('box-03')!
    const pts = uniqueSorted(referenced(box))
    expect(pts).toHaveLength(32)
    const shells = new Set(pts.map(p =>
      [p[0], p[1], p[2]].map(Math.abs).sort((x, y) => y - x).join(',')))
    expect([...shells].sort()).toEqual(['0.5,0.5,0.5', '0.625,0.3125,0.3125'])

    const g = build()
    const hull = worldBox(g.getObjectByName('hull')!)
    const cy = (hull.min.y + hull.max.y) / 2
    for (const m of named(g, 'spike-chamfer')) {
      const j = m.userData['joinedAt'] as [number, number, number]
      expect(Math.abs(j[0])).toBeCloseTo(0.46875, 4)
      expect(j[1] - cy).toBeCloseTo(0.46875, 4)
      // ON the chamfer plane, which is x + y = 0.9375 in hull-local terms.
      expect(Math.abs(j[0]) + (j[1] - cy)).toBeCloseTo(0.9375, 4)
    }
    for (const m of named(g, 'spike-side')) {
      expect(Math.abs((m.userData['joinedAt'] as number[])[0]!)).toBeCloseTo(0.625, 4)
      expect((m.userData['joinedAt'] as number[])[1]!).toBeCloseTo(cy, 4)
    }
    for (const m of named(g, 'spike-top')) {
      expect((m.userData['joinedAt'] as number[])[1]!).toBeCloseTo(hull.max.y, 3)
    }
  })

  it('buries all twenty by exactly the depth the pack used for that shape', () => {
    const g = build()
    const part = partById('cone-01')!
    const att = part.attachment!
    for (const m of named(g, 'spike')) {
      const f = m.userData['facing'] as [number, number, number]
      const j = m.userData['joinedAt'] as [number, number, number]
      const p = m.geometry.getAttribute('position')
      let lo = Infinity
      for (let i = 0; i < p.count; i++) {
        lo = Math.min(lo, p.getX(i) * f[0] + p.getY(i) * f[1] + p.getZ(i) * f[2])
      }
      const near = (m.position.x * f[0] + m.position.y * f[1] + m.position.z * f[2]) + lo
      const buried = (j[0] * f[0] + j[1] * f[1] + j[2] * f[2]) - near
      expect(buried / part.size[1], `${m.name} sunk`)
        .toBeGreaterThanOrEqual(att.sunkFractionMin - 1e-3)
      expect(buried / part.size[1], `${m.name} sunk`)
        .toBeLessThanOrEqual(att.sunkFractionMax + 1e-3)
      // §3: "every eared species embeds its ear into the hull by at least 0.125".
      expect(buried, m.name).toBeCloseTo(0.125, 3)
    }
  })

  it('mirrors the side and chamfer rows rather than placing them twice', () => {
    const g = build()
    for (const row of ['spike-side', 'spike-chamfer']) {
      const right = named(g, row).filter(m => world(m).x > 0).sort((a, b) => world(b).z - world(a).z)
      const left = named(g, row).filter(m => world(m).x < 0).sort((a, b) => world(b).z - world(a).z)
      expect(right, row).toHaveLength(4)
      expect(left, row).toHaveLength(4)
      for (let i = 0; i < 4; i++) {
        expect(world(left[i]!).x).toBeCloseTo(-world(right[i]!).x, 4)
        expect(world(left[i]!).y).toBeCloseTo(world(right[i]!).y, 4)
        expect(world(left[i]!).z).toBeCloseTo(world(right[i]!).z, 4)
        expect(left[i]!.userData['mirror']).toBe(true)
      }
    }
    // The top row is NOT mirrored — mirroring x = 0 would place eight spikes on
    // top of each other and the count would still say twenty.
    expect(named(g, 'spike-top').every(m => m.userData['mirror'] === false)).toBe(true)
  })

  it('points them BACKWARDS, and the spin is what turned them', () => {
    const g = build()
    // Unspun, `cone-01` leans forward: its highest point sits at z = +0.0628.
    const part = partById('cone-01')!
    let was: P3 = [0, -Infinity, 0]
    for (const p of referenced(part)) if (p[1] > was[1]) was = p
    expect(was[2]).toBeGreaterThan(0)

    // Built, every spike's TIP — the point furthest along its own facing — sits
    // behind the middle of the spike. That is the half turn, measured off the
    // vertices rather than read off the spec.
    for (const m of named(g, 'spike')) {
      const f = m.userData['facing'] as [number, number, number]
      const p = m.geometry.getAttribute('position')
      let best = -Infinity, tipZ = 0
      for (let i = 0; i < p.count; i++) {
        const d = p.getX(i) * f[0] + p.getY(i) * f[1] + p.getZ(i) * f[2]
        if (d > best) { best = d; tipZ = p.getZ(i) }
      }
      expect(tipZ, `${m.name} tip leans`).toBeCloseTo(-was[2], 3)
      expect(tipZ, `${m.name} tip leans`).toBeLessThan(0)
    }
  })

  it('found its spike by measurement, and the query still returns both hog parts', () => {
    const hits = findShapes(SPIKE_QUERY).map(p => p.id)
    // §3.2's acceptance test, verbatim: the hog's ear AND the hog's tusk, from a
    // query that names no species, no role and no form.
    expect(hits).toContain('cone-04')  // hog/ear-right
    expect(hits).toContain('wedge-13') // hog/front-of-face tusk-right
    expect(hits).toContain('cone-01')  // what the hedgehog actually wears

    // And this is WHY `form` is a label and never a filter. Filtering the same
    // query to the cone/spike forms keeps the ear and throws the tusk away — the
    // two shapes are one job on opposite sides of a bucket boundary.
    const coney = findShapes(SPIKE_QUERY).filter(p => p.shape.form === 'cone')
    expect(coney.map(p => p.id)).toContain('cone-04')
    expect(coney.map(p => p.id)).not.toContain('wedge-13')
  })
})

/* ------------------------------------------------------------ the body --- */

describe('the hedgehog stands where the pack stands', () => {
  it('puts four legs on y = 0, sunk into the belly by a measured amount', () => {
    const g = build()
    const legs = named(g, 'leg')
    expect(legs).toHaveLength(4)
    const part = partById('box-01')!
    const bottom = worldBox(g.getObjectByName('hull')!).min.y
    for (const l of legs) {
      const b = worldBox(l)
      expect(b.min.y).toBeCloseTo(0, 3)
      const frac = (b.max.y - bottom) / part.size[1]
      expect(frac).toBeGreaterThanOrEqual(part.attachment!.sunkFractionMin - 1e-3)
      expect(frac).toBeLessThanOrEqual(part.attachment!.sunkFractionMax + 1e-3)
      // The pack's own leg offset, arrived at by solving rather than by aiming.
      expect(world(l).y).toBeCloseTo(part.offset[1], 4)
    }
    // Under the MIDDLE, not at the corners (§3, the leg note).
    for (const l of legs) {
      expect(Math.abs(world(l).x)).toBeLessThan(1.25 / 2)
      expect(Math.abs(world(l).z)).toBeLessThan(1.25 / 2)
    }
  })

  it('lands inside the pack\'s measured height band, feet on zero', () => {
    const g = build()
    const b = worldBox(g)
    expect(b.min.y).toBeCloseTo(0, 3)
    const h = b.max.y - b.min.y
    // The 24 run 1.43-2.02, mean 1.65. A stranger in that line-up is the one
    // failure roster §1 names.
    expect(h).toBeGreaterThan(1.43)
    expect(h).toBeLessThan(2.02)
    // The top row lands on `cone-01`'s own recorded offset in the bee, which
    // wears this shape on this cube at this depth. Nothing aimed at that.
    expect(world(named(g, 'spike-top')[0]!).y).toBeCloseTo(partById('cone-01')!.offset[1], 4)
  })

  it('stays inside rule 9\'s VERTEX budget, and says where it does not', () => {
    const g = build()
    let verts = 0, tris = 0, body = 0
    for (const m of meshesOf(g)) {
      const n = m.geometry.getAttribute('position').count
      verts += n
      tris += m.geometry.getIndex()!.count / 3
      if (m.userData['role'] !== 'leg') body += n
    }
    // Rule 9 as written is a vertex budget: "bodies 236-1114 verts, a leg is
    // 24". The weld is what keeps twenty spikes inside it — unwelded they are
    // 1,360 verts on their own.
    expect(body).toBeGreaterThanOrEqual(236)
    expect(body).toBeLessThanOrEqual(1114)
    expect(verts).toBeGreaterThanOrEqual(405)
    expect(verts).toBeLessThanOrEqual(1626)

    // TRIANGLES ARE OVER, DELIBERATELY, AND THIS IS THE RECORD OF IT. The pack
    // measures 422-951 per model; twenty spikes at 34 triangles each is 680 and
    // the animal comes to 1,044. No pack animal wears twenty protrusions, so the
    // envelope is the one Joe's count leaves. Pinned exactly rather than relaxed,
    // so a further regression is still red, and named in the species' `flag` so
    // he sees it in the viewer rather than in a test file.
    expect(tris).toBe(1044)
    expect(HEDGEHOG_ASSEMBLY.flag).toMatch(/RULE 9 STRAINED/)
  })
})

/* ------------------------------------------------------------- the eye --- */

describe('the pupil is the pack\'s own grey, measured off the real files', () => {
  /* Same minimal PNG decoder `facedecals.test.ts` and `recolour.test.ts` carry,
   * for the same reason `parts-bank.test.ts` duplicates the glTF reader: a
   * shared decoder lets a bug in the decoder agree with itself. */
  const decodePng = (path: string) => {
    const buf = readFileSync(path)
    let off = 8, w = 0, h = 0, depth = 0, colour = 0
    const idat: Buffer[] = []
    while (off < buf.length) {
      const len = buf.readUInt32BE(off)
      const type = buf.toString('ascii', off + 4, off + 8)
      const data = buf.subarray(off + 8, off + 8 + len)
      if (type === 'IHDR') {
        w = data.readUInt32BE(0); h = data.readUInt32BE(4); depth = data[8]!; colour = data[9]!
      }
      if (type === 'IDAT') idat.push(data)
      if (type === 'IEND') break
      off += 12 + len
    }
    const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[colour]!
    const raw = inflateSync(Buffer.concat(idat))
    const bpp = channels * (depth / 8)
    const stride = w * bpp
    const px = Buffer.alloc(h * stride)
    let p = 0
    for (let y = 0; y < h; y++) {
      const f = raw[p++]!
      const line = raw.subarray(p, p + stride); p += stride
      const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
      const cur = px.subarray(y * stride, (y + 1) * stride)
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? cur[x - bpp]! : 0
        const b = prev[x]!
        const c = x >= bpp ? prev[x - bpp]! : 0
        let v = line[x]!
        if (f === 1) v += a
        else if (f === 2) v += b
        else if (f === 3) v += (a + b) >> 1
        else if (f === 4) {
          const q = a + b - c
          const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c)
          v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
        }
        cur[x] = v & 0xff
      }
    }
    return { w, h, bpp, stride, px }
  }

  interface Gltf {
    nodes?: { name?: string; mesh?: number; children?: number[]; matrix?: number[]
      translation?: number[]; rotation?: number[]; scale?: number[] }[]
    meshes?: { primitives?: { attributes: Record<string, number>; indices?: number }[] }[]
    accessors?: { bufferView: number; componentType: number; type: string
      count: number; byteOffset?: number }[]
    bufferViews?: { byteOffset?: number; byteStride?: number }[]
    scenes?: { nodes?: number[] }[]
  }
  const SIZE: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
  const WIDE: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

  const readGlb = (path: string): { g: Gltf; bin: Buffer } => {
    const buf = readFileSync(path)
    const total = buf.readUInt32LE(8)
    let off = 12, g: Gltf = {}, bin = Buffer.alloc(0)
    while (off < total) {
      const len = buf.readUInt32LE(off)
      const type = buf.readUInt32LE(off + 4)
      const data = buf.subarray(off + 8, off + 8 + len)
      if (type === 0x4e4f534a) g = JSON.parse(data.toString('utf8')) as Gltf
      if (type === 0x004e4942) bin = data
      off += 8 + len + ((4 - (len % 4)) % 4)
    }
    return { g, bin }
  }

  const acc = (g: Gltf, bin: Buffer, i: number): number[] => {
    const a = g.accessors![i]!
    const bv = g.bufferViews![a.bufferView]!
    const sz = SIZE[a.componentType]!, n = WIDE[a.type]!
    const stride = bv.byteStride ?? sz * n
    const base = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0)
    const out: number[] = []
    for (let k = 0; k < a.count; k++) {
      for (let c = 0; c < n; c++) {
        const o = base + k * stride + c * sz
        out.push(a.componentType === 5126 ? bin.readFloatLE(o)
          : a.componentType === 5125 ? bin.readUInt32LE(o)
            : a.componentType === 5123 ? bin.readUInt16LE(o) : bin.readUInt8(o))
      }
    }
    return out
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const PETS = resolve(here, '../../src/island/public/pets')

  it('is exactly the shade the pack\'s own eye cards sample, not a black', () => {
    const img = decodePng(join(PETS, 'Textures/colormap.png'))
    const species = PARTS_BANK.flatMap(p => p.provenance.map(q => q.species))
    let wr = 0, wg = 0, wb = 0, wa = 0, tris = 0
    const seen = new Set<string>()

    for (const s of [...new Set(species)].sort()) {
      const { g, bin } = readGlb(join(PETS, `animal-${s}.glb`))
      for (const [mi, mesh] of (g.meshes ?? []).entries()) {
        const node = (g.nodes ?? []).find(n => n.mesh === mi)
        if (node?.name !== 'body') continue
        for (const pr of mesh.primitives ?? []) {
          const pos = acc(g, bin, pr.attributes['POSITION']!)
          const uv = acc(g, bin, pr.attributes['TEXCOORD_0']!)
          const idx = acc(g, bin, pr.indices!)
          const comps = weldedComponents(pos, idx)
          const facts = comps.map(c => componentFacts(pos, idx, c))
          const paired = orderComponents(comps.map((c, i) => ({ tris: c, facts: facts[i]! })))
          const names = namesFor(s, paired.map(q => q.facts))
          paired.forEach((q, i) => {
            if (!/eye card/.test(names[i]!.name)) return
            seen.add(s)
            for (const t of q.tris) {
              const vi = [0, 1, 2].map(k => idx[t * 3 + k]!)
              // The eye card's PUPIL is atlas swatch column 15; the sclera is
              // column 3 and is deliberately left alone (brief §5, the face).
              if (Math.min(15, Math.floor(uv[vi[0]! * 2]! * 16)) !== 15) continue
              const cu = vi.reduce((a2, v) => a2 + uv[v * 2]! / 3, 0)
              const cv = vi.reduce((a2, v) => a2 + uv[v * 2 + 1]! / 3, 0)
              // glTF UV origin is the UPPER-left of the image: y = v * h, no flip.
              const x = Math.min(img.w - 1, Math.max(0, Math.floor(cu * img.w)))
              const y = Math.min(img.h - 1, Math.max(0, Math.floor(cv * img.h)))
              const o = y * img.stride + x * img.bpp
              const [r, gg, b] = [img.px[o]!, img.px[o + 1]!, img.px[o + 2]!]
              const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b)
              // 44 of the 588 band-15 eye triangles land on a chromatic swatch —
              // a beak or a crest welded into the card's own component. They are
              // not pupil and they would drag the mean orange.
              if (mx > 0 && (mx - mn) / mx > 0.4) continue
              const P = vi.map(v => [pos[v * 3]!, pos[v * 3 + 1]!, pos[v * 3 + 2]!])
              const e1 = [0, 1, 2].map(k => P[1]![k]! - P[0]![k]!)
              const e2 = [0, 1, 2].map(k => P[2]![k]! - P[0]![k]!)
              const cr = [e1[1]! * e2[2]! - e1[2]! * e2[1]!,
                e1[2]! * e2[0]! - e1[0]! * e2[2]!,
                e1[0]! * e2[1]! - e1[1]! * e2[0]!]
              // Weighted by AREA, never by triangle count: a pupil is a few large
              // faces and its outline is many small ones (`tools/pets/atlas.mjs`).
              const ar = Math.hypot(cr[0]!, cr[1]!, cr[2]!) / 2
              wr += r * ar; wg += gg * ar; wb += b * ar; wa += ar; tris++
            }
          })
        }
      }
    }

    expect(seen.size).toBe(24)
    expect(tris).toBe(544)
    const got = (Math.round(wr / wa) << 16) | (Math.round(wg / wa) << 8) | Math.round(wb / wa)
    expect(got).toBe(PACK_PUPIL)
    // And what it IS, in words, so a future reader does not have to re-derive it:
    // a dark blue-grey, max channel 94 and saturation 0.19 — `docs/HANDOFF.md`
    // §6's "the pack's black is #4d515f", confirmed off the eye decal itself.
    const [r, gg, b] = [(got >> 16) & 255, (got >> 8) & 255, got & 255]
    expect(Math.max(r, gg, b)).toBeGreaterThan(78)
    expect((Math.max(r, gg, b) - Math.min(r, gg, b)) / Math.max(r, gg, b))
      .toBeGreaterThan(0.12)
    expect(got).not.toBe(0x000000)
  })

  it('is used by every assembled species, so the fix is central', () => {
    // Joe's note is about every animal built this way, not about the hedgehog.
    // Any species whose eye card sends band 15 to a slot must send it HERE.
    for (const [id, spec] of Object.entries(ASSEMBLED_BUILDS)) {
      for (const f of spec.features) {
        const part = partById(f.part)
        if (!part?.roles.includes('eye')) continue
        const slot = f.paint.byBand?.[15]
        expect(slot, `${id}: eye card has no pupil slot`).toBeDefined()
        expect(spec.palette[slot!], `${id} paints its pupil ${slot}`).toBe(PACK_PUPIL)
      }
    }
    expect(HEDGEHOG_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
  })

  it('leaves the sclera exactly where it was', () => {
    // The eye card carries both halves and the eyes are the face, which brief §5
    // keeps constant per species. Joe's note was about the pupil.
    expect(HEDGEHOG_ASSEMBLY.palette['eye']).toBe(0xf4e6cc)
  })
})

/* ------------------------------------------------------------- texture --- */

describe('the texture is cached, and detached rather than disposed', () => {
  it('paints the whole animal from one material and one texture', () => {
    const g = build()
    const mats = new Set(meshesOf(g).map(m => m.material as THREE.Material))
    expect(mats.size).toBe(1)
    const mat = [...mats][0] as THREE.MeshStandardMaterial
    expect(mat.map).not.toBeNull()
    // Six slots, four pixels each: 4 x 24. A column, not an atlas.
    const img = mat.map!.image as ImageData
    expect(img.width).toBe(4)
    expect(img.height).toBe(Object.keys(HEDGEHOG_ASSEMBLY.palette).length * 4)
    // Rule 8: a single-slot part reads ONE point on that column, so the hull is
    // one hue and cannot be a blend of two.
    const uv = (g.getObjectByName('hull') as THREE.Mesh).geometry.getAttribute('uv')
    const pts = new Set<string>()
    for (let i = 0; i < uv.count; i++) pts.add(`${uv.getX(i).toFixed(5)},${uv.getY(i).toFixed(5)}`)
    expect(pts.size).toBe(1)
  })

  it('gives two builds the same texture object', () => {
    detachAssemblyTextures()
    expect(assemblyTextureCount()).toBe(0)
    const a = build(), b = build()
    const ta = ((a.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    const tb = ((b.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    expect(ta).toBe(tb)
    expect(assemblyTextureCount()).toBe(1)
  })

  it('never disposes one — a child may already own a pet wearing it', () => {
    detachAssemblyTextures()
    const a = build()
    const ta = ((a.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map!
    let disposed = 0
    ta.addEventListener('dispose', () => { disposed += 1 })

    const let_go = detachAssemblyTextures()
    expect(let_go).toBe(1)
    expect(assemblyTextureCount()).toBe(0)
    expect(disposed).toBe(0)
    // Still usable: the pet on screen keeps its pixels.
    expect((ta.image as ImageData).data.length).toBe(4 * 24 * 4)

    const c = build()
    const tc = ((c.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    expect(tc).not.toBe(ta)
    expect(disposed).toBe(0)
  })

  it('splits the eye card into two slots off its own measured bands', () => {
    const g = build()
    const eye = named(g, 'eye')[0]!
    const uv = eye.geometry.getAttribute('uv')
    const vs = new Set<string>()
    for (let i = 0; i < uv.count; i++) vs.add(uv.getY(i).toFixed(4))
    // The bank measured `plate-01` as bands 3 and 15; the paint sends 15 to the
    // pupil slot and the rest to the eye slot, so exactly two rows are read.
    expect(new Set(partById('plate-01')!.bands).size).toBe(2)
    expect(vs.size).toBe(2)
    for (let i = 0; i < uv.count; i++) expect(uv.getX(i)).toBeCloseTo(0.5, 6)
  })
})

/* --------------------------------------------------------------- roster --- */

describe('the roster stays the authority on names and facts', () => {
  it('reads name and collection off the roster and carries the flag', () => {
    const rows = assembledSpecies()
    expect(rows.map(r => r.id)).toEqual(['animal-hedgehog'])
    const row = rows[0]!
    expect(row.name).toBe(SPECIES_NAMES['animal-hedgehog'])
    expect(row.name).toBe('Hedgehog')
    expect(row.collection).toBe(SPECIES_COLLECTION['animal-hedgehog'])
    expect(row.flag).toBe(HEDGEHOG_ASSEMBLY.flag)
    expect(row.flag).toMatch(/cone-01/)
  })

  it('adds the assembly beside the scrapped kit build, changing nothing', () => {
    const hog = GARDEN_SPECIES.find(s => s.id === 'animal-hedgehog')!
    expect(hog.assembly).toBe(HEDGEHOG_ASSEMBLY)
    // JT-034 is Joe's to rule on; until then the old build stays exactly as it
    // shipped so he can put the two side by side. A surface that lists the new
    // method must key off `assembly`, never off the ABSENCE of `build` — see
    // docs/building-animals-from-parts.md §9.
    expect(hog.kit).toBe('quadruped')
    expect(hog.build).toEqual({
      kit: 'quadruped', height: 1.52, body: 0.9, head: 0.9, legs: 0.4,
      ears: 'round', tail: 'stub', extras: ['spines', 'snout'],
      palette: { coat: 0xb2946c, belly: 0xf4e6cc, detail: 0x6b533a, accent: 0x53412c },
    })
  })

  it('refuses a species it has no build for, by name', () => {
    expect(() => buildAssembled('animal-squirrel')).toThrow(/animal-squirrel/)
  })
})
