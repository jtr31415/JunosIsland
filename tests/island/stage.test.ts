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
import { dotsFilled, DOT_COUNT } from '../../src/island/stage'
import type { SumItem } from '../../src/core/generators/sums'
import type { ReadPick } from '../../src/core/generators/read'

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
