/**
 * One button turns a draft into a species, and this is what it may not get wrong.
 *
 * `tools/workbench/push.mjs` performs text surgery on files nobody can
 * regenerate: the assembled barrel, a collection's roster, and the two `joe/`
 * ledgers a human signs off in. The class of failure this file exists to catch is
 * a push that half-lands — a file written over, an export line naming a module
 * that is not there, a record spliced between the next animal's comment and the
 * next animal's own `defineSpecies` call so that fifteen lines about a terrapin
 * end up introducing a corn snake (which is the bug `edc6e48` had to go back and
 * fix by hand), or a second push duplicating everything the first one wrote.
 *
 * Everything in the first half talks HTTP to a spawned server against a THROWAWAY
 * root seeded here, exactly as `species-edits.test.ts` does, and every claim is
 * checked against the BYTES ON DISK rather than against the reply — a reply is
 * what the code says it did, and the whole risk of this module is the difference
 * between the two. The second half calls the text surgery directly, because the
 * refusals and the no-op returns are easier to state one function at a time.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * The workbench is plain ESM with no build step and no declarations, and
 * `tsconfig.json` does not turn on `allowJs`, so importing it from a `.ts` test
 * is an implicit `any` that `tsc --noEmit` refuses. Suppressed at the import
 * rather than papered over with a hand-written `.d.mts`, which would be a second
 * description of this module that could quietly stop matching it — the same
 * decision `voice-script.test.ts` records at its own imports.
 */
// @ts-expect-error — see above; `push.mjs` ships no types.
import { withExportLine, withRecord, withAssembledImport, withRow, assertLf, PushRefused } from '../../tools/workbench/push.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const INDEX = 'src/island/species/parts/assembled/index.ts'
const COLLECTION = 'src/island/species/collections/home-pets.ts'
const MODULE = 'src/island/species/parts/assembled/animal-corn-snake.ts'
const AUDIT = 'joe/names-audit.json'
const FACTS = 'joe/species-facts.json'

const SENTINEL = "/* -- append the next species' line directly above this one -- */"
const ASSEMBLED_IMPORT = "import '../parts/assembled'"
const EXPORT_LINE = "export { CORN_SNAKE_ASSEMBLY } from './animal-corn-snake'"

/*
 * Every fixture is built by joining lines rather than written as a template
 * literal, so that a checkout that ever handed this file to the runner with CRLF
 * in it would still send LF text — the module under test refuses a `\r` on
 * sight, and a fixture that could carry one would fail as a puzzle rather than as
 * a finding.
 */

/** `parts/assembled/index.ts`, cut down to the two things the push needs of it. */
const INDEX_TEXT = [
  '/**',
  ' * Every species the assembly kit can build — one line each, and nothing else.',
  ' *',
  ' * APPEND, do not sort: the list order is the order the approver bench shows.',
  ' */',
  "export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'",
  "export { GOLDFISH_ASSEMBLY } from './animal-goldfish'",
  SENTINEL,
  '',
  "import { assembledBuilds } from './register'",
  '',
  'export const ASSEMBLED_BUILDS = assembledBuilds()',
  '',
].join('\n')

/** Two members, each behind its own comment block, and no assembled import yet. */
const COLLECTION_TEXT = [
  '/**',
  ' * Home Pets — the animals a child might actually keep, as build data.',
  ' */',
  "import { defineSpecies } from '../define'",
  "import type { Species } from '../types'",
  '',
  'export const HOME_PETS_SPECIES: readonly Species[] = [',
  '  /*',
  '   * Hamster — the roundest thing in the collection.',
  '   *',
  '   * Short body, big head, legs almost absent: a Syrian hamster\'s belly touches',
  '   * the floor.',
  '   */',
  "  defineSpecies('animal-hamster', 'quadruped', {",
  "    build: { kit: 'quadruped', height: 1.45 },",
  '  }),',
  '',
  '  /*',
  '   * Terrapin — the shell does the work.',
  '   *',
  '   * Small head, legs near the floor, no ears, and a stub tail, so that nothing',
  '   * competes with the dome.',
  '   */',
  "  defineSpecies('animal-terrapin', 'quadruped', {",
  "    build: { kit: 'quadruped', height: 1.40 },",
  '  }),',
  ']',
  '',
].join('\n')

