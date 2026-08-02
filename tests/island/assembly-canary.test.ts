/**
 * The canary. Home Pets' second cage bird, and the plainest animal in the
 * project — which turns out to be a measurable claim rather than a mood.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a canary can say,
 * and it says five things the cockatiel and the lovebird need:
 *
 *   1. **FOUR OF THE PACK'S TEN HULL RECORDS ARE ONE SOLID.** `box-03`,
 *      `box-20`, `box-36` and `box-39` are the same 1.250 cube cut into 60, 78,
 *      72 and 80 triangles, measured against `box-03`'s own sixty face planes —
 *      and `box-33`, which looks like the fifth, is NOT. Nothing had recorded
 *      that, and it is what makes this species' hull choice free of geometry.
 *   2. **RULE 9'S FLOOR IS WHAT PICKS BETWEEN THEM, and the test builds all four
 *      to show it.** An animal with nothing on it stands up in exactly one of the
 *      four, and it is the penguin's. The day another part changes this animal's
 *      counts, that line goes red rather than the species quietly sliding under a
 *      floor.
 *   3. **The bill is the bank's only CONE**, out of 28 nose shapes — and the
 *      overhang that makes it a parrot's is measured (0.0838, 29% of its depth)
 *      rather than left as an opinion in a comment.
 *   4. **The wing is `animal-budgie.ts`'s, and it was CHECKED rather than
 *      copied**: all four of its numbers re-derived here, plus the two refusals
 *      (`box-25` is a disc, `tube-04` buries a third of the floor).
 *   5. **Six free mechanisms are declined**, and each refusal is pinned as a fact
 *      about the BANK or the DEFINITION, so the next builder cannot helpfully add
 *      one back. That is `animal-badger.ts`'s discipline, applied six times.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, CANARY_ASSEMBLY, EYE_CARD_Z, HEIGHT_FLOOR,
  HULL_FRONT_Z_USUAL, LEG_ROW, MODEL_TRIS_MIN, MODEL_VERTS_MIN,
  type AssemblyBuild,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-canary',
  parts: ['box-01', 'box-06', 'box-38', 'box-39', 'cone-06', 'plate-08'],
  height: 1.4312,
  // Exactly the pack's own vertex floor, and two over its triangle floor. That
  // is the animal: see the hull block below, which is where both come from.
  verts: 405,
  tris: 424,
  // TWO legs, not four. A bird.
  legs: 2,
  // The tail is the biggest thing it wears and the hull is five times it — where
  // the budgie's whip leaves the hull eleven times its tail. A short fan is a
  // bigger share of a small bird than a long thin tail is.
  massRatio: 5,
  // Only the wing turns. The tail is a bare donor transfer moved in y, and the
  // bill and the eyes are not turned at all. Said as a number, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-canary')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof CANARY_ASSEMBLY.features[number] =>
  CANARY_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/**
 * How far an ORIGIN-CENTRED point sits inside a shell, measured against every one
 * of its own face planes. Positive is inside; the number is a perpendicular
 * distance, and the bank stores every shape origin-centred.
 *
 * The bank's hulls are convex, so the nearest plane is the binding one. Written
 * out here rather than asked of the builder, because two of the things being
 * checked are whether the BUILDER's arithmetic put the wing inside the body and
 * whether two BANK records are the same solid — and a shared implementation
 * would let either agree with itself. `assembly-budgie.test.ts` carries the same
 * helper for the first of those two reasons.
 */
function insideShell(shell: string, w: readonly [number, number, number]): number {
  const p = partById(shell)!
  let worst = Infinity
  for (let t = 0; t < p.indices.length; t += 3) {
    const v = [0, 1, 2].map(k => {
      const vi = p.indices[t + k]!
      return [p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!]
    })
    const a = [0, 1, 2].map(k => v[1]![k]! - v[0]![k]!)
    const b = [0, 1, 2].map(k => v[2]![k]! - v[0]![k]!)
    const n = [
      a[1]! * b[2]! - a[2]! * b[1]!,
      a[2]! * b[0]! - a[0]! * b[2]!,
      a[0]! * b[1]! - a[1]! * b[0]!,
    ]
    const len = Math.hypot(n[0]!, n[1]!, n[2]!)
    if (len < 1e-12) continue
    const dot = (u: readonly number[], w2: readonly number[]): number =>
      u[0]! * w2[0]! + u[1]! * w2[1]! + u[2]! * w2[2]!
    /* Origin-centred, so the outward normal is the one pointing away from the
     * origin at the face's own corner. */
    const sgn = dot(n, v[0]!) < 0 ? -1 : 1
    const nn = n.map(c => (c * sgn) / len)
    const d = dot(nn, v[0]!) - dot(nn, w)
    if (d < worst) worst = d
  }
  return worst
}

