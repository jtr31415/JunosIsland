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
import { createWorld } from './scene'
import { createOverlay } from './overlay'
import { createPetField, SPECIES } from './pets'
import { createEgg } from './egg'
import { createFred } from './fred'
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
import { createFlow, tapEgg, tapSum, challengePassed, chooseTile, tileOffer } from './flow'
import {
  handleWorldTap, handleChallengePassed, handleChallengeDismissed,
} from './interactions'
import type { InteractionPorts } from './interactions'
import type { Flow } from './flow'
import type { TileType } from './world/grid'
import { sockets } from './world/grid'
import { toWorld, key, neighbours } from './world/hex'
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
 * Long enough to see that the answer landed, short enough that it reads as
 * turning a page rather than waiting for something. The page is fully visible
 * for all of it — this is a pause, not a loading gap.
 */
const PAGE_GAP_MS = 700

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
  function showPlot(): void {
    if (!flow.plot) {
      if (plot) { world.scene.remove(plot.group); plot.dispose(); plot = null }
      return
    }
    if (!plot) {
      plot = createGrowingPlot(flow.plot.type, world.models.size)
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

  /* Saves. One profile for now; profiles proper arrive in M3. */
  const store = createLocalStore()
  const PROFILE = 'juno'
  const CHILD = 'Juno'
  const loaded = await loadIsland(store, PROFILE)
  let openingSeen = loaded.openingSeen

  const persist = (): void => { void saveIsland(store, PROFILE, flow, openingSeen) }

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
   * The egg sits ON the shore — an owned tile at the island's edge — never in
   * open water, and never inside a tree.
   *
   * The scenery pass made that second condition real: once most tiles grew a
   * clump, an egg placed at a fixed offset simply disappeared into one, and an
   * invisible egg is an unplayable game. So the spot is chosen CLEAR of the
   * obstacles the prop field reports, trying several positions around the tile
   * before settling.
   *
   * Preference: a coastal grass tile, then any grass tile, then the home rock.
   */
  function placeEgg(): void {
    const open = new Set(sockets(flow.island).map(key))
    const blocks = props.obstacles()
    const size = world.models.size

    const candidates: Axial[] = []
    for (const [k, type] of flow.island.tiles) {
      if (type !== 'grass') continue
      const parts = k.split(',').map(Number)
      const a: Axial = { q: parts[0] as number, r: parts[1] as number }
      if (a.q === 0 && a.r === 0 && flow.island.tiles.size > 1) continue
      const coastal = neighbours(a).some(n => open.has(key(n)))
      if (coastal) candidates.unshift(a) 
      else candidates.push(a)
    }
    if (!candidates.length) candidates.push({ q: 0, r: 0 })

    const clearOf = (x: number, z: number): boolean =>
      blocks.every(o => Math.hypot(x - o.x, z - o.z) > o.r + size * 0.18)

    // Try each tile, and several spots around each, until one is in the open.
    for (const a of candidates) {
      const w = toWorld(a, size)
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2
        const x = w.x + Math.cos(ang) * size * 0.42
        const z = w.z + Math.sin(ang) * size * 0.42
        if (clearOf(x, z)) { egg.setPosition(x, z); return }
      }
      if (clearOf(w.x, w.z)) { egg.setPosition(w.x, w.z); return }
    }

    // Nowhere clear: put it on the home rock, which props always leave empty.
    const home = toWorld({ q: 0, r: 0 }, size)
    egg.setPosition(home.x + size * 0.32, home.z + size * 0.32)
  }

  function refresh(): void {
    world.setIsland(flow.island)
    void props.sync(flow.island, world.models.size).then(() => {
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

  /* ---------- reset (a testing tool, not a game feature) ----------
   *
   * Deliberately plain, small and cornered: nothing a child would reach for,
   * and it asks before it wipes. The guardrails say nothing she owns can be
   * lost, so BEFORE Juno plays unsupervised this belongs behind the 2D game's
   * DDMM PIN gear, not on the screen. It is here to make testing the pacing
   * bearable while the economy is still being tuned.
   */
  const resetBtn = document.createElement('button')
  resetBtn.className = 'dev-reset'
  resetBtn.textContent = 'reset island'
  resetBtn.title = 'Wipe this island and start again (testing tool)'
  resetBtn.onclick = () => {
    const n = flow.pets.length
    const what = n === 0 ? 'this island' : `this island and ${n} friend${n === 1 ? '' : 's'}`
    if (!confirm(`Start again? This wipes ${what}.`)) return
    try { localStorage.removeItem('petIsland.v1.' + PROFILE + '.save') } catch { /* ignore */ }
    location.reload()
  }
  document.body.append(resetBtn)

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
        speech.speak(fill(line, CHILD, name))
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
      const bankedBefore = flow.bankedTiles
      flow = challengePassed(flow)
      const earned = flow.bankedTiles > bankedBefore

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
        flow = tapSum({ ...flow, phase: 'free' })
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
      const text = fill(beat.line, CHILD, flow.pets[0]?.name ?? 'your friend')

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
        overlay.clearSay()
        flow = tapSum(flow)
        openSum()
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
    openRead: state => {
      if (eggsPaused(state)) { invite('nursery-queue'); return }
      openRead(state)
    },
    openSum: state => {
      if (landPaused(state)) { invite('space-surplus'); return }
      openSum(state)
    },
    replayStory: () => { void runOpening() },
    bouncePet: id => pets.bounce(id),
    say: text => overlay.say(text),
    clearSay: () => overlay.clearSay(),
    speak: text => { speech.speak(text) },
    win: () => sfx.play('win'),
  }

  canvas.addEventListener('pointerdown', e => {
    const before = flow
    flow = handleWorldTap(flow, world.pick(e.clientX, e.clientY), ports)
    if (flow !== before) refresh()
  })

  world.onFrame((dt, t) => {
    plot?.update(dt)
    props.update(dt, t)
    egg.update(dt, t)
    pets.update(dt, t, flow.island, world.models.size)
  })

  world.onFrame((dt, t) => fred.update(dt, t))

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
