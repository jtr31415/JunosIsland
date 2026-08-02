/** @vitest-environment jsdom */
/**
 * The challenge stage: does it actually come up, and does it tell the truth
 * about how much longer?
 *
 * The first version of this file tested a `stageLayout()` function that
 * NOTHING CALLED — the real split lives in CSS, where media queries work — so
 * twelve green assertions covered a layout no child would ever see. Worse, the
 * feature it was meant to cover was dead on arrival: `stageFor()` raised the
 * staged flag and the very next line mounted the round, whose `teardown()`
 * dropped it again. The split view never once appeared, and the whole suite
 * passed.
 *
 * So the layout maths is gone, and what is left tests the seam that broke.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOverlay } from '../../src/island/overlay'
import type { Overlay, OverlayHost } from '../../src/island/overlay'
import * as THREE from 'three'
import { createStage, dotsFilled, DOT_COUNT } from '../../src/island/stage'
import type { SumItem } from '../../src/core/generators/sums'
import type { ReadPick } from '../../src/core/generators/read'
import { balance } from '../../src/island/balance'

const SUM: SumItem = { a: 2, b: 3, op: 'add' }
const PICKS: ReadPick[] = [{ w: 'sat', cls: 'green' }, { w: 'him', cls: 'green' }]

function setup() {
  const root = document.createElement('div')
  document.body.append(root)
  const host = {
    speech: {
      speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
      noticeShown: vi.fn(() => false), markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    onPassed: vi.fn(),
    onDismissed: vi.fn(),
  } satisfies OverlayHost
  const overlay: Overlay = createOverlay(root, host)
  const layer = root.querySelector('.overlay') as HTMLElement
  return { root, host, overlay, layer }
}

beforeEach(() => {
  Element.prototype.animate = vi.fn(() => ({ onfinish: null })) as never
})
afterEach(() => { document.body.innerHTML = '' })

describe('raising the stage', () => {
  it('comes up as part of the mount, in ONE call', () => {
    /*
     * The bug this exists for: every open*() tears the previous round down
     * first, and teardown drops the staged class. Raising the stage as its own
     * step beforehand set a flag wiped microseconds later — no split, no
     * vignette, and the egg re-parented onto a scene nothing was drawing,
     * with the whole suite green.
     *
     * Passing it to the mount makes the two a single act. Sequencing them
     * wrongly is no longer expressible.
     */
    const { overlay, layer } = setup()
    overlay.openWordFind(PICKS, true)
    expect(layer.classList.contains('staged')).toBe(true)
    expect(overlay.stageRect()).not.toBeNull()
  })

  it('does NOT come up for a round that asked for no vignette', () => {
    const { overlay, layer } = setup()
    overlay.openSum(SUM, false)
    expect(layer.classList.contains('staged')).toBe(false)
  })

  it('drops when a staged round is replaced by an unstaged one', () => {
    // Continuing in place swaps one page for the next; a leftover split with
    // nothing drawn in it is a blank half-screen.
    const { overlay, layer } = setup()
    overlay.openSum(SUM, true)
    overlay.openSum(SUM, false)
    expect(layer.classList.contains('staged')).toBe(false)
  })

  it('is dropped again the moment the round is torn down', () => {
    // Otherwise the split layout survives into a round that has no vignette.
    const { overlay, layer } = setup()
    overlay.openSum(SUM, true)
    overlay.close()
    expect(layer.classList.contains('staged')).toBe(false)
    expect(overlay.stageRect()).toBeNull()
  })

  it('reports no rect while unstaged, so nothing is drawn into a corner', () => {
    const { overlay } = setup()
    overlay.openSum(SUM)
    expect(overlay.stageRect()).toBeNull()
  })
})

describe('the progress dots', () => {
  it('renders the dots it is asked for, and marks the filled ones', () => {
    const { overlay, root } = setup()
    overlay.openSum(SUM)
    overlay.setDots(2, DOT_COUNT)
    expect(root.querySelectorAll('.stage-dot')).toHaveLength(DOT_COUNT)
    expect(root.querySelectorAll('.stage-dot.on')).toHaveLength(2)
  })

  it('unfills as well as fills, rather than only ever adding', () => {
    // A new round starts at zero; leftover lit dots would overstate progress.
    const { overlay, root } = setup()
    overlay.openSum(SUM)
    overlay.setDots(4, DOT_COUNT)
    overlay.setDots(1, DOT_COUNT)
    expect(root.querySelectorAll('.stage-dot.on')).toHaveLength(1)
  })

  it('draws none at all when the balance flag turns them off', () => {
    const { overlay, root } = setup()
    overlay.openSum(SUM)
    overlay.setDots(0, 0)
    expect(root.querySelectorAll('.stage-dot')).toHaveLength(0)
  })
})

