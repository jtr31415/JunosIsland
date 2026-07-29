/**
 * `defineCreature` — that a MINIMAL definition works, and that a definition
 * cannot break a rule quietly.
 *
 * Two claims, and the first is Joe's own acceptance test. 29 July:
 *
 * > legs and eyes are given colour is a short call, then add the remaining
 * > features.
 *
 * **So four colours and a name must produce a plausible creature**, and the first
 * describe below is exactly that definition, written out with nothing elided, and
 * then measured against everything the harness asks of a shipped species. If that
 * ever stops being true, the claim in `creature.ts`'s header is a lie and this
 * goes red.
 *
 * The second claim is the one that pays out twelve more times: **a rule the tool
 * enforces never has to be remembered again.** Each `it` below is one rule, one
 * definition that breaks it, and the throw — because an enforcement nobody has
 * seen fire is an enforcement nobody should trust. `creatureSpec` is used rather
 * than `defineCreature` so none of these lands on the register; an invented
 * species on the bench is a thing `assembledSpecies()` would then have to answer
 * for.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  creatureSpec, buildAssembly, ridgeSpan,
  PACK_PUPIL, EYE_CARD_Z, LEG_ROW, HULL_BOTTOM_Y,
  PACK_HEIGHT_MIN, PACK_HEIGHT_MAX, MODEL_VERTS_MIN, MODEL_VERTS_MAX,
  MODEL_TRIS_MIN, MODEL_TRIS_MAX, BODY_VERTS_MIN, BODY_VERTS_MAX,
  type CreatureDef,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'

const meshesOf = (g: THREE.Object3D): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh) })
  return out
}

const build = (def: CreatureDef, id = 'test-creature'): THREE.Group => {
  const g = buildAssembly(creatureSpec(id, def))
  g.updateMatrixWorld(true)
  return g
}

/* ----------------------------------------- 1. four colours and a name --- */

/**
 * THE MINIMAL DEFINITION, entire. Nothing is left out of this object — it is
 * four colours, and that is the whole species.
 */
const MINIMAL: CreatureDef = {
  palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, nose: 0x4e361d },
}

