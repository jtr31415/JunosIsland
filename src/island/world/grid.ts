/**
 * Island state: which hexes the child owns, and what is on them.
 *
 * Pure and immutable. `place` returns a new island rather than mutating,
 * because the flow machine keeps prior states and mutation would corrupt them.
 *
 * The island IS the progression (brief section 2) — there are no levels and no
 * navigation, so this little map is the whole world model.
 */
import { key, neighbours } from './hex'
import type { Axial } from './hex'

/**
 * Rock arrived third, at Joe's *"it needs to be pickable in the selector after
 * she has placed 15 tiles already"* — the rocky hexes and their pre-assembled
 * grass and grass-plus-mountain variants.
 *
 * It is DRY LAND that refuses to sit near water, which is the whole of its rule
 * set for now (Joe: *"they can be placed anywhere that does not neighbour water
 * and water cannot be placed next to a mountain tile. we can update those rules
 * later though"*).
 *
 * That one rule is worth more than it looks: because rock and water can never be
 * neighbours, rock never takes part in a coast edge, so the nineteen drawable
 * neighbourhoods need no new entries and no new models. A rock tile is a grass
 * hex that is guaranteed to grow a mountain.
 */
export type TileType = 'grass' | 'water' | 'rock'

/**
 * Dry land, of either kind.
 *
 * READ THIS BEFORE ADDING A FOURTH TYPE. Almost every rule in the coastline was
 * written when there were exactly two types, so it asks `=== 'grass'` and treats
 * everything else as water — which is correct for two types and silently wrong
 * for three. Widening the union does not make TypeScript find those places,
 * because they compare values rather than switching exhaustively: rock would
 * simply have presented open water to the coast mask and cut beaches into the
 * middle of their island.
 *
 * So the land/water question goes through here, and never through `=== 'grass'`.
 */
export const isLand = (t: TileType | undefined): boolean =>
  t === 'grass' || t === 'rock'

export interface Island {
  readonly tiles: ReadonlyMap<string, TileType>
}

/** Fred's lonely rock: one grass hex in a calm sea (brief section 3). */
export const createIsland = (): Island =>
  ({ tiles: new Map([[key({ q: 0, r: 0 }), 'grass' as TileType]]) })

export const has = (i: Island, a: Axial): boolean => i.tiles.has(key(a))

export const tileAt = (i: Island, a: Axial): TileType | undefined => i.tiles.get(key(a))

export const count = (i: Island): number => i.tiles.size

/**
 * Place a tile, returning a new island.
 *
 * Placing on an occupied coord is a no-op: nothing a child owns can be
 * overwritten or lost (brief section 18).
 */
export function place(i: Island, a: Axial, t: TileType): Island {
  if (i.tiles.has(key(a))) return i
  const next = new Map(i.tiles)
  next.set(key(a), t)
  return { tiles: next }
}

/**
 * Every empty coord adjacent to an owned tile — where the child may build.
 * You can never build in open sea, only outward from what you have.
 */
export function sockets(i: Island): Axial[] {
  const out = new Map<string, Axial>()
  for (const k of i.tiles.keys()) {
    const [q, r] = k.split(',').map(Number)
    for (const n of neighbours({ q: q as number, r: r as number })) {
      const nk = key(n)
      if (!i.tiles.has(nk) && !out.has(nk)) out.set(nk, n)
    }
  }
  return [...out.values()]
}
