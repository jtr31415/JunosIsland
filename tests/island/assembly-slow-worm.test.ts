/**
 * The slow worm. Garden's fourteenth, and the species that had never been built.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a slow worm can say,
 * and for this animal that is mostly one thing said three ways:
 *
 * **`legs: false` takes 0.18125 out from under the hull, and the coil puts it
 * back with the animal's own body rather than with a prop.** The first test
 * below builds the same species WITHOUT its coil and measures it under the
 * pack's own floor, because the argument for every number in the coil is that
 * measurement and it should not be a comment.
 *
 * ---------------------------------------------------------------------------
 * THAT IS NO LONGER TRUE OF THE ANIMAL IN THE GAME, AND THIS FILE IS RED FOR IT.
 *
 * `84cd17a` pushed this species out of the workbench editor with the coil moved
 * from `[0, HULL_BOTTOM_Y, 0]` to `[0, 0.7875, -0.575]`, spun twice about x
 * instead of once (180 degrees, which stands the ring upright rather than laying
 * it flat) and stretched 1.1 through its own thickness. Measured on the built
 * animal, the consequences are:
 *
 *   - **The coil no longer reaches the ground.** Its underside sits 0.2875 above
 *     y = 0 before grounding. It is a hoop on the rump now, not a foot.
 *   - **The animal rests on the hull's own underside.** `buildAssembly` grounds
 *     by translating to the lowest point, and that translation is now -0.18125:
 *     the kit DROPS the animal by exactly the ground clearance the coil used to
 *     supply. The cube's bottom face is the ground plane.
 *   - **So it measures 1.3312 tall, and `PACK_HEIGHT_MIN` is 1.43.** It is
 *     0.0988 under the shortest thing the pack ever shipped, which is the exact
 *     failure the coil was built to prevent, and the shared harness's height
 *     assertion — checked first, on purpose — is where it lands.
 *
 * NOTHING BELOW RE-PINS THAT. Joe's geometry is his and is not reverted here;
 * the numbers that merely DESCRIBE the ring have been re-measured and rewritten,
 * and the three assertions that state the RULE — underside on the ground, kit
 * lifts by nothing, inside the pack's band — are left failing where he can see
 * them. Restoring `at: [0, HULL_BOTTOM_Y, 0]` and a single 90-degree spin is what
 * makes them green; that is his call, not this file's.
 */
/* The species module FIRST, and deliberately: it registers itself as it defines
 * its build (see `assembled/register.ts`), so importing it here is what puts it
 * on the register before `parts/index.ts` snapshots `ASSEMBLED_BUILDS` below.
 * The barrel line does the same job for the game; this import is what makes the
 * test independent of the order the barrel happens to be in. */
import { SLOW_WORM_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-slow-worm'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, creatureSpec,
  HULL_BOTTOM_Y, HEIGHT_FLOOR, PACK_HEIGHT_MIN, LEG_ROW,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-slow-worm',
  parts: ['box-03', 'box-04', 'box-08', 'plate-01'],
  // Was 1.5124 — the bare cube's 1.43125 floor plus the 0.0811 the top row of
  // scales shows. Re-pinned to what the animal now measures: the cube's own
  // 1.250 plus that same 0.0811, because since `84cd17a` the hull's underside
  // IS the ground. THE HARNESS NEVER REACHES THIS PIN — it fails one line
  // earlier on `PACK_HEIGHT_MIN`, which 1.3312 is 0.0988 short of. See the
  // header; that failure is the defect, not the pin.
  height: 1.3312,
  // Unmoved by the push: the ring is the same shape with the same triangles on
  // it, just somewhere else.
  verts: 502,
  tris: 776,
  // The coil is the biggest thing after the hull. Was 4.28 times smaller, and
  // the 1.1 stretch the push put through its thickness has taken that to 3.894 —
  // still clear of the harness's own floor of 3, but it is now over a quarter of
  // the hull rather than under one. See the rule 3 test below.
  massRatio: 3.8,
  // The coil is turned and the chamfer and side rows are turned onto their own
  // normals. Three features carry a spin; said out loud, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 3,
  // The point of the species.
  legs: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-slow-worm')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (o: THREE.Object3D): THREE.Box3 =>
  new THREE.Box3().setFromObject(o)
const named = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh && (m.name === prefix || m.name.startsWith(`${prefix}-`))) out.push(m)
  })
  return out
}

