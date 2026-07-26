/**
 * Sound effects, ported from v0/junos-words.html:2004-2027.
 *
 * The four kind names are the original's and are used verbatim by the ported
 * renderers. popSound reads the current theme internally (v0:2021), so callers
 * pass no frequencies — hence setTheme rather than per-call lo/hi arguments.
 */
import { THEMES } from '../core/themes'
import type { ThemeName } from '../core/themes'

export type SoundKind = 'up' | 'down' | 'bump' | 'win'

export interface Sfx {
  play(kind: SoundKind): void
  enabled: boolean
  setTheme(t: ThemeName): void
}

type CtxFactory = () => AudioContext | null

/** Browsers refuse to start an AudioContext before a user gesture, so it is
 *  created lazily on first play and reused thereafter. */
const defaultFactory: CtxFactory = () => {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
    const Ctor = W.AudioContext ?? W.webkitAudioContext
    return Ctor ? new Ctor() : null
  } catch { return null }
}

export function createSfx(ctxFactory: CtxFactory = defaultFactory): Sfx {
  let audio: AudioContext | null = null
  let theme: ThemeName = 'ocean'

  /** Port of note (v0:2004). Both sweeps are exponential (v0:2008, 2010). */
  const note = (freq1: number, freq2: number, t: number, dur: number, vol: number): void => {
    if (!audio) return
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq1, t)
    o.frequency.exponentialRampToValueAtTime(freq2, t + dur * 0.55)
    g.gain.setValueAtTime(vol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(g); g.connect(audio.destination)
    o.start(t); o.stop(t + dur + 0.02)
  }

  const sfx: Sfx = {
    enabled: true,

    setTheme(t: ThemeName) { theme = t },

    /** Port of popSound (v0:2015). */
    play(kind: SoundKind) {
      if (!sfx.enabled) return
      try {
        audio = audio ?? ctxFactory()
        if (!audio) return
        if (audio.state === 'suspended') void audio.resume()
        const t = audio.currentTime
        const { lo, hi } = THEMES[theme]
        if (kind === 'up') note(lo, hi, t, 0.22, 0.25)
        else if (kind === 'down') note(hi, lo, t, 0.22, 0.22)
        else if (kind === 'bump') note(170, 120, t, 0.18, 0.18)
        else if (kind === 'win') {
          note(lo, lo * 1.6, t, 0.16, 0.22)
          note(hi, hi * 1.3, t + 0.14, 0.28, 0.22)
        }
      } catch { /* no audio, no drama */ }
    },
  }

  return sfx
}
