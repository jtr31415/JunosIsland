/**
 * The terrapin — the species built next door to one that is already signed off.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a terrapin can say, and for this
 * animal that is mostly ONE thing said five ways: **it is not the tortoise.**
 *
 * `species-garden.test.ts:261-286` fails silhouette twins, and a terrapin built
 * carelessly IS the Garden tortoise — same shelled body, same short legs, same
 * absent ears. So this file compares the two builds directly, part by part and
 * number by number, and every divergence in `animal-terrapin.ts`'s header is
 * asserted here rather than claimed there. If a later edit walks this species back
 * toward the tortoise, this file goes red before anybody has to notice by eye.
 *
 * It also pins the four things a reader must not have to take on trust:
 *
 *   1. **`box-31` is the only hull whose BODY is wider than it is deep**, and its
 *      front face is a full 1.000 square where every other hull's is 0.625. Both
 *      are re-derived from the bank's own vertices, because both are the reason
 *      this species is on that hull and not on the cube.
 *   2. **`box-18` is the longest forward reach in the bank**, measured over every
 *      part in it. The neck is a substitute for anatomy the pack does not have, so
 *      the ABSENCE is pinned: bank a longer forward part and this goes red.
 *   3. **`box-11` is the only band that is not square and the only one that is not
 *      a second mass.** Both are measured over all five bands.
 *   4. **The neck and leg striping cannot be drawn**, and that is pinned as a fact
 *      about the BANK and the MECHANISM rather than as an opinion in a comment.
 *   5. **`box-31` HAS NO FRONT FACE, and `blade-05` is what closes it.** Both the
 *      hole and the cover are re-derived from geometry here — see the last
 *      `describe`, which also records why no other test in the suite could see it.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, TERRAPIN_ASSEMBLY, TORTOISE_ASSEMBLY,
  LEG_ROW, HULL_BOTTOM_Y, HEIGHT_FLOOR, PACK_HEIGHT_MIN, EYE_CARD_Z, SLOT_PX,
  HULL_FRONT_Z_USUAL, CARD_STANDOFF,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-terrapin',
  parts: [
    'blade-05', 'box-01', 'box-11', 'box-18', 'box-31', 'cone-01',
    'plate-08', 'plate-10', 'tube-06', 'tube-08',
  ],
  // HEIGHT_FLOOR exactly, and that is the animal: nothing at all stands on top of
  // this hull. The tortoise is 1.48125 and every millimetre of the difference is
  // its scutes. If a ridge is ever added here, this number moves and says so.
  height: 1.43125,
  verts: 450,
  tris: 599,
  // Stronger than the generic 3 by only a tenth, and deliberately stated: the
  // shell shelf is the largest feature any assembled species wears, and it is the
  // ONLY band in the bank that clears rule 3 at the size Kenney drew it.
  massRatio: 3.1,
  // The shell's quarter turn onto the horizontal, and the tail's onto the rear.
  // The neck is NOT spun — that is the whole point of it — so this is 2 and not 3.
  spinsAtLeast: 2,
})

const build = (id = 'animal-terrapin'): THREE.Group => {
  const g = buildAssembled(id)
  g.updateMatrixWorld(true)
  return g
}
const box = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string) => TERRAPIN_ASSEMBLY.features.find(f => f.name === name)!
const whole = (g: THREE.Group): THREE.Box3 => new THREE.Box3().setFromObject(g)

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** How far a face reaches in x and y, at the extreme of z. */
const faceReach = (id: string, sign: 1 | -1): [number, number] => {
  const q = points(id)
  const z = sign > 0 ? Math.max(...q.map(p => p[2])) : Math.min(...q.map(p => p[2]))
  const on = q.filter(p => Math.abs(p[2] - z) < 1e-6)
  return [Math.max(...on.map(p => Math.abs(p[0]))), Math.max(...on.map(p => Math.abs(p[1])))]
}

/** A band's bounding volume when it is laid FLAT — the thin axis onto y. */
const flatVolume = (id: string): number => {
  const s = partById(id)!.size
  return s[0]! * s[1]! * s[2]!
}

