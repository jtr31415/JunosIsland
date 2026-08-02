/**
 * The text surgery behind one button: a draft in the species editor becomes a
 * species in the game.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Joe, 2 August 2026: *"in the editor i also want to sign off on the name and
 * the fact line and then with one button push it to the game thats where we
 * need to get to."*
 *
 * ## A species costs TEN places, and this writes SEVEN of them
 *
 * `docs/handoffs/PB-036-goldfish-crocodile.md` counted the first nine, and the
 * count is the whole design of this file. A push that did eight would leave a
 * species that builds as a bare hull; a push that CLAIMED nine and generated
 * the three it cannot honestly write would be worse, because a test that
 * asserts whatever the code currently does is not a test, it is a screenshot
 * with a green tick. PB-068 added the tenth — Joe's locomotion ruling — and it
 * is the one place on this list that must ALSO be reachable for a species
 * already pushed; see `withMovesEntry`, and `src/island/species/moves.ts`'s own
 * header for why it cannot live among the other nine.
 *
 * So the split is deliberate and it is reported back to Joe in full:
 *
 *   WRITTEN  1  `src/island/species/parts/assembled/animal-<id>.ts`
 *            2  `src/island/species/parts/assembled/index.ts` — the export line
 *            3  `src/island/species/collections/<c>.ts` — the record, in ROSTER
 *               order
 *            4  `src/island/species/collections/<c>.ts` — `import
 *               '../parts/assembled'`, the ninth place and the easy one to miss
 *            8  `joe/names-audit.json` — one row
 *            9  `joe/species-facts.json` — one fact
 *           10  `src/island/species/moves.ts` — the `MOVES` table entry, IF Joe
 *               has ruled on it. Absent from the payload, this is silently
 *               skipped rather than forced — nothing about locomotion is
 *               invented on his behalf.
 *
 *   LEFT     5  `tests/island/species-<c>.test.ts` — a rework, not an edit
 *            6  `tests/island/assembly-<id>.test.ts` — the species' own
 *               invariants, which nobody but a human can state
 *            7  `tests/island/assembly-fingerprint.test.ts` — the pin, which
 *               must be READ off the built model and never computed here
 *            +  the two shared counts, `tests/island/naming.test.ts` and
 *               `tests/island/species-registry.test.ts`
 *
 * **So `npm test` is RED immediately after a push, and that is correct.** The
 * species is in the game and the guards that describe it are not written yet.
 * The reply says so in as many words rather than leaving him to find out from a
 * gate an hour later.
 *
 * ## Order is a safety property here, not a preference
 *
 * `parts/assembled/index.ts` says it at line 28: on 29 July someone wrote
 * thirteen export lines for five files that did not exist yet, the module graph
 * failed to resolve, and Joe's live viewer went blank. **The file is always
 * written before the line that exports it.** Everything below therefore
 * validates the whole plan first, builds every new file body in memory, and only
 * then writes — in an order in which any single interruption leaves a tree that
 * still loads.
 *
 * ## Nothing here decides whether a definition is legal
 *
 * `creatureSpec` does, and it lives in TypeScript that this plain-`.mjs` server
 * cannot import (`server.mjs` runs under bare node; only `pets:creature` has the
 * `--experimental-strip-types` shim). The page runs it before it sends —
 * `editor/push.ts` — which is the same instant, on the same definition, and is
 * the only place in the system that both has the definition and can execute the
 * rules. What THIS side owns is the filesystem: what exists, what must not be
 * overwritten, and what the paths are. It derives every path from `speciesId`
 * and `collection` and takes none from the payload, so a caller cannot name a
 * file at all, let alone one outside the repo.
 */

import { posix } from 'node:path'
import { exists, readJson, readText, writeJson, writeText } from './repo.mjs'

/** A push this module refuses to perform, with the reason in Joe's words. */
export class PushRefused extends Error {}

/** An id the assembled folder will accept as a file name and a module id. */
export const SPECIES_ID = /^animal-[a-z0-9]+(?:-[a-z0-9]+)*$/
/** A collection id, which is also a file name under `collections/`. */
export const COLLECTION_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** `CORN_SNAKE_ASSEMBLY`, and nothing that is not shaped like one. */
export const EXPORT_NAME = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_ASSEMBLY$/

/**
 * The line `parts/assembled/index.ts` appends above, and appends nothing after.
 *
 * Matched rather than reconstructed: if somebody rewords the sentinel the push
 * refuses instead of guessing where the list ends, because appending to the
 * wrong place in that file is how the blank-viewer incident happened.
 */
export const SENTINEL = "/* -- append the next species' line directly above this one -- */"

/** The bare side-effect import that makes an assembled species findable. */
export const ASSEMBLED_IMPORT = "import '../parts/assembled'"

/**
 * The comment that goes above it, verbatim from the three collection files that
 * already carry the import.
 *
 * Copied rather than paraphrased. The reason a reader needs is "without this
 * line it builds as a bare hull", and that sentence has already been written
 * three times; a fourth wording of it would be a fourth thing to keep in step.
 */
const importBlock = (speciesId) => [
  '/*',
  ' * Evaluated for its SIDE EFFECT, not for a name: each species module under',
  ' * `parts/assembled/` registers its own build as it defines it, and',
  ` * \`defineSpecies\` picks that up by id. Without this line ${speciesId.replace(/^animal-/, '')} below`,
  ' * would find no assembly and would build as a bare hull.',
  ' * `tests/island/assembly-constants.test.ts` fails loudly if it is ever dropped.',
  ' */',
  ASSEMBLED_IMPORT,
].join('\n')

/**
 * Every file this module touches is LF, and a mixed file is refused.
 *
 * Not fussiness. The repo is LF throughout and `tests/island/species-facts.test.ts`
 * asserts it for `joe/`; splicing an LF fragment into a file some other tool has
 * left as CRLF produces a file with both, which shows up later as a diff of
 * every line and buries the one that changed. Refusing is cheap and the fix is
 * a human's.
 */
export function assertLf(rel, text) {
  if (text.includes('\r')) {
    throw new PushRefused(
      `${rel} has CRLF line endings, and this push writes LF. Nothing was written — `
      + 'convert the file first, or the diff will claim every line changed.')
  }
}

/* ----------------------------- 1 again. the definition block, REPLACED --- */

