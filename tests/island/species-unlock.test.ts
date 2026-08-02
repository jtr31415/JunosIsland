/**
 * JT-027 is four sentences, so this file is four sentences' worth of proof.
 *
 * `src/island/species/unlock.ts` is the whole of Joe's ruling in
 * `joe/tasks.json:355` and nothing else — it is pure, it is not wired to
 * anything, and the only way to know it says what he said is to assert each
 * clause of his sentence separately against it. The clauses:
 *
 *   "at 80% completion a new collection opens up"        -> the trigger tests
 *   "never more than 4 collections active"               -> the cap tests
 *   "at 4 ... only when another is completed"            -> the release test
 *   "random order"                                       -> the seeded-draw tests
 *   "hold legendary, dinosaurs and prehistoric for now"  -> the held-back tests
 *   "avoid consecutive collections ... perceived as related" -> the group tests
 *
 * The relatedness FALLBACK gets its own test on purpose. It is the branch that
 * will look like a missing filter to whoever reads this next, and a test that
 * names it is cheaper than a bug report.
 *
 * Two fixtures below build a `Collection` with a different member count by
 * SLICING a real roster row (`sized`, `emptied`). No collection and no id is
 * invented — the real roster has no row whose size makes 80% land on a whole
 * animal, so an exact-boundary test needs a ten-member row to exist.
 */
import { describe, it, expect } from 'vitest'
import {
  OPEN_AT, MAX_ACTIVE, HELD_BACK, HELD_BACK_BY_JOE, NOT_BUILT_YET, RELATED_GROUP,
  completion, isComplete, activeIds, candidates, nextToOpen, fillToCap,
} from '../../src/island/species/unlock'
import type { UnlockState } from '../../src/island/species/unlock'
import { COLLECTIONS, collection } from '../../src/island/species/roster'
import { shippedIn } from '../../src/island/species/registry'
import type { Collection } from '../../src/island/species/types'
import { mulberry32 } from '../../src/core/rng'

const size = (id: string) => collection(id)!.members.length
/** The smallest owned count that reaches `OPEN_AT` for this collection. */
const atOpen = (id: string) => Math.ceil(OPEN_AT * size(id))
const CONSERVATION = ['near-threatened', 'vulnerable', 'endangered', 'critically-endangered']

/** Every non-base collection with at least one species actually built, from the registry. */
const buildable = (): readonly string[] =>
  COLLECTIONS.map((c) => c.id).filter((id) => id !== 'base' && shippedIn(id).length > 0)

/** Every collection with NOTHING built, from the registry. The thing PB-058 is about. */
const unbuilt = (): readonly string[] =>
  COLLECTIONS.map((c) => c.id).filter((id) => shippedIn(id).length === 0)

function state(o: Partial<UnlockState> & { open: readonly string[] }): UnlockState {
  return { owned: {}, lastOpened: null, roster: COLLECTIONS, ...o }
}

/** A roster where one real collection has been cut down to `n` of its own members. */
function sized(id: string, n: number): readonly Collection[] {
  const real = collection(id)!
  const cut: Collection = { ...real, members: real.members.slice(0, n) }
  return COLLECTIONS.map((c) => (c.id === id ? cut : c))
}

const emptied = (id: string) => sized(id, 0)

/** Every id owned in full, so nothing is active and everything is at 100%. */
function allOwned(ids: readonly string[]): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, size(id)]))
}

describe('the dials are the numbers Joe gave, spelled out', () => {
  it('opens at 80%, caps at 4, and holds back Joe\'s three by name', () => {
    expect(OPEN_AT).toBe(0.80)
    expect(MAX_ACTIVE).toBe(4)
    // Joe's half of the hold, and the only half his sentence is about. The
    // other half is a measurement rather than a ruling and gets its own
    // describe block below, because the two are undone by different people.
    expect([...HELD_BACK_BY_JOE].sort()).toEqual(['dinosaurs', 'legendary', 'prehistoric'])
  })

  it('composes HELD_BACK as the union of the two holds, with no id counted twice', () => {
    // The three are ALSO unbuilt today, so a naive concatenation would double
    // them and quietly make `HELD_BACK.length` lie to anything that counts it.
    expect([...HELD_BACK].sort())
      .toEqual([...new Set([...HELD_BACK_BY_JOE, ...NOT_BUILT_YET])].sort())
    expect(HELD_BACK).toHaveLength(new Set(HELD_BACK).size)
    expect(HELD_BACK).not.toContain('base')
  })

  it('groups every collection except base, so the relatedness rule can never hit a gap', () => {
    for (const c of COLLECTIONS) {
      if (c.id === 'base') continue
      expect(RELATED_GROUP[c.id], `${c.id} has no group`).toBeTypeOf('string')
    }
    expect(RELATED_GROUP['base']).toBeUndefined()
    expect(Object.keys(RELATED_GROUP).sort())
      .toEqual(COLLECTIONS.map((c) => c.id).filter((id) => id !== 'base').sort())
  })

  it('puts all four Red List tiers in one group, which is the case the table exists for', () => {
    for (const id of CONSERVATION) expect(RELATED_GROUP[id]).toBe('conservation')
  })
})

