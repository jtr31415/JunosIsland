/**
 * The flow machine: what the island does when the child does something.
 *
 * This is the layer boundary from spec section 7. The world raises intents
 * ("the egg was tapped"); this decides what happens; the overlay and scene
 * react. It touches no DOM and no Three.js, so the rules that matter — a wrong
 * answer costs nothing, a tile is never lost, an egg never expires — are
 * tested without a GPU.
 *
 * Immutable throughout: every transition returns a new state.
 */
import { createIsland, place, sockets, count } from './world/grid'
import type { Island, TileType } from './world/grid'
import { key } from './world/hex'
import type { Axial } from './world/hex'

/**
 * How much work each reward costs — from the curve, never a constant.
 *
 * A flat price made the first hatch as expensive as the twentieth, which is
 * wrong at both ends: the first should be nearly free so the loop teaches
 * itself, and later ones should be real work. The curve does both and
 * flattens rather than running away (slice-1 spec §4).
 */
import { eggCost, tileCost } from './balance'

/** Pages this egg costs. Eggs are counted by how many have already hatched. */
export const pagesForEgg = (f: Flow): number => eggCost(f.pets.length + 1)
/** Sums this tile costs. Tiles counted by how many have been placed. */
export const sumsForTile = (f: Flow): number => tileCost(f.tilesEarned + 1)

export type Phase = 'opening' | 'free' | 'challenge' | 'placing'
export type ChallengeKind = 'read' | 'sum' | null

export interface Pet {
  id: string
  name: string
  species: string
  /** Where it currently stands. Pets wander; this is just the latest spot. */
  at: Axial
}

export interface Flow {
  phase: Phase
  challenge: ChallengeKind
  island: Island
  pets: readonly Pet[]
  /** Tiles earned but not yet placed. Never decays (brief section 18). */
  bankedTiles: number
  /** The type the child picked from the offer, awaiting a socket tap. */
  chosen: TileType | null
  /**
   * The plot under construction: what is being built, and where.
   *
   * Spec §2 in one field. The order it prescribes is "pick 1 of 3 tile types
   * -> pick a socket -> ghost hex appears -> each correct sum advances the
   * build", so the tile is SITED FIRST and grows in view. The first
   * implementation had it backwards — sums accumulated invisibly, then the
   * finished tile was chosen and placed — and as a result nothing ever
   * assigned this field and the growing plot was never once drawn.
   */
  plot: { at: Axial; type: TileType } | null
  /** There is always an egg to read to, unless one is mid-hatch. */
  eggPresent: boolean
  /** Reading rounds completed toward the current egg. Never decays. */
  readProgress: number
  /** Sums answered toward the next tile. Never decays. */
  sumProgress: number
  /** How many tiles have been earned in total — drives the cost curve. */
  tilesEarned: number
}

export function createFlow(): Flow {
  return {
    phase: 'free',
    challenge: null,
    island: createIsland(),
    pets: [],
    bankedTiles: 0,
    chosen: null,
    plot: null,
    eggPresent: true,
    readProgress: 0,
    sumProgress: 0,
    tilesEarned: 0,
  }
}

/** 0..1 toward the next hatch — drives the egg's crack stages. */
export const hatchProgress = (f: Flow): number =>
  Math.min(1, f.readProgress / Math.max(1, pagesForEgg(f)))
/** 0..1 toward the next tile. */
export const landProgress = (f: Flow): number =>
  Math.min(1, f.sumProgress / Math.max(1, sumsForTile(f)))

/** Reading hatches eggs (brief section 4). */
export function tapEgg(f: Flow): Flow {
  if (f.phase !== 'free' || !f.eggPresent) return f
  return { ...f, phase: 'challenge', challenge: 'read' }
}

/**
 * Maths earns land (brief section 4).
 *
 * Only ever opens a round for a plot that already exists. Asking for land
 * with nothing under construction OPENS THE BANK instead — the offer, then a
 * socket — because a sum with no visible plot to advance is exactly the
 * invisible progress spec §2 exists to abolish. See askForLand().
 */
export function tapSum(f: Flow): Flow {
  if (f.phase !== 'free' || !f.plot) return f
  return { ...f, phase: 'challenge', challenge: 'sum' }
}

/**
 * "I would like some land."
 *
 * With a plot already under construction this just opens the next sum. With
 * none, it opens the bank: phase 'placing', which shows the three-type offer
 * and lights up every socket.
 */
export function askForLand(f: Flow): Flow {
  if (f.phase !== 'free') return f
  if (f.plot) return tapSum(f)
  return { ...f, phase: 'placing', chosen: null }
}

export interface HatchDetails { name: string; species: string }

/**
 * A challenge was completed.
 *
 * Reading hatches the egg into a named pet; maths banks one tile and moves
 * straight into placing, because choosing where it goes is the reward.
 */
