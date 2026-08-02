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

/**
 * Models the stub should hand back at a stated WIDTH rather than at 1.
 *
 * Empty for everything above, which is deliberate: a uniform box keeps the
 * refusal tests about the fetch and nothing else. PB-053 is the one question in
 * this file that turns on size — a mountain is refused because it is too wide
 * for the gap — so that block, and only that block, fills this in with the
 * measured widths.
 */
const sized = vi.hoisted(() => new Map<string, number>())

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
      const w = sized.get(name) ?? 1
      const mesh = new T.Mesh(
        new T.BoxGeometry(w, 1.4, w), new T.MeshStandardMaterial())
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
import {
  MOUNTAIN_HEXES, MOUNTAIN_FOOTPRINT,
  mountainHexFor, mountainFallbackFor, mountainSpinFor,
} from '../../src/island/world/mountains'
import { toWorld } from '../../src/island/world/hex'
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
  sized.clear()
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

/* ----------------------------------------------------------------- PB-053 */

/**
 * The other way a hex ends up bare: not a fetch that failed, but a mountain that
 * would not fit.
 *
 * `props.ts` gives a mountain hex ONE candidate position — dead centre, because
 * the mound is the tile — so a refusal there is final, and `placed.add(k)` shuts
 * the hex for the session. The C-family models measure 1.011493 in placement
 * radius against 2.0000 between adjacent centres, so a C beside a C loses one of
 * the two: 14.4% of adjacent rock pairs, a rock tile with no rock on it.
 *
 * `mountains.test.ts` proves the arithmetic and the pure model of it. THIS proves
 * that `props.ts` actually performs the retry, on the real scene graph, with the
 * real `firstClear` — which is the only thing the child can see.
 */
describe('a mountain that will not fit is replaced, not dropped', () => {
  const MOUNTAINS = /^mountain_/
  const peaks = (group: THREE.Object3D): THREE.Object3D[] =>
    group.children.filter(c => MOUNTAINS.test(c.name))

  /** The measured widths, so the stubbed boxes collide exactly as the art does. */
  const withRealWidths = (): void => {
    for (const { name } of MOUNTAIN_HEXES) {
      sized.set(name, 2 * (MOUNTAIN_FOOTPRINT[name] as number))
    }
  }

  /** Two adjacent hexes that both hash to the same C-family peak. */
  const FIRST = { q: 1, r: 0 }
  const SECOND = { q: 2, r: 0 }
  const RANGE: Island = { tiles: new Map([['1,0', 'rock'], ['2,0', 'rock']]) }

  it('plants BOTH hexes of a colliding pair', async () => {
    // The premise, checked rather than assumed: these two really do refuse.
    expect(mountainHexFor(FIRST)).toBe(mountainHexFor(SECOND))
    expect(2 * (MOUNTAIN_FOOTPRINT[mountainHexFor(FIRST)] as number))
      .toBeGreaterThan(Math.sqrt(3) * HEX)

    withRealWidths()
    const props = createPropField()
    await props.sync(RANGE, HEX, flat)

    const both = peaks(props.group)
    expect(both).toHaveLength(2)
    // The first keeps the peak it always had; the second takes the fallback.
    expect(both.map(p => p.name)).toEqual([
      mountainHexFor(FIRST), mountainFallbackFor(SECOND),
    ])
    // ...and the fallback is a DIFFERENT model, or nothing was retried.
    expect(mountainFallbackFor(SECOND)).not.toBe(mountainHexFor(SECOND))
  })

  it('leaves the retried mountain on its own hex centre, at native size', async () => {
    withRealWidths()
    const props = createPropField()
    await props.sync(RANGE, HEX, flat)

    const [first, second] = peaks(props.group)
    for (const [obj, a] of [[first, FIRST], [second, SECOND]] as const) {
      const w = toWorld(a, HEX)
      // Dead centre: `spread` is 0 for a rock tile and the retry did not move it.
      expect(obj?.position.x).toBeCloseTo(w.x, 6)
      expect(obj?.position.z).toBeCloseTo(w.z, 6)
      // NATIVE SIZE — `fitInto` is gated behind `!rockTile` and the retry takes
      // the same path, so a scale factor here would be a real regression.
      expect(obj?.scale.x).toBeCloseTo(1, 6)
      expect(obj?.scale.y).toBeCloseTo(1, 6)
      // ...and the shared facing, not a fresh roll.
      expect(obj?.rotation.y).toBeCloseTo(mountainSpinFor(a), 6)
    }
  })

  it('does not retry a hex that was never refused', async () => {
    // The fix may not touch what already worked: alone, the hex keeps its
    // primary peak, which is what every existing save contains.
    withRealWidths()
    const props = createPropField()
    await props.sync({ tiles: new Map([['1,0', 'rock']]) } as Island, HEX, flat)

    expect(peaks(props.group).map(p => p.name)).toEqual([mountainHexFor(FIRST)])
  })

  it('gives up honestly when the fallback cannot be fetched either', async () => {
    // Refused, then 404: the hex goes bare and the island still finishes. The
    // old behaviour, kept for the case where there is genuinely nothing to put
    // down — a lost piece, never a lost island.
    withRealWidths()
    dead.add(mountainFallbackFor(SECOND))
    const props = createPropField()
    await expect(props.sync(RANGE, HEX, flat)).resolves.toBeUndefined()

    expect(peaks(props.group).map(p => p.name)).toEqual([mountainHexFor(FIRST)])
  })
})

describe('a friend whose model will not load', () => {
  it('costs that friend only — the others still arrive', async () => {
    /*
     * The worst ordering is the one that matters: the pet that fails is FIRST
     * in the list, so under the old code the friend the child had just
     * hatched was the one that never appeared.
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
     * unbuilt by every test in that module. Brief §19 — nothing they own is
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
