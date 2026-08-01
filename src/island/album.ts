/**
 * The album: every friend read home, with the name she gave them.
 *
 * Pets are never lost or taken (brief section 5), so this is a record of
 * ownership first: every friend she has read home is in here, with her name, and
 * nothing in this file can ever remove one.
 *
 * ## It IS a checklist now, and that is a reversal
 *
 * This header used to say the opposite — *"no locked slots, no percentages and
 * nothing to complete... never 'you are missing 23'"* — and that was the right
 * reading of the brief until Joe overruled it on 1 Aug:
 *
 *   *"show the blank slots in the album of what is to come. silhouettes only, no
 *   names, no animals, no clickability, just a roster of the animals per album,
 *   4 albums always on show, next one shows when one is completed. we need to
 *   keep motivation up. and anticipation is motivation."*
 *
 * The old rule was protecting against a scoreboard — a page that tells a child
 * she is behind. What replaced it is not that, and the difference is in the
 * detail of what a blank slot is allowed to be: a shape and a count, with no
 * name, no tap and no way to fail. She is never missing anything; there are
 * simply animals she has not met yet, and they have outlines.
 *
 * The four albums come from `species/unlock.ts` by way of `species/opened.ts`.
 * This file is handed the list and does not decide it.
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
import { speciesRecord } from './species/registry'
import { buildSpecies } from './species/kit'
import { buildAssembly } from './species/parts/assembly'
import { collection, SPECIES_COLLECTION } from './species/roster'
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
  /**
   * Species -> portrait, INCLUDING the misses.
   *
   * `null` is cached as hard as a hit. The roster has 320 species and only 98 of
   * them can be drawn at all, so an album full of blank slots asks this renderer
   * for the same two hundred impossible portraits every single time it is
   * opened; without the negative entry that is a fresh `buildSpecies` traverse,
   * or a fresh 404, per slot per open.
   */
  const cache = new Map<string, string | null>()

  /**
   * Where a species' shape comes from, and the ONE place that decides.
   *
   * Three sources, in this order, because they are three different kinds of
   * animal rather than three attempts at the same one:
   *
   *   1. AN ASSEMBLED BUILD, if it has one. `parts/assembled` is the newer and
   *      more faithful of the two records a species can carry, and
   *      `docs/building-animals-from-parts.md` §6 keeps both — so preferring it
   *      here is the same preference the workbench viewer takes.
   *   2. A KIT BUILD. `buildSpecies` throws for a kit that is declared but not
   *      built (swim, minibeast, bespoke), which is a normal state for a third of
   *      the roster and not an error — hence the catch and the blank slot.
   *   3. THE GLB PACK, which is the base 24 and nothing else.
   *
   * NO REQUEST IS MADE FOR A SPECIES THE ROSTER KNOWS AND CANNOT BUILD. That is
   * deliberate and it is the difference between a clean console and PB-014's
   * complaint: the blank slots are the majority case now, and a fetch per blank
   * would put two hundred 404s in the log every time the album is opened. A
   * species the roster has never heard of still tries the pack, exactly as this
   * file always did, because that is the only guess left for a save from a build
   * that knows more than this one.
   */
  async function shapeOf(species: string): Promise<THREE.Object3D | null> {
    const record = speciesRecord(species)
    if (record?.assembly) {
      try { return buildAssembly(record.assembly) } catch { /* try the kit next */ }
    }
    if (record?.build) {
      try { return buildSpecies(record.build) } catch { return null }
    }
    if (record && SPECIES_COLLECTION[species] !== 'base') return null
    const gltf = await loader.loadAsync(`pets/${species}.glb`)
    flattenImported(gltf.scene)
    return gltf.scene
  }

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
      if (cache.has(species)) return cache.get(species) ?? null
      const r = gl()
      if (!r) return null

      const model = await shapeOf(species)
      if (!model) { cache.set(species, null); return null }

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
  /**
   * @param albums Which collections to lay out, in the order they were opened —
   * `albumsToShow(opened)`. Four of them while she is mid-collection, and one
   * more each time she finishes one. An id this build cannot resolve is skipped
   * rather than drawn empty.
   */
  open(pets: readonly Pet[], albums: readonly string[]): void
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

  /*
   * The column of albums — NOT a grid of cells.
   *
   * It carried `album-grid` until the rosters landed, and re-using that class
   * here laid the four albums out as four narrow COLUMNS side by side: the
   * sections became items in the cell grid and inherited its
   * `repeat(auto-fill, minmax(7.5rem, 1fr))`. Seen in the browser, which is the
   * only way this sort of thing gets seen. `album-grid` now belongs to the row
   * inside a section and to nothing else.
   */
  const grid = document.createElement('div')
  grid.className = 'album-sets'

  const shut = document.createElement('button')
  shut.className = 'chunk chunk-button album-close'
  shut.textContent = '✕'
  shut.setAttribute('aria-label', 'close the album')

  /*
   * ONE ALBUM PER PAGE, turned by hand.
   *
   * Joe, 1 Aug: *"change the album to click through pages and make the modal a
   * bit bigger for less scrolling."* Four rosters stacked came to sixty-six
   * slots down one column, which is a scroll rather than a book — and the count
   * beside each heading, which is the whole motivation device, was off the
   * bottom of the card for three albums out of four.
   *
   * A page is an ALBUM, not a fixed number of cells. That is what makes the
   * back-and-forward meaningful: every turn lands on a heading, a count and a
   * complete collection, so "how am I doing on the Garden" is one tap and never
   * a scroll. It also means a page's length is the collection's — twelve to
   * twenty-four — and the card is sized for the largest of them.
   */
  const pager = document.createElement('div')
  pager.className = 'album-pager'

  const back = document.createElement('button')
  back.className = 'chunk chunk-button album-page-turn'
  back.textContent = '‹'
  back.setAttribute('aria-label', 'the album before this one')

  const on = document.createElement('button')
  on.className = 'chunk chunk-button album-page-turn'
  on.textContent = '›'
  on.setAttribute('aria-label', 'the next album')

  /**
   * Which page she is on, as dots rather than as "3 of 5".
   *
   * There is already a number on this card — the `2 of 14` beside the heading,
   * which counts ANIMALS — and a second x-of-y three centimetres away counting
   * pages is the kind of collision a six-year-old reads as one broken number.
   * Dots say the same thing without competing with it.
   */
  const dots = document.createElement('div')
  dots.className = 'album-dots'

  pager.append(back, dots, on)
  card.append(shut, title, grid, pager)
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

  /** A friend she owns: her portrait, her name, and a way into the pop-out. */
  function cellFor(pet: Pet): HTMLElement {
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

    /*
     * Each portrait is fired on its own and CAUGHT on its own.
     *
     * `shoot` can reject, and this runs once per slot in the album, so one bad
     * species used to raise one unhandled rejection per open. The cell is
     * already complete without it: the name is under the picture and the alt
     * text is the name, so a friend whose portrait never arrives is a blank
     * square with her name on it rather than a hole in the grid.
     */
    void portraits.shoot(pet.species)
      .then(url => { if (url) img.src = url })
      .catch(() => { /* no picture of this one; her name is still there */ })
    return cell
  }

  /**
   * ONE SHE HAS NOT MET. A shape, and deliberately nothing else.
   *
   * Joe, 1 Aug: *"silhouettes only, no names, no animals, no clickability"*. So:
   *
   *   - NO NAME, and no empty name element either — the row below the picture is
   *     reserved by the CSS instead, so a blank slot is exactly as tall as a
   *     friend's and the grid does not go ragged where she has gaps.
   *   - NOT A BUTTON. No `role`, no `onclick`, and `pointer-events: none` in the
   *     CSS, because a slot that highlights under a finger promises something
   *     will happen when nothing will.
   *   - `aria-hidden`, which is the honest reading of "no names": there is no
   *     information in this slot to announce. The count in the heading beside it
   *     is what a screen reader gets, and that is the whole message — three of
   *     fourteen — rather than eleven announcements of "not found yet".
   *
   * The silhouette is the species' own outline, blackened in CSS rather than
   * re-rendered in black: it is the same cached portrait the day she finds one,
   * so a friend arriving swaps a filter rather than fetching a picture.
   */
  function blankFor(species: string): HTMLElement {
    const cell = document.createElement('div')
    cell.className = 'chunk album-cell album-blank'
    cell.setAttribute('aria-hidden', 'true')

    const img = document.createElement('img')
    img.className = 'album-portrait album-silhouette'
    img.alt = ''
    cell.append(img)

    void portraits.shoot(species)
      .then(url => { if (url) img.src = url })
      .catch(() => { /* nothing to draw yet; the empty slot is the message */ })
    return cell
  }

  /**
   * One album: a heading, a count, and a slot for every species in it.
   *
   * IN ROSTER ORDER, never in the order she found them. The roster order is the
   * same on every island, which is what makes the shape of a half-finished album
   * something two children can talk about — roster §3's "playground currency"
   * applied to the page rather than to the names on it.
   */
  function sectionFor(id: string, mine: ReadonlyMap<string, Pet>): HTMLElement | null {
    const set = collection(id)
    if (!set) return null

    const section = document.createElement('section')
    section.className = 'album-set'

    const head = document.createElement('h3')
    head.className = 'album-set-title'
    head.textContent = set.name

    const have = set.members.filter(m => mine.has(m)).length
    const count = document.createElement('span')
    count.className = 'album-set-count'
    count.textContent = `${have} of ${set.members.length}`
    head.append(count)

    const row = document.createElement('div')
    row.className = 'album-grid'
    for (const species of set.members) {
      const pet = mine.get(species)
      row.append(pet ? cellFor(pet) : blankFor(species))
    }

    section.append(head, row)
    return section
  }

  return {
    open(pets, albums) {
      popDown(false)
      title.textContent = pets.length === 1
        ? '1 friend has come home'
        : `${pets.length} friends have come home`
      if (pets.length === 0) title.textContent = 'Your friends will appear here'

      /*
       * The FIRST pet of each species fills that species' slot.
       *
       * First rather than newest, so a slot never changes the friend it shows
       * once it is filled. Everyone who does not get a slot — a second animal of
       * the same species, or a species no open album lists — is gathered below
       * rather than dropped: brief §19 is that nothing she owns is ever lost, and
       * a roster view is exactly the sort of change that loses somebody quietly.
       */
      const mine = new Map<string, Pet>()
      for (const pet of pets) if (!mine.has(pet.species)) mine.set(pet.species, pet)

      /*
       * The pages are DECIDED here and BUILT one at a time below.
       *
       * Deciding up front is what lets the dots be drawn before she has turned
       * to anything, and building lazily is what keeps a turn cheap: a page is
       * up to twenty-four cells, each of which asks the portrait renderer for a
       * picture, and rendering all five pages to show one of them was the cost
       * the stacked version was paying on every open.
       */
      const pages = albums.filter(id => collection(id) !== undefined)
      const shown = new Set<string>()
      for (const id of pages) for (const m of collection(id)?.members ?? []) shown.add(m)

      /*
       * Anybody the albums did not account for, on a last page of their own.
       *
       * Two ways in, and both are real: a duplicate species once a pack is
       * exhausted (`collection.ts` starts dealing repeats again at that point),
       * and a species belonging to an album that is not open on this island —
       * which a save from a later build can carry. Neither has a slot, and
       * neither may vanish.
       */
      const orphans = pets.filter(
        p => !(shown.has(p.species) && mine.get(p.species) === p))

      const count = pages.length + (orphans.length > 0 ? 1 : 0)
      let at = 0

      const spare = (): HTMLElement => {
        const section = document.createElement('section')
        section.className = 'album-set'
        const head = document.createElement('h3')
        head.className = 'album-set-title'
        head.textContent = 'More friends'
        const row = document.createElement('div')
        row.className = 'album-grid'
        for (const pet of orphans) row.append(cellFor(pet))
        section.append(head, row)
        return section
      }

      /**
       * Turn to a page.
       *
       * The scroll goes back to the top on every turn. A page turned while
       * halfway down the last one starts halfway down this one, which reads as
       * the card having jumped — and on a shorter collection there may be
       * nothing there at all.
       */
      const turn = (to: number): void => {
        at = Math.max(0, Math.min(count - 1, to))
        const page = at < pages.length
          ? sectionFor(pages[at] as string, mine)
          : spare()
        grid.replaceChildren(...(page ? [page] : []))
        card.scrollTop = 0

        back.disabled = at === 0
        on.disabled = at >= count - 1
        // One page is not a book: nothing to turn, so nothing to turn it with.
        pager.classList.toggle('hide', count <= 1)

        dots.replaceChildren()
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('span')
          dot.className = i === at ? 'album-dot album-dot-here' : 'album-dot'
          dots.append(dot)
        }
      }

      back.onclick = () => turn(at - 1)
      on.onclick = () => turn(at + 1)
      turn(0)
      layer.classList.remove('hide')
    },

    close: hide,
    isOpen: () =>
      !layer.classList.contains('hide') || !pop.classList.contains('hide'),
    popped: () => current,
  }
}
