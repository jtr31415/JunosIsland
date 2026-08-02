/**
 * The gerbil. Home Pets' tufted-tailed rodent, and the second FLAGGED species
 * whose flag is about something that cannot be built rather than something that
 * was.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a gerbil can say, and it says four
 * things the next builder needs and cannot get from a screenshot:
 *
 *   1. **The tuft is a CUT, not a shape.** `wedge-18` and `wedge-07` are the same
 *      bounding box to six decimals and differ in exactly one measurable thing —
 *      whether Kenney split a band off the tip. That is this page's own
 *      tufted/bare split between the gerbil and the rat, and it is re-derived here
 *      from the bank's own bands rather than believed.
 *   2. **The tail's height is a BOUND and not a taste.** 1.017050 is the lowest
 *      this tail can be carried with its whole join cross-section still on flat
 *      geometry, and it is solved here from the hull's own rear face and the
 *      tail's own points.
 *   3. **The posture cannot be expressed**, and that is pinned as a fact about the
 *      BANK and the SCHEMA rather than as an opinion in a comment: one leg shape
 *      over 86 instances, one row, and no shell taller than the cube that is not
 *      wearing ears. If a second leg shape or a genuinely taller body ever lands,
 *      this file goes red and the flag comes off.
 *   4. **Nothing in the nose family is a pointed muzzle** — measured over all 28
 *      of them, so the approximation on this face is checkable rather than
 *      apologised for.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, GERBIL_ASSEMBLY, LEG_ROW, PACK_PUPIL,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-gerbil',
  parts: ['box-01', 'box-03', 'box-22', 'cone-04', 'plate-14', 'tube-01', 'wedge-18'],
  height: 1.5403,
  verts: 531,
  tris: 735,
  // The tail is the next biggest mesh after the hull and it is a seventeenth of
  // it: 0.200 x 1.047 x 0.555 of box against a 1.250 cube. A slim tail is
  // supposed to measure like one.
  massRatio: 16,
  // Nothing is spun. Said as a number, out loud, because rule 4's "no node
  // carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-gerbil')
  g.updateMatrixWorld(true)
  return g
}
const mesh = (g: THREE.Group, name: string): THREE.Mesh =>
  g.getObjectByName(name) as THREE.Mesh
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}
/** Every world-space vertex of one built mesh. */
const worldPoints = (m: THREE.Mesh): THREE.Vector3[] => {
  const a = m.geometry.getAttribute('position')
  const out: THREE.Vector3[] = []
  for (let i = 0; i < a.count; i++) {
    out.push(new THREE.Vector3().fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld))
  }
  return out
}
/** How thin a shape is on its thinnest axis — §7's axis for separating tails. */
const thinnest = (p: BakedPart): number => Math.min(...p.size)
/** The y range of one band's triangles, in the part's own frame. */
const bandY = (p: BakedPart, band: number): [number, number] => {
  let lo = Infinity, hi = -Infinity
  for (let t = 0; t < p.bands.length; t++) {
    if (p.bands[t] !== band) continue
    for (let k = 0; k < 3; k++) {
      const y = p.positions[p.indices[t * 3 + k]! * 3 + 1]!
      if (y < lo) lo = y
      if (y > hi) hi = y
    }
  }
  return [lo, hi]
}

