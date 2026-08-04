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
import { withExportLine, withRecord, withAssembledImport, withRow, withMovesEntry, withUpdatedDefinition, withRestoredConstants, definitionLiteral, staleBindings, assertLf, PushRefused, LOCOMOTIONS as PUSH_LOCOMOTIONS } from '../../tools/workbench/push.mjs'
import { LOCOMOTIONS } from '../../src/island/species/moves'
import { defToModuleSource } from '../../tools/workbench/public/editor/def'
import { pushOutcome, signoffPatch, speciesModulePath } from '../../tools/workbench/public/editor/push'
import { APPROVED } from '../../tools/workbench/public/approver'
import { SIGNED_OFF as LIST_SIGNED_OFF, signedOff } from '../../tools/workbench/public/editor/status'
import { SIGNED_OFF, MIRROR, signedOffFrom } from '../../tools/species/signoffs.mjs'
import type { CreatureDef } from '../../src/island/species/parts'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const INDEX = 'src/island/species/parts/assembled/index.ts'
const COLLECTION = 'src/island/species/collections/home-pets.ts'
const MODULE = 'src/island/species/parts/assembled/animal-corn-snake.ts'
const AUDIT = 'joe/names-audit.json'
const FACTS = 'joe/species-facts.json'
const MOVES = 'src/island/species/moves.ts'

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

/** `src/island/species/moves.ts`, cut down to the table the push edits. */
const MOVES_TEXT = [
  '/* >>> WORKBENCH-OWNED TABLE — entries below are written by tools/workbench/push.mjs.',
  " * Keep one `'id': 'value',` per line, sorted, and keep these two markers. */",
  'export const MOVES: Readonly<Record<string, Locomotion>> = {',
  "  'animal-bee': 'air',",
  "  'animal-parrot': 'air',",
  '}',
  '/* <<< WORKBENCH-OWNED TABLE */',
  '',
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
  write(MOVES, MOVES_TEXT)
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

  /*
   * THE WHOLE REASON `moves` DOES NOT LIVE ON THE `defineSpecies` RECORD. Thirty
   * species are already built, and they are exactly the ones Joe needs to rule
   * on — `moves.ts`'s own header makes the argument in full. So a push naming an
   * already-built species is refused for everything EXCEPT this one field.
   */
  it('an already-built species accepts a moves-only push, and touches nothing else', async () => {
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
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    }))

    expect(r.code).toBe(200)
    expect(places(r.body.wrote)).toEqual([10])
    expect(places(r.body.skipped)).toEqual([1, 2, 3, 4, 8, 9])

    /* The one thing that landed. */
    expect(read(MOVES)).toContain("'animal-x': 'air',")
    /* Nothing else about the already-built species moved at all — the module
     * text sent along for the ride is not even the same as what is on disk,
     * and it stays that way. */
    expect(read(rel)).toBe(built)
    expect(read(INDEX)).toBe(INDEX_TEXT)
    expect(read(COLLECTION)).toBe(COLLECTION_TEXT)
    expect(jsonAt<Ledger>(AUDIT)).toEqual(AUDIT_SEED)
    expect(jsonAt<Ledger>(FACTS)).toEqual(FACTS_SEED)
  })

  it('a second moves-only push of the same value is "already there", and writes nothing at all', async () => {
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    write(rel, "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")

    const body = payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    })
    expect((await push(body)).code).toBe(200)
    const settled = read(MOVES)

    const again = await push(body)
    expect(again.code).toBe(200)
    expect(places(again.body.wrote)).toEqual([])
    expect(places(again.body.skipped).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 8, 9, 10])
    expect(read(MOVES)).toBe(settled)
  })
})

/**
 * **THE EDIT. Joe opens a shipped animal, changes it, and presses the button.**
 *
 * 2 August: nothing reached `src/`. Every one of the thirty species is already
 * built, and a built species was never written over, so place 1 — the file that
 * IS the animal — was skipped on every push he made. `replace` is the explicit
 * intent that opens the door, and it opens it exactly here and nowhere else.
 *
 * **What this file is really guarding is the 236 lines it does NOT write.**
 * `defToModuleSource`'s output is byte-identical to 0 of the 30 shipped files:
 * the generator writes an eleven-line placeholder doc comment where the real
 * files carry their derivations. `animal-hedgehog.ts` is 286 lines on disk
 * against 50 emitted, and the difference includes a `flag` ruling in Joe's own
 * words. So an update SPLICES — the definition literal is replaced and every
 * byte outside it is carried over — and the assertions below are on the bytes.
 *
 * The species here is SYNTHETIC on purpose. Nothing in this file may pin a real
 * animal to a part, a colour or a coordinate: Joe edits those deliberately, and
 * a test asserting what the hedgehog's nose is would lock him out of his own
 * editor the first time he changed it.
 */
