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
import type { Island, TileType } from './grid'

export interface TileModels {
  /** Circumradius of the loaded hex, in world units. */
  size: number
  geometry: Record<TileType, THREE.BufferGeometry>
  material: THREE.Material
}

const TILE_URL: Record<TileType, string> = {
  grass: 'tiles/hex_grass.gltf',
  water: 'tiles/hex_water.gltf',
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
  const geometry = {} as Record<TileType, THREE.BufferGeometry>
  let material: THREE.Material | null = null
  let size = 1

  for (const type of Object.keys(TILE_URL) as TileType[]) {
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
  coordOf(type: TileType, instanceId: number): Axial | undefined
  dispose(): void
}

export function createTileField(models: TileModels, capacity = 512): TileField {
  const group = new THREE.Group()
  group.name = 'tiles'

  const meshes = {} as Record<TileType, THREE.InstancedMesh>
  const coords = {} as Record<TileType, Axial[]>

  for (const type of Object.keys(models.geometry) as TileType[]) {
    const im = new THREE.InstancedMesh(models.geometry[type], models.material, capacity)
    im.count = 0
    im.name = 'tiles:' + type
    im.userData.tileType = type
    im.frustumCulled = false
    meshes[type] = im
    coords[type] = []
    group.add(im)
  }

  const m = new THREE.Matrix4()

  return {
    group,

    sync(island: Island) {
      for (const type of Object.keys(meshes) as TileType[]) coords[type] = []

      for (const [k, type] of island.tiles) {
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        coords[type].push(a)
      }

      for (const type of Object.keys(meshes) as TileType[]) {
        const im = meshes[type]
        const list = coords[type]
        im.count = Math.min(list.length, capacity)
        list.slice(0, capacity).forEach((a, i) => {
          const w = toWorld(a, models.size)
          m.makeTranslation(w.x, 0, w.z)
          im.setMatrixAt(i, m)
        })
        im.instanceMatrix.needsUpdate = true
        im.computeBoundingSphere()
      }
    },

    coordOf(type: TileType, instanceId: number) {
      return coords[type]?.[instanceId]
    },

    dispose() {
      for (const type of Object.keys(meshes) as TileType[]) meshes[type].dispose()
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