/** The same, for a WORLD point: the shell's own recorded offset taken back off. */
const insideHull = (shell: string, w: readonly [number, number, number]): number => {
  const at = partById(shell)!.offset
  return insideShell(shell, [w[0] - at[0]!, w[1] - at[1]!, w[2] - at[2]!])
}

/** This exact animal, rebuilt on a different shell. Everything else held fixed. */
function onHull(id: string): { verts: number; tris: number } {
  const spec: AssemblyBuild = {
    ...CANARY_ASSEMBLY,
    hull: { ...CANARY_ASSEMBLY.hull, part: id, at: partById(id)!.offset },
  }
  let verts = 0, tris = 0
  for (const c of buildAssembly(spec).children) {
    const m = c as THREE.Mesh
    if (!m.geometry) continue
    verts += m.geometry.getAttribute('position')!.count
    tris += m.geometry.getIndex()!.count / 3
  }
  return { verts, tris }
}

/** How far a face reaches flat, along `axis`, before the chamfer starts. */
const flatReach = (hull: string, face: 0 | 1 | 2, axis: 0 | 1 | 2): number => {
  const p = partById(hull)!
  return Math.max(...points(hull)
    .filter(w => Math.abs(Math.abs(w[face]) - p.size[face]! / 2) < 1e-6)
    .map(w => Math.abs(w[axis])))
}