describe('an edit of a built species replaces its definition and nothing else', () => {
  const BUILT_REL = 'src/island/species/parts/assembled/animal-x.ts'

  /** The prose above the definition — the thing the whole splice exists to keep. */
  const HEADER = [
    '/**',
    ' * THE FIXTURE ANIMAL, and this paragraph is what a regeneration would delete.',
    ' *',
    ' * Two hundred and thirty-six lines of exactly this kind of reasoning sit above',
    " * the hedgehog's definition, including a flag ruling in Joe's own words and the",
    ' * whole argument for why its spikes are one shape and not another. A generator',
    ' * cannot write a line of it and must never be allowed to write over it.',
    ' */',
    "import { defineCreature } from '../creature'",
    '',
  ].join('\n')

  /** The block that IS replaced, comment and all. */
  const DEFINITION = [
    "export const X_ASSEMBLY = defineCreature('animal-x', {",
    '  palette: {',
    '    coat: 0x111111,',
    '  },',
    '',
    '  /* A derivation INSIDE the block. This one goes, and that is the point. */',
    "  snout: { part: 'cone-06' },",
    '})',
  ].join('\n')

  /** Anything after the call survives too, trailing newline included. */
  const TAIL = [
    '',
    '/* THE TRAILING LINE — everything below the definition is carried over as well. */',
    '',
  ].join('\n')

  const BUILT = HEADER + DEFINITION + TAIL

  /*
   * A real `CreatureDef` through the REAL generator, so the test covers the path
   * the editor takes rather than a hand-typed guess at what it sends.
   */
  const EDITED: CreatureDef = {
    palette: { coat: 0x224466, belly: 0xeeeeee },
    snout: { part: 'cone-06', at: [0, 0.5, 0.625] },
  }

  /** The editor's payload for an edit of `animal-x`. */
  const editPayload = (extra: Record<string, unknown> = {}) => payload({
    speciesId: 'animal-x',
    exportName: 'X_ASSEMBLY',
    module: defToModuleSource('animal-x', EDITED),
    record: "  defineSpecies('animal-x', 'bespoke'),",
    after: [],
    auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
    factRow: { ...FACT_ROW, speciesId: 'animal-x' },
    replace: true,
    ...extra,
  })

  it('writes the module and reports place 1, which is the only success there is', async () => {
    write(BUILT_REL, BUILT)
    const r = await push(editPayload())

    expect(r.code).toBe(200)
    /* The client judges a push solely by this — see `pushOutcome` in `push.ts`. */
    expect(places(r.body.wrote)).toContain(1)
    expect((r.body.wrote ?? []).find(w => w.place === 1)?.path).toBe(BUILT_REL)
    const out = pushOutcome(r.body, 'animal-x')
    expect(out.ok).toBe(true)
    expect(out.sayText).toContain('is in the game')

    /* The five places an edit must NOT touch, every one of them said out loud. */
    expect(places(r.body.skipped)).toEqual([2, 3, 4, 8, 9])
    expect(r.body.say).toContain(BUILT_REL)
  })

  /**
   * **The assertion that protects the hedgehog's 236 lines.**
   *
   * Not "the comment is still somewhere in the file" — the header and the tail
   * are compared as BYTE PREFIXES AND SUFFIXES, so a splice that reflowed one
   * line of prose, dropped the blank line before the call, or ate the trailing
   * newline fails here.
   */
  it('leaves every byte outside the definition block exactly as it was', async () => {
    write(BUILT_REL, BUILT)
    expect((await push(editPayload())).code).toBe(200)

    const after = read(BUILT_REL)
    expect(after.startsWith(HEADER)).toBe(true)
    expect(after.endsWith(TAIL)).toBe(true)
    /* And spelled out, in case a future prefix check goes soft: the sentences
     * themselves, verbatim, and the const line the file already had. */
    expect(after).toContain("the hedgehog's definition, including a flag ruling in Joe's own words")
    expect(after).toContain('/* THE TRAILING LINE — everything below the definition is carried over as well. */')
    expect(after).toContain("export const X_ASSEMBLY = defineCreature('animal-x', {")

    /* The generator's placeholder header never reaches the file — that is the
     * eleven lines that would have stood where the reasoning is. */
    expect(after).not.toContain('Written out of the species editor')
    /* One animal in the file, still. */
    expect(after.split("defineCreature('animal-x'")).toHaveLength(2)
    expect(after).not.toContain('\r')
  })

  it('actually changes the edited field, and drops what the definition no longer says', async () => {
    write(BUILT_REL, BUILT)
    expect((await push(editPayload())).code).toBe(200)

    const after = read(BUILT_REL)
    /* The new definition landed... */
    expect(after).toContain('0x224466')
    expect(after).toContain('belly')
    /* ...and the old one is gone, including its own inside-the-block comment,
     * which is the half of "replace" that a merge would get wrong. */
    expect(after).not.toContain('0x111111')
    expect(after).not.toContain('A derivation INSIDE the block')
  })

  it('leaves the barrel, the roster and both of Joe’s ledgers alone', async () => {
    write(BUILT_REL, BUILT)
    expect((await push(editPayload())).code).toBe(200)

    expect(read(INDEX)).toBe(INDEX_TEXT)
    expect(read(COLLECTION)).toBe(COLLECTION_TEXT)
    expect(jsonAt<Ledger>(AUDIT)).toEqual(AUDIT_SEED)
    expect(jsonAt<Ledger>(FACTS)).toEqual(FACTS_SEED)
  })

  it('says so honestly when the definition on disk is already exactly this one', async () => {
    write(BUILT_REL, BUILT)
    expect((await push(editPayload())).code).toBe(200)
    const settled = read(BUILT_REL)

    const again = await push(editPayload())
    expect(again.code).toBe(200)
    expect(places(again.body.wrote)).toEqual([])
    expect(places(again.body.skipped)).toContain(1)
    expect(again.body.say).toContain('already exactly this')
    expect(read(BUILT_REL)).toBe(settled)
    /* And the page calls that what it is: nothing changed. */
    expect(pushOutcome(again.body, 'animal-x').ok).toBe(false)
  })

  it('still rules on locomotion in the same push', async () => {
    write(BUILT_REL, BUILT)
    const r = await push(editPayload({ moves: 'land' }))
    expect(r.code).toBe(200)
    expect(places(r.body.wrote).sort((a, b) => a - b)).toEqual([1, 10])
    expect(read(MOVES)).toContain("'animal-x': 'land',")
  })

  /**
   * THE GUARD, PINNED. `replace` opens the door for an editor that says it is
   * editing; it may never open for a payload that did not. A NEW species whose
   * id happens to collide with a built one is the case the refusal exists for,
   * and it gets the same sentence it always got.
   */
  it('refuses, word for word, when the request did not say it was an edit', async () => {
    for (const extra of [{}, { replace: false }, { replace: 'yes' }, { replace: 1 }]) {
      write(BUILT_REL, BUILT)
      const r = await push(editPayload({ replace: undefined, ...extra }))
      expect(r.code, JSON.stringify(extra)).toBe(400)
      expect(r.body.error).toBe(
        `${BUILT_REL} already exists, and this will not write over a species that is already built. `
        + 'Nothing was written. If you meant to replace it, delete it yourself first.')
      /* And the animal is untouched, which is the whole value of the refusal. */
      expect(read(BUILT_REL)).toBe(BUILT)
    }
  })

  it('is not consulted at all when the species is not built yet', async () => {
    /* `!alreadyBuilt` is unchanged behaviour whatever `replace` says: a create
     * is a create, and it writes all six places off the same code as before. */
    const r = await push(payload({ replace: true }))
    expect(r.code).toBe(200)
    expect(places(r.body.wrote)).toEqual([1, 2, 3, 4, 8, 9])
    expect(read(MODULE)).toBe(MODULE_TEXT)
  })

  /**
   * **The named constant, end to end — the button may not hand back a build error.**
   *
   * All thirty shipped species import a constant and write it into their
   * palette; the editor only ever sees the number it evaluated to. A splice that
   * wrote the number back would leave an import nothing reads, and
   * `noUnusedLocals` would fail `npx tsc --noEmit` on every update Joe made.
   *
   * The constant's value here is DELIBERATELY NOT the real one. `push.mjs` reads
   * the declaration out of the repo at push time, so a fixture that declares a
   * different number is the assertion that nothing is hardcoded: a hardcoded
   * `0x4c4f5e` fails every test below.
   */
  describe('a constant whose value did not change is written back as a name', () => {
    const TEXTURE = 'src/island/species/parts/texture.ts'
    const FIXTURE_PUPIL = 0x123456

    const NAMED = [
      '/**',
      ' * THE FIXTURE ANIMAL, whose palette is written with a name and not a number.',
      ' */',
      "import { defineCreature } from '../creature'",
      "import { PACK_PUPIL } from '../texture'",
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', {",
      '  palette: {',
      '    coat: 0x111111,',
      '    pupil: PACK_PUPIL,',
      '  },',
      '})',
    ].join('\n') + TAIL

    const withPupil = (pupil: number): CreatureDef => ({ palette: { coat: 0x224466, pupil } })

    const seedNamed = () => {
      write(TEXTURE, `export const PACK_PUPIL = 0x123456\n`)
      write(BUILT_REL, NAMED)
    }

    /* The definition region only, from the CALL and not from the import of
     * `defineCreature` above it — the import line always says the name, so a
     * slice that started too early would make "not to contain" meaningless. */
    const definitionOf = (text: string) => text.slice(text.indexOf("defineCreature('animal-x'"))

    it('keeps the identifier when the colour is the one it always was', async () => {
      seedNamed()
      const r = await push(editPayload({ module: defToModuleSource('animal-x', withPupil(FIXTURE_PUPIL)) }))
      expect(r.code).toBe(200)

      const after = read(BUILT_REL)
      /* The name is back in the definition, and the number never landed. */
      expect(definitionOf(after)).toContain('pupil: PACK_PUPIL')
      expect(definitionOf(after)).not.toContain('0x123456')
      /* The rest of the edit still landed — this is a restore, not a revert. */
      expect(definitionOf(after)).toContain('0x224466')
      expect(r.body.say).toContain('PACK_PUPIL still reads as a name')
      expect(r.body.say).not.toContain('no longer read')
    })

    /**
     * THE ONE THAT KEEPS `npx tsc --noEmit` GREEN, stated as the condition tsc
     * actually applies: after the update, nothing the file declares or imports
     * is left unread. That is `noUnusedLocals` in one line.
     */
    it('leaves no unread import behind, which is what noUnusedLocals checks', async () => {
      seedNamed()
      expect((await push(editPayload({ module: defToModuleSource('animal-x', withPupil(FIXTURE_PUPIL)) }))).code)
        .toBe(200)
      expect(staleBindings(read(BUILT_REL))).toEqual([])
      /* And the import line itself is untouched, because it is outside the block. */
      expect(read(BUILT_REL)).toContain("import { PACK_PUPIL } from '../texture'")
    })

    it('keeps Joe’s own colour, and says the name is dead, when he really changed it', async () => {
      seedNamed()
      const r = await push(editPayload({ module: defToModuleSource('animal-x', withPupil(0x00ff00)) }))
      expect(r.code).toBe(200)

      const after = read(BUILT_REL)
      /* His number, exactly as he chose it — never substituted back. */
      expect(definitionOf(after)).toContain('0x00ff00')
      expect(definitionOf(after)).not.toContain('PACK_PUPIL')
      /* And now the import really is dead, which is the case where saying so is
       * the correct answer rather than a nuisance. */
      /* AND IT IS CUT, since 4 August — Joe: *"they should turn from the editor
       * into code pretty much the instant i press the button."* The push used to
       * name the dead binding and leave the deletion to him, which is how one
       * afternoon's pushing left 39 orphans and a build that would not compile. */
      expect(staleBindings(after)).toEqual([])
      expect(after).not.toContain("import { PACK_PUPIL }")
      expect(r.body.say).toContain('PACK_PUPIL')
      expect(r.body.say).toContain('removed for you')
    })

    it('does not substitute when the constant cannot be read at all', async () => {
      /* No `texture.ts` in this tree: the value is unknown, so the hex stays and
       * the reply says the name is dead. A wrong substitution would change an
       * animal's colour, which is far worse than an unused import. */
      write(BUILT_REL, NAMED)
      const r = await push(editPayload({ module: defToModuleSource('animal-x', withPupil(FIXTURE_PUPIL)) }))
      expect(r.code).toBe(200)
      expect(definitionOf(read(BUILT_REL))).toContain('0x123456')
      expect(r.body.say).toContain('removed for you')
    })
  })
})

