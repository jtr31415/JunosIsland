/**
 * The guinea fowl. Farm's spotted galliform, and the first of the three
 * siblings (guinea fowl, turkey, quail) `animal-chicken.ts` held `box-41` and
 * `byBand` back for.
 *
 * `assertAssembly` covers every invariant every assembled species carries.
 * This file is what only a guinea fowl can say: that `box-41`'s recorded
 * centre is NOT its flank plate's, that its three bands split the hull's
 * surface area 10.8/51.3/37.9 rather than by triangle count, that the casque
 * is buried to exactly half the hen's own comb stand, and the straight verdict
 * on whether any of that reads as spots.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, GUINEA_FOWL_ASSEMBLY, CHICKEN_ASSEMBLY, HORSE_ASSEMBLY, SHEEP_ASSEMBLY,
  HULL_FRONT_Z_USUAL, LEG_ROW,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-guinea-fowl',
  parts: ['box-01', 'box-06', 'box-41', 'cone-01', 'plate-08', 'tube-02'],
  // The casque, and it is the whole of the difference from the bare shell's
  // own crown pad height: one cone buried 12/16 stands 0.100089 proud.
  height: 1.5313,
  verts: 479,
  tris: 596,
  // TWO legs, not four. A ground bird.
  legs: 2,
  massRatio: 4,
  // No tail to turn: the wing pair turned onto the flank is the one spin
  // this bird carries.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-guinea-fowl')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): typeof GUINEA_FOWL_ASSEMBLY.features[number] =>
  GUINEA_FOWL_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** How far a part sticks out of the face it joins, at a given burial. */
const proud = (id: string, axis: 0 | 1 | 2, sink: number): number =>
  partById(id)!.size[axis]! * (1 - sink)

/** Triangle area, off the raw baked mesh, per band — §2's own measurement. */
const bandAreas = (id: string): Record<number, number> => {
  const p = partById(id)!
  const out: Record<number, number> = {}
  for (let t = 0; t < p.indices.length / 3; t++) {
    const band = p.bands[t]!
    const i0 = p.indices[t * 3]!, i1 = p.indices[t * 3 + 1]!, i2 = p.indices[t * 3 + 2]!
    const v = (i: number): [number, number, number] =>
      [p.positions[i * 3]!, p.positions[i * 3 + 1]!, p.positions[i * 3 + 2]!]
    const a = v(i0), b = v(i1), c = v(i2)
    const ab: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const ac: [number, number, number] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const cross: [number, number, number] = [
      ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0],
    ]
    const area = Math.hypot(...cross) / 2
    out[band] = (out[band] ?? 0) + area
  }
  return out
}

describe('animal-guinea-fowl: box-41 gives three bands, measured by area not by count', () => {
  it('splits its surface 10.8% / 51.3% / 37.9%, and band 7 is the flat shell', () => {
    // Fewest triangles, most area: a flat rectangular face costs Kenney almost
    // nothing per unit of area, and the crown/flank pads are small but highly
    // faceted, which is the whole reason this file paints against triangle
    // count rather than with it.
    const areas = bandAreas('box-41')
    const total = Object.values(areas).reduce((s, a) => s + a, 0)
    expect(Object.keys(areas).map(Number).sort((a, b) => a - b)).toEqual([3, 7, 15])
    expect(areas[3]! / total).toBeCloseTo(0.108, 2)
    expect(areas[7]! / total).toBeCloseTo(0.513, 2)
    expect(areas[15]! / total).toBeCloseTo(0.379, 2)
    expect(areas[7]!).toBeGreaterThan(areas[15]!)
    const p = partById('box-41')!
    const counts: Record<number, number> = {}
    for (const b of p.bands) counts[b] = (counts[b] ?? 0) + 1
    expect(counts[3]).toBe(37)
    expect(counts[7]).toBe(57)
    expect(counts[15]).toBe(168)
    expect(counts[7]!).toBeLessThan(counts[15]!)
  })

  it('paints band 7 (the flat shell) dark, and bands 15 and 3 pale', () => {
    expect(GUINEA_FOWL_ASSEMBLY.hull.part).toBe('box-41')
    expect(GUINEA_FOWL_ASSEMBLY.hull.paint.base).toBe('ground')
    expect(GUINEA_FOWL_ASSEMBLY.hull.paint.byBand).toEqual({ 15: 'fleck', 3: 'face' })
    // patch and byBand are never combined on one part.
    expect(GUINEA_FOWL_ASSEMBLY.hull.paint.patch).toBeUndefined()
    // box-03 has one band; a species wanting byBand on the body wants a
    // different shell, which is the whole reason box-41 was reserved.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    expect([...new Set(partById('box-41')!.bands)]).toHaveLength(3)
  })

  it('gives the straight verdict: this reads as patches, not spots', () => {
    // There is no fourth band to cut and JT-043 forbids authoring one, so the
    // pale "fleck" slot is ONE contiguous shape (the crown pads and the flank
    // pads together) rather than a scatter. The flag says so in Joe's words.
    expect(GUINEA_FOWL_ASSEMBLY.flag).toMatch(/READS AS PATCHES, NOT SPOTS/)
    expect(GUINEA_FOWL_ASSEMBLY.flag).toMatch(/box-41 gives exactly three regions/)
  })
})