describe('animal-slow-worm: the species the old kit could not say', () => {
  it('has no legs, and nothing else stands in for them', () => {
    // `collections/garden.ts`: "legs is structural in this kit (four boxes,
    // always built) and clamps at a 0.25 minimum, so the quadruped kit cannot
    // express it without lying about the animal." This kit can, in one field.
    expect(SLOW_WORM_ASSEMBLY.features.some(f => f.part === LEG_ROW.part)).toBe(false)
    expect(SLOW_WORM_ASSEMBLY.features.some(f => f.name === 'leg')).toBe(false)
    // And no ears, no tail, no snout and no nose either — a slow worm is a head
    // and a tail with no join anybody can see at 0.16 scale, so the four
    // features every other Garden species separates on are all absent, which is
    // itself this animal's separation.
    for (const role of ['ear', 'tail', 'snout', 'nose']) {
      expect(SLOW_WORM_ASSEMBLY.features.some(f => f.name === role), role).toBe(false)
    }
  })

  it('is UNDER the pack\'s floor without its coil, which is why the coil exists', () => {
    // The same species, minus everything it stands on. `creatureSpec` builds the
    // spec without registering it, so this measurement costs no invented pet.
    const legless = creatureSpec('animal-slow-worm', {
      palette: SLOW_WORM_ASSEMBLY.palette,
      legs: false,
    })
    const g = buildAssembly(legless)
    g.updateMatrixWorld(true)
    const h = boxOf(g).getSize(new THREE.Vector3()).y
    // The hull's own 1.250 and nothing else: dropping the legs drops the
    // 0.18125 of ground clearance `HULL_BOTTOM_Y` holds every hull at, and
    // `HEIGHT_FLOOR` is exactly those two added together.
    expect(h).toBeCloseTo(1.25, 6)
    expect(HEIGHT_FLOOR).toBeCloseTo(1.25 + HULL_BOTTOM_Y, 9)
    // 0.18 under the pack's own minimum. There is no headroom below 1.43 at all
    // (`hulls.ts`), so this is not a species that could be tuned into the band.
    expect(h).toBeLessThan(PACK_HEIGHT_MIN)
    expect(PACK_HEIGHT_MIN - h).toBeCloseTo(0.18, 2)
  })

  it('stands on its own body: the kit lifts it by nothing at all', () => {
    // `buildAssembly` grounds a species by translating it until its lowest point
    // is y = 0, which will hide a floating animal from every other assertion in
    // this file. This one says the translation is ZERO — the coil already lands
    // on the ground, so nothing here is propped up after the fact.
    //
    // THIS IS A RULE AND IT IS FAILING. Measured after `84cd17a`, the translation
    // is -0.18125: not a prop under the animal but the opposite, the kit dropping
    // it by the whole of `HULL_BOTTOM_Y` because the coil no longer reaches the
    // floor and the hull's own bottom face is the lowest thing on the model. That
    // is the ground clearance the previous test proves this species cannot afford
    // to lose, and it is 0.18125 of the 0.0988 by which the animal now misses the
    // pack's height band. NOT RE-PINNED. See the header.
    expect(Math.abs(build().position.y)).toBeLessThan(1e-9)
  })
})

