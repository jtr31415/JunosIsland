/**
 * What an animal will be CALLED and what it will SAY — settled in the editor,
 * beside the model it describes.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Joe, 2 August 2026: *"in the editor i also want to sign off on the name and
 * the fact line and then with one button push it to the game thats where we
 * need to get to."*
 *
 * ## This is the DRAFTING gesture. The gate is still the bench
 *
 * There is already exactly one approval per creature and it lives in
 * `approver.ts` — `signoff`, with `verdict` and `factVerdict` beside it, one
 * click writing all three (JT-031, and the "ONE ACTION, THREE VERDICTS" note in
 * that file). A second tick in this page would be a rival gate: a name settled
 * in an editor is not the same claim as an animal looked at whole, and letting
 * the first count as the second is precisely the confusion `merge.mjs` refused
 * to allow between `verdict` and `signoff`.
 *
 * So nothing here writes `signoff`. What this file does is fill the draft's four
 * empty fields — `collection`, `givenName`, `fact`, `factSource` — so that the
 * animal reaches that bench COMPLETE rather than reaching it nameless and
 * factless and unapprovable. The bench's own count already names the failure it
 * prevents: `unsignable`, "benched but with no row in `joe/names-audit.json`".
 *
 * ## Almost none of this is typed
 *
 * The roster already knows what a species is called (`SPECIES_NAMES`), which
 * collection it joins (`SPECIES_COLLECTION`) and which band its given name is
 * drawn from; `naming.ts` already draws the given name itself, deterministically
 * and collision-free across all 320. Asking Joe to invent any of that would be
 * asking him to retype data that exists, and to get it subtly wrong. He is asked
 * for ONE thing this file cannot derive: the fact.
 *
 * ## Why the fact has rules
 *
 * `joe/species-facts.json` is gated by `tests/island/species-facts.test.ts`, and
 * a fact that fails those gates turns the whole suite red hours after he typed
 * it. The four checks below are that test read backwards, at the keyboard, while
 * he can still fix it in a second. They are not this file's opinion — if that
 * test changes, `factProblems` changes with it, and the test in
 * `tests/tools/species-signoff.test.ts` asserts the two agree by construction.
 *
 * The one that surprises people: `check` may only ever be `verified` or
 * `flagged`. There is no value meaning "Joe wrote it". So a sentence of his own
 * is `flagged` — not as a slur on it, but because unchecked is exactly what it
 * is, and the bench already shows flagged rows differently so he can see which
 * of his own words nobody has been at yet.
 *
 * ## There is deliberately no box for a source URL
 *
 * `verified` costs more than a link: the gate also demands a `sourceNote` saying
 * what that source ACTUALLY SAYS, because a bare URL is not evidence to a man
 * reading twelve of these in a sitting (`approver.ts` says so about the same
 * field). A box that took a URL and synthesised the note would be manufacturing
 * the one part of the record that carries the meaning. So the editor collects
 * the sentence and marks it his; verifying it is the fact agent's job or a later
 * pass on the bench, and it stays visibly undone until somebody does it.
 */
import { SPECIES_NAMES, SPECIES_COLLECTION, collection } from '../../../../src/island/species/roster'
import { NAME_PINS, _allocate, givenName, nameBandOf } from '../../../../src/island/species/naming'

/** What the drafting side may record about how a fact was checked. */
export type FactCheck = 'verified' | 'flagged'

/**
 * One thing wrong, said in Joe's words rather than in a validator's.
 *
 * `blocks` is the whole point of the type: a name one letter off its band is
 * worth saying and is not worth stopping a push over, and folding the two into
 * one list would either nag him into ignoring the list or refuse a push for a
 * reason that does not matter.
 */
export interface Problem {
  field: 'species' | 'collection' | 'name' | 'fact'
  say: string
  /** True when a push must refuse until this is fixed. */
  blocks: boolean
}

/**
 * The fields of a draft this panel owns, as the page holds them.
 *
 * `collection` and `factSource` are not here because neither is typed:
 * `collection` is the roster's answer and `factSource` is always `joe`, which is
 * what the field was added to record. The push writes both from the view.
 */
export interface SignoffFields {
  givenName: string
  fact: string
}

/** Everything the panel draws, derived once so the DOM half has no arithmetic. */
export interface SignoffView {
  speciesId: string
  /** In the ratified roster — which is what makes a name and a collection real. */
  inRoster: boolean
  /** The species' printed name, the roster's spelling. */
  species: string
  collection: string
  collectionName: string
  band: string
  /** What `naming.ts` would call it, unprompted. */
  generated: string
  /** What it will actually be called: his override, or the generated draw. */
  name: string
  overridden: boolean
  /** Another species already answers to this name. Worth saying; never blocks. */
  clashesWith: string
  fact: string
  /** Who wrote the fact. Always `joe` out of this page — that is the point of it. */
  factSource: string
  /** What the fact row would record. `flagged` until something checks it. */
  factCheck: FactCheck
  problems: readonly Problem[]
  /** No blocking problem left. The push may be offered. */
  ready: boolean
}