describe('"at 80% completion a new collection opens up"', () => {
  it('fires at or above 80% of an open collection', () => {
    const s = state({ open: ['garden'], owned: { garden: atOpen('garden') } })
    expect(completion(s, 'garden')).toBeGreaterThanOrEqual(OPEN_AT)
    expect(nextToOpen(s, mulberry32(1))).not.toBeNull()
  })

  it('does not fire one animal below that', () => {
    const s = state({ open: ['garden'], owned: { garden: atOpen('garden') - 1 } })
    expect(completion(s, 'garden')).toBeLessThan(OPEN_AT)
    expect(nextToOpen(s, mulberry32(1))).toBeNull()
  })

  it('is inclusive at exactly 80%, and 70% is not enough', () => {
    // Ten of Garden's own members, so 8 is exactly 0.80 and 7 is 0.70.
    const roster = sized('garden', 10)
    const at = state({ open: ['garden'], owned: { garden: 8 }, roster })
    const under = state({ open: ['garden'], owned: { garden: 7 }, roster })
    expect(completion(at, 'garden')).toBe(0.80)
    expect(nextToOpen(at, mulberry32(2))).not.toBeNull()
    expect(nextToOpen(under, mulberry32(2))).toBeNull()
  })

  it('opens nothing when nothing is open, and nothing when the child owns nothing', () => {
    expect(nextToOpen(state({ open: [] }), mulberry32(3))).toBeNull()
    expect(nextToOpen(state({ open: ['garden', 'ocean'] }), mulberry32(3))).toBeNull()
  })

  it('any open collection can be the one that trips it, not just the newest', () => {
    const s = state({
      open: ['garden', 'ocean'],
      owned: { garden: atOpen('garden'), ocean: 1 },
      lastOpened: 'ocean',
    })
    expect(nextToOpen(s, mulberry32(4))).not.toBeNull()
  })
})

describe('"never more than 4 collections active"', () => {
  const fourActive = ['garden', 'ocean', 'ice', 'outback']

  it('counts active as opened-and-not-complete', () => {
    const s = state({
      open: [...fourActive, 'farm'],
      owned: { ...allOwned(['farm']), garden: 2 },
    })
    expect(activeIds(s)).toEqual(fourActive)
    expect(isComplete(s, 'farm')).toBe(true)
  })

  it('blocks a fifth even when an open collection is past 80%', () => {
    const s = state({
      open: fourActive,
      owned: { garden: atOpen('garden'), ocean: atOpen('ocean') },
      lastOpened: 'outback',
    })
    expect(activeIds(s)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(s, mulberry32(5))).toBeNull()
  })

  it('counts base as an active collection like any other while it is unfinished', () => {
    const s = state({
      open: ['base', 'garden', 'ocean', 'ice'],
      owned: { base: atOpen('base') },
      lastOpened: 'ice',
    })
    expect(activeIds(s)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(s, mulberry32(6))).toBeNull()
  })

  it('never offers base itself', () => {
    for (let seed = 0; seed < 200; seed++) {
      const s = state({ open: ['garden'], owned: { garden: atOpen('garden') } })
      expect(nextToOpen(s, mulberry32(seed))).not.toBe('base')
    }
  })
})

