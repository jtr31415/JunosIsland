/**
 * The X button's other half: the child comes back to the SAME card.
 *
 * Joe, playtesting: *"there should be an x button to get back to the island
 * when through a challenge, too many accidental hits. also resume at the same
 * challenge card, otherwise kids can skip something they dont like."*
 *
 * The second sentence is the load-bearing one. A way out that re-rolled the
 * question would be a way to skip a word the child does not fancy, one tap at
 * a time — and this build's way out re-rolled it three times over, because every
 * `openRead`/`openSum` called a generator:
 *
 *   1. a different card came back;
 *   2. `generateRead` sizes its set from `history.length` (read.ts:45), so the
 *      SECOND look at the same page was permanently harder — and stayed harder
 *      for every page after it;
 *   3. each deal drew from finite word decks, so the skipped word was also
 *      spent.
 *
 * These tests are written against the real generators and the real word lists,
 * not mocks. HANDOFF §5: this project has shipped four dead features that
 * passed a suite asserting only that a mocked port was called.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createFlow, tapEgg, tapSum, askForLand, chooseTile,
  challengePassed, challengeFailed, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { dealReading, dealSum } from '../../src/island/deal'
import { createAttemptTally } from '../../src/island/attempts'
import type { AttemptEvent } from '../../src/island/attempts'
import { toSave, fromSave } from '../../src/island/save'
import { mulberry32 } from '../../src/core/rng'
import { makeDeck } from '../../src/core/decks'
import { GREEN, RED } from '../../src/core/wordlists'
import { buildPool, buildNeighbours } from '../../src/core/neighbours'
import type { ReadState } from '../../src/core/generators/read'
import type { BuildState } from '../../src/core/generators/build'
import type { SumState } from '../../src/core/generators/sums'
import { plainWord } from '../../src/core/segmentation'
import { balance, pageKind, pagesRead } from '../../src/island/balance'
import type { PageKind } from '../../src/island/balance'

/** Exactly what main.ts builds, seeded so a run is reproducible. */
function reading(seed = 7) {
  const rng = mulberry32(seed)
  const stores = {
    read: { history: [], idx: -1 } as ReadState,
    build: { history: [], idx: -1 } as BuildState,
  }
  const drawGreen = makeDeck(rng, GREEN)
  const drawRed = makeDeck(rng, RED)
  const deps = { rng, drawGreen, drawRed, neigh: buildNeighbours(buildPool()), level: 1 }
  return { stores, deps }
}

const sums = (seed = 11): { store: SumState; rng: () => number } =>
  ({ store: { history: [], idx: -1 } as SumState, rng: mulberry32(seed) })

/**
 * The kind of page to deal, having checked the mix still contains it.
 *
 * A3 moved the find/build choice out of `dealReading` and into the harness,
 * which answers to the tickboxes as well as to the mix — so these tests name
 * the kind directly rather than the page index that used to imply it. The
 * assertion stays: the mix is Joe's, and if a future one drops a kind entirely
 * these tests should say so rather than quietly stop covering it.
 */
const firstOf = (kind: PageKind): PageKind => {
  expect(balance.pages.mix, `the page mix has no "${kind}" page`).toContain(kind)
  return kind
}

/** What the game deals at a given point of an egg — the harness's own answer. */
const kindFor = (readProgress: number): PageKind =>
  pageKind(pagesRead(readProgress))

/** A flat, comparable rendering of a reading card. */
const asText = (c: ReturnType<typeof dealReading>): string =>
  c.kind === 'build'
    ? 'build:' + c.item.w + '|' + c.item.tray.join(',')
    : 'find:' + c.picks.map(p => plainWord(p.w) + '/' + p.cls).join(',')

