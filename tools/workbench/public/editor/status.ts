/**
 * WHAT STILL NEEDS DOING — the Animal list, derived rather than recorded.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Joe, 2 August 2026: *"when i save an animal in the editor, it needs to just
 * overwrite what there is already and i need to see and filter by status, so i
 * can tell from the list what still needs doing. no saving of drafts in the
 * bottom of the list"*, and a minute later: *"also group them by collection, so
 * i can prioritize."*
 *
 * The list is therefore THE ANIMALS — one row per animal, whether or not he has
 * ever touched it — under a header per collection, each row carrying the answer
 * to his question. What it is not, any more, is a list of animals with a growing
 * pile of saves stapled underneath it.
 *
 * ## Nothing here is stored, and that is the point
 *
 * A `status` field on a draft would be a second opinion about facts that already
 * have an owner: whether a fact passes the gate belongs to `signoff.ts`, and
 * whether Joe has signed a creature off belongs to `joe/names-audit.json`. A
 * copy of either would be right on the day it was written and wrong the first
 * time anything else moved, with nothing to say which was the truth. `flow.ts`
 * has already paid for that class once — HANDOFF §6 on `tileOffer` restating the
 * conditions of `tileTypeFor` behind a comment promising the two matched, "a
 * promise a comment cannot keep". So every status below is computed from the
 * authorities, on every draw.
 *
 * ## SIGNED OFF IS ONE CALL, AND THIS IS IT
 *
 * `signedOff()` is the only place in the workbench that decides whether a
 * creature has Joe's tick, because it is about to decide more than the colour of
 * a row. His ruling of 2 August is that **only animals he has signed off reach
 * the game, local or live** — retroactively, so all thirty that exist today are
 * unsigned. The gate that enforces that is not built here, and when it is built
 * it must ask this question rather than re-derive it.
 *
 * The truth it reads is `joe/names-audit.json`, one row per creature, field
 * `signoff`, value `'ok'`. That field is `approver.ts`'s — one creature, one
 * judgement, over the model, the name and the fact together (JT-031), and
 * `merge.mjs` explains at length why it is deliberately NOT the same field as
 * `verdict`, which is the name-only judgement made by reading a word aloud.
 *
 * **"Signed off" and "approved" are the same act here, and different from
 * "ready".** Say it plainly, because the next reader will assume otherwise: the
 * `signoff` field IS the approval, `approver.ts` is the only thing that writes
 * it, and this editor deliberately has no tick of its own (see `signoff.ts`).
 * What this editor can reach is `ready` — the name and the fact are settled and
 * nothing blocks a push — which is the state immediately BEFORE approval and
 * must never be mistaken for it.
 */

import { COLLECTIONS, SPECIES_COLLECTION, SPECIES_NAMES, collection } from '../../../../src/island/species/roster'
import { signoffView, titleFromId } from './signoff'

/* ------------------------------------------------------------- signed off --- */

/** The value `joe/names-audit.json`'s `signoff` carries when Joe has ticked it. */
export const SIGNED_OFF = 'ok'

/**
 * The audit row's id for a species.
 *
 * `natural` is the only name set that exists today and `auditRowFor` in
 * `signoff.ts` writes exactly this shape. Kept as a function rather than
 * inlined so the two files cannot drift apart over the spelling.
 */
export const auditIdFor = (speciesId: string): string => `natural/${speciesId}`

/**
 * One row of `joe/names-audit.json`, as much of it as this file needs.
 *
 * Structural on purpose: the row is REGENERATED from the roster whenever the
 * roster moves and only `verdict`, `replacement`, `note` and the judgement
 * fields survive that, so naming the whole row here would be inventing a
 * contract that the generator does not keep.
 */
export interface AuditRow {
  readonly speciesId?: string
  readonly signoff?: string
}

/**
 * Has Joe signed this creature off? THE single call — see the header.
 *
 * Matched on `speciesId` rather than on the row id. A row id is
 * `natural/<speciesId>` today, but the set is a NAME set — one creature can in
 * principle carry a name per colour set — while the tick is on the creature.
 * Asking "is there a row for this animal that he has ticked" survives a second
 * set arriving; asking for `natural/` by name would quietly answer no.
 */
export function signedOff(audit: readonly AuditRow[], speciesId: string): boolean {
  if (speciesId === '') return false
  return audit.some(row => row.speciesId === speciesId && row.signoff === SIGNED_OFF)
}

/* ----------------------------------------------------------------- status --- */

