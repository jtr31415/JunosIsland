/**
 * The leopard gecko — Home Pets' four-legged reptile, and the first species whose
 * whole face is flat CARDS rather than a card and a muzzle.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a gecko can say, and it says five
 * things the next builder needs and cannot get from a screenshot:
 *
 *   1. **`box-03` is the only shell on which a solved face card lands on the eye
 *      plane.** 0.625 + `CARD_STANDOFF` = 0.635 = `EYE_CARD_Z`, and the two
 *      alternatives a low broad reptile would otherwise reach for miss it by
 *      0.125 and 0.100. Re-derived here rather than believed.
 *   2. **`box-13`, the flattest hull in the bank, cannot be worn at all** — its
 *      own bottom is not on the leg row and it is 0.8 short of the height floor.
 *      Pinned so the next builder does not reach for it for the same good reason.
 *   3. **The mouth had to drop, and the reason is a measurement.** At both cards'
 *      own recorded heights the pack's biggest eye and the pack's widest mouth
 *      OVERLAP — ten triangle pairs, coplanar. No donor ever wore the two shapes
 *      together, so nobody had checked. This file checks it, by intersecting the
 *      real triangles.
 *   4. **`box-23` is the fattest shape in the bank**, and the fox's own recorded
 *      height for it is one that inverts when it is transferred. Both measured.
 *   5. **The spots cannot be drawn**, and that is pinned as a fact about the BANK
 *      and the MECHANISM, not as an opinion in a comment — exactly as
 *      `assembly-badger.test.ts` pins the badger's stripe. If a later change makes
 *      a spot sayable, this file goes red and the flag comes off.
 *
 * Helpers are written out rather than imported from `src/`, which is the
 * discipline `assembly-assert.ts` and `parts-bank.test.ts` both apply: a shared
 * implementation lets a bug agree with itself.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, GECKO_ASSEMBLY, CORN_SNAKE_ASSEMBLY,
  CARD_STANDOFF, EYE_CARD_Z, HULL_BOTTOM_Y, HULL_FRONT_Z, HULL_FRONT_Z_USUAL,
  LEG_ROW, PACK_HEIGHT_MIN, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-gecko',
  parts: ['box-01', 'box-03', 'box-08', 'box-23', 'plate-03', 'plate-14'],
  // The pack's own floor, 1.43125, plus the 0.0811 the tubercles stand proud.
  height: 1.5124,
  verts: 588,
  tris: 808,
  // One: the chamfer row of tubercles, turned onto the chamfer's own normal. Said
  // as a number, because rule 4's "no node carries a rotation" passes vacuously on
  // an animal with none.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-gecko')
  g.updateMatrixWorld(true)
  return g
}
const meshes = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse((o) => {
    const m = o as THREE.Mesh
    if (m.isMesh && (m.name === prefix || m.name.startsWith(`${prefix}-`))) out.push(m)
  })
  return out
}
const boxOf = (o: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(o)
const feature = (name: string): (typeof GECKO_ASSEMBLY)['features'][number] =>
  GECKO_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/* ------------------------------------------------- two flat cards, in 2D --- */

type P2 = [number, number]
/**
 * One card's triangles in the face plane, placed exactly as the kit places a
 * `pair`: the +x copy as authored, and the other one MIRRORED, which is what
 * `assembly.ts` does rather than translating a second copy.
 */
