/**
 * JOE_WORKBENCH_ONLY — the species editor page.
 *
 * ## What this is, in one paragraph
 *
 * Joe picks one of the built animals, clicks a part, and moves, turns, resizes,
 * copies, mirrors, deletes or recolours it. **Every one of those gestures is
 * written into the species DEFINITION and the animal is rebuilt from scratch
 * through the game's own deterministic builder.** Nothing here edits a vertex.
 * That is the whole architecture, and it is what makes the editor affordable:
 * his edits stay diffable, and a later improvement to the builder lifts every
 * animal he has made along with the twenty-four it already lifts.
 *
 * The three layers below it already existed before this page did — the edit
 * model (`def.ts`, 66 tests), the shape library (`library.ts`) and the draft
 * persistence in `api.mjs`/`merge.mjs` (14 tests). `6bde9ec` landed them with no
 * screen. This is the screen.
 *
 * ## What is deliberately NOT here yet
 *
 * Joe's instruction while this was being built: *"dont get too clever with it. I
 * just needs the basics."* So four things he has asked for are named here and
 * left for a later pass, each with the seam it plugs into:
 *
 *  - **The parts-library browser** with thumbnails, search and the taper/sink
 *    axes. `library.ts` is finished and unused except by the plain `<select>`
 *    below; `filterShapes` + `AXES` are what a browser would render.
 *  - **Copy an original and take it apart.** The measurement is done and it
 *    works: join `PARTS_BANK`'s `provenance` on `(species, node: 'body',
 *    ordinal)` against the component census in `anatomy-names.ts` and 177 of the
 *    206 shells resolve to a bank part with ZERO ambiguity, 16 of the 24 species
 *    at 100%. The 29 that do not are exactly the horns and the claws, which
 *    `tools/pets/parts-bank.ts:703 BAKED_ROLES` never banked. Do NOT match on
 *    triangle counts — 46.6% of components are ambiguous that way.
 *  - **Assigning a name, species and fact** to a new species. The store is
 *    `joe/species-edits.json`, already `WRITABLE` and merge-safe; save with
 *    `POST /api/save {what:'edits', patch:{...}}` and NO id (the server deals
 *    `SD-nnn`). `fact: ''` queues it for the pipeline; `factSource: 'joe'` marks
 *    his own words as his. `givenName(speciesId)` in `src/island/species/naming.ts`
 *    draws a collision-free name for an id the roster has never seen.
 *    `api.mjs state()` would need `edits` added to it so the page can read
 *    drafts back — it is writable but not yet readable.
 *  - **Non-uniform colouring** (the deer's belly, the penguin's front). Both
 *    routes are already sayable in the definition: `belly: k/16` paints the
 *    boundary into the coat's cell with no geometry, and a separate `paint` on a
 *    part splits it by triangle. A side-by-side of the two is a later pass.
 */

import {
  blankDef, deletePart, duplicatePart, defToModuleSource, insertPart, listParts, partAt,
  pathKey, samePath, setJoin, setMirrored, setPaint, setPaletteColour, setPartShape, setSpin,
  setStretch, warningsFor, type DefPath, type Warning,
} from './def'
import { ALL_SHAPES, HULL_SHAPES, groupShapes, summarise, type ShapeRow } from './library'
import { loadBuiltDefs } from './capture'
import { createStage, type GizmoMode } from './stage'
import type { CreatureDef } from '../../../../src/island/species/parts'
import type { Vec3 } from '../../../../src/island/species/parts/assembly'

/* ------------------------------------------------------------------ the DOM */

function el<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`editor: no ${selector} in index.html`)
  return found
}

const saySpan = el<HTMLParagraphElement>('#say')
const subjectPick = el<HTMLSelectElement>('#subject')
const openNote = el<HTMLParagraphElement>('#open-note')
const partList = el<HTMLUListElement>('#part-list')
const partCount = el<HTMLSpanElement>('#part-count')
const partsNote = el<HTMLParagraphElement>('#parts-note')
const selectedSpan = el<HTMLSpanElement>('#selected')
const warningList = el<HTMLUListElement>('#warnings')
const shapePick = el<HTMLSelectElement>('#shape-pick')
const shapeNote = el<HTMLParagraphElement>('#shape-note')
const sizeDials = el<HTMLDivElement>('#size-dials')
const sizeNote = el<HTMLParagraphElement>('#size-note')
const paletteList = el<HTMLUListElement>('#palette')
const colourNote = el<HTMLParagraphElement>('#colour-note')
const sourceOut = el<HTMLPreElement>('#source-out')
const insertPick = el<HTMLSelectElement>('#insert-pick')
const insertNote = el<HTMLParagraphElement>('#insert-note')
const newName = el<HTMLInputElement>('#new-name')
const saveNote = el<HTMLParagraphElement>('#save-note')

