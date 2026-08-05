/**
 * The workbench API, as one connect-style middleware.
 *
 * JOE_WORKBENCH_ONLY
 *
 * Extracted from the server so the SAME handler serves two hosts: the plain
 * node server (which the round-trip test spawns, and which needs no build
 * step) and the Vite dev server (which the asset viewer needs, because the
 * viewer imports the game's own TypeScript registries and there is no other
 * honest way to be canonical by construction).
 *
 * Anything it does not recognise it passes on with `next()`, so under Vite the
 * static and module handling still happens downstream.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { extname, resolve, join } from 'node:path'
import { inside, readJson, writeJson, writeText, readText, readEnv, OutsideRepo } from './repo.mjs'
import { allLessons, loadLesson, saveLesson, exportPlan, STATUSES } from './lessons.mjs'
import { bakeOne, bakeState, loadManifest, BakeError } from './bake.mjs'
import { checkTask, blocking } from './checks.mjs'
import { mergeWhole, applyPatch, mergeable, migrate, keyOf, Conflict, Refused } from './merge.mjs'
import { PushRefused, pushSpecies } from './push.mjs'
import { REPO } from './seed.mjs'
import { regenerateSignoffs } from '../species/signoffs.mjs'

/** The only files the API may write, by name. An allowlist, not a path parameter. */
const WRITABLE = {
  tasks: 'joe/tasks.json',
  backlog: 'joe/backlog.json',
  voices: 'joe/voices.json',
  notes: 'joe/asset-notes.json',
  names: 'joe/names-audit.json',
  words: 'joe/words-audit.json',
  primitives: 'joe/primitives-audit.json',
  /*
   * The visual editor's draft store: species DEFINITIONS Joe is making in the
   * page, not geometry. Two writers again — he edits drafts here while the facts
   * pipeline fills in a `fact` on the other side — so it is merged on the same
   * terms as everything above it.
   *
   * No ids are dealt for it, here or anywhere: a record is keyed by its
   * `speciesId`, one animal to one record, so a save OVERWRITES rather than
   * appending. See `merge.mjs MERGEABLE.edits`, which argues why that also ends
   * the id race the old `SD-nnn` counter existed to manage.
   */
  edits: 'joe/species-edits.json',
}

/**
 * Where the game's runtime assets live.
 *
 * The viewer builds its lists from the code's own registries; this is the
 * other half of the same question — what is actually ON DISK — so the viewer
 * can say "37 props, 34 of them referenced by a registry, 3 nobody uses".
 * A file no table names is either dead weight or an omission, and only Joe
 * can tell which.
 */
const ASSET_DIRS = {
  pets: 'src/island/public/pets',
  props: 'src/island/public/props',
  forest: 'src/island/public/forest',
  tiles: 'src/island/public/tiles',
}

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

const secrets = root => ({ ...readEnv(root), ...process.env })

