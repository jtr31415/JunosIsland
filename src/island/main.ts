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
import {
  createFlow, tapEgg, tapSum, challengePassed, challengeFailed,
  chooseTile, placeTile, tileOffer,
} from './flow'
import type { Flow } from './flow'
import type { TileType } from './world/grid'
import { sockets } from './world/grid'
import { toWorld } from './world/hex'

import { createSpeaker } from '../platform/speech'
import { createSfx } from '../platform/audio'
import { defaultRng, ri } from '../core/rng'
import { makeDeck } from '../core/decks'
import { GREEN, RED } from '../core/wordlists'
import { buildPool, buildNeighbours } from '../core/neighbours'
import { generateRead } from '../core/generators/read'
import { generateAdd } from '../core/generators/sums'
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
  const readStore = { history: [], idx: -1 } as { history: any[]; idx: number }
  const sumStore = { history: [], idx: -1 } as { history: any[]; idx: number }

  let flow: Flow = createFlow()

  const pets = createPetField()
  world.scene.add(pets.group)
  world.pickables.push(pets.group)

  const egg = createEgg()
  world.scene.add(egg.group)
  world.pickables.push(egg.group)

  const overlay = createOverlay(document.body, {
    speech, sfx,
    onPassed: () => { void passed() },
    onDismissed: () => { flow = challengeFailed(flow); refresh() },
  })

  /** Put the egg just off the island's edge, bobbing in the shallows. */
  function placeEgg(): void {
    const s = sockets(flow.island)[0]
    if (!s) return
    const w = toWorld(s, world.models.size)
    egg.setPosition(w.x, w.z)
  }

  function refresh(): void {
    world.setIsland(flow.island)
    world.showSockets(flow.phase === 'placing')
    void pets.sync(flow.pets, flow.island, world.models.size)
    if (flow.phase !== 'placing') placeEgg()
    renderOffer()
  }

  /* ---------- the two verbs ---------- */

  function openRead(): void {
    generateRead(readStore as never, {
      rng: defaultRng, drawGreen, drawRed, neigh, level: 1,
    } as never)
    overlay.openWordFind(readStore.history[readStore.idx])
  }

  function openSum(): void {
    generateAdd(sumStore as never, defaultRng, 1)
    overlay.openSum(sumStore.history[sumStore.idx])
  }

  async function passed(): Promise<void> {
    if (flow.challenge === 'read') {
      const name = petName(defaultRng)
      const species = SPECIES[ri(defaultRng, SPECIES.length)] as string
      await egg.hatch()
      flow = challengePassed(flow, { name, species })
      overlay.showName(name)
      speech.speak(name + '! Home at last!')
      egg.reset()
      refresh()
    } else if (flow.challenge === 'sum') {
      flow = challengePassed(flow)
      speech.speak('You counted us up some land!')
      refresh()
    }
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

  canvas.addEventListener('pointerdown', e => {
    if (overlay.isOpen()) return
    const hit = world.pick(e.clientX, e.clientY)
    if (!hit) return

    if (hit.kind === 'egg' && flow.phase === 'free') {
      flow = tapEgg(flow)
      openRead()
      return
    }

    if (hit.kind === 'socket' && flow.phase === 'placing' && flow.chosen) {
      flow = placeTile(flow, hit.axial)
      overlay.clearSay()
      sfx.play('win')
      refresh()
      return
    }

    if (hit.kind === 'pet') {
      pets.bounce(hit.id)
      const p = flow.pets.find(x => x.id === hit.id)
      if (p) speech.speak(p.name)
      return
    }

    // Tapping the island itself asks for land: a sum earns a tile.
    if (hit.kind === 'tile' && flow.phase === 'free') {
      flow = tapSum(flow)
      openSum()
    }
  })

  world.onFrame((dt, t) => {
    egg.update(dt, t)
    pets.update(dt, t, flow.island, world.models.size)
  })

  refresh()
  world.start()
  document.getElementById('boot')?.remove()
  overlay.say('Tap the egg to read it home — or tap the island for land!')
}

boot().catch(err => {
  const el = document.getElementById('boot')
  if (el) el.textContent = 'Could not start: ' + err.message
  console.error(err)
})