function say(text: string, bad = false): void {
  saySpan.textContent = text
  saySpan.className = bad ? 'say bad' : 'say good'
}

/**
 * Fill a `<select>` with the shape library, grouped and sorted.
 *
 * Joe's second note: *"the drop down of the components is probably ok without a
 * visual library, it sjust needs to be sorted by part and have headers for the
 * categories in the drop down."* `groupShapes` does the grouping and the natural
 * ordering; this turns it into `<optgroup>`s. Ninety-five options in bank-file
 * order was the thing that made him ask.
 *
 * "Sorted by part" was ambiguous between the shape's FORM and its JOB, and it
 * shipped as form. He settled it on 2 Aug 2026 (JT-038): by job. So a shape the
 * pack used as both an ear and a horn now appears under both headers — see
 * `groupShapes` — and this function must not dedupe them back, because being
 * findable as either is the whole point of the ruling.
 *
 * **Grouping is not filtering.** Every row of the list handed in still appears,
 * exactly once — `library.ts` says loudly that `form` is a label and never a
 * filter, and a test guards against a default-on form filter. An `<optgroup>`
 * excludes nothing, so this is compliant, and this sentence is here so the next
 * reader does not think the rule was bent.
 */
function fillShapes(select: HTMLSelectElement, rows: readonly ShapeRow[], current?: string): void {
  select.replaceChildren(...groupShapes(rows).map(group => {
    const optgroup = document.createElement('optgroup')
    optgroup.label = group.label
    optgroup.append(...group.rows.map(row => {
      const option = document.createElement('option')
      option.value = row.id
      option.textContent = summarise(row)
      option.selected = row.id === current
      return option
    }))
    return optgroup
  }))
}

/* ---------------------------------------------------------------- the state */

let defs: ReadonlyMap<string, CreatureDef> = new Map()
/** The definition as it ships, so `warningsFor` has a baseline and revert works. */
let opened: CreatureDef | null = null
let def: CreatureDef | null = null
let speciesId = ''
let selected: DefPath | null = null

/**
 * One saved species draft, as `joe/species-edits.json` holds it.
 *
 * The server owns `id` — the page NEVER deals one. It sends a draft with no id
 * at all and `merge.mjs` allocates `SD-nnn` inside the request, against the file
 * as it stands that instant. That is what makes two writers safe, and it is why
 * a save here cannot destroy a draft an agent appended while this tab was open.
 */
interface Draft {
  id: string
  speciesId: string
  /** The shipped species this was derived from; `''` when started from scratch. */
  from: string
  fromKind: string
  collection: string
  givenName: string
  fact: string
  factSource: string
  def: CreatureDef
  warnings: readonly Warning[]
  state: string
  note: string
}

let drafts: readonly Draft[] = []
/**
 * Which of Joe's own definitions is on screen, if it is one of his.
 *
 * `''` means the subject is a shipped species being edited but not yet saved.
 * A draft is keyed by its `speciesId`, ONE per species id — saving the mouse
 * twice updates the same draft rather than growing a pile of near-identical
 * ones. A second variant is a new animal with a new name, which is a thing the
 * page can now do.
 */
let draftId = ''
/** False the moment a gesture lands, true again only when the server has it. */
let saved = true
/** Joe's name for an animal he started himself. Empty for a shipped species. */
let givenName = ''

const stage = createStage(el<HTMLCanvasElement>('#stage'), {
  onPick(path) { select(path) },
  onGesture(gesture) {
    if (!def) return
    if (gesture.kind === 'move') {
      apply(setJoin(def, gesture.path, gesture.at), `moved ${label(gesture.path)}`)
    } else if (gesture.kind === 'rotate') {
      const was = spinOf(gesture.path)
      apply(
        setSpin(def, gesture.path, [...was, ...gesture.spin], gesture.anchor),
        `turned ${label(gesture.path)} by ${gesture.spin.map(s => `${s.deg}° ${s.axis}`).join(', ')}`,
      )
    } else {
      apply(setStretch(def, gesture.path, gesture.stretch), `resized ${label(gesture.path)}`)
    }
  },
  onSay: say,
})

