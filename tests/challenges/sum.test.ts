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
  }
  return { d, setReward: (t: number) => { reward = t } }
}

const tap = (el: HTMLElement): void => {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}
const chip = (el: HTMLElement, n: number): HTMLElement =>
  [...el.querySelectorAll<HTMLElement>('.nchip')].find(c => c.textContent === String(n))!

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
    const stop = mountSum(ADD, d)
    tap(chip(el, 12))
    stop()
    vi.advanceTimersByTime(10_000)
    expect(d.onAdvance).not.toHaveBeenCalled()
    expect(el.children).toHaveLength(0)
  })
})
