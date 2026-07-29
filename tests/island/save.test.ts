import { describe, it, expect, beforeEach } from 'vitest'
import { toSave, fromSave, loadIsland, saveIsland } from '../../src/island/save'
import { itemPay, tileCost } from '../../src/island/balance'
import { sumsForTile } from '../../src/island/flow'
import {
  createFlow, challengePassed, tapEgg, tapSum, askForLand, chooseTile, placeTile,
  pagesForEgg,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { count, tileAt } from '../../src/island/world/grid'
import { createLocalStore } from '../../src/platform/storage'
import {
  createAttainment, createHarness, LIVE_PATHS, STAGES,
} from '../../src/island/harness'

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
beforeEach(() => { mem = new MemStorage() })

/** An island with some history: a pet, and a finished water tile. */
function playedFlow(): Flow {
  let f: Flow = createFlow()
  for (let i = 0, n = pagesForEgg(f); i < n; i++) {
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Bimo', species: 'animal-fox' })
  }
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'water'), { q: 1, r: 0 })
  while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

/** An island with a plot half built: sited, some sums paid, not finished. */
function midBuildFlow(): Flow {
  let f = playedFlow()
  f = askForLand({ ...f, phase: 'free' })
  f = placeTile(chooseTile(f, 'grass'), { q: 0, r: 1 })
  f = challengePassed(tapSum({ ...f, phase: 'free' }))
  return f
}

describe('island save', () => {
  it('round-trips tiles, pets and their names', async () => {
    const store = createLocalStore(mem)
    const before = playedFlow()
    await saveIsland(store, 'p1', before, true)

    const { flow: after, openingSeen } = await loadIsland(store, 'p1')
    expect(count(after.island)).toBe(count(before.island))
    expect(tileAt(after.island, { q: 1, r: 0 })).toBe('water')
    expect(after.pets.map(p => p.name)).toEqual(['Bimo'])
    expect(after.pets[0]!.species).toBe('animal-fox')
    expect(openingSeen).toBe(true)
  })

  it('a fresh profile gets Fred\'s lonely rock and an unseen opening', async () => {
    const store = createLocalStore(mem)
    const { flow, openingSeen } = await loadIsland(store, 'nobody')
    expect(count(flow.island)).toBe(1)
    expect(flow.pets).toHaveLength(0)
    expect(openingSeen).toBe(false)
  })

  it('keeps a half-built plot across a reload, site and all', async () => {
    /*
     * Brief section 18: nothing a child owns can be lost. The plot is the
     * only record of which socket she chose and how many sums she has
     * already spent on it, so dropping it from the save quietly throws both
     * away and starts her over on the next tile.
     */
    const store = createLocalStore(mem)
    const before = midBuildFlow()
    expect(before.plot).not.toBeNull()
    expect(before.sumProgress).toBeGreaterThan(0)

    await saveIsland(store, 'p1', before, true)
    const { flow } = await loadIsland(store, 'p1')

    expect(flow.plot).toEqual(before.plot)
    expect(flow.sumProgress).toBe(before.sumProgress)
  })

  it('ignores a plot that has been corrupted rather than crashing', () => {
    const bad = { tiles: [['0,0', 'grass']] as Array<[string, 'grass']>, pets: [],
      bankedTiles: 0, openingSeen: true, plot: { at: { q: 'x' }, type: 'lava' } }
    const { flow } = fromSave(bad as never)
    expect(flow.plot).toBeNull()
  })

  it('always resumes in free play, never mid-challenge', async () => {
    // A reload must never strand the child inside a round she cannot finish
    const store = createLocalStore(mem)
    const mid = tapEgg(createFlow())
    expect(mid.phase).toBe('challenge')
    await saveIsland(store, 'p1', mid, true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.phase).toBe('free')
    expect(flow.challenge).toBeNull()
  })

  it('survives a corrupt save by starting fresh rather than crashing', async () => {
    mem.setItem('petIsland.v1.p1.save', '{not json at all')
    const store = createLocalStore(mem)
    const { flow } = await loadIsland(store, 'p1')
    expect(count(flow.island)).toBe(1)
  })

  it('ignores a save with no tiles', () => {
    const { flow } = fromSave({ tiles: [], pets: [], bankedTiles: 0, openingSeen: true })
    expect(count(flow.island)).toBe(1)
  })

  it('serialises to plain JSON with no Maps', () => {
    const save = toSave(playedFlow(), false)
    const json = JSON.stringify(save)
    expect(json).toContain('"tiles"')
    expect(JSON.parse(json).tiles.length).toBeGreaterThan(1)
  })

  it('keeps two profiles apart', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'juno', playedFlow(), true)
    await saveIsland(store, 'sam', createFlow(), false)
    const juno = await loadIsland(store, 'juno')
    const sam = await loadIsland(store, 'sam')
    expect(juno.flow.pets).toHaveLength(1)
    expect(sam.flow.pets).toHaveLength(0)
    expect(count(sam.flow.island)).toBe(1)
  })
})