/** The spins the definition already carries for a slot, to append a turn to. */
function spinOf(path: DefPath): readonly { axis: 'x' | 'y' | 'z'; deg: number }[] {
  if (!def) return []
  const slot = partAt(def, path)
  const spin = slot && 'spin' in slot ? slot.spin : undefined
  return spin ?? []
}

const label = (path: DefPath): string =>
  listParts(def!).find(row => samePath(row.path, path))?.label ?? pathKey(path)

/**
 * The one way a change happens.
 *
 * `def.ts` returns the SAME OBJECT when an op does not apply to a slot — the
 * hull has no stretch, the ridge has no join, legs have no shape. So `next ===
 * def` is a reliable "declined", and it is reported rather than swallowed: a
 * gesture that silently does nothing is how a person learns to distrust a tool.
 */
function apply(next: CreatureDef, why: string): boolean {
  if (!def) return false
  if (next === def) { say(`${why}: that part has no such handle`, true); return false }
  const result = stage.show(speciesId, next)
  if (!result.ok) {
    /*
     * The builder throwing is an ANSWER — an unexpressible animal saying so. The
     * old definition stays, the old model stays on screen, and the sentence the
     * builder wrote is what Joe reads. Warn, never block, is for the axioms; a
     * throw is the builder's own line and it is not ours to talk him past.
     */
    say(`refused: ${result.error}`, true)
    return false
  }
  def = next
  saved = false
  say(why)
  draw()
  return true
}

/* --------------------------------------------------------------- the parts */

function select(path: DefPath | null): void {
  selected = path
  stage.select(path)
  draw()
}

/** The selection's name and how many meshes its slot produced. */
function drawSelected(): void {
  const path = selected
  if (!path) { selectedSpan.textContent = 'nothing selected'; return }
  const meshes = stage.meshCount(path)
  selectedSpan.textContent = `${label(path)} · ${meshes} mesh${meshes === 1 ? '' : 'es'}`
}

function drawParts(): void {
  if (!def) return
  const rows = listParts(def)
  partList.replaceChildren(...rows.map(row => {
    const li = document.createElement('li')
    if (selected && samePath(row.path, selected)) li.className = 'on'
    const what = document.createElement('span')
    what.className = 'what'
    what.textContent = row.label
    const tag = document.createElement('span')
    tag.className = 'tag'
    const meshes = stage.meshCount(row.path)
    tag.textContent = `${row.part}${meshes > 1 ? ` ×${meshes}` : ''}`
    li.append(what, tag)
    li.addEventListener('click', () => select(row.path))
    return li
  }))
  partCount.textContent = `${rows.length}`
  /*
   * Joe's own axiom, said out loud so the UI does not merely look broken. The
   * head does not separate from the torso in 0 of the 24 originals — "head =
   * body" is his, and it is correct behaviour, not a missing part.
   */
  partsNote.textContent = 'The head is not a part: it is the body. That is true of all 24 originals too.'
}

/* ----------------------------------------------------------- the inspector */

