/**
 * The kinkajou. Night Time's golden procyonid, and the one animal in this batch
 * with no marking problem at all.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a kinkajou can say: four parts
 * come from ONE donor onto that donor's own shell, so every transfer is exact
 * rather than an inference; the eye is the biggest the pack ever drew and cannot
 * be made bigger; and the tail is the only one of the bank's five spent thin
 * ropes that is carried UP instead of trailed.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, KINKAJOU_ASSEMBLY, EYE_CARD_Z }
  from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-kinkajou',
  parts: ['box-01', 'box-34', 'box-36', 'plate-14', 'tube-01', 'tube-08', 'wedge-07'],
  height: 1.8568,
  verts: 602,
  tris: 852,
  // The raised tail is the biggest thing after the hull and it is a fourteenth
  // of it — the ears are buried four fifths deep and barely register.
  massRatio: 10,
  // The tail is turned 45 degrees onto the rear chamfer's own normal, and rule
  // 4's "no node carries a rotation" passes vacuously without something spun.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-kinkajou')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-kinkajou: four parts from ONE donor, onto that donor\'s own shell', () => {
  it('wears the panda\'s hull, ear, eye and nose, so no transfer is an inference', () => {
    const panda = (id: string): boolean =>
      partById(id)!.provenance.every(p => p.species === 'panda')
    for (const id of ['box-36', 'box-34', 'plate-14', 'tube-08']) {
      expect(panda(id), `${id} has a donor other than the panda`).toBe(true)
    }
    expect(KINKAJOU_ASSEMBLY.hull.part).toBe('box-36')
  })

  it('recovers the panda ear\'s recorded centre to the digit from a join it never used', () => {
    const ear = partById('box-34')!
    const f = KINKAJOU_ASSEMBLY.features.find(q => q.name === 'ear')!
    // Joined at THIS shell's own top face, 0.80625 + 0.625 = 1.43125...
    if (f.placement.kind === 'pair') expect(f.placement.at[1]).toBeCloseTo(1.43125, 9)
    // ...and sunk the panda's own 0.777778 of its own 0.315.
    expect(f.sink).toBeCloseTo(ear.attachment!.sunkFractionMean, 9)
    // So the centre lands on 1.3437204 against the bank's recorded 1.3437500 —
    // 3.0e-5, which is as close as a solve running through `bank.generated.ts`'s
    // FOUR-decimal positions can get to a six-decimal `offset`. Solved for, then
    // checked against a number that was never fed in.
    const w = build().getObjectByName('ear-r')!.getWorldPosition(new THREE.Vector3())
    expect(w.y).toBeCloseTo(ear.offset[1]!, 4)
    expect(Math.abs(w.y - ear.offset[1]!)).toBeLessThan(5e-5)
    expect(ear.offset[1]).toBe(1.34375)
    // And x and z, which the join does not move, are the panda's own too.
    expect(w.x).toBeCloseTo(ear.offset[0]!, 6)
    expect(w.z).toBeCloseTo(ear.offset[2]!, 6)
  })

  it('buries four fifths of the ear, which is why it barely breaks the outline', () => {
    const g = build()
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    const ear = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    // 0.245 of its own 0.315 is inside, so only 0.070 stands proud of 1.43125.
    expect(ear.max.y - hull.max.y).toBeCloseTo(0.07, 3)
    // Which means the ears are NOT what makes this animal tall — the tail is.
    const tail = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    expect(tail.max.y).toBeGreaterThan(ear.max.y)
  })
})

describe('animal-kinkajou: the biggest eye the pack ever drew', () => {
  it('takes `plate-14` at its own recorded point, and there is nothing bigger', () => {
    const card = partById('plate-14')!
    const eye = KINKAJOU_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-14')
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // Nothing in the bank's eye family is larger on either axis, so this is the
    // ceiling — and rule 5 makes stretching one unsayable, not merely unwise.
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    for (const p of eyes) {
      expect(p.size[0]).toBeLessThanOrEqual(card.size[0]!)
      expect(p.size[1]).toBeLessThanOrEqual(card.size[1]!)
    }
    expect(eye.stretch).toBeUndefined()
    expect(eye.sink).toBe(0)
    // It was unspent before this species: the biggest pair in the pack going to
    // the animal in the batch whose eyes ARE its character.
    expect(card.size[0]! / partById('plate-01')!.size[0]!).toBeGreaterThan(1.08)
  })
})

describe('animal-kinkajou: the tail is CARRIED, and it is the only one that is', () => {
  it('uses the chamfer idiom, so the point and the turn are solved together', () => {
    const tail = KINKAJOU_ASSEMBLY.features.find(f => f.name === 'tail')!
    // The builder's own solve: `box-36`'s +y/-z edge chamfer midpoint measured
    // off the shell's vertices, NOT the 0.5625 you get by assuming a 1.000-wide
    // face, which §8 says costs a whole row.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[1]).toBeCloseTo(0.80625 + 0.46875, 9)
      expect(tail.placement.at[2]).toBeCloseTo(-0.46875, 9)
    }
    // And the turn that takes `z -1` onto that chamfer's outward normal, baked
    // into the copy's vertices (rule 4 as amended), never a node transform.
    expect(tail.spin).toEqual([{ axis: 'x', deg: 45 }])
    expect(build().getObjectByName('tail')!.quaternion.toArray()).toEqual([0, 0, 0, 1])
    // Sunk the cat's and the monkey's own mean; no stretch anywhere.
    expect(tail.sink).toBeCloseTo(partById('wedge-07')!.attachment!.sunkFractionMean, 9)
    expect(tail.stretch).toBeUndefined()
  })

  it('goes UP rather than back, which is the height and the small keep-out both', () => {
    const g = build()
    const box = new THREE.Box3().setFromObject(g)
    const tail = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    // The tail is the top of the model, at 1.8568.
    expect(box.max.y).toBeCloseTo(tail.max.y, 6)
    expect(box.max.y).toBeCloseTo(1.8568, 3)
    // And it is under the fox's own 1.15, the pack's worst, by a quarter — a
    // tail that rises does not spend keep-out, which `pets.ts` charges from
    // max(width, depth) / 2. The trailing ropes on the opossum and the civet
    // both cost over 1.02.
    const s = box.getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.883, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('is not the fox\'s brush, which would be a plume and would be taller', () => {
    // `box-23` is 1.67x the volume of any other tail, round-sectioned and barely
    // tapering — the squirrel's plume. A kinkajou's tail is a long thin rope.
    expect(KINKAJOU_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    const brush = partById('box-23')!, rope = partById('wedge-07')!
    expect(brush.shape.taper).toBeGreaterThan(0.95)
    expect(rope.shape.taper).toBeLessThan(0.6)
    expect(rope.size[0]! / brush.size[0]!).toBeLessThan(0.3)
  })
})
