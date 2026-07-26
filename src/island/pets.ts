/**
 * Cube pets: hatching, wandering, and being tapped.
 *
 * No needs, no hunger, no decay, no death (brief section 5). A pet that has
 * come home stays home. Wandering exists because a still island looks asleep,
 * not because anything depends on it.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createBlobShadow } from './juice'
import { toWorld } from './world/hex'
import type { Axial } from './world/hex'
import type { Island } from './world/grid'
import type { Pet } from './flow'

/** The 24 Kenney species, by GLB basename. */
export const SPECIES = [
  'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat', 'animal-caterpillar',
  'animal-chick', 'animal-cow', 'animal-crab', 'animal-deer', 'animal-dog',
  'animal-elephant', 'animal-fish', 'animal-fox', 'animal-giraffe', 'animal-hog',
  'animal-koala', 'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
  'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
] as const

interface Live {
  pet: Pet
  root: THREE.Group
  /** Where it is walking to, in world space. */
  goal: THREE.Vector3
  phase: number
  /** Set on tap; drives a squash-stretch bounce. */
  bounce: number
}

export interface PetField {
  group: THREE.Group
  /** Bring the scene in line with flow state, loading any new species. */
  sync(pets: readonly Pet[], island: Island, hexSize: number): Promise<void>
  /** Squash-stretch bounce, e.g. when tapped. */
  bounce(id: string): void
  update(dt: number, t: number, island: Island, hexSize: number): void
}

export function createPetField(base = ''): PetField {
  const group = new THREE.Group()
  group.name = 'pets'
  const loader = new GLTFLoader()
  const cache = new Map<string, THREE.Group>()
  const live = new Map<string, Live>()

  async function model(species: string): Promise<THREE.Group> {
    const hit = cache.get(species)
    if (hit) return hit.clone(true)
    // NOTE: these GLBs are NOT self-contained — each references an external
    // Textures/colormap.png beside it. Without that file every pet renders
    // pure white, which looks like a material bug rather than a missing asset.
    const gltf = await loader.loadAsync(`${base}pets/${species}.glb`)
    const root = gltf.scene
    root.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        // Flat and chunky, matching the tiles: no PBR shine (brief section 15).
        const src = m.material as THREE.MeshStandardMaterial
        m.material = new THREE.MeshLambertMaterial({
          map: src.map ?? null,
          color: src.color ?? new THREE.Color(0xffffff),
          vertexColors: (m.geometry.getAttribute('color') !== undefined),
        })
      }
    })
    cache.set(species, root)
    return root.clone(true)
  }

  /** A random owned tile for a pet to head towards. */
  function randomSpot(island: Island, hexSize: number): THREE.Vector3 {
    const keys = [...island.tiles.keys()]
    const k = keys[Math.floor(Math.random() * keys.length)] as string
    const parts = k.split(',').map(Number)
    const w = toWorld({ q: parts[0] as number, r: parts[1] as number }, hexSize)
    // Not dead centre, so two pets on one tile do not overlap exactly.
    return new THREE.Vector3(
      w.x + (Math.random() - 0.5) * hexSize * 0.7, 0,
      w.z + (Math.random() - 0.5) * hexSize * 0.7,
    )
  }

  return {
    group,

    async sync(pets, island, hexSize) {
      for (const pet of pets) {
        if (live.has(pet.id)) continue
        const root = await model(pet.species)
        const holder = new THREE.Group()
        // Kenney pets stand ~1.5 units tall against a 2.0-wide hex, which
        // reads as a monument rather than a pet. Scale so one comfortably
        // fits its tile with room to wander.
        root.scale.setScalar(0.5)
        holder.add(root)
        holder.add(createBlobShadow(0.34))
        const w = toWorld(pet.at as Axial, hexSize)
        holder.position.set(w.x, 0, w.z)
        holder.userData.pick = { kind: 'pet', id: pet.id }
        group.add(holder)
        live.set(pet.id, {
          pet, root: holder,
          goal: randomSpot(island, hexSize),
          phase: Math.random() * Math.PI * 2,
          bounce: 0,
        })
      }
    },

    bounce(id) {
      const l = live.get(id)
      if (l) l.bounce = 1
    },

    update(dt, t, island, hexSize) {
      for (const l of live.values()) {
        const pos = l.root.position
        const to = l.goal.clone().sub(pos)
        const dist = to.length()

        if (dist < 0.12) {
          // Arrived: pause a moment, then pick somewhere new.
          if (Math.random() < dt * 0.5) l.goal = randomSpot(island, hexSize)
        } else {
          to.normalize()
          pos.addScaledVector(to, Math.min(dist, dt * 0.9))
          l.root.rotation.y = Math.atan2(to.x, to.z)
        }

        // A hop rather than a glide: squash on the ground, stretch in the air.
        const hop = Math.abs(Math.sin(t * 3.4 + l.phase))
        const moving = dist >= 0.12
        pos.y = moving ? hop * 0.16 : Math.sin(t * 1.6 + l.phase) * 0.03

        let sy = moving ? 1 + hop * 0.12 : 1
        let sxz = moving ? 1 - hop * 0.07 : 1

        if (l.bounce > 0) {
          l.bounce = Math.max(0, l.bounce - dt * 2.2)
          const b = Math.sin(l.bounce * Math.PI)
          sy += b * 0.45
          sxz -= b * 0.18
          pos.y += b * 0.25
        }

        l.root.scale.set(sxz, sy, sxz)
      }
    },
  }
}
