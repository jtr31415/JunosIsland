/**
 * Where the land meets the sea.
 *
 * Grass used to stop dead at the island's edge and drop into open water as a
 * green cliff. Every KayKit reference render puts a COAST tile there instead —
 * sand on the land side, sloping down into the shallows — and that sandy rim
 * is most of what makes the island read as an island rather than a piece of
 * lawn floating in a swimming pool.
 *
 * The rule: a WATER tile that meets her fields is drawn as a coast, turned so
 * its own land rim faces them. The land itself is never touched — see
 * waterMask for why that matters.
 *
 * All of this is DERIVED, never stored. `Island` stays "which hexes the child
 * owns and what is on them"; the coastline is a function of that map, so
 * placing a tile automatically re-sands its neighbours and nothing can drift
 * out of sync with the save file.
 */
import { DIRECTIONS, neighbours } from './hex'
import type { Axial } from './hex'
import { tileAt } from './grid'
import type { Island } from './grid'

export const COAST_VARIANTS = ['A', 'B', 'C', 'D'] as const
export type CoastVariant = typeof COAST_VARIANTS[number]

/** A contiguous arc of hex edges: `length` of them, beginning at `start`. */
export interface Run { start: number; length: number }

/**
 * Which edges of each coast model are water, MEASURED FROM THE ASSETS.
 *
 * The four models are one, two, three and four adjacent water edges. Each was
 * measured by interpolating the mesh height at every edge midpoint: the land
 * surface sits at y = 0, open water at y = -0.2, and the sand ramp between
 * them around -0.05 to -0.1. An edge counts as water below -0.15, which puts
 * the ramps firmly on the land side of the line.
 *
 * `tests/island/coast.test.ts` re-derives all of this from the .gltf and .bin
 * files on every run, so the table cannot quietly drift away from the art.
 */
export const COAST_CANONICAL: Record<CoastVariant, Run> = {
  A: { start: 5, length: 1 },
  B: { start: 4, length: 2 },
  C: { start: 4, length: 3 },
  D: { start: 4, length: 4 },
}

/** How a tile should be drawn. Derived per frame-of-state, never saved. */
export type TileLook =
  | { kind: 'grass'; turns: 0 }
  | { kind: 'water'; turns: 0 }
  | { kind: 'coast'; variant: CoastVariant; turns: number }

/**
 * Which of the six neighbours are NOT land, as a bitmask over DIRECTIONS.
 *
 * Asked of a WATER tile: which way does its water face? The complement is
 * where it meets her fields, and that is the side that needs a beach.
 *
 * THE COAST BELONGS TO THE WATER, not to the land. Two reasons, both Joe's
 * and both right:
 *
 *   - A tile she already owns must not be re-cut behind her. Digging a pond
 *     used to reach into the neighbouring field and carve a third of it away
 *     into sand and sea, changing land she had already paid for.
 *   - And it left a GAP. The land tile's coast model had its water side cut
 *     away so the sea could show through, but the neighbouring water hex is a
 *     flat slab at its own height — so where the sand ran out there was a
 *     visible step into nothing.
 *
 * Putting the beach inside the water cell fixes both: the pond carries its
 * own rim, and it meets the field's flat, unmodified edge.
 */
export function waterMask(island: Island, a: Axial): number {
  let mask = 0
  neighbours(a).forEach((n, k) => {
    if (tileAt(island, n) !== 'grass') mask |= 1 << k
  })
  return mask
}

/**
 * The longest unbroken arc of water edges in a mask.
 *
 * Hexes wrap, so the arc may run past direction 5 and back round to 0 — which
 * is why this counts from every starting edge rather than scanning once.
 */
export function longestRun(mask: number): Run {
  if (mask === 0) return { start: 0, length: 0 }
  if (mask === 0b111111) return { start: 0, length: 6 }

  let best: Run = { start: 0, length: 0 }
  for (let start = 0; start < 6; start++) {
    // Only count from an edge that BEGINS an arc, or a five-edge arc would be
    // reported five times over with four wrong starting points.
    if (!(mask >> start & 1)) continue
    if (mask >> ((start + 5) % 6) & 1) continue
    let length = 0
    while (length < 6 && (mask >> ((start + length) % 6) & 1)) length++
    if (length > best.length) best = { start, length }
  }
  return best
}

/**
 * The widest water arc the models cover.
 *
 * A pond entirely surrounded by field has a water arc of ZERO and no model —
 * there is no "beach all the way round" hex in the pack. It draws as plain
 * water, which is a clean step down at every edge rather than a broken one.
 * Above four, the pond is mostly open water and the same applies.
 */
const MAX_COAST_ARC = 4

/**
 * How to draw one owned tile.
 *
 * Two honest limitations, both of which degrade to a plain hex rather than to
 * something broken:
 *
 *   - Arcs of five or six have no model and no sensible substitute, so they
 *     draw as whole grass with the old cliff edge. That covers Fred's lonely
 *     rock and the odd spit — and a full tile she can see is worth more than
 *     a beach that eats it (brief §18).
 *   - A tile with water on two OPPOSITE sides is not one arc but two, and no
 *     single model can serve both. The longer arc wins and the shorter one
 *     stays a cliff. Choosing the longest is what keeps the coastline
 *     continuous where it matters most: along the open sea.
 */
export function lookFor(island: Island, a: Axial): TileLook {
  // Land is land. It is never re-cut by what happens beside it.
  if (tileAt(island, a) !== 'water') return { kind: 'grass', turns: 0 }

  /*
   * A water tile with a shore: the model's own water arc must line up with
   * the way this pond's water actually faces, which leaves its land arc
   * against her fields.
   */
  const run = longestRun(waterMask(island, a))
  if (run.length === 0 || run.length > MAX_COAST_ARC) return { kind: 'water', turns: 0 }

  const variant = COAST_VARIANTS[run.length - 1] as CoastVariant
  const canonical = COAST_CANONICAL[variant]
  /*
   * rotation.y = turns * PI/3 moves the model's direction k to k + turns.
   *
   * Verified against the meshes rather than reasoned about: three.js rotates
   * a point's bearing DOWN by the angle, and the axial directions are laid out
   * at -60 degrees per index, so the two sign flips cancel. That is exactly
   * the kind of cancellation that is a coin flip if you only think about it.
   */
  return { kind: 'coast', variant, turns: (run.start - canonical.start + 6) % 6 }
}

/** Every direction index, for tests and callers that want to enumerate. */
export const EDGE_COUNT = DIRECTIONS.length