function drawInspector(): void {
  if (!def) return
  const path = selected
  const slot = path ? partAt(def, path) : null

  /* Shape. The hull gets the ten real shells and nothing else. */
  const rows = path?.role === 'hull' ? HULL_SHAPES : ALL_SHAPES
  const current = slot && 'part' in slot ? slot.part : undefined
  fillShapes(shapePick, rows, current)
  shapePick.disabled = !path || path.role === 'legs'
  shapeNote.textContent = !path
    ? 'select a part'
    : path.role === 'hull'
      ? `the ten torso shells. The body is one of these or it is the standard cube — it has no size of its own.`
      : path.role === 'legs'
        ? 'the leg shape is the pack\'s own and does not change'
        : `${rows.length} shapes in the library`

  /* Size. Only features and extras have one; `setStretch` no-ops on the rest. */
  const stretch: Vec3 = (slot && 'stretch' in slot && slot.stretch ? slot.stretch : [1, 1, 1]) as Vec3
  const resizable = !!path && path.role !== 'hull' && path.role !== 'legs'
    && path.role !== 'eyes' && path.role !== 'ridge'
  const uniform = el<HTMLInputElement>('#size-uniform').checked
  sizeDials.replaceChildren(...(['x', 'y', 'z'] as const).map((axis, i) => {
    const wrap = document.createElement('div')
    wrap.className = 'dial'
    const name = document.createElement('span')
    name.textContent = axis
    const range = document.createElement('input')
    range.type = 'range'
    range.min = '0.25'
    range.max = '4'
    range.step = '0.05'
    range.value = String(stretch[i])
    range.disabled = !resizable || (uniform && i > 0)
    const out = document.createElement('output')
    out.textContent = `${stretch[i]!.toFixed(2)}×`
    range.addEventListener('input', () => { out.textContent = `${Number(range.value).toFixed(2)}×` })
    range.addEventListener('change', () => {
      if (!def || !path) return
      const v = Number(range.value)
      const axes: [number, number, number] = uniform
        ? [v, v, v]
        : [stretch[0]!, stretch[1]!, stretch[2]!]
      if (!uniform) axes[i] = v
      const next: Vec3 = axes
      apply(setStretch(def, path, next), `resized ${label(path)} to ${axes.map(n => n.toFixed(2)).join(' × ')}`)
    })
    wrap.append(name, range, out)
    return wrap
  }))
  /*
   * Resize is FOREIGN to the pack's grammar — one node in 133 carries a scale —
   * so it is a legitimate authoring act that must announce itself. Uniform and
   * per-axis are kept distinguishable on purpose: stretching an ear about three
   * times reads fine, and stretching an eye card never does.
   */
  sizeNote.textContent = !resizable
    ? (path ? `${label(path)} has no size of its own` : 'select a part')
    : uniform
      ? 'uniform. Only one node in the whole pack carries a scale at all, so any value here is authoring, not measurement.'
      : 'per-axis. Safe on an ear to about 3×; never on an eye card.'

  /* Colour. Two different acts: repaint a SLOT, or point a part at another slot. */
  const paint = slot && 'paint' in slot ? slot.paint : undefined
  const usedSlot = typeof paint === 'string' ? paint : undefined
  paletteList.replaceChildren(...Object.entries(def.palette).map(([name, rgb], column) => {
    const li = document.createElement('li')
    if (name === usedSlot) li.className = 'used'
    const colour = document.createElement('input')
    colour.type = 'color'
    colour.className = 'swatch'
    colour.value = '#' + (rgb & 0xffffff).toString(16).padStart(6, '0')
    colour.title = `recolour the "${name}" slot`
    colour.addEventListener('change', () => {
      if (!def) return
      const value = Number.parseInt(colour.value.replace('#', ''), 16) || 0
      apply(setPaletteColour(def, name, value), `recoloured "${name}" to ${colour.value}`)
    })
    const slotName = document.createElement('span')
    slotName.className = 'slot'
    slotName.textContent = name
    const col = document.createElement('span')
    col.className = 'col'
    col.textContent = `col ${column}`
    const use = document.createElement('button')
    use.type = 'button'
    use.className = 'quiet'
    use.textContent = 'paint'
    use.disabled = !path
    use.title = path ? `paint ${label(path)} from "${name}"` : 'select a part'
    use.addEventListener('click', () => {
      if (!def || !path) return
      apply(setPaint(def, path, name), `painted ${label(path)} from "${name}"`)
    })
    li.append(colour, slotName, col, use)
    return li
  }))
  colourNote.textContent = usedSlot
    ? `${label(path!)} is painted from "${usedSlot}".`
    : 'A swatch recolours the slot everywhere it is used. "paint" points the selected part at that slot instead.'
}

/* --------------------------------------------------------------- the warnings */

function drawWarnings(): void {
  if (!def || !opened) return
  const found: Warning[] = warningsFor(def, opened)
  warningList.replaceChildren(...found.map(w => {
    const li = document.createElement('li')
    li.className = w.severity
    const axiom = document.createElement('span')
    axiom.className = 'axiom'
    axiom.textContent = w.axiom
    li.append(axiom, document.createTextNode(w.text))
    if (w.path) li.addEventListener('click', () => select(w.path!))
    return li
  }))
}

