/**
 * @vitest-environment jsdom
 *
 * ONE PIECE THAT WILL NOT LOAD COSTS THAT PIECE, NEVER THE ISLAND.
 *
 * `increments.ts` has the rule in as many words — "a missing piece leaves a gap,
 * never a broken build" — and it has been broken four times now, always the same
 * way and always in a loop. `props.sync()` walks every tile and `pets.sync()`
 * walks every friend; both are called as `void x.sync(...)` from main.ts, so an
 * awaited fetch that rejects mid-loop abandoned every item AFTER it and then
 * surfaced as an unhandled rejection with nothing to say about which tile it
 * was. The first report of this was an island of nineteen hexes with scenery on
 * exactly one of them (see `coverPiece`), and the reason it took so long to find
 * is that the failure looks like a LAYOUT bug from the sofa.
 *
 * So the assertions here are all the same assertion, aimed at the four awaits
 * that stand inside a loop: kill one model, and count what still arrives.
 *
 * The loader is stubbed because it is I/O and because a rejection is the whole
 * subject; everything else — the hash, `fitInto`, `firstClear`, the real scene
 * graph — runs for real, so a piece that this file says was planted is a piece
 * you could look at.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as THREE from 'three'

/** Substrings of a URL that the stubbed loader refuses to fetch. */
const dead = vi.hoisted(() => new Set<string>())

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await import('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      for (const bad of dead) {
        // What a 404 from the dev server really does: it answers with
        // index.html and GLTFLoader throws on the leading `<`.
        if (url.includes(bad)) throw new SyntaxError(`Unexpected token '<' — ${url}`)
      }
      const name = (url.split('/').pop() ?? '').replace(/\.(gltf|glb)$/, '')
      const mesh = new T.Mesh(
        new T.BoxGeometry(1, 1.4, 1), new T.MeshStandardMaterial())
      mesh.position.y = 0.7
      const scene = new T.Group()
      scene.name = name
      scene.add(mesh)
      return { scene }
    }
  }
  return { GLTFLoader }
})

import { createPropField } from '../../src/island/world/props'
import { createPetField } from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { LightingPreset } from '../../src/island/lighting'
import type { Surface } from '../../src/island/world/tiles'
import type { Island } from '../../src/island/world/grid'
import type { Pet } from '../../src/island/flow'

const HEX = 1.1545
const flat: Surface = { heightAt: () => 0, groundAt: () => 'green' }

/** Six dry hexes, so "the rest of the island" is a countable thing. */
const LAND: Island = {
  tiles: new Map([
    ['0,0', 'grass'], ['1,0', 'grass'], ['0,1', 'grass'],
    ['-1,1', 'grass'], ['1,-1', 'grass'], ['-1,0', 'grass'],
  ]),
}

const POND: Island = {
  tiles: new Map([['0,0', 'water'], ['1,0', 'water'], ['0,1', 'water']]),
}

/** What the field has actually planted, clouds and blobs discounted. */
const planted = (group: THREE.Object3D): THREE.Object3D[] =>
  group.children.filter(c => c.name !== 'prop-shadow' && !/^cloud/.test(c.name))

const cloudsIn = (group: THREE.Object3D): THREE.Object3D[] =>
  group.children.filter(c => /^cloud/.test(c.name))

const pet = (id: string, species: string): Pet =>
  ({ id, name: id, species, at: { q: 0, r: 0 } })

/** Where a live pet's model ended up, or undefined if it never arrived. */
const petAt = (group: THREE.Object3D, id: string): THREE.Object3D | undefined =>
  group.children.find(c => (c.userData.pick as { id?: string } | undefined)?.id === id)

beforeEach(() => {
  dead.clear()
  createLighting(null, meadowDay as LightingPreset)
  vi.spyOn(THREE.TextureLoader.prototype, 'loadAsync')
    .mockResolvedValue(new THREE.Texture())
})

