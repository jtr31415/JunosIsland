/**
 * The goat — the sheep's horned, un-woolly sibling.
 *
 * The invariants every assembled species carries are `assertAssembly`. This file
 * pins the five things that are THIS animal's, as facts rather than as prose:
 *
 *   1. **`box-03` has exactly ONE band**, so the sheep's dark face and the
 *      horse's mealy muzzle are `box-41`-only tricks and a species on the cube
 *      has no head colour at all. Four Farm siblings need to know that.
 *   2. **The horn is a repurposed TOOTH, and the splay is the SHAPE's answer** —
 *      the hog's tusk is 1.24x deeper than it is wide and the clean lean envelope
 *      measured against the real shell reproduces that ratio.
 *   3. **`box-18` cannot be carried up on this hull**, which is why the tail is
 *      not the sheep's. Arithmetic, re-runnable.
 *   4. **There are TWO side-mounted ears in the bank, not one** — a correction to
 *      `animal-sheep.ts` §5 — and the hog's is the one whose aspect is a goat's.
 *   5. **It is not a small sheep**, at six places at once.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, GOAT_ASSEMBLY, SHEEP_ASSEMBLY,
  EYE_CARD_Z, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-goat',
  parts: ['box-01', 'box-03', 'box-14', 'cone-01', 'cone-04', 'plate-01', 'tube-06', 'wedge-13'],
  height: 1.6435,
  verts: 460,
  tris: 618,
  // The cube against the hog's ear, which is the next biggest thing on it.
  massRatio: 20,
  // Three: the two horns turned twice, the tail and the beard turned once each.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-goat')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof GOAT_ASSEMBLY)['features'][number] =>
  GOAT_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/* ===================================================================== *
 * THE SEAT SOLVER — `assembly.ts`'s own rotation and `creature.ts`'s own join,
 * against the hull as the closed convex mesh it is. It is here rather than in
 * prose because the horn's whole design is a claim about which attitudes are
 * clean, and a claim like that has to be re-runnable.
 * ===================================================================== */

type P3 = [number, number, number]
const HULL_AT: P3 = [0, 0.80625, 0]

const spinVec = (v: P3, spins: readonly { axis: string; deg: number }[]): P3 =>
  spins.reduce<P3>((p, s) => {
    const r = (s.deg * Math.PI) / 180, c = Math.cos(r), n = Math.sin(r)
    if (s.axis === 'x') return [p[0], p[1] * c - p[2] * n, p[1] * n + p[2] * c]
    if (s.axis === 'y') return [p[0] * c + p[2] * n, p[1], -p[0] * n + p[2] * c]
    return [p[0] * c - p[1] * n, p[0] * n + p[1] * c, p[2]]
  }, v)

/** The hull's outward face planes, deduped. `box-03` is convex, so this is exact. */
const HULL_PLANES = ((): { n: P3; d: number }[] => {
  const h = partById('box-03')!
  const out: { n: P3; d: number }[] = []
  for (let t = 0; t < h.tris; t++) {
    const v = [0, 1, 2].map(k => {
      const i = h.indices[t * 3 + k]!
      return [h.positions[i * 3]! + HULL_AT[0], h.positions[i * 3 + 1]! + HULL_AT[1],
        h.positions[i * 3 + 2]! + HULL_AT[2]] as P3
    })
    const u: P3 = [v[1]![0] - v[0]![0], v[1]![1] - v[0]![1], v[1]![2] - v[0]![2]]
    const w: P3 = [v[2]![0] - v[0]![0], v[2]![1] - v[0]![1], v[2]![2] - v[0]![2]]
    let n: P3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
    const L = Math.hypot(...n)
    if (L < 1e-12) continue
    n = [n[0] / L, n[1] / L, n[2] / L]
    out.push({ n, d: n[0] * v[0]![0] + n[1] * v[0]![1] + n[2] * v[0]![2] })
  }
  return out
})()

const outsideBy = (p: P3): number =>
  Math.max(...HULL_PLANES.map(q => q.n[0] * p[0] + q.n[1] * p[1] + q.n[2] * p[2] - q.d))

