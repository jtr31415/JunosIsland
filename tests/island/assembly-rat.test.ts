/**
 * The rat. Home Pets' long-tailed rodent, and the first species whose whole
 * problem is a species in ANOTHER collection.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a rat can say, and it says five
 * things the next builder needs and cannot get from a screenshot:
 *
 *   1. **`wedge-15` is the TUFTED tail.** It is the longest in the bank and it is
 *      the obvious pick for "long"; it swells to 0.280 near its far end, which is
 *      1.4x its own shaft, and Kenney paints that swelling as its own band. The
 *      gerbil and the degu own the tuft, so it is refused here — measured, over
 *      the whole bank, so nobody helpfully picks it back up.
 *   2. **The bank has exactly TWO bare whips and they are one shape.** `wedge-07`
 *      and `wedge-18` agree to six decimals on every extent. That is why this
 *      species wears the same tail as the Garden mouse rather than the other one,
 *      and it is pinned so the reasoning survives.
 *   3. **The spin is the separation.** `{ axis: 'z', deg: 180 }` is the only
 *      axis-aligned half turn that leaves a tail facing backwards, and it inverts
 *      the arc. Proved by rotating the facing three ways.
 *   4. **The tail's height is not a taste.** The window is forced at both ends —
 *      the floor below, the flat rear face above — and exactly one point on the
 *      pack's 1/16 grid is inside it.
 *   5. **The hooded marking cannot be drawn**, and that is pinned as a fact about
 *      the BANK and the MECHANISM rather than as an opinion in a comment. If a
 *      later change makes a hood sayable, this file goes red and the flag comes
 *      off.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, RAT_ASSEMBLY, MOUSE_ASSEMBLY, EYE_CARD_Z, LEG_ROW,
  HULL_FRONT_Z, HULL_FRONT_Z_USUAL, OTHER_HULLS, MODEL_TRIS_MAX, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-rat',
  parts: ['box-01', 'box-02', 'box-32', 'box-41', 'plate-01', 'tube-07', 'wedge-07'],
  height: 1.5512,
  verts: 590,
  tris: 945,
  // The tiger's shell is 2.369 of bounding box against the tail's 0.116. Nothing
  // else on this animal is within a twentieth of the body.
  massRatio: 20,
  // One: the whip, turned a half turn so its arc falls away behind instead of
  // sweeping up. Said as a number, because rule 4's "no node carries a rotation"
  // passes vacuously on an animal with none — and because on this species the
  // spin IS the separation from a signed-off animal in another collection.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-rat')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)

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
 * How thick a shape is across x, in the slice of its own length nearest one end.
 *
 * This is the measurement that separates a whip from a tuft and no axis the
 * classification already has does it: `taper` compares the two END sections and
 * both of these shapes end in a point, so all three whips score 0.52.
 */
const thickestNear = (id: string, from: number, to: number): number => {
  const q = points(id).filter(p => p[1]! >= from && p[1]! <= to)
  return Math.max(...q.map(p => Math.abs(p[0]!))) * 2
}

const TAIL = RAT_ASSEMBLY.features.find(f => f.name === 'tail')!
const EAR = RAT_ASSEMBLY.features.find(f => f.name === 'ear')!
const SNOUT = RAT_ASSEMBLY.features.find(f => f.name === 'snout')!
const LEG = RAT_ASSEMBLY.features.find(f => f.name === 'leg')!

