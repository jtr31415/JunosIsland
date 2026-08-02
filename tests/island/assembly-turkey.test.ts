/**
 * The turkey. Farm's biggest, darkest galliform, and the only one with a fanned
 * tail.
 *
 * `assertAssembly` already carries every invariant an assembled species shares —
 * one mass, lineage back to the bank, the absolute eye card, nothing at a node,
 * rule 9's budgets, the shared texture, the measured pupil, the leg row, height
 * checked first. None of that is repeated here. This file pins the four things
 * only this animal says, and it re-derives each of them off the BANK rather than
 * quoting the species file, so a change to either side goes red:
 *
 *   1. **The fan's spin is arithmetic.** `box-38`'s own root-to-tip axis is
 *      60.000 degrees above horizontal, so +30 on x is the unique spin that
 *      stands it vertical. Computed from the part's points.
 *   2. **The fan's burial is forced.** At the shape's RECORDED sink the upright
 *      fan floats 0.028014 clear of the rear plate; 8/16 is the notch at which
 *      the shift is exactly zero and the plate bisects the slab. Both numbers
 *      are computed, and the float is asserted as a float.
 *   3. **`box-41`'s plates are `box-03`'s plates.** The wing's three join
 *      coordinates are asserted equal to the chicken's AND re-measured off
 *      `box-41`'s own points, which is the only way to show that the agreement
 *      is a recovery and not a copy.
 *   4. **The head is paint plus one inverted comb.** Band 3 carries the bare red
 *      face for zero triangles; the snood is the chicken's own `cone-01` turned
 *      over, and it beats the wattle window the hen refused.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, TURKEY_ASSEMBLY, CHICKEN_ASSEMBLY, CANARY_ASSEMBLY,
  LEG_ROW, HULL_FRONT_Z, PACK_HEIGHT_MAX,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { MOTIONS } from '../../src/island/species/parts/motion'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-turkey',
  parts: ['box-01', 'box-06', 'box-38', 'box-41', 'cone-01', 'plate-08', 'tube-02'],
  // The fan, and it is the whole of the height above the shell: box-41's crown
  // is 1.48125 and the fan tops out 0.106444 over it.
  height: 1.5877,
  verts: 539,
  tris: 644,
  // TWO legs, not four. A bird.
  legs: 2,
  // box-41 is 262 triangles and the fan is 48, so the margin is thinner than a
  // hen's: the fan is the biggest thing this bird wears.
  massRatio: 5,
  // The fan's +30, and the wing pair's two turns onto the flank, and the snood's
  // 180. The bill stands the way its own attachment does.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-turkey')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof TURKEY_ASSEMBLY.features[number] =>
  TURKEY_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** The harness's own rotation, deliberately re-implemented (see `assembly.ts:112`). */
const spinX = (v: [number, number, number], deg: number): [number, number, number] => {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r)
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
}

/**
 * How far one of a hull's flat faces reaches along another axis — the same
 * measurement `creature.ts`'s `inset` makes, on whichever shell is asked for.
 */
const flatReach = (id: string, face: 0 | 1 | 2, along: 0 | 1 | 2): number => {
  const h = Math.max(...points(id).map(q => Math.abs(q[face])))
  return Math.max(
    ...points(id).filter(q => Math.abs(Math.abs(q[face]) - h) < 1e-6).map(q => Math.abs(q[along])),
  )
}

/** The world y-window of a named flat plate on `box-41`, from its own points. */
const plateYWindow = (axis: 0 | 1 | 2, local: number): [number, number] => {
  const on = points('box-41').filter(q => Math.abs(q[axis] - local) < 1e-6)
  const at = partById('box-41')!.offset[1]!
  return [Math.min(...on.map(q => q[1])) + at, Math.max(...on.map(q => q[1])) + at]
}