/**
 * The splicer on its own — the two ways it is allowed to fail.
 *
 * A wrong splice corrupts an animal nobody can regenerate; a refusal is merely
 * annoying. So every case it cannot read exactly is a `PushRefused` and never a
 * best guess.
 */
describe('withUpdatedDefinition: replaces one literal, or refuses to touch the file', () => {
  const file = (body: string) => [
    '/** Kept. */',
    "import { defineCreature } from '../creature'",
    '',
    body,
    '',
    '/* Kept too. */',
    '',
  ].join('\n')

  const ONE = file("export const X_ASSEMBLY = defineCreature('animal-x', { palette: { coat: 0x111111 } })")
  const NEXT = '{ palette: { coat: 0x222222 } }'

  it('replaces the literal and keeps the prose on both sides', () => {
    const next = withUpdatedDefinition(ONE, 'animal-x', NEXT) as string
    expect(next).toBe(file("export const X_ASSEMBLY = defineCreature('animal-x', { palette: { coat: 0x222222 } })"))
  })

  it('returns null when the result would be identical', () => {
    expect(withUpdatedDefinition(ONE, 'animal-x', '{ palette: { coat: 0x111111 } }')).toBeNull()
  })

  it('refuses when there is no such call to replace', () => {
    expect(() => withUpdatedDefinition(ONE, 'animal-y', NEXT)).toThrow(PushRefused)
    expect(() => withUpdatedDefinition(ONE, 'animal-y', NEXT)).toThrow(/no `defineCreature/)
    expect(() => withUpdatedDefinition(ONE, 'animal-y', NEXT)).toThrow(/Nothing was written/)
  })

  it('refuses when there are two, rather than guessing which is the animal', () => {
    const two = ONE + "\nexport const OTHER = defineCreature('animal-x', { palette: {} })\n"
    expect(() => withUpdatedDefinition(two, 'animal-x', NEXT)).toThrow(PushRefused)
    expect(() => withUpdatedDefinition(two, 'animal-x', NEXT)).toThrow(/2 `defineCreature/)
  })

  it('refuses a file whose braces never balance', () => {
    const broken = file("export const X_ASSEMBLY = defineCreature('animal-x', { palette: { coat: 0x1 }")
    expect(() => withUpdatedDefinition(broken, 'animal-x', NEXT)).toThrow(PushRefused)
  })

  it('refuses CRLF on either side, so a spliced file is never half one and half the other', () => {
    expect(() => withUpdatedDefinition(ONE.replace('\n', '\r\n'), 'animal-x', NEXT)).toThrow(/CRLF/)
    expect(() => withUpdatedDefinition(ONE, 'animal-x', '{\r\n}')).toThrow(/CRLF/)
  })

  /*
   * The braces that are NOT structure. A `{` in a sentence and an apostrophe in
   * a derivation are both everywhere in these files — the hedgehog's own
   * comments say `{ axis: 'y', deg: 180 }` — and a matcher that counted them
   * would end the definition in the wrong place and write the tail of one
   * animal into the middle of another.
   */
  it('is not fooled by a brace in a comment or a quote in a string', () => {
    const tricky = [
      '/** Kept. */',
      "export const X_ASSEMBLY = defineCreature('animal-x', {",
      "  /* Joe's own note, which says { axis: 'y' } and } and { for good measure. */",
      "  flag: 'a } inside a string, and an escaped \\' apostrophe',",
      '})',
      '',
      '/* Kept too. */',
      '',
    ].join('\n')
    const next = withUpdatedDefinition(tricky, 'animal-x', '{ palette: {} }') as string
    expect(next).toBe([
      '/** Kept. */',
      "export const X_ASSEMBLY = defineCreature('animal-x', { palette: {} })",
      '',
      '/* Kept too. */',
      '',
    ].join('\n'))
  })

  it('definitionLiteral: lifts the object the editor sent, braces and all', () => {
    const source = defToModuleSource('animal-x', { palette: { coat: 0x224466 } })
    const literal = definitionLiteral(source, 'animal-x') as string
    expect(literal.startsWith('{')).toBe(true)
    expect(literal.endsWith('}')).toBe(true)
    expect(literal).toContain('0x224466')
    /* Just the literal: the generator's own doc comment and import are NOT in it. */
    expect(literal).not.toContain('defineCreature')
    expect(literal).not.toContain('import')
  })
})

/**
 * `staleBindings`: what is left once the constants have been put back.
 *
 * After `withRestoredConstants` this list is only ever a name whose VALUE the
 * edit genuinely changed, or one bound to an expression nothing here may
 * evaluate. Both are really dead, both live outside the definition block, and
 * both would otherwise surface as a `noUnusedLocals` error with no visible
 * cause — so the reply names the line and Joe decides whether the paragraph
 * above it goes with it.
 */
