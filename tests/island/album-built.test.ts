/**
 * @vitest-environment jsdom
 *
 * A SLOT MEANS SOMEBODY BUILT THE ANIMAL — what the page does with that.
 *
 * Joe, 2 August: *"i can still see all the empty slots from the blocky animals
 * in the albums by the way. we should remove them all and they get built up as
 * soon as i push new animals to the game."*
 *
 * `album-roster.test.ts` covers the roster view as it was and `album-portraits.test.ts`
 * covers where the pictures come from; neither is repeated here. This file is
 * about the four things filtering the VIEW can break, in the order they matter:
 *
 *   1. THE COUNT AND THE FRAMES CANNOT DISAGREE. They used to be two separate
 *      reads of `set.members` three lines apart, which is exactly how a heading
 *      ends up promising a number the grid below it does not show.
 *   2. A PARTIAL COLLECTION SHOWS ONLY WHAT EXISTS. Africa was sixteen frames
 *      and one crocodile.
 *   3. A COLLECTION WITH NOTHING BUILT IS NOT A PAGE AT ALL. No name, no count,
 *      no "coming soon".
 *   4. **BRIEF §19 — NOTHING THE CHILD OWNS IS LOST BY ANY OF IT.** A roster view
 *      that starts dropping rows is the single most likely way this change
 *      quietly loses somebody a friend, so every case below asserts the pet is
 *      still visible, still carries its NAME, and is still tappable into the
 *      pop-out — and asserts the general form as well: the number of pets
 *      reachable in the card is never less than the number handed to `open`.
 *
 * WHY THE GPU IS STUBBED HERE and is not in `album-roster.test.ts`. With no
 * WebGL, `shoot` returns before it ever asks for a model, so not one line of the
 * portrait path runs — which is the honest environment for the DOM assertions
 * and precisely the wrong one for the prefetch. The stub is the ONE thing jsdom
 * genuinely lacks and nothing else is faked: `world.preview` is a real function
 * handing back a real `THREE.Object3D`, the roster and the registry are the real
 * data, and the assembly builder below records what it was asked for and then
 * does the real work.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'
import { createAlbum } from '../../src/island/album'
import type { AlbumWorld } from '../../src/island/album'
import { collection } from '../../src/island/species/roster'
import { builtIn } from '../../src/island/species/built'
import { speciesRecord } from '../../src/island/species/registry'
import type { Pet } from '../../src/island/flow'

/** Every `AssemblyBuild` the album asked to have built, in order. */
const shapes = vi.hoisted(() => ({ made: [] as unknown[] }))

/*
 * A GPU, and ONLY a GPU — the same stub `album-portraits.test.ts` uses and for
 * the same reason. Without it `take()` gives up before `shapeOf` runs and the
 * prefetch has nothing to observe.
 */
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  class WebGLRenderer {
    domElement = { toDataURL: (): string => 'data:image/png;base64,PORTRAIT' }
    outputColorSpace = ''
    toneMapping = 0
    toneMappingExposure = 1
    setSize(): void { /* no surface to size */ }
    setPixelRatio(): void { /* nothing to scale */ }
    render(): void { /* nothing to draw into */ }
  }
  return { ...actual, WebGLRenderer }
})

/*
 * The REAL assembly builder, wrapped so it says what it was handed.
 *
 * This is the only honest way to see which species the album asked for a shape
 * of. Every built member of Night Time is on the assembly route and carries no
 * `build` at all (`registry.ts`'s `NIGHT_TIME_COLLECTION`), so a record of these
 * calls IS the list of night-time species the prefetch warmed. The build itself
 * still happens, so nothing here changes what the album can draw.
 */
vi.mock('../../src/island/species/parts/assembly', async () => {
  const actual = await vi.importActual<
    typeof import('../../src/island/species/parts/assembly')
  >('../../src/island/species/parts/assembly')
  return {
    ...actual,
    buildAssembly: (build: Parameters<typeof actual.buildAssembly>[0]) => {
      shapes.made.push(build)
      return actual.buildAssembly(build)
    },
  }
})

/* ------------------------------------------------------------------ */

