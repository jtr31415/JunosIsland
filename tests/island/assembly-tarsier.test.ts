/**
 * The tarsier. Night Time's first of three big-eyed nocturnal primates.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a tarsier can say, and for this
 * animal that is mostly one thing: **it is the eye card, and the eye card has
 * run out.**
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, TARSIER_ASSEMBLY, EYE_CARD_Z } from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-tarsier',
  parts: ['box-01', 'box-02', 'box-09', 'box-33', 'plate-14', 'wedge-07'],
  height: 1.5012,
  verts: 572,
  tris: 823,
  // The rope tail is the biggest thing after the hull and it is a seventeenth of
  // it: nothing on this animal is anywhere near body-sized.
  massRatio: 10,
  // Nothing here is turned. Said out loud, because rule 4's "no node carries a
  // rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-tarsier')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-tarsier: the eye card, which is the whole animal', () => {
  it('wears the BIGGEST card in the pack, and there is nothing above it', () => {
    const card = partById('plate-14')!
    const eye = TARSIER_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-14')
    // Measured over every eye shape the pack drew: this is the top of the range,
    // which is what makes the flag a statement of fact rather than a complaint.
    const cards = PARTS_BANK.filter(p => p.roles.includes('eye'))
    expect(Math.max(...cards.map(p => p.size[0]!))).toBeCloseTo(card.size[0]!, 9)
    expect(Math.max(...cards.map(p => p.size[1]!))).toBeCloseTo(card.size[1]!, 9)
    expect(card.size[0]).toBeCloseTo(0.435472, 6)
    // And it is still only 34.8% of the hull it is worn on.
    expect(card.size[0]! / 1.25).toBeCloseTo(0.348, 3)
  })

  it('is the one card in the pack whose DARK band is the OUTER one', () => {
    // Every other card is a small band-15 pupil inside a large band-3 sclera.
    // The panda's is the reverse — its band 15 spans the whole card and band 3 is
    // a smaller region inside it — which is a black eye patch with the eye in it,
    // and painted here it is a huge dark eye with a warm centre. Chosen for size;
    // the inversion came free, and it is why this is a NIGHT animal's eye.
    const width = (id: string, band: number): number => {
      const p = partById(id)!
      let lo = Infinity, hi = -Infinity
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) {
          const x = p.positions[p.indices[t * 3 + k]! * 3]!
          lo = Math.min(lo, x); hi = Math.max(hi, x)
        }
      }
      return hi - lo
    }
    expect(width('plate-14', 15)).toBeGreaterThan(width('plate-14', 3))
    for (const other of ['plate-01', 'plate-06', 'plate-08']) {
      expect(width(other, 15), `${other} is not the usual way round`)
        .toBeLessThan(width(other, 3))
    }
  })

  it('sets the pair CLOSE, not wide — 0.25 is where two of these cards meet', () => {
    const card = partById('plate-14')!
    const eye = TARSIER_ASSEMBLY.features.find(f => f.name === 'eye')!
    if (eye.placement.kind === 'pair') {
      // NARROWER than the pack's own: the panda wears this card at 0.258676 and
      // the default oval sits at 0.2625. Moving eyes outward only opens the gap
      // in the middle, and a tarsier's orbits meet at a paper-thin septum.
      expect(eye.placement.at[0]).toBe(0.25)
      expect(eye.placement.at[0]).toBeLessThan(card.offset[0]!)
      // 4/16, the first station on the pack's own grid outside the point where
      // two of these cards touch.
      expect(0.25 * 16).toBe(4)
      expect(card.size[0]! / 2).toBeLessThan(0.25)
      // Lifted to 16/16 — the one chosen number in the file — for a low forehead.
      expect(eye.placement.at[1]).toBe(1)
      expect(eye.placement.at[1]).toBeGreaterThan(card.offset[1]!)
      expect(eye.placement.at[2]).toBe(EYE_CARD_Z)
    }
    // The pair spans 0.935 of a 1.250 face with 0.065 of daylight between them.
    const g = build()
    const r = new THREE.Box3().setFromObject(g.getObjectByName('eye-r')!)
    const l = new THREE.Box3().setFromObject(g.getObjectByName('eye-l')!)
    expect(r.max.x - l.min.x).toBeCloseTo(0.935, 3)
    expect(r.min.x - l.max.x).toBeCloseTo(0.065, 3)
    expect(eye.stretch, 'an eye card is never stretched — rule 5').toBeUndefined()
  })
})

describe('animal-tarsier: what separates it from the bushbaby and the aye-aye', () => {
  it('has the SMALLEST ear of the three, and it is the pack\'s own button', () => {
    const mine = partById('box-02')!
    // The three shapes the three primates wear. This one is a third the width of
    // either sibling's, which is the largest ear difference the bank can express
    // between animals that otherwise share a body and a face.
    const bushbaby = partById('tube-04')!  // the elephant's tall side flap
    const ayeAye = partById('box-25')!     // the koala's round dish
    expect(mine.size[0]).toBeCloseTo(0.315, 3)
    expect(mine.size[1]!).toBeLessThan(bushbaby.size[1]!)
    expect(mine.size[0]!).toBeLessThan(ayeAye.size[0]! / 2)
    // Top-mounted, where both siblings' ears mount on the head's SIDE.
    expect(mine.attachment!.axis).toBe('y')
    expect(bushbaby.attachment!.axis).toBe('x')
    expect(ayeAye.attachment!.axis).toBe('x')
  })

  it('has NO SNOUT, which neither sibling can say', () => {
    // One absent line, and after the eyes the largest thing about the animal: a
    // tarsier's face is flat, with the eyes set straight into it. Both siblings
    // wear `tube-01`, so this is the third axis of separation and it costs
    // nothing. The nose therefore joins the HULL's own front face.
    expect(TARSIER_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
    const nose = TARSIER_ASSEMBLY.features.find(f => f.name === 'nose')!
    if (nose.placement.kind === 'single') expect(nose.placement.at[2]).toBe(0.625)
    // And it is the shallowest of the pack's small nose BUTTONS — 0.0798 deep,
    // where the rest run 0.108 to 0.164 — which is what a muzzle-less face wants.
    // It is also 0.09 shallower than the `tube-01` muzzle both siblings wear,
    // before that muzzle's own reach is counted at all.
    const buttons = PARTS_BANK.filter(p =>
      p.roles.includes('nose') && p.size[0]! < 0.25 && p.size[2]! > 0)
    expect(buttons.length).toBeGreaterThan(3)
    expect(Math.min(...buttons.map(p => p.size[2]!))).toBeCloseTo(partById('box-09')!.size[2]!, 9)
    expect(partById('box-09')!.size[2]!).toBeLessThan(partById('tube-01')!.size[2]!)
  })
})

describe('animal-tarsier: the numbers that were recovered rather than chosen', () => {
  it('recovers the beaver\'s own ear height off this hull\'s top face', () => {
    const button = partById('box-02')!
    const ear = TARSIER_ASSEMBLY.features.find(f => f.name === 'ear')!
    // Joined at y = 1.43125 and sunk the shape's own 0.777778, the centre lands on
    // the bank's recorded offset — a number the solve never used, which is what
    // makes the transfer evidence rather than a copy (§8).
    expect(ear.sink).toBeCloseTo(button.attachment!.sunkFractionMean, 9)
    const g = build()
    expect(g.getObjectByName('ear-r')!.getWorldPosition(new THREE.Vector3()).y)
      .toBeCloseTo(button.offset[1]!, 4)
    // Buried 0.245 of a 0.315 button — twice §3's own 0.125 floor.
    expect(button.attachment!.sunkFractionMean * button.size[1]!).toBeCloseTo(0.245, 3)
  })

  it('puts the tail\'s tip exactly on the line of its own back', () => {
    const whip = partById('wedge-07')!
    const g = build()
    const tail = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    // 1.43125 - 1.046587/2, the hull's top face less the tail's own half height.
    // The cat and the monkey both carry this shape UP, at the recorded 1.186701,
    // and at that height the animal is a monkey with big eyes.
    expect(tail.max.y).toBeCloseTo(hull.max.y, 3)
    expect(whip.offset[1]).toBeCloseTo(1.186701, 6)
    const t = TARSIER_ASSEMBLY.features.find(f => f.name === 'tail')!
    if (t.placement.kind === 'single') expect(t.placement.at[1]).toBeLessThan(whip.offset[1]!)
    // Everything else about it is the pack's own: its measured mean burial, no
    // spin and no stretch.
    expect(t.sink).toBeCloseTo(whip.attachment!.sunkFractionMean, 9)
    expect(t.spin).toBeUndefined()
    expect(t.stretch).toBeUndefined()
  })

  it('wears the MONKEY\'s hull and gets the cube\'s own numbers off it', () => {
    // The pack drew one primate and this is its body. §7 classifies it "cube + 34"
    // and the measurement is what matters here: every face and inset a placement
    // needs off it is the 1.250 cube's, so every transfer above is the cube's.
    const monkey = partById('box-33')!
    expect(monkey.provenance.map(p => p.species)).toEqual(['monkey'])
    expect(monkey.size).toEqual(partById('box-03')!.size)
    expect(monkey.offset).toEqual(partById('box-03')!.offset)
    expect(TARSIER_ASSEMBLY.hull.part).toBe('box-33')
    expect(TARSIER_ASSEMBLY.hull.stretch).toBeUndefined()
    // And nothing anywhere on the animal is stretched — Joe rejected a
    // non-uniform part stretch by name on the hedgehog's hull.
    for (const f of TARSIER_ASSEMBLY.features) expect(f.stretch, f.name).toBeUndefined()
  })

  it('says in its flag that the eyes ran out, and strains nothing else', () => {
    expect(TARSIER_ASSEMBLY.flag).toMatch(/rule 5/i)
    expect(TARSIER_ASSEMBLY.flag).toMatch(/plate-14/)
    // Keep-out: the rope tail and nothing else, and well under the fox's 1.15.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.898, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
