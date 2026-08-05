# Reading Ladder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take `STAGES.reading` from one rung to ten, with the word lists for the new rungs approved by Joe in the workbench before any of them is ever dealt.

**Architecture:** New rungs are new generator ids appended to `STAGES.reading`; array position is the rung, the number is the generator id. Each new rung draws from its own list, emitted into `src/core/rung-words.ts` from `joe/words-audit.json` by a tool that copies only APPROVED rows. `GREEN`, `RED` and the level-1 code path are untouched, so `golden.json` still anchors and Juno does not move.

**Tech Stack:** TypeScript, Vitest, plain-`.mjs` Node tools, the existing workbench server (`tools/workbench/api.mjs`) and its vanilla-JS page (`tools/workbench/public/app.js`).

**Spec:** `docs/superpowers/specs/2026-08-05-reading-ladder-design.md`

## Global Constraints

- **`GREEN` and `RED` in `src/core/wordlists.ts` are FROZEN.** Not reordered, not appended to, not resorted. `makeDeck` deals straight off them and `golden.json` pins the stream.
- **`golden.json` may never be re-blessed.** Any change that moves a pinned stream is wrong, not "needs a re-bless". Run `npm run parity` before every commit.
- **Never renumber a generator id.** New rungs take new ids. `STAGES` array position is the rung; the number is the id.
- **Juno is ticked on `reading: 1` and must not move.** Id 1 keeps its generator, its branch and its position.
- **A word with no verdict is never dealt.** Unvetted means invisible, as `pool.ts` holds for an unsigned species.
- **LF line endings.** Never bulk-edit repo files with Python on Windows — it silently rewrites LF to CRLF and fails a gate that looks like a logic bug.
- **Verification is the FULL suite**: `npx tsc --noEmit` exit 0 and `npx vitest run` zero failures. Not a subdirectory run.
- `vitest.config.ts` sets `maxWorkers: 4`; do not raise it or any timeout.

## File Structure

**Created:**
- `joe/words-audit.json` — the ledger. One row per drafted word, human verdict fields empty.
- `tools/words/emit.mjs` — reads the ledger, writes only approved rows into the generated module.
- `src/core/rung-words.ts` — GENERATED. Approved words per rung id. Never hand-edited.
- `tests/core/rung-words.test.ts` — the emitter's gate and the generated module's shape.
- `tests/core/read-rungs.test.ts` — the new generator branches.
- `tests/tools/words-bench.test.ts` — the workbench bench's join and save shape.

**Modified:**
- `src/island/harness.ts:61-108` — `STAGES.reading` gains its rungs.
- `src/island/grownups.ts:437-455` — `STAGE_LABELS.reading` gains its wording.
- `src/core/generators/read.ts:28-95` — a rung branch, and twin density becomes a function of the rung.
- `src/core/generators/build.ts:22-40` — granularity and the finger space.
- `src/island/main.ts:180-182` — a per-rung deck cache beside `drawGreen`/`drawRed`.
- `src/island/deal.ts:70-92` — pass the rung deck and the build offset through.
- `tools/workbench/api.mjs:27-40` — `words` joins `WRITABLE`.
- `tools/workbench/public/index.html:16-24` — a `words` tab.
- `tools/workbench/public/app.js` — the bench's render and save.
- `package.json` — `words:emit` script.

---

### Task 1: The ledger and its emitter

**Files:**
- Create: `joe/words-audit.json`
- Create: `tools/words/emit.mjs`
- Create: `src/core/rung-words.ts` (by running the emitter)
- Create: `tests/core/rung-words.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `RUNG_WORDS: Record<number, readonly string[]>` from `src/core/rung-words.ts`, keyed by generator id. `emitWords(ledger: {words: Row[]}): string` from `tools/words/emit.mjs`, where `Row = {word: string, rung: number, verdict: string, replacement: string, note: string}`.

- [ ] **Step 1: Write the failing test**

Create `tests/core/rung-words.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/core/rung-words.test.ts`
Expected: FAIL — cannot resolve `tools/words/emit.mjs`.

- [ ] **Step 3: Write the emitter**

Create `tools/words/emit.mjs`:

```js
/**
 * The words ledger -> the generated module.
 *
 * ONE RULE, and it is the whole point of this file: a row with no verdict is
 * NOT emitted. Unvetted means invisible, exactly as `pool.ts` treats a species
 * nobody has signed off, and it is what makes it safe for an agent to draft two
 * hundred words in bulk. There is deliberately no "pending" state that deals.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const APPROVED = new Set(['yes', 'replace'])

/** The words a row contributes: its replacement if it has one, else itself. */
function wordOf(row) {
  const v = String(row.verdict ?? '').trim().toLowerCase()
  if (!APPROVED.has(v)) return null
  const rep = String(row.replacement ?? '').trim()
  return rep || String(row.word ?? '').trim() || null
}

