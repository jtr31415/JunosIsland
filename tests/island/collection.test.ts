/**
 * Joe, 29 Jul, on the shipped build: *"one error that has just occured on the
 * shipped code. a second animal of the same type has just spawned. that must
 * not happen."*
 *
 * He is right, and this time the code was not innocent. `species.test.ts`
 * answers an EARLIER report — "two cats spawned in a row" — and answers it with
 * `makeMemoryDeck`, a short window that forbids the last five hatches. That
 * fixes clumping and nothing else: a window of five over a pack of twenty-four
 * leaves nineteen candidates on every draw, and on an island where the child
 * already owns eight, most of those nineteen are animals they already have.
 * A duplicate was therefore not a collision at all. It was the ordinary case,
 * arriving on a schedule — roughly `owned / 19` of every hatch.
 *
 * That is the difference between a shuffling rule and a COLLECTING rule. A
 * collection is not "do not repeat yourself lately", it is "do not give them
 * what they already have", and no width of window expresses it, because the
 * window measures hatches and the rule is about their island.
 *
 * So the dealer is the island's own, in `src/island/collection.ts`, and this
 * file is the proof. The end-to-end test below runs main.ts's real sequence
 * through the real `handleChallengePassed` and counts what lands on the island;
 * it fails against the memory deck with an actual duplicate, which is what
 * makes it worth having.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeCollectionDeck } from '../../src/island/collection'
import { mulberry32 } from '../../src/core/rng'
import { balance } from '../../src/island/balance'
import { SPECIES } from '../../src/island/pets'
import { createFlow, tapEgg } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { handleChallengePassed } from '../../src/island/interactions'

const MEMORY = balance.pets.speciesMemory

/** A fresh island draw, exactly as `main.ts` builds it. */
const islandDeck = (seed: number): ReturnType<typeof makeCollectionDeck> =>
  makeCollectionDeck(mulberry32(seed), SPECIES, MEMORY)

/**
 * Read pages until the egg actually hatches, holding one species throughout.
 *
 * Which is main.ts's own behaviour and not a convenience: `const species =
 * nextSpecies` runs on EVERY passed page, and the re-draw happens only on the
 * page that hatches. So the friend in the egg is fixed the moment the previous
 * one hatched, and all the pages in between read to the same animal.
 */
function hatchOnce(f: Flow, species: string, name: string): Flow {
  for (let page = 0; page < 200; page++) {
    const before = f.pets.length
    f = handleChallengePassed(tapEgg(f), { name, species })
    if (f.pets.length > before) return f
  }
  throw new Error('the egg never hatched')
}

describe('a second animal of the same type must not spawn', () => {
  it('never repeats a species while any of the pack is still unmet', () => {
    /*
     * THE REPORTED BUG, end to end, through the real state machine.
     *
     * main.ts's exact sequence — draw one ahead, hatch it, draw the next — run
     * until the child owns the whole pack. Every friend landing on their island
     * is counted, and no two of them may be the same animal.
     *
     * Six seeds, because a duplicate is a probabilistic event and one clean
     * stream would be evidence of nothing. Against the memory deck this fails
     * partway down the first seed.
     */
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const draw = islandDeck(seed)
      let flow = createFlow()
      draw.remember(flow.pets.map(p => p.species))
      let nextSpecies = draw()

      for (let i = 0; i < SPECIES.length; i++) {
        const species = nextSpecies
        flow = hatchOnce(flow, species, 'Bimo' + i)
        nextSpecies = draw()
      }

      const got = flow.pets.map(p => p.species)
      expect(got, `seed ${seed}`).toHaveLength(SPECIES.length)
      expect(new Set(got).size, `seed ${seed}: a duplicate reached their island`)
        .toBe(got.length)
      // And the collection is complete rather than merely unrepeated.
      expect([...got].sort()).toEqual([...SPECIES].sort())
    }
  })

  it('is not fooled by a reload — it primes from the pets they own', () => {
    /*
     * Nothing about the deck is persisted and nothing needs to be (PHASE3
     * -HANDOVER §6: a schema bump waits for the first `v*` tag). `flow.pets` is
     * already saved and is already the history, so the deck is primed from what
     * is on their island. Without this the bug walks straight back in through
     * the front door: close the tab owning eight animals, reopen, hatch a ninth
     * they already have.
     */
    const owned = SPECIES.slice(0, 10) as unknown as string[]
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const draw = islandDeck(seed)
      draw.remember(owned)
      const rest = Array.from({ length: SPECIES.length - owned.length }, draw)
      for (const s of rest) expect(owned, `seed ${seed}`).not.toContain(s)
      expect(new Set(rest).size, `seed ${seed}`).toBe(rest.length)
    }
  })

  it('ignores a species in the save that is no longer in the pack', () => {
    // Brief §19: nothing they own is ever lost. A save naming an animal that
    // has since been dropped must not throw on the way to the first hatch, and
    // must not eat one of the 24 slots either.
    const draw = islandDeck(11)
    expect(() => draw.remember(['animal-dodo', 'animal-cat'])).not.toThrow()
    const seq = Array.from({ length: 23 }, draw)
    expect(seq).not.toContain('animal-cat')
    expect(new Set(seq).size).toBe(23)
  })
})

