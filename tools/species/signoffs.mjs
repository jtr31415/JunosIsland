/**
 * Mirror Joe's sign-offs into a file the game can read.
 *
 *   node tools/species/signoffs.mjs        (or: npm run signoffs)
 *
 * WHAT IT PRODUCES. `src/island/species/signed-off.json`, of the shape
 * `{ "schemaVersion": 1, "species": [...ids] }` — every species id Joe has
 * ticked, sorted and de-duplicated, and nothing else. The same shape and the
 * same reasoning as `src/island/species/name-pins.json`, which is the
 * precedent: a committed data file with an envelope, read by one leaf module.
 *
 * WHY A GENERATED MIRROR AND NOT A READ OF HIS FILE. The truth about sign-off
 * is `joe/names-audit.json`, one record per creature, `signoff: 'ok'` when he
 * has ticked it. But `joe/` sits outside the vite root (`vite.island.config.ts`
 * roots the build at `src/island`), so it is never served and never bundled —
 * the game literally cannot open it at runtime. And the tool that maintains it
 * is a local dev server that `src/` is forbidden to name at all
 * (`tools/smoke/channel.mjs` greps `src/` for it and fails the build). So the
 * boundary has to be crossed by something that is neither: this script runs in
 * node, reads his file, and writes a plain data file into `src/`. Nothing under
 * `src/` reaches back the other way.
 *
 * WHEN IT RUNS. Twice over, on purpose. By hand with `npm run signoffs`, and
 * automatically the moment Joe's tick is saved — the workbench's `/api/save`
 * calls `regenerateSignoffs` after it writes the names audit. That second one
 * is the point of the whole file: the standing order is that a newly signed-off
 * animal joins the egg pool with no further ceremony, so his tick alone must be
 * enough to move what the game ships. `tests/island/signed-off.test.ts` holds
 * the two files against each other so a missed regeneration is loud.
 *
 * IDEMPOTENT, AND LF. Running it twice leaves the file byte-identical, and it
 * does not touch the file at all when the content has not changed — a save that
 * changes a note should not show up as a modified source file. The bytes are
 * written with `\n` endings and a trailing newline; this repo has been broken
 * by CRLF creeping into a generated file before, and the test asserts it.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The value `signoff` carries when Joe has ticked a row. */
export const SIGNED_OFF = 'ok'

/** Joe's file — the truth. Read, never written, by anything here. */
export const AUDIT = 'joe/names-audit.json'

/** The generated mirror. Committed, because the game ships it. */
export const MIRROR = 'src/island/species/signed-off.json'

/** The envelope's version, matching `name-pins.json`. */
export const SCHEMA_VERSION = 1

/**
 * The rule, as a pure function over the parsed audit. THE single statement of it.
 *
 * Exported so the test can run the same rule the generator runs rather than
 * restating it in an assertion — a restated rule is a rule that can drift, and
 * a drifting rule in this particular file would ship an animal Joe has not
 * approved or withhold one he has.
 *
 * Matched on `speciesId`, which is the registry id (`animal-tarsier`). The row's
 * `id` field is `natural/<speciesId>` and is the id of a NAME, not of a creature
 * — one animal could in principle carry a name per set — so the row id is the
 * wrong key even though today there is only ever one set. `status.ts` in the
 * workbench matches on `speciesId` for the same reason.
 *
 * Sorted lexicographically and de-duplicated: the output is a set, and giving it
 * a stable order is what makes the file diff cleanly and the generator
 * idempotent. Nothing downstream may depend on the order meaning anything.
 */
export function signedOffFrom(audit) {
  const rows = Array.isArray(audit?.names) ? audit.names : []
  const ids = new Set()
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue
    if (row.signoff !== SIGNED_OFF) continue
    const id = typeof row.speciesId === 'string' ? row.speciesId.trim() : ''
    /* A row with no species id names no animal. Never a silent empty entry. */
    if (id) ids.add(id)
  }
  return [...ids].sort()
}

/** The exact bytes of the mirror, so the writer and the test agree on format. */
export function mirrorText(species) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, species }, null, 2) + '\n'
}

/**
 * Read the audit under `root`, write the mirror under `root`.
 *
 * `root` rather than a hard-coded repo path because the workbench calls this
 * with ITS root, which is a throwaway directory under test. Nothing a test does
 * may rewrite the committed mirror.
 *
 * A missing audit yields an empty mirror rather than an error: that is the
 * honest answer — no file, no ticks, nothing ships — and it keeps the
 * throwaway-root case from throwing inside a save.
 */
export function regenerateSignoffs(root) {
  const audit = readAudit(resolve(root, AUDIT))
  const species = signedOffFrom(audit)
  const text = mirrorText(species)
  const path = resolve(root, MIRROR)
  const before = existsSync(path) ? readFileSync(path, 'utf8') : null
  if (before === text) return { path, species, changed: false }
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text, 'utf8')
  return { path, species, changed: true }
}

function readAudit(path) {
  if (!existsSync(path)) return { names: [] }
  const raw = readFileSync(path, 'utf8')
  try {
    return JSON.parse(raw)
  } catch (err) {
    /* His file, hand-edited. Say which one and what the parser objected to. */
    throw new Error(`${AUDIT} is not valid JSON: ${err.message}`)
  }
}

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/* Run directly, not merely imported. */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { species, changed } = regenerateSignoffs(REPO)
  console.log(`${MIRROR}  ${species.length} signed off${changed ? '' : ' (unchanged)'}`)
  for (const id of species) console.log('  ' + id)
  if (!species.length) {
    console.log('  (none yet — no row in the audit carries signoff: "ok")')
  }
}
