/**
 * The glow-worm. Night Time's second insect, and the same species as the firefly
 * at a different life stage — which is the whole reason this file exists twice
 * over.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a glow-worm can say:
 *
 *   1. **The wing absence is measured here too**, and this species is the one
 *      that does not need it: the glowing British animal is the FEMALE, and she
 *      is larviform and genuinely wingless.
 *   2. **The segments are the animal**, and both their spacing and their burial
 *      are solved rather than chosen.
 *   3. **Nothing on it is stretched**, and `box-11` is the only band in the bank
 *      that can be worn at its own size.
 *   4. **It is not the firefly**, asserted BOTH WAYS ROUND, so neither can drift
 *      into the other.
 */
/* The species module FIRST, and deliberately: it registers itself as it defines
 * its build (see `assembled/register.ts`), so importing it here is what puts it
 * on the register before `parts/index.ts` snapshots `ASSEMBLED_BUILDS` below. */
import { GLOW_WORM_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-glow-worm'
import { FIREFLY_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-firefly'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, creatureSpec, MODEL_VERTS_MIN, HEIGHT_FLOOR, EYE_CARD_Z,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-glow-worm',
  parts: ['box-01', 'box-03', 'box-11', 'plate-03', 'plate-06'],
  // The pack's own floor, 1.43125, plus the 0.0787 a segment stands proud of the
  // back. Nothing else on this animal reaches above its own body.
  height: 1.5099,
  verts: 452,
  tris: 718,
  // Nothing is spun: every part sits at the orientation its donor wore it in.
  // Said out loud, because rule 4's "no node carries a rotation" passes vacuously
  // on an animal with none.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-glow-worm')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (o: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(o)
const vertsOf = (g: THREE.Object3D): number => {
  let n = 0
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh) n += m.geometry.getAttribute('position').count
  })
  return n
}
const segments = (g: THREE.Group): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh && m.name.startsWith('segment-')) out.push(m)
  })
  return out.sort((a, b) => b.position.z - a.position.z)
}