/**
 * The printed name for an id the roster has never heard of.
 *
 * Not a fallback anybody should rely on — an id off the roster cannot be pushed
 * at all — but the panel still has to say something in the box while he is
 * halfway through typing a name, and a blank there reads as a bug.
 *
 * Exported so `status.ts` can spell a stray the same way in the list as this
 * panel spells it two inches to the right. One animal, one screen, one spelling.
 */
export const titleFromId = (speciesId: string): string => {
  const bare = speciesId.replace(/^animal-/, '').replace(/-/g, ' ')
  return bare === '' ? '' : bare[0]!.toUpperCase() + bare.slice(1)
}

/* --------------------------------------------------------------- the fact --- */

/**
 * `tests/island/species-facts.test.ts` "written for a six-year-old", verbatim.
 *
 * Kept as one exported constant rather than inlined so the test that proves
 * this file and that file agree has something to point at.
 */
export const FACT_MIN_WORDS = 6
export const FACT_MAX_WORDS = 20
export const FACT_MAX_SENTENCES = 2
/** Not exhaustive, and not meant to be — the same regex the gate uses. */
export const AMERICAN = /\b(color|colors|gray|behavior|burrowing in the fall|fall)\b/i

const words = (fact: string): number => fact.trim().split(/\s+/).filter(w => w !== '').length
const sentences = (fact: string): number =>
  fact.trim().split(/[.!?]+/).filter(s => s.trim().length > 0).length

/**
 * Everything the fact gate would say about this sentence, before it is written.
 *
 * Every one of these BLOCKS. A fact that fails here fails `npm test` an hour
 * later against a file he can no longer see, so there is no soft case: the
 * cheapest possible moment to fix a nineteen-word sentence is while it is still
 * in the box.
 */
export function factProblems(fact: string): Problem[] {
  const out: Problem[] = []
  const text = fact.trim()
  if (text === '') {
    out.push({ field: 'fact', say: 'no fact yet — one or two short sentences a six-year-old can read', blocks: true })
    return out
  }
  const n = words(text)
  if (n < FACT_MIN_WORDS) out.push({ field: 'fact', say: `${n} words — a fact needs at least ${FACT_MIN_WORDS}`, blocks: true })
  if (n > FACT_MAX_WORDS) out.push({ field: 'fact', say: `${n} words — ${FACT_MAX_WORDS} is as long as it may be`, blocks: true })
  if (sentences(text) > FACT_MAX_SENTENCES) {
    out.push({ field: 'fact', say: `${sentences(text)} sentences — one or two, no more`, blocks: true })
  }
  if (!text.endsWith('.')) out.push({ field: 'fact', say: 'it needs to end with a full stop', blocks: true })
  const american = AMERICAN.exec(text)
  if (american) out.push({ field: 'fact', say: `"${american[0]}" is American — UK English, please`, blocks: true })
  return out
}

/** The value `factSource` takes for a sentence Joe wrote himself. */
export const JOE = 'joe'

/* ---------------------------------------------------------------- the view --- */

/**
 * Which OTHER species already answers to this name.
 *
 * Only ever a warning. `naming.ts` allocates collision-free across the whole
 * roster, so a clash can only arise from an override Joe typed — and he may
 * have meant it, because two names being alike is his call to make out loud and
 * not a validator's to refuse.
 *
 * Memoised here rather than relying on `naming.ts`'s: that one lives inside
 * `_resolve` and is only reached through `givenName`, so calling `_allocate`
 * directly redraws all 320 every time. Cheap, but this runs on every keystroke
 * in the name box and there is no reason to pay it twice.
 */
let allocation: Readonly<Record<string, string>> | undefined

function clash(speciesId: string, name: string): string {
  if (name === '') return ''
  const all = (allocation ??= _allocate(NAME_PINS))
  for (const [id, drawn] of Object.entries(all)) {
    if (id !== speciesId && drawn.toLowerCase() === name.toLowerCase()) return id
  }
  return ''
}

/**
 * The whole panel, derived from an id and the four fields the draft holds.
 *
 * Pure, three.js-free and roster-driven, which is what lets the arithmetic
 * behind "ready to push" be proved in node against the real roster rather than
 * only observed by looking at a page.
 */