export function emitWords(ledger) {
  const rows = ledger?.words ?? []
  const rungs = new Map()
  for (const r of rows) {
    const rung = Number(r.rung)
    if (!Number.isInteger(rung)) continue
    if (!rungs.has(rung)) rungs.set(rung, [])
    const w = wordOf(r)
    if (w) rungs.get(rung).push(w)
  }
  const body = [...rungs.keys()].sort((a, b) => a - b)
    .map(k => `  ${k}: [${rungs.get(k).map(w => `'${w}'`).join(', ')}],`)
    .join('\n')
  return [
    '/**',
    ' * GENERATED by `npm run words:emit` from `joe/words-audit.json`. Do not edit.',
    ' *',
    ' * Only APPROVED rows appear here. A word Joe has not ruled on is absent, so a',
    ' * rung whose list is half-approved deals only the approved half.',
    ' */',
    'export const RUNG_WORDS: Record<number, readonly string[]> = {',
    body,
    '}',
    '',
  ].join('\n')
}

export function emitToDisk(ledgerPath, outPath) {
  const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'))
  writeFileSync(outPath, emitWords(ledger), 'utf8')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/core/rung-words.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Create the ledger and the runner**

Create `joe/words-audit.json`:

```json
{
  "schemaVersion": 1,
  "words": []
}
```

Add to `package.json` scripts, after `"signoffs"`:

```json
"words:emit": "node -e \"import('./tools/words/emit.mjs').then(m=>m.emitToDisk('joe/words-audit.json','src/core/rung-words.ts'))\""
```

- [ ] **Step 6: Generate the module and typecheck**

Run: `npm run words:emit && npx tsc --noEmit`
Expected: `src/core/rung-words.ts` exists holding an empty `RUNG_WORDS`; tsc exit 0.

- [ ] **Step 7: Commit**

```bash
git add joe/words-audit.json tools/words/emit.mjs src/core/rung-words.ts tests/core/rung-words.test.ts package.json
git commit -m "feat(words): a ledger whose unvetted rows are invisible, and the tool that emits it"
```

---

### Task 2: The ladder ids and their wording

**Files:**
- Modify: `src/island/harness.ts:61-108`
- Modify: `src/island/grownups.ts:437-455`
- Test: `tests/island/reading-ladder.test.ts` (create)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `STAGES.reading = [3, 4, 1, 5, 6, 7, 8, 9, 10, 11]` and `STAGE_LABELS.reading` covering every one of those ids.

- [ ] **Step 1: Write the failing test**

Create `tests/island/reading-ladder.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { STAGES } from '../../src/island/harness'
import { STAGE_LABELS, stageLabel } from '../../src/island/grownups'

describe('the reading ladder', () => {
  it('keeps id 1 as the third rung, where Juno already is', () => {
    // Array POSITION is the rung; the NUMBER is a generator id. Juno is ticked
    // on id 1, so id 1 moving position would move her.
    expect(STAGES.reading[2]).toBe(1)
  })

  it('climbs from below the start to two-syllable', () => {
    expect(STAGES.reading).toEqual([3, 4, 1, 5, 6, 7, 8, 9, 10, 11])
  })

  it('never repeats a generator id', () => {
    expect(new Set(STAGES.reading).size).toBe(STAGES.reading.length)
  })

  it('does not reuse id 2, which is the alien-word generator', () => {
    expect(STAGES.reading).not.toContain(2)
  })

  it('has wording for every rung it can deal', () => {
    for (const id of STAGES.reading) {
      expect(STAGE_LABELS.reading[id], `id ${id} has no label`).toBeTruthy()
      expect(stageLabel('reading', id)).not.toMatch(/^stage /)
    }
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/island/reading-ladder.test.ts`
Expected: FAIL — `STAGES.reading` is `[1]`.

- [ ] **Step 3: Extend the ladder**

In `src/island/harness.ts`, replace `reading: [1],` with the array plus its comment:

```ts
  /*
   * THE READING LADDER, in rung order, with the generator id in brackets:
   *
   *   1. single sounds            (3)  NEW. Below where anyone starts.
   *   2. + taught digraphs        (4)  NEW. Also below the start.
   *   3. today's mixed page       (1)  where every island begins — UNCHANGED
   *   4. three- and four-letter nouns (5)  NEW
   *   5. two-word phrases         (6)  NEW
   *   6. five-letter words        (7)  NEW. Adjacent consonants, no new code.
   *   7. five-letter nouns and phrases (8) NEW
   *   8. split digraphs           (9)  NEW
   *   9. alternative spellings    (10) NEW
   *  10. two-syllable             (11) NEW
   *
   * ID 2 IS ABSENT ON PURPOSE. It is the alien-word generator, written and
   * unreachable; exposing it is a separate decision Joe has not taken.
   *
   * RUNGS 1 AND 2 SIT BELOW THE START, exactly as `within five` does on sums.
   * `STARTS_TICKED` is untouched, so the cadence never walks a child down onto
   * them — they exist for a grown-up who needs to go gentler than today's page.
   */
  reading: [3, 4, 1, 5, 6, 7, 8, 9, 10, 11],
```

- [ ] **Step 4: Add the wording**

In `src/island/grownups.ts`, replace `reading: { 1: 'reading words' },` with:

```ts
  /* IN LADDER ORDER, like `sums` above it. Id 1 keeps its old wording. */
  reading: {
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
  },
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run tests/island/reading-ladder.test.ts && npx vitest run tests/island && npm run parity`
Expected: the new file passes 5; `tests/island` stays green; parity reports `every step renders identically`.

- [ ] **Step 6: Commit**

```bash
git add src/island/harness.ts src/island/grownups.ts tests/island/reading-ladder.test.ts
git commit -m "feat(reading): ten rungs where there was one, with id 1 keeping its place"
```

---

### Task 3: The rung generator branch

**Files:**
- Modify: `src/core/generators/read.ts`
- Modify: `src/island/main.ts:180-182`
- Test: `tests/core/read-rungs.test.ts` (create)

**Interfaces:**
- Consumes: `RUNG_WORDS` (Task 1), the ids in `STAGES.reading` (Task 2).
- Produces: `ReadDeps` gains `drawRung?: (level: number) => (() => MarkedWord) | null`. `generateRead` returns a page drawn from the rung's approved words when the level has any.

- [ ] **Step 1: Write the failing test**

Create `tests/core/read-rungs.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateRead } from '../../src/core/generators/read'
import type { ReadState } from '../../src/core/generators/read'
import { buildNeighbours, buildPool } from '../../src/core/neighbours'
import { mulberry32 } from '../../src/core/rng'

const deps = (level: number, words: string[]) => {
  const rng = mulberry32(42)
  let i = 0
  return {
    rng,
    drawGreen: () => 'cat',
    drawRed: () => '[I]',
    neigh: buildNeighbours(buildPool()),
    level,
    drawRung: (l: number) =>
      l === level && words.length ? () => words[i++ % words.length] as string : null,
  }
}

const fresh = (): ReadState => ({ history: [], idx: -1 })

describe('a rung page', () => {
  it('draws only from that rung\'s approved words', () => {
    const s = fresh()
    generateRead(s, deps(5, ['frog', 'nest', 'sock']))
    const page = s.history[0]!.map(p => p.w)
    for (const w of page) expect(['frog', 'nest', 'sock']).toContain(w)
  })

  it('deals nothing from GREEN or RED on a rung level', () => {
    const s = fresh()
    generateRead(s, deps(5, ['frog', 'nest', 'sock']))
    expect(s.history[0]!.map(p => p.w)).not.toContain('cat')
  })

  it('falls through to the old page when the rung has no approved words', () => {
    const s = fresh()
    generateRead(s, deps(5, []))
    // the level-1 body ran, so GREEN's word is present
    expect(s.history[0]!.map(p => p.w)).toContain('cat')
  })

  it('leaves level 1 exactly as it was', () => {
    const a = fresh(), b = fresh()
    generateRead(a, { ...deps(1, []), drawRung: undefined })
    generateRead(b, deps(1, ['frog']))
    expect(b.history[0]).toEqual(a.history[0])
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/core/read-rungs.test.ts`
Expected: FAIL — `drawRung` is not part of `ReadDeps`.

- [ ] **Step 3: Add the branch**

In `src/core/generators/read.ts`, add to `ReadDeps`:

```ts
  /**
   * The deck for this level's approved rung words, or null when the level has
   * none. Supplied by the caller because the DECK must outlive one deal — a
   * deck rebuilt per page forgets what it has dealt and the no-repeat guarantee
   * goes with it. See `main.ts`, where it is created beside `drawGreen`.
   */
  drawRung?: (level: number) => (() => MarkedWord) | null
```

Immediately after the `if (d.level === 2)` block and before `const n = Math.min(MAX, ...)`:

```ts
  /*
   * A RUNG PAGE. Its own words, its own early return, and NOTHING below this
   * point runs for it — the same shape the alien branch uses above, and for the
   * same reason: `golden.json` pins level 1's stream, so the level-1 body must
   * consume randomness exactly as it always has.
   *
   * A rung with no approved words FALLS THROUGH deliberately. Unvetted is
   * invisible, and an empty rung that dealt an empty page would be a blank
   * screen; falling back to the page every child already gets is the graceful
   * half of that rule.
   */
  const rungDraw = d.drawRung?.(d.level) ?? null
  if (rungDraw) {
    const n = Math.min(MAX, MIN + s.history.length)
    const used = new Set<string>()
    const picks: ReadPick[] = []
    let guard = 0
    while (picks.length < n && guard++ < n * 40) {
      const w = rungDraw()
      if (used.has(w)) continue
      used.add(w)
      picks.push({ w, cls: 'green' })
    }
    shuffle(d.rng, picks)
    s.history.push(picks)
    s.idx = s.history.length - 1
    return
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/core/read-rungs.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Wire the deck cache**

In `src/island/main.ts`, after line 181 (`const drawRed = ...`):

```ts
  /*
   * ONE DECK PER RUNG, created once and kept — a deck rebuilt per deal forgets
   * what it dealt, and `makeDeck`'s whole promise is no repeat until exhausted.
   * Lazy, like the two above it: creating a deck consumes no randomness, which
   * is what keeps the golden stream shared and stable.
   */
  const rungDecks = new Map<number, () => string>()
  const drawRung = (level: number): (() => string) | null => {
    const words = RUNG_WORDS[level]
    if (!words?.length) return null
    let deck = rungDecks.get(level)
    if (!deck) { deck = makeDeck(defaultRng, words); rungDecks.set(level, deck) }
    return deck
  }
```

Add `import { RUNG_WORDS } from '../core/rung-words'` beside the other core imports, and pass `drawRung` in the deps object at line 1184:

```ts
      { rng: defaultRng, drawGreen, drawRed, neigh, level: dealtRead.stage, drawRung },
```

- [ ] **Step 6: Verify nothing moved**

Run: `npx tsc --noEmit && npx vitest run && npm run parity`
Expected: tsc exit 0; full suite zero failures; parity `every step renders identically`.

- [ ] **Step 7: Commit**

```bash
git add src/core/generators/read.ts src/island/main.ts tests/core/read-rungs.test.ts
git commit -m "feat(reading): a rung deals its own approved words, and level 1 is untouched"
```

---

### Task 4: Twin density as a dial

**Files:**
- Modify: `src/core/generators/read.ts`
- Test: `tests/core/read-twins.test.ts` (create)

**Interfaces:**
- Consumes: `STAGES.reading` order (Task 2).
- Produces: `twinTarget(rungIndex: number, n: number): number`, exported from `read.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/core/read-twins.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { twinTarget } from '../../src/core/generators/read'

describe('twin density', () => {
  it('plants the old two at the bottom of the ladder', () => {
    // The behaviour every page has had since v0, kept for the lowest rung.
    expect(twinTarget(0, 12)).toBe(2)
  })

  it('climbs with the rung', () => {
    expect(twinTarget(9, 12)).toBeGreaterThan(twinTarget(0, 12))
  })

  it('never asks for more twins than there are words to replace', () => {
    for (let r = 0; r < 10; r++) {
      for (const n of [3, 5, 8, 12]) {
        expect(twinTarget(r, n)).toBeLessThanOrEqual(Math.floor(n / 2))
      }
    }
  })

  it('never asks for fewer than one', () => {
    expect(twinTarget(0, 3)).toBeGreaterThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/core/read-twins.test.ts`
Expected: FAIL — `twinTarget` is not exported.

- [ ] **Step 3: Implement the dial**

In `src/core/generators/read.ts`, above `generateRead`:

```ts
/**
 * How many near-twins to plant on a page of `n` words at ladder position
 * `rungIndex` (0-based, the INDEX into `STAGES.reading`, not the generator id).
 *
 * Joe, 5 August: *"there is evidence of her searching for the first word only."*
 * The near-twin mechanism (`neighbours.ts`, one edit apart, `sat`/`sit`) has
 * always existed to make first-letter guessing lose — it was just set to two per
 * page, so a twelve-word page left ten words winnable on the first letter.
 *
 * A DIAL AND NOT A RUNG. Rungs are exclusive: a child is dealt from one
 * generator at a time, so a "whole word reading" rung is one she meets and then
 * CLIMBS PAST, and the habit returns on the next rung, where the words are least
 * familiar. A habit is not a stage.
 *
 * The floor is the historical 2, so the bottom rung behaves exactly as every
 * page did before this. The ceiling is half the page, because each twin REPLACES
 * a word already picked — asking for more than half would spend the whole page
 * on pairs and leave nothing for the twins to sit among.
 */
export function twinTarget(rungIndex: number, n: number): number {
  const span = Math.max(1, STAGES_READING_LENGTH - 1)
  const t = Math.min(1, Math.max(0, rungIndex / span))
  const ceiling = Math.floor(n / 2)
  return Math.max(1, Math.min(ceiling, Math.round(2 + t * (ceiling - 2))))
}
```

Add the constant at the top of the file, so `read.ts` stays free of an import from `island/`:

```ts
/* The ladder's length, mirrored rather than imported: `core/` may not depend on
   `island/`. `tests/island/reading-ladder.test.ts` pins the two together. */
const STAGES_READING_LENGTH = 10
```

Replace the `pairTarget` line in the level-1 body with:

```ts
  const pairTarget = twinTarget(d.rungIndex ?? 0, n)
```

and add to `ReadDeps`:

```ts
  /** 0-based position on `STAGES.reading`. Defaults to the bottom, which is the
   *  historical two-twin behaviour, so an old caller is unchanged. */
  rungIndex?: number
```

- [ ] **Step 4: Pin the mirrored constant**

Add to `tests/island/reading-ladder.test.ts`:

```ts
it('matches the length read.ts mirrors for the twin dial', async () => {
  const src = await import('node:fs').then(fs =>
    fs.readFileSync('src/core/generators/read.ts', 'utf8'))
  const m = src.match(/STAGES_READING_LENGTH = (\d+)/)
  expect(Number(m?.[1])).toBe(STAGES.reading.length)
})
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run tests/core/read-twins.test.ts tests/island/reading-ladder.test.ts && npm run parity`
Expected: both files pass; parity identical (level 1 at `rungIndex` 0 still asks for 2).

- [ ] **Step 6: Pass the index through**

In `src/island/main.ts` at the deps object, add `rungIndex: STAGES.reading.indexOf(dealtRead.stage)`.

- [ ] **Step 7: Commit**

```bash
git add src/core/generators/read.ts src/island/main.ts tests/core/read-twins.test.ts tests/island/reading-ladder.test.ts
git commit -m "feat(reading): near-twin density ramps up the ladder instead of sitting at two"
```

---

### Task 5: The build path — one rung behind, finger space, granularity

**Files:**
- Modify: `src/core/generators/build.ts`
- Modify: `src/island/deal.ts`
- Test: `tests/core/build-rungs.test.ts` (create)

**Interfaces:**
- Consumes: `STAGES.reading` (Task 2), `RUNG_WORDS` (Task 1).
- Produces: `buildStageFor(readingStage: number): number`, exported from `src/island/deal.ts`. `BuildDeps` gains `granularity?: 'graphemes' | 'letters'` and `phrase?: boolean`. `FINGER_SPACE = '\u{1F449}'` exported from `build.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/core/build-rungs.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateBuild, FINGER_SPACE } from '../../src/core/generators/build'
import type { BuildState } from '../../src/core/generators/build'
import { buildStageFor } from '../../src/island/deal'
import { mulberry32 } from '../../src/core/rng'

const fresh = (): BuildState => ({ history: [], idx: -1 })

describe('build follows reading, one rung behind', () => {
  it('is the rung below the reading rung', () => {
    // STAGES.reading is [3, 4, 1, 5, ...]; the rung below id 1 is id 4.
    expect(buildStageFor(1)).toBe(4)
  })

  it('stays at the bottom rung rather than falling off it', () => {
    expect(buildStageFor(3)).toBe(3)
  })

  it('returns the stage itself if it is not on the ladder', () => {
    expect(buildStageFor(99)).toBe(99)
  })
})

describe('the build tray', () => {
  it('keeps digraphs whole by default', () => {
    const s = fresh()
    generateBuild(s, { rng: mulberry32(1), drawGreen: () => 'fish', level: 1 })
    expect(s.history[0]!.segs).toContain('sh')
  })

  it('splits digraphs into letters when granularity says so', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1), drawGreen: () => 'fish', level: 1, granularity: 'letters',
    })
    expect(s.history[0]!.segs).toEqual(['f', 'i', 's', 'h'])
    expect(s.history[0]!.tray).not.toContain('sh')
  })

  it('puts a finger space between the words of a phrase', () => {
    const s = fresh()
    generateBuild(s, {
      rng: mulberry32(1), drawGreen: () => 'he has', level: 6, phrase: true,
    })
    expect(s.history[0]!.segs).toEqual(['he', FINGER_SPACE, 'has'])
    expect(s.history[0]!.tray).toContain(FINGER_SPACE)
  })
})
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/core/build-rungs.test.ts`
Expected: FAIL — `FINGER_SPACE` and `buildStageFor` do not exist.

- [ ] **Step 3: Implement the offset**

In `src/island/deal.ts`, export:

```ts
/**
 * The build rung for a given reading rung: ONE BEHIND, and clamped at the floor.
 *
 * Spelling lags reading in every reader — she will read `night` months before
 * she can spell it. Level-pegged, the day she climbs to split digraphs she is
 * asked to SPELL `bike`, and the build page becomes the thing that stops her.
 * One behind means she spells what she read last week.
 *
 * A stage that is not on the ladder is returned untouched rather than clamped to
 * the bottom: an unknown stage is a caller bug, and silently dealing rung 1 for
 * it would hide that bug behind an easy page.
 */
