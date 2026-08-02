/**
 * @vitest-environment jsdom
 *
 * THE SECOND ROUTE INTO A LIVE PET (PB-070): a species with an `assembly` is
 * BUILT where a Kenney species is fetched.
 *
 * Thirty species shipped on the assembly kit and not one of them had a GLB
 * beside `pets/`, so `prototype()` asked for a file that does not exist, the
 * request 404'd, and `sync`'s `.catch(() => null); if (!root) continue` threw the
 * pet and the reason away together. From outside, a species that could never
 * appear looked exactly like a species that had not finished loading — which is
 * why it survived for weeks. Both halves are asserted here: the build, and the
 * noise the drop now makes.
 *
 * WHAT IS REAL HERE AND WHAT IS NOT. Everything under `src/island/species/` is
 * the real thing — the real registry, the real `buildAssembly`, the real
 * hedgehog spec, real geometry. The GPU is absent rather than stubbed, because
 * nothing below needs one. The ONE stub is `GLTFLoader`, and it is a loader that
 * genuinely WORKS for a species the pack really ships (the cow appears on the
 * island in the last suite), so "it was never asked for the hedgehog" is a fact
 * about `pets.ts` rather than about a broken double — the album-portraits
 * precedent, `album-portraits.test.ts:76-88`. HANDOFF §5: nothing here asserts
 * that a mock was called.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'

/** Every URL the field asked the network for. For the built species: none. */
const net = vi.hoisted(() => ({ urls: [] as string[] }))

/*
 * A loader that answers for a species the pack really ships and 404s for
 * anything else, which is what the real server does. Deliberately NOT a loader
 * that always fails: a stub that could not have worked would make the "no
 * request was made" assertion below unfalsifiable.
 */
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await vi.importActual<typeof import('three')>('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      net.urls.push(url)
      if (!url.includes('animal-cow')) {
        throw new Error(`404 Not Found: ${url}`)
      }
      const scene = new T.Group()
      const body = new T.Mesh(
        new T.BoxGeometry(1.25, 1.55, 1.43), new T.MeshStandardMaterial())
      body.position.y = 1.55 / 2
      scene.add(body)
      return { scene }
    }
  }
  return { GLTFLoader }
})

import { createPetField } from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import { speciesRecord } from '../../src/island/species/registry'
import { buildAssembly } from '../../src/island/species/parts/assembly'
import { mulberry32 } from '../../src/core/rng'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { Island } from '../../src/island/world/grid'
import type { Pet } from '../../src/island/flow'
import type { LightingPreset } from '../../src/island/lighting'

type Field = ReturnType<typeof createPetField>

const HEX = 1.1545

/**
 * A seven-hex island, so a pet has somewhere to walk TO.
 *
 * `randomSpot` draws a tile and then a point inside it, so on a one-tile island
 * a pet's goal is frequently inside the 0.12 "arrived" radius it is already
 * standing in — which is a pet that rests rather than a pet that cannot move,
 * and the difference is not something an assertion should have to guess at.
 */
const ISLAND: Island = {
  tiles: new Map([
    ['0,0', 'grass'], ['1,0', 'grass'], ['-1,0', 'grass'], ['0,1', 'grass'],
    ['0,-1', 'grass'], ['1,-1', 'grass'], ['-1,1', 'grass'],
  ]),
}

/**
 * The species this file is about: a genuinely registered assembled one.
 *
 * `parts/assembled/index.ts` lists thirty and the hedgehog is the first, being
 * the first that shipped. `speciesRecord(id).assembly` is asserted to exist
 * below rather than assumed, so this file goes red if the record is ever
 * unwired instead of quietly testing the GLB path by accident.
 */
const BUILT = 'animal-hedgehog'
/** A species the pack really has a file for — the control. */
const FETCHED = 'animal-cow'
/** In no roster and on no server. Neither route can answer for it. */
const NEITHER = 'animal-not-a-species'

