/**
 * The llama. Farm's tall camelid, the second animal in this pack to stand the
 * elephant's trunk on end, and the one whose design is an argument with
 * `PACK_HEIGHT_MAX` rather than with another species.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only this animal can say, and it says
 * five things — three of which are REFUSALS the whole pack inherits:
 *
 *   1. **NO LONG-NECKED ANIMAL IN THIS PACK CAN HAVE AN ERECT EAR ON ITS HEAD.**
 *      `1.43125 + 0.150 + 0.49375 = 2.075` against a ceiling of 2.02, with a neck
 *      of ZERO length. The ear goes on the crown, and the PALETTE is what ties it
 *      to the head.
 *   2. **THE LEG ROW CANNOT BE LOWERED.** `box-01` on `LEG_ROW` is buried exactly
 *      0.125 — §3's nothing-floats floor to six decimals, with no slack — so
 *      "leggier than an alpaca" has to be paint.
 *   3. **THE LEAN IS NOT FORCED, UNLIKE THE GOOSE'S.** The test rebuilds this
 *      animal at all thirty-five lean-by-sink cells; a vertical neck IS buildable
 *      and is refused on the margin bar `animal-goose.ts` set at 0.0153.
 *   4. **1.8566 IS A FLOOR ON THIS ANIMAL AND IT IS THE EAR** — below 45 degrees
 *      of lean the height stops changing entirely.
 *   5. **THE EYE IS AT THE NECK'S ROOT**, because rule 5 nails `EYE_CARD_Z` and
 *      `CreatureDef.eyes` has no `z`. Flagged, not fixed.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, LLAMA_ASSEMBLY, EYE_CARD_Z, HEIGHT_FLOOR,
  LEG_ROW, PACK_HEIGHT_MAX, MODEL_TRIS_MAX,
  type Feature,
} from '../../src/island/species/parts'
import {
  creatureSpec, CREATURE_DEFS, type CreatureDef, type PartDef,
} from '../../src/island/species/parts/creature'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-llama',
  parts: ['box-01', 'box-03', 'box-14', 'box-18', 'plate-01', 'tube-04', 'tube-06'],
  // 0.0679 under the pack's own ceiling, and 0.0039 under `animal-goose.ts` on
  // purpose — see §2.2 of the species file for why the taller station is refused.
  height: 1.952,
  verts: 456,
  tris: 626,
  // The lean shell costs 60 triangles where `box-41` costs 262, so the hull is
  // twenty-one times the next biggest thing on the animal, which is the tail.
  massRatio: 20,
  // The neck, the ear pair and the tail all turn. The head, the muzzle, the legs
  // and the eyes do not.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-llama')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): Feature =>
  LLAMA_ASSEMBLY.features.find(f => f.name === name)!

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
 * This exact animal with the NECK re-specified, solved from the definition.
 *
 * `animal-goose.ts`'s own harness, and it has to go back through `creatureSpec`
 * for the same reason: the head hangs off the neck with `on:`, and that anchor is
 * solved at definition time, so patching the built `AssemblyBuild` would move the
 * neck and leave the head where it was.
 */
function neckAs(patch: Partial<PartDef>): number {
  const def = CREATURE_DEFS.get('animal-llama')!
  const d: CreatureDef = { ...def, snout: { ...(def.snout as PartDef), ...patch } }
  const g = buildAssembly(creatureSpec('animal-llama', d))
  g.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(g)
  return b.max.y - b.min.y
}
const heightAt = (deg: number, k: number): number =>
  neckAs({ spin: [{ axis: 'x', deg }], sink: k / 16 })

/* ------------------------------------------- the ceiling, and what it buys --- */

