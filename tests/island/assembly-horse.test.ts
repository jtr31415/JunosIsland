/**
 * The horse — Farm's big equid, and the EXEMPLAR the collection's other four
 * hooved quadrupeds are cut from.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`, and JT-044's mechanism is pinned once and for all in
 * `assembly-pony.test.ts:87-283`. **Neither is repeated here.** This file pins
 * the four things that are this species' own and that a sibling will copy:
 *
 *   1. **`box-41`'s BOUNDING BOX LIES, and the pony's refusal of it does not
 *      hold.** The 0.725 that refused this shell for every species with eyes is
 *      an 8-point muzzle boss that stops below the eye card, and the plate the
 *      cards land on is `box-03`'s own 0.625. Proved off the vertices, because
 *      three species files carry the bounding-box refusal as a fact.
 *   2. **The crown is two TRANSVERSE pads, not two side ridges** — ray-cast,
 *      because the vertex list reads the other way and the ears sit on it.
 *   3. **The GIRAFFE's muzzle is a fit and not a preference**: three independent
 *      numbers land on top of each other and none of them was chosen.
 *   4. **The hoof line is the pony's, character for character**, and it is the
 *      ONLY patch on this animal — because the hull bands instead, which is the
 *      thing the donkey and the mule are going to want.
 *
 * And the refusals with the arithmetic that refused them: the lion's mane ring,
 * a second two-tone line, and `belly`.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, HORSE_ASSEMBLY, PONY_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, HULL_BOTTOM_Y, HEIGHT_FLOOR, LEG_ROW,
  OTHER_HULLS, PACK_PUPIL, CARD_STANDOFF, MODEL_TRIS_MAX,
} from '../../src/island/species/parts'
import { partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-horse',
  parts: ['box-01', 'box-14', 'box-38', 'box-41', 'cone-01', 'plate-01', 'tube-07'],
  // The mane and the forelock. JT-041 sanctioned the three base shapes for
  // everybody permanently, so this needs no `flag` and gets none.
  authored: ['bespoke-square-01'],
  height: 1.7566,
  verts: 559,
  tris: 782,
  // The hull is six and a half times the tail, which is the next biggest thing on
  // it. A draught horse is a barrel and everything else is a detail.
  massRatio: 6,
  // Two: the tail turned over and the forelock turned onto the brow chamfer.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-horse')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof HORSE_ASSEMBLY)['features'][number] =>
  HORSE_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, in WORLD terms: origin-centred plus its offset. */
const worldPoints = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([
      p.positions[vi * 3]! + p.offset[0]!,
      p.positions[vi * 3 + 1]! + p.offset[1]!,
      p.positions[vi * 3 + 2]! + p.offset[2]!,
    ])
  }
  return out
}

/** Everything a shell has on one plane, and how far it reaches on the other two. */
const plane = (id: string, axis: 0 | 1 | 2, at: number): {
  n: number; lo: [number, number]; hi: [number, number]
} => {
  const on = worldPoints(id).filter(p => Math.abs(p[axis] - at) < 1e-6)
  const other = ([0, 1, 2] as const).filter(a => a !== axis) as [0 | 1 | 2, 0 | 1 | 2]
  return {
    n: on.length,
    lo: [Math.min(...on.map(p => p[other[0]])), Math.min(...on.map(p => p[other[1]]))],
    hi: [Math.max(...on.map(p => p[other[0]])), Math.max(...on.map(p => p[other[1]]))],
  }
}

/**
 * Ray-cast straight down onto a hull and return the world y of its surface.
 *
 * The vertex list alone gets `box-41`'s crown WRONG — its only points at
 * y = 1.48125 are at |x| = 0.3276, which reads as two side ridges, and the
 * triangles between them are horizontal and span the whole width. The ears are
 * placed on that surface, so it is measured rather than inferred.
 */
