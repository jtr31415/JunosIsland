/**
 * The tortoise — the species the pack is KNOWN to lack a part for.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a tortoise can say, and for this
 * animal that is mostly the two things a reader must not have to take on trust:
 *
 *   1. **The pack really has no shell.** The flag claims it; this pins it, so a
 *      later builder cannot quietly "find" one and nobody has to re-run the
 *      search. §2: the rejected candidate and the reason are pinned by a test.
 *   2. **The rim really is a rim and not a second mass.** `box-19` at its own
 *      thickness is 1.9x under the hull, which is the fault that scrapped 72
 *      animals. Halved it is 3.81x. Both numbers are asserted, so the halving
 *      cannot be undone as a tidy-up.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, TORTOISE_ASSEMBLY, LEG_ROW, HULL_BOTTOM_Y, PACK_HEIGHT_MIN,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

/*
 * `tube-03` REPLACED `box-18` AT 84cd17a, and the counts moved with it. Joe
 * opened this animal in the workbench editor and pushed it back with the
 * elephant-trunk stub gone and the DEER'S NOSE worn backwards off the rump in its
 * place, at 0.6 scale. `tube-03` is 40 vertices and 22 triangles against
 * `box-18`'s 72 and 80, so the animal lost 32 vertices and 58 triangles without
 * losing a tail. See the tail block at the bottom of this file for what it is now
 * and where it is joined.
 */
assertAssembly({
  id: 'animal-tortoise',
  parts: ['box-01', 'box-03', 'box-19', 'plate-01', 'tube-03', 'wedge-08'],
  // The scutes stand 0.050 proud of the cube's top face, so this animal clears
  // the 1.43125 floor by exactly their thickness and nothing else. Unmoved by the
  // push: the tail never reached above the hull and still does not.
  height: 1.48125,
  verts: 550,
  tris: 596,
  // Stronger than the generic 3, and it is the whole argument of this species:
  // the shell-ring is a RIM on the body, not a second body.
  massRatio: 3.5,
  // The flat turn on the rim, the 180 on the tail — now about x, on `tube-03` —
  // and the two scute rows.
  spinsAtLeast: 4,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-tortoise')
  g.updateMatrixWorld(true)
  return g
}
const box = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string) => TORTOISE_ASSEMBLY.features.find(f => f.name === name)!
const meshes = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh && (m.name === prefix || m.name.startsWith(`${prefix}-`))) out.push(m)
  })
  return out
}