describe('animal-llama: 0.58875 above the crown, and three things that want it', () => {
  it('proves NO long-necked animal here can carry an erect ear on its HEAD', () => {
    /*
     * The finding this whole species is built around, and it is about the pack
     * rather than about llamas. `HEIGHT_FLOOR` is `box-03`'s own crown, so a bare
     * cube on the pack's legs already spends every unit of body height there is,
     * and everything above it shares what is left.
     */
    expect(HEIGHT_FLOOR).toBe(1.43125)
    const headroom = PACK_HEIGHT_MAX - HEIGHT_FLOOR
    expect(headroom).toBeCloseTo(0.58875, 9)

    // A head is `tube-06`, so its half-height is what a raised head costs before
    // the neck under it costs anything at all.
    const head = partById('tube-06')!
    expect(head.size[1]! / 2).toBeCloseTo(0.15, 9)

    // An ear buried to §3's own 0.125 floor still stands this proud.
    const ear = partById('tube-04')!
    expect(ear.size[1]).toBeCloseTo(0.61875, 6)
    const proud = ear.size[1]! - 0.125
    expect(proud).toBeCloseTo(0.49375, 9)

    // And the three do not fit, with a neck of ZERO length.
    expect(HEIGHT_FLOOR + head.size[1]! / 2 + proud).toBeCloseTo(2.075, 6)
    expect(HEIGHT_FLOOR + head.size[1]! / 2 + proud,
      'an erect ear now fits on a raised head — re-argue §2 and §3')
      .toBeGreaterThan(PACK_HEIGHT_MAX)
    // 0.150 + 0.49375 is more than the whole headroom on its own.
    expect(head.size[1]! / 2 + proud).toBeGreaterThan(headroom)

    // Shrinking the ear does not rescue it: at 0.65x, 5/16 barely clears the
    // floor and what is left for the neck's rise is a stub.
    const short = ear.size[1]! * 0.65
    expect(short * 0.3125).toBeGreaterThan(0.125)
    expect(PACK_HEIGHT_MAX - HEIGHT_FLOOR - 0.15 - short * 0.6875)
      .toBeCloseTo(0.162246, 5)
  })

  it('has a whole GRID of legal poses where the goose had one', () => {
    /*
     * `animal-goose.ts` measures four of its five leans over the ceiling — it has
     * exactly one buildable pose. This animal is upright enough that the ceiling
     * stops choosing for it, so the choice has to be argued instead. Thirty-five
     * cells, rebuilt from the definition.
     */
    for (const [deg, row] of [
      [0, [2.1263, 2.0874, 2.0485, 2.0095, 1.9706, 1.9317, 1.8927]],
      [15, [2.1078, 2.0702, 2.0325, 1.9949, 1.9573, 1.9197, 1.8821]],
      [30, [2.0533, 2.0196, 1.9859, 1.9521, 1.9184, 1.8847, 1.8566]],
      [45, [1.9667, 1.9391, 1.9116, 1.8841, 1.8566, 1.8566, 1.8566]],
      [60, [1.8603, 1.8566, 1.8566, 1.8566, 1.8566, 1.8566, 1.8566]],
    ] as const) {
      row.forEach((want, i) => {
        expect(heightAt(deg, i + 2), `lean ${deg} at ${i + 2}/16`).toBeCloseTo(want, 3)
      })
    }
  })

  it('finds 1.8566 is a FLOOR, and the floor is the ear the ceiling refused', () => {
    // Below 45 degrees of lean the neck has ducked under the ear, so the animal's
    // height stops responding to the neck at all — the bottom-right of the grid
    // above is one number repeated. The ear that could not go on the head is what
    // this animal cannot get shorter than.
    const floor = heightAt(60, 8)
    expect(floor).toBeCloseTo(1.8566, 3)
    for (const k of [3, 4, 5, 6, 7, 8]) expect(heightAt(60, k)).toBeCloseTo(floor, 6)
    expect(boxOf(build(), 'ear-r').max.y).toBeCloseTo(floor, 6)
    // And at this animal's own lean the head is above it, so the ear is free.
    expect(boxOf(build(), 'head').max.y).toBeGreaterThan(floor)
  })

  it('refuses a VERTICAL neck on the margin bar animal-goose.ts set at 0.0153', () => {
    // Upright IS buildable, which is why this is an argument and not a constraint.
    expect(heightAt(0, 5)).toBeLessThan(PACK_HEIGHT_MAX)
    expect(PACK_HEIGHT_MAX - heightAt(0, 5)).toBeCloseTo(0.0105, 3)
    expect(PACK_HEIGHT_MAX - heightAt(15, 5)).toBeCloseTo(0.0251, 3)
    // The goose refused 0.0153 "on a number the harness pins exactly", and
    // upright is tighter than that.
    expect(PACK_HEIGHT_MAX - heightAt(0, 5)).toBeLessThan(0.0153)
    // Buying the margin back costs the neck, and costs ALL of its ground
    // projection — which is what the island's downward camera actually sees.
    const stand = (k: number): number => (1 - k / 16) * partById('box-18')!.size[1]!
    expect(PACK_HEIGHT_MAX - heightAt(0, 6)).toBeCloseTo(0.0494, 3)
    expect(stand(6)).toBeCloseTo(0.389378, 5)
    expect(stand(6) * Math.sin(0)).toBe(0)
    expect(stand(6) * Math.sin(Math.PI / 12)).toBeCloseTo(0.100778, 5)
    // This animal: 10% more neck, more than double the projection, best margin.
    expect(stand(5)).toBeCloseTo(0.428315, 6)
    expect(stand(5) * Math.sin(Math.PI / 6)).toBeCloseTo(0.214158, 6)
    expect(stand(5) / stand(6)).toBeCloseTo(1.1, 3)
    expect(PACK_HEIGHT_MAX - heightAt(30, 5)).toBeCloseTo(0.0679, 3)
  })

  it('refuses 4/16 for the margin AND for a sibling\'s prose', () => {
    // 1.9859 is legal and is 0.030 taller than `animal-goose.ts`, which shipped
    // saying it is the tallest animal in the collection. The 9% of extra neck
    // separates this animal from nothing: the alpaca is a body-length shorter at
    // either station.
    expect(heightAt(30, 4)).toBeCloseTo(1.9859, 3)
    expect(heightAt(30, 4)).toBeLessThan(PACK_HEIGHT_MAX)
    expect(heightAt(30, 4) - 1.95604).toBeCloseTo(0.0299, 3)
    expect(PACK_HEIGHT_MAX - heightAt(30, 4)).toBeLessThan(
      (PACK_HEIGHT_MAX - heightAt(30, 5)) / 1.9,
    )
    // And it lands just under the goose on purpose.
    const h = new THREE.Box3().setFromObject(build())
    expect(1.95604 - (h.max.y - h.min.y)).toBeCloseTo(0.0039, 3)
  })
})