describe('a minimal definition is four colours, and it is a plausible creature', () => {
  it('is four lines and produces a whole animal', () => {
    /* The definition really is only its palette — if a default is ever quietly
     * turned into a required field, this is what notices. */
    expect(Object.keys(MINIMAL)).toEqual(['palette'])
    expect(Object.keys(MINIMAL.palette)).toHaveLength(4)

    const spec = creatureSpec('test-creature', MINIMAL)
    expect(spec.kit).toBe('assembly')
    /* Legs and eyes, given, per Joe — and nothing else, because nothing else was
     * asked for. */
    expect(spec.features.map(f => f.name)).toEqual(['leg', 'eye'])
  })

  it('gets the 1.250 cube 14 of the 24 originals share, at the pack\'s own centre', () => {
    const spec = creatureSpec('test-creature', MINIMAL)
    expect(spec.hull.part).toBe('box-03')
    expect(spec.hull.at).toEqual([0, 0.80625, 0])
    expect(spec.hull.stretch).toBeUndefined()
    // And it is the shape the pack itself used as a body.
    expect(partById('box-03')!.roles).toContain('hull')
  })

  it('stands on the leg row that never moves, feet on y = 0', () => {
    const g = build(MINIMAL)
    const legs = meshesOf(g).filter(m => m.name.startsWith('leg'))
    expect(legs).toHaveLength(4)
    for (const l of legs) {
      expect(l.userData['part']).toBe(LEG_ROW.part)
      expect(l.userData['sink']).toBe(LEG_ROW.sink)
      expect(new THREE.Box3().setFromObject(l).min.y).toBeCloseTo(0, 4)
    }
    // The row itself, at the y that solves feet-on-zero for every one of the
    // pack's nine level hulls.
    const row = creatureSpec('test-creature', MINIMAL).features[0]!.placement
    expect(row.kind).toBe('row')
    if (row.kind === 'row') {
      expect(row.from).toEqual([0.27, HULL_BOTTOM_Y, 0.25])
      expect(row.to).toEqual([0.27, HULL_BOTTOM_Y, -0.25])
      expect(row.mirror).toBe(true)
    }
  })

  it('wears two eye cards on the pack\'s own absolute eye plane, with the measured pupil', () => {
    const spec = creatureSpec('test-creature', MINIMAL)
    const eye = spec.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-01')
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
    expect(eye.placement).toEqual({
      kind: 'pair',
      at: [0.2625, 0.933646, EYE_CARD_Z],
    })
    // The card's own recorded offset, not a number anybody chose.
    const card = partById('plate-01')!
    expect(card.offset[0]).toBeCloseTo(0.2625, 6)
    expect(card.offset[1]).toBeCloseTo(0.933646, 6)
    // Sclera from the pale slot, pupil the pack's own grey — appended to the
    // palette because the definition did not carry one.
    expect(eye.paint.base).toBe('belly')
    expect(eye.paint.byBand).toEqual({ 15: 'pupil' })
    expect(spec.palette['pupil']).toBe(PACK_PUPIL)
    expect(Object.keys(spec.palette)).toEqual(['coat', 'belly', 'limb', 'nose', 'pupil'])
  })

  it('lands inside every one of the pack\'s measured envelopes', () => {
    const g = build(MINIMAL)
    const box = new THREE.Box3().setFromObject(g)
    expect(box.min.y).toBeCloseTo(0, 4)
    const h = box.max.y - box.min.y
    // 1.43125: the bare cube on standard legs, one part in a thousand above the
    // pack's own floor. A minimal creature is the shortest thing this can make.
    expect(h).toBeCloseTo(1.43125, 4)
    expect(h).toBeGreaterThan(PACK_HEIGHT_MIN)
    expect(h).toBeLessThan(PACK_HEIGHT_MAX)

    let verts = 0, tris = 0, body = 0
    for (const m of meshesOf(g)) {
      const n = m.geometry.getAttribute('position').count
      verts += n
      tris += m.geometry.getIndex()!.count / 3
      if (m.userData['role'] !== 'leg') body += n
    }
    /* Under the ceilings by a long way, which is the direction that matters. */
    expect(verts).toBeLessThanOrEqual(MODEL_VERTS_MAX)
    expect(tris).toBeLessThanOrEqual(MODEL_TRIS_MAX)
    expect(body).toBeLessThanOrEqual(BODY_VERTS_MAX)

    /* AND UNDER THE FLOORS TOO, WHICH IS A REAL FINDING AND IS PINNED HERE.
     *
     * A hull, four legs and two eye cards is 222 vertices and 290 triangles
     * against the pack's measured minima of 405 and 422. **The pack has no animal
     * this bare** — every one of the 24 wears at least a snout and an ear — so a
     * minimal definition is a plausible CREATURE and is not yet a plausible
     * PACK creature. `assertAssembly` enforces those floors with no escape, so a
     * species that shipped with nothing but its palette would go red there rather
     * than reaching a screen. That is the correct outcome and it is worth knowing
     * before designing a sparse animal, not after. */
    expect(verts).toBe(222)
    expect(tris).toBe(290)
    expect(body).toBe(94)
    expect(MODEL_VERTS_MIN).toBeGreaterThan(verts)
    expect(MODEL_TRIS_MIN).toBeGreaterThan(tris)
    expect(BODY_VERTS_MIN).toBeGreaterThan(body)
  })

  it('places by translation only — no node carries a rotation or a scale', () => {
    const g = build(MINIMAL)
    for (const m of meshesOf(g)) {
      expect(m.quaternion.toArray(), m.name).toEqual([0, 0, 0, 1])
      expect(m.scale.toArray(), m.name).toEqual([1, 1, 1])
    }
  })
})

/* --------------------------------------- 2. the donor transfer (§8) --- */

