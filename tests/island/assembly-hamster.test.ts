/**
 * The hamster. Home Pets' round one, and the first species whose test has to
 * prove a claim about the pack's BODY rather than about a feature on it.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a hamster can say, and it says
 * five things the next builder needs and cannot get from a screenshot:
 *
 *   1. **The pack drew ONE round body and the bank holds four drawings of it.**
 *      `box-03`, `box-20`, `box-36` and `box-39` are the same convex solid to the
 *      last vertex, and that is re-derived here from `box-03`'s own thirty planes
 *      rather than believed. It is why "which hull is round" was never a choice.
 *   2. **`box-41` is refused, and the reason is an octagon.** The tiger's shell
 *      carries a muzzle boss 0.100 proud whose top point is exactly the eye
 *      cards' own height, so it stands in front of both eyes. Measured, and
 *      pinned so nobody helpfully tries the bigger hull again.
 *   3. **A cheek pouch is not expressible**, and that is pinned as a fact about
 *      the BANK and the ARITHMETIC, not as an opinion in a comment. If a later
 *      change makes one sayable, this file goes red.
 *   4. **`box-18` is the elephant's TRUNK** and the bank's only stub — measured
 *      over every tail in it.
 *   5. **The pale foot lands on the leg's own chamfer edge**, which is the only
 *      line on `box-01` a sock could follow and is the whole of why `at` is
 *      3/16 rather than a number somebody liked.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, HAMSTER_ASSEMBLY, CARD_STANDOFF, EYE_CARD_Z, HULL_FRONT_Z_USUAL,
  LEG_ROW, OTHER_HULLS, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-hamster',
  parts: ['box-01', 'box-02', 'box-03', 'box-18', 'plate-03', 'plate-08', 'tube-08'],
  height: 1.5012,
  verts: 426,
  tris: 595,
  // The hull is 1.953 of bounding box against the nub's 0.091 — the next largest
  // mesh on the animal is a twenty-first of it, which is what "compact" buys.
  massRatio: 20,
  // One: the trunk, turned to face backwards. Said as a number, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-hamster')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)

type P3 = [number, number, number]

/** A part's welded points, as the bank stores them: origin-centred, deduped. */
const welded = (id: string): P3[] => {
  const p = partById(id)!
  const seen = new Map<string, P3>()
  for (const vi of new Set(p.indices)) {
    const q: P3 = [p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!]
    seen.set(q.map(v => v.toFixed(4)).join(','), q)
  }
  return [...seen.values()]
}

/**
 * How much room a point has inside `box-03`'s OWN solid: 0 on the surface,
 * positive strictly inside, negative outside.
 *
 * Written out rather than imported, and written as half-spaces rather than as a
 * point list, because that is the only form in which "is this the same body?" is
 * a question with an answer. `box-03` is six flat faces at +/-0.625 and
 * twenty-four edge bevels whose normals are the permutations of (+/-3, +/-2, 0)
 * over root-13 — every one of them through 3a + 2b = 2.5. See `authored.ts`.
 */
const slack = (q: P3): number => {
  let worst = Infinity
  for (let i = 0; i < 3; i++) worst = Math.min(worst, 0.625 - Math.abs(q[i]!))
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      if (a === b) continue
      worst = Math.min(worst, 2.5 - (3 * Math.abs(q[a]!) + 2 * Math.abs(q[b]!)))
    }
  }
  return worst
}

/** How high `box-03`'s own surface stands at one (x, z) — a ray, not a formula. */
function hullTopAt(x: number, z: number): number {
  const p = partById('box-03')!
  let best = -Infinity
  for (let t = 0; t < p.tris; t++) {
    const v = [0, 1, 2].map(k => {
      const i = p.indices[t * 3 + k]!
      return [p.positions[i * 3]!, p.positions[i * 3 + 1]!, p.positions[i * 3 + 2]!] as P3
    })
    const d = (v[1]![2]! - v[2]![2]!) * (v[0]![0]! - v[2]![0]!)
      + (v[2]![0]! - v[1]![0]!) * (v[0]![2]! - v[2]![2]!)
    if (Math.abs(d) < 1e-12) continue
    const l1 = ((v[1]![2]! - v[2]![2]!) * (x - v[2]![0]!)
      + (v[2]![0]! - v[1]![0]!) * (z - v[2]![2]!)) / d
    const l2 = ((v[2]![2]! - v[0]![2]!) * (x - v[2]![0]!)
      + (v[0]![0]! - v[2]![0]!) * (z - v[2]![2]!)) / d
    const l3 = 1 - l1 - l2
    if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue
    const y = l1 * v[0]![1]! + l2 * v[1]![1]! + l3 * v[2]![1]!
    if (y > best) best = y
  }
  return best
}