describe('animal-rat: the tail is the bank\'s only BARE whip', () => {
  it('refuses `wedge-15`, the LONGEST tail, because it is measurably a TUFT', () => {
    const tufted = partById('wedge-15')!
    const whip = partById('wedge-07')!
    // It really is the longest, which is why it has to be refused explicitly
    // rather than just not chosen: a builder searching for "long" finds it first.
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(Math.max(...tails.map(p => p.shape.longest))).toBeCloseTo(tufted.shape.longest, 6)
    expect(tufted.shape.longest).toBeGreaterThan(whip.shape.longest)

    // And it SWELLS at the far end. Measured in the top fifth of its own arc,
    // which is where a tuft is: 0.280 against a 0.200 shaft, 1.4x. The other two
    // whips only ever narrow. If this ever stops being true the gerbil and the
    // degu have lost their axis and this refusal should be re-argued.
    expect(thickestNear('wedge-15', 0.35, 0.55)).toBeCloseTo(0.28, 3)
    expect(thickestNear('wedge-07', 0.35, 0.55)).toBeLessThanOrEqual(0.2 + 1e-6)
    expect(thickestNear('wedge-18', 0.35, 0.55)).toBeLessThanOrEqual(0.2 + 1e-6)

    // Kenney agrees with the geometry: he paints the swelling separately. Band 5
    // is 40 triangles and every one of them is in the upper third of the shape.
    const band5 = [...tufted.bands.keys()].filter(t => tufted.bands[t] === 5)
    expect(band5).toHaveLength(40)
    for (const t of band5) {
      for (let k = 0; k < 3; k++) {
        expect(tufted.positions[tufted.indices[t * 3 + k]! * 3 + 1]!).toBeGreaterThan(0.28)
      }
    }
    expect(RAT_ASSEMBLY.features.some(f => f.part === 'wedge-15')).toBe(false)
  })

  it('is the only WHIP Kenney did not cut, which is what BARE means', () => {
    // Three tails in the bank are thin enough to read as bare — the 0.200 pair and
    // the 0.280 tuft — and of those three only this one is a single band, all 212
    // triangles. The other two carry a second band at their FAR END: on `wedge-15`
    // that is the tuft, on `wedge-18` the tiger's dark tip. Either would have to be
    // painted over to read as bare, and painting over Kenney's own cut is how a
    // part stops being the part. Not claimed of the whole tail bank, which would be
    // false: `box-18`, `box-38` and `wedge-03` are single-banded too, and all three
    // are plumes or stubs that belong to other members of this collection.
    const whips = PARTS_BANK.filter(p => p.roles.includes('tail') && Math.min(...p.size) <= 0.28)
    expect(whips.map(p => p.id).sort()).toEqual(['wedge-07', 'wedge-15', 'wedge-18'])
    expect(new Set(partById('wedge-07')!.bands).size).toBe(1)
    for (const p of whips) {
      if (p.id === 'wedge-07') continue
      expect(new Set(p.bands).size, `${p.id} is also single-banded`).toBeGreaterThan(1)
    }
    // So a rat's tail is one colour root to tip and there is nothing to redirect:
    // `paint` is a bare slot name with no `byBand` at all.
    expect(TAIL.paint).toEqual({ base: 'bare' })
  })

  it('wears the mouse\'s own whip, because the other bare one is the SAME SHAPE', () => {
    // The cross-collection twin risk, stated as a measurement. `wedge-18` is the
    // tiger's and the shrew wears it; taking it here to avoid sharing a part id
    // with a signed-off Garden species would have changed a pinned name and
    // nothing a child can see.
    const a = partById('wedge-07')!, b = partById('wedge-18')!
    for (let i = 0; i < 3; i++) expect(a.size[i]!).toBeCloseTo(b.size[i]!, 6)
    expect(a.tris).toBe(b.tris)
    // Both are the thinnest things in the tail bank, and by a clear margin: the
    // next tail up is 0.280 and the four plumes are 0.589 and thicker.
    const thin = (p: typeof a): number => Math.min(...p.size)
    expect(thin(a)).toBeCloseTo(0.2, 6)
    for (const p of PARTS_BANK.filter(q => q.roles.includes('tail'))) {
      if (p.id === 'wedge-07' || p.id === 'wedge-18') continue
      expect(thin(p), `${p.id} is as thin as the whip`).toBeGreaterThan(0.2)
    }
    // So the mouse and the rat share a shape ON PURPOSE. If the mouse ever stops
    // wearing it, or starts spinning it, the separation argument in this species'
    // header has changed and somebody should read it again.
    const mouseTail = MOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(mouseTail.part).toBe(TAIL.part)
    expect(mouseTail.spin).toBeUndefined()
  })
})

