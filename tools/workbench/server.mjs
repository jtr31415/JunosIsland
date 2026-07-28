/**
 * Joe's workbench — a local server, dev-only, never deployed.
 *
 * JOE_WORKBENCH_ONLY
 *
 * That sentinel is load-bearing: `tools/smoke/channel.mjs` greps both shipped
 * bundles for it and greps `src/` for any reference to this folder, so "the
 * workbench cannot reach the tablet" is a checked fact rather than an
 * intention. Nothing in `src/` may ever import from here.
 *
 * Why a server and not a page opened from disk: it reads and WRITES repo files
 * directly — no uploads, no copy-paste — and it holds the Azure key so the
 * page never sees it.
 *
 *   npm run workbench            → http://127.0.0.1:4173
 *   npm run workbench -- --port 0   (the test does this; the port is printed)
 *
 * The lightweight law, from the spec: this is a utility, not a software
 * project. No framework, no build step, no styling ambitions.
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inside, readJson, writeJson, writeText, readEnv, exists } from './repo.mjs'
import { allLessons, loadLesson, saveLesson, exportPlan, STATUSES } from './lessons.mjs'
import { seed, REPO } from './seed.mjs'
import { bakeOne, bakeState, loadManifest, BakeError } from './bake.mjs'
import { checkTask, blocking } from './checks.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(HERE, 'public')

/**
 * The only files the API may write, by name.
 *
 * An allowlist rather than a path parameter. The jail in `repo.mjs` already
 * stops an escape; this stops the workbench from being talked into rewriting
 * `package.json`, which the jail would happily permit.
 */
const WRITABLE = {
  tasks: 'joe/tasks.json',
  backlog: 'joe/backlog.json',
  voices: 'joe/voices.json',
  notes: 'joe/asset-notes.json',
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }

const json = (res, code, body) => {
  const text = JSON.stringify(body)
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) })
  res.end(text)
}

const readBody = req => new Promise((ok, no) => {
  let raw = ''
  req.on('data', c => {
    raw += c
    /* A local tool, but an unbounded body is still an unbounded body. */
    if (raw.length > 2_000_000) { no(new Error('body too large')); req.destroy() }
  })
  req.on('end', () => { try { ok(raw ? JSON.parse(raw) : {}) } catch (e) { no(e) } })
  req.on('error', no)
})

/** Everything the page renders, in one round trip. The files are tiny; two calls would be affectation. */
function state(root) {
  const voices = readJson(root, 'joe/voices.json', { cast: {}, outDir: '', manifest: '' })
  const tasksFile = readJson(root, 'joe/tasks.json', { tasks: [], archive: [] })
  const manifest = loadManifest(root, voices)
  const lessons = allLessons(root)

  return {
    tasks: tasksFile.tasks.map(t => ({ ...t, ...checkTask(root, t) })),
    archive: tasksFile.archive ?? [],
    blocking: blocking(tasksFile.tasks),
    backlog: readJson(root, 'joe/backlog.json', { cards: [], nextId: 1 }),
    notes: readJson(root, 'joe/asset-notes.json', { notes: [] }).notes,
    voices,
    statuses: STATUSES,
    /* Whether the key EXISTS, never the key. The page must not be able to read it. */
    hasKey: Boolean(({ ...readEnv(root), ...process.env }).AZURE_SPEECH_KEY),
    lessons: lessons.map(l => ({
      ...l,
      bake: bakeState(root, l, voices, manifest),
      clip: manifest.clips?.[l.id] ?? null,
    })),
  }
}

export function makeServer(root = REPO) {
  return createServer(async (req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1')
    const path = url.pathname

    try {
      if (path === '/api/state') return json(res, 200, state(root))

      if (path === '/api/lesson' && req.method === 'PUT') {
        const body = await readBody(req)
        const before = loadLesson(root, body.id)
        if (!before) return json(res, 404, { error: `no such lesson: ${body.id}` })
        const next = { ...before, ...body, id: before.id }
        if (!STATUSES.includes(next.status)) return json(res, 400, { error: `unknown status: ${next.status}` })
        saveLesson(root, next)
        return json(res, 200, { saved: `joe/lessons/${next.id}.md` })
      }

      if (path === '/api/save' && req.method === 'POST') {
        const body = await readBody(req)
        const rel = WRITABLE[body.what]
        if (!rel) return json(res, 400, { error: `not a writable file: ${body.what}` })
        writeJson(root, rel, body.value)
        return json(res, 200, { saved: rel })
      }

      /*
       * A note is APPENDED, never a whole-file replace.
       *
       * The asset gallery will one day POST these from a different surface,
       * possibly while this page also has the file open. Append-with-reread is
       * what stops one of them clobbering the other's note.
       */
      if (path === '/api/note' && req.method === 'POST') {
        const { assetId, note } = await readBody(req)
        if (!assetId || !note) return json(res, 400, { error: 'a note needs an assetId and a note' })
        const file = readJson(root, 'joe/asset-notes.json', { schemaVersion: 1, notes: [] })
        file.notes.push({ assetId, note, at: new Date().toISOString() })
        writeJson(root, 'joe/asset-notes.json', file)
        return json(res, 200, { notes: file.notes })
      }

      if (path === '/api/export' && req.method === 'POST') {
        const md = exportPlan(allLessons(root))
        const rel = 'docs/fred-lessons-plan.md'
        writeText(root, rel, md)
        return json(res, 200, { saved: rel, bytes: md.length })
      }

      if (path === '/api/bake' && req.method === 'POST') {
        const { ids } = await readBody(req)
        const voices = readJson(root, 'joe/voices.json', { cast: {} })
        const results = []
        for (const id of ids ?? []) {
          const lesson = loadLesson(root, id)
          if (!lesson) { results.push({ id, error: `no such lesson: ${id}` }); continue }
          try {
            results.push({ id, clip: await bakeOne(root, lesson, voices) })
          } catch (err) {
            results.push({ id, error: err instanceof BakeError ? err.message : String(err?.message ?? err) })
          }
        }
        return json(res, 200, { results })
      }

      if (path === '/api/health') return json(res, 200, { ok: true, root })

      /* Static: three files, from this folder only. */
      const name = path === '/' ? '/index.html' : path
      const file = inside(PUBLIC, '.' + name)
      if (existsSync(file) && MIME[extname(file)]) {
        res.writeHead(200, { 'content-type': MIME[extname(file)], 'cache-control': 'no-store' })
        return res.end(readFileSync(file))
      }
      return json(res, 404, { error: `not found: ${path}` })
    } catch (err) {
      return json(res, 500, { error: String(err?.message ?? err) })
    }
  })
}

if (process.argv[1]?.endsWith('server.mjs')) {
  const pi = process.argv.indexOf('--port')
  const port = pi === -1 ? 4173 : Number(process.argv[pi + 1])
  const ri = process.argv.indexOf('--root')
  const root = ri === -1 ? REPO : resolve(process.argv[ri + 1])

  const made = seed(root)
  if (made.length) console.log(`seeded ${made.length} file(s) into joe/`)
  if (!exists(root, 'joe/tasks.json')) console.warn('warning: joe/tasks.json is missing and could not be seeded')

  makeServer(root).listen(port, '127.0.0.1', function () {
    /* The test parses this line, so its shape is a contract. */
    console.log(`WORKBENCH READY http://127.0.0.1:${this.address().port}`)
  })
}
