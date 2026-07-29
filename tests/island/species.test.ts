/**
 * @vitest-environment jsdom
 *
 * Joe, from playtesting: *"investigate: two cats spawned in a row."*
 *
 * There was no fault to find. `drawSpecies` picked uniformly from the 24
 * species and remembered nothing, so P(the next friend is the last friend) was
 * 1/24 — and over a collection of any size that is not rare at all. Two in a
 * row is the arithmetic working. It is also, to a six-year-old who has just
 * read a whole egg's worth of words, the game telling her it did not count.
 *
 * So the bug is real and the code was correct, which is the ordinary state of
 * affairs for randomness shown to a person.
 *
 * The fix is `makeMemoryDeck` — the word lists' `makeDeck` idea with a SHORT
 * window instead of the whole pack. `tests/core/decks.test.ts` proves the
 * dealer; this file proves the ISLAND uses it, at the island's own numbers, and
 * that fixing it did not undo the preload that landed hours earlier.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeMemoryDeck } from '../../src/core/decks'
import { mulberry32 } from '../../src/core/rng'
import { balance } from '../../src/island/balance'
import { SPECIES } from '../../src/island/pets'

const MEMORY = balance.pets.speciesMemory

/**
 * The window, at the island's own numbers.
 *
 * This WAS the island's whole draw. Since 29 Jul it is the fallback inside
 * `makeCollectionDeck` — the branch that runs once she has met all 24 — so
 * every property below is still a property of the shipped game, and is the
 * only thing standing between a completed album and the clumping that Joe's
 * "two cats in a row" report was about. `collection.test.ts` owns the rule that
 * runs before then.
 */
const islandDeck = (seed: number): ReturnType<typeof makeMemoryDeck<string>> =>
  makeMemoryDeck<string>(mulberry32(seed), SPECIES, MEMORY)

describe('the species she meets next', () => {
  it('is chosen from a pack big enough for a window to be worth having', () => {
    expect(SPECIES).toHaveLength(24)
    expect(MEMORY).toBeGreaterThan(0)
    // Strictly fewer than the pack, or the deck starves and the draw is a rota.
    expect(MEMORY).toBeLessThan(SPECIES.length)
  })

  it('never repeats inside the window — over 240,000 hatches', () => {
    /*
     * The statistical claim, at the game's real numbers and stated as a
     * property rather than as one sampled sequence. 240,000 hatches is more
     * than she will see in a childhood; four seeds, because one lucky stream
     * is not evidence.
     *
     * Seeded, so this is a large DETERMINISTIC sample: it cannot flake, and if
     * it ever fails it has found a real hole rather than a bad afternoon.
     */
    for (const seed of [1, 2, 3, 4]) {
      const draw = islandDeck(seed)
      const lastSeen = new Map<string, number>()
      let closest = Infinity
      for (let i = 0; i < 60000; i++) {
        const s = draw()
        const at = lastSeen.get(s)
        if (at !== undefined) closest = Math.min(closest, i - at)
        lastSeen.set(s, i)
      }
      expect(closest, `seed ${seed}`).toBeGreaterThan(MEMORY)
      // And exactly at the edge, so the window is the size it claims to be.
      expect(closest, `seed ${seed}`).toBe(MEMORY + 1)
    }
  })

  it('would fail loudly against the draw it replaced', () => {
    /*
     * The control. The old line was `SPECIES[ri(defaultRng, SPECIES.length)]`;
     * a memory of nought reproduces it exactly. If this ever comes out at zero,
     * the test above is measuring nothing.
     */
    const flat = makeMemoryDeck<string>(mulberry32(1), SPECIES, 0)
    const seq = Array.from({ length: 60000 }, flat)
    const backToBack = seq.filter((s, i) => i > 0 && s === seq[i - 1]).length
    expect(backToBack).toBeGreaterThan(1500)          // measured: ~2,500
    expect(backToBack / seq.length).toBeCloseTo(1 / 24, 2)
  })

  it('still gives every animal an equal share of the hatches', () => {
    /*
     * Brief §19 in spirit: the window must not quietly make any friend rarer
     * than another. It reorders; it does not re-weight.
     */
    const draw = islandDeck(9)
    const counts = new Map<string, number>(SPECIES.map(s => [s, 0]))
    const n = 240000
    for (let i = 0; i < n; i++) {
      const s = draw()
      counts.set(s, (counts.get(s) as number) + 1)
    }
    const want = n / SPECIES.length
    for (const s of SPECIES) {
      expect(counts.get(s) as number, s).toBeGreaterThan(want * 0.95)
      expect(counts.get(s) as number, s).toBeLessThan(want * 1.05)
    }
  })

  it('lets a favourite come back the same afternoon', () => {
    /*
     * Why a window and not the whole pack. A full deck would put every animal
     * exactly one lap away; here a fifth of returns land within twelve hatches,
     * so the cat she loved can turn up again while she still cares.
     */
    const draw = islandDeck(21)
    const lastSeen = new Map<string, number>()
    const gaps: number[] = []
    for (let i = 0; i < 60000; i++) {
      const s = draw()
      const at = lastSeen.get(s)
      if (at !== undefined) gaps.push(i - at)
      lastSeen.set(s, i)
    }
    const soon = gaps.filter(g => g <= 12).length / gaps.length
    expect(soon).toBeGreaterThan(0.25)                // measured: ~0.31
    // And no animal is pushed further away on average than chance ever put it.
    expect(gaps.reduce((a, b) => a + b, 0) / gaps.length).toBeLessThan(26)
  })
})

