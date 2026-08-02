/**
 * The wolf. Night Time's big grey canid, and the animal that stands next to
 * `animal-fox` wearing the fox's own shell.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a wolf can say, and it is four
 * things: that `box-21` is a cube with two ears fused on top rather than a tall
 * body, that the fox's brush was refused for a measured reason, that the tail is
 * a recovery and not a choice, and that the belly line is 7/16 because 8/16 is
 * wrong on this hull specifically.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, WOLF_ASSEMBLY, HULL_BOTTOM_Y } from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-wolf',
  parts: ['box-01', 'box-21', 'box-32', 'box-38', 'plate-01', 'tube-06'],
  height: 1.6863,
  verts: 433,
  tris: 525,
  // The parrot's fan is the biggest thing after the hull and the hull is 6.41
  // times it by bounding-box volume — twice the generic floor of 3, which is the
  // stronger number this animal supports and so the one it claims.
  massRatio: 6,
  // Nothing on this animal is turned: every part is worn on its own measured
  // facing. Said out loud, because rule 4's check passes vacuously otherwise.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-wolf')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-wolf: `box-21` is a 1.250 cube with TWO EARS fused on top', () => {
  it('has a body that is the standard cube on the standard leg row, and 0.255 of ear above it', () => {
    const fox = partById('box-21')!
    const mid = fox.offset[1]!
    /* WELDED points, and the welding is the point: the exporter splits a vertex
     * at every UV seam, so the shell's 306 referenced indices are 102 distinct
     * positions. §3's own rule of thumb — weld by position before counting. */
    const seen = new Map<string, [number, number, number]>()
    for (const vi of new Set(fox.indices)) {
      const p: [number, number, number] =
        [fox.positions[vi * 3]!, fox.positions[vi * 3 + 1]!, fox.positions[vi * 3 + 2]!]
      seen.set(p.map(n => n.toFixed(4)).join(','), p)
    }
    const pts = [...seen.values()]
    expect(pts).toHaveLength(102)
    // A FULL top face — four corners at the cube's own (+/-0.3125, +/-0.3125) —
    // exists at local y +0.4975, which is 1.250 above the shell's bottom. That is
    // the body, and it ends on the pack's own height floor.
    const top = pts.filter(p => Math.abs(p[1] - 0.4975) < 1e-3)
    expect(top).toHaveLength(4)
    for (const p of top) {
      expect(Math.abs(p[0])).toBeCloseTo(0.3125, 3)
      expect(Math.abs(p[2])).toBeCloseTo(0.3125, 3)
    }
    expect(mid - 0.7525375).toBeCloseTo(HULL_BOTTOM_Y, 4)
    expect(mid + 0.4975).toBeCloseTo(1.43125, 3)

    // Everything above that is TWO lobes, forward on the head, with a gap across
    // the midline and nothing on it — which is what makes them ears and not a
    // taller body. `box-12` is the same finding on the badger, sideways.
    const above = pts.filter(p => p[1] > 0.4975 + 1e-3)
    expect(above.length).toBeGreaterThan(0)
    for (const p of above) {
      expect(Math.abs(p[0]), 'a point on the midline above the body').toBeGreaterThan(0.17)
      expect(p[2], 'an ear lug behind the head').toBeGreaterThan(0.18)
    }
    // And they are the whole of this animal's height.
    expect(new THREE.Box3().setFromObject(build()).max.y).toBeCloseTo(mid + 0.7525375, 3)
  })

  it('wears NO ear part, because a pair on top of those lugs would be four ears', () => {
    // `animal-badger.ts` refused `box-30` on `box-12` for exactly this and wrote
    // it down so nobody added it back. Same refusal, second hull, pinned.
    expect(WOLF_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
    for (const f of WOLF_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `${f.name} wears an ear shape`).not.toContain('ear')
    }
    // The lugs carry Kenney's own inner-ear cut instead: band 5, painted pale for
    // one line and no geometry.
    expect(WOLF_ASSEMBLY.hull.paint.byBand).toEqual({ 5: 'belly' })
    expect(new Set(partById('box-21')!.bands)).toContain(5)
  })
})

