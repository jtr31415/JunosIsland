/**
 * The chicken. Farm's hen, and the EXEMPLAR the collection's other four
 * galliforms are derived from.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a chicken can say,
 * and because four siblings inherit it, it pins the SHARED numbers as hard as
 * the species' own:
 *
 *   1. **The COMB's two solved numbers.** Its burial is 8/16 rather than
 *      `cone-01`'s own 5/16 — the one dial that says "a hen's comb, not a
 *      cock's" without a stretch — and its 2/16 spacing is the LARGEST step on
 *      the pack's grid at which the three points still MEET. Both are re-derived
 *      here off the bank rather than trusted, so a sibling that changes either
 *      finds out what it changed.
 *   2. **The ROOSTER's headroom, asserted rather than promised.** Five points at
 *      the shape's own burial fit inside the bound this hull allows, and the
 *      test computes the bound rather than quoting it.
 *   3. **`box-18` is the only tail in the bank with a burial of exactly zero**,
 *      and it therefore fits this hull's flat rear face by 0.000998 or not at
 *      all. Pinned over all seven tails, so it is a fact about the BANK.
 *   4. **The fan is not spent**, because `farm.ts:152` gives it to the turkey.
 *   5. **The beak is a pure donor transfer that recovers BOTH of the bank's
 *      recorded coordinates**, which is what makes wearing the frozen chick's
 *      own bill a recovery rather than a collision.
 *   6. **The wattle does not fit**, and the window is the measurement.
 *   7. **The wing is the four cage birds', byte for byte**, asserted against two
 *      of their builds so "nine birds, one wing" is checkable and not a comment.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, CHICKEN_ASSEMBLY, CANARY_ASSEMBLY, COCKATIEL_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { MOTIONS } from '../../src/island/species/parts/motion'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-chicken',
  parts: ['box-01', 'box-03', 'box-06', 'box-18', 'cone-01', 'plate-08', 'tube-02'],
  // The comb, and it is the whole of the difference from the hull's own
  // HEIGHT_FLOOR: three cones buried 8/16 stand 0.20017 proud of the crown.
  height: 1.6314,
  verts: 449,
  tris: 542,
  // TWO legs, not four. A bird.
  legs: 2,
  // The wing is the biggest thing it wears, and the hull is fourteen times it —
  // the cockatiel's own ratio, because it is the cockatiel's own wing.
  massRatio: 14,
  // The tail, turned to point straight back, and the wing pair turned onto the
  // flank. The comb is NOT one: it stands the way its own attachment does.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-chicken')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof CHICKEN_ASSEMBLY.features[number] =>
  CHICKEN_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** How far one of `box-03`'s flat faces reaches along another axis. */
const flatReach = (face: 0 | 1 | 2, along: 0 | 1 | 2): number => Math.max(
  ...points('box-03')
    .filter(q => Math.abs(Math.abs(q[face]) - 0.625) < 1e-6)
    .map(q => Math.abs(q[along])),
)

/** How far a part sticks out of the face it joins, at a given burial. */
const proud = (id: string, axis: 0 | 1 | 2, sink: number): number =>
  partById(id)!.size[axis]! * (1 - sink)

/**
 * `cone-01`'s own height along its attachment, measured off its POINTS.
 *
 * The builder solves `shift = -s.lo - sink x extent` off the built span, so this
 * is the number the burial is actually a fraction of — `size[1]`'s 0.400356 is
 * the same value rounded and is 1.8e-5 away, which is enough to matter once it
 * is multiplied back out.
 */
const CONE_H = 2 * Math.max(...points('cone-01').map(q => Math.abs(q[1])))

/**
 * `cone-01`'s half-depth `h` above its own base — it is a true point, so the
 * cross-section falls linearly to zero over the shape's own height.
 */
const coneHalfDepth = (h: number): number =>
  (partById('cone-01')!.size[2]! / 2) * (1 - h / CONE_H)

