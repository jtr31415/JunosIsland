/*
 * JOE_WORKBENCH_ONLY — the whole page, in one file.
 *
 * Re-render everything on every change. The files are a few kilobytes and the
 * only user is sitting at the machine; a diffing scheme here would be a
 * software project, which the spec forbids in as many words.
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
  drawTasks(); drawBacklog(); drawLessons(); drawBake(); drawVoices(); drawNotes()
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