export function signoffView(speciesId: string, fields: SignoffFields): SignoffView {
  const inRoster = SPECIES_NAMES[speciesId] !== undefined
  const collectionId = SPECIES_COLLECTION[speciesId] ?? ''
  const known = collection(collectionId)
  const generated = speciesId === '' ? '' : givenName(speciesId)
  const override = fields.givenName.trim()
  const name = override === '' ? generated : override
  const problems: Problem[] = []

  if (speciesId === '') {
    problems.push({ field: 'species', say: 'no animal open', blocks: true })
  } else if (!inRoster) {
    problems.push({
      field: 'species',
      say: `${speciesId} is not in the ratified roster, so it has no collection and no name of its own — `
        + 'it can be drawn and saved as a draft, but it cannot be pushed into the game',
      blocks: true,
    })
  }
  if (inRoster && known === undefined) {
    problems.push({ field: 'collection', say: `the roster files ${speciesId} under "${collectionId}", which is not a collection`, blocks: true })
  }
  if (name === '') problems.push({ field: 'name', say: 'no name yet', blocks: true })

  const clashesWith = clash(speciesId, name)
  if (clashesWith !== '') {
    problems.push({
      field: 'name',
      say: `${clashesWith} is already called ${name} — two animals with one name is yours to allow, not mine to refuse`,
      blocks: false,
    })
  }

  problems.push(...factProblems(fields.fact))

  return {
    speciesId,
    inRoster,
    species: SPECIES_NAMES[speciesId] ?? titleFromId(speciesId),
    collection: collectionId,
    collectionName: known?.name ?? '',
    band: nameBandOf(speciesId),
    generated,
    name,
    overridden: override !== '' && override !== generated,
    clashesWith,
    fact: fields.fact.trim(),
    /* Empty until there is a sentence: claiming authorship of nothing is a
     * small lie that a later reader has no way to spot. */
    factSource: fields.fact.trim() === '' ? '' : JOE,
    factCheck: 'flagged',
    problems,
    ready: !problems.some(p => p.blocks),
  }
}

/**
 * The two rows the push would append, built off the view so the page and the
 * server cannot disagree about what a row IS.
 *
 * Shaped to the two files exactly as they stand on disk — `joe/names-audit.json`
 * keys on `natural/<speciesId>` and `joe/species-facts.json` keys on the bare
 * id, and both spell the species and the collection the roster's way, which is
 * asserted by `tests/island/species-facts.test.ts`.
 *
 * The judgement fields are left EMPTY on purpose. `verdict`, `note`, `signoff`,
 * `factVerdict` and `factNote` are Joe's, and a push that pre-ticked any of them
 * would be this page signing off on his behalf.
 *
 * `replacement` IS written, and it is the one that is not a judgement: it is
 * defined as "the name he wants instead of the generated one" (`merge.mjs`), so
 * a name he just typed into the box belongs in it. **`name` must stay the
 * generated draw** — `tests/island/naming.test.ts` asserts row by row that every
 * `name` equals `givenName(speciesId)`, and that is not a formality: the audit
 * file's rows are REGENERATED whenever the roster moves, and only `verdict`,
 * `replacement` and `note` survive that. An override parked in `name` would fail
 * the gate today and be silently erased tomorrow.
 */
export interface AuditRowOut {
  id: string
  setId: string
  speciesId: string
  species: string
  collection: string
  band: string
  name: string
  verdict: string
  replacement: string
  note: string
}

export interface FactRowOut {
  speciesId: string
  species: string
  collection: string
  fact: string
  check: FactCheck
  source: string
  sourceNote: string
  proposedRewrite: string
  verdict: string
  replacement: string
  note: string
}

/**
 * What a `flagged` row says when the reason is simply that nobody checked it.
 *
 * `tests/island/species-facts.test.ts` refuses a flagged row with no note —
 * "flagged for reasons nobody wrote down" — and this is the reason, written
 * down. It says who wrote the sentence, because a year from now that is the
 * thing a reader needs to know.
 */
export const UNSOURCED_NOTE =
  'Joe wrote this one himself in the species editor, so nothing has independently checked it. '
  + 'Not a refutation — an unchecked sentence, shown as one.'

export function auditRowFor(view: SignoffView): AuditRowOut {
  return {
    id: `natural/${view.speciesId}`,
    setId: 'natural',
    speciesId: view.speciesId,
    species: view.species,
    collection: view.collection,
    band: view.band,
    name: view.generated,
    verdict: '',
    replacement: view.overridden ? view.name : '',
    note: '',
  }
}

export function factRowFor(view: SignoffView): FactRowOut {
  return {
    speciesId: view.speciesId,
    species: view.species,
    collection: view.collection,
    fact: view.fact,
    check: view.factCheck,
    source: '',
    sourceNote: UNSOURCED_NOTE,
    proposedRewrite: '',
    verdict: '',
    replacement: '',
    note: '',
  }
}
