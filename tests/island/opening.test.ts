import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IDBFactory } from 'fake-indexeddb'
import { openingGate } from '../../src/island/opening'
import { loadIsland, saveIsland } from '../../src/island/save'
import { createFlow } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { createDurableStore } from '../../src/platform/durable'
import { createLocalStore } from '../../src/platform/storage'
import { openIdb } from '../../src/platform/idb'

/**
 * Brief §3: the opening plays ONCE per profile, is skippable, and is replayable
 * deliberately (now from behind the grown-ups PIN).
 *
 * Joe: *"the opening monologue fires on every reload at the moment. that needs
 * to be stopped."* And it did, on every reload, forever — because the flag was
 * written on the story's LAST line and almost nothing reaches it. Beat six hands
 * over to the child and returns; backing out of that round ends the story with
 * nothing recorded; a reload lands on whichever beat it lands on. Every one of
 * those left the profile marked "never seen".
 *
 * A REAL store here, both backends, as durable.test.ts does and for the reason
 * HANDOFF §5 gives: this project has been bitten four times by a feature that
 * was dead behind a mock that was happily asserted to have been called. What
 * matters is not that a save function ran — it is that a reload, which is a new
 * store reading the same storage, sees a profile that has been shown the story.
 */

/** localStorage, near enough. */
class MemStorage implements Storage {
  private m = new Map<string, string>()
  get length(): number { return this.m.size }
  clear(): void { this.m.clear() }
  getItem(k: string): string | null { return this.m.get(k) ?? null }
  key(i: number): string | null { return [...this.m.keys()][i] ?? null }
  removeItem(k: string): void { this.m.delete(k) }
  setItem(k: string, v: string): void { this.m.set(k, v) }
  [name: string]: unknown
}

let mem: MemStorage
let idbFactory: IDBFactory

beforeEach(() => { mem = new MemStorage(); idbFactory = new IDBFactory() })

/** What boot builds: two copies over the same storage as the last session. */
const bootStore = async (): Promise<ReturnType<typeof createDurableStore>> =>
  createDurableStore(createLocalStore(mem), { idb: await openIdb(idbFactory) })

describe('the opening is shown once per profile', () => {
  it('is claimed the instant it starts, before the write is awaited', () => {
    /*
     * Synchronous, like the revision claim in durable.put and for the same
     * reason: anything that awaits before staking the claim leaves a window in
     * which the profile has not been shown the story it is in the middle of
     * showing.
     */
    let writes = 0
    const gate = openingGate(false, () => { writes++; return new Promise(() => {}) })
    expect(gate.seen()).toBe(false)
    void gate.begin()
    expect(gate.seen()).toBe(true)
    expect(writes).toBe(1)
  })

  it('costs no second write when a grown-up replays it', () => {
    let writes = 0
    const gate = openingGate(false, async () => { writes++ })
    void gate.begin()
    void gate.begin()
    void gate.begin()
    expect(writes).toBe(1)
  })

  it('does not play again after a reload part-way through — the reported bug',
    async () => {
      /*
       * The exact sequence Joe hit. The child is asked their name, Fred starts
       * talking, and the page is reloaded somewhere in the middle of the story:
       * no pet, no tile, nothing earned, the flag's old write site unreached.
       */
      const store = await bootStore()
      let flow: Flow = createFlow()
      const gate = openingGate(false,
        () => saveIsland(store, 'juno', flow, gate.seen(), 'Juno'))

      await saveIsland(store, 'juno', flow, gate.seen(), 'Juno')   // boot's refresh()
      await gate.begin()                                           // Fred starts
      // ...and they get no further than that.

      const next = await bootStore()                               // the reload
      const loaded = await loadIsland(next, 'juno')
      expect(loaded.openingSeen).toBe(true)
      expect(loaded.childName).toBe('Juno')
      // Nothing else was disturbed: the reload is still their island.
      expect(loaded.flow.pets).toHaveLength(0)
    })

  it('still counts when they back out of the round the story hands them',
    async () => {
      /*
       * Leaving a challenge costs nothing (brief §19), so this is an ordinary
       * thing for a six-year-old to do — and it ends the story for good, since
       * dismissing clears the resume point. It must not therefore mean the
       * story was never shown.
       */
      const store = await bootStore()
      let flow: Flow = createFlow()
      const gate = openingGate(false,
        () => saveIsland(store, 'juno', flow, gate.seen(), 'Juno'))

      await gate.begin()
      flow = { ...flow, phase: 'free', challenge: null }           // they left
      await saveIsland(store, 'juno', flow, gate.seen(), 'Juno')

      const loaded = await loadIsland(await bootStore(), 'juno')
      expect(loaded.openingSeen).toBe(true)
    })

  it('a profile that has never started it still gets its story', async () => {
    // The other half of the rule, and the one it would be easy to break by
    // claiming too eagerly: a save exists, but Fred has never spoken.
    const store = await bootStore()
    await saveIsland(store, 'juno', createFlow(), false, 'Juno')
    const loaded = await loadIsland(await bootStore(), 'juno')
    expect(loaded.openingSeen).toBe(false)
  })
})

/**
 * The backstop, in the style of barrier.test.ts and for the same reason: the
 * gate cannot reach the place where someone forgets to use it, and main.ts is
 * untested glue that HANDOFF §5 names as this project's repeat offender.
 *
 * This is the test that fails against the code as it was: there, the flag was
 * recorded after the beat loop, which is the exit almost no session takes.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')

/** Comments stripped, so prose about the rule cannot stand in for the rule. */
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

/** The body of runOpening, which is where all of this has to happen. */
const runOpening = ((): string => {
  const at = code.indexOf('async function runOpening(')
  expect(at, 'runOpening must still exist').toBeGreaterThan(-1)
  const rest = code.slice(at)
  const end = rest.indexOf('\n  const beatMs')
  return end > 0 ? rest.slice(0, end) : rest
})()

/** However it is spelled, this is main.ts recording that the story has played. */
const RECORDS = /opening\.begin\(\)|openingSeen\s*=\s*true/g

describe('main.ts records the opening before it plays a beat', () => {
  it('records it once, and nowhere else in the file', () => {
    expect(runOpening.match(RECORDS) ?? []).toHaveLength(1)
    expect(code.match(RECORDS) ?? []).toHaveLength(1)
  })

  it('records it BEFORE the first beat, not after the last', () => {
    /*
     * The whole bug in one assertion. The loop is not a thing this function
     * reliably runs off the end of: beat six returns out of the middle of it,
     * and a reload can stop it anywhere. Anything recorded after it is recorded
     * on a path most sessions never take.
     */
    const record = runOpening.search(RECORDS)
    const firstBeat = runOpening.indexOf('for (let i = from;')
    expect(firstBeat, 'the beat loop must still be here').toBeGreaterThan(-1)
    expect(record).toBeGreaterThan(-1)
    expect(record).toBeLessThan(firstBeat)
  })

  it('records it before anything is awaited', () => {
    // HANDOFF §5: anything async in main.ts races live input, and the claim
    // must be staked before the first await for exactly the reason a save's
    // revision must be.
    const record = runOpening.search(RECORDS)
    const firstAwait = runOpening.indexOf('await ')
    expect(firstAwait).toBeGreaterThan(-1)
    expect(record).toBeLessThan(firstAwait)
  })

  it('starts the story only when the profile has not seen it', () => {
    // The boot's own decision, still read from the one owner of the flag.
    expect(code).toContain('if (!opening.seen()) {')
  })
})
