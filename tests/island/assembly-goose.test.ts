/**
 * The goose. Farm's tallest animal, its only long-necked one, and the species
 * whose whole design is a separation from `animal-duck`, which is not built.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only this animal can say,
 * and it says five things the rest of Farm and `animal-pigeon` need:
 *
 *   1. **`box-41`'S BOUNDING BOX LIES ON THREE OF ITS SIX FACES**, and all three
 *      are ones a bird uses. Its flat plates and its front-top chamfer are
 *      `box-03`'s at identical world coordinates, so joins transfer; nothing
 *      solved off `size`, off `HULL_FRONT_Z` or off the builder's `hullFrame`
 *      does.
 *   2. **THE NECK'S 60-DEGREE LEAN IS FORCED BY THE HEIGHT CEILING.** The test
 *      rebuilds this animal at every 15-degree station and measures four of the
 *      five over `PACK_HEIGHT_MAX` — **a goose that stands its neck up cannot be
 *      built in this pack.**
 *   3. **THE SINK IS SOLVED, AND THE RULE GENERALISES THE TERRAPIN'S**: a leaned
 *      root face rides up as it leans, so `sink * L >= halfDepth * tan(lean)`.
 *      One grid station less and the neck's rear-top corner stands proud of the
 *      crown it is joined to.
 *   4. **THE BANK HAS NO BIRD'S TAIL.** Not one of the seven shapes the pack used
 *      as a tail is wider than it is tall, and a standing bird's tail is. That is
 *      why this one is a nose.
 *   5. **THE EYE IS TANGENT TO THE TIGER'S MUZZLE BOSS**, which is the only
 *      station on this hull at which none of the card is hidden — and rule 5 is
 *      why it is on the body at all.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, GOOSE_ASSEMBLY, EYE_CARD_Z, HEIGHT_FLOOR,
  HULL_FRONT_Z, LEG_ROW, PACK_HEIGHT_MAX, MODEL_TRIS_MAX,
  type Feature,
} from '../../src/island/species/parts'
import {
  creatureSpec, CREATURE_DEFS, type CreatureDef, type PartDef,
} from '../../src/island/species/parts/creature'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-goose',
  parts: ['box-01', 'box-06', 'box-18', 'box-41', 'plate-08', 'tube-02', 'tube-06', 'tube-07'],
  // 0.064 under the pack's own ceiling of 2.02, which is what the neck's lean was
  // solved against — and half a body taller than any bird on the 1.250 cube.
  height: 1.956,
  verts: 541,
  tris: 704,
  // TWO legs. A bird.
  legs: 2,
  // The hull is nine times the next biggest thing on the animal, which is the
  // neck — 2.36925 against 0.25648 of bounding volume.
  massRatio: 8,
  // The neck, the wing pair and the tail all turn. The head, the bill and the
  // eyes do not. Said as a number, because rule 4's "no node carries a rotation"
  // passes vacuously on an animal with none.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-goose')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): Feature => GOOSE_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** The hull's own points, in world space — the shell's recorded offset applied. */
const hullPoints = (id: string): [number, number, number][] => {
  const at = partById(id)!.offset
  return points(id).map(p => [p[0] + at[0]!, p[1] + at[1]!, p[2] + at[2]!])
}

/** How far a stated PLANE of a hull reaches along another axis, in world space. */
const reachAt = (
  id: string, face: 0 | 1 | 2, plane: number, along: 0 | 1 | 2,
): number => Math.max(...hullPoints(id)
  .filter(p => Math.abs(p[face]! - plane) < 1e-6)
  .map(p => Math.abs(p[along]!)))

/**
 * This exact animal with the NECK re-specified, solved from the definition.
 *
 * It has to go back through `creatureSpec` rather than patching the built
 * `AssemblyBuild`, because the head hangs off the neck with `on:` and that anchor
 * is solved at definition time — patching the build would move the neck and
 * leave the head where it was, which measures a creature nobody designed.
 */
function neckAs(patch: Partial<PartDef>): number {
  const def = CREATURE_DEFS.get('animal-goose')!
  const d: CreatureDef = { ...def, snout: { ...(def.snout as PartDef), ...patch } }
  const g = buildAssembly(creatureSpec('animal-goose', d))
  g.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(g)
  return b.max.y - b.min.y
}

/* ------------------------------------------------------------- the hull --- */

