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
import { itemPay } from './balance'
import { createFlow } from './flow'
import type { Flow, Pet } from './flow'
import type { Island, TileType } from './world/grid'
import type { Axial } from './world/hex'
import type { SaveStore } from '../platform/storage'
import { readAttainment } from './harness'
import type { Attainment } from './harness'

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
  /**
   * What one item was worth when this save was written (Run A7).
   *
   * The two progress numbers above are denominated in units, and A7 changed
   * what a unit is worth. Without this marker a save written the day before
   * would be read as half the work it records: three sums toward a tile that
   * now costs six units, and she silently pays for the same tile twice —
   * exactly the loss brief §18 forbids.
   *
   * Absent means pre-A7, when one item paid 1. Kept as the scale itself
   * rather than a version number so any future re-base is the same one-line
   * migration: multiply by how much the unit shrank.
   */
  pay?: number
  tilesEarned?: number
  /**
   * How many of those tiles were bought during a maths honeymoon (Run B).
   *
   * AN INDEX COUNT, NOT UNITS OF WORK, and that distinction is the reason it
   * is written out here rather than folded in beside the two progress numbers.
   * `readProgress` and `sumProgress` are in units and must be re-denominated
   * through `pay` when the unit changes; this is a count of TILES, which no
   * re-base can ever rescale. Putting it through `inUnits` would multiply a
   * child's honeymoon by whatever the unit did and hand her a discount — or
   * take one away — that nobody granted.
   *
   * Absent means 0, exactly as it does for a save written before Run B: an
   * island with no honeymoon behind it prices every tile the way it always did.
   */
  honeymoonTiles?: number
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
  /**
   * What she can be dealt, and how she has been doing on it (A3/A5).
   *
   * ADDITIVE, AND DELIBERATELY NOT A SCHEMA BUMP, though A5 is titled
   * "schema v3". A build that has never heard of this field reads a save
   * containing it without complaint; bumping the envelope to 3 would change
   * that into a REFUSAL, because `durable.ts:119` migrates only upward and
   * returns null downward — which sends the loader to the snapshot ring, which
   * is the empty island HANDOFF §6 names as the cost of a version. The bump
   * would trade a lost report for a lost island, and only one of those is
   * hers. envelope.ts's own rule agrees ("bumped whenever a migration is
   * added"): the default is computed here by the loader, exactly the precedent
   * `tilesEarned` set. v3 arrives the day this shape changes breakingly.
   */
  attainment?: unknown
  /**
   * The things that happen once, and have (A5's reserved space).
   *
   * A SIBLING OF `attainment`, deliberately, and not a field inside it. Every
   * other thing in that record is a MEASUREMENT — what she was dealt and how
   * she did on it — whereas "the ten-dot introduction has played" is a
   * presentation fact about what the island has already shown her. Filing it
   * under competence would be a category error a later reader would have to
   * un-learn, and it would also ripple the `Attainment` type through the
   * grown-ups panel that was just built against it, for a field the panel has
   * no business rendering.
   *
   * NOTHING CONSUMES IT YET, which is the whole point: INTRO-TEN arrives in
   * Run C, and reserved space means the save carries and round-trips the fact
   * from today so that C wires a consumer rather than a migration.
   */
  onceFlags?: unknown
}

/**
 * Which once-only moments this island has already had.
 *
 * A LIST OF IDS RATHER THAN A RECORD OF BOOLEANS, so that Run C can add
 * INTRO-TEN without touching this file or any save on disk: a new flag is a
 * new string, absent means not yet, and there is no shape to migrate. A
 * `{ [id]: boolean }` map would carry the same facts and one extra state
 * nobody wants to define — a flag explicitly written `false`, which is not
 * distinguishable in meaning from an absent one but is distinguishable in
 * code.
 */
export type OnceFlags = string[]

/** Bounds on untrusted input: a hand-edited save may not grow without limit. */
const ONCE_FLAG_KEEP = 64
const ONCE_FLAG_MAX_LEN = 64

/**
 * Rebuild the once-flags from whatever was on disk.
 *
 * Untrusted input, sanitised the way `readAttainment` sanitises its own: the
 * result is built here from scratch, non-strings are dropped, duplicates
 * collapse and the list is bounded, so no hand-edited file can put a
 * non-string where a flag id is expected.
 *
 * IDS THIS BUILD DOES NOT RECOGNISE ARE KEPT, and that is the one place this
 * departs from `readAttainment`, which builds outward from the stage table and
 * lets unknown stage ids die. The difference is what the value reaches: an
 * unknown stage id can arrive at a generator that cannot render it, whereas a
 * flag id is only ever compared for equality and reaches nothing. Dropping one
 * written by a later build would mean a downgrade-then-upgrade replays an
 * introduction the child has already sat through — which is precisely the harm
 * a once-flag exists to prevent, so preserving it IS the sanitised behaviour.
 */
