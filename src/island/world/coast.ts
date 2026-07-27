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
import type { Island, TileType } from './grid'

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
 * a tile edge of A against the sand or water of B."* A mismatch on a
 * GRASS-facing edge is the thing being forbidden; one on a sea-facing edge is
 * milder but not free.
 *
 * The costs are stated as a table rather than derived from a step size,
 * because the two directions are NOT symmetric and deriving them made them so.
 * The first version charged by the size of the height step, which made a green
 * wall rising out of the sea (4) cheaper than a sandy lip against her fields
 * (10) — so on a jagged coast the scorer would happily shove land into the
 * water to keep the grass edges perfect. Fable's review flagged it as a
 * consequence and I recorded it as a known trade; Joe then saw one in a pond
 * and it is plainly a bug, not a trade.
 *
 * In badness order: water against her grass is a cliff and unforgivable; land
 * into open water is a wall in the middle of a pond and nearly as bad; a sand
 * lip against grass is mild; sand meeting water is what a beach IS.
 */
const COST: Record<EdgeKind, Record<EdgeKind, number>> = {
  //         they show:  land   sand  water
  land: { land: 0, sand: 2, water: 40 },
  sand: { land: 10, sand: 0, water: 2 },
  water: { land: 100, sand: 2, water: 0 },
}

/**
 * Is this orientation CLEAN — no beach against her fields, no green wall at sea?
 *
 * Joe's rule, hardened from a weighted cost into a hard constraint: *"we should
 * never allow a full land tile against a coast tile"*, and its mirror, which he
 * gave earlier — *"never a tile edge of A against the sand or water of B"*.
 *
 * The cost table below still exists, and still ranks the near-misses, because it
 * is what chooses BETWEEN clean orientations and what degrades gracefully if an
 * island ever arrives — from an edited save, say — in a shape that has none. But
 * clean is now a yes-or-no question, and `drawableAsWater` is what stops the
 * child creating a shape where the answer is no.
 */
function clean(edges: EdgeKind[], turns: number, around: EdgeKind[]): boolean {
  for (let k = 0; k < 6; k++) {
    const mine = edges[(k - turns + 6) % 6] as EdgeKind
    const theirs = around[k] as EdgeKind
    if (theirs === 'land' && mine !== 'land') return false   // beach into her field
    if (theirs !== 'land' && mine === 'land') return false   // green wall at sea
  }
  return true
}

/**
 * How long a coastline this orientation shows: its non-land edges.
 *
 * Joe: *"the shortest coast line option tile for the situation should be
 * forced."* Fewest sand-and-water edges is the least the island has to be cut
 * about to accommodate the water.
 */
const coastLength = (edges: EdgeKind[]): number =>
  edges.filter(e => e !== 'land').length

/**
 * Could a water tile here be drawn without a single bad joint?
 *
 * This is the placement rule, and it is DERIVED from the measured edge table
 * rather than stated as a number, so it tracks the art. Enumerated exhaustively
 * over all 64 neighbourhoods, exactly 19 are drawable: nought, one, two or three
 * green edges, and the green ones forming a SINGLE contiguous arc. Four or more
 * is arithmetic — no model has four land edges — and a split arc fails because
 * every model's water is one unbroken run, so its land must be too.
 *
 * Which is what makes the whole "coast belongs to the water" design hold up. If
 * water only ever goes where this returns true, the water cell carries the
 * entire beach and the field beside it stays a plain, flat hex — so land she has
 * already paid for is never re-cut behind her, and no saved per-tile look or
 * third tile type is needed. The cost is that an enclosed pond is not
 * constructible: water grows as coastline, never as a hole in her fields.
 */
export function drawableAsWater(around: EdgeKind[]): boolean {
  if (clean(ALL_WATER, 0, around)) return true
  for (const variant of COAST_VARIANTS) {
    for (let turns = 0; turns < 6; turns++) {
      if (clean(COAST_EDGES[variant], turns, around)) return true
    }
  }
  return false
}

