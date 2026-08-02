/**
 * `dealPool` — the one list an egg may be drawn from, unit by unit.
 *
 * The behaviour this file pins is small and the reason it exists is not: for as
 * long as `main.ts` dealt from `SPECIES` alone, Joe's sign-off gate had nothing
 * on the other side of it, so ticking an animal changed nothing anywhere
 * (PB-070). `dealPool` is the join, and its whole contract is four sentences —
 * base first in its own order, then every signed-off id the registry can build,
 * deduped, nothing else.
 *
 * NOTHING HERE IS MOCKED. The registry is the real one, `SIGNED_OFF_SPECIES` is
 * the real generated mirror, and the only value injected anywhere is Joe's tick,
 * which is a `readonly string[]` parameter precisely so a test can state it as
 * DATA rather than assert that a function was called (`docs/HANDOFF.md` §5).
 *
 * THE MIRROR IS EMPTY TODAY and every assertion below is written to hold either
 * way: not one line needs editing on the day he ticks his first row. Where a
 * fact would be vacuous against an empty mirror it is stated so that it still
 * bites — see the default-argument case at the bottom, which counts.
 */
import { describe, it, expect } from 'vitest'
import { dealPool } from '../../src/island/species/pool'
import { SIGNED_OFF_SPECIES } from '../../src/island/species/signed-off'
import { speciesRecord } from '../../src/island/species/registry'
import { SPECIES } from '../../src/island/pets'

/** The 24, as a plain array — `SPECIES` is a frozen literal tuple. */
const BASE: readonly string[] = [...SPECIES]

/** Registered, assembled, and not one of the 24. The card's own example. */
const BUILT = 'animal-hedgehog'
/** A second registered assembled species, so ORDER can be tested and not guessed. */
const ALSO_BUILT = 'animal-badger'
/** In no registry record anywhere. An egg for it could not be built. */
const GHOST = 'animal-not-a-species-at-all'

describe('the ids a real record answers for', () => {
  /*
   * The premises the rest of the file rests on, asserted rather than assumed.
   * If the hedgehog ever stops being registered, every case below would still
   * pass while testing nothing, so this fails first and says why.
   */
  it('are what this file thinks they are', () => {
    expect(speciesRecord(BUILT), `${BUILT} is not registered`).toBeDefined()
    expect(speciesRecord(ALSO_BUILT), `${ALSO_BUILT} is not registered`).toBeDefined()
    expect(speciesRecord(GHOST), `${GHOST} is registered — pick another`).toBeUndefined()
    expect(BASE).not.toContain(BUILT)
    expect(BASE).not.toContain(ALSO_BUILT)
  })
})

describe('the base pack passes straight through', () => {
  it('is unchanged, in its own order, when nothing is signed off', () => {
    expect(dealPool(BASE, [])).toEqual(BASE)
  })

  it('is still first, and still in order, once something IS signed off', () => {
    const pool = dealPool(BASE, [BUILT])
    expect(pool.slice(0, BASE.length)).toEqual(BASE)
  })

  it('is a new array, and the caller\'s own is not touched', () => {
    const mine = [...BASE]
    const tick = [BUILT]
    const pool = dealPool(mine, tick)
    expect(pool).not.toBe(mine)
    expect(mine).toEqual([...BASE])
    expect(tick).toEqual([BUILT])
  })
})

describe('a signed-off species joins the pool', () => {
  it('is appended, after the whole base pack', () => {
    const pool = dealPool(BASE, [BUILT])
    expect(pool).toHaveLength(BASE.length + 1)
    expect(pool[pool.length - 1]).toBe(BUILT)
    expect(pool).toContain(BUILT)
  })

  it('keeps the order it was ticked in, so a seed deals the same animal tomorrow', () => {
    /*
     * `makeCollectionDeck` draws by INDEX against an `Rng`, so the order here is
     * what decides which animal a given seed produces. Appending must not
     * renumber anything that came before it.
     */
    expect(dealPool(BASE, [BUILT, ALSO_BUILT]).slice(BASE.length))
      .toEqual([BUILT, ALSO_BUILT])
    expect(dealPool(BASE, [ALSO_BUILT, BUILT]).slice(BASE.length))
      .toEqual([ALSO_BUILT, BUILT])
  })

  it('appears once however many times it is named', () => {
    expect(dealPool(BASE, [BUILT, BUILT, BUILT])).toEqual([...BASE, BUILT])
  })
})

describe('the two things that are dropped', () => {
  it('drops an id that is already in the base pack, rather than dealing it twice', () => {
    /*
     * A duplicate in the pool is a duplicate in the deck's `unmet` filter, which
     * is Joe's 29 Jul report ("a second animal of the same type has just
     * spawned") arriving by a new route.
     */
    const twice = BASE[3] as string
    expect(dealPool(BASE, [twice])).toEqual(BASE)
    expect(dealPool(BASE, [twice]).filter(id => id === twice)).toHaveLength(1)
  })

  it('drops an id no registry record answers for', () => {
    /*
     * Signed off and buildable are two different questions and both have to be
     * yes. A ticked typo would deal an egg that hatches into nothing —
     * `pets.ts` would fail to build it and the child would watch it not appear.
     */
    expect(dealPool(BASE, [GHOST])).toEqual(BASE)
    expect(dealPool(BASE, [GHOST, BUILT])).toEqual([...BASE, BUILT])
  })

  it('drops the empty string and keeps its nerve', () => {
    expect(dealPool(BASE, [''])).toEqual(BASE)
  })
})

describe('an empty sign-off list', () => {
  it('returns exactly the base pack and nothing else', () => {
    expect(dealPool(BASE, [])).toEqual(BASE)
    expect(dealPool([], [])).toEqual([])
  })
})

describe('the default argument is the live mirror', () => {
  /** Every ticked id the registry can actually build, in mirror order. */
  const buildable = SIGNED_OFF_SPECIES.filter(id => speciesRecord(id))

  it('adds precisely the signed-off species that are registered — no more', () => {
    /*
     * WRITTEN SO IT IS NOT VACUOUS WHILE THE MIRROR IS EMPTY, which it is today.
     * `toEqual(dealPool(BASE, SIGNED_OFF_SPECIES))` alone would pass against a
     * default of `[]`, a default of `['animal-hedgehog']`, or any other list, on
     * the day the mirror holds nothing. Counting does bite: a default that is
     * anything other than the mirror changes the length.
     */
    expect(dealPool(BASE)).toHaveLength(BASE.length + buildable.length)
    expect(dealPool(BASE).slice(BASE.length)).toEqual(buildable)
    expect(dealPool(BASE)).toEqual(dealPool(BASE, SIGNED_OFF_SPECIES))
  })

  it('deals nothing Joe has not ticked', () => {
    const pool = dealPool(BASE)
    for (const id of pool) {
      expect(
        BASE.includes(id) || SIGNED_OFF_SPECIES.includes(id),
        `"${id}" is in the deal pool and is neither base pack nor signed off`,
      ).toBe(true)
    }
    // And the hedgehog specifically, which is the animal this whole card is
    // about: in the pool if and only if he has ticked it.
    expect(pool.includes(BUILT)).toBe(SIGNED_OFF_SPECIES.includes(BUILT))
  })
})