describe('animal-slow-worm: the coil is what it stands on', () => {
  it('lands the ring\'s underside exactly where the feet would have been', () => {
    // THIS IS THE RULE THE SPECIES IS BUILT ON, AND SINCE `84cd17a` IT FAILS.
    //
    // With no legs, the belly is the foot: the ring is joined at the one plane in
    // the kit that never moves and sunk the share of its own thickness that
    // leaves `HULL_BOTTOM_Y` of it below that plane, so its underside lands
    // exactly where four feet would have. Measured now, the underside sits 0.2875
    // above the ground before grounding and 0.10625 after it, and the hull — not
    // the coil — is what touches y = 0. Both assertions below are that fact.
    //
    // Left red on purpose. Re-pinning `0` to `0.10625` here would turn the one
    // statement that pays this animal's height into a note about where a hoop
    // happens to hang. Where the ring ACTUALLY is now is the next test.
    const g = build()
    const coil = boxOf(g.getObjectByName('coil')!)
    expect(coil.min.y).toBeCloseTo(0, 9)
    // And it is the lowest thing on the animal, by itself.
    for (const name of ['hull', 'eye-r', 'scale-side-r0']) {
      expect(boxOf(g.getObjectByName(name)!).min.y, name).toBeGreaterThan(0.1)
    }
  })

  it('carries the ring where the push put it: a hoop on the rump, upright', () => {
    // The description, re-measured off the built animal after `84cd17a`. Every
    // number here was something else before the push and none of them is a rule;
    // the rule is the test above.
    const g = build()
    const coil = boxOf(g.getObjectByName('coil')!)
    const coilFeature = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')!
    // Was `[0, HULL_BOTTOM_Y, 0]` — the hull's own bottom plane, on the midline.
    // It is now 0.60625 higher and 0.575 further back, which is most of the way
    // to the rear face.
    if (coilFeature.placement.kind === 'single') {
      expect(coilFeature.placement.at).toEqual([0, 0.7875, -0.575])
      expect(coilFeature.placement.at[1]! - HULL_BOTTOM_Y).toBeCloseTo(0.60625, 9)
    }
    // The sink is the ONE number on this feature the push left intact, and it is
    // the solved one: the share of the ring's own thickness that leaves
    // `HULL_BOTTOM_Y` of it below the join. (0.456 - 0.18125) / 0.456. It is now
    // sinking the ring into thin air, but it is still the right fraction.
    const thick = partById('box-04')!.size[2]!
    expect(coilFeature.sink).toBeCloseTo((thick - HULL_BOTTOM_Y) / thick, 9)
    // Where it lands: a 1.000 hoop standing up through the animal's whole height,
    // from 0.106 to 1.106, overlapping the hull in all three axes and poking
    // 0.149 out past the rear face. Nothing floats — it is embedded in the rump —
    // but it is embedded in the rump, not tucked under the belly.
    expect(coil.min.y).toBeCloseTo(0.10625, 5)
    expect(coil.max.y).toBeCloseTo(1.10625, 5)
    const hull = boxOf(g.getObjectByName('hull')!)
    expect(coil.min.z).toBeCloseTo(-0.77438, 5)
    expect(coil.max.z).toBeCloseTo(-0.27277, 5)
    expect(coil.min.z).toBeLessThan(hull.min.z)
    expect(coil.max.z).toBeGreaterThan(hull.min.z)
    expect(hull.min.z - coil.min.z).toBeCloseTo(0.14938, 5)
  })

  it('stands the bee\'s shell-ring UPRIGHT, and it is still the bee\'s ring', () => {
    const ring = partById('box-04')!
    // Measured `x +1`: the bee wears this as a ring AROUND its abdomen, which is
    // the one thing this species was built not to do with it. Unchanged, and the
    // lineage still traces — whatever the push did to this copy, it did not stop
    // it being a copy of `box-04`.
    expect(ring.attachment!.axis).toBe('x')
    expect(ring.provenance.map(p => p.species)).toEqual(['bee'])
    const coil = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')!
    // Rule 4 as amended: the turn is baked into the copy's vertices, and the
    // facing turns with it. It was ONE 90-degree turn about x — `z +1` pointing
    // straight down, the ring hanging flat under the body. `84cd17a` pushed TWO,
    // which is 180 degrees: the facing comes back round to `z -1` and the ring
    // stands up again, hooped about the animal's length instead of laid across
    // it. This is what the editor round-trip did, and it is re-pinned rather than
    // undone.
    expect(coil.spin).toEqual([{ axis: 'x', deg: 90 }, { axis: 'x', deg: 90 }])
    expect(coil.axis).toBe('z')
    const facing = build().getObjectByName('coil')!.userData['facing'] as number[]
    expect(facing[1]).toBeCloseTo(0, 6)
    expect(facing[2]).toBeCloseTo(-1, 6)
    // And it is no longer shrunk in-plane only. The across-stretch survived the
    // round-trip as its own evaluated decimal — 1/1.335, to six places — but a
    // third factor of 1.1 arrived on the axis that was the ring's own 0.456
    // thickness, so the shape is 10% fatter through the hoop than the bee made
    // it. 1.000 x 1.000 across, 0.5016 thick.
    expect(coil.stretch).toEqual([0.749064, 0.749064, 1.1])
    expect(0.749064 * ring.size[0]!).toBeCloseTo(1, 4)
    const s = boxOf(build().getObjectByName('coil')!).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1, 6)
    expect(s.y).toBeCloseTo(1, 6)
    expect(s.z).toBeCloseTo(1.1 * ring.size[2]!, 6)
    expect(s.z).toBeCloseTo(0.5016, 4)
  })

  it('is a DETAIL on the mass, and 2.4 is the number that made it shrink', () => {
    const ring = partById('box-04')!
    const hull = partById('box-03')!
    const hullVol = hull.size[0]! * hull.size[1]! * hull.size[2]!
    // The guard in `creature.ts` throws for a feature wearing a HULL shape, and
    // this shape is not one — `box-04` is a `band`, so nothing threw. Rule 3's
    // other half is a size margin, and at the ring's own 1.335 across it fails
    // it: 2.40 against the harness's 3. That is the reading that shrank it.
    expect(ring.roles).toContain('band')
    expect(ring.roles).not.toContain('hull')
    const asAuthored = ring.size[0]! * ring.size[1]! * ring.size[2]!
    expect(hullVol / asAuthored).toBeCloseTo(2.403, 3)
    expect(hullVol / asAuthored).toBeLessThan(3)
    // At 1.000 across — 16/16 on the pack's own grid — and the ring's own 0.456
    // thickness, it was 4.28. The 1.1 that `84cd17a` put through the thickness
    // has taken it to 3.894: still comfortably over the harness's floor of 3, so
    // the ring is still a detail rather than a second mass, but the margin the
    // shrink bought has gone from 43% clear to 30% clear. Re-pinned as measured.
    const built = boxOf(build().getObjectByName('coil')!).getSize(new THREE.Vector3())
    expect(hullVol / (built.x * built.y * built.z)).toBeCloseTo(3.894, 3)
    expect(hullVol / (built.x * built.y * built.z)).toBeGreaterThan(3)
  })

  it('costs no keep-out at all: the coil is inside the hull\'s own width', () => {
    const g = build()
    const coil = boxOf(g.getObjectByName('coil')!).getSize(new THREE.Vector3())
    const hull = boxOf(g.getObjectByName('hull')!).getSize(new THREE.Vector3())
    expect(coil.x).toBeLessThan(hull.x)
    expect(coil.z).toBeLessThan(hull.z)
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The widest
    // thing here is the side row of scales, not the coil, and 0.71 is the
    // smallest keep-out of any Garden animal built so far — against the fox's
    // 1.15, which is the pack's own worst and what the island already copes with.
    const s = boxOf(g).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.706, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})

describe('animal-slow-worm: the back rows are what make a cube read round', () => {
  it('steps five facings 45 degrees apart through a half turn', () => {
    // §8's acceptance test, and it is the whole silhouette question for a
    // legless animal: the back must read as CURVED rather than as three flat
    // faces, and evenly stepping the direction the rows point is what does it.
    const angles = new Set<number>()
    for (const m of named(build(), 'scale')) {
      const f = m.userData['facing'] as [number, number, number]
      expect(Math.hypot(f[0], f[1], f[2])).toBeCloseTo(1, 6)
      expect(f[2]).toBeCloseTo(0, 6)
      angles.add(Math.round((Math.atan2(f[0], f[1]) * 180) / Math.PI))
    }
    expect([...angles].sort((a, b) => a - b)).toEqual([-90, -45, 0, 45, 90])
  })

  it('shows 0.081 of a shape the pack itself wears three-quarters buried', () => {
    const scale = partById('box-08')!
    // `box-08`'s own measured burial, and the pack gave exactly one value for
    // it. An annulation, which a slow worm has, rather than a spine, which it
    // does not — and the depth is twice §3's 0.125 "nothing floats" floor.
    expect(scale.attachment!.sunkFractionMin).toBe(scale.attachment!.sunkFractionMax)
    const sunk = scale.attachment!.sunkFractionMean
    expect(sunk).toBeCloseTo(0.75198, 5)
    expect(sunk * scale.size[1]!).toBeGreaterThan(0.125)
    // The fraction is of the shape's OWN VERTEX extent along its facing, which
    // is 0.3272 — not the 0.327103 in the bank's `size` summary. They differ at
    // the fourth decimal and it is worth pinning, because 0.000024 of height
    // arriving from nowhere looks like a placement bug and is not one.
    const g = build()
    const extent = g.getObjectByName('scale-top-0')!.userData['extent'] as number
    expect(extent).toBeCloseTo(0.3272, 6)
    const shows = (1 - sunk) * extent
    expect(shows).toBeCloseTo(0.08115, 5)
    // Which is what the animal's whole height is made of: the top row is joined
    // at the hull's own top face and shows that much above it.
    //
    // It used to be `HEIGHT_FLOOR + shows` = 1.5124, and the 0.18125 in the
    // middle of that sum was the coil holding the cube off the ground. Since
    // `84cd17a` the cube IS on the ground, so the total is the cube's own 1.250
    // plus this row and nothing else: 1.3312, under the pack's 1.43. Re-pinned
    // against the hull's own measured top rather than against a constant, so this
    // reads as a description of a stack and the height RULE stays where it
    // belongs — in the harness, red.
    const hullTop = boxOf(g.getObjectByName('hull')!).max.y
    expect(hullTop).toBeCloseTo(1.25, 6)
    expect(boxOf(g.getObjectByName('scale-top-0')!).max.y).toBeCloseTo(hullTop + shows, 5)
    expect(boxOf(g).getSize(new THREE.Vector3()).y).toBeCloseTo(hullTop + shows, 5)
    expect(HEIGHT_FLOOR + shows - (hullTop + shows)).toBeCloseTo(HULL_BOTTOM_Y, 9)
  })

  it('keeps every station inside the hull — §3, nothing floats', () => {
    // The flat top face runs to z = +/-0.3125 and the chamfer then falls away
    // 1:1, so a scale buried 0.2460 leaves the hull only past |z| = 0.5585. The
    // rows stop at the hedgehog's own +/-0.375, well inside that.
    const scale = partById('box-08')!
    const bound = 0.3125 + scale.attachment!.sunkFractionMean * scale.size[1]!
    expect(bound).toBeCloseTo(0.5585, 4)
    for (const m of named(build(), 'scale')) {
      expect(Math.abs(m.getWorldPosition(new THREE.Vector3()).z), m.name)
        .toBeLessThanOrEqual(0.375 + 1e-9)
    }
  })

  it('is also what pays rule 9\'s FLOOR, once four legs have gone', () => {
    // Rule 9's budget is a floor as well as a ceiling — the pack's own lightest
    // model is 422 triangles. A hull, a coil and two eye cards are 206, because
    // the four legs that would have carried 176 of them are the thing this
    // species does not have. The rows are load-bearing twice over.
    const tris = (id: string): number => partById(id)!.tris
    expect(tris('box-03') + tris('box-04') + 2 * tris('plate-01')).toBe(206)
    expect(4 * tris(LEG_ROW.part)).toBe(176)
    expect(15 * tris('box-08')).toBe(570)
    // 776 all told: between the mouse's 732 and the pack's own 951 ceiling.
    expect(named(build(), 'scale')).toHaveLength(15)
  })
})

describe('animal-slow-worm: the palette nobody has signed off', () => {
  it('says so in the flag, where Joe reads it', () => {
    // Every other species in `parts/assembled/` paints from colours agreed in
    // `collections/garden.ts` before its geometry existed. This one has none —
    // the slow worm was never in that file to be given any — so these four are
    // the first ever proposed for it and they are UNREVIEWED. The flag is how
    // that reaches the viewer rather than staying in a comment.
    expect(SLOW_WORM_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
    expect(SLOW_WORM_ASSEMBLY.flag).toMatch(/palette/i)
    // Four slots and no more: coat, the paler underside, one dark slot for the
    // dorsal line and the flanks, and the pack's own measured pupil.
    expect(Object.keys(SLOW_WORM_ASSEMBLY.palette))
      .toEqual(['coat', 'belly', 'flank', 'pupil'])
  })

  it('paints the coil from the pale slot, so it continues the belly', () => {
    // The coil is this animal's underside, not a plinth under it, and painting
    // it the same slot as the patch immediately above is what keeps the two
    // reading as one mass rather than as a body sitting on a ring.
    const coil = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')!
    expect(coil.paint).toEqual({ base: 'belly' })
    // 6/16, and not the mouse's 8/16: §7 measured the pack's MAMMAL belly line
    // wandering across 0.4808-0.5481, and a lizard's pale part is the venter.
    expect(SLOW_WORM_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.375 })
    // The dark slot is the marking a female slow worm carries, and it is on the
    // rows and nowhere else.
    for (const f of SLOW_WORM_ASSEMBLY.features) {
      if (f.name.startsWith('scale-')) expect(f.paint).toEqual({ base: 'flank' })
      else expect(f.paint.base).not.toBe('flank')
    }
  })
})