/**
 * ## Why an UPDATE splices and never regenerates
 *
 * Joe, 2 August: he opened a shipped animal in the editor, changed it, pressed
 * the button, and nothing reached `src/` — because the refusal below is written
 * for a NEW species whose id collides with a built one, and every one of the
 * thirty built species trips it. The guard is right and it stays; what was
 * missing was a way to say "this is an EDIT of that animal", which is `replace`
 * on the request.
 *
 * **But an update may not write `defToModuleSource`'s output over the file.**
 * That was measured: the generator's output is byte-identical to 0 of the 30
 * files on disk, because the generator writes an eleven-line placeholder doc
 * comment where the real files carry their derivations.
 * `animal-hedgehog.ts` is 286 lines on disk against 50 emitted — the 236 lost
 * would include a `flag` ruling in Joe's own words and the whole argument for
 * why the spikes are `cone-01` and not the hog's ear. That reasoning is the
 * point of one-species-one-file; a button that deleted it would be a worse bug
 * than the one it fixed.
 *
 * So an update replaces the OBJECT LITERAL passed to `defineCreature` and
 * NOTHING else. Every byte before the `{` and after the matching `}` — the doc
 * comment, the imports, anything below the call — is carried over untouched.
 */

/**
 * The end of the quoted string that starts at `at`, one past its closing quote.
 *
 * Needed because the brace matcher must not count a `{` that is inside a string,
 * and must not mistake an apostrophe in a comment for the start of one. Both
 * happen in these files: the hedgehog's `flag` is a wrapped concatenation full
 * of quotes and braces-adjacent prose.
 */
function endOfString(source, at, what) {
  const quote = source[at]
  for (let i = at + 1; i < source.length; i++) {
    const c = source[i]
    if (c === '\\') { i++; continue }
    if (c === quote) return i + 1
    /* A '...' or "..." never spans a line; a `...` may. */
    if (quote !== '`' && c === '\n') break
  }
  throw new PushRefused(
    `${what} has a string that never closes, so this cannot tell where the definition ends. `
    + 'Nothing was written.')
}

/**
 * The index of the `}` that closes the `{` at `open`.
 *
 * Comments and strings are consumed whole, so neither a `{` in a sentence nor an
 * apostrophe in a derivation can move the count. Anything it cannot read — an
 * unterminated comment or string, braces that never balance — is a `PushRefused`
 * and never a guess: a wrong splice corrupts an animal nobody can regenerate,
 * and a refusal is merely annoying.
 */
function matchingBrace(source, open, what) {
  let depth = 0
  let i = open
  while (i < source.length) {
    const c = source[i]
    const n = source[i + 1]
    if (c === '/' && n === '*') {
      const end = source.indexOf('*/', i + 2)
      if (end === -1) {
        throw new PushRefused(
          `${what} has a /* comment that is never closed, so this cannot tell where the `
          + 'definition ends. Nothing was written.')
      }
      i = end + 2
      continue
    }
    if (c === '/' && n === '/') {
      const end = source.indexOf('\n', i + 2)
      i = end === -1 ? source.length : end + 1
      continue
    }
    if (c === "'" || c === '"' || c === '`') {
      i = endOfString(source, i, what)
      continue
    }
    if (c === '{') { depth++; i++; continue }
    if (c === '}') {
      depth--
      if (depth === 0) return i
      i++
      continue
    }
    i++
  }
  throw new PushRefused(
    `${what} has a \`defineCreature\` call whose braces never balance, so this cannot tell where `
    + 'the definition ends. Nothing was written.')
}

/** Escape a species id for use in a `RegExp`. Belt and braces — `SPECIES_ID` already refuses everything below. */
const reLit = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Where the definition literal of `defineCreature('<id>', { ... })` starts and
 * ends, as indices of the `{` and its matching `}`.
 *
 * **EXACTLY ONE call, or this refuses.** Not found means the file is not shaped
 * like a species file and there is nothing to replace; found twice means this
 * would have to choose which one is the animal, and choosing wrong writes one
 * definition over another. Both are refusals with the file named.
 */
export function definitionSpan(source, speciesId, what) {
  const call = new RegExp(`defineCreature\\(\\s*'${reLit(speciesId)}'\\s*,\\s*\\{`, 'g')
  const opens = []
  for (let m = call.exec(source); m !== null; m = call.exec(source)) {
    opens.push(m.index + m[0].length - 1)
  }
  if (opens.length === 0) {
    throw new PushRefused(
      `${what} has no \`defineCreature('${speciesId}', {\` call, so there is no definition to `
      + 'replace and this will not guess where one goes. Nothing was written.')
  }
  if (opens.length > 1) {
    throw new PushRefused(
      `${what} has ${opens.length} \`defineCreature('${speciesId}', {\` calls, and this will not `
      + 'guess which of them is the animal. Nothing was written.')
  }
  const open = opens[0]
  return { open, close: matchingBrace(source, open, what) }
}

/** The `{ ... }` a module passes to `defineCreature`, braces included. */
export function definitionLiteral(module, speciesId, what = 'the module text the editor sent') {
  const { open, close } = definitionSpan(module, speciesId, what)
  return module.slice(open, close + 1)
}

/* --------------------------------- the named numbers a definition was written with --- */

/**
 * ## Why the splice puts `PACK_PUPIL` back
 *
 * The editor's definition comes from `loadBuiltDefs()`, which is the definition
 * as the module EVALUATED it — so every named constant in a species file has
 * already become a number by the time the editor sees it, and
 * `defToModuleSource` writes that number out. All thirty shipped species write
 * `pupil: PACK_PUPIL` and import that constant, so a naive splice replaces the
 * name with `0x4c4f5e` and leaves an import nothing reads, which
 * `tsconfig.json`'s `noUnusedLocals` reports as an error. Handing Joe a compiler
 * error and a manual edit as the reward for pressing one button is the same
 * failure as the silent no-op this whole change is fixing; it just fails later
 * and louder.
 *
 * So: **an identifier the old literal used at key K, whose value equals the new
 * literal's value at key K, is written back.** The colour is unchanged, so the
 * name loses nothing and the file goes on reading the way its author wrote it.
 *
 * **And it is a value comparison, never a rewrite of what Joe did.** If he
 * genuinely changed the pupil, the hex will not equal `PACK_PUPIL` and the hex
 * stays — at which point the import really is dead, and `staleBindings` says so,
 * which is the one case where telling him is the correct answer.
 *
 * The value is READ OUT OF THE REPO at push time and never hardcoded: this
 * module may not import a line of `src/`, but it may read it as text. Anything
 * it cannot read as a plain number — and every file-local derivation here is an
 * expression, `0.125 / 0.359219` and the like — is left alone rather than
 * guessed at. A wrong substitution changes an animal's colour, which is far
 * worse than an unused import.
 */

