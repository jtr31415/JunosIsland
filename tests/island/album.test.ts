/**
 * @vitest-environment jsdom
 *
 * The album pop-out (Phase 4): one friend, large and turning, with her name, her
 * species, a button that says both, and a way to go and find her.
 *
 * Joe: *"some improvements to the album. if you click it, it should pop out
 * bigger with an option to find it on the map and a button to read its name. the
 * pop out album should rotate it as well."* And: *"on the pop out card with the
 * animal in large, we also need as info its species."*
 *
 * Three of these tests exist because of something this project has already paid
 * for, rather than to cover a line:
 *
 *   - **The rotation is asserted on the turntable's own rotation**, driven by the
 *     frame callback the album registered, because "does it spin" is the request
 *     and because the cheap version of this test — that `createStage` was called
 *     — is exactly the mocked-port pattern HANDOFF §5 names as the repeat
 *     offender here. The same test proves there is no second render loop: the
 *     pet only turns when the world ticks it.
 *   - **"Find on the map" is asserted against the LIVE position.** `flow.pets[].at`
 *     is where a friend hatched; wandering lives on the scene-graph roots in
 *     `pets.ts` and is never written back. A version of this that flew to the
 *     hatch spot would look completely correct on the nine-hex island every test
 *     builds and be wrong on hers.
 *   - **The album is built for real, WebGL and all.** It could not be, until now:
 *     the portrait renderer made its GL context in the constructor, so there was
 *     no album test at all and the one part of this file with decisions in it was
 *     uncovered. jsdom has no WebGL, so this suite is also the proof that a
 *     browser at its context limit still gets names, species and the pop-out.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'
import {
  createAlbum, petFacts, focusPoint, FACT_ROWS,
} from '../../src/island/album'
import type { AlbumWorld } from '../../src/island/album'
import { SPECIES_NAME, speciesName } from '../../src/island/script'
import { SPECIES } from '../../src/island/pets'
import type { Pet } from '../../src/island/flow'

const pet = (id: string, name: string, species: string): Pet =>
  ({ id, name, species, at: { q: 0, r: 0 } })

const FOX = pet('p1', 'Gachap', 'animal-fox')
const BEE = pet('p2', 'Vusp', 'animal-bee')

/** A promise a test resolves when it chooses, so a load can be caught in flight. */
function deferred<T>(): { promise: Promise<T>; resolve(v: T): void } {
  let go: (v: T) => void = () => {}
  const promise = new Promise<T>(r => { go = r })
  return { promise, resolve: v => go(v) }
}

function setup(over: Partial<AlbumWorld> = {}) {
  const root = document.createElement('div')
  document.body.append(root)

  const spoken: Array<{ text: string; onend?: () => void }> = []
  const speak = vi.fn((text: string, _rate?: number, onend?: () => void) => {
    spoken.push({ text, onend })
    return true
  })
  const speech = {
    speak, ready: () => true, cancel: vi.fn(),
    noticeShown: () => false, markNoticeShown: vi.fn(),
  }

  const frames: Array<(dt: number, t: number) => void> = []
  const overlays: Array<(r: THREE.WebGLRenderer) => void> = []
  const focusOn = vi.fn()
  /** A fresh group per call, so a stale load is distinguishable from a live one. */
  const previews: THREE.Group[] = []

  const world: AlbumWorld = {
    preview: vi.fn(async () => {
      const g = new THREE.Group()
      g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1.4, 1)))
      previews.push(g)
      return g
    }),
    livePosition: vi.fn(() => null),
    hatchPosition: vi.fn(() => new THREE.Vector3()),
    focusOn,
    onFrame: fn => { frames.push(fn) },
    onOverlayFrame: fn => { overlays.push(fn) },
    ...over,
  }

  const album = createAlbum(root, speech, world)
  const $ = (sel: string): HTMLElement | null => root.querySelector(sel)
  const cells = (): HTMLElement[] => [...root.querySelectorAll('.album-cell')] as HTMLElement[]
  return { root, album, world, speak, spoken, focusOn, frames, overlays, previews, $, cells }
}

/** Let the microtask queue drain, so a resolved preview has reached the stage. */
const settle = (): Promise<void> => new Promise(r => setTimeout(r, 0))

afterEach(() => { document.body.innerHTML = '' })

/* ------------------------------------------------------------------ */

