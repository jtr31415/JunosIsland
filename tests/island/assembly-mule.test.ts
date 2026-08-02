/**
 * The mule — Farm's own brief cashed in literally: the donkey's ears
 * (`box-06`/`box-07`) on the horse's build (`box-41`). `assembly-pony.test.ts`
 * pins JT-044 for all five hooved Farm species; this file does not repeat
 * that, only what is distinctive about this animal — that its ear forces the
 * join onto the flat top plate rather than the horse's own raised crown, and
 * that the result lands on the fennec fox's own shipped height.
 */
import { describe, it, expect } from 'vitest'
import { MULE_ASSEMBLY } from '../../src/island/species/parts'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-mule',
  parts: ['box-01', 'box-06', 'box-14', 'box-38', 'box-41', 'plate-01', 'tube-07'],
  height: 2.0100,
  verts: 583,
  tris: 714,
  massRatio: 3,
  spinsAtLeast: 1, // the tail, flipped
})

const feature = (name: string): (typeof MULE_ASSEMBLY)['features'][number] =>
  MULE_ASSEMBLY.features.find((f): boolean => f.name === name)!

describe('animal-mule: the donkey\'s ears, the horse\'s hull, forced onto the flat plate', () => {
  it('joins the ear at TOP_PLATE_Y (1.43125), not the horse\'s CROWN_Y (1.48125)', () => {
    const ear = feature('ear')
    expect(ear.part).toBe('box-06')
    const at = ear.placement
    if (at.kind === 'pair') {
      expect(at.at[1]).toBeCloseTo(1.43125, 5)
    } else {
      expect.fail('the mule\'s ear should place as a pair')
    }
  })

  it('reproduces box-06\'s own recorded x/z, unbothered by the different hull', () => {
    const at = feature('ear').placement
    if (at.kind === 'pair') {
      expect(at.at[0]).toBeCloseTo(0.286975, 5)
      expect(at.at[2]).toBeCloseTo(0.347082, 5)
    } else {
      expect.fail('the mule\'s ear should place as a pair')
    }
  })

  it('carries band 3 as the underline AND the muzzle, same as the horse', () => {
    expect(MULE_ASSEMBLY.hull.paint).toEqual({ base: 'coat', byBand: { 3: 'pale' } })
  })

  it('is JT-044, verbatim, unmodified for this animal', () => {
    expect(feature('leg').paint).toEqual({
      base: 'limb',
      patch: { below: 'hoof', at: 0.25 },
    })
  })

  it('paints the tail coat, not pale — this animal has no flaxen', () => {
    expect(feature('tail').paint).toEqual({ base: 'coat' })
  })

  it('has no mane and no forelock — roached, unlike the horse\'s', () => {
    expect(MULE_ASSEMBLY.features.some((f): boolean => f.part.startsWith('bespoke-'))).toBe(false)
  })
})
