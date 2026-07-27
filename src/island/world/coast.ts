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
import { DIRECTIONS, neighbours, key } from './hex'
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

/**
 * What each model presents at each of its six edges — MEASURED, like the table
 * above, and re-derived from the .gltf files by the test on every run.
 *
 * This is the finer-grained fact that `COAST_CANONICAL` summarises. The sand
 * ramp is not confined to the water arc: it spills onto the edges either side
 * of it, so a model with two water edges has two SAND edges flanking them and
 * only two edges left at full land height.
 *
 *   A  sand land land land sand water
 *   B  sand land land sand water water
 *   C  water sand land sand water water
 *   D  water water sand sand water water
 *
 * Which is the whole reason the coastline looked wrong. See `lookFor`.
 */
export type EdgeKind = 'land' | 'sand' | 'water'

export const COAST_EDGES: Record<CoastVariant, EdgeKind[]> = {
  A: ['sand', 'land', 'land', 'land', 'sand', 'water'],
  B: ['sand', 'land', 'land', 'sand', 'water', 'water'],
  C: ['water', 'sand', 'land', 'sand', 'water', 'water'],
  D: ['water', 'water', 'sand', 'sand', 'water', 'water'],
}

/** Surface height order. Green, then sand, then water — Joe's rule, as a number. */
const LEVEL: Record<EdgeKind, number> = { land: 0, sand: 1, water: 2 }

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
 * There is no "beach all the way round" hex in the pack — `hex_coast_E` looks
 * like one from its name and is not: measured, it has no water edge at all
 * and is a land tile with a sand strip, so it cannot stand in for a water hex.
 * Kept as a fact about the assets; `lookFor` no longer selects on arc width.
 */
export const MAX_COAST_ARC = 4

const ALL_LAND: EdgeKind[] = ['land', 'land', 'land', 'land', 'land', 'land']
const ALL_WATER: EdgeKind[] = ['water', 'water', 'water', 'water', 'water', 'water']

/**
 * What a tile drawn this way shows at each of its six edges.
 *
 * Grass is an unmodified hex, flat to its rim, so it presents land all round.
 * Open water presents water all round. Only a coast model presents sand, and a
 * coast model is a way of drawing a WATER tile, never a land one.
 */
export function presentedBy(look: TileLook): EdgeKind[] {
  if (look.kind === 'grass') return ALL_LAND
  if (look.kind === 'water') return ALL_WATER
  const edges = COAST_EDGES[look.variant]
  // Model edge m is drawn at world edge m + turns, so world k shows k - turns.
  return Array.from({ length: 6 },
    (_, k) => edges[(k - look.turns + 6) % 6] as EdgeKind)
}

/**
 * How badly one candidate orientation misreads the tiles around it.
 *
 * Joe's rule: *"edges to green are always green, then sand, then water. Never
 * a tile edge of A against the sand or water of B."* So a mismatch on a
 * GRASS-facing edge is the thing being forbidden, and one on a sea-facing edge
 * is merely untidy — hence the order-of-magnitude weight between them. Without
 * it the two readings tie, and the tie is the whole question: align the water
 * arc to the sea and you get a watery tile with a sandy lip against her
 * fields; align the land arc to her fields and you get the band she asked for.
 *
 * Steps are squared so that one 0.2 cliff (green straight down into water)
 * always loses to two 0.1 lips. Skipping a step in the sequence is the sin;
 * taking it gently is not.
 */
function mismatch(edges: EdgeKind[], turns: number, around: EdgeKind[]): number {
  let cost = 0
  for (let k = 0; k < 6; k++) {
    // Model edge m is drawn at world edge m + turns, so world k shows k - turns.
    const mine = edges[(k - turns + 6) % 6] as EdgeKind
    const theirs = around[k] as EdgeKind
    const step = LEVEL[mine] - LEVEL[theirs]
    cost += (theirs === 'land' ? 10 : 1) * step * step
  }
  return cost
}

/**
 * How to draw one owned tile.
 *
 * The coast belongs to the water (see `waterMask`), so the only question is
 * which of the four models to lay on a water hex and which way round. That
 * used to be answered by lining the model's WATER arc up with the way the
 * pond's water faced — which is wrong, and visibly so, because the sand ramp
 * is wider than the water arc. Line up the water and the ramp's shoulders land
 * on the edges either side of it, which on an ordinary stretch of coastline
 * are the edges facing her fields: green meeting sand a tenth of a unit lower,
 * the lip Joe saw.
 *
 * So every orientation of every model is scored against what the six
 * neighbours actually present, and the cheapest wins. That reproduces the way
 * the pack is meant to be laid — land arc inland, sand shoulders meeting the
 * next coast tile's shoulders, water to the open sea — without encoding it as
 * a rule that later has to be argued with.
 *
 * Two honest limitations remain, and both now degrade gently rather than
 * cliff-edge:
 *
 *   - No model has more than three land edges, so a pond with four or more
 *     fields around it cannot be flush on every side. The scorer spends the
 *     three land edges and the two sand shoulders where they help most, which
 *     leaves at worst one green-to-water edge on a pond ringed entirely by
 *     grass — and that tile reads as a pond, which is what it is.
 *   - Ties are broken by variant order and then by turns, so the coastline is
 *     stable: the same island always draws the same way, and nothing shimmers
 *     when a distant tile is placed.
 */