function cardTris(id: string, x: number, y: number, mirror: boolean): [P2, P2, P2][] {
  const p = partById(id)!
  const out: [P2, P2, P2][] = []
  for (let t = 0; t < p.tris; t++) {
    const v: P2[] = []
    for (let k = 0; k < 3; k++) {
      const vi = p.indices[t * 3 + k]!
      const px = p.positions[vi * 3]! * (mirror ? -1 : 1) + (mirror ? -x : x)
      v.push([px, p.positions[vi * 3 + 1]! + y])
    }
    out.push(v as [P2, P2, P2])
  }
  return out
}
/** Separating-axis test. Two triangles that merely share an edge do NOT overlap. */
function overlap(A: [P2, P2, P2], B: [P2, P2, P2]): boolean {
  for (const T of [A, B]) {
    for (let i = 0; i < 3; i++) {
      const p = T[i]!, q = T[(i + 1) % 3]!
      const ax = -(q[1] - p[1]), ay = q[0] - p[0]
      let aLo = Infinity, aHi = -Infinity, bLo = Infinity, bHi = -Infinity
      for (const v of A) { const d = v[0] * ax + v[1] * ay; if (d < aLo) aLo = d; if (d > aHi) aHi = d }
      for (const v of B) { const d = v[0] * ax + v[1] * ay; if (d < bLo) bLo = d; if (d > bHi) bHi = d }
      if (aHi <= bLo + 1e-9 || bHi <= aLo + 1e-9) return false
    }
  }
  return true
}
/** How many triangle pairs of the two eye cards and the two mouth cards collide. */
function faceCollisions(mouthY: number): number {
  const eye = partById('plate-14')!
  const eyes = [false, true].map(m => cardTris('plate-14', eye.offset[0]!, eye.offset[1]!, m))
  const half = partById('plate-03')!.size[0]! / 2
  const mouths = [false, true].map(m => cardTris('plate-03', half, mouthY, m))
  let n = 0
  for (const e of eyes) for (const q of mouths) for (const a of e) for (const b of q) {
    if (overlap(a, b)) n++
  }
  return n
}

/* ------------------------------------------------ box-03 as half-spaces --- */

/**
 * `box-03`'s own surface, as outward half-spaces built from its own triangles.
 *
 * §3's "nothing floats" is checkable exactly on a convex shell, and the hull is
 * one: a point is inside iff it is on the inner side of every face plane. This is
 * the only honest way to say a part is embedded on a shape that chamfers every
 * edge — a bounding box says nothing about the chamfer, and the chamfer is where
 * a ridge station actually leaves.
 */
function hullPlanes(): number[][] {
  const p = partById('box-03')!
  const out: number[][] = []
  for (let t = 0; t < p.tris; t++) {
    const q: number[][] = []
    for (let k = 0; k < 3; k++) {
      const vi = p.indices[t * 3 + k]!
      q.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
    }
    const u = [q[1]![0]! - q[0]![0]!, q[1]![1]! - q[0]![1]!, q[1]![2]! - q[0]![2]!]
    const v = [q[2]![0]! - q[0]![0]!, q[2]![1]! - q[0]![1]!, q[2]![2]! - q[0]![2]!]
    let n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!,
      u[0]! * v[1]! - u[1]! * v[0]!]
    const L = Math.hypot(n[0]!, n[1]!, n[2]!)
    if (L < 1e-12) continue
    n = n.map(c => c / L)
    let d = n[0]! * q[0]![0]! + n[1]! * q[0]![1]! + n[2]! * q[0]![2]!
    if (d < 0) { n = n.map(c => -c); d = -d }
    out.push([n[0]!, n[1]!, n[2]!, d])
  }
  return out
}
const PLANES = hullPlanes()
/** Signed distance outside the shell, hull-centred. `<= 0` is inside. */
const outside = (q: readonly number[]): number => Math.max(
  ...PLANES.map(pl => pl[0]! * q[0]! + pl[1]! * q[1]! + pl[2]! * q[2]! - pl[3]!))

/* ================================================================== hull === */

