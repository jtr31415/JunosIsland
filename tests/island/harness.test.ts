/**
 * A3 — the harness, the island's single choke point for policy.
 *
 * These tests drive the module directly. It is deliberately pure: no DOM, no
 * clock it does not own, no generators. What it knows is which stages a child
 * is allowed to be dealt and how she has been doing on them; what it never does
 * is render, deal or persist.
 *
 * NOT COVERED HERE, and deliberately: which PATH a deal moment picks when two
 * of them are live (sums vs takingAway, reading vs building). That is JT-010,
 * open with Joe — see docs/pet-island-runA.md, FIELD NOTES — A3.
 */
import { describe, it, expect } from 'vitest'
import {
  createAttainment, createHarness, readAttainment, STAGES, LIVE_PATHS, RESERVED_PATHS,
} from '../../src/island/harness'
import type { AttemptEvent } from '../../src/island/attempts'

/** An attempt with everything switched off, so a test states only what it means. */
const attempt = (over: Partial<AttemptEvent> = {}): AttemptEvent => ({
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0, ...over,
})

describe('the stages that exist', () => {
  it('lists only generators that are actually built', () => {
    // A4: sums [1 to-ten, 2 to-twenty bridging] · takingAway [1,2,3 as v0] ·
    // reading [1] · building [1].
    expect(STAGES.sums).toEqual([1, 2])
    expect(STAGES.takingAway).toEqual([1, 2, 3])
    expect(STAGES.reading).toEqual([1])
    expect(STAGES.building).toEqual([1])
  })

  it('gives reading and building exactly one stage, because level 2 is the alien', () => {
    /*
     * Not an oversight and not a placeholder. `generateRead` level 2 is the
     * ALIEN generator (read.ts:29) and `generateBuild` level 2 likewise
     * (build.ts:25), and the no-aliens ruling retires both. So the tickbox on
     * these two paths is a capability switch with no ladder behind it, and a
     * future rung means a new generator rather than a new number here.
     */
    expect(STAGES.reading).toHaveLength(1)
    expect(STAGES.building).toHaveLength(1)
  })

  it('names the four reserved paths without giving them stages', () => {
    // A4: greyed, empty, "coming later" — slots only.
    expect(RESERVED_PATHS).toEqual(
      ['storySums', 'fractions', 'multiplication', 'division'])
    for (const p of RESERVED_PATHS) {
      expect(Object.prototype.hasOwnProperty.call(STAGES, p)).toBe(false)
    }
  })

  it('has four live paths and no overlap with the reserved ones', () => {
    expect(LIVE_PATHS).toEqual(['sums', 'takingAway', 'reading', 'building'])
    for (const p of LIVE_PATHS) expect(RESERVED_PATHS).not.toContain(p)
  })
})

describe('a fresh island', () => {
  it('starts every path in auto with honest zeroes', () => {
    const a = createAttainment()
    for (const p of LIVE_PATHS) {
      expect(a[p].mode).toBe('auto')
      for (const s of STAGES[p]) {
        const st = a[p].stages[s]
        expect(st).toBeDefined()
        expect(st?.attempts).toBe(0)
        expect(st?.ewma).toBeNull()
        expect(st?.latencies).toEqual([])
        expect(st?.sessions).toEqual([])
        expect(st?.rescues).toEqual([])
      }
    }
  })

  it('ticks exactly what the island can already deal today', () => {
    /*
     * The first rung of each path she is already playing, and nothing else.
     * takingAway starts UNTICKED because the island has never dealt a
     * subtraction — ticking it would hand her something new on the strength of
     * a migration rather than of a decision (JT-007 is Joe ticking it himself).
     */
    const a = createAttainment()
    expect(a.sums.stages[1]?.ticked).toBe(true)
    expect(a.sums.stages[2]?.ticked).toBe(false)
    expect(a.reading.stages[1]?.ticked).toBe(true)
    expect(a.building.stages[1]?.ticked).toBe(true)
    for (const s of STAGES.takingAway) {
      expect(a.takingAway.stages[s]?.ticked).toBe(false)
    }
  })

  it('is not the same object twice, so two islands cannot share a stage', () => {
    const a = createAttainment()
    const b = createAttainment()
    a.sums.stages[1]!.attempts = 99
    expect(b.sums.stages[1]?.attempts).toBe(0)
  })
})