describe('animal-hamster: the pack drew ONE round body, and it is this one', () => {
  it('is FOUR drawings of one solid — box-03, box-20, box-36 and box-39', () => {
    // The claim that decided the hull, re-derived from box-03's own thirty
    // planes. If any of these four ever gains a point off that surface it is a
    // different body and the sentence in the species file stops being true.
    for (const id of ['box-03', 'box-20', 'box-36', 'box-39']) {
      const s = welded(id).map(slack)
      expect(Math.min(...s), `${id} has a point OUTSIDE box-03's solid`).toBeGreaterThan(-1e-3)
      expect(Math.max(...s), `${id} has a point strictly INSIDE box-03's solid`).toBeLessThan(1e-3)
    }
    // And the cube is the plainest and cheapest drawing of it — which is the
    // whole reason to spend 60 triangles rather than 80 on the same silhouette.
    expect(welded('box-03')).toHaveLength(32)
    for (const id of ['box-20', 'box-36', 'box-39']) {
      expect(welded(id).length, `${id} is not a busier drawing than box-03`)
        .toBeGreaterThan(32)
      expect(partById(id)!.tris).toBeGreaterThan(partById('box-03')!.tris)
    }
    expect(HAMSTER_ASSEMBLY.hull.part).toBe('box-03')
  })

  it('is the only hull family member that is equal on all three axes and undented', () => {
    const cube = partById('box-03')!
    expect(cube.size).toEqual([1.25, 1.25, 1.25])
    expect(cube.shape.symmetry).toBe('radial')
    expect(cube.shape.aspect).toEqual([1, 1, 1])
    // The monkey's is the same solid with the monkey's face pressed into it —
    // 12 points up to 0.200 inside. Not a rounder body; a dented one.
    const dents = welded('box-33').map(slack).filter(v => v > 1e-3)
    expect(dents).toHaveLength(12)
    expect(Math.max(...dents)).toBeCloseTo(0.2, 3)
    // Every remaining hull leaves the solid outright, so none of them is "the
    // cube but rounder" — they are other animals' bodies.
    for (const id of ['box-12', 'box-13', 'box-21', 'box-31', 'box-41']) {
      expect(Math.min(...welded(id).map(slack)), `${id} stays inside box-03`)
        .toBeLessThan(-0.1)
    }
  })
})