describe('island save — land already earned survives visibly', () => {
  it('converts an OLD banked tile into a plot that is already paid for', () => {
    /*
     * Saves written under the previous flow banked a finished tile that had
     * never been placed. Under the new flow there is nowhere to put that, and
     * simply dropping it would take back land she had worked for.
     *
     * So it resumes in 'placing' with the work credited: she picks a type and
     * a socket, and the tile completes on siting rather than being charged
     * for a second time.
     */
    const { flow } = fromSave({
      tiles: [['0,0', 'grass']], pets: [], bankedTiles: 1, openingSeen: true,
      readProgress: 0, sumProgress: 0, tilesEarned: 1,
    })
    expect(flow.phase).toBe('placing')

    const sited = placeTile(chooseTile(flow, 'grass'), { q: 1, r: 0 })
    expect(sited.plot).toBeNull()               // finished on the spot
    expect(count(sited.island)).toBe(2)
  })

  it('resumes in free play when nothing is owed', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', playedFlow(), true)
    const { flow } = await loadIsland(store, 'p1')
    expect(flow.phase).toBe('free')
    expect(flow.plot).toBeNull()
  })
})

/**
 * A7 — a save written before the re-base holds work in the old denomination.
 *
 * One sum used to pay 1 and now pays 2, with every price doubled to match. A
 * save that records `sumProgress: 3` therefore means three sums, which is now
 * worth six units — and reading it as 3 would charge her for those sums a
 * second time. Brief §18: nothing she owns can be lost.
 */
describe('progress written under the old economy', () => {
  const oldSave = (sumProgress: number, readProgress: number) => ({
    tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
    pets: [], bankedTiles: 0, openingSeen: true,
    sumProgress, readProgress, tilesEarned: 1,
  })

  it('is re-denominated, not re-read at face value', () => {
    // No `pay` field: pre-A7, when one item paid 1.
    const { flow } = fromSave(oldSave(3, 2))
    expect(flow.sumProgress).toBe(6)      // three sums, still three sums
    expect(flow.readProgress).toBe(4)     // two pages, still two pages
  })

  it('buys the same tile it was going to buy', () => {
    /*
     * The failure in the terms that matter: she was three sums into a tile
     * that cost eight. She must still owe five, not eight.
     */
    const { flow } = fromSave(oldSave(3, 0))
    const owed = Math.ceil((sumsForTile(flow) - flow.sumProgress) / itemPay())
    expect(owed).toBe(tileCost(flow.tilesEarned + 1) / itemPay() - 3)
  })

  it('leaves a save written after the re-base alone', () => {
    const { flow } = fromSave({ ...oldSave(6, 4), pay: 2 })
    expect(flow.sumProgress).toBe(6)
    expect(flow.readProgress).toBe(4)
  })

  it('stamps the scale it wrote, so the next re-base can migrate too', () => {
    expect(toSave(playedFlow(), false).pay).toBe(itemPay())
  })
})

