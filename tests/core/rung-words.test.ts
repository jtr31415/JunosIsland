import { describe, it, expect } from 'vitest'

/*
 * The emitter is plain ESM with no build step and no declarations, and
 * `tsconfig.json` does not turn on `allowJs`, so importing it from a `.ts` test
 * is an implicit `any` that `tsc --noEmit` refuses. Suppressed at the import
 * rather than papered over with a hand-written `.d.mts`, which would be a second
 * description of this module that could quietly stop matching it.
 */
// @ts-expect-error — see above; `emit.mjs` ships no types.
import { emitWords } from '../../tools/words/emit.mjs'

const row = (word: string, rung: number, verdict: string) =>
  ({ word, rung, verdict, replacement: '', note: '' })

describe('the words emitter', () => {
  it('emits only approved rows', () => {
    const out = emitWords({ words: [
      row('sun', 3, 'yes'),
      row('pig', 3, ''),
      row('cog', 3, 'no'),
    ] })
    expect(out).toContain("'sun'")
    expect(out, 'an unvetted word must be invisible').not.toContain("'pig'")
    expect(out, 'a rejected word must be invisible').not.toContain("'cog'")
  })

  it('uses the replacement when one is given', () => {
    const out = emitWords({ words: [
      { word: 'cog', rung: 3, verdict: 'replace', replacement: 'dog', note: '' },
    ] })
    expect(out).toContain("'dog'")
    expect(out).not.toContain("'cog'")
  })

  it('groups by rung id and keeps ledger order inside a rung', () => {
    const out = emitWords({ words: [
      row('sun', 3, 'yes'), row('fish', 4, 'yes'), row('cat', 3, 'yes'),
    ] })
    expect(out).toMatch(/3: \['sun', 'cat'\]/)
    expect(out).toMatch(/4: \['fish'\]/)
  })

  it('emits an empty rung rather than omitting it', () => {
    const out = emitWords({ words: [row('sun', 3, '')] })
    expect(out).toMatch(/3: \[\]/)
  })

  it('ends every line with LF and never CRLF', () => {
    const out = emitWords({ words: [row('sun', 3, 'yes')] })
    expect(out).not.toContain('\r')
  })
})
