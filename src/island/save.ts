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
import type { Axial } from './world/hex'
import type { SaveStore } from '../platform/storage'

/** The serialised shape. Plain JSON — no Maps, no class instances. */
interface IslandSave {
  tiles: Array<[string, TileType]>
  pets: Pet[]
  bankedTiles: number
  openingSeen: boolean
  /** Progress toward the next hatch and the next tile. Earned work: it must
   *  survive a reload or the child silently starts over (brief section 18). */
  readProgress?: number
  sumProgress?: number
  tilesEarned?: number
  /**
   * The plot under construction.
   *
   * Saved because it is the only record of WHERE the sums already answered
   * are being spent. Without it a reload mid-build silently discards both the
   * site the child chose and the work she did on it (brief section 18).
   */
  plot?: { at: Axial; type: TileType } | null
  /**
   * What the child is called.
   *
   * Stays on the device (brief §19). It is only ever spoken back to her and
   * painted on her own signpost; nothing sends it anywhere.
   */
  childName?: string
  /**
   * What `navigator.storage.persist()` said, if it has been asked.
   *
   * Recorded so a later session knows whether this island is living on storage
   * the browser has promised to keep, and so she is not re-prompted every time
   * she plays. Null means never asked or no answer available.
   */
  persistGranted?: boolean | null
}

export function toSave(
  flow: Flow, openingSeen: boolean, childName?: string,
  persistGranted: boolean | null = null,
): IslandSave {
  return {
    tiles: [...flow.island.tiles.entries()],
    pets: [...flow.pets],
    bankedTiles: flow.bankedTiles,
    openingSeen,
    readProgress: flow.readProgress,
    sumProgress: flow.sumProgress,
    tilesEarned: flow.tilesEarned,
    plot: flow.plot,
    childName,
    persistGranted,
  }
}

/** Defensive: a hand-edited or truncated save must not crash the island. */
function readPlot(v: unknown): Flow['plot'] {
  if (!v || typeof v !== 'object') return null
  const p = v as { at?: { q?: unknown; r?: unknown }; type?: unknown }
  if (typeof p.at?.q !== 'number' || typeof p.at?.r !== 'number') return null
  if (p.type !== 'grass' && p.type !== 'water') return null
  return { at: { q: p.at.q, r: p.at.r }, type: p.type }
}

export function fromSave(
  save: IslandSave | null,
): { flow: Flow; openingSeen: boolean; childName: string; persistGranted: boolean | null } {
  const fresh = createFlow()
  if (!save || !Array.isArray(save.tiles) || save.tiles.length === 0) {
    return { flow: fresh, openingSeen: false, childName: '', persistGranted: null }
  }
  const island: Island = { tiles: new Map(save.tiles) }
  return {
    flow: {
      ...fresh,
      island,
      pets: Array.isArray(save.pets) ? save.pets : [],
      bankedTiles: typeof save.bankedTiles === 'number' ? save.bankedTiles : 0,
      readProgress: typeof save.readProgress === 'number' ? save.readProgress : 0,
      /*
       * Falls back to the island's own size, not to zero. A save written
       * before this field existed would otherwise reset the cost curve and
       * price a twelve-tile island's next tile at a single sum (§4).
       */
      tilesEarned: typeof save.tilesEarned === 'number'
        ? save.tilesEarned : Math.max(0, save.tiles.length - 1),
      plot: readPlot(save.plot),
      /*
       * Never mid-challenge, so a reload cannot strand the child in a round
       * she is unable to finish.
       *
       * A save written under the old flow may still hold a BANKED tile —
       * earned, paid for, never placed. Land she has already worked for
       * cannot be lost (brief §19), so it resumes in 'placing': she picks a
       * type and a socket, and placeTile() sees the work is already done and
       * finishes the tile on the spot rather than charging for it twice.
       */
      phase: (typeof save.bankedTiles === 'number' && save.bankedTiles > 0)
        ? 'placing' : 'free',
      /*
       * Progress toward the CURRENT plot, restored as it was.
       *
       * Deliberately NOT overwritten to fake a prepayment: a save can hold
       * both an old banked tile and a plot half built, and clobbering this
       * would destroy the sums already spent on that plot. The credit lives
       * in bankedTiles, which placeTile spends once and commitPlot clears.
       */
      sumProgress: typeof save.sumProgress === 'number' ? save.sumProgress : 0,
      challenge: null,
      chosen: null,
      /*
       * A RELOAD RE-ROLLS THE CARD, and that is accepted rather than overlooked.
       *
       * `readHeld` / `sumHeld` say "the card at the generator's `history[idx]`
       * was dealt and left unfinished", and the generators' histories live in
       * memory only — so the bit could not be honoured across a reload without
       * writing the card itself into the save, which is a schema bump this
       * phase is deliberately not taking (see the rollback note in
       * docs/HANDOFF.md §6: a new field costs a version, and a rolled-back
       * build shows her an empty island).
       *
       * The threat model settles it. What the held card defends against is a
       * six-year-old tapping X until a word she does not fancy goes away —
       * one tap, instant, repeatable. Reloading is not that: it means killing
       * an installed PWA's tab and waiting through a cold boot, to skip a
       * single word. Nobody does that by accident and no six-year-old does it
       * on purpose thirty times a sitting. Restored explicitly to false, so the
       * next round deals fresh rather than indexing at a history that no longer
       * exists — which `deal()` also guards, belt and braces.
       */
      readHeld: false,
      sumHeld: false,
    },
    openingSeen: save.openingSeen === true,
    childName: typeof save.childName === 'string' ? save.childName : '',
    persistGranted: typeof save.persistGranted === 'boolean' ? save.persistGranted : null,
  }
}

export async function loadIsland(
  store: SaveStore, profileId: string,
): Promise<{ flow: Flow; openingSeen: boolean; childName: string; persistGranted: boolean | null }> {
  const raw = await store.get<IslandSave>(profileId, 'save')
  return fromSave(raw)
}

export async function saveIsland(
  store: SaveStore, profileId: string, flow: Flow, openingSeen: boolean,
  childName?: string, persistGranted: boolean | null = null,
): Promise<void> {
  await store.put(profileId, 'save', toSave(flow, openingSeen, childName, persistGranted))
}
