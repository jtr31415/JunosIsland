/**
 * @vitest-environment jsdom
 *
 * How big a pet is to TAP, measured in the pixels a child's finger lands in.
 *
 * Joe, watching her play: "the tap area for a spawn animal needs to be a bit
 * larger. she wants to tap them but regularly misses and is taken to a
 * challenge. it really frustrates her."
 *
 * Missing costs more here than a miss usually does. `pickFrom` answers with
 * whatever IS under the ray, so a near-miss is not nothing — it is the egg's
 * reading round, or a tile offer, or a half-built plot resuming into a sum. She
 * had just finished an hour of work and had gone looking round her island for
 * her animals, unprompted, which is the play the whole game is for.
 *
 * So these tests are in SCREEN PIXELS, driving the real `THREE.Raycaster`
 * against the real pet field through the real `pickFrom`, from a camera set up
 * like the island's own on a viewport the size of the target tablet. Asserting
 * a world-unit radius would prove the constant is the constant; asserting
 * pixels proves the thing Joe reported.
 *
 * The GLB loader is stubbed for the same reason `pets.test.ts` stubs it — a
 * 300KB model over the network is not part of the question — but everything the
 * numbers turn on (the measured body, the proxy, the raycast, the precedence)
 * runs for real.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { vi } from 'vitest'

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

import { createPetField, PICK_RADIUS, TAP_TARGET } from '../../src/island/pets'
import { pickFrom, isShowing } from '../../src/island/picking'
import type { PickTargets, Hit } from '../../src/island/picking'
import { createOrbitCamera } from '../../src/island/camera'
import { createLighting } from '../../src/island/lighting'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { LightingPreset } from '../../src/island/lighting'
import type { Island } from '../../src/island/world/grid'
import type { Pet } from '../../src/island/flow'

type Field = ReturnType<typeof createPetField>

const HEX = 1.1545
const ISLAND: Island = { tiles: new Map([['0,0', 'grass']]) }

/** A mid-range Android tablet in landscape, in CSS pixels. */
const VIEW = { w: 1280, h: 800 }

const pet = (id: string, species: string): Pet =>
  ({ id, name: id, species, at: { q: 0, r: 0 } })

/** The island's own camera: 46° fov, orbiting at polar 0.86, distance 14. */
function islandCamera(azimuth = Math.PI * 0.25): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(
    TAP_TARGET.fov, VIEW.w / VIEW.h, 0.1, 400)
  const polar = 0.86
  const d = TAP_TARGET.distance
  cam.position.set(
    d * Math.sin(polar) * Math.cos(azimuth),
    d * Math.cos(polar),
    d * Math.sin(polar) * Math.sin(azimuth),
  )
  cam.lookAt(0, 0, 0)
  cam.updateMatrixWorld(true)
  return cam
}

/**
 * A field of hex blocks, built the way `createSocketField`/`createTileField`
 * build theirs: one instanced mesh, top face at y = 0, instances translated.
 */
function hexField(cells: Array<[number, number]>, lift: number, name: string): THREE.Group {
  const geo = new THREE.CylinderGeometry(1.15, 1.15, 1, 6)
  geo.translate(0, -0.5, 0)
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial(), 64)
  im.count = cells.length
  im.name = name
  im.userData.tileType = 'grass'
  const m = new THREE.Matrix4()
  cells.forEach(([x, z], i) => { im.setMatrixAt(i, m.makeTranslation(x, lift, z)) })
  im.instanceMatrix.needsUpdate = true
  im.computeBoundingSphere()
  const group = new THREE.Group()
  group.name = name
  group.add(im)
  return group
}

/**
 * A hex and its six neighbours, in world units — a patch of her island big
 * enough that a finger's width off a pet is still land rather than open sea.
 * Pointy-top, so neighbours sit √3·R apart across and 1.5·R up.
 */
