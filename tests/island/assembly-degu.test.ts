/**
 * The degu. Home Pets' sixth rodent, and the one whose own collection record
 * calls it the hardest separation of the six.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a degu can say, and it says five
 * things the next builder needs and cannot get from a screenshot:
 *
 *   1. **`box-12` is the widest shell the pack drew**, and its extra width is two
 *      fused ear LUGS — which is why this animal is stocky AND earless in the
 *      definition, and why its ears are still small beside the chinchilla's.
 *   2. **`box-41` cannot be worn by anything with eyes.** Its front face is at
 *      z = 0.725 and `EYE_CARD_Z` is 0.6350 and is not a field, so the cards land
 *      inside the head. That is the reason the stocky animal is not on the
 *      tiger's "bigger" hull, and it is general rather than about this species.
 *   3. **The tail is a THICK one by measurement**, and `wedge-15` — the lion's
 *      tufted whip, which is measurably the better degu tail — is refused because
 *      it is the gerbil's assigned separation in this same collection.
 *   4. **The pale eye-ring cannot be drawn**, and that is pinned as a fact about
 *      the BANK and the MECHANISM rather than as an opinion in a comment: no eye
 *      card carries a third band, and no card in the bank could ring the round one
 *      from behind. If a later change makes a ring sayable, this file goes red and
 *      the flag comes off.
 *   5. **The incisors are what clears rule 9's FLOOR**, and the margin is derived
 *      from the built group rather than asserted, so the day somebody drops them
 *      for tidiness the reason is right here.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, DEGU_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW,
  MODEL_VERTS_MIN, PACK_PUPIL,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-degu',
  parts: ['box-01', 'box-09', 'box-12', 'box-38', 'plate-08', 'tube-01', 'wedge-01'],
  height: 1.5559,
  verts: 448,
  tris: 566,
  // The widest hull in the pack against the cheapest tail in it: 2.405 of hull
  // against 0.367 of brush. Stated above the harness's own floor of 3.
  massRatio: 6,
  // NONE, said out loud. Every part here faces the way its donor drew it — the
  // tail is the pack's own `z -1` and needed no turning — and rule 4's "no node
  // carries a rotation" would otherwise pass for the wrong reason.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-degu')
  g.updateMatrixWorld(true)
  return g
}
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** The triangles of one band, as vertex positions. */
const bandPoints = (id: string, band: number): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (let t = 0; t < p.bands.length; t++) {
    if (p.bands[t] !== band) continue
    for (let k = 0; k < 3; k++) {
      const vi = p.indices[t * 3 + k]!
      out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
    }
  }
  return out
}

/** A shape's two largest extents. A card has a zero, so this is its own plane. */
const plane = (id: string): [number, number] => {
  const d = [...partById(id)!.size].sort((a, b) => b - a)
  return [d[0]!, d[1]!]
}

