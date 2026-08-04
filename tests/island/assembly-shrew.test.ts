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
  buildAssembled, SHREW_ASSEMBLY, MOUSE_ASSEMBLY,
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

/*
 * "THE LION'S HULL, AND WHAT A SHALLOWER BODY BUYS" WAS RETIRED ON 4 AUGUST.
 *
 * Three assertions about `box-31`, the lion's shallow hull: that the shrew wore
 * it unstretched, that its 1.000-square front face was what let a snout, a mouth
 * and two teeth sit on it, and that the eye card stood 0.135 proud of it.
 *
 * Joe moved this animal onto `box-03` in the editor on 4 August. The block was
 * a description of the hull it used to wear, not a guard on anything — the eye
 * card's absolute plane, which is the part that actually matters, is checked for
 * every species by `assertAssembly`. `git show` has the original.
 */

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

  /*
   * "CARRIES IT LOW" WAS RETIRED ON 4 AUGUST. It pinned the tail's height to
   * 0.907957 — the hull's own top less the tail's half-height — so that the
   * shrew stayed the shortest of Garden's four small brown creatures. Joe raised
   * the tail to 1.1 in the editor. That is a carry decision by the animal's
   * author, and the pin existed only to hold the number he has now changed.
   */
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

  /*
   * "JOINS AT THE LION'S OWN NOSE HEIGHT" WAS RETIRED ON 4 AUGUST. It pinned the
   * snout's three coordinates to the lion's recorded nose height on the lion's
   * own front face — coordinates that only meant anything while the shrew wore
   * `box-31`. It is on `box-03` now and Joe has re-sited the snout with it.
   */

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

describe('animal-shrew: the teeth, which cost nothing to place', () => {
  /*
   * THE MOUTH IS GONE, and with it the assertion that drew it.
   *
   * The shrew used to carry `plate-13`, the lion's face-plate, as a mouth line
   * joined `CARD_STANDOFF` proud of the hull's front face. On 4 August Joe
   * removed it in the editor and gave the teeth a colour slot of their own
   * (`tooth: 0xeeebe7`) — so the incisors read on their own against the muzzle
   * rather than against a painted line. The definition now carries exactly one
   * extra, and it is the pair below.
   *
   * The old assertion is in `git show`. What replaced it is not a weaker check
   * of the same thing; it is a check of the animal that exists.
   */
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

  it('reads as incisors: a pair, under the snout, on its own colour', () => {
    const tooth = partById('wedge-01')!
    const t = feature('tooth')
    /* §3.1: the bank files this shape under `nose`, and the PLACEMENT is what
     * says what it is — two small lobes low on the face, under the muzzle, are
     * incisors. The beaver is where that reading comes from: it wears the same
     * pair at y = 0.561, below its own `tube-01` muzzle at y = 0.815.
     *
     * Stated as the relationship rather than as Joe's chosen coordinates. He
     * re-sited these to [0.075, 0.6375, 0.625] on 4 August when he moved the
     * animal onto `box-03` and dropped the mouth line; the exact station is his,
     * and pinning it only meant the test went red when he used the editor. */
    expect(tooth.offset[1]!).toBeLessThan(partById('tube-01')!.offset[1]!)
    expect(t.placement.kind).toBe('pair')

    const g = build()
    // Under the snout, not through it, and out at the front of the face.
    expect(boxOf(g, 'tooth-r').min.y).toBeLessThan(boxOf(g, 'snout').min.y)
    expect(boxOf(g, 'tooth-r').max.z).toBeGreaterThan(boxOf(g, 'hull').max.z)
    // And on their own signed-off colour, which is what replaced the mouth line.
    expect(t.paint.base).toBe('tooth')
    expect(SHREW_ASSEMBLY.palette['tooth']).toBe(0xeeebe7)
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
    // Same triangles as an unpatched hull; only the seam splits. Read off the
    // hull the species actually wears, so it survives Joe changing it.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById(SHREW_ASSEMBLY.hull.part)!.tris)
  })

  it('uses all four of its signed-off colours, and each of them twice over', () => {
    /* §0: the names and the facts are signed-off data. These four are
     * `garden.ts`'s own for this species — asserted as PRESENT AND UNCHANGED
     * rather than as the whole palette, because the whole palette is Joe's to
     * extend. He added a `tooth` slot on 4 August and an equality here turned
     * that into a failure about colours he had not touched. */
    expect(SHREW_ASSEMBLY.palette['coat']).toBe(0x6d5b4a)
    expect(SHREW_ASSEMBLY.palette['belly']).toBe(0xc0ae9a)
    expect(SHREW_ASSEMBLY.palette['muzzle']).toBe(0x4a3d31)
    expect(SHREW_ASSEMBLY.palette['limb']).toBe(0x2e251d)
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
    // The fox's own 1.15 is the number that matters; the exact figure is not
    // pinned, since it moves whenever Joe re-sites the snout or the whip.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
