/**
 * Scenery on the tiles: hills, mountains, trees, rocks — and clouds above.
 *
 * KayKit ships these pre-assembled, so an island gets its planted, hilly look
 * without per-object placement logic. Using the BREADTH of the pack is the
 * point: a field of identical small pine clumps reads as wallpaper, whereas a
 * mountain here, a wooded hill there and bare ground between them reads as a
 * place. Elevation does most of that work — a flat plane of hexes has no
 * silhouette under an orbit camera, and silhouette is what makes a diorama.
 *
 * Which prop a tile gets is DERIVED from its coordinate, never random: the
 * same hex must grow the same thing every time the island loads, or the world
 * rearranges itself behind the child's back between sessions.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { flattenImported } from '../lighting'
import { toWorld } from './hex'
import type { Axial } from './hex'
import type { Island } from './grid'
import type { Surface, Ground } from './tiles'

/**
 * Weighted by how much each reads as "landscape" rather than "object".
 *
 * Big features are deliberately rare: a mountain on every third tile is a
 * mountain range, which is a busier and much less friendly place than an
 * island with one mountain on it.
 */
const LAND_PROPS: Array<{ name: string; weight: number; big?: boolean }> = [
  { name: 'trees_A_small', weight: 5 },
  { name: 'trees_A_medium', weight: 4 },
  { name: 'trees_B_small', weight: 4 },
  { name: 'trees_B_medium', weight: 3 },
  { name: 'trees_A_large', weight: 2 },
  { name: 'tree_single_A', weight: 3 },
  { name: 'tree_single_B', weight: 3 },
  { name: 'tree_single_A_cut', weight: 1 },
  { name: 'rock_single_A', weight: 2 },
  { name: 'rock_single_B', weight: 2 },
  { name: 'rock_single_C', weight: 1 },
  { name: 'rock_single_D', weight: 1 },
  // Elevation — the pieces that give the island a skyline.
  { name: 'hills_A', weight: 3, big: true },
  { name: 'hills_B', weight: 3, big: true },
  { name: 'hills_A_trees', weight: 4, big: true },
  { name: 'hills_C_trees', weight: 3, big: true },
  { name: 'mountain_B_grass', weight: 1, big: true },
  { name: 'mountain_A_grass_trees', weight: 1, big: true },
]

/**
 * Fine detail from the Forest Nature pack: the small stuff that makes a tile
 * look inhabited rather than decorated.
 *
 * Deliberately a SECOND layer rather than more entries in the list above. The
 * hexagon pack supplies landscape — hills, mountains, wooded slopes — and this
 * supplies ground cover, so most tiles get a big feature OR open ground, and
 * nearly all of them get a scatter of tufts and stones on top. That two-layer
 * split is what stops the island reading as a tidy arrangement of objects.
 *
 * It has its OWN texture, not the hexagon atlas.
 */
const FOREST_DETAIL = [
  'Grass_1_A_Color1', 'Grass_2_A_Color1',
  'Bush_1_A_Color1', 'Bush_2_A_Color1', 'Bush_4_A_Color1',
  'Rock_1_A_Color1', 'Rock_2_A_Color1', 'Rock_3_A_Color1',
  'Tree_1_A_Color1', 'Tree_2_A_Color1', 'Tree_3_A_Color1', 'Tree_4_A_Color1',
]

/** Only the small pieces scatter; trees are placed as features. */
const DETAIL_SMALL = FOREST_DETAIL.slice(0, 8)

/** What grows on water. The same set the growing plot builds a pond from. */
const WATER_PIECES = [
  'waterlily_A', 'waterlily_B', 'waterplant_A', 'waterplant_B', 'waterplant_C',
]

/** Pull q and r back out of a tile key. */
const parts0 = (k: string): number => Number(k.split(',')[0])
const parts1 = (k: string): number => Number(k.split(',')[1])

/**
 * What ground a piece is willing to stand on.
 *
 * Trees, bushes and grass need soil, so they keep to the green. Stone does
 * not care — a rock on a beach is a rock on a beach — so rocks may also sit
 * on the sand of a coast ramp. Nothing may stand over open water, which on a
 * coast tile means the part of the hex that has been cut away entirely.
 */
const ROCKY = /rock/i
const allows = (name: string, ground: Ground): boolean =>
  ground === 'green' || (ground === 'sand' && ROCKY.test(name))

const TOTAL_WEIGHT = LAND_PROPS.reduce((n, p) => n + p.weight, 0)

function pickProp(h: number): typeof LAND_PROPS[number] {
  let r = h % TOTAL_WEIGHT
  for (const p of LAND_PROPS) {
    r -= p.weight
    if (r < 0) return p
  }
  return LAND_PROPS[0] as typeof LAND_PROPS[number]
}

