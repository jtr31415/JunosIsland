/**
 * Pet Island.
 *
 * Reading hatches eggs into pets. Maths earns land the child places herself.
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
import { createGrowingPlot } from './world/increments'
import { plannedLook } from './world/coast'
import type { GrowingPlot } from './world/increments'
import { createAlbum } from './album'
import { hatchProgress, landProgress, sumsForTile, pagesForEgg } from './flow'
import { pageKind, balance, applyDevBalance } from './balance'
import { landPaused, eggsPaused, activeGovernor, GOVERNOR_LINE } from './governors'
import { OPENING, HATCH_LINES, TILE_QUESTION, fill } from './script'
import { loadIsland, saveIsland } from './save'
import { openingGate } from './opening'
import { commit, ceremony } from './ceremony'
import { askPin, askChoice, askConfirm } from './grownups'
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
import { createSfx } from '../platform/audio'
import { defaultRng, ri } from '../core/rng'
import { makeDeck } from '../core/decks'
import { GREEN, RED } from '../core/wordlists'
import { buildPool, buildNeighbours } from '../core/neighbours'
import { generateRead } from '../core/generators/read'
import type { ReadState, ReadPick } from '../core/generators/read'
import { generateBuild } from '../core/generators/build'
import type { BuildState, BuildItem } from '../core/generators/build'
import { generateAdd } from '../core/generators/sums'
import type { SumState, SumItem } from '../core/generators/sums'
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
 * Long enough to MEET the friend: she pops up on the plinth as the shell
 * goes, and this is how long the child gets to look at her before the stage
 * dissolves and she walks out into the world. It was briefly cut to 700ms
 * when the beat was missing and the shot was of an empty turntable.
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
  const speech = createSpeaker()
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

  /**
   * Which friend is in the egg — decided IN ADVANCE, so she can be fetched
   * while the child is still reading.
   *
   * Joe: "preloaded the animal otherwise there is a render delay and
   * disappointment." The species used to be drawn on the line that hatched it,
   * which left no time at all: the fetch started as the shell broke and the
   * plinth was empty for as long as the network took.
   *
   * DECIDING EARLIER rather than guessing. The draw is uniform over 24, so
   * warming a "likely" species would hit one time in 24 and be a download
   * wasted the other 23 — and warming the whole pack is 3.21MiB measured,
   * against a 5MB budget on the target tablet. Committing to the next one
   * makes the preload right every time, for one file.
   *
   * It costs nothing to draw early: the old code drew a species on EVERY
   * passed page and threw it away on the four in five that did not hatch.
   * This draws one and keeps it until it is spent, which is strictly fewer
   * draws — and it is the seam a remembered draw would replace, if the "two
   * cats in a row" card ever gives this a deck the way `makeDeck` does for
   * words. A deck would swap this function and nothing else.
   */
  const drawSpecies = (): string => SPECIES[ri(defaultRng, SPECIES.length)] as string
  let nextSpecies = drawSpecies()

  const props = createPropField()
  world.scene.add(props.group)

  /*
   * The plot under construction (spec §2). Sited as soon as the child picks a
   * socket, then GROWN by each sum, so arithmetic visibly becomes ground.
   */
  let plot: GrowingPlot | null = null
  /** Where the current plot is sited, remembered past the flow clearing it. */
  let plotAt: Axial | null = null
  /** Set while a finished plot is showing its flourish before being removed. */
  let plotFarewell: ReturnType<typeof setTimeout> | null = null
  /** Tear a plot down now, cancelling any farewell in progress. */
  function dropPlot(): void {
    if (plotFarewell) { clearTimeout(plotFarewell); plotFarewell = null }
    if (!plot) return
    // It may be on the stage rather than in the world. Detach from wherever
    // it actually is, and make sure the stage is not left holding a corpse.
    if (stage.holds(plot.group)) { stage.release(); overlay.setStaged(false) }
    plot.group.removeFromParent()
    plot.dispose()
    plot = null
  }

  function showPlot(state: Flow = flow): void {
    if (!state.plot) {
      /*
       * The plot is paid for and the tile is real. LET THE LAST STEP PLAY.
       *
       * The flow machine commits the tile in the same transition that reaches
       * full payment, so a plot never exists in a finished state — which meant
       * the tenth increment, the completion flourish, could not once be seen
       * and the intro tile showed no build at all. So the scaffolding stays up
       * for a beat at full progress before it comes down.
       */
      if (plot && !plotFarewell) {
        plot.setProgress(1, 1)
        const going = plot
        plotFarewell = setTimeout(() => {
          if (stage.holds(going.group)) stage.release()
          going.group.removeFromParent()
          going.dispose()
          if (plot === going) plot = null
          plotFarewell = null
        }, PLOT_FAREWELL_MS)
      }
      return
    }
    // A new plot while the old one is still bowing: clear it out at once, or
    // two hexes overlap and the farewell disposes the wrong one.
    if (plotFarewell) dropPlot()
    if (!plot) {
      // Seeded from the socket: the same hex always grows the same thing, but
      // no two hexes grow the same thing as each other.
      const seed = (state.plot.at.q * 73856093) ^ (state.plot.at.r * 19349663)
      plot = createGrowingPlot(state.plot.type, world.models.size, {
        models: world.models,
        prop: name => props.load(name),
        /*
         * The look the finished tile WILL have, solved over the island with this
         * plot already on it. Without it a water plot built as a flat slab and
         * then arrived as a coast piece, which is a discontinuity at the one
         * moment §2 wants continuity.
         */
      }, seed >>> 0, plannedLook(state.island, state.plot.at, state.plot.type))
      const w = world.worldOf(state.plot.at)
      plot.group.position.copy(w)
      plotAt = state.plot.at
      world.scene.add(plot.group)
    }
    plot.setProgress(state.sumProgress, sumsForTile(state))
    /*
     * NOT hovering. The transparent container already says "not placed yet"
     * — that is its whole job — and raising the plot as well lifted it clean
     * out of the vignette's frame. The hover belonged to the world-space
     * version this replaced; the launch height it defined is still what the
     * fly-back falls from.
     */
    plot.float(false)
  }

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
   * Her signpost, on the home tile. The one place the world says out loud
   * that it belongs to her — and it is IN the island rather than on top of
   * it, so she can turn the camera round it and it is still there.
   */
  // Lettered once the save has been read; see below.
  const sign = createSign('')
  world.scene.add(sign.group)

  /*
   * The challenge stage (§6): the work and its reason, side by side.
   *
   * Its own little scene, drawn into a scissored corner of the same canvas
   * after the world. The egg or the growing plot is RE-PARENTED onto its
   * turntable for the duration, so the piece she watches is literally the one
   * she owns rather than a stand-in copy.
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
  /** Her name where the script wants one, or something friendly if she skipped. */
  const child = (): string => childName || 'friend'
  const loaded = await loadIsland(store, PROFILE)

  /*
   * "I found your island!" — never an error a child reads.
   *
   * The primary save failed its checksum and a snapshot was used instead. She
   * is told something reassuring happened, not that something broke; the
   * detail is in the console for a grown-up.
   */
  const load = store.lastLoad(PROFILE, 'save')
  if (load?.outcome === 'restored') {
    setTimeout(() => overlay.toast('I found your island!'), 900)
  }

  /*
   * Ask the browser to keep her island, once she owns something worth keeping.
   *
   * Storage that is not marked persistent can be evicted under pressure with
   * no warning to anyone. Asked after the first friend or the first tile
   * rather than at boot: some browsers prompt, and a prompt on the opening
   * screen is the one most likely to be dismissed.
   */
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
   * never reach: the story hands over to the child at beat six and returns, she
   * can back out of that round, and a reload can land on any beat. All of those
   * left the flag false, so the opening replayed on every single load. See
   * opening.ts — the gate claims it the moment the story starts.
   */
  const opening = openingGate(loaded.openingSeen, () => persist())
  /*
   * What she is called. Empty until she has been asked, which happens once,
   * just before the story. Falls back to a neutral word rather than blocking:
   * a name prompt must never be a wall between a child and her game.
   */
  let childName = loaded.childName
  sign.setName(childName || 'my')
  // The tab follows her name too, once she has given one (#10).
  if (childName) document.title = `${childName}'s Island`

  const persist = (): Promise<void> =>
    saveIsland(store, PROFILE, flow, opening.seen(), childName, persistGranted)

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

  const overlay = createOverlay(document.body, {
    speech, sfx,
    onPassed: more => { void passed(more) },
    onDismissed: () => {
      stageFor(null)
      // Leaving costs nothing (brief section 18) — but the story must not stay
      // armed, or an unrelated hatch later would resume it out of nowhere.
      openingResumeAt = -1
      flow = handleChallengeDismissed(flow)
      overlay.say('Tap the egg to read it home — or tap the island for land!')
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
     * she is looking at it anyway; it is re-sited when it comes home.
     */
    if (stage.holds(egg.group)) return
    const clutter = props.clutter()
    const size = world.models.size

    const tiles: Axial[] = []
    for (const [k, type] of flow.island.tiles) {
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
   * Everything a pet must walk around: the scenery, and the egg.
   *
   * The egg was missing, so pets walked through it — the one object on the
   * island a child is meant to walk up to and tap had no substance at all.
   * Measured at walking height like the scenery, so the rule stays one rule.
   */
  function publishObstacles(): void {
    const solid = [...props.obstacles()]
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
     * Always visible, because they are now how she asks for land at all.
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
   * needs to SEE that she is getting somewhere - otherwise the work feels
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
   * tile she counted up. Brief §19 says none of it can be lost, and a plain
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
      { id: 'backup', label: 'Back up to a file', detail: `${friends} and this island` },
      { id: 'restore', label: 'Restore from a backup', detail: 'replaces what is here' },
      { id: 'story', label: 'Play the story again', detail: 'the opening, from the top' },
      { id: 'wipe', label: 'Start again', detail: `wipes this island and ${friends}` },
    ])
    if (choice === null) return

    if (choice === 'backup') { await backup(); return }
    if (choice === 'restore') { await restore(); return }
    /*
     * Brief §3 wants the story replayable forever. It used to be a tap on
     * Fred, which Joe hit mid-game — the intro restarted and walked her
     * through challenges that handed over an animal and then a tile. Still
     * available, now behind the PIN where a curious tap cannot reach it.
     */
    if (choice === 'story') { void runOpening(); return }

    const sure = await askConfirm(document.body, 'Start again?',
      [`This wipes this island and ${friends}.`, '', 'It cannot be undone.'].join('\n'),
      'wipe it', true)
    if (!sure) return
    /*
     * Through the store, not by reaching into localStorage.
     *
     * Removing the one key stopped working the moment there were two copies:
     * the IndexedDB document survived, the next load found it, and the island
     * came straight back. A parent-facing control that confirms a wipe and
     * then silently does nothing is a trust problem even though it fails in
     * the safe direction. removeProfile clears both copies and the ring.
     */
    void store.removeProfile(PROFILE).then(() => location.reload())
  }

  /**
   * Off the device, into a file the grown-up keeps.
   *
   * The only export route there is: brief §19 permits no accounts and no
   * network calls beyond static hosting, so this file is the difference
   * between a lost tablet costing an afternoon and costing everything she has
   * ever built.
   */
  async function backup(): Promise<void> {
    // Flush first. Backing up a save that is one ceremony out of date is a
    // subtle way of losing exactly the thing she just earned.
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
  // The channel is on the stamp because 'is this the build she plays?' is
  // the first question anyone looking at a screenshot needs answered.
  stamp.textContent = BUILD_STAMP + ' · ' + CHANNEL
    + (devBalance ? ' · fast' : '')
  stamp.title = 'build'
  document.body.append(stamp)

  /* ---------- the album ---------- */
  const album = createAlbum(document.body, speech)
  const albumBtn = document.createElement('button')
  albumBtn.className = 'chunk chunk-button album-button'
  albumBtn.textContent = '\u{1F4D6} friends'
  albumBtn.setAttribute('aria-label', 'open the album of friends')
  albumBtn.onclick = () => album.open(flow.pets)
  document.body.append(albumBtn)

  /* ---------- the two verbs ---------- */

  /**
   * Open a challenge ONLY if the flow transition actually moved us into one.
   *
   * Every wiring bug found at the M1 gate had the same shape: a transition
   * no-ops (wrong phase), main.ts opens the challenge anyway, the child does
   * the whole round, and challengePassed then matches no branch — so she gets
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
     * stage slot is transparent, and what she sees there IS the island.
     */
    /*
     * Both the egg and the tile go on the turntable — which is now a
     * TRANSPARENT container, so they read as floating freely over her island
     * rather than sitting in a box with its own grass and sky.
     */
    const piece = kind === 'read' ? egg.group
      : kind === 'sum' ? plot?.group ?? null
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

  function openRead(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'read') return
    overlay.clearSay()
    // Put the egg on the turntable first, then mount the round WITH the
    // layout — one call, so the mount's own teardown cannot drop it.
    const staged = stageFor('read', state)
    if (pageKind(state.readProgress) === 'build') {
      generateBuild(buildStore, { rng: defaultRng, drawGreen, level: 1 })
      overlay.openBuild(buildStore.history[buildStore.idx] as BuildItem, staged)
    } else {
      generateRead(readStore, { rng: defaultRng, drawGreen, drawRed, neigh, level: 1 })
      overlay.openWordFind(readStore.history[readStore.idx] as ReadPick[], staged)
    }
  }

  function openSum(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'sum') return
    generateAdd(sumStore, defaultRng, 1)
    overlay.clearSay()
    const staged = stageFor('sum', state)
    overlay.openSum(sumStore.history[sumStore.idx] as SumItem, staged)
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

      if (hatched) {
        /*
         * This egg is spent, so decide the NEXT friend and start fetching her
         * now — the next hatch is five pages away, which is minutes of cover
         * rather than the 700ms a breaking shell buys.
         *
         * Fire and forget, and it must stay that way: this runs alongside a
         * ceremony that locks the exits, and a preload nobody awaits cannot
         * extend that lock or deadlock it. `warm` never rejects, so the `void`
         * is not hiding a failure.
         */
        nextSpecies = drawSpecies()
        void pets.warm(nextSpecies)
        /*
         * SAVE FIRST, celebrate second.
         *
         * The pet exists in `flow` the moment handleChallengePassed returns,
         * but persist() used to run only after the ceremony — leaving a
         * two-second window in which closing the tab lost both the friend and
         * the page that earned her. Two seconds is not long unless it is the
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
          // If she has already left (collect-and-leave inside the win hold),
          // there is no stage to perform on; hatch in the world as before.
          const onStage = overlay.isOpen()
          /*
           * THE CEREMONY HAPPENS ON THE STAGE (§3 and §6), where she has been
           * watching.
           *
           * The first version closed the stage and then hatched the egg back in
           * the world — so the egg she had followed for five pages vanished at
           * the exact moment it finally mattered, and the payoff played out
           * somewhere she was not looking. Order now: burst and hatch in view,
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
          if (onStage && friend) {
            stage.show(null, world.scene)      // the shell has gone; send it home
            /*
             * Reframe for a PET, not an egg.
             *
             * The camera was framed for a 0.55 egg, and a pet is wider than it
             * is tall — so at the egg's framing she filled the vignette edge to
             * edge and her feet were cropped off the bottom. Pulling back a
             * little puts the whole friend on the plinth with air around her,
             * which is what being introduced to someone looks like.
             */
            stage.frame(0.68)
            stage.showTemp(friend, 0.44)
          }

          overlay.showName(name)
          fred.talk(2.4)
          fred.hop()

          /*
           * A beat with the friend on the plinth and her name on the card,
           * before the stage dissolves and she walks out into the world.
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
           * two things at once, and she will watch neither.
           */
          setTimeout(() => {
            // The card goes as the chip picks the name up, so the two read as
            // one movement rather than as the name existing twice.
            overlay.clearName()
            overlay.flyToAlbum(name, albumBtn)
          }, 900)
        })

        if (openingResumeAt >= 0) {
          const at = openingResumeAt
          openingResumeAt = -1
          setTimeout(() => { void runOpening(at) }, 2200)
        }
        return
      }

      // Not yet — but visibly closer. The egg cracks a little further, which
      // refresh() applies, and that IS the feedback. No name, no promise.
      sfx.play('up')
      refresh()
      // ...and on the stage she is watching, in view, as it happens (§6).
      refreshDots('read')

      if (!more || openingResumeAt >= 0) {
        stageFor(null); overlay.close()
        if (openingResumeAt >= 0) {
          const at = openingResumeAt
          openingResumeAt = -1
          setTimeout(() => { void runOpening(at) }, 600)
        }
        return
      }

      /*
       * Stay in the work. Reading five pages should feel like one sitting,
       * not five trips out to the island and back — the world only returns
       * when the friend arrives, or when she taps back.
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
      flow = challengePassed(flow)
      const earned = flow.island.tiles.size > tilesBefore

      if (earned) {
        /*
         * THE FLY-BACK (§6): flourish on the turntable, then the land arrives.
         *
         * Spec's own words for why: "the connective payoff between abstract
         * work and world position". She did sums on one side of the screen;
         * the ground appears on the other; the arc is the sentence that joins
         * them.
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
        // learned this; closing the tab mid-ceremony must not cost her the sum.
        const receipt = await commitState()
        void askToKeepIt()

        await ceremony(receipt, exits, async () => {
          // Fill the dots first: the sum that FINISHED the tile deserves to
          // be seen landing, and unstaging first meant the last dot never lit.
          overlay.setDots(DOT_COUNT, DOT_COUNT)
          world.lighting.celebrationBump()

          // The flourish plays while the plot is still on the turntable.
          const finished = plot
          const sited = plotAt
          finished?.setProgress(1, 1)
          await wait(balance.stage.flourishMs)

          // Down comes the stage, and the land arcs onto its socket.
          stageFor(null)
          overlay.close()
          /*
           * Joe: *"'You've counted up some land' sounds off. lets call it 'You
           * have found some land for your friends'"*.
           *
           * Note this MOVES the world-law vocabulary. script.ts records that land
           * is *counted up*, and the opening still says "can you count us up some
           * land?" — so the ask and the reward now use different words. Joe's call,
           * and the new line is better on its own terms (it names who the land is
           * FOR, which is the whole loop), but the opening line is the other half
           * and wants the same treatment when he next looks at the script.
           */
          speech.speak('You have found some land for your friends!')
          fred.talk(2.2)
          /*
           * In from the SIDE, to the socket she chose — never the middle.
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
           * The tile keeps EXACTLY what she built.
           *
           * She watched those eight things arrive one at a time; planting a
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
           * — coincident faces flicker, and she would see it.
           */
          dropPlot()
          world.lighting.celebrationBump()   // the move-in lift (lighting §4)
          refresh()
        })
        return
      }

      sfx.play('up')
      refresh()

      if (!more) { overlay.close(); return }

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
     * and the story only resumes if she finishes that round — dismissing it
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
       * Juno", which is exactly what she lost. Now the beat ends when the
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
   * A tap on the backdrop puts the offer away and gives her the island back.
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

  const TILE_FACE: Record<TileType, string> = { grass: '\u{1F33F}', water: '\u{1F30A}' }

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
      b.className = `chunk chunk-button offer-tile chunk-${t === 'water' ? 'water' : 'grass'}`
      b.textContent = TILE_FACE[t]
      b.setAttribute('aria-label', t === 'water' ? 'water' : 'grass')
      b.onclick = () => {
        const next = chooseTile(flow, t)
        flow = next
        /*
         * She asked at a socket, so choosing a kind SITES it — and then gets
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
   */
  function invite(which: Exclude<ReturnType<typeof activeGovernor>, 'none'>): void {
    const line = GOVERNOR_LINE[which]
    overlay.say(line)
    speech.speak(line)
    fred.talk(2.6)
    fred.hop()
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
    // "Zoom to location": move the camera's pivot onto the tile she tapped, so
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
    plot?.update(dt)
    props.update(dt, t)
    egg.update(dt, t)
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
     * play surface is one curious tap from everything she owns. But it is
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
   * Not awaited: boot goes on to ask her name and start the story, and neither
   * should wait on a GLB.
   */
  void pets.warm(nextSpecies)

  /*
   * Ask her name once, before the story.
   *
   * After the world is drawn, not before: asked first, she was answering into
   * a blank blue screen. Her island should be behind the question — it is
   * hers, and that is the whole reason for asking.
   *
   * Before the opening rather than after, so Fred can greet her by name in
   * his first line. A story that starts "hello friend" and switches to "hello
   * Juno" halfway reads as a bug.
   */
  if (!childName && !opening.seen()) {
    childName = await overlay.askName()
    sign.setName(childName || 'my')
    if (childName) { document.title = `${childName}'s Island`; void persist() }
  }

  if (!opening.seen()) {
    void runOpening()
  } else {
    overlay.say('Tap the egg to read it home — or tap the island for land!')
  }
}

boot().catch(err => {
  const el = document.getElementById('boot')
  if (el) el.textContent = 'Could not start: ' + err.message
  console.error(err)
})
