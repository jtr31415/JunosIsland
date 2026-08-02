/**
 * The raccoon. Night Time's version of the badger's problem — a marking that IS
 * the animal — with one more mechanism reaching it than the badger had.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a raccoon can say: that `box-36`
 * carries a front-to-back cut the plain cube does not, that the mask is one bar
 * and not two patches, that the nose's overridden sink is a recovery of the
 * fox's own arrangement, and what the marking still cannot reach.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, RACCOON_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-raccoon',
  parts: ['box-01', 'box-02', 'box-22', 'box-23', 'box-36', 'plate-01', 'plate-11', 'tube-06'],
  height: 1.5012,
  verts: 511,
  tris: 658,
  // The brush is the biggest thing after the hull and the hull is 3.17 times it.
  massRatio: 3,
  // The two mask cards are one spun feature — turned from `x +1` onto `z +1`.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-raccoon')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(build().getObjectByName(name)!)

describe('animal-raccoon: `box-36` says the thing `patch` cannot', () => {
  it('is the SAME 1.250 shell as the plain cube, cut FRONT-TO-BACK where that one is not cut at all', () => {
    const panda = partById('box-36')!, plain = partById('box-03')!
    // Same size, same offset — a different colour scheme, not a different body.
    for (let i = 0; i < 3; i++) {
      expect(panda.size[i]).toBeCloseTo(plain.size[i]!, 6)
      expect(panda.offset[i]).toBeCloseTo(plain.offset[i]!, 6)
    }
    // The plain cube has ONE band over all 60 triangles, which is exactly why
    // `animal-badger.ts` records "the front of this hull is pale" as unsayable.
    expect(new Set(plain.bands).size).toBe(1)
    expect(new Set(panda.bands)).toEqual(new Set([3, 15]))

    // And the cut is the one that matters: BOTH flat end planes are band 3
    // entire, so one `byBand` entry paints the whole 0.625 square a face is
    // drawn on. Measured off the triangles whose three corners all lie on the
    // plane, not inferred from a bounding box.
    for (const z of [0.625, -0.625]) {
      let n = 0
      for (let t = 0; t < panda.tris; t++) {
        const vs = [0, 1, 2].map(k => panda.indices[t * 3 + k]!)
        if (!vs.every(vi => Math.abs(panda.positions[vi * 3 + 2]! - z) < 1e-4)) continue
        n += 1
        expect(panda.bands[t], `a face triangle at z=${z} is not band 3`).toBe(3)
      }
      expect(n, `no flat triangles at z=${z}`).toBe(2)
    }
    expect(RACCOON_ASSEMBLY.hull.paint.byBand).toEqual({ 3: 'face' })
  })
})

describe('animal-raccoon: the mask is ONE bar, and every number in it is solved', () => {
  it('meets exactly on the midline, so two cards build one continuous band', () => {
    const card = partById('plate-11')!
    const mask = RACCOON_ASSEMBLY.features.find(f => f.name === 'mask')!
    expect(mask.placement.kind).toBe('pair')
    // x is half the card's OWN width — the one station with no gap and no overlap.
    if (mask.placement.kind === 'pair') {
      expect(mask.placement.at[0]).toBeCloseTo(card.size[2]! / 2, 9)
      expect(mask.placement.at[1]).toBeCloseTo(partById('plate-01')!.offset[1]!, 9)
      // The midpoint of the pack's own 0.010 of card daylight: outside the hull's
      // front face by the same 0.005 the eye card clears the mask by.
      expect(mask.placement.at[2]).toBeCloseTo((HULL_FRONT_Z_USUAL + EYE_CARD_Z) / 2, 9)
      expect(mask.placement.at[2] - HULL_FRONT_Z_USUAL)
        .toBeCloseTo(EYE_CARD_Z - mask.placement.at[2], 9)
    }
    /* Built: one bar, and the two halves touch at x = 0 to 6.5e-6 — which is the
     * bank rounding two ways rather than a gap. Its `size` is 6dp (0.433013) and
     * its `positions` are 4dp (0.2165 either side), so a station solved off the
     * one lands that far from the other. The wolf's tail and the salamander's
     * recover onto their own recorded offsets with the same kind of residue. */
    const r = boxOf('mask-r'), l = boxOf('mask-l')
    expect(r.min.x).toBeCloseTo(0, 4)
    expect(l.max.x).toBeCloseTo(0, 4)
    expect(Math.abs(r.min.x)).toBeLessThan(1e-5)
    expect(r.max.x - l.min.x).toBeCloseTo(card.size[2]! * 2, 4)
    // Zero thickness, and given none: the spin swung it into the x-y plane.
    expect(mask.stretch).toBeUndefined()
    expect(card.size[0]).toBe(0)
    expect(r.max.z - r.min.z).toBeCloseTo(0, 6)
    expect(r.max.y - r.min.y).toBeCloseTo(card.size[1]!, 5)
  })

  it('encloses the eyes in y entire, and stands no further off the hull than Kenney\'s own eye card', () => {
    const eye = boxOf('eye-r'), mask = boxOf('mask-r')
    // The bar runs 0.040177 clear above and below each eye.
    expect(mask.min.y).toBeLessThan(eye.min.y)
    expect(mask.max.y).toBeGreaterThan(eye.max.y)
    // 0.0399 either side, off the two cards' own 4dp half-heights: 0.2000 for
    // the mask against 0.1601 for the eye.
    expect(eye.min.y - mask.min.y).toBeCloseTo(0.0399, 5)
    expect(mask.max.y - eye.max.y).toBeCloseTo(0.0399, 5)
    // But NOT in x: the outer 0.0295 of each eye stands proud of the mask, which
    // is the honest limit of the biggest marking card the pack drew.
    expect(mask.max.x).toBeLessThan(eye.max.x)
    expect(eye.max.x - mask.max.x).toBeCloseTo(0.029494, 5)
    // Both overrun the hull's 0.625-square flat front face onto the chamfer —
    // and the pack's own eye card overruns it FURTHER than the mask does, on
    // sixteen of the twenty-four originals.
    expect(mask.max.x).toBeGreaterThan(0.3125)
    expect(eye.max.x).toBeGreaterThan(mask.max.x)
  })
})