/**
 * How far along one animal is, in the order the work actually happens.
 *
 * Four, and no more. Each one answers "what do I do next" with a different
 * answer, which is the test a fifth would have to pass:
 *
 *   untouched  nothing has ever been saved for it. Open it and draw.
 *   started    saved, but something still blocks a push — in practice the fact,
 *              because `save` records the resolved name whether or not he typed
 *              one. Open it and finish the Name and fact panel.
 *   ready      name and fact settled, nothing blocking. It can go to the bench.
 *   signed     Joe has ticked it on the Animals bench. This is the only one that
 *              is DONE, and after his ruling of 2 August it is the only one that
 *              may reach the game.
 *
 * A species the roster has never heard of can never be `ready` — `signoffView`
 * blocks on it — and it is deliberately NOT given a status of its own. A status
 * says how far along an animal is; being off the roster says which shelf it is
 * on, and that is what the "Not in the roster" group is for. Folded together,
 * filtering to `started` would hide an animal that genuinely is started.
 */
export type Status = 'untouched' | 'started' | 'ready' | 'signed'

/** In work order, which is the order the filter offers them. */
export const STATUSES: readonly Status[] = ['untouched', 'started', 'ready', 'signed']

/** His words for each, phrased as what is left rather than as a state name. */
export const STATUS_LABEL: Readonly<Record<Status, string>> = {
  untouched: 'not started',
  started: 'in progress',
  ready: 'ready to sign off',
  signed: 'signed off',
}

/**
 * The fields of a saved draft this file reads.
 *
 * Structural, and only three: the record carries a definition and a pile of
 * derived strings, and depending on any of them here would make the status a
 * second opinion about the draft rather than a reading of it.
 */
export interface DraftRow {
  readonly speciesId: string
  readonly givenName: string
  readonly fact: string
}

/**
 * One animal's status, from the two authorities and nothing else.
 *
 * `signed` outranks everything, including having no draft at all: a creature can
 * be ticked on the bench without ever being opened in this editor, and a list
 * that then called it "not started" would be telling him to redo finished work.
 */
export function statusOf(
  speciesId: string, draft: DraftRow | undefined, audit: readonly AuditRow[],
): Status {
  if (signedOff(audit, speciesId)) return 'signed'
  if (!draft) return 'untouched'
  return signoffView(speciesId, { givenName: draft.givenName, fact: draft.fact }).ready
    ? 'ready'
    : 'started'
}

/* ------------------------------------------------------------------ groups --- */

/** One animal, as the list shows it. */
export interface SubjectRow {
  readonly speciesId: string
  /** The roster's printed name where there is one — what he reads, not an id. */
  readonly name: string
  readonly status: Status
  /** True when he has saved edits for it, which is what reopening it will show. */
  readonly mine: boolean
}

/** One `<optgroup>`: a collection, its animals, and the count that ranks it. */
export interface SubjectGroup {
  readonly id: string
  /** The header text, counts included. */
  readonly label: string
  readonly rows: readonly SubjectRow[]
  /** Rows in this group that are not `signed`. The number he is prioritising on. */
  readonly todo: number
}

/** The id of the group animals with no collection fall into. */
export const OFF_ROSTER = ''

export interface SubjectInput {
  /** Species with a built definition — `loadBuiltDefs().keys()`, in barrel order. */
  readonly built: readonly string[]
  readonly drafts: readonly DraftRow[]
  readonly audit: readonly AuditRow[]
  /** One status, or `'all'`. */
  readonly filter: Status | 'all'
}

/**
 * The header a man scanning for somewhere to spend an evening reads.
 *
 * The count is in the header for the reason `groupShapes` puts one there — he is
 * scanning, and knowing the size of a drawer before opening it is the difference
 * between reading the list and hunting through it. The second number is the one
 * he actually asked for: *"so i can tell from the list what still needs doing"*
 * is a question about a collection before it is a question about an animal.
 *
 * Both numbers are over the rows SHOWN. Under a filter a header claiming the
 * whole collection's totals would be describing a list that is not on screen.
 */
const headerFor = (name: string, shown: number, todo: number): string =>
  `${name} (${shown}) — ${todo === 0 ? 'all signed off' : `${todo} to do`}`

