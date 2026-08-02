/**
 * The assembled hedgehog — what is true of THIS animal and nothing else.
 *
 * The eight invariants every assembled species carries — one mass, lineage back
 * to the bank, the absolute eye card, no transform on a placed node, rule 9's
 * budgets, the detached texture, the measured pupil, the leg row, and the height
 * band checked first — are `assertAssembly` in `assembly-assert.ts`, called once
 * below. They used to be four hundred lines of this file, re-derived again in the
 * squirrel's, and about to be re-derived eleven more times.
 *
 * What is left here is the hedgehog: Joe's revised spike layout, the nose he
 * overruled rule 1 for, and the pupil re-derived from the real `.glb` files. Four
 * dead features shipped in this repo behind tests that only proved a mock ran, so
 * nothing below asserts that a function was called. Every assertion measures the
 * geometry that came out and compares it to a number measured off Kenney's own
 * files — the discipline `tests/island/parts-bank.test.ts` applies to the bank.
 *
 * The five that would catch a real regression here, in the order they matter:
 *
 *   1. IT IS THE AUTHORED CUBE, UNSTRETCHED. After Joe's "body cubic, its
 *      currently too wide" — and then his second note, that the body should
 *      always be the standard size — a hull stretch is a compile error and a
 *      build-time throw, with no sentence that excuses it. Pinned from both
 *      directions, and the way OUT is pinned too: a different real shell.
 *   2. REPEAT-AND-SINK, FIVE ROWS OF FOUR. Joe's revised layout, each buried
 *      inside the range the pack itself demonstrated for that shape, and the
 *      five facings stepping 45 degrees through a half turn — which is the
 *      acceptance test for his stated intent, that the back read as CURVED.
 *   3. THE SPINES POINT BACKWARDS. Measured off the built vertices, not trusted
 *      from the spec, and compared against the unspun part to prove the spin is
 *      what turned them.
 *   4. THE NOSE IS AUTHORED AND JOE SAID SO. The bank's own answer was right on
 *      every measured axis and reads as a tongue; this file is the record of
 *      that, and it is what stops the next builder putting `wedge-10` back.
 *   5. THE PUPIL IS THE PACK'S. Re-derived on every run from the 24 real `.glb`
 *      files and the real `colormap.png`, because "we measured it once" is
 *      exactly the claim `parts-bank.test.ts` refuses to take on trust.
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
  assembledSpecies, buildAssembled, findShapes, SPIKE_QUERY, HEDGEHOG_ASSEMBLY,
  buildAssembly, PACK_PUPIL, SLOT_PX, SLOT_W, EYE_CARD_Z, HULL_FRONT_Z_USUAL, OTHER_HULLS,
  type AssemblyBuild, type Hull,
} from '../../src/island/species/parts'
import { AUTHORED_PARTS, authoredById } from '../../src/island/species/parts/authored'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { GARDEN_SPECIES } from '../../src/island/species/collections/garden'
import { speciesRecord } from '../../src/island/species/registry'
import { SPECIES_NAMES } from '../../src/island/species/roster'
import { assertAssembly } from './assembly-assert'

/* ------------------------------------------------------ the shared floor --- */

/**
 * Every invariant the method has, on this animal. The claims are what only the
 * hedgehog can say — including the two budgets it deliberately breaks.
 */
