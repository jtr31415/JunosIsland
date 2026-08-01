/**
 * The species editor's EDIT MODEL: a definition in, a new definition out.
 *
 * JOE_WORKBENCH_ONLY.
 *
 * ## The editor edits the DEFINITION, never the mesh
 *
 * A visual editor for these animals has exactly one temptation worth naming, and
 * it is to edit the thing on the screen. Drag a mesh, write back its
 * `position` — and the moment that happens the species is whatever the last drag
 * left behind, `creature.ts`'s derivations are dead code, and the ten rules are
 * enforced on a value nobody produces any more. `assembly.ts` writes a mesh's
 * `userData` precisely so a picked mesh can be traced BACK to the slot of the
 * definition that produced it; `pathFromUserData` is that trace, and every
 * operation below then edits the `CreatureDef`. The mesh is rebuilt from it.
 * There is no other direction.
 *
 * So this file is:
 *
 *   - **pure** — every op takes a `CreatureDef` and returns a NEW one; the input
 *     is never touched, so undo is a stack of old objects and nothing else,
 *   - **three.js-free** — no import here reaches `three`, which is what lets the
 *     whole edit model run in a node test. Only `bank.generated.ts` (plain data,
 *     no imports at all) and `hulls.ts` (which imports only the bank) are pulled
 *     in at runtime; the real `CreatureDef`/`PartDef`/`HullDef`/`Vec3` types come
 *     in as `import type`, which `verbatimModuleSyntax` erases,
 *   - **geometry-free** — nothing here measures a part or solves a placement.
 *     `creature.ts` owns all of that and is the only thing that should.
 *
 * ## `at` is the JOIN POINT
 *
 * Everywhere in this file, and everywhere in the kit, a part's `at` is the point
 * on the mass where the part JOINS — not where its centre goes. The centre is
 * derived from `sink`. A drag handle in the UI therefore moves a join point, and
 * the mesh it is attached to will not follow it one-for-one: a sunk part's
 * centre sits `sink * extent` further along its own facing. That is correct.
 *
 * ## Paired parts, and the drag on the far side
 *
 * Rule 6: a pair is ONE mesh placed twice, and `Placement.pair.at` is the +x
 * copy — the -x copy is derived by negating x and mirroring the vertices. There
 * is deliberately no way to place a left ear and a right ear independently, and
 * this file adds none. **If the user drags the -x copy, the caller negates x
 * before calling `setJoin`.** `buildAssembly` tags those meshes `-l` (and the +x
 * one `-r`) and writes `mirror: true` on the `-l` copy's `userData`, so the
 * caller can tell which it has without guessing from the sign of a coordinate.
 *
 * ## Warnings warn. They never block
 *
 * §2's escape clause is Joe's, and an editor that refuses an edit takes it away
 * from him. But a violation nobody sees is how a family of animals stops looking
 * like a family, so `warningsFor` says so — by axiom, with a severity, pointing
 * at the slot. Nothing here throws on a bad definition. `creatureSpec` still
 * does, at definition time, which is the right place for a hard rule.
 */
import { PARTS_BANK } from '../../../../src/island/species/parts/bank.generated'
import { EYE_CARD_Z, LEG_ROW } from '../../../../src/island/species/parts/hulls'
import { assemblyFor } from '../../../../src/island/species/parts/assembled/register'
import type {
  CreatureDef, HullDef, PaintLike, PartDef, PartLike, RidgeDef,
} from '../../../../src/island/species/parts'
import type { Spin, Vec3 } from '../../../../src/island/species/parts/assembly'

/* ------------------------------------------------------- what the bank is --- */

/**
 * Every shape the pack used as a HULL, and every shape it used as an EYE.
 *
 * Derived off `PARTS_BANK` here rather than imported from `creature.ts`'s
 * `HULL_SHAPE_IDS`, which is the same derivation off the same array — but
 * `creature.ts` imports `assembly.ts` for `spinVec`, and `assembly.ts` imports
 * three.js. The bank is plain data with no imports at all, so this is the same
 * source of truth reached by the one path that keeps this file pure.
 */
const HULL_SHAPES: ReadonlySet<string> = new Set(
  PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => p.id),
)
const EYE_SHAPES: ReadonlySet<string> = new Set(
  PARTS_BANK.filter(p => p.roles.includes('eye')).map(p => p.id),
)

/** `creature.ts`'s own defaults for the two slots that have no `part` of their own. */
const DEFAULT_HULL_PART = 'box-03'
const DEFAULT_EYE_PART = 'plate-01'

/* -------------------------------------------------------------- numbers --- */

/**
 * Six decimals, which is the bank's own rounding.
 *
 * Every numeric write goes through this. A definition is a source file that gets
 * diffed and reviewed; a drag that wrote `0.6350000000000001` would churn the
 * file on every re-save and bury the one number that actually changed. `-0` is
 * normalised to `0` for the same reason — it serialises differently and means
 * the same thing.
 */
export const round6 = (n: number): number => {
  const r = Math.round(n * 1e6) / 1e6
  return Object.is(r, -0) ? 0 : r
}

const v3 = (v: Vec3): Vec3 => [round6(v[0]), round6(v[1]), round6(v[2])]

/* ------------------------------------------------------------ addressing --- */

/**
 * One editable slot of a `CreatureDef`.
 *
 * These are the definition's own roles, not the mesh's. `legs` is four meshes and
 * one slot; `ridge` is up to five rows and one slot; `eyes` is two cards and one
 * slot. That asymmetry IS the model — rule 6 exists so that a pair cannot be
 * edited as two things.
 */
export type DefPath =
  | { role: 'hull' } | { role: 'legs' } | { role: 'eyes' }
  | { role: 'ears' } | { role: 'tail' } | { role: 'snout' } | { role: 'nose' }
  | { role: 'ridge' } | { role: 'extras'; index: number }

/** The four roles whose value is a `PartLike` — the ones that are one part each. */
const FEATURE_ROLES = ['ears', 'tail', 'snout', 'nose'] as const
type FeatureRole = (typeof FEATURE_ROLES)[number]
const isFeatureRole = (r: string): r is FeatureRole =>
  (FEATURE_ROLES as readonly string[]).includes(r)

/** What `partAt` hands back: whichever of the three slot shapes the path names. */
export type PartSlot = PartDef | HullDef | RidgeDef

/**
 * The mesh names `creature.ts` gives each role when the definition does not.
 *
 * `buildAssembly` writes the FEATURE's `name` to `userData.role`, and a feature's
 * name defaults to the role's own — which is singular (`ear`, `leg`, `eye`), and
 * is why this table exists rather than the role string being used directly.
 */
/** Every role but `extras`, which has no fixed name and needs the definition. */
type SimpleRole = Exclude<DefPath, { role: 'extras' }>['role']

const ROLE_BY_MESH: Readonly<Record<string, SimpleRole>> = {
  hull: 'hull',
  leg: 'legs',
  eye: 'eyes',
  ear: 'ears',
  tail: 'tail',
  snout: 'snout',
  nose: 'nose',
}