/** A number as a species file writes one: `0x4c4f5e`, `0.408163`, `-0.5`, `1e-6`. */
const NUMERIC = /^(?:0x[0-9a-fA-F]+|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)$/

/**
 * The number `const NAME = ...` declares, or `null` when it is not a plain one.
 *
 * `null` for `const COIL_SINK = (COIL_THICK - HULL_BOTTOM_Y) / COIL_THICK` on
 * purpose. Evaluating a species file's arithmetic here would be this module
 * running `src/`, which is precisely what it may not do.
 */
function declaredNumber(source, name, exportedOnly) {
  const lead = exportedOnly ? 'export\\s+' : '(?:export\\s+)?'
  const re = new RegExp(`^${lead}const\\s+${reLit(name)}\\s*(?::[^=\\n]*)?=\\s*(.*)$`, 'm')
  const m = re.exec(codeOnly(source))
  if (m === null) return null
  const raw = m[1].replace(/;?\s*$/, '').trim()
  return NUMERIC.test(raw) ? Number(raw) : null
}

/** The module specifier a named import of `name` comes from, or `null`. */
function importedFrom(source, name) {
  for (const line of source.split('\n')) {
    const m = /^\s*import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'/.exec(line)
    if (m === null) continue
    const names = m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()?.trim())
    if (names.includes(name)) return m[2]
  }
  return null
}

/**
 * Look a bare identifier up: the species file's own declarations first, then the
 * module it imports the name from.
 *
 * Relative specifiers only, and every read goes through `repo.mjs`'s jail like
 * every other read here. `null` means "could not be read", which the caller
 * treats as "do not substitute".
 */
export function constantLookup(root, modulePath, source) {
  return (name) => {
    const own = declaredNumber(source, name, false)
    if (own !== null) return own
    const spec = importedFrom(source, name)
    if (spec === null || !spec.startsWith('.')) return null
    const base = posix.normalize(posix.join(posix.dirname(modulePath), spec))
    for (const rel of [`${base}.ts`, `${base}/index.ts`]) {
      if (!exists(root, rel)) continue
      const text = readText(root, rel)
      if (text === null) continue
      const value = declaredNumber(text, name, true)
      if (value !== null) return value
    }
    return null
  }
}

const RESERVED = new Set(['true', 'false', 'null', 'undefined'])
/* A BARE identifier only. `LEG_ROW.sink` and `HULL_MID_Y + 0.1` are expressions
 * this cannot evaluate, and the negative lookahead is what excludes them. */