describe('levelFor — which stages she may be dealt', () => {
  it('returns the ticked stages of the path, in order', () => {
    const h = createHarness(createAttainment())
    expect(h.levelFor('sums')).toEqual([1])
    expect(h.levelFor('reading')).toEqual([1])
    expect(h.levelFor('takingAway')).toEqual([])
  })

  it('follows a tick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    a.sums.stages[2]!.ticked = true
    expect(h.levelFor('sums')).toEqual([1, 2])
  })

  it('follows an untick, because untick is a parent\'s hand', () => {
    const a = createAttainment()
    const h = createHarness(a)
    a.sums.stages[1]!.ticked = false
    expect(h.levelFor('sums')).toEqual([])
  })

  it('never returns a stage that has no generator behind it', () => {
    const a = createAttainment()
    // A hand-edited save, a rolled-back build, a future stage id: all the same
    // kind of untrusted input, and none of them may reach a generator.
    a.sums.stages[7] = { ...a.sums.stages[1]!, ticked: true }
    const h = createHarness(a)
    expect(h.levelFor('sums')).toEqual([1])
  })

  it('returns nothing at all for a reserved path', () => {
    const h = createHarness(createAttainment())
    // Typed out of reach; asked anyway, because a save is untrusted input.
    expect(h.levelFor('fractions' as never)).toEqual([])
  })
})

describe('pick — the draw across ticked stages', () => {
  it('draws uniformly, which is Run A policy and Run B\'s to replace', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    const h = createHarness(a)
    const seen = new Set<number>()
    // A deterministic sweep rather than a random one: the draw must reach both
    // ends of the set and nothing outside it.
    for (const r of [0, 0.49, 0.5, 0.99]) seen.add(h.pick('sums', () => r)!)
    expect([...seen].sort()).toEqual([1, 2])
  })

  it('gives back null when the path is empty, rather than a stage she cannot do', () => {
    const h = createHarness(createAttainment())
    expect(h.pick('takingAway', () => 0)).toBeNull()
  })

  it('never runs off the end on an rng that returns exactly 1', () => {
    // Rng contracts say [0,1), and a hand-written stub in some future test will
    // eventually say 1. That must not deal `undefined` to a generator.
    const h = createHarness(createAttainment())
    expect(h.pick('sums', () => 1)).toBe(1)
  })
})

