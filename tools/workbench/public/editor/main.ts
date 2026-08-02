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
 * ## The name and the fact are settled here; the APPROVAL is not
 *
 * Joe, 2 August: *"in the editor i also want to sign off on the name and the
 * fact line."* The `Name and fact` panel is that — see `signoff.ts`, which owns
 * all of its arithmetic and none of its DOM. It fills the four fields
 * `joe/species-edits.json` has always carried and the UI never exposed:
 * `collection`, `givenName`, `fact` and `factSource`.
 *
 * **There is no approve tick in this page and there must not be.** One creature,
 * one judgement, on the Animals bench (`approver.ts`, JT-031). This panel
 * settles what the bench will show; it does not tick it.
 *
 * ## The Animal list is the ANIMALS, and it says what still needs doing
 *
 * Joe, 2 August: *"when i save an animal in the editor, it needs to just
 * overwrite what there is already and i need to see and filter by status, so i
 * can tell from the list what still needs doing. no saving of drafts in the
 * bottom of the list"* — and, a minute later, *"also group them by collection, so
 * i can prioritize."*
 *
 * So: one row per animal, under a header per collection in ship order, each row
 * and each header carrying a status; a filter that narrows to one status; and
 * **a save overwrites the record for that animal** rather than appending a new
 * one. Before this, every Save dealt a fresh `SD-nnn` and hung a `draft:SD-002`
 * row under the animals — his file had three of them and none of them was ever
 * meant to be a separate thing.
 *
 * All of the arithmetic is `status.ts`, which owns the four statuses and, more
 * importantly, owns `signedOff()` — the one call that answers whether a creature
 * has Joe's tick. That answer is about to decide what reaches the game at all,
 * so read that file's header before doing anything with it here.
 *
 * ## What is deliberately NOT here yet
 *
 * Joe's instruction while this was being built: *"dont get too clever with it. I
 * just needs the basics."* So three things he has asked for are named here and
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
 *  - **Non-uniform colouring** (the deer's belly, the penguin's front). Both
 *    routes are already sayable in the definition: `belly: k/16` paints the
 *    boundary into the coat's cell with no geometry, and a separate `paint` on a
 *    part splits it by triangle. A side-by-side of the two is a later pass.
 */

import {
  blankDef, deletePart, duplicatePart, defToModuleSource, giveOwnPaletteSlot, insertPart,
  listParts, paintSlotOf, partAt, pathKey, samePath, setJoin, setMirrored, setPaint,
  setPaletteColour, setPartShape, setSpin, setStretch, warningsFor,
  type DefPath, type Warning,
} from './def'
import { ALL_SHAPES, HULL_SHAPES, groupShapes, summarise, type ShapeRow } from './library'
import { signoffView, type SignoffView } from './signoff'
import {
  STATUSES, STATUS_LABEL, rowLabel, subjectGroups,
  type AuditRow, type Status,
} from './status'
import { pushOutcome, pushRequest, type PushReply } from './push'
import { loadBuiltDefs } from './capture'
import { createStage, type GizmoMode } from './stage'
import type { CreatureDef } from '../../../../src/island/species/parts'
import type { Vec3 } from '../../../../src/island/species/parts/assembly'
import { LOCOMOTIONS, LOCOMOTION_LABELS, type Locomotion } from '../../../../src/island/species/moves'

/* ------------------------------------------------------------------ the DOM */

function el<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`editor: no ${selector} in index.html`)
  return found
}

const saySpan = el<HTMLParagraphElement>('#say')
const subjectPick = el<HTMLSelectElement>('#subject')
const subjectFilter = el<HTMLSelectElement>('#subject-filter')
const subjectNote = el<HTMLParagraphElement>('#subject-note')
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
const signoffWho = el<HTMLParagraphElement>('#signoff-who')
const signoffName = el<HTMLInputElement>('#signoff-name')
const signoffMoves = el<HTMLSelectElement>('#signoff-moves')
const signoffFact = el<HTMLTextAreaElement>('#signoff-fact')
const signoffProblems = el<HTMLUListElement>('#signoff-problems')
const signoffNote = el<HTMLParagraphElement>('#signoff-note')
const pushNote = el<HTMLParagraphElement>('#push-note')
const pushOut = el<HTMLUListElement>('#push-out')

