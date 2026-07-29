/**
 * The animals ASSEMBLED FROM THE PACK'S OWN PARTS — the rows, the pairing, and
 * the labelling that keeps him certain which half of the pair is ours.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Joe, 29 July 2026, on the seventy-two the kits built:
 *
 * > everything built already in terms of animals is scrap. names and facts ok,
 * > the 3D part is junk i'm afraid.
 *
 * The method that replaces them is `docs/building-animals-from-parts.md`: lift
 * real geometry out of the 24 authored Kenney `.glb` files, bank it, and
 * assemble new species out of the bank, so that every vertex on screen came out
 * of a file Kenney shipped. This module is the data half of the ONE surface left
 * standing: the approver, where an assembled animal turns beside a real pack
 * animal and Joe approves its name, its fact and its model in a single click.
 * The scrapped bench that used to sit beside it is gone — not relabelled, gone —
 * because a scrapped model he can still put on a turntable is a scrapped model he
 * can approve by accident. `approver.ts` is the other half, and owns the join to
 * `joe/names-audit.json` and `joe/species-facts.json`.
 *
 * ## The standing question, and why comparison is not an option here
 *
 * The whole of `docs/building-animals-from-parts.md` §6 turns on one sentence —
 * whether a new animal *sits next to the fox without looking like a guest*. That
 * is not a question about an animal, it is a question about a PAIR, so this
 * gallery has no single-model mode to fall out of. Every selection puts a real
 * Kenney GLB on the left and our assembly on the right, at matched height, and
 * `DEFAULT_REFERENCE` is `animal-fox` because the fox is the animal the sentence
 * names. He can stand it beside any of the other 23 instead.
 *
 * ## The labelling is a requirement, not a decoration
 *
 * From the same document, and it is the reason half the strings in this file are
 * constants rather than inline text:
 *
 * > Animals built under this method are labelled **distinctly and unmistakably**
 * > from the pack's own, in the list and on the model. He has already been burned
 * > by a stale page once and by a gallery listing props once. An unlabelled
 * > side-by-side is worse than no side-by-side.
 *
 * With the kit builds gone, the confusion that remains is the one INSIDE the
 * pair, and it is the worse of the two: two animals stand side by side and a man
 * who cannot tell at a glance which is Kenney's is judging our work against
 * itself. So the labels are exported constants used by the rail, by the card and
 * by the two tags over the canvas, and none of those three may word it its own
 * way. The convention is the anatomy view's, which is already the house rule:
 * **Kenney's own names plain, ours marked as ours and visibly different.** The
 * left-hand model is `animal-fox`, printed exactly as the file names it; the
 * right-hand model wears `OURS_PREFIX` and a different colour.
 *
 * ## Nothing here knows about three.js, and nothing imports the assembler
 *
 * Same discipline as `anatomy.ts` and `primitives.ts`: this is arithmetic and
 * strings over plain objects, so every one of them is testable in node without a
 * WebGL context, and `viewer.ts` — which is untested by design — is left holding
 * only geometry and DOM.
 *
 * It deliberately does NOT import `src/island/species/parts`. `assembledSpecies()`
 * is passed IN as data, exactly as `approverBench` takes the audit rows in, so
 * the shape of the join is provable against fixtures rather than only against
 * whatever the bank happens to hold today.
 */
import { COLLECTIONS } from '../../../src/island/species/roster'
import { ANATOMY_SPECIES, petIdOf } from './anatomy'

/* ------------------------------------------------------------- the labels */

/**
 * What an ASSEMBLED animal is called, everywhere it appears.
 *
 * Long, and on purpose. This string goes on the model, in the card and in the
 * list heading; the one place it is too long for is the rail row, which uses
 * `NEW_METHOD_SHORT`. Both are exported so the viewer cannot invent a third
 * wording that means the same thing but does not match.
 */
export const NEW_METHOD_MARK = "ASSEMBLED — lifted from Kenney's own geometry"
/** The rail chip. Short enough for a 16rem column. */
export const NEW_METHOD_SHORT = 'ASSEMBLED'

/** Before our model's name, in the list and on the canvas. The anatomy convention. */
export const OURS_PREFIX = 'OURS — '
/** Before the reference animal's name. Nothing: Kenney's own names go plain. */
export const KENNEY_NOTE = "Kenney's own, straight off the .glb"

/**
 * The tab caption, so the HTML and the tests quote one string rather than two.
 *
 * It names the ACT and not the method, because the method is no longer a choice
 * he is being asked about — there is one kind of animal left and one thing to do
 * with it. `NEW_METHOD_MARK` still says how it was made, on the card and over the
 * model, where a man looking at geometry is the man who needs to know.
 */
export const APPROVER_TAB = 'Animals — approve'

