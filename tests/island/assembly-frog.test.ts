/**
 * The frog. Garden's first species on the LION's hull.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a frog can say.
 *
 * Which, for this animal, is one measurement above all others: **the face is
 * three layers 0.010 apart, and `blade-05` stacks on exactly one of the pack's
 * ten hulls.** Everything else here — the eyes in the mask's corners, the bulges
 * over them, the eardrums on the cheeks — is a number solved off that stack or
 * off the hull's own measured faces, so each one is checked against the thing it
 * was solved from rather than against itself.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, FROG_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, OTHER_HULLS,
  hullFrontZ,
} from '../../src/island/species/parts'
import { partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-frog',
  parts: ['blade-05', 'box-01', 'box-31', 'box-34', 'plate-01', 'plate-10'],
  // Taller than the bare hull's 1.4312 by exactly what the eye bulges show.
  height: 1.5012,
  verts: 430,
  tris: 550,
  // The mask is the biggest thing after the hull and it is a fourteenth of it.
  massRatio: 14,
  // Nothing on this animal is turned. Said out loud, because rule 4's "no node
  // carries a rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-frog')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())
const feature = (name: string): (typeof FROG_ASSEMBLY.features)[number] =>
  FROG_ASSEMBLY.features.find(f => f.name === name)!
const at = (name: string): readonly number[] => {
  const p = feature(name).placement
  if (p.kind === 'row') throw new Error(`${name} is a row`)
  return p.at
}

/**
 * How far a part's face reaches along another axis before its chamfer starts.
 *
 * Written out rather than imported from `creature.ts`, which is the discipline
 * `parts-bank.test.ts` applies to its glTF reader: a shared implementation lets
 * a bug agree with itself. This is the measurement §8 step 1 says costs a whole
 * row when it is assumed — and on `box-31` it is the reason a 1.000-square plate
 * fits a hull whose sides are only 0.625 square.
 */
