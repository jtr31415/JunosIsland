/**
 * The parts library, as a MODEL: every distinct shape the editor can offer,
 * flattened to rows a picker can list, filter and read aloud.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * Pure. No DOM, no THREE, no geometry in a row. A `ShapeRow` is what the picker
 * shows in a LIST — an id, a few measured numbers, a sentence — and the
 * thumbnail beside it is built separately from the bank's own positions. Keeping
 * the buffers out is not tidiness: 95 rows carrying `positions`, `normals`,
 * `indices` and `bands` is the whole bank in memory twice over, and a list that
 * re-sorts on every slider drag would be dragging that with it.
 *
 * ## What the library is browsed BY, and what it is not
 *
 * The axes are **taper, sink and absolute size** — the shape-based
 * classification `query.ts` arrived at, and this file is downstream of that
 * decision rather than a second opinion about it:
 *
 *   - **taper** — the load-bearing one. Cross-section at the narrow end over the
 *     wide end: 0 comes to a point, 1 is a bar. It is the only axis that
 *     separates a spike from a peg.
 *   - **sink** — `attachment.sunkFractionMean`, the share of the shape the pack
 *     itself buried, and `0` where there is no attachment at all. It is what
 *     tells Joe whether a shape is meant to sit proud or half-swallowed. Read
 *     off the attachment and never off the role: `box-03` is a hull that was
 *     also stacked on something as an oddment, and it keeps its 0.472222.
 *   - **size** — `longest` and `thinnest`, in absolute model units, because the
 *     pack is authored at one scale. `thinnest` is the axis that separates a
 *     plume from a whip; see `ShapeQuery.minThinnest`.
 *
 * **`form` IS NOT AN AXIS.** It is on the row as a LABEL and it is a filter only
 * if Joe explicitly asks for one, off by default. This is measured, not
 * stylistic: the hog's tusk is a `wedge` at taper 0.586 and the hog's ear is a
 * `cone` at taper 0.249, they do the same job, and any filter on `form` that
 * catches one loses the other. `query.ts` deleted `form` and `aspect` as filters
 * for exactly that reason and recorded the deletion; a picker that quietly
 * reinstated `form` would undo it in the one place Joe actually browses. So
 * `LibraryFilter.form` exists, is optional, and is documented here as
 * non-discriminating so nobody wires it to a default-on dropdown.
 *
 * ## The gallery rule
 *
 * A gallery in this repo is EXHAUSTIVE over its union. The unwritten `else` once
 * put the props in an animal gallery — see `tests/tools/gallery-source.test.ts`
 * — and the fix was never about that one gallery. So `ALL_SHAPES` is built by
 * concatenating the two sources, not by filtering or bucketing them: every id
 * `partById` can reach and every authored id is in it, and
 * `tests/tools/editor-library.test.ts` pins `PARTS_BANK.length +
 * AUTHORED_PARTS.length === ALL_SHAPES.length` with unique ids. A shape added to
 * either source appears in the picker on the next reload; there is no arm for it
 * to fall out of.
 *
 * ## Why `HULL_SHAPE_IDS` is not imported
 *
 * `creature.ts` exports the same set of hull ids, and importing it would be the
 * obvious move. It reaches `texture.ts` and `assembly.ts`, both of which import
 * THREE, and this file's whole point is that it does not. `hullShapes()` in
 * `query.ts` derives the identical list from `PARTS_BANK` with nothing behind
 * it, so the union below takes it from there instead — and the union is a union
 * precisely so that it cannot be wrong if the two ever disagree.
 */
import { PARTS_BANK, type BakedPart } from '../../../../src/island/species/parts/bank.generated'
import { AUTHORED_PARTS } from '../../../../src/island/species/parts/authored'
import { hullShapes } from '../../../../src/island/species/parts/query'
import { OTHER_HULLS } from '../../../../src/island/species/parts/hulls'

/**
 * One shape, as the picker lists it. Cheap on purpose — see the note above about
 * what is deliberately NOT here.
 */