/** Stable per-coordinate hash, so a tile's scenery never changes. */
function hash(a: Axial): number {
  let h = (a.q * 73856093) ^ (a.r * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

export interface PropField {
  group: THREE.Group
  sync(island: Island, hexSize: number, surface: Surface): Promise<void>
  /** Where scenery stands, so pets walk around it rather than through. */
  obstacles(): Array<{ x: number; z: number; r: number }>
  /**
   * Load one scenery piece by name, textured and ready to add.
   *
   * Shared with the growing plot so a tile under construction grows the SAME
   * trees and rocks it will keep once finished — building it out of stand-in
   * primitives and swapping them at the end would make completion a visual
   * discontinuity rather than the last step of a sequence.
   */
  load(name: string): Promise<THREE.Object3D>
  /**
   * EVERYTHING standing on the ground, ground cover included.
   *
   * Distinct from obstacles() on purpose. A pet steps over a grass tuft, so a
   * tuft is no obstacle — but an egg sitting in one is half-buried and cannot
   * be tapped cleanly, and the egg is the single most important thing on the
   * island to be able to tap. So the egg avoids all of this; pets avoid only
   * what they would actually walk into.
   */
  clutter(): Array<{ x: number; z: number; r: number }>
  update(dt: number, t: number): void
}

export function createPropField(base = ''): PropField {
  const group = new THREE.Group()
  group.name = 'props'
  const loader = new GLTFLoader()
  const cache = new Map<string, THREE.Object3D>()
  const placed = new Set<string>()
  const blocks: Array<{ x: number; z: number; r: number }> = []
  const decor: Array<{ x: number; z: number; r: number }> = []
  const clouds: THREE.Object3D[] = []
  let atlas: THREE.Texture | null = null
  let forestTex: THREE.Texture | null = null

  async function sharedAtlas(): Promise<THREE.Texture> {
    if (atlas) return atlas
    const t = await new THREE.TextureLoader().loadAsync(
      `${base}props/hexagons_medieval_Summer.png`)
    t.colorSpace = THREE.SRGBColorSpace
    t.flipY = false
    // Same gradient-atlas treatment as the tiles: mips bleed one swatch into
    // the next, which turns green trees muddy at distance.
    t.generateMipmaps = false
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    atlas = t
    return t
  }

  async function forestTexture(): Promise<THREE.Texture> {
    if (forestTex) return forestTex
    const t = await new THREE.TextureLoader().loadAsync(`${base}forest/forest_texture.png`)
    t.colorSpace = THREE.SRGBColorSpace
    t.flipY = false
    forestTex = t
    return t
  }

  /** Forest Nature pack piece — its own folder and its own texture. */
  async function forestModel(name: string): Promise<THREE.Object3D> {
    const hit = cache.get('forest:' + name)
    if (hit) return hit.clone(true)
    const gltf = await loader.loadAsync(`${base}forest/${name}.gltf`)
    flattenImported(gltf.scene)
    const tex = await forestTexture()
    gltf.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) (m.material as THREE.MeshStandardMaterial).map = tex
    })
    cache.set('forest:' + name, gltf.scene)
    return gltf.scene.clone(true)
  }

  async function model(name: string): Promise<THREE.Object3D> {
    const hit = cache.get(name)
    if (hit) return hit.clone(true)
    const gltf = await loader.loadAsync(`${base}props/${name}.gltf`)
    flattenImported(gltf.scene)
    const tex = await sharedAtlas()
    gltf.scene.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) (m.material as THREE.MeshStandardMaterial).map = tex
    })
    cache.set(name, gltf.scene)
    return gltf.scene.clone(true)
  }

  return {
    group,

    async sync(island, hexSize, surface) {
      // Clouds, once. They give the sky something to be other than a gradient,
      // and drifting cloud is a cheap way to keep the world alive while the
      // child is thinking about a word.
      if (!clouds.length) {
        /*
         * HIGH and FAR. At the first attempt they sat at head height a few
         * metres out and filled half the frame — the orbit camera flew
         * straight through them and the island vanished behind a wall of
         * white. Clouds belong in the distance, above the camera's reach.
         */
        for (let i = 0; i < 6; i++) {
          const c = await model(i % 2 ? 'cloud_big' : 'cloud_small')
          const a = (i / 6) * Math.PI * 2
          const r = 34 + (i % 3) * 7
          c.position.set(Math.cos(a) * r, 15 + (i % 3) * 3.5, Math.sin(a) * r)
          c.scale.setScalar(2.2 + (i % 3) * 0.7)
          c.userData.drift = 0.35 + (i % 4) * 0.12
          c.userData.ring = r
          clouds.push(c)
          group.add(c)
        }
      }

      for (const [k, type] of island.tiles) {
        if (placed.has(k)) continue

        /*
         * Water gets lilies and reeds rather than nothing.
         *
         * It used to be skipped entirely, which meant a child who built a
         * pond watched eight water plants grow on it during the build and
         * then saw a bare blue hex the moment it completed. Losing what she
         * had just made is precisely what brief §18 forbids.
         */
        if (type === 'water') {
          const wh = hash({ q: parts0(k), r: parts1(k) })
          const w = toWorld({ q: parts0(k), r: parts1(k) }, hexSize)
          const count = 2 + (wh % 3)
          for (let i = 0; i < count; i++) {
            const ih = hash({ q: parts0(k) * 13 + i, r: parts1(k) * 7 - i })
            const name = WATER_PIECES[ih % WATER_PIECES.length] as string
            const bit = await model(name)
            const ang = ((ih >> 4) % 360) * Math.PI / 180
            const rad = hexSize * (0.15 + ((ih >> 7) % 45) / 100)
            bit.position.set(w.x + Math.cos(ang) * rad, 0, w.z + Math.sin(ang) * rad)
            bit.rotation.y = ((ih >> 11) % 360) * Math.PI / 180
            bit.scale.setScalar(0.55 + ((ih >> 13) % 25) / 100)
            group.add(bit)
            decor.push({ x: bit.position.x, z: bit.position.z, r: hexSize * 0.14 })
          }
          placed.add(k)
          continue
        }
        if (type !== 'grass') continue
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        const h = hash(a)

        // The home rock stays clear: Fred, the egg and the first pet live there.
        if (a.q === 0 && a.r === 0) { placed.add(k); continue }
        // Roughly one tile in three stays open, so pets have room to wander
        // and the island keeps some breathing space.
        if (h % 3 === 0) { placed.add(k); continue }

        const spec = pickProp(h)
        const w = toWorld(a, hexSize)
        // Big features sit centred — a mountain half off its hex looks broken.
        // Small ones scatter, so a wood does not look like a plantation.
        const spread = spec.big ? 0.12 : 0.5

        /*
         * Find ground it can actually stand on, trying the derived spot first
         * and then working inward. On a coast tile most of the offsets a plain
         * hex would allow are over open sea, so the first choice frequently
         * has to be given up — and a tile with nowhere green left simply grows
         * nothing, which is what a beach looks like anyway.
         */
        let spot: { x: number; z: number; y: number } | null = null
        for (let attempt = 0; attempt < 6 && !spot; attempt++) {
          const pull = 1 - attempt / 6                     // ... inward
          const ox = (((h >> 3) % 100) / 100 - 0.5) * hexSize * spread * pull
          const oz = (((h >> 9) % 100) / 100 - 0.5) * hexSize * spread * pull
          const x = w.x + ox, z = w.z + oz
          if (!allows(spec.name, surface.groundAt(x, z))) continue
          spot = { x, z, y: surface.heightAt(x, z) ?? 0 }
        }
        if (!spot) { placed.add(k); continue }

        const obj = await model(spec.name)
        // Sit ON the ground, not at y = 0 — coast ramps slope, and later
        // elevation will too.
        obj.position.set(spot.x, spot.y, spot.z)
        obj.rotation.y = ((h >> 5) % 6) * (Math.PI / 3)   // snap to hex facings
        obj.scale.setScalar((spec.big ? 0.72 : 0.5) + ((h >> 11) % 26) / 100)
        group.add(obj)
        placed.add(k)
        blocks.push({
          x: obj.position.x, z: obj.position.z,
          r: hexSize * (spec.big ? 0.5 : 0.3),
        })

        /*
         * Ground cover on top: tufts and stones scattered around the feature.
         *
         * Sized against a PET, not the tile. The forest pieces are 0.23-0.58
         * units tall, so the first attempt at 0.16 scale rendered them at
         * about 0.05 — invisible beside a 0.24-tall pet. Ground cover has to
         * come up to roughly a pet's knee to register as ground cover at all.
         *
         * Small enough that pets walk over them, so they add no obstacles.
         */
        const detailCount = 4 + (h % 4)
        for (let d = 0; d < detailCount; d++) {
          const dh = hash({ q: a.q * 31 + d, r: a.r * 17 - d })
          const name = DETAIL_SMALL[dh % DETAIL_SMALL.length] as string
          const ang = ((dh >> 4) % 360) * Math.PI / 180
          const rad = hexSize * (0.2 + ((dh >> 7) % 52) / 100)
          const x = w.x + Math.cos(ang) * rad
          const z = w.z + Math.sin(ang) * rad
          // Tufts over the sea used to float; stones on the beach are fine.
          if (!allows(name, surface.groundAt(x, z))) continue
          const bit = await forestModel(name)
          bit.position.set(x, surface.heightAt(x, z) ?? 0, z)
          bit.rotation.y = ((dh >> 11) % 360) * Math.PI / 180
          const scale = 0.4 + ((dh >> 13) % 30) / 100
          bit.scale.setScalar(scale)
          group.add(bit)
          decor.push({ x, z, r: hexSize * 0.16 * (scale / 0.5) })
        }
      }
    },

    load: (name: string) => (/^[A-Z]/.test(name) ? forestModel(name) : model(name)),

    obstacles: () => blocks,

    clutter: () => [...blocks, ...decor],

    update(dt, t) {
      // Drift around the island rather than across it, so none ever crosses
      // between the camera and the world.
      for (const c of clouds) {
        const r = c.userData.ring as number
        const ang = Math.atan2(c.position.z, c.position.x) + (c.userData.drift as number) * dt * 0.06
        c.position.x = Math.cos(ang) * r
        c.position.z = Math.sin(ang) * r
        c.position.y += Math.sin(t * 0.3 + r) * dt * 0.08
      }
    },
  }
}