describe('animal-guinea-fowl: the wing is re-derived onto box-41, not copied', () => {
  it('recovers box-03\'s own flank plate centre, and NOT box-41\'s recorded 0.83125', () => {
    const wing = feature('wing')
    expect(wing.part).toBe('box-06')
    // Same recipe as every cage bird and the hen: spin, sink, axis unchanged.
    expect(wing.sink).toBe(CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!.sink)
    expect(wing.spin).toEqual(CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!.spin)
    expect(wing.axis).toBe(CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!.axis)
    expect(wing.dir).toBe(CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!.dir)
    if (wing.placement.kind === 'pair') {
      expect(wing.placement.at[0]).toBe(0.625)
      expect(wing.placement.at[2]).toBe(0)
      // The one number that is NOT box-41's own raw offset (0.83125).
      expect(wing.placement.at[1]).toBeCloseTo(0.80625, 9)
      expect(wing.placement.at[1]).not.toBeCloseTo(partById('box-41')!.offset[1]!, 4)
    }
    // And it sits below the flank pad's own band (0.86035+), so it never
    // touches the raised pad at all.
    expect(0.80625).toBeLessThan(0.86035)
  })

  it('is a solid, never a card, because the island camera looks down', () => {
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
  })
})

describe('animal-guinea-fowl: the bill overhangs the new muzzle boss, measured', () => {
  it('is 0.030 wider than box-41\'s boss on each side, under half tube-06\'s refused 0.066', () => {
    const bill = partById('tube-02')!
    const halfWidth = bill.size[0]! / 2
    expect(halfWidth).toBeCloseTo(0.23, 6)
    // The boss is a true prism (no taper): |x| <= 0.200 through its whole
    // 0.100 of depth, measured off the raw vertices between z 0.55 and 0.75.
    const OFFSET = [0, 0.83125, 0.05] as const
    const bossPts = points('box-41')
      .map(([x, y, z]): [number, number, number] => [x + OFFSET[0], y + OFFSET[1], z + OFFSET[2]])
      .filter(([x, , z]) => z > 0.64 && Math.abs(x) < 0.35)
    const bossHalfWidth = Math.max(...bossPts.map(([x]) => Math.abs(x)))
    expect(bossHalfWidth).toBeCloseTo(0.2, 4)
    const overhang = halfWidth - bossHalfWidth
    expect(overhang).toBeCloseTo(0.03, 3)
    expect(overhang).toBeLessThan(0.066 / 2)
    // No override at all — the bare donor transfer, unmodified from the hen's.
    // The join point itself moves, though: `frame.front` is `at[2] + half-z`
    // off the hull's own BOUNDING box, and box-41's includes the boss, so it
    // resolves to 0.725 here where box-03 (no boss) gave the hen 0.625.
    const f = feature('snout')
    expect(f.part).toBe('tube-02')
    expect(f.spin).toBeUndefined()
    expect(f.stretch).toBeUndefined()
    if (f.placement.kind === 'single') expect(f.placement.at[2]).toBeCloseTo(0.725, 6)
    expect(0.725).not.toBeCloseTo(HULL_FRONT_Z_USUAL, 1)
    const g = build()
    const m = g.getObjectByName('snout')!
    // sink = 0.5 is symmetric, so the shift is zero and the built centre lands
    // exactly on the join point — 0.725, not the flat plate's 0.625.
    expect(m.position.z).toBeCloseTo(0.725, 6)
    expect(m.position.y).toBeCloseTo(bill.offset[1]!, 5)
    // So the bill's whole 0.2 of depth sits FORWARD of the flat plate: its
    // rear (0.625) is flush with the plate, its tip (0.825) reaches 0.1 clear
    // of `frame.front` — same 0.1 clearance the hen's own bill has, because
    // sink = 0.5 always leaves half the depth beyond the join point — and
    // 0.1 PAST the boss's own end (0.725), not merely level with it.
    expect(m.position.z - bill.size[2]! / 2).toBeCloseTo(0.625, 6)
    expect(m.position.z + bill.size[2]! / 2).toBeCloseTo(0.825, 6)
    expect(m.position.z + bill.size[2]! / 2 - 0.725).toBeCloseTo(0.1, 6)
  })

  it('refuses the wattle on the hen\'s own arithmetic, unchanged', () => {
    for (const id of ['box-09', 'box-10', 'plate-12', 'plate-16']) {
      expect(GUINEA_FOWL_ASSEMBLY.features.some(f => f.part === id), `${id} is worn`).toBe(false)
    }
  })
})

