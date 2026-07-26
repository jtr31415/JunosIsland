# Pet Island M0 — Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the learning logic from `v0/junos-words.html` into a tested TypeScript `core/` package, and rebuild the 2D game from those modules as a single self-contained HTML file that plays identically.

**Architecture:** Single npm package, two Vite builds. `core/` holds pure ported logic with an injectable RNG; `platform/` wraps browser APIs; `challenges/` holds the three renderers moved verbatim with dependency injection only. Fidelity is proven by a golden-output diff against the original file, which is never edited.

**Tech Stack:** TypeScript, Vite, Vitest, `vite-plugin-singlefile`, `vite-plugin-pwa`, GitHub Actions + Pages. Node 20+, npm.

## Global Constraints

- **`v0/junos-words.html` is never edited.** It is the reference implementation (brief §1.4) and outranks the brief itself on learning behaviour. All extraction reads from it; nothing writes to it.
- **Port, don't rewrite.** Ported functions keep their exact algorithm, control flow, and order of RNG consumption. The only permitted change is dependency injection (RNG, DOM element, callbacks).
- **`core/` is pure.** No DOM, no browser APIs, no module-level mutable state, no `Math.random` at call sites.
- **All persistence is async.** `SaveStore` returns Promises even though localStorage is synchronous.
- **UK English** in all child-facing strings. Preserve existing copy verbatim.
- **Save schema is free to change** (no migration needed) but must carry `schemaVersion` and `updatedAt`.
- **Commit after every task.** Conventional commit prefixes (`feat:`, `test:`, `chore:`, `refactor:`).
- Node 20+, npm. No Docker.

## Revision log

**rev 2 — after Fable 5 review (FAIL verdict on rev 1).** The review confirmed the
`core/` ports are faithful line by line, that the golden harness slices are complete with
no missing symbols, and that Task 14's single-shared-Rng reproduction really is
equivalent to the original's global `Math.random`. It found seven blockers, all fixed here:

1. Task 18's wordFind tests used 1000ms and `.click()`; the original schedules speech at
   `900 + picks.length * 60` = 1080ms (v0:886) and binds `pointerdown` (v0:882). As
   written the tests could only pass if the port broke frozen behaviour.
2. `rewardUntil`/`quietUntil` were to become renderer closure state, but they are
   host-written and renderer-read — closing over them would silently kill the
   reward-hold and quiet-period sequencing the same task orders preserved.
3. `Sfx` was specified as `'good' | 'bad' | 'pop'` with frequency arguments; the
   renderers actually call `'up' | 'down' | 'bump' | 'win'` with none, because
   `popSound` reads `THEMES[theme]` internally (v0:2015-2026).
4. The battery drop contradicted Task 18's verbatim rule (`spendBattery` sits inside
   `renderSum` at v0:1127), cited the wrong document, and made the Phase 3 gate false.
5. The golden capture pinned level 1 only, leaving `alienWord`'s stream, bridging
   addition, and subtraction levels 2–3 unproven — all one tap away in the UI.
6. No `git init` step, though the spec requires one.
7. `jsdom` never installed; `environmentMatchGlobs` removed in Vitest 4.

Also fixed: `RED` is 41 entries not 40 (verified by executing the original's own
literal); `inDeadZone` used `>=`/`<=` against the original's strict comparisons;
`speak` used `??` where the original uses `||`; the shared `voiceToastShown` flag was
split, losing the mutual exclusion between the two voice toasts; three assertions tested
properties the algorithm does not guarantee; and v0:644-694, 1498-1504, 1529-1530 and
1825-1833 had no assigned module.

## Phase boundaries

Phases end at a Fable 5 review gate. Do not begin the next phase until the review passes.

| Phase | Tasks | Gate |
|---|---|---|
| 0 Foundations | 1–2 | Pipeline green, island stub deployed |
| 1 Golden capture | 3 | 500 items × 4 modes on disk |
| 2 `core/` extraction | 4–15 | Golden diff clean |
| 3 Shell rebuild | 16–21 | 2D game plays identically **except the retired battery** |

M1 (Phases 4–8, the island) gets its own plan, written after Phase 3's review passes — its task detail depends on the module signatures this plan produces, and inventing them now would be fabrication.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `vitest.config.ts` | Project config |
| `vite.words.config.ts` | Builds `dist/words/junos-words.html`, fully inlined |
| `vite.island.config.ts` | Builds `dist/island/`, PWA |
| `.github/workflows/ci.yml` | typecheck → test → build both → deploy island |
| `src/core/rng.ts` | `Rng` type, `mulberry32`, `ri`, `shuffle` |
| `src/core/constants.ts` | `MIN`, `MAX` |
| `src/core/wordlists.ts` | `GREEN`, `RED`, `CONFUSABLE`, `groupOf`, word types |
| `src/core/segmentation.ts` | `plainWord`, `parseMark`, `GRAPHS`, `markDigraphs` |
| `src/core/neighbours.ts` | `lev1`, `buildPool`, `buildNeighbours` |
| `src/core/alien.ts` | `AL_*` pools, `REAL_BLOCK`, `alienWord` |
| `src/core/names.ts` | `petName` — decodable pet names |
| `src/core/decks.ts` | `makeDeck` |
| `src/core/generators/read.ts` | `generateRead` |
| `src/core/generators/sums.ts` | `generateAdd`, `generateSub` |
| `src/core/generators/build.ts` | `generateBuild` |
| `src/core/themes.ts` | `THEMES` |
| `src/platform/speech.ts` | `pickVoice`, `speak` |
| `src/platform/audio.ts` | `note`, `popSound` |
| `src/platform/storage.ts` | `SaveStore` interface + localStorage implementation |
| `src/challenges/mount.ts` | Container contract, shared deps type |
| `src/challenges/deadzone.ts` | `inDeadZone` |
| `src/challenges/wordFind.ts` | `renderSet`, `wordTap`, `speakTarget` |
| `src/challenges/build.ts` | `renderBuild`, `fredTalk`, `FRED_SOUNDS` |
| `src/challenges/sum.ts` | `renderSum`, number pad, dot hints |
| `src/words2d/` | 2D shell: html, css, ambience, spectacles, album, profiles |
| `tools/golden/capture.mjs` | Slices the original file, seeds it, dumps golden JSON |
| `tests/golden.test.ts` | Regenerates from `core/` and diffs against the golden JSON |

---

## Task 1: Project skeleton with a passing test

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/core/rng.ts`, `tests/core/rng.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Rng`, `mulberry32(seed: number): Rng`, `ri(rng: Rng, n: number): number`, `shuffle<T>(rng: Rng, a: T[]): T[]`, `defaultRng: Rng`

- [ ] **Step 0: Initialise the repository**

The working directory is not a git repo yet and the remote is empty.

```bash
cd C:/Users/joetr/Documents/JunosIsland
git init -b main
```

Write `.gitignore` (`node_modules/`, `dist/`, `Assets/*.zip`, `Assets/**/*.blend`), then make the first commit containing `pet-island-brief.md`, `v0/`, and `docs/`.

- [ ] **Step 1: Initialise the package**

`jsdom` is required — Tasks 15 and 18 declare `@vitest-environment jsdom` and Vitest errors without the package installed.

```bash
npm init -y
npm i -D typescript vite vitest @types/node jsdom
```

Then edit the generated `package.json`: set `"type": "module"`, `"private": true`, and replace the scripts block.

Then set `"type": "module"` in `package.json` and add scripts:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "vite --config vite.island.config.ts",
    "dev:words": "vite --config vite.words.config.ts",
    "build:words": "vite build --config vite.words.config.ts",
    "build:island": "vite build --config vite.island.config.ts",
    "build": "npm run build:words && npm run build:island"
  }
}
```

- [ ] **Step 2: Add `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests", "*.config.ts"]
}
```

- [ ] **Step 3: Add `vitest.config.ts`**

`environmentMatchGlobs` was removed in Vitest 4. Tests needing a DOM declare it per-file with a `@vitest-environment jsdom` docblock instead — which the tests in Tasks 15 and 18 already carry.

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Write the failing test**

`tests/core/rng.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mulberry32, ri, shuffle } from '../../src/core/rng'

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = [a(), a(), a(), a(), a()]
    const seqB = [b(), b(), b(), b(), b()]
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const r = mulberry32(7)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('differs between seeds', () => {
    expect(mulberry32(1)()).not.toEqual(mulberry32(2)())
  })
})

describe('ri', () => {
  it('returns integers in [0, n)', () => {
    const r = mulberry32(3)
    for (let i = 0; i < 500; i++) {
      const v = ri(r, 10)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10)
    }
  })
})

describe('shuffle', () => {
  it('mutates in place and returns the same array reference', () => {
    const a = [1, 2, 3, 4, 5]
    const out = shuffle(mulberry32(1), a)
    expect(out).toBe(a)
  })

  it('preserves the multiset of elements', () => {
    const a = [1, 2, 3, 4, 5, 5, 5]
    const out = [...shuffle(mulberry32(9), a)].sort()
    expect(out).toEqual([1, 2, 3, 4, 5, 5, 5])
  })

  it('is deterministic for a given seed', () => {
    const x = shuffle(mulberry32(11), [1, 2, 3, 4, 5, 6, 7, 8])
    const y = shuffle(mulberry32(11), [1, 2, 3, 4, 5, 6, 7, 8])
    expect(x).toEqual(y)
  })
})
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `../../src/core/rng`

- [ ] **Step 6: Implement `src/core/rng.ts`**

`shuffle` reproduces the original's Fisher–Yates exactly (`v0/junos-words.html:713`), including mutating in place and returning the array. `ri` reproduces line 719.

```ts
/** A random source returning a float in [0, 1) — same contract as Math.random. */
export type Rng = () => number

/** Production default. Ported code consumes an Rng so tests can seed it. */
export const defaultRng: Rng = Math.random

/** Small deterministic PRNG. Used by tests and by the golden-output harness. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random integer in [0, n). Port of `ri` (junos-words.html:719). */
export const ri = (rng: Rng, n: number): number => Math.floor(rng() * n)