/* ------------------------------------------------------------- the neck --- */

describe('animal-llama: the trunk stood on end, unstretched, and slimmed', () => {
  it('takes the goose\'s override and NOT the goose\'s stretch', () => {
    const trunk = partById('box-18')!
    expect(trunk.provenance.map(p => p.species)).toEqual(['elephant'])
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    const neck = feature('neck')
    expect(neck.part).toBe('box-18')
    expect(neck.axis, 'the axis override IS the machinery').toBe('y')
    expect(neck.dir).toBe(1)
    expect(neck.spin).toEqual([{ axis: 'x', deg: 30 }])
    expect(neck.sink).toBeCloseTo(0.3125, 9)
    // NOT 1.75x in y as the goose is: at 30 degrees a neck spends 0.866 of its
    // length on height where the goose's spends 0.500, so the shape's OWN length
    // already overshoots and the sink is the dial instead.
    expect(neck.stretch![1], 'the neck is stretched along its length').toBe(1)
    expect(Math.cos(Math.PI / 6) / Math.cos(Math.PI / 3)).toBeCloseTo(1.732, 3)
  })

  it('clears BOTH nothing-floats rules, which swap places against the goose\'s', () => {
    /*
     * `animal-goose.ts` §3 generalised §3 to a leaned root: the root face rides up
     * as it leans, so `sink · L >= halfDepth · tan(lean)`. At 60 degrees that
     * rule binds and the flat 0.125 floor does not. At 30 it is the other way
     * round, and that is the honest reason this sink is not the goose's.
     */
    const L = partById('box-18')!.size[1]!
    expect(L).toBeCloseTo(0.623004, 6)
    const halfDepth = (partById('box-18')!.size[2]! / 2) * 0.85
    expect(halfDepth).toBeCloseTo(0.180715, 6)
    const leaned = halfDepth * Math.tan(Math.PI / 6)
    expect(leaned).toBeCloseTo(0.104336, 6)
    // The flat floor is the bigger of the two here — the goose's rule is slack.
    expect(leaned).toBeLessThan(0.125)
    const buried = feature('neck').sink! * L
    expect(feature('neck').sink! * 16).toBe(5)
    expect(buried).toBeCloseTo(0.194689, 6)
    expect(buried / leaned).toBeCloseTo(1.866, 3)
    expect(buried / 0.125).toBeCloseTo(1.558, 3)
    expect((1 - feature('neck').sink!) * L).toBeCloseTo(0.428315, 6)
  })

  it('is SLIMMED across because the 0.625 crown has to carry three roots', () => {
    // The neck's and both ears'. Unslimmed they clear by 0.00135 a side, which is
    // a coincidence and not a design.
    const neck = feature('neck')
    expect(neck.stretch).toEqual([0.8, 1, 0.85])
    const g = build()
    const n = boxOf(g, 'neck'), e = boxOf(g, 'ear-r')
    expect(n.max.x).toBeCloseTo(partById('box-18')!.size[0]! / 2 * 0.8, 5)
    expect(n.max.x).toBeCloseTo(0.138, 5)
    expect(e.min.x).toBeCloseTo(0.1738, 4)
    expect(e.min.x - n.max.x, 'the gap the 0.8 exists to buy').toBeCloseTo(0.0358, 3)
    expect(e.min.x - partById('box-18')!.size[0]! / 2).toBeCloseTo(0.00130, 4)
    // 0.85 and not 0.8 in z, so the section stays DEEPER than it is wide — which
    // is what a neck's section is and what a square post is not.
    const section = (partById('box-18')!.size[2]! * 0.85) / (partById('box-18')!.size[0]! * 0.8)
    expect(section).toBeCloseTo(1.30953, 4)
    expect(section).toBeGreaterThan(partById('box-18')!.size[2]! / partById('box-18')!.size[0]!)
  })

  it('joins the HIGHEST crown station its root fits on — the goose took the lowest', () => {
    expect(feature('neck').placement).toEqual({ kind: 'single', at: [0, 1.43125, 0.1875] })
    const halfDepth = (partById('box-18')!.size[2]! / 2) * 0.85
    const buried = 0.3125 * partById('box-18')!.size[1]!
    // The root face's two corners, either side of its centre at NECK_Z - sL·sin.
    const front = -buried * Math.sin(Math.PI / 6) + halfDepth * Math.cos(Math.PI / 6)
    const rear = -buried * Math.sin(Math.PI / 6) - halfDepth * Math.cos(Math.PI / 6)
    expect(front).toBeCloseTo(0.059161, 5)
    expect(rear).toBeCloseTo(-0.253851, 5)
    // So the whole window on the crown's flat 0.3125 square is:
    expect(0.3125 - front, 'the forward bound').toBeCloseTo(0.253339, 5)
    expect(-0.3125 - rear, 'the rearward bound').toBeCloseTo(-0.058649, 5)
    // 4/16 is inside it by a third of the daylight the pack gives a flat card.
    expect(0.3125 - front - 0.25).toBeCloseTo(0.003339, 5)
    expect(0.3125 - front - 0.25).toBeLessThan(0.01)
    expect(0.3125 - front - 0.1875).toBeCloseTo(0.065839, 5)
  })

  it('exits THROUGH the shell at both edges rather than standing on it', () => {
    // The rear-upper edge leaves through the flat crown; the front-lower edge
    // leaves through the front-top chamfer, whose plane is y + z = 1.74375.
    const halfDepth = (partById('box-18')!.size[2]! / 2) * 0.85
    const buried = 0.3125 * partById('box-18')!.size[1]!
    const rootY = 1.43125 - buried * Math.cos(Math.PI / 6)
    const rootZ = 0.1875 - buried * Math.sin(Math.PI / 6)
    const lowY = rootY - halfDepth * Math.sin(Math.PI / 6)
    const lowZ = rootZ + halfDepth * Math.cos(Math.PI / 6)
    expect(lowY).toBeCloseTo(1.172288, 5)
    expect(lowZ).toBeCloseTo(0.246662, 5)
    const t = (1.74375 - lowY - lowZ) / (Math.cos(Math.PI / 6) + Math.sin(Math.PI / 6))
    const crossZ = lowZ + t * Math.sin(Math.PI / 6)
    expect(crossZ, 'on the front-top chamfer, not past it').toBeCloseTo(0.365545, 5)
    expect(lowY + t * Math.cos(Math.PI / 6)).toBeCloseTo(1.378205, 5)
    expect(crossZ).toBeGreaterThan(0.3125)
    expect(crossZ).toBeLessThan(0.625)
    // The rear-upper edge, back through the crown's own flat square.
    const hiY = rootY + halfDepth * Math.sin(Math.PI / 6)
    const hiZ = rootZ - halfDepth * Math.cos(Math.PI / 6)
    const backZ = hiZ + ((1.43125 - hiY) / Math.cos(Math.PI / 6)) * Math.sin(Math.PI / 6)
    expect(backZ).toBeCloseTo(-0.021174, 5)
    expect(Math.abs(backZ)).toBeLessThan(0.3125)
  })

  it('carries the head LEVEL on an inclined neck, which is the haughtiness', () => {
    const head = feature('head')
    expect(head.part).toBe('tube-06')
    expect(head.spin, 'the head follows the neck\'s lean').toBeUndefined()
    expect(head.stretch).toBeUndefined()
    expect(head.sink).toBe(partById('tube-06')!.attachment!.sunkFractionMean)
    expect(head.sink).toBe(0)
    // A head is wider than the neck it sits on, and slimming the neck made it
    // more so than the goose's 1.54x.
    expect(partById('tube-06')!.size[0]! / (partById('box-18')!.size[0]! * 0.8))
      .toBeCloseTo(1.928, 3)
    const g = build()
    const h = boxOf(g, 'head')
    expect(h.min.y).toBeCloseTo(1.65215, 4)
    expect(h.max.y).toBeCloseTo(1.95215, 4)
    // Held clear above the body's own crown, and out in front of its front plate.
    expect(h.min.y - 1.43125).toBeCloseTo(0.2209, 3)
    expect(h.max.z).toBeGreaterThan(0.625)
  })
})