export function readOnceFlags(v: unknown): OnceFlags {
  if (!Array.isArray(v)) return []
  const out: string[] = []
  for (const id of v) {
    if (typeof id !== 'string' || !id || id.length > ONCE_FLAG_MAX_LEN) continue
    if (!out.includes(id)) out.push(id)
    if (out.length >= ONCE_FLAG_KEEP) break
  }
  return out
}

export function toSave(
  flow: Flow, openingSeen: boolean, childName?: string,
  persistGranted: boolean | null = null,
  attainment?: Attainment, onceFlags?: OnceFlags,
): IslandSave {
  return {
    attainment,
    onceFlags,
    tiles: [...flow.island.tiles.entries()],
    pets: [...flow.pets],
    bankedTiles: flow.bankedTiles,
    openingSeen,
    readProgress: flow.readProgress,
    sumProgress: flow.sumProgress,
    pay: itemPay(),
    tilesEarned: flow.tilesEarned,
    honeymoonTiles: flow.honeymoonTiles,
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
  if (p.type !== 'grass' && p.type !== 'water' && p.type !== 'rock') return null
  return { at: { q: p.at.q, r: p.at.r }, type: p.type }
}

export interface Loaded {
  flow: Flow
  openingSeen: boolean
  childName: string
  persistGranted: boolean | null
  attainment: Attainment
  onceFlags: OnceFlags
}

export function fromSave(save: IslandSave | null): Loaded {
  const fresh = createFlow()
  if (!save || !Array.isArray(save.tiles) || save.tiles.length === 0) {
    return {
      flow: fresh, openingSeen: false, childName: '', persistGranted: null,
      attainment: readAttainment(save?.attainment),
      onceFlags: readOnceFlags(save?.onceFlags),
    }
  }
  const island: Island = { tiles: new Map(save.tiles) }
  /*
   * A7: re-denominate work done under an older unit. A pre-A7 save recorded 3
   * sums as 3; a sum is now worth 2, so the same three sums are 6. Whole
   * numbers throughout — the scale is a ratio of two item payments, and both
   * are integers.
   */
  const rescale = itemPay() / Math.max(1, typeof save.pay === 'number' ? save.pay : 1)
  const inUnits = (v: unknown): number =>
    typeof v === 'number' ? Math.round(v * rescale) : 0
  return {
    flow: {
      ...fresh,
      island,
      pets: Array.isArray(save.pets) ? save.pets : [],
      bankedTiles: typeof save.bankedTiles === 'number' ? save.bankedTiles : 0,
      readProgress: inUnits(save.readProgress),
      /*
       * Falls back to the island's own size, not to zero. A save written
       * before this field existed would otherwise reset the cost curve and
       * price a twelve-tile island's next tile at a single sum (§4).
       */
      tilesEarned: typeof save.tilesEarned === 'number'
        ? save.tilesEarned : Math.max(0, save.tiles.length - 1),
      /*
       * NOT through `inUnits`. It is a count of tiles, not a quantity of work,
       * so no re-denomination can apply to it — see the field's note above.
       * Absent is 0, which is a pre-Run-B island and prices exactly as it did.
       *
       * Floored at 0 because a hand-edited negative would run `sumsForTile`'s
       * index PAST `tilesEarned` and charge her more than list for every tile
       * she has left — a save file that made the game harder.
       */
      honeymoonTiles: typeof save.honeymoonTiles === 'number'
        ? Math.max(0, save.honeymoonTiles) : 0,
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
      sumProgress: inUnits(save.sumProgress),
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
    attainment: readAttainment(save.attainment),
    onceFlags: readOnceFlags(save.onceFlags),
  }
}

export async function loadIsland(
  store: SaveStore, profileId: string,
): Promise<Loaded> {
  const raw = await store.get<IslandSave>(profileId, 'save')
  return fromSave(raw)
}

export async function saveIsland(
  store: SaveStore, profileId: string, flow: Flow, openingSeen: boolean,
  childName?: string, persistGranted: boolean | null = null,
  attainment?: Attainment, onceFlags?: OnceFlags,
): Promise<void> {
  await store.put(profileId, 'save',
    toSave(flow, openingSeen, childName, persistGranted, attainment, onceFlags))
}
