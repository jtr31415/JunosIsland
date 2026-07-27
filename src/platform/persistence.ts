/**
 * Asking the browser to keep her island.
 *
 * Storage that has not been marked persistent is *best effort*: under pressure
 * a browser will evict it without asking and without telling anyone. On a
 * shared family tablet running low on space, that is a real way for a child to
 * lose months of work — and the only defence is one API call that browsers
 * grant freely to installed PWAs.
 *
 * Deliberately requested at FIRST MEANINGFUL PROGRESS rather than at boot.
 * Some browsers show a permission prompt, and a prompt on the very first
 * screen — before she has anything worth keeping — is both confusing and the
 * most likely moment for a grown-up to dismiss it. After the first friend has
 * come home there is something to protect, and the answer is recorded in the
 * save so a later session can tell what happened.
 */

export type PersistState = boolean | null

export interface PersistenceApi {
  persist?: () => Promise<boolean>
  persisted?: () => Promise<boolean>
}

/**
 * Ask once, and never let the answer stop anything.
 *
 * Returns null when the API is missing or throws — Safari has shipped
 * versions where `persist` exists and rejects, and a game that failed to boot
 * over a storage hint would be a far worse bug than the one it is guarding.
 */
export async function requestPersistence(
  api: PersistenceApi | undefined = globalThis.navigator?.storage,
): Promise<PersistState> {
  if (!api) return null
  try {
    // Already granted — installed PWAs usually are, and asking again on every
    // hatch would be noise.
    if (api.persisted) {
      const already = await api.persisted()
      if (already) return true
    }
    if (!api.persist) return null
    return await api.persist()
  } catch { return null }
}

/**
 * Should we ask yet?
 *
 * True once she owns something and we have not already got an answer. "Owns
 * something" is a friend or a tile she counted up — the first moment there is
 * anything to lose.
 */
export function shouldRequest(
  known: PersistState, pets: number, tilesEarned: number,
): boolean {
  if (known === true) return false
  return pets > 0 || tilesEarned > 0
}