describe('animal-terrapin: IT IS NOT THE TORTOISE, and here is the measurement', () => {
  it('shares no shell, no scute and no hull with it — only the leg and one shape', () => {
    const mine = new Set([TERRAPIN_ASSEMBLY.hull.part,
      ...TERRAPIN_ASSEMBLY.features.map(f => f.part)])
    const theirs = new Set([TORTOISE_ASSEMBLY.hull.part,
      ...TORTOISE_ASSEMBLY.features.map(f => f.part)])
    // The tortoise's whole shell vocabulary is absent here. If either of these
    // ever appears on this species, it has become the animal it was built against.
    expect(mine.has('box-19'), 'wearing the tortoise\'s shell ring').toBe(false)
    expect(mine.has('wedge-08'), 'wearing the tortoise\'s scutes').toBe(false)
    expect(mine.has('box-03'), 'wearing the tortoise\'s hull').toBe(false)
    // And its own vocabulary is absent there — so neither is a superset.
    for (const id of ['box-11', 'box-31', 'tube-06', 'tube-08', 'cone-01', 'plate-08']) {
      expect(theirs.has(id), `the tortoise already wears ${id}`).toBe(false)
    }
    // What they share is the pack's universal leg and ONE shape, inverted below.
    expect([...mine].filter(p => theirs.has(p)).sort()).toEqual(['box-01', 'box-18'])
  })

  it('wears the ONE shared shape at the opposite end, facing the opposite way', () => {
    // §3.1: a part's identity is where you put it. `box-18` is the elephant's
    // TRUNK under Kenney's wrong name; the tortoise spins it 180 degrees to make a
    // stub tail off its rump, and this animal leaves it alone so it points FORWARD
    // as a neck. Same shape, opposite end, opposite facing — which is the cheapest
    // and most complete divergence two shelled animals can have.
    const theirs = TORTOISE_ASSEMBLY.features.find(f => f.part === 'box-18')!
    const mine = feature('neck')
    expect(mine.part).toBe('box-18')
    expect(theirs.name).toBe('tail')
    expect(theirs.spin).toEqual([{ axis: 'y', deg: 180 }])
    expect(mine.spin, 'the neck is spun — it must not be').toBeUndefined()
    if (theirs.placement.kind === 'single') expect(theirs.placement.at[2]).toBe(-0.625)
    if (mine.placement.kind === 'single') expect(mine.placement.at[2]).toBe(0.5)
    // Measured off the built animals rather than off the specs: one is behind its
    // hull and one is in front of it.
    const t = build('animal-tortoise')
    expect(box(t, 'tail').max.z).toBeLessThan(box(t, 'hull').min.z + 1e-6)
    const g = build()
    expect(box(g, 'neck').min.z).toBeGreaterThanOrEqual(box(g, 'hull').max.z - 1e-6)
  })

  it('reaches 0.765 in front of its own hull where the tortoise reaches nothing', () => {
    // THE measured axis of separation. The tortoise has no face part at all: its
    // frontmost geometry is its own shell ring, 0.077 proud of a 0.625 front face.
    // This animal carries a neck, a head and a snout tip, and they are 2.07 times
    // the deepest face in the pack (the badger's muzzle plus nose, 0.370).
    const t = build('animal-tortoise'), g = build()
    const theirs = whole(t).max.z - box(t, 'hull').max.z
    const mine = whole(g).max.z - box(g, 'hull').max.z
    expect(theirs).toBeCloseTo(0.077, 3)
    expect(mine).toBeCloseTo(0.7647, 3)
    expect(mine / theirs).toBeGreaterThan(9)
    // And it is not the hull doing it: this hull is SHALLOWER than the tortoise's.
    expect(partById('box-31')!.size[2]!).toBeLessThan(partById('box-03')!.size[2]!)
  })

  it('stands on HEIGHT_FLOOR exactly, because it declines the chamfer idiom', () => {
    // §8's idiom exists to make a cubic back read ROUND, and the tortoise spends
    // twelve plates on it because a tortoise is a dome. A slider's carapace is flat,
    // so this species buys none — and the price of the dome is exactly the height:
    // the tortoise's scutes are 0.050 proud and are the whole of its 1.48125.
    const g = build(), t = build('animal-tortoise')
    expect(whole(g).max.y).toBeCloseTo(HEIGHT_FLOOR, 4)
    expect(whole(t).max.y - whole(g).max.y).toBeCloseTo(0.05, 4)
    // Nothing at all sits above the hull. Said structurally as well as by height,
    // so a ridge cannot be added back without failing here first.
    expect(box(g, 'hull').max.y).toBeCloseTo(whole(g).max.y, 4)
    expect(TERRAPIN_ASSEMBLY.features.some(f => f.name.startsWith('spike')
      || f.name.startsWith('scute'))).toBe(false)
    expect(TERRAPIN_ASSEMBLY.features.every(f => f.placement.kind !== 'row'
      || f.name === 'leg')).toBe(true)
  })
})

describe('animal-terrapin: box-31 is the one hull wider than it is deep', () => {
  it('is one of exactly two, and the other one\'s width is EARS', () => {
    const hulls = PARTS_BANK.filter(p => p.roles.includes('hull'))
    expect(hulls.filter(p => p.size[0]! > p.size[2]!).map(p => p.id).sort())
      .toEqual(['box-12', 'box-31'])
    expect(TERRAPIN_ASSEMBLY.hull.part).toBe('box-31')
    // `box-12` is the badger's finding and it is why this species is not on it:
    // through the body — at or behind the flat front face's own reach — it is
    // exactly as wide as the cube, and all 0.289 of its extra is two fused EAR
    // LUGS. A hull that is not actually wider, arriving with ears a turtle has not.
    const body = points('box-12').filter(q => Math.abs(q[2]) <= 0.3125)
    expect(Math.max(...body.map(q => Math.abs(q[0])))).toBeCloseTo(0.625, 6)
    expect(partById('box-31')!.size[0]).toBeCloseTo(1.25, 6)
    expect(partById('box-31')!.size[2]).toBeCloseTo(1.125, 6)
  })

  it('has a 1.000-square FRONT face, which is what makes the neck transfer legal', () => {
    // The reason this hull was chosen rather than a consequence of it. `box-03`
    // cuts every edge and every corner, so its flat front face is 0.625 square;
    // `box-31` is the cube MINUS four corners and its front four points are the
    // (+/-0.5, +/-0.5, 0.5625), so its front face is a full 1.000.
    expect(faceReach('box-31', 1)).toEqual([0.5, 0.5])
    expect(faceReach('box-03', 1)).toEqual([0.3125, 0.3125])
    // Its REAR face is the usual 0.625, which is why the tail needs a height of
    // its own below and the neck does not.
    expect(faceReach('box-31', -1)).toEqual([0.3125, 0.3125])
  })

  it('takes the pack\'s eye plane unmoved, floating 0.135 proud, as the lion does', () => {
    // `hulls.ts` is explicit that this is not a fault to be corrected: 0.6350 is
    // the lion's own eye card on the lion's own hull.
    const g = build()
    expect(box(g, 'hull').max.z).toBeCloseTo(0.5, 4)
    expect(box(g, 'eye-r').max.z).toBeCloseTo(EYE_CARD_Z, 4)
    expect(EYE_CARD_Z - 0.5).toBeCloseTo(0.135, 4)
  })
})

