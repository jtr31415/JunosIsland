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
  buildAssembled, FROG_ASSEMBLY, EYE_CARD_Z,
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

/*
 * TWO DESCRIBE BLOCKS WERE RETIRED HERE ON 4 AUGUST, and `git show` is where
 * they still live if anyone wants them back.
 *
 * They were "the face is three layers 0.010 apart" and "the eyes are as high and
 * as wide as the mask allows" — about twenty assertions, all resting on two
 * things that are no longer true of this animal:
 *
 *   - the hull was `box-31`, the lion's shallow one, chosen because it was the
 *     only hull the face plate could stack on without swallowing the eye card;
 *   - the face was `blade-05`, the lion's plate, with Kenney's own band 5
 *     repainted as the mouth line.
 *
 * On 4 August Joe rebuilt the frog's face in the editor: the hull is `box-03`,
 * the plate is gone, and a `box-04` turned on its side does the mouth instead.
 * That is a design change by the animal's author, so the tests describing the
 * old face are not failures — they are a description of a draft that has been
 * replaced, and re-deriving twenty numbers for the new face would only put the
 * next redesign back in the same place. His ruling of 3 August: *"dont burn
 * tokens on tests that fails stuff that shouldnt be failed."*
 *
 * What still guards this animal: `assertAssembly` at the top of this file (the
 * engine invariants — feet on the ground, one mass, every mesh traced to the
 * bank, eye cards at their absolute size, translation-only placement), the
 * frog/toad separation below, and Joe's own sign-off in `signed-off.json`.
 */

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
    /* `garden.ts` names frog/toad as the confusable pair and neither animal may
     * have an ear or a tail. THAT is the claim, and it is stated as the property
     * rather than as the exact feature list it used to pin — Joe redesigned this
     * animal on 4 August and a list of five names went red for a change that had
     * nothing to do with the separation. */
    const names = FROG_ASSEMBLY.features.map(f => f.name)
    expect(names.some(n => n.startsWith('ear') && n !== 'eardrum'), 'a frog with an ear').toBe(false)
    expect(names.some(n => n.startsWith('tail')), 'a frog with a tail').toBe(false)
    // And the palette is `garden.ts`'s own signed-off four for this species.
    expect(FROG_ASSEMBLY.palette['coat']).toBe(0x5fae33)
    expect(FROG_ASSEMBLY.palette['belly']).toBe(0xf0f2cf)
    expect(FROG_ASSEMBLY.palette['limb']).toBe(0x3f7c1f)
    expect(FROG_ASSEMBLY.palette['mark']).toBe(0x2c5b16)
  })

  it('stands as wide as the flat underside allows, which is the crouch', () => {
    const hull = partById(FROG_ASSEMBLY.hull.part)!
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
    // Same welded points as an unpatched hull; only the seam splits. Read off
    // the hull the species actually wears, so it survives Joe changing it.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById(FROG_ASSEMBLY.hull.part)!.tris)
  })

  it('fits between two trees, and strains nothing', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    /* `pets.ts:652` charges keep-out from max(width, depth) / 2, and THAT is the
     * constraint: the frog has to be cheap to walk past. The exact figure is not
     * pinned any more — it moved from 0.635 to 0.665 when Joe redesigned the
     * face, which is a change to the animal and not a regression. The fox's own
     * 1.15 is the number that actually matters. */
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(FROG_ASSEMBLY.flag).toBeUndefined()
  })
})