/** `creature.ts`'s default ridge stem, and the three suffixes it emits rows under. */
const RIDGE_STEM = 'spike'
const RIDGE_ROWS = ['top', 'chamfer', 'side'] as const

/** Strip a copy tag: `-r`, `-l`, `-3`, `-r0`, `-l0`. */
const stripCopyTag = (name: string): string => name.replace(/-(?:[rl]\d*|\d+)$/, '')

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

/**
 * Map a picked mesh back to the slot of the definition that produced it.
 *
 * `u` is the mesh's `userData` as `buildAssembly` wrote it — `role` is the
 * FEATURE's name and is the field that carries the answer. The mesh's own `name`
 * is accepted too (as `u.name`, which a caller can splice in from `mesh.name`)
 * so a copy tag like `ear-l` or `spike-top2` still resolves.
 *
 * **Pass `def` whenever you have it.** Without it this can only recognise the
 * DEFAULT names, because a definition may rename any feature — and an `extras`
 * entry is nothing but a name, so an extras mesh is unmappable without the
 * definition to look it up in. With `def` the answer is exact.
 *
 * Returns `null` when the pick cannot be traced to a slot, so the UI says "not
 * editable" rather than offering a handle that writes somewhere else.
 */
export function pathFromUserData(
  u: Record<string, unknown>, def?: CreatureDef,
): DefPath | null {
  const raw = str(u['role']) ?? (str(u['name']) === undefined ? undefined : stripCopyTag(str(u['name'])!))
  if (raw === undefined) return null
  const name = stripCopyTag(raw)

  if (def) {
    /* Exact: match the names this definition actually gives its features.
     *
     * The WHOLE name first, across every extra, and only then the copy-tag-stripped
     * one — two passes rather than one, because a stripped name can belong to
     * another extra. `uniqueExtraName` hands out `wart`, `wart-2`, `wart-3`, and
     * `stripCopyTag('wart-2')` is `wart`: a single pass testing both per entry
     * resolved the SECOND part's mesh to the FIRST part's slot, so a click on the
     * copy moved the original. Exact wins; the stripped form is the fallback for
     * a real copy tag (`wart-2-r`, `wart-2-l`), which no entry is ever named. */
    const extras = def.extras ?? []
    for (let i = 0; i < extras.length; i++) {
      if (extras[i]!.name === raw) return { role: 'extras', index: i }
    }
    for (let i = 0; i < extras.length; i++) {
      if (extras[i]!.name === name) return { role: 'extras', index: i }
    }
    if (def.ridge) {
      const stem = def.ridge.name ?? RIDGE_STEM
      for (const row of RIDGE_ROWS) if (raw === `${stem}-${row}` || name === `${stem}-${row}`) return { role: 'ridge' }
    }
    if (def.legs !== false && (def.legs?.name ?? 'leg') === name) return { role: 'legs' }
    for (const role of FEATURE_ROLES) {
      const v = def[role]
      if (v === undefined) continue
      if ((asDef(v).name ?? ROLE_MESH_NAME[role]) === name) return { role } as DefPath
    }
  }

  /* By convention: the names `creature.ts` uses when a definition says nothing. */
  const ridge = /^(.+)-(?:top|chamfer|side)$/.exec(raw)
  if (ridge && (!def || (def.ridge?.name ?? RIDGE_STEM) === ridge[1])) {
    if (!def || def.ridge) return { role: 'ridge' }
  }
  const known = ROLE_BY_MESH[name]
  if (known === undefined) return null
  return { role: known } as DefPath
}

/** The singular mesh name each `PartLike` role gets by default. */
const ROLE_MESH_NAME: Readonly<Record<FeatureRole, string>> = {
  ears: 'ear', tail: 'tail', snout: 'snout', nose: 'nose',
}

/** A stable string for a path. Safe as a DOM id and as a `Map` key. */
export const pathKey = (p: DefPath): string =>
  p.role === 'extras' ? `extras:${p.index}` : p.role

/** Two paths, same slot. */
export const samePath = (a: DefPath, b: DefPath): boolean => pathKey(a) === pathKey(b)

const asDef = (p: PartLike): PartDef => (typeof p === 'string' ? { part: p } : p)

/**
 * The slot a path names, normalised to object form, or `null` when the species
 * does not have it (a legless species, a deleted ear).
 *
 * **Normalisation fills the SHAPE default and nothing else.** `legs` and `eyes`
 * carry no `part` in the definition — the shape is `creature.ts`'s — so one is
 * filled in here to make the returned object a usable `PartDef`. Measured
 * defaults are NOT resolved: an `at` that the definition does not give is a
 * derivation `creature.ts` owns, and guessing it here would be a second
 * implementation of the donor transfer, drifting quietly from the first.
 *
 * `legs` gets its row stations presented as an `at` (`[x, LEG_ROW.y, z]`) only
 * when the definition gives both, because that is what `setJoin` writes back.
 */
export function partAt(def: CreatureDef, p: DefPath): PartSlot | null {
  if (p.role === 'hull') {
    const h: HullDef = typeof def.hull === 'string' ? { part: def.hull } : { ...def.hull }
    return { ...h, part: h.part ?? DEFAULT_HULL_PART }
  }
  if (p.role === 'legs') {
    if (def.legs === false) return null
    const l = def.legs ?? {}
    const out: PartDef = { part: LEG_ROW.part, sink: LEG_ROW.sink }
    if (l.paint !== undefined) out.paint = l.paint
    if (l.name !== undefined) out.name = l.name
    if (l.x !== undefined && l.z !== undefined) out.at = [l.x, LEG_ROW.y, l.z]
    return out
  }
  if (p.role === 'eyes') {
    if (def.eyes === false) return null
    const e = def.eyes ?? {}
    const out: PartDef = { part: e.part ?? DEFAULT_EYE_PART, sink: 0 }
    if (e.paint !== undefined) out.paint = e.paint
    if (e.x !== undefined && e.y !== undefined) out.at = [e.x, e.y, EYE_CARD_Z]
    return out
  }
  if (p.role === 'ridge') return def.ridge ?? null
  if (p.role === 'extras') return def.extras?.[p.index] ?? null
  const v = def[p.role]
  return v === undefined ? null : asDef(v)
}

/** One row of the editor's part list. */
export interface PartRow {
  path: DefPath
  /** For a human: `Ears`, `Ridge`, or an extra's own name. */
  label: string
  /** The bank id this slot wears. */
  part: string
}

/**
 * Every editable slot this species has, in a stable order.
 *
 * The order is `CreatureDef`'s own field order, so the list reads like the source
 * file it edits. `legs` and `eyes` appear even when the definition is silent
 * about them, because they are GIVEN — a definition that says nothing still gets
 * four legs and two eye cards, and a list that hid them would hide two thirds of
 * what is on the screen.
 */
