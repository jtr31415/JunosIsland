/**
 * The second copy: IndexedDB.
 *
 * localStorage is the primary because it is synchronous, universally present
 * and already proven here. IndexedDB is beside it for two things localStorage
 * cannot do: it survives a quota squeeze that evicts localStorage first, and
 * it has room for a ring of snapshots — localStorage is ~5MB total and a save
 * plus eight copies of it would be an irresponsible share of that.
 *
 * Deliberately no wrapper library. This is four operations against one object
 * store, and a dependency that ships a Promise adapter is more surface than
 * the twenty lines it replaces.
 */

const DB_NAME = 'petIsland'
const DB_VERSION = 1
/** Current documents, keyed `${profileId}/${doc}`. */
export const DOCS = 'docs'
/** The snapshot ring, keyed `${profileId}/${doc}/${sequence}`. */
export const RING = 'ring'

/** Promise wrapper for a request, so the rest reads like ordinary async code. */
function done<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('indexeddb request failed'))
  })
}

export interface IdbStore {
  get<T>(store: string, key: string): Promise<T | null>
  put<T>(store: string, key: string, value: T): Promise<void>
  remove(store: string, key: string): Promise<void>
  /** Every value whose key begins with `prefix`, oldest key first. */
  prefix<T>(store: string, prefix: string): Promise<Array<{ key: string; value: T }>>
}

/**
 * Open the database, or report honestly that we cannot.
 *
 * Returning null rather than throwing is the point: IndexedDB is unavailable
 * in private-browsing modes, blocked by some privacy settings, and absent
 * under plain jsdom. None of that may stop a child playing — the game falls
 * back to localStorage alone and simply loses the second copy.
 */
export async function openIdb(
  factory: IDBFactory | undefined = globalThis.indexedDB,
): Promise<IdbStore | null> {
  if (!factory) return null

  let db: IDBDatabase
  try {
    db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = factory.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const d = req.result
        if (!d.objectStoreNames.contains(DOCS)) d.createObjectStore(DOCS)
        if (!d.objectStoreNames.contains(RING)) d.createObjectStore(RING)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error ?? new Error('indexeddb open failed'))
      req.onblocked = () => reject(new Error('indexeddb blocked'))
    })
  } catch { return null }

  const tx = <T>(store: string, mode: IDBTransactionMode,
    run: (s: IDBObjectStore) => Promise<T>): Promise<T> =>
    run(db.transaction(store, mode).objectStore(store))

  return {
    async get<T>(store: string, key: string): Promise<T | null> {
      try {
        const value = await tx(store, 'readonly', s => done<T>(s.get(key) as IDBRequest<T>))
        return value ?? null
      } catch { return null }
    },

    async put<T>(store: string, key: string, value: T): Promise<void> {
      await tx(store, 'readwrite', s => done(s.put(value as unknown as object, key)))
    },

    async remove(store: string, key: string): Promise<void> {
      try { await tx(store, 'readwrite', s => done(s.delete(key))) } catch { /* gone already */ }
    },

    async prefix<T>(store: string, p: string): Promise<Array<{ key: string; value: T }>> {
      try {
        /*
         * Read the keys and filter here, rather than asking for a bounded
         * IDBKeyRange.
         *
         * `IDBKeyRange` is a GLOBAL, and this module deliberately takes its
         * factory as an argument so it can be pointed at a test database or
         * at nothing at all. Reaching for the global broke exactly that: with
         * a factory passed in and no global installed, every range query threw
         * and `prefix` returned an empty list — so the snapshot ring silently
         * held nothing while every write appeared to succeed.
         *
         * The scan costs nothing that matters. These stores hold one document
         * per profile and eight snapshots per document.
         */
        const keys = await tx(store, 'readonly', s => done(s.getAllKeys()))
        const values = await tx(store, 'readonly', s => done<T[]>(s.getAll() as IDBRequest<T[]>))
        return keys
          .map((k, i) => ({ key: String(k), value: values[i] as T }))
          .filter(row => row.key.startsWith(p))
      } catch { return [] }
    },
  }
}