describe('animal-terrapin: the neck is the elephant\'s TRUNK, worn forwards', () => {
  it('is the longest forward reach in the BANK — measured over every part in it', () => {
    // The bank has no neck (§5 names "long neck" among the missing), so this is a
    // substitute and the absence is pinned rather than described. Reach is how far
    // a part carries away from the face it joins, which is its extent less its own
    // measured burial.
    const forward = PARTS_BANK
      .filter(p => p.attachment?.axis === 'z' && p.attachment.dir === 1)
      .map(p => ({ id: p.id, reach: p.size[2]! * (1 - p.attachment!.sunkFractionMean) }))
      .sort((a, b) => b.reach - a.reach)
    expect(forward[0]!.id, 'a longer forward part has been banked — reconsider the neck')
      .toBe('box-18')
    expect(forward[0]!.reach).toBeCloseTo(0.425211, 6)
    // And by a clear margin: the runner-up is the elephant's tusk at 0.278, and
    // the deepest muzzle in the pack is 0.231.
    expect(forward[1]!.reach).toBeLessThan(0.28)
    expect(partById('tube-06')!.size[2]).toBeCloseTo(0.23142, 5)
  })

  it('is placed by the donor transfer alone — the face, the y and the sink are the pack\'s', () => {
    const trunk = partById('box-18')!
    // Kenney's node was called `tail`; the bank inherited the name and the badger
    // recorded that it is really the TRUNK. Its attachment is the proof, and it is
    // the only tail-roled shape in the bank that faces forward.
    expect(trunk.roles).toEqual(['tail'])
    expect(trunk.provenance[0]!.species).toBe('elephant')
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    const neck = feature('neck')
    // Nothing chosen: this hull's front face, the elephant's own recorded height,
    // the elephant's own measured burial of nothing at all.
    if (neck.placement.kind === 'single') {
      expect(neck.placement.at).toEqual([0, trunk.offset[1], 0.5])
    }
    expect(neck.sink).toBe(trunk.attachment!.sunkFractionMean)
    expect(neck.sink).toBe(0)
  })

  it('is halved in HEIGHT only, and that is what makes the elephant\'s own y legal', () => {
    const trunk = partById('box-18')!
    const neck = feature('neck')
    expect(neck.stretch).toEqual([1, 0.5, 1])
    // At its own 0.623004 the root would span 0.170746 to 0.793750 — 0.1355 below
    // the flat front face's lowest line, and below this hull's own bottom as well,
    // so it would hang through the belly. §3, nothing floats, as arithmetic.
    const flatBottom = 0.80625 - 0.5
    expect(trunk.offset[1]! - trunk.size[1]! / 2).toBeCloseTo(0.170746, 6)
    expect(trunk.offset[1]! - trunk.size[1]! / 2).toBeLessThan(flatBottom)
    expect(trunk.offset[1]! - trunk.size[1]! / 2).toBeLessThan(HULL_BOTTOM_Y)
    // Halved, the whole join plane is on flat geometry with 0.0202 to spare.
    const g = build()
    const neckBox = box(g, 'neck')
    // Four decimals, not more: the built attribute is float32 and puts the pack's
    // 0.326497 back as 0.326468 — the noise floor, not a disagreement.
    expect(neckBox.min.y).toBeCloseTo(0.326497, 4)
    expect(neckBox.min.y - flatBottom).toBeCloseTo(0.020247, 4)
    expect(neckBox.max.y).toBeLessThan(0.80625 + 0.5)
    // And its LENGTH is not stretched at all: 0.425211 is the bank's own number.
    expect(neckBox.max.z - neckBox.min.z).toBeCloseTo(trunk.size[2]!, 4)
    // A trunk hangs and is tall in section; a neck reaches and is round in one.
    const donorSection = trunk.size[0]! / trunk.size[1]!
    const mineSection = (neckBox.max.x - neckBox.min.x) / (neckBox.max.y - neckBox.min.y)
    expect(donorSection).toBeCloseTo(0.554, 3)
    expect(mineSection).toBeCloseTo(1.1075, 4)
  })

  it('hangs a head and then a snout tip on planes it SOLVED, not on numbers', () => {
    const g = build()
    // Each joint is measured off the previous feature's built outer face, so a
    // head or a snout that floats or buries is a thing that cannot happen quietly.
    expect((g.getObjectByName('head')!.userData['joinedAt'] as number[])[2])
      .toBeCloseTo(box(g, 'neck').max.z, 6)
    expect((g.getObjectByName('snout-tip')!.userData['joinedAt'] as number[])[2])
      .toBeCloseTo(box(g, 'head').max.z, 6)
    expect(feature('head').placement.kind).toBe('single')
    // A head is wider than the neck that carries it and no taller. Both measured.
    const n = box(g, 'neck').getSize(new THREE.Vector3())
    const h = box(g, 'head').getSize(new THREE.Vector3())
    expect(h.x / n.x).toBeCloseTo(1.542, 3)
    expect(h.y / n.y).toBeLessThan(1)
    // And the tip is narrower than the head, so the face ends in a point rather
    // than in a flat wall.
    expect(box(g, 'snout-tip').getSize(new THREE.Vector3()).x / h.x).toBeCloseTo(0.44, 2)
  })

  it('cuts its jaw line at Kenney\'s OWN band, and adds no geometry for a mouth', () => {
    // Band 3 is the LOWER half of the fox's muzzle and band 7 the upper — the
    // badger measured it, and getting it backwards is invisible in a definition.
    // On a fox that line is the underside of a snout; on a terrapin it is the BEAK.
    const p = partById('tube-06')!
    const meanY = (band: number): number => {
      const ys: number[] = []
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) ys.push(p.positions[p.indices[t * 3 + k]! * 3 + 1]!)
      }
      return ys.reduce((a, b) => a + b, 0) / ys.length
    }
    expect(meanY(3)).toBeLessThan(meanY(7))
    expect(feature('head').paint).toEqual({ base: 'limb', byBand: { 3: 'belly' } })
    // No card was spent on it, and no triangle either.
    expect(TERRAPIN_ASSEMBLY.features.some(f => f.part === 'plate-13')).toBe(false)
    const mesh = build().getObjectByName('head') as THREE.Mesh
    expect(mesh.geometry.getIndex()!.count / 3).toBe(p.tris)
  })

  it('passes BELOW the eye cards, which is why the eyes never had to move', () => {
    const g = build()
    // 0.056 of daylight between the top of the neck and the bottom of the eye.
    // Rule 5 makes an eye's z unsayable, so a neck that crossed the face would be
    // unfixable; this one is the fox's own arrangement instead.
    expect(box(g, 'eye-r').min.y - box(g, 'neck').max.y).toBeCloseTo(0.0557, 3)
    expect(box(g, 'head').max.y).toBeLessThan(box(g, 'eye-r').min.y)
  })
})