const IDENT_AT_KEY = /\b([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)(?![\w$.(])/g
const numberAtKey = (k) =>
  new RegExp(`(\\b${reLit(k)}\\s*:\\s*)(0x[0-9a-fA-F]+|[-+]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[eE][-+]?\\d+)?)(?![\\w$.])`, 'g')

/**
 * Put back every named constant whose value the edit did not change.
 *
 * Returns the adjusted literal and the names restored. Deliberately timid: a key
 * that appears more than once on either side, or under two different names, is
 * skipped rather than resolved by position — `part` and `at` occur all over a
 * definition, and a substitution in the wrong slot is a corrupted animal.
 */
export function withRestoredConstants(oldLiteral, newLiteral, valueOf) {
  const seen = new Map()
  for (const m of codeOnly(oldLiteral).matchAll(IDENT_AT_KEY)) {
    const [, k, ident] = m
    if (RESERVED.has(ident)) continue
    const cur = seen.get(k)
    seen.set(k, { ident: cur && cur.ident !== ident ? null : ident, n: (cur?.n ?? 0) + 1 })
  }

  let literal = newLiteral
  const restored = []
  for (const [k, { ident, n }] of seen) {
    if (ident === null || n !== 1) continue
    const value = valueOf(ident)
    if (value === null) continue
    const hits = [...literal.matchAll(numberAtKey(k))]
    if (hits.length !== 1) continue
    const hit = hits[0]
    /* The whole test: same key, same NUMBER. A colour Joe actually changed does
     * not match, and its hex stays exactly as he left it. */
    if (Number(hit[2]) !== value) continue
    literal = literal.slice(0, hit.index) + hit[1] + ident + literal.slice(hit.index + hit[0].length)
    restored.push(ident)
  }
  return { literal, restored }
}

/**
 * Replace the definition literal in a species file that is already on disk.
 *
 * The one write an update makes. Everything outside `[open, close]` is carried
 * over byte for byte, which is what preserves the 236 lines of the hedgehog's
 * reasoning — and the trailing newline, which lives after the `}` and is never
 * in the span.
 *
 * Returns `null` when the result is identical to the input, so the reply can say
 * "already exactly this" honestly rather than claiming a write it did not make.
 */
export function withUpdatedDefinition(source, speciesId, defLiteral) {
  const what = `the species file for ${speciesId}`
  assertLf(what, source)
  assertLf('the definition the editor sent', defLiteral)
  const { open, close } = definitionSpan(source, speciesId, what)
  const next = source.slice(0, open) + defLiteral + source.slice(close + 1)
  return next === source ? null : next
}

/**
 * Blank every comment and every string body, keeping the line structure.
 *
 * So that "is this imported name still used?" is a question about CODE. Without
 * it the hedgehog answers yes on the strength of its doc comment, which says
 * "**The pupil is `PACK_PUPIL`**" thirty lines above the import.
 */
function codeOnly(source) {
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  let out = ''
  let i = 0
  while (i < source.length) {
    const c = source[i]
    const n = source[i + 1]
    if (c === '/' && n === '*') {
      const end = source.indexOf('*/', i + 2)
      const stop = end === -1 ? source.length : end + 2
      out += blank(source.slice(i, stop)); i = stop; continue
    }
    if (c === '/' && n === '/') {
      const end = source.indexOf('\n', i + 2)
      const stop = end === -1 ? source.length : end
      out += blank(source.slice(i, stop)); i = stop; continue
    }
    if (c === "'" || c === '"' || c === '`') {
      let stop
      try { stop = endOfString(source, i, 'this file') } catch { stop = source.length }
      out += blank(source.slice(i, stop)); i = stop; continue
    }
    out += c; i++
  }
  return out
}

const IMPORT_BINDINGS = /^\s*import\s+(?:type\s+)?\{([^}]*)\}\s+from\s/
/* Module scope, not exported — an `export const` is read by whatever imports it. */
const LOCAL_CONST = /^const\s+([A-Za-z_$][\w$]*)\s*[:=]/

/**
 * Names the file declares or imports that nothing in it reads any more.
 *
 * **What is left over once `withRestoredConstants` has done its work**, and
 * therefore a much smaller and more meaningful list than it would be alone: a
 * name still here is one whose VALUE the edit actually changed, or one bound to
 * an expression this cannot evaluate. Either way it is genuinely dead, and
 * `noUnusedLocals` would report it with no hint of where it came from.
 *
 * NOT fixed here, and deliberately: an import line and a derivation constant
 * both live OUTSIDE the definition block, and the whole promise of an update is
 * that it does not write outside it. Deleting a line of a species file is a
 * human's call — the constant usually has a paragraph above it explaining the
 * measurement, and that paragraph has to go with it or stay, which is a judgement
 * about prose. So the reply names the lines and Joe decides.
 *
 * Conservative: a name that still appears anywhere in the CODE is not reported.
 * Comments are blanked first, or the hedgehog answers "still used" on the
 * strength of a doc comment that says "**The pupil is `PACK_PUPIL`**" thirty
 * lines above the import.
 */
export function staleBindings(source) {
  const lines = codeOnly(source).split('\n')
  const names = []
  const rest = []
  for (const line of lines) {
    const imported = IMPORT_BINDINGS.exec(line)
    if (imported !== null) {
      for (const spec of imported[1].split(',')) {
        const name = spec.trim().split(/\s+as\s+/).pop()?.trim()
        if (name) names.push(name)
      }
      continue
    }
    const local = LOCAL_CONST.exec(line)
    if (local !== null) {
      names.push(local[1])
      /* The declaration's own right-hand side may name OTHER constants, and
       * those uses are real — `COIL_SINK` reads `COIL_THICK`. So the line stays
       * in the body, minus the name being declared. */
      rest.push(line.slice(local[0].length))
      continue
    }
    rest.push(line)
  }
  const body = rest.join('\n')
  return names.filter(n => !new RegExp(`\\b${reLit(n)}\\b`).test(body))
}

/* ------------------------------------------------- 2. the export line --- */

/**
 * Add one `export { X_ASSEMBLY } from './animal-x'` directly above the sentinel.
 *
 * APPEND, never sort — `index.ts` says why at its line 43: the list order is the
 * order the approver bench shows creatures in, and the hedgehog is first because
 * it was first.
 *
 * Returns `null` when the line is already there, which is not an error: a push
 * re-run after a half-landed one should finish the job rather than refuse it.
 */
export function withExportLine(source, exportName, speciesId) {
  const line = `export { ${exportName} } from './${speciesId}'`
  if (source.split('\n').some(l => l.trim() === line)) return null
  const at = source.indexOf(SENTINEL)
  if (at === -1) {
    throw new PushRefused(
      "parts/assembled/index.ts no longer carries the \"append the next species' line\" marker, "
      + 'so this cannot tell where the list ends. Nothing was written.')
  }
  return source.slice(0, at) + line + '\n' + source.slice(at)
}

/* -------------------------------------- 3. the record, in roster order --- */

/**
 * Where a `defineSpecies` record starts, INCLUDING the comment block above it.
 *
 * This is the bug `edc6e48` had to go back and fix by hand: the corn snake's
 * record was inserted between the terrapin's comment and the terrapin's own
 * `defineSpecies` call, so a fifteen-line explanation of a terrapin ended up
 * introducing a corn snake. Inserting at a `defineSpecies(` line is therefore
 * always wrong; you insert at the top of whatever explains it.
 */
function recordStart(lines, index) {
  let i = index
  while (i > 0) {
    const before = lines[i - 1].trim()
    if (before === '' || before.endsWith('*/') || before.startsWith('*') || before.startsWith('/*')) i--
    else break
  }
  /* Do not swallow the blank line that separates this record from the last. */
  while (i < index && lines[i].trim() === '') i++
  return i
}

/**
 * Splice a record into a collection file at its ROSTER position.
 *
 * `after` is the collection's roster members that come after this species, in
 * roster order, supplied by the page — which has the real `COLLECTIONS` table
 * loaded and this side does not. The first of them that is actually in the file
 * is what the new record goes above; if none is, it goes last, before the `]`.
 * `tests/island/species-<c>.test.ts` asserts the file's order IS the roster's,
 * element for element, so this is the difference between a push and a red gate.
 */
export function withRecord(source, speciesId, record, after) {
  if (source.includes(`defineSpecies('${speciesId}'`)) return null
  const lines = source.split('\n')
  let at = -1
  for (const next of after) {
    const found = lines.findIndex(l => l.includes(`defineSpecies('${next}'`))
    if (found !== -1) { at = recordStart(lines, found); break }
  }
  if (at === -1) {
    /* Last, which means above the array's own closing bracket. */
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === ']') { at = i; break }
    }
  }
  if (at === -1) {
    throw new PushRefused(
      `the collection file has no closing "]" for its species array, so there is nowhere to put `
      + `${speciesId}. Nothing was written.`)
  }
  lines.splice(at, 0, ...record.split('\n'), '')
  return lines.join('\n')
}

/* --------------------------- 4. the ninth place, and the easy one to miss --- */

/**
 * Make sure the collection imports the assembled barrel.
 *
 * The ninth place. Without it the species finds no assembly and builds as a bare
 * hull — and the tree stays green while it does, because
 * `tests/island/assembly-constants.test.ts` only greps `garden.ts` for this
 * import, and its other sweep cannot catch a missing one: that test file imports
 * the barrel itself before it imports the registry, so the register is already
 * populated by the time any collection evaluates. A missing import in
 * `home-pets.ts` or `africa.ts` is genuinely silent. Hence: added unconditionally,
 * never asked about.
 */