function draw(): void {
  drawParts()
  drawInspector()
  drawWarnings()
  drawSelected()
  /*
   * The unsaved marker belongs in the SAME redraw as the change that caused it.
   * Left out of here it only refreshed when a species was opened, so the panel
   * cheerfully read "saved" over an hour of unsaved work — the exact lie this
   * whole run exists to stop telling.
   */
  drawSaveNote()
}

/* -------------------------------------------------------------- the wiring */

/**
 * Put a definition on the screen.
 *
 * `baseline` is what `warningsFor` compares against and what "Start again" goes
 * back to. For a shipped species that is the species as it ships; for a draft it
 * is the shipped species it came FROM, so the warnings keep telling Joe how far
 * he has moved from a real animal rather than resetting to his own last save.
 * A draft started from scratch has no such original, so it is its own baseline.
 */
function show(id: string, next: CreatureDef, baseline: CreatureDef, what: string): void {
  const result = stage.show(id, next)
  if (!result.ok) { say(`${id} does not build: ${result.error}`, true); return }
  speciesId = id
  opened = baseline
  def = next
  selected = null
  select(null)
  draw()
  openNote.textContent
    = `${Object.keys(next.palette).length} palette slots · ${listParts(next).length} parts`
  drawSaveNote()
  say(what)
}

function open(id: string): void {
  const found = defs.get(id)
  if (!found) { say(`no definition captured for ${id}`, true); return }
  draftId = ''
  givenName = ''
  saved = true
  show(id, found, found, `opened ${id}`)
}

/** Reopen one of Joe's own saved drafts, exactly as he left it. */
function openDraft(draft: Draft): void {
  draftId = draft.id
  givenName = draft.givenName
  saved = true
  show(draft.speciesId, draft.def, defs.get(draft.from) ?? draft.def, `opened ${draft.id}`)
}

for (const mode of ['translate', 'rotate', 'scale'] as const) {
  el<HTMLButtonElement>(`#mode-${mode}`).addEventListener('click', () => {
    stage.setMode(mode as GizmoMode)
    for (const other of ['translate', 'rotate', 'scale'] as const) {
      el<HTMLButtonElement>(`#mode-${other}`).classList.toggle('on', other === mode)
    }
  })
}

el<HTMLButtonElement>('#act-copy').addEventListener('click', () => {
  if (!def || !selected) { say('select a part first', true); return }
  const { def: next, path } = duplicatePart(def, selected)
  if (next === def) { say(`${label(selected)} cannot be copied`, true); return }
  /*
   * Select the copy ONLY if it landed. `apply` can still refuse — the builder
   * throwing is an answer — and a selection pointing at an extras index that
   * was never created leaves the inspector describing a part that is not there.
   */
  if (apply(next, `copied ${pathKey(path)}`)) select(path)
})

el<HTMLButtonElement>('#act-mirror').addEventListener('click', () => {
  if (!def || !selected) { say('select a part first', true); return }
  /*
   * Mirroring is ONE mesh placed twice — `kind: 'pair'` — not a second copy of
   * the geometry. The builder makes both copies from the same part, which is why
   * a mirrored part stays one thing to edit.
   */
  const slot = partAt(def, selected)
  const paired = slot && 'kind' in slot && slot.kind === 'pair'
  apply(setMirrored(def, selected, !paired), `${paired ? 'unpaired' : 'mirrored'} ${label(selected)}`)
})

el<HTMLButtonElement>('#act-delete').addEventListener('click', () => {
  if (!def || !selected) { say('select a part first', true); return }
  const gone = label(selected)
  const next = deletePart(def, selected)
  if (next === def) { say(`${gone} cannot be deleted — an animal is one mass`, true); return }
  if (apply(next, `deleted ${gone}`)) select(null)
})

shapePick.addEventListener('change', () => {
  if (!def || !selected) return
  apply(setPartShape(def, selected, shapePick.value), `${label(selected)} is now ${shapePick.value}`)
})

/**
 * Add a part that is not on the animal at all.
 *
 * Joe's third note: *"i need to be able to insert a new component."* Copy, mirror
 * and delete all needed something already there; this is the one that starts from
 * nothing. It lands in `extras`, which is the only slot that takes an arbitrary
 * part, and it arrives at the donor transfer — the shape's own measured join
 * against this hull — rather than at a guessed offset. So it appears ON the
 * animal, and he drags it where he wants it.
 *
 * It is selected immediately: an insert whose result you then have to hunt for in
 * a list of fourteen is an insert that feels like it failed.
 */
