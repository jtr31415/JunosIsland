import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createBakedSpeaker } from '../../src/platform/voice'
import type { BakedSpeaker } from '../../src/platform/voice'
import type { Speaker } from '../../src/platform/speech'
import { VOICE_LINES, renderTemplate } from '../../src/platform/voice-lines'

/**
 * Default `node` environment, deliberately, and no DOM anywhere in this file.
 *
 * jsdom does not implement `AudioContext` at all, so a jsdom run would test a
 * `ctxFactory` that returns null — which is the "no clips" path and proves
 * nothing about the player. `tests/platform/audio.test.ts` set the precedent:
 * inject the context, assert on what was scheduled.
 *
 * Everything below is asserted against the CONTRACT — the URL actually
 * requested, the times actually scheduled, the text actually handed to the
 * fallback — rather than against a mock having been reached.
 */

/* ── the ledger, as the bake left it ─────────────────────────────────────── */

/** Real ids and real durations from src/island/public/voice/manifest.json. */
const MS: Record<string, number> = {
  'open.egg': 3100,
  'open.quiet': 1720,
  'open.fromTheSea': 4351,
  'land.counted': 2386,
  'gov.spaceSurplus.head': 1720,
  'gov.spaceSurplus.tail.many': 1514,
  'count.3': 385,
}

const EGG = 'Ooh! Look! An egg!'
const QUIET = "It's ever so quiet out here."
const SEA = 'Eggs come from far across the sea… and they only hatch for someone who reads to them.'

/** The governor sentence, rendered by the same function the game renders it with. */
const govLine = (n: number): string => {
  const line = VOICE_LINES.find(l => l.id === 'gov.spaceSurplus')
  if (!line || line.kind !== 'template') throw new Error('ledger moved')
  return renderTemplate(line.template, n)
}

type ClipPatch = Partial<{ file: string; character: string }>

const manifestOf = (patch: Record<string, ClipPatch> = {}): unknown => ({
  schemaVersion: 1,
  clips: Object.fromEntries(Object.keys(MS).map(id => [id, {
    file: `src/island/public/voice/script/${id}.opus`,
    ms: MS[id], bytes: 4096, hash: 'x', character: 'fred',
    voice: 'en-GB-OliverNeural', rate: '-8%',
    ...patch[id],
  }])),
})

/* ── fakes ───────────────────────────────────────────────────────────────── */