const PATCH: Array<[number, number]> = (() => {
  const R = 1.15
  const w = Math.sqrt(3) * R
  return [
    [0, 0], [w, 0], [-w, 0],
    [w / 2, 1.5 * R], [-w / 2, 1.5 * R],
    [w / 2, -1.5 * R], [-w / 2, -1.5 * R],
  ]
})()

/** Everything the picker consults, wired to a real scene around a real field. */
function world(field: Field, opts: {
  socketCells?: Array<[number, number]>
  tileCells?: Array<[number, number]>
} = {}): PickTargets {
  const tileCells = opts.tileCells ?? [[0, 0]]
  const socketCells = opts.socketCells ?? []
  const tiles = hexField(tileCells, 0, 'tiles')
  const sockets = hexField(socketCells, 0.02, 'sockets')
  const scene = new THREE.Scene()
  scene.add(tiles, sockets, field.group)
  scene.updateMatrixWorld(true)
  return {
    sockets,
    socketAt: id => {
      const c = socketCells[id]
      return c ? { q: c[0], r: c[1] } : undefined
    },
    pickables: [field.group],
    tiles,
    tileAt: (_kind, id) => {
      const c = tileCells[id]
      return c ? { q: c[0], r: c[1] } : undefined
    },
  }
}

/** Where a live pet's holder ended up. */
function petAt(field: Field, id: string): THREE.Object3D {
  return field.group.children.find(
    c => (c.userData.pick as { id?: string } | undefined)?.id === id) as THREE.Object3D
}

/** The creature itself — the imported model, NOT the tap proxy beside it. */
function animalOf(field: Field, id: string): THREE.Object3D {
  return petAt(field, id).children.find(c => c.name !== 'pet-pick') as THREE.Object3D
}

function proxyOf(field: Field, id: string): THREE.Mesh {
  return petAt(field, id).getObjectByName('pet-pick') as THREE.Mesh
}

/** Where a world point is drawn, in CSS pixels from the top-left of #view. */
function toPixels(cam: THREE.Camera, at: THREE.Vector3): { x: number; y: number } {
  const n = at.clone().project(cam)
  return { x: (n.x + 1) / 2 * VIEW.w, y: (1 - n.y) / 2 * VIEW.h }
}

/** A ray through one pixel, exactly as `scene.pick` builds it. */
function rayAt(cam: THREE.Camera, x: number, y: number): THREE.Raycaster {
  const ray = new THREE.Raycaster()
  ray.setFromCamera(
    new THREE.Vector2(x / VIEW.w * 2 - 1, 1 - y / VIEW.h * 2), cam)
  return ray
}

/** A ray through the pixel where a world point is drawn. */
function rayThrough(cam: THREE.Camera, at: THREE.Vector3): THREE.Raycaster {
  const p = toPixels(cam, at)
  return rayAt(cam, p.x, p.y)
}

/** The middle of the creature as she SEES it, which is what she aims at. */
function drawnCentre(field: Field, id: string): THREE.Vector3 {
  return new THREE.Box3().setFromObject(animalOf(field, id))
    .getCenter(new THREE.Vector3())
}

/** How wide the creature itself is drawn, in pixels: the target before this fix. */
function drawnSizePx(field: Field, id: string, cam: THREE.Camera): { w: number; h: number } {
  const box = new THREE.Box3().setFromObject(animalOf(field, id))
  let lox = Infinity, hix = -Infinity, loy = Infinity, hiy = -Infinity
  for (let i = 0; i < 8; i++) {
    const p = toPixels(cam, new THREE.Vector3(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z))
    lox = Math.min(lox, p.x); hix = Math.max(hix, p.x)
    loy = Math.min(loy, p.y); hiy = Math.max(hiy, p.y)
  }
  return { w: hix - lox, h: hiy - loy }
}

/**
 * The smallest distance, in pixels from where the pet is drawn, at which the
 * game stops answering "that pet" — swept right round the compass, so the
 * answer is the WORST direction rather than a flattering one.
 *
 * Binary search is sound because the target is convex.
 */
