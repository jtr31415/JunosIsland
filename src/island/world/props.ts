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
 * WHAT KIND OF PLACE a tile is.
 *
 * Tiles used to draw their feature and their ground cover from one global
 * weighted list, which gave every hex the same even sprinkle of everything.
 * Uniform variety is its own kind of uniform: two tiles side by side looked
 * interchangeable, and the island read as wallpaper.
 *
 * A character is picked per REGION rather than per tile, so neighbours tend to
 * agree and the island grows in patches — a wood here, a stony shoulder there,
 * highlands rising together into a range instead of one lonely peak per
 * hillside. That patchiness is what the KayKit reference renders have and a
 * per-tile roll cannot produce.
 */
type Character = 'meadow' | 'wood' | 'rocky' | 'highland'

const CHARACTERS: Array<{ kind: Character; weight: number }> = [
  { kind: 'meadow', weight: 4 },
  { kind: 'wood', weight: 4 },
  { kind: 'rocky', weight: 2 },
  { kind: 'highland', weight: 3 },
]

/**
 * The big feature each character grows, weighted within its own kind.
 *
 * `big` pieces are landscape rather than objects — they sit centred, block a
 * wider radius and carry the island's skyline. A flat plane of hexes has no
 * silhouette under an orbit camera, and silhouette is what makes a diorama.
 */
const FEATURES: Record<Character, Array<{ name: string; weight: number; big?: boolean }>> = {
  meadow: [
    { name: '', weight: 8 },                       // open ground: the rests
    { name: 'tree_single_A', weight: 3 },
    { name: 'tree_single_B', weight: 3 },
    { name: 'rock_single_A', weight: 2 },
    { name: 'tree_single_A_cut', weight: 1 },
  ],
  wood: [
    { name: 'trees_A_small', weight: 5 },
    { name: 'trees_A_medium', weight: 4 },
    { name: 'trees_B_small', weight: 4 },
    { name: 'trees_B_medium', weight: 3 },
    { name: 'trees_A_large', weight: 2 },
    { name: 'hills_A_trees', weight: 3, big: true },
    { name: 'hills_B_trees', weight: 3, big: true },
    { name: '', weight: 2 },
  ],
  rocky: [
    { name: 'rock_single_A', weight: 3 },
    { name: 'rock_single_B', weight: 3 },
    { name: 'rock_single_C', weight: 2 },
    { name: 'rock_single_D', weight: 2 },
    { name: 'hills_C', weight: 2, big: true },
    { name: '', weight: 3 },
  ],
  highland: [
    { name: 'hills_A', weight: 4, big: true },
    { name: 'hills_B', weight: 4, big: true },
    { name: 'hills_C', weight: 3, big: true },
    { name: 'hills_C_trees', weight: 3, big: true },
    /*
     * The BARE mountain variants are deliberately absent.
     *
     * They carry no grass and sample the atlas's rock swatch, which on a
     * green summer island reads as a sand mesa dropped in from a desert —
     * two of them side by side looked like a bug rather than a mountain.
     * The grass-topped variants say "mountain" without leaving the biome.
     */
    /*
     * Mountains are RARE, even in the highlands.
     *
     * A mountain on every other highland hex is not a range, it is a wall —
     * and the Summer atlas renders their rock tan, so a cluster of them reads
     * as desert on a green island. Hills carry the skyline; a mountain is the
     * exclamation mark at the end of it.
     */
    { name: 'mountain_A_grass', weight: 1, big: true },
    { name: 'mountain_B_grass', weight: 1, big: true },
    { name: 'mountain_C_grass', weight: 1, big: true },
    { name: 'mountain_A_grass_trees', weight: 1, big: true },
    { name: 'mountain_C_grass_trees', weight: 1, big: true },
  ],
}

/**
 * Ground cover from the Forest Nature pack — the small stuff that makes a tile
 * look inhabited rather than decorated.
 *
 * Deliberately a SECOND layer over the features above: the hexagon pack
 * supplies landscape, this supplies undergrowth, and nearly every tile gets
 * some. That two-layer split is what stops the island reading as a tidy
 * arrangement of objects.
 *
 * The pack ships 105 models and this used to place EIGHT of them, so every
 * tile drew its cover from the same handful and the repetition was obvious
 * across any two hexes. The lists below are per character, so a rocky
 * shoulder is stony and a meadow is grassy rather than both being an even mix.
 *
 * It has its OWN texture, not the hexagon atlas.
 */