describe('animal-rat: the half turn is the separation, and it is the only one', () => {
  it('is the ONE axis-aligned half turn that leaves a tail facing backwards', () => {
    expect(TAIL.spin).toEqual([{ axis: 'z', deg: 180 }])
    // A tail attaches `z -1`. Turned 180 about z the facing is unchanged, so the
    // donor transfer still joins it at the rear face; turned about x or y it
    // points FORWARD and the join would be at the animal's nose. Written out here
    // rather than imported, so the kit cannot agree with itself.
    const turn = (p: number[], axis: 'x' | 'y' | 'z'): number[] => (
      axis === 'x' ? [p[0]!, -p[1]!, -p[2]!]
        : axis === 'y' ? [-p[0]!, p[1]!, -p[2]!]
          : [-p[0]!, -p[1]!, p[2]!])
    expect(turn([0, 0, -1], 'z')).toEqual([-0, -0, -1])
    expect(turn([0, 0, -1], 'x')[2]).toBe(1)
    expect(turn([0, 0, -1], 'y')[2]).toBe(1)
    expect(partById('wedge-07')!.attachment!.dir).toBe(-1)
    expect(partById('wedge-07')!.attachment!.axis).toBe('z')
  })

  it('INVERTS the arc: the root leaves the rump high and the tail falls away', () => {
    // The shape is a hook and not a rod. Unspun, the cross-section at its joining
    // end sits BELOW its own centre — y = -0.368 — and it sweeps back and up.
    const q = points('wedge-07')
    const zmax = Math.max(...q.map(p => p[2]!))
    const root = q.filter(p => Math.abs(p[2]! - zmax) < 1e-6)
    expect(root.every(p => p[1]! < 0)).toBe(true)
    expect(Math.max(...root.map(p => p[1]!))).toBeCloseTo(-0.368, 3)
    // Turned, that root is above the centre and the mass hangs below it. Measured
    // off the BUILT animal: the tail's own joining end is in the upper half of its
    // box, and its lowest point is a long way below where it leaves the body.
    const g = build()
    const t = boxOf(g, 'tail')
    const joinY = 0.5625 + 0.368
    expect(joinY).toBeGreaterThan((t.min.y + t.max.y) / 2)
    // And it falls to within 0.04 of the ground, which the mouse's never does:
    // that one is hung at 0.90 unspun and its lowest point is 0.377.
    expect(t.min.y).toBeLessThan(0.05)
    expect(t.min.y).toBeGreaterThan(0)
  })
})

describe('animal-rat: the tail\'s height is forced, and 9/16 is the only way in', () => {
  it('has a floor and a ceiling, both measured, with one grid point between', () => {
    const whip = partById('wedge-07')!
    const half = whip.size[1]! / 2
    // FLOOR: below this the tail's lowest point goes under y = 0, and
    // `buildAssembly` grounds the whole group on its minimum — so the FEET would
    // leave the floor rather than the tail being clipped.
    const floor = half
    expect(floor).toBeCloseTo(0.5232935, 6)
    // CEILING: the flat part of this hull's rear face reaches y = 1.11875, and the
    // topmost point of the tail's join cross-section is its own bounding-box top.
    // Past this the join is on a chamfer that has fallen away — §3, nothing floats.
    const hull = partById('box-41')!
    const q = points('box-41')
    const hz = Math.max(...q.map(p => Math.abs(p[2]!)))
    const rear = q.filter(p => Math.abs(p[2]! + hz) < 1e-6)
    const rearTop = hull.offset[1]! + Math.max(...rear.map(p => p[1]!))
    expect(rearTop).toBeCloseTo(1.11875, 6)
    const ceiling = rearTop - half
    expect(ceiling).toBeCloseTo(0.5954565, 6)

    // And the pack is authored on a 1/16 grid, so the honest choices inside that
    // window are the k/16 in it. There is exactly one.
    const grid: number[] = []
    for (let k = 1; k < SLOT_PX; k++) {
      const v = k / SLOT_PX
      if (v >= floor && v <= ceiling) grid.push(v)
    }
    expect(grid).toEqual([9 / SLOT_PX])
    expect(9 / SLOT_PX).toBe(0.5625)
    if (TAIL.placement.kind === 'single') {
      expect(TAIL.placement.at).toEqual([0, 0.5625, -0.625])
    }
    // Everything else about it is the pack's own: the shape's measured burial over
    // its two donors, and this hull's own rear plane.
    expect(TAIL.sink).toBeCloseTo(whip.attachment!.sunkFractionMean, 9)
  })

  it('lands the whole join on the FLAT rear face, and clears the ground', () => {
    const g = build()
    const t = boxOf(g, 'tail')
    // Top of the tail under the top of the flat face, with 0.03 to spare; bottom
    // above zero, so the animal still stands on its feet and is grounded by them.
    expect(t.max.y).toBeLessThan(1.11875)
    expect(t.max.y).toBeCloseTo(1.0858, 3)
    expect(t.min.y).toBeCloseTo(0.0392, 3)
    expect(new THREE.Box3().setFromObject(g).min.y).toBeCloseTo(0, 3)
    // It is joined at the rear plane and reaches 0.467 behind it — the whole
    // reason this animal's keep-out is depth and not width.
    expect(t.max.z).toBeCloseTo(-0.5367, 3)
    expect(t.min.z).toBeCloseTo(-1.0919, 3)
  })
})