/**
 * How much DAYLIGHT a placement leaves: the largest distance any point BEHIND
 * the join plane sits outside the mass. Negative means the whole buried root is
 * embedded. This is `animal-horse.ts` §5's own metric — that file ships at 0.028
 * and records the pony's at 0.038.
 */
function daylight (
  partId: string, at: P3,
  o: { spin?: { axis: string; deg: number }[]; axis?: 'x' | 'y' | 'z'; dir?: 1 | -1; sink?: number } = {},
): number {
  const p = partById(partId)!
  const spins = o.spin ?? []
  const axis = o.axis ?? p.attachment!.axis
  const dir = o.dir ?? p.attachment!.dir
  const sink = o.sink ?? p.attachment!.sunkFractionMean
  const base: P3 = [0, 0, 0]
  base[{ x: 0, y: 1, z: 2 }[axis]] = dir
  const f = spinVec(base, spins)
  const pts: P3[] = [...new Set(p.indices)].map(vi => spinVec(
    [p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!], spins,
  ))
  const proj = pts.map(q => q[0] * f[0] + q[1] * f[1] + q[2] * f[2])
  const lo = Math.min(...proj), hi = Math.max(...proj)
  const shift = -lo - sink * (hi - lo)
  let worst = -Infinity
  for (const q of pts) {
    const w: P3 = [q[0] + at[0] + f[0] * shift, q[1] + at[1] + f[1] * shift, q[2] + at[2] + f[2] * shift]
    const u = -((w[0] - at[0]) * f[0] + (w[1] - at[1]) * f[1] + (w[2] - at[2]) * f[2])
    if (u > 1e-9) worst = Math.max(worst, outsideBy(w))
  }
  return worst
}

/* ===================================================================== *
 * 1. THE CUBE HAS ONE BAND
 * ===================================================================== */

