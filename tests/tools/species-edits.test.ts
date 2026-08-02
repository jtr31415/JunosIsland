/**
 * The visual editor's draft store, round-tripped against a real headless server.
 *
 * `joe/species-edits.json` is where a species Joe MAKES in the page lives before
 * it is anything else: what it was copied from, what it is called, the fact that
 * goes under the name, and `def` — a whole CreatureDef carried as JSON. It has
 * two writers, like every other file in `MERGEABLE`: he drafts in the page while
 * the facts pipeline fills in a `fact` from the other side, and an agent that
 * re-runs the axiom checks rewrites `warnings` beside drafts he never touched.
 *
 * So it is the same two promises as the queue and the names — KEEP and OWN —
 * over a payload that is an OBJECT rather than a sentence. That last part is what
 * most of this file is about: `text` compares with `===`, and two parses of the
 * same bytes are never `===`, so a def judged as text would 409 Joe out of a
 * draft he had not changed. `def` and `warnings` are the `json` kind instead —
 * content compared, a genuine disagreement still refused.
 *
 * There USED to be a third promise, "ids dealt server-side", and it is gone. Joe,
 * 2 August 2026: *"when i save an animal in the editor, it needs to just
 * overwrite what there is already … no saving of drafts in the bottom of the
 * list"*. A record is keyed by its `speciesId` now, so saving the squirrel twice
 * leaves ONE squirrel. `speciesId` is derived from the species rather than dealt
 * from a pool, so there is no counter and nothing for two writers to take the
 * same number out of — the `names` and `primitives` case, not the backlog's.
 *
 * The `SD-nnn` ids already written by an older server are folded away rather
 * than deleted, which the last describe here covers against the file that was
 * genuinely on his disk on 2 August.
 *
 * Everything talks HTTP to a spawned process against a THROWAWAY root, exactly
 * as `workbench.test.ts` does, so the merge under test is the real one and the
 * writes are real writes. A test that mocked the merge would prove the mock. The
 * fold is driven through that same server as well as directly, because it is the
 * one thing here that has to work on a file nobody has saved since.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// @ts-expect-error — plain .mjs, no types, and deliberately the module the server runs.
import { migrate } from '../../tools/workbench/merge.mjs'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const REL = 'joe/species-edits.json'

let root: string
let child: ChildProcess
let base: string

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'species-edits-'))
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

const onDisk = () => JSON.parse(readFileSync(join(root, REL), 'utf8'))
const draftOf = (speciesId: string) => onDisk().drafts.find((d: any) => d.speciesId === speciesId)
const species = () => onDisk().drafts.map((d: any) => d.speciesId)

const status = async (body: unknown) => {
  const res = await fetch(base + '/api/save', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return { code: res.status, body: (await res.json()) as any }
}

/** What the page actually renders from — the same round trip the editor makes on load. */
const pageState = async () => (await fetch(base + '/api/state')).json() as Promise<any>

/** An agent editing the file directly, after the page loaded — how it really happens. */
const agentWrites = (edit: (f: any) => void) => {
  const f = onDisk()
  edit(f)
  writeFileSync(join(root, REL), JSON.stringify(f, null, 2) + '\n')
}

/** One draft as the editor makes one: an animal, a def, nothing decided about it yet. */
const draft = (extra: Record<string, unknown> = {}) => ({
  speciesId: 'animal-fawn',
  from: 'animal-deer',
  fromKind: 'original',
  collection: 'natural',
  givenName: 'Fawn',
  fact: '',
  factSource: 'pipeline',
  def: { kit: 'quadruped', body: { w: 0.62, h: 0.5 }, ears: 'tall' },
  warnings: [],
  state: 'draft',
  note: '',
  ...extra,
})

