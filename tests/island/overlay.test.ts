/** @vitest-environment jsdom */
/**
 * The overlay's LIFECYCLE, not its contents — who decides when the panel goes
 * away.
 *
 * This has been wrong twice, in opposite directions, and both times the unit
 * tests underneath were perfectly green: the challenge renderers work, the
 * flow machine works, and the bug lives in the handover between them. So these
 * tests watch the class list and the callback order, which is exactly where
 * both failures showed up.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOverlay } from '../../src/island/overlay'
import type { Overlay, OverlayHost } from '../../src/island/overlay'
import type { SumItem } from '../../src/core/generators/sums'
import type { ReadPick } from '../../src/core/generators/read'

const SUM: SumItem = { a: 2, b: 3, op: 'add' }   // answer 5
const SUM_ANSWER = 5
const PICKS: ReadPick[] = [
  { w: 'sat', cls: 'green' },
  { w: 'him', cls: 'green' },
]

function setup() {
  const root = document.createElement('div')
  document.body.append(root)

  const host = {
    speech: {
      speak: vi.fn(() => true),
      ready: () => true,
      cancel: vi.fn(),
      noticeShown: vi.fn(() => false),
      markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    onPassed: vi.fn(),
    onDismissed: vi.fn(),
  } satisfies OverlayHost

  const overlay: Overlay = createOverlay(root, host)
  const layer = root.querySelector('.overlay') as HTMLElement
  const q = (sel: string): HTMLElement => root.querySelector(sel) as HTMLElement
  return { root, host, overlay, layer, q, isOpen: () => !layer.classList.contains('hide') }
}

beforeEach(() => {
  vi.useFakeTimers()
  // v0:956 scores inside an Animation's onfinish; jsdom has no WAAPI.
  Element.prototype.animate = vi.fn(() => ({ onfinish: null })) as never
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

/**
 * Tap the backdrop: down AND up out here.
 *
 * Release-based like the world, so a finger landing on the dimmed area to
 * drag the island behind the panel does not dismiss the round on contact.
 */
function backdropTap(layer: HTMLElement): void {
  layer.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  layer.dispatchEvent(new Event('pointerup', { bubbles: true }))
}

/** Answer a sum correctly by tapping its number chips. */
function solve(root: HTMLElement, answer: number): void {
  const chips = [...root.querySelectorAll('.nchip')] as HTMLElement[]
  const chip = chips.find(c => c.textContent === String(answer))
  // v0:882 binds pointerdown, not click. jsdom has no PointerEvent constructor.
  chip?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

describe('finishing a round leaves the overlay open', () => {
  it('does NOT hide the panel when a sum is answered', () => {
    const { root, overlay, host, isOpen } = setup()
    overlay.openSum(SUM)
    expect(isOpen()).toBe(true)

    solve(root, SUM_ANSWER)
    vi.advanceTimersByTime(2500)

    /*
     * The heart of it. The previous version tore down inside finish(), so the
     * island flashed into view for the ~900ms before the host reopened — the
     * "closes and reopens" the child actually sees. The host owns the closing.
     */
    expect(host.onPassed).toHaveBeenCalledWith(true)
    expect(isOpen()).toBe(true)
  })

  it('swaps one page for the next without ever being hidden', () => {
    const { root, overlay, host, isOpen } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)
    vi.advanceTimersByTime(2500)
    expect(host.onPassed).toHaveBeenCalled()

    // What main.ts does next when the reward has not landed yet.
    overlay.openSum({ a: 4, b: 1, op: 'add' })
    expect(isOpen()).toBe(true)
    expect(root.querySelectorAll('.nchip').length).toBeGreaterThan(0)
  })

  it('closes only when the host says so, and then says nothing back', () => {
    const { root, overlay, host, isOpen } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)
    vi.advanceTimersByTime(2500)

    overlay.close()
    expect(isOpen()).toBe(false)
    /* close() is the host talking to the overlay. Reporting it back as a
       dismissal would un-arm the opening story mid-sentence. */
    expect(host.onDismissed).not.toHaveBeenCalled()
  })
})

describe('the back button', () => {
  it('collects earned work but asks for no further page', () => {
    const { root, overlay, host, q, isOpen } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)

    q('.overlay-back').click()

    // Never discard work the child has actually done (brief §18) — so this is
    // onPassed, not onDismissed. `false` is "collect it, but let me out".
    expect(host.onPassed).toHaveBeenCalledWith(false)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })

  it('dismisses for free when nothing has been earned', () => {
    const { overlay, host, q, isOpen } = setup()
    overlay.openSum(SUM)

    q('.overlay-back').click()

    expect(host.onDismissed).toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })

  it('does nothing at all when the overlay is already shut', () => {
    const { host, q } = setup()
    q('.overlay-back').click()
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
  })
})