describe('animal-goat: the cube has one band, so every marking is a PART', () => {
  it('finds all 60 of `box-03`\'s triangles in band 5, where `box-41` has three', () => {
    // Both exemplars spend the hull's own `byBand` as a face. Neither trick
    // exists here, and a sibling that copies either line onto the cube gets a
    // silent no-op rather than an error.
    const cube = partById('box-03')!
    expect(cube.tris).toBe(60)
    expect([...new Set(cube.bands)]).toEqual([5])
    const stocky = partById('box-41')!
    expect([...new Set(stocky.bands)].sort((a, b) => a - b)).toEqual([3, 7, 15])
    expect(SHEEP_ASSEMBLY.hull.paint.byBand).toEqual({ 3: 'face' })
    expect(GOAT_ASSEMBLY.hull.paint.byBand).toBeUndefined()
    // And the cheap shell is the whole reason the cube is affordable at all: it
    // pays for the horns, the beard and the snout more than four times over.
    expect(stocky.tris - cube.tris).toBe(202)
    const bought = ['wedge-13', 'wedge-13', 'cone-01', 'tube-06']
      .reduce((n, id) => n + partById(id)!.tris, 0)
    expect(bought).toBeLessThan(stocky.tris - cube.tris)
  })

  it('refuses `belly`, the one line the cube does offer', () => {
    // A horizontal at k/16 of the hull's HEIGHT. This animal's markings are on
    // its ends, so any k would draw a boundary it does not have — the ferret's
    // rule, and the sheep reached the same refusal from the other direction.
    expect(GOAT_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(GOAT_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
    // So the only painted boundary anywhere on the species is the hoof line, and
    // "one cell, one picture" cannot fire.
    const patched = [GOAT_ASSEMBLY.hull.paint, ...GOAT_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.patch).map(p => p.base)
    expect(patched).toEqual(['limb'])
    for (const p of [GOAT_ASSEMBLY.hull.paint, ...GOAT_ASSEMBLY.features.map(f => f.paint)]) {
      expect(p.patch === undefined || p.byBand === undefined, p.base).toBe(true)
    }
  })
})

/* ===================================================================== *
 * 2. THE HORNS
 * ===================================================================== */

describe('animal-goat: there is no horn in the bank, so it is the hog\'s tusk', () => {
  it('has no `horn` role to search for, and three tooth shapes that could be one', () => {
    const roles = [...new Set(PARTS_BANK.flatMap(p => p.roles))]
    expect(roles).not.toContain('horn')
    expect(GOAT_ASSEMBLY.features.filter(f => f.part.startsWith('bespoke-'))).toEqual([])
    // `cone-01` refused on its taper: 0.000 is a true straight point, and this
    // file already spends that shape twice, as the beard and as the tail.
    expect(partById('cone-01')!.shape.taper).toBe(0)
    expect(GOAT_ASSEMBLY.features.filter(f => f.part === 'cone-01').map(f => f.name).sort())
      .toEqual(['beard', 'tail'])
    expect(feature('horn').part).toBe('wedge-13')
    expect(partById('wedge-13')!.roles).toEqual(['tooth'])
    expect(partById('wedge-13')!.provenance.map(q => q.species)).toEqual(['hog'])
  })

  it('has its two lean bounds in the ratio of its own aspect, exactly', () => {
    const hog = partById('wedge-13')!, ele = partById('wedge-11')!
    // The hog's tusk is 1.240722x deeper than it is wide. The elephant's is square.
    expect(hog.size[1]! / hog.size[0]!).toBeCloseTo(1.240722, 6)
    expect(ele.size[1]! / ele.size[0]!).toBeCloseTo(0.994286, 6)
    // A leaned part can lean until the far corner of its own base rises back out
    // of the mass: atan(buried / the half-extent it leans ACROSS). Same numerator
    // both ways, so the TANGENTS are in the shape's own aspect — algebra, not
    // coincidence — and the hog's asks to be splayed where the elephant's asks,
    // very slightly, to be swept back. That is an ox's horn, not a goat's.
    const buried = (p: typeof hog): number => p.attachment!.sunkFractionMean * p.size[2]!
    const tan = (p: typeof hog, a: 0 | 1): number => buried(p) / (p.size[a]! / 2)
    const deg = (t: number): number => (Math.atan(t) * 180) / Math.PI
    expect(tan(hog, 0) / tan(hog, 1)).toBeCloseTo(hog.size[1]! / hog.size[0]!, 9)
    expect(deg(tan(hog, 1))).toBeCloseTo(44.8156, 3)   // backsweep
    expect(deg(tan(hog, 0))).toBeCloseTo(50.9515, 3)   // splay
    expect(deg(tan(ele, 0))).toBeLessThan(deg(tan(ele, 1)))
    expect(deg(tan(ele, 0))).toBeCloseTo(47.3168, 3)
    expect(deg(tan(ele, 1))).toBeCloseTo(47.4804, 3)
  })

  it('measures the real window: 13-29 of SPLAY, and NO backsweep at all', () => {
    // The bounds above assume an infinite plane. The crown is 0.625 square and
    // falls away past its edge, so the real window is much smaller — and it is
    // one-sided, which is the finding: the splay is what SEATS the horn.
    const at: P3 = [0.25, 1.43125, 0.1875]
    const splay = (th: number): number => daylight('wedge-13', at,
      { spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: -th }] })
    const back = (phi: number): number => daylight('wedge-13', at,
      { spin: [{ axis: 'x', deg: -90 - phi }] })
    const clean = [...Array(46).keys()].filter(d => splay(d) < 0)
    expect([clean[0], clean[clean.length - 1]]).toEqual([13, 29])
    expect(clean.length).toBe(29 - 13 + 1)                  // one unbroken window
    // Bolt upright is NOT clean — the tusk's own 0.323089 of depth overruns the
    // crown's forward edge — and leaning it back only makes that worse.
    expect(splay(0)).toBeCloseTo(0.018192, 5)
    for (const phi of [0, 5, 10, 20]) expect(back(phi), `${phi} deg back`).toBeGreaterThan(0)
    // 25 is one degree past the window's deepest point of 24, seated 0.006873
    // inside, where `animal-horse.ts` ships at 0.028 of daylight and records the
    // pony's at 0.038. The ceiling's own 29 is 0.000068 and is left unspent.
    expect(clean.reduce((a, b) => (splay(b) < splay(a) ? b : a))).toBe(24)
    expect(splay(25)).toBeCloseTo(-0.006873, 6)
    expect(splay(29)).toBeCloseTo(-0.000068, 6)
    expect(feature('horn').spin).toEqual([{ axis: 'x', deg: -90 }, { axis: 'z', deg: -25 }])
  })

  it('stands them at 4/16 out and 3/16 forward, both ends forced', () => {
    const p = feature('horn').placement
    expect(p.kind).toBe('pair')                      // rule 6: mirrored from one mesh
    if (p.kind === 'pair') {
      expect(p.at).toEqual([0.25, 1.43125, 0.1875])
      expect(p.at[1]).toBe(Math.max(...points('box-03').map(q => q[1]!)) + 0.80625)
      expect(p.at[0]! * SLOT_PX).toBe(4)
      expect(p.at[2]! * SLOT_PX).toBe(3)
    }
    const splay: { spin: { axis: string; deg: number }[] } =
      { spin: [{ axis: 'x', deg: -90 }, { axis: 'z', deg: -25 }] }
    // 4/16 forward leaves the base outside; 3/16 is the forward-most that does not.
    expect(daylight('wedge-13', [0.25, 1.43125, 0.25], splay)).toBeGreaterThan(0)
    // The tusk's OWN x is available — the hog wore this shape on this very cube —
    // and it is refused anyway, because 4/16 is free and is cleaner.
    expect(partById('box-03')!.provenance.some(q => q.species === 'hog')).toBe(true)
    expect(partById('wedge-13')!.offset[0]).toBeCloseTo(0.294346, 6)
    expect(daylight('wedge-13', [0.294346, 1.43125, 0.1875], splay)).toBeCloseTo(0.00326, 4)
    // Built: the horns are the highest thing on the animal, above the crown.
    const g = build()
    const b = new THREE.Box3().setFromObject(g.getObjectByName('horn-r')!)
    expect(b.max.y).toBeCloseTo(new THREE.Box3().setFromObject(g).max.y, 4)
    expect(b.max.x).toBeGreaterThan(0.3125)          // splayed clear of the crown
  })
})

