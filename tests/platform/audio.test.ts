import { describe, it, expect, vi } from 'vitest'
import { createSfx } from '../../src/platform/audio'

/**
 * note() sweeps BOTH frequency and gain with exponentialRampToValueAtTime
 * (v0:2008, v0:2010). The fake must provide it, or a verbatim port throws and
 * the test would be pressuring a switch to a linear sweep — an audible change.
 */
function fakeCtx() {
  const osc = {
    frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    type: '', connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  }
  const gain = {
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }
  return {
    ctx: { currentTime: 0, state: 'running', destination: {},
           createOscillator: () => osc, createGain: () => gain } as unknown as AudioContext,
    osc, gain,
  }
}

const freqFrom = (f: ReturnType<typeof fakeCtx>): number =>
  f.osc.frequency.setValueAtTime.mock.calls[0]?.[0] as number
const freqTo = (f: ReturnType<typeof fakeCtx>): number =>
  f.osc.frequency.exponentialRampToValueAtTime.mock.calls[0]?.[0] as number

describe('createSfx', () => {
  it('is silent and does not throw when no AudioContext exists', () => {
    // v0:2026 — "no audio, no drama"
    const sfx = createSfx(() => null)
    expect(() => sfx.play('up')).not.toThrow()
  })

  it('starts and stops an oscillator when playing', () => {
    // v0:2012
    const f = fakeCtx()
    createSfx(() => f.ctx).play('up')
    expect(f.osc.start).toHaveBeenCalled()
    expect(f.osc.stop).toHaveBeenCalled()
  })

  it('plays nothing when disabled', () => {
    // v0:2016 — if(!soundOn) return
    const f = fakeCtx()
    const sfx = createSfx(() => f.ctx)
    sfx.enabled = false
    sfx.play('up')
    expect(f.osc.start).not.toHaveBeenCalled()
  })

  it('sweeps lo->hi for "up" and hi->lo for "down"', () => {
    // v0:2022 note(lo, hi, ...) and v0:2023 note(hi, lo, ...) — exact inverses
    const f1 = fakeCtx(), f2 = fakeCtx()
    const a = createSfx(() => f1.ctx); a.setTheme('ocean'); a.play('up')
    const b = createSfx(() => f2.ctx); b.setTheme('ocean'); b.play('down')
    expect(freqTo(f1)).toBeGreaterThan(freqFrom(f1))
    expect(freqFrom(f2)).toBe(freqTo(f1))
    expect(freqTo(f2)).toBe(freqFrom(f1))
  })

  it('"bump" ignores the theme — always the same low thud', () => {
    // v0:2024 note(170, 120, ...) — hardcoded, not theme-derived
    const f1 = fakeCtx(), f2 = fakeCtx()
    const a = createSfx(() => f1.ctx); a.setTheme('ocean'); a.play('bump')
    const b = createSfx(() => f2.ctx); b.setTheme('christmas'); b.play('bump')
    expect(freqFrom(f1)).toBe(170)
    expect(freqFrom(f2)).toBe(170)
    expect(freqTo(f1)).toBe(120)
  })

  it('"win" plays two chained notes', () => {
    // v0:2025 — two note() calls, the second offset by .14s
    const f = fakeCtx()
    createSfx(() => f.ctx).play('win')
    expect(f.osc.start).toHaveBeenCalledTimes(2)
  })

  it('follows the theme for "up"', () => {
    // v0:2021 destructures {lo, hi} from THEMES[theme]; ocean lo 320 (v0:508),
    // christmas lo 660 (v0:513)
    const f1 = fakeCtx(), f2 = fakeCtx()
    const a = createSfx(() => f1.ctx); a.setTheme('ocean'); a.play('up')
    const b = createSfx(() => f2.ctx); b.setTheme('christmas'); b.play('up')
    expect(freqFrom(f1)).toBe(320)
    expect(freqFrom(f2)).toBe(660)
  })

  it('creates the AudioContext lazily, on first play', () => {
    // Browsers refuse to start one before a user gesture
    let made = 0
    const sfx = createSfx(() => { made++; return fakeCtx().ctx })
    expect(made).toBe(0)
    sfx.play('up'); sfx.play('up')
    expect(made).toBe(1)
  })
})