describe('animal-gecko: the hull is box-03, and the FACE is why', () => {
  it('is the only shell on which a solved face card lands on the eye plane', () => {
    // Rule 5: the eye card is at 0.6350 whatever the hull is, standard deviation
    // 0.0000 over all 48 in the pack. A SOLVED card lands at that hull's own front
    // face plus the pack's own 0.010 of daylight. On the cube those are the same
    // number, so the mouth and the eyes are coplanar for free.
    expect(HULL_FRONT_Z_USUAL + CARD_STANDOFF).toBeCloseTo(EYE_CARD_Z, 6)
    expect(HULL_FRONT_Z['box-03']).toBe(HULL_FRONT_Z_USUAL)
    // The two a low broad reptile would otherwise reach for, and by how much each
    // misses. If either of these went to zero, this species' hull choice would be
    // a preference rather than a measurement, and this test should go red.
    expect(EYE_CARD_Z - (HULL_FRONT_Z['box-31']! + CARD_STANDOFF)).toBeCloseTo(0.125, 6)
    expect((HULL_FRONT_Z['box-41']! + CARD_STANDOFF) - EYE_CARD_Z).toBeCloseTo(0.1, 6)
    expect(GECKO_ASSEMBLY.hull.part).toBe('box-03')

    // And built: all four face cards on one plane, which is the whole claim.
    const g = build()
    for (const m of [...meshes(g, 'eye'), ...meshes(g, 'mouth')]) {
      expect(m.getWorldPosition(new THREE.Vector3()).z, `${m.name} is off the face plane`)
        .toBeCloseTo(EYE_CARD_Z, 4)
    }
  })

  it('cannot wear box-13, the flattest hull in the bank — refused twice over', () => {
    // The obvious reach for a low flat animal, and it is unusable. Recorded so the
    // next builder does not spend a pass rediscovering it.
    const crab = partById('box-13')!
    expect(crab.size[1]).toBeCloseTo(0.450556, 6)
    // (a) Its own bottom is not on the plane the leg row is a constant about. Every
    // other hull sits on HULL_BOTTOM_Y; this one is 0.1397 above it, so the pack's
    // four legs would stop short of the belly with nothing in between.
    const bottom = crab.offset[1]! - crab.size[1]! / 2
    expect(bottom).toBeCloseTo(0.320972, 6)
    expect(bottom - HULL_BOTTOM_Y).toBeGreaterThan(0.139)
    expect(partById('box-03')!.offset[1]! - partById('box-03')!.size[1]! / 2)
      .toBeCloseTo(HULL_BOTTOM_Y, 6)
    // (b) And re-seated on that row it is 0.799 under the pack's own floor, which
    // nothing on an animal this size pays back.
    expect(HULL_BOTTOM_Y + crab.size[1]!).toBeLessThan(PACK_HEIGHT_MIN)
    expect(PACK_HEIGHT_MIN - (HULL_BOTTOM_Y + crab.size[1]!)).toBeGreaterThan(0.79)
    expect(GECKO_ASSEMBLY.features.some(f => f.part === 'box-13')).toBe(false)
  })

  it('cannot wear box-12 either: its extra width is two fused EAR LUGS', () => {
    // `animal-badger.ts` measured this and it is the reason a gecko cannot take the
    // "wider" shell. Re-derived in one assertion rather than trusted: every point
    // outside the cube's own half-width is high and forward on the head, where the
    // cow and the deer wear their ears — and a gecko's ear is a HOLE in the side of
    // its head, so a pair of lugs is a different animal.
    const wide = points('box-12').filter(q => Math.abs(q[0]) > 0.6251)
    expect(wide).toHaveLength(30)
    for (const q of wide) {
      expect(q[1]).toBeGreaterThan(0.32)
      expect(q[2]).toBeGreaterThan(0.34)
    }
    // And it costs 3x the triangles of the shell this species actually wears.
    expect(partById('box-12')!.tris).toBe(180)
    expect(partById('box-03')!.tris).toBe(60)
  })
})

/* ================================================================== face === */