interface FakeSource {
  buffer: unknown
  onended: (() => void) | null
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

interface FakeCtx {
  state: string
  currentTime: number
  destination: unknown
  resume: ReturnType<typeof vi.fn>
  createBufferSource: () => FakeSource
  decodeAudioData: (b: ArrayBuffer) => Promise<unknown>
}

const idFromUrl = (url: string): string => {
  const tail = url.slice(url.lastIndexOf('/') + 1)
  return tail.endsWith('.opus') ? tail.slice(0, -5) : tail
}

/** The bytes a clip fetch yields are its own URL, so decode can identify it. */
const encodeUrl = (url: string): ArrayBuffer => {
  const u8 = new TextEncoder().encode(url)
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
}
const decodeUrl = (b: ArrayBuffer): string => new TextDecoder().decode(new Uint8Array(b))

function fakeCtx(o: { state?: string; currentTime?: number; decodeFails?: readonly string[] | 'all' } = {}) {
  const sources: FakeSource[] = []
  const ctx: FakeCtx = {
    state: o.state ?? 'running',
    currentTime: o.currentTime ?? 0,
    destination: {},
    /* Does NOT flip state — tests that care flip it themselves, so the
     * "suspended now, running next line" sequence is explicit. */
    resume: vi.fn(() => Promise.resolve()),
    createBufferSource() {
      const s: FakeSource = {
        buffer: null, onended: null,
        connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
      }
      sources.push(s)
      return s
    },
    decodeAudioData: vi.fn(async (bytes: ArrayBuffer) => {
      const id = idFromUrl(decodeUrl(bytes))
      if (o.decodeFails === 'all' || o.decodeFails?.includes(id)) throw new Error('cannot decode Opus')
      return { duration: (MS[id] ?? 0) / 1000 }
    }),
  }
  return { ctx, sources, as: ctx as unknown as AudioContext }
}

function fakeSpeaker(returns = true) {
  return {
    speak: vi.fn<Speaker['speak']>(() => returns),
    ready: vi.fn(() => true),
    cancel: vi.fn(),
    noticeShown: vi.fn(() => false),
    markNoticeShown: vi.fn(),
  }
}

interface FetchOpts {
  manifest?: unknown
  manifestStatus?: number
  malformed?: boolean
  rejects?: boolean
  missing?: readonly string[]
}

function fakeFetcher(o: FetchOpts = {}) {
  const urls: string[] = []
  const fetch = vi.fn(async (url: string): Promise<Response> => {
    urls.push(url)
    if (o.rejects) throw new Error('offline')
    if (url.endsWith('manifest.json')) {
      return {
        ok: (o.manifestStatus ?? 200) < 400,
        json: async () => {
          if (o.malformed) throw new SyntaxError('Unexpected token < in JSON')
          return o.manifest ?? manifestOf()
        },
      } as unknown as Response
    }
    if (o.missing?.includes(idFromUrl(url))) return { ok: false } as unknown as Response
    return { ok: true, arrayBuffer: async () => encodeUrl(url) } as unknown as Response
  })
  return { fetch, urls }
}

interface Harness {
  speaker: BakedSpeaker
  fallback: ReturnType<typeof fakeSpeaker>
  ctx: FakeCtx
  sources: FakeSource[]
  urls: string[]
}

async function harness(o: {
  base?: string
  state?: string
  currentTime?: number
  decodeFails?: readonly string[] | 'all'
  fetchOpts?: FetchOpts
  fallbackReturns?: boolean
  noCtx?: boolean
  noFetcher?: boolean
  load?: boolean
} = {}): Promise<Harness> {
  const c = fakeCtx({ state: o.state, currentTime: o.currentTime, decodeFails: o.decodeFails })
  const f = fakeFetcher(o.fetchOpts)
  const fallback = fakeSpeaker(o.fallbackReturns ?? true)
  const speaker = createBakedSpeaker(fallback, {
    base: o.base ?? '',
    ctxFactory: () => (o.noCtx ? null : c.as),
    fetcher: o.noFetcher ? null : f.fetch,
  })
  if (o.load !== false) await speaker.load()
  return { speaker, fallback, ctx: c.ctx, sources: c.sources, urls: f.urls }
}

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

/* ── the contract ────────────────────────────────────────────────────────── */

describe('createBakedSpeaker', () => {
  it('falls back for every line until load() has finished', async () => {
    // §6's fallback chain arriving in its ordinary order, not a failure.
    const h = await harness({ load: false, fallbackReturns: false })
    expect(h.speaker.speak(EGG)).toBe(false)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
    expect(h.sources).toHaveLength(0)
    expect(h.speaker.clipsReady()).toBe(false)
  })

  it('plays a whole line as one clip once loaded, and does not also synthesise it', async () => {
    const h = await harness()
    expect(h.speaker.clipsReady()).toBe(true)
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).not.toHaveBeenCalled()
    expect(h.sources).toHaveLength(1)
    expect(h.sources[0]?.start).toHaveBeenCalledTimes(1)
    expect(h.sources[0]?.buffer).toEqual({ duration: 3.1 })
  })

  it('requests voice/manifest.json and voice/script/*.opus, relative, when base is ""', async () => {
    const h = await harness({ base: '' })
    expect(h.urls[0]).toBe('voice/manifest.json')
    expect(h.urls).toContain('voice/script/open.egg.opus')
  })

  it('prefixes every URL with base when the page is served from a subpath', async () => {
    // vite.island.config.ts ships the island under /JunosIsland/.
    const h = await harness({ base: '/JunosIsland/' })
    expect(h.urls[0]).toBe('/JunosIsland/voice/manifest.json')
    expect(h.urls).toContain('/JunosIsland/voice/script/open.egg.opus')
    expect(h.urls.every(u => u.startsWith('/JunosIsland/'))).toBe(true)
  })

  it('skips a clip whose file is not under src/island/public/ rather than guessing a URL', async () => {
    const h = await harness({
      fetchOpts: { manifest: manifestOf({ 'open.egg': { file: 'voice/script/open.egg.opus' } }) },
    })
    expect(h.urls.some(u => u.includes('open.egg'))).toBe(false)
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
    // …and the rest of the manifest is unharmed.
    h.fallback.speak.mockClear()
    h.speaker.speak(QUIET)
    expect(h.fallback.speak).not.toHaveBeenCalled()
  })

  it('splices the governor line as three sources with a 120ms gap between them', async () => {
    // voice.md §3, "Slot gaps ~120ms". Scheduled against currentTime, so a
    // context that has been alive a while still lines the pieces up.
    const h = await harness({ currentTime: 10 })
    expect(h.speaker.speak(govLine(3))).toBe(true)
    expect(h.sources).toHaveLength(3)
    const at = (i: number): number => h.sources[i]?.start.mock.calls[0]?.[0] as number
    expect(at(0)).toBeCloseTo(10, 6)
    expect(at(1)).toBeCloseTo(10 + 1.72 + 0.12, 6)          // head 1720ms + gap
    expect(at(2)).toBeCloseTo(10 + 1.72 + 0.12 + 0.385 + 0.12, 6)   // + count.3 + gap
    expect(h.fallback.speak).not.toHaveBeenCalled()
  })

  it('falls back for a count outside the baked range — ordinary, not an error', async () => {
    const h = await harness()
    const line = govLine(21)
    expect(line).toContain('21')
    h.speaker.speak(line)
    expect(h.fallback.speak).toHaveBeenCalledWith(line, undefined, undefined)
    expect(h.sources).toHaveLength(0)
  })

  it('speaks synthetically while the context is suspended, resumes it, and plays the next line', async () => {
    // Autoplay: the story can replay after a wipe with no gesture in front of
    // it. Fred in the wrong voice beats Fred not heard at all.
    const h = await harness({ state: 'suspended' })
    expect(h.speaker.clipsReady()).toBe(false)
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
    expect(h.ctx.resume).toHaveBeenCalled()
    expect(h.sources).toHaveLength(0)

    h.ctx.state = 'running'
    h.fallback.speak.mockClear()
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).not.toHaveBeenCalled()
    expect(h.sources).toHaveLength(1)
  })

