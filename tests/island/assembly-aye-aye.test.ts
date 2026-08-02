/**
 * The aye-aye. Night Time's third of three big-eyed nocturnal primates, and the
 * one that needs a part the pack never drew.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only an aye-aye can say — and the
 * first of it is the absence: **the finger is not here, and the flag says so.**
 * It also carries the three-way separation for the whole trio, because this is
 * the last of them and it is the only file that can see all three at once.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, AYE_AYE_ASSEMBLY, BUSHBABY_ASSEMBLY, TARSIER_ASSEMBLY,
  MOUSE_ASSEMBLY, EYE_CARD_Z,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-aye-aye',
  parts: ['box-01', 'box-10', 'box-23', 'box-25', 'box-33', 'plate-01', 'tube-01', 'wedge-01'],
  height: 1.4312,
  verts: 512,
  tris: 722,
  // The fox's brush is the biggest thing after the hull and it is still under a
  // third of it — which is the closest any of these three primates comes to the
  // generic floor, and it is the tail that does it.
  massRatio: 3,
  // Nothing here is turned. Said out loud, because rule 4's "no node carries a
  // rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-aye-aye')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-aye-aye: the finger, which is not here', () => {
  it('has nothing in the bank that could be one, and the flag names it', () => {
    // Measured, not assumed. This is the claim the flag makes to Joe and it has
    // to be true of the data, not of somebody's memory of it.
    for (const role of ['claw', 'wing', 'horn'] as const) {
      expect(PARTS_BANK.filter(p => p.roles.includes(role)), `${role} exists after all`)
        .toHaveLength(0)
    }
    // Nor is there a finger under another name: the thinnest long shape in the
    // whole bank is the bee's antenna at 0.160 across, roughly three times what a
    // finger wants, and it is already four other things.
    const slender = PARTS_BANK
      .filter(p => p.size[1]! > 0.3 && p.size[0]! > 0)
      .sort((a, b) => a.size[0]! - b.size[0]!)
    expect(slender[0]!.id).toBe('cone-01')
    expect(slender[0]!.size[0]).toBeCloseTo(0.16, 6)
    // §2's escape clause: best honest attempt, flagged where Joe reads it, with
    // the missing part named and its dimensions given.
    expect(AYE_AYE_ASSEMBLY.flag).toMatch(/MIDDLE FINGER/)
    expect(AYE_AYE_ASSEMBLY.flag).toMatch(/cone-01/)
    expect(AYE_AYE_ASSEMBLY.flag).toMatch(/ZERO TIMES/)
    // And nothing was authored to fake it — no `bespoke-*` anywhere on the animal.
    for (const f of AYE_AYE_ASSEMBLY.features) expect(f.part.startsWith('bespoke-')).toBe(false)
  })
})

describe('animal-aye-aye: the two headline shapes, both the biggest of their kind', () => {
  it('wears the biggest ear in the bank, at 59% of its own body width', () => {
    const dish = partById('box-25')!
    const ear = AYE_AYE_ASSEMBLY.features.find(f => f.name === 'ear')!
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(Math.max(...ears.map(p => p.size[0]!))).toBeCloseTo(dish.size[0]!, 9)
    expect(dish.size[0]! / 1.25).toBeCloseTo(0.594, 3)
    // The koala wears it on the 1.250 cube and this hull's faces are that cube's,
    // so joining at x = 0.625 and sinking its own 0.533662 is exact, not inferred.
    if (ear.placement.kind === 'pair') {
      expect(ear.placement.at[0]).toBeCloseTo(0.625, 9)
      expect(ear.placement.at[1]).toBeCloseTo(dish.offset[1]!, 9)
      expect(ear.placement.at[2]).toBeCloseTo(dish.offset[2]!, 9)
    }
    expect(ear.sink).toBeCloseTo(dish.attachment!.sunkFractionMean, 9)
    // Buried 0.396 — more than three times §3's own 0.125 floor.
    expect(ear.sink! * dish.size[0]!).toBeCloseTo(0.396, 3)
  })

  it('wears the bank\'s ONE true plume, and pays 1.132 of keep-out for it', () => {
    const brush = partById('box-23')!
    const vol = (id: string): number => {
      const s = partById(id)!.size
      return s[0]! * s[1]! * s[2]!
    }
    // §7's measurement: round in section, barely tapering, and 1.67 times the
    // volume of any other tail in the pack.
    expect(brush.size[1]).toBeCloseTo(brush.size[2]!, 6)
    expect(brush.shape!.taper).toBeGreaterThan(0.96)
    const others = PARTS_BANK.filter(p => p.roles.includes('tail') && p.id !== 'box-23')
    expect(vol('box-23') / Math.max(...others.map(p => p.size[0]! * p.size[1]! * p.size[2]!)))
      .toBeGreaterThan(1.67)
    // Pure donor transfer: the fox's own height and burial, no spin, no stretch —
    // and deliberately NOT the squirrel's chamfer, which carries it up the back.
    const tail = AYE_AYE_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.sink).toBeCloseTo(brush.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, brush.offset[1], -0.625])
    }
    // The price, stated: `pets.ts:652` charges keep-out from max(w, d) / 2, and a
    // 0.910 plume behind a muzzle is the most expensive thing on this animal. It
    // is still inside the fox's own 1.15, which is the pack's worst.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.132, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('puts the beaver\'s own front pair UNDER the muzzle, as incisors and not fangs', () => {
    const pair = partById('wedge-01')!
    const g = build()
    const tooth = new THREE.Box3().setFromObject(g.getObjectByName('tooth-r')!)
    const snout = new THREE.Box3().setFromObject(g.getObjectByName('snout')!)
    // §3.1: the shape is filed under `nose` and its identity is where it goes.
    // The beaver wears it at y = 0.561 below its own muzzle at y = 0.815.
    expect(pair.roles).toContain('nose')
    expect(tooth.max.y).toBeLessThan(snout.min.y)
    // Blunt lobes 0.200 tall — NOT the bank's 0.445 forward-pointing tusks, which
    // brief §19's "bright, never scary" rules out and which the crocodile refused
    // by name for the same reason.
    expect(pair.size[1]).toBeCloseTo(0.2, 6)
    expect(AYE_AYE_ASSEMBLY.features.some(f => ['wedge-11', 'wedge-13'].includes(f.part)))
      .toBe(false)
    // Rule 6: one mesh mirrored, and the mirror is the bank's own `wedge-02`.
    expect(partById('wedge-02')!.size).toEqual(pair.size)
    expect(AYE_AYE_ASSEMBLY.features.some(f => f.part === 'wedge-02')).toBe(false)
  })
})

describe('animal-aye-aye: what makes it not a mouse, and not its two siblings', () => {
  it('shares the mouse\'s dish ear and separates on all four other counts', () => {
    const mine = new Map(AYE_AYE_ASSEMBLY.features.map(f => [f.name, f]))
    const mouse = new Map(MOUSE_ASSEMBLY.features.map(f => [f.name, f]))
    // The repeat is deliberate and the file says so. `animal-mouse.ts` calls
    // `box-25` "the biggest ears in the bank" and it still is.
    expect(mine.get('ear')!.part).toBe(mouse.get('ear')!.part)
    // 1. The tail: a 0.910 round plume against a 0.200 rope.
    expect(mine.get('tail')!.part).toBe('box-23')
    expect(mouse.get('tail')!.part).toBe('wedge-07')
    // 2. The teeth: the mouse has none.
    expect(mine.has('tooth')).toBe(true)
    expect(mouse.has('tooth')).toBe(false)
    // 3. The ear's colour job: the mouse splits band 1 for a pink inner disc,
    //    this one is flat black leather all the way through.
    expect(mouse.get('ear')!.paint.byBand).toEqual({ 1: 'inner' })
    expect(mine.get('ear')!.paint.byBand).toBeUndefined()
    expect(mine.get('ear')!.paint.base).toBe('limb')
    // 4. The coat: 4/16 against the pack's own 8/16 mammal line.
    expect(AYE_AYE_ASSEMBLY.hull.paint.patch!.at).toBe(0.25)
    expect(MOUSE_ASSEMBLY.hull.paint.patch!.at).toBe(0.5)
  })

  it('THE TRIO: three primates, one hull, and no two sharing an eye, an ear or a tail', () => {
    // The whole readability argument for these three, asserted once, here,
    // because this is the last of them and the only file that can see all three.
    const three = [TARSIER_ASSEMBLY, BUSHBABY_ASSEMBLY, AYE_AYE_ASSEMBLY]
    const partOf = (spec: typeof three[number], role: string): string | undefined =>
      spec.features.find(f => f.name === role)?.part
    // The one mass is shared on purpose: the pack drew one primate body.
    expect(new Set(three.map(s => s.hull.part))).toEqual(new Set(['box-33']))
    // Everything that makes a silhouette is three different shapes.
    for (const role of ['eye', 'ear', 'tail']) {
      const worn = three.map(s => partOf(s, role))
      expect(new Set(worn).size, `two of the three share their ${role}`).toBe(3)
      expect(worn.every(p => p !== undefined)).toBe(true)
    }
    expect(three.map(s => partOf(s, 'eye'))).toEqual(['plate-14', 'plate-08', 'plate-01'])
    expect(three.map(s => partOf(s, 'ear'))).toEqual(['box-02', 'tube-04', 'box-25'])
    expect(three.map(s => partOf(s, 'tail'))).toEqual(['wedge-07', 'box-38', 'box-23'])
    // And the ears step in size right across the bank's range: 0.315, 0.359 wide
    // by 0.619 tall, 0.743. Smallest button, tall thin flap, biggest dish.
    const earWidth = three.map(s => partById(partOf(s, 'ear')!)!.size[0]!)
    expect(earWidth[0]!).toBeLessThan(earWidth[1]!)
    expect(earWidth[1]!).toBeLessThan(earWidth[2]!)
    // Three different faces too: no muzzle, muzzle, muzzle-and-teeth.
    expect(partOf(TARSIER_ASSEMBLY, 'snout')).toBeUndefined()
    expect(partOf(BUSHBABY_ASSEMBLY, 'tooth')).toBeUndefined()
    expect(partOf(AYE_AYE_ASSEMBLY, 'tooth')).toBe('wedge-01')
    // And three different noses, so even head-on nothing repeats.
    const noses = three.map(s => partOf(s, 'nose'))
    expect(new Set(noses).size).toBe(3)
  })

  it('takes the pack\'s default eye card, unstretched, and leaves the big one alone', () => {
    const card = partById('plate-01')!
    const eye = AYE_AYE_ASSEMBLY.features.find(f => f.name === 'eye')!
    // Sixteen of the pack's own species wear this card; the eyes are not this
    // animal's headline and the biggest card went to the tarsier deliberately.
    expect(card.provenance.length).toBeGreaterThan(15)
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at).toEqual([card.offset[0], card.offset[1], EYE_CARD_Z])
    }
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
    // Nothing anywhere on the animal is stretched — Joe rejected a non-uniform
    // part stretch by name on the hedgehog's hull.
    for (const f of AYE_AYE_ASSEMBLY.features) expect(f.stretch, f.name).toBeUndefined()
    expect(AYE_AYE_ASSEMBLY.hull.stretch).toBeUndefined()
  })
})