/* ===================================================================== *
 * 3. THE BEARD AND THE TAIL
 * ===================================================================== */

describe('animal-goat: one shape, one angle, two opposite chamfers', () => {
  it('hangs the beard and stands the tail from the SAME entry, 180 apart', () => {
    expect(feature('beard').part).toBe('cone-01')
    expect(feature('tail').part).toBe('cone-01')
    expect(feature('beard').spin).toEqual([{ axis: 'x', deg: 135 }])
    expect(feature('tail').spin).toEqual([{ axis: 'x', deg: -45 }])
    // 135 and -45 are 180 apart, so the two facings are exact opposites.
    const face = (deg: number): P3 => spinVec([0, 1, 0], [{ axis: 'x', deg }])
    const a = face(135), b = face(-45)
    for (const i of [0, 1, 2]) expect(a[i]! + b[i]!).toBeCloseTo(0, 9)
    // Both at the cube's own chamfer chord midpoint, which is (0.625+0.3125)/2.
    const off = 0.46875
    const bp = feature('beard').placement, tp = feature('tail').placement
    if (bp.kind === 'single') expect(bp.at).toEqual([0, 0.80625 - off, off])
    if (tp.kind === 'single') expect(tp.at).toEqual([0, 0.80625 + off, -off])
    // Deeper-seated than anything else on the animal: the cube's real surface
    // bulges proud of the chord, so a part joined there is embedded by
    // construction — `animal-horse.ts` §5.
    expect(daylight('cone-01', [0, 0.80625 + off, -off], { spin: [{ axis: 'x', deg: -45 }] }))
      .toBeCloseTo(-0.04247, 4)
    // The beard hangs clear of the ground and never becomes the floor.
    const g = build()
    const bb = new THREE.Box3().setFromObject(g.getObjectByName('beard')!)
    expect(bb.min.y).toBeGreaterThan(0.09)
    expect(bb.min.y).toBeLessThan(new THREE.Box3().setFromObject(g.getObjectByName('leg-r0')!).max.y)
    expect(bb.max.z).toBeGreaterThan(0.625)          // in FRONT of the chest
  })

  it('proves `box-18` cannot be carried up on this shell, which is why it is not', () => {
    // The sheep's tail, and the reason a goat cannot simply raise it. Its join
    // cross-section is 0.623004 tall against the flat rear plate's 0.625, at a
    // recorded burial of exactly 0.000000 — it fills the plate and has nothing to
    // rotate into.
    const t = partById('box-18')!
    expect(t.attachment!.sunkFractionMean).toBe(0)
    const rear = points('box-03').filter(p => p[2]! < -0.6249)
    const plate = Math.max(...rear.map(p => p[1]!)) - Math.min(...rear.map(p => p[1]!))
    expect(plate).toBeCloseTo(0.625, 6)
    expect(plate - t.size[1]!).toBeCloseTo(0.001996, 6)   // 0.000998 a side
    // Tilt it by anything at all and the low corner swings off the plate — even
    // with the sink forced up to 0.267 to buy room it does not survive 20 degrees.
    for (const phi of [10, 20, 30]) {
      expect(daylight('box-18', [0, 0.80625, -0.625],
        { spin: [{ axis: 'x', deg: 180 + phi }], sink: 0.267 }), `${phi} deg`).toBeGreaterThan(0)
    }
    expect(GOAT_ASSEMBLY.features.some(f => f.part === 'box-18')).toBe(false)
    // `wedge-07` refused on cost and on read: 6.2x the shape that is used, and
    // more than three times the whole hull.
    expect(partById('wedge-07')!.tris / partById('cone-01')!.tris).toBeCloseTo(6.24, 1)
    expect(partById('wedge-07')!.tris).toBeGreaterThan(3 * partById('box-03')!.tris)
    expect(GOAT_ASSEMBLY.features.some(f => f.part === 'wedge-07')).toBe(false)
  })
})

