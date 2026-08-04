/**
 * @vitest-environment jsdom
 *
 * PB-070, END TO END: a hand-assembled animal Joe has signed off is DEALT,
 * hatched, rendered, walked, saved, reloaded, and is still there.
 *
 * ## Why this file is shaped like a chain and not like a set of units
 *
 * `docs/HANDOFF.md` §5 counts four features that shipped dead behind a green
 * suite. The worst of them, `flow.plot`, was declared, read by the renderer, and
 * assigned by NOTHING — and every test passed, because the tests mocked the port
 * and asserted that a function had been called. A test that proves an assembled
 * id is "in the pool" while nothing of it ever reaches a screen is that same
 * fault wearing this card's name, so the pool is only the first link here and
 * every link after it asserts that a REAL thing happened:
 *
 *     deal -> hatch -> render -> walk -> save -> reload -> still there
 *
 * Each stage below performs its own step against the real code and hands the
 * result to the next. They run in order, and the value each one asserts on is
 * the value the previous stage produced — never a literal retyped alongside it.
 * Dealing `'animal-hedgehog'` and then rendering a hard-coded `'animal-hedgehog'`
 * would prove the two halves work and say nothing about whether they are joined.
 *
 * ## What is real here, and what is not
 *
 * Real: the registry, `dealPool`, `makeCollectionDeck`, `SPECIES`, the flow's own
 * hatch (`tapEgg` + `handleChallengePassed`), `buildAssembly` and every vertex it
 * makes, `createPetField` with its measuring, siting, blob and tap proxy, the
 * `update` loop, `createLocalStore` over jsdom's real `localStorage`, and
 * `saveIsland` / `loadIsland`.
 *
 * Stubbed: `GLTFLoader`, and nothing else. It is a loader that genuinely WORKS
 * for a species the pack really ships (`animal-cow`, hatched below in the same
 * file) and 404s for everything else, which is what the real server does. That
 * is deliberate: a stub that could never have answered would make "the assembled
 * species put no request on the wire" unfalsifiable.
 *
 * INJECTED: Joe's tick, and only Joe's tick. `dealPool(base, signedOff)` takes it
 * as a `readonly string[]` parameter precisely so a test can state it as DATA
 * rather than assert that a mock ran. The live mirror is legitimately EMPTY today
 * — he has ticked nobody — so passing `[BUILT]` here is this file saying "suppose
 * he ticks the hedgehog tonight", which is the exact question the card asks.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Every URL the field asked the network for. For a built species: none. */
