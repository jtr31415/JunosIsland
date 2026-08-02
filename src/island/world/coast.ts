/**
 * Where the land meets the sea.
 *
 * Grass used to stop dead at the island's edge and drop into open water as a
 * green cliff. Every KayKit reference render puts a COAST tile there instead —
 * sand on the land side, sloping down into the shallows — and that sandy rim
 * is most of what makes the island read as an island rather than a piece of
 * lawn floating in a swimming pool.
 *
 * The rule: a WATER tile that meets their fields is drawn as a coast, turned so
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
import { tileAt, sockets } from './grid'
import type { Island, TileType } from './grid'
import { isLand } from './grid'

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
 * where it meets their fields, and that is the side that needs a beach.
 *
 * THE COAST BELONGS TO THE WATER, not to the land. Two reasons, both Joe's
 * and both right:
 *
 *   - A tile they already own must not be re-cut behind them. Digging a pond
 *     used to reach into the neighbouring field and carve a third of it away
 *     into sand and sea, changing land they had already paid for.
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
    if (!isLand(tileAt(island, n))) mask |= 1 << k
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
 * wall rising out of the sea (4) cheaper than a sandy lip against their fields
 * (10) — so on a jagged coast the scorer would happily shove land into the
 * water to keep the grass edges perfect. Fable's review flagged it as a
 * consequence and I recorded it as a known trade; Joe then saw one in a pond
 * and it is plainly a bug, not a trade.
 *
 * In badness order: water against their grass is a cliff and unforgivable; land
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
 * Is this orientation CLEAN — no beach against their fields, no green wall at sea?
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
    if (theirs === 'land' && mine !== 'land') return false   // beach into a field
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
 * entire beach and the field beside it stays a plain, flat hex — so land the
 * child has already paid for is never re-cut behind them, and no saved per-tile
 * look or third tile type is needed. The cost is that an enclosed pond is not
 * constructible: water grows as coastline, never as a hole in their fields.
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
 * are the edges facing their fields: green meeting sand a tenth of a unit lower,
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
 * order, which would make the island depend on the sequence they built it in.
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
    if (isLand(type)) return 'land' as EdgeKind
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
 * Their fields present land; everything else — their water, and the open sea
 * beyond the island — presents water. Which is exactly the basis the nineteen
 * drawable neighbourhoods were enumerated on.
 */
const typesAround = (island: Island, a: Axial): EdgeKind[] =>
  neighbours(a).map(n => (isLand(tileAt(island, n)) ? 'land' : 'water') as EdgeKind)

/** The same, over any tile lookup — so a hypothetical placement needs no copy. */
const typesAroundVia = (at: (n: Axial) => TileType | undefined, a: Axial): EdgeKind[] =>
  neighbours(a).map(n => (isLand(at(n)) ? 'land' : 'water') as EdgeKind)

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
  /*
   * Joe's rock rule, both ways round: *"they can be placed anywhere that does
   * not neighbour water and water cannot be placed next to a mountain tile."*
   *
   * Only the NEW tile's own six edges can be newly created, so checking `a`
   * against its neighbours is exhaustive — a rock two hexes away cannot gain a
   * water neighbour from a placement here. That keeps this O(6) rather than
   * another sweep, which matters because `buildableSockets` asks it of every
   * socket every time the island changes.
   *
   * This rule is also what keeps rock out of the coastline entirely: no rock is
   * ever beside water, so no water cell ever sees a rock edge, so the nineteen
   * drawable neighbourhoods stay exactly as enumerated.
   */
  const ta = at(a)
  for (const n of neighbours(a)) {
    const tn = at(n)
    if (ta === 'rock' && tn === 'water') return false
    if (ta === 'water' && tn === 'rock') return false
  }
  for (const c of [a, ...neighbours(a)]) {
    if (at(c) !== 'water') continue
    if (!drawableAsWater(typesAroundVia(at, c))) return false
  }
  return true
}

/** May a rock hex go here? Only where nothing of theirs beside it is water. */
export const canBeRock = (island: Island, a: Axial): boolean =>
  allows(island, a, 'rock')

/**
 * May a water tile go here at all?
 *
 * The guard that makes the whole design hold: water only where the water cell
 * can carry the entire beach itself, so their fields are never cut about. See
 * `drawableAsWater` for the enumeration and for what it costs.
 */
export const canBeWater = (island: Island, a: Axial): boolean =>
  allows(island, a, 'water')

/** ...and may a field? Grass can break a pond it is placed next to. */
export const canBeGrass = (island: Island, a: Axial): boolean =>
  allows(island, a, 'grass')

/**
 * The sockets the child may actually build on.
 *
 * A few sockets admit NEITHER kind: four fields round them rules water out, and a
 * pond beside them that already has its three fields rules grass out too. There
 * is nothing that can go there, so nothing should invite them to try — a glowing
 * outline that cannot be filled is a promise the game breaks.
 *
 * This is the last piece of the invariant, and the one the played-island test
 * caught. Guarding the two kinds was not enough on its own: where both were
 * refused the code fell back to grass, and that fallback is precisely the "beach
 * against a full land tile" being ruled out.
 *
 * Deliberately NOT where the moat floor lives, though it was built here first and
 * then measured out again. A wall here — refuse any socket whose tile would leave
 * their fields sealed in — is worse on both counts. It is dearer, because it has
 * to look past the socket at the island beyond it and this runs every time the
 * island changes; and at the sharp end it is simply WRONG, because the socket it
 * ends up refusing is their last remaining way out. It turns "walled in after one
 * more field" into "walled in now", and takes the tile off them as well.
 *
 * The floor in `flow.tileTypeFor` acts early enough that the question almost
 * never arises. Measured: with the floor at three, four adversarial strategies
 * over some four thousand played islands never reached a state where a wall here
 * would have had anything left to do.
 *
 * ALMOST. A Fable review then found one by search, and the refuting placement is
 * exactly the kind a wall would have caught. So the honest statement is that this
 * was removed because the wall AS BUILT — refuse the socket wholesale, wherever
 * the tile would leave them sealed — is harmful, not because nothing could ever
 * need it.
 *
 * Most of what it was for now lives in `landedType`, stated the other way round:
 * it refuses a KIND, so the socket keeps glowing and only the button that would
 * end their island is missing. That is strictly better and it is where the work
 * belongs.
 *
 * BUT NOT ALL OF IT, and this is the second thing measurement corrected. There is
 * one shape where refusing a kind is not available: a socket where grass is
 * INFEASIBLE — a pond beside it with no land edge left to give — and water would
 * cut the last outward corridor. Nothing can go there that the island survives, so
 * the socket does not glow. It is the narrowest form of the old wall and it is
 * nothing like the old one at the sharp end, because `hasOutwardCorridor` proves
 * that the corridor's own mouth is a socket, admits grass unconditionally, and is
 * therefore still glowing right beside it. The old wall could refuse the child's
 * last way out; this one cannot, and that is a proof rather than a measurement.
 *
 * `always leaves her a socket to tap` is what holds that in the suite. See
 * `LAND_FLOOR` for why three and not two.
 */