describe('animal-degu: the stockiness is the SHELL, and the ears come with it', () => {
  it('wears the widest hull the pack drew — measured over all ten', () => {
    const hulls = PARTS_BANK.filter(p => p.roles.includes('hull'))
    expect(hulls).toHaveLength(10)
    const widest = hulls.reduce((a, b) => (b.size[0]! > a.size[0]! ? b : a))
    // The separation from the gerbil, as one number. Nothing a sibling on the
    // 1.250 cube can do reaches this without a stretch, and `HullDef.stretch` is
    // `never`. If a wider shell is ever added, this goes red and the claim in the
    // species file has to be rewritten rather than quietly becoming false.
    expect(widest.id).toBe('box-12')
    expect(widest.size[0]).toBeCloseTo(1.539484, 6)
    expect(DEGU_ASSEMBLY.hull.part).toBe('box-12')
    expect(partById('box-03')!.size[0]).toBeCloseTo(1.25, 6)
    expect(1.539484 / 1.25).toBeGreaterThan(1.23)
  })

  it('is STOCKIER built than anything on the cube, and still fits between trees', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // Width over height, which is the axis `hulls.ts` states the pack on (0.55 to
    // 1.35, mean 0.97). A bare cube on the standard leg row is 1.25 / 1.43125 =
    // 0.873; this is 0.989, and the whole of the difference is the shell.
    expect(s.x / s.y).toBeGreaterThan(1.25 / 1.43125 + 0.1)
    expect(s.x / s.y).toBeCloseTo(0.989, 2)
    // `pets.ts:652` charges keep-out from max(width, depth) / 2, and here it is
    // the DEPTH that binds — the brush behind, not the 1.539 across. Still inside
    // the fox's own 1.15, the pack's worst, and inside this collection's ratchet
    // of 1.28 (`species-silhouette.test.ts`, held by the ferret).
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.985, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('has NO ear part, because the hull\'s own lugs are the ears — and they are small', () => {
    // The badger measured that `box-12`'s 1.539 is a 1.250 cube plus two fused
    // lugs. What this species needs is the SIZE of one, because its separation
    // from the chinchilla is that these ears are small.
    const lug = points('box-12').filter(q => Math.abs(q[0]) > 0.6251)
    expect(lug).toHaveLength(30)
    const ext = (i: 0 | 1 | 2): number =>
      Math.max(...lug.map(q => q[i])) - Math.min(...lug.map(q => q[i]))
    expect(Math.max(...lug.map(q => Math.abs(q[0]))) - 0.625).toBeCloseTo(0.1447, 4)
    expect(ext(1)).toBeCloseTo(0.1767, 4)
    expect(ext(2)).toBeCloseTo(0.15, 4)
    // No ear feature at all, and no shape the pack used as an ear anywhere on the
    // animal — otherwise this hull gives it four.
    expect(DEGU_ASSEMBLY.features.some(f => f.name.startsWith('ear'))).toBe(false)
    for (const f of DEGU_ASSEMBLY.features) {
      expect(partById(f.part)?.roles.includes('ear'), `${f.name} wears an ear shape`).toBeFalsy()
    }
    // And specifically not the chinchilla's, which is the biggest and roundest in
    // the bank and is that animal's whole read in this same collection. A lug is a
    // fifth of it, which is "rounded" without being "enormous".
    expect(partById('box-25')!.size[0]).toBeCloseTo(0.742676, 6)
    expect(0.742676 / 0.1447).toBeGreaterThan(5)
  })

  it('paints the lugs from Kenney\'s OWN cut, where the belly line cannot reach', () => {
    const hull = partById('box-12')!
    const band5 = hull.bands.filter(b => b === 5)
    expect(band5).toHaveLength(12)
    expect(DEGU_ASSEMBLY.hull.paint.byBand).toEqual({ 5: 'limb' })
    // All twelve are the flat forward face of a lug — one z, both sides — so this
    // is an inner ear for one `byBand` entry and no geometry.
    const pts = bandPoints('box-12', 5)
    for (const q of pts) expect(q[2]).toBeCloseTo(0.5, 6)
    // AND they cannot argue with the painted belly. `belly: 0.5` is a plane at half
    // the hull's height, which on this shell is its own equator, local y = 0; the
    // lowest point of band 5 is +0.3255 above it. So no triangle is claimed twice
    // and the two mechanisms in §4 coexist on one part, exactly as the badger's do.
    expect(Math.min(...pts.map(q => q[1]))).toBeGreaterThan(0)
    expect(Math.min(...pts.map(q => q[1]))).toBeCloseTo(0.3255, 4)
    expect(DEGU_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
  })

  it('refuses `box-41`, and the reason applies to every species with eyes', () => {
    // The tiger's is the only other shell wider than the cube, so it is the
    // obvious pick for a stocky animal — and it is unusable. Its front face is
    // 0.090 in FRONT of the eye plane, and `EYE_CARD_Z` is not a parameter
    // (rule 5, made unsayable in `CreatureDef`), so the cards would be buried.
    const tiger = partById('box-41')!
    const front = tiger.offset[2]! + tiger.size[2]! / 2
    expect(front).toBeCloseTo(0.725, 6)
    expect(front - EYE_CARD_Z).toBeCloseTo(0.09, 6)
    expect(DEGU_ASSEMBLY.hull.part).not.toBe('box-41')
    // This hull's front face is the usual one, so the cards float the pack's own
    // 0.010 proud — the daylight `CARD_STANDOFF` is measured from.
    const hull = partById('box-12')!
    expect(hull.offset[2]! + hull.size[2]! / 2).toBeCloseTo(HULL_FRONT_Z_USUAL, 4)
    expect(world(build(), 'eye-r').z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.01, 4)
  })
})

describe('animal-degu: the tail is a BRUSH by measurement, not by adjective', () => {
  it('is one of the bank\'s three thick tails, with nothing between the groups', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    const thin = (id: string): number => Math.min(...partById(id)!.size)
    const thick = tails.filter(p => thin(p.id) > 0.4).map(p => p.id).sort()
    expect(thick).toEqual(['box-23', 'box-38', 'wedge-03'])
    expect(thin('box-38')).toBeCloseTo(0.6259, 4)
    // §7's finding, re-derived: the seven split on THICKNESS and the gap is real.
    // A gerbil's slim shaft is in the lower group, and that is this species' second
    // separation from it.
    const gap = Math.min(...thick.map(thin)) / Math.max(...tails.filter(p => thin(p.id) < 0.4)
      .map(p => thin(p.id)))
    expect(gap).toBeGreaterThan(1.7)
    // It holds its bulk almost to the tip, which is what makes it a brush and not
    // a paddle: the beaver's tapers to 0.577 of itself, this to 0.839.
    expect(partById('box-38')!.shape.taper).toBeGreaterThan(partById('wedge-03')!.shape.taper)
    // And it is the cheapest tail in the bank, which is what pays for a 180-triangle hull.
    expect(Math.min(...tails.map(p => p.tris))).toBe(partById('box-38')!.tris)
  })

  it('is a PURE donor transfer — the parrot wears it on a hull with this centre', () => {
    const parrot = partById('box-38')!
    const tail = DEGU_ASSEMBLY.features.find(f => f.name === 'tail')!
    // Nothing is chosen: the join is this hull's rear face, the two coordinates the
    // join does not move are the shape's own recorded offset, and the burial is the
    // parrot's own measured one.
    expect(tail.placement).toEqual({
      kind: 'single', at: [0, parrot.offset[1], -0.625],
    })
    expect(tail.sink).toBe(parrot.attachment!.sunkFractionMean)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    // The height transfers with CERTAINTY rather than by argument, which is the
    // whole reason it is not the fraction the dormouse had to compute: the parrot
    // wears this shape on `box-03`, and that shell's recorded centre is this
    // shell's recorded centre.
    expect(parrot.provenance.map(q => q.species)).toContain('parrot')
    expect(partById('box-12')!.offset[1]).toBe(partById('box-03')!.offset[1])
    expect(partById('box-12')!.size[1]).toBeCloseTo(partById('box-03')!.size[1]!, 6)
    // Sunk past §3's floor, so nothing floats: 0.2697 x 0.6421 is 0.173.
    const g = build()
    const t = g.getObjectByName('tail')!
    expect((t.userData['sink'] as number) * (t.userData['extent'] as number))
      .toBeGreaterThan(0.125)
  })

  it('has no tip to cut, which is why the whole brush is dark', () => {
    // ONE band over all 48 triangles, so §4's first way has nothing to work with —
    // this is the fact the flag rests on. If the bank is ever regenerated with a
    // second band here, the flag's second half is wrong and this goes red.
    expect(new Set(partById('box-38')!.bands)).toEqual(new Set([3]))
    expect(DEGU_ASSEMBLY.features.find(f => f.name === 'tail')!.paint)
      .toEqual({ base: 'brush' })
  })

  it('refuses the LION\'s tail, which is measurably the better degu tail', () => {
    // `wedge-15` is a 0.280 shaft with Kenney's own tuft gathered at one end: band
    // 5 is 40 triangles living in the top quarter of its 1.0824 length. That is a
    // slim tail with a dark tip, for free — and a dark tip is the GERBIL's assigned
    // separation in this same collection, so it is left there deliberately.
    const lion = partById('wedge-15')!
    const tuft = bandPoints('wedge-15', 5)
    expect(tuft).toHaveLength(120)                       // 40 triangles
    expect(Math.min(...tuft.map(q => q[1]))).toBeGreaterThan(0.28)
    expect(lion.size[1]! / 2 - Math.max(...tuft.map(q => q[1]))).toBeLessThan(0.01)
    expect(Math.min(...lion.size)).toBeLessThan(0.4)     // a slim shaft, not a brush
    // And it is the most expensive common part in the bank — four times this tail,
    // on an animal whose hull already costs 180.
    expect(lion.tris).toBe(212)
    expect(lion.tris / partById('box-38')!.tris).toBeGreaterThan(4)
    expect(DEGU_ASSEMBLY.features.some(f => f.part === 'wedge-15')).toBe(false)
  })
})

describe('animal-degu: the pale eye-ring, and the part of it that cannot be drawn', () => {
  it('spends the pack\'s one perfectly ROUND card on it, from its own slot', () => {
    const eye = DEGU_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-08')
    const card = partById('plate-08')!
    // The only card in the bank whose two axes are equal — measured, not believed.
    const round = PARTS_BANK.filter(p => (p.roles.includes('eye') || p.roles.includes('card'))
      && plane(p.id)[0] === plane(p.id)[1])
    expect(round.map(p => p.id).sort()).toEqual(['plate-08', 'plate-09'])
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // The ring gets its OWN slot, and it has to be paler than the belly or it is
    // not a ring: this is the one place the definition's colours are load-bearing.
    expect(eye.paint).toEqual({ base: 'ring', byBand: { 15: 'pupil' } })
    expect(DEGU_ASSEMBLY.palette['ring']).toBeGreaterThan(DEGU_ASSEMBLY.palette['belly']!)
    expect(DEGU_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
  })

  it('wraps the pupil on three sides of four — which is as far as the card goes', () => {
    // Band 3 is the pale field and it reaches the card's own full radius in y and
    // on the outer side; band 15, the pupil, is inset and runs out to one edge.
    // That asymmetry is why this reads as a ring at three-quarter view and not as
    // a ring from every angle, and it is the honest half of the flag.
    const pale = bandPoints('plate-08', 3), pupil = bandPoints('plate-08', 15)
    expect(pale.length / 3).toBe(20)
    expect(pupil.length / 3).toBe(10)
    expect(Math.max(...pale.map(q => Math.abs(q[1])))).toBeCloseTo(0.2, 4)
    expect(Math.max(...pupil.map(q => Math.abs(q[1])))).toBeCloseTo(0.1202, 4)
    expect(Math.max(...pale.map(q => q[0]))).toBeGreaterThan(Math.max(...pupil.map(q => q[0])))
  })

  it('has NO third band on ANY eye card — so a ring cannot be painted', () => {
    // §4's first way needs a cut Kenney already made. Measured over all ten eye
    // cards: every one of them is sclera and pupil, and the cat's is pupil alone.
    // There is no band that is a ring, on any card, anywhere in the bank.
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    expect(eyes).toHaveLength(10)
    for (const p of eyes) {
      const bands = [...new Set(p.bands)].sort((a, b) => a - b)
      expect(bands.length, `${p.id} has ${bands.length} bands`).toBeLessThanOrEqual(2)
      for (const b of bands) expect([3, 15], `${p.id} carries band ${b}`).toContain(b)
    }
  })

  it('has no card in the BANK that could ring it from behind — measured, not assumed', () => {
    // The other route to a ring is a bigger pale card behind the eye. Nothing in
    // the bank exceeds this card on BOTH of its axes except the panda's, and the
    // panda's is an eye card: `assembly-assert.ts` holds every eye-role card to the
    // absolute z = 0.6350, so it would be exactly coplanar with the card it is
    // meant to ring and would z-fight into invisibility — the failure
    // `CARD_STANDOFF` is written to document.
    const flat = PARTS_BANK.filter(p => p.roles.includes('eye') || p.roles.includes('card'))
    const bigger = flat.filter(p => plane(p.id)[0] > 0.4 && plane(p.id)[1] > 0.4)
    expect(bigger.map(p => p.id).sort()).toEqual(['plate-14', 'plate-15'])
    for (const p of bigger) expect(p.roles).toContain('eye')
    // And it could only ever draw a DARK ring anyway: its OUTER region is band 15,
    // 40 of its 57 triangles, and the pupil rule paints band 15 the pack's grey.
    const outer = bandPoints('plate-14', 15), inner = bandPoints('plate-14', 3)
    expect(outer.length / 3).toBe(40)
    expect(inner.length / 3).toBe(17)
    const radius = (ps: [number, number, number][]): number =>
      Math.max(...ps.map(q => Math.hypot(q[0], q[1])))
    expect(radius(outer)).toBeGreaterThan(radius(inner))
    expect(DEGU_ASSEMBLY.features.some(f => f.part.startsWith('plate-1'))).toBe(false)
  })

  it('flags the shortfall where Joe reads it, and authors nothing to fake it', () => {
    const flag = DEGU_ASSEMBLY.flag!
    expect(flag).toMatch(/EYE-RING/)
    expect(flag).toMatch(/patch/i)
    expect(flag).toMatch(/band/i)
    // Flagged for the marking and the tail, and for nothing else: no bespoke shape,
    // no stretch anywhere, and no budget declared, because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(DEGU_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(DEGU_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
    expect(DEGU_ASSEMBLY.hull.stretch).toBeUndefined()
  })
})

describe('animal-degu: the face is the pack\'s one rodent\'s, and it clears the floor', () => {
  it('recovers the beaver\'s own muzzle placement from the join alone', () => {
    const beaver = partById('tube-01')!
    const snout = DEGU_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, beaver.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBe(0)
    // Solved from the join, then checked against a number the solve never used.
    // Four decimals: the built attribute is float32.
    expect(world(build(), 'snout').z).toBeCloseTo(beaver.offset[2]!, 4)
    // A barrel that does not narrow — the blunt face, against a shrew's point.
    expect(beaver.shape.taper).toBe(1)
    // And painted pale, which is the one thing about this face the definition chose.
    expect(snout.paint).toEqual({ base: 'belly' })
  })

  it('hangs the nose on the muzzle\'s own placed front plane, not near it', () => {
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // A BUTTON, deliberately not `wedge-10` — measurably the better nose tip, and
    // it reads as a tongue. Joe rejected that one by name on the hedgehog.
    expect(DEGU_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
    expect(partById('box-09')!.roles).toContain('nose')
  })

  it('wears the beaver\'s incisors at the beaver\'s own recovered placement', () => {
    const teeth = partById('wedge-01')!
    const inc = DEGU_ASSEMBLY.features.find(f => f.name === 'incisor')!
    expect(inc.placement).toEqual({
      kind: 'pair', at: [teeth.offset[0], teeth.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(inc.sink).toBe(teeth.attachment!.sunkFractionMean)
    // The recovery: joined at the front face and sunk the beaver's own 0.218566,
    // the centre lands back on the recorded z. The beaver wears these on `box-03`,
    // whose front face is this hull's.
    expect(world(build(), 'incisor-r').z).toBeCloseTo(teeth.offset[2]!, 4)
    // Sunk 0.0282, which `pets:creature` marks THIN — under the 0.125 §3 asks of an
    // EAR. It is the pack's own burial of its own teeth on its own hull, and it is
    // pinned here so nobody "fixes" it to a number Kenney never used.
    expect(inc.sink! * teeth.size[2]!).toBeCloseTo(0.0282, 4)
    // The one colour this animal owns outright: a degu's incisors are orange.
    expect(inc.paint).toEqual({ base: 'tooth' })
    expect(DEGU_ASSEMBLY.palette['tooth']).toBe(0xd6a94e)
  })

  it('is over rule 9\'s FLOOR because of them — derived, not asserted', () => {
    // The dormouse and the vole both hit this from the same direction: a species
    // with no ear part carries less geometry than anything Kenney shipped, and
    // `assembly-assert.ts` gives no escape clause for UNDER. Without the incisors
    // this animal is 400 vertices against the pack's own 405. The margin is
    // measured off the built group so that dropping them for tidiness fails here
    // with the reason attached.
    const g = build()
    let all = 0, teeth = 0
    g.traverse(o => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const n = m.geometry.getAttribute('position').count
      all += n
      if (m.name.startsWith('incisor')) teeth += n
    })
    expect(all).toBe(448)
    expect(all - teeth).toBeLessThan(MODEL_VERTS_MIN)
    expect(all - teeth).toBe(400)
  })

  it('takes the leg row entire, and stands wider for saying nothing about it', () => {
    const leg = DEGU_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    // The stations scale with the hull, so the widest shell stands widest for
    // nothing said in the definition: 0.3325 against the cube's own 0.27.
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from[1]).toBe(LEG_ROW.y)
      expect(leg.placement.from[0]).toBeCloseTo(0.27 * (1.539484 / 1.25), 4)
    }
  })
})