export function listParts(def: CreatureDef): PartRow[] {
  const rows: PartRow[] = []
  const push = (path: DefPath, label: string): void => {
    const slot = partAt(def, path)
    if (slot && 'part' in slot && typeof slot.part === 'string') rows.push({ path, label, part: slot.part })
  }
  push({ role: 'hull' }, 'Hull')
  push({ role: 'legs' }, 'Legs')
  push({ role: 'eyes' }, 'Eyes')
  if (def.ears !== undefined) push({ role: 'ears' }, 'Ears')
  if (def.tail !== undefined) push({ role: 'tail' }, 'Tail')
  if (def.snout !== undefined) push({ role: 'snout' }, 'Snout')
  if (def.nose !== undefined) push({ role: 'nose' }, 'Nose')
  if (def.ridge !== undefined) push({ role: 'ridge' }, 'Ridge')
  for (let i = 0; i < (def.extras?.length ?? 0); i++) {
    push({ role: 'extras', index: i }, def.extras![i]!.name)
  }
  return rows
}

/* -------------------------------------------------------- the write path --- */

/** Replace one `PartLike` role, or remove it when `next` is `undefined`. */
function withFeature(def: CreatureDef, role: FeatureRole, next: PartDef | undefined): CreatureDef {
  const out: CreatureDef = { ...def }
  if (next === undefined) delete out[role]
  else out[role] = next
  return out
}

/** Replace one `extras` entry. */
function withExtra(def: CreatureDef, index: number, next: PartDef & { name: string }): CreatureDef {
  const extras = def.extras ?? []
  if (index < 0 || index >= extras.length) return def
  return { ...def, extras: extras.map((e, i) => (i === index ? next : e)) }
}

/**
 * Edit whichever `PartDef`-shaped slot the path names, leaving the rest alone.
 *
 * `hull`, `legs`, `eyes` and `ridge` are NOT `PartDef`s and are handled by each
 * operation itself, because what a move or a resize means differs for each of
 * them — and for two of them it means nothing at all, which is rule 5.
 */
function editPart(
  def: CreatureDef, p: DefPath, edit: (d: PartDef) => PartDef,
): CreatureDef {
  if (p.role === 'extras') {
    const cur = def.extras?.[p.index]
    if (!cur) return def
    const next = edit({ ...cur })
    return withExtra(def, p.index, { ...next, name: next.name ?? cur.name })
  }
  if (!isFeatureRole(p.role)) return def
  const cur = def[p.role]
  if (cur === undefined) return def
  return withFeature(def, p.role, edit({ ...asDef(cur) }))
}

const normHull = (def: CreatureDef): HullDef =>
  typeof def.hull === 'string' ? { part: def.hull } : { ...def.hull }

/** The `PartDef` a path names, or `null` — only for the four one-part roles and extras. */
function currentPart(def: CreatureDef, p: DefPath): PartDef | null {
  if (p.role === 'extras') return def.extras?.[p.index] ?? null
  if (!isFeatureRole(p.role)) return null
  const v = def[p.role]
  return v === undefined ? null : asDef(v)
}

type Chamfered = PartDef & { chamfer?: boolean }

/**
 * Unpack `tail: { chamfer: true }` when an edit gives the idiom's `at` or `spin`
 * by hand.
 *
 * `chamfer: true` solves the rear-top chamfer's MIDPOINT and its 45-degree turn
 * onto that chamfer's normal TOGETHER, and `creature.ts` throws rather than see
 * one of the two given beside it — "giving one by hand and not the other is how a
 * tail floats". So an edit that supplies either has to take over both. The spin
 * written here is the same `[{ axis: 'x', deg: 45 }]` literal `creature.ts`
 * writes, so unpacking the flag does not move the mesh.
 */
function unpackChamfer(d: PartDef): PartDef {
  const c = d as Chamfered
  if (c.chamfer !== true) return d
  const out: Chamfered = { ...c }
  delete out.chamfer
  if (out.spin === undefined) out.spin = [{ axis: 'x', deg: 45 }]
  return out
}

/**
 * Whether a spin leaves the part's facing on an axis.
 *
 * **Exactly the multiples of 90.** Quarter turns about the axes are signed
 * permutations, so they map an axis-aligned facing to another one; anything else
 * lands it on a diagonal. This is a fact about the group, not a re-derivation of
 * `spinVec` — which matters, because `assembly.ts` says in as many words that a
 * second implementation of that rotation is the drift a fingerprint would then
 * have to catch, and there is none here.
 *
 * It is load-bearing: `creature.ts`'s donor transfer joins a part to the face of
 * the hull its facing points at, and a diagonal facing has no face, so it throws
 * unless the definition gives an explicit `at`.
 */
const isQuarterTurn = (spin: readonly Spin[]): boolean =>
  spin.every(s => s.deg % 90 === 0)

/**
 * MOVE. Writes the JOIN point `at` — where the part meets the mass, not its
 * centre.
 *
 * Per slot, because a join point is not the same thing on all of them:
 *
 *   - `hull` — `at` is the hull's bounding-box CENTRE, which is the one place in
 *     the kit where `at` is a centre. `Hull.at` says so.
 *   - `legs` — a row, not a point. `x` and `z` are written, and `y` is dropped:
 *     `LEG_ROW.y` is what puts the feet on zero and is not a species' choice.
 *   - `eyes` — `x` and `y` are written and `z` is dropped. Rule 5: the eye card
 *     is at `EYE_CARD_Z` on every animal in the pack, and `CreatureDef` has no
 *     field to say otherwise.
 *   - `ridge` — no join point at all; its five rows are solved off the hull's own
 *     measured faces and chamfers. Returns the definition unchanged.
 *
 * **A pair's `at` is the +x copy.** If the user dragged the -x copy (mesh tag
 * `-l`, `userData.mirror === true`), the CALLER negates x before calling this.
 * Rule 6 is that there is one mesh placed twice; adding a second `at` here would
 * be the one way to break it.
 */
export function setJoin(def: CreatureDef, p: DefPath, at: Vec3): CreatureDef {
  const a = v3(at)
  if (p.role === 'hull') return { ...def, hull: { ...normHull(def), at: a } }
  if (p.role === 'legs') {
    if (def.legs === false) return def
    return { ...def, legs: { ...(def.legs ?? {}), x: a[0], z: a[2] } }
  }
  if (p.role === 'eyes') {
    if (def.eyes === false) return def
    return { ...def, eyes: { ...(def.eyes ?? {}), x: a[0], y: a[1] } }
  }
  if (p.role === 'ridge') return def
  return editPart(def, p, d => ({ ...unpackChamfer(d), at: a }))
}

/**
 * ROTATE. Rule 4 as amended: a spin is baked into the COPY's vertices and
 * normals, never onto a node, so this is a property of the part and not a
 * transform. An empty list removes the key.
 *
 * **A spin off the quarter turns needs the join point with it.** `creature.ts`
 * solves an unstated `at` by the donor transfer — join to the face of the hull
 * the part's facing points at — and a facing turned 30 degrees points at no face,
 * so the definition throws by name. That is correct, and it is why `at` is the
 * fourth argument here: the caller has it, off the picked mesh's
 * `userData.joinedAt`, and passing it turns an unbuildable edit into a buildable
 * one. Without it, a spin that would leave the part facing a diagonal on a part
 * that has no `at` is DECLINED — the definition comes back unchanged, rather than
 * one drag producing a species that will not load.
 *
 * `hull`, `legs` and `eyes` have no `spin` field — a spun hull is a different
 * authored shape, a spun leg row lifts the feet off the floor, and a spun eye
 * card is rule 5 — so they return unchanged. A `ridge` never needs an anchor: its
 * rows are placed off the hull's own measured faces and each takes this spin
 * FIRST, before its own turn onto its face.
 */