function mismatch(edges: EdgeKind[], turns: number, around: EdgeKind[]): number {
  let cost = 0
  for (let k = 0; k < 6; k++) {
    // Model edge m is drawn at world edge m + turns, so world k shows k - turns.
    const mine = edges[(k - turns + 6) % 6] as EdgeKind
    const theirs = around[k] as EdgeKind
    cost += (COST[mine] as Record<EdgeKind, number>)[theirs]
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
function bestLook(types: EdgeKind[], drawn: EdgeKind[]): TileLook {
  /*
   * Ranked in three keys, in this order: CLEAN first, then the SHORTEST
   * coastline, then the old cost as a tie-break.
   *
   * Clean first is Joe's hardening — a clean orientation beats an unclean one
   * however cheap the unclean one scores, which is what retires the trade this
   * function used to make. The cost table had land-into-water at 40 and
   * sand-onto-grass at 10, so on a jagged coast it would shove a green wall into
   * the sea to keep the grass edges perfect; the note about that being a known
   * consequence is gone, because it is no longer reachable on an island the
   * child can actually build (see `drawableAsWater`).
   *
   * Shortest coastline second is Joe's "the shortest coast line option tile for
   * the situation should be forced": given two clean answers, cut the island
   * about as little as possible. Plain water is a coastline of six and so comes
   * last among clean options, which is right — it wins at sea, where it is the
   * ONLY clean option, and a beach there would be a sandbank from nowhere.
   *
   * Cost last still decides between equals, and still keeps a pathological
   * island — an edited save, a shape from before this rule — degrading gently
   * rather than throwing.
   */
  let best: TileLook = { kind: 'water', turns: 0 }
  let bestKey: [number, number, number] = [
    clean(ALL_WATER, 0, types) ? 0 : 1,
    coastLength(ALL_WATER),
    mismatch(ALL_WATER, 0, drawn),
  ]

  for (const variant of COAST_VARIANTS) {
    const edges = COAST_EDGES[variant]
    for (let turns = 0; turns < 6; turns++) {
      const k: [number, number, number] = [
        clean(edges, turns, types) ? 0 : 1,
        coastLength(edges),
        mismatch(edges, turns, drawn),
      ]
      if (k[0] < bestKey[0]
        || (k[0] === bestKey[0] && k[1] < bestKey[1])
        || (k[0] === bestKey[0] && k[1] === bestKey[1] && k[2] < bestKey[2])) {
        bestKey = k
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
      const next = bestLook(typesAround(island, a), drawnAround(island, a, looks))
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
 * What the six neighbours of `a` present toward it, on the island as drawn.
 *
 * Shared by the sweep and by the placement rules below, so a socket is judged
 * against exactly what the renderer will put beside it — not against an
 * approximation that could disagree.
 */
/**
 * What the six neighbours present as DRAWN, for the cost tie-break only.
 *
 * Cleanliness is decided on types (see `typesAround`) because asking it of the
 * drawing is circular. But among orientations that are equally clean and equally
 * short, the old cost table is still the best judge of which sits most happily
 * beside what its neighbours actually became — and it is what keeps a shape the
 * child CANNOT build, but an edited save might contain, degrading gently instead
 * of putting a green rim against the next pond tile's open water.
 */
function drawnAround(island: Island, a: Axial, looks: Map<string, TileLook>): EdgeKind[] {
  return neighbours(a).map((n, k) => {
    const type = tileAt(island, n)
    // Off the edge of the island is open sea, and always will be.
    if (type === undefined) return 'water' as EdgeKind
    if (type === 'grass') return 'land' as EdgeKind
    // Our edge k meets their edge k + 3: hexes join head-on.
    return presentedBy(looks.get(key(n)) as TileLook)[(k + 3) % 6] as EdgeKind
  })
}

/**
 * What the six neighbours of `a` present, judged from TYPES alone.
 *
 * Deliberately not `around`, which reads how neighbours are DRAWN. Drawability
 * has to be decided without reference to the drawing, or the question is
 * circular: whether this tile can be drawn cleanly would depend on looks that
 * were themselves chosen by asking the same question next door.
 *
 * Her fields present land; everything else — her water, and the open sea beyond
 * the island — presents water. Which is exactly the basis the nineteen drawable
 * neighbourhoods were enumerated on.
 */
const typesAround = (island: Island, a: Axial): EdgeKind[] =>
  neighbours(a).map(n => (tileAt(island, n) === 'grass' ? 'land' : 'water') as EdgeKind)

/** The same, over any tile lookup — so a hypothetical placement needs no copy. */
const typesAroundVia = (at: (n: Axial) => TileType | undefined, a: Axial): EdgeKind[] =>
  neighbours(a).map(n => (at(n) === 'grass' ? 'land' : 'water') as EdgeKind)

/**
 * Would putting `t` at `a` leave every coastline it touches drawable?
 *
 * SYMMETRIC, and that is the correction that made the invariant actually hold.
 * Guarding only water placement is not enough: dropping GRASS beside an existing
 * pond adds a green edge to a tile that was already drawn, and a pond that was
 * fine with three fields around it has no orientation at four. Tested by building
 * islands rather than constructing them, which is how that showed up — the
 * water-only guard passed every unit test and still produced "shows sand at edge
 * 3 against land" on a played island.
 *
 * So a placement is judged by its whole effect: the new tile and each of its six
 * neighbours must all still be drawable afterwards.
 */
export function allows(island: Island, a: Axial, t: TileType): boolean {
  /*
   * The candidate is applied as an OVERRIDE rather than by copying the map.
   *
   * `buildableSockets` asks this of every socket, and every socket asks it of
   * seven cells, so copying the whole island each time made the cost quadratic
   * in island size — enough to push the played-island test past a five-second
   * timeout on a loaded machine, and enough to matter on the tablet, since the
   * socket outlines are re-synced whenever the island changes.
   */
  const ka = key(a)
  const at = (n: Axial): TileType | undefined =>
    (key(n) === ka ? t : tileAt(island, n))
  for (const c of [a, ...neighbours(a)]) {
    if (at(c) !== 'water') continue
    if (!drawableAsWater(typesAroundVia(at, c))) return false
  }
  return true
}

/**
 * May a water tile go here at all?
 *
 * The guard that makes the whole design hold: water only where the water cell
 * can carry the entire beach itself, so her fields are never cut about. See
 * `drawableAsWater` for the enumeration and for what it costs.
 */
export const canBeWater = (island: Island, a: Axial): boolean =>
  allows(island, a, 'water')

/** ...and may a field? Grass can break a pond it is placed next to. */
export const canBeGrass = (island: Island, a: Axial): boolean =>
  allows(island, a, 'grass')

/**
 * The sockets she may actually build on.
 *
 * A few sockets admit NEITHER kind: four fields round them rules water out, and a
 * pond beside them that already has its three fields rules grass out too. There
 * is nothing that can go there, so nothing should invite her to try — a glowing
 * outline that cannot be filled is a promise the game breaks.
 *
 * This is the last piece of the invariant, and the one the played-island test
 * caught. Guarding the two kinds was not enough on its own: where both were
 * refused the code fell back to grass, and that fallback is precisely the "beach
 * against a full land tile" being ruled out.
 */
export const buildableSockets = (island: Island, open: readonly Axial[]): Axial[] =>
  open.filter(a => allows(island, a, 'grass') || allows(island, a, 'water'))

/**
 * Must this socket be water whatever she picked?
 *
 * Joe: *"force a water tile if it is placed adjacent to two other water tiles
 * only... specifically if 2 water and no land neighbours. one water and one land
 * should continue the coastline."*
 *
 * So it takes two or more of her OWN water tiles and none of her fields. Open sea
 * is not counted toward the two — every socket on the fringe touches sea, and
 * counting it would turn the whole rim into water. A socket always touches
 * something she owns, so "no land neighbours" means every owned neighbour is
 * water, and dropping grass into that gap is what leaves a green plug in the
 * middle of a channel.
 */
export function mustBeWater(island: Island, a: Axial): boolean {
  let water = 0
  for (const n of neighbours(a)) {
    const type = tileAt(island, n)
    if (type === 'grass') return false
    if (type === 'water') water++
  }
  return water >= 2
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