const COVER: Record<Character, readonly string[]> = {
  meadow: [
    'Grass_1_A_Color1', 'Grass_1_B_Color1', 'Grass_1_C_Color1', 'Grass_1_D_Color1',
    'Grass_2_A_Color1', 'Grass_2_B_Color1', 'Grass_2_C_Color1', 'Grass_2_D_Color1',
    'Bush_1_A_Color1', 'Bush_1_C_Color1', 'Bush_2_B_Color1', 'Bush_3_A_Color1',
    'Rock_1_C_Color1', 'Rock_2_D_Color1',
  ],
  wood: [
    'Bush_1_A_Color1', 'Bush_1_B_Color1', 'Bush_1_D_Color1', 'Bush_1_F_Color1',
    'Bush_2_A_Color1', 'Bush_2_C_Color1', 'Bush_2_E_Color1',
    'Bush_4_A_Color1', 'Bush_4_C_Color1', 'Bush_4_E_Color1',
    'Grass_1_B_Color1', 'Grass_2_C_Color1',
    'Rock_1_H_Color1', 'Rock_3_D_Color1',
  ],
  rocky: [
    'Rock_1_A_Color1', 'Rock_1_D_Color1', 'Rock_1_G_Color1', 'Rock_1_K_Color1',
    'Rock_1_N_Color1', 'Rock_2_A_Color1', 'Rock_2_C_Color1', 'Rock_2_F_Color1',
    'Rock_3_A_Color1', 'Rock_3_E_Color1', 'Rock_3_J_Color1', 'Rock_3_M_Color1',
    'Rock_3_Q_Color1', 'Grass_1_C_Color1', 'Bush_3_B_Color1',
  ],
  highland: [
    'Rock_1_B_Color1', 'Rock_1_I_Color1', 'Rock_1_P_Color1',
    'Rock_2_B_Color1', 'Rock_2_G_Color1', 'Rock_3_C_Color1', 'Rock_3_H_Color1',
    'Rock_3_O_Color1', 'Grass_1_D_Color1', 'Grass_2_B_Color1',
    'Bush_3_C_Color1', 'Bush_4_F_Color1',
  ],
}

/**
 * A dead tree among live ones, occasionally.
 *
 * The cheapest way to stop a wood looking planted: real woods have one.
 */
const BARE_TREES = [
  'Tree_Bare_1_A_Color1', 'Tree_Bare_1_B_Color1', 'Tree_Bare_1_C_Color1',
  'Tree_Bare_2_A_Color1', 'Tree_Bare_2_B_Color1', 'Tree_Bare_2_C_Color1',
]

/** What grows on water. The same set the growing plot builds a pond from. */
const WATER_PIECES = [
  'waterlily_A', 'waterlily_B', 'waterplant_A', 'waterplant_B', 'waterplant_C',
]

/** World centre of a hex — a local alias so scatter can be called early. */
const w0 = (a: Axial, hexSize: number): { x: number; z: number } => toWorld(a, hexSize)

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

/**
 * Scale an object to fit inside a box, without distorting it.
 *
 * ONE function, because fitting by a single dimension is a bug generator and
 * this project produced three of them in an afternoon. Fit by height and a
 * lily pad — 0.02 units tall and nearly a metre across — is blown up to a
 * hex-sized tan disc. Fit by width and a tall thin tree is squashed to a
 * shrub. Neither dimension is "the" one: the piece has to fit both.
 *
 * These packs disagree about scale by up to ninefold WITHIN a single family
 * (Forest Nature's Rock_1 runs 0.54 to 4.58 units tall), so nothing here may
 * use a fixed multiplier. Everything is measured and fitted, and any model
 * added later is normalised for free.
 */