export function setSpin(
  def: CreatureDef, p: DefPath, spin: readonly Spin[], at?: Vec3,
): CreatureDef {
  const s = spin.map(x => ({ axis: x.axis, deg: round6(x.deg) }))
  if (p.role === 'ridge') {
    if (!def.ridge) return def
    const next: RidgeDef = { ...def.ridge }
    if (s.length === 0) delete next.spin
    else next.spin = s
    return { ...def, ridge: next }
  }
  if (p.role === 'hull' || p.role === 'legs' || p.role === 'eyes') return def

  const cur = currentPart(def, p)
  if (cur === null) return def
  const anchor = at !== undefined ? v3(at) : cur.at
  const needsAnchor = (s.length > 0 && !isQuarterTurn(s)) || (cur as Chamfered).chamfer === true
  if (needsAnchor && anchor === undefined) return def

  return editPart(def, p, d => {
    const next: Chamfered = { ...d }
    delete next.chamfer
    if (s.length === 0) delete next.spin
    else next.spin = s
    if (anchor !== undefined) next.at = anchor
    return next
  })
}

/**
 * RESIZE. Rule 1, and the axiom warnings have opinions about it — see
 * `warningsFor`, which flags every one of these.
 *
 * `undefined` clears it. `eyes` has no `stretch` field at all (rule 5 is
 * unsayable, not merely discouraged), `legs` has none, a `ridge` scales by
 * choosing a different shape, and THE HULL HAS NONE EITHER — all four return
 * unchanged.
 *
 * The hull used to be a dial here, paired with a mandatory `stretchWhy` on the
 * theory that a sentence Joe could read made the departure honest. It did not: the
 * hedgehog shipped with the shared 1.250 cube quietly stretched and his first note
 * back was "body cubic, its currently too wide". `HullDef.stretch` is now typed
 * `never` (see `Hull` in `assembly.ts`), so a stretched hull is unexpressible
 * rather than merely discouraged — and a half-finished editor still OFFERING the
 * dial is exactly the recurrence that ruling exists to stop. A different
 * proportion is a different authored hull: wider `box-12`, taller `box-21`,
 * shallower `box-31`, bigger `box-41`, through `setPartShape`.
 */
export function setStretch(def: CreatureDef, p: DefPath, s: Vec3 | undefined): CreatureDef {
  if (p.role === 'hull' || p.role === 'legs' || p.role === 'eyes' || p.role === 'ridge') return def
  return editPart(def, p, d => {
    const next = { ...d }
    if (s === undefined) delete next.stretch
    else next.stretch = v3(s)
    return next
  })
}

/**
 * Swap in a library shape. The id is a bank id (`cone-01`) or one of the
 * sanctioned `bespoke-*` shapes; nothing is validated here, because
 * `creatureSpec` refuses an unknown id by name and refuses a bespoke one without
 * a `flag`, and both messages are better than anything this file could say.
 *
 * `legs` has no `part` field — `creature.ts` places `LEG_ROW.part` on every
 * species, which is what makes the leg row the one thing that never moves — so it
 * returns unchanged.
 */
export function setPartShape(def: CreatureDef, p: DefPath, partId: string): CreatureDef {
  if (p.role === 'hull') return { ...def, hull: { ...normHull(def), part: partId } }
  if (p.role === 'eyes') {
    if (def.eyes === false) return def
    return { ...def, eyes: { ...(def.eyes ?? {}), part: partId } }
  }
  if (p.role === 'ridge') {
    if (!def.ridge) return def
    return { ...def, ridge: { ...def.ridge, part: partId } }
  }
  if (p.role === 'legs') return def
  return editPart(def, p, d => ({ ...d, part: partId }))
}

/**
 * Paint a slot. Rule 8: a `PaintLike` is a palette SLOT NAME or a `Paint` block,
 * never a colour — a colour lives in the palette and reaches the mesh as a
 * texture cell, and a material tint is what the whole slot mechanism exists to
 * avoid.
 *
 * `CreatureDef.eyes.paint` is a plain slot name rather than a `PaintLike`,
 * because the eye card's second colour is the pupil and the pupil is not a
 * species' choice. A `Paint` passed for the eyes is reduced to its `base`.
 */
export function setPaint(def: CreatureDef, p: DefPath, paint: PaintLike): CreatureDef {
  if (p.role === 'hull') return { ...def, hull: { ...normHull(def), paint } }
  if (p.role === 'legs') {
    if (def.legs === false) return def
    return { ...def, legs: { ...(def.legs ?? {}), paint } }
  }
  if (p.role === 'eyes') {
    if (def.eyes === false) return def
    return { ...def, eyes: { ...(def.eyes ?? {}), paint: typeof paint === 'string' ? paint : paint.base } }
  }
  if (p.role === 'ridge') {
    if (!def.ridge) return def
    return { ...def, ridge: { ...def.ridge, paint } }
  }
  return editPart(def, p, d => ({ ...d, paint }))
}

/* ---------------------------------------------------------- the palette --- */

const rgb24 = (rgb: number): number => Math.max(0, Math.min(0xffffff, Math.round(rgb)))

/**
 * Rebuild a palette, preserving INSERTION ORDER exactly.
 *
 * `CreatureDef.palette` says it and `AssemblyBuild.palette` says it again:
 * insertion order IS the texture layout. Slot *n* is column *n* of the atlas, and
 * every UV in every baked geometry is computed from that index. Reordering the
 * object is therefore not a cosmetic change to a record — it repaints the whole
 * animal, silently, and every op here is written so it cannot happen.
 */
function rebuiltPalette(
  palette: Readonly<Record<string, number>>, slot: string, rgb: number, append: boolean,
): Readonly<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const k of Object.keys(palette)) out[k] = k === slot ? rgb24(rgb) : palette[k]!
  if (append && palette[slot] === undefined) out[slot] = rgb24(rgb)
  return out
}

/**
 * Recolour an existing slot. A slot the palette does not have is NOT created —
 * that is `addPaletteSlot`, which is a different act with a different
 * consequence.
 */
export const setPaletteColour = (def: CreatureDef, slot: string, rgb: number): CreatureDef =>
  def.palette[slot] === undefined
    ? def
    : { ...def, palette: rebuiltPalette(def.palette, slot, rgb, false) }

/**
 * Append a slot. **Appending is the only safe edit to a palette's shape.**
 *
 * A new slot takes the next atlas column and every existing column keeps its
 * index, so nothing already painted changes. Inserting in the middle, removing,
 * or reordering would renumber the columns after the change and repaint every
 * part that used one — so there is no function here that does any of them, and
 * `warningsFor` shouts (`palette-order`, `loud`) if a definition arrives having
 * had it done to it some other way.
 *
 * A slot that already exists is recoloured in place, keeping its position.
 */
export const addPaletteSlot = (def: CreatureDef, slot: string, rgb: number): CreatureDef =>
  ({ ...def, palette: rebuiltPalette(def.palette, slot, rgb, true) })