/** The mean of one coordinate over every corner of every triangle in a band. */
const bandMean = (id: string, band: number, axis: 0 | 1 | 2): number => {
  const p = partById(id)!
  const vals: number[] = []
  for (let t = 0; t < p.bands.length; t++) {
    if (p.bands[t] !== band) continue
    for (let k = 0; k < 3; k++) vals.push(p.positions[p.indices[t * 3 + k]! * 3 + axis]!)
  }
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/* -------------------------------------------------------------- the hull --- */

describe('animal-canary: four of the ten hulls are one solid, and only one clears the floor', () => {
  it('measures box-20, box-36 and box-39 ONTO box-03\'s own surface', () => {
    /*
     * `hulls.ts:185-194` names four alternatives to the cube and treats the
     * remaining five hull records as distinct shapes. Three of them are not
     * distinct at all — which is what makes this species' hull choice cost
     * nothing a child could see, and it is the finding the cockatiel and the
     * lovebird should read before they pick one.
     */
    for (const id of ['box-20', 'box-36', 'box-39']) {
      const worst = Math.max(...points(id).map(w => Math.abs(insideShell('box-03', w))))
      expect(worst, `${id} is no longer box-03's own solid — reopen the hull choice`)
        .toBeLessThan(1e-4)
    }
    // And the four differ ONLY in how they are cut up, plus Kenney's bands.
    for (const id of ['box-20', 'box-36', 'box-39']) {
      expect(partById(id)!.size).toEqual(partById('box-03')!.size)
      expect(partById(id)!.offset).toEqual(partById('box-03')!.offset)
    }
    expect(['box-03', 'box-20', 'box-36', 'box-39'].map(id => partById(id)!.tris))
      .toEqual([60, 78, 72, 80])
  })

  it('refuses box-33, which looks like the fifth cut of it and is NOT', () => {
    // The one that had to be checked rather than assumed: 198 vertices and 114
    // triangles would have cleared both floors with room to spare, and it is a
    // 1.250 cube by every field the bank prints. 0.1664 of it is set INSIDE the
    // shell — the monkey's shape is dished, and it is not this one.
    expect(partById('box-33')!.size).toEqual(partById('box-03')!.size)
    const worst = Math.max(...points('box-33').map(w => insideShell('box-03', w)))
    expect(worst).toBeCloseTo(0.166410, 5)
    // The other three hulls of the pack are not close either, so the finding is
    // about these four and not about hulls in general.
    for (const [id, d] of [['box-12', 0.212644], ['box-21', 0.334013], ['box-31', 0.052003]] as const) {
      expect(Math.max(...points(id).map(w => Math.abs(insideShell('box-03', w)))))
        .toBeCloseTo(d, 5)
    }
    expect(CANARY_ASSEMBLY.hull.part).not.toBe('box-33')
  })

  it('builds this animal on all four and finds ONE that clears rule 9\'s floors', () => {
    /*
     * This is the species' whole argument, and it is a measurement rather than a
     * preference. Rule 9 is a FLOOR as well as a ceiling and a bird with no
     * extras at all is exactly the animal it binds on — `animal-nightjar.ts`
     * found the same wall and paid it with eight mottling cards it also wanted,
     * where this one has nothing it also wants.
     */
    const got = Object.fromEntries(
      ['box-03', 'box-36', 'box-20', 'box-39'].map(id => [id, onHull(id)]))
    expect(got['box-03']).toEqual({ verts: 383, tris: 404 })   // both floors fail
    expect(got['box-36']).toEqual({ verts: 399, tris: 416 })   // both floors fail
    expect(got['box-20']).toEqual({ verts: 395, tris: 422 })   // the VERTEX floor fails
    expect(got['box-39']).toEqual({ verts: 405, tris: 424 })   // the only one that clears
    const clears = Object.entries(got)
      .filter(([, c]) => c.verts >= MODEL_VERTS_MIN && c.tris >= MODEL_TRIS_MIN)
      .map(([id]) => id)
    expect(clears, 'more than one cut of this solid now stands up — re-argue the hull')
      .toEqual(['box-39'])
    expect(CANARY_ASSEMBLY.hull.part).toBe('box-39')
    // Sitting ON the vertex floor is the point and not a near miss, so it is
    // pinned as an equality rather than as a bound.
    expect(got['box-39']!.verts).toBe(MODEL_VERTS_MIN)
    expect(got['box-39']!.tris - MODEL_TRIS_MIN).toBe(2)
  })

  it('takes the PENGUIN\'S shell, which is the one bird hull nobody had spent', () => {
    // Three of the pack's 24 are birds and they wear two shells between them:
    // the parrot and the chick on `box-03`, the penguin on this. The nightjar,
    // the kiwi and the budgie all took the first.
    expect(partById('box-39')!.provenance.map(p => p.species)).toEqual(['penguin'])
    expect(partById('box-03')!.provenance.map(p => p.species))
      .toEqual(expect.arrayContaining(['parrot', 'chick']))
  })

  it('keeps every donor transfer exact, because the numbers that place one agree', () => {
    // The bill and the tail both come off the parrot, which wears them on
    // `box-03`. They land where they land for `animal-budgie.ts` only because
    // these two records agree on the three numbers a join is solved from.
    const here = partById('box-39')!, cube = partById('box-03')!
    expect(here.offset).toEqual([0, 0.80625, 0])
    expect(here.size[2]! / 2).toBe(HULL_FRONT_Z_USUAL)
    for (const [face, axis] of [[2, 0], [2, 1], [0, 1], [0, 2], [1, 0]] as const) {
      expect(flatReach('box-39', face, axis)).toBeCloseTo(flatReach('box-03', face, axis), 9)
      expect(flatReach('box-39', face, axis)).toBeCloseTo(0.3125, 6)
    }
    expect(cube.size).toEqual(here.size)
    // Checked on the built animal: the bill's centre recovers the bank's own
    // recorded offset for the shape, which the join never used.
    const g = build()
    expect(g.getObjectByName('snout')!.position.z).toBeCloseTo(partById('cone-06')!.offset[2]!, 4)
    expect(g.getObjectByName('snout')!.position.y).toBeCloseTo(partById('cone-06')!.offset[1]!, 4)
  })
})

/* -------------------------------------------------------------- the bill --- */

describe('animal-canary: the bill is the only cone in the bank, and it is a parrot\'s', () => {
  it('finds exactly one CONE among the bank\'s 28 nose shapes', () => {
    // A canary is a finch and a finch's bill is a short deep cone. There is no
    // second candidate, and the day one is banked this line says so.
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose'))
    expect(noses).toHaveLength(28)
    const cones = noses.filter(p => p.shape.form === 'cone').map(p => p.id)
    expect(cones, 'the bank now has a second cone — reconsider the bill').toEqual(['cone-06'])
    const forms: Record<string, number> = {}
    for (const p of noses) forms[p.shape.form] = (forms[p.shape.form] ?? 0) + 1
    expect(forms).toEqual({ box: 11, tube: 6, blade: 5, wedge: 3, plate: 2, cone: 1 })
    expect(feature('snout').part).toBe('cone-06')
  })

  it('refuses the chick\'s own beak, and the refusal is two measurements', () => {
    /*
     * `tube-02` is the pack's own SMALL BIRD beak — the chick's and the
     * penguin's — and it is the obvious reach on a hull that is the penguin's.
     * It is a blunt bar and it barely leaves the face.
     */
    const chick = partById('tube-02')!, cone = partById('cone-06')!
    const reach = (p: typeof chick): number => p.size[2]! * (1 - p.attachment!.sunkFractionMean)
    expect(reach(chick)).toBeCloseTo(0.100, 6)
    expect(reach(cone)).toBeCloseTo(0.183350, 6)
    expect(chick.shape.taper).toBe(1)          // no narrowing along its own long axis
    // Its tip is still 0.373 across — a bill that has not tapered is not a
    // seed-eater's, and the eye cards are only 0.400 wide.
    const P = points('tube-02')
    const maxZ = Math.max(...P.map(w => w[2]!))
    const tip = P.filter(w => Math.abs(w[2]! - maxZ) < 1e-4)
    expect(2 * Math.max(...tip.map(w => Math.abs(w[0]!)))).toBeCloseTo(0.3726, 4)
    expect(CANARY_ASSEMBLY.features.some(f => f.part === 'tube-02')).toBe(false)
  })

  it('measures the OVERHANG that makes it a parrot\'s, rather than asserting it is fine', () => {
    /*
     * The one place this animal wears a part whose donor is a different KIND of
     * bird, so the caveat is a number and it is in the flag where Joe reads it.
     * A hooked bill is an upper mandible standing proud of the lower one; here
     * that is 0.0838 of a shape 0.286878 deep, and every bird overhangs a little.
     */
    const P = points('cone-06'), p = partById('cone-06')!
    const bandMaxZ = (band: number): number => {
      let z = -Infinity
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) z = Math.max(z, p.positions[p.indices[t * 3 + k]! * 3 + 2]!)
      }
      return z
    }
    // Split at Kenney's own upper/lower cut, which `animal-budgie.ts` identified.
    expect(bandMaxZ(15)).toBeCloseTo(0.143400, 6)
    expect(bandMaxZ(13)).toBeCloseTo(0.101500, 6)
    expect(bandMaxZ(15) - bandMaxZ(13)).toBeCloseTo(0.041900, 6)
    expect((bandMaxZ(15) - bandMaxZ(13)) / p.size[2]!).toBeCloseTo(0.146, 3)
    // Read off the SILHOUETTE instead it is bigger: the forward-most point of
    // the bill sits at y +0.1122 and the bottom edge's is 0.0838 behind it.
    const upper = Math.max(...P.map(w => w[2]!))
    const bottomY = Math.min(...P.map(w => w[1]!))
    const lower = Math.max(...P.filter(w => Math.abs(w[1]! - bottomY) < 1e-6).map(w => w[2]!))
    expect(upper - lower).toBeCloseTo(0.0838, 4)
    expect((upper - lower) / p.size[2]!).toBeCloseTo(0.292, 3)
    expect(CANARY_ASSEMBLY.flag).toMatch(/THE BILL IS A PARROT'S AND IT OVERHANGS/i)
    // And it does taper, front section against root section, which is the half
    // of the shape that IS a seed bill.
    const span = (z: number): number => {
      const s = P.filter(w => Math.abs(w[2]! - z) < 0.06)
      return Math.max(...s.map(w => w[1]!)) - Math.min(...s.map(w => w[1]!))
    }
    expect(span(0.1015) / span(-0.0917)).toBeCloseTo(0.81, 2)
  })

  it('is a PURE donor transfer, and it declines the budgie\'s cere trick', () => {
    // No `at`, no `sink`, no `spin` — the placement is the parrot's own.
    expect(feature('snout').sink).toBeCloseTo(partById('cone-06')!.attachment!.sunkFractionMean, 9)
    expect(feature('snout').spin).toBeUndefined()
    expect(feature('snout').placement).toEqual({
      kind: 'single', at: [0, partById('cone-06')!.offset[1], HULL_FRONT_Z_USUAL],
    })
    // `animal-budgie.ts` measured band 15 as the UPPER mandible and paints it
    // blue for the cere. A canary's bill is one pale pink, upper and lower, so
    // the cut is real, free, and declined — refusal 4 of six.
    expect(bandMean('cone-06', 15, 1)).toBeGreaterThan(bandMean('cone-06', 13, 1))
    expect(feature('snout').paint).toEqual({ base: 'limb' })
    expect(feature('snout').paint.byBand).toBeUndefined()
  })
})

