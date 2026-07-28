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
  drawTasks(); drawBacklog(); drawLessons(); drawBake(); drawNotes()
}

const save = (what, value) => api('/api/save', { body: { what, value } }).then(r => { say(`saved ${r.saved}`); return refresh() })

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

function writeTask(id, patch) {
  const tasks = S.tasks.map(t => {
    const { ok, warn, ...clean } = t                       // derived fields never persist
    return t.id === id ? { ...clean, ...patch } : clean
  })
  return save('tasks', { schemaVersion: 1, tasks, archive: S.archive })
}

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
    const id = 'PB-' + String(b.nextId).padStart(3, '0')
    save('backlog', { ...b, nextId: b.nextId + 1, cards: [...b.cards, { id, title: title.value, detail: detail.value, state: 'open', run: '' }] })
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

const writeCard = (id, patch) =>
  save('backlog', { ...S.backlog, cards: S.backlog.cards.map(c => c.id === id ? { ...c, ...patch } : c) })

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
