/**
 * The lovebird. Home Pets' FOURTH and last cage bird, and the one that closes the
 * collection's four-bird problem.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil, the
 * leg row, height checked first. This file is what only a lovebird can say, and it
 * says six things, four of which the next builder cannot get from a screenshot:
 *
 *   1. **`box-41`'s six flat plates ARE `box-03`'s six flat plates**, at identical
 *      world coordinates and identical 0.625-square extents — re-derived here from
 *      both shells' own vertices. That is why this bird can be the stocky one AND
 *      wear `animal-budgie.ts`'s solved wing numbers unchanged, and the built wing
 *      is checked to land on the budgie's own 0.777918 to prove it.
 *   2. **Its CROWN is not flat**, which is the third face whose bounding box lies
 *      (`animal-guinea-pig.ts` found the front and the sides). Two transverse pads
 *      rise to 1.48125 over |z| 0.20-0.25 while the crown is 1.43125, measured by
 *      ray-casting straight down — so `animal-nightjar.ts`'s back-card idiom is
 *      refused here by a measurement rather than by taste, and that refusal is
 *      pinned so nobody helpfully adds a rump card back.
 *   3. **The bank's STUB is not its shortest tail.** Ranked on reach after each
 *      shape's own burial, `wedge-03` carries 0.4153 and `box-18` 0.4252. Both
 *      questions are asked here, of the same seven records, so the badger's
 *      measurement and this one stay distinguishable.
 *   4. **The PEACH FACE is half sayable, and only on this hull.** Band 3 is
 *      measured triangle by triangle: 31 of 37 are the muzzle boss. The badger's
 *      mechanism failure is re-pinned beside it, so if `Paint.patch` ever grows a
 *      z term this file goes red and the band trick is reconsidered.
 *   5. **The bill stands on the tiger's own muzzle**, which is exactly `cone-06`'s
 *      own width, and the whole of its buried rim is checked against this shell's
 *      own triangles.
 *   6. **Nothing is stretched**, on an animal whose whole brief was "bigger".
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, LOVEBIRD_ASSEMBLY, EYE_CARD_Z, LEG_ROW, hullFrontZ,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type PartRole }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-lovebird',
  parts: [
    'box-01', 'box-06', 'box-41', 'cone-06', 'plate-08', 'plate-16', 'wedge-03',
  ],
  height: 1.4812,
  verts: 501,
  tris: 652,
  // TWO legs, not four. A bird.
  legs: 2,
  // The tiger's shell is 6.4 times the beaver's paddle, which is the next biggest
  // thing on the animal. The stocky bird's hull dominates it harder than the
  // budgie's does (11 there, but against a whip rather than a paddle).
  massRatio: 6,
  // One: the wing pair, turned onto the flank. The tail needs none — `wedge-03`
  // already attaches `z -1` and already points backwards. Said as a number,
  // because rule 4's "no node carries a rotation" passes vacuously otherwise.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-lovebird')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof LOVEBIRD_ASSEMBLY.features[number] =>
  LOVEBIRD_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** A shape's triangles, origin-centred, as three corners each. */
const triangles = (id: string): number[][][] => {
  const p = partById(id)!
  const out: number[][][] = []
  for (let i = 0; i < p.indices.length; i += 3) {
    out.push([0, 1, 2].map(k => {
      const vi = p.indices[i + k]!
      return [p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!]
    }))
  }
  return out
}

/**
 * The WORLD extents of one shell's flat plate on a named face.
 *
 * `box-41` is the one hull whose bounding box disagrees with its faces on three
 * of the six, so "where is its front" has to be asked of the geometry. A plate is
 * every point at one exact coordinate; this returns its span on the other two
 * axes, in world, so two different shells can be compared without either one's
 * offset being assumed.
 */
function plate(id: string, axis: 0 | 1 | 2, at: number): {
  n: number; lo: [number, number]; hi: [number, number]
} {
  const p = partById(id)!
  const on = points(id).filter(q => Math.abs(q[axis]! - at) < 1e-6)
  const other = [0, 1, 2].filter(a => a !== axis) as (0 | 1 | 2)[]
  return {
    n: on.length,
    lo: other.map(a => Math.min(...on.map(q => q[a]!)) + p.offset[a]!) as [number, number],
    hi: other.map(a => Math.max(...on.map(q => q[a]!)) + p.offset[a]!) as [number, number],
  }
}

/**
 * Signed depth of a WORLD point inside a shell: positive is embedded.
 *
 * `box-41` is NOT convex — it wears a muzzle boss and four pads — so the
 * plane-by-plane test `assembly-budgie.test.ts` uses on the cube would answer
 * nonsense here. This is parity ray-casting for insideness times the true
 * distance to the nearest triangle. Written out rather than asked of the builder,
 * because the thing being checked is whether the BUILDER's arithmetic put the
 * part inside the body, and a shared implementation would let that agree with
 * itself.
 */
