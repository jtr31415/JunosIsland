/**
 * The ox — Farm's heavy bovine, and the first animal in the pack to wear a HORN.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`, and JT-044's mechanism is pinned once and for all in
 * `assembly-pony.test.ts:87-283`. **Neither is repeated here.** This file pins
 * the four things that are this species' own:
 *
 *   1. **`box-12`'s extra width is TWO EAR LUGS, so an ox has no ear feature** —
 *      the fact that qualifies a bovine for the shell that disqualifies an equid.
 *   2. **The HORN out of the elephant's tusk**: that no uniform scale of it can
 *      read as a horn, that its root is wholly inside the mass with no daylight,
 *      and that it costs no keep-out.
 *   3. **The muzzle's top edge and the eye card's bottom edge**, 0.000208 apart,
 *      from two derivations that never met.
 *   4. **The switch patch lands in a GAP in `box-18`'s own vertex rings**, so the
 *      boundary crosses no face.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, OX_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, HEIGHT_FLOOR, OTHER_HULLS, MODEL_TRIS_MAX,
} from '../../src/island/species/parts'
import { partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-ox',
  parts: ['box-01', 'box-12', 'box-18', 'box-24', 'plate-01', 'wedge-11'],
  height: 1.529948,
  verts: 422,
  tris: 610,
  // The widest shell in the pack against the tail, the next biggest thing on it.
  massRatio: 8,
  // Two: the trunk turned round to face backwards, and the tusk turned out and up.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-ox')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof OX_ASSEMBLY)['features'][number] =>
  OX_ASSEMBLY.features.find(f => f.name === name)!

/**
 * One feature's join point, narrowed.
 *
 * `Placement` is a union and a `row` has no `at`. THROWING rather than guarding
 * with an `if` is deliberate: an `if (p.kind === 'single')` that stops matching
 * silently skips every assertion inside it, which is the one way a pinning test
 * can go green by doing nothing.
 */
const placedAt = (name: string): readonly [number, number, number] => {
  const p = feature(name).placement
  if (p.kind === 'row') throw new Error(`"${name}" is a leg row, not a placed part`)
  return p.at
}

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

/** Turn one vector by a spin list — re-implemented, deliberately (see `spinVec`). */
const turn = (
  v: [number, number, number], spins: readonly { axis: 'x' | 'y' | 'z'; deg: number }[],
): [number, number, number] => spins.reduce<[number, number, number]>((p, s) => {
  const a = s.deg * Math.PI / 180, c = Math.cos(a), n = Math.sin(a)
  const [x, y, z] = p
  if (s.axis === 'x') return [x, y * c - z * n, y * n + z * c]
  if (s.axis === 'y') return [x * c + z * n, y, -x * n + z * c]
  return [x * c - y * n, x * n + y * c, z]
}, v)

/** Is a world point inside a bank shell? Odd crossings of a fixed ray. */
const insideShell = (id: string, pt: [number, number, number]): boolean => {
  const p: BakedPart = partById(id)!
  const at = (vi: number): [number, number, number] => [
    p.positions[vi * 3]! + p.offset[0]!,
    p.positions[vi * 3 + 1]! + p.offset[1]!,
    p.positions[vi * 3 + 2]! + p.offset[2]!,
  ]
  /* An irrational-ish direction, so no ray ever runs along an edge. */
  const d: [number, number, number] = [0.7071067, 0.3141592, 0.6180339]
  let hits = 0
  for (let t = 0; t < p.indices.length / 3; t++) {
    const a = at(p.indices[t * 3]!), b = at(p.indices[t * 3 + 1]!), c = at(p.indices[t * 3 + 2]!)
    const e1: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const e2: [number, number, number] = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    const pv: [number, number, number] = [
      d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0],
    ]
    const det = e1[0] * pv[0] + e1[1] * pv[1] + e1[2] * pv[2]
    if (Math.abs(det) < 1e-12) continue
    const inv = 1 / det
    const tv: [number, number, number] = [pt[0] - a[0], pt[1] - a[1], pt[2] - a[2]]
    const u = (tv[0] * pv[0] + tv[1] * pv[1] + tv[2] * pv[2]) * inv
    if (u < 0 || u > 1) continue
    const qv: [number, number, number] = [
      tv[1] * e1[2] - tv[2] * e1[1], tv[2] * e1[0] - tv[0] * e1[2], tv[0] * e1[1] - tv[1] * e1[0],
    ]
    const v = (d[0] * qv[0] + d[1] * qv[1] + d[2] * qv[2]) * inv
    if (v < 0 || u + v > 1) continue
    if ((e2[0] * qv[0] + e2[1] * qv[1] + e2[2] * qv[2]) * inv > 1e-9) hits++
  }
  return hits % 2 === 1
}

