/**
 * The cockatiel. Home Pets' third cage bird, and the first species in the project
 * that wears a CREST.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a cockatiel can say,
 * and it says six things:
 *
 *   1. **`box-21` IS REFUSED, and all four reasons are measured off the bank**
 *      rather than argued. `animal-budgie.ts` measured that shell as a cube
 *      wearing the fox's ears and then RECOMMENDED it to this species as a crest;
 *      the first half is confirmed here and the second half is overturned. If any
 *      of the four numbers ever changes — a band added to the lugs, the midline
 *      gap closing — this file goes red and the refusal is reconsidered rather
 *      than inherited.
 *   2. **`cone-01` is one of only TWO true points in all 94 records**, which is
 *      why it is the crest, and its three numbers are each SOLVED — including a
 *      donor-transfer recovery onto the bank's own recorded height that the solve
 *      never used.
 *   3. **The crest's whole buried base is inside the shell**, checked against
 *      `box-03`'s own face planes rather than against the arithmetic that put it
 *      there.
 *   4. **The orange cheek cannot be bigger**, and the refusal is a window: 0.1125
 *      of clear face beside the bill, against a card that is 0.2529. Pinned over
 *      every solid nose in the bank, so it is a fact about the SHELL.
 *   5. **The yellow face cannot be drawn at all**, and both routes are closed by
 *      a measurement — the badger's flag on a different animal.
 *   6. **The wing and the cheek are the BUDGIE'S, byte for byte**, asserted
 *      against that species' own build so "four birds read as one family" is a
 *      checkable claim and not a comment.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, COCKATIEL_ASSEMBLY, BUDGIE_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL,
  LEG_ROW, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { MOTIONS } from '../../src/island/species/parts/motion'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-cockatiel',
  parts: [
    'box-01', 'box-03', 'box-06', 'cone-01', 'cone-06', 'plate-08', 'plate-16',
    'wedge-18',
  ],
  // The crest, and it is the whole of the difference: every other cage bird
  // stands on the pack's own HEIGHT_FLOOR of 1.43125.
  height: 1.7066,
  verts: 475,
  tris: 606,
  // TWO legs, not four. A bird.
  legs: 2,
  // The wing is the biggest thing it wears — bigger than the tail, because a
  // 0.200-thin whip has almost no box — and the hull is fourteen times it.
  massRatio: 14,
  // The tail, turned to point straight back, and the wing pair turned onto the
  // flank. The crest is NOT one: it stands the way its own attachment does.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-cockatiel')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof COCKATIEL_ASSEMBLY.features[number] =>
  COCKATIEL_ASSEMBLY.features.find(f => f.name === name)!

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
 * How far a WORLD point sits inside `box-03`, measured against every one of the
 * shell's own face planes.
 *
 * `box-03` is convex, so the nearest plane binds and a positive number means
 * embedded. Written out here rather than asked of the builder, because the thing
 * being checked is whether the BUILDER's arithmetic put the crest inside the
 * body — a shared implementation would let that agree with itself.
 * `assembly-budgie.test.ts` carries the same helper for its wing.
 */
function insideHull(w: readonly [number, number, number]): number {
  const p = partById('box-03')!
  const at = p.offset
  const q = [w[0] - at[0]!, w[1] - at[1]!, w[2] - at[2]!]
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
    const sgn = dot(n, v[0]!) < 0 ? -1 : 1
    const nn = n.map(c => (c * sgn) / len)
    const d = dot(nn, v[0]!) - dot(nn, q)
    if (d < worst) worst = d
  }
  return worst
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

/** How many triangles a part gives a band. */
const bandCount = (id: string, band: number): number =>
  partById(id)!.bands.filter(b => b === band).length

/** How far one of `box-03`'s flat faces reaches along another axis. */
const flatReach = (face: 0 | 1 | 2, along: 0 | 1 | 2): number => Math.max(
  ...points('box-03')
    .filter(q => Math.abs(Math.abs(q[face]) - 0.625) < 1e-6)
    .map(q => Math.abs(q[along])),
)