describe('"at 4 open collections active a new one opens up only when another is completed"', () => {
  const four = ['garden', 'ocean', 'ice', 'outback']

  it('releases exactly one when one of the four is finished, and then blocks again', () => {
    // Same four, but Garden is now complete: three active, and the finished one
    // is sitting at 100%, which is what satisfies the 80% trigger.
    const released = state({
      open: four,
      owned: { ...allOwned(['garden']), ocean: 3 },
      lastOpened: 'outback',
    })
    expect(activeIds(released)).toHaveLength(3)
    const opened = nextToOpen(released, mulberry32(7))
    expect(opened).not.toBeNull()

    // Fold the opening back in. Four active again -> the answer is null again,
    // so one completion bought exactly one opening.
    const after = state({
      open: [...four, opened!],
      owned: released.owned,
      lastOpened: opened,
    })
    expect(activeIds(after)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(after, mulberry32(7))).toBeNull()
  })

  it('a second completion buys a second opening', () => {
    const s = state({
      open: [...four, 'farm'],
      owned: allOwned(['garden', 'ocean']),
      lastOpened: 'farm',
    })
    expect(activeIds(s)).toHaveLength(3)
    expect(nextToOpen(s, mulberry32(8))).not.toBeNull()
  })
})

describe('"hold legendary, dinosaurs and prehistoric for now"', () => {
  it('never returns one of the three, across many seeds and many board states', () => {
    for (let seed = 0; seed < 300; seed++) {
      const s = state({
        open: ['garden'],
        owned: { garden: atOpen('garden') },
        lastOpened: 'garden',
      })
      expect(HELD_BACK).not.toContain(nextToOpen(s, mulberry32(seed)))
    }
  })

  it('returns null rather than reaching for them when they are all that is left', () => {
    const rest = COLLECTIONS.map((c) => c.id).filter((id) => id !== 'base' && !HELD_BACK.includes(id))
    const s = state({ open: rest, owned: allOwned(rest), lastOpened: 'critically-endangered' })
    expect(candidates(s)).toEqual([])
    expect(nextToOpen(s, mulberry32(9))).toBeNull()
  })

  it('keeps them out of the candidate list even before the draw', () => {
    const s = state({ open: ['garden'], owned: { garden: atOpen('garden') } })
    for (const held of HELD_BACK) expect(candidates(s)).not.toContain(held)
  })
})

describe('"avoid consecutive collections that may be perceived as related"', () => {
  /**
   * Open everything, completing each one the moment it opens so the cap never
   * binds and the run reaches the end of the pool. Returns each step with the
   * pool it chose from, which is what lets the assertion below be honest about
   * the fallback rather than just tolerant of it.
   */
  function run(seed: number): { id: string; pool: readonly string[] }[] {
    const rng = mulberry32(seed)
    let open: string[] = ['base']
    let owned: Record<string, number> = allOwned(['base'])
    let last: string | null = null
    const steps: { id: string; pool: readonly string[] }[] = []
    for (let i = 0; i < 30; i++) {
      const s = state({ open, owned, lastOpened: last })
      const pool = candidates(s)
      const id = nextToOpen(s, rng)
      if (id === null) break
      steps.push({ id, pool })
      open = [...open, id]
      owned = { ...owned, [id]: size(id) }
      last = id
    }
    return steps
  }

  it('never opens two of the same group in a row while an alternative exists', () => {
    for (let seed = 0; seed < 60; seed++) {
      const steps = run(seed)
      expect(steps.length).toBe(COLLECTIONS.length - 1 - HELD_BACK.length)
      for (let i = 1; i < steps.length; i++) {
        const prev = RELATED_GROUP[steps[i - 1]!.id]
        const alternatives = steps[i]!.pool.filter((id) => RELATED_GROUP[id] !== prev)
        if (alternatives.length === 0) continue // the fallback; its own test below
        expect(RELATED_GROUP[steps[i]!.id], `seed ${seed}, step ${i}`).not.toBe(prev)
      }
    }
  })

  it('cannot reach a Red List tier at all today, so that case is not live to test', () => {
    /*
     * THIS REPLACES A TEST THAT HAD QUIETLY GONE VACUOUS, and it is written out
     * rather than deleted so the next reader knows the cover was lost on
     * purpose. It used to walk the whole roster asserting two conservation
     * tiers never opened one after the other. Since PB-058 all four tiers are
     * in `NOT_BUILT_YET` — not one of them has a single model built — so the
     * walk can never reach one and the assertion inside the loop stopped
     * running. A test that passes because its body is unreachable claims cover
     * it does not have, which is worse than no test, so this asserts the thing
     * that IS true: the tiers are unreachable, and the reason is the hold, not
     * the grouping.
     *
     * The grouping rule itself is still genuinely proved, by the test above,
     * on the pairs that ARE reachable — garden and woodland are both
     * `temperate`, home-pets and farm are both `domestic`, and all four are
     * built — so the rule has live cover even while the tiers do not.
     *
     * The day a tier ships, its id leaves `NOT_BUILT_YET`, the first assertion
     * here goes red by name, and the back-to-back tiers test belongs back in.
     */
    for (const id of CONSERVATION) {
      expect(
        HELD_BACK,
        `${id} is drawable again — restore the "two Red List tiers back to back" test`,
      ).toContain(id)
    }
    for (let seed = 0; seed < 60; seed++) {
      for (const step of run(seed)) expect(CONSERVATION).not.toContain(step.id)
    }
  })

  it('FALLS BACK to a related collection rather than returning null', () => {
    // Everything open and finished except Woodland, and the last thing opened
    // was Garden — the same `temperate` walk. Avoiding the group would empty
    // the pool, so it opens a related page rather than leaving them with none.
    // (Before PB-058 this case was staged on three of the four Red List tiers;
    // they are all unbuilt and therefore held back, so the pool it needs has to
    // be built out of collections that actually have animals in them.)
    // STAGED THE OTHER WAY ROUND since 2 Aug. It used to leave woodland as the
    // one unopened collection, which stopped working the moment woodland lost
    // all sixteen of its kit-built species and joined NOT_BUILT_YET — a held
    // collection is never a candidate, so the pool emptied instead of falling
    // back. `temperate` is garden and woodland alone, and garden is now the only
    // built one, so the pair can only be staged with garden as the TARGET.
    // The behaviour under test is unchanged: the last thing opened is in the
    // same group as the only thing left, and it opens it anyway.
    const left = ['garden']
    const open = COLLECTIONS.map((c) => c.id).filter((id) => !left.includes(id))
    const s = state({ open, owned: allOwned(open), lastOpened: 'woodland' })
    expect(candidates(s)).toEqual(left)
    expect(RELATED_GROUP['woodland']).toBe(RELATED_GROUP['garden'])

    const got = nextToOpen(s, mulberry32(10))
    expect(got).toBe('garden')
  })
})

