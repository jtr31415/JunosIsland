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
import { buildableSockets, landedType, landOffer, canBeRock } from './world/coast'

/**
 * How much work each reward costs — from the curve, never a constant.
 *
 * A flat price made the first hatch as expensive as the twentieth, which is
 * wrong at both ends: the first should be nearly free so the loop teaches
 * itself, and later ones should be real work. The curve does both and
 * flattens rather than running away (slice-1 spec §4).
 */
import { eggCost, tileCost, balance } from './balance'

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
   * The socket she tapped to ask for land, if she asked at one.
   *
   * Land used to be asked for by tapping any grass, so the game had no idea
   * where she wanted it and had to ask a second question — "now choose where
   * it goes" — after she had picked a type. Asking happens AT a socket now, so
   * the answer is already in hand and the question is not worth asking.
   *
   * Transient: it lives for the length of one choice and is never saved.
   */
  pending: Axial | null
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
  /**
   * A dealt card left unfinished: the SAME one comes back next time.
   *
   * Joe, playtesting: *"there should be an x button to get back to the island
   * when through a challenge... also resume at the same challenge card,
   * otherwise kids can skip something they dont like."* The resume is the
   * load-bearing half. A way out that re-rolled the question would be a way to
   * skip a word she does not fancy, one tap at a time.
   *
   * ONE BIT, and only one bit, because the card itself already exists
   * somewhere better: the generators keep their own history and `history[idx]`
   * IS the card she was dealt (v0's `renderCurrent` renders exactly that, and
   * its `forward` only generates when `idx` sits at the end). All that is
   * missing is whether that card has been consumed. So this stays a boolean and
   * `flow.ts` keeps importing nothing from `core/` — no `ReadPick`, no
   * `BuildItem`, no `SumItem` leaking into the state machine.
   *
   * Set when a round is abandoned, cleared when one is passed. Two of them
   * rather than one, because reading and maths draw from different decks: a
   * finished sum must not quietly re-roll the word she walked away from.
   *
   * Transient, exactly like `pending` and `chosen` — `save.ts` does not write
   * it. See the note there: a RELOAD still re-rolls, and that is accepted.
   */
  readHeld: boolean
  sumHeld: boolean
}