/** What the editor generates for the file: one const, defined through `defineCreature`. */
const MODULE_TEXT = [
  '/**',
  " * The corn snake — Home Pets' fifteenth, and its first legless member.",
  ' */',
  "import { defineCreature } from '../creature'",
  '',
  "export const CORN_SNAKE_ASSEMBLY = defineCreature('animal-corn-snake', {",
  '  parts: [],',
  '})',
  '',
].join('\n')

/** The record, comment block and all, exactly as `editor/push.ts` composes one. */
const RECORD_TEXT = [
  '  /*',
  '   * THE CORN SNAKE — the fifteenth, and the collection\'s first legless member.',
  '   *',
  '   * No `build` and no numbers here at all: `bespoke` sends it to the assembly',
  '   * kit, and `parts/assembled/animal-corn-snake.ts` carries every measurement.',
  '   */',
  "  defineSpecies('animal-corn-snake', 'bespoke'),",
].join('\n')

const AUDIT_ROW = {
  id: 'natural/animal-corn-snake',
  setId: 'natural',
  speciesId: 'animal-corn-snake',
  species: 'Corn snake',
  collection: 'home-pets',
  band: 'short',
  name: 'Rusty',
  verdict: '',
  replacement: '',
  note: '',
}

const FACT_ROW = {
  speciesId: 'animal-corn-snake',
  species: 'Corn snake',
  collection: 'home-pets',
  fact: 'A corn snake climbs by pressing its belly scales against bark.',
  check: 'flagged',
  source: '',
  sourceNote: 'unsourced',
  proposedRewrite: '',
  verdict: '',
  replacement: '',
  note: '',
}

/** One row already in each ledger, so "gained exactly one" is a claim about a count. */
const AUDIT_SEED = {
  schemaVersion: 1,
  names: [{ id: 'natural/animal-hamster', speciesId: 'animal-hamster', name: 'Nibbles', verdict: 'ok', note: '' }],
}
const FACTS_SEED = {
  schemaVersion: 1,
  coveredCollections: ['home-pets'],
  facts: [{ speciesId: 'animal-hamster', collection: 'home-pets', fact: "A Syrian hamster's tail is a nub.", check: 'verified' }],
}

interface Place { place: number, path: string, what: string }
interface Reply {
  speciesId?: string
  collection?: string
  wrote?: Place[]
  skipped?: Place[]
  left?: Place[]
  say?: string
  error?: string
}
interface Ledger { schemaVersion: number, names?: unknown[], facts?: unknown[], coveredCollections?: string[] }

let root: string
let child: ChildProcess
let base: string

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'species-push-'))
  child = spawn(process.execPath, [
    resolve(REPO, 'tools/workbench/server.mjs'), '--port', '0', '--root', root,
  ], { stdio: ['ignore', 'pipe', 'pipe'] })

  base = await new Promise<string>((ok, no) => {
    const timer = setTimeout(() => no(new Error('server never announced itself')), 15_000)
    child.stdout!.on('data', chunk => {
      const m = /WORKBENCH READY (\S+)/.exec(String(chunk))
      if (m) { clearTimeout(timer); ok(m[1]!) }
    })
    child.on('error', no)
  })
}, 20_000)

afterAll(() => {
  child?.kill()
  if (root) rmSync(root, { recursive: true, force: true })
})

const write = (rel: string, text: string) => {
  const p = join(root, rel)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, text)
}
const read = (rel: string) => readFileSync(join(root, rel), 'utf8')
const jsonAt = <T>(rel: string): T => JSON.parse(read(rel)) as T
const there = (rel: string) => existsSync(join(root, rel))
const lineOf = (text: string, needle: string) => text.split('\n').findIndex(l => l.includes(needle))

/**
 * The tree as a push finds it, rebuilt before every test.
 *
 * A push mutates four files and creates a fifth, so tests that shared a tree
 * would pass in the order they were written and stop meaning anything the day
 * one of them moved.
 */
const seedTree = () => {
  rmSync(join(root, 'src'), { recursive: true, force: true })
  write(INDEX, INDEX_TEXT)
  write(COLLECTION, COLLECTION_TEXT)
  write(AUDIT, JSON.stringify(AUDIT_SEED, null, 2) + '\n')
  write(FACTS, JSON.stringify(FACTS_SEED, null, 2) + '\n')
}
beforeEach(seedTree)