describe('animal-cockatiel: box-21 was recommended to this bird, and it is refused', () => {
  it('is a 1.250 cube below its own +0.4975, exactly as the budgie measured', () => {
    // Confirmed, not disputed: `animal-budgie.ts` found this and it is re-derived
    // here off the same 340 points, because the REFUSAL below only means anything
    // if the shape it refuses is the shape that file described.
    const fox = partById('box-21')!
    expect(fox.size[1]).toBeCloseTo(1.505075, 6)
    const body = points('box-21').filter(q => q[1]! <= 0.4975 + 1e-4)
    expect(Math.max(...body.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.625, 4)
    expect(Math.max(...body.map(q => Math.abs(q[2]!)))).toBeCloseTo(0.625, 4)
    const top = body.filter(q => Math.abs(q[1]! - 0.4975) < 1e-4)
    expect(top).toHaveLength(12)
    expect(Math.max(...top.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.3125, 4)
    // Its only donor is the fox, and the fox has no separate ear record anywhere
    // in the bank: the ears are IN the shell.
    expect([...new Set(fox.provenance.map(q => q.species))]).toEqual(['fox'])
    expect(PARTS_BANK.filter(p => p.provenance.some(
      q => q.species === 'fox' && q.role === 'ear'))).toHaveLength(0)
  })

  it('REFUSAL 1: its lugs cannot be painted separately from the body', () => {
    /*
     * The one that decides it. A cockatiel's crest is YELLOW on a GREY bird and
     * that contrast is half of what makes the feature nameable — so a "crest"
     * that has to wear the body's colour is not one.
     *
     * `box-21` carries three bands and the lugs are not one of them: band 7 is
     * the WHOLE shell, band 3 is the underside, and band 5 — the only band that
     * IS on the lugs — is Kenney's own inner-EAR cut on their forward faces,
     * exactly as band 5 of `box-12` is the cow's. If a band is ever added that
     * isolates the lugs, this goes red and the hull is worth another look.
     */
    const fox = partById('box-21')!
    expect([...new Set(fox.bands)].sort((a, b) => a - b)).toEqual([3, 5, 7])
    expect(bandCount('box-21', 7)).toBe(168)
    const band7 = (axis: 0 | 1 | 2): number[] => {
      const v: number[] = []
      for (let t = 0; t < fox.bands.length; t++) {
        if (fox.bands[t] !== 7) continue
        for (let k = 0; k < 3; k++) v.push(fox.positions[fox.indices[t * 3 + k]! * 3 + axis]!)
      }
      return v
    }
    // Band 7 spans the whole shell on every axis — body AND lugs — so `byBand`
    // cannot reach a lug without painting the body with it.
    expect(Math.min(...band7(0))).toBeCloseTo(-0.625, 4)
    expect(Math.max(...band7(0))).toBeCloseTo(0.625, 4)
    expect(Math.min(...band7(1))).toBeCloseTo(-0.7525, 4)
    expect(Math.max(...band7(1))).toBeCloseTo(0.7525, 4)
    // And band 5 is ten triangles on the lugs' forward faces: the inner ear.
    expect(bandCount('box-21', 5)).toBe(10)
    expect(bandMean('box-21', 5, 2)).toBeGreaterThan(0.41)
    expect(bandMean('box-21', 5, 1)).toBeGreaterThan(0.37)
  })

  it('REFUSAL 2: there is nothing on its midline — the crown between them is bare', () => {
    // A crest is ONE plume on the midline. Two bumps with a valley between them
    // is a read a child already has a word for, and the word is ears.
    const above = points('box-21').filter(q => q[1]! > 0.4975 + 1e-4)
    expect(above.length).toBeGreaterThan(100)
    const inner = Math.min(...above.map(q => Math.abs(q[0]!)))
    expect(inner).toBeCloseTo(0.218, 3)
    // 0.436 of bare crown — 35% of the hull's own 1.250 width.
    expect(2 * inner).toBeCloseTo(0.436, 3)
    expect((2 * inner) / partById('box-21')!.size[0]!).toBeGreaterThan(0.34)
    // And every one of them is FORWARD as well as off-centre: a lug over the
    // brow, which is where an ear goes and not where a crest sits.
    for (const q of above) {
      expect(Math.abs(q[0]!), 'a point on the midline above the body').toBeGreaterThan(0.2)
      expect(q[2]!, 'a point behind the brow').toBeGreaterThan(0.2)
    }
  })

  it('REFUSAL 3: the lugs are SHORTER than the crest, at 124 more triangles', () => {
    // The comparison that makes the refusal cheap rather than principled.
    const above = points('box-21').filter(q => q[1]! > 0.4975 + 1e-4)
    const lug = Math.max(...above.map(q => q[1]!)) - 0.4975
    expect(lug).toBeCloseTo(0.255, 4)
    const crest = partById('cone-01')!
    const proud = crest.size[1]! * (1 - crest.attachment!.sunkFractionMean)
    expect(proud).toBeCloseTo(0.275356, 6)
    expect(proud).toBeGreaterThan(lug)
    // And the shell that carries the shorter one costs 124 triangles more than
    // the one that does not, before the crest is even added.
    expect(partById('box-21')!.tris - partById('box-03')!.tris).toBe(124)
    expect(crest.tris).toBe(34)
  })

  it('REFUSAL 4: so this bird is on box-03, and the crest is a part', () => {
    // Because 1 and 2 mean a real crest is needed anyway, `box-21` would not
    // replace it — it would add two ears underneath it.
    expect(COCKATIEL_ASSEMBLY.hull.part).toBe('box-03')
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.part === 'box-21')).toBe(false)
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.name.startsWith('ear'))).toBe(false)
    // `box-03` is the parrot's and the chick's own shell, which is what makes the
    // beak below a recovery rather than an inference.
    const donors = partById('box-03')!.provenance.map(q => q.species)
    expect(donors).toContain('parrot')
    expect(donors).toContain('chick')
    expect(COCKATIEL_ASSEMBLY.flag).toMatch(/box-21 THAT IS NOT/)
  })

  it('is nonetheless the TALLEST of the four cage birds, off the crest', () => {
    // `home-pets.ts:104` asks for a height ladder and `animal-budgie.ts` proved
    // the HULL cannot give one: nine of the pack's ten shells are 1.25 tall or
    // less and the tenth is bigger on all three axes, so every cage bird stands
    // on HEIGHT_FLOOR. The crest is where the ladder comes back.
    const h = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3()).y
    expect(h).toBeCloseTo(1.7066, 3)
    expect(h).toBeGreaterThan(HEIGHT_FLOOR)
    expect(h - HEIGHT_FLOOR).toBeCloseTo(0.275356, 4)   // exactly the crest's reach
    expect(h / HEIGHT_FLOOR).toBeGreaterThan(1.19)
  })
})

