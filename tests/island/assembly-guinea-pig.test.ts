/**
 * The guinea pig. Home Pets' big tailless rodent, the first species on `box-41`,
 * and the second test in the project that has to pin something that is NOT there.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a guinea pig can say, and it says
 * five things the next builder needs and cannot get from a screenshot:
 *
 *   1. **The tail is absent ON PURPOSE**, and the absence is pinned as a fact
 *      about the DEFINITION and the BANK rather than as an opinion in a comment.
 *      `box-18` is refused by name and re-measured as the bank's only stub, so a
 *      builder who reaches for it later trips over this file first.
 *   2. **`box-41`'s bounding-box front is a MUZZLE, not a face.** Eight points on
 *      the midline; the broad face behind them is at the usual 0.625. That is why
 *      this species has no snout, and why its eye cards need no correcting.
 *   3. **`box-41`'s half-width is two PADS, not a flank.** The flank plane is the
 *      cube's own 0.625, which is why the ear and the blotch cards are joined by
 *      hand and not left to solve against the bounding box.
 *   4. **The shape's mean burial is a depth neither of its donors has.** `box-32`
 *      is the lion's AND the tiger's, sunk 0.000 and 0.585813; the mean of the two
 *      is the one number that would put the nose in the wrong place.
 *   5. **The patching is three of Kenney's own regions**, and band 15 is measured
 *      here as two connected components — one unbroken region a side, not stripes.
 *      What cannot be drawn is pinned too: every mechanism the kit has is mirrored
 *      in x, so an asymmetric patch is unsayable and the flag says so.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, GUINEA_PIG_ASSEMBLY, CARD_STANDOFF,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, hullFrontZ, LEG_ROW,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-guinea-pig',
  parts: ['box-01', 'box-32', 'box-41', 'plate-01', 'plate-11', 'plate-13', 'tube-04'],
  height: 1.4812,
  verts: 505,
  tris: 671,
  // The hull is the animal here: the next biggest mesh is a LEG, because there is
  // no tail and the ear was halved. Fifty-five times, against the harness's 3.
  massRatio: 40,
  // Zero, out loud. Nothing on this animal is turned, and rule 4's "no node
  // carries a rotation" would otherwise pass for the wrong reason.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-guinea-pig')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

const feature = (name: string): typeof GUINEA_PIG_ASSEMBLY.features[number] =>
  GUINEA_PIG_ASSEMBLY.features.find(f => f.name === name)!

/* --- the three helpers the eye-clearance test needs, and nothing else uses --- */

type Tri = [THREE.Vector3, THREE.Vector3, THREE.Vector3]

/** Every triangle of a built node, in world space. */
const worldTris = (o: THREE.Object3D): Tri[] => {
  const out: Tri[] = []
  o.updateMatrixWorld(true)
  o.traverse((n) => {
    const m = n as THREE.Mesh
    if (!m.isMesh) return
    const pos = m.geometry.getAttribute('position')
    const idx = m.geometry.getIndex()
    const count = idx ? idx.count : pos.count
    for (let i = 0; i < count; i += 3) {
      out.push([0, 1, 2].map((k) => {
        const vi = idx ? idx.getX(i + k) : i + k
        return new THREE.Vector3(pos.getX(vi), pos.getY(vi), pos.getZ(vi))
          .applyMatrix4(m.matrixWorld)
      }) as Tri)
    }
  })
  return out
}

/**
 * The frontmost z at which a line up the +z axis through `(x, y)` crosses a mesh
 * — i.e. the surface the viewer sees there. `NaN` when the line misses it.
 *
 * A ray/plane solve rather than a bounding box, because the whole question this
 * file answers is that `box-41`'s bounding box is NOT its surface.
 */
const surfaceZ = (tris: Tri[], x: number, y: number): number => {
  let best = Number.NaN
  for (const [a, b, c] of tris) {
    const d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
    if (Math.abs(d) < 1e-12) continue                     // edge-on to the ray
    const l1 = ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) / d
    const l2 = ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) / d
    const l3 = 1 - l1 - l2
    if (l1 < -1e-9 || l2 < -1e-9 || l3 < -1e-9) continue  // outside the triangle
    const z = l1 * a.z + l2 * b.z + l3 * c.z
    if (Number.isNaN(best) || z > best) best = z
  }
  return best
}

