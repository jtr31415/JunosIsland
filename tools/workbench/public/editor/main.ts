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
  deletePart, duplicatePart, defToModuleSource, listParts, partAt, pathKey, samePath,
  setJoin, setMirrored, setPaint, setPaletteColour, setPartShape, setSpin, setStretch,
  warningsFor, type DefPath, type Warning,
} from './def'
import { ALL_SHAPES, HULL_SHAPES, summarise } from './library'
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

function say(text: string, bad = false): void {
  saySpan.textContent = text
  saySpan.className = bad ? 'say bad' : 'say good'
}

/* ---------------------------------------------------------------- the state */

let defs: ReadonlyMap<string, CreatureDef> = new Map()
/** The definition as it ships, so `warningsFor` has a baseline and revert works. */
let opened: CreatureDef | null = null
let def: CreatureDef | null = null
let speciesId = ''
let selected: DefPath | null = null

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
function apply(next: CreatureDef, why: string): void {
  if (!def) return
  if (next === def) { say(`${why}: that part has no such handle`, true); return }
  const result = stage.show(speciesId, next)
  if (!result.ok) {
    /*
     * The builder throwing is an ANSWER — an unexpressible animal saying so. The
     * old definition stays, the old model stays on screen, and the sentence the
     * builder wrote is what Joe reads. Warn, never block, is for the axioms; a
     * throw is the builder's own line and it is not ours to talk him past.
     */
    say(`refused: ${result.error}`, true)
    return
  }
  def = next
  say(why)
  draw()
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
  shapePick.replaceChildren(...rows.map(row => {
    const option = document.createElement('option')
    option.value = row.id
    option.textContent = summarise(row)
    option.selected = row.id === current
    return option
  }))
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
}

/* -------------------------------------------------------------- the wiring */

function open(id: string): void {
  const found = defs.get(id)
  if (!found) { say(`no definition captured for ${id}`, true); return }
  speciesId = id
  opened = found
  selected = null
  const result = stage.show(id, found)
  if (!result.ok) { say(`${id} does not build: ${result.error}`, true); return }
  def = found
  select(null)
  draw()
  openNote.textContent = `${Object.keys(found.palette).length} palette slots · ${listParts(found).length} parts`
  say(`opened ${id}`)
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
  selected = path
  apply(next, `copied ${pathKey(path)}`)
  select(path)
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
  selected = null
  apply(next, `deleted ${gone}`)
  select(null)
})

shapePick.addEventListener('change', () => {
  if (!def || !selected) return
  apply(setPartShape(def, selected, shapePick.value), `${label(selected)} is now ${shapePick.value}`)
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
  if (speciesId) open(speciesId)
})

el<HTMLButtonElement>('#show-source').addEventListener('click', () => {
  if (!def) return
  sourceOut.hidden = false
  sourceOut.textContent = defToModuleSource(speciesId, def)
})

subjectPick.addEventListener('change', () => open(subjectPick.value))

/* ----------------------------------------------------------------- the boot */

loadBuiltDefs().then(loaded => {
  defs = loaded
  subjectPick.replaceChildren(...[...loaded.keys()].map(id => {
    const option = document.createElement('option')
    option.value = id
    option.textContent = id.replace(/^animal-/, '')
    return option
  }))
  stage.setSnap(true)
  const first = [...loaded.keys()][0]
  if (first) { subjectPick.value = first; open(first) }
}).catch((error: unknown) => {
  say(error instanceof Error ? error.message : String(error), true)
})
