/**
 * The path jail, and every read/write the workbench is allowed to do.
 *
 * The workbench writes REPO FILES — that is the whole point of it, and it is
 * also the whole risk. A local server with an open write endpoint is a local
 * server that will happily be told to write `../../../.ssh/authorized_keys` by
 * anything that can reach localhost. So there is exactly one door: every path
 * the API touches goes through `inside()`, which resolves it and refuses
 * anything that lands outside the root.
 *
 * Resolution before comparison matters. `root + '/' + p` and then a
 * `startsWith` check passes `joe/../../etc/passwd` cheerfully; resolving
 * first is what closes it. The trailing separator matters too, or a sibling
 * directory named `JunosIslandEvil` clears a `startsWith(root)` test.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, renameSync } from 'node:fs'
import { resolve, dirname, sep } from 'node:path'

export class OutsideRepo extends Error {}

/**
 * Resolve `rel` against `root` and prove it stayed inside.
 *
 * Returns an absolute path. Throws rather than returning null, because a
 * caller that forgets to check a null is a caller that writes wherever it was
 * asked to.
 */
export function inside(root, rel) {
  const base = resolve(root)
  const full = resolve(base, rel)
  if (full !== base && !full.startsWith(base + sep)) {
    throw new OutsideRepo(`refused: ${rel} resolves outside the repo`)
  }
  return full
}

export const readText = (root, rel) => {
  const p = inside(root, rel)
  return existsSync(p) ? readFileSync(p, 'utf8') : null
}

/**
 * Write, atomically enough.
 *
 * Write-to-temp-then-rename, so a crash mid-write leaves the previous file
 * whole rather than a half-truncated `tasks.json`. Joe's queue is not
 * regenerable from anything.
 */
export function writeText(root, rel, body) {
  const p = inside(root, rel)
  mkdirSync(dirname(p), { recursive: true })
  const tmp = p + '.tmp'
  writeFileSync(tmp, body)
  renameSync(tmp, p)
  return p
}

export function writeBytes(root, rel, buf) {
  const p = inside(root, rel)
  mkdirSync(dirname(p), { recursive: true })
  const tmp = p + '.tmp'
  writeFileSync(tmp, buf)
  renameSync(tmp, p)
  return p
}

export function readJson(root, rel, fallback) {
  const raw = readText(root, rel)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw)
  } catch (err) {
    /*
     * A malformed file is Joe's file, hand-edited. Say which one and what the
     * parser objected to; never silently substitute the fallback, because the
     * fallback is empty and "my backlog vanished" is the worst possible
     * outcome of a stray comma.
     */
    throw new Error(`${rel} is not valid JSON: ${err.message}`)
  }
}

export const writeJson = (root, rel, value) =>
  writeText(root, rel, JSON.stringify(value, null, 2) + '\n')

export const listDir = (root, rel) => {
  const p = inside(root, rel)
  return existsSync(p) ? readdirSync(p) : []
}

export const exists = (root, rel) => existsSync(inside(root, rel))

/** `.env`, without a dependency. KEY=value, `#` comments, optional quotes. */
export function readEnv(root) {
  const raw = readText(root, '.env')
  const out = {}
  if (!raw) return out
  for (const line of raw.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
    if (!m || line.trimStart().startsWith('#')) continue
    out[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  return out
}