describe('animal-goose: box-41 lies about three of its six faces', () => {
  it('has a MUZZLE BOSS where its bounding box says a front face', () => {
    /*
     * The single most expensive thing to get wrong on this shell. `hulls.ts:97`
     * records the front at 0.725 and that is the tiger's muzzle standing proud,
     * not a face: an octagonal prism over |x| <= 0.200 and y 0.49375 to 0.89375.
     * The plate an eye card and a wing are solved against is 0.625.
     */
    const P = hullPoints('box-41')
    expect(HULL_FRONT_Z['box-41']).toBe(0.725)
    const tip = P.filter(p => Math.abs(p[2]! - 0.725) < 1e-6)
    expect(tip).toHaveLength(8)                                  // an octagon
    expect(Math.max(...tip.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.2, 6)
    expect(Math.max(...tip.map(p => p[1]!))).toBeCloseTo(0.89375, 5)
    expect(Math.min(...tip.map(p => p[1]!))).toBeCloseTo(0.49375, 5)
    // A PRISM, not a taper: the same octagon is at the plate, 0.100 behind.
    expect(P.filter(p => Math.abs(p[2]! - 0.625) < 1e-6 && Math.abs(p[0]!) <= 0.2001))
      .not.toHaveLength(0)
    // And the flat plate behind it is box-03's own, x and y both.
    const plate = P.filter(p => Math.abs(p[2]! - 0.625) < 1e-6)
    expect(Math.max(...plate.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.3125, 6)
    expect(Math.max(...plate.map(p => p[1]!))).toBeCloseTo(1.11875, 5)
    expect(Math.min(...plate.map(p => p[1]!))).toBeCloseTo(0.49375, 5)
  })

  it('has two RIDGES where its bounding box says a crown, and pads on the flank', () => {
    const P = hullPoints('box-41')
    const shell = partById('box-41')!
    expect(shell.offset[1]! + shell.size[1]! / 2).toBeCloseTo(1.48125, 5)
    const crest = P.filter(p => Math.abs(p[1]! - 1.48125) < 1e-6)
    expect(Math.max(...crest.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.3276, 4)
    // Two bands, fore and aft. The neck's join sits between them.
    const zs = [...new Set(crest.map(p => Number(p[2]!.toFixed(4))))].sort((a, b) => a - b)
    expect(zs).toEqual([-0.2575, -0.1383, 0.1383, 0.2575])
    // The FLAT crown is box-03's, and it is a 0.625 square.
    const crown = P.filter(p => Math.abs(p[1]! - 1.43125) < 1e-6)
    expect(Math.max(...crown.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.3125, 6)
    expect(Math.max(...crown.map(p => Math.abs(p[2]!)))).toBeCloseTo(0.3125, 6)
    // The flank lies the same way: 0.675 is two pads, 0.625 is the plate.
    expect(Math.max(...P.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.675, 6)
    expect(reachAt('box-41', 0, 0.625, 2)).toBeCloseTo(0.3125, 6)
  })

  it('puts every flat plate AND the front-top chamfer on box-03\'s own coordinates', () => {
    /*
     * This is why the cage birds' wing and the pack's leg row transfer onto this
     * shell without being re-solved, and it is what the rest of Farm's big
     * animals should read before picking `box-41`.
     */
    for (const [face, plane, along, want] of [
      [2, 0.625, 0, 0.3125], [2, 0.625, 1, 1.11875],
      [0, 0.625, 2, 0.3125], [1, 1.43125, 2, 0.3125],
    ] as const) {
      expect(reachAt('box-41', face, plane, along)).toBeCloseTo(want, 5)
    }
    // The rear face does not lie at all: it is the cube's.
    expect(Math.min(...hullPoints('box-41').map(p => p[2]!))).toBeCloseTo(-0.625, 6)
    const cube = partById('box-03')!
    expect(cube.offset[1]! + cube.size[1]! / 2).toBeCloseTo(1.43125, 5)
    // The chamfer between the flat crown and the flat plate is a TRUE 45 degrees
    // — -0.3125 of rise against +0.3125 of run — so its midpoint is the cube's.
    expect(1.43125 - 1.11875).toBeCloseTo(0.625 - 0.3125, 9)
    // And the shell costs what §5 says it costs, in the budget that binds.
    expect(partById('box-41')!.tris).toBe(262)
    expect(cube.tris).toBe(60)
    expect(GOOSE_ASSEMBLY.hull.part).toBe('box-41')
    // Nothing that would be wrong on this hull is used: the recorded front, the
    // recorded centre and the bounding crown are all absent from the definition.
    for (const f of GOOSE_ASSEMBLY.features) {
      const at = f.placement.kind === 'row' ? f.placement.from : f.placement.at
      expect(at[2], `"${f.name}" joins the boss at 0.725`).not.toBe(0.725)
      expect(at[1], `"${f.name}" joins the bounding crown at 1.48125`).not.toBe(1.48125)
    }
  })
})

/* ------------------------------------------------------------- the neck --- */

describe('animal-goose: the trunk stood on end, and a lean the ceiling forces', () => {
  it('wears the ELEPHANT\'S TRUNK along its longest axis, not the terrapin\'s', () => {
    // `animal-terrapin.ts:443` wears this same shape forwards, along its 0.425211
    // of depth — the bank's longest forward reach. Stood on end it runs along
    // 0.623004 instead, which is 1.465x longer and is the longest single reach
    // any one part in the bank has.
    const trunk = partById('box-18')!
    expect(trunk.provenance.map(p => p.species)).toEqual(['elephant'])
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    expect(trunk.size[1]! / trunk.size[2]!).toBeCloseTo(1.4652, 4)
    expect(trunk.size[1]).toBe(Math.max(...trunk.size))
    const neck = feature('neck')
    expect(neck.part).toBe('box-18')
    expect(neck.axis, 'the axis override IS the idea').toBe('y')
    expect(neck.dir).toBe(1)
    expect(neck.stretch).toEqual([1, 1.75, 1])
    expect(neck.spin).toEqual([{ axis: 'x', deg: 60 }])
    expect(neck.sink).toBeCloseTo(0.375, 9)
  })

  it('CANNOT stand its neck up: four of the five leans are over the ceiling', () => {
    /*
     * The claim that matters most in this file, because "the goose leans forward
     * because it is aggressive" would be a mood and this is a measurement. The
     * animal is re-solved from its own definition with the spin changed and
     * nothing else — see `neckAs` for why it goes through `creatureSpec`.
     */
    const at = (deg: number): number => neckAs({ spin: [{ axis: 'x', deg }] })
    expect(at(0)).toBeCloseTo(2.2626, 3)
    expect(at(15)).toBeCloseTo(2.2394, 3)
    expect(at(30)).toBeCloseTo(2.1713, 3)
    expect(at(45)).toBeCloseTo(2.0634, 3)
    for (const deg of [0, 15, 30, 45]) {
      expect(at(deg), `${deg} degrees now fits — re-argue the lean`)
        .toBeGreaterThan(PACK_HEIGHT_MAX)
    }
    expect(at(60)).toBeLessThan(PACK_HEIGHT_MAX)
    expect(at(60)).toBeCloseTo(1.9560, 3)
  })

  it('leans for the CAMERA as well: 56% more neck in plan for 0.004 of height', () => {
    // The island camera looks DOWN (`animal-budgie.ts:55-58`), so what is seen of
    // a neck is its projection on the ground. 45 degrees is the elegant answer —
    // it is this hull's own chamfer angle — and it shows a third less neck.
    const visible = (1 - 0.375) * partById('box-18')!.size[1]! * 1.75
    expect(visible).toBeCloseTo(0.681411, 6)
    const plan = visible * Math.sin(Math.PI / 3)
    expect(plan).toBeCloseTo(0.590119, 6)
    // The longest neck the ceiling allows at 45 degrees, from the same solve:
    // stretch 1.25 at 5/16, which measures 1.960130.
    const at45 = (1 - 0.3125) * partById('box-18')!.size[1]! * 1.25
    expect(at45).toBeCloseTo(0.535394, 6)
    expect(at45 * Math.SQRT1_2).toBeCloseTo(0.378581, 6)
    expect(plan / (at45 * Math.SQRT1_2)).toBeCloseTo(1.559, 3)
    expect(visible / at45).toBeCloseTo(1.273, 3)
  })

  it('is not the longest stretch that fits, and says so — 2.0x clears by 0.0153', () => {
    // A stretch costs no geometry, so the only thing holding the neck down is the
    // ceiling. 2.0x is inside it and is refused on MARGIN, out loud, because the
    // harness pins the height exactly.
    expect(neckAs({ stretch: [1, 2, 1] })).toBeCloseTo(2.0047, 3)
    expect(neckAs({ stretch: [1, 2, 1] })).toBeLessThan(PACK_HEIGHT_MAX)
    expect(PACK_HEIGHT_MAX - neckAs({ stretch: [1, 2, 1] })).toBeLessThan(0.02)
    expect(PACK_HEIGHT_MAX - neckAs({ stretch: [1, 1.75, 1] })).toBeGreaterThan(0.06)
    expect(neckAs({ stretch: [1, 1.5, 1] })).toBeCloseTo(1.9074, 3)
  })

  it('solves the SINK, and generalises the terrapin\'s rule to a LEANED root', () => {
    /*
     * §3, nothing floats, applied to a ROOT rather than to a tip — and the lean
     * is what makes it bite. The root face is 0.425211 across the slope, so as
     * the neck leans its rear corner rides up by half of that times tan(lean),
     * and the burial has to keep up.
     */
    const L = partById('box-18')!.size[1]! * 1.75
    expect(L).toBeCloseTo(1.090257, 6)
    const half = partById('box-18')!.size[2]! / 2
    expect(half).toBeCloseTo(0.212606, 5)
    const need = half * Math.tan(Math.PI / 3)
    expect(need).toBeCloseTo(0.368244, 5)
    expect(need / L, 'the lowest sink that buries the whole root face')
      .toBeCloseTo(0.337758, 5)
    expect(feature('neck').sink! * 16).toBe(6)                   // the pack's 1/16 grid
    expect(feature('neck').sink! * L).toBeCloseTo(0.408846, 6)
    expect(feature('neck').sink! * L).toBeGreaterThan(need)      // fully inside
    expect(0.3125 * L).toBeLessThan(need)                        // 5/16 is not
    expect((need - 0.3125 * L) * Math.cos(Math.PI / 3)).toBeCloseTo(0.013769, 5)
    // And it is comfortably over §3's floor for an embedded part.
    expect(feature('neck').sink! * L / 0.125).toBeCloseTo(3.271, 3)
    // What is left standing is the goose.
    expect((1 - feature('neck').sink!) * L).toBeCloseTo(0.681411, 6)
  })

  it('joins the FLAT crown at the lowest station its root will fit on', () => {
    const neck = feature('neck')
    expect(neck.placement).toEqual({ kind: 'single', at: [0, 1.43125, 0.1875] })
    // The root face lands `sink * L` back down the facing; its rear corner is a
    // further half-depth back across the slope.
    const back = 0.375 * 1.090257 * Math.sin(Math.PI / 3)
      + (partById('box-18')!.size[2]! / 2) * Math.cos(Math.PI / 3)
    expect(back).toBeCloseTo(0.460374, 5)
    expect(0.1875 - back, 'the root\'s rear corner, on the crown\'s flat square')
      .toBeCloseTo(-0.272874, 5)
    expect(Math.abs(0.1875 - back)).toBeLessThan(0.3125)
    expect(Math.abs(0.125 - back), '2/16 puts it over the rear chamfer')
      .toBeGreaterThan(0.3125)
    expect(partById('box-18')!.size[0]! / 2).toBeLessThan(0.3125)
  })

  it('exits through the shell at both edges rather than standing on it', () => {
    // The rear-upper edge leaves through the flat crown; the front-lower edge
    // leaves through the front-top chamfer, whose plane is y + z = 1.74375.
    const g = build()
    const n = boxOf(g, 'neck')
    expect(n.max.y).toBeCloseTo(1.9560, 3)
    // Solved: the front-lower edge is a line at 60 degrees off vertical starting
    // at the root's front corner, and it crosses the chamfer at z = 0.422385.
    const rootY = 1.43125 - 0.375 * 1.090257 * Math.cos(Math.PI / 3)
      - (partById('box-18')!.size[2]! / 2) * Math.sin(Math.PI / 3)
    const rootZ = 0.1875 - 0.375 * 1.090257 * Math.sin(Math.PI / 3)
      + (partById('box-18')!.size[2]! / 2) * Math.cos(Math.PI / 3)
    expect(rootY).toBeCloseTo(1.042705, 5)
    expect(rootZ).toBeCloseTo(-0.060269, 5)
    const t = (1.74375 - rootY - rootZ) / (Math.cos(Math.PI / 3) + Math.sin(Math.PI / 3))
    const crossZ = rootZ + t * Math.sin(Math.PI / 3)
    expect(crossZ).toBeCloseTo(0.422385, 5)
    expect(crossZ, 'the neck no longer leaves through the chamfer').toBeGreaterThan(0.3125)
    expect(crossZ).toBeLessThan(0.625)
    // And it clears the eye plane a quarter of a unit above the card's top edge.
    const atEye = rootY + ((EYE_CARD_Z - rootZ) / Math.sin(Math.PI / 3)) * Math.cos(Math.PI / 3)
    expect(atEye).toBeCloseTo(1.444119, 5)
    expect(atEye).toBeGreaterThan(0.994319 + 0.2)
  })

  it('refuses a SECOND segment because the CEILING caps the neck, not the part', () => {
    // Two segments under the same cap are the same 0.681411 of neck with a seam
    // across the middle of it and 80 more triangles. Nothing here was cut for
    // cost: the kit welds, and this animal is 704 triangles of 951.
    const g = build()
    let verts = 0, tris = 0
    for (const c of g.children) {
      const m = c as THREE.Mesh
      if (!m.geometry) continue
      verts += m.geometry.getAttribute('position')!.count
      tris += m.geometry.getIndex()!.count / 3
    }
    expect(verts).toBe(541)
    expect(tris).toBe(704)
    // The raw bank sum is more than twice the built count — do not price an
    // animal off `bank.generated.ts`'s `verts` field.
    const raw = GOOSE_ASSEMBLY.features.reduce((n, f) => {
      const p = partById(f.part)!
      return n + p.verts * (f.placement.kind === 'pair' ? 2 : 1)
    }, partById('box-41')!.verts)
    expect(raw).toBe(1253)
    expect(verts).toBeLessThan(raw / 2)
    // Triangles are the budget that binds, and there is room to spare.
    expect(MODEL_TRIS_MAX - tris).toBe(247)
    expect(tris + partById('box-18')!.tris).toBeLessThan(MODEL_TRIS_MAX)
    expect(GOOSE_ASSEMBLY.features.filter(f => f.part === 'box-18')).toHaveLength(1)
  })

  it('carries the HEAD as a pure donor transfer, held clear above the body', () => {
    // `animal-terrapin.ts:451` wears this same shape in this same role. Because
    // the neck's tip face is leaned and the head's root plane is upright, the
    // transfer lands the root face exactly halved by that plane.
    const head = feature('head')
    expect(head.part).toBe('tube-06')
    expect(head.spin).toBeUndefined()
    expect(head.stretch).toBeUndefined()
    expect(head.sink).toBe(partById('tube-06')!.attachment!.sunkFractionMean)
    expect(head.sink).toBe(0)
    expect(partById('tube-06')!.size[0]! / partById('box-18')!.size[0]!)
      .toBeCloseTo(1.542, 3)                                     // a head is wider
    const g = build()
    const h = boxOf(g, 'head'), n = boxOf(g, 'neck')
    // Above the hull's own crown RIDGES, not merely above its flat crown.
    expect(h.min.y).toBeGreaterThan(1.48125)
    expect(h.min.y - 1.48125).toBeCloseTo(0.1407, 3)
    // And in front of the tiger's boss, so the head is out where a goose's is.
    expect(h.min.z).toBeGreaterThan(0.725)
    expect(h.max.z).toBeGreaterThan(n.max.z)
  })
})

/* -------------------------------------------------------------- the eye --- */

describe('animal-goose: rule 5 keeps the eye off the head, and the boss places it', () => {
  it('states the problem: the head is 0.78 above the plane the eye is nailed to', () => {
    // Not a defect in this species — `CreatureDef.eyes` has no `z` field at all,
    // and no `z` means no long-necked animal can have an eye on its head. It is
    // the one thing here that wants Joe's ruling, and the flag carries it.
    const g = build()
    expect(EYE_CARD_Z).toBe(0.635)
    const head = boxOf(g, 'head').getCenter(new THREE.Vector3())
    expect(head.y - 0.994319).toBeCloseTo(0.7776, 3)
    expect(head.z, 'the head is in front of the eye plane, not just above it')
      .toBeGreaterThan(EYE_CARD_Z)
    expect(GOOSE_ASSEMBLY.flag).toMatch(/THE EYE CANNOT BE ON THE HEAD/i)
  })

  it('is TANGENT to the tiger\'s muzzle boss — the one station that hides none of it', () => {
    // plate-08 is a true disc, so "clear of the boss" is a distance and not a
    // bounding-box question.
    const r = points('plate-08').map(p => Math.hypot(p[0]!, p[1]!))
    expect(Math.max(...r)).toBeCloseTo(0.2, 6)
    // The boss vertex nearest the card's own recorded x, off the hull itself.
    const corner: [number, number] = [0.1414, 0.83515]
    expect(hullPoints('box-41').some(p =>
      Math.abs(p[0]! - corner[0]) < 1e-4 && Math.abs(p[1]! - corner[1]) < 1e-4
      && p[2]! > 0.62)).toBe(true)
    const solved = corner[1] + Math.sqrt(0.2 ** 2 - (0.2625 - corner[0]) ** 2)
    expect(solved).toBeCloseTo(0.994319, 6)
    const eye = feature('eye')
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at[0]).toBe(partById('plate-08')!.offset[0])
      expect(eye.placement.at[1]).toBeCloseTo(solved, 9)
      expect(eye.placement.at[2]).toBe(EYE_CARD_Z)
    }
    // Exactly tangent: the distance from the card's centre to that corner is the
    // card's own radius, so the disc touches the boss and never enters it.
    expect(Math.hypot(0.2625 - corner[0], solved - corner[1])).toBeCloseTo(0.2, 9)
    // It DOES overlap the boss in y — the clearance is the disc's, not a box's.
    expect(solved - 0.2).toBeLessThan(0.89375)
  })

  it('costs a top edge over the chamfer, and it is inside the lion\'s own float', () => {
    // The plate is 0.225 clear above the boss and the card is 0.400, so there is
    // no free placement — this is the smallest float once the boss is cleared.
    expect(1.11875 - 0.89375).toBeCloseTo(0.225, 6)
    expect(0.225).toBeLessThan(partById('plate-08')!.size[1]!)
    const float = 0.01 + (0.994319 + 0.2 - 1.11875)
    expect(float).toBeCloseTo(0.085569, 5)
    expect(float, 'the lion floats 0.135 on box-31 and that is the precedent')
      .toBeLessThan(0.135)
    expect(float).toBeGreaterThan(0.01)
  })
})

/* ------------------------------------------------------ the bill and tail --- */

describe('animal-goose: a blunt bill, and a tail the bank could not supply', () => {
  it('takes the chick\'s beak and refuses the parrot\'s hook on SHAPE', () => {
    // `animal-canary.ts` reaches the opposite conclusion for a finch and measures
    // the reason: cone-06's upper mandible stands 0.0838 proud of its lower, 29%
    // of its depth, which is where a hook starts. A goose has none.
    const bill = partById('tube-02')!
    expect(bill.provenance.map(p => p.species).sort()).toEqual(['chick', 'penguin'])
    expect(bill.shape.taper).toBe(1)                              // blunt to the tip
    expect(bill.shape.form).toBe('tube')                          // round section
    const C = points('cone-06')
    const upper = Math.max(...C.map(p => p[2]!))
    const bottomY = Math.min(...C.map(p => p[1]!))
    const lower = Math.max(...C.filter(p => Math.abs(p[1]! - bottomY) < 1e-6).map(p => p[2]!))
    expect(upper - lower).toBeCloseTo(0.0838, 4)
    expect(GOOSE_ASSEMBLY.features.some(f => f.part === 'cone-06')).toBe(false)
    // Nearly as wide as the head, which is what a goose's bill is.
    expect(bill.size[0]! / partById('tube-06')!.size[0]!).toBeCloseTo(0.8647, 4)
    expect(feature('bill').sink).toBe(0.5)
    expect(bill.size[2]! * 0.5).toBeCloseTo(0.1, 6)               // what stands clear
    expect(boxOf(build(), 'bill').max.z).toBeCloseTo(1.109, 3)
  })

  it('finds that NOT ONE of the bank\'s seven tails is wider than it is tall', () => {
    /*
     * The finding that decides this part, and it is about the BANK rather than
     * about this animal: a standing bird's tail is held flat. The pack drew seven
     * tails and every one of them is a mammal's.
     */
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    const aspect = (id: string): number => partById(id)!.size[0]! / partById(id)!.size[1]!
    for (const p of tails) {
      expect(aspect(p.id), `${p.id} is now wider than tall — reconsider the tail`)
        .toBeLessThan(1)
    }
    expect(Math.max(...tails.map(p => aspect(p.id)))).toBeCloseTo(0.842, 3)
    expect(aspect('box-38')).toBeCloseTo(0.6861, 4)
    expect(aspect('box-18')).toBeCloseTo(0.5538, 4)
    // And the two that come closest are spent: the beaver's paddle is the
    // chinchilla's, and the fox's brush reads as a fox whatever colour it is.
    expect(partById('wedge-03')!.provenance.map(p => p.species)).toEqual(['beaver'])
    expect(partById('box-23')!.provenance.map(p => p.species)).toEqual(['fox'])
    // The nose that is: 0.532 wide by 0.300 tall, the only short broad blunt
    // shape in reach.
    expect(aspect('tube-07')).toBeCloseTo(1.7733, 4)
    expect(feature('tail').part).toBe('tube-07')
  })

  it('wears the giraffe\'s NOSE backwards, placed by the donor transfer entire', () => {
    const tail = feature('tail')
    expect(partById('tube-07')!.roles).toEqual(['nose'])
    expect(partById('tube-07')!.provenance.map(p => p.species))
      .toEqual(expect.arrayContaining(['giraffe']))
    expect(tail.spin).toEqual([{ axis: 'y', deg: 180 }])
    expect(tail.stretch).toBeUndefined()
    expect(tail.sink).toBe(partById('tube-07')!.attachment!.sunkFractionMean)
    // Nothing but the turn: the rear face and the shape's own height.
    expect(tail.placement).toEqual({
      kind: 'single', at: [0, partById('tube-07')!.offset[1], -0.625],
    })
    // Its whole root is on the flat rear plate, so §3's 0.125 floor — which is
    // about a root over a chamfer — has nothing to bite on here, and the donor's
    // own 0.100 of burial is left alone.
    const t = partById('tube-07')!
    expect(t.size[0]! / 2).toBeLessThan(0.3125)
    expect(t.offset[1]! + t.size[1]! / 2).toBeLessThan(1.11875)
    expect(t.offset[1]! - t.size[1]! / 2).toBeGreaterThan(0.49375)
    expect(t.size[2]! * t.attachment!.sunkFractionMean).toBeCloseTo(0.1, 5)
    // A goose's tail is short: 35% of what the parrot's fan would reach.
    const reach = (id: string): number =>
      partById(id)!.size[2]! * (1 - partById(id)!.attachment!.sunkFractionMean)
    expect(reach('tube-07')).toBeCloseTo(0.166, 5)
    expect(reach('tube-07') / reach('box-38')).toBeCloseTo(0.354, 3)
    // And the fan is separately the TURKEY's, in the collection with the roster's
    // densest look-alike group.
    expect(partById('box-38')!.provenance.map(p => p.species)).toEqual(['parrot'])
    expect(GOOSE_ASSEMBLY.features.some(f => f.part === 'box-38')).toBe(false)
  })
})

/* ------------------------------------------------- the wing, and the feet --- */

describe('animal-goose: the cage birds\' wing, re-derived on a hull that is not box-03', () => {
  it('joins the FLAT flank and the flat flank\'s own centre, not the shell\'s', () => {
    /*
     * The two numbers that would have been wrong if the budgie's line had simply
     * been copied. `box-41`'s recorded centre is 0.83125 and its box reaches
     * 0.675; the plate a wing lies on is at x 0.625 and is centred on 0.80625.
     */
    expect(partById('box-41')!.offset[1]).toBe(0.83125)
    const wing = feature('wing')
    expect(wing.placement.kind).toBe('pair')
    if (wing.placement.kind === 'pair') {
      expect(wing.placement.at).toEqual([0.625, 0.80625, 0])
      // Neither is the shell's own recorded number, and on this hull that matters.
      expect(wing.placement.at[1]).not.toBe(partById('box-41')!.offset[1])
      expect(wing.placement.at[0]).not.toBe(partById('box-41')!.size[0]! / 2)
    }
    // At 0.80625 the whole 0.482 of wing stays inside the plate's 0.49375-1.11875.
    const w = boxOf(build(), 'wing-r')
    expect(w.min.y).toBeGreaterThan(0.49375)
    expect(w.max.y).toBeLessThan(1.11875)
  })

  it('re-solves the sink on this shell and lands on the same 8/16', () => {
    const part = partById('box-06')!
    const tip = part.shape.longest / 2
    expect(tip).toBeCloseTo(0.456649, 6)
    const flat = reachAt('box-41', 0, 0.625, 2)
    expect(flat).toBeCloseTo(0.3125, 6)
    expect(tip - flat).toBeCloseTo(0.144149, 6)
    const needed = (tip - flat) / part.size[2]!
    expect(needed).toBeCloseTo(0.471328, 5)
    expect(needed).toBeGreaterThan(part.attachment!.sunkFractionMean)
    const wing = feature('wing')
    expect(wing.sink! * 16).toBe(8)
    expect(wing.sink! * part.size[2]!).toBeCloseTo(0.152918, 6)
    expect(wing.sink! * part.size[2]!).toBeGreaterThan(0.125)
    expect(wing.axis).toBe('z')
    expect(wing.dir).toBe(-1)
    expect(wing.spin).toEqual([{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }])
  })

  it('is a SOLID standing proud of the flank, never a card', () => {
    // The island camera looks DOWN, so a zero-thickness card on a flank is
    // edge-on and gone (`animal-budgie.ts:55-58`). This one stands 0.152918 out.
    const g = build()
    const w = boxOf(g, 'wing-r')
    expect(w.max.x - 0.625).toBeCloseTo(0.152918, 4)
    expect(w.max.x - w.min.x).toBeCloseTo(0.305836, 4)
    expect(partById('box-06')!.size[2]).toBeGreaterThan(0)
    expect((g.getObjectByName('wing-l')!.userData['facing'] as number[])[0]).toBeCloseTo(-1, 6)
  })

  it('stands on TWO legs, on the pack\'s row and on the midline a biped needs', () => {
    const leg = feature('leg')
    expect(leg.name).toBe('leg')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
    expect(boxOf(build(), 'leg-r').min.y).toBeCloseTo(0, 6)
  })

  it('says WEBBED with JT-044\'s patch, because the bank has no webbed foot', () => {
    // `animal-pony.ts:322`'s line, `animal-terrapin.ts`'s slot name. It is not a
    // marking: a goose's leg and web are one orange, and this is the only thing
    // the kit can say the word with.
    expect(feature('leg').paint).toEqual({ base: 'limb', patch: { below: 'web', at: 0.25 } })
    // 4/16 is the LOWEST grid station clearing box-01's bevel.
    const leg = partById('box-01')!
    const ys = [...new Set(points('box-01').map(p => Number(p[1]!.toFixed(6))))]
      .sort((a, b) => a - b)
    expect(ys).toHaveLength(3)
    expect((ys[1]! - ys[0]!) / leg.size[1]!).toBeCloseTo(0.204, 3)
    expect(0.1875).toBeLessThan((ys[1]! - ys[0]!) / leg.size[1]!)   // 3/16 is in the bevel
    expect(0.25).toBeGreaterThan((ys[1]! - ys[0]!) / leg.size[1]!)  // 4/16 clears it
    expect(0.25 * leg.size[1]!).toBeCloseTo(0.076563, 5)
    expect(0.25 * leg.size[1]! / LEG_ROW.y).toBeCloseTo(0.4224, 4)
  })
})

/* ------------------------------------------------------ big, and separate --- */

describe('animal-goose: the separation animal-duck cannot take away', () => {
  it('is the tallest thing this pack can build, and the ceiling is what stopped it', () => {
    const s = new THREE.Box3().setFromObject(build())
    expect(s.max.y).toBeCloseTo(1.9560, 3)
    expect(PACK_HEIGHT_MAX - (s.max.y - s.min.y)).toBeCloseTo(0.064, 3)
    // Well over a third taller than a bird on the 1.250 cube, which is where
    // every other bird in this collection stands.
    expect(s.max.y / HEIGHT_FLOOR).toBeCloseTo(1.3667, 3)
  })

  it('keeps its keep-out well inside Farm\'s own ratchet', () => {
    // `pets.ts:652` makes it max(width, depth) / 2. Farm's worst is the water
    // buffalo at 1.379 and the ratchet is 1.38; the fox's is 1.15.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.5558, 3)
    expect(s.z).toBeCloseTo(1.9000, 3)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.95, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('is one white bird with one shaded tract and no marking anywhere', () => {
    // A white farmyard goose has no counter-shading, so `belly` is free and is
    // declined; `flight` is the coat shaded down on the wings and the tail, which
    // are one feather tract, and it is not a marking.
    expect(GOOSE_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
    for (const f of GOOSE_ASSEMBLY.features) {
      if (f.name === 'eye') continue
      expect(f.paint.byBand, `"${f.name}" paints by band`).toBeUndefined()
    }
    expect(GOOSE_ASSEMBLY.features.filter(f => f.paint.base === 'flight')
      .map(f => f.name).sort()).toEqual(['tail', 'wing'])
    expect(Object.keys(GOOSE_ASSEMBLY.palette))
      .toEqual(['coat', 'flight', 'limb', 'web', 'eye', 'pupil'])
    // Nothing is stretched but the neck, and nothing is authored.
    for (const f of GOOSE_ASSEMBLY.features) {
      if (f.name === 'neck') continue
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(GOOSE_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(GOOSE_ASSEMBLY.flag).not.toMatch(/RULE 1\b/i)
    // Seven features and no more: nothing was added for the sake of adding it.
    expect(GOOSE_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['bill', 'eye', 'head', 'leg', 'neck', 'tail', 'wing'])
  })

  it('flaps, and the motion names a part it actually has', () => {
    const motion = GOOSE_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    const g = build()
    for (const n of ['wing-r', 'wing-l']) expect(g.getObjectByName(n)).toBeDefined()
  })
})