describe('animal-rat: box-41 is the cube one size up, and it is not a stretch', () => {
  it('is the pack\'s own BIGGER shell, at 1.213x the cube\'s volume', () => {
    expect(RAT_ASSEMBLY.hull.part).toBe(OTHER_HULLS.bigger)
    expect(RAT_ASSEMBLY.hull.stretch).toBeUndefined()
    const big = partById('box-41')!, cube = partById('box-03')!
    const vol = (p: typeof big): number => p.size[0]! * p.size[1]! * p.size[2]!
    expect(vol(big) / vol(cube)).toBeCloseTo(1.213, 3)
    // Bigger on all three axes, which is what makes it sayable as "one size up"
    // rather than "a different shape". No other hull in the bank manages it.
    for (let i = 0; i < 3; i++) expect(big.size[i]!).toBeGreaterThan(cube.size[i]!)
    for (const p of PARTS_BANK.filter(q => q.roles.includes('hull') && q.id !== 'box-41')) {
      const bigger = [0, 1, 2].every(i => p.size[i]! > cube.size[i]!)
      expect(bigger, `${p.id} is also bigger on all three axes`).toBe(false)
    }
  })

  it('carries the CUBE\'s own rear face — same plane, same span, to the decimal', () => {
    // This is why the tail transfers cleanly and why it is comparable with the
    // mouse's at all: the animal is bigger everywhere except where the tail joins.
    const face = (id: string): { z: number; y: [number, number]; x: number } => {
      const p = partById(id)!
      const q = points(id)
      const hz = Math.max(...q.map(v => Math.abs(v[2]!)))
      const f = q.filter(v => Math.abs(v[2]! + hz) < 1e-6)
      return {
        z: p.offset[2]! - hz,
        y: [p.offset[1]! + Math.min(...f.map(v => v[1]!)),
          p.offset[1]! + Math.max(...f.map(v => v[1]!))],
        x: Math.max(...f.map(v => Math.abs(v[0]!))),
      }
    }
    const big = face('box-41'), cube = face('box-03')
    expect(big.z).toBeCloseTo(cube.z, 9)
    expect(big.z).toBeCloseTo(-0.625, 9)
    expect(big.y[0]).toBeCloseTo(cube.y[0], 9)
    expect(big.y[1]).toBeCloseTo(cube.y[1], 9)
    expect(big.x).toBeCloseTo(cube.x, 9)
  })

  it('pays for the extra depth at the FRONT, and the muzzle carries the 0.100', () => {
    // Every face part transfers onto this hull 0.100 ahead of its donor's recorded
    // offset, because the front face is 0.100 further out. Pinned as the
    // DIFFERENCE, so a change to either constant is a red test rather than a sum
    // that quietly still adds up.
    expect(HULL_FRONT_Z['box-41']! - HULL_FRONT_Z_USUAL).toBeCloseTo(0.1, 9)
    if (SNOUT.placement.kind === 'single') {
      expect(SNOUT.placement.at[2]).toBeCloseTo(HULL_FRONT_Z['box-41']!, 9)
    }
    const g = build()
    const s = boxOf(g, 'snout')
    expect((s.min.z + s.max.z) / 2 - partById('tube-07')!.offset[2]!).toBeCloseTo(0.1, 3)
  })

  it('takes the TIGER\'s own eye card, on the TIGER\'s own hull', () => {
    // Not a default that happened to be tolerable: `plate-01`'s donors include the
    // tiger, and `box-41` is the tiger's shell, so the eye plane here is a
    // recovery. On this hull the card's inner-lower corner tucks behind the muzzle
    // bulge, because the front face is 0.725 and the card is at 0.635 — Kenney's
    // arrangement of his own animal's face, and rule 5 makes it unsayable anyway.
    const card = partById('plate-01')!
    expect(card.provenance.some(p => p.species === 'tiger')).toBe(true)
    expect(partById('box-41')!.provenance.every(p => p.species === 'tiger')).toBe(true)
    const eye = RAT_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    expect(EYE_CARD_Z).toBeLessThan(HULL_FRONT_Z['box-41']!)
  })
})

