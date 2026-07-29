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
  // The bare cube's 1.43125 floor, plus the 0.0811 the top row of scales shows.
  height: 1.5124,
  verts: 502,
  tris: 776,
  // The coil is the biggest thing after the hull and it is under a quarter of
  // it — which is the whole reason it was shrunk. See the rule 3 test below.
  massRatio: 4,
  // The coil is turned flat and the chamfer and side rows are turned onto their
  // own normals. Three features carry a spin; said out loud, because rule 4's
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
    expect(Math.abs(build().position.y)).toBeLessThan(1e-9)
  })
})

describe('animal-slow-worm: the coil is what it stands on', () => {
  it('lands the ring\'s underside exactly where the feet would have been', () => {
    const g = build()
    const coil = boxOf(g.getObjectByName('coil')!)
    expect(coil.min.y).toBeCloseTo(0, 9)
    // And it is the lowest thing on the animal, by itself.
    for (const name of ['hull', 'eye-r', 'scale-side-r0']) {
      expect(boxOf(g.getObjectByName(name)!).min.y, name).toBeGreaterThan(0.1)
    }
    // Joined at the one plane in the kit that never moves, and sunk the share of
    // its own thickness that leaves `HULL_BOTTOM_Y` of it below that plane —
    // solved, not chosen. (0.456 - 0.18125) / 0.456.
    const coilFeature = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')!
    if (coilFeature.placement.kind === 'single') {
      expect(coilFeature.placement.at).toEqual([0, HULL_BOTTOM_Y, 0])
    }
    const thick = partById('box-04')!.size[2]!
    expect(coilFeature.sink).toBeCloseTo((thick - HULL_BOTTOM_Y) / thick, 9)
    // Its top is then 0.275 up inside the belly, where the hull is 0.5875 wide
    // against the ring's own 0.500 — embedded, not perched. §3, nothing floats.
    expect(coil.max.y).toBeCloseTo(thick, 6)
    expect(coil.max.y - boxOf(g.getObjectByName('hull')!).min.y).toBeCloseTo(0.2748, 4)
  })

  it('lays the bee\'s shell-ring FLAT, and it is still the bee\'s ring', () => {
    const ring = partById('box-04')!
    // Measured `x +1`: the bee wears this as a ring AROUND its abdomen, which is
    // the one thing this species must not do with it.
    expect(ring.attachment!.axis).toBe('x')
    expect(ring.provenance.map(p => p.species)).toEqual(['bee'])
    const coil = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')!
    // Rule 4 as amended: the turn is baked into the copy's vertices, and the
    // facing turns with it — `z +1` spun 90 degrees about x points straight
    // down, so the ring hangs UNDER the body rather than off its side.
    expect(coil.spin).toEqual([{ axis: 'x', deg: 90 }])
    expect(coil.axis).toBe('z')
    const facing = build().getObjectByName('coil')!.userData['facing'] as number[]
    expect(facing[1]).toBeCloseTo(-1, 6)
    // Laid flat and shrunk in-plane only: 1.000 across, and the ring's own
    // 0.456 thickness untouched.
    const s = boxOf(build().getObjectByName('coil')!).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1, 6)
    expect(s.z).toBeCloseTo(1, 6)
    expect(s.y).toBeCloseTo(ring.size[2]!, 6)
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
    // At 1.000 across — 16/16 on the pack's own grid — it is 4.28.
    const built = boxOf(build().getObjectByName('coil')!).getSize(new THREE.Vector3())
    expect(hullVol / (built.x * built.y * built.z)).toBeCloseTo(4.283, 3)
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
    // Which is exactly what lifts the animal off the pack's floor: the top row
    // is joined at the hull's own top face and shows that much above it.
    expect(boxOf(g.getObjectByName('scale-top-0')!).max.y)
      .toBeCloseTo(HEIGHT_FLOOR + shows, 5)
    expect(boxOf(g).getSize(new THREE.Vector3()).y).toBeCloseTo(HEIGHT_FLOOR + shows, 5)
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
