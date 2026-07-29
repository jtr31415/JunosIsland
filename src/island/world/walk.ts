/**
 * Can a pet actually get out of there?
 *
 * The tile map answers a topological question about CELLS: which hexes are
 * land, which are sea, and can you step from one to the next. Every proof built
 * on it — `hasOutwardCorridor` above all — is true and is about the wrong
 * space. A pet does not walk on cells. It walks on the ground plane minus the
 * keep-out discs of whatever is standing on it, and those discs do not respect
 * hex boundaries: a mountain measures a little over 1.03 units at walking
 * height while adjacent hex centres are 2.0000 apart, so two mountains on
 * neighbouring hexes OVERLAP. Six of them ring a hex and nothing can leave it,
 * with every cell around it perfectly good land (PB-052).
 *
 * So this file models the OTHER space. Obstacles sit at hex centres; the free
 * space is the plane minus their discs, dilated by the pet's own radius. Two
 * obstacles on adjacent hexes pinch the passage between them, and a pet of
 * radius `p` squeezes between A and B exactly when
 *
 *     dist(centreA, centreB) - rA - rB  >=  2p
 *
 * The passages are at the SIDES of hexes, so the free-space graph is the hex
 * lattice's CORNER graph: nodes are the points where three hexes meet, and two
 * corners are joined when the side between them is wide enough to pass. Flood
 * fill that graph and the components ARE the places a pet can be. If the pet's
 * component is not the island's main body, it is sealed in.
 *
 * This is a topological question and not a margin. Nothing here is tuned;
 * either the passage exists or it does not.
 *
 * THE PREMISE, and it is worth stating plainly: only ADJACENT hex obstacles can
 * ever pinch each other. Two hex centres that are not neighbours are at least
 * `3 * size` apart — `sqrt(3)` times the adjacent spacing, or 3.4641 units at
 * the sizes the art gives us — so the model is sound while
 *
 *     rA + rB + 2p  <  3 * size
 *
 * A prop wide enough to break that would let two NON-adjacent obstacles close a
 * passage this file never examines, and it would under-report seals rather than
 * over-report them, which is the worse direction. `NON_ADJACENT_SPACING` is
 * exported so a test can hold the premise to account; there is one in
 * `tests/island/walk.test.ts` and it is the tripwire.
 *
 * KNOWN LIMIT, so nobody reads a false alarm as a bug: a corner belongs to the
 * habitat only if one of its three hexes is land, so two land masses separated
 * by open sea read as two regions and the smaller one reads as sealed. Her
 * island only ever grows outward from what she already owns, so it is always
 * one mass — but a future world with archipelagos wants this widened.
 *
 * DETECTION ONLY. Nothing here refuses a placement or moves a pet.
 */
import { key, parse, neighbours, toWorld } from './hex'
import type { Axial } from './hex'
import { isLand, place, tileAt } from './grid'
import type { Island, TileType } from './grid'

/**
 * The keep-out radius at walking height of whatever stands on a hex of this
 * type. 0 = open ground.
 *
 * Passed in rather than derived, because the radius is a fact about a mesh on
 * disk and this file must stay free of Three.js. The caller that knows what a
 * rock hex grows — and it is `props.mountainHexFor` that knows — supplies it.
 */
export type KeepOut = (a: Axial, t: TileType) => number

/**
 * How close two NON-adjacent hex centres can ever come, in hex circumradii.
 *
 * Neighbours sit `sqrt(3) * size` apart; the next-closest pair, two steps away
 * around a bend, sits `3 * size` apart. Everything further is further still.
 * This is the number the premise above is measured against.
 */
export const NON_ADJACENT_SPACING = 3

/**
 * ...the same clearance, said as a multiple of the ADJACENT spacing.
 *
 * `3 * size` over `sqrt(3) * size` is `sqrt(3)`, so the true clearance is
 * `PINCH_LIMIT * spacing` however the caller happens to hold the hex size.
 */
export const PINCH_LIMIT = Math.sqrt(3)

/** What stands on this hex, in the way of a walking creature. Sea is open. */
function radiusOn(island: Island, a: Axial, keepOut: KeepOut): number {
  const t = tileAt(island, a)
  return t === undefined ? 0 : keepOut(a, t)
}

/**
 * The clear width of the passage between two hexes: centre distance, less what
 * stands on each. NEGATIVE when the two keep-outs overlap, which is the whole
 * of PB-052 in one number.
 */
export function gapBetween(
  island: Island, a: Axial, b: Axial, hexSize: number, keepOut: KeepOut,
): number {
  const wa = toWorld(a, hexSize)
  const wb = toWorld(b, hexSize)
  const d = Math.hypot(wa.x - wb.x, wa.z - wb.z)
  return d - radiusOn(island, a, keepOut) - radiusOn(island, b, keepOut)
}

/**
 * A corner named by the three hexes that meet there, sorted so the same point
 * always gets the same name whoever asks.
 *
 * Deliberately NOT a world position. Rounding a float to make a map key is how
 * a corner ends up in two components at once, and the three keys say exactly
 * the same thing with no arithmetic at all.
 */
export const cornerId = (a: Axial, b: Axial, c: Axial): string =>
  [key(a), key(b), key(c)].sort().join('|')

/** The six corners of a hex, one per pair of consecutive neighbours. */
export function cornersOf(a: Axial): readonly string[] {
  const n = neighbours(a)
  const out: string[] = []
  for (let i = 0; i < 6; i++) {
    out.push(cornerId(a, n[i] as Axial, n[(i + 1) % 6] as Axial))
  }
  return out
}

/** The land she owns, as coords. */
function landOf(island: Island): Axial[] {
  const out: Axial[] = []
  for (const [k, t] of island.tiles) if (isLand(t)) out.push(parse(k))
  return out
}