const push = async (body: unknown) => {
  const res = await fetch(base + '/api/species/push', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return { code: res.status, body: (await res.json()) as Reply }
}

const save = async (body: unknown) => {
  const res = await fetch(base + '/api/save', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return { code: res.status, body: (await res.json()) as Reply }
}

/** One good push, as the editor sends it, with anything overridden for a refusal test. */
const payload = (extra: Record<string, unknown> = {}) => ({
  speciesId: 'animal-corn-snake',
  collection: 'home-pets',
  exportName: 'CORN_SNAKE_ASSEMBLY',
  module: MODULE_TEXT,
  record: RECORD_TEXT,
  after: ['animal-terrapin'],
  auditRow: AUDIT_ROW,
  factRow: FACT_ROW,
  ...extra,
})

const places = (list: Place[] | undefined) => (list ?? []).map(p => p.place)

/** Nothing was written: the four files are as seeded and the fifth was never made. */
const treeIsUntouched = () => {
  expect(read(INDEX)).toBe(INDEX_TEXT)
  expect(read(COLLECTION)).toBe(COLLECTION_TEXT)
  expect(there(MODULE)).toBe(false)
  expect(jsonAt<Ledger>(AUDIT)).toEqual(AUDIT_SEED)
  expect(jsonAt<Ledger>(FACTS)).toEqual(FACTS_SEED)
}

describe('a push lands in six places, and says which three are still a human’s', () => {
  it('writes the file, the export line, the record, the import and both rows', async () => {
    const r = await push(payload())
    expect(r.code).toBe(200)
    expect(places(r.body.wrote)).toEqual([1, 2, 3, 4, 8, 9])
    expect(r.body.skipped).toEqual([])
    /* Three places plus the two shared counts — four entries, and every one of
     * them a thing only somebody who can say what it means may write. */
    expect(r.body.left).toHaveLength(4)
    expect((r.body.left ?? []).map(l => l.path)).toEqual([
      'tests/island/species-home-pets.test.ts',
      'tests/island/assembly-corn-snake.test.ts',
      'tests/island/assembly-fingerprint.test.ts',
      'tests/island/naming.test.ts and tests/island/species-registry.test.ts',
    ])
    /* Said out loud on a completely successful push, because a green tick that
     * hid it would leave him to find the red suite from a gate an hour later. */
    expect(r.body.say).toContain('RED')

    /* 1. The file, byte for byte as the editor left it. */
    expect(read(MODULE)).toBe(MODULE_TEXT)

    /* 2. The export line, immediately above the marker and nowhere else. */
    const index = read(INDEX).split('\n')
    const at = index.findIndex(l => l.trim() === SENTINEL)
    expect(at).toBeGreaterThan(0)
    expect(index[at - 1]?.trim()).toBe(EXPORT_LINE)
    expect(index.filter(l => l.trim() === EXPORT_LINE)).toHaveLength(1)
    /* The lines that were there keep their order — appended, never sorted. */
    expect(index.filter(l => l.startsWith('export {')).map(l => l.trim())).toEqual([
      "export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'",
      "export { GOLDFISH_ASSEMBLY } from './animal-goldfish'",
      EXPORT_LINE,
    ])

    /* 3 and 4. The record AND the ninth place, which is the easy one to miss. */
    const collection = read(COLLECTION)
    expect(collection).toContain("defineSpecies('animal-corn-snake', 'bespoke'),")
    expect(collection).toContain('THE CORN SNAKE')
    expect(collection.split('\n').filter(l => l.trim() === ASSEMBLED_IMPORT)).toHaveLength(1)
    expect(collection).toContain("import { defineSpecies } from '../define'")
    expect(collection).toContain('would find no assembly and would build as a bare hull')

    /* 8 and 9. One row each, appended, with what was already there untouched. */
    const audit = jsonAt<Ledger>(AUDIT)
    expect(audit.names).toHaveLength(2)
    expect(audit.names?.[0]).toEqual(AUDIT_SEED.names[0])
    expect(audit.names?.[1]).toEqual(AUDIT_ROW)
    const facts = jsonAt<Ledger>(FACTS)
    expect(facts.facts).toHaveLength(2)
    expect(facts.facts?.[0]).toEqual(FACTS_SEED.facts[0])
    expect(facts.facts?.[1]).toEqual(FACT_ROW)

    /* LF throughout, on Windows, always. */
    for (const rel of [MODULE, INDEX, COLLECTION, AUDIT, FACTS]) expect(read(rel)).not.toContain('\r')
  })

  it('puts the record in roster order, ABOVE the next member’s comment block', async () => {
    /* The bug `edc6e48` fixed by hand: inserting at the next member's
     * `defineSpecies(` line puts the new record between that member's comment and
     * the record it explains, so fifteen lines about a terrapin end up
     * introducing a corn snake. You insert at the top of whatever explains it. */
    expect((await push(payload())).code).toBe(200)

    const text = read(COLLECTION)
    const lines = text.split('\n')
    const hamster = lineOf(text, "defineSpecies('animal-hamster'")
    const ownComment = lineOf(text, 'THE CORN SNAKE')
    const record = lineOf(text, "defineSpecies('animal-corn-snake'")
    const terrapinComment = lineOf(text, 'Terrapin — the shell does the work')
    const terrapin = lineOf(text, "defineSpecies('animal-terrapin'")

    /* After the member before it, before the member after it. */
    expect(hamster).toBeLessThan(ownComment)
    expect(ownComment).toBeLessThan(record)
    expect(record).toBeLessThan(terrapinComment)
    expect(terrapinComment).toBeLessThan(terrapin)

    /* And precisely: the `/*` that OPENS the terrapin's block is still below the
     * whole new record, which is the half the hand-fix had to correct. */
    const opener = lines.findIndex((l, i) => i > record && i < terrapin && l.trim() === '/*')
    expect(opener).toBeGreaterThan(record)
    expect(opener).toBeLessThan(terrapinComment)
    /* The terrapin's own comment still leads to the terrapin's own record, with
     * nothing of anybody else's between them. */
    expect(lines.slice(terrapinComment, terrapin).join('\n')).not.toContain('corn-snake')
  })
})

describe('a species that is already built is never written over', () => {
  it('refuses when the module file exists, and leaves it byte for byte', async () => {
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    const built = [
      '/** The animal that is already in the game, and Joe has approved it. */',
      "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })",
      '',
    ].join('\n')
    write(rel, built)

    const r = await push(payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'",
        '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: ['something else'] })",
        '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      /* The rows have to be this species' own — the route cross-checks them
       * against the id, the same way it cross-checks the module and the record,
       * because a row filed under the wrong species consumes that species' one
       * slot and its real row can never be appended afterwards. */
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
    }))

    expect(r.code).toBe(400)
    expect(r.body.error).toContain(rel)
    /* The whole of the point: the built species is exactly as it was. There is
     * deliberately no force flag — replacing one is a thing to do on purpose. */
    expect(read(rel)).toBe(built)
    /* And nothing else was written either, which is what "nothing was written"
     * has to mean if the message is to be worth anything. */
    expect(read(INDEX)).toBe(INDEX_TEXT)
    expect(read(INDEX)).toContain(SENTINEL)
    expect(read(COLLECTION)).toBe(COLLECTION_TEXT)
    expect(jsonAt<Ledger>(AUDIT)).toEqual(AUDIT_SEED)
    expect(jsonAt<Ledger>(FACTS)).toEqual(FACTS_SEED)
  })
})