export function buildStageFor(readingStage: number): number {
  const i = STAGES.reading.indexOf(readingStage)
  if (i < 0) return readingStage
  return STAGES.reading[Math.max(0, i - 1)] as number
}
```

with `import { STAGES } from './harness'` at the top.

- [ ] **Step 4: Implement the tray changes**

In `src/core/generators/build.ts`:

```ts
/** The finger-space tile. Joe, 5 August: *"a button with a finger for 'finger
 *  space' for a new word"* — the writing convention taught inside the game
 *  rather than beside it. A phrase is not built until the gap is placed. */
export const FINGER_SPACE = '\u{1F449}'
```

Add to `BuildDeps`:

```ts
  /** `graphemes` keeps `sh` as one tile; `letters` makes her assemble it. */
  granularity?: 'graphemes' | 'letters'
  /** True on a phrase rung: the target is words, split on the finger space. */
  phrase?: boolean
```

Replace the `segs` line and the decoy loop:

```ts
  const segs = d.phrase
    ? w.split(' ').flatMap((word, i) => (i ? [FINGER_SPACE, word] : [word]))
    : d.granularity === 'letters'
      ? w.split('')
      : markDigraphs(w).flatMap(x => x.k === 'di' ? [x.txt] : x.txt.split(''))

  /* Letters-only means the digraph TILES go too, or she could still pick `sh`
     off the tray and never assemble it. */
  const pool = d.granularity === 'letters'
    ? DECOYS.filter(c => c.length === 1)
    : DECOYS
  const segSet = new Set(segs)
  const decoys: string[] = []
  let dg = 0
  while (decoys.length < 3 && dg++ < 60) {
    const c = pool[ri(d.rng, pool.length)] as string
    if (!segSet.has(c) && !decoys.includes(c)) decoys.push(c)
  }
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run tests/core/build-rungs.test.ts && npx vitest run && npm run parity`
Expected: the new file passes 6; full suite zero failures; parity identical (default path unchanged).

- [ ] **Step 6: Commit**

```bash
git add src/core/generators/build.ts src/island/deal.ts tests/core/build-rungs.test.ts
git commit -m "feat(building): one rung behind reading, with a finger space and a letters-only tray"
```

---

### Task 6: The words bench in the workbench

**Files:**
- Modify: `tools/workbench/api.mjs:27-40`
- Modify: `tools/workbench/public/index.html:16-24`
- Modify: `tools/workbench/public/app.js`
- Test: `tests/tools/words-bench.test.ts` (create)

**Interfaces:**
- Consumes: the ledger shape from Task 1.
- Produces: `wordsBench(rows, stageLabels)` exported from `tools/workbench/public/words.ts`, returning `Array<{rung: number, label: string, rows: Row[], done: number}>` — one group per rung, in ladder order.

- [ ] **Step 1: Write the failing test**

Create `tests/tools/words-bench.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { wordsBench } from '../../tools/workbench/public/words'

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
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/tools/words-bench.test.ts`
Expected: FAIL — no such module.

- [ ] **Step 3: Write the bench**

Create `tools/workbench/public/words.ts`:

```ts
/**
 * The words bench — one GROUP per rung, not one row per word.
 *
 * A word is approved against its NEIGHBOURS and not on its own: `sat` and `sit`
 * are each fine and both on one page is the entire point of the near-twin
 * mechanism, while `to`, `too` and `two` on one page is the trap the confusable
 * guard exists to prevent. A bench that showed one word at a time would be
 * asking Joe the wrong question.
 */
