/**
 * Hex tile rendering.
 *
 * One InstancedMesh per tile type, rebuilt from island state. Instancing is
 * what keeps hundreds of tiles cheap on a mid-range tablet (brief section 14).
 *
 * The layout size is MEASURED from the loaded model, never guessed: KayKit's
 * hexes have their own scale, and a hardcoded constant would leave visible
 * seams or overlaps that look like a bug in the grid maths rather than a
 * mismatched number.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { toWorld } from './hex'
import type { Axial } from './hex'
import type { Island } from './grid'
import { lookFor, looksFor } from './coast'

/**
 * The models a tile can be drawn with — NOT the same thing as a TileType.
 *
 * The child owns grass and water; the coast variants are derived from where
 * those sit relative to one another (see coast.ts), so they exist here and
 * nowhere in the saved state.
 */
export type RenderKind = 'grass' | 'water'
  | 'coast_A' | 'coast_B' | 'coast_C' | 'coast_D'

export interface TileModels {
  /** Circumradius of the loaded hex, in world units. */
  size: number
  geometry: Record<RenderKind, THREE.BufferGeometry>
  material: THREE.Material
}

/*
 * Exported for the workbench asset viewer, which needs the ID→file mapping
 * rather than either half alone: the code says `grass`, the disk says
 * `hex_grass.gltf`, and a viewer holding only one of those reports every tile
 * as missing and every file as unused. Read-only outside this module.
 */
export const TILE_URL: Record<RenderKind, string> = {
  grass: 'tiles/hex_grass.gltf',
  water: 'tiles/hex_water.gltf',
  /*
   * The WATERED coast models — full hexes carrying land, sand ramp and water.
   *
   * These now sit on the WATER cell, not the land one, so a coast hex is a
   * pond edge: land at the rim where it meets her field, sloping down into
   * its own water. The waterless variants were right while the coast lived on
   * the land tile and had to let open sea show through the cut-away side;
   * here there is nothing to cut away, and a full hex is what closes the gap.
   */
  coast_A: 'tiles/hex_coast_A.gltf',
  coast_B: 'tiles/hex_coast_B.gltf',
  coast_C: 'tiles/hex_coast_C.gltf',
  coast_D: 'tiles/hex_coast_D.gltf',
}

/**
 * KayKit ships four palettes of the same atlas, and the tile geometry samples
 * whichever is bound. Measured at the grass swatch:
 *
 *   base   #a2a721  olive        Summer #3b903a  green
 *   Fall   #ba782d  orange       Winter #c1d9ed  pale blue
 *
 * The glTF references `base`, which renders the "grass" as olive-yellow. For a
 * bright, summery island (brief section 1.2) we bind Summer instead. This is
 * the recolour pipeline of brief section 15 in its simplest form — and it hands
 * us the seasonal calendar of section 4 for nothing.
 */
export type Season = 'base' | 'Summer' | 'Fall' | 'Winter'

const ATLAS: Record<Season, string> = {
  base: 'tiles/hexagons_medieval.png',
  Summer: 'tiles/hexagons_medieval_Summer.png',
  Fall: 'tiles/hexagons_medieval_Fall.png',
  Winter: 'tiles/hexagons_medieval_Winter.png',
}

/** Pull the first mesh out of a glTF scene, baking in its local transform. */
function firstMesh(root: THREE.Object3D): THREE.Mesh {
  let found: THREE.Mesh | null = null
  root.updateMatrixWorld(true)
  root.traverse(o => { if (!found && (o as THREE.Mesh).isMesh) found = o as THREE.Mesh })
  if (!found) throw new Error('glTF contained no mesh')
  return found
}

