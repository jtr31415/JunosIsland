/**
 * Hard save: two copies, a revision counter, a checksum, and eight snapshots.
 *
 * Phase 3 item 1. Presents exactly the `SaveStore` the island already talks to,
 * so nothing above this file knows durability happened — `save.ts` still calls
 * `get` and `put` and is none the wiser.
 *
 * The threat model is mundane and worth stating, because it decides every
 * choice here. Nobody is attacking a six-year-old's island. What actually
 * happens is: a tab is killed between two writes; a quota limit truncates a
 * string halfway; a browser under memory pressure evicts localStorage but not
 * IndexedDB, or the other way round. Nothing a child owns can be lost
 * (brief §19), and a save that silently loads as an empty island is the worst
 * possible way to lose it — she would not even be told.
 */
import { seal, intact, isEnvelope, migrate, SCHEMA_VERSION } from './envelope'
import type { Envelope } from './envelope'
import { DOCS, RING } from './idb'
import type { IdbStore } from './idb'
import type { DocKey, ProfileMeta, SaveStore } from './storage'

/** How many past saves to keep. Eight is a session or two of ceremonies. */
export const RING_SIZE = 8

const docPath = (profileId: string, doc: DocKey): string => `${profileId}/${doc}`

/**
 * Why a load came back the way it did — for the toast, and for the log.
 *
 * `restored` is the only one a child ever hears about, and even then only as
 * "I found your island!". She is never shown the word corrupt.
 */
export type LoadOutcome = 'fresh' | 'loaded' | 'restored' | 'empty'

export interface DurableReport {
  outcome: LoadOutcome
  /** Set when the two backends disagreed. Diagnostic only; higher rev wins. */
  divergence?: { local: number | null; idb: number | null }
  /** Set when the primary failed its checksum and a snapshot was used. */
  recoveredFrom?: number
}

export interface DurableStore extends SaveStore {
  /** What happened on the last `get` of that document. */
  lastLoad(profileId: string, doc: DocKey): DurableReport | undefined
  /** The whole envelope, for export. */
  envelope(profileId: string, doc: DocKey): Promise<Envelope<unknown> | null>
  /** Overwrite from an imported envelope, snapshotting what is there first. */
  restore(profileId: string, doc: DocKey, env: Envelope<unknown>): Promise<void>
}

/** The raw string-level backend localStorage gives us. */
export interface TextStore {
  read(key: string): string | null
  write(key: string, value: string): void
  drop(key: string): void
}

export function browserText(storage: Storage = globalThis.localStorage): TextStore {
  return {
    read: k => { try { return storage.getItem(k) } catch { return null } },
    write: (k, v) => { try { storage.setItem(k, v) } catch { /* quota; idb may still hold it */ } },
    drop: k => { try { storage.removeItem(k) } catch { /* already gone */ } },
  }
}

const parse = (raw: string | null): Envelope<unknown> | null => {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    return isEnvelope(value) ? value : null
  } catch { return null }
}

/**
 * Bring a payload up to the current schema, or reject it.
 *
 * Separate from the checksum test on purpose: a save can be perfectly intact
 * and still be unreadable because it came from a newer build. Both answers
 * lead to the ring, but they are different facts and the log says which.
 */
function usable(env: Envelope<unknown>): Envelope<unknown> | null {
  if (!intact(env)) return null
  if (env.schemaVersion === SCHEMA_VERSION) return env
  if (!env.data || typeof env.data !== 'object') return null
  const moved = migrate(env.data as Record<string, unknown>, env.schemaVersion)
  return moved === null ? null : { ...env, schemaVersion: SCHEMA_VERSION, data: moved }
}

export interface DurableOptions {
  text?: TextStore
  idb?: IdbStore | null
  now?: () => number
  /** Called with anything a grown-up might want to know. Never the child. */
  log?: (message: string, detail?: unknown) => void
  root?: string
}

/**
 * Compose the two backends into one store.
 *
 * `idb` may be null — private browsing, a blocked database, plain jsdom. The
 * game must still be playable with one copy, so every IndexedDB path here is
 * best-effort and none of them can fail a save.
 */
