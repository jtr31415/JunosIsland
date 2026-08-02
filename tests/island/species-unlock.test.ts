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
 * >>> THE DENOMINATOR IS `state.built`, NOT THE ROSTER, SINCE JT-047. Every
 * >>> fraction in this file is owned-over-BUILT, so `BUILT` below is the real
 * >>> measurement taken from `built.ts` — the one predicate — rather than a
 * >>> number typed out here. Tests that need a count the registry does not
 * >>> currently have OVERRIDE ONE ENTRY of that map (`{ ...BUILT, garden: 10 }`)
 * >>> instead of slicing a roster row, which is what the deleted `sized` and
 * >>> `emptied` fixtures used to do. The reason those fixtures existed survives
 * >>> the change — no real collection has a size that puts 80% on a whole animal,
 * >>> so an exact-boundary test still needs a ten-member denominator to exist —
 * >>> and the hypothetical is now a count rather than an invented `Collection`.
 * >>> No collection and no id is invented anywhere in this file.
 *
 * >>> THE POOL IS FOUR COLLECTIONS WIDE TODAY. `garden`, `home-pets`,
 * >>> `night-time` and `africa` are the only non-base collections with a single
 * >>> animal built (pinned in `tests/island/species-built.test.ts`), so they are
 * >>> the only ones the cadence can offer. Several tests below used to be staged
 * >>> on `ocean`, `ice`, `outback`, `farm` and `woodland`; those all read as
 * >>> UNBUILT now, which under JT-047 means they read as COMPLETE and free their
 * >>> slot, so a board built out of them proves the opposite of what it says.
 * >>> Where the case under test needs a wider pool than four, the test hands in
 * >>> its own `built` map and says so.
 */
import { describe, it, expect } from 'vitest'
import {
  OPEN_AT, MAX_ACTIVE, HELD_BACK_BY_JOE, RELATED_GROUP, heldBack,
  completion, isComplete, activeIds, candidates, nextToOpen, fillToCap,
} from '../../src/island/species/unlock'
import type { UnlockState } from '../../src/island/species/unlock'
import { COLLECTIONS, collection } from '../../src/island/species/roster'
import { builtIn } from '../../src/island/species/built'
import { shippedIn } from '../../src/island/species/registry'
import { mulberry32 } from '../../src/core/rng'

/**
 * HOW MANY MEMBERS OF EACH COLLECTION ARE ACTUALLY BUILT. The live measurement.
 *
 * `unlock.ts` is pure and takes this by injection because `built.ts` costs
 * three.js twice over; a test file pays for three happily, so this is the same
 * map `main.ts` fills at runtime, built from the same single predicate. Nothing
 * here re-derives "built" — that divergence is the whole bug JT-047 closed.
 */
const BUILT: Record<string, number> = {}
for (const c of COLLECTIONS) BUILT[c.id] = builtIn(c.id).length

/** How many members of a collection are built — the denominator of `completion`. */
const built = (id: string) => BUILT[id] ?? 0
/** The smallest owned count that reaches `OPEN_AT` for this collection. */
const atOpen = (id: string) => Math.ceil(OPEN_AT * built(id))
const CONSERVATION = ['near-threatened', 'vulnerable', 'endangered', 'critically-endangered']

/**
 * Every non-base collection the cadence can actually offer, for a given board.
 *
 * DERIVED FROM `heldBack`, which is the module's own answer, rather than from a
 * second reading of the registry. The old version of this helper asked
 * `shippedIn(id).length > 0` — see the tripwire block near the bottom for why
 * that was the wrong question and what it would have done the day Farm lands.
 */
const offerable = (b: Readonly<Record<string, number>> = BUILT): readonly string[] =>
  COLLECTIONS.map((c) => c.id).filter((id) => id !== 'base' && !heldBack(b, id))

/**
 * The board. `built` defaults to the live measurement, `everCompleted` to none.
 *
 * An EMPTY history is the right default for every test here: it makes each one
 * read the LIVE present, so a fraction that says 100% says it because of what
 * the child owns today. The ratchet is JT-047's own subject and is asserted
 * where it is the thing under test, never leaked in as a default.
 */
function state(o: Partial<UnlockState> & { open: readonly string[] }): UnlockState {
  return {
    owned: {}, lastOpened: null, roster: COLLECTIONS, built: BUILT, everCompleted: [], ...o,
  }
}

