/**
 * Scenery on the tiles: trees and rocks.
 *
 * KayKit ships these pre-assembled — a "trees_A_small" is already a little
 * clump, not a single trunk — so an island gets its planted look without any
 * per-tree placement logic.
 *
 * Which prop a tile gets is derived from its coordinate, not random: the same
 * hex must grow the same tree every time the island loads, or the world would
 * rearrange itself behind the child's back.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { flattenImported } from '../lighting'
import { toWorld } from './hex'
import type { Axial } from './hex'
import type { Island } from './grid'

const PROPS = [
  'trees_A_small', 'trees_A_medium', 'trees_B_small',
  'tree_single_A', 'tree_single_B', 'rock_single_A', 'rock_single_C',
] as const

/** Stable per-coordinate hash, so a tile's scenery never changes. */
function hash(a: Axial): number {
  let h = (a.q * 73856093) ^ (a.r * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

export interface PropField {
  group: THREE.Group
  sync(island: Island, hexSize: number): Promise<void>
  /** Where the scenery stands, so pets can walk around it rather than through. */
  obstacles(): Array<{ x: number; z: number; r: number }>
}

export function createPropField(base = ''): PropField {
  const group = new THREE.Group()
  group.name = 'props'
  const loader = new GLTFLoader()
  const cache = new Map<string, THREE.Object3D>()
  const placed = new Set<string>()
  const blocks: Array<{ x: number; z: number; r: number }> = []

  async function model(name: string): Promise<THREE.Object3D> {
    const hit = cache.get(name)
    if (hit) return hit.clone(true)
    const gltf = await loader.loadAsync(`${base}props/${name}.gltf`)
    flattenImported(gltf.scene)
    // The props reference the base atlas; bind Summer so they match the tiles.
    const atlas = await new THREE.TextureLoader().loadAsync(
      `${base}props/hexagons_medieval_Summer.png`)
    atlas.colorSpace = THREE.SRGBColorSpace
    atlas.flipY = false
    atlas.generateMipmaps = false
    atlas.minFilter = THREE.LinearFilter
    atlas.magFilter = THREE.LinearFilter
    gltf.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) (m.material as THREE.MeshStandardMaterial).map = atlas
    })
    cache.set(name, gltf.scene)
    return gltf.scene.clone(true)
  }

  return {
    group,

    async sync(island, hexSize) {
      for (const [k, type] of island.tiles) {
        if (placed.has(k) || type !== 'grass') continue
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        const h = hash(a)

        // The home rock stays clear: Fred, the egg and the first pet live there.
        if (a.q === 0 && a.r === 0) { placed.add(k); continue }
        // Roughly two tiles in three get scenery, so the island keeps some
        // open ground for pets to wander across.
        if (h % 3 === 0) { placed.add(k); continue }

        const name = PROPS[h % PROPS.length] as string
        const obj = await model(name)
        const w = toWorld(a, hexSize)
        // Offset from centre, stable per tile, so clumps do not line up.
        const ox = (((h >> 3) % 100) / 100 - 0.5) * hexSize * 0.55
        const oz = (((h >> 9) % 100) / 100 - 0.5) * hexSize * 0.55
        obj.position.set(w.x + ox, 0, w.z + oz)
        obj.rotation.y = ((h >> 5) % 360) * Math.PI / 180
        obj.scale.setScalar(0.55 + ((h >> 11) % 30) / 100)
        group.add(obj)
        placed.add(k)
        blocks.push({ x: obj.position.x, z: obj.position.z, r: hexSize * 0.34 })
      }
    },

    obstacles: () => blocks,
  }
}
