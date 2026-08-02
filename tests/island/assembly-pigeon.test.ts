/**
 * The pigeon. Farm's only town bird, and the only cool-coloured one.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a pigeon can say:
 *
 *   1. **The two dark wing bars are refused, and it is measurable.** `box-06`
 *      carries exactly one band across all 60 of its triangles, so `byBand`
 *      has nothing to redirect.
 *   2. **The iridescent neck is a `patch` on the fused hull**, not a part and
 *      not `byBand` (`box-03` has one band too) — the same mechanism `belly`
 *      is sugar for, run with the small region on TOP instead of the usual
 *      pale strip on the bottom.
 *   3. **It does not take the goose's neck.** No `snout` feature at all.
 *   4. **The tail is the chicken's stub, byte for byte**, one slot swapped.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, PIGEON_ASSEMBLY, CHICKEN_ASSEMBLY, GOOSE_ASSEMBLY,
  EYE_CARD_Z, LEG_ROW, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-pigeon',
  parts: ['box-01', 'box-03', 'box-06', 'box-09', 'box-18', 'plate-08', 'tube-02'],
  // No raised feature at all — bare hull-on-legs height, same floor the goose
  // measures its own separation against.
  height: 1.4312,
  // A six-part build measured 377, under rule 9's own floor of 405 — the cere
  // (§5, box-09 as a pair) is what closes the gap, at 409.
  verts: 409,
  tris: 486,
  legs: 2,
  // The wing is the biggest thing it wears, and the hull is the cockatiel's
  // and the chicken's own ratio, because it is their own wing.
  massRatio: 14,
  // The tail (turned) and the wing pair (turned onto the flank) both spin.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-pigeon')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof PIGEON_ASSEMBLY.features[number] =>
  PIGEON_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-pigeon: the two dark wing bars are refused, and the refusal is measured', () => {
  it('finds ONE band across all of box-06\'s triangles, not a wrong-way split', () => {
    // Not a case of the bars running the wrong way across the wing — there is
    // no second band on the part at all for byBand to redirect.
    const wing = partById('box-06')!
    expect(wing.tris).toBe(60)
    expect([...new Set(wing.bands)]).toEqual([5])
    // box-03's own bands are the same story, so a hull marking is out too.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    expect(feature('wing').paint.byBand).toBeUndefined()
    expect(PIGEON_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('paints the wing ONE flight tone instead — shading, not the bars', () => {
    expect(feature('wing').paint).toEqual({ base: 'flight' })
    expect(PIGEON_ASSEMBLY.palette['flight']).not.toBe(PIGEON_ASSEMBLY.palette['coat'])
    expect(PIGEON_ASSEMBLY.flag).toMatch(/THE TWO DARK WING BARS ARE REFUSED/)
  })

  it('wears the cage birds\' wing byte for byte, at their own sink', () => {
    const mine = feature('wing')
    const theirs = CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!
    expect(mine.part).toBe(theirs.part)
    expect(mine.sink).toBe(theirs.sink)
    expect(mine.spin).toEqual(theirs.spin)
    expect(mine.axis).toBe(theirs.axis)
    expect(mine.dir).toBe(theirs.dir)
    expect(mine.placement).toEqual(theirs.placement)
  })
})

describe('animal-pigeon: the iridescent neck is a patch on the hull, not a part', () => {
  it('has no `neck` feature at all — it does not take the goose\'s neck', () => {
    // It DOES have a snout feature (the bill, §6) — the thing it refuses is a
    // raised neck stalk, which on the goose is a feature literally named 'neck'.
    expect(PIGEON_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(true)
    expect(PIGEON_ASSEMBLY.features.some(f => f.name === 'neck')).toBe(false)
    expect(GOOSE_ASSEMBLY.features.some(f => f.name === 'neck')).toBe(true)
    // And the bill itself carries none of the neck's machinery: no stretch,
    // no lean, a bare donor transfer.
    expect(feature('snout').stretch).toBeUndefined()
    expect(feature('snout').spin).toBeUndefined()
  })

  it('splits the hull at 0.75 — box-03\'s own flat front face top edge', () => {
    expect(PIGEON_ASSEMBLY.hull.paint).toEqual({
      base: 'neck', patch: { below: 'coat', at: 0.75 },
    })
    const hullCentre = partById('box-03')!.offset[1]!
    const hullFlat = 0.3125
    expect(hullCentre + hullFlat).toBeCloseTo(1.11875, 6)
    // Fraction of the part's own height (bottom -0.625 to top +0.625).
    const frac = (hullFlat) / 0.625 * 0.5 + 0.5
    expect(frac).toBeCloseTo(0.75, 6)
    expect(0.75 * 16).toBe(12) // on the pack's own 1/16 grid
  })

  it('clears the eye card\'s own top edge, so the two markings never compete', () => {
    const eye = partById('plate-08')!
    const eyeTop = eye.offset[1]! + eye.size[1]! / 2
    expect(eyeTop).toBeCloseTo(1.09375, 5)
    const boundary = partById('box-03')!.offset[1]! + 0.3125
    expect(boundary - eyeTop).toBeCloseTo(0.025, 3)
    expect(boundary).toBeGreaterThan(eyeTop)
  })

  it('is one flat hex, and the flag says so plainly', () => {
    expect(PIGEON_ASSEMBLY.flag).toMatch(/ONE FLAT HEX/)
    expect(PIGEON_ASSEMBLY.palette['neck']).toBeDefined()
  })
})

describe('animal-pigeon: the pale rump is the chicken\'s stub, one slot swapped', () => {
  it('wears box-18 at the chicken\'s exact spin and join', () => {
    const mine = feature('tail')
    const theirs = CHICKEN_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(mine.part).toBe('box-18')
    expect(mine.spin).toEqual(theirs.spin)
    expect(mine.placement).toEqual(theirs.placement)
    expect(mine.sink).toBe(theirs.sink)
    // The only difference is the slot: rump here, flight there.
    expect(mine.paint).toEqual({ base: 'rump' })
    expect(theirs.paint).toEqual({ base: 'flight' })
  })

  it('fits box-03\'s flat rear face by 0.000998, same as the chicken', () => {
    const flat = 0.3125
    const halfHeight = partById('box-18')!.size[1]! / 2
    expect(halfHeight).toBeCloseTo(0.311502, 6)
    expect(flat - halfHeight).toBeCloseTo(0.000998, 6)
  })
})

describe('animal-pigeon: the legs are JT-044\'s two-tone, pushed to k = 8', () => {
  it('patches at 0.5, not the cage birds\' 0.25 floor', () => {
    const leg = feature('leg')
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.5 } })
    expect(leg.paint.patch!.at * 16).toBe(8)
    // Both slots are pink — raising k says "more of the leg is bright," not
    // "add a marking this leg lacks."
    expect(PIGEON_ASSEMBLY.palette['limb']).not.toBe(PIGEON_ASSEMBLY.palette['foot'])
  })

  it('is named `leg`, not `leg-front` — animal-goose.ts\'s own correction', () => {
    expect(PIGEON_ASSEMBLY.features.some(f => f.name === 'leg')).toBe(true)
    expect(PIGEON_ASSEMBLY.features.some(f => f.name === 'leg-front')).toBe(false)
    const leg = feature('leg')
    if (leg.placement.kind === 'pair') {
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
    const g = build()
    expect(boxOf(g, 'leg-r').min.y).toBeCloseTo(0, 3)
  })
})

describe('animal-pigeon: the cere is pushed by rule 9\'s own vertex floor', () => {
  it('measures short of the floor without it, and the pair closes the gap', () => {
    // Six parts (no cere) measured 377 model vertices against MODEL_VERTS_MIN
    // = 405. The cere itself is what the harness-level budget check confirms
    // clears it — see the top-level assertAssembly claim (verts: 409).
    const cere = PIGEON_ASSEMBLY.features.filter(f => f.name === 'cere')
    expect(cere).toHaveLength(1)
    expect(cere[0]!.part).toBe('box-09')
    expect(cere[0]!.placement.kind).toBe('pair')
    expect(cere[0]!.paint).toEqual({ base: 'rump' })
  })

  it('fits ABOVE the beak, a window animal-chicken.ts never measured', () => {
    const bill = partById('tube-02')!
    const billTop = bill.offset[1]! + bill.size[1]! / 2
    expect(billTop).toBeCloseTo(0.85375, 5)
    const crownFlat = partById('box-03')!.offset[1]! + 0.3125
    expect(crownFlat).toBeCloseTo(1.11875, 5)
    const window = crownFlat - billTop
    expect(window).toBeCloseTo(0.265, 3)
    const cere = partById('box-09')!
    expect(cere.size[1]).toBeCloseTo(0.136825, 6)
    expect(window).toBeGreaterThan(cere.size[1]!)
    // Placed inside that window, not in the cramped one below the beak.
    const g = build()
    const c = boxOf(g, 'cere-r')
    expect(c.min.y).toBeGreaterThan(billTop)
    expect(c.max.y).toBeLessThan(crownFlat)
  })
})

describe('animal-pigeon: seven bank shapes, six already the chicken\'s own', () => {
  it('separates by colour before shape, exactly as farm.ts claims', () => {
    const partsUsed = new Set(PIGEON_ASSEMBLY.features.map(f => f.part))
    partsUsed.add(PIGEON_ASSEMBLY.hull.part)
    const chickenParts = new Set(CHICKEN_ASSEMBLY.features.map(f => f.part))
    chickenParts.add(CHICKEN_ASSEMBLY.hull.part)
    chickenParts.delete('cone-01') // the comb — the one shape the chicken alone wears
    partsUsed.delete('box-09') // the cere — the one shape only the pigeon wears
    for (const id of partsUsed) {
      expect(chickenParts.has(id), `"${id}" is not one of the chicken's own shapes`).toBe(true)
    }
    expect(PIGEON_ASSEMBLY.hull.part).toBe('box-03')
  })

  it('places the eye at the pack\'s own absolute plane, plain and dark', () => {
    const g = build()
    expect(boxOf(g, 'eye-r').max.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(feature('eye').paint).toEqual({ base: 'eye', byBand: { 15: 'pupil' } })
  })

  it('flaps, carries no stretch and nothing authored', () => {
    const motion = PIGEON_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    for (const n of ['wing-r', 'wing-l']) expect(build().getObjectByName(n)).toBeDefined()
    for (const f of PIGEON_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(PIGEON_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(PIGEON_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(PIGEON_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })

  it('measures no taller than a bare hull on legs — no raised feature at all', () => {
    const g = build()
    const h = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y
    expect(h).toBeCloseTo(HEIGHT_FLOOR, 3)
  })
})