el<HTMLButtonElement>('#act-insert').addEventListener('click', () => {
  if (!def) return
  const { def: next, path } = insertPart(def, insertPick.value)
  if (!path) { say('choose a shape to insert', true); return }
  if (apply(next, `inserted ${insertPick.value}`)) select(path)
})

el<HTMLButtonElement>('#size-reset').addEventListener('click', () => {
  if (!def || !selected) { say('select a part first', true); return }
  apply(setStretch(def, selected, undefined), `${label(selected)} back to its own size`)
})
for (const id of ['#size-uniform', '#size-free']) {
  el<HTMLInputElement>(id).addEventListener('change', drawInspector)
}

el<HTMLInputElement>('#snap').addEventListener('change', event => {
  stage.setSnap((event.target as HTMLInputElement).checked)
})
el<HTMLInputElement>('#explode').addEventListener('change', event => {
  stage.setExplode((event.target as HTMLInputElement).checked)
})

el<HTMLButtonElement>('#revert').addEventListener('click', () => {
  /*
   * Back to the BASELINE, not back through `open`. A draft Joe started from
   * scratch has a species id no shipped animal answers to, and re-opening by id
   * would tell him his own animal does not exist.
   */
  if (!opened) return
  const wasDraft = draftId
  show(speciesId, opened, opened, 'back to the original')
  draftId = wasDraft
  saved = false
  drawSaveNote()
})

el<HTMLButtonElement>('#show-source').addEventListener('click', () => {
  if (!def) return
  sourceOut.hidden = false
  sourceOut.textContent = defToModuleSource(speciesId, def)
})

/* ---------------------------------------------------------------- the saving */