/* ===================================================================== *
 * 1. THE SHELL, AND WHY AN OX HAS NO EAR FEATURE
 * ===================================================================== */

describe('animal-ox: the hull the horse left, and the ears that are already in it', () => {
  it('is on `box-12`, the cow\'s and the deer\'s own shell', () => {
    expect(OX_ASSEMBLY.hull.part).toBe(OTHER_HULLS.wider)
    expect(partById('box-12')!.provenance.map(p => p.species).sort()).toEqual(['cow', 'deer'])
  })

  it('has NO ear feature, because the shell\'s extra width IS two ear lugs', () => {
    expect(OX_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)

    /* The torso is the 1.250 cube to the millimetre and all 0.289 of the extra
     * width is 15 points a side, high and forward, exactly where a cow wears its
     * ears. `animal-horse.ts:282` refuses this shell for that; an ox wants it. */
    const lug = worldPoints('box-12').filter(p => Math.abs(p[0]) > 0.6251)
    expect(lug).toHaveLength(30)
    expect(Math.max(...lug.map(p => Math.abs(p[0])))).toBeCloseTo(0.7697, 6)
    expect(Math.min(...lug.map(p => p[1]))).toBeCloseTo(1.17705, 5)
    expect(Math.max(...lug.map(p => p[1]))).toBeCloseTo(1.35375, 5)
    expect(Math.min(...lug.map(p => p[2]))).toBeCloseTo(0.35, 6)
    expect(Math.max(...lug.map(p => p[2]))).toBeCloseTo(0.5, 6)

    /* Everything NOT on a lug is inside the cube's own half-width. */
    const body = worldPoints('box-12').filter(p => Math.abs(p[0]) <= 0.6251)
    expect(Math.max(...body.map(p => Math.abs(p[0])))).toBeCloseTo(0.625, 6)
  })

  it('shades those lugs with Kenney\'s own band-5 inner-ear cut, and nothing else', () => {
    expect(OX_ASSEMBLY.hull.paint).toEqual({ base: 'coat', byBand: { 5: 'limb' } })

    /* Band 5 is 12 triangles and every one of them is on a lug's forward face. */
    const p = partById('box-12')!
    const band5 = [...p.bands.keys()].filter(t => p.bands[t] === 5)
    expect(band5).toHaveLength(12)
    for (const t of band5) {
      for (let k = 0; k < 3; k++) {
        const vi = p.indices[t * 3 + k]!
        expect(Math.abs(p.positions[vi * 3]! + p.offset[0]!)).toBeGreaterThan(0.4)
        expect(p.positions[vi * 3 + 2]! + p.offset[2]!).toBeCloseTo(0.5, 6)
      }
    }
  })

  it('has no belly line, because a pale underside would be a MARKING', () => {
    /* The whole separation from the frozen `animal-cow`: a cow's colour is a map
     * and this animal's is one colour with three dark ends. */
    expect(OX_ASSEMBLY.hull.paint.patch).toBeUndefined()
  })
})

/* ===================================================================== *
 * 2. THE HORN — the bank has none, so this is the elephant's TUSK
 * ===================================================================== */