export interface ShapeRow {
  /** The bank or authored id, e.g. `box-03`, `bespoke-sphere-01`. */
  id: string
  /**
   * The measured form bucket, `box` / `wedge` / `cone` / …
   *
   * A LABEL, shown so Joe can read what a row roughly is. Never a required
   * filter — a bucket boundary is not a measurement.
   */
  form: string
  /** Narrow end over wide end: 0 comes to a point, 1 is a bar. */
  taper: number
  /**
   * `attachment.sunkFractionMean`, or 0 where there is no attachment at all —
   * which is nine of the ten hulls, and nothing else in the library.
   *
   * The tenth hull is not an oversight. `box-03` is `roles: ["hull",
   * "oddment"]`: the pack used the 1.250 cube as a torso AND stacked a copy of
   * it on something else, sunk 0.472222, and that is a measurement the picker
   * shows rather than a contradiction it hides.
   */
  sink: number
  /** Bounding-box extent in model units, [x, y, z]. */
  size: readonly [number, number, number]
  /** The largest of `size`. */
  longest: number
  /** The smallest of `size` — the axis that separates a plume from a whip. */
  thinnest: number
  /** `handed` means a left copy is not a right copy; it must be mirrored, not reused. */
  symmetry: 'mirror' | 'radial' | 'handed'
  /** Every role the pack put this shape to. Provenance, not a category. */
  roles: readonly string[]
  /** True when the pack used this shape as the one mass. */
  isHull: boolean
  /** True for the `bespoke-` shapes, which are NOT in `PARTS_BANK`. */
  authored: boolean
  /** Distinct donor species, in first-seen order — "seen on: fox, hog". Empty when authored. */
  usedBy: readonly string[]
  /** Triangle count of the baked geometry, so a picker can show the cost. */
  tris: number
}

/** The one hull a species gets when it says nothing: the 1.250 cube. */
const DEFAULT_HULL_ID = 'box-03'

const toRow = (p: BakedPart, authored: boolean): ShapeRow => ({
  id: p.id,
  form: p.shape.form,
  taper: p.shape.taper,
  /* No attachment means nothing ever buried this shape, and 0 is the honest
   * reading of that rather than a hole in the axis. It is NOT keyed off the hull
   * role: `box-03` is a hull and an oddment both, and its measured 0.472222
   * survives to the row. */
  sink: p.attachment === null ? 0 : p.attachment.sunkFractionMean,
  size: p.size,
  longest: p.shape.longest,
  thinnest: Math.min(...p.size),
  symmetry: p.shape.symmetry,
  roles: p.roles,
  isHull: p.roles.includes('hull'),
  authored,
  usedBy: [...new Set(p.provenance.map(q => q.species))],
  tris: p.tris,
})

/**
 * Every shape the editor can offer, bank first then authored.
 *
 * EXHAUSTIVE over the union of its two sources by construction — concatenated,
 * never filtered. See the gallery rule above.
 */
export const ALL_SHAPES: readonly ShapeRow[] = [
  ...PARTS_BANK.map(p => toRow(p, false)),
  ...AUTHORED_PARTS.map(p => toRow(p, true)),
]

const BY_ID: ReadonlyMap<string, ShapeRow> = new Map(ALL_SHAPES.map(r => [r.id, r]))

/** One row by id, or `null` if nothing in either source carries that id. */
export function shapeRow(id: string): ShapeRow | null {
  return BY_ID.get(id) ?? null
}

/**
 * EVERY torso option, not the default one.
 *
 * Joe asked for all of them, so a variant that fits a species better than the
 * standard cube is one click away rather than a code change — `hulls.ts` already
 * says in as many words that picking a different authored hull is adaptation and
 * not a stretch, and this is the surface where that becomes true in practice.
 *
 * A UNION of every source that can name a hull, deduped in `ALL_SHAPES` order:
 * the default `box-03`, everything in `OTHER_HULLS`, everything `hullShapes()`
 * returns, every bank row whose `roles` include `hull`, and any authored hull.
 * The sources agree today. The union is written out anyway, because a set
 * assembled from one source is a set that silently shrinks when that source
 * changes shape, and this list going short is Joe losing a torso he was offered
 * yesterday.
 */
export const HULL_SHAPES: readonly ShapeRow[] = (() => {
  const ids = new Set<string>([
    DEFAULT_HULL_ID,
    ...Object.values(OTHER_HULLS),
    ...hullShapes().map(p => p.id),
    ...PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => p.id),
    ...AUTHORED_PARTS.filter(p => p.roles.includes('hull')).map(p => p.id),
  ])
  return ALL_SHAPES.filter(r => ids.has(r.id))
})()

/**
 * What the picker's controls add up to. Every field optional; an empty filter is
 * the whole library, which is what the default view shows.
 *
 * All windows are INCLUSIVE, so a slider parked on a value from `AXES` keeps the
 * rows that sit exactly on it.
 */
