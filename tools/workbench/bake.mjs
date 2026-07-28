/**
 * Script in, Opus out, manifest updated.
 *
 * The key lives in `.env` and is read by this process. It is never sent to the
 * page and never appears in a response body — the page asks the server to
 * bake, the server holds the credential. That is the only reason this is a
 * server at all rather than a file opened from disk.
 *
 * Azure is asked for `ogg-24khz-16bit-mono-opus` DIRECTLY, so there is no
 * transcode step and no ffmpeg dependency. voice.md §3 wanted mono Opus; this
 * is that, without a build chain.
 */
import { createHash } from 'node:crypto'
import { readEnv, readJson, writeJson, writeBytes, inside } from './repo.mjs'
import { existsSync, readFileSync } from 'node:fs'

export const ENDPOINT = region => `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`
const FORMAT = 'ogg-24khz-16bit-mono-opus'

/**
 * What a clip is baked FROM, hashed.
 *
 * Script, voice, rate and pitch — change any of them and the clip on disk is
 * no longer what the script says, which is exactly what "stale" means. Casting
 * is data: change Fred in `voices.json` and every one of his clips goes stale
 * in the console without anyone remembering to mark them.
 */
export const bakeHash = (script, cast) =>
  createHash('sha256')
    .update(JSON.stringify([script.trim(), cast.voice, cast.rate, cast.pitch ?? '0%']))
    .digest('hex')
    .slice(0, 16)

/** SSML. The text is escaped; a lesson script containing `&` must not break the request. */
export function ssml(script, cast, lang = 'en-GB') {
  const text = String(script).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${cast.voice}"><prosody rate="${cast.rate}" pitch="${cast.pitch ?? '0%'}">${text}</prosody></voice></speak>`
}

/**
 * How long the clip actually is, from the file itself.
 *
 * The manifest contract is id → {file, ms} and a wrong `ms` is worse than an
 * absent one, so it is measured rather than estimated from the script. Ogg
 * granule positions are in 48kHz units regardless of the coded rate, and the
 * first page's OpusHead carries a pre-skip to subtract. Returns null rather
 * than a guess if the file is not the shape we expect.
 */
export function opusDurationMs(buf) {
  const head = buf.indexOf('OpusHead', 0, 'latin1')
  if (head === -1) return null
  const preSkip = buf.readUInt16LE(head + 10)

  let last = -1
  for (let i = buf.length - 4; i >= 0; i--) {
    if (buf[i] === 0x4f && buf[i + 1] === 0x67 && buf[i + 2] === 0x67 && buf[i + 3] === 0x53) { last = i; break }
  }
  if (last === -1) return null
  const granule = Number(buf.readBigUInt64LE(last + 6))
  return Math.max(0, Math.round((granule - preSkip) / 48))
}

export class BakeError extends Error {}

/**
 * One lesson.
 *
 * Everything that can be wrong is checked before the network call, and each
 * failure says what to do rather than what happened. "add AZURE_SPEECH_KEY to
 * .env" is a fix; a stack trace is homework.
 */
export async function bakeOne(root, lesson, voices, { fetchImpl = fetch } = {}) {
  const cast = voices.cast?.fred
  if (!cast?.voice) throw new BakeError('joe/voices.json has no voice for fred — set cast.fred.voice')
  if (!lesson.script?.trim()) throw new BakeError(`${lesson.id} has an empty script — nothing to bake`)
  if (!lesson.file) throw new BakeError(`${lesson.id} has no file field — set it to lessons/<name>.opus`)

  const env = { ...readEnv(root), ...process.env }
  const key = env.AZURE_SPEECH_KEY
  if (!key) throw new BakeError('add AZURE_SPEECH_KEY to .env (repo root) and bake again')
  const region = env.AZURE_SPEECH_REGION || voices.region || 'uksouth'

  let res
  try {
    res = await fetchImpl(ENDPOINT(region), {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'junos-island-workbench',
      },
      body: ssml(lesson.script, cast),
    })
  } catch (err) {
    throw new BakeError(`could not reach ${region}.tts.speech.microsoft.com — ${err.message}`)
  }

  if (!res.ok) {
    /* Azure's own message, verbatim. Its 401 body says whether the key or the region is wrong. */
    const body = await res.text().catch(() => '')
    throw new BakeError(`Azure ${res.status} ${res.statusText}${body ? ` — ${body.trim().slice(0, 400)}` : ''}`)
  }

  const buf = Buffer.from(await res.arrayBuffer())
  const name = lesson.file.replace(/^lessons\//, '')
  const rel = `${voices.outDir}/${name}`
  writeBytes(root, rel, buf)

  const manifest = readJson(root, voices.manifest, { schemaVersion: 1, clips: {} })
  manifest.clips ??= {}
  manifest.clips[lesson.id] = {
    file: rel,
    ms: opusDurationMs(buf),
    bytes: buf.length,
    hash: bakeHash(lesson.script, cast),
    voice: cast.voice,
    rate: cast.rate,
  }
  writeJson(root, voices.manifest, manifest)
  return manifest.clips[lesson.id]
}

/**
 * unscripted · vetted · baked · stale, for one lesson.
 *
 * `stale` beats `baked` and `vetted` beats `unscripted`, but a stale clip of a
 * script that has since gone back to draft is still stale — the clip on disk
 * does not match the script, and that is the fact the console exists to show.
 */
export function bakeState(root, lesson, voices, manifest) {
  const entry = manifest?.clips?.[lesson.id]
  const cast = voices.cast?.fred
  const onDisk = entry && existsSync(inside(root, entry.file))
  if (entry && onDisk) {
    return cast && entry.hash === bakeHash(lesson.script, cast) ? 'baked' : 'stale'
  }
  if (entry && !onDisk) return 'stale'
  return lesson.status === 'vetted' ? 'vetted' : 'unscripted'
}

export const loadManifest = (root, voices) =>
  readJson(root, voices.manifest, { schemaVersion: 1, clips: {} })

/** Used by the round-trip test to prove a written clip is readable back. */
export const readClip = (root, rel) => readFileSync(inside(root, rel))
