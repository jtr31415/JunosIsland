/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountBuild, FRED_SOUNDS } from '../../src/challenges/build'
import type { ChallengeDeps } from '../../src/challenges/mount'
import type { BuildItem } from '../../src/core/generators/build'

// "ship" -> sh|i|p, plus three decoys
const ITEM: BuildItem = { w: 'ship', segs: ['sh', 'i', 'p'], tray: ['i', 'sh', 'm', 'p', 'ee', 'd'] }

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
const tile = (el: HTMLElement, txt: string): HTMLElement =>
  [...el.querySelectorAll<HTMLElement>('.tile')].find(t => t.textContent === txt)!

let el: HTMLElement
beforeEach(() => {
  vi.useFakeTimers()
  ;(HTMLElement.prototype as unknown as Record<string, unknown>).animate =
    vi.fn(() => ({ onfinish: null, cancel: vi.fn() }))
  el = document.createElement('div')
  document.body.append(el)
})
afterEach(() => { vi.useRealTimers(); el.remove() })

describe('mountBuild', () => {
  it('renders one slot per grapheme and one tile per tray entry', () => {
    // v0:1246-1251, v0:1256
    mountBuild(ITEM, makeDeps(el).d)
    expect(el.querySelectorAll('.slot')).toHaveLength(3)
    expect(el.querySelectorAll('.tile')).toHaveLength(6)
  })

  it('marks multi-letter tiles so the CSS can size them', () => {
    // v0:1258 — tk.length > 1 gets di2
    mountBuild(ITEM, makeDeps(el).d)
    expect(tile(el, 'sh').className).toContain('di2')
    expect(tile(el, 'i').className).not.toContain('di2')
  })

  it('fills the next slot on a correct tile', () => {
    // v0:1264-1271
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'sh'))
    const slots = el.querySelectorAll<HTMLElement>('.slot')
    expect(slots[0]!.textContent).toBe('sh')
    expect(slots[0]!.classList.contains('filled')).toBe(true)
    expect(slots[0]!.classList.contains('di2')).toBe(true)
    expect(tile(el, 'sh').classList.contains('used')).toBe(true)
    expect(d.sfx.play).toHaveBeenCalledWith('up')
  })

  it('rejects a tile that is not the next grapheme', () => {
    // v0:1290-1294 — order matters; this is spelling, not matching
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'p'))
    expect(el.querySelectorAll('.slot.filled')).toHaveLength(0)
    expect(d.sfx.play).toHaveBeenCalledWith('bump')
    expect(d.onWrong).toHaveBeenCalled()
  })

  it('ignores a tile already used', () => {
    // v0:1263
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'sh'))
    const before = (d.sfx.play as ReturnType<typeof vi.fn>).mock.calls.length
    tap(tile(el, 'sh'))
    expect((d.sfx.play as ReturnType<typeof vi.fn>).mock.calls.length).toBe(before)
  })

  it('completing the word speaks it, bursts and banks the point', () => {
    // v0:1272-1278
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'sh')); tap(tile(el, 'i')); tap(tile(el, 'p'))
    expect(d.speech.speak).toHaveBeenCalledWith('ship')
    expect(d.burst).toHaveBeenCalled()
    expect(d.flyToScore).toHaveBeenCalled()
    expect(d.sfx.play).toHaveBeenCalledWith('win')
  })

  it('auto-advances 1600ms after completion', () => {
    // v0:1288 — shorter than the sum's 2000ms
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'sh')); tap(tile(el, 'i')); tap(tile(el, 'p'))
    vi.advanceTimersByTime(1599)
    expect(d.onAdvance).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('waits out a reward show before advancing', () => {
    // v0:1281-1283
    const { d, setReward } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'sh')); tap(tile(el, 'i')); tap(tile(el, 'p'))
    setReward(Date.now() + 8000)
    vi.advanceTimersByTime(3000)
    expect(d.onAdvance).not.toHaveBeenCalled()
    setReward(0)
    vi.advanceTimersByTime(9000)
    expect(d.onAdvance).toHaveBeenCalledTimes(1)
  })

  it('three wrong tiles summon help: the word again, slowly', () => {
    /*
     * v0:1295-1300 locked input and had Fred sound out each grapheme. The
     * grapheme audio is retired — through a synthesiser "buh"/"tuh" is
     * genuinely unpleasant — so the rescue is now the whole word at 0.6 rate
     * with the next slot highlighted. Still help, never shame (brief §19),
     * and the input lock is unchanged.
     */
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'p')); tap(tile(el, 'm')); tap(tile(el, 'd'))
    expect(d.holds.inputLock()).toBeGreaterThan(Date.now())
    expect(d.speech.speak).toHaveBeenCalledWith('ship', 0.6)
    expect(el.querySelectorAll('.fredhl')).toHaveLength(1)
  })

  it('the rescue never speaks a lone grapheme', () => {
    const { d } = makeDeps(el)
    mountBuild(ITEM, d)
    tap(tile(el, 'p')); tap(tile(el, 'm')); tap(tile(el, 'd'))
    vi.advanceTimersByTime(1200)
    const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls.map(c => c[0])
    for (const s of spoken) expect(['shh', 'ih', 'puh']).not.toContain(s)
  })

  it('fredTalk still sequences correctly if a caller ever wants it', () => {
    /*
     * Nothing triggers this automatically any more, but the sequencing is
     * sound and a real recorded voice would make it excellent — so it stays
     * exported and stays tested rather than rotting quietly.
     * v0:1222-1232 — each sound plays to completion; no beheading.
     */
    const { d } = makeDeps(el)
    const spoken: string[] = []
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockImplementation(
      (txt: string, _rate?: number, onend?: () => void) => {
        spoken.push(txt)
        if (onend) setTimeout(onend, 10)
        return true
      })
    const h = mountBuild(ITEM, d)
    h.fred!()
    vi.advanceTimersByTime(3000)
    expect(spoken).toContain('shh')
    expect(spoken).toContain('ih')
    expect(spoken).toContain('puh')
    expect(spoken.at(-1)).toBe('ship')
  })

  it('shows the word when no voice is available', () => {
    // v0:1190-1196 — copying it tile by tile is early spelling, still a win
    const { d } = makeDeps(el)
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockReturnValue(false)
    mountBuild(ITEM, d)
    vi.advanceTimersByTime(950)
    expect(d.showTarget).toHaveBeenCalledWith(expect.stringContaining('ship'))
  })

  it('teardown cancels an in-flight Fred sequence', () => {
    // v0:845 — clearRound bumps fredToken so a pending sequence stops
    const { d } = makeDeps(el)
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockImplementation(
      (_t: string, _r?: number, onend?: () => void) => { if (onend) setTimeout(onend, 10); return true })
    const h = mountBuild(ITEM, d)
    tap(tile(el, 'p')); tap(tile(el, 'm')); tap(tile(el, 'd'))
    vi.advanceTimersByTime(400)
    const before = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls.length
    h.teardown()
    vi.advanceTimersByTime(5000)
    expect((d.speech.speak as ReturnType<typeof vi.fn>).mock.calls.length).toBe(before)
  })
})