function flat(p: BakedPart, face: 0 | 1 | 2, along: 0 | 1 | 2): number {
  const pts: number[][] = []
  for (const vi of new Set(p.indices)) {
    pts.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  const h = Math.max(...pts.map(q => Math.abs(q[face]!)))
  let out = 0
  for (const q of pts) {
    if (Math.abs(Math.abs(q[face]!) - h) > 1e-6) continue
    if (Math.abs(q[along]!) > out) out = Math.abs(q[along]!)
  }
  return out
}

describe('animal-frog: the face is three layers 0.010 apart', () => {
  it('stacks hull 0.500 -> mask 0.625 -> eye card 0.6350, and the card survives', () => {
    const g = build()
    // 1. The hull's front face. `box-31` is the one hull under the usual 0.625.
    expect(hullFrontZ('box-31')).toBe(0.5)
    expect(boxOf(g, 'hull').max.z).toBeCloseTo(0.5, 6)
    // 2. The mask, joined there and 0.125 thick, presents its raised centre at
    //    0.625 — which is where an ORDINARY hull's front face already is.
    expect(partById('blade-05')!.size[2]).toBe(0.125)
    expect(boxOf(g, 'mouth').max.z).toBeCloseTo(0.625, 6)
    expect(boxOf(g, 'mouth').max.z).toBeCloseTo(HULL_FRONT_Z_USUAL, 6)
    // 3. And the eye card is still in front of it, by the same 0.010 of daylight
    //    the pack gives a card over a 0.625 face.
    expect(world(g, 'eye-r').z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(EYE_CARD_Z - boxOf(g, 'mouth').max.z).toBeCloseTo(0.01, 6)
  })

  it('would be SWALLOWED on any of the seven usual hulls, and that is measured', () => {
    // The same plate joined at a 0.625 front face puts its centre panel at 0.750,
    // which is 0.115 IN FRONT of an eye card that cannot move (rule 5). The
    // choice of `box-31` is therefore forced by the extra, not by taste.
    const swallowed = HULL_FRONT_Z_USUAL + partById('blade-05')!.size[2]!
    expect(swallowed).toBeCloseTo(0.75, 6)
    expect(swallowed - EYE_CARD_Z).toBeCloseTo(0.115, 6)
    expect(EYE_CARD_Z).toBeLessThan(swallowed)
    // And `box-31` is the shallow hull by name, not by a number typed here.
    expect(OTHER_HULLS.shallower).toBe('box-31')
    expect(FROG_ASSEMBLY.hull.part).toBe('box-31')
    expect(FROG_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('is the lion\'s own plate on the lion\'s own hull, so the transfer is exact', () => {
    const plate = partById('blade-05')!, hull = partById('box-31')!
    expect([...new Set(plate.provenance.map(p => p.species))]).toEqual(['lion'])
    expect([...new Set(hull.provenance.map(p => p.species))]).toEqual(['lion'])
    // Joined at this hull's front face, sunk its own measured 0.000 — and its
    // centre lands on the bank's recorded offset for the shape, to the digit.
    expect(at('mouth')).toEqual([0, plate.offset[1], 0.5])
    expect(feature('mouth').sink).toBe(0)
    expect(world(build(), 'mouth').z).toBeCloseTo(plate.offset[2]!, 6)
    // 1.000 square, which is exactly this hull's flat front face — `box-03`'s is
    // only 0.625 square, so the plate would hang off the chamfer of the cube.
    expect(plate.size[0]).toBe(1)
    expect(plate.size[1]).toBe(1)
    expect(flat(hull, 2, 0) * 2).toBeCloseTo(1, 6)
    expect(flat(hull, 2, 1) * 2).toBeCloseTo(1, 6)
    expect(flat(partById('box-03')!, 2, 0) * 2).toBeCloseTo(0.625, 6)
  })

  it('takes the wide mouth from Kenney\'s own band 5 and adds no geometry for it', () => {
    const plate = partById('blade-05')!
    expect(feature('mouth').paint).toEqual({ base: 'coat', byBand: { 5: 'mark' } })
    // Band 5 exists on the shape, and it is the plate's BOTTOM strip: the four
    // triangles whose corners all sit at or below -0.3125 of a 1.000 face. This
    // is why one `byBand` entry is a mouth line and not a stripe somewhere else.
    const banded = [...plate.bands.keys()].filter(t => plate.bands[t] === 5)
    expect(banded).toHaveLength(4)
    for (const t of banded) {
      for (let k = 0; k < 3; k++) {
        const vi = plate.indices[t * 3 + k]!
        expect(plate.positions[vi * 3 + 1]!).toBeLessThanOrEqual(-0.3125)
      }
    }
    // And it lands low on the face: a frog's mouth is a wide line under a tall
    // gap, not a muzzle. Its own strip is the bottom 0.1875 of the plate.
    // Four decimals, not six: positions come back off a `Float32BufferAttribute`
    // and 0.30625 returns as 0.3062205. Same float32 dust `assembly-assert.ts`
    // snaps for, and it is on every measurement taken off a built mesh below.
    expect(boxOf(build(), 'mouth').min.y).toBeCloseTo(0.30625, 4)
  })
})

describe('animal-frog: the eyes are as high and as wide as the mask allows', () => {
  it('solves both numbers off the mask rather than choosing them', () => {
    const card = partById('plate-01')!
    // x: the mask is 1.000 square about the hull's midline, so the widest a
    // 0.400 card can sit and stay on it is 0.500 - 0.200.
    expect(at('eye')[0]).toBeCloseTo(0.5 - card.size[0]! / 2, 9)
    // y: the mask's top edge is 1.30625, so the highest a 0.320208 card can sit
    // is that minus its own half-height.
    const maskTop = partById('box-31')!.offset[1]! + 0.5
    expect(maskTop).toBeCloseTo(1.30625, 9)
    expect(at('eye')[1]).toBeCloseTo(maskTop - card.size[1]! / 2, 5)
    // z is not a choice at all and never was — rule 5, made unsayable.
    expect(at('eye')[2]).toBe(EYE_CARD_Z)
    expect(feature('eye').sink).toBe(0)
    expect(feature('eye').stretch).toBeUndefined()
    // And it is NOT the pack's default eye, which is what a frog's face is not.
    expect(at('eye')[0]).not.toBeCloseTo(card.offset[0]!, 3)
    expect(at('eye')[1]).not.toBeCloseTo(card.offset[1]!, 3)
  })

  it('lands the two cards exactly in the mask\'s upper corners', () => {
    const g = build()
    const mask = boxOf(g, 'mouth'), eye = boxOf(g, 'eye-r')
    // Touching on the outside and on the top, inside everywhere else: the eye is
    // as far into the corner as it goes without leaving the face.
    expect(eye.max.x).toBeCloseTo(mask.max.x, 4)
    expect(eye.max.y).toBeCloseTo(mask.max.y, 4)
    expect(eye.min.x).toBeGreaterThan(mask.min.x)
    expect(eye.min.y).toBeGreaterThan(mask.min.y)
    // Nowhere near the mouth line: the gap between eye and lip is over half the
    // face, which is the proportion that reads as a frog and not as a mammal.
    expect(eye.min.y - 0.49375).toBeGreaterThan(0.4)
  })
})

describe('animal-frog: a frog\'s eyes sit on top of its head', () => {
  it('wears the pack\'s ROUNDER stub, and wears it as an eye and not as an ear', () => {
    const panda = partById('box-34')!, polar = partById('box-02')!
    // The same box to the digit, tessellated 116 ways against 92. For a bulge
    // that is the whole difference, so the dearer one is the right one.
    expect(panda.size).toEqual(polar.size)
    expect(panda.tris).toBeGreaterThan(polar.tris)
    // §3.1: a part's identity is its placement, not Kenney's label. This one is
    // over the EYE — the eye card's own x — and not out at the panda's own ear
    // station, and that is the difference between a bulge and an ear.
    expect(at('bulge')[0]).toBe(at('eye')[0])
    expect(at('bulge')[0]).not.toBeCloseTo(panda.offset[0]!, 2)
    // Nothing on this animal is called an ear or a tail. A frog has neither.
    expect(FROG_ASSEMBLY.features.map(f => f.name)).not.toContain('ear')
    expect(FROG_ASSEMBLY.features.map(f => f.name)).not.toContain('tail')
  })

  it('joins at this hull\'s top face and recovers the panda\'s own centre', () => {
    const panda = partById('box-34')!, hull = partById('box-31')!
    // y: the hull's top, which `box-31` shares with the cube the panda wears it
    // on — so the recovery below is exact rather than an inference.
    expect(at('bulge')[1]).toBeCloseTo(hull.offset[1]! + hull.size[1]! / 2, 9)
    expect(at('bulge')[1]).toBe(1.43125)
    expect(world(build(), 'bulge-r').y).toBeCloseTo(panda.offset[1]!, 4)
    // z: this hull's flat top face's own front edge, as far forward as a part
    // can join and still be on flat geometry.
    expect(at('bulge')[2]).toBeCloseTo(hull.offset[2]! + flat(hull, 1, 2), 9)
    // Sunk its own measured burial, which the pack gave as one value.
    expect(feature('bulge').sink).toBeCloseTo(panda.attachment!.sunkFractionMean, 9)
    expect(panda.attachment!.sunkFractionMin).toBe(panda.attachment!.sunkFractionMax)
    // §3, nothing floats: 0.778 of 0.315 is 0.245, nearly twice the pack's own
    // 0.125 floor, and it leaves 0.070 of the stub showing above the head.
    const buried = feature('bulge').sink! * panda.size[1]!
    expect(buried).toBeCloseTo(0.245, 4)
    expect(buried).toBeGreaterThan(0.125)
  })

  it('is what makes the animal taller than its own hull', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    // The hull alone is 1.43125 — the pack's FLOOR, and where a frog would sit
    // if nothing stood above its back. The two bulges add 0.070 each.
    expect(boxOf(g, 'hull').max.y).toBeCloseTo(1.43125, 4)
    expect(boxOf(g, 'bulge-r').max.y).toBeCloseTo(whole.max.y, 6)
    expect(whole.max.y - 1.43125).toBeCloseTo(0.07, 4)
  })
})

describe('animal-frog: the eardrum is a flank patch on a cheek', () => {
  it('is a marking CARD, so rule 5 never reaches it', () => {
    const card = partById('plate-10')!
    expect(card.roles).toEqual(['card'])
    expect(card.roles).not.toContain('eye')
    // The pack drew it as a flat marking and wore it on a flank. §3.1: where it
    // goes is what it is, and a flat disc behind a frog's eye is its tympanum.
    expect([...new Set(card.provenance.map(p => p.role))]).toEqual(['card'])
    expect(feature('eardrum').paint).toEqual({ base: 'mark' })
  })

  it('floats the card 0.010 proud of the side face, as the pack floats every card', () => {
    const card = partById('plate-10')!, hull = partById('box-31')!
    const g = build()
    // Its own recorded x, which is 0.010 outside the 0.625 side face — the same
    // daylight `EYE_CARD_Z` gives over a front face, and the reason a flat card
    // laid ON a flat face does not z-fight here.
    expect(at('eardrum')[0]).toBe(card.offset[0]!)
    expect(at('eardrum')[0]! - hull.size[0]! / 2).toBeCloseTo(0.01, 9)
    expect(boxOf(g, 'hull').max.x).toBeCloseTo(0.625, 6)
    expect(world(g, 'eardrum-r').x).toBeCloseTo(0.635, 6)
  })

  it('sits at the top of the flat side face and at the FRONT of it, under the eye', () => {
    const card = partById('plate-10')!, hull = partById('box-31')!
    const g = build()
    // y: the card's own recorded height, which is also the highest a 0.244-tall
    // card can sit and stay on this hull's flat side face.
    const sideTop = hull.offset[1]! + flat(hull, 0, 1)
    expect(at('eardrum')[1]).toBe(card.offset[1]!)
    expect(at('eardrum')[1]).toBeCloseTo(sideTop - card.size[1]! / 2, 6)
    expect(boxOf(g, 'eardrum-r').max.y).toBeCloseTo(sideTop, 4)
    // z: the same distance from the flat face's edge the donors used, taken at
    // the FRONT edge instead of the rear one — the donor's own number, mirrored.
    const sideFront = hull.offset[2]! + flat(hull, 0, 2)
    expect(at('eardrum')[2]).toBeCloseTo(sideFront - card.size[2]! / 2, 5)
    expect(at('eardrum')[2]).toBeCloseTo(-card.offset[2]!, 5)
    // Behind the eye and lower than it, which is where a tympanum is: the whole
    // disc is behind the eye plane, and both its centre and its lower edge sit
    // below the eye's — they overlap in height, as they do on a real frog.
    expect(boxOf(g, 'eardrum-r').max.z).toBeLessThan(EYE_CARD_Z)
    expect(world(g, 'eardrum-r').y).toBeLessThan(world(g, 'eye-r').y)
    expect(boxOf(g, 'eardrum-r').min.y).toBeLessThan(boxOf(g, 'eye-r').min.y)
  })
})

describe('animal-frog: what separates it from the toad', () => {
  it('carries no ears and no tail, so it carries the separation elsewhere', () => {
    // `garden.ts` names this pair as the confusable one and neither animal may
    // have an ear or a tail. The four things that do the work instead:
    //   1. the mask's mouth line, 2. the eyes and their bulges,
    //   3. the shallow hull, 4. the palette.
    expect(FROG_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['bulge', 'eardrum', 'eye', 'leg', 'mouth'])
    // The hull is 1.125 deep against the cube's 1.250 — a tenth shallower, on
    // the axis a child sees from the side.
    expect(partById('box-31')!.size[2]).toBe(1.125)
    expect(partById('box-03')!.size[2]).toBe(1.25)
    // And the palette is `garden.ts`'s own signed-off four for this species.
    expect(FROG_ASSEMBLY.palette['coat']).toBe(0x5fae33)
    expect(FROG_ASSEMBLY.palette['belly']).toBe(0xf0f2cf)
    expect(FROG_ASSEMBLY.palette['limb']).toBe(0x3f7c1f)
    expect(FROG_ASSEMBLY.palette['mark']).toBe(0x2c5b16)
  })

  it('stands as wide as the flat underside allows, which is the crouch', () => {
    const hull = partById('box-31')!
    const leg = feature('leg')
    // `garden.ts` separates frog from toad on leg power above all else (1.15
    // against 0.40) and this kit cannot lengthen a leg without straining rule 1,
    // so the difference is spent on stance: the widest station whose join is
    // still on the hull's flat bottom face.
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from[0]).toBeCloseTo(flat(hull, 1, 0), 9)
      expect(leg.placement.from[0]).toBe(0.3125)
      // Wider than the 0.27 the builder derives for a 1.250-wide hull.
      expect(leg.placement.from[0]).toBeGreaterThan(0.27)
    }
  })

  it('paints its belly at the pack\'s own line and adds no geometry for it', () => {
    expect(FROG_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    // Same welded points as an unpatched hull; only the seam splits.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-31')!.tris)
  })

  it('fits between two trees, and strains nothing', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. Nothing here
    // reaches sideways except two 0.010-proud cards, so the frog is the cheapest
    // Garden animal to walk past — the fox's own is 1.15.
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.635, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(FROG_ASSEMBLY.flag).toBeUndefined()
  })
})