describe('animal-gerbil: the tail is the bank\'s thinnest, and the tuft is a CUT', () => {
  it('wears the joint-thinnest tail in the bank, 2.94x under the brush group', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    // §7: "Thickness, not length, is the axis that separates the seven." This
    // animal takes the thin end of it and the degu is separated on the same axis
    // from the other end, so if a thinner tail ever lands the separation moves.
    const thin = Math.min(...tails.map(thinnest))
    expect(thin).toBeCloseTo(0.2, 6)
    expect(tails.filter(p => thinnest(p) === thin).map(p => p.id).sort())
      .toEqual(['wedge-07', 'wedge-18'])
    const brush = tails.filter(p => thinnest(p) > 0.5)
    expect(brush.map(p => p.id).sort()).toEqual(['box-23', 'box-38', 'wedge-03'])
    expect(Math.min(...brush.map(thinnest)) / thin).toBeGreaterThan(2.9)
  })

  it('paints Kenney\'s OWN tip cut, at the end furthest from the join', () => {
    const tail = partById('wedge-18')!
    // Two bands and no more, so "the tip" is a thing this shape can say at all.
    expect([...new Set(tail.bands)].sort((a, b) => a - b)).toEqual([3, 7])
    expect(tail.bands.filter(b => b === 3)).toHaveLength(64)
    const [lo, hi] = bandY(tail, 3)
    const half = Math.max(...points('wedge-18').map(p => Math.abs(p[1])))
    // The outer quarter of its own length, at +y...
    expect((hi - lo) / (half * 2)).toBeCloseTo(0.245, 3)
    expect(hi).toBeCloseTo(half, 4)
    // ...and +y is the end AWAY from the join, which is what makes it a tip
    // rather than a rump patch: every point still inboard of the rear plane once
    // the donor transfer has placed it sits at the OTHER end, local y <= -0.34.
    const sunk = tail.attachment!.sunkFractionMean * tail.size[2]!
    const root = points('wedge-18').filter(p => p[2] >= tail.size[2]! / 2 - sunk)
    expect(Math.max(...root.map(p => p[1]))).toBeLessThan(-0.34)
    expect(GERBIL_ASSEMBLY.features.find(f => f.name === 'tail')!.paint)
      .toEqual({ base: 'coat', byBand: { 3: 'tuft' } })
  })

  it('is the CUT and not the shape — `wedge-07` is the same box with no cut', () => {
    // This is the gerbil/rat split on this page, and it is a fact about the BANK.
    // If a tip band is ever cut into `wedge-07`, "bare" stops being sayable with
    // it and this test is where that surfaces.
    const a = partById('wedge-18')!, b = partById('wedge-07')!
    for (let i = 0; i < 3; i++) expect(a.size[i]!).toBeCloseTo(b.size[i]!, 6)
    expect([...new Set(b.bands)]).toEqual([13])
    expect(new Set(a.bands).size).toBe(2)
  })

  it('adds no tuft PART of its own, because the cut is already there', () => {
    // `on: 'tail'` would hang a solid on the tail's placed tip and is the right
    // answer for a tail nobody cut. Refused here: it would be §4's way 1 and way 2
    // both, for one tuft, at 40-plus triangles. Recorded so it is not added back.
    for (const f of GERBIL_ASSEMBLY.features) {
      expect(f.name, 'a second part is standing in for the band').not.toBe('tuft')
    }
    expect(GERBIL_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['ear', 'eye', 'leg', 'nose', 'snout', 'tail'])
  })

  it('refuses `wedge-15`, which is the only other tail Kenney cut at the tip', () => {
    // The lion's, and a genuine tuft on the donor — but 1.4x thicker on the axis
    // this species is separated by, and already spent as the goldfish's fin.
    const lion = partById('wedge-15')!
    const [lo, hi] = bandY(lion, 5)
    expect(hi - lo).toBeGreaterThan(0.2)                  // a tip band, like ours
    expect(thinnest(lion) / thinnest(partById('wedge-18')!)).toBeCloseTo(1.4, 2)
    expect(GERBIL_ASSEMBLY.features.some(f => f.part === 'wedge-15')).toBe(false)
  })
})