/* ------------------------------------------------------------- the rest --- */

/** Every mesh name this species already uses, so a new one cannot collide. */
function usedNames(def: CreatureDef): Set<string> {
  const used = new Set<string>()
  if (def.legs !== false) used.add(def.legs?.name ?? 'leg')
  if (def.eyes !== false) used.add('eye')
  for (const role of FEATURE_ROLES) {
    const v = def[role]
    if (v !== undefined) used.add(asDef(v).name ?? ROLE_MESH_NAME[role])
  }
  if (def.ridge) {
    const stem = def.ridge.name ?? RIDGE_STEM
    used.add(stem)
    for (const r of RIDGE_ROWS) used.add(`${stem}-${r}`)
  }
  for (const e of def.extras ?? []) used.add(e.name)
  return used
}

/**
 * A name no feature of this species already has.
 *
 * A name is not decoration: it names the meshes and it is what `PartDef.on`
 * anchors to, so two features sharing one would make `on` ambiguous and a pick
 * unresolvable. `stem`, then `stem-2`, `stem-3`.
 */
export function uniqueExtraName(def: CreatureDef, stem: string): string {
  const used = usedNames(def)
  if (!used.has(stem)) return stem
  for (let n = 2; ; n++) {
    const candidate = `${stem}-${n}`
    if (!used.has(candidate)) return candidate
  }
}

/**
 * ADD a part this species does not have: a new `extras` entry wearing `partId`.
 *
 * The structural sibling of `duplicatePart` — append to `extras`, return the
 * definition and the path of what was appended — because `extras` is the only
 * slot that takes an arbitrary new part at all. The other eight are the roles
 * `creature.ts` names, each is one thing or a count, and a species does not get a
 * second tail by adding one.
 *
 * **Nothing is invented that already has a measured default.** `PartDef` requires
 * `part` and nothing else: `sink` is the shape's own `attachment.sunkFractionMean`
 * — the depth its donor actually used — and `at` is the donor transfer, join at
 * the face of THIS hull that the donor joined it to. Both are recoveries, and a
 * number written here would be this file's second opinion about geometry it does
 * not own. So the entry is `{ part, name }`, and the part lands where the pack
 * itself put that shape. The user drags it from there.
 *
 * `name` is the one field that cannot be defaulted, and it is not decoration: it
 * names the meshes, it is what `PartDef.on` anchors to, and it is the only way
 * `pathFromUserData` maps a picked mesh back to this slot. `uniqueExtraName`
 * gives a collision-free one — the shape id, then `-2`, `-3` — so inserting the
 * same shape five times leaves five separately pickable parts.
 *
 * **A blank id is DECLINED by identity**: the SAME object comes back with a
 * `null` path, which is how the page's `apply()` reads a refusal (`next === def`).
 * Nothing else is refused here, deliberately:
 *
 *   - a HULL-shaped id as an extra is not blocked. `warningsFor` says it loudly
 *     (`one-mass`, and it names both masses), and `creatureSpec` then refuses it
 *     by name — "RULE 3", with the 72 scrapped animals in the message. Both are
 *     better than a dropdown row that silently does nothing, and §2's escape
 *     clause is Joe's. Note that this is the one insert that will NOT build.
 *   - a `bespoke-` id is not blocked either, for the same reason: `creatureSpec`
 *     refuses one without a `flag` and says what the flag is for.
 *   - an id in no bank at all is not blocked: `creatureSpec` refuses it by name,
 *     which is a better message than anything this file could word.
 */
export function insertPart(
  def: CreatureDef, partId: string,
): { def: CreatureDef; path: DefPath | null } {
  const part = partId.trim()
  if (part === '') return { def, path: null }
  const entry: PartDef & { name: string } = { part, name: uniqueExtraName(def, part) }
  const extras = [...(def.extras ?? []), entry]
  return { def: { ...def, extras }, path: { role: 'extras', index: extras.length - 1 } }
}

/**
 * A new animal from nothing: standard hull, four legs, two eye cards, a palette.
 *
 * Joe's fifth note on the editor: *"need a function to start a new animal
 * conmpletely from scratch."* This is that function, and the striking thing about
 * it is how little it contains — **it is a palette and nothing else.**
 *
 * That is not a stub, it is the architecture showing through. `CreatureDef` makes
 * the standard body the DEFAULT, not a thing you ask for: `hull` omitted is the
 * 1.250 cube at its own recorded offset, `legs` omitted is four legs on the row
 * that never moves, `eyes` omitted is two cards at `EYE_CARD_Z`. `listParts`
 * shows all three anyway — it says so in its own doc — so Joe opens this and sees
 * Hull, Legs and Eyes in the list and a plain animal on the canvas, which is
 * exactly what he asked for. Writing them out explicitly would say the same thing
 * in more words and would put three hand-typed numbers where measured defaults
 * belong.
 *
 * The palette IS required, and its INSERTION ORDER IS THE TEXTURE LAYOUT, so
 * these five slots in this order are data, not decoration. They are the same five
 * the mouse carries, which makes a new animal's texture laid out like every
 * shipped one. `pupil` is the pack's own measured grey, copied as a literal
 * rather than imported from `texture.ts` because this file is deliberately
 * three.js-free so the edit model runs in a node test.
 *
 * The colours are a NEUTRAL GREY on purpose. A new animal should look unpainted
 * rather than look like some other animal — a plausible brown invites Joe to
 * leave it, and then every species he starts is the same brown.
 *
 * This never touches a shipped species: it returns a fresh object and the caller
 * gives it a new id. The live 24 are frozen and nothing here can reach them.
 */
export function blankDef(): CreatureDef {
  return {
    palette: {
      coat: 0x9a9a9a,  // deliberately unpainted grey — recolour it, do not keep it
      belly: 0xe8e8e8, // the pale slot: belly patch, sclera, an inner ear
      inner: 0xc98f86, // the detail slot: inner ears, a nose
      limb: 0x5c5c5c,  // legs, a muzzle, a tail
      pupil: 0x4c4f5e, // PACK_PUPIL, measured off 544 real eye texels (texture.ts)
    },
  }
}

/**
 * Copy a part into a new `extras` entry with a unique name.
 *
 * Only the slots that ARE one part can be copied — `ears`, `tail`, `snout`,
 * `nose` and an existing extra. The other four decline, and return the definition
 * and the original path unchanged:
 *
 *   - `hull` — rule 3, the one mass. `CreatureDef` has no plural hull and
 *     `creatureSpec` throws by name on a feature wearing a hull shape. A copy
 *     button that produced an unbuildable species would be a worse answer than a
 *     button that does nothing.
 *   - `eyes` and `legs` — rule 6. They are already two and four; a copy is the
 *     thing the placement kinds exist to make unsayable.
 *   - `ridge` — a row is a count, so a second ridge is `count`, not a copy.
 *
 * The copy inherits the original's `at`, so it lands exactly on top of it and the
 * user drags it off. That is deliberate: solving a polite offset would need the
 * part's measured extent, which is geometry, which is `creature.ts`'s.
 *
 * A tail's `chamfer` flag is NOT copied and is not unpacked either. It is a rule
 * about the rear-top chamfer of the hull, `extras` does not read it, and writing
 * out the 45-degree turn it stood for without the `at` that goes with it would
 * leave the copy facing a diagonal with no face to join to. The copy therefore
 * arrives at the donor transfer, unturned, which is a place — and the user drags
 * it from there.
 */