describe('when they have met every animal there is', () => {
  /*
   * PB-036, Joe's standing requirement: *"i cannot run out of animal rewards."*
   * Twenty-four species and a rule that forbids repeats have an obvious
   * collision at the twenty-fifth hatch, and the wrong answers to it are worse
   * than the bug — an egg that hatches nothing, a draw that throws inside a
   * ceremony holding the exits shut, or a filter that loops looking for a
   * candidate that cannot exist.
   *
   * So the rule is explicitly conditional: no repeats WHILE THE PACK HOLDS
   * ANYONE THEY HAVE NOT MET. Once it does not, the deck falls back to exactly
   * the behaviour that shipped — a uniform draw with the short memory — so a
   * completed album keeps producing friends, with new names, and never the one
   * they saw a moment ago. What they SHOULD see at that point is a product
   * decision Joe has not made; this is the safe floor under it (JT-027).
   */
  const complete = (seed: number): ReturnType<typeof makeCollectionDeck> => {
    const draw = islandDeck(seed)
    draw.remember([...SPECIES])
    return draw
  }

  it('keeps dealing rather than starving, hanging or throwing', () => {
    const draw = complete(33)
    const seq = Array.from({ length: 5000 }, draw)
    expect(seq).toHaveLength(5000)
    for (const s of seq) expect(SPECIES).toContain(s)
    expect(new Set(seq).size).toBe(SPECIES.length)
  })

  it('still refuses the repeats they would actually notice', () => {
    const draw = complete(34)
    const seq = Array.from({ length: 20000 }, draw)
    let closest = Infinity
    const lastSeen = new Map<string, number>()
    for (let i = 0; i < seq.length; i++) {
      const s = seq[i] as string
      const at = lastSeen.get(s)
      if (at !== undefined) closest = Math.min(closest, i - at)
      lastSeen.set(s, i)
    }
    expect(closest).toBeGreaterThan(MEMORY)
  })

  it('does not quietly make any friend rarer than another', () => {
    // Brief §19 in spirit: the fallback reorders, it does not re-weight.
    const draw = complete(35)
    const tally = new Map<string, number>(SPECIES.map(s => [s, 0]))
    const n = 240000
    for (let i = 0; i < n; i++) {
      const s = draw()
      tally.set(s, (tally.get(s) as number) + 1)
    }
    const want = n / SPECIES.length
    for (const s of SPECIES) {
      expect(tally.get(s) as number, s).toBeGreaterThan(want * 0.95)
      expect(tally.get(s) as number, s).toBeLessThan(want * 1.05)
    }
  })

  it('deals for ever from a pack of one rather than hanging', () => {
    // A degenerate roster is a configuration mistake, not a reason to lock the
    // game up inside a ceremony that has already shut the exits.
    const one = makeCollectionDeck(mulberry32(2), ['animal-fox'], MEMORY)
    expect(Array.from({ length: 100 }, one).every(s => s === 'animal-fox')).toBe(true)
  })

  it('survives a window tuned wider than the pack', () => {
    const wide = makeCollectionDeck(mulberry32(3), SPECIES, 999)
    wide.remember([...SPECIES])
    const seq = Array.from({ length: 240 }, wide)
    expect(new Set(seq).size).toBe(SPECIES.length)
  })
})

/*
 * The wiring lives in main.ts, which is untested glue — the repeat offender
 * HANDOFF §5 names. Same source-level backstop as species.test.ts and
 * preload.test.ts, and for the same reason: no unit test can reach the place
 * where somebody swaps the dealer back or primes it after the first draw.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')

/** Comments stripped, so prose about the rule cannot stand in for the rule. */
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

describe('main.ts deals from the collection, not from a window', () => {
  it('uses the island dealer rather than the bare memory deck', () => {
    expect(code).toContain("import { makeCollectionDeck } from './collection'")
    expect(code).toMatch(/const drawSpecies = makeCollectionDeck\(\s*defaultRng, SPECIES,/)
    // The window survives as the fallback only, and is still tuned in
    // balance.json with everything else about pacing, never inline.
    expect(code).toContain('balance.pets.speciesMemory')
    expect(code).not.toMatch(/makeMemoryDeck<string>\(\s*defaultRng, SPECIES/)
  })

  it('primes it from their own island, before the first draw', () => {
    const primed = code.indexOf('drawSpecies.remember(flow.pets.map(p => p.species))')
    const loaded = code.indexOf('flow = loaded.flow')
    const first = code.indexOf('let nextSpecies = drawSpecies()')
    expect(loaded).toBeGreaterThan(-1)
    expect(primed, 'the collection must be primed').toBeGreaterThan(loaded)
    expect(first, 'and primed BEFORE the species is drawn').toBeGreaterThan(primed)
  })
})