describe('animal-gecko: the face is four flat cards on one plane', () => {
  it('wears the biggest eye card in the bank, and it is seven tenths pupil', () => {
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (p: BakedPart): number => p.size[0]! * p.size[1]!
    // Nothing bigger exists, and rule 5 makes stretching one unsayable — so if
    // this is not enormous enough for a gecko that is a bespoke shape and Joe's
    // call, which is what the flag says.
    expect(Math.max(...eyes.map(area))).toBeCloseTo(area(partById('plate-14')!), 6)
    expect(feature('eye').part).toBe('plate-14')
    // Seven tenths of the card is band 15, which is the pupil slot. A leopard
    // gecko's eye is very nearly all pupil, and the card arrives that way with no
    // geometry and no paint decision at all.
    const card = partById('plate-14')!
    const pupil = card.bands.filter(b => b === 15).length
    expect(pupil).toBe(40)
    expect(pupil / card.tris).toBeGreaterThan(0.7)
    // Placed at the panda's own recorded station: nothing about the eye is typed
    // in this species, which is the point of naming the card and stopping.
    const eye = feature('eye')
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at).toEqual([card.offset[0], card.offset[1], EYE_CARD_Z])
    }
  })

  it('draws the widest mouth line this pack can draw — two cards, abutted', () => {
    // The bank's only mouth shapes are two flat cards and `plate-03` is the wider.
    const faces = PARTS_BANK.filter(
      p => p.roles.includes('card') && p.attachment?.axis === 'z')
    expect(faces.map(p => p.id).sort()).toEqual(['plate-03', 'plate-13'])
    expect(Math.max(...faces.map(p => p.size[0]!))).toBeCloseTo(0.236581, 6)
    // A mirrored PAIR meets at x = 0 and reads 0.473162 across — 37.9% of this
    // hull's 1.250 head, against 18.9% for a single card. `animal-nightjar.ts`
    // measured it first. If a longer card ever lands in the bank this goes red and
    // the mouth should be re-chosen.
    const g = build()
    const mouth = meshes(g, 'mouth')
    expect(mouth).toHaveLength(2)
    const span = boxOf(g.getObjectByName('mouth-r')!).union(boxOf(g.getObjectByName('mouth-l')!))
    expect(span.max.x - span.min.x).toBeCloseTo(0.473162, 4)
    expect((span.max.x - span.min.x) / partById('box-03')!.size[0]!).toBeGreaterThan(0.37)
  })

  it('drops the mouth to 10/16 because at their OWN heights the cards COLLIDE', () => {
    // THE MEASUREMENT THIS SPECIES EXISTS TO RECORD. `CARD_STANDOFF` fixed a card
    // z-fighting a HULL; it can do nothing about two cards that are already on the
    // same plane by construction. At both shapes' own recorded heights the panda's
    // eye and the pack's mouth line intersect — ten triangle pairs, real geometry,
    // intersected here rather than argued about.
    expect(faceCollisions(partById('plate-03')!.offset[1]!)).toBe(10)
    // At 10/16 on the pack's own authoring grid there is nothing left touching.
    expect(faceCollisions(0.625)).toBe(0)
    expect(0.625 * SLOT_PX).toBe(10)
    // NOBODY HAD CHECKED, and this is why: no donor of the eye card donates the
    // mouth card. The pack never made this face.
    const donors = (id: string): Set<string> =>
      new Set(partById(id)!.provenance.map(q => q.species))
    const eye = donors('plate-14'), mouth = donors('plate-03')
    expect([...eye].filter(s => mouth.has(s))).toEqual([])
    // Built where the measurement says, and still wholly on the hull's flat front
    // face, which runs 0.49375 to 1.11875 on this shell.
    const box = boxOf(build().getObjectByName('mouth-r')!)
    expect(box.min.y).toBeGreaterThan(0.49375)
    expect(box.max.y).toBeLessThan(1.11875)
  })
})

/* ================================================================== tail === */