describe('animal-terrapin: the shell is the only band that is not a second mass', () => {
  it('is the ONLY one of the five that is not square — aspect 1.647 against 1.000', () => {
    const bands = PARTS_BANK.filter(p => p.roles.includes('band'))
    expect(bands.map(p => p.id).sort()).toEqual(['box-04', 'box-11', 'box-19', 'box-29', 'box-35'])
    for (const b of bands) {
      const aspect = Math.max(b.size[0]!, b.size[1]!) / Math.min(b.size[0]!, b.size[1]!)
      if (b.id === 'box-11') expect(aspect).toBeCloseTo(1.647318, 6)
      else expect(aspect, `${b.id} is not square after all`).toBeCloseTo(1, 6)
    }
    // A dome seen from above is a circle; a slider's carapace is an ellipse. The
    // one band that is measurably an ellipse is the one this animal wears.
    expect(feature('shell').part).toBe('box-11')
  })

  it('is the ONLY one that clears rule 3 at the size Kenney drew it', () => {
    // `assembly-assert.ts` enforces one mass as "the hull is more than 3x the next
    // largest mesh by bounding box". Laid flat, against this hull's own volume:
    const hullVol = 1.25 * 1.25 * 1.125
    const ratios = PARTS_BANK.filter(p => p.roles.includes('band'))
      .map(p => ({ id: p.id, r: hullVol / flatVolume(p.id) }))
    for (const { id, r } of ratios) {
      if (id === 'box-11') expect(r, 'the shell has stopped fitting').toBeGreaterThan(3)
      else expect(r, `${id} would fit too — re-open the choice`).toBeLessThan(3)
    }
    // The tortoise's own ring is 1.71x here, which is why it had to be halved and
    // why halving it is not a tidy-up somebody can undo.
    expect(hullVol / flatVolume('box-19')).toBeCloseTo(1.715, 3)
    expect(hullVol / flatVolume('box-11')).toBeCloseTo(3.113, 3)
    // NOTHING on this shell is stretched. That is the difference the numbers buy.
    expect(feature('shell').stretch).toBeUndefined()
    expect(TORTOISE_ASSEMBLY.features.find(f => f.part === 'box-19')!.stretch)
      .toEqual([1, 1, 0.5])
  })

  it('is TWO lateral plates, not a ring — a shelf on each flank, notched fore and aft', () => {
    // No point in it comes closer to the midline than 0.3182, so it is not an
    // annulus and it cannot be a belt. Laid flat it stands proud on the flanks and
    // stops short of the body at both ends, which is where a turtle's shell is
    // notched for the neck and the tail.
    expect(Math.min(...points('box-11').map(q => Math.abs(q[0])))).toBeCloseTo(0.3182, 4)
    const g = build()
    const shell = box(g, 'shell'), hull = box(g, 'hull')
    expect(shell.max.x - hull.max.x).toBeCloseTo(0.0972, 3)
    expect(shell.max.z).toBeLessThan(hull.max.z)
    expect(shell.min.z).toBeGreaterThan(hull.min.z)
    // Flat: 1.4445 across, 0.8769 deep, and only 0.4458 thick.
    const s = shell.getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.4445, 3)
    expect(s.z).toBeCloseTo(0.87688, 3)
    expect(s.y).toBeCloseTo(0.445833, 4)
  })

  it('is turned +90 and not -90, so its BROAD end is at the back', () => {
    // The shape is not symmetric end to end and nothing but this measurement says
    // which way round it goes: a quarter turn about x takes local y to world z, so
    // +90 puts the wide end over the hips and narrows the shelf toward the neck.
    expect(feature('shell').spin).toEqual([{ axis: 'x', deg: 90 }])
    const m = build().getObjectByName('shell') as THREE.Mesh
    const a = m.geometry.getAttribute('position')
    let zMin = Infinity, zMax = -Infinity
    for (let i = 0; i < a.count; i++) { zMin = Math.min(zMin, a.getZ(i)); zMax = Math.max(zMax, a.getZ(i)) }
    let atRear = 0, atFront = 0
    for (let i = 0; i < a.count; i++) {
      if (Math.abs(a.getZ(i) - zMin) < 1e-3) atRear = Math.max(atRear, Math.abs(a.getX(i)))
      if (Math.abs(a.getZ(i) - zMax) < 1e-3) atFront = Math.max(atFront, Math.abs(a.getX(i)))
    }
    expect(atRear).toBeCloseTo(0.6152, 3)
    expect(atFront).toBeCloseTo(0.3506, 3)
    expect(atRear).toBeGreaterThan(atFront)
  })

  it('overrides the band\'s axis so the sink measures its THICKNESS, not its span', () => {
    // The tortoise-hoop trick, and it is mechanism rather than style. The band's
    // measured attachment is `y +1`; after the flat turn that points FORWARD, and a
    // sink along it would be measured across the shelf's 0.8769 of span.
    expect(partById('box-11')!.attachment!.axis).toBe('y')
    expect(partById('box-11')!.attachment!.dir).toBe(1)
    const shell = feature('shell')
    expect(shell.axis).toBe('z')
    expect(shell.dir).toBe(-1)
    const m = build().getObjectByName('shell') as THREE.Mesh
    expect((m.userData['facing'] as number[])[1]).toBeCloseTo(1, 6)
    expect(m.userData['extent'] as number).toBeCloseTo(0.445833, 4)
  })

  it('is joined on the hull\'s OWN centre, and that is the line the paint changes on', () => {
    // The shell edge and the colour change are one line, by construction, and the
    // line is not a number this file chose: it is `box-31`'s recorded offset and it
    // is 8/16 — the pack's own measured mammal line, and this hull's own equator.
    expect(TERRAPIN_ASSEMBLY.hull.at).toEqual([0, 0.80625, -0.0625])
    expect(TERRAPIN_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    const shell = feature('shell')
    if (shell.placement.kind === 'single') {
      expect(shell.placement.at).toEqual(TERRAPIN_ASSEMBLY.hull.at)
    }
    expect(shell.sink).toBe(0.5)
    const line = HULL_BOTTOM_Y + 0.5 * 1.25
    expect(line).toBeCloseTo(0.80625, 9)
    const b = box(build(), 'shell')
    expect((b.min.y + b.max.y) / 2).toBeCloseTo(line, 4)
    // The tortoise's is 6/16, below this one. Two shelled animals, two lines.
    expect(TORTOISE_ASSEMBLY.hull.paint.patch!.at).toBe(0.375)
  })
})

