import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * The backstop the brief actually asked for.
 *
 * `Committed` makes a ceremony impossible to run without a completed save —
 * but only for code that opts in. Nothing stops a NEW award path from
 * hand-rolling `inCeremony = true` and animating over an unsaved fact, and
 * items 7, 8 and 15 each add ceremonies. main.ts is untested glue, which
 * HANDOFF §5 names as this project's four-time offender.
 *
 * So this reads the source. It is a weaker kind of test than the type, and it
 * is here precisely because the type cannot reach the place where someone
 * forgets to use it. Acceptance (d), in the brief's own words: "a test greps
 * ceremony entry points for the barrier."
 */

const here = dirname(fileURLToPath(import.meta.url))
const MAIN = resolve(here, '../../src/island/main.ts')
const source = readFileSync(MAIN, 'utf8')

/** Lines with the comments stripped, so prose about a rule is not the rule. */
const stripComments = (text: string): string => text
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

const code = stripComments(source)

const countOf = (needle: string): number => code.split(needle).length - 1

describe('every ceremony in main.ts is behind the barrier', () => {
  it('holds the exits in exactly one place', () => {
    /*
     * `inCeremony = true` and `setBusy(true)` belong to the `exits` helper and
     * nowhere else. Both sites used to hand-roll them, and only one of the two
     * remembered a finally — so a throw in the other left the world busy with
     * no overlay and every tap dead until a reload.
     */
    expect(countOf('inCeremony = true')).toBe(1)
    expect(countOf('overlay.setBusy(true)')).toBe(1)
  })

  it('releases them in exactly one place', () => {
    // `let inCeremony = false` is the declaration, not a release. Counting the
    // bare string caught that on the first run, which is a fair advertisement
    // for the test but a poor matcher.
    expect(countOf('inCeremony = false') - countOf('let inCeremony = false')).toBe(1)
  })

  it('runs one ceremony per receipt, and no receipt is left unspent', () => {
    /*
     * A receipt minted and not spent means something was saved and then
     * celebrated by hand; a ceremony without one would not compile. Equal
     * counts is the cheap way to notice the first case.
     */
    const receipts = countOf('await commitState()')
    const ceremonies = countOf('await ceremony(')
    expect(receipts).toBeGreaterThan(0)
    expect(ceremonies).toBe(receipts)
  })

  it('never awards and animates without committing first', () => {
    /*
     * The two award calls in the flow machine. Each must be followed by a
     * commitState() before anything visual happens — checked by proximity,
     * which is crude, but the alternative is trusting that nobody moves them
     * apart.
     */
    for (const award of ['handleChallengePassed(', 'challengePassed(']) {
      const at = code.indexOf(award)
      if (at < 0) continue
      const after = code.slice(at, at + 2500)
      expect(after, `${award} must reach commitState() before it celebrates`)
        .toContain('commitState()')
    }
  })

  it('does not persist and forget on an award path', () => {
    // `void persist()` is legitimate for incidental saves (refresh), but must
    // never be how an award reaches storage — that is the fire-and-forget the
    // barrier exists to replace.
    const awardArea = code.slice(code.indexOf('async function passed('))
    const upToNextTop = awardArea.slice(0, awardArea.indexOf('\n  async function ', 10))
    expect(upToNextTop).not.toContain('void persist()')
  })
})

describe('nothing in main.ts reads the calendar directly (item 2)', () => {
  it('asks the clock, not Date', () => {
    /*
     * The visitor's day latch, difficulty's two-distinct-days gate and the
     * seasons all turn on what day it is, and every one of them is untestable
     * against a real `Date.now()`. A test that waits for midnight is a test
     * nobody runs.
     *
     * Two exceptions, both in the clock's own construction: seeding the
     * adjustable clock from real time, and wrapping a stored timestamp for
     * display. Everything else must go through `clock`.
     */
    const reads = code.split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => /\bDate\.now\(\)|new Date\(/.test(line))
      .filter(({ line }) => !line.includes('createAdjustableClock(Date.now())'))
      .filter(({ line }) => !line.includes('new Date(clock.now())'))

    expect(reads.map(r => `${r.n}: ${r.line}`)).toEqual([])
  })

  it('keeps the adjustable clock out of production', () => {
    // A player must not be able to move the calendar by typing in the URL bar
    // — and more to the point, must not be handed a clock that can drift from
    // the one the save was written against.
    expect(code).toContain("debugging\n")
    expect(countOf('createAdjustableClock(')).toBe(1)
  })

  it('hands the harness the same clock as everything else (A5)', () => {
    /*
     * `createHarness` defaults its `now` to `Date.now()`, and main.ts took
     * that default for a while: the sessions attainment records were bucketed
     * by the wall clock while the store, the visitor and the save all read
     * `clock`. Advance-day moved everything except the one record A6's
     * two-distinct-days gate is computed from. A default that is right in a
     * pure module and wrong at the only place it is constructed is exactly
     * what a source assertion is for.
     */
    expect(code).toContain('createHarness(attainment, () => clock.now())')
  })
})

describe('the harness is constructed exactly once (A9)', () => {
  /**
   * Every .ts under src/, so "once" is a claim about the game and not about
   * one file that happens to be the one we looked at.
   */
  const SRC = resolve(here, '../../src')
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap(e =>
      e.isDirectory() ? walk(join(dir, e.name))
        : e.name.endsWith('.ts') ? [join(dir, e.name)] : [])

  it('builds one, in main.ts, and nowhere else in src', () => {
    /*
     * A9 names this gate, and the reason is that the harness holds
     * `attainment` BY REFERENCE and mutates it in place. A second
     * `createHarness` over a second copy of that record would not throw, would
     * not fail a type check and would not look wrong at either call site: it
     * would simply mean half the attempts a child made went into a record
     * nobody persisted, and a grown-ups report that quietly understated them.
     * Silent divergence between two things that must agree is HANDOFF §5's
     * four-time offender, and the only cheap defence is counting.
     */
    const calls = (text: string): number => {
      const bare = stripComments(text)
      // The declaration in harness.ts is not a construction of one.
      return (bare.split('createHarness(').length - 1)
        - (bare.split('function createHarness(').length - 1)
    }
    const sites = walk(SRC)
      .map(f => ({
        file: f.slice(SRC.length + 1).replace(/\\/g, '/'),
        n: calls(readFileSync(f, 'utf8')),
      }))
      .filter(s => s.n > 0)

    expect(sites).toEqual([{ file: 'island/main.ts', n: 1 }])
  })
})
