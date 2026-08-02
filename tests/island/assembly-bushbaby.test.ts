/**
 * The bushbaby. Night Time's second of three big-eyed nocturnal primates.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a bushbaby can say, and for this
 * animal that is the EAR: the one shape in the bank that is a tall thin flap on
 * the side of a head, and the one number in the file that was overridden.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, BUSHBABY_ASSEMBLY, TARSIER_ASSEMBLY, EYE_CARD_Z,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-bushbaby',
  parts: ['box-01', 'box-33', 'box-38', 'plate-08', 'tube-01', 'tube-04', 'tube-08'],
  height: 1.5559,
  verts: 468,
  tris: 560,
  // The parrot's fan is the biggest thing after the hull and it is a fifth of it.
  massRatio: 5,
  // Nothing here is turned. Said out loud, because rule 4's "no node carries a
  // rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-bushbaby')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-bushbaby: the ear, which is the whole animal', () => {
  it('is the bank\'s one TALL THIN flap, and it hangs off the head\'s SIDE', () => {
    const flap = partById('tube-04')!
    expect(BUSHBABY_ASSEMBLY.features.find(f => f.name === 'ear')!.part).toBe('tube-04')
    // 0.359219 x 0.618750: 1.72 times as tall as it is wide.
    expect(flap.size[1]! / flap.size[0]!).toBeCloseTo(1.7225, 3)
    // The pack drew exactly three side-mounted ear records — the koala's dish
    // and this handed pair — and of the two SHAPES among them this is the thin
    // one. Nothing else in the ear bank mounts anywhere but the top or the front.
    const side = PARTS_BANK.filter(p => p.roles.includes('ear') && p.attachment?.axis === 'x')
    expect(side.map(p => p.id).sort()).toEqual(['box-25', 'tube-04', 'tube-05'])
    expect(partById('box-25')!.size[1]! / partById('box-25')!.size[0]!).toBeCloseTo(1, 3)
    // Unspent before this: the elephant is its only donor and no assembled
    // species had taken it.
    expect(flap.provenance.map(p => p.species)).toEqual(['elephant'])
  })

  it('recovers the elephant\'s own centre, and THEN overrides the burial to §3\'s floor', () => {
    const flap = partById('tube-04')!
    const ear = BUSHBABY_ASSEMBLY.features.find(f => f.name === 'ear')!
    if (ear.placement.kind === 'pair') {
      // Joined at THIS hull's side face; y and z untouched by the join, so they
      // are the bank's own recorded offset.
      expect(ear.placement.at[0]).toBeCloseTo(0.625, 9)
      expect(ear.placement.at[1]).toBeCloseTo(flap.offset[1]!, 9)
      expect(ear.placement.at[2]).toBeCloseTo(flap.offset[2]!, 9)
    }
    // THE TRANSFER IS CHECKED BEFORE IT IS OVERRIDDEN. At the elephant's own
    // 0.126087 the centre lands on the recorded x = 0.759317 — the number the
    // solve never uses, which is §8's evidence that the transfer is legitimate.
    const donor = 0.625 + flap.size[0]! / 2 - flap.attachment!.sunkFractionMean * flap.size[0]!
    expect(donor).toBeCloseTo(flap.offset[0]!, 5)
    // And that burial is only 0.045 units: the shallowest of any ear the pack
    // actually buries, and the measured counter-example to §3's "every eared
    // species embeds its ear by at least 0.125".
    expect(flap.attachment!.sunkFractionMean * flap.size[0]!).toBeCloseTo(0.045, 3)
    const buried = PARTS_BANK.filter(p => p.roles.includes('ear') && p.attachment!.sunkUnitsMean > 0)
    expect(Math.min(...buried.map(p => p.attachment!.sunkUnitsMean)))
      .toBeCloseTo(flap.attachment!.sunkUnitsMean, 9)
    // So the one overridden number in the file puts it at exactly 0.125.
    expect(ear.sink).not.toBe(flap.attachment!.sunkFractionMean)
    expect(ear.sink! * flap.size[0]!).toBeCloseTo(0.125, 6)
    // Measured on the built animal: still embedded, and now by §3's own floor.
    const g = build()
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    const right = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    expect(hull.max.x - right.min.x).toBeCloseTo(0.125, 4)
  })

  it('paints the flap\'s own asymmetric inner patch, and mirrors it into tube-05', () => {
    const ear = BUSHBABY_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(ear.paint.byBand).toEqual({ 13: 'inner' })
    expect(ear.stretch).toBeUndefined()
    // Band 13 exists on the shape: Kenney's own cut, re-pointed at our slot
    // rather than approximated (§4's first way).
    expect(new Set(partById('tube-04')!.bands)).toContain(13)
    // Rule 6: one mesh, mirrored. The bank's own left-hand record of this shape
    // is `tube-05`, and the mirror is exactly it — same size, opposite axis dir.
    expect(partById('tube-05')!.size).toEqual(partById('tube-04')!.size)
    expect(partById('tube-05')!.attachment!.dir).toBe(-1)
    expect(BUSHBABY_ASSEMBLY.features.some(f => f.part === 'tube-05')).toBe(false)
  })
})

describe('animal-bushbaby: what separates it from the tarsier and the aye-aye', () => {
  it('shares a hull and a face plane with the tarsier and NOTHING else', () => {
    const mine = new Map(BUSHBABY_ASSEMBLY.features.map(f => [f.name, f.part]))
    const theirs = new Map(TARSIER_ASSEMBLY.features.map(f => [f.name, f.part]))
    // The one mass is deliberately shared — the pack drew one primate body and
    // all three of these wear it. Everything that makes a silhouette differs.
    expect(BUSHBABY_ASSEMBLY.hull.part).toBe(TARSIER_ASSEMBLY.hull.part)
    for (const role of ['ear', 'eye', 'tail']) {
      expect(mine.get(role), `${role} is the tarsier's`).not.toBe(theirs.get(role))
    }
    // And this one has a muzzle where the tarsier has a flat face.
    expect(mine.get('snout')).toBe('tube-01')
    expect(theirs.has('snout')).toBe(false)
    // The aye-aye's dish, `box-25`, is left alone here on purpose: the mouse
    // already wears it and an aye-aye's ears are its headline where a galago's
    // are tall rather than broad.
    expect([...mine.values()]).not.toContain('box-25')
  })

  it('wears the pack\'s ONE perfectly round eye card', () => {
    const card = partById('plate-08')!
    const eye = BUSHBABY_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-08')
    // 0.400 x 0.400 — the only card in the pack whose two axes are equal. Every
    // other one is an oval, including the panda's 0.435 x 0.443 the tarsier took.
    const round = PARTS_BANK.filter(p =>
      p.roles.includes('eye') && Math.abs(p.size[0]! - p.size[1]!) < 1e-6)
    expect(round.map(p => p.id).sort()).toEqual(['plate-08', 'plate-09'])
    // Pure transfer: the card's own recorded place, the absolute plane, no
    // stretch, no sink. Rule 5 is unsayable here.
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at).toEqual([card.offset[0], card.offset[1], EYE_CARD_Z])
    }
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
  })

  it('carries a tail whose volume sits between its two siblings\'', () => {
    const vol = (id: string): number => {
      const s = partById(id)!.size
      return s[0]! * s[1]! * s[2]!
    }
    // The three thick tails are 0.616 (fox brush), 0.368 (beaver paddle) and
    // 0.367 (this). Against the tarsier's rope at 0.116 and the aye-aye's brush
    // at 0.616, a galago's lands three times the one and three fifths of the other.
    expect(vol('box-38')).toBeCloseTo(0.367, 3)
    expect(vol('box-38')).toBeGreaterThan(vol('wedge-07') * 3)
    expect(vol('box-38')).toBeLessThan(vol('box-23') * 0.62)
    // And it chooses nothing: its own facing, its own burial, no spin, no
    // stretch, and the parrot's own recorded height.
    const tail = BUSHBABY_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.sink).toBeCloseTo(partById('box-38')!.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, partById('box-38')!.offset[1], -0.625])
    }
    // It is also the whole of this animal's height — 0.125 above its own back.
    const g = build()
    const box = new THREE.Box3().setFromObject(g)
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    expect(box.max.y).toBeCloseTo(new THREE.Box3().setFromObject(g.getObjectByName('tail')!).max.y, 6)
    expect(box.max.y - hull.max.y).toBeCloseTo(0.125, 3)
  })

  it('strains nothing, so it carries no flag — and nothing on it is stretched', () => {
    expect(BUSHBABY_ASSEMBLY.flag).toBeUndefined()
    for (const f of BUSHBABY_ASSEMBLY.features) expect(f.stretch, f.name).toBeUndefined()
    expect(BUSHBABY_ASSEMBLY.hull.stretch).toBeUndefined()
    // Keep-out is the fan behind and the muzzle in front, and it is under the
    // fox's 1.15, which is the pack's worst and the number the island copes with.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.999, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
