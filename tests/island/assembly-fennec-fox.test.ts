/**
 * The fennec fox. The ear animal, and the one species `box-06` was waiting for.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a fennec can say, and the first
 * of it is the only claim that really matters: the ear transfer is a RECOVERY,
 * and the height it produces clears the pack's ceiling by 0.0100.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, FENNEC_FOX_ASSEMBLY, PACK_HEIGHT_MAX, HULL_FRONT_Z_USUAL,
} from '../../src/island/species/parts'
import { partById, PARTS_BANK } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-fennec-fox',
  parts: ['box-01', 'box-03', 'box-06', 'box-22', 'box-23', 'plate-14', 'tube-01'],
  height: 2.01,
  verts: 517,
  tris: 611,
  // The brush is the biggest thing after the hull, at 3.17 times smaller.
  massRatio: 3,
  // Nothing on this animal is turned — every part is worn on its own measured
  // facing. Said out loud, because rule 4's check passes vacuously otherwise.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-fennec-fox')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-fennec-fox: the ear transfer is a recovery, and it is exact', () => {
  it('lands the bunny\'s ear on the bunny\'s own recorded centre, to one part in a million', () => {
    const ear = partById('box-06')!
    const f = FENNEC_FOX_ASSEMBLY.features.find(x => x.name === 'ear')!
    expect(f.part).toBe('box-06')
    // The bunny wears it on THIS cube, so the join is on the same shell the bank
    // recorded it from — a recovery rather than a carry-over.
    expect(ear.provenance.map(p => p.species)).toEqual(['bunny'])
    expect(ear.attachment!.axis).toBe('y')
    expect(ear.attachment!.dir).toBe(1)
    expect(f.placement.kind).toBe('pair')
    if (f.placement.kind === 'pair') {
      // y: the cube's own top face. x and z: untouched by the join, so they are
      // the bank's recorded offset.
      expect(f.placement.at[1]).toBeCloseTo(1.43125, 9)
      expect(f.placement.at[0]).toBeCloseTo(ear.offset[0]!, 9)
      expect(f.placement.at[2]).toBeCloseTo(ear.offset[2]!, 9)
    }
    expect(f.sink).toBeCloseTo(ear.attachment!.sunkFractionMean, 9)
    expect(ear.attachment!.sunkFractionMin).toBe(ear.attachment!.sunkFractionMax)

    // Solve it here, independently, and check the answer against a number the
    // solve never used. 1.553395 against a recorded 1.553396.
    const extent = ear.size[1]!
    const centre = 1.43125 + (extent / 2 - ear.attachment!.sunkFractionMean * extent)
    expect(centre).toBeCloseTo(ear.offset[1]!, 5)
    expect(Math.abs(centre - ear.offset[1]!)).toBeLessThan(2e-6)
    /* And the built ear is actually there — to 4.3e-5 rather than 1e-6, because
     * the BUILD reads the bank's 4dp `positions` where the solve above reads its
     * 6dp `size`. The two roundings are the residue, not the placement. */
    const built = build().getObjectByName('ear-r')!.getWorldPosition(new THREE.Vector3())
    expect(built.y).toBeCloseTo(ear.offset[1]!, 4)
    // Still embedded, by 0.334504 — §3, nothing floats, and 2.7x the pack's floor.
    expect((f.sink ?? 0) * extent).toBeGreaterThan(0.125)
  })

  it('is the TALLEST ear in the bank, and the only one with no cut in it', () => {
    const mine = partById('box-06')!
    // Measured over every shape the pack put to the `ear` role, not over a list
    // somebody typed: nothing in the family is taller.
    const family = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(family.length).toBeGreaterThan(15)
    for (const o of family) {
      if (o.id === 'box-06' || o.id === 'box-07') continue
      expect(mine.size[1]!, `${o.id} is at least as tall as box-06`)
        .toBeGreaterThan(o.size[1]!)
    }
    // And it is more than double every ear the pack stands UPRIGHT on a head.
    // The one exception is the koala's `box-25`, which is 0.7427 — and it is not
    // an upright ear at all, it is the bank's only SIDE-mounted dish (`x +1`).
    for (const o of family) {
      if (o.attachment!.axis !== 'y' || o.id.startsWith('box-0') && o.size[1]! > 0.9) continue
      expect(mine.size[1]!, `${o.id} is over half box-06's height`)
        .toBeGreaterThan(o.size[1]! * 2)
    }
    expect(partById('box-25')!.attachment!.axis).toBe('x')
    // And it has exactly ONE band, where the two that carry Kenney's own
    // inner-ear cut are both under half its height. So the ear is one colour,
    // and that is a measurement rather than a taste.
    expect(new Set(mine.bands).size).toBe(1)
    expect(new Set(partById('box-02')!.bands).size).toBe(2)
    expect(new Set(partById('wedge-16')!.bands).size).toBe(2)
    const f = FENNEC_FOX_ASSEMBLY.features.find(x => x.name === 'ear')!
    expect(f.paint).toEqual({ base: 'belly' })
    expect(f.stretch).toBeUndefined()
  })
})