function say(text: string, bad = false): void {
  saySpan.textContent = text
  saySpan.className = bad ? 'say bad' : 'say good'
}

/*
 * The four options, read off `moves.ts` rather than retyped — a label written a
 * second time here is a label that can drift from the value it sets, which is
 * exactly what `LOCOMOTION_LABELS` exists to stop. Filled once: the four words
 * do not change while the page is open.
 */
signoffMoves.append(
  new Option('not decided yet', ''),
  ...LOCOMOTIONS.map(loc => new Option(LOCOMOTION_LABELS[loc], loc)),
)

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
 * **`speciesId` IS the id.** There is no `SD-nnn` any more and there is no
 * counter behind one: a record is keyed by the animal it describes, so saving
 * the squirrel twice updates one record instead of dealing a second. That also
 * ends the id race the counter existed to manage — a derived key has no pool for
 * two writers to draw the same number out of. `merge.mjs MERGEABLE.edits` argues
 * both halves of that, and its `migrate` folds the ids already on disk away
 * without losing a field.
 *
 * A save is still safe against a second writer for the reason it always was: the
 * page sends a PATCH naming the record and the fields it owns, and the server
 * re-reads the file inside the request.
 */
interface Draft {
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
  /** How it gets about, Joe's own word. Absent means he has not ruled on it yet. */
  moves?: Locomotion
}

let drafts: readonly Draft[] = []
/**
 * `joe/names-audit.json`'s rows — the only thing that knows what Joe has signed
 * off, and therefore what may reach the game at all. Read, never written here.
 */
let audit: readonly AuditRow[] = []
/** Which status the Animal list is narrowed to, or `'all'`. His choice, not saved. */
let filter: Status | 'all' = 'all'
/** True when the animal on screen has a saved record of Joe's behind it. */
let isMine = false
/** False the moment a gesture lands, true again only when the server has it. */
let saved = true
/**
 * The name Joe typed over the generated one, or '' to take what `naming.ts`
 * draws.
 *
 * NOT the same thing as the species' printed name — `SPECIES_NAMES` owns that
 * and it is never typed here. This is the child-facing given name, the word a
 * six-year-old says out loud, and `signoff.ts` explains why it is offered rather
 * than demanded. It used to hold the display name Joe typed into "Start from
 * scratch", which was a third meaning of a word that already had two.
 */
let nameOverride = ''
/** The sentence that goes under the animal's name. Joe's own words. */
let fact = ''
/** How it gets about, Joe's own word — `''` while he has not ruled on it yet. */
let moves: Locomotion | '' = ''

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

  /*
   * Colour. THREE different acts, and the third is the one Joe was missing:
   * *"the colour panel does not let me colour a newly added primitive in my own
   * colour, eg i dont seem to be able to colour a mouth with the colour i want."*
   *
   * Repaint a SLOT (the swatch) hits every part sharing it. Point a part at
   * another slot ("paint") only moves the problem — a mouth painted from `limb`
   * still cannot differ from the legs. Neither can ever give one part a colour of
   * its own, because the panel's whole vocabulary was the slots already in the
   * palette and a freshly inserted part arrives sharing one.
   *
   * "own colour" appends a slot and repoints this part at it, seeded with the
   * colour it already wears — so nothing changes until the new swatch is dragged,
   * and then only this part moves. Appending is the ONLY shape change: insertion
   * order is the texture layout, so a new slot takes the next atlas row and every
   * existing row keeps its index. See `giveOwnPaletteSlot`.
   *
   * `paintSlotOf` and not `slot.paint`, because a part that says nothing about
   * paint is still painted — from the coat, the limb or the under, per role. The
   * panel used to mark NO row for such a part, which is exactly how a person
   * concludes the mouth has no colour and goes and recolours the body instead.
   */
  const usedSlot = path ? paintSlotOf(def, path) ?? undefined : undefined
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

  /*
   * The append row, LAST in the list on purpose: it is where the slot it makes
   * will appear, because appending is the only safe edit to a palette's shape.
   */
  const ownRow = document.createElement('li')
  ownRow.className = 'own'
  const own = document.createElement('button')
  own.type = 'button'
  own.textContent = 'own colour'
  own.disabled = !path
  own.title = path
    ? `give ${label(path)} a palette slot of its own, so colouring it moves nothing else`
    : 'select a part'
  own.addEventListener('click', () => {
    if (!def || !path) return
    const made = giveOwnPaletteSlot(def, path)
    if (made.slot === null) { say('own colour: that part has no paint of its own', true); return }
    apply(made.def, `"${made.slot}" is ${label(path)}'s own slot — recolour it and nothing else moves`)
  })
  ownRow.append(own)
  paletteList.append(ownRow)

  /*
   * The note names the slot AND how many other parts are on it, because "painted
   * from coat" is not the fact that matters — "and so is the body" is.
   */
  const sharers = usedSlot === undefined ? 0
    : listParts(def).filter(r => !samePath(r.path, path!) && paintSlotOf(def!, r.path) === usedSlot).length
  colourNote.textContent = !path
    ? 'A swatch recolours the slot everywhere it is used. Select a part to point it at another slot, or to give it one of its own.'
    : sharers > 0
      ? `${label(path)} is painted from "${usedSlot}" — and so ${sharers === 1 ? 'is 1 other part' : `are ${sharers} other parts`}. `
        + 'Recolouring that swatch moves all of them; "own colour" appends a slot for this part alone.'
      : `${label(path)} is painted from "${usedSlot}", which no other part uses — the swatch above colours it alone.`
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

