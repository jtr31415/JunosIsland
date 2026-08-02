/**
 * @vitest-environment jsdom
 *
 * Two of Joe's three notes land here.
 *
 *   "animals can still clip through the frog" — Fred is solid AND he moves, so
 *   the pet field has to ask where he is every frame rather than be told once.
 *
 *   "all the animals that can fly should hover at tree height and not bob over
 *   the ground" — which is a decision about which of the 24 species fly, and a
 *   height taken from the scenery rather than typed in.
 *
 * The model loader is stubbed because these are assertions about MOVEMENT, and
 * a 300KB GLB over the network is not part of the question. Everything the
 * assertions actually turn on — the measured body, the clamp, the hover — runs
 * for real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await import('three')
  /** A stand-in the size of a real Kenney pet: 1.25 x 1.55 x 1.43 units. */
  class GLTFLoader {
    async loadAsync(): Promise<{ scene: THREE.Group }> {
      const scene = new T.Group()
      const body = new T.Mesh(
        new T.BoxGeometry(1.25, 1.55, 1.43), new T.MeshStandardMaterial())
      body.position.y = 1.55 / 2
      scene.add(body)
      // The five winged species carry these nodes; the stub gives them to
      // everybody, so nothing here can pass by accident of which model it is.
      for (const side of ['wing-left', 'wing-right']) {
        const wing = new T.Object3D()
        wing.name = side
        scene.add(wing)
      }
      return { scene }
    }
  }
  return { GLTFLoader }
})

import {
  createPetField, clearOf, TREE_HEIGHT, WINGBEAT,
} from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import { FITS } from '../../src/island/world/props'
import { mulberry32 } from '../../src/core/rng'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { Island } from '../../src/island/world/grid'
import type { Pet } from '../../src/island/flow'
import type { LightingPreset } from '../../src/island/lighting'

type Field = ReturnType<typeof createPetField>

const HEX = 1.1545
const ISLAND: Island = { tiles: new Map([['0,0', 'grass']]) }

const pet = (id: string, species: string): Pet =>
  ({ id, name: id, species, at: { q: 0, r: 0 } })

/** The stand-in's half-width once the field has scaled it to 0.16. */
const PET_RADIUS = (1.43 * 0.16) / 2

/** Where a live pet's model ended up. */
function petAt(field: Field, id: string): THREE.Object3D {
  const found = field.group.children.find(
    c => (c.userData.pick as { id?: string } | undefined)?.id === id)
  return found as THREE.Object3D
}

/** Its blob, which is the sibling added straight after it. */
function shadowOf(field: Field, id: string): THREE.Mesh {
  const at = field.group.children.indexOf(petAt(field, id))
  return field.group.children[at + 1] as THREE.Mesh
}

/** How far a pet's blob has been thrown from the pet itself. */
function throwOf(field: Field, id: string): number {
  const at = petAt(field, id).position
  const blob = shadowOf(field, id).position
  return Math.hypot(blob.x - at.x, blob.z - at.z)
}

function run(field: Field, frames: number, from = 0): void {
  for (let i = 0; i < frames; i++) field.update(1 / 60, from + i / 60, ISLAND, HEX)
}

/*
 * Seeded rather than `Math.random`, per PB-054: a field's goal, rest and
 * phase are drawn from an `Rng`, and a test that asserts on the real
 * `update()` loop without controlling that draw is asserting on a coin
 * toss. Every assertion in this file is a threshold rather than an exact
 * position, so any seed is fine — what matters is that it is fixed rather
 * than reached for a retry or a wider tolerance if it ever flakes.
 */
const SEED = 3

async function fieldWith(...pets: Pet[]): Promise<Field> {
  const field = createPetField('', mulberry32(SEED))
  await field.sync(pets, ISLAND, HEX)
  return field
}

beforeEach(() => { createLighting(null, meadowDay as LightingPreset) })