export interface LibraryFilter {
  /** Rows the pack ever used as this — a lookup into provenance, not a category. */
  role?: string
  minTaper?: number
  maxTaper?: number
  minSink?: number
  maxSink?: number
  minLongest?: number
  maxLongest?: number
  /** `handed` rows need a mirrored copy rather than a reused one. */
  symmetry?: ShapeRow['symmetry']
  /**
   * **OFF BY DEFAULT, AND NON-DISCRIMINATING.** Here so Joe can say "just the
   * cones" out loud when he already knows what he wants, and for nothing else.
   *
   * It must never be a required filter and no control should default it on: the
   * hog's tusk is a `wedge` and the hog's ear a `cone`, they do the same job, and
   * a form filter that catches either loses the other. Joe's own reuse example
   * only works with this off. See the header, and `query.ts` for the measurement.
   */
  form?: string
  /** Free text, case-insensitive, matched against the id and the donor species. */
  text?: string
}

/** Rows matching every stated window, in the order they were given. */
export function filterShapes(rows: readonly ShapeRow[], f: LibraryFilter): ShapeRow[] {
  const text = f.text === undefined ? null : f.text.trim().toLowerCase()
  return rows.filter((r) => {
    if (f.role !== undefined && !r.roles.includes(f.role)) return false
    if (f.minTaper !== undefined && r.taper < f.minTaper) return false
    if (f.maxTaper !== undefined && r.taper > f.maxTaper) return false
    if (f.minSink !== undefined && r.sink < f.minSink) return false
    if (f.maxSink !== undefined && r.sink > f.maxSink) return false
    if (f.minLongest !== undefined && r.longest < f.minLongest) return false
    if (f.maxLongest !== undefined && r.longest > f.maxLongest) return false
    if (f.symmetry !== undefined && r.symmetry !== f.symmetry) return false
    /* Only when explicitly asked for. Nothing above this line consults `form`. */
    if (f.form !== undefined && r.form !== f.form) return false
    if (text !== null && text !== '') {
      const hit = r.id.toLowerCase().includes(text)
        || r.usedBy.some(s => s.toLowerCase().includes(text))
      if (!hit) return false
    }
    return true
  })
}

const span = (pick: (r: ShapeRow) => number): [number, number] => {
  const vs = ALL_SHAPES.map(pick)
  return [Math.min(...vs), Math.max(...vs)]
}

/**
 * The three axes as the ranges the DATA actually occupies.
 *
 * Derived rather than typed so a slider built at full range cannot exclude a
 * single row — a picker whose defaults hide shapes is a picker that teaches Joe
 * the library is smaller than it is, and he would have no way to tell.
 */
export const AXES: { taper: [number, number]; sink: [number, number]; longest: [number, number] } = {
  taper: span(r => r.taper),
  sink: span(r => r.sink),
  longest: span(r => r.longest),
}

/** Trailing zeros off, so 1.250 reads as `1.25` and 0.586312 as `0.586`. */
const num = (v: number): string => {
  const s = v.toFixed(3)
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s
}

/** `1.25 cube` when all three extents match, otherwise the measured form label. */
const noun = (r: ShapeRow): string => {
  const [x, y, z] = r.size
  const square = Math.abs(x - y) < 1e-4 && Math.abs(y - z) < 1e-4
  return square && r.form === 'box' ? 'cube' : r.form
}

const taperWord = (t: number): string =>
  t >= 0.98 ? 'no taper' : t <= 0.02 ? 'to a point' : `taper ${num(t)}`

/**
 * One line a human reads, e.g.
 * `box-03 · 1.25 cube · no taper · hull · seen on fox, hog`.
 *
 * The row's own numbers in the order Joe asks about them: what it is, how big,
 * whether it points, what the pack did with it, and where he has seen it before
 * — because "seen on" is the fastest way to recognise a shape you cannot yet
 * picture.
 */
export function summarise(r: ShapeRow): string {
  const role = r.isHull ? 'hull' : r.roles.length > 0 ? r.roles.join('/') : 'unused'
  const seen = r.authored ? 'authored'
    : r.usedBy.length > 0 ? `seen on ${r.usedBy.join(', ')}`
    : 'no donor'
  return `${r.id} · ${num(r.longest)} ${noun(r)} · ${taperWord(r.taper)} · ${role} · ${seen}`
}