/** In-place Fisher-Yates. Port of `shuffle` (junos-words.html:713). */
export function shuffle<T>(rng: Rng, a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test` — Expected: PASS (7 tests)
Run: `npm run typecheck` — Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts src/core/rng.ts tests/core/rng.test.ts
git commit -m "feat: project skeleton with seeded RNG and tests"
```

---

## Task 2: Both builds, CI, and Pages

**Files:**
- Create: `vite.words.config.ts`, `vite.island.config.ts`, `src/words2d/index.html`, `src/island/index.html`, `src/island/main.ts`, `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: Task 1's package scripts
- Produces: a proven deploy pipeline. No runtime exports.

This task uses placeholder entry points deliberately. The point is to prove the pipeline before any porting, so that a later build failure is unambiguously the port's fault.

- [ ] **Step 1: Install build plugins**

```bash
npm i -D vite-plugin-singlefile vite-plugin-pwa
npm i three
npm i -D @types/three
```

- [ ] **Step 2: Create the 2D entry stub**

`src/words2d/index.html`:

```html
<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>Juno's Words</title></head>
<body><div id="app">words2d build stub</div><script type="module" src="./main.ts"></script></body>
</html>
```

`src/words2d/main.ts`:

```ts
document.getElementById('app')!.textContent = 'words2d build stub — pipeline OK'
```

- [ ] **Step 3: Create the island entry stub**

`src/island/index.html`:

```html
<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Pet Island</title></head>
<body><div id="app">island build stub</div><script type="module" src="./main.ts"></script></body>
</html>
```

`src/island/main.ts`:

```ts
document.getElementById('app')!.textContent = 'island build stub — pipeline OK'
```

- [ ] **Step 4: Write `vite.words.config.ts`**

`vite-plugin-singlefile` inlines every asset so the output opens from `file://`.

```ts
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(__dirname, 'src/words2d'),
  plugins: [viteSingleFile()],
  build: {
    outDir: resolve(__dirname, 'dist/words'),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
```

- [ ] **Step 5: Write `vite.island.config.ts`**

`registerType: 'autoUpdate'` is mandatory — without it a service worker serves stale assets indefinitely after a fix is pushed.

```ts
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'

export default defineConfig({
  root: resolve(__dirname, 'src/island'),
  base: '/JunosIsland/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Pet Island",
        short_name: 'Pet Island',
        start_url: '/JunosIsland/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#8fd6ff',
        theme_color: '#8fd6ff',
        icons: [],
      },
    }),
  ],
  build: { outDir: resolve(__dirname, 'dist/island'), emptyOutDir: true },
})
```

- [ ] **Step 6: Verify both builds locally**

```bash
npm run build
```

Expected: `dist/words/index.html` exists as a single file with no `<script src=`, and `dist/island/` contains `index.html`, assets, and `sw.js`.

Confirm the words build really is self-contained:

```bash
grep -c 'script type="module" src=' dist/words/index.html || echo "OK: no external script refs"
```

Expected: `OK: no external script refs`

- [ ] **Step 7: Rename the words output**

Add to `vite.words.config.ts` build options so the artifact keeps its established name:

```ts
    rollupOptions: {
      output: { inlineDynamicImports: true },
      input: resolve(__dirname, 'src/words2d/index.html'),
    },
```

Then add an npm script that copies it to the expected filename:

```json
"postbuild:words": "node -e \"require('fs').copyFileSync('dist/words/index.html','dist/words/junos-words.html')\""
```

- [ ] **Step 8: Write the CI workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - name: Assemble Pages site
        run: |
          mkdir -p _site
          cp -r dist/island/* _site/
          mkdir -p _site/words
          cp dist/words/junos-words.html _site/words/
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 9: Commit and push, then enable Pages**

```bash
git add -A
git commit -m "chore: two Vite builds, CI, and Pages deployment"
git remote add origin https://github.com/jtr31415/JunosIsland.git
git push -u origin main
```

Then in the GitHub repo: Settings → Pages → Source = "GitHub Actions".

- [ ] **Step 10: Verify the pipeline end to end**

Confirm the Actions run is green and `https://jtr31415.github.io/JunosIsland/` shows "island build stub — pipeline OK", and `/JunosIsland/words/junos-words.html` shows the words stub.

**PHASE 0 GATE — Fable 5 review.** Dispatch a review of the spec and this plan against the committed code so far. Do not start Phase 1 until it passes.

---

## Task 3: Golden-output capture from the original

**Files:**
- Create: `tools/golden/capture.mjs`, `tools/golden/golden.json`

**Interfaces:**
- Consumes: `v0/junos-words.html` (read-only)
- Produces: `tools/golden/golden.json` with shape
  `{ seed: number, read: ReadPick[][], add: SumItem[], sub: SumItem[], build: BuildItem[] }`

**Why this design:** the original file cannot simply be imported — it does DOM work at load (`const fx = $('fx'), fctx = fx.getContext('2d')`). Rather than stub a browser or add Playwright, the harness slices the *pure* line ranges out of the original file verbatim and runs them under Node with `Math.random` seeded. Using the original source text verbatim is what makes this a true reference rather than a second port.

The line ranges are stable because `v0/junos-words.html` is frozen and never edited.

- [ ] **Step 1: Write the capture harness**

`tools/golden/capture.mjs`:

```js
// Slices the pure learning logic out of the frozen original and runs it with a
// seeded Math.random, so core/ can be diffed against genuine reference output.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const src = readFileSync(resolve(root, 'v0/junos-words.html'), 'utf8').split(/\r?\n/)

// 1-indexed inclusive ranges of pure logic in the original file.
const RANGES = [
  [368, 504],   // GREEN, RED, CONFUSABLE, groupOf, plainWord, parseMark,
                // GRAPHS, markDigraphs, lev1, POOL, NEIGH, alien pools, alienWord
  [697, 719],   // MIN, MAX, levels, store, shuffle, makeDeck, decks, $, ri
  [773, 837],   // generateRead
  [974, 1008],  // generateAdd, generateSub
  [1161, 1179], // generateBuild
]

const slice = RANGES.map(([a, b]) => src.slice(a - 1, b).join('\n')).join('\n\n')

const SEED = 20260726

const prelude = `
let __s = ${SEED} >>> 0;
Math.random = () => {
  __s = (__s + 0x6d2b79f5) >>> 0;
  let t = __s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const document = { getElementById: () => null };
`

// Levels matter. The sliced `levels` object starts at all-1s, so a level-1-only
// capture would never exercise alienWord's RNG stream (read L2, build L2), the
// bridging branch of generateAdd (L2), or generateSub L2/L3 — all of which are
// one tap away in the shipped UI. Capture every level the UI can reach.
const driver = `
const out = { seed: ${SEED}, read: [], readL2: [], add: [], addL2: [],
              sub: [], subL2: [], subL3: [], build: [], buildL2: [] };
for (let i = 0; i < 500; i++) { generateRead();  out.read.push(store.read.history[store.read.idx]); }
for (let i = 0; i < 500; i++) { generateAdd();   out.add.push(store.add.history[store.add.idx]); }
for (let i = 0; i < 500; i++) { generateSub();   out.sub.push(store.sub.history[store.sub.idx]); }
for (let i = 0; i < 500; i++) { generateBuild(); out.build.push(store.build.history[store.build.idx]); }

levels.read = 2; levels.add = 2; levels.sub = 2; levels.build = 2;
for (let i = 0; i < 500; i++) { generateRead();  out.readL2.push(store.read.history[store.read.idx]); }
for (let i = 0; i < 500; i++) { generateAdd();   out.addL2.push(store.add.history[store.add.idx]); }
for (let i = 0; i < 500; i++) { generateSub();   out.subL2.push(store.sub.history[store.sub.idx]); }
for (let i = 0; i < 500; i++) { generateBuild(); out.buildL2.push(store.build.history[store.build.idx]); }

levels.sub = 3;
for (let i = 0; i < 500; i++) { generateSub();   out.subL3.push(store.sub.history[store.sub.idx]); }
return out;
`

const result = new Function(prelude + slice + driver)()

mkdirSync(here, { recursive: true })
writeFileSync(resolve(here, 'golden.json'), JSON.stringify(result, null, 2))
console.log('golden.json written:', Object.entries(result)
  .filter(([k]) => k !== 'seed')
  .map(([k, v]) => `${k}=${v.length}`).join(' '))
```

- [ ] **Step 2: Run the capture**

Run: `node tools/golden/capture.mjs`
Expected: `golden.json written: read=500 readL2=500 add=500 addL2=500 sub=500 subL2=500 subL3=500 build=500 buildL2=500`

If it throws a `ReferenceError` naming an identifier, a needed line range was missed — widen `RANGES` to include that definition and rerun. Do not stub the missing symbol.

- [ ] **Step 3: Sanity-check the captured data by eye**

Run: `node -e "const g=require('./tools/golden/golden.json'); console.log(JSON.stringify(g.read[0])); console.log(JSON.stringify(g.add.slice(0,3))); console.log(JSON.stringify(g.build[0]))"`

Expected shape:
- `read[0]` is an array of 3 objects `{w, cls}` (history was empty, so `n = MIN = 3`)
- each `add` item is `{a, b, op: 'add'}` with `a + b <= 10` at level 1
- `build[0]` is `{w, segs, tray}` where `tray.length === segs.length + 3`

- [ ] **Step 4: Assert the capture is reproducible**

Run: `node tools/golden/capture.mjs && cp tools/golden/golden.json /tmp/g1.json && node tools/golden/capture.mjs && diff tools/golden/golden.json /tmp/g1.json && echo "REPRODUCIBLE"`
Expected: `REPRODUCIBLE`

- [ ] **Step 5: Commit**

```bash
git add tools/golden/capture.mjs tools/golden/golden.json
git commit -m "test: capture golden generator output from the frozen original"
```

**PHASE 1 GATE — Fable 5 review.** Confirm the harness genuinely uses original source text and that the captured data looks like real curriculum output.

---

## Task 4: `core/wordlists.ts`

**Files:**
- Create: `src/core/wordlists.ts`, `src/core/constants.ts`, `tests/core/wordlists.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `MarkedWord`, `PlainWord`, `WordClass`, `GREEN: PlainWord[]`, `RED: MarkedWord[]`, `CONFUSABLE: PlainWord[][]`, `groupOf: Record<string, number>`, `MIN = 3`, `MAX = 12`

- [ ] **Step 1: Write the failing test**

`tests/core/wordlists.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { GREEN, RED, CONFUSABLE, groupOf } from '../../src/core/wordlists'

describe('wordlists', () => {
  it('has the expected list sizes', () => {
    expect(GREEN).toHaveLength(56)
    expect(RED).toHaveLength(41)
  })

  it('GREEN words are plain — no bracket markup', () => {
    for (const w of GREEN) expect(w).not.toMatch(/[[\]]/)
  })

  it('every RED word carries balanced bracket markup', () => {
    for (const w of RED) {
      const opens = (w.match(/\[/g) ?? []).length
      const closes = (w.match(/\]/g) ?? []).length
      expect(opens).toBe(closes)
      expect(opens).toBeGreaterThan(0)
    }
  })

  it('groupOf maps every confusable word to its group index', () => {
    expect(groupOf['to']).toBe(groupOf['too'])
    expect(groupOf['to']).toBe(groupOf['two'])
    expect(groupOf['of']).toBe(groupOf['off'])
    expect(groupOf['then']).toBe(groupOf['them'])
    expect(groupOf['to']).not.toBe(groupOf['of'])
    expect(groupOf['cat']).toBeUndefined()
  })

  it('CONFUSABLE groups are disjoint', () => {
    const seen = new Set<string>()
    for (const g of CONFUSABLE) for (const w of g) {
      expect(seen.has(w)).toBe(false)
      seen.add(w)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/wordlists.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/constants.ts`**

```ts
/** Smallest and largest word-set size. Ported from junos-words.html:697. */
export const MIN = 3
export const MAX = 12
```

- [ ] **Step 4: Implement `src/core/wordlists.ts`**

Copy `GREEN`, `RED` and `CONFUSABLE` **verbatim** from `v0/junos-words.html:368-393`. Do not re-type them by hand and do not reorder — deck dealing order depends on array order, and the golden diff will catch any change.

```ts
/** A word that may carry [bracket] markup around its tricky bit, e.g. "s[ai]d". */
export type MarkedWord = string
/** A word with markup stripped, e.g. "said". */
export type PlainWord = string
export type WordClass = 'green' | 'red'

/* GREEN = fully decodable with the taught code. */
export const GREEN: PlainWord[] = [
  'a','am','an','and','as','at','back','big','but','can','dad','did',
  'for','from','get','got','had','has','help','him','his','if','in','is',
  'it','jump','just','let','look','mum','no','not','off','on','pull',
  'push','put','ran','red','run','sat','see','sit','stop','that','them',
  'then','this','too','up','us','went','when','will','with','yes'
]

/* RED words carry [brackets] around the tricky bit — the grapheme that
   breaks the taught code. Everything outside the brackets is decodable. */
export const RED: MarkedWord[] = [
  '[a]ll','[are]','b[e]','b[y]','c[o]m[e]','d[o]','d[oes]','d[ow]n',
  'g[o]','hav[e]','h[e]','h[er]','h[ere]','[I]','int[o]','l[i]k[e]',
  'l[o]v[e]','m[e]','m[y]','n[ow]','o[f]','[oh]','[one]','[ou]t','s[ai]d',
  'sh[e]','s[o]','s[o]m[e]','th[e]','th[ey]','t[o]','t[wo]','w[a]nt',
  'w[a]s','w[e]','w[ere]','wh[a]t','[who]','wh[y]','y[ou]','y[our]'
]

/* Words that sound the same (or nearly the same) — never shown in the
   same batch, because a listening game with "too" AND "two" on screen
   is a trap, not a test. */
export const CONFUSABLE: PlainWord[][] = [
  ['to','too','two'],
  ['of','off'],
  ['an','and'],
  ['then','them']
]

export const groupOf: Record<PlainWord, number> = {}
CONFUSABLE.forEach((g, gi) => g.forEach(w => { groupOf[w] = gi }))
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/core/wordlists.test.ts` — Expected: PASS (5 tests)

If the length assertions fail, count the actual arrays in the original and correct the *test*, not the data — the data is authoritative.

- [ ] **Step 6: Commit**

```bash
git add src/core/wordlists.ts src/core/constants.ts tests/core/wordlists.test.ts
git commit -m "feat: port word lists and confusable groups to core"
```

---

## Task 5: `core/segmentation.ts`

**Files:**
- Create: `src/core/segmentation.ts`, `tests/core/segmentation.test.ts`

**Interfaces:**
- Consumes: `MarkedWord`, `PlainWord` from `core/wordlists`
- Produces: `Seg { txt: string; k: 'plain' | 'tricky' }`, `DiSeg { txt: string; k: 'plain' | 'di' }`, `plainWord(str: MarkedWord): PlainWord`, `parseMark(str: MarkedWord): Seg[]`, `GRAPHS: string[]`, `markDigraphs(txt: PlainWord): DiSeg[]`

- [ ] **Step 1: Write the failing test**

`tests/core/segmentation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { plainWord, parseMark, markDigraphs, GRAPHS } from '../../src/core/segmentation'
import { GREEN, RED } from '../../src/core/wordlists'

describe('plainWord', () => {
  it('strips bracket markup', () => {
    expect(plainWord('s[ai]d')).toBe('said')
    expect(plainWord('[who]')).toBe('who')
    expect(plainWord('c[o]m[e]')).toBe('come')
  })

  it('leaves unmarked words untouched', () => {
    expect(plainWord('jump')).toBe('jump')
  })
})

describe('parseMark', () => {
  it('splits into plain and tricky segments', () => {
    expect(parseMark('s[ai]d')).toEqual([
      { txt: 's', k: 'plain' },
      { txt: 'ai', k: 'tricky' },
      { txt: 'd', k: 'plain' },
    ])
  })

  it('handles a word that is entirely tricky', () => {
    expect(parseMark('[who]')).toEqual([{ txt: 'who', k: 'tricky' }])
  })

  it('handles multiple tricky bits', () => {
    expect(parseMark('c[o]m[e]')).toEqual([
      { txt: 'c', k: 'plain' },
      { txt: 'o', k: 'tricky' },
      { txt: 'm', k: 'plain' },
      { txt: 'e', k: 'tricky' },
    ])
  })

  it('round-trips: concatenated segments equal the plain word', () => {
    for (const w of RED) {
      const joined = parseMark(w).map(s => s.txt).join('')
      expect(joined).toBe(plainWord(w))
    }
  })
})

describe('markDigraphs', () => {
  it('finds a digraph', () => {
    expect(markDigraphs('shop')).toEqual([
      { txt: 'sh', k: 'di' },
      { txt: 'op', k: 'plain' },
    ])
  })

  it('prefers longer graphemes — trigraphs win', () => {
    expect(markDigraphs('night')).toEqual([
      { txt: 'n', k: 'plain' },
      { txt: 'igh', k: 'di' },
      { txt: 't', k: 'plain' },
    ])
  })

  it('coalesces consecutive plain letters into one segment', () => {
    expect(markDigraphs('stop')).toEqual([{ txt: 'stop', k: 'plain' }])
  })

  it('round-trips every GREEN word', () => {
    for (const w of GREEN) {
      expect(markDigraphs(w).map(s => s.txt).join('')).toBe(w)
    }
  })

  it('round-trips every RED word once plained', () => {
    for (const w of RED) {
      const p = plainWord(w)
      expect(markDigraphs(p).map(s => s.txt).join('')).toBe(p)
    }
  })

  it('lists trigraphs before digraphs so longest-first matching works', () => {
    expect(GRAPHS.indexOf('igh')).toBeLessThan(GRAPHS.indexOf('ch'))
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/segmentation.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/segmentation.ts`**

Ported verbatim from `v0/junos-words.html:398-428`. The labelled `continue outer` becomes the same loop structure; do not "simplify" it.

```ts
import type { MarkedWord, PlainWord } from './wordlists'

export type SegKind = 'plain' | 'tricky'
export interface Seg { txt: string; k: SegKind }

export type DiKind = 'plain' | 'di'
export interface DiSeg { txt: string; k: DiKind }

/** Strip [bracket] markup. Port of plainWord (junos-words.html:398). */
export function plainWord(str: MarkedWord): PlainWord {
  return str.replace(/[[\]]/g, '')
}

/** Split a marked word into plain and tricky runs. Port of parseMark (:400). */
export function parseMark(str: MarkedWord): Seg[] {
  const segs: Seg[] = []
  let buf = ''
  let inB = false
  for (const ch of str) {
    if (ch === '[') { if (buf) segs.push({ txt: buf, k: 'plain' }); buf = ''; inB = true }
    else if (ch === ']') { if (buf) segs.push({ txt: buf, k: 'tricky' }); buf = ''; inB = false }
    else buf += ch
  }
  if (buf) segs.push({ txt: buf, k: inB ? 'tricky' : 'plain' })
  return segs
}

/** Common Reception/Y1 graphemes, longest first so trigraphs win. (:412) */
export const GRAPHS: string[] = ['igh','ear','air','ure',
  'ch','sh','th','wh','ph','ng','nk','qu','ck','ff','ll','ss','zz',
  'ai','ay','ee','ea','ie','oa','oo','ou','ow','oi','oy',
  'or','ar','ur','er','ir','aw','au','ew','ue','oe']

/** Segment into graphemes, coalescing plain letters. Port of markDigraphs (:417). */
export function markDigraphs(txt: PlainWord): DiSeg[] {
  const out: DiSeg[] = []
  let i = 0
  outer: while (i < txt.length) {
    for (const g of GRAPHS) {
      if (txt.startsWith(g, i)) { out.push({ txt: g, k: 'di' }); i += g.length; continue outer }
    }
    const last = out[out.length - 1]
    if (last && last.k === 'plain') last.txt += txt[i]
    else out.push({ txt: txt[i]!, k: 'plain' })
    i++
  }
  return out
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/segmentation.test.ts` — Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/segmentation.ts tests/core/segmentation.test.ts
git commit -m "feat: port segmentation and grapheme marking to core"
```

---

## Task 6: `core/neighbours.ts`

**Files:**
- Create: `src/core/neighbours.ts`, `tests/core/neighbours.test.ts`

**Interfaces:**
- Consumes: `GREEN`, `RED`, `groupOf`, `WordClass`, `MarkedWord`, `PlainWord`; `plainWord`
- Produces: `PoolEntry { raw: MarkedWord; cls: WordClass }`, `lev1(a: string, b: string): boolean`, `buildPool(): PoolEntry[]`, `NeighbourMap = Record<PlainWord, PoolEntry[]>`, `buildNeighbours(pool: PoolEntry[]): NeighbourMap`

The original builds `NEIGH` as a load-time side effect (`:452`). Here it becomes a function so tests can build from fixtures, but the default call produces an identical map.

- [ ] **Step 1: Write the failing test**

`tests/core/neighbours.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { lev1, buildPool, buildNeighbours } from '../../src/core/neighbours'
import { plainWord } from '../../src/core/segmentation'

describe('lev1', () => {
  it('accepts single substitutions', () => {
    expect(lev1('sat', 'sit')).toBe(true)
    expect(lev1('cat', 'cot')).toBe(true)
  })

  it('accepts single insertions and deletions', () => {
    expect(lev1('at', 'sat')).toBe(true)
    expect(lev1('sat', 'at')).toBe(true)
  })

  it('rejects identical words', () => {
    expect(lev1('sat', 'sat')).toBe(false)
  })

  it('rejects two or more substitutions', () => {
    expect(lev1('sat', 'sip')).toBe(false)
  })

  it('rejects a length difference greater than one', () => {
    expect(lev1('a', 'sat')).toBe(false)
  })
})

describe('buildNeighbours', () => {
  const neigh = buildNeighbours(buildPool())

  it('pairs true single-edit neighbours', () => {
    const sat = (neigh['sat'] ?? []).map(e => plainWord(e.raw))
    expect(sat).toContain('sit')
  })

  it('never lists a word as its own neighbour', () => {
    for (const [w, list] of Object.entries(neigh)) {
      expect(list.map(e => plainWord(e.raw))).not.toContain(w)
    }
  })

  it('excludes same-confusable-group pairs — "then" must not offer "them"', () => {
    const then = (neigh['then'] ?? []).map(e => plainWord(e.raw))
    expect(then).not.toContain('them')
  })

  it('excludes "of"/"off" as neighbours of each other', () => {
    expect((neigh['of'] ?? []).map(e => plainWord(e.raw))).not.toContain('off')
  })

  it('has an entry for every pool word', () => {
    const pool = buildPool()
    for (const e of pool) expect(neigh[plainWord(e.raw)]).toBeDefined()
  })

  it('every listed neighbour really is one edit away', () => {
    for (const [w, list] of Object.entries(neigh)) {
      for (const e of list) expect(lev1(w, plainWord(e.raw))).toBe(true)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/neighbours.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/neighbours.ts`**

Ported verbatim from `v0/junos-words.html:432-460`.

```ts
import { GREEN, RED, groupOf } from './wordlists'
import type { MarkedWord, PlainWord, WordClass } from './wordlists'
import { plainWord } from './segmentation'

export interface PoolEntry { raw: MarkedWord; cls: WordClass }
export type NeighbourMap = Record<PlainWord, PoolEntry[]>

/** True when a and b are exactly one edit apart. Port of lev1 (:432). */
export function lev1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    let d = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++d > 1) return false
    return d === 1
  }
  const long = a.length > b.length ? a : b
  const short = a.length > b.length ? b : a
  let i = 0, j = 0, skips = 0
  while (i < long.length && j < short.length) {
    if (long[i] === short[j]) { i++; j++ }
    else if (++skips > 1) return false
    else i++
  }
  return true
}

/** The full word pool, green then red. Port of POOL (:448). Order matters. */
export function buildPool(): PoolEntry[] {
  return [
    ...GREEN.map((w): PoolEntry => ({ raw: w, cls: 'green' })),
    ...RED.map((w): PoolEntry => ({ raw: w, cls: 'red' })),
  ]
}

/**
 * Near-twin distractor map: pool words one letter apart, minus sound-alike
 * pairs. Port of the NEIGH builder (:452), which ran at load time.
 */
export function buildNeighbours(pool: PoolEntry[]): NeighbourMap {
  const neigh: NeighbourMap = {}
  pool.forEach(a => {
    const pa = plainWord(a.raw)
    neigh[pa] = pool.filter(b => {
      const pb = plainWord(b.raw)
      return pa !== pb && lev1(pa, pb) &&
        !(groupOf[pa] !== undefined && groupOf[pa] === groupOf[pb])
    })
  })
  return neigh
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/neighbours.test.ts` — Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/neighbours.ts tests/core/neighbours.test.ts
git commit -m "feat: port neighbour distractor map to core"
```

---

## Task 7: `core/alien.ts`

**Files:**
- Create: `src/core/alien.ts`, `tests/core/alien.test.ts`

**Interfaces:**
- Consumes: `GREEN`, `RED`; `plainWord`; `Rng`, `ri`
- Produces: `AL_ONSETS`, `AL_VOWELS`, `AL_CODAS_SHORT`, `AL_CODAS_LONG`, `REAL_BLOCK: Set<string>`, `alienWord(rng: Rng): string`

- [ ] **Step 1: Write the failing test**

`tests/core/alien.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { alienWord, REAL_BLOCK, AL_ONSETS, AL_VOWELS } from '../../src/core/alien'
import { mulberry32 } from '../../src/core/rng'
import { markDigraphs } from '../../src/core/segmentation'

describe('alienWord', () => {
  it('never produces a real word', () => {
    const rng = mulberry32(1)
    for (let i = 0; i < 5000; i++) {
      expect(REAL_BLOCK.has(alienWord(rng))).toBe(false)
    }
  })

  it('never exceeds five characters', () => {
    const rng = mulberry32(2)
    for (let i = 0; i < 5000; i++) {
      expect(alienWord(rng).length).toBeLessThanOrEqual(5)
    }
  })

  it('never ends with the same grapheme it starts with', () => {
    // The original skips any draw where onset === coda (v0:497), so no alien
    // word is a "bab"/"dad" shape. Compare the two ends directly.
    const rng = mulberry32(3)
    for (let i = 0; i < 2000; i++) {
      const w = alienWord(rng)
      const onset = [...AL_ONSETS].sort((a, b) => b.length - a.length).find(o => w.startsWith(o))!
      const coda = w.slice(onset.length).replace(/^(ee|oo|or|[aeiou])/, '')
      expect(coda).not.toBe(onset)
    }
  })

  it('is built only from taught graphemes', () => {
    const rng = mulberry32(4)
    for (let i = 0; i < 2000; i++) {
      const w = alienWord(rng)
      const hasVowel = AL_VOWELS.some(v => w.includes(v))
      expect(hasVowel).toBe(true)
      expect(markDigraphs(w).map(s => s.txt).join('')).toBe(w)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = mulberry32(99), b = mulberry32(99)
    for (let i = 0; i < 50; i++) expect(alienWord(a)).toBe(alienWord(b))
  })

  it('produces variety — at least 100 distinct words in 1000 draws', () => {
    const rng = mulberry32(5)
    const seen = new Set<string>()
    for (let i = 0; i < 1000; i++) seen.add(alienWord(rng))
    expect(seen.size).toBeGreaterThan(100)
  })
})

describe('REAL_BLOCK', () => {
  it('contains every taught word so alien words never collide with the curriculum', () => {
    expect(REAL_BLOCK.has('jump')).toBe(true)
    expect(REAL_BLOCK.has('said')).toBe(true)
    expect(REAL_BLOCK.has('cat')).toBe(true)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/alien.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/alien.ts`**

Copy the `AL_*` pools and the full `REAL_BLOCK` list **verbatim** from `v0/junos-words.html:463-504`. Note `AL_VOWELS` deliberately repeats the five short vowels to weight them — do not deduplicate.

```ts
import { GREEN, RED } from './wordlists'
import { plainWord } from './segmentation'
import { ri } from './rng'
import type { Rng } from './rng'

export const AL_ONSETS = ['b','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z','ch','sh','th']
/* short vowels appear twice: deliberate weighting, not a typo */
export const AL_VOWELS = ['a','e','i','o','u','a','e','i','o','u','ee','oo','or']
export const AL_CODAS_SHORT = ['b','d','g','m','n','p','t','ck','ll','ss','ff','ng','sh','th']
export const AL_CODAS_LONG  = ['b','d','g','m','n','p','t','l','f']

export const REAL_BLOCK = new Set<string>([
  ...GREEN.map(plainWord), ...RED.map(plainWord),
  // ...copy the full literal list from junos-words.html:469-488 verbatim...
])

/** Pronounceable non-word from taught graphemes. Port of alienWord (:491). */
export function alienWord(rng: Rng): string {
  for (let g = 0; g < 60; g++) {
    const v  = AL_VOWELS[ri(rng, AL_VOWELS.length)]!
    const on = AL_ONSETS[ri(rng, AL_ONSETS.length)]!
    const codas = v.length === 1 ? AL_CODAS_SHORT : AL_CODAS_LONG
    const co = codas[ri(rng, codas.length)]!
    if (on === co) continue
    const w = on + v + co
    if (w.length > 5) continue
    if (REAL_BLOCK.has(w)) continue
    return w
  }
  return 'vap'
}
```

**Critical:** the RNG is consumed in the order vowel → onset → coda. The original does the same (`:493-496`). Reordering these three lines changes every generated word and will fail the golden diff.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/alien.test.ts` — Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/alien.ts tests/core/alien.test.ts
git commit -m "feat: port alien word generator to core"
```

---

## Task 8: `core/names.ts` — decodable pet names

**Files:**
- Create: `src/core/names.ts`, `tests/core/names.test.ts`

**Interfaces:**
- Consumes: `AL_ONSETS`, `AL_VOWELS`, `AL_CODAS_SHORT`, `REAL_BLOCK`; `Rng`, `ri`; `markDigraphs`
- Produces: `petName(rng: Rng): string`

This is the one genuinely new module in M0. Brief §5 wants every pet to be "a Bimo, a Sheptun, a Corbell" — decodable two-syllable names from taught graphemes. `alienWord` gives single CVC syllables, so `petName` composes one or two syllables and capitalises. M1 uses the full grapheme pool; M3 constrains it to the child's taught set.

- [ ] **Step 1: Write the failing test**

`tests/core/names.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { petName } from '../../src/core/names'
import { mulberry32 } from '../../src/core/rng'
import { REAL_BLOCK } from '../../src/core/alien'
import { markDigraphs } from '../../src/core/segmentation'

describe('petName', () => {
  it('is capitalised', () => {
    const rng = mulberry32(1)
    for (let i = 0; i < 500; i++) {
      const n = petName(rng)
      expect(n[0]).toBe(n[0]!.toUpperCase())
      expect(n.slice(1)).toBe(n.slice(1).toLowerCase())
    }
  })

  it('is never a real word', () => {
    const rng = mulberry32(2)
    for (let i = 0; i < 2000; i++) {
      expect(REAL_BLOCK.has(petName(rng).toLowerCase())).toBe(false)
    }
  })

  it('is decodable — segments cleanly into taught graphemes', () => {
    const rng = mulberry32(3)
    for (let i = 0; i < 2000; i++) {
      const n = petName(rng).toLowerCase()
      expect(markDigraphs(n).map(s => s.txt).join('')).toBe(n)
    }
  })

  it('stays a sayable length', () => {
    const rng = mulberry32(4)
    for (let i = 0; i < 2000; i++) {
      const n = petName(rng)
      expect(n.length).toBeGreaterThanOrEqual(3)
      expect(n.length).toBeLessThanOrEqual(9)
    }
  })

  it('is deterministic for a given seed', () => {
    const a = mulberry32(7), b = mulberry32(7)
    for (let i = 0; i < 50; i++) expect(petName(a)).toBe(petName(b))
  })

  it('has a large name space — 900+ distinct in 2000 draws', () => {
    const rng = mulberry32(8)
    const seen = new Set<string>()
    for (let i = 0; i < 2000; i++) seen.add(petName(rng))
    expect(seen.size).toBeGreaterThan(900)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/names.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/names.ts`**

```ts
import { AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, REAL_BLOCK } from './alien'
import { ri } from './rng'
import type { Rng } from './rng'

/** One open syllable: onset + vowel, e.g. "bi", "shep". */
function openSyllable(rng: Rng): string {
  return AL_ONSETS[ri(rng, AL_ONSETS.length)]! + AL_VOWELS[ri(rng, AL_VOWELS.length)]!
}

/** One closed syllable: onset + vowel + coda, e.g. "tun", "bell". */
function closedSyllable(rng: Rng): string {
  return openSyllable(rng) + AL_CODAS_SHORT[ri(rng, AL_CODAS_SHORT.length)]!
}

/**
 * A decodable pet name (brief §5): Bimo, Sheptun, Corbell. Two syllables,
 * built only from taught graphemes so the child can read it aloud.
 */
export function petName(rng: Rng): string {
  for (let g = 0; g < 60; g++) {
    const closedFirst = ri(rng, 2) === 0
    const w = closedFirst
      ? closedSyllable(rng) + openSyllable(rng)
      : openSyllable(rng) + closedSyllable(rng)
    if (w.length < 3 || w.length > 9) continue
    if (REAL_BLOCK.has(w)) continue
    return w[0]!.toUpperCase() + w.slice(1)
  }
  return 'Bimo'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/names.test.ts` — Expected: PASS (6 tests)

If the decodability test fails, a vowel pool entry is producing a sequence `markDigraphs` splits differently than expected — investigate the specific failing name before changing the assertion.

- [ ] **Step 5: Commit**

```bash
git add src/core/names.ts tests/core/names.test.ts
git commit -m "feat: add decodable pet name generator"
```

---

## Task 9: `core/decks.ts`

**Files:**
- Create: `src/core/decks.ts`, `tests/core/decks.test.ts`

**Interfaces:**
- Consumes: `Rng`, `shuffle`
- Produces: `makeDeck<T>(rng: Rng, src: readonly T[]): () => T`

- [ ] **Step 1: Write the failing test**

`tests/core/decks.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { makeDeck } from '../../src/core/decks'
import { mulberry32 } from '../../src/core/rng'

describe('makeDeck', () => {
  it('deals every item once before repeating any', () => {
    const src = ['a', 'b', 'c', 'd', 'e']
    const draw = makeDeck(mulberry32(1), src)
    const first = [draw(), draw(), draw(), draw(), draw()]
    expect([...first].sort()).toEqual([...src].sort())
  })

  it('reshuffles and deals a full second pass', () => {
    const src = [1, 2, 3, 4]
    const draw = makeDeck(mulberry32(2), src)
    const got = Array.from({ length: 8 }, draw)
    expect([...got.slice(0, 4)].sort()).toEqual([1, 2, 3, 4])
    expect([...got.slice(4, 8)].sort()).toEqual([1, 2, 3, 4])
  })

  it('does not mutate the source array', () => {
    const src = ['x', 'y', 'z']
    const draw = makeDeck(mulberry32(3), src)
    draw(); draw(); draw(); draw()
    expect(src).toEqual(['x', 'y', 'z'])
  })

  it('is deterministic for a given seed', () => {
    const a = makeDeck(mulberry32(5), [1, 2, 3, 4, 5])
    const b = makeDeck(mulberry32(5), [1, 2, 3, 4, 5])
    expect(Array.from({ length: 12 }, a)).toEqual(Array.from({ length: 12 }, b))
  })

  it('handles a single-item source', () => {
    const draw = makeDeck(mulberry32(6), ['only'])
    expect([draw(), draw(), draw()]).toEqual(['only', 'only', 'only'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/decks.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/decks.ts`**

Port of `makeDeck` (`:714`). It copies the source (`[...src]`) then pops, so the source is never mutated and no item repeats until the deck is exhausted.

```ts
import { shuffle } from './rng'
import type { Rng } from './rng'

/**
 * No-repeat-until-exhausted dealer. Port of makeDeck (junos-words.html:714).
 * Reshuffles a fresh copy of the source when the deck runs dry.
 */
export function makeDeck<T>(rng: Rng, src: readonly T[]): () => T {
  let d: T[] = []
  return () => {
    if (!d.length) d = shuffle(rng, [...src])
    return d.pop()!
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/decks.test.ts` — Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/decks.ts tests/core/decks.test.ts
git commit -m "feat: port no-repeat deck dealing to core"
```

---

## Task 10: `core/generators/read.ts`

**Files:**
- Create: `src/core/generators/read.ts`, `tests/core/generators/read.test.ts`

**Interfaces:**
- Consumes: `MIN`, `MAX`; `groupOf`; `plainWord`; `NeighbourMap`, `PoolEntry`; `Rng`, `ri`, `shuffle`; `alienWord`
- Produces:
  - `ReadPick { w: MarkedWord; cls: WordClass }`
  - `ReadState { history: ReadPick[][]; idx: number }`
  - `ReadDeps { rng: Rng; drawGreen: () => PlainWord; drawRed: () => MarkedWord; neigh: NeighbourMap; level: number }`
  - `generateRead(s: ReadState, d: ReadDeps): void` — mutates `s`, matching the original

- [ ] **Step 1: Write the failing test**

`tests/core/generators/read.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateRead } from '../../../src/core/generators/read'
import type { ReadState } from '../../../src/core/generators/read'
import { makeDeck } from '../../../src/core/decks'
import { mulberry32 } from '../../../src/core/rng'
import { GREEN, RED, groupOf } from '../../../src/core/wordlists'
import { buildPool, buildNeighbours } from '../../../src/core/neighbours'
import { plainWord } from '../../../src/core/segmentation'

function harness(level = 1, seed = 1) {
  const rng = mulberry32(seed)
  return {
    state: { history: [], idx: -1 } as ReadState,
    deps: {
      rng,
      drawGreen: makeDeck(rng, GREEN),
      drawRed: makeDeck(rng, RED),
      neigh: buildNeighbours(buildPool()),
      level,
    },
  }
}

describe('generateRead — level 1', () => {
  it('starts at MIN words and grows by one per round, capped at MAX', () => {
    const { state, deps } = harness()
    for (let i = 0; i < 20; i++) generateRead(state, deps)
    expect(state.history[0]).toHaveLength(3)
    expect(state.history[1]).toHaveLength(4)
    expect(state.history[9]).toHaveLength(12)
    expect(state.history[19]).toHaveLength(12)
  })

  it('sets idx to the newest round', () => {
    const { state, deps } = harness()
    generateRead(state, deps)
    generateRead(state, deps)
    expect(state.idx).toBe(1)
    expect(state.idx).toBe(state.history.length - 1)
  })

  it('never repeats a plain word within a round', () => {
    const { state, deps } = harness(1, 42)
    for (let i = 0; i < 60; i++) generateRead(state, deps)
    for (const round of state.history) {
      const plains = round.map(p => plainWord(p.w))
      expect(new Set(plains).size).toBe(plains.length)
    }
  })

  it('never shows two words from the same confusable group in one round', () => {
    const { state, deps } = harness(1, 7)
    for (let i = 0; i < 60; i++) generateRead(state, deps)
    for (const round of state.history) {
      const groups = round
        .map(p => groupOf[plainWord(p.w)])
        .filter((g): g is number => g !== undefined)
      expect(new Set(groups).size).toBe(groups.length)
    }
  })

  it('mixes both word classes once rounds are large', () => {
    // NOT an exact count: neighbour substitution replaces a victim with
    // {w: nb.raw, cls: nb.cls} (v0:828), which can change the red/green split
    // after the initial 35% draw. Assert the guarantee, not the starting ratio.
    const { state, deps } = harness(1, 11)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    const big = state.history[29]!
    expect(big.filter(p => p.cls === 'red').length).toBeGreaterThan(0)
    expect(big.filter(p => p.cls === 'green').length).toBeGreaterThan(0)
  })

  it('plants at least one near-twin pair in a large round', () => {
    const { state, deps } = harness(1, 3)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    const neigh = buildNeighbours(buildPool())
    const round = state.history[29]!.map(p => plainWord(p.w))
    const hasTwin = round.some(a =>
      round.some(b => a !== b && (neigh[a] ?? []).some(e => plainWord(e.raw) === b))
    )
    expect(hasTwin).toBe(true)
  })

  it('only emits words that exist in the curriculum', () => {
    const { state, deps } = harness(1, 13)
    const known = new Set([...GREEN, ...RED.map(plainWord)])
    for (let i = 0; i < 40; i++) generateRead(state, deps)
    for (const round of state.history) {
      for (const p of round) expect(known.has(plainWord(p.w))).toBe(true)
    }
  })
})

describe('generateRead — level 2 (alien words)', () => {
  it('caps rounds at 8 words', () => {
    const { state, deps } = harness(2)
    for (let i = 0; i < 20; i++) generateRead(state, deps)
    expect(state.history[0]).toHaveLength(3)
    expect(state.history[19]).toHaveLength(8)
  })

  it('marks every alien word green and never repeats within a round', () => {
    const { state, deps } = harness(2, 5)
    for (let i = 0; i < 30; i++) generateRead(state, deps)
    for (const round of state.history) {
      expect(round.every(p => p.cls === 'green')).toBe(true)
      expect(new Set(round.map(p => p.w)).size).toBe(round.length)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/generators/read.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/generators/read.ts`**

Ported from `v0/junos-words.html:773-837`. Every RNG consumption stays in its original position: `take` draws, then the neighbour loop shuffles indices, then picks a candidate, then the final `shuffle(picks)`.

```ts
import { MIN, MAX } from '../constants'
import { groupOf } from '../wordlists'
import type { MarkedWord, PlainWord, WordClass } from '../wordlists'
import { plainWord } from '../segmentation'
import type { NeighbourMap } from '../neighbours'
import { ri, shuffle } from '../rng'
import type { Rng } from '../rng'
import { alienWord } from '../alien'

export interface ReadPick { w: MarkedWord; cls: WordClass }
export interface ReadState { history: ReadPick[][]; idx: number }
export interface ReadDeps {
  rng: Rng
  drawGreen: () => PlainWord
  drawRed: () => MarkedWord
  neigh: NeighbourMap
  level: number
}

/** Port of generateRead (junos-words.html:773). Mutates state, as the original does. */
export function generateRead(s: ReadState, d: ReadDeps): void {
  if (d.level === 2) {
    /* alien words: pure decoding — no shape memory, no first-letter shortcuts */
    const n = Math.min(8, MIN + s.history.length)
    const used = new Set<string>()
    const picks: ReadPick[] = []
    while (picks.length < n) {
      const w = alienWord(d.rng)
      if (used.has(w)) continue
      used.add(w)
      picks.push({ w, cls: 'green' })
    }
    s.history.push(picks)
    s.idx = s.history.length - 1
    return
  }

  const n = Math.min(MAX, MIN + s.history.length)
  const reds = n < 4 ? 1 : Math.round(n * 0.35)
  const used = new Set<string>()
  const usedGroups = new Set<number>()
  const picks: ReadPick[] = []

  const clash = (w: MarkedWord): boolean => {
    const pw = plainWord(w)
    return used.has(pw) || (groupOf[pw] !== undefined && usedGroups.has(groupOf[pw]!))
  }
  const take = (draw: () => MarkedWord, cls: WordClass): void => {
    let w = draw()
    let guard = 0
    while (clash(w) && guard++ < 40) w = draw()
    const pw = plainWord(w)
    used.add(pw)
    if (groupOf[pw] !== undefined) usedGroups.add(groupOf[pw]!)
    picks.push({ w, cls })
  }
  for (let i = 0; i < reds; i++)     take(d.drawRed, 'red')
  for (let i = 0; i < n - reds; i++) take(d.drawGreen, 'green')

  /* neighbour distractors: plant a near-twin (sat/sit) so first-letter guessing loses */
  const pairTarget = Math.min(2, Math.max(1, Math.floor(n / 4)))
  const locked = new Set<number>()
  let made = 0
  for (const i of shuffle(d.rng, picks.map((_, j) => j))) {
    if (made >= pairTarget) break
    const pw = plainWord(picks[i]!.w)
    const cands = (d.neigh[pw] ?? []).filter(c => {
      const cp = plainWord(c.raw)
      return !used.has(cp) &&
        !(groupOf[cp] !== undefined && usedGroups.has(groupOf[cp]!))
    })
    if (!cands.length) continue
    const victim = picks.findIndex((_p, j) => j !== i && !locked.has(j))
    if (victim < 0) break
    const vp = plainWord(picks[victim]!.w)
    used.delete(vp)
    if (groupOf[vp] !== undefined) usedGroups.delete(groupOf[vp]!)
    const nb = cands[ri(d.rng, cands.length)]!
    picks[victim] = { w: nb.raw, cls: nb.cls }
    used.add(plainWord(nb.raw))
    if (groupOf[plainWord(nb.raw)] !== undefined) usedGroups.add(groupOf[plainWord(nb.raw)]!)
    locked.add(i); locked.add(victim); made++
  }

  shuffle(d.rng, picks)
  s.history.push(picks)
  s.idx = s.history.length - 1
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/generators/read.test.ts` — Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/generators/read.ts tests/core/generators/read.test.ts
git commit -m "feat: port reading set generator to core"
```

---

## Task 11: `core/generators/sums.ts`

**Files:**
- Create: `src/core/generators/sums.ts`, `tests/core/generators/sums.test.ts`

**Interfaces:**
- Consumes: `Rng`, `ri`
- Produces: `SumItem { a: number; b: number; op: 'add' | 'sub' }`, `SumState { history: SumItem[]; idx: number }`, `generateAdd(s: SumState, rng: Rng, level: number): void`, `generateSub(s: SumState, rng: Rng, level: number): void`

- [ ] **Step 1: Write the failing test**

`tests/core/generators/sums.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateAdd, generateSub } from '../../../src/core/generators/sums'
import type { SumState } from '../../../src/core/generators/sums'
import { mulberry32 } from '../../../src/core/rng'

const fresh = (): SumState => ({ history: [], idx: -1 })

describe('generateAdd', () => {
  it('level 1 stays within 10', () => {
    const s = fresh(), rng = mulberry32(1)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 1)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.a + p.b).toBeLessThanOrEqual(10)
      expect(p.op).toBe('add')
    }
  })

  it('level 2 bridges 10 — every sum exceeds 10 but stays within 20', () => {
    const s = fresh(), rng = mulberry32(2)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 2)
    for (const p of s.history) {
      expect(p.a + p.b).toBeGreaterThan(10)
      expect(p.a + p.b).toBeLessThanOrEqual(20)
    }
  })

  it('rarely repeats the immediately previous sum', () => {
    // The retry guard gives up after 6 collisions (v0:986), so a repeat is
    // permitted, just very unlikely. Assert the guard works, not perfection.
    const s = fresh(), rng = mulberry32(3)
    for (let i = 0; i < 500; i++) generateAdd(s, rng, 1)
    let repeats = 0
    for (let i = 1; i < s.history.length; i++) {
      if (s.history[i]!.a === s.history[i - 1]!.a && s.history[i]!.b === s.history[i - 1]!.b) repeats++
    }
    expect(repeats).toBeLessThan(5)
  })

  it('sets idx to the newest item', () => {
    const s = fresh(), rng = mulberry32(4)
    generateAdd(s, rng, 1)
    generateAdd(s, rng, 1)
    expect(s.idx).toBe(1)
  })
})

describe('generateSub', () => {
  it('level 1 never goes negative and stays within 10', () => {
    const s = fresh(), rng = mulberry32(5)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 1)
    for (const p of s.history) {
      expect(p.a).toBeLessThanOrEqual(9)
      expect(p.b).toBeLessThanOrEqual(p.a)
      expect(p.a - p.b).toBeGreaterThanOrEqual(0)
      expect(p.op).toBe('sub')
    }
  })

  it('level 2 subtracts a single digit from the teens', () => {
    const s = fresh(), rng = mulberry32(6)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 2)
    for (const p of s.history) {
      expect(p.a).toBeGreaterThanOrEqual(11)
      expect(p.a).toBeLessThanOrEqual(20)
      expect(p.b).toBeGreaterThanOrEqual(1)
      expect(p.b).toBeLessThanOrEqual(9)
    }
  })

  it('level 3 works to 20 and never goes negative', () => {
    const s = fresh(), rng = mulberry32(7)
    for (let i = 0; i < 500; i++) generateSub(s, rng, 3)
    for (const p of s.history) {
      expect(p.a).toBeLessThanOrEqual(20)
      expect(p.a - p.b).toBeGreaterThanOrEqual(0)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/generators/sums.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/generators/sums.ts`**

Ported verbatim from `v0/junos-words.html:974-1008`. The `do…while` retry with `g++ < 5` is the anti-repeat guard; keep the guard limit exactly.

```ts
import { ri } from '../rng'
import type { Rng } from '../rng'

export interface SumItem { a: number; b: number; op: 'add' | 'sub' }
export interface SumState { history: SumItem[]; idx: number }

/** Port of generateAdd (junos-words.html:974). */
export function generateAdd(s: SumState, rng: Rng, level: number): void {
  const last = s.history[s.history.length - 1]
  let a: number, b: number, g = 0
  do {
    if (level === 1) {
      a = 1 + ri(rng, 9)
      b = 1 + ri(rng, 10 - a)
    } else {
      a = 1 + ri(rng, 10)
      const bmin = Math.max(1, 11 - a)
      b = bmin + ri(rng, 10 - bmin + 1)
    }
  } while (last && last.a === a && last.b === b && g++ < 5)
  s.history.push({ a, b, op: 'add' })
  s.idx = s.history.length - 1
}

/** Port of generateSub (junos-words.html:991). */
export function generateSub(s: SumState, rng: Rng, level: number): void {
  const last = s.history[s.history.length - 1]
  let a: number, b: number, g = 0
  do {
    if (level === 1) {
      a = 1 + ri(rng, 9)
      b = 1 + ri(rng, a)
    } else if (level === 2) {
      a = 11 + ri(rng, 10)
      b = 1 + ri(rng, 9)
    } else {
      a = 1 + ri(rng, 20)
      b = 1 + ri(rng, a)
    }
  } while (last && last.a === a && last.b === b && g++ < 5)
  s.history.push({ a, b, op: 'sub' })
  s.idx = s.history.length - 1
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/generators/sums.test.ts` — Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/generators/sums.ts tests/core/generators/sums.test.ts
git commit -m "feat: port addition and subtraction generators to core"
```

---

## Task 12: `core/generators/build.ts`

**Files:**
- Create: `src/core/generators/build.ts`, `tests/core/generators/build.test.ts`

**Interfaces:**
- Consumes: `plainWord`, `markDigraphs`; `alienWord`; `Rng`, `ri`, `shuffle`
- Produces: `BuildItem { w: PlainWord; segs: string[]; tray: string[] }`, `BuildState { history: BuildItem[]; idx: number }`, `BuildDeps { rng: Rng; drawGreen: () => MarkedWord; level: number }`, `generateBuild(s: BuildState, d: BuildDeps): void`

- [ ] **Step 1: Write the failing test**

`tests/core/generators/build.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateBuild } from '../../../src/core/generators/build'
import type { BuildState } from '../../../src/core/generators/build'
import { makeDeck } from '../../../src/core/decks'
import { mulberry32 } from '../../../src/core/rng'
import { GREEN } from '../../../src/core/wordlists'
import { markDigraphs } from '../../../src/core/segmentation'

function harness(level = 1, seed = 1) {
  const rng = mulberry32(seed)
  return {
    state: { history: [], idx: -1 } as BuildState,
    deps: { rng, drawGreen: makeDeck(rng, GREEN), level },
  }
}

describe('generateBuild', () => {
  it('segments the word into graphemes that rejoin to the word', () => {
    const { state, deps } = harness()
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      expect(item.segs.join('')).toBe(item.w)
    }
  })

  it('splits plain runs into single letters but keeps digraphs whole', () => {
    const { state, deps } = harness(1, 5)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const expected = markDigraphs(item.w).flatMap(d => d.k === 'di' ? [d.txt] : d.txt.split(''))
      expect(item.segs).toEqual(expected)
    }
  })

  it('adds exactly three decoys to the tray', () => {
    const { state, deps } = harness(1, 9)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      expect(item.tray).toHaveLength(item.segs.length + 3)
    }
  })

  it('tray contains every needed segment', () => {
    const { state, deps } = harness(1, 11)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const tray = [...item.tray]
      for (const seg of item.segs) {
        const at = tray.indexOf(seg)
        expect(at).toBeGreaterThanOrEqual(0)
        tray.splice(at, 1)
      }
    }
  })

  it('decoys are never segments the word needs', () => {
    const { state, deps } = harness(1, 13)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) {
      const need = new Map<string, number>()
      for (const s of item.segs) need.set(s, (need.get(s) ?? 0) + 1)
      const extra = [...item.tray]
      for (const s of item.segs) extra.splice(extra.indexOf(s), 1)
      expect(new Set(extra).size).toBe(extra.length)
      for (const d of extra) expect(item.segs).not.toContain(d)
    }
  })

  it('level 2 builds alien words', () => {
    const { state, deps } = harness(2, 17)
    const known = new Set(GREEN)
    for (let i = 0; i < 200; i++) generateBuild(state, deps)
    for (const item of state.history) expect(known.has(item.w)).toBe(false)
  })

  it('sets idx to the newest item', () => {
    const { state, deps } = harness()
    generateBuild(state, deps)
    generateBuild(state, deps)
    expect(state.idx).toBe(1)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/generators/build.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/generators/build.ts`**

Ported verbatim from `v0/junos-words.html:1161-1179`. `DECOYS` is copied exactly; note it deliberately omits `k`, `x`, `y`, `q`.

```ts
import type { MarkedWord, PlainWord } from '../wordlists'
import { plainWord, markDigraphs } from '../segmentation'
import { alienWord } from '../alien'
import { ri, shuffle } from '../rng'
import type { Rng } from '../rng'

export interface BuildItem { w: PlainWord; segs: string[]; tray: string[] }
export interface BuildState { history: BuildItem[]; idx: number }
export interface BuildDeps { rng: Rng; drawGreen: () => MarkedWord; level: number }

const DECOYS = ['b','c','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z',
                'a','e','i','o','u','ch','sh','th','ee','oo','or','ck','ll','ng']

/** Port of generateBuild (junos-words.html:1161). */
export function generateBuild(s: BuildState, d: BuildDeps): void {
  let w = ''
  let g = 0
  do {
    w = d.level === 2 ? alienWord(d.rng) : plainWord(d.drawGreen())
  } while (w.length < 2 && g++ < 20)

  const segs = markDigraphs(w).flatMap(x => x.k === 'di' ? [x.txt] : x.txt.split(''))
  const segSet = new Set(segs)
  const decoys: string[] = []
  let dg = 0
  while (decoys.length < 3 && dg++ < 60) {
    const c = DECOYS[ri(d.rng, DECOYS.length)]!
    if (!segSet.has(c) && !decoys.includes(c)) decoys.push(c)
  }
  s.history.push({ w, segs, tray: shuffle(d.rng, [...segs, ...decoys]) })
  s.idx = s.history.length - 1
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/generators/build.test.ts` — Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/generators/build.ts tests/core/generators/build.test.ts
git commit -m "feat: port word building generator to core"
```

---

## Task 13: `core/themes.ts`

**Files:**
- Create: `src/core/themes.ts`, `tests/core/themes.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `ThemeName`, `Theme { btn: string; score: string; burst: string[]; lo: number; hi: number }`, `THEMES: Record<ThemeName, Theme>`

- [ ] **Step 1: Write the failing test**

`tests/core/themes.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { THEMES } from '../../src/core/themes'

describe('THEMES', () => {
  it('has the seven established themes', () => {
    expect(Object.keys(THEMES).sort()).toEqual(
      ['christmas','garden','halloween','ocean','space','summer','unicorn']
    )
  })

  it('every theme has three burst colours as hex values', () => {
    for (const t of Object.values(THEMES)) {
      expect(t.burst).toHaveLength(3)
      for (const c of t.burst) expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('every theme has a sensible audio range', () => {
    for (const t of Object.values(THEMES)) {
      expect(t.lo).toBeGreaterThan(0)
      expect(t.hi).toBeGreaterThan(t.lo)
    }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/core/themes.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/core/themes.ts`**

Copy verbatim from `v0/junos-words.html:507-515`.

```ts
export type ThemeName =
  'ocean' | 'space' | 'unicorn' | 'garden' | 'halloween' | 'christmas' | 'summer'

export interface Theme {
  btn: string
  score: string
  burst: string[]
  lo: number
  hi: number
}

export const THEMES: Record<ThemeName, Theme> = {
  ocean:     {btn:'btnOcean',  score:'🐚', burst:['#aef4ff','#ffffff','#7fd8ff'], lo:320, hi:880},
  space:     {btn:'btnSpace',  score:'⭐', burst:['#fff6a8','#ffffff','#c9a9ff'], lo:520, hi:1240},
  unicorn:   {btn:'btnUni',    score:'💖', burst:['#ffc2e0','#ffffff','#ffe08a'], lo:620, hi:1480},
  garden:    {btn:'btnGarden', score:'🌻', burst:['#d9f57e','#ffffff','#ffd166'], lo:420, hi:1000},
  halloween: {btn:'btnHall',   score:'🎃', burst:['#ffa94d','#ffffff','#b98cff'], lo:260, hi:700},
  christmas: {btn:'btnXmas',   score:'🎁', burst:['#ff6b6b','#ffffff','#7bd88f'], lo:660, hi:1560},
  summer:    {btn:'btnSummer', score:'🍦', burst:['#ffe08a','#ffffff','#6ad4f0'], lo:480, hi:1100}
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/core/themes.test.ts` — Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/core/themes.ts tests/core/themes.test.ts
git commit -m "feat: port theme palettes to core"
```

---

## Task 14: Golden-output verification

**Files:**
- Create: `tools/golden/verify.mjs`, `tests/golden.test.ts`

**Interfaces:**
- Consumes: every `core/` generator, `tools/golden/golden.json`
- Produces: a test that fails if `core/` diverges from the original

This is the gate the whole phase exists for. It reproduces the golden run using `core/` and asserts equality.

**The RNG order must match exactly.** In the original, one global `Math.random` served `ri`, `shuffle`, and both decks. So the reproduction must share **one** `Rng` instance across the decks and generators, created with the same seed, and must run the four modes in the same order the capture did (read × 500, add × 500, sub × 500, build × 500).

- [ ] **Step 1: Write the verification test**

`tests/golden.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import golden from '../tools/golden/golden.json'
import { mulberry32 } from '../src/core/rng'
import { makeDeck } from '../src/core/decks'
import { GREEN, RED } from '../src/core/wordlists'
import { buildPool, buildNeighbours } from '../src/core/neighbours'
import { generateRead } from '../src/core/generators/read'
import { generateAdd, generateSub } from '../src/core/generators/sums'
import { generateBuild } from '../src/core/generators/build'
import type { ReadState } from '../src/core/generators/read'
import type { SumState } from '../src/core/generators/sums'
import type { BuildState } from '../src/core/generators/build'

describe('golden output — core matches the frozen original', () => {
  // One shared Rng, exactly as the original had one global Math.random.
  const rng = mulberry32(golden.seed)
  const drawGreen = makeDeck(rng, GREEN)
  const drawRed = makeDeck(rng, RED)
  const neigh = buildNeighbours(buildPool())

  const readState: ReadState = { history: [], idx: -1 }
  const addState: SumState = { history: [], idx: -1 }
  const subState: SumState = { history: [], idx: -1 }
  const buildState: BuildState = { history: [], idx: -1 }

  // Order must match tools/golden/capture.mjs EXACTLY, including the level
  // changes. One shared Rng stands in for the original's single global
  // Math.random, and drawGreen is deliberately shared between read and build
  // because the original has one module-level deck serving both (v0:807, 1165).
  const take = (n: number, fn: () => void) => { for (let i = 0; i < n; i++) fn() }

  take(500, () => generateRead(readState, { rng, drawGreen, drawRed, neigh, level: 1 }))
  take(500, () => generateAdd(addState, rng, 1))
  take(500, () => generateSub(subState, rng, 1))
  take(500, () => generateBuild(buildState, { rng, drawGreen, level: 1 }))

  const readL2 = readState.history.length
  const addL2 = addState.history.length
  const subL2 = subState.history.length
  const buildL2 = buildState.history.length

  take(500, () => generateRead(readState, { rng, drawGreen, drawRed, neigh, level: 2 }))
  take(500, () => generateAdd(addState, rng, 2))
  take(500, () => generateSub(subState, rng, 2))
  take(500, () => generateBuild(buildState, { rng, drawGreen, level: 2 }))

  const subL3 = subState.history.length
  take(500, () => generateSub(subState, rng, 3))

  it('reproduces the level 1 reading rounds', () => {
    expect(readState.history.slice(0, readL2)).toEqual(golden.read)
  })

  it('reproduces the level 2 alien reading rounds', () => {
    expect(readState.history.slice(readL2)).toEqual(golden.readL2)
  })

  it('reproduces the level 1 additions', () => {
    expect(addState.history.slice(0, addL2)).toEqual(golden.add)
  })

  it('reproduces the level 2 bridging additions', () => {
    expect(addState.history.slice(addL2)).toEqual(golden.addL2)
  })

  it('reproduces the level 1 subtractions', () => {
    expect(subState.history.slice(0, subL2)).toEqual(golden.sub)
  })

  it('reproduces the level 2 subtractions', () => {
    expect(subState.history.slice(subL2, subL3)).toEqual(golden.subL2)
  })

  it('reproduces the level 3 subtractions', () => {
    expect(subState.history.slice(subL3)).toEqual(golden.subL3)
  })

  it('reproduces the level 1 build items', () => {
    expect(buildState.history.slice(0, buildL2)).toEqual(golden.build)
  })

  it('reproduces the level 2 alien build items', () => {
    expect(buildState.history.slice(buildL2)).toEqual(golden.buildL2)
  })
})
```

- [ ] **Step 2: Enable JSON imports**

Add to `tsconfig.json` `compilerOptions`:

```json
    "resolveJsonModule": true,
```

- [ ] **Step 3: Run the golden test**

Run: `npx vitest run tests/golden.test.ts`
Expected: PASS (4 tests)

**If it fails**, diagnose before changing anything:
1. Compare the first differing index — `expect(readState.history[0]).toEqual(golden.read[0])` narrows it.
2. A difference in round *one* means a generator's RNG call order is wrong.
3. A difference only in later rounds means deck state diverged — check `makeDeck` copies rather than mutates.
4. Identical values in a different *order* means a `shuffle` call moved.

Fix `core/` to match the original. Never edit `golden.json` to match `core/`, and never edit `v0/junos-words.html`.

- [ ] **Step 4: Run the whole suite and typecheck**

Run: `npm test` — Expected: all tests pass
Run: `npm run typecheck` — Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add tests/golden.test.ts tsconfig.json
git commit -m "test: verify core reproduces the original generator output exactly"
```

**PHASE 2 GATE — Fable 5 review.** Review every `core/` module against its original lines in `v0/junos-words.html` for behavioural drift. This is the most important review in the plan.

---

## Task 15: `platform/speech.ts`

**Files:**
- Create: `src/platform/speech.ts`, `tests/platform/speech.test.ts`

**Interfaces:**
- Consumes: nothing from `core/`
- Produces: `Speaker { speak(txt: string, rate?: number, onend?: () => void): boolean; ready(): boolean }`, `createSpeaker(opts?: { onVoicePicked?: (name: string) => void }): Speaker`

The original keeps `voice` and `voiceToastShown` as module globals (`:722`). Here they become closure state inside `createSpeaker` so tests can make independent instances.

**One behavioural subtlety that must be preserved.** `voiceToastShown` is a *single shared* flag in the original, set both by the "Voice: X" announcement (v0:760) and by the "No UK English voice on this device" fallback in `speakTarget` (v0:905-907) — whichever fires first suppresses the other, so the child never sees two voice toasts. Splitting it would lose that mutual exclusion. `createSpeaker` therefore exposes the flag rather than hiding it:

- `noticeShown(): boolean` — has any voice notice been shown?
- `markNoticeShown(): void` — called by the word-find no-voice path before it toasts

`wordFind` must call these instead of keeping its own flag.

- [ ] **Step 1: Write the failing test**

`tests/platform/speech.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSpeaker, rankVoices } from '../../src/platform/speech'

const V = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice

describe('rankVoices', () => {
  it('keeps only en-GB voices', () => {
    const out = rankVoices([V('Sonia', 'en-GB'), V('Alex', 'en-US'), V('Kate', 'en_GB')])
    expect(out.map(v => v.name)).toEqual(['Sonia', 'Kate'])
  })

  it('ranks preferred UK voices ahead of unknown ones', () => {
    const out = rankVoices([V('Random', 'en-GB'), V('Sonia', 'en-GB')])
    expect(out[0]!.name).toBe('Sonia')
  })

  it('orders by the priority list — Maisie before Sonia before Ryan', () => {
    const out = rankVoices([V('Ryan', 'en-GB'), V('Sonia', 'en-GB'), V('Maisie', 'en-GB')])
    expect(out.map(v => v.name)).toEqual(['Maisie', 'Sonia', 'Ryan'])
  })

  it('returns empty when no UK voice exists', () => {
    expect(rankVoices([V('Alex', 'en-US')])).toEqual([])
  })
})

describe('createSpeaker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    ;(globalThis as any).SpeechSynthesisUtterance = class {
      text: string; voice: unknown; lang = ''; rate = 1; pitch = 1; volume = 1
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(t: string) { this.text = t }
    }
    ;(window as any).speechSynthesis = {
      getVoices: () => [V('Sonia', 'en-GB')],
      speak: vi.fn(),
      cancel: vi.fn(),
      onvoiceschanged: null,
    }
  })

  it('reports not ready when the API is absent', () => {
    delete (window as any).speechSynthesis
    expect(createSpeaker().ready()).toBe(false)
  })

  it('returns false from speak when there is no voice', () => {
    ;(window as any).speechSynthesis.getVoices = () => []
    expect(createSpeaker().speak('hello')).toBe(false)
  })

  it('speaks and reports success', () => {
    const s = createSpeaker()
    expect(s.speak('jump')).toBe(true)
    expect((window as any).speechSynthesis.speak).toHaveBeenCalled()
  })

  it('fires onend once even if the engine never fires it', () => {
    const onend = vi.fn()
    createSpeaker().speak('jump', 0.9, onend)
    vi.advanceTimersByTime(2500)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('does not double-fire onend when the engine also fires', () => {
    const onend = vi.fn()
    let utter: any
    ;(window as any).speechSynthesis.speak = (u: any) => { utter = u }
    createSpeaker().speak('jump', 0.9, onend)
    utter.onend()
    vi.advanceTimersByTime(5000)
    expect(onend).toHaveBeenCalledTimes(1)
  })

  it('announces the picked voice only once', () => {
    const onVoicePicked = vi.fn()
    const s = createSpeaker({ onVoicePicked })
    s.speak('one'); s.speak('two'); s.speak('three')
    expect(onVoicePicked).toHaveBeenCalledTimes(1)
    expect(onVoicePicked).toHaveBeenCalledWith('Sonia')
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/platform/speech.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/platform/speech.ts`**

Ported from `v0/junos-words.html:722-763`. The 2500ms fallback and the `done` latch are load-bearing: some engines never fire `onend`, and Fred's sounding-out chain stalls forever without it.

```ts
/* Quality-ranked UK voices: Edge natural voices, then Apple, then Google. */
const PRI = ['maisie','sonia','libby','ryan','arthur','martha','serena','kate',
             'daniel','stephanie','google uk english female','google uk english male']

/** Filter to en-GB and sort by the priority list. Port of pickVoice (:724). */
export function rankVoices(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const gb = voices.filter(v => /^en[-_]GB/i.test(v.lang))
  return [...gb].sort((a, b) => {
    const ai = PRI.findIndex(p => a.name.toLowerCase().includes(p))
    const bi = PRI.findIndex(p => b.name.toLowerCase().includes(p))
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })
}

export interface Speaker {
  speak(txt: string, rate?: number, onend?: () => void): boolean
  ready(): boolean
}

export interface SpeakerOptions {
  /** Called once, the first time a voice is chosen. Drives the 2D game's toast. */
  onVoicePicked?: (name: string) => void
}

export function createSpeaker(opts: SpeakerOptions = {}): Speaker {
  let voice: SpeechSynthesisVoice | null = null
  let announced = false

  const has = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window

  const pick = (): void => {
    if (!has()) return
    const vs = window.speechSynthesis.getVoices()
    if (!vs.length) return
    voice = rankVoices(vs)[0] ?? null
  }

  if (has()) {
    pick()
    window.speechSynthesis.onvoiceschanged = pick
  }

  return {
    ready: () => has() && !!voice,

    speak(txt, rate, onend) {
      if (!has()) return false
      if (!voice) pick()
      if (!voice) return false
      try {
        window.speechSynthesis.cancel()
        const u = new SpeechSynthesisUtterance(txt)
        u.voice = voice
        u.lang = voice.lang
        /* `||` not `??` — matches v0:752, where rate 0 falls back to 0.85 */
        u.rate = rate || 0.85
        u.pitch = 1.05
        u.volume = 1
        if (onend) {
          let done = false
          const fin = (): void => { if (!done) { done = true; onend() } }
          u.onend = fin
          u.onerror = fin
          /* some engines never fire onend; keep the chain moving */
          setTimeout(fin, 2500)
        }
        window.speechSynthesis.speak(u)
        if (!announced) { announced = true; opts.onVoicePicked?.(voice.name) }
        return true
      } catch {
        return false
      }
    },
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/platform/speech.test.ts` — Expected: PASS (11 tests)

- [ ] **Step 5: Commit**

```bash
git add src/platform/speech.ts tests/platform/speech.test.ts
git commit -m "feat: port speech synthesis wrapper to platform"
```

---

## Task 16: `platform/storage.ts`

**Files:**
- Create: `src/platform/storage.ts`, `tests/platform/storage.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `DocKey = 'save' | 'profileMeta'`
  - `ProfileMeta { id: string; name: string; avatar: string }`
  - `StoredDoc<T> { schemaVersion: number; updatedAt: number; data: T }`
  - `SaveStore { get<T>(profileId, doc): Promise<T | null>; put<T>(profileId, doc, value): Promise<void>; list(): Promise<ProfileMeta[]>; addProfile(p): Promise<void>; removeProfile(id): Promise<void> }`
  - `createLocalStore(storage?: Storage, now?: () => number): SaveStore`

**Async by design** — see spec §6. localStorage is synchronous, but the interface returns Promises so a network-backed store can replace it without touching a single call site.

- [ ] **Step 1: Write the failing test**

`tests/platform/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createLocalStore, SCHEMA_VERSION } from '../../src/platform/storage'

class MemStorage implements Storage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  clear() { this.m.clear() }
  getItem(k: string) { return this.m.get(k) ?? null }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  removeItem(k: string) { this.m.delete(k) }
  setItem(k: string, v: string) { this.m.set(k, v) }
}

let mem: MemStorage
let now: number
const store = () => createLocalStore(mem, () => now)

beforeEach(() => { mem = new MemStorage(); now = 1_000 })

describe('createLocalStore', () => {
  it('returns null for a document that was never written', async () => {
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('round-trips a document', async () => {
    const s = store()
    await s.put('p1', 'save', { score: 12, owned: ['ocean:0'] })
    expect(await s.get('p1', 'save')).toEqual({ score: 12, owned: ['ocean:0'] })
  })

  it('keeps profiles isolated from each other', async () => {
    const s = store()
    await s.put('p1', 'save', { score: 1 })
    await s.put('p2', 'save', { score: 2 })
    expect(await s.get('p1', 'save')).toEqual({ score: 1 })
    expect(await s.get('p2', 'save')).toEqual({ score: 2 })
  })

  it('stamps schemaVersion and updatedAt on every write', async () => {
    now = 5_555
    await store().put('p1', 'save', { score: 3 })
    const raw = JSON.parse(mem.getItem('petIsland.v1.p1.save')!)
    expect(raw.schemaVersion).toBe(SCHEMA_VERSION)
    expect(raw.updatedAt).toBe(5_555)
    expect(raw.data).toEqual({ score: 3 })
  })

  it('refreshes updatedAt on rewrite', async () => {
    const s = store()
    await s.put('p1', 'save', { score: 1 })
    now = 9_000
    await s.put('p1', 'save', { score: 2 })
    expect(JSON.parse(mem.getItem('petIsland.v1.p1.save')!).updatedAt).toBe(9_000)
  })

  it('returns null rather than throwing on corrupt JSON', async () => {
    mem.setItem('petIsland.v1.p1.save', '{not json')
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('returns null for a document from a future schema version', async () => {
    mem.setItem('petIsland.v1.p1.save', JSON.stringify({
      schemaVersion: SCHEMA_VERSION + 99, updatedAt: 1, data: { score: 1 },
    }))
    expect(await store().get('p1', 'save')).toBeNull()
  })

  it('lists profiles in insertion order', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '🦄' })
    await s.addProfile({ id: 'p2', name: 'Sam', avatar: '🦊' })
    expect((await s.list()).map(p => p.name)).toEqual(['Juno', 'Sam'])
  })

  it('removing a profile also removes its documents', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '🦄' })
    await s.put('p1', 'save', { score: 7 })
    await s.removeProfile('p1')
    expect(await s.list()).toEqual([])
    expect(await s.get('p1', 'save')).toBeNull()
  })

  it('a sibling profile is untouched when another is deleted', async () => {
    const s = store()
    await s.addProfile({ id: 'p1', name: 'Juno', avatar: '🦄' })
    await s.addProfile({ id: 'p2', name: 'Sam', avatar: '🦊' })
    await s.put('p2', 'save', { score: 4 })
    await s.removeProfile('p1')
    expect(await s.get('p2', 'save')).toEqual({ score: 4 })
    expect((await s.list()).map(p => p.id)).toEqual(['p2'])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/platform/storage.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/platform/storage.ts`**

```ts
export const SCHEMA_VERSION = 1
const ROOT = 'petIsland.v1'
const PROFILES_KEY = `${ROOT}.profiles`

export type DocKey = 'save' | 'profileMeta'

export interface ProfileMeta { id: string; name: string; avatar: string }

export interface StoredDoc<T> {
  schemaVersion: number
  updatedAt: number
  data: T
}

/**
 * All persistence goes through this. Async on purpose: localStorage is
 * synchronous, but a network-backed store must be able to replace this
 * implementation without any call site changing. See spec section 6.
 */
export interface SaveStore {
  get<T>(profileId: string, doc: DocKey): Promise<T | null>
  put<T>(profileId: string, doc: DocKey, value: T): Promise<void>
  list(): Promise<ProfileMeta[]>
  addProfile(p: ProfileMeta): Promise<void>
  removeProfile(id: string): Promise<void>
}

const docKey = (profileId: string, doc: DocKey): string => `${ROOT}.${profileId}.${doc}`

export function createLocalStore(
  storage: Storage = globalThis.localStorage,
  now: () => number = Date.now,
): SaveStore {
  const readProfiles = (): ProfileMeta[] => {
    try {
      const raw = storage.getItem(PROFILES_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed as ProfileMeta[] : []
    } catch { return [] }
  }

  const writeProfiles = (list: ProfileMeta[]): void => {
    storage.setItem(PROFILES_KEY, JSON.stringify(list))
  }

  return {
    async get<T>(profileId: string, doc: DocKey): Promise<T | null> {
      try {
        const raw = storage.getItem(docKey(profileId, doc))
        if (!raw) return null
        const parsed = JSON.parse(raw) as StoredDoc<T>
        if (parsed.schemaVersion > SCHEMA_VERSION) return null
        return parsed.data
      } catch { return null }
    },

    async put<T>(profileId: string, doc: DocKey, value: T): Promise<void> {
      const wrapped: StoredDoc<T> = {
        schemaVersion: SCHEMA_VERSION,
        updatedAt: now(),
        data: value,
      }
      storage.setItem(docKey(profileId, doc), JSON.stringify(wrapped))
    },

    async list(): Promise<ProfileMeta[]> {
      return readProfiles()
    },

    async addProfile(p: ProfileMeta): Promise<void> {
      const list = readProfiles()
      if (!list.some(x => x.id === p.id)) list.push(p)
      writeProfiles(list)
    },

    async removeProfile(id: string): Promise<void> {
      writeProfiles(readProfiles().filter(p => p.id !== id))
      for (const doc of ['save', 'profileMeta'] as DocKey[]) {
        storage.removeItem(docKey(id, doc))
      }
    },
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/platform/storage.test.ts` — Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add src/platform/storage.ts tests/platform/storage.test.ts
git commit -m "feat: add async SaveStore with localStorage implementation"
```

---

## Task 17: `platform/audio.ts`

**Files:**
- Create: `src/platform/audio.ts`, `tests/platform/audio.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SoundKind = 'up' | 'down' | 'bump' | 'win'`, `Sfx { play(kind: SoundKind): void; enabled: boolean; setTheme(t: ThemeName): void }`, `createSfx(ctxFactory?: () => AudioContext | null): Sfx`

Read `v0/junos-words.html:2004-2027` (`note`, `popSound`) and port the oscillator envelopes exactly.

**The kind names are the original's and must not be renamed** — the renderers call `popSound('up')` (v0:922, 1271), `'bump'` (v0:930, 1137, 1294), `'down'` (v0:1145) and `'win'` (v0:960, 1092, 1116, 1278), and Task 18 ports those call sites verbatim. `'win'` is two chained notes (v0:2025), not one.

`popSound` also reads `THEMES[theme]` internally (v0:2021), so **callers pass no frequencies**. `Sfx` therefore holds the current theme and exposes `setTheme`; renderer call sites stay literally `deps.sfx.play('up')`.

- [ ] **Step 1: Write the failing test**

`tests/platform/audio.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { createSfx } from '../../src/platform/audio'

function fakeCtx() {
  const osc = { frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
                type: '', connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
  const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(),
                         linearRampToValueAtTime: vi.fn() }, connect: vi.fn() }
  return {
    ctx: { currentTime: 0, destination: {},
           createOscillator: () => osc, createGain: () => gain } as unknown as AudioContext,
    osc, gain,
  }
}

describe('createSfx', () => {
  it('is silent and does not throw when no AudioContext exists', () => {
    const sfx = createSfx(() => null)
    expect(() => sfx.play('up')).not.toThrow()
  })

  it('starts and stops an oscillator when playing', () => {
    const f = fakeCtx()
    createSfx(() => f.ctx).play('up')
    expect(f.osc.start).toHaveBeenCalled()
    expect(f.osc.stop).toHaveBeenCalled()
  })

  it('plays nothing when disabled', () => {
    const f = fakeCtx()
    const sfx = createSfx(() => f.ctx)
    sfx.enabled = false
    sfx.play('up')
    expect(f.osc.start).not.toHaveBeenCalled()
  })

  it('sweeps up for "up" and down for "down" — the inverse of each other', () => {
    const f1 = fakeCtx(), f2 = fakeCtx()
    createSfx(() => f1.ctx).play('up')
    createSfx(() => f2.ctx).play('down')
    const upFrom = f1.osc.frequency.setValueAtTime.mock.calls[0]?.[0]
    const upTo = f1.osc.frequency.linearRampToValueAtTime.mock.calls[0]?.[0]
    const downFrom = f2.osc.frequency.setValueAtTime.mock.calls[0]?.[0]
    expect(upTo).toBeGreaterThan(upFrom)
    expect(downFrom).toBe(upTo)
  })

  it('"bump" ignores the theme — it is always the same low thud', () => {
    const f1 = fakeCtx(), f2 = fakeCtx()
    const a = createSfx(() => f1.ctx); a.setTheme('ocean'); a.play('bump')
    const b = createSfx(() => f2.ctx); b.setTheme('christmas'); b.play('bump')
    expect(f1.osc.frequency.setValueAtTime.mock.calls[0]?.[0])
      .toBe(f2.osc.frequency.setValueAtTime.mock.calls[0]?.[0])
  })

  it('"win" plays two chained notes', () => {
    const f = fakeCtx()
    createSfx(() => f.ctx).play('win')
    expect(f.osc.start).toHaveBeenCalledTimes(2)
  })

  it('follows the theme for "up"', () => {
    const f1 = fakeCtx(), f2 = fakeCtx()
    const a = createSfx(() => f1.ctx); a.setTheme('ocean'); a.play('up')
    const b = createSfx(() => f2.ctx); b.setTheme('christmas'); b.play('up')
    expect(f1.osc.frequency.setValueAtTime.mock.calls[0]?.[0])
      .not.toBe(f2.osc.frequency.setValueAtTime.mock.calls[0]?.[0])
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/platform/audio.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/platform/audio.ts`**

Port `note` and `popSound` from `v0/junos-words.html:2004-2028`, keeping envelope shapes and durations exactly. Wrap in a factory so the AudioContext is injectable and lazily created (browsers refuse to start one before a user gesture).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/platform/audio.test.ts` — Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/platform/audio.ts tests/platform/audio.test.ts
git commit -m "feat: port sound effects to platform"
```

---

## Task 18: `challenges/` — the three renderers, moved verbatim

**Files:**
- Create: `src/challenges/mount.ts`, `src/challenges/deadzone.ts`, `src/challenges/wordFind.ts`, `src/challenges/build.ts`, `src/challenges/sum.ts`
- Test: `tests/challenges/deadzone.test.ts`, `tests/challenges/wordFind.test.ts`

**Interfaces:**
- Consumes: `core/` generators and types; `Speaker`; `Sfx`
- Produces:
  - `ChallengeDeps { el: HTMLElement; speak: Speaker['speak']; sfx: Sfx; onCorrect(): void; onWrong(): void; onAdvance(): void; burst(x: number, y: number): void; celebrate(): void }`
  - `mountWordFind(item: ReadPick[], deps: ChallengeDeps): () => void`
  - `mountBuild(item: BuildItem, deps: ChallengeDeps): () => void`
  - `mountSum(item: SumItem, deps: ChallengeDeps): () => void`
  - each returns a teardown function
  - `inDeadZone(x: number, y: number, els: readonly Element[]): boolean`
  - `FRED_SOUNDS: Record<string, string>`

**This is the highest-risk task in the plan. Read the constraint carefully.**

Copy `renderSet`, `wordTap`, `speakTarget` (`:840-971`), `renderBuild`, `fredTalk`, `FRED_SOUNDS` (`:1181-1310`), and `renderSum` (`:1010-1159`) with **only** these changes:

1. `$('words')` → `deps.el`
2. `speak(...)` → `deps.speak(...)`
3. `popSound(kind)` → `deps.sfx.play(kind)` — same four kind strings, no extra arguments
4. `celebrate()`, `burst(x, y)`, `reward()`, `toast(msg)` → the matching `deps` callback
5. `flyStar(el, charge)` → `deps.flyToScore(el)` — the host owns the star animation, because its `onfinish` is where `addScore` actually fires (v0:956) and that is the 2-point literacy economy, not renderer business
6. `$('targetCard')` manipulation → `deps.showTarget(html)` / `deps.hideTarget()`
7. `mode !== 'read'` style guards → `deps.isActive()`
8. `store[mode]` / `GEN[mode]()` / `renderCurrent()` inside `renderSum`'s `adv` → `deps.onAdvance()`
9. Renderer-owned mutable state (`round`, `inputLock`, `fredToken`) → closure variables inside the mount function
10. Add TypeScript types

**`rewardUntil` and `quietUntil` are NOT renderer state and must not become closure variables.** They are written by the *host* — `reward()` sets both (v0:1811-1812) and `befriend()` sets `quietUntil` (v0:1922) — and only *read* by the renderers: `speakTarget` waits on `quietUntil` (v0:893), `renderSum`'s `adv` waits on `rewardUntil` (v0:1120), `renderBuild`'s `nextB` likewise (v0:1281). Closing over them would mean nothing ever sets them, so auto-advance would stop waiting out the spectacle and TTS would talk over the celebration. They come through `deps.holds`.

**Do not** change any timing constant, any class name, any DOM structure, the wrong-answer counters (`round.wrongs`, `wrongsB`), the mash-rescue thresholds, the auto-advance sequencing, or the dead-zone padding. Those are the field-tested behaviour this entire plan exists to preserve. If a line looks redundant, leave it.

`round.wrongs` and `wrongsB` stay as separate inline counters in their own renderers. Do not unify them (spec §5).

**The one sanctioned deletion: the battery** (brief §4 "the battery is retired; do not port it"). It is the sole exception to the verbatim rule, and it sits *inside* these renderers, so the exact lines to drop are named here rather than left to judgement:

- v0:921 — the `flyStar(el, 1)` charge argument becomes `deps.flyToScore(el)`
- v0:956 — `if(charge) chargeBattery(charge)` in `flyStar`'s `onfinish` (moves to the host anyway under change 5)
- v0:1127-1128 — `if(!spendBattery()){ batteryEmptyNudge(); return; }`, leaving the `GEN[mode]()` call (now `deps.onAdvance()`) unconditional
- v0:1271-1277 — the build-mode charge call, same treatment

Nothing else may be dropped.

- [ ] **Step 1: Write the dead-zone test**

`tests/challenges/deadzone.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { inDeadZone } from '../../src/challenges/deadzone'

function rectEl(left: number, top: number, width: number, height: number): Element {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({
    left, top, width, height, right: left + width, bottom: top + height,
    x: left, y: top, toJSON: () => ({}),
  }) as DOMRect
  return el
}

describe('inDeadZone', () => {
  const els = [rectEl(100, 100, 50, 50)]

  it('is true inside an element', () => {
    expect(inDeadZone(120, 120, els)).toBe(true)
  })

  it('is true within the 16px padding around an element', () => {
    expect(inDeadZone(90, 120, els)).toBe(true)
    expect(inDeadZone(160, 120, els)).toBe(true)
  })

  it('is false well outside', () => {
    expect(inDeadZone(400, 400, els)).toBe(false)
  })

  it('is false just beyond the padding', () => {
    expect(inDeadZone(83, 120, els)).toBe(false)
  })

  it('is false when there are no elements', () => {
    expect(inDeadZone(120, 120, [])).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/challenges/deadzone.test.ts`
Expected: FAIL — cannot resolve module

- [ ] **Step 3: Implement `src/challenges/deadzone.ts`**

Ported from `v0/junos-words.html:2065-2075`. The 16px padding is deliberate: it stops a stray fingertip near a control from registering as a wrong answer.

Comparisons are **strict** (`>` / `<`), matching v0:2071 exactly. Using `>=`/`<=` would flip behaviour on boundary pixels.

The element list is injected rather than queried, but the selector is the original's and belongs with the 2D shell — `words2d/main.ts` passes the result of
`document.querySelectorAll('#hudLeft,#hudRight,#footer,#words .word,#words .tile,#words .slot,#words .chip,.visitor')` (v0:2067-2068). The island overlay will pass its own.

```ts
/** Port of inDeadZone (junos-words.html:2065). Padding is field-tuned; do not change. */
export function inDeadZone(x: number, y: number, els: readonly Element[]): boolean {
  const pad = 16
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (x > r.left - pad && x < r.right + pad &&
        y > r.top - pad && y < r.bottom + pad) return true
  }
  return false
}
```

- [ ] **Step 4: Run the dead-zone test**

Run: `npx vitest run tests/challenges/deadzone.test.ts` — Expected: PASS (5 tests)

- [ ] **Step 5: Write `src/challenges/mount.ts`**

```ts
import type { Sfx } from '../platform/audio'
import type { Speaker } from '../platform/speech'

/**
 * Timing gates owned by the HOST, read by the challenges.
 *
 * reward() sets both (v0:1811-1812); befriend() sets quietUntil (v0:1922).
 * Challenges only ever read them, to avoid auto-advancing over a spectacle
 * or speaking over the celebration. These cannot be renderer closure state:
 * nothing inside a renderer ever sets them.
 */
export interface Holds {
  /** Timestamp until which auto-advance must wait. */
  rewardUntil(): number
  /** Timestamp until which TTS must stay silent. */
  quietUntil(): number
}

/**
 * Everything a challenge needs from its host. The 2D shell and the island
 * overlay supply different implementations; the challenge itself is identical.
 */
export interface ChallengeDeps {
  el: HTMLElement
  speak: Speaker['speak']
  sfx: Sfx
  holds: Holds
  /** True while this challenge's mode is the active one (ports the `mode !==` guards). */
  isActive(): boolean
  /**
   * Fly a star from this element to the score. The host owns it because the
   * animation's onfinish is where scoring actually happens (v0:956) — literacy
   * pays 2, maths pays 1.
   */
  flyToScore(el: HTMLElement): void
  /** A wrong answer landed. Costs nothing but a wobble (brief section 18). */
  onWrong(): void
  /** The round is finished; the host advances to the next item. */
  onAdvance(): void
  /** Fallback when no voice is available: show the word instead of saying it. */
  showTarget(html: string): void
  hideTarget(): void
  toast(msg: string): void
  burst(x: number, y: number): void
  celebrate(): void
}

/** Every challenge returns a teardown that cancels timers and clears the element. */
export type Teardown = () => void
```

- [ ] **Step 6: Port `wordFind.ts`, then test it**

`tests/challenges/wordFind.test.ts`:

```ts
/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mountWordFind } from '../../src/challenges/wordFind'
import type { ChallengeDeps } from '../../src/challenges/mount'
import type { ReadPick } from '../../src/core/generators/read'

const ITEM: ReadPick[] = [
  { w: 'jump', cls: 'green' },
  { w: 'sat', cls: 'green' },
  { w: 's[ai]d', cls: 'red' },
]

function deps(el: HTMLElement): ChallengeDeps {
  return {
    el,
    speak: vi.fn(() => true),
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    holds: { rewardUntil: () => 0, quietUntil: () => 0 },
    isActive: () => true,
    flyToScore: vi.fn(),
    onWrong: vi.fn(),
    onAdvance: vi.fn(),
    showTarget: vi.fn(),
    hideTarget: vi.fn(),
    toast: vi.fn(),
    burst: vi.fn(),
    celebrate: vi.fn(),
  }
}

/** The renderer binds pointerdown (v0:882), not click. */
function tap(el: HTMLElement): void {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

/**
 * speakTarget is scheduled at 900 + picks.length * 60 (v0:886) — 1080ms for a
 * 3-word round. Anything less and the test would be pressuring the implementer
 * to change a field-tested constant.
 */
const SPEAK_DELAY = 900 + ITEM.length * 60

let el: HTMLElement
beforeEach(() => { vi.useFakeTimers(); el = document.createElement('div'); document.body.append(el) })
afterEach(() => { vi.useRealTimers(); el.remove() })

describe('mountWordFind', () => {
  it('renders one element per word', () => {
    mountWordFind(ITEM, deps(el))
    expect(el.querySelectorAll('.word')).toHaveLength(3)
  })

  it('renders the tricky bit of a red word as a marked segment', () => {
    mountWordFind(ITEM, deps(el))
    expect(el.querySelector('.tricky')).not.toBeNull()
    expect(el.textContent).toContain('said')
    expect(el.textContent).not.toContain('[')
  })

  it('speaks the target word after the scheduled delay', () => {
    const d = deps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY - 1)
    expect(d.speak).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(d.speak).toHaveBeenCalled()
  })

  it('reports a wrong answer without ending the round', () => {
    const d = deps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speak as any).mock.calls[0][0]
    const wrong = words.find(w => w.textContent !== spoken)!
    tap(wrong)
    expect(d.onWrong).toHaveBeenCalled()
    expect(d.onAdvance).not.toHaveBeenCalled()
    expect(d.flyToScore).not.toHaveBeenCalled()
  })

  it('a correct tap flies a star to the score', () => {
    const d = deps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speak as any).mock.calls[0][0]
    tap(words.find(w => w.textContent === spoken)!)
    expect(d.flyToScore).toHaveBeenCalled()
    expect(d.onWrong).not.toHaveBeenCalled()
  })

  it('three wrong taps trigger the rescue and lock input', () => {
    const d = deps(el)
    mountWordFind(ITEM, d)
    vi.advanceTimersByTime(SPEAK_DELAY + 50)
    const words = [...el.querySelectorAll<HTMLElement>('.word')]
    const spoken = (d.speak as any).mock.calls[0][0]
    const wrong = words.find(w => w.textContent !== spoken)!
    tap(wrong); tap(wrong); tap(wrong)
    expect(d.toast).toHaveBeenCalledWith(expect.stringContaining('Listen carefully'))
    // input is locked for 1800ms (v0:934) — further taps do nothing
    const wrongCalls = (d.onWrong as any).mock.calls.length
    tap(wrong)
    expect((d.onWrong as any).mock.calls.length).toBe(wrongCalls)
  })

  it('teardown clears the element and cancels pending timers', () => {
    const d = deps(el)
    const stop = mountWordFind(ITEM, d)
    stop()
    expect(el.children).toHaveLength(0)
    vi.advanceTimersByTime(10_000)
    expect(d.onAdvance).not.toHaveBeenCalled()
  })
})
```

Run it, confirm it fails, then port `renderSet`/`wordTap`/`speakTarget` until it passes.

- [ ] **Step 7: Port `build.ts` and `sum.ts`**

Port these with the same discipline. They have no unit tests in this task — they are covered by the parity check in Task 19, because their behaviour is interaction sequencing that a DOM test would pin far more loosely than a human playing it. Note this gap honestly rather than writing tests that assert nothing.

- [ ] **Step 8: Run the full suite and typecheck**

Run: `npm test` — Expected: all pass
Run: `npm run typecheck` — Expected: no errors

- [ ] **Step 9: Commit**

```bash
git add src/challenges tests/challenges
git commit -m "refactor: extract challenge renderers verbatim with injected dependencies"
```

---

## Task 19: Reassemble the 2D shell and verify parity

**Files:**
- Create: `src/words2d/index.html`, `src/words2d/main.ts`, `src/words2d/style.css`, `src/words2d/ambience.ts`, `src/words2d/celebration.ts`, `src/words2d/album.ts`, `src/words2d/profiles.ts`, `src/words2d/gear.ts`
- Modify: `vite.words.config.ts` (remove the stub entry)

**Interfaces:**
- Consumes: everything built so far
- Produces: a playable single-file build at `dist/words/junos-words.html`

Move the remaining parts of the original — CSS, ambience, particles and spectacles, the sticker album, profiles, the PIN gear — into modules. These are not shared with the island, so they stay 2D-only. Port them verbatim; the battery is the one thing deliberately dropped (brief §4 and §7, which retire it in favour of habitat coupling).

- [ ] **Step 1: Extract the stylesheet verbatim**

Copy the entire `<style>` block from `v0/junos-words.html` into `src/words2d/style.css` unchanged, and import it from `main.ts`.

- [ ] **Step 2: Extract the markup verbatim**

Copy the `<body>` markup into `src/words2d/index.html`, keeping every element id — the ported renderers and the ambience code look them up by id.

- [ ] **Step 3: Port the remaining modules**

Every remaining line of the original gets an explicit home. Anything left unassigned in a line-precise plan is where behaviour gets rewritten by accident.

| Module | Original lines | Contents |
|---|---|---|
| `ambience.ts` | 1353-1497 | Critters, decor, floaters, sparkles, per-theme ambience |
| `celebration.ts` | 1507-1823 | Particle engine, spectacles, banner, `reward()` — **sets `rewardUntil` and `quietUntil` (1811-1812)**, which feed `ChallengeDeps.holds` |
| `score.ts` | 1498-1504, 1529-1530, 1825-1833 | `updateScore`, `CHILD_NAME`, `REWARD_EVERY`, `addScore` — the 2-point literacy economy and the reward threshold |
| `album.ts` | 517-552, 686-694, 1874-2002 | `STICKERS`, `CAT_FLAT`, `visitorSticker`, hatch/befriend/day-latch, book UI. `befriend()` also sets `quietUntil` (1922) |
| `profiles.ts` | 554-643 | Picker, avatar chip, add/switch — rewritten onto the async `SaveStore` |
| `saves.ts` | 644-683 | `todayKey`, `strHash`, `article`, `capName`, `saveSoon`, `loadSave`, `ownedSet` — onto `SaveStore` |
| `gear.ts` | 2085-2120 | The DDMM PIN dialog and profile delete |

`article` and `capName` are used by the sticker copy ("You found **a** shark!"); they move with `saves.ts` and are imported where needed.

**Drop the battery** (brief §4, §7). Do not port `updateBattery`, `chargeBattery`, `spendBattery`, `batteryEmptyNudge`, `BATT_START`, `BATT_MAX`, or their UI, and remove the battery element from the copied markup. Habitat coupling replaces it in M1. Task 18 lists the exact in-renderer battery lines to drop.

- [ ] **Step 4: Wire `main.ts`**

Compose the app: create the `Speaker`, `Sfx` and `SaveStore`; build the decks with `defaultRng`; hold the four mode states; mount the right challenge on mode change; supply the `ChallengeDeps` callbacks from the celebration and score modules.

- [ ] **Step 5: Build and check the artifact**

```bash
npm run build:words
```

Expected: `dist/words/junos-words.html` exists, is a single file, and contains no `src=` references to local files.

```bash
node -e "const h=require('fs').readFileSync('dist/words/junos-words.html','utf8'); const m=h.match(/(src|href)=\"(?!data:|https?:)[^\"]+\"/g); console.log(m ? 'EXTERNAL REFS: '+m.join(', ') : 'OK: fully inlined')"
```

Expected: `OK: fully inlined`

- [ ] **Step 6: Parity check — play both side by side**

Open `v0/junos-words.html` and `dist/words/junos-words.html` in two browser windows. Work through this checklist in each and confirm identical behaviour:

- [ ] Reading round renders, words are tappable, correct answer advances
- [ ] Tricky bits show a wavy underline; digraphs show a solid underline
- [ ] Three wrong answers in a row triggers the rescue and locks input
- [ ] Build mode: tiles drag into slots, Fred sounds out the word grapheme by grapheme
- [ ] Sum mode: number pad works, dot hints open, fives colour-blocking is right
- [ ] Score bar fills, spectacle fires at the reward threshold
- [ ] Sticker hatches and appears in the album
- [ ] Theme switching changes palette, ambience and sounds
- [ ] Profile switching works; the PIN gear opens with today's DDMM
- [ ] TTS speaks in an en-GB voice
- [ ] **Battery retired:** no battery UI anywhere, and sums advance freely with no charge gate and no empty-battery nudge. This is the one intended difference from `v0/`
- [ ] Auto-advance waits out a spectacle rather than cutting through it (the `rewardUntil` hold)
- [ ] TTS stays quiet during a celebration, then resumes (the `quietUntil` hold)

Record any difference as a defect against the port. Do not proceed with known differences.

- [ ] **Step 7: Commit**

```bash
git add src/words2d vite.words.config.ts
git commit -m "feat: rebuild the 2D game from extracted core modules"
```

---

## Task 20: Ship the rebuilt 2D game and close M0

**Files:**
- Modify: `README.md` (create)

- [ ] **Step 1: Write the README**

Document: what the project is, the two builds and how to run them, the `v0/` freeze rule, the golden-diff workflow, and the dev loop from spec §3 (including the USB port-forward trick for service workers).

- [ ] **Step 2: Push and confirm CI**

```bash
git add README.md
git commit -m "docs: add README covering builds, the v0 freeze, and the dev loop"
git push
```

Confirm the Actions run is green and `https://jtr31415.github.io/JunosIsland/words/junos-words.html` serves the rebuilt game.

- [ ] **Step 3: Full verification sweep**

```bash
npm run typecheck && npm test && npm run build
```

Expected: no type errors, all tests pass, both artifacts produced.

**PHASE 3 GATE — Fable 5 review.** Review the whole of M0: the extraction fidelity, the golden diff, the parity checklist results, and whether anything field-tested was quietly rewritten. On pass, write the M1 plan.

---

## Self-review notes

**Spec coverage.** Every §2–§6 and §8 requirement maps to a task: repo/tooling → 1–2, dev workflow → README in 20, `core/` inventory → 4–13, `platform/` → 15–17, `challenges/` → 18, persistence → 16, fidelity → 3 and 14, sequencing → phase gates. Spec §7 (the island) is deliberately out of scope and gets its own plan.

**Known gaps, stated rather than hidden.**
- `challenges/build.ts` and `challenges/sum.ts` have no unit tests; they are covered by the Task 19 parity checklist. DOM tests would pin their interaction sequencing far more loosely than a human playing them, and writing tests that assert nothing is worse than admitting the gap.
- Task 19's parity check is manual. It is the only honest way to verify "plays identically".
- `REAL_BLOCK` and the stylesheet are specified as "copy verbatim" rather than reproduced inline. Both are long literals where retyping is the risk, not the safeguard.