export function createDurableStore(
  profiles: Pick<SaveStore, 'list' | 'addProfile' | 'removeProfile'>,
  options: DurableOptions = {},
): DurableStore {
  const {
    text = browserText(),
    idb = null,
    now = Date.now,
    log = () => {},
    root = 'petIsland.v1',
  } = options

  const localKey = (profileId: string, doc: DocKey): string =>
    `${root}.${profileId}.${doc}`

  const reports = new Map<string, DurableReport>()
  /** Highest rev seen per document, so writes keep climbing within a session. */
  const revs = new Map<string, number>()

  async function readRing(profileId: string, doc: DocKey): Promise<Envelope<unknown>[]> {
    if (!idb) return []
    const rows = await idb.prefix<Envelope<unknown>>(RING, `${docPath(profileId, doc)}/`)
    return rows
      .map(r => r.value)
      .filter(isEnvelope)
      .sort((a, b) => b.rev - a.rev)           // newest first
  }

  async function appendRing(
    profileId: string, doc: DocKey, env: Envelope<unknown>,
  ): Promise<void> {
    if (!idb) return
    const base = `${docPath(profileId, doc)}/`
    /*
     * Zero-padded so the key order IS the revision order. Unpadded, "10" sorts
     * before "9" and the ring evicts the wrong end — quietly keeping the eight
     * oldest saves instead of the eight newest.
     */
    await idb.put(RING, base + String(env.rev).padStart(12, '0'), env)
    const rows = await idb.prefix<Envelope<unknown>>(RING, base)
    const stale = rows.map(r => r.key).sort().slice(0, Math.max(0, rows.length - RING_SIZE))
    for (const key of stale) await idb.remove(RING, key)
  }

  async function write(
    profileId: string, doc: DocKey, env: Envelope<unknown>,
  ): Promise<void> {
    /*
     * Both copies, then the ring. IndexedDB first: it is the one that survives
     * a quota squeeze, and if localStorage is going to throw we would rather
     * already have the durable copy down.
     */
    if (idb) {
      try { await idb.put(DOCS, docPath(profileId, doc), env) } catch (e) { log('idb write failed', e) }
    }
    text.write(localKey(profileId, doc), JSON.stringify(env))
    await appendRing(profileId, doc, env)
    revs.set(docPath(profileId, doc), env.rev)
  }

  return {
    async get<T>(profileId: string, doc: DocKey): Promise<T | null> {
      const path = docPath(profileId, doc)
      const local = parse(text.read(localKey(profileId, doc)))
      const remote = idb ? await idb.get<Envelope<unknown>>(DOCS, path) : null
      const fromIdb = isEnvelope(remote) ? remote : null

      const report: DurableReport = { outcome: 'fresh' }
      if (local && fromIdb && local.rev !== fromIdb.rev) {
        report.divergence = { local: local.rev, idb: fromIdb.rev }
        log('save copies diverged; taking the higher revision', report.divergence)
      }

      // Highest revision wins, and only then is it checked. A newer save that
      // fails its checksum must not silently lose to an older intact one
      // without that being recorded.
      const ordered = [local, fromIdb]
        .filter((e): e is Envelope<unknown> => e !== null)
        .sort((a, b) => b.rev - a.rev)

      let chosen: Envelope<unknown> | null = null
      for (const candidate of ordered) {
        const ok = usable(candidate)
        if (ok) { chosen = ok; break }
        log('a save copy failed verification', { rev: candidate.rev })
      }

      if (!chosen && ordered.length > 0) {
        // Both copies unusable. This is precisely what the ring is for.
        for (const snapshot of await readRing(profileId, doc)) {
          const ok = usable(snapshot)
          if (ok) {
            chosen = ok
            report.outcome = 'restored'
            report.recoveredFrom = snapshot.rev
            log('restored from a snapshot', { rev: snapshot.rev })
            break
          }
        }
        if (!chosen) { report.outcome = 'empty'; log('no usable save or snapshot') }
      }

      if (chosen && report.outcome === 'fresh') report.outcome = 'loaded'
      reports.set(path, report)
      if (chosen) revs.set(path, Math.max(chosen.rev, revs.get(path) ?? 0))
      return chosen ? (chosen.data as T) : null
    },

    async put<T>(profileId: string, doc: DocKey, value: T): Promise<void> {
      const path = docPath(profileId, doc)
      /*
       * The revision climbs from the highest we have ever seen for this
       * document, not from a clock and not from whatever we happen to have
       * read. Clocks go backwards; a read that failed would restart the count
       * and make an old save look newer than the one replacing it.
       */
      const next = (revs.get(path) ?? 0) + 1
      await write(profileId, doc, seal(value, next, now()))
    },

    lastLoad: (profileId, doc) => reports.get(docPath(profileId, doc)),

    async envelope(profileId, doc) {
      const local = parse(text.read(localKey(profileId, doc)))
      if (local) return local
      const remote = idb ? await idb.get<Envelope<unknown>>(DOCS, docPath(profileId, doc)) : null
      return isEnvelope(remote) ? remote : null
    },

    async restore(profileId, doc, env) {
      /*
       * Snapshot what is already there BEFORE overwriting it. An import is the
       * one moment a grown-up can destroy an island on purpose, and being able
       * to undo a mistaken one is the difference between a feature and a trap.
       */
      const path = docPath(profileId, doc)
      const current = await this.envelope(profileId, doc)
      if (current) await appendRing(profileId, doc, current)
      const next = Math.max(revs.get(path) ?? 0, current?.rev ?? 0, env.rev) + 1
      await write(profileId, doc, seal(env.data, next, now()))
    },

    list: () => profiles.list(),
    addProfile: (p: ProfileMeta) => profiles.addProfile(p),

    async removeProfile(id: string) {
      await profiles.removeProfile(id)
      for (const doc of ['save', 'profileMeta'] as DocKey[]) {
        text.drop(localKey(id, doc))
        if (idb) {
          await idb.remove(DOCS, docPath(id, doc))
          for (const row of await idb.prefix(RING, `${docPath(id, doc)}/`)) {
            await idb.remove(RING, row.key)
          }
        }
        reports.delete(docPath(id, doc))
        revs.delete(docPath(id, doc))
      }
    },
  }
}
