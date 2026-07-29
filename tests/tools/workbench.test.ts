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
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
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