export const buildableSockets = (island: Island, open: readonly Axial[]): Axial[] =>
  open.filter(a => mayBuildAt(island, a))

/**
 * Must this socket be water whatever the child picked?
 *
 * Joe: *"force a water tile if it is placed adjacent to two other water tiles
 * only... specifically if 2 water and no land neighbours. one water and one land
 * should continue the coastline."*
 *
 * So it takes two or more of their OWN water tiles and none of their fields. Open
 * sea is not counted toward the two — every socket on the fringe touches sea, and
 * counting it would turn the whole rim into water. A socket always touches
 * something they own, so "no land neighbours" means every owned neighbour is
 * water, and dropping grass into that gap is what leaves a green plug in the
 * middle of a channel.
 */
export function mustBeWater(island: Island, a: Axial): boolean {
  let water = 0
  for (const n of neighbours(a)) {
    const type = tileAt(island, n)
    // Rock counts as their land here too — and a rock neighbour makes water
    // illegal outright, so forcing it would be a contradiction.
    if (isLand(type)) return false
    if (type === 'water') water++
  }
  return water >= 2
}

/* ------------------------------------------------- the moat, and the floor */

/**
 * MOATED: every way out of their fields is water, and permanently so.
 *
 * Joe, from playtesting: *"when there are only 2 land connections without water
 * neighbours, force a land tile so kids cant snooker their islands by surrounding
 * it with just water."*
 *
 * The state he means is reachable in six taps from a new game. Ring the home hex
 * with ponds and every socket left touches a ring tile that already shows green
 * on its inward edge; a field outside would give that tile a second green edge on
 * the far side, and a split arc is one of the forty-five neighbourhoods no model
 * draws. So their island is finished at one hex.
 *
 * It is not a hard stop — grow the lake one ring further out and a tile with no
 * green edge yet appears, so land can restart ACROSS the water. That is the
 * honest description of the fault and it is still worth fixing: a six-year-old
 * whose island has been walled off from itself, with no undo, has not been given
 * a choice, they have been given a wall.
 *
 * What follows is the floor that stops it. Two things it deliberately is not:
 *
 *   - Not the local mirror of `mustBeWater`. That rule reads six neighbours;
 *     being moated is a fact about the whole island, and no six-hex window can
 *     see it. The literal mirror — two or more fields and no water, so grass —
 *     never fires while a ring is being EXTENDED, because every extension socket
 *     touches the previous ring tile, and it would ban digging a bay against two
 *     fields, which is exactly the shape variant C exists to draw.
 *   - Not a rule that outranks feasibility. `mustBeWater` had precisely that bug
 *     — it short-circuited ahead of the drawability check and forced water into a
 *     shape no model draws — so everything here asks `allows` first.
 */

/**
 * How few ways out of their fields water may leave them with.
 *
 * THREE, AND JOE ASKED FOR TWO. That is a deliberate departure and here is the
 * evidence for it, because a number nobody can argue with is a number nobody can
 * correct.
 *
 * Two is the number of ways out he wants them never to go below, and the floor is
 * the only thing holding it: water is turned back at the line, so under a child
 * who only ever asks for water the count settles at exactly the line and stays
 * there. That leaves no headroom, and headroom is needed, because a FIELD can
 * cost them a way out too — placed where its own empty neighbours all touch water,
 * it consumes one and makes none. Water is capped; that erosion is not.
 *
 * At a floor of two the played-island test walls them in: seed 160 of
 * `an island built only through the placement rules`, thirty taps, hugging the
 * coast and asking for water every time. The count sits at two, a forced field
 * takes it to one, and the next one has nowhere to go. Set this back to 2 and
 * that test fails; it is the reason the seed range there runs as far as it does.
 *
 * So three is two with the one tile of headroom that makes two hold. If Joe wants
 * the line drawn elsewhere it is this constant and nothing else — but moving it
 * back to two brings seed 160 back with it, which is why the test plays a
 * strategy rather than trusting the number.
 *
 * AND THREE IS NOT ENOUGH EITHER, which is the thing to know before reaching for
 * four. This comment used to say "at three, nothing has been found that breaks
 * it"; a Fable review then broke it, in sixty-four taps through the real tap path,
 * and no value of this constant closes the gaps it used — a field erodes the count
 * and is never inspected, `mustBeLand` yields where grass cannot be drawn, and once
 * the count is nought the island lives on wet sockets this number does not model.
 * The guarantee is `hasOutwardCorridor`, which counts nothing.
 *
 * What the floor is FOR, then, and it is still worth its keep: it is cheap, it
 * fires early, and it holds the island in a shape where the dear guards below have
 * almost nothing to do. Measured after they landed — at wetness up to 0.65 neither
 * of them fires at all. Do not raise this to paper over a sealing bug; a sealing
 * bug means the corridor has a hole in it, and a bigger margin will hide it.
 */