/** Every id owned in full, so nothing is active and everything is at 100%. */
function allOwned(
  ids: readonly string[], b: Readonly<Record<string, number>> = BUILT,
): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, b[id] ?? 0]))
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

  it('asks the two holds as one predicate, so neither can be counted twice', () => {
    /*
     * THIS USED TO CHECK A LIST AND NOW CHECKS A FUNCTION, and the double-count
     * it was written to catch cannot happen any more. `HELD_BACK` was the union
     * of Joe's three and a hand-written `NOT_BUILT_YET`, and because Joe's three
     * are ALSO unbuilt a naive concatenation doubled them and made
     * `HELD_BACK.length` lie to anything that counted it. `heldBack` returns a
     * boolean per id, so there is no length to lie with — but the two halves are
     * still named separately in the source, because Joe releasing a collection
     * and a modeller building one are different acts by different people.
     */
    for (const c of COLLECTIONS) {
      expect(heldBack(BUILT, c.id), c.id)
        .toBe(HELD_BACK_BY_JOE.includes(c.id) || built(c.id) === 0)
    }
    // `base` is not held back by either half — it is excluded from the draw by
    // `candidates` naming it, which is a different mechanism and stays separate.
    expect(heldBack(BUILT, 'base')).toBe(false)
    // An id the roster never heard of has nothing built, so it is refused.
    expect(heldBack(BUILT, 'atlantis')).toBe(true)
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
    // TEN BUILT MEMBERS OF GARDEN, so 8 is exactly 0.80 and 7 is 0.70. No real
    // collection has a built count that puts 80% on a whole animal, so the
    // boundary needs a denominator of ten to exist — and since JT-047 the
    // denominator is this map, so it is supplied here rather than by cutting a
    // roster row down to size. Garden really does have fourteen built today.
    const built10 = { ...BUILT, garden: 10 }
    const at = state({ open: ['garden'], owned: { garden: 8 }, built: built10 })
    const under = state({ open: ['garden'], owned: { garden: 7 }, built: built10 })
    expect(completion(at, 'garden')).toBe(0.80)
    expect(nextToOpen(at, mulberry32(2))).not.toBeNull()
    expect(nextToOpen(under, mulberry32(2))).toBeNull()
  })

  it('opens nothing when nothing is open, and nothing when the child owns nothing', () => {
    // BOTH OPEN COLLECTIONS MUST HAVE ANIMALS IN THEM for this to prove
    // anything. It used to name `ocean`, which has nothing built and therefore
    // reads as 100% complete (`completion` returns 1 for an empty denominator),
    // so it would satisfy the trigger and the second assertion would be testing
    // the opposite of its own sentence.
    expect(nextToOpen(state({ open: [] }), mulberry32(3))).toBeNull()
    expect(nextToOpen(state({ open: ['garden', 'home-pets'] }), mulberry32(3))).toBeNull()
  })

  it('any open collection can be the one that trips it, not just the newest', () => {
    // Home Pets is one of sixteen built — barely started, and certainly not the
    // thing tripping it. Garden at 80% is. (`ocean` used to play this part and
    // cannot any more: with nothing built it reads as complete.)
    const s = state({
      open: ['garden', 'home-pets'],
      owned: { garden: atOpen('garden'), 'home-pets': 1 },
      lastOpened: 'home-pets',
    })
    expect(nextToOpen(s, mulberry32(4))).not.toBeNull()
  })
})

