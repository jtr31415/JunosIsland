/**
 * The workbench, round-tripped against a real headless server.
 *
 * Everything here talks HTTP to a spawned process against a THROWAWAY root, so
 * the test exercises the same path-jail, the same seeding and the same file
 * writes Joe will, without touching `joe/` in the repo. A test that mocked the
 * server would prove the mock.
 *
 * The spec's acceptance is one line: edit → export → bake writes a playable
 * opus with the manifest updated, and an absent key says what to do rather
 * than throwing a stack trace. The bake half is proved without a network by
 * asserting the message, plus a unit test of the parts a real bake uses.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

let root: string
let child: ChildProcess
let base: string

const api = async (path: string, init?: RequestInit) => {
  const res = await fetch(base + path, init)
  return res.json() as Promise<any>
}
const post = (path: string, body: unknown, method = 'POST') =>
  api(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

beforeAll(async () => {
  root = mkdtempSync(join(tmpdir(), 'workbench-'))
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

describe('the workbench serves Joe his own files', () => {
  it('seeds the queue, the backlog and the lessons on first boot', async () => {
    const s = await api('/api/state')

    expect(s.tasks).toHaveLength(7)
    expect(s.tasks[0].id).toBe('JT-001')
    expect(s.backlog.cards.length).toBeGreaterThan(20)
    /* Monotonic and never reused: nextId must be past every seeded card. */
    const highest = Math.max(...s.backlog.cards.map((c: any) => Number(c.id.slice(3))))
    expect(s.backlog.nextId).toBeGreaterThan(highest)

    /* Appendix L, parsed rather than retyped — so the ladder must come through whole. */
    expect(s.lessons.map((l: any) => l.id)).toEqual([
      'INTRO-TEN', 'L-ADD-1', 'L-ADD-2', 'L-ADD-3', 'L-ADD-4', 'L-ADD-5',
      'L-SUB-1', 'L-SUB-2', 'L-SUB-3', 'L-SUB-4',
    ])
    const carry = s.lessons.find((l: any) => l.id === 'L-ADD-4')
    expect(carry.exemplar).toBe('8 + 5')
    expect(carry.file).toBe('lessons/add-make-ten.opus')
    expect(carry.script).toContain('fill-up-ten trick')
    /* Every lesson arrives as a proposal awaiting the red pen. */
    expect(s.lessons.every((l: any) => l.status === 'draft')).toBe(true)
    expect(s.lessons.every((l: any) => l.bake === 'unscripted')).toBe(true)
  })

  it('round-trips a lesson edit through the file on disk', async () => {
    const saved = await post('/api/lesson', {
      id: 'L-SUB-1', status: 'vetted', script: 'Taking away means counting back! Now you try yours!',
    }, 'PUT')
    expect(saved.saved).toBe('joe/lessons/L-SUB-1.md')

    const raw = readFileSync(join(root, 'joe/lessons/L-SUB-1.md'), 'utf8')
    expect(raw).toContain('status: vetted')
    expect(raw).toContain('counting back')
    /* A field the edit did not mention must survive it. */
    expect(raw).toContain('exemplar: 7 − 2')

    const s = await api('/api/state')
    expect(s.lessons.find((l: any) => l.id === 'L-SUB-1').bake).toBe('vetted')
  })

  it('refuses a status it does not know', async () => {
    const r = await post('/api/lesson', { id: 'L-SUB-2', status: 'blessed' }, 'PUT')
    expect(r.error).toContain('blessed')
  })

  it('exports the plan with the context brackets the player consumes', async () => {
    const r = await post('/api/export', {})
    expect(r.saved).toBe('docs/fred-lessons-plan.md')

    const md = readFileSync(join(root, 'docs/fred-lessons-plan.md'), 'utf8')
    expect(md).toContain('<lesson id="INTRO-TEN" exemplar="ten ones" file="lessons/intro-ten.opus">')
    expect(md).toContain('</lesson>')
    expect(md.match(/<lesson /g)).toHaveLength(10)
  })

  it('says what to do when the Azure key is absent, rather than throwing', async () => {
    const { results } = await post('/api/bake', { ids: ['L-SUB-1'] })
    expect(results[0].error).toBe('add AZURE_SPEECH_KEY to .env (repo root) and bake again')
    expect(results[0].error).not.toMatch(/at .*\.mjs/)
  })


  it('derives Done from the artefact and warns instead of overriding', async () => {
    const s = await api('/api/state')
    const vet = s.tasks.find((t: any) => t.id === 'JT-001')
    expect(vet.ok).toBe(false)
    expect(vet.warn).toContain('9 of 10 lessons still draft')

    const key = s.tasks.find((t: any) => t.id === 'JT-002')
    expect(key.warn).toContain('AZURE_SPEECH_KEY is not in .env')

    /* The evidence changes; so does the verdict. Nothing was ticked. */
    writeFileSync(join(root, '.env'), 'AZURE_SPEECH_KEY=not-a-real-key\n')
    const after = await api('/api/state')
    expect(after.tasks.find((t: any) => t.id === 'JT-002').ok).toBe(true)
  })

  /*
   * These run AFTER the artefact test above, which asserts the "no key" warning
   * and then writes one. Ordering is load-bearing: setting a key earlier would
   * make that assertion pass for the wrong reason.
   */
  it('takes the Azure key from the page and never hands it back', async () => {
    await post('/api/secrets', { AZURE_SPEECH_KEY: 'sk-not-a-real-key-9876', AZURE_SPEECH_REGION: 'westeurope' })

    /* It reaches .env, which is gitignored — the only place it is written. */
    expect(readFileSync(join(root, '.env'), 'utf8')).toContain('sk-not-a-real-key-9876')

    const s = await api('/api/state')
    expect(s.hasKey).toBe(true)
    expect(s.keyTail).toBe('…9876')
    expect(s.region).toBe('westeurope')
    /* The whole response, searched: the key itself must not appear anywhere in it. */
    expect(JSON.stringify(s)).not.toContain('sk-not-a-real-key-9876')
  })

  it('replaces a key rather than stacking a second line under it', async () => {
    await post('/api/secrets', { AZURE_SPEECH_KEY: 'second-key' })
    const env = readFileSync(join(root, '.env'), 'utf8')
    expect(env.match(/AZURE_SPEECH_KEY=/g)).toHaveLength(1)
    expect(env).toContain('second-key')
    expect(env).not.toContain('sk-not-a-real-key-9876')
    /* And it did not eat the region set alongside it. */
    expect(env).toContain('AZURE_SPEECH_REGION=westeurope')
  })

  it('lists what is actually on disk, per pack', async () => {
    const assets = await api('/api/assets')
    expect(assets.pets).toHaveLength(24)
    expect(assets.pets).toContain('animal-fox')
    /* Basenames, no extensions — the viewer compares them against registry ids. */
    expect(assets.pets.every((n: string) => !n.includes('.'))).toBe(true)
    expect(assets.tiles).toContain('hex_grass')
    expect(assets.props.length).toBeGreaterThan(20)
    expect(assets.forest.length).toBeGreaterThan(80)
  })

  it('surfaces what each run is waiting on', async () => {
    const s = await api('/api/state')
    expect(s.blocking['D.rungs']).toEqual(['JT-004'])
    expect(s.blocking['A8.bake']).toContain('JT-001')
  })

  it('keys an asset note by the id the code uses', async () => {
    await post('/api/note', { assetId: 'animal-fox', note: 'this one clips into rocks' })
    await post('/api/note', { assetId: 'Rock_1_A', note: 'too tan' })

    const file = JSON.parse(readFileSync(join(root, 'joe/asset-notes.json'), 'utf8'))
    expect(file.notes.map((n: any) => n.assetId)).toEqual(['animal-fox', 'Rock_1_A'])
    expect(file.notes[0].note).toBe('this one clips into rocks')
  })

  it('persists a task note and a done tick', async () => {
    const s = await api('/api/state')
    const tasks = s.tasks.map(({ ok, warn, ...t }: any) =>
      t.id === 'JT-006' ? { ...t, state: 'done', note: 'booth booked for Saturday' } : t)
    await post('/api/save', { what: 'tasks', value: { schemaVersion: 1, tasks, archive: [] } })

    const back = await api('/api/state')
    const t = back.tasks.find((x: any) => x.id === 'JT-006')
    expect(t.state).toBe('done')
    expect(t.note).toBe('booth booked for Saturday')
    /* Derived fields are recomputed, never persisted. */
    expect(JSON.parse(readFileSync(join(root, 'joe/tasks.json'), 'utf8')).tasks[5].warn).toBeUndefined()
    /* A done task stops blocking its run. */
    expect(back.blocking['fred-talk']).toBeUndefined()
  })
})

