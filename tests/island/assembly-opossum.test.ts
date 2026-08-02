/**
 * The opossum. Night Time's first, and the collection's first long-tailed
 * climber.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only an opossum can say, and for this
 * animal that is four claims: the ears are the bank's only side-mounted pair and
 * they cost no height, the muzzle recovers the deer's own offset, the tail's
 * height is SOLVED off the hull's flat rear face rather than picked, and the
 * naked-skin slot is spent in four places at once.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, OPOSSUM_ASSEMBLY, HULL_FRONT_Z_USUAL }
  from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-opossum',
  parts: ['box-01', 'box-03', 'box-22', 'box-25', 'plate-01', 'tube-03', 'wedge-07'],
  height: 1.5858,
  verts: 493,
  tris: 734,
  // The dish ear is the biggest thing after the hull and it is a tenth of it.
  massRatio: 10,
  // Nothing on this animal is turned. Said out loud, because rule 4's "no node
  // carries a rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-opossum')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-opossum: the koala\'s dish, and what it costs', () => {
  it('takes the bank\'s only SIDE-mounted ear and recovers the koala\'s own centre', () => {
    const koala = partById('box-25')!
    // Measured `x +1`: every other ear in the bank stands on the top face or
    // points forward. That is what puts this one on the head's SIDE.
    expect(koala.attachment!.axis).toBe('x')
    const ear = OPOSSUM_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(ear.placement.kind).toBe('pair')
    if (ear.placement.kind === 'pair') {
      // x is this cube's own side face. The koala wears this ear on this same
      // 1.250 cube, so the transfer is exact rather than an inference — and y
      // and z, which the join does not move, are the bank's recorded offset.
      expect(ear.placement.at[0]).toBeCloseTo(0.625, 9)
      expect(ear.placement.at[1]).toBeCloseTo(koala.offset[1]!, 9)
      expect(ear.placement.at[2]).toBeCloseTo(koala.offset[2]!, 9)
    }
    expect(ear.sink).toBeCloseTo(koala.attachment!.sunkFractionMean, 9)
  })

  it('costs NO height, so the tallest thing on the animal is the tail', () => {
    const g = build()
    const ears = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    // 1.056956 + 0.371338 = 1.428294, which is 0.003 UNDER the bare cube's own
    // 1.43125. A pair of ears half the width of the body adds nothing upwards.
    expect(ears.max.y).toBeCloseTo(1.4283, 3)
    expect(ears.max.y).toBeLessThan(1.43125)
    const tail = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    expect(tail.max.y).toBeGreaterThan(ears.max.y)
    expect(new THREE.Box3().setFromObject(g).max.y).toBeCloseTo(tail.max.y, 6)
  })

  it('paints the shell as SKIN and the koala\'s own inner disc pink', () => {
    const ear = OPOSSUM_ASSEMBLY.features.find(f => f.name === 'ear')!
    // Kenney's own band-1 cut re-pointed at our slot — §4's first way to
    // two-tone, for no geometry. `animal-mouse.ts` wears the same shape from its
    // COAT; an opossum's ear is bare skin, and that is the whole difference.
    expect(ear.paint).toEqual({ base: 'ear', byBand: { 1: 'naked' } })
    expect(ear.stretch).toBeUndefined()
    expect(new Set(partById('box-25')!.bands)).toContain(1)
  })
})

describe('animal-opossum: the long pale face', () => {
  it('recovers the deer\'s own recorded offset from a join it never used', () => {
    const deer = partById('tube-03')!
    const snout = OPOSSUM_ASSEMBLY.features.find(f => f.name === 'snout')!
    // Joined at the cube's front face, sunk the deer's own measured zero...
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, deer.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBe(0)
    // ...so its centre lands on z = 0.740700 against the bank's recorded
    // 0.740710 — 1.0e-5, which is as close as a solve running through
    // `bank.generated.ts`'s FOUR-decimal positions can get to a six-decimal
    // `size`. That agreement is the evidence: the number was never fed in.
    const world = build().getObjectByName('snout')!.getWorldPosition(new THREE.Vector3())
    expect(world.z).toBeCloseTo(deer.offset[2]!, 4)
    expect(Math.abs(world.z - deer.offset[2]!)).toBeLessThan(2e-5)
    expect(deer.offset[2]).toBeCloseTo(0.74071, 6)
  })

  it('hangs a nose with real reach on the muzzle\'s own front plane, not near it', () => {
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // 0.1557 of depth, twice the bunny's `box-09` at 0.0798, on a nose only
    // 0.046 wider. An opossum's nose is a knob, not a dot.
    expect(partById('box-22')!.size[2]).toBeGreaterThan(partById('box-09')!.size[2]! * 1.9)
    // And it is backed everywhere: 0.229 wide on a 0.532-wide muzzle face, which
    // is why this species wears a muzzle and not `cone-06`'s apex.
    expect(partById('box-22')!.size[0]).toBeLessThan(partById('tube-03')!.size[0]!)
    expect(OPOSSUM_ASSEMBLY.features.some(f => f.part === 'cone-06')).toBe(false)
  })
})

describe('animal-opossum: the naked tail is solved, not placed by eye', () => {
  it('hangs at the lowest 1/16 notch that keeps its root on the flat rear face', () => {
    const cat = partById('wedge-07')!
    const tail = OPOSSUM_ASSEMBLY.features.find(f => f.name === 'tail')!
    // The rope's material near its join face runs local y -0.5233 upward, and
    // `box-03`'s flat rear face bottoms out at 0.80625 - 0.3125 = 0.49375. So
    // the bound is 1.01705 and 17/16 is the next notch above it.
    expect(0.49375 + 0.5233).toBeLessThan(1.0625)
    expect(0.49375 + 0.5233).toBeGreaterThan(1.0)
    if (tail.placement.kind === 'single') expect(tail.placement.at[1]).toBe(1.0625)
    // Below the cat's own carried height and above the mouse's chosen 0.900:
    // a cat holds this shape up, an opossum drags it.
    expect(cat.offset[1]).toBeCloseTo(1.186701, 6)
    expect(1.0625).toBeLessThan(cat.offset[1]!)
    expect(1.0625).toBeGreaterThan(0.9)
    // Everything else about it is the pack's own.
    expect(tail.sink).toBeCloseTo(cat.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
  })

  it('spends the naked-skin slot in four places, and it is the only pale tail', () => {
    // Tail, nose, feet and the inner ear, off one slot — which is the animal:
    // an opossum is a grey coat with four patches of bare pink skin on it.
    const paints = OPOSSUM_ASSEMBLY.features.map(f => f.paint)
    const naked = paints.filter(p => p.base === 'naked' || p.byBand?.[1] === 'naked')
    expect(naked.length).toBe(4)
    const tail = OPOSSUM_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.paint.base).toBe('naked')
    expect(tail.paint.base).not.toBe('coat')
  })
})