describe('animal-turkey: the fan, and both of its numbers are forced', () => {
  it('takes `box-38`, which farm.ts reserved and two other species read differently', () => {
    // The parrot's fan. `animal-canary.ts` wears it UNSPUN and lying back;
    // `animal-pony.ts` flips it 180 on z as a hanging switch. Neither reading is
    // this one, which is why the three do not collide.
    expect(feature('tail').part).toBe('box-38')
    expect([...new Set(partById('box-38')!.provenance.map(p => p.species))]).toEqual(['parrot'])
    expect(CANARY_ASSEMBLY.features.find(f => f.name === 'tail')!.part).toBe('box-38')
    expect(CANARY_ASSEMBLY.features.find(f => f.name === 'tail')!.spin).toBeUndefined()
    // And the exemplar left it alone on purpose.
    expect(CHICKEN_ASSEMBLY.features.some(f => f.part === 'box-38')).toBe(false)
    expect(CHICKEN_ASSEMBLY.flag).toMatch(/THE FAN IS NOT SPENT/)
  })

  it('spins +30 because the shape\'s own plane leans 30, and 60 + 30 = 90', () => {
    /*
     * `box-38` is a flat SLAB and the thing that has to be stood up is its PLANE,
     * so the measurement is the plane's normal rather than a root-to-tip line
     * (the root quad's centroid gives 66.08 degrees, which is a different and
     * less useful fact about the same shape). The normal is read off the bank's
     * own normals array as the modal direction — 26 of the 78 vertex normals, the
     * two big faces — and it is (0, 0.5, 0.866025): 30.000 degrees above
     * horizontal, i.e. a plane leaning 30 degrees back from vertical, whose
     * in-plane up-direction is 60.000 degrees above horizontal.
     */
    const p = partById('box-38')!
    const tally = new Map<string, number>()
    for (let i = 0; i < p.normals.length; i += 3) {
      const k = [0, 1, 2].map(a => Math.abs(p.normals[i + a]!).toFixed(4)).join(',')
      tally.set(k, (tally.get(k) ?? 0) + 1)
    }
    const [modal, count] = [...tally].sort((a, b) => b[1] - a[1])[0]!
    expect(count).toBe(26)
    const n = modal.split(',').map(Number) as [number, number, number]
    expect(n[0]).toBeCloseTo(0, 6)
    expect(n[1]).toBeCloseTo(0.5, 4)
    expect(n[2]).toBeCloseTo(0.866, 3)
    expect((Math.atan2(n[1], n[2]) * 180) / Math.PI).toBeCloseTo(30, 2)
    // The spin the species takes is exactly the remainder, and it is the only
    // one: +30 puts the normal flat on the horizon, so the plane is vertical.
    expect(feature('tail').spin).toEqual([{ axis: 'x', deg: 30 }])
    expect(spinX(n, 30)[1]).toBeCloseTo(0, 4)
    for (const wrong of [15, 25, 35, 45]) {
      expect(Math.abs(spinX(n, wrong)[1]), `${wrong} also stands it up`).toBeGreaterThan(0.05)
    }
    expect(feature('tail').stretch, 'the fan is stretched').toBeUndefined()
  })

  it('overrules the recorded burial because upright, at that burial, it FLOATS', () => {
    /*
     * Worn flat the part joins by its root quad and the recorded 0.269738 buries
     * 0.173226 of it. Stood upright the root faces DOWN and cannot meet a
     * vertical plate at all, so the recorded number stops describing the join:
     * the fan's frontmost point lands 0.028014 BEHIND the rear plate.
     */
    const bank = partById('box-38')!
    const recorded = bank.attachment!.sunkFractionMean
    expect(recorded).toBeCloseTo(0.269738, 6)
    const spun = points('box-38').map(q => spinX(q, 30))
    // The facing turns with the part, so the span is taken along the SPUN
    // attachment vector — which is why the extent is still the shape's own.
    const facing = spinX([0, 0, -1], 30)
    const along = spun.map(q => q[0] * facing[0] + q[1] * facing[1] + q[2] * facing[2])
    const lo = Math.min(...along), hi = Math.max(...along)
    expect(hi - lo).toBeCloseTo(0.6422, 4)
    const REAR = -0.625
    /** The fan's frontmost world z, joined at the rear plate at a given burial. */
    const frontAt = (sink: number): number =>
      REAR + facing[2] * (-lo - sink * (hi - lo)) + Math.max(...spun.map(q => q[2]))
    // At the recorded burial the upright fan hangs clear of the shell.
    expect(frontAt(recorded)).toBeCloseTo(-0.653014, 5)
    expect(frontAt(recorded)).toBeLessThan(REAR)
    expect(REAR - frontAt(recorded)).toBeCloseTo(0.028014, 5)
    // At 8/16 the shift is EXACTLY zero, so the centre lands on the join point
    // and the plate bisects the fan's own 0.200 of thickness.
    expect(feature('tail').sink).toBe(0.5)
    expect(feature('tail').sink! * 16).toBe(8)
    expect(-lo - 0.5 * (hi - lo)).toBeCloseTo(0, 12)
    expect(frontAt(0.5) - REAR).toBeCloseTo(0.100049, 5)
    expect(REAR - (REAR + Math.min(...spun.map(q => q[2])))).toBeCloseTo(0.100033, 5)
    // 6/16 is the first notch that touches at all — stated so the choice of 8 is
    // visibly a choice between four and not the only one that works.
    expect(frontAt(0.375)).toBeGreaterThan(REAR)
    expect(frontAt(0.3125)).toBeLessThan(REAR)
  })

  it('joins at the rear plate\'s own TOP corner, and clears the crown by 0.106444', () => {
    // The plate is z = -0.625 spanning y 0.49375..1.11875 — measured off box-41,
    // and identical to box-03's. 1.11875 is its upper edge and the highest
    // station on the shell.
    const [lo, hi] = plateYWindow(2, -0.675)
    expect(lo).toBeCloseTo(0.49375, 6)
    expect(hi).toBeCloseTo(1.11875, 6)
    const place = feature('tail').placement
    if (place.kind === 'single') expect(place.at).toEqual([0, hi, -0.625])
    const g = build()
    const fan = boxOf(g, 'tail')
    expect(fan.min.y).toBeCloseTo(0.649806, 4)
    expect(fan.max.y).toBeCloseTo(1.587694, 4)
    // box-41's crown pads, and what the fan stands over them.
    const crown = boxOf(g, 'hull').max.y
    expect(crown).toBeCloseTo(1.48125, 4)
    expect(fan.max.y - crown).toBeCloseTo(0.106444, 4)
    // At the canary's own tail height the fan would top out BELOW the crown and
    // never break the silhouette — the refusal, in the one number that says it.
    expect(hi - 0.80625 - 0.106444).toBeGreaterThan(0.1)
    expect(0.80625 + (fan.max.y - hi) - crown).toBeCloseTo(-0.206056, 4)
    // And the ceiling does not bind: the contact does.
    const h = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y
    expect(PACK_HEIGHT_MAX - h).toBeGreaterThan(0.4)
  })

  it('wears ONE, because a second is wider than the plate it would join to', () => {
    // box-38 is 0.625879 across and the flat rear plate is 0.625000 across, so
    // the part is 0.000879 WIDER than the whole plate: there is no x at which a
    // second copy has any plate under it. The count is set by the shell.
    const width = partById('box-38')!.size[0]!
    const plate = 2 * flatReach('box-41', 2, 0)
    expect(width).toBeCloseTo(0.625879, 6)
    expect(plate).toBeCloseTo(0.625, 6)
    expect(width - plate).toBeCloseTo(0.000879, 6)
    expect(width).toBeGreaterThan(plate)
    expect(TURKEY_ASSEMBLY.features.filter(f => f.part === 'box-38')).toHaveLength(1)
    // Not on budget: rule 9 had room for six more of it.
    expect(TURKEY_ASSEMBLY.flag).toMatch(/There is ONE fan and a second is impossible/)
  })

  it('does NOT wag, because 20 degrees swings the buried half out of the shell', () => {
    // MOTIONS.wag is 0.35 rad about y, and this fan's node is its own centre ON
    // the plate. Half the fan's width turned that far moves the outer edge
    // further in z than the 0.100 that is embedded.
    expect(MOTIONS.wag.axis).toBe('y')
    const swing = (partById('box-38')!.size[0]! / 2) * Math.sin(MOTIONS.wag.amplitude)
    expect(swing).toBeGreaterThan(0.1)
    const motion = TURKEY_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
  })
})

