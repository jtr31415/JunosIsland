/**
 * The corn snake. Home Pets' fifteenth, and that collection's first legless
 * member.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a corn snake can
 * say, and for this animal that is three things:
 *
 *   1. **`legs: false` takes 0.18125 out from under the hull, and the coil puts
 *      it back with the animal's own body.** Same trap as the slow worm's, and
 *      it is measured here rather than cross-referenced, because a species that
 *      inherits an argument instead of making it is a species nobody checked.
 *   2. **The coil is deliberately the slow worm's, and the saddles deliberately
 *      are not.** Both halves are asserted: sharing the solved transform is the
 *      point, and sharing the marking would make two animals one.
 *   3. **A DONOR'S BURIAL ONLY TRANSFERS IF ITS ATTACHMENT AXIS DOES.** The
 *      first saddle shape tried here was `box-27`, picked on its 0.933 burial,
 *      which should have shown 0.019 and actually showed 0.141 — because
 *      `box-27` is a FORWARD-facing ear and a ridge mounts radially. That is a
 *      trap the next species will walk into, so it is a test and not a comment.
 */
/* The species module FIRST, and deliberately: it registers itself as it defines
 * its build (see `assembled/register.ts`), so importing it here is what puts it
 * on the register before `parts/index.ts` snapshots `ASSEMBLED_BUILDS` below. */
import { CORN_SNAKE_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-corn-snake'
import { SLOW_WORM_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-slow-worm'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, HULL_BOTTOM_Y, HEIGHT_FLOOR, PACK_HEIGHT_MIN, LEG_ROW,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-corn-snake',
  parts: ['box-03', 'box-04', 'plate-01', 'wedge-04'],
  // The bare cube's 1.43125 floor, plus the 0.1190 the top row of saddles shows.
  height: 1.5504,
  verts: 502,
  tris: 776,
  // The coil is the biggest thing after the hull and it is under a quarter of
  // it — which is the whole reason it was shrunk. Same ratio as the slow worm's,
  // because it is the same ring at the same 1.000 across.
  massRatio: 4,
  // The coil is turned flat and the chamfer and side rows are turned onto their
  // own normals. Three features carry a spin; said out loud, because rule 4's
  // "no node carries a rotation" passes vacuously on an animal with none.
  spinsAtLeast: 3,
  // The point of the species.
  legs: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-corn-snake')
  g.updateMatrixWorld(true)
  return g
}
const named = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh && (m.name === prefix || m.name.startsWith(`${prefix}-`))) out.push(m)
  })
  return out
}