describe('what a species is CALLED', () => {
  it('names every one of the twenty-four', () => {
    // A friend with no species word is a blank line on her own card. There is no
    // partial version of this table that is acceptable.
    for (const id of SPECIES) {
      expect(SPECIES_NAME[id], `${id} has no display name`).toBeTruthy()
    }
  })

  it('never gives two species the same word', () => {
    /*
     * The reason `animal-hog` cannot be "Pig": `animal-pig` is also in the pack,
     * and it is pink. Two friends whose cards both read "Pig" with different
     * faces is the album contradicting itself, and it is the one mistake this
     * table can make that a child would notice.
     */
    const words = SPECIES.map(id => SPECIES_NAME[id])
    expect(new Set(words).size).toBe(SPECIES.length)
  })

  it('calls a polar bear a Polar Bear, because there is no animal called a polar',
    () => {
      expect(SPECIES_NAME['animal-polar']).toBe('Polar Bear')
    })

  it('gives the hog a word of its own that is not the pig\'s', () => {
    expect(SPECIES_NAME['animal-hog']).not.toBe(SPECIES_NAME['animal-pig'])
    expect(SPECIES_NAME['animal-hog']).toBe('Wild Boar')
  })

  it('shows SOMETHING for a species it has never heard of', () => {
    /*
     * A save from a future build, or a pack that gains a species before this
     * table does. Brief §19: nothing she owns is lost, and a blank where her own
     * friend's kind goes is a small version of losing it.
     */
    expect(speciesName('animal-narwhal')).toBe('Narwhal')
    expect(speciesName('animal-sea-otter')).toBe('Sea otter')
  })

  it('uses UK words a six-year-old would say', () => {
    expect(SPECIES_NAME['animal-bunny']).toBe('Bunny')
    expect(SPECIES_NAME['animal-fox']).toBe('Fox')
  })
})

/* ------------------------------------------------------------------ */

describe('tapping a friend pops her out', () => {
  it('opens a card with her name AND her species on it', () => {
    const { album, cells, $ } = setup()
    album.open([FOX])
    cells()[0]?.click()

    expect(album.popped()).toBe(FOX)
    expect($('.album-pop')?.classList.contains('hide')).toBe(false)
    expect($('.album-fact-name')?.textContent).toBe('Gachap')
    expect($('.album-fact-species')?.textContent).toBe('Fox')
  })

  it('stands the grid aside, because the card is a HOLE not a card', () => {
    /*
     * The friend is drawn by the world's renderer into the canvas, which is
     * behind every piece of DOM. `.album-card` is opaque paper and `.album`
     * blurs what is behind it, so a pop-out layered over the grid would render
     * the pet underneath a sheet of paper. This assertion is the reason the
     * layout looks the way it does.
     */
    const { album, cells, $ } = setup()
    album.open([FOX])
    cells()[0]?.click()
    expect($('.album')?.classList.contains('hide')).toBe(true)
    // ...and she is still in the album as far as anything else is concerned.
    expect(album.isOpen()).toBe(true)
  })

  it('comes back to the grid on a tap beside the card', () => {
    // A MENU dismisses on a tap outside; a work page does not (HANDOFF §6).
    // Nothing here is in flight and nothing costs anything.
    const { album, cells, $ } = setup()
    album.open([FOX])
    cells()[0]?.click()
    $('.album-pop')?.click()

    expect(album.popped()).toBeNull()
    expect($('.album-pop')?.classList.contains('hide')).toBe(true)
    expect($('.album')?.classList.contains('hide')).toBe(false)
  })

  it('comes back to the grid on the corner cross', () => {
    const { album, cells, $ } = setup()
    album.open([FOX])
    cells()[0]?.click()
    $('.album-pop-close')?.click()
    expect($('.album')?.classList.contains('hide')).toBe(false)
  })

  it('never stands a friend on the plinth after her card has gone', async () => {
    /*
     * The model is a ~140KB fetch, so the card is up before anybody arrives on
     * it. A resolve that lands after she has closed the card — or opened a
     * different friend — must be dropped, or a pet turns up on somebody else's
     * page. Nothing would fail; she would simply be there.
     */
    const held = deferred<THREE.Object3D>()
    const late = new THREE.Group()
    const { album, cells } = setup({ preview: () => held.promise })

    album.open([FOX])
    cells()[0]?.click()
    album.close()
    held.resolve(late)
    await settle()

    expect(late.parent).toBeNull()
  })

  it('takes the friend OFF the turntable when the card closes, without disposing her',
    async () => {
      /*
       * She is a clone, sharing geometry and materials with every other pet of
       * her species — including ones walking about the island right now. Freeing
       * them would break friends she already owns (brief §19).
       */
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshStandardMaterial()
      const model = new THREE.Group()
      model.add(new THREE.Mesh(geometry, material))
      const geoDispose = vi.spyOn(geometry, 'dispose')
      const matDispose = vi.spyOn(material, 'dispose')

      const { album, cells } = setup({ preview: async () => model })
      album.open([FOX])
      cells()[0]?.click()
      await settle()
      expect(model.parent).not.toBeNull()

      album.close()
      expect(model.parent).toBeNull()
      expect(geoDispose).not.toHaveBeenCalled()
      expect(matDispose).not.toHaveBeenCalled()
    })
})