/** A triangle's area projected onto the xy plane — the area a viewer in front sees. */
const areaXY = ([a, b, c]: Tri): number =>
  Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2

describe('animal-guinea-pig: the tail that is not there, and must not be added', () => {
  it('has no tail feature and wears no shape the pack used as a tail', () => {
    // Said three ways, because a guinea pig's whole share of the six-rodent
    // separation is this absence and only the third way survives a rename.
    expect(feature('tail')).toBeUndefined()
    const tailShapes = new Set(
      PARTS_BANK.filter(p => p.roles.includes('tail')).map(p => p.id))
    expect(tailShapes.size).toBeGreaterThan(5)
    for (const f of GUINEA_PIG_ASSEMBLY.features) {
      expect(tailShapes.has(f.part), `feature "${f.name}" wears the tail shape ${f.part}`)
        .toBe(false)
    }
    // And nothing hangs off the back at all: the hull's own rear face is the
    // rearmost point on the animal, which is what "tailless" looks like measured.
    const g = build()
    expect(new THREE.Box3().setFromObject(g).min.z).toBeCloseTo(boxOf(g, 'hull').min.z, 4)
  })

  it('refuses `box-18` by name — the stub that belongs to the HAMSTER', () => {
    // `home-pets.ts` promises the stub to the hamster ("a Syrian hamster's tail is
    // a nub") and this animal is the one that must not have one. Re-derived rather
    // than believed: `box-18` is the bank's shortest reach by a clear margin, so it
    // is exactly what a builder shopping for "a very small tail" would find.
    expect(GUINEA_PIG_ASSEMBLY.features.some(f => f.part === 'box-18')).toBe(false)
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    const reach = (id: string): number => partById(id)!.size[2]!
    expect(Math.min(...tails.map(p => reach(p.id)))).toBeCloseTo(reach('box-18'), 6)
    expect(reach('box-18')).toBeLessThan(reach('box-23') / 2)
    // If that ever stops being true the argument in the species file changes and
    // this test is the place it gets re-read.
  })
})

