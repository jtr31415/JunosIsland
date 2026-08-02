/**
 * @vitest-environment jsdom
 *
 * WHERE THE ALBUM'S PICTURES COME FROM, and what they cost. PB-055.
 *
 * Joe: *"when opening the animals in the album there can be a load lag. explore
 * idea of copying the already loaded 3d models? check computational demand"*.
 *
 * The other two album suites run in an honest jsdom with no WebGL at all, which
 * is the right environment for everything they assert — the DOM the album builds
 * — and it is precisely the wrong one here: with no GL context `shoot` returns
 * before it ever asks for a model, so not one line of the portrait path runs.
 * This file therefore stubs the ONE thing the environment genuinely lacks, the
 * GPU, and stubs nothing else. `world.preview` is a real function handing back a
 * real `THREE.Object3D`, the framing maths is the real maths, and every
 * assertion below is on what the album actually did with them:
 *
 *   - the object the ISLAND handed over is the object that got rendered, and the
 *     `GLTFLoader` stub — which would answer perfectly well if asked — is never
 *     asked at all. That pairing is the whole of PB-055's first change: before
 *     it, opening the album re-fetched up to 24 GLBs the island already held.
 *   - two overlapping requests for one species do the work once. The cache holds
 *     the PROMISE now, as `pets.ts` has always done, because the prefetch below
 *     makes overlap the normal case rather than a race.
 *   - a turn warms the NEXT page and only the next page.
 *
 * HANDOFF §5 is why these are written this way round: four dead features shipped
 * here behind an asserted mock. Nothing below asserts that a stub was called;
 * the loader stub is asserted UNUSED, and the model reuse is asserted on the
 * uuid of the object that reached the renderer.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import { createAlbum } from '../../src/island/album'
import type { AlbumWorld } from '../../src/island/album'
import { builtIn } from '../../src/island/species/built'
import type { Pet } from '../../src/island/flow'

/** What reached the fake GPU: one entry per portrait, and what was in the scene. */
const gpu = vi.hoisted(() => ({ rendered: [] as string[], encodes: 0 }))
/** Anything the album fetched for itself. It must stay empty. */
const net = vi.hoisted(() => ({ urls: [] as string[] }))

const PORTRAIT = 'data:image/png;base64,PORTRAIT'

/*
 * A GPU, and ONLY a GPU. Everything else in three is the real thing, so the
 * bounds, the framing and the scene graph are all genuinely exercised — the
 * stub's whole job is to be constructible in jsdom and to say what it was
 * handed. `toDataURL` is counted because the encode is the one cost PB-055
 * deliberately did not remove.
 */
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  class WebGLRenderer {
    domElement = { toDataURL: (): string => { gpu.encodes++; return PORTRAIT } }
    outputColorSpace = ''
    toneMapping = 0
    toneMappingExposure = 1
    setSize(): void { /* no surface to size */ }
    setPixelRatio(): void { /* nothing to scale */ }
    render(scene: { children: ReadonlyArray<{ uuid: string; type: string }> }): void {
      for (const child of scene.children) {
        if (!child.type.endsWith('Light')) gpu.rendered.push(child.uuid)
      }
    }
  }
  return { ...actual, WebGLRenderer }
})

/*
 * A loader that WOULD work, so "the album never fetched" is a fact about the
 * album rather than about a broken stub. Before PB-055 this recorded 24 URLs on
 * a single open of the base page.
 */
vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await vi.importActual<typeof import('three')>('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      net.urls.push(url)
      const scene = new T.Group()
      scene.add(new T.Mesh(new T.BoxGeometry(1, 1.4, 1), new T.MeshStandardMaterial()))
      return { scene }
    }
  }
  return { GLTFLoader }
})

/**
 * How many portraits one open of the base page is WORTH — the built animals, not
 * the rostered ones.
 *
 * Since Joe's 2 Aug ruling the album draws a frame only where somebody has built
 * the animal, and this file's counts are all "one request per frame" claims: ask
 * `collection('base').members` for the number and the assertions stop being about
 * the page and start being about the roster that page is filtered from. The two
 * are both 24 today, which is exactly why the wrong one would go unnoticed.
 */
const BASE_BUILT = builtIn('base')
const FOX = 'animal-fox'

const pet = (id: string, name: string, species: string): Pet =>
  ({ id, name, species, at: { q: 0, r: 0 } })

const GACHAP = pet('p1', 'Gachap', FOX)
/** A second fox: the only way to reach the orphans page. */
const RELLOW = pet('p2', 'Rellow', FOX)