describe('animal-raccoon: the tail is the fox\'s brush on its own merits, and one ring', () => {
  it('takes it for its ROUND section, and paints Kenney\'s own tip cut', () => {
    const brush = partById('box-23')!
    // Round to six decimals — every other tail in the bank is 1.4:1 or worse.
    expect(brush.size[1]).toBeCloseTo(brush.size[2]!, 6)
    expect(brush.shape.taper).toBeCloseTo(0.961469, 6)
    // It is the only THICK tail in the bank Kenney cut in two, which is the whole
    // reason a ring is even half-sayable here.
    for (const id of ['box-38', 'wedge-03']) {
      expect(new Set(partById(id)!.bands).size, `${id} has more than one band`).toBe(1)
    }
    expect(new Set(brush.bands)).toEqual(new Set([5, 7]))
    // Band 5 is the TOP half of the TIP half: the facing is `z -1`, so local -z
    // is the end away from the body. One boundary, wrapping half the tail, where
    // a raccoon has five to seven full rings — which the flag says out loud.
    expect(brush.attachment!.dir).toBe(-1)
    expect(brush.attachment!.axis).toBe('z')
    let ylo = Infinity, zhi = -Infinity
    for (let t = 0; t < brush.tris; t++) {
      if (brush.bands[t] !== 5) continue
      for (let k = 0; k < 3; k++) {
        const vi = brush.indices[t * 3 + k]!
        ylo = Math.min(ylo, brush.positions[vi * 3 + 1]!)
        zhi = Math.max(zhi, brush.positions[vi * 3 + 2]!)
      }
    }
    expect(ylo).toBeGreaterThan(-brush.size[1]! / 2 + 0.4)
    expect(zhi).toBeLessThan(brush.size[2]! / 2 - 0.4)
    const tail = RACCOON_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.paint.byBand).toEqual({ 5: 'mask' })
    // Everything else about it is the pack's: no spin, no stretch, no `at`, its
    // own burial — so its centre recovers the fox's own recorded offset.
    expect(tail.spin).toBeUndefined()
    expect(tail.sink).toBeCloseTo(brush.attachment!.sunkFractionMean, 9)
    expect(build().getObjectByName('tail')!.getWorldPosition(new THREE.Vector3()).z)
      .toBeCloseTo(brush.offset[2]!, 4)
  })
})

describe('animal-raccoon: the nose sink is a RECOVERY, not a fudge', () => {
  it('centres the fox\'s nose-tip on the fox\'s own muzzle plane, and the bank agrees to 3.8e-4', () => {
    const nose = RACCOON_ASSEMBLY.features.find(f => f.name === 'nose')!
    const tip = partById('box-22')!
    // The bank says 0.000, and against the HULL that is true — the fox's nose is
    // entirely outside its hull. Against the MUZZLE it is not the number.
    expect(tip.attachment!.sunkFractionMean).toBe(0)
    expect(nose.sink).toBe(0.5)
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    // Anchored to the muzzle's real placed plane, not to an arithmetic.
    expect((g.getObjectByName('nose')!.userData['joinedAt'] as number[])[2])
      .toBeCloseTo(front, 6)
    // And sunk 0.5, the nose's CENTRE lands on that plane — which is where the
    // bank records the fox's own nose, 3.8e-4 away.
    const at = g.getObjectByName('nose')!.getWorldPosition(new THREE.Vector3())
    expect(at.z).toBeCloseTo(front, 6)
    expect(Math.abs(at.z - tip.offset[2]!)).toBeLessThan(4e-4)
    // Which is worth 0.078 of reach, and is why this animal's footprint is the
    // fox's own rather than 3.4% bigger than it.
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.154, 3)
  })
})
