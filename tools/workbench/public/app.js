/*
 * JOE_WORKBENCH_ONLY — the whole page, in one file.
 *
 * Re-render everything on every change. The files are a few kilobytes and the
 * only user is sitting at the machine; a diffing scheme here would be a
 * software project, which the spec forbids in as many words.
 *
 * NO TOP-LEVEL IMPORT OF `./words.ts`, on purpose. `npm run workbench` (Vite)
 * compiles it; `npm run workbench:plain` (`server.mjs`) does not — its
 * `serveStatic` has no `.ts` MIME entry (`api.mjs`'s `serveStatic`), so a
 * request for it 404s, and `words.ts` is real TypeScript a browser could not
 * parse even if it arrived. A STATIC import is resolved before this module's
 * own body runs at all, so that failure would take the whole of `app.js` down
 * with it — the task queue and the backlog included — under exactly the host
 * `server.mjs`'s own header exists to keep that from happening to. See
 * `loadWords` below: the import is dynamic, deferred to the one place it is
 * used, and its failure is caught rather than left to sink the page.
 */
const $ = s => document.querySelector(s)
const el = (tag, props = {}, kids = []) => {
  const n = Object.assign(document.createElement(tag), props)
  for (const k of [].concat(kids)) n.append(k)
  return n
}
const say = (text, bad = false) => { const s = $('#says'); s.textContent = text; s.className = bad ? 'bad' : '' }

const api = async (path, opts) => {
  const res = await fetch(path, opts && {
    method: opts.method ?? 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts.body ?? {}),
  })
  const data = await res.json()
  if (data.error) { say(data.error, true); throw new Error(data.error) }
  return data
}

let S = null
let picked = null

async function refresh() {
  S = await api('/api/state')
  drawTasks(); drawBacklog(); drawNames()
  drawWords().catch(err => say(err.message, true))
  drawLessons(); drawBake(); drawVoices(); drawNotes()
}

const save = (what, value) => api('/api/save', { body: { what, value } }).then(r => { say(`saved ${r.saved}`); return refresh() })

/**
 * One record, one field, said out loud.
 *
 * Sending the whole file for a one-field edit is what lost JT-020 and Joe's
 * answer to JT-016: the server could not tell an edit from an echo of a stale
 * copy, so the last save won and the other author's work went. A patch names
 * what actually changed, so the server can apply it to the file as it is on
 * disk this instant and leave everything else — including tasks this page has
 * never heard of — exactly where it found them.
 */
const patchRecord = (what, id, fields) =>
  api('/api/save', { body: { what, patch: { id, ...fields } } })
    .then(r => { say(`saved ${r.saved}`); return refresh() })

/* ------------------------------------------------------------------ tasks */

function drawTasks() {
  const root = $('#tasks')
  root.replaceChildren()

  const waits = Object.entries(S.blocking)
  if (waits.length) {
    root.append(el('p', { className: 'meta' },
      'Waiting on you: ' + waits.map(([what, ids]) => `${what} (${ids.join(', ')})`).join(' · ')))
  }

  for (const t of S.tasks) {
    const card = el('div', { className: 'card' + (t.state === 'done' ? ' done' : '') })
    card.append(el('h3', {}, `${t.id} — ${t.title}`))
    card.append(el('p', {}, t.detail))
    card.append(el('p', { className: 'meta' },
      `${t.type} · ${t.doneRule === 'artefact' ? `evidence: ${t.artefact ?? t.check}` : 'your word'}` +
      (t.blocks?.length ? ` · blocks ${t.blocks.join(', ')}` : '')))
    if (t.warn) card.append(el('p', { className: 'warn' }, '⚠ ' + t.warn))
    else if (t.doneRule === 'artefact' && t.state !== 'done') card.append(el('p', { className: 'ok' }, '✓ the artefact says this is done'))

    const note = el('input', { value: t.note ?? '', placeholder: 'note — outcomes feed decisions' })
    note.onchange = () => writeTask(t.id, { note: note.value })

    const done = el('button', {}, t.state === 'done' ? 'Re-open' : 'Done')
    done.onclick = () => {
      /* Warn, never override. Joe knows things this process does not. */
      if (t.state !== 'done' && t.warn && !confirm(`${t.warn}\n\nMark it done anyway?`)) return
      writeTask(t.id, { state: t.state === 'done' ? 'open' : 'done' })
    }
    card.append(el('div', { className: 'row' }, [note, done]))
    root.append(card)
  }
}

