/**
 * The mole. Garden's low animal, on a pack that has no low animals in it.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a mole can say.
 *
 * Which is three things, in the order they separate the animal: **it has no ears
 * and that is anatomy rather than an omission**; **its tail is the elephant's
 * trunk turned round, at the one height it fits**; and **its front legs are
 * painted differently from its back ones**, which no other species here can say
 * because the pack's leg row is one feature and this one is two.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, MOLE_ASSEMBLY, HULL_FRONT_Z_USUAL, LEG_ROW, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-mole',
  parts: ['box-01', 'box-03', 'box-18', 'box-24', 'cone-06', 'plate-01', 'wedge-01'],
  height: 1.4312,
  verts: 437,
  tris: 598,
  // Nothing this animal wears is a tenth of its body: the stub tail is the
  // biggest of them and the hull is twenty times it. A mole IS its hull.
  massRatio: 20,
  // One: the trunk, turned 180 degrees to be a tail.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-mole')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof MOLE_ASSEMBLY.features[number] =>
  MOLE_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-mole: no ears, and that is the loudest thing about it', () => {
  it('wears nothing from the bank\'s ear family, on purpose', () => {
    // A mole has no pinna. The bank has ears — this is a choice the species
    // made, not a shape it could not find, and the second half of that sentence
    // is what this line checks.
    expect(PARTS_BANK.some(p => p.roles.includes('ear'))).toBe(true)
    for (const f of MOLE_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `"${f.name}" wears an ear`).not.toContain('ear')
    }
  })

  it('keeps the eye cards even though the animal is nearly blind', () => {
    // Rule 5 makes the eye absolute and structural, and all 24 originals carry
    // one. A mole's eyes are pinhead-sized and under fur; the honest expression
    // of that is a dark sclera on a dark face, not a missing card.
    const eye = feature('eye')
    expect(eye.part).toBe('plate-01')
    expect(eye.paint.base).toBe('belly')
    expect(MOLE_ASSEMBLY.palette['belly']).toBe(0x6b6b78)
  })
})

describe('animal-mole: the tail is the elephant\'s TRUNK, and Kenney\'s name is wrong', () => {
  it('is the bank\'s only tail that points forwards, which is what gives it away', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBeGreaterThan(1)
    // Six of the seven are `z -1` — they hang off a rump. `box-18` is `z +1`: it
    // hangs off a FACE, because it is the elephant's trunk under a node name the
    // bank inherited. §3.1: a part's identity is its placement, not the label.
    const trunk = partById('box-18')!
    expect(trunk.attachment!.dir).toBe(1)
    expect(tails.filter(p => p.attachment!.dir === 1).map(p => p.id)).toEqual(['box-18'])
    expect(trunk.provenance.map(q => q.species)).toEqual(['elephant'])
    // And it is the shortest reach in the family by a fifth — which is why it is
    // the only stub tail the bank has.
    const reach = (id: string): number => partById(id)!.size[2]!
    expect(Math.min(...tails.map(p => reach(p.id)))).toBeCloseTo(reach('box-18'), 6)
    expect(reach('box-18')).toBeLessThan(0.8 * Math.min(
      ...tails.filter(p => p.id !== 'box-18').map(p => reach(p.id))))
  })

  it('turns it 180 degrees, and the turn is baked rather than placed', () => {
    const tail = feature('tail')
    expect(tail.spin).toEqual([{ axis: 'y', deg: 180 }])
    const mesh = build().getObjectByName('tail')!
    // Rule 4 as amended: the copy's vertices carry the rotation and the node
    // carries none of it.
    expect(mesh.quaternion.toArray()).toEqual([0, 0, 0, 1])
    expect(mesh.scale.toArray()).toEqual([1, 1, 1])
  })

  it('sits at the ONE height a 0.623 stub fits box-03\'s 0.625 flat face', () => {
    const trunk = partById('box-18')!
    // The cube's flat faces are 0.625 square — its 32 welded points are the
    // permutations of +/-0.625, +/-0.3125, +/-0.3125 — and the stub's join face
    // is 0.623004 tall. Two thousandths of window, so the join y is not chosen:
    // it is the hull's own centre or the tail hangs off the rear chamfer.
    expect(trunk.size[1]! + 0.002).toBeGreaterThan(0.625)
    expect(trunk.size[1]!).toBeLessThan(0.625)
    const tail = feature('tail')
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, 0.80625, -HULL_FRONT_Z_USUAL])
    }
    // Which is NOT the donor transfer's answer: the trunk hangs off an
    // elephant's face at y = 0.482248, and on this hull that puts the stub's
    // lower third below y = 0.18125 with no hull behind it at all. §3.
    expect(trunk.offset[1]).toBeCloseTo(0.482248, 6)
    expect(trunk.offset[1]! - trunk.size[1]! / 2).toBeLessThan(0.18125)
    // Every station of the join face is inside the flat face, top and bottom.
    const g = build()
    const t = boxOf(g, 'tail'), hull = boxOf(g, 'hull')
    expect(t.min.y).toBeGreaterThan(hull.min.y + 0.3125)
    expect(t.max.y).toBeLessThan(hull.max.y - 0.3125)
    // Sunk the elephant's own 0.000, so the centre lands on the bank's recorded
    // offset, mirrored — the donor-transfer agreement, in the one axis the join
    // did move.
    // (Four decimals: the shift is solved over a float32 position attribute, so
    // the pack's own six-decimal record is recovered to within its rounding.)
    expect(tail.sink).toBe(0)
    expect(g.getObjectByName('tail')!.position.z).toBeCloseTo(-trunk.offset[2]!, 4)
  })
})

describe('animal-mole: the hands are the animal', () => {
  it('paints the front legs from a different slot than the back, and nothing else differs', () => {
    const front = feature('leg-front'), back = feature('leg-back')
    // Same shape, same burial, same row — the pack's own leg, twice.
    expect([front.part, back.part]).toEqual([LEG_ROW.part, LEG_ROW.part])
    expect([front.sink, back.sink]).toEqual([LEG_ROW.sink, LEG_ROW.sink])
    if (front.placement.kind === 'pair' && back.placement.kind === 'pair') {
      expect(front.placement.at[0]).toBe(back.placement.at[0])
      expect(front.placement.at[1]).toBe(LEG_ROW.y)
      expect(back.placement.at[1]).toBe(LEG_ROW.y)
      expect(front.placement.at[2]).toBe(-back.placement.at[2]!)
    }
    // And the only difference is the texture slot. Colour is a slot, never a
    // material tint — the digging pair is painted from the same one the spades
    // are, so the hand is one colour from wrist to claw.
    expect(back.paint.base).toBe('coat')
    expect(front.paint.base).toBe('paw')
    expect(feature('spade').paint.base).toBe('paw')
    expect(MOLE_ASSEMBLY.palette['paw']).toBe(0xd79a86)
  })

  it('hangs the hog\'s snout disc on the front legs\' own front face, rim on the ground', () => {
    const disc = partById('box-24')!
    // §3.1 again: a neutral 0.4 disc that the pack happened to use as a pig's
    // snout. Nothing about it is a snout except Kenney's node name.
    expect(disc.provenance.map(q => q.role)).toEqual(['nose'])
    expect(disc.size[0]).toBeCloseTo(disc.size[1]!, 6)
    const g = build()
    const spade = boxOf(g, 'spade-r'), leg = boxOf(g, 'leg-front-r')
    // Joined at the front leg's own front plane — its 0.25 station plus box-01's
    // own 0.375 depth, halved — and not near it.
    expect(spade.min.z).toBeCloseTo(leg.max.z, 6)
    expect(leg.max.z).toBeCloseTo(0.25 + partById('box-01')!.size[2]! / 2, 6)
    // And its rim rests on y = 0: the join height is the disc's OWN half-height,
    // which is the only number that puts a digging hand on the earth.
    expect(spade.min.y).toBeCloseTo(0, 6)
    expect(spade.max.y).toBeCloseTo(disc.size[1]!, 6)
  })

  it('stands two of the beaver\'s incisors on each palm as claws', () => {
    const claw = partById('wedge-01')!
    // The bank calls it a nose because the node was called `nose-tip`. It is a
    // handed pair of pointed wedges at x +/-0.073 UNDER the beaver's muzzle,
    // which is a rodent's front teeth — and a claw and a tooth are the same
    // object. The pack drew no other pointed keratin.
    expect(claw.provenance.map(q => q.species)).toEqual(['beaver'])
    expect(claw.shape.taper).toBeLessThan(0.5)
    const g = build()
    const spade = boxOf(g, 'spade-r')
    for (const name of ['claw-inner-r', 'claw-outer-r']) {
      const c = boxOf(g, name)
      // On the disc's own front plane, and inside its silhouette — the claws sit
      // on the palm rather than off the end of it.
      expect(c.min.z).toBeLessThan(spade.max.z)
      expect(c.min.x).toBeGreaterThan(spade.min.x)
      expect(c.max.x).toBeLessThan(spade.max.x)
      expect(c.min.y).toBeGreaterThan(spade.min.y)
      expect(c.max.y).toBeLessThan(spade.max.y)
    }
    // Sunk the beaver's own measured burial, and one 1/16 station either side of
    // the leg row's 0.27 — the pack's authoring grid, not an eyeballed spread.
    expect(feature('claw-inner').sink).toBeCloseTo(claw.attachment!.sunkFractionMean, 9)
    const inner = feature('claw-inner').placement, outer = feature('claw-outer').placement
    if (inner.kind === 'pair' && outer.kind === 'pair') {
      expect(outer.at[0]! - inner.at[0]!).toBeCloseTo(2 / 16, 9)
      expect((outer.at[0]! + inner.at[0]!) / 2).toBeCloseTo(0.27, 9)
      expect(inner.at[2]).toBe(outer.at[2])
    }
  })
})

describe('animal-mole: the face is one cone, and the cone is the whole of it', () => {
  it('takes the pack\'s ONLY pointed muzzle and places it by the donor transfer alone', () => {
    const beak = partById('cone-06')!
    // Every other shape in the nose family is taper 1.000 — a barrel, a button
    // or a disc. This one is taper 0.000: it comes to a point, because it is the
    // parrot's beak. A mole's face is a point.
    const family = PARTS_BANK.filter(p => p.roles.includes('nose') && p.shape.form === 'cone')
    expect(family.map(p => p.id)).toEqual(['cone-06'])
    expect(beak.shape.taper).toBe(0)
    const snout = feature('snout')
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, beak.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBeCloseTo(beak.attachment!.sunkFractionMean, 9)
    // Joined at the cube's front face and sunk the parrot's own 0.360878, its
    // centre lands on the parrot's own recorded z — one part in a million, which
    // is the evidence the transfer is legitimate rather than a copied number.
    expect(build().getObjectByName('snout')!.position.z).toBeCloseTo(beak.offset[2]!, 4)
  })

  it('paints the muzzle pink and hangs no button on its apex', () => {
    expect(feature('snout').paint.base).toBe('snout')
    expect(MOLE_ASSEMBLY.palette['snout']).toBe(0xe8ac96)
    // The mouse's idiom — a `box-09` button on the snout's own front plane — is
    // unavailable here and it is worth saying why: the anchor would be a CONE'S
    // APEX, which has no width, so a 0.182-wide button touches it at a point and
    // floats everywhere else. §3. The cone's own tip is the nose.
    expect(MOLE_ASSEMBLY.features.some(f => f.name === 'nose')).toBe(false)
    expect(partById('box-09')!.size[0]).toBeGreaterThan(0)
  })
})

describe('animal-mole: what a low animal does about a floor it cannot go under', () => {
  it('stands exactly on the pack\'s height floor, because there is nowhere lower', () => {
    const b = new THREE.Box3().setFromObject(build())
    // A bare 1.250 cube on the standard leg row is 1.43125 and the band starts
    // at 1.43. Nothing this mole wears stands above its own back — no ears, a
    // tail inside the hull's own height, a muzzle below the eye line — so it
    // measures the floor exactly. Low is expressed by the hull, and the pack
    // does not have a low one.
    expect(b.max.y - b.min.y).toBeCloseTo(HEIGHT_FLOOR, 5)
  })

  it('is short front-to-back for a thing with a snout and a tail, and says so', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges the obstacle keep-out from max(width, depth)/2, so
    // length is the expensive axis. The stub tail is the cheapest in the bank
    // and it is what keeps this under the mouse's 0.98 and well under the fox's
    // 1.15, which is the pack's worst and the number the island already copes
    // with.
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.929, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('paints no belly line, and strains nothing, so it carries no flag', () => {
    // §4's second way is free and it is declined: a mole is uniform velvet top
    // and bottom, because an animal that lives in the dark has nothing to
    // counter-shade against. The pale slot still earns its place — the sclera
    // above, and the claws.
    expect(MOLE_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(feature('claw-inner').paint.base).toBe('belly')
    expect(MOLE_ASSEMBLY.flag).toBeUndefined()
  })
})
