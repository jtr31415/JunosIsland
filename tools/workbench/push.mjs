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
 * ## A species costs NINE places, and this writes SIX of them
 *
 * `docs/handoffs/PB-036-goldfish-crocodile.md` counted them, and the count is
 * the whole design of this file. A push that did eight would leave a species
 * that builds as a bare hull; a push that CLAIMED nine and generated the three
 * it cannot honestly write would be worse, because a test that asserts whatever
 * the code currently does is not a test, it is a screenshot with a green tick.
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

  /*
   * THE ONE THAT MATTERS. The live twenty-four are frozen and the Garden
   * fourteen are Joe's approved work; a push that quietly wrote over
   * `animal-hedgehog.ts` because an id collided is unrecoverable in a way a
   * draft is not. There is deliberately no force flag: replacing a species is a
   * thing to do on purpose, in an editor, with git watching.
   */
  if (exists(root, modulePath)) {
    throw new PushRefused(
      `${modulePath} already exists, and this will not write over a species that is already built. `
      + 'Nothing was written. If you meant to replace it, delete it yourself first.')
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

  const left = whatIsLeft(speciesId, collection)
  /* Distinct PLACES, not lines: one file can carry two of the nine (the
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
    say: `${speciesId} is in the game. ${places} of the nine places written`
      + `${skipped.length ? `, ${skipped.length} already there` : ''}, and three plus the two shared `
      + 'counts are yours. `npm test` is RED until those are written, and that is on purpose.',
  }
}