/*
 * The derived fields (`ok`, `warn`) used to have to be stripped here so they
 * never reached the file. They cannot reach it now: the server takes the named
 * fields off the patch and nothing else.
 */
const writeTask = (id, fields) => patchRecord('tasks', id, fields)

/* ------------------------------------------------------------------ backlog */

const STATES = ['open', 'planned', 'in-run', 'done', 'parked']

function drawBacklog() {
  const root = $('#backlog')
  root.replaceChildren()

  const add = el('form', { className: 'row' })
  const title = el('input', { placeholder: 'new card — title', required: true })
  const detail = el('input', { placeholder: 'detail' })
  add.append(title, detail, el('button', { type: 'submit' }, 'Add card'))
  add.onsubmit = e => {
    e.preventDefault()
    const b = S.backlog
    /*
     * No id, and the counter left alone.
     *
     * This page used to deal the id itself, out of `nextId` as it stood when
     * the page loaded — which is a stale number the moment an agent adds a
     * card, and dealt Joe's new cards an id the live-bug card already had,
     * twice in one run. The server deals it now, inside the request, against
     * the file as it is on disk that instant. See `merge.mjs`.
     */
    save('backlog', { ...b, cards: [...b.cards, { title: title.value, detail: detail.value, state: 'open', run: '' }] })
  }
  root.append(add)

  for (const c of S.backlog.cards) {
    const card = el('div', { className: 'card' + (c.state === 'done' ? ' done' : '') })
    card.append(el('h3', {}, `${c.id} — ${c.title}`))
    card.append(el('p', {}, c.detail))

    const state = el('select')
    for (const s of STATES) state.append(el('option', { value: s, selected: c.state === s }, s))
    state.onchange = () => writeCard(c.id, { state: state.value })

    const run = el('input', { value: c.run ?? '', placeholder: 'run', style: 'width:5rem' })
    run.onchange = () => writeCard(c.id, { run: run.value })

    card.append(el('div', { className: 'row' }, [state, run]))
    root.append(card)
  }
}

const writeCard = (id, fields) => patchRecord('backlog', id, fields)

/* --------------------------------------------------------------- pet names */

/**
 * The name audit — PB-036. The one panel built for a long sitting.
 *
 * Roster §3 says every generated name is checked for how it SAYS and for what
 * it collides with — a real word, or a rude one in disguise — before it is
 * frozen, and Joe may do that in a session with no manager running. So the
 * name is the big thing on the row, accept and reject are one click and land
 * on disk that instant, and the bar says where he got to. He can close the tab
 * mid-row and lose nothing.
 *
 * Never sorted. The file arrives in the roster's order and stays in it; the
 * headings below are drawn as the collection CHANGES, so grouping costs no
 * reordering and a name never moves between one visit and the next.
 */
const NAME_FILTERS = {
  todo: ['still to review', n => !n.verdict],
  all: ['every name', () => true],
  ok: ['kept', n => n.verdict === 'ok'],
  reject: ['rejected', n => n.verdict === 'reject'],
}

/*
 * Rendered in chunks, and filtered before it is chunked.
 *
 * 350 rows would survive being drawn in one go; the roster is meant to reach
 * several thousand, and at that size a page that draws the lot rebuilds tens
 * of thousands of nodes to tick one box. The counts in the bar always describe
 * the WHOLE file, so the cap can never mislead him about how much is left.
 */
const NAME_PAGE = 150
let nameFilter = 'todo'
let nameSet = ''
let nameLimit = NAME_PAGE

const namesShown = () => (S.names ?? []).filter(n =>
  NAME_FILTERS[nameFilter][1](n) && (!nameSet || n.collection === nameSet))