describe('FRED_SOUNDS', () => {
  it('gives continuants their sound and stops an unavoidable schwa', () => {
    // v0:1204-1211
    expect(FRED_SOUNDS['s']).toBe('sss')
    expect(FRED_SOUNDS['m']).toBe('mmm')
    expect(FRED_SOUNDS['b']).toBe('buh')
    expect(FRED_SOUNDS['sh']).toBe('shh')
    expect(FRED_SOUNDS['ng']).toBe('ing')
  })
})

describe('help buttons (v0:2086-2087)', () => {
  it('sayAgain repeats the word without clearing placed tiles', () => {
    const { d } = makeDeps(el)
    const h = mountBuild(ITEM, d)
    tap(tile(el, 'sh'))
    expect(el.querySelectorAll('.slot.filled')).toHaveLength(1)
    h.sayAgain()
    expect(el.querySelectorAll('.slot.filled')).toHaveLength(1)
    expect(d.speech.speak).toHaveBeenCalledWith('ship')
  })

  it('fred sounds it out without clearing placed tiles', () => {
    // The regression this guards: btnFred used to re-mount, which both wiped
    // the child's tiles AND meant Fred never actually spoke.
    const { d } = makeDeps(el)
    const h = mountBuild(ITEM, d)
    tap(tile(el, 'sh'))
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockClear()
    h.fred!()
    vi.advanceTimersByTime(400)
    expect(el.querySelectorAll('.slot.filled')).toHaveLength(1)
    expect(d.speech.speak).toHaveBeenCalledWith('shh', 0.9, expect.any(Function))
  })
})