describe('what it refuses, by name, before it has written anything', () => {
  it('refuses a collection the game has not started yet', async () => {
    const r = await push(payload({ collection: 'aquarium' }))
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('src/island/species/collections/aquarium.ts')
    expect(there('src/island/species/collections/aquarium.ts')).toBe(false)
    treeIsUntouched()
  })

  it('refuses a species id that is not shaped like animal-corn-snake', async () => {
    for (const speciesId of ['../../etc/passwd', 'Animal_X', 'animal corn snake', '']) {
      const r = await push(payload({ speciesId }))
      expect(r.code, `${speciesId} was accepted`).toBe(400)
      expect(r.body.error).toContain('animal-corn-snake')
      treeIsUntouched()
    }
    /* An id is a file name as well as an id, so a traversal is refused as a
     * SHAPE and never reaches a path at all. */
    expect(there('src/island/species/parts/assembled/passwd.ts')).toBe(false)
  })

  it('refuses an export name that is not an assembly constant', async () => {
    for (const exportName of ['CORN_SNAKE', 'cornSnakeAssembly', 'CORN_SNAKE_ASSEMBLY_2']) {
      const r = await push(payload({ exportName }))
      expect(r.code, `${exportName} was accepted`).toBe(400)
      expect(r.body.error).toContain(exportName)
      expect(r.body.error).toContain('_ASSEMBLY')
      treeIsUntouched()
    }
  })

  it('refuses a module that defines some other animal', async () => {
    /* A mislabelled payload otherwise writes one animal's definition into another
     * animal's file, under the first animal's id, and everything downstream
     * agrees with it. */
    const r = await push(payload({
      module: [
        "import { defineCreature } from '../creature'",
        '',
        "export const CORN_SNAKE_ASSEMBLY = defineCreature('animal-terrapin', { parts: [] })",
        '',
      ].join('\n'),
    }))
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('animal-corn-snake')
    expect(r.body.error).toContain('defineCreature')
    treeIsUntouched()
  })

  /*
   * The two ledgers are Joe's sign-off files, and a row filed under the wrong id
   * is worse than one filed nowhere: it CONSUMES that species' one slot, so the
   * duplicate guard then reports the real row as "already there" and it can never
   * be appended. An absent row is worse still — it appended a bare `{}` and the
   * reply called it a fact written.
   */
  it('refuses a name row that is not this species’', async () => {
    const r = await push(payload({ auditRow: { id: 'natural/animal-terrapin', speciesId: 'animal-terrapin' } }))
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('animal-corn-snake')
    treeIsUntouched()
  })

  it('refuses a fact row that is not this species’, and a missing one', async () => {
    const wrong = await push(payload({ factRow: { speciesId: 'animal-terrapin', fact: 'A fact.' } }))
    expect(wrong.code).toBe(400)
    expect(wrong.body.error).toContain('animal-corn-snake')
    treeIsUntouched()

    const missing = await push(payload({ factRow: undefined }))
    expect(missing.code).toBe(400)
    treeIsUntouched()
  })

  it('did not widen the jail while adding a route that writes source files', async () => {
    const r = await push(payload({ collection: '../../../../etc' }))
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('not a collection id')
    /* Nothing appeared anywhere the derived path could have reached — inside the
     * root, beside it, or in the collections folder itself. */
    expect(there('etc.ts')).toBe(false)
    expect(existsSync(resolve(root, '../etc.ts'))).toBe(false)
    expect(readdirSync(join(root, 'src/island/species/collections'))).toEqual(['home-pets.ts'])
    treeIsUntouched()
  })
})