describe('animal-rat: the ears are round, small, and the pack\'s one rodent\'s', () => {
  it('is one of only three ROUND ears in the bank, and the other two are spoken for', () => {
    const round = PARTS_BANK.filter(p => p.roles.includes('ear')
      && p.shape.taper === 1 && p.shape.symmetry === 'radial').map(p => p.id)
    // `box-25` is the koala's 0.7427 dish — the mouse's whole silhouette argument,
    // and inside this collection the chinchilla is the member given the ears.
    // `box-05` is the bee's button, which the pack sinks 0.000, so on a hull as
    // chamfered as this one it would float clean off. That leaves one.
    expect(round.sort()).toEqual(['box-02', 'box-05', 'box-25'])
    expect(partById('box-05')!.attachment!.sunkFractionMax).toBe(0)
    expect(partById('box-25')!.size[0]! / partById('box-02')!.size[0]!).toBeCloseTo(2.36, 2)
    expect(EAR.part).toBe('box-02')
    expect(RAT_ASSEMBLY.features.some(f => f.part === 'box-25')).toBe(false)
  })

  it('is the BEAVER\'s — the only rodent among the 24 — at the beaver\'s own numbers', () => {
    const ear = partById('box-02')!
    expect(ear.provenance.some(p => p.species === 'beaver' && p.role === 'ear')).toBe(true)
    // x and z are untouched by a join to the top face, so they are the bank's
    // recorded offset; y is THIS hull's top. Nothing here was chosen.
    const hull = partById('box-41')!
    if (EAR.placement.kind === 'pair') {
      expect(EAR.placement.at[0]).toBeCloseTo(ear.offset[0]!, 9)
      expect(EAR.placement.at[1]).toBeCloseTo(hull.offset[1]! + hull.size[1]! / 2, 9)
      expect(EAR.placement.at[2]).toBeCloseTo(ear.offset[2]!, 9)
    }
    // Sunk the pack's own burial, and the pack gave exactly one value over four
    // instances — there is no shallower reading of this ear to reach for.
    expect(EAR.sink).toBeCloseTo(ear.attachment!.sunkFractionMean, 9)
    expect(ear.attachment!.sunkFractionMin).toBe(ear.attachment!.sunkFractionMax)
  })

  it('stands only 0.070 proud, and that is said out loud rather than tuned away', () => {
    const ear = partById('box-02')!
    const proud = ear.size[1]! * (1 - ear.attachment!.sunkFractionMean)
    expect(proud).toBeCloseTo(0.07, 3)
    const g = build()
    expect(boxOf(g, 'ear-r').max.y - boxOf(g, 'hull').max.y).toBeCloseTo(0.07, 3)
    // Which means the EARS set this animal's height, and nothing else does: the
    // turned tail stays under the line of its own back.
    const all = new THREE.Box3().setFromObject(g)
    expect(all.max.y).toBeCloseTo(boxOf(g, 'ear-r').max.y, 6)
    expect(boxOf(g, 'tail').max.y).toBeLessThan(boxOf(g, 'hull').max.y)
  })

  it('is set BEHIND the face, and admits that one mass leaves nowhere further back', () => {
    // "Rounded ears set well back" is the description; rule 3 is one mass, so
    // there is no head for an ear to be set back ON. Measured against what there
    // is, it sits behind the eye plane — but the mouse's is further back still, so
    // depth is not what separates these two. Size is, and this pins which claim
    // this species is actually making.
    const g = build()
    expect(boxOf(g, 'ear-r').max.z).toBeLessThan(EYE_CARD_Z)
    const mouseEar = MOUSE_ASSEMBLY.features.find(f => f.name === 'ear')!
    if (mouseEar.placement.kind === 'pair' && EAR.placement.kind === 'pair') {
      expect(mouseEar.placement.at[2]).toBeLessThan(EAR.placement.at[2])
    }
  })
})