describe('animal-turkey: box-41, and the plates that are box-03\'s plates', () => {
  it('is the one hull bigger than a hen\'s, and states what it costs', () => {
    const big = partById('box-41')!, hen = partById('box-03')!
    for (let a = 0; a < 3; a++) expect(big.size[a]!).toBeGreaterThan(hen.size[a]!)
    expect(TURKEY_ASSEMBLY.hull.part).toBe('box-41')
    expect(CHICKEN_ASSEMBLY.hull.part).toBe('box-03')
    expect(big.tris).toBe(262)
    expect(hen.tris).toBe(60)
    // The hull is 41% of the whole animal, which is the price of "biggest".
    const total = build().children
      .reduce((n, m) => n + (m as THREE.Mesh).geometry.getIndex()!.count / 3, 0)
    expect(big.tris / total).toBeGreaterThan(0.4)
    // And it is never scaled — the hull cannot be, and nothing else here is.
    for (const f of TURKEY_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
  })

  it('re-derives the wing\'s three coordinates and lands on the chicken\'s', () => {
    /*
     * The trap: box-41's RECORDED offset is (0, 0.83125, 0.05) and that is not
     * where any of its plates are. Measured off its own points the flank plate is
     * x 0.625, y 0.49375..1.11875 (mid 0.80625) and z +/-0.3125 (mid 0) — which
     * is box-03's plate at box-03's coordinates. So the agreement below is a
     * recovery, not a copy, and asserting both is the only way to show it.
     */
    const hull = partById('box-41')!
    expect(hull.offset).toEqual([0, 0.83125, 0.05])
    const flank = points('box-41').filter(q => Math.abs(q[0] - 0.625) < 1e-6)
    expect(flank.length).toBeGreaterThan(0)
    const yLo = Math.min(...flank.map(q => q[1])) + hull.offset[1]!
    const yHi = Math.max(...flank.map(q => q[1])) + hull.offset[1]!
    const zMid = (Math.min(...flank.map(q => q[2])) + Math.max(...flank.map(q => q[2]))) / 2
      + hull.offset[2]!
    expect(yLo).toBeCloseTo(0.49375, 6)
    expect(yHi).toBeCloseTo(1.11875, 6)
    expect((yLo + yHi) / 2).toBeCloseTo(0.80625, 6)
    expect(zMid).toBeCloseTo(0, 6)
    // The plate's own centre is 0.025 BELOW the hull's recorded centre, and it is
    // box-03's own recorded centre instead.
    expect(hull.offset[1]! - (yLo + yHi) / 2).toBeCloseTo(0.025, 6)
    expect((yLo + yHi) / 2).toBeCloseTo(partById('box-03')!.offset[1]!, 9)
    // So the join is the chicken's, byte for byte, and so is the rest of the line.
    const mine = feature('wing'), hen = CHICKEN_ASSEMBLY.features.find(f => f.name === 'wing')!
    expect(mine.part).toBe(hen.part)
    expect(mine.sink).toBe(hen.sink)
    expect(mine.spin).toEqual(hen.spin)
    expect(mine.axis).toBe(hen.axis)
    expect(mine.dir).toBe(hen.dir)
    expect(mine.placement).toEqual(hen.placement)
    if (mine.placement.kind === 'pair') {
      expect(mine.placement.at[0]).toBeCloseTo(0.625, 9)
      expect(mine.placement.at[1]).toBeCloseTo((yLo + yHi) / 2, 9)
      expect(mine.placement.at[2]).toBe(0)
    }
    // It is a SOLID and not a card, which is the finding that put a bunny's ear
    // on a bird at all.
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
  })

  it('stands 0.102900 proud over the flank PAD instead of 0.152918, accepted', () => {
    // box-41's sides reach 0.675 on two pads, 0.050 further out than the plate
    // the wing joins to, so over that patch the wing has 0.050 less of itself
    // showing. It is the same condition WING_SINK was solved for, with the sign
    // flipped, and animal-sheep.ts measured the same 0.050 across five bands.
    const pad = Math.max(...points('box-41').map(q => q[0]))
    expect(pad).toBeCloseTo(0.675, 6)
    const plate = 0.625
    const proud = partById('box-06')!.size[2]! * (1 - 0.5)
    expect(proud).toBeCloseTo(0.152918, 6)
    expect(proud - (pad - plate)).toBeCloseTo(0.102918, 5)
    const g = build()
    expect(boxOf(g, 'wing-r').max.x - pad).toBeCloseTo(0.1029, 4)
  })

  it('keeps LEG_ROW and box-01\'s own x, because the sole did not move', () => {
    // box-41's sole is y 0.18125 and 0.625 across — box-03's own — so the biped's
    // station transfers unchanged and the feet still land on y = 0.
    const hull = partById('box-41')!
    const sole = hull.offset[1]! - Math.max(...points('box-41').map(q => Math.abs(q[1])))
    expect(sole).toBeCloseTo(0.18125, 6)
    expect(sole).toBeCloseTo(
      partById('box-03')!.offset[1]! - partById('box-03')!.size[1]! / 2, 6,
    )
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      expect(leg.placement.at).toEqual([partById('box-01')!.offset[0], LEG_ROW.y, 0])
    }
    // JT-044's foot, at the chicken's own notch. `patch`, never `byBand`.
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.byBand).toBeUndefined()
    expect(leg.paint.patch!.at * 16).toBe(4)
  })
})

