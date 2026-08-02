/**
 * What a mountain hex grows, and how much room it takes — in PURE code.
 *
 * THREE.JS FREE, AND THAT IS THE ENTIRE POINT. `walk.ts` models the space a pet
 * walks in and takes its geometry as an injected `KeepOut` function, because a
 * radius is a fact about a mesh on disk and `walk.ts` must not import a renderer
 * to learn one. `flow.ts` is under the same ban and holds to it deliberately —
 * its imports are `grid`, `hex`, `coast`, `balance`, `governors` and nothing
 * else, so the whole rules layer stays testable without a GPU. But the mountain
 * chooser lived in `props.ts`, which imports Three, and so nothing in the pure
 * half of the codebase could answer "how wide is the thing on that hex?".
 *
 * This file is the bridge. The chooser moved here whole — `props.ts` re-exports
 * it, so every existing caller is unchanged — and the geometry it could not
 * carry with it is written down as MEASURED TABLES. The numbers are not
 * estimates and not tuning: each is the exact metric the running game computes
 * off the same `.gltf`, and `tests/island/mountains.test.ts` re-measures every
 * one of them from the real asset on every run. A re-export of the art that
 * moves a radius fails that file rather than quietly changing what the rules
 * believe.
 *
 * TWO RADII, and the difference between them is a family of bugs.
 *
 *   MOUNTAIN_FOOTPRINT — what PLACEMENT uses (`footprintOf`, props.ts:363):
 *     half the wider of the two horizontal bounding-box extents.
 *   MOUNTAIN_KEEPOUT   — what a PET collides with (`footprintBelow(obj, 0.3)`,
 *     props.ts:391): the furthest any vertex below walking height reaches from
 *     the box centre, measured radially.
 *
 * The second is larger for every model, which is why PB-052 exists: placement
 * happily accepts two mountains whose walking-height discs already overlap, and
 * six of them ring a hex that no pet can then leave. And where even the smaller
 * metric overlaps, placement dropped the second mountain outright — PB-053,
 * below, where `mountainFallbackFor` now offers it a narrower peak instead.
 *
 * DETECTION, CHOICE AND GEOMETRY ONLY. Nothing here refuses a placement, moves a
 * pet, or touches the scene graph.
 */
import { toWorld, parse } from './hex'
import type { Axial } from './hex'
import type { Island } from './grid'
import type { KeepOut } from './walk'

/**
 * Stable per-coordinate hash, so a tile's scenery never changes.
 *
 * Exported so tests can drive `coverPiece` with the numbers the island really
 * produces. UNSIGNED, which is the whole point of the `>>> 0` — and the reason
 * every consumer of it must use `>>>` rather than `>>` when it shifts.
 */
export function hash(a: Axial): number {
  let h = (a.q * 73856093) ^ (a.r * 19349663)
  h = (h ^ (h >>> 13)) >>> 0
  return h
}

/** Weighted choice from a list, driven by a hash rather than by chance. */
export function pick<T extends { weight: number }>(list: readonly T[], h: number): T {
  const total = list.reduce((n, x) => n + x.weight, 0)
  let r = h % total
  for (const x of list) {
    r -= x.weight
    if (r < 0) return x
  }
  return list[0] as T
}

/*
 * Typed with the optional `big` that `FEATURES` entries carry, so the two can
 * share the one placement path — and left UNSET on every entry, because `big` is
 * what routes a piece into the fit-and-offset branch these must avoid. A test
 * pins that it stays unset.
 */
export const MOUNTAIN_HEXES: Array<{ name: string; weight: number; big?: boolean }> = [
  { name: 'mountain_A', weight: 2 },
  { name: 'mountain_B', weight: 2 },
  { name: 'mountain_C', weight: 2 },
  { name: 'mountain_A_grass', weight: 3 },
  { name: 'mountain_B_grass', weight: 3 },
  { name: 'mountain_C_grass', weight: 3 },
  { name: 'mountain_A_grass_trees', weight: 3 },
  { name: 'mountain_C_grass_trees', weight: 3 },
]

