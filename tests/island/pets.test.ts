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

import { createPetField, FLYERS, TREE_HEIGHT } from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import { FITS } from '../../src/island/world/props'
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

async function fieldWith(...pets: Pet[]): Promise<Field> {
  const field = createPetField()
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

describe('who flies', () => {
  it('flies the bee and the parrot', () => {
    expect(FLYERS.has('animal-bee')).toBe(true)
    expect(FLYERS.has('animal-parrot')).toBe(true)
  })

  it('does NOT fly the penguin, the fish or the chick', () => {
    /*
     * The judgement, pinned. All three carry `wing-left`/`wing-right` nodes —
     * which is why "has wings" is evidence and not the rule. A penguin's are
     * flippers, a fish's are fins, and a chick spends its whole life on the
     * ground. A penguin hovering over the treetops is the failure this test
     * exists to prevent, and it is the one a rule derived from the mesh would
     * have shipped.
     */
    expect(FLYERS.has('animal-penguin')).toBe(false)
    expect(FLYERS.has('animal-fish')).toBe(false)
    expect(FLYERS.has('animal-chick')).toBe(false)
  })

  it('flies nothing else in the pack', () => {
    expect([...FLYERS].sort()).toEqual(['animal-bee', 'animal-parrot'])
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
    const field = await fieldWith(pet('p', 'animal-parrot'))
    const wing = petAt(field, 'p').getObjectByName('wing-left') as THREE.Object3D
    run(field, 1, 0)
    const first = wing.rotation.z
    run(field, 1, 0.11)
    expect(Math.abs(wing.rotation.z - first)).toBeGreaterThan(0.05)
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