describe('the scenery survives a model it cannot fetch', () => {
  it('dresses the island even when every cloud 404s', async () => {
    /*
     * The clouds load FIRST, before a single tile is looked at, so this await
     * was the most expensive one in the file: a decoration 34 units away in the
     * sky, and its failure meant an island with nothing growing on it.
     */
    dead.add('cloud')
    const props = createPropField()
    await props.sync(LAND, HEX, flat)

    expect(cloudsIn(props.group)).toHaveLength(0)
    expect(planted(props.group).length).toBeGreaterThan(0)
  })

  it('keeps the five clouds that did load when one is missing', async () => {
    // Six is arbitrary and five is still a sky. What is not acceptable is
    // five clouds and a bare island.
    dead.add('cloud_big')
    const props = createPropField()
    await props.sync(LAND, HEX, flat)

    const clouds = cloudsIn(props.group)
    expect(clouds).toHaveLength(3)                 // the three `cloud_small`
    for (const c of clouds) expect(c.name).toBe('cloud_small')
    expect(planted(props.group).length).toBeGreaterThan(0)
  })

  it('plants the rest of a pond when one lily is missing', async () => {
    dead.add('waterlily_A')
    const props = createPropField()
    await props.sync(POND, HEX, flat)

    const bits = planted(props.group)
    expect(bits.length).toBeGreaterThan(0)
    for (const b of bits) expect(b.name).not.toBe('waterlily_A')
  })

  it('dresses the dry tiles when the ponds cannot be dressed at all', async () => {
    /*
     * Water is handled in its own branch at the top of the tile loop, so a pond
     * that threw took every LATER tile with it — including the grass ones the
     * child is actually standing on.
     */
    for (const n of ['waterlily', 'waterplant']) dead.add(n)
    /*
     * The ponds are hexes of their own AND THEY COME FIRST — the tile loop
     * walks the map in insertion order, so a pond that shares a coordinate with
     * a grass tile, or that sits after one, tests nothing.
     */
    const mixed: Island = {
      tiles: new Map<string, 'grass' | 'water'>([
        ['2,0', 'water'], ['2,-1', 'water'], ...LAND.tiles,
      ] as [string, 'grass' | 'water'][]),
    }
    expect([...mixed.tiles.values()].indexOf('water')).toBe(0)
    const props = createPropField()
    await props.sync(mixed, HEX, flat)

    expect(planted(props.group).length).toBeGreaterThan(0)
  })

  it('resolves rather than rejecting, because main.ts only says `void`', async () => {
    // The other half of the fault: nothing was awaiting `sync`, so the reason
    // went to the unhandled-rejection handler and the console said nothing
    // about which tile or which file.
    for (const n of ['cloud', 'waterlily', 'waterplant']) dead.add(n)
    const props = createPropField()
    await expect(props.sync(POND, HEX, flat)).resolves.toBeUndefined()
  })
})

describe('a friend whose model will not load', () => {
  it('costs that friend only — the others still arrive', async () => {
    /*
     * The worst ordering is the one that matters: the pet that fails is FIRST
     * in the list, so under the old code the friend she had just hatched was
     * the one that never appeared.
     */
    dead.add('animal-cow')
    const pets = createPetField()
    await pets.sync([pet('a', 'animal-cow'), pet('b', 'animal-pig')], LAND, HEX)

    expect(petAt(pets.group, 'a')).toBeUndefined()
    expect(petAt(pets.group, 'b')).toBeDefined()
  })

  it('arrives on the next sync, because a failure is not remembered', async () => {
    /*
     * Unlike the scenery, this one retries for free and MUST: `prototype`
     * evicts a rejected promise from the cache, and nothing has been added to
     * the group or to `live` at the point the load fails, so the pet is still
     * unbuilt by every test in that module. Brief §19 — nothing she owns is
     * lost — is the reason it cannot be left at "gone for this session".
     */
    dead.add('animal-cow')
    const pets = createPetField()
    await pets.sync([pet('a', 'animal-cow')], LAND, HEX)
    expect(petAt(pets.group, 'a')).toBeUndefined()

    dead.clear()
    await pets.sync([pet('a', 'animal-cow')], LAND, HEX)
    expect(petAt(pets.group, 'a')).toBeDefined()
  })

  it('resolves rather than rejecting, for the same reason as the scenery', async () => {
    dead.add('animal-')
    const pets = createPetField()
    await expect(pets.sync([pet('a', 'animal-cow')], LAND, HEX))
      .resolves.toBeUndefined()
  })
})