describe('staleBindings: names what a splice genuinely left behind', () => {
  it('finds an import the code no longer uses, ignoring the prose that mentions it', () => {
    const source = [
      '/** The doc comment says PACK_PUPIL, at length, and that is not a use. */',
      "import { defineCreature } from '../creature'",
      "import { PACK_PUPIL } from '../texture'",
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', { palette: { pupil: 0x00ff00 } })",
      '',
    ].join('\n')
    expect(staleBindings(source)).toEqual(['PACK_PUPIL'])
  })

  it('says nothing when every name is still read', () => {
    const source = [
      "import { defineCreature } from '../creature'",
      "import { PACK_PUPIL } from '../texture'",
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', { palette: { pupil: PACK_PUPIL } })",
      '',
    ].join('\n')
    expect(staleBindings(source)).toEqual([])
  })

  /*
   * The file-local derivations, which are the other half of the problem and the
   * half that cannot be restored: a species file writes `const SINK = 0.125 /
   * 0.359219` above its definition, and the editor only ever sees the number
   * that came out. A splice therefore orphans the const, and `noUnusedLocals`
   * treats an unused local exactly as it treats an unused import.
   */
  it('finds a file-local derivation the definition no longer reads', () => {
    const source = [
      "import { defineCreature } from '../creature'",
      '',
      '/* The measurement, and the paragraph above it, both stay. */',
      'const EAR_SINK = 0.125 / 0.359219',
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', { ears: { sink: 0.5 } })",
      '',
    ].join('\n')
    expect(staleBindings(source)).toEqual(['EAR_SINK'])
  })

  it('does not call a constant dead when another declaration still reads it', () => {
    const source = [
      "import { defineCreature } from '../creature'",
      '',
      'const COIL_THICK = 0.456',
      'const COIL_SINK = (COIL_THICK - 0.18125) / COIL_THICK',
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', { extras: [{ sink: COIL_SINK }] })",
      '',
    ].join('\n')
    expect(staleBindings(source)).toEqual([])
  })

  it('never calls the assembly export itself dead', () => {
    const source = [
      "import { defineCreature } from '../creature'",
      '',
      "export const X_ASSEMBLY = defineCreature('animal-x', { palette: {} })",
      '',
    ].join('\n')
    expect(staleBindings(source)).toEqual([])
  })
})

/**
 * **`withRestoredConstants`: the button may not hand Joe a compiler error.**
 *
 * The editor's definition comes from `loadBuiltDefs()` — the definition as the
 * module EVALUATED it — so `pupil: PACK_PUPIL` reaches the editor as a number
 * and comes back out of the generator as `0x4c4f5e`. Splice that in and the
 * import is read by nothing, which `noUnusedLocals` calls an error. "The push
 * works but breaks the build" is the same disease as the silent no-op: it just
 * fails later and louder.
 *
 * So a name whose VALUE did not change is written back. It is a value
 * comparison and never a cosmetic one — a colour Joe actually changed keeps his
 * hex, and the name then really is dead.
 */