describe('animal-cockatiel: the crest is one of only two true points in the bank', () => {
  it('reaches for `cone-01` because the bank has nothing else POINTED', () => {
    // Measured over all 94 records: `taper` is 0 on exactly two of them, and the
    // other is the beak this bird is already wearing. The day a third is banked,
    // this goes red and the choice is worth re-taking.
    const points0 = PARTS_BANK.filter(p => p.shape.taper === 0).map(p => p.id).sort()
    expect(points0).toEqual(['cone-01', 'cone-06'])
    expect(feature('crest').part).toBe('cone-01')
    expect(feature('snout').part).toBe('cone-06')
    // The 23 ear shapes offer nothing else: everything with more reach than
    // `cone-01` is either blunt or handed, and a handed shape on the midline is
    // a LEFT ear worn as a crest.
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(ears.length).toBe(23)
    for (const p of ears) {
      if (p.id === 'cone-01') continue
      const proud = p.size[1]! * (1 - (p.attachment?.sunkFractionMean ?? 0))
      const better = proud > 0.275356 && p.shape.taper < 0.5
      expect(better && p.shape.symmetry !== 'handed',
        `${p.id} is a taller, pointier, unhanded crest than cone-01`).toBe(false)
    }
    // It is the bee's and the caterpillar's ANTENNA, which is §3.1's whole point:
    // the hedgehog wears it as a quill and the nightjar as a bristle.
    expect([...new Set(partById('cone-01')!.provenance.map(q => q.species))].sort())
      .toEqual(['bee', 'caterpillar'])
  })

  it('stands the way its own attachment does — unspun, unstretched, unsunk', () => {
    const crest = partById('cone-01')!
    // `y +1` is straight up out of a top face, so no spin is needed and none is
    // given: a lean would be a chosen angle, and an alert cockatiel's crest is
    // vertical anyway.
    expect(crest.attachment!.axis).toBe('y')
    expect(crest.attachment!.dir).toBe(1)
    expect(feature('crest').spin).toBeUndefined()
    expect(feature('crest').axis).toBeUndefined()
    expect(feature('crest').stretch).toBeUndefined()
    // And the sink is the shape's own, which is already §3's 0.125 floor for an
    // embedded part — so it could not honestly have been buried less.
    expect(feature('crest').sink).toBeCloseTo(crest.attachment!.sunkFractionMean, 9)
    expect(crest.attachment!.sunkUnitsMean).toBeCloseTo(0.125, 6)
  })

  it('recovers the bank\'s own recorded HEIGHT for the shape, from a solve that never used it', () => {
    const crest = partById('cone-01')!
    const g = build()
    // Joined at `box-03`'s own top face. `shift = -s.lo - sink x extent` is
    // 0.200178 - 0.125, so the centre lands on the shape's own recorded y — §8's
    // evidence, and the same recovery the beak makes on z.
    const crestPlace = feature('crest').placement
    if (crestPlace.kind === 'single') {
      expect(crestPlace.at[1]).toBeCloseTo(0.80625 + partById('box-03')!.size[1]! / 2, 9)
    }
    expect(g.getObjectByName('crest')!.position.y).toBeCloseTo(crest.offset[1]!, 4)
    // On the MIDLINE, which is the whole of what box-21 could not do.
    expect(g.getObjectByName('crest')!.position.x).toBe(0)
  })

  it('lands its LEADING EDGE on the flat top face\'s own front edge', () => {
    // The z is the one coordinate the donor transfer could not give: `cone-01`'s
    // recorded 0.469709 is 0.157 past where this hull's top face ends, because
    // the bee wears it on a different shell. So it is solved instead — the flat
    // top's own reach less the shape's own half-depth — which puts the crest as
    // far forward over the forehead as this shell allows.
    const topFlat = flatReach(1, 2)
    expect(topFlat).toBeCloseTo(0.3125, 6)
    expect(partById('cone-01')!.offset[2]).toBeCloseTo(0.469709, 6)
    expect(partById('cone-01')!.offset[2]! - topFlat).toBeGreaterThan(0.15)
    const half = partById('cone-01')!.size[2]! / 2
    const crestPlace = feature('crest').placement
    if (crestPlace.kind === 'single') {
      expect(crestPlace.at[2]).toBeCloseTo(topFlat - half, 9)
    }
    const b = boxOf(build(), 'crest')
    expect(b.max.z, 'the crest\'s leading edge is off the flat top face').toBeCloseTo(topFlat, 4)
    expect(b.min.z).toBeCloseTo(topFlat - 2 * half, 4)
    expect(b.max.x - b.min.x).toBeCloseTo(0.16, 4)
  })

  it('has its whole BURIED base inside the hull, measured against the shell\'s planes', () => {
    // §3, nothing floats — checked against `box-03`'s own face planes rather than
    // against the arithmetic that placed it. The base is buried 0.125 straight
    // down, and the chamfer falls AWAY from the top face at 1:1, so the shell is
    // wider down there than it is at the join: the deep corners have margin and
    // the join-plane corner sits exactly on the top face's own edge.
    const g = build()
    const b = boxOf(g, 'crest')
    const hullTop = boxOf(g, 'hull').max.y
    expect(b.min.y).toBeCloseTo(hullTop - 0.125, 3)
    for (const x of [b.min.x, b.max.x]) {
      for (const z of [b.min.z, b.max.z]) {
        const d = insideHull([x, b.min.y, z])
        expect(d, `the crest's base is outside the hull at x=${x}, z=${z}`).toBeGreaterThan(0)
      }
    }
    // The binding corner is the forward one, and even it has the chamfer's own
    // 1:1 fall of clearance under it.
    expect(insideHull([0, b.min.y, b.max.z])).toBeGreaterThan(0.08)
    // And the tip is proud of the body by the shape's own unburied length.
    expect(b.max.y - hullTop).toBeCloseTo(0.275356, 3)
  })

  it('RISES AND FALLS, and that is what `bob` is', () => {
    // `animal-budgie.ts` was the first species to declare `motion` at all; this
    // is the first to declare two, and the second is the interesting one. `bob`
    // is a POSITION channel on y at the parrot's own measured 0.05 hover
    // (`pets.ts:854`) — a part translating up and down its own axis, which is
    // exactly what a cockatiel's crest does.
    const motion = COCKATIEL_ASSEMBLY.motion!
    expect(motion).toHaveLength(2)
    const bob = motion.find(m => m.kind === 'bob')!
    expect(bob.parts).toEqual(['crest'])
    expect(bob.channel).toBe('position')
    expect(bob.axis).toBe('y')
    expect(bob.amplitude).toBe(MOTIONS.bob.amplitude)
    expect(bob.period).toBe(MOTIONS.bob.period)
    // Nothing tuned on either, and the flap is the family's.
    const flap = motion.find(m => m.kind === 'flap')!
    expect(flap.parts).toEqual(['wing'])
    expect(flap.amplitude).toBe(MOTIONS.flap.amplitude)
    // And both names resolve to meshes that exist, which is the check
    // `resolveMotion` exists for — its symptom otherwise is nothing moving.
    const g = build()
    for (const n of ['crest', 'wing-r', 'wing-l']) expect(g.getObjectByName(n)).toBeDefined()
  })
})