/**
 * Which mountain a given rock hex grows, and which way it faces.
 *
 * EXPORTED BECAUSE THE PLOT NEEDS THE SAME ANSWER. Joe: *"when selecting a
 * mountain tile, the incremental build goes back to a gras tile with props on.
 * we need to make sure the proper rock/mountain tile is already set up there so
 * it gets placed on completion."*
 *
 * The growing plot and the finished hex are two different placement paths
 * (increments.ts and props.ts — HANDOFF §6), and for a mountain they must agree
 * EXACTLY: they watch a particular peak rise, and that is the peak they must
 * get. A second `pick` over the same table would be one edit away from
 * disagreeing, so there is one function and both callers use it.
 */
export const mountainHexFor = (a: Axial): string =>
  pick(MOUNTAIN_HEXES, hash(a)).name

/** ...and the facing, snapped to a hex edge. Same reasoning: one answer. */
export const mountainSpinFor = (a: Axial): number =>
  ((hash(a) >>> 5) % 6) * (Math.PI / 3)

/* --------------------------------------------------------- measured geometry */

/**
 * The keep-out radius at WALKING HEIGHT of each mountain model, in world units.
 *
 * MEASURED from `src/island/public/props/mountain_*.gltf`, by the metric
 * `footprintBelow(obj, WALKING_HEIGHT)` computes at props.ts:391 and pushes into
 * `blocks` at props.ts:1271: take the XZ centre of the model's bounding box,
 * then the furthest any vertex below `minY + 0.3` reaches from it. This is the
 * disc a pet is clamped out of, so it is the radius that decides whether a pet
 * can pass between two mountains.
 *
 * NATIVE SIZE, NO SCALE. props.ts:1209 gates `fitInto` behind `if (!rockTile)`,
 * so a mountain hex is never resized — "NATIVE SIZE for a mountain hex, and no
 * size variation either". The vertices on disk are the vertices in the world.
 *
 * UNROTATED. `mountainSpinFor` turns each mountain to a hex facing, and the spun
 * radius differs a little per facing; a table cannot hold a per-hex value.
 * `walk.test.ts` measures the spun radius where the spin matters, and the widest
 * spin is within a few thousandths of these, so the unrotated figure is the
 * right one to reason with and the wrong one to bet a hairline margin on.
 *
 * `tests/island/mountains.test.ts` re-measures all eight on every run.
 */
export const MOUNTAIN_KEEPOUT: Readonly<Record<string, number>> = {
  mountain_A: 1.038811,
  mountain_B: 1.038811,
  mountain_C: 1.026901,
  mountain_A_grass: 1.038811,
  mountain_B_grass: 1.038811,
  mountain_C_grass: 1.026901,
  mountain_A_grass_trees: 1.062458,
  mountain_C_grass_trees: 1.026901,
}

/**
 * The radius PLACEMENT uses for each mountain model, in world units.
 *
 * MEASURED from the same files, by the metric `footprintOf` computes at
 * props.ts:363: `max(xExtent, zExtent) / 2` of the axis-aligned bounding box.
 * This is the `r` that props.ts:1214 hands to `firstClear`, and the `r` that
 * goes into the `footprints` list at props.ts:1275 for the next hex to clear.
 *
 * PRE-ROTATION, because props.ts:1214 runs twenty-six lines before
 * `obj.rotation.y` is set at props.ts:1240. Placement judges an unrotated box
 * and then spins the model afterwards — which is a smaller sin than it sounds,
 * a mountain being roughly round, but it is why this table is unrotated and not
 * an approximation of something else.
 *
 * Native size, for the same reason as above.
 *
 * NOTE THE FAMILIES. The A and B models measure 0.938085 and the C models
 * 1.011493, and adjacent hex centres are 2.0000 apart. So a C beside a C
 * overlaps by 0.023 and nothing else overlaps at all — which is the whole
 * mechanism of `bareRockHexes` below, and the reason the defect strikes about
 * one adjacent pair in seven rather than all of them.
 *
 * `tests/island/mountains.test.ts` re-measures all eight on every run.
 */