describe('animal-gecko: the tail is the fattest shape in the bank', () => {
  it('is the thickest of the seven tails, by both measures that separate them', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBe(7)
    const brush = partById('box-23')!
    // §7 splits the seven on THICKNESS, not on length, and this is the top of that
    // list: the greatest narrowest axis, and 1.67x the volume of the next thickest.
    const thinnest = (p: BakedPart): number => Math.min(...p.size)
    const volume = (p: BakedPart): number => p.size[0]! * p.size[1]! * p.size[2]!
    expect(Math.max(...tails.map(thinnest))).toBeCloseTo(thinnest(brush), 6)
    expect(thinnest(brush)).toBeCloseTo(0.744, 6)
    const others = tails.filter(p => p.id !== 'box-23')
    expect(volume(brush) / Math.max(...others.map(volume))).toBeGreaterThan(1.6)
    // Round in section and it barely narrows — a fat store, not a whip.
    expect(brush.size[1]).toBeCloseTo(brush.size[2]!, 6)
    expect(brush.shape.taper).toBeGreaterThan(0.96)
    expect(feature('tail').part).toBe('box-23')
  })

  it('hangs on the hull\'s own axis, because the donor\'s raw number INVERTS', () => {
    const brush = partById('box-23')!
    const fox = partById('box-21')!
    // On its own donor the brush roots 0.065038 BELOW the body's centre. Carried
    // raw onto a cube centred at 0.80625 the same number sits 0.0625 ABOVE it, so
    // the pure transfer would reverse the relationship the donor recorded. This is
    // the one case in this species where the recorded offset is the wrong answer,
    // and it is worth knowing that a donor transfer can be.
    expect(fox.offset[1]! - brush.offset[1]!).toBeCloseTo(0.065038, 6)
    expect(brush.offset[1]! - 0.80625).toBeCloseTo(0.0625, 6)
    const tail = feature('tail')
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, partById('box-03')!.offset[1], -0.625])
    }
    // The sink is untouched: the fox's own measured burial, and the only number
    // about this tail that did transfer.
    expect(tail.sink).toBeCloseTo(brush.attachment!.sunkFractionMean, 6)
    expect(tail.sink! * brush.size[2]!).toBeGreaterThan(0.125)   // §3's embedded floor
  })

  it('joins INSIDE the shell — checked against box-03\'s own surface, not a box', () => {
    const g = build()
    const t = boxOf(g.getObjectByName('tail')!)
    const centre = boxOf(g.getObjectByName('hull')!).getCenter(new THREE.Vector3())
    // The deepest point of the join is 0.1615 inside the shell. A bounding box
    // cannot say this — the cube chamfers every edge, and the rear face is only
    // 0.625 square — so it is said against the hull's own 60 face planes.
    const mesh = g.getObjectByName('tail') as THREE.Mesh
    const pos = mesh.geometry.getAttribute('position')
    let deepest = Infinity
    for (let i = 0; i < pos.count; i++) {
      const q = [pos.getX(i) + mesh.position.x - centre.x,
        pos.getY(i) + mesh.position.y - centre.y,
        pos.getZ(i) + mesh.position.z - centre.z]
      deepest = Math.min(deepest, outside(q))
    }
    expect(deepest).toBeLessThan(-0.16)
    expect(t.max.z).toBeCloseTo(-0.4635, 4)
    // And it is what the animal is: 0.910 of reach off the back, 73% of the hull's
    // own depth, which is what makes this the fat-tailed member of Home Pets.
    expect((t.max.z - t.min.z) / partById('box-03')!.size[2]!).toBeGreaterThan(0.72)
  })

  it('wears Kenney\'s own cut PALE, which is the one marking this animal has', () => {
    // §4's first way: 30 of the brush's 92 triangles are a second band covering its
    // upper outer quadrant — the fox's white tip. A paler tail end for one entry
    // and no geometry at all. It is ONE band where a real gecko's tail carries
    // several, and the flag says so rather than this comment.
    const brush = partById('box-23')!
    expect(brush.bands.filter(b => b === 5)).toHaveLength(30)
    expect(new Set(brush.bands).size).toBe(2)
    expect(feature('tail').paint).toEqual({ base: 'coat', byBand: { 5: 'belly' } })
    // Painted from the slot the venter, the toe pads and the sclera already use:
    // one cream, four jobs, and no new colour to justify.
    expect(GECKO_ASSEMBLY.palette['belly']).toBe(0xf7edd9)
  })
})

/* ================================================================== legs === */