export function duplicatePart(
  def: CreatureDef, p: DefPath,
): { def: CreatureDef; path: DefPath } {
  const src = p.role === 'extras' ? def.extras?.[p.index] : isFeatureRole(p.role) ? def[p.role] : undefined
  if (src === undefined) return { def, path: p }
  const d = asDef(src)
  const stem = d.name ?? (p.role === 'extras' ? 'part' : ROLE_MESH_NAME[p.role as FeatureRole])
  const copy: PartDef & { name: string } = { ...d, name: uniqueExtraName(def, stem) }
  delete (copy as Chamfered).chamfer
  const extras = [...(def.extras ?? []), copy]
  return { def: { ...def, extras }, path: { role: 'extras', index: extras.length - 1 } }
}

/**
 * Mirror a part, or stop mirroring it. Rule 6, and nothing else.
 *
 * `kind: 'pair'` is ONE mesh placed twice — `at` is the +x copy and the -x copy
 * is derived from it by negating x and flipping the winding. **This never adds a
 * second part entry and there is no way to make it.** A user who wants an ear
 * higher on one side is asking for a thing the pack itself never did.
 *
 * `legs` (always a mirrored row), `eyes` (always a pair), `hull` (on the midline)
 * and `ridge` (whose chamfer and side rows mirror as a whole) have no `kind` and
 * return unchanged.
 */
export function setMirrored(def: CreatureDef, p: DefPath, mirrored: boolean): CreatureDef {
  if (p.role === 'hull' || p.role === 'legs' || p.role === 'eyes' || p.role === 'ridge') return def
  return editPart(def, p, d => ({ ...d, kind: mirrored ? 'pair' : 'single' }))
}

/**
 * Remove a part.
 *
 * `legs` and `eyes` are GIVEN — a definition that omits them still gets them — so
 * removing one is writing `false`, which is the only way to say a species has
 * none. Every other role is optional, so removing it is deleting the key. An
 * extra is spliced out, and the `extras` key goes with the last one.
 *
 * `hull` cannot be removed: rule 3 is one mass, and a species without it is not a
 * species. Returns unchanged.
 *
 * Note that deleting a `snout` a `nose` was anchored to is safe — `creature.ts`
 * only wires `on: 'snout'` when a snout was actually placed, so the nose falls
 * back to the donor transfer against the hull rather than throwing.
 */
export function deletePart(def: CreatureDef, p: DefPath): CreatureDef {
  if (p.role === 'hull') return def
  if (p.role === 'legs') return { ...def, legs: false }
  if (p.role === 'eyes') return { ...def, eyes: false }
  if (p.role === 'ridge') {
    const out = { ...def }
    delete out.ridge
    return out
  }
  if (p.role === 'extras') {
    const extras = (def.extras ?? []).filter((_, i) => i !== p.index)
    const out = { ...def }
    if (extras.length === 0) delete out.extras
    else out.extras = extras
    return out
  }
  return withFeature(def, p.role, undefined)
}

/* ------------------------------------------------------------- warnings --- */

/**
 * The things that make these animals a family, named.
 *
 * Not rules — the rules are in `docs/building-animals-from-parts.md` and the ones
 * that can be enforced are enforced by `creatureSpec`, which throws. These are
 * the ones an editor can only observe: a violation is legal, buildable, and
 * usually invisible in a single screenshot, and shows up as a pack that has
 * stopped looking like one.
 */
export type Axiom = 'one-mass' | 'eye-size' | 'placement' | 'scale' | 'palette-order'

export interface Warning {
  axiom: Axiom
  /** `note` — worth knowing. `warn` — worth defending. `loud` — Joe should see it. */
  severity: 'note' | 'warn' | 'loud'
  path?: DefPath
  text: string
}

const isStretched = (s: Vec3 | undefined): s is Vec3 =>
  s !== undefined && (s[0] !== 1 || s[1] !== 1 || s[2] !== 1)

/** How far from 1 the worst component is, in either direction. */
function peakFactor(s: Vec3): number {
  let peak = 1
  for (const v of s) {
    const f = v > 0 ? (v >= 1 ? v : 1 / v) : Infinity
    if (f > peak) peak = f
  }
  return peak
}

const uniform = (s: Vec3): boolean => s[0] === s[1] && s[1] === s[2]

const shownAs = (s: Vec3): string =>
  uniform(s) ? `uniform ${s[0].toFixed(2)}x` : `NON-UNIFORM [${s.map(v => v.toFixed(3)).join(', ')}]`

/**
 * Every axiom this definition strains, worst first within each axiom.
 *
 * `baseline` is the palette this definition started from — the version on disk,
 * or the state the editor opened with. It is the only way `palette-order` can be
 * checked at all, because insertion order is only wrong RELATIVE to what the
 * texture was already laid out as. Pass the previous `CreatureDef`, or just its
 * slot names in order. Omit it and the other four axioms are still checked.
 */
