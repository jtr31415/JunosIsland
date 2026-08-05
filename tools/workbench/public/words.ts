/**
 * The words bench — one GROUP per rung, not one row per word.
 *
 * A word is approved against its NEIGHBOURS and not on its own: `sat` and `sit`
 * are each fine and both on one page is the entire point of the near-twin
 * mechanism, while `to`, `too` and `two` on one page is the trap the confusable
 * guard exists to prevent. A bench that showed one word at a time would be
 * asking Joe the wrong question.
 */
/**
 * `id` is `${rung}/${word}` — `merge.mjs`'s merge key for this file, the
 * `names-audit.json` convention (`natural/<speciesId>`) applied to a ledger
 * keyed by rung and spelling. `wordsBench` itself never looks at it — the
 * grouping is by `rung` alone — it exists so a save can PATCH one row rather
 * than replace the whole file, which is what keeps a drafting batch and a
 * verdict Joe just made from being able to erase one another.
 */
export interface WordRow {
  id: string; word: string; rung: number
  verdict: string; replacement: string; note: string
}
export interface WordGroup {
  rung: number; label: string; rows: WordRow[]; done: number
}

/* Mirrors `STAGES.reading`. The page is plain browser code and cannot import
   from `src/island/`; `tests/tools/words-bench.test.ts` pins them together. */
export const LADDER = [3, 4, 1, 5, 6, 7, 8, 9, 10, 11]

/* Mirrors `STAGE_LABELS.reading` in `src/island/grownups.ts`, for the same
   reason `LADDER` mirrors `STAGES.reading`: this page cannot import from
   `src/island/`. `tests/tools/words-bench.test.ts` pins them together too. */
export const LABELS: Record<number, string> = {
  3: 'single sounds',
  4: 'sounds and digraphs',
  1: 'reading words',
  5: 'short nouns',
  6: 'two-word phrases',
  7: 'five-letter words',
  8: 'five-letter nouns and phrases',
  9: 'split digraphs',
  10: 'other spellings',
  11: 'two-syllable words',
}

export function wordsBench(
  rows: readonly WordRow[], labels: Record<number, string>,
): WordGroup[] {
  const seen = [...new Set(rows.map(r => r.rung))]
  seen.sort((a, b) => {
    const ia = LADDER.indexOf(a), ib = LADDER.indexOf(b)
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
  return seen.map(rung => {
    const mine = rows.filter(r => r.rung === rung)
    return {
      rung,
      label: labels[rung] ?? `rung ${rung}`,
      rows: mine,
      done: mine.filter(r => String(r.verdict ?? '').trim() !== '').length,
    }
  })
}
