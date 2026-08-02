/**
 * The sheep — Farm's woolly one, and the exemplar the goat, the llama and the
 * alpaca are cut from.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file pins the four things that are THIS animal's
 * and that three siblings will copy off it, as facts rather than as prose:
 *
 *   1. **There is no fleece in the bank** — re-measured over every id, role and
 *      provenance row, so "carry it in the palette" is a statement about the data
 *      and not a preference.
 *   2. **The whole usable range of `box-01`'s patch line is k in 4..9**, both
 *      ends forced by a measurement, with the drawn boundary read off the image
 *      and off the mesh. If that range moves, this file goes red and names it.
 *   3. **No band in the bank can be a fleece collar on `box-41`** — all five
 *      measured against both shells, so the refusal is re-runnable.
 *   4. **Band 3 is the dark face**, and rule 3's no-head consequence.
 *
 * Then the things that are the sheep: the ear worn on its side, the tail's
 * two-thousandth-wide window, and what a snout would have cost.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, SHEEP_ASSEMBLY,
  EYE_CARD_Z, HULL_BOTTOM_Y, LEG_ROW, PACK_PUPIL, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-sheep',
  parts: ['box-01', 'box-14', 'box-18', 'box-41', 'cone-02', 'plate-01'],
  height: 1.48125,
  verts: 503,
  tris: 670,
  // The stocky shell against the tail, which is the next biggest thing on it.
  massRatio: 8,
  // One: the elephant's trunk turned round to face backwards.
  spinsAtLeast: 1,
})

/** Vertices on everything that is not a leg, measured once and quoted in the file. */
const BODY_VERTS = 375

const build = (): THREE.Group => {
  const g = buildAssembled('animal-sheep')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof SHEEP_ASSEMBLY)['features'][number] =>
  SHEEP_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/* ===================================================================== *
 * 1. THE FLEECE THAT IS NOT THERE
 * ===================================================================== */

describe('animal-sheep: the bank has no fleece, so the palette carries it', () => {
  it('has ZERO fleece shapes — every id, every role, every provenance row', () => {
    // `collections/farm.ts` rules that fleece is palette and not geometry. This
    // is the half of that ruling which is a fact about the data: there is
    // nothing to search for, so a builder who goes looking ends up authoring a
    // shape, and JT-041 does not allow it.
    const hits: string[] = []
    for (const p of PARTS_BANK) {
      if (/fleece|wool|tuft|bump/i.test(p.id)) hits.push(p.id)
      for (const q of p.provenance) {
        if (/fleece|wool/i.test(q.name) || /fleece|wool/i.test(q.node)) hits.push(`${p.id}<-${q.species}`)
      }
    }
    expect(hits, 'the bank grew a fleece; the palette may no longer have to carry it').toEqual([])
    // And no role for one. These ten are the whole vocabulary the bank speaks.
    const roles = [...new Set(PARTS_BANK.flatMap(p => p.roles))].sort()
    expect(roles).toEqual([
      'band', 'card', 'ear', 'eye', 'hull', 'leg', 'nose', 'oddment', 'tail', 'tooth',
    ])
    // Nothing on this animal is authored either — not even one of JT-041's three
    // sanctioned base shapes, which is how a builder would fake a tuft.
    expect(SHEEP_ASSEMBLY.features.filter(f => f.part.startsWith('bespoke-'))).toEqual([])
  })

  it('spends the silhouette on the HULL, which is the only dial there is', () => {
    // `HullDef.stretch` is `never`, so a rounder body is a different shell and
    // there is no third option. `box-41` is the fullest one the pack owns.
    expect(SHEEP_ASSEMBLY.hull.part).toBe('box-41')
    const big = partById('box-41')!, cube = partById('box-03')!
    expect(big.size).toEqual([1.35, 1.3, 1.35])
    for (const i of [0, 2]) expect(big.size[i]! - cube.size[i]!).toBeCloseTo(0.1, 6)
    expect(SHEEP_ASSEMBLY.hull.stretch).toBeUndefined()
    // Low-contrast is the other carrier and it is checkable: the fleece is the
    // least saturated colour on the animal, and near-white.
    const chroma = (hex: number): number => {
      const c = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      return (Math.max(...c) - Math.min(...c)) / Math.max(...c)
    }
    const coat = SHEEP_ASSEMBLY.palette['coat']!
    expect(chroma(coat)).toBeLessThan(0.15)
    expect((coat >> 16) & 255).toBeGreaterThan(0xd0)
    expect(chroma(coat)).toBeLessThan(chroma(SHEEP_ASSEMBLY.palette['face']!))
  })
})