export const MOUNTAIN_FOOTPRINT: Readonly<Record<string, number>> = {
  mountain_A: 0.938085,
  mountain_B: 0.938085,
  mountain_C: 1.011493,
  mountain_A_grass: 0.938085,
  mountain_B_grass: 0.938085,
  mountain_C_grass: 1.011493,
  mountain_A_grass_trees: 0.938085,
  mountain_C_grass_trees: 1.011493,
}

/**
 * The hex circumradius the game works in, in world units.
 *
 * MEASURED from `src/island/public/tiles/hex_grass.gltf` by the metric
 * `tiles.ts:130` uses at load: `(bb.max.z - bb.min.z) / 2`. HALF THE Z-EXTENT,
 * not the x-extent — the tiles are pointy-top, so the two differ and only one of
 * them is the circumradius.
 *
 * There is no hex-size constant in the runtime source and there must not be one:
 * the game derives this from the mesh so that a re-export resizes the whole
 * world consistently. This constant exists only so PURE code can reason about
 * distances without loading a mesh, and it is pinned to the file it came from.
 *
 * The number that follows from it is the one every argument about mountains is
 * really about: adjacent hex centres sit `sqrt(3) * NATIVE_HEX_SIZE` = 2.0000
 * apart, and no mountain model is narrower than 1.0269 at walking height.
 *
 * `tests/island/mountains.test.ts` re-measures it on every run.
 */
export const NATIVE_HEX_SIZE = 1.1547000408172607

/* ---------------------------------------------------------- the second try */

/** Adjacent hex centres, in world units. 2.0000, and the whole argument. */
const ADJACENT_SPACING = Math.sqrt(3) * NATIVE_HEX_SIZE

/** The widest thing that can already be standing on the hex next door. */
const WIDEST_FOOTPRINT = Math.max(...Object.values(MOUNTAIN_FOOTPRINT))

/**
 * The models that fit BESIDE ANYTHING — the second chance a refused hex gets.
 *
 * DERIVED, NOT LISTED. The test that matters is arithmetic, so it is written as
 * arithmetic: a model may serve as a fallback exactly when its placement radius
 * plus the widest radius in the table still fits inside the gap between adjacent
 * hex centres. Today that admits the five A/B models at 0.938085 (0.938085 +
 * 1.011493 = 1.949578 < 2.0000) and excludes the three C models at 1.011493
 * (2.022986 > 2.0000) — which is precisely the set that was ever refused, and
 * precisely the set that can never be. Writing the names out twice would let a
 * ninth model be added to `MOUNTAIN_HEXES` and quietly not be considered here,
 * or worse, be considered here after a re-export made it too wide.
 *
 * The guard is for a re-export that widens EVERYTHING past the point where any
 * two mountains can share a side. There is then no honest fallback and the
 * narrowest model is the least dishonest one; `mountains.test.ts` asserts the
 * derived list is non-empty and genuinely narrow, so that case fails loudly
 * there rather than silently degrading here.
 */
export const MOUNTAIN_FALLBACKS: ReadonlyArray<{ name: string; weight: number; big?: boolean }> =
  (() => {
    const fits = MOUNTAIN_HEXES.filter(m =>
      (MOUNTAIN_FOOTPRINT[m.name] ?? Infinity) + WIDEST_FOOTPRINT < ADJACENT_SPACING)
    if (fits.length) return fits
    const narrowest = [...MOUNTAIN_HEXES].sort((x, y) =>
      (MOUNTAIN_FOOTPRINT[x.name] ?? Infinity) - (MOUNTAIN_FOOTPRINT[y.name] ?? Infinity))[0]
    return narrowest ? [narrowest] : MOUNTAIN_HEXES
  })()