  it('resumes the context on the first gesture, once, in the capture phase', async () => {
    const listeners: { type: string; fn: () => void; opts: unknown }[] = []
    vi.stubGlobal('window', {
      addEventListener: (type: string, fn: () => void, opts: unknown) => listeners.push({ type, fn, opts }),
    })
    const c = fakeCtx({ state: 'suspended' })
    const f = fakeFetcher()
    const speaker = createBakedSpeaker(fakeSpeaker(), { ctxFactory: () => c.as, fetcher: f.fetch })
    await speaker.load()

    expect(listeners.map(l => l.type).sort()).toEqual(['keydown', 'pointerdown'])
    expect(listeners.every(l => (l.opts as { once: boolean; capture: boolean }).once)).toBe(true)
    expect(listeners.every(l => (l.opts as { once: boolean; capture: boolean }).capture)).toBe(true)
    listeners[0]?.fn()
    expect(c.ctx.resume).toHaveBeenCalled()
  })

  it('stays permanently on synthesis when nothing decodes — an engine without Opus', async () => {
    // Feature-detected by letting decodeAudioData answer; no userAgent anywhere.
    const h = await harness({ decodeFails: 'all' })
    expect(h.speaker.clipsReady()).toBe(false)
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
    expect(h.sources).toHaveLength(0)
  })

  it('loses only the lines that need a clip which failed to decode', async () => {
    const h = await harness({ decodeFails: ['open.egg'] })
    expect(h.speaker.speak(EGG)).toBe(true)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
    expect(h.sources).toHaveLength(0)

    h.fallback.speak.mockClear()
    expect(h.speaker.speak(QUIET)).toBe(true)
    expect(h.fallback.speak).not.toHaveBeenCalled()
    expect(h.sources).toHaveLength(1)
  })

  it('loses only the spliced line when one piece of it failed to decode', async () => {
    const h = await harness({ decodeFails: ['count.3'] })
    const line = govLine(3)
    h.speaker.speak(line)
    expect(h.fallback.speak).toHaveBeenCalledWith(line, undefined, undefined)
    expect(h.sources).toHaveLength(0)
  })

  it('stops a playing chain on the next speak and fires its onend exactly once', async () => {
    // speechSynthesis.cancel() ends the utterance AND fires its end event;
    // album.ts:704 chains a second line inside the first's onend.
    const h = await harness()
    const onendA = vi.fn()
    h.speaker.speak(SEA, undefined, onendA)
    expect(h.sources).toHaveLength(1)
    const natural = h.sources[0]?.onended ?? null

    h.speaker.speak(EGG)
    expect(h.sources[0]?.stop).toHaveBeenCalled()
    expect(onendA).toHaveBeenCalledTimes(1)
    expect(h.sources).toHaveLength(2)
    expect(h.fallback.speak).not.toHaveBeenCalled()

    // The latch: a stopped chain cannot fire twice, even if the engine still
    // delivers the ended event it was told to forget.
    natural?.()
    expect(onendA).toHaveBeenCalledTimes(1)
  })

