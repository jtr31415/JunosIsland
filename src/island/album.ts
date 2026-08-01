/**
 * The album: every friend read home, with the name she gave them.
 *
 * Pets are never lost or taken (brief section 5), so this is a record of
 * ownership, not a checklist. There are no locked slots, no percentages and
 * nothing to complete — an empty album says "your friends will appear here",
 * never "you are missing 23".
 *
 * Portraits are RENDERED from the live models rather than drawn: hand-drawn
 * art for a ~1,000-variant space is impossible and would drift from the models
 * the moment either changed. Same code path will feed the Pet-o-matic.
 *
 * ## The pop-out
 *
 * Joe: *"some improvements to the album. if you click it, it should pop out
 * bigger with an option to find it on the map and a button to read its name.
 * the pop out album should rotate it as well."* And then: *"on the pop out card
 * with the animal in large, we also need as info its species."*
 *
 * So a tap on a friend opens her big, turning slowly, with her name, her
 * species, a button that says both out loud, and a way to go and find her.
 *
 * Three things about how it is built are load-bearing:
 *
 *   - **It draws through the world's own renderer.** The grid's thumbnails come
 *     from a second, offscreen GL context that renders each portrait ONCE; a
 *     rotating pet is a live loop, and `scene.ts` calls two live contexts on a
 *     mid-range tablet "the expensive way to do this". So the pop-out reuses
 *     `stage.ts` — the same turntable the hatch spins an egg on — scissored into
 *     the rect this card's own slot happens to occupy, exactly as the challenge
 *     vignette is. One context, one `requestAnimationFrame`, and the spin, the
 *     bob and the pop-in all come free and already tuned.
 *   - **The pet comes from `pets.preview`, not from a loader of our own.** The
 *     album's portrait renderer has its own `GLTFLoader` and therefore misses
 *     the face-decal UV fix that `pets.ts` applies to every shared prototype —
 *     harmless while the island is all natural colours, and a bug the day item 7
 *     dresses anybody. Borrowing the island's own cache means the friend on this
 *     card is literally the friend on the island, patched the same way, and one
 *     fewer copy of a 140KB model in memory.
 *   - **The card is a hole, not a card.** Anything drawn into the canvas is
 *     BEHIND every piece of DOM, so a pop-out on an opaque paper panel would
 *     render the pet underneath it and show nothing. The pop-out is therefore
 *     laid out like a staged round: a transparent slot for the friend, a paper
 *     chunk for the words. Which also means the grid has to step aside while it
 *     is up — see `popOpen`.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { flattenImported } from './lighting'
import { createStage } from './stage'
import { speciesName } from './script'
import { setById } from './variants/sets'
import type { Pet } from './flow'
import type { Speaker } from '../platform/speech'

/** One offscreen renderer, reused for every portrait. */
function createPortraitRenderer(size = 192): {
  shoot(species: string): Promise<string | null>
} {
  const scene = new THREE.Scene()
  // Same three-light temperament as the island, so portraits match the world.
  const hemi = new THREE.HemisphereLight(0xbfe3ff, 0xffd9a0, 1.1)
  const key = new THREE.DirectionalLight(0xffe3b3, 1.9)
  key.position.set(3, 5, 4)
  scene.add(hemi, key)

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
  const loader = new GLTFLoader()
  const cache = new Map<string, string>()

  /**
   * The second GL context, made on FIRST USE and never insisted upon.
   *
   * It used to be created in `createAlbum`, which meant the album could not be
   * constructed at all without a GPU — so the one part of this file with any
   * decisions in it had no test, and this project's own repeat offender is the
   * feature that was dead behind a mock (HANDOFF §5). Deferring it is what lets
   * a test build the real album and tap a real cell.
   *
   * And a failure is a shrug rather than a throw. By the time this runs the game
   * has already got a context for the world, so a second one failing means the
   * browser is at its limit — in which case thumbnails are the right thing to
   * lose. Her friends, their names and the pop-out all still work.
   */
  let renderer: THREE.WebGLRenderer | null = null
  let unavailable = false

  const gl = (): THREE.WebGLRenderer | null => {
    if (renderer || unavailable) return renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(size, size)
      renderer.setPixelRatio(1)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
    } catch {
      unavailable = true
      renderer = null
    }
    return renderer
  }

  return {
    async shoot(species) {
      const hit = cache.get(species)
      if (hit) return hit
      const r = gl()
      if (!r) return null

      const gltf = await loader.loadAsync(`pets/${species}.glb`)
      flattenImported(gltf.scene)
      const model = gltf.scene

      // Frame the model from its own bounds, so every species fills the
      // portrait the same amount whatever its actual size.
      const bounds = new THREE.Box3().setFromObject(model)
      const centre = bounds.getCenter(new THREE.Vector3())
      const radius = bounds.getSize(new THREE.Vector3()).length() / 2
      model.position.sub(centre)
      model.rotation.y = Math.PI * 0.18        // three-quarter view, not flat-on

      scene.add(model)
      camera.position.set(0, radius * 0.35, radius * 3.1)
      camera.lookAt(0, 0, 0)
      r.render(scene, camera)
      const url = r.domElement.toDataURL('image/png')
      scene.remove(model)

      cache.set(species, url)
      return url
    },
  }
}