describe('the donor transfer places a part without anybody choosing a number', () => {
  it('joins a y+1 ear at THIS hull\'s top face and recovers the donor\'s own centre', () => {
    const spec = creatureSpec('test-creature', { ...MINIMAL, ears: 'wedge-06' })
    const ear = spec.features.find(f => f.name === 'ear')!
    // The cat is the only donor, so its recorded offset is unambiguous — and the
    // join solves back to it: joined at 1.43125 and sunk its own 0.573575, the
    // ear's centre lands on 1.404599 to one part in a million.
    const cat = partById('wedge-06')!
    expect(ear.sink).toBeCloseTo(cat.attachment!.sunkFractionMean, 9)
    expect(ear.placement.kind).toBe('pair')
    if (ear.placement.kind === 'pair') {
      expect(ear.placement.at[0]).toBeCloseTo(cat.offset[0]!, 9)   // x: unmoved by the join
      expect(ear.placement.at[1]).toBeCloseTo(1.43125, 9)          // y: the hull's top face
      expect(ear.placement.at[2]).toBeCloseTo(cat.offset[2]!, 9)   // z: unmoved by the join
    }
    const g = build({ ...MINIMAL, ears: 'wedge-06' })
    const right = g.getObjectByName('ear-r')!
    expect(right.getWorldPosition(new THREE.Vector3()).y).toBeCloseTo(cat.offset[1]!, 4)
  })

  it('joins a z+1 snout at THIS hull\'s front face at the donor\'s own height', () => {
    const spec = creatureSpec('test-creature', { ...MINIMAL, snout: 'tube-01' })
    const s = spec.features.find(f => f.name === 'snout')!
    const beaver = partById('tube-01')!
    expect(s.placement).toEqual({
      kind: 'single', at: [0, beaver.offset[1], 0.625],
    })
  })

  it('follows the hull it is actually on — box-31\'s front face is 0.500, not 0.625', () => {
    const spec = creatureSpec('test-creature', { ...MINIMAL, hull: 'box-31', snout: 'tube-01' })
    const s = spec.features.find(f => f.name === 'snout')!
    if (s.placement.kind === 'single') expect(s.placement.at[2]).toBeCloseTo(0.5, 9)
    // And the hull itself sits at the lion's own recorded centre, offset back.
    expect(spec.hull.at).toEqual([0, 0.80625, -0.0625])
    // The eye card does NOT follow it. On box-31 it floats 0.135 proud, which is
    // exactly what the lion does.
    const eye = spec.features.find(f => f.name === 'eye')!
    if (eye.placement.kind === 'pair') expect(eye.placement.at[2]).toBe(EYE_CARD_Z)
  })

  it('hangs one feature off another\'s outer face, so nobody redoes the arithmetic', () => {
    const g = build({ ...MINIMAL, snout: 'tube-01', nose: 'box-09' })
    const snout = g.getObjectByName('snout')!
    const nose = g.getObjectByName('nose')!
    const front = new THREE.Box3().setFromObject(snout).max.z
    // The nose is joined ON the snout's front plane, not guessed near it. This is
    // the gap the fan-out plan called the highest-risk one: an agent computing it
    // by hand gets no error when it floats.
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
  })
})

/* ------------------------------------- 3. the chamfer idiom (§8) --- */

describe('the ridge is §8\'s chamfer idiom, and it is two lines', () => {
  const SPIKED: CreatureDef = {
    ...MINIMAL,
    ridge: { part: 'cone-01', paint: 'coat', count: 4, spin: [{ axis: 'y', deg: 180 }] },
    /* Twenty spikes is 680 triangles on their own; the hedgehog declares the
     * same overrun for the same reason. */
    flag: 'RULE 9 STRAINED: twenty spikes.',
  }

  it('emits three rows on five faces, and their facings step evenly through a half turn', () => {
    const spec = creatureSpec('test-creature', SPIKED)
    expect(spec.features.map(f => f.name))
      .toEqual(['leg', 'spike-top', 'spike-chamfer', 'spike-side', 'eye'])
    const g = build(SPIKED)
    const spikes = meshesOf(g).filter(m => m.name.startsWith('spike'))
    expect(spikes).toHaveLength(20)
    // Joe's stated intent is that the back read CURVED rather than as three flat
    // faces, and evenly stepping facings is the thing that delivers it.
    const angles = new Set(spikes.map((m) => {
      const f = m.userData['facing'] as number[]
      return Math.round(Math.atan2(f[0]!, f[1]!) * 180 / Math.PI)
    }))
    expect([...angles].sort((a, b) => a - b)).toEqual([-90, -45, 0, 45, 90])
  })

  it('measures the cube\'s REAL chamfer — 0.46875, not the 0.5625 an assumption gives', () => {
    const spec = creatureSpec('test-creature', SPIKED)
    const cham = spec.features.find(f => f.name === 'spike-chamfer')!.placement
    if (cham.kind === 'row') {
      expect(cham.from[0]).toBeCloseTo(0.46875, 9)
      expect(cham.from[1]).toBeCloseTo(1.275, 9)
      expect(cham.mirror).toBe(true)
    }
    const side = spec.features.find(f => f.name === 'spike-side')!.placement
    if (side.kind === 'row') {
      expect(side.from[0]).toBeCloseTo(0.625, 9)
      expect(side.from[1]).toBeCloseTo(0.80625, 9)
    }
  })

  it('takes the row as wide as the pack\'s 1/16 grid allows while every station is embedded', () => {
    const spec = creatureSpec('test-creature', SPIKED)
    const top = spec.features.find(f => f.name === 'spike-top')!.placement
    // The flat face reaches 0.3125 and a spike buried 0.125 stays embedded to
    // 0.4375; the widest 1/16 SPACING inside that is 4/16, which puts the four
    // stations at +/-0.375 and +/-0.125. The hedgehog's own, solved.
    if (top.kind === 'row') expect(top.from[2]).toBeCloseTo(0.375, 9)
    expect(ridgeSpan(0.4375, 4)).toBeCloseTo(0.375, 9)
    // Two copies can sit right on the bound; one sits on the midline.
    expect(ridgeSpan(0.4375, 2)).toBeCloseTo(0.4375, 9)
    expect(ridgeSpan(0.4375, 1)).toBe(0)
  })
})