describe('"random order" — the caller\'s seeded stream and nothing else', () => {
  const s = () => state({ open: ['garden'], owned: { garden: atOpen('garden') }, lastOpened: 'garden' })

  it('gives the same answer for the same seed, forever', () => {
    for (const seed of [1, 42, 9001]) {
      expect(nextToOpen(s(), mulberry32(seed))).toBe(nextToOpen(s(), mulberry32(seed)))
    }
  })

  it('spreads across every page the pool can offer, as the seed changes', () => {
    /*
     * This used to assert "more than five distinct answers" and that number is
     * now unreachable: PB-058 cut the drawable pool to five collections, of
     * which the relatedness rule drops one here. So the assertion is stated
     * against the pool itself rather than against a count — every candidate is
     * reached and nothing outside it ever is, which is what "random order"
     * actually promises and which survives the pool changing size again.
     */
    const pool = candidates(s()).filter((id) => RELATED_GROUP[id] !== RELATED_GROUP['garden'])
    const seen = new Set<string | null>()
    for (let seed = 0; seed < 200; seed++) seen.add(nextToOpen(s(), mulberry32(seed)))
    expect([...seen].sort()).toEqual([...pool].sort())
    expect(seen.has(null)).toBe(false)
  })

  it('takes its draw from the rng it is handed, not from Math.random', () => {
    const pool = candidates(s()).filter((id) => RELATED_GROUP[id] !== RELATED_GROUP['garden'])
    expect(nextToOpen(s(), () => 0)).toBe(pool[0])
    expect(nextToOpen(s(), () => 0.999999)).toBe(pool[pool.length - 1])
  })
})

describe('a collection with no members does not divide by zero', () => {
  const roster = emptied('ocean')

  it('reads as complete rather than NaN, and frees its active slot', () => {
    const s = state({ open: ['ocean'], roster })
    expect(completion(s, 'ocean')).toBe(1)
    expect(Number.isNaN(completion(s, 'ocean'))).toBe(false)
    expect(isComplete(s, 'ocean')).toBe(true)
    expect(activeIds(s)).toEqual([])
  })

  it('still lets the cadence run', () => {
    const s = state({ open: ['ocean'], roster, lastOpened: 'ocean' })
    expect(nextToOpen(s, mulberry32(11))).not.toBeNull()
  })

  it('treats an id that is not in the roster as nothing at all', () => {
    const s = state({ open: ['garden', 'not-a-collection'], owned: { garden: atOpen('garden') } })
    expect(completion(s, 'not-a-collection')).toBe(0)
    expect(activeIds(s)).toEqual(['garden'])
  })

  it('clamps an owned count above the collection size', () => {
    const s = state({ open: ['garden'], owned: { garden: size('garden') + 99 } })
    expect(completion(s, 'garden')).toBe(1)
  })
})

