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
 * >>> THE POOL IS TWO COLLECTIONS WIDE TODAY, and that is why `PLENTY` exists.
 * >>> It was four — garden, home-pets, night-time and africa — until 4 August,
 * >>> when the album and the unlocker moved from BUILT to RELEASED on Joe's
 * >>> ruling (*"i only want to see in the album the silhouette cards for the
 * >>> animals that have successfully pushed"*). Africa, Night Time and Farm are
 * >>> built end to end and pushed nowhere, so they read as UNBUILT here, which
 * >>> under JT-047 means they read as COMPLETE and free their slot: a board made
 * >>> of them proves the opposite of what it says.
 * >>>
 * >>> So the tests about the RULES — the cap, the release, fill-to-cap — take
 * >>> `board()` and its synthetic supply, and the tests about the LIVE state keep
 * >>> `state()` and the real one. Neither needs editing when Joe pushes a set,
 * >>> which is the property the old fixtures kept losing.
 */
import { describe, it, expect } from 'vitest'
import {
  OPEN_AT, MAX_ACTIVE, HELD_BACK_BY_JOE, RELATED_GROUP, PIPELINE_ORDER, heldBack,
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
 * A SUPPLY BIGGER THAN THE CAP, for the tests that are about the RULES.
 *
 * The cadence's rules — four active, one more per completion, never a fifth —
 * can only be measured when there are more collections to offer than the cap.
 * Until 4 August the live board happened to provide that. Then the album and the
 * unlocker moved from BUILT to RELEASED (Joe: *"i only want to see in the album
 * the silhouette cards for the animals that have successfully pushed"*), and the
 * offerable pool fell to TWO — garden and home-pets — because Africa, Night Time
 * and Farm are built end to end and pushed nowhere.
 *
 * A test that asserted "four active" against the live board after that would be
 * measuring Joe's pushing rather than the cadence. So the rule tests take this
 * map, and the tests that are genuinely about the live board keep `BUILT`. It
 * also stops them needing an edit every time he pushes a set.
 */
const PLENTY: Record<string, number> = Object.fromEntries(
  COLLECTIONS.map(c => [c.id, Math.max(BUILT[c.id] ?? 0, 8)]),
)

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

/**
 * The same board, on the synthetic supply — for the tests about the RULES.
 *
 * See `PLENTY`. Module-level rather than inside one describe because the cap,
 * the release and the fill-to-cap tests all need it and they sit in three
 * different blocks.
 */
function board(o: Partial<UnlockState> & { open: readonly string[] }): UnlockState {
  return state({ built: PLENTY, ...o })
}

/** Every id owned in full, so nothing is active and everything is at 100%. */
function allOwned(
  ids: readonly string[], b: Readonly<Record<string, number>> = BUILT,
): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, b[id] ?? 0]))
}

describe('the dials are the numbers Joe gave, spelled out', () => {
  it('opens at 80%, caps at 3, and holds back Joe\'s three by name', () => {
    expect(OPEN_AT).toBe(0.80)
    /* FOUR BECAME THREE on 4 August — Joe: "have 3 albums on the go." */
    expect(MAX_ACTIVE).toBe(3)
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
    const s = board({
      open: ['garden', 'home-pets'],
      owned: { garden: atOpen('garden'), 'home-pets': 1 },
      lastOpened: 'home-pets',
    })
    expect(nextToOpen(s, mulberry32(4))).not.toBeNull()
  })
})