/* ------------------------------------------------- headers for a dropdown --- */

/** One `<optgroup>`: a header a human reads, and the rows under it. */
export type ShapeGroup = { readonly label: string; readonly rows: readonly ShapeRow[] }

/**
 * `box` -> `Boxes`, and `blade` at a count of one -> `Blade`.
 *
 * A pure function of the word and the count, so a role or form the bank grows
 * later gets a header without anyone editing a table. English's four spelling
 * cases and nothing clever: a sibilant takes `-es`, a consonant before a final
 * `y` takes `-ies`, everything else takes `-s`.
 *
 * IRREGULARS are a table because they have to be — no rule derives them. It has
 * one entry and it earned its place the moment headers became roles (JT-038):
 * the bank has a `tooth` role, and the dropdown read **"Tooths (8)"**. This is a
 * UK-English project whose whole subject is a child learning to read words, and
 * a made-up plural on the screen she is being taught from is worse here than it
 * would be almost anywhere else. Add to the table rather than complicating the
 * rules; irregular plurals are a list in every language that has them.
 */
const IRREGULAR: Readonly<Record<string, string>> = { tooth: 'teeth' }

const plural = (form: string, count: number): string => {
  const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
  if (count === 1) return cap(form)
  const irregular = IRREGULAR[form]
  if (irregular !== undefined) return cap(irregular)
  const one = cap(form)
  if (/(?:s|x|z|ch|sh)$/.test(form)) return `${one}es`
  if (/[^aeiou]y$/.test(form)) return `${one.slice(0, -1)}ies`
  return `${one}s`
}

/** Digit runs and non-digit runs, which is what makes a natural sort natural. */
const CHUNKS = /\d+|\D+/g

/**
 * `box-9` before `box-10`.
 *
 * The ids are `<form>-<zero-padded-number>` today, so a plain string sort
 * happens to give the same answer — which is exactly why this is written out:
 * the day one unpadded id is authored, a string sort files `box-9` after
 * `box-10` and the list is quietly wrong in the middle where nobody looks.
 */
const naturalCompare = (a: string, b: string): number => {
  const xs = a.match(CHUNKS) ?? []
  const ys = b.match(CHUNKS) ?? []
  const n = Math.min(xs.length, ys.length)
  for (let i = 0; i < n; i++) {
    const x = xs[i]!
    const y = ys[i]!
    const bothNumeric = /^\d/.test(x) && /^\d/.test(y)
    if (bothNumeric) {
      /* Equal numerically but differently padded (`1` vs `01`) falls through to
       * the next chunk, and to the whole-string tie-break below. */
      if (Number(x) !== Number(y)) return Number(x) - Number(y)
    } else if (x !== y) return x < y ? -1 : 1
  }
  if (xs.length !== ys.length) return xs.length - ys.length
  return a < b ? -1 : a > b ? 1 : 0
}

/**
 * The same rows, bucketed by ROLE under a header — what a `<select>` turns into
 * `<optgroup>`s.
 *
 * **This groups by role, not by form, on Joe's ruling of 2 Aug 2026 (JT-038).**
 * He was offered form — which is what this did, and was the smaller change —
 * and a role/form hybrid, and picked role outright: headers are what a shape
 * DOES, so looking for a tail shows you the seven tails. Form is still on the
 * row as a label via `summarise`, so nothing is hidden; it is simply no longer
 * what the headers are made of.
 *
 * Grouping by role is also the more honest key, and this file already said so
 * before the ruling: the hog's tusk is a `wedge` at taper 0.586 and the hog's
 * ear is a `cone` at taper 0.249, they do the same job, and a form header
 * separates them. `roles` is provenance — what the pack actually put the shape
 * to — so it is measured rather than a bucket boundary somebody drew.
 *
 * **GROUPING IS STILL NOT FILTERING.** An `<optgroup>` excludes nothing. Every
 * row handed in comes out. `LibraryFilter.form` remains the only way to lose a
 * row to a bucket and is still off by default.
 *
 * **A SHAPE MAY APPEAR UNDER MORE THAN ONE HEADER, and that is deliberate.**
 * Three of the ninety-five carry two roles, and where an ear and a horn are one
 * shape the pack recorded both. Showing it only under the first would mean Joe
 * hunting for a horn and not finding the shape that is one, which is the exact
 * failure he asked to fix. So the output is no longer a permutation of the
 * input: it is every row at least once, and once per role it holds. The tests
 * assert that property rather than the old one, derived from the data so a role
 * added to the bank gets a header instead of falling out of the list.
 *
 * Groups come out ALPHABETICAL by role, for the same reason they used to come
 * out alphabetical by form: there is no measured order to prefer, and a human
 * scanning for `tail` finds it faster in the one order he can predict without
 * being taught it. Empty groups are not emitted — a header over nothing is a
 * scroll stop that teaches Joe the library has a drawer he cannot open.
 *
 * A shape with no role at all would vanish, so it is caught and given its own
 * header rather than dropped. Nothing in the bank is roleless today; this is
 * the guard for the authored shapes, which are not lifted from anything and so
 * have no provenance to read a role off.
 */