/** The scale `sync` puts every pet at, built or fetched. */
const PET_SCALE = 0.16

const pet = (id: string, species: string): Pet =>
  ({ id, name: id, species, at: { q: 0, r: 0 } })

/** The holder `sync` put on the island for this pet, or undefined. */
function holderOf(field: Field, id: string): THREE.Object3D | undefined {
  return field.group.children.find(
    c => (c.userData.pick as { id?: string } | undefined)?.id === id)
}

/** The creature itself: the holder's model child, with the tap proxy left out. */
function modelOf(field: Field, id: string): THREE.Object3D {
  const holder = holderOf(field, id)
  expect(holder, `no pet was put on the island for "${id}"`).toBeDefined()
  const model = holder!.children.find(c => c.name !== 'pet-pick')
  expect(model, `pet "${id}" has a holder and no model in it`).toBeDefined()
  return model!
}

/** Every real mesh under an object, tap proxy excluded. */
function meshesOf(o: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = []
  o.traverse(n => {
    if ((n as THREE.Mesh).isMesh && n.name !== 'pet-pick') out.push(n as THREE.Mesh)
  })
  return out
}

function worldBox(o: THREE.Object3D): THREE.Box3 {
  o.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(o)
}

/**
 * A fresh, independent build of the same spec, straight from the real kit.
 *
 * Every expected number below is derived from THIS rather than typed in, so the
 * assertions describe the animal rather than a snapshot of it: re-proportion the
 * hedgehog and they follow it.
 */
function reference(): THREE.Group {
  const spec = speciesRecord(BUILT)?.assembly
  expect(spec, `"${BUILT}" is not a registered species with an assembly`).toBeDefined()
  return buildAssembly(spec!)
}

/*
 * Seeded, per HANDOFF's "Landmines added 1 August (PB-054)": where a pet wants
 * to go, how long it rests and the phase of its hop are all drawn from the
 * field's `Rng`, so an assertion about where a pet ended up is an assertion
 * about a coin toss unless the draw is controlled. Fixed once, here; never a
 * retry loop and never a widened tolerance.
 */
const SEED = 7

function fieldWith(...pets: Pet[]): { field: Field; done: Promise<void> } {
  const field = createPetField('', mulberry32(SEED))
  return { field, done: field.sync(pets, ISLAND, HEX) }
}

async function fieldOf(...pets: Pet[]): Promise<Field> {
  const { field, done } = fieldWith(...pets)
  await done
  return field
}

beforeEach(() => {
  net.urls.length = 0
  createLighting(null, meadowDay as LightingPreset)
})