describe('when she already owns all 24', () => {
  it('deals on, because the window knows nothing about ownership', () => {
    /*
     * A completed collection is a real state and the one that breaks a naive
     * "deal the ones she has not got" rule outright — there are none left. The
     * window is about the last few HATCHES rather than about what is on her
     * island, which is exactly why it is the right thing to fall back TO: 19 of
     * the 24 stay eligible on every draw, for ever, so PB-036 holds and an egg
     * always has a friend in it.
     *
     * Read the other way round, this is also why the window was the wrong rule
     * to have had FIRST — see `collection.test.ts`.
     */
    const draw = islandDeck(33)
    draw.remember([...SPECIES])              // every animal, most recent last
    const seq = Array.from({ length: 5000 }, draw)
    expect(seq).toHaveLength(5000)
    expect(new Set(seq).size).toBe(24)
    // Only the last MEMORY of that history can be blocked, never all of them.
    const blocked = SPECIES.slice(SPECIES.length - MEMORY)
    expect(blocked).not.toContain(seq[0])
    expect(seq.filter((s, i) => i > 0 && s === seq[i - 1])).toHaveLength(0)
  })

  it('does not starve even if the window is widened to the whole pack', () => {
    // A tuning mistake in balance.json must degrade to a rota, not to a hang.
    const wide = makeMemoryDeck<string>(mulberry32(2), SPECIES, 999)
    const seq = Array.from({ length: 240 }, wide)
    expect(new Set(seq).size).toBe(24)
  })
})

describe('the memory survives a reload without touching the save', () => {
  it('is primed from the pets she owns, newest last', () => {
    /*
     * `drawSpecies` state is NOT persisted, and deliberately is not: a save
     * schema bump waits for the first `v*` tag (PHASE3-HANDOVER §6). It does not
     * need to be. `flow.pets` is already saved, already in the order she read
     * them home, and is therefore the history — so the deck is primed from what
     * she owns and the window straddles the reload for free.
     *
     * Without this, the reported bug returns by another door: close the tab
     * after a cat, reopen, and the fresh deck may hand her a cat.
     */
    const owned = ['animal-cat', 'animal-dog', 'animal-fox', 'animal-bee', 'animal-cow']
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const draw = islandDeck(seed)
      draw.remember(owned)
      expect(owned, `seed ${seed}`).not.toContain(draw())
    }
  })

  it('keeps only the last few of a long collection', () => {
    // She may have fifty pets. Priming must not blank the pack.
    const many = Array.from({ length: 50 }, (_, i) => SPECIES[i % 24] as string)
    const draw = islandDeck(5)
    draw.remember(many)
    const seq = Array.from({ length: 2400 }, draw)
    expect(new Set(seq).size).toBe(24)
    expect(many.slice(-MEMORY)).not.toContain(seq[0])
  })

  it('shrugs off a species that is no longer in the pack', () => {
    // Brief §19: nothing she owns can be lost. A save naming an animal that has
    // since been dropped must not throw on the way to the first hatch.
    const draw = islandDeck(6)
    expect(() => draw.remember(['animal-dodo', 'animal-cat'])).not.toThrow()
    expect(draw()).not.toBe('animal-cat')
  })
})

/*
 * The wiring itself lives in main.ts, which is untested glue — the repeat
 * offender HANDOFF §5 names. Same source-level backstop as preload.test.ts,
 * opening.test.ts and barrier.test.ts, and for the same reason: no unit test
 * can reach the place where somebody re-rolls the species one line too late.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')

/** Comments stripped, so prose about the rule cannot stand in for the rule. */
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