describe('animal-gerbil: the one chosen number, and it is a BOUND', () => {
  it('carries the tail as low as the flat rear face allows, and no lower', () => {
    const hull = partById('box-03')!
    const hz = Math.max(...points('box-03').map(p => Math.abs(p[2])))
    // How far the flat rear face reaches in y before the chamfer falls away —
    // measured, because §8 is explicit that assuming it costs a whole row.
    const reach = Math.max(...points('box-03')
      .filter(p => Math.abs(Math.abs(p[2]) - hz) < 1e-6).map(p => Math.abs(p[1])))
    expect(reach).toBeCloseTo(0.3125, 6)
    const faceBottom = hull.offset[1]! - reach
    expect(faceBottom).toBeCloseTo(0.49375, 6)
    // The tail's lowest point sits at its own -0.5233, so the lowest centre that
    // keeps the whole join cross-section on that face is the sum. Nothing here is
    // chosen: the hull's face and the tail's own extent decide it.
    const minY = Math.min(...points('wedge-18').map(p => p[1]))
    const tail = GERBIL_ASSEMBLY.features.find(f => f.name === 'tail')!
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[1]).toBeCloseTo(faceBottom - minY, 6)
      expect(tail.placement.at).toEqual([0, 1.01705, -0.625])
    }
    // And the tiger's own recorded height is NOT it: 1.186701 was measured on
    // `box-41`, which is 1.300 tall, and carrying it here lifts the tail 0.17 and
    // reads as a cat's.
    expect(partById('wedge-18')!.offset[1]!).toBeCloseTo(1.186701, 6)
    expect(partById('box-41')!.size[1]!).toBeCloseTo(1.3, 6)
  })

  it('lands the join cross-section wholly on real flat geometry', () => {
    const g = build()
    const t = boxOf(g, 'tail')
    // The lowest vertex on the bottom edge of the flat rear face, to the fourth
    // decimal the float32 attribute supports. A hair lower and the join plane
    // starts hanging off a chamfer that has already fallen away — §3, and the
    // whole reason the number above is a bound.
    expect(t.min.y).toBeCloseTo(0.49375, 4)
    const inboard = worldPoints(mesh(g, 'tail')).filter(p => p.z > -0.625 + 1e-6)
    expect(inboard.length).toBeGreaterThan(0)
    for (const p of inboard) {
      expect(Math.abs(p.x), 'the root is wider than the flat rear face').toBeLessThan(0.3125)
      expect(p.y, 'the root reaches above the flat rear face').toBeLessThan(1.11875)
      expect(p.y, 'the root reaches below the flat rear face').toBeGreaterThan(0.49375 - 1e-3)
    }
    // Sunk the tiger's own measured burial and no more.
    expect(GERBIL_ASSEMBLY.features.find(f => f.name === 'tail')!.sink)
      .toBe(partById('wedge-18')!.attachment!.sunkFractionMean)
  })

  it('puts the dark tip clear ABOVE its own back, where a child can see it', () => {
    const g = build()
    // The hull tops out at the pack's own floor, 1.43125, and the tail reaches
    // 1.5403 — so the tuft is the highest thing on the animal and reads against
    // the sky rather than against the body. It is also what sets the height.
    expect(boxOf(g, 'hull').max.y).toBeCloseTo(1.43125, 4)
    expect(boxOf(g, 'tail').max.y).toBeCloseTo(1.5403, 3)
    expect(new THREE.Box3().setFromObject(g).max.y).toBeCloseTo(boxOf(g, 'tail').max.y, 4)
  })
})

describe('animal-gerbil: the posture that CANNOT be expressed', () => {
  it('has one leg shape to work with — 1 shape over 86 instances, in the BANK', () => {
    // The flag says a gerbil's long hind legs are unsayable. Half the reason is
    // this: there is no second leg shape to make a back pair out of. If one is
    // ever lifted, this goes red and the posture is worth reopening.
    expect(PARTS_BANK.filter(p => p.roles.includes('leg')).map(p => p.id)).toEqual(['box-01'])
    expect(LEG_ROW.part).toBe('box-01')
  })

  it('stands on ONE row at ONE height, because a row is all a species can say', () => {
    const legs = GERBIL_ASSEMBLY.features.filter(f => f.name === 'leg')
    expect(legs).toHaveLength(1)
    const l = legs[0]!
    // The other half of the reason: the placement is a row of two, mirrored, and
    // both ends share a y. There is nowhere to put a taller back pair even if a
    // second shape existed.
    if (l.placement.kind === 'row') {
      expect(l.placement.from[1]).toBe(LEG_ROW.y)
      expect(l.placement.to[1]).toBe(LEG_ROW.y)
      expect(l.placement.mirror).toBe(true)
    }
    const g = build()
    const tops = ['leg-r0', 'leg-l0', 'leg-r1', 'leg-l1'].map(n => boxOf(g, n).max.y)
    for (const t of tops) expect(t).toBeCloseTo(tops[0]!, 6)
  })

  it('has no taller SHELL to carry the uprightness instead', () => {
    const hulls = PARTS_BANK.filter(p => p.roles.includes('hull'))
    // Only two shells in the pack are taller than the 1.250 cube at all, and
    // neither is a taller body: `box-41` is 0.05 taller and bigger in every
    // direction (it is the degu's separation, not this animal's), and `box-21`'s
    // whole excess is two forward EAR LUGS — measured here, as `animal-wolf.ts`
    // measured it, because a species wearing that shell may have no ears at all.
    expect(hulls.filter(p => p.size[1]! > 1.2501).map(p => p.id).sort())
      .toEqual(['box-21', 'box-41'])
    const fox = points('box-21')
    const foxTop = Math.max(...fox.map(p => p[1]))
    // Its body IS the 1.250 cube: the top face of that cube sits 1.250 below its
    // own crown, at local y +0.4975, and everything above it is lug.
    const cubeTop = 1.25 - foxTop
    expect(cubeTop).toBeCloseTo(0.4975, 6)
    expect(foxTop - cubeTop).toBeCloseTo(0.255, 4)
    const above = fox.filter(p => p[1] > cubeTop + 1e-6)
    expect(above.length).toBeGreaterThan(100)
    for (const p of above) {
      expect(Math.abs(p[0]), 'a lug point sits on the midline').toBeGreaterThan(0.2)
      expect(p[2], 'a lug point sits behind the head').toBeGreaterThan(0.19)
    }
    expect(GERBIL_ASSEMBLY.hull.part).toBe('box-03')
  })

  it('says all of that where Joe reads it, and authors nothing to fake it', () => {
    const flag = GERBIL_ASSEMBLY.flag!
    expect(flag).toMatch(/CANNOT BE EXPRESSED/)
    expect(flag).toMatch(/hind legs/i)
    expect(flag).toMatch(/UNREVIEWED/)
    // Flagged for the posture and the palette and nothing else: no bespoke shape,
    // no stretch, no spin, and no budget declared, because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(GERBIL_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(GERBIL_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
    expect(GERBIL_ASSEMBLY.features.some(f => f.spin !== undefined)).toBe(false)
  })

  it('refuses `box-25` as a haunch, and the chamfer is what refuses it', () => {
    // The koala's dish is the only side-mounting solid big enough to read as a
    // thigh. The cube's flat side face reaches |z| = 0.3125 and the chamfer then
    // falls away 1:1, so a disc set back on the rump runs its rear edge a tenth of
    // a unit past real geometry. §3: nothing floats.
    const dish = partById('box-25')!
    expect(dish.attachment!.axis).toBe('x')
    expect(dish.size[2]! / 2 + 0.25).toBeGreaterThan(0.3125 + 0.1)
    expect(GERBIL_ASSEMBLY.features.some(f => f.part === 'box-25')).toBe(false)
  })
})

