/**
 * The badger. Garden's first FLAGGED species, and the first whose test has to
 * pin something that is NOT there.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a badger can say, and it says
 * three things the next builder needs and cannot get from a screenshot:
 *
 *   1. **`box-12` is not a wider body.** Its 1.539 is two fused EAR LUGS on a
 *      1.250 cube torso. That is why this species has no ear part, and it is
 *      re-derived here from the bank's own vertices rather than believed.
 *   2. **`box-18` is the elephant's TRUNK** under Kenney's wrong name, and it is
 *      the bank's only stub tail. Both are measured here, over the whole bank.
 *   3. **The marking cannot be drawn**, and that is pinned as a fact about the
 *      BANK and the MECHANISM, not as an opinion in a comment. If a later change
 *      makes a stripe sayable, this file goes red and the flag comes off.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, BADGER_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

/*
 * A SIXTH SHAPE ARRIVED AT 84cd17a AND EVERY NUMBER BELOW MOVED WITH IT. Joe
 * opened this animal in the workbench editor and pushed it back carrying two
 * copies of `box-04` — the BEE's abdomen shell-ring, roled `band` — standing on
 * the rump at x = -0.2 and +0.2, y = 0.975, z = -0.6, each spun 90 about y,
 * stretched [0.95, 0.75, 0.45], sunk the bee's own recorded 0.968165 and painted
 * `mark`, the badger's own black. They are 168 vertices and 92 triangles apiece.
 *
 * The species' three claims — the fused ear lugs, the trunk-as-tail, the marking
 * that cannot be drawn — are all untouched by them. What they cost is the numbers:
 * the animal is 0.044 taller, its second-biggest mesh is no longer the tail, and
 * it has 96 more vertices and 184 more triangles.
 */