describe('withRestoredConstants: puts a name back only when the number is the same', () => {
  const pupil = (name: string) => (name === 'PACK_PUPIL' ? 0x4c4f5e : null)

  it('restores the identifier when the value is unchanged', () => {
    const out = withRestoredConstants(
      '{ palette: { pupil: PACK_PUPIL } }', '{ palette: { pupil: 0x4c4f5e } }', pupil)
    expect(out.literal).toBe('{ palette: { pupil: PACK_PUPIL } }')
    expect(out.restored).toEqual(['PACK_PUPIL'])
  })

  it('leaves the hex alone when the value really changed', () => {
    const out = withRestoredConstants(
      '{ palette: { pupil: PACK_PUPIL } }', '{ palette: { pupil: 0x00ff00 } }', pupil)
    expect(out.literal).toBe('{ palette: { pupil: 0x00ff00 } }')
    expect(out.restored).toEqual([])
  })

  it('does nothing when the constant cannot be read', () => {
    const out = withRestoredConstants(
      '{ extras: [{ sink: COIL_SINK }] }', '{ extras: [{ sink: 0.6 }] }', () => null)
    expect(out.literal).toBe('{ extras: [{ sink: 0.6 }] }')
    expect(out.restored).toEqual([])
  })

  /*
   * The timidity that keeps this from corrupting an animal. `sink` and `at`
   * occur all over a definition, and matching by key alone would put one part's
   * constant into another part's slot.
   */
  it('refuses a key that occurs more than once on either side', () => {
    const twice = withRestoredConstants(
      '{ ears: { sink: S }, tail: { sink: S } }', '{ ears: { sink: 0.4 }, tail: { sink: 0.4 } }',
      () => 0.4)
    expect(twice.restored).toEqual([])

    const oneToTwo = withRestoredConstants(
      '{ ears: { sink: S } }', '{ ears: { sink: 0.4 }, tail: { sink: 0.4 } }', () => 0.4)
    expect(oneToTwo.restored).toEqual([])
  })

  it('never touches a member expression or a call', () => {
    const out = withRestoredConstants(
      '{ legs: { sink: LEG_ROW.sink } }', '{ legs: { sink: 0.408163 } }', () => 0.408163)
    expect(out.restored).toEqual([])
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

/*
 * THE DEFINITION ARRIVES WHOLE, INCLUDING THE FIELDS ADDED AFTER THIS WAS
 * WRITTEN.
 *
 * `defToModuleSource` walks a fixed `DEF_KEYS` list and serialises each value
 * generically, so a field added to `CreatureDef` is carried without anyone
 * touching the generator — but "should be" is not a thing to assume about the
 * only path out of the editor. A definition that lost a field between the screen
 * and `src/` would silently reshape an animal Joe had already shaped, and it
 * would do it quietly: the species still builds, still passes `creatureSpec`,
 * and simply stands differently.
 *
 * Both fields under test are recent and both are NESTED, which is the case a
 * flat serialiser gets wrong: `legs.y` (row height, `5ea32d4`) and `ridge.place`
 * (per-row hand placement, `4b14bc9`) — and `place` is a partial record keyed by
 * `RidgeRow` whose values are `Vec3`s, so it exercises an object of arrays two
 * levels down. The assertion is against the BYTES THE PUSH WROTE, not against
 * the generator's return value, because everything between them is the thing
 * being tested.
 */
describe('a definition reaches src/ with nothing dropped on the way', () => {
  /*
   * The definition is not hand-written text here: it is a real `CreatureDef`
   * put through the REAL generator, so the test covers the whole path the editor
   * takes rather than only the courier at the end of it.
   */
  const SHAPED: CreatureDef = {
    palette: { coat: 0xc4703a, belly: 0xe8d2a8 },
    legs: { x: 0.31, y: 0.185, z: 0.4 },
    ridge: {
      part: 'cone-01',
      count: 4,
      rows: ['top', 'chamfer'],
      place: { top: [0, 0.62, 0.05], chamfer: [0.18, 0.5, -0.1] },
    },
  }

  it('carries legs.y and ridge.place through the generator and onto the disk', async () => {
    const source = defToModuleSource('animal-corn-snake', SHAPED)
    /* First that the generator says them at all — `DEF_KEYS` walks the whole
     * definition generically, and this is the assertion that it kept doing so. */
    expect(source).toContain('y: 0.185')
    expect(source).toContain('place: { top: [0, 0.62, 0.05], chamfer: [0.18, 0.5, -0.1] }')

    const r = await push(payload({ module: source }))
    expect(r.code).toBe(200)
    /* And then that the push is a courier with no opinion about the text. */
    expect(read(MODULE)).toBe(source)
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

/**
 * `withMovesEntry`: the one splice here that REPLACES rather than skips.
 *
 * Deliberately the opposite shape to `withRecord` above, and that difference
 * is the whole reason `moves` was never folded into the `defineSpecies` record
 * — see `src/island/species/moves.ts`'s own header. `withRecord` treats an id
 * already present as done; this treats it as the common case, because ruling
 * on an animal that is ALREADY BUILT is the entire point of the field.
 */
describe('withMovesEntry: upserts the MOVES table, and never skips an id already there', () => {
  it('adds a new id in sorted position', () => {
    const next = withMovesEntry(MOVES_TEXT, 'animal-aardvark', 'land') as string
    const lines = next.split('\n').map(l => l.trim())
    const at = lines.findIndex(l => l === "'animal-aardvark': 'land',")
    const bee = lines.findIndex(l => l === "'animal-bee': 'air',")
    const parrot = lines.findIndex(l => l === "'animal-parrot': 'air',")
    expect(at).toBeGreaterThan(-1)
    /* Sorted: "aardvark" precedes "bee" and "parrot" alphabetically. */
    expect(at).toBeLessThan(bee)
    expect(at).toBeLessThan(parrot)
    /* Nobody already there lost their line. */
    expect(lines.filter(l => l.includes("'animal-"))).toHaveLength(3)
  })

  /*
   * THE REGRESSION THAT WOULD OTHERWISE MAKE THIS FIELD USELESS FOR THE THIRTY
   * ALREADY-PUSHED ANIMALS. If this appended instead of replacing, ruling on an
   * id already in the table would leave TWO conflicting entries for it, and
   * `MOVES[id]` would silently answer with whichever one a duplicate object key
   * happens to keep — not a crash, a wrong and confusing answer, for exactly the
   * thirty species PB-068 exists to let Joe rule on.
   */
  it('REPLACES an existing id\'s value — it does not append a duplicate line beside it', () => {
    const next = withMovesEntry(MOVES_TEXT, 'animal-bee', 'land') as string
    const lines = next.split('\n').map(l => l.trim()).filter(l => l.startsWith("'animal-bee':"))
    expect(lines).toEqual(["'animal-bee': 'land',"])
    expect(next).not.toContain("'animal-bee': 'air',")
  })

  it('never touches animal-bee or animal-parrot when asked about a different id', () => {
    const next = withMovesEntry(MOVES_TEXT, 'animal-newt', 'water') as string
    expect(next).toContain("'animal-bee': 'air',")
    expect(next).toContain("'animal-parrot': 'air',")
  })

  it('is a true no-op — returns null — when the id already carries exactly this value', () => {
    expect(withMovesEntry(MOVES_TEXT, 'animal-bee', 'air')).toBeNull()
  })

  it('throws when either marker is missing, and never guesses where the table is', () => {
    const noStart = MOVES_TEXT.replace('/* >>> WORKBENCH-OWNED TABLE', '/* nothing to see here')
    expect(() => withMovesEntry(noStart, 'animal-newt', 'water')).toThrow(PushRefused)
    expect(() => withMovesEntry(noStart, 'animal-newt', 'water')).toThrow(/WORKBENCH-OWNED TABLE/)

    const noEnd = MOVES_TEXT.replace('/* <<< WORKBENCH-OWNED TABLE */', '/* nothing to see here */')
    expect(() => withMovesEntry(noEnd, 'animal-newt', 'water')).toThrow(PushRefused)
  })

  it('rejects a rubbish locomotion value before it can be written', () => {
    expect(() => withMovesEntry(MOVES_TEXT, 'animal-newt', 'levitate')).toThrow(PushRefused)
    expect(() => withMovesEntry(MOVES_TEXT, 'animal-newt', 'levitate')).toThrow(/land, air, water, amphibian/)
    /* And it never got as far as being a filesystem question: the same rubbish
     * value on a source with no markers at all still fails on the VALUE. */
    expect(() => withMovesEntry('nothing like the real file', 'animal-newt', 'levitate')).toThrow(PushRefused)
  })

  it('mirrors moves.ts\'s own Locomotion union, word for word', () => {
    /* The agreement `push.mjs`'s own header promises. A fifth word added to
     * `moves.ts` and not repeated here is a mismatch this catches immediately,
     * rather than a typo that reaches a real push months later. */
    expect([...PUSH_LOCOMOTIONS].sort()).toEqual([...LOCOMOTIONS].sort())
  })
})

/**
 * **The page's verdict on the reply — Joe's bug, from the other end of the wire.**
 *
 * 2 August: he edited the hedgehog, pressed "Push it to the game", and the
 * header told him `animal-hedgehog is in the game` in green while the panel
 * under it listed every one of the ten places as SKIPPED. Nothing was written.
 * The page had decided "success" from the ABSENCE of an `error` key, and drew
 * the note in `note warn` on both branches, so the note itself conveyed nothing
 * either. He could not tell a refusal from a push.
 *
 * `pushOutcome` is the whole decision, lifted out of the DOM so it can be stated
 * here: **place 1 — `src/island/species/parts/assembled/<id>.ts`, the file that
 * IS the animal — appears in `wrote`, or the animal did not reach the game.**
 *
 * Every reply below is a REAL one, off the real server, produced by the same
 * `push()` the button calls. Nothing here is a fixture of what a reply is
 * believed to look like, and nothing here asserts that a call happened: the
 * claim is that the page CHOOSES the failure presentation, and it is checked on
 * the class and the words it chose.
 */
describe('the page reads a reply by what it WROTE, not by the absence of an error', () => {
  it('calls a fresh push success — place 1 is in `wrote`', async () => {
    const r = await push(payload())
    expect(r.code).toBe(200)
    expect(places(r.body.wrote)).toContain(1)

    const out = pushOutcome(r.body, 'animal-corn-snake')
    expect(out.ok).toBe(true)
    expect(out.noteClass).toBe('note warn')
    expect(out.sayBad).toBe(false)
    expect(out.sayText).toContain('is in the game')
    /* The server's own sentence is what he reads — it is the one that knows
     * `npm test` is red on purpose. */
    expect(out.note).toBe(r.body.say)
  })

  /*
   * THE HEDGEHOG. An animal that is already built, pushed with a locomotion
   * ruling: a clean 200, no `error` anywhere, and the only thing written is the
   * MOVES table. Every edit he made to the SHAPE was skipped, because
   * `push.mjs` never writes over a species that is already built. The old code
   * put "is in the game" on the screen in green for exactly this reply.
   */
  it('calls a moves-only push on an already-built species a FAILURE, in red, naming the file', async () => {
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    write(rel, "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")

    const r = await push(payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: ['something else'] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    }))
    /* The reply the page has to judge: a success by every old measure. */
    expect(r.code).toBe(200)
    expect(r.body.error).toBeUndefined()
    expect(places(r.body.wrote)).not.toContain(1)
    expect(places(r.body.skipped)).toContain(1)

    const out = pushOutcome(r.body, 'animal-x')
    expect(out.ok).toBe(false)
    /* The note is RED, not the orange it shares with "read this before you go". */
    expect(out.noteClass).toBe('note bad')
    /* And the always-visible header is red too, because the note alone was never
     * the loudest thing on screen — a stale green line above it was. */
    expect(out.sayBad).toBe(true)
    /* Named: the file that did not change, and it is place 1's real path. */
    expect(speciesModulePath('animal-x')).toBe(rel)
    expect(out.note).toContain(rel)
    expect(out.sayText).toContain(rel)
    /* The sentence that misled him may not appear on this branch at all. */
    expect(out.sayText).not.toContain('is in the game')
    expect(out.sayText).toContain('did NOT reach the game')
    /* The server's explanation is carried, because it is the half that knows WHY. */
    expect(out.note).toContain(r.body.say)
  })

  it('calls a push where literally nothing was written a failure', async () => {
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    write(rel, "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")
    const body = payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    })
    expect((await push(body)).code).toBe(200)

    /* Second time: nothing at all is written, and the server says so plainly. */
    const again = await push(body)
    expect(again.code).toBe(200)
    expect(places(again.body.wrote)).toEqual([])
    expect(again.body.say).toContain('Nothing was written')

    const out = pushOutcome(again.body, 'animal-x')
    expect(out.ok).toBe(false)
    expect(out.noteClass).toBe('note bad')
    expect(out.sayBad).toBe(true)
    expect(out.sayText).not.toContain('is in the game')
  })

  /*
   * The contrast that stops the rule being "everything is a failure": a
   * half-landed push finished by hand. Five of the six places are skipped and
   * only place 1 is written — and that is a real change to the animal, so it is
   * the only shape of reply that may go green.
   */
  it('calls a push that wrote ONLY place 1 a success', async () => {
    expect((await push(payload())).code).toBe(200)
    rmSync(join(root, MODULE))
    const again = await push(payload())

    expect(places(again.body.wrote)).toEqual([1])
    expect(places(again.body.skipped)).toEqual([2, 3, 4, 8, 9])

    const out = pushOutcome(again.body, 'animal-corn-snake')
    expect(out.ok).toBe(true)
    expect(out.noteClass).toBe('note warn')
    expect(out.sayBad).toBe(false)
    expect(out.sayText).toContain('is in the game')
  })

  it('reports a refusal in the server’s own words, in red', async () => {
    /* A real 400, off the real route — the already-built refusal Joe would have
     * got had he not ruled on locomotion. */
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    write(rel, "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")
    const r = await push(payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
    }))
    expect(r.code).toBe(400)

    const out = pushOutcome(r.body, 'animal-x')
    expect(out.ok).toBe(false)
    expect(out.noteClass).toBe('note bad')
    expect(out.sayBad).toBe(true)
    /* Word for word: it names the file and says what to do instead. Wrapping it
     * would throw away the only part he can act on. */
    expect(out.note).toBe(r.body.error)
    expect(out.sayText).toContain(r.body.error!)
  })

  it('never presents a failure and a success the same way', async () => {
    /* The bug stated as an invariant, across every real reply above: two
     * outcomes that disagree about `ok` may not agree about the class, and the
     * header may not be red on one and calm on the other. Before the fix both
     * were `note warn` and this is the assertion that catches a relapse. */
    const good = pushOutcome({ wrote: [{ place: 1, path: 'p', what: 'w' }] }, 'animal-x')
    const bad = pushOutcome({ wrote: [{ place: 10, path: 'p', what: 'w' }] }, 'animal-x')
    const refused = pushOutcome({ error: 'no' }, 'animal-x')
    expect(good.noteClass).not.toBe(bad.noteClass)
    expect(good.noteClass).not.toBe(refused.noteClass)
    expect(bad.sayBad && refused.sayBad).toBe(true)
    expect(good.sayBad).toBe(false)
    for (const out of [bad, refused]) {
      expect(out.ok).toBe(false)
      expect(out.noteClass).toContain('bad')
    }
  })
})

/**
 * **A push that did not write may not sign anything off.**
 *
 * Joe, 2 August: *"there is no way for me to change it to status 'sign-off' when
 * i hit the 'push to game' button, that is me signing it off."* So a successful
 * push now writes `signoff` into `joe/names-audit.json`, and the animal joins
 * the egg pool with no second tick to go and find.
 *
 * That makes the button's honesty a CHILD-FACING question rather than a
 * cosmetic one. PB-076 was a push that returned a clean 200 having written
 * nothing at all; if sign-off hung off the absence of an `error` key, that reply
 * would have signed off an animal that never reached `src/` — an unreviewed
 * creature in front of Juno, which is the one thing the gate exists to prevent.
 *
 * So `signoffPatch` is handed `pushOutcome`'s verdict and has exactly one test
 * in it. Every reply below is a REAL one off the real server, judged by the same
 * pair of calls `main.ts` makes, in the same order; the invariant near the end is
 * what makes the two rules structurally incapable of disagreeing. The wiring that
 * proves the page actually calls them in that order is pinned in the next block,
 * beside the pin it is modelled on.
 */
describe('a push that did not reach the game cannot sign the animal off', () => {
  /** The pair exactly as `push()` in `main.ts` runs it: verdict first, then the sign-off. */
  const signoffFor = (reply: Reply, id: string) => signoffPatch(pushOutcome(reply, id), id)

  it('signs nothing off when the server refused outright', async () => {
    /* A real 400 off the real route — the already-built refusal. */
    write('src/island/species/parts/assembled/animal-x.ts',
      "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")
    const r = await push(payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
    }))
    expect(r.code).toBe(400)
    expect(r.body.error).toBeTruthy()

    expect(signoffFor(r.body, 'animal-x')).toBeNull()
    /* And nothing reached the ledger by any other route: the audit is as seeded. */
    expect(jsonAt<Ledger>(AUDIT)).toEqual(AUDIT_SEED)
  })

  it('signs nothing off when the reply wrote nothing at all', async () => {
    write('src/island/species/parts/assembled/animal-x.ts',
      "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")
    const body = payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    })
    expect((await push(body)).code).toBe(200)

    /* Second time round every place is already taken, so `wrote` is empty. */
    const again = await push(body)
    expect(again.code).toBe(200)
    expect(again.body.error).toBeUndefined()
    expect(places(again.body.wrote)).toEqual([])

    expect(signoffFor(again.body, 'animal-x')).toBeNull()
  })

  /*
   * ***THE PB-076 REPLY.*** The one this whole gate is for.
   *
   * An animal that is already built, pushed again with a locomotion ruling. The
   * server answers 200, there is no `error` key anywhere in it, and the only
   * thing it wrote is the MOVES table — place 1, the file that IS the animal,
   * is in `skipped`. The old page put "is in the game" on screen in green for
   * exactly this reply, and a sign-off rule that read `!reply.error` would have
   * ticked it and put an unreviewed creature into the egg pool.
   */
  it('signs nothing off for a moves-only push on an already-built species', async () => {
    const rel = 'src/island/species/parts/assembled/animal-x.ts'
    write(rel, "export const X_ASSEMBLY = defineCreature('animal-x', { parts: [] })\n")
    const r = await push(payload({
      speciesId: 'animal-x',
      exportName: 'X_ASSEMBLY',
      module: [
        "import { defineCreature } from '../creature'", '',
        "export const X_ASSEMBLY = defineCreature('animal-x', { parts: ['something else'] })", '',
      ].join('\n'),
      record: "  defineSpecies('animal-x', 'bespoke'),",
      after: [],
      auditRow: { ...AUDIT_ROW, id: 'natural/animal-x', speciesId: 'animal-x' },
      factRow: { ...FACT_ROW, speciesId: 'animal-x' },
      moves: 'air',
    }))
    /* The reply is a success by every measure the old code had. */
    expect(r.code).toBe(200)
    expect(r.body.error).toBeUndefined()
    expect(places(r.body.wrote).length).toBeGreaterThan(0)
    expect(places(r.body.wrote)).not.toContain(1)
    expect(places(r.body.skipped)).toContain(1)
    /* The file on disk is still the one-line stub — the shape never changed. */
    expect(read(rel)).not.toContain('something else')

    expect(signoffFor(r.body, 'animal-x')).toBeNull()
  })

  /*
   * The other half of the claim, without which "returns null" would be satisfied
   * by a function that returned null always: a push that really did write place 1
   * produces a patch, and the patch names the row the push itself just appended.
   */
  it('signs the animal off when place 1 really was written, naming the row the push wrote', async () => {
    const r = await push(payload())
    expect(r.code).toBe(200)
    expect(places(r.body.wrote)).toContain(1)

    const patch = signoffFor(r.body, 'animal-corn-snake')
    expect(patch).not.toBeNull()
    expect(patch!.what).toBe('names')
    expect(patch!.patch.id).toBe('natural/animal-corn-snake')
    expect(patch!.patch.signoff).toBe(APPROVED)

    /* The id is the audit ROW's id, not the species id, and it is the very row
     * place 8 of this push appended — checked against the bytes rather than
     * against the string this test would otherwise be spelling twice. */
    const rows = (jsonAt<Ledger>(AUDIT).names ?? []) as { id: string }[]
    expect(rows.map(row => row.id)).toContain(patch!.patch.id)

    /* `natural/` is load-bearing and not decoration: the real server refuses a
     * patch aimed at the bare species id, so getting it wrong is a save that
     * fails rather than a sign-off that lands on the wrong creature. */
    const wrong = await save({ what: 'names', patch: { id: 'animal-corn-snake', signoff: APPROVED } })
    expect(wrong.code).toBe(400)
    expect(wrong.body.error).toContain('no such id')
  })

  it('never aims a patch at a bare `natural/`, however successful the push was', async () => {
    const r = await push(payload())
    const out = pushOutcome(r.body, 'animal-corn-snake')
    expect(out.ok, 'the outcome under test has to be a real success').toBe(true)

    /* Only the id is missing, and it is the only thing standing between this and
     * a patch naming `natural/` — a row id no creature has, which `applyPatch`
     * would refuse, and which is a save Joe would have to be told about for no
     * reason. Blank, and whitespace, which `trim()` is there to catch. */
    for (const id of ['', ' ', '   ', '\t', '\n']) {
      expect(signoffPatch(out, id), JSON.stringify(id)).toBeNull()
    }
  })

  /*
   * ***THE INVARIANT.***
   *
   * Over every reply shape that can be constructed, real and made up:
   *
   *     signoffPatch(pushOutcome(reply, id), id) !== null   ⟺   pushOutcome(reply, id).ok
   *
   * This is the thing that makes the two rules structurally incapable of
   * disagreeing, and it is why `signoffPatch` takes the OUTCOME rather than
   * re-reading `wrote` for itself. A second reading of the reply would be a
   * second definition of "the animal reached the game", and two definitions
   * drift: the day somebody taught one of them about place 2, or about a reply
   * that carries `skipped` but no `error`, the other would not have heard, and
   * the failure mode of that disagreement is a tick on an animal nobody built.
   * There is exactly one `ok` test in the function and no other input from which
   * success could be re-derived, so the biconditional below is not a coincidence
   * this test happens to observe — it is the shape of the code, asserted.
   */
  it('produces a patch if and only if the outcome says the animal reached the game', async () => {
    const p = (place: number) => ({ place, path: 'p', what: 'w' })
    const ID = 'animal-corn-snake'

    /* Real replies first, off the real server: a fresh success, and the two
     * shapes of clean-200 failure the server actually produces. */
    const fresh = (await push(payload())).body
    rmSync(join(root, MODULE))
    const placeOneOnly = (await push(payload())).body
    const repeat = (await push(payload())).body
    const refused = (await push(payload({ collection: 'aquarium' }))).body
    expect(refused.error, 'the refusal under test stopped being one').toBeTruthy()

    const shapes: readonly Reply[] = [
      fresh, placeOneOnly, repeat, refused,
      /* And every shape a reply could take that the server does not happen to
       * produce today, so the rule is stated over the space and not over the
       * sample. */
      {},
      { wrote: [] },
      { wrote: [], skipped: [], left: [] },
      { say: 'Nothing was written' },
      { error: 'refused' },
      { error: '' },
      { skipped: [p(1)] },
      { wrote: [p(2)] },
      { wrote: [p(10)] },
      { wrote: [p(2), p(3), p(4), p(8), p(9)] },
      { wrote: [p(1)] },
      { wrote: [p(1)], skipped: [p(2)] },
      { wrote: [p(1), p(2), p(3), p(4), p(8), p(9)], say: 'all of it' },
      /* The one that matters most in the made-up half: an error BESIDE a written
       * place 1. `pushOutcome` refuses it, so the sign-off must refuse it too —
       * neither may take the reply's word from a different field than the other. */
      { error: 'refused', wrote: [p(1)] },
      { speciesId: ID, wrote: [p(1)] },
      { speciesId: ID, skipped: [p(1)], wrote: [p(6)], say: 'moves only' },
    ]

    /* Both sides of the biconditional are exercised, so a function that always
     * returned null and a rule that always said ok would both fail here. */
    let signed = 0
    for (const reply of shapes) {
      const outcome = pushOutcome(reply, ID)
      const patch = signoffPatch(outcome, ID)
      expect(patch !== null, JSON.stringify(reply)).toBe(outcome.ok)
      if (outcome.ok) signed++
    }
    expect(signed, 'every shape failed — the invariant proved nothing').toBeGreaterThan(0)
    expect(signed, 'every shape succeeded — the invariant proved nothing').toBeLessThan(shapes.length)

    /* A blank id can only ever REMOVE a sign-off, never add one: the id gate is
     * strictly narrower than the verdict and may not widen it. */
    for (const reply of shapes) {
      expect(signoffPatch(pushOutcome(reply, ID), ''), JSON.stringify(reply)).toBeNull()
    }
  })

  /*
   * ONE STRING, FOUR MODULES, AND THE MIRROR THE GAME SHIPS.
   *
   * The value the push writes has to be the value everything downstream gates
   * on. `approver.ts` spells it for the bench, `editor/status.ts` for the Animal
   * list's `signed` badge, `tools/species/signoffs.mjs` for the generated mirror
   * — and drift between any two of them ships an unreviewed animal or withholds
   * an approved one, silently, with every test still green.
   *
   * So the last half of this is not an assertion about strings at all: the patch
   * is POSTed to the real `/api/save`, which merges it and re-runs the real
   * generator, and the claim is that the animal is in the file the game reads.
   */
  it('writes the one value the whole system gates on, all the way to the shipped mirror', async () => {
    /* The three spellings, held against each other. */
    expect(APPROVED, 'approver.ts and signoffs.mjs disagree about what shipping means').toBe(SIGNED_OFF)
    expect(APPROVED, 'the Animal list gates on a different word than the push writes').toBe(LIST_SIGNED_OFF)

    const r = await push(payload())
    expect(places(r.body.wrote)).toContain(1)
    const patch = signoffPatch(pushOutcome(r.body, 'animal-corn-snake'), 'animal-corn-snake')
    expect(patch).not.toBeNull()

    const saved = await save(patch!)
    expect(saved.code, JSON.stringify(saved.body)).toBe(200)

    /* The row on disk carries it — this is the string the audit rows use. */
    const audit = jsonAt<Ledger>(AUDIT)
    const row = (audit.names ?? []).find(
      (n): n is { id: string, speciesId: string, signoff?: string } =>
        (n as { id?: string }).id === 'natural/animal-corn-snake')
    expect(row?.signoff).toBe(APPROVED)
    /* The seeded row is untouched — a sign-off patches one creature, not a file. */
    expect(audit.names?.[0]).toEqual(AUDIT_SEED.names[0])

    /* The generator's OWN rule, run over that file rather than restated. */
    expect(signedOffFrom(audit)).toEqual(['animal-corn-snake'])
    /* The editor's own reader, over the same rows. */
    expect(signedOff(audit.names as { speciesId?: string, signoff?: string }[], 'animal-corn-snake')).toBe(true)
    /* And the file the GAME reads, regenerated by the save itself. */
    expect(jsonAt<{ species: string[] }>(MIRROR).species).toEqual(['animal-corn-snake'])
  })
})