describe('animal-hamster: box-41 is refused, and the reason is an octagon', () => {
  it('is the bigger hull, and it looks like the round one until it is probed', () => {
    const tiger = partById('box-41')!
    expect(OTHER_HULLS.bigger).toBe('box-41')
    // Wider AND deeper than tall — the thing a stocky animal wants, and the only
    // body in the pack that has it. (The crab's plate does too, at 0.4506 tall.)
    expect(tiger.size[0]!).toBeGreaterThan(tiger.size[1]!)
    expect(tiger.size[2]!).toBeGreaterThan(tiger.size[1]!)
    expect(tiger.size).toEqual([1.35, 1.3, 1.35])
  })

  it('carries a MUZZLE BOSS whose top point is the eye cards\' own height', () => {
    // Eight points at z = 0.675, an octagon of radius 0.200 centred on
    // y = -0.1375, standing 0.100 proud of the 0.575 the shell presents anywhere
    // else. This is the measurement that refused the hull.
    const front = welded('box-41').filter(q => Math.abs(q[2]! - 0.675) < 1e-4)
    expect(front).toHaveLength(8)
    expect(Math.max(...front.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.2, 4)
    const rest = welded('box-41').filter(q => q[2]! < 0.675 - 1e-4)
    expect(Math.max(...rest.map(q => q[2]!))).toBeCloseTo(0.575, 4)

    // Its top point sits at y = 0.0625 above that hull's centre, and the eye
    // card's own recorded centre is 0.893750 on a hull centred at 0.831250 —
    // the same 0.0625. So the boss reaches the eyes exactly.
    const card = partById('plate-08')!
    expect(Math.max(...front.map(q => q[1]!))).toBeCloseTo(0.0625, 4)
    expect(card.offset[1]! - partById('box-41')!.offset[1]!).toBeCloseTo(0.0625, 6)
    // And it stands 0.090 IN FRONT of the eye plane, because that shell's front
    // face is 0.725 while the eye card is the absolute 0.635 on every hull.
    const frontFaceZ = partById('box-41')!.offset[2]! + partById('box-41')!.size[2]! / 2
    expect(frontFaceZ).toBeCloseTo(0.725, 6)
    expect(frontFaceZ - EYE_CARD_Z).toBeCloseTo(0.09, 6)
    // The card spans x 0.0625 to 0.4625 and reaches down to y = -0.1375 relative
    // to that hull, which is exactly where the octagon is widest.
    expect(card.offset[0]! - card.size[0]! / 2).toBeCloseTo(0.0625, 6)
    expect(card.offset[1]! - card.size[1]! / 2 - partById('box-41')!.offset[1]!)
      .toBeCloseTo(-0.1375, 6)

    // Recorded so the next builder does not helpfully try the bigger hull.
    expect(HAMSTER_ASSEMBLY.hull.part).not.toBe('box-41')
    expect(HAMSTER_ASSEMBLY.features.some(f => f.part === 'box-41')).toBe(false)
  })
})

describe('animal-hamster: the cheek pouches, and why there are none', () => {
  it('has no shape on its sides, because everything that mounts there is an EAR', () => {
    // Six shapes in the whole bank attach on x. Three are ears, one is the bee's
    // torso ring, and two are zero-thickness marking cards. There is no bulge in
    // the bank that goes on the side of a head and is not an ear.
    const sideways = PARTS_BANK.filter(p => p.attachment?.axis === 'x')
    expect(sideways.map(p => p.id).sort())
      .toEqual(['box-04', 'box-25', 'plate-10', 'plate-11', 'tube-04', 'tube-05'])
    const solids = sideways.filter(p => Math.min(...p.size) > 1e-6 && !p.roles.includes('band'))
    expect(solids.map(p => p.id).sort()).toEqual(['box-25', 'tube-04', 'tube-05'])
    for (const p of solids) expect(p.roles, `${p.id} is not an ear`).toContain('ear')
    // And they are the BIGGEST things that could go there — a hamster whose
    // separation is small ears would grow a second, larger pair.
    expect(partById('box-25')!.shape.longest).toBeGreaterThan(
      partById('box-02')!.shape.longest * 2.3)
    for (const id of ['box-25', 'tube-04', 'tube-05', 'plate-10', 'plate-11']) {
      expect(HAMSTER_ASSEMBLY.features.some(f => f.part === id), `${id} is worn`).toBe(false)
    }
  })

  it('could not put a pad forward of the midline anyway — §8 step 4, on this hull', () => {
    // The flat side face reaches only z = 0.3125 before the chamfer falls away
    // 1:1, so a pad joined on that face stays embedded only while its own half
    // depth stays inside it. For anything 0.400 across that bound is 0.1125 —
    // behind the hull's own midline, which is a flank and not a cheek.
    const pts = welded('box-03')
    const flat = pts.filter(q => Math.abs(Math.abs(q[0]!) - 0.625) < 1e-6)
    expect(Math.max(...flat.map(q => Math.abs(q[2]!)))).toBeCloseTo(0.3125, 6)
    expect(0.3125 - 0.4 / 2).toBeCloseTo(0.1125, 6)
    // The marking cards cannot stand in for a bulge either: they are measured
    // zero thick, so they are a colour and not a shape.
    expect(partById('plate-10')!.size[0]).toBe(0)
    expect(partById('plate-11')!.size[0]).toBe(0)
    // No flag, because a hamster's pouches are only visible when it has eaten
    // and the animal is complete without them. The badger's marking was not.
    expect(HAMSTER_ASSEMBLY.flag).toBeUndefined()
  })
})

describe('animal-hamster: the tail is the elephant\'s TRUNK, and it is a nub', () => {
  it('is the shortest reach in the bank by 0.130, over every tail in it', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBeGreaterThan(5)
    const reach = (id: string): number => partById(id)!.size[2]!
    const others = tails.filter(p => p.id !== 'box-18').map(p => reach(p.id))
    expect(reach('box-18')).toBeCloseTo(0.425211, 6)
    expect(Math.min(...others)).toBeCloseTo(0.5552, 4)   // wedge-07/15/18
    expect(Math.min(...others) - reach('box-18')).toBeGreaterThan(0.12)
    // `home-pets.ts` gives this species the word "stub" and this is the only
    // shape in the bank that could answer it.
    expect(reach('box-18')).toBeLessThan(reach('box-23') / 2)  // the fox's brush
  })

  it('carries Kenney\'s wrong name, and the spin is what corrects it', () => {
    const trunk = partById('box-18')!
    // Every other tail in the bank attaches z -1 — off the back. This one is
    // z +1, off the FRONT of a face, because it is the elephant's trunk.
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    for (const p of PARTS_BANK.filter(q => q.roles.includes('tail') && q.id !== 'box-18')) {
      expect(p.attachment!.dir, `${p.id} faces the same way as the trunk`).toBe(-1)
    }
    const tail = HAMSTER_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.spin).toEqual([{ axis: 'y', deg: 180 }])
    expect(tail.sink).toBe(0)
    expect(trunk.attachment!.sunkFractionMean).toBe(0)
    // Joined at the cube's own rear face, nothing chosen.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, trunk.offset[1], -HULL_FRONT_Z_USUAL])
    }
    // And the centre lands on the bank's recorded offset, MIRRORED — the donor
    // transfer recovering a number it never read, because the elephant wears
    // this shape on this same box-03.
    expect(boxOf(build(), 'tail').getCenter(new THREE.Vector3()).z)
      .toBeCloseTo(-trunk.offset[2]!, 4)
  })

  it('is not sunk deeper, and the reason is what would hang under the rump', () => {
    const g = build()
    const t = boxOf(g, 'tail'), h = boxOf(g, 'hull')
    // Sunk the elephant's own 0.000 the whole shape sits behind the rear face,
    // so its lowest vertex — 0.0106 under the hull's own bottom — is in clear
    // air rather than poking through a bottom that chamfers up from z = -0.3125.
    expect(t.max.z).toBeCloseTo(-HULL_FRONT_Z_USUAL, 4)
    expect(h.min.y - t.min.y).toBeCloseTo(0.0106, 3)
    const bottom = welded('box-03').filter(q => Math.abs(q[1]! + 0.625) < 1e-6)
    expect(Math.max(...bottom.map(q => Math.abs(q[2]!)))).toBeCloseTo(0.3125, 6)
    // It costs 0.2126 of keep-out and it is the only thing on the animal that
    // reaches more than 0.11 away from the shell.
    expect(t.min.z + t.max.z).toBeLessThan(0)
    expect(partById('box-18')!.size[2]! / 2).toBeCloseTo(0.2126, 4)
  })
})