const surfaceY = (id: string, x: number, z: number): number => {
  const p: BakedPart = partById(id)!
  const corner = (t: number, k: number): [number, number, number] => {
    const vi = p.indices[t * 3 + k]!
    return [
      p.positions[vi * 3]! + p.offset[0]!,
      p.positions[vi * 3 + 1]! + p.offset[1]!,
      p.positions[vi * 3 + 2]! + p.offset[2]!,
    ]
  }
  let best = -Infinity
  for (let t = 0; t < p.indices.length / 3; t++) {
    const a = corner(t, 0), b = corner(t, 1), c = corner(t, 2)
    const d = (b[2]! - c[2]!) * (a[0]! - c[0]!) + (c[0]! - b[0]!) * (a[2]! - c[2]!)
    if (Math.abs(d) < 1e-12) continue
    const l1 = ((b[2]! - c[2]!) * (x - c[0]!) + (c[0]! - b[0]!) * (z - c[2]!)) / d
    const l2 = ((c[2]! - a[2]!) * (x - c[0]!) + (a[0]! - c[0]!) * (z - c[2]!)) / d
    const l3 = 1 - l1 - l2
    if (l1 < -1e-9 || l2 < -1e-9 || l3 < -1e-9) continue
    const y = l1 * a[1]! + l2 * b[1]! + l3 * c[1]!
    if (y > best) best = y
  }
  return best
}

/* ===================================================================== *
 * 1. `box-41`'s BOUNDING BOX LIES, AND THE PONY'S REFUSAL DOES NOT HOLD
 * ===================================================================== */

describe('animal-horse: the bigger shell, and the refusal that was off a bounding box', () => {
  it('OVERTURNS the 0.725 — it is a muzzle boss and it stops below the eye card', () => {
    // `animal-pony.ts:69-82` refuses this shell because "its front face stands at
    // z = 0.725 ... Both eye cards would sit 0.090 behind that surface", and
    // `animal-degu.ts:138` writes it up as "No species with eyes can wear box-41".
    // Both are `offset[2] + size[2] / 2`. Off the vertices it is not true, and
    // this is the measurement four Farm species need in order to be big.
    const big = partById(OTHER_HULLS.bigger)!
    expect(HORSE_ASSEMBLY.hull.part).toBe('box-41')
    expect(big.offset[2]! + big.size[2]! / 2).toBeCloseTo(0.725, 6)

    // What is ACTUALLY at 0.725: eight points, 0.400 across and 0.400 tall.
    const boss = plane('box-41', 2, 0.725)
    expect(boss.n).toBe(8)
    expect(boss.lo).toEqual([-0.2, 0.49375])
    expect(boss.hi).toEqual([0.2, 0.89375])

    // And the eye card's centre is ABOVE it, so no card is behind anything.
    const card = partById('plate-01')!
    expect(card.offset[1]!).toBeCloseTo(0.933646, 6)
    expect(card.offset[1]! - boss.hi[1]).toBeCloseTo(0.039896, 6)
    expect(card.offset[1]!).toBeGreaterThan(boss.hi[1])
  })

  it('lands its cards on `box-03`\'s own front plate, at the pack\'s own standoff', () => {
    // The plate the cards actually meet is 0.625 — `HULL_FRONT_Z_USUAL`, the cube's
    // own front face — so `EYE_CARD_Z` gives them exactly `CARD_STANDOFF`, which is
    // what it gives on the seven usual hulls. Nothing about the eye is special here.
    const front = plane('box-41', 2, HULL_FRONT_Z_USUAL)
    expect(front.n).toBe(34)
    expect(front.lo).toEqual([-0.3125, 0.49375])
    expect(front.hi).toEqual([0.3125, 1.11875])
    expect(EYE_CARD_Z - HULL_FRONT_Z_USUAL).toBeCloseTo(CARD_STANDOFF, 9)
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [partById('plate-01')!.offset[0], partById('plate-01')!.offset[1], EYE_CARD_Z],
    })
  })

  it('IS `box-03` with its edges filled out — four flat plates, identical', () => {
    // `animal-lovebird.ts:72-98` measured this and this file spends four of them:
    // the front plate (the muzzle), the rear plate (the tail), the top plate (the
    // mane) and the flanks. Re-measured rather than cited, both shells, world.
    for (const [axis, at] of [[2, 0.625], [2, -0.625], [0, 0.625], [1, 1.43125]] as const) {
      const a = plane('box-41', axis, at)
      const b = plane('box-03', axis, at)
      expect(a.lo, `box-41 plane ${axis}=${at}`).toEqual(b.lo)
      expect(a.hi, `box-41 plane ${axis}=${at}`).toEqual(b.hi)
    }
    // Bigger everywhere BETWEEN those plates: 1.213x the cube's volume.
    const big = partById('box-41')!, cube = partById('box-03')!
    expect(big.size.reduce((a, b) => a * b, 1) / cube.size.reduce((a, b) => a * b, 1))
      .toBeCloseTo(1.213, 3)
    // Which the leg row scales out with, so a heavier animal stands wider. That is
    // `creature.ts`'s own 0.27 x (1.35 / 1.25); nothing here tuned it.
    const leg = feature('leg')
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from).toEqual([0.27 * (1.35 / 1.25), LEG_ROW.y, 0.25 * (1.35 / 1.25)])
      expect(leg.placement.from[0]).toBeCloseTo(0.2916, 4)
    }
  })

  it('has a crown of two TRANSVERSE pads, which the vertex list gets wrong', () => {
    // Every point at the crown height is at |x| = 0.3276, which reads as two
    // ridges down the sides. Ray-cast, the shell answers the other way: the pads
    // span the WHOLE width and are split fore-and-aft, with a saddle between them.
    const crown = plane('box-41', 1, 1.48125)
    expect(crown.n).toBe(32)
    expect(crown.lo).toEqual([-0.3276, -0.2575])
    expect(crown.hi).toEqual([0.3276, 0.2575])
    expect(Math.min(...worldPoints('box-41').filter(p => Math.abs(p[1] - 1.48125) < 1e-6)
      .map(p => Math.abs(p[0])))).toBeCloseTo(0.3276, 4)

    // The front pad, across the midline and out to the pad's own edge.
    for (const x of [0, 0.2276, 0.3125, 0.3276]) {
      expect(surfaceY('box-41', x, 0.25), `crown at x=${x}`).toBeCloseTo(1.48125, 5)
    }
    // The saddle between them, and it is the flat top plate exactly.
    expect(surfaceY('box-41', 0, 0)).toBeCloseTo(1.43125, 5)
    expect(surfaceY('box-41', 0, -0.25)).toBeCloseTo(1.48125, 5)
    // 0.050 proud, which is the whole of this shell's extra height over the cube.
    expect(1.48125 - HEIGHT_FLOOR).toBeCloseTo(0.05, 6)
  })
})