const net = vi.hoisted(() => ({ urls: [] as string[] }))

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await vi.importActual<typeof import('three')>('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      net.urls.push(url)
      // The pack ships 24 GLBs and no more. Anything else 404s, which is what a
      // hand-assembled species used to get and how thirty of them stayed
      // invisible for weeks.
      if (!url.includes('animal-cow')) throw new Error(`404 Not Found: ${url}`)
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

import { createPetField, SPECIES } from '../../src/island/pets'
import { buildAssembly } from '../../src/island/species/parts/assembly'
import { dealPool } from '../../src/island/species/pool'
import { makeCollectionDeck } from '../../src/island/collection'
import { speciesRecord } from '../../src/island/species/registry'
import { balance } from '../../src/island/balance'
import { createFlow, tapEgg } from '../../src/island/flow'
import { handleChallengePassed } from '../../src/island/interactions'
import { place } from '../../src/island/world/grid'
import { createLocalStore } from '../../src/platform/storage'
import { saveIsland, loadIsland } from '../../src/island/save'
import { createLighting } from '../../src/island/lighting'
import { givenName } from '../../src/island/species/naming'
import { mulberry32 } from '../../src/core/rng'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { Flow, Pet } from '../../src/island/flow'
import type { Island } from '../../src/island/world/grid'
import type { LightingPreset } from '../../src/island/lighting'

type Field = ReturnType<typeof createPetField>

/**
 * The species this file is about: registered, assembled, and NOT one of the 24.
 *
 * `parts/assembled/index.ts` lists thirty real ids and the hedgehog is the first
 * of them, being the first that shipped. It is asserted to be registered and to
 * carry an `assembly` below, rather than assumed — if that wiring is ever
 * removed, this file goes red instead of quietly re-testing the GLB path.
 */
const BUILT = 'animal-hedgehog'
/** A species the pack really has a file for. The control, and the stub's proof. */
const FETCHED = 'animal-cow'

const HEX = 1.1545
const MEMORY = balance.pets.speciesMemory
/** The scale `sync` puts every pet at, built or fetched. */
const PET_SCALE = 0.16

/*
 * Seeded, per `docs/HANDOFF.md` "Landmines added 1 August (PB-054)": where a pet
 * wants to go, how long it rests and the phase of its hop are all drawn from the
 * field's own `Rng`, so an assertion about where a pet ENDED UP is an assertion
 * about a coin toss unless the draw is controlled. Fixed once, here. Never a
 * retry loop, never a widened tolerance.
 */
const FIELD_SEED = 7
const DEAL_SEED = 11

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/* ------------------------------------------------------------- tools --- */

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
 * "There is an animal here", stated so it cannot pass on an empty node.
 *
 * A `Group` with nothing in it satisfies "the pet is in the scene graph" and is
 * exactly what a silently-dropped species leaves behind, so every claim about
 * rendering below goes through this: real meshes, real vertices, real triangles,
 * and a measured world box with size on all three axes.
 */
function assertRenders(field: Field, id: string, where: string, least = 1): void {
  const holder = holderOf(field, id)
  expect(holder, `${where}: nothing reached the island for pet "${id}"`).toBeDefined()
  expect(holder!.parent, `${where}: the pet is not under the field's group`)
    .toBe(field.group)
  expect(field.positionOf(id), `${where}: the pet is not live`).not.toBeNull()

  const model = modelOf(field, id)
  const meshes = meshesOf(model)
  expect(meshes.length, `${where}: the pet is an empty node — no meshes at all`)
    .toBeGreaterThanOrEqual(least)
  for (const m of meshes) {
    expect(m.geometry.getAttribute('position').count, `${where}: ${m.name} has no vertices`)
      .toBeGreaterThan(0)
    expect(m.geometry.getIndex()!.count, `${where}: ${m.name} has no triangles`)
      .toBeGreaterThan(0)
  }
  const size = worldBox(model).getSize(new THREE.Vector3())
  expect(Math.min(size.x, size.y, size.z), `${where}: the pet measures nothing`)
    .toBeGreaterThan(0)
}

/**
 * How many meshes the real kit makes for this species, built fresh and
 * independently — so "there is a whole animal here" is DERIVED from the animal
 * rather than typed in beside it. Re-proportion the hedgehog and it follows.
 */
function partCount(): number {
  const spec = speciesRecord(BUILT)?.assembly
  expect(spec, `"${BUILT}" is not a registered species with an assembly`).toBeDefined()
  return meshesOf(buildAssembly(spec!)).length
}

/**
 * Read pages until the egg actually hatches, holding one species throughout —
 * which is `main.ts`'s own behaviour and not a convenience. The friend in the
 * egg is fixed the moment the previous one hatched, and every page in between
 * reads to the same animal.
 */
function hatchOnce(f: Flow, species: string, name: string): Flow {
  for (let page = 0; page < 200; page++) {
    const before = f.pets.length
    f = handleChallengePassed(tapEgg(f), { name, species })
    if (f.pets.length > before) return f
  }
  throw new Error(`the egg never hatched for "${species}"`)
}

/**
 * Seven hexes, grown through the REAL grid rather than typed as a literal, so
 * the island the flow carries is the island that gets saved and the island the
 * field is driven with — one object, not three that agree.
 *
 * Seven and not one because `randomSpot` draws a tile and then a point inside
 * it: on a one-tile island a pet's goal frequently lands inside the 0.12
 * "arrived" radius it is already standing in, which is a pet resting rather than
 * a pet that cannot move, and the difference is not something an assertion
 * should have to guess at.
 */
function sevenHexes(): Island {
  let island = createFlow().island
  for (const a of [
    { q: 1, r: 0 }, { q: -1, r: 0 }, { q: 0, r: 1 },
    { q: 0, r: -1 }, { q: 1, r: -1 }, { q: -1, r: 1 },
  ]) island = place(island, a, 'grass')
  return island
}

beforeEach(() => {
  net.urls.length = 0
  createLighting(null, meadowDay as LightingPreset)
})

/* ---------------------------------------------------------- premises --- */

describe('the ground this stands on', () => {
  it('is a genuinely registered assembled species, outside the base pack', () => {
    /*
     * Asserted rather than assumed. If the hedgehog ever stops carrying an
     * `assembly`, every stage below would still pass — through the GLB route,
     * against a loader that 404s — while proving nothing at all about the
     * feature. This fails first and says which premise went.
     */
    const record = speciesRecord(BUILT)
    expect(record, `"${BUILT}" is not on the registry at all`).toBeDefined()
    expect(record!.assembly, `"${BUILT}" is registered but carries no assembly`)
      .toBeDefined()
    expect([...SPECIES]).not.toContain(BUILT)
    expect([...SPECIES]).toContain(FETCHED)
  })
})

/* -------------------------------------------------------- THE CHAIN --- */

/**
 * What each link hands to the next. Nothing here is a literal: every field is
 * whatever the previous stage actually produced.
 */
const stage: {
  dealt?: string
  flow?: Flow
  island?: Island
  field?: Field
  walkedFrom?: THREE.Vector3
  reloaded?: readonly Pet[]
} = {}

describe('deal -> hatch -> render -> walk -> save -> reload', () => {
  it('1. DEAL: the deck hands out the assembled species itself', () => {
    /*
     * The real dealer, built exactly as `main.ts` builds it — real `SPECIES`,
     * real `dealPool`, real `makeCollectionDeck`, real `speciesMemory`. The one
     * injected value is Joe's tick.
     */
    const pool = dealPool([...SPECIES], [BUILT])
    expect(pool).toHaveLength(SPECIES.length + 1)

    const deck = makeCollectionDeck(mulberry32(DEAL_SEED), pool, MEMORY)
    // Every Kenney animal is already home, so the assembled one is the only
    // creature in the game the child has not met.
    deck.remember([...SPECIES])

    const dealt = deck()
    expect(
      dealt,
      'the deck dealt a species the child already owns while an unmet animal '
      + 'was waiting — the assembled species is not reachable through the deal',
    ).toBe(BUILT)
    stage.dealt = dealt

    /*
     * NOT A LUCKY SEED. With the 24 remembered there is exactly one unmet
     * animal, so the collection rule must produce it on every seed — a draw that
     * only sometimes reaches the assembled species is a child who only sometimes
     * meets it.
     */
    for (let seed = 1; seed <= 25; seed++) {
      const d = makeCollectionDeck(mulberry32(seed), pool, MEMORY)
      d.remember([...SPECIES])
      expect(d(), `seed ${seed} did not deal the only unmet animal`).toBe(BUILT)
    }
  })

  it('1b. DEAL: and cannot, if the pool is the base pack alone', () => {
    /*
     * The control, and the shape of the bug the card names: for as long as the
     * deck was built over `SPECIES`, Joe could have signed off all thirty
     * assembled animals and Juno would never have met one. Fifty draws over a
     * pack the child has entirely collected, and the hedgehog is not among them
     * because it was never in the hat.
     */
    const deck = makeCollectionDeck(mulberry32(DEAL_SEED), [...SPECIES], MEMORY)
    deck.remember([...SPECIES])
    const drawn = Array.from({ length: 50 }, () => deck())
    expect(drawn, 'a base-pack-only deck reached an assembled species')
      .not.toContain(BUILT)
  })

  it('2. HATCH: the flow puts that dealt species on the island as a pet', () => {
    expect(stage.dealt, 'nothing was dealt to hatch').toBe(BUILT)

    // The real hatch: tap the egg, read pages, until a pet lands.
    const island = sevenHexes()
    let flow: Flow = { ...createFlow(), island }
    flow = hatchOnce(flow, stage.dealt!, 'Prickle')

    expect(flow.pets, 'the egg hatched nothing').toHaveLength(1)
    const pet = flow.pets[0]!
    expect(
      pet.species,
      'the flow recorded a different species from the one that was dealt',
    ).toBe(stage.dealt)
    expect(pet.name).toBe('Prickle')
    expect(island.tiles.has(`${pet.at.q},${pet.at.r}`),
      'the pet was hatched onto a hex the island does not own').toBe(true)

    stage.flow = flow
    stage.island = island
  })

  it('3. RENDER: it reaches the scene graph as real geometry, asking for no GLB', async () => {
    expect(stage.flow, 'nothing hatched to render').toBeDefined()

    const field = createPetField('', mulberry32(FIELD_SEED))
    await field.sync(stage.flow!.pets, stage.island!, HEX)

    // Every mesh the real kit makes for this species, counted off a fresh
    // independent build rather than pinned to a number.
    assertRenders(field, stage.flow!.pets[0]!.id, 'first load', partCount())

    /*
     * AND NOTHING WENT ON THE WIRE. The stub above answers `animal-cow`
     * perfectly well (see the last suite in this file), so this is `pets.ts`
     * never asking rather than a loader that could not have replied. Before the
     * fork in `prototype()` this species 404'd, `sync` swallowed the reason with
     * the pet, and the child watched an egg hatch into nothing.
     */
    expect(net.urls, 'a GLB was requested for a species that is built, not fetched')
      .toEqual([])

    // Standing on its tile rather than floating over it — the wrapper group's
    // whole job, at the scale `sync` actually applies.
    const feet = worldBox(modelOf(field, stage.flow!.pets[0]!.id)).min.y
    expect(Math.abs(feet), `feet are ${feet.toExponential(4)} off the ground`)
      .toBeLessThan(1e-9)

    // And it is the pack's own size, taken down to 0.16 like any Kenney pet.
    const size = worldBox(modelOf(field, stage.flow!.pets[0]!.id))
      .getSize(new THREE.Vector3())
    expect(size.y).toBeGreaterThan(1.43 * PET_SCALE * 0.9)
    expect(size.y).toBeLessThan(2.02 * PET_SCALE * 1.1)

    stage.field = field
  })

  it('4. WALK: it goes somewhere, horizontally, on the real update loop', () => {
    expect(stage.field, 'nothing rendered to walk').toBeDefined()
    const field = stage.field!
    const id = stage.flow!.pets[0]!.id

    const from = field.positionOf(id)!
    stage.walkedFrom = from.clone()

    /*
     * Ten seconds at 60fps, driven through the real `update` — longer than the
     * longest opening rest (`2 + rng()*6`), so the pet has been asked to go
     * somewhere whatever the seed drew.
     */
    for (let i = 0; i < 600; i++) field.update(1 / 60, i / 60, stage.island!, HEX)

    const to = field.positionOf(id)!
    /*
     * HORIZONTAL travel, not the hop. `pos.y` moves every frame on a pet that is
     * standing perfectly still — the idle bob — so a y-inclusive distance would
     * pass on a pet that never went anywhere at all.
     */
    expect(
      Math.hypot(to.x - from.x, to.z - from.z),
      'the assembled pet renders but never moves off the spot it was put down on',
    ).toBeGreaterThan(0.25)

    // Still on the island it is walking about, not off into the sea.
    expect(Math.hypot(to.x, to.z)).toBeLessThan(HEX * 3)
  })

  it('5. SAVE: the species survives the real save layer, bytes and all', async () => {
    expect(stage.flow, 'nothing hatched to save').toBeDefined()
    /*
     * THE REAL STORE over jsdom's real `localStorage`, not a hand-written blob.
     * The point of this link is that nothing between `Flow` and the bytes
     * validates a species id against the 24 — if anything did, a signed-off
     * animal would hatch, walk, and then vanish on the next load, which is the
     * worst possible place for this to fail.
     */
    const store = createLocalStore()
    const profile = 'p-deal-assembled'
    await saveIsland(store, profile, stage.flow!, true, 'Juno')

    // The id really is in the bytes on disk, not merely in an object that was
    // handed back.
    const raw = window.localStorage.getItem(`petIsland.v1.${profile}.save`)
    expect(raw, 'the save layer wrote nothing at all').not.toBeNull()
    expect(raw, 'the assembled species is not in the saved bytes').toContain(BUILT)

    const loaded = await loadIsland(store, profile)
    expect(loaded.flow.pets, 'the pet did not survive the round trip').toHaveLength(1)
    const back = loaded.flow.pets[0]!
    const before = stage.flow!.pets[0]!
    expect(
      back.species,
      'the save layer rejected or rewrote a species that is not one of the 24',
    ).toBe(BUILT)
    /* Whole record intact, not merely the species field — EXCEPT the name, which
     * the save layer re-syncs to the species' frozen one since 4 August
     * (`save.ts:renamedToPins`, Joe: "we rename once, kids will live through
     * it"). This fixture is hatched with a hand-written name, so it is renamed
     * on the way back; everything that identifies the pet is unchanged. */
    expect({ ...back, name: '' }).toEqual({ ...before, name: '' })
    expect(back.name).toBe(givenName(BUILT))
    // And genuinely round-tripped rather than the same object handed back.
    expect(back).not.toBe(before)
    // The island came back too, so the reload below stands on the same ground.
    expect(loaded.flow.island.tiles.size).toBe(stage.island!.tiles.size)

    stage.reloaded = loaded.flow.pets
  })

  it('6. RELOAD: a brand-new field renders it again, still asking for no GLB', async () => {
    expect(stage.reloaded, 'nothing came back from the save to reload').toBeDefined()
    /*
     * A SECOND FIELD, which is what a reload really is. `sync` IS the load path
     * (HANDOFF §6) and it skips pets that are already live, so re-syncing the
     * first field would assert nothing — a fresh `createPetField` has a fresh
     * prototype cache and has never heard of this species, exactly as a
     * cold-booted tab has not.
     */
    const reloaded = createPetField('', mulberry32(FIELD_SEED))
    await reloaded.sync(stage.reloaded!, stage.island!, HEX)

    assertRenders(reloaded, stage.reloaded![0]!.id, 'after reload', partCount())
    expect(net.urls, 'the reloaded pet went looking for a GLB').toEqual([])

    // Still the species it was, all the way through. This is the assertion the
    // whole file exists to reach.
    expect(stage.reloaded![0]!.species).toBe(BUILT)
    expect(stage.reloaded![0]!.species).toBe(stage.dealt)

    // And it walks after a reload as well, which is the state the child actually
    // finds their island in every time they open the game.
    const id = stage.reloaded![0]!.id
    const from = reloaded.positionOf(id)!
    for (let i = 0; i < 600; i++) reloaded.update(1 / 60, i / 60, stage.island!, HEX)
    const to = reloaded.positionOf(id)!
    expect(
      Math.hypot(to.x - from.x, to.z - from.z),
      'the reloaded pet stands still',
    ).toBeGreaterThan(0.25)
  })
})

/* ------------------------------------------------ one prototype, shared --- */

describe('two pets of one assembled species share one prototype', () => {
  const pet = (id: string, species: string): Pet =>
    ({ id, name: id, species, at: { q: 0, r: 0 } })

  it('share geometry and material objects, rather than each building their own', async () => {
    const field = createPetField('', mulberry32(FIELD_SEED))
    await field.sync([pet('a', BUILT), pet('b', BUILT)], sevenHexes(), HEX)

    const one = meshesOf(modelOf(field, 'a'))
    const two = meshesOf(modelOf(field, 'b'))
    expect(one.length).toBe(two.length)
    expect(one.length).toBeGreaterThan(1)
    /*
     * The cache holds a PROMISE and `model()` clones what comes out of it, so two
     * pets of one species share geometry and material exactly as two pets of one
     * GLB do. Building per pet would give these different objects — and would
     * also mean a third build for `preview`, which the hatch ceremony calls while
     * the pet is being put down.
     */
    for (let i = 0; i < one.length; i++) {
      expect(one[i]!.geometry, 'a second pet re-built its own geometry')
        .toBe(two[i]!.geometry)
      expect(one[i]!.material, 'a second pet re-built its own material')
        .toBe(two[i]!.material)
    }
    // Distinct nodes all the same: it is a clone, not the prototype itself.
    expect(one[0]).not.toBe(two[0])
    // The hatch's turntable copy comes off the same prototype.
    const shown = await field.preview(BUILT)
    expect(meshesOf(shown)[0]!.geometry).toBe(one[0]!.geometry)
    expect(net.urls).toEqual([])
  })

  it('and NOTHING of it is ever disposed — not a geometry, a material, or the palette', async () => {
    /*
     * NON-NEGOTIABLE, brief §19. An assembled species' texture is cached by
     * palette key in `parts/texture.ts` and its geometry and material are shared
     * by every pet of that species, so disposing one would blank an animal the
     * child ALREADY OWNS and is looking at. `tests/island/assembly-assert.ts`
     * holds the same line for the kit; this holds it for the pet field, which is
     * the code that actually clones, re-sites and re-syncs these objects.
     *
     * A comment cannot enforce it, so this listens for the `dispose` event on
     * every object the pet is wearing and then does all the things that might
     * plausibly free one: a second pet, a preview, a warm, a whole second field
     * for a reload.
     */
    const first = createPetField('', mulberry32(FIELD_SEED))
    await first.sync([pet('a', BUILT)], sevenHexes(), HEX)

    let disposed: string[] = []
    const watch = (o: THREE.EventDispatcher, what: string): void => {
      o.addEventListener('dispose' as never, () => { disposed.push(what) })
    }
    const meshes = meshesOf(modelOf(first, 'a'))
    expect(meshes.length).toBeGreaterThan(1)
    const maps = new Set<THREE.Texture>()
    for (const m of meshes) {
      watch(m.geometry, `${m.name} geometry`)
      const mat = m.material as THREE.MeshStandardMaterial
      watch(mat, `${m.name} material`)
      if (mat.map) { maps.add(mat.map); watch(mat.map, `${m.name} texture`) }
    }
    // One material and one baked palette for the whole animal, which is what
    // makes disposing one so expensive.
    expect(new Set(meshes.map(m => m.material)).size).toBe(1)
    expect(maps.size, 'the assembled species wears no palette texture').toBe(1)
    const palette = [...maps][0]!

    // Everything that could plausibly free something.
    await first.sync([pet('a', BUILT), pet('b', BUILT)], sevenHexes(), HEX)
    await first.preview(BUILT)
    await first.warm(BUILT)
    for (let i = 0; i < 120; i++) first.update(1 / 60, i / 60, sevenHexes(), HEX)

    const second = createPetField('', mulberry32(FIELD_SEED))
    await second.sync([pet('a', BUILT)], sevenHexes(), HEX)

    expect(disposed, `disposed: ${disposed.join(', ')}`).toEqual([])

    /*
     * And the reload is wearing the SAME baked palette, which is both the point
     * of the cache and the reason disposal would be fatal: had the first field's
     * texture been freed, this pet would be wearing dead pixels.
     */
    const reloadedMap =
      (meshesOf(modelOf(second, 'a'))[0]!.material as THREE.MeshStandardMaterial).map
    expect(reloadedMap, 'a reloaded pet baked its own second copy of the palette')
      .toBe(palette)
    expect((palette.image as ImageData).data.length).toBeGreaterThan(0)
    disposed = []
  })
})

/* --------------------------------------------- the loader really works --- */

describe('the control: a Kenney pet, through the same field and the same stub', () => {
  it('is FETCHED, and arrives — so "no request was made" above is a measured fact', async () => {
    /*
     * Without this, every "the network was never asked" assertion in this file
     * would be satisfied just as well by a loader that does nothing at all. The
     * cow goes through the GLB route in the same field, on the same stub, and
     * reaches the island — so the stub demonstrably CAN answer, and the silence
     * for the hedgehog is `pets.ts` choosing not to ask.
     */
    const field = createPetField('', mulberry32(FIELD_SEED))
    await field.sync([
      { id: 'k', name: 'Moo', species: FETCHED, at: { q: 0, r: 0 } },
      { id: 'h', name: 'Prickle', species: BUILT, at: { q: 1, r: 0 } },
    ], sevenHexes(), HEX)

    // One box is the whole of the stubbed GLB; the hedgehog is the kit's own
    // full mesh count, measured off a fresh build.
    assertRenders(field, 'k', 'the Kenney control', 1)
    assertRenders(field, 'h', 'the assembled species beside it', partCount())

    expect(net.urls.filter(u => u.includes(FETCHED)),
      'the fetched species was not requested — the stub is doing nothing')
      .toHaveLength(1)
    expect(net.urls.filter(u => u.includes(BUILT)),
      'the built species was requested over the network').toHaveLength(0)
  })
})

/* -------------------------------------------------- the shipped wiring --- */

describe('the entry point deals from the pool', () => {
  /*
   * A SOURCE-TEXT CHECK, AND IT IS SAID OUT LOUD BECAUSE IT IS WEAKER THAN
   * EVERYTHING ABOVE IT.
   *
   * `main.ts` exports nothing and self-boots into a WebGL context on import, so
   * there is no way to construct its deck from a test and watch what it deals —
   * every other link in this file drives real behaviour and this one cannot.
   * What it does do is fail if somebody puts `SPECIES` back where `dealPool`
   * now stands, which is a real regression with no other guard on it: the pool,
   * the fork and the round trip would all still be green and no signed-off
   * animal would ever be dealt to a child. It is the house backstop for this
   * exact file — `collection.test.ts`, `species.test.ts` and `preload.test.ts`
   * each keep one, for the same stated reason: main.ts is untested glue.
   *
   * To make this behavioural, `main.ts` would have to hand its deck
   * construction to something importable — a one-line `speciesDeck(rng, pets)`
   * factory next to `dealPool`, called from `boot()` — and this suite would then
   * assert on what that factory deals. That is a change to `src/` and is not
   * mine to make.
   */
  const main = readFileSync(resolve(REPO, 'src/island/main.ts'), 'utf8')

  it('builds its collection deck over dealPool(SPECIES), not the bare pack', () => {
    expect(
      /makeCollectionDeck\([\s\S]{0,120}?dealPool\(\s*SPECIES\s*\)/.test(main),
      'src/island/main.ts no longer deals from `dealPool(SPECIES)`, so a species '
      + 'Joe signs off can never be dealt however finished it is (PB-070)',
    ).toBe(true)
    expect(
      /makeCollectionDeck\(\s*defaultRng\s*,\s*SPECIES\s*,/.test(main),
      'src/island/main.ts passes the bare 24 to makeCollectionDeck',
    ).toBe(false)
    expect(main, 'main.ts does not import dealPool').toContain(
      "import { dealPool } from './species/pool'")
  })
})