export const LAND_FLOOR = 3

/** Their own tiles that are dry land — fields and rock alike — as coordinates. */
function fields(island: Island): Axial[] {
  const out: Axial[] = []
  for (const [k, type] of island.tiles) {
    if (!isLand(type)) continue
    const parts = k.split(',').map(Number)
    out.push({ q: parts[0] as number, r: parts[1] as number })
  }
  return out
}

/**
 * The ways out of their fields: sockets touching their land and touching no water.
 *
 * Joe's phrase is *"land connections without water neighbours"*, and both halves
 * are load-bearing:
 *
 *   - A LAND CONNECTION touches one of their FIELDS. That is what makes this a
 *     measure of the fault and not of something else. Counting every socket that
 *     admits grass would count the far shore of their lake — which is satisfied by
 *     exactly the situation being prevented, land restarting across the water,
 *     while their island itself stays walled in.
 *   - WITHOUT WATER NEIGHBOURS turns it from a snapshot into a guarantee. With no
 *     water anywhere in its own neighbourhood there is no coastline for a field to
 *     break, so `allows(island, s, 'grass')` is unconditionally true and
 *     `mustBeWater(island, s)` unconditionally false. Grass goes there today, and
 *     still goes there after any number of tiles are placed elsewhere.
 *
 * That second half is why the floor counts these rather than the wider set of
 * sockets that merely admit grass right now. The wider set is a snapshot: a
 * socket is in it because some pond nearby currently has room for one more green
 * edge, and a tile placed two hexes away can quietly take it back. A floor built
 * on it can be walked to nothing by placements that each looked safe when they
 * were made — which is not a theory, it is seed 160 of the played-island test,
 * where a floor guarding only water was still moated after thirty-two tiles.
 */
const dryLandSocketsOf = (island: Island): Axial[] => {
  const seen = new Set<string>()
  const out: Axial[] = []
  for (const g of fields(island)) {
    for (const s of neighbours(g)) {
      const ks = key(s)
      if (seen.has(ks)) continue
      seen.add(ks)
      if (tileAt(island, s) !== undefined) continue
      if (neighbours(s).some(n => tileAt(island, n) === 'water')) continue
      out.push(s)
    }
  }
  return out
}

/**
 * ...cached per island, because the answer is asked of every socket at once.
 *
 * An `Island` is immutable and a new object per `place`, so the entry can never
 * go stale, and a WeakMap lets a superseded island be collected with it. Without
 * this, `buildableSockets` would walk their whole map once per socket — the same
 * quadratic that `allows` was fixed to avoid, arrived at from the other side.
 */
const dryCache = new WeakMap<Island, Axial[]>()

export function dryLandSockets(island: Island): readonly Axial[] {
  const had = dryCache.get(island)
  if (had) return had
  const found = dryLandSocketsOf(island)
  dryCache.set(island, found)
  return found
}

/**
 * How many ways out of their fields placing `t` at `a` would leave.
 *
 * Worked out from the ones they have rather than by re-deriving them over a copy of
 * the island, which is what keeps this affordable enough to ask of every socket:
 *
 *   - The socket built on stops being a socket, so it stops being a way out.
 *   - WATER wets its neighbours, so any way out beside it stops being dry. It can
 *     never create one.
 *   - A FIELD wets nothing, so every existing way out survives; and its own empty
 *     neighbours become land connections, dry if no water is already beside them.
 *
 * Which gives the fact the whole design leans on: `dryAfter(a, 'grass')` is never
 * less than `dryAfter(a, 'water')`. A field is always at least as kind to their
 * island as a pond in the same place, so "is there a safe tile for this socket?"
 * has the same answer as "is grass safe here?", and nothing has to enumerate.
 */
export function dryAfter(island: Island, a: Axial, t: TileType): number {
  const ka = key(a)
  const known = new Set<string>()
  let count = 0
  for (const s of dryLandSockets(island)) {
    const ks = key(s)
    known.add(ks)
    if (ks === ka) continue
    if (t === 'water' && neighbours(s).some(n => key(n) === ka)) continue
    count++
  }
  // Rock creates ways out exactly as a field does: it is dry, and it cannot
  // have water beside it, so every empty neighbour it gains is dry too.
  if (!isLand(t)) return count
  for (const s of neighbours(a)) {
    const ks = key(s)
    if (known.has(ks) || tileAt(island, s) !== undefined) continue
    known.add(ks)
    // `a` itself is the new field, so it is not one of the waters to fear.
    if (neighbours(s).some(n => key(n) !== ka && tileAt(island, n) === 'water')) continue
    count++
  }
  return count
}

/**
 * Must this socket be a field whatever the child picked?
 *
 * The floor, stated as a look-ahead over the placement rather than as a count of
 * the island as it stands. It has to be: a single pond can take three ways out at
 * once, so the number does not fall THROUGH two on its way to nothing, it steps
 * over it. Asking "would this tile take them below the line" catches that; asking
 * "are they below the line already" does not.
 *
 * It is not a veto on water. Water out at sea, or anywhere that touches none of
 * their ways out, costs nothing and is never turned back — they can dig as much
 * lake as they like, and bays against two or three fields are untouched while the
 * island has room. It is only water spending their last way out that becomes land.
 *
 * With no fields at all there is nothing to moat and the floor says nothing. That
 * cannot arise in play — the island starts with Fred's rock and land is never
 * taken away — but an edited save or a test fixture can be all water, and a rule
 * that answered "yes, forced" for every socket of one would leave them unable to
 * build anywhere at all.
 */
export function mustBeLand(island: Island, a: Axial): boolean {
  // Feasibility first. A forced field the coastline cannot draw is the fault
  // this whole file exists to prevent, and forcing is never worth causing it.
  if (!allows(island, a, 'grass')) return false
  if (!hasField(island)) return false
  return dryAfter(island, a, 'water') < LAND_FLOOR
}

