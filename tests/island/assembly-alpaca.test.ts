/**
 * The alpaca — Farm's short, woolliest camelid. The invariants every
 * assembled species carries are `assertAssembly`; this file pins the things
 * that are only this animal's: the ear on the crown's front ridge rather than
 * the donor's own off-ridge x, the uniformly pale hull with no band-3 face,
 * the refused fringe, and the leg left with no `patch` at all.
 */
import { describe, it, expect } from 'vitest'
import { ALPACA_ASSEMBLY } from '../../src/island/species/parts'
type AlpacaFeature = (typeof ALPACA_ASSEMBLY)['features'][number]
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-alpaca',
  parts: ['box-01', 'box-02', 'box-14', 'box-18', 'box-41', 'plate-01'],
  height: 1.5512,
  verts: 496,
  tris: 782,
  // The stocky shell against the tail, the next biggest thing on it — same
  // shape as the sheep's own ratio, on the same hull.
  massRatio: 8,
  // One: the elephant's trunk turned round to face backwards, same as the sheep.
  spinsAtLeast: 1,
})

const feature = (name: string): AlpacaFeature =>
  ALPACA_ASSEMBLY.features.find((f: AlpacaFeature) => f.name === name)!

describe('animal-alpaca: uniformly pale — no band-3 face, unlike the sheep on the same shell', () => {
  it('paints the hull flat, with no byBand at all', () => {
    expect(ALPACA_ASSEMBLY.hull.part).toBe('box-41')
    expect(ALPACA_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
    expect(ALPACA_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('is paler and lower-chroma than the sheep\'s own oatmeal coat', () => {
    const chroma = (hex: number): number => {
      const c = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      return Math.max(...c) - Math.min(...c)
    }
    const lightness = (hex: number): number => {
      const c = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      return (Math.max(...c) + Math.min(...c)) / 2 / 255
    }
    const coat = ALPACA_ASSEMBLY.palette['coat']!
    const sheepCoat = 0xe4dbc7
    expect(lightness(coat)).toBeGreaterThan(lightness(sheepCoat))
    expect(chroma(coat)).toBeLessThan(chroma(sheepCoat))
    // And no `limb` slot: the leg has no boundary to paint, so it falls through
    // to `coat` like everything else not named in the palette.
    expect(ALPACA_ASSEMBLY.palette['limb']).toBeUndefined()
    expect(Object.keys(ALPACA_ASSEMBLY.palette)).toEqual(['coat', 'muzzle', 'pupil'])
  })
})

describe('animal-alpaca: the leg carries no patch at all', () => {
  it('has no `legs` override, so the row paints flat in `coat`', () => {
    expect(feature('leg').paint).toEqual({ base: 'coat' })
    expect(feature('leg').paint.patch).toBeUndefined()
  })
})

describe('animal-alpaca: the ear is sited on the crown\'s FRONT ridge, not the donor\'s own x', () => {
  it('is `box-02`, at an explicit `at`, not the donor transfer', () => {
    expect(feature('ear').part).toBe('box-02')
    const at = feature('ear').placement
    if (at.kind === 'pair') {
      expect(at.at).toEqual([0.25, 1.48125, 0.1479])
      // Inside the ridge's measured +/-0.3276 span, clear of the donor's own
      // offset x (0.4475), which lands past the edge on the sloped saddle.
      expect(Math.abs(at.at[0]!)).toBeLessThan(0.3276)
      expect(partById('box-02')!.offset[0]).toBeCloseTo(0.4475, 4)
      expect(Math.abs(at.at[0]!)).toBeLessThan(partById('box-02')!.offset[0]!)
    }
  })

  it('the ridge itself: box-41\'s topmost ring exists only at |x| = 0.3276', () => {
    const hull = partById('box-41')!
    const top: [number, number][] = []
    for (let i = 0; i < hull.positions.length; i += 3) {
      const y = hull.positions[i + 1]!
      if (Math.abs(y - 0.65) < 1e-6) top.push([hull.positions[i]!, hull.positions[i + 2]!])
    }
    expect(top.length).toBeGreaterThan(0)
    for (const [x] of top) expect(Math.abs(Math.abs(x) - 0.3276)).toBeLessThan(1e-3)
    // Two z-bands: a front ridge and a rear one. The front is used, the rear is not.
    const zs = top.map(([, z]) => z).sort((a, b) => a - b)
    expect(zs[0]!).toBeLessThan(-0.15)
    expect(zs[zs.length - 1]!).toBeGreaterThan(0.05)
  })
})

describe('animal-alpaca: no snout, no fringe, and a plain tail on the sheep\'s own window', () => {
  it('has exactly five features and none of them is a snout or a fringe', () => {
    const names = ALPACA_ASSEMBLY.features.map((f: AlpacaFeature) => f.name).sort()
    expect(names).toEqual(['ear', 'eye', 'leg', 'nose', 'tail'])
    expect(ALPACA_ASSEMBLY.features.some((f: AlpacaFeature) => f.part === 'box-09')).toBe(false)
    expect(ALPACA_ASSEMBLY.flag).toBeUndefined()
  })

  it('the nose sits on the boss\'s own centre, painted `muzzle` and not `coat`', () => {
    expect(feature('nose').part).toBe('box-14')
    expect(feature('nose').paint.base).toBe('muzzle')
    const at = feature('nose').placement
    if (at.kind === 'single') expect(at.at).toEqual([0, 0.69375, 0.725])
  })

  it('the tail is box-18 spun 180, on the sheep\'s own solved window', () => {
    expect(feature('tail').part).toBe('box-18')
    expect(feature('tail').spin).toEqual([{ axis: 'y', deg: 180 }])
    const at = feature('tail').placement
    if (at.kind === 'single') expect(at.at).toEqual([0, 0.80625, -0.625])
  })
})

describe('animal-alpaca: what it costs', () => {
  it('fits well inside the pack\'s triangle ceiling, no flag needed', () => {
    let tris = partById('box-41')!.tris
    tris += partById('box-01')!.tris * 4
    tris += partById('box-02')!.tris * 2
    tris += partById('plate-01')!.tris * 2
    tris += partById('box-14')!.tris
    tris += partById('box-18')!.tris
    expect(tris).toBeLessThan(951)
  })

  it('is short: no neck feature at all', () => {
    expect(ALPACA_ASSEMBLY.features.some((f: AlpacaFeature) => f.name === 'neck')).toBe(false)
  })
})