/* -------------------------------------------------------------- the ear --- */

describe('animal-llama: the elephant\'s flap, stood on end and turned edge-on', () => {
  it('is the bank\'s ONLY ear much taller than it is broad, and it was reserved', () => {
    const ear = partById('tube-04')!
    expect(ear.provenance.map(p => p.species)).toEqual(['elephant'])
    expect(ear.size[1]! / ear.size[0]!).toBeCloseTo(1.7225, 4)
    // Nothing else in the ear bank is over 1.5 except the bunny's slab, which is
    // the DONKEY's and the MULE's and is committed to `animal-mule.ts`.
    const tall = PARTS_BANK.filter(p => p.roles.includes('ear'))
      .filter(p => p.size[1]! >= 0.5 && p.size[1]! / p.size[0]! > 1.5)
      .map(p => p.id).sort()
    expect(tall).toEqual(['box-06', 'box-07', 'tube-04', 'tube-05'])
    // `cone-01` is the only other ear over that ratio and it is 0.400 long — the
    // pony's short spike, not a banana, which is why the length gate is in there.
    expect(partById('cone-01')!.size[1]).toBeCloseTo(0.4, 3)
    expect(partById('box-06')!.provenance.map(p => p.species)).toEqual(['bunny'])
    expect(LLAMA_ASSEMBLY.features.some(f => f.part === 'box-06')).toBe(false)
    expect(feature('ear').part).toBe('tube-04')
  })

  it('overrides the axis, the spin and the sink, each for its own reason', () => {
    const ear = feature('ear')
    // The elephant hangs this flap off the SIDE of its head across its 0.359219;
    // stood on end it runs along its 0.61875 and is a banana pointing up.
    expect(partById('tube-04')!.attachment!.axis).toBe('x')
    expect(ear.axis).toBe('y')
    expect(ear.dir).toBe(1)
    // Turned edge-on, so 0.277301 lies across x and 0.359219 runs fore-and-aft:
    // narrow from the front, which is what a llama's ear is, and the long curved
    // profile from the side.
    expect(ear.spin).toEqual([{ axis: 'y', deg: 90 }])
    const e = boxOf(build(), 'ear-r')
    expect(e.max.x - e.min.x).toBeCloseTo(partById('tube-04')!.size[2]!, 3)
    expect(e.max.z - e.min.z).toBeCloseTo(partById('tube-04')!.size[0]!, 3)
    // The elephant's own sink would bury 0.078 along THIS axis — under §3's
    // floor, the same correction `animal-bushbaby.ts` had to make on this shape.
    expect(partById('tube-04')!.attachment!.sunkFractionMean * partById('tube-04')!.size[1]!)
      .toBeCloseTo(0.078, 3)
    expect(ear.sink! * 16).toBe(5)
    expect(ear.sink! * partById('tube-04')!.size[1]!).toBeCloseTo(0.193359, 6)
    expect(ear.sink! * partById('tube-04')!.size[1]!).toBeGreaterThan(0.125)
    expect((1 - ear.sink!) * partById('tube-04')!.size[1]!).toBeCloseTo(0.425391, 6)
  })

  it('straddles the crown\'s edge and stays embedded down the chamfer', () => {
    expect(feature('ear').placement).toEqual({ kind: 'pair', at: [0.3125, 1.43125, 0.125] })
    const e = boxOf(build(), 'ear-r')
    // Half on the flat cap, half over the top-side chamfer, which falls away 1:1
    // — so a root buried 0.193359 stays embedded out to 0.505859.
    expect(e.min.x).toBeCloseTo(0.1738, 4)
    expect(e.max.x).toBeCloseTo(0.4512, 4)
    expect(0.3125 + 0.193359, 'the embedded bound').toBeCloseTo(0.505859, 6)
    expect(e.max.x).toBeLessThan(0.505859)
    // The shell's own surface there, and the root face under it.
    expect(1.74375 - e.max.x).toBeCloseTo(1.29255, 4)
    expect(1.43125 - 0.193359).toBeCloseTo(1.237891, 6)
    expect(1.74375 - e.max.x).toBeGreaterThan(1.43125 - 0.193359)
    // At 4/16 the same corner clears by only 0.016, which is the second reason
    // 4/16 is not the sink.
    expect((1.74375 - e.max.x) - (1.43125 - 0.25 * 0.61875)).toBeCloseTo(0.0163, 3)
  })

  it('sits at 2/16 because 4/16 would put its corner over box-03\'s CORNER CUT', () => {
    /*
     * The one place on this shell where a root can leave the surface without
     * leaving the bounding box. `box-03` cuts every edge AND every corner, and
     * the corner facet runs through the three points that sum to 1.25.
     */
    const P = points('box-03')
    const corner = P.filter(p => Math.abs(Math.abs(p[0]!) - 0.625) < 1e-6
      && Math.abs(Math.abs(p[1]!) - 0.3125) < 1e-6 && Math.abs(Math.abs(p[2]!) - 0.3125) < 1e-6)
    expect(corner.length).toBeGreaterThan(0)
    for (const p of corner) {
      expect(Math.abs(p[0]!) + Math.abs(p[1]!) + Math.abs(p[2]!)).toBeCloseTo(1.25, 6)
    }
    const e = boxOf(build(), 'ear-r')
    // At 2/16 the ear's whole depth stays inside the crown's flat square, so the
    // corner facet is never reached.
    expect(e.max.z).toBeCloseTo(0.3046, 4)
    expect(e.max.z, 'the ear has grown onto the corner cut').toBeLessThan(0.3125)
    // The horse's and the sheep's own 4/16 would reach 0.42961, where the corner
    // facet has receded to 1.17549 against a root face at 1.237891 — a float.
    const at4 = 0.25 + partById('tube-04')!.size[0]! / 2
    expect(at4).toBeCloseTo(0.429610, 5)
    const shell = (1.25 - e.max.x - at4) + 0.80625          // the facet, in world y
    expect(shell).toBeCloseTo(1.17544, 4)
    expect(shell).toBeLessThan(1.237891)
    expect(1.237891 - shell, 'the float 2/16 avoids').toBeCloseTo(0.0625, 3)
  })

  it('is tied to the HEAD by the palette, and finishes beside it, not behind it', () => {
    // An ear rooted at the withers is §2's compromise. The fix is not geometry:
    // the ears take the SAME slot as the neck and the head, not the fawn of the
    // body they actually grow out of, so the eye groups them with the head.
    expect(feature('ear').paint).toEqual({ base: 'pale' })
    expect(feature('neck').paint).toEqual({ base: 'pale' })
    expect(feature('head').paint).toEqual({ base: 'pale' })
    expect(LLAMA_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
    // And the lean does its half. At the ear's mid height the neck runs beside
    // it; by the ear's tip the neck has moved forward under the head.
    const g = build()
    const e = boxOf(g, 'ear-r'), h = boxOf(g, 'head')
    const neckZ = (y: number): number => 0.1875
      + ((y - 1.43125) / Math.cos(Math.PI / 6)) * Math.sin(Math.PI / 6)
    const mid = (e.min.y + e.max.y) / 2
    expect(mid).toBeCloseTo(1.5472, 3)
    expect(neckZ(mid)).toBeCloseTo(0.2544, 3)
    expect(neckZ(mid)).toBeGreaterThan(e.min.z)
    expect(neckZ(mid)).toBeLessThan(e.max.z)
    expect(neckZ(e.max.y)).toBeCloseTo(0.4331, 3)
    expect(h.max.y - e.max.y, 'the ear tips finish just under the head')
      .toBeCloseTo(0.0955, 3)
  })
})

/* --------------------------------------------------- the eye and the legs --- */

describe('animal-llama: rule 5 puts the eye on the body, and the row will not move', () => {
  it('is a PURE transfer, because box-03 has no boss to solve around', () => {
    // `animal-goose.ts` §4 had to find the station at which `plate-08`'s disc is
    // tangent to the tiger's muzzle boss. The cube's front plate is flat, so the
    // whole of that argument evaporates and the card's own record is the answer.
    const card = partById('plate-01')!
    const eye = feature('eye')
    expect(eye.part).toBe('plate-01')
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at).toEqual([card.offset[0], card.offset[1], EYE_CARD_Z])
    }
    expect(eye.sink).toBe(0)
    // Entirely inside `box-03`'s flat front plate, and floating the pack's 0.010.
    expect(card.offset[1]! - card.size[1]! / 2).toBeGreaterThan(0.49375)
    expect(card.offset[1]! + card.size[1]! / 2).toBeLessThan(1.11875)
    expect(EYE_CARD_Z - 0.625).toBeCloseTo(0.01, 9)
    // The almond and not the disc: a camelid's eye is long, and the round card is
    // the pack's bird and primate one.
    expect(card.size[0]! / card.size[1]!).toBeCloseTo(1.249, 3)
    expect(partById('plate-08')!.size[0]).toBe(partById('plate-08')!.size[1])
  })

  it('states that the head is 0.87 above the plane the eye is nailed to', () => {
    // Not a defect in this species — `CreatureDef.eyes` has no `z` at all, so no
    // long-necked animal can have an eye on its head. The terrapin shipped this
    // compromise, the goose shipped it again, and the flag carries it.
    const head = boxOf(build(), 'head').getCenter(new THREE.Vector3())
    expect(head.y - partById('plate-01')!.offset[1]!).toBeCloseTo(0.8685, 3)
    // Not merely above the card's CENTRE: the whole head clears the whole card
    // by more than half a unit, so there is no y at all that would reach it.
    const card = partById('plate-01')!
    const cardTop = card.offset[1]! + card.size[1]! / 2
    expect(cardTop).toBeCloseTo(1.09375, 5)
    expect(boxOf(build(), 'head').min.y - cardTop).toBeCloseTo(0.5584, 3)
    // And it is not in front of the plane either — it straddles it, at z 0.402
    // to 0.633, which is the other half of why no placement reaches it.
    expect(boxOf(build(), 'head').max.z).toBeLessThan(EYE_CARD_Z)
    expect(LLAMA_ASSEMBLY.flag).toMatch(/THE EYE CANNOT BE ON THE HEAD/i)
  })

  it('proves the LEG ROW cannot be lowered — the burial is the floor exactly', () => {
    /*
     * `CreatureDef.legs.y` is movable by Joe's own ruling and `buildAssembly`
     * re-grounds the animal, so dropping the row looks like the way to say
     * "leggier". It is not, and the reason is general rather than this animal's.
     */
    const leg = partById('box-01')!
    expect(leg.size[1]).toBeCloseTo(0.30625, 6)
    expect(LEG_ROW.sink).toBe(0.408163)
    const buried = leg.size[1]! * LEG_ROW.sink
    expect(buried, 'the pack\'s own leg is buried EXACTLY §3\'s floor')
      .toBeCloseTo(0.125, 5)
    // So there is no step down that keeps it embedded: one 1/16 leaves half the
    // floor and even 1/32 falls short.
    expect(buried - 1 / 16).toBeCloseTo(0.0625, 5)
    expect(buried - 1 / 16).toBeLessThan(0.125)
    expect(buried - 1 / 32).toBeLessThan(0.125)
    // And the row this species stands on is the pack's own, unmoved.
    const l = feature('leg')
    if (l.placement.kind === 'row') expect(l.placement.from[1]).toBe(LEG_ROW.y)
  })

  it('says "leggy" in PAINT instead, at the bottom of the sheep\'s 4..9 range', () => {
    // `animal-sheep.ts` §4 derived the range once for all four fleece animals.
    // This animal takes 4/16, the lowest station that clears `box-01`'s bevel;
    // the alpaca declines the tool entirely and reads short.
    expect(feature('leg').paint).toEqual({ base: 'limb', patch: { below: 'pad', at: 0.25 } })
    const ys = [...new Set(points('box-01').map(p => Number(p[1]!.toFixed(6))))]
      .sort((a, b) => a - b)
    expect(ys).toHaveLength(3)
    const bevel = (ys[1]! - ys[0]!) / partById('box-01')!.size[1]!
    expect(bevel).toBeCloseTo(0.204082, 5)
    expect(0.1875, '3/16 lands inside the bevel').toBeLessThan(bevel)
    expect(0.25, '4/16 clears it').toBeGreaterThan(bevel)
    // 0.07713 above the sole against 0.18125 of leg a child can see.
    expect(0.25 * partById('box-01')!.size[1]!).toBeCloseTo(0.076563, 5)
    expect((0.18125 - 0.25 * partById('box-01')!.size[1]!) / 0.18125)
      .toBeCloseTo(0.5776, 3)
    // The slot is `pad` and not `hoof`, because a camelid has neither.
    expect(Object.keys(LLAMA_ASSEMBLY.palette)).toContain('pad')
    expect(Object.keys(LLAMA_ASSEMBLY.palette)).not.toContain('hoof')
  })
})