/**
 * Has the child any fields at all? Asked instead of `fields(island).length === 0`
 * because this runs inside the witness scan below, once per candidate socket,
 * and building a whole array to look at its length is the cheap end of the
 * quadratic the rest of this file is careful to avoid.
 *
 * Cached because the scan asks it of a HYPOTHETICAL island whose tile map is an
 * overlay, where the iteration is a generator and correspondingly dear.
 */
const fieldCache = new WeakMap<Island, boolean>()

function hasField(island: Island): boolean {
  const had = fieldCache.get(island)
  if (had !== undefined) return had
  let found = false
  for (const type of island.tiles.values()) if (type === 'grass') { found = true; break }
  fieldCache.set(island, found)
  return found
}

/**
 * Their sockets, cached per island.
 *
 * `sockets` walks their whole map; the guards below ask for the list several times
 * per tap and once per candidate placement. Same reasoning as `dryCache`, and the
 * same safety: an `Island` is immutable and a new object per placement.
 */
const socketCache = new WeakMap<Island, Axial[]>()

function socketsOf(island: Island): readonly Axial[] {
  const had = socketCache.get(island)
  if (had) return had
  const found = sockets(island)
  socketCache.set(island, found)
  return found
}

/* -------------------------------------- what lands, and the last-resort wall */

const KINDS: readonly TileType[] = ['grass', 'water']

/**
 * What the three placement rules make of a choice, before the backstop.
 *
 * This is the ordering that `flow.tileTypeFor` applies and `flow.tileOffer`
 * advertises, and it lives HERE rather than in flow.ts for one reason: the
 * backstop below has to ask "what would land at that socket over there?" of a
 * hypothetical island, and a rule the flow owned could not be asked. Keeping the
 * ordering beside the rules it orders also means the offer and the outcome are
 * derived from one function and so cannot drift apart — see `tileOffer`.
 *
 * ORDER MATTERS, and the floor outranks the plug. They collide at exactly one
 * place and it is the place that matters: the socket that CLOSES a ring, which
 * has two of their ponds round it and none of their fields, so `mustBeWater`
 * fires — and closing the ring is the whole fault. Ordered the other way the floor
 * would be silent for the one tile it exists to refuse. The price is a green plug
 * in a channel, which is a wart; the alternative is a wall round their island.
 */
export function settledType(island: Island, a: Axial, chosen: TileType): TileType {
  if (mustBeLand(island, a)) return 'grass'
  if (mustBeWater(island, a) && canBeWater(island, a)) return 'water'
  if (chosen === 'water' && !canBeWater(island, a)) return 'grass'
  /*
   * And the mirror: grass that would break a pond it is placed beside becomes
   * water instead. Dropping a field at four-fields-round a pond is the case no
   * model can draw, and refusing to build there at all would leave a hole in
   * their island they could never fill.
   */
  if (chosen === 'grass' && !canBeGrass(island, a) && canBeWater(island, a)) return 'water'
  return chosen
}

/**
 * A GROWABLE WITNESS: somewhere their fields could actually grow next.
 *
 * Four conditions, and every one of them is load-bearing:
 *
 *   - It is an empty socket BESIDE ONE OF THEIR FIELDS. Not merely a socket that
 *     admits grass — the far shore of their lake admits grass, and land restarting
 *     across the water is precisely the situation "walled in" describes. This is
 *     a measure of whether THEIR ISLAND can grow.
 *   - It has an EMPTY NEIGHBOUR, so filling it leaves somewhere to go afterwards.
 *     Without this clause a hex enclosed on all six sides counts as a way to grow,
 *     and it is not: they may fill it once and are then exactly as stuck, one tile
 *     richer. That hollow witness is the endgame of the pinned counterexample.
 *   - Grass is WHAT WOULD LAND there, asked of `settledType` rather than of
 *     `canBeGrass`. Those are different questions: `mustBeWater` can override a
 *     socket `canBeGrass` was perfectly happy with, and a socket that answers
 *     "water" to every choice is not a place their fields can grow. This is the
 *     gap that made the dry-socket count the wrong witness.
 *   - It is BUILDABLE, so it glows and they can tap it. Which follows from
 *     `canBeGrass` here: `settledType` only answers 'grass' at a socket that
 *     refuses grass when it refuses water too, and that socket does not glow.
 *
 * Written as a cascade rather than a conjunction because the order is a cost
 * order. The adjacency tests are six map lookups each, `canBeGrass` is seven
 * cells, and `mustBeLand` walks their fields — so the expensive question is asked
 * last and, in the overwhelming majority of sockets, never.
 *
 * EVEN SO IT IS NOT SUFFICIENT ON ITS OWN, and the clause above is why: it buys one
 * ply, and the same argument then applies to the hex it leaves them. `landedType`
 * says what it is really for.
 */
export function isGrowableWitness(island: Island, s: Axial): boolean {
  if (tileAt(island, s) !== undefined) return false
  if (!neighbours(s).some(n => tileAt(island, n) === 'grass')) return false
  if (!neighbours(s).some(n => tileAt(island, n) === undefined)) return false
  if (!canBeGrass(island, s)) return false
  // Grass is allowed. It lands unless the plug rule takes the socket for water...
  if (!mustBeWater(island, s)) return true
  if (!canBeWater(island, s)) return true
  // ...and even then the floor outranks the plug, so ask it before giving up.
  return mustBeLand(island, s)
}

/**
 * ...anywhere on the island. Cached per island for the same reason `dryCache` is:
 * an `Island` is immutable and a new object per placement, so an entry can never
 * go stale, and the answer is wanted several times per tap.
 */
const growCache = new WeakMap<Island, boolean>()

export function canStillGrow(island: Island): boolean {
  const had = growCache.get(island)
  if (had !== undefined) return had
  let found = false
  for (const s of socketsOf(island)) {
    if (isGrowableWitness(island, s)) { found = true; break }
  }
  growCache.set(island, found)
  return found
}