describe('one animal is one record, and the animal is the key', () => {
  it('is seeded with the empty shape, so the editor opens before he has drafted anything', async () => {
    /* Empty on purpose, and the opposite of the primitives bench: every record
     * here is something he MAKES, and a seeded draft would be an animal nobody
     * designed. What the seed owes is the SHAPE — and no counter in it, because
     * a `speciesId` is derived from the species and never dealt. */
    expect(existsSync(join(root, REL))).toBe(true)
    expect(onDisk()).toEqual({ schemaVersion: 1, drafts: [] })
  })

  it('SAVING THE SAME ANIMAL TWICE LEAVES ONE RECORD, UPDATED — not a second draft under the first', async () => {
    /* Joe's instruction of 2 August, and the reason this file was re-keyed:
     * *"when i save an animal in the editor, it needs to just overwrite what
     * there is already"*. Under the old dealt `SD-nnn` this pressed Save twice
     * and grew a `draft:SD-002` row beneath the animal in his list, every time.
     *
     * Driven the way the page drives it, byte for byte (`main.ts` save()): a
     * whole file carrying the ONE new record the first time, because the draft
     * is new and that is an append, then a patch the second time, because an
     * edit is the shape that carries intent. */
    expect((await status({
      what: 'edits',
      value: { schemaVersion: 1, drafts: [draft({ speciesId: 'animal-fawn', givenName: 'Fawn' })] },
    })).code).toBe(200)

    const again = await status({
      what: 'edits',
      patch: {
        speciesId: 'animal-fawn',
        givenName: 'Fawn, grown',
        fact: 'A young deer is a fawn.',
        def: { kit: 'quadruped', body: { w: 0.62, h: 0.58 }, ears: 'tall' },
      },
    })
    expect(again.code).toBe(200)
    /* The reply names the record by the file's OWN key. It answered `undefined`
     * for a while here, because the handler reported `.id` at every file. */
    expect(again.body.patched).toBe('animal-fawn')

    const his = onDisk().drafts.filter((d: any) => d.speciesId === 'animal-fawn')
    expect(his).toHaveLength(1)
    expect(his[0]).toMatchObject({
      givenName: 'Fawn, grown',
      fact: 'A young deer is a fawn.',
      def: { kit: 'quadruped', body: { w: 0.62, h: 0.58 }, ears: 'tall' },
    })
    /* And nothing dealt it a number on the way past. */
    expect(his[0]).not.toHaveProperty('id')
    expect(onDisk()).not.toHaveProperty('nextId')
  })

  it('two different animals are two records — overwriting is per animal, not per save', async () => {
    /* The same payload the page sends for any new animal: one record, and never
     * a word about the fawn already on disk. Overwriting is keyed by the animal,
     * so a second animal has nothing to overwrite. */
    expect((await status({
      what: 'edits',
      value: {
        schemaVersion: 1,
        drafts: [draft({ speciesId: 'animal-kit', givenName: 'Kit', from: '', fromKind: 'scratch' })],
      },
    })).code).toBe(200)

    expect(species()).toEqual(['animal-fawn', 'animal-kit'])
    /* The fawn is untouched by the kit landing beside it — including the second
     * save's values, which a re-append would have quietly reverted. */
    expect(draftOf('animal-fawn').givenName).toBe('Fawn, grown')
    expect(draftOf('animal-kit').fromKind).toBe('scratch')
  })

  it('THE KEEP RULE: a draft appended after the page loaded survives the page saving', async () => {
    const stale = onDisk()                                   // the copy the page holds
    agentWrites(f => f.drafts.push(draft({
      speciesId: 'animal-leveret', givenName: 'Leveret',
      fact: 'A young hare is a leveret.', factSource: 'pipeline',
    })))

    /* A whole-file save that has never heard of the leveret. It may not delete a
     * draft by being ignorant of it — and re-keying the file changed nothing
     * about that, which is exactly what this test is here to hold down. */
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(species()).toContain('animal-leveret')
    expect(draftOf('animal-leveret')).toMatchObject({
      givenName: 'Leveret', fact: 'A young hare is a leveret.',
    })
  })
})