describe('animal-ox: a horn out of a tusk, and the two numbers that are forced', () => {
  const HORN = 'wedge-11'
  const SINK = partById(HORN)!.attachment!.sunkFractionMean
  const STRETCH: [number, number, number] = [1.125, 1.125, 1.5]
  const SPINS = [{ axis: 'y', deg: 90 }, { axis: 'z', deg: 45 }] as const

  it('wears the elephant\'s tusk as a PAIR, so `wedge-12` is never reached for', () => {
    const f = feature('horn')
    expect(f.part).toBe(HORN)
    expect(f.placement.kind).toBe('pair')
    expect(partById(HORN)!.roles).toEqual(['tooth'])
    expect(partById(HORN)!.provenance[0]!.species).toBe('elephant')
    /* Handed: `kind: 'pair'` mirrors the right-hand copy into the left. */
    expect(partById(HORN)!.shape.symmetry).toBe('handed')
    expect(OX_ASSEMBLY.features.some(f2 => f2.part === 'wedge-12')).toBe(false)
  })

  it('CANNOT be a horn at any uniform scale — the ratio is fixed at 0.8999', () => {
    const p = partById(HORN)!
    const proud = p.size[2]! * (1 - SINK)
    /* Scale-invariant: the visible length over the base thickness. */
    expect(proud / p.size[0]!).toBeCloseTo(0.899893, 6)
    expect(proud / p.size[0]!).toBeLessThan(1)
    /* So the stretch has to be non-uniform, and z must beat x by this much. */
    expect(p.size[0]! / proud).toBeCloseTo(1.111244, 6)
    expect(STRETCH[2] / STRETCH[0]).toBeGreaterThan(1.111244)
  })

  it('is stretched 18/16 and 24/16, and the second clears the bar the hull sets', () => {
    expect(feature('horn').stretch).toEqual(STRETCH)
    /* Both on the pack's own 1/16 grid. */
    expect(STRETCH[0] * 16).toBe(18)
    expect(STRETCH[2] * 16).toBe(24)

    const p = partById(HORN)!
    /* The bevel's chord is the cube's: (0.625, 0.3125) to (0.3125, 0.625). */
    const chord = Math.hypot(0.3125, 0.3125)
    expect(chord).toBeCloseTo(0.441942, 6)
    const base = p.size[0]! * STRETCH[0]
    expect(base).toBeCloseTo(0.347287, 6)
    expect(base / chord).toBeCloseTo(0.785821, 5)

    /* The shell's real surface stands 0.044195 proud of that chord, so the bar
     * for "longer than it is thick" is that much higher than the naive one. */
    const BULGE = 0.044195
    const minZ = (base + BULGE) / (p.size[2]! * (1 - SINK))
    expect(minZ).toBeCloseTo(1.40924, 5)
    expect(STRETCH[2]).toBeGreaterThan(minZ)
    /* 23/16 also clears it; 24/16 is taken for the margin, and shows: */
    const visible = p.size[2]! * STRETCH[2] * (1 - SINK) - BULGE
    expect(visible).toBeCloseTo(0.3725, 5)
    expect(visible / base).toBeCloseTo(1.0726, 4)
  })

  it('joins the top-side bevel\'s chord midpoint, which is the horse\'s brow chord', () => {
    const f = feature('horn')
    expect(placedAt('horn')[0]).toBeCloseTo(0.46875, 9)
    expect(placedAt('horn')[1]).toBeCloseTo(1.275, 9)
    expect(placedAt('horn')[2]).toBeCloseTo(0.125, 9)
    expect(f.spin).toEqual(SPINS)
    /* Sideways first, then up: the facing is the chord's own 45-degree normal. */
    const facing = turn([0, 0, 1], SPINS)
    expect(facing[0]).toBeCloseTo(Math.SQRT1_2, 9)
    expect(facing[1]).toBeCloseTo(Math.SQRT1_2, 9)
    expect(facing[2]).toBeCloseTo(0, 9)
  })

  it('has its whole root inside the mass, with NO daylight', () => {
    const p = partById(HORN)!
    const facing = turn([0, 0, 1], SPINS)
    const at: [number, number, number] = [0.46875, 1.275, 0.125]
    const pts = [...new Set(p.indices)].map(vi => turn([
      p.positions[vi * 3]! * STRETCH[0],
      p.positions[vi * 3 + 1]! * STRETCH[1],
      p.positions[vi * 3 + 2]! * STRETCH[2],
    ], SPINS))
    const along = (q: readonly number[]): number =>
      q[0]! * facing[0] + q[1]! * facing[1] + q[2]! * facing[2]
    const lo = Math.min(...pts.map(along)), hi = Math.max(...pts.map(along))
    const shift = -lo - SINK * (hi - lo)
    const world = pts.map((q): [number, number, number] => [
      q[0] + at[0] + facing[0] * shift,
      q[1] + at[1] + facing[1] * shift,
      q[2] + at[2] + facing[2] * shift,
    ])
    const d0 = along(at)
    const root = world.filter(q => along(q) < d0 - 1e-9)
    expect(root.length).toBeGreaterThan(0)
    expect(root.filter(q => !insideShell('box-12', q))).toEqual([])

    /* Its z footprint stays inside the bevel's own +-0.3125 — which is what makes
     * 2/16 the largest grid station it could have been sited at. */
    expect(Math.min(...world.map(q => q[2]))).toBeGreaterThan(-0.3125)
    expect(Math.max(...world.map(q => q[2]))).toBeLessThan(0.3125)
    expect(0.1875 + (Math.max(...world.map(q => q[2])) - 0.125)).toBeGreaterThan(0.3125)

    /* And it misses the ear lugs entirely: nothing of it is in their box. */
    expect(world.filter(q => q[0] > 0.625 && q[1] > 1.17705 && q[1] < 1.35375 && q[2] > 0.35))
      .toEqual([])
  })

  it('sets the width but costs no keep-out, because the depth is bigger', () => {
    const g = build()
    const box = new THREE.Box3().setFromObject(g)
    const width = box.max.x - box.min.x
    const depth = box.max.z - box.min.z
    /* The horns reach past the ear lugs' 1.539484 — this is the widest animal in
     * the pack — and the depth still wins, so `max(width, depth) / 2` is unmoved. */
    expect(width).toBeGreaterThan(1.539484)
    expect(width).toBeCloseTo(1.6915, 3)
    expect(depth).toBeGreaterThan(width)
    expect(Math.max(width, depth) / 2).toBeLessThan(1.15)
  })

  it('cannot be dark-tipped, because `patch` paints BELOW the line', () => {
    /* The horn's low end is its ROOT, so the only two-tone the tool can draw on
     * it is a dark base under a pale tip — the inverse of every real horn.
     * Recorded as refused so the water buffalo and the goat do not try it. */
    expect(feature('horn').paint).toEqual({ base: 'pale' })
    expect(feature('horn').paint.patch).toBeUndefined()
  })
})