/**
 * PB-053's fix: which SMALLER mountain a refused rock hex grows instead.
 *
 * `props.ts` gives a mountain hex exactly one candidate position — dead centre,
 * because the mound IS the tile — so when a C-family peak stands inside the
 * C-family peak next door, `firstClear` returns null and the hex was marked
 * placed with nothing on it, for the rest of the session. About one adjacent
 * rock pair in seven. The fix is not a wider tolerance (HANDOFF:464 forbids it,
 * and rightly: the two mountains really do overlap) and not a different metric
 * (`footprintBelow` refuses EVERY adjacent pair — measured). It is to ask for a
 * peak that actually fits and try again.
 *
 * A PURE FUNCTION OF THE HEX, exactly like `mountainHexFor`, and for the same
 * reason: whether the retry fires depends on the neighbours, but WHICH model it
 * offers must not — every island, every session, every load must reach for the
 * same second peak on the same coordinate, or a save re-renders differently.
 *
 * THE PRIMARY CHOOSER IS UNTOUCHED. Nothing here runs for a hex that places
 * successfully, and `MOUNTAIN_HEXES` and its weights are unchanged, so every
 * mountain that stands today stands in the same place, facing the same way,
 * tomorrow. The sets are disjoint by construction — the C family is excluded
 * from `MOUNTAIN_FALLBACKS` — so the retry is never a re-run of the refusal.
 *
 * `>>> 3`, unsigned and shifted: `pick` consumes the low bits, and the primary
 * chooser already spends them. Sharing them would tie a hex's second choice to
 * its first for no reason. `>>>` and never `>>`, per `hash`.
 *
 * THE PLOT IS NOT AFFECTED. `plot.ts` names its peak through `mountainHexFor`
 * and the finished build arrives via `props.adopt`, which never goes near the
 * refusal path — so the peak she watched rise is still the peak she gets.
 */
export const mountainFallbackFor = (a: Axial): string =>
  pick(MOUNTAIN_FALLBACKS, hash(a) >>> 3).name

/* ------------------------------------------------------------- the helpers */

/**
 * The keep-out radius, at walking height, of whatever a hex of this type grows.
 * Open ground is 0.
 *
 * This is the function `walk.ts` was written to be given: it closes the loop
 * between a tile map and the space a pet actually moves through, with no
 * renderer anywhere in the chain. `walk.test.ts` builds the same thing by
 * reading the meshes directly, which is the stricter version and the reason to
 * trust this one.
 *
 * A CONSERVATIVE BOUND SINCE PB-053, and deliberately not the true value.
 *
 * A rock hex now grows one of two models: the primary, or — if the primary was
 * refused for standing inside its neighbour — the fallback. Which one happened
 * depends on what was already placed around it, and `keepOutFor(a, t)` is handed
 * a coordinate and a tile type and cannot see a neighbour, let alone the
 * insertion order that decided the refusal. So it cannot answer exactly.
 *
 * It answers with the MAXIMUM of the two instead, because the two errors are not
 * equal. The fallback family is the NARROWER one at placement size but the WIDER
 * one at walking height (A/B keep out 1.038811 and `mountain_A_grass_trees`
 * 1.062458, against the C family's 1.026901), so reporting the primary's radius
 * for a hex that grew a fallback would UNDER-report by up to 0.036 — and
 * `walk.ts`'s header is explicit that under-reporting is the dangerous
 * direction: it opens a gap the rules believe a pet can walk through and the
 * geometry does not, which is a pet sealed in a pocket that `sealsAPet` swore
 * was fine. Over-reporting only makes `wouldSeal` refuse a tile placement that
 * would in fact have been survivable, and the widest over-report is 0.036 on a
 * side that is already shut by more than 0.05 for every pair of mountains.
 */
export const keepOutFor: KeepOut = (a, t) =>
  t === 'rock'
    ? Math.max(
      MOUNTAIN_KEEPOUT[mountainHexFor(a)] ?? 0,
      MOUNTAIN_KEEPOUT[mountainFallbackFor(a)] ?? 0,
    )
    : 0