function drawNames() {
  drawNamesBar()
  const rows = $('#namesRows')
  rows.replaceChildren()

  const all = S.names ?? []
  if (!all.length) {
    rows.append(el('p', { className: 'hint' },
      'joe/names-audit.json has no names in it yet — the rows are generated with the roster. ' +
      'This panel fills itself the moment they land.'))
    return
  }

  const shown = namesShown()
  if (!shown.length) {
    rows.append(el('p', { className: 'ok' }, '✓ nothing left under this filter.'))
    return
  }

  let group = null
  for (const n of shown.slice(0, nameLimit)) {
    if (n.collection !== group) {
      group = n.collection
      rows.append(el('h2', { className: 'nameGroup' }, group ?? '—'))
    }
    rows.append(nameRow(n))
  }

  if (shown.length > nameLimit) {
    const more = el('button', {}, `Show the next ${Math.min(NAME_PAGE, shown.length - nameLimit)}`)
    more.onclick = () => { nameLimit += NAME_PAGE; drawNames() }
    rows.append(el('div', { className: 'row' }, [more]))
  }
}

/** Where he got to, in numbers, at the top of the screen and always true. */
function drawNamesBar() {
  const bar = $('#namesBar')
  bar.replaceChildren()

  const all = S.names ?? []
  if (!all.length) return
  const done = all.filter(n => n.verdict).length
  const kept = all.filter(n => n.verdict === 'ok').length
  const gone = all.filter(n => n.verdict === 'reject').length

  bar.append(el('div', { className: 'row' }, [
    el('strong', {}, `${done} of ${all.length} reviewed`),
    el('progress', { max: all.length, value: done }),
    el('span', { className: 'meta' }, `${kept} kept · ${gone} rejected · ${all.length - done} to go`),
  ]))

  const filter = el('select')
  for (const [k, [label]] of Object.entries(NAME_FILTERS)) {
    filter.append(el('option', { value: k, selected: k === nameFilter }, label))
  }
  filter.onchange = () => { nameFilter = filter.value; nameLimit = NAME_PAGE; drawNames() }

  const set = el('select')
  set.append(el('option', { value: '', selected: !nameSet }, 'every collection'))
  for (const c of [...new Set(all.map(n => n.collection).filter(Boolean))]) {
    set.append(el('option', { value: c, selected: c === nameSet }, c))
  }
  set.onchange = () => { nameSet = set.value; nameLimit = NAME_PAGE; drawNames() }

  const shown = namesShown()
  bar.append(el('div', { className: 'row' }, [
    el('span', { className: 'meta' }, 'showing'), filter, set,
    el('span', { className: 'meta' }, `${Math.min(nameLimit, shown.length)} of ${shown.length} on screen`),
  ]))
  bar.append(el('p', { className: 'hint' },
    'Say each one aloud. Reject anything that trips the tongue, that is already a word, ' +
    'or that is a word in disguise — then type the name you want instead.'))
}

function nameRow(n) {
  const card = el('div', { className: 'card name ' + (n.verdict || '') })

  card.append(el('div', { className: 'row nameHead' }, [
    el('span', { className: 'species' }, n.species || n.speciesId || ''),
    el('span', { className: 'theName' }, n.name || ''),
    el('span', { className: 'meta' }, [n.collection, n.band, n.setId].filter(Boolean).join(' · ')),
  ]))

  const keep = el('button', { className: 'verdict' + (n.verdict === 'ok' ? ' on' : '') }, n.verdict === 'ok' ? '✓ Kept' : 'Keep')
  const drop = el('button', { className: 'verdict' + (n.verdict === 'reject' ? ' on' : '') }, n.verdict === 'reject' ? '✗ Rejected' : 'Reject')
  const better = el('input', { className: 'replacement', value: n.replacement ?? '', placeholder: 'the name you want instead' })
  const note = el('input', { value: n.note ?? '', placeholder: 'note — what is wrong with it' })

  /*
   * The row re-draws, the LIST does not.
   *
   * A ticked row stays where it is even under "still to review": he is working
   * down a list reading aloud, and a row that vanishes from under the cursor
   * takes his place with it. The bar's counts move immediately, so the tick is
   * never in doubt, and the row is gone next time he opens the tab.
   */
  const rule = v => () => {
    /* Clicking the verdict it already has clears it. A mis-click is one click
     * to undo, and '' is a real state — not yet reviewed, not a rejection. */
    n.verdict = n.verdict === v ? '' : v
    const fresh = nameRow(n)
    card.replaceWith(fresh)
    drawNamesBar()
    /* He rejects because he has a better name in mind. Put the cursor there. */
    if (n.verdict === 'reject') fresh.querySelector('.replacement').focus()
    patchName(n.id, { verdict: n.verdict })
  }
  keep.onclick = rule('ok')
  drop.onclick = rule('reject')

  better.onchange = () => { n.replacement = better.value; patchName(n.id, { replacement: better.value }) }
  note.onchange = () => { n.note = note.value; patchName(n.id, { note: note.value }) }

  card.append(el('div', { className: 'row' }, [keep, drop, better, note]))
  return card
}

