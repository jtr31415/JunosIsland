import { describe, it, expect, vi } from 'vitest'
import { requestPersistence, shouldRequest } from '../../src/platform/persistence'

/**
 * Storage that has not been marked persistent is best-effort: a browser under
 * pressure evicts it without asking and without telling anyone. On a shared
 * family tablet running low on space, that is a real way to lose months of
 * work.
 */

describe('requestPersistence', () => {
  it('asks, and reports what it was told', async () => {
    const persist = vi.fn(async () => true)
    expect(await requestPersistence({ persist })).toBe(true)
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('reports a refusal honestly rather than pretending', async () => {
    expect(await requestPersistence({ persist: async () => false })).toBe(false)
  })

  it('does not ask again when it has already been granted', async () => {
    // Installed PWAs usually already have it, and re-prompting on every hatch
    // would be noise at the worst possible moment.
    const persist = vi.fn(async () => true)
    expect(await requestPersistence({ persisted: async () => true, persist })).toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it('asks when it has NOT already been granted', async () => {
    const persist = vi.fn(async () => true)
    await requestPersistence({ persisted: async () => false, persist })
    expect(persist).toHaveBeenCalledTimes(1)
  })

  it('shrugs when the browser has no such API', async () => {
    expect(await requestPersistence(undefined)).toBeNull()
    expect(await requestPersistence({})).toBeNull()
  })

  it('shrugs when the API throws', async () => {
    /*
     * Safari has shipped versions where `persist` exists and rejects. A game
     * that failed to boot over a storage hint would be a far worse bug than
     * the one this is guarding against.
     */
    await expect(requestPersistence({
      persist: async () => { throw new Error('not allowed') },
    })).resolves.toBeNull()

    await expect(requestPersistence({
      persisted: async () => { throw new Error('nope') },
      persist: async () => true,
    })).resolves.toBeNull()
  })
})

describe('shouldRequest', () => {
  it('waits until they own something worth keeping', () => {
    // Some browsers prompt. A prompt on the opening screen — before there is
    // anything to protect — is the one most likely to be dismissed.
    expect(shouldRequest(null, 0, 0)).toBe(false)
  })

  it('asks once the first friend has come home', () => {
    expect(shouldRequest(null, 1, 0)).toBe(true)
  })

  it('asks once the first tile has been counted up', () => {
    expect(shouldRequest(null, 0, 1)).toBe(true)
  })

  it('never asks again once granted', () => {
    expect(shouldRequest(true, 5, 5)).toBe(false)
  })

  it('keeps asking after a refusal', () => {
    // A parent who dismissed the prompt in the middle of a hatch should get
    // another chance later; the answer is not final until it is yes.
    expect(shouldRequest(false, 5, 5)).toBe(true)
  })
})