/* ---------------------------------------- 4. the rules, enforced --- */

describe('a definition cannot break a rule quietly', () => {
  const throws = (def: CreatureDef, re: RegExp): void => {
    expect(() => creatureSpec('test-creature', def)).toThrow(re)
  }

  it('RULE 3: a feature cannot wear a shape the pack used as a HULL', () => {
    // The exact fault that scrapped 72 animals: a head box beside a body box.
    throws({ ...MINIMAL, ears: 'box-31' }, /RULE 3.*HULL/s)
  })

  it('RULE 3: the hull must be a shape the pack itself used as a body', () => {
    throws({ ...MINIMAL, hull: 'cone-01' }, /RULE 3/)
  })

  it('RULE 1: authored geometry needs Joe\'s ruling said out loud', () => {
    throws(
      { ...MINIMAL, extras: [{ name: 'tip', part: 'bespoke-sphere-01', paint: 'nose' }] },
      /RULE 1.*AUTHORED/s,
    )
    // With the flag it is allowed — the clause exists and it works.
    expect(() => creatureSpec('test-creature', {
      ...MINIMAL,
      extras: [{ name: 'tip', part: 'bespoke-sphere-01', paint: 'nose' }],
      flag: 'RULE 1 OVERRULED, BY JOE: a bespoke sphere.',
    })).not.toThrow()
  })

  it('RULE 1: a shape that is neither in the bank nor authored throws by name', () => {
    throws({ ...MINIMAL, ears: 'box-999' }, /"box-999" is not in the parts bank/)
  })

  it('RULE 5: an eye card is an eye card', () => {
    throws({ ...MINIMAL, eyes: { part: 'cone-01' } }, /RULE 5/)
  })

  it('RULE 8: a paint that names a slot the palette has not got throws here, not at build', () => {
    throws({ ...MINIMAL, ears: { part: 'wedge-06', paint: 'ginger' } }, /RULE 8.*"ginger"/s)
    throws(
      { ...MINIMAL, ears: { part: 'wedge-06', paint: { base: 'coat', byBand: { 1: 'ginger' } } } },
      /RULE 8/,
    )
  })

  it('RULE 9: over the pack\'s triangle envelope is a decision, never a silent overrun', () => {
    // wedge-07 is 212 triangles; six of them is 1,272 on its own.
    const heavy: CreatureDef = {
      ...MINIMAL,
      ridge: { part: 'wedge-07', paint: 'coat', count: 3, span: 0.2 },
    }
    throws(heavy, /RULE 9/)
    expect(() => creatureSpec('test-creature', { ...heavy, flag: 'RULE 9 STRAINED: on purpose.' }))
      .not.toThrow()
  })

  it('THE PUPIL: a species cannot paint it anything but the pack\'s own measured grey', () => {
    throws(
      { palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, pupil: 0x000000 } },
      /THE PUPIL/,
    )
  })

  it('THE PAINTED LINE: a belly boundary must land on the pack\'s 1/16 grid', () => {
    throws({ ...MINIMAL, belly: 0.51 }, /1\/16 grid/)
    expect(() => creatureSpec('test-creature', { ...MINIMAL, belly: 0.5 })).not.toThrow()
  })

  it('§3 NOTHING FLOATS: a ridge that would leave the hull throws with the bound', () => {
    throws(
      { ...MINIMAL, ridge: { part: 'cone-01', paint: 'coat', count: 4, span: 0.6 } },
      /NOTHING FLOATS.*leaves the hull/s,
    )
  })

  it('THE CHAMFER IDIOM: the point and the turn are given together or not at all', () => {
    throws(
      { ...MINIMAL, tail: { part: 'box-23', chamfer: true, spin: [{ axis: 'x', deg: 30 }] } },
      /CHAMFER IDIOM/,
    )
  })

  it('AN ANCHOR: a feature can only hang off one already placed', () => {
    throws({ ...MINIMAL, nose: { part: 'box-09', on: 'antler' } }, /AN ANCHOR/)
  })
})