  it('stops a playing chain when a synthetic line takes over', async () => {
    const h = await harness()
    const onendA = vi.fn()
    h.speaker.speak(EGG, undefined, onendA)
    h.speaker.speak('Well done!')
    expect(h.sources[0]?.stop).toHaveBeenCalled()
    expect(onendA).toHaveBeenCalledTimes(1)
    expect(h.fallback.speak).toHaveBeenCalledWith('Well done!', undefined, undefined)
  })

  it('fires onend on the natural end of the last piece', async () => {
    const h = await harness()
    const onend = vi.fn()
    h.speaker.speak(govLine(3), undefined, onend)
    h.sources[0]?.onended?.()   // the head ending must not end the chain
    expect(onend).not.toHaveBeenCalled()
    h.sources[2]?.onended?.()
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('fires onend on the backstop when the engine never delivers onended', async () => {
    vi.useFakeTimers()
    const h = await harness()
    const onend = vi.fn()
    h.speaker.speak(EGG, undefined, onend)
    vi.advanceTimersByTime(3100 + 749)
    expect(onend).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('fires onend once when the natural end and the backstop both arrive', async () => {
    vi.useFakeTimers()
    const h = await harness()
    const onend = vi.fn()
    h.speaker.speak(EGG, undefined, onend)
    h.sources[0]?.onended?.()
    vi.advanceTimersByTime(60_000)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('sizes the backstop to the chain, not to speech.ts\'s fixed 2500ms', async () => {
    // open.fromTheSea is 4351ms. A copied 2500ms backstop would hand the
    // ceremony on with a third of the sentence still to come.
    vi.useFakeTimers()
    const h = await harness()
    const onend = vi.fn()
    h.speaker.speak(SEA, undefined, onend)
    vi.advanceTimersByTime(2500)
    expect(onend).not.toHaveBeenCalled()
    vi.advanceTimersByTime(4351)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('sizes the backstop past the gaps of a spliced chain too', async () => {
    vi.useFakeTimers()
    const h = await harness()
    const onend = vi.fn()
    h.speaker.speak(govLine(3), undefined, onend)
    vi.advanceTimersByTime(1720 + 385 + 1514 + 120 + 120)   // the audible length exactly
    expect(onend).not.toHaveBeenCalled()
    vi.advanceTimersByTime(750)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('refuses a cross-voice splice and says the whole sentence synthetically', async () => {
    // voice.md §3: same-voice splices are invisible, cross-voice ones uncanny.
    const h = await harness({
      fetchOpts: { manifest: manifestOf({ 'count.3': { character: 'teacher' } }) },
    })
    const line = govLine(3)
    h.speaker.speak(line)
    expect(h.sources).toHaveLength(0)
    expect(h.fallback.speak).toHaveBeenCalledWith(line, undefined, undefined)
    // A single-clip line of that same voice is unaffected — the law is about seams.
    h.speaker.speak(EGG)
    expect(h.sources).toHaveLength(1)
  })

  it('cancel() stops the clips and cancels synthesis too', async () => {
    const h = await harness()
    h.speaker.speak(EGG)
    h.speaker.cancel()
    expect(h.sources[0]?.stop).toHaveBeenCalled()
    expect(h.fallback.cancel).toHaveBeenCalled()
  })

  it('sends any line with a rate to synthesis, rate intact', async () => {
    // A rate is a challenge word or a help repeat (challenges/build.ts:83,96),
    // never Fred — and a baked clip cannot honour one.
    const h = await harness()
    const onend = vi.fn()
    expect(h.speaker.speak(EGG, 0.6, onend)).toBe(true)
    expect(h.fallback.speak).toHaveBeenCalledWith(EGG, 0.6, onend)
    expect(h.sources).toHaveLength(0)
  })

  it('delegates ready() and the notice flag', async () => {
    const h = await harness({ load: false })
    expect(h.speaker.ready()).toBe(true)          // no clips yet: the fallback's answer
    expect(h.speaker.noticeShown()).toBe(false)
    h.speaker.markNoticeShown()
    expect(h.fallback.markNoticeShown).toHaveBeenCalled()
  })

  describe('when there are no clips to be had, the island speaks exactly as today', () => {
    const cases: { name: string; opts: Parameters<typeof harness>[0] }[] = [
      { name: 'no AudioContext', opts: { noCtx: true } },
      { name: 'no fetch', opts: { noFetcher: true } },
      { name: 'the fetch rejects', opts: { fetchOpts: { rejects: true } } },
      { name: 'the manifest 404s', opts: { fetchOpts: { manifestStatus: 404 } } },
      { name: 'the manifest is malformed', opts: { fetchOpts: { malformed: true } } },
      { name: 'the manifest has no clips', opts: { fetchOpts: { manifest: { schemaVersion: 1 } } } },
      { name: 'every clip 404s', opts: { fetchOpts: { missing: Object.keys(MS) } } },
    ]
    for (const { name, opts } of cases) {
      it(name, async () => {
        const h = await harness({ ...opts, load: false, fallbackReturns: false })
        await expect(h.speaker.load()).resolves.toBeUndefined()
        expect(h.speaker.clipsReady()).toBe(false)
        expect(() => h.speaker.speak(EGG)).not.toThrow()
        expect(h.speaker.speak(EGG)).toBe(false)
        expect(h.fallback.speak).toHaveBeenCalledWith(EGG, undefined, undefined)
        expect(() => h.speaker.cancel()).not.toThrow()
      })
    }
  })

  it('loads once however often load() is called', async () => {
    const h = await harness({ load: false })
    await Promise.all([h.speaker.load(), h.speaker.load()])
    await h.speaker.load()
    expect(h.urls.filter(u => u.endsWith('manifest.json'))).toHaveLength(1)
  })

  it('never reads navigator.userAgent — Opus support is feature-detected', () => {
    // A sniff would be wrong the day one of those engines gains the codec.
    const src = readFileSync(fileURLToPath(new URL('../../src/platform/voice.ts', import.meta.url)), 'utf8')
    expect(src).not.toMatch(/userAgent|navigator/)
  })
})

/*
 * THE CLIPS MUST BE IN THE OFFLINE BUNDLE, and nothing else would notice if
 * they were not.
 *
 * Workbox precaches only what `globPatterns` names. Drop `opus` from that list
 * and every test in this file still passes, the dev server still serves the
 * clips, and a production build still works on any device with a network — the
 * one place it shows is a tablet in aeroplane mode, where Fred quietly reverts
 * to the device's robot voice with nothing gone red anywhere. The font above it
 * in that same config was nearly lost to exactly this, which is why the comment
 * there is as long as it is.
 *
 * Reading the config as source is the weaker kind of test that
 * `tests/island/barrier.test.ts` and `tests/island/fred.test.ts` use for glue no
 * unit test can reach. The alternative is a full production build inside a unit
 * test, which is minutes rather than milliseconds. This lives beside the player
 * rather than in `tests/island/` because it is part of one promise: that a line
 * with a clip is spoken in Oliver's voice, offline included.
 */
describe('the baked voice ships in the precache', () => {
  const config = readFileSync(fileURLToPath(new URL('../../vite.island.config.ts', import.meta.url)), 'utf8')
  const globs = /globPatterns:\s*\[([^\]]*)\]/.exec(config)?.[1] ?? ''

  it('names opus in workbox globPatterns', () => {
    expect(globs).not.toBe('')
    expect(globs).toContain('opus')
  })

  it('names the manifest too, without which the clips are unreachable offline', () => {
    /*
     * The trap's second coat. `globPatterns` had no `json`, so precaching the
     * audio alone put 41 clips in the cache with nothing able to find them —
     * the player fetches `voice/manifest.json` first and gives up silently when
     * it 404s. Caught by reading the built `sw.js`, not by any test.
     */
    expect(globs).toContain('voice/manifest.json')
  })

  it('still names the reading font, which is the same promise', () => {
    expect(globs).toContain('woff2')
  })

  it('is wired with no base, so the URLs stay document-relative', () => {
    /*
     * `main.ts` calls `createBakedSpeaker(createSpeaker())` and passes no
     * `base`, exactly as it calls `createPetField()` and `createPropField()`
     * with none (`src/island/pets.ts:607`, `src/island/world/props.ts:846`).
     * The clips are in Vite's publicDir and the page is served from
     * `/JunosIsland/`, so a relative `voice/script/x.opus` resolves under it
     * without the module having to know the sub-path — which is what lets the
     * workbench serve the same assets from root.
     *
     * Pinning it here because the tempting "fix" is `import.meta.env.BASE_URL`,
     * which would be the repo's first use of it and would break the workbench.
     */
    const main = readFileSync(fileURLToPath(new URL('../../src/island/main.ts', import.meta.url)), 'utf8')
    expect(main).toContain('createBakedSpeaker(createSpeaker())')
    expect(main).not.toMatch(/BASE_URL/)
  })
})
