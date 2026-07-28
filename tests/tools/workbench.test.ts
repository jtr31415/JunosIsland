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