/* ===================================================================== *
 * 2. JT-044 — THE LINE THE OTHER FOUR HOOVED SPECIES COPY
 * ===================================================================== */

describe('animal-horse: the hoof is the pony\'s line, and it is the ONLY patch', () => {
  it('IS THE PATCH LINE, verbatim — deep-equalled against the pony\'s own', () => {
    // The derivation is `assembly-pony.test.ts:127-165` and is a measurement off
    // `box-01`, not a taste about an animal. So the exemplar's job is to prove it
    // was copied and not retuned, which is this: the two objects are the same.
    expect(feature('leg').paint).toEqual({ base: 'limb', patch: { below: 'hoof', at: 0.25 } })
    expect(feature('leg').paint).toEqual(PONY_ASSEMBLY.features.find(f => f.name === 'leg')!.paint)
    expect(feature('leg').paint.patch!.at).toBe(4 / 16)
    // Five slots against the pony's six, pinned in order because insertion order
    // IS the texture layout and moving a slot moves a cell.
    expect(Object.keys(HORSE_ASSEMBLY.palette)).toEqual(['coat', 'pale', 'limb', 'hoof', 'pupil'])
    expect(HORSE_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
    // And the contrast across the line is the reason the palette went golden: the
    // shank is lighter than the coat's own mid grey and the foot is much darker.
    const grey = (c: number): number => ((c >> 16) & 255) * 0.299 + ((c >> 8) & 255) * 0.587 + (c & 255) * 0.114
    expect(grey(HORSE_ASSEMBLY.palette['limb']!) - grey(HORSE_ASSEMBLY.palette['hoof']!))
      .toBeGreaterThan(60)
  })

  it('patches ONCE, because the hull BANDS instead — and the two cannot mix', () => {
    // JT-044's second constraint: a triangle a `byBand` has already redirected
    // keeps its flat colour, so `patch` and `byBand` on one part means half of it
    // silently ignores the line. Asserted over the hull and every feature.
    for (const p of [HORSE_ASSEMBLY.hull.paint, ...HORSE_ASSEMBLY.features.map(f => f.paint)]) {
      expect(p.patch === undefined || p.byBand === undefined,
        `${p.base} carries a patch and a byBand at once`).toBe(true)
    }
    // The pony patches `limb` and `coat`; this animal patches `limb` and nothing
    // else, because the belly is a BAND. So "one cell, one picture"
    // (`assembly.ts:487-501`) cannot fire here however many siblings copy it.
    const patched = [HORSE_ASSEMBLY.hull.paint, ...HORSE_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.patch).map(p => p.base)
    expect(patched).toEqual(['limb'])
    // And the legs are not spun, so the boundary is level by construction.
    expect(feature('leg').spin).toBeUndefined()
  })

  it('REFUSES a second two-tone line, and the refusal is the animal and not the tool', () => {
    // The natural second use is a bay's black point, and this horse is not a bay
    // — `animal-pony` already is one, coat `0x9a5f33` with `mane` `0x33281f` on
    // its mane, tail and nose, and a bay horse beside a bay pony is one animal at
    // two sizes. A flaxen chestnut's leg carries no boundary above the coronet, so
    // any second ring the tool can draw is a marking this animal does not have.
    // The ferret declined for the same reason; the digest is explicit that
    // declining is a right answer.
    expect(PONY_ASSEMBLY.palette['coat']).toBe(0x9a5f33)
    expect(HORSE_ASSEMBLY.palette['coat']).not.toBe(PONY_ASSEMBLY.palette['coat'])
    // Inverted at the two places a child looks: the pony's points are near-black
    // and this horse's mane and tail are cream.
    for (const n of ['mane', 'forelock', 'tail']) expect(feature(n).paint.base).toBe('pale')
    expect(HORSE_ASSEMBLY.palette['pale']!).toBeGreaterThan(0xe00000)
    expect(PONY_ASSEMBLY.palette['mane']!).toBeLessThan(0x400000)
  })
})

/* ===================================================================== *
 * 3. THE BELLY IS A BAND, AND THE MUZZLE IS A FIT
 * ===================================================================== */

describe('animal-horse: band 3 is the underline AND the muzzle, in one entry', () => {
  it('paints Kenney\'s own cut rather than a horizontal this species drew', () => {
    expect(HORSE_ASSEMBLY.hull.paint).toEqual({ base: 'coat', byBand: { 3: 'pale' } })
    // Band 3 reaches the muzzle boss, which is the half a `belly` line cannot do:
    // `belly` paints at a fraction of the hull's HEIGHT, and this animal's pale is
    // in front of it as well as under it.
    const p = partById('box-41')!
    const extent = (band: number): { y: [number, number]; z: [number, number] } => {
      const ys: number[] = [], zs: number[] = []
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) {
          const vi = p.indices[t * 3 + k]!
          ys.push(p.positions[vi * 3 + 1]! + p.offset[1]!)
          zs.push(p.positions[vi * 3 + 2]! + p.offset[2]!)
        }
      }
      return { y: [Math.min(...ys), Math.max(...ys)], z: [Math.min(...zs), Math.max(...zs)] }
    }
    const b3 = extent(3)
    expect(b3.y[0]).toBeCloseTo(HULL_BOTTOM_Y, 5)      // the underline, from the belly
    expect(b3.z[1]).toBeCloseTo(0.725, 5)              // ...and out to the muzzle's tip
    expect(b3.y[1]).toBeCloseTo(0.89375, 5)            // stopping at the boss's own top
    // Three bands and this animal redirects exactly one of them; the other two are
    // the coat. Rule 8's one-flat-colour, spent where it buys something.
    expect([...new Set(p.bands)].sort((a, b) => a - b)).toEqual([3, 7, 15])
    expect(Object.keys(HORSE_ASSEMBLY.hull.paint.byBand!)).toEqual(['3'])
  })

  it('has NO `belly`, and could not have had one alongside the band', () => {
    // `creature.ts:585-587` turns `belly` into a `patch` on this same paint, so
    // asking for both is asking one part to carry a patch and a byBand at once.
    expect(HORSE_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(HORSE_ASSEMBLY.palette['belly']).toBeUndefined()
    // The pale slot is named as `under` instead, so the eye cards' sclera still
    // gets it — that is the only job `belly` was doing that the band does not.
    expect(feature('eye').paint.base).toBe('pale')
  })
})

