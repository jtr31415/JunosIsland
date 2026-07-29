/**
 * The dormouse. One of Garden's four small brown ground creatures, and the one
 * that has to survive standing next to `animal-squirrel` wearing the SAME TAIL.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a dormouse can say,
 * and for this animal that is one claim above all others: **the plume is carried
 * LOW, and the difference from the squirrel is measured here rather than
 * described in a comment.**
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, DORMOUSE_ASSEMBLY, SQUIRREL_ASSEMBLY, MOUSE_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, HULL_BOTTOM_Y, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { speciesRecord } from '../../src/island/species/registry'
import type { KitPalette } from '../../src/island/species/types'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-dormouse',
  parts: ['box-01', 'box-02', 'box-03', 'box-23', 'box-26', 'plate-01'],
  height: 1.5012,
  verts: 414,
  tris: 610,
  // Nothing on this animal is turned, and that is the point: the squirrel wears
  // this same tail on a 45-degree spin up the rear chamfer. Said out loud,
  // because rule 4's "no node carries a rotation" passes vacuously without it.
  spinsAtLeast: 0,
})

const build = (id = 'animal-dormouse'): THREE.Group => {
  const g = buildAssembled(id)
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)

describe('animal-dormouse: the brush is carried LOW, and that is the whole animal', () => {
  it('wears the SAME shape as the shipped squirrel and separates on carry alone', () => {
    // Both animals wear `box-23`, the fox's brush — the bank's one round,
    // barely-tapering plume. Nothing else in the bank is a bushy tail, so the
    // separation cannot come from the shape and has to come from the placement.
    expect(DORMOUSE_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(true)
    expect(SQUIRREL_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(true)

    const ours = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!
    const theirs = SQUIRREL_ASSEMBLY.features.find(f => f.name === 'tail')!
    // The squirrel's is spun 45 degrees onto the rear chamfer's own normal.
    // Ours is not spun at all: it trails along the shape's own measured `z -1`.
    expect(theirs.spin).toEqual([{ axis: 'x', deg: 45 }])
    expect(ours.spin).toBeUndefined()

    // And the consequence, measured on the built geometry rather than argued:
    // 0.77 between where the two animals put the same mass.
    const mine = boxOf(build(), 'tail')
    const squirrel = boxOf(build('animal-squirrel'), 'tail')
    expect(squirrel.max.y - mine.max.y).toBeGreaterThan(0.7)
    // Ours tops out BELOW its own back; theirs stands 0.39 clear above its ears.
    expect(mine.max.y).toBeLessThan(HEIGHT_FLOOR - 0.2)
    expect(squirrel.max.y).toBeGreaterThan(HEIGHT_FLOOR)
  })

  it('takes everything about the tail from the fox except its height', () => {
    const fox = partById('box-23')!
    const tail = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!
    // Joined at the cube's own rear face, and sunk the fox's own burial — the
    // only value the pack ever gave this shape.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[0]).toBe(0)
      expect(tail.placement.at[2]).toBe(-HULL_FRONT_Z_USUAL)
    }
    expect(tail.sink).toBeCloseTo(fox.attachment!.sunkFractionMean, 9)
    expect(fox.attachment!.sunkFractionMin).toBe(fox.attachment!.sunkFractionMax)
    // Which recovers the fox's own recorded z to five decimals: the donor
    // transfer checked against a number it did not use.
    const g = build()
    expect(g.getObjectByName('tail')!.getWorldPosition(new THREE.Vector3()).z)
      .toBeCloseTo(fox.offset[2]!, 4)
  })

  it('transfers the tail\'s height as a FRACTION, because the fox\'s hull is taller', () => {
    const fox = partById('box-23')!
    const foxHull = partById('box-21')!
    // The bank records this tail at 0.86875 — measured on `box-21`, which is
    // 1.5051 tall. Carried at that ABSOLUTE height on the 1.250 cube it would
    // sit above the equator, i.e. higher than the fox carries it, which is the
    // wrong direction for the animal that has to be the low-slung one.
    expect(fox.offset[1]).toBeCloseTo(0.86875, 6)
    expect(foxHull.size[1]).toBeCloseTo(1.505075, 6)
    const fraction = (fox.offset[1]! - HULL_BOTTOM_Y) / foxHull.size[1]!
    expect(fraction).toBeCloseTo(0.4568, 4)
    // What transfers is the fraction. This is the file's ONE hand-placed number
    // and this line is its arithmetic.
    const tail = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'tail')!
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at[1]).toBeCloseTo(HULL_BOTTOM_Y + fraction * 1.25, 6)
      expect(tail.placement.at[1]).toBeLessThan(0.80625) // below the hull's equator
    }
  })
})

describe('animal-dormouse: round ears on the TOP face, and the transfer is exact', () => {
  it('is a top-mounted ear, against the mouse\'s side-mounted dish', () => {
    const ear = partById('box-02')!
    // Measured `y +1`: this one stands on the head's top face. The mouse's
    // `box-25` is the bank's only `x +1` ear and hangs off the side, which is
    // the largest silhouette difference the bank offers between two rodents.
    expect(ear.attachment!.axis).toBe('y')
    expect(ear.attachment!.dir).toBe(1)
    expect(partById('box-25')!.attachment!.axis).toBe('x')
    expect(MOUSE_ASSEMBLY.features.some(f => f.part === 'box-25')).toBe(true)
    // And it is a QUARTER of the width: 0.315 against 0.743.
    expect(ear.size[0]).toBeCloseTo(0.315, 6)
  })

  it('joins at THIS hull\'s top face and recovers the beaver\'s own centre', () => {
    const ear = partById('box-02')!
    const f = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(f.placement.kind).toBe('pair')
    if (f.placement.kind === 'pair') {
      // y: the cube's own top face. The beaver wears this ear on this same
      // 1.250 cube, so the transfer is exact rather than an inference.
      expect(f.placement.at[1]).toBeCloseTo(HEIGHT_FLOOR, 9)
      // x and z: untouched by the join, so they are the bank's recorded offset.
      expect(f.placement.at[0]).toBeCloseTo(ear.offset[0]!, 9)
      expect(f.placement.at[2]).toBeCloseTo(ear.offset[2]!, 9)
    }
    expect(f.sink).toBeCloseTo(ear.attachment!.sunkFractionMean, 9)
    // THE RECOVERY: sunk the beaver's own 0.777778, the centre lands back on
    // the bank's recorded 1.34375. Solved for, then checked against a number
    // the solve did not use. Four decimals is the float32 attribute's own
    // precision, not slack in the transfer — the bank's sink is itself rounded
    // to six, which is worth 3e-5 here.
    expect(build().getObjectByName('ear-r')!.getWorldPosition(new THREE.Vector3()).y)
      .toBeCloseTo(ear.offset[1]!, 4)
  })

  it('rises out of the cube\'s SHOULDER and is still embedded — §3, nothing floats', () => {
    // x = 0.4475 is past the flat top face, which reaches only 0.3125 before the
    // chamfer falls away 1:1, so the hull surface under the ear is at 1.29625,
    // not 1.43125. The ear stands 0.205 proud there and is buried 0.110 — the
    // beaver's and the polar bear's own small round button.
    const e = boxOf(build(), 'ear-r')
    const surface = 0.80625 + (0.625 - (0.4475 - 0.3125))
    expect(surface).toBeCloseTo(1.29625, 6)
    expect(e.max.y - surface).toBeCloseTo(0.205, 3)
    expect(surface - e.min.y).toBeGreaterThan(0.1)
    // And the whole ear is inside the hull's own width, so it costs no keep-out.
    expect(e.max.x).toBeLessThan(0.625)
  })
})

describe('animal-dormouse: a blunt face — one big nose and no muzzle at all', () => {
  it('wears no snout, which is what keeps it off the mouse and the shrew', () => {
    // The mouse and the squirrel both wear the beaver's `tube-01`; `garden.ts`
    // gives `snout` to the SHREW as its own separator. This animal has neither.
    expect(DORMOUSE_ASSEMBLY.features.some(f => f.name === 'snout')).toBe(false)
    expect(DORMOUSE_ASSEMBLY.features.some(f => f.part === 'tube-01')).toBe(false)
    expect(MOUSE_ASSEMBLY.features.some(f => f.part === 'tube-01')).toBe(true)
    // Nor `wedge-10`, which is measurably the better nose tip on every axis the
    // classification has and reads as a TONGUE. Joe rejected it by name on the
    // hedgehog and the lesson is not the hedgehog's alone.
    expect(DORMOUSE_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })

  it('joins the koala\'s nose at the cube\'s front face and recovers its centre', () => {
    const nose = partById('box-26')!
    expect(nose.roles).toContain('nose')
    const f = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'nose')!
    // No snout to hang off, so it goes straight onto the hull's front plane at
    // the koala's own recorded height. The koala wears it on `box-03` too.
    expect(f.placement).toEqual({
      kind: 'single', at: [0, nose.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(f.sink).toBe(0)
    expect(boxOf(build(), 'nose').getCenter(new THREE.Vector3()).z)
      .toBeCloseTo(nose.offset[2]!, 5)
    // It is the biggest thing in the nose family that is a nose and not a snout
    // pad — 0.278 across, against the bunny button's 0.182 — and it is what
    // takes the animal over rule 9's vertex FLOOR. See the species file.
    expect(nose.size[0]).toBeGreaterThan(partById('box-09')!.size[0]!)
  })

  it('takes the eye card entire from the pack, because the definition cannot say otherwise', () => {
    const card = partById('plate-01')!
    const eye = DORMOUSE_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
  })
})

describe('animal-dormouse: what it did not have to say, and what it costs', () => {
  it('never mentions its hull, its legs or its eye plane, and gets the pack\'s own', () => {
    expect(DORMOUSE_ASSEMBLY.hull.part).toBe('box-03')
    expect(DORMOUSE_ASSEMBLY.hull.at).toEqual([0, 0.80625, 0])
    expect(DORMOUSE_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('paints its belly at the pack\'s own mammal line and adds no geometry for it', () => {
    // "Sandy gold above, cream below", as §4's second way: drawn into the coat's
    // own cell at the hull's equator. Same 32 welded points as an unpatched cube.
    expect(DORMOUSE_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })

  it('invents no colour — the four are `garden.ts`\'s own signed-off record', () => {
    const spec = speciesRecord('animal-dormouse')?.build
    expect(spec && 'palette' in spec, 'the Garden record has no palette').toBe(true)
    const signed = (spec as { palette: KitPalette }).palette
    const p = DORMOUSE_ASSEMBLY.palette
    expect(p['coat']).toBe(signed.coat)     // sandy gold
    expect(p['belly']).toBe(signed.belly)   // cream
    expect(p['inner']).toBe(signed.detail)  // the round ears
    expect(p['limb']).toBe(signed.accent)   // legs and the nose
  })

  it('is as tall as the EARS, which is the measurement that says the tail is low', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    // The ears set the height and the tail tops out 0.29 below them. On the
    // squirrel the same shape sets the height and stands 0.39 above the ears.
    expect(whole.max.y).toBeCloseTo(boxOf(g, 'ear-r').max.y, 6)
    expect(boxOf(g, 'ear-r').max.y - boxOf(g, 'tail').max.y).toBeCloseTo(0.294, 2)
    // 1.5012, which is also the 1.5 `garden.ts` already claims for this animal.
    expect(whole.max.y - whole.min.y).toBeCloseTo(1.5, 2)
  })

  it('fits between two trees — a trailing brush costs depth, and this is what it costs', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. Every millimetre
    // of the 2.14 depth is the pack's own — the fox's sink, the koala's nose, the
    // cube's rear face — and it is still inside the fox's own 1.15, which is the
    // pack's worst and the number the island already copes with.
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.069, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('strains nothing, so it carries no flag', () => {
    expect(DORMOUSE_ASSEMBLY.flag).toBeUndefined()
  })
})