/* ------------------------------------------------------------------ */

describe('the friend turns', () => {
  it('turns on the WORLD\'s frame loop, and starts no loop of its own', async () => {
    /*
     * The whole cost argument for this feature. `album.ts` already creates a
     * second, offscreen GL context for the grid's thumbnails and renders each
     * ONCE; `scene.ts` calls a second live context on this tablet "the expensive
     * way to do this". So the pop-out reuses the hatch's turntable and draws
     * through the shared renderer.
     *
     * Asserted three ways, because "it spins" and "it spins cheaply" are
     * different claims: it registers with the world's loop, it never asks the
     * browser for frames itself, and the turntable's rotation actually advances
     * when that loop ticks.
     */
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame')
    const { album, cells, frames, overlays, previews } = setup()

    expect(frames).toHaveLength(1)
    expect(overlays).toHaveLength(1)

    album.open([FOX])
    cells()[0]?.click()
    await settle()

    const turntable = previews[0]?.parent
    expect(turntable, 'the friend must be on a turntable').toBeTruthy()
    const before = turntable!.rotation.y
    for (let i = 0; i < 30; i++) (frames[0] as (d: number, t: number) => void)(1 / 30, i / 30)
    expect(turntable!.rotation.y).toBeGreaterThan(before)

    expect(rafSpy).not.toHaveBeenCalled()
    rafSpy.mockRestore()
  })

  it('costs nothing at all while the card is down', async () => {
    // A turntable nobody can see must not be rendering a scene on a mid-range
    // tablet. The tick is registered once and skipped when there is no card.
    const { album, cells, frames, overlays, previews } = setup()
    album.open([FOX])
    cells()[0]?.click()
    await settle()

    const turntable = previews[0]?.parent as THREE.Object3D
    album.close()
    const parked = turntable.rotation.y
    for (let i = 0; i < 30; i++) (frames[0] as (d: number, t: number) => void)(1 / 30, i / 30)
    expect(turntable.rotation.y).toBe(parked)

    // ...and it draws nothing either, so the shared renderer is untouched.
    const renderer = { render: vi.fn(), getSize: vi.fn(() => new THREE.Vector2(800, 600)) }
    ;(overlays[0] as (r: THREE.WebGLRenderer) => void)(renderer as unknown as THREE.WebGLRenderer)
    expect(renderer.render).not.toHaveBeenCalled()
  })
})

/* ------------------------------------------------------------------ */

describe('the button that reads her name', () => {
  it('says her name', () => {
    const { album, cells, $, spoken } = setup()
    album.open([FOX])
    cells()[0]?.click()
    $('.album-say')?.click()
    expect(spoken.map(s => s.text)).toEqual(['Gachap'])
  })

  it('says the species only once the NAME has finished', () => {
    /*
     * `speak()` cancels whatever is speaking (v0:749, faithfully ported), so two
     * calls in a row would say "Fox" over the top of "Gachap" — the same bug the
     * hatch line was moved after the round close to avoid. The species is chained
     * on the name's end callback, which is also voice.md's law: a name is a line
     * of its own, never spliced into another utterance.
     */
    const { album, cells, $, spoken } = setup()
    album.open([FOX])
    cells()[0]?.click()
    $('.album-say')?.click()

    expect(spoken).toHaveLength(1)              // not two in one breath
    spoken[0]?.onend?.()                        // the name finishes
    expect(spoken.map(s => s.text)).toEqual(['Gachap', 'Fox'])
  })

  it('says nothing when there is no friend on the card', () => {
    const { album, $, spoken } = setup()
    album.open([FOX])
    $('.album-say')?.click()
    expect(spoken).toHaveLength(0)
  })

  it('speaks nothing on open — a card must not behead Fred mid-sentence', () => {
    const { album, cells, spoken } = setup()
    album.open([FOX])
    cells()[0]?.click()
    expect(spoken).toHaveLength(0)
  })
})

/* ------------------------------------------------------------------ */