/**
 * The whole list: every animal, once, grouped, ordered and filtered.
 *
 * ## Which animals
 *
 * The ones that EXIST — a built definition, or a draft of Joe's. Not the
 * roster's 320, which are a plan rather than a set of animals, and a list of 320
 * mostly-unbuilt rows would answer "what needs doing" with "everything" and be
 * useless for the thing he asked it for.
 *
 * ## Which order
 *
 * Collections by `ship` — the order Juno meets them — because he is prioritising
 * and that is the only non-arbitrary order this repo has. `COLLECTIONS` is
 * declared in the brief's table order and says so; `roster.ts` sorts by `ship`
 * itself for the same reason. Note `ship` is marked PROVISIONAL in `types.ts`
 * and nothing unlocks off it yet — it is being used here as an ORDER, which is
 * all it claims to be, and if he reorders the queue this list follows for free.
 *
 * Animals within a collection keep the roster's own member order, so a species
 * does not move about the list as its status changes.
 *
 * ## Empty groups never appear
 *
 * `groupShapes` in `library.ts` already settled this: a header over nothing is a
 * scroll stop that teaches Joe the library has a drawer he cannot open. It is
 * live rather than hypothetical here — a collection can have no built species at
 * all — and it applies AFTER filtering too, which is what makes grouping and
 * filtering compose instead of leaving a page of empty headers.
 */
export function subjectGroups(input: SubjectInput): readonly SubjectGroup[] {
  const { built, drafts, audit, filter } = input
  const draftBy = new Map(drafts.map(d => [d.speciesId, d]))

  /* Every animal that exists, once: what is built, then what he has drafted on
   * top of something that is not. A `Set` keeps the barrel's order, which is
   * the order the definitions were declared in. */
  const animals = new Set<string>(built)
  for (const draft of drafts) animals.add(draft.speciesId)

  const rows = new Map<string, SubjectRow[]>()
  for (const speciesId of animals) {
    const status = statusOf(speciesId, draftBy.get(speciesId), audit)
    if (filter !== 'all' && status !== filter) continue
    const groupId = SPECIES_COLLECTION[speciesId] ?? OFF_ROSTER
    const row: SubjectRow = {
      speciesId,
      name: SPECIES_NAMES[speciesId] ?? titleFromId(speciesId),
      status,
      mine: draftBy.has(speciesId),
    }
    const list = rows.get(groupId)
    if (list) list.push(row)
    else rows.set(groupId, [row])
  }

  /* One group, built once, so the header and the field can never say a different
   * number about the same rows. */
  const group = (id: string, name: string, found: readonly SubjectRow[]): SubjectGroup => {
    const todo = found.filter(r => r.status !== 'signed').length
    return { id, label: headerFor(name, found.length, todo), rows: found, todo }
  }

  const ordered = [...COLLECTIONS].sort((a, b) => a.ship - b.ship)
  const groups: SubjectGroup[] = []
  for (const known of ordered) {
    const found = rows.get(known.id)
    if (!found || found.length === 0) continue
    const order = new Map(known.members.map((id, i) => [id, i]))
    /* An animal filed under a collection it is not a member of cannot happen —
     * `SPECIES_COLLECTION` is derived from `members` — but if it ever did, it
     * belongs at the END, where an oddity is visible, not silently at the top. */
    const at = (row: SubjectRow): number => order.get(row.speciesId) ?? known.members.length
    found.sort((a, b) => at(a) - at(b))
    groups.push(group(known.id, known.name, found))
  }

  /*
   * Last, and named for what it IS rather than for whose it is. These are
   * animals Joe started from scratch under a name the ratified roster does not
   * carry; `signoffView` refuses to push one and says why, so the header's job
   * is to stop him hunting for it among the collections. Calling it "my drafts"
   * would rebuild the pile at the bottom of the list under a new name — the
   * difference is that this holds one row per ANIMAL and never grows by saving.
   */
  const strays = rows.get(OFF_ROSTER)
  if (strays && strays.length > 0) {
    strays.sort((a, b) => a.name.localeCompare(b.name))
    groups.push(group(OFF_ROSTER, collectionName(OFF_ROSTER), strays))
  }

  return groups
}

/**
 * What one row says, in the list.
 *
 * The status is IN the row because he asked to tell from the list what needs
 * doing, and a list that needs a click per animal to answer that is the list he
 * already had. An `<option>` cannot carry a badge — nothing in it is styleable
 * across browsers — so the text carries it.
 */
export const rowLabel = (row: SubjectRow): string => `${row.name} · ${STATUS_LABEL[row.status]}`

/** Every collection that has at least one animal, for anything that needs the set. */
export const collectionName = (id: string): string =>
  id === OFF_ROSTER ? 'Not in the roster' : collection(id)?.name ?? id
