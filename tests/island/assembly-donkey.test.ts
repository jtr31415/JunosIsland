/**
 * The donkey — the ear the pony measured and handed forward, on the cube it
 * refused it on, plus a tail spun over because its two donors are baked to
 * curl the wrong way for a hanging one.
 *
 * `assembly-pony.test.ts` pins JT-044 and `assembly-horse.test.ts` pins the
 * hooved-quadruped shape family. Neither is repeated here. This file pins the
 * three things that are this species' own: the ear's measured seating and the
 * height it buys, that `box-03` carries no band split (so the horse's free
 * muzzle trick does not transfer), and the tail's spin.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, DONKEY_ASSEMBLY, HORSE_ASSEMBLY, PONY_ASSEMBLY,
  PACK_HEIGHT_MAX, LEG_ROW, PACK_PUPIL, MODEL_TRIS_MAX,
} from '../../src/island/species/parts'
import { partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-donkey',
  parts: ['box-01', 'box-03', 'box-06', 'box-14', 'plate-01', 'tube-06', 'wedge-07'],
  authored: ['bespoke-square-01'],
  height: 2.0100,
  verts: 549,
  tris: 742,
  // The hull is the next-cheapest thing on the animal only by a little, since
  // `wedge-07` is a genuinely large tail; measured rather than assumed.
  // The hull is 14.5x the next-biggest bounding box on the animal — the EAR,
  // not the tail, by volume — measured rather than assumed.
  massRatio: 14,
  // One: the tail, turned over to hang instead of curl.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-donkey')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof DONKEY_ASSEMBLY)['features'][number] =>
  DONKEY_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, in WORLD terms: origin-centred plus its offset. */
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

/** Ray-cast straight down onto a hull and return the world y of its surface. */
const surfaceY = (id: string, x: number, z: number): number => {
  const p: BakedPart = partById(id)!
  const corner = (t: number, k: number): [number, number, number] => {
    const vi = p.indices[t * 3 + k]!
    return [
      p.positions[vi * 3]! + p.offset[0]!,
      p.positions[vi * 3 + 1]! + p.offset[1]!,
      p.positions[vi * 3 + 2]! + p.offset[2]!,
    ]
  }
  let best = -Infinity
  for (let t = 0; t < p.indices.length / 3; t++) {
    const a = corner(t, 0), b = corner(t, 1), c = corner(t, 2)
    const d = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2])
    if (Math.abs(d) < 1e-12) continue
    const l1 = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / d
    const l2 = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / d
    const l3 = 1 - l1 - l2
    if (l1 < -1e-9 || l2 < -1e-9 || l3 < -1e-9) continue
    const y = l1 * a[1] + l2 * b[1] + l3 * c[1]
    if (y > best) best = y
  }
  return best
}

/* ===================================================================== *
 * 1. THE EAR: `box-06`, measured fresh rather than trusted as a donor transfer
 * ===================================================================== */

describe('animal-donkey: the ear the pony handed forward, seated fresh', () => {
  it('floats at the raw donor offset, and clears at one grid step inward', () => {
    // `box-06`'s own recorded offset looks like a pure donor transfer (the bunny
    // is on `box-03` too), but ray-cast against the hull's actual triangles,
    // five of its 24 sub-join-plane vertices break the surface there.
    const ear = partById('box-06')!
    expect(ear.offset[0]).toBeCloseTo(0.286975, 6)
    expect(ear.offset[2]).toBeCloseTo(0.347082, 6)

    const localYs = [...new Set(ear.indices)].map(vi => ear.positions[vi * 3 + 1]!)
    const minY = Math.min(...localYs)
    const sunkLine = minY + ear.attachment!.sunkFractionMean * ear.size[1]
    const shiftY = 1.43125 - sunkLine   // joins the sink line to the flat top plate
    const subPlane = [...new Set(ear.indices)].filter(vi => ear.positions[vi * 3 + 1]! <= sunkLine + 1e-9)
    const daylight = (atX: number, atZ: number): number => {
      let worst = -Infinity
      for (const vi of subPlane) {
        const y = ear.positions[vi * 3 + 1]! + shiftY
        const worldX = atX + ear.positions[vi * 3]!, worldZ = atZ + ear.positions[vi * 3 + 2]!
        const gap = y - surfaceY('box-03', worldX, worldZ)
        if (gap > worst) worst = gap
      }
      return worst
    }
    expect(daylight(0.286975, 0.347082)).toBeGreaterThan(0.04)
    expect(daylight(0.20, 0.25)).toBeLessThan(0)
    expect(feature('ear').placement).toEqual({ kind: 'pair', at: [0.20, 1.43125, 0.25] })
    expect(feature('ear').stretch).toBeUndefined()
  })

  it('buys the tightest height in the collection, and is why the pony declined', () => {
    // Proud extent does not depend on x or z, only on the join height and the
    // shape's own burial — so this is the same number the pony read and refused.
    const ear = partById('box-06')!
    const proud = ear.size[1] * (1 - ear.attachment!.sunkFractionMean)
    expect(proud).toBeCloseTo(0.578794, 5)
    expect(1.43125 + proud).toBeCloseTo(2.010044, 5)
    expect(PACK_HEIGHT_MAX).toBeCloseTo(2.02, 6)
    expect(PACK_HEIGHT_MAX - (1.43125 + proud)).toBeGreaterThan(0)
    expect(PACK_HEIGHT_MAX - (1.43125 + proud)).toBeLessThan(0.011)
    const g = build()
    const top = new THREE.Box3().setFromObject(g).max.y
    expect(top).toBeCloseTo(2.0100, 3)
    expect(top).toBeLessThan(PACK_HEIGHT_MAX)
  })
})