/**
 * The name-and-fact panel, and what stands between it and the game.
 *
 * Everything drawn here is derived by `signoffView` off the roster and
 * `naming.ts`; this function only paints it. The two fields are written back
 * into the module-level `nameOverride`/`fact` on input rather than read out of
 * the DOM at save time — a save that reads the DOM is a save that silently does
 * nothing when the panel is hidden.
 */
function drawSignoff(): SignoffView {
  const view = signoffView(speciesId, { givenName: nameOverride, fact, moves })
  signoffMoves.value = moves

  signoffWho.textContent = speciesId === ''
    ? 'no animal open'
    : view.inRoster
      ? `${view.species} · ${view.collectionName} · ${view.band} names`
      : `${view.species} — not in the ratified roster`

  /* Never fight his cursor: the box is only refilled when it is not his. */
  if (document.activeElement !== signoffName) signoffName.value = view.name
  signoffName.placeholder = view.generated || 'its given name'
  if (document.activeElement !== signoffFact) signoffFact.value = fact

  signoffProblems.replaceChildren(...view.problems.map(p => {
    const li = document.createElement('li')
    if (!p.blocks) li.className = 'soft'
    li.textContent = p.say
    return li
  }))

  /*
   * THE SENTENCE THAT STOPS THE PANEL LYING. A name typed over the generated
   * one is recorded as the audit row's `replacement` — his preference, on the
   * bench, where the same field has always meant that. It does NOT rename the
   * creature in the game: the game reads `NAME_PINS`, and `naming.ts` keeps that
   * table empty on purpose until Juno's save arrives, with a test standing over
   * it. Saying "it would be called X" when the game will say Y is exactly the
   * class of quiet untruth this project keeps paying for.
   */
  signoffNote.textContent = !view.ready
    ? `${view.generated ? `${view.generated} is what it will be called. ` : ''}`
      + 'The approve tick is not here: it is on the Animals bench in the viewer, once per creature, '
      + 'over the model, the name and the fact together.'
    : view.overridden
      ? `ready. The game will still call it ${view.generated} — your ${view.name} is recorded as the `
        + 'replacement for you to rule on at the bench, because a name a child already says is only '
        + 'changed by a pin, deliberately.'
      : `ready — it will be called ${view.name}, and the fact goes to the bench flagged until `
        + 'something checks it.'
  signoffNote.className = view.ready ? 'note' : 'note warn'
  return view
}

