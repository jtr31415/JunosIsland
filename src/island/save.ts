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
import { createAttainment, readAttainment } from './harness'
import type { Attainment } from './harness'
import { NOTHING_OPENED } from './species/opened'
import type { Opened } from './species/opened'

/** The serialised shape. Plain JSON — no Maps, no class instances. */
interface IslandSave {
  tiles: Array<[string, TileType]>
  pets: Pet[]
  bankedTiles: number
  openingSeen: boolean
  /**
   * The grown-ups colour-comfort setting: red word cards painted green.
   *
   * Absent means off, which is what every save written before this existed
   * says and what a fresh island says — so the default is "exactly as today"
   * with no migration and no version bump.
   */
  calmColours?: boolean
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
   * now costs six units, and they silently pay for the same tile twice —
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
   * child's honeymoon by whatever the unit did and hand them a discount — or
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
   * site the child chose and the work they did on it (brief section 18).
   */
  plot?: { at: Axial; type: TileType } | null
  /**
   * What the child is called.
   *
   * Stays on the device (brief §19). It is only ever spoken back to them and
   * painted on their own signpost; nothing sends it anywhere.
   */
  childName?: string
  /**
   * What `navigator.storage.persist()` said, if it has been asked.
   *
   * Recorded so a later session knows whether this island is living on storage
   * the browser has promised to keep, and so they are not re-prompted every
   * time they play. Null means never asked or no answer available.
   */
  persistGranted?: boolean | null
  /**
   * What the child can be dealt, and how they have been doing on it (A3/A5).
   *
   * ADDITIVE, AND DELIBERATELY NOT A SCHEMA BUMP, though A5 is titled
   * "schema v3". A build that has never heard of this field reads a save
   * containing it without complaint; bumping the envelope to 3 would change
   * that into a REFUSAL, because `durable.ts:119` migrates only upward and
   * returns null downward — which sends the loader to the snapshot ring, which
   * is the empty island HANDOFF §6 names as the cost of a version. The bump
   * would trade a lost report for a lost island, and only one of those is
   * theirs. envelope.ts's own rule agrees ("bumped whenever a migration is
   * added"): the default is computed here by the loader, exactly the precedent
   * `tilesEarned` set. v3 arrives the day this shape changes breakingly.
   */
  attainment?: unknown
  /**
   * The things that happen once, and have (A5's reserved space).
   *
   * A SIBLING OF `attainment`, deliberately, and not a field inside it. Every
   * other thing in that record is a MEASUREMENT — what they were dealt and how
   * they did on it — whereas "the ten-dot introduction has played" is a
   * presentation fact about what the island has already shown them. Filing it
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
  /**
   * Which albums are open, and which was drawn last (the album roster).
   *
   * ADDITIVE, AND NOT A SCHEMA BUMP, for exactly the reasons `attainment` gives
   * two fields above: bumping the envelope turns "a build that has not heard of
   * this" from a shrug into a REFUSAL, and a refusal costs the child their
   * island. A save without these reads as a fresh roster and `advance` seeds
   * four on the spot — the same shape of default `tilesEarned` set.
   *
   * WHY IT IS SAVED AT ALL, since it can be recomputed: the draw is random
   * (JT-027, *"random order"*). Recomputing it every load would deal them a
   * different three albums every time they opened the game, so the anticipation
   * this feature exists to build would reset overnight. The draw happens once
   * and is then a fact about their island.
   */
  openCollections?: unknown
  lastOpened?: unknown
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
 * The same bounds for the album roster. Twenty-one collections exist today and
 * the roster is not expected to double, but a save is untrusted input and a
 * number here is cheaper than a loop that trusts one.
 */
const COLLECTION_KEEP = 64
const COLLECTION_ID_MAX_LEN = 64

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

/**
 * Rebuild the album roster from whatever was on disk.
 *
 * Sanitised like `readOnceFlags`, and it KEEPS IDS THIS BUILD DOES NOT KNOW for
 * the same reason that one does. A later build will open collections today's
 * roster has never heard of; dropping them here would mean a downgrade, then an
 * upgrade, silently loses an album they had already been given — and with it
 * the slot it occupied, so the game would draw them a different one in its
 * place. The album skips what it cannot render (`albumsToShow`), which costs a
 * downgraded build one invisible entry and costs the child nothing.
 */
export function readOpened(open: unknown, last: unknown): Opened {
  const ids: string[] = []
  if (Array.isArray(open)) {
    for (const id of open) {
      if (typeof id !== 'string' || !id || id.length > COLLECTION_ID_MAX_LEN) continue
      if (!ids.includes(id)) ids.push(id)
      if (ids.length >= COLLECTION_KEEP) break
    }
  }
  const lastOpened = typeof last === 'string' && last && last.length <= COLLECTION_ID_MAX_LEN
    ? last
    : null
  return ids.length === 0 ? NOTHING_OPENED : { open: ids, lastOpened }
}

export function toSave(
  flow: Flow, openingSeen: boolean, childName?: string,
  persistGranted: boolean | null = null,
  attainment?: Attainment, onceFlags?: OnceFlags,
  calmColours = false,
  opened: Opened = NOTHING_OPENED,
): IslandSave {
  return {
    attainment,
    onceFlags,
    calmColours,
    openCollections: [...opened.open],
    lastOpened: opened.lastOpened,
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
  calmColours: boolean
  childName: string
  persistGranted: boolean | null
  attainment: Attainment
  onceFlags: OnceFlags
  /**
   * Which albums are open. NOT yet advanced — `main.ts` runs `advance` once it
   * has the pets, because what opens is a function of what they own and this
   * file has no business drawing from an rng.
   */
  opened: Opened
}

export function fromSave(save: IslandSave | null): Loaded {
  const fresh = createFlow()
  if (!save || !Array.isArray(save.tiles) || save.tiles.length === 0) {
    return {
      flow: fresh, openingSeen: false, calmColours: save?.calmColours === true,
      childName: '', persistGranted: null,
      attainment: readAttainment(save?.attainment),
      onceFlags: readOnceFlags(save?.onceFlags),
      opened: readOpened(save?.openCollections, save?.lastOpened),
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
       * index PAST `tilesEarned` and charge them more than list for every tile
       * they have left — a save file that made the game harder.
       */
      honeymoonTiles: typeof save.honeymoonTiles === 'number'
        ? Math.max(0, save.honeymoonTiles) : 0,
      plot: readPlot(save.plot),
      /*
       * Never mid-challenge, so a reload cannot strand the child in a round
       * they are unable to finish.
       *
       * A save written under the old flow may still hold a BANKED tile —
       * earned, paid for, never placed. Land they have already worked for
       * cannot be lost (brief §19), so it resumes in 'placing': they pick a
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
       * build shows them an empty island).
       *
       * The threat model settles it. What the held card defends against is a
       * six-year-old tapping X until a word they do not fancy goes away —
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
    calmColours: save.calmColours === true,
    childName: typeof save.childName === 'string' ? save.childName : '',
    persistGranted: typeof save.persistGranted === 'boolean' ? save.persistGranted : null,
    attainment: readAttainment(save.attainment),
    onceFlags: readOnceFlags(save.onceFlags),
    opened: readOpened(save.openCollections, save.lastOpened),
  }
}

/* ------------------------------------------------ wiping, one box at a time */

/**
 * What a grown-up ticked on the way out (PB-047).
 *
 * Joe: *"it should be at least a question to the adult ... wipe should offer 3
 * options with tick boxes: 1. wipe island and animals, 2 wipe academic
 * progress ... 3 wipe kids name."* Before this the wipe was one button that
 * took everything, so a parent who wanted a fresh maths start had to destroy
 * her animals to get it.
 *
 * THE THREE ARE INDEPENDENT, and that independence is the card. A child who
 * keeps her animals but restarts her maths, and a child who keeps her maths
 * and starts a fresh island, must both come out the far side intact — see
 * `wipeSave` for which field belongs to which box and why.
 */
export interface WipeChoice {
  /** Her island, her animals, and the work banked toward the next of each. */
  island: boolean
  /** Everything the harness measures: the ladder, the stage stats, the offer. */
  academic: boolean
  /** What she is called. */
  name: boolean
}

/**
 * The wiped blob, computed from the saved one. Pure, so it is testable.
 *
 * WHY IT IS A BLOB TRANSFORM rather than a reset of the live objects: this is
 * the one place the game is allowed to destroy what a child owns (brief §19),
 * so it wants to be a function whose whole behaviour a test can pin, field by
 * field, on both sides of the round trip. The caller writes the result and
 * reloads; nothing half-wiped is ever left running in memory.
 *
 * THE THREE HARD CALLS, said out loud, because a later reader will second-guess
 * each of them:
 *
 * 1. THE ECONOMY GOES WITH THE ISLAND, NOT WITH THE ACADEMIC BOX.
 *    `readProgress`, `sumProgress`, `tilesEarned`, `honeymoonTiles` and
 *    `bankedTiles` are EARNED WORK toward the next egg and the next tile, not
 *    a measurement of how she is doing. Brief §19 says earned work is hers, so
 *    "wipe academic progress" — which is a request to re-measure her, not to
 *    charge her again — must not take it. A fresh island naturally starts with
 *    a fresh purse, so it goes there.
 *
 * 2. THE ACADEMIC BOX DOES NOT TOUCH `honeymoonTiles`, though it does clear
 *    `honeymoonFrom` inside the attainment record. The two are not two halves
 *    of one switch. `honeymoonFrom` is a live discount that ends when the
 *    measurement it was granted against is thrown away; `honeymoonTiles` is a
 *    PRICE OFFSET for tiles she already bought (see `flow.sumsForTile`), and
 *    zeroing it would silently re-price every tile she has left. That is the
 *    exact half-wipe this card exists to prevent, just pointing the other way.
 *
 * 3. `onceFlags` GO WITH THE ACADEMIC BOX. They are the once-only teaching
 *    moments (INTRO-TEN and its successors), keyed to where she is on the
 *    ladder. Reset the ladder and leave them, and she re-climbs to the rung
 *    that introduces tens having been told the game already showed her — a
 *    save that says she has seen something she has not.
 *
 * AND ONE TRAP, which cost the best part of an hour: a fresh island is written
 * here as `createFlow()`'s ONE grass tile, never as `tiles: []`. `fromSave`
 * treats an empty tile array as "no save at all" and its fresh branch returns
 * `childName: ''` — so an island wipe expressed as an empty array would
 * silently take her name with it, which is precisely the coupling the three
 * boxes exist to break. Do not "simplify" this to an empty array.
 *
 * Whatever no box claims survives every combination, deliberately:
 * `calmColours` is a colour-comfort setting a grown-up chose and none of the
 * three asked about, and `persistGranted` is a browser answer, not hers.
 */
export function wipeSave(save: IslandSave | null, what: WipeChoice): IslandSave | null {
  if (!save) return null
  const out: IslandSave = { ...save }

  if (what.island) {
    const fresh = createFlow()
    // One grass tile, not none. See the trap above.
    out.tiles = [...fresh.island.tiles.entries()]
    out.pets = []
    out.bankedTiles = fresh.bankedTiles
    out.plot = fresh.plot
    out.readProgress = fresh.readProgress
    out.sumProgress = fresh.sumProgress
    out.tilesEarned = fresh.tilesEarned
    out.honeymoonTiles = fresh.honeymoonTiles
    // Re-stamped so today's unit is the scale the zeroes are denominated in.
    out.pay = itemPay()
    // A new island gets its opening, exactly as the first one did.
    out.openingSeen = false
    /*
     * The album roster is a fact about the animals she owns, so it cannot
     * outlive them: left alone it would show collections standing open with
     * nothing in them, and `lastOpened` pointing at a collection that is no
     * longer hers. `advance` re-seeds on the next load from the pets she has.
     */
    out.openCollections = [...NOTHING_OPENED.open]
    out.lastOpened = NOTHING_OPENED.lastOpened
  }

  if (what.academic) {
    /*
     * The whole harness record in one line, and that is the point: ticks,
     * mode, per-stage attempts, the EWMA, the latency, early, session, rescue
     * and probe rings, the offer cursor and `honeymoonFrom` all live inside
     * `Attainment`, so replacing it wholesale cannot leave a rung behind.
     * `createAttainment()` is the same virgin record a brand-new island gets:
     * sums 1, reading 1, building 1, mode auto — Joe's "start of y1 level".
     *
     * >>> WHERE THE INTRO ASSESSMENT PLUGS IN. Joe's card: *"once available
     * this will reset the intro assessment stage that we have not built yet."*
     * It does not exist and is not stubbed here. When it is built, whatever
     * records that it has been sat belongs INSIDE `Attainment` (so this line
     * already clears it) or, if it cannot be, it is cleared HERE beside this
     * comment and nowhere else.
     */
    out.attainment = createAttainment()
    out.onceFlags = []
  }

  if (what.name) out.childName = ''

  return out
}

/**
 * Apply a wipe to what is on disk. The caller reloads.
 *
 * Through the store, not by reaching into localStorage — removing the one key
 * stopped working the moment there were two copies (see the note this replaced
 * in `main.ts`). An ordinary `put` is enough and is what every other change to
 * her island already uses: it lands in both copies and in the ring, so the
 * newest thing any recovery path can find is the wiped save. Only a wipe with
 * nothing on disk to wipe falls back to `removeProfile`.
 */
export async function wipeIsland(
  store: SaveStore, profileId: string, what: WipeChoice,
): Promise<void> {
  if (!what.island && !what.academic && !what.name) return
  const raw = await store.get<IslandSave>(profileId, 'save')
  const next = wipeSave(raw, what)
  if (!next) { await store.removeProfile(profileId); return }
  await store.put(profileId, 'save', next)
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
  calmColours = false,
  opened: Opened = NOTHING_OPENED,
): Promise<void> {
  await store.put(profileId, 'save',
    toSave(flow, openingSeen, childName, persistGranted, attainment, onceFlags,
      calmColours, opened))
}