describe('animal-rat: the muzzle is the only 0.532 barrel the pack ever SANK', () => {
  it('picks the giraffe\'s out of three identical boxes, on the burial', () => {
    const three = ['tube-03', 'tube-06', 'tube-07'].map(id => partById(id)!)
    // Same bounding box to three decimals on x and y — the deer's, the fox's and
    // the giraffe's are one muzzle drawn three times. Only one of them is buried.
    for (const p of three) {
      expect(p.size[0]!).toBeCloseTo(0.532, 3)
      expect(p.size[1]!).toBeCloseTo(0.3, 3)
    }
    expect(partById('tube-03')!.attachment!.sunkFractionMean).toBe(0)
    expect(partById('tube-06')!.attachment!.sunkFractionMean).toBe(0)
    expect(partById('tube-07')!.attachment!.sunkFractionMean).toBeGreaterThan(0)
    expect(SNOUT.part).toBe('tube-07')
    expect(SNOUT.sink).toBeCloseTo(partById('tube-07')!.attachment!.sunkFractionMean, 9)
  })

  it('needs that burial, because THIS hull\'s flat front face is only 0.400 across', () => {
    // The measurement that decides it, and it is true of `box-41` and of no other
    // usual hull: the cube's front face is 0.625 square and this one is 0.400 by
    // 0.400. A 0.532-wide muzzle laid flush would overhang by 0.066 a side.
    const q = points('box-41')
    const hz = Math.max(...q.map(p => Math.abs(p[2]!)))
    const front = q.filter(p => Math.abs(p[2]! - hz) < 1e-6)
    const halfFace = Math.max(...front.map(p => Math.abs(p[0]!)))
    expect(halfFace).toBeCloseTo(0.2, 6)
    expect(points('box-03').filter(p => Math.abs(p[2]! - 0.625) < 1e-6)
      .reduce((a, p) => Math.max(a, Math.abs(p[0]!)), 0)).toBeCloseTo(0.3125, 6)
    // §8 step 4: a flat face ends and the chamfer falls away 1:1, so a part buried
    // `d` stays embedded out to `halfFace + d`. 0.200 + 0.100 clears the muzzle's
    // own 0.266 half width — which `tube-03` and `tube-06`, buried nothing, do not.
    const muzzle = partById('tube-07')!
    const d = muzzle.attachment!.sunkFractionMean * muzzle.size[2]!
    expect(d).toBeCloseTo(0.1, 3)
    expect(halfFace + d).toBeGreaterThan(muzzle.size[0]! / 2)
    expect(halfFace + 0).toBeLessThan(muzzle.size[0]! / 2)
  })

  it('is a mouse\'s muzzle one size up, at the same taper', () => {
    // The hull's argument again, on the face: same blunt barrel, 1.71x across.
    const rat = partById('tube-07')!, mouse = partById('tube-01')!
    expect(rat.shape.taper).toBe(mouse.shape.taper)
    expect(rat.size[0]! / mouse.size[0]!).toBeCloseTo(1.71, 2)
    expect(MOUSE_ASSEMBLY.features.find(f => f.name === 'snout')!.part).toBe('tube-01')
  })

  it('hangs the nose on the muzzle\'s own front plane and beds it in', () => {
    const g = build()
    const front = boxOf(g, 'snout').max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // Sunk its own 0.2929, which beds 0.050 of it into the muzzle so there is no
    // seam — the mouse's `box-09` is sunk 0.000 and simply touches.
    const button = partById('box-32')!
    expect(button.attachment!.sunkFractionMean * button.size[2]!).toBeCloseTo(0.05, 3)
    expect(button.size[2]! / partById('box-09')!.size[2]!).toBeCloseTo(2.14, 2)
    // And deliberately not `wedge-10`: measurably the better nose tip on every
    // axis the classification has, and it reads as a TONGUE. Joe rejected it by
    // name on the hedgehog and the lesson is not the hedgehog's alone.
    expect(RAT_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(button.roles).toContain('nose')
  })
})

describe('animal-rat: JT-044\'s two-tone leg, worn as a bare pink foot', () => {
  it('patches the leg on the pack\'s 1/16 grid, and on the base slot only', () => {
    expect(LEG.paint).toEqual({ base: 'limb', patch: { below: 'bare', at: 0.25 } })
    // All three of the ruling's constraints, checked rather than recited.
    expect(0.25 * SLOT_PX).toBe(4)                    // on the grid, or texture.ts refuses it
    expect(LEG.paint.byBand).toBeUndefined()          // never `patch` and `byBand` together
    expect(LEG.spin).toBeUndefined()                  // a spun patch spins its boundary
    // And the fourth: two parts patching the SAME base slot at different heights
    // throws. The belly is on `coat` and the paws are on `limb`.
    expect(RAT_ASSEMBLY.hull.paint.base).toBe('coat')
    expect(RAT_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    expect(LEG.paint.base).not.toBe(RAT_ASSEMBLY.hull.paint.base)
  })

  it('puts the boundary where a child can see it, which is most of what shows', () => {
    const leg = partById(LEG_ROW.part)!
    const boundary = 0.25 * leg.size[1]!
    expect(boundary).toBeCloseTo(0.0766, 4)
    // The leg is sunk 0.408163, so only 0.18125 of it is ever out of the belly —
    // and the pale runs 0.0766 of that, which is 42% of the visible leg. On the
    // whole part it would read as a sixth; on what shows, it is a paw.
    const visible = leg.size[1]! * (1 - LEG_ROW.sink)
    expect(visible).toBeCloseTo(0.18125, 5)
    expect(boundary / visible).toBeCloseTo(0.42, 2)
    expect(LEG.part).toBe(LEG_ROW.part)
    expect(LEG.sink).toBe(LEG_ROW.sink)
  })

  it('spends one palette slot on three things that are the same bare skin', () => {
    // `bare` is the fifth slot and it is the capability the brief calls "a part
    // can have a colour of its own". A rat's tail, feet and nose are one material
    // and one colour, and the mouse paints its own tail `limb` — the same dark as
    // its legs — which is the difference this slot exists to make.
    expect(RAT_ASSEMBLY.palette['bare']).toBeDefined()
    expect(TAIL.paint.base).toBe('bare')
    expect(RAT_ASSEMBLY.features.find(f => f.name === 'nose')!.paint.base).toBe('bare')
    expect(LEG.paint.patch!.below).toBe('bare')
    expect(MOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!.paint.base).toBe('limb')
    // Small palette, every colour justified: five slots, and the insertion order
    // is the texture layout, so this is data and not decoration.
    expect(Object.keys(RAT_ASSEMBLY.palette))
      .toEqual(['coat', 'belly', 'bare', 'limb', 'pupil'])
  })
})

describe('animal-rat: the hood, and why none of the three mechanisms reaches it', () => {
  it('cannot say "the FRONT END is dark": a patch carries a height and nothing else', () => {
    // Structural, and the first half of the reason this species is flagged.
    // `Paint.patch` is { below, at } — `at` is a fraction of the part's HEIGHT, so
    // the boundary is a level plane and there is no z term to reach for. A hood is
    // a z-region, and rule 3 leaves no separate head to paint instead.
    const patch = RAT_ASSEMBLY.hull.paint.patch!
    expect(Object.keys(patch).sort()).toEqual(['at', 'below'])
    expect(typeof patch.at).toBe('number')
    expect(RAT_ASSEMBLY.features.some(f => f.part.includes('head'))).toBe(false)
  })

  it('has no BAND on this hull that is the head end — measured off the shell', () => {
    // The second half. `byBand` can only cut where Kenney already cut, and this
    // shell's cuts are the tiger's markings. A hood needs a band whose triangles
    // are all forward AND reach the top of the animal; not one of the three is.
    const hull = partById('box-41')!
    const bands = [...new Set(hull.bands)]
    expect(bands.length).toBe(3)
    const top = Math.max(...points('box-41').map(p => p[1]!))
    for (const b of bands) {
      const ys: number[] = [], zs: number[] = []
      for (let t = 0; t < hull.bands.length; t++) {
        if (hull.bands[t] !== b) continue
        for (let k = 0; k < 3; k++) {
          const vi = hull.indices[t * 3 + k]!
          ys.push(hull.positions[vi * 3 + 1]!)
          zs.push(hull.positions[vi * 3 + 2]!)
        }
      }
      const forward = Math.min(...zs) >= -1e-6
      const reachesTop = Math.max(...ys) >= top - 1e-6
      expect(forward && reachesTop, `band ${b} of box-41 IS a hood`).toBe(false)
    }
  })

  it('has no CARD in the bank big enough to be one — measured, not assumed', () => {
    // The third. The only marking cards in the pack are the cow's and the
    // giraffe's flank blotches, both side-mounted, and the two face cards are
    // mouth lines. A hood has to cross the top of a 1.350-wide animal.
    const cards = PARTS_BANK.filter(p => p.roles.includes('card'))
    expect(cards.length).toBeGreaterThan(0)
    const width = partById('box-41')!.size[0]!
    for (const p of cards) {
      const longest = Math.max(...p.size)
      expect(longest, `${p.id} could cover this animal's head`).toBeLessThan(width / 2)
    }
    expect(RAT_ASSEMBLY.features.some(f => partById(f.part)?.roles.includes('card')))
      .toBe(false)
  })

  it('flags all of that where Joe reads it, and authors nothing to fake it', () => {
    const flag = RAT_ASSEMBLY.flag!
    expect(flag).toMatch(/CANNOT BE EXPRESSED/)
    expect(flag).toMatch(/hood/i)
    expect(flag).toMatch(/patch/i)
    // It also has to carry the OTHER thing he is being asked to look at: that this
    // animal's tail is the same shape as a Garden species he has already signed
    // off. If that sentence ever goes, the twin risk stops being surfaced.
    expect(flag).toMatch(/wedge-07/)
    expect(flag).toMatch(/mouse/i)
    // Flagged for the marking and for nothing else: no bespoke shape, no stretch,
    // and no budget declared, because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(RAT_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(RAT_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
  })
})

describe('animal-rat: the accounting, because this is the dearest animal so far', () => {
  it('leaves SIX triangles of headroom, which is why there is no mouth card', () => {
    // Rule 9's ceiling is checked at definition time and it is real. The spend is
    // hull 262, tail 212, ears 184, legs 176, eyes 54, nose 29, muzzle 28 — every
    // one of them on something the animal is named by. `plate-13` is 14 and does
    // not fit, which is a decision rather than an oversight; recorded here so
    // nobody spends the last six on something small.
    const spend = partById('box-41')!.tris
      + partById('wedge-07')!.tris
      + partById('box-02')!.tris * 2
      + partById('box-01')!.tris * 4
      + partById('plate-01')!.tris * 2
      + partById('box-32')!.tris
      + partById('tube-07')!.tris
    expect(spend).toBe(945)
    expect(MODEL_TRIS_MAX - spend).toBe(6)
    expect(spend + partById('plate-13')!.tris).toBeGreaterThan(MODEL_TRIS_MAX)
  })

  it('fits between two trees, and it is the DEPTH that costs, not the width', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The ears are
    // small and side-set, so 1.350 of hull is the whole width; the muzzle in front
    // and the whip behind make 2.104 of depth.
    expect(s.x).toBeCloseTo(1.35, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.052, 2)
    // Inside the fox's 1.15, which is the pack's worst and the number the island
    // already copes with — and inside this collection's own 1.28 ratchet.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
