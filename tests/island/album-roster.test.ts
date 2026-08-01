/**
 * @vitest-environment jsdom
 *
 * THE ALBUM AS A ROSTER: what is to come, beside what she has.
 *
 * Joe, 1 Aug: *"show the blank slots in the album of what is to come.
 * silhouettes only, no names, no animals, no clickability, just a roster of the
 * animals per album, 4 albums always on show, next one shows when one is
 * completed. we need to keep motivation up. and anticipation is motivation."*
 *
 * `album.test.ts` covers the pop-out and everything about a friend she owns, and
 * none of it is repeated here. This file is about the three things the roster
 * added, in the order they could go wrong:
 *
 *   1. THE BLANKS ARE INERT. Silhouette, no name, no tap. A blank that
 *      highlights under a finger promises something that will not happen.
 *   2. NOBODY IS LOST. A roster view keys on species, and a child owns PETS —
 *      so a duplicate, or an animal from an album that is not open, has to go
 *      somewhere. Brief §19 is that nothing she owns is ever lost, and this is
 *      exactly the sort of change that loses somebody quietly.
 *   3. THE SLOTS ARE THE ROSTER'S, in the roster's order, on every island.
 *
 * jsdom has no WebGL, so no portrait is ever taken here — which is the honest
 * environment for these assertions anyway: every one of them is about the DOM
 * the album builds, not about the picture that arrives in it later.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import * as THREE from 'three'
import { createAlbum } from '../../src/island/album'
import type { AlbumWorld } from '../../src/island/album'
import { collection } from '../../src/island/species/roster'
import type { Pet } from '../../src/island/flow'

const BASE = collection('base')
const GARDEN = collection('garden')

const pet = (id: string, name: string, species: string): Pet =>
  ({ id, name, species, at: { q: 0, r: 0 } })

const FOX = pet('p1', 'Gachap', 'animal-fox')
const BEE = pet('p2', 'Vusp', 'animal-bee')
/** A second animal of a species she already has. Only possible once a pack is out. */
const FOX2 = pet('p3', 'Rellow', 'animal-fox')
/** A species no open album lists — what a save from a later build can carry. */
const STRANGER = pet('p4', 'Moth', 'animal-from-the-future')

function setup() {
  const root = document.createElement('div')
  document.body.append(root)
  const speech = {
    speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
    noticeShown: () => false, markNoticeShown: vi.fn(),
  }
  const world: AlbumWorld = {
    preview: vi.fn(async () => new THREE.Group()),
    livePosition: vi.fn(() => null),
    hatchPosition: vi.fn(() => new THREE.Vector3()),
    focusOn: vi.fn(),
    onFrame: vi.fn(),
    onOverlayFrame: vi.fn(),
  }
  const album = createAlbum(root, speech, world)
  const all = (sel: string): HTMLElement[] =>
    [...root.querySelectorAll(sel)] as HTMLElement[]
  /** The two page turns, in the order they sit on the card. */
  const turns = (): HTMLButtonElement[] =>
    all('.album-page-turn') as HTMLButtonElement[]
  return {
    root, album,
    sections: () => all('.album-set'),
    slots: () => all('.album-cell'),
    blanks: () => all('.album-blank'),
    owned: () => all('.album-cell:not(.album-blank)'),
    headings: () => all('.album-set-title'),
    dots: () => all('.album-dot'),
    here: () => all('.album-dot-here'),
    back: () => turns()[0] as HTMLButtonElement,
    on: () => turns()[1] as HTMLButtonElement,
    /** Turn forward `n` times. The album is a book now, not a scroll. */
    forward: (n = 1) => { for (let i = 0; i < n; i++) (turns()[1] as HTMLButtonElement).click() },
  }
}

afterEach(() => { document.body.innerHTML = '' })

describe('a slot for every animal in the album', () => {
  it('draws the whole roster, not just the ones she has', () => {
    const { album, slots, owned } = setup()
    album.open([FOX], ['base'])
    expect(slots()).toHaveLength(BASE?.members.length ?? 0)
    expect(owned()).toHaveLength(1)
  })

  it('lays them out in roster order, not in the order they came home', () => {
    /*
     * The bee is eleven places ahead of the fox in the base set. Roster order is
     * the same on every island, which is what lets two children compare a
     * half-finished page — roster §3's playground currency applied to the page.
     */
    const { album, slots } = setup()
    album.open([FOX, BEE], ['base'])
    const filled = slots()
      .map((cell, at) => ({ at, name: cell.textContent }))
      .filter(c => c.name)
    expect(filled.map(c => c.name)).toEqual(['Vusp', 'Gachap'])
  })

  it('shows ONE album at a time, with its own count', () => {
    // One page per album — see the pager in album.ts. Four rosters stacked was
    // sixty-six slots down a single column, and three of the four counts were
    // off the bottom of the card.
    const { album, sections, headings, forward } = setup()
    album.open([FOX], ['base', 'garden', 'home-pets', 'birds'])
    expect(sections()).toHaveLength(1)
    expect(headings()[0]?.textContent)
      .toBe(`Base Set1 of ${BASE?.members.length ?? 0}`)

    forward()
    expect(sections()).toHaveLength(1)
    expect(headings()[0]?.textContent)
      .toBe(`Garden0 of ${GARDEN?.members.length ?? 0}`)
  })

  it('skips an album this build cannot resolve rather than drawing it empty', () => {
    const { album, sections } = setup()
    album.open([FOX], ['base', 'atlantis'])
    expect(sections()).toHaveLength(1)
  })
})

