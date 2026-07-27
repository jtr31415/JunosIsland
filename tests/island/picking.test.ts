/**
 * Which thing a tap picked, when several are under the finger.
 *
 * Joe: "when the island is rotated in a way that the egg is in front of an
 * empty tile, the empty tile selection fires when tapping the egg. i think the
 * egg can always be in the foreground, clickablility wise."
 *
 * These drive the REAL `THREE.Raycaster` against the REAL egg, from a camera
 * set up like the island's own, rather than asserting that some mock ordering
 * function was called. Raycasting is pure CPU maths, so there is no excuse for
 * the mocked version — and a mocked version would have agreed with the broken
 * ordering just as happily as with the fixed one.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { pickFrom, isShowing } from '../../src/island/picking'
import type { PickTargets } from '../../src/island/picking'
import { createEgg } from '../../src/island/egg'

/** The island's own camera: 46° fov, orbiting at polar 0.86, distance 14. */
function islandCamera(azimuth = Math.PI * 0.25): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 400)
  const polar = 0.86, distance = 14
  cam.position.set(
    distance * Math.sin(polar) * Math.cos(azimuth),
    distance * Math.cos(polar),
    distance * Math.sin(polar) * Math.sin(azimuth),
  )
  cam.lookAt(0, 0, 0)
  cam.updateMatrixWorld(true)
  return cam
}

/**
 * A field of hex blocks, built the way `createSocketField`/`createTileField`
 * build theirs: one instanced mesh, top face at y = 0, instances translated.
 */
function hexField(cells: Array<[number, number]>, lift: number, name: string): {
  mesh: THREE.InstancedMesh
  group: THREE.Group
} {
  const geo = new THREE.CylinderGeometry(1.15, 1.15, 1, 6)
  geo.translate(0, -0.5, 0)                       // top face at y = 0, like the model
  const im = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial(), 128)
  im.count = cells.length
  im.name = name
  im.userData.tileType = 'grass'
  const m = new THREE.Matrix4()
  cells.forEach(([x, z], i) => { im.setMatrixAt(i, m.makeTranslation(x, lift, z)) })
  im.instanceMatrix.needsUpdate = true
  im.computeBoundingSphere()
  const group = new THREE.Group()
  group.add(im)
  return { mesh: im, group }
}

/** Everything the picker consults, wired to a real scene. */
function world(opts: {
  eggAt?: [number, number]
  eggVisible?: boolean
  socketCells?: Array<[number, number]>
  tileCells?: Array<[number, number]>
  socketsShown?: boolean
}): { targets: PickTargets; egg: ReturnType<typeof createEgg>; scene: THREE.Scene } {
  const scene = new THREE.Scene()

  const tiles = hexField(opts.tileCells ?? [[0, 0]], 0, 'tiles')
  // The real socket field sits a hair proud of the island, at y = 0.02.
  const sockets = hexField(opts.socketCells ?? [], 0.02, 'sockets')
  sockets.group.visible = opts.socketsShown ?? true

  const egg = createEgg()
  const [ex, ez] = opts.eggAt ?? [0, 0]
  egg.setPosition(ex, ez)
  egg.group.visible = opts.eggVisible ?? true

  scene.add(tiles.group, sockets.group, egg.group)
  scene.updateMatrixWorld(true)

  const socketCells = opts.socketCells ?? []
  const tileCells = opts.tileCells ?? [[0, 0]]
  return {
    scene,
    egg,
    targets: {
      sockets: sockets.group,
      socketAt: id => {
        const c = socketCells[id]
        return c ? { q: c[0], r: c[1] } : undefined
      },
      pickables: [egg.group],
      tiles: tiles.group,
      tileAt: (_kind, id) => {
        const c = tileCells[id]
        return c ? { q: c[0], r: c[1] } : undefined
      },
    },
  }
}

/** A ray through the pixel where a world point is drawn. */
function rayThrough(cam: THREE.PerspectiveCamera, at: THREE.Vector3): THREE.Raycaster {
  const ndc = at.clone().project(cam)
  const ray = new THREE.Raycaster()
  ray.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), cam)
  return ray
}

/** Roughly the middle of the egg's shell, in world units. */
const EGG_MIDDLE = 0.38 * 0.62