describe('animal-chicken: the comb is three points, and both its numbers are solved', () => {
  it('reaches for `cone-01` because the bank has no comb and only two true points', () => {
    // There is no comb, wattle, horn or wing ROLE in the bank at all — anything
    // whose only job was one of those was discarded at generation time — so a
    // comb is a repurposed shape or it is nothing. `taper` is 0 on exactly two
    // of the 94 records and the other is a parrot's beak; the day a third is
    // banked, this goes red and the choice is worth re-taking.
    for (const role of ['wing', 'horn', 'claw']) {
      expect(PARTS_BANK.filter(p => (p.roles as readonly string[]).includes(role)),
        `the bank now has a ${role} role`).toHaveLength(0)
    }
    expect(PARTS_BANK.filter(p => p.shape.taper === 0).map(p => p.id).sort())
      .toEqual(['cone-01', 'cone-06'])
    // Three of them, on the midline, and every one is the same shape.
    const comb = CHICKEN_ASSEMBLY.features.filter(f => f.name.startsWith('comb-'))
    expect(comb).toHaveLength(3)
    for (const f of comb) {
      expect(f.part).toBe('cone-01')
      expect(f.spin, `"${f.name}" is spun`).toBeUndefined()
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
      if (f.placement.kind === 'single') expect(f.placement.at[0]).toBe(0)
    }
    // It is the bee's and the caterpillar's ANTENNA — a part's identity is its
    // placement, which is the same argument the hedgehog's quill makes.
    expect([...new Set(partById('cone-01')!.provenance.map(q => q.species))].sort())
      .toEqual(['bee', 'caterpillar'])
  })

  it('is buried DEEPER than the shape records, and that is the rooster\'s dial', () => {
    /*
     * `cone-01`'s own `sunkFractionMean` is 0.312222 — 0.125 units, which is
     * already §3's floor for an embedded part, so it is a MINIMUM and deeper is
     * honest. 8/16 buries 1.6x that floor and stands the comb 27.3% shorter than
     * `animal-cockatiel.ts`'s crest, which is the difference between a hen's and
     * a cock's said without a stretch anywhere.
     */
    const cone = partById('cone-01')!
    expect(cone.attachment!.sunkUnitsMean).toBeCloseTo(0.125, 6)
    expect(feature('comb-front').sink).toBe(0.5)
    expect(feature('comb-front').sink! * 16).toBe(8)
    expect(feature('comb-front').sink).toBeGreaterThan(cone.attachment!.sunkFractionMean)
    const buried = cone.size[1]! * 0.5
    expect(buried).toBeGreaterThan(0.125)
    expect(buried / 0.125).toBeCloseTo(1.6, 1)
    // What it costs in comb, against the crest that took the shape's own burial.
    const mine = proud('cone-01', 1, 0.5)
    const crest = proud('cone-01', 1, cone.attachment!.sunkFractionMean)
    expect(crest).toBeCloseTo(0.275356, 6)
    expect(COCKATIEL_ASSEMBLY.features.find(f => f.name === 'crest')!.sink)
      .toBeCloseTo(cone.attachment!.sunkFractionMean, 9)
    expect(1 - mine / crest).toBeCloseTo(0.273, 2)
    // And the arithmetic lands clean: `shift = -s.lo - sink x extent` is zero at
    // exactly this burial, so the cone's CENTRE sits on the hull's own top face.
    const g = build()
    for (const n of ['comb-front', 'comb-mid', 'comb-rear']) {
      expect(g.getObjectByName(n)!.position.y).toBeCloseTo(1.43125, 6)
    }
    expect(boxOf(g, 'comb-front').max.y - boxOf(g, 'hull').max.y).toBeCloseTo(mine, 4)
  })

  it('spaces them 2/16 — the LARGEST grid step at which the three still MEET', () => {
    /*
     * This is the whole of what separates a comb from three spikes, and it is
     * arithmetic rather than taste. The cone is 0.328570 across at its base and
     * narrows linearly to a point, so at the crown — its own buried depth above
     * the base — it is exactly half that. Two adjacent cones touch while the step
     * is under that width.
     */
    const buried = CONE_H * 0.5
    const atCrown = 2 * coneHalfDepth(buried)
    expect(atCrown).toBeCloseTo(partById('cone-01')!.size[2]! / 2, 6)
    expect(atCrown).toBeCloseTo(0.164285, 5)
    // 2/16 overlaps; 3/16, the next notch up, does not touch at all.
    const step = 0.125
    expect(step * 16).toBe(2)
    expect(step).toBeLessThan(atCrown)
    expect(atCrown - step).toBeCloseTo(0.039285, 5)
    expect(0.1875).toBeGreaterThan(atCrown)
    expect(0.1875 - atCrown).toBeCloseTo(0.023215, 5)
    // The stations, measured off the built meshes rather than off the source.
    const g = build()
    const z = ['comb-front', 'comb-mid', 'comb-rear']
      .map(n => g.getObjectByName(n)!.position.z)
    expect(z[0]! - z[1]!).toBeCloseTo(step, 9)
    expect(z[1]! - z[2]!).toBeCloseTo(step, 9)
    // They merge into one blade at the body and separate a measured 0.0479 above
    // it into three points, which is a comb.
    const apart = CONE_H * (1 - (step / 2) / (partById('cone-01')!.size[2]! / 2))
    expect(apart - buried).toBeCloseTo(0.0479, 3)
  })

  it('lands its LEADING point on the flat top face\'s own front edge', () => {
    // `animal-cockatiel.ts`'s own CREST_Z, and the same solve for the same
    // reason: the bare donor transfer would use `cone-01`'s recorded 0.469709,
    // which is 0.157 past where this hull's top face ends.
    const topFlat = flatReach(1, 2)
    expect(topFlat).toBeCloseTo(0.3125, 6)
    expect(partById('cone-01')!.offset[2]! - topFlat).toBeGreaterThan(0.15)
    const half = partById('cone-01')!.size[2]! / 2
    const front = feature('comb-front').placement
    if (front.kind === 'single') expect(front.at[2]).toBeCloseTo(topFlat - half, 9)
    const crestZ = COCKATIEL_ASSEMBLY.features.find(f => f.name === 'crest')!.placement
    if (front.kind === 'single' && crestZ.kind === 'single') {
      expect(front.at[2]).toBeCloseTo(crestZ.at[2], 9)
    }
    // And the WHOLE row's footprint is on the flat top face — the rearmost base
    // stops 0.046 short of the chamfer — so every one of the three is buried
    // straight down into real geometry.
    const g = build()
    expect(boxOf(g, 'comb-front').max.z).toBeCloseTo(topFlat, 4)
    expect(boxOf(g, 'comb-rear').min.z).toBeGreaterThan(-topFlat)
  })

  it('leaves the ROOSTER five taller points on the identical solve', () => {
    /*
     * §3's "nothing floats" as arithmetic: the flat face ends and the chamfer
     * falls away 1:1, so a station buried `d` stays embedded out to
     * `topFlatZ + d`. At `cone-01`'s OWN burial that bound is 0.4375, and five
     * points at this same 2/16 step run from the front station back to -0.351785
     * — inside it, at 37% more comb each. The bound is computed, not quoted.
     */
    const topFlat = flatReach(1, 2)
    const ownBurial = partById('cone-01')!.attachment!.sunkUnitsMean
    const bound = topFlat + ownBurial
    expect(bound).toBeCloseTo(0.4375, 6)
    const frontZ = topFlat - partById('cone-01')!.size[2]! / 2
    const fifth = frontZ - 4 * 0.125
    expect(Math.abs(fifth)).toBeLessThan(bound)
    expect(proud('cone-01', 1, partById('cone-01')!.attachment!.sunkFractionMean)
      / proud('cone-01', 1, 0.5)).toBeCloseTo(1.3756, 3)
    // And this bird is not wearing five: three, and no wattle either.
    expect(CHICKEN_ASSEMBLY.features.filter(f => f.name.startsWith('comb-'))).toHaveLength(3)
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name.includes('wattle'))).toBe(false)
    expect(CHICKEN_ASSEMBLY.flag).toMatch(/THERE IS NO WATTLE/)
  })
})

