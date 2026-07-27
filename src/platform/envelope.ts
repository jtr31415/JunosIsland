/**
 * The save envelope: what wraps a child's island so we can tell whether it
 * survived the trip.
 *
 * Pure. No storage, no DOM, no clock — the caller supplies the time. Every
 * rule about whether a save is trustworthy lives here, where it can be tested
 * without a browser, and the two storage backends merely carry the result.
 *
 * Phase 3 item 1. The thing being defended against is not an attacker. It is a
 * tab killed between two writes, a quota limit reached mid-string, a browser
 * evicting a partially-flushed record — the ordinary ways a file ends up half
 * written. Nothing a child owns can be lost (brief §19), and a corrupt save
 * that silently loads as an empty island is exactly losing it.
 */

/** How the payload is shaped. Bumped whenever a migration is added. */
export const SCHEMA_VERSION = 2

export interface Envelope<T> {
  schemaVersion: number
  /**
   * Monotonic write counter, the tiebreaker between the two backends.
   *
   * Not a timestamp. Clocks go backwards — daylight saving, a corrected NTP
   * sync, a tablet whose battery died — and "newest wins" decided by a clock
   * that has just jumped back an hour picks the older save and loses an
   * afternoon's work.
   */
  rev: number
  /** FNV-1a over the canonical form of `data`. See `checksum`. */
  checksum: string
  /** Whole-document replace time. Shown to a grown-up; never used to choose. */
  updatedAt: number
  data: T
}

/**
 * JSON with object keys in a fixed order, at every depth.
 *
 * A checksum over `JSON.stringify` is a checksum over key INSERTION order, so
 * the same island serialised by two builds — or by the same build after a
 * field is moved in an interface — hashes differently and every load reports
 * corruption. Sorting makes the hash a fact about the data rather than about
 * the code that happened to write it.
 *
 * Arrays keep their order, obviously: `[grass, water]` is not `[water, grass]`.
 */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  return '{' + entries.map(([k, v]) => JSON.stringify(k) + ':' + canonical(v)).join(',') + '}'
}

/**
 * FNV-1a, 32 bits, as eight hex digits.
 *
 * Deliberately not SubtleCrypto. That is asynchronous, which would make
 * sealing a save an await inside the persistence barrier, and it is slower for
 * no benefit here: this detects truncation and bit-rot, and there is no
 * adversary to defeat — the file lives on the child's own tablet and the game
 * makes no network calls at all (brief §19).
 */
export function checksum(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    // The FNV prime, by shifts: a plain multiply overflows into a double and
    // silently stops being the algorithm.
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Wrap a payload up for storage. */
export function seal<T>(data: T, rev: number, updatedAt: number): Envelope<T> {
  return {
    schemaVersion: SCHEMA_VERSION,
    rev,
    checksum: checksum(canonical(data)),
    updatedAt,
    data,
  }
}

/** Does this envelope still hold what it was sealed with? */
export function intact(env: Envelope<unknown>): boolean {
  return env.checksum === checksum(canonical(env.data))
}

/**
 * Is this shaped like an envelope at all?
 *
 * Anything read off disk is untrusted input — hand-edited, half written, or
 * written by a build that no longer exists. A save that fails here is not an
 * error to report, it is a reason to reach for the snapshot ring.
 */
export function isEnvelope(value: unknown): value is Envelope<unknown> {
  if (!value || typeof value !== 'object') return false
  const e = value as Partial<Envelope<unknown>>
  return typeof e.schemaVersion === 'number'
    && typeof e.rev === 'number'
    && typeof e.checksum === 'string'
    && typeof e.updatedAt === 'number'
    && 'data' in e
}

/* ------------------------------------------------------------- migrations */

/** Turns a payload of version N into a payload of version N + 1. */
export type Migration = (data: Record<string, unknown>) => Record<string, unknown>

/**
 * v1 → v2. The first real one.
 *
 * v1 is what shipped through M1: the island, the pets, and a handful of
 * OPTIONAL progress fields. v2 makes those explicit and adds the answer to
 * `navigator.storage.persist()`, which item 1 requires be recorded in the save
 * so a later session can tell whether this island is living on storage the
 * browser has promised to keep.
 *
 * Note what it does NOT do: default `tilesEarned` to zero. A save written
 * before that field existed must fall back to the island's own size, or the
 * cost curve resets and a twelve-tile island prices its next tile at a single
 * sum. That rule already lives in `fromSave` and is left there rather than
 * duplicated — a migration that disagrees with the loader is worse than no
 * migration.
 */
export const migrate_v1_v2: Migration = data => ({
  ...data,
  readProgress: typeof data.readProgress === 'number' ? data.readProgress : 0,
  sumProgress: typeof data.sumProgress === 'number' ? data.sumProgress : 0,
  persistGranted: null,
})

export const MIGRATIONS: Record<number, Migration> = {
  1: migrate_v1_v2,
}

/**
 * Walk a payload up to the current version, one step at a time.
 *
 * Chained rather than special-cased, so adding v3 means writing one function
 * and adding one entry — never revisiting v1. A version we have no route from
 * is a null, which sends the caller to the snapshot ring rather than letting a
 * misread save overwrite a good one.
 */
export function migrate(
  data: Record<string, unknown>, from: number,
  to: number = SCHEMA_VERSION,
  steps: Record<number, Migration> = MIGRATIONS,
): Record<string, unknown> | null {
  // A save from the FUTURE is not ours to interpret. Down-migration would be
  // guessing at fields we have never heard of.
  if (from > to) return null
  let out = data
  for (let v = from; v < to; v++) {
    const step = steps[v]
    if (!step) return null
    out = step(out)
  }
  return out
}
