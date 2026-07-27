/**
 * One texture per set, made once and shared by everyone in it.
 *
 * Phase 3 item 6, the runtime half. Item 5's autopsy (HANDOFF §6) established
 * that all 24 species share a single material and a single texture, so a set
 * is exactly one recoloured 512×512 image — forty images for a thousand
 * creatures, rather than a thousand of anything.
 *
 * THE MATERIAL IS CLONED, NOT REPLACED, and that is not fussiness. The pet
 * GLBs declare `doubleSided: true` and rely on glTF's default roughness of 1;
 * a hand-built MeshStandardMaterial defaults to FrontSide, so swapping one in
 * renders every creature single-sided — holes through the models, which would
 * read as broken geometry rather than as a material mistake. Cloning the
 * model's own material and changing only its `map` keeps every property the
 * artist set and changes exactly the one thing a set is allowed to change.
 *
 * TWO SHARING RULES, both of which this project has met before in miniature:
 *
 *   - A three.js `clone()` shares materials with the original, so a cloned
 *     species arrives holding the NATURAL material. Dressing it is a separate
 *     and easily forgotten step, and forgetting it looks like the recolour
 *     failing rather than like the step being missed.
 *   - A set's material belongs to every pet of that set at once. Disposing it
 *     because one preview closed would break every other creature in the set,
 *     including ones she already owns (brief §19). Nothing here disposes per
 *     pet; the cache empties only when the whole field does.
 */
import * as THREE from 'three'
import { recolourInto, isNatural } from './recolour'
import { NATURAL, setById } from './sets'
import type { PetSet } from './sets'

export interface SetAtlas {
  /**
   * Put a pet into its set's colours.
   *
   * A no-op for the natural set — not "a recolour that happens to change
   * nothing", but genuinely untouched, which is what makes the friends Juno
   * already owns provably identical to before this engine existed.
   */
  dress(pet: THREE.Object3D, setId: string): Promise<void>
  /** The recoloured texture, or null for the natural set. */
  texture(setId: string): Promise<THREE.Texture | null>
  /** For the Pet-o-matic and the debug dump. */
  cached(): string[]
  /** Only ever called when the whole pet field goes. */
  dispose(): void
}

/**
 * Paint the recoloured atlas.
 *
 * A canvas rather than a shader, because the result is CACHEABLE: forty images
 * made once beat a fragment program run over every pixel of every pet every
 * frame on a mid-range tablet (brief §14). It also keeps the recolour rule as
 * ordinary arithmetic a unit test can reach, rather than GLSL nobody can check.
 */
function paint(source: CanvasImageSource, w: number, h: number, set: PetSet): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return canvas
  ctx.drawImage(source, 0, 0)
  const data = ctx.getImageData(0, 0, w, h)
  recolourInto(data.data, set)
  ctx.putImageData(data, 0, 0)
  return canvas
}

export function createSetAtlas(base = ''): SetAtlas {
  const loader = new THREE.TextureLoader()
  const textures = new Map<string, Promise<THREE.Texture | null>>()
  /** setId -> (source material uuid -> the dressed clone that set shares). */
  const dressed = new Map<string, Map<string, THREE.Material>>()
  const owned: THREE.Texture[] = []
  const clones: THREE.Material[] = []
  let source: Promise<THREE.Texture> | null = null

  const baseTexture = (): Promise<THREE.Texture> => {
    source ??= loader.loadAsync(`${base}pets/Textures/colormap.png`).then(t => {
      t.colorSpace = THREE.SRGBColorSpace
      t.flipY = false                       // glTF UV origin is top-left
      /*
       * No mipmaps, for the reason the tile atlas has none (HANDOFF §6): each
       * face samples a tiny swatch, and mips average across neighbours — here
       * that would bleed a pet's coat into its own eyes at distance, which is
       * the one blend that must never happen.
       */
      t.generateMipmaps = false
      t.minFilter = THREE.LinearFilter
      t.magFilter = THREE.LinearFilter
      owned.push(t)
      return t
    })
    return source
  }

  async function build(set: PetSet): Promise<THREE.Texture | null> {
    if (isNatural(set)) return null
    const src = await baseTexture()
    const image = src.image as (CanvasImageSource & { width: number; height: number }) | undefined
    if (!image) return null
    const map = new THREE.CanvasTexture(paint(image, image.width, image.height, set))
    map.colorSpace = THREE.SRGBColorSpace
    map.flipY = false
    map.generateMipmaps = false
    map.minFilter = THREE.LinearFilter
    map.magFilter = THREE.LinearFilter
    owned.push(map)
    return map
  }

  const api: SetAtlas = {
    texture(setId) {
      const hit = textures.get(setId)
      if (hit) return hit
      // An unknown set — a save naming one since removed — falls back to
      // natural rather than stopping her playing.
      const built = build(setById(setId) ?? NATURAL)
      textures.set(setId, built)
      return built
    },

    async dress(pet, setId) {
      const map = await api.texture(setId)
      if (!map) return                       // natural: leave the model alone

      let forSet = dressed.get(setId)
      if (!forSet) { forSet = new Map(); dressed.set(setId, forSet) }

      pet.traverse(node => {
        const mesh = node as THREE.Mesh
        if (!mesh.isMesh) return
        const from = mesh.material as THREE.Material
        let clone = (forSet as Map<string, THREE.Material>).get(from.uuid)
        if (!clone) {
          /*
           * Cloned from the MODEL's material, so doubleSided, roughness and
           * everything else the artist set survive. Only the map changes.
           */
          clone = from.clone()
          ;(clone as THREE.MeshStandardMaterial).map = map
          clone.name = `${from.name || 'pet'}:${setId}`
          clone.needsUpdate = true
          ;(forSet as Map<string, THREE.Material>).set(from.uuid, clone)
          clones.push(clone)
        }
        mesh.material = clone
      })
    },

    cached: () => [...textures.keys()],

    dispose() {
      for (const m of clones) m.dispose()
      for (const t of owned) t.dispose()
      clones.length = 0
      owned.length = 0
      textures.clear()
      dressed.clear()
      source = null
    },
  }
  return api
}