describe('the flow holds the card the child walked away from', () => {
  it('starts holding nothing', () => {
    const f = createFlow()
    expect(f.readHeld).toBe(false)
    expect(f.sumHeld).toBe(false)
  })

  it('holds a reading card when the child leaves the round', () => {
    const f = challengeFailed(tapEgg(createFlow()))
    expect(f.readHeld).toBe(true)
    expect(f.phase).toBe('free')
    // §19: leaving still costs the child nothing.
    expect(f.readProgress).toBe(0)
    expect(f.eggPresent).toBe(true)
  })

  it('lets go of it the moment the child answers', () => {
    let f = challengeFailed(tapEgg(createFlow()))
    expect(f.readHeld).toBe(true)
    f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Bo', species: 'animal-fox' })
    expect(f.readHeld).toBe(false)
  })

  it('holds a sum the same way', () => {
    let f: Flow = createFlow()
    f = chooseTile(askForLand(f, { q: 1, r: 0 }), 'grass')
    expect(f.plot).not.toBeNull()
    f = challengeFailed(tapSum({ ...f, phase: 'free' }))
    expect(f.sumHeld).toBe(true)
    // And the plot and every sum already spent on it survive, as ever.
    expect(f.plot).not.toBeNull()
  })

  it('keeps reading and maths apart', () => {
    /*
     * Two decks, two bits. A finished sum used to be the obvious place to clear
     * "the card is held" — and it would have quietly re-rolled the word the
     * child stepped away from, which is the whole fault wearing a different hat.
     */
    let f: Flow = createFlow()
    f = challengeFailed(tapEgg(f))                       // holds a word
    f = chooseTile(askForLand(f, { q: 1, r: 0 }), 'grass')
    // The first tile costs one sum, so this both passes and finishes the plot.
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.sumHeld).toBe(false)
    expect(f.readHeld).toBe(true)
  })

  it('is not written to the save, and a reload deals fresh', () => {
    /*
     * The explicit decision, pinned so it is a decision rather than a
     * discovery. Honouring the bit across a reload would mean writing the CARD
     * into the save — a schema bump this phase is not taking — and `fromSave`
     * refuses to restore mid-challenge anyway. The threat model is a
     * six-year-old tapping X, not one killing a PWA tab to duck a word.
     */
    const held = challengeFailed(tapEgg(createFlow()))
    const save = toSave(held, true) as unknown as Record<string, unknown>
    expect(save).not.toHaveProperty('readHeld')
    expect(save).not.toHaveProperty('sumHeld')
    const back = fromSave(save as never).flow
    expect(back.readHeld).toBe(false)
    expect(back.sumHeld).toBe(false)
  })
})

describe('the same reading card comes back', () => {
  it('deals the identical word-find after an X', () => {
    const { stores, deps } = reading()
    const page = firstOf('find')

    const first = dealReading(stores, deps, page, false)
    expect(first.kind).toBe('find')

    // The child taps X. challengeFailed sets the bit; the next open passes it in.
    const again = dealReading(stores, deps, page, true)

    expect(asText(again)).toBe(asText(first))
    // The very same object, not a lucky re-draw: history[idx], untouched.
    expect(again).toEqual(first)
  })

  it('deals the identical build page after an X', () => {
    const { stores, deps } = reading(3)
    const page = firstOf('build')

    const first = dealReading(stores, deps, page, false)
    expect(first.kind).toBe('build')
    const again = dealReading(stores, deps, page, true)

    expect(asText(again)).toBe(asText(first))
  })

  it('survives leaving over and over — the skip the child must not get', () => {
    const { stores, deps } = reading(5)
    const page = firstOf('find')
    const first = asText(dealReading(stores, deps, page, false))
    for (let i = 0; i < 12; i++) {
      expect(asText(dealReading(stores, deps, page, true))).toBe(first)
    }
  })

  it('deals a NEW card once the child has actually answered', () => {
    // The mirror. Holding forever would be its own trap: one word, for ever.
    const { stores, deps } = reading(9)
    const page = firstOf('find')
    const first = asText(dealReading(stores, deps, page, false))
    dealReading(stores, deps, page, true)
    // challengePassed clears the bit.
    const next = asText(dealReading(stores, deps, page, false))
    expect(next).not.toBe(first)
  })

  it('keeps the find/build alternation exactly where it was', () => {
    /*
     * Dismissal does not touch `readProgress`, so the page index — and
     * therefore which of the two stores is consulted — is the same on the way
     * back in. If it were not, an X would let the child flip a build they
     * disliked into a find.
     */
    const { stores, deps } = reading(13)
    const build = firstOf('build')
    const a = dealReading(stores, deps, build, false)
    const b = dealReading(stores, deps, build, true)
    expect(b.kind).toBe(a.kind)
    expect(stores.read.history).toHaveLength(0)
  })
})