export interface WordRow {
  word: string; rung: number
  verdict: string; replacement: string; note: string
}
export interface WordGroup {
  rung: number; label: string; rows: WordRow[]; done: number
}

/* Mirrors `STAGES.reading`. The page is plain browser code and cannot import
   from `src/island/`; `tests/island/reading-ladder.test.ts` pins them together. */
export const LADDER = [3, 4, 1, 5, 6, 7, 8, 9, 10, 11]

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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/tools/words-bench.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Make the ledger writable and add the tab**

In `tools/workbench/api.mjs`, add to `WRITABLE` after `names`:

```js
  words: 'joe/words-audit.json',
```

and in the state object, beside `names`, pass the rows through:

```js
    words: readJson(root, 'joe/words-audit.json', { schemaVersion: 1, words: [] }).words ?? [],
```

In `tools/workbench/public/index.html`, add the tab button after the `names` one:

```html
      <button data-tab="words">Reading words</button>
```

and the section after the `names` section:

```html
    <section id="words" class="tab"></section>
```

- [ ] **Step 6: Render it**

In `tools/workbench/public/app.js`, follow the existing `names` tab renderer and add beside it a `words` renderer that, for each group from `wordsBench`, prints a heading of `label` with `done`/`rows.length`, then every row with three controls — approve, reject, and a replacement text box — each writing back through the same `/api/save` call the names tab uses with `what: 'words'`, and a footer button that POSTs to `/api/words/emit`.