describe('animal-guinea-pig: box-41 has a MUZZLE in its shell, not a flat front', () => {
  it('reaches 0.725 on EIGHT midline points and nowhere else', () => {
    // `hulls.ts` records this hull's front at 0.725 and that is its bounding box.
    // The geometry there is a rounded diamond on the centre line — a muzzle, fused
    // into the body, which is why this species has no snout feature.
    expect(hullFrontZ('box-41')).toBe(0.725)
    const hull = partById('box-41')!
    const hz = Math.max(...points('box-41').map(q => Math.abs(q[2])))
    const front = points('box-41').filter(q => Math.abs(q[2] - hz) < 1e-6)
    expect(front).toHaveLength(8)
    for (const q of front) {
      expect(Math.abs(q[0])).toBeLessThanOrEqual(0.2 + 1e-4)  // 0.40 across at most
      expect(q[1]).toBeGreaterThanOrEqual(-0.3375 - 1e-4)
      expect(q[1]).toBeLessThanOrEqual(0.0625 + 1e-4)         // and 0.40 tall at most
    }
    // The broad face is the one behind it, and it is the SAME plane the seven
    // usual hulls carry. `hull.offset[2]` is 0.05, so 0.575 local is 0.625 world.
    expect(hull.offset[2]).toBeCloseTo(0.05, 6)
    const broad = points('box-41').filter(q => Math.abs(q[2] - 0.575) < 1e-6)
    expect(broad.length).toBeGreaterThan(front.length)
    expect(0.575 + hull.offset[2]!).toBeCloseTo(HULL_FRONT_Z_USUAL, 6)
    // So: no snout. One mass, and the muzzle is IN it.
    expect(feature('snout')).toBeUndefined()
  })

  it('leaves the eye cards exactly where the pack puts them, and the tiger agrees', () => {
    const card = partById('plate-01')!
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // The surface under the card is the 0.625 face plane, so the pair floats the
    // pack's own 0.010 of daylight — the same as on `box-03`, with nothing said.
    expect(EYE_CARD_Z - HULL_FRONT_Z_USUAL).toBeCloseTo(CARD_STANDOFF, 9)
    // And this is not a card being borrowed onto a hull it never met: sixteen
    // species donate `plate-01` and the TIGER, whose hull this is, is one of them.
    expect(card.provenance.map(q => q.species)).toContain('tiger')
  })

  it('stands both eye cards CLEAR of the hull surface — the check the suite cannot make', () => {
    // **THIS IS THE ONE `assertAssembly` CANNOT CATCH.** `assembly-assert.ts` asks
    // whether an eye card's z EQUALS `EYE_CARD_Z` and stops there; it never asks
    // whether the HULL is in front of the card at that (x, y). So a card buried
    // inside a shell passes every shared invariant and the whole suite stays green
    // while the animal has no eyes. It is the same class of fault as the mouth bug
    // `CARD_STANDOFF` fixed — a card coplanar with the face it joined, z-fighting
    // into invisibility — and it can only be caught by measuring the built geometry,
    // which is what this test does and why it lives here and not there.
    //
    // The question is real on THIS hull and on no other in the pack: `box-41` is the
    // only shell whose bounding-box front (0.725) stands PROUD of `EYE_CARD_Z`
    // (0.6350), and z is not a field on an eye, so if the surface under the card
    // were really at 0.725 the pair would sit 0.090 INSIDE the head with no dial to
    // pull them out. Measured, it is not: 0.725 belongs to the muzzle boss on the
    // midline, and at the card's own (x, y) the surface is the broad face.
    const g = build()
    const hull = worldTris(g.getObjectByName('hull')!)
    for (const nm of ['eye-r', 'eye-l']) {
      const p = world(g, nm)
      const z = surfaceZ(hull, p.x, p.y)
      expect(Number.isNaN(z), `${nm} is not over the hull at all`).toBe(false)
      // The broad face, not the bounding box: 0.625, the same plane as `box-03`.
      expect(z).toBeCloseTo(HULL_FRONT_Z_USUAL, 4)
      // POSITIVE margin, said as a floor first and then as the exact number, so a
      // later change that shaves it reads as "the eye is being buried" and not as a
      // constant that drifted.
      expect(p.z - z, `${nm} is buried ${(z - p.z).toFixed(4)} inside the hull`)
        .toBeGreaterThan(0)
      expect(p.z - z).toBeCloseTo(CARD_STANDOFF, 4)
    }
  })

  it('lets the muzzle clip only the pupil\'s inner-lower corner, and pins how much', () => {
    // The honest remainder of the test above. The card is 0.400 x 0.320 and the
    // muzzle boss is 0.40 across on the midline, so the two do OVERLAP at the card's
    // inner-lower corner — where the boss stands at 0.725 and the card at 0.635, a
    // 0.090 burial. Measured over the card's own 27 triangles it is 3.5% of the card
    // and 8.1% of the pupil: the corner of the dark blob nearest the nose is tucked
    // behind the muzzle, and the eye reads. Pinned as a BOUND rather than praised, so
    // that a later change to the eye's x or y — the only two dials it has — cannot
    // walk the pair into the boss without this going red.
    const g = build()
    const hull = worldTris(g.getObjectByName('hull')!)
    const eye = g.getObjectByName('eye-r')!
    const card = worldTris(eye)
    const bands = partById('plate-01')!.bands
    expect(card).toHaveLength(bands.length)          // triangle order is the bank's
    const cardZ = card[0]![0].z
    expect(cardZ).toBeCloseTo(EYE_CARD_Z, 4)

    const N = 16
    let area = 0, hidden = 0, pupil = 0, pupilHidden = 0
    let worst = Infinity
    const seen: THREE.Vector2[] = []
    for (let t = 0; t < card.length; t++) {
      const tri = card[t]!
      const a = areaXY(tri)
      let inside = 0, all = 0
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N - i; j++) {
          const u = (i + 1 / 3) / N, v = (j + 1 / 3) / N, w = 1 - u - v
          const x = tri[0].x * u + tri[1].x * v + tri[2].x * w
          const y = tri[0].y * u + tri[1].y * v + tri[2].y * w
          const z = surfaceZ(hull, x, y)
          all++
          if (Number.isNaN(z)) continue
          if (cardZ - z < worst) worst = cardZ - z
          if (cardZ - z <= 0) { inside++; seen.push(new THREE.Vector2(x, y)) }
        }
      }
      area += a
      hidden += a * (inside / all)
      if (bands[t] === 15) { pupil += a; pupilHidden += a * (inside / all) }
    }
    // Small, and real — both directions, because "0%" would mean the muzzle had
    // moved and "20%" would mean the eye had.
    expect(hidden / area).toBeGreaterThan(0)
    expect(hidden / area).toBeLessThan(0.05)
    expect(pupilHidden / pupil).toBeLessThan(0.10)
    // The deepest the hull ever stands in front of this card, and it is exactly the
    // boss's own 0.100 of relief less the card's 0.010 of daylight.
    expect(worst).toBeCloseTo(HULL_FRONT_Z_USUAL - hullFrontZ('box-41') + CARD_STANDOFF, 4)

    // And it is the MUZZLE doing it and nothing else: every hidden sample lies
    // inside the boss's own footprint — |x| <= 0.200 and below its apex, which is
    // 0.0625 above the hull's centre. Nothing on the flat face or the chamfer is in
    // front of this card anywhere.
    const apex = partById('box-41')!.offset[1]! + 0.0625
    expect(seen.length).toBeGreaterThan(0)
    for (const q of seen) {
      expect(Math.abs(q.x)).toBeLessThanOrEqual(0.2 + 1e-6)
      expect(q.y).toBeLessThanOrEqual(apex + 1e-6)
    }
  })

  it('hangs the nose on the muzzle at the TIGER\'s burial, not at the shape\'s mean', () => {
    const nose = partById('box-32')!
    // Two donors, and they wear it completely differently: the lion sits it on a
    // flat face plate (0.000) and the tiger buries it in a muzzle (0.585813). The
    // recorded MEAN is therefore a depth neither animal has, and using it would
    // stand this nose 0.050 too far forward.
    expect(new Set(nose.provenance.map(q => q.species))).toEqual(new Set(['lion', 'tiger']))
    expect(nose.attachment!.sunkFractionMin).toBe(0)
    expect(nose.attachment!.sunkFractionMax).toBeCloseTo(0.585813, 6)
    expect(nose.attachment!.sunkFractionMean)
      .toBeCloseTo(nose.attachment!.sunkFractionMax / 2, 5)
    expect(feature('nose').sink).toBeCloseTo(nose.attachment!.sunkFractionMax, 6)

    // Solved from the join, then checked against a number the solve never used:
    // join at this hull's front face, sink the tiger's own burial, and the centre
    // lands on the bank's recorded offset for the shape.
    const solved = (sink: number): number =>
      hullFrontZ('box-41') + nose.size[2]! / 2 - sink * nose.size[2]!
    expect(solved(nose.attachment!.sunkFractionMax)).toBeCloseTo(nose.offset[2]!, 5)
    expect(solved(nose.attachment!.sunkFractionMean) - nose.offset[2]!).toBeCloseTo(0.05, 4)
    // Four decimals on the built attribute, which is float32.
    expect(world(build(), 'nose').z).toBeCloseTo(nose.offset[2]!, 4)
    // Its back face rests on the broad face plane, so the nose spans the muzzle
    // rather than perching on its tip. §3: nothing floats.
    expect(boxOf(build(), 'nose').min.z).toBeCloseTo(HULL_FRONT_Z_USUAL, 3)
  })

  it('lets the mouth card SOLVE, and does not copy the hard-coded 0.635', () => {
    // `CARD_STANDOFF` fixed the bug that the goldfish, the firefly and the
    // glow-worm each worked around by typing `at: [0, 0.686849, 0.635]`. A mouth on
    // THIS hull has to sit at the muzzle's apex, and the default now puts it there.
    const mouth = feature('mouth')
    expect(mouth.part).toBe('plate-13')
    expect(partById('plate-13')!.size[2]).toBe(0)
    if (mouth.placement.kind === 'single') {
      expect(mouth.placement.at[2]).toBeCloseTo(hullFrontZ('box-41') + CARD_STANDOFF, 9)
      expect(mouth.placement.at[2]).not.toBeCloseTo(EYE_CARD_Z, 3)
      // The height is the card's own recorded one, which is also the muzzle
      // diamond's widest row — the two agree without either being aimed at.
      expect(mouth.placement.at[1]).toBeCloseTo(partById('plate-13')!.offset[1]!, 6)
    }
  })
})