describe('recordAttempt — the stats a report will read', () => {
  it('attributes to the stage the harness last dealt', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt())
    expect(a.sums.stages[1]?.attempts).toBe(1)
    expect(a.sums.stages[2]?.attempts).toBe(0)
  })

  it('drops an attempt that arrives before anything was dealt', () => {
    /*
     * Not defensive noise: the overlay emits from a tally that outlives a
     * single round, and a mis-wire that attributed stray attempts to whatever
     * was dealt last would corrupt a stage silently — the one failure mode a
     * measurement system must not have.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.recordAttempt(attempt())
    for (const p of LIVE_PATHS) {
      for (const s of STAGES[p]) expect(a[p].stages[s]?.attempts).toBe(0)
    }
  })

  it('seeds the EWMA with the first answer instead of climbing out of zero', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    // Seeding at 0 would say a child who has got everything right is at .15.
    expect(a.sums.stages[1]?.ewma).toBe(1)
  })

  it('moves the EWMA by alpha .15 thereafter', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    h.recordAttempt(attempt({ correct: false }))
    // 1 + .15 * (0 - 1)
    expect(a.sums.stages[1]?.ewma).toBeCloseTo(0.85, 10)
  })

  it('keeps the latencies of CORRECT attempts only', () => {
    /*
     * A6 takes a correct-only median, so a wrong attempt's latency is not
     * merely unused — it is a different measurement. A child who taps
     * instantly and wrongly would otherwise read as fast.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true, latencyMs: 900 }))
    h.recordAttempt(attempt({ correct: false, latencyMs: 20 }))
    expect(a.sums.stages[1]?.latencies).toEqual([900])
  })

  it('drops a null latency without dropping the attempt', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('reading', 1)
    h.recordAttempt(attempt({ kind: 'find', correct: true, latencyMs: null }))
    expect(a.reading.stages[1]?.latencies).toEqual([])
    expect(a.reading.stages[1]?.attempts).toBe(1)
    expect(a.reading.stages[1]?.ewma).toBe(1)
  })

  it('holds the last 30 latencies and no more', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 40; i++) h.recordAttempt(attempt({ latencyMs: i }))
    const ring = a.sums.stages[1]?.latencies ?? []
    expect(ring).toHaveLength(30)
    expect(ring[0]).toBe(10)
    expect(ring[29]).toBe(39)
  })

  it('freezes an early baseline the ring would otherwise evict', () => {
    /*
     * A6 wants speed as "recent correct-median vs the stage's own EARLY
     * baseline". A ring of 30 cannot answer that — by the time there is a
     * trend to see, the beginning has been overwritten by it. So the first ten
     * correct latencies are kept once and never touched again.
     */
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 40; i++) h.recordAttempt(attempt({ latencyMs: i }))
    expect(a.sums.stages[1]?.early).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('counts a rescued attempt as rescued on the session it lands in', () => {
    const a = createAttainment()
    const h = createHarness(a, () => Date.parse('2026-07-28T10:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: false, rescued: true }))
    expect(a.sums.stages[1]?.rescues).toHaveLength(1)
  })
})

describe('sessions — the consistency raw material', () => {
  const day = (iso: string) => () => Date.parse(iso)

  it('opens a session on the first attempt of a date', () => {
    const a = createAttainment()
    const h = createHarness(a, day('2026-07-28T09:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    h.recordAttempt(attempt({ correct: false }))
    expect(a.sums.stages[1]?.sessions).toEqual([
      { date: '2026-07-28', correct: 1, total: 2 },
    ])
  })

  it('starts a new one when the date changes', () => {
    const a = createAttainment()
    let iso = '2026-07-28T09:00:00Z'
    const h = createHarness(a, () => Date.parse(iso))
    h.dealt('sums', 1)
    h.recordAttempt(attempt({ correct: true }))
    iso = '2026-07-29T09:00:00Z'
    h.recordAttempt(attempt({ correct: true }))
    const s = a.sums.stages[1]?.sessions ?? []
    expect(s).toHaveLength(2)
    expect(s[1]).toEqual({ date: '2026-07-29', correct: 1, total: 1 })
  })

  it('keeps the last six and drops the oldest', () => {
    const a = createAttainment()
    let d = 1
    const h = createHarness(a, () => Date.parse(`2026-06-${String(d).padStart(2, '0')}T09:00:00Z`))
    h.dealt('sums', 1)
    for (d = 1; d <= 9; d++) h.recordAttempt(attempt({ correct: true }))
    const s = a.sums.stages[1]?.sessions ?? []
    expect(s).toHaveLength(6)
    expect(s[0]?.date).toBe('2026-06-04')
    expect(s[5]?.date).toBe('2026-06-09')
  })

  it('counts sessions per stage, not per island', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    const h = createHarness(a, day('2026-07-28T09:00:00Z'))
    h.dealt('sums', 1)
    h.recordAttempt(attempt())
    h.dealt('sums', 2)
    h.recordAttempt(attempt())
    expect(a.sums.stages[1]?.sessions).toHaveLength(1)
    expect(a.sums.stages[2]?.sessions).toHaveLength(1)
  })
})

describe('noteRescue — transient, in-session only', () => {
  it('remembers a rescue for the rest of the session', () => {
    const h = createHarness(createAttainment())
    expect(h.rescuedThisSession('sums')).toBe(false)
    h.noteRescue('sums')
    expect(h.rescuedThisSession('sums')).toBe(true)
  })

  it('keeps the paths apart', () => {
    const h = createHarness(createAttainment())
    h.noteRescue('sums')
    expect(h.rescuedThisSession('reading')).toBe(false)
  })

  it('writes nothing into the attainment, which is what makes it transient', () => {
    const a = createAttainment()
    const before = JSON.stringify(a)
    createHarness(a).noteRescue('sums')
    expect(JSON.stringify(a)).toBe(before)
  })
})

describe('the Run B surface, declared and inert', () => {
  /*
   * Shipped now so Run B's shape is pinned while A4–A6 are built against it,
   * and pinned INERT so a half-wired probe cannot start dealing extra
   * questions or paying 3 for them before the policy that governs it exists.
   */
  it('never wants a probe', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 50; i++) h.recordAttempt(attempt({ correct: true }))
    for (const p of LIVE_PATHS) expect(h.probeWanted(p)).toBe(false)
  })

  it('never has an offer due', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 50; i++) h.recordAttempt(attempt({ correct: true }))
    for (const p of LIVE_PATHS) expect(h.offerDue(p)).toBe(false)
  })

  it('records nothing when an offer is noted, accepted or not', () => {
    const a = createAttainment()
    const h = createHarness(a)
    const before = JSON.stringify(a)
    h.noteOffer('sums', true)
    h.noteOffer('sums', false)
    expect(JSON.stringify(a)).toBe(before)
    expect(h.offerDue('sums')).toBe(false)
  })

  it('cannot tick a stage by itself — auto only ever ticks in Run B', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.dealt('sums', 1)
    for (let i = 0; i < 200; i++) h.recordAttempt(attempt({ correct: true }))
    expect(a.sums.stages[2]?.ticked).toBe(false)
    expect(h.levelFor('sums')).toEqual([1])
  })
})