describe('attainment travels with the island (A5)', () => {
  /*
   * WHY THERE IS NO SCHEMA v3 HERE, though A5 is titled for one.
   *
   * `attainment` is purely ADDITIVE: a build that has never heard of it reads
   * a save containing it without complaint. Bumping the envelope to 3 would
   * change that from "an older build ignores a field" into "an older build
   * REFUSES the save" — `durable.ts:119` migrates only upward and returns null
   * downward, which sends the loader to the snapshot ring, which is the empty
   * island HANDOFF §6 names as the cost of a version. So the bump would trade
   * a lost REPORT for a lost ISLAND, and only one of those is hers.
   *
   * envelope.ts's own rule agrees: *"Bumped whenever a migration is added."*
   * There is no migration to add — the default is computed by the loader,
   * exactly the precedent `tilesEarned` set. v3 arrives the day the attainment
   * SHAPE changes breakingly, and the ladder point is free until then.
   */
  /** A save written before this field existed at all. */
  const priorSave = () => ({
    tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
    pets: [], bankedTiles: 0, openingSeen: true,
    sumProgress: 6, readProgress: 4, tilesEarned: 1,
  })

  it('writes what she has done and reads it back unchanged', () => {
    const a = createAttainment()
    const h = createHarness(a, () => Date.parse('2026-07-28T09:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt({
      kind: 'sum', index: 0, correct: true, latencyMs: 800,
      helped: false, rescued: false, at: 0,
    })

    const back = fromSave(toSave(playedFlow(), true, 'Juno', null, a)).attainment
    expect(back.sums.stages[1]?.attempts).toBe(1)
    expect(back.sums.stages[1]?.ewma).toBe(1)
    expect(back.sums.stages[1]?.latencies).toEqual([800])
    expect(back.sums.stages[1]?.sessions).toEqual([
      { date: '2026-07-28', correct: 1, total: 1 },
    ])
  })

  it('gives a save that predates it the stages the island already deals', () => {
    /*
     * The spec's migration line, corrected. Read literally — "sums 1 ticked,
     * everything else honest zeroes" — every island already in existence would
     * wake up unable to deal a reading page, so the egg could never hatch
     * again. What she is already playing is what she keeps.
     */
    const { attainment } = fromSave(priorSave())
    expect(attainment.sums.stages[1]?.ticked).toBe(true)
    expect(attainment.reading.stages[1]?.ticked).toBe(true)
    expect(attainment.building.stages[1]?.ticked).toBe(true)
  })

  it('does not hand her subtraction on the strength of a migration', () => {
    // The island has never dealt one. JT-007 is Joe ticking it himself.
    const { attainment } = fromSave(priorSave())
    for (const s of [1, 2, 3]) {
      expect(attainment.takingAway.stages[s]?.ticked).toBe(false)
    }
  })

  it('gives a fresh island honest zeroes, not invented history', () => {
    const { attainment } = fromSave(null)
    expect(attainment.sums.stages[1]?.attempts).toBe(0)
    expect(attainment.sums.stages[1]?.ewma).toBeNull()
  })

  it('survives a hand-edited save without dealing a stage that cannot render', () => {
    /*
     * Anything read off disk is untrusted input (envelope.ts). A stage id with
     * no generator behind it must not reach one, and a garbage value must not
     * take the island down with it — a corrupt save yields a fresh island, not
     * an error (save.ts header).
     */
    const wrecked = {
      ...priorSave(),
      attainment: {
        sums: { mode: 'nonsense', stages: { 1: { ticked: true, attempts: 'lots' }, 99: { ticked: true } } },
        reading: 'not an object',
        fractions: { mode: 'manual', stages: { 1: { ticked: true } } },
      },
    } as unknown as Parameters<typeof fromSave>[0]

    const { attainment } = fromSave(wrecked)
    const h = createHarness(attainment)
    expect(h.levelFor('sums')).toEqual([1])
    expect(attainment.sums.stages[99]).toBeUndefined()
    expect(attainment.sums.stages[1]?.attempts).toBe(0)
    expect(attainment.sums.mode).toBe('auto')
    expect(attainment.reading.stages[1]?.ticked).toBe(true)
    expect(Object.prototype.hasOwnProperty.call(attainment, 'fractions')).toBe(false)
  })

  it('keeps a tick a parent set, which is the whole point of persisting it', () => {
    const a = createAttainment()
    a.takingAway.stages[1]!.ticked = true
    a.takingAway.mode = 'manual'
    const { attainment } = fromSave(toSave(playedFlow(), true, 'Juno', null, a))
    expect(attainment.takingAway.stages[1]?.ticked).toBe(true)
    expect(attainment.takingAway.mode).toBe('manual')
  })

  it('does not lose the rings when they are full', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 40; i++) {
      h.recordAttempt({
        kind: 'sum', index: 0, correct: true, latencyMs: i,
        helped: false, rescued: true, at: 0,
      })
    }
    const { attainment } = fromSave(toSave(playedFlow(), true, 'Juno', null, a))
    expect(attainment.sums.stages[1]?.latencies).toHaveLength(30)
    expect(attainment.sums.stages[1]?.early).toHaveLength(10)
    expect(attainment.sums.stages[1]?.rescues).toHaveLength(10)
  })

  it('round-trips through the real store', async () => {
    const store = createLocalStore(mem)
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    await saveIsland(store, 'p1', playedFlow(), true, 'Juno', null, a)
    const loaded = await loadIsland(store, 'p1')
    expect(createHarness(loaded.attainment).levelFor('sums')).toEqual([1, 2])
  })
})

