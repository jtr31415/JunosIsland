import { describe, it, expect } from 'vitest'
import { wordsBench, LADDER, LABELS } from '../../tools/workbench/public/words'
import { STAGES } from '../../src/island/harness'
import { STAGE_LABELS } from '../../src/island/grownups'

const row = (word: string, rung: number, verdict = '') =>
  ({ word, rung, verdict, replacement: '', note: '' })

describe('the words bench', () => {
  it('groups a rung together, because a word is judged against its neighbours', () => {
    const b = wordsBench([row('sat', 1), row('fish', 4), row('sit', 1)], {})
    expect(b.find(g => g.rung === 1)!.rows.map(r => r.word)).toEqual(['sat', 'sit'])
  })

  it('orders the groups by the ladder, not by id', () => {
    const b = wordsBench([row('a', 1), row('b', 3), row('c', 5)], {})
    expect(b.map(g => g.rung)).toEqual([3, 1, 5])
  })

  it('counts how many rows in a rung are still unruled', () => {
    const b = wordsBench([row('a', 1, 'yes'), row('b', 1), row('c', 1)], {})
    expect(b[0]!.done).toBe(1)
  })

  it('carries the ladder wording through for the heading', () => {
    const b = wordsBench([row('a', 5)], { 5: 'short nouns' })
    expect(b[0]!.label).toBe('short nouns')
  })
})

/*
 * The two local mirrors this file carries — `LADDER` and `LABELS` — exist only
 * because the workbench page cannot import from `src/island/`. Unpinned, a
 * rung added to the real ladder (or reworded) rots this copy silently: the
 * bench would keep grouping by an order Joe's game no longer uses, or would
 * fall back to `rung ${n}` for a stage that has a real name. `read.ts`'s own
 * mirrored length is pinned the same way, by `tests/island/reading-ladder.test.ts`.
 */
describe('the ladder mirrored here, held against the real one', () => {
  it('matches STAGES.reading, in the same order', () => {
    expect(LADDER).toEqual(STAGES.reading)
  })

  it('matches STAGE_LABELS.reading, word for word', () => {
    expect(LABELS).toEqual(STAGE_LABELS.reading)
  })
})
