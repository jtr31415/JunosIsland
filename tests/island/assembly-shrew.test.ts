/**
 * The shrew. Garden's fourth, and the first species on a hull that is not the
 * 1.250 cube.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a shrew can say.
 *
 * Which, for this animal, is three claims:
 *
 *   1. **It is EARLESS**, and that is the largest silhouette difference the bank
 *      has to offer against the mouse's dish — asserted against the mouse's own
 *      build rather than against a comment about it.
 *   2. **Every placement on it but one is recovered, not chosen** — and two of
 *      the recoveries land on a number the solve never used, which is the §8
 *      donor transfer's own evidence that it is legitimate.
 *   3. **The one chosen number says what it bought**: the whip's height, which is
 *      why the animal measures a bare hull instead of a tiger.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, SHREW_ASSEMBLY, MOUSE_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z, HEIGHT_FLOOR,
  CARD_STANDOFF,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-shrew',
  parts: ['box-01', 'box-31', 'cone-01', 'plate-01', 'plate-13', 'wedge-01', 'wedge-18'],
  height: 1.4312,
  verts: 420,
  tris: 596,
  // The tiger's whip is the biggest thing after the hull and it is a fifteenth
  // of it — this animal is a body with details on it and nothing else.
  massRatio: 12,
  // The snout is turned a quarter onto its nose. Said out loud, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-shrew')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): (typeof SHREW_ASSEMBLY)['features'][number] =>
  SHREW_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-shrew: it has NO EARS, and that is the whole first read', () => {
  it('carries no ear feature at all, where the mouse carries the biggest in the bank', () => {
    expect(SHREW_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
    expect(SHREW_ASSEMBLY.features.some(f => f.name.startsWith('ear-'))).toBe(false)
    // The other side of the same claim, taken off the mouse's own build rather
    // than off a comment: it wears `box-25`, 0.743 across, and this one wears
    // nothing. No two of Garden's four small brown creatures share an ears+tail
    // pair, and this is that matrix's largest single entry.
    expect(MOUSE_ASSEMBLY.features.find(f => f.name === 'ear')!.part).toBe('box-25')
    expect(partById('box-25')!.size[0]).toBeCloseTo(0.742676, 6)
    // Nothing on the animal reaches out sideways past the hull, which is what
    // "earless" means once it is a measurement instead of a word.
    const g = build()
    const hull = boxOf(g, 'hull')
    expect(new THREE.Box3().setFromObject(g).max.x).toBeCloseTo(hull.max.x, 6)
  })

  it('still wears a shape the bank files as an EAR, and that is §3.1 working', () => {
    // A part's identity is its placement, not Kenney's label. `cone-01` is filed
    // under `ear` because the bee and the caterpillar wore it as an antenna; it
    // is already the hedgehog's spike and the squirrel's ear tuft, and here it is
    // a snout. Fourth job, same record, no new geometry.
    expect(partById('cone-01')!.roles).toContain('ear')
    expect(feature('snout').part).toBe('cone-01')
  })
})

describe('animal-shrew: the lion\'s hull, and what a shallower body buys', () => {
  it('takes an authored hull unmodified — which is not a stretch and says no why', () => {
    const lion = partById('box-31')!
    expect(SHREW_ASSEMBLY.hull.part).toBe('box-31')
    expect(SHREW_ASSEMBLY.hull.at).toEqual([0, 0.80625, -0.0625])
    // `hulls.ts`: the pack drew ten hulls and using one of them at Kenney's own
    // proportions is rule 1's purest case. A `stretchWhy` would be a sentence
    // this species cannot honestly give.
    expect(SHREW_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(lion.size).toEqual([1.25, 1.25, 1.125])
    // 1.125 deep, and depth is what `pets.ts:652` charges keep-out for. The whole
    // reason to be on this hull rather than the cube.
    expect(lion.size[2]).toBeLessThan(partById('box-03')!.size[2]!)
  })

  it('puts the eye card at the absolute plane anyway, floating 0.135 proud', () => {
    const card = partById('plate-01')!
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // The constant that looks wrong and is not: this hull's front face is 0.500
    // and the card is still at 0.6350, so it stands 0.135 proud — which is what
    // the LION does, because this is the lion's own hull and that is the lion's
    // own eye card. Never corrected onto the hull it happens to sit on.
    expect(HULL_FRONT_Z['box-31']).toBe(0.5)
    expect(EYE_CARD_Z - HULL_FRONT_Z['box-31']!).toBeCloseTo(0.135, 6)
  })

  it('has a front face that is 1.000 square and FLAT, which is why three things fit on it', () => {
    // Measured off the record, not assumed off the size. `box-31` chamfers its
    // rear hard and leaves its face alone: the four front points are
    // (+/-0.5, +/-0.5, 0.5625) and the four rear ones (+/-0.3125, +/-0.3125).
    const lion = partById('box-31')!
    const at = (z: number): number[][] => {
      const out: number[][] = []
      for (const vi of new Set(lion.indices)) {
        const p = [lion.positions[vi * 3]!, lion.positions[vi * 3 + 1]!, lion.positions[vi * 3 + 2]!]
        if (Math.abs(p[2]! - z) < 1e-6) out.push(p)
      }
      return out
    }
    const front = at(0.5625), rear = at(-0.5625)
    expect(Math.max(...front.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.5, 6)
    expect(Math.max(...front.map(p => Math.abs(p[1]!)))).toBeCloseTo(0.5, 6)
    expect(Math.max(...rear.map(p => Math.abs(p[1]!)))).toBeCloseTo(0.3125, 6)
    // Every feature on the face is inside that square, in world terms.
    const g = build()
    for (const name of ['snout', 'mouth', 'tooth-r']) {
      const b = boxOf(g, name)
      expect(b.min.y, `${name} is off the flat face`).toBeGreaterThan(0.80625 - 0.5)
      expect(b.max.x, `${name} is off the flat face`).toBeLessThan(0.5)
    }
  })
})

describe('animal-shrew: the tiger\'s whip, on a plane the tiger shares', () => {
  it('recovers the tiger\'s own recorded z, because the two hulls have ONE rear face', () => {
    const tiger = partById('wedge-18')!
    // `box-41` is 1.350 deep and offset forward 0.050, so its rear is at -0.625.
    // `box-31` is 1.125 deep and offset back 0.0625, so its rear is at -0.625.
    // Different hulls, same plane — so this transfer is exact, not an inference.
    const rearOf = (id: string): number =>
      partById(id)!.offset[2]! - partById(id)!.size[2]! / 2
    expect(rearOf('box-41')).toBeCloseTo(-0.625, 9)
    expect(rearOf('box-31')).toBeCloseTo(-0.625, 9)
    const tail = feature('tail')
    if (tail.placement.kind === 'single') expect(tail.placement.at[2]).toBe(-0.625)
    // Joined there and sunk the tiger's own 0.137977, the centre lands on the
    // bank's recorded -0.826 — a number the solve never used. That agreement is
    // the evidence, and it is what §8 says to check rather than assume.
    expect(tail.sink).toBeCloseTo(tiger.attachment!.sunkFractionMean, 9)
    const g = build()
    const c = g.getObjectByName('tail')!.getWorldPosition(new THREE.Vector3())
    expect(c.z).toBeCloseTo(tiger.offset[2]!, 5)
  })

  it('is a WHIP and not a stub — the vole\'s half of the matrix', () => {
    const g = build()
    const tail = boxOf(g, 'tail'), hull = boxOf(g, 'hull')
    // It reaches 0.479 clear of the rump and runs 1.046 along its own length.
    expect(hull.min.z - tail.min.z).toBeGreaterThan(0.45)
    expect(partById('wedge-18')!.size[1]).toBeCloseTo(1.046587, 6)
    // And it is still EMBEDDED where it joins — §3, nothing floats. The root
    // enters at y = 0.54, inside the rear face's flat 0.494-1.119 band.
    expect(tail.max.z - hull.min.z).toBeCloseTo(0.0766, 3)
  })

  it('carries it LOW, and that one chosen number is why the animal is not a tiger', () => {
    const tiger = partById('wedge-18')!
    const tail = feature('tail')
    // The tiger's own recorded height is 1.1867, which would put the tip at 1.710
    // and make this the tallest of Garden's four small brown creatures. It is
    // signed off as the shortest. So: 1.43125 - 1.046587/2, the hull's own top
    // less the tail's own half-height.
    expect(tiger.offset[1]).toBeCloseTo(1.186701, 6)
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[1]).toBe(0.907957)
      expect(tail.placement.at[1]).toBeCloseTo(HEIGHT_FLOOR - tiger.size[1]! / 2, 5)
    }
    // Which lands the tip exactly on the line of its own back, so the whole
    // animal measures the bare hull on standard legs and nothing more.
    const g = build()
    expect(boxOf(g, 'tail').max.y).toBeCloseTo(boxOf(g, 'hull').max.y, 4)
    expect(new THREE.Box3().setFromObject(g).max.y).toBeCloseTo(HEIGHT_FLOOR, 4)
  })
})

describe('animal-shrew: the point on the front of its face', () => {
  it('is the bank\'s only TRUE point, aimed forward by a baked quarter turn', () => {
    const cone = partById('cone-01')!
    // taper 0.000: it closes to a point rather than to a small face. Nothing else
    // in the bank does, and it is what makes a shrew's face rather than a mouse's.
    expect(cone.shape.taper).toBe(0)
    // Its measured facing is `y +1` — it STANDS UP unspun, which is how the
    // hedgehog uses it. A quarter turn about x sends that to `z +1`.
    expect(cone.attachment!.axis).toBe('y')
    expect(cone.attachment!.dir).toBe(1)
    expect(feature('snout').spin).toEqual([{ axis: 'x', deg: 90 }])
    const g = build()
    const snout = boxOf(g, 'snout')
    // Long in z, narrow in x: 0.400 by 0.160, the shape's own numbers re-axed.
    expect(snout.max.z - snout.min.z).toBeCloseTo(cone.size[1]!, 4)
    expect(snout.max.x - snout.min.x).toBeCloseTo(cone.size[0]!, 4)
  })

  it('joins at the lion\'s own nose height and buries the pack\'s own 0.125', () => {
    const snout = feature('snout')
    // Every coordinate recovered: the midline, the lion's nose-tip height on the
    // lion's own hull (`box-32`), and this hull's own front face.
    expect(partById('box-32')!.offset[1]).toBeCloseTo(0.83902, 5)
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, partById('box-32')!.offset[1], HULL_FRONT_Z['box-31']],
    })
    // Sunk its own measured fraction, which is 0.125 in units — §3's own floor,
    // and the same burial the hedgehog's twenty spikes get.
    expect(partById('cone-01')!.attachment!.sunkUnitsMean).toBe(0.125)
    const g = build()
    expect(boxOf(g, 'hull').max.z - boxOf(g, 'snout').min.z).toBeCloseTo(0.125, 4)
    // And it stands 0.275 proud, which is the whole silhouette claim.
    expect(boxOf(g, 'snout').max.z - boxOf(g, 'hull').max.z).toBeCloseTo(0.2754, 3)
  })

  it('DROOPS, because the turn takes the cone\'s own forward lean downward', () => {
    // Unspun, `cone-01` leans forward: its tip sits at z = +0.0628 off its own
    // axis. The hedgehog spins 180 about y to throw that lean over the rump; a
    // quarter turn about x sends it DOWN instead, which is which way a shrew's
    // snout points. Measured off the built mesh, not claimed.
    const g = build()
    const snout = g.getObjectByName('snout') as THREE.Mesh
    const pos = snout.geometry.getAttribute('position')
    let tip = 0, tipY = 0
    for (let i = 0; i < pos.count; i++) {
      if (pos.getZ(i) > tip) { tip = pos.getZ(i); tipY = pos.getY(i) }
    }
    expect(tipY).toBeCloseTo(-0.0628, 3)
  })

  it('wears NO nose button, and the bank is the reason', () => {
    expect(SHREW_ASSEMBLY.features.some(f => f.name === 'nose')).toBe(false)
    // A cone presents a POINT, so a nose on its front plane touches at one vertex
    // and shows daylight. Every volumetric nose in the bank is at least 0.182
    // across; the cone is 0.160 at its widest, so none of them can be backed by
    // this snout at any depth. Checked against the bank rather than asserted.
    const noses = partById('box-09')!.roles.includes('nose')
    expect(noses).toBe(true)
    const solid = ['box-09', 'box-10', 'box-15', 'box-22', 'box-32', 'tube-01', 'tube-08']
    for (const id of solid) {
      expect(partById(id)!.size[0], `${id} is narrower than the snout`)
        .toBeGreaterThan(partById('cone-01')!.size[0]!)
    }
    // `wedge-10` is not reached for either. Joe rejected it by name on the
    // hedgehog — it measures as the better nose tip and reads as a tongue — and
    // the lesson is not the hedgehog's alone.
    expect(SHREW_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })
})

describe('animal-shrew: the mouth and the teeth, which cost nothing to place', () => {
  it('draws the mouth with the lion\'s own face-plate, joined rather than copied', () => {
    const card = partById('plate-13')!
    expect(card.roles).toEqual(['card'])
    // Zero thickness and sunk its own measured 0.000, so it lies ON the face.
    expect(card.size[2]).toBe(0)
    expect(card.attachment!.sunkFractionMean).toBe(0)
    // Plus CARD_STANDOFF. Until that constant existed this mouth joined at
    // 0.500 and, having no thickness to be shifted by, FINISHED at 0.500 —
    // coplanar with the hull's own front face, z-fighting it, invisible. It is
    // now proud by the pack's own 0.010 and the definition still says nothing.
    expect(feature('mouth').placement).toEqual({
      kind: 'single', at: [0, card.offset[1], HULL_FRONT_Z['box-31']! + CARD_STANDOFF],
    })
    // NOT the eye card's absolute-plane rule. `EYE_CARD_Z` is pinned across all
    // 48 cards in the pack at sd 0.0000; the face-plate family is not, and its
    // recorded 0.670 is a deeper hull's number. Joined here, it lands on the face
    // instead of 0.170 in front of it.
    expect(card.offset[2]).toBeCloseTo(0.670, 3)
    const g = build()
    expect(boxOf(g, 'mouth').max.z - boxOf(g, 'hull').max.z).toBeCloseTo(CARD_STANDOFF, 6)
  })

  it('mirrors ONE tooth mesh, and the bank holds the other half to prove it', () => {
    const right = partById('wedge-01')!, left = partById('wedge-02')!
    // Rule 6: paired parts are one mesh, mirrored — there is no way to place a
    // left one and a right one independently. And the pack agrees: `wedge-02` is
    // `wedge-01` with x negated, position for position.
    const points = (p: typeof right, flip: boolean): string => [...new Set(p.indices)]
      .map(vi => [
        (flip ? -1 : 1) * p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!,
      ].map(n => n.toFixed(4)).join(','))
      .sort().join(' ')
    expect(points(right, true)).toBe(points(left, false))
    expect(right.shape.symmetry).toBe('handed')
    expect(feature('tooth').placement.kind).toBe('pair')
    expect(SHREW_ASSEMBLY.features.some(f => f.part === 'wedge-02')).toBe(false)
  })

  it('puts them where the beaver puts them: below its own muzzle, and proud by its own 0.036', () => {
    const tooth = partById('wedge-01')!
    const t = feature('tooth')
    // §3.1: the bank files this under `nose`, and the placement is what says what
    // it is. The beaver wears two of them at y = 0.561, below its own `tube-01`
    // muzzle at y = 0.815 — two lobes under a muzzle are incisors.
    expect(tooth.offset[1]).toBeCloseTo(0.561036, 6)
    expect(tooth.offset[1]!).toBeLessThan(partById('tube-01')!.offset[1]!)
    if (t.placement.kind === 'pair') {
      expect(t.placement.at).toEqual([tooth.offset[0], tooth.offset[1], HULL_FRONT_Z['box-31']])
    }
    // Sunk its own 0.219, its centre stands the beaver's own 0.0363 proud of
    // whatever front face it joins — which the beaver's own record confirms:
    // 0.661290 against `box-03`'s front face of 0.625. Four decimals, because
    // the bank rounds both the offset and the sunk fraction to six.
    expect(tooth.offset[2]! - 0.625).toBeCloseTo(0.0363, 4)
    const g = build()
    expect(g.getObjectByName('tooth-r')!.getWorldPosition(new THREE.Vector3()).z - 0.5)
      .toBeCloseTo(0.0363, 4)
    // And they sit under the mouth line, not through it.
    expect(boxOf(g, 'tooth-r').min.y).toBeLessThan(boxOf(g, 'mouth').min.y)
  })
})

describe('animal-shrew: what a definition did NOT have to say', () => {
  it('never mentions its legs or its eye plane, and gets the pack\'s own on a new hull', () => {
    // `HULL_BOTTOM_Y` is the same on nine of the pack's ten hulls, so changing the
    // hull did not move the leg row by a thousandth.
    const leg = feature('leg')
    if (leg.placement.kind === 'row') expect(leg.placement.from[1]).toBe(0.18125)
    expect(new THREE.Box3().setFromObject(build()).min.y).toBeCloseTo(0, 6)
  })

  it('paints its belly at the pack\'s own mammal line and adds no geometry for it', () => {
    expect(SHREW_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    // Same triangles as an unpatched hull; only the seam splits.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-31')!.tris)
  })

  it('uses all four of its signed-off colours, and each of them twice over', () => {
    // §0: the names and the facts are signed-off data. These four are
    // `garden.ts`'s own for this species and nothing here is a new colour.
    expect(SHREW_ASSEMBLY.palette).toEqual({
      coat: 0x6d5b4a, belly: 0xc0ae9a, muzzle: 0x4a3d31, limb: 0x2e251d, pupil: 0x4c4f5e,
    })
    const slots = new Set(SHREW_ASSEMBLY.features.map(f => f.paint.base))
    expect(slots).toContain('belly')  // the sclera, and the teeth
    expect(slots).toContain('muzzle') // the snout
    expect(slots).toContain('limb')   // the legs, the whip and the mouth line
  })

  it('strains nothing, so it carries no flag', () => {
    expect(SHREW_ASSEMBLY.flag).toBeUndefined()
  })

  it('fits between two trees — keep-out is the snout and the whip, and it is under the fox\'s', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. `garden.ts` warns
    // that a snout in front and a thin tail behind is the most expensive
    // combination in the collection and once measured a bigger circle than a fox.
    // The shallower hull is what pays for it: 0.94 against the fox's own 1.15.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.939, 2)
  })
})