describe('animal-glow-worm: the wing that is not missing', () => {
  it('THE WING ARRIVED, and this species still does not want one', () => {
    /* The same measurement the firefly's test makes, repeated rather than shared
     * on purpose: it should go red in every file that reasons from it, and on
     * 4 August it did. Joe had the parrot's and the bee's wings baked into the
     * bank, so `wing` is six shapes now where it was zero.
     *
     * Nothing about THIS animal changes, which is the point of keeping the
     * assertion here rather than deleting it — see the test below. */
    expect(PARTS_BANK.filter(p => p.roles.includes('wing')).length).toBeGreaterThan(0)
    expect(GLOW_WORM_ASSEMBLY.features.some(f => f.name.startsWith('wing'))).toBe(false)
  })

  it('does not need one, and says so where Joe reads it', () => {
    // This species is the sharpest case of the line the collection draws. The
    // glowing British glow-worm is the FEMALE of `Lampyris noctiluca`: larviform
    // all her life, wingless, glowing from a grass stem. The male flies and does
    // not glow. So there is no wing absent from this model — which is why the
    // flag explicitly does NOT claim one, and says instead what actually cannot
    // be expressed, which is her segment spots.
    expect(GLOW_WORM_ASSEMBLY.flag).toMatch(/wingless/i)
    expect(GLOW_WORM_ASSEMBLY.flag).toMatch(/NOT blocked/)
    expect(GLOW_WORM_ASSEMBLY.flag).toMatch(/SEGMENT MARKING CANNOT BE EXPRESSED/)
    expect(GLOW_WORM_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
    // And the marking really is unsayable: `box-11` carries ONE band across all
    // 84 of its triangles, so `byBand` has no corner to send anywhere.
    const seg = partById('box-11')!
    expect([...new Set(seg.bands)]).toEqual([15])
    expect(seg.bands).toHaveLength(seg.tris)
  })
})

describe('animal-glow-worm: the segments are the animal', () => {
  it('wears the caterpillar\'s own body segment, and nothing had spent it', () => {
    const seg = partById('box-11')!
    expect([...new Set(seg.provenance.map(p => p.species))]).toEqual(['caterpillar'])
    expect(seg.roles).toContain('band')
    // A HOOP, not a slab: measured off its raw positions, no vertex comes nearer
    // its own axis than 0.4594 and the outer radius is 0.7910. That is what lets
    // it be worn concentric with a body and still have the face inside it.
    let inner = Infinity, outer = 0
    for (const vi of new Set(seg.indices)) {
      const r = Math.hypot(seg.positions[vi * 3]!, seg.positions[vi * 3 + 1]!)
      if (r < inner) inner = r
      if (r > outer) outer = r
    }
    expect(inner).toBeCloseTo(0.4594, 4)
    expect(outer).toBeCloseTo(0.7910, 4)
    // The whole species is five of them plus a face.
    expect(segments(build())).toHaveLength(5)
  })

  it('recovers box-11\'s own recorded centre, which was never an input', () => {
    // THE DONOR TRANSFER (§8), and the burial only transfers because the AXIS
    // does: `box-11` is `y +1`, so its 0.910269 means something on a mount that
    // joins the top face. That is the condition the corn snake's koala ear failed
    // and it is checked here rather than assumed.
    const seg = partById('box-11')!
    expect(seg.attachment!.axis).toBe('y')
    expect(seg.attachment!.dir).toBe(1)
    expect(seg.attachment!.sunkFractionMean).toBeCloseTo(0.910269, 6)
    // Joined at the hull's top face, which is the plane that attachment names.
    for (const f of GLOW_WORM_ASSEMBLY.features) {
      if (!f.name.startsWith('segment-')) continue
      expect(f.sink).toBeCloseTo(0.910269, 6)
      if (f.placement.kind === 'single') expect(f.placement.at[1]).toBeCloseTo(1.43125, 6)
    }
    // And the centre that falls out is the bank's own recorded offset — a number
    // that was never an input. The middle segment sits exactly where the
    // caterpillar wears its single copy.
    const middle = build().getObjectByName('segment-2')!
    const p = middle.getWorldPosition(new THREE.Vector3())
    expect(p.x).toBeCloseTo(seg.offset[0]!, 6)
    expect(p.y).toBeCloseTo(seg.offset[1]!, 4)
    expect(p.z).toBeCloseTo(seg.offset[2]!, 6)
    // 0.0787 of each ring stands proud of the back, and that is the whole of what
    // lifts this animal off the pack's own floor.
    const top = boxOf(middle).max.y
    expect(top - HEIGHT_FLOOR).toBeCloseTo(0.07865, 5)
    expect(boxOf(build()).getSize(new THREE.Vector3()).y).toBeCloseTo(top, 6)
  })

  it('spaces them so the back reads SEGMENTED and not smooth', () => {
    // The number that makes this a grub rather than a tube, and it is measured.
    // The ring's flat top face runs z = -0.1159 to +0.1159, so at 0.250 apart the
    // five crests clear one another by 0.018 while their chamfers interleave.
    const seg = partById('box-11')!
    const pts = [...new Set(seg.indices)].map(vi => [
      seg.positions[vi * 3 + 1]!, seg.positions[vi * 3 + 2]!,
    ])
    const topY = Math.max(...pts.map(q => q[0]!))
    const flat = pts.filter(q => Math.abs(q[0]! - topY) < 1e-6).map(q => q[1]!)
    const flatHalf = Math.max(...flat)
    expect(flatHalf).toBeCloseTo(0.1159, 4)
    const zs = segments(build()).map(m => m.position.z)
    expect(zs).toEqual([0.5, 0.25, 0, -0.25, -0.5])
    for (let i = 1; i < zs.length; i++) {
      const gap = zs[i - 1]! - zs[i]!
      expect(gap).toBeCloseTo(0.25, 9)
      // Crests apart...
      expect(gap).toBeGreaterThan(2 * flatHalf)
      // ...but the rings themselves still overlapping, so the body is continuous.
      expect(gap).toBeLessThan(2 * Math.max(...pts.map(q => Math.abs(q[1]!))))
      // Every station on the pack's own 1/16 grid.
      expect(Number.isInteger(zs[i]! * 16)).toBe(true)
    }
  })

  it('lights the LAST TWO and no others, which is where her lamps are', () => {
    // `Lampyris noctiluca`'s female carries her light organs on the underside of
    // the last two abdominal segments. Placed as `extras` rather than as a
    // `ridge` for exactly this reason — a ridge paints every copy one slot, and
    // `animal-mole.ts` sets the precedent for splitting a repeated row by hand.
    const lit = GLOW_WORM_ASSEMBLY.features
      .filter(f => f.name.startsWith('segment-') && f.paint.base === 'glow')
    expect(lit.map(f => f.name)).toEqual(['segment-3', 'segment-4'])
    for (const f of lit) {
      if (f.placement.kind === 'single') expect(f.placement.at[2]).toBeLessThan(0)
    }
    // The other three are the darker body slot, and nothing else on the animal is
    // lit — not the hull, not the legs, not the face.
    for (const f of GLOW_WORM_ASSEMBLY.features) {
      if (lit.includes(f)) continue
      expect(f.paint.base, f.name).not.toBe('glow')
    }
    expect(GLOW_WORM_ASSEMBLY.hull.paint.base).not.toBe('glow')
    // And it is the FIREFLY'S OWN hex: same insect, same lamp.
    expect(GLOW_WORM_ASSEMBLY.palette['glow']).toBe(FIREFLY_ASSEMBLY.palette['glow'])
  })
})

describe('animal-glow-worm: nothing on it is stretched', () => {
  it('wears the ONE band in the bank that rule 3 takes at its own size', () => {
    const hull = partById('box-03')!
    const hullVol = hull.size[0]! * hull.size[1]! * hull.size[2]!
    const ratio = (id: string): number => {
      const p = partById(id)!
      return hullVol / (p.size[0]! * p.size[1]! * p.size[2]!)
    }
    // `assertAssembly` wants the hull three times the next largest mesh by
    // bounding box, and a hoop's bounding box is mostly hole — so four of the
    // pack's five bands cannot be worn unstretched by ANY of its ten hulls.
    expect(ratio('box-11')).toBeCloseTo(3.459, 3)
    expect(ratio('box-11')).toBeGreaterThan(3)
    expect(ratio('box-04')).toBeLessThan(3)  // 2.40 — the slow worm shrinks it
    expect(ratio('box-35')).toBeLessThan(3)  // 2.18 — the firefly thins it
    expect(ratio('box-19')).toBeLessThan(3)  // 1.91 — the tortoise halves it
    expect(ratio('box-29')).toBeLessThan(3)  // 1.43 — nothing wears it at all
    // So this animal carries no stretch of any kind, uniform or otherwise.
    for (const f of GLOW_WORM_ASSEMBLY.features) {
      expect(f.stretch, f.name).toBeUndefined()
      expect(f.spin, f.name).toBeUndefined()
    }
    expect(GLOW_WORM_ASSEMBLY.hull.stretch).toBeUndefined()
    // Measured on the BUILT geometry too, not just claimed off the spec.
    for (const m of segments(build())) {
      expect(m.userData['stretch'], m.name).toEqual([1, 1, 1])
    }
  })

  it('keeps its legs, and rule 9\'s vertex FLOOR is why', () => {
    // A grub reads as legless and the kit can say so — the slow worm and the corn
    // snake both do. This one does not, and the measurement is the reason: four
    // `box-01` are 128 built vertices, and without them this animal is 324
    // against `MODEL_VERTS_MIN` 405. That is where a legless species dies, and
    // the segments could not pay it back without becoming a second mass.
    const legless = creatureSpec('animal-glow-worm', {
      palette: GLOW_WORM_ASSEMBLY.palette,
      belly: 0.375,
      legs: false,
      eyes: { part: 'plate-06' },
      extras: [
        ...[0.5, 0.25, 0, -0.25, -0.5].map((z, i) => ({
          name: `segment-${i}`,
          part: 'box-11',
          paint: z < 0 ? 'glow' : 'segment',
          at: [0, 1.43125, z] as [number, number, number],
        })),
        {
          name: 'mouth',
          part: 'plate-03',
          paint: 'pupil',
          at: [0, 0.686849, EYE_CARD_Z] as [number, number, number],
        },
      ],
    })
    const g = buildAssembly(legless)
    g.updateMatrixWorld(true)
    expect(vertsOf(g)).toBe(324)
    expect(vertsOf(g)).toBeLessThan(MODEL_VERTS_MIN)
    expect(vertsOf(build()) - vertsOf(g)).toBe(128)
  })
})

describe('animal-glow-worm: it is not the firefly, both ways round', () => {
  it('shares no feature part with it at all — only the leg row and a mouth card', () => {
    const mine = new Set(GLOW_WORM_ASSEMBLY.features.map(f => f.part))
    const theirs = new Set(FIREFLY_ASSEMBLY.features.map(f => f.part))
    const shared = [...mine].filter(p => theirs.has(p)).sort()
    // `box-01` is the pack's leg, used 86 times across 23 donors, and `plate-03`
    // is the pack's only insect mouth — both donors wore it. Everything else is
    // disjoint, which is what stops one species being the other one twice.
    expect(shared).toEqual(['box-01', 'plate-03'])
    // Not the same hull either: the caterpillar's cube against the panda's.
    expect(GLOW_WORM_ASSEMBLY.hull.part).toBe('box-03')
    expect(FIREFLY_ASSEMBLY.hull.part).toBe('box-36')
    expect(GLOW_WORM_ASSEMBLY.hull.part).not.toBe(FIREFLY_ASSEMBLY.hull.part)
  })

  it('is SEGMENTED where the beetle is smooth, and small-eyed where it is big-eyed', () => {
    // The two structural separations, said as measurements. Repetition along the
    // body is what segmentation IS in this kit: five copies of one band down the
    // back against a firefly that repeats nothing at all.
    const repeated = GLOW_WORM_ASSEMBLY.features.filter(f => f.part === 'box-11')
    expect(repeated).toHaveLength(5)
    expect(FIREFLY_ASSEMBLY.features.filter(f => f.part === 'box-11')).toHaveLength(0)
    expect(GLOW_WORM_ASSEMBLY.features.filter(f => f.part === 'box-35')).toHaveLength(0)
    expect(GLOW_WORM_ASSEMBLY.features.filter(f => f.part === 'box-18')).toHaveLength(0)

    // The pack's whole eye range is 1.44x, and these two sit at its two ends.
    const cards = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (p: typeof cards[number]): number => p.size[0]! * p.size[1]!
    // By area, and order-independently: each card is one of a handed PAIR that
    // measures identically, so "the smallest" is a set of two and so is "the
    // biggest". This animal wears one end of the range and the firefly the other.
    const lo = Math.min(...cards.map(area)), hi = Math.max(...cards.map(area))
    expect(cards.filter(p => area(p) === lo).map(p => p.id).sort())
      .toEqual(['plate-06', 'plate-07'])
    expect(cards.filter(p => area(p) === hi).map(p => p.id).sort())
      .toEqual(['plate-14', 'plate-15'])
    expect(hi / lo).toBeCloseTo(2.115, 3)
    expect(GLOW_WORM_ASSEMBLY.features.find(f => f.name === 'eye')!.part).toBe('plate-06')
    expect(FIREFLY_ASSEMBLY.features.find(f => f.name === 'eye')!.part).toBe('plate-14')

    // And she has no antennae: a larviform female's are vestigial stubs, and the
    // firefly's `cone-01` pair is the loudest single thing separating the two
    // silhouettes. No snout, no nose and no tail either — a grub is a body.
    for (const role of ['antenna', 'ear', 'snout', 'nose', 'tail']) {
      expect(GLOW_WORM_ASSEMBLY.features.some(f => f.name === role), role).toBe(false)
    }
    expect(FIREFLY_ASSEMBLY.features.some(f => f.name === 'antenna')).toBe(true)
  })
})
