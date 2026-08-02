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

const NIGHT_BUILT = builtIn('night-time')
const NIGHT_UNBUILT = (collection('night-time')?.members ?? [])
  .filter(m => !NIGHT_BUILT.includes(m))

/** Assembly record -> species id, so a recorded build can be named. */
const NAMED_SHAPE = new Map<unknown, string>()
for (const id of NIGHT_BUILT) {
  const a = speciesRecord(id)?.assembly
  if (a) NAMED_SHAPE.set(a, id)
}

const pet = (id: string, name: string, species: string): Pet =>
  ({ id, name, species, at: { q: 0, r: 0 } })

const FOX = pet('p1', 'Gachap', 'animal-fox')
/** Rostered, and nobody has built it: no membrane in the parts bank. */
const BAT = pet('p2', 'Squeak', 'animal-bat')
/** A collection with nothing built at all — Farm went back to zero in PB-036. */
const SHEEP = pet('p3', 'Woolly', 'animal-sheep')
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
     * Night Time is the case that used to lie: sixteen rostered, thirteen built,
     * and a heading that said sixteen over a grid of sixteen frames of which
     * three could never be filled. Both halves come from `builtIn` now, read
     * once — see `sectionFor`.
     */
    const { album, slots, promised } = setup()
    album.open([], ['night-time'])
    expect(promised()).toBe(13)
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

describe('a partial collection shows only what somebody has built', () => {
  it('gives Night Time thirteen frames, not sixteen', () => {
    // `animal-bat` and `animal-sugar-glider` want a membrane, `animal-scorpion`
    // a pincer, and the bank has neither. Three frames that can never be filled.
    const { album, slots, tally } = setup()
    album.open([], ['night-time'])
    expect(collection('night-time')?.members).toHaveLength(16)
    expect(slots()).toHaveLength(13)
    expect(tally()).toBe('0 of 13')
  })

  it('gives Africa one frame, not sixteen', () => {
    // The crocodile alone, built bespoke on the assembly kit. PB-036 deleted the
    // other fifteen and their frames stayed behind until this change.
    const { album, slots, tally, heading } = setup()
    album.open([], ['africa'])
    expect(collection('africa')?.members).toHaveLength(16)
    expect(slots()).toHaveLength(1)
    expect(tally()).toBe('0 of 1')
    expect(heading()).toBe('Africa0 of 1')
  })

  it('counts the friend they own against the built total, not the rostered one', () => {
    const { album, tally } = setup()
    album.open([pet('p9', 'Snap', 'animal-crocodile')], ['africa'])
    expect(tally()).toBe('1 of 1')
  })
})

/* ------------------------------------------- C: nothing built, no page at all --- */

describe('a collection with nothing built gets no page', () => {
  it('leaves Farm out of the book entirely — no page, no dot, no name', () => {
    const { album, sections, dots, text } = setup()
    album.open([FOX], ['base', 'farm'])
    expect(builtIn('farm')).toEqual([])
    expect(sections()).toHaveLength(1)
    expect(dots()).toHaveLength(1)
    expect(text()).not.toContain('Farm')
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
     * Night Time IS shown — thirteen of it is built — but `animal-bat` is not one
     * of the thirteen, so the page she met it on no longer has a slot for it.
     * `shown` is built from `builtIn` rather than from the roster precisely so
     * this pet falls onto "More friends" instead of off the end of the book.
     */
    const pets = [FOX, BAT]
    expect(NIGHT_UNBUILT).toContain('animal-bat')
    nobodyVanishes(pets, ['base', 'night-time'])

    const { album, cell } = reach(pets, ['base', 'night-time'], 'More friends', 'Squeak')
    expect(cell.getAttribute('role')).toBe('button')
    expect(cell.getAttribute('aria-label')).toContain('Squeak')
    cell.click()
    expect(album.popped()).toBe(BAT)
  })

  it('D2: keeps a pet from a collection that is hidden entirely', () => {
    // Farm has nothing built, so there is no Farm page at all — and it makes no
    // difference whether the caller asked for one.
    for (const albums of [['base'], ['base', 'farm']]) {
      nobodyVanishes([FOX, SHEEP], albums)
    }

    const { album, cell } = reach([FOX, SHEEP], ['base', 'farm'], 'More friends', 'Woolly')
    expect(cell.getAttribute('role')).toBe('button')
    cell.click()
    expect(album.popped()).toBe(SHEEP)
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
    const pets = [FOX, BAT, SHEEP, STRANGER, pet('p5', 'Rellow', 'animal-fox')]
    nobodyVanishes(pets, ['base'])
    nobodyVanishes(pets, ['base', 'farm', 'woodland', 'night-time', 'africa'])
  })

  it('reaches exactly as many named cells as there are pets — no doubles either', () => {
    const pets = [FOX, BAT, SHEEP, STRANGER]
    const { album, names } = setup()
    album.open(pets, ['base', 'night-time', 'farm'])
    expect(names().sort()).toEqual(pets.map(p => p.name).sort())
  })
})