Add the emit route to `tools/workbench/api.mjs`, beside the other POST routes:

```js
      if (path === '/api/words/emit' && req.method === 'POST') {
        const { emitToDisk } = await import('../words/emit.mjs')
        emitToDisk(join(root, 'joe/words-audit.json'),
                   join(root, 'src/core/rung-words.ts'))
        return json(res, 200, { emitted: true })
      }
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit && npx vitest run`
Expected: tsc exit 0; full suite zero failures.

Then run `npm run workbench`, open the **Reading words** tab, confirm the groups render in ladder order and that approving a row and pressing emit rewrites `src/core/rung-words.ts`.

- [ ] **Step 8: Commit**

```bash
git add tools/workbench/api.mjs tools/workbench/public/index.html tools/workbench/public/app.js tools/workbench/public/words.ts tests/tools/words-bench.test.ts
git commit -m "feat(workbench): a words bench that asks about a whole rung at once"
```

---

### Task 7: Draft the five word lists into the ledger

**Files:**
- Modify: `joe/words-audit.json`

**Interfaces:**
- Consumes: the ledger shape (Task 1), the rung ids (Task 2).
- Produces: ~150–200 rows with every human field empty.

- [ ] **Step 1: Draft the rows**

Append rows to `joe/words-audit.json` for each rung id, every one with `"verdict": ""`, `"replacement": ""`, `"note": ""`:

- **id 3** — CVC only, no blends, no digraphs: `sun cat pig bed dog hat pen cup bus fox` …
- **id 4** — + `ch sh th ck ll ng`: `fish chip shop sock bell ring moth duck` …
- **id 5** — three- and four-letter NOUNS (the gap: `GREEN` has two): `frog nest sock hand milk bird tree` …
- **id 6** — two-word phrases, pronoun/noun + verb, built only from words already vetted: `I go`, `I went`, `he has`, `we sit`, `she can` …
- **id 7** — five letters, adjacent consonants, NO new graphemes: `stand crisp plant blink frost champ trust shelf` …
- **id 8** — five-letter nouns and phrases from them.
- **id 9** — split digraphs: `cake bike home cube name ride` …
- **id 10** — alternative spellings: `rain play boat night green` …
- **id 11** — two-syllable: `sunset rabbit playground` …

Rules while drafting: no word may already appear in `GREEN` or `RED` (those lists are frozen and rung 3 deals them); check each word against `CONFUSABLE`; and no rung above 8 may contain a grapheme its own rung does not teach.

- [ ] **Step 2: Verify the ledger parses and emits**

Run: `node -e "JSON.parse(require('fs').readFileSync('joe/words-audit.json','utf8'))" && npm run words:emit && npx tsc --noEmit`
Expected: valid JSON; `RUNG_WORDS` still empty because nothing is approved yet; tsc exit 0.

