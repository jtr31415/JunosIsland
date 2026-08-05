/**
 * The dealt reading stage (Task 4b).
 *
 * `dealReading` used to answer only "find or build?"; `main.ts:1189` then
 * hardcoded the stage that went with it, because there was nothing to ask.
 * Harmless while reading had one rung — inert once it had ten.
 *
 * Joe, 5 Aug: *"mirror maths for now."* So the stage is drawn the same way
 * `dealMaths` draws one — uniformly over the ticked stages of the ladder the
 * chosen page KIND points at (JT-010(1)) — and `main.ts` uses what comes
 * back instead of the literal `1`.
 *
 * UPDATED, task 5 integration ruling (5 Aug): "the ladder the chosen page
 * KIND points at" is no longer literally true for a build page. `STAGES.
 * building` is `[1]`, a single on/off switch rather than a ladder, so a build
 * page's rung is drawn from the ticked READING stages instead and then mapped
 * one rung down by `buildStageFor` (`deal.ts`) — she spells what she read a
 * rung ago. See `harness.ts`'s `dealReading` for the reasoning in full.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createAttainment, createHarness, STAGES } from '../../src/island/harness'

/** A roll sequence, one number per call, so a draw is fully controlled. */
const rolls = (...vs: number[]): (() => number) => {
  let i = 0
  return () => vs[Math.min(i++, vs.length - 1)] as number
}

describe('dealReading also chooses a stage (5 Aug, "mirror maths for now")', () => {
  it('gives a find page a stage that is one of the ticked reading stages', () => {
    const a = createAttainment()
    a.reading.stages[4]!.ticked = true // a second reading rung, above the default id 1
    const h = createHarness(a)
    const deal = h.dealReading(0, rolls(0.9)) // page 0 is a find page (JT-010(2))
    expect(deal?.kind).toBe('find')
    expect(h.levelFor('reading')).toContain(deal?.stage)
  })

  it('gives a build page a reading stage mapped one rung down, not a raw building stage (task 5 integration ruling)', () => {
    // `STAGES.building` is `[1]` — a single on/off switch, not a ladder — so a
    // build page's STAGE is drawn from the ticked READING stages instead and
    // then mapped one rung down by `buildStageFor`. With a fresh island only
    // reading id 1 is ticked, so the draw always lands on it: STAGES.reading =
    // [3, 4, 1, 5, ...], id 1 sits at index 2, and the rung below it is id 4.
    const a = createAttainment()
    const h = createHarness(a)
    const deal = h.dealReading(1, rolls(0.5)) // page 1 is a build page (JT-010(2))
    expect(deal?.kind).toBe('build')
    expect(deal?.stage).not.toBeNull()
    expect(deal?.stage).toBe(4)
    // `STAGES.building` still gates whether a build page is dealt AT ALL (the
    // tickbox), but no longer supplies the rung itself.
    expect(STAGES.building).not.toContain(deal?.stage)
  })

  it('draws more than one distinct stage once several rungs are ticked', () => {
    const a = createAttainment()
    a.reading.stages[4]!.ticked = true
    const h = createHarness(a)
    // levelFor('reading') is [4, 1] in ladder order (STAGES.reading position,
    // not id order) — two rolls that land on each half of a uniform draw.
    expect(h.levelFor('reading')).toEqual([4, 1])
    const seen = new Set<number | null | undefined>()
    for (const r of [0, 0.1, 0.49, 0.5, 0.6, 0.99]) {
      seen.add(h.dealReading(0, rolls(r))?.stage)
    }
    expect(seen.size).toBeGreaterThan(1)
  })

  it('deals nothing when neither reading path has anything ticked', () => {
    const a = createAttainment()
    a.reading.stages[1]!.ticked = false
    a.building.stages[1]!.ticked = false
    const h = createHarness(a)
    expect(h.dealReading(0, rolls(0.5))).toBeNull()
  })

  /*
   * THE LIVE CHILD IS ON READING ID 1. `STARTS_TICKED` ticks exactly that, so
   * with a fresh island (one rung ticked) the uniform draw must return id 1
   * every time, whatever the roll says — she must not move. Her build page
   * follows: reading id 1 mapped one rung down by `buildStageFor` is id 4
   * (task 5 integration ruling), and with only one reading rung ticked that
   * mapping is deterministic too, whatever the roll says.
   */
  it('keeps a fresh island reading id 1 and building id 4, whatever the roll draws', () => {
    const a = createAttainment() // default: reading 1, building 1, nothing else
    const h = createHarness(a)
    for (const r of [0, 0.01, 0.25, 0.5, 0.75, 0.99]) {
      // recordStage equals stage on a find page (nothing to split there) and
      // stays on building's own ladder — stage 1 — for a build page, even
      // though the generator-facing stage above it is the mapped id 4.
      expect(h.dealReading(0, rolls(r))).toEqual({ kind: 'find', stage: 1, recordStage: 1 })
      expect(h.dealReading(1, rolls(r))).toEqual({ kind: 'build', stage: 4, recordStage: 1 })
    }
  })
})

/*
 * FIX ROUND 1 (5 Aug): a build attempt must actually be RECORDED, not
 * silently dropped. Before this fix, `main.ts` attributed a build page's
 * attempt to `harness.dealt('building', dealt.stage)` — and once `stage`
 * became a reading-space id (task 5's whole point), `Attainment.building.
 * stages` had no matching key, `dealt()` set `current` to null, and
 * `recordAttempt` quietly did nothing. No test caught it because nothing
 * exercised the full path — deal, attribute, record — end to end for a
 * build page. This does.
 */