describe('the hold on unbuilt collections is derived from the registry, not remembered', () => {
  /*
   * THIS BLOCK IS THE WHOLE ANSWER TO "how will anyone know to update that
   * list?", and it is the reason `NOT_BUILT_YET` is allowed to be twelve hand
   * written strings in a pure module instead of a call to `shippedIn`.
   *
   * `unlock.ts` cannot import `registry.ts` — the registry reaches three.js
   * through `collections/garden.ts` and the unlock rules are deliberately pure —
   * so the derivation cannot be performed where the list lives. It is performed
   * HERE instead, in a file that may import anything, and the list is checked
   * against it. Nobody has to remember `NOT_BUILT_YET` exists: the day a
   * modeller commits the first ocean species, this block goes red and names the
   * collection and says what to do about it.
   */
  it('holds back every collection that has no models at all', () => {
    for (const id of unbuilt()) {
      const frames = collection(id)!.members.length
      expect(
        HELD_BACK,
        `${id} has no species built, so opening it shows a child ${frames} empty `
          + 'frames. Add it to NOT_BUILT_YET in src/island/species/unlock.ts.',
      ).toContain(id)
    }
  })

  it('names a collection the day it ships, so the list cannot silently rot', () => {
    for (const id of NOT_BUILT_YET) {
      expect(
        shippedIn(id).length,
        `${id} now has models — take it out of NOT_BUILT_YET in `
          + 'src/island/species/unlock.ts so the cadence can start offering it.',
      ).toBe(0)
    }
  })

  it('holds back nothing else: the union is exactly the unbuilt plus Joe\'s three', () => {
    expect([...HELD_BACK].sort())
      .toEqual([...new Set([...unbuilt(), ...HELD_BACK_BY_JOE])].sort())
  })
})

describe('the draw can neither starve nor deadlock on the pool PB-058 leaves it', () => {
  it('offers exactly the collections that have animals in them, and nothing else', () => {
    // The card's acceptance test, said as plainly as it can be said: whatever
    // the cadence is willing to open, a child opening it finds animals there.
    const s = state({ open: ['base'], owned: { base: atOpen('base') } })
    expect([...candidates(s)].sort()).toEqual([...buildable()].sort())
    for (const id of candidates(s)) expect(shippedIn(id).length).toBeGreaterThan(0)
  })

  it('fills a fresh island to the cap and then stops, rather than looping', () => {
    // base plus three is four active. The pool is five, so two are held in
    // reserve for the only two completions the cadence can still reward.
    const s = state({ open: ['base'] })
    const drawn = fillToCap(s, mulberry32(12))
    expect(drawn).toHaveLength(MAX_ACTIVE - 1)
    expect(new Set(drawn).size).toBe(drawn.length)
    for (const id of drawn) expect(buildable()).toContain(id)

    // Called again on the filled state it has nothing to add.
    const filled = state({ open: ['base', ...drawn], lastOpened: drawn[drawn.length - 1]! })
    expect(activeIds(filled)).toHaveLength(MAX_ACTIVE)
    expect(fillToCap(filled, mulberry32(12))).toEqual([])
  })

  it('returns null and an empty fill when the pool is exhausted, rather than spinning', () => {
    /*
     * The hostile case: nothing left that could be opened. `HELD_BACK` is a
     * frozen export and cannot be mutated to stage it, so the equivalent is
     * built the honest way — every buildable collection is already open, and
     * every open collection is finished, so the cap is NOT what is refusing.
     * Rule 2 is satisfied by the completed collections, the draw is reached,
     * and it declines because there is genuinely nothing to give.
     */
    const open = ['base', ...buildable()]
    const s = state({ open, owned: allOwned(open), lastOpened: 'farm' })
    expect(activeIds(s)).toEqual([])
    expect(candidates(s)).toEqual([])
    expect(nextToOpen(s, mulberry32(13))).toBeNull()
    expect(fillToCap(s, mulberry32(13))).toEqual([])
  })
})