describe('animal-turkey: the bare head is paint, and the snood is an inverted comb', () => {
  it('paints the face on band 3, the band animal-sheep.ts found, for zero triangles', () => {
    /*
     * box-41 arrives cut into three bands. Band 3 is the front plate's muzzle
     * region with the boss standing out of the middle of it, plus the underline —
     * the sheep spends it dark and the horse spends it pale; this bird spends it
     * red and gets a bare turkey face without a shape.
     */
    const hull = partById('box-41')!
    expect([...new Set(hull.bands)].sort((a, b) => a - b)).toEqual([3, 7, 15])
    expect(TURKEY_ASSEMBLY.hull.paint).toEqual({
      base: 'coat', byBand: { 3: 'face', 15: 'bronze' },
    })
    // `patch` may never sit beside `byBand` on one part, so `belly` is not merely
    // declined here — it is unavailable, and the underline does its job anyway.
    expect(TURKEY_ASSEMBLY.hull.paint.patch).toBeUndefined()
    // Where band 3 actually is: the mask runs from the throat up to the eye row.
    const at = hull.offset
    const band3: number[] = []
    for (let t = 0; t < hull.bands.length; t++) {
      if (hull.bands[t] !== 3) continue
      for (let k = 0; k < 3; k++) band3.push(hull.positions[hull.indices[t * 3 + k]! * 3 + 1]! + at[1]!)
    }
    expect(Math.min(...band3)).toBeCloseTo(0.18125, 5)
    expect(Math.max(...band3)).toBeCloseTo(0.89375, 5)
    expect(hull.bands.filter(b => b === 3)).toHaveLength(37)
    // The chicken left byBand unspent for exactly this: box-03 has ONE band.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    expect(CHICKEN_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('hangs the CHICKEN\'S OWN comb shape upside down off the bill\'s tip', () => {
    // Same part, one spin, opposite job: cone-01 is one of only two records in
    // all 94 with taper 0, the hen stands three of them on her crown, and this
    // bird hangs one of them from the anchor the bill presents.
    const snood = feature('snood')
    expect(snood.part).toBe('cone-01')
    expect(CHICKEN_ASSEMBLY.features.filter(f => f.part === 'cone-01')).toHaveLength(3)
    expect(partById('cone-01')!.shape.taper).toBe(0)
    expect(snood.spin).toEqual([{ axis: 'x', deg: 180 }])
    expect(snood.sink).toBeCloseTo(partById('cone-01')!.attachment!.sunkFractionMean, 9)
    expect(snood.paint.base).toBe('face')
    // Its station is the bill's own outer face, solved rather than typed: the
    // bill is a pure donor transfer onto this shell's front, which is 0.725.
    expect(HULL_FRONT_Z['box-41']).toBeCloseTo(0.725, 6)
    const bill = partById('tube-02')!
    const g = build()
    const bm = g.getObjectByName('snout')!
    expect(bm.position.z).toBeCloseTo(0.725, 6)
    expect(bm.position.y).toBeCloseTo(bill.offset[1]!, 6)
    if (snood.placement.kind === 'single') {
      expect(snood.placement.at[0]).toBe(0)
      expect(snood.placement.at[1]).toBeCloseTo(bill.offset[1]!, 6)
      expect(snood.placement.at[2]).toBeCloseTo(0.725 + bill.size[2]! / 2, 6)
    }
  })

  it('droops 0.149386 below the bill — 3.74x the wattle the hen refused', () => {
    /*
     * animal-chicken.ts §5 measured the window under a bill at 0.108 and refused
     * every solid box in the bank for it, the best of them standing 0.039913
     * proud. That window is the SAME 0.108 on this shell, because both ends come
     * from the same two parts. What changed is the part: a hung cone is a
     * free-hanging silhouette rather than a bump on a flat face.
     */
    const bill = partById('tube-02')!
    const billBottom = bill.offset[1]! - bill.size[1]! / 2
    expect(billBottom).toBeCloseTo(0.60175, 5)
    const faceBottom = partById('box-41')!.offset[1]! - flatReach('box-41', 2, 1)
    expect(faceBottom).toBeCloseTo(0.49375, 5)
    expect(billBottom - faceBottom).toBeCloseTo(0.108, 3)
    // What the hen could have had there, and what this bird has instead.
    const hensBest = partById('box-09')!.size[2]! * 0.5
    expect(hensBest).toBeCloseTo(0.039913, 5)
    const g = build()
    const s = boxOf(g, 'snood')
    expect(billBottom - s.min.y).toBeCloseTo(0.149386, 4)
    expect((billBottom - s.min.y) / hensBest).toBeGreaterThan(3.7)
    // And past the tip of the bill, which is the other half of a snood.
    expect(s.max.z - boxOf(g, 'snout').max.z).toBeCloseTo(0.1643, 3)
    // The separate wattle is still refused, and nothing in the bank is worn for it.
    for (const id of ['box-09', 'box-10', 'plate-12', 'plate-16']) {
      expect(TURKEY_ASSEMBLY.features.some(f => f.part === id), `${id} is worn`).toBe(false)
    }
  })

  it('has NO comb, and box-41\'s crown would not take the hen\'s row anyway', () => {
    // A turkey has none — and farm.ts:162 gives comb and wattle to the ROOSTER as
    // the whole of its separation from the hen, so a sibling taking one back is
    // spending someone else's axis.
    expect(TURKEY_ASSEMBLY.features.some(f => f.name.startsWith('comb'))).toBe(false)
    expect(TURKEY_ASSEMBLY.features.filter(f => f.part === 'cone-01')).toHaveLength(1)
    /*
     * The mechanism agrees. box-41's crown is not box-03's flat 1.43125: it
     * carries two transverse PADS 0.050 higher, at |z| 0.1383 to 0.2575. The
     * chicken's row runs z 0.148215 / 0.023215 / -0.101785, so its leading point
     * would sit on a pad and the other two on the flat between them.
     */
    const top = Math.max(...points('box-41').map(q => q[1]))
    // Local z, carried to WORLD: box-41's own offset is z +0.05, so a pad that
    // reads |0.0883| in the record is at |0.1383| on the animal.
    const onPad = points('box-41')
      .filter(q => Math.abs(q[1] - top) < 1e-6)
      .map(q => Math.abs(q[2] + partById('box-41')!.offset[2]!))
    expect(top + partById('box-41')!.offset[1]!).toBeCloseTo(1.48125, 6)
    expect(Math.min(...onPad)).toBeCloseTo(0.1383, 3)
    expect(Math.max(...onPad)).toBeCloseTo(0.2575, 3)
    const henRow = [0.148215, 0.023215, -0.101785]
    const onAPad = henRow.filter(z => Math.abs(z) >= 0.1383 && Math.abs(z) <= 0.2575)
    expect(onAPad).toHaveLength(1)
  })

  it('is the darkest galliform, and every slot it declares is a slot it spends', () => {
    // Weighted by surface area — never by vertex count — this bird is dark, and
    // that is the axis farm.ts:152 gave it after size.
    const lum = (hex: number): number =>
      0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255)
    expect(lum(TURKEY_ASSEMBLY.palette['coat']!))
      .toBeLessThan(lum(CHICKEN_ASSEMBLY.palette['coat']!) / 3)
    expect(lum(TURKEY_ASSEMBLY.palette['bronze']!))
      .toBeGreaterThan(lum(TURKEY_ASSEMBLY.palette['coat']!))
    const used = new Set<string>(['pupil'])
    for (const f of [...TURKEY_ASSEMBLY.features, TURKEY_ASSEMBLY.hull]) {
      used.add(f.paint.base)
      for (const s of Object.values(f.paint.byBand ?? {})) used.add(s)
      if (f.paint.patch) used.add(f.paint.patch.below)
    }
    expect([...used].sort()).toEqual(Object.keys(TURKEY_ASSEMBLY.palette).sort())
    // Nothing authored, and rule 9 is not being overrun.
    expect(TURKEY_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(TURKEY_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })
})
