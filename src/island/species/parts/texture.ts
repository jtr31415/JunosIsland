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
 * ## §4's SECOND way in: a boundary painted into the image
 *
 * A slot is a CELL, not a texel, so a belly patch, a blaze or a pair of socks is
 * a matter of drawing INSIDE one cell — no second shape, no split triangle, no
 * geometry at all. The squirrel is the first animal to use it.
 *
 * It needs one thing beyond the flat layout, and the earlier note here got that
 * wrong: it said the drawing happened "without moving a single UV". It cannot.
 * If every corner of every triangle reads the same point, whatever is painted
 * around that point is invisible. So a PATCHED part reads ACROSS its cell — one
 * v per vertex, mapped from the vertex's own height — and the boundary lives in
 * the image, at whichever row the two colours meet.
 *
 * Three consequences, all of them the reason to prefer this over splitting
 * triangles:
 *
 *   - **The line is exact and straight.** `v` is an affine function of position
 *     and barycentric interpolation of an affine function is exact, so the
 *     boundary is the plane `y = at` across every face and every chamfer, dead
 *     level, whatever the tessellation underneath it. Kenney could not do that:
 *     his boundary has to follow triangle edges, and the tiger's own belly line
 *     wanders over 0.067 of its hull height as a result (see `assembled/animal-squirrel.ts`).
 *   - **It costs no vertices except on the seam.** The weld key carries the uv,
 *     so a patched part splits a vertex only where two rows actually meet.
 *   - **`SLOT_PX` is 16 because the pack is authored on a 1/16 grid.** Sixteen
 *     rows per cell puts every boundary a builder can ask for on one of Kenney's
 *     own grid lines, and `assemblyTexture` refuses an `at` that falls between
 *     two — a boundary you cannot name in the pack's units is a boundary nobody
 *     can check.
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

/**
 * ROWS per swatch cell — and the reason it is 16 rather than 4.
 *
 * The pack is authored on a 1/16 grid (`docs/building-animals-from-parts.md` §7,
 * "Known debt"). Sixteen rows means a painted boundary lands on one of Kenney's
 * own grid lines and never between two, so `SlotSplit.at` is a number that can
 * be quoted back at the pack. It is also what makes the boundary CHECKABLE: the
 * texel edge between row `k-1` and row `k` sits at exactly `k/16` of the part's
 * height, so a test can assert where the line is rather than that a line exists.
 */
export const SLOT_PX = 16

/**
 * Pixels ACROSS a swatch cell. Four, so a cell is a cell and not a texel.
 *
 * Deliberately NOT raised with `SLOT_PX`: nothing varies horizontally. A part
 * reads its cell down the v axis and every row is one flat colour across.
 */
export const SLOT_W = 4

/**
 * A boundary painted into ONE slot's cell. §4's second way to two-tone.
 *
 * `below` is another slot's colour, drawn under the line; the owning slot's own
 * colour is drawn above it. `at` is where the line goes as a fraction of the
 * PART's own height, 0 at its bottom and 1 at its top, and it must land on the
 * pack's 1/16 grid.
 */
export interface SlotSplit {
  below: string
  at: number
}

/** Splits, by the slot whose cell is split. */
export type SlotSplits = Readonly<Record<string, SlotSplit>>

/**
 * Which row of a cell a split's line sits above — and the guard that a builder
 * cannot ask for a line the grid cannot draw.
 */
function splitRow(slot: string, s: SlotSplit): number {
  const row = s.at * SLOT_PX
  if (!Number.isInteger(row) || row < 1 || row > SLOT_PX - 1) {
    throw new Error(
      `assembly: slot "${slot}" splits at ${s.at}, which is not on the pack's 1/16 grid. `
      + `A painted boundary must be k/${SLOT_PX} for k in 1..${SLOT_PX - 1} — see texture.ts.`,
    )
  }
  return row
}