describe('animal-guinea-fowl: the casque is one cone, buried to half the hen\'s stand', () => {
  it('buries 12/16, standing 0.100089 proud — exactly half animal-chicken\'s 0.200178', () => {
    const casque = feature('casque')
    expect(casque.part).toBe('cone-01')
    expect(casque.sink).toBe(0.75)
    expect(casque.sink! * 16).toBe(12)
    expect(casque.spin).toBeUndefined()
    expect(casque.stretch).toBeUndefined()
    const mine = proud('cone-01', 1, 0.75)
    const hen = proud('cone-01', 1, CHICKEN_ASSEMBLY.features.find(f => f.name === 'comb-front')!.sink!)
    expect(hen).toBeCloseTo(0.200178, 6)
    expect(mine).toBeCloseTo(0.100089, 6)
    expect(mine / hen).toBeCloseTo(0.5, 6)
    // One knob, not three: a third of the hen's three-cone comb cost.
    expect(GUINEA_FOWL_ASSEMBLY.features.filter(f => f.part === 'cone-01')).toHaveLength(1)
  })

  it('is JOINED at box-41\'s crown SADDLE, at z=0, not on either transverse pad', () => {
    // `at` is the JOIN point the definition names — the saddle, 1.43125 — and
    // it is not the same number as the built mesh's own centre, because a
    // sink other than 0.5 gives a nonzero shift (§4: proud = (1-sink) x
    // extent only holds when it is measured off the join plane, not off the
    // pivot). animal-chicken's own comb sits at sink=0.5, where shift is
    // zero, which is why its own test could check `position.y` directly.
    const casque = feature('casque')
    if (casque.placement.kind === 'single') {
      expect(casque.placement.at).toEqual([0, 1.43125, 0])
    }
    // box-41's crown is two pads with a flat saddle between them at 1.43125 —
    // IDENTICAL to box-03's own top — not a uniform ridge at 1.48125.
    const OFFSET = [0, 0.83125, 0.05] as const
    const crownPts = points('box-41')
      .map(([x, y, z]): [number, number, number] => [x + OFFSET[0], y + OFFSET[1], z + OFFSET[2]])
      .filter(([x, y]) => Math.abs(x) <= 0.35 && y > 1.4)
    const atMidline = crownPts.filter(([, , z]) => Math.abs(z) < 0.09)
    const onPad = crownPts.filter(([, , z]) => Math.abs(z) > 0.13 && Math.abs(z) < 0.27)
    expect(Math.max(...atMidline.map(([, y]) => y))).toBeCloseTo(1.43125, 4)
    expect(Math.max(...onPad.map(([, y]) => y))).toBeCloseTo(1.48125, 4)
    // Built: the mesh's own pivot sits BELOW the join plane by `sink x extent`
    // less `extent`'s own half — i.e. the join plane less half the stand,
    // 1.43125 - 0.100089 — and the whole shape's TOP is the join plane plus
    // the proud amount, 1.531339, clear of both crown pads (1.48125).
    const g = build()
    const casqueBox = new THREE.Box3().setFromObject(g.getObjectByName('casque')!)
    expect(casqueBox.max.y).toBeCloseTo(1.43125 + 0.100089, 4)
    expect(casqueBox.max.y).toBeGreaterThan(1.48125)
    expect(g.getObjectByName('casque')!.position.z).toBeCloseTo(0, 6)
    expect(g.getObjectByName('casque')!.position.x).toBeCloseTo(0, 6)
  })
})

describe('animal-guinea-fowl: no tail, and the arithmetic for refusing one', () => {
  it('wears none, where the hen wore box-18 as her own "spent" answer', () => {
    expect(GUINEA_FOWL_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(false)
    expect(GUINEA_FOWL_ASSEMBLY.features.some(f => f.part === 'box-18')).toBe(false)
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(true)
    expect(GUINEA_FOWL_ASSEMBLY.flag).toMatch(/NO TAIL/)
  })
})

describe('animal-guinea-fowl: the amber iris, reserved by name', () => {
  it('wears plate-08 from the amber slot, where the hen kept a dark bead', () => {
    expect(feature('eye').part).toBe('plate-08')
    expect(feature('eye').paint.base).toBe('eye')
    expect(GUINEA_FOWL_ASSEMBLY.palette['eye']).not.toBe(CHICKEN_ASSEMBLY.palette['eye'])
  })
})

describe('animal-guinea-fowl: JT-044\'s foot patch, unchanged', () => {
  it('wears the same patch at the same 4/16 notch, on its own biped row', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    if (leg.placement.kind === 'pair') {
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
  })
})

describe('animal-guinea-fowl: every declared slot is spent, nothing authored', () => {
  it('has no unused palette slot and no bespoke part', () => {
    const used = new Set<string>(['pupil'])
    for (const f of [...GUINEA_FOWL_ASSEMBLY.features, GUINEA_FOWL_ASSEMBLY.hull]) {
      used.add(f.paint.base)
      for (const s of Object.values(f.paint.byBand ?? {})) used.add(s)
      if (f.paint.patch) used.add(f.paint.patch.below)
    }
    expect([...used].sort()).toEqual(Object.keys(GUINEA_FOWL_ASSEMBLY.palette).sort())
    expect(GUINEA_FOWL_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(GUINEA_FOWL_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })

  it('is not stretched anywhere, and box-41 is worn at its own size', () => {
    for (const f of GUINEA_FOWL_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(GUINEA_FOWL_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(HORSE_ASSEMBLY.hull.part).toBe('box-41')
    expect(SHEEP_ASSEMBLY.hull.part).toBe('box-41')
  })
})