describe('animal-gecko: the legs sprawl, and the toes are painted', () => {
  it('sets them at the EXACT station where a leg\'s outer face meets the side', () => {
    const leg = partById(LEG_ROW.part)!
    // Not a taste and not a copy: 0.4375 + half of box-01's 0.375 is 0.625, which
    // is box-03's own side. One thousandth further and the pack's own axiom —
    // every leg inside the body's footprint, 23 of 23 — is broken.
    expect(0.4375 + leg.size[0]! / 2).toBe(partById('box-03')!.size[0]! / 2)
    const row = feature('leg')
    if (row.placement.kind === 'row') expect(row.placement.from[0]).toBe(0.4375)
    // Wider than the builder's own default for this hull, which is what "sprawl"
    // means here — the newt and the salamander leave that default alone.
    expect(0.4375).toBeGreaterThan(0.27 * (partById('box-03')!.size[0]! / 1.25))
    // Built, flush: the widest thing on this animal is the hull, and the legs
    // exactly reach it.
    const g = build()
    for (const m of meshes(g, 'leg')) {
      const b = boxOf(m)
      expect(Math.max(Math.abs(b.min.x), Math.abs(b.max.x)), `${m.name} is not flush`)
        .toBeCloseTo(0.625, 4)
    }
    // The wheelbase is the default. A gecko is short-bodied, and that is said by
    // saying nothing.
    if (row.placement.kind === 'row') expect(row.placement.from[2]).toBe(0.25)
  })

  it('wears JT-044\'s two-tone leg, and nothing else paints that slot', () => {
    // Joe ruled the mechanism for hooves; pale splayed toe pads under a darker limb
    // is the same tool doing the same job.
    expect(feature('leg').paint).toEqual({
      base: 'limb', patch: { below: 'belly', at: 0.25 },
    })
    // THREE CONSTRAINTS, all three checked. (1) `at` is on the pack's 1/16 grid or
    // `texture.ts` throws — 0.25 is 4/16.
    expect(0.25 * SLOT_PX).toBe(4)
    // (2) The patch applies to the BASE slot only, so a `byBand` on the same part
    // would be silently ignored on the triangles it moved.
    expect(feature('leg').paint.byBand).toBeUndefined()
    // (3) A SPLIT BELONGS TO A SLOT, NOT TO A PART. If anything else on this animal
    // painted `limb`, it would silently wear the same line at its own height. This
    // is the assertion that keeps the toes the legs' own.
    const painters = [GECKO_ASSEMBLY.hull.paint, ...GECKO_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.base === 'limb')
    expect(painters).toHaveLength(1)
    // On a 0.30625 leg, 4/16 is the bottom 0.076563 — a foot, not a sock.
    expect(0.25 * partById(LEG_ROW.part)!.size[1]!).toBe(0.0765625)
    // And it costs no geometry: the leg is the pack's own 44 triangles either way.
    const legMesh = build().getObjectByName('leg-r0') as THREE.Mesh
    expect(legMesh.geometry.getIndex()!.count / 3).toBe(partById(LEG_ROW.part)!.tris)
    // A patched part reads ACROSS its cell — more than one v row — where a flat one
    // reads exactly one. Both said, so neither passes for the wrong reason.
    const rows = (m: THREE.Mesh): number => {
      const uv = m.geometry.getAttribute('uv')
      const s = new Set<string>()
      for (let i = 0; i < uv.count; i++) s.add(uv.getY(i).toFixed(6))
      return s.size
    }
    expect(rows(legMesh)).toBeGreaterThan(1)
    expect(rows(build().getObjectByName('tubercle-top-0') as THREE.Mesh)).toBe(1)
  })
})

/* ============================================================= tubercles === */