describe('animal-guinea-pig: box-41\'s half-width is two PADS, and the flank is 0.625', () => {
  it('reaches 0.675 only on the tiger\'s shoulder and haunch', () => {
    const hull = partById('box-41')!
    expect(hull.size[0]).toBeCloseTo(1.35, 6)
    const wide = points('box-41').filter(q => Math.abs(Math.abs(q[0]) - 0.675) < 1e-6)
    // Every one of them inside one narrow horizontal band, and split into two
    // groups fore and aft: pads, not a flank.
    expect(wide.length).toBeGreaterThan(0)
    for (const q of wide) {
      expect(q[1]).toBeGreaterThan(0.029 - 1e-3)
      expect(q[1]).toBeLessThan(0.303 + 1e-3)
      expect(Math.abs(q[2]) > 0.088 - 1e-3).toBe(true)
    }
    // And the plane the body actually presents is the CUBE's own half-width, which
    // is the whole reason the ear and the blotches below are joined by hand.
    const flank = points('box-41').filter(q => Math.abs(Math.abs(q[0]) - 0.625) < 1e-6)
    expect(flank.length).toBeGreaterThan(wide.length)
    expect(partById('box-03')!.size[0]! / 2).toBeCloseTo(0.625, 6)
  })

  it('joins the ear at that flank plane, and recovers the elephant\'s own offset', () => {
    const ear = partById('tube-04')!
    // The bank holds exactly three ear shapes that attach on x. `box-25` is the
    // koala dish and is the CHINCHILLA's separation, so this pair is the only
    // side-mounted ear left — and it is the right one: its recorded y sits BELOW
    // this hull's own centre, which is what "set low on the sides" measures as.
    const sideEars = PARTS_BANK
      .filter(p => p.roles.includes('ear') && p.attachment?.axis === 'x').map(p => p.id)
    expect(sideEars.sort()).toEqual(['box-25', 'tube-04', 'tube-05'])
    expect(ear.offset[1]).toBeLessThan(partById('box-41')!.offset[1]!)

    // AT FULL SIZE the transfer is exact, and that recovery is the evidence the
    // join point is right — the elephant wears this shape on `box-03`, whose flank
    // is the same 0.625 this hull presents.
    const full = 0.625 + ear.size[0]! / 2 - ear.attachment!.sunkFractionMean * ear.size[0]!
    expect(full).toBeCloseTo(ear.offset[0]!, 6)
    const placed = feature('ear').placement
    if (placed.kind === 'pair') {
      expect(placed.at).toEqual([0.625, ear.offset[1], ear.offset[2]])
    }
    // Left to solve it would have joined at the PADS' plane and stood clear of the
    // flank by the difference. Pinned, because that is the mistake this hull invites.
    expect(0.675 - 0.625).toBeCloseTo(0.05, 9)
  })

  it('halves the ear UNIFORMLY, into the pack\'s own small-ear size class', () => {
    const ear = partById('tube-04')!
    expect(feature('ear').stretch).toEqual([0.5, 0.5, 0.5])
    // Uniform, so nothing is deformed: the shape stays Kenney's and only its size
    // is ours. §3 measured ears varying 2.97x naturally and says stretching an ear
    // is safe; JT-043 is Joe's own "a bit of clever sizing... will get a lot done".
    const heights = PARTS_BANK.filter(p => p.roles.includes('ear'))
      .map(p => p.size[1]!).sort((a, b) => a - b)
    const median = heights[(heights.length - 1) / 2]!
    // At its own size this is the third tallest ear SHAPE in the bank — behind
    // only the rabbit's `box-06`/`box-07` and the koala's dish, and the count is
    // over distinct heights because handed pairs are one shape twice. Halved it
    // lands just under the median, beside the beaver's little round button.
    const distinct = [...new Set(heights.map(h => h.toFixed(6)))].sort()
    expect(distinct.slice(-3)).toContain(ear.size[1]!.toFixed(6))
    expect(distinct.slice(-2)).not.toContain(ear.size[1]!.toFixed(6))
    expect(ear.size[1]! * 0.5).toBeLessThan(median)
    expect(ear.size[1]! * 0.5).toBeGreaterThan(partById('box-05')!.size[1]!)
    const g = build()
    const e = boxOf(g, 'ear-r')
    expect(e.max.y - e.min.y).toBeCloseTo(ear.size[1]! * 0.5, 3)
    // And it is EMBEDDED in the flank the hull actually has — its inner face lies
    // inside 0.625 by the elephant's own burial, halved along with the rest of it.
    // Joined at the bounding box's 0.675 instead it would have stood 0.027 clear.
    const buried = ear.attachment!.sunkFractionMean * ear.size[0]! * 0.5
    expect(e.min.x).toBeCloseTo(0.625 - buried, 3)
    expect(e.min.x).toBeLessThan(0.625)
    expect(0.675 - buried).toBeGreaterThan(0.625)
  })

  it('puts one cream blotch on each flank at the card\'s OWN recorded x', () => {
    const card = partById('plate-11')!
    expect(card.offset[0]).toBeCloseTo(0.635, 6)
    // The card's donors wear it 0.010 proud of a 0.625 flank, and this hull's flank
    // is also 0.625 — so the pack's own daylight carries over with no adjustment.
    expect(card.offset[0]! - HULL_FRONT_Z_USUAL).toBeCloseTo(CARD_STANDOFF, 9)
    const placed = feature('blotch').placement
    if (placed.kind === 'pair') {
      expect(placed.at).toEqual([card.offset[0], card.offset[1], card.offset[2]])
    }
    expect(feature('blotch').paint).toEqual({ base: 'patch' })
    expect(world(build(), 'blotch-l').x).toBeCloseTo(-0.635, 4)
  })

  it('refuses `plate-10` as a second pair — it would be eaten and it would z-fight', () => {
    // Recorded so the next builder does not helpfully add it back. Two independent
    // reasons, both measured. (a) Its footprint lies over the raised HAUNCH pad,
    // whose 0.675 is outside the card's own 0.635, so its middle would be swallowed
    // by the hull and only slivers would show.
    expect(GUINEA_PIG_ASSEMBLY.features.some(f => f.part === 'plate-10')).toBe(false)
    const small = partById('plate-10')!
    const pad = { z0: -0.3075, z1: -0.1883, y0: 0.0291, y1: 0.3026 }   // local, on box-41
    const hullAt = partById('box-41')!.offset
    const zLo = small.offset[2]! - hullAt[2]! - small.size[2]! / 2
    const zHi = small.offset[2]! - hullAt[2]! + small.size[2]! / 2
    expect(zLo).toBeLessThan(pad.z0)
    expect(zHi).toBeGreaterThan(pad.z1)
    const yLo = small.offset[1]! - hullAt[1]! - small.size[1]! / 2
    const yHi = small.offset[1]! - hullAt[1]! + small.size[1]! / 2
    expect(yLo).toBeGreaterThan(pad.y0 - 1e-3)
    expect(yHi).toBeLessThan(pad.y1 + 1e-3)
    expect(small.offset[0]).toBeCloseTo(0.635, 6)   // and it cannot move outward: rule 1
    // (b) Both cards are zero-thickness and coplanar at x = 0.635, and their own
    // recorded footprints OVERLAP — 0.019 by 0.061 — which z-fights.
    const big = partById('plate-11')!
    const overlapY = Math.min(small.offset[1]! + small.size[1]! / 2, big.offset[1]! + big.size[1]! / 2)
      - Math.max(small.offset[1]! - small.size[1]! / 2, big.offset[1]! - big.size[1]! / 2)
    const overlapZ = Math.min(small.offset[2]! + small.size[2]! / 2, big.offset[2]! + big.size[2]! / 2)
      - Math.max(small.offset[2]! - small.size[2]! / 2, big.offset[2]! - big.size[2]! / 2)
    expect(overlapY).toBeGreaterThan(0)
    expect(overlapZ).toBeGreaterThan(0)
    expect(small.size[0]).toBe(0)
    expect(big.size[0]).toBe(0)
  })
})