describe('a deal moment — JT-010(1), the share of maths stays by tick', () => {
  /*
   * Joe: *"share of maths stays by tick, one easy sum, one easy sub and one
   * medium sum, is 2/3 sum 1/3 sub. but as soon as sub becomes proficient for
   * the next level, the next triggers and the share is 1:1 again."*
   *
   * So the maths deal moment pools the ticked stages of BOTH paths and draws
   * uniformly over the pool — the share is a consequence of the ladder rather
   * than a number anyone sets, and the drift he was shown is the drift he
   * wants, because Run B ticking the next sub rung is what levels it again.
   */
  const mathsShare = (a: ReturnType<typeof createAttainment>): Record<string, number> => {
    const h = createHarness(a)
    const tally: Record<string, number> = {}
    const N = 600
    for (let i = 0; i < N; i++) {
      // A deterministic sweep of [0,1), so this measures the SPLIT and not an rng.
      const got = h.dealMaths(() => i / N)
      const key = got ? got.path + ':' + got.stage : 'none'
      tally[key] = (tally[key] ?? 0) + 1
    }
    return tally
  }

  it('deals only sums when only sums are ticked', () => {
    expect(mathsShare(createAttainment())).toEqual({ 'sums:1': 600 })
  })

  it('splits evenly the moment a take-away is ticked — JT-007\'s evening', () => {
    const a = createAttainment()
    a.takingAway.stages[1]!.ticked = true
    expect(mathsShare(a)).toEqual({ 'sums:1': 300, 'takingAway:1': 300 })
  })

  it('is 2/3 sums and 1/3 take-aways on Joe\'s own worked example', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    a.takingAway.stages[1]!.ticked = true
    expect(mathsShare(a)).toEqual({ 'sums:1': 200, 'sums:2': 200, 'takingAway:1': 200 })
  })

  it('is level again once the next take-away rung ticks, exactly as he said', () => {
    const a = createAttainment()
    a.sums.stages[2]!.ticked = true
    a.takingAway.stages[1]!.ticked = true
    a.takingAway.stages[2]!.ticked = true
    const share = mathsShare(a)
    const sums = (share['sums:1'] ?? 0) + (share['sums:2'] ?? 0)
    const subs = (share['takingAway:1'] ?? 0) + (share['takingAway:2'] ?? 0)
    expect(sums).toBe(subs)
  })

  it('deals nothing at all when the whole of maths is unticked', () => {
    const a = createAttainment()
    a.sums.stages[1]!.ticked = false
    expect(createHarness(a).dealMaths(() => 0)).toBeNull()
  })
})

describe('a reading page — JT-010(2), three builds to one find', () => {
  /*
   * Joe: *"reading mix should be 3 build, 1 find. period."* — which is what
   * balance.json has said all along. The bug was never the data (PB-038).
   */
  const kinds = (a: ReturnType<typeof createAttainment>, n: number): string[] => {
    const h = createHarness(a)
    return Array.from({ length: n }, (_, page) => h.dealReading(page) ?? 'none')
  }

  it('gives one find page in four', () => {
    expect(kinds(createAttainment(), 8)).toEqual(
      ['find', 'build', 'build', 'build', 'find', 'build', 'build', 'build'])
  })

  it('gives her every page as a find when building is unticked', () => {
    // The tickbox is a capability and the mix is a preference: where they
    // disagree the parent wins, or a data file would be overruling him.
    const a = createAttainment()
    a.building.stages[1]!.ticked = false
    expect(new Set(kinds(a, 8))).toEqual(new Set(['find']))
  })

  it('gives her every page as a build when reading is unticked', () => {
    const a = createAttainment()
    a.reading.stages[1]!.ticked = false
    expect(new Set(kinds(a, 8))).toEqual(new Set(['build']))
  })

  it('deals nothing when neither is ticked', () => {
    const a = createAttainment()
    a.reading.stages[1]!.ticked = false
    a.building.stages[1]!.ticked = false
    expect(createHarness(a).dealReading(0)).toBeNull()
  })
})

