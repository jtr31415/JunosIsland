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
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, HEIGHT_FLOOR,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { speciesRecord } from '../../src/island/species/registry'
import type { KitPalette } from '../../src/island/species/types'
import { assertAssembly } from './assembly-assert'

/*
 * RE-PINNED, all four of them, and for one reason: Joe opened this animal in the
 * workbench editor, changed it, and pushed it into the game (`84cd17a`). His
 * geometry stands. These four are DESCRIPTIONS — they record what was built, and
 * what was built is no longer what they said.
 *
 * What they now describe is not a small move, and it is worth reading before the
 * numbers:
 *
 *   - **`box-23`, the fox's brush, IS NO LONGER ON THIS SPECIES.** In its place
 *     is `wedge-07`, the cat's and the monkey's tail, carried as an extra named
 *     after its own part id at the shape's own recorded [0, 1.186701, -0.625] and
 *     sunk its own measured 0.159043.
 *   - The height went **1.5012 -> 1.7100**, and the part that sets it changed
 *     with it: the ears still top out at 1.5012, but the new tail reaches 1.7100
 *     and is now the tallest thing on the animal. `garden.ts` still claims 1.5
 *     for this species, so the record and the model are 0.21 apart.
 *   - **414 -> 464 vertices and 610 -> 730 triangles**, which is the cat's tail
 *     being a 212-triangle shape where the fox's brush was 92. Both counts are
 *     still inside rule 9's 405-1626 and 422-951, so the budget GATES either side
 *     of the exact pins pass on their own and nothing here is being excused.
 *
 * The suite below does not accept the swap. The tail is this species' entire
 * separator from the squirrel, and the assertions that say so are gates: they are
 * left red on purpose. Re-pinning here only stops the shared harness reporting
 * the same news four more times.
 */
assertAssembly({
  id: 'animal-dormouse',
  parts: ['box-01', 'box-02', 'box-03', 'box-26', 'plate-01', 'wedge-07'],
  height: 1.7100,
  verts: 464,
  tris: 730,
  // Still nothing on this animal is turned — the tail that replaced the brush is
  // placed, not spun — and rule 4's "no node carries a rotation" still has to be
  // claimed out loud here or it passes vacuously.
  spinsAtLeast: 0,
})

const build = (id = 'animal-dormouse'): THREE.Group => {
  const g = buildAssembled(id)
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)

/*
 * "THE BRUSH IS CARRIED LOW, AND THAT IS THE WHOLE ANIMAL" WAS RETIRED.
 *
 * Three assertions, and every one of them was about the dormouse wearing
 * `box-23` — the fox's brush, the same plume the squirrel wears — carried low
 * and untwisted so that the two animals separated on placement alone. The
 * arithmetic was nice: the tail's height transferred from the fox as a FRACTION
 * of its hull rather than as an absolute, because the fox's body is 1.505 tall
 * against this cube's 1.250.
 *
 * Joe swapped the shape in the editor (`84cd17a`): the brush left and the cat's
 * `wedge-07` arrived, 0.555 deep where the brush was 0.910, and it is carried up
 * rather than trailed. So the dormouse and the squirrel no longer wear the same
 * shape at all, and the separation this block was written to prove is now made
 * by the shapes themselves.
 *
 * These were four of the eight reds the 3 August handoff left standing and
 * marked as DESCRIPTIONS rather than guards, in his words: *"dont burn tokens on
 * tests that fails stuff that shouldnt be failed."* `git show` has them.
 */
describe('animal-dormouse: the tail, and what it still has to do', () => {
  it('carries a tail that is not the squirrel\'s, which is the separation', () => {
    /* `garden.ts` names dormouse/squirrel as a confusable pair. It used to be
     * resolved by carry, with one shape between them; it is resolved by SHAPE
     * now. Either is a valid answer — what must never happen is the two wearing
     * the same shape the same way, which is what this asserts. */
    /* Found by ROLE and not by name. The editor's push names an extra after the
     * part it wears, so the dormouse's tail is a feature called `wedge-07` — a
     * lookup for `name === 'tail'` finds nothing and silently passes. */
    const tailOf = (spec: typeof DORMOUSE_ASSEMBLY): typeof spec.features[number] | undefined =>
      spec.features.find(f => f.name === 'tail' || (partById(f.part)?.roles.includes('tail') ?? false))
    const ours = tailOf(DORMOUSE_ASSEMBLY)!
    const theirs = tailOf(SQUIRREL_ASSEMBLY)!
    expect(ours, 'the dormouse has no tail at all').toBeTruthy()
    expect(theirs, 'the squirrel has no tail at all').toBeTruthy()

    const samePart = ours.part === theirs.part
    const sameSpin = JSON.stringify(ours.spin ?? null) === JSON.stringify(theirs.spin ?? null)
    const sameAt = JSON.stringify(ours.placement) === JSON.stringify(theirs.placement)
    expect(samePart && sameSpin && sameAt, 'the two tails are indistinguishable').toBe(false)
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

  it('stands on the ground, and its height is the pack\'s business not this file\'s', () => {
    /* This used to assert that the EARS set the animal's height and the tail
     * topped out 0.294 below them — the measurement that said "the tail is low".
     * The `wedge-07` Joe put on it is carried UP: the whole animal now measures
     * 1.710 where the ears reach 1.501, so the tail is the tallest thing on it
     * and the old reading is simply not this animal any more.
     *
     * Height against the pack's band is reported by `assertAssembly` rather than
     * failed (his 3 August ruling), so what is left here is the one part that is
     * a genuine invariant: it is standing on the floor. */
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    expect(whole.min.y).toBeCloseTo(0, 6)
    expect(whole.max.y).toBeGreaterThan(0)
  })

  it('fits between two trees — the tail costs depth, and this is what it costs', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2, so depth is the
    // number a tail carried backwards is paid for in.
    //
    // RE-PINNED 1.069 -> 0.928, a description of a changed animal: Joe swapped
    // the tail in the editor and pushed it (`84cd17a`). The fox's brush left and
    // the cat's `wedge-07` arrived, which is 0.555 deep where the brush was 0.910
    // and is carried up rather than trailed, so the whole animal went from 2.14
    // deep to 1.856. Every millimetre of that is still the pack's own — the new
    // tail's own measured sink, the koala's nose, the cube's rear face.
    //
    // The line under it is the GATE and it is the one that matters: inside the
    // fox's own 1.15, the pack's worst and the number the island already copes
    // with. It passed at 1.069 and it passes at 0.928, so the swap bought this
    // animal depth it did not need — the cost of the swap is elsewhere, in the
    // gates at the top of this file, and it is not paid here.
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.928, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })

  it('strains nothing, so it carries no flag', () => {
    expect(DORMOUSE_ASSEMBLY.flag).toBeUndefined()
  })
})
