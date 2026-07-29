/**
 * The mouse. Garden's third, and the first species built from a DEFINITION.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a mouse can say.
 *
 * Which, for this animal, is mostly one claim: **every number in it came from the
 * pack, and exactly one did not.**
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, MOUSE_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-mouse',
  parts: ['box-01', 'box-03', 'box-09', 'box-25', 'plate-01', 'tube-01', 'wedge-07'],
  height: 1.4312,
  verts: 488,
  tris: 732,
  // The dish ear is the biggest thing after the hull and it is a tenth of it.
  massRatio: 10,
  // Nothing on this animal is turned. Said out loud, because rule 4's "no node
  // carries a rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-mouse')
  g.updateMatrixWorld(true)
  return g
}
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

describe('animal-mouse: the koala\'s dish ear, on the koala\'s own numbers', () => {
  it('is the bank\'s only SIDE-mounted ear, and that is what separates it from the shrew', () => {
    const koala = partById('box-25')!
    // Measured `x +1`, not `y +1` — every other ear in the bank stands on the top
    // face or points forward. This one hangs off the head's side, which is why the
    // donor transfer joins it at the hull's SIDE face rather than its top.
    expect(koala.attachment!.axis).toBe('x')
    expect(koala.attachment!.dir).toBe(1)
    // 0.743 across: nothing else in the bank is half this size.
    expect(koala.size[0]).toBeCloseTo(0.742676, 6)
  })

  it('joins the ear at THIS hull\'s side face and recovers the koala\'s own centre', () => {
    const koala = partById('box-25')!
    const ear = MOUSE_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(ear.placement.kind).toBe('pair')
    if (ear.placement.kind === 'pair') {
      // x: the cube's own side face. The koala wears this ear on this same
      // 1.250 cube, so the transfer is exact rather than an inference.
      expect(ear.placement.at[0]).toBeCloseTo(0.625, 9)
      // y and z: untouched by the join, so they are the bank's recorded offset.
      expect(ear.placement.at[1]).toBeCloseTo(koala.offset[1]!, 9)
      expect(ear.placement.at[2]).toBeCloseTo(koala.offset[2]!, 9)
    }
    // Sunk the koala's own measured burial, and the pack gave exactly one value.
    expect(ear.sink).toBeCloseTo(koala.attachment!.sunkFractionMean, 9)
    expect(koala.attachment!.sunkFractionMin).toBe(koala.attachment!.sunkFractionMax)
    // And it is still EMBEDDED — §3, nothing floats. 0.53 of 0.743 is 0.396,
    // three times the pack's own 0.125 floor.
    const g = build()
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    const ears = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    expect(ears.min.x).toBeLessThan(hull.max.x - 0.125)
  })

  it('paints the inner disc from the ear\'s OWN band, so two-tone costs no geometry', () => {
    const ear = MOUSE_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(ear.paint.byBand).toEqual({ 1: 'inner' })
    expect(ear.stretch).toBeUndefined()
    // Band 1 exists on the shape; this is Kenney's own split, re-pointed at our
    // slot rather than approximated.
    expect(new Set(partById('box-25')!.bands)).toContain(1)
  })
})

describe('animal-mouse: the tail is the one number this species chose', () => {
  it('carries the cat\'s whip LOW, and says so', () => {
    const cat = partById('wedge-07')!
    const tail = MOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.part).toBe('wedge-07')
    // The donor's own recorded height is 1.1867 and this is 0.90 — the only
    // hand-placed coordinate in the file. A mouse's tail trails; a cat's is
    // carried up, and at the cat's height this animal reads as a cat.
    expect(cat.offset[1]).toBeCloseTo(1.186701, 6)
    if (tail.placement.kind === 'single') expect(tail.placement.at[1]).toBe(0.9)
    // Everything else about it is the pack's: its own measured mean burial, over
    // its two donors, and no spin at all.
    expect(tail.sink).toBeCloseTo(cat.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
  })

  it('is the whole reason the animal is no taller than a bare cube', () => {
    const box = new THREE.Box3().setFromObject(build())
    // 1.43125 is the bare 1.250 cube on standard legs. Nothing the mouse wears
    // stands above its own back — the ears are side-mounted and the tail trails —
    // so it sits on the pack's height FLOOR with 0.0012 to spare.
    expect(box.max.y - box.min.y).toBeCloseTo(1.4312, 4)
  })
})

describe('animal-mouse: the face is three donor transfers and no arithmetic', () => {
  it('joins the beaver\'s muzzle at the cube\'s front face, at the beaver\'s own height', () => {
    const beaver = partById('tube-01')!
    const snout = MOUSE_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, beaver.offset[1], HULL_FRONT_Z_USUAL],
    })
    // Sunk 0.000 — the beaver did not bury it, so neither does this.
    expect(snout.sink).toBe(0)
    // Its centre therefore lands on the beaver's own recorded z, to six decimals.
    expect(world(build(), 'snout').z).toBeCloseTo(beaver.offset[2]!, 5)
  })

  it('hangs the nose on the snout\'s own front plane, not near it', () => {
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // A BUTTON, deliberately. `wedge-10` is measurably the better nose tip on
    // every axis the classification has and reads as a tongue — Joe rejected it
    // by name on the hedgehog, and the lesson is not the hedgehog's alone.
    expect(MOUSE_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(partById('box-09')!.roles).toContain('nose')
  })

  it('takes the eye card entire from the pack, because the definition cannot say otherwise', () => {
    const card = partById('plate-01')!
    const eye = MOUSE_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
  })
})

describe('animal-mouse: what a definition did NOT have to say', () => {
  it('never mentions its hull, its legs or its eye plane, and gets the pack\'s own', () => {
    // The three things Joe called "given". They are in the built animal and they
    // are not in the file: `defineCreature` supplies them.
    expect(MOUSE_ASSEMBLY.hull.part).toBe('box-03')
    expect(MOUSE_ASSEMBLY.hull.at).toEqual([0, 0.80625, 0])
    expect(MOUSE_ASSEMBLY.hull.stretch).toBeUndefined()
    const leg = MOUSE_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') expect(leg.placement.from[1]).toBe(LEG_ROW.y)
  })

  it('paints its belly at the pack\'s own mammal line and adds no geometry for it', () => {
    expect(MOUSE_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    // Same 32 welded points as an unpatched cube; only the seam splits.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })

  it('strains nothing, so it carries no flag', () => {
    expect(MOUSE_ASSEMBLY.flag).toBeUndefined()
  })

  it('fits between two trees — keep-out is the ears, and it is under the fox\'s', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The dish ears
    // and the trailing whip make this the widest Garden animal so far at 0.98,
    // and it is still inside the fox's own 1.15 — which is the pack's worst and
    // the number the island already copes with.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.984, 2)
  })
})