/**
 * What the assembled bench says when it is empty, which is its NORMAL state
 * early on.
 *
 * The pilot is one species at a time — `docs/building-animals-from-parts.md`,
 * "One species at a time" — so an empty list means the first one has not landed,
 * not that the page is broken. Saying so is the difference between a gallery he
 * trusts and a gallery he reloads twice and then reports.
 */
export const NOTHING_YET =
  'Nothing has been assembled yet. The Garden pilot lands one species at a time and the first is '
  + 'the hedgehog; this list shows exactly what src/island/species/parts has built and nothing else, '
  + 'so an empty list here means the first build has not arrived, not that the page is stale.'

/* --------------------------------------------------------------- the flag */

/**
 * The heading over a build's flag, and the reason it is worded as it is.
 *
 * The escape clause is Joe's — *"if something cannot be built sensibly under
 * those rules, build the best attempt and flag it, it may need bespoke
 * instructions"* — so a flag is the method WORKING, and dressing it in the same
 * red-bordered `.alarm` the stale-audit warning uses would teach him to read it
 * as a fault and click past it. It is a note, deliberately made, and it says so.
 */
export const FLAG_HEADING = 'Flagged by the build — a deliberate note, not an error'
export const FLAG_PREAMBLE =
  'This animal strained one of the ten build rules. Under the escape clause the best attempt is '
  + 'built and flagged rather than blocked, so what you are looking at is an approximation somebody '
  + 'chose to show you. What it strained, and why:'
/** The glyph that carries a flag into the rail and onto the model. */
export const FLAG_GLYPH = '⚑'

/* -------------------------------------------------------------- the rows */

/**
 * One species as `assembledSpecies()` hands it over.
 *
 * Restated here rather than imported so this module — and its test — do not
 * depend on `src/island/species/parts` existing. The viewer is where the two
 * meet, and the viewer is where a mismatch would fail to compile.
 */
export interface AssembledEntry {
  id: string
  name: string
  collection: string
  /** Set when the build strained one of the ten rules; carries the explanation. */
  flag?: string
}

/** One row of the assembled bench, with everything the surface prints on it. */
export interface AssembledRow {
  id: string
  name: string
  /** The collection as the build declared it. */
  collection: string
  /** The album page's title for it, or the raw string when the roster has none. */
  collectionName: string
  /** The flag text, or ''. Never undefined — a `?:` here becomes a silent skip. */
  flag: string
  flagged: boolean
  /**
   * True when `collection` names nothing in `COLLECTIONS`.
   *
   * Shown rather than swallowed, for the reason `approver.ts` benches a creature
   * the audit file has never heard of: a build filed under a collection that does not
   * exist is a real state and a real mistake, and hiding it makes the counts lie.
   */
  unknownCollection: boolean
}

const collectionNames = (): Map<string, string> => {
  const out = new Map<string, string>()
  for (const c of COLLECTIONS) out.set(c.id, c.name)
  return out
}

/**
 * The bench, joined to the roster's collection titles.
 *
 * Order is the assembler's own order and is never re-sorted, for the reason
 * `approver.ts` gives about the bench: he works down a list, and a row that
 * moves under the cursor takes his place with it.
 */
export function assembledRows(entries: readonly AssembledEntry[]): AssembledRow[] {
  const titles = collectionNames()
  return entries.map(e => {
    const flag = e.flag ?? ''
    const title = titles.get(e.collection)
    return {
      id: e.id,
      name: e.name,
      collection: e.collection,
      collectionName: title ?? e.collection,
      flag,
      flagged: flag.trim().length > 0,
      unknownCollection: title === undefined,
    }
  })
}

/**
 * Filtered by the search box and by NOTHING ELSE — the rule every bench here has
 * kept, and the reason is that an approved animal must not vanish from under the
 * cursor the moment it is ticked.
 */
export function filterRows(rows: readonly AssembledRow[], query: string): AssembledRow[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...rows]
  return rows.filter(r =>
    `${r.id} ${r.name} ${r.collection} ${r.collectionName} ${r.flag}`.toLowerCase().includes(q))
}

/** A collection's worth of rows, in first-seen order, with its flag count. */
export interface AssembledGroup {
  collection: string
  collectionName: string
  items: AssembledRow[]
  flagged: number
}

/** Group by collection, preserving the order the assembler emitted them in. */
export function groupRows(rows: readonly AssembledRow[]): AssembledGroup[] {
  const out: AssembledGroup[] = []
  for (const row of rows) {
    let bucket = out.find(g => g.collection === row.collection)
    if (!bucket) out.push(bucket = { collection: row.collection, collectionName: row.collectionName, items: [], flagged: 0 })
    bucket.items.push(row)
    if (row.flagged) bucket.flagged++
  }
  return out
}