export function challengePassed(f: Flow, hatch?: HatchDetails): Flow {
  if (f.phase !== 'challenge') return f

  if (f.challenge === 'read' && hatch) {
    const readProgress = f.readProgress + 1
    if (readProgress < pagesForEgg(f)) {
      // Not yet. The egg is closer, and that progress can never be lost.
      return { ...f, phase: 'free', challenge: null, readProgress }
    }
    const home = firstFreeSpot(f)
    const pet: Pet = {
      id: 'pet' + (f.pets.length + 1) + '-' + hatch.name,
      name: hatch.name,
      species: hatch.species,
      at: home,
    }
    return {
      ...f,
      phase: 'free',
      challenge: null,
      pets: [...f.pets, pet],
      // A fresh egg washes ashore, so there is always something to read to.
      eggPresent: true,
      readProgress: 0,
    }
  }

  if (f.challenge === 'sum') {
    const sumProgress = f.sumProgress + 1
    const next = { ...f, phase: 'free' as Phase, challenge: null, sumProgress }
    // Not paid for yet: the plot simply stands a little further on, which the
    // increment sequence shows. Nothing is banked and nothing is invisible.
    if (sumProgress < sumsForTile(f)) return next
    return commitPlot(next)
  }

  return { ...f, phase: 'free', challenge: null }
}

/**
 * A challenge was abandoned or got nowhere.
 *
 * Costs nothing. No tile lost, no pet lost, the egg still there to try again
 * (brief section 18 — wrong answers cost nothing but a wobble).
 */
export function challengeFailed(f: Flow): Flow {
  if (f.phase !== 'challenge') return f
  return { ...f, phase: 'free', challenge: null }
}

/**
 * Three tile types to pick from; the child chooses, then places.
 *
 * Grass appears twice deliberately: at this stage most of what makes an
 * island feel like an island is ground, and a child who wants water can
 * always take it. M2 widens this as biomes arrive.
 */
export function tileOffer(f: Flow): TileType[] {
  if (f.phase !== 'placing') return []
  return ['grass', 'water', 'grass']
}

export function chooseTile(f: Flow, t: TileType): Flow {
  if (f.phase !== 'placing') return f
  return { ...f, chosen: t }
}

/**
 * Drop the chosen tile on a socket.
 *
 * A tap anywhere that is not a socket does nothing and — importantly — keeps
 * the banked tile. The child is never punished for a mis-tap.
 */
/**
 * Site the chosen tile on a socket. The ghost hex appears here and grows.
 *
 * A tap anywhere that is not a socket does nothing and — importantly — keeps
 * the choice. The child is never punished for a mis-tap.
 *
 * This no longer PLACES a finished tile; it starts one. The land arrives when
 * the sums are done, in view, which is the whole point of spec §2.
 */
export function placeTile(f: Flow, a: Axial): Flow {
  if (f.phase !== 'placing' || !f.chosen) return f
  /*
   * Never replace a plot already under construction. A restored save can put
   * the flow in 'placing' WITH a standing plot, and siting over it would
   * throw away both the site she chose and every sum she has spent on it.
   */
  if (f.plot) return f
  const legal = sockets(f.island).some(s => key(s) === key(a))
  if (!legal) return f

  const sited: Flow = {
    ...f,
    chosen: null,
    plot: { at: a, type: f.chosen },
    phase: 'free',
  }
  /*
   * Already paid for? Then it is finished the moment it is sited.
   *
   * `bankedTiles` is a CREDIT carried over from the previous flow, where a
   * finished tile could be earned and left unplaced (see save.ts). Its work
   * was done and must not be charged for again — nothing a child owns can be
   * lost (brief §18) — so one credit finishes one plot, and commitPlot spends
   * it. Leaving the credit unspent would mint a free tile on every reload.
   */
  if (sited.bankedTiles > 0 || sited.sumProgress >= sumsForTile(sited)) {
    return commitPlot(sited)
  }
  return sited
}

/**
 * The plot is paid for: it becomes real land.
 *
 * The one place a tile is ever added to the island, so "earned" and "on the
 * map" cannot drift apart.
 */
function commitPlot(f: Flow): Flow {
  if (!f.plot) return f
  /*
   * Refuse to commit somewhere the tile cannot legally go.
   *
   * The site was checked when it was chosen, but a save file is editable and
   * a plot restored from one has never been near that check. Committing blind
   * would either no-op onto an owned hex — charging a full tile's worth of
   * sums for nothing, and drifting "earned" apart from "on the map" — or
   * strand a tile in open sea.
   */
  const legal = !f.island.tiles.has(key(f.plot.at))
    && sockets(f.island).some(s => key(s) === key(f.plot!.at))
  if (!legal) return { ...f, plot: null, chosen: null, phase: 'free', challenge: null }

  return {
    ...f,
    island: place(f.island, f.plot.at, f.plot.type),
    plot: null,
    chosen: null,
    phase: 'free',
    challenge: null,
    tilesEarned: f.tilesEarned + 1,
    sumProgress: 0,
    // Spend the carried-over credit, if this tile was paid for by one.
    bankedTiles: Math.max(0, f.bankedTiles - 1),
  }
}

/** Somewhere on the island for a new pet to stand. */
function firstFreeSpot(f: Flow): Axial {
  const taken = new Set(f.pets.map(p => key(p.at)))
  for (const k of f.island.tiles.keys()) {
    if (!taken.has(k)) {
      const parts = k.split(',').map(Number)
      return { q: parts[0] as number, r: parts[1] as number }
    }
  }
  return { q: 0, r: 0 }
}

/** How big the island has grown — used to frame the camera. */
export const islandSize = (f: Flow): number => count(f.island)