describe('onceFlags — A5\'s reserved space', () => {
  /*
   * A SIBLING OF `attainment`, not a field inside it. Everything in that
   * record is a measurement; "the ten-dot introduction has played" is a
   * presentation fact, and filing it under competence would be a category
   * error as well as rippling the `Attainment` type through a grown-ups panel
   * that has no business rendering it.
   *
   * NOTHING CONSUMES IT IN RUN A, which is what reserved space means: the save
   * carries and re-writes the fact from today so that INTRO-TEN is a string
   * Run C adds rather than a migration Run C has to write.
   */
  const base = () => ({
    tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
    pets: [], bankedTiles: 0, openingSeen: true, tilesEarned: 1,
  })

  it('is empty on an island that has never had one', () => {
    expect(fromSave(null).onceFlags).toEqual([])
    expect(fromSave(base()).onceFlags).toEqual([])
  })

  it('round-trips the ids it was given', () => {
    const back = fromSave(toSave(playedFlow(), true, 'Juno', null, undefined,
      ['INTRO-TEN']))
    expect(back.onceFlags).toEqual(['INTRO-TEN'])
  })

  it('round-trips through the real store', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', playedFlow(), true, 'Juno', null, undefined,
      ['INTRO-TEN'])
    expect((await loadIsland(store, 'p1')).onceFlags).toEqual(['INTRO-TEN'])
  })

  it('sanitises a hand-edited list rather than trusting it', () => {
    /*
     * Untrusted input like everything else read off disk. A non-string where a
     * flag id belongs must not survive to be compared against one, and a
     * duplicate must not survive at all — a list is a set that happens to be
     * ordered.
     */
    const wrecked = { ...base(), onceFlags: ['INTRO-TEN', 'INTRO-TEN', 7, null, '', { a: 1 }] }
    expect(fromSave(wrecked as never).onceFlags).toEqual(['INTRO-TEN'])
  })

  it('ignores a value that is not a list at all', () => {
    expect(fromSave({ ...base(), onceFlags: 'INTRO-TEN' } as never).onceFlags).toEqual([])
  })

  it('is bounded, so a hand-edited save cannot grow without limit', () => {
    const many = Array.from({ length: 500 }, (_, i) => `FLAG-${i}`)
    const long = 'x'.repeat(500)
    const { onceFlags } = fromSave({ ...base(), onceFlags: [long, ...many] } as never)
    expect(onceFlags).toHaveLength(64)
    expect(onceFlags).not.toContain(long)
  })
})

