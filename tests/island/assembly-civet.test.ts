/**
 * The civet. Night Time's first flagged species, and its second animal whose
 * marking IS the animal.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a civet can say: the blotches
 * land on the cube's own corners exactly, the tail is here for its SECOND BAND
 * rather than for its shape, the wheelbase is the only lever a long low body
 * gets, and the mask is flagged rather than approximated.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, CIVET_ASSEMBLY } from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-civet',
  parts: ['box-01', 'box-03', 'box-10', 'plate-01', 'plate-10', 'tube-06', 'wedge-06', 'wedge-18'],
  height: 1.71,
  verts: 610,
  tris: 783,
  // The tail is the biggest thing after the hull and it is a sixth of it.
  massRatio: 5,
  // The two dorsal cards are turned onto the top face, and rule 4's "no node
  // carries a rotation" passes vacuously on an animal with no rotation in it.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-civet')
  g.updateMatrixWorld(true)
  return g
}

describe('animal-civet: the blotches land on the cube\'s own corners, exactly', () => {
  it('puts all four flank cards edge-on to the flat face, on all four of its edges', () => {
    const g = build()
    // `box-03` cuts every edge AND every corner, so each flat face is only
    // 0.625 square: y 0.49375..1.11875, z -0.3125..0.3125.
    const names = ['spot-fore-high-r', 'spot-aft-high-r', 'spot-fore-low-r', 'spot-aft-low-r']
    const ys = new Set<string>(), zs = new Set<string>()
    for (const n of names) {
      const b = new THREE.Box3().setFromObject(g.getObjectByName(n)!)
      ys.add(b.min.y.toFixed(4)); ys.add(b.max.y.toFixed(4))
      zs.add(b.min.z.toFixed(4)); zs.add(b.max.z.toFixed(4))
    }
    // Every one of the eight outer bounds is the face's own edge, to the four
    // decimals the bank stores a position in. Kenney sized this card to a 1.250
    // cube's flat face in the first place, and put it in the corner.
    expect(ys).toContain('1.1187')
    expect(ys).toContain('0.4937')
    expect(zs).toContain('0.3125')
    expect(zs).toContain('-0.3125')
  })

  it('reflects the card\'s own recorded station rather than choosing four', () => {
    const card = partById('plate-10')!
    const at = (n: string): readonly number[] => {
      const f = CIVET_ASSEMBLY.features.find(q => q.name === n)!
      if (f.placement.kind === 'single' || f.placement.kind === 'pair') return f.placement.at
      throw new Error('not a point placement')
    }
    // x is the bank's own recorded 0.635 — the pack's flat-card shell, which is
    // `EYE_CARD_Z` on the other axis and gives the same 0.010 of daylight.
    expect(card.offset[0]).toBe(0.635)
    expect(at('spot-fore-high')[0]).toBe(0.635)
    // The high row is the card's own y and its own z; the low row is that y
    // reflected about the flat face's own centre, 0.80625.
    expect(at('spot-fore-high')[1]).toBeCloseTo(card.offset[1]!, 6)
    expect(at('spot-fore-high')[2]).toBeCloseTo(-card.offset[2]!, 6)
    expect(at('spot-fore-low')[1]).toBeCloseTo(2 * 0.80625 - card.offset[1]!, 9)
  })

  it('turns two cards onto the MIDLINE of the back, because the camera looks down', () => {
    const fore = CIVET_ASSEMBLY.features.find(f => f.name === 'crest-fore')!
    // A dorsal line is on the midline, so it is `single` and not a mirrored pair.
    expect(fore.placement.kind).toBe('single')
    if (fore.placement.kind === 'single') expect(fore.placement.at[0]).toBe(0)
    // The same card turned onto the top face: `x +1` to `y +1`, baked into the
    // copy's vertices (rule 4 as amended), never a node transform.
    expect(fore.spin).toEqual([{ axis: 'z', deg: 90 }])
    const g = build()
    expect(g.getObjectByName('crest-fore')!.quaternion.toArray()).toEqual([0, 0, 0, 1])
    // And the two clear each other: 0.372 apart, 0.253 across.
    const a = new THREE.Box3().setFromObject(g.getObjectByName('crest-fore')!)
    const b = new THREE.Box3().setFromObject(g.getObjectByName('crest-aft')!)
    expect(a.min.z).toBeGreaterThan(b.max.z)
  })
})

describe('animal-civet: the tail is chosen for its second band', () => {
  it('takes the tiger\'s whip over its identical twin, and paints Kenney\'s own tip', () => {
    const tiger = partById('wedge-18')!, cat = partById('wedge-07')!
    // The two thin ropes are the same bounding box to six decimals. The only
    // thing that separates them is the mesh, and this one has TWO bands.
    for (let i = 0; i < 3; i++) expect(tiger.size[i]).toBeCloseTo(cat.size[i]!, 6)
    expect(new Set(cat.bands).size).toBe(1)
    expect(new Set(tiger.bands).size).toBe(2)
    const tail = CIVET_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.paint).toEqual({ base: 'coat', byBand: { 3: 'mark' } })
    // Band 3 is the third of the length FURTHEST from the join — the root leaves
    // the rump at local y -0.523 and band 3 sits at 0.266..0.523 — so painting
    // it dark is a dark-tipped tail, which is as near a ringed one as the bank
    // gets. Measured off the record rather than assumed.
    let lo = Infinity, hi = -Infinity
    for (let t = 0; t < tiger.tris; t++) {
      if (tiger.bands[t] !== 3) continue
      for (let k = 0; k < 3; k++) {
        const y = tiger.positions[tiger.indices[t * 3 + k]! * 3 + 1]!
        if (y < lo) lo = y
        if (y > hi) hi = y
      }
    }
    expect(lo).toBeGreaterThan(0.25)
    expect(hi).toBeCloseTo(0.523, 2)
  })

  it('is placed by the donor transfer alone and recovers the bank\'s own offset', () => {
    const tiger = partById('wedge-18')!
    const tail = CIVET_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.sink).toBeCloseTo(tiger.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    // Joined at the cube's rear face, so its centre lands on the recorded
    // -0.826000 — solved for, then checked against a number not used in solving.
    const w = build().getObjectByName('tail')!.getWorldPosition(new THREE.Vector3())
    expect(w.z).toBeCloseTo(tiger.offset[2]!, 4)
  })
})

describe('animal-civet: long and low is the wheelbase, never the shell', () => {
  it('sets the legs at 5/16 and keeps every foot inside the body\'s own box', () => {
    const legs = CIVET_ASSEMBLY.features.find(f => f.name === 'leg')!
    if (legs.placement.kind === 'row') expect(legs.placement.from[2]).toBe(0.3125)
    // `box-01` is 0.375 deep, so at 5/16 its outer face lands on 0.500 — a full
    // chamfer's width inside the hull's own 0.625. It costs no keep-out at all.
    const g = build()
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    for (const n of ['leg-r0', 'leg-l0', 'leg-r1', 'leg-l1']) {
      const b = new THREE.Box3().setFromObject(g.getObjectByName(n)!)
      expect(Math.max(Math.abs(b.min.z), Math.abs(b.max.z))).toBeCloseTo(0.5, 6)
      expect(b.max.z).toBeLessThan(hull.max.z)
      expect(b.min.z).toBeGreaterThan(hull.min.z)
    }
    // And the hull itself is untouched: length is never bought with a stretch.
    expect(CIVET_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(CIVET_ASSEMBLY.hull.part).toBe('box-03')
  })
})

describe('animal-civet: the mask is flagged, not faked', () => {
  it('says so where Joe reads it, and adds no geometry pretending otherwise', () => {
    expect(CIVET_ASSEMBLY.flag).toMatch(/MASKED FACE CANNOT BE EXPRESSED/)
    expect(CIVET_ASSEMBLY.flag).toMatch(/RINGED TAIL/)
    expect(CIVET_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
    // Nothing authored, and no card doing duty as a face stripe: every marking
    // card on this animal is on a flank or on the spine, never on the face.
    const g = build()
    for (const m of CIVET_ASSEMBLY.features) {
      expect(m.part.startsWith('bespoke-')).toBe(false)
    }
    for (const n of ['spot-fore-high-r', 'crest-fore']) {
      expect(new THREE.Box3().setFromObject(g.getObjectByName(n)!).max.z)
        .toBeLessThan(0.625)
    }
  })
})