describe('animal-guinea-pig: the coat is three of Kenney\'s regions, not a painted line', () => {
  it('paints the hull\'s three bands and adds no geometry to do it', () => {
    const hull = partById('box-41')!
    const count = (b: number): number => hull.bands.filter(v => v === b).length
    expect(new Set(hull.bands)).toEqual(new Set([3, 7, 15]))
    expect(count(3)).toBe(37)     // the underside, and the muzzle: the tiger's pale
    expect(count(7)).toBe(57)     // the lower flanks, the chest and the rump
    expect(count(15)).toBe(168)   // the back and the upper flanks: the tiger's dark
    expect(count(3) + count(7) + count(15)).toBe(hull.tris)
    expect(GUINEA_PIG_ASSEMBLY.hull.paint.byBand).toEqual({ 3: 'patch', 15: 'saddle' })
    // Three colours for two entries and no split triangle anywhere.
    const mesh = build().getObjectByName('hull') as THREE.Mesh
    expect(mesh.geometry.getIndex()!.count / 3).toBe(hull.tris)
  })

  it('band 15 is TWO components, a mirror pair — a region a side, not stripes', () => {
    // The measurement that makes painting it safe. A dark band that turned out to
    // be many separated strips would read as a tiger; one unbroken region a side
    // reads as the dark half of a tortoiseshell coat.
    const hull = partById('box-41')!
    const key = (vi: number): string =>
      [0, 1, 2].map(k => hull.positions[vi * 3 + k]!.toFixed(4)).join(',')
    const parent = new Map<string, string>()
    const find = (a: string): string => {
      while (parent.get(a) !== a) a = parent.get(a)!
      return a
    }
    const union = (a: string, b: string): void => {
      const ra = find(a), rb = find(b)
      if (ra !== rb) parent.set(ra, rb)
    }
    const tris: number[] = []
    for (let t = 0; t < hull.bands.length; t++) if (hull.bands[t] === 15) tris.push(t)
    for (const t of tris) {
      parent.set(`t${t}`, `t${t}`)
      for (let k = 0; k < 3; k++) {
        const kk = key(hull.indices[t * 3 + k]!)
        if (!parent.has(kk)) parent.set(kk, kk)
      }
    }
    for (const t of tris) for (let k = 0; k < 3; k++) union(`t${t}`, key(hull.indices[t * 3 + k]!))
    const sizes = new Map<string, number>()
    for (const t of tris) {
      const r = find(`t${t}`)
      sizes.set(r, (sizes.get(r) ?? 0) + 1)
    }
    expect([...sizes.values()].sort((a, b) => b - a)).toEqual([84, 84])
  })

  it('has NO painted belly line, and that is the choice, not an omission', () => {
    // Every other mammal built this way takes §4's way 2 at 8/16, because Kenney's
    // split-triangle boundary wanders. On a PATCHED animal that wander is the whole
    // read and an exact level plane is the giveaway — so this species takes way 1
    // and refuses way 2. §7 measured the wander on this very hull: pale reaching
    // 0.548 of its height and dark starting 0.481, a zone of 0.067.
    expect(GUINEA_PIG_ASSEMBLY.hull.paint.patch).toBeUndefined()
    const hull = partById('box-41')!
    const lo = hull.size[1]! * (0.481 - 0.5), hi = hull.size[1]! * (0.548 - 0.5)
    const ysOf = (band: number): number[] => {
      const out: number[] = []
      for (let t = 0; t < hull.bands.length; t++) {
        if (hull.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) out.push(hull.positions[hull.indices[t * 3 + k]! * 3 + 1]!)
      }
      return out
    }
    const paleTop = Math.max(...ysOf(3)), darkFoot = Math.min(...ysOf(15))
    // The pale region tops out ABOVE where the dark one starts: they interleave,
    // which is exactly what a boundary that follows triangle edges does.
    expect(paleTop).toBeGreaterThan(darkFoot)
    expect(paleTop).toBeCloseTo(hi, 2)
    expect(darkFoot).toBeCloseTo(lo, 2)
  })

  it('cannot make an asymmetric patch, and flags exactly that', () => {
    // Structural, and the whole reason this species is flagged. `byBand` paints
    // both halves of a shape at once, a `pair` places both flanks, and
    // `Paint.patch` is { below, at } where `at` is a HEIGHT — a level plane with no
    // x term and no z term. A blotch on one shoulder only is not awkward, it is
    // unsayable. If any of that ever changes, this goes red and the flag comes off.
    for (const f of GUINEA_PIG_ASSEMBLY.features) {
      if (f.placement.kind !== 'pair') continue
      expect(f.placement.at[0], `${f.name} is placed off the midline and mirrored`)
        .toBeGreaterThan(0)
    }
    const g = build()
    expect(world(g, 'blotch-r').x).toBeCloseTo(-world(g, 'blotch-l').x, 6)
    expect(world(g, 'ear-r').x).toBeCloseTo(-world(g, 'ear-l').x, 6)

    const flag = GUINEA_PIG_ASSEMBLY.flag!
    expect(flag).toMatch(/SYMMETRIC AND CANNOT BE ANYTHING ELSE/)
    expect(flag).toMatch(/asymmetr/i)
    expect(flag).toMatch(/NO TAIL/)
    // Flagged for the patching and for nothing else: no bespoke shape, no budget
    // declared, and no hull stretch.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(GUINEA_PIG_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(GUINEA_PIG_ASSEMBLY.hull.stretch).toBeUndefined()
    // The ONE stretch on the animal, and it is the ear, and it is uniform.
    const stretched = GUINEA_PIG_ASSEMBLY.features.filter(f => f.stretch !== undefined)
    expect(stretched.map(f => f.name)).toEqual(['ear'])
    expect(new Set(stretched[0]!.stretch!).size).toBe(1)
  })
})

