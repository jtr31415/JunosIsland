/**
 * Fred in Fred's own voice — a `Speaker` that plays the baked clips when it can.
 *
 * PB-028 baked forty-one Oliver clips and then left them unread: every line on
 * the island still goes through `createSpeaker()` and comes out in whatever
 * robotic voice the device happens to own. This module is the missing consumer.
 * It wraps a `Speaker` rather than replacing one, so the wiring stays a single
 * decoration at the composition root and every existing caller — the presenter,
 * the album's two chained utterances, the challenge word repeats — keeps the
 * exact interface it already talks to.
 *
 * The shape of the thing follows from one fact: `Speaker.speak` returns a
 * `boolean` and callers branch on it (`src/challenges/build.ts:85` paces the
 * whole grapheme walk off the return value), so it cannot become async. Fetching
 * and decoding therefore has to have happened already, which is why `load()`
 * exists and why every line before it finishes falls back to synthesis. That is
 * not a failure mode; it is the documented fallback chain — baked clip → Web
 * Speech → visual only (voice.md §6) — arriving in its ordinary order.
 *
 * Everything else here is an attempt to be indistinguishable from `speech.ts`
 * when it fails. A missing manifest, a 404, malformed JSON, no `AudioContext`,
 * no `fetch`, an engine that cannot decode Opus: each of those means "no clips",
 * silently, and the island speaks exactly as it does today.
 */
import type { Speaker } from './speech'
import { resolveLine } from './voice-lines'

/**
 * The manifest's `file` is a REPO path, not a URL.
 *
 * `bake.mjs` is a Node tool writing paths it can itself `readFile`, and
 * `docs/handoffs/PB-028-fred-bake.md:223-228` records the decision to leave the
 * field alone rather than invent a second contract for a consumer that did not
 * exist yet. This is that consumer, and the mapping lives here: the manifest
 * ships from inside Vite's `publicDir`, so `src/island/public/X` is served at
 * `X` against the page's base.
 *
 * A `file` that does not carry the prefix is skipped rather than guessed at. A
 * guessed URL is a 404 in the good case and the wrong clip in Fred's mouth in
 * the bad one, and the cost of skipping is only that one line stays synthetic.
 */
const REPO_PREFIX = 'src/island/public/'

/**
 * The gap between spliced pieces (voice.md §3: "Slot gaps ~120ms").
 *
 * The seams are cut on natural pause boundaries by script design, so this is the
 * breath that would have been there — "Let's read with the egg —" / "three" /
 * "more friends will fill it up!" runs together into one sentence without it.
 */
const SLOT_GAP_MS = 120

/**
 * How long past a chain's own length to wait before giving up on `onended`.
 *
 * `speech.ts:88` uses a flat 2500 ms because a synthesis engine gives no
 * duration to compute from. Copying that number here would be a bug rather than
 * a port: `open.fromTheSea` is 4351 ms and `gov.wriggleBreak` is 7955 ms, so a
 * fixed 2500 ms backstop would fire mid-sentence and hand the ceremony on while
 * Fred was still talking. The backstop is therefore computed from the decoded
 * durations, and this is only the slack on top — enough to cover the context's
 * output latency and the drift between scheduling against `currentTime` and the
 * hardware actually starting, small enough that a chain whose `onended` never
 * arrives does not visibly stall the beat.
 */
const BACKSTOP_MARGIN_MS = 750

/**
 * One clip as the manifest describes it. Only these two fields are read: `ms`
 * is deliberately ignored at play time in favour of the decoded duration, and
 * `bytes`/`hash`/`voice`/`rate` are the bake tool's own bookkeeping.
 */
interface ClipEntry {
  readonly file: string
  /** Whose larynx. The splice law (§3) is enforced against this and nothing else. */
  readonly character: string
}