describe('"never more than 4 collections active"', () => {
  /*
   * THE FOUR ARE FOUR THAT HAVE ANIMALS ON THE BOARD BEING TESTED. This used to
   * be garden, ocean, ice and outback; three of those had nothing built, so under
   * JT-047 they read as 100% and are NOT active at all — a board made of them
   * would have one active collection in it and would prove nothing about a cap
   * of four.
   *
   * >>> 4 AUGUST: it then became garden/home-pets/night-time/africa, and two of
   * >>> THOSE fell away when the unlocker moved to RELEASED — only garden and
   * >>> home-pets have anything pushed. There is no longer a live board with four
   * >>> active collections on it, so this block runs on `PLENTY` (see its note):
   * >>> the cap is a rule about the cadence and must be measurable whatever Joe
   * >>> has pushed this afternoon.
   */
  /* As many non-base collections as the cap allows, so the board sits exactly
   * at it. Sliced rather than typed out, because the cap moved from 4 to 3 on
   * 4 August and the rule under test is about the cap, not about a number. */
  const fourActive = ['garden', 'home-pets', 'night-time', 'africa'].slice(0, MAX_ACTIVE)

  it('counts active as opened-and-not-complete', () => {
    // Base is the completed fifth: twenty-four owned of twenty-four built, which
    // is a real completion rather than the vacuous one an empty collection gives.
    const s = board({
      open: ['base', ...fourActive],
      owned: { ...allOwned(['base'], PLENTY), garden: 2 },
    })
    expect(activeIds(s)).toEqual(fourActive)
    expect(isComplete(s, 'base')).toBe(true)
  })

  it('blocks one past the cap even when an open collection is past 80%', () => {
    const s = board({
      open: fourActive,
      owned: { garden: atOpen('garden'), 'home-pets': atOpen('home-pets') },
      lastOpened: 'africa',
    })
    expect(activeIds(s)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(s, mulberry32(5))).toBeNull()
  })

  it('counts base as an active collection like any other while it is unfinished', () => {
    const s = board({
      open: ['base', 'garden', 'home-pets', 'night-time'].slice(0, MAX_ACTIVE),
      owned: { base: atOpen('base') },
      lastOpened: 'home-pets',
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
  const four = ['base', 'garden', 'home-pets', 'night-time'].slice(0, MAX_ACTIVE)

  it('releases exactly one when one of the four is finished, and then blocks again', () => {
    // Same four, but Garden is now complete: three active, and the finished one
    // is sitting at 100%, which is what satisfies the 80% trigger.
    const released = board({
      open: four,
      owned: { ...allOwned(['garden']), 'home-pets': 3 },
      lastOpened: 'night-time',
    })
    expect(activeIds(released)).toHaveLength(MAX_ACTIVE - 1)
    const opened = nextToOpen(released, mulberry32(7))
    expect(opened).not.toBeNull()

    // Fold the opening back in. Four active again -> the answer is null again,
    // so one completion bought exactly one opening.
    const after = board({
      open: [...four, opened!],
      owned: released.owned,
      lastOpened: opened,
    })
    expect(activeIds(after)).toHaveLength(MAX_ACTIVE)
    expect(nextToOpen(after, mulberry32(7))).toBeNull()
  })

  it('a second completion buys a second opening', () => {
    /*
     * TWO FINISHED, so two slots are free and the cadence still has something to
     * put in the first of them. The board is at the cap with two of its three
     * complete: one active, two below the line.
     *
     * On `PLENTY` rather than the live board, for the reason its own note gives —
     * the real supply is two collections wide today, so a live board would return
     * null for want of STOCK rather than for want of entitlement and the test
     * would pass for the wrong reason.
     */
    const s = board({
      open: ['base', 'garden', 'home-pets'],
      owned: allOwned(['garden', 'home-pets'], PLENTY),
      lastOpened: 'home-pets',
    })
    expect(activeIds(s)).toHaveLength(MAX_ACTIVE - 2)
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

  it('separates related collections IN THE ORDER, which is where that rule lives now', () => {
    /*
     * >>> THE FILTER IS GONE, 4 August 2026, and its job moved into the pipeline.
     *
     * This used to walk the roster asserting that `draw` never picked a
     * collection sharing a `RELATED_GROUP` with the last one opened — a filter
     * with a documented fallback for when avoiding the group left nothing to
     * open at all. Both existed because the draw was uniform over the whole pool
     * and could put Africa next to Jungle.
     *
     * Joe replaced the random draw with an explicit order: *"keep a set order in
     * which they are opened ... order of the collections is your's to set."* An
     * order does the same job without a filter and without a fallback branch —
     * so the property is now a fact about `PIPELINE_ORDER` and is asserted
     * directly against it, which is both stronger and readable at a glance.
     *
     * `RELATED_GROUP` survives as the RECORD of which collections read as
     * related to a five-year-old. It is what the order was built from, and this
     * is what stops the two drifting apart.
     */
    const inPipeline = PIPELINE_ORDER.filter((id) => id !== 'base')
    for (let i = 1; i < inPipeline.length; i++) {
      const here = RELATED_GROUP[inPipeline[i]!]
      const before = RELATED_GROUP[inPipeline[i - 1]!]
      if (here === undefined || before === undefined) continue
      /*
       * THE CONSERVATION LADDER IS THE ONE EXEMPTION, and it is the opposite
       * case rather than a hole. Those four share a group and run consecutively
       * ON PURPOSE — their order carries the meaning, least threatened to most —
       * so a habitat page dropped between `vulnerable` and `endangered` would
       * break the only thing they are for. The rule stops a draw feeling
       * repetitive; a ladder is not repetition.
       */
      if (here === 'conservation' && before === 'conservation') continue
      expect(here, `${inPipeline[i - 1]} is followed by ${inPipeline[i]}`).not.toBe(before)
    }

    // And the ladder really is in threat order, which is why it is exempt.
    expect(PIPELINE_ORDER.filter((id) => RELATED_GROUP[id] === 'conservation'))
      .toEqual(['near-threatened', 'vulnerable', 'endangered', 'critically-endangered'])
  })

  it('offers the pipeline in order, and offers nothing that is not in it', () => {
    /*
     * The order IS the cadence now, so this is the assertion that the pool comes
     * out of `candidates` in the order a child will meet it. A collection left
     * out of `PIPELINE_ORDER` is offered to nobody — deliberate, and the safe
     * direction to fail: an unplaced collection is one nobody has decided where
     * to put, and showing it early is a decision by accident.
     */
    const s = state({ open: ['base'], built: PLENTY })
    const pool = candidates(s)
    const want = PIPELINE_ORDER.filter((id) => id !== 'base' && !heldBack(PLENTY, id))
    expect(pool).toEqual(want)

    // And every collection the roster has is either in the pipeline or held back,
    // so nothing can be silently unreachable.
    const placed = new Set(PIPELINE_ORDER)
    for (const c of COLLECTIONS) {
      const known = placed.has(c.id) || HELD_BACK_BY_JOE.includes(c.id)
      expect(known, `${c.id} is in neither PIPELINE_ORDER nor Joe's hold`).toBe(true)
    }
  })

  it('weights the front of the queue 50 / 35 / 15, over many draws', () => {
    /*
     * Joe: *"probability of opening the earliest: 50%, 2nd: 35%, 3rd: 15%."*
     *
     * Measured over 4,000 seeded draws from the same board, so it is the real
     * distribution rather than the arithmetic restated. The tolerance is wide
     * enough that sampling noise cannot fail it and narrow enough that swapping
     * two weights, or going back to a uniform draw, would.
     */
    const s = state({ open: ['base'], built: PLENTY })
    const pool = candidates(s)
    expect(pool.length, 'need at least three waiting to measure this').toBeGreaterThanOrEqual(3)

    const hits = new Map<string, number>()
    const N = 4000
    for (let seed = 0; seed < N; seed++) {
      const id = nextToOpen(state({
        open: ['base'], owned: allOwned(['base'], PLENTY), built: PLENTY,
      }), mulberry32(seed))
      if (id !== null) hits.set(id, (hits.get(id) ?? 0) + 1)
    }

    const share = (id: string): number => (hits.get(id) ?? 0) / N
    expect(share(pool[0]!), `${pool[0]} should be ~50%`).toBeGreaterThan(0.45)
    expect(share(pool[0]!), `${pool[0]} should be ~50%`).toBeLessThan(0.55)
    expect(share(pool[1]!), `${pool[1]} should be ~35%`).toBeGreaterThan(0.30)
    expect(share(pool[1]!), `${pool[1]} should be ~35%`).toBeLessThan(0.40)
    expect(share(pool[2]!), `${pool[2]} should be ~15%`).toBeGreaterThan(0.11)
    expect(share(pool[2]!), `${pool[2]} should be ~15%`).toBeLessThan(0.19)
    // And nothing past the third place is ever drawn.
    for (const id of pool.slice(3)) expect(hits.get(id) ?? 0, `${id} was drawn`).toBe(0)
  })

  it('opens the last collection in the game with certainty, not with 50%', () => {
    /* The weights are normalised over what is actually waiting. Without that,
     * half the draws would fall past the end of a one-item list and a child would
     * be told nothing opens when something plainly should. */
    const only = { ...PLENTY }
    for (const c of COLLECTIONS) if (c.id !== 'base' && c.id !== 'farm') only[c.id] = 0
    for (let seed = 0; seed < 50; seed++) {
      const s = state({ open: ['base'], owned: allOwned(['base'], only), built: only })
      expect(candidates(s)).toEqual(['farm'])
      expect(nextToOpen(s, mulberry32(seed))).toBe('farm')
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
     * (base 24, garden 14, home-pets 16, farm 16, night-time 13, africa 1, the
     * rest zero — pinned in `tests/island/species-built.test.ts` and
     * `tests/island/species-registry.test.ts`). The measurement below says so
     * out loud instead of a loop that would run zero times and claim cover.
     *
     * `heldBack`'s SIGNATURE is what makes the confusion unrepeatable: it takes
     * a map of built counts and has no way to ask how many records exist.
     *
     * >>> FARM WAS THE CASE THIS BLOCK WAS WAITING FOR, and it arrived on 3
     * >>> August (PB-074) NOT in the shape predicted. The prediction was sixteen
     * >>> records then zero models, which would have reddened the FIRST
     * >>> assertion. Instead the records and the sixteen models landed in the
     * >>> same run, so `shippedIn` and `builtIn` still agree, the first
     * >>> assertion stayed green, and it was the THIRD — `built('farm') === 0` —
     * >>> that went red. The hold was correct throughout and `unlock.ts` was not
     * >>> touched, which is the part the prediction got right.
     * >>>
     * >>> `woodland` is the stand-in now: no records, no models, and not on
     * >>> Joe's list, so the second clause is still what does the refusing.
     */
    /*
     * >>> AND ON 4 AUGUST THE CASE FINALLY ARRIVED, by a third route nobody
     * >>> predicted: not records-without-models, but MODELS WITHOUT A PUSH.
     * >>> `builtIn` filters on RELEASED now — Joe: *"i only want to see in the
     * >>> album the silhouette cards for the animals that have successfully
     * >>> pushed"* — so Africa, Night Time and Farm have records, have models,
     * >>> and answer ZERO. The hold refuses all three, and it is right to: a
     * >>> child opening one of those albums today would find nothing in it she
     * >>> could hatch.
     * >>>
     * >>> `unlock.ts` was not touched for any of it, which is the point the
     * >>> block is making. The predicate takes built counts and cannot be fooled
     * >>> by records however the counts are derived.
     */
    const recordsWithoutModels = COLLECTIONS.map((c) => c.id)
      .filter((id) => shippedIn(id).length > 0 && builtIn(id).length === 0)
    expect(recordsWithoutModels.sort(), 'the set of records-with-nothing-released moved')
      .toEqual(['africa', 'farm', 'night-time'])
    for (const id of recordsWithoutModels) {
      expect(heldBack(BUILT, id), `${id} is offered with nothing released in it`).toBe(true)
    }

    // Woodland today: no records, no models, held back. The assertion that
    // matters is that the SECOND clause is what does the refusing, and it still
    // will when woodland's records land.
    expect(built('woodland')).toBe(0)
    expect(heldBack(BUILT, 'woodland')).toBe(true)
    expect(HELD_BACK_BY_JOE).not.toContain('woodland')
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
    const s = board({ open: ['base'] })
    const drawn = fillToCap(s, mulberry32(12))
    expect(drawn).toHaveLength(MAX_ACTIVE - 1)
    expect(new Set(drawn).size).toBe(drawn.length)
    for (const id of drawn) expect(offerable(PLENTY)).toContain(id)

    // Called again on the filled state it has nothing to add.
    const filled = board({ open: ['base', ...drawn], lastOpened: drawn[drawn.length - 1]! })
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