describe('animal-chicken: the wattle is refused, and the window is the measurement', () => {
  it('has 0.108 of clear face under the bill, against a 0.136825 part', () => {
    /*
     * The smallest SOLID boxes in the bank are `box-09` and `box-10`, the
     * bunny's and the cat's nose-tips. The flat cards `plate-12` and `plate-16`
     * are not candidates at all: `animal-budgie.ts:243-255` measured them for
     * exactly this job and refused them for reading FLAT, which is the same
     * finding that makes the wing a solid.
     */
    const flatY = flatReach(2, 1)
    expect(flatY).toBeCloseTo(0.3125, 6)
    const faceBottom = partById('box-03')!.offset[1]! - flatY
    expect(faceBottom).toBeCloseTo(0.49375, 5)
    const bill = partById('tube-02')!
    const billBottom = bill.offset[1]! - bill.size[1]! / 2
    expect(billBottom).toBeCloseTo(0.60175, 5)
    const window = billBottom - faceBottom
    expect(window).toBeCloseTo(0.108, 3)
    // The part does not fit in it, and neither of the two boxes is smaller.
    for (const id of ['box-09', 'box-10']) {
      expect(partById(id)!.size[1]).toBeCloseTo(0.136825, 6)
      expect(partById(id)!.size[1]!).toBeGreaterThan(window)
    }
    expect(Math.min(...partById('plate-12')!.size)).toBe(0)
    expect(Math.min(...partById('plate-16')!.size)).toBe(0)
    // It only fits by overruling box-09's own 0.000000 burial, and what that
    // buys is 0.039913 of standing wattle — 3.2% of the hull's own width.
    expect(partById('box-09')!.attachment!.sunkFractionMean).toBe(0)
    const sunk = partById('box-09')!.size[2]! * 0.5
    expect(window + sunk).toBeGreaterThan(partById('box-09')!.size[1]!)
    expect(sunk).toBeCloseTo(0.039913, 5)
    expect(sunk / partById('box-03')!.size[0]!).toBeLessThan(0.033)
    for (const id of ['box-09', 'box-10', 'plate-12', 'plate-16']) {
      expect(CHICKEN_ASSEMBLY.features.some(f => f.part === id), `${id} is worn`).toBe(false)
    }
  })
})