/**
 * A patch, without the whole-page refresh the other panels take.
 *
 * `patchRecord` re-reads every file and redraws every panel on each save,
 * which is right for a queue of seven and wrong for a sitting of 350 verdicts.
 * The server still merges onto the file as it stands this instant — that part
 * is not negotiable and is not skipped here. Only the redraw is: the row has
 * already shown the change. If the save is refused, `api` says so in red and
 * the reload puts the page back in step with the disk rather than leaving a
 * tick on screen that is not in the file.
 */
const patchName = (id, fields) =>
  api('/api/save', { body: { what: 'names', patch: { id, ...fields } } })
    .then(r => say(`saved ${r.saved}`))
    .catch(() => { refresh().catch(() => {}) })

/* ------------------------------------------------------------------ reading words */

/**
 * `words.ts` loaded lazily, once, the first time the tab actually needs it —
 * see the header note at the top of this file for why it is not a top-level
 * import. `null` means "this host cannot serve it" and is cached rather than
 * retried: a failure here is a property of which server is running, not
 * something a second attempt would fix.
 */
let wordsModule
async function loadWords() {
  if (wordsModule === undefined) {
    try { wordsModule = await import('./words.ts') }
    catch { wordsModule = null }
  }
  return wordsModule
}

/**
 * The reading-words bench. `wordsBench` (from `words.ts`) does the one
 * thing that matters: it groups the ledger by RUNG, in ladder order, because a
 * word is judged against its neighbours and never alone — `sat`/`sit` together
 * is the near-twin mechanism working; `to`/`too`/`two` together is the
 * confusable guard's whole reason to exist. This only draws what it returns.
 *
 * `joe/words-audit.json` is registered in `merge.mjs`'s MERGEABLE table, same
 * as `names` — a drafting tool appends batches to it and Joe rules on rows in
 * this page at his own pace, so a verdict is saved as a PATCH naming one row's
 * `id` (`${rung}/${word}`) and one field, through `patchWord` below, never a
 * whole-file echo that could carry a stale copy of a row it never touched.
 */
async function drawWords() {
  const root = $('#words')
  root.replaceChildren()

  const mod = await loadWords()
  if (!mod) {
    root.append(el('p', { className: 'warn' },
      '⚠ this host cannot compile TypeScript, so the reading-words bench cannot render here — ' +
      'run `npm run workbench` (the Vite host) to rule on words.'))
    return
  }
  const { wordsBench, LABELS: WORD_LABELS } = mod

  const all = S.words ?? []

  const emit = el('button', {}, 'Regenerate src/core/rung-words.ts')
  emit.onclick = async () => {
    /* `{}` and not a bare call: `api()` (line 27-35 above) sends a GET when it
     * gets no `opts`, and the route at `api.mjs:419` matches POST only — a
     * bare call 404s with nothing to click but "try again from a terminal". */
    const r = await api('/api/words/emit', {})
    say(r.emitted ? 'wrote src/core/rung-words.ts' : 'emit failed')
  }
  root.append(el('div', { className: 'row' }, [
    emit,
    el('span', { className: 'meta' }, 'Only approved and replaced words reach the game — an unruled word stays invisible.'),
  ]))

  if (!all.length) {
    root.append(el('p', { className: 'hint' },
      'joe/words-audit.json has no words in it yet — the rows land per rung, and this panel fills itself the moment they do.'))
    return
  }

  for (const g of wordsBench(all, WORD_LABELS)) {
    root.append(el('h2', { className: 'nameGroup' }, `${g.label} — ${g.done} of ${g.rows.length} ruled`))
    for (const r of g.rows) root.append(wordRow(r))
  }
}