describe('say it again', () => {
  it('is offered for reading, where there is a word to repeat', () => {
    const { overlay, q } = setup()
    overlay.openWordFind(PICKS)
    expect(q('.overlay-again').classList.contains('hide')).toBe(false)
  })

  it('is hidden for sums, where there is nothing to say', () => {
    const { overlay, q } = setup()
    overlay.openSum(SUM)
    expect(q('.overlay-again').classList.contains('hide')).toBe(true)
  })

  it('repeats the word without ending the round', () => {
    const { overlay, host, q, isOpen } = setup()
    overlay.openWordFind(PICKS)
    // Past the round's own opening prompt (900 + picks * 60, v0:886).
    vi.advanceTimersByTime(900 + PICKS.length * 60 + 50)
    host.speech.speak.mockClear()

    q('.overlay-again').click()

    expect(host.speech.speak).toHaveBeenCalled()
    expect(isOpen()).toBe(true)
    expect(host.onPassed).not.toHaveBeenCalled()
    expect(host.onDismissed).not.toHaveBeenCalled()
  })
})

describe('the backdrop', () => {
  it('tapping outside the panel goes back to the island', () => {
    const { overlay, host, layer, isOpen } = setup()
    overlay.openSum(SUM)
    backdropTap(layer)
    expect(isOpen()).toBe(false)
    expect(host.onDismissed).toHaveBeenCalled()
  })

  it('COLLECTS work already earned rather than discarding it', () => {
    /*
     * The backdrop takes the same path as the button, so a correct answer
     * followed by an impatient tap outside still banks the reward. Silently
     * throwing away work she had done would be far worse than a dead
     * backdrop (brief section 18).
     */
    const { root, overlay, host, layer } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)
    backdropTap(layer)
    expect(host.onPassed).toHaveBeenCalledWith(false)
    expect(host.onDismissed).not.toHaveBeenCalled()
  })

  it('ignores taps INSIDE the panel, which would close it mid-word', () => {
    const { root, overlay, host, isOpen } = setup()
    overlay.openWordFind(PICKS)
    const word = root.querySelector('#words .word') as HTMLElement
    word.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    word.dispatchEvent(new Event('pointerup', { bubbles: true }))
    expect(isOpen()).toBe(true)
    expect(host.onDismissed).not.toHaveBeenCalled()
  })

  it('does NOT dismiss a press that began inside and drifted out', () => {
    // Answering a word, finger slides off the panel edge as it lifts. That is
    // not a request to leave, and treating it as one would throw her out of a
    // round mid-answer.
    const { root, overlay, layer, isOpen } = setup()
    overlay.openWordFind(PICKS)
    const word = root.querySelector('#words .word') as HTMLElement
    word.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    layer.dispatchEvent(new Event('pointerup', { bubbles: true }))
    expect(isOpen()).toBe(true)
  })
})

/**
 * The ceremony window.
 *
 * Between the last correct answer and the friend arriving there are about two
 * seconds of animation. They used to be fully interactive, and a tap in them
 * could rip the egg off the turntable mid-hatch or — worse — dismiss the
 * round and then re-open one, leaving the flow in a challenge with no overlay
 * and no way out but a reload.
 */
describe('while a ceremony is playing', () => {
  it('ignores the back button', () => {
    const { overlay, host, q, isOpen } = setup()
    overlay.openWordFind(PICKS)
    overlay.setBusy(true)

    q('.overlay-back').click()

    expect(isOpen()).toBe(true)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
  })

  it('ignores the backdrop', () => {
    const { overlay, host, layer, isOpen } = setup()
    overlay.openWordFind(PICKS)
    overlay.setBusy(true)

    backdropTap(layer)

    expect(isOpen()).toBe(true)
    expect(host.onDismissed).not.toHaveBeenCalled()
  })

  it('gives the exits back the moment it is over', () => {
    // A lock that outlived its ceremony would be a trap of its own.
    const { overlay, host, q, isOpen } = setup()
    overlay.openWordFind(PICKS)
    overlay.setBusy(true)
    overlay.setBusy(false)

    q('.overlay-back').click()

    expect(isOpen()).toBe(false)
    expect(host.onDismissed).toHaveBeenCalled()
  })

  it('never leaves the lock on across rounds', () => {
    /*
     * The dangerous failure: a ceremony that threw part-way through would
     * leave busy set, and every exit dead for the rest of the session. So
     * teardown clears it unconditionally rather than trusting the caller.
     */
    const { overlay, host, q, isOpen } = setup()
    overlay.openSum(SUM)
    overlay.setBusy(true)
    overlay.openSum(SUM)          // next round, without anyone clearing it

    q('.overlay-back').click()

    expect(isOpen()).toBe(false)
    expect(host.onDismissed).toHaveBeenCalled()
  })
})