/*
 * THE PARTIAL COLLECTION MOVED FROM NIGHT TIME TO HOME PETS ON 4 AUGUST.
 *
 * `builtIn` filters on RELEASED now (Joe: *"i only want to see in the album the
 * silhouette cards for the animals that have successfully pushed"*), and Night
 * Time is built-but-unpushed from end to end, so it has no page at all — it
 * moved from being this file's partial-album example to being one of its
 * no-page examples. Home Pets is the partial album now: fifteen pushed of
 * sixteen rostered, with `animal-rat` built and waiting.
 *
 * Kept general rather than hard-coded so the fixture follows Joe's pushing
 * rather than needing an edit every time he ticks one.
 */
const PART_SET = 'home-pets'
const PART_SHOWN = builtIn(PART_SET)
const PART_HIDDEN = (collection(PART_SET)?.members ?? [])
  .filter(m => !PART_SHOWN.includes(m))

/** Assembly record -> species id, so a recorded build can be named. */
const NAMED_SHAPE = new Map<unknown, string>()
for (const id of PART_SHOWN) {
  const a = speciesRecord(id)?.assembly
  if (a) NAMED_SHAPE.set(a, id)
}

const pet = (id: string, name: string, species: string): Pet =>
  ({ id, name, species, at: { q: 0, r: 0 } })

const FOX = pet('p1', 'Gachap', 'animal-fox')
/** Rostered, and nobody has built it: no membrane in the parts bank. */
const BAT = pet('p2', 'Squeak', 'animal-bat')
/*
 * A collection with nothing built at all.
 *
 * >>> THIS WAS THE SHEEP, and Farm was the empty collection, until PB-074 built
 * >>> Farm 16 of 16 on 3 August. `animal-sheep` now HAS a frame, so it can no
 * >>> longer stand for a species whose collection the album refuses to draw.
 * >>> `animal-bear` takes over: rostered in `woodland`, which has sixteen
 * >>> members and not one of them built. Same role, same assertions.
 */
const BEAR = pet('p3', 'Bramble', 'animal-bear')
/** A species the roster has never heard of. What a later build's save carries. */
const STRANGER = pet('p4', 'Moth', 'animal-from-the-future')

function setup() {
  const root = document.createElement('div')
  document.body.append(root)
  const speech = {
    speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
    noticeShown: () => false, markNoticeShown: vi.fn(),
  }

  /** Every species the island's own cache was asked for, in order. */
  const asked: string[] = []

  const world: AlbumWorld = {
    preview: async (species: string) => {
      asked.push(species)
      const group = new THREE.Group()
      group.add(new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.4, 1), new THREE.MeshStandardMaterial()))
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
  const turns = (): HTMLButtonElement[] =>
    all('.album-page-turn') as HTMLButtonElement[]
  const on = (): HTMLButtonElement => turns()[1] as HTMLButtonElement

  /** Every cell on the page, filled or blank. */
  const slots = (): HTMLElement[] => all('.album-cell')
  /** The cells that belong to a friend the child owns — the ones with a name. */
  const owned = (): HTMLElement[] => all('.album-cell:not(.album-blank)')
  const heading = (): string => all('.album-set-title')[0]?.textContent ?? ''
  /** The "N of M" beside the heading, as it is written on the card. */
  const tally = (): string => all('.album-set-count')[0]?.textContent ?? ''
  /** M — what the heading PROMISES the grid below it holds. */
  const promised = (): number => Number(tally().split(' of ')[1])

  /**
   * Read something off every page, turning forward until the book runs out.
   *
   * The pages are built one at a time (only the page they are looking at is in
   * the DOM), so anything about the whole book has to be gathered by walking it
   * exactly as a child would.
   */
  const walk = <T>(read: () => T): T[] => {
    const out: T[] = [read()]
    while (!on().disabled) { on().click(); out.push(read()) }
    return out
  }

  return {
    root, album, asked, all, on, slots, owned, heading, tally, promised, walk,
    sections: () => all('.album-set'),
    dots: () => all('.album-dot'),
    text: (): string => root.querySelector('.album-card')?.textContent ?? '',
    /** Every name a child can reach anywhere in the card, page by page. */
    names: (): string[] =>
      walk(() => owned().map(c => c.textContent ?? '')).flat(),
  }
}

/**
 * Let the queued work land: microtasks, then the macrotask the prefetch waits
 * for, then the microtasks after it. jsdom has no `requestIdleCallback`, so the
 * prefetch takes its `setTimeout` fallback here.
 */
const settle = async (): Promise<void> => {
  for (let i = 0; i < 3; i++) await new Promise(r => setTimeout(r, 0))
}