/**
 * PB-053 detection. Rock hexes that end up with no mountain on them at all.
 *
 * THE DEFECT, as it was. `props.ts` dresses hexes one at a time, in
 * `island.tiles` Map insertion order (props.ts:1051), keeping a running
 * `footprints` list of what it has already put down. A mountain sits dead
 * centre — `spread` is 0 for a rock tile (props.ts:1179) — so unlike a tree it
 * gets exactly ONE candidate position and no inward retries that mean anything.
 * If that position stood inside a mountain already placed, `firstClear` returned
 * null, props.ts marked the hex placed with nothing on it, and it was never
 * revisited. A rock tile with no rock on it, for the rest of the session.
 *
 * Insertion order therefore decided which of a colliding pair survived, and the
 * pair is symmetric: swap the two keys in the Map and the other hex went bare.
 *
 * THE SECOND TRY, which this now models because `props.ts` does it. A refused
 * rock hex asks `mountainFallbackFor` for a narrower peak and tests THAT in the
 * same one position; only if the narrower peak is refused too is the hex given
 * up as bare. Since the widest model is 1.011493 and every fallback 0.938085,
 * their sum is 1.949578 against 2.0000 between centres, so on a board made only
 * of mountains the second try cannot fail — the sweep in `mountains.test.ts`
 * that measured 2763 bare hexes over 19182 adjacent pairs now measures none.
 * The function is kept, rather than deleted with the bug, because the three
 * blind spots below are real and a future change can put a hex back on this
 * list.
 *
 * A LOWER BOUND, and honestly so. This is pure code and there are three things
 * it cannot see, every one of which can only make the real count HIGHER:
 *
 *   - the ground raycasts. `firstClear` also demands `allows(name,
 *     surface.groundAt(x, z))` (props.ts:1231) and the surface is a rendered
 *     mesh. A mountain refused for standing half over water is invisible here.
 *   - the non-mountain entries in `footprints`. Bare-tree cover (props.ts:1019)
 *     and the pieces of a grown plot (props.ts:1314) go into the same list, so a
 *     mountain can be blocked by something this model does not model at all.
 *   - anything already `placed` before the sync loop reaches a hex.
 *
 * So a hex this function names is bare; a hex it does not name may still be.
 *
 * `hexSize` defaults to the measured native size, which is what the game uses.
 */
export function bareRockHexes(
  island: Island, hexSize: number = NATIVE_HEX_SIZE,
): readonly Axial[] {
  // Exactly props.ts's `footprints`, restricted to the mountains.
  const standing: Array<{ x: number; z: number; r: number }> = []
  const bare: Axial[] = []

  /*
   * `standsInside` (props.ts:426), verbatim: STRICT less-than, so two
   * footprints that merely kiss both stand. "Touching counts as clear: two
   * pieces whose footprints just kiss look like two things next to each other,
   * which is what a wood is."
   */
  const refused = (x: number, z: number, r: number): boolean =>
    standing.some(f => Math.hypot(f.x - x, f.z - z) < f.r + r)

  for (const [k, t] of island.tiles) {
    if (t !== 'rock') continue
    const a = parse(k)
    const { x, z } = toWorld(a, hexSize)

    let r = MOUNTAIN_FOOTPRINT[mountainHexFor(a)] ?? 0
    if (refused(x, z, r)) {
      // The retry, exactly as props.ts does it: same one position, narrower
      // model, and the fallback's own radius from that point on.
      r = MOUNTAIN_FOOTPRINT[mountainFallbackFor(a)] ?? 0
      if (refused(x, z, r)) {
        // Refused twice, and NOT added to the list — a mountain that never
        // appeared cannot go on to block the hex after it.
        bare.push(a)
        continue
      }
    }
    standing.push({ x, z, r })
  }

  return bare
}