describe('an assembled species is BUILT rather than fetched', () => {
  it('reaches the island as real geometry, not as a promise that resolved', async () => {
    const field = await fieldOf(pet('a', BUILT))

    // In the scene graph, under the field's own group, where the camera is.
    const holder = holderOf(field, 'a')
    expect(holder, 'the built species never reached the island').toBeDefined()
    expect(holder!.parent).toBe(field.group)
    expect(field.positionOf('a')).not.toBeNull()

    // And it is an animal rather than an empty node: the same meshes the real
    // kit makes, each with vertices in it.
    const meshes = meshesOf(modelOf(field, 'a'))
    expect(meshes.length).toBe(meshesOf(reference()).length)
    expect(meshes.length).toBeGreaterThan(1)
    for (const m of meshes) {
      expect(m.geometry.getAttribute('position').count, `${m.name} has no vertices`)
        .toBeGreaterThan(0)
      expect(m.geometry.getIndex()!.count, `${m.name} has no triangles`).toBeGreaterThan(0)
    }
    // Big enough to see, which an empty Group is not.
    const size = worldBox(modelOf(field, 'a')).getSize(new THREE.Vector3())
    expect(Math.min(size.x, size.y, size.z)).toBeGreaterThan(0)
  })

  it('asks the network for NOTHING — no GLB request is made for it at all', async () => {
    const field = await fieldOf(pet('a', BUILT))
    // The stub would have answered `animal-cow` perfectly well (see the last
    // suite), so this is `pets.ts` never asking rather than a loader that could
    // not have replied.
    expect(net.urls).toEqual([])
    // Warming and previewing take the same route, and must not leak a request
    // through the side doors either.
    await field.warm(BUILT)
    await field.preview(BUILT)
    expect(net.urls).toEqual([])
  })

  it('is measured at exactly the fresh build\'s width, taken down to 0.16', async () => {
    const field = await fieldOf(pet('a', BUILT))
    const want = worldBox(reference()).getSize(new THREE.Vector3())
    const got = worldBox(modelOf(field, 'a')).getSize(new THREE.Vector3())

    // No `fitInto` and no second scale: an assembly is authored at the pack's
    // own scale (the 1.43-2.02 height band, parts/hulls.ts), which is the same
    // units a Kenney GLB arrives in, so 0.16 is already its number.
    expect(got.x).toBeCloseTo(want.x * PET_SCALE, 9)
    expect(got.y).toBeCloseTo(want.y * PET_SCALE, 9)
    expect(got.z).toBeCloseTo(want.z * PET_SCALE, 9)

    // The keep-out radius `sync` derives from that box — half the wider of the
    // two ground axes — computed from the model rather than pinned to a number.
    const radius = Math.max(got.x, got.z) / 2
    expect(radius).toBeCloseTo(Math.max(want.x, want.z) * PET_SCALE / 2, 9)
  })

  it('stands its feet on y = 0 once scaled — the wrapper group', async () => {
    /*
     * THE ONE THING THAT LOOKS REMOVABLE AND IS NOT.
     *
     * `buildAssembly` grounds its animal with `group.position.y = -box.min.y` on
     * the group it RETURNS (parts/assembly.ts:617-619). A node's local matrix is
     * T·R·S, so its own translation is not scaled by its own scale: handing that
     * group straight to `sync`, which does `root.scale.setScalar(0.16)` on it,
     * shrinks the geometry and leaves the lift at full size. `prototype()`
     * therefore returns a plain wrapper with the assembly INSIDE it, so the
     * 0.16 reaches the lift as well as the vertices.
     *
     * MEASURED, and the briefing's magnitude is wrong — reported with the run.
     * Every one of the thirty shipped assemblies is authored with its feet
     * already on y = 0, so the lift is float dust rather than a whole animal:
     * -2.951e-5 for the hedgehog, and no species exceeds it. Unwrapped, the feet
     * land at `lift * (1 - 0.16)` = -2.479e-5 instead of 0 — real, off by a
     * factor of infinity, and invisible on a screen. The wrapper is still the
     * right construction and this is still the assertion that holds it: it is
     * the lift's SIZE that is small today, not the error, and a species whose
     * geometry does not start at zero would sink or float by the whole of it.
     */
    const lift = reference().position.y
    // Not vacuous: there is a lift to get wrong.
    expect(Math.abs(lift)).toBeGreaterThan(0)

    const field = await fieldOf(pet('a', BUILT))
    const feet = worldBox(modelOf(field, 'a')).min.y
    // Exact, not "close to nothing": with the wrapper the lift and the geometry
    // are scaled by the same factor and cancel, so this is zero to float noise.
    expect(Math.abs(feet), `feet are ${feet.toExponential(4)} off the ground`)
      .toBeLessThan(1e-9)
    // And the error the wrapper removes, stated so a future reader can see what
    // failing this assertion would mean.
    expect(Math.abs(lift * (1 - PET_SCALE))).toBeGreaterThan(1e-9)
  })

  it('assembles ONCE per species however many of that species are hatched', async () => {
    const field = await fieldOf(pet('a', BUILT), pet('b', BUILT))
    const one = meshesOf(modelOf(field, 'a'))
    const two = meshesOf(modelOf(field, 'b'))
    expect(one.length).toBe(two.length)
    expect(one.length).toBeGreaterThan(0)
    /*
     * The cache holds a PROMISE and `model()` clones what comes out of it, so
     * two pets of one species share geometry and material exactly as two pets of
     * one GLB do. Building per pet would give these different objects — and
     * would also mean a third build for `preview`, which the hatch calls while
     * the pet is being put down.
     */
    for (let i = 0; i < one.length; i++) {
      expect(one[i]!.geometry, 'a second pet re-built its own geometry')
        .toBe(two[i]!.geometry)
      expect(one[i]!.material).toBe(two[i]!.material)
    }
    // Distinct nodes all the same: it is a clone, not the prototype itself.
    expect(one[0]).not.toBe(two[0])
    const shown = await field.preview(BUILT)
    expect(meshesOf(shown)[0]!.geometry).toBe(one[0]!.geometry)
  })

  it('then walks about the island like any other pet', async () => {
    const field = await fieldOf(pet('a', BUILT))
    const from = field.positionOf('a')!
    // Ten seconds at 60fps: longer than the longest opening rest (`2 + rng()*6`),
    // so the pet has been asked to go somewhere whatever the seed drew.
    for (let i = 0; i < 600; i++) field.update(1 / 60, i / 60, ISLAND, HEX)
    const to = field.positionOf('a')!
    // HORIZONTAL travel, not the hop: `pos.y` moves every frame on a pet that is
    // standing perfectly still, so a y-inclusive distance would pass on a pet
    // that never went anywhere.
    expect(Math.hypot(to.x - from.x, to.z - from.z)).toBeGreaterThan(0.25)
  })
})

