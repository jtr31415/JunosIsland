/**
 * @vitest-environment jsdom
 *
 * PB-052, the remedy — a pet that gets walled in is MOVED.
 *
 * `tests/island/sealing.test.ts` proves the defect exists and `walk.test.ts`
 * proves the geometry that causes it. Neither of them moves anything: both were
 * written while JT-033 was open. Joe has since ruled, verbatim:
 *
 *     "C - just relocate the animal from a trapped position, that is no issue
 *      at all"
 *
 * So this file asserts RECOVERY, and specifically the three things recovery has
 * to be true of to be worth anything:
 *
 *   1. a pet put down inside the ring does not stay there — which is also the
 *      repair for a save that is ALREADY sealed, because `sync` is the load
 *      path and `pet.at` is never written back;
 *   2. a pet that was out walking when the sixth mountain landed gets out too,
 *      through the stuck handler, which is the only code that ever notices;
 *   3. an ordinary pet on ordinary ground is NOT moved. That one is the point
 *      of the whole file. A rescue that fires on a healthy island is a pet
 *      teleporting for no reason a child could understand, and it would be a
 *      worse bug than the one being fixed.
 *
 * The loader is stubbed exactly as `pets.test.ts` stubs it, for the same reason:
 * this is a question about WHERE A CREATURE ENDS UP, and a 300KB GLB is not part
 * of it. Everything the assertions turn on — the real region flood in
 * `world/walk.ts`, the real measured mountain keep-outs from
 * `world/mountains.ts`, the real `clearOf` clamp, the real stuck timer — runs
 * for real. The obstacles are not invented either: they are `keepOutFor` at the
 * hex centres, which is what `props.ts` actually publishes for a rock hex.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
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
      return { scene }
    }
  }
  return { GLTFLoader }
})

import { createPetField } from '../../src/island/pets'
import type { Obstacle } from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import { createIsland, place } from '../../src/island/world/grid'
import type { Island } from '../../src/island/world/grid'
import { distance, toWorld, key, parse } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
import { sealedHexes, rescueHexFor } from '../../src/island/world/walk'
import { keepOutFor, NATIVE_HEX_SIZE } from '../../src/island/world/mountains'
import type { Pet } from '../../src/island/flow'
import type { LightingPreset } from '../../src/island/lighting'

type Field = ReturnType<typeof createPetField>

/*
 * The NATIVE hex size, not a rounded one. The whole defect is a 0.03-unit
 * overlap between two circles, so a test that rounds the spacing is a test that
 * measures something else.
 */
const HEX = NATIVE_HEX_SIZE

/* -------------------------------------------------------------- the fixture */

/** Ring of six around the origin, in the order `neighbours` returns them. */
const RING: Array<[number, number]> = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]

const ringHex = (i: number): Axial => {
  const [q, r] = RING[i] as [number, number]
  return { q, r }
}

/**
 * The island `sealing.test.ts` and `walk.test.ts` build for PB-052, reused
 * verbatim so all three files are talking about the same board: a grass island
 * with a NOTCH in it, everything at two and three steps out plus the origin,
 * and the six hexes at one step left as sockets they can turn to rock.
 */
function notchedIsland(): Island {
  let island: Island = createIsland()
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      const d = distance({ q: 0, r: 0 }, { q, r })
      if (d === 2 || d === 3) island = place(island, { q, r }, 'grass')
    }
  }
  return island
}

/** The notched island with the first `n` hexes of the ring turned to rock. */
function ringRocks(n: number): Island {
  let island = notchedIsland()
  for (let k = 0; k < n; k++) island = place(island, ringHex(k), 'rock')
  return island
}

/**
 * What `props.ts` publishes to the pet field for that island.
 *
 * `keepOutFor` is the same table `walk.ts` uses to decide the hex is sealed, so
 * the wall a pet actually collides with and the wall the rescue reasons about
 * are one wall. Inventing a radius here would let the test pass against a
 * geometry the game does not have.
 */