beforeEach(() => { shapes.made = [] })
afterEach(() => { document.body.innerHTML = '' })

/* ------------------------------------------------- A: the count is the grid --- */

describe('the count and the frames can never disagree', () => {
  it('draws exactly as many cells as the heading promises, on a partial album', () => {
    /*
     * The case that used to lie was a heading promising more than the grid could
     * ever fill. Both halves come from `builtIn` now, read once — see
     * `sectionFor` — so whatever the filter is, they cannot disagree.
     *
     * Home Pets is the partial album as of 4 August: sixteen rostered, fifteen
     * RELEASED. `animal-rat` is built and not yet pushed, so it has no frame.
     * (It used to be Night Time at thirteen of sixteen, on the built filter.)
     */
    const { album, slots, promised } = setup()
    album.open([], ['home-pets'])
    expect(promised()).toBe(15)
    expect(slots()).toHaveLength(promised())
  })

  it('draws exactly as many cells as the heading promises, on a whole album', () => {
    const { album, slots, promised } = setup()
    album.open([FOX], ['base'])
    expect(promised()).toBe(24)
    expect(slots()).toHaveLength(promised())
  })

  it('holds on every page of the book at once', () => {
    const { album, walk, slots, promised } = setup()
    album.open([], ['base', 'garden', 'home-pets', 'africa', 'night-time'])
    for (const [cells, said] of walk(() => [slots().length, promised()] as const)) {
      expect(cells).toBe(said)
    }
  })
})

/* --------------------------------------------- B: only the built members --- */

describe('a partial collection shows only what has been RELEASED', () => {
  /*
   * "Built" became "released" on 4 August — Joe: *"i only want to see in the
   * album the silhouette cards for the animals that have successfully pushed."*
   * See `built.ts`'s header for the reversal and why the base 24 are exempt.
   *
   * The examples had to move with it. Night Time and Africa are BUILT and not
   * pushed, so they have no page at all now and are covered by the "no page"
   * block below. Home Pets is the partial album instead, and it is a better
   * example than either was: the missing one is missing because Joe has not
   * pushed it yet, which is exactly the state this filter exists to show.
   */
  it('gives Home Pets fifteen frames, not sixteen', () => {
    // `animal-rat` is built and unpushed. One frame that should not be promised.
    const { album, slots, tally } = setup()
    album.open([], ['home-pets'])
    expect(collection('home-pets')?.members).toHaveLength(16)
    expect(slots()).toHaveLength(15)
    expect(tally()).toBe('0 of 15')
  })

  it('gives Garden all fourteen, because Joe has pushed every one', () => {
    const { album, slots, tally, heading } = setup()
    album.open([], ['garden'])
    expect(collection('garden')?.members).toHaveLength(14)
    expect(slots()).toHaveLength(14)
    expect(tally()).toBe('0 of 14')
    expect(heading()).toBe('Garden0 of 14')
  })

  it('counts the friend they own against the released total, not the rostered one', () => {
    const { album, tally } = setup()
    album.open([pet('p9', 'Snap', 'animal-hedgehog')], ['garden'])
    expect(tally()).toBe('1 of 14')
  })
})

/* ------------------------------------------- C: nothing built, no page at all --- */

describe('a collection with nothing built gets no page', () => {
  it('leaves Woodland out of the book entirely — no page, no dot, no name', () => {
    /*
     * >>> THIS WAS FARM until PB-074 built it 16 of 16 on 3 August. Farm now has
     * >>> a page, so it proves the opposite of what this test needs. Woodland is
     * >>> the empty collection now: sixteen rostered, none built.
     */
    const { album, sections, dots, text } = setup()
    album.open([FOX], ['base', 'woodland'])
    expect(builtIn('woodland')).toEqual([])
    expect(sections()).toHaveLength(1)
    expect(dots()).toHaveLength(1)
    expect(text()).not.toContain('Woodland')
  })

  it('says nothing about it anywhere in the card, not even "coming soon"', () => {
    const { album, text } = setup()
    album.open([], ['woodland', 'base', 'ocean', 'birds'])
    expect(text()).toContain('Base Set')
    for (const gone of ['Woodland', 'Ocean', 'Birds']) {
      expect(text(), `${gone} must not appear`).not.toContain(gone)
    }
  })
})

/* -------------------------------------- D: brief §19, nobody is ever lost --- */