describe('animal-gecko: the tubercles are skin, and nothing floats', () => {
  it('stands 0.081 proud, off a `y +1` donor\'s own measured burial', () => {
    const bump = partById('box-08')!
    // `animal-corn-snake.ts` paid for this lesson: a donor's burial only transfers
    // to a radial mount if the donor's own attachment is `y +1`. This one is.
    expect(bump.attachment!.axis).toBe('y')
    expect(bump.attachment!.dir).toBe(1)
    expect(bump.attachment!.sunkFractionMean).toBeCloseTo(0.75198, 5)
    expect((1 - bump.attachment!.sunkFractionMean) * bump.size[1]!).toBeCloseTo(0.081128, 5)
    // Built: the animal's whole height above the pack's floor is those bumps.
    const g = build()
    const top = boxOf(g).max.y - boxOf(g.getObjectByName('hull')!).max.y
    expect(top).toBeCloseTo(0.0811, 3)
  })

  it('puts every buried face INSIDE box-03\'s own surface — checked at the corners', () => {
    // `animal-newt.ts`'s discipline: §8's bound is about the STATION, and a part is
    // not a point. The outermost tubercle is the one that leaves first, and it is
    // inside by 0.0242 — thin, and the reason the span is the builder's own solve
    // rather than a number this species chose.
    const g = build()
    const centre = boxOf(g.getObjectByName('hull')!).getCenter(new THREE.Vector3())
    let worst = -Infinity
    for (const m of meshes(g, 'tubercle')) {
      const facing = m.userData['facing'] as number[]
      const pos = m.geometry.getAttribute('position')
      const pts: number[][] = []
      for (let i = 0; i < pos.count; i++) {
        pts.push([pos.getX(i) + m.position.x - centre.x,
          pos.getY(i) + m.position.y - centre.y,
          pos.getZ(i) + m.position.z - centre.z])
      }
      const proj = pts.map(q => q[0]! * facing[0]! + q[1]! * facing[1]! + q[2]! * facing[2]!)
      const lo = Math.min(...proj)
      for (let i = 0; i < pts.length; i++) {
        if (proj[i]! < lo + 1e-4) worst = Math.max(worst, outside(pts[i]!))
      }
    }
    expect(worst).toBeLessThan(0)
    expect(worst).toBeCloseTo(-0.0242, 3)
  })

  it('costs NO keep-out, because there is no side row', () => {
    // Two rows and three facings — 0 and +/-45 — which rounds the BACK, where a
    // gecko's tubercles are; its belly and lower flanks are smooth. The dividend is
    // measurable: with no side row the animal is exactly box-03 wide, so nine
    // tubercles are free. A five-row run measures 1.412 across.
    const names = GECKO_ASSEMBLY.features.filter(f => f.name.startsWith('tubercle'))
      .map(f => f.name).sort()
    expect(names).toEqual(['tubercle-chamfer', 'tubercle-top'])
    const size = boxOf(build()).getSize(new THREE.Vector3())
    expect(size.x).toBeCloseTo(partById('box-03')!.size[0]!, 4)
    // Painted from the COAT and not from a dark slot. Nine dark bumps on a sandy
    // back is a fake spot pattern, and §8's argument for this idiom was always the
    // silhouette. If this ever becomes `mark`, the flag below is a lie.
    for (const f of GECKO_ASSEMBLY.features.filter(q => q.name.startsWith('tubercle'))) {
      expect(f.paint).toEqual({ base: 'coat' })
    }
  })
})

/* ================================================================ spots === */

describe('animal-gecko: the spots, and the part of the animal that cannot be drawn', () => {
  it('cannot say WHERE: a patch carries a height and nothing else', () => {
    // Structural, and half the reason this species is flagged. `Paint.patch` is
    // { below, at } — `at` is a fraction of the part's HEIGHT — so the boundary is
    // one level plane across a whole part. A spot is a POINT on a surface, and this
    // mechanism has no term for a point. If `patch` ever grows one, this goes red.
    const patch = GECKO_ASSEMBLY.hull.paint.patch!
    expect(Object.keys(patch).sort()).toEqual(['at', 'below'])
    expect(typeof patch.at).toBe('number')
  })

  it('has nothing in the hull to CUT: box-03 is one band over all 60 triangles', () => {
    // §4's other way is `byBand`, and it can only re-colour where Kenney already
    // cut. He did not cut this shell at all. The tail is the only part on this
    // animal that arrives with a second band, and one band is not a spot pattern.
    const hull = partById('box-03')!
    expect(new Set(hull.bands).size).toBe(1)
    expect(hull.bands).toHaveLength(60)
    // Two features read a band at all, and one of them is the eye's pupil, which
    // the builder adds to every species. The TAIL is the only marking this animal
    // has that came out of Kenney's own cuts, and it is one band on one part.
    const banded = GECKO_ASSEMBLY.features.filter(f => f.paint.byBand !== undefined)
    expect(banded.map(f => f.name).sort()).toEqual(['eye', 'tail'])
    expect(feature('eye').paint.byBand).toEqual({ 15: 'pupil' })
  })

  it('has no card in the BANK small enough to be a spot — measured, not assumed', () => {
    const cards = PARTS_BANK.filter(p => p.roles.includes('card'))
    expect(cards.length).toBeGreaterThan(0)
    const side = partById('box-03')!.size[0]!
    for (const p of cards) {
      // Every marking sheet in the pack is at least a sixth of this hull's own
      // side. A leopard gecko carries dozens of spots and not one of them is a
      // sixth of the animal, so four of these is the fire salamander's blotching —
      // which is right for a salamander — and not a gecko's spots.
      expect(Math.max(...p.size) / side, `${p.id} is small enough to be a spot`)
        .toBeGreaterThan(0.17)
    }
    // Refused by name, so the next builder does not helpfully add them back.
    expect(GECKO_ASSEMBLY.features.some(f => f.part === 'plate-10')).toBe(false)
    expect(GECKO_ASSEMBLY.features.some(f => f.part === 'plate-11')).toBe(false)
  })

  it('flags all of that where Joe reads it, and authors nothing to fake it', () => {
    const flag = GECKO_ASSEMBLY.flag!
    expect(flag).toMatch(/CANNOT BE EXPRESSED/)
    expect(flag).toMatch(/spot/i)
    expect(flag).toMatch(/patch/i)
    // And the second thing it flags: this collection never carried colours for a
    // gecko, so these four are the first ever proposed and are nobody's decision
    // yet.
    expect(flag).toMatch(/UNREVIEWED/)
    // Flagged for those two and nothing else: nothing authored, nothing stretched,
    // no budget declared, because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(GECKO_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(GECKO_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
    expect(GECKO_ASSEMBLY.hull.stretch).toBeUndefined()
  })
})