/** Everything the page renders, in one round trip. The files are tiny. */
function state(root) {
  const voices = readJson(root, 'joe/voices.json', { cast: {}, outDir: '', manifest: '' })
  const tasksFile = readJson(root, 'joe/tasks.json', { tasks: [], archive: [] })
  const manifest = loadManifest(root, voices)
  const lessons = allLessons(root)
  const key = secrets(root).AZURE_SPEECH_KEY

  return {
    tasks: tasksFile.tasks.map(t => ({ ...t, ...checkTask(root, t) })),
    archive: tasksFile.archive ?? [],
    blocking: blocking(tasksFile.tasks),
    backlog: readJson(root, 'joe/backlog.json', { cards: [], nextId: 1 }),
    notes: readJson(root, 'joe/asset-notes.json', { notes: [] }).notes,
    /*
     * The pet-name audit, in the file's own order — which is the roster's
     * order, and the order Joe will read them aloud in. Never sorted here: the
     * page groups by collection as it renders, so nothing about what he sees
     * depends on a comparator this end.
     */
    names: readJson(root, 'joe/names-audit.json', { schemaVersion: 1, names: [] }).names ?? [],
    /*
     * The reading-words ledger — one row per generated candidate word for the
     * reading ladder, in the ledger's own order. Unvetted means
     * invisible: `tools/words/emit.mjs` only ever emits a row Joe has actually
     * ruled on, so a word sitting here with no verdict never reaches
     * `src/core/rung-words.ts` and never deals in the game. Never sorted here
     * for the same reason `names` and `primitives` are not — the page groups
     * by rung, in ladder order, as it renders.
     */
    words: readJson(root, 'joe/words-audit.json', { schemaVersion: 1, words: [] }).words ?? [],
    /*
     * The primitives bench, in the file's own order — which is the order he
     * reads them in and the order his place is kept in. Never sorted here, for
     * the same reason `names` is not: the page groups as it renders, so nothing
     * he sees depends on a comparator this end.
     *
     * Unlike the names, this file arrives SEEDED with its rows (see `seed.mjs`),
     * because a primitive is a measurement rather than something generated off
     * the roster. That is what makes his review hour resumable with nothing
     * running but this server.
     */
    primitives: readJson(root, 'joe/primitives-audit.json', { schemaVersion: 1, rows: [] }).rows ?? [],
    /*
     * The species facts, RAW and unexamined.
     *
     * JT-031: *"have an agent create the facts and fact check them."* That agent
     * owns `joe/species-facts.json` outright — it is deliberately absent from
     * `WRITABLE` above and absent from the seed, so nothing in the workbench can
     * write it and there is no second author for it to collide with. This end
     * only reads it, and passes it through without reshaping it: the file's
     * shape is that agent's to settle, and a normaliser here would have to guess
     * at it and would then quietly disagree with the one in `built.ts` that
     * actually renders it. Absent until it lands, which is the state the viewer
     * is built to show.
     */
    facts: readJson(root, 'joe/species-facts.json', null),
    /*
     * Joe's saved species drafts, so the editor can read its own work back.
     *
     * `edits` has been WRITABLE since `6bde9ec` and merge-safe since the same
     * commit, but it was never readable, so every edit Joe made died with the
     * tab — "need to be able to save my edits" was the first of his five notes
     * on the editor and this line is the half that was missing. `.drafts` is
     * unwrapped the way `primitives` and `names` are unwrapped, because the page
     * wants the rows; the envelope (`schemaVersion`) is the server's business.
     *
     * ONE ROW PER ANIMAL, keyed by `speciesId` — a save overwrites rather than
     * appending, which is Joe's instruction of 2 August. `migrate` folds the
     * dealt `SD-nnn` ids a previous server wrote, on the way out as well as on
     * the way in, so a file that has not been saved since still reads correctly
     * on screen the first time the page asks for it.
     */
    edits: migrate('edits', readJson(root, 'joe/species-edits.json', { schemaVersion: 1, drafts: [] })).drafts ?? [],
    voices,
    statuses: STATUSES,
    /*
     * Whether a key exists and its last four, NEVER the key.
     *
     * Joe asked for it to be settable from the page, which it is — but
     * settable and readable are different powers. The tail is enough to
     * recognise which key is loaded; the page is a thing that gets
     * screenshotted, and a secret it never receives is a secret it cannot
     * leak.
     */
    hasKey: Boolean(key),
    keyTail: key ? '…' + key.slice(-4) : '',
    region: secrets(root).AZURE_SPEECH_REGION || voices.region || 'uksouth',
    lessons: lessons.map(l => ({
      ...l,
      bake: bakeState(root, l, voices, manifest),
      clip: manifest.clips?.[l.id] ?? null,
    })),
  }
}

/**
 * What is on disk, per pack, ignoring the sidecar .bin and texture files.
 *
 * Read from the CHECKOUT, not from Joe's data root. The two are the same
 * directory in real use; they differ under test, where the root is a throwaway
 * so nothing writes over `joe/` — and the game's models are part of the
 * checkout either way, not part of his working data.
 */
function assetsOnDisk() {
  const out = {}
  for (const [pack, dir] of Object.entries(ASSET_DIRS)) {
    const path = inside(REPO, dir)
    out[pack] = existsSync(path)
      ? readdirSync(path)
        .filter(f => ['.gltf', '.glb'].includes(extname(f)))
        .map(f => f.replace(/\.(gltf|glb)$/, ''))
        .sort()
      : []
  }
  return out
}

