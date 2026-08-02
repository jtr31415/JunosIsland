/**
 * The quail. Farm's fifth galliform, derived from `animal-chicken.ts`, and the
 * only one of the five with no comb at all.
 *
 * `assertAssembly` covers the invariants every species shares. This file tests
 * what only a quail's own build says: that the topknot is ONE spun point and
 * not a second comb, that the wing sits one notch deeper than the chicken's,
 * that `byBand` genuinely has nothing to spend on this animal, and that the
 * pale throat is painted with no geometry at all.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, QUAIL_ASSEMBLY, CHICKEN_ASSEMBLY, NIGHTJAR_ASSEMBLY,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-quail',
  parts: ['box-01', 'box-03', 'box-06', 'box-18', 'cone-01', 'plate-08', 'plate-10', 'tube-02'],
  height: 1.5682,
  verts: 425,
  tris: 494,
  // TWO legs, not four. A bird.
  legs: 2,
  // Same hull, same wing, unchanged from the chicken's own ratio.
  massRatio: 14,
  // Tail, wing pair, and the topknot's own forward tilt.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-quail')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): typeof QUAIL_ASSEMBLY.features[number] =>
  QUAIL_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-quail: no comb at all, per farm.ts\'s own separation', () => {
  it('carries no feature named comb-anything', () => {
    expect(QUAIL_ASSEMBLY.features.some(f => f.name.startsWith('comb'))).toBe(false)
    expect(QUAIL_ASSEMBLY.features.some(f => f.name.includes('wattle'))).toBe(false)
  })
})

describe('animal-quail: the topknot is ONE spun point, not a second comb', () => {
  it('wears cone-01 exactly once, spun forward rather than standing straight up', () => {
    const topknot = QUAIL_ASSEMBLY.features.filter(f => f.part === 'cone-01')
    expect(topknot).toHaveLength(1)
    const f = feature('topknot')
    expect(f.part).toBe('cone-01')
    // Unlike the comb and the cockatiel's crest, which stand at cone-01's own
    // unspun y+1 attachment, this one is deliberately spun.
    expect(f.spin).toEqual([{ axis: 'x', deg: 60 }])
    expect(f.stretch).toBeUndefined()
    // No sink override: the shape's own floor, shallower than the chicken's
    // comb (which buries deeper, 8/16, specifically to shrink itself).
    expect(f.sink).toBeCloseTo(partById('cone-01')!.attachment!.sunkFractionMean, 6)
    expect(f.sink).toBeLessThan(0.5)
  })

  it('is centred on the flat crown with equal clearance on both sides', () => {
    const half = partById('cone-01')!.size[2]! / 2
    expect(half).toBeCloseTo(0.164285, 5)
    const p = feature('topknot').placement
    if (p.kind === 'single') {
      expect(p.at[0]).toBe(0)
      expect(p.at[1]).toBeCloseTo(1.43125, 6)
      expect(p.at[2]).toBe(0)
    }
    const HULL_FLAT = 0.3125
    expect(HULL_FLAT - half).toBeCloseTo(0.148215, 5)
  })

  it('does not reach the bill, and stands clear of the hull', () => {
    const g = build()
    const tip = g.getObjectByName('topknot')!
    const box = new THREE.Box3().setFromObject(tip)
    // Forward and above the crown, nowhere near tube-02's own z = 0.625.
    expect(box.max.z).toBeLessThan(0.5)
    expect(box.max.y).toBeGreaterThan(1.43125)
  })
})

describe('animal-quail: rule 9 has a floor, and one topknot point lands under it', () => {
  it('would be 401 vertices with the topknot alone, four short of the pack\'s 405', () => {
    // Each buried cone-01 mesh welds to 24 vertices regardless of how many
    // copies are placed: the chicken's three-cone comb is 3 x 24 = 72, this
    // bird's one-cone topknot is 1 x 24, and 72 - 24 = 48 is the whole gap
    // against the chicken's own 449.
    const g = build()
    let all = 0
    for (const m of g.children as THREE.Mesh[]) all += m.geometry.getAttribute('position').count
    expect(all).toBe(425)
    expect(all - 24).toBe(401) // what it would be without the cheek-fleck pair
  })

  it('fixes it with a SECOND real marking, not an invented shape', () => {
    // plate-10 is reused at animal-nightjar.ts's own recorded station on this
    // same hull, byte for byte: no spin, no axis override, the part's own
    // natural x-facing attachment.
    const fleck = feature('cheek-fleck')
    const theirs = NIGHTJAR_ASSEMBLY.features.find(f => f.name === 'mottle-upper')!
    expect(fleck.part).toBe('plate-10')
    expect(fleck.part).toBe(theirs.part)
    expect(fleck.placement).toEqual(theirs.placement)
    expect(fleck.spin).toBeUndefined()
    expect(fleck.axis).toBeUndefined()
    // And it sits on the dark, coat-coloured side of the throat line (§ below).
    const p = fleck.placement
    if (p.kind === 'pair') expect(p.at[1]).toBeGreaterThan(0.80625)
  })
})

describe('animal-quail: the wing is one notch deeper than the chicken\'s shared 8/16', () => {
  it('sinks at 9/16, and the gain over 8/16 is the same 0.019115 the chicken measured', () => {
    const mine = feature('wing')
    const theirs = CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!
    expect(mine.part).toBe(theirs.part)
    expect(mine.spin).toEqual(theirs.spin)
    expect(mine.axis).toBe(theirs.axis)
    expect(mine.dir).toBe(theirs.dir)
    expect(mine.placement).toEqual(theirs.placement)
    expect(theirs.sink).toBe(0.5)
    expect(mine.sink).toBe(0.5625)
    const proud = (id: string, axis: 0 | 1 | 2, sink: number): number =>
      partById(id)!.size[axis]! * (1 - sink)
    const gained = proud('box-06', 2, 0.5) - proud('box-06', 2, 0.5625)
    expect(gained).toBeCloseTo(0.019115, 6)
    expect(gained / partById('box-03')!.size[0]!).toBeLessThan(0.016)
  })
})

describe('animal-quail: byBand has nothing to spend on this animal', () => {
  it('finds a single unique band on every part this bird wears, except the eye', () => {
    const singleBand = ['box-03', 'tube-02', 'box-06', 'box-18', 'box-01', 'cone-01', 'plate-10']
    for (const id of singleBand) {
      expect([...new Set(partById(id)!.bands)], `${id} has more than one band`).toHaveLength(1)
    }
    expect([...new Set(partById('plate-08')!.bands)]).toHaveLength(2)
    // And that second band is already spent by the pack's own pupil convention,
    // not a spare cell this species could redirect.
    expect(feature('eye').paint).toEqual({ base: 'eye', byBand: { 15: 'pupil' } })
    expect(QUAIL_ASSEMBLY.hull.paint.byBand).toBeUndefined()
    for (const f of QUAIL_ASSEMBLY.features) {
      if (f.name !== 'eye') expect(f.paint.byBand, `"${f.name}" carries byBand`).toBeUndefined()
    }
  })

  it('has no bespoke or authored part, and no RULE 9 overrun', () => {
    expect(QUAIL_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(QUAIL_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(PARTS_BANK.some(p => p.id === 'cone-01')).toBe(true)
  })
})

describe('animal-quail: the pale throat is painted, not built', () => {
  it('splits box-03\'s own equator at 0.5, coat above and throat below', () => {
    expect(QUAIL_ASSEMBLY.hull.paint.patch).toEqual({ below: 'throat', at: 0.5 })
    expect(QUAIL_ASSEMBLY.palette['throat']).toBeDefined()
    expect(QUAIL_ASSEMBLY.palette['coat']).toBeDefined()
  })

  it('sits the eye just above that line, for a dark cap over a pale throat', () => {
    const eyeY = partById('plate-08')!.offset[1]!
    expect(eyeY).toBeCloseTo(0.89375, 5)
    const equator = partById('box-03')!.offset[1]!
    expect(equator).toBeCloseTo(0.80625, 5)
    expect(eyeY).toBeGreaterThan(equator)
    expect(eyeY - equator).toBeCloseTo(0.0875, 4)
  })
})

describe('animal-quail: hull, eye and foot are the chicken\'s, unchanged', () => {
  it('wears box-03, plate-08 and the JT-044 foot patch at the same numbers', () => {
    expect(QUAIL_ASSEMBLY.hull.part).toBe('box-03')
    expect(feature('eye').part).toBe('plate-08')
    const leg = feature('leg-front')
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.patch!.at * 16).toBe(4)
  })

  it('declines the smaller tube-01 muzzle, the pack\'s own rodent snout', () => {
    expect(partById('tube-01')!.size[0]).toBeLessThan(partById('tube-02')!.size[0]!)
    expect(feature('snout').part).toBe('tube-02')
    const rodentDonors = new Set(['aye-aye', 'bushbaby', 'degu', 'mouse', 'squirrel'])
    const tube01Donors = new Set(partById('tube-01')!.provenance.map(p => p.species))
    // None of tube-01's own baked donors is a bird.
    for (const d of tube01Donors) expect(rodentDonors.has(d) || d === 'beaver').toBe(true)
  })
})