describe('leaving does not inflate the difficulty', () => {
  it('does not grow the word-find set behind the child\'s back', () => {
    /*
     * The costly half of the old fault. `n = min(MAX, MIN + history.length)`
     * — so under the old code a page dealt, dismissed and re-dealt five times
     * arrived with five extra words on it, and every page for the rest of the
     * game inherited the inflation.
     */
    const { stores, deps } = reading(21)
    const page = firstOf('find')

    const first = dealReading(stores, deps, page, false)
    const size = first.kind === 'find' ? first.picks.length : 0
    expect(stores.read.history).toHaveLength(1)

    for (let i = 0; i < 8; i++) dealReading(stores, deps, page, true)

    expect(stores.read.history).toHaveLength(1)
    const after = dealReading(stores, deps, page, true)
    expect(after.kind === 'find' ? after.picks.length : -1).toBe(size)

    // And the page AFTER the child finally answers is the second, not the tenth.
    const second = dealReading(stores, deps, page, false)
    expect(stores.read.history).toHaveLength(2)
    expect(second.kind === 'find' ? second.picks.length : -1).toBe(size + 1)
  })

  it('does not burn the word decks', () => {
    /*
     * `makeDeck` deals without repeating until it is exhausted, so a deal the
     * child never saw still spends the words in it. Counting draws is the only
     * way to see that from outside — the deck has no other observable.
     */
    const rng = mulberry32(31)
    let draws = 0
    const green = makeDeck(rng, GREEN)
    const red = makeDeck(rng, RED)
    const stores = {
      read: { history: [], idx: -1 } as ReadState,
      build: { history: [], idx: -1 } as BuildState,
    }
    const deps = {
      rng,
      drawGreen: () => { draws++; return green() },
      drawRed: () => { draws++; return red() },
      neigh: buildNeighbours(buildPool()),
      level: 1,
    }
    const page = firstOf('find')

    dealReading(stores, deps, page, false)
    const spent = draws
    expect(spent).toBeGreaterThan(0)

    for (let i = 0; i < 10; i++) dealReading(stores, deps, page, true)
    expect(draws).toBe(spent)
  })
})

describe('the same sum comes back', () => {
  it('deals the identical sum after an X, and history does not grow', () => {
    const { store, rng } = sums()
    const first = dealSum(store, rng, 1, 'add', false)
    expect(store.history).toHaveLength(1)

    for (let i = 0; i < 6; i++) {
      const again = dealSum(store, rng, 1, 'add', true)
      expect(again).toEqual(first)
    }
    expect(store.history).toHaveLength(1)
  })

  it('deals a new one after the child answers', () => {
    const { store, rng } = sums(17)
    dealSum(store, rng, 1, 'add', false)
    dealSum(store, rng, 1, 'add', false)
    expect(store.history).toHaveLength(2)
  })
})

/**
 * The seam nothing else can reach.
 *
 * `openRead`/`openSum` live in main.ts, which is composition glue with a
 * renderer and a world attached and is not unit-testable — and HANDOFF §5
 * names exactly this file as the four-time home of a feature that was declared,
 * read, and wired by nothing. Every test above would stay green if main.ts
 * called `generateRead` directly again, so this reads the source, in the manner
 * of tests/island/barrier.test.ts and for the same reason.
 */
describe('main.ts opens rounds through the dealer, not the generators', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')
  const code = source.split('\n')
    .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
    .join('\n')

  it('never calls a generator itself', () => {
    for (const g of ['generateRead(', 'generateBuild(', 'generateAdd(', 'generateSub(']) {
      expect(code, `${g} in main.ts re-rolls the card being held`).not.toContain(g)
    }
  })

  it('hands the flow’s own bit to the dealer', () => {
    // Passing a literal `false`, or forgetting the argument, is the whole bug
    // wearing a plausible face — so the bit has to be visibly threaded through.
    expect(code).toMatch(/dealReading\([\s\S]{0,240}state\.readHeld/)
    expect(code).toMatch(/dealSum\([^)]*state\.sumHeld\s*\)/)
  })
})