describe('animal-hamster: small round ears, a bead eye, and a solved mouth', () => {
  it('wears the SMALLEST top-face ear in the bank, and recovers its own offset', () => {
    const ear = partById('box-02')!
    // Small: 0.315 against the koala dish's 0.7427, which is 2.36x. The measured
    // separation from five sibling rodents starts here.
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(Math.max(...ears.map(p => p.shape.longest)) / ear.shape.longest)
      .toBeGreaterThan(2.36 * 0.9)
    expect(partById('box-25')!.size[0]! / ear.size[0]!).toBeCloseTo(2.358, 3)
    expect(ear.attachment!.axis).toBe('y')
    expect(ear.attachment!.dir).toBe(1)

    // Exact, not an inference: the beaver wears this ear on this same box-03, so
    // joining at the top face and sinking the beaver's own 0.777778 puts the
    // centre back on the bank's recorded 1.34375 with nothing chosen.
    const g = build()
    const c = boxOf(g, 'ear-r').getCenter(new THREE.Vector3())
    expect(c.y).toBeCloseTo(ear.offset[1]!, 4)
    expect(c.x).toBeCloseTo(ear.offset[0]!, 4)
    expect(c.z).toBeCloseTo(ear.offset[2]!, 4)
  })

  it('sets that ear HIGH on the shoulder, and it is still buried 0.155 there', () => {
    // The pack's own x = 0.4475 is outside the flat top face, which reaches only
    // 0.3125, so the ear does not rise out of the plane it was joined to — it
    // rises out of the cube's shoulder, which is 0.09 lower. Measured with a ray
    // down the shell rather than by assuming the chamfer falls 1:1, because it
    // does not: box-03's corner is rounded OUT to 0.5 (authored.ts:238-263).
    const ear = partById('box-02')!
    const surface = hullTopAt(ear.offset[0]!, ear.offset[2]!) + partById('box-03')!.offset[1]!
    expect(surface).toBeCloseTo(1.34125, 4)
    const b = boxOf(build(), 'ear-r')
    expect(surface - b.min.y, 'the ear is not embedded').toBeCloseTo(0.155, 3)
    expect(surface - b.min.y).toBeGreaterThan(0.125)   // §3: nothing floats
    // And it barely stands off the top of the animal: 0.070 of the hull's plane,
    // which is what "small ears, set high" is when it is a number.
    expect(b.max.y - (0.18125 + 1.25)).toBeCloseTo(0.07, 4)
  })

  it('takes Kenney\'s own inner-ear disc for one byBand entry and no geometry', () => {
    // Band 7 is ten triangles at z = +0.1025 exactly — a flat disc of radius
    // 0.1057 on the ear's forward face. If that band ever stops being the disc,
    // this species paints a random ten triangles dark.
    const p = partById('box-02')!
    const zs = new Set<string>()
    let n = 0
    for (let t = 0; t < p.tris; t++) {
      if (p.bands[t] !== 7) continue
      n += 1
      for (let k = 0; k < 3; k++) zs.add(p.positions[p.indices[t * 3 + k]! * 3 + 2]!.toFixed(4))
    }
    expect(n).toBe(10)
    expect([...zs]).toEqual(['0.1025'])
    expect(HAMSTER_ASSEMBLY.features.find(f => f.name === 'ear')!.paint)
      .toEqual({ base: 'coat', byBand: { 7: 'ear' } })
  })

  it('wears the bank\'s only ROUND eye card, which is what "round" gets here', () => {
    // Ten eye cards in the pack and exactly two of them are square — plate-08
    // and its mirror. Everything else is an almond. A hamster's eye is a bead.
    const round = PARTS_BANK.filter(p => p.roles.includes('eye')
      && Math.abs(p.size[0]! - p.size[1]!) < 1e-6)
    expect(round.map(p => p.id).sort()).toEqual(['plate-08', 'plate-09'])
    const card = partById('plate-08')!
    expect(card.shape.symmetry).toBe('radial')
    expect(card.size[0]).toBe(0.4)
    expect(card.size[1]).toBe(0.4)
    expect(partById('plate-01')!.size[1]!).toBeLessThan(0.33)   // the default almond
    const eye = HAMSTER_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-08')
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
  })

  it('lets the MOUTH solve, and the solve recovers the card\'s own recorded z', () => {
    // The first species to place a face card without hard-coding it. A card has
    // no thickness, so the join and the finish are the same plane and the quad
    // z-fights into invisibility; CARD_STANDOFF is the 0.010 of daylight the
    // pack itself gives one. On this hull that lands the card at 0.635 — which
    // is plate-03's OWN recorded offset z, recovered by a solve that never read
    // it. The goldfish, firefly and glow-worm each type that number by hand.
    const card = partById('plate-03')!
    expect(card.size[2]).toBe(0)
    expect(card.offset[2]).toBeCloseTo(EYE_CARD_Z, 6)
    expect(HULL_FRONT_Z_USUAL + CARD_STANDOFF).toBeCloseTo(card.offset[2]!, 6)
    const mouth = HAMSTER_ASSEMBLY.features.find(f => f.name === 'mouth')!
    expect(mouth.placement).toEqual({
      kind: 'single', at: [0, card.offset[1], HULL_FRONT_Z_USUAL + CARD_STANDOFF],
    })
    expect(boxOf(build(), 'mouth').min.z).toBeCloseTo(card.offset[2]!, 4)
  })

  it('has a blunt face: no snout, and nothing forward of 0.109', () => {
    const g = build()
    // The mouse and the squirrel wear the beaver's muzzle and the shrew has the
    // long face. This animal has neither — the nose goes straight onto the
    // cube's front face at the panda's own sink of nothing.
    expect(HAMSTER_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
    expect(partById('tube-08')!.attachment!.sunkFractionMean).toBe(0)
    expect(boxOf(g, 'nose').max.z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.1082, 3)
    // Deliberately not `wedge-10`, which is measurably the better nose tip and
    // reads as a tongue; Joe rejected that one by name on the hedgehog.
    expect(HAMSTER_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })
})

describe('animal-hamster: pale feet, a painted belly, and one cell per picture', () => {
  it('stops the sock on the LEG\'S OWN chamfer edge, which is the only line there', () => {
    // box-01's welded points sit at three heights and no more, so a sock has
    // exactly one line on that shape it could follow: the bottom chamfer edge,
    // 0.0625 above the foot, which is 0.204115 of its own height.
    const ys = [...new Set(welded('box-01').map(q => q[1]!.toFixed(6)))]
      .map(Number).sort((a, b) => a - b)
    expect(ys).toHaveLength(3)
    const height = ys[2]! - ys[0]!
    const edge = (ys[1]! - ys[0]!) / height
    expect(ys[1]! - ys[0]!).toBeCloseTo(0.0625, 6)
    expect(edge).toBeCloseTo(0.204115, 5)

    // `texture.ts` only allows k/16, so the edge itself is unsayable. 3/16 is
    // the nearest point on the pack's grid and it lands BELOW the edge, inside
    // the foot; 4/16 overshoots it and runs the cream up the shin.
    const leg = HAMSTER_ASSEMBLY.features.find(f => f.name === 'leg')!
    const patch = leg.paint.patch!
    expect(patch).toEqual({ below: 'belly', at: 0.1875 })
    expect(patch.at * SLOT_PX).toBe(3)
    expect(Math.abs(edge - 3 / SLOT_PX)).toBeLessThan(Math.abs(edge - 4 / SLOT_PX))
    expect(edge - patch.at).toBeCloseTo(0.0167, 3)      // 0.0051 in model units
    expect((edge - patch.at) * height).toBeCloseTo(0.0051, 4)
    // Still the pack's own leg row underneath it: JT-044 is paint, not placement.
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
  })

  it('gives the legs their own palette cell, because a cell carries ONE boundary', () => {
    // `assembly.ts:493` — "one cell, one picture". The coat's boundary is spent
    // on the belly line, so a pale foot needs a second cell rather than a second
    // patch. This is the whole reason there is a `limb` slot at all, and it is
    // the trap the next two-tone species will fall into.
    expect(HAMSTER_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    expect(HAMSTER_ASSEMBLY.hull.paint.base).toBe('coat')
    const leg = HAMSTER_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.paint.base).toBe('limb')
    expect(leg.paint.base).not.toBe(HAMSTER_ASSEMBLY.hull.paint.base)
    // Both boundaries are on the pack's own 1/16 grid, which is what makes them
    // quotable back at Kenney rather than merely chosen.
    expect(0.5 * SLOT_PX).toBe(8)
    // And the belly line is painted, not cut: the hull is the bank's own 60.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })
})

describe('animal-hamster: the one that is round, measured', () => {
  it('is the pack\'s own cube with nothing long on it', () => {
    const g = build()
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The width is
    // the shell's own 1.250 and the depth is 1.783, of which the nub is 0.425
    // and the nose 0.108 — nothing else on the animal adds any at all.
    expect(s.x).toBeCloseTo(1.25, 3)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.892, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)   // the fox's, the pack's worst
    expect(s.z - 1.25).toBeCloseTo(partById('box-18')!.size[2]!
      + (boxOf(g, 'nose').max.z - HULL_FRONT_Z_USUAL), 3)
    // Every mesh except the nub is inside a box only 0.11 bigger than the hull.
    for (const name of ['ear-r', 'ear-l', 'eye-r', 'eye-l', 'nose', 'mouth']) {
      const b = boxOf(g, name)
      expect(b.max.z - HULL_FRONT_Z_USUAL, `${name} runs forward`).toBeLessThan(0.11)
    }
  })

  it('does not take a long tail or a big ear, which is the sibling contract', () => {
    // `home-pets.ts` puts six rodents on one album page and gives this one
    // "stub" and "round". The guinea pig has no tail, the gerbil and the degu
    // are tufted, the chinchilla is bushy and the rat's is thin and long — so
    // the shortest shape in the bank belongs to this species and to no other.
    const tail = HAMSTER_ASSEMBLY.features.find(f => f.name === 'tail')!
    const reach = (id: string): number => partById(id)!.size[2]!
    for (const p of PARTS_BANK.filter(q => q.roles.includes('tail'))) {
      expect(reach(tail.part), `${p.id} is shorter than the stub`)
        .toBeLessThanOrEqual(reach(p.id))
    }
    // And the ear is near the bottom of twenty-three by longest extent: only
    // three shapes in the whole ear family are smaller than 0.3150, and all
    // three are the bee's and the koala's, which no rodent would wear.
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(ears).toHaveLength(23)
    const smaller = ears.filter(p => p.shape.longest < partById('box-02')!.shape.longest)
    expect(smaller.map(p => p.id).sort()).toEqual(['box-05', 'box-27', 'box-28'])
    expect(HAMSTER_ASSEMBLY.palette['coat']).toBe(0xc9803c)
  })
})