describe('an egg in front of an empty socket', () => {
  it('answers with the egg she can see, not the socket behind it', () => {
    const cam = islandCamera()

    /*
     * Find where a ray aimed at the egg comes down to the socket field's
     * height, and put an empty socket exactly there. That is Joe's picture:
     * the island turned so the egg stands in front of a place she could build.
     */
    const probe = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
    const t = (0.02 - probe.ray.origin.y) / probe.ray.direction.y
    const behind = probe.ray.origin.clone().addScaledVector(probe.ray.direction, t)

    const w = world({ eggAt: [0, 0], socketCells: [[behind.x, behind.z]] })
    const ray = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))

    // The scenario is real: this ray genuinely meets BOTH, egg first.
    const onEgg = ray.intersectObject(w.targets.sockets, true)
    const onSocket = ray.intersectObjects([w.egg.group], true)
    expect(onEgg.length).toBeGreaterThan(0)
    expect(onSocket.length).toBeGreaterThan(0)
    expect(onSocket[0]!.distance).toBeLessThan(onEgg[0]!.distance)

    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'egg' })
  })

  it('is reached from any angle the island can be turned to', () => {
    // The bug was reported as depending on rotation, so try the whole circle.
    for (let i = 0; i < 12; i++) {
      const cam = islandCamera((i / 12) * Math.PI * 2)
      const probe = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
      const t = (0.02 - probe.ray.origin.y) / probe.ray.direction.y
      const behind = probe.ray.origin.clone().addScaledVector(probe.ray.direction, t)

      const w = world({ socketCells: [[behind.x, behind.z]] })
      const ray = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
      expect(pickFrom(ray, w.targets)).toEqual({ kind: 'egg' })
    }
  })
})

describe('what the socket still outranks', () => {
  it('outranks the island beneath it — an invitation you cannot tap is decoration', () => {
    const cam = islandCamera()
    // Socket drawn over the tile at the origin; nothing else in the way.
    const w = world({
      eggAt: [40, 40],                       // the egg is miles away
      socketCells: [[0, 0]],
      tileCells: [[0, 0]],
    })
    const ray = rayThrough(cam, new THREE.Vector3(0, 0, 0))
    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'socket', axial: { q: 0, r: 0 } })
  })

  it('outranks a pickable that is BEHIND it, not merely any pickable', () => {
    /*
     * The rule is "whatever is nearest the camera", not "the egg always wins".
     * A contrived flat ray, because with the island's own downward camera a
     * ground-level socket can hardly ever get in front of the egg — which is
     * exactly why Joe never sees the socket he has aimed at being stolen.
     */
    const w = world({ eggAt: [0, 0], socketCells: [[0, 0]] })
    const ray = new THREE.Raycaster()
    // Skim in horizontally at the height of the socket's top face.
    ray.set(new THREE.Vector3(0, 0.019, 12), new THREE.Vector3(0, 0, -1))
    const hitsSocket = ray.intersectObject(w.targets.sockets, true)
    const hitsEgg = ray.intersectObjects([w.egg.group], true)
    expect(hitsSocket.length).toBeGreaterThan(0)
    expect(hitsEgg.length).toBeGreaterThan(0)
    expect(hitsSocket[0]!.distance).toBeLessThan(hitsEgg[0]!.distance)

    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'socket', axial: { q: 0, r: 0 } })
  })

  it('is ignored entirely when the field is hidden', () => {
    const cam = islandCamera()
    const w = world({ eggAt: [40, 40], socketCells: [[0, 0]], socketsShown: false })
    const ray = rayThrough(cam, new THREE.Vector3(0, 0, 0))
    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'tile', axial: { q: 0, r: 0 } })
  })
})

describe('an egg nobody can see does not catch taps', () => {
  /*
   * THREE's raycaster does not skip hidden objects — `Mesh.raycast` never
   * consults `visible`. So the egg before it washes ashore, and the egg
   * mid-hatch, are invisible obstacles sitting on the island collecting taps
   * meant for what is behind them. Giving the egg precedence without this
   * check would have handed those taps a promotion.
   */
  it('leaves the socket behind it alone', () => {
    const cam = islandCamera()
    const probe = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
    const t = (0.02 - probe.ray.origin.y) / probe.ray.direction.y
    const behind = probe.ray.origin.clone().addScaledVector(probe.ray.direction, t)

    const w = world({ eggVisible: false, socketCells: [[behind.x, behind.z]] })
    const ray = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'socket', axial: { q: behind.x, r: behind.z } })
  })

  it('leaves the tile beneath it alone', () => {
    const cam = islandCamera()
    const w = world({ eggVisible: false, tileCells: [[0, 0]] })
    const ray = rayThrough(cam, new THREE.Vector3(0, EGG_MIDDLE, 0))
    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'tile', axial: { q: 0, r: 0 } })
  })

  it('counts a hidden ancestor, not just the mesh', () => {
    const outer = new THREE.Group()
    const inner = new THREE.Group()
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))
    outer.add(inner); inner.add(leaf)
    expect(isShowing(leaf)).toBe(true)
    outer.visible = false
    expect(isShowing(leaf)).toBe(false)
  })
})

describe('nothing under the finger', () => {
  it('is the sea', () => {
    const w = world({ eggAt: [40, 40], tileCells: [[0, 0]] })
    const ray = new THREE.Raycaster()
    ray.set(new THREE.Vector3(0, 20, 0), new THREE.Vector3(0, 1, 0))   // straight up
    expect(pickFrom(ray, w.targets)).toEqual({ kind: 'sea' })
  })
})
