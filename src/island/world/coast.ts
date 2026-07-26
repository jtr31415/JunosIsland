/**
 * Where the land meets the sea.
 *
 * Grass used to stop dead at the island's edge and drop into open water as a
 * green cliff. Every KayKit reference render puts a COAST tile there instead —
 * sand on the land side, sloping down into the shallows — and that sandy rim
 * is most of what makes the island read as an island rather than a piece of
 * lawn floating in a swimming pool.
 *
 * The rule: no owned grass tile may touch water directly. A grass tile with any
 * water or open-sea neighbour is DRAWN as a coast, oriented so its sand faces
 * the water.
 *
 * All of this is DERIVED, never stored. `Island` stays "which hexes the child
 * owns and what is on them"; the coastline is a function of that map, so
 * placing a tile automatically re-sands its neighbours and nothing can drift
 * out of sync with the save file.
 */
import { DIRECTIONS, neighbours } from './hex'
import type { Axial } from './hex'
import { has, tileAt } from './grid'
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
 * Which of the six neighbours are water, as a bitmask over DIRECTIONS.
 *
 * "Water" means owned water OR nothing at all: the island floats in open sea,
 * so an unbuilt neighbour is every bit as wet as a placed pond, and the shore
 * has to be drawn the same way for both.
 */
export function waterMask(island: Island, a: Axial): number {
  let mask = 0
  neighbours(a).forEach((n, k) => {
    if (!has(island, n) || tileAt(island, n) === 'water') mask |= 1 << k
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
 * The widest arc the models cover. Beyond it, a tile is not a coast at all.
 *
 * A coast model is land on one side and sea on the other, and the waterless
 * variants CUT THE SEA SIDE AWAY so the ocean shows through. That is the right
 * trade for a headland and completely wrong for an island: borrowing the
 * four-edge model for a tile with six wet edges deleted two thirds of the hex
 * and left Fred standing on a corner of his own rock. Above this width there
 * is no land side to stand on, so the tile stays a whole grass hex.
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
  if (tileAt(island, a) === 'water') return { kind: 'water', turns: 0 }

  const run = longestRun(waterMask(island, a))
  if (run.length === 0 || run.length > MAX_COAST_ARC) return { kind: 'grass', turns: 0 }

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