/* -------------------------------------------------------------- the tail --- */

describe('animal-canary: the tail is the parrot\'s fan, brought down off the parrot\'s height', () => {
  it('takes the shortest REACH any bird here can honestly have', () => {
    // What a tail costs an animal is how far it reaches past the rear face after
    // its own recorded burial — not its longest extent, which on four of the
    // seven runs vertically.
    const reach = (id: string): number => {
      const p = partById(id)!
      return p.size[2]! * (1 - p.attachment!.sunkFractionMean)
    }
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    expect(reach('box-38')).toBeCloseTo(0.468919, 6)
    /*
     * THREE reach less and not one of the three is available. Two are spent
     * inside this collection — the beaver's broad paddle on the chinchilla and
     * the bank's only stub on the hamster — and the third is the cat's whip,
     * 0.002 shorter, 0.200 across and 1.0466 tall standing vertically, which is a
     * posture rather than a fan. Among the shapes that are a bird's tail at all
     * this is the shortest there is.
     */
    const shorter = tails.filter(p => reach(p.id) < reach('box-38')).map(p => p.id).sort()
    expect(shorter).toEqual(['box-18', 'wedge-03', 'wedge-07'])
    expect(reach('wedge-03')).toBeCloseTo(0.415328, 6)
    expect(reach('box-18')).toBeCloseTo(0.425211, 6)
    expect(reach('wedge-07')).toBeCloseTo(0.466912, 6)
    expect(partById('wedge-07')!.size[0]).toBeCloseTo(0.200, 6)      // a whip, not a fan
    expect(partById('wedge-07')!.size[1]).toBeGreaterThan(partById('box-38')!.size[1]!)
    // `box-38` is the only tail the pack's own birds ever wore.
    expect(partById('box-38')!.provenance.map(q2 => q2.species)).toEqual(['parrot'])
    // Against the budgie's, which spins `wedge-15` to run straight back and
    // reaches 0.763846 — this bird's tail is a little under two thirds of it.
    expect(0.763846 / reach('box-38')).toBeCloseTo(1.629, 3)
    expect(feature('tail').part).toBe('box-38')
    // And it is the cheapest tail in the bank, which on an animal fighting the
    // FLOOR is a cost rather than a saving.
    expect(Math.min(...tails.map(p => p.tris))).toBe(partById('box-38')!.tris)
  })

  it('would stand TALLER than the budgie at the parrot\'s own height, so it moved', () => {
    /*
     * `animal-nightjar.ts` wears this shape as a bare donor transfer and is right
     * to: the parrot's 1.099846 is a measured answer on this same solid. A canary
     * is not a parrot and does not cock its tail, and the arithmetic agrees.
     */
    const fan = partById('box-38')!
    expect(fan.offset[1]! + fan.size[1]! / 2).toBeCloseTo(1.555942, 5)
    expect(fan.offset[1]! + fan.size[1]! / 2).toBeGreaterThan(HEIGHT_FLOOR)
    // At the hull's own centre — `animal-badger.ts`'s move and the budgie's —
    // the whole fan is inside the shell's own height and the bird stands on the
    // floor, which `home-pets.ts:102` asks of the smallest of the four.
    const hull = partById('box-39')!
    const tail = feature('tail')
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, hull.offset[1], -hull.size[2]! / 2])
    }
    const g = build()
    const t = boxOf(g, 'tail'), h = boxOf(g, 'hull')
    expect(t.min.y).toBeCloseTo(0.350154, 4)
    expect(t.max.y).toBeCloseTo(1.262346, 4)
    expect(t.min.y).toBeGreaterThan(h.min.y)
    expect(t.max.y).toBeLessThan(h.max.y)
    expect(new THREE.Box3().setFromObject(g).max.y).toBeCloseTo(HEIGHT_FLOOR, 4)
  })

  it('buries its root four times deeper than the overhang needs', () => {
    // §3, nothing floats, checked rather than assumed. The join cross-section is
    // taller than the flat rear face, so its top and bottom corners stand over a
    // surface that has receded — and the shape's OWN recorded burial covers it,
    // which is the opposite of the wing, where the budgie had to overrule one.
    const fan = partById('box-38')!
    const P = points('box-38')
    const maxZ = Math.max(...P.map(w => w[2]!))
    const rootHalf = Math.max(...P.filter(w => Math.abs(w[2]! - maxZ) < 1e-3)
      .map(w => Math.abs(w[1]!)))
    expect(rootHalf).toBeCloseTo(0.3561, 4)
    const overhang = rootHalf - flatReach('box-39', 2, 1)
    expect(overhang).toBeCloseTo(0.0436, 4)
    const buried = fan.size[2]! * fan.attachment!.sunkFractionMean
    expect(buried).toBeCloseTo(0.173205, 6)
    expect(buried / overhang).toBeGreaterThan(3.9)
    expect(feature('tail').sink).toBeCloseTo(fan.attachment!.sunkFractionMean, 9)
    expect(feature('tail').spin).toBeUndefined()
    expect(feature('tail').stretch).toBeUndefined()
  })
})

