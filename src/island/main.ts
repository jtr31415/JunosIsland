/**
 * Pet Island.
 *
 * Reading hatches eggs into pets. Maths earns land the child places themselves.
 * Those are the two verbs, and they are the same two the brief opens with.
 *
 * Everything about WHAT to read or count comes from the M0 modules, unchanged
 * and already proven identical to the game Juno plays today. This file only
 * connects them to a world.
 */
import * as THREE from 'three'
import { createWorld } from './scene'
import { createOverlay } from './overlay'
import { createPetField, SPECIES } from './pets'
import meadowDay from './lighting/presets/meadow-day.json'
import type { LightingPreset } from './lighting'
import { createEgg } from './egg'
import { createFred } from './fred'
import { createSign } from './sign'
import { createStage, dotsFilled, DOT_COUNT } from './stage'
import { createPropField, footprintBelow, WALKING_HEIGHT } from './world/props'
import { createPlotHost } from './plot'
import { createAlbum } from './album'
import { hatchProgress, landProgress, sumsForTile, pagesForEgg } from './flow'
import { balance, applyDevBalance, pagesRead } from './balance'
import { landPaused, eggsPaused, governorLine, restoreCount } from './governors'
import type { Nudge } from './governors'
import { OPENING, HATCH_LINES, TILE_QUESTION, fill } from './script'
import { loadIsland, saveIsland, wipeIsland } from './save'
import { advance, albumsToShow } from './species/opened'
import { createHarness } from './harness'
import type { Path } from './harness'
import { openingGate } from './opening'
import { commit, ceremony } from './ceremony'
import {
  askPin, askChoice, askConfirm, askWipe, showLearning, stageLabel,
  applyWordColours, WORD_COLOUR_CHOICES,
} from './grownups'
import type { Committed, Exits } from './ceremony'
import { createLocalStore } from '../platform/storage'
import { createDurableStore } from '../platform/durable'
import { openIdb } from '../platform/idb'
import { requestPersistence, shouldRequest } from '../platform/persistence'
import { createClock, createAdjustableClock } from '../platform/clock'
import { CHANNEL, isPreview, readFlags } from '../platform/flags'
import type { AdjustableClock } from '../platform/clock'
import type { PersistState } from '../platform/persistence'
import {
  backupFilename, readBackup, summarise, confirmText, download, pickFile,
} from '../platform/backup'
import {
  createFlow, tapEgg, tapSum, askForLand, cancelPlacing, challengePassed, chooseTile, tileOffer,
} from './flow'
import { bindWorldTaps } from './taps'
import {
  handleWorldTap, handleChallengePassed, handleChallengeDismissed,
} from './interactions'
import type { InteractionPorts } from './interactions'
import type { Flow } from './flow'
import type { TileType } from './world/grid'
import { toWorld } from './world/hex'
import type { Axial } from './world/hex'

import { createSpeaker } from '../platform/speech'
import { createBakedSpeaker } from '../platform/voice'
import { createSfx } from '../platform/audio'
import { defaultRng } from '../core/rng'
import { makeDeck } from '../core/decks'
import { makeCollectionDeck } from './collection'
import { GREEN, RED } from '../core/wordlists'
import { buildPool, buildNeighbours } from '../core/neighbours'
import type { ReadState } from '../core/generators/read'
import type { BuildState } from '../core/generators/build'
import type { SumState } from '../core/generators/sums'
import { dealReading, dealSum } from './deal'
import { petName } from '../core/names'

/** Injected at build time by Vite (see vite.island.config.ts). */
declare const __BUILD_STAMP__: string
const BUILD_STAMP = typeof __BUILD_STAMP__ === 'string' ? __BUILD_STAMP__ : 'dev'

/** Injected by Vite. See vite.island.config.ts and platform/flags.ts. */
declare const __CHANNEL__: string

/**
 * How long a finished page stays up before the next one takes its place.
 *
 * Deliberately short. The overlay has already held the finished page for its
 * own beat before handing over, so this is only the turn of the page — and
 * because finish() no longer tears the panel down, the old page is on screen
 * throughout rather than the child staring at a blank card.
 */
const PAGE_GAP_MS = 260

/**
 * How long a finished plot stays up showing its flourish.
 *
 * The tile itself is already real underneath by this point — this is purely
 * the last increment getting its moment before the scaffolding is removed.
 */
/**
 * How long the scaffolding survives after the plot is finished.
 *
 * DERIVED from the fly-back rather than set beside it: the scaffolding is
 * what performs the landing, so disposing it on an independent timer means
 * the two agree only by luck, and the tile would vanish mid-air the moment
 * either number moved.
 */
const PLOT_FAREWELL_MS = balance.stage.flyBackMs + 500

/**
 * How long the stage holds after the shell breaks.
 *
 * Long enough to MEET the friend: it pops up on the plinth as the shell
 * goes, and this is how long the child gets to look at it before the stage
 * dissolves and the friend walks out into the world. It was briefly cut to
 * 700ms when the beat was missing and the shot was of an empty turntable.
 */
const HATCH_HOLD_MS = balance.stage.hatchHoldMs

/** A promise that settles after n milliseconds. */
const wait = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

const canvas = document.getElementById('view') as HTMLCanvasElement