/** Approved, whatever case or spacing it arrived in — `tools/words/emit.mjs`'s own rule. */
const wordApproved = v => ['yes', 'replace'].includes(String(v ?? '').trim().toLowerCase())
const wordRejected = v => v && !wordApproved(v)

function wordRow(r) {
  const card = el('div', { className: 'card name ' + (wordApproved(r.verdict) ? 'ok' : wordRejected(r.verdict) ? 'reject' : '') })

  card.append(el('div', { className: 'row nameHead' }, [
    el('span', { className: 'theName' }, r.word),
  ]))

  const approve = el('button', { className: 'verdict' + (wordApproved(r.verdict) ? ' on' : '') }, wordApproved(r.verdict) ? '✓ Approved' : 'Approve')
  const reject = el('button', { className: 'verdict' + (wordRejected(r.verdict) ? ' on' : '') }, wordRejected(r.verdict) ? '✗ Rejected' : 'Reject')
  const better = el('input', { className: 'replacement', value: r.replacement ?? '', placeholder: 'the word you want instead' })
  const note = el('input', { value: r.note ?? '', placeholder: 'note — what is wrong with it' })

  /* The row re-draws in place, the same idiom `nameRow` uses: the list never
   * jumps under him, and the tick lands on disk the instant he makes it. */
  const redraw = () => card.replaceWith(wordRow(r))

  approve.onclick = () => { r.verdict = wordApproved(r.verdict) ? '' : 'yes'; redraw(); patchWord(r.id, { verdict: r.verdict }) }
  reject.onclick = () => { r.verdict = wordRejected(r.verdict) ? '' : 'no'; redraw(); patchWord(r.id, { verdict: r.verdict }) }
  /* Typing a replacement is his way of saying "approve it as this instead" —
   * `emit.mjs` only honours a replacement under verdict `replace`, so the box
   * sets both together rather than asking for a second click that does nothing
   * without it. */
  better.onchange = () => {
    r.replacement = better.value
    r.verdict = better.value.trim() ? 'replace' : (wordApproved(r.verdict) ? '' : r.verdict)
    redraw(); patchWord(r.id, { replacement: r.replacement, verdict: r.verdict })
  }
  note.onchange = () => { r.note = note.value; patchWord(r.id, { note: r.note }) }

  card.append(el('div', { className: 'row' }, [approve, reject, better, note]))
  return card
}

/**
 * A patch, without the whole-page refresh `patchName` also skips — same
 * idiom, same reasoning: the row has already shown the change, and the
 * server still merges onto the file as it stands this instant.
 *
 * `words` is registered in `merge.mjs`'s `MERGEABLE` table, keyed by `id`
 * (`${rung}/${word}`, dealt by whoever drafts the row) — a drafting batch
 * landing between load and save, or a second verdict Joe makes before this
 * one reaches disk, is exactly the two-writer shape `names` already survives,
 * and a patch naming one row and one field is what makes that safe: it can
 * never carry a stale copy of a row it never touched.
 */
const patchWord = (id, fields) =>
  api('/api/save', { body: { what: 'words', patch: { id, ...fields } } })
    .then(r => say(`saved ${r.saved}`))
    .catch(() => { refresh().catch(() => {}) })

/* ------------------------------------------------------------------ lessons */

function drawLessons() {
  const list = $('#lessonList')
  list.replaceChildren()
  for (const l of S.lessons) {
    const li = el('li', { className: l.id === picked ? 'on' : '' })
    li.append(`${l.id} `, el('span', { className: 'pill ' + l.bake }, l.bake))
    li.onclick = () => { picked = l.id; drawLessons() }
    list.append(li)
  }

  const l = S.lessons.find(x => x.id === picked)
  const form = $('#lessonForm')
  form.hidden = !l
  if (!l) return
  $('#lessonTitle').textContent = `${l.id} — ${l.title}`
  for (const [k, v] of Object.entries({ title: l.title, exemplar: l.exemplar, file: l.file, approxSeconds: l.approxSeconds, requires: l.requires, status: l.status, beats: l.beats, script: l.script })) {
    if (form.elements[k]) form.elements[k].value = v ?? ''
  }
}

