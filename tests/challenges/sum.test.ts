/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountSum } from '../../src/challenges/sum'
import type { ChallengeDeps } from '../../src/challenges/mount'
import type { SumItem } from '../../src/core/generators/sums'

const ADD: SumItem = { a: 7, b: 5, op: 'add' }   // answer 12

function makeDeps(el: HTMLElement) {
  let lock = 0
  let reward = 0
  const d: ChallengeDeps = {
    el,
    speech: {
      speak: vi.fn(() => true), ready: () => true, cancel: vi.fn(),
      noticeShown: () => false, markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    holds: {
      rewardUntil: () => reward,
      quietUntil: () => 0,
      inputLock: () => lock,
      lockInput: (until: number) => { lock = until },
    },
    isActive: () => true,
    flyToScore: vi.fn(),
    onWrong: vi.fn(),
    onAdvance: vi.fn(),
    showTarget: vi.fn(),
    hideTarget: vi.fn(),
    toast: vi.fn(),
    burst: vi.fn(),
    celebrate: vi.fn(),
    onHelp: vi.fn(),
  }
  return { d, setReward: (t: number) => { reward = t } }
}

const tap = (el: HTMLElement): void => {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}
const chip = (el: HTMLElement, n: number): HTMLElement =>
  [...el.querySelectorAll<HTMLElement>('.nchip')].find(c => c.textContent === String(n))!
/** A chip on the 0-9 digit row (the big-answer pad), not the 0-20 track. */
const dig = (el: HTMLElement, n: number): HTMLElement =>
  [...el.querySelectorAll<HTMLElement>('.drow .nchip')].find(c => c.textContent === String(n))!
/** The answer pill is the last `.word` in the row: a, b, ANS. */
const ans = (el: HTMLElement): string =>
  [...el.querySelectorAll<HTMLElement>('.word')].pop()!.textContent!

let el: HTMLElement
beforeEach(() => {
  vi.useFakeTimers()
  ;(HTMLElement.prototype as unknown as Record<string, unknown>).animate =
    vi.fn(() => ({ onfinish: null, cancel: vi.fn() }))
  el = document.createElement('div')
  document.body.append(el)
})
afterEach(() => { vi.useRealTimers(); el.remove() })

describe('mountSum', () => {
  it('renders the sum with a mystery answer', () => {
    // v0:1032-1033
    mountSum(ADD, makeDeps(el).d)
    expect(el.querySelector('.mystery')?.textContent).toBe('?')
    expect(el.textContent).toContain('7')
    expect(el.textContent).toContain('5')
  })

  it('uses a proper minus sign for subtraction', () => {
    // v0:1033 — '−' (U+2212), not a hyphen
    mountSum({ a: 9, b: 4, op: 'sub' }, makeDeps(el).d)
    expect(el.querySelector('.op')?.textContent).toBe('−')
  })

  it('builds the number track: 0 apart, then 1-20', () => {
    // v0:1150-1156
    mountSum(ADD, makeDeps(el).d)
    expect(el.querySelectorAll('.zrow .nchip')).toHaveLength(1)
    expect(el.querySelectorAll('.tgrid .nchip')).toHaveLength(20)
  })

  it('colour-blocks the chips in fives to match the counting dots', () => {
    // v0:1103-1104 — 1-5 five-a, 6-10 five-b, 11-15 five-a, 16-20 five-b
    mountSum(ADD, makeDeps(el).d)
    expect(chip(el, 1).className).toContain('five-a')
    expect(chip(el, 5).className).toContain('five-a')
    expect(chip(el, 6).className).toContain('five-b')
    expect(chip(el, 11).className).toContain('five-a')
    expect(chip(el, 0).className).toContain('zero')
  })

  it('a correct chip reveals the answer and banks the point', () => {
    // v0:1110-1115
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(chip(el, 12))
    expect(el.querySelector('.mystery')).toBeNull()
    expect(d.flyToScore).toHaveBeenCalled()
    expect(d.sfx.play).toHaveBeenCalledWith('win')
    expect(d.burst).toHaveBeenCalled()
  })

  it('a wrong chip wobbles and costs nothing', () => {
    // v0:1133-1137
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(chip(el, 11))
    expect(d.sfx.play).toHaveBeenCalledWith('bump')
    expect(d.onWrong).toHaveBeenCalled()
    expect(d.flyToScore).not.toHaveBeenCalled()
    expect(el.querySelector('.mystery')).not.toBeNull()
  })

  it('three wrong chips open the counting dots and lock the pad', () => {
    // v0:1138-1145 — the mash rescue shows dots rather than scolding
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    expect(el.querySelectorAll('.dotbox')).toHaveLength(0)
    tap(chip(el, 11)); tap(chip(el, 13)); tap(chip(el, 14))
    expect(el.querySelectorAll('.dotbox')).toHaveLength(2)
    expect(d.toast).toHaveBeenCalledWith(expect.stringContaining('Count the dots'))
    expect(d.sfx.play).toHaveBeenCalledWith('down')
    expect(d.holds.inputLock()).toBeGreaterThan(Date.now())
  })

  it('the dot hints show the right number of dots, blocked in fives', () => {
    // v0:1056-1058
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(chip(el, 11)); tap(chip(el, 13)); tap(chip(el, 14))
    const boxes = [...el.querySelectorAll('.dotbox')]
    expect(boxes[0]!.querySelectorAll('.dot')).toHaveLength(7)   // p.a
    expect(boxes[1]!.querySelectorAll('.dot')).toHaveLength(5)   // p.b
    expect(boxes[0]!.querySelectorAll('.dot.o')).toHaveLength(5) // first five
    expect(boxes[0]!.querySelectorAll('.dot.b')).toHaveLength(2)
  })

  it('peeking at the answer is free but earns nothing', () => {
    // v0:1086-1093 — the grey ? reveals, but no star flies
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(el.querySelector<HTMLElement>('.mystery')!)
    expect(el.textContent).toContain('12')
    expect(d.flyToScore).not.toHaveBeenCalled()
  })

  it('auto-advances two seconds after a correct answer', () => {
    // v0:1132
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(chip(el, 12))
    vi.advanceTimersByTime(1999)
    expect(d.onAdvance).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('lets a host shorten the wait without touching the default', () => {
    /*
     * The 2000ms above exists so v0's star can reach the score bar before the
     * board changes. The island has neither, so it injects a shorter wait —
     * and the point of injecting rather than editing is that the test above
     * still passes untouched for every host that does not.
     */
    const { d } = makeDeps(el)
    mountSum(ADD, { ...d, advanceDelay: 300 })
    tap(chip(el, 12))
    vi.advanceTimersByTime(299)
    expect(d.onAdvance).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('waits out a reward show before advancing', () => {
    // v0:1120-1122 — never cut through a spectacle
    const { d, setReward } = makeDeps(el)
    mountSum(ADD, d)
    setReward(Date.now() + 8000)
    tap(chip(el, 12))
    vi.advanceTimersByTime(3000)
    expect(d.onAdvance).not.toHaveBeenCalled()
    setReward(0)
    vi.advanceTimersByTime(9000)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('advances with no battery gate — the battery is retired', () => {
    // brief section 4: habitat coupling replaces it. v0:1127 gated this call.
    const { d } = makeDeps(el)
    mountSum(ADD, d)
    tap(chip(el, 12))
    vi.advanceTimersByTime(2100)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('teardown cancels the pending advance', () => {
    const { d } = makeDeps(el)
    const h = mountSum(ADD, d)
    tap(chip(el, 12))
    h.teardown()
    vi.advanceTimersByTime(10_000)
    expect(d.onAdvance).not.toHaveBeenCalled()
    expect(el.children).toHaveLength(0)
  })

  it('leaves the 0-20 track alone when the answer fits on it', () => {
    /* The boundary itself: 20 is the last answer the track can carry. */
    mountSum({ a: 12, b: 8, op: 'add' }, makeDeps(el).d)
    expect(el.querySelectorAll('.drow')).toHaveLength(0)
    expect(el.querySelectorAll('.tgrid .nchip')).toHaveLength(20)
    expect(ans(el)).toBe('?')
  })
})

/**
 * THE BIG-ANSWER PAD. Addition rungs 5-7 (whole tens to a hundred, two-digit
 * plus units either side of a carry) all answer above twenty, and the 0-20
 * track simply does not contain the answer — the child could not respond at
 * all. Past twenty the pad becomes ten digit keys and the answer is spelled
 * out, most significant digit first.
 *
 * The switch is on the ANSWER, never on a level: mountSum is handed a, b and
 * op and nothing else, and it must stay that way.
 */
describe('mountSum: answers past twenty', () => {
  const TENS: SumItem = { a: 20, b: 30, op: 'add' }   // answer 50

  it('swaps the track for a 0-9 digit row', () => {
    mountSum(TENS, makeDeps(el).d)
    expect(el.querySelectorAll('.tgrid')).toHaveLength(0)
    expect(el.querySelectorAll('.zrow')).toHaveLength(0)
    const row = el.querySelectorAll<HTMLElement>('.drow .nchip')
    expect(row).toHaveLength(10)
    expect([...row].map(c => c.textContent).join('')).toBe('0123456789')
  })

  it('hides the answer behind one ? per digit', () => {
    mountSum(TENS, makeDeps(el).d)
    expect(ans(el)).toBe('??')
  })

  it('keeps the digit chips out of the tap-through dead zone', () => {
    // deadzone.ts excludes '#words .nchip'; a chip without it turns the page.
    mountSum(TENS, makeDeps(el).d)
    for (const c of el.querySelectorAll('.drow > *')) {
      expect(c.classList.contains('nchip')).toBe(true)
    }
  })

  it('the first correct digit reveals only itself and banks nothing', () => {
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 5))
    expect(ans(el)).toBe('5?')
    expect(d.flyToScore).not.toHaveBeenCalled()
    expect(d.sfx.play).not.toHaveBeenCalledWith('win')
    expect(d.burst).not.toHaveBeenCalled()
    vi.advanceTimersByTime(10_000)
    expect(d.onAdvance).not.toHaveBeenCalled()
    expect(el.querySelector('.mystery')).not.toBeNull()
  })

  it('gives an intermediate digit its own light feedback', () => {
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 5))
    expect(d.sfx.play).toHaveBeenCalledWith('up')
    expect(dig(el, 5).className).toContain('hit')
  })

  it('the last correct digit completes, banks and advances', () => {
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 5))
    tap(dig(el, 0))
    expect(ans(el)).toBe('50')
    expect(el.querySelector('.mystery')).toBeNull()
    expect(d.flyToScore).toHaveBeenCalledTimes(1)
    expect(d.sfx.play).toHaveBeenCalledWith('win')
    expect(d.burst).toHaveBeenCalled()
    vi.advanceTimersByTime(2001)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('keeps progress: the first digit is not pressed twice', () => {
    const { d } = makeDeps(el)
    mountSum({ a: 40, b: 40, op: 'add' }, d)   // 80 — two different digits
    tap(dig(el, 8))
    expect(ans(el)).toBe('8?')
    tap(dig(el, 0))
    expect(ans(el)).toBe('80')
    expect(d.flyToScore).toHaveBeenCalledTimes(1)
  })

  it('a wrong digit wobbles, costs nothing and reveals nothing', () => {
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 3))
    expect(ans(el)).toBe('??')
    expect(d.sfx.play).toHaveBeenCalledWith('bump')
    expect(d.onWrong).toHaveBeenCalledTimes(1)
    expect(d.flyToScore).not.toHaveBeenCalled()
  })

  it('a wrong SECOND digit does not undo the first', () => {
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 5))
    tap(dig(el, 7))
    expect(ans(el)).toBe('5?')
    expect(d.onWrong).toHaveBeenCalledTimes(1)
    tap(dig(el, 0))
    expect(ans(el)).toBe('50')
  })

  it('renders a hundred as three slots and takes three digits', () => {
    /*
     * Rung 5 draws a = 10..80 and b up to 100 - a, so 10 + 90 lands on a
     * THREE-digit answer. The slot count comes off String(answer).length
     * rather than a hardcoded two.
     */
    const { d } = makeDeps(el)
    mountSum({ a: 10, b: 90, op: 'add' }, d)
    expect(ans(el)).toBe('???')
    tap(dig(el, 1))
    expect(ans(el)).toBe('1??')
    tap(dig(el, 0))
    expect(ans(el)).toBe('10?')
    expect(d.flyToScore).not.toHaveBeenCalled()
    tap(dig(el, 0))
    expect(ans(el)).toBe('100')
    expect(d.flyToScore).toHaveBeenCalledTimes(1)
  })

  it('a peek still reveals the WHOLE answer and earns nothing', () => {
    // JT-008(1): a peeked sum is no attempt at all, however far in they are.
    const { d } = makeDeps(el)
    mountSum(TENS, d)
    tap(dig(el, 5))
    tap(el.querySelector<HTMLElement>('.mystery')!)
    expect(ans(el)).toBe('50')
    expect(d.flyToScore).not.toHaveBeenCalled()
    expect(d.onHelp).toHaveBeenCalledWith('peek')
  })

  it('the mash rescue locks and toasts but does not wall them in with dots', () => {
    /*
     * The rescue opens one dot per unit of a and b. At 30 + 40 that is seventy
     * dots, which is not a hint, it is a wall — so a dot-box bigger than twenty
     * stays shut while the lock, the sound and the toast all still happen.
     */
    const { d } = makeDeps(el)
    mountSum({ a: 30, b: 40, op: 'add' }, d)   // answer 70
    tap(dig(el, 1)); tap(dig(el, 2)); tap(dig(el, 3))
    expect(el.querySelectorAll('.dotbox')).toHaveLength(0)
    expect(d.sfx.play).toHaveBeenCalledWith('down')
    expect(d.toast).toHaveBeenCalled()
    expect(d.holds.inputLock()).toBeGreaterThan(Date.now())
  })

  it('still opens the small side of a lopsided sum', () => {
    // 34 + 5: thirty-four dots is a wall, five is a hint. Show the five.
    const { d } = makeDeps(el)
    mountSum({ a: 34, b: 5, op: 'add' }, d)
    tap(dig(el, 1)); tap(dig(el, 2)); tap(dig(el, 8))
    const boxes = [...el.querySelectorAll('.dotbox')]
    expect(boxes).toHaveLength(1)
    expect(boxes[0]!.querySelectorAll('.dot')).toHaveLength(5)
    expect(d.toast).toHaveBeenCalledWith(expect.stringContaining('Count the dots'))
  })

  it('teardown cancels the advance from a completed big answer', () => {
    const { d } = makeDeps(el)
    const h = mountSum(TENS, d)
    tap(dig(el, 5)); tap(dig(el, 0))
    h.teardown()
    vi.advanceTimersByTime(10_000)
    expect(d.onAdvance).not.toHaveBeenCalled()
  })
})