/**
 * The pupil of the pack's own eye, MEASURED. Every assembled species uses this.
 *
 * Joe, 29 July, on the first assembled animal: *"the original eyes have a
 * somewhat grey pupil colour, the new ones have black ones, its a bit crass,
 * soften to same shade as the original"*. He is right, and the cause is worth
 * stating plainly because it is not what it looks like.
 *
 * **The black did not come from the lifted decal. We painted it.** The eye card
 * is real geometry lifted out of the `.glb` files, but `assembly.ts` throws its
 * original UVs away and writes `slotUv()` on every corner — so what a lifted
 * part's triangles ARE is carried, and what colour they were is not. The eye
 * card arrives already split into sclera and pupil (bands 3 and 15), and then
 * the species records said `pupil: 0x000000`, a number nobody measured. §4 says we
 * own the texture; owning it means we are answerable for every colour in it.
 *
 * So this is measured off the real files rather than picked: 544 eye-card
 * triangles across all 24 species, every band-15 triangle's UV sampled against
 * `Textures/colormap.png` and averaged by TRIANGLE AREA (never by count — a
 * pupil is a few large faces and its outline is many small ones, the same trap
 * `tools/pets/atlas.mjs` documents).
 *
 * The answer is **#4c4f5e**: rgb(76, 79, 94), max channel 94, saturation 0.19. A
 * dark blue-grey, not a black. `docs/HANDOFF.md` §6's "the pack's black is
 * `#4d515f`" is confirmed and is the same swatch — the eye decal samples column
 * u=496 rows 399–497, the identical run of the identical gradient that every leg
 * mesh, hoof and outline in the pack draws from. Per-species the spread is one
 * gradient step: 21 of 24 measure `#4c505e`, the rest `#4d505f`, the panda
 * `#4b4e5c`, the cat `#474a57`.
 *
 * It lives here, once, rather than in each species' palette, because Joe's note
 * is about every animal built by this method and not about the hedgehog.
 * `tests/island/assembly-hedgehog.test.ts` asserts that no assembled species
 * paints an eye card's pupil band any other colour.
 */
export const PACK_PUPIL = 0x4c4f5e

/**
 * The sclera the pack actually uses, measured the same way: **#ededf4**, a
 * blue-white, over the eye card's band-3 triangles.
 *
 * NOT applied, deliberately. Joe's note is about the pupil; the eye card carries
 * both halves and the eyes are the face, which brief §5 keeps constant per
 * species. Recorded here so the next reader knows the number exists and that
 * leaving the hedgehog's warmer `0xf4e6cc` alone was a decision rather than an
 * oversight. If he ever asks for the whites too, this is the value.
 */
export const PACK_SCLERA = 0xededf4

/** The centre of slot `i` of `n`, in UV. The whole layout, in one line. */
export const slotUv = (i: number, n: number): readonly [number, number] =>
  [0.5, (i + 0.5) / n]

/**
 * A point INSIDE slot `i`'s cell, for a vertex `t` of the way up its part.
 *
 * `t = 0` reads the cell's bottom row, `t = 1` its top row, and the clamp to
 * half a texel keeps both ends off the cell's own edge — a vertex that landed
 * exactly on the seam would sample its neighbour's colour on some drivers and
 * not others, which is the sort of bug that only appears on one tablet.
 *
 * The useful property is what happens BETWEEN the rows: the texel edge above row
 * `k` sits at `t = k / SLOT_PX` exactly, so a boundary drawn there is the plane
 * `y = k/16` of the part's height and nothing about the mesh can move it.
 */
export const patchUv = (i: number, n: number, t: number): readonly [number, number] => {
  const row = Math.min(Math.max(t * SLOT_PX, 0.5), SLOT_PX - 0.5)
  return [0.5, (i * SLOT_PX + row) / (n * SLOT_PX)]
}

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
  splits: SlotSplits = {},
): string => slots.map((s) => {
  const hex = ((palette[s] ?? 0) >>> 0).toString(16).padStart(6, '0')
  const sp = splits[s]
  /* The split is part of the KEY, not a decoration on it: two species with the
   * same colours and a different belly line are two different images. */
  return sp ? `${s}:${hex}/${sp.below}@${sp.at}` : `${s}:${hex}`
}).join('|')

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
  splits: SlotSplits = {},
): THREE.DataTexture {
  for (const [slot, s] of Object.entries(splits)) {
    if (!slots.includes(slot)) {
      throw new Error(`assembly: a split names slot "${slot}", which is not in the palette`)
    }
    if (!slots.includes(s.below)) {
      throw new Error(`assembly: slot "${slot}" splits to "${s.below}", which is not in the palette`)
    }
    splitRow(slot, s)
  }
  const key = paletteKey(slots, palette, splits)
  const hit = CACHE.get(key)
  if (hit) return hit

  const w = SLOT_W
  const h = Math.max(1, slots.length) * SLOT_PX
  const data = new Uint8Array(w * h * 4)
  for (let i = 0; i < slots.length; i++) {
    const name = slots[i]!
    const split = splits[name]
    /* Row 0 of a cell is the BOTTOM of the part, so the split's rows are the
     * low ones and the boundary is the texel edge above row `split.at * 16`. */
    const line = split ? splitRow(name, split) : 0
    const above = palette[name] ?? 0
    const under = split ? (palette[split.below] ?? 0) : above
    for (let k = 0; k < SLOT_PX; k++) {
      const c = k < line ? under : above
      const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255
      const y = i * SLOT_PX + k
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