describe('the whole gesture, flow and card together', () => {
  /**
   * The sequence Joe actually described: open a round, hit X, open it again.
   * Wired the way main.ts wires it — the flow supplies the bit, `deal` reads it
   * — so a change to either side that broke the pairing shows up here.
   */
  it('gives the child the same word back across an X, then holds nothing', () => {
    const { stores, deps } = reading(41)
    let f: Flow = createFlow()

    f = tapEgg(f)
    const dealt = asText(dealReading(stores, deps, kindFor(f.readProgress), f.readHeld))

    f = challengeFailed(f)
    expect(f.phase).toBe('free')

    f = tapEgg(f)
    expect(asText(dealReading(stores, deps, kindFor(f.readProgress), f.readHeld))).toBe(dealt)
    expect(stores.read.history.length + stores.build.history.length).toBe(1)

    f = challengePassed(f, { name: 'Bo', species: 'animal-fox' })
    f = tapEgg(f)
    expect(asText(dealReading(stores, deps, kindFor(f.readProgress), f.readHeld))).not.toBe(dealt)
  })

  it('gives the child the same sum back across an X, at no cost to the plot', () => {
    const { store, rng } = sums(43)
    let f: Flow = createFlow()
    f = chooseTile(askForLand(f, { q: 1, r: 0 }), 'grass')
    // A one-sum tile would finish on the spot; take an island far enough along
    // that the plot is still standing when the child leaves.
    f = { ...f, tilesEarned: 6, sumProgress: 0 }
    expect(sumsForTile(f)).toBeGreaterThan(1)

    f = tapSum({ ...f, phase: 'free' })
    const dealt = dealSum(store, rng, 1, 'add', f.sumHeld)

    f = challengeFailed(f)
    expect(f.plot).not.toBeNull()
    expect(f.sumProgress).toBe(0)

    f = tapSum({ ...f, phase: 'free' })
    expect(dealSum(store, rng, 1, 'add', f.sumHeld)).toEqual(dealt)
    expect(store.history).toHaveLength(1)
  })
})

describe('what a paused page pays — JT-009', () => {
  /*
   * Joe's ruling, 28 Jul: *"we go with (c) nothing changes, she does the page
   * again."*
   *
   * This is the reward half of JT-008(3). The proficiency half was already built
   * by A2 — every word the child resolved was emitted as it landed — and the
   * question left open was what the PAGE pays when they leave it unfinished.
   * Reading pays by the page, so a child who finds all but the last word and
   * taps the X banks nothing toward the egg.
   *
   * The behaviour was already the code's, because `challengeFailed` never
   * touched `readProgress`. These tests exist so it is a DECISION rather than a
   * coincidence: pro-rata and resume were both live options, and the next
   * person to read `challengeFailed` should find the ruling attached to it
   * rather than infer that nobody thought about it.
   */
  it('banks nothing for the words they did find, and holds the whole page', () => {
    const { stores, deps } = reading(53)
    let f: Flow = createFlow()

    f = tapEgg(f)
    const card = dealReading(stores, deps, kindFor(f.readProgress), f.readHeld)
    expect(card.kind).toBe('find')
    const targets = card.kind === 'find' ? card.picks.length : 0
    expect(targets).toBeGreaterThan(1)

    // The child works down the page and stops one short of the end.
    const seen: AttemptEvent[] = []
    const tally = createAttemptTally(e => seen.push(e), () => 1000)
    tally.pageStarted('find')
    tally.prompted()
    for (let i = 0; i < targets - 1; i++) tally.right()

    f = challengeFailed(f)
    tally.pageEnded()

    // PROFICIENCY — JT-008(3): every word the child answered stands.
    expect(seen).toHaveLength(targets - 1)
    expect(seen.every(e => e.correct)).toBe(true)

    // REWARD — JT-009(c): the page paid nothing, because the page is not done.
    expect(f.readProgress).toBe(0)
    expect(f.eggPresent).toBe(true)

    // And they come back to the same page, whole — every word to find again.
    f = tapEgg(f)
    const again = dealReading(stores, deps, kindFor(f.readProgress), f.readHeld)
    expect(asText(again)).toBe(asText(card))
    expect(again.kind === 'find' ? again.picks.length : -1).toBe(targets)
  })

  it('pays the page in full when the child finishes it on the second visit', () => {
    /*
     * The other side of "nothing changes": the chore is a chore, not a
     * forfeit. Re-doing the page pays exactly what doing it once pays, so
     * leaving costs the child time and nothing else — which is what made (c)
     * defensible against pro-rata in the first place.
     */
    let f: Flow = createFlow()
    const paid = challengePassed(tapEgg(createFlow()), { name: 'Bo', species: 'animal-fox' })

    f = challengeFailed(tapEgg(f))
    f = challengePassed(tapEgg(f), { name: 'Bo', species: 'animal-fox' })

    expect(f.readProgress).toBe(paid.readProgress)
    expect(f.pets.length).toBe(paid.pets.length)
  })

  it('leaves the egg exactly as far off as it was — no part-items in the currency', () => {
    /*
     * Reading (a), pro-rata, is the one that would have shown up here: it
     * needed fractions of an item in a currency A7 had just re-based to whole
     * ones, and it would have moved pages-per-egg, which the month-walk pins.
     * `readProgress` staying integral across an abandonment is the cheap,
     * permanent guard against that reading creeping back in unremarked.
     */
    let f: Flow = createFlow()
    f = challengePassed(tapEgg(f), { name: 'Bo', species: 'animal-fox' })
    const banked = f.readProgress
    expect(Number.isInteger(banked)).toBe(true)

    for (let i = 0; i < 5; i++) f = challengeFailed(tapEgg({ ...f, phase: 'free' }))

    expect(f.readProgress).toBe(banked)
    expect(Number.isInteger(f.readProgress)).toBe(true)
  })
})