describe('find it on the map', () => {
  it('flies to where she is NOW, not to where she hatched', () => {
    /*
     * The rule this feature turns on. `flow.pets[].at` is the hatch spot;
     * wandering happens on the live roots in `pets.ts` and is never written back
     * to the flow, so on any grown island the two are different tiles. Juno went
     * looking round her island for her animals unprompted — that is what this
     * button is for, and the hatch spot is the wrong answer to it.
     */
    const { album, cells, $, focusOn } = setup({
      livePosition: () => new THREE.Vector3(5.25, 0.11, -3.5),
      hatchPosition: () => new THREE.Vector3(0, 0, 0),
    })
    album.open([FOX])
    cells()[0]?.click()
    $('.album-find')?.click()

    expect(focusOn).toHaveBeenCalledTimes(1)
    const at = focusOn.mock.calls[0]?.[0] as THREE.Vector3
    expect(at.x).toBeCloseTo(5.25, 6)
    expect(at.z).toBeCloseTo(-3.5, 6)
  })

  it('looks at the GROUND under her, however high she is flying', () => {
    /*
     * A bee hovers at TREE_HEIGHT, and the camera's pivot is clamped
     * horizontally only — `clampGoal` does not touch y, because the island is
     * flat. So a pivot handed y = 2.3 stays up in the air for the rest of the
     * session: `frame()` carries it in x and z alone and nothing brings it back
     * down. Every later spin would orbit a point above the island.
     */
    const { album, cells, $, focusOn } = setup({
      livePosition: () => new THREE.Vector3(2, 2.31, 1),
    })
    album.open([BEE])
    cells()[0]?.click()
    $('.album-find')?.click()
    expect((focusOn.mock.calls[0]?.[0] as THREE.Vector3).y).toBe(0)
  })

  it('falls back to where she hatched while her model is still in flight', () => {
    // Better than a button that does nothing on a slow tablet, and it can never
    // strand the camera: the pivot is clamped into the island's own footprint.
    const { album, cells, $, focusOn } = setup({
      livePosition: () => null,
      hatchPosition: () => new THREE.Vector3(-2.31, 0, 4),
    })
    album.open([FOX])
    cells()[0]?.click()
    $('.album-find')?.click()
    const at = focusOn.mock.calls[0]?.[0] as THREE.Vector3
    expect([at.x, at.y, at.z]).toEqual([-2.31, 0, 4])
  })

  it('gets the album out of the way, so she can see where the camera went', () => {
    const { album, cells, $ } = setup({
      livePosition: () => new THREE.Vector3(1, 0, 1),
    })
    album.open([FOX])
    cells()[0]?.click()
    $('.album-find')?.click()

    expect(album.isOpen()).toBe(false)
    expect(album.popped()).toBeNull()
    expect($('.album')?.classList.contains('hide')).toBe(true)
    expect($('.album-pop')?.classList.contains('hide')).toBe(true)
  })

  it('does nothing when no friend is popped out', () => {
    const { album, $, focusOn } = setup()
    album.open([FOX])
    $('.album-find')?.click()
    expect(focusOn).not.toHaveBeenCalled()
  })
})

describe('focusPoint', () => {
  it('prefers the live position and drops its height', () => {
    const at = focusPoint(new THREE.Vector3(3, 2.4, -1), new THREE.Vector3(9, 0, 9))
    expect([at.x, at.y, at.z]).toEqual([3, 0, -1])
  })

  it('uses the hatch spot when there is no live one', () => {
    const at = focusPoint(null, new THREE.Vector3(9, 1, 9))
    expect([at.x, at.y, at.z]).toEqual([9, 0, 9])
  })
})

/* ------------------------------------------------------------------ */