const NO_ROLE = 'unsorted'

/** The header a roleless AUTHORED row gets: `Primitives (3)` via `plural`. */
const PRIMITIVE = 'primitive'

/**
 * Headers that name what a person is HUNTING FOR, where the role name does not.
 *
 * The role tagging is untouched and stays untouched — JT-038 says the drawers are
 * roles, and `card` is still `card` in the data, in `bank.generated.ts`, and in
 * every place a species or a test reads it. This map changes one thing: the words
 * over the drawer.
 *
 * It exists because "Cards" describes the GEOMETRY (a flat cut-out sheet) and
 * nobody arrives at this list looking for a flat cut-out sheet. They arrive
 * looking for a mouth — and a mouth is a card, so the one drawer that has it is
 * the one drawer they will not open. `plural` is left generic on purpose: it
 * derives a header for whatever role the bank grows next, and teaching it about
 * particular words would make the day-one behaviour of a new role worse to make
 * one header better.
 *
 * The header names all four honestly and not just the two being hunted for.
 * `plate-03` and `plate-13` are face-plates; `plate-10` and `plate-11` are
 * flank-patch cards, recorded on axis `x` at an offset of 0.635 and used as
 * markings on every species that wears them — civet spots, the raccoon's mask,
 * salamander mottling. Calling the drawer "faces" would have been a lie for half
 * of it, and a person looking for a marking would then be the one who could not
 * find their drawer. The fix for one hunt must not create the next one.
 *
 * The count suffix is still appended by the caller, so this reads
 * `Mouths, faces & markings (4)` and stays scannable beside the other headers.
 */
const HEADER: Readonly<Record<string, string>> = { card: 'Mouths, faces & markings' }

export const groupShapes = (rows: readonly ShapeRow[]): readonly ShapeGroup[] => {
  const byRole = new Map<string, ShapeRow[]>()
  const push = (role: string, r: ShapeRow): void => {
    const bucket = byRole.get(role)
    if (bucket === undefined) byRole.set(role, [r])
    else bucket.push(r)
  }
  for (const r of rows) {
    /*
     * A roleless row is bucketed by whether it is AUTHORED, and `primitive` on
     * that side is a UI LABEL — **NOT a `PartRole`.** Nothing in the data claims
     * it and nothing here writes it down: `PartRole` is declared in
     * `bank.generated.ts`, which is generated and never hand-edited, and it is
     * documented as what a part WAS in the animal it came out of. The three base
     * shapes came out of no animal, which is exactly why their `roles` and their
     * `provenance` are both empty — and no role plus no provenance is precisely
     * what a primitive is. So the header is derived from those two empty arrays
     * rather than being a category smuggled in beside the measured ones.
     *
     * `NO_ROLE` stays alive as the guard it was written to be, and keeps the
     * other side: a bank shape that arrived one day with no role is an accident,
     * and `Unsorteds` reads as one, which is right. It read as one over Joe's own
     * square, triangle and circle too, and those are not accidents.
     */
    if (r.roles.length === 0) push(r.authored ? PRIMITIVE : NO_ROLE, r)
    else for (const role of r.roles) push(role, r)
  }
  return [...byRole.keys()]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((role) => {
      const sorted = byRole.get(role)!.slice().sort((a, b) => naturalCompare(a.id, b.id))
      /* The count is in the header because Joe is scanning: 29 noses is a page of
       * scrolling and 4 cards is not, and knowing which before he starts is the
       * difference between reading the list and hunting through it. */
      const head = HEADER[role] ?? plural(role, sorted.length)
      return { label: `${head} (${sorted.length})`, rows: sorted }
    })
}