describe('a pet cannot walk through Fred', () => {
  /** Fred, standing exactly where the pet starts. His measured keep-out. */
  const FRED = { x: 0, z: 0, r: 0.2045 }

  it('is pushed clear of him, by his radius AND its own', async () => {
    /*
     * The clamp has to separate the two SURFACES. Clamping a pet's centre onto
     * Fred's boundary buries half a pet in the frog, which is the same note
     * again with a smaller number.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    field.setMovers(() => [FRED])
    run(field, 1)

    const at = petAt(field, 'a').position
    expect(Math.hypot(at.x, at.z)).toBeGreaterThanOrEqual(FRED.r + PET_RADIUS - 1e-6)
  })

  it('walks straight through him when nobody publishes him', async () => {
    /*
     * The control, and the shape of the original bug: the pet field was given
     * the scenery and nothing else, so a pet standing in the frog was standing
     * in clear ground as far as anything here knew.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    run(field, 1)
    const at = petAt(field, 'a').position
    expect(Math.hypot(at.x, at.z)).toBeLessThan(FRED.r)
  })

  it('asks again every frame, because he does not stay put', async () => {
    /*
     * He potters about his patch between hops. A keep-out published once, the
     * way the scenery is, blocks the grass he has left and lets pets through
     * the frog where he now is.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    let fred = { ...FRED }
    field.setMovers(() => [fred])
    run(field, 30)

    // Fred hops on top of whoever is there.
    const now = petAt(field, 'a').position
    fred = { x: now.x, z: now.z, r: FRED.r }
    run(field, 1, 0.5)

    const after = petAt(field, 'a').position
    expect(Math.hypot(after.x - fred.x, after.z - fred.z))
      .toBeGreaterThanOrEqual(fred.r + PET_RADIUS - 1e-6)
  })

  it('keeps the scenery solid as well, not instead', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    field.setObstacles([{ x: 0, z: 0, r: 0.5 }])
    field.setMovers(() => [{ x: 0.9, z: 0, r: 0.2 }])
    run(field, 1)

    const at = petAt(field, 'a').position
    expect(Math.hypot(at.x, at.z)).toBeGreaterThanOrEqual(0.5 + PET_RADIUS - 1e-6)
  })
})

describe('two keep-outs that overlap', () => {
  /*
   * The bug this describe exists for, and it was a real one rather than a
   * theoretical one: `clearOf` used to clamp a pet out of each obstacle IN
   * LIST ORDER. Where two keep-outs overlap that undoes itself — the pet is
   * pushed onto the first circle, lands inside the second, is pushed onto the
   * second, and THAT push puts it back inside the first. The last clamp won
   * and the pet was left buried in the rock it had just been taken out of.
   *
   * It reddened "keeps the scenery solid as well, not instead" about one run
   * in twelve, on whichever random goal directions aim the pet into the
   * overlap — so it looked like a flaky test and was in fact a collision bug.
   * These cases carry no randomness at all, so it cannot look like one again.
   *
   * The numbers are the ones from that test: a rock at the origin and Fred
   * 0.9 away, whose keep-outs overlap by 0.03 once the pet's own radius is
   * added to both.
   */
  const ROCK = { x: 0, z: 0, r: 0.5 }
  const FRED = { x: 0.9, z: 0, r: 0.2 }
  const SELF = PET_RADIUS

  /** How far outside each keep-out's surface a point is. Negative is inside. */
  const clearance = (p: THREE.Vector3, ob: { x: number; z: number; r: number }): number =>
    Math.hypot(p.x - ob.x, p.z - ob.z) - (ob.r + SELF)

  it('leaves the pet outside BOTH, not outside whichever came last', () => {
    // Aimed straight into the overlap — the direction the old order lost on.
    const p = new THREE.Vector3(0.01, 0, 0)
    clearOf(p, [ROCK, FRED], SELF)
    expect(clearance(p, ROCK)).toBeGreaterThanOrEqual(-1e-9)
    expect(clearance(p, FRED)).toBeGreaterThanOrEqual(-1e-9)
  })

  it('gives the same answer whichever order they are published in', () => {
    /*
     * List order is an accident of how `main.ts` concatenates the scenery and
     * the movers. It must not be what decides where a pet ends up.
     */
    const one = new THREE.Vector3(0.01, 0, 0)
    const two = new THREE.Vector3(0.01, 0, 0)
    clearOf(one, [ROCK, FRED], SELF)
    clearOf(two, [FRED, ROCK], SELF)
    expect(one.x).toBeCloseTo(two.x, 9)
    expect(two.z).toBeCloseTo(Math.abs(one.z), 9)
  })

  it('gets a pet out of a keep-out it is standing dead in the middle of', () => {
    /*
     * A pet hatches on its tile's centre, and a rock can be sited there. There
     * is no direction to push it in, so `clearOf` picks one — and the one it
     * picks used to be straight at Fred, where the second clamp shoved it back
     * into the rock.
     */
    const p = new THREE.Vector3(0, 0, 0)
    clearOf(p, [ROCK, FRED], SELF)
    expect(clearance(p, ROCK)).toBeGreaterThanOrEqual(-1e-9)
    expect(clearance(p, FRED)).toBeGreaterThanOrEqual(-1e-9)
  })

  it('still adds the pet\'s OWN radius to both of them', () => {
    /*
     * HANDOFF §6: clamping a centre to a surface buries half a pet in the
     * rock. What has to touch is the two surfaces. Resolving an overlap is no
     * excuse for forgetting it — so this pins the actual distances, not merely
     * that the pet is somewhere outside.
     */
    const p = new THREE.Vector3(0.01, 0, 0)
    clearOf(p, [ROCK, FRED], SELF)
    expect(Math.hypot(p.x, p.z)).toBeGreaterThanOrEqual(ROCK.r + SELF - 1e-9)
    expect(Math.hypot(p.x - FRED.x, p.z - FRED.z))
      .toBeGreaterThanOrEqual(FRED.r + SELF - 1e-9)
    // And it is ON one of the two surfaces rather than flung clear of both:
    // this is a constraint that corrects a step, not a shove.
    expect(Math.min(Math.abs(clearance(p, ROCK)), Math.abs(clearance(p, FRED))))
      .toBeLessThan(1e-6)
  })

  it('comes out on the side the pet walked in from', () => {
    /*
     * The overlap has two ways out, one either side of the line between the
     * two keep-outs. A pet that arrived from the north must not be teleported
     * to the south of a rock it never went round.
     */
    const north = new THREE.Vector3(0.05, 0, -0.02)
    const south = new THREE.Vector3(0.05, 0, 0.02)
    clearOf(north, [ROCK, FRED], SELF)
    clearOf(south, [ROCK, FRED], SELF)
    expect(north.z).toBeLessThan(0)
    expect(south.z).toBeGreaterThan(0)
  })

  it('leaves a pet that is already clear exactly where it stands', () => {
    const p = new THREE.Vector3(3, 0, -2)
    clearOf(p, [ROCK, FRED], SELF)
    expect(p.x).toBe(3)
    expect(p.z).toBe(-2)
  })

  it('does not hang on a pocket with no way out of it at all', () => {
    /*
     * Three keep-outs on top of each other leave nowhere clear to stand. The
     * answer is bounded work and the best position available — never a frame
     * that does not end.
     */
    const p = new THREE.Vector3(0.01, 0, 0.01)
    clearOf(p, [
      { x: 0, z: 0, r: 1 }, { x: 0.1, z: 0, r: 1 }, { x: 0, z: 0.1, r: 1 },
    ], SELF)
    expect(Number.isFinite(p.x)).toBe(true)
    expect(Number.isFinite(p.z)).toBe(true)
  })
})

describe('who flies', () => {
  /*
   * The judgement itself — exactly which two of the 24 species fly — now
   * lives in `species/moves.ts`, and its membership pin lives beside it in
   * `moves.test.ts`'s migration guard. What belongs HERE is the behaviour
   * `pets.ts` actually produces from that judgement: a real field, run for
   * real frames, either hovers a creature at `TREE_HEIGHT` or leaves it
   * bobbing on the grass. Asserting a constant's contents proves nothing
   * about the wiring between the table and the update loop; running the
   * loop does.
   */
  it('hovers a bee and a parrot at tree height', async () => {
    const field = await fieldWith(pet('b', 'animal-bee'), pet('p', 'animal-parrot'))
    run(field, 30)
    expect(petAt(field, 'b').position.y).toBeCloseTo(TREE_HEIGHT, 1)
    expect(petAt(field, 'p').position.y).toBeCloseTo(TREE_HEIGHT, 1)
  })

  it('bobs a species with no table entry along the ground, wings or not', async () => {
    /*
     * The penguin, the fish and the chick all carry `wing-left`/`wing-right`
     * nodes in the real pack — the stub above gives them to every species —
     * which is why "has wings" was always evidence and never the rule. None
     * of the three has an entry in `MOVES`, so all three walk.
     */
    const field = await fieldWith(
      pet('n', 'animal-penguin'), pet('f', 'animal-fish'), pet('c', 'animal-chick'))
    run(field, 30)
    expect(petAt(field, 'n').position.y).toBeLessThan(0.2)
    expect(petAt(field, 'f').position.y).toBeLessThan(0.2)
    expect(petAt(field, 'c').position.y).toBeLessThan(0.2)
  })
})

describe('flying pets hover at tree height', () => {
  it('puts a parrot up among the branches, not on the grass', async () => {
    const field = await fieldWith(pet('p', 'animal-parrot'))
    run(field, 12)
    // Clear of a hop by a wide margin: a walking pet peaks at 0.16.
    expect(petAt(field, 'p').position.y).toBeGreaterThan(0.6)
  })

  it('takes that height from the scenery rather than a number typed here', async () => {
    /*
     * `FITS` is where the game decides how big a piece of landscape may be. A
     * flyer that clears the taller of the two tree budgets is among the canopy
     * whatever those budgets become; a hardcoded 0.95 would leave a bee
     * ankle-deep in the trees the first time anybody resized them.
     */
    expect(TREE_HEIGHT).toBeGreaterThanOrEqual(FITS.feature[1])
    expect(TREE_HEIGHT).toBeGreaterThanOrEqual(FITS.grown[1])

    const field = await fieldWith(pet('p', 'animal-parrot'))
    run(field, 12)
    expect(petAt(field, 'p').position.y).toBeCloseTo(TREE_HEIGHT, 1)
  })

  it('leaves a walking pet on the ground', async () => {
    const field = await fieldWith(pet('c', 'animal-cow'))
    run(field, 12)
    expect(petAt(field, 'c').position.y).toBeLessThan(0.2)
  })

  it('leaves the penguin on the ground too', async () => {
    const field = await fieldWith(pet('n', 'animal-penguin'))
    run(field, 12)
    expect(petAt(field, 'n').position.y).toBeLessThan(0.2)
  })

  it('does not squash and stretch a creature that never touches down', async () => {
    // Squash-stretch is a body pushing off the ground. Nothing is pushing.
    const field = await fieldWith(pet('p', 'animal-parrot'))
    run(field, 12)
    const s = petAt(field, 'p').scale
    expect(s.x).toBeCloseTo(1, 6)
    expect(s.y).toBeCloseTo(1, 6)
  })

  it('beats its wings, so hovering reads as flight and not levitation', async () => {
    /*
     * Sampled right across ONE WINGBEAT, not at two instants a tenth of a
     * second apart.
     *
     * Each pet's `phase` is `Math.random() * 2π`, and two fixed instants are
     * two fixed points on the sine — so for the phases where those two points
     * straddle a turning point, the difference between them collapses. It
     * measured 0.0074 against a 0.05 threshold in one run, and flaked about 3%
     * of the time. The wing was beating perfectly well; the sampling was
     * asking a question two points cannot answer.
     *
     * A whole beat cannot hide a turning point. Eight samples spread over the
     * period leave the peak and the trough at worst π/8 away from a sample, so
     * the range is at least 2·cos(π/8)·0.5 = 0.92 whatever the phase — which
     * is why this asserts a comfortable 0.5 rather than a shaved 0.05.
     *
     * `WINGBEAT` is imported rather than copied for the same reason
     * `TAP_TARGET` reads the real camera: a period typed in here would go on
     * claiming to sample a full beat long after the beat changed.
     */
    const field = await fieldWith(pet('p', 'animal-parrot'))
    const wing = petAt(field, 'p').getObjectByName('wing-left') as THREE.Object3D
    const beat = (Math.PI * 2) / WINGBEAT

    const seen: number[] = []
    for (let i = 0; i < 8; i++) {
      run(field, 1, (i * beat) / 8)
      seen.push(wing.rotation.z)
    }
    expect(Math.max(...seen) - Math.min(...seen)).toBeGreaterThan(0.5)
  })

  it('beats them in opposition, so it is a wingbeat and not a shrug', async () => {
    const field = await fieldWith(pet('p', 'animal-parrot'))
    const left = petAt(field, 'p').getObjectByName('wing-left') as THREE.Object3D
    const right = petAt(field, 'p').getObjectByName('wing-right') as THREE.Object3D
    const beat = (Math.PI * 2) / WINGBEAT
    // A quarter beat in, so the pair is nowhere near the crossing point where
    // both are zero and any pair of numbers would satisfy this.
    run(field, 1, beat / 4)
    expect(left.rotation.z).toBeCloseTo(-right.rotation.z, 9)
  })
})

describe('a pet and its shadow agree with the sun', () => {
  it('does not drag the blob along underneath itself', async () => {
    /*
     * The pet field used to write the blob's position itself, straight under
     * the creature — which is the "inconsistent with a single point sun light
     * source" note, thirty times over, since there is one of these per friend.
     */
    const field = await fieldWith(pet('c', 'animal-cow'))
    run(field, 8)
    expect(throwOf(field, 'c')).toBeGreaterThan(0.1)
  })

  it('throws a hovering pet further than a walking one', async () => {
    const field = await fieldWith(
      pet('c', 'animal-cow'), pet('p', 'animal-parrot'))
    run(field, 8)
    expect(throwOf(field, 'p')).toBeGreaterThan(throwOf(field, 'c') * 3)
  })
})

/**
 * Where a friend actually IS — the port the album's "find it on the map" needs.
 *
 * Phase 4. `flow.pets[].at` is where a pet HATCHED, and nothing writes back to
 * it: wandering happens on these live scene-graph roots and always has. So a
 * camera asked to go and look at a friend has to read the answer off the field,
 * and this is the only module that has it.
 */
describe('where a friend is standing right now', () => {
  it('answers with where the model has WALKED to, not where it hatched', async () => {
    /*
     * The assertion that defends the feature. A pet starts on its hatch tile and
     * wanders off; on the one-hex island every other test in this file uses, the
     * two look nearly the same, so this puts it somewhere they cannot be
     * confused — a whole hex is only 2.3 units across.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    petAt(field, 'a').position.set(4.2, 0, -3.1)

    const at = field.positionOf('a')
    expect(at).not.toBeNull()
    expect(at?.x).toBeCloseTo(4.2, 9)
    expect(at?.z).toBeCloseTo(-3.1, 9)
  })

  it('follows a pet as it wanders, rather than caching where it began', async () => {
    /*
     * The contract, sampled: whatever the field has done to the root this frame
     * is what this answers with. A cached answer would be right at the moment the
     * album was wired and wrong every second afterwards — and the album cannot
     * tell the difference, which is exactly the class of bug HANDOFF §5 lists.
     *
     * Room to walk, deliberately. The one-hex island the rest of this file uses
     * keeps a pet inside 0.8 of a hex, so a wanderer barely leaves its own spot;
     * on three hexes and a minute of frames it genuinely travels.
     */
    const wide: Island = {
      tiles: new Map([['0,0', 'grass'], ['1,0', 'grass'], ['2,0', 'grass']]),
    }
    const field = createPetField()
    await field.sync([pet('a', 'animal-cow')], wide, HEX)
    const root = petAt(field, 'a')
    const start = field.positionOf('a') as THREE.Vector3

    let travelled = 0
    let was = start.clone()
    for (let i = 0; i < 3600; i++) {
      field.update(1 / 60, i / 60, wide, HEX)
      const at = field.positionOf('a') as THREE.Vector3
      // Never a stale copy: it is the live root, read afresh.
      expect(at.x).toBeCloseTo(root.position.x, 9)
      expect(at.z).toBeCloseTo(root.position.z, 9)
      travelled += Math.hypot(at.x - was.x, at.z - was.z)
      was = at
    }
    expect(travelled).toBeGreaterThan(0.1)
  })

  it('reports the height of a flyer, so the caller can decide about it', async () => {
    /*
     * A bee hovers at TREE_HEIGHT. This port tells the truth and the ALBUM drops
     * the height — the camera's pivot is clamped horizontally only, so a pivot
     * handed a y that high stays in the air for the rest of the session. Deciding
     * it here would be a rendering module having an opinion about a camera.
     *
     * Measured against `TREE_HEIGHT` rather than a typed-in number, for the
     * reason `WINGBEAT` is imported above: the canopy is derived from `FITS`, so
     * a constant here would go on claiming to test flight after the trees moved.
     * The hover bob is ±0.05, hence the margin.
     */
    const field = await fieldWith(pet('b', 'animal-bee'))
    run(field, 30)
    expect((field.positionOf('b') as THREE.Vector3).y)
      .toBeGreaterThan(TREE_HEIGHT - 0.06)
  })

  it('hands out a COPY, so nobody can teleport a pet by holding its answer',
    async () => {
      const field = await fieldWith(pet('a', 'animal-cow'))
      const at = field.positionOf('a') as THREE.Vector3
      at.set(99, 99, 99)
      expect(petAt(field, 'a').position.x).not.toBe(99)
    })

  it('is null for a friend whose model has not landed yet', async () => {
    /*
     * `sync` creates nothing until the GLB arrives, so this is the ordinary state
     * of a just-hatched friend on a tablet. It must not be answered with the
     * origin, which is a real place on the child's island — Fred stands there.
     */
    const field = createPetField()
    expect(field.positionOf('nobody')).toBeNull()
    await field.sync([pet('a', 'animal-cow')], ISLAND, HEX)
    expect(field.positionOf('a')).not.toBeNull()
  })
})