$('#lessonForm').onsubmit = async e => {
  e.preventDefault()
  const f = Object.fromEntries(new FormData(e.target))
  await api('/api/lesson', { method: 'PUT', body: { ...f, id: picked, approxSeconds: Number(f.approxSeconds) || 0 } })
  say(`saved joe/lessons/${picked}.md`)
  refresh()
}

$('#lessonBake').onclick = () => bake([picked])

/* ------------------------------------------------------------------ bake */

function drawBake() {
  const root = $('#bake')
  root.replaceChildren()

  if (!S.hasKey) root.append(el('p', { className: 'warn' }, '⚠ add AZURE_SPEECH_KEY to .env (repo root) — nothing can bake without it'))
  const fred = S.voices.cast?.fred ?? {}
  root.append(el('p', { className: 'meta' },
    `Fred: ${fred.voice ?? '—'} at rate ${fred.rate ?? '—'}${fred.cast ? '' : ' (placeholder — JT-003)'} · clips land in ${S.voices.outDir}`))

  const bar = el('div', { className: 'row' })
  const stale = S.lessons.filter(l => l.bake === 'stale').map(l => l.id)
  const vetted = S.lessons.filter(l => l.bake === 'vetted').map(l => l.id)
  bar.append(
    el('button', { onclick: () => bake(vetted), disabled: !vetted.length }, `Bake all vetted (${vetted.length})`),
    el('button', { onclick: () => bake(stale), disabled: !stale.length }, `Re-bake stale (${stale.length})`),
    el('button', { onclick: exportPlan }, 'Export docs/fred-lessons-plan.md'),
  )
  root.append(bar)

  const rows = S.lessons.map(l => el('tr', {}, [
    el('td', {}, l.id),
    el('td', {}, el('span', { className: 'pill ' + l.bake }, l.bake)),
    el('td', {}, l.file ?? ''),
    el('td', {}, l.clip ? `${(l.clip.ms / 1000).toFixed(1)}s · ${(l.clip.bytes / 1024).toFixed(0)}kB` : '—'),
    el('td', {}, el('button', { onclick: () => bake([l.id]) }, 'Bake')),
  ]))
  const head = el('tr', {}, ['lesson', 'state', 'file', 'clip', ''].map(h => el('th', {}, h)))
  root.append(el('table', {}, [el('thead', {}, head), el('tbody', {}, rows)]))
}

async function bake(ids) {
  if (!ids?.length) return
  say(`baking ${ids.length}…`)
  const { results } = await api('/api/bake', { body: { ids } })
  const bad = results.filter(r => r.error)
  /* Azure's message, verbatim, where the eye is — not swallowed into a console. */
  say(bad.length ? bad.map(r => `${r.id}: ${r.error}`).join(' · ') : `baked ${results.length}`, bad.length > 0)
  refresh()
}

const exportPlan = async () => { const r = await api('/api/export'); say(`wrote ${r.saved}`) }

/* --------------------------------------------------------------- voices & key */

/**
 * The shortlist, for before there is a key to ask Azure with.
 *
 * Enough to cast and bake on day one; the moment a key is set the real
 * catalogue replaces it, because a hard-coded voice list is a list that goes
 * stale the next time Microsoft ships a neural voice.
 */
const FALLBACK_VOICES = [
  'en-GB-RyanNeural', 'en-GB-ThomasNeural', 'en-GB-AlfieNeural', 'en-GB-ElliotNeural',
  'en-GB-SoniaNeural', 'en-GB-LibbyNeural', 'en-GB-MaisieNeural', 'en-GB-OliviaNeural',
  'en-GB-AbbiNeural', 'en-GB-BellaNeural', 'en-GB-HollieNeural', 'en-GB-NoahNeural',
]
let catalogue = null