describe('animal-cockatiel: the orange cheek is a dot because the face has one gap', () => {
  it('has exactly 0.1125 of clear face beside the bill, and the dot is 0.113137', () => {
    /*
     * The measurement that refuses a proper cheek patch. `plate-10` — the cow's,
     * dog's and giraffe's flank blotch — is the right SHAPE and the right SIZE
     * for a cockatiel's cheek, and spun onto the front face it is 0.252879
     * across. There is nowhere to put it.
     */
    const flatX = flatReach(2, 0)
    expect(flatX).toBeCloseTo(0.3125, 6)
    const bill = partById('cone-06')!.size[0]! / 2
    expect(bill).toBeCloseTo(0.2, 6)
    const window = flatX - bill
    expect(window).toBeCloseTo(0.1125, 6)
    // The bank's biggest DOT is that window to within 0.0006, and its smaller
    // sibling `plate-12` is the only other thing that fits.
    expect(partById('plate-16')!.size[0]).toBeCloseTo(0.113137, 6)
    expect(Math.abs(partById('plate-16')!.size[0]! - window)).toBeLessThan(0.0007)
    expect(feature('cheek').part).toBe('plate-16')
    // The card that should have been here, and by how much it misses.
    expect(partById('plate-10')!.size[2]).toBeCloseTo(0.252879, 6)
    expect(partById('plate-10')!.size[2]! / window).toBeGreaterThan(2.2)
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.part === 'plate-10')).toBe(false)
  })

  it('is not the BEAK\'S fault — no solid nose in the bank opens the window enough', () => {
    // Pinned over the whole bank so this reads as a fact about the SHELL. The two
    // zero-thickness nostril dots are excluded because a dot is not a beak.
    const flatX = flatReach(2, 0)
    const solid = PARTS_BANK.filter(p => p.roles.includes('nose') && Math.min(...p.size) > 0)
    expect(solid).toHaveLength(26)
    const widest = Math.max(...solid.map(p => flatX - p.size[0]! / 2))
    expect(widest).toBeCloseTo(0.2525, 4)
    expect(widest).toBeLessThan(partById('plate-10')!.size[2]!)
    // And the one that gets closest is `wedge-10`, which Joe rejected by name on
    // the hedgehog as a nose that reads as a TONGUE — so the widest USABLE bill
    // leaves 0.2215, and this build wears neither.
    expect(flatX - partById('wedge-10')!.size[0]! / 2).toBeCloseTo(widest, 9)
    const usable = solid.filter(p => p.id !== 'wedge-10')
    expect(Math.max(...usable.map(p => flatX - p.size[0]! / 2))).toBeCloseTo(0.221511, 6)
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(COCKATIEL_ASSEMBLY.flag).toMatch(/CHEEK IS A DOT/i)
  })

  it('fits exactly one dot vertically too, between the flat face and the eye', () => {
    const flatY = flatReach(2, 1)
    expect(flatY).toBeCloseTo(0.3125, 6)
    const g = build()
    const eye = boxOf(g, 'eye-r'), cheek = boxOf(g, 'cheek-r')
    const faceBottom = partById('box-03')!.offset[1]! - flatY
    expect(faceBottom).toBeCloseTo(0.49375, 5)
    // The window between the flat face's own bottom and the eye card's own
    // bottom is 0.200. One `plate-16` fits with 0.087 to spare; two stacked are
    // 0.2263 and do not.
    expect(eye.min.y - faceBottom).toBeCloseTo(0.2, 3)
    const dot = partById('plate-16')!.size[1]!
    expect(dot).toBeLessThan(eye.min.y - faceBottom)
    expect(2 * dot).toBeGreaterThan(eye.min.y - faceBottom)
    expect(COCKATIEL_ASSEMBLY.features.filter(f => f.name.startsWith('cheek'))).toHaveLength(1)
    // Its top edge touches the eye's bottom edge exactly, and its outer edge
    // lands on the flat face's own reach and not a thousandth past it.
    expect(cheek.max.y).toBeCloseTo(eye.min.y, 4)
    expect(cheek.max.x).toBeCloseTo(flatReach(2, 0), 4)
    // On the pack's own card plane, 0.010 proud of this cube's 0.625 face.
    expect(cheek.max.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(cheek.max.z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.01, 6)
  })
})