/* -------------------------------------------------------------- the wing --- */

describe('animal-canary: the wing is the budgie\'s, and it was checked rather than copied', () => {
  it('finds only TWO ears in twenty-three that a wing could be made of', () => {
    /*
     * Longest over middle, off the sorted extents, is what decides whether a
     * shape can be a wing at all: a wing is long and shallow and everything else
     * in this bank is round. `animal-budgie.ts` reached for `box-06` on LENGTH;
     * this is the same conclusion from the aspect, and it is what says a shorter
     * ear would not do.
     */
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(ears).toHaveLength(23)
    const aspect = (id: string): number => {
      const s = [...partById(id)!.size].sort((a, b) => b - a)
      return s[0]! / s[1]!
    }
    const elongated = ears.filter(p => aspect(p.id) > 1.5).map(p => p.id).sort()
    expect(elongated).toEqual(['box-06', 'box-07', 'tube-04', 'tube-05'])
    expect(aspect('box-06')).toBeCloseTo(1.8949, 4)
    expect(aspect('tube-04')).toBeCloseTo(1.7225, 4)
    expect(feature('wing').part).toBe('box-06')
  })

  it('keeps the BUDGIE\'S length, because 73% is right for a canary too', () => {
    // The size question was real — this is the smallest of the four birds — and
    // the answer is that it fits: a live canary's folded wing runs about 85% of
    // its body, so 0.9133 on a 1.250-deep shell is if anything short. There is
    // nothing between it and the next shape down, so the bank cannot say the
    // difference between a budgie's wing and a canary's anyway.
    const hull = partById('box-39')!
    expect(partById('box-06')!.shape.longest / hull.size[2]!).toBeCloseTo(0.7306, 4)
    expect(partById('tube-04')!.shape.longest / hull.size[2]!).toBeCloseTo(0.4950, 4)
  })

  it('refuses box-25 — the roundest bird\'s obvious ear is a DISC', () => {
    /*
     * The koala's dish is the reach anybody would make for "the roundest of the
     * four", and it is aspect 1.0000: x and y equal to six decimals, radial, and
     * `taper` 1.000. Laid on a flank it is a shield rather than a wing. It is
     * also claimed in writing by `animal-chinchilla.ts:22` for this same album
     * page, which is a second reason and not the first one.
     */
    const dish = partById('box-25')!
    expect(dish.size[0]).toBeCloseTo(dish.size[1]!, 6)
    expect(dish.shape.symmetry).toBe('radial')
    expect(dish.shape.taper).toBe(1)
    expect(CANARY_ASSEMBLY.features.some(f => f.part === 'box-25')).toBe(false)
  })

  it('refuses tube-04 — half the body, and a burial under §3\'s own floor', () => {
    // The elephant's ear is a genuine handed pair and needs ONE spin where
    // `box-06` needs two, so it was worth measuring rather than dismissing.
    expect(partById('tube-04')!.attachment!.dir).toBe(1)
    expect(partById('tube-05')!.attachment!.dir).toBe(-1)
    const buried = partById('tube-04')!.size[0]! * partById('tube-04')!.attachment!.sunkFractionMean
    expect(buried).toBeCloseTo(0.045293, 6)
    expect(buried, 'tube-04 now buries deep enough to be worth revisiting').toBeLessThan(0.125)
    expect(CANARY_ASSEMBLY.features.some(f => f.part.startsWith('tube-'))).toBe(false)
  })

  it('re-derives all four of the budgie\'s numbers rather than inheriting them', () => {
    const part = partById('box-06')!, hull = partById('box-39')!
    const wing = feature('wing')
    // Two spins: an ear's long axis and its facing are the same direction, and no
    // single axis-aligned turn does the three-cycle that puts the length on z
    // while the facing lands on +x.
    expect(wing.spin).toEqual([{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }])
    expect(wing.axis).toBe('z')
    expect(wing.dir).toBe(-1)
    // All three join coordinates are this hull's own.
    if (wing.placement.kind === 'pair') {
      expect(wing.placement.at[0]).toBe(hull.size[0]! / 2)
      expect(wing.placement.at[1]).toBe(hull.offset[1])
      expect(wing.placement.at[2]).toBe(0)
    }
    // And the sink is solved: the tip reaches past the flat side face, the
    // chamfer falls away 1:1 behind it, and §3's "nothing floats" makes that the
    // minimum burial. The shape's own is 0.1051 short of it.
    const tip = part.shape.longest / 2
    const flat = flatReach('box-39', 0, 2)
    expect(flat).toBeCloseTo(0.3125, 6)
    expect(tip - flat).toBeCloseTo(0.144149, 6)
    const needed = (tip - flat) / part.size[2]!
    expect(needed).toBeCloseTo(0.471328, 5)
    expect(needed - part.attachment!.sunkFractionMean).toBeCloseTo(0.105069, 5)
    expect(wing.sink! * 16).toBe(8)                       // the pack's own 1/16 grid
    expect(wing.sink! * part.size[2]!).toBeCloseTo(0.152918, 6)
    expect(wing.sink! * part.size[2]!).toBeGreaterThan(0.125)
  })

  it('has all four corners of its inner face INSIDE this hull, measured', () => {
    // Against `box-39`'s own face planes rather than `box-03`'s, so the shell
    // this species actually wears is the one that was checked.
    const g = build()
    const b = boxOf(g, 'wing-r')
    for (const y of [b.min.y, b.max.y]) {
      for (const z of [b.min.z, b.max.z]) {
        expect(insideHull('box-39', [b.min.x, y, z]),
          `the wing's inner face is outside the hull at y=${y}, z=${z}`).toBeGreaterThan(0)
      }
    }
    // And the outer face is outside it, so the wing is a wing and not a bulge.
    expect(insideHull('box-39', [b.max.x, 0.80625, 0])).toBeLessThan(0)
    expect(b.max.x - 0.625).toBeCloseTo(0.152918, 4)
    // The mirror carries the left one the other way for free (rule 6).
    expect((g.getObjectByName('wing-r')!.userData['facing'] as number[])[0]).toBeCloseTo(1, 6)
    expect((g.getObjectByName('wing-l')!.userData['facing'] as number[])[0]).toBeCloseTo(-1, 6)
  })
})