describe('animal-guinea-pig: the biggest rodent on the page, and it costs little', () => {
  it('wears the only shell in the pack that is bigger than the cube on every axis', () => {
    const cube = partById('box-03')!
    const big = partById('box-41')!
    expect(GUINEA_PIG_ASSEMBLY.hull.part).toBe('box-41')
    for (let i = 0; i < 3; i++) expect(big.size[i]!).toBeGreaterThan(cube.size[i]!)
    // A real margin rather than an adjective: +8% on a side, +21% by volume, and
    // it is measured over every hull the pack drew so "the only one" is checked.
    const vol = (id: string): number => partById(id)!.size.reduce((a, b) => a * b, 1)
    for (const p of PARTS_BANK.filter(q => q.roles.includes('hull'))) {
      if (p.id === 'box-41') continue
      const bigger = [0, 1, 2].every(i => p.size[i]! > cube.size[i]!)
      expect(bigger, `${p.id} is also bigger than the cube on every axis`).toBe(false)
    }
    expect(vol('box-41') / vol('box-03')).toBeGreaterThan(1.21)
    // The leg stations scale with the hull, so the biggest body also stands widest
    // — 0.2916 against the cube's 0.27, for nothing said in the definition.
    const leg = feature('leg')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from[1]).toBe(LEG_ROW.y)
      expect(leg.placement.from[0]).toBeCloseTo(0.27 * (1.35 / 1.25), 4)
    }
  })

  it('fits between two trees, and it is the EARS that set the radius', () => {
    const g = build()
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. With no tail the
    // depth is the hull plus a nose, so a species this big is still cheap to walk
    // around: 0.78 against the fox's 1.15, which is the pack's own worst.
    expect(s.x).toBeGreaterThan(s.z)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.782, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    // Width comes from the ear pair standing off the flank, not from the hull.
    expect(s.x).toBeGreaterThan(partById('box-41')!.size[0]!)
    expect(boxOf(g, 'ear-r').max.x).toBeCloseTo(s.x / 2, 3)
  })
})