describe('animal-chicken: the tail is the only stub this hull can carry', () => {
  it('is the ONE tail in the bank with a burial of exactly zero', () => {
    // Which is what forces the rest of it: with nothing buried, the WHOLE join
    // cross-section has to land on real flat geometry or the tail floats.
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    const zero = tails.filter(p => p.attachment!.sunkFractionMean === 0)
    expect(zero.map(p => p.id)).toEqual(['box-18'])
    expect(feature('tail').part).toBe('box-18')
    expect(feature('tail').sink).toBe(0)
    // And it does not taper: the least tapering of the seven, a blunt block
    // rather than a plume, which is a farmyard hen's tail.
    expect(partById('box-18')!.shape.taper).toBeCloseTo(0.994204, 6)
    expect(Math.max(...tails.map(p => p.shape.taper)))
      .toBeCloseTo(partById('box-18')!.shape.taper, 9)
  })

  it('fits box-03\'s flat rear face by 0.000998, and so cannot be raised', () => {
    /*
     * The spin is `{ y: 180 }` — `animal-badger.ts:149`'s own line — which turns
     * the elephant's TRUNK to point backwards and leaves the x/y cross-section
     * alone. That cross-section is 0.345 x 0.623004 and the flat rear face
     * reaches 0.3125, so the margin is one thousandth. It is the only tail in
     * the bank that clears at all.
     */
    expect(feature('tail').spin).toEqual([{ axis: 'y', deg: 180 }])
    const flat = flatReach(2, 1)
    const halfHeight = partById('box-18')!.size[1]! / 2
    expect(halfHeight).toBeCloseTo(0.311502, 6)
    expect(flat - halfHeight).toBeCloseTo(0.000998, 6)
    expect(flat - halfHeight).toBeGreaterThan(0)
    // Every other tail overhangs the face and pays for it out of its burial.
    for (const p of PARTS_BANK.filter(q => q.roles.includes('tail'))) {
      if (p.id === 'box-18') continue
      expect(p.size[1]! / 2, `${p.id} would fit too`).toBeGreaterThan(flat)
    }
    // So the height is not a choice: the hull's own centre, and nowhere else.
    const place = feature('tail').placement
    if (place.kind === 'single') {
      expect(place.at).toEqual([0, partById('box-03')!.offset[1], -0.625])
    }
    const g = build()
    const t = boxOf(g, 'tail')
    // Second shortest reach of the seven, and it stands taller than it trails.
    expect(-0.625 - t.min.z).toBeCloseTo(0.425211, 4)
    expect(t.max.y - t.min.y).toBeGreaterThan(-0.625 - t.min.z)
  })

  it('leaves the FAN to the turkey and the arch to the rooster', () => {
    // `farm.ts:152` gives the turkey "the only one with a fanned tail", and
    // `box-38` IS the fan — `animal-canary.ts` wears it as exactly that. An
    // exemplar that spends its siblings' one assigned axis has failed them.
    expect(CANARY_ASSEMBLY.features.find(f => f.name === 'tail')!.part).toBe('box-38')
    for (const id of ['box-38', 'box-23', 'wedge-15', 'wedge-07', 'wedge-18', 'wedge-03']) {
      expect(CHICKEN_ASSEMBLY.features.some(f => f.part === id), `${id} is spent`).toBe(false)
    }
    // And `chamfer: true` — the builder idiom that solves the rear-top chamfer
    // midpoint and the 45-degree turn together — is the cock's arched sickle and
    // is deliberately unspent, which shows as an explicit `at` and `spin` here.
    expect(feature('tail').placement.kind).toBe('single')
    expect(CHICKEN_ASSEMBLY.flag).toMatch(/THE FAN IS NOT SPENT/)
  })
})