/**
 * One thing the card says about a friend.
 *
 * A LIST rather than three named fields, because the list is about to grow. Item
 * 7 makes a pet `{setId, speciesId}`, at which point this card reads "Cherry —
 * Fox" and there are three facts, not two. Laying two out centred and adding a
 * third later means re-doing the layout on the day the interesting thing lands;
 * the rows are top-aligned against a reserved third instead, so the name and the
 * species do not move when the colour arrives (see `.album-facts`, tokens.css).
 */
export interface AlbumFact {
  kind: 'name' | 'species' | 'set'
  text: string
}

/**
 * How many rows the card is laid out for, filled or not.
 *
 * Exported so the CSS's reservation and this module agree by reference rather
 * than by coincidence, and so a test can say what the number is FOR.
 */
export const FACT_ROWS = 3

/**
 * What the card says, in reading order.
 *
 * `setId` is not on `Pet` yet — item 7 adds it to the save — so it is accepted
 * as an optional extra rather than waited for. The day it lands, this function
 * already answers with three facts and the card already has a row for the third.
 *
 * The NATURAL set is deliberately not shown. Every pet in the shipped build is
 * natural (PHASE3-HANDOVER §5), so a "Natural" line would be a third row of
 * nothing on every card in the album, which is the opposite of what the row is
 * being kept for.
 */
export function petFacts(pet: Pet & { setId?: string }): AlbumFact[] {
  const facts: AlbumFact[] = [
    { kind: 'name', text: pet.name },
    { kind: 'species', text: speciesName(pet.species) },
  ]
  const set = pet.setId ? setById(pet.setId) : undefined
  if (set && set.id !== 'natural') facts.push({ kind: 'set', text: set.name })
  return facts
}

/**
 * Where the camera should look to find a friend.
 *
 * Pure, and exported, because it is the whole of the rule and the rule has one
 * trap in it either side.
 *
 * **`live` wins.** `flow.pets[].at` is where a friend HATCHED; wandering happens
 * on the live scene-graph roots in `pets.ts` and is never written back to the
 * flow. Flying to the hatch spot would have been "find where it came from",
 * which on a grown island is a different tile entirely — and the whole reason
 * this button exists is that Juno went looking round the island for her animals
 * unprompted (PHASE3-HANDOVER §10).
 *
 * **The height is dropped.** A bee hovers at `TREE_HEIGHT`, and the camera's
 * pivot is not clamped vertically — `clampGoal` is horizontal only, because the
 * island is flat. So handing the pivot a y of 2.3 leaves it up in the air for
 * the rest of the session: every later spin orbits a point above the ground and
 * nothing brings it back down, since `frame()` only carries it in x and z. The
 * ground under a friend is what she means by where it is.
 */
export function focusPoint(
  live: THREE.Vector3 | null, hatched: THREE.Vector3,
): THREE.Vector3 {
  const at = live ?? hatched
  return new THREE.Vector3(at.x, 0, at.z)
}

/**
 * How big the friend is framed on the pop-out, and how big she is fitted.
 *
 * The hatch's own numbers (`main.ts` uses `frame(0.68)` / `showTemp(_, 0.44)`),
 * pulled in a little because this slot is most of the screen rather than 45% of
 * it — the same framing in a bigger rect is already a bigger animal, and being
 * introduced to someone wants air around them either way.
 */
const POP_FRAME = 0.60
const POP_FIT = 0.46

