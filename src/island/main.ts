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
import { createEgg } from './egg'
import { createFred } from './fred'
import { createSign } from './sign'
import { createPropField } from './world/props'
import { createGrowingPlot } from './world/increments'
import type { GrowingPlot } from './world/increments'
import { createAlbum } from './album'
import { hatchProgress, landProgress, sumsForTile } from './flow'
import { pageKind } from './balance'
import { landPaused, eggsPaused, activeGovernor, GOVERNOR_LINE } from './governors'
import { OPENING, HATCH_LINES, fill } from './script'
import { loadIsland, saveIsland } from './save'
import { createLocalStore } from '../platform/storage'
import { createFlow, tapEgg, tapSum, askForLand, challengePassed, chooseTile, tileOffer } from './flow'
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
const PLOT_FAREWELL_MS = 1400

const canvas = document.getElementById('view') as HTMLCanvasElement

async function boot(): Promise<void> {
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

  const props = createPropField()
  world.scene.add(props.group)

  /*
   * The plot under construction (spec §2). Sited as soon as the child picks a
   * socket, then GROWN by each sum, so arithmetic visibly becomes ground.
   */
  let plot: GrowingPlot | null = null
  /** Set while a finished plot is showing its flourish before being removed. */
  let plotFarewell: ReturnType<typeof setTimeout> | null = null
  /** Tear a plot down now, cancelling any farewell in progress. */
  function dropPlot(): void {
    if (plotFarewell) { clearTimeout(plotFarewell); plotFarewell = null }
    if (plot) { world.scene.remove(plot.group); plot.dispose(); plot = null }
  }

  function showPlot(): void {
    if (!flow.plot) {
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
          world.scene.remove(going.group)
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
      plot = createGrowingPlot(flow.plot.type, world.models.size, {
        models: world.models,
        prop: name => props.load(name),
      })
      const w = world.worldOf(flow.plot.at)
      plot.group.position.copy(w)
      world.scene.add(plot.group)
    }
    plot.setProgress(flow.sumProgress, sumsForTile(flow))
  }

  const egg = createEgg()
  world.scene.add(egg.group)
  world.pickables.push(egg.group)

  const fred = createFred()
  world.scene.add(fred.group)
  world.pickables.push(fred.group)

  /*
   * Her signpost, on the home tile. The one place the world says out loud
   * that it belongs to her — and it is IN the island rather than on top of
   * it, so she can turn the camera round it and it is still there.
   */
  // Lettered once the save has been read; see below.
  const sign = createSign('')
  world.scene.add(sign.group)

  /* Saves. One profile for now; profiles proper arrive in M3. */
  const store = createLocalStore()
  const PROFILE = 'juno'
  /** Her name where the script wants one, or something friendly if she skipped. */
  const child = (): string => childName || 'friend'
  const loaded = await loadIsland(store, PROFILE)
  let openingSeen = loaded.openingSeen
  /*
   * What she is called. Empty until she has been asked, which happens once,
   * just before the story. Falls back to a neutral word rather than blocking:
   * a name prompt must never be a wall between a child and her game.
   */
  let childName = loaded.childName
  sign.setName(childName || 'my')
  // The tab follows her name too, once she has given one (#10).
  if (childName) document.title = `${childName}'s Island`

  const persist = (): void => { void saveIsland(store, PROFILE, flow, openingSeen, childName) }

  flow = loaded.flow

  const overlay = createOverlay(document.body, {
    speech, sfx,
    onPassed: more => { void passed(more) },
    onDismissed: () => {
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
  function placeEgg(): void {
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
        if (room >= NEEDED) { egg.setPosition(x, z); return }
        if (room > 0 && (!best || room > best.room)) best = { x, z, room }
      }
    }

    // Nowhere roomy: take the best of a bad lot rather than none at all.
    if (best) { egg.setPosition(best.x, best.z); return }
    const home = toWorld({ q: 0, r: 0 }, size)
    egg.setPosition(home.x, home.z)
  }

  function refresh(): void {
    world.setIsland(flow.island)
    void props.sync(flow.island, world.models.size, world.surface).then(() => {
      pets.setObstacles(props.obstacles())
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
    world.showSockets(flow.phase === 'placing')
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
   * tile she counted up. Brief §18 says none of it can be lost, and a plain
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
  gearBtn.onclick = () => {
    const d = new Date()
    // DDMM, exactly as v0:1080 computes it.
    const pin = String(d.getDate()).padStart(2, '0')
      + String(d.getMonth() + 1).padStart(2, '0')
    const entry = prompt('Grown-ups only — PIN please:')
    if (entry === null) return
    if (entry.trim() !== pin) { overlay.toast('Wrong PIN'); return }

    const n = flow.pets.length
    const what = n === 0 ? 'this island' : `this island and ${n} friend${n === 1 ? '' : 's'}`
    if (!confirm(`Start again? This wipes ${what}.`)) return
    try { localStorage.removeItem('petIsland.v1.' + PROFILE + '.save') } catch { /* ignore */ }
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
  stamp.textContent = BUILD_STAMP
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
  function openRead(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'read') return
    overlay.clearSay()
    if (pageKind(state.readProgress) === 'build') {
      generateBuild(buildStore, { rng: defaultRng, drawGreen, level: 1 })
      overlay.openBuild(buildStore.history[buildStore.idx] as BuildItem)
      return
    }
    generateRead(readStore, { rng: defaultRng, drawGreen, drawRed, neigh, level: 1 })
    overlay.openWordFind(readStore.history[readStore.idx] as ReadPick[])
  }

  function openSum(state: Flow = flow): void {
    if (state.phase !== 'challenge' || state.challenge !== 'sum') return
    generateAdd(sumStore, defaultRng, 1)
    overlay.clearSay()
    overlay.openSum(sumStore.history[sumStore.idx] as SumItem)
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
      const species = SPECIES[ri(defaultRng, SPECIES.length)] as string
      const petsBefore = flow.pets.length

      flow = handleChallengePassed(flow, { name, species })
      const hatched = flow.pets.length > petsBefore

      if (hatched) {
        overlay.close()
        await egg.hatch()
        overlay.showName(name)
        const line = HATCH_LINES[flow.pets.length % HATCH_LINES.length] as string
        speech.speak(fill(line, child(), name))
        fred.talk(2.4)
        fred.hop()
        world.lighting.celebrationBump()
        egg.reset()
        refresh()
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

      if (!more || openingResumeAt >= 0) {
        overlay.close()
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
        overlay.close()
        speech.speak('You counted us up some land!')
        fred.talk(2.2)
        world.lighting.celebrationBump()
        refresh()
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
        if (next.challenge !== 'sum') { overlay.close(); return }
        flow = next
        openSum()
      }, PAGE_GAP_MS)
    }
  }

  /* ---------- the opening: Fred's Lonely Rock (brief section 3) ---------- */

  let inOpening = false
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
      speech.speak(text)
      fred.talk(Math.min(6, text.length * 0.06))
      if (beat.cue === 'egg-arrives') fred.hop()

      await waitForTap()
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
        overlay.say('Pick some land, then choose where it goes!')
        break
      }
    }

    overlay.clearSay()
    inOpening = false
    openingSeen = true
    persist()
  }

  /** Tap anywhere to advance a beat. */
  function waitForTap(): Promise<void> {
    return new Promise(resolve => {
      const done = (): void => {
        window.removeEventListener('pointerdown', done, true)
        resolve()
      }
      window.addEventListener('pointerdown', done, true)
      // Never trap a child who does not tap: move on by itself.
      setTimeout(done, 6500)
    })
  }

  /* ---------- the pick-of-three tile offer ---------- */

  const offerBox = document.createElement('div')
  offerBox.className = 'overlay hide'
  const offerInner = document.createElement('div')
  offerInner.className = 'chunk overlay-panel offer'
  offerBox.append(offerInner)
  document.body.append(offerBox)

  const TILE_FACE: Record<TileType, string> = { grass: '\u{1F33F}', water: '\u{1F30A}' }

  function renderOffer(): void {
    const offer = flow.phase === 'placing' && !flow.chosen ? tileOffer(flow) : []
    offerBox.classList.toggle('hide', offer.length === 0)
    offerInner.replaceChildren()
    offer.forEach((t, i) => {
      const b = document.createElement('button')
      b.className = `chunk chunk-button offer-tile chunk-${t === 'water' ? 'water' : 'grass'}`
      b.textContent = TILE_FACE[t]
      b.setAttribute('aria-label', t === 'water' ? 'water' : 'grass')
      b.onclick = () => {
        flow = chooseTile(flow, t)
        overlay.say('Now tap where it goes!')
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
    storyPlaying: () => inOpening,
    // The governors are asked BEFORE the transition now (see interactions.ts),
    // so these just open. A port that declined here used to strand the flow
    // in 'challenge' with no overlay and no way out but a reload.
    openRead: state => { openRead(state) },
    openSum: state => { openSum(state) },
    eggsPaused,
    landPaused,
    invite,
    replayStory: () => { void runOpening() },
    bouncePet: id => pets.bounce(id),
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
  if (location.search.includes('debug')) {
    ;(window as unknown as Record<string, unknown>).__world = {
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

  /*
   * Ask her name once, before anything else happens.
   *
   * Before the opening rather than after, so Fred can use it from his first
   * line — being greeted by name is the whole point, and a story that starts
   * "hello friend" and switches to "hello Juno" halfway reads as a bug.
   */
  if (!childName && !openingSeen) {
    childName = await overlay.askName()
    sign.setName(childName || 'my')
  // The tab follows her name too, once she has given one (#10).
  if (childName) document.title = `${childName}'s Island`
    if (childName) persist()
  }

  refresh()
  world.start()
  document.getElementById('boot')?.remove()

  if (!openingSeen) {
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