export function createFlow(): Flow {
  return {
    phase: 'free',
    challenge: null,
    island: createIsland(),
    pets: [],
    bankedTiles: 0,
    chosen: null,
    pending: null,
    plot: null,
    eggPresent: true,
    readProgress: 0,
    sumProgress: 0,
    tilesEarned: 0,
    readHeld: false,
    sumHeld: false,
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
export function askForLand(f: Flow, at: Axial | null = null): Flow {
  if (f.phase !== 'free') return f
  if (f.plot) return tapSum(f)
  return { ...f, phase: 'placing', chosen: null, pending: at }
}

/**
 * "Actually, never mind."
 *
 * Joe: *"when user clicks on empty tile to do a tile challenge, he cannot change
 * his mind at the selecting of the tile type stage."* The same fault as tapping
 * any grass starting a maths round — it turns looking round the island into a
 * commitment — and the same fix: a way out that costs nothing.
 *
 * Only the transient half of the choice is cleared. `plot` is deliberately NOT
 * touched: it holds every sum already spent on a tile under construction, and a
 * restored save can put the flow in 'placing' with one standing (see save.ts).
 * `bankedTiles`, `sumProgress` and `readProgress` are likewise untouched —
 * nothing a child owns can be lost (brief §19). Asking for land costs nothing
 * yet, so backing out of it must cost nothing either.
 */
export function cancelPlacing(f: Flow): Flow {
  if (f.phase !== 'placing') return f
  return { ...f, phase: 'free', chosen: null, pending: null }
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
    // The card was ANSWERED, so it is spent: the next page is a fresh draw.
    if (readProgress < pagesForEgg(f)) {
      // Not yet. The egg is closer, and that progress can never be lost.
      return { ...f, phase: 'free', challenge: null, readProgress, readHeld: false }
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
      readHeld: false,
    }
  }

  if (f.challenge === 'sum') {
    const sumProgress = f.sumProgress + 1
    const next = {
      ...f, phase: 'free' as Phase, challenge: null, sumProgress, sumHeld: false,
    }
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
 *
 * And the card is HELD rather than thrown away. Leaving must cost her nothing,
 * but it must not BUY her anything either: without this, an X and a re-tap
 * dealt a different word, so the way out doubled as a way to skip the word she
 * did not fancy — and it charged for the privilege, because the generators ramp
 * their difficulty off `history.length` and draw from finite decks. She comes
 * back to the same card, at the same size, having spent nothing.
 */
export function challengeFailed(f: Flow): Flow {
  if (f.phase !== 'challenge') return f
  return {
    ...f,
    phase: 'free',
    challenge: null,
    readHeld: f.readHeld || f.challenge === 'read',
    sumHeld: f.sumHeld || f.challenge === 'sum',
  }
}

/**
 * Three tile types to pick from; the child chooses, then places.
 *
 * Grass appears twice deliberately: at this stage most of what makes an
 * island feel like an island is ground, and a child who wants water can
 * always take it. M2 widens this as biomes arrive.
 */
/**
 * The kinds of land she can choose between.
 *
 * ONE BUTTON PER KIND. It used to offer `['grass', 'water', 'grass']` — a
 * pick-of-three with grass listed twice, from slice-1 §7's weighting of the
 * first-run offer. Joe, reasonably: "the type strangely being land, water,
 * land — I don't see why two land options are needed?" He is right. Weighting
 * a random draw is one thing; showing a child the same button twice and asking
 * her to choose is another, and she cannot tell them apart because there is
 * nothing to tell.
 *
 * It grows on its own when the biome ladder lands (item 14) and there are
 * spring, desert and ice to choose from — at which point this is a genuine
 * pick-of-several rather than a pick-of-three that was really a pick-of-two.
 */
/**
 * Has she earned the mountains yet?
 *
 * Joe: *"it needs to be pickable in the selector after she has placed 15 tiles
 * already."* Counted as tiles SHE placed, so the home hex Fred was already
 * standing on does not count toward her fifteen — she is being asked for
 * fifteen of her own, which is what the sentence says.
 *
 * The threshold lives in `balance.json` with the other unlock rungs rather than
 * here, because every other pacing number does and a constant hidden in a
 * predicate is one nobody finds when they want to tune it.
 */
export function rockUnlocked(f: Flow): boolean {
  const rung = balance.unlocks.find(u => u.type === 'rock')
  if (!rung) return false
  return f.island.tiles.size - 1 >= rung.tiles
}

export function tileOffer(f: Flow): TileType[] {
  if (f.phase !== 'placing') return []
  /*
   * Without a socket in hand there is nothing to judge against, so both are
   * offered and `placeTile` settles it when she taps. That is the opening
   * script's path — Fred asks for land on her behalf and has nowhere in mind.
   */
  if (!f.pending) return ['grass', 'water']
  /*
   * Never offer a kind that the socket would then override. A button that does
   * something other than what it shows is worse than no button — which is also
   * the answer to whether a ONE-BUTTON offer is honest. It is: it says what she
   * will get. Leaving the water button up where the rules will turn it into land
   * would teach a six-year-old that the water button is broken, and she would be
   * right.
   *
   * So the offer is DERIVED from the choke point rather than restating it. It
   * used to be a second list of conditions kept in step with `tileTypeFor` by
   * hand, and every rule added to one had to be remembered into the other — the
   * comment here said "the order below matches `tileTypeFor` exactly", which is a
   * promise a comment cannot keep. `landOffer` asks `landedType` what each button
   * would actually do and shows the ones that do what they say, so a rule can only
   * ever be added in one place. That now includes the last-resort backstop: where
   * water would leave her nowhere to grow, there is no water button to press.
   */
  const kinds = landOffer(f.island, f.pending)
  /*
   * Mountains last, so the two she has always known keep their places — a button
   * that moves is a button she has to re-find every time.
   *
   * ADDED HERE RATHER THAN IN `landOffer`, and that is the one place the choke
   * point above is deliberately not the whole story. Whether rock is REACHABLE is
   * a coast question and `canBeRock` answers it there; whether it is UNLOCKED is a
   * pacing question, and pacing lives in `balance.json`, which the coastline knows
   * nothing about. `canBeRock` is still asked rather than assumed: rock never sits
   * beside water, so at a socket touching one of her ponds the button would be a
   * lie, and this function exists only to show what `tileTypeFor` will really do.
   */
  if (rockUnlocked(f) && canBeRock(f.island, f.pending)) kinds.push('rock')
  return kinds
}

/**
 * What actually goes on a socket, whatever she picked.
 *
 * Joe's placement rules, in one place because they must never disagree:
 *
 *   - THE FLOOR, from playtesting: water never spends her last dry way out of her
 *     own fields. See `mustBeLand` — this is what stops her walling her island
 *     off from itself.
 *   - Two or more of her own water tiles round a socket and none of her fields,
 *     and it is water — otherwise she plugs a channel with a green hex.
 *   - Water only where the water cell can carry its whole beach, which is what
 *     lets her fields stay flat and uncut. See `drawableAsWater`: nineteen of the
 *     sixty-four neighbourhoods qualify, and the rest are ruled out by the
 *     arithmetic of an asset pack with no four-land-edge model.
 *
 * ...and behind all three, THE BACKSTOP: no placement may leave her unable to
 * grow. Where the settled answer would do that, the other kind lands instead.
 *
 * Every one of them is applied HERE rather than only in the offer, because the
 * opening script chooses a kind before it knows the socket. One choke point means
 * the island can never hold a tile the coastline cannot draw, and cannot reach a
 * state where nothing green can ever touch her land again. `tileOffer` now derives
 * its buttons from this function instead of restating its conditions, so the two
 * cannot disagree about what a tap will do.
 *
 * WHAT THE BACKSTOP REPLACED, because the history is the argument for it. The
 * dry-connection floor claimed here to make walling-in impossible; that claim was
 * FALSE, and a Fable review falsified it with a sixty-four-tap counterexample
 * replayed through this exact path. It is pinned in `tests/island/coast.test.ts`,
 * where it now asserts that the sequence is refused. Three gaps compounded and no
 * value of `LAND_FLOOR` closed them — `mustBeLand` yielding when grass is
 * infeasible, grass erosion going unguarded, and dry sockets simply not being the
 * witnesses that keep the island alive.
 *
 * "Unable to grow" is asked as `coast.hasOutwardCorridor` — is there still a dry
 * chain from her fields out to open sea? — and NOT as the one-ply question the
 * counterexample was filed against. One ply is not enough and measurement says so:
 * it can be walked down to a single witness that is a dead end, where every kind
 * ends the island and there is nothing left to refuse. The corridor cannot be
 * walked down, because a field can never break it. Read `coast.landedType` for the
 * induction, and for why refusing never leaves her with nothing to tap.
 *
 * The floor stays, and stays first: it is cheap, it fires early, and it keeps the
 * island in a shape where the backstop has almost nothing left to do — measured at
 * no firings at all up to a wetness of 0.65.
 */
export function tileTypeFor(f: Flow, a: Axial, chosen: TileType): TileType {
  /*
   * Rock answers FIRST, and answers only for itself.
   *
   * It satisfies the floor and the backstop on its own terms: rock is dry land
   * and cannot have water beside it, so a rock hex creates ways out of her fields
   * exactly as a field does (see `dryAfter`) and can never cut a corridor.
   * Delegating it to `landedType` would answer 'grass' to a girl who asked for a
   * mountain, in the one case where her mountain was already the right answer.
   *
   * Where the rules refuse it, grass — never water. She asked for land, and the
   * gentler of the two readings of "land" is the one that keeps her fields.
   */
  if (chosen === 'rock') return canBeRock(f.island, a) ? 'rock' : 'grass'
  return landedType(f.island, a, chosen)
}

/**
 * Pick a kind of land — and, if she already said where, put it there.
 *
 * The second question is gone. She taps a glowing socket, three kinds are
 * offered, and the one she picks is sited on the socket she tapped. Choosing
 * without a socket in hand still works and still waits for a tap, because the
 * opening script asks for land on her behalf and has nowhere in mind.
 */
export function chooseTile(f: Flow, t: TileType): Flow {
  if (f.phase !== 'placing') return f
  /*
   * She is changing her mind about a plot that is already standing.
   *
   * Joe, relaying the complaint while he was writing: *"she'd like to change her
   * mind if shes picked a wrong type of tile."*
   *
   * NOTHING IS LOST, and that is what makes this safe rather than generous:
   * `sumProgress` lives on the flow, not on the plot, so swapping what is being
   * built keeps every sum she has already answered. There is therefore no reason
   * to restrict it to a plot she has not started — a girl who has done nine sums
   * toward the wrong tile is exactly the girl who most needs this.
   *
   * It cannot be routed through `placeTile`, which refuses outright when a plot
   * stands (and must: a restored save can arrive mid-build, and siting over it
   * would throw away the site and the work both).
   */
  if (f.plot && f.pending && key(f.pending) === key(f.plot.at)) {
    return {
      ...f,
      phase: 'free',
      pending: null,
      chosen: null,
      // Judged on the island WITHOUT the plot, exactly as the first choice was,
      // so the rules cannot answer differently the second time.
      plot: { ...f.plot, type: tileTypeFor(f, f.plot.at, t) },
    }
  }
  if (f.pending) return placeTile({ ...f, chosen: t }, f.pending)
  return { ...f, chosen: t }
}

/**
 * Re-open the tile chooser for the plot already under construction.
 *
 * Entered by tapping the growing plot — she taps the thing she wants to change,
 * which needs no new button and nothing to discover. The plot stays exactly where
 * it is; only `phase` and `pending` move, so `tileOffer` asks the same question of
 * the same socket it asked the first time.
 */
export function askToRetype(f: Flow): Flow {
  if (!f.plot || f.phase !== 'free') return f
  return { ...f, phase: 'placing', pending: f.plot.at, chosen: null }
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
  /*
   * Buildable, not merely adjacent. A handful of sockets admit neither kind — see
   * `buildableSockets` — and siting on one of those is what used to force the
   * grass fallback that broke a neighbouring pond.
   */
  const legal = buildableSockets(f.island, sockets(f.island)).some(s => key(s) === key(a))
  if (!legal) return f

  const sited: Flow = {
    ...f,
    chosen: null,
    pending: null,
    // What the coastline can actually draw here, not merely what she tapped.
    plot: { at: a, type: tileTypeFor(f, a, f.chosen) },
    phase: 'free',
  }
  /*
   * Already paid for? Then it is finished the moment it is sited.
   *
   * `bankedTiles` is a CREDIT carried over from the previous flow, where a
   * finished tile could be earned and left unplaced (see save.ts). Its work
   * was done and must not be charged for again — nothing a child owns can be
   * lost (brief §19) — so one credit finishes one plot, and commitPlot spends
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