async function boot(): Promise<void> {
  /*
   * The Pet-o-matic takes over the whole page rather than sharing it.
   *
   * It is a judging surface, not a feature: every creature at once, under the
   * real lighting rig, so a palette is vetoed on the same three lights the
   * island uses. Behind the flag AND the preview channel, so the branch is not
   * reachable in production at all — `readFlags` returns everything off there
   * and does not consult the query string.
   */
  const early = readFlags(location.search)
  /*
   * `__CHANNEL__` first, and that ordering is the point rather than belt and
   * braces. The flag alone is a RUNTIME check, so Rollup cannot fold the
   * branch and the whole Pet-o-matic — three.js scene, loader, forty palettes
   * — was emitted as a chunk in the production build and precached by the
   * service worker. Unreachable, but shipped, on a tablet with a 5MB budget.
   * The build-time constant folds to false and the chunk is never emitted.
   */
  if (__CHANNEL__ !== 'production'
    && early.on('petOMatic') && location.search.includes('petomatic')) {
    const { runPetOMatic } = await import('./variants/petomatic')
    const { SPECIES: all } = await import('./pets')
    await runPetOMatic(canvas, all, meadowDay as LightingPreset)
    return
  }

  const world = await createWorld(canvas)
  /*
   * Fred speaks in Oliver's voice where a clip of that sentence was baked, and
   * in whatever voice the device has where one was not.
   *
   * `createBakedSpeaker` is a decorator, not a replacement: it is the same
   * `Speaker` the game has always been handed, so every one of the call sites
   * below is untouched and every line it cannot play reaches `createSpeaker`
   * exactly as it did before. Eleven of Fred's seventeen ledger lines have
   * clips; the teacher, the challenge words and the pet names have none and are
   * not meant to. See `src/platform/voice-lines.ts` for the table and for why
   * the other six cannot be baked at all.
   *
   * Kicked off here, this early, because `load()` fetches and decodes 628 KiB
   * before any line can play as Oliver, and a line spoken before it lands falls
   * back — correct, but audibly a different Fred. The wait below gives it the
   * head start; the fallback covers it if that is not enough.
   */
  const speech = createBakedSpeaker(createSpeaker())
  const voiceLoaded = speech.load()
  const sfx = createSfx()

  // The M0 learning engine, wired up exactly as the 2D game wires it.
  const drawGreen = makeDeck(defaultRng, GREEN)
  const drawRed = makeDeck(defaultRng, RED)
  const neigh = buildNeighbours(buildPool())
  const readStore: ReadState = { history: [], idx: -1 }
  const buildStore: BuildState = { history: [], idx: -1 }
  const sumStore: SumState = { history: [], idx: -1 }

  let flow: Flow = createFlow()   // replaced by the save below

  const pets = createPetField()
  world.scene.add(pets.group)
  world.pickables.push(pets.group)

  const props = createPropField()
  world.scene.add(props.group)

  /*
   * The plot under construction (spec §2). Sited as soon as the child picks a
   * socket, then GROWN by each sum, so arithmetic visibly becomes ground.
   *
   * THE LIFECYCLE LIVES IN `plot.ts`, behind ports. Three faults in two days have
   * been in this seam and not one of them was visible to the unit tests either
   * side of it: the plot builds correctly whatever it is told to build, the flow
   * records correctly what is being built, and every bug was in the sentence
   * between them. The host holds the rule that closes them — what stands on the
   * island tracks what the flow SAYS, so a plot they have retyped is rebuilt
   * rather than left standing there depicting their old answer.
   */
  const plots = createPlotHost({
    models: world.models,
    scene: world.scene,
    worldOf: a => world.worldOf(a),
    prop: name => props.load(name),
    setPickable: o => { world.setPlotPickable(o) },
    /*
     * Off the challenge stage before it is destroyed, or the stage is left
     * holding a corpse (the 28 July landmine). One route destroys a plot now, so
     * this is stated once rather than remembered at each caller.
     */
    unstage: g => { if (stage.holds(g)) { stage.release(); overlay.setStaged(false) } },
    farewellMs: PLOT_FAREWELL_MS,
  })
  /** Make the island show the plot this flow describes. */
  const showPlot = (state: Flow = flow): void => { plots.show(state) }

  const egg = createEgg()
  world.scene.add(egg.group)
  world.pickables.push(egg.group)

  const fred = createFred()
  world.scene.add(fred.group)
  world.pickables.push(fred.group)
  /*
   * Fred is SOLID, and he moves.
   *
   * The scenery is published once when it grows; he potters about his patch
   * between hops, so a circle recorded at start-up would block empty grass and
   * let pets through the frog. Asked afresh each frame instead — the same
   * omission the egg had, which is why pets walked through that too.
   */
  pets.setMovers(() => [fred.obstacle()])

  /*
   * Their signpost, on the home tile. The one place the world says out loud
   * that it belongs to them — and it is IN the island rather than on top of
   * it, so the child can turn the camera round it and it is still there.
   */
  // Lettered once the save has been read; see below.
  const sign = createSign('')
  world.scene.add(sign.group)

  /*
   * The challenge stage (§6): the work and its reason, side by side.
   *
   * Its own little scene, drawn into a scissored corner of the same canvas
   * after the world. The egg or the growing plot is RE-PARENTED onto its
   * turntable for the duration, so the piece they watch is literally the one
   * they own rather than a stand-in copy.
   */
  const stage = createStage()
  world.onOverlayFrame(renderer => {
    // Only when it is actually holding something — see stage.isShowing().
    if (!stage.isShowing()) return
    const rect = overlay.stageRect()
    if (rect) stage.render(renderer, rect)
  })

  /* Saves. One profile for now; profiles proper arrive in M3. */
  /*
   * Two copies, a checksum and eight snapshots (Phase 3 item 1).
   *
   * Presents the same SaveStore the island has always spoken, so nothing below
   * this line knows durability happened. IndexedDB may be absent — private
   * browsing, a blocked database — and the game plays on with one copy rather
   * than refusing to start.
   */
  /*
   * One clock, asked by everything that cares what day it is (item 2).
   *
   * Adjustable only under ?debug, so a production session gets the real thing
   * and no way to move it. Everything downstream reads `clock.now()` rather
   * than Date.now(), which is what makes the visitor rollover and difficulty's
   * two-distinct-days gate testable without waiting for real midnight.
   */
  /*
   * Which build this is, and what it may switch on (item 4).
   *
   * In production `readFlags` returns everything off and does not consult the
   * query string at all, so no URL a child could arrive at can turn on an
   * unfinished feature. The debug tooling rides the same switch.
   */
  const flags = readFlags(location.search)
  const debugging = isPreview() && (flags.on('devClock') || location.search.includes('debug'))

  /*
   * Compressed pacing, when asked for and only in preview. Awaited before
   * anything reads a cost, or the first tile would be priced from the real
   * curve and the rest from the overlay.
   */
  const devBalance = await applyDevBalance(flags.on('devBalance')
    && location.search.includes('fast'))
  const clock: AdjustableClock | ReturnType<typeof createClock> = debugging
    ? createAdjustableClock(Date.now())
    : createClock()

  const store = createDurableStore(createLocalStore(), {
    idb: await openIdb(), now: () => clock.now(),
  })
  const PROFILE = 'juno'
  /** Their name where the script wants one, or a friendly word if they skipped. */
  const child = (): string => childName || 'friend'
  const loaded = await loadIsland(store, PROFILE)

  /*
   * "I found your island!" — never an error a child reads.
   *
   * The primary save failed its checksum and a snapshot was used instead. The
   * child is told something reassuring happened, not that something broke; the
   * detail is in the console for a grown-up.
   */
  const load = store.lastLoad(PROFILE, 'save')
  if (load?.outcome === 'restored') {
    setTimeout(() => overlay.toast('I found your island!'), 900)
  }

  /*
   * Ask the browser to keep their island, once they own something worth keeping.
   *
   * Storage that is not marked persistent can be evicted under pressure with
   * no warning to anyone. Asked after the first friend or the first tile
   * rather than at boot: some browsers prompt, and a prompt on the opening
   * screen is the one most likely to be dismissed.
   */
  /*
   * The harness (A3): the single place that decides what they may be dealt, and
   * the only thing that hears how it went.
   *
   * `attainment` is the record it mutates and `persist()` writes; the harness
   * holds it by reference rather than copying, so a tick from the grown-ups
   * panel is live at the very next deal without anything having to be told.
   */
  /*
   * ON THE CLOCK, and not on `Date.now()`. `createHarness` defaults its `now`
   * to the wall clock, and taking that default here would have quietly put the
   * one calendar read the harness makes — which DAY an attempt's session
   * belongs to — outside the clock everything else on this island is wired to.
   * The debug panel's advance-day would move the visitor and the save and
   * leave attainment's sessions sitting in today, so A6's consistency measure
   * (last three sessions, two distinct days) could not be walked without
   * waiting for real midnight. clock.ts's own header names that gate as
   * calendar time, which is to say as its business.
   */
  const attainment = loaded.attainment
  const harness = createHarness(attainment, () => clock.now())
  /*
   * A5's reserved space: the once-only moments this island has already had.
   * Nothing reads it in Run A — it is carried and re-written so that INTRO-TEN
   * can be a string Run C adds, rather than a migration Run C has to write.
   */
  const onceFlags = loaded.onceFlags

  /**
   * Which albums they have open, advanced the moment the save is read.
   *
   * ADVANCED HERE AND NOT IN `save.ts` because opening one is a DRAW, and a
   * loader has no business consuming randomness — the same separation
   * `collection.ts`'s deck keeps a hundred lines below. It is done at boot
   * rather than lazily when the album opens so that the four are decided once
   * and written on their next save, whether or not they ever tap the book: a
   * roster that materialised only on first view would be a different four for
   * every child who never opened it.
   *
   * Declared ABOVE `persist` on purpose. `persist` closes over it, and a `let`
   * declared after would be a temporal-dead-zone fault waiting for the first
   * save that beats this line.
   */
  let opened = advance(loaded.flow.pets.map(p => p.species), loaded.opened, defaultRng)
  /** Fold in anything a new friend has just unlocked. Idempotent; see `advance`. */
  const refreshAlbums = (): void => {
    opened = advance(flow.pets.map(p => p.species), opened, defaultRng)
  }

  let persistGranted: PersistState = loaded.persistGranted
  async function askToKeepIt(): Promise<void> {
    if (!shouldRequest(persistGranted, flow.pets.length, flow.tilesEarned)) return
    persistGranted = await requestPersistence()
    void persist()
  }
  /*
   * Whether Fred's story has been shown to this profile — and the only thing
   * that may answer that question.
   *
   * It was a `let` set on the story's LAST line, which is a line most sessions
   * never reach: the story hands over to the child at beat six and returns,
   * they can back out of that round, and a reload can land on any beat. All of
   * those left the flag false, so the opening replayed on every single load.
   * See opening.ts — the gate claims it the moment the story starts.
   */
  const opening = openingGate(loaded.openingSeen, () => persist())
  /*
   * What they are called. Empty until they have been asked, which happens once,
   * just before the story. Falls back to a neutral word rather than blocking:
   * a name prompt must never be a wall between a child and their game.
   */
  let childName = loaded.childName
  sign.setName(childName || 'my')
  // The tab follows their name too, once they have given one (#10).
  if (childName) document.title = `${childName}'s Island`

  /*
   * Colour comfort, applied before the first word is ever dealt.
   *
   * It is painted here at boot rather than when a round opens, because the
   * rule lives on <body> and a class arriving after the cards are on screen
   * would repaint them in front of the child.
   */
  let calmColours = loaded.calmColours
  applyWordColours(document.body, calmColours)

  const persist = (): Promise<void> =>
    saveIsland(store, PROFILE, flow, opening.seen(), childName, persistGranted,
      attainment, onceFlags, calmColours, opened)

  /**
   * Save, wait for it, and come back with proof.
   *
   * `persist()` was `void saveIsland(...)` — fire and forget — so "save first,
   * celebrate second" was true in the order of the source and false in the
   * order of events: the ceremony started while the write was still in flight,
   * which is the window the lost-hatchling bug lived in. Awaiting it is the
   * fix; the receipt is what makes forgetting to await it impossible.
   */
  const commitState = (): Promise<Committed<Flow>> => commit(flow, () => persist())

  /**
   * What every ceremony holds shut, in one place.
   *
   * Both sites hand-rolled this, and the hatch one had no `finally` — a throw
   * between the lock and the close left the world busy with no overlay, every
   * tap dead until a reload. `ceremony()` releases these however the body ends.
   */
  const exits: Exits = {
    // The camera's pivot is held too: refresh() runs INSIDE both ceremonies,
    // and a shot held on purpose must not start gliding because something
    // re-rendered underneath it.
    lock() { inCeremony = true; overlay.setBusy(true); world.holdCamera(true) },
    unlock() { inCeremony = false; overlay.setBusy(false); world.holdCamera(false) },
  }

  flow = loaded.flow

  /**
   * Who is in the egg: someone they have not met, while there is anyone left.
   *
   * Joe, on the shipped build: *"a second animal of the same type has just
   * spawned. that must not happen."*
   *
   * This line used to build a `makeMemoryDeck`, which answered an EARLIER
   * report — *"investigate: two cats spawned in a row"* — by forbidding the
   * last `speciesMemory` hatches. That killed the clumping and left the actual
   * complaint untouched, because a window of five over a pack of 24 leaves 19
   * candidates on every draw and cannot see which of them are already standing
   * on their island. At eight pets, about two hatches in five were a duplicate:
   * not a collision, the ordinary case on a schedule. Measured, before the fix,
   * over 24 hatches of the real state machine: 19 distinct animals and five
   * repeats.
   *
   * `makeCollectionDeck` states the rule in the terms it is really about —
   * never deal an animal they already have — and falls back to exactly the old
   * window once they have met all 24, so PB-036 holds and an egg never has
   * nothing to give (JT-027 is the open question about what that ought to
   * become). See `collection.ts` for why widening the window is not this fix.
   *
   * Built HERE, after the save, because their island is where the collection
   * lives: `flow.pets` is the list of who has come home, in order. Nothing
   * about the deck is persisted and nothing needs to be — priming it from what
   * they already own costs no save change (PHASE3-HANDOVER §6: a schema bump
   * waits for the first `v*` tag). Without the priming the deck would start
   * empty on every load and the bug walks back in through the front door:
   * reload, hatch, an animal they already had.
   */
  // Plain `string` in, plain `string` out: a species read back out of a save is
  // a string rather than the literal union SPECIES infers, and priming must be
  // able to take it as read.
  const drawSpecies = makeCollectionDeck(
    defaultRng, SPECIES, balance.pets.speciesMemory)
  drawSpecies.remember(flow.pets.map(p => p.species))

  /**
   * And decided IN ADVANCE, so it can be fetched while the child is reading.
   *
   * Joe: "preloaded the animal otherwise there is a render delay and
   * disappointment." The species used to be drawn on the line that hatched it,
   * which left no time at all: the fetch started as the shell broke and the
   * plinth was empty for as long as the network took.
   *
   * DECIDING EARLIER rather than guessing. Warming a "likely" species would
   * hit one time in 19 and waste the download the other 18 — and warming the
   * whole pack is 3.21MiB measured, against a 5MB budget on the target tablet.
   * Committing to the next one makes the preload right every time, for one
   * file. Which is exactly why the deck may not be consulted again at hatch
   * time: the friend who is WARMED has to be the friend who HATCHES, or the
   * 569.9ms cold delay that was just measured out comes straight back. Every
   * `drawSpecies()` in this file is seated into `nextSpecies` on the spot, and
   * `tests/island/species.test.ts` pins that.
   *
   * It costs nothing to draw early: the old code drew a species on EVERY
   * passed page and threw it away on the four in five that did not hatch.
   * This draws one and keeps it until it is spent.
   */
  let nextSpecies = drawSpecies()

  const overlay = createOverlay(document.body, {
    speech, sfx,
    onPassed: more => { void passed(more) },
    /*
     * A3 CLOSES THE CIRCUIT A2 LEFT OPEN.
     *
     * A2 computed an attempt per target, correctly and completely, and had
     * nowhere to send it: the sink was declared optional precisely because the
     * harness had not landed, so every answer Juno gave was measured and then
     * dropped. This one line is where measurement starts existing.
     *
     * Deliberately separate from `onPassed`: what they ANSWERED and what they
     * were PAID for are different questions, and a find page emits several of
     * the first against one of the second.
     */
    onAttempt: evt => { harness.recordAttempt(evt) },
    onDismissed: () => {
      stageFor(null)
      // Leaving costs nothing (brief section 18) — but the story must not stay
      // armed, or an unrelated hatch later would resume it out of nowhere.
      openingResumeAt = -1
      flow = handleChallengeDismissed(flow)
      /*
       * WIRING (break governor). A child who walks out of their third mashed
       * page in a row is the clearest case the watch has, and this is the one
       * place the island's own greeting would otherwise talk over Fred. Pinned
       * by tests/island/stretch.test.ts.
       */
      if (!offerAStretch()) {
        overlay.say('Tap the egg to read to it — or tap the island for land!')
      }
      refresh()
    },
  })

  /**
   * Somewhere the egg can sit in the open, on green ground, on ANY land tile.
   *
   * Three rules, each of them learned the hard way:
   *
   *   - Clear of everything, not just of obstacles. Pets step over a grass
   *     tuft so a tuft is no obstacle to them, but an egg standing in one is
   *     half-buried and cannot be tapped cleanly — and tapping the egg is the
   *     whole game. So this uses clutter(), which counts the ground cover too.
   *   - On GREEN ground. Coast tiles cut the water side of the hex away
   *     entirely, so an offset that was harmless on a full hex now hangs the
   *     egg over open sea.
   *   - Anywhere. It used to prefer the newest, most coastal tile, which on a
   *     grown island wedged it into whatever had just sprouted there. The
   *     island is small enough that any clear spot is a findable spot.
   *
   * Deterministic: the same island always puts the egg in the same place, so
   * it does not hop about between reloads.
   */
  /**
   * Set once the egg has actually washed ashore.
   *
   * The arrival used to be fired at boot, immediately, while `placeEgg` waited
   * on props.sync to finish loading a few dozen models. So the egg flew in at
   * the origin — under Fred — landed there, and only then teleported to the
   * spot it belongs in. Which looks precisely like appearing out of nowhere,
   * which is what Joe reported twice.
   */
  let eggHasLanded = false

  function placeEgg(): void {
    /*
     * Not while it is on the stage.
     *
     * setPosition writes WORLD coordinates, and a staged egg is parented to
     * the turntable — so re-siting mid-round flung it several units off the
     * plinth to orbit the vignette. refresh() runs after every completed page,
     * so this fired constantly. Its place on the island cannot change while
     * the child is looking at it anyway; it is re-sited when it comes home.
     */
    if (stage.holds(egg.group)) return
    const clutter = props.clutter()
    const size = world.models.size

    const tiles: Axial[] = []
    for (const [k, type] of flow.island.tiles) {
      /*
       * Fields only, matching `governors.spaceSurplus`. A mountain hex is covered
       * by its own mound, so siting the egg there would bury it in a hillside —
       * exactly the fault Joe reported as "frog, egg, animals into mountains".
       */
      if (type !== 'grass') continue
      const parts = k.split(',').map(Number)
      tiles.push({ q: parts[0] as number, r: parts[1] as number })
    }
    if (!tiles.length) tiles.push({ q: 0, r: 0 })
    // Stable order, so the choice below cannot drift with Map iteration.
    tiles.sort((a, b) => (a.q - b.q) || (a.r - b.r))

    /** How much open space a spot has around it — bigger is better. */
    const clearance = (x: number, z: number): number => {
      if (world.surface.groundAt(x, z) !== 'green') return -1
      let worst = Infinity
      for (const o of clutter) {
        worst = Math.min(worst, Math.hypot(x - o.x, z - o.z) - o.r)
        if (worst <= 0) return -1
      }
      return worst
    }

    // The egg's own footprint, plus room for a finger either side of it.
    const NEEDED = size * 0.30

    /**
     * Put it there — and, the first time, let it wash ashore.
     *
     * Also republishes the obstacle list, because the egg is SOLID. Pets used
     * to walk straight through it: `setObstacles` was given the scenery and
     * nothing else, so the one object on the island the child is meant to walk
     * up to and tap was the one thing with no substance.
     */
    const settle = (x: number, z: number): void => {
      egg.setPosition(x, z)
      publishObstacles()
      if (!eggHasLanded) { eggHasLanded = true; egg.arrive() }
    }

    let best: { x: number; z: number; room: number } | null = null
    for (const a of tiles) {
      const w = toWorld(a, size)
      for (let i = 0; i < 13; i++) {
        // A coarse spiral over the tile rather than one ring, so a tile with
        // a clump on one side is still usable on the other.
        const ang = (i / 13) * Math.PI * 2 * 3
        const rad = size * (i === 0 ? 0 : 0.14 + (i / 13) * 0.42)
        const x = w.x + Math.cos(ang) * rad
        const z = w.z + Math.sin(ang) * rad
        const room = clearance(x, z)
        if (room >= NEEDED) { settle(x, z); return }
        if (room > 0 && (!best || room > best.room)) best = { x, z, room }
      }
    }

    // Nowhere roomy: take the best of a bad lot rather than none at all.
    if (best) { settle(best.x, best.z); return }
    const home = toWorld({ q: 0, r: 0 }, size)
    settle(home.x, home.z)
  }

  /**
   * Everything a pet must walk around: the scenery, the egg, and the sign.
   *
   * The egg was missing, so pets walked through it — the one object on the
   * island a child is meant to walk up to and tap had no substance at all.
   * Measured at walking height like the scenery, so the rule stays one rule.
   *
   * The signpost was the third of the same kind, carded for Phase 5. It never
   * moves, so its keep-out is measured once inside `sign.ts` rather than asked
   * for per frame the way Fred's is.
   */
  function publishObstacles(): void {
    const solid = [...props.obstacles(), sign.obstacle()]
    if (egg.group.visible && !stage.holds(egg.group)) {
      solid.push({
        x: egg.group.position.x,
        z: egg.group.position.z,
        r: footprintBelow(egg.group, WALKING_HEIGHT),
      })
    }
    pets.setObstacles(solid)
  }

  function refresh(): void {
    // The plot's coord is passed so its socket stops glowing underneath it.
    world.setIsland(flow.island, flow.plot?.at ?? null)
    void props.sync(flow.island, world.models.size, world.surface).then(() => {
      publishObstacles()
      // Re-site the egg now the scenery is known: obstacles() is empty until
      // the props have loaded, so the first placement cannot see the trees.
      if (flow.phase !== 'placing') placeEgg()
    })
    // Fred sits on the home rock, a little off centre so the egg and any pet
    // have room. Slightly larger than a collectible pet, never tile-sized.
    const home = world.worldOf({ q: 0, r: 0 })
    fred.group.position.set(home.x - world.models.size * 0.28, 0, home.z + world.models.size * 0.30)
    fred.group.rotation.y = Math.PI * 0.28      // face the default camera
    // Beside Fred on the home rock, facing the same way, clear of the egg.
    sign.group.position.set(home.x + world.models.size * 0.34, 0, home.z + world.models.size * 0.30)
    sign.group.rotation.y = Math.PI * 0.28
    // He lives on the home rock, not at a point on it.
    fred.setHome(home.x - world.models.size * 0.22, home.z + world.models.size * 0.24,
      world.models.size * 0.34)
    /*
     * Always visible, because they are now how the child asks for land at all.
     * A control that only appears once you have already used it is not a
     * control, it is a reward.
     */
    world.showSockets(true)
    void pets.sync(flow.pets, flow.island, world.models.size)
    if (flow.phase !== 'placing') placeEgg()
    egg.setProgress(hatchProgress(flow))
    renderOffer()
    renderProgress()
    showPlot()
    persist()
  }

  /* ---------- progress ----------
   * A hatch now costs five reading rounds and a tile ten sums, so the child
   * needs to SEE that they are getting somewhere - otherwise the work feels
   * like it goes nowhere, which is the opposite of what the pacing is for.
   */
  const progressBar = document.createElement('div')
  progressBar.className = 'chunk progress'
  progressBar.innerHTML =
    '<span class="progress-row"><span class="progress-icon">\u{1F95A}</span>' +
    '<span class="progress-track"><i id="eggFill"></i></span></span>' +
    '<span class="progress-row"><span class="progress-icon">\u{1F33F}</span>' +
    '<span class="progress-track"><i id="landFill"></i></span></span>'
  document.body.append(progressBar)

  function renderProgress(): void {
    const egg = document.getElementById('eggFill')
    const land = document.getElementById('landFill')
    if (egg) egg.style.width = Math.round(hatchProgress(flow) * 100) + '%'
    if (land) land.style.width = Math.round(landProgress(flow) * 100) + '%'
  }

  /* ---------- the grown-up gear ----------
   *
   * Everything the child owns is behind this: every pet, every name, every
   * tile they counted up. Brief §19 says none of it can be lost, and a plain
   * "reset island" button sitting on the play surface is one curious tap away
   * from all of it — which is not a guardrail, it is a trap with a label.
   *
   * So it goes behind the same DDMM PIN the 2D game uses (v0:2095-2122): a
   * grown-up knows today's date, a six-year-old does not reliably, and it
   * needs no account, no server and no secret to store. The gear itself stays
   * visible, because a hidden control a parent cannot find is its own
   * problem.
   */
  const gearBtn = document.createElement('button')
  gearBtn.className = 'dev-reset'
  gearBtn.textContent = '⚙'
  gearBtn.title = 'Grown-ups'
  gearBtn.setAttribute('aria-label', 'grown-ups menu')
  gearBtn.onclick = () => { void grownUps() }

  /**
   * The grown-ups' door, in the game's own interface.
   *
   * Was a `prompt()` for the PIN, another `prompt()` asking someone to type a
   * menu number, and a `confirm()`. On a tablet those are grey system slabs in
   * a different typeface that cannot be styled and read as the page having
   * broken — and a text prompt for four digits summons a full keyboard over
   * half the screen. It is the one surface here a PARENT uses, so it should
   * not be the one surface that looks unfinished.
   */
  async function grownUps(): Promise<void> {
    /*
     * From the CLOCK, so advance-day does not lock a grown-up out of the gear
     * in the middle of a debug session. In production the clock is the real
     * one, so this is still simply today's date (v0:1080).
     */
    const d = new Date(clock.now())
    // DDMM, exactly as v0:1080 computes it.
    const pin = String(d.getDate()).padStart(2, '0')
      + String(d.getMonth() + 1).padStart(2, '0')
    if (!await askPin(document.body, pin)) return

    const n = flow.pets.length
    const friends = `${n} friend${n === 1 ? '' : 's'}`
    const choice = await askChoice(document.body, 'Grown-ups', [
      { id: 'learning', label: 'What they are working on', detail: 'what they are dealt, and how it is going' },
      { id: 'colours', label: 'Word colours', detail: calmColours ? 'all green' : 'green and red' },
      { id: 'backup', label: 'Back up to a file', detail: `${friends} and this island` },
      { id: 'restore', label: 'Restore from a backup', detail: 'replaces what is here' },
      { id: 'story', label: 'Play the story again', detail: 'the opening, from the top' },
      { id: 'wipe', label: 'Start again', detail: 'choose what to clear' },
    ])
    if (choice === null) return

    if (choice === 'learning') { await learning(); return }
    if (choice === 'colours') { await wordColours(); return }
    if (choice === 'backup') { await backup(); return }
    if (choice === 'restore') { await restore(); return }
    /*
     * Brief §3 wants the story replayable forever. It used to be a tap on
     * Fred, which Joe hit mid-game — the intro restarted and walked the child
     * through challenges that handed over an animal and then a tile. Still
     * available, now behind the PIN where a curious tap cannot reach it.
     */
    if (choice === 'story') { void runOpening(); return }

    /*
     * THREE TICK-BOXES, NOT ONE RED BUTTON (PB-047).
     *
     * Joe's card: *"it should be at least a question to the adult ... wipe
     * should offer 3 options with tick boxes: 1. wipe island and animals, 2
     * wipe academic progress ... 3 wipe kids name."* It used to be
     * all-or-nothing, so a parent who wanted their child's maths to start over
     * had to destroy the child's animals to get there — and animals are the
     * thing brief §19 is most emphatic a child cannot lose.
     *
     * `askWipe` includes its own confirm and only resolves after it, so a
     * value here means a grown-up has seen the ticked list read back and said
     * yes. Which field belongs to which box lives in `save.ts:wipeSave`, next
     * to the reasoning; nothing about the split is decided in this file.
     *
     * Reloaded rather than un-built in place: half an island torn down while
     * the renderer is still holding its meshes is a much larger surface than a
     * fresh boot from the save that was just written.
     */
    const picked = await askWipe(document.body, {
      pets: flow.pets.length,
      tiles: flow.island.tiles.size,
      childName,
    })
    if (!picked) return
    void wipeIsland(store, PROFILE, picked).then(() => location.reload())
  }

  /**
   * Red word cards, or green ones.
   *
   * Written to the disk BEFORE the screen changes, which is the same order the
   * learning panel's tick uses (grownups.ts, A5) and for the same reason: a
   * grown-up who sees the colours change has been told the choice is kept, and
   * if the write failed that is a lie they will only discover on the next
   * reload. On a failed write nothing changes and nothing is claimed.
   */
  async function wordColours(): Promise<void> {
    const picked = await askChoice(document.body, 'Word colours', WORD_COLOUR_CHOICES)
    if (picked === null) return
    const wanted = picked === 'green'
    if (wanted === calmColours) return
    const was = calmColours
    calmColours = wanted
    try {
      await persist()
    } catch {
      calmColours = was
      return
    }
    applyWordColours(document.body, calmColours)
  }

  /**
   * The capability model and the report, in Joe's hands (A4/A6).
   *
   * Everything the panel can change goes through the HARNESS, never into
   * `attainment` directly: it is the single choke point for that record, and a
   * panel that mutated the object itself would be a second set of rules that
   * has to agree with the first — including the one that refuses the last
   * untick, which is the only thing standing between a tap on a plot and
   * nothing happening.
   */
  async function learning(): Promise<void> {
    await showLearning(document.body, {
      attainment,
      /*
       * THE ISLAND'S OWN harness, not one the panel builds for itself. It
       * reads B's gate for "what Auto would do", and that gate turns on the
       * day — so a stand-in would answer off the wall clock while the game
       * ran on `clock`, and would be a second harness over one record, which
       * `tests/island/barrier.test.ts` forbids outright.
       */
      harness,
      setTicked: (path, stage, ticked) => harness.setTicked(path, stage, ticked),
      canUntick: (path, stage) => harness.canUntick(path, stage),
      setMode: (path, mode) => harness.setMode(path, mode),
      /*
       * Through a receipt, not through a bare `persist()`.
       *
       * A5: *"the tick action persists via Committed token before any
       * announcement plays."* Minting the token is what forces the write to be
       * AWAITED rather than fired off, and the awaited write is the whole rule
       * here: the row does not show a tick until the disk already holds it.
       *
       * It commits the ATTAINMENT and not `commitState()`'s flow, for two
       * reasons that happen to agree. The value in a receipt is meant to be the
       * thing that was saved, and what a tick saves is this record. And
       * `commitState()`'s receipts are counted one-for-one against ceremonies
       * (barrier.test.ts) because an unspent one there means something was
       * awarded and then celebrated by hand — a panel a parent reads awards
       * nothing and celebrates nothing, so it must not be minting from that
       * pool.
       */
      persist: async () => { await commit(attainment, () => persist()) },
      stageLabel,
    })
  }

  /**
   * Off the device, into a file the grown-up keeps.
   *
   * The only export route there is: brief §19 permits no accounts and no
   * network calls beyond static hosting, so this file is the difference
   * between a lost tablet costing an afternoon and costing everything a child
   * has ever built.
   */
  async function backup(): Promise<void> {
    // Flush first. Backing up a save that is one ceremony out of date is a
    // subtle way of losing exactly the thing they just earned.
    await persist()
    const env = await store.envelope(PROFILE, 'save')
    if (!env) { overlay.toast('Nothing to back up yet'); return }
    download(backupFilename(childName, new Date(clock.now())), JSON.stringify(env, null, 2))
    overlay.toast('Backup saved')
  }

  /**
   * Back from a file, with the current island kept in case of a mistake.
   *
   * Every failure here is "nothing happened". An import is the one moment a
   * parent can destroy an island on purpose, so a wrong file picked in a hurry
   * must not leave a half-applied save behind.
   */
  async function restore(): Promise<void> {
    const text = await pickFile()
    if (text === null) return

    const incoming = readBackup(text)
    if (!incoming) { overlay.toast("That file isn't a Pet Island backup"); return }

    const current = await store.envelope(PROFILE, 'save')
    const summary = summarise(incoming)
    const mine = current
      ? summarise(current)
      : { name: childName || 'unnamed', savedAt: '', pets: flow.pets.length }
    const sure = await askConfirm(document.body, 'Restore a backup?',
      confirmText(summary, mine), 'restore it', true)
    if (!sure) return

    /*
     * restore() verifies the backup against its own checksum before adopting
     * it, and throws rather than laundering a damaged file into a valid save.
     * Caught here so a bad backup is a message, never a broken island.
     */
    try {
      await store.restore(PROFILE, 'save', incoming)
    } catch {
      overlay.toast('That backup is damaged — nothing was changed')
      return
    }
    location.reload()
  }
  document.body.append(gearBtn)

  /*
   * Build stamp. Tiny and dim, but it turns "is this the new build?" from a
   * guess into a glance — which matters because a stale service worker
   * produced several phantom regressions during development.
   */
  const stamp = document.createElement('div')
  stamp.className = 'dev-stamp'
  // The channel is on the stamp because 'is this the build they play?' is
  // the first question anyone looking at a screenshot needs answered.
  stamp.textContent = BUILD_STAMP + ' · ' + CHANNEL
    + (devBalance ? ' · fast' : '')
  stamp.title = 'build'
  document.body.append(stamp)

  /* ---------- the album ---------- */
  /*
   * ONE wiring site, and every port is mandatory rather than optional.
   *
   * Each of these has a control on the pop-out card, so a port quietly missing
   * would be a button that quietly does nothing — the exact shape of the four
   * dead features HANDOFF §5 lists. `AlbumWorld` requires all six, so tsc
   * catches a forgotten wire; `tests/island/album.test.ts` pins the two that
   * types cannot express.
   */
  const album = createAlbum(document.body, speech, {
    /*
     * The island's OWN loader and cache. Not the album's.
     *
     * `pets.preview` clones the shared prototype, which has already had
     * `wearFaceUVs` applied — so the friend on the card is literally the friend
     * on the island, and it stays right the day item 7 dresses anybody.
     *
     * THIS NOW FEEDS THE GRID'S THUMBNAILS TOO, which is PB-055. Until then the
     * album kept a second `GLTFLoader` for the little pictures, so opening it
     * could re-fetch up to 24 GLBs the island was already holding — and those
     * copies missed the face-decal fix, because only the shared prototype gets
     * it. One port now feeds both, so there is one cache, one download and one
     * patched model per species. See `createPortraitRenderer` in `album.ts`.
     */
    preview: species => pets.preview(species),
    /*
     * WHERE THE FRIEND IS NOW — and this is the whole of "find it on the map".
     *
     * NOT `flow.pets[].at`, which is where it HATCHED. Wandering happens on the
     * live scene-graph roots inside `pets.ts` and is never written back to the
     * flow, so the hatch spot is a different tile on any grown island. This is
     * the one port that had to be added to `pets.ts` for this feature.
     */
    livePosition: id => pets.positionOf(id),
    // The fallback, for a friend whose ~140KB GLB has not landed yet. Better
    // than a button that does nothing on a slow tablet.
    hatchPosition: pet => world.worldOf(pet.at),
    focusOn: point => world.focusOn(point),
    /*
     * One renderer and one frame loop.
     *
     * The pop-out's turntable draws through the world's own, exactly as the
     * challenge stage does. A second live GL context is what `scene.ts` calls
     * "the expensive way to do this" on the target tablet.
     */
    onFrame: fn => world.onFrame(fn),
    onOverlayFrame: fn => world.onOverlayFrame(fn),
  })
  const albumBtn = document.createElement('button')
  albumBtn.className = 'chunk chunk-button album-button'
  albumBtn.textContent = '\u{1F4D6} friends'
  albumBtn.setAttribute('aria-label', 'open the album of friends')
  albumBtn.onclick = () => album.open(flow.pets, albumsToShow(opened))
  document.body.append(albumBtn)

  /* ---------- the two verbs ---------- */

  /**
   * Open a challenge ONLY if the flow transition actually moved us into one.
   *
   * Every wiring bug found at the M1 gate had the same shape: a transition
   * no-ops (wrong phase), main.ts opens the challenge anyway, the child does
   * the whole round, and challengePassed then matches no branch — so the child
   * nothing for real work. Asserting the phase here turns that entire class of
   * mistake into a visible nothing instead of a swallowed something.
   */
  /**
   * A reading page. Pages alternate find and build (slice-1 spec §3), so
   * practice is never all one shape — finding a heard word and building it
   * from graphemes are different skills, and the 2D game teaches both.
   *
   * Which kind comes next is derived from how many pages this egg has already
   * taken, so it is stable across a reload rather than random.
   */
  /**
   * Put the reason for the work on the stage, and take it off again.
   *
   * Reading stages the EGG, maths stages the plot under construction. Nothing
   * is staged if there is nothing to show — a sum with no sited plot would
   * otherwise present an empty plinth, which reads as broken.
   */
  function stageFor(kind: 'read' | 'sum' | null, state: Flow = flow): boolean {
    /*
     * Build the plot BEFORE looking for it.
     *
     * The ports fire before the caller has assigned `flow` — deliberately, so
     * a handler cannot read a pre-transition phase — which means that on the
     * very tap that sites a plot, showPlot() has not run yet and there is
     * nothing to show.
     */
    if (kind === 'sum') showPlot(state)

    /*
     * THE BUILD HAPPENS IN REAL SPACE.
     *
     * A tile under construction is NOT lifted onto the vignette's turntable.
     * It hovers over its own socket, on the real island, with the place it is
     * going visible underneath it the whole time — Joe's call, and the right
     * one: a vignette with its own grass and sky behind it says "here is a
     * diagram of your tile", whereas floating over the island itself says
     * "here is your tile, arriving".
     *
     * The split layout still applies, so the panel takes one side and the
     * world shows through the other. Nothing is drawn into that gap: the
     * stage slot is transparent, and what the child sees there IS the island.
     */
    /*
     * Both the egg and the tile go on the turntable — which is now a
     * TRANSPARENT container, so they read as floating freely over the child's
     * island rather than sitting in a box with its own grass and sky.
     */
    const piece = kind === 'read' ? egg.group
      : kind === 'sum' ? plots.current()?.group ?? null
        : null
    stage.show(piece ?? null, world.scene)
    if (!piece) return false

    // An egg stands up; a tile lies flat and wants looking down on.
    if (kind === 'read') stage.frame(0.55)
    else stage.frame(world.models.size, 0.15, 1.0)
    refreshDots(kind, state)
    return true
  }

  /** "How much longer", with no numbers (§6). */
  function refreshDots(kind: 'read' | 'sum' | null, state: Flow = flow): void {
    // §6: "optional via balance flag", and §8 wants the flag consulted.
    if (!balance.stage.progressDots) { overlay.setDots(0, 0); return }
    if (kind === 'read') {
      overlay.setDots(dotsFilled(state.readProgress, pagesForEgg(state)), DOT_COUNT)
    } else if (kind === 'sum') {
      overlay.setDots(dotsFilled(state.sumProgress, sumsForTile(state)), DOT_COUNT)
    }
  }

  /*
   * NOTE what these no longer do: generate.
   *
   * Every call used to deal a brand new card, so leaving a round and coming
   * back re-rolled the question — and `dealReading`/`dealSum` say at length why
   * that was worse than it looks. The state's `readHeld` / `sumHeld` bit is
   * passed straight through; the decision itself lives in deal.ts, where it can
   * be tested against the real generators rather than a mock.
   */
  /*
   * WHAT THE HARNESS WAS DEALT LAST, one slot per deal moment (A3).
   *
   * Needed because `held` means "hand back the card at `history[idx]`", and
   * that card was chosen under whatever was ticked at the time — so a held
   * round must be ATTRIBUTED to the stage it was originally dealt at, not to
   * whatever a fresh draw would pick now. Two slots rather than the harness's
   * one `current`, because the rounds interleave: they can leave a sum, read a
   * page, and come back to the sum, and a single slot would by then be holding
   * the reading page.
   */
  let dealtRead: { path: Path; stage: number } | null = null
  let dealtSum: { path: Path; stage: number; probe: boolean } | null = null

  function openRead(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'read') return
    /*
     * The page index is in PAGES, not units (`PB-038`). `readProgress` counts
     * units and A7 made an item worth two of them, so handing it over raw read
     * the four-long mix at every other slot and doubled the find pages —
     * one in two where Joe's ruling and the data both say one in four.
     */
    const kind = harness.dealReading(pagesRead(state.readProgress))
    // Nothing in reading is ticked. Can only be reached by a hand-edited save:
    // the panel refuses the last untick (JT-010(3)).
    if (kind === null) return
    if (!state.readHeld || dealtRead === null) {
      dealtRead = { path: kind === 'build' ? 'building' : 'reading', stage: 1 }
    }
    harness.dealt(dealtRead.path, dealtRead.stage)

    overlay.clearSay()
    // Put the egg on the turntable first, then mount the round WITH the
    // layout — one call, so the mount's own teardown cannot drop it.
    const staged = stageFor('read', state)
    const card = dealReading(
      { read: readStore, build: buildStore },
      { rng: defaultRng, drawGreen, drawRed, neigh, level: dealtRead.stage },
      kind, state.readHeld,
    )
    if (card.kind === 'build') overlay.openBuild(card.item, staged)
    else overlay.openWordFind(card.picks, staged)
  }

  function openSum(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'sum') return
    if (!state.sumHeld || dealtSum === null) {
      // Joe, JT-010(1): the ticked stages of sums and takingAway go in one
      // pool and the draw is uniform over it, so the share of take-aways is a
      // consequence of the ladder rather than a number anyone sets.
      const got = harness.dealMaths(defaultRng)
      if (got === null) return
      dealtSum = got
    }
    harness.dealt(dealtSum.path, dealtSum.stage, dealtSum.probe)

    const item = dealSum(sumStore, defaultRng, dealtSum.stage,
      dealtSum.path === 'takingAway' ? 'sub' : 'add', state.sumHeld)
    /*
     * *"dealt MIXED with the minus sign popping on debut"* — runA.md:236.
     *
     * The debut is the first take-away they are EVER dealt, which is a question
     * about the record and not about this round: `takingAway` 1 with no
     * attempts on it yet. Read straight off `attainment` because that is where
     * the answer already is — no new persisted flag, and nothing added to the
     * harness, which would be a second thing to keep in step with the first.
     *
     * It reads `attempts` and not the tick, and that matters: the path is
     * ticked the instant they say yes to the offer, so a tick would be spent
     * before they had seen a single minus sign. `dealt()` above does not touch
     * `attempts` — only an answered question does — so this stays true right
     * up to the moment they answer it, held rounds included.
     *
     * REJECTED: popping on every subtraction. runA.md:236 says debut, and a
     * glyph that jumps every time stops meaning "this one is new" by the
     * third round and starts meaning nothing at all.
     */
    const debut = dealtSum.path === 'takingAway'
      && (attainment.takingAway.stages[1]?.attempts ?? 0) === 0
    overlay.clearSay()
    const staged = stageFor('sum', state)
    overlay.openSum(item, staged, debut)
  }

  /**
   * Run B's offer, put to the child at the completion high (runA.md:230-236).
   *
   * WHAT THIS FUNCTION DELIBERATELY DOES NOT DO is most of it. Whether there
   * is an offer to make — priority between the two, the cadence, the
   * two-session cooldown after a decline, one offer per session island-wide,
   * and whether the path is even on Auto — is `pendingOffer()`, entire. So
   * this asks once and renders whatever comes back, and re-derives NOTHING. A
   * surface that second-guessed the gate would be a second copy of the rules
   * that has to agree with the first, which is the shape HANDOFF §6 records as
   * having produced three faults in two days on the plot/flow seam.
   *
   * AFTER THE CEREMONY, NEVER INSIDE IT. `ceremony()` holds the island's exits
   * shut for the length of its body, and a question with no timer behind it
   * inside that body would hold them shut until the child answered — which is
   * a lock on a child, and brief §19 does not allow one. It is also the moment
   * the spec asks for: they have just watched a friend arrive or a piece of
   * land land, and *"do you want harder ones?"* means something different there
   * than it does after a page that merely ended.
   *
   * AND IT PERSISTS. An accepted offer ticks a stage and stamps the honeymoon,
   * and both of those live in `attainment` — so without this write their yes
   * is a thing that happened until they next close the tab. Through `commit`
   * on the attainment record, exactly as the grown-ups panel's ticks are, and
   * not through `commitState()`: those receipts are counted one-for-one
   * against ceremonies (barrier.test.ts), and this is not one.
   */
  async function putTheOffer(): Promise<void> {
    const due = harness.pendingOffer()
    if (due === null) return

    /*
     * VERBATIM from runA.md:230-236, both of them, down to the byte. These are
     * the spec's own words — *"universal line"* — and the reason they are
     * quoted rather than written afresh is that they were chosen: the trickier
     * line names the REWARD ("eggs and tiles faster") because that is what a
     * five-year-old is actually being asked to weigh, and the taking-away line
     * is short and unadorned because the thing itself is the news.
     */
    const line = due.kind === 'takingAway'
      ? 'Would you like to do some taking away?'
      : 'You are doing really well! Would you like some trickier questions? They will get you eggs and tiles faster.'

    /*
     * Spoken AND shown. The child is five: the trickier line is above their
     * reading level, and a question they cannot read is not a choice. The panel
     * carries its own copy because `body:has(.overlay:not(.hide)) .say` blanks
     * Fred's card for exactly as long as the buttons are up.
     */
    speech.speak(line)
    const accepted = await overlay.offer(line)

    /*
     * Answered by PATH, from the offer that was actually due — never a literal
     * and never a remembered kind. `noteOffer` re-resolves against
     * `pendingOffer()` itself, so a stale answer cannot tick anything; handing
     * it `due.path` is what makes the two ends the same offer.
     */
    harness.noteOffer(due.path, accepted)
    await commit(attainment, () => persist())
  }

  /**
   * A page or a sum was completed.
   *
   * The CEREMONY ONLY RUNS IF THE REWARD ACTUALLY LANDED. Under the cost
   * curve most pages advance the egg without hatching it, and most sums
   * advance the plot without finishing it — so firing the hatch animation,
   * the name card and the spoken hatch line on every completed page announced
   * a friend arriving when none had. That breaks the world-law the whole game
   * rests on: a pet comes home when its name is read, not before.
   *
   * So: compare before and after, and let the state decide what to celebrate.
   */
  async function passed(more: boolean): Promise<void> {
    if (flow.challenge === 'read') {
      const name = petName(defaultRng)
      const species = nextSpecies
      const petsBefore = flow.pets.length

      flow = handleChallengePassed(flow, { name, species })
      const hatched = flow.pets.length > petsBefore
      /*
       * A new friend can be the one that finishes an album, and finishing an
       * album is the only thing that opens the next one. Run it before the
       * ceremony rather than after: `persist` is called inside that ceremony,
       * and an album opened but not written would be drawn again — differently —
       * on the next load.
       */
      if (hatched) refreshAlbums()

      if (hatched) {
        /*
         * This egg is spent, so decide the NEXT friend and start fetching it
         * now — the next hatch is five pages away, which is minutes of cover
         * rather than the 700ms a breaking shell buys.
         *
         * Fire and forget, and it must stay that way: this runs alongside a
         * ceremony that locks the exits, and a preload nobody awaits cannot
         * extend that lock or deadlock it. `warm` never rejects, so the `void`
         * is not hiding a failure.
         */
        nextSpecies = drawSpecies()
        /*
         * SAVE FIRST, celebrate second.
         *
         * The pet exists in `flow` the moment handleChallengePassed returns,
         * but persist() used to run only after the ceremony — leaving a
         * two-second window in which closing the tab lost both the friend and
         * the page that earned it. Two seconds is not long unless it is the
         * single most important moment in the game (brief §19).
         */
        const receipt = await commitState()
        void askToKeepIt()

        /*
         * And hold the exits for the duration.
         *
         * The ceremony is an animation, not a moment of choice. A tap during
         * it used to rip the egg off the turntable mid-hatch — re-opening the
         * exact bug this change exists to fix — and, worse, a dismiss
         * followed by a re-tap could strand the flow in a challenge with no
         * overlay, recoverable only by reloading.
         */
        await ceremony(receipt, exits, async () => {
          // If the child has already left (collect-and-leave in the win hold),
          // there is no stage to perform on; hatch in the world as before.
          const onStage = overlay.isOpen()
          /*
           * THE CEREMONY HAPPENS ON THE STAGE (§3 and §6), where the child has
           * been watching.
           *
           * The first version closed the stage and then hatched the egg back in
           * the world — so the egg they had followed for five pages vanished at
           * the exact moment it finally mattered, and the payoff played out
           * somewhere they were not looking. Order now: burst and hatch in view,
           * name card, spoken name, and only then does the stage dissolve and
           * the friend arrive on the island.
           */
          /*
           * Start loading the friend NOW, while the shell is still breaking.
           *
           * The hatch runs about 700ms, which is ample cover for a model that
           * is usually already in the loader's cache. Waiting until after would
           * put a visible gap between the egg breaking and anyone appearing —
           * exactly the dead beat this change exists to fill.
           */
          const arriving = onStage
            ? pets.preview(species).catch(() => null)
            : Promise.resolve(null)

          world.lighting.celebrationBump()
          if (onStage) stage.burst()
          // No stinger here: the word-find already played 'win' when the last
          // word landed (v0:959), and a second one 420ms later doubles it.
          await egg.hatch()

          /*
           * The friend takes the egg's place on the turntable.
           *
           * §3's order: burst -> pet pops with the name card -> name spoken ->
           * stage dissolves -> pet hops down into the world. Without this beat
           * the hold framed an EMPTY plinth: the shell broke and nobody came
           * out, which is the least satisfying possible reading of a hatch.
           */
          /*
           * Wait for the friend, but NOT indefinitely.
           *
           * The exits are locked for the ceremony, so awaiting a bare network
           * fetch meant a stalled request soft-locked the game permanently:
           * empty plinth, dead back button, reload the only way out. And a hang
           * is the common failure mode for a fetch, not a rare one. Past this
           * budget the ceremony simply goes on without the model — the same
           * graceful path a failed load already took.
           */
          const friend = await Promise.race([
            arriving,
            wait(balance.stage.petLoadMs).then(() => null),
          ])
          /*
           * Only NOW warm the next animal, once this one has stopped competing
           * for the network.
           *
           * It used to fire the moment the species was re-drawn, which is fine
           * in the ordinary case — the current species is already cached,
           * because it was warmed a whole egg ago. But after a FAILED warm the
           * two fetches race inside the same `petLoadMs` budget, and the one
           * that matters is the one they are waiting to meet. Fable caught this
           * reviewing the diff; the fix is ordering, not machinery.
           *
           * Still fire-and-forget, and it must stay that way: this runs inside a
           * ceremony that locks the exits, and a preload nobody awaits cannot
           * extend that lock or deadlock it. `warm` never rejects.
           */
          void pets.warm(nextSpecies)
          if (onStage && friend) {
            stage.show(null, world.scene)      // the shell has gone; send it home
            /*
             * Reframe for a PET, not an egg.
             *
             * The camera was framed for a 0.55 egg, and a pet is wider than it
             * is tall — so at the egg's framing it filled the vignette edge to
             * edge and its feet were cropped off the bottom. Pulling back a
             * little puts the whole friend on the plinth with air around it,
             * which is what being introduced to someone looks like.
             */
            stage.frame(0.68)
            stage.showTemp(friend, 0.44)
          }

          overlay.showName(name)
          fred.talk(2.4)
          fred.hop()

          /*
           * A beat with the friend on the plinth and its name on the card,
           * before the stage dissolves and it walks out into the world.
           *
           * Cut short if nobody came: holding on an empty plinth is the dead
           * beat this whole change exists to remove, and it would be perverse
           * to keep it as the consolation prize for a slow network.
           */
          await wait(friend ? HATCH_HOLD_MS : 400)
          stage.showTemp(null)
          stageFor(null)
          overlay.setBusy(false)
          overlay.close()

          /*
           * The name is spoken AFTER the round closes.
           *
           * Closing tears the challenge down, and teardown cancels speech
           * (v0:847, faithfully ported) — so saying it first meant the friend's
           * name was cut off mid-word by the very act of putting the words
           * away. This is the one line in the game that must be heard whole.
           */
          const line = HATCH_LINES[flow.pets.length % HATCH_LINES.length] as string
          speech.speak(fill(line, child(), name))
          egg.reset()
          refresh()

          // ...and the new friend hops in rather than simply being there,
          // with the light lifting again for the arrival itself.
          const arrival = flow.pets[flow.pets.length - 1]
          if (arrival) pets.bounce(arrival.id)
          world.lighting.celebrationBump()

          /*
           * ...and THEN a chip flies into the album, so "where did my friend
           * go?" has a visible answer (§3's last beat).
           *
           * After the arrival, not with it. §3 orders these one after the
           * other, and for good reason: a pet bouncing in mid-island while a
           * chip launches toward the top corner asks a six-year-old to watch
           * two things at once, and they will watch neither.
           */
          setTimeout(() => {
            // The card goes as the chip picks the name up, so the two read as
            // one movement rather than as the name existing twice.
            overlay.clearName()
            overlay.flyToAlbum(name, albumBtn)
          }, 900)
        })

        /*
         * THE OPENING STILL WINS, and the offer waits for another session.
         *
         * Fred is mid-story: he handed the child one page at beat six and is
         * about to pick the thread back up. A panel asking whether they want
         * harder sums, opened over the top of that, is two voices at once and
         * the first thing the island ever says to them being an upsell. The
         * offer costs nothing to postpone — `pendingOffer()` will still be
         * making it next time, because nothing here has been noted.
         */
        if (openingResumeAt >= 0) {
          const at = openingResumeAt
          openingResumeAt = -1
          setTimeout(() => { void runOpening(at) }, 2200)
        } else {
          /*
           * ONE QUESTION AT THIS MOMENT, NOT TWO. Note what does not follow
           * this line: `offerAStretch()`. Both branches that reach an offer
           * return immediately, and that is the point — "would you like harder
           * questions?" chased by "shall we get up and run about?" is the sales
           * pitch harness.ts:809-813 refuses to make, and the second question
           * is the one a tired five-year-old answers just to make it stop.
           */
          await putTheOffer()
        }
        return
      }

      // Not yet — but visibly closer. The egg cracks a little further, which
      // refresh() applies, and that IS the feedback. No name, no promise.
      sfx.play('up')
      refresh()
      // ...and on the stage they are watching, in view, as it happens (§6).
      refreshDots('read')

      if (!more || openingResumeAt >= 0) {
        stageFor(null); overlay.close()
        if (openingResumeAt >= 0) {
          const at = openingResumeAt
          openingResumeAt = -1
          setTimeout(() => { void runOpening(at) }, 600)
        } else {
          // WIRING (break governor). Fred's story wins if it is mid-sentence —
          // he is already talking, and the suggestion keeps until they open
          // another page. Pinned by tests/island/stretch.test.ts.
          offerAStretch()
        }
        return
      }

      /*
       * Stay in the work. Reading five pages should feel like one sitting,
       * not five trips out to the island and back — the world only returns
       * when the friend arrives, or when the child taps back.
       *
       * The finished page is still on screen throughout this pause, because
       * finish() no longer tears it down; openRead() replaces it in a single
       * synchronous step, so the swap is a swap and not a close-and-reopen.
       */
      setTimeout(() => {
        flow = tapEgg({ ...flow, phase: 'free' })
        openRead()
      }, PAGE_GAP_MS)
    } else if (flow.challenge === 'sum') {
      openingResumeAt = -1
      /*
       * "Earned" now means the PLOT FINISHED and became real land — the tile
       * is committed by the flow machine the moment it is paid for, so the
       * island growing is the signal. Under the old flow this compared banked
       * tiles, which no longer exist.
       */
      const tilesBefore = flow.island.tiles.size
      /*
       * THE HONEYMOON'S PAY-3, on the path the sum was actually dealt from.
       *
       * runA.md:232-233 — *"accept = tick + honeymoon (pay 3, 2 sessions)"*.
       * The harness stamps WHEN and `flow.ts` owns what a round is worth, so
       * this line is the whole of the join between them, and it asks about
       * `dealtSum.path` rather than about maths in general: they accepted an
       * offer on ONE path, and a honeymoon on `takingAway` must not quietly
       * pay three for addition too. `'sums'` is the fallback for the paths
       * into this branch that predate the harness (the opening script), and
       * it is the conservative one — an island with nothing accepted is not
       * in a honeymoon on either path.
       *
       * Reading pays 2 either way, by ruling (flow.ts:288-299), so the other
       * branch deliberately does not thread this.
       */
      flow = challengePassed(flow, undefined, harness.honeymoonActive(dealtSum?.path ?? 'sums'))
      const earned = flow.island.tiles.size > tilesBefore

      if (earned) {
        /*
         * THE FLY-BACK (§6): flourish on the turntable, then the land arrives.
         *
         * Spec's own words for why: "the connective payoff between abstract
         * work and world position". The child did sums on one side of the
         * screen; the ground appears on the other; the arc is the sentence
         * that joins them.
         *
         * NOTE THE ORDER. refresh() is held back until the scaffolding has
         * touched down, because the flow machine commits the real tile the
         * moment it is paid for — so refreshing first drew the finished hex
         * at the socket and THEN dropped a second one into it from the sky.
         * Duplication, not delivery, and worse than no beat at all: the two
         * are not even the same shape, since an edge tile renders as a cut
         * coast hex while the scaffolding is a full one. The plot IS the tile
         * until it lands; the real one takes over as it is disposed.
         */
        // §19: save the finished tile BEFORE celebrating it. The hatch branch
        // learned this; closing the tab mid-ceremony must not cost them the sum.
        const receipt = await commitState()
        void askToKeepIt()

        await ceremony(receipt, exits, async () => {
          // Fill the dots first: the sum that FINISHED the tile deserves to
          // be seen landing, and unstaging first meant the last dot never lit.
          overlay.setDots(DOT_COUNT, DOT_COUNT)
          world.lighting.celebrationBump()

          // The flourish plays while the plot is still on the turntable.
          const finished = plots.current()
          const sited = plots.sitedAt()
          finished?.setProgress(1, 1)
          await wait(balance.stage.flourishMs)

          // Down comes the stage, and the land arcs onto its socket.
          stageFor(null)
          overlay.close()
          /*
           * Joe: *"'You've counted up some land' sounds off. lets call it 'You
           * have found some land for your friends'"*.
           *
           * This MOVED the world-law vocabulary, and the other half has since
           * caught up: Joe took the opening line too — *"i dont want these weird
           * linguistic crowbars"* — so the ask is now "can you find us some
           * land?" and the two halves match again. The reward line earns its
           * place by naming who the land is FOR, which is the whole loop.
           *
           * See the header of script.ts for the full ruling and for the fact
           * that pet-island-brief.md still carries the old wording.
           */
          speech.speak('You have found some land for your friends!')
          fred.talk(2.2)
          /*
           * In from the SIDE, to the socket they chose — never the middle.
           * The plot group already sits at its own socket, so the arc is a
           * lateral swing into it rather than a drop from overhead.
           */
          finished?.land(balance.stage.flyBackMs, world.models.size * 3)

          /*
           * Put the real hex on the island NOW, then dress it while it flies.
           *
           * The order is the whole fix. props.sync asks the SURFACE what the
           * ground is doing before it plants anything, and the surface is a
           * raycast against the tile meshes — so syncing props before the
           * tile field knew about the new hex found no ground at all,
           * rejected every piece, and marked the tile done. It could then
           * never grow anything: the scaffolding's props vanished with the
           * scaffolding and nothing replaced them.
           *
           * Revealing the hex first is safe now that it is being flown INTO
           * rather than dropped onto: the scaffolding descends onto its own
           * finished tile and is removed at touchdown, which reads as
           * settling into place rather than as a duplicate.
           */
          world.setIsland(flow.island)
          await wait(balance.stage.flyBackMs)

          /*
           * The tile keeps EXACTLY what the child built.
           *
           * They watched those eight things arrive one at a time; planting a
           * different eight from the coordinate hash at touchdown means the
           * trees move and change species in the frame the scaffolding
           * disappears. So the prop field adopts the grown scenery, and never
           * dresses that hex itself.
           */
          if (finished && sited) {
            props.adopt(sited, finished.harvest(), world.models.size)
          }

          /*
           * Touchdown. The scaffolding goes and the real tile appears in the
           * same beat, so there is never a frame with two hexes in one place
           * — coincident faces flicker, and the child would see it.
           */
          plots.drop()
          world.lighting.celebrationBump()   // the move-in lift (lighting §4)
          refresh()
        })

        /*
         * The other completion high, and the same rules: after the ceremony so
         * the exits are theirs again, and nothing follows it — no stretch, no
         * second ask. See `putTheOffer`.
         */
        await putTheOffer()
        return
      }

      sfx.play('up')
      refresh()

      /*
       * THREE THINGS, IN THIS ORDER, and each was a separate bug fixed.
       *
       * 1. TAKE THE PLOT OFF THE STAGE. `stageFor('sum')` re-parents the plot
       *    onto the turntable and the turntable goes with the panel, so closing
       *    without handing it back left the plot alive — still in `flow.plot`,
       *    still holding their sums — parented to something no longer on screen.
       *    Their island showed an empty socket where the half-built tile was. Joe:
       *    *"there is never a half built tile... map goes back to blank and it
       *    only resumes when i pick any blank tile socket"*. It also made the
       *    change-your-mind tap unreachable: no plot on the island to tap.
       *
       * 2. Close the panel.
       *
       * 3. THEN offer the stretch, never before — the `.say` card is hidden while
       *    any overlay is open, so Fred delivering it a moment earlier would say
       *    it to a closed curtain. The break governor's symmetric half: mashing
       *    the number pad is mashing. Both the ordering and this call site are
       *    pinned by tests/island/stretch.test.ts.
       */
      if (!more) { stageFor(null); overlay.close(); offerAStretch(); return }

      // Same rule for land: keep counting until the plot is finished. Each sum
      // grows the plot a little more, and refresh() has just shown that.
      setTimeout(() => {
        const next = tapSum({ ...flow, phase: 'free' })
        // No plot left to advance (it just completed, or the child left the
        // bank without siting). Going back to the island beats dealing a sum
        // that would build nothing.
        if (next.challenge !== 'sum') { stageFor(null); overlay.close(); return }
        flow = next
        openSum()
      }, PAGE_GAP_MS)
    }
  }

  /* ---------- the opening: Fred's Lonely Rock (brief section 3) ---------- */

  let inOpening = false
  /**
   * True while a hatch ceremony is playing.
   *
   * World taps are ignored for its duration, alongside the overlay's own
   * exits — otherwise a tap lands on an egg that is mid-hatch and half-way
   * between two scenes.
   */
  let inCeremony = false
  /** Where to resume after the opening hands over to the child. */
  let openingResumeAt = -1

  /**
   * Twenty seconds, tap to advance, fully voiced. Plays once per profile and
   * is replayable forever by tapping Fred. Skippable at any point: the world
   * is already playable behind it, so nothing is gated on sitting through it.
   */
  async function runOpening(from = 0): Promise<void> {
    // Never start the story over a live round or mid-placement: at beat 6 it
    // calls tapEgg, which no-ops outside 'free', and the child would then
    // read a whole round for nothing. At beat 8 openSum would tear down a
    // half-finished word-find outright.
    if (inOpening || overlay.isOpen() || flow.phase !== 'free') return
    inOpening = true
    /*
     * SEEN THE MOMENT IT STARTS — before a single beat, before anything is
     * awaited, and after the guards above so a story that never starts is never
     * recorded as having played.
     *
     * It used to be recorded after the last beat, which is the one exit this
     * loop mostly does not take: beat six hands over to the child and RETURNS,
     * and the story only resumes if they finish that round — dismissing it
     * clears `openingResumeAt` and ends the story for good, with nothing
     * written. A reload at any point did the same. So the profile stayed
     * "never seen" and Fred started again from "Oh! Hello" on every load, which
     * is exactly what Joe reported.
     *
     * Not awaited, for the reason HANDOFF §5 gives about async in this file:
     * the beats race live input, and the claim is already staked synchronously
     * inside the gate. The promise is the write landing, which nothing here
     * needs to wait for.
     */
    void opening.begin()
    if (from === 0) egg.group.visible = false

    for (let i = from; i < OPENING.length; i++) {
      const beat = OPENING[i] as typeof OPENING[number]
      const text = fill(beat.line, child(), flow.pets[0]?.name ?? 'your friend')

      if (beat.cue === 'egg-arrives') {
        egg.reset()
        egg.group.visible = true
        sfx.play('up')
      }
      if (beat.cue === 'point-egg') fred.pointAt(egg.group.position)

      overlay.say(text)
      /*
       * Wait for him to FINISH, rather than guessing how long he takes.
       *
       * Each beat used to sit for a computed number of milliseconds and then
       * move on — and moving on speaks the next line, which cancels the
       * current utterance (v0:749, faithfully ported). Guess low and the last
       * words are cut off; the child's own name is at the END of "Oh! Hello,
       * Juno", which is exactly what they lost. Now the beat ends when the
       * voice does, with the computed time only as a ceiling for the case
       * where there is no voice at all.
       */
      let spoken = false
      const finished = new Promise<void>(resolve => {
        spoken = speech.speak(text, undefined, () => resolve())
        if (!spoken) resolve()
      })
      fred.talk(Math.min(6, text.length * 0.06))
      if (beat.cue === 'egg-arrives') fred.hop()

      await Promise.race([
        waitForTap(beatMs(text)),
        // ...plus a breath after the voice stops, so lines do not run together.
        finished.then(() => wait(balance.story.beatMinMs * 0.45)),
      ])
      fred.pointAt(null)

      // The two beats that hand over to the child.
      if (beat.cue === 'first-read') {
        // Hand over to the child, and remember to pick the story back up
        // afterwards — beats 7 and 8 are the name reveal and the ask for land.
        overlay.clearSay()
        openingResumeAt = i + 1
        flow = tapEgg(flow)
        openRead()
        inOpening = false
        return
      }
      if (beat.cue === 'ask-land') {
        /*
         * Fred asks the child to count him up some land, so this must OPEN
         * THE BANK, not a sum. Under the new flow tapSum requires a plot to
         * advance and there is none on a first run, so it no-opped, openSum
         * no-opped after it, and the opening ended mid-sentence with the
         * caption wiped — the scripted first tile never happened at all.
         */
        flow = askForLand(flow)
        refresh()
        overlay.say(TILE_QUESTION)
        break
      }
    }

    overlay.clearSay()
    inOpening = false
    // Nothing to record here: the gate claimed it before the first beat, which
    // is the only way every exit from this loop gets covered.
  }

  /**
   * How long to sit on one of Fred's lines before moving on unasked.
   *
   * Scaled to the line rather than flat. Every beat used to wait the same
   * six and a half seconds, so "It's ever so quiet out here." held the screen
   * exactly as long as his longest speech — which is what made the intro
   * drag between sentences. Long enough to hear it and a beat to breathe;
   * a tap still skips ahead at any point.
   */
  const beatMs = (text: string): number => Math.min(
    balance.story.beatMaxMs,
    Math.max(balance.story.beatMinMs,
      balance.story.beatMinMs + text.length * balance.story.beatPerCharMs),
  )

  /** Tap anywhere to advance a beat. */
  function waitForTap(ms: number): Promise<void> {
    return new Promise(resolve => {
      const done = (): void => {
        window.removeEventListener('pointerdown', done, true)
        resolve()
      }
      window.addEventListener('pointerdown', done, true)
      // Never trap a child who does not tap: move on by itself.
      setTimeout(done, ms)
    })
  }

  /* ---------- the pick-of-three tile offer ---------- */

  const offerBox = document.createElement('div')
  offerBox.className = 'overlay hide'
  const offerInner = document.createElement('div')
  offerInner.className = 'chunk overlay-panel offer'
  offerBox.append(offerInner)
  document.body.append(offerBox)

  /*
   * A tap on the backdrop puts the offer away and hands the island back.
   *
   * Same rule and same mechanics as the grown-ups panels: only a tap on the
   * backdrop ITSELF, never one that bubbled up from a tile button, or choosing
   * grass would choose grass and then immediately cancel it.
   *
   * `pointerdown` rather than `click`, to match grownups.ts and because a tap
   * that starts on the backdrop and drifts a few pixels is still a tap on a
   * tablet.
   */
  offerBox.addEventListener('pointerdown', e => {
    if (e.target !== offerBox) return
    const next = cancelPlacing(flow)
    if (next === flow) return
    flow = next
    /*
     * Take the question down with the panel. The `.say` card is hidden by CSS
     * only while an overlay is open, so dismissing the offer REVEALS the copy
     * that was set behind it — verified in the browser: the island came back
     * with "Which tile would you like?" still sitting over it, asking about
     * buttons that were no longer there.
     */
    overlay.clearSay()
    refresh()
  })

  const TILE_FACE: Record<TileType, string> = {
    grass: '\u{1F33F}', water: '\u{1F30A}', rock: '\u{26F0}',
  }
  /** Spoken, and read by a screen reader. A six-year-old gets a word, not a glyph. */
  const TILE_WORD: Record<TileType, string> = {
    grass: 'grass', water: 'water', rock: 'mountain',
  }

  function renderOffer(): void {
    const offer = flow.phase === 'placing' && !flow.chosen ? tileOffer(flow) : []
    offerBox.classList.toggle('hide', offer.length === 0)
    offerInner.replaceChildren()
    if (offer.length > 0) {
      /*
       * The question goes IN the panel, not on the `.say` card.
       *
       * `body:has(.overlay:not(.hide)) .say` hides that card while any overlay
       * is open, and the offer is an overlay — so the question was invisible for
       * precisely as long as the buttons asking it were on screen. Asking inside
       * the panel also puts the words next to the thing they are about.
       */
      const ask = document.createElement('div')
      ask.className = 'offer-ask'
      ask.textContent = TILE_QUESTION
      offerInner.append(ask)
    }
    offer.forEach((t, i) => {
      const b = document.createElement('button')
      b.className = `chunk chunk-button offer-tile chunk-${t}`
      b.textContent = TILE_FACE[t]
      b.setAttribute('aria-label', TILE_WORD[t])
      b.onclick = () => {
        const next = chooseTile(flow, t)
        flow = next
        /*
         * They asked at a socket, so choosing a kind SITES it — and then gets
         * straight on with building it, exactly as tapping a socket with a
         * kind already in hand does. Without this the second question was gone
         * but the second TAP was not: the plot appeared and then sat there
         * waiting to be poked.
         */
        if (next.plot) {
          const building = tapSum(next)
          if (building !== next) { flow = building; openSum(building) }
        } else {
          overlay.say('Now tap where it goes!')
        }
        refresh()
      }
      b.style.animationDelay = i * 0.06 + 's'
      offerInner.append(b)
    })
  }

  /* ---------- taps ---------- */

  /**
   * Every tap goes through the tested wiring layer. This handler does nothing
   * but supply ports and re-render — all the decisions live in
   * interactions.ts, where they can be asserted.
   */
  /**
   * A governor never blocks a tap — it answers it with Fred asking for the
   * other half of the loop instead (slice-1 spec §5). The child can ignore
   * him and tap again; nothing is greyed out and nothing is refused twice.
   *
   * AND NOW THAT SENTENCE IS TRUE. `asked` is Fred's memory of the last thing
   * he asked for, and it is the whole of the override: the first tap spends
   * itself on hearing him, the very next tap on the same thing returns `'again'`
   * and `interactions.ts` opens the round regardless. PB-042/JT-012 — Joe:
   * *"it should start with invitation first, then let the user run with whatever
   * they want to do."*
   *
   * IT CLEARS ITSELF ON THE OVERRIDE, which is deliberate and not laziness. If
   * the memory persisted, they would be asked once in a session and silently
   * waved through forever after — a silent tax, and Joe asked for an
   * announcement. Clearing it means every single override is preceded by Fred
   * saying why, and costs exactly one extra tap. Ask, override, ask, override.
   *
   * The wriggle-break is NOT a governor and is exempt: it reads the child, not
   * the island, there is nothing to override, and `offerAStretch` would fall
   * silent on two consecutive offers if it shared this memory.
   */
  let asked: Nudge | null = null
  function invite(which: Nudge): 'asked' | 'again' {
    if (which !== 'wriggle-break') {
      if (asked === which) { asked = null; return 'again' }
      asked = which
    }
    /*
     * JT-019 — Joe: *"we get fred to tell her how many she needs to restore
     * balance."* The count is read at the moment he speaks rather than passed
     * in, because the island may have moved since whatever event triggered the
     * ask, and a number that is one out is worse than no number at all.
     * `restoreCount` answers 0 for the wriggle-break, whose line has no count.
     */
    const line = governorLine(which, restoreCount(flow, which))
    overlay.say(line)
    speech.speak(line)
    fred.talk(2.6)
    fred.hop()
    return 'asked'
  }

  /**
   * The third governor, delivered: Fred suggests getting up for a minute.
   *
   * Joe: *"we have a button mash guard, but repeated mashing on successive pages
   * should lead to a suggestion for a break or to get up, run around for a
   * minute and then come back."* The counting is in `governors.ts` and the page
   * boundaries are in `overlay.ts`; this is only the delivery, and it is
   * deliberately the SAME delivery the other two governors use.
   *
   * Called at the end of a page, on the island, with the panel already down.
   * Both of those are load-bearing:
   *
   *   - AFTER the page, never over it. The suggestion is unactionable mid-page
   *     and unkind besides.
   *   - ON THE ISLAND, because `body:has(.overlay:not(.hide)) .say` hides Fred's
   *     card while any overlay is open — the rule that made the tile-offer
   *     question invisible for a day. With the panel down the card is the right
   *     channel and the only one big enough to read; with it up there is no
   *     channel at all, which is a second reason the suggestion waits.
   *
   * §19 IN ONE LINE: this returns a boolean and speaks a sentence. It sets no
   * lock, starts no timer, and takes nothing back — everything they counted up
   * is already banked and persisted by the refresh() above every caller. They
   * can ignore Fred and tap the egg again on the very next frame.
   */
  function offerAStretch(): boolean {
    if (!overlay.stretchDue()) return false
    invite('wriggle-break')
    return true
  }

  const ports: InteractionPorts = {
    challengeOpen: () => overlay.isOpen(),
    storyPlaying: () => inOpening || inCeremony,
    // The governors are asked BEFORE the transition now (see interactions.ts),
    // so these just open. A port that declined here used to strand the flow
    // in 'challenge' with no overlay and no way out but a reload.
    openRead: state => { openRead(state) },
    openSum: state => { openSum(state) },
    eggsPaused,
    landPaused,
    invite,
    greetFred: () => {
      fred.hop()
      fred.talk(1.2)
      speech.speak('Fred!')
    },
    bouncePet: id => pets.bounce(id),
    // "Zoom to location": move the camera's pivot onto the tile they tapped, so
    // spin and pinch happen there instead of back at the home tile. The world
    // owns the easing and the clamping; this is only the coordinate.
    focusOn: a => world.focusOn(world.worldOf(a)),
    say: text => overlay.say(text),
    clearSay: () => overlay.clearSay(),
    speak: text => { speech.speak(text) },
    win: () => sfx.play('win'),
  }

  /*
   * Acted on RELEASE, not on contact.
   *
   * The island is both a thing you turn and a thing you touch, and those two
   * gestures start identically — so firing on pointerdown meant the moment a
   * finger landed to rotate the world it had already opened a maths round.
   * You cannot know a press was a tap until it ends. taps.ts owns the rule
   * and is tested; this is only plumbing.
   */
  bindWorldTaps(canvas, (x, y) => {
    const before = flow
    flow = handleWorldTap(flow, world.pick(x, y), ports)
    if (flow !== before) refresh()
  })

  world.onFrame((dt, t) => {
    stage.update(dt, t)
    plots.update(dt)
    props.update(dt, t)
    egg.update(dt, t)
    // Before update, so a tap arriving this frame meets a target sized for the
    // shot it is drawn in. The proxies are world-space spheres and the camera
    // pulls back as their island grows; without this a pet's tap target falls
    // from 47.5px to 26px on a full island (pets.ts, `pickRadiusAt`).
    pets.setCameraDistance(world.cameraDistance())
    pets.update(dt, t, flow.island, world.models.size)
  })

  world.onFrame((dt, t) => fred.update(dt, t))

  /*
   * A window onto the scene graph, for diagnosing what is actually on screen.
   *
   * Opt-in via ?debug, so it costs a production session nothing. Added after
   * an afternoon spent guessing which model two mystery slabs were by
   * changing tables and redeploying — three rounds of that is more expensive
   * than the hook.
   */
  if (debugging) {
    /*
     * Advance the calendar without waiting for one.
     *
     * The visitor's day latch, difficulty's two-distinct-days gate and the
     * seasons are all things nobody can exercise by hand otherwise. Note these
     * move the CALENDAR only: the input locks and reward windows in
     * src/challenges are elapsed-time gates and deliberately still read the
     * real clock, or pressing this would release every lock at once and
     * silently disable the mash-rescue (see platform/clock.ts).
     */
    /*
     * Laid out in a ROW, because `.dev-reset` is fixed to the bottom-right
     * corner and every one of these would otherwise sit on top of the gear —
     * which is what the clock buttons were doing until the wipe button made it
     * three deep and obvious.
     */
    let slot = 1
    const devButton = (label: string, title: string, onClick: () => void): void => {
      const b = document.createElement('button')
      b.className = 'dev-reset'
      b.style.right = `calc(1vw + ${slot++} * 3rem)`
      b.textContent = label
      b.title = title
      b.onclick = onClick
      document.body.append(b)
    }

    devButton('+1d', 'Jump the calendar 1 day forward', () => {
      ;(clock as AdjustableClock).advanceDays(1)
      overlay.toast(`Now ${clock.today()}`)
    })
    devButton('+7d', 'Jump the calendar 7 days forward', () => {
      ;(clock as AdjustableClock).advanceDays(7)
      overlay.toast(`Now ${clock.today()}`)
    })

    /*
     * A one-tap wipe, for developing against.
     *
     * The reset lives behind the grown-ups PIN and then a menu, which is right
     * for a tablet a six-year-old holds — a plain "start again" button on the
     * play surface is one curious tap from everything they own. But it is
     * needless friction when the loop being tested IS the first ten minutes,
     * and Joe asked for the old button back.
     *
     * So it exists only where that reasoning does not apply: preview builds,
     * with the debug flag on. There is no confirm either, deliberately —
     * a confirm on a button you press forty times an afternoon is just a
     * second button.
     */
    devButton('⟲', 'Wipe this island and reload (dev only)',
      () => { void store.removeProfile(PROFILE).then(() => location.reload()) })

    ;(window as unknown as Record<string, unknown>).__world = {
      clock: {
        today: () => clock.today(),
        advanceDays: (n: number) => { (clock as AdjustableClock).advanceDays(n) },
        reset: () => { (clock as AdjustableClock).reset() },
      },
      scene: world.scene,
      dump: () => {
        const out: Array<Record<string, unknown>> = []
        world.scene.traverse(o => {
          const box = new THREE.Box3().setFromObject(o)
          const size = box.getSize(new THREE.Vector3())
          if (size.x < 0.8 && size.z < 0.8) return       // only sizeable things
          out.push({
            name: o.name || o.type,
            parent: o.parent?.name ?? '',
            at: [+o.position.x.toFixed(2), +o.position.y.toFixed(2), +o.position.z.toFixed(2)],
            size: [+size.x.toFixed(2), +size.y.toFixed(2), +size.z.toFixed(2)],
          })
        })
        return out
      },
    }
  }

  refresh()
  /*
   * The arrival is fired by placeEgg, not here.
   *
   * refresh() loads a few dozen models before it can site the egg, so arriving
   * at this point meant flying in at the origin, landing under Fred, and then
   * teleporting to the real spot once the props resolved.
   */
  world.start()
  document.getElementById('boot')?.remove()

  /*
   * Fetch the first friend now, while the child is reading Fred's story.
   *
   * AFTER `world.start()`, deliberately. The island's own models are the boot
   * critical path and a pet nobody can see for several minutes must not
   * compete with them for a tablet's bandwidth — the point is to spend the
   * quiet time, not the busy time. From here there are minutes of reading
   * before the first shell breaks.
   *
   * Not awaited: boot goes on to ask their name and start the story, and
   * neither should wait on a GLB.
   */
  void pets.warm(nextSpecies)

  /*
   * Ask their name once, before the story.
   *
   * After the world is drawn, not before: asked first, they were answering
   * into a blank blue screen. Their island should be behind the question — it
   * is theirs, and that is the whole reason for asking.
   *
   * Before the opening rather than after, so Fred can greet them by name in
   * his first line. A story that starts "hello friend" and switches to "hello
   * Juno" halfway reads as a bug.
   */
  if (!childName && !opening.seen()) {
    childName = await overlay.askName()
    sign.setName(childName || 'my')
    if (childName) { document.title = `${childName}'s Island`; void persist() }
  }

  /*
   * Give the baked clips a moment to land before Fred opens his mouth.
   *
   * The opening is the one stretch where a half-loaded voice is audible as a
   * fault rather than as a fallback: eight lines in a row, and a child who
   * hears two of them in Oliver and the rest in the device's robot has been
   * shown a bug, not a graceful degradation. On the common path this costs
   * nothing — the child was typing their name while the clips landed.
   *
   * Raced against a cap, never awaited bare. `load()` cannot reject, but it can
   * be slow on a cold cellular first run, and nothing about the story may wait
   * on a network. If the cap wins, every line simply falls back, which is the
   * behaviour the game shipped with.
   */
  if (!opening.seen()) await Promise.race([voiceLoaded, wait(1500)])

  if (!opening.seen()) {
    void runOpening()
  } else {
    overlay.say('Tap the egg to read to it — or tap the island for land!')
  }
}

boot().catch(err => {
  const el = document.getElementById('boot')
  if (el) el.textContent = 'Could not start: ' + err.message
  console.error(err)
})