describe('animal-terrapin: box-13 is refused by ARITHMETIC — do not re-run that search', () => {
  it('cannot reach the pack\'s floor on the crab\'s hull, even raised onto its legs', () => {
    // The flattest shape the pack drew and the obvious answer to "what is shaped
    // like a terrapin". The tortoise already refused it and got the same numbers;
    // this is re-derived only because the commission asked whether the floor still
    // lets it through.
    const crab = partById('box-13')!
    expect(crab.roles).toContain('hull')
    expect(crab.size[1]).toBeCloseTo(0.450556, 6)
    // Where the bank itself puts it: a top at 0.771528, against a floor of 1.43.
    expect(crab.offset[1]! + crab.size[1]! / 2).toBeCloseTo(0.771528, 6)
    expect(crab.offset[1]! + crab.size[1]! / 2).toBeLessThan(PACK_HEIGHT_MIN)
    // And raising it does not help, because the legs are all there is underneath:
    // shell plus a whole unsunk leg is 0.756806, short by a factor of 1.89.
    const best = crab.size[1]! + partById(LEG_ROW.part)!.size[1]!
    expect(best).toBeCloseTo(0.756806, 6)
    expect(PACK_HEIGHT_MIN / best).toBeGreaterThan(1.85)
    expect(TERRAPIN_ASSEMBLY.hull.part).not.toBe('box-13')
  })
})

describe('animal-terrapin: the marking, and the part of it that cannot be drawn', () => {
  it('thins a flank card into a stripe — and the badger\'s finding still holds', () => {
    // The badger measured every card in the pack: none longer than 0.44, none
    // thinner than 1:2.5, "nothing in the pack is a stripe". Re-derived here rather
    // than believed, because this species depends on it being true AND on it not
    // being the whole story.
    for (const c of PARTS_BANK.filter(p => p.roles.includes('card'))) {
      const d = [...c.size].sort((a, b) => b - a)
      expect(d[0]!, `${c.id} is longer than any marking card was`).toBeLessThan(0.44)
      expect(d[0]! / d[1]!, `${c.id} is already thin enough to be a stripe`).toBeLessThan(2.5)
    }
    // What lets this animal have its mark anyway is a difference of SIZE: a
    // badger's stripe needs ~0.6 of run from nose to ear, and a slider's mark is a
    // patch ~0.25 long behind the eye — which `plate-10` already has. Only its
    // height is wrong, and one axis of a ten-triangle flat card is thinned for it.
    const card = partById('plate-10')!
    expect(card.size[2]).toBeCloseTo(0.252879, 6)
    expect(feature('ear-patch').stretch).toEqual([1, 0.25, 1])
    const b = box(build(), 'ear-patch-r').getSize(new THREE.Vector3())
    expect(b.z / b.y, 'the ear patch is no longer a stripe').toBeCloseTo(4.146, 2)
    expect(b.y).toBeCloseTo(0.061, 3)
  })

  it('sits both head marks on stations the BANK recorded, mirrored, not chosen', () => {
    const card = partById('plate-10')!, eye = partById('plate-08')!
    // x: the pack's own flat-card shell, which is EYE_CARD_Z on the other axis and
    // 0.010 of daylight against this hull's 0.625 side face.
    expect(card.offset[0]).toBe(0.635)
    expect(card.offset[0]).toBe(EYE_CARD_Z)
    // z: the card's own recorded station, mirrored front to back — and the mirror
    // lands its front edge exactly on the flat side face's own edge, because Kenney
    // sized these cards to a 1.250 cube's face in the first place.
    expect(-card.offset[2]!).toBeCloseTo(0.186060, 6)
    expect(-card.offset[2]! + card.size[2]! / 2).toBeCloseTo(0.3125, 4)
    // y: the red one at the height of the eye this animal actually wears, the pale
    // one at the card's own. Neither was invented, and they do not touch.
    const red = feature('ear-patch'), pale = feature('head-stripe')
    if (red.placement.kind === 'pair') expect(red.placement.at[1]).toBe(eye.offset[1])
    if (pale.placement.kind === 'pair') expect(pale.placement.at[1]).toBe(card.offset[1])
    const g = build()
    expect(box(g, 'head-stripe-r').min.y - box(g, 'ear-patch-r').max.y)
      .toBeCloseTo(0.0421, 3)
    // Both above the 0.80625 paint line, so both read against the olive coat and
    // not against the pale plastron — which is the whole point of putting them
    // where they are.
    expect(box(g, 'ear-patch-r').min.y).toBeGreaterThan(0.80625)
    expect(red.paint).toEqual({ base: 'mark' })
    expect(pale.paint).toEqual({ base: 'belly' })
  })

  it('has NO CUT to paint the neck or the leg stripes along — measured on both parts', () => {
    // §4's way 1 can only cut where Kenney already cut, and the two parts that
    // need a lengthwise stripe have no cut in them at all. One band each.
    expect(new Set(partById('box-18')!.bands).size, 'the neck has gained a band').toBe(1)
    expect(new Set(partById('box-01')!.bands).size, 'the leg has gained a band').toBe(1)
    expect(partById('box-18')!.bands.length).toBe(80)
  })

  it('cannot patch the limb cell twice, which is the other half of why', () => {
    // §4's way 2 WOULD say it — a level boundary across a horizontal neck is a
    // lengthwise line — but a patch belongs to a SLOT and not to a part, and
    // `assembly.ts` throws rather than letting one cell hold two pictures. The
    // `limb` cell is already spent on the webbed feet.
    const patched = [TERRAPIN_ASSEMBLY.hull.paint, ...TERRAPIN_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.patch !== undefined)
      .map(p => `${p.base}:${p.patch!.below}@${p.patch!.at}`)
    // TWO PICTURES, and the count is deliberately not asserted, because THREE parts
    // ask for them: the hull and the front wall both carry `coat:belly@0.5`, which
    // is the same picture twice and is what `assembly.ts:487` explicitly permits —
    // it throws on a slot patched twice DIFFERENTLY. The wall is the hull's missing
    // face, so wearing the hull's own patch is the point of it.
    expect([...new Set(patched)].sort()).toEqual(['coat:belly@0.5', 'limb:web@0.25'])
    expect(new Set(patched.map(s => s.split(':')[0])).size).toBe(new Set(patched).size)
    // And the parts that read `limb` WITHOUT a patch take the cell's centre row,
    // row 8 of 16, which is above the boundary at 4/16 and is therefore `limb`.
    // Not obvious, load-bearing, and the badger's tail does the same on `coat`.
    expect(0.25 * SLOT_PX).toBeLessThan(SLOT_PX / 2)
    for (const name of ['neck', 'head', 'snout-tip', 'tail']) {
      expect(feature(name).paint.base, `${name} is not on the skin slot`).toBe('limb')
      expect(feature(name).paint.patch, `${name} patches a cell that is already split`)
        .toBeUndefined()
    }
  })

  it('flags all of that where Joe reads it, and authors nothing to fake it', () => {
    const flag = TERRAPIN_ASSEMBLY.flag!
    expect(flag).toBeDefined()
    expect(flag).toMatch(/CANNOT BE DRAWN/)
    expect(flag).toMatch(/box-18/)
    expect(flag).toMatch(/box-11/)
    expect(flag).toMatch(/box-13/)
    expect(flag).toMatch(/HALF-ANSWERED/)
    // Flagged for the striping and for nothing else: no bespoke shape, and no
    // budget declared, because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(TERRAPIN_ASSEMBLY.features.every(f => !f.part.startsWith('bespoke-'))).toBe(true)
  })
})