/**
 * Every hex that can carry an obstacle, plus the open ground beside it.
 *
 * Obstacles only ever stand on land, so the land hexes and their immediate
 * neighbours are the whole of what can pinch anything. Beyond that ring the
 * plane is empty and a pet is already out.
 */
function universeOf(land: readonly Axial[]): Map<string, Axial> {
  const u = new Map<string, Axial>()
  for (const a of land) {
    u.set(key(a), a)
    for (const n of neighbours(a)) u.set(key(n), n)
  }
  return u
}

/** The corners in play: those with at least one land hex among their three. */
function habitatOf(land: readonly Axial[]): Set<string> {
  const h = new Set<string>()
  for (const a of land) for (const c of cornersOf(a)) h.add(c)
  return h
}

/**
 * Connected components of walkable space, largest first.
 *
 * Each is a sorted list of corner ids, and the list of lists is sorted by size
 * and then by first id — deterministic, because a test that has to re-sort the
 * answer before it can assert on it is a test that will not notice the day the
 * answer changes shape.
 */
export function walkableRegions(
  island: Island, hexSize: number, keepOut: KeepOut, petRadius: number,
): readonly (readonly string[])[] {
  const land = landOf(island)
  const universe = universeOf(land)
  const habitat = habitatOf(land)
  const width = 2 * petRadius

  // Corners joined across every side wide enough for the pet to squeeze through.
  const links = new Map<string, string[]>()
  const join = (x: string, y: string): void => {
    let xs = links.get(x); if (!xs) { xs = []; links.set(x, xs) }
    xs.push(y)
    let ys = links.get(y); if (!ys) { ys = []; links.set(y, ys) }
    ys.push(x)
  }

  for (const [ka, a] of universe) {
    for (const b of neighbours(a)) {
      const kb = key(b)
      // Each side once, and only where both hexes are near enough to her land
      // to matter.
      if (!universe.has(kb) || ka >= kb) continue
      /*
       * The two ends of this side are exactly the two corners the hexes share:
       * `{A,B,C}` and `{A,B,D}` for the two common neighbours. Intersecting the
       * corner lists says that without having to find C and D.
       */
      const mine = cornersOf(a)
      const theirs = new Set(cornersOf(b))
      const ends = mine.filter(c => theirs.has(c) && habitat.has(c))
      if (ends.length !== 2) continue         // one end is out at sea; no node there
      if (gapBetween(island, a, b, hexSize, keepOut) < width) continue
      join(ends[0] as string, ends[1] as string)
    }
  }

  const seen = new Set<string>()
  const regions: string[][] = []
  for (const start of [...habitat].sort()) {
    if (seen.has(start)) continue
    const comp: string[] = []
    const stack = [start]
    seen.add(start)
    while (stack.length > 0) {
      const at = stack.pop() as string
      comp.push(at)
      for (const next of links.get(at) ?? []) {
        if (seen.has(next)) continue
        seen.add(next)
        stack.push(next)
      }
    }
    regions.push(comp.sort())
  }

  regions.sort((x, y) =>
    y.length - x.length || (x[0] as string).localeCompare(y[0] as string))
  return regions
}

/**
 * The region a pet standing on hex `at` belongs to, or null if `at` is not
 * habitable.
 *
 * A hex has six corners and they need not all be in one component — the corners
 * of a MOUNTAIN sit on both sides of the wall it makes. Where they differ the
 * largest wins, which is the honest reading: a hex is stranded only when there
 * is no way out from any side of it.
 */
export function regionOf(
  island: Island, at: Axial, hexSize: number, keepOut: KeepOut, petRadius: number,
): readonly string[] | null {
  if (!isLand(tileAt(island, at))) return null
  const regions = walkableRegions(island, hexSize, keepOut, petRadius)
  const corners = new Set(cornersOf(at))
  // Regions come largest first, so the first hit is the best way out.
  for (const r of regions) if (r.some(c => corners.has(c))) return r
  return null
}

/** The land she can still reach from the island's main walkable region. */
function reachableLand(
  island: Island, hexSize: number, keepOut: KeepOut, petRadius: number,
): Set<string> {
  const regions = walkableRegions(island, hexSize, keepOut, petRadius)
  const main = new Set(regions[0] ?? [])
  const out = new Set<string>()
  for (const a of landOf(island)) {
    if (cornersOf(a).some(c => main.has(c))) out.add(key(a))
  }
  return out
}

/**
 * Land hexes from which a pet cannot reach the island's main walkable region.
 *
 * Sorted by coordinate so the answer reads the same twice and a diff of it
 * means something.
 */
export function sealedHexes(
  island: Island, hexSize: number, keepOut: KeepOut, petRadius: number,
): readonly Axial[] {
  const reachable = reachableLand(island, hexSize, keepOut, petRadius)
  return landOf(island)
    .filter(a => !reachable.has(key(a)))
    .sort((x, y) => x.q - y.q || x.r - y.r)
}

/**
 * Would placing `t` at `a` strand any land hex that is reachable today?
 *
 * BEFORE against AFTER, and only ever in that direction: new land arriving is
 * not a seal, so this asks whether anything she can walk to now would stop
 * being walkable — not whether the count of regions went up. `place` returns a
 * new island rather than mutating, so the caller's island is untouched.
 */
export function wouldSeal(
  island: Island, a: Axial, t: TileType,
  hexSize: number, keepOut: KeepOut, petRadius: number,
): boolean {
  const after = place(island, a, t)
  if (after === island) return false                  // occupied: nothing happens
  const before = reachableLand(island, hexSize, keepOut, petRadius)
  const later = reachableLand(after, hexSize, keepOut, petRadius)
  for (const k of before) if (!later.has(k)) return true
  return false
}
