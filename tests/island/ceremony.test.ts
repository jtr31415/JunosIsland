import { describe, it, expect, vi } from 'vitest'
import { commit, ceremony } from '../../src/island/ceremony'
import type { Exits } from '../../src/island/ceremony'

/**
 * The bug class this exists to make unexpressible: a pet hatched, the ceremony
 * began, and for about two seconds the friend she had just read home existed
 * on screen and nowhere else.
 */

function exits(): Exits & { locked: boolean; locks: number; unlocks: number } {
  const state = {
    locked: false, locks: 0, unlocks: 0,
    lock() { state.locked = true; state.locks++ },
    unlock() { state.locked = false; state.unlocks++ },
  }
  return state
}

describe('commit', () => {
  it('waits for the write before handing back a receipt', async () => {
    /*
     * The whole point, and the thing main.ts was not doing: persist() was
     * `void saveIsland(...)`, so the ordering was right in the source and
     * wrong in time.
     */
    const order: string[] = []
    let release = (): void => {}
    const write = async (): Promise<void> => {
      order.push('write started')
      await new Promise<void>(r => { release = r })
      order.push('write finished')
    }

    const pending = commit({ pets: 1 }, write)
    queueMicrotask(release)
    await pending
    order.push('receipt')

    expect(order).toEqual(['write started', 'write finished', 'receipt'])
  })

  it('carries the value that was saved', async () => {
    const token = await commit({ pets: ['Bimo'] }, async () => {})
    expect(token.value).toEqual({ pets: ['Bimo'] })
  })

  it('does not produce a receipt when the write fails', async () => {
    // No token means no ceremony. A celebration must never present a fact
    // that did not reach storage.
    await expect(commit({ pets: 1 }, async () => { throw new Error('quota') }))
      .rejects.toThrow('quota')
  })
})

describe('ceremony', () => {
  it('holds the exits shut for the whole body', async () => {
    const gate = exits()
    let lockedDuringBody = false
    const token = await commit(1, async () => {})

    await ceremony(token, gate, async () => { lockedDuringBody = gate.locked })

    expect(lockedDuringBody).toBe(true)
    expect(gate.locked).toBe(false)
    expect(gate.locks).toBe(1)
    expect(gate.unlocks).toBe(1)
  })

  it('releases the exits even when the body throws', async () => {
    /*
     * The state that used to be recoverable only by reloading: locked world,
     * no overlay, nothing to tap. Whatever else goes wrong, the child must not
     * be left in it.
     */
    const gate = exits()
    const token = await commit(1, async () => {})

    await expect(ceremony(token, gate, async () => { throw new Error('mid-hatch') }))
      .rejects.toThrow('mid-hatch')
    expect(gate.locked).toBe(false)
    expect(gate.unlocks).toBe(1)
  })

  it('locks before the body runs, not alongside it', async () => {
    const order: string[] = []
    const gate: Exits = {
      lock: () => order.push('lock'),
      unlock: () => order.push('unlock'),
    }
    const token = await commit(1, async () => {})
    await ceremony(token, gate, async () => { order.push('body') })
    expect(order).toEqual(['lock', 'body', 'unlock'])
  })

  it('runs the body exactly once', async () => {
    const body = vi.fn(async () => {})
    const token = await commit(1, async () => {})
    await ceremony(token, exits(), body)
    expect(body).toHaveBeenCalledTimes(1)
  })
})

describe('the barrier, as a type', () => {
  it('cannot be called without a receipt', () => {
    /*
     * The structural half, and the reason this is not a grep test. The two
     * statements below are the real assertion, and they are checked by `tsc`
     * on every run — a stronger gate than any runtime expectation here. If
     * either ever compiles, the build fails on the unused directive.
     */

    // @ts-expect-error a ceremony with no proof of a save must not compile
    void (() => ceremony(undefined, exits(), async () => {}))

    // @ts-expect-error a hand-rolled token must not satisfy the brand
    void (() => ceremony({ value: 1 }, exits(), async () => {}))

    expect(true).toBe(true)
  })
})