assertAssembly({
  id: 'animal-hedgehog',
  parts: ['box-01', 'box-03', 'cone-01', 'cone-06', 'plate-01'],
  // Rule 1 overruled, once, by Joe, having seen the alternative. See below.
  authored: ['bespoke-sphere-01'],
  height: 1.7069,
  // 754 verts and 1,046 triangles. The WELD is what keeps twenty spikes inside
  // rule 9's vertex budget at all: unwelded they are 20 x 68 = 1,360 on their
  // own, against a measured body ceiling of 1,114.
  verts: 754,
  tris: 1046,
  // TRIANGLES ARE OVER, DELIBERATELY, AND THIS IS THE RECORD OF IT. The pack
  // measures 422-951 per model; twenty spikes at 34 triangles each is 680 and the
  // animal comes to 1,046. No pack animal wears twenty protrusions, so the
  // envelope is the one Joe's count leaves. Pinned exactly rather than relaxed,
  // so a further regression is still red, and named in the species' `flag` so he
  // sees it in the viewer rather than in a test file.
  overBudget: { tris: /RULE 9 STRAINED/ },
  // The largest detail is a spike, at a few percent of the hull. The 72 were
  // scrapped for a head box at roughly a QUARTER of the body's volume.
  massRatio: 10,
  // Three spun rows: the half turn backwards, and the two chamfer rotations.
  spinsAtLeast: 3,
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

describe('the assembled hedgehog is CUBIC, on the pack\'s own solve', () => {
  it('is the authored 1.250 cube, with no stretch at all', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    // `assertAssembly` has already matched this mesh's VERTICES back to a bank
    // record, so the claim below is what shape it is, not whether it is one.
    const id = hull.userData['part'] as string
    expect(id).toBe('box-03')
    expect(partById(id)!.roles).toContain('hull')
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

/* ------------------------------------------- the hull cannot be scaled --- */

/**
 * These three used to pin the OPPOSITE contract: a hull stretch was legal if it
 * carried a sentence saying why, and one of them asserted that a stretched cube
 * built and measured 1.350 wide. Joe reversed it reviewing the built set —
 * *"general criticism is size. the body/cube should always be the standard size,
 * its often bigger"* — so the coverage is inverted rather than deleted. The 1.350
 * measurement survives too, and it is the interesting half of the reversal: it is
 * still reachable, because 1.350 is the TIGER'S OWN HULL and the pack drew it.
 */
describe('a hull is the standard size, and there is no dial that says otherwise', () => {
  it('will not COMPILE a hull stretch at all — with or without a reason', () => {
    const scaled: Hull = {
      part: 'box-03',
      paint: { base: 'coat' },
      at: [0, 0.80625, 0],
      // @ts-expect-error `Hull.stretch` is `never`. If this directive ever goes
      // unused, the dial is back and `tsc` fails HERE rather than in some future
      // species nobody looks at.
      stretch: [1.08, 0.92, 1] as [number, number, number],
    }
    expect(scaled.part).toBe('box-03')

    // And a sentence buys nothing, which is the whole of the reversal: what used
    // to be the sanctioned pair is now two type errors rather than none.
    const excused: Hull = {
      part: 'box-03',
      paint: { base: 'coat' },
      at: [0, 0.80625, 0],
      // @ts-expect-error — the dial.
      stretch: [1.08, 0.92, 1] as [number, number, number],
      // @ts-expect-error — and the excuse for it, which no longer excuses anything.
      stretchWhy: 'the tiger\'s hull width, the widest the pack goes',
    }
    expect(excused.at[1]).toBeCloseTo(0.80625, 5)
  })

  it('refuses to BUILD one either, reason or no reason', () => {
    const sneaky = {
      ...HEDGEHOG_ASSEMBLY,
      hull: { ...HEDGEHOG_ASSEMBLY.hull, stretch: [1.08, 0.92, 1] },
    } as unknown as AssemblyBuild
    expect(() => buildAssembly(sneaky)).toThrow(/never scaled/)
    // The message has to point at the way OUT, not just at the wall.
    expect(() => buildAssembly(sneaky)).toThrow(/OTHER_HULLS/)

    const excused = {
      ...HEDGEHOG_ASSEMBLY,
      hull: {
        ...HEDGEHOG_ASSEMBLY.hull,
        stretch: [1.08, 0.92, 1],
        stretchWhy: 'the tiger\'s hull width, the widest the pack goes',
      },
    } as unknown as AssemblyBuild
    expect(() => buildAssembly(excused)).toThrow(/never scaled/)

    // A stretch of exactly one is not a stretch, and is not worth a throw.
    const identity = {
      ...HEDGEHOG_ASSEMBLY,
      hull: { ...HEDGEHOG_ASSEMBLY.hull, stretch: [1, 1, 1] },
    } as unknown as AssemblyBuild
    expect(() => buildAssembly(identity)).not.toThrow()
  })

  it('gets to 1.350 wide the sanctioned way — a different REAL shell', () => {
    // The old test stretched the cube 1.08x to reach 1.350 and called it "the
    // tiger's hull width". It is: `box-41` IS the tiger's hull, 1.350 x 1.300 x
    // 1.350, drawn by Kenney. So the want was always answerable without a dial,
    // and this is what answering it looks like.
    expect(partById(OTHER_HULLS.bigger)!.size).toEqual([1.35, 1.3, 1.35])
    const bigger: AssemblyBuild = {
      ...HEDGEHOG_ASSEMBLY,
      hull: { ...HEDGEHOG_ASSEMBLY.hull, part: OTHER_HULLS.bigger },
    }
    const s = worldBox(buildAssembly(bigger).getObjectByName('hull')!)
      .getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.35, 3)
    expect(s.y).toBeCloseTo(1.3, 3)
    expect(s.z).toBeCloseTo(1.35, 3)

    // And nothing anywhere reports a hull departure any more, because a hull
    // cannot depart: the channel went with the dial.
    expect(build().userData['hullStretchWhy']).toBeUndefined()
    expect(build().userData['hullStretch']).toBeUndefined()
    expect(assembledSpecies()[0]!.hullStretchWhy).toBeUndefined()
  })
})

/* -------------------------------------------------------------- lineage --- */

describe('nothing in the hedgehog is authored except the one thing Joe asked for', () => {
  it('builds the authored sphere at the authored radius, to its own count', () => {
    // `assertAssembly` has already checked that this is the ONLY shape on the
    // animal the bank cannot account for, that it is in `authored.ts`, that it
    // has no donor and that it never leaked into `PARTS_BANK`. What is left is
    // the geometry itself.
    const g = build()
    const m = named(g, 'nose-tip')[0]!
    const p = authoredById(m.userData['part'] as string)!
    // Not `fingerprint` here: a sphere's every vertex is the same distance from
    // its centre, so the fingerprint is one value repeated and float32 storage
    // puts a 0.0625 radius exactly on the snapping boundary. The direct check is
    // both stronger and stable — every built vertex is on the authored radius,
    // and the count is the authored count.
    const built = posOf(m)
    expect(built, m.name).toHaveLength(p.verts)
    // The geometry is origin-centred, so distance from zero IS the radius.
    for (const q of built) {
      expect(Math.hypot(q[0], q[1], q[2])).toBeCloseTo(p.size[0] / 2, 5)
    }
    // And the flag names it, in Joe's own words, where he reads them.
    expect(HEDGEHOG_ASSEMBLY.flag).toMatch(/RULE 1 OVERRULED, BY JOE/)
    expect(HEDGEHOG_ASSEMBLY.flag).toMatch(/AUTHORED/)
  })

  it('keeps authored geometry out of every search, so nobody finds it by accident', () => {
    // Rule 1 is adapt-before-author. A `bespoke-*` shape that turned up in a
    // query result would let the next species author its way past rule 1 without
    // anyone deciding to — so the bank and the authored set are disjoint by
    // construction, and this is the assertion that keeps them that way.
    const ids = new Set(PARTS_BANK.map(p => p.id))
    for (const p of AUTHORED_PARTS) {
      expect(ids.has(p.id), `${p.id} is in PARTS_BANK`).toBe(false)
      expect(p.id.startsWith('bespoke-'), `${p.id} is not marked bespoke`).toBe(true)
    }
    expect(findShapes({}).some(p => p.id.startsWith('bespoke-'))).toBe(false)
    expect(findShapes({ maxLongest: 0.22 }).some(p => p.id.startsWith('bespoke-'))).toBe(false)
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
      const claimed = m.userData['part'] as string
      const part = partById(claimed) ?? authoredById(claimed)!
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
  it('floats 0.010 proud of THIS hull\'s front plane, which is what the pack does', () => {
    // `assertAssembly` pins the card at `EYE_CARD_Z` and at the bank card's own
    // size, unscaled, on every species. What is the hedgehog's is the hull it is
    // in front of: `box-03`'s front face is the usual 0.625, so the daylight is
    // 0.010. On the lion's shallower hull the same card is 0.135 proud and that
    // is equally correct — see `parts/hulls.ts`.
    const g = build()
    const eyes = named(g, 'eye')
    expect(eyes).toHaveLength(2)
    const front = worldBox(g.getObjectByName('hull')!).max.z
    expect(front).toBeCloseTo(HULL_FRONT_Z_USUAL, 3)
    expect(EYE_CARD_Z - front).toBeCloseTo(0.01, 3)
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

describe('the nose tip is a BESPOKE SPHERE, because Joe overruled rule 1', () => {
  it('records why the bank\'s own answer was rejected, so nobody re-runs it', () => {
    // The query was right on every axis it has and the part still reads as a
    // TONGUE. This assertion is the record of that, and it is what stops the
    // next builder "fixing" the hedgehog by putting wedge-10 back.
    const small = findShapes({ maxLongest: 0.22 }).map(p => p.id)
    expect(small).toContain('wedge-10')
    const tip = partById('wedge-10')!
    expect(tip.roles).toContain('nose')
    expect(tip.provenance.map(p => p.species).sort()).toEqual(['dog', 'monkey'])
    expect(tip.shape.taper).toBeLessThan(0.75)
    expect(tip.shape.symmetry).toBe('mirror')
    expect(tip.attachment!.axis).toBe('z')
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose') && p.size[2] > 0)
    expect(Math.min(...noses.map(p => p.shape.longest))).toBe(tip.shape.longest)
    // Five measured axes agreed. The hedgehog wears none of it.
    expect(HEDGEHOG_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(HEDGEHOG_ASSEMBLY.flag).toMatch(/tongue/i)
  })

  it('is a real sphere, generated rather than typed, and small', () => {
    const s = authoredById('bespoke-sphere-01')!
    // Round to a thousandth on all three axes, and every vertex the same
    // distance from the centre — which is what makes it a sphere rather than a
    // blob somebody typed.
    expect(s.size[0]).toBeCloseTo(0.125, 3)
    expect(s.size[1]).toBeCloseTo(0.125, 3)
    expect(s.size[2]).toBeCloseTo(0.125, 3)
    const radii = new Set(referenced(s).map(p => Math.hypot(p[0], p[1], p[2]).toFixed(6)))
    expect(radii.size).toBe(1)
    expect(Number([...radii][0])).toBeCloseTo(0.0625, 6)
    // Smooth-shaded on exact normals (rule 7): a sphere's normal IS its point
    // over its radius, so no normal is averaged and no corner is split.
    for (let i = 0; i < s.positions.length; i += 3) {
      for (let c = 0; c < 3; c++) {
        expect(s.normals[i + c]).toBeCloseTo(s.positions[i + c]! / 0.0625, 6)
      }
    }
    // 2/16 on the pack's grid, and under its own smallest solid nose-tips.
    expect(s.size[1] * 16).toBeCloseTo(2, 6)
    expect(s.size[1]).toBeLessThan(partById('box-09')!.size[1])
    expect(s.size[1]).toBeLessThan(partById('box-22')!.size[1])
    expect(s.tris).toBe(48)
    expect(s.verts).toBe(26)
  })

  it('sits with its CENTRE on the snout\'s own measured apex', () => {
    const g = build()
    const tip = named(g, 'nose-tip')[0]!
    const snout = named(g, 'snout')[0]!
    expect(tip.userData['part']).toBe('bespoke-sphere-01')
    // The apex of `cone-06` is its front-most welded point, measured at local
    // (0, +0.1122, +0.1434) off the bank's own numbers.
    const beak = partById('cone-06')!
    let apex: P3 = [0, 0, -Infinity]
    for (const p of referenced(beak)) if (p[2] > apex[2]) apex = p
    expect(world(tip).y).toBeCloseTo(world(snout).y + apex[1], 3)
    // `sink: 0.5` on a bbox-centred shape puts the centre ON the join point, so
    // exactly half stands proud. For a sphere that is the one placement that
    // needs no number, and this is it measured rather than asserted.
    const j = tip.userData['joinedAt'] as [number, number, number]
    expect(tip.position.z).toBeCloseTo(j[2], 9)
    expect(worldBox(tip).max.z).toBeGreaterThan(worldBox(snout).max.z)
    // Nothing floats (§3): the back half is inside the snout.
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
  it('puts the top spike row on the bee\'s own recorded offset', () => {
    // `assertAssembly` pins the height band, the feet on zero and the leg row.
    // This is the hedgehog's own: joining at the cube's top face and sinking the
    // spike its own measured burial lands `cone-01`'s centre on the offset the
    // BEE wears it at, to four decimals. Nothing was aimed at that; it is what
    // "derive it, don't choose it" buys.
    const g = build()
    expect(world(named(g, 'spike-top')[0]!).y).toBeCloseTo(partById('cone-01')!.offset[1], 4)
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

  it('leaves the sclera exactly where it was', () => {
    // The eye card carries both halves and the eyes are the face, which brief §5
    // keeps constant per species. Joe's note was about the pupil.
    expect(HEDGEHOG_ASSEMBLY.palette['eye']).toBe(0xf4e6cc)
  })
})

/* ------------------------------------------------------------- texture --- */

describe('the hedgehog paints no boundary, so every cell is one flat hue', () => {
  it('reads ONE point on the swatch column from the hull (rule 8)', () => {
    // `assertAssembly` pins the shared texture, its dimensions, the single
    // material and the fact that it is detached rather than disposed. What is
    // the hedgehog's is that it uses §4's FIRST way in and not the second: no
    // `patch` anywhere, so a single-slot part reads one point on the column and
    // the hull is one hue rather than a blend of two. The squirrel is the animal
    // that reads across a cell, and its own file says so.
    const g = build()
    expect(HEDGEHOG_ASSEMBLY.hull.paint.patch).toBeUndefined()
    const uv = (g.getObjectByName('hull') as THREE.Mesh).geometry.getAttribute('uv')
    const pts = new Set<string>()
    for (let i = 0; i < uv.count; i++) pts.add(`${uv.getX(i).toFixed(5)},${uv.getY(i).toFixed(5)}`)
    expect(pts.size).toBe(1)
    // Six slots, one cell each, SLOT_PX rows deep — 16 because the pack is
    // authored on a 1/16 grid (see texture.ts). All 16 rows here are one hue.
    const img = ((g.getObjectByName('hull') as THREE.Mesh)
      .material as THREE.MeshStandardMaterial).map!.image as ImageData
    expect(img.width).toBe(SLOT_W)
    expect(img.height).toBe(Object.keys(HEDGEHOG_ASSEMBLY.palette).length * SLOT_PX)
  })

  it('splits the eye card into two slots off its own measured bands', () => {
    // The bank measured `plate-01` as bands 3 and 15, so the split costs no
    // geometry at all — the card arrives pre-cut. `assertAssembly` checks that
    // the built card reads exactly two rows; this is the bank fact under it.
    expect(new Set(partById('plate-01')!.bands).size).toBe(2)
  })
})

/* --------------------------------------------------------------- roster --- */

describe('the roster stays the authority on names and facts', () => {
  it('is FIRST on the bench, because it shipped first', () => {
    // `assertAssembly` checks that the name and the collection are the roster's
    // and that the flag is carried out to the viewer. The order is this file's:
    // §6 is one species at a time, `parts/assembled/index.ts` says APPEND, and
    // the hedgehog is at the top of that list because it was first.
    const rows = assembledSpecies()
    expect(rows[0]!.id).toBe('animal-hedgehog')
    expect(rows[0]!.name).toBe(SPECIES_NAMES['animal-hedgehog'])
    expect(rows[0]!.name).toBe('Hedgehog')
    expect(rows[0]!.flag).toMatch(/cone-01/)
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
    /*
     * `animal-otter` now, and it USED to be `animal-slow-worm` — a roster member
     * Garden deliberately omitted, "a legless lizard the quadruped kit cannot
     * express and the assembly kit will not be asked to either". It was asked to,
     * and it built it, so the slow worm is on the register and can no longer
     * stand for an id with no build. Garden is complete and every one of its
     * fourteen is assembled, so the example has to come from another collection.
     *
     * The otter is the better example anyway: it is a SHIPPED species with a
     * quadruped `build` and no `assembly`, which is §9.2's trap from the other
     * side — the marker is the presence of `assembly` and never the absence of
     * `build`. The point is unchanged: an id with no assembly throws by NAME
     * rather than returning null (§9.3).
     */
    /*
     * AND NOW IT IS `animal-robin`, because on 2 Aug the otter was deleted with
     * the other 58 kit-built species and the premise went with it: there is no
     * longer ANY shipped species with a `build` and no `assembly`. All thirteen
     * that still carry a kit build are Garden animals that carry an assembly
     * too, and the assembly is what renders (`album.ts:179` tries it first).
     *
     * So the two lines that made §9.2's point from the other side are gone
     * rather than rewritten — there is nothing left to make it with. What
     * survives is the invariant that actually matters and is unaffected by any
     * of it: §9.3, an id with no assembly THROWS BY NAME rather than returning
     * null. `animal-robin` is rostered and unbuilt, which is the plainest
     * possible case of that, and it will stay plain — it is in `birds`, which
     * cannot be built at all until the bank has a wing.
     */
    expect(speciesRecord('animal-robin')).toBeUndefined()
    expect(() => buildAssembled('animal-robin')).toThrow(/animal-robin/)
  })
})