/* --------------------------------------------------- the tail and the rest --- */

describe('animal-llama: the trunk a second time, and what the parti-colour buys', () => {
  it('wears box-18 TWICE — stood on end and turned around', () => {
    const worn = LLAMA_ASSEMBLY.features.filter(f => f.part === 'box-18')
    expect(worn.map(f => f.name).sort()).toEqual(['neck', 'tail'])
    expect(feature('tail').spin).toEqual([{ axis: 'y', deg: 180 }])
    expect(feature('tail').stretch).toBeUndefined()
    expect(feature('tail').sink).toBe(partById('box-18')!.attachment!.sunkFractionMean)
    expect(feature('tail').sink).toBe(0)
  })

  it('takes the sheep\'s 0.001996 window, and that window refuses "held up"', () => {
    // The flat rear plate is 0.625 tall and this shape is 0.623004, so the whole
    // of its root lands on flat geometry only inside a window that narrow — and
    // its midpoint is `box-03`'s own recorded hull centre.
    const t = partById('box-18')!
    expect(t.size[1]).toBeCloseTo(0.623004, 6)
    const window = 0.625 - t.size[1]!
    expect(window).toBeCloseTo(0.001996, 6)
    expect(feature('tail').placement).toEqual({ kind: 'single', at: [0, 0.80625, -0.625] })
    expect(partById('box-03')!.offset[1]).toBe(0.80625)
    // So a raised tail is not available by moving it, and tilting costs a burial
    // this shape does not have: its sink is the bank's only exact zero.
    expect(t.attachment!.sunkFractionMean).toBe(0)
    expect((t.size[1]! / 2) * Math.tan(Math.PI / 9)).toBeCloseTo(0.113375, 5)
    expect((t.size[1]! / 2) * Math.tan(Math.PI / 9)).toBeLessThan(0.125)
    // Nor does the chamfer idiom rescue it: this root face is 0.623004 across a
    // rear-top chamfer facet that is only 0.441942 across the slope.
    expect(Math.hypot(0.625 - 0.3125, 0.625 - 0.3125)).toBeCloseTo(0.441942, 6)
    expect(t.size[1]).toBeGreaterThan(0.441942)
    expect(t.size[1]! - 0.441942).toBeCloseTo(0.181062, 5)
  })

  it('gives the head an END with the deer\'s nose-tip, by pure transfer', () => {
    const muzzle = feature('muzzle')
    expect(muzzle.part).toBe('box-14')
    expect(partById('box-14')!.provenance.map(p => p.species)).toEqual(['deer'])
    expect(muzzle.spin).toBeUndefined()
    expect(muzzle.sink).toBe(0)
    // 43% of the head's width, standing its own 0.126119 clear off its front.
    expect(partById('box-14')!.size[0]! / partById('tube-06')!.size[0]!)
      .toBeCloseTo(0.430, 3)
    const g = build()
    const m = boxOf(g, 'muzzle'), h = boxOf(g, 'head')
    expect(m.min.z).toBeCloseTo(h.max.z, 5)
    expect(m.max.z - m.min.z).toBeCloseTo(0.126119, 3)
  })

  it('is a PARTI-COLOUR with no band cut, no belly and nothing authored', () => {
    // Hue is what a child reads before shape, and llamas commonly are
    // parti-coloured where alpacas commonly are one shade. `coat` is the body and
    // the tail; `pale` is the neck, head and ears; the rest are one part each.
    expect(Object.keys(LLAMA_ASSEMBLY.palette))
      .toEqual(['coat', 'pale', 'limb', 'pad', 'muzzle', 'pupil'])
    expect(LLAMA_ASSEMBLY.features.filter(f => f.paint.base === 'pale')
      .map(f => f.name).sort()).toEqual(['ear', 'eye', 'head', 'neck'])
    for (const f of LLAMA_ASSEMBLY.features) {
      if (f.name === 'eye') continue
      expect(f.paint.byBand, `"${f.name}" paints by band`).toBeUndefined()
    }
    expect(LLAMA_ASSEMBLY.hull.paint).toEqual({ base: 'coat' })
    expect(LLAMA_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(LLAMA_ASSEMBLY.flag).not.toMatch(/RULE 1\b/i)
    // Only the neck is stretched, and only in section.
    for (const f of LLAMA_ASSEMBLY.features) {
      if (f.name === 'neck') continue
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    // Seven features and no more.
    expect(LLAMA_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['ear', 'eye', 'head', 'leg', 'muzzle', 'neck', 'tail'])
  })

  it('leaves the budget alone, on the shell the alpaca did not take', () => {
    // `box-41` is 262 triangles against the cube's 60, so the lean shell is the
    // separation AND the saving — where the goose paid 202 for the opposite one.
    expect(partById('box-03')!.tris).toBe(60)
    expect(partById('box-41')!.tris).toBe(262)
    expect(LLAMA_ASSEMBLY.hull.part).toBe('box-03')
    const g = build()
    let tris = 0
    for (const c of g.children) {
      const m = c as THREE.Mesh
      if (m.geometry) tris += m.geometry.getIndex()!.count / 3
    }
    expect(tris).toBe(626)
    expect(MODEL_TRIS_MAX - tris).toBe(325)
    // It twitches its ears and nothing else — a llama stands and looks at you.
    expect(LLAMA_ASSEMBLY.motion).toHaveLength(1)
    expect(LLAMA_ASSEMBLY.motion![0]!.kind).toBe('twitch')
    expect(LLAMA_ASSEMBLY.motion![0]!.parts).toEqual(['ear'])
  })
})