/* ===================================================================== *
 * 4. THE EAR
 * ===================================================================== */

describe('animal-goat: two side-mounted ears in the bank, and the hog\'s is the goat\'s', () => {
  it('corrects `animal-sheep.ts` §5 — the elephant\'s is not the only one', () => {
    const sideways = PARTS_BANK.filter(p => p.roles.includes('ear') && p.attachment?.axis === 'x')
      .map(p => p.id).sort()
    expect(sideways).toEqual(['box-25', 'tube-04', 'tube-05'])
    // `box-25`, the koala's, stands MORE proud than the elephant's and is still
    // refused: it is a disc more than half the height of the body it hangs on, it
    // costs 92 triangles, and it does not seat on this flank.
    const proud = (id: string): number => partById(id)!.size[0]!
      * (1 - partById(id)!.attachment!.sunkFractionMean)
    expect(proud('box-25')).toBeGreaterThan(proud('tube-04'))
    expect(partById('box-25')!.size[0]! / partById('box-03')!.size[1]!).toBeGreaterThan(0.5)
    expect(daylight('box-25', [0.625, 1.0625, 0.125], { axis: 'x', dir: 1 })).toBeGreaterThan(0.1)
    for (const id of ['box-25', 'tube-04', 'tube-05']) {
      expect(GOAT_ASSEMBLY.features.some(f => f.part === id), id).toBe(false)
    }
  })

  it('picks on ASPECT: a goat\'s ear is deeper than it is tall, an elephant\'s is not', () => {
    // Mounted on x, what a child reads from above is the cross-section.
    const ele = partById('tube-04')!, hog = partById('cone-04')!
    expect(ele.size[1]! / ele.size[2]!).toBeCloseTo(2.2317, 3)   // TALL
    expect(hog.size[2]! / hog.size[1]!).toBeCloseTo(1.3714, 3)   // DEEP
    expect(feature('ear').part).toBe('cone-04')
    expect(hog.provenance.map(q => q.species)).toEqual(['hog'])
    // Same donor as the horns: one animal, two organs, and there is no hog and no
    // pig anywhere in the roster.
    const donorsOf = (id: string): string[] =>
      [...new Set(partById(id)!.provenance.map(q => q.species))]
    expect(donorsOf('cone-04')).toEqual(donorsOf('wedge-13'))
    expect(donorsOf('cone-04')).toEqual(['hog'])
    expect(feature('ear').axis).toBe('x')
  })

  it('DERIVES the sink from §3\'s floor, because the hog\'s own is wrong here', () => {
    const hog = partById('cone-04')!
    // The hog buried 0.2880 of 0.4032 on a fat cheek and left 0.1152 proud, which
    // is smaller than the sheep's ear and would be invisible in the portrait.
    expect(hog.attachment!.sunkFractionMean * hog.size[0]!).toBeCloseTo(0.288064, 6)
    expect(hog.size[0]! * (1 - hog.attachment!.sunkFractionMean)).toBeCloseTo(0.11517, 5)
    // §3: "every eared species embeds its ear into the hull, by at least 0.125".
    // The shallowest legal sink is 0.125/0.403234, and 5/16 is the first grid
    // point above it. Nothing is chosen: the floor picks it, the grid rounds it.
    const floor = 0.125 / hog.size[0]!
    expect(floor).toBeCloseTo(0.309994, 6)
    expect(feature('ear').sink).toBe(5 / SLOT_PX)
    expect(feature('ear').sink!).toBeGreaterThan(floor)
    expect(Math.floor(floor * SLOT_PX) + 1).toBe(5)
    const proud = hog.size[0]! * (1 - feature('ear').sink!)
    expect(proud).toBeCloseTo(0.277223, 6)
    const sheepEar = partById('cone-02')!
    expect(proud / (sheepEar.size[0]! * (1 - sheepEar.attachment!.sunkFractionMean)))
      .toBeCloseTo(1.5339, 3)
  })

  it('stands it at the highest y and the forward-most z that stay embedded', () => {
    const p = feature('ear').placement
    if (p.kind === 'pair') {
      expect(p.at).toEqual([0.625, 1.0625, 0.125])
      expect(p.at[1]! * SLOT_PX).toBe(17)
      expect(p.at[2]! * SLOT_PX).toBe(2)
      expect(p.at[1]!).toBeGreaterThan(partById('plate-01')!.offset[1]!)   // above the eye
    }
    const o = { axis: 'x' as const, dir: 1 as const, sink: 5 / SLOT_PX }
    expect(daylight('cone-04', [0.625, 1.0625, 0.125], o)).toBeLessThan(0)
    // One grid step higher fails by a quarter of a thousandth — worth pinning so
    // nobody re-tries it — and one step forward fails outright.
    expect(daylight('cone-04', [0.625, 1.125, 0.125], o)).toBeCloseTo(0.00025, 5)
    expect(daylight('cone-04', [0.625, 1.0625, 0.1875], o)).toBeCloseTo(0.0313, 3)
  })
})