function tapRadiusPx(field: Field, id: string, cam: THREE.Camera, t: PickTargets): number {
  const c = toPixels(cam, drawnCentre(field, id))
  const isPet = (h: Hit): boolean => h.kind === 'pet' && h.id === id
  let worst = Infinity
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2
    let lo = 0
    let hi = 300
    for (let step = 0; step < 24; step++) {
      const mid = (lo + hi) / 2
      const hit = pickFrom(
        rayAt(cam, c.x + Math.cos(ang) * mid, c.y + Math.sin(ang) * mid), t)
      if (isPet(hit)) lo = mid; else hi = mid
    }
    worst = Math.min(worst, lo)
  }
  return worst
}

async function fieldWith(...pets: Pet[]): Promise<Field> {
  const field = createPetField()
  await field.sync(pets, ISLAND, HEX)
  // Pets spawn on their tile and only wander once `update` runs. Nothing here
  // calls it except the flyer tests, so a pet sits exactly where it hatched.
  field.group.updateMatrixWorld(true)
  return field
}

beforeEach(() => { createLighting(null, meadowDay as LightingPreset) })

describe('the tap target is sized against the shot the island actually opens on', () => {
  it('takes its fov and its distance from the real camera, not from here', () => {
    /*
     * `TAP_TARGET` copies two numbers out of `camera.ts`. Copies rot, so the
     * real camera is built and asked. If the framing is ever re-tuned, this
     * fails here rather than quietly shrinking a six-year-old's tap target.
     */
    const cam = createOrbitCamera(document.createElement('div'))
    cam.update()
    expect(cam.camera.fov).toBe(TAP_TARGET.fov)
    expect(cam.camera.position.length()).toBeCloseTo(TAP_TARGET.distance, 6)
    cam.dispose()
  })

  it('turns a touch-target standard into world units by the frustum, not by taste', () => {
    // 48 CSS px of an 800px-tall viewport, at 14 units under a 46° fov.
    const frustumHeight = 2 * TAP_TARGET.distance
      * Math.tan((TAP_TARGET.fov * Math.PI) / 360)
    expect(PICK_RADIUS * 2).toBeCloseTo(
      frustumHeight * (TAP_TARGET.px / TAP_TARGET.viewportPx), 9)
    // And it stays a pet-sized thing: under a third of the hex it stands on.
    expect(PICK_RADIUS * 2).toBeLessThan(HEX * 2 * 0.35)
  })
})

