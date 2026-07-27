/**
 * The world layer: renderer, scene graph, camera, and the per-frame loop.
 *
 * Knows nothing about reading, sums, or challenges. It raises intents (a tap
 * hit this thing) and renders whatever state it is handed. Everything crossing
 * that line is plain serialisable data, which is what keeps the flow machine
 * testable without a GPU.
 */
import * as THREE from 'three'
import { createOrbitCamera } from './camera'
import type { OrbitCamera } from './camera'
import { createSea } from './juice'
import { createLighting } from './lighting'
import type { Lighting, LightingPreset } from './lighting'
import meadowDay from './lighting/presets/meadow-day.json'
import { loadTileModels, createTileField, createSocketField, createSurface } from './world/tiles'
import type { TileModels, TileField, Surface, RenderKind } from './world/tiles'
import { toWorld } from './world/hex'
import type { Axial } from './world/hex'
import type { Island } from './world/grid'
import { buildableSockets } from './world/coast'
import { sockets } from './world/grid'
import { pickFrom } from './picking'

/*
 * `Hit` and the rule that decides between several of them live in `picking.ts`,
 * which needs no GL context and is therefore testable. Re-exported here because
 * this is where the rest of the game expects to find the type.
 */
export type { Hit } from './picking'
import type { Hit } from './picking'

export interface World {
  scene: THREE.Scene
  lighting: Lighting
  camera: OrbitCamera
  models: TileModels
  tiles: TileField
  /** Ask the tile meshes what the ground is doing at a point. */
  surface: Surface
  /** Objects that want a raycast: pets, eggs, Fred. Keyed for identification. */
  pickables: THREE.Object3D[]
  setIsland(i: Island): void
  showSockets(v: boolean): void
  pick(clientX: number, clientY: number): Hit | null
  worldOf(a: Axial): THREE.Vector3
  onFrame(fn: (dt: number, t: number) => void): void
  /**
   * Draw a second, small scene over the world after each frame.
   *
   * The challenge stage (§6). Handed the renderer rather than owning one, so
   * the whole game stays on a single GL context — two contexts on a mid-range
   * tablet is the expensive way to do this.
   */
  onOverlayFrame(fn: (renderer: THREE.WebGLRenderer) => void): void
  start(): void
  dispose(): void
}

export async function createWorld(canvas: HTMLCanvasElement): Promise<World> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  // Capped for tablet fill-rate: a 3x retina buffer is the fastest way to
  // lose 60fps on mid-range hardware, and at this art scale it buys nothing.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const scene = new THREE.Scene()
  // Colour space, tone mapping, the three lights, the sky dome and the fog all
  // belong to the lighting module. Nothing here touches them.
  const lighting = createLighting(renderer, meadowDay as LightingPreset)
  lighting.attach(scene)
  scene.add(createSea())

  const camera = createOrbitCamera(canvas)

  const models = await loadTileModels()
  const tiles = createTileField(models)
  const surface = createSurface(tiles)
  const socketField = createSocketField(models)
  scene.add(tiles.group)
  scene.add(socketField.group)

  const pickables: THREE.Object3D[] = []
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const frameFns: Array<(dt: number, t: number) => void> = []
  const overlayFns: Array<(renderer: THREE.WebGLRenderer) => void> = []

  let island: Island | null = null
  let running = false
  let last = 0

  const resize = (): void => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.camera.aspect = w / h
    camera.camera.updateProjectionMatrix()
  }
  window.addEventListener('resize', resize)
  resize()

  const world: World = {
    scene,
    lighting,
    camera,
    models,
    tiles,
    surface,
    pickables,

    setIsland(i: Island) {
      island = i
      tiles.sync(i)
      // Only the sockets she can actually fill: an outline that cannot be
      // filled is a promise the game breaks.
      socketField.sync(buildableSockets(i, sockets(i)))
      // Keep the whole island in shot as it grows outward.
      let max = 0
      for (const k of i.tiles.keys()) {
        const parts = k.split(',').map(Number)
        const w = toWorld({ q: parts[0] as number, r: parts[1] as number }, models.size)
        max = Math.max(max, Math.hypot(w.x, w.z))
      }
      camera.frame(max)
    },

    showSockets(v: boolean) { socketField.setVisible(v) },

    worldOf(a: Axial) {
      const w = toWorld(a, models.size)
      return new THREE.Vector3(w.x, 0, w.z)
    },

    pick(clientX: number, clientY: number): Hit | null {
      const rect = canvas.getBoundingClientRect()
      ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera.camera)

      // The precedence rule itself lives in picking.ts, where it can be tested.
      return pickFrom(raycaster, {
        sockets: socketField.group,
        socketAt: id => socketField.coordOf(id),
        pickables,
        tiles: tiles.group,
        tileAt: (kind, id) => tiles.coordOf(kind as RenderKind, id),
      })
    },

    onFrame(fn) { frameFns.push(fn) },

    onOverlayFrame(fn) { overlayFns.push(fn) },

    start() {
      if (running) return
      running = true
      const tick = (now: number): void => {
        if (!running) return
        const t = now / 1000
        const dt = Math.min(0.05, last ? t - last : 0.016)
        last = t
        camera.update()
        lighting.update(dt)
        socketField.pulse(t)
        for (const fn of frameFns) fn(dt, t)
        renderer.render(scene, camera.camera)
        // The stage draws last, into its own scissored corner of the canvas.
        for (const fn of overlayFns) fn(renderer)
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },

    dispose() {
      running = false
      window.removeEventListener('resize', resize)
      camera.dispose()
      tiles.dispose()
      renderer.dispose()
    },
  }

  if (island) world.setIsland(island)
  return world
}