describe('animal-tortoise: THE PACK HAS NO SHELL, and that is measured', () => {
  it('has no dome, no half-sphere and no carapace anywhere in the bank', () => {
    // The flag says this in words. Here it is as an assertion, so it cannot rot.
    // The pack's whole shape vocabulary is six forms and none of them is round in
    // the way a carapace is round.
    const forms = new Set(PARTS_BANK.map(p => p.shape.form))
    expect([...forms].sort()).toEqual(['blade', 'box', 'cone', 'plate', 'tube', 'wedge'])
    expect(forms.has('sphere' as never)).toBe(false)
    // And no shape in the bank is roled as a shell or a carapace. The nearest
    // thing the pack has is `band` — a ring, which is a rim and not a dome.
    const roles = new Set(PARTS_BANK.flatMap(p => p.roles))
    expect(roles.has('shell' as never)).toBe(false)
    expect(roles.has('carapace' as never)).toBe(false)
    expect(roles.has('band')).toBe(true)
  })

  it('rejects the crab\'s flat hull by MEASUREMENT — do not re-run that search', () => {
    // `box-13` is the pack's one naturally flat hull and the obvious answer to
    // "what is shaped like a shell". It is refused on height, not on taste: at
    // 0.450556 tall on the row every hull sits on, the whole animal is 0.632,
    // and 1.43 is a FLOOR with no headroom underneath it at all.
    const crab = partById('box-13')!
    expect(crab.roles).toContain('hull')
    expect(crab.size[1]).toBeCloseTo(0.450556, 6)
    expect(HULL_BOTTOM_Y + crab.size[1]!).toBeCloseTo(0.631806, 6)
    expect(HULL_BOTTOM_Y + crab.size[1]!).toBeLessThan(PACK_HEIGHT_MIN)
    expect(TORTOISE_ASSEMBLY.hull.part).not.toBe('box-13')
    // The cube instead, unstretched, where the pack itself puts it.
    expect(TORTOISE_ASSEMBLY.hull.part).toBe('box-03')
    expect(TORTOISE_ASSEMBLY.hull.at).toEqual([0, 0.80625, 0])
    expect(TORTOISE_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('carries a flag that says all of it, where Joe reads it', () => {
    const flag = TORTOISE_ASSEMBLY.flag!
    expect(flag).toBeDefined()
    expect(flag).toMatch(/NO SHELL AND NO CARAPACE/)
    expect(flag).toMatch(/box-19/)
    expect(flag).toMatch(/box-13/)
    expect(flag).toMatch(/bespoke part/)
    // Nothing is authored: the flag asks for a bespoke dome, it does not ship one.
    expect(TORTOISE_ASSEMBLY.features.every(f => !f.part.startsWith('bespoke-'))).toBe(true)
    expect(flag).not.toMatch(/RULE 1/)
  })
})

describe('animal-tortoise: the shell-ring is a RIM, and rule 3 is why', () => {
  it('is the fish\'s whole-body shell-ring, and it is a `band` and not a hull', () => {
    const ring = partById('box-19')!
    expect(ring.roles).toEqual(['band'])
    // Not a hull shape — which is the only reason `defineCreature` lets a feature
    // wear something this big at all. The size is what makes it dangerous.
    expect(ring.roles).not.toContain('hull')
    expect(ring.provenance.map(p => p.species)).toEqual(['fish'])
    expect(ring.provenance[0]!.name).toMatch(/shell-ring/)
    expect(ring.size).toEqual([1.404, 1.404, 0.52])
  })

  it('is HALVED, and at full thickness it would be a second mass', () => {
    const rim = feature('rim')
    expect(rim.part).toBe('box-19')
    expect(rim.stretch).toEqual([1, 1, 0.5])
    const hullVol = 1.25 ** 3
    // What the fish's own thickness would cost: 1.404 x 0.520 x 1.404 laid flat.
    const full = 1.404 * 0.52 * 1.404
    expect(hullVol / full).toBeCloseTo(1.905, 3)
    expect(hullVol / full).toBeLessThan(3)      // a SECOND LARGE MASS — rule 3.
    // What it actually is.
    const g = build()
    const h = box(g, 'hull').getSize(new THREE.Vector3())
    const r = box(g, 'rim').getSize(new THREE.Vector3())
    expect(r.y).toBeCloseTo(0.26, 4)
    expect((h.x * h.y * h.z) / (r.x * r.y * r.z)).toBeGreaterThan(3.5)
  })

  it('lies FLAT and stands 0.077 proud of the cube on all four sides', () => {
    const g = build()
    const rim = box(g, 'rim'), hull = box(g, 'hull')
    // Turned onto the horizontal: 1.404 across in BOTH x and z, 0.260 tall.
    expect(rim.max.x - rim.min.x).toBeCloseTo(1.404, 4)
    expect(rim.max.z - rim.min.z).toBeCloseTo(1.404, 4)
    expect(rim.max.y - rim.min.y).toBeCloseTo(0.26, 4)
    // Proud all round — which is what makes it read as an overhanging shell edge
    // rather than as a belt.
    expect(rim.max.x - hull.max.x).toBeCloseTo(0.077, 3)
    expect(rim.max.z - hull.max.z).toBeCloseTo(0.077, 3)
    // And the cube fills its hole: the ring's inner opening is 0.65 across.
    expect(hull.max.x - hull.min.x).toBeGreaterThan(0.68)
  })

  it('is joined on the SAME line the carapace colour changes on', () => {
    // The rim's own chosen number, and it is chosen to agree with the paint. 6/16
    // of the hull's own height is world y = 0.65, and the rim straddles it. (It
    // was the ONLY chosen number in the file until 84cd17a; the tail Joe's push
    // brought back carries two more, and the tail block below says which.)
    expect(TORTOISE_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.375 })
    const line = HULL_BOTTOM_Y + 0.375 * 1.25
    expect(line).toBeCloseTo(0.65, 9)
    const rim = feature('rim')
    if (rim.placement.kind === 'single') expect(rim.placement.at).toEqual([0, 0.65, 0])
    expect(rim.sink).toBe(0.5)
    // `sink: 0.5` on a symmetric band puts its centre exactly on the join plane.
    const b = box(build(), 'rim')
    expect((b.min.y + b.max.y) / 2).toBeCloseTo(line, 4)
    expect(b.min.y).toBeCloseTo(0.52, 4)
    expect(b.max.y).toBeCloseTo(0.78, 4)
  })

  it('overrides the ring\'s axis so the sink measures its THICKNESS, not its span', () => {
    // The tortoise-hoop trick. The ring's measured attachment is `y +1`; after the
    // flat turn that points forward, and a sink along it would be measured across
    // the ring's 1.404 diameter. `axis: 'z', dir: -1` puts the facing back on +y.
    expect(partById('box-19')!.attachment!.axis).toBe('y')
    expect(partById('box-19')!.attachment!.dir).toBe(1)
    const rim = feature('rim')
    expect(rim.axis).toBe('z')
    expect(rim.dir).toBe(-1)
    expect(rim.spin).toEqual([{ axis: 'x', deg: 90 }])
    const m = build().getObjectByName('rim') as THREE.Mesh
    expect((m.userData['facing'] as number[])[1]).toBeCloseTo(1, 6)
    expect(m.userData['extent'] as number).toBeCloseTo(0.26, 4)
  })
})

describe('animal-tortoise: the scutes are §8\'s idiom, and they buy a quarter turn', () => {
  it('lays twelve caterpillar plates on the crown and both upper chamfers', () => {
    const g = build()
    expect(meshes(g, 'scute')).toHaveLength(12)
    expect(meshes(g, 'scute-top')).toHaveLength(4)
    expect(meshes(g, 'scute-chamfer')).toHaveLength(8)
    // A flat plate the pack lays ON a body rather than into one.
    const plate = partById('wedge-08')!
    expect(plate.attachment!.sunkFractionMean).toBe(0)
    expect(plate.size[2]).toBeCloseTo(0.05, 4)
    expect(plate.provenance.map(p => p.species)).toEqual(['caterpillar'])
    // No SIDE row: it would run through the rim at 0.520-0.780.
    expect(meshes(g, 'scute-side')).toHaveLength(0)
  })

  it('steps its rows evenly through a quarter turn — the idiom\'s acceptance test', () => {
    const g = build()
    const facings = new Set(meshes(g, 'scute').map(m => {
      const f = m.userData['facing'] as number[]
      return `${Math.round(Math.atan2(f[0]!, f[1]!) * 180 / Math.PI)}`
    }))
    // -45, 0, +45: three even steps, so the crown follows an arc instead of
    // being one flat plane. The hedgehog's five span a half turn; this is half of
    // that, and it is still not a dome.
    expect([...facings].map(Number).sort((a, b) => a - b)).toEqual([-45, 0, 45])
  })

  it('puts every station on the pack\'s 1/16 grid, and every one of them embedded', () => {
    const top = meshes(build(), 'scute-top')
      .map(m => Number(((m.userData['joinedAt'] as number[])[2]!).toFixed(5)))
      .sort((a, b) => a - b)
    // ridgeSpan snaps the spacing DOWN to 3/16 = 0.1875 so the outermost station
    // stays inside the 0.3125 the cube's flat top face actually reaches — §8 step
    // 4, and §3's "nothing floats" as arithmetic rather than as taste.
    expect(top).toEqual([-0.28125, -0.09375, 0.09375, 0.28125])
    for (const z of top) expect(Math.abs(z)).toBeLessThanOrEqual(0.3125)
  })
})

describe('animal-tortoise: the rest is the pack\'s, and the tail\'s name is Kenney\'s', () => {
  it('wears the DEER\'S NOSE backwards as its tail, and no longer the trunk', () => {
    /*
     * REWRITTEN AT 84cd17a. This block used to say: the tail is `box-18`, the
     * elephant's TRUNK under Kenney's wrong name, spun 180 about y and joined at
     * the rear face by donor transfer — the bank's own recorded height, sunk the
     * elephant's own nothing, reaching its own 0.425211 behind the body.
     *
     * Joe opened this animal in the workbench editor and pushed it back with that
     * feature gone. What is on the rump now is `tube-03`, whose ONLY bank role is
     * `nose` and whose one donor is the DEER's, turned 180 about x so it points
     * backwards, at 0.6 on every axis. §3.1 is the reason that is a tail and not a
     * mistake — a part's identity is where you put it, not the label it arrived
     * with — and it is the same argument that made the elephant's trunk a tail
     * here in the first place. The name it carries is the editor's: the feature is
     * called `tube-03` after its own part, not `tail`, so `feature('tail')` no
     * longer resolves and neither does `getObjectByName('tail')`.
     *
     * `box-18` is still the bank's only stub tail and this species no longer wears
     * it. The vole, the badger and the terrapin do, and their files carry that
     * measurement now.
     */
    expect(TORTOISE_ASSEMBLY.features.some(f => f.part === 'box-18')).toBe(false)
    expect(TORTOISE_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(false)

    const nose = partById('tube-03')!
    expect(nose.roles).toEqual(['nose'])
    expect(nose.provenance).toHaveLength(1)
    expect(nose.provenance[0]!.species).toBe('deer')
    const tail = feature('tube-03')
    expect(tail.spin).toEqual([{ axis: 'x', deg: -180 }])
    expect(tail.stretch).toEqual([0.6, 0.6, 0.6])
    /* NOT a donor transfer, and this is the honest way to say so. The height and
     * the join z are Joe's own from the editor: the deer wears this shape at
     * y = 0.757432 on z = +0.740710, and neither number is here. -0.5875 is 0.0375
     * IN FRONT of the rear face, so the join is embedded rather than flush. The
     * sink is the one thing that did transfer — the deer buries this shape by
     * nothing at all, and neither does this. */
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, 0.4375, -0.5875])
      expect(tail.placement.at[1]).not.toBeCloseTo(nose.offset[1]!, 3)
      expect(tail.placement.at[2]).not.toBe(-0.625)
    }
    expect(tail.sink).toBe(nose.attachment!.sunkFractionMean)
    expect(tail.sink).toBe(0)
    // 0.101 behind the body, against the trunk's 0.425: a quarter of the stub it
    // replaced, and the shortest thing this collection calls a tail.
    const g = build()
    expect(box(g, 'hull').min.z - box(g, 'tube-03').min.z).toBeCloseTo(0.101340, 4)
  })

  it('has NO ears, and says so by having no ear feature at all', () => {
    expect(TORTOISE_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
    expect(TORTOISE_ASSEMBLY.features.some(f => partById(f.part)?.roles.includes('ear'))).toBe(false)
  })

  it('takes its legs and its eye plane from the defaults, and never mentions them', () => {
    const leg = feature('leg')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') expect(leg.placement.from[1]).toBe(LEG_ROW.y)
    const eye = feature('eye')
    expect(eye.part).toBe('plate-01')
    expect(eye.stretch).toBeUndefined()
  })

  it('paints the shell as one system: the rim and the scutes are one hue', () => {
    /* A SIXTH SLOT APPEARED AT 84cd17a AND IT IS NOT A HUE. The five named slots
     * are the species' colour vocabulary — coat, belly, horn, limb, pupil — and
     * the workbench editor's push added `tube-03`, a slot named after the PART
     * that uses it rather than after anything it means, holding 0xd7c79c, which is
     * `belly` again to the bit. So the palette now has a duplicate colour under a
     * machine name, and the tail is the only feature that reads it. Pinned as it
     * stands rather than quietly dropped; it is worth Joe's eye, because `limb`
     * (0x6b6455, "duller skin: legs and tail") is the slot a tail was meant to
     * take and it is still there, unused by any tail. */
    expect(Object.keys(TORTOISE_ASSEMBLY.palette))
      .toEqual(['coat', 'belly', 'horn', 'limb', 'pupil', 'tube-03'])
    expect(TORTOISE_ASSEMBLY.palette['tube-03']).toBe(TORTOISE_ASSEMBLY.palette['belly'])
    expect(feature('tube-03').paint).toEqual({ base: 'tube-03' })
    expect(feature('rim').paint).toEqual({ base: 'horn' })
    expect(feature('scute-top').paint).toEqual({ base: 'horn' })
    expect(feature('scute-chamfer').paint).toEqual({ base: 'horn' })
    // Rule 8: one hue per part. Nothing on this animal is two-tone by band.
    expect(TORTOISE_ASSEMBLY.features
      .filter(f => f.paint.byBand !== undefined)
      .map(f => f.name)).toEqual(['eye'])
  })

  it('fits between two trees — the rim is wide, and it is still under the fox\'s', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    /* `pets.ts:652` charges keep-out from max(width, depth) / 2. The fox's own
     * 1.15 is the pack's worst and the gate below is the claim.
     *
     * 0.714 SINCE 84cd17a, WAS 0.876. The rim has not moved: it is 1.404 in both
     * x and z, and the rim alone would cost 0.702. What moved is the DEPTH. The
     * elephant stub used to reach 0.425 behind the hull and so 0.348 behind the
     * rim's own rear edge, making 1.752 of depth; the `tube-03` Joe's push put
     * there reaches 0.101 behind the hull, which is 0.024 behind the rim. So the
     * rim is now very nearly the whole footprint, and this animal costs less room
     * than it was asserted to rather than more. */
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.714, 3)
  })
})
