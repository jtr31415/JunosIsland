/**
 * Backup to a file, and back again.
 *
 * The only route out of the device. Brief §19 permits no accounts and no
 * network calls beyond static hosting, so a file the grown-up keeps IS the
 * off-device copy — the difference between a lost tablet costing an afternoon
 * and costing everything she has built.
 *
 * Pure enough to test: the naming, the parsing and the summary are functions
 * of their input, and only `download` and `pickFile` touch the DOM.
 */
import { isEnvelope } from './envelope'
import type { Envelope } from './envelope'

/** What a grown-up is shown before an import overwrites anything. */
export interface BackupSummary {
  name: string
  savedAt: string
  pets: number
}

/**
 * `pet-island-save-<name>-<date>.json`, safe on every filesystem.
 *
 * The child's name is in the filename because a parent with two children needs
 * to tell two backups apart at a glance, and this is a local file rather than
 * anything transmitted. Everything outside a-z, 0-9 and dashes goes, so a name
 * with an apostrophe or an accent cannot produce a file the OS refuses.
 */
export function backupFilename(childName: string, when: Date): string {
  const safe = (childName || 'island').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'island'
  const date = [
    when.getFullYear(),
    String(when.getMonth() + 1).padStart(2, '0'),
    String(when.getDate()).padStart(2, '0'),
  ].join('-')
  return `pet-island-save-${safe}-${date}.json`
}

/**
 * Read a file a grown-up chose, and refuse anything that is not one of ours.
 *
 * Returns null rather than throwing, for everything: the wrong file picked by
 * mistake, a truncated download, a JSON file from some other program. An
 * import is the one moment a parent can destroy an island on purpose, so the
 * failure mode has to be "nothing happened", never a half-applied save.
 */
export function readBackup(text: string): Envelope<unknown> | null {
  try {
    const value: unknown = JSON.parse(text)
    return isEnvelope(value) ? value : null
  } catch { return null }
}

/** What to show before overwriting: whose island, when, and how many friends. */
export function summarise(env: Envelope<unknown>): BackupSummary {
  const data = (env.data ?? {}) as { childName?: unknown; pets?: unknown }
  return {
    name: typeof data.childName === 'string' && data.childName ? data.childName : 'unnamed',
    savedAt: new Date(env.updatedAt).toLocaleString('en-GB'),
    pets: Array.isArray(data.pets) ? data.pets.length : 0,
  }
}

/** The sentence the grown-up confirms. Plain, and specific about the cost. */
export function confirmText(incoming: BackupSummary, current: BackupSummary): string {
  return [
    `Restore ${incoming.name}'s island?`,
    '',
    `Backup:  ${incoming.pets} friend${incoming.pets === 1 ? '' : 's'}, saved ${incoming.savedAt}`,
    `Now:     ${current.pets} friend${current.pets === 1 ? '' : 's'}`,
    '',
    'The island on this device will be replaced.',
  ].join('\n')
}

/** Hand a file to the browser's downloader. */
export function download(filename: string, text: string, doc: Document = document): void {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = doc.createElement('a')
  a.href = url
  a.download = filename
  doc.body.append(a)
  a.click()
  a.remove()
  // Freed on the next turn: revoking synchronously can beat the click in
  // some browsers and produce an empty file.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Ask for a file, resolving null if the grown-up changes their mind. */
export function pickFile(doc: Document = document): Promise<string | null> {
  return new Promise(resolve => {
    const input = doc.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      file.text().then(resolve).catch(() => resolve(null))
    }
    // No 'cancel' event in older browsers; the promise simply never settles,
    // which is correct — nothing should happen if nothing was chosen.
    input.click()
  })
}