export function withAssembledImport(source, speciesId) {
  if (source.split('\n').some(l => l.trim() === ASSEMBLED_IMPORT)) return null
  const anchor = "import { defineSpecies } from '../define'"
  const at = source.indexOf(anchor)
  if (at === -1) {
    throw new PushRefused(
      `the collection file does not import \`defineSpecies\` where this expected it, so the `
      + '`import \'../parts/assembled\'` line has no anchor. Nothing was written.')
  }
  const after = at + anchor.length
  return source.slice(0, after) + '\n' + importBlock(speciesId) + source.slice(after)
}

/* ------------------------------------------------- 8 and 9. the two rows --- */

/**
 * Append one row to a `joe/` file, and never touch a row that is already there.
 *
 * This is what lets `joe/species-facts.json` be written at all. JT-031 gave that
 * file exactly one author — a drafting-and-checking agent — and `api.mjs` keeps
 * it out of `WRITABLE` so `/api/save` cannot reach it, which
 * `tests/tools/workbench.test.ts` asserts and which stays true: this is not
 * `/api/save`. What is preserved is the thing that mattered, which is that the
 * two sides can never overwrite each other's work. An APPEND of a row that did
 * not exist is not an overwrite, and a row that does exist is left exactly as
 * its author left it and reported back as skipped.
 */
export function withRow(doc, listKey, row, keyField) {
  const list = doc?.[listKey]
  if (!Array.isArray(list)) {
    throw new PushRefused(`${listKey} is not a list in that file, so there is nothing to append to.`)
  }
  if (list.some(r => r?.[keyField] === row[keyField])) return null
  return { ...doc, [listKey]: [...list, row] }
}

/**
 * Make sure the facts file CLAIMS the collection it is about to file a fact
 * under.
 *
 * `joe/species-facts.json` asserts coverage only within `coveredCollections`,
 * and its own header says why: a collection left off that list goes quietly
 * factless and nothing shouts. A push into a collection that is not listed would
 * write a fact that the gate then refuses — `files every fact under a collection
 * it claims to cover` — so the claim is added with the fact, in the same write.
 */
export function withCoveredCollection(doc, collection) {
  const covered = doc?.coveredCollections
  if (!Array.isArray(covered)) return null
  if (covered.includes(collection)) return null
  return { ...doc, coveredCollections: [...covered, collection] }
}

/* ------------------------------------------------------- 10. the MOVES table --- */

/**
 * The four words `src/island/species/moves.ts`'s `Locomotion` union allows,
 * repeated here because this plain-`.mjs` server cannot import a line of that
 * TypeScript module — the same limit this file's own header states about
 * `creatureSpec`. `merge.mjs` keeps its own copy for the same reason, and
 * `tests/tools/species-push.test.ts` asserts all three agree, so a fifth word
 * added to one and not the others two is a failing test rather than a value
 * nobody notices has drifted.
 */
export const LOCOMOTIONS = ['land', 'air', 'water', 'amphibian']

const MOVES_START = '/* >>> WORKBENCH-OWNED TABLE'
const MOVES_END = '/* <<< WORKBENCH-OWNED TABLE */'

/**
 * Upsert one `'<id>': '<value>',` line into `moves.ts`'s `MOVES` table, between
 * its two markers.
 *
 * DELIBERATELY THE OPPOSITE SHAPE OF `withRecord`. `withRecord` returns `null`
 * — a no-op — the instant `speciesId` is already in the file, because a
 * `defineSpecies` record is prose nobody wants silently rewritten. `MOVES` is
 * the other thing entirely: it is DATA, one word per animal, and REPLACING an
 * id already there is the whole point of it — `moves.ts`'s own header explains
 * why at length, but the short version is that thirty species are already
 * pushed and a table that only ever appended would never let Joe rule on a
 * single one of them. So: absent → inserted, present → its value REPLACED,
 * never removed, never duplicated.
 *
 * Returns `null` when the id is already recorded with exactly this value —
 * still a no-op, so a re-push reports "already there" the way every other step
 * here does. Throws `PushRefused` for a value that is not one of the four
 * words above (checked BEFORE either marker is even looked for, so a rubbish
 * value never gets as far as being a filesystem question) or when either
 * marker is missing — this never guesses where the table is.
 */