/** A promise a test resolves when it chooses, so a load can be caught in flight. */
function gate(): { held: Promise<void>; open(): void } {
  let go: () => void = () => {}
  const held = new Promise<void>(r => { go = r })
  return { held, open: () => go() }
}

function setup(held?: Promise<void>) {
  const root = document.createElement('div')
  document.body.append(root)
  const speech = {
    speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
    noticeShown: () => false, markNoticeShown: vi.fn(),
  }

  /** Every species the island was asked for, in order, one entry per call. */
  const asked: string[] = []
  /** The model handed back for a species — the same object the island would share. */
  const handed = new Map<string, THREE.Object3D>()

  const world: AlbumWorld = {
    preview: async (species: string) => {
      asked.push(species)
      if (held) await held
      const group = new THREE.Group()
      group.add(new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.4, 1), new THREE.MeshStandardMaterial()))
      handed.set(species, group)
      return group
    },
    livePosition: () => null,
    hatchPosition: () => new THREE.Vector3(),
    focusOn: vi.fn(),
    onFrame: vi.fn(),
    onOverlayFrame: vi.fn(),
  }

  const album = createAlbum(root, speech, world)
  const all = (sel: string): HTMLElement[] =>
    [...root.querySelectorAll(sel)] as HTMLElement[]
  return {
    root, album, asked, handed,
    /** How many times the island was asked for this species. */
    times: (species: string): number => asked.filter(a => a === species).length,
    portraits: (): string[] =>
      all('.album-portrait').map(i => (i as HTMLImageElement).getAttribute('src') ?? ''),
    forward: (): void => { (all('.album-page-turn')[1] as HTMLButtonElement).click() },
  }
}

/**
 * Let the queued work land: microtasks, then the macrotask the prefetch waits
 * for, then the microtasks that follow it. jsdom has no `requestIdleCallback`
 * (checked), so the prefetch takes its `setTimeout` fallback here — the idle
 * path has a test of its own below.
 */
const settle = async (): Promise<void> => {
  for (let i = 0; i < 3; i++) await new Promise(r => setTimeout(r, 0))
}

beforeEach(() => {
  gpu.rendered = []
  gpu.encodes = 0
  net.urls = []
})
afterEach(() => { document.body.innerHTML = '' })

/* ------------------------------------------------------------------ */

describe('the portraits are the island\'s own models', () => {
  it('renders the very object pets.preview handed over, and fetches nothing', async () => {
    /*
     * THE assertion for PB-055. Not "a loader was not called" — the loader stub
     * above answers correctly, so an album that wanted to fetch could. The
     * portrait that reached the GPU is the object the island gave us, by uuid,
     * and the network was never touched to get it.
     */
    const { album, handed } = setup()
    album.open([GACHAP], ['base'])
    await settle()

    const fox = handed.get(FOX)
    expect(fox, 'the island was never asked for the fox').toBeTruthy()
    expect(gpu.rendered).toContain((fox as THREE.Object3D).uuid)
    expect(net.urls).toEqual([])
  })

  it('puts the picture it took on the card', async () => {
    const { album, portraits } = setup()
    album.open([GACHAP], ['base'])
    await settle()
    expect(portraits().filter(src => src === PORTRAIT).length)
      .toBe(BASE_BUILT.length)
  })

  it('asks the island once per species on the page, and no more', async () => {
    /*
     * Once per FRAME, and there is a frame only where an animal was built — so a
     * page never asks the island for a species it is not going to show. That is
     * the second half of `shapeOf`'s "no request is made for a species the roster
     * knows and cannot build": before the filter, opening the album put a request
     * behind every blank on it.
     */
    const { album, asked, times } = setup()
    album.open([GACHAP], ['base'])
    await settle()
    expect(times(FOX)).toBe(1)
    expect(asked).toHaveLength(BASE_BUILT.length)
  })

  it('hands the model back without disposing anything it shares', async () => {
    /*
     * `preview` is a clone that shares geometry and materials with every pet of
     * the species on the island right now, so freeing them here would break
     * friends they already own (brief §19). Detached, never disposed — the same
     * contract `stage.showTemp` keeps, now proven on the grid's path too.
     */
    const { album, handed } = setup()
    album.open([GACHAP], ['base'])
    await settle()

    const fox = handed.get(FOX) as THREE.Object3D
    const mesh = fox.children[0] as THREE.Mesh
    const geometry = mesh.geometry
    const material = mesh.material as THREE.Material
    const geoDispose = vi.spyOn(geometry, 'dispose')
    const matDispose = vi.spyOn(material, 'dispose')

    // ...and the portrait is long taken by now, so anything freed was freed.
    expect(fox.parent).toBeNull()
    expect(geoDispose).not.toHaveBeenCalled()
    expect(matDispose).not.toHaveBeenCalled()
  })
})