export function fitInto(o: THREE.Object3D, maxWidth: number, maxHeight: number): void {
  o.scale.setScalar(1)
  /*
   * Refresh the world matrices FIRST. Box3.setFromObject reads matrixWorld,
   * and for an object not yet in the scene those are stale — several KayKit
   * models carry a transform on the node above the mesh, so measuring them
   * cold reports the wrong size and the correction goes wild.
   */
  o.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(o)
  const width = Math.max(box.max.x - box.min.x, box.max.z - box.min.z)
  const height = box.max.y - box.min.y
  const fit = Math.min(
    width > 1e-4 ? maxWidth / width : Infinity,
    height > 1e-4 ? maxHeight / height : Infinity,
  )
  if (Number.isFinite(fit) && fit > 0) o.scale.setScalar(fit)
}

/**
 * How much room each kind of thing may take, as [width, height] in world
 * units — width relative to the hex, height against a PET.
 *
 * A pet is about 0.24 units tall and Fred about 0.35, so ground cover
 * reaching a pet's knee registers as ground cover, and a hill has to clear
 * both to read as landscape rather than as an object left lying there.
 */
export const FITS = {
  /** Tufts, stones, undergrowth. */
  cover: [0.42, 0.16] as const,
  /** A dead tree standing among live ones. */
  bare: [0.45, 0.7] as const,
  /** Single trees and small clumps. */
  feature: [1.0, 0.95] as const,
  /**
   * Hills and mountains. These carry their own hex base, so at full width
   * they cover the tile and read as REPLACING it; a green rim around the base
   * is what turns a mountain back into a feature of the meadow it rose from.
   */
  big: [1.7, 1.7] as const,
  /** Lily pads: flat and wide, so width is what binds. */
  lily: [0.5, 0.12] as const,
  /** Reeds: the opposite. */
  reed: [0.3, 0.26] as const,
} as const