- [ ] **Step 3: Verify the gate holds**

Run: `npx vitest run`
Expected: zero failures, and no new word is dealt anywhere — every row is unvetted, so every rung is still empty.

- [ ] **Step 4: Commit**

```bash
git add joe/words-audit.json
git commit -m "feat(words): the five rung lists drafted, none of them approved"
```

- [ ] **Step 5: Hand to Joe**

Tell him the bench is ready and how many rows are waiting per rung. **Do not approve anything.** The rungs ship as he approves them.

---

## Self-Review

**Spec coverage:** ladder ids and wording → Task 2. Frozen lists and new-list-per-rung → Tasks 1, 3. Rungs 1–2 below the start → Task 2. Juno does not move → Task 2 test. Twin-density dial → Task 4. Build one rung behind → Task 5. Finger space → Task 5. Tile granularity → Task 5. Workbench approval and the unvetted-is-invisible gate → Tasks 1, 6. Word lists → Task 7.

**Two spec items deliberately absent, both flagged rather than dropped:**
- **The first-letter-guess instrument.** The spec offers it ("offered rather than assumed") and Joe has not taken it. It is not a task; ask before building it.
- **Sentence rungs.** Explicitly the next spec, not this plan.

**Type consistency:** `RUNG_WORDS` keyed by generator id in Tasks 1, 3, 5. `drawRung(level)` returns `(() => MarkedWord) | null` in Tasks 3 and its `main.ts` wiring. `buildStageFor` returns a generator id, not an index, in Task 5. `LADDER` in `words.ts` and `STAGES_READING_LENGTH` in `read.ts` both mirror `STAGES.reading` and both are pinned by a test in Task 4 Step 4 and Task 2.