describe('animal-cockatiel: the yellow face cannot be drawn, and both routes are measured', () => {
  it('cannot say "the FRONT of this is yellow" — a patch carries a HEIGHT', () => {
    // The badger's flag on a different animal. A cockatiel is a grey bird with a
    // yellow HEAD, which is a z-region; `Paint.patch` is `{ below, at }` and `at`
    // is a fraction of the part's height, so the boundary is a level plane and
    // there is no z term to reach for. Rule 3 leaves no separate head to paint.
    expect(COCKATIEL_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(Object.keys(BUDGIE_ASSEMBLY.hull.paint.patch!).sort()).toEqual(['at', 'below'])
    // And `byBand` cannot help: this shell has exactly ONE band.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
  })

  it('refuses the inverted top patch, because it paints the whole SPINE yellow', () => {
    // The budgie's own move — base yellow, patch the body colour below it —
    // arrives at the wrong animal here. The nearest notches on the pack's 1/16
    // grid catch the top 0.156 or 0.078 of the body along its whole length, and
    // the island's camera looks DOWN at exactly that stripe.
    const hull = partById('box-03')!
    const bottom = hull.offset[1]! - hull.size[1]! / 2
    for (const [k, caught] of [[14, 0.15625], [15, 0.078125]] as const) {
      const line = bottom + (k / 16) * hull.size[1]!
      expect(bottom + hull.size[1]! - line).toBeCloseTo(caught, 6)
    }
    // A cockatiel's back is grey, so the hull is painted flat.
    expect(COCKATIEL_ASSEMBLY.hull.paint.base).toBe('coat')
    expect(COCKATIEL_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('refuses `plate-11` as a face card — it is coplanar with the eyes', () => {
    // The biggest flat marking in the bank, and the obvious yellow face. Spun
    // onto the front face it is 0.433 across, against a 0.625 flat face with a
    // 0.400 bill down the middle; and it would live on z = 0.635, EXACTLY where
    // the eye cards are. `CARD_STANDOFF` fixes a card against a face and can do
    // nothing about two cards in one plane.
    const card = partById('plate-11')!
    expect(card.size[2]).toBeCloseTo(0.433013, 6)
    expect(card.size[2]!).toBeGreaterThan(2 * flatReach(2, 0) - partById('cone-06')!.size[0]!)
    // It is a SIDE card, and its own recorded plane is 0.635 — the pack's own
    // flat-card shell, the same number `EYE_CARD_Z` is on the other axis. So
    // turned onto the front face it lands exactly where the eye cards already
    // are, and `CARD_STANDOFF` has nothing to say about two cards in one plane.
    expect(card.attachment!.axis).toBe('x')
    expect(card.offset[0]).toBeCloseTo(EYE_CARD_Z, 6)
    expect(partById('plate-08')!.offset[2]).toBeCloseTo(EYE_CARD_Z, 6)
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.part === 'plate-11')).toBe(false)
    expect(COCKATIEL_ASSEMBLY.flag).toMatch(/YELLOW FACE CANNOT BE PAINTED/i)
  })

  it('puts the yellow everywhere it CAN go — the eye ring, and the tail\'s own tip', () => {
    // `plate-08` arrives pre-split at Kenney's bands 3 and 15, so a yellow ring
    // round a dark bead costs two slots and no geometry. It is as much of the
    // yellow face as the mechanism can say.
    expect(feature('eye').paint).toEqual({ base: 'face', byBand: { 15: 'pupil' } })
    expect(feature('crest').paint).toEqual({ base: 'face' })
    expect(feature('tail').paint).toEqual({ base: 'coat', byBand: { 3: 'face' } })
    // Six slots and every one of them spent: no slot is defined and unused.
    const used = new Set<string>(['pupil'])
    for (const f of [...COCKATIEL_ASSEMBLY.features, COCKATIEL_ASSEMBLY.hull]) {
      used.add(f.paint.base)
      for (const s of Object.values(f.paint.byBand ?? {})) used.add(s)
      if (f.paint.patch) used.add(f.paint.patch.below)
    }
    expect([...used].sort()).toEqual(Object.keys(COCKATIEL_ASSEMBLY.palette).sort())
  })
})

describe('animal-cockatiel: the tail is the tiger\'s, and the tie was broken by a BAND', () => {
  it('is the same shape as `wedge-07` to within a mirror — so the tie is real', () => {
    // Both are 0.200 x 1.046587 x 0.555215 to six decimals and their tapers
    // differ by 0.0005. Saying "wedge-18 because it is longer/thinner" would be
    // false, so the reason has to be something else.
    const a = partById('wedge-07')!, b = partById('wedge-18')!
    for (let i = 0; i < 3; i++) expect(a.size[i]).toBeCloseTo(b.size[i]!, 6)
    expect(Math.abs(a.shape.taper - b.shape.taper)).toBeLessThan(1e-3)
    const key = (q: readonly number[]): string => q.map(v => v.toFixed(4)).join(',')
    const set = new Set(points('wedge-07').map(key))
    const mirrored = points('wedge-18').map(q => key([-q[0]!, q[1]!, q[2]!]))
    expect(mirrored.filter(k => set.has(k)).length / mirrored.length).toBeGreaterThan(0.97)
  })

  it('takes the one that arrives PRE-CUT at its own tip', () => {
    // `wedge-07` (the cat's and the monkey's) has ONE band; `wedge-18` (the
    // tiger's) has two, and band 3 is measurably the tail's own tip.
    expect([...new Set(partById('wedge-07')!.bands)]).toHaveLength(1)
    expect([...new Set(partById('wedge-18')!.bands)].sort((x, y) => x - y)).toEqual([3, 7])
    expect(bandCount('wedge-18', 3)).toBe(64)
    expect(bandMean('wedge-18', 3, 1)).toBeCloseTo(0.4012, 3)
    expect(bandMean('wedge-18', 3, 1)).toBeGreaterThan(bandMean('wedge-18', 7, 1))
    // `{ axis: 'x', deg: -90 }` maps +y to -z, so those triangles end up at the
    // rearmost quarter: a pale flash on the tail's tip, from Kenney's own cut.
    expect(feature('tail').spin).toEqual([{ axis: 'x', deg: -90 }])
    const g = build()
    const t = boxOf(g, 'tail')
    expect(t.max.z - t.min.z).toBeCloseTo(partById('wedge-18')!.shape.longest, 3)
    expect(t.max.y).toBeLessThan(boxOf(g, 'hull').max.y)
  })

  it('is thinner than the budgie\'s, and joined at the hull\'s own centre', () => {
    // The budgie took the LONGEST tail in the bank; this one takes the joint
    // longest of the two THINNEST — 0.200 across against 0.280 — so the two long
    // tails are separated by a measurement rather than by a colour.
    const thin = (id: string): number => Math.min(...partById(id)!.size)
    expect(thin('wedge-18')).toBeCloseTo(0.2, 6)
    expect(thin('wedge-18')).toBeLessThan(thin('wedge-15'))
    expect(BUDGIE_ASSEMBLY.features.find(f => f.name === 'tail')!.part).toBe('wedge-15')
    // Joined at the hull's own recorded centre, the only height at which the
    // spun root's 0.555215 fits inside the 0.625 flat rear face.
    const hull = partById('box-03')!
    const tailPlace = feature('tail').placement
    if (tailPlace.kind === 'single') {
      expect(tailPlace.at).toEqual([0, hull.offset[1], -hull.size[2]! / 2])
    }
    expect(flatReach(2, 1) - partById('wedge-18')!.size[2]! / 2).toBeGreaterThan(0.03)
  })

  it('is sunk past its own donor\'s burial, and the reason is the KEEP-OUT', () => {
    // `wedge-03`, the beaver's, is the deepest burial of the bank's seven tails
    // and `animal-budgie.ts` reached for it first, for this same reason.
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(Math.max(...tails.map(p => p.attachment!.sunkFractionMean)))
      .toBeCloseTo(partById('wedge-03')!.attachment!.sunkFractionMean, 9)
    expect(feature('tail').sink).toBeCloseTo(0.2943, 6)
    expect(feature('tail').sink).toBeGreaterThan(partById('wedge-18')!.attachment!.sunkFractionMean)
    // What it buys, measured: at the donor's own burial this bird charges 1.1677,
    // past the fox's 1.15 and within 0.0024 of the pack's hard 1.17.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.086, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    const shallower = 1.046587 * (0.2943 - partById('wedge-18')!.attachment!.sunkFractionMean)
    expect((Math.max(s.x, s.z) * 2 + shallower * 2) / 4).toBeGreaterThan(1.15)
  })
})

describe('animal-cockatiel: what it shares with the budgie, and what it does not', () => {
  it('wears the budgie\'s WING, byte for byte, because that file asked it to', () => {
    /*
     * `animal-budgie.ts`: "the wing is a shared idiom and NOT a separator: canary,
     * cockatiel and lovebird should wear this same part at this same sink, so four
     * birds read as one family". Asserted against that species' own build rather
     * than re-derived, so the claim is checkable — and so that if the family idiom
     * ever moves, it moves on both birds or this goes red.
     */
    const mine = feature('wing')
    const theirs = BUDGIE_ASSEMBLY.features.find(f => f.name === 'wing')!
    expect(mine.part).toBe(theirs.part)
    expect(mine.sink).toBe(theirs.sink)
    expect(mine.spin).toEqual(theirs.spin)
    expect(mine.axis).toBe(theirs.axis)
    expect(mine.dir).toBe(theirs.dir)
    expect(mine.placement).toEqual(theirs.placement)
    // And it is solid, which is the finding that put a bunny's ear on a bird:
    // the two cheap flat wings have an exactly-zero axis and the island's camera
    // looks DOWN.
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
    for (const id of ['plate-10', 'plate-11']) {
      expect(Math.min(...partById(id)!.size), `${id} has thickness`).toBe(0)
    }
  })

  it('wears the budgie\'s CHEEK STATIONS too, and states it rather than re-deriving them', () => {
    // Same hull, same card, same anatomy — so the same two measurements produce
    // the same two numbers, and arriving at different ones would mean one of us
    // was wrong. Only the colour differs.
    const mine = feature('cheek')
    const theirs = BUDGIE_ASSEMBLY.features.find(f => f.name === 'cheek')!
    expect(mine.part).toBe(theirs.part)
    expect(mine.placement).toEqual(theirs.placement)
    expect(mine.paint.base).toBe('cheek')
    expect(theirs.paint.base).not.toBe(mine.paint.base)
    expect(COCKATIEL_ASSEMBLY.palette['cheek']).not
      .toBe(BUDGIE_ASSEMBLY.palette[theirs.paint.base])
  })

  it('leaves the WING BAR to the budgie, so the two extras sets are disjoint', () => {
    // A cockatiel has a white wing flash in life. `plate-10` on the wing's own
    // outer face is the budgie's second extra, and `home-pets.ts:98-105` wants
    // four extras SETS that do not collide — so this bird's is crest + cheek and
    // the budgie keeps the bar. Declined deliberately, and the flag says so.
    expect(BUDGIE_ASSEMBLY.features.some(f => f.name === 'wing-bar')).toBe(true)
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.name.includes('bar'))).toBe(false)
    expect(COCKATIEL_ASSEMBLY.flag).toMatch(/NO WHITE WING FLASH/i)
    // The crest is what nothing else in the collection has, and it is the axis
    // `home-pets.ts:220` gives this species by name.
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.name === 'crest')).toBe(true)
    expect(BUDGIE_ASSEMBLY.features.some(f => f.name === 'crest')).toBe(false)
  })

  it('wears JT-044\'s two-tone foot on the pack\'s own leg row, at its own x', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      // `box-01`'s own recorded offset, and z = 0 because a biped stands under
      // its own mass where a quadruped straddles it.
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
    // The patch is on the BASE slot only and is 4/16 on the pack's own grid.
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.byBand).toBeUndefined()
    expect(leg.paint.patch!.at * 16).toBe(4)
  })

  it('carries no stretch anywhere, and nothing authored', () => {
    // Joe flagged a non-uniform stretch on three animals on 2 August. Making the
    // crest taller is one stretch away and it was not taken: the crest is the
    // bank's own shape at the bank's own size, and if 0.275 of reach is not
    // enough, that is a part and his call.
    for (const f of COCKATIEL_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(COCKATIEL_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
    expect(COCKATIEL_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    // Flagged for what cannot be said, and for nothing structural: no authored
    // shape and no budget declared, because neither is strained.
    expect(COCKATIEL_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })
})