/**
 * Merge a key into `.env`, preserving everything else in it.
 *
 * Rewritten rather than appended, or a second `AZURE_SPEECH_KEY=` line ends up
 * below the first and which one wins depends on whose parser you ask. The file
 * is gitignored; this is the one place the key is written and it never leaves
 * the machine.
 */
function setSecret(root, key, value) {
  const raw = readText(root, '.env') ?? ''
  const lines = raw.split(/\r?\n/).filter(l => !new RegExp(`^\\s*${key}\\s*=`).test(l))
  if (value) lines.push(`${key}=${value}`)
  writeText(root, '.env', lines.filter((l, i, a) => l.trim() || i < a.length - 1).join('\n').replace(/\n+$/, '') + '\n')
}

/** Azure's own catalogue, so the voice list is never a stale copy of theirs. */
async function voiceCatalogue(root, fetchImpl = fetch) {
  const { AZURE_SPEECH_KEY: key } = secrets(root)
  const region = state(root).region
  if (!key) return { error: 'no key set — showing the built-in shortlist', voices: [] }
  const res = await fetchImpl(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`,
    { headers: { 'Ocp-Apim-Subscription-Key': key } })
  if (!res.ok) return { error: `Azure ${res.status} ${res.statusText}`, voices: [] }
  const all = await res.json()
  return {
    voices: all.map(v => ({
      name: v.ShortName, locale: v.Locale, gender: v.Gender,
      display: v.DisplayName, styles: v.StyleList ?? [],
    })),
  }
}

/**
 * A tick, and nothing else, puts an animal in the egg pool.
 *
 * THE STANDING ORDER (PB-070, and Joe has given it twice): an unsigned animal
 * never ships and a signed one always does, and a newly signed-off animal joins
 * the pool with NO further ceremony. There is deliberately no approval step
 * after his tick — so his tick alone has to move the file the game reads, or
 * the ceremony he ruled out reappears as "and then someone runs the script".
 *
 * The game cannot read `joe/names-audit.json` (it is outside the vite root), so
 * `src/island/species/signed-off.json` is a generated mirror of it. This is
 * where the mirror is kept honest: the audit has just been written, so
 * regenerate from disk and the working tree now says what he decided.
 *
 * HIS SAVE IS NEVER AT RISK. This runs strictly AFTER the write and its outcome
 * is never allowed to change the reply. A mirror that fails to regenerate is a
 * stale generated file, recoverable with `npm run signoffs` and caught by
 * `tests/island/signed-off.test.ts`; a throw here would cost him a judgement
 * only he can make, and he would be told his save had failed when it had not.
 */
function remirrorSignoffs(root, what) {
  if (what !== 'names') return
  try {
    regenerateSignoffs(root)
  } catch (err) {
    console.error(`signed-off mirror not regenerated: ${String(err?.message ?? err)}`)
    console.error('joe/names-audit.json IS saved. Run `npm run signoffs` to catch it up.')
  }
}

export function createApi(root) {
  return async function api(req, res, next) {
    const url = new URL(req.url, 'http://127.0.0.1')
    const path = url.pathname
    if (!path.startsWith('/api/')) return next ? next() : json(res, 404, { error: `not found: ${path}` })

    try {
      if (path === '/api/state') return json(res, 200, state(root))
      if (path === '/api/health') return json(res, 200, { ok: true, root })
      if (path === '/api/assets') return json(res, 200, assetsOnDisk())

      if (path === '/api/lesson' && req.method === 'PUT') {
        const body = await readBody(req)
        const before = loadLesson(root, body.id)
        if (!before) return json(res, 404, { error: `no such lesson: ${body.id}` })
        const next2 = { ...before, ...body, id: before.id }
        if (!STATUSES.includes(next2.status)) return json(res, 400, { error: `unknown status: ${next2.status}` })
        saveLesson(root, next2)
        return json(res, 200, { saved: `joe/lessons/${next2.id}.md` })
      }

      /*
       * Save, by merging onto what is on disk RIGHT NOW.
       *
       * The re-read has to happen here, inside the handler, and not a moment
       * earlier: the whole point is that the file may have changed since the
       * page loaded it, which is how JT-020 was lost and how Joe's answer to
       * JT-016 was lost the other way round. See `merge.mjs` for the rules.
       *
       * Two shapes. `patch` names one record and the fields it changed, which
       * is what the page sends for an edit and the only shape that carries
       * intent. `value` is a whole file, which the page still sends for an
       * append (Add card) and which any page loaded before this change sends
       * for everything — merged conservatively, never applied as written.
       */
      if (path === '/api/save' && req.method === 'POST') {
        const body = await readBody(req)
        const rel = WRITABLE[body.what]
        if (!rel) return json(res, 400, { error: `not a writable file: ${body.what}` })
        try {
          /* Null only when the file is genuinely not there yet, or when this is
           * one of the files that is not merged at all — see `merge.mjs`.
           *
           * `migrate` runs on the copy just read, INSIDE the request, so a file
           * written by an older server is brought to the current shape before
           * anything merges onto it and is written back in that shape. A save is
           * the only moment the file is provably not being edited by anyone
           * else, which is why the healing lives here rather than in a script. */
          const disk = mergeable(body.what) ? migrate(body.what, readJson(root, rel, null)) : null
          if (body.patch) {
            if (!mergeable(body.what)) {
              return json(res, 400, { error: `${body.what} is not patchable — send the whole file` })
            }
            if (!disk) return json(res, 404, { error: `${rel} is not there to patch` })
            writeJson(root, rel, applyPatch(body.what, disk, body.patch))
            remirrorSignoffs(root, body.what)
            /* The record's own key, whatever the file calls it — `edits` is keyed
             * by `speciesId` and reporting `.id` there answered `undefined`. */
            return json(res, 200, { saved: rel, patched: body.patch[keyOf(body.what)] })
          }
          if (body.value === undefined) return json(res, 400, { error: 'a save needs a value or a patch' })
          writeJson(root, rel, disk ? mergeWhole(body.what, disk, body.value) : body.value)
          remirrorSignoffs(root, body.what)
          return json(res, 200, { saved: rel })
        } catch (err) {
          if (err instanceof Conflict) return json(res, 409, { error: err.message, clashes: err.clashes })
          if (err instanceof Refused) return json(res, 400, { error: err.message })
          throw err
        }
      }

      /*
       * ONE BUTTON: a draft becomes a species in the game.
       *
       * Joe, 2 August: *"then with one button push it to the game thats where
       * we need to get to."* Until this, `Save` wrote a draft and the only way
       * out of the editor into `src/` was him copying the module text by hand.
       *
       * DELIBERATELY NOT PART OF `/api/save`. That route is an allowlist of
       * `joe/` files merged by `merge.mjs`, and `joe/species-facts.json` is
       * deliberately absent from it — one author, asserted by
       * `tests/tools/workbench.test.ts`. Folding a `src/`-writing operation into
       * it would have meant either widening that allowlist or teaching the merge
       * about TypeScript, and both are worse than a second route that says what
       * it is. `/api/save` still answers 400 for `what: 'facts'`, unchanged.
       *
       * WHAT REFUSES, AND WHY EACH ONE IS HERE RATHER THAN ON THE PAGE. The page
       * owns the rules of a definition — it runs `creatureSpec` before it sends,
       * because that lives in TypeScript this plain-`.mjs` server cannot import.
       * This side owns the filesystem, which the page cannot see: whether the
       * collection is real, whether the species file already exists, and whether
       * the files are the shape the surgery expects. **Every path below is
       * derived from `speciesId` and `collection`; not one is taken from the
       * payload**, so a caller cannot name a file at all — and everything still
       * goes through the same `inside()` jail as every other write here.
       *
       * NOTHING IS WRITTEN UNTIL EVERYTHING IS DECIDED. The whole plan is built
       * in memory first, so a refusal at the last step leaves the tree exactly as
       * it was. Then the writes go out in the one order where an interruption
       * still leaves a loadable tree: the species FILE before the export LINE
       * that names it (`parts/assembled/index.ts` line 28 is the incident this
       * rule was bought with — thirteen lines for five files that did not exist
       * yet, and Joe's live viewer went blank).
       */
      if (path === '/api/species/push' && req.method === 'POST') {
        const body = await readBody(req)
        try {
          return json(res, 200, pushSpecies(root, body))
        } catch (err) {
          if (err instanceof PushRefused) return json(res, 400, { error: err.message })
          throw err
        }
      }

      /*
       * Set the key from the page.
       *
       * Joe overruled the spec's "key from .env, never in the page" on the
       * grounds that hand-editing a dotfile to use a GUI is silly, and he is
       * right. What survives of the original rule is the direction of travel:
       * the key goes IN and never comes back out, so `/api/state` reports a
       * tail and the bake still happens server-side.
       */
      if (path === '/api/secrets' && req.method === 'POST') {
        const body = await readBody(req)
        if (typeof body.AZURE_SPEECH_KEY === 'string') {
          setSecret(root, 'AZURE_SPEECH_KEY', body.AZURE_SPEECH_KEY.trim())
        }
        if (typeof body.AZURE_SPEECH_REGION === 'string') {
          setSecret(root, 'AZURE_SPEECH_REGION', body.AZURE_SPEECH_REGION.trim())
        }
        /*
         * process.env wins over .env when the bake reads them, so a key set
         * here would be shadowed for the life of the process by whatever was
         * in the environment at boot. Keep them in step.
         */
        if (body.AZURE_SPEECH_KEY) process.env.AZURE_SPEECH_KEY = body.AZURE_SPEECH_KEY.trim()
        if (body.AZURE_SPEECH_REGION) process.env.AZURE_SPEECH_REGION = body.AZURE_SPEECH_REGION.trim()
        return json(res, 200, { ok: true, hasKey: Boolean(secrets(root).AZURE_SPEECH_KEY) })
      }

      /*
       * A word Joe has ruled on, written into the module the game actually
       * deals from. Regenerates the WHOLE file from `joe/words-audit.json` as
       * it stands on disk this instant, exactly as `npm run words:emit` does
       * from a terminal — this is that same tool, reachable without one.
       */
      if (path === '/api/words/emit' && req.method === 'POST') {
        const { emitToDisk } = await import('../words/emit.mjs')
        emitToDisk(join(root, 'joe/words-audit.json'),
                   join(root, 'src/core/rung-words.ts'))
        return json(res, 200, { emitted: true })
      }

      if (path === '/api/voices/list') return json(res, 200, await voiceCatalogue(root))

      /* Appended, never a whole-file replace: the viewer and this page both write here. */
      if (path === '/api/note' && req.method === 'POST') {
        const { assetId, note } = await readBody(req)
        if (!assetId || !note) return json(res, 400, { error: 'a note needs an assetId and a note' })
        const file = readJson(root, 'joe/asset-notes.json', { schemaVersion: 1, notes: [] })
        file.notes.push({ assetId, note, at: new Date().toISOString() })
        writeJson(root, 'joe/asset-notes.json', file)
        return json(res, 200, { notes: file.notes })
      }

      if (path === '/api/note/delete' && req.method === 'POST') {
        const { at } = await readBody(req)
        const file = readJson(root, 'joe/asset-notes.json', { schemaVersion: 1, notes: [] })
        file.notes = file.notes.filter(n => n.at !== at)
        writeJson(root, 'joe/asset-notes.json', file)
        return json(res, 200, { notes: file.notes })
      }

      if (path === '/api/export' && req.method === 'POST') {
        const md = exportPlan(allLessons(root))
        writeText(root, 'docs/fred-lessons-plan.md', md)
        return json(res, 200, { saved: 'docs/fred-lessons-plan.md', bytes: md.length })
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

      return json(res, 404, { error: `not found: ${path}` })
    } catch (err) {
      const code = err instanceof OutsideRepo ? 400 : 500
      return json(res, code, { error: String(err?.message ?? err) })
    }
  }
}

/** Static file serving, for the plain node server only. Vite does its own. */
export function serveStatic(dir, req, res) {
  const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
  const path = new URL(req.url, 'http://127.0.0.1').pathname
  const file = inside(resolve(dir), '.' + (path === '/' ? '/index.html' : path))
  if (existsSync(file) && MIME[extname(file)]) {
    res.writeHead(200, { 'content-type': MIME[extname(file)], 'cache-control': 'no-store' })
    res.end(readFileSync(file))
    return true
  }
  return false
}