/* ===================================================================== *
 * 5. THE SNOUT, THE LEG, AND NOT BEING A SMALL SHEEP
 * ===================================================================== */

describe('animal-goat: the snout both exemplars refused, and what it costs', () => {
  it('is the donor transfer entire, and it is the pony\'s own arrangement', () => {
    expect(feature('snout').part).toBe('tube-06')
    expect(feature('snout').stretch).toBeUndefined()
    expect(feature('snout').sink).toBe(0)
    const p = feature('snout').placement
    // No `at` was written, so the transfer solved it: the donor's own x and y with
    // the z moved to THIS hull's front face.
    if (p.kind === 'single') {
      expect(p.at).toEqual([0, partById('tube-06')!.offset[1], 0.625])
      expect(p.at[2]).toBe(partById('box-03')!.size[2]! / 2)
    }
    // The sheep has none — a sheep's face is short — and it is the third of the
    // six separations.
    expect(SHEEP_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
  })

  it('crosses the eye plane, and that is recorded rather than fixed', () => {
    // Rule 5: an eye is never adjusted. `eyes` is absent from the definition
    // entirely, so the card, its x and its y are the pack's own.
    const card = partById('plate-01')!
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    const g = build()
    const s = new THREE.Box3().setFromObject(g.getObjectByName('snout')!)
    expect(s.max.z).toBeGreaterThan(EYE_CARD_Z)
    // It overlaps the inner-LOWER corner of each card and nothing else: the
    // muzzle is 0.300 tall and the card's centre is above its top edge.
    expect(s.max.y).toBeLessThan(card.offset[1]!)
    expect(s.max.x).toBeGreaterThan(card.offset[0]! - card.size[0]! / 2)
  })
})

describe('animal-goat: the leg is 4/16, which `animal-sheep.ts` predicted by name', () => {
  it('takes the pony\'s line unchanged and refuses a second', () => {
    expect(feature('leg').paint).toEqual({
      base: 'limb', patch: { below: 'horn', at: 0.25 },
    })
    expect(feature('leg').paint.patch!.at * SLOT_PX).toBe(4)
    // 4/16 is the lowest k that clears `box-01`'s own bevel onto the straight
    // shank. The derivation is `animal-sheep.ts` §4 and is not repeated; this is
    // the one fact the number rests on.
    const leg = partById('box-01')!
    expect(0.0625 / leg.size[1]!).toBeCloseTo(0.204082, 6)
    expect(4 / SLOT_PX).toBeGreaterThan(0.0625 / leg.size[1]!)
    expect(3 / SLOT_PX).toBeLessThan(0.0625 / leg.size[1]!)
    // ONE patch on the animal, and the legs are never spun, so it cannot rake.
    expect(feature('leg').spin).toBeUndefined()
  })
})

describe('animal-goat: it is not a small sheep', () => {
  it('inverts the sheep at six places at once', () => {
    const sheepFeat = (n: string): boolean => SHEEP_ASSEMBLY.features.some(f => f.name === n)
    // 1. the shell
    expect(GOAT_ASSEMBLY.hull.part).toBe('box-03')
    expect(SHEEP_ASSEMBLY.hull.part).toBe('box-41')
    // 2. horns  3. a beard  5. a snout — none of which the sheep has
    for (const n of ['horn', 'beard', 'snout']) {
      expect(GOAT_ASSEMBLY.features.some(f => f.name === n), n).toBe(true)
      expect(sheepFeat(n), `sheep ${n}`).toBe(false)
    }
    // 4. the face is tan and carried by parts, where the sheep's is near-black
    //    and carried by the hull's own band.
    const chroma = (hex: number): number => {
      const c = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      return (Math.max(...c) - Math.min(...c)) / Math.max(...c)
    }
    const gap = (a: Record<string, number>): number =>
      chroma(a['face']!) - chroma(a['coat']!)
    expect(gap(GOAT_ASSEMBLY.palette)).toBeGreaterThan(gap(SHEEP_ASSEMBLY.palette))
    expect(feature('ear').paint.base).toBe('face')
    expect(feature('snout').paint.base).toBe('face')
    // The correction taken deliberately: this white is now the lowest-chroma body
    // in the collection, and what it owns instead is VALUE.
    expect(chroma(GOAT_ASSEMBLY.palette['coat']!))
      .toBeLessThan(chroma(SHEEP_ASSEMBLY.palette['coat']!))
    const value = (hex: number): number => Math.max((hex >> 16) & 255, (hex >> 8) & 255, hex & 255) / 255
    expect(value(GOAT_ASSEMBLY.palette['coat']!) - value(SHEEP_ASSEMBLY.palette['coat']!))
      .toBeCloseTo(0.0667, 3)
    // 6. the tail is UP and the leg line is at the hoof, not at the fleece.
    const g = build()
    const t = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    expect(t.max.y).toBeGreaterThan(0.80625 + 0.625)        // above the crown plate
    expect(feature('leg').paint.patch!.at)
      .toBeLessThan(SHEEP_ASSEMBLY.features.find(f => f.name === 'leg')!.paint.patch!.at)
  })

  it('is LEAN — the smallest keep-out of any Farm quadruped so far', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges from max(width, depth) / 2. The width is the ears and
    // the depth is the muzzle against the tail; both are parts, not body.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)       // `animal-fox`'s own
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.0556)     // the horse's
    // Taller than the sheep despite the smaller shell, and the horns are why.
    expect(s.y).toBeGreaterThan(1.48125)
    expect(GOAT_ASSEMBLY.flag).toBeUndefined()
    expect(Object.keys(GOAT_ASSEMBLY.palette)).toEqual(['coat', 'face', 'limb', 'horn', 'pupil'])
    expect(GOAT_ASSEMBLY.motion?.map(m => m.kind)).toEqual(['wag', 'twitch'])
  })
})