describe('animal-fennec-fox: the height, and the rule that follows from it', () => {
  it('stands 2.0100 against the pack\'s 2.02, and the ear is the whole of it', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    expect(whole.max.y - whole.min.y).toBeCloseTo(2.0100, 4)
    expect(PACK_HEIGHT_MAX - (whole.max.y - whole.min.y)).toBeCloseTo(0.0100, 4)
    // The ear's crown IS the animal's crown, and everything else is well under
    // it: the hull tops out on the pack's own height FLOOR and the eye at 1.141.
    const ear = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    expect(ear.max.y).toBeCloseTo(whole.max.y, 6)
    expect(new THREE.Box3().setFromObject(g.getObjectByName('hull')!).max.y)
      .toBeCloseTo(1.43125, 4)
    expect(new THREE.Box3().setFromObject(g.getObjectByName('eye-r')!).max.y)
      .toBeLessThan(1.15)
  })

  it('lets the tail TRAIL, because carrying it up would put two things in the ceiling', () => {
    const brush = partById('box-23')!
    const tail = FENNEC_FOX_ASSEMBLY.features.find(f => f.name === 'tail')!
    // No chamfer, no spin, no `at` — the squirrel's raised placement alone
    // reaches 1.976 on a hull with no ears on it.
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    expect(tail.sink).toBeCloseTo(brush.attachment!.sunkFractionMean, 9)
    if (tail.placement.kind === 'single') expect(tail.placement.at[2]).toBeCloseTo(-0.625, 9)
    const g = build()
    // Its centre recovers the fox's own recorded z, and its top clears the ear
    // by a wide margin.
    expect(g.getObjectByName('tail')!.getWorldPosition(new THREE.Vector3()).z)
      .toBeCloseTo(brush.offset[2]!, 4)
    expect(new THREE.Box3().setFromObject(g.getObjectByName('tail')!).max.y)
      .toBeLessThan(1.4)
    // Kenney's own tip cut, painted dark: the black tip, free.
    expect(tail.paint.byBand).toEqual({ 5: 'mark' })
  })
})

describe('animal-fennec-fox: `plate-14` is the pack\'s biggest eye and its bands are INVERTED', () => {
  it('sends the whole card to the pupil and leaves band 3 as an off-centre glint', () => {
    const big = partById('plate-14')!, usual = partById('plate-01')!
    // Biggest in the pack, on both axes, and unstretchable by construction.
    expect(big.size[0]!).toBeGreaterThan(usual.size[0]!)
    expect(big.size[1]!).toBeGreaterThan(usual.size[1]!)
    const eye = FENNEC_FOX_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-14')
    expect(eye.stretch).toBeUndefined()
    expect(eye.sink).toBe(0)

    // The find: on the default card band 15 is the small pupil and band 3 the
    // sclera around it. On the panda's it is the other way round — band 15 is
    // the larger region AND it spans the whole card. The builder always paints
    // band 15 `PACK_PUPIL`, so this reads as a nearly all-dark eye.
    const count = (p: typeof big, b: number): number =>
      p.bands.reduce((n, v) => n + (v === b ? 1 : 0), 0)
    expect(count(usual, 15)).toBeLessThan(count(usual, 3))
    expect(count(big, 15)).toBeGreaterThan(count(big, 3))
    expect(count(big, 15)).toBe(40)
    const span = (p: typeof big, b: number, a: 0 | 1): number => {
      let lo = Infinity, hi = -Infinity
      for (let t = 0; t < p.tris; t++) {
        if (p.bands[t] !== b) continue
        for (let k = 0; k < 3; k++) {
          const v = p.positions[p.indices[t * 3 + k]! * 3 + a]!
          lo = Math.min(lo, v); hi = Math.max(hi, v)
        }
      }
      return hi - lo
    }
    // Band 15 covers the card's full extent; band 3 is a patch inside it.
    expect(span(big, 15, 0)).toBeCloseTo(big.size[0]!, 3)
    expect(span(big, 15, 1)).toBeCloseTo(big.size[1]!, 3)
    expect(span(big, 3, 0)).toBeLessThan(big.size[0]! * 0.65)
    expect(eye.paint.byBand?.[15]).toBe('pupil')
  })
})

describe('animal-fennec-fox: the face is the bank\'s smallest muzzle', () => {
  it('takes `tube-01` over the fox\'s own `tube-06`, and recovers the beaver\'s centre', () => {
    const small = partById('tube-01')!, foxes = partById('tube-06')!
    // A fennec is a fox at kitten scale and the muzzle is the only part that can
    // say so, since the hull is the standard cube and always will be.
    expect(small.size[0]!).toBeLessThan(foxes.size[0]! * 0.6)
    const snout = FENNEC_FOX_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, small.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBe(0)
    const g = build()
    expect(g.getObjectByName('snout')!.getWorldPosition(new THREE.Vector3()).z)
      .toBeCloseTo(small.offset[2]!, 5)
    // The nose is centred on the muzzle's real placed plane — the fox's own
    // arrangement, derived in `animal-raccoon.ts` — which is what keeps this
    // animal's footprint UNDER the fox's while wearing the fox's own tail.
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    expect(nose.getWorldPosition(new THREE.Vector3()).z).toBeCloseTo(front, 6)
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.124, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