function draw(): void {
  drawParts()
  drawInspector()
  drawWarnings()
  drawSelected()
  drawSignoff()
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

/**
 * Open an animal from the list.
 *
 * **His own work wins.** One row per animal means one gesture has to serve both
 * "show me the hedgehog" and "show me what I did to the hedgehog", and the
 * second is the only one worth choosing: an editor that opened the shipped
 * version over an evening of saved edits would be hiding his work behind a name
 * he has no reason to distrust. `Start again from the original` is how he gets
 * back to the shipped one, and it always was.
 */
function openAnimal(id: string): void {
  const mine = drafts.find(d => d.speciesId === id)
  if (mine) { openDraft(mine); return }
  open(id)
}

function open(id: string): void {
  const found = defs.get(id)
  if (!found) { say(`no definition captured for ${id}`, true); return }
  isMine = false
  nameOverride = ''
  fact = ''
  moves = ''
  saved = true
  show(id, found, found, `opened ${id}`)
}

/** Reopen one of Joe's own saved drafts, exactly as he left it. */
function openDraft(draft: Draft): void {
  isMine = true
  nameOverride = draft.givenName
  fact = draft.fact
  moves = draft.moves ?? ''
  saved = true
  show(
    draft.speciesId, draft.def, defs.get(draft.from) ?? draft.def,
    `opened ${draft.speciesId} — your saved version`,
  )
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
  const wasMine = isMine
  show(speciesId, opened, opened, 'back to the original')
  isMine = wasMine
  saved = false
  drawSaveNote()
})

el<HTMLButtonElement>('#show-source').addEventListener('click', () => {
  if (!def) return
  sourceOut.hidden = false
  sourceOut.textContent = defToModuleSource(speciesId, def)
})

/* ---------------------------------------------------------------- the saving */

/**
 * One request, and a reply that cannot hide a failure.
 *
 * Every caller here decides what happened by looking for an `error` key, so a
 * 400 or a 500 whose body does not happen to carry one used to read as a
 * success — the status was never inspected at all. A reply that is not JSON did
 * the same thing, by throwing somewhere else entirely. Both are turned into the
 * one shape the callers already understand, so silence stops being possible at
 * the only door the page has.
 */