function bestLook(around: EdgeKind[]): TileLook {
  // Plain water is a candidate like any other, and wins out at sea, where
  // every neighbour is water and a beach would be a sandbank from nowhere.
  let best: TileLook = { kind: 'water', turns: 0 }
  let bestCost = mismatch(ALL_WATER, 0, around)

  for (const variant of COAST_VARIANTS) {
    const edges = COAST_EDGES[variant]
    for (let turns = 0; turns < 6; turns++) {
      const cost = mismatch(edges, turns, around)
      if (cost < bestCost) {
        bestCost = cost
        best = { kind: 'coast', variant, turns }
      }
    }
  }
  return best
}

/**
 * How many times the whole coastline may be re-scored before it is called
 * settled. Measured convergence on random forty-hex islands is well under
 * twenty sweeps; the cap only bounds a pathological shape, and because both
 * the cap and the sweep order are fixed, hitting it still yields the same
 * coastline every time.
 */
const MAX_SWEEPS = 24

/**
 * How to draw EVERY tile, solved together.
 *
 * Whole-island rather than per-tile, because a coast tile's neighbours include
 * other coast tiles, and what they show at the shared edge depends on how they
 * in turn were drawn. Scoring one tile against the assumption that every wet
 * neighbour is open water is wrong wherever two water hexes touch: in a pond
 * three in a row, the middle tile presented grass-height land at the very edge
 * where its neighbour presented open water — a 0.2 cliff between two tiles the
 * child dug as water, and lopsided, since the pond's other joint came out
 * clean. Across random islands roughly a tenth of water-to-water edges were
 * cliffed that way.
 *
 * So the coastline is re-scored until it stops moving, each tile answering to
 * what its neighbours are actually DRAWN as. This is precisely the licence Joe
 * gave — "coast tiles are the only ones that i'd allow to change
 * retrospectively to maintain that consistency" — and it is why grass is
 * excluded from the sweep: land is never re-cut.
 *
 * Sweeps run in sorted key order so the result cannot depend on Map insertion
 * order, which would make the island depend on the sequence she built it in.
 */
export function looksFor(island: Island): Map<string, TileLook> {
  const looks = new Map<string, TileLook>()
  const waters: Axial[] = []

  for (const [k, type] of island.tiles) {
    if (type === 'water') {
      const parts = k.split(',').map(Number)
      waters.push({ q: parts[0] as number, r: parts[1] as number })
      looks.set(k, { kind: 'water', turns: 0 })
    } else {
      looks.set(k, { kind: 'grass', turns: 0 })
    }
  }
  waters.sort((p, q) => (p.q - q.q) || (p.r - q.r))

  for (let sweep = 0; sweep < MAX_SWEEPS; sweep++) {
    let moved = false
    for (const a of waters) {
      const around = neighbours(a).map((n, k) => {
        const type = tileAt(island, n)
        // Off the edge of the island is open sea, and always will be.
        if (type === undefined) return 'water' as EdgeKind
        if (type === 'grass') return 'land' as EdgeKind
        /*
         * Our edge k is their edge k + 3: hexes meet head-on, so the
         * neighbour's opposite face is the one across the joint from ours.
         */
        return presentedBy(looks.get(key(n)) as TileLook)[(k + 3) % 6] as EdgeKind
      })
      const next = bestLook(around)
      const now = looks.get(key(a)) as TileLook
      if (now.kind !== next.kind || now.turns !== next.turns
        || (now.kind === 'coast' && next.kind === 'coast' && now.variant !== next.variant)) {
        looks.set(key(a), next)
        moved = true
      }
    }
    if (!moved) break
  }
  return looks
}

/**
 * How to draw ONE tile.
 *
 * Solves the whole island and picks the answer out, deliberately: a tile's
 * look genuinely depends on its neighbours' looks, so there is no cheaper
 * honest answer, and having one function rather than two means a test can
 * never be checking something the renderer does not do.
 */
export function lookFor(island: Island, a: Axial): TileLook {
  // Land is land. It is never re-cut by what happens beside it.
  if (tileAt(island, a) !== 'water') return { kind: 'grass', turns: 0 }
  return looksFor(island).get(key(a)) as TileLook
}

/** Every direction index, for tests and callers that want to enumerate. */
export const EDGE_COUNT = DIRECTIONS.length