/**
 * The wiring, pinned the way `editor-own-colour.test.ts` pins its panel.
 *
 * `main.ts` cannot be imported — it builds a WebGL stage at module scope — so
 * the claims above would all still pass with `push()` ignoring `pushOutcome`
 * entirely, and Joe would still not be able to tell. These read the source.
 */
describe('the editor page actually uses the verdict, and has a colour for it', () => {
  const EDITOR = resolve(REPO, 'tools/workbench/public/editor')
  const main = readFileSync(join(EDITOR, 'main.ts'), 'utf8')
  const css = readFileSync(join(EDITOR, 'editor.css'), 'utf8')

  it('has a note class for a failure that is not the warn class', () => {
    expect(css).toContain('.note.bad { color: var(--loud); }')
  })

  it('draws the push note and the header from pushOutcome', () => {
    expect(main).toMatch(/pushOutcome[\s\S]{0,200}?from '\.\/push'/)
    const at = main.indexOf('pushOutcome(reply, speciesId)')
    expect(at, 'push() never asks for the verdict').toBeGreaterThan(-1)
    const after = main.slice(at, at + 400)
    expect(after).toContain('outcome.noteClass')
    expect(after).toContain('outcome.sayText')
    expect(after).toContain('outcome.sayBad')
    /* And the old unconditional green sentence is gone from the page. */
    expect(main).not.toContain('say(`${speciesId} is in the game')
  })

  it('says a refusal in BOTH places on every path that pushes nothing', () => {
    /* The `!view.ready` path used to write the note and no more, so the header
     * kept the green "saved ..." from the save a moment earlier. */
    const at = main.indexOf('const view = drawSignoff()\n  if (!view.ready)')
    expect(at, 'push() no longer opens the way it did').toBeGreaterThan(-1)
    expect(main.slice(at, at + 900)).toContain('refuse(')
    /* `refuse` is the one shape: red note, cleared list, red header. */
    const shape = main.slice(main.indexOf('function refuse('), main.indexOf('function refuse(') + 500)
    expect(shape).toContain("pushNote.className = 'note bad'")
    expect(shape).toContain('pushOut.replaceChildren()')
    expect(shape).toMatch(/say\([^)]*,\s*true\)/)
    /* Nothing in push() may still paint a failure orange. */
    expect(main).not.toContain("pushNote.className = 'note warn'")
  })

  it('stops a push when the save it depends on failed', () => {
    expect(main).toContain('async function save(): Promise<boolean>')
    expect(main).toContain('if (!await save())')
  })

  /*
   * The same technique, for the sign-off. Everything asserted about
   * `signoffPatch` above would still hold with `push()` never calling it, or
   * calling it and posting the result whatever it was — and the second of those
   * is the PB-076 shape again, a false tick on an animal that never moved. Three
   * separate claims, because the ORDER is the whole guarantee.
   */
  it('asks signoffPatch for the sign-off, and hands it the VERDICT rather than the reply', () => {
    expect(main).toMatch(/signoffPatch[\s\S]{0,300}?from '\.\/push'/)
    const verdictAt = main.indexOf('const outcome = pushOutcome(reply, speciesId)')
    const at = main.indexOf('signoffPatch(outcome, speciesId)')
    expect(verdictAt, 'push() no longer computes the verdict the way it did').toBeGreaterThan(-1)
    expect(at, 'push() never asks for the sign-off').toBeGreaterThan(-1)
    /* Judged AFTER the verdict exists, and out of the verdict itself. Passing
     * the reply would be a second reading of `wrote` — the thing `push.ts` is
     * built to make impossible. */
    expect(at).toBeGreaterThan(verdictAt)
    expect(main).not.toContain('signoffPatch(reply')
  })

  it('returns on a falsy patch BEFORE it can post anything to /api/save', () => {
    const at = main.indexOf('signoffPatch(outcome, speciesId)')
    const after = main.slice(at, at + 500)
    /* The gate. A `null` from `signoffPatch` ends `push()` — there is no branch
     * in which a failed push reaches a save. */
    const gate = after.search(/if \(!\w+\) return\b/)
    expect(gate, 'the sign-off is used without checking there is one').toBeGreaterThan(-1)
    const post = after.indexOf("api('/api/save'")
    expect(post, 'the sign-off is never sent anywhere').toBeGreaterThan(-1)
    expect(gate, 'the save happens before the null check').toBeLessThan(post)
    /* And what it posts is the patch itself, not a hand-built body beside it. */
    expect(after).toMatch(/api\('\/api\/save', (\w+)\)/)
    expect(after.slice(gate, post)).not.toContain('signoff:')
  })

  it('does not call an unsigned animal signed off when the save fails', () => {
    /* The push is NOT undone and must not be described as though it were: the
     * animal is in the game, and the thing that failed is the tick.
     *
     * The sentence says "REACHED the game", not "is in the game", and the
     * difference is load-bearing rather than stylistic. The test above pins that
     * the old unconditional green `${speciesId} is in the game` has left this
     * page, and it is a text match — it cannot tell that lie from this warning.
     * So the warning is worded around it. Two assertions on the same page must
     * not be able to be satisfied by the same words. */
    expect(main).toContain('reached the game but was NOT signed off')
    const warn = main.indexOf('reached the game but was NOT signed off')

    /* Asserted by ORDER, not by a character window. A window that merely looks
     * back N characters for the word "error" is satisfied by a comment
     * mentioning errors, and it breaks the moment someone writes a paragraph
     * above the line — which is exactly what happened to the first version of
     * this test. What has to be true is structural: the save is posted, its
     * reply is tested, and only then is the warning reachable. */
    const post = main.indexOf("api('/api/save'")
    const guard = main.indexOf("signed['error'] !== undefined")
    expect(post, 'the sign-off is never posted').toBeGreaterThan(-1)
    expect(guard, 'the reply to the sign-off save is never tested').toBeGreaterThan(post)
    expect(warn, 'the warning is not inside the failure branch').toBeGreaterThan(guard)

    /* And the success path does not run through the warning: the re-read that
     * follows a good save sits after it, so the two are separate branches. */
    expect(main.indexOf('await refreshDrafts()', guard)).toBeGreaterThan(warn)
  })

  it('does not let a non-2xx reply arrive looking like a success', () => {
    const at = main.indexOf('const api = async (path: string')
    expect(at).toBeGreaterThan(-1)
    const body = main.slice(at, at + 900)
    expect(body).toContain('res.ok')
    expect(body).toContain('res.status')
    expect(body).toMatch(/error:/)
  })
})