/* ===================================================================== *
 * 2. THE FLEECE COLLAR THAT IS NOT THERE EITHER — all five bands, both shells
 * ===================================================================== */

describe('animal-sheep: no band in the bank can be a collar on this shell', () => {
  it('measures all five against BOTH shells, and two go negative on this one', () => {
    // The refusal in the header, re-runnable. How far a shell-ring stands proud
    // is its own outer half-extent less the hull's, and `box-41`'s extra 0.100 of
    // roundness is exactly what eats it.
    const bands = PARTS_BANK.filter(p => p.roles.includes('band'))
    expect(bands.map(p => p.id).sort()).toEqual(['box-04', 'box-11', 'box-19', 'box-29', 'box-35'])
    const proudOn = (hullId: string, bandId: string): number =>
      partById(bandId)!.size[0]! / 2 - partById(hullId)!.size[0]! / 2

    // On this hull: two are NARROWER than the body and would be swallowed whole.
    expect(proudOn('box-41', 'box-04')).toBeCloseTo(-0.0075, 4)
    expect(proudOn('box-41', 'box-35')).toBeLessThan(0)
    // And the two middle ones are a welt, not a coat: under five times the pack's
    // own card standoff of 0.010 on a body 1.350 across.
    expect(proudOn('box-41', 'box-19')).toBeCloseTo(0.027, 3)
    expect(proudOn('box-41', 'box-11')).toBeCloseTo(0.04725, 4)
    // Every one of them has 0.050 more clearance on the cube — the whole trade.
    for (const id of ['box-04', 'box-11', 'box-19', 'box-29', 'box-35']) {
      expect(proudOn('box-03', id) - proudOn('box-41', id)).toBeCloseTo(0.05, 6)
    }
    expect(proudOn('box-03', 'box-04')).toBeGreaterThan(0)
  })

  it('refuses `box-29` on its OVERHANG and not on its cost', () => {
    const ring = partById('box-29')!
    // It fits the barrel astonishingly well in one direction: its aperture is the
    // smallest radius any of its 224 points reaches in the x/y plane, and that is
    // 1.3482 across against this hull's 1.3500 — it cannot float.
    const aperture = 2 * Math.min(...points('box-29').map(p => Math.hypot(p[0]!, p[1]!)))
    expect(aperture).toBeCloseTo(1.3482, 3)
    expect(partById('box-41')!.size[0]! - aperture).toBeCloseTo(0.0018, 3)
    // And it is refused anyway, because it is 1.650 across against a body 1.300
    // TALL: wherever it is centred it must overhang by 0.350 in total, which at
    // the lion's own height is 0.250 above the crown. That is a mane.
    expect(ring.size[0]! - partById('box-41')!.size[1]!).toBeCloseTo(0.35, 6)
    expect(SHEEP_ASSEMBLY.features.some(f => partById(f.part)?.roles.includes('band'))).toBe(false)
    // Cost is NOT the reason, and saying so stops somebody re-trying it later:
    // this animal has room for all 224 of the ring's vertices under rule 9's
    // body-vertex ceiling, measured off the build rather than assumed.
    let bodyVerts = 0
    build().traverse(o => {
      const m = o as THREE.Mesh
      if (!m.isMesh || m.userData['role'] === 'leg') return
      bodyVerts += m.geometry.getAttribute('position').count
    })
    expect(bodyVerts).toBe(BODY_VERTS)
    expect(bodyVerts + ring.verts).toBeLessThan(1114)
  })
})

/* ===================================================================== *
 * 3. THE LEG: THE WHOLE RANGE, ONCE, FOR FOUR SPECIES
 * ===================================================================== */