describe('animal-gerbil: the face the bank cannot make pointed', () => {
  it('has no tapering muzzle to reach for — measured over all 28 nose shapes', () => {
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose'))
    expect(noses).toHaveLength(28)
    // Every tube in the family is taper 1.000 — a barrel. The five that taper at
    // all are a beak, a tongue, a pair of incisors and the bunny's blunt muzzle,
    // and none of them is a muzzle this animal can wear. If a tapering muzzle is
    // ever lifted, this goes red and the face here is reconsidered.
    expect(noses.filter(p => p.shape.taper < 0.95).map(p => p.id).sort())
      .toEqual(['box-08', 'cone-06', 'wedge-01', 'wedge-02', 'wedge-10'])
    expect(partById('cone-06')!.shape.taper).toBe(0)
    expect(partById('cone-06')!.provenance[0]!.species).toBe('parrot')
    for (const id of ['box-08', 'cone-06', 'wedge-01', 'wedge-02', 'wedge-10']) {
      expect(GERBIL_ASSEMBLY.features.some(f => f.part === id), `${id} is worn here`).toBe(false)
    }
    expect(partById('tube-01')!.shape.taper).toBe(1)
  })

  it('takes the furthest-REACHING small button instead, on the muzzle\'s own plane', () => {
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose') && p.size[0]! < 0.25)
    const reach = (p: BakedPart): number =>
      p.size[2]! * (1 - (p.attachment?.sunkFractionMean ?? 0))
    // What is left once a point is unavailable is projection, and `box-22` has the
    // most of it: 0.1557 against `box-09`'s 0.0798 and `box-32`'s 0.1207 once the
    // lion's own burial is taken off.
    expect(noses.reduce((a, b) => (reach(a) > reach(b) ? a : b)).id).toBe('box-22')
    expect(reach(partById('box-22')!)).toBeCloseTo(0.155703, 6)

    const g = build()
    // Anchored on the muzzle's own placed front plane, so a nose that floats or
    // buries cannot happen quietly.
    const front = boxOf(g, 'snout').max.z
    expect((mesh(g, 'nose').userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // And the beaver's muzzle recovers the beaver's own recorded z, from a solve
    // that joined it at this cube's front face and never read the number.
    expect(boxOf(g, 'snout').getCenter(new THREE.Vector3()).z)
      .toBeCloseTo(partById('tube-01')!.offset[2]!, 4)
  })
})

describe('animal-gerbil: the white belly, which IS sayable, and where it sits', () => {
  it('paints a level line at 6/16 — NOT the pack\'s 8/16, and here is why', () => {
    expect(GERBIL_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.375 })
    // On the pack's own authoring grid, which `texture.ts` refuses to leave.
    expect(0.375 * 16).toBe(6)
    // §7's mammal zone is 0.4808-0.5481 of the hull, measured off the TIGER, and
    // 8/16 is the only grid point inside it — every cube-bodied mammal built so
    // far sits there. A tiger's pale runs high up the flank; a gerbil's stops at
    // the bottom of it. 6/16 lands 0.15625 — two sixteenths — above the height at
    // which this cube's bottom chamfer finishes rising and the flat flank begins.
    const hull = partById('box-03')!
    const hx = Math.max(...points('box-03').map(p => Math.abs(p[0])))
    const flankBottom = hull.offset[1]! - Math.max(...points('box-03')
      .filter(p => Math.abs(Math.abs(p[0]) - hx) < 1e-6).map(p => Math.abs(p[1])))
    expect(flankBottom).toBeCloseTo(0.49375, 6)
    const line = 0.18125 + 0.375 * hull.size[1]!
    expect(line).toBeCloseTo(0.65, 6)
    // 0.15625 above it, which is an eighth of the hull's own height — so the
    // white is the whole underside plus an eighth of the flank, and stops level.
    expect(line - flankBottom).toBeCloseTo(0.15625, 6)
    expect((line - flankBottom) / hull.size[1]!).toBeCloseTo(2 / 16, 6)
    expect(0.18125 + 0.5 * hull.size[1]!).toBeCloseTo(0.80625, 6)   // where 8/16 would be
  })

  it('costs no geometry at all — the hull is the pack\'s own 60 triangles', () => {
    const hull = mesh(build(), 'hull')
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
    expect(hull.geometry.getIndex()!.count / 3).toBe(60)
  })
})

describe('animal-gerbil: the ear that recovers its donor, and the eye that is a bead', () => {
  it('recovers the hog\'s own recorded centre from a solve that never read it', () => {
    const ear = partById('cone-04')!
    // The hog wears this shape on `box-03` — this same shell — so the transfer is
    // exact rather than an inference, and the agreement is the evidence.
    expect(ear.provenance[0]!.species).toBe('hog')
    expect(partById('box-03')!.provenance.some(q => q.species === 'hog')).toBe(true)
    const half = Math.max(...points('cone-04').map(p => Math.abs(p[1])))
    const solved = 1.43125 + half - ear.attachment!.sunkFractionMean * half * 2
    expect(solved).toBeCloseTo(ear.offset[1]!, 4)
    expect(boxOf(build(), 'ear-r').getCenter(new THREE.Vector3()).y).toBeCloseTo(ear.offset[1]!, 3)
  })

  it('is SMALL and still embedded past §3\'s floor at its own station', () => {
    const ear = partById('cone-04')!
    const proud = ear.size[1]! * (1 - ear.attachment!.sunkFractionMean)
    expect(proud).toBeCloseTo(0.08455, 5)
    // Its station is 0.0345 outside the cube's flat top face, where the chamfer
    // has fallen 1:1 — so the burial to check is against the LOCAL surface, not
    // against the nominal plane. 0.1769 against §3's 0.125.
    const fall = Math.max(0, Math.abs(ear.offset[2]!) - 0.3125)
    expect(fall).toBeCloseTo(0.0345, 4)
    const buried = ear.size[1]! * ear.attachment!.sunkFractionMean - fall
    expect(buried).toBeGreaterThan(0.125)
    expect(buried).toBeCloseTo(0.17696, 5)
  })

  it('wears the biggest eye card in the bank, painted as a dark bead', () => {
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (p: BakedPart): number => p.size[0]! * p.size[1]!
    const card = partById('plate-14')!
    // "Big dark eyes" is the brief for this animal and this is the big half of it,
    // measured: nothing in the pack's ten eye cards is larger, and it is 1.5x the
    // default almond's area.
    for (const p of eyes) expect(area(p)).toBeLessThanOrEqual(area(card) + 1e-9)
    expect(area(card) / area(partById('plate-01')!)).toBeCloseTo(1.5048, 3)

    // And the dark half: the sclera is painted from the coat-dark slot rather than
    // the pale one, so the card reads as a bead. The pack's own measured pupil is
    // still there and is LIGHTER than the sclera, which makes it the catch-light.
    const eye = GERBIL_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.paint.base).toBe('tuft')
    expect(eye.paint.byBand?.[15]).toBe('pupil')
    const bead = GERBIL_ASSEMBLY.palette['tuft']!
    expect(GERBIL_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
    for (const shift of [16, 8, 0]) {
      expect((bead >> shift) & 0xff, 'the bead is not darker than the catch-light')
        .toBeLessThan((PACK_PUPIL >> shift) & 0xff)
    }
  })
})