describe('animal-terrapin: the feet, the tail and the room it takes up', () => {
  it('wears JT-044\'s two-tone leg as WEBBED FEET, on the pack\'s 1/16 grid', () => {
    const leg = feature('leg')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') expect(leg.placement.from[1]).toBe(LEG_ROW.y)
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'web', at: 0.25 } })
    // `at` is a fraction of the LEG's own height and must be k/16 or texture.ts
    // refuses it. The arithmetic, recorded because it is what makes it read: the
    // dark covers 42.2% of the leg that actually shows below the hull.
    expect(0.25 * SLOT_PX).toBe(4)
    const legPart = partById(LEG_ROW.part)!
    expect(0.25 * legPart.size[1]!).toBeCloseTo(0.0765625, 9)
    expect(0.25 * legPart.size[1]! / HULL_BOTTOM_Y).toBeCloseTo(0.4224, 3)
    // It is a COLOUR and not a paddle, and the bank agrees: nothing in it is a foot.
    expect(PARTS_BANK.some(p => p.roles.includes('claw' as never))).toBe(false)
  })

  it('carries a SHORT tail — the bee\'s spike, sunk the pack\'s own embed floor', () => {
    const spike = partById('cone-01')!
    // §3: "every eared species embeds its ear into the hull, by at least 0.125".
    // This shape's measured burial IS that number, to the unit.
    expect(spike.attachment!.sunkUnitsMean).toBeCloseTo(0.125, 6)
    expect(feature('tail').sink).toBe(spike.attachment!.sunkFractionMean)
    const g = build()
    const reach = box(g, 'hull').min.z - box(g, 'tail').min.z
    expect(reach).toBeCloseTo(0.275356, 4)
    // Short against the tortoise's stub, which is itself the bank's shortest tail.
    const t = build('animal-tortoise')
    expect(reach / (box(t, 'hull').min.z - box(t, 'tail').min.z)).toBeCloseTo(0.648, 2)
    // Its height is derived off this hull's flat REAR face, not chosen: the tail's
    // underside sits exactly on the lowest line that face reaches.
    expect(box(g, 'tail').min.y).toBeCloseTo(0.80625 - 0.3125, 4)
    expect(feature('tail').spin).toEqual([{ axis: 'x', deg: -90 }])
  })

  it('takes the ROUND eye card and deliberately not the largest one', () => {
    const eye = feature('eye')
    expect(eye.part).toBe('plate-08')
    const card = partById('plate-08')!
    expect(card.size[0]).toBe(card.size[1])            // round, which a turtle's is
    expect(eye.stretch).toBeUndefined()
    // `plate-14` is the pack's largest at 0.4355 x 0.4426 and belongs to whichever
    // sibling this collection actually calls big-eyed. That is the gecko.
    const largest = PARTS_BANK.filter(p => p.roles.includes('eye'))
      .sort((a, b) => b.size[0]! * b.size[1]! - a.size[0]! * a.size[1]!)[0]!
    expect(largest.id).toBe('plate-14')
    expect(TERRAPIN_ASSEMBLY.features.some(f => f.part === 'plate-14')).toBe(false)
  })

  it('closes the hull\'s open front, and the plate\'s front lands on the pack\'s own plane', () => {
    // The summary; the derivation is the last describe. Stated here too because
    // this is the block a reader checks the animal's dimensions in, and the plate
    // costs NONE of them: it is entirely inside the box the animal already had.
    const g = build()
    const wall = box(g, 'front-wall'), hull = box(g, 'hull')
    expect(wall.min.z).toBeCloseTo(hull.max.z, 4)            // joined at 0.500
    expect(wall.max.z).toBeCloseTo(HULL_FRONT_Z_USUAL, 4)    // and ends on 0.625
    // Which restores the eye card's usual 0.010 of daylight — CARD_STANDOFF, the
    // pack's own — where the bare hull left it floating 0.135 proud.
    expect(EYE_CARD_Z - wall.max.z).toBeCloseTo(CARD_STANDOFF, 4)
    expect(feature('front-wall').sink).toBe(partById('blade-05')!.attachment!.sunkFractionMean)
    expect(feature('front-wall').sink).toBe(0)
    // It is 1.000 square centred on the hull's own line, so the patch boundary is
    // the carapace line by construction and not by aim.
    const s = wall.getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1, 4)
    expect(s.y).toBeCloseTo(1, 4)
    expect((wall.min.y + wall.max.y) / 2).toBeCloseTo(0.80625, 4)
    expect(feature('front-wall').paint).toEqual(TERRAPIN_ASSEMBLY.hull.paint)
    // And Kenney's band 5 — the lion's mouth, which the frog repaints as its grin —
    // is left alone. This animal's mouth is the beak line on its head.
    expect(feature('front-wall').paint.byBand).toBeUndefined()
  })

  it('fits between two trees — the neck costs depth, and it is still under the fox\'s', () => {
    const s = whole(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. Here the DEPTH
    // binds and the width does not: the shell shelf is 1.4445 across, but the neck,
    // head and tail make 2.165 of length.
    expect(s.x).toBeCloseTo(1.4445, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.083, 3)
    // Inside the fox's own 1.15, which is the pack's worst and the number the
    // island already copes with. This is what the shallower hull bought.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})

/* ------------------------------------------------------------------------- */

/**
 * THE HOLE IN THE HULL, AND WHY NOTHING ELSE IN THE SUITE COULD HAVE SEEN IT.
 *
 * `box-31` has no front face. Its 50 triangles leave four edges used by exactly
 * ONE triangle each — the (+/-0.5, +/-0.5, 0.5625) square — and no triangle at all
 * lies in that plane. The assembly material is `MeshStandardMaterial` built with
 * `map`, `metalness` and `roughness` and no `side` (`assembly.ts:509`), so it is
 * `THREE.FrontSide` by default: the inside of the shell is culled and a child
 * looking at the animal's chest sees the sky through it.
 *
 * **Every invariant in `assembly-assert.ts` passes with the hole wide open**, and
 * that is not an oversight in it — it is the class of fault none of its eight
 * checks is shaped to catch:
 *
 *   - the height check reads a BOUNDING BOX, and a missing face does not move one;
 *   - the one-mass check compares bounding-box VOLUMES, likewise;
 *   - the lineage check matches each mesh's VERTICES to the bank record — and the
 *     hull is a faithful copy of `box-31`, hole and all, so it passes correctly;
 *   - the budgets count triangles, and a hole has fewer, which is never red;
 *   - `groupFingerprint` hashes what WAS built and pins drift, so it froze the hole
 *     in place rather than reporting it.
 *
 * A hole is a property of the SURFACE, so it takes a surface test, and this is the
 * cheapest honest one: weld the built hull's vertices by position, count how many
 * triangles use each edge, and rasterise the resulting loop to ask how much of it
 * has geometry in front of it. Both halves are re-derived here from the built
 * meshes rather than read off the spec.
 *
 * The three shipped Garden species on this hull — shrew, newt and frog — are NOT
 * this file's business and are not touched by it. Recorded so the next reader
 * knows the question was asked: measured the same way, the frog covers 97.7% (it
 * wears `blade-05` already, for its mouth), the shrew 30.8% and the newt 20.1%.
 */
describe('animal-terrapin: box-31 has no front face, and blade-05 is the face', () => {
  /**
   * Edges used by anything other than two triangles, welded by position and
   * reported in WORLD space — where the child is, and where the aperture has to
   * line up with the plate that covers it.
   */
  const openEdges = (m: THREE.Mesh): [number, number, number][][] => {
    const a = m.geometry.getAttribute('position')
    const ix = m.geometry.getIndex()!
    const id = new Map<string, number>()
    const at: [number, number, number][] = []
    const w: number[] = []
    const p = new THREE.Vector3()
    for (let i = 0; i < a.count; i++) {
      p.fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld)
      const k = [p.x, p.y, p.z].map(v => Math.round(v * 1e4) / 1e4).join(',')
      if (!id.has(k)) { id.set(k, at.length); at.push([p.x, p.y, p.z]) }
      w[i] = id.get(k)!
    }
    const n = new Map<string, number>()
    for (let t = 0; t < ix.count; t += 3) {
      const v = [w[ix.getX(t)]!, w[ix.getX(t + 1)]!, w[ix.getX(t + 2)]!]
      for (const [p, q] of [[v[0]!, v[1]!], [v[1]!, v[2]!], [v[2]!, v[0]!]]) {
        if (p === q) continue
        const key = p! < q! ? `${p}|${q}` : `${q}|${p}`
        n.set(key, (n.get(key) ?? 0) + 1)
      }
    }
    const out: [number, number, number][][] = []
    for (const [key, count] of n) {
      if (count === 2) continue
      const [p, q] = key.split('|').map(Number)
      out.push([at[p!]!, at[q!]!])
    }
    return out
  }

  /** Does the +z ray from (x, y, z0) meet this triangle at some z beyond z0? */
  const inFront = (
    t: [number, number, number][], x: number, y: number, z0: number,
  ): boolean => {
    const A = t[0]!, B = t[1]!, C = t[2]!
    const d = (B[0]! - A[0]!) * (C[1]! - A[1]!) - (C[0]! - A[0]!) * (B[1]! - A[1]!)
    if (Math.abs(d) < 1e-12) return false
    const u = ((x - A[0]!) * (C[1]! - A[1]!) - (C[0]! - A[0]!) * (y - A[1]!)) / d
    const v = ((B[0]! - A[0]!) * (y - A[1]!) - (x - A[0]!) * (B[1]! - A[1]!)) / d
    if (u < 0 || v < 0 || u + v > 1) return false
    return A[2]! + u * (B[2]! - A[2]!) + v * (C[2]! - A[2]!) > z0 + 1e-4
  }

  /** Every triangle of every mesh except the hull, in world space. */
  const coverTris = (g: THREE.Group): [number, number, number][][] => {
    const out: [number, number, number][][] = []
    const p = new THREE.Vector3()
    g.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || m.name === 'hull') return
      const a = m.geometry.getAttribute('position')
      const ix = m.geometry.getIndex()!
      const w: [number, number, number][] = []
      for (let i = 0; i < a.count; i++) {
        p.fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld)
        w.push([p.x, p.y, p.z])
      }
      for (let t = 0; t < ix.count; t += 3) {
        out.push([w[ix.getX(t)]!, w[ix.getX(t + 1)]!, w[ix.getX(t + 2)]!])
      }
    })
    return out
  }

  it('leaves exactly four edges open, and they are a 1.000 square at the front', () => {
    // Re-derived off the BUILT hull, not off the bank, because what a child sees
    // is what the builder made. Four edges, one triangle each, all in one plane.
    const g = build()
    const loop = openEdges(g.getObjectByName('hull') as THREE.Mesh)
    expect(loop, 'box-31 has stopped being open — re-read the front wall').toHaveLength(4)
    const pts = loop.flat()
    expect(Math.min(...pts.map(q => q[0]))).toBeCloseTo(-0.5, 4)
    expect(Math.max(...pts.map(q => q[0]))).toBeCloseTo(0.5, 4)
    expect(Math.min(...pts.map(q => q[1]))).toBeCloseTo(HULL_BOTTOM_Y + 0.125, 4)
    expect(Math.max(...pts.map(q => q[1]))).toBeCloseTo(HULL_BOTTOM_Y + 1.125, 4)
    for (const q of pts) expect(q[2]).toBeCloseTo(0.5, 4)
    // And it really is a MISSING face rather than a seam: nothing is drawn there.
    const hull = g.getObjectByName('hull') as THREE.Mesh
    const a = hull.geometry.getAttribute('position')
    const ix = hull.geometry.getIndex()!
    const p = new THREE.Vector3()
    const zOf = (i: number): number =>
      p.fromBufferAttribute(a, i).applyMatrix4(hull.matrixWorld).z
    let inPlane = 0
    for (let t = 0; t < ix.count; t += 3) {
      if ([0, 1, 2].every(k => Math.abs(zOf(ix.getX(t + k)) - 0.5) < 1e-4)) inPlane++
    }
    expect(inPlane, 'the hull grew a front face — the wall may be redundant now').toBe(0)
    // The tortoise's cube is closed, which is why no species before this hull could
    // have found this and why the harness never had a reason to look.
    expect(openEdges(build('animal-tortoise').getObjectByName('hull') as THREE.Mesh))
      .toHaveLength(0)
  })

  it('is rendered SINGLE-SIDED, so an uncovered aperture is see-through', () => {
    // `assembly.ts:509` builds one MeshStandardMaterial with `map`, `metalness`
    // and `roughness` and never sets `side`, and three's default is FrontSide. So
    // the inside of the shell is culled: the hole shows the sky, not the lining.
    // If this ever becomes DoubleSide the severity changes and this goes red.
    const m = (build().getObjectByName('hull') as THREE.Mesh).material as THREE.Material
    expect(m.side).toBe(THREE.FrontSide)
  })

  it('covers 97.7% of that aperture with the plate the aperture is sized for', () => {
    // The measurement that made the fix necessary and that would catch it being
    // undone. Rasterise the 1.0 x 1.0 loop and ask, per sample, whether any mesh
    // other than the hull has geometry IN FRONT of the aperture plane — behind it
    // does not count, because a shell seen through a hole is still a hole.
    const g = build()
    const cover = coverTris(g)
    const N = 60
    let hit = 0
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = -0.5 + (i + 0.5) / N
        const y = HULL_BOTTOM_Y + 0.125 + (j + 0.5) / N
        if (cover.some(t => inFront(t, x, y, 0.5))) hit++
      }
    }
    const covered = hit / (N * N)
    // Without the plate this was 0.360 — 0.64 of a unit square of open chest, and
    // 26.8% of the whole head-on silhouette showing the background. The residue is
    // Kenney's corner bevel on his own plate: `animal-frog.ts`, which wears the
    // same part on the same hull, measures the same number.
    expect(covered, 'the front wall has stopped covering the hull\'s open face')
      .toBeGreaterThan(0.97)
    // Said causally as well, so coverage that survived by accident still names what
    // is doing it: hide the plate and re-measure, and the number collapses to the
    // 0.36 this species had before it. Nothing else on the animal covers that face.
    const wall = g.getObjectByName('front-wall')!
    wall.removeFromParent()
    g.updateMatrixWorld(true)
    const bare = coverTris(g)
    let bareHit = 0
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = -0.5 + (i + 0.5) / N
        const y = HULL_BOTTOM_Y + 0.125 + (j + 0.5) / N
        if (bare.some(t => inFront(t, x, y, 0.5))) bareHit++
      }
    }
    expect(bareHit / (N * N)).toBeCloseTo(0.36, 1)
    expect(feature('front-wall').part).toBe('blade-05')
    expect(partById('blade-05')!.size).toEqual([1, 1, 0.125])
    expect(partById('blade-05')!.roles).toEqual(['nose'])
  })
})