/**
 * The island as it would be with one more tile on it — as a VIEW, never a copy.
 *
 * `allows` was made non-copying because the socket outlines re-sync whenever the
 * island changes and copying the map per candidate made the cost quadratic in
 * island size. The backstop asks a question of a hypothetical island rather than
 * of a hypothetical cell, so it cannot use the same override trick; it gets an
 * overlay instead, which is O(1) to build and reads through to the real map.
 *
 * Being one object per hypothesis also means the `WeakMap` caches keyed on
 * `Island` work exactly as intended: every candidate socket tested against the
 * same hypothesis shares one `dryLandSockets` solve.
 *
 * THE ONE CAST IN THIS FILE, and why it is here rather than avoidable. Every
 * member of `ReadonlyMap` is implemented, correctly, over the base map — but the
 * lib in use types `keys`/`values`/`entries` as `MapIterator`, which carries the
 * ES2025 iterator helpers (`map`, `filter`, `take`, ...) that a generator does not
 * have and that nothing here calls. Satisfying it honestly would mean either
 * copying the map, which is the cost this exists to avoid, or `Iterator.from`,
 * which is newer than the tablet. So the shim is cast, and `the hypothetical
 * island reads exactly like a real one` in the coast tests holds it to `place`'s
 * behaviour on every member — including full iteration — so the cast cannot be
 * quietly hiding a wrong answer.
 */
export function withTile(island: Island, a: Axial, t: TileType): Island {
  const ka = key(a)
  const base = island.tiles
  const adds = !base.has(ka)
  const entries = function* (): IterableIterator<[string, TileType]> {
    yield* base.entries()
    if (adds) yield [ka, t]
  }
  const tiles = {
    size: base.size + (adds ? 1 : 0),
    /*
     * `adds` guards the override because `place` is a NO-OP on an occupied coord —
     * nothing a child owns is overwritten — and a view that quietly disagreed with
     * that would be a hypothetical island that cannot happen. Every caller here
     * passes a socket, so it is unreachable rather than harmless; the pinning test
     * found it anyway, which is the argument for the pinning test.
     */
    get: (k: string) => (adds && k === ka ? t : base.get(k)),
    has: (k: string) => k === ka || base.has(k),
    keys: function* (): IterableIterator<string> {
      yield* base.keys()
      if (adds) yield ka
    },
    values: function* (): IterableIterator<TileType> {
      yield* base.values()
      if (adds) yield t
    },
    entries,
    [Symbol.iterator]: entries,
    forEach: (
      fn: (v: TileType, k: string, m: ReadonlyMap<string, TileType>) => void,
      thisArg?: unknown,
    ): void => {
      for (const [k, v] of entries()) fn.call(thisArg, v, k, frozen)
    },
  }
  const frozen = tiles as unknown as ReadonlyMap<string, TileType>
  return { tiles: frozen }
}

/**
 * Would putting `t` at `a` leave them anywhere at all to grow?
 *
 * Deliberately NOT `canStillGrow(withTile(...))`, which would re-derive the
 * socket list of the hypothesis. The sockets of the island afterwards are the
 * sockets of the island now, less the one built on, plus the empty neighbours of
 * it — so the scan is the same size as the one `buildableSockets` already does
 * per refresh, and no larger.
 *
 * The new neighbours are tried FIRST because they are where the answer usually
 * is: a field placed at `a` gives every empty hex beside it a green neighbour and
 * clears `mustBeWater` for all of them at a stroke, so the loop almost always
 * exits on its first or second candidate.
 */
function growsAfter(island: Island, a: Axial, t: TileType): boolean {
  const after = withTile(island, a, t)
  const ka = key(a)
  const beside = new Set<string>()
  for (const s of neighbours(a)) {
    if (tileAt(island, s) !== undefined) continue
    beside.add(key(s))
    if (isGrowableWitness(after, s)) return true
  }
  for (const s of socketsOf(island)) {
    const ks = key(s)
    if (ks === ka || beside.has(ks)) continue
    if (isGrowableWitness(after, s)) return true
  }
  return false
}

/* ------------------------------------------------------ the outward corridor */

/**
 * DRY-EMPTY: an unbuilt hex with no pond of theirs anywhere in its own six.
 *
 * The reason this exact set matters is the reason `dryLandSockets` counts what it
 * counts, one step further on: with no water in its neighbourhood there is no
 * coastline for a field to break, so `allows(island, c, 'grass')` is
 * unconditionally true and `mustBeWater(island, c)` unconditionally false. Grass
 * goes there today, and — the part that makes it a guarantee rather than a
 * snapshot — still goes there after any number of tiles are placed elsewhere,
 * because nothing but a pond beside it can ever take that away.
 */
const dryEmpty = (island: Island, a: Axial): boolean =>
  tileAt(island, a) === undefined
  && !neighbours(a).some(n => tileAt(island, n) === 'water')

/** Cube radius, which is how far out a hex is however the island is placed. */
const outFrom = (a: Axial): number =>
  Math.max(Math.abs(a.q), Math.abs(a.r), Math.abs(a.q + a.r))