/* ============================================================ the rest === */

describe('animal-gecko: the belly line, and the trap underneath it', () => {
  it('paints the venter at 6/16 and leaves every unpatched coat part alone', () => {
    expect(GECKO_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.375 })
    // THE TRAP, and it is general rather than this animal's. A split lives on the
    // SLOT: an unpatched part painted from the same slot reads its cell's CENTRE
    // row, which is 8 of 16. 6/16 is below that, so the tail and the nine tubercles
    // still read `coat`. A belly line at 9/16 or above would have turned every one
    // of them cream, silently, with no error anywhere.
    expect(0.375 * SLOT_PX).toBeLessThan(SLOT_PX / 2)
    for (const f of GECKO_ASSEMBLY.features) {
      if (f.paint.base === 'coat') expect(f.paint.patch, `${f.name}`).toBeUndefined()
    }
    // And it costs no geometry: the hull is the pack's own 60 triangles.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })

  it('has no snout and no nose, and both absences are the animal', () => {
    // A snout joins the front face at z = 0.625 and reaches FORWARD from there, so
    // on this animal it would swallow two mouth cards and two eye cards whole. The
    // mouth line is the muzzle here — which is also true of the gecko.
    expect(GECKO_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
    expect(GECKO_ASSEMBLY.features.some(f => f.name === 'nose')).toBe(false)
    expect(GECKO_ASSEMBLY.features.some(f => f.name.startsWith('ear'))).toBe(false)
  })
})

describe('animal-gecko: what separates it inside Home Pets', () => {
  it('is the FOUR-LEGGED one, against a collection-mate with neither legs nor tail', () => {
    // `species-garden.test.ts:261-286` is the precedent for failing silhouette
    // twins. The corn snake is the other reptile in this collection that exists
    // today, and there is no angle from which these are the same animal.
    expect(CORN_SNAKE_ASSEMBLY.features.some(f => f.name.startsWith('leg'))).toBe(false)
    expect(CORN_SNAKE_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(false)
    expect(GECKO_ASSEMBLY.features.filter(f => f.name === 'leg')).toHaveLength(1)
    expect(GECKO_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(true)
    // And its own coat colour, which the collection test requires of every member.
    expect(GECKO_ASSEMBLY.palette['coat']).not.toBe(CORN_SNAKE_ASSEMBLY.palette['coat'])
    // The terrapin, being built alongside this, is shelled and short-tailed; this
    // animal's tail is 0.910 of reach and it wears nothing shell-like. That is
    // asserted where both exist — `species-home-pets.test.ts` — not here, because a
    // test that imports a species that does not exist yet takes the suite down.
  })

  it('fits between two trees, and it is the TAIL that costs, not the sprawl', () => {
    const s = boxOf(build()).getSize(new THREE.Vector3())
    // `pets.ts` charges keep-out from max(width, depth) / 2. The legs go out to the
    // hull's own side and cost nothing; the fat tail is the whole bill.
    expect(s.x).toBeCloseTo(1.25, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.008, 2)
    // Inside the fox's 1.15, which is the pack's own worst and the number the
    // island already copes with, and inside Home Pets' own 1.28 ratchet.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