export function withMovesEntry(source, speciesId, value) {
  if (!LOCOMOTIONS.includes(value)) {
    throw new PushRefused(
      `"${value}" is not a locomotion moves.ts accepts — it has to be one of ${LOCOMOTIONS.join(', ')}. `
      + 'Nothing was written.')
  }
  const start = source.indexOf(MOVES_START)
  const end = source.indexOf(MOVES_END)
  if (start === -1 || end === -1 || end < start) {
    throw new PushRefused(
      'src/island/species/moves.ts no longer carries both "WORKBENCH-OWNED TABLE" markers, so this '
      + 'cannot tell where the table starts and ends. Nothing was written.')
  }
  const between = source.slice(start, end)
  const braceOpen = between.indexOf('{')
  const braceClose = between.lastIndexOf('}')
  if (braceOpen === -1 || braceClose === -1 || braceClose < braceOpen) {
    throw new PushRefused(
      'the MOVES table between the markers is not the shape this expected — no `{ ... }` to edit. '
      + 'Nothing was written.')
  }

  const entryLine = /^\s*'([^']+)':\s*'([^']+)',?\s*$/
  const entries = new Map()
  for (const line of between.slice(braceOpen + 1, braceClose).split('\n')) {
    const m = entryLine.exec(line)
    if (m) entries.set(m[1], m[2])
  }

  if (entries.get(speciesId) === value) return null   // already exactly right — a true no-op

  entries.set(speciesId, value)
  const sorted = [...entries.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const body = sorted.map(([id, v]) => `  '${id}': '${v}',`).join('\n')

  return source.slice(0, start + braceOpen + 1) + '\n' + body + '\n' + source.slice(start + braceClose)
}

/* ----------------------------------------------------------- the button --- */

const str = (v) => (typeof v === 'string' ? v : '')

/**
 * The three places a button must not write, and what to do about each instead.
 *
 * Reported on EVERY push, including a completely successful one, because "what
 * is left" is the half of the answer that a green tick would otherwise hide.
 * The wording is the reason and not just the path: a test generated to assert
 * whatever the code currently does is worth less than no test at all, so these
 * are not "not implemented yet", they are "not a machine's to write".
 */
const whatIsLeft = (speciesId, collection) => [
  {
    place: 5,
    path: `tests/island/species-${collection}.test.ts`,
    why: 'a rework, not an edit — the roster-order literal and the assembled list gain the id, '
      + 'and the deferred-list test has to be inverted by somebody who can say what it now means.',
  },
  {
    place: 6,
    path: `tests/island/assembly-${speciesId.replace(/^animal-/, '')}.test.ts`,
    why: `the things only this animal can say. Run \`npm run pets:creature -- ${speciesId}\` for the `
      + 'measured height, parts, verts, tris and mass ratio; the invariants around them are yours.',
  },
  {
    place: 7,
    path: 'tests/island/assembly-fingerprint.test.ts',
    why: 'the pin. It must be READ off the built model — `npm run pets:creature` prints it — and '
      + 'never computed here, because a fingerprint this code generated would only ever agree '
      + 'with this code.',
  },
  {
    place: 0,
    path: 'tests/island/naming.test.ts and tests/island/species-registry.test.ts',
    why: 'the two shared counts. Both carry numbers in `it()` titles as well as in the assertions, '
      + 'so a search-and-replace on the expectation leaves the title lying.',
  },
]

/**
 * Push one species into the game, and say exactly what landed and what did not.
 *
 * `root` is the repo; every path below is built from `speciesId` and
 * `collection` and goes through `repo.mjs`'s `inside()` jail, which is the same
 * jail every other write in this server uses and is not widened here.
 *
 * The payload's `after` is the collection's roster members that come AFTER this
 * one, in roster order. The page supplies it because the page has the real
 * `COLLECTIONS` table loaded and this side cannot import TypeScript; it is used
 * only to choose an insertion point, so the worst a wrong one can do is put a
 * record in the wrong place in a file, which the collection's own test catches
 * loudly on the next run.
 */
export function pushSpecies(root, body) {
  const speciesId = str(body.speciesId)
  const collection = str(body.collection)
  const exportName = str(body.exportName)
  const module = str(body.module)
  const record = str(body.record)
  const after = Array.isArray(body.after) ? body.after.filter(a => typeof a === 'string') : []
  /* Absent means "Joe has not ruled on it yet" and is never treated as a value
   * — `undefined`, never `''`, is what says that all the way down to `withMovesEntry`. */
  const moves = body.moves === undefined ? undefined : str(body.moves)
  /*
   * "This is an edit of the species that is already built, not a new species."
   *
   * `true` ONLY when the request says so in as many words. Anything else — a
   * missing key, a string, a 1 — is a new species, because the whole value of
   * the refusal below is that a payload which never considered the question
   * cannot get past it. The editor sets this from where its definition came
   * from: `main.ts` holds `loadBuiltDefs()`'s map, so `defs.has(speciesId)` is
   * literally "this animal is already in the game", and nothing about it is
   * hard-coded.
   */
  const replace = body.replace === true

  /* ---- what the payload has to be, before anything is read off the disk ---- */

  if (!SPECIES_ID.test(speciesId)) {
    throw new PushRefused(
      `"${speciesId}" is not a species id. It has to look like animal-corn-snake: lower case, `
      + 'dashes, no spaces — it is a file name as well as an id.')
  }
  if (!COLLECTION_ID.test(collection)) {
    throw new PushRefused(`"${collection}" is not a collection id, so there is no file to put ${speciesId} in.`)
  }
  if (!EXPORT_NAME.test(exportName)) {
    throw new PushRefused(`"${exportName}" is not an assembly export name — they all end in _ASSEMBLY.`)
  }
  /*
   * The module has to be the module for THIS species. Without this a mislabelled
   * payload writes one animal's definition into another animal's file, under the
   * first animal's id, and everything downstream agrees with it.
   */
  if (!module.includes(`defineCreature('${speciesId}'`)) {
    throw new PushRefused(
      `the module text does not define ${speciesId} — it has no \`defineCreature('${speciesId}'\` in it. `
      + 'Nothing was written.')
  }
  if (!module.includes(`export const ${exportName} `)) {
    throw new PushRefused(`the module text does not export ${exportName}. Nothing was written.`)
  }
  if (!record.includes(`defineSpecies('${speciesId}'`)) {
    throw new PushRefused(`the collection record does not name ${speciesId}. Nothing was written.`)
  }
  /*
   * The two rows are cross-checked against the id for the same reason the module
   * and the record are, and it is a sharper one: `joe/names-audit.json` and
   * `joe/species-facts.json` are Joe's sign-off files, and a row keyed to the
   * wrong species does not merely sit in the wrong place — it CONSUMES that
   * species' one slot, so the real row can never be appended afterwards and the
   * duplicate guard reports it as "already there". A missing row would append a
   * bare `{}` and be reported as a fact written.
   */
  const auditRow = body.auditRow
  const factRow = body.factRow
  if (!auditRow || auditRow.speciesId !== speciesId || auditRow.id !== `natural/${speciesId}`) {
    throw new PushRefused(
      `the name row is not ${speciesId}'s — it has to carry \`speciesId: '${speciesId}'\` and `
      + `\`id: 'natural/${speciesId}'\`. Nothing was written.`)
  }
  if (!factRow || factRow.speciesId !== speciesId) {
    throw new PushRefused(
      `the fact row is not ${speciesId}'s — it has to carry \`speciesId: '${speciesId}'\`. `
      + 'Nothing was written.')
  }

  /* ------------------------------- what the disk has to be, before writing --- */

  const modulePath = `src/island/species/parts/assembled/${speciesId}.ts`
  const indexPath = 'src/island/species/parts/assembled/index.ts'
  const collectionPath = `src/island/species/collections/${collection}.ts`
  const movesPath = 'src/island/species/moves.ts'

  const alreadyBuilt = exists(root, modulePath)

  /*
   * THE ONE THAT MATTERS, MOSTLY UNCHANGED. The live twenty-four are frozen and
   * the Garden fourteen are Joe's approved work; a push that quietly wrote over
   * `animal-hedgehog.ts` because an id collided is unrecoverable in a way a
   * draft is not. There is deliberately no force flag: replacing a species is a
   * thing to do on purpose, in an editor, with git watching.
   *
   * The one exception is `moves`, and it is narrow on purpose: thirty species
   * are ALREADY built, and they are precisely the ones PB-068 exists for Joe to
   * rule on. Refusing this push wholesale the moment a module file exists would
   * make locomotion permanently unreachable for exactly the animals it is for —
   * see `moves.ts`'s own header. So a payload that names a species already
   * built is refused UNLESS it is asking only about locomotion, in which case
   * `alreadyBuilt` below skips straight to that and nothing else is touched.
   */
  /*
   * THE SANCTIONED CIRCUMSTANCE, AND IT IS THE ONLY ONE.
   *
   * The comment above says replacing a species is "a thing to do on purpose, in
   * an editor, with git watching". The editor is that circumstance, and `replace`
   * is how it says so — an explicit intent on the request, never a default and
   * never inferred from the payload looking like an edit. A NEW species whose id
   * happens to collide with a built one still hits the refusal below, word for
   * word, because a request that never claimed to be an update never was one.
   *
   * And an update is not a rewrite: `withUpdatedDefinition` replaces the
   * definition literal and nothing else in the file, so the derivations beside
   * every number survive the button. See its own comment for the measurement.
   */
  if (alreadyBuilt && replace) {
    const was = readText(root, modulePath)
    assertLf(modulePath, was)
    assertLf(modulePath, module)

    /* The whole plan first, as everywhere else here: a definition this cannot
     * find, or a moves value it will not accept, refuses BEFORE any write. */
    const sent = definitionLiteral(module, speciesId)
    const before = definitionLiteral(was, speciesId, `the species file for ${speciesId}`)
    /*
     * Every named constant whose value the edit did not change is written back
     * before the splice, so a file that read `pupil: PACK_PUPIL` still does and
     * its import is still read. See `withRestoredConstants` for why that is a
     * value comparison and not a cosmetic one.
     */
    const { literal: defLiteral, restored } = withRestoredConstants(
      before, sent, constantLookup(root, modulePath, was))
    const next = withUpdatedDefinition(was, speciesId, defLiteral)

    let movesNext = null
    if (moves !== undefined) {
      if (!exists(root, movesPath)) {
        throw new PushRefused(`${movesPath} is missing, so there is nowhere to record how ${speciesId} gets about. Nothing was written.`)
      }
      const movesWas = readText(root, movesPath)
      assertLf(movesPath, movesWas)
      movesNext = withMovesEntry(movesWas, speciesId, moves)
    }

    const wrote = []
    const skipped = []
    const note = (list, place, path, what) => { list.push({ place, path, what }) }

    if (next === null) {
      note(skipped, 1, modulePath, `the definition on disk is already exactly this one`)
    } else {
      writeText(root, modulePath, next)
      note(wrote, 1, modulePath,
        'the definition block, replaced in place — the doc comment, the imports and every '
        + 'derivation beside a number are exactly as they were')
    }

    /*
     * The species is already registered, already rostered and already signed
     * off, so the other places are not merely skipped — writing them would
     * DUPLICATE a record or overwrite a row a human owns. Said with the reason,
     * because "skipped" on its own reads like a bug.
     */
    note(skipped, 2, indexPath, `${speciesId} is already exported — an edit never adds a second line`)
    note(skipped, 3, collectionPath, `defineSpecies('${speciesId}') is already in the roster — an edit never adds a second record`)
    note(skipped, 4, collectionPath, "import '../parts/assembled' was written when this species was first pushed")
    note(skipped, 8, 'joe/names-audit.json', 'the name row is Joe\'s audited data, and an edit to the shape never rewrites it')
    note(skipped, 9, 'joe/species-facts.json', 'the fact is Joe\'s audited data, and an edit to the shape never rewrites it')

    if (moves !== undefined) {
      if (movesNext === null) note(skipped, 10, movesPath, `${speciesId} already carries this locomotion`)
      else { writeText(root, movesPath, movesNext); note(wrote, 10, movesPath, `moves: '${moves}'`) }
    }

    /*
     * What is left after the constants have been put back: names whose value
     * this edit really did change, or which were bound to an expression. Both
     * are genuinely dead now, and both live outside the definition block, so
     * they are named rather than deleted. See `staleBindings`.
     */
    const stale = next === null ? [] : staleBindings(next)
    const keptNote = restored.length === 0
      ? ''
      : ` ${restored.join(' and ')} still reads as ${restored.length === 1 ? 'a name' : 'names'} `
        + 'rather than as a number, because that value is the one it always was.'
    const staleNote = stale.length === 0
      ? ''
      : ` One thing is now yours: ${stale.join(', ')} in ${modulePath} is no longer read by `
        + 'anything — either the number it stood for is one you changed, or it was written as a '
        + 'derivation (`0.125 / 0.359219`) and the editor only ever sees the number that came out '
        + 'of it. Delete the line, and the note above it if that note is only about that number, '
        + 'or `npx tsc --noEmit` will point at it.'

    return {
      speciesId,
      collection,
      wrote,
      skipped,
      left: [],
      say: next === null
        ? `${speciesId} is already exactly this in the game — ${modulePath} did not need changing, `
          + 'so nothing was written.'
        : `${speciesId} is updated in the game: ${modulePath} now carries the definition you just `
          + 'edited, and every other byte of that file — the doc comment above it and the reasoning '
          + 'beside each number — is untouched. Nothing else was written, because the export line, '
          + 'the roster record and your two ledgers were all written when it was first pushed.'
          + keptNote + staleNote,
    }
  }

  if (alreadyBuilt && moves === undefined) {
    throw new PushRefused(
      `${modulePath} already exists, and this will not write over a species that is already built. `
      + 'Nothing was written. If you meant to replace it, delete it yourself first.')
  }

  if (alreadyBuilt) {
    if (!exists(root, movesPath)) {
      throw new PushRefused(`${movesPath} is missing, so there is nowhere to record how ${speciesId} gets about. Nothing was written.`)
    }
    const movesWas = readText(root, movesPath)
    assertLf(movesPath, movesWas)
    const movesNext = withMovesEntry(movesWas, speciesId, moves)

    const wrote = []
    const skipped = []
    const note = (list, place, path, what) => { list.push({ place, path, what }) }

    if (movesNext === null) {
      note(skipped, 10, movesPath, `${speciesId} already carries this locomotion`)
    } else {
      writeText(root, movesPath, movesNext)
      note(wrote, 10, movesPath, `moves: '${moves}'`)
    }
    /* Everything else about an already-built species is untouched, and said so
     * — a push that silently did nothing about the other nine places would
     * read as a bug rather than the deliberate refusal it is. */
    for (const [place, path] of [
      [1, modulePath], [2, indexPath], [3, collectionPath], [4, collectionPath],
      [8, 'joe/names-audit.json'], [9, 'joe/species-facts.json'],
    ]) {
      note(skipped, place, path, `${speciesId} is already built — an existing species is never written over`)
    }

    return {
      speciesId,
      collection,
      wrote,
      skipped,
      left: [],
      say: movesNext === null
        ? `${speciesId} is already built, and already carries this locomotion. Nothing was written.`
        : `${speciesId} is already built, so only the MOVES table was touched: it now reads '${moves}'. `
          + 'Nothing else about an existing species is ever written over.',
    }
  }

  if (!exists(root, collectionPath)) {
    throw new PushRefused(
      `there is no ${collectionPath}, so "${collection}" is a collection the game has not started yet. `
      + 'Nothing was written — a new collection is a file somebody writes on purpose, with its header.')
  }
  if (!exists(root, indexPath)) {
    throw new PushRefused(`${indexPath} is missing, so nothing can be exported. Nothing was written.`)
  }

  const indexWas = readText(root, indexPath)
  const collectionWas = readText(root, collectionPath)
  assertLf(indexPath, indexWas)
  assertLf(collectionPath, collectionWas)
  assertLf(modulePath, module)

  /*
   * The moves splice is prepared here, alongside index/collection, so a bad
   * value or a missing marker refuses BEFORE anything is written — same rule
   * as everything else in this plan.
   */
  let movesNext = null
  if (moves !== undefined) {
    if (!exists(root, movesPath)) {
      throw new PushRefused(`${movesPath} is missing, so there is nowhere to record how ${speciesId} gets about. Nothing was written.`)
    }
    const movesWas = readText(root, movesPath)
    assertLf(movesPath, movesWas)
    movesNext = withMovesEntry(movesWas, speciesId, moves)
  }

  /* ----------------------------------- the whole plan, built before any write --- */

  const indexNext = withExportLine(indexWas, exportName, speciesId)
  const withRec = withRecord(collectionWas, speciesId, record, after)
  const collectionNext = withAssembledImport(withRec ?? collectionWas, speciesId)

  /*
   * A hand-mangled ledger is a refusal with the file named, not a 500 with a
   * stack. `readJson` composes exactly that message and throws a plain Error;
   * unconverted it would reach `api.mjs`'s outer catch, which only knows how to
   * turn a `PushRefused` into something Joe can read.
   */
  const ledger = (rel, fallback) => {
    try { return readJson(root, rel, fallback) } catch (err) {
      throw new PushRefused(`${String(err?.message ?? err)} Nothing was written.`)
    }
  }

  const auditWas = ledger('joe/names-audit.json', { schemaVersion: 1, names: [] })
  const auditNext = withRow(auditWas, 'names', auditRow, 'id')

  const factsWas = ledger('joe/species-facts.json', null)
  const factsWithRow = factsWas === null ? null : withRow(factsWas, 'facts', factRow, 'speciesId')
  const factsCovered = withCoveredCollection(factsWithRow ?? factsWas, collection)
  const factsNext = factsCovered ?? factsWithRow

  /* ------------------------------------------------------------- the writes --- */

  const wrote = []
  const skipped = []
  const note = (list, place, path, what) => { list.push({ place, path, what }) }

  /* 1 FIRST, ALWAYS. The file exists before anything names it. */
  writeText(root, modulePath, module)
  note(wrote, 1, modulePath, 'the definition, as the editor left it')

  if (indexNext === null) note(skipped, 2, indexPath, 'the export line was already there')
  else { writeText(root, indexPath, indexNext); note(wrote, 2, indexPath, 'one export line, appended above the marker') }

  if (collectionNext !== null || withRec !== null) {
    writeText(root, collectionPath, collectionNext ?? withRec)
  }
  if (withRec === null) note(skipped, 3, collectionPath, `defineSpecies('${speciesId}') was already there`)
  else note(wrote, 3, collectionPath, 'the record, in roster order')
  if (collectionNext === null) note(skipped, 4, collectionPath, "import '../parts/assembled' was already there")
  else note(wrote, 4, collectionPath, "import '../parts/assembled' — the ninth place")

  if (auditNext === null) note(skipped, 8, 'joe/names-audit.json', 'a row for this species was already there')
  else { writeJson(root, 'joe/names-audit.json', auditNext); note(wrote, 8, 'joe/names-audit.json', 'one row: the name, the band and the collection') }

  /*
   * The fact and the collection CLAIM are two separate things that happen to
   * live in one file, and they are reported separately. Folding them said "one
   * fact written" on a push where the fact was already there and only the claim
   * was added — a line that reads like the sentence Joe just typed had landed
   * when it had not.
   */
  if (factsNext !== null) writeJson(root, 'joe/species-facts.json', factsNext)
  if (factsWas === null) {
    note(skipped, 9, 'joe/species-facts.json', 'that file is not in this tree, so there was nothing to append to')
  } else if (factsWithRow === null) {
    note(skipped, 9, 'joe/species-facts.json', 'a fact for this species was already there, and it was left exactly as its author wrote it')
  } else {
    note(wrote, 9, 'joe/species-facts.json', 'one fact, flagged until something checks it')
  }
  if (factsCovered !== null) {
    note(wrote, 9, 'joe/species-facts.json', `"${collection}" added to coveredCollections, so the fact gate covers it`)
  }

  if (moves !== undefined) {
    if (movesNext === null) note(skipped, 10, movesPath, `${speciesId} already carries this locomotion`)
    else { writeText(root, movesPath, movesNext); note(wrote, 10, movesPath, `moves: '${moves}'`) }
  }

  const left = whatIsLeft(speciesId, collection)
  /* Distinct PLACES, not lines: one file can carry two of the ten (the
   * collection holds both the record and the import), and one line is not a
   * place at all (the `coveredCollections` claim rides along with the fact). */
  const places = new Set(wrote.map(w => w.place)).size
  return {
    speciesId,
    collection,
    wrote,
    skipped,
    left,
    /*
     * Said out loud, every time. The species is in the game and the guards that
     * describe it are not written, so the suite is red until a human writes
     * them — which is the correct state to be in and a surprising one to
     * discover from a gate an hour later.
     */
    say: `${speciesId} is in the game. ${places} of the ten places written`
      + `${skipped.length ? `, ${skipped.length} already there` : ''}, and three plus the two shared `
      + 'counts are yours. `npm test` is RED until those are written, and that is on purpose.',
  }
}