function mountainsOf(island: Island): Obstacle[] {
  const out: Obstacle[] = []
  for (const [k, t] of island.tiles) {
    const a = parse(k)
    const r = keepOutFor(a, t)
    if (r === 0) continue
    const w = toWorld(a, HEX)
    out.push({ x: w.x, z: w.z, r })
  }
  return out
}

const bunny = (id: string, at: Axial): Pet =>
  ({ id, name: id, species: 'animal-bunny', at })

/** Where the field actually put it. Never null once `sync` has resolved. */
function where(field: Field, id: string): THREE.Vector3 {
  const p = field.positionOf(id)
  expect(p).not.toBeNull()
  return p as THREE.Vector3
}

/** Which owned hex a world point sits on — nearest centre, as the field does. */
function hexUnder(island: Island, x: number, z: number): Axial {
  let best: Axial = { q: 0, r: 0 }
  let nearest = Infinity
  for (const k of island.tiles.keys()) {
    const a = parse(k)
    const w = toWorld(a, HEX)
    const d = Math.hypot(x - w.x, z - w.z)
    if (d < nearest) { nearest = d; best = a }
  }
  return best
}

/** The hexes a pet standing on them could never walk off, as `walk.ts` says. */
const sealedKeys = (island: Island, radius = 0): Set<string> =>
  new Set(sealedHexes(island, HEX, keepOutFor, radius).map(key))

async function fieldOn(island: Island, ...pets: Pet[]): Promise<Field> {
  const field = createPetField()
  // Before `sync`, exactly as `main.ts` publishes obstacles before the pets
  // land: the rescue has to work with the scenery it will actually stand in.
  field.setObstacles(mountainsOf(island))
  await field.sync(pets, island, HEX)
  return field
}

function run(field: Field, seconds: number, island: Island): void {
  const frames = Math.round(seconds * 60)
  for (let i = 0; i < frames; i++) field.update(1 / 60, i / 60, island, HEX)
}

/**
 * The same run, reporting the BIGGEST single-frame step the pet took.
 *
 * This is how a relocation is told apart from wandering without reading any
 * internal state: walking is `min(dist, dt * 0.9)` a frame — a quarter of a
 * hundredth of a unit at 60fps, plus a nudge from separation and the obstacle
 * clamp — whereas a rescue sets the position down on another hex outright, two
 * whole units away. Nothing in between can happen, so one number separates them
 * and the test never has to trust a flag.
 */
function runWatching(field: Field, seconds: number, island: Island, id: string): number {
  const frames = Math.round(seconds * 60)
  let biggest = 0
  let last = where(field, id).clone()
  for (let i = 0; i < frames; i++) {
    field.update(1 / 60, i / 60, island, HEX)
    const now = where(field, id)
    biggest = Math.max(biggest, Math.hypot(now.x - last.x, now.z - last.z))
    last = now.clone()
  }
  return biggest
}

/** Anything above this in one frame was not walked. */
const A_STEP = 0.2

/*
 * Determinism. `randomSpot`, the rest timer and the initial phase all draw on
 * `Math.random`, and a rescue test that passes five times in six is worth
 * nothing — PB-054 is already one flake too many. This is a plain LCG, so every
 * run of this file walks the pets along identical paths.
 */
let seed = 0
beforeEach(() => {
  createLighting(null, meadowDay as LightingPreset)
  seed = 0x2f6e2b1
  vi.spyOn(Math, 'random').mockImplementation(() => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x80000000
  })
})
afterEach(() => { vi.restoreAllMocks() })

/* ------------------------------------------- 1. the destination, on its own */