export function warningsFor(
  def: CreatureDef, baseline?: CreatureDef | readonly string[],
): Warning[] {
  const out: Warning[] = []
  const hull = typeof def.hull === 'string' ? { part: def.hull } : def.hull ?? {}
  const hullPart = hull.part ?? DEFAULT_HULL_PART

  /* --- one mass. Rule 3, and the fault that scrapped 72 animals ---------- */
  const massy: { path: DefPath; label: string; part: string }[] = []
  for (const role of FEATURE_ROLES) {
    const v = def[role]
    if (v !== undefined && HULL_SHAPES.has(asDef(v).part)) {
      massy.push({ path: { role } as DefPath, label: role, part: asDef(v).part })
    }
  }
  for (let i = 0; i < (def.extras?.length ?? 0); i++) {
    const e = def.extras![i]!
    if (HULL_SHAPES.has(e.part)) massy.push({ path: { role: 'extras', index: i }, label: e.name, part: e.part })
  }
  if (def.ridge && HULL_SHAPES.has(def.ridge.part)) {
    massy.push({ path: { role: 'ridge' }, label: 'ridge', part: def.ridge.part })
  }
  for (const m of massy) {
    out.push({
      axiom: 'one-mass',
      severity: 'loud',
      path: m.path,
      text: `"${m.label}" wears ${m.part}, which the pack used as a HULL — so this species has `
        + `two masses (${hullPart} and ${m.part}). One mass: a head box beside a body box is `
        + 'what scrapped the 72, and there is no seam at the neck on any of the 24 originals.',
    })
  }

  /* --- eye size. Absolute across the pack, and never a proportion -------- */
  const eyesRaw = def.eyes as unknown
  if (eyesRaw && typeof eyesRaw === 'object') {
    const s = (eyesRaw as { stretch?: Vec3 }).stretch
    if (isStretched(s)) {
      out.push({
        axiom: 'eye-size',
        severity: 'loud',
        path: { role: 'eyes' },
        text: `the eye card carries a stretch (${shownAs(s)}). Rule 5: eye size is ABSOLUTE across `
          + 'all 48 cards in the pack, which is why `CreatureDef.eyes` has no `stretch` field to '
          + 'reach for. A card that scales with the head is the single fastest way to make an '
          + 'animal stop looking like one of these animals.',
      })
    }
  }
  for (let i = 0; i < (def.extras?.length ?? 0); i++) {
    const e = def.extras![i]!
    if (EYE_SHAPES.has(e.part) && isStretched(e.stretch)) {
      out.push({
        axiom: 'eye-size',
        severity: 'loud',
        path: { role: 'extras', index: i },
        text: `"${e.name}" is an EYE CARD (${e.part}) carrying a stretch (${shownAs(e.stretch!)}). `
          + 'Rule 5: eye size is absolute across the pack. Every one of the 48 cards is the same '
          + 'size; none of them is scaled.',
      })
    }
  }

  /*
   * --- placement. There is NO hull-stretch warning, and its absence is the point.
   *
   * Two warnings used to live here and just below: a `placement` one for a hull
   * stretched without a `stretchWhy`, and a `scale` one for any hull stretch at
   * all. Both are now warnings about a state nothing can reach — `HullDef.stretch`
   * is typed `never` (see `Hull` in `assembly.ts`), `setStretch` refuses the hull
   * outright, and `creatureSpec` throws by name on one smuggled in through a cast.
   * A warning about the unreachable is noise, and worse than noise here: it teaches
   * Joe that the dial exists.
   *
   * The `scale` pass below therefore starts at the FEATURES, which is where a
   * stretch is still sayable and still worth a word — §3 measured ears at 2.97x and
   * snouts at 2.90x of natural variation, so those two have a real range and
   * nothing else does.
   */

  /* --- scale. Rule 4 is placement by translation; a stretch is notable --- */
  const scaled: { path: DefPath; label: string; stretch: Vec3; safe: boolean }[] = []
  for (const role of FEATURE_ROLES) {
    const v = def[role]
    if (v === undefined) continue
    const d = asDef(v)
    if (isStretched(d.stretch)) {
      scaled.push({
        path: { role } as DefPath, label: `"${d.name ?? ROLE_MESH_NAME[role]}"`, stretch: d.stretch!,
        safe: role === 'ears' || role === 'snout',
      })
    }
  }
  for (let i = 0; i < (def.extras?.length ?? 0); i++) {
    const e = def.extras![i]!
    if (isStretched(e.stretch)) {
      scaled.push({ path: { role: 'extras', index: i }, label: `"${e.name}"`, stretch: e.stretch!, safe: false })
    }
  }
  for (const s of scaled) {
    const peak = peakFactor(s.stretch)
    const note = s.safe && peak < 3
    out.push({
      axiom: 'scale',
      severity: note ? 'note' : 'warn',
      path: s.path,
      text: `${s.label} carries a stretch, ${shownAs(s.stretch)}. `
        + (s.safe
          ? `§3 measured natural variation of 2.97x on ears and 2.90x on snouts, so up to 3x here `
            + `is the pack's own range${note ? '' : ` — and ${peak.toFixed(2)}x is past it`}.`
          : 'Rule 4 is placement by TRANSLATION: exactly one node in the pack\'s 133 carries a '
            + 'scale at all. §3 measured stretch as safe on ears and snouts and says so about '
            + 'those two kinds only.')
        + (uniform(s.stretch)
          ? ' It is uniform, so the shape is unchanged and only its size is.'
          : ' It is NON-UNIFORM, so the authored proportions of the shape itself are changed — '
            + 'which is the thing Joe rejected by name on the hedgehog\'s hull.'),
    })
  }

  /* --- palette order. Insertion order IS the texture layout -------------- */
  if (baseline !== undefined) {
    const was = Array.isArray(baseline) ? [...baseline] : Object.keys((baseline as CreatureDef).palette)
    const now = Object.keys(def.palette)
    const gone = was.filter(s => !now.includes(s))
    if (gone.length > 0) {
      out.push({
        axiom: 'palette-order',
        severity: 'loud',
        text: `palette slot${gone.length > 1 ? 's' : ''} ${gone.map(s => `"${s}"`).join(', ')} `
          + 'removed. Insertion order IS the texture layout — slot n is atlas column n — so every '
          + 'slot after a removed one shifts down a column and every part painted from one is '
          + 'repainted, silently. Appending is the only safe change to a palette\'s shape.',
      })
    }
    const kept = was.filter(s => now.includes(s))
    const order = now.filter(s => kept.includes(s))
    if (kept.join(' ') !== order.join(' ')) {
      out.push({
        axiom: 'palette-order',
        severity: 'loud',
        text: `the palette was REORDERED: ${kept.join(', ')} -> ${order.join(', ')}. Insertion order `
          + 'IS the texture layout, so this repaints every part whose slot moved, without changing '
          + 'a single colour. Append instead.',
      })
    }
  }

  return out
}

/* -------------------------------------------------------- the copy seam --- */

/** A deep copy that preserves every object's key ORDER, because one of them is data. */
function deepCopy<T>(v: T): T {
  if (Array.isArray(v)) return v.map(deepCopy) as unknown as T
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    /* `Object.keys` is insertion order for string keys, and `palette`'s insertion
     * order IS the texture layout — so this loop is the whole guarantee. */
    for (const k of Object.keys(v as Record<string, unknown>)) {
      out[k] = deepCopy((v as Record<string, unknown>)[k])
    }
    return out as T
  }
  return v
}

/**
 * Copy an animal so it can be edited into a different one.
 *
 * Deep, so the copy shares no array and no nested object with the original and an
 * edit to one cannot reach the other. Order-preserving, because
 * `CreatureDef.palette`'s insertion order is the texture layout and a copy that
 * rebuilt it in any other order would be a different animal wearing the same
 * numbers.
 *
 * **`newSpeciesId` does not land anywhere in the returned definition, because a
 * `CreatureDef` has no id field.** The id is `defineCreature`'s first argument
 * and `defToModuleSource`'s — it belongs to the MODULE, not to the definition, so
 * a definition is genuinely portable between species and this function is the
 * seam that says so. It is taken here because the id is what makes a copy a new
 * animal rather than a duplicate of an old one, and a call site that has to name
 * it is a call site that has decided.
 */
export function cloneAs(def: CreatureDef, newSpeciesId: string): CreatureDef {
  if (newSpeciesId.trim() === '') {
    throw new Error(
      'cloneAs: a copy needs a species id — it is what tells the new animal from the one it '
      + 'was copied from, and `defToModuleSource` needs it to name the module and the const.',
    )
  }
  return deepCopy(def)
}