describe('"never more than 4 collections active"', () => {
  /*
   * THE FOUR ARE THE FOUR THAT EXIST. This used to be garden, ocean, ice and
   * outback; three of those have nothing built, so under JT-047 they read as
   * 100% and are NOT active at all — a board made of them would have one active
   * collection in it and would prove nothing about a cap of four. These are the
   * only four non-base collections with an animal in them today.
   */
  const fourActive = ['garden', 'home-pets', 'night-time', 'africa']

  it('counts active as opened-and-not-complete', () => {
    // Base is the completed fifth: twenty-four owned of twenty-four built, which
    // is a real completion rather than the vacuous one an empty collection gives.
    const s = state({
      open: ['base', ...fourActive],
      owned: { ...allOwned(['base']), garden: 2 },
    })
    expect(activeIds(s)).toEqual(fourActive)
    expect(isComplete(s, 'base')).toBe(true)
  })

  it('blocks a fifth even when an open collection is past 80%', () => {
    const s = state({
      open: fourActive,
      owned: { garden: atOpen('garden'), 'home-pets': atOpen('home-pets') },
      lastOpened: 'africa',
    })
    expect(activeIds(s)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(s, mulberry32(5))).toBeNull()
  })

  it('counts base as an active collection like any other while it is unfinished', () => {
    const s = state({
      open: ['base', 'garden', 'home-pets', 'night-time'],
      owned: { base: atOpen('base') },
      lastOpened: 'night-time',
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
  // Base plus three, so `africa` is the one left in reserve for the completion
  // to buy. See the note on `fourActive` above for why the old ocean/ice/outback
  // board cannot stage this any more.
  const four = ['base', 'garden', 'home-pets', 'night-time']

  it('releases exactly one when one of the four is finished, and then blocks again', () => {
    // Same four, but Garden is now complete: three active, and the finished one
    // is sitting at 100%, which is what satisfies the 80% trigger.
    const released = state({
      open: four,
      owned: { ...allOwned(['garden']), 'home-pets': 3 },
      lastOpened: 'night-time',
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
    /*
     * THE ONLY TEST HERE THAT NEEDS A POOL WIDER THAN THE REGISTRY HAS. Five
     * collections open with two of them finished leaves nothing in reserve
     * today: base plus the four buildable ones IS every collection the cadence
     * can offer, so a real board would return null for want of stock rather
     * than for want of entitlement, and the test would pass for the wrong
     * reason. So `farm` and `woodland` — real roster rows, both at zero built
     * since PB-036 deleted the kit route — are given animals for this one
     * assertion. Farm is being built right now; on the day it lands this map
     * stops being hypothetical and can go.
     */
    const built6 = { ...BUILT, farm: 16, woodland: 16 }
    const s = state({
      open: ['base', 'garden', 'home-pets', 'night-time', 'africa'],
      owned: allOwned(['garden', 'home-pets'], built6),
      lastOpened: 'africa',
      built: built6,
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
      const got = nextToOpen(s, mulberry32(seed))
      expect(got, `seed ${seed}`).not.toBeNull()
      expect(HELD_BACK_BY_JOE).not.toContain(got)
      // And not held back by the other half either: whatever it offers has an
      // animal in it. Both halves are one predicate now — see `heldBack`.
      expect(heldBack(BUILT, got!), `${got} was offered`).toBe(false)
    }
  })

  it('returns null rather than reaching for them when they are all that is left', () => {
    const rest = offerable()
    const s = state({ open: rest, owned: allOwned(rest), lastOpened: 'africa' })
    expect(candidates(s)).toEqual([])
    expect(nextToOpen(s, mulberry32(9))).toBeNull()
  })

  it('keeps them out of the candidate list even before the draw', () => {
    const s = state({ open: ['garden'], owned: { garden: atOpen('garden') } })
    for (const c of COLLECTIONS) {
      if (!heldBack(BUILT, c.id)) continue
      expect(candidates(s), c.id).not.toContain(c.id)
    }
    for (const id of HELD_BACK_BY_JOE) expect(candidates(s)).not.toContain(id)
  })
})

describe('"avoid consecutive collections that may be perceived as related"', () => {
  /**
   * Open everything, completing each one the moment it opens so the cap never
   * binds and the run reaches the end of the pool. Returns each step with the
   * pool it chose from, which is what lets the assertion below be honest about
   * the fallback rather than just tolerant of it.
   */
  function run(
    seed: number, b: Readonly<Record<string, number>> = BUILT,
  ): { id: string; pool: readonly string[] }[] {
    const rng = mulberry32(seed)
    let open: string[] = ['base']
    let owned: Record<string, number> = allOwned(['base'], b)
    let last: string | null = null
    const steps: { id: string; pool: readonly string[] }[] = []
    for (let i = 0; i < 30; i++) {
      const s = state({ open, owned, lastOpened: last, built: b })
      const pool = candidates(s)
      const id = nextToOpen(s, rng)
      if (id === null) break
      steps.push({ id, pool })
      open = [...open, id]
      owned = { ...owned, [id]: b[id] ?? 0 }
      last = id
    }
    return steps
  }

  it('never opens two of the same group in a row while an alternative exists', () => {
    /*
     * >>> THIS RUNS ON A WIDENED POOL, AND IT HAS TO, or it asserts nothing.
     * >>> The four collections with animals in them today — garden, home-pets,
     * >>> night-time, africa — are in FOUR DIFFERENT groups (temperate,
     * >>> domestic, nocturnal, exotic-hot), so on the live registry there is no
     * >>> pair the rule could ever be asked about and every walk passes
     * >>> vacuously. A test that passes because its body is unreachable claims
     * >>> cover it does not have, which this file has already been bitten by
     * >>> once (see the Red List test below).
     * >>>
     * >>> So `farm` and `woodland` are given their sixteen. They are the exact
     * >>> pairs the table's `domestic` and `temperate` rows exist for — farm with
     * >>> home-pets, woodland with garden — and both are real roster rows that
     * >>> had all sixteen until PB-036 deleted the kit route on 2 August. This is
     * >>> the board this test ran on until that commit, restored as a
     * >>> hypothesis; it becomes the real board again as they are rebuilt.
     */
    const built6 = { ...BUILT, farm: 16, woodland: 16 }
    const groups = new Set(offerable(built6).map((id) => RELATED_GROUP[id]))
    expect(groups.size, 'the pool has no two collections in one group to test with')
      .toBeLessThan(offerable(built6).length)

    for (let seed = 0; seed < 60; seed++) {
      const steps = run(seed, built6)
      expect(steps.length).toBe(offerable(built6).length)
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
     * tiers never opened one after the other. Since PB-058 not one of the four
     * tiers has a single model built, so the hold refuses all four, the walk can
     * never reach one, and the assertion inside the loop stopped running. A test
     * that passes because its body is unreachable claims cover it does not have,
     * which is worse than no test, so this asserts the thing that IS true: the
     * tiers are unreachable, and the reason is the hold, not the grouping.
     *
     * The grouping rule itself is proved by the test above — which since JT-047
     * has to stage its own pool to do it, because the four collections that ARE
     * built land in four different groups. That is a narrowing of live cover and
     * it is stated there rather than hidden here.
     *
     * The day a tier gets its first animal, `heldBack` stops refusing it on its
     * own, the first assertion here goes red by name, and the back-to-back tiers
     * test belongs back in.
     */
    for (const id of CONSERVATION) {
      expect(
        heldBack(BUILT, id),
        `${id} is drawable again — restore the "two Red List tiers back to back" test`,
      ).toBe(true)
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
    // all sixteen of its kit-built species — a collection with nothing built is
    // never a candidate, so the pool emptied instead of falling back.
    // `temperate` is garden and woodland alone, and garden is now the only built
    // one, so the pair can only be staged with garden as the TARGET.
    // Every other collection is open here and every open one reads as finished,
    // so the cap is not what is refusing and the draw is genuinely reached.
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
     * long unreachable: the drawable pool is FOUR collections, one of which is
     * already open here, and the relatedness rule can drop another. So the
     * assertion is stated against the pool itself rather than against a count —
     * every candidate is reached and nothing outside it ever is, which is what
     * "random order" actually promises and which survives the pool changing size
     * again, in either direction.
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

describe('a collection with nothing BUILT does not divide by zero', () => {
  /*
   * THE CASE IS REAL NOW RATHER THAN STAGED, which is why the roster fixture
   * that used to cut Ocean down to nothing has gone. Ocean has sixteen rostered
   * members and not one of them built, and since JT-047 the denominator is the
   * built count, so `ocean` IS the empty case on the live registry. Sixteen
   * collections are in the same position today.
   *
   * Reading 1 rather than 0 is deliberate and is the trap `opened.ts` documents
   * at its step 0: 0 would wedge a dead album open forever holding one of
   * `MAX_ACTIVE`'s four slots, and three of those left Juno's save with one
   * working slot for the rest of the game.
   */
  it('reads as complete rather than NaN, and frees its active slot', () => {
    const s = state({ open: ['ocean'] })
    expect(built('ocean')).toBe(0)
    expect(completion(s, 'ocean')).toBe(1)
    expect(Number.isNaN(completion(s, 'ocean'))).toBe(false)
    expect(isComplete(s, 'ocean')).toBe(true)
    expect(activeIds(s)).toEqual([])
  })

  it('is never OFFERED either, so it can neither hold a slot nor be drawn into one', () => {
    // The other half of the same guard: reading as complete would be an odd
    // thing to say about a collection the cadence could still deal out. It
    // cannot — `heldBack` refuses anything with an empty denominator.
    const s = state({ open: ['garden'], owned: { garden: atOpen('garden') } })
    expect(heldBack(BUILT, 'ocean')).toBe(true)
    expect(candidates(s)).not.toContain('ocean')
  })

  it('still lets the cadence run', () => {
    const s = state({ open: ['ocean'], lastOpened: 'ocean' })
    expect(nextToOpen(s, mulberry32(11))).not.toBeNull()
  })

  it('treats an id that is not in the roster as nothing at all', () => {
    const s = state({ open: ['garden', 'not-a-collection'], owned: { garden: atOpen('garden') } })
    expect(completion(s, 'not-a-collection')).toBe(0)
    expect(activeIds(s)).toEqual(['garden'])
  })

  it('clamps an owned count above the number built', () => {
    // The case PB-036 made reachable without touching a save: fifty-nine species
    // were deleted, so a child can own more of a collection than is built.
    const s = state({ open: ['garden'], owned: { garden: built('garden') + 99 } })
    expect(completion(s, 'garden')).toBe(1)
  })
})

describe('the hold on unbuilt collections is derived live, and a record is not an animal', () => {
  /*
   * >>> WHAT THIS BLOCK USED TO BE, AND WHY IT IS NOT THAT ANY MORE. It was the
   * >>> tripwire on `NOT_BUILT_YET`, a hand-written list of the collections with
   * >>> nothing built that `unlock.ts` carried because it is pure and could not
   * >>> import the registry. The tripwire recomputed the list here, in a file
   * >>> that may import anything, so that nobody had to REMEMBER the list
   * >>> existed. THE LIST IS GONE — JT-047 injects `state.built` instead, so the
   * >>> hold is derived from the same counts `completion` divides by and cannot
   * >>> rot — and with the list gone the tripwire has nothing to guard.
   * >>>
   * >>> IT IS RECORDED RATHER THAN QUIETLY DELETED BECAUSE IT MEASURED THE WRONG
   * >>> THING, and that mistake is easy to make again. It asked
   * >>> `shippedIn(id).length`, which counts REGISTERED RECORDS — and a record is
   * >>> not an animal. `built.ts` sets this out at length: `define.ts` omits an
   * >>> assembly it cannot find and says nothing, so a `Species` record for a
   * >>> creature nobody has modelled is legal, silent and counted; and the method
   * >>> the last three collections were built by writes ALL of a collection's
   * >>> records in one commit and the species files afterwards, one at a time.
   * >>> So on the day Farm's sixteen records land, the old test would have gone
   * >>> red saying "farm now has models — take it out of NOT_BUILT_YET so the
   * >>> cadence can start offering it", with ZERO farm animals built. Whoever
   * >>> obeyed it would have handed a child sixteen empty frames — the exact bug
   * >>> the list existed to prevent, walked back in through the front door.
   *
   * What replaces it is the INVARIANT rather than the reminder: the hold is
   * exactly "nothing built, or one of Joe's three", measured against the live
   * registry so that it stays true as Farm lands and needs no edit when it does.
   */
  it('holds back exactly the collections with nothing built, plus Joe\'s three', () => {
    const held = COLLECTIONS.map((c) => c.id).filter((id) => heldBack(BUILT, id))
    const nothingBuilt = COLLECTIONS.map((c) => c.id).filter((id) => builtIn(id).length === 0)
    expect([...held].sort()).toEqual([...new Set([...nothingBuilt, ...HELD_BACK_BY_JOE])].sort())
    for (const id of nothingBuilt) {
      const frames = collection(id)!.members.length
      expect(
        heldBack(BUILT, id),
        `${id} has no species built, so opening it would show a child ${frames} empty frames`,
      ).toBe(true)
    }
  })

  it('offers every collection that has an animal in it and is not one of Joe\'s three', () => {
    /*
     * THE HALF THAT SURVIVES AS FARM LANDS, and the reason nothing has to be
     * remembered: build one animal and the cadence starts offering the
     * collection on its own. Asserted against the real registry both ways round,
     * so neither a collection with animals going unoffered nor an empty one
     * being offered can pass.
     */
    const s = state({ open: ['base'], owned: { base: atOpen('base') } })
    for (const c of COLLECTIONS) {
      if (c.id === 'base') continue
      const live = builtIn(c.id).length > 0 && !HELD_BACK_BY_JOE.includes(c.id)
      expect(heldBack(BUILT, c.id), c.id).toBe(!live)
      if (live) {
        expect(candidates(s), `${c.id} has animals but is never offered`).toContain(c.id)
      } else {
        expect(candidates(s), `${c.id} is offered with nothing in it`).not.toContain(c.id)
      }
    }
    expect([...candidates(s)].sort()).toEqual([...offerable()].sort())
  })

  it('cannot be fooled by records: `heldBack` is only ever handed built counts', () => {
    /*
     * The distinction stated on the predicate rather than on data, because
     * TODAY NO COLLECTION CAN SHOW IT: every collection with a registry record
     * also has a model, so `shippedIn` and `builtIn` happen to agree everywhere
     * (base 24, garden 14, home-pets 16, night-time 13, africa 1, the rest zero
     * — pinned in `tests/island/species-built.test.ts` and
     * `tests/island/species-registry.test.ts`). The measurement below says so
     * out loud instead of a loop that would run zero times and claim cover.
     *
     * `heldBack`'s SIGNATURE is what makes the confusion unrepeatable: it takes
     * a map of built counts and has no way to ask how many records exist. Farm
     * is the case that is coming — sixteen records, zero models — and on that
     * day the first assertion here goes red, the hold stays correct without an
     * edit, and the right response is to move `farm` into the second list rather
     * than to touch `unlock.ts`.
     */
    const recordsWithoutModels = COLLECTIONS.map((c) => c.id)
      .filter((id) => shippedIn(id).length > 0 && builtIn(id).length === 0)
    expect(
      recordsWithoutModels,
      'a collection now has records and no models — the hold is still right to '
        + 'refuse it; this measurement is what needs updating, not unlock.ts',
    ).toEqual([])

    // Farm today: no records, no models, held back. The assertion that matters
    // is that the SECOND clause is what does the refusing, and it still will
    // when the sixteen records land.
    expect(built('farm')).toBe(0)
    expect(heldBack(BUILT, 'farm')).toBe(true)
    expect(HELD_BACK_BY_JOE).not.toContain('farm')
  })
})

describe('the draw can neither starve nor deadlock on the pool PB-058 leaves it', () => {
  it('offers exactly the collections that have animals in them, and nothing else', () => {
    // The card's acceptance test, said as plainly as it can be said: whatever
    // the cadence is willing to open, a child opening it finds animals there.
    // `builtIn`, not `shippedIn` — see the block above for the difference and
    // why it is not a pedantic one.
    const s = state({ open: ['base'], owned: { base: atOpen('base') } })
    expect([...candidates(s)].sort()).toEqual([...offerable()].sort())
    for (const id of candidates(s)) expect(builtIn(id).length).toBeGreaterThan(0)
  })

  it('fills a fresh island to the cap and then stops, rather than looping', () => {
    // base plus three is four active. THE POOL IS FOUR, so exactly one is held
    // in reserve for the only completion the cadence can still reward — it was
    // five and two until PB-036 took the kit route away from farm and woodland.
    const s = state({ open: ['base'] })
    const drawn = fillToCap(s, mulberry32(12))
    expect(drawn).toHaveLength(MAX_ACTIVE - 1)
    expect(new Set(drawn).size).toBe(drawn.length)
    for (const id of drawn) expect(offerable()).toContain(id)

    // Called again on the filled state it has nothing to add.
    const filled = state({ open: ['base', ...drawn], lastOpened: drawn[drawn.length - 1]! })
    expect(activeIds(filled)).toHaveLength(MAX_ACTIVE)
    expect(fillToCap(filled, mulberry32(12))).toEqual([])
  })

  it('returns null and an empty fill when the pool is exhausted, rather than spinning', () => {
    /*
     * The hostile case: nothing left that could be opened. The hold cannot be
     * mutated to stage it — it is derived from the built counts now, and those
     * are a measurement — so the equivalent is built the honest way: every
     * offerable collection is already open, and every open collection is
     * finished, so the cap is NOT what is refusing. Rule 2 is satisfied by the
     * completed collections, the draw is reached, and it declines because there
     * is genuinely nothing to give.
     */
    const open = ['base', ...offerable()]
    const s = state({ open, owned: allOwned(open), lastOpened: 'africa' })
    expect(activeIds(s)).toEqual([])
    expect(candidates(s)).toEqual([])
    expect(nextToOpen(s, mulberry32(13))).toBeNull()
    expect(fillToCap(s, mulberry32(13))).toEqual([])
  })
})