describe('dotsFilled', () => {
  it('shows nothing before any work is done', () => {
    // Lighting a dot for free is a small lie told at the start of every round.
    expect(dotsFilled(0, 10)).toBe(0)
  })

  it('lights one the moment ANY work lands, however long the tile', () => {
    /*
     * On a sixteen-sum tile one correct answer is 6%, which floors to zero.
     * Getting a sum right and watching nothing happen reads as being ignored.
     */
    expect(dotsFilled(1, 16)).toBe(1)
    expect(dotsFilled(1, 100)).toBe(1)
  })

  it('fills up as the work does', () => {
    expect(dotsFilled(5, 10)).toBe(2)
    expect(dotsFilled(8, 10)).toBe(4)
    expect(dotsFilled(10, 10)).toBe(DOT_COUNT)
  })

  it('never overfills, however much work arrives', () => {
    expect(dotsFilled(99, 10)).toBe(DOT_COUNT)
  })

  it('treats a free tile as already done rather than dividing by zero', () => {
    expect(dotsFilled(0, 0)).toBe(DOT_COUNT)
  })

  it('never goes backwards as work accumulates', () => {
    // Pieces never un-grow (§2), and neither may the dots that count them.
    for (const cost of [1, 3, 7, 16]) {
      let last = 0
      for (let done = 0; done <= cost; done++) {
        const now = dotsFilled(done, cost)
        expect(now).toBeGreaterThanOrEqual(last)
        last = now
      }
    }
  })

  it('keeps a fixed number of dots whatever the tile costs', () => {
    /*
     * A sixteen-sum tile drawn as sixteen pips is a wall that reads as further
     * away than it is — the opposite of encouraging.
     */
    for (const cost of [1, 5, 16, 40]) expect(dotsFilled(cost, cost)).toBe(DOT_COUNT)
  })
})

/**
 * The album chip (§3's last beat).
 *
 * It answers the question a six-year-old actually has at the end of a hatch —
 * "where did my friend GO?" — so it must survive the awkward cases rather
 * than taking the ceremony down with it.
 */