describe('a push run twice finishes the job rather than doubling it', () => {
  it('reports the line, the record, the import and both rows as skipped', async () => {
    expect((await push(payload())).code).toBe(200)

    /* The half-landed case as it really happens: somebody deletes the module and
     * pushes again, so everything EXCEPT the file is already where it goes. */
    rmSync(join(root, MODULE))
    const again = await push(payload())

    expect(again.code).toBe(200)
    expect(places(again.body.wrote)).toEqual([1])
    expect(places(again.body.skipped)).toEqual([2, 3, 4, 8, 9])
    expect((again.body.skipped ?? []).map(s => s.what).join(' | ')).toContain('already there')

    /* And the disk agrees: one of everything. */
    expect(read(MODULE)).toBe(MODULE_TEXT)
    const index = read(INDEX).split('\n')
    expect(index.filter(l => l.trim() === EXPORT_LINE)).toHaveLength(1)
    const collection = read(COLLECTION).split('\n')
    expect(collection.filter(l => l.includes("defineSpecies('animal-corn-snake'"))).toHaveLength(1)
    expect(collection.filter(l => l.trim() === ASSEMBLED_IMPORT)).toHaveLength(1)
    expect(collection.filter(l => l.includes('THE CORN SNAKE'))).toHaveLength(1)
    expect(jsonAt<Ledger>(AUDIT).names).toHaveLength(2)
    expect(jsonAt<Ledger>(FACTS).facts).toHaveLength(2)
  })
})

