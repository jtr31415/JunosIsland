#!/usr/bin/env node
/**
 * Bake `voice/scripts.json` — one character at a time, on purpose.
 *
 *   npm run voice:bake -- --dry-run          # what would be baked, and why
 *   npm run voice:bake                       # bake Fred's stale/missing clips
 *   npm run voice:bake -- --force            # re-render everything of his
 *   npm run voice:bake -- --only gov.        # just the governor lines
 *
 * **The character list is never implicit.** It defaults to `fred` and nothing
 * widens it but `--character`, because the other three voices in that file are
 * ~1,700 teacher clips, a name table that has not been audited yet, and dad's
 * booth recordings which are blocked on Joe. A flag that could fire those by
 * accident is a flag that eventually will.
 *
 * Stale is the console's definition, not a new one: `bakeState` compares the
 * manifest's `hash` against `bakeHash(script, cast)`, so re-casting a voice in
 * `joe/voices.json` or rewording a line in the ledger is what makes a clip
 * stale, and only those re-render. That is what makes the placeholder casting
 * cheap — when JT-003 settles, this run costs one command.
 *
 * The Azure key is read from `.env` by `bakeOne`, in this process, and is never
 * printed. Neither is the SSML. What this prints is ids, milliseconds and bytes.
 */
import { bakeOne, bakeState, loadManifest, BakeError } from './bake.mjs'
import { scriptUnits, ScriptError, DEFAULT_SCRIPT_DIR } from './script.mjs'
import { readJson } from './repo.mjs'
import { REPO } from './seed.mjs'

const flag = (argv, name, fallback = null) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : (argv[i + 1] ?? fallback)
}

export function plan(root, argv) {
  const voices = readJson(root, 'joe/voices.json', { cast: {}, outDir: '', manifest: '' })
  const characters = String(flag(argv, 'character', 'fred')).split(',').map(s => s.trim()).filter(Boolean)
  const scriptDir = voices.scriptDir || DEFAULT_SCRIPT_DIR
  const only = flag(argv, 'only')

  let units = scriptUnits(root, { characters, scriptDir })
  if (only) units = units.filter(u => u.id.startsWith(only))

  const manifest = loadManifest(root, voices)
  const force = argv.includes('--force')
  return {
    voices, characters, units, manifest,
    todo: units.filter(u => force || bakeState(root, u, voices, manifest) !== 'baked'),
  }
}

async function main() {
  const argv = process.argv.slice(2)
  const root = REPO
  const { voices, characters, units, manifest, todo } = plan(root, argv)

  console.log(`characters : ${characters.join(', ')}`)
  for (const who of characters) {
    const c = voices.cast?.[who]
    console.log(`  ${who.padEnd(8)} ${c?.voice ?? '(uncast)'} rate ${c?.rate ?? '-'}${c?.cast === false ? '   >>> PLACEHOLDER, JT-003 is open' : ''}`)
  }
  console.log(`units      : ${units.length}   to bake: ${todo.length}   manifest: ${voices.manifest}`)

  if (argv.includes('--dry-run')) {
    for (const u of todo) console.log(`  ${bakeState(root, u, voices, manifest).padEnd(10)} ${u.id.padEnd(28)} ${JSON.stringify(u.script)}`)
    return 0
  }

  let ok = 0
  const failed = []
  for (const u of todo) {
    try {
      const clip = await bakeOne(root, u, voices)
      ok++
      console.log(`  baked ${u.id.padEnd(28)} ${String(clip.ms).padStart(5)}ms ${String(clip.bytes).padStart(6)}B  ${clip.file}`)
      if (clip.ms === null) failed.push(`${u.id}: baked but its duration could not be measured from the Opus granule`)
    } catch (err) {
      failed.push(`${u.id}: ${err instanceof BakeError || err instanceof ScriptError ? err.message : String(err?.message ?? err)}`)
      console.log(`  FAILED ${u.id}`)
    }
  }

  console.log(`\n${ok} baked, ${failed.length} failed, ${units.length - todo.length} already current.`)
  for (const f of failed) console.log(`  ! ${f}`)
  return failed.length ? 1 : 0
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('bake-script.mjs')) {
  main().then(code => { process.exitCode = code }, err => {
    console.error(String(err?.message ?? err))
    process.exitCode = 1
  })
}