/* ===================================================================== *
 * 3. THE MUZZLE — two derivations that never met, 0.000104 apart
 * ===================================================================== */

describe('animal-ox: the muzzle fills the face below the eyes and stops there', () => {
  it('is the hog\'s nose-tip worn as a whole muzzle, and there is no `nose`', () => {
    const f = feature('snout')
    expect(f.part).toBe('box-24')
    expect(partById('box-24')!.roles).toEqual(['nose'])
    expect(partById('box-24')!.provenance[0]!.species).toBe('hog')
    expect(OX_ASSEMBLY.features.some(f2 => f2.name === 'nose')).toBe(false)
    /* Bare slate skin, not hair — the same dark as the hooves. */
    expect(f.paint).toEqual({ base: 'hoof' })
  })

  it('is as broad as the flat front plate allows, less 0.0125 a side', () => {
    const f = feature('snout')
    expect(f.stretch).toEqual([1.5, 0.7, 1])
    const width = partById('box-24')!.size[0]! * 1.5
    expect(width).toBeCloseTo(0.6, 9)
    /* The plate is |x| <= 0.3125 on this shell, exactly as on `box-03`. */
    expect((0.625 - width) / 2).toBeCloseTo(0.0125, 9)
    /* Zero measured burial, so all 0.200 of it stands proud of the front plate. */
    expect(partById('box-24')!.attachment!.sunkFractionMean).toBe(0)
    expect(placedAt('snout')[2]).toBe(HULL_FRONT_Z_USUAL)
  })

  it('sits on the plate\'s bottom edge and crosses the eye card by 0.000208', () => {
    const half = partById('box-24')!.size[1]! * 0.7 / 2
    expect(half).toBeCloseTo(0.14, 9)
    /* The flat front plate starts at 0.49375 — the cube's own number. `box-24`
     * has zero measured burial, so its whole join cross-section has to be ON
     * that plate; this is why the plate wins the 0.000208 and the card loses it. */
    expect(placedAt('snout')[1] - half).toBeCloseTo(0.49375, 9)

    /* And the eye card's bottom edge is `plate-01`'s own recorded height less
     * half its own height. Neither number was chosen for the other. */
    const card = partById('plate-01')!
    const cardBottom = card.offset[1]! - card.size[1]! / 2
    expect(cardBottom).toBeCloseTo(0.773542, 6)
    const top = placedAt('snout')[1] + half
    expect(top).toBeCloseTo(0.77375, 9)
    expect(top - cardBottom).toBeCloseTo(0.000208, 6)

    /* Which occludes 0.039% of the card, against the 3.61% `box-41`'s boss costs
     * the horse. The card is where it always is: absolute z, unmoved. */
    const overlap = (top - cardBottom) * (0.3 - (card.offset[0]! - card.size[0]! / 2))
    expect(overlap / (card.size[0]! * card.size[1]!)).toBeLessThan(0.0005)
    expect(placedAt('eye')[2]).toBe(EYE_CARD_Z)
  })
})