describe('the card is laid out for THREE facts, not two', () => {
  /*
   * Item 7 gives a pet a `{setId, speciesId}` and this card starts reading
   * "Cherry — Fox". Two facts centred would move both of them down the day the
   * colour arrives; the rows are top-aligned against a reserved third instead.
   */
  it('says two things about a natural friend', () => {
    expect(petFacts(FOX).map(f => f.kind)).toEqual(['name', 'species'])
  })

  it('already says three about a dressed one', () => {
    const facts = petFacts({ ...FOX, setId: 'cherry' })
    expect(facts.map(f => f.kind)).toEqual(['name', 'species', 'set'])
    expect(facts[2]?.text).toBe('Cherry')
  })

  it('does not waste the row on "Natural", which every friend is today', () => {
    expect(petFacts({ ...FOX, setId: 'natural' }).map(f => f.kind))
      .toEqual(['name', 'species'])
  })

  it('renders one row per fact, so the third needs no new code', () => {
    const { album, cells, root } = setup()
    album.open([FOX])
    cells()[0]?.click()
    expect(root.querySelectorAll('.album-fact')).toHaveLength(petFacts(FOX).length)
  })

  it('reserves the room in CSS, where the layout actually lives', () => {
    /*
     * Asserted against the stylesheet because that is the only place this can be
     * true: jsdom computes no grid. `FACT_ROWS` and the reservation must agree by
     * reference rather than by coincidence — the whole point is that nothing
     * moves on the day the third fact arrives.
     */
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../src/ui/tokens.css'), 'utf8')
    const block = css.slice(css.indexOf('.album-facts {'))
    expect(block.slice(0, block.indexOf('}')))
      .toMatch(new RegExp(`grid-template-rows:\\s*repeat\\(${FACT_ROWS}`))
    expect(FACT_ROWS).toBe(3)
  })

  it('sets the species in the literacy font, because it is a word she reads', () => {
    // Joe: "we need to change the font to something where the l has a little
    // hook and the a is not the carolingian derived type". index.html sets the
    // same stack on body, but a species name must not be one refactor away from
    // Roboto — which is how every word she read was rendered for two phases.
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../src/ui/tokens.css'), 'utf8')
    const block = css.slice(css.indexOf('.album-fact {'))
    expect(block.slice(0, block.indexOf('}'))).toContain("'Edu SA Beginner'")
  })
})

/* ------------------------------------------------------------------ */

/**
 * The backstop, in the style of `opening.test.ts` and for the same reason: the
 * album cannot reach the place where someone forgets to wire it, and `main.ts` is
 * untested glue that HANDOFF §5 names as this project's repeat offender. An
 * undefended wiring line has silently reverted a fix here twice in two days.
 *
 * `AlbumWorld` is deliberately all-required, so `tsc` already refuses a missing
 * port. These are the two things a type cannot say.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')

/** Comments stripped, so prose about the rule cannot stand in for the rule. */
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

/** The one place the album is wired. */
const wiring = ((): string => {
  const at = code.indexOf('createAlbum(')
  expect(at, 'main.ts must still build the album').toBeGreaterThan(-1)
  const rest = code.slice(at)
  const end = rest.indexOf('\n  })')
  return end > 0 ? rest.slice(0, end) : rest.slice(0, 900)
})()

describe('main.ts wires the album to the live island', () => {
  it('builds it exactly once, in one place', () => {
    expect(code.match(/createAlbum\(/g) ?? []).toHaveLength(1)
  })

  it('supplies every port the card has a control for', () => {
    for (const port of ['preview:', 'livePosition:', 'hatchPosition:',
      'focusOn:', 'onFrame:', 'onOverlayFrame:']) {
      expect(wiring, `the album is missing ${port}`).toContain(port)
    }
  })

  it('reads the live position from pets.ts, NOT from flow.pets[].at', () => {
    /*
     * The one assertion in this file that defends the whole feature. `at` is the
     * hatch spot and the flow never learns where a pet wandered to, so wiring
     * `livePosition` to it would leave "find on the map" pointing at a tile the
     * friend left minutes ago — and it would pass every other test here, because
     * a test island is one hex wide.
     */
    const line = wiring.split('\n').find(l => l.includes('livePosition:')) ?? ''
    expect(line).toContain('pets.positionOf(')
    expect(line).not.toContain('.at')
  })

  it('draws through the world\'s own loop rather than a loop of its own', () => {
    // Two live GL contexts is what scene.ts calls "the expensive way to do this"
    // on the target tablet.
    expect(wiring).toMatch(/onFrame:\s*fn\s*=>\s*world\.onFrame\(fn\)/)
    expect(wiring).toMatch(/onOverlayFrame:\s*fn\s*=>\s*world\.onOverlayFrame\(fn\)/)
  })
})

/* ------------------------------------------------------------------ */

describe('an album with no WebGL at all', () => {
  beforeEach(() => { /* jsdom has none, which is the point */ })

  it('still opens, still names her friends, still pops out', () => {
    /*
     * Not a hypothetical: the portrait renderer's context used to be created in
     * the constructor, so a browser at its context limit threw the whole album
     * away — and the album is where a child goes to look at what she has earned.
     * Thumbnails are the right thing to lose; nothing else is.
     */
    const { album, cells, $ } = setup()
    expect(() => album.open([FOX, BEE])).not.toThrow()
    expect(cells()).toHaveLength(2)
    cells()[1]?.click()
    expect($('.album-fact-name')?.textContent).toBe('Vusp')
    expect($('.album-fact-species')?.textContent).toBe('Bee')
  })
})