assertAssembly({
  id: 'animal-badger',
  parts: ['box-01', 'box-04', 'box-12', 'box-18', 'box-26', 'plate-01', 'tube-06'],
  // 1.4756, was 1.4312. The bare hull on standard legs is 1.43125 and NOTHING on
  // this animal used to reach above it; the rings clear its crown by 0.0444.
  height: 1.4756,
  verts: 508,
  tris: 752,
  // Was 20, when the next biggest mesh was the stub tail at a twenty-sixth of the
  // hull. It is now one of the two rings, at 0.2606 against the hull's 2.4053.
  // The generic floor rule 3 enforces is 3 and this clears it three times over,
  // so the hull is still plainly the animal — but it is no longer true that
  // nothing else on it has any size at all, and this is the honest number.
  massRatio: 9,
  // One: the trunk, turned to face backwards. Said as a number, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none. (The
  // two rings each carry one as well, so the true count is three.)
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-badger')
  g.updateMatrixWorld(true)
  return g
}
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

describe('animal-badger: box-12 is a cube wearing two ears, not a wider body', () => {
  it('has a 1.250 cube TORSO — every extra millimetre of its 1.539 is off the midline', () => {
    const hull = partById('box-12')!
    expect(hull.size[0]).toBeCloseTo(1.539484, 6)
    // The claim, measured: through the body — anywhere at or behind the flat
    // front face's own reach — the hull is exactly as wide as `box-03`.
    const body = points('box-12').filter(q => Math.abs(q[2]) <= 0.3125)
    expect(Math.max(...body.map(q => Math.abs(q[0])))).toBeCloseTo(0.625, 6)
    expect(partById('box-03')!.size[0]).toBeCloseTo(1.25, 6)
  })

  it('carries the extra width as two LUGS, high and forward, where an ear goes', () => {
    const wide = points('box-12').filter(q => Math.abs(q[0]) > 0.6251)
    // Fifteen points a side, and every one of them inside one small box on the
    // upper front corner of the head. Not a flank, not a shoulder: an ear.
    expect(wide).toHaveLength(30)
    for (const q of wide) {
      expect(Math.abs(q[0])).toBeLessThanOrEqual(0.7697 + 1e-4)
      expect(q[1]).toBeGreaterThan(0.32)   // upper half of the hull
      expect(q[1]).toBeLessThan(0.55)      // and below its top face
      expect(q[2]).toBeGreaterThan(0.34)   // forward of centre
      expect(q[2]).toBeLessThan(0.51)      // and inside the front face
    }
    // The confirmation the geometry cannot give on its own: NEITHER donor of this
    // hull has a separate ear record anywhere in the bank. The ears are in the
    // shell, which is why this shape is 180 triangles against the cube's 60.
    const ears = PARTS_BANK.filter(p => p.provenance.some(
      q => (q.species === 'cow' || q.species === 'deer') && q.role === 'ear'))
    expect(ears).toHaveLength(0)
    expect(partById('box-12')!.tris).toBe(180)
  })

  it('paints those lugs from Kenney\'s OWN cut on them, and adds no ear of its own', () => {
    // Band 5 is the flat forward face of each lug — the cow's inner ear, 12
    // triangles, all at z = 0.5000. Two-tone for one `byBand` entry, no geometry.
    const hull = partById('box-12')!
    const band5 = [...hull.bands.keys()].filter(t => hull.bands[t] === 5)
    expect(band5).toHaveLength(12)
    expect(BADGER_ASSEMBLY.hull.paint.byBand).toEqual({ 5: 'mark' })

    // And so there is NO ear feature. `box-30`, the lion's, was the plan's ear
    // and is refused twice over: it would be a second pair, and on this hull it
    // would FLOAT — its donor's own y = 1.336986 is a height at which this hull's
    // front surface has already receded to z = 0.4539, while a copy joined at
    // z = 0.625 and sunk its measured 0.509891 leaves its back face at 0.4961.
    // Recorded so the next builder does not helpfully add it back.
    expect(BADGER_ASSEMBLY.features.some(f => f.name.startsWith('ear'))).toBe(false)
    expect(BADGER_ASSEMBLY.features.some(f => f.part === 'box-30')).toBe(false)
    const lion = partById('box-30')!
    expect(lion.offset[1]).toBeCloseTo(1.336986, 6)
    expect(0.625 - lion.attachment!.sunkFractionMean * lion.size[2]!)
      .toBeGreaterThan(0.4539)
  })
})

describe('animal-badger: the tail is the elephant\'s TRUNK, turned around', () => {
  it('is the bank\'s only stub — measured over every tail in it', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBeGreaterThan(5)
    // Reach: how far a tail carries away from the body. `box-18` is the least of
    // them by a clear margin, and §7 is right that thickness, not length, is the
    // axis that separates the seven.
    const reach = (id: string): number => partById(id)!.size[2]!
    expect(Math.min(...tails.map(p => reach(p.id)))).toBeCloseTo(reach('box-18'), 6)
    expect(reach('box-18')).toBeLessThan(reach('box-23') / 2)  // the fox's brush
  })

  it('carries Kenney\'s wrong name, and the spin is what corrects it', () => {
    const trunk = partById('box-18')!
    // Every other tail in the bank attaches `z -1` — off the back. This one is
    // `z +1`, off the FRONT of a face, because it is the elephant's trunk and the
    // bank inherited the node's name.
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    for (const p of PARTS_BANK.filter(q => q.roles.includes('tail') && q.id !== 'box-18')) {
      expect(p.attachment!.dir, `${p.id} faces the same way as the trunk`).toBe(-1)
    }
    const tail = BADGER_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.spin).toEqual([{ axis: 'y', deg: 180 }])
    // Sunk the elephant's own measured burial, which is nothing at all.
    expect(tail.sink).toBe(0)
    expect(trunk.attachment!.sunkFractionMean).toBe(0)
  })

  it('is joined at the HULL\'S OWN centre — the one height its root fits on', () => {
    const hull = partById('box-12')!
    const tail = BADGER_ASSEMBLY.features.find(f => f.name === 'tail')!
    // 0.80625 is not a chosen number. It is `box-12`'s own recorded offset, and
    // it is the only height at which the stub's 0.6230 root lands wholly inside
    // the 0.6250 the flat rear face reaches — 0.001 to spare at each end.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, hull.offset[1], -0.625])
    }
    expect(partById('box-18')!.size[1]).toBeLessThan(0.625)
    expect(partById('box-18')!.size[1]).toBeGreaterThan(0.62)
    // The elephant's own recorded height would have put it 0.324 below centre,
    // past the flat face, standing clear of a chamfer that has fallen away.
    expect(partById('box-18')!.offset[1]).toBeCloseTo(0.482248, 6)

    const g = build()
    const t = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    const h = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    expect(t.min.y).toBeGreaterThan(h.min.y + 0.3115)
    expect(t.max.y).toBeLessThan(h.max.y - 0.3115)
    expect(t.max.z).toBeCloseTo(-0.625, 6)
  })
})