/**
 * THE OUTWARD CORRIDOR, and why it is the invariant that actually holds.
 *
 * The witness backstop above is one ply deep, and one ply is provably not enough:
 * it can be walked down to a single witness that is a dead end, and then every
 * kind at that socket ends the island and there is nothing left to refuse. The
 * pinned counterexample does exactly that. Adding plies only moves the cliff.
 *
 * So this asks a topological question instead, which does not regress: is there a
 * DRY-EMPTY hex beside one of their fields, joined to the open sea by a chain of
 * dry-empty hexes? Call that the corridor. If it exists they can grow outward for
 * ever, and here is the induction, which is the whole argument for this file:
 *
 *   - GRASS ANYWHERE PRESERVES IT. A field introduces no water, so no hex gains a
 *     water neighbour and the dry-empty set only ever loses the hex built on. If
 *     that hex was on the corridor, the next hex along is dry-empty and is now
 *     beside a field — so the tail of the corridor is a corridor. If it was not,
 *     the corridor is untouched.
 *   - WATER CAN CUT IT, which is what there is to guard. A pond wets its six, so
 *     it can take the mouth of the corridor or sever it midway.
 *   - THE MOUTH IS ALWAYS BUILDABLE. It is dry-empty, so grass is feasible there
 *     unconditionally and lands there whatever they picked; and grass preserves the
 *     corridor, so nothing below ever refuses that socket. This is the answer to
 *     the objection that killed the old wall in `buildableSockets` — that one
 *     refused their last way out. This cannot: the corridor IS a way out, and it
 *     proves one is still glowing.
 *
 * Fred's rock satisfies it — six dry sockets and open sea in every direction — so
 * it holds from the first tap, and everything below only has to keep it.
 *
 * "OPEN SEA" is reached at cube radius three beyond their furthest tile. Every
 * hex out there has all six of its neighbours further out than anything they
 * own — including a candidate placement, which is a socket and so at most one
 * ring past their edge — so it has no owned neighbour, so it is dry-empty, and
 * so is everything past it. Reaching that radius therefore IS reaching infinity,
 * and it bounds the flood fill by their island rather than by the plane.
 *
 * ASKED OF A HYPOTHETICAL WITHOUT AN OVERLAY, which is what keeps it affordable.
 * A pond at `a` changes the dry-empty set in exactly one way — it deletes `a` and
 * every empty hex beside it, and touches nothing else, because dryness is a
 * property of a hex's own six and only water can spoil it. So a candidate is a
 * BLOCKED SET of at most seven keys over the island's own dry map, not an island of
 * its own; and because no candidate introduces grass, no candidate can create a
 * mouth either. Which means the expensive part — deciding which hexes are dry at
 * all — is computed once per island and shared by every socket asked about it.
 */
interface DryMap {
  /** Dryness, memoised as the fills wander rather than enumerated up front. */
  readonly known: Map<string, boolean>
  /** The radius at which reaching it means reaching the open sea. */
  readonly sea: number
  /** Dry-empty sockets beside one of their fields: where a corridor can begin. */
  readonly mouths: readonly Axial[]
  /**
   * ONE KNOWN WAY OUT, kept because it answers almost every question on its own.
   *
   * A pond blocks seven hexes at most. If none of them is on a route that already
   * reaches the sea, that route still reaches the sea — every hex on it is
   * untouched, and the mouth is still a mouth — so the answer is yes without
   * walking anything. Only a pond that lands ON the route needs a real fill.
   *
   * `undefined` means not yet looked for; `null` means looked for and there is
   * none.
   */
  route?: readonly string[] | null
}

const dryMapCache = new WeakMap<Island, DryMap>()

function dryMap(island: Island): DryMap {
  const had = dryMapCache.get(island)
  if (had) return had
  let far = 0
  for (const k of island.tiles.keys()) {
    const parts = k.split(',').map(Number)
    far = Math.max(far, outFrom({ q: parts[0] as number, r: parts[1] as number }))
  }
  const mouths: Axial[] = []
  for (const s of socketsOf(island)) {
    if (!dryEmpty(island, s)) continue
    if (!neighbours(s).some(n => tileAt(island, n) === 'grass')) continue
    mouths.push(s)
  }
  const made: DryMap = { known: new Map(), sea: far + 3, mouths }
  dryMapCache.set(island, made)
  return made
}

const isDry = (island: Island, d: DryMap, a: Axial, k: string): boolean => {
  const had = d.known.get(k)
  if (had !== undefined) return had
  const now = dryEmpty(island, a)
  d.known.set(k, now)
  return now
}

/**
 * A way from one of their fields out to the sea, with `blocked` held to be wet.
 *
 * `blocked` of `null` asks it of the island as it stands; a set asks it of the
 * island with one pond added. Same fill either way, which is what makes the two
 * answers impossible to get out of step with each other. Returns the hexes of a
 * route rather than a yes, so the yes can be re-used — see `DryMap.route`.
 */
function findRoute(
  island: Island, d: DryMap, blocked: Set<string> | null,
): readonly string[] | null {
  const from = new Map<string, string | null>()
  const stack: Axial[] = []
  for (const m of d.mouths) {
    const km = key(m)
    if (from.has(km) || blocked?.has(km)) continue
    if (!isDry(island, d, m, km)) continue
    from.set(km, null)
    stack.push(m)
  }
  while (stack.length > 0) {
    const a = stack.pop() as Axial
    const ka = key(a)
    if (outFrom(a) >= d.sea) {
      const route: string[] = []
      let step: string | null = ka
      while (step !== null) {
        route.push(step)
        step = from.get(step) ?? null
      }
      return route
    }
    for (const n of neighbours(a)) {
      const kn = key(n)
      if (from.has(kn) || blocked?.has(kn)) continue
      if (!isDry(island, d, n, kn)) continue
      from.set(kn, ka)
      stack.push(n)
    }
  }
  return null
}

function baseRoute(island: Island, d: DryMap): readonly string[] | null {
  if (d.route === undefined) d.route = findRoute(island, d, null)
  return d.route
}

export function hasOutwardCorridor(island: Island): boolean {
  return baseRoute(island, dryMap(island)) !== null
}

/**
 * Would putting `t` at `a` leave the corridor standing?
 *
 * Grass is answered without looking, from the induction above — it is not an
 * optimisation but the load-bearing half of the proof, and stating it here is what
 * makes `buildableSockets` cheap: a socket that admits grass can never be refused,
 * so the fill is only ever run for the few sockets that do not.
 *
 * And water is usually answered without a fill either, by the known route: a pond
 * wets seven hexes at most, and out at sea away from their coast it wets none of
 * the ones that matter. Only a pond dropped ON the route pays for a search, and
 * the route it finds is not kept — the island it belongs to is hypothetical and
 * will not exist unless the child taps.
 */