describe('main.ts draws the species with a memory', () => {
  it('uses one named dealer rather than a second mechanism', () => {
    /*
     * The dealer moved on 29 Jul. `makeMemoryDeck` was the whole rule; it is
     * now the FALLBACK inside `makeCollectionDeck`, for the completed-album
     * case only — see `collection.test.ts` for the report that moved it and
     * `src/island/collection.ts` for why a wider window was not the answer.
     * What this file still guards is unchanged: one dealer, built from the
     * island's own numbers, never a second mechanism inline.
     */
    expect(code).toContain("import { makeCollectionDeck } from './collection'")
    expect(code).toMatch(/const drawSpecies = makeCollectionDeck\(\s*defaultRng, SPECIES,/)
    // Tuned in balance.json with everything else about pacing, never inline.
    expect(code).toContain('balance.pets.speciesMemory')
  })

  it('primes the memory from her own pets, before the first draw', () => {
    const primed = code.indexOf('drawSpecies.remember(flow.pets.map(p => p.species))')
    const loaded = code.indexOf('flow = loaded.flow')
    const first = code.indexOf('let nextSpecies = drawSpecies()')
    expect(loaded).toBeGreaterThan(-1)
    expect(primed, 'the memory must be primed').toBeGreaterThan(loaded)
    expect(first, 'and primed BEFORE the species is drawn').toBeGreaterThan(primed)
  })

  it('has no bare uniform pick left anywhere', () => {
    // The line this replaced. `ri` is not imported here any more either.
    expect(code).not.toMatch(/SPECIES\s*\[\s*ri\(/)
  })
})

describe('the friend who is warmed is the friend who hatches', () => {
  /*
   * The property the preload bought — 569.9ms cold down to 0.2ms — and the one
   * a remembered draw could silently undo. If the deck were consulted again at
   * hatch time, `pets.warm` would have fetched a DIFFERENT animal and the
   * plinth would be empty exactly as before, with every test still green.
   *
   * Two proofs, and they are different in kind. The first pins main.ts's own
   * text: there is no way to draw a species that is not immediately seated in
   * `nextSpecies`. The second runs the sequence main.ts is thereby pinned to,
   * with a real deck, and checks the promise end to end.
   */
  const draws = code.match(/[A-Za-z0-9_.]*drawSpecies\(\)/g) ?? []

  it('draws only ever into nextSpecies, nowhere else', () => {
    expect(draws.length, 'the draw must still happen').toBeGreaterThan(0)
    for (const d of draws) expect(d).toBe('drawSpecies()')
    // Every occurrence, with its assignment attached.
    const seated = code.match(/nextSpecies = drawSpecies\(\)/g) ?? []
    expect(seated).toHaveLength(draws.length)
  })

  it('hands the hatch the warmed value, and re-draws only after spending it', () => {
    const at = code.indexOf('async function passed(')
    expect(at).toBeGreaterThan(-1)
    const rest = code.slice(at)
    const end = rest.indexOf('\n  function ')
    const passed = end > 0 ? rest.slice(0, end) : rest

    const take = passed.indexOf('const species = nextSpecies')
    const redraw = passed.indexOf('nextSpecies = drawSpecies()')
    const warm = passed.indexOf('void pets.warm(nextSpecies)')
    expect(take, 'the hatch takes the warmed species').toBeGreaterThan(-1)
    expect(redraw, 'and only then decides the next one').toBeGreaterThan(take)
    expect(warm, 'and warms what it just decided').toBeGreaterThan(redraw)

    // Nothing may be warmed except the value the hatch will later consume.
    for (const w of code.match(/pets\.warm\([^)]*\)/g) ?? [])
      expect(w).toBe('pets.warm(nextSpecies)')
  })

  it('holds end to end when the sequence is actually run', () => {
    /*
     * main.ts, as pinned above: draw one, warm it; at each hatch take the
     * warmed one, then draw and warm the next. Over 20,000 hatches the animal
     * on the plinth must be the animal that was fetched, every single time —
     * and the no-repeat property must survive the round trip.
     */
    const draw = islandDeck(77)
    draw.remember(['animal-cat', 'animal-dog'])   // as if reloaded mid-collection

    let nextSpecies = draw()
    const warmed: string[] = [nextSpecies]
    const hatched: string[] = []

    for (let i = 0; i < 20000; i++) {
      hatched.push(nextSpecies)                    // const species = nextSpecies
      nextSpecies = draw()                         // nextSpecies = drawSpecies()
      warmed.push(nextSpecies)                     // void pets.warm(nextSpecies)
    }

    // No drift: the nth hatch is the nth thing warmed, with one warm in hand.
    expect(hatched).toEqual(warmed.slice(0, hatched.length))
    expect(warmed).toHaveLength(hatched.length + 1)
    expect(hatched.filter((s, i) => i > 0 && s === hatched[i - 1])).toHaveLength(0)
    // And the very first hatch after the reload is not one she just had.
    expect(['animal-cat', 'animal-dog']).not.toContain(hatched[0])
  })
})