/* ------------------------------------------------------- the six refusals --- */

describe('animal-canary: six free mechanisms declined, and every one is pinned', () => {
  it('declines the painted BELLY line', () => {
    // §4's second way is free. A domestic yellow canary was bred to be exactly
    // one colour, and `animal-budgie.ts` spends this mechanism, which is half of
    // what separates the two birds.
    expect(CANARY_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(CANARY_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
  })

  it('declines the hull\'s OWN band cut, and that cut is the penguin\'s shirt', () => {
    // The sharpest of the six, because the two-tone is already drawn: band 3 is
    // 22 triangles on the FRONT FACE. A canary has no bib. If this ever goes red
    // the hull's cut has changed and refusal 2 needs re-arguing.
    const p = partById('box-39')!
    const bands = [...new Set(p.bands)].sort((a, b) => a - b)
    expect(bands).toEqual([3, 15])
    expect(p.bands.filter(b => b === 3)).toHaveLength(22)
    expect(bandMean('box-39', 3, 2)).toBeCloseTo(0.5114, 4)
    expect(bandMean('box-39', 3, 2)).toBeGreaterThan(bandMean('box-39', 15, 2))
    expect(CANARY_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('declines JT-044\'s two-tone foot on the pack\'s own leg row', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      // `box-01`'s own recorded offset, and the midline a biped must stand on.
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
    // One flat slot. A canary's legs and toes are the same pale pink from the
    // hock down; the budgie's dark toes are a budgie's.
    expect(leg.paint).toEqual({ base: 'limb' })
    expect(leg.paint.patch).toBeUndefined()
    // The feet still land on y = 0 exactly, which is what the two constants are for.
    expect(boxOf(build(), 'leg-front-r').min.y).toBeCloseTo(0, 6)
  })

  it('carries NO marking card of any kind, and the bank\'s four are named', () => {
    // `plate-10`/`plate-11` are the flank cards the salamander and the nightjar
    // wear; `plate-12`/`plate-16` are the nostril dots the budgie spends as
    // cheek patches. This animal has no marking at all — that is the species.
    for (const id of ['plate-10', 'plate-11', 'plate-12', 'plate-16']) {
      expect(partById(id), `${id} left the bank`).toBeDefined()
      expect(CANARY_ASSEMBLY.features.some(f => f.part === id)).toBe(false)
    }
    expect(CANARY_ASSEMBLY.features.filter(f => partById(f.part)!.roles.includes('card')))
      .toHaveLength(0)
  })

  it('carries no extra beyond two legs and two wings, and no crest or collar', () => {
    // The other three birds have a wing bar, a crest and a collar between them.
    // This one's entry in that column is "none", and it is an entry.
    expect(CANARY_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['eye', 'leg-front', 'snout', 'tail', 'wing'])
    expect(CANARY_ASSEMBLY.flag).toMatch(/DELIBERATELY PLAIN/i)
  })

  it('carries no stretch anywhere — not one part, and no hull scale', () => {
    // Joe flagged a non-uniform stretch on three animals on 2 August. Every shape
    // this species wears was already the right size.
    for (const f of CANARY_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(CANARY_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
    expect(CANARY_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })
})

/* ------------------------------------------------- smallest and roundest --- */

describe('animal-canary: "smallest, roundest" said in the only numbers this kit has', () => {
  it('is the nearest to SQUARE in plan, which is what roundest can mean here', () => {
    // The hull cannot say it: it is one of the pack's ten shells and is never
    // scaled, so every bird on this solid has the same body. What differs is the
    // whole animal's plan — and a short tail with nothing else on the flanks is
    // what brings the depth in.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.5558, 3)
    expect(s.z).toBeCloseTo(1.9023, 3)
    expect(s.z / s.x).toBeCloseTo(1.2227, 3)
    expect(s.z / s.x, 'the budgie is 1.394 and this must stay clear of it').toBeLessThan(1.30)
  })

  it('charges the smallest keep-out of the four, and stands on the floor', () => {
    // `pets.ts:652` makes the obstacle keep-out `max(width, depth) / 2`, and
    // `home-pets.ts:149-155` predicted the four birds would be cheap. This is the
    // cheapest of them: 0.9511 against the budgie's 1.0986 and the fox's 1.15.
    const g = build()
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.9511, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.0986)
    expect(s.y).toBeCloseTo(HEIGHT_FLOOR, 4)
  })

  it('wears the pack\'s own ROUND bird eye, painted dark instead of pale', () => {
    const card = partById('plate-08')!
    // 0.400 x 0.400 and radial; three of its five donors are the pack's three
    // birds. `animal-budgie.ts` wears this same card with a PALE iris ring — a
    // budgie's white iris — where a canary's eye is a plain black bead. Same
    // card, opposite treatment, which is as far as rule 5 lets an eye be moved.
    expect(card.shape.symmetry).toBe('radial')
    expect(card.size[0]).toBe(card.size[1])
    // The base is the dark slot; band 15 is Kenney's own cut and the builder
    // sends it to the measured pupil on every species, which is the glint.
    expect(feature('eye').paint).toEqual({ base: 'eye', byBand: { 15: 'pupil' } })
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // The dark slot exists for this card and nothing else — the eye is the only
    // dark thing on the animal, which is §1 restated as a palette.
    const wearers = CANARY_ASSEMBLY.features.filter(f => f.paint.base === 'eye')
    expect(wearers.map(f => f.name)).toEqual(['eye'])
    expect(Object.keys(CANARY_ASSEMBLY.palette)).toEqual(['coat', 'flight', 'limb', 'eye', 'pupil'])
  })

  it('flaps, and the motion names a part it actually has', () => {
    // The budgie is the first species in the project to declare a motion; a
    // second bird with a wing is the second that should. `motion.ts`'s own
    // measured defaults, nothing tuned, and it moves no vertex.
    const motion = CANARY_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    const g = build()
    for (const n of ['wing-r', 'wing-l']) expect(g.getObjectByName(n)).toBeDefined()
  })
})