function corridorAfter(island: Island, a: Axial, t: TileType): boolean {
  if (t === 'grass') return true
  const d = dryMap(island)
  const blocked = new Set<string>([key(a)])
  for (const n of neighbours(a)) {
    if (tileAt(island, n) === undefined) blocked.add(key(n))
  }
  const known = baseRoute(island, d)
  if (known !== null && !known.some(k => blocked.has(k))) return true
  return findRoute(island, d, blocked) !== null
}

/**
 * Is this placement one the island survives? Both guards, each one conditional on
 * its own invariant holding NOW.
 *
 * That condition is not politeness, it is what stops a restored or hand-edited
 * save from locking them out. Neither of these is a rule about what a good island
 * looks like; each is a promise not to take away the last of something, and where
 * the last of it has already gone there is nothing to promise and the guard falls
 * silent rather than refusing everything.
 */
const keepsCorridor = (island: Island, a: Axial, t: TileType): boolean =>
  !hasOutwardCorridor(island) || corridorAfter(island, a, t)

const keepsAWitness = (island: Island, a: Axial, t: TileType): boolean =>
  !canStillGrow(island) || growsAfter(island, a, t)

/**
 * ONE GUARD OR THE OTHER, never both, and the reason is a small proof.
 *
 * A CORRIDOR IMPLIES A WITNESS. Its mouth is dry-empty, so `canBeGrass` there is
 * unconditionally true and `mustBeWater` unconditionally false, so grass is what
 * lands; it is beside one of their fields by definition; and the corridor runs on
 * past it, so it has an empty neighbour. That is every clause of
 * `isGrowableWitness`. So where the corridor stands after a placement, a witness
 * stands after it too, and asking the one-ply question as well would only ever
 * cost time and change no answer. `a corridor is always a witness` pins it.
 *
 * Which leaves the witness rule doing the job it is uniquely good for: an island
 * whose corridor has ALREADY gone. That cannot arise in play — the corridor holds
 * of Fred's rock and everything here keeps it — but a save edited by hand, or one
 * written before this rule existed, can arrive in that state, and there the
 * one-ply guard is all there is and is much better than nothing.
 *
 * It is also what keeps this affordable. `growsAfter` scans every socket against a
 * hypothetical island; the corridor fill walks a few hundred hexes of one map that
 * is computed once per island. Under normal play the dear one never runs.
 */
const survivable = (island: Island, a: Axial, t: TileType): boolean =>
  hasOutwardCorridor(island)
    ? corridorAfter(island, a, t)
    : keepsAWitness(island, a, t)

/**
 * Is there any kind at all this socket can take that keeps the corridor?
 *
 * THE CORRIDOR ONLY, and the asymmetry is deliberate rather than an oversight.
 * This is the one question in the file that can stop a socket glowing, so it may
 * only be asked of the invariant that comes with a proof that something else is
 * still glowing. `keepsAWitness` has no such proof — it is one ply deep, and the
 * last witness can be a dead end where every kind leaves zero. Refusing THAT
 * socket would keep `canStillGrow` true for ever and mean nothing by it: a way
 * out they are not allowed to take is not a way out. So the witness rule never
 * refuses a socket, only a kind, and this only ever refuses where grass is
 * infeasible AND water would cut the last corridor.
 *
 * WHICH IS WHY GRASS SHORT-CIRCUITS, and it is the same fact twice: a field admits
 * the socket AND a field cannot cut the corridor, so a socket that takes grass is
 * buildable with nothing further asked. That leaves the fill for the handful of
 * sockets that refuse grass outright, and is what keeps this within a whisker of
 * what the outlines cost before — it runs on every socket, every time the island
 * changes, which is the budget the whole file is written against.
 */
const buildableCache = new WeakMap<Island, Map<string, boolean>>()

export function mayBuildAt(island: Island, a: Axial): boolean {
  /*
   * Memoised per socket as well as per island, because `refresh()` re-syncs the
   * outlines from a dozen call sites and most of those hand it an island that has
   * not changed. The second sweep of an unchanged island is then free, which is
   * more than was true before this rule existed.
   */
  let seen = buildableCache.get(island)
  if (seen === undefined) { seen = new Map(); buildableCache.set(island, seen) }
  const ka = key(a)
  const had = seen.get(ka)
  if (had !== undefined) return had
  const now = allows(island, a, 'grass')
    || (allows(island, a, 'water') && keepsCorridor(island, a, 'water'))
  seen.set(ka, now)
  return now
}