describe('BRIEF §19: nothing the child owns is lost by the filter', () => {
  /**
   * The general form, and the assertion that matters most.
   *
   * Every pet handed to `open` must be reachable SOMEWHERE in the book with its
   * name on it. Not "most of them", not "the ones with frames" — a roster view
   * that starts dropping rows is exactly the sort of change that loses somebody
   * quietly, and a count is the only assertion that catches a loss nobody
   * thought to name.
   */
  const nobodyVanishes = (pets: readonly Pet[], albums: readonly string[]): void => {
    const { album, names } = setup()
    album.open(pets, albums)
    const found = names()
    expect(found.length).toBeGreaterThanOrEqual(pets.length)
    for (const p of pets) expect(found, `${p.name} vanished`).toContain(p.name)
  }

  /** Turn to the page whose heading is `title` and hand back the cell named `name`. */
  const reach = (
    pets: readonly Pet[], albums: readonly string[], title: string, name: string,
  ): { album: ReturnType<typeof setup>['album']; cell: HTMLElement } => {
    const { album, on, owned, heading } = setup()
    album.open(pets, albums)
    while (heading() !== title && !on().disabled) on().click()
    expect(heading(), `never reached the ${title} page`).toBe(title)
    const cell = owned().find(c => c.textContent === name)
    expect(cell, `${name} is not on the ${title} page`).toBeTruthy()
    return { album, cell: cell as HTMLElement }
  }

  it('D1: keeps a pet whose species is rostered but has no frame', () => {
    /*
     * The page IS shown, but this pet's species is not one of the members with a
     * frame on it — so the page she met it on no longer has a slot for it.
     * `shown` is built from `builtIn` rather than from the roster precisely so
     * this pet falls onto "More friends" instead of off the end of the book.
     *
     * The example is Home Pets and the rat since 4 August: Night Time has no
     * page at all now, which is a different case and is covered above.
     */
    const RAT = pet('p2', 'Squeak', 'animal-rat')
    const pets = [FOX, RAT]
    expect(PART_HIDDEN).toContain('animal-rat')
    nobodyVanishes(pets, ['base', PART_SET])

    const { album, cell } = reach(pets, ['base', PART_SET], 'More friends', 'Squeak')
    expect(cell.getAttribute('role')).toBe('button')
    expect(cell.getAttribute('aria-label')).toContain('Squeak')
    cell.click()
    expect(album.popped()).toBe(RAT)
  })

  it('D2: keeps a pet from a collection that is hidden entirely', () => {
    // Woodland has nothing built, so there is no Woodland page at all — and it
    // makes no difference whether the caller asked for one.
    for (const albums of [['base'], ['base', 'woodland']]) {
      nobodyVanishes([FOX, BEAR], albums)
    }

    const { album, cell } = reach([FOX, BEAR], ['base', 'woodland'], 'More friends', 'Bramble')
    expect(cell.getAttribute('role')).toBe('button')
    cell.click()
    expect(album.popped()).toBe(BEAR)
  })

  it('D3: keeps a pet whose species the roster has never heard of', () => {
    // Unchanged by this work, and asserted here so a regression in the new
    // `shown` set cannot take the old case down with it.
    const pets = [FOX, STRANGER]
    nobodyVanishes(pets, ['base'])

    const { album, cell } = reach(pets, ['base'], 'More friends', 'Moth')
    cell.click()
    expect(album.popped()).toBe(STRANGER)
  })

  it('loses nobody with all three at once, and no album open but their own', () => {
    /*
     * The worst case in one go: a friend with no frame, a friend from a hidden
     * collection, a friend from the future, a duplicate, and only the base album
     * showing. Every one of them has to be somewhere.
     */
    const pets = [FOX, BAT, BEAR, STRANGER, pet('p5', 'Rellow', 'animal-fox')]
    nobodyVanishes(pets, ['base'])
    nobodyVanishes(pets, ['base', 'farm', 'woodland', 'night-time', 'africa'])
  })

  it('reaches exactly as many named cells as there are pets — no doubles either', () => {
    const pets = [FOX, BAT, BEAR, STRANGER]
    const { album, names } = setup()
    album.open(pets, ['base', 'night-time', 'woodland'])
    expect(names().sort()).toEqual(pets.map(p => p.name).sort())
  })
})

/* ------------------------------------------------ E: the prefetch warms right --- */

