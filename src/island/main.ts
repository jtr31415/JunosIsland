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
import { createAlbum } from './album'
import { hatchProgress, landProgress } from './flow'
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
    onPassed: () => { void passed() },
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
   * open water. It washed ashore; it is not floating out at sea waiting to be
   * fetched, and a child should never have to tap the ocean to reach it.
   *
   * Preference order: a coastal grass tile (one with an empty neighbour), then
   * any grass tile, then the home rock.
   */
  function placeEgg(): void {
    const open = new Set(sockets(flow.island).map(key))
    let best: Axial | null = null
    let bestIsCoastal = false

    for (const [k, type] of flow.island.tiles) {
      if (type !== 'grass') continue
      const parts = k.split(',').map(Number)
      const a: Axial = { q: parts[0] as number, r: parts[1] as number }
      const coastal = neighbours(a).some(n => open.has(key(n)))
      // Keep off the home rock unless it is all we have: Fred stands there.
      const isHome = a.q === 0 && a.r === 0
      if (isHome && flow.island.tiles.size > 1) continue
      if (!best || (coastal && !bestIsCoastal)) { best = a; bestIsCoastal = coastal }
      if (coastal) break
    }

    const at = best ?? { q: 0, r: 0 }
    const w = toWorld(at, world.models.size)
    // Nudged toward the tile's edge so it reads as washed up, not placed.
    egg.setPosition(w.x + world.models.size * 0.3, w.z + world.models.size * 0.3)
  }

  function refresh(): void {
    world.setIsland(flow.island)
    void props.sync(flow.island, world.models.size)
      .then(() => pets.setObstacles(props.obstacles()))
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

  /* ---------- the album ---------- */
  const album = createAlbum(document.body)
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

  async function passed(): Promise<void> {
    if (flow.challenge === 'read') {
      const name = petName(defaultRng)
      const species = SPECIES[ri(defaultRng, SPECIES.length)] as string
      await egg.hatch()
      flow = handleChallengePassed(flow, { name, species })
      overlay.showName(name)
      const line = HATCH_LINES[flow.pets.length % HATCH_LINES.length] as string
      speech.speak(fill(line, CHILD, name))
      fred.talk(2.2)
      fred.hop()
      world.lighting.celebrationBump()
      egg.reset()
      refresh()
      if (openingResumeAt >= 0) {
        const at = openingResumeAt
        openingResumeAt = -1
        setTimeout(() => { void runOpening(at) }, 2200)
      }
    } else if (flow.challenge === 'sum') {
      openingResumeAt = -1
      flow = challengePassed(flow)
      speech.speak('You counted us up some land!')
      refresh()
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