/**
 * WHAT ACTUALLY LANDS: the three rules, and behind them the last-resort backstop.
 *
 * THE BACKSTOP: no placement may leave them unable to grow. Where the settled
 * answer would do that, the other kind is tried, and if THAT is feasible and safe
 * it lands instead. `survivable` is the question; `hasOutwardCorridor` is what it
 * mostly asks, and the induction that makes it a guarantee is written out there.
 *
 * WHAT IT REPLACED, since the history is the argument. The dry-connection floor
 * counts DRY sockets and was claimed to make walling-in impossible. A Fable review
 * falsified that with a sixty-four-tap counterexample through the real tap path,
 * ending with their fields sealed, and three gaps compounded that no value of
 * `LAND_FLOOR` closes:
 *
 *   - `mustBeLand` yields when grass is infeasible, so water was still offered at
 *     a socket where it spent the last ways out. The backstop does not care WHY
 *     water was the settled answer, only what the island looks like afterwards.
 *   - Grass erosion was unguarded. The floor only ever inspected water; a field on
 *     a dry socket whose empty neighbours all touch water consumes a way out and
 *     creates none. The backstop is symmetric in the kind.
 *   - Dry sockets were not the real witnesses. Once the count is nought the island
 *     survives on WET sockets where grass happens to remain drawable, a quantity
 *     the floor never modelled — and the endgame kill was a grass tile taking the
 *     last of those.
 *
 * AND THE PRESCRIBED FIX WAS NOT ENOUGH EITHER, which is the finding worth passing
 * on. "Refuse any placement leaving zero growable witnesses" is one ply deep, and
 * one ply can be walked down to a single witness that is a DEAD END — at that
 * socket every kind ends the island and there is nothing left to refuse. Replayed
 * against the witness rule alone, the counterexample reaches exactly that: at its
 * sixty-third tap the only witness left is a hex enclosed on all six sides, and at
 * the two taps before it grass is already INFEASIBLE at the socket being wetted,
 * so there is no other kind to fall back on. Adding plies only moves the cliff.
 * `isGrowableWitness` is therefore the FALLBACK here, not the guarantee — see
 * `survivable` for exactly when each is asked.
 *
 * Why this does not strand them, which is the objection that rightly killed an
 * earlier wall written into `buildableSockets`. That one refused the SOCKET, and
 * at the sharp end the socket it refused was their last way out — it turned "walled
 * in after one more field" into "walled in now" and took the tile off them too.
 * Here, almost always, only a KIND is refused at a socket they may still build on.
 * Water out at sea, away from their fields, cuts nothing and is never turned back.
 * Where the socket itself has to be refused — grass infeasible AND water cutting
 * the last corridor — `mayBuildAt` stops it glowing, and the corridor's own mouth
 * is provably still glowing beside it, so they are never left with nothing.
 *
 * WHAT IT COSTS THEM, measured over 21,600 played states rather than argued: at a
 * wetness of 0.2 to 0.65 neither guard fires at all; at 0.8 a kind is changed once
 * in some three thousand taps; at 1.0, where every tap asks for water, sockets are
 * refused in 0.012% of judgements. A backstop that fires this rarely in normal play
 * is what a backstop should be — and if a change makes it fire often, that is a new
 * feature and it belongs in front of Joe rather than in a commit.
 *
 * The floor stays, and stays first. It is cheap, it fires early, and it is why the
 * figures above are as small as they are.
 */
export function landedType(island: Island, a: Axial, chosen: TileType): TileType {
  const settled = settledType(island, a, chosen)
  if (survivable(island, a, settled)) return settled
  const other = settled === 'grass' ? 'water' : 'grass'
  // Feasibility first, always. A forced tile the coastline cannot draw is the
  // fault this whole file exists to prevent, and no backstop is worth causing it.
  if (!allows(island, a, other)) return settled
  return survivable(island, a, other) ? other : settled
}

/**
 * The kinds worth offering at a socket: the ones that land as themselves.
 *
 * Derived from `landedType` rather than restating its rules, which is the whole
 * point. A button that does something other than what it shows is worse than no
 * button, and the offer and the outcome used to be two lists of conditions kept
 * in step by hand. Now the offer asks the choke point.
 */
export function landOffer(island: Island, a: Axial): TileType[] {
  const kinds = KINDS.filter(k => landedType(island, a, k) === k)
  /*
   * Cannot happen as the rules stand — `settledType` only answers 'water' where
   * water is feasible, so 'water' is always in the list when 'grass' is not — but
   * an empty offer would be a panel with no buttons and no way out of it, so it
   * degrades to the gentler kind rather than trusting that argument.
   */
  return kinds.length > 0 ? kinds : ['grass']
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

/**
 * How a tile WOULD be drawn if they built it here — before it exists.
 *
 * Joe: *"when chosing a water tile, the incremental build during the challenge
 * step should already show the appropriately designed coast piece with all the
 * water props (lillies, etc) at water level, not land level."*
 *
 * The growing plot had no way to ask this, so it drew a flat water slab for the
 * whole build and then the finished tile arrived as a coast piece — a visual
 * discontinuity at the exact moment the spec wants continuity, since the whole
 * point of building in view is that what they watched become real is the thing
 * they get.
 *
 * Solved over a HYPOTHETICAL island with the tile already on it, because a
 * coast look is a fact about a neighbourhood rather than about a tile, and the
 * plot's neighbours are real even while the plot is not.
 */
export function plannedLook(island: Island, a: Axial, t: TileType): TileLook {
  if (t !== 'water') return { kind: 'grass', turns: 0 }
  const tiles = new Map(island.tiles)
  tiles.set(key(a), t)
  return looksFor({ tiles }).get(key(a)) as TileLook
}

/**
 * Where the water surface sits, relative to the land rim.
 *
 * Measured from the coast meshes, and already relied on by the edge table: land
 * at 0, the sand ramp between −0.05 and −0.1, open water at −0.2. Named here so
 * the growing plot can float a lily on the water rather than on the grass.
 */
export const WATER_LEVEL = -0.2

/**
 * Which way the water faces on a drawn tile, as a world-space angle.
 *
 * The middle of the water arc, so a plot can put its lilies and reeds where the
 * water will actually be instead of spreading them evenly over a hex that is
 * two-thirds dry land. Null when the tile has no water edge at all.
 */
export function waterHeading(look: TileLook): number | null {
  const edges = presentedBy(look)
  const wet: number[] = []
  edges.forEach((e, k) => { if (e === 'water') wet.push(k) })
  if (wet.length === 0) return null
  if (wet.length === 6) return 0
  /*
   * Averaged as VECTORS, not as indices. The arc can wrap past edge 5 back to
   * 0 — `longestRun` exists for the same reason — and averaging 5 and 0
   * arithmetically points at edge 2.5, the opposite side of the hex.
   */
  let x = 0, z = 0
  for (const k of wet) {
    const ang = k * Math.PI / 3
    x += Math.cos(ang)
    z += Math.sin(ang)
  }
  return Math.atan2(z, x)
}

/** Every direction index, for tests and callers that want to enumerate. */
export const EDGE_COUNT = DIRECTIONS.length