/* ===================================================================== *
 * 2. `box-03` HAS NO BAND SPLIT, SO THE MUZZLE IS THE PONY'S RECIPE
 * ===================================================================== */

describe('animal-donkey: box-03 has one band, so the pale marking is two entries', () => {
  it('carries a single band across all 60 triangles', () => {
    const cube = partById('box-03')!
    expect([...new Set(cube.bands)]).toEqual([5])
    expect(HORSE_ASSEMBLY.hull.paint.byBand as unknown).toBeDefined()
    expect(DONKEY_ASSEMBLY.hull.paint.byBand as unknown).toBeUndefined()
  })

  it('restores the pony\'s own belly line and snout band, verbatim', () => {
    // `belly: 0.5` becomes a patch on the hull's OWN paint (`creature.ts:585-587`),
    // at the pony's own tiger-line fraction — the pale slot, since this hull has
    // no band to spend it on instead.
    expect(DONKEY_ASSEMBLY.hull.paint.patch).toEqual({ below: 'pale', at: 0.5 })
    expect(feature('snout').part).toBe('tube-06')
    expect(feature('snout').paint).toEqual({ base: 'coat', byBand: { 3: 'pale' } })
    const ponySnout = PONY_ASSEMBLY.features.find(f => f.name === 'snout')!.paint
    expect(feature('snout').paint.base).toBe(ponySnout.base)
    expect(Object.keys(feature('snout').paint.byBand!)).toEqual(Object.keys(ponySnout.byBand!))
    // The pale slot is named, not left implicit, exactly as the horse did.
    expect(feature('eye').paint.base).toBe('pale')
    // Five slots, and `hoof` now does a third job: horn, nose, AND the stripe.
    expect(Object.keys(DONKEY_ASSEMBLY.palette)).toEqual(['coat', 'pale', 'limb', 'hoof', 'pupil'])
    expect(DONKEY_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
    expect(feature('nose').paint.base).toBe('hoof')
    expect(feature('stripe').paint.base).toBe('hoof')
    expect(feature('leg').paint.patch!.below).toBe('hoof')
  })
})

/* ===================================================================== *
 * 3. THE TAIL: `wedge-07`, spun to hang rather than curl
 * ===================================================================== */

describe('animal-donkey: the tail is spun over, because its native curl is a cat\'s', () => {
  it('roots at the BOTTOM of its own range unspun, and at the TOP once spun', () => {
    const tail = partById('wedge-07')!
    expect(tail.attachment!.axis).toBe('z')
    const zMax = Math.max(...[...new Set(tail.indices)].map(vi => tail.positions[vi * 3 + 2]!))
    const zMin = Math.min(...[...new Set(tail.indices)].map(vi => tail.positions[vi * 3 + 2]!))
    const sinkLineZ = zMax - tail.attachment!.sunkFractionMean * (zMax - zMin)
    const rootYsUnspun = [...new Set(tail.indices)]
      .filter(vi => tail.positions[vi * 3 + 2]! >= sinkLineZ - 1e-9)
      .map(vi => tail.positions[vi * 3 + 1]!)
    // Unspun, the root cluster is the BOTTOM of the local y range: a low root
    // with the free fall curling up, which is the cat's own resting posture.
    expect(Math.max(...rootYsUnspun)).toBeLessThan(-0.1)
    expect(feature('tail').spin).toEqual([{ axis: 'z', deg: 180 }])
    expect(feature('tail').part).toBe('wedge-07')
  })

  it('joins at the rear plate\'s own top, embedded rather than floating', () => {
    const rear = plane_('box-03', 2, -0.625)
    expect(rear.hi[1]).toBeCloseTo(1.11875, 6)
    const at = feature('tail').placement
    if (at.kind === 'single') {
      expect(at.at[1]).toBeCloseTo(1.11875 - 0.5233, 4)
      expect(at.at[2]).toBe(-0.625)
    }
    const g = build()
    const t = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    // Hangs from near the rump down to just above the ground, not up over the
    // back — the opposite silhouette from the unspun/cat reading.
    expect(t.max.y).toBeLessThan(1.13)
    expect(t.min.y).toBeGreaterThan(0)
    expect(t.min.y).toBeLessThan(LEG_ROW.y)
  })
})

/** Everything a shell has on one plane, and how far it reaches on the other two. */
function plane_(id: string, axis: 0 | 1 | 2, at: number): { n: number; lo: [number, number]; hi: [number, number] } {
  const on = worldPoints(id).filter(p => Math.abs(p[axis] - at) < 1e-6)
  const other = ([0, 1, 2] as const).filter(a => a !== axis) as [0 | 1 | 2, 0 | 1 | 2]
  return {
    n: on.length,
    lo: [Math.min(...on.map(p => p[other[0]])), Math.min(...on.map(p => p[other[1]]))],
    hi: [Math.max(...on.map(p => p[other[0]])), Math.max(...on.map(p => p[other[1]]))],
  }
}

/* ===================================================================== *
 * 4. BUDGET
 * ===================================================================== */

describe('animal-donkey: the small hull pays for the ear and the tail', () => {
  it('stays inside the pack\'s triangle budget', () => {
    const g = build()
    let tris = 0
    g.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) tris += m.geometry.getIndex()!.count / 3
    })
    expect(tris).toBeLessThan(MODEL_TRIS_MAX)
    expect(HORSE_ASSEMBLY.motion).toBeDefined()
    expect(DONKEY_ASSEMBLY.motion?.map(m => `${m.kind}:${m.parts.join()}`))
      .toEqual(['wag:tail', 'twitch:ear'])
    expect(DONKEY_ASSEMBLY.flag).toBeUndefined()
  })
})
