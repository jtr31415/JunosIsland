/**
 * Speech synthesis, ported from v0/junos-words.html:722-763.
 *
 * The original kept `voice` and `voiceToastShown` as module globals; here they
 * are closure state so tests can make independent instances. Behaviour is
 * unchanged, including the two load-bearing details below.
 */

/* Quality-ranked UK voices: Edge natural voices, then Apple, then Google. (v0:730-731) */
const PRI = ['maisie', 'sonia', 'libby', 'ryan', 'arthur', 'martha', 'serena', 'kate',
             'daniel', 'stephanie', 'google uk english female', 'google uk english male']

/** Filter to en-GB and sort by the priority list. Port of pickVoice (v0:724). */
export function rankVoices(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const gb = voices.filter(v => /^en[-_]GB/i.test(v.lang))
  return [...gb].sort((a, b) => {
    const ai = PRI.findIndex(p => a.name.toLowerCase().includes(p))
    const bi = PRI.findIndex(p => b.name.toLowerCase().includes(p))
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })
}

export interface Speaker {
  speak(txt: string, rate?: number, onend?: () => void): boolean
  ready(): boolean
  /** Port of the bare speechSynthesis.cancel() in clearRound (v0:847). */
  cancel(): void
  /**
   * Has a voice notice already been shown?
   *
   * One shared flag in the original (voiceToastShown, v0:722), set either by
   * the "Voice: X" announcement (v0:760) or by the "No UK English voice"
   * fallback (v0:905-907) — whichever fires first suppresses the other, so the
   * child never sees two voice messages.
   */
  noticeShown(): boolean
  markNoticeShown(): void
}

export interface SpeakerOptions {
  /** Called once, the first time a voice is chosen. Drives the 2D game's toast. */
  onVoicePicked?: (name: string) => void
}

export function createSpeaker(opts: SpeakerOptions = {}): Speaker {
  let voice: SpeechSynthesisVoice | null = null
  let announced = false

  const has = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window

  const pick = (): void => {
    if (!has()) return
    const vs = window.speechSynthesis.getVoices()
    if (!vs.length) return
    voice = rankVoices(vs)[0] ?? null
  }

  if (has()) {
    pick()
    window.speechSynthesis.onvoiceschanged = pick
  }

  return {
    ready: () => has() && !!voice,
    cancel: () => { if (has()) window.speechSynthesis.cancel() },
    noticeShown: () => announced,
    markNoticeShown: () => { announced = true },

    speak(txt, rate, onend) {
      if (!has()) return false
      if (!voice) pick()
      if (!voice) return false
      try {
        speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(txt)
        u.voice = voice
        u.lang = voice.lang
        /* `||` not `??` — matches v0:752, where rate 0 falls back to 0.85 */
        u.rate = rate || 0.85
        u.pitch = 1.05
        u.volume = 1
        if (onend) {
          let done = false
          const fin = (): void => { if (!done) { done = true; onend() } }
          u.onend = fin
          u.onerror = fin
          /* some engines never fire onend; keep the chain moving (v0:757) */
          setTimeout(fin, 2500)
        }
        speechSynthesis.speak(u)
        if (!announced) { announced = true; opts.onVoicePicked?.(voice.name) }
        return true
      } catch {
        return false
      }
    },
  }
}