/**
 * The authoring definition for a species already on the register — and today it
 * is always `null`.
 *
 * **Only the COMPILED build is reachable, never the source definition.** A
 * species file is `export const X_ASSEMBLY = defineCreature('animal-x', { ... })`:
 * the `CreatureDef` is an object literal passed straight in, and what comes back
 * out and gets exported and registered is the `AssemblyBuild`. Nothing keeps the
 * definition, so there is nothing here to find. `grep -rn CreatureDef src/`
 * returns the type and its doc comments and no value at all.
 *
 * **And it is not reconstructed from the build, deliberately.** The definition's
 * whole point is what it does NOT say — `creature.ts` solves the leg row, the eye
 * plane, the donor transfer and all five ridge rows, and the build is that
 * arithmetic already done. Going backwards would mean guessing which of ~40
 * numbers were written by a human and which were derived, and every guess wrong
 * in the derived direction hard-codes a number that is currently a DERIVATION and
 * would stop tracking the hull it came from. A twenty-spike hedgehog would come
 * back as twenty extras rather than as `ridge: { count: 4 }`, which is not the
 * hedgehog's definition; it is a different definition that builds the same mesh
 * today and diverges the moment anything is edited.
 *
 * So: `null`, and the editor opens a species by being GIVEN its definition — from
 * a file the caller read, or from `cloneAs` of one it already has. The register
 * is consulted only so the answer distinguishes a species this kit does not build
 * from one it builds and whose definition is simply not kept.
 *
 * If this needs to return something, the fix is upstream and small: have
 * `defineCreature` register the `def` beside the build it returns.
 */
export function defFrom(speciesId: string): CreatureDef | null {
  const built = assemblyFor(speciesId)
  if (built === undefined) return null
  /* Registered, built, on screen — and its definition was never kept. */
  return null
}

/* ---------------------------------------------------------- round-trip --- */

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const INDEX = /^\d+$/

const quote = (s: string): string =>
  `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`

const key = (k: string): string => (IDENT.test(k) || INDEX.test(k) ? k : quote(k))

const numLit = (n: number): string => String(round6(n))

const hexLit = (n: number): string => `0x${rgb24(n).toString(16).padStart(6, '0')}`

/** One value as TypeScript source, on one line. `undefined` never appears. */
function inlineLit(v: unknown): string {
  if (typeof v === 'number') return numLit(v)
  if (typeof v === 'string') return quote(v)
  if (typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return `[${v.map(inlineLit).join(', ')}]`
  if (v && typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined)
    return entries.length === 0 ? '{}' : `{ ${entries.map(([k, x]) => `${key(k)}: ${inlineLit(x)}`).join(', ')} }`
  }
  return 'undefined'
}

const WIDTH = 88

/** One value as source, spilling onto several lines only when it has to. */
function blockLit(v: unknown, indent: string): string {
  const flat = inlineLit(v)
  if (indent.length + flat.length <= WIDTH) return flat
  const inner = `${indent}  `
  if (Array.isArray(v)) {
    return `[\n${v.map(x => `${inner}${blockLit(x, inner)},`).join('\n')}\n${indent}]`
  }
  if (v && typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined)
    return `{\n${entries.map(([k, x]) => `${inner}${key(k)}: ${blockLit(x, inner)},`).join('\n')}\n${indent}}`
  }
  return flat
}

/**
 * A long string as a wrapped concatenation, which is how `flag` reads in the
 * species files already on disk.
 */
function wrappedString(k: string, s: string, indent: string): string {
  const head = `${indent}${k}: `
  if (head.length + s.length + 3 <= WIDTH) return `${head}${quote(s)},`
  const cont = `${indent}  + `
  const chunks: string[] = []
  let line = ''
  for (const word of s.split(' ')) {
    const room = (chunks.length === 0 ? head.length : cont.length) + line.length + word.length + 3
    if (line !== '' && room > WIDTH) {
      chunks.push(line)
      line = ''
    }
    line += line === '' ? word : ` ${word}`
  }
  if (line !== '') chunks.push(line)
  return chunks
    .map((c, i) => (i === 0 ? `${head}${quote(c + ' ')}` : `${cont}${quote(c + (i === chunks.length - 1 ? '' : ' '))}`))
    .join('\n') + ','
}

/** `CreatureDef`'s own field order, so an emitted file reads like a written one. */
const DEF_KEYS = [
  'palette', 'coat', 'under', 'limb', 'hull', 'belly', 'legs', 'eyes',
  'ears', 'tail', 'snout', 'nose', 'ridge', 'extras', 'flag',
] as const

/** `animal-hedgehog` -> `HEDGEHOG_ASSEMBLY`. The convention every species file uses. */
export const assemblyConstName = (speciesId: string): string =>
  `${speciesId.replace(/^animal-/, '').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase()}_ASSEMBLY`

/**
 * Emit the exact text of `src/island/species/parts/assembled/animal-<slug>.ts`.
 *
 * This is how an edit LEAVES the editor. The workbench does not write `src/`
 * itself, so the round trip ends with a human pasting this into a file and
 * reading it — which is the point, because a species file is where the reasoning
 * for every number lives, and a generator cannot write that. The comments in an
 * existing file are not reproduced and must not be lost: edit the definition
 * block, keep the prose.
 *
 * **LF, and a trailing newline.** The repo's gates read bytes.
 *
 * The pupil is emitted as its literal hex rather than as `PACK_PUPIL`, because
 * `texture.ts` (where that constant lives) imports three.js and this file is
 * deliberately free of it. A comment beside the slot says where the number came
 * from; `creatureSpec` compares the number, so the emitted file behaves
 * identically either way.
 */
export function defToModuleSource(speciesId: string, def: CreatureDef): string {
  const name = assemblyConstName(speciesId)
  const pupilSlot = def.eyes === false ? undefined : def.eyes?.pupil ?? 'pupil'
  const lines: string[] = []

  lines.push('/**')
  lines.push(` * ${speciesId}'s assembly, as a DEFINITION. One species, one file.`)
  lines.push(' *')
  lines.push(' * Written out of the species editor. Everything below is what makes this')
  lines.push(' * species this species; the hull, the legs, the eye cards and every measured')
  lines.push(' * default are `defineCreature`\'s and are deliberately not repeated here.')
  lines.push(' *')
  lines.push(' * The numbers are the pack\'s. Say WHERE EACH ONE CAME FROM, here, beside it —')
  lines.push(' * a definition without its derivations is a definition nobody can check, and')
  lines.push(' * this generator cannot write that part.')
  lines.push(' */')
  lines.push("import { defineCreature } from '../creature'")
  lines.push('')
  lines.push(`export const ${name} = defineCreature(${quote(speciesId)}, {`)

  /* The palette, one slot a line: it is the texture layout, so it is read down. */
  lines.push('  palette: {')
  for (const slot of Object.keys(def.palette)) {
    const tail = slot === pupilSlot
      ? "  // the pack's own measured pupil; see texture.ts"
      : ''
    lines.push(`    ${key(slot)}: ${hexLit(def.palette[slot]!)},${tail}`)
  }
  lines.push('  },')

  const rest = DEF_KEYS.filter(k => k !== 'palette' && def[k] !== undefined)
  if (rest.length > 0) lines.push('')
  for (const k of rest) {
    const v = def[k] as unknown
    if (k === 'flag' && typeof v === 'string') lines.push(wrappedString(k, v, '  '))
    else lines.push(`  ${k}: ${blockLit(v, '  ')},`)
  }

  lines.push('})')
  return lines.join('\n') + '\n'
}
