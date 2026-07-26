/**
 * Persistence.
 *
 * localStorage today, but the interface is ASYNC on purpose. localStorage is
 * synchronous, so the natural port returns values directly and every call site
 * then assumes synchronous reads — and retrofitting `await` into those call
 * sites later is the viral refactor that makes people bolt a backend on
 * sideways. Promises now cost nothing: this implementation resolves
 * immediately, and a network-backed store can replace it without a single call
 * site changing. See spec section 6.
 */

export const SCHEMA_VERSION = 1
const ROOT = 'petIsland.v1'
const PROFILES_KEY = `${ROOT}.profiles`

export type DocKey = 'save' | 'profileMeta'

export interface ProfileMeta { id: string; name: string; avatar: string }

export interface StoredDoc<T> {
  schemaVersion: number
  /** Whole-document replace timestamp. The difference between "sync is
   *  possible later" and "sync needs a rewrite". */
  updatedAt: number
  data: T
}

export interface SaveStore {
  get<T>(profileId: string, doc: DocKey): Promise<T | null>
  put<T>(profileId: string, doc: DocKey, value: T): Promise<void>
  list(): Promise<ProfileMeta[]>
  addProfile(p: ProfileMeta): Promise<void>
  removeProfile(id: string): Promise<void>
}

/**
 * Profile ids are opaque: today 'p' + Date.now(), later possibly a
 * server-issued user id. Nothing outside this module may parse or generate one.
 */
const docKey = (profileId: string, doc: DocKey): string => `${ROOT}.${profileId}.${doc}`

export function createLocalStore(
  storage: Storage = globalThis.localStorage,
  now: () => number = Date.now,
): SaveStore {
  const readProfiles = (): ProfileMeta[] => {
    try {
      const raw = storage.getItem(PROFILES_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed as ProfileMeta[] : []
    } catch { return [] }
  }

  const writeProfiles = (list: ProfileMeta[]): void => {
    storage.setItem(PROFILES_KEY, JSON.stringify(list))
  }

  return {
    async get<T>(profileId: string, doc: DocKey): Promise<T | null> {
      try {
        const raw = storage.getItem(docKey(profileId, doc))
        if (!raw) return null
        const parsed = JSON.parse(raw) as StoredDoc<T>
        // A document written by a newer build is not ours to interpret.
        if (parsed.schemaVersion > SCHEMA_VERSION) return null
        return parsed.data
      } catch { return null }
    },

    async put<T>(profileId: string, doc: DocKey, value: T): Promise<void> {
      const wrapped: StoredDoc<T> = {
        schemaVersion: SCHEMA_VERSION,
        updatedAt: now(),
        data: value,
      }
      storage.setItem(docKey(profileId, doc), JSON.stringify(wrapped))
    },

    async list(): Promise<ProfileMeta[]> {
      return readProfiles()
    },

    async addProfile(p: ProfileMeta): Promise<void> {
      const list = readProfiles()
      if (!list.some(x => x.id === p.id)) list.push(p)
      writeProfiles(list)
    },

    async removeProfile(id: string): Promise<void> {
      // Siblings must never affect each other's islands (brief section 18).
      writeProfiles(readProfiles().filter(p => p.id !== id))
      for (const doc of ['save', 'profileMeta'] as DocKey[]) {
        storage.removeItem(docKey(id, doc))
      }
    },
  }
}