describe('animal-chicken: two of its parts are the frozen chick\'s, on purpose', () => {
  it('wears the chick\'s own shell and the chick\'s own bill', () => {
    // `animal-chick` is one of the frozen base 24 and cannot be edited, so the
    // separation has to come from this side. Both shared parts are things the
    // two animals genuinely share.
    const donors = partById('box-03')!.provenance.map(q => q.species)
    expect(donors).toContain('chick')
    expect(CHICKEN_ASSEMBLY.hull.part).toBe('box-03')
    expect([...new Set(partById('tube-02')!.provenance.map(q => q.species))].sort())
      .toEqual(['chick', 'penguin'])
    expect(feature('snout').part).toBe('tube-02')
    expect(CHICKEN_ASSEMBLY.flag).toMatch(/TWO PARTS HERE ARE THE FROZEN CHICK'S/)
  })

  it('places the bill by donor transfer alone, recovering BOTH coordinates', () => {
    /*
     * §8's evidence, and it is exact rather than inferred precisely because the
     * chick wears this bill on this shell: joined at the hull's front face and
     * sunk the shape's own 0.5, the shift solves to zero, so the centre lands on
     * the bank's own recorded z AND y for the shape.
     */
    const bill = partById('tube-02')!
    expect(bill.attachment!.axis).toBe('z')
    expect(bill.attachment!.sunkFractionMean).toBe(0.5)
    expect(feature('snout').sink).toBe(0.5)
    const f = feature('snout')
    expect(f.spin).toBeUndefined()
    expect(f.stretch).toBeUndefined()
    if (f.placement.kind === 'single') {
      expect(f.placement.at[2]).toBeCloseTo(HULL_FRONT_Z_USUAL, 9)
    }
    const g = build()
    const m = g.getObjectByName('snout')!
    expect(m.position.z).toBeCloseTo(bill.offset[2]!, 6)
    expect(m.position.y).toBeCloseTo(bill.offset[1]!, 6)
    expect(m.position.z).toBeCloseTo(0.625, 6)
    expect(m.position.y).toBeCloseTo(0.72775, 5)
    // Blunt, not hooked: taper 1.000, a round-sectioned bar. `cone-06` is the
    // parrot's and reaches nearly twice as far.
    expect(bill.shape.taper).toBeCloseTo(1, 6)
    expect(proud('tube-02', 2, 0.5)).toBeCloseTo(0.1, 6)
    expect(proud('cone-06', 2, partById('cone-06')!.attachment!.sunkFractionMean))
      .toBeCloseTo(0.18335, 5)
    expect(CHICKEN_ASSEMBLY.features.some(f2 => f2.part === 'cone-06')).toBe(false)
    // One band, so there is no upper/lower mandible to paint at all.
    expect([...new Set(bill.bands)]).toHaveLength(1)
  })

  it('separates on the four things a chick has none of', () => {
    // The comb, the wings, the tail — and above all colour, which is the one a
    // child reads first and the one a frozen species can never take back.
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name.startsWith('comb-'))).toBe(true)
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name === 'wing')).toBe(true)
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(true)
    // Buff-brown, not lemon: red is the only strong hue on the animal and it is
    // on the comb alone.
    expect(CHICKEN_ASSEMBLY.palette['comb']).toBe(0xc0332e)
    expect(CHICKEN_ASSEMBLY.palette['coat']).toBe(0xb5824a)
    expect(feature('comb-front').paint.base).toBe('comb')
    expect(CHICKEN_ASSEMBLY.hull.paint.base).toBe('coat')
    // Every slot defined is a slot spent: no colour is declared and unused.
    const used = new Set<string>(['pupil'])
    for (const f of [...CHICKEN_ASSEMBLY.features, CHICKEN_ASSEMBLY.hull]) {
      used.add(f.paint.base)
      for (const s of Object.values(f.paint.byBand ?? {})) used.add(s)
      if (f.paint.patch) used.add(f.paint.patch.below)
    }
    expect([...used].sort()).toEqual(Object.keys(CHICKEN_ASSEMBLY.palette).sort())
  })
})

