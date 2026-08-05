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

  it('gives a build page a ticked building stage, not a reading one', () => {
    const a = createAttainment()
    const h = createHarness(a)
    const deal = h.dealReading(1, rolls(0.5)) // page 1 is a build page (JT-010(2))
    expect(deal?.kind).toBe('build')
    expect(deal?.stage).not.toBeNull()
    expect(STAGES.building).toContain(deal?.stage)
    // The building ladder is [1] today, so this also pins that a build page
    // never reaches into STAGES.reading for its rung.
    expect(deal?.stage).toBe(1)
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
   * every time, whatever the roll says — she must not move.
   */
  it('keeps a fresh island on reading id 1 and building id 1, whatever the roll draws', () => {
    const a = createAttainment() // default: reading 1, building 1, nothing else
    const h = createHarness(a)
    for (const r of [0, 0.01, 0.25, 0.5, 0.75, 0.99]) {
      expect(h.dealReading(0, rolls(r))).toEqual({ kind: 'find', stage: 1 })
      expect(h.dealReading(1, rolls(r))).toEqual({ kind: 'build', stage: 1 })
    }
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

  it('remembers dealtRead\'s path and stage rather than the harness deal object', () => {
    // The guard's body must assign INTO `dealtRead` from what came back, so
    // the stage that survives a held re-render is the one on `dealtRead`
    // and not a fresh return value nobody kept.
    expect(code).toMatch(/dealtRead = \{ path: [\s\S]{0,80}, stage: [\s\S]{0,20}\}/)
    expect(code).toMatch(/harness\.dealt\(dealtRead\.path, dealtRead\.stage\)/)
  })
})