/* ===================================================================== *
 * 4. THE TAIL — a switch, and the second two-tone line this animal has
 * ===================================================================== */

describe('animal-ox: the stub tail, and a patch that lands in a hole in the mesh', () => {
  it('is the elephant\'s trunk turned backwards, at the only height that fits', () => {
    const f = feature('tail')
    expect(f.part).toBe('box-18')
    expect(f.spin).toEqual([{ axis: 'y', deg: 180 }])
    /* `box-18` is the bank's only tail with zero measured burial, so its whole
     * 0.6230 root has to land on the 0.6250 flat rear plate. One height does. */
    expect(partById('box-18')!.attachment!.sunkFractionMean).toBe(0)
    expect(placedAt('tail')).toEqual([0, 0.80625, -0.625])
    const half = partById('box-18')!.size[1]! / 2
    expect(0.80625 - half).toBeGreaterThan(0.49375)
    expect(0.80625 + half).toBeLessThan(1.11875)
    expect((0.625 - partById('box-18')!.size[1]!) / 2).toBeCloseTo(0.000998, 6)
  })

  it('carries the switch as a `patch` at 4/16, in a GAP in the tail\'s own rings', () => {
    expect(feature('tail').paint).toEqual({
      base: 'coat', patch: { below: 'hoof', at: 0.25 },
    })

    /* The tail's world y rows, after the spin and the placement. */
    const p = partById('box-18')!
    const ys = [...new Set([...new Set(p.indices)].map(vi =>
      +(p.positions[vi * 3 + 1]! + 0.80625).toFixed(4)))].sort((a, b) => a - b)
    const loY = ys[0]!, hiY = ys[ys.length - 1]!
    expect(hiY - loY).toBeCloseTo(0.623, 4)

    /* There is a gap with no geometry in it between the thin whippy tip and the
     * thick base, and it is the widest gap in the list. */
    const gapLo = Math.max(...ys.filter(y => y < 0.66)), gapHi = Math.min(...ys.filter(y => y > 0.66))
    expect(gapLo).toBeCloseTo(0.5839, 4)
    expect(gapHi).toBeCloseTo(0.744, 4)
    expect(gapHi - gapLo).toBeCloseTo(0.1601, 4)

    /* 4/16 lands inside it, and is the grid station nearest its midpoint. */
    const drawn = (k: number): number => loY + (k / 16) * (hiY - loY)
    expect(drawn(4)).toBeGreaterThan(gapLo)
    expect(drawn(4)).toBeLessThan(gapHi)
    const mid = (gapLo + gapHi) / 2
    expect(Math.abs(drawn(4) - mid)).toBeLessThan(Math.abs(drawn(5) - mid))
    expect(Math.abs(drawn(4) - mid)).toBeLessThan(Math.abs(drawn(3) - mid))
    /* Either side of 3..6 cuts across a face. */
    expect(drawn(2)).toBeLessThan(gapLo)
    expect(drawn(7)).toBeGreaterThan(gapHi)
  })

  it('patches a DIFFERENT slot from the hoof line, so one cell holds one picture', () => {
    /* Two patches at the same 4/16 by two unrelated derivations. `splitsOf`
     * throws only when one SLOT is patched twice — these are `coat` and `limb`. */
    const patched = OX_ASSEMBLY.features.filter(f => f.paint.patch !== undefined)
    expect(patched.map(f => f.name).sort()).toEqual(['leg', 'tail'])
    expect(new Set(patched.map(f => f.paint.base)).size).toBe(2)
    expect(patched.every(f => f.paint.patch!.at === 0.25)).toBe(true)
    expect(patched.every(f => f.paint.patch!.below === 'hoof')).toBe(true)
    /* And neither of them is combined with a `byBand` on the same part. */
    expect(patched.every(f => f.paint.byBand === undefined)).toBe(true)
  })
})