describe('a pet is big enough for a six-year-old to hit', () => {
  it('was a target about twenty pixels wide on its own — the bug, in numbers', async () => {
    /*
     * The before, measured rather than remembered, and measured exactly as the
     * after is: take the proxy away and ask the real picker the same question.
     * The creature's whole drawn box is about 26 pixels corner to corner, and
     * the disc a finger can reliably land in is 20.5 across. Against a
     * fingertip nearer fifty, she was always going to miss.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    const cam = islandCamera()
    const t = world(field, { tileCells: PATCH })
    expect(Math.max(...Object.values(drawnSizePx(field, 'a', cam)))).toBeLessThan(30)

    // Guarded rather than asserted: this test states the size of the OLD
    // target, so it must go on saying it whether the proxy is there or not.
    petAt(field, 'a').getObjectByName('pet-pick')?.removeFromParent()
    field.group.updateMatrixWorld(true)
    expect(tapRadiusPx(field, 'a', cam, t) * 2).toBeLessThan(22)
  })

  it('answers to a finger a good 46 pixels wide, in every direction', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    const t = world(field)
    const cam = islandCamera()
    // Fails without the proxy: the bare creature gives about 8px of radius.
    // Measured: 47.5px, against 20.5px without it. Fails without the proxy.
    expect(tapRadiusPx(field, 'a', cam, t) * 2).toBeGreaterThanOrEqual(46)
  })

  it('is reached from any angle the island can be turned to', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    const t = world(field)
    for (let i = 0; i < 8; i++) {
      const cam = islandCamera((i / 8) * Math.PI * 2)
      expect(tapRadiusPx(field, 'a', cam, t) * 2).toBeGreaterThanOrEqual(46)
    }
  })

  it('does not send a near-miss off to a challenge she did not ask for', async () => {
    /*
     * The symptom Joe reported, at the pixel that used to produce it: 18px out
     * from the middle of the creature — well inside a fingertip — over a socket
     * she is not aiming at.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    const cam = islandCamera()
    const t = world(field, { socketCells: [[0, 0]], tileCells: [[3, 0]] })
    const c = toPixels(cam, drawnCentre(field, 'a'))
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2
      const hit = pickFrom(
        rayAt(cam, c.x + Math.cos(ang) * 18, c.y + Math.sin(ang) * 18), t)
      expect(hit).toEqual({ kind: 'pet', id: 'a' })
    }
  })
})

describe('the proxy that does it is invisible, and stays pickable', () => {
  it('draws nothing at all', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    const mat = proxyOf(field, 'a').material as THREE.MeshBasicMaterial
    expect(mat.colorWrite).toBe(false)
    expect(mat.depthWrite).toBe(false)
    expect(mat.opacity).toBe(0)
    expect(mat.transparent).toBe(true)
  })

  it('is NOT hidden with `visible`, because that would switch it off entirely', async () => {
    /*
     * The trap, pinned. `isShowing()` walks the parent chain and rejects
     * anything hidden — it must, or the egg would catch taps before it has
     * washed ashore. A proxy hidden the obvious way is therefore skipped by the
     * one function it exists to be found by, and the whole fix does nothing
     * while every other test stays green.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    expect(proxyOf(field, 'a').visible).toBe(true)
    expect(isShowing(proxyOf(field, 'a'))).toBe(true)
  })

  it('goes quiet with the pet, so a pet nobody can see catches nothing', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    petAt(field, 'a').visible = false
    expect(isShowing(proxyOf(field, 'a'))).toBe(false)

    const t = world(field, { tileCells: [[0, 0]] })
    const cam = islandCamera()
    expect(pickFrom(rayThrough(cam, drawnCentre(field, 'a')), t))
      .toEqual({ kind: 'tile', axial: { q: 0, r: 0 } })
  })

  it('answers with its own pet, not merely with some pet', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    expect(proxyOf(field, 'a').userData.pick).toEqual({ kind: 'pet', id: 'a' })
  })

  it('casts no shadow, and shares one geometry and one material with every pet', async () => {
    /*
     * Shared and never disposed per pet: freeing either would blank the tap
     * target of every other pet at once, including friends she already owns
     * (brief §19) — the same rule the set atlases and the cloned models follow.
     */
    const field = await fieldWith(
      pet('a', 'animal-cow'), pet('b', 'animal-pig'))
    const one = proxyOf(field, 'a')
    const two = proxyOf(field, 'b')
    expect(one.castShadow).toBe(false)
    expect(one.receiveShadow).toBe(false)
    expect(two.geometry).toBe(one.geometry)
    expect(two.material).toBe(one.material)
  })

  it('leaves the creature its own measurements', async () => {
    /*
     * `radius` (the keep-out that walks a pet round a tree and round Fred) and
     * the blob's stretch are both taken from a box around the holder. A proxy
     * measured INTO that box would give a chick an elephant's keep-out, so the
     * order in `sync` is load-bearing: measure the creature, then fit the
     * target to it.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    field.setObstacles([{ x: 0, z: 0, r: 0.5 }])
    field.update(1 / 60, 0, ISLAND, HEX)
    const at = petAt(field, 'a').position
    const own = (1.43 * 0.16) / 2                 // the stand-in's own half-width
    expect(Math.hypot(at.x, at.z)).toBeCloseTo(0.5 + own, 6)
  })
})

describe('a bigger pet target does not steal what it should not', () => {
  it('still loses to a socket drawn in FRONT of it', async () => {
    /*
     * The precedence that was itself a bug fix — Joe: "the empty tile selection
     * fires when tapping the egg" — answered by "whatever is nearest the
     * camera" rather than "the egg always wins". Making pets three times easier
     * to hit must not trade his fix for this one.
     *
     * A contrived flat ray, for the same reason `picking.test.ts` uses one: with
     * the island's own downward camera a ground-level socket can hardly ever get
     * in front of anything standing on the island.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    const t = world(field, { socketCells: [[0, 0]] })
    const ray = new THREE.Raycaster()
    ray.set(new THREE.Vector3(0, 0.019, 12), new THREE.Vector3(0, 0, -1))

    // The scenario is real: this ray genuinely meets both, socket first.
    const onSocket = ray.intersectObject(t.sockets, true)
    const onPet = ray.intersectObjects(t.pickables, true)
    expect(onSocket.length).toBeGreaterThan(0)
    expect(onPet.length).toBeGreaterThan(0)
    expect(onSocket[0]!.distance).toBeLessThan(onPet[0]!.distance)

    expect(pickFrom(ray, t)).toEqual({ kind: 'socket', axial: { q: 0, r: 0 } })
  })

  it('beats a socket drawn BEHIND it, which is the whole point', async () => {
    const field = await fieldWith(pet('a', 'animal-cow'))
    const cam = islandCamera()
    const probe = rayThrough(cam, drawnCentre(field, 'a'))
    const k = (0.02 - probe.ray.origin.y) / probe.ray.direction.y
    const behind = probe.ray.origin.clone().addScaledVector(probe.ray.direction, k)

    const t = world(field, { socketCells: [[behind.x, behind.z]] })
    expect(pickFrom(rayThrough(cam, drawnCentre(field, 'a')), t))
      .toEqual({ kind: 'pet', id: 'a' })
  })

  it('leaves her own land tappable a finger away from the pet', async () => {
    /*
     * "Zoom to location" is a tap on her own land, and it must survive a pet
     * standing on that land. 60px out — a finger and a half — is her tile again.
     */
    const field = await fieldWith(pet('a', 'animal-cow'))
    const t = world(field, { tileCells: PATCH })
    const cam = islandCamera()
    const c = toPixels(cam, drawnCentre(field, 'a'))
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2
      expect(pickFrom(rayAt(cam, c.x + Math.cos(ang) * 60, c.y + Math.sin(ang) * 60), t).kind)
        .toBe('tile')
    }
  })
})