describe('rescueHexFor names somewhere a pet could actually walk', () => {
  it('answers null for a pet that is not walled in', () => {
    const island = ringRocks(5)
    expect(sealedKeys(island).size).toBe(0)
    expect(rescueHexFor(island, { q: 0, r: 0 }, HEX, keepOutFor, 0)).toBeNull()
    // ...and for a hex out in the open, on the board that IS sealed.
    expect(rescueHexFor(island, { q: 3, r: 0 }, HEX, keepOutFor, 0)).toBeNull()
  })

  it('answers a reachable hex for one that is', () => {
    const island = ringRocks(6)
    expect([...sealedKeys(island)]).toEqual(['0,0'])

    const to = rescueHexFor(island, { q: 0, r: 0 }, HEX, keepOutFor, 0)
    expect(to).not.toBeNull()
    const a = to as Axial
    // The destination is land they own, is NOT itself sealed, and is not the
    // pocket we are trying to get out of.
    expect(island.tiles.has(key(a))).toBe(true)
    expect(sealedKeys(island).has(key(a))).toBe(false)
    expect(key(a)).not.toBe('0,0')
  })

  it('prefers open ground, and the nearest of it', () => {
    const island = ringRocks(6)
    const a = rescueHexFor(island, { q: 0, r: 0 }, HEX, keepOutFor, 0) as Axial
    /*
     * Never a rock hex: a mountain IS its tile, so putting a pet on the centre
     * of one puts it inside the mesh and `clearOf` would only shove it back out
     * to the rim it was rescued from.
     */
    expect(keepOutFor(a, island.tiles.get(key(a)) as 'grass')).toBe(0)
    // Nearest open ground on this board is two steps out; three would be the
    // far shore, and a rescue that flings the friend across the island reads as
    // losing it (brief §19).
    expect(distance({ q: 0, r: 0 }, a)).toBe(2)
  })

  it('gives the same answer every time it is asked', () => {
    const island = ringRocks(6)
    const once = rescueHexFor(island, { q: 0, r: 0 }, HEX, keepOutFor, 0) as Axial
    for (let i = 0; i < 5; i++) {
      expect(rescueHexFor(island, { q: 0, r: 0 }, HEX, keepOutFor, 0)).toEqual(once)
    }
  })
})

/* ------------------------------------- 2. a pet put down inside the ring */

describe('a pet whose hatch hex is sealed is put down somewhere else', () => {
  it('does not stand it in the pocket', async () => {
    const island = ringRocks(6)
    expect([...sealedKeys(island)]).toEqual(['0,0'])

    const field = await fieldOn(island, bunny('p1', { q: 0, r: 0 }))
    const at = where(field, 'p1')

    // The claim, said the way `walk.ts` would say it: the hex it is standing on
    // is one a pet can walk off.
    expect(sealedKeys(island).has(key(hexUnder(island, at.x, at.z)))).toBe(false)
    expect(key(hexUnder(island, at.x, at.z))).not.toBe('0,0')
  })

  it('does not move a pet on ordinary ground — the whole point', async () => {
    /*
     * FIVE rocks, not six. The ring has a mouth, nothing is sealed, and the pet
     * must be left exactly where the game has always put it: the centre of its
     * hatch hex. Revert the rescue and this test still passes, which is what
     * makes it the honest half of the pair.
     */
    const island = ringRocks(5)
    expect(sealedKeys(island).size).toBe(0)

    const field = await fieldOn(island, bunny('p1', { q: 0, r: 0 }))
    const at = where(field, 'p1')
    const home = toWorld({ q: 0, r: 0 }, HEX)
    expect(at.x).toBeCloseTo(home.x, 6)
    expect(at.z).toBeCloseTo(home.z, 6)
  })

  it('leaves an unsealed pet out in the fields alone too', async () => {
    const island = ringRocks(6)
    const field = await fieldOn(island, bunny('p1', { q: 3, r: 0 }))
    const at = where(field, 'p1')
    const home = toWorld({ q: 3, r: 0 }, HEX)
    expect(at.x).toBeCloseTo(home.x, 6)
    expect(at.z).toBeCloseTo(home.z, 6)
  })

  it('repairs a save that is already sealed, on every load, and writes nothing',
    async () => {
      /*
       * The §19 half. `pet.at` is the HATCH hex and has never been written back
       * in the life of this game — so the rescue must not start now, or a save
       * gains a field it did not have and the flow gains a write nobody has
       * tested. Statelessness is what makes an ALREADY sealed island repair
       * itself: the question is asked afresh every time the pets are synced.
       */
      const island = ringRocks(6)
      const saved = bunny('p1', { q: 0, r: 0 })

      for (let load = 0; load < 3; load++) {
        const field = await fieldOn(island, saved)
        const at = where(field, 'p1')
        expect(key(hexUnder(island, at.x, at.z))).not.toBe('0,0')
        // Untouched, load after load. The rescue lives entirely in the scene.
        expect(saved.at).toEqual({ q: 0, r: 0 })
      }
    })

  it('puts it down in the clear, not inside a mountain', async () => {
    const island = ringRocks(6)
    const field = await fieldOn(island, bunny('p1', { q: 0, r: 0 }))
    const at = where(field, 'p1')
    for (const o of mountainsOf(island)) {
      expect(Math.hypot(at.x - o.x, at.z - o.z)).toBeGreaterThan(o.r)
    }
  })
})