describe('the facts file has one author, and this route did not become a second', () => {
  it('still answers 400 for `what: facts` on /api/save, before and after a push', async () => {
    /* The invariant `workbench.test.ts` bought: `joe/species-facts.json` is
     * absent from `WRITABLE`, so `/api/save` cannot reach it and the drafting
     * agent has nothing to collide with. A push APPENDS a row it owns; it is not
     * `/api/save` and it must not have opened one. */
    const before = await save({ what: 'facts', value: { facts: [] } })
    expect(before.code).toBe(400)
    expect(before.body.error).toContain('not a writable file')
    expect(jsonAt<Ledger>(FACTS)).toEqual(FACTS_SEED)

    expect((await push(payload())).code).toBe(200)
    const after = await save({ what: 'facts', value: { facts: [] } })
    expect(after.code).toBe(400)
    expect(after.body.error).toContain('not a writable file')
    /* Still the seeded fact plus the pushed one, and no `joe/facts` conjured up. */
    expect(jsonAt<Ledger>(FACTS).facts).toHaveLength(2)
    expect(there('joe/facts')).toBe(false)
    expect(there('joe/facts.json')).toBe(false)
  })

  it('claims the collection it is about to file a fact under', async () => {
    /* `tests/island/species-facts.test.ts` asserts coverage only within
     * `coveredCollections` — a fact filed under a collection the file does not
     * claim goes red as "files every fact under a collection it claims to
     * cover". So the claim is added with the fact, in the same write. */
    write(FACTS, JSON.stringify({ ...FACTS_SEED, coveredCollections: ['garden'] }, null, 2) + '\n')

    const r = await push(payload())
    expect(r.code).toBe(200)
    expect(jsonAt<Ledger>(FACTS).coveredCollections).toEqual(['garden', 'home-pets'])
    /* And the reply says it did, because a list Joe curates growing by itself is
     * a thing he should read rather than discover. It is reported as its OWN
     * line rather than folded into the fact's: the two happen to share a file
     * and are not the same event, and folding them once produced "one fact
     * written" on a push where only the claim was added. */
    const ninth = (r.body.wrote ?? []).filter(w => w.place === 9)
    expect(ninth.some(w => w.what.includes('one fact'))).toBe(true)
    expect(ninth.some(w => w.what.includes('coveredCollections'))).toBe(true)
  })

  /*
   * The case that made the two lines separate. The facts agent has already filed
   * this species' sentence, and the push adds only the collection claim — so the
   * reply must not say a fact was written, because the sentence Joe just typed
   * was NOT the one on disk and was not taken.
   */
  it('does not claim to have written a fact when only the claim was added', async () => {
    write(FACTS, JSON.stringify({
      ...FACTS_SEED,
      coveredCollections: ['garden'],
      facts: [...FACTS_SEED.facts, { ...FACT_ROW, fact: 'Something the fact agent wrote.' }],
    }, null, 2) + '\n')

    const r = await push(payload())
    expect(r.code).toBe(200)
    const ninth = (r.body.wrote ?? []).filter(w => w.place === 9)
    expect(ninth.some(w => w.what.includes('one fact'))).toBe(false)
    expect(ninth.some(w => w.what.includes('coveredCollections'))).toBe(true)
    /* And the author's sentence is exactly as they left it. */
    const rows = jsonAt<Ledger>(FACTS).facts as { speciesId: string; fact: string }[]
    expect(rows.filter(f => f.speciesId === FACT_ROW.speciesId)).toHaveLength(1)
    expect(rows.find(f => f.speciesId === FACT_ROW.speciesId)?.fact)
      .toBe('Something the fact agent wrote.')
    expect((r.body.skipped ?? []).some(s => s.place === 9)).toBe(true)
  })

  it('never claims a collection twice', async () => {
    /* The seed already claims `home-pets`, so there is nothing to add and the
     * list must come back exactly as its author left it. */
    const r = await push(payload())
    expect(r.code).toBe(200)
    expect(jsonAt<Ledger>(FACTS).coveredCollections).toEqual(['home-pets'])
    const ninth = (r.body.wrote ?? []).find(w => w.place === 9)
    expect(ninth?.what).not.toContain('coveredCollections')
  })
})

/**
 * The surgery on its own.
 *
 * Each of these returns `null` for "already done" rather than throwing, which is
 * what makes a re-run of a half-landed push finish the job instead of refusing
 * it; and each throws `PushRefused` when the file is not the shape it expected,
 * which is what stops a guess being spliced into a file nobody can regenerate.
 */