describe('a flyer hovers over the tile without swallowing it', () => {
  it('is tappable up where it is drawn', async () => {
    const field = await fieldWith(pet('b', 'animal-bee'))
    for (let i = 0; i < 12; i++) field.update(1 / 60, i / 60, ISLAND, HEX)
    field.group.updateMatrixWorld(true)
    const t = world(field)
    const cam = islandCamera()
    expect(pickFrom(rayThrough(cam, drawnCentre(field, 'b')), t))
      .toEqual({ kind: 'pet', id: 'b' })
  })

  it('does not swallow the ground directly beneath it', async () => {
    /*
     * The bee and the parrot hover at tree height, so their targets sit well
     * above the island. A tap on the grass under a bee is a tap on the grass:
     * the bee is drawn about 48 pixels up the screen from it, and the target is
     * only about 24 pixels of radius.
     */
    const field = await fieldWith(pet('b', 'animal-bee'))
    for (let i = 0; i < 12; i++) field.update(1 / 60, i / 60, ISLAND, HEX)
    field.group.updateMatrixWorld(true)
    const t = world(field, { tileCells: [[0, 0]] })
    const cam = islandCamera()
    const under = petAt(field, 'b').position.clone().setY(0)
    expect(pickFrom(rayThrough(cam, under), t))
      .toEqual({ kind: 'tile', axial: { q: 0, r: 0 } })
  })
})