describe('the def is the payload, and it is opaque', () => {
  it('a patch naming `def` changes the def and nothing else', async () => {
    const before = draftOf('animal-fawn')
    const def = { kit: 'quadruped', body: { w: 0.7, h: 0.44 }, ears: 'short', tail: 'brush' }

    expect((await status({ what: 'edits', patch: { speciesId: 'animal-fawn', def } })).code).toBe(200)

    const after = draftOf('animal-fawn')
    expect(after.def).toEqual(def)
    /* Everything the patch did not name is exactly as it was — including the
     * fields the same page owns and could have sent. A patch is intent. */
    expect(after).toMatchObject({
      speciesId: before.speciesId, givenName: before.givenName,
      collection: before.collection, state: before.state,
      note: before.note, factSource: before.factSource,
    })
    /* And it is stored WHOLE. The server never looks inside a def, so nothing
     * here reshapes, prunes or validates one. */
    expect(after.def.body).toEqual({ w: 0.7, h: 0.44 })
  })

  it('refuses a patch naming a field the page does not own', async () => {
    for (const field of ['schemaVersion', 'createdAt', 'geometry', 'signoff']) {
      const r = await status({ what: 'edits', patch: { speciesId: 'animal-fawn', [field]: 'nope' } })
      expect(r.code, `${field} was accepted`).toBe(400)
      expect(r.body.error).toContain(field)
    }
    /* `id` is in that same company now, and worth naming: it was a real field of
     * a real record until the fold dropped it, so a page that has not been
     * reloaded may still try to send one. It is not owned, so it is refused
     * rather than written back into a file the migration just cleaned. */
    const legacy = await status({ what: 'edits', patch: { speciesId: 'animal-fawn', id: 'SD-001' } })
    expect(legacy.code).toBe(400)
    expect(legacy.body.error).toContain('id')

    /* Nothing landed, and no stray key arrived on the record. */
    expect(draftOf('animal-fawn').createdAt).toBeUndefined()
    expect(draftOf('animal-fawn')).not.toHaveProperty('id')
    expect(onDisk().schemaVersion).toBe(1)
  })

  it('re-ordered keys are the SAME def — this is why `def` is not `text`', async () => {
    /* The case that would make the store unusable if a def were judged with
     * `===`: a payload that says exactly what the disk says, with its keys in
     * another order, because it has been through a form and a structuredClone.
     * `text` would call that a two-sided disagreement and refuse the save. */
    const page = onDisk()
    const mine = page.drafts.find((d: any) => d.speciesId === 'animal-fawn')
    mine.def = { tail: 'brush', ears: 'short', body: { h: 0.44, w: 0.7 }, kit: 'quadruped' }

    const r = await status({ what: 'edits', value: page })
    expect(r.code).toBe(200)
    expect(draftOf('animal-fawn').def).toEqual({
      kit: 'quadruped', body: { w: 0.7, h: 0.44 }, ears: 'short', tail: 'brush',
    })
  })

  it('a two-sided disagreement about a def is a 409, exactly as one about text is', async () => {
    /* Joe re-cuts the def in the page, an agent re-cuts the same one on disk,
     * and there is no third version to say which is newer. A def is an animal;
     * losing one silently is the outcome this whole module exists to prevent. */
    const page = onDisk()
    page.drafts.find((d: any) => d.speciesId === 'animal-fawn').def = { kit: 'quadruped', body: { w: 0.9 }, ears: 'huge' }
    agentWrites(f => {
      f.drafts.find((d: any) => d.speciesId === 'animal-fawn').def = { kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' }
    })

    const clash = await status({ what: 'edits', value: page })
    expect(clash.code).toBe(409)
    /* The clash names the record the way the FILE names it, so the sentence Joe
     * reads says which animal rather than which serial number. */
    expect(clash.body.error).toContain('animal-fawn')
    expect(clash.body.clashes[0]).toMatchObject({ id: 'animal-fawn', field: 'def' })
    /* Refused, not half-applied: the disk is exactly as the agent left it. */
    expect(draftOf('animal-fawn').def).toEqual({ kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' })

    /* "Exactly as text does" is an assertion, not a turn of phrase: the same
     * collision over `note` — a `text` field — answers in the same shape. */
    const words = onDisk()
    words.drafts.find((d: any) => d.speciesId === 'animal-fawn').def = { kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' }
    words.drafts.find((d: any) => d.speciesId === 'animal-fawn').note = 'what Joe typed'
    agentWrites(f => { f.drafts.find((d: any) => d.speciesId === 'animal-fawn').note = 'what the agent recorded' })

    const onWords = await status({ what: 'edits', value: words })
    expect(onWords.code).toBe(clash.code)
    expect(Object.keys(onWords.body).sort()).toEqual(Object.keys(clash.body).sort())
    expect(onWords.body.clashes[0]).toMatchObject({ id: 'animal-fawn', field: 'note' })
    expect(draftOf('animal-fawn').note).toBe('what the agent recorded')

    /* And his own hand resolves it, because a patch says which field he changed. */
    expect((await status({ what: 'edits', patch: { speciesId: 'animal-fawn', note: 'what Joe typed' } })).code).toBe(200)
    expect(draftOf('animal-fawn').note).toBe('what Joe typed')
  })

  it('an empty `warnings` is an absence, and never blanks the ones recorded on disk', async () => {
    const stale = onDisk()                                   // the kit's warnings are [] here
    agentWrites(f => {
      f.drafts.find((d: any) => d.speciesId === 'animal-kit').warnings = ['ears exceed the head by 1.8×', 'no tail']
    })

    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    /* A stale page carries `[]` because it never saw the check that filled them
     * in — the same reason it carries an empty note. */
    expect(draftOf('animal-kit').warnings).toEqual(['ears exceed the head by 1.8×', 'no tail'])

    /* Two different lists for the same draft is the def case again, and refused. */
    const page = onDisk()
    page.drafts.find((d: any) => d.speciesId === 'animal-kit').warnings = ['something else entirely']
    const r = await status({ what: 'edits', value: page })
    expect(r.code).toBe(409)
    expect(r.body.clashes[0]).toMatchObject({ id: 'animal-kit', field: 'warnings' })
  })
})

describe('ready is a decision, and draft is the absence of one', () => {
  it("a stale 'draft' cannot un-ready a draft marked ready", async () => {
    const stale = onDisk()                                   // the kit is 'draft' in this copy
    expect((await status({ what: 'edits', patch: { speciesId: 'animal-kit', state: 'ready' } })).code).toBe(200)
    expect(draftOf('animal-kit').state).toBe('ready')

    /* 'draft' is what every record is born as, so a payload carrying it says
     * nothing at all. An absence never unticks. */
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(draftOf('animal-kit').state).toBe('ready')

    /* Putting it back is a patch — intent, said out loud. */
    expect((await status({ what: 'edits', patch: { speciesId: 'animal-kit', state: 'draft' } })).code).toBe(200)
    expect(draftOf('animal-kit').state).toBe('draft')
  })

  it('the fact lands from the pipeline side without the page having to know', async () => {
    /* `fact: ''` means "queue it", and the pipeline is the other writer this
     * file was merged for. Its answer arrives on disk while the page is open. */
    const stale = onDisk()
    agentWrites(f => {
      const d = f.drafts.find((x: any) => x.speciesId === 'animal-kit')
      d.fact = 'A fox kit is born with grey fur.'
      d.factSource = 'pipeline'
    })
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(draftOf('animal-kit').fact).toBe('A fox kit is born with grey fur.')

    /* And Joe overruling it in his own words is a patch, which always wins. */
    await status({ what: 'edits', patch: { speciesId: 'animal-kit', fact: 'A fox kit is born grey.', factSource: 'joe' } })
    expect(draftOf('animal-kit')).toMatchObject({ fact: 'A fox kit is born grey.', factSource: 'joe' })
  })
})

describe('the file is a file like the others', () => {
  it('keeps its own order and its own formatting — two spaces, LF, trailing newline', async () => {
    /* Disk order, not the page's. The editor lists animals however it likes and
     * a whole-file save arrives in that order; the merge walks the DISK, so the
     * agent's leveret stays where the file put it and his own two stay where
     * they landed. Sent backwards on purpose, because "the file keeps its order"
     * is only worth anything against a payload that disagrees. */
    const backwards = onDisk()
    backwards.drafts.reverse()
    expect((await status({ what: 'edits', value: backwards })).code).toBe(200)
    expect(species()).toEqual(['animal-fawn', 'animal-kit', 'animal-leveret'])

    const raw = readFileSync(join(root, REL), 'utf8')
    expect(raw).not.toContain('\r')          // LF, on Windows, always
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw).toContain('\n  "drafts": [')
    expect(onDisk().schemaVersion).toBe(1)
  })

  it('did not widen the allowlist while adding itself to it', async () => {
    const r = await status({ what: 'species-edits', value: { schemaVersion: 1, drafts: [] } })
    expect(r.body.error).toContain('not a writable file')
    expect(existsSync(join(root, 'joe/species-edits'))).toBe(false)
  })

  it('refuses a save that is not the shape of the file', async () => {
    const r = await status({ what: 'edits', value: { schemaVersion: 1 } })
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('drafts')
    /* And the drafts are all still there. */
    expect(species()).toContain('animal-fawn')
  })
})

/**
 * Joe's own file, as it stood on 2 August 2026, trimmed only in the length of
 * the `def` strings.
 *
 * Three records, three dealt ids, and a counter — and the one that matters is
 * `SD-003`, because he had already named the fennec fox **Neegab** and put it in
 * the night-time collection. A fold that keyed by species and kept "whichever
 * one it saw first" would have thrown that away with a 200 and no error
 * anywhere, which is the exact class of quiet subtraction this project has been
 * bitten by twice. So the fixture is the real thing rather than an invention:
 * the name has to survive the file it actually lived in.
 */
const LEGACY = {
  schemaVersion: 1,
  nextId: 4,
  drafts: [
    {
      speciesId: 'animal-squirrel',
      from: 'animal-squirrel', fromKind: 'built',
      collection: '', givenName: '', fact: '', factSource: '',
      def: {
        palette: { coat: 12871983, belly: 16511458, tuft: 7222291 },
        belly: 0.5,
        tail: { part: 'box-23', spin: [{ axis: 'x', deg: 45 }], at: [0, 0.55, -0.4875] },
        snout: 'tube-01',
        flag: 'The raised tail makes this the TALLEST animal here: 1.98 against the pack\'s 1.43-2.02.',
      },
      warnings: [], state: 'draft', note: '', id: 'SD-001',
    },
    {
      speciesId: 'animal-goldfish',
      from: 'animal-goldfish', fromKind: 'built',
      collection: '', givenName: '', fact: '', factSource: '',
      def: {
        palette: { coat: 15234346, belly: 16246472, fin: 15900756 },
        hull: 'box-20', legs: false, belly: 0.375,
        flag: 'NEW PALETTE, UNREVIEWED — the first goldfish ever built.',
      },
      warnings: [{ axiom: 'scale', severity: 'note', text: '"bespoke-triangle-01" carries a stretch.' }],
      state: 'draft', note: '', id: 'SD-002',
    },
    {
      speciesId: 'animal-fennec-fox',
      from: 'animal-fennec-fox', fromKind: 'built',
      collection: 'night-time', givenName: 'Neegab', fact: '', factSource: '',
      def: {
        palette: { coat: 14204302, belly: 16248797, mark: 3813672 },
        belly: 0.5,
        eyes: { part: 'plate-14' },
        tail: { part: 'box-23', paint: { base: 'coat', byBand: { 5: 'mark' } } },
        snout: 'tube-01',
        nose: { part: 'box-22', paint: 'mark', sink: 0.5 },
        flag: 'THE HEIGHT IS THE TIGHTEST NUMBER IN THIS COLLECTION: 2.0100 against the pack\'s ceiling of 2.02.',
      },
      warnings: [{ axiom: 'scale', severity: 'warn', text: '"wedge-06" carries a stretch, NON-UNIFORM.' }],
      state: 'draft', note: '', id: 'SD-003',
    },
  ],
}

const legacy = () => structuredClone(LEGACY)

describe('the SD-nnn ids fold onto the animal, and nothing filled in is lost', () => {
  it('folds his three drafts onto their species — no id on a record, no counter on the file', () => {
    const out = migrate('edits', legacy())

    expect(out.drafts).toHaveLength(3)
    /* File order for the keyed rows, which is save order, which is the order he
     * made them in. */
    expect(out.drafts.map((d: any) => d.speciesId))
      .toEqual(['animal-squirrel', 'animal-goldfish', 'animal-fennec-fox'])
    for (const d of out.drafts) expect(d).not.toHaveProperty('id')
    /* The counter's own field goes with the counter. A number nothing reads and
     * nothing advances is twenty minutes of the next reader's life. */
    expect(out).not.toHaveProperty('nextId')
    expect(out.schemaVersion).toBe(1)
  })

  it('KEEPS NEEGAB: the fennec fox arrives named and in the night-time collection', () => {
    /* The whole reason the fold is field by field. `SD-003` is the only one of
     * his three that he had actually got as far as naming, so a migration that
     * dropped a record, or kept the wrong one, or kept "the first" would show up
     * here and nowhere else — silently, with a 200. */
    const fennec = migrate('edits', legacy()).drafts
      .find((d: any) => d.speciesId === 'animal-fennec-fox')

    expect(fennec.givenName).toBe('Neegab')
    expect(fennec.collection).toBe('night-time')
    /* And the animal underneath the name came with it. */
    expect(fennec.def.nose).toEqual({ part: 'box-22', paint: 'mark', sink: 0.5 })
    expect(fennec.def.flag).toContain('THE HEIGHT IS THE TIGHTEST NUMBER')
    expect(fennec.warnings).toHaveLength(1)
  })

  it('is idempotent — the server runs it on every read and every save', () => {
    /* Not a script anybody remembers to run: it fires on `/api/state` and again
     * inside `/api/save`, so a file gets migrated several times a minute while he
     * is drafting. Twice must equal once or the file drifts under him. */
    const once = migrate('edits', legacy())
    const twice = migrate('edits', once)
    expect(twice).toEqual(once)
  })

  it('leaves a file already in the new shape ALONE — the same object back, not a copy', () => {
    /* Asserted by IDENTITY (`toBe`), deliberately. Every save of every drafted
     * animal from here on runs through this, and the cheap way to be sure it is
     * not quietly rebuilding records — reordering keys, dropping an
     * `undefined`, waking the merge's `json` comparison — is that it hands the
     * very object back. */
    const already = {
      schemaVersion: 1,
      drafts: [{ speciesId: 'animal-fennec-fox', givenName: 'Neegab', def: { belly: 0.5 } }],
    }
    expect(migrate('edits', already)).toBe(already)
  })

  it('two legacy saves of one animal: the later wins, but a blank in it wipes nothing', () => {
    /* This is the shape the bug actually took — pressing Save twice was what
     * dealt a second id — so most animals with two records have a later record
     * that is a re-save of the earlier one. Records are in save order, so the
     * later one is current; but a field it says NOTHING about ('' here, and the
     * same test `json` fields already use) is not an instruction to blank the
     * name he typed once and never retyped. */
    const twice = {
      schemaVersion: 1,
      nextId: 8,
      drafts: [
        {
          id: 'SD-001', speciesId: 'animal-squirrel', givenName: 'Nutkin',
          collection: 'natural', def: { belly: 0.5 }, note: 'the first pass at him',
        },
        {
          id: 'SD-007', speciesId: 'animal-squirrel', givenName: '',
          collection: 'home-pets', def: { belly: 0.62 }, note: '',
        },
      ],
    }

    const out = migrate('edits', twice)
    expect(out.drafts).toHaveLength(1)
    expect(out.drafts[0]).toEqual({
      speciesId: 'animal-squirrel',
      givenName: 'Nutkin',                 // the later record said nothing, so this stands
      collection: 'home-pets',             // the later record meant this, so it wins
      def: { belly: 0.62 },                // and this
      note: 'the first pass at him',       // and said nothing here either
    })
  })

  it('passes a record with no speciesId through untouched, id and all', () => {
    /* There is nothing to key it by, and dropping it to tidy the file would be
     * the very subtraction the fold exists to prevent. The page cannot make one
     * — it refuses to open an animal without an id — so this is insurance. */
    const orphan = { id: 'SD-099', givenName: 'something half-made', def: { belly: 0.5 } }
    const out = migrate('edits', { schemaVersion: 1, nextId: 100, drafts: [orphan] })

    expect(out.drafts).toHaveLength(1)
    expect(out.drafts[0]).toBe(orphan)                     // literally the record it was given
    expect(out.drafts[0]).toEqual({ id: 'SD-099', givenName: 'something half-made', def: { belly: 0.5 } })
  })

  it('END TO END: his legacy file is read species-keyed and HEALED by the next save', async () => {
    /* The two places that matter, through the real server: the page's own read,
     * and the write it makes afterwards. Neither is a script — a file written by
     * an older server has to come up right on screen the first time he opens the
     * editor, and be right on disk the first time he presses Save, with nobody
     * remembering anything. */
    const his = readFileSync(join(root, REL), 'utf8')       // the drafts the tests above made
    try {
      writeFileSync(join(root, REL), JSON.stringify(LEGACY, null, 2) + '\n')

      const rows = (await pageState()).edits
      expect(rows).toHaveLength(3)
      expect(rows.map((d: any) => d.speciesId))
        .toEqual(['animal-squirrel', 'animal-goldfish', 'animal-fennec-fox'])
      for (const row of rows) expect(row).not.toHaveProperty('id')
      expect(rows.find((d: any) => d.speciesId === 'animal-fennec-fox'))
        .toMatchObject({ givenName: 'Neegab', collection: 'night-time' })

      /* Reading healed the screen. Only a save heals the file — and a save is
       * the one moment the file is provably not being edited by anyone else. */
      expect(onDisk().nextId).toBe(4)                       // still stale on disk

      const saved = await status({
        what: 'edits',
        patch: { speciesId: 'animal-fennec-fox', note: 'the ears are the whole animal' },
      })
      expect(saved.code).toBe(200)
      expect(saved.body.patched).toBe('animal-fennec-fox')

      const after = onDisk()
      expect(after).not.toHaveProperty('nextId')
      for (const d of after.drafts) expect(d).not.toHaveProperty('id')
      expect(after.drafts).toHaveLength(3)
      expect(after.drafts.find((d: any) => d.speciesId === 'animal-fennec-fox')).toMatchObject({
        givenName: 'Neegab', collection: 'night-time', note: 'the ears are the whole animal',
      })
      /* Healed, and still LF — the migration rewrites the whole file, which is
       * exactly the sort of write this repo has had CRLF sneak into before. */
      expect(readFileSync(join(root, REL), 'utf8')).not.toContain('\r')
    } finally {
      /* Put his drafts back, so nothing here depends on being the last describe. */
      writeFileSync(join(root, REL), his)
    }
  })
})