const api = async (path: string, body?: unknown): Promise<Record<string, unknown>> => {
  const res = await fetch(path, body === undefined ? undefined : {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
  let reply: Record<string, unknown>
  try {
    reply = await res.json() as Record<string, unknown>
  } catch {
    return { error: `${path} answered ${res.status} and the reply was not JSON at all` }
  }
  /* The server's own words win when it has any; the status only fills a silence. */
  if (!res.ok && reply['error'] === undefined) {
    return { ...reply, error: `${path} answered ${res.status}${res.statusText ? ` ${res.statusText}` : ''} and said nothing about why` }
  }
  return reply
}

function drawSaveNote(): void {
  saveNote.textContent = !def
    ? ''
    : isMine
      ? saved ? 'your saved version' : 'unsaved changes'
      : saved ? 'not saved yet' : 'unsaved changes'
  saveNote.className = saved ? 'note' : 'note warn'
}

/**
 * The Animal list. Every animal, once, grouped by collection, status on the row.
 *
 * The whole list is `subjectGroups`' answer — this function paints it and
 * decides nothing. That split is deliberate and it is the repo's rule: a page
 * that restated the conditions behind a status would be a second opinion with no
 * way to tell which of the two was the truth (HANDOFF §6 on `tileOffer`).
 */
function drawSubjects(): void {
  const groups = subjectGroups({ built: [...defs.keys()], drafts, audit, filter })
  subjectPick.replaceChildren(...groups.map(group => {
    const optgroup = document.createElement('optgroup')
    optgroup.label = group.label
    optgroup.append(...group.rows.map(row => {
      const option = document.createElement('option')
      option.value = row.speciesId
      option.textContent = rowLabel(row)
      return option
    }))
    return optgroup
  }))
  /*
   * A filter NARROWS THE LIST; it never closes the animal. The one on screen
   * stays on screen even when its status has just moved it out of view — losing
   * an hour's work because a save changed a status is not a trade worth making
   * — so the picker simply shows nothing selected and the note below says why.
   */
  const shown = groups.flatMap(g => g.rows)
  subjectPick.value = shown.some(r => r.speciesId === speciesId) ? speciesId : ''
  drawFilter(shown.length)
}

/**
 * The filter, with a count against every status.
 *
 * The counts are the point rather than a decoration: *"so i can tell from the
 * list what still needs doing"* is answered before he opens the list at all if
 * the option itself reads `in progress (4)`. Rebuilt on every draw because a
 * count that lags a save is worse than no count; his choice is carried across.
 */
function drawFilter(shown: number): void {
  const all = subjectGroups({ built: [...defs.keys()], drafts, audit, filter: 'all' })
  const rows = all.flatMap(g => g.rows)
  const option = (value: Status | 'all', text: string): HTMLOptionElement => {
    const out = document.createElement('option')
    out.value = value
    out.textContent = text
    out.selected = value === filter
    return out
  }
  subjectFilter.replaceChildren(
    option('all', `every animal (${rows.length})`),
    ...STATUSES.map(status =>
      option(status, `${STATUS_LABEL[status]} (${rows.filter(r => r.status === status).length})`)),
  )

  const todo = rows.filter(r => r.status !== 'signed').length
  const hidden = speciesId !== '' && !subjectPick.value
  subjectNote.textContent
    = (filter === 'all'
      ? `${rows.length} animals · ${todo} still to do`
      : `showing ${shown} of ${rows.length} · ${todo} still to do altogether`)
    + (hidden ? ` · ${speciesId.replace(/^animal-/, '')} is open but this filter hides it` : '')
  subjectNote.className = hidden ? 'note warn' : 'note'
}

/**
 * Read the drafts and the sign-offs back off the server. The page never keeps
 * its own copy warm.
 *
 * `names` comes along because a status is not derivable without it: `signedOff`
 * reads `joe/names-audit.json`, which is where Joe's tick actually lives, and a
 * list that guessed at it from the draft store would be inventing the one state
 * that decides whether an animal reaches the game.
 */
async function refreshDrafts(): Promise<void> {
  const state = await api('/api/state')
  drafts = (state['edits'] ?? []) as readonly Draft[]
  audit = (state['names'] ?? []) as readonly AuditRow[]
  drawSubjects()
}

/**
 * Save Joe's edits.
 *
 * His first note, and the one that blocked the other four: *"need to be able to
 * save my edits."* Until this landed the editor could do everything except keep
 * anything, so every session's work died with the tab.
 *
 * **A SAVE OVERWRITES.** Joe, 2 August: *"when i save an animal in the editor,
 * it needs to just overwrite what there is already"*. One animal, one record,
 * keyed by `speciesId` — so this can no longer produce the second, third and
 * fourth copy of the same squirrel that used to appear under the list.
 *
 * Two shapes, and which one is used is decided against the file as it is RIGHT
 * NOW, not against what the page loaded:
 *
 *  - a record for this species already exists → `patch`, naming only the fields
 *    this page owns. A patch cannot disturb a field it does not mention, which
 *    is what lets an agent and this page write the same file.
 *  - it does not → a whole-file payload carrying **only the new record**.
 *    `merge.mjs` KEEPS every record the payload does not mention, so a save here
 *    cannot destroy one an agent appended while this tab was open. Sending the
 *    drafts we already knew about would risk a 409 against anything changed
 *    since; sending one record cannot.
 *
 * This writes to `joe/species-edits.json` and nowhere else. **It cannot touch a
 * shipped species** — the live twenty-four are frozen, and the only way out of
 * this page into `src/` is Joe copying the module text himself.
 */
/*
 * It answers whether it saved. It used to answer nothing at all and report a
 * failure only by turning the header red — which `push()` then walked straight
 * past and painted green a moment later, so a push could follow a save that had
 * not happened and nothing on screen ever said so.
 */
async function save(): Promise<boolean> {
  if (!def) return false
  await refreshDrafts()
  const mine = drafts.find(d => d.speciesId === speciesId)
  const view = drawSignoff()
  const fields = {
    speciesId,
    from: defs.has(speciesId) ? speciesId : (mine?.from ?? ''),
    fromKind: defs.has(speciesId) ? 'built' : 'scratch',
    /*
     * DERIVED, never typed — and re-derived on every save rather than carried
     * forward off the draft, because the roster is the answer and a stale copy
     * of the roster is exactly the drift `species-facts.test.ts` checks for.
     */
    collection: view.collection,
    /* What it WILL be called: his override, or the draw. Storing the resolved
     * name rather than only the override is what lets the push write the audit
     * row without recomputing anything. */
    givenName: view.name,
    fact: view.fact,
    factSource: view.factSource,
    def,
    warnings: opened ? warningsFor(def, opened) : [],
    state: 'draft',
    note: mine?.note ?? '',
    /* Absent rather than '' when he has not ruled: `''` is not a `Locomotion`,
     * and an absent key is what `merge.mjs`'s idle check already treats a stale
     * page's echo of "not decided" as, so this says the same thing either way. */
    moves: moves === '' ? undefined : moves,
  }
  const reply = mine
    ? await api('/api/save', { what: 'edits', patch: fields })
    : await api('/api/save', { what: 'edits', value: { schemaVersion: 1, drafts: [fields] } })
  if (reply['error']) {
    say(`could not save: ${String(reply['error'])}`, true)
    return false
  }
  await refreshDrafts()
  isMine = drafts.some(d => d.speciesId === speciesId)
  saved = true
  drawSubjects()
  drawSaveNote()
  say(`saved ${speciesId}`)
  return true
}

el<HTMLButtonElement>('#save').addEventListener('click', () => {
  void save().catch((error: unknown) => {
    say(error instanceof Error ? error.message : String(error), true)
  })
})

/* -------------------------------------------------- one button, into the game */

/**
 * Joe, 2 August: *"then with one button push it to the game thats where we need
 * to get to."*
 *
 * A species costs NINE places and this writes SIX; `push.mjs` carries the list
 * and the reasoning. The three it does not write are all tests, and the reason
 * is the same for each: a test generated to assert whatever the code currently
 * does is worth less than no test at all. So the reply is drawn in FULL — what
 * landed, what was already there, and what is still his — and the panel says
 * plainly that `npm test` is red until those are written.
 *
 * The draft is saved first, and **a save that fails stops the push.** The push
 * does not consult the draft store, but a species that reaches `src/` while the
 * draft it came from still says something else is a pair of records that
 * disagree about the same animal, and the cheap end of that is here. It used to
 * go ahead regardless, which meant a red "could not save" was overwritten by a
 * green line about the game a second later.
 *
 * ## SILENCE IS A BUG
 *
 * Every path out of this function that writes nothing says so in BOTH places Joe
 * looks — `#push-note` in `note bad`, and the header, red — and the verdict on a
 * reply belongs to `pushOutcome` in `push.ts`, not to this function. The three
 * failure paths used to be indistinguishable from the success one: the same
 * `note warn` class on the note, and a green "is in the game" on any reply
 * without an `error` key, including replies whose own body said every place had
 * been skipped.
 */
async function push(): Promise<void> {
  if (!def) return
  const view = drawSignoff()
  if (!view.ready) {
    /*
     * The worst of the silent paths, and the reason this one says it TWICE. It
     * used to write the note and nothing else — so the header above kept
     * whatever it last said, which after a save is a green "saved ...", and the
     * loudest thing on screen actively contradicted the refusal.
     */
    refuse('not yet — the Name and fact panel above says what is missing.')
    return
  }
  if (!await save()) {
    /* The draft did not land, so nothing is sent. `save()` has already put its
     * own reason in the header; this says what that reason cost. */
    refuse(`nothing was pushed — ${speciesId} could not even be saved, and the message above says why.`)
    return
  }
  const today = new Date().toISOString().slice(0, 10)
  /*
   * `defs` is `loadBuiltDefs()`'s map — the definitions read out of the game's
   * own modules at boot — so this is provenance and not a flag: the animal on
   * screen came from `src/`, therefore pressing the button is an EDIT of it and
   * not the creation of a new species. A blank animal or a clone under a new id
   * is not in that map and pushes as a create, which is exactly the case the
   * "already exists" refusal must keep catching.
   */
  const request = pushRequest(speciesId, def, view, today, defs.has(speciesId))
  const reply = await api('/api/species/push', request) as unknown as PushReply

  const row = (marker: string, path: string, text: string, left = false): HTMLLIElement => {
    const li = document.createElement('li')
    if (left) li.className = 'left'
    const b = document.createElement('b')
    b.textContent = `${marker} ${path}`
    li.append(b, document.createElement('br'), document.createTextNode(text))
    return li
  }
  pushOut.replaceChildren(
    ...(reply.wrote ?? []).map(p => row('written —', p.path, p.what)),
    ...(reply.skipped ?? []).map(p => row('already there —', p.path, p.what)),
    ...(reply.left ?? []).map(p => row('yours —', p.path, p.why, true)),
  )
  /*
   * The verdict is `pushOutcome`'s and this is only its typist. It judges by
   * what the reply says it WROTE — place 1 or the animal did not change — and
   * everything that made a refusal look like a success was decided here, in
   * DOM code nothing could test. See `push.ts` for the rule and why it is that
   * way round.
   */
  const outcome = pushOutcome(reply, speciesId)
  pushNote.textContent = outcome.note
  pushNote.className = outcome.noteClass
  say(outcome.sayText, outcome.sayBad)
}

/** A push that did not happen, said in both places Joe can see. */
function refuse(text: string): void {
  pushNote.textContent = text
  pushNote.className = 'note bad'
  /* The list from the LAST push is cleared: six "written —" rows standing under
   * a refusal is the same lie in a different font. */
  pushOut.replaceChildren()
  say(`nothing was pushed: ${text}`, true)
}

el<HTMLButtonElement>('#push').addEventListener('click', () => {
  /* `creatureSpec`'s own words, unwrapped: it names the axiom and the fix. */
  void push().catch((error: unknown) => {
    refuse(error instanceof Error ? error.message : String(error))
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
 *
 * ## THE FROM-SCRATCH CASE, WHICH IS THE AWKWARD ONE, AND WHY IT IS NOT A CASE
 *
 * A record is keyed by `speciesId`, and the obvious objection is that a brand-new
 * animal has no species id until it is named — so it cannot be keyed, so it would
 * have to go on being keyed by something dealt, so the pile at the bottom of the
 * list comes back under a new name.
 *
 * **That state does not exist in this page, and this button is why.** It demands
 * the species name FIRST and derives the id from it before anything is drawn:
 * "Fen Hare" is `animal-fen-hare` at the moment he presses the button, and
 * `show` sets `speciesId` before there is a definition on screen at all. There
 * is no path to a `def` without one — `save` returns early on `!def`, and `def`
 * is only ever set through `show`. So a scratch animal is keyed exactly as a
 * shipped one is, from the moment it exists, and saving it twice overwrites.
 *
 * The alternative was to let an animal be started unnamed and key it on
 * something temporary. It was rejected: a temporary key is a dealt key wearing a
 * hat, it brings back the counter and the race, and it would put half-drawn
 * nameless things in the list — which is the pile Joe asked to be rid of.
 *
 * The cost, said out loud: **renaming a scratch animal makes a second record.**
 * Type "Fen Hare", save, then type "Fen Hair" and you have two animals, because
 * to this page they ARE two animals — `animal-fen-hare` and `animal-fen-hair`.
 * That is one row each in the list under "Not in the roster", visible and
 * deletable by hand, rather than a silent rename that would have to guess which
 * of the two he meant. It is the same trade the shipped ids already make.
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
  const mine = drafts.find(d => d.speciesId === id)
  isMine = mine !== undefined
  /* Blank, not the typed name: what he typed here is the SPECIES ("Fen Hare"),
   * and the given name is a different word that `naming.ts` already draws. */
  nameOverride = mine?.givenName ?? ''
  fact = mine?.fact ?? ''
  moves = mine?.moves ?? ''
  saved = false
  show(id, blank, blank, `started ${name} — ${id}`)
  drawSubjects()
})

signoffName.addEventListener('input', () => {
  nameOverride = signoffName.value
  saved = false
  drawSignoff()
  drawSaveNote()
})

signoffMoves.addEventListener('change', () => {
  moves = signoffMoves.value as Locomotion | ''
  saved = false
  drawSignoff()
  drawSaveNote()
})

signoffFact.addEventListener('input', () => {
  fact = signoffFact.value
  saved = false
  drawSignoff()
  drawSaveNote()
})

/* Back to what `naming.ts` draws. Clearing the override is the whole gesture —
 * there is no second name stored anywhere for this to have to undo. */
el<HTMLButtonElement>('#signoff-regen').addEventListener('click', () => {
  nameOverride = ''
  signoffName.value = ''
  saved = false
  drawSignoff()
  drawSaveNote()
})

subjectPick.addEventListener('change', () => {
  if (subjectPick.value !== '') openAnimal(subjectPick.value)
})

subjectFilter.addEventListener('change', () => {
  filter = subjectFilter.value as Status | 'all'
  drawSubjects()
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
  /*
   * Now that his own work has arrived, apply the rule the list applies: his
   * version of an animal is the one that opens. Guarded on `saved`, so a gesture
   * made in the second the server took to answer is never thrown away — that is
   * the async-race landmine in HANDOFF §6, and an editor is the worst possible
   * place to lose one.
   */
  if (saved && !isMine && speciesId !== '') openAnimal(speciesId)
  drawSubjects()
}).catch((error: unknown) => {
  say(error instanceof Error ? error.message : String(error), true)
})
