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
import { flattenImported } from './lighting'
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
  /** Seconds left to stand still before wandering again. */
  restFor: number
}

export interface Obstacle { x: number; z: number; r: number }

export interface PetField {
  group: THREE.Group
  /** Bring the scene in line with flow state, loading any new species. */
  sync(pets: readonly Pet[], island: Island, hexSize: number): Promise<void>
  /** Squash-stretch bounce, e.g. when tapped. */
  bounce(id: string): void
  /** Trees and rocks to walk around rather than through. */
  setObstacles(list: Obstacle[]): void
  update(dt: number, t: number, island: Island, hexSize: number): void
}

export function createPetField(base = ''): PetField {
  const group = new THREE.Group()
  group.name = 'pets'
  const loader = new GLTFLoader()
  const cache = new Map<string, THREE.Group>()
  const live = new Map<string, Live>()
  let obstacles: Obstacle[] = []

  async function model(species: string): Promise<THREE.Group> {
    const hit = cache.get(species)
    if (hit) return hit.clone(true)
    // NOTE: these GLBs are NOT self-contained — each references an external
    // Textures/colormap.png beside it. Without that file every pet renders
    // pure white, which looks like a material bug rather than a missing asset.
    const gltf = await loader.loadAsync(`${base}pets/${species}.glb`)
    const root = gltf.scene
    // Flat-colour packs often arrive metallic and render black under this rig
    // (lighting brief §1), so clamp on the way in rather than swapping the
    // material — Standard is what picks up the hemisphere's warm underside.
    flattenImported(root)
    cache.set(species, root)
    return root.clone(true)
  }

  /**
   * Somewhere for a pet to go: a random owned tile, on ground it can actually
   * stand on.
   *
   * Candidates inside a tree or rock are REJECTED rather than corrected. The
   * first version let a pet aim anywhere, including into scenery, so the
   * obstacle push shoved it out and it immediately walked back in — and
   * several pets oscillating around the same clear pocket looked, accurately,
   * like a group dance. Picking a reachable goal is the fix; pushing harder
   * would only have made the dance more energetic.
   */
  function randomSpot(island: Island, hexSize: number): THREE.Vector3 {
    const keys = [...island.tiles.keys()]
    const spot = new THREE.Vector3()

    for (let attempt = 0; attempt < 12; attempt++) {
      const k = keys[Math.floor(Math.random() * keys.length)] as string
      const parts = k.split(',').map(Number)
      const w = toWorld({ q: parts[0] as number, r: parts[1] as number }, hexSize)
      spot.set(
        w.x + (Math.random() - 0.5) * hexSize * 0.8, 0,
        w.z + (Math.random() - 0.5) * hexSize * 0.8,
      )
      const blocked = obstacles.some(o =>
        Math.hypot(spot.x - o.x, spot.z - o.z) < o.r * 1.15)
      if (!blocked) return spot.clone()
    }
    // Every attempt blocked: stay put rather than aim somewhere unreachable.
    return spot.clone()
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
        // A pet should sit ON its tile with room around it, not fill it. The
        // Kenney models stand ~1.5 units against a 2.0-wide hex, so they need
        // taking right down before they read as little creatures in a world
        // rather than statues on a plinth.
        root.scale.setScalar(0.16)
        holder.add(root)
        holder.add(createBlobShadow(0.17))
        const w = toWorld(pet.at as Axial, hexSize)
        holder.position.set(w.x, 0, w.z)
        holder.userData.pick = { kind: 'pet', id: pet.id }
        group.add(holder)
        live.set(pet.id, {
          pet, root: holder,
          goal: randomSpot(island, hexSize),
          phase: Math.random() * Math.PI * 2,
          bounce: 0,
          restFor: 2 + Math.random() * 6,
        })
      }
    },

    bounce(id) {
      const l = live.get(id)
      if (l) l.bounce = 1
    },

    setObstacles(list) {
      obstacles = list
      // A tile that has just grown a tree may now contain someone's goal.
      // Send those pets somewhere else rather than letting them push at it.
      for (const l of live.values()) {
        const blocked = obstacles.some(o =>
          Math.hypot(l.goal.x - o.x, l.goal.z - o.z) < o.r * 1.15)
        if (blocked) l.restFor = 0
      }
    },

    update(dt, t, island, hexSize) {
      const others = [...live.values()]

      for (const l of live.values()) {
        const pos = l.root.position
        const to = l.goal.clone().sub(pos)
        const dist = to.length()

        if (dist < 0.12) {
          /*
           * Arrived. REST, properly — a countdown rather than a per-frame dice
           * roll, so a pet that has just walked somewhere stays there long
           * enough to look settled. Constant re-seeking is what made the
           * island look busy and anxious rather than calm.
           */
          l.restFor -= dt
          if (l.restFor <= 0) {
            l.goal = randomSpot(island, hexSize)
            l.restFor = 4 + Math.random() * 8
          }
        } else {
          to.normalize()
          pos.addScaledVector(to, Math.min(dist, dt * 0.9))
          l.root.rotation.y = Math.atan2(to.x, to.z)
        }

        /*
         * Gentle separation: pets nudge apart rather than standing inside one
         * another, and walk around trees instead of through them. Deliberately
         * a soft push, not collision — a pet that got stuck against a rock
         * would look broken, and nothing here is worth a pathfinder.
         */
        const SEP = hexSize * 0.2
        for (const o of others) {
          if (o === l) continue
          const dx = pos.x - o.root.position.x
          const dz = pos.z - o.root.position.z
          const d = Math.hypot(dx, dz)
          if (d > 0.0001 && d < SEP) {
            const push = (SEP - d) / SEP * dt * 2.2
            pos.x += (dx / d) * push
            pos.z += (dz / d) * push
          }
        }
        /*
         * Obstacles nudge, they do not shove. This is now only a safety net
         * for a pet that started inside scenery — goals are already chosen on
         * clear ground — so a strong push would just reintroduce the
         * oscillation it used to cause.
         */
        for (const ob of obstacles) {
          const dx = pos.x - ob.x
          const dz = pos.z - ob.z
          const d = Math.hypot(dx, dz)
          if (d > 0.0001 && d < ob.r) {
            const push = (ob.r - d) / ob.r * dt * 1.1
            pos.x += (dx / d) * push
            pos.z += (dz / d) * push
          }
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