export async function loadTileModels(base = '', season: Season = 'Summer'): Promise<TileModels> {
  const loader = new GLTFLoader()
  const atlas = await new THREE.TextureLoader().loadAsync(base + ATLAS[season])
  atlas.colorSpace = THREE.SRGBColorSpace
  atlas.flipY = false                      // glTF UV origin is top-left
  // Each tile samples a tiny swatch of a 1024 atlas — grass is 41x139 px — so
  // mipmapping averages across neighbouring swatches and bleeds one tile's
  // colour into the next at distance. No mips, clamped.
  atlas.generateMipmaps = false
  atlas.minFilter = THREE.LinearFilter
  atlas.magFilter = THREE.LinearFilter
  atlas.wrapS = THREE.ClampToEdgeWrapping
  atlas.wrapT = THREE.ClampToEdgeWrapping
  const geometry = {} as Record<RenderKind, THREE.BufferGeometry>
  let material: THREE.Material | null = null
  let size = 1

  for (const type of Object.keys(TILE_URL) as RenderKind[]) {
    const gltf = await loader.loadAsync(base + TILE_URL[type])
    const mesh = firstMesh(gltf.scene)
    const geo = mesh.geometry.clone()
    geo.applyMatrix4(mesh.matrixWorld)
    geo.computeBoundingBox()
    geometry[type] = geo

    if (!material) {
      // MeshStandard with metalness clamped to 0 and roughness high (lighting
      // brief §1). Lambert ignores the hemisphere light's ground colour, which
      // is exactly the warm-underside contrast the rig exists to produce — so
      // flat-but-standard, not Lambert.
      material = new THREE.MeshStandardMaterial({
        map: atlas, color: 0xffffff, metalness: 0, roughness: 1,
      })
    }

    if (type === 'grass') {
      const bb = geo.boundingBox!
      // Pointy-top hex: the circumradius is the HALF-DEPTH in z (point to
      // centre), not the half-width in x. Measuring the wrong axis is an easy
      // mistake worth 15% overlap, so the tests pin this against the asset.
      size = (bb.max.z - bb.min.z) / 2
    }
  }

  return { size, geometry, material: material! }
}

export interface TileField {
  group: THREE.Group
  /** Rebuild every instance from island state. */
  sync(island: Island): void
  /** Axial coord under a given instance of a given type, for picking. */
  coordOf(kind: RenderKind, instanceId: number): Axial | undefined
  dispose(): void
}

export function createTileField(models: TileModels, capacity = 512): TileField {
  const group = new THREE.Group()
  group.name = 'tiles'

  const meshes = {} as Record<RenderKind, THREE.InstancedMesh>
  const coords = {} as Record<RenderKind, Axial[]>

  for (const type of Object.keys(models.geometry) as RenderKind[]) {
    const im = new THREE.InstancedMesh(models.geometry[type], models.material, capacity)
    im.count = 0
    im.name = 'tiles:' + type
    im.userData.tileType = type
    im.frustumCulled = false
    meshes[type] = im
    coords[type] = []
    group.add(im)
  }

  const turns = {} as Record<RenderKind, number[]>
  const m = new THREE.Matrix4()

  return {
    group,

    sync(island: Island) {
      for (const type of Object.keys(meshes) as RenderKind[]) {
        coords[type] = []
        turns[type] = []
      }

      /*
       * The coastline is recomputed for the WHOLE island on every sync, not
       * just for the tile that changed. Placing one hex re-sands up to six
       * neighbours — and, where it fills a gap, un-sands them — so anything
       * incremental would leave stale shoreline behind the child's back.
       * A few dozen hexes is nothing; correctness is worth more here.
       */
      /*
       * Solved for the whole island in one go, because a coast tile's look
       * depends on how its coast NEIGHBOURS were drawn — see looksFor(). Doing
       * it per tile also meant re-solving the island once per tile.
       */
      const looks = looksFor(island)

      for (const k of island.tiles.keys()) {
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        const look = looks.get(k) ?? lookFor(island, a)
        const kind: RenderKind =
          look.kind === 'coast' ? (`coast_${look.variant}` as RenderKind) : look.kind
        coords[kind].push(a)
        turns[kind].push(look.turns)
      }

      for (const type of Object.keys(meshes) as RenderKind[]) {
        const im = meshes[type]
        const list = coords[type]
        im.count = Math.min(list.length, capacity)
        list.slice(0, capacity).forEach((a, i) => {
          const w = toWorld(a, models.size)
          // Turn the model so its sand faces the sea. One sixth of a turn per
          // step, which is what coast.ts's `turns` counts.
          m.makeRotationY((turns[type][i] as number) * Math.PI / 3)
          m.setPosition(w.x, 0, w.z)
          im.setMatrixAt(i, m)
        })
        im.instanceMatrix.needsUpdate = true
        im.computeBoundingSphere()
      }
    },

    coordOf(kind: RenderKind, instanceId: number) {
      return coords[kind]?.[instanceId]
    },

    dispose() {
      for (const type of Object.keys(meshes) as RenderKind[]) meshes[type].dispose()
    },
  }
}