describe('animal-corn-snake: the species the quadruped kit could not say', () => {
  it('has no legs, and nothing else stands in for them', () => {
    // `legs` is structural in the quadruped kit — four boxes, always built,
    // clamped at 0.25 — so a snake cannot live there without four legs. This
    // kit says it in one field, and that field IS the species.
    expect(CORN_SNAKE_ASSEMBLY.features.some(f => f.part === LEG_ROW.part)).toBe(false)
    expect(CORN_SNAKE_ASSEMBLY.features.some(f => f.name === 'leg')).toBe(false)
    // And no ears, no snout and no nose either: a snake's head runs straight out
    // of its body with no muzzle, and it has no external ear at all. At 0.16
    // scale a muzzle on a snake reads as a mammal.
    for (const role of ['ear', 'snout', 'nose']) {
      expect(CORN_SNAKE_ASSEMBLY.features.some(f => f.name === role), role).toBe(false)
    }
  })

  it('would be UNDER the pack floor without its coil, which is why the coil is there', () => {
    /*
     * The argument for every number in the coil, measured rather than asserted
     * in a comment. Strip the coil and the animal is a hull on nothing: the
     * 0.18125 the leg row was holding is simply gone.
     */
    const g = build()
    const coils = named(g, 'coil')
    expect(coils, 'the coil must exist to be removed').toHaveLength(1)
    for (const c of coils) c.removeFromParent()
    g.updateMatrixWorld(true)
    const without = new THREE.Box3().setFromObject(g)
    // The hull's own bottom is HULL_BOTTOM_Y off the ground with nothing under it.
    expect(without.min.y).toBeCloseTo(HULL_BOTTOM_Y, 4)
  })

  it('stands on the coil: the lowest thing on the animal IS the animal', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    // Feet on y = 0 exactly — the plane the legs would have stood on.
    expect(whole.min.y).toBeCloseTo(0, 5)
    const coil = named(g, 'coil')[0] as THREE.Mesh
    const cb = new THREE.Box3().setFromObject(coil)
    // And it is the coil that gets there, not the hull and not a saddle.
    expect(cb.min.y).toBeCloseTo(0, 5)
  })

  it('clears the pack floor once the saddles are on it', () => {
    const g = build()
    const b = new THREE.Box3().setFromObject(g)
    const h = b.max.y - b.min.y
    expect(h).toBeGreaterThan(HEIGHT_FLOOR)
    expect(h).toBeGreaterThanOrEqual(PACK_HEIGHT_MIN)
    // The lift is the saddles' own proud share and nothing else.
    expect(h - HEIGHT_FLOOR).toBeCloseTo(0.1190, 3)
  })

  it('shares the slow worm\'s coil ON PURPOSE — same shape, same spin, same sink', () => {
    /*
     * This is an assertion that two species AGREE, which is unusual and is the
     * point. The coil is the kit's answer to leglessness, solved once against
     * `HULL_BOTTOM_Y` — the one plane in the kit that never moves. A second,
     * independently-derived transform doing the same job would be a second thing
     * to get wrong.
     */
    const mine = CORN_SNAKE_ASSEMBLY.features.find(f => f.name === 'coil')
    const theirs = SLOW_WORM_ASSEMBLY.features.find(f => f.name === 'coil')
    expect(mine, 'corn snake must have a coil').toBeDefined()
    expect(theirs, 'slow worm must have a coil').toBeDefined()
    expect(mine?.part).toBe(theirs?.part)
    expect(mine?.sink).toBeCloseTo(theirs?.sink as number, 9)
    expect(mine?.stretch).toEqual(theirs?.stretch)
  })

  it('does NOT share its marking with the slow worm — that is where they separate', () => {
    // Two legless animals whose only feature is a dorsal row would be one animal
    // twice. The shapes differ, and so does what they show.
    const mine = CORN_SNAKE_ASSEMBLY.features.find(f => f.name?.startsWith('saddle'))
    const theirs = SLOW_WORM_ASSEMBLY.features.find(f => f.name?.startsWith('scale'))
    expect(mine?.part).toBe('wedge-04')
    expect(theirs?.part).toBe('box-08')
    expect(mine?.part).not.toBe(theirs?.part)
  })

  it('mounts its saddles on a shape whose burial actually transfers', () => {
    /*
     * THE TRAP, kept as a test because the next species will meet it.
     *
     * A ridge mounts RADIALLY, so a donor's measured burial only means anything
     * here if that burial was measured into the same face — an attachment of
     * `y +1`. `wedge-04` is `y +1` and its 0.651 came out exact. `box-27`, tried
     * first, is `z +1`: a forward-facing koala ear whose 0.933 was measured into
     * the head's front, and using it here predicted 0.019 proud and delivered
     * 0.141.
     */
    const saddle = partById('wedge-04')
    expect(saddle, 'wedge-04 must be in the bank').toBeDefined()
    expect(saddle?.attachment?.axis).toBe('y')
    expect(saddle?.attachment?.dir).toBe(1)

    // The number the file claims, taken from the bank rather than retyped.
    const proud = (saddle?.size[1] as number) * (1 - (saddle?.attachment?.sunkFractionMean as number))
    expect(proud).toBeCloseTo(0.1190, 3)

    // And the shape that was rejected really is the wrong axis — so if the bank
    // is ever regenerated and box-27 turns out to mount on y after all, this
    // says so rather than leaving a false story in the file above.
    expect(partById('box-27')?.attachment?.axis).toBe('z')
  })

  it('keeps the coil inside the hull, so leglessness costs no keep-out', () => {
    // Rule 3's other half: the ring was shrunk to 1.000 across, which is inside
    // the hull's own 1.250, so the widest thing on this animal is the saddle
    // row and never the thing it stands on.
    const g = build()
    const coil = new THREE.Box3().setFromObject(named(g, 'coil')[0] as THREE.Mesh)
    const hull = new THREE.Box3().setFromObject(named(g, 'hull')[0] as THREE.Mesh)
    expect(coil.max.x - coil.min.x).toBeLessThan(hull.max.x - hull.min.x)
    expect(coil.max.z - coil.min.z).toBeLessThan(hull.max.z - hull.min.z)
  })

  it('carries the unreviewed-palette flag, because nobody has signed these colours off', () => {
    // home-pets.ts never held a record for this species, so it never held
    // colours for it either. The flag is where Joe reads that.
    expect(CORN_SNAKE_ASSEMBLY.flag).toBeTruthy()
    expect(CORN_SNAKE_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
  })
})