describe('the album chip', () => {
  it('flies a chip toward the album button', () => {
    const { overlay, root } = setup()
    const target = document.createElement('button')
    document.body.append(target)

    overlay.flyToAlbum('Gachap', target)

    const chip = root.querySelector('.album-chip')
    expect(chip).not.toBeNull()
    expect(chip?.textContent).toBe('Gachap')
  })

  it('hides the chip from screen readers — the name was already spoken', () => {
    const { overlay, root } = setup()
    const target = document.createElement('button')
    document.body.append(target)
    overlay.flyToAlbum('Gachap', target)
    expect(root.querySelector('.album-chip')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does nothing at all when there is no album button to fly to', () => {
    // A decoration that throws would take the whole hatch ceremony with it.
    const { overlay, root } = setup()
    expect(() => overlay.flyToAlbum('Gachap', null)).not.toThrow()
    expect(root.querySelector('.album-chip')).toBeNull()
  })

  it('leaves no litter when the animation never finishes', () => {
    /*
     * onfinish is not guaranteed — a backgrounded tab, a dropped frame budget,
     * a browser that throttles animations. A chip stuck on screen would sit
     * over the island until reload.
     */
    vi.useFakeTimers()
    const { overlay, root } = setup()
    const target = document.createElement('button')
    document.body.append(target)

    overlay.flyToAlbum('Gachap', target)
    expect(root.querySelector('.album-chip')).not.toBeNull()

    // Derived from the flight, not guessed: the backstop must outlive it.
    vi.advanceTimersByTime(balance.stage.chipMs + 900)
    expect(root.querySelector('.album-chip')).toBeNull()
    vi.useRealTimers()
  })
})

/**
 * The turntable's scene-graph lifetime.
 *
 * The ceremony moves the child's real egg onto the stage and back, and stands
 * a borrowed pet beside it — all by re-parenting live objects between two
 * scenes. Every one of those moves is a chance to lose something they own.
 *
 * The regression this exists to catch: an exit path that forgets
 * `showTemp(null)` leaves the hatched pet parented to the turntable FOREVER —
 * the stage outlives every round — so it reappears standing next to egg #2.
 * Nothing would fail; it would simply be there.
 */
describe('the turntable, as a scene graph', () => {
  it('lends the egg out and gives it back exactly where it stood', () => {
    const stage = createStage()
    const home = new THREE.Scene()
    const egg = new THREE.Group()
    egg.position.set(3.5, 0, -2.25)
    home.add(egg)

    stage.show(egg, home)
    expect(egg.parent).not.toBe(home)          // on the turntable now
    expect(stage.holds(egg)).toBe(true)
    expect(egg.position.lengthSq()).toBe(0)    // centred for display

    stage.show(null, home)
    expect(egg.parent).toBe(home)
    expect(egg.position.toArray()).toEqual([3.5, 0, -2.25])
    expect(stage.holds(egg)).toBe(false)
  })

  it('stands a borrowed friend up and takes it away again', () => {
    const stage = createStage()
    const pet = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1))

    stage.showTemp(pet)
    expect(pet.parent).not.toBeNull()

    stage.showTemp(null)
    expect(pet.parent).toBeNull()
  })

  it('NEVER disposes the borrowed friend — it is a shared clone', () => {
    /*
     * A three.js clone shares geometry and materials with the cached
     * original. Freeing them here would break every other pet of that
     * species, on the stage and on the island, including friends the child
     * already owns (brief §19). Detaching is the whole of the cleanup.
     */
    const stage = createStage()
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial()
    const pet = new THREE.Mesh(geometry, material)
    const geoDispose = vi.spyOn(geometry, 'dispose')
    const matDispose = vi.spyOn(material, 'dispose')

    stage.showTemp(pet)
    stage.showTemp(null)
    stage.dispose()

    expect(geoDispose).not.toHaveBeenCalled()
    expect(matDispose).not.toHaveBeenCalled()
  })

  it('replaces one borrowed friend with the next, leaving no one behind', () => {
    const stage = createStage()
    const first = new THREE.Group()
    const second = new THREE.Group()

    stage.showTemp(first)
    stage.showTemp(second)

    expect(first.parent).toBeNull()
    expect(second.parent).not.toBeNull()
  })

  it('keeps the egg and the friend apart — they are different slots', () => {
    // The egg goes home; the friend is merely borrowed. Confusing the two
    // would either strand the egg on the stage or re-parent a pet into the
    // world at the egg's coordinates.
    const stage = createStage()
    const home = new THREE.Scene()
    const egg = new THREE.Group()
    home.add(egg)
    const pet = new THREE.Group()

    stage.show(egg, home)
    stage.showTemp(pet)
    expect(stage.holds(egg)).toBe(true)

    stage.showTemp(null)
    expect(stage.holds(egg)).toBe(true)        // the friend leaving is not the egg leaving
    expect(pet.parent).toBeNull()

    stage.show(null, home)
    expect(egg.parent).toBe(home)
  })

  it('settles a borrowed friend at exactly the size it was fitted to', () => {
    const stage = createStage()
    const pet = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1))
    pet.position.y = 2

    /*
     * A 4-unit-tall box fitted into 0.6 of height settles at 0.15. Computed
     * here rather than read back after showTemp, which deliberately starts
     * the friend at nothing so it can pop into being.
     */
    stage.showTemp(pet, 0.6)
    expect(pet.scale.x).toBeLessThan(0.01)     // starts from nothing

    for (let i = 0; i < 60; i++) stage.update(1 / 30, i / 30)

    // The pop-in overshoots and comes back; it must not leave the friend
    // permanently 22% too big.
    expect(pet.scale.x).toBeCloseTo(0.6 / 4, 5)
  })

  it('hands the egg back on dispose rather than taking it with it', () => {
    const stage = createStage()
    const home = new THREE.Scene()
    const egg = new THREE.Group()
    egg.position.set(1, 0, 2)
    home.add(egg)

    stage.show(egg, home)
    stage.dispose()

    expect(egg.parent).toBe(home)
    expect(egg.position.toArray()).toEqual([1, 0, 2])
  })
})
