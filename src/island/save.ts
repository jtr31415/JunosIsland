/**
 * Island persistence, through the async SaveStore built in M0.
 *
 * The store is async on purpose (spec section 6) even though localStorage is
 * not: every call site here already awaits, so replacing it with a
 * network-backed store later touches this file and nothing else.
 *
 * Nothing a child owns can be lost (brief section 18), so a corrupt or absent
 * save yields a fresh island rather than an error.
 */
import { createFlow } from './flow'
import type { Flow, Pet } from './flow'
import type { Island, TileType } from './world/grid'
import type { SaveStore } from '../platform/storage'

/** The serialised shape. Plain JSON — no Maps, no class instances. */
interface IslandSave {
  tiles: Array<[string, TileType]>
  pets: Pet[]
  bankedTiles: number
  openingSeen: boolean
}

export function toSave(flow: Flow, openingSeen: boolean): IslandSave {
  return {
    tiles: [...flow.island.tiles.entries()],
    pets: [...flow.pets],
    bankedTiles: flow.bankedTiles,
    openingSeen,
  }
}

export function fromSave(save: IslandSave | null): { flow: Flow; openingSeen: boolean } {
  const fresh = createFlow()
  if (!save || !Array.isArray(save.tiles) || save.tiles.length === 0) {
    return { flow: fresh, openingSeen: false }
  }
  const island: Island = { tiles: new Map(save.tiles) }
  return {
    flow: {
      ...fresh,
      island,
      pets: Array.isArray(save.pets) ? save.pets : [],
      bankedTiles: typeof save.bankedTiles === 'number' ? save.bankedTiles : 0,
      // A saved game always resumes in free play: never mid-challenge, so a
      // reload can never strand the child in a round she cannot finish.
      phase: 'free',
      challenge: null,
      chosen: null,
    },
    openingSeen: save.openingSeen === true,
  }
}

export async function loadIsland(
  store: SaveStore, profileId: string,
): Promise<{ flow: Flow; openingSeen: boolean }> {
  const raw = await store.get<IslandSave>(profileId, 'save')
  return fromSave(raw)
}

export async function saveIsland(
  store: SaveStore, profileId: string, flow: Flow, openingSeen: boolean,
): Promise<void> {
  await store.put(profileId, 'save', toSave(flow, openingSeen))
}