/** Stable per-coordinate hash, so a tile's scenery never changes. */
function hash(a: Axial): number {
  let h = (a.q * 73856093) ^ (a.r * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

/** Weighted choice from a list, driven by a hash rather than by chance. */
function pick<T extends { weight: number }>(list: readonly T[], h: number): T {
  const total = list.reduce((n, x) => n + x.weight, 0)
  let r = h % total
  for (const x of list) {
    r -= x.weight
    if (r < 0) return x
  }
  return list[0] as T
}

/**
 * What kind of place this tile is.
 *
 * Derived from a COARSE coordinate — neighbouring hexes usually fall in the
 * same cell and so share a character. That is what makes highlands cluster
 * into a range and woods into a wood, instead of every tile rolling
 * independently and the whole island averaging out to the same texture.
 *
 * The blend with the tile's own hash keeps region edges ragged; without it
 * the patches are visibly rectangular.
 */
function characterOf(a: Axial): Character {
  const region = hash({ q: Math.floor(a.q / 2), r: Math.floor(a.r / 2) })
  const jitter = hash(a) % 5 === 0 ? hash({ q: a.r, r: a.q }) : 0
  return pick(CHARACTERS, (region ^ jitter) >>> 0).kind
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

  /**
   * Ground cover around whatever the tile grew: tufts, stones, undergrowth.
   *
   * Sized against a PET, not the tile. The forest pieces are 0.23-0.58 units
   * tall, so the first attempt at 0.16 scale rendered them at about 0.05 —
   * invisible beside a 0.24-tall pet. Ground cover has to come up to roughly
   * a pet's knee to register as ground cover at all.
   *
   * Small enough that pets walk over it, so it adds no obstacles — but it IS
   * counted as clutter, because an egg standing in a bush cannot be tapped.
   */
  async function scatter(
    a: Axial, w: { x: number; z: number }, character: Character,
    h: number, hexSize: number, surface: Surface,
    /** Keep everything at least this far out, leaving the middle clear. */
    innerClear = 0,
  ): Promise<void> {
    const palette = COVER[character]
    const count = 5 + (h % 5)
    for (let d = 0; d < count; d++) {
      const dh = hash({ q: a.q * 31 + d, r: a.r * 17 - d })
      /*
       * One dead tree now and then, in woods and highlands. The cheapest way
       * to stop a wood looking planted: real woods have one.
       */
      const bare = (character === 'wood' || character === 'highland') && dh % 23 === 0
      const name = bare
        ? BARE_TREES[dh % BARE_TREES.length] as string
        : palette[dh % palette.length] as string

      const ang = ((dh >> 4) % 360) * Math.PI / 180
      const rad = hexSize * Math.max(innerClear, 0.18 + ((dh >> 7) % 55) / 100)
      const x = w.x + Math.cos(ang) * rad
      const z = w.z + Math.sin(ang) * rad
      // Tufts over the sea used to float; stones on the beach are fine.
      if (!allows(name, surface.groundAt(x, z))) continue

      const bit = await forestModel(name)
      bit.position.set(x, surface.heightAt(x, z) ?? 0, z)
      bit.rotation.y = ((dh >> 11) % 360) * Math.PI / 180
      // Vary per PIECE, not per tile, or a tile reads as one stamped set.
      const [cw, ch] = bare ? FITS.bare : FITS.cover
      const vary = 0.8 + ((dh >> 13) % 45) / 100
      fitInto(bit, cw * vary, ch * vary)
      group.add(bit)
      decor.push({ x, z, r: hexSize * 0.10 })
      if (bare) blocks.push({ x, z, r: hexSize * 0.14 })
    }
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
            /*
             * A lily is 0.02 units tall and a reed 0.25 — and a lily is WIDE.
             * Fitting these by height alone blew each pad up into a tan disc
             * the size of a hex, sitting beside every pond.
             */
            const [ww, wh] = name.startsWith('waterlily') ? FITS.lily : FITS.reed
            const wv = 0.8 + ((ih >> 13) % 45) / 100
            fitInto(bit, ww * wv, wh * wv)
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

        /*
         * Is this tile actually THERE yet?
         *
         * Everything below asks the surface — a raycast against the tile
         * meshes — where it may plant. If the tile field has not been synced
         * with this hex, every probe says "no ground", every piece is
         * rejected, and marking the tile done would leave it permanently
         * bare: a tile that lost its one chance to a render-order mistake.
         *
         * So a tile with no ground under its own centre is simply left for
         * next time, and the next sync dresses it properly.
         */
        const home = toWorld(a, hexSize)
        if (surface.groundAt(home.x, home.z) === 'none') continue

        /*
         * The home rock is DRESSED, not skipped.
         *
         * It used to grow nothing at all, so while every other tile had cover
         * the one the child looks at most was bare grass. The centre still
         * stays clear — Fred, her signpost, the egg and the first pet all
         * live there — but the rim gets a ring of undergrowth, which is the
         * difference between "kept clear" and "unfinished".
         */
        if (a.q === 0 && a.r === 0) {
          placed.add(k)
          await scatter(a, w0(a, hexSize), 'meadow', hash(a), hexSize, surface, 0.62)
          continue
        }

        /*
         * What kind of place this is, and therefore what grows on it.
         *
         * Open ground is now an ENTRY in each character's feature table
         * rather than a blanket "one tile in three": a meadow is mostly open,
         * a highland almost never is. That keeps the breathing space pets
         * wander in without flattening the difference between a wood and a
         * field.
         */
        const character = characterOf(a)
        const spec = pick(FEATURES[character], h)
        const w = home

        if (!spec.name) {
          placed.add(k)
          await scatter(a, w, character, h, hexSize, surface)
          continue
        }
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
        /*
         * Landscape is fitted by FOOTPRINT and objects by HEIGHT.
         *
         * A hill has to match the hex it sits on and may be any height it
         * likes — that variation is the skyline. A tree has to stand the
         * right height beside a pet and may be any width it likes.
         */
        const [fw, fh] = spec.big ? FITS.big : FITS.feature
        const vary = 0.88 + ((h >> 11) % 26) / 100
        fitInto(obj, fw * vary, fh * vary)
        group.add(obj)
        placed.add(k)
        blocks.push({
          x: obj.position.x, z: obj.position.z,
          r: hexSize * (spec.big ? 0.5 : 0.3),
        })

        await scatter(a, w, character, h, hexSize, surface)
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