/**
 * Where the camera AIMS, as a fraction of the framing radius.
 *
 * DERIVED from the fit rather than picked, and it is the difference between a
 * friend in the middle of her half of the card and a friend sitting on the
 * bottom edge of it. `stage.frame`'s default aims at 0.8 of the radius — right
 * for the hatch, where the vignette is a tall slot beside a panel — which here
 * is 0.48 units up while the pet's own middle is at 0.23, so she was framed a
 * whole body-height below where the lens was looking. Checked by eye, twice.
 *
 * The eye sits a little above the aim, so she is seen very slightly from above:
 * looking down on a friend reads as looking AT her, whereas dead level reads as
 * a specimen photograph.
 */
const POP_LOOK = POP_FIT / 2 / POP_FRAME
const POP_EYE = POP_LOOK * 1.5

/**
 * Everything the album needs from the world, and it is all REQUIRED.
 *
 * Not optional, and not defaulted. Every capability here has a control on the
 * card, so a port quietly missing is a button that quietly does nothing — which
 * is the exact shape of the four dead features HANDOFF §5 lists. Making them
 * mandatory means `tsc` catches a forgotten wire before a child does.
 */
export interface AlbumWorld {
  /**
   * A standalone copy of a species — `pets.preview`.
   *
   * MUST come from the island's own cache. It is a clone, so it shares geometry
   * and materials with every other pet of that species: it is detached when the
   * card closes and never disposed (brief §19, and the note on `stage.showTemp`).
   */
  preview(species: string): Promise<THREE.Object3D>
  /** Where a friend is standing right now — `pets.positionOf`. Null if not out yet. */
  livePosition(id: string): THREE.Vector3 | null
  /** Where she hatched. The fallback, for a friend whose model is still in flight. */
  hatchPosition(pet: Pet): THREE.Vector3
  /** Turn the island about a point. The camera owns the easing and the clamp. */
  focusOn(point: THREE.Vector3): void
  /** The world's per-frame tick. The pop-out turns on this, not on a loop of its own. */
  onFrame(fn: (dt: number, t: number) => void): void
  /** Draw after the world, into the shared renderer. */
  onOverlayFrame(fn: (renderer: THREE.WebGLRenderer) => void): void
}

export interface Album {
  open(pets: readonly Pet[]): void
  close(): void
  isOpen(): boolean
  /** Which friend is popped out, if any. For diagnostics and for tests. */
  popped(): Pet | null
}

/**
 * @param speech The SAME Speaker the reading game uses.
 *
 * This is not optional. A bare `new SpeechSynthesisUtterance(name)` takes the
 * browser's default voice, which on most machines is a US or robotic one —
 * so pet names in the album sounded nothing like the same names spoken during
 * a hatch. The ported speaker carries the en-GB ranking, the rate and the
 * stuck-engine fallback that were tuned on the child's actual device; the
 * album has no business having its own voice.
 */
