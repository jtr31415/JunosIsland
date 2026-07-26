/**
 * Golden-output capture.
 *
 * Slices the *pure* learning logic out of the frozen original and runs it under
 * Node with Math.random replaced by a seeded PRNG. core/ must then reproduce
 * this byte for byte (tests/golden.test.ts).
 *
 * Running the original's own source text — rather than a hand-patched copy or a
 * second transcription — is what makes this a reference rather than another
 * port. v0/junos-words.html is read-only here and is never modified.
 *
 * The original cannot simply be imported: it does DOM work at load
 * (`const fx = $('fx'), fctx = fx.getContext('2d')`). Slicing the pure ranges
 * avoids needing a browser or a stubbed document.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const src = readFileSync(resolve(root, 'v0/junos-words.html'), 'utf8').split(/\r?\n/)

/**
 * 1-indexed inclusive ranges of pure logic in the original.
 * Stable because v0/junos-words.html is frozen.
 *
 *   368-504   GREEN, RED, CONFUSABLE, groupOf, plainWord, parseMark, GRAPHS,
 *             markDigraphs, lev1, POOL, NEIGH, AL_* pools, REAL_BLOCK, alienWord
 *   697-719   MIN, MAX, levels, store, shuffle, makeDeck, drawGreen, drawRed, $, ri
 *   773-837   generateRead
 *   974-1008  generateAdd, generateSub
 *   1161-1179 generateBuild
 *
 * `$` (718) is a lambda that is defined but never invoked here, so no DOM is touched.
 */
const RANGES = [
  [368, 504],
  [697, 719],
  [773, 837],
  [974, 1008],
  [1161, 1179],
]

const slice = RANGES.map(([a, b]) => src.slice(a - 1, b).join('\n')).join('\n\n')

const SEED = 20260726

// Bit-identical to mulberry32 in src/core/rng.ts, so core/ consumes the same
// number stream in the same order.
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

/**
 * Every level the shipped UI can reach (setLevel, v0:2055-2061), not just
 * level 1 — otherwise alienWord's RNG stream, the bridging-addition branch and
 * subtraction levels 2-3 would all go unpinned.
 *
 * State objects deliberately carry across the level flip: reading's
 * n = min(8, MIN + history.length) saturates at 8, and the sums' anti-repeat
 * guard compares the first level-2 item against the last level-1 one. Both are
 * mirrored in tests/golden.test.ts.
 */
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
  .map(([k, v]) => `${k}=${v.length}`)
  .join(' '))