describe('animal-badger: the face is a white muzzle and two donor transfers', () => {
  it('joins the fox\'s muzzle at the front face and recovers the fox\'s own centre', () => {
    const fox = partById('tube-06')!
    const snout = BADGER_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, fox.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBe(0)
    // Solved from the join, then checked against a number the solve never used.
    // Four decimals, not more: the built attribute is float32 and puts the
    // pack's 0.74071 back as 0.7407 — the noise floor, not a disagreement.
    expect(world(build(), 'snout').z).toBeCloseTo(fox.offset[2]!, 4)
  })

  it('is WHITE, with Kenney\'s own upper band dark — the stripe\'s front end', () => {
    const snout = BADGER_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.paint).toEqual({ base: 'belly', byBand: { 7: 'mark' } })
    expect(BADGER_ASSEMBLY.palette['belly']).toBe(0xf8f6f0)
    // Band 7 is the UPPER half of the muzzle and band 3 the lower, so painting 7
    // puts black along the top of a white muzzle rather than under it. Measured
    // off the part, because getting this backwards is invisible in a definition.
    const p = partById('tube-06')!
    const meanY = (band: number): number => {
      const ys: number[] = []
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) ys.push(p.positions[p.indices[t * 3 + k]! * 3 + 1]!)
      }
      return ys.reduce((a, b) => a + b, 0) / ys.length
    }
    expect(meanY(7)).toBeGreaterThan(meanY(3))
  })

  it('hangs the nose on the muzzle\'s own front plane, not near it', () => {
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // A broad dark PAD, which is what a digging animal has. Deliberately not
    // `wedge-10`: measurably a nose tip, and it reads as a tongue.
    expect(BADGER_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(partById('box-26')!.roles).toContain('nose')
  })

  it('takes the eye card and the leg row entire, because it never mentions them', () => {
    const card = partById('plate-01')!
    const eye = BADGER_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    const leg = BADGER_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    // The stations scale with the hull, so the widest hull stands widest: 0.3325
    // against the cube's own 0.27, for nothing said in the definition. Four
    // decimals because the builder measures the half-width off the float32
    // positions, which put the bank's 0.769742 back as 0.7697.
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from[1]).toBe(LEG_ROW.y)
      expect(leg.placement.from[0]).toBeCloseTo(0.27 * (1.539484 / 1.25), 4)
    }
    expect(BADGER_ASSEMBLY.hull.stretch).toBeUndefined()
  })
})

describe('animal-badger: the marking, and the part of it that cannot be drawn', () => {
  it('paints the underside at the pack\'s own mammal line and adds no geometry', () => {
    expect(BADGER_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-12')!.tris)
  })

  it('cannot say "the FRONT is white": a patch carries a height and nothing else', () => {
    // Structural, and the whole reason this species is flagged. `Paint.patch` is
    // { below, at } — `at` is a fraction of the part's HEIGHT, so the boundary is
    // a level plane and there is no z term to reach for. A badger's white face is
    // a z-region, and rule 3 leaves no separate head to paint instead.
    const patch = BADGER_ASSEMBLY.hull.paint.patch!
    expect(Object.keys(patch).sort()).toEqual(['at', 'below'])
    expect(typeof patch.at).toBe('number')
  })

  it('has no card in the BANK that could carry a stripe — measured, not assumed', () => {
    const cards = PARTS_BANK.filter(p => p.roles.includes('card'))
    expect(cards.length).toBeGreaterThan(0)
    for (const p of cards) {
      const d = [...p.size].sort((a, b) => b - a)
      // Nothing longer than 0.44 in the pack's units — a nose-to-ear stripe on
      // this hull needs about 0.6 of run — and nothing thinner than 1:2.5, where
      // a stripe is 1:6 or worse. Every one of them is a blotch or a mouth line.
      expect(d[0], `${p.id} is longer than any marking card was`).toBeLessThan(0.44)
      expect(d[0]! / d[1]!, `${p.id} is thin enough to be a stripe`).toBeLessThan(2.5)
    }
  })

  it('flags all of that where Joe reads it, and authors nothing to fake it', () => {
    const flag = BADGER_ASSEMBLY.flag!
    expect(flag).toMatch(/CANNOT BE EXPRESSED/)
    expect(flag).toMatch(/stripe/i)
    expect(flag).toMatch(/patch/i)
    // Flagged for the marking and for nothing else: no bespoke shape and no
    // budget declared, because none is over. Both of those still hold.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(BADGER_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    /* THE THIRD ITEM IN THAT LIST WAS "AND NO STRETCH", AND IT STOPPED BEING TRUE
     * AT 84cd17a. Joe's editor push put two `box-04` rings on the rump, each at
     * [0.95, 0.75, 0.45]. Nothing is broken by that: `Feature.stretch` is a legal
     * field, rule 1's note on it is a caution ("think twice") and not a
     * declaration, and neither rule 1 nor rule 9 is strained — which is what the
     * two assertions above check. So this NAMES the two features that carry one
     * rather than forbidding any, and it still goes red if a third appears. */
    expect(BADGER_ASSEMBLY.features.filter(f => f.stretch !== undefined).map(f => f.name))
      .toEqual(['box-04', 'box-04-2'])
  })

  it('fits between two trees, and it is the DEPTH that costs, not the width', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. This is the
    // widest hull in the pack and its width is NOT what binds: 1.539 across is
    // 0.770, while the muzzle in front and the stub behind make 2.046 of depth.
    expect(s.x / 2).toBeCloseTo(0.7697, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.023, 2)
    // And still inside the fox's 1.15, which is the pack's worst and the number
    // the island already copes with. `garden.ts` had to refuse this species a
    // snout under the quadruped kit at a keep-out of 1.63; assembled, it wears one.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