/**
 * FIXTURES BOTH DIRECTIONS (A5) — the honest version of the phrase.
 *
 * A5 asks for "fixtures both directions", which in an item titled "schema v3"
 * means a migration walked up and down. There is no migration: `attainment`
 * and `onceFlags` are additive and the envelope was deliberately left at 2
 * (see the note above), so a v2→v3 fixture would be a test of a function that
 * does not and should not exist.
 *
 * The honest equivalent is the property the no-bump decision actually rests
 * on, which is compatibility in both directions of TIME rather than of version
 * number:
 *
 *   - BACKWARDS: a save written by an older build — one that predates these
 *     fields entirely — loads with the right defaults instead of a blank
 *     child. The tick half is asserted above; this is the STATS half.
 *   - FORWARDS: a save written by a LATER build, carrying attainment fields,
 *     paths, stage ids and once-flags this build has never heard of, is
 *     sanitised and loaded rather than refused. This is the more important of
 *     the two, because it is the whole argument for not bumping: a bump makes
 *     an older build REFUSE the save and reach for the snapshot ring, which
 *     trades a lost report for a lost island.
 */
describe('fixtures both directions (A5)', () => {
  /** BACKWARDS: an island from before any of this existed. */
  const oldIsland = () => ({
    tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
    pets: [], bankedTiles: 0, openingSeen: true,
    sumProgress: 6, readProgress: 4, tilesEarned: 1, pay: 2,
  })

  /**
   * FORWARDS: written by a build from a run that has not happened yet.
   *
   * Unknown everywhere it could be unknown — a stat on a stage, a stage on a
   * path, a path in the record, a flag in the reserved space, and a top-level
   * field beside them all.
   */
  const futureIsland = () => ({
    ...oldIsland(),
    seasonalMood: 'autumnal',
    attainment: {
      sums: {
        mode: 'manual',
        stages: {
          1: {
            ticked: true, attempts: 12, ewma: 0.8, latencies: [900], early: [900],
            sessions: [{ date: '2026-09-01', correct: 3, total: 4 }], rescues: [],
            fluency: 'gold',
          },
          7: { ticked: true, attempts: 99 },
        },
      },
      algebra: { mode: 'auto', stages: { 1: { ticked: true, attempts: 40 } } },
    },
    onceFlags: ['INTRO-TEN', 'RUN-D-MOMENT-NOBODY-HAS-SPECCED'],
  })

  it('backwards: an old island keeps what it already deals', () => {
    const { attainment } = fromSave(oldIsland())
    expect(attainment.sums.stages[1]?.ticked).toBe(true)
    expect(attainment.reading.stages[1]?.ticked).toBe(true)
    expect(attainment.building.stages[1]?.ticked).toBe(true)
    expect(attainment.takingAway.stages[1]?.ticked).toBe(false)
  })

  it('backwards: every STAT is an honest zero, on every stage of every path', () => {
    /*
     * The correction the field notes made to A5's migration line: the zeroes
     * are the statistics, not the ticks. Nothing may be invented for work
     * nobody watched, and the sweep is over the whole table rather than one
     * sampled stage because a default that is right for `sums` and wrong for
     * `takingAway` is the kind that ships.
     */
    const { attainment } = fromSave(oldIsland())
    for (const path of LIVE_PATHS) {
      expect(attainment[path].mode).toBe('auto')
      for (const id of STAGES[path]) {
        const st = attainment[path].stages[id]
        expect(st?.attempts, `${path} ${id} attempts`).toBe(0)
        expect(st?.ewma, `${path} ${id} ewma`).toBeNull()
        expect(st?.latencies, `${path} ${id} latencies`).toEqual([])
        expect(st?.early, `${path} ${id} early`).toEqual([])
        expect(st?.sessions, `${path} ${id} sessions`).toEqual([])
        expect(st?.rescues, `${path} ${id} rescues`).toEqual([])
      }
    }
  })

  it('backwards: an old island still has no once-flags rather than a broken one', () => {
    expect(fromSave(oldIsland()).onceFlags).toEqual([])
  })

  it('forwards: a save from a later build loads instead of being refused', () => {
    /*
     * The island itself arrives intact — this is the half that matters, since
     * the alternative a schema bump would produce is not "a degraded report"
     * but "an empty island", the loader having fallen through to the snapshot
     * ring.
     */
    const { flow, attainment } = fromSave(futureIsland() as never)
    expect(count(flow.island)).toBe(1)
    expect(flow.sumProgress).toBe(6)
    expect(attainment.sums.mode).toBe('manual')
  })

  it('forwards: the measurements it does understand survive the trip', () => {
    const { attainment } = fromSave(futureIsland() as never)
    const st = attainment.sums.stages[1]
    expect(st?.attempts).toBe(12)
    expect(st?.ewma).toBe(0.8)
    expect(st?.latencies).toEqual([900])
    expect(st?.sessions).toEqual([{ date: '2026-09-01', correct: 3, total: 4 }])
  })

  it('forwards: what it does not understand cannot reach a generator', () => {
    /*
     * Sanitised, not trusted. A stage id with nothing behind it and a path
     * from a later run are both dropped at the door, because `readAttainment`
     * builds outward from the stage table rather than from the file's keys —
     * and an unknown stage that survived would eventually be handed to a
     * generator that cannot render it.
     */
    const { attainment } = fromSave(futureIsland() as never)
    expect(attainment.sums.stages[7]).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(attainment, 'algebra')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(
      attainment.sums.stages[1] ?? {}, 'fluency')).toBe(false)
    expect(createHarness(attainment).levelFor('sums')).toEqual([1])
  })

  it('forwards: a once-flag from a later run is KEPT, and written back out', () => {
    /*
     * The one place the sanitising deliberately differs from the attainment
     * record's. An unknown stage id is dangerous because something will try to
     * deal it; an unknown flag id reaches nothing at all — it is only ever
     * compared for equality. Dropping one would mean a child who ran a newer
     * build for an afternoon and came back sits through an introduction the
     * save already recorded as played, which is the exact harm a once-flag is
     * for. So it survives the read AND the next write, or the loss simply
     * happens one save later.
     */
    const loaded = fromSave(futureIsland() as never)
    expect(loaded.onceFlags)
      .toEqual(['INTRO-TEN', 'RUN-D-MOMENT-NOBODY-HAS-SPECCED'])

    const rewritten = fromSave(toSave(loaded.flow, loaded.openingSeen, 'Juno',
      null, loaded.attainment, loaded.onceFlags))
    expect(rewritten.onceFlags).toEqual(loaded.onceFlags)
  })

  it('forwards: through the real store, which is where a refusal would happen', async () => {
    /*
     * `fromSave` proves the payload is read charitably; this proves nothing
     * upstream of it says no. The envelope is untouched by A5 precisely so
     * that this path stays open in both directions.
     */
    const store = createLocalStore(mem)
    await store.put('p1', 'save', futureIsland())
    const loaded = await loadIsland(store, 'p1')
    expect(count(loaded.flow.island)).toBe(1)
    expect(loaded.attainment.sums.stages[1]?.attempts).toBe(12)
    expect(loaded.onceFlags).toContain('INTRO-TEN')
  })
})