/**
 * A group's heading, which carries the method's name.
 *
 * `Garden · ASSEMBLED · 1` rather than `Garden · 1`. The word is repeated on
 * every heading and on every row rather than said once at the top, because the
 * top of a list is the part he scrolled past ten minutes ago — and the rail is
 * where he decides which animal to look at next.
 */
export const groupHeading = (g: AssembledGroup): string =>
  `${g.collectionName} · ${NEW_METHOD_SHORT} · ${g.items.length}`
  + (g.flagged ? ` · ${g.flagged} ${FLAG_GLYPH} flagged` : '')

/** The count line in the header, over the WHOLE bench and never the filtered view. */
export const countLabel = (all: readonly AssembledRow[], shown: readonly AssembledRow[]): string => {
  const flagged = all.filter(r => r.flagged).length
  return `${shown.length} of ${all.length} assembled`
    + (flagged ? ` · ${flagged} ${FLAG_GLYPH} flagged` : '')
}

/** The rail row's tooltip: the id, the method, and the flag if there is one. */
export const rowTitle = (row: AssembledRow): string =>
  `${row.id} · ${NEW_METHOD_MARK}`
  + (row.flagged ? `\n${FLAG_GLYPH} ${row.flag}` : '')
  + (row.unknownCollection ? `\nfiled under '${row.collection}', which is in no collection the roster knows` : '')

/* ---------------------------------------------------- the reference animal */

/**
 * The 24 authored pack animals, as the pet LOADER names them.
 *
 * Derived from `ANATOMY_SPECIES` through `petIdOf` rather than typed out again:
 * the anatomy gallery already owns the list of what is on disk, and two hand-kept
 * copies of a roster is the fault `registry.ts` opens by describing. The two
 * vocabularies are one prefix apart — the census keys on `fox`, the loader wants
 * `pets/animal-fox.glb` — and getting that wrong is silent, because the dev
 * server answers a missing GLB with index.html.
 */
export const REFERENCE_ANIMALS: readonly string[] = ANATOMY_SPECIES.map(petIdOf)

/**
 * The fox, and it is not an arbitrary default.
 *
 * The acceptance test for this whole method is written down as a sentence about
 * one animal — *"sits next to the fox without looking like a guest"* — so the fox
 * is what the page opens standing beside. It is also the roster's reference
 * animal and the one every measurement on the primitives bench is quoted against.
 */
export const DEFAULT_REFERENCE = 'animal-fox'

/** A reference the loader can actually open, falling back to the fox rather than 404ing. */
export const referenceOr = (value: string | null | undefined): string =>
  value && REFERENCE_ANIMALS.includes(value) ? value : DEFAULT_REFERENCE

/* -------------------------------------------------------- the two labels */

/** What goes over each half of the pair, and what the card beside it says. */
export interface PairCard {
  /** The left model, printed PLAIN — it is Kenney's own name for Kenney's own file. */
  left: string
  leftMeta: string
  /** The right model, marked as ours and visibly different. */
  right: string
  rightMeta: string
  /** The paragraph beside the canvas: which side is which, and what is being judged. */
  why: string
}

/**
 * The labels and the sentence for one pairing.
 *
 * LEFT is the pack and RIGHT is ours, always and in that order, and the card says
 * so in those words. `viewer.ts` stops the turntable on this gallery for exactly
 * that reason — the same lesson the primitives bench learned by screenshotting a
 * row four seconds after selecting it, by which point the stand had turned 115°
 * and the sentence had become false with nothing on screen looking wrong.
 */
export function pairCard(row: AssembledRow, reference: string): PairCard {
  const ref = referenceOr(reference)
  return {
    left: ref,
    leftMeta: `${KENNEY_NOTE} — pets/${ref}.glb`,
    right: `${OURS_PREFIX}${row.name}`,
    rightMeta: `${NEW_METHOD_MARK}${row.flagged ? ` · ${FLAG_GLYPH} flagged` : ''}`,
    why:
      `LEFT is the pack — ${ref}, a real authored Kenney GLB, loaded through the game's own pet path. `
      + `RIGHT is OURS — ${row.name} (${row.id}), ${NEW_METHOD_MARK}: every vertex in it was lifted out `
      + 'of the 24 original files and assembled by src/island/species/parts. NOTHING IS BAKED — the '
      + 'right half is rebuilt in this browser on every reload, so it cannot drift from what ships. '
      + 'Both are scaled to exactly one unit tall, so what you are judging is proportion, silhouette '
      + 'and colour rather than absolute model units. The question is whether the right one sits '
      + 'beside the left one without looking like a guest.',
  }
}

/** The flag block's body, or '' when the build strained nothing. */
export const flagNote = (row: AssembledRow): string =>
  row.flagged ? `${FLAG_PREAMBLE}\n\n${row.flag}` : ''
