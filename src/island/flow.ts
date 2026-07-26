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
  /** There is always an egg to read to, unless one is mid-hatch. */
  eggPresent: boolean
}

export function createFlow(): Flow {
  return {
    phase: 'free',
    challenge: null,
    island: createIsland(),
    pets: [],
    bankedTiles: 0,
    chosen: null,
    eggPresent: true,
  }
}

/** Reading hatches eggs (brief section 4). */
export function tapEgg(f: Flow): Flow {
  if (f.phase !== 'free' || !f.eggPresent) return f
  return { ...f, phase: 'challenge', challenge: 'read' }
}

/** Maths earns land (brief section 4). */
export function tapSum(f: Flow): Flow {
  if (f.phase !== 'free') return f
  return { ...f, phase: 'challenge', challenge: 'sum' }
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
    }
  }

  if (f.challenge === 'sum') {
    return { ...f, phase: 'placing', challenge: null, bankedTiles: f.bankedTiles + 1 }
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
  if (f.bankedTiles < 1) return []
  return ['grass', 'water', 'grass']
}

export function chooseTile(f: Flow, t: TileType): Flow {
  if (f.bankedTiles < 1) return f
  if (f.phase === 'challenge') return f      // never mid-round
  return { ...f, chosen: t, phase: 'placing' }
}

/**
 * Drop the chosen tile on a socket.
 *
 * A tap anywhere that is not a socket does nothing and — importantly — keeps
 * the banked tile. The child is never punished for a mis-tap.
 */
export function placeTile(f: Flow, a: Axial): Flow {
  if (f.bankedTiles < 1) return f
  if (f.phase === 'challenge') return f      // never mid-round
  const legal = sockets(f.island).some(s => key(s) === key(a))
  if (!legal) return f
  const bankedTiles = f.bankedTiles - 1
  return {
    ...f,
    island: place(f.island, a, f.chosen ?? 'grass'),
    bankedTiles,
    chosen: null,
    // Still owed land? Stay in placing, or the surplus becomes unreachable.
    phase: bankedTiles > 0 ? 'placing' : 'free',
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