/**
 * Pulsing translucent markers on every buildable coord.
 *
 * The island continuously, gently asks (brief section 13): a socket is an
 * invitation, never a demand, so it glows rather than nags.
 */
export function createSocketField(models: TileModels, capacity = 128): {
  group: THREE.Group
  sync(list: Axial[]): void
  coordOf(instanceId: number): Axial | undefined
  pulse(t: number): void
  setVisible(v: boolean): void
} {
  const geo = models.geometry.grass
  const mat = new THREE.MeshBasicMaterial({
    color: 0xffe9a8, transparent: true, opacity: 0.42, depthWrite: false,
  })
  const im = new THREE.InstancedMesh(geo, mat, capacity)
  im.count = 0
  im.name = 'sockets'
  im.frustumCulled = false

  const group = new THREE.Group()
  group.add(im)

  let list: Axial[] = []
  const m = new THREE.Matrix4()

  return {
    group,
    sync(next: Axial[]) {
      list = next
      im.count = Math.min(list.length, capacity)
      list.slice(0, capacity).forEach((a, i) => {
        const w = toWorld(a, models.size)
        m.makeTranslation(w.x, 0.02, w.z)
        im.setMatrixAt(i, m)
      })
      im.instanceMatrix.needsUpdate = true
      im.computeBoundingSphere()
    },
    coordOf(instanceId: number) { return list[instanceId] },
    pulse(t: number) { mat.opacity = 0.30 + Math.sin(t * 2.6) * 0.14 },
    setVisible(v: boolean) { group.visible = v },
  }
}

/* --------------------------------------------------------------- surfaces */

/**
 * What is underfoot at a point: grass, the sand of a coast ramp, or open sea.
 *
 * Measured from the models rather than assumed. On a coast tile the top face
 * sits at y = 0 and reads green, the sand band runs from about -0.10 down to
 * the waterline at -0.20, and the water side is cut away entirely — so height
 * alone separates the three cleanly, with no need to sample the atlas.
 */
export type Ground = 'green' | 'sand' | 'none'

/** Everything below this is sand; at or above it, grass. */
const SAND_TOP = -0.07

export interface Surface {
  /** Ground height at a world point, or null where there is no tile at all. */
  heightAt(x: number, z: number): number | null
  groundAt(x: number, z: number): Ground
}

/**
 * Ask the actual tile meshes what the ground is doing at a point.
 *
 * This exists because scenery used to be placed at a fixed offset from a
 * tile's centre and dropped at y = 0 — which was fine while every tile was a
 * flat full hex, and broke the moment coast tiles arrived: a tree offset
 * toward the water landed over the cut-away part of the hex and hung in the
 * air above the sea. Raycasting the real geometry answers "is there ground
 * here, and how high" for every model, rotation and future elevation at once,
 * which no amount of arithmetic about arcs would.
 */
export function createSurface(field: TileField): Surface {
  const ray = new THREE.Raycaster()
  const down = new THREE.Vector3(0, -1, 0)
  const from = new THREE.Vector3()

  const hit = (x: number, z: number): number | null => {
    // Start well above anything the island can grow, and look straight down.
    from.set(x, 8, z)
    ray.set(from, down)
    const hits = ray.intersectObjects(field.group.children, false)
    return hits[0] ? hits[0].point.y : null
  }

  return {
    heightAt: hit,
    groundAt(x, z) {
      const y = hit(x, z)
      if (y === null) return 'none'
      return y >= SAND_TOP ? 'green' : 'sand'
    },
  }
}