/*
 * ------------------------------------------------------------------------
 * THE FIND PAGE IS CAPPED — Joe, 4 August 2026: *"on the reading side make the
 * word finding 25% more rewarding. it drags on for too long."*
 *
 * A find page grows with the sitting (`generateRead`, `n = min(12, 3 + history
 * .length)`) while every reading page pays the same one item toward the egg. A
 * build page was one word for that item and a late find page was twelve, so the
 * reward per word had fallen to a twelfth of a build page's. `maxFindWords` cuts
 * the top off: same pay, a quarter less to do.
 *
 * The cap is applied to the DEALT page and never to the generator, because
 * `golden.json` pins `generateRead`'s stream. These tests are the proof of that
 * separation as much as of the cap.
 */
describe('the find page is capped, and the generator is not', () => {
  it('never deals more words than the cap, however long the sitting', () => {
    const { stores, deps } = reading(21)
    let longest = 0
    for (let page = 0; page < 40; page++) {
      const card = dealReading(stores, deps, 'find', false)
      if (card.kind !== 'find') throw new Error('asked for a find page')
      expect(card.picks.length).toBeLessThanOrEqual(balance.pages.maxFindWords)
      longest = Math.max(longest, card.picks.length)
    }
    // And it really does reach the cap, or the assertion above proves nothing.
    expect(longest).toBe(balance.pages.maxFindWords)
  })

  it('leaves the generator ramping to its own full length underneath', () => {
    /*
     * THE SEPARATION, stated. The stored page keeps every word the generator
     * drew — that history is what `MIN + history.length` ramps off and what the
     * golden pins — and only the copy handed to the child is cut. Shortening
     * the stored page would flatten the ramp: the next page would be as long as
     * this one instead of one longer.
     */
    const { stores, deps } = reading(22)
    for (let page = 0; page < 40; page++) dealReading(stores, deps, 'find', false)

    const stored = stores.read.history.map(p => p.length)
    expect(Math.max(...stored), 'the generator was capped, not the page')
      .toBeGreaterThan(balance.pages.maxFindWords)
    // The ramp is intact: it climbs one word a page until the generator's own
    // ceiling, exactly as it did before the cap existed.
    expect(stored.slice(0, 5)).toEqual([3, 4, 5, 6, 7])
  })

  it('gives the child a shorter page than the one that was generated', () => {
    const { stores, deps } = reading(23)
    for (let page = 0; page < 20; page++) dealReading(stores, deps, 'find', false)
    const card = dealReading(stores, deps, 'find', false)
    if (card.kind !== 'find') throw new Error('asked for a find page')
    const generated = stores.read.history[stores.read.idx]!
    expect(generated.length).toBeGreaterThan(card.picks.length)
    // A prefix, not a re-draw: the words she is asked for are the words the
    // generator chose, in the order it chose them.
    expect(card.picks).toEqual(generated.slice(0, card.picks.length))
  })

  it('hands back the same capped page when she walks away and returns', () => {
    // The held card must survive the cap, or leaving a page would re-roll it —
    // which is the whole thing this file exists to prevent.
    const { stores, deps } = reading(24)
    for (let page = 0; page < 15; page++) dealReading(stores, deps, 'find', false)
    const first = dealReading(stores, deps, 'find', false)
    const again = dealReading(stores, deps, 'find', true)
    expect(asText(again)).toBe(asText(first))
  })
})