/**
 * The frozen cost index has to survive a reload — Run B, runA.md:233.
 *
 * `honeymoonTiles` is the count of tiles bought during a honeymoon, subtracted
 * from `tilesEarned` when the next tile is priced. Losing it on load would snap
 * every remaining price up by however many tiles she was given free, which is
 * the stranding `flow.ts` refuses to allow; inventing it would hand out a
 * discount nobody granted.
 */
describe('the honeymoon index survives a reload', () => {
  /** A real island with a real honeymoon tile on it, built through the flow. */
  function honeymoonFlow(): Flow {
    let f = createFlow()
    f = askForLand({ ...f, phase: 'free' })
    f = placeTile(chooseTile(f, 'grass'), { q: 1, r: 0 })
    while (f.plot) f = challengePassed(tapSum({ ...f, phase: 'free' }), undefined, true)
    return f
  }

  it('round-trips through the real store', async () => {
    const store = createLocalStore(mem)
    const before = honeymoonFlow()
    expect(before.honeymoonTiles).toBe(1)
    await saveIsland(store, 'p1', before, true)

    const { flow: after } = await loadIsland(store, 'p1')
    expect(after.honeymoonTiles).toBe(before.honeymoonTiles)
    expect(after.tilesEarned).toBe(before.tilesEarned)
    // Stated where it is felt: the next tile costs what it cost before the save.
    expect(sumsForTile(after)).toBe(sumsForTile(before))
  })

  it('writes it beside tilesEarned', () => {
    expect(toSave(honeymoonFlow(), false).honeymoonTiles).toBe(1)
  })

  it('loads an old save without the field as 0, and prices it as it always was', () => {
    const old = {
      tiles: [['0,0', 'grass'], ['1,0', 'grass']] as Array<[string, 'grass']>,
      pets: [], bankedTiles: 0, openingSeen: true, tilesEarned: 4, pay: 2,
    }
    const { flow } = fromSave(old)
    expect(flow.honeymoonTiles).toBe(0)
    expect(sumsForTile(flow)).toBe(tileCost(5))
  })

  it('is an INDEX COUNT and is never put through the unit rescale', () => {
    /*
     * The trap this exists for. `readProgress` and `sumProgress` are in units
     * and a pre-A7 save doubles them on load. `honeymoonTiles` counts TILES, so
     * the same doubling would silently hand a child two free tiles' worth of
     * discount for every one she was actually given.
     */
    const preA7 = {
      tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
      pets: [], bankedTiles: 0, openingSeen: true,
      sumProgress: 3, tilesEarned: 4, honeymoonTiles: 2,   // no `pay`: scale ×2
    }
    const { flow } = fromSave(preA7)
    expect(flow.sumProgress).toBe(6)        // units DO rescale
    expect(flow.honeymoonTiles).toBe(2)     // tiles do NOT
  })

  it('refuses a hand-edited negative, which would make the game harder', () => {
    const meddled = {
      tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
      pets: [], bankedTiles: 0, openingSeen: true,
      tilesEarned: 4, honeymoonTiles: -3, pay: 2,
    }
    const { flow } = fromSave(meddled)
    expect(flow.honeymoonTiles).toBe(0)
    expect(sumsForTile(flow)).toBe(tileCost(5))
  })
})