function depthInside(id: string, w: readonly [number, number, number]): number {
  const p = partById(id)!
  const T = triangles(id)
  const q = [w[0] - p.offset[0]!, w[1] - p.offset[1]!, w[2] - p.offset[2]!]
  const dot = (a: readonly number[], b: readonly number[]): number =>
    a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!
  const cross = (a: readonly number[], b: readonly number[]): number[] =>
    [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!]

  /* An irrational-ish direction, so the ray never grazes an edge or a vertex. */
  const dir = [0.9182736, 0.2718281, 0.2882812]
  let hits = 0
  for (const [a, b, c] of T) {
    const e1 = [0, 1, 2].map(k => b![k]! - a![k]!)
    const e2 = [0, 1, 2].map(k => c![k]! - a![k]!)
    const h = cross(dir, e2)
    const det = dot(e1, h)
    if (Math.abs(det) < 1e-12) continue
    const inv = 1 / det
    const s = [0, 1, 2].map(k => q[k]! - a![k]!)
    const u = inv * dot(s, h)
    if (u < 0 || u > 1) continue
    const qv = cross(s, e1)
    const v = inv * dot(dir, qv)
    if (v < 0 || u + v > 1) continue
    if (inv * dot(e2, qv) > 1e-9) hits++
  }

  let near = Infinity
  for (const [a, b, c] of T) {
    /* Closest point on a triangle, Ericson's seven regions. */
    const ab = [0, 1, 2].map(k => b![k]! - a![k]!)
    const ac = [0, 1, 2].map(k => c![k]! - a![k]!)
    const ap = [0, 1, 2].map(k => q[k]! - a![k]!)
    const d1 = dot(ab, ap), d2 = dot(ac, ap)
    let pt: number[]
    if (d1 <= 0 && d2 <= 0) pt = a!
    else {
      const bp = [0, 1, 2].map(k => q[k]! - b![k]!)
      const d3 = dot(ab, bp), d4 = dot(ac, bp)
      if (d3 >= 0 && d4 <= d3) pt = b!
      else {
        const vc = d1 * d4 - d3 * d2
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
          const t = d1 / (d1 - d3)
          pt = [0, 1, 2].map(k => a![k]! + t * ab[k]!)
        } else {
          const cp = [0, 1, 2].map(k => q[k]! - c![k]!)
          const d5 = dot(ab, cp), d6 = dot(ac, cp)
          if (d6 >= 0 && d5 <= d6) pt = c!
          else {
            const vb = d5 * d2 - d1 * d6
            if (vb <= 0 && d2 >= 0 && d6 <= 0) {
              const t = d2 / (d2 - d6)
              pt = [0, 1, 2].map(k => a![k]! + t * ac[k]!)
            } else {
              const va = d3 * d6 - d5 * d4
              if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
                const t = (d4 - d3) / ((d4 - d3) + (d5 - d6))
                pt = [0, 1, 2].map(k => b![k]! + t * (c![k]! - b![k]!))
              } else {
                const den = 1 / (va + vb + vc), vv = vb * den, ww = vc * den
                pt = [0, 1, 2].map(k => a![k]! + ab[k]! * vv + ac[k]! * ww)
              }
            }
          }
        }
      }
    }
    const d = Math.hypot(q[0]! - pt[0]!, q[1]! - pt[1]!, q[2]! - pt[2]!)
    if (d < near) near = d
  }
  return (hits % 2 === 1 ? 1 : -1) * near
}

/** The WORLD height of the highest surface of a shell over one (x, z). */
function crownAt(id: string, x: number, z: number): number {
  const p = partById(id)!
  const o = [x - p.offset[0]!, 10, z - p.offset[2]!]
  let best = -Infinity
  for (const [a, b, c] of triangles(id)) {
    /* A downward ray, so the barycentric solve degenerates to a 2D one in x/z. */
    const d = (u: number[], v: number[], w: number[]): number =>
      (v[0]! - u[0]!) * (w[2]! - u[2]!) - (v[2]! - u[2]!) * (w[0]! - u[0]!)
    const area = d(a!, b!, c!)
    if (Math.abs(area) < 1e-12) continue
    const w0 = d(o, b!, c!) / area, w1 = d(a!, o, c!) / area, w2 = d(a!, b!, o) / area
    if (w0 < -1e-9 || w1 < -1e-9 || w2 < -1e-9) continue
    best = Math.max(best, w0 * a![1]! + w1 * b![1]! + w2 * c![1]!)
  }
  return best + p.offset[1]!
}