describe('animal-horse: the giraffe\'s muzzle, and three numbers that were not chosen', () => {
  it('is sunk exactly the depth of the boss it sits on', () => {
    // The bank holds three 0.532-wide barrels and they are the same box.
    // `tube-07` is the only one the pack ever SANK, and its burial is 0.100000 —
    // which is how far `box-41`'s muzzle boss stands proud of the 0.625 plate.
    const giraffe = partById('tube-07')!, fox = partById('tube-06')!, deer = partById('tube-03')!
    expect(giraffe.size[0]).toBe(fox.size[0])
    expect(fox.size).toEqual(deer.size)
    expect(giraffe.attachment!.sunkFractionMean * giraffe.size[2]!).toBeCloseTo(0.1, 6)
    expect(fox.attachment!.sunkFractionMean).toBe(0)
    expect(deer.attachment!.sunkFractionMean).toBe(0)
    expect(0.725 - HULL_FRONT_Z_USUAL).toBeCloseTo(0.1, 9)
    // So the muzzle's rear face lands ON the 0.625 plate. Measured on the build.
    const g = build()
    const s = new THREE.Box3().setFromObject(g.getObjectByName('snout')!)
    expect(s.min.z).toBeCloseTo(HULL_FRONT_Z_USUAL, 4)
    // ...whose |x| <= 0.3125 covers the muzzle's own 0.266 half-width with 0.046
    // to spare, where the boss's 0.200 would have left 0.066 a side of daylight.
    expect(0.3125 - giraffe.size[0]! / 2).toBeCloseTo(0.0465, 4)
    expect(giraffe.size[0]! / 2 - 0.2).toBeCloseTo(0.066, 3)
    expect(feature('snout').part).toBe('tube-07')
    expect(HORSE_ASSEMBLY.features.some(f => f.part === 'tube-06')).toBe(false)
  })

  it('lands its top edge on the boss\'s own top edge, and nothing said so', () => {
    // Both are Kenney's ungulate face height and they were never compared: the
    // giraffe's recorded centre plus half its own 0.300 is the tiger's boss top.
    const giraffe = partById('tube-07')!
    expect(giraffe.offset[1]! + giraffe.size[1]! / 2).toBeCloseTo(0.89375, 6)
    const g = build()
    expect(new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.y)
      .toBeCloseTo(0.89375, 4)
    // Every field solved: no `at`, no `sink`, no `stretch` on the muzzle.
    expect(feature('snout').stretch).toBeUndefined()
    expect(feature('snout').sink).toBe(giraffe.attachment!.sunkFractionMean)
    const sp = feature('snout').placement
    expect(sp.kind).toBe('single')
    if (sp.kind === 'single') {
      expect(sp.at[0]).toBe(0)
      expect(sp.at[1]).toBe(giraffe.offset[1])
      expect(sp.at[2]).toBeCloseTo(0.725, 9)
    }
    // And the nose hangs off the muzzle's own placed plane rather than off an
    // arithmetic this file would keep a stale copy of.
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    expect((g.getObjectByName('nose')!.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    expect(feature('nose').paint.base).toBe('hoof')   // horn and muzzle skin, one dark
  })
})

/* ===================================================================== *
 * 4. THE EARS, THE CREST AND THE TAIL
 * ===================================================================== */

describe('animal-horse: the ear is the pony\'s, and only its z is chosen', () => {
  it('recovers the x and the y and moves only the z, which the crown demands', () => {
    const ear = partById('cone-01')!
    const at = feature('ear').placement
    if (at.kind === 'pair') {
      expect(at.at[0]).toBeCloseTo(ear.offset[0]!, 4)   // the bee's own x, and the pony's
      expect(at.at[1]).toBe(1.48125)                    // `frame.top`: the solve's own y
      expect(at.at[2]).toBe(4 / 16)                     // on the pack's grid
      // Inside the FRONT pad's own z span, with 0.0075 to spare.
      expect(at.at[2]).toBeLessThan(0.2575)
      expect(at.at[2]).toBeGreaterThan(0.1383)
    }
    // The solved z is refused, and this is the number that refuses it: that far
    // back the crown has fallen below the ear's own underside.
    // The join less the shape's own recorded burial of 0.125, which is §3's floor.
    const underside = 1.48125 - ear.attachment!.sunkUnitsMean
    expect(underside).toBeCloseTo(1.35625, 6)
    expect(surfaceY('box-41', ear.offset[0]!, ear.offset[2]!)).toBeCloseTo(1.326444, 5)
    expect(underside - surfaceY('box-41', ear.offset[0]!, ear.offset[2]!)).toBeCloseTo(0.029806, 5)
    expect(feature('ear').stretch).toEqual([2, 1, 1])
  })

  it('is BETTER SEATED than the shipped pony\'s, measured vertex by vertex', () => {
    // §3 is "nothing floats" and the honest way to say it is a count. Twenty of
    // `cone-01`'s 68 points sit below the join plane and are the ones that must be
    // inside the mass; ray-cast the hull under each. The pony's own ear on the
    // cube shows 0.038 of daylight at its worst corner and ships that way.
    const ear = partById('cone-01')!
    const daylight = (hull: string, join: number, cx: number, cz: number): number => {
      const cy = join + ear.size[1]! / 2 - ear.attachment!.sunkUnitsMean
      let worst = 0
      for (const vi of new Set(ear.indices)) {
        const y = cy + ear.positions[vi * 3 + 1]!
        if (y >= join - 1e-9) continue
        const gap = y - surfaceY(hull, cx + ear.positions[vi * 3]! * 2, cz + ear.positions[vi * 3 + 2]!)
        if (gap > worst) worst = gap
      }
      return worst
    }
    expect(daylight('box-03', HEIGHT_FLOOR, 0.2276, 0.25)).toBeCloseTo(0.03814, 4)
    expect(daylight('box-41', 1.48125, 0.2276, 0.25)).toBeCloseTo(0.02805, 4)
    expect(daylight('box-41', 1.48125, 0.2276, 0.25))
      .toBeLessThan(daylight('box-03', HEIGHT_FLOOR, 0.2276, 0.25))
    // And the alternative that is recorded in the header and deliberately NOT
    // taken: joined at the flat top plate the front pad closes the gap entirely,
    // and the animal loses the 0.050 the bigger shell bought and lands on the
    // pony's own height. A sibling that wants the perfect seat knows the number.
    expect(daylight('box-41', HEIGHT_FLOOR, 0.2276, 0.25)).toBe(0)
    const g = build()
    const top = (n: string): number => new THREE.Box3().setFromObject(g.getObjectByName(n)!).max.y
    expect(top('ear-r')).toBeCloseTo(1.7566, 3)
    expect(top('ear-r') - 0.05).toBeCloseTo(1.7066, 3)   // the pony's height, exactly
    expect(top('mane')).toBeLessThan(top('ear-r'))
    expect(top('forelock')).toBeLessThan(top('mane'))
  })
})

describe('animal-horse: the crest, and the tail whose number did not have to move', () => {
  it('runs the top plate\'s own length and is MODULATED by the two crown pads', () => {
    const g = build()
    const m = new THREE.Box3().setFromObject(g.getObjectByName('mane')!)
    // 0.625 of run, which is the flat top plate's own — the crest ends where the
    // body's flat back does, on this shell and on the cube alike.
    expect(m.max.z - m.min.z).toBeCloseTo(0.625, 4)
    expect(m.min.z).toBeCloseTo(-0.3125, 4)
    // 0.1875 thick — 3/16, and 1.5x the pony's 0.125. The one dimension in which
    // "draught" is sayable, since a hull is never scaled.
    const ponyMane = new THREE.Box3().setFromObject(
      (() => { const p = buildAssembled('animal-pony'); p.updateMatrixWorld(true); return p })()
        .getObjectByName('mane')!,
    )
    expect(m.max.x - m.min.x).toBeCloseTo(0.1875, 4)
    expect((m.max.x - m.min.x) / (ponyMane.max.x - ponyMane.min.x)).toBeCloseTo(1.5, 3)
    // Joined at the top plate and half-buried at the primitive's declared sink, so
    // 0.250 proud over the saddle and 0.200 where it rides each pad.
    expect(m.max.y - HEIGHT_FLOOR).toBeCloseTo(0.25, 4)
    expect(m.max.y - surfaceY('box-41', 0, 0)).toBeCloseTo(0.25, 4)
    expect(m.max.y - surfaceY('box-41', 0, 0.25)).toBeCloseTo(0.2, 4)
  })

  it('hangs the forelock on a chord NEITHER shell\'s surface passes through', () => {
    // `box-41` runs its front-top chamfer between the same two flat plates as
    // `box-03`, so §8's chord midpoint and its 45-degree normal transfer whole.
    expect(feature('forelock').spin).toEqual([{ axis: 'x', deg: 45 }])
    const at = feature('forelock').placement
    if (at.kind === 'single') expect(at.at).toEqual([0, 1.275, 0.46875])
    // But the surface is cut in TWO steps, not one, so it stands proud of that
    // chord — on both shells, by the same amount. That is why a part joined at the
    // midpoint is embedded by construction, and it is a correction to the pony:
    // its forelock is 15% less proud than `animal-pony.ts:147-154` reads.
    for (const hull of ['box-41', 'box-03']) {
      expect(surfaceY(hull, 0, 0.46875), hull).toBeCloseTo(1.327083, 5)
      expect(surfaceY(hull, 0, 0.5), hull).toBeCloseTo(1.30625, 5)
    }
    const alongNormal = 0.052083 * Math.cos(Math.PI / 4)
    expect(alongNormal).toBeCloseTo(0.036828, 5)
    // Cut 0.625 along its own normal against the pony's 0.500 to pay for it.
    expect(feature('forelock').stretch).toEqual([0.3, 0.5, 0.12])
    expect(0.625 / 2 - alongNormal).toBeCloseTo(0.2757, 4)
    expect(0.500 / 2 - alongNormal).toBeCloseTo(0.2132, 4)
    const g = build()
    const f = new THREE.Box3().setFromObject(g.getObjectByName('forelock')!)
    expect(f.max.y).toBeGreaterThan(HEIGHT_FLOOR)
    expect(f.max.z).toBeGreaterThan(HULL_FRONT_Z_USUAL - 0.1)
  })

  it('solves the tail off the rear plate and gets the PONY\'S number back', () => {
    // The cleanest demonstration in this species that `box-41`'s flat faces are
    // the cube's. The join is the flat rear face's top less the fan's own half
    // height, solved on THIS hull — and it comes out where the pony's is, because
    // both shells stop that face at 1.11875.
    const fan = partById('box-38')!
    const rear = plane('box-41', 2, -0.625)
    expect(rear.hi[1]).toBeCloseTo(1.11875, 6)
    expect(plane('box-03', 2, -0.625).hi[1]).toBeCloseTo(rear.hi[1], 9)
    const at = feature('tail').placement
    const pony = PONY_ASSEMBLY.features.find(f => f.name === 'tail')!.placement
    if (at.kind === 'single' && pony.kind === 'single') {
      expect(at.at[1]! + fan.size[1]! / 2).toBeCloseTo(rear.hi[1], 5)
      expect(at.at[1]).toBeCloseTo(pony.at[1]!, 5)
      expect(at.at[2]).toBe(-HULL_FRONT_Z_USUAL)
    }
    expect(feature('tail').spin).toEqual([{ axis: 'z', deg: 180 }])
    // It falls the whole depth of the barrel, stops short of the belly and never
    // breaks the back line.
    const t = new THREE.Box3().setFromObject(build().getObjectByName('tail')!)
    expect(t.max.y).toBeCloseTo(1.11875, 3)
    expect(t.min.y).toBeGreaterThan(HULL_BOTTOM_Y)
    expect(t.max.y).toBeLessThan(HEIGHT_FLOOR)
  })
})

/* ===================================================================== *
 * 5. WHAT WAS REFUSED, AND WHAT THE ISLAND CHARGES
 * ===================================================================== */

describe('animal-horse: the refusals, each with the number that refused it', () => {
  it('REFUSES `box-29`, the lion\'s mane ring, on where it lands', () => {
    // It is the only band-role shape big enough to be a mane and it is a RING.
    // At its own recorded centre it passes 0.100 BELOW this animal's underline and
    // within 0.081 of the floor its feet stand on, and stands 0.150 proud of the
    // widest flank pad on both sides at once. A horse's mane is on the top line.
    const ring = partById('box-29')!
    expect(ring.size).toEqual([1.65, 1.65, 0.5])
    const lo = ring.offset[1]! - ring.size[1]! / 2
    expect(lo).toBeCloseTo(0.08125, 6)
    expect(HULL_BOTTOM_Y - lo).toBeCloseTo(0.1, 6)
    expect(ring.size[0]! / 2 - partById('box-41')!.size[0]! / 2).toBeCloseTo(0.15, 6)
    expect(ring.provenance.map(q => q.species)).toContain('lion')
    expect(HORSE_ASSEMBLY.features.some(f => f.part === 'box-29')).toBe(false)
  })

  it('leaves `box-12` for the bovines and `box-06` for the donkey', () => {
    // The cow's shell: its extra 0.289 of width is two fused EAR LUGS on a 1.250
    // cube, so an equid wearing it is four ears or no upright ears. The rabbit's
    // ear the pony refused for reading as "a donkey's silhouette" is exactly what
    // the donkey and the mule are going to want, so it is left alone here too.
    const wide = partById(OTHER_HULLS.wider)!
    expect(wide.size[0]!).toBeGreaterThan(1.5)
    const body = worldPoints('box-12').filter(q => Math.abs(q[2]!) <= 0.3125)
    expect(Math.max(...body.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.625, 6)
    expect(HORSE_ASSEMBLY.hull.part).not.toBe(OTHER_HULLS.wider)
    expect(HORSE_ASSEMBLY.features.some(f => f.part === 'box-06' || f.part === 'box-07')).toBe(false)
    // And no card anywhere: the mouth solve lands at 0.635 and this muzzle reaches
    // 0.891, which is `assembly-pony.test.ts:556-575`'s finding made worse.
    const front = new THREE.Box3().setFromObject(build().getObjectByName('snout')!).max.z
    expect(front).toBeCloseTo(0.891, 3)
    expect(EYE_CARD_Z).toBeLessThan(front - 0.25)
    for (const f of HORSE_ASSEMBLY.features) {
      expect(partById(f.part)?.roles.includes('card') ?? false, `${f.name} is a card`).toBe(false)
    }
  })

  it('pays for the bigger shell once, and fits between two trees', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // The barrel is 1.35 across and the muzzle and the tail make the depth, which
    // is what `pets.ts:652` charges keep-out from. Inside the fox's own 1.15.
    expect(s.x).toBeCloseTo(1.35, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.0556, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    // 262 of the 782 triangles are the hull itself — 4.37x the cube's 60, and the
    // whole price of this species' size. Paid once, and inside the budget.
    expect(partById('box-41')!.tris).toBe(262)
    expect(partById('box-41')!.tris / partById('box-03')!.tris).toBeCloseTo(4.37, 2)
    expect(782).toBeLessThan(MODEL_TRIS_MAX)
    // It swishes and it flicks, and nothing is flagged.
    expect(HORSE_ASSEMBLY.motion?.map(m => `${m.kind}:${m.parts.join()}`))
      .toEqual(['wag:tail', 'twitch:ear'])
    expect(HORSE_ASSEMBLY.flag).toBeUndefined()
  })
})
