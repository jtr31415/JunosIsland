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
 * So it is the same three promises as the queue, the names and the primitives —
 * KEEP, OWN, and ids dealt server-side — over a payload that is an OBJECT rather
 * than a sentence. That last part is the new thing here and is what most of this
 * file is about: `text` compares with `===`, and two parses of the same bytes are
 * never `===`, so a def judged as text would 409 Joe out of a draft he had not
 * changed. `def` and `warnings` are the `json` kind instead — content compared,
 * a genuine disagreement still refused.
 *
 * Everything talks HTTP to a spawned process against a THROWAWAY root, exactly
 * as `workbench.test.ts` does, so the merge under test is the real one and the
 * writes are real writes. A test that mocked the merge would prove the mock.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const draftOf = (id: string) => onDisk().drafts.find((d: any) => d.id === id)
const ids = () => onDisk().drafts.map((d: any) => d.id)
const sdNumber = (id: string) => Number(id.slice(3))

const status = async (body: unknown) => {
  const res = await fetch(base + '/api/save', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return { code: res.status, body: (await res.json()) as any }
}

/** An agent editing the file directly, after the page loaded — how it really happens. */
const agentWrites = (edit: (f: any) => void) => {
  const f = onDisk()
  edit(f)
  writeFileSync(join(root, REL), JSON.stringify(f, null, 2) + '\n')
}

/** One draft as the editor makes one: a def, no id, nothing decided about it yet. */
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

describe('the draft store arrives, and the server deals its ids', () => {
  it('is seeded with the empty shape, so the editor opens before he has drafted anything', async () => {
    /* Empty on purpose, and the opposite of the primitives bench: every record
     * here is something he MAKES, and a seeded draft would be an animal nobody
     * designed. What the seed owes is the shape and a counter at the first id. */
    expect(existsSync(join(root, REL))).toBe(true)
    expect(onDisk()).toEqual({ schemaVersion: 1, nextId: 1, drafts: [] })
  })

  it('deals SD-001, then SD-002, to drafts that arrive with no id at all', async () => {
    const page = onDisk()
    page.drafts.push(
      draft({ speciesId: 'animal-fawn', givenName: 'Fawn' }),
      draft({ speciesId: 'animal-kit', givenName: 'Kit', from: '', fromKind: 'scratch' }),
    )
    expect((await status({ what: 'edits', value: page })).code).toBe(200)

    /* The page deals nothing. It sends a draft and the server allocates inside
     * the request, against the file as it stands that instant — which is the
     * whole of why the counter is here. */
    expect(ids()).toEqual(['SD-001', 'SD-002'])
    expect(draftOf('SD-001').givenName).toBe('Fawn')
    expect(draftOf('SD-002').fromKind).toBe('scratch')
    /* Never behind the ids it has allocated into. */
    expect(onDisk().nextId).toBe(3)
  })

  it('never deals an id already held on disk OR carried in the payload', async () => {
    const page = onDisk()

    /* An agent appends a draft and never touches the counter, so the file holds
     * an id far past `nextId`. A counter read on its own hands it straight back
     * out and two drafts end up sharing an id, which is how a card was lost
     * twice before ids came server-side. */
    agentWrites(f => f.drafts.push({
      ...draft({ speciesId: 'animal-cub', givenName: 'Cub' }), id: 'SD-005',
    }))

    /* And the payload carries one the disk has never seen — a draft dealt to
     * another tab and not yet landed. The floor has to clear that too. */
    page.drafts.push({ ...draft({ speciesId: 'animal-owlet', givenName: 'Owlet' }), id: 'SD-009' })
    page.drafts.push(draft({ speciesId: 'animal-hoglet', givenName: 'Hoglet' }))

    expect((await status({ what: 'edits', value: page })).code).toBe(200)

    const after = onDisk()
    const all = after.drafts.map((d: any) => d.id)
    expect(new Set(all).size).toBe(all.length)              // no id is held twice
    expect(all).toContain('SD-005')                         // the agent's append kept its id
    expect(all).toContain('SD-009')                         // and so did the payload's
    /* Past both of them, and past the counter, which had fallen behind. */
    const his = after.drafts.find((d: any) => d.givenName === 'Hoglet')
    expect(his.id).toBe('SD-010')
    expect(after.nextId).toBeGreaterThan(Math.max(...all.map(sdNumber)))
  })

  it('THE KEEP RULE: a draft appended after the page loaded survives the page saving', async () => {
    const stale = onDisk()                                   // the copy the page holds
    agentWrites(f => f.drafts.push({
      ...draft({ speciesId: 'animal-leveret', givenName: 'Leveret', fact: 'A young hare is a leveret.', factSource: 'pipeline' }),
      id: 'SD-050',
    }))

    /* A whole-file save that has never heard of SD-050. It may not delete a
     * draft by being ignorant of it. */
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(ids()).toContain('SD-050')
    expect(draftOf('SD-050')).toMatchObject({
      givenName: 'Leveret', fact: 'A young hare is a leveret.',
    })
  })
})

describe('the def is the payload, and it is opaque', () => {
  it('a patch naming `def` changes the def and nothing else', async () => {
    const before = draftOf('SD-001')
    const def = { kit: 'quadruped', body: { w: 0.7, h: 0.44 }, ears: 'short', tail: 'brush' }

    expect((await status({ what: 'edits', patch: { id: 'SD-001', def } })).code).toBe(200)

    const after = draftOf('SD-001')
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
      const r = await status({ what: 'edits', patch: { id: 'SD-001', [field]: 'nope' } })
      expect(r.code, `${field} was accepted`).toBe(400)
      expect(r.body.error).toContain(field)
    }
    /* Nothing landed, and no stray key arrived on the record. */
    expect(draftOf('SD-001').createdAt).toBeUndefined()
    expect(onDisk().schemaVersion).toBe(1)
  })

  it('re-ordered keys are the SAME def — this is why `def` is not `text`', async () => {
    /* The case that would make the store unusable if a def were judged with
     * `===`: a payload that says exactly what the disk says, with its keys in
     * another order, because it has been through a form and a structuredClone.
     * `text` would call that a two-sided disagreement and refuse the save. */
    const page = onDisk()
    const mine = page.drafts.find((d: any) => d.id === 'SD-001')
    mine.def = { tail: 'brush', ears: 'short', body: { h: 0.44, w: 0.7 }, kit: 'quadruped' }

    const r = await status({ what: 'edits', value: page })
    expect(r.code).toBe(200)
    expect(draftOf('SD-001').def).toEqual({
      kit: 'quadruped', body: { w: 0.7, h: 0.44 }, ears: 'short', tail: 'brush',
    })
  })

  it('a two-sided disagreement about a def is a 409, exactly as one about text is', async () => {
    /* Joe re-cuts the def in the page, an agent re-cuts the same one on disk,
     * and there is no third version to say which is newer. A def is an animal;
     * losing one silently is the outcome this whole module exists to prevent. */
    const page = onDisk()
    page.drafts.find((d: any) => d.id === 'SD-001').def = { kit: 'quadruped', body: { w: 0.9 }, ears: 'huge' }
    agentWrites(f => {
      f.drafts.find((d: any) => d.id === 'SD-001').def = { kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' }
    })

    const clash = await status({ what: 'edits', value: page })
    expect(clash.code).toBe(409)
    expect(clash.body.error).toContain('SD-001')
    expect(clash.body.clashes[0]).toMatchObject({ id: 'SD-001', field: 'def' })
    /* Refused, not half-applied: the disk is exactly as the agent left it. */
    expect(draftOf('SD-001').def).toEqual({ kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' })

    /* "Exactly as text does" is an assertion, not a turn of phrase: the same
     * collision over `note` — a `text` field — answers in the same shape. */
    const words = onDisk()
    words.drafts.find((d: any) => d.id === 'SD-001').def = { kit: 'quadruped', body: { w: 0.5 }, ears: 'tiny' }
    words.drafts.find((d: any) => d.id === 'SD-001').note = 'what Joe typed'
    agentWrites(f => { f.drafts.find((d: any) => d.id === 'SD-001').note = 'what the agent recorded' })

    const onWords = await status({ what: 'edits', value: words })
    expect(onWords.code).toBe(clash.code)
    expect(Object.keys(onWords.body).sort()).toEqual(Object.keys(clash.body).sort())
    expect(onWords.body.clashes[0]).toMatchObject({ id: 'SD-001', field: 'note' })
    expect(draftOf('SD-001').note).toBe('what the agent recorded')

    /* And his own hand resolves it, because a patch says which field he changed. */
    expect((await status({ what: 'edits', patch: { id: 'SD-001', note: 'what Joe typed' } })).code).toBe(200)
    expect(draftOf('SD-001').note).toBe('what Joe typed')
  })

  it('an empty `warnings` is an absence, and never blanks the ones recorded on disk', async () => {
    const stale = onDisk()                                   // SD-002's warnings are [] here
    agentWrites(f => {
      f.drafts.find((d: any) => d.id === 'SD-002').warnings = ['ears exceed the head by 1.8×', 'no tail']
    })

    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    /* A stale page carries `[]` because it never saw the check that filled them
     * in — the same reason it carries an empty note. */
    expect(draftOf('SD-002').warnings).toEqual(['ears exceed the head by 1.8×', 'no tail'])

    /* Two different lists for the same draft is the def case again, and refused. */
    const page = onDisk()
    page.drafts.find((d: any) => d.id === 'SD-002').warnings = ['something else entirely']
    const r = await status({ what: 'edits', value: page })
    expect(r.code).toBe(409)
    expect(r.body.clashes[0]).toMatchObject({ id: 'SD-002', field: 'warnings' })
  })
})

describe('ready is a decision, and draft is the absence of one', () => {
  it("a stale 'draft' cannot un-ready a draft marked ready", async () => {
    const stale = onDisk()                                   // SD-002 is 'draft' in this copy
    expect((await status({ what: 'edits', patch: { id: 'SD-002', state: 'ready' } })).code).toBe(200)
    expect(draftOf('SD-002').state).toBe('ready')

    /* 'draft' is what every record is born as, so a payload carrying it says
     * nothing at all. An absence never unticks. */
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(draftOf('SD-002').state).toBe('ready')

    /* Putting it back is a patch — intent, said out loud. */
    expect((await status({ what: 'edits', patch: { id: 'SD-002', state: 'draft' } })).code).toBe(200)
    expect(draftOf('SD-002').state).toBe('draft')
  })

  it('the fact lands from the pipeline side without the page having to know', async () => {
    /* `fact: ''` means "queue it", and the pipeline is the other writer this
     * file was merged for. Its answer arrives on disk while the page is open. */
    const stale = onDisk()
    agentWrites(f => {
      const d = f.drafts.find((x: any) => x.id === 'SD-002')
      d.fact = 'A fox kit is born with grey fur.'
      d.factSource = 'pipeline'
    })
    expect((await status({ what: 'edits', value: stale })).code).toBe(200)
    expect(draftOf('SD-002').fact).toBe('A fox kit is born with grey fur.')

    /* And Joe overruling it in his own words is a patch, which always wins. */
    await status({ what: 'edits', patch: { id: 'SD-002', fact: 'A fox kit is born grey.', factSource: 'joe' } })
    expect(draftOf('SD-002')).toMatchObject({ fact: 'A fox kit is born grey.', factSource: 'joe' })
  })
})

describe('the file is a file like the others', () => {
  it('keeps its own order and its own formatting — two spaces, LF, trailing newline', async () => {
    const raw = readFileSync(join(root, REL), 'utf8')
    expect(raw).not.toContain('\r')          // LF, on Windows, always
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw).toContain('\n  "drafts": [')
    expect(onDisk().schemaVersion).toBe(1)
    /* Disk order, not the page's: SD-005 was appended by an agent between the
     * page's own two and has stayed exactly where the file put it. */
    expect(ids().slice(0, 3)).toEqual(['SD-001', 'SD-002', 'SD-005'])
  })

  it('did not widen the allowlist while adding itself to it', async () => {
    const r = await status({ what: 'species-edits', value: { schemaVersion: 1, nextId: 1, drafts: [] } })
    expect(r.body.error).toContain('not a writable file')
    expect(existsSync(join(root, 'joe/species-edits'))).toBe(false)
  })

  it('refuses a save that is not the shape of the file', async () => {
    const r = await status({ what: 'edits', value: { schemaVersion: 1, nextId: 1 } })
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('drafts')
    /* And the drafts are all still there. */
    expect(ids()).toContain('SD-001')
  })
})