describe('a build page attempt is actually recorded (fix round 1)', () => {
  it('lands on building\'s own stage 1, not the mapped generator stage', () => {
    const a = createAttainment()
    const h = createHarness(a)
    const deal = h.dealReading(1, rolls(0.5)) // page 1 is a build page (JT-010(2))
    expect(deal?.kind).toBe('build')
    // The generator-facing stage is mapped, reading-space, and off building's
    // own ladder entirely — exactly the value that must NOT be used to
    // attribute the attempt.
    expect(deal?.stage).toBe(4)
    expect(deal?.recordStage).toBe(1)

    // This is what main.ts now does: attribute by recordStage, generate by
    // stage. Recording against recordStage must actually move the stats.
    h.dealt('building', deal!.recordStage)
    h.recordAttempt({
      kind: 'build', index: 0, correct: true, latencyMs: 900,
      helped: false, rescued: false, at: 0,
    })
    expect(a.building.stages[1]?.attempts).toBe(1)
    expect(a.building.stages[1]?.ewma).toBe(1)
  })

  it('would have been silently dropped by recording against the mapped stage instead', () => {
    // The regression this test exists to catch, demonstrated directly:
    // `Attainment.building.stages` has no key for `4` (STAGES.building is
    // `[1]`), so attributing there is not merely wrong, it is a no-op.
    const a = createAttainment()
    const h = createHarness(a)
    const deal = h.dealReading(1, rolls(0.5))
    expect(deal?.stage).toBe(4)
    h.dealt('building', deal!.stage) // the bug: recordStage, not stage
    h.recordAttempt({
      kind: 'build', index: 0, correct: true, latencyMs: 900,
      helped: false, rescued: false, at: 0,
    })
    expect(a.building.stages[1]?.attempts).toBe(0)
  })
})

/*
 * `openRead` in main.ts is composition glue — a renderer and a world
 * attached, not unit-testable — and HANDOFF §5 names this file as the
 * repeated home of a feature that was declared and wired by nothing. Every
 * test above would stay green even if `openRead` drew a fresh stage on
 * every re-render of a held page, so — in the manner of
 * tests/island/held.test.ts's own source-reading tests — this reads main.ts
 * itself.
 */
describe('main.ts only draws a fresh reading stage on a fresh deal', () => {
  const here = dirname(fileURLToPath(import.meta.url))
  const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')
  const code = source.split('\n')
    .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
    .join('\n')

  it('calls harness.dealReading exactly once, and only inside the fresh-deal guard', () => {
    // A held card is ATTRIBUTED to the stage it was originally dealt at, not
    // to whatever a fresh draw would pick now (see the comment above
    // `dealtRead`). If `harness.dealReading` were hoisted out of the guard —
    // or a second call site appeared — a held page would silently start
    // redrawing its stage on every re-open, moving a child who reopens a
    // held page more than a fresh deal ever would.
    const occurrences = code.match(/harness\.dealReading\(/g) ?? []
    expect(occurrences).toHaveLength(1)
    expect(code).toMatch(
      /if\s*\(!state\.readHeld \|\| dealtRead === null\)\s*\{[\s\S]{0,200}harness\.dealReading\(/,
    )
  })

  it('remembers dealtRead\'s path, stage AND recordStage rather than the harness deal object', () => {
    // The guard's body must assign INTO `dealtRead` from what came back, so
    // the values that survive a held re-render are the ones on `dealtRead`
    // and not a fresh return value nobody kept. Both `stage` (generator) and
    // `recordStage` (attribution) must be carried — dropping either silently
    // reintroduces one of the two bugs fix round 1 closed.
    expect(code).toMatch(
      /dealtRead = \{[\s\S]{0,20}path: [\s\S]{0,120}stage: [\s\S]{0,40}recordStage: [\s\S]{0,60}\}/,
    )
    // ATTRIBUTED BY recordStage, NOT stage — this is fix round 1 itself.
    // Attributing by `stage` is the exact regression that silently dropped
    // every build attempt once a child was past reading id 1 (see the
    // "attempt is actually recorded" describe block above).
    expect(code).toMatch(/harness\.dealt\(dealtRead\.path, dealtRead\.recordStage\)/)
    expect(code).not.toMatch(/harness\.dealt\(dealtRead\.path, dealtRead\.stage\)/)
  })

  /*
   * `drawRung` and `rungIndex` reaching the generator is unpinned otherwise.
   * Delete either from the deps object passed to `dealReading` here and the
   * whole suite still passes: `RUNG_WORDS` is empty (nothing is approved), so
   * `read.ts`'s rung branch never fires in any test that goes through
   * `main.ts`, and the golden test calls `generateRead` directly, bypassing
   * this wiring entirely. Neither gap notices a caller that silently drops the
   * rung words or the twin-density dial. Same style as the assertions above:
   * read the source, pin the exact call.
   */
  it('passes drawRung through to the read generator, not just level', () => {
    expect(code).toMatch(/level: dealtRead\.stage, drawRung,/)
  })

  it('passes rungIndex through to the read generator', () => {
    expect(code).toMatch(/rungIndex: STAGES\.reading\.indexOf\(dealtRead\.stage\),/)
  })
})