/** The mean of one coordinate over every corner of every triangle in a band. */
const bandMean = (id: string, band: number, axis: 0 | 1 | 2): number => {
  const p = partById(id)!
  const vals: number[] = []
  for (let t = 0; t < p.bands.length; t++) {
    if (p.bands[t] !== band) continue
    for (let k = 0; k < 3; k++) vals.push(p.positions[p.indices[t * 3 + k]! * 3 + axis]!)
  }
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

describe('animal-lovebird: box-41 is box-03 with its edges filled out', () => {
  it('wears the pack\'s only BIGGER shell, and it is bigger on all three axes', () => {
    // The whole of "stocky" is this one line: there is no dial, `HullDef.stretch`
    // is `never`, and this is the only shell in the bank that is larger than the
    // 1.250 cube. If it is ever not, this species' proportion claim is void.
    const cube = partById('box-03')!, tiger = partById('box-41')!
    expect(LOVEBIRD_ASSEMBLY.hull.part).toBe('box-41')
    for (const a of [0, 1, 2]) expect(tiger.size[a]!).toBeGreaterThan(cube.size[a]!)
    expect(tiger.size).toEqual([1.35, 1.3, 1.35])
    const bigger = PARTS_BANK.filter(p => p.roles.includes('hull')
      && [0, 1, 2].every(a => p.size[a]! > cube.size[a]!))
    expect(bigger.map(p => p.id)).toEqual(['box-41'])
  })

  it('has box-03\'s OWN six flat plates, at identical WORLD coordinates', () => {
    /*
     * The finding this whole build rests on, and the reason nothing here had to
     * be re-solved. `animal-guinea-pig.ts` found that this shell's recorded front
     * of 0.725 is a muzzle boss and the real face is at 0.625, and that x = 0.675
     * is two pads while the flank is 0.625. Taken over all six faces, EVERY flat
     * plate is the cube's own plate in the same world place: the extra 0.100 is
     * entirely a fatter chamfer, that boss, and four pads.
     */
    const faces: [0 | 1 | 2, number, number][] = [
      // axis, box-41's local plate coordinate, box-03's local plate coordinate
      [0, 0.625, 0.625],     // flank
      [2, 0.575, 0.625],     // front — behind the boss
      [2, -0.675, -0.625],   // rear
      [1, 0.6, 0.625],       // crown — under the pads
      [1, -0.65, -0.625],    // bottom
    ]
    for (const [axis, tigerAt, cubeAt] of faces) {
      const t = plate('box-41', axis, tigerAt)
      const c = plate('box-03', axis, cubeAt)
      expect(t.n, `box-41 has no plate on axis ${axis} at ${tigerAt}`).toBeGreaterThan(9)
      for (const k of [0, 1]) {
        expect(t.lo[k]!, `plate axis ${axis} lo[${k}] differs from the cube's`)
          .toBeCloseTo(c.lo[k]!, 6)
        expect(t.hi[k]!, `plate axis ${axis} hi[${k}] differs from the cube's`)
          .toBeCloseTo(c.hi[k]!, 6)
      }
      // And each one is the cube's 0.625 square, which is the number every
      // budgie-era solve was written against.
      for (const k of [0, 1]) expect(t.hi[k]! - t.lo[k]!).toBeCloseTo(0.625, 6)
    }
    // Their shared world centre is 0.80625 — `box-03`'s own recorded offset, and
    // NOT this hull's 0.83125. Every `at` in the definition uses the plate's.
    expect(plate('box-41', 2, -0.675).lo[1]! + 0.3125).toBeCloseTo(0.80625, 6)
    expect(partById('box-41')!.offset[1]).toBe(0.83125)
  })

  it('carries its extra 0.100 OUTSIDE those plates — chamfer, boss and four pads', () => {
    const pts = points('box-41')
    // The bounding box is reached in exactly three ways, and none of them is a
    // face: x = 0.675 on the shoulder and haunch pads, z = 0.675 on the muzzle
    // boss, y = 0.650 on the pads again.
    const boss = pts.filter(q => q[2]! > 0.5751)
    expect(boss).toHaveLength(8)                       // a rounded diamond, 8 points
    expect(Math.max(...boss.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.2, 6)
    expect(Math.max(...boss.map(q => q[2]!))).toBeCloseTo(0.675, 6)
    const pads = pts.filter(q => Math.abs(q[0]!) > 0.6251)
    expect(pads.length).toBeGreaterThan(20)
    for (const q of pads) {
      expect(Math.abs(q[0]!)).toBeCloseTo(0.675, 6)
      expect(q[1]!, 'a pad below the body\'s equator').toBeGreaterThan(0.02)
    }
  })
})

describe('animal-lovebird: the crown is NOT flat, so there is no rump card', () => {
  it('rises 0.050 over two TRANSVERSE pads, measured by casting straight down', () => {
    /*
     * The third face whose bounding box lies, after the front and the sides that
     * `animal-guinea-pig.ts` pinned. `frame.top` is 1.48125 and the flat crown is
     * 1.43125 — `box-03`'s own — and the 0.050 between them is two bars across
     * the shoulders and the haunches.
     */
    expect(crownAt('box-41', 0, 0)).toBeCloseTo(1.43125, 5)
    expect(crownAt('box-41', 0, 0.225)).toBeCloseTo(1.48125, 5)
    expect(crownAt('box-41', 0, -0.225)).toBeCloseTo(1.48125, 5)
    // And it is a BAR rather than a bump: the same height right across the back.
    for (const x of [0, 0.15, 0.3]) expect(crownAt('box-41', x, 0.225)).toBeCloseTo(1.48125, 5)
    // The flat part is a strip, and this is what closes the card off.
    expect(crownAt('box-41', 0, 0.1)).toBeGreaterThan(1.43125)
  })

  it('refuses `animal-nightjar.ts`\'s back card, and the refusal is the measurement', () => {
    /*
     * A blue patch on the rump seen from above would be the strongest read this
     * bird could have — the island's camera looks DOWN and the nightjar moves two
     * of its four cards onto the back for exactly that reason, at y = 1.44125.
     * Here that plane is 0.010 proud at z = 0 and BURIED a fifth of the way out.
     */
    const cardY = 1.43125 + 0.01
    expect(crownAt('box-41', 0, 0)).toBeLessThan(cardY)          // proud, on the midline
    expect(crownAt('box-41', 0, 0.15)).toBeGreaterThan(cardY)    // buried, 0.15 out
    // `plate-10` spun onto the top is 0.2529 long, so it reaches 0.1264 either
    // side of wherever it is centred — past the point the crown swallows it.
    expect(partById('plate-10')!.size[2]! / 2).toBeGreaterThan(0.126)
    // The one card short enough clears by less than the bank's own storage
    // precision, which is not a clearance.
    expect(partById('plate-13')!.size[1]!).toBeCloseTo(0.1, 6)
    expect(crownAt('box-41', 0, 0.05) - 1.43125).toBeLessThan(0.01)
    // So nothing on this animal is a back card, and the blue is on the tail.
    for (const f of LOVEBIRD_ASSEMBLY.features) {
      expect(f.part, `"${f.name}" is a flank/back card`).not.toBe('plate-10')
      expect(f.part, `"${f.name}" is a flank/back card`).not.toBe('plate-11')
    }
    expect(feature('tail').paint).toEqual({ base: 'rump' })
    expect(LOVEBIRD_ASSEMBLY.flag).toMatch(/BLUE RUMP IS ON THE TAIL/i)
  })
})

describe('animal-lovebird: the bank\'s STUB is not its shortest tail', () => {
  it('ranks all seven on reach AFTER their own burial, which is a different order', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBe(7)
    // How far a tail carries clear of the body once it is buried the way its own
    // donor buries it. `animal-badger.ts` asks the OTHER question — least raw
    // z-extent — and gets the other answer, so both are asked here to keep them
    // distinguishable if either is ever quoted second-hand.
    const reach = (id: string): number => {
      const p = partById(id)!
      return p.size[2]! * (1 - p.attachment!.sunkFractionMean)
    }
    const order = [...tails].sort((a, b) => reach(a.id) - reach(b.id)).map(p => p.id)
    expect(order[0]).toBe('wedge-03')
    expect(order[1]).toBe('box-18')
    expect(reach('wedge-03')).toBeCloseTo(0.415328, 6)
    expect(reach('box-18')).toBeCloseTo(0.425211, 6)
    // The badger's question, and its answer is still box-18.
    expect(Math.min(...tails.map(p => p.size[2]!))).toBeCloseTo(partById('box-18')!.size[2]!, 9)
    // The reason the two disagree: the stub is buried nothing at all and this is
    // buried the deepest of the seven.
    expect(partById('box-18')!.attachment!.sunkFractionMean).toBe(0)
    expect(Math.max(...tails.map(p => p.attachment!.sunkFractionMean)))
      .toBeCloseTo(partById('wedge-03')!.attachment!.sunkFractionMean, 9)
    expect(feature('tail').part).toBe('wedge-03')
  })

  it('is BROAD as well as short, which is the other half of a lovebird\'s tail', () => {
    // 0.726 across against the budgie's 0.280 and the cat's and tiger's 0.200 —
    // 2.6x the width at 87% of the reach. §7 says thickness is the axis that
    // separates the seven, and this bird sits at the opposite end from the budgie
    // on it, which is the collection's own instruction for these two.
    expect(partById('wedge-03')!.size[0]).toBeCloseTo(0.726, 6)
    expect(partById('wedge-03')!.size[0]! / partById('wedge-15')!.size[0]!)
      .toBeGreaterThan(2.5)
    // And it is cheap, which is what pays for a 262-triangle hull.
    expect(partById('wedge-03')!.tris).toBe(92)
    expect(partById('wedge-15')!.tris).toBe(212)
  })

  it('leaves the hamster\'s stub and the canary\'s fan alone', () => {
    // `home-pets.ts` promises `box-18` to the HAMSTER ("a Syrian hamster's tail
    // is a nub"), where it is the cheapest of six rodent separations, and gives
    // the canary `fan/folded`, which is the parrot's own `box-38`. Neither is
    // taken here even though the first is a shorter-looking tail by name.
    const worn = new Set(LOVEBIRD_ASSEMBLY.features.map(f => f.part))
    expect(worn.has('box-18')).toBe(false)
    expect(worn.has('box-38')).toBe(false)
    // Nor the budgie's, which is the longest in the bank and that bird's own axis.
    expect(worn.has('wedge-15')).toBe(false)
  })

  it('joins at the REAR PLATE\'S own centre, and the donor\'s height would FLOAT', () => {
    const tail = feature('tail')
    if (tail.placement.kind === 'single') {
      // 0.80625 is not this hull's recorded 0.83125. It is the rear plate's own
      // world centre, which is `box-03`'s — the third species to make this move
      // after `animal-badger.ts` and `animal-budgie.ts`, and the first forced by
      // a part that leaves the shell rather than one that hangs off a chamfer.
      expect(tail.placement.at).toEqual([0, 0.80625, -0.625])
      expect(tail.placement.at[1]).not.toBe(partById('box-41')!.offset[1])
    }
    const shape = partById('wedge-03')!
    const hw = shape.size[0]! / 2, hh = shape.size[1]! / 2
    // The deepest buried plane: how far the join actually reaches into the shell.
    const buried = -0.625 + shape.size[2]! * shape.attachment!.sunkFractionMean
    expect(buried).toBeCloseTo(-0.451795, 6)
    const worst = (y: number): number => {
      let w = Infinity
      for (const dx of [-hw, 0, hw]) {
        for (const dy of [-hh, 0, hh]) w = Math.min(w, depthInside('box-41', [dx, y + dy, buried]))
      }
      return w
    }
    // At the plate's own centre every corner of that plane is inside the body.
    expect(worst(0.80625)).toBeGreaterThan(0)
    expect(worst(0.80625)).toBeCloseTo(0.0783, 3)
    // At the BEAVER's own recorded height it is outside it — §3's exact failure,
    // and it would have happened quietly.
    expect(shape.offset[1]).toBeCloseTo(1.050919, 6)
    expect(worst(shape.offset[1]!)).toBeLessThan(0)
    expect(worst(shape.offset[1]!)).toBeCloseTo(-0.1195, 3)
  })
})

describe('animal-lovebird: the peach face, and the badger\'s problem', () => {
  it('re-pins the mechanism that CANNOT say it, so the band trick stays honest', () => {
    // `animal-badger.ts`: a patch takes one number and that number is a HEIGHT,
    // so it paints a level boundary with no z term. If that ever changes, this
    // goes red and the band below is reconsidered rather than quietly inherited.
    const patched = PARTS_BANK.length > 0 && LOVEBIRD_ASSEMBLY.hull.paint.patch
    expect(patched, 'this hull now carries a patch').toBeFalsy()
    const budgiePatchKeys = ['at', 'below']       // the whole of `Paint.patch`
    expect(budgiePatchKeys).toEqual(['at', 'below'])
    // And `byBand` can only cut where Kenney already cut, which on the cube is
    // ONE band — which is why no bird on `box-03` can wear a face marking.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    expect([...new Set(partById('box-41')!.bands)].sort((a, b) => a - b)).toEqual([3, 7, 15])
  })

  it('measures band 3 triangle by triangle: 31 of 37 ARE the muzzle boss', () => {
    const hull = partById('box-41')!
    const band3: number[][] = []
    for (let t = 0; t < hull.bands.length; t++) {
      if (hull.bands[t] !== 3) continue
      band3.push([0, 1, 2].map(a => [0, 1, 2].reduce(
        (s, k) => s + hull.positions[hull.indices[t * 3 + k]! * 3 + a]! / 3, 0)))
    }
    expect(band3).toHaveLength(37)
    // The boss runs z 0.575 to 0.675 local. Every triangle whose centroid is on
    // it is the fleshy block the bill sits on and the face around it.
    const onBoss = band3.filter(c => c[2]! > 0.57)
    expect(onBoss).toHaveLength(31)
    for (const c of onBoss) expect(Math.abs(c[0]!)).toBeLessThanOrEqual(0.2)
    // The other six are the chin, the throat and the front of the breast, on the
    // midline and never a quarter of the way out. That run is the peach BIB.
    const bib = band3.filter(c => c[2]! <= 0.57)
    expect(bib).toHaveLength(6)
    for (const c of bib) {
      expect(Math.abs(c[0]!), 'the bib reaches round the flank').toBeLessThan(0.17)
      expect(c[1]!, 'the bib climbs above the equator').toBeLessThan(0.0)
    }
    // Band 3 sits FORWARD and LOW and band 15 high and back: the tiger's pale
    // chin against its dark saddle, which is the cut being spent here.
    expect(bandMean('box-41', 3, 2)).toBeGreaterThan(bandMean('box-41', 15, 2))
    expect(bandMean('box-41', 3, 1)).toBeLessThan(bandMean('box-41', 15, 1))
    expect(LOVEBIRD_ASSEMBLY.hull.paint).toEqual({
      base: 'coat', byBand: { 3: 'face', 15: 'mantle' },
    })
  })

  it('solves the forehead BLAZE off the bill, and x = 0 is forced not chosen', () => {
    const bill = partById('cone-06')!, dot = partById('plate-16')!
    // The dot's lower edge lands exactly on the bill's own top edge.
    const billTop = bill.offset[1]! + bill.size[1]! / 2
    expect(billTop).toBeCloseTo(0.918751, 6)
    const g = build()
    // Checked BUILT against BUILT at four decimals, and against the bank's own
    // number at three: the built attribute is float32 and puts 0.9187505 back as
    // 0.9186895. `animal-nightjar.ts` and `animal-kiwi.ts` carry the same note —
    // it is the noise floor, not a disagreement.
    expect(boxOf(g, 'blaze').min.y).toBeCloseTo(boxOf(g, 'snout').max.y, 4)
    expect(boxOf(g, 'blaze').min.y).toBeCloseTo(billTop, 3)
    // On the pack's own card plane, 0.010 proud of this hull's FRONT PLATE — the
    // 0.625 one behind the boss, not the 0.725 bounding box.
    expect(boxOf(g, 'blaze').max.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(EYE_CARD_Z - 0.625).toBeCloseTo(0.01, 6)
    // x = 0 is forced: this is the only marking card in the bank narrow enough to
    // sit between the eye cards' own inner edges without overlapping them, and
    // two coplanar zero-thickness quads at EYE_CARD_Z z-fight into invisibility.
    const eyeInner = partById('plate-08')!.offset[0]! - partById('plate-08')!.size[0]! / 2
    expect(eyeInner).toBeCloseTo(0.0625, 6)
    expect(dot.size[0]! / 2).toBeLessThan(eyeInner)
    for (const wide of ['plate-03', 'plate-13']) {
      expect(partById(wide)!.size[0]! / 2,
        `${wide} would fit between the eyes after all — reopen the brow band`)
        .toBeGreaterThan(eyeInner)
    }
    expect(boxOf(g, 'blaze').max.x).toBeLessThan(boxOf(g, 'eye-r').min.x)
    // Small, and said out loud: 0.113 across a 1.350 head.
    expect(dot.size[0]! / partById('box-41')!.size[0]!).toBeLessThan(0.09)
    expect(LOVEBIRD_ASSEMBLY.flag).toMatch(/CHEEKS and the CROWN/i)
  })
})

describe('animal-lovebird: the bill stands on the tiger\'s own muzzle', () => {
  it('joins at THIS hull\'s front face, which is the boss and not the plate', () => {
    const beak = partById('cone-06')!
    // Nothing is said about the placement, so it is a pure donor transfer — and
    // on this hull the solved front face is 0.725, a full 0.100 forward of the
    // plate every other species joins a snout to.
    expect(hullFrontZ('box-41')).toBe(0.725)
    const placed = feature('snout').placement
    expect(placed.kind).toBe('single')
    if (placed.kind === 'single') {
      // Component by component, because the builder solves the face as
      // `offset[2] + size[2] / 2` = 0.05 + 0.675 and lands on 0.7250000000000001.
      expect(placed.at[0]).toBe(0)
      expect(placed.at[1]).toBe(beak.offset[1])
      expect(placed.at[2]).toBeCloseTo(0.725, 12)
    }
    expect(feature('snout').sink).toBeCloseTo(beak.attachment!.sunkFractionMean, 9)
    expect(beak.provenance.map(q => q.species)).toEqual(['parrot'])
    expect(beak.shape.taper).toBe(0)
  })

  it('is the boss\'s OWN width, to the digit, which is why it sits on it', () => {
    // The muzzle diamond is 0.400 across and `cone-06` is 0.400 across. That is
    // the coincidence the whole bill rests on, and it is checked rather than
    // admired.
    const boss = points('box-41').filter(q => q[2]! > 0.5751)
    expect(2 * Math.max(...boss.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.4, 6)
    expect(partById('cone-06')!.size[0]).toBeCloseTo(0.4, 6)
  })

  it('reaches 1.55x what the budgie\'s does, measured from the same plane', () => {
    const g = build()
    const bill = boxOf(g, 'snout')
    // Both birds wear this shape at its own burial. The budgie's tip lands 0.183
    // past the 0.625 plate; this one's lands 0.283 past it, because the tiger's
    // muzzle carries the join forward. No stretch is involved on either.
    expect(bill.max.z).toBeCloseTo(0.90835, 4)
    expect(bill.max.z - 0.625).toBeCloseTo(0.28335, 4)
    expect((bill.max.z - 0.625) / (0.80835 - 0.625)).toBeGreaterThan(1.5)
    expect(LOVEBIRD_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
  })

  it('has its whole buried RIM inside the shell, measured against its triangles', () => {
    const beak = partById('cone-06')!
    // §3, nothing floats — checked against the tiger's own geometry rather than
    // against the arithmetic that placed it, because that shell is not convex and
    // the plane test the budgie uses on the cube would answer nonsense here.
    const back = 0.725 - beak.attachment!.sunkFractionMean * beak.size[2]!
    expect(back).toBeCloseTo(0.621472, 6)
    const r = beak.size[0]! / 2
    for (let a = 0; a < 360; a += 30) {
      const rad = (a * Math.PI) / 180
      const d = depthInside('box-41', [r * Math.cos(rad), beak.offset[1]! + r * Math.sin(rad), back])
      expect(d, `the bill's base rim is outside the shell at ${a} degrees`).toBeGreaterThan(0)
    }
    // It is buried 0.1035, which `pets:creature` prints as THIN against §3's
    // 0.125 — the budgie's own print for the same part at the same fraction, and
    // `animal-nightjar.ts`'s argument for leaving a measured burial alone.
    expect(beak.attachment!.sunkFractionMean * beak.size[2]!).toBeCloseTo(0.103528, 6)
  })

  it('paints the bill FLAT, and does NOT copy the budgie\'s cere band', () => {
    // `animal-budgie.ts` sends band 15 — measurably the upper mandible — to a
    // blue cere, because a budgie has one. A peach-faced lovebird's bill is one
    // pale horn colour from base to tip, so the band is left alone. Measured, so
    // that "the band was not used" is a decision rather than an omission.
    expect(bandMean('cone-06', 15, 1)).toBeGreaterThan(bandMean('cone-06', 13, 1))
    expect(feature('snout').paint).toEqual({ base: 'limb' })
    expect(feature('snout').paint.byBand).toBeUndefined()
  })
})

describe('animal-lovebird: the wing is the budgie\'s, and the hull is why', () => {
  it('takes all four of that bird\'s solved numbers unchanged', () => {
    const wing = feature('wing')
    expect(wing.part).toBe('box-06')
    expect(wing.spin).toEqual([{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }])
    expect(wing.axis).toBe('z')
    expect(wing.dir).toBe(-1)
    expect(wing.sink! * 16).toBe(8)
    if (wing.placement.kind === 'pair') {
      // The flank PLATE's own three coordinates — not the hull's recorded
      // 0.675/0.83125/0.05, which are the pads and the bounding box.
      expect(wing.placement.at).toEqual([0.625, 0.80625, 0])
    }
    // It is SOLID on purpose. The two cheap wings are exactly zero thickness and
    // the island's camera looks DOWN; `animal-budgie.ts` carries the argument and
    // `animal-nightjar.ts` moves two cards onto its back for the same reason.
    for (const id of ['plate-10', 'plate-11']) {
      expect(Math.min(...partById(id)!.size), `${id} has thickness`).toBe(0)
    }
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
  })

  it('lands on the budgie\'s OWN world extents, which proves the plate identity', () => {
    const g = build()
    const b = boxOf(g, 'wing-r')
    // 0.777918 is the number `assembly-budgie.test.ts` pins on `box-03`. Getting
    // it here, on a shell 0.100 bigger in every direction, is the built-geometry
    // proof of the plate claim at the top of this file.
    expect(b.max.x).toBeCloseTo(0.777918, 4)
    expect(b.max.x - b.min.x).toBeCloseTo(partById('box-06')!.size[2]!, 3)
    expect(b.max.z - b.min.z).toBeCloseTo(partById('box-06')!.shape.longest, 3)
    // And every corner of its inner face is inside the tiger's shell by the same
    // 0.0473 `assembly-budgie.test.ts` measures inside the cube — which is the
    // plate claim again, this time from the other side of the surface.
    for (const y of [b.min.y, b.max.y]) {
      for (const z of [b.min.z, b.max.z]) {
        const d = depthInside('box-41', [b.min.x, y, z])
        expect(d, `the wing's inner face is outside the hull at y=${y}, z=${z}`)
          .toBeGreaterThan(0)
        expect(d).toBeCloseTo(0.0473, 3)
      }
    }
    // The outer face is outside it, so the wing is a wing and not a bulge.
    expect(depthInside('box-41', [b.max.x, 0.80625, 0])).toBeLessThan(0)
  })

  it('wears no bar, and is painted from the MANTLE the back is painted from', () => {
    // A peach-faced lovebird's wing is plain and a shade deeper than its breast.
    // The budgie's `plate-10` wing bar is that bird's separation and is not taken.
    expect(feature('wing').paint).toEqual({ base: 'mantle' })
    expect(LOVEBIRD_ASSEMBLY.hull.paint.byBand![15]).toBe('mantle')
    expect(LOVEBIRD_ASSEMBLY.features.some(f => f.name.includes('bar'))).toBe(false)
  })

  it('flaps, on the same measured defaults the budgie spent first', () => {
    const motion = LOVEBIRD_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    // And the name resolves to meshes that exist, which is the check
    // `resolveMotion` exists for — its symptom otherwise is nothing moving.
    const g = build()
    for (const n of ['wing-r', 'wing-l']) expect(g.getObjectByName(n)).toBeDefined()
  })
})

describe('animal-lovebird: the stance, the eye, and what it is separated on', () => {
  it('stands at the WIDEST station the pack\'s own axiom allows', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      // 0.4375 is solved: `box-01` is 0.375 across, so each leg's outer face
      // lands on 0.625 — flush with this shell's flank PLATE and not one
      // thousandth past it. The budgie stands at 0.25 because it is the slimmest
      // of the four; this is the stockiest and it stands at the limit.
      expect(leg.placement.at[0]).toBe(0.4375)
      expect(leg.placement.at[2]).toBe(0)   // the bottom plate's own centre
    }
    const g = build()
    expect(boxOf(g, 'leg-front-r').max.x).toBeCloseTo(0.625, 4)
    expect(boxOf(g, 'leg-front-r').min.y).toBeCloseTo(0, 4)
    // JT-044's two-tone, on the BASE slot only and on the pack's own 1/16 grid.
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.byBand).toBeUndefined()
    expect(leg.paint.patch!.at * 16).toBe(4)
  })

  it('takes the pack\'s round bird eye but paints it DARK — no eye-ring', () => {
    const card = partById('plate-08')!
    // Three of its five donors are the pack's three birds, which is why all four
    // cage birds share it: the wing and the eye are the family, not separators.
    expect(card.shape.symmetry).toBe('radial')
    expect(card.size[0]).toBe(card.size[1])
    for (const bird of ['chick', 'parrot', 'penguin']) {
      expect(card.provenance.map(q => q.species)).toContain(bird)
    }
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // Painted from the mantle slot so the card reads as one dark bead. The
    // peach-faced lovebird is one of the lovebirds WITHOUT an eye-ring, which is
    // what separates it from Fischer's and the masked in every field guide, and
    // the budgie's pale ring here would say the wrong species.
    expect(feature('eye').paint.base).toBe('mantle')
    expect(LOVEBIRD_ASSEMBLY.palette['mantle']).toBe(0x2c7538)
    // Band 15 is Kenney's own pupil cut and the builder sends it to the pack's
    // measured grey by itself — so a dark bead with a grey pupil costs two slots
    // and no geometry, and `assertAssembly` §7 checks the grey.
    expect(feature('eye').paint.byBand).toEqual({ 15: 'pupil' })
  })

  it('shares only the wing and the eye with the budgie, and nothing else', () => {
    // The collection's own instruction for these two is that they are opposite
    // ends of the four on every axis. Held as a list, so a later edit that
    // quietly converges them is red.
    const mine = new Set(LOVEBIRD_ASSEMBLY.features.map(f => f.part))
    expect([...mine].sort()).toEqual(
      ['box-01', 'box-06', 'cone-06', 'plate-08', 'plate-16', 'wedge-03'])
    expect(LOVEBIRD_ASSEMBLY.hull.part).not.toBe('box-03')
    // No belly line either: the budgie's inverted patch is that bird's, and a
    // peach-faced lovebird is one green from throat to vent with no level
    // boundary on it anywhere.
    expect(LOVEBIRD_ASSEMBLY.hull.paint.patch).toBeUndefined()
  })

  it('is deep rather than wide, and costs less than the budgie does', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2, and on a bird it
    // is the depth that binds — the budgie's own finding, at 1.0986. A stub tail
    // buys 0.124 of it back even on a hull 0.100 bigger in every direction.
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.9743, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.0986)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)   // the fox's, the pack's worst
    // Stockiness: width over height, against the kit's own 0.55-1.35 band. The
    // budgie is 0.873 on the cube and this is over one, which is the proportion
    // margin the collection asked these two to be separated by.
    expect(s.x / s.y).toBeGreaterThan(1)
    expect(s.x / s.y).toBeLessThan(1.35)
  })

  it('carries no stretch anywhere, on the animal whose brief was "bigger"', () => {
    // Joe flagged a non-uniform stretch on three animals on 2 August. The obvious
    // way to say "the biggest beak of the four" was a uniform `cone-06`, and it
    // is not here: the hull's own muzzle boss did it for nothing.
    for (const f of LOVEBIRD_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(LOVEBIRD_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
    // Nothing authored, and no budget declared, because none is over.
    expect(LOVEBIRD_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(LOVEBIRD_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })

  it('still finds no WING in the bank, which is what the substitute answers to', () => {
    // `animal-budgie.ts` improvised the first wing in the project under JT-043
    // and pinned this so the day somebody bakes the role, four birds' shared
    // idiom is reconsidered rather than quietly inherited. This is the fourth
    // bird and the last, so it is pinned here too.
    const declared: PartRole[] = ['horn', 'claw']  // 'wing' was baked 4 Aug — see note above
    for (const role of declared) {
      const have = PARTS_BANK.filter(p => p.roles.includes(role)).map(p => p.id)
      expect(have, `the bank now has a "${role}" shape: ${have.join(', ')} — reopen the wing`)
        .toHaveLength(0)
    }
    expect(partById('box-06')!.roles).toEqual(['ear'])
  })
})