describe('animal-sheep: JT-044 at the fleece end, and the range between the two', () => {
  it('finds exactly TWO lines on `box-01`, and they are the range\'s two ends', () => {
    const leg = partById('box-01')!
    expect(leg.size).toEqual([0.375, 0.30625, 0.375])
    const ys = [...new Set(points('box-01').map(p => p[1]!.toFixed(6)))].map(Number)
      .sort((a, b) => a - b)
    expect(ys).toEqual([-0.1531, -0.0906, 0.1531])
    // (a) the foot's bevel: 0.0625 up from the sole, one 1/16 of a model unit.
    expect(ys[1]! - ys[0]!).toBeCloseTo(0.0625, 6)
    expect((ys[1]! - ys[0]!) / leg.size[1]!).toBeCloseTo(0.204082, 6)
    // (b) the hull's belly: the leg is buried its own 0.125 and SHOWS 0.18125,
    // which is HULL_BOTTOM_Y by construction on every hull in the pack.
    const visible = leg.size[1]! * (1 - leg.attachment!.sunkFractionMax)
    expect(visible).toBeCloseTo(HULL_BOTTOM_Y, 6)
    expect(visible / leg.size[1]!).toBeCloseTo(0.591837, 6)
  })

  it('derives k in 4..9 as the WHOLE usable range, off the drawn boundary', () => {
    // The clamp is the half a comment cannot say: `patchUv` holds the two end
    // rows half a texel inside the cell, so the leg reads v = 0.5 at the sole,
    // 3.2658 at the bevel top and 15.5 at the top, and a boundary at row k lands
    // where that interpolation puts it — NOT at k/16 of the part's height.
    const built = 0.3062                       // the bank's own 4dp span
    const bevel = (0.0625 / built) * SLOT_PX
    expect(bevel).toBeCloseTo(3.2658, 4)
    /** Where row k is drawn, measured up from the sole. */
    const drawn = (k: number): number => k <= bevel
      ? ((k - 0.5) / (bevel - 0.5)) * 0.0625
      : 0.0625 + ((k - bevel) / (15.5 - bevel)) * (0.1531 - (-0.0906))
    // Below 4 the line lands INSIDE the foot's own bevel and follows a sloping
    // face; at 4 it clears onto the straight shank. That end is the pony's.
    expect(drawn(3)).toBeLessThan(0.0625)
    expect(drawn(4)).toBeGreaterThan(0.0625)
    expect(drawn(4)).toBeCloseTo(0.07712, 4)
    // Above 9 the line is inside the HULL, so nothing is drawn at all. That end
    // is this file's, and it is the second measured line on the shape.
    expect(drawn(10)).toBeGreaterThan(HULL_BOTTOM_Y)
    expect(drawn(9)).toBeLessThan(HULL_BOTTOM_Y)
    // Six values, both ends forced. This is the sentence three siblings copy.
    const usable = [...Array(16).keys()].filter(k => k > 0 && drawn(k) > 0.0625 && drawn(k) < HULL_BOTTOM_Y)
    expect(usable).toEqual([4, 5, 6, 7, 8, 9])
  })

  it('spends 8/16, and refuses 9/16 with the ferret\'s own rule', () => {
    expect(feature('leg').paint).toEqual({
      base: 'limb',
      patch: { below: 'face', at: 0.5 },
    })
    expect(feature('leg').paint.patch!.at * SLOT_PX).toBe(8)
    const built = 0.3062
    const bevel = (0.0625 / built) * SLOT_PX
    const drawn = (k: number): number =>
      0.0625 + ((k - bevel) / (15.5 - bevel)) * (0.1531 - (-0.0906))
    // 8/16 leaves 13.5% of the visible leg cream over 86.5% dark — "dark for most
    // of its length", made exact.
    const cream = HULL_BOTTOM_Y - drawn(8)
    expect(drawn(8)).toBeCloseTo(0.15680, 4)
    expect(cream).toBeCloseTo(0.02445, 4)
    expect(cream / HULL_BOTTOM_Y).toBeCloseTo(0.1349, 3)
    // 9/16 is refused: 2.5% of the visible leg, sub-pixel in the portrait, which
    // is `animal-ferret.ts`'s rule — a line you cannot see is a marking the
    // animal does not have.
    expect((HULL_BOTTOM_Y - drawn(9)) / HULL_BOTTOM_Y).toBeLessThan(0.03)
    // And 8/16 is the pack's own half, which the choice never used to get there.
    expect(feature('leg').paint.patch!.at).toBe(0.5)
    // The three constraints, each one stated where it bites. (1) nothing on this
    // animal carries a patch and a byBand at once — the hull BANDS and does not
    // patch, which is why "one cell, one picture" cannot fire.
    for (const p of [SHEEP_ASSEMBLY.hull.paint, ...SHEEP_ASSEMBLY.features.map(f => f.paint)]) {
      expect(p.patch === undefined || p.byBand === undefined,
        `${p.base} carries a patch and a byBand at once`).toBe(true)
    }
    expect(SHEEP_ASSEMBLY.hull.paint.byBand).toEqual({ 3: 'face' })
    expect(SHEEP_ASSEMBLY.hull.paint.patch).toBeUndefined()
    const patched = [SHEEP_ASSEMBLY.hull.paint, ...SHEEP_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.patch).map(p => p.base)
    expect(patched).toEqual(['limb'])
    // (2) a spun boundary rakes, and the leg row has no `spin` field to reach for.
    expect(feature('leg').spin).toBeUndefined()
    expect(feature('leg').part).toBe(LEG_ROW.part)
  })

  it('DRAWS it — eight texel rows of fleece over eight of leg, off the image', () => {
    // The exact pin: `at` is a claim about a definition, this is the picture the
    // definition produced. Read off the built texture, not off the spec.
    const g = build()
    const tex = ((g.getObjectByName('hull') as THREE.Mesh).material as
      THREE.MeshStandardMaterial).map!
    const img = tex.image as ImageData
    const slots = Object.keys(SHEEP_ASSEMBLY.palette)
    expect(img.height).toBe(slots.length * SLOT_PX)
    const rowHex = (row: number): number => {
      const o = row * img.width * 4
      return (img.data[o]! << 16) | (img.data[o + 1]! << 8) | img.data[o + 2]!
    }
    const limb = slots.indexOf('limb')
    for (let k = 0; k < SLOT_PX; k++) {
      const want = k < 8 ? SHEEP_ASSEMBLY.palette['face'] : SHEEP_ASSEMBLY.palette['limb']
      expect(rowHex(limb * SLOT_PX + k), `limb cell row ${k}`).toBe(want)
    }
    // Every other cell is ONE flat colour — rule 8, and it is what makes the one
    // above visible as a decision rather than as noise. The hull's dark face is a
    // BAND and not a line, so the coat cell is flat too.
    for (const name of ['coat', 'face', 'pupil']) {
      const i = slots.indexOf(name)
      const seen = new Set<number>()
      for (let k = 0; k < SLOT_PX; k++) seen.add(rowHex(i * SLOT_PX + k))
      expect([...seen], `${name} is not one flat colour`).toEqual([SHEEP_ASSEMBLY.palette[name]!])
    }
    expect(SHEEP_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
  })
})

/* ===================================================================== *
 * 4. THE DARK FACE, AND THE HEAD RULE 3 DOES NOT LEAVE
 * ===================================================================== */

describe('animal-sheep: the face is band 3, because there is no head to paint', () => {
  it('is 37 triangles that Kenney already cut: 31 muzzle, 6 underline', () => {
    const hull = partById('box-41')!
    const three = [...hull.bands.keys()].filter(t => hull.bands[t] === 3)
    expect(three).toHaveLength(37)
    const at = (t: number, k: number, a: number): number =>
      hull.positions[hull.indices[t * 3 + k]! * 3 + a]!
    const front = three.filter(t => Math.min(at(t, 0, 2), at(t, 1, 2), at(t, 2, 2)) > 0.5)
    expect(front).toHaveLength(31)
    expect(three.length - front.length).toBe(6)
    // The muzzle group is a patch 0.625 across and 0.400 tall on the front plate,
    // with the 0.400-wide boss rising 0.100 out of the middle of it.
    const fp = new Set<number>()
    for (const t of front) for (let k = 0; k < 3; k++) fp.add(hull.indices[t * 3 + k]!)
    const ext = (a: number): [number, number] => [
      Math.min(...[...fp].map(v => hull.positions[v * 3 + a]!)),
      Math.max(...[...fp].map(v => hull.positions[v * 3 + a]!)),
    ]
    expect(ext(0)).toEqual([-0.3125, 0.3125])
    expect(ext(1)[1]! - ext(1)[0]!).toBeCloseTo(0.4, 6)
    expect(ext(2)).toEqual([0.575, 0.675])
    // The band, spent. One entry, no geometry, and the opposite animal to the
    // horse's, which paints the same 37 triangles PALE for a mealy muzzle.
    expect(SHEEP_ASSEMBLY.hull.paint).toEqual({ base: 'coat', byBand: { 3: 'face' } })
  })

  it('takes the boss AS the muzzle, and refuses both the plate and a snout', () => {
    // No snout at all. `frame.front` on this shell is the BOSS's own 0.725, which
    // is 0.090 in front of the absolute eye plane, so every 0.532 barrel the
    // horse and the pony wear stands forward of both eye cards here. A sheep's
    // face is short where a horse's is long, so this costs the animal nothing.
    expect(SHEEP_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
    for (const id of ['tube-03', 'tube-06', 'tube-07']) {
      expect(SHEEP_ASSEMBLY.features.some(f => f.part === id), id).toBe(false)
    }
    const bossZ = partById('box-41')!.offset[2]! + partById('box-41')!.size[2]! / 2
    expect(bossZ).toBeCloseTo(0.725, 6)
    expect(bossZ - EYE_CARD_Z).toBeCloseTo(0.09, 6)
    // `blade-05` REFUSED with the number that refuses it: the lion's 1.000 x
    // 1.000 muzzle plate is 18 triangles and would span the whole of both cards
    // in front of the eye plane. It does not occlude the eyes, it deletes them.
    const plate = partById('blade-05')!
    expect(plate.size[0]! / 2).toBeGreaterThan(partById('plate-01')!.offset[0]! + 0.2)
    expect(SHEEP_ASSEMBLY.features.some(f => f.part === 'blade-05')).toBe(false)
    // The nose sits on the boss's own vertical centre, so its whole width is
    // backed: the octagon is 0.1688 wide at the nose's lowest row and the nose is
    // 0.1144 half-wide. NOT the donor's 0.832178, which would overhang the apex.
    const at = feature('nose').placement
    if (at.kind === 'single') expect(at.at).toEqual([0, 0.69375, 0.725])
    expect(partById('box-14')!.offset[1]).toBeCloseTo(0.832178, 6)
    expect(feature('nose').part).toBe('box-14')
  })

  it('keeps the pack\'s own almond, unmoved, and says what that costs', () => {
    // Rule 5: an eye is never adjusted, and this species does not adjust one —
    // `eyes` is absent from the definition entirely, so the card, its x and its y
    // are the pack's. It is `plate-01` and not `plate-08` or `plate-14` because
    // the boss stands in front of the inner-lower sliver of whatever card is
    // there, and the almond is the one that loses least to it.
    const card = partById('plate-01')!
    expect(feature('eye').part).toBe('plate-01')
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    // And the card lands 0.010 proud of a REAL plate — CARD_STANDOFF exactly, the
    // same daylight it gets on the cube. This is the half of the pony's, the
    // degu's, the ferret's and the gecko's refusal of `box-41` that was wrong:
    // 0.725 is the boss, and the plate the cards land on is 0.625.
    const plateZ = Math.max(...points('box-41')
      .filter(p => Math.abs(p[0]!) > 0.3 && p[2]! > 0).map(p => p[2]!)) + 0.05
    expect(plateZ).toBeCloseTo(0.625, 6)
    expect(EYE_CARD_Z - plateZ).toBeCloseTo(0.01, 6)
  })
})

/* ===================================================================== *
 * 5. THE EAR ON ITS SIDE, AND THE TAIL'S ONE HEIGHT
 * ===================================================================== */

describe('animal-sheep: the ear is small, sideways, and the cheapest in the bank', () => {
  it('is the fewest-vertex ear of the sixteen, and unspent by anybody', () => {
    const ears = [...new Set(PARTS_BANK.filter(p => p.roles.includes('ear')).map(p => p.id))]
    const verts = ears.map(id => partById(id)!.verts).sort((a, b) => a - b)
    expect(partById('cone-02')!.verts).toBe(60)
    expect(verts[0]).toBe(60)
    // Against a median of 110 over the sixteen, and against the two the digest
    // shortlisted: `box-02` costs 168 for a nub that shows 0.0700 and points UP.
    const median = (verts[Math.floor((verts.length - 1) / 2)]! + verts[Math.ceil((verts.length - 1) / 2)]!) / 2
    expect(median).toBeGreaterThan(100)
    expect(partById('box-02')!.verts).toBe(168)
    const shown = (id: string, a: 0 | 1 | 2): number =>
      partById(id)!.size[a]! * (1 - partById(id)!.attachment!.sunkFractionMean)
    expect(shown('box-02', 1)).toBeCloseTo(0.07, 4)
    // `tube-04` is the one genuinely side-mounted ear and it is 1.64x longer.
    // Roster §4 gives the camelids their separation on ear; it is left for them.
    expect(partById('tube-04')!.size[1]! / partById('cone-02')!.size[1]!).toBeCloseTo(1.639, 3)
    for (const id of ['box-02', 'box-34', 'tube-04', 'tube-05']) {
      expect(SHEEP_ASSEMBLY.features.some(f => f.part === id), id).toBe(false)
    }
    // The dog's and the pig's, and there is no dog or pig anywhere in the roster.
    expect(partById('cone-02')!.provenance.map(q => q.species).sort()).toEqual(['dog', 'pig'])
  })

  it('wears it on its X axis, buried twice §3\'s floor, standing 0.1807 proud', () => {
    // The whole separation from the horse standing beside it on the same shell:
    // that one joins its ears to the crown ridges pointing UP, this one to the
    // flank pads pointing OUT, and the z is identical.
    expect(feature('ear').axis).toBe('x')
    const ear = partById('cone-02')!
    const buried = ear.attachment!.sunkFractionMean * ear.size[0]!
    expect(buried).toBeCloseTo(0.264726, 5)
    expect(buried).toBeGreaterThan(2 * 0.125)      // §3's nothing-floats floor
    expect(ear.size[0]! - buried).toBeCloseTo(0.180729, 5)
    const at = feature('ear').placement
    if (at.kind === 'pair') {
      // x is `box-41`'s maximum side reach — the flank PAD — so the ear is buried
      // between 0.2147 and 0.2647 wherever the surface actually is.
      expect(at.at[0]).toBe(0.675)
      expect(at.at[0]).toBe(Math.max(...points('box-41').map(p => p[0]!)))
      // y is that pad's own vertical centre, and it lands the ear level with the
      // eye card, which is where a relaxed sheep carries it.
      const pad = points('box-41').filter(p => Math.abs(p[0]! - 0.675) < 1e-6)
      const mid = (Math.min(...pad.map(p => p[1]!)) + Math.max(...pad.map(p => p[1]!))) / 2 + 0.83125
      expect(at.at[1]).toBeCloseTo(mid, 3)
      expect(Math.abs(at.at[1]! - partById('plate-01')!.offset[1]!)).toBeLessThan(0.07)
      // z is 4/16 — the pack's grid, the pony's and the horse's own ear station —
      // and it is inside the pad's own 0.2575 of z.
      expect(at.at[2]).toBe(4 / 16)
      expect(at.at[2]).toBeLessThan(Math.max(...pad.map(p => p[2]!)) + 0.05 + 1e-9)
    }
    // Built: a leaf-shaped flap out of each side, clear of the eye plane behind it.
    const g = build()
    const b = new THREE.Box3().setFromObject(g.getObjectByName('ear-r')!)
    expect(b.max.x).toBeCloseTo(0.855729, 4)
    expect(b.max.z).toBeLessThan(EYE_CARD_Z)
    expect(SHEEP_ASSEMBLY.motion?.map(m => `${m.kind}:${m.parts.join()}`)).toEqual(['twitch:ear'])
  })

  it('hangs the tail in the ONE window where its whole root is on the plate', () => {
    // `box-18` is the elephant's TRUNK under Kenney's wrong name — the only tail
    // shape in the bank attached `z +1`, which is what gives it away.
    const tail = partById('box-18')!
    expect(tail.attachment!.axis).toBe('z')
    expect(tail.attachment!.dir).toBe(1)
    // And it is the shortest-reaching tail in §7's THIN group. The claim needs
    // that qualifier and `animal-hamster.ts`'s "shortest in the bank by 0.130"
    // does not survive being re-measured: the beaver's `wedge-03` reaches 0.4153
    // against this shape's 0.4252 — but `wedge-03` is 0.5885 thick where this is
    // 0.3450, so it is a paddle and not a stub. `assembly-pony.test.ts:379-397`
    // already split the seven on thickness at 0.4 with a 1.7x gap in the middle;
    // inside the thin four this is the shortest, by 0.0417.
    const reach = (id: string): number => partById(id)!.size[2]!
      * (1 - partById(id)!.attachment!.sunkFractionMean)
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    const thin = tails.filter(p => Math.min(...p.size) < 0.4).map(p => p.id)
    expect(thin.sort()).toEqual(['box-18', 'wedge-07', 'wedge-15', 'wedge-18'])
    expect(Math.min(...thin.map(reach))).toBeCloseTo(reach('box-18'), 6)
    const next = thin.filter(id => id !== 'box-18').map(reach).sort((a, b) => a - b)[0]!
    expect(next - reach('box-18')).toBeCloseTo(0.0417, 3)
    expect(feature('tail').spin).toEqual([{ axis: 'y', deg: 180 }])

    // The height is solved and the window is two thousandths wide: this shell's
    // flat rear plate is 0.625 tall and the shape is 0.623004, so the centre must
    // sit inside [0.805252, 0.807248] — and the midpoint of that is the pack's own
    // recorded hull centre for `box-03`, recovered from a solve that never read it.
    const rear = points('box-41').filter(p => p[2]! < -0.6749)
    const plate = [Math.min(...rear.map(p => p[1]!)) + 0.83125, Math.max(...rear.map(p => p[1]!)) + 0.83125]
    expect(plate[1]! - plate[0]!).toBeCloseTo(0.625, 6)
    const lo = plate[0]! + tail.size[1]! / 2, hi = plate[1]! - tail.size[1]! / 2
    expect(hi - lo).toBeCloseTo(0.001996, 5)
    expect((lo + hi) / 2).toBeCloseTo(0.80625, 4)
    expect((lo + hi) / 2).toBeCloseTo(partById('box-03')!.offset[1]!, 4)
    const at = feature('tail').placement
    if (at.kind === 'single') {
      expect(at.at).toEqual([0, 0.80625, -0.625])
      expect(at.at[1]).toBeGreaterThan(lo)
      expect(at.at[1]).toBeLessThan(hi)
    }
    // The donor's own 0.482248 is NOT taken: on a cube it hangs off the rump's
    // lower chamfer and reaches below the hull's bottom face, which a nub can
    // afford and a sheep's high-set tail cannot.
    expect(tail.offset[1]).toBeCloseTo(0.482248, 6)
    expect(tail.offset[1]! - tail.size[1]! / 2).toBeLessThan(HULL_BOTTOM_Y)
    const g = build()
    const t = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    expect(t.min.y).toBeGreaterThan(HULL_BOTTOM_Y)
    expect(t.max.y).toBeLessThan(plate[1]! + 1e-6)
  })
})

/* ===================================================================== *
 * 6. WHAT THE ISLAND CHARGES FOR IT
 * ===================================================================== */

describe('animal-sheep: what a child names it by, and what it costs', () => {
  it('carries five features and every one of them is doing a job', () => {
    const names = SHEEP_ASSEMBLY.features.map(f => f.name).sort()
    expect(names).toEqual(['ear', 'eye', 'leg', 'nose', 'tail'])
    // Cream, dark face, dark ears, dark legs — three of the four are one palette
    // slot, which is the point: the fleece is carried by colour and by the round
    // shell, and everything else on the animal is dark against it.
    expect(Object.keys(SHEEP_ASSEMBLY.palette)).toEqual(['coat', 'face', 'limb', 'pupil'])
    for (const n of ['ear', 'nose']) expect(feature(n).paint.base).toBe('face')
    expect(feature('tail').paint.base).toBe('coat')
    expect(SHEEP_ASSEMBLY.flag).toBeUndefined()
  })

  it('fits between two trees, and it is the DEPTH that costs, not the width', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The barrel is the
    // shell's own 1.350 plus 0.1807 of ear a side; the tail behind and the nose in
    // front make the depth, and the depth is what the island pays for.
    expect(s.x).toBeCloseTo(1.7115, 3)
    expect(s.z).toBeGreaterThan(s.x)
    // Inside the fox's 1.15, which is the pack's worst and the number the island
    // already copes with, and well inside Farm's own ratchet of 1.38.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    // ROUND, which is the whole of what a fleece is when it is a number: this is
    // the widest width-over-height in the collection and it is the silhouette
    // half of the brief.
    expect(s.x / s.y).toBeGreaterThan(1)
  })
})
