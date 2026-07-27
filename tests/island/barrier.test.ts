import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
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
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

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