describe('the last tick is protected — JT-010(3)', () => {
  /*
   * Joe: *"prevent unticking the last tick on each path."*
   *
   * READ AS THE DEAL MOMENT rather than the single path, and the reason is his
   * own earlier card. JT-007 has him ticking takingAway 1 to try it, and says
   * in terms that *"untick is a parent's hand, not a demotion, so it is safe to
   * try"* — a literal per-path rule would make that tick permanent the instant
   * he made it, which is the opposite of safe to try. What the guard is for is
   * the harm he was actually shown: a child tapping a plot, or an egg, and
   * finding nothing there. So each DEAL MOMENT keeps at least one ticked stage,
   * and inside a moment either path may go empty.
   */
  it('refuses the last maths tick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.canUntick('sums', 1)).toBe(false)
    expect(h.setTicked('sums', 1, false)).toBe(false)
    expect(a.sums.stages[1]?.ticked).toBe(true)
  })

  it('allows it once a take-away is standing behind it', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.setTicked('takingAway', 1, true)
    expect(h.canUntick('sums', 1)).toBe(true)
    expect(h.setTicked('sums', 1, false)).toBe(true)
    expect(createHarness(a).dealMaths(() => 0)).toEqual({ path: 'takingAway', stage: 1 })
  })

  it('lets Joe undo the evening he tried subtraction — JT-007 stays safe to try', () => {
    const a = createAttainment()
    const h = createHarness(a)
    h.setTicked('takingAway', 1, true)
    expect(h.canUntick('takingAway', 1)).toBe(true)
    expect(h.setTicked('takingAway', 1, false)).toBe(true)
    expect(a.takingAway.stages[1]?.ticked).toBe(false)
  })

  it('lets one whole path inside a moment go empty', () => {
    // Reading unticked with building still ticked: the egg still hatches, and
    // a parent who wants only word-building may have it.
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.setTicked('reading', 1, false)).toBe(true)
    expect(h.canUntick('building', 1)).toBe(false)
  })

  it('never blocks a tick, only an untick', () => {
    const a = createAttainment()
    const h = createHarness(a)
    expect(h.setTicked('sums', 2, true)).toBe(true)
    expect(a.sums.stages[2]?.ticked).toBe(true)
  })

  it('refuses a stage that has no generator rather than inventing one', () => {
    const h = createHarness(createAttainment())
    expect(h.setTicked('reading', 2, true)).toBe(false)
    expect(h.levelFor('reading')).toEqual([1])
  })
})

describe('a save can never strand her in a round that cannot be dealt', () => {
  /*
   * `openRead`/`openSum` decline when their moment has nothing ticked, and a
   * port that declines leaves the flow in 'challenge' with no overlay and no
   * way out but a reload — the exact fault main.ts:1669 records having already
   * been fixed once. The panel cannot produce that state (JT-010(3) refuses
   * the last untick), but a save is untrusted input and a hand-edited one can.
   *
   * So the invariant is enforced where the untrusted data enters, not only at
   * the UI: a moment with nothing ticked is not a preference, it is corruption,
   * and corruption yields the default rather than an unplayable island.
   */
  it('gives maths back its first rung when a save has emptied the whole moment', () => {
    const a = readAttainment({
      sums: { mode: 'manual', stages: { 1: { ticked: false }, 2: { ticked: false } } },
      takingAway: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(createHarness(a).dealMaths(() => 0)).toEqual({ path: 'sums', stage: 1 })
  })

  it('gives reading back its first rung the same way', () => {
    const a = readAttainment({
      reading: { mode: 'manual', stages: { 1: { ticked: false } } },
      building: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(createHarness(a).dealReading(0)).not.toBeNull()
  })

  it('leaves a moment alone when one of its paths is still ticked', () => {
    // Reading off, building on, is a coherent thing for a parent to want.
    const a = readAttainment({
      reading: { mode: 'manual', stages: { 1: { ticked: false } } },
      building: { mode: 'manual', stages: { 1: { ticked: true } } },
    })
    expect(a.reading.stages[1]?.ticked).toBe(false)
    expect(createHarness(a).dealReading(0)).toBe('build')
  })

  it('keeps the stats it repaired the ticks on', () => {
    // Repairing capability must not throw away measurement — that is history,
    // and it is the only record of what she has actually done.
    const a = readAttainment({
      sums: { mode: 'manual', stages: { 1: { ticked: false, attempts: 42, ewma: 0.9 } } },
      takingAway: { mode: 'manual', stages: { 1: { ticked: false } } },
    })
    expect(a.sums.stages[1]?.ticked).toBe(true)
    expect(a.sums.stages[1]?.attempts).toBe(42)
    expect(a.sums.stages[1]?.ewma).toBe(0.9)
  })
})