/**
 * Both real losses, reproduced against the real handler.
 *
 * `joe/tasks.json` has two authors — Joe in the page, agents appending from the
 * other side — and both used to POST the whole file, so the last save silently
 * overwrote the other. It cost real work twice: an agent appended JT-020 and a
 * save from a page loaded before it wiped it out (recovered later from a commit
 * blob, 3c364b4), and the same collision the other way round destroyed his
 * answer to JT-016.
 *
 * The agent's half is written to disk with `writeFileSync`, because that is
 * literally how it happens — an agent edits the file, it does not use the API.
 * The page's half goes over HTTP carrying the copy it loaded BEFORE that write,
 * which is the whole mechanism.
 */
describe('two writers, one file', () => {
  const path = () => join(root, 'joe/tasks.json')
  const onDisk = (rel = 'joe/tasks.json') => JSON.parse(readFileSync(join(root, rel), 'utf8'))
  const task = (f: any, id: string) => f.tasks.find((t: any) => t.id === id)

  /** Exactly what the page holds: the state it loaded, less the derived fields. */
  const pageCopy = async () => {
    const s = await api('/api/state')
    return {
      schemaVersion: 1,
      tasks: s.tasks.map(({ ok, warn, ...t }: any) => t),
      archive: s.archive,
    }
  }

  /** An agent, editing the file directly, after the page loaded. */
  const agentWrites = (edit: (f: any) => void, rel = 'joe/tasks.json') => {
    const f = onDisk(rel)
    edit(f)
    writeFileSync(join(root, rel), JSON.stringify(f, null, 2) + '\n')
  }

  const status = async (body: unknown) => {
    const res = await fetch(base + '/api/save', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    return { code: res.status, body: (await res.json()) as any }
  }

  it('the JT-020 loss: a task appended after the page loaded survives the page saving', async () => {
    const stale = await pageCopy()
    agentWrites(f => f.tasks.push({
      id: 'JT-099', type: 'decision', title: 'appended while the page was open',
      detail: 'the ruling an agent added after Joe opened the workbench',
      doneRule: 'manual', note: '', state: 'open',
    }))

    const r = await status({ what: 'tasks', value: stale })
    expect(r.code).toBe(200)

    /* The save had never heard of JT-099. It is still there. */
    expect(onDisk().tasks.map((t: any) => t.id)).toContain('JT-099')
    expect(task(onDisk(), 'JT-099').title).toBe('appended while the page was open')
  })

  it("a note the page carries lands on a task whose disk copy has none — and so does the agent's", async () => {
    /* Both halves at once, because only the pair is a real test. A payload note
     * landing on an empty field passes with no merge at all — the old code wrote
     * the payload verbatim. What it could not do is land Joe's note WITHOUT
     * destroying the note an agent wrote to a different task meanwhile. */
    const page = await pageCopy()
    page.tasks.find((t: any) => t.id === 'JT-004').note = 'ask her teacher which word they use'
    agentWrites(f => { task(f, 'JT-003').note = 'recast the owl, Joe said so on the phone' })

    expect((await status({ what: 'tasks', value: page })).code).toBe(200)
    expect(task(onDisk(), 'JT-004').note).toBe('ask her teacher which word they use')
    expect(task(onDisk(), 'JT-003').note).toBe('recast the owl, Joe said so on the phone')
  })

  it('the JT-016 loss, reversed: a stale empty note never blanks the one on disk', async () => {
    const stale = await pageCopy()                      // JT-005's note is '' here
    agentWrites(f => { task(f, 'JT-005').note = "Joe's answer, recorded by an agent" })

    const r = await status({ what: 'tasks', value: stale })
    expect(r.code).toBe(200)
    /* An empty note in a stale payload is an echo of an absence, not an
     * instruction to blank something. */
    expect(task(onDisk(), 'JT-005').note).toBe("Joe's answer, recorded by an agent")
  })

  it('two different notes for one task is a 409 that writes nothing', async () => {
    const stale = await pageCopy()
    stale.tasks.find((t: any) => t.id === 'JT-007').note = 'what Joe typed'
    agentWrites(f => { task(f, 'JT-007').note = 'what the agent recorded' })

    const r = await status({ what: 'tasks', value: stale })
    expect(r.code).toBe(409)
    expect(r.body.error).toContain('JT-007')
    expect(r.body.clashes[0]).toMatchObject({ id: 'JT-007', field: 'note' })
    /* Refused, not half-applied: the disk is exactly as the agent left it. */
    expect(task(onDisk(), 'JT-007').note).toBe('what the agent recorded')
  })

  it("a patch is Joe's note winning outright — and it is the only way to clear one", async () => {
    /* The 409 above is resolvable, and his rule is that his notes win. The page
     * sends a patch, which says which field he changed, so there is nothing to
     * guess about. */
    expect((await status({ what: 'tasks', patch: { id: 'JT-007', note: 'what Joe typed' } })).code).toBe(200)
    expect(task(onDisk(), 'JT-007').note).toBe('what Joe typed')

    expect((await status({ what: 'tasks', patch: { id: 'JT-007', note: '' } })).code).toBe(200)
    expect(task(onDisk(), 'JT-007').note).toBe('')
  })

  it('a stale tick cannot un-tick what an agent marked done', async () => {
    const stale = await pageCopy()                      // JT-004 is 'open' in this copy
    agentWrites(f => { task(f, 'JT-004').state = 'done' })

    expect((await status({ what: 'tasks', value: stale })).code).toBe(200)
    /* 'open' is what a task is born as — an absence of a decision, and an
     * absence never unticks. Re-opening it is a patch, said out loud. */
    expect(task(onDisk(), 'JT-004').state).toBe('done')
    expect((await status({ what: 'tasks', patch: { id: 'JT-004', state: 'open' } })).code).toBe(200)
    expect(task(onDisk(), 'JT-004').state).toBe('open')
  })

  it('never takes a field off the payload that the page does not own', async () => {
    const stale = await pageCopy()
    const forged = stale.tasks.find((t: any) => t.id === 'JT-001')
    forged.title = 'rewritten by a stale page'
    forged.blocks = []
    agentWrites(f => { task(f, 'JT-001').detail = 'the agent sharpened the wording' })

    expect((await status({ what: 'tasks', value: stale })).code).toBe(200)
    const after = task(onDisk(), 'JT-001')
    expect(after.title).toBe('Vet the lesson scripts')
    expect(after.blocks).toContain('A8.bake')
    expect(after.detail).toBe('the agent sharpened the wording')

    /* And a patch may not smuggle one in either. */
    const r = await status({ what: 'tasks', patch: { id: 'JT-001', title: 'nope' } })
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('title')
    expect(task(onDisk(), 'JT-001').title).toBe('Vet the lesson scripts')
  })

  it('adds a backlog card without reverting the cards it loaded stale', async () => {
    const before = await api('/api/state')
    const stale = JSON.parse(JSON.stringify(before.backlog))
    agentWrites(f => { f.cards[0].state = 'done' }, 'joe/backlog.json')

    const id = 'PB-' + String(stale.nextId).padStart(3, '0')
    stale.cards.push({ id, title: 'a card Joe added', detail: '', state: 'open', run: '' })
    stale.nextId += 1
    expect((await status({ what: 'backlog', value: stale })).code).toBe(200)

    const after = onDisk('joe/backlog.json')
    expect(after.cards.map((c: any) => c.id)).toContain(id)      // his add landed
    expect(after.cards[0].state).toBe('done')                     // the agent's change survived it
    expect(after.nextId).toBe(stale.nextId)
  })

  /*
   * The third loss in the same shape, and the one that renumbered a card.
   *
   * The merge protected the card ARRAY and left the ID SPACE unguarded. Cards
   * were dealt ids in the page, out of `nextId` as it stood when the page
   * loaded, so a card Joe added from a tab that had been open a while arrived
   * carrying an id an agent had already given the live-bug card. It looked like
   * an edit of that card, was folded into it, and was lost with a 200 —
   * manager run 8 saw it happen twice, which is why the live bug is carded as
   * `PB-050` while `d6f99c6` and the orders call the same work `PB-048`.
   *
   * The agent's half is a direct `writeFileSync` again, because that is how it
   * happens; the page's half goes over HTTP carrying the copy it loaded first.
   */
  const backlog = () => onDisk('joe/backlog.json')
  const pbNumber = (id: string) => Number(id.slice(3))
  const cardsAdded = (f: any, title: string) => f.cards.filter((c: any) => c.title === title)

  it('the PB-048 collision: an id dealt twice keeps both cards, and moves only the newcomer', async () => {
    const page = JSON.parse(JSON.stringify((await api('/api/state')).backlog))
    const taken = 'PB-' + String(page.nextId).padStart(3, '0')

    /* An agent commits the live-bug card straight to the file, taking the very
     * id the tab Joe has open is about to deal itself. */
    agentWrites(f => {
      f.cards.push({
        id: taken, title: 'an abandoned tile follows her around',
        detail: 'the live bug, raised by an agent while his page was open',
        state: 'open', run: '8',
      })
      f.nextId += 1
    }, 'joe/backlog.json')

    /* Joe types a card into that page and hits Add. It deals itself `taken`. */
    page.cards.push({ id: taken, title: 'a card Joe typed meanwhile', detail: 'his own', state: 'open', run: '' })
    page.nextId += 1
    expect((await status({ what: 'backlog', value: page })).code).toBe(200)

    const after = backlog()
    const ids = after.cards.map((c: any) => c.id)
    expect(new Set(ids).size).toBe(ids.length)                 // no id is held twice
    /* Whoever got there first keeps the id: nothing already written is renumbered. */
    expect(after.cards.find((c: any) => c.id === taken).title).toBe('an abandoned tile follows her around')
    /* And his card is still here — under an id nothing else holds. */
    const his = cardsAdded(after, 'a card Joe typed meanwhile')
    expect(his).toHaveLength(1)
    expect(his[0].id).not.toBe(taken)
    expect(his[0].detail).toBe('his own')
    expect(after.nextId).toBeGreaterThan(pbNumber(his[0].id))
  })

  it('deals an id the file does not already hold, however far behind the counter has fallen', async () => {
    const page = JSON.parse(JSON.stringify((await api('/api/state')).backlog))

    /* An agent appends two cards and never touches the counter, so the file now
     * holds ids at and past `nextId`. A counter read on its own deals one of
     * them straight back out. */
    agentWrites(f => {
      f.cards.push({ id: 'PB-' + String(f.nextId).padStart(3, '0'), title: 'appended without bumping the counter', detail: '', state: 'open', run: '' })
      f.cards.push({ id: 'PB-' + String(f.nextId + 1).padStart(3, '0'), title: 'and the one after it', detail: '', state: 'open', run: '' })
    }, 'joe/backlog.json')

    page.cards.push({ id: 'PB-' + String(page.nextId).padStart(3, '0'), title: 'his next card', detail: '', state: 'open', run: '' })
    page.nextId += 1
    expect((await status({ what: 'backlog', value: page })).code).toBe(200)

    const after = backlog()
    const ids = after.cards.map((c: any) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(cardsAdded(after, 'his next card')).toHaveLength(1)
    expect(cardsAdded(after, 'appended without bumping the counter')).toHaveLength(1)
    /* The counter healed: it is past every id in the file it allocates into. */
    expect(after.nextId).toBeGreaterThan(Math.max(...ids.map(pbNumber)))
  })

  it('deals the id server-side when the page leaves it to the file', async () => {
    const page = JSON.parse(JSON.stringify((await api('/api/state')).backlog))
    /* What the page sends now: a card with no id, and the counter untouched. */
    page.cards.push({ title: 'a card from a page that deals no ids', detail: '', state: 'open', run: '' })
    expect((await status({ what: 'backlog', value: page })).code).toBe(200)

    const after = backlog()
    expect(after.cards.every((c: any) => /^PB-\d{3}$/.test(c.id ?? ''))).toBe(true)
    const his = cardsAdded(after, 'a card from a page that deals no ids')
    expect(his).toHaveLength(1)
    expect(pbNumber(his[0].id)).toBeGreaterThanOrEqual(page.nextId)
    expect(after.nextId).toBeGreaterThan(pbNumber(his[0].id))
  })

  it('a stale copy of a card an agent retitled is still that card, not a second one', async () => {
    /* The other side of the same judgement. A payload record that disagrees
     * with the disk about a field the page cannot edit is only a NEW card if
     * the payload's counter also says it was dealt in this save. Without that
     * second signal every stale echo would breed a duplicate. */
    const page = JSON.parse(JSON.stringify((await api('/api/state')).backlog))
    const victim = page.cards[1].id
    agentWrites(f => { f.cards.find((c: any) => c.id === victim).title = 'the agent sharpened the wording' }, 'joe/backlog.json')

    /* An old page, still dealing its own ids — so the counter signal is live
     * for the card being added and must stay dead for the one merely echoed. */
    page.cards.push({ id: 'PB-' + String(page.nextId).padStart(3, '0'), title: 'the add that carried the stale copy', detail: '', state: 'open', run: '' })
    page.nextId += 1
    expect((await status({ what: 'backlog', value: page })).code).toBe(200)

    const after = backlog()
    expect(after.cards.filter((c: any) => c.id === victim)).toHaveLength(1)
    expect(after.cards.find((c: any) => c.id === victim).title).toBe('the agent sharpened the wording')
    /* Not re-dealt under a fresh id with its old title alongside. */
    expect(after.cards.filter((c: any) => c.title === page.cards[1].title)).toHaveLength(0)
    expect(cardsAdded(after, 'the add that carried the stale copy')).toHaveLength(1)
  })

  it('keeps the file in ITS order and ITS formatting — two spaces, LF, trailing newline', async () => {
    /* Inserted in the middle, not appended, so "kept" and "kept where it was"
     * are different assertions and both get made. */
    const stale = await pageCopy()
    agentWrites(f => f.tasks.splice(2, 0, {
      id: 'JT-098', type: 'decision', title: 'slotted in beside the one it belongs with',
      detail: 'an agent files a ruling next to its neighbour, not at the end',
      doneRule: 'manual', note: '', state: 'open',
    }))
    expect((await status({ what: 'tasks', value: stale })).code).toBe(200)

    const after = onDisk()
    expect(after.tasks.map((t: any) => t.id).slice(0, 4)).toEqual(['JT-001', 'JT-002', 'JT-098', 'JT-003'])
    expect(after.schemaVersion).toBe(1)

    const raw = readFileSync(path(), 'utf8')
    expect(raw).not.toContain('\r')          // LF, on Windows, always
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw).toContain('\n  "tasks": [')  // two spaces, as `writeJson` has always written it
  })
})

/**
 * PB-036: the pet-name audit, and the merge that has to hold under it.
 *
 * The same two-writer shape as the queue, from the worse direction. The LIST is
 * generated — an agent rewrites every row whenever the roster moves — while
 * three fields of each row are Joe's judgement, made once, by reading the name
 * out loud and deciding whether a six-year-old can say it and whether it is a
 * rude word in disguise. Regenerating the file must therefore be incapable of
 * costing him that, or the audit is work that can be destroyed by a build step.
 *
 * The generator's half is written with `writeFileSync` where it stands in for
 * an agent editing the file (that is how it really happens), and posted as a
 * whole `value` where the point is what the MERGE does with it.
 */
describe('the pet-name audit', () => {
  const REL = 'joe/names-audit.json'
  const onDisk = () => JSON.parse(readFileSync(join(root, REL), 'utf8'))
  const row = (id: string) => onDisk().names.find((n: any) => n.id === id)

  const status = async (body: unknown) => {
    const res = await fetch(base + '/api/save', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    return { code: res.status, body: (await res.json()) as any }
  }

  /** What the generator produces: every field filled but Joe's three. */
  const generated = () => ({
    schemaVersion: 1,
    names: [
      ['natural/animal-hedgehog', 'natural', 'animal-hedgehog', 'Hedgehog', 'garden', 'short', 'Bimo'],
      ['natural/animal-fox', 'natural', 'animal-fox', 'Fox', 'garden', 'long', 'Rusanna'],
      ['natural/animal-owl', 'natural', 'animal-owl', 'Owl', 'woodland', 'short', 'Whoop'],
      ['dawn/animal-deer', 'dawn', 'animal-deer', 'Deer', 'woodland', 'long', 'Fennimore'],
    ].map(([id, setId, speciesId, species, collection, band, name]) =>
      ({ id, setId, speciesId, species, collection, band, name, verdict: '', replacement: '', note: '' })),
  })

  /** The generator, run again, straight onto the file — no API, as it happens. */
  const regenerate = () => writeFileSync(join(root, REL), JSON.stringify(generated(), null, 2) + '\n')

  it('is seeded on first boot with a shape the page can patch', async () => {
    /* Empty on purpose: the rows come from the roster, not from the seeder. What
     * the seed guarantees is that the file EXISTS, so the panel opens and a
     * patch has somewhere to land before the generator has ever run. */
    expect(existsSync(join(root, REL))).toBe(true)
    expect(onDisk()).toEqual({ schemaVersion: 1, names: [] })
    expect((await api('/api/state')).names).toEqual([])
  })

  it('serves the generated list and takes a verdict, a replacement and a note', async () => {
    regenerate()
    const s = await api('/api/state')
    expect(s.names.map((n: any) => n.id)).toEqual([
      'natural/animal-hedgehog', 'natural/animal-fox', 'natural/animal-owl', 'dawn/animal-deer',
    ])
    expect(s.names[0]).toMatchObject({ species: 'Hedgehog', collection: 'garden', band: 'short', name: 'Bimo', verdict: '' })

    expect((await status({ what: 'names', patch: { id: 'natural/animal-hedgehog', verdict: 'ok' } })).code).toBe(200)
    expect((await status({
      what: 'names',
      patch: { id: 'natural/animal-owl', verdict: 'reject', replacement: 'Hoot', note: 'reads as a noise, not a name' },
    })).code).toBe(200)

    expect(row('natural/animal-hedgehog').verdict).toBe('ok')
    expect(row('natural/animal-owl')).toMatchObject({
      verdict: 'reject', replacement: 'Hoot', note: 'reads as a noise, not a name',
    })
    /* The generated fields are untouched by his verdict. */
    expect(row('natural/animal-owl').name).toBe('Whoop')

    /* The file is still the file: roster order, two spaces, LF, trailing newline. */
    const raw = readFileSync(join(root, REL), 'utf8')
    expect(onDisk().names.map((n: any) => n.id)).toEqual(generated().names.map(n => n.id))
    expect(raw).not.toContain('\r')
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw).toContain('\n  "names": [')
  })

  it('a regenerated list never walks over a verdict, a replacement or a note', async () => {
    regenerate()
    await status({ what: 'names', patch: { id: 'natural/animal-fox', verdict: 'reject', replacement: 'Rusty', note: 'four syllables is two too many' } })
    await status({ what: 'names', patch: { id: 'natural/animal-owl', verdict: 'ok' } })

    /* The roster moves and the generator runs again — through the API, with
     * every one of Joe's fields blank, exactly as it produces them. */
    const fresh = generated()
    fresh.names.push({
      id: 'dawn/animal-badger', setId: 'dawn', speciesId: 'animal-badger', species: 'Badger',
      collection: 'woodland', band: 'short', name: 'Tuck', verdict: '', replacement: '', note: '',
    })
    expect((await status({ what: 'names', value: fresh })).code).toBe(200)

    const fox = row('natural/animal-fox')
    expect(fox.verdict).toBe('reject')
    expect(fox.replacement).toBe('Rusty')
    expect(fox.note).toBe('four syllables is two too many')
    expect(row('natural/animal-owl').verdict).toBe('ok')
    /* And the name it did not know about is on the list to be judged. */
    expect(row('dawn/animal-badger').name).toBe('Tuck')
  })

  it("an 'ok' cannot be un-ticked by a blank verdict, but his own hand can clear it", async () => {
    regenerate()
    await status({ what: 'names', patch: { id: 'natural/animal-hedgehog', verdict: 'ok' } })

    /* '' is the absence of a decision — what every name is born with and what a
     * regenerated row carries. An absence never unticks anything. */
    expect((await status({ what: 'names', value: generated() })).code).toBe(200)
    expect(row('natural/animal-hedgehog').verdict).toBe('ok')

    /* A patch is intent, said out loud, so it clears it. */
    expect((await status({ what: 'names', patch: { id: 'natural/animal-hedgehog', verdict: '' } })).code).toBe(200)
    expect(row('natural/animal-hedgehog').verdict).toBe('')
  })

  it('the owns kinds are the judgement: prose is refused, a token is not', async () => {
    regenerate()
    await status({ what: 'names', patch: { id: 'natural/animal-fox', verdict: 'ok', replacement: 'Rusty', note: 'his own words' } })

    /* A verdict is a token — one click, visible when wrong, and the only writer
     * that ever carries a meaningful one is a page echoing Joe himself. It is a
     * flag, so a disagreeing one lands. */
    const flag = generated()
    flag.names.find(n => n.id === 'natural/animal-fox')!.verdict = 'reject'
    expect((await status({ what: 'names', value: flag })).code).toBe(200)
    expect(row('natural/animal-fox').verdict).toBe('reject')

    /* His words are not. Two meaningful notes and no third version to break the
     * tie is a 409 that writes NOTHING, rather than a guess. */
    const prose = generated()
    prose.names.find(n => n.id === 'natural/animal-fox')!.note = 'a note no agent should have'
    const clash = await status({ what: 'names', value: prose })
    expect(clash.code).toBe(409)
    expect(clash.body.clashes[0]).toMatchObject({ id: 'natural/animal-fox', field: 'note' })
    expect(row('natural/animal-fox').note).toBe('his own words')

    /* The replacement is his words too — the name he wants instead. */
    const stolen = generated()
    stolen.names.find(n => n.id === 'natural/animal-fox')!.replacement = 'Vixen'
    expect((await status({ what: 'names', value: stolen })).code).toBe(409)
    expect(row('natural/animal-fox').replacement).toBe('Rusty')
  })

  /*
   * The built-animal sign-off, which lands in these same rows.
   *
   * JT-031: *"have an agent create the facts and fact check them. they then
   * become part of my final sign off for each animal along with its name."* So
   * one row is one creature's whole bench and `signoff` is the single gate over
   * it. It goes through the SAME merge — there is no second persistence route —
   * which is what these three prove.
   */
  it('takes a sign-off, and a strike against the fact, on the same row as the name', async () => {
    regenerate()
    expect((await status({
      what: 'names',
      patch: { id: 'natural/animal-fox', signoff: 'ok', factVerdict: 'reject', factNote: 'a fox is not a dog' },
    })).code).toBe(200)

    expect(row('natural/animal-fox')).toMatchObject({
      signoff: 'ok', factVerdict: 'reject', factNote: 'a fox is not a dog',
    })
    /* The name's own verdict is a different judgement and is untouched by it. */
    expect(row('natural/animal-fox').verdict).toBe('')
    expect(row('natural/animal-fox').name).toBe('Rusanna')

    /* And it is visible to the next page that asks — the viewer resumes from
     * this and nothing else, with no agent running. */
    const s = await api('/api/state')
    expect(s.names.find((n: any) => n.id === 'natural/animal-fox').signoff).toBe('ok')
  })

  it('a regenerated list cannot untick a sign-off, and his own hand can', async () => {
    regenerate()
    await status({ what: 'names', patch: { id: 'natural/animal-owl', signoff: 'ok' } })

    /* The generator does not know `signoff` exists — its rows carry no such key
     * at all. An absent field is the absence of a decision, exactly as '' is,
     * so it can never walk over one he has made. */
    expect(generated().names[0]).not.toHaveProperty('signoff')
    expect((await status({ what: 'names', value: generated() })).code).toBe(200)
    expect(row('natural/animal-owl').signoff).toBe('ok')

    /* A patch is intent, said out loud, so it re-opens it. */
    expect((await status({ what: 'names', patch: { id: 'natural/animal-owl', signoff: '' } })).code).toBe(200)
    expect(row('natural/animal-owl').signoff).toBe('')
  })

  it('his note about a fact is his words, and is never guessed at', async () => {
    regenerate()
    await status({ what: 'names', patch: { id: 'natural/animal-owl', factNote: 'owls do not turn their heads all the way round' } })

    const rewritten = generated() as any
    rewritten.names.find((n: any) => n.id === 'natural/animal-owl').factNote = 'something an agent decided'
    const clash = await status({ what: 'names', value: rewritten })
    expect(clash.code).toBe(409)
    expect(clash.body.clashes[0]).toMatchObject({ id: 'natural/animal-owl', field: 'factNote' })
    expect(row('natural/animal-owl').factNote).toBe('owls do not turn their heads all the way round')
  })

  /*
   * The facts file is READ and never written.
   *
   * A separate agent drafts and checks the sentences into
   * `joe/species-facts.json`, so it has exactly one author and there is nothing
   * for the merge to arbitrate. Keeping it out of `WRITABLE` is what makes that
   * true by construction rather than by everyone remembering.
   */
  it('serves the species facts raw, and refuses to write them', async () => {
    /* Absent until that agent lands, which is the state the viewer opens in. */
    expect(existsSync(join(root, 'joe/species-facts.json'))).toBe(false)
    expect((await api('/api/state')).facts).toBe(null)

    const file = { schemaVersion: 1, facts: [{ speciesId: 'animal-fox', fact: 'A fox is a mammal.', check: 'verified' }] }
    writeFileSync(join(root, 'joe/species-facts.json'), JSON.stringify(file, null, 2) + '\n')
    /* Passed through unreshaped: the shape is the drafting agent's to settle,
     * and a normaliser this end would quietly disagree with the one that
     * renders it. */
    expect((await api('/api/state')).facts).toEqual(file)

    const r = await status({ what: 'facts', value: { facts: [] } })
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('not a writable file')
    /* And the file the agent owns is exactly as it left it. */
    expect(JSON.parse(readFileSync(join(root, 'joe/species-facts.json'), 'utf8'))).toEqual(file)
  })

  it('refuses a patch for a field the page does not own', async () => {
    regenerate()
    const r = await status({ what: 'names', patch: { id: 'natural/animal-fox', species: 'Otter' } })
    expect(r.code).toBe(400)
    expect(r.body.error).toContain('species')
    expect(row('natural/animal-fox').species).toBe('Fox')
  })

  it('did not widen the allowlist while adding itself to it', async () => {
    /* The key is the whole allowlist — a near miss is not a file. */
    const r = await status({ what: 'names-audit', value: { schemaVersion: 1, names: [] } })
    expect(r.body.error).toContain('not a writable file')
    expect(existsSync(join(root, 'joe/names-audit'))).toBe(false)
  })
})

/**
 * PB-036 phase 4: the primitives sign-off, through the same merge.
 *
 * Joe, on the fix for 72 animals that are too square with legs and feet too big:
 * *"i'd like to sign off the primitives to be used first."* So the rows are
 * SHAPE DECISIONS, eight fields of measurement apiece with file:line provenance,
 * and exactly two fields — `signoff` and `note` — that are his. The measured
 * eight are rewritten wholesale every time anyone measures the Kenney pack
 * again, so the whole surface turns on whether that rewrite can cost him a
 * verdict. It cannot, and there is no second persistence route for it to cost
 * him one down: it is `/api/save`, `WRITABLE` and `MERGEABLE`, the same three
 * the names audit uses.
 */
describe('the primitives sign-off', () => {
  const REL = 'joe/primitives-audit.json'
  const onDisk = () => JSON.parse(readFileSync(join(root, REL), 'utf8'))
  const rowOf = (id: string) => onDisk().rows.find((r: any) => r.id === id)

  const status = async (body: unknown) => {
    const res = await fetch(base + '/api/save', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    return { code: res.status, body: (await res.json()) as any }
  }

  /** An agent that has measured the pack again, rewriting every measured field. */
  const remeasure = (mark: string) => {
    const file = onDisk()
    for (const r of file.rows) {
      r.packSays = `${mark}: the pack`
      r.kitSays = `${mark}: the kits`
      r.gap = `${mark}: the gap`
      r.proposal = `${mark}: the proposal`
      r.evidence = `${mark}: some/file.ts:1`
      r.title = `${mark}: title`
      r.question = `${mark}: question?`
    }
    return file
  }

  it('is seeded with its rows, so his review hour needs nothing running but this', async () => {
    /* The opposite decision from `names-audit.json`, and deliberately: a name is
     * generated off the roster so seeding one would be a second copy of a table
     * the code owns, while a primitive is a MEASUREMENT and `seed.mjs` holds the
     * only copy there is. */
    expect(existsSync(join(root, REL))).toBe(true)
    const rows = (await api('/api/state')).primitives
    expect(rows.map((r: any) => r.id)).toEqual([
      'eye-size', 'eye-relief', 'eye-collisions',
      'edge-shading', 'edge-bevel',
      'leg-adopt', 'tail-wing-adopt', 'body-stays-procedural',
    ])
    /* Unjudged, every one. A seed that arrived with a tick on it would be a
     * forgery of the one thing on the file that is his. */
    expect(rows.every((r: any) => r.signoff === '' && r.note === '')).toBe(true)
    /* And the measurement is actually there to read — an empty row is a row he
     * cannot decide. */
    expect(rows[0].packSays).toContain('0.400 × 0.320')
    expect(rows[0].evidence).toContain('quadruped.ts:296-302')
  })

  it('takes a sign-off, a rejection and a note, and gives them back', async () => {
    expect((await status({ what: 'primitives', patch: { id: 'edge-shading', signoff: 'ok' } })).code).toBe(200)
    expect((await status({
      what: 'primitives',
      patch: { id: 'eye-relief', signoff: 'reject', note: 'not until the third geometry type is ruled on' },
    })).code).toBe(200)

    expect(rowOf('edge-shading').signoff).toBe('ok')
    expect(rowOf('eye-relief')).toMatchObject({
      signoff: 'reject', note: 'not until the third geometry type is ruled on',
    })
    /* The measured fields are untouched by his verdict. */
    expect(rowOf('eye-relief').packSays).toContain('0.0100 units in front of the head')

    /* Visible to the next page that asks — the viewer resumes from this and
     * nothing else, with no agent running. */
    const s = await api('/api/state')
    expect(s.primitives.find((r: any) => r.id === 'edge-shading').signoff).toBe('ok')

    /* The file is still the file: its own order, two spaces, LF, trailing newline. */
    const raw = readFileSync(join(root, REL), 'utf8')
    expect(raw).not.toContain('\r')
    expect(raw.endsWith('\n')).toBe(true)
    expect(raw).toContain('\n  "rows": [')
  })

  it('THE CONTRACT: a whole-file re-measurement can never cost him a verdict', async () => {
    await status({ what: 'primitives', patch: { id: 'leg-adopt', signoff: 'ok', note: 'yes — adopt the leg' } })
    await status({ what: 'primitives', patch: { id: 'edge-bevel', signoff: 'reject' } })

    /* Every measured field rewritten and his two blank, exactly as a generator
     * produces them, plus a row nobody has measured before. */
    const fresh = remeasure('RE-MEASURED')
    for (const r of fresh.rows) { r.signoff = ''; r.note = '' }
    fresh.rows.push({
      id: 'head-body', group: 'Limbs', title: 'how big a head is against a body',
      question: 'is it right?', packSays: 'measured', kitSays: 'measured', gap: 'x',
      proposal: 'y', evidence: 'z', signoff: '', note: '',
    })
    expect((await status({ what: 'primitives', value: fresh })).code).toBe(200)

    expect(rowOf('leg-adopt')).toMatchObject({ signoff: 'ok', note: 'yes — adopt the leg' })
    expect(rowOf('edge-bevel').signoff).toBe('reject')
    /* The row it had never heard of is on the bench to be judged. */
    expect(rowOf('head-body').title).toBe('how big a head is against a body')

    /*
     * AND THE OTHER DIRECTION, which is the half that surprised me and is worth
     * pinning: the payload could not rewrite a MEASURED field either.
     * `mergeWhole` takes only the fields the page owns off the payload and reads
     * everything else off the copy the server just read, so `/api/save` is not
     * a route by which a re-measurement lands at all. It lands the way it really
     * happens — an agent writing the file — which is why `primitives.ts`
     * exports `regenerate()` and why that function is tested separately.
     *
     * This is a good property, not a gap. It means a stale page cannot revert a
     * measurement any more than an agent can revert a verdict.
     */
    expect(rowOf('leg-adopt').packSays).not.toBe('RE-MEASURED: the pack')
    expect(rowOf('leg-adopt').packSays).toContain('24 unique vertex positions')
    expect(rowOf('leg-adopt').evidence).toContain('quadruped.ts:248-262')
  })

  it('a generator that has never heard of `signoff` cannot untick one either', async () => {
    await status({ what: 'primitives', patch: { id: 'eye-size', signoff: 'ok' } })

    /* Rows carrying no such key at all — which is what a generator written
     * before the field existed produces. An ABSENT field is the absence of a
     * decision, exactly as '' is. */
    const fresh = remeasure('AGAIN')
    for (const r of fresh.rows) { delete r.signoff; delete r.note }
    expect((await status({ what: 'primitives', value: fresh })).code).toBe(200)
    expect(rowOf('eye-size').signoff).toBe('ok')

    /* A patch is intent, said out loud, so his own hand re-opens it. */
    expect((await status({ what: 'primitives', patch: { id: 'eye-size', signoff: '' } })).code).toBe(200)
    expect(rowOf('eye-size').signoff).toBe('')
  })

  it('his note is his words, and a disagreement is a 409 that writes nothing', async () => {
    await status({ what: 'primitives', patch: { id: 'eye-collisions', note: 'do the whiskers in the same change' } })

    const forged = remeasure('FORGED')
    forged.rows.find((r: any) => r.id === 'eye-collisions').note = 'something an agent decided'
    const clash = await status({ what: 'primitives', value: forged })
    expect(clash.code).toBe(409)
    expect(clash.body.clashes[0]).toMatchObject({ id: 'eye-collisions', field: 'note' })
    expect(rowOf('eye-collisions').note).toBe('do the whiskers in the same change')
    /* Refused, not half-applied: the sign-off set earlier in this file is
     * exactly where it was, and so is every other row's. */
    expect(rowOf('edge-shading').signoff).toBe('ok')
  })

  it('refuses a patch for a measured field — nobody edits the evidence from the page', async () => {
    /* The load-bearing half of the ownership split. A page that could rewrite
     * `packSays` could quietly change what he signed off, after he signed it. */
    for (const field of ['packSays', 'evidence', 'proposal', 'group']) {
      const r = await status({ what: 'primitives', patch: { id: 'eye-size', [field]: 'nope' } })
      expect(r.code, `${field} was accepted`).toBe(400)
      expect(r.body.error).toContain(field)
    }
    expect(rowOf('eye-size').packSays).toContain('0.400 × 0.320')
  })

  it('did not widen the allowlist while adding itself to it', async () => {
    const r = await status({ what: 'primitives-audit', value: { schemaVersion: 1, rows: [] } })
    expect(r.body.error).toContain('not a writable file')
    expect(existsSync(join(root, 'joe/primitives-audit'))).toBe(false)
  })
})

/**
 * The reading-words ledger, through the same merge `names` and `primitives`
 * use — added after review found the first cut of this bench used a
 * whole-file save with no `MERGEABLE` entry, which is exactly the JT-020/
 * JT-016 shape at a much bigger scale: the next task has an agent appending
 * 150-200 drafted rows to this same file while Joe rules on rows in the page
 * at his own pace, and a whole-file save with no merge silently erases
 * whichever side saved second.
 *
 * `id` is `${rung}/${word}` — the `names-audit.json` convention
 * (`natural/<speciesId>`) applied to a ledger keyed by rung and spelling
 * rather than a roster slot. No counter: an agent deals the id when it drafts
 * the row, exactly as `primitives`' slugs are dealt by whoever measures the
 * pack, so there is no id space here for two writers to race over.
 */
describe('the reading-words ledger', () => {
  const REL = 'joe/words-audit.json'
  /* `root` is only assigned inside `beforeAll`, so these must be functions and
   * not `describe`-body constants — the body runs at collection time, before
   * `beforeAll` has run, and `root` would still be `undefined`. */
  const rungWordsPath = () => join(root, 'src/core/rung-words.ts')
  const onDisk = () => JSON.parse(readFileSync(join(root, REL), 'utf8'))
  const rowOf = (id: string) => onDisk().words.find((r: any) => r.id === id)

  const status = async (body: unknown) => {
    const res = await fetch(base + '/api/save', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    })
    return { code: res.status, body: (await res.json()) as any }
  }

  /** What a drafting batch produces: every field filled but Joe's three. */
  const draft = (word: string, rung: number) =>
    ({ id: `${rung}/${word}`, word, rung, verdict: '', replacement: '', note: '' })

  /** An agent's drafting tool, appending straight to the file — no API, which
   *  is how `PB-032`'s Run D batches are described landing. */
  const agentAppends = (...rows: ReturnType<typeof draft>[]) => {
    const f = existsSync(join(root, REL)) ? onDisk() : { schemaVersion: 1, words: [] }
    f.words.push(...rows)
    writeFileSync(join(root, REL), JSON.stringify(f, null, 2) + '\n')
  }

  /** A clean ledger, so one test's rows never leak into the next. */
  const reset = () => writeFileSync(join(root, REL), JSON.stringify({ schemaVersion: 1, words: [] }, null, 2) + '\n')

  it('serves the ledger unwrapped, exactly as names and primitives are', async () => {
    reset()
    expect((await api('/api/state')).words).toEqual([])
  })

  it('takes a verdict, a replacement and a note through a patch, on the id an agent dealt it', async () => {
    reset()
    agentAppends(draft('sat', 3), draft('cog', 3))

    expect((await status({ what: 'words', patch: { id: '3/sat', verdict: 'yes' } })).code).toBe(200)
    expect((await status({
      what: 'words', patch: { id: '3/cog', verdict: 'replace', replacement: 'dog', note: 'too close to sit/sat' },
    })).code).toBe(200)

    expect(rowOf('3/sat').verdict).toBe('yes')
    expect(rowOf('3/cog')).toMatchObject({ verdict: 'replace', replacement: 'dog', note: 'too close to sit/sat' })
    /* The drafted fields are untouched by his verdict. */
    expect(rowOf('3/cog').word).toBe('cog')
  })

  /*
   * THE DELIVERABLE: the concurrency case the ledger exists to survive, in
   * both directions — the exact shape JT-020 and JT-016 were lost in, at the
   * scale a 150-200 row drafting batch makes real. Both writers must keep
   * their work, whichever order they land in.
   */
  it('an agent appending a fresh batch, and a stale save of an earlier verdict — both survive', async () => {
    reset()
    agentAppends(draft('sat', 3), draft('sit', 3))
    const stale = await api('/api/state')                 // Joe's page loads: 'sat', 'sit' only

    /* The agent's drafting tool appends a fresh batch while his page is still open. */
    agentAppends(draft('fish', 5), draft('to', 5))

    /* His page, unaware of the batch, saves the verdict he just made — as a
     * whole-file echo, the shape any page that has not adopted patches sends,
     * and the exact shape JT-020 was lost in. */
    const staleWhole = {
      schemaVersion: 1,
      words: stale.words.map((w: any) => w.id === '3/sat' ? { ...w, verdict: 'yes' } : w),
    }
    expect((await status({ what: 'words', value: staleWhole })).code).toBe(200)

    /* His verdict landed... */
    expect(rowOf('3/sat').verdict).toBe('yes')
    /* ...and the batch his page had never heard of is still here. */
    expect(rowOf('5/fish')).toBeTruthy()
    expect(rowOf('5/to')).toBeTruthy()
  })

  it('the reverse loss: a fresh batch can never untick a verdict he already made', async () => {
    reset()
    agentAppends(draft('sat', 3), draft('sit', 3))
    await status({ what: 'words', patch: { id: '3/sat', verdict: 'yes' } })
    await status({ what: 'words', patch: { id: '3/sit', verdict: 'no' } })

    /* The drafting tool runs again later. It knows the rung's spelling, not
     * his rulings, so its own view of `sat`/`sit` still carries a blank
     * verdict — exactly what the tool produces for every row it drafts —
     * alongside the new candidates it is adding. Sent as a WHOLE FILE, the
     * shape a drafting batch actually lands in (through the API, the same way
     * `names`' generator rerun is modelled): this is the payload that would
     * silently blank his ten verdicts if `verdict`'s `idle` were wrong. */
    expect((await status({
      what: 'words',
      value: { schemaVersion: 1, words: [draft('sat', 3), draft('sit', 3), draft('fish', 5), draft('to', 5)] },
    })).code).toBe(200)

    expect(rowOf('3/sat').verdict).toBe('yes')
    expect(rowOf('3/sit').verdict).toBe('no')
    expect(rowOf('5/fish').verdict).toBe('')
  })

  it('a stale blank verdict, sent as a whole file, never unticks the one on disk', async () => {
    reset()
    agentAppends(draft('sat', 3))
    const stale = await api('/api/state')                 // verdict '' at load time
    expect((await status({ what: 'words', patch: { id: '3/sat', verdict: 'yes' } })).code).toBe(200)

    /* A stale page resending its own (blank) copy must not walk over a tick
     * it never saw land. */
    expect((await status({ what: 'words', value: { schemaVersion: 1, words: stale.words } })).code).toBe(200)
    expect(rowOf('3/sat').verdict).toBe('yes')
  })

  it('two disagreeing replacements for one word is a 409 that writes nothing — his words, never guessed at', async () => {
    reset()
    agentAppends(draft('cog', 3))
    await status({ what: 'words', patch: { id: '3/cog', verdict: 'replace', replacement: 'dog' } })
    const stale = await api('/api/state')

    const clashing = {
      schemaVersion: 1,
      words: stale.words.map((w: any) => w.id === '3/cog' ? { ...w, replacement: 'log' } : w),
    }
    const r = await status({ what: 'words', value: clashing })
    expect(r.code).toBe(409)
    expect(r.body.clashes[0]).toMatchObject({ id: '3/cog', field: 'replacement' })
    expect(rowOf('3/cog').replacement).toBe('dog')
  })

  it('emits only the ruled row, and nothing an unruled row would have contributed', async () => {
    reset()
    /* `src/core/` exists in the real checkout this route always runs against;
     * this throwaway root has no `src/` at all, so it is built here purely so
     * the write has somewhere to land — the route itself does no mkdir. */
    mkdirSync(dirname(rungWordsPath()), { recursive: true })

    agentAppends(draft('sat', 3), draft('pig', 3), draft('cog', 3))
    expect((await status({ what: 'words', patch: { id: '3/sat', verdict: 'yes' } })).code).toBe(200)
    expect((await status({ what: 'words', patch: { id: '3/cog', verdict: 'replace', replacement: 'dog' } })).code).toBe(200)

    const r = await post('/api/words/emit', {})
    expect(r.emitted).toBe(true)

    const out = readFileSync(rungWordsPath(), 'utf8')
    expect(out).toContain('"sat"')
    expect(out).toContain('"dog"')
    /* Unruled means invisible — neither the word nor a trace of the replaced
     * one it never became may reach the file the game actually deals from. */
    expect(out).not.toContain('"pig"')
    expect(out).not.toContain('"cog"')
  })

  it('did not widen the allowlist while adding itself to it', async () => {
    const r = await post('/api/save', { what: 'words-audit', value: { schemaVersion: 1, words: [] } })
    expect(r.error).toContain('not a writable file')
    expect(existsSync(join(root, 'joe/words-audit'))).toBe(false)
  })
})

/*
 * The emit button, and specifically the ONE THING the route test above cannot
 * catch: it calls `/api/words/emit` with `post(...)`, a helper this suite
 * wrote for itself, exercising a path the real page never takes. The button's
 * own handler (`app.js`) called `api('/api/words/emit')` with no second
 * argument; `api`'s own rule (`app.js:27-35`) is that no `opts` means a GET,
 * and the route (`api.mjs:419`) matches `POST` only — so the button 404ed with
 * a red toast and an unhandled rejection, and the only working path to emit
 * approved words was a terminal command. This reads the exact call site the
 * button uses and the exact method the route requires, so a regression back
 * to a bare `api('/api/words/emit')` fails here even though the route itself
 * still works fine in isolation.
 *
 * `app.js:523`'s `/api/export` button has the identical shape (`api(path)`
 * with no opts, against a POST-only route) and is a real, pre-existing bug —
 * but it is carded separately and NOT fixed here, so this check is scoped to
 * the emit button on purpose rather than asserting generally over every
 * `api()` call site in the file.
 */
describe('the emit button actually POSTs (it used to 404 silently)', () => {
  const appJsPath = resolve(REPO, 'tools/workbench/public/app.js')
  const apiMjsPath = resolve(REPO, 'tools/workbench/api.mjs')

  it("the UI's call to /api/words/emit and the route's required method agree", () => {
    const appJs = readFileSync(appJsPath, 'utf8')
    const apiMjs = readFileSync(apiMjsPath, 'utf8')

    const call = /\bapi\(\s*'\/api\/words\/emit'([^)]*)\)/.exec(appJs)
    expect(call, "could not find the emit button's api() call in app.js").toBeTruthy()
    /* The same rule `api()` applies to itself (app.js:27-35): nothing after
     * the path is a GET; an object argument is a POST unless it names its own
     * `method`. */
    const argsAfterPath = call![1]!.trim()
    const uiMethod = argsAfterPath === ''
      ? 'GET'
      : (/method:\s*'([A-Z]+)'/.exec(argsAfterPath)?.[1] ?? 'POST')

    const route = /path === '\/api\/words\/emit'([^\n]*)/.exec(apiMjs)
    expect(route, 'the /api/words/emit route moved or was renamed in api.mjs').toBeTruthy()
    const requiredMethod = /req\.method === '([A-Z]+)'/.exec(route![1]!)?.[1]
    expect(requiredMethod, 'the route no longer restricts by method').toBe('POST')

    expect(uiMethod).toBe(requiredMethod)
  })

  it('actually works end to end, driven by the exact call the button makes', async () => {
    /* Belt and braces: the assertion above is a source-level guarantee; this
     * drives a real request through `api()`'s own logic (copied, not
     * reimplemented — the point is to behave exactly as the button does) so a
     * mismatch between the two would itself be caught by a red toast here. */
    mkdirSync(dirname(rungWordsPathFor(root)), { recursive: true })
    writeFileSync(join(root, 'joe/words-audit.json'),
      JSON.stringify({ schemaVersion: 1, words: [{ id: '3/sun', word: 'sun', rung: 3, verdict: 'yes', replacement: '', note: '' }] }, null, 2) + '\n')

    const uiApi = async (path: string, opts?: { method?: string; body?: unknown }) => {
      const res = await fetch(base + path, opts && {
        method: opts.method ?? 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(opts.body ?? {}),
      })
      return res.json() as Promise<any>
    }

    const r = await uiApi('/api/words/emit', {})
    expect(r.emitted).toBe(true)
    expect(readFileSync(rungWordsPathFor(root), 'utf8')).toContain('"sun"')
  })
})

function rungWordsPathFor(r: string): string {
  return join(r, 'src/core/rung-words.ts')
}

describe('the workbench cannot be talked out of the repo', () => {
  it('refuses a write to a file that is not on the list', async () => {
    const r = await post('/api/save', { what: 'package', value: { hacked: true } })
    expect(r.error).toContain('not a writable file')
  })

  it('refuses a traversal in the static path', async () => {
    const res = await fetch(base + '/../../package.json')
    /* Either the URL normalises it away or the jail refuses it; never a 200 with package.json. */
    const body = await res.text()
    expect(body).not.toContain('"junos-island"')
  })

  it('refuses a lesson id that walks upwards', async () => {
    const r = await post('/api/lesson', { id: '../../package', status: 'draft' }, 'PUT')
    expect(r.error).toBeTruthy()
    expect(existsSync(join(root, 'package.md'))).toBe(false)
  })
})