describe('turning the pages', () => {
  const FOUR = ['base', 'garden', 'home-pets', 'birds']

  it('gives one dot per page and marks where she is', () => {
    const { album, dots, here, forward } = setup()
    album.open([FOX], FOUR)
    expect(dots()).toHaveLength(4)
    expect(here()).toHaveLength(1)
    forward(2)
    expect(dots()).toHaveLength(4)
    expect(here()).toHaveLength(1)
  })

  it('cannot go back off the front or forward off the end', () => {
    /*
     * Dimmed rather than removed: a control that vanishes moves the one beside
     * it, so the forward arrow would slide under her finger on the last page.
     */
    const { album, back, on, forward } = setup()
    album.open([FOX], FOUR)
    expect(back().disabled).toBe(true)
    expect(on().disabled).toBe(false)
    forward(3)
    expect(back().disabled).toBe(false)
    expect(on().disabled).toBe(true)
    // Clicking a dead end changes nothing rather than running off the end.
    forward(2)
    expect(on().disabled).toBe(true)
  })

  it('goes back to where it came from', () => {
    const { album, headings, back, forward } = setup()
    album.open([FOX], FOUR)
    forward(2)
    const there = headings()[0]?.textContent
    forward()
    back().click()
    expect(headings()[0]?.textContent).toBe(there)
  })

  it('hides the pager when there is only one album', () => {
    // One page is not a book. Nothing to turn, so nothing to turn it with.
    const { album, root } = setup()
    album.open([FOX], ['base'])
    expect(root.querySelector('.album-pager')?.classList.contains('hide')).toBe(true)
  })

  it('opens on the first page every time, not where she left off', () => {
    const { album, headings, forward } = setup()
    album.open([FOX], FOUR)
    forward(3)
    album.open([FOX], FOUR)
    expect(headings()[0]?.textContent).toContain('Base Set')
  })

  it('builds only the page she is looking at', () => {
    /*
     * Every cell asks the portrait renderer for a picture, so rendering all
     * five pages to show one of them is the cost the stacked version paid on
     * every open. The base set is the only page in the DOM until she turns.
     */
    const { album, slots } = setup()
    album.open([FOX], FOUR)
    expect(slots()).toHaveLength(BASE?.members.length ?? 0)
  })
})

describe('a blank slot is a shape and nothing else', () => {
  it('has no name on it', () => {
    const { album, blanks } = setup()
    album.open([FOX], ['base'])
    for (const b of blanks()) expect(b.textContent).toBe('')
  })

  it('cannot be tapped — no role, no handler', () => {
    // Joe: "no clickability". The CSS takes its pointer events away too; this
    // asserts the half that survives a stylesheet nobody loaded.
    const { album, blanks } = setup()
    album.open([FOX], ['base'])
    const one = blanks()[0] as HTMLElement
    expect(one.getAttribute('role')).toBeNull()
    expect(one.onclick).toBeNull()
  })

  it('is hidden from a screen reader, because the count is the message', () => {
    const { album, blanks } = setup()
    album.open([FOX], ['base'])
    expect(blanks()[0]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('carries the silhouette class, which is what blackens it', () => {
    const { album, blanks } = setup()
    album.open([FOX], ['base'])
    expect(blanks()[0]?.querySelector('.album-silhouette')).not.toBeNull()
  })

  it('leaves its alt text empty — there is nothing to announce', () => {
    const { album, blanks } = setup()
    album.open([FOX], ['base'])
    const img = blanks()[0]?.querySelector('img') as HTMLImageElement
    expect(img.alt).toBe('')
  })
})

describe('nobody she owns is ever lost', () => {
  it('keeps a second animal of the same species, below the rosters', () => {
    /*
     * One slot per species is Joe's ruling, and a duplicate has no slot to go
     * in — but she named it and it is hers. `collection.ts` starts dealing
     * repeats again the moment a pack is exhausted, so this is reachable rather
     * than theoretical.
     */
    const { album, sections, owned, dots, forward } = setup()
    album.open([FOX, FOX2], ['base'])
    // A page of their own, at the end of the book.
    expect(dots()).toHaveLength(2)
    forward()
    expect(sections()[0]?.textContent).toContain('More friends')
    expect(owned().map(c => c.textContent)).toContain('Rellow')
  })

  it('keeps a species no open album lists', () => {
    const { album, sections, owned, forward } = setup()
    album.open([FOX, STRANGER], ['base'])
    forward()
    expect(sections()[0]?.textContent).toContain('More friends')
    expect(owned().map(c => c.textContent)).toContain('Moth')
  })

  it('adds no such page when every friend has a slot', () => {
    const { album, dots } = setup()
    album.open([FOX, BEE], ['base'])
    expect(dots()).toHaveLength(1)
  })

  it('shows the FIRST of a species in the slot, so it never changes hands', () => {
    const { album, slots } = setup()
    album.open([FOX, FOX2], ['base'])
    const at = BASE?.members.indexOf('animal-fox') ?? -1
    expect(slots()[at]?.textContent).toBe('Gachap')
  })
})

describe('an empty album', () => {
  it('is all silhouettes and says so gently', () => {
    const { album, blanks, owned, root } = setup()
    album.open([], ['base'])
    expect(owned()).toHaveLength(0)
    expect(blanks()).toHaveLength(BASE?.members.length ?? 0)
    expect(root.querySelector('.album-title')?.textContent)
      .toBe('Your friends will appear here')
  })
})