describe('the prefetch warms the page they are about to reach', () => {
  /** Which night-time species the album actually asked for a shape of. */
  const warmed = (): string[] =>
    shapes.made.map(b => NAMED_SHAPE.get(b)).filter((id): id is string => !!id)

  it('warms the released members of the next page and none of the held-back', async () => {
    /*
     * A STALE INDEX HERE IS A SILENT WRONG-PORTRAIT BUG, which is why this is
     * asserted by name rather than by count. A member with no frame must never be
     * asked for: `shapeOf` would fall through to the island's own cache and ask
     * it for an animal the page does not show, and `asked` is what proves it
     * never does.
     */
    const { album, asked } = setup()
    album.open([], ['base', PART_SET])
    expect(warmed(), 'not during the turn itself').toEqual([])

    await settle()
    expect(warmed().sort()).toEqual([...PART_SHOWN].sort())
    expect(PART_HIDDEN.length, 'the partial set is no longer partial').toBeGreaterThan(0)
    for (const id of PART_HIDDEN) expect(asked, id).not.toContain(id)
  })

  it('is not shifted by a hidden collection sitting in the argument', () => {
    /*
     * `pages` has already had the empty collections taken out, so `at + 1` must
     * mean the page the child is one tap away from — not the id one along in the
     * list the caller happened to pass. Woodland is in the argument and is not a
     * page, so the warm after page 0 is still the partial set's own members.
     *
     * >>> WAS FARM; PB-074 built it, so it was a page. Then on 4 August the
     * >>> filter became RELEASED and Farm went back to having no page — as did
     * >>> Night Time and Africa. Woodland keeps the role; any of the four would
     * >>> do, and none of them is a page.
     */
    const { album } = setup()
    album.open([], ['base', 'woodland', PART_SET])
    return settle().then(() => {
      expect(warmed().sort()).toEqual([...PART_SHOWN].sort())
    })
  })

  it('warms one page ahead and no further', async () => {
    // The partial set is two pages away here, so nothing of it may be touched.
    const { album } = setup()
    album.open([], ['base', 'garden', PART_SET])
    await settle()
    expect(warmed()).toEqual([])
  })
})

/* ---------------------------------------------------- F: the album, out loud --- */

describe('the album as a child sees it today', () => {
  it('prints the book page by page, and there are 53 frames in it', () => {
    /*
     * THE WHOLE BOOK A CHILD CAN BE SHOWN ON THIS BUILD. `base` is forced open on
     * every island and the rest are what `unlock.ts`'s hold can offer; this test
     * opens every one of them deliberately, to print the book (a child still sees
     * at most `MAX_ACTIVE` at once).
     *
     * >>> 4 AUGUST: SIX PAGES BECAME THREE, and 84 frames became 53. Joe: *"i
     * >>> only want to see in the album the silhouette cards for the animals that
     * >>> have successfully pushed."* Africa, Night Time and Farm are BUILT and
     * >>> unpushed from end to end, so they have no page at all — the same rule
     * >>> that hid Woodland, applied to the animals rather than to the modelling.
     * >>>
     * >>> What is left is the honest book: 24 base + 14 Garden + 15 Home Pets.
     * >>> Every frame in it is an animal an egg can actually contain, which is
     * >>> the whole point of the change. It grows again the moment he pushes.
     *
     * The dump is for a human to eyeball; the assertion under it is what keeps
     * this test honest, and 53 is the same total `species-built.test.ts` pins
     * from the other end.
     */
    const OPENABLE = ['base', 'garden', 'home-pets', 'africa', 'night-time', 'farm']
    const { album, walk, heading, tally, slots } = setup()
    album.open([], OPENABLE)

    const book = walk(() => ({
      page: heading().replace(tally(), ''),
      count: tally(),
      cells: slots().length,
    }))

    console.log('\n  THE ALBUM, 3 August 2026 — %d pages, %d frames',
      book.length, book.reduce((n, p) => n + p.cells, 0))
    for (const [at, p] of book.entries()) {
      console.log('   %d. %s — "%s" — %d cells', at + 1, p.page, p.count, p.cells)
    }
    console.log('')

    expect(book.map(p => p.page)).toEqual(['Base Set', 'Garden', 'Home Pets'])
    expect(book.map(p => p.cells)).toEqual([24, 14, 15])
    expect(book.reduce((n, p) => n + p.cells, 0)).toBe(53)
  })
})