const api = async (path: string, body?: unknown): Promise<Record<string, unknown>> => {
  const res = await fetch(path, body === undefined ? undefined : {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  return res.json() as Promise<Record<string, unknown>>
}

function drawSaveNote(): void {
  saveNote.textContent = !def
    ? ''
    : draftId
      ? `${draftId}${saved ? ' — saved' : ' — unsaved changes'}`
      : saved ? 'not saved yet' : 'unsaved changes'
  saveNote.className = saved ? 'note' : 'note warn'
}

/** The Animal list: what ships, then what Joe has made, kept apart. */
function drawSubjects(): void {
  const chosen = draftId ? `draft:${draftId}` : speciesId
  const groups: HTMLOptGroupElement[] = []
  const shipped = document.createElement('optgroup')
  shipped.label = `Shipped species (${defs.size})`
  shipped.append(...[...defs.keys()].map(id => {
    const option = document.createElement('option')
    option.value = id
    option.textContent = id.replace(/^animal-/, '')
    return option
  }))
  groups.push(shipped)
  if (drafts.length) {
    const mine = document.createElement('optgroup')
    mine.label = `My drafts (${drafts.length})`
    mine.append(...drafts.map(d => {
      const option = document.createElement('option')
      option.value = `draft:${d.id}`
      option.textContent = `${d.givenName || d.speciesId.replace(/^animal-/, '')} · ${d.id}`
      return option
    }))
    groups.push(mine)
  }
  subjectPick.replaceChildren(...groups)
  if (chosen) subjectPick.value = chosen
}

/** Read the drafts back off the server. The page never keeps its own copy warm. */
async function refreshDrafts(): Promise<void> {
  const state = await api('/api/state')
  drafts = (state['edits'] ?? []) as readonly Draft[]
  drawSubjects()
}

/**
 * Save Joe's edits.
 *
 * His first note, and the one that blocked the other four: *"need to be able to
 * save my edits."* Until this landed the editor could do everything except keep
 * anything, so every session's work died with the tab.
 *
 * Two shapes, and which one is used is decided against the file as it is RIGHT
 * NOW, not against what the page loaded:
 *
 *  - a draft for this species already exists → `patch`, naming only the fields
 *    this page owns. A patch cannot disturb a field it does not mention, which
 *    is what lets an agent and this page write the same file.
 *  - it does not → a whole-file payload carrying **only the new draft**, and
 *    **no id**. `merge.mjs` deals `SD-nnn` inside the request and KEEPS every
 *    record the payload does not mention. Sending the drafts we already knew
 *    about would risk a 409 against anything changed since; sending one record
 *    cannot.
 *
 * This writes to `joe/species-edits.json` and nowhere else. **It cannot touch a
 * shipped species** — the live twenty-four are frozen, and the only way out of
 * this page into `src/` is Joe copying the module text himself.
 */
async function save(): Promise<void> {
  if (!def) return
  await refreshDrafts()
  const mine = drafts.find(d => d.speciesId === speciesId)
  const fields = {
    speciesId,
    from: defs.has(speciesId) ? speciesId : (mine?.from ?? ''),
    fromKind: defs.has(speciesId) ? 'built' : 'scratch',
    collection: mine?.collection ?? '',
    givenName: givenName || mine?.givenName || '',
    fact: mine?.fact ?? '',
    factSource: mine?.factSource ?? '',
    def,
    warnings: opened ? warningsFor(def, opened) : [],
    state: 'draft',
    note: mine?.note ?? '',
  }
  const reply = mine
    ? await api('/api/save', { what: 'edits', patch: { id: mine.id, ...fields } })
    : await api('/api/save', {
      what: 'edits', value: { schemaVersion: 1, nextId: 1, drafts: [fields] },
    })
  if (reply['error']) {
    say(`could not save: ${String(reply['error'])}`, true)
    return
  }
  await refreshDrafts()
  draftId = drafts.find(d => d.speciesId === speciesId)?.id ?? ''
  saved = true
  drawSubjects()
  drawSaveNote()
  say(`saved ${draftId || speciesId}`)
}

el<HTMLButtonElement>('#save').addEventListener('click', () => {
  void save().catch((error: unknown) => {
    say(error instanceof Error ? error.message : String(error), true)
  })
})

/* ------------------------------------------------------- a new animal, blank */

/**
 * An animal id from whatever Joe typed.
 *
 * UK English, lower case, dashes: `Fen Hare` becomes `animal-fen-hare`, which is
 * the shape every shipped species id already has and the shape the file name
 * would take if he takes it out as a module.
 */
const idFromName = (name: string): string =>
  'animal-' + name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Joe's fifth note: *"need a function to start a new animal conmpletely from
 * scratch."*
 *
 * A new animal REFUSES a shipped id. The live twenty-four are frozen, and an
 * editor that lets a typo put him on top of the hedgehog — thinking he is making
 * something new — is exactly the accident that must not be possible here. His
 * drafts are his own and are overwritten happily; only the shipped ones are shut.
 */
el<HTMLButtonElement>('#new-animal').addEventListener('click', () => {
  const name = newName.value.trim()
  if (!name) { say('give the new animal a name first', true); return }
  const id = idFromName(name)
  if (id === 'animal-') { say(`"${name}" leaves nothing to make an id out of`, true); return }
  if (defs.has(id)) {
    say(`${id} is a shipped species and is frozen — choose another name`, true)
    return
  }
  const blank = blankDef()
  draftId = drafts.find(d => d.speciesId === id)?.id ?? ''
  givenName = name
  saved = false
  show(id, blank, blank, `started ${name} — ${id}`)
  drawSubjects()
})

subjectPick.addEventListener('change', () => {
  const value = subjectPick.value
  if (value.startsWith('draft:')) {
    const found = drafts.find(d => d.id === value.slice('draft:'.length))
    if (found) openDraft(found)
    return
  }
  open(value)
})

/* ----------------------------------------------------------------- the boot */

loadBuiltDefs().then(async loaded => {
  defs = loaded
  drawSubjects()
  fillShapes(insertPick, ALL_SHAPES)
  insertNote.textContent
    = `${ALL_SHAPES.length} shapes, grouped by what they DO. A shape the pack used for two jobs `
    + 'appears under both. An inserted part lands at its own measured join to this body, and you '
    + 'drag it from there.'
  stage.setSnap(true)
  const first = [...loaded.keys()][0]
  if (first) open(first)
  /*
   * The drafts come last and never block the animals. The editor is useful with
   * no server behind it — that is how it was reviewed — so a workbench served by
   * something that cannot answer `/api/state` must still open a species.
   */
  await refreshDrafts().catch(() => {
    saveNote.textContent = 'no workbench server, so nothing can be saved from here'
  })
  drawSubjects()
}).catch((error: unknown) => {
  say(error instanceof Error ? error.message : String(error), true)
})
