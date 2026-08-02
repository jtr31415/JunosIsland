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
    onAttempt: vi.fn(),
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

/** A tap that lands on the dimmed area beside the panel. */
function backdropTap(layer: HTMLElement): void {
  layer.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  layer.dispatchEvent(new Event('pointerup', { bubbles: true }))
  layer.dispatchEvent(new Event('click', { bubbles: true }))
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

describe('the way out', () => {
  /*
   * Joe: "there should be an x button to get back to the island when through a
   * challenge, too many accidental hits."
   */
  it('is an X, and it is the only button in the control row that is not "say it again"', () => {
    const { root, overlay, q } = setup()
    overlay.openWordFind(PICKS)

    const x = q('.overlay-x')
    expect(x.textContent).toBe('×')
    // Readable by something even if not by the child: a glyph, not a word.
    expect(x.getAttribute('aria-label')).toBe('back to the island')

    // It is NOT in the row beside "say it again" — that adjacency is the
    // mis-tap Joe reported. It belongs to the layer, in the corner.
    const controls = root.querySelector('.overlay-controls') as HTMLElement
    expect(controls.contains(x)).toBe(false)
    expect([...controls.children].map(c => c.className))
      .toEqual([expect.stringContaining('overlay-again')])
  })

  it('goes away with the round, so it can never be tapped over the island', () => {
    const { overlay, q } = setup()
    overlay.openSum(SUM)
    overlay.close()
    // `.hide` is display:none on the layer, and the X is a child of it.
    expect((q('.overlay') as HTMLElement).classList.contains('hide')).toBe(true)
    expect(q('.overlay').contains(q('.overlay-x'))).toBe(true)
  })
})

describe('the back button', () => {
  it('collects earned work but asks for no further page', () => {
    const { root, overlay, host, q, isOpen } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)

    q('.overlay-x').click()

    // Never discard work the child has actually done (brief §19) — so this is
    // onPassed, not onDismissed. `false` is "collect it, but let me out".
    expect(host.onPassed).toHaveBeenCalledWith(false)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })

  it('dismisses for free when nothing has been earned', () => {
    const { overlay, host, q, isOpen } = setup()
    overlay.openSum(SUM)

    q('.overlay-x').click()

    expect(host.onDismissed).toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
    expect(isOpen()).toBe(false)
  })

  it('does nothing at all when the overlay is already shut', () => {
    const { host, q } = setup()
    q('.overlay-x').click()
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

/**
 * The backdrop, which USED to dismiss and deliberately no longer does.
 *
 * `.stage-slot` is `pointer-events: none` so the renderer can scissor into it,
 * which means the vignette — nearly half a staged round, and the half with
 * their own egg turning on it — counted as backdrop. Reaching out to touch it
 * ended the page. That is Joe's "too many accidental hits", and the fix is not
 * a smarter backdrop: it is one deliberate X and a backdrop that only swallows.
 */
describe('the backdrop', () => {
  it('does NOT leave the round — that is the X button’s job alone', () => {
    const { overlay, host, layer, isOpen } = setup()
    overlay.openSum(SUM)
    backdropTap(layer)
    expect(isOpen()).toBe(true)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
  })

  it('does not collect either — an accidental tap changes nothing at all', () => {
    // It used to take the same path as the button, so an answered sum plus a
    // stray tap banked the reward and left. Correct while the backdrop was a
    // way out; now it would be a reward for a mis-tap that ends their sitting.
    const { root, overlay, host, layer, isOpen } = setup()
    overlay.openSum(SUM)
    solve(root, SUM_ANSWER)
    backdropTap(layer)
    expect(host.onPassed).not.toHaveBeenCalledWith(false)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(isOpen()).toBe(true)
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
    // not a request to leave, and treating it as one would throw them out of a
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
  it('ignores the X button', () => {
    const { overlay, host, q, isOpen } = setup()
    overlay.openWordFind(PICKS)
    overlay.setBusy(true)

    q('.overlay-x').click()

    expect(isOpen()).toBe(true)
    expect(host.onDismissed).not.toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()
  })

  it('gives the exits back the moment it is over', () => {
    // A lock that outlived its ceremony would be a trap of its own.
    const { overlay, host, q, isOpen } = setup()
    overlay.openWordFind(PICKS)
    overlay.setBusy(true)
    overlay.setBusy(false)

    q('.overlay-x').click()

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

    q('.overlay-x').click()

    expect(isOpen()).toBe(false)
    expect(host.onDismissed).toHaveBeenCalled()
  })
})

/**
 * A1 fault 1 — one found word banked the whole page (PB-007, BACKLOG #44).
 *
 * `flyToScore` fires per WORD on a find page but once per answer on the other
 * two, and the overlay was treating all three the same: the first correct word
 * of five armed "collect on the way out", so a child who found one word and
 * tapped the X was paid for the page. v0's own semantics are that a find page
 * completes when ALL its targets are found.
 */
describe('a find page banks on completion, not on the first word', () => {
  /** The round asks for its first word at 900 + 60/word (wordFind.ts:116). */
  const FIRST_PROMPT_MS = 1100

  /** The word the round is currently asking for, per the spoken prompt. */
  function target(root: HTMLElement, host: ReturnType<typeof setup>['host']): HTMLElement {
    // The stub is declared argument-less, so its recorded calls type as `[]`.
    const calls = host.speech.speak.mock.calls as unknown as string[][]
    const asked = calls[calls.length - 1]?.[0] ?? ''
    const words = [...root.querySelectorAll('#words .word')] as HTMLElement[]
    return words.find(w => w.textContent === asked && !w.classList.contains('found'))!
  }

  const tap = (el: HTMLElement): void =>
    void el.dispatchEvent(new Event('pointerdown', { bubbles: true }))

  it('does NOT collect when only some of the words have been found', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)          // two targets
    vi.advanceTimersByTime(FIRST_PROMPT_MS)

    tap(target(root, host))              // one of two

    root.querySelector<HTMLElement>('.overlay-x')!.click()

    // Leaving now is an abandonment, not a completed page.
    expect(host.onPassed).not.toHaveBeenCalled()
    expect(host.onDismissed).toHaveBeenCalled()
  })

  it('collects once the last word lands', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(FIRST_PROMPT_MS)

    tap(target(root, host))
    vi.advanceTimersByTime(800)          // the next word is asked for
    tap(target(root, host))

    vi.runAllTimers()                    // the celebrate hold, then finish
    expect(host.onPassed).toHaveBeenCalledWith(true)
  })

  it('still banks a sum the moment it is answered, before the advance', () => {
    /*
     * The trap in the obvious fix. Build and sum fly the star and call
     * onAdvance a beat later, and `earned` is exactly what protects that gap —
     * they have answered, and tapping the X must not throw the work away (§18).
     * Moving these to completion too would trade one bug for a worse one.
     */
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)

    solve(root, SUM_ANSWER)              // correct, but the advance has not run
    root.querySelector<HTMLElement>('.overlay-x')!.click()

    expect(host.onPassed).toHaveBeenCalledWith(false)   // collect it, and let me out
    expect(host.onDismissed).not.toHaveBeenCalled()
  })
})

/**
 * A1 fault 2 — the dead voice channel.
 *
 * The fallback logic was always right: no voice, so show the word and say so.
 * What killed it was CSS. `body:has(.overlay:not(.hide)) .say { display: none }`
 * hides Fred's speech line while a round is open, and both floaters were built
 * as `.say` — but a challenge IS an overlay, and these two are used ONLY inside
 * one. They were invisible for exactly as long as they were wanted. Third time
 * that selector has eaten an element; `.offer-ask` is the precedent.
 */
describe('with no voice on the device', () => {
  it('shows the word to find, and says why', () => {
    const { root, overlay, host } = setup()
    host.speech.speak.mockReturnValue(false)

    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(1100)   // the round asks for its first word

    const shown = [...root.children].filter(
      el => !el.classList.contains('overlay') && !el.classList.contains('hide'),
    ) as HTMLElement[]
    const text = shown.map(el => el.textContent).join(' | ')

    expect(text).toContain('Find:')
    expect(text).toContain('showing the word instead')
  })

  it('keeps both floaters out of the hide-while-an-overlay-is-open rule', () => {
    /*
     * The assertion the browser would make, made where jsdom can: these two
     * carry no class the rule selects on. If someone gives them `.say` back
     * for its layout, this fails instead of the fallback silently dying again.
     */
    const { root, overlay, host } = setup()
    host.speech.speak.mockReturnValue(false)
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(1100)

    const floaters = [...root.querySelectorAll('.floater')] as HTMLElement[]
    expect(floaters).toHaveLength(2)
    for (const el of floaters) expect(el.classList.contains('say')).toBe(false)
  })
})

/**
 * A2 — the attempt model, through the real renderers.
 *
 * `attempts.test.ts` owns the rules; this owns the WIRING, which is the half
 * that has no other witness. Every assertion below would still pass against a
 * broken tally and vice versa, and that is the point of keeping them apart: a
 * hook attached to the wrong event is invisible to a unit test of either side.
 */
describe('the attempt model is wired to what actually happens', () => {
  /**
   * Exactly when the round asks for its first word (wordFind.ts:116), because
   * the latency assertions below are measured FROM it — the block above can
   * round up to "some time after", this one cannot.
   */
  const FIRST_PROMPT_MS = 900 + PICKS.length * 60

  const tap = (el: HTMLElement): void =>
    void el.dispatchEvent(new Event('pointerdown', { bubbles: true }))

  /** The word the round is currently asking for, per the spoken prompt. */
  function target(root: HTMLElement, host: ReturnType<typeof setup>['host']): HTMLElement {
    const calls = host.speech.speak.mock.calls as unknown as string[][]
    const asked = calls[calls.length - 1]?.[0] ?? ''
    const words = [...root.querySelectorAll('#words .word')] as HTMLElement[]
    return words.find(w => w.textContent === asked && !w.classList.contains('found'))!
  }

  /** A wrong chip on the number pad. */
  function missSum(root: HTMLElement): void {
    const chips = [...root.querySelectorAll('.nchip')] as HTMLElement[]
    tap(chips.find(c => c.textContent !== String(SUM_ANSWER))!)
  }

  const attempts = (host: ReturnType<typeof setup>['host']) =>
    host.onAttempt.mock.calls.map(c => c[0])

  it('reports one attempt for an answered sum', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    vi.advanceTimersByTime(3000)
    solve(root, SUM_ANSWER)

    expect(attempts(host)).toHaveLength(1)
    expect(attempts(host)[0]).toMatchObject({
      kind: 'sum', index: 0, correct: true, helped: false, rescued: false,
    })
    // The sum is on screen at the mount, so the clock has been running since.
    expect(attempts(host)[0]?.latencyMs).toBe(3000)
  })

  it('marks a sum incorrect when a wrong chip landed first', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    missSum(root)
    solve(root, SUM_ANSWER)
    expect(attempts(host)[0]).toMatchObject({ correct: false })
  })

  it('reports one attempt per WORD on a find page, not one per page', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)              // two targets
    vi.advanceTimersByTime(FIRST_PROMPT_MS)
    tap(target(root, host))
    vi.advanceTimersByTime(800)              // the next word is asked for
    tap(target(root, host))

    // One page, one payment (A1) — and two questions answered.
    expect(attempts(host)).toHaveLength(2)
    expect(attempts(host).map(a => a.index)).toEqual([0, 1])
    expect(attempts(host).every(a => a.kind === 'find' && a.correct)).toBe(true)
  })

  it('times each find target from its own prompt, not from the mount', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(FIRST_PROMPT_MS)  // the timer, not thinking time
    vi.advanceTimersByTime(400)
    tap(target(root, host))
    vi.advanceTimersByTime(800)              // wordFind.ts:68 asks for word two
    vi.advanceTimersByTime(2500)
    tap(target(root, host))

    expect(attempts(host).map(a => a.latencyMs)).toEqual([400, 2500])
  })

  it('does not restart the clock when the child asks to hear it again', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(FIRST_PROMPT_MS)
    vi.advanceTimersByTime(1000)
    root.querySelector<HTMLElement>('.overlay-again')!.click()
    vi.advanceTimersByTime(1000)
    tap(target(root, host))

    // Reading it again is the task, not a hint — and it is certainly not a
    // reason to record the child as having answered in one second.
    expect(attempts(host)[0]?.latencyMs).toBe(2000)
    expect(attempts(host)[0]?.helped).toBe(false)
  })

  it('JT-008(1): a peeked sum is not reported at all', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    tap(root.querySelector<HTMLElement>('.mystery')!)

    expect(root.querySelector('#words')?.textContent).toContain(String(SUM_ANSWER))
    expect(host.onAttempt).not.toHaveBeenCalled()
  })

  it('JT-008(1): and leaving a peeked sum still reports nothing', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    tap(root.querySelector<HTMLElement>('.mystery')!)
    root.querySelector<HTMLElement>('.overlay-x')!.click()

    expect(host.onAttempt).not.toHaveBeenCalled()
    expect(host.onPassed).not.toHaveBeenCalled()   // peeking earns nothing either
  })

  it('JT-008(2): opening the counting dots does not exclude the answer', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    tap(root.querySelector<HTMLElement>('.helper')!)
    vi.advanceTimersByTime(8000)
    solve(root, SUM_ANSWER)

    expect(attempts(host)).toHaveLength(1)
    expect(attempts(host)[0]).toMatchObject({ correct: true, helped: true, latencyMs: 8000 })
  })

  it('JT-008(3): leaving mid-page keeps the words they found and drops the rest', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(FIRST_PROMPT_MS)
    tap(target(root, host))                  // one of two
    vi.advanceTimersByTime(800)
    root.querySelector<HTMLElement>('.overlay-x')!.click()

    expect(attempts(host)).toHaveLength(1)
    expect(attempts(host)[0]).toMatchObject({ index: 0, correct: true })
  })

  it('JT-008(3): and a page they never answered reports nothing', () => {
    const { root, overlay, host } = setup()
    overlay.openWordFind(PICKS)
    vi.advanceTimersByTime(FIRST_PROMPT_MS)
    root.querySelector<HTMLElement>('.overlay-x')!.click()
    expect(host.onAttempt).not.toHaveBeenCalled()
  })

  it('flags the attempt the mash rescue landed on', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    missSum(root); missSum(root); missSum(root)     // MASH_WRONGS — the dots open
    vi.advanceTimersByTime(2000)                    // ride out the input lock
    solve(root, SUM_ANSWER)

    expect(attempts(host)[0]).toMatchObject({ rescued: true, correct: false })
    // The rescue opens the dots itself, so it reads as helped as well as rescued.
    expect(attempts(host)[0]?.helped).toBe(true)
  })

  it('carries nothing from one page into the next', () => {
    const { root, overlay, host } = setup()
    overlay.openSum(SUM)
    missSum(root)
    overlay.openSum(SUM)                     // remounted without ever answering
    solve(root, SUM_ANSWER)

    expect(attempts(host)).toHaveLength(1)
    expect(attempts(host)[0]).toMatchObject({ index: 0, correct: true, rescued: false })
  })

  it('an unheard host is not a broken one', () => {
    // A3 owns recordAttempt and has not landed; until it does, nothing listens.
    const root = document.createElement('div')
    document.body.append(root)
    const overlay = createOverlay(root, {
      speech: {
        speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
        noticeShown: () => false, markNoticeShown: vi.fn(),
      },
      sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
      onPassed: vi.fn(),
      onDismissed: vi.fn(),
    })
    overlay.openSum(SUM)
    expect(() => solve(root, SUM_ANSWER)).not.toThrow()
  })
})