function drawVoices() {
  const root = $('#voices')
  root.replaceChildren()

  /* ---- the key ---- */
  const keyBox = el('div', { className: 'card' })
  keyBox.append(el('h3', {}, 'Azure Speech'))
  keyBox.append(el('p', { className: 'meta' }, S.hasKey
    ? `a key is set (${S.keyTail}) · region ${S.region}`
    : 'no key set — the bake console cannot run'))

  const key = el('input', { type: 'password', placeholder: S.hasKey ? 'replace the key…' : 'paste the key…' })
  const region = el('input', { value: S.region, placeholder: 'region, e.g. uksouth', style: 'max-width:9rem' })
  const set = el('button', {}, 'Save to .env')
  set.onclick = async () => {
    await api('/api/secrets', { body: { AZURE_SPEECH_KEY: key.value, AZURE_SPEECH_REGION: region.value } })
    key.value = ''
    catalogue = null
    say('written to .env')
    refresh()
  }
  keyBox.append(el('div', { className: 'row' }, [key, region, set]))
  /*
   * It goes IN from here and never comes back out.
   *
   * Joe overruled the spec's "never in the page", rightly — hand-editing a
   * dotfile to use a GUI is silly. What is kept is the direction of travel:
   * the server writes it to a gitignored .env and reports only the last four,
   * so a screenshot of this page cannot leak the account.
   */
  keyBox.append(el('p', { className: 'hint' },
    'Written to .env, which is gitignored. The page never receives it back — only the last four digits.'))
  root.append(keyBox)

  /* ---- the casting ---- */
  const names = catalogue?.length
    ? catalogue.filter(v => v.locale.startsWith('en')).map(v => v.name)
    : FALLBACK_VOICES

  for (const [who, cast] of Object.entries(S.voices.cast ?? {})) {
    const card = el('div', { className: 'card' })
    card.append(el('h3', {}, who))

    const voice = el('select')
    for (const name of [...new Set([cast.voice, ...names])].filter(Boolean)) {
      voice.append(el('option', { value: name, selected: name === cast.voice }, name))
    }
    const rate = el('input', { value: cast.rate ?? '0%', style: 'max-width:5rem' })
    const pitch = el('input', { value: cast.pitch ?? '0%', style: 'max-width:5rem' })
    const done = el('input', { type: 'checkbox', checked: Boolean(cast.cast) })

    const apply = () => saveCast(who, {
      voice: voice.value, rate: rate.value, pitch: pitch.value, cast: done.checked,
    })
    for (const control of [voice, rate, pitch, done]) control.onchange = apply

    card.append(el('div', { className: 'row' }, [
      voice, el('span', { className: 'meta' }, 'rate'), rate,
      el('span', { className: 'meta' }, 'pitch'), pitch,
      el('label', { className: 'row', style: 'margin:0' }, [done, ' auditioned']),
    ]))
    if (who === 'fred') {
      card.append(el('p', { className: 'hint' },
        'Casting is data: change this and every one of his clips shows stale, then one batch re-bake fixes it.'))
    }
    root.append(card)
  }

  const fetchList = el('button', {}, catalogue ? `${catalogue.length} voices from Azure` : 'Fetch the voice list from Azure')
  fetchList.onclick = async () => {
    const r = await api('/api/voices/list')
    catalogue = r.voices ?? []
    say(r.error ? r.error : `${catalogue.length} voices`, Boolean(r.error))
    drawVoices()
  }
  root.append(el('div', { className: 'row' }, [fetchList]))
}

const saveCast = (who, patch) =>
  save('voices', { ...S.voices, cast: { ...S.voices.cast, [who]: { ...S.voices.cast[who], ...patch } } })

/* ------------------------------------------------------------------ notes */

function drawNotes() {
  const list = $('#noteList')
  list.replaceChildren()
  for (const n of [...S.notes].reverse()) {
    list.append(el('li', {}, [el('code', {}, n.assetId), ' — ', n.note, el('span', { className: 'meta' }, ' ' + n.at.slice(0, 10))]))
  }
}

$('#noteForm').onsubmit = async e => {
  e.preventDefault()
  const f = Object.fromEntries(new FormData(e.target))
  await api('/api/note', { body: f })
  e.target.reset()
  say('note saved')
  refresh()
}

/* ------------------------------------------------------------------ chrome */

$('#tabs').onclick = e => {
  const tab = e.target.dataset?.tab
  if (!tab) return
  for (const b of $('#tabs').children) b.classList.toggle('on', b.dataset.tab === tab)
  for (const s of document.querySelectorAll('.tab')) s.classList.toggle('on', s.id === tab)
}

refresh().catch(err => say(err.message, true))