describe('animal-chicken: what the four siblings inherit unchanged', () => {
  it('wears the CAGE BIRDS\' wing, byte for byte, at the sink they solved', () => {
    /*
     * `animal-budgie.ts` asked the other birds to wear this same part at this
     * same sink so they read as one family, and this file extends that from four
     * to nine. Asserted against two of their builds rather than re-derived, so
     * if the family idiom ever moves it moves on all of them or this goes red.
     */
    const mine = feature('wing')
    for (const theirs of [
      CANARY_ASSEMBLY.features.find(f => f.name === 'wing')!,
      COCKATIEL_ASSEMBLY.features.find(f => f.name === 'wing')!,
    ]) {
      expect(mine.part).toBe(theirs.part)
      expect(mine.sink).toBe(theirs.sink)
      expect(mine.spin).toEqual(theirs.spin)
      expect(mine.axis).toBe(theirs.axis)
      expect(mine.dir).toBe(theirs.dir)
      expect(mine.placement).toEqual(theirs.placement)
    }
    // It is a SOLID, which is the finding that put a bunny's ear on a bird: the
    // two cheap flat wings have an exactly-zero axis and the camera looks DOWN.
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
    for (const id of ['plate-10', 'plate-11']) {
      expect(Math.min(...partById(id)!.size), `${id} has thickness`).toBe(0)
    }
  })

  it('refuses the deeper sink a hen would want, because it is 1.53% of the body', () => {
    /*
     * 8/16 is a FLOOR: the tip reaches |z| 0.456649 where the flat side face
     * reaches 0.312500, so the burial has to cover 0.471328 of the part's own
     * thickness and the grid snaps that to 8/16. A hen holds her wing tighter
     * and 9/16 was measured for it — and the whole difference is under what the
     * island's downward camera can show.
     */
    const wing = partById('box-06')!
    // The two spins carry the ear's own LONG axis (its y) onto z, so the tip
    // that has to be buried is half of 0.913298 and the thickness that has to
    // bury it is the part's own z.
    const tip = wing.size[1]! / 2
    expect(tip).toBeCloseTo(0.456649, 6)
    expect(Math.max(...points('box-06').map(q => Math.abs(q[1])))).toBeCloseTo(tip, 4)
    const needed = (tip - flatReach(0, 2)) / wing.size[2]!
    expect(needed).toBeCloseTo(0.471328, 5)
    expect(feature('wing').sink).toBe(0.5)
    expect(feature('wing').sink).toBeGreaterThan(needed)
    expect(Math.floor(needed * 16) + 1).toBe(8)
    // What the next notch up would have bought, and why it was not taken.
    const gained = proud('box-06', 2, 0.5) - proud('box-06', 2, 0.5625)
    expect(gained).toBeCloseTo(0.019115, 6)
    expect(gained / partById('box-03')!.size[0]!).toBeLessThan(0.016)
    expect(CHICKEN_ASSEMBLY.flag).toMatch(/AND THE WING IS THE CAGE BIRDS'/)
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
    // The patch is on the BASE slot only and is 4/16 on the pack's own grid —
    // the lowest notch that clears `box-01`'s own bevel onto the straight shank.
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.byBand).toBeUndefined()
    expect(leg.paint.patch!.at * 16).toBe(4)
    const bevel = 0.0625 / partById('box-01')!.size[1]!
    expect(bevel).toBeCloseTo(0.204082, 6)
    expect(3 / 16).toBeLessThan(bevel)
    // In UNITS: 4/16 stands 0.014063 above where the shank goes straight.
    expect((leg.paint.patch!.at - bevel) * partById('box-01')!.size[1]!)
      .toBeCloseTo(0.014063, 6)
    // The three cage birds are all on the same notch.
    expect(COCKATIEL_ASSEMBLY.features.find(f => f.name === 'leg-front')!.paint.patch!.at)
      .toBe(0.25)
  })

  it('uses the pack\'s one ROUND eye, and leaves belly and byBand unspent', () => {
    // `plate-08`, 0.400 x 0.400, radial — three of its five donors are the
    // pack's three birds. Painted dark, `animal-canary.ts`'s treatment: a hen's
    // amber iris on a buff-brown coat is a marking that disappears, and the eye
    // is what has to stay readable.
    expect(feature('eye').part).toBe('plate-08')
    expect(partById('plate-08')!.shape.symmetry).toBe('radial')
    expect(feature('eye').paint).toEqual({ base: 'eye', byBand: { 15: 'pupil' } })
    const g = build()
    expect(boxOf(g, 'eye-r').max.z).toBeCloseTo(EYE_CARD_Z, 6)
    // Nothing painted on the body at all: the guinea fowl's spots and the
    // quail's mottling are the two siblings that need those mechanisms, and
    // `box-03` has exactly ONE band, so a sibling wanting `byBand` wants a
    // different shell.
    expect(CHICKEN_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(CHICKEN_ASSEMBLY.hull.paint.byBand).toBeUndefined()
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    expect([...new Set(partById('box-41')!.bands)]).toHaveLength(3)
    // And it stands taller than the bare shell by exactly the comb.
    const h = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y
    expect(h - HEIGHT_FLOOR).toBeCloseTo(proud('cone-01', 1, 0.5), 4)
  })

  it('flaps, does NOT bob, and carries no stretch and nothing authored', () => {
    // A second motion was available and is declined with a reason: `bob` raises
    // and lowers a part, which is what a cockatiel's crest does and is precisely
    // what a comb does not — a comb is fixed flesh.
    const motion = CHICKEN_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    expect(motion[0]!.amplitude).toBe(MOTIONS.flap.amplitude)
    expect(motion[0]!.period).toBe(MOTIONS.flap.period)
    for (const n of ['wing-r', 'wing-l']) expect(build().getObjectByName(n)).toBeDefined()
    // Joe flagged a non-uniform stretch on three animals on 2 August. Making the
    // comb bigger or smaller is one stretch away and it was not taken — the
    // burial is the dial instead, which is what §2 is about.
    for (const f of CHICKEN_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(CHICKEN_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
    expect(CHICKEN_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(CHICKEN_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })
})