export interface VoiceOptions {
  /**
   * URL prefix for the voice directory. Default '' — relative to the document,
   * which is how every other asset in this repo is loaded (see
   * `createPetField(base = '')` in src/island/pets.ts:607 and
   * `createPropField(base = '')` in src/island/world/props.ts:846).
   */
  base?: string
  /** Injected in tests. Default: window.AudioContext ?? window.webkitAudioContext, in a try. */
  ctxFactory?: () => AudioContext | null
  /** Injected in tests. Default: window.fetch, bound, or null when absent. */
  fetcher?: ((url: string) => Promise<Response>) | null
}

export interface BakedSpeaker extends Speaker {
  /** Fetch the manifest and decode every clip. Resolves when ready, or when it has given up. Never rejects. */
  load(): Promise<void>
  /** True when clips are decoded AND the audio context is running, i.e. the next Fred line will be Oliver. */
  clipsReady(): boolean
}

const defaultCtxFactory = (): AudioContext | null => {
  try {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
    const Ctor = W.AudioContext ?? W.webkitAudioContext
    return Ctor ? new Ctor() : null
  } catch { return null }
}

const defaultFetcher = (): ((url: string) => Promise<Response>) | null => {
  try {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return null
    return window.fetch.bind(window)
  } catch { return null }
}

/** A chain in flight: its scheduled sources, and the one call that ends it. */
interface Chain {
  readonly sources: readonly AudioBufferSourceNode[]
  readonly fin: () => void
}