/* ------------------------------------------------ E: the prefetch warms right --- */

describe('the prefetch warms the page they are about to reach', () => {
  /** Which night-time species the album actually asked for a shape of. */
  const warmed = (): string[] =>
    shapes.made.map(b => NAMED_SHAPE.get(b)).filter((id): id is string => !!id)

  it('warms the thirteen built night-time species and none of the three unbuilt', async () => {
    /*
     * A STALE INDEX HERE IS A SILENT WRONG-PORTRAIT BUG, which is why this is
     * asserted by name rather than by count. The three unbuilt members have no
     * record at all, so `shapeOf` would fall through to the island's own cache
     * and ask it for `animal-bat` — `asked` is what proves it never does.
     */
    const { album, asked } = setup()
    album.open([], ['base', 'night-time'])
    expect(warmed(), 'not during the turn itself').toEqual([])

    await settle()
    expect(warmed().sort()).toEqual([...NIGHT_BUILT].sort())
    expect(warmed()).toHaveLength(13)
    for (const id of NIGHT_UNBUILT) expect(asked, id).not.toContain(id)
  })

  it('is not shifted by a hidden collection sitting in the argument', () => {
    /*
     * `pages` has already had the empty collections taken out, so `at + 1` must
     * mean the page the child is one tap away from — not the id one along in the
     * list the caller happened to pass. Farm is in the argument and is not a
     * page, so the warm after page 0 is still Night Time's thirteen.
     */
    const { album } = setup()
    album.open([], ['base', 'farm', 'night-time'])
    return settle().then(() => {
      expect(warmed().sort()).toEqual([...NIGHT_BUILT].sort())
    })
  })

  it('warms one page ahead and no further', async () => {
    // Night Time is three pages away here, so nothing of it may be touched yet.
    const { album } = setup()
    album.open([], ['base', 'garden', 'home-pets', 'night-time'])
    await settle()
    expect(warmed()).toEqual([])
  })
})

/* ---------------------------------------------------- F: the album, out loud --- */

describe('the album as a child sees it today', () => {
  it('prints the book page by page, and there are 68 frames in it', () => {
    /*
     * THE FIVE COLLECTIONS THAT CAN BE OPENED TODAY. `unlock.ts`'s `HELD_BACK`
     * leaves exactly four candidates — garden, africa, night-time, home-pets —
     * and `base` is forced open on every island, so this is the whole of what a
     * child can ever be shown on this build.
     *
     * The dump is for a human to eyeball; the assertion under it is what keeps
     * this test honest, and 68 is the same total `species-built.test.ts` pins
     * from the other end.
     */
    const OPENABLE = ['base', 'garden', 'home-pets', 'africa', 'night-time']
    const { album, walk, heading, tally, slots } = setup()
    album.open([], OPENABLE)

    const book = walk(() => ({
      page: heading().replace(tally(), ''),
      count: tally(),
      cells: slots().length,
    }))

    console.log('\n  THE ALBUM, 2 August 2026 — %d pages, %d frames',
      book.length, book.reduce((n, p) => n + p.cells, 0))
    for (const [at, p] of book.entries()) {
      console.log('   %d. %s — "%s" — %d cells', at + 1, p.page, p.count, p.cells)
    }
    console.log('')

    expect(book.map(p => p.page)).toEqual(
      ['Base Set', 'Garden', 'Home Pets', 'Africa', 'Night Time'])
    expect(book.map(p => p.cells)).toEqual([24, 14, 16, 1, 13])
    expect(book.reduce((n, p) => n + p.cells, 0)).toBe(68)
  })
})
