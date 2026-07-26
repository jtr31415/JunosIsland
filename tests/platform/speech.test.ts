/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSpeaker, rankVoices } from '../../src/platform/speech'

const V = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice

describe('rankVoices', () => {
  it('keeps only en-GB voices', () => {
    // v0:728 — /^en[-_]GB/i, so both hyphen and underscore forms count
    const out = rankVoices([V('Sonia', 'en-GB'), V('Alex', 'en-US'), V('Kate', 'en_GB')])
    expect(out.map(v => v.name)).toEqual(['Sonia', 'Kate'])
  })

  it('ranks preferred UK voices ahead of unknown ones', () => {
    // v0:735 — unlisted voices sort to 99
    const out = rankVoices([V('Random', 'en-GB'), V('Sonia', 'en-GB')])
    expect(out[0]!.name).toBe('Sonia')
  })

  it('orders by the priority list — Maisie before Sonia before Ryan', () => {
    // v0:730-731 priority order
    const out = rankVoices([V('Ryan', 'en-GB'), V('Sonia', 'en-GB'), V('Maisie', 'en-GB')])
    expect(out.map(v => v.name)).toEqual(['Maisie', 'Sonia', 'Ryan'])
  })

  it('matches on substring, so "Microsoft Sonia Online" still ranks', () => {
    // v0:733 uses .includes(), not equality
    const out = rankVoices([V('Random', 'en-GB'), V('Microsoft Sonia Online (Natural)', 'en-GB')])
    expect(out[0]!.name).toContain('Sonia')
  })

  it('returns empty when no UK voice exists', () => {
    expect(rankVoices([V('Alex', 'en-US')])).toEqual([])
  })
})

describe('createSpeaker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ;(globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = class {
      text: string; voice: unknown; lang = ''; rate = 1; pitch = 1; volume = 1
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(t: string) { this.text = t }
    }
    ;(window as unknown as Record<string, unknown>).speechSynthesis = {
      getVoices: () => [V('Sonia', 'en-GB')],
      speak: vi.fn(),
      cancel: vi.fn(),
      onvoiceschanged: null,
    }
  })

  it('reports not ready when the API is absent', () => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis
    expect(createSpeaker().ready()).toBe(false)
  })

  it('returns false from speak when there is no voice', () => {
    // v0:747 — no voice, no speech, but no crash either
    ;(window as any).speechSynthesis.getVoices = () => []
    expect(createSpeaker().speak('hello')).toBe(false)
  })

  it('speaks and reports success', () => {
    const s = createSpeaker()
    expect(s.speak('jump')).toBe(true)
    expect((window as any).speechSynthesis.speak).toHaveBeenCalled()
  })

  it('defaults rate to 0.85 and treats rate 0 the same way', () => {
    // v0:752 uses `rate || .85`, NOT `??` — 0 must fall back, not silence speech
    let utter: any
    ;(window as any).speechSynthesis.speak = (u: any) => { utter = u }
    createSpeaker().speak('jump')
    expect(utter.rate).toBe(0.85)
    createSpeaker().speak('jump', 0)
    expect(utter.rate).toBe(0.85)
    createSpeaker().speak('jump', 0.6)
    expect(utter.rate).toBe(0.6)
  })

  it('fires onend once even if the engine never fires it', () => {
    // v0:757 — the 2.5s fallback keeps Fred's sounding-out chain moving
    const onend = vi.fn()
    createSpeaker().speak('jump', 0.9, onend)
    vi.advanceTimersByTime(2500)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('does not double-fire onend when the engine also fires', () => {
    // v0:754-756 — the `done` latch
    const onend = vi.fn()
    let utter: any
    ;(window as any).speechSynthesis.speak = (u: any) => { utter = u }
    createSpeaker().speak('jump', 0.9, onend)
    utter.onend()
    vi.advanceTimersByTime(5000)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('treats an engine error as an end, so the chain never stalls', () => {
    // v0:756 — u.onerror = fin
    const onend = vi.fn()
    let utter: any
    ;(window as any).speechSynthesis.speak = (u: any) => { utter = u }
    createSpeaker().speak('jump', 0.9, onend)
    utter.onerror()
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('cancels any current utterance before speaking', () => {
    // v0:749 — no beheading of the previous word
    const s = createSpeaker()
    s.speak('one')
    expect((window as any).speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('announces the picked voice only once', () => {
    // v0:760
    const onVoicePicked = vi.fn()
    const s = createSpeaker({ onVoicePicked })
    s.speak('one'); s.speak('two'); s.speak('three')
    expect(onVoicePicked).toHaveBeenCalledTimes(1)
    expect(onVoicePicked).toHaveBeenCalledWith('Sonia')
  })

  it('markNoticeShown suppresses the voice announcement', () => {
    // v0:722 is ONE shared flag: the no-voice fallback toast (v0:905-907) and
    // the "Voice: X" toast (v0:760) are mutually exclusive, so the child never
    // sees two voice messages.
    const onVoicePicked = vi.fn()
    const s = createSpeaker({ onVoicePicked })
    expect(s.noticeShown()).toBe(false)
    s.markNoticeShown()
    expect(s.noticeShown()).toBe(true)
    s.speak('hello')
    expect(onVoicePicked).not.toHaveBeenCalled()
  })

  it('speaking marks the notice as shown', () => {
    const s = createSpeaker({ onVoicePicked: vi.fn() })
    s.speak('hello')
    expect(s.noticeShown()).toBe(true)
  })

  it('cancel is safe when the API is absent', () => {
    // v0:847 clearRound calls it bare; must not throw in a no-speech environment
    delete (window as unknown as Record<string, unknown>).speechSynthesis
    expect(() => createSpeaker().cancel()).not.toThrow()
  })
})