export function createBakedSpeaker(fallback: Speaker, opts: VoiceOptions = {}): BakedSpeaker {
  const base = opts.base ?? ''
  const ctxFactory = opts.ctxFactory ?? defaultCtxFactory
  const fetcher = opts.fetcher === undefined ? defaultFetcher() : opts.fetcher

  const buffers = new Map<string, AudioBuffer>()
  const characters = new Map<string, string>()
  let ctx: AudioContext | null = null
  let loading: Promise<void> | null = null
  let current: Chain | null = null

  /*
   * Autoplay is a failure mode this player has and `speech.ts` does not.
   * `speechSynthesis` is allowed on most engines without a gesture; an
   * AudioContext is not, and starts 'suspended'. The island's first run does
   * have a gesture to ride on — the name prompt is a button press or an Enter
   * key — but the story replays after a save wipe with no prompt in front of it,
   * so the gesture cannot be assumed. Hence both: an unlock listener that
   * resumes on the first touch or key, and a per-line guard below that speaks
   * synthetically rather than silently while the context is still asleep.
   */
  if (typeof window !== 'undefined') {
    const unlock = (): void => { if (ctx && ctx.state === 'suspended') void ctx.resume() }
    try {
      window.addEventListener('pointerdown', unlock, { capture: true, once: true })
      window.addEventListener('keydown', unlock, { capture: true, once: true })
    } catch { /* no window worth the name; the per-line guard still holds */ }
  }

  /** `src/island/public/voice/script/x.opus` → `${base}voice/script/x.opus`, or null. */
  const urlFor = (file: string): string | null =>
    file.startsWith(REPO_PREFIX) ? base + file.slice(REPO_PREFIX.length) : null

  /** Read one clip's fields defensively — the manifest is a fetched file, not a type. */
  const entryOf = (raw: unknown): ClipEntry | null => {
    if (typeof raw !== 'object' || raw === null) return null
    const r = raw as Record<string, unknown>
    if (typeof r['file'] !== 'string' || typeof r['character'] !== 'string') return null
    return { file: r['file'], character: r['character'] }
  }

  /**
   * Fetch and decode one clip. Never rejects: a clip that does not arrive or
   * does not decode is simply absent, and its line falls back.
   *
   * Opus support is feature-detected exactly here, by letting `decodeAudioData`
   * answer. Older Safari and iOS cannot decode Ogg Opus, and the temptation is
   * to sniff the browser's identifying string for them — this module reads no
   * such string anywhere (a test greps it to be sure), because that string
   * lies, is being frozen, and would be wrong again the day one of those
   * engines gains the codec.
   */
  const loadClip = async (
    id: string, entry: ClipEntry, audio: AudioContext, get: (url: string) => Promise<Response>,
  ): Promise<void> => {
    const url = urlFor(entry.file)
    if (url === null) return
    try {
      const res = await get(url)
      if (!res.ok) return
      const bytes = await res.arrayBuffer()
      const buf = await audio.decodeAudioData(bytes)
      if (!buf) return
      buffers.set(id, buf)
      characters.set(id, entry.character)
    } catch { /* absent, and that is the fallback chain doing its job */ }
  }

  const run = async (): Promise<void> => {
    if (!fetcher) return
    /*
     * The context is created here rather than lazily on first play, as
     * `audio.ts` does, because `decodeAudioData` is a method on a context and
     * there is nothing to decode into without one. The laziness that buys is
     * bought back by the unlock listener and the running-state guard.
     */
    ctx = ctxFactory()
    const audio = ctx
    if (!audio) return

    let clips: Record<string, unknown>
    try {
      const res = await fetcher(`${base}voice/manifest.json`)
      if (!res.ok) return
      const doc = await res.json() as { clips?: unknown }
      if (typeof doc !== 'object' || doc === null) return
      if (typeof doc.clips !== 'object' || doc.clips === null) return
      clips = doc.clips as Record<string, unknown>
    } catch { return }

    await Promise.all(Object.entries(clips).map(([id, raw]) => {
      const entry = entryOf(raw)
      return entry ? loadClip(id, entry, audio, fetcher) : Promise.resolve()
    }))
  }

  /**
   * The buffers that speak these ids, in order, or null if this chain cannot be
   * played faithfully.
   *
   * Null covers three different ordinary things — a clip that never decoded, a
   * numeral outside the baked range, and a splice the law forbids — and they
   * share an answer because the caller's only move is the same in all three:
   * say the whole sentence synthetically. A half-spliced sentence is the one
   * outcome worth avoiding.
   */
  const planChain = (ids: readonly string[]): AudioBuffer[] | null => {
    const out: AudioBuffer[] = []
    let character: string | null = null
    for (const id of ids) {
      const buf = buffers.get(id)
      const who = characters.get(id)
      if (!buf || who === undefined) return null
      /*
       * The splice law (voice.md §3): "slot parts and their inserts must share
       * one voice… cross-voice splices are uncanny and are forbidden". The
       * manifest records `character` on every clip precisely so this is
       * checkable at play time rather than trusted at bake time.
       */
      if (character === null) character = who
      else if (who !== character) return null
      out.push(buf)
    }
    return out.length ? out : null
  }

  /**
   * Stop whatever is playing and fire its pending `onend`.
   *
   * That last part is the whole point. `speechSynthesis.cancel()` ends the
   * in-flight utterance and its `end` event still fires, and the game leans on
   * it: `src/island/album.ts:704` speaks the pet's name and chains the species
   * inside that line's `onend`. A clip chain that were merely silenced would
   * strand every such continuation.
   *
   * `current` is detached before `fin` runs, so a handler that speaks again
   * cannot see a half-stopped chain.
   */
  const stopChain = (): void => {
    const chain = current
    if (!chain) return
    current = null
    for (const s of chain.sources) {
      try { s.onended = null; s.stop() } catch { /* already finished */ }
    }
    chain.fin()
  }

  const play = (bufs: readonly AudioBuffer[], audio: AudioContext, onend?: () => void): boolean => {
    let done = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let chain: Chain | null = null

    /*
     * The same `done` latch as `speech.ts:84`: a chain is ended by whichever of
     * the natural end, the error path, or the backstop gets there first, and a
     * stopped chain must not be able to fire twice or to recurse.
     */
    const fin = (): void => {
      if (done) return
      done = true
      if (timer !== undefined) clearTimeout(timer)
      if (chain && current === chain) current = null
      onend?.()
    }

    try {
      const sources: AudioBufferSourceNode[] = []
      let at = audio.currentTime
      let span = 0
      bufs.forEach((buf, i) => {
        const src = audio.createBufferSource()
        src.buffer = buf
        src.connect(audio.destination)
        /*
         * Scheduled against `currentTime`, not fired off the previous piece's
         * `ended` event — voice.md §6 asks for Web Audio "not `<audio>`, for
         * splice timing", and an event round trip would put a variable pause of
         * tens of milliseconds where the 120 ms breath is meant to be.
         */
        src.start(at)
        sources.push(src)
        const gap = i === bufs.length - 1 ? 0 : SLOT_GAP_MS / 1000
        at += buf.duration + gap
        span += buf.duration + gap
      })

      const last = sources[sources.length - 1]
      if (!last) return false
      last.onended = fin
      chain = { sources, fin }
      current = chain

      /*
       * Belt and braces, as `speech.ts:82-88` — but sized to this chain. The
       * manifest's `ms` is a cross-check on the bake, not the source of truth
       * at play time; the decoded buffer is what will actually be heard.
       */
      timer = setTimeout(fin, span * 1000 + BACKSTOP_MARGIN_MS)
      return true
    } catch {
      /* A scheduling failure must still release the beat, not hang it. */
      fin()
      return false
    }
  }

  /** Decoded, and awake: the next Fred line will be Oliver rather than the device. */
  const clipsReady = (): boolean => buffers.size > 0 && ctx !== null && ctx.state === 'running'

  return {
    noticeShown: () => fallback.noticeShown(),
    markNoticeShown: () => { fallback.markNoticeShown() },

    clipsReady,

    ready: () => clipsReady() || fallback.ready(),

    cancel() {
      stopChain()
      fallback.cancel()
    },

    load() {
      loading ??= run().catch(() => { /* "no clips" is a valid outcome, never a rejection */ })
      return loading
    },

    speak(txt, rate, onend) {
      /*
       * Interrupt first, both sides, on every path. `speech.ts:74` opens with a
       * bare `speechSynthesis.cancel()` and the game's pacing assumes it: a new
       * line always replaces the old one. A clip chain left running under a
       * synthetic line, or the reverse, would be two voices at once.
       */
      stopChain()

      /*
       * A rate is never Fred. It is a challenge word slowed for the rescue read
       * or a grapheme-by-grapheme help repeat (`src/challenges/build.ts:83,96`),
       * and a baked clip cannot honour one — resampling would shift his pitch.
       */
      if (rate === undefined && ctx && buffers.size > 0) {
        const ids = resolveLine(txt)
        const bufs = ids ? planChain(ids) : null
        if (bufs) {
          if (ctx.state === 'running') {
            /*
             * THE CANCEL BELONGS HERE AND NOWHERE ELSE, and it used to sit
             * above this whole block. Joe, 2 August, on the live build: *"i
             * dont get any noise in the game at the moment, no synth and no
             * bake"*. His console had the baked half entirely healthy —
             * activation true, context `running`, manifest 200, a clip
             * decoding — while `speechSynthesis` was silent with NO EVENT at
             * all: neither `onstart` nor `onerror`, which is that engine
             * wedged rather than refusing.
             *
             * `speech.ts:74` already opens `speak()` with a bare
             * `speechSynthesis.cancel()`. Hoisted above this branch, the call
             * here fired on the FALLBACK path too — so an ordinary synthetic
             * line was cancelled, handed to `fallback.speak`, cancelled a
             * second time and only then spoken. Two cancels in one tick
             * immediately before a speak is a known way to wedge Chrome.
             *
             * It is not a useless call, which is why it moved rather than
             * went: a clip taking over from a synthetic line in flight must
             * silence it, or Fred is heard twice at once. That is only ever
             * this path. A test holds both halves, because the wedge itself
             * cannot be reproduced without a browser and the SEQUENCE is the
             * whole of what broke.
             */
            fallback.cancel()
            if (play(bufs, ctx, onend)) return true
            /* Nothing started, so the line goes on to synthesis below and is
             * cancelled once more on the way in. One redundant cancel on a
             * path that has already failed to play is not the path he hit. */
          } else {
            /*
             * Asleep, so this line goes out synthetically and the resume lands
             * for the next one. Fred heard in the wrong voice beats Fred not
             * heard at all — silence here would be a regression on today.
             */
            void ctx.resume()
          }
        }
      }

      return fallback.speak(txt, rate, onend)
    },
  }
}