/* ----------------------------- 3. the pet that was out walking at the time */

describe('a pet already wandering when the ring closes gets out as well', () => {
  it('notices that rerolling the goal never helps, and relocates', () => {
    /*
     * The sequence a child actually produces: the bunny is out on the grass,
     * they tap the sixth socket, and the wall closes around it. `sync` has
     * already run and will not run again for that pet — `live` skips it — so
     * the only code that can ever notice is the stuck handler.
     */
    const open = ringRocks(5)
    const shut = ringRocks(6)
    const field = createPetField()
    field.setObstacles(mountainsOf(open))

    return field.sync([bunny('p1', { q: 0, r: 0 })], open, HEX).then(() => {
      // Free to begin with, standing on its hatch hex in the middle.
      expect(key(hexUnder(open, where(field, 'p1').x, where(field, 'p1').z)))
        .toBe('0,0')

      // They lay the sixth mountain. From here the pocket is shut.
      field.setObstacles(mountainsOf(shut))
      expect([...sealedKeys(shut)]).toEqual(['0,0'])

      const biggest = runWatching(field, 60, shut, 'p1')

      const at = where(field, 'p1')
      expect(sealedKeys(shut).has(key(hexUnder(shut, at.x, at.z)))).toBe(false)
      // It was carried out, not walked out — there is no gap to walk through.
      expect(biggest).toBeGreaterThan(A_STEP)
    })
  })

  it('and stays out — it cannot walk back in', async () => {
    const shut = ringRocks(6)
    const field = await fieldOn(shut, bunny('p1', { q: 0, r: 0 }))
    run(field, 120, shut)
    const at = where(field, 'p1')
    expect(key(hexUnder(shut, at.x, at.z))).not.toBe('0,0')
  })

  it('does not relocate a pet that is merely wedged against a tree', async () => {
    /*
     * The false-positive guard, and the reason the stuck handler ASKS rather
     * than counting rerolls. Here the island is wide open and a single fat
     * obstacle sits in the middle of it — a pet can be pinned against that for
     * well over the 1.2s threshold, and the honest answer is the reroll the
     * game has always done, not a teleport.
     */
    const island = notchedIsland()
    expect(sealedKeys(island).size).toBe(0)

    const field = createPetField()
    const home = toWorld({ q: 2, r: 0 }, HEX)
    /*
     * Beside the pet, not on top of it. An obstacle that swallows the hex
     * centre would have `clearOf` shove the creature clear on the first frame,
     * and that jump is the ordinary clamp doing its ordinary job — it would be
     * measured here as a teleport and the test would be measuring nothing.
     */
    field.setObstacles([
      { x: home.x + 1.2, z: home.z, r: 0.9 },
      { x: home.x, z: home.z + 1.2, r: 0.9 },
    ])
    await field.sync([bunny('p1', { q: 2, r: 0 })], island, HEX)

    const biggest = runWatching(field, 30, island, 'p1')
    /*
     * It is allowed to have wandered — that is the whole reroll — but it must
     * never have been picked up and set down. Nothing on this island is sealed,
     * so a relocation here would mean the rescue fires on geometry that is
     * fine, which is a worse bug than the one being fixed.
     */
    expect(biggest).toBeLessThan(A_STEP)
    const after = where(field, 'p1')
    expect(rescueHexFor(island, hexUnder(island, after.x, after.z), HEX, keepOutFor, 0))
      .toBeNull()
  })
})
