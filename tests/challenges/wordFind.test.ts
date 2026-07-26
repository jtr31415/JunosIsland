/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountWordFind } from '../../src/challenges/wordFind'
import type { ChallengeDeps } from '../../src/challenges/mount'
import type { ReadPick } from '../../src/core/generators/read'

const ITEM: ReadPick[] = [
  { w: 'jump', cls: 'green' },
  { w: 'sat', cls: 'green' },
  { w: 's[ai]d', cls: 'red' },
]

/**
 * speakTarget is scheduled at 900 + picks.length * 60 (v0:886) — 1080ms for a
 * 3-word round. Deriving it means the test cannot silently disagree with the
 * frozen constant.
 */
const SPEAK_DELAY = 900 + ITEM.length * 60

function makeDeps(el: HTMLElement) {
  let lock = 0
  const d: ChallengeDeps = {
    el,
    speech: {
      speak: vi.fn(() => true),
      ready: () => true,
      cancel: vi.fn(),
      noticeShown: vi.fn(() => false),
      markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    holds: {
      rewardUntil: () => 0,
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
  return d
}

/** The renderer binds pointerdown (v0:882), not click. */
function tap(el: HTMLElement): void {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

let el: HTMLElement
beforeEach(() => {
  vi.useFakeTimers()
  // jsdom does not implement Element.animate, but the wrong-answer branch
  // calls it for the wobble (v0:927-929).
  ;(HTMLElement.prototype as unknown as Record<string, unknown>).animate =
    vi.fn(() => ({ onfinish: null, cancel: vi.fn() }))
  el = document.createElement('div')
  document.body.append(el)
})
afterEach(() => { vi.useRealTimers(); el.remove() })

describe('mountWordFind', () => {
  it('renders one element per word with the class the CSS expects', () => {
    // v0:863 — 'word ' + p.cls
    mountWordFind(ITEM, makeDeps(el))
    expect(el.querySelectorAll('.word')).toHaveLength(3)
    expect(el.querySelectorAll('.word.red')).toHaveLength(1)
  })

  it('renders the tricky bit as a marked segment', () => {
    // v0:867 — the tricky-bit class is 'tk'; v0:873 marks digraphs 'di'
    mountWordFind(ITEM, makeDeps(el))
    expect(el.querySelector('.tk')).not.toBeNull()
    expect(el.textContent).toContain('said')
    expect(el.textContent).not.toContain('[')
  })

  it('speaks the target word after the scheduled delay', () => {
    // v0:886 — 900 + picks.length * 60
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY - 1)
    expect(d.speech.speak).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(d.speech.speak).toHaveBeenCalled()
  })

  it('shows the word instead when no voice is available', () => {
    // v0:899-908 — copying it is still a win
    const d = makeDeps(el)
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockReturnValue(false)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 10)
    expect(d.showTarget).toHaveBeenCalled()
    expect(d.speech.markNoticeShown).toHaveBeenCalled()
    expect(d.toast).toHaveBeenCalledWith(expect.stringContaining('No UK English voice'))
  })

  it('does not toast about the voice if a notice was already shown', () => {
    // v0:722 is ONE shared flag, so the child never sees two voice messages
    const d = makeDeps(el)
    ;(d.speech.speak as ReturnType<typeof vi.fn>).mockReturnValue(false)
    ;(d.speech.noticeShown as ReturnType<typeof vi.fn>).mockReturnValue(true)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 10)
    expect(d.toast).not.toHaveBeenCalled()
  })

  it('a correct tap flies a star to the score and marks the word found', () => {
    // v0:917-925
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls[0]![0]
    const right = words.find(w => w.textContent === spoken)!
    tap(right)
    expect(d.flyToScore).toHaveBeenCalled()
    expect(d.sfx.play).toHaveBeenCalledWith('up')
    expect(right.classList.contains('found')).toBe(true)
    expect(d.onWrong).not.toHaveBeenCalled()
  })

  it('reports a wrong answer without ending the round', () => {
    // v0:926-939 — wrong costs nothing but a wobble (brief section 18)
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls[0]![0]
    const wrong = words.find(w => w.textContent !== spoken)!
    tap(wrong)
    expect(d.onWrong).toHaveBeenCalled()
    expect(d.sfx.play).toHaveBeenCalledWith('bump')
    expect(d.flyToScore).not.toHaveBeenCalled()
    expect(wrong.classList.contains('found')).toBe(false)
  })

  it('celebrates only when every word has been found', () => {
    // v0:924
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    for (let i = 0; i < 3; i++) {
      const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls.at(-1)![0]
      if (i < 2) expect(d.celebrate).not.toHaveBeenCalled()
      tap(words.find(w => w.textContent === spoken)!)
      vi.advanceTimersByTime(900)
    }
    expect(d.celebrate).toHaveBeenCalledTimes(1)
  })

  it('three wrong taps trigger the rescue and lock input', () => {
    // v0:931-936 — 3 wrongs, 1800ms lock, then the word again slowly
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls[0]![0]
    const wrong = words.find(w => w.textContent !== spoken)!
    tap(wrong); tap(wrong); tap(wrong)
    expect(d.toast).toHaveBeenCalledWith(expect.stringContaining('Listen carefully'))
    expect(d.holds.inputLock()).toBeGreaterThan(Date.now())
    const before = (d.onWrong as ReturnType<typeof vi.fn>).mock.calls.length
    tap(wrong)
    expect((d.onWrong as ReturnType<typeof vi.fn>).mock.calls.length).toBe(before)
  })

  it('re-reads the word slowly after the rescue', () => {
    // v0:936 — speak(currentWord(), .6)
    const d = makeDeps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speech.speak as ReturnType<typeof vi.fn>).mock.calls[0]![0]
    const wrong = words.find(w => w.textContent !== spoken)!
    tap(wrong); tap(wrong); tap(wrong)
    vi.advanceTimersByTime(500)
    expect(d.speech.speak).toHaveBeenCalledWith(spoken, 0.6)
  })

  it('teardown clears the element and cancels pending timers', () => {
    const d = makeDeps(el)
    const stop = mountWordFind(ITEM, d)
    stop()
    expect(el.children).toHaveLength(0)
    expect(d.speech.cancel).toHaveBeenCalled()
    vi.advanceTimersByTime(10_000)
    expect(d.celebrate).not.toHaveBeenCalled()
  })

  it('waits out a quiet period before speaking', () => {
    // v0:893-895 — never talk over a celebration
    const el2 = document.createElement('div')
    document.body.append(el2)
    const d = makeDeps(el2)
    let quiet = Date.now() + 5000
    d.holds.quietUntil = () => quiet
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 10)
    expect(d.speech.speak).not.toHaveBeenCalled()
    quiet = 0
    vi.advanceTimersByTime(6000)
    expect(d.speech.speak).toHaveBeenCalled()
    el2.remove()
  })
})