describe('colour comfort — the grown-ups word-colour setting', () => {
  /*
   * The whole safety case for this feature is "default is exactly as today".
   * If any of these three drift, Juno's screen changes without Joe asking,
   * which is the one outcome the setting was built to avoid.
   */
  it('is off on a fresh island', () => {
    expect(fromSave(null).calmColours).toBe(false)
  })

  it('is off for every save written before it existed', () => {
    const before = {
      tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
      pets: [], bankedTiles: 0, openingSeen: true,
    }
    expect(fromSave(before).calmColours).toBe(false)
  })

  it('is off when nobody passes it, even on a played island', () => {
    expect(toSave(playedFlow(), true).calmColours).toBe(false)
  })

  it('survives a round trip once a grown-up turns it on', () => {
    const back = fromSave(toSave(playedFlow(), true, 'Juno', null, undefined, undefined, true))
    expect(back.calmColours).toBe(true)
  })

  it('survives an actual write and reload, not just a round trip', async () => {
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', playedFlow(), true, 'Juno', null,
      undefined, undefined, true)
    expect((await loadIsland(store, 'p1')).calmColours).toBe(true)
  })

  it('reads a hand-edited non-boolean as off rather than trusting it', () => {
    const meddled = {
      tiles: [['0,0', 'grass']] as Array<[string, 'grass']>,
      pets: [], bankedTiles: 0, openingSeen: true,
      calmColours: 'yes',
    } as unknown as Parameters<typeof fromSave>[0]
    expect(fromSave(meddled).calmColours).toBe(false)
  })
})