export function createAlbum(
  root: HTMLElement, speech: Speaker, world: AlbumWorld, onClose?: () => void,
): Album {
  const layer = document.createElement('div')
  layer.className = 'album hide'

  const card = document.createElement('div')
  card.className = 'chunk album-card'

  const title = document.createElement('h2')
  title.className = 'album-title'

  const grid = document.createElement('div')
  grid.className = 'album-grid'

  const shut = document.createElement('button')
  shut.className = 'chunk chunk-button album-close'
  shut.textContent = '✕'
  shut.setAttribute('aria-label', 'close the album')

  card.append(shut, title, grid)
  layer.append(card)

  /* ---------- the pop-out ---------- */

  const pop = document.createElement('div')
  pop.className = 'album-pop hide'

  /*
   * Transparent, and `pointer-events: none` in the CSS — both halves matter.
   *
   * Nothing may be painted behind the slot or the friend is drawn underneath it
   * (see the header), and letting taps fall THROUGH the card to the layer is
   * what makes "tap beside it to go back" one line rather than a hit test. The
   * paper panel and the close button take their pointer events back.
   */
  const popCard = document.createElement('div')
  popCard.className = 'album-pop-card'

  /**
   * The hole the friend is drawn into.
   *
   * Empty and transparent on purpose, exactly like `.stage-slot`: CSS owns where
   * it ends up and the renderer only asks. That is what lets the split reflow on
   * a portrait tablet without this file knowing anything about it.
   */
  const slot = document.createElement('div')
  slot.className = 'album-pop-stage'

  const panel = document.createElement('div')
  panel.className = 'chunk album-pop-panel'

  const factRows = document.createElement('div')
  factRows.className = 'album-facts'

  const actions = document.createElement('div')
  actions.className = 'album-pop-actions'

  /**
   * The button that reads her name out.
   *
   * It replaces a tap on the grid cell, which is what used to speak. Joe asked
   * for a button, and a button is better than a whole cell for the reason the
   * challenge X is better than a text link: it says what it does with a symbol,
   * and it is nowhere near the thing she taps to open the card.
   */
  const say = document.createElement('button')
  say.className = 'chunk chunk-button album-say'
  say.textContent = '\u{1F50A} say the name'
  say.setAttribute('aria-label', "say this friend's name")

  const find = document.createElement('button')
  find.className = 'chunk chunk-button album-find'
  find.textContent = '\u{1F50D} find on the map'
  find.setAttribute('aria-label', 'find this friend on the island')

  actions.append(say, find)

  /**
   * The way back to the grid, in the PANEL's own corner.
   *
   * Not in a corner of the screen, which is how it was first built and where it
   * landed straight on top of the egg-and-land progress card — the same class of
   * collision as HANDOFF §6's "dev buttons all share `.dev-reset`". Top-left is
   * the progress card, top-right is the album button itself, and two round
   * buttons stacked in one corner is a coin toss.
   *
   * The card's own ✕ sits in exactly this place, so it is also the cross she has
   * already met once in this feature.
   */
  const popShut = document.createElement('button')
  popShut.className = 'chunk chunk-button album-pop-close'
  popShut.textContent = '✕'
  popShut.setAttribute('aria-label', 'back to the album')

  panel.append(popShut, factRows, actions)
  popCard.append(slot, panel)
  pop.append(popCard)

  root.append(layer, pop)

  const portraits = createPortraitRenderer()

  /**
   * The turntable the friend turns on: a SECOND `Stage`, not a second renderer.
   *
   * Same module the hatch uses, so the spin rate comes from
   * `balance.stage.spinSec`, the pop-in overshoots and settles, and the lighting
   * is the island's own preset. It draws into the shared canvas through
   * `onOverlayFrame` — see the header for why that is not negotiable on this
   * tablet.
   */
  const showcase = createStage()

  /** The friend on the card, or null when the pop-out is down. */
  let current: Pet | null = null

  const hide = (): void => {
    popDown(false)
    layer.classList.add('hide')
    onClose?.()
  }

  /**
   * Take the pop-out down.
   *
   * `back` is whether the grid comes back up. It does when she closes the card;
   * it does not when the card closed because she asked to go and look at the
   * island, since the album would then be standing in front of the thing she
   * asked to see.
   *
   * The friend is DETACHED, never disposed — she is a clone sharing geometry and
   * materials with every other pet of her species, including ones on the island
   * right now (brief §19).
   */
  function popDown(back: boolean): void {
    if (!current) return
    current = null
    showcase.showTemp(null)
    pop.classList.add('hide')
    if (back) layer.classList.remove('hide')
  }

  function renderFacts(pet: Pet): void {
    factRows.replaceChildren()
    for (const fact of petFacts(pet)) {
      const row = document.createElement('div')
      row.className = `album-fact album-fact-${fact.kind}`
      row.textContent = fact.text
      factRows.append(row)
    }
  }

  /**
   * Open one friend, big.
   *
   * The grid GOES AWAY while the card is up, and that is forced rather than
   * chosen: `.album-card` is opaque paper and `.album` blurs what is behind it,
   * so a pop-out layered over the grid would be a pet rendered behind a sheet of
   * paper through a blur. Standing her over the island instead is also the
   * better reading of the card — the island is where "find on the map" is about
   * to send her, and it is already the thing behind the transparent container
   * the hatch uses (Joe: "so it looks like it floats freely").
   *
   * Nothing is spoken on open. `speak()` cancels the previous utterance
   * (v0:749), so a card opening mid-sentence would behead Fred — and the button
   * is the point.
   */
  function popOpen(pet: Pet): void {
    current = pet
    renderFacts(pet)
    layer.classList.add('hide')
    pop.classList.remove('hide')

    void world.preview(pet.species).then(model => {
      // She may have closed it, or opened another friend, while the model was
      // in flight. Standing a stale guest on the turntable is how a pet ends
      // up on a card belonging to somebody else.
      if (current !== pet) return
      showcase.frame(POP_FRAME, POP_LOOK, POP_EYE)
      showcase.showTemp(model, POP_FIT)
    }).catch(() => { /* no friend on the plinth; the words are still right */ })
  }

  shut.onclick = hide
  layer.onclick = e => { if (e.target === layer) hide() }

  /*
   * A tap beside the card goes back to the grid.
   *
   * Same rule as the album itself and as the tile offer: a MENU dismisses on a
   * tap outside, a work page does not (HANDOFF §6). Nothing here is in flight
   * and nothing costs anything, so the whole surface is a way back.
   */
  popShut.onclick = () => popDown(true)
  pop.onclick = e => { if (e.target === pop) popDown(true) }

  /**
   * Her name, and then what she is.
   *
   * CHAINED, not two calls. `speak()` cancels whatever is speaking (v0:749,
   * faithfully ported), so `speak(name); speak(species)` would say the species
   * over the top of the name — the exact bug the hatch line was moved after the
   * round close to avoid. The species follows when the name has FINISHED.
   *
   * The species is spoken as well as shown because it is new reading content in
   * a reading game: the word is on the card in the literacy font and hearing it
   * as she looks at it is the whole mechanic the rest of the game is built on. It
   * is a second line rather than one sentence, per voice.md's law that a name is
   * never spliced into another utterance.
   *
   * If the browser never fires `onend` the name is still said, which is what Joe
   * asked for; the species is the part that degrades.
   */
  say.onclick = () => {
    const pet = current
    if (!pet) return
    const word = speciesName(pet.species)
    speech.speak(pet.name, undefined, () => { speech.speak(word) })
  }

  find.onclick = () => {
    const pet = current
    if (!pet) return
    world.focusOn(focusPoint(world.livePosition(pet.id), world.hatchPosition(pet)))
    // ...and get out of the way. A full-screen album in front of the island is
    // not an answer to "where is she?".
    hide()
  }

  /*
   * The rotation, on the world's clock.
   *
   * Registered ONCE, here, so nothing has to remember to tick or draw this —
   * and skipped entirely while the card is down, because a turntable nobody can
   * see should not be costing a tablet a scene render. Note what is absent: any
   * `requestAnimationFrame` of this module's own, and any second GL context.
   */
  world.onFrame((dt, t) => { if (current) showcase.update(dt, t) })
  world.onOverlayFrame(renderer => {
    if (!current || !showcase.isShowing()) return
    const r = slot.getBoundingClientRect()
    showcase.render(renderer,
      { x: r.left, y: r.top, width: r.width, height: r.height })
  })

  return {
    open(pets) {
      popDown(false)
      title.textContent = pets.length === 1
        ? '1 friend has come home'
        : `${pets.length} friends have come home`
      if (pets.length === 0) title.textContent = 'Your friends will appear here'

      grid.replaceChildren()
      for (const pet of pets) {
        const cell = document.createElement('div')
        cell.className = 'chunk album-cell'

        const img = document.createElement('img')
        img.className = 'album-portrait'
        img.alt = pet.name
        cell.append(img)

        const name = document.createElement('span')
        name.className = 'album-name'
        name.textContent = pet.name
        cell.append(name)

        /*
         * Tapping a friend opens her, big and turning.
         *
         * It used to speak her name and nothing else. Joe: "if you click it, it
         * should pop out bigger..." — the name is still a tap away, on a button
         * that also says what she is.
         */
        cell.setAttribute('role', 'button')
        cell.setAttribute('aria-label', `${pet.name}, ${speciesName(pet.species)}`)
        cell.onclick = () => popOpen(pet)

        grid.append(cell)
        /*
         * Each portrait is fired on its own and CAUGHT on its own.
         *
         * `shoot` fetches a .glb, so it can reject — and this runs once per
         * friend in the grid, so one bad species used to raise one unhandled
         * rejection per open of the album. The cell is already complete without
         * it: the name is under the picture and the alt text is the name, so a
         * friend whose portrait never arrives is a blank square with her name on
         * it rather than a hole in the grid. Nothing here abandons the loop —
         * the sibling cells are already built — this is only about the console
         * staying readable, which is how the last three of these were found.
         */
        void portraits.shoot(pet.species)
          .then(url => { if (url) img.src = url })
          .catch(() => { /* no picture of this one; her name is still there */ })
      }
      layer.classList.remove('hide')
    },

    close: hide,
    isOpen: () =>
      !layer.classList.contains('hide') || !pop.classList.contains('hide'),
    popped: () => current,
  }
}
