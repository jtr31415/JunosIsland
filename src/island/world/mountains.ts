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
 * metric overlaps, placement drops the second mountain outright — PB-053, below.
 *
 * DETECTION AND GEOMETRY ONLY. Nothing here refuses a placement, moves a pet, or
 * touches the scene graph.
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
 * EXACTLY: she watches a particular peak rise, and that is the peak she must
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
 */
export const keepOutFor: KeepOut = (a, t) =>
  t === 'rock' ? (MOUNTAIN_KEEPOUT[mountainHexFor(a)] ?? 0) : 0

/**
 * PB-053 detection. Rock hexes whose mountain is silently refused and never
 * appears, leaving the hex bare.
 *
 * THE DEFECT. `props.ts` dresses hexes one at a time, in `island.tiles` Map
 * insertion order (props.ts:1051), keeping a running `footprints` list of what
 * it has already put down. A mountain sits dead centre — `spread` is 0 for a
 * rock tile (props.ts:1179) — so unlike a tree it gets exactly ONE candidate
 * position and no inward retries that mean anything. If that position stands
 * inside a mountain already placed, `firstClear` returns null, props.ts:1232
 * marks the hex placed with nothing on it, and it is never revisited. A rock
 * tile with no rock on it, for the rest of the session.
 *
 * Insertion order therefore decides which of a colliding pair survives, and the
 * pair is symmetric: swap the two keys in the Map and the other hex goes bare.
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

  for (const [k, t] of island.tiles) {
    if (t !== 'rock') continue
    const a = parse(k)
    const r = MOUNTAIN_FOOTPRINT[mountainHexFor(a)] ?? 0
    const { x, z } = toWorld(a, hexSize)
    /*
     * `standsInside` (props.ts:426), verbatim: STRICT less-than, so two
     * footprints that merely kiss both stand. "Touching counts as clear: two
     * pieces whose footprints just kiss look like two things next to each
     * other, which is what a wood is."
     */
    if (standing.some(f => Math.hypot(f.x - x, f.z - z) < f.r + r)) {
      // Refused, and NOT added to the list — a mountain that never appeared
      // cannot go on to block the hex after it.
      bare.push(a)
      continue
    }
    standing.push({ x, z, r })
  }

  return bare
}