/* ------------------------------------------------------------------ */

describe('two requests for one species do the work once', () => {
  it('joins a portrait already in flight instead of taking it twice', async () => {
    /*
     * The silent one. A cache of finished data URLs is only consulted once the
     * work has COMPLETED, so a second open — or the prefetch below meeting the
     * turn it was warming — used to run the whole job again: model, render and
     * PNG encode, twice, with both succeeding and nothing logged. The island is
     * held mid-`preview` here so the overlap is real rather than lucky.
     */
    const held = gate()
    const { album, times } = setup(held.held)

    album.open([GACHAP], ['base'])
    album.open([GACHAP], ['base'])
    expect(times(FOX), 'the second open must join the first').toBe(1)

    held.open()
    await settle()
    expect(times(FOX)).toBe(1)
    expect(gpu.encodes).toBe(BASE_BUILT.length)
  })

  it('lets a page they have already seen come back with no work at all', async () => {
    const { album, asked } = setup()
    album.open([GACHAP], ['base'])
    await settle()
    const first = asked.length

    album.open([GACHAP], ['base'])
    await settle()
    expect(asked).toHaveLength(first)
  })
})

/* ------------------------------------------------------------------ */

describe('a turn warms the page they are about to reach', () => {
  /**
   * Fox lives only in the base set, so a count of it names the page exactly.
   *
   * Every collection named in this suite must have something BUILT in it, or the
   * album drops it and the page the fox is on is not the page these tests think
   * it is. Garden (14 of 14), Home Pets (16 of 16) and Night Time (13 of 16) all
   * qualify; Birds, which used to pad the book out below, is 0 of 18 and no
   * longer exists as a page at all.
   */
  const AFTER = ['garden', 'base']

  it('takes the next page\'s portraits while they are looking at this one', async () => {
    const { album, times } = setup()
    album.open([GACHAP], AFTER)
    expect(times(FOX), 'not during the turn itself').toBe(0)

    await settle()
    expect(times(FOX), 'the next page is warmed after it').toBe(1)
  })

  it('makes the turn itself free, because the pictures are already taken', async () => {
    const { album, times, forward, portraits } = setup()
    album.open([GACHAP], AFTER)
    await settle()

    forward()
    await settle()
    expect(times(FOX), 'the warmed portrait is reused, not retaken').toBe(1)
    expect(portraits()).toContain(PORTRAIT)
  })

  it('warms ONE page ahead, not the whole book', async () => {
    /*
     * Building every page up front is exactly the cost the paging commit
     * removed. A child who never turns past the first page must not pay for four
     * rosters they are not looking at — so the base set, three pages away, is
     * still untouched here.
     *
     * The third page is `night-time` rather than `birds` for the reason on
     * `AFTER` above: Birds is built-empty, so the old fixture laid out three
     * pages and stood the base set two away instead of three. It still passed,
     * which is the trouble — it was no longer testing a warm that stops one page
     * short of a book's worth.
     */
    const { album, times } = setup()
    album.open([GACHAP], ['garden', 'home-pets', 'night-time', 'base'])
    await settle()
    expect(times(FOX)).toBe(0)
  })

  it('does not run off the end of the book, or into the spare page', async () => {
    /*
     * The orphans page is not a collection — it holds pets whose portraits the
     * roster pages have already asked for — and the last page has nothing after
     * it. Neither may throw, and neither may ask for anything twice.
     */
    const { album, asked, forward } = setup()
    album.open([GACHAP, RELLOW], ['base'])
    await settle()
    const once = asked.length

    expect(() => forward()).not.toThrow()
    await settle()
    expect(asked).toHaveLength(once)
  })

  it('waits for idle time where the browser offers it', async () => {
    /*
     * The prefetch must never compete with the turn that is happening now.
     * jsdom has no `requestIdleCallback`, so the fallback is what the rest of
     * this file exercises; this is the branch a tablet actually takes.
     */
    const idle: Array<() => void> = []
    const has = globalThis as { requestIdleCallback?: unknown }
    has.requestIdleCallback = (fn: () => void): number => idle.push(fn)
    try {
      const { album, times } = setup()
      album.open([GACHAP], ['garden', 'base'])
      await settle()
      expect(idle, 'the warm must be queued for idle time').toHaveLength(1)
      expect(times(FOX), 'and must not have started before it').toBe(0)

      ;(idle[0] as () => void)()
      await settle()
      expect(times(FOX)).toBe(1)
    } finally {
      delete has.requestIdleCallback
    }
  })
})
