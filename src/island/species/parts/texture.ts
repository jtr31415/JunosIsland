/**
 * The texture an assembled animal wears. §4 of `building-animals-from-parts.md`.
 *
 * We assemble the animal, so we own its UVs, and that turns colour from a
 * constraint into a choice. This file is the smallest thing that makes the
 * choice real, and it is deliberately small: a texture ATLAS SYSTEM is not what
 * §4 asks for.
 *
 * ## The canonical UV layout
 *
 * One column of flat swatches, read top to bottom. Slot `i` of `n` owns the
 * horizontal strip `v` in `[i/n, (i+1)/n)`, and `slotUv(i, n)` returns the point
 * at its centre. Every triangle of a part is given that one point on all three
 * corners, so a part is a flat colour.
 *
 * That is rule 8 taken literally — "colour is a lookup down a single gradient
 * column" — and it is Kenney's own mechanism, which is why the bank carries a
 * per-triangle `bands` index: the pack already split its parts into colour
 * regions by sending different triangles at different swatches, and
 * `assembly.ts` re-points those same triangle groups at our slots instead. The
 * eye card arrives pre-split into sclera and pupil for free.
 *
 * A slot is a CELL, not a texel, so §4's second way in — painting a boundary
 * into the image, a belly patch or a blaze — is a matter of drawing inside one
 * cell later without moving a single UV. Nothing does that yet and nothing here
 * pretends to.
 *
 * ## Cached, and DETACHED rather than disposed
 *
 * Non-negotiable, brief §19 and §4: a set's textures are shared by every pet of
 * that set, including ones a child already owns, so disposing one breaks pets
 * that are on screen. `detachAssemblyTextures` therefore drops the cache's
 * REFERENCES and never calls `dispose()`. A texture that is still on a live
 * material keeps working; the next build simply makes a new one. The test asserts
 * the `dispose` event never fires, because "we did not dispose it" is the only
 * part of this that a comment cannot enforce.
 */
import * as THREE from 'three'

/** Pixels per swatch cell. Four, so the layout is a cell and not a texel. */
export const SLOT_PX = 4

/** The centre of slot `i` of `n`, in UV. The whole layout, in one line. */
export const slotUv = (i: number, n: number): readonly [number, number] =>
  [0.5, (i + 0.5) / n]

/**
 * The cache key: the slot names and their colours, in order.
 *
 * Keyed on the PALETTE rather than on a species id on purpose. Two species that
 * paint the same colours in the same order want the same texture, and a key that
 * cannot go stale is worth more than a key that names something.
 */
export const paletteKey = (
  slots: readonly string[],
  palette: Readonly<Record<string, number>>,
): string => slots.map(s => `${s}:${((palette[s] ?? 0) >>> 0).toString(16).padStart(6, '0')}`)
  .join('|')

const CACHE = new Map<string, THREE.DataTexture>()

/**
 * The swatch column for one palette, made once and then handed out.
 *
 * `DataTexture` and not a canvas: this runs under `node` in the test
 * environment as happily as in a browser, and a canvas would buy nothing at
 * 4 x 20 pixels.
 */
export function assemblyTexture(
  slots: readonly string[],
  palette: Readonly<Record<string, number>>,
): THREE.DataTexture {
  const key = paletteKey(slots, palette)
  const hit = CACHE.get(key)
  if (hit) return hit

  const w = SLOT_PX
  const h = Math.max(1, slots.length) * SLOT_PX
  const data = new Uint8Array(w * h * 4)
  for (let i = 0; i < slots.length; i++) {
    const c = palette[slots[i]!] ?? 0
    const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255
    for (let y = i * SLOT_PX; y < (i + 1) * SLOT_PX; y++) {
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4
        data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = 255
      }
    }
  }

  const tex = new THREE.DataTexture(data, w, h)
  tex.colorSpace = THREE.SRGBColorSpace
  // Flat cells: nearest and no mipmaps, so no slot can ever bleed into its
  // neighbour and rule 8's "one hue per part" survives minification.
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.name = `assembly:${key}`
  tex.needsUpdate = true

  CACHE.set(key, tex)
  return tex
}

/** How many distinct palettes have been baked. For tests and for the workbench. */
export const assemblyTextureCount = (): number => CACHE.size

/**
 * DETACH the cache. Drops our references; disposes nothing.
 *
 * See the header: a live pet may still be wearing one of these. Returns how many
 * were let go.
 */
export function detachAssemblyTextures(): number {
  const n = CACHE.size
  CACHE.clear()
  return n
}