describe('a species that cannot be built OR fetched is dropped OUT LOUD', () => {
  let spy: ReturnType<typeof vi.spyOn>

  beforeEach(() => { spy = vi.spyOn(console, 'error').mockImplementation(() => {}) })
  afterEach(() => { spy.mockRestore() })

  it('says so exactly once, by name, and never joins the island', async () => {
    const field = createPetField('', mulberry32(SEED))
    const ghost = pet('x', NEITHER)
    await field.sync([ghost], ISLAND, HEX)

    expect(holderOf(field, 'x'), 'an unbuildable species reached the island').toBeUndefined()
    expect(field.positionOf('x'), 'an unbuildable species is in `live`').toBeNull()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(String(spy.mock.calls[0]![0])).toContain(NEITHER)

    /*
     * ONCE PER SPECIES, not once per frame. `main.ts` calls `void pets.sync(...)`
     * from the frame loop, so a report per attempt is 60 lines a second — a
     * second bug dressed as the fix for the first.
     */
    for (let i = 0; i < 5; i++) await field.sync([ghost], ISLAND, HEX)
    expect(spy).toHaveBeenCalledTimes(1)
    // And the retry itself is intact: nothing was added to `live` or remembered
    // as unbuildable, so those five syncs each genuinely tried again.
    expect(net.urls.filter(u => u.includes(NEITHER))).toHaveLength(6)
  })

  it('costs that species alone — the pets around it still arrive', async () => {
    const field = createPetField('', mulberry32(SEED))
    await field.sync(
      [pet('x', NEITHER), pet('a', BUILT), pet('c', FETCHED)], ISLAND, HEX)

    expect(holderOf(field, 'x')).toBeUndefined()
    // The built one, and the fetched one that proves the stub loader works.
    expect(holderOf(field, 'a'), 'the built pet was lost with the broken one').toBeDefined()
    expect(holderOf(field, 'c'), 'the fetched pet was lost with the broken one').toBeDefined()
    expect(spy).toHaveBeenCalledTimes(1)

    // The GLB path is untouched by any of this: one request for the cow, one
    // failed request for the ghost, and nothing at all for the hedgehog.
    expect(net.urls.filter(u => u.includes(BUILT))).toHaveLength(0)
    expect(net.urls.filter(u => u.includes(FETCHED))).toHaveLength(1)
  })
})