/* ===================================================================== *
 * 5. LOW AND WIDE IS WHAT HEAVY LOOKS LIKE
 * ===================================================================== */

describe('animal-ox: the silhouette, against the four animals it must not be', () => {
  it('stands low, near the floor of the pack\'s band, and the horns set its height', () => {
    const g = build()
    const box = new THREE.Box3().setFromObject(g)
    const h = box.max.y - box.min.y
    expect(h).toBeCloseTo(1.529948, 5)
    expect(h).toBeGreaterThan(HEIGHT_FLOOR)
    /* The hull's own crown is 1.43125, so every bit of the extra is horn. */
    expect(h - 1.43125).toBeCloseTo(0.098698, 5)
    /* And it is well under the horse's 1.7566 — low-headed, on purpose. */
    expect(h).toBeLessThan(1.7566)
  })

  it('is one solid colour with three dark ends and a pale horn — no marking', () => {
    const slots = Object.keys(OX_ASSEMBLY.palette)
    expect(slots).toEqual(['coat', 'pale', 'limb', 'hoof', 'pupil'])
    /* `hoof` is the feet, the muzzle pad and the switch. */
    const wears = (slot: string): string[] => OX_ASSEMBLY.features
      .filter(f => f.paint.base === slot || f.paint.patch?.below === slot)
      .map(f => f.name).sort()
    expect(wears('hoof')).toEqual(['leg', 'snout', 'tail'])
    /* `limb` is the leg above the hoof and the band-5 ear hollow. */
    expect(OX_ASSEMBLY.hull.paint.byBand).toEqual({ 5: 'limb' })
    expect(feature('leg').paint.base).toBe('limb')
    /* `pale` is the horn and the sclera, and nothing on the body. */
    expect(wears('pale')).toEqual(['eye', 'horn'])
  })

  it('spends 610 triangles, a third of them the shell that carries its ears', () => {
    const tris = OX_ASSEMBLY.features.reduce((n, f) => {
      const c = f.placement.kind === 'single' ? 1 : f.placement.kind === 'pair' ? 2 : 0
      return n + partById(f.part)!.tris * (c || 4)
    }, partById('box-12')!.tris)
    expect(tris).toBe(610)
    expect(tris).toBeLessThan(MODEL_TRIS_MAX)
    /* 180 of them are the hull — three times the cube's 60, because the ears are
     * in it. This is the species that gets that money back. */
    expect(partById('box-12')!.tris).toBe(180)
    expect(partById('box-03')!.tris).toBe(60)
  })

  it('swishes and does nothing else, because it has no ear to twitch', () => {
    expect(OX_ASSEMBLY.motion?.map(m => m.kind)).toEqual(['wag'])
    expect(OX_ASSEMBLY.motion?.[0]!.parts).toEqual(['tail'])
  })
})