describe('the text surgery, one function at a time', () => {
  it('withExportLine: null when the line is there, and a refusal with no marker', () => {
    const source = [
      "export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'",
      SENTINEL,
      '',
    ].join('\n')

    const next = withExportLine(source, 'CORN_SNAKE_ASSEMBLY', 'animal-corn-snake') as string
    expect(next.split('\n')[1]).toBe(EXPORT_LINE)
    expect(next.split('\n')[2]).toBe(SENTINEL)
    /* Idempotent by design: a second pass over its own output is a no-op. */
    expect(withExportLine(next, 'CORN_SNAKE_ASSEMBLY', 'animal-corn-snake')).toBeNull()

    /* Reworded marker: it refuses rather than guessing where the list ends,
     * because appending to the wrong place in that file is how the viewer went
     * blank on 29 July. */
    const reworded = "export { HEDGEHOG_ASSEMBLY } from './animal-hedgehog'\n/* add the next one here */\n"
    expect(() => withExportLine(reworded, 'CORN_SNAKE_ASSEMBLY', 'animal-corn-snake')).toThrow(PushRefused)
    expect(() => withExportLine(reworded, 'CORN_SNAKE_ASSEMBLY', 'animal-corn-snake'))
      .toThrow(/Nothing was written/)
  })

  it('withRecord: null when the record is there, and last when no member follows', () => {
    expect(withRecord(COLLECTION_TEXT, 'animal-hamster', "  defineSpecies('animal-hamster', 'x'),", []))
      .toBeNull()

    /* Nothing in `after` is in the file, so the record goes above the array's own
     * closing bracket — last, which is where a new final member belongs. */
    const next = withRecord(COLLECTION_TEXT, 'animal-corn-snake', RECORD_TEXT, ['animal-goldfish']) as string
    const lines = next.split('\n')
    const record = lines.findIndex(l => l.includes("defineSpecies('animal-corn-snake'"))
    const terrapin = lines.findIndex(l => l.includes("defineSpecies('animal-terrapin'"))
    const bracket = lines.findIndex(l => l.trim() === ']')
    expect(terrapin).toBeLessThan(record)
    expect(record).toBeLessThan(bracket)
    /* Its own comment came with it, above its own call and below the terrapin's. */
    expect(lines.findIndex(l => l.includes('THE CORN SNAKE'))).toBeGreaterThan(terrapin)
  })

  it('withAssembledImport: null when the ninth place is already taken', () => {
    const next = withAssembledImport(COLLECTION_TEXT, 'animal-corn-snake') as string
    expect(next.split('\n').filter(l => l.trim() === ASSEMBLED_IMPORT)).toHaveLength(1)
    expect(next).toContain('would find no assembly and would build as a bare hull')
    expect(withAssembledImport(next, 'animal-corn-snake')).toBeNull()
  })

  it('withRow: null on a key already present, and the input is never mutated', () => {
    const doc = { schemaVersion: 1, names: [{ id: 'natural/animal-hamster', verdict: 'ok' }] }
    const was = JSON.stringify(doc)

    const next = withRow(doc, 'names', { id: 'natural/animal-corn-snake', verdict: '' }, 'id') as
      { names: { id: string }[] }
    expect(next.names).toHaveLength(2)
    expect(next.names[1]?.id).toBe('natural/animal-corn-snake')
    /* The row that was there is the object it was, not a copy of the payload's
     * idea of it — a row that exists is left exactly as its author left it. */
    expect(withRow(doc, 'names', { id: 'natural/animal-hamster', verdict: 'reject' }, 'id')).toBeNull()
    expect(JSON.stringify(doc)).toBe(was)

    /* And a file whose list is not a list is a refusal, not a silent new key. */
    expect(() => withRow({ schemaVersion: 1 }, 'names', { id: 'a' }, 'id')).toThrow(PushRefused)
  })

  it('assertLf: a single carriage return is enough to refuse the whole push', () => {
    expect(() => assertLf(INDEX, 'one line\r\ntwo lines\n')).toThrow(PushRefused)
    expect(() => assertLf(INDEX, 'one line\r\ntwo lines\n')).toThrow(/CRLF/)
    expect(() => assertLf(INDEX, INDEX_TEXT)).not.toThrow()
  })
})