describe('animal-wolf: the fox part it takes and the fox part it refuses', () => {
  it('refuses `box-23`, and the taper is the measurement that decides it', () => {
    const brush = partById('box-23')!
    const fan = partById('box-38')!
    // A plume holds its bulk to the tip and a wolf's tail narrows to one. That is
    // the discriminator, and it is 0.12 apart rather than a matter of opinion.
    expect(brush.shape.taper).toBeCloseTo(0.961469, 6)
    expect(fan.shape.taper).toBeCloseTo(0.839147, 6)
    expect(brush.shape.taper).toBeGreaterThan(fan.shape.taper)
    // Round section — y and z identical to six decimals — is the other half of
    // why the brush reads as a fox whatever colour it is painted.
    expect(brush.size[1]).toBeCloseTo(brush.size[2]!, 6)
    expect(WOLF_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    // The fox's nose-tip is refused too, and for a number: `box-32` is bigger on
    // all three axes, and a wolf's nose is the largest thing on its face.
    expect(WOLF_ASSEMBLY.features.some(f => f.part === 'box-22')).toBe(false)
    const wolf = partById('box-32')!, foxNose = partById('box-22')!
    for (let i = 0; i < 3; i++) expect(wolf.size[i]!).toBeGreaterThan(foxNose.size[i]!)
  })

  it('places the parrot\'s fan by the donor transfer alone, and recovers its recorded z', () => {
    const fan = partById('box-38')!
    const tail = WOLF_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.part).toBe('box-38')
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    expect(tail.sink).toBeCloseTo(fan.attachment!.sunkFractionMean, 9)
    // Joined at THIS hull's rear face; the two coordinates the join does not move
    // are the parrot's own recorded offset.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[2]).toBeCloseTo(-0.625, 9)
      expect(tail.placement.at[1]).toBeCloseTo(fan.offset[1]!, 9)
    }
    // And the centre lands back on the bank's recorded z, which was never used to
    // get there. §8: that agreement is the evidence the transfer is legitimate.
    // 1.7e-5, which is as close as a solve running through the bank's 4-decimal
    // POSITIONS can get to its 6-decimal recorded OFFSET. The salamander's tail
    // recovers to 4.8e-6 the same way and for the same reason.
    const at = build().getObjectByName('tail')!.getWorldPosition(new THREE.Vector3())
    expect(at.z).toBeCloseTo(fan.offset[2]!, 4)
    expect(Math.abs(at.z - fan.offset[2]!)).toBeLessThan(2e-5)
    // It works at the parrot's own HEIGHT because this hull's rear face is the
    // same 0.625 square in the same place as the 1.250 cube the parrot wears it
    // on: the buried root sits at world y 0.6437-0.7437, inside 0.4938-1.1188.
    const rear = partById('box-39')!
    expect(rear.offset[1]! + 0.3125).toBeCloseTo(partById('box-21')!.offset[1]! + 0.185, 3)
    expect(rear.offset[1]! - 0.3125).toBeCloseTo(partById('box-21')!.offset[1]! - 0.44, 3)
  })
})

describe('animal-wolf: 7/16, because 8/16 is wrong on a hull that is part ear', () => {
  it('puts the painted line inside the tiger\'s zone measured against the BODY, not the shell', () => {
    expect(WOLF_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.4375 })
    const shell = partById('box-21')!.size[1]!
    // `patch` takes its fraction of the part's OWN height, and this shell's
    // height includes 0.255 of ear. Read against the 1.250 body cube instead,
    // §7's measured mammal zone is 0.4808-0.5481 and only 7/16 lands in it.
    const asBody = (k: number): number =>
      (HULL_BOTTOM_Y + (k / 16) * shell - HULL_BOTTOM_Y) / 1.25
    expect(asBody(8)).toBeGreaterThan(0.5481)
    expect(asBody(6)).toBeLessThan(0.4808)
    expect(asBody(7)).toBeGreaterThan(0.4808)
    expect(asBody(7)).toBeLessThan(0.5481)
    // Kenney's own chest patch needs no override: all six of band 3's triangles
    // are below that line already, so the patch paints them for free.
    expect(WOLF_ASSEMBLY.hull.paint.byBand?.[3]).toBeUndefined()
    const fox = partById('box-21')!
    let hi = -Infinity
    for (let t = 0; t < fox.tris; t++) {
      if (fox.bands[t] !== 3) continue
      for (let k = 0; k < 3; k++) {
        const y = fox.positions[fox.indices[t * 3 + k]! * 3 + 1]!
        if (y > hi) hi = y
      }
    }
    expect(fox.offset[1]! + hi).toBeLessThan(HULL_BOTTOM_Y + 0.4375 * shell)
  })

  it('stands wide but not sprawled, and the crocodile\'s exact limit is refused', () => {
    const leg = WOLF_ASSEMBLY.features.find(f => f.name === 'leg')!
    if (leg.placement.kind === 'row') {
      // 6/16 on the pack's own grid. `box-01` is 0.375 across, so the outer face
      // lands at 0.5625 — one sixteenth inside the hull's own side at 0.625.
      expect(leg.placement.from[0]).toBe(0.375)
      expect(leg.placement.from[0] + partById('box-01')!.size[0]! / 2).toBeCloseTo(0.5625, 6)
      expect(leg.placement.from[0]).toBeLessThan(0.4375)
      // The wheelbase is the builder's own: one dial moved, for one reason.
      expect(leg.placement.from[2]).toBeCloseTo(0.25, 6)
    }
  })
})
