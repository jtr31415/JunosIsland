/**
 * `defineCreature` — a species as ten lines, and the ten rules as code that runs.
 *
 * Joe, 29 July, on what an animal was costing:
 *
 * > its still pretty slow, I expect around 1 min per animal. legs and eyes are
 * > given colour is a short call, then add the remaining features. its currently
 * > like 1hr per animal. can we not set up a script and the agent just provides
 * > the script definitions? like build a tool to build the animals more
 * > deterministically?
 *
 * He is right, and the diagnosis in his sentence is the design of this file.
 * **"Legs and eyes are given"** — so they are DEFAULTS here, not parameters, and
 * a definition that says nothing about them still gets the pack's own four legs
 * on the pack's own leg row and two eye cards on the pack's own eye plane.
 * **"Colour is a short call"** — so the palette is the one thing every definition
 * must carry, and every other slot resolves off it. **"Then add the remaining
 * features"** — so a definition is, literally, the list of things that make this
 * species and nothing else.
 *
 * `docs/building-animals-from-parts.md` is still the spec. `assembly.ts` is still
 * the kit. This is the layer between them: it turns a short `CreatureDef` into
 * the `AssemblyBuild` an agent used to type by hand, and it does the arithmetic
 * that was being redone per species — the donor transfer (§8), the chamfer idiom
 * (§8), the leg row (§0), the eye plane (rule 5).
 *
 * ## What a MINIMAL definition is
 *
 * ```ts
 * export const X_ASSEMBLY = defineCreature('animal-x', {
 *   palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, nose: 0x4e361d },
 * })
 * ```
 *
 * Four colours and a name, which is what Joe asked for, and it produces a
 * plausible creature: the 1.250 cube 14 of the 24 originals share, on four
 * `box-01` legs at their measured burial on the row that never moves, with two
 * `plate-01` eye cards at the pack's own absolute z = 0.6350 and its own measured
 * pupil grey. `tests/island/assembly-creature.test.ts` asserts exactly that, on a
 * definition that is exactly the four lines above.
 *
 * ## How the rules are enforced
 *
 * A rule the tool enforces never has to be remembered again. Where a violation
 * could be made not to compile it is; where it could not, it throws AT DEFINITION
 * TIME — which is module load, so a bad species takes the import down rather than
 * appearing wrong on a screen. In rough order of how much the enforcement buys:
 *
 *   - **Rule 3, one mass** — `CreatureDef` has no plural hull, and a feature that
 *     wears a shape the pack used as a hull throws by name. That is the exact
 *     fault that scrapped the 72: a head box beside a body box.
 *   - **Rule 5, absolute face features** — an eye's `z` cannot be set (it is
 *     `EYE_CARD_Z`, always), an eye has no `stretch` field to reach for, and its
 *     `sink` is 0 and not a parameter. Rule 5 is not enforced by review here; it
 *     is unsayable.
 *   - **Rule 6, paired parts mirrored from one mesh** — ears and eyes are `pair`
 *     placements and there is no way to place a left one and a right one
 *     independently. A ridge row mirrors as a whole.
 *   - **The hull is the standard size** — `HullDef` has no `stretch` to reach for,
 *     so the only way to change a body's proportions is to name a different real
 *     shell. Joe raised body size twice; the second time is why it is unsayable
 *     rather than discouraged. See `Hull` in `assembly.ts` and `OTHER_HULLS`.
 *   - **Rule 4, no placed node carries a transform** — inherited from
 *     `assembly.ts`, where a `Placement` is positions and nothing else. A spin is
 *     baked into the copy's vertices.
 *   - **Rule 9, the budget** — the triangle count is EXACT before anything is
 *     built (welding removes vertices, never triangles), so a definition over the
 *     pack's measured 422-951 throws unless its own `flag` says `RULE 9`. The
 *     hedgehog's does; that is what the escape clause looks like when it is
 *     working.
 *   - **Rule 1, adapt before authoring** — a `bespoke-*` part throws unless the
 *     definition's `flag` says `RULE 1`. `authored.ts` is disjoint from
 *     `PARTS_BANK`, so nothing can reach one by search.
 *   - **Rule 8, one hue per part** — a paint naming a slot the palette does not
 *     have throws here rather than at build.
 *   - **§3, nothing floats** — a ridge whose outer stations would leave the hull
 *     throws with the bound and the reason. §8 step 4 in code.
 *   - **The pupil** — a definition whose pupil slot is not `PACK_PUPIL` throws.
 *     Joe's note about the crass black was about every animal built this way.
 *
 * Two could only be enforced at runtime and are left to the harness: the height
 * band (it needs the built bounding box) and the vertex budget (welding makes a
 * static count an upper bound only). Two cannot be enforced at all, because they
 * are judgements: rule 2's chamfer cut and rule 10's silhouette.
 *
 * ## Determinism
 *
 * Same definition in, same creature out — nothing here reads a clock, a random
 * source or a module-load order. That is what lets `fingerprint.ts` pin a species
 * and catch drift, and it is what makes a correction HERE improve every animal at
 * once. The pupil fix should have been that kind of change and was not.
 */
import { partById, PARTS_BANK, type BakedPart } from './bank.generated'
import { authoredById } from './authored'
import { PACK_PUPIL, SLOT_PX } from './texture'
import { LEG_ROW, EYE_CARD_Z, MODEL_TRIS_MAX } from './hulls'
import { defineAssembly } from './assembled/register'
import { resolveMotion, type MotionDef } from './motion'
import { spinVec } from './assembly'
import type {
  AssemblyBuild, Axis, Feature, Paint, Placement, Spin, Vec3,
} from './assembly'

/* ------------------------------------------------------------ the shape --- */

/** A palette slot name, or the full `Paint` block when a part is two-tone. */
export type PaintLike = string | Paint

/**
 * One feature, as a species says it: which shape, and only what differs from the
 * pack's own answer.
 *
 * Every field except `part` has a measured default. `sink` is the shape's own
 * `attachment.sunkFractionMean` — the depth its donor actually used — and `at` is
 * THE DONOR TRANSFER (§8): join the copy at the face of THIS hull that the donor
 * joined it to, and take the two coordinates the join does not move from the
 * bank's recorded offset for the shape. Both are recoveries rather than choices,
 * which is why a definition that gives neither is still making a claim it can
 * defend.
 */
export interface PartDef {
  /** A bank id — `box-25`, `wedge-07`. Never a species name. */
  part: string
  /** A slot name, or a `Paint`. Defaults to the role's own slot (see `CreatureDef`). */
  paint?: PaintLike
  /** Defaults to the shape's own measured `sunkFractionMean`. */
  sink?: number
  /** Rule 4 as amended: baked into the copy's vertices, never a node transform. */
  spin?: readonly Spin[]
  /** Rule 1. Safe for ears and snouts (§3 measured 2.97x and 2.90x); think twice elsewhere. */
  stretch?: Vec3
  /** The JOIN point. Defaults to the donor transfer against this hull. */
  at?: Vec3
  /**
   * Join to the outer face of another feature instead of to the hull.
   *
   * The plan called a feature that cannot attach to a feature "the highest-risk
   * gap": a nose on a snout, a tuft on an ear tip, is arithmetic every agent
   * redoes by hand and some get wrong SILENTLY — the build does not throw, the
   * part just floats or buries. This closes it. The anchor is the named feature's
   * placed centre plus its own extent along its own facing, measured off the
   * built vertices, so it is exact rather than approximate.
   */
  on?: string
  /** Mesh name. Defaults to the role. */
  name?: string
  /** Override the shape's measured attachment axis. The tortoise-hoop trick. */
  axis?: Axis
  /** Override the shape's measured attachment direction. */
  dir?: 1 | -1
  /** `single` or `pair`. Defaults per role: ears pair, tail and snout single. */
  kind?: 'single' | 'pair'
}

/** A part named on its own is `{ part: it }`. */
export type PartLike = string | PartDef

/**
 * A row of the chamfer idiom (§8), by which face it sits on.
 *
 * `top` is the flat top face, `side` the two flat side faces, `chamfer` the two
 * edge chamfers between them. Their facings are then 0, +/-45 and +/-90 degrees
 * around the body — five even steps through a half turn, which is what makes a
 * cubic back read as CURVED rather than as three flat planes. That is Joe's own
 * stated intent for the hedgehog and the acceptance test for the idiom.
 */
export type RidgeRow = 'top' | 'chamfer' | 'side'

/**
 * A repeat-and-sink run: N copies of one shape along a line, on one or more of
 * the hull's faces and the chamfers between them.
 *
 * §3.1 is Joe's — "the hog ears could potentially double up as dragon or croc
 * back ridges as well as hedgehog spikes (if added sunk into the torso, say 6 on
 * each side" — and §8 is his again, the five rows that make a cube read round.
 * **The hedgehog's twenty spikes are this, in two lines.** That was the design
 * target for the whole of this file: if the sugar could not say them shortly, the
 * sugar was wrong.
 */
export interface RidgeDef {
  part: string
  paint?: PaintLike
  sink?: number
  /** Applied FIRST, before each row's own turn onto its face. */
  spin?: readonly Spin[]
  /** Mesh name stem. Rows are `<name>-top`, `<name>-chamfer`, `<name>-side`. */
  name?: string
  /** Copies per row. */
  count: number
  /** Defaults to all three: the two flat faces and the chamfers between them. */
  rows?: readonly RidgeRow[]
  /**
   * Half the row's length along z. Defaults to the widest the pack's own 1/16
   * grid allows while every station stays EMBEDDED — see `ridgeSpan`.
   */
  span?: number
}

/** The one mass. Singular, and there is no way to say "and another". */
export interface HullDef {
  /** A bank id with the `hull` role. Defaults to `box-03`, the 1.250 cube. */
  part?: string
  /** Defaults to the bank's recorded offset for the shape — where the pack puts it. */
  at?: Vec3
  /** Paint. Defaults to the coat slot, plus the belly patch when `belly` is set. */
  paint?: PaintLike
  /**
   * There is no hull stretch — see `Hull` in `assembly.ts` for Joe's ruling.
   *
   * `never`, so a species cannot write one; `creatureSpec` throws as well, for a
   * definition that arrived as data. A body that wants other proportions takes a
   * different REAL shell: `hull: OTHER_HULLS.wider` and the rest.
   */
  stretch?: never
  /** Nor a reason for one. The dial is gone, so the excuse for it is too. */
  stretchWhy?: never
}

/**
 * A whole species, as short as it can honestly be.
 *
 * Only `palette` is required. Everything else either has a measured default or is
 * a thing this species has and others do not.
 */
export interface CreatureDef {
  /**
   * Slot name -> colour. INSERTION ORDER IS THE TEXTURE LAYOUT, so it is data.
   *
   * A `pupil` slot is appended with the pack's own measured grey if the
   * definition does not carry one. Give it explicitly to control where in the
   * layout it sits.
   */
  palette: Readonly<Record<string, number>>

  /** The slot the body is painted from. Defaults to `coat`, or the first slot. */
  coat?: string
  /** The pale slot: the belly patch, the sclera, an inner ear. Defaults to `belly`, else the coat. */
  under?: string
  /** The slot legs and a muzzle are painted from. Defaults to `limb`, else the coat. */
  limb?: string

  /** Defaults to the 1.250 cube at its own recorded offset. */
  hull?: string | HullDef
  /**
   * §4's second way to two-tone: a pale underside PAINTED into the coat's cell,
   * at this fraction of the hull's own height. No geometry, no split triangle.
   * Must be k/16 — the pack's own authoring grid.
   */
  belly?: number

  /** Four legs on the row that never moves. `false` for a legless species. */
  legs?: false | { x?: number; z?: number; paint?: PaintLike; name?: string }
  /**
   * Two eye cards. **`z` is not a field**: it is `EYE_CARD_Z`, always, and there
   * is no `stretch` and no `sink` either. Rule 5, made unsayable.
   */
  eyes?: false | { part?: string; x?: number; y?: number; paint?: string; pupil?: string }

  /** A pair, on the face the donor wore them on. */
  ears?: PartLike
  /** One, off the back. `chamfer: true` carries it UP the rear chamfer instead. */
  tail?: PartLike | (PartDef & { chamfer?: boolean })
  /** One, on the front face, at the donor's own height. */
  snout?: PartLike
  /** One, on the snout's own front if there is a snout, else on the hull's. */
  nose?: PartLike
  /** Repeat-and-sink: spikes, warts, ridges, scutes, a frill. */
  ridge?: RidgeDef

  /** Anything the roles above do not name. Each needs its own `name`. */
  extras?: readonly (PartDef & { name: string })[]

  /**
   * How this species MOVES. Joe, 29 July: *"the wings are currently animated.
   * can that be done deterministically as well, or specified in the editor."*
   *
   * A short list of named motions — `flap`, `wag`, `bob`, `twitch` — each naming
   * the FEATURES it moves and, if the kind's measured default is wrong for this
   * animal, an amplitude or a period. `motion: [{ kind: 'flap', parts: ['wing']
   * }]` is the whole of a bee's wingbeat.
   *
   * Omit it and the species stands still, which is what every species built
   * before this field existed does — so this changes no animal that does not ask
   * for it. Every name is checked against the features this species actually has
   * AT DEFINITION TIME; see `motion.ts`, which is also where the measurement of
   * where the wing motion currently comes from is written down.
   */
  motion?: readonly MotionDef[]

  /** §2's escape clause, in Joe's direction, one sentence. */
  flag?: string
}

/* -------------------------------------------------------------- measure --- */

type P3 = [number, number, number]

/** A part's built points: stretched and spun, exactly as `bakeGeometry` will. */
function builtPoints(p: BakedPart, stretch: Vec3, spins: readonly Spin[]): P3[] {
  const out: P3[] = []
  for (const vi of new Set(p.indices)) {
    out.push(spinVec([
      p.positions[vi * 3]! * stretch[0],
      p.positions[vi * 3 + 1]! * stretch[1],
      p.positions[vi * 3 + 2]! * stretch[2],
    ], spins))
  }
  return out
}

/** How far a point set runs along a direction. The same projection `assembly.ts` takes. */
function span(pts: readonly P3[], f: readonly number[]): { lo: number; hi: number; extent: number } {
  let lo = Infinity, hi = -Infinity
  for (const p of pts) {
    const d = p[0] * f[0]! + p[1] * f[1]! + p[2] * f[2]!
    if (d < lo) lo = d
    if (d > hi) hi = d
  }
  return { lo, hi, extent: hi - lo }
}

const AX: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

/** Half the extent along one axis. */
const half = (pts: readonly P3[], a: 0 | 1 | 2): number =>
  Math.max(...pts.map(p => Math.abs(p[a])))

/**
 * How far a face reaches along another axis — the flat part of it, before the
 * chamfer starts falling away.
 *
 * This is the measurement §8 says costs a whole row when it is assumed instead:
 * `box-03` cuts every EDGE and every CORNER, so its 32 welded points are the
 * permutations of (+/-0.625, +/-0.3125, +/-0.3125) and (+/-0.5, +/-0.5, +/-0.5),
 * each flat face is only **0.625 square**, and the chamfer midpoint is 0.46875
 * rather than the 0.5625 you get from assuming a 1.000-wide face. Measured, never
 * assumed.
 */
function inset(pts: readonly P3[], face: 0 | 1 | 2, along: 0 | 1 | 2): number {
  const h = half(pts, face)
  let out = 0
  for (const p of pts) {
    if (Math.abs(Math.abs(p[face]) - h) > 1e-6) continue
    const v = Math.abs(p[along])
    if (v > out) out = v
  }
  return out
}

/**
 * The hull, measured: where its faces are and where its chamfers really are.
 *
 * Everything a definition does not say is solved off this. It is derived from the
 * hull's own vertices at call time rather than tabulated, so a species on a
 * different hull gets that hull's numbers without anybody transcribing them.
 */
export interface HullFrame {
  part: BakedPart
  at: Vec3
  /** Half-extents of the shell itself. A hull is never scaled, so these are its own. */
  half: P3
  /** World y of the top face, world z of the front and rear, world x of the side. */
  top: number; bottom: number; front: number; rear: number; side: number
  /** Chamfer midpoints, as offsets from the centre: [x on the x/y edge, y, z on the y/z edge]. */
  chamXY: [number, number]
  chamYZ: [number, number]
  /** How far the flat TOP face reaches in z before the chamfer starts. */
  topFlatZ: number
}

function hullFrame(part: BakedPart, at: Vec3): HullFrame {
  /* No stretch argument, because there is no hull stretch: every face, chamfer and
   * inset below is the shell's own, measured off the bank's own vertices. */
  const pts = builtPoints(part, [1, 1, 1], [])
  const hx = half(pts, 0), hy = half(pts, 1), hz = half(pts, 2)
  return {
    part,
    at,
    half: [hx, hy, hz],
    top: at[1] + hy,
    bottom: at[1] - hy,
    front: at[2] + hz,
    rear: at[2] - hz,
    side: at[0] + hx,
    chamXY: [(hx + inset(pts, 1, 0)) / 2, (hy + inset(pts, 0, 1)) / 2],
    chamYZ: [(hy + inset(pts, 2, 1)) / 2, (hz + inset(pts, 1, 2)) / 2],
    topFlatZ: inset(pts, 1, 2),
  }
}

/* --------------------------------------------------------------- errors --- */

const RULES = 'docs/building-animals-from-parts.md'

function fail(id: string, rule: string, what: string, instead: string): never {
  throw new Error(
    `${id}: ${rule} — ${what}. ${instead} (${RULES})`,
  )
}

/* ---------------------------------------------------------- the builder --- */

const asDef = (p: PartLike): PartDef => (typeof p === 'string' ? { part: p } : p)
const asPaint = (p: PaintLike): Paint => (typeof p === 'string' ? { base: p } : p)

/** Where a feature already placed presents its outer face, for `on`. */
interface Anchor { at: P3 }

/**
 * The widest a ridge row can be and still have every station embedded.
 *
 * §8 step 4, which is §3's "nothing floats" as arithmetic: a flat face ends and
 * the chamfer falls away 1:1, so a part joined at the nominal plane and buried
 * `d` below it leaves the hull once its station passes `flatHalf + d`. Inside
 * that bound the spacing is snapped DOWN to the pack's own 1/16 grid, so every
 * station is a number that can be quoted back at Kenney — which on the hedgehog
 * gives 4/16 spacing and stations at +/-0.375 and +/-0.125, the hand-built
 * animal's own.
 */
export function ridgeSpan(bound: number, count: number): number {
  if (count <= 1) return 0
  const step = Math.floor((bound * 2 / (count - 1)) * SLOT_PX) / SLOT_PX
  return (step * (count - 1)) / 2
}

/**
 * Turn a definition into an `AssemblyBuild` and check every rule that can be
 * checked without building it. Registers nothing.
 *
 * Separate from `defineCreature` so a TEST can exercise a definition — including
 * the ones that are supposed to throw — without putting an invented species on
 * the bench that `assembledSpecies()` would then have to answer for.
 */
export function creatureSpec(id: string, def: CreatureDef): AssemblyBuild {
  /* ---- the palette, and the pupil Joe corrected once for every animal ---- */
  const givenPupil = def.eyes === false ? undefined : def.eyes?.pupil ?? 'pupil'
  const palette: Record<string, number> = { ...def.palette }
  if (givenPupil !== undefined && palette[givenPupil] === undefined) {
    palette[givenPupil] = PACK_PUPIL
  }
  const slots = Object.keys(palette)
  if (slots.length === 0) fail(id, 'RULE 8', 'the palette is empty', 'A species is at least its colours.')
  if (givenPupil !== undefined && palette[givenPupil] !== PACK_PUPIL) {
    fail(id, 'THE PUPIL', `slot "${givenPupil}" is not the pack's own measured pupil`,
      'It is PACK_PUPIL (#4c4f5e), measured off 544 real eye texels — Joe\'s note was about '
      + 'every animal built this way, not about one of them. See texture.ts.')
  }

  const coat = def.coat ?? (palette['coat'] !== undefined ? 'coat' : slots[0]!)
  const under = def.under ?? (palette['belly'] !== undefined ? 'belly' : coat)
  const limb = def.limb ?? (palette['limb'] !== undefined ? 'limb' : coat)

  const slotMustExist = (name: string, where: string): void => {
    if (palette[name] === undefined) {
      fail(id, 'RULE 8', `${where} paints slot "${name}", which is not in the palette`,
        `The palette has ${slots.map(s => `"${s}"`).join(', ')}.`)
    }
  }
  const paintOf = (p: PaintLike | undefined, fallback: string, where: string): Paint => {
    const out = asPaint(p ?? fallback)
    slotMustExist(out.base, where)
    for (const s of Object.values(out.byBand ?? {})) slotMustExist(s, where)
    if (out.patch) slotMustExist(out.patch.below, where)
    return out
  }

  /* ------------------------------------ the one mass, and where it sits ---- */
  const hullDef: HullDef = typeof def.hull === 'string' ? { part: def.hull } : def.hull ?? {}
  const hullId = hullDef.part ?? 'box-03'
  const hullPart = partById(hullId)
  if (!hullPart) fail(id, 'RULE 3', `the hull "${hullId}" is not in the parts bank`, 'See hullShapes().')
  /* The bank AND the role, both, and the role is the half that bites: `partById`
   * only refuses an id the pack never drew, and plenty of shapes it did draw are
   * not bodies. The message names every shape that IS one, so a refusal is a
   * shortlist rather than a rule number. */
  if (!hullPart.roles.includes('hull')) {
    fail(id, 'RULE 3', `"${hullId}" is not one of the pack's ten hull shapes`,
      `A hull is a shape the pack itself used as a body: ${HULL_SHAPE_IDS.join(', ')}. `
      + 'And it is the ONLY way to change a body proportion, since the hull is never scaled — '
      + 'see OTHER_HULLS in hulls.ts for the wider, taller, shallower and bigger four.')
  }
  /* THE HULL IS ALWAYS THE STANDARD SIZE. Unwritable above; this catches the
   * definition that came in as data, at module load, naming the species. */
  const smuggled = (hullDef as { stretch?: readonly number[] }).stretch
  if (smuggled !== undefined && smuggled.some(v => v !== 1)) {
    fail(id, 'THE HULL IS THE STANDARD SIZE',
      `the hull "${hullId}" is stretched to [${smuggled.join(', ')}]`,
      'Joe\'s ruling, twice: "the body/cube should always be the standard size, its often '
      + 'bigger". Take one of the pack\'s ten real shells instead — OTHER_HULLS in hulls.ts '
      + 'names the wider, taller, shallower and bigger — and note that no `stretchWhy` buys '
      + 'this any more, because the dial went with the reason.')
  }
  const hullAt: Vec3 = hullDef.at ?? [hullPart.offset[0]!, hullPart.offset[1]!, hullPart.offset[2]!]
  const frame = hullFrame(hullPart, hullAt)

  if (def.belly !== undefined) {
    const row = def.belly * SLOT_PX
    if (!Number.isInteger(row) || row < 1 || row > SLOT_PX - 1) {
      fail(id, 'THE PAINTED LINE', `belly: ${def.belly} is not on the pack's 1/16 grid`,
        `Use k/${SLOT_PX} for k in 1..${SLOT_PX - 1} — a boundary you cannot name in the pack's `
        + 'units is one nobody can check.')
    }
  }
  const hullPaint = paintOf(hullDef.paint, coat, 'the hull')
  const paintedHull: Paint = def.belly === undefined
    ? hullPaint
    : { ...hullPaint, patch: { below: under, at: def.belly } }
  if (def.belly !== undefined) slotMustExist(under, 'the belly patch')

  /* ----------------------------------------------- features, in order ---- */
  const features: Feature[] = []
  const anchors = new Map<string, Anchor>()

  /**
   * Place one part: solve the join point if the definition did not give one,
   * solve the centre from the sink, and record where its outer face lands so a
   * later feature can hang off it.
   */
  const place = (d: PartDef, role: string, fallbackPaint: string, kind: 'single' | 'pair'): void => {
    const part = partById(d.part) ?? authoredById(d.part)
    if (!part) {
      fail(id, 'RULE 1', `"${d.part}" is not in the parts bank and is not authored`,
        'Adapt before authoring: search the bank with findShapes(). If Joe has sanctioned a '
        + 'bespoke shape, it lives in authored.ts and its id starts `bespoke-`.')
    }
    if (part.roles.includes('hull')) {
      fail(id, 'RULE 3', `feature "${role}" wears ${d.part}, which the pack used as a HULL`,
        'One mass. A head box beside a body box is what scrapped 72 animals; there is no seam '
        + 'at the neck on any of the 24 originals.')
    }
    if (d.part.startsWith('bespoke-') && !/RULE 1/i.test(def.flag ?? '')) {
      fail(id, 'RULE 1', `feature "${role}" wears the AUTHORED shape ${d.part} and nothing says so`,
        'Authoring is Joe\'s call, taken once, having seen the lifted alternative. Say so in '
        + '`flag`, naming RULE 1, where he reads it.')
    }

    const name = d.name ?? role
    const stretch: Vec3 = d.stretch ?? [1, 1, 1]
    const spins = d.spin ?? []
    const axis: Axis = d.axis ?? part.attachment?.axis ?? 'y'
    const dir = d.dir ?? part.attachment?.dir ?? 1
    const sink = d.sink ?? part.attachment?.sunkFractionMean ?? 0

    const base: P3 = [0, 0, 0]
    base[AX[axis]] = dir
    const facing = spinVec(base, spins)
    const pts = builtPoints(part, stretch, spins)
    const s = span(pts, facing)

    /* THE DONOR TRANSFER (§8). The join moves the copy along its facing and
     * nothing else, so the two coordinates the join does NOT move are the bank's
     * own recorded offset for the shape — the donor's placement, recovered rather
     * than copied. The one it does move is the face of THIS hull the donor joined
     * its own to. */
    let at: Vec3
    if (d.at !== undefined) {
      at = d.at
    } else if (d.on !== undefined) {
      const a = anchors.get(d.on)
      if (!a) {
        fail(id, 'AN ANCHOR', `"${role}" joins to "${d.on}", which is not a feature of this species`,
          `Known: ${[...anchors.keys()].map(k => `"${k}"`).join(', ') || 'none yet'}. `
          + 'A feature can only hang off one placed before it.')
      }
      at = a.at
    } else {
      const o = part.offset
      const face = facing[0] > 0.5 ? frame.side
        : facing[0] < -0.5 ? -frame.side
          : facing[1] > 0.5 ? frame.top
            : facing[1] < -0.5 ? frame.bottom
              : facing[2] > 0.5 ? frame.front : frame.rear
      const which = Math.abs(facing[0]) > 0.5 ? 0 : Math.abs(facing[1]) > 0.5 ? 1 : 2
      if (Math.max(Math.abs(facing[0]), Math.abs(facing[1]), Math.abs(facing[2])) < 0.99) {
        fail(id, 'THE DONOR TRANSFER', `"${role}" faces a diagonal, so there is no face to join it to`,
          'A spun part needs an explicit `at` — or `chamfer: true` on a tail, which solves the '
          + 'chamfer midpoint and the spin together.')
      }
      const t: P3 = [o[0]!, o[1]!, o[2]!]
      /* A pair is mirrored from the +x copy, and a single sits on the midline. */
      if (kind === 'single' && which !== 0) t[0] = 0
      t[which] = face
      at = t
    }

    const shift = -s.lo - sink * s.extent
    const centre: P3 = [
      at[0] + facing[0] * shift, at[1] + facing[1] * shift, at[2] + facing[2] * shift,
    ]
    /* Where this feature presents its OUTER face, for anything hung off it. */
    anchors.set(name, {
      at: [
        centre[0] + facing[0] * s.hi, centre[1] + facing[1] * s.hi, centre[2] + facing[2] * s.hi,
      ],
    })

    const f: Feature = {
      name,
      part: d.part,
      paint: paintOf(d.paint, fallbackPaint, `feature "${name}"`),
      sink,
      placement: (kind === 'pair' ? { kind: 'pair', at } : { kind: 'single', at }) as Placement,
    }
    if (d.axis !== undefined) f.axis = d.axis
    if (d.dir !== undefined) f.dir = d.dir
    if (d.stretch !== undefined) f.stretch = d.stretch
    if (spins.length > 0) f.spin = spins
    features.push(f)
  }

  /* ---- legs: given, per Joe, and on the row that never moves (§0) ---- */
  if (def.legs !== false) {
    const l = def.legs ?? {}
    /* 0.27 and 0.25 are the hedgehog's and the squirrel's on the 1.250 cube,
     * scaled with the hull so a wider body stands wider. The y never scales:
     * `LEG_ROW.y` is what puts the feet on zero, on nine of the pack's ten hulls. */
    const x = l.x ?? 0.27 * (frame.half[0] * 2 / 1.25)
    const z = l.z ?? 0.25 * (frame.half[2] * 2 / 1.25)
    features.push({
      name: l.name ?? 'leg',
      part: LEG_ROW.part,
      paint: paintOf(l.paint, limb, 'the legs'),
      sink: LEG_ROW.sink,
      placement: {
        kind: 'row',
        from: [x, LEG_ROW.y, z],
        to: [x, LEG_ROW.y, -z],
        count: 2,
        mirror: true,
      },
    })
  }

  /* ---- the ridge: §8's chamfer idiom, and Joe's twenty spikes in two lines ---- */
  if (def.ridge) {
    const r = def.ridge
    const part = partById(r.part)
    if (!part) fail(id, 'RULE 1', `the ridge shape "${r.part}" is not in the bank`, 'Search with findShapes().')
    const stem = r.name ?? 'spike'
    const sink = r.sink ?? part.attachment?.sunkFractionMean ?? 0
    const rows = r.rows ?? (['top', 'chamfer', 'side'] as const)
    const baseSpin = r.spin ?? []
    /* How deep a station is buried below the nominal plane, which is what sets
     * how far along the row it can go before the chamfer drops out from under it. */
    const axis: Axis = part.attachment?.axis ?? 'y'
    const dir = part.attachment?.dir ?? 1
    const b: P3 = [0, 0, 0]
    b[AX[axis]] = dir
    const depth = sink * span(builtPoints(part, [1, 1, 1], baseSpin), spinVec(b, baseSpin)).extent
    const bound = frame.topFlatZ + depth
    const s = r.span ?? ridgeSpan(bound, r.count)
    if (s > bound + 1e-9) {
      fail(id, '§3, NOTHING FLOATS', `the ridge reaches z = ${s.toFixed(4)} and leaves the hull past `
        + `${bound.toFixed(4)}`,
      `The flat face reaches ${frame.topFlatZ.toFixed(4)} and the chamfer then falls away 1:1, so a `
      + `station buried ${depth.toFixed(4)} stays embedded only to that bound. Shorten the span, `
      + 'sink it deeper, or use fewer copies.')
    }
    const paint = paintOf(r.paint, coat, `the ridge "${stem}"`)
    const row = (
      suffix: RidgeRow, x: number, y: number, spin: readonly Spin[], mirror: boolean,
    ): void => {
      const f: Feature = {
        name: `${stem}-${suffix}`,
        part: r.part,
        paint,
        sink,
        placement: {
          kind: 'row', from: [x, y, s], to: [x, y, -s], count: r.count, ...(mirror ? { mirror } : {}),
        },
      }
      if (spin.length > 0) f.spin = spin
      features.push(f)
    }
    for (const which of rows) {
      if (which === 'top') row('top', frame.at[0], frame.top, baseSpin, false)
      else if (which === 'chamfer') {
        row('chamfer', frame.at[0] + frame.chamXY[0], frame.at[1] + frame.chamXY[1],
          [...baseSpin, { axis: 'z', deg: -45 }], true)
      } else row('side', frame.side, frame.at[1], [...baseSpin, { axis: 'z', deg: -90 }], true)
    }
  }

  /* ---- the tail ---- */
  if (def.tail !== undefined) {
    const t = asDef(def.tail) as PartDef & { chamfer?: boolean }
    if (t.chamfer) {
      if (t.spin !== undefined || t.at !== undefined) {
        fail(id, 'THE CHAMFER IDIOM', 'a tail cannot carry `chamfer` and its own `spin` or `at`',
          '`chamfer: true` solves the rear-top chamfer midpoint AND the 45-degree turn onto its '
          + 'normal together; giving one by hand and not the other is how a tail floats.')
      }
      place({
        ...t,
        at: [frame.at[0], frame.at[1] + frame.chamYZ[0], frame.at[2] - frame.chamYZ[1]],
        spin: [{ axis: 'x', deg: 45 }],
      }, 'tail', coat, t.kind ?? 'single')
    } else place(t, 'tail', coat, t.kind ?? 'single')
  }

  /* ---- the ears ---- */
  if (def.ears !== undefined) {
    const e = asDef(def.ears)
    place(e, 'ear', coat, e.kind ?? 'pair')
  }

  /* ---- the eyes: given, per Joe, and rule 5 made unsayable ---- */
  if (def.eyes !== false) {
    const e = def.eyes ?? {}
    const cardId = e.part ?? 'plate-01'
    const card = partById(cardId)
    if (!card) fail(id, 'RULE 5', `the eye card "${cardId}" is not in the bank`, 'See the eye family in the catalogue.')
    if (!card.roles.includes('eye')) {
      fail(id, 'RULE 5', `"${cardId}" is not an eye card`,
        'The eye is the face and brief §5 keeps the soul constant per species. Use a shape the '
        + 'pack itself used as an eye.')
    }
    features.push({
      name: 'eye',
      part: cardId,
      paint: paintOf(
        { base: e.paint ?? under, byBand: { 15: givenPupil! } }, under, 'the eye cards',
      ),
      /* Rule 5 and the measurement agree from opposite directions: absolute z,
       * absolute size, zero sink, and none of the three is a parameter here. */
      sink: 0,
      placement: {
        kind: 'pair',
        at: [e.x ?? card.offset[0]!, e.y ?? card.offset[1]!, EYE_CARD_Z],
      },
    })
  }

  /* ---- the snout, and then the nose on its front ---- */
  if (def.snout !== undefined) {
    const s = asDef(def.snout)
    place(s, 'snout', limb, s.kind ?? 'single')
  }
  if (def.nose !== undefined) {
    const n = asDef(def.nose)
    const anchored: PartDef = n.at === undefined && n.on === undefined && anchors.has('snout')
      ? { ...n, on: 'snout' }
      : n
    place(anchored, 'nose', limb, n.kind ?? 'single')
  }

  /* ---- anything the roles do not name ---- */
  for (const x of def.extras ?? []) place(x, x.name, coat, x.kind ?? 'single')

  /* ----------------------------------------------- rule 9, before build ---- */
  const triCount = features.reduce((n, f) => {
    const p = partById(f.part) ?? authoredById(f.part)!
    const c = f.placement.kind === 'single' ? 1
      : f.placement.kind === 'pair' ? 2
        : f.placement.count * (f.placement.mirror ? 2 : 1)
    return n + p.tris * c
  }, hullPart.tris)
  if (triCount > MODEL_TRIS_MAX && !/RULE 9/i.test(def.flag ?? '')) {
    fail(id, 'RULE 9', `this species is ${triCount} triangles, over the pack's measured `
      + `${MODEL_TRIS_MAX}`,
    'The count is exact — welding removes vertices, never triangles. Take a cheaper shape, use '
    + 'fewer copies, or declare it: name RULE 9 in `flag` so Joe sees the overrun in the viewer '
    + 'rather than nobody seeing it at all.')
  }

  /* Three fields, and there is no fourth to forward: the shell, where it sits and
   * how it is painted. Its SIZE is the shell's own. */
  const hull = { part: hullId, at: hullAt, paint: paintedHull }

  /* ---- how it moves, checked against what it HAS ---- */
  /* Last, and it has to be last: a motion is only checkable once every feature
   * this species has is placed, and the check it exists for — a `flap` naming a
   * part that is not there — is the one whose symptom is nothing moving, which
   * is indistinguishable on a screen from a species with no motion at all. */
  const motion = resolveMotion(
    id, def.motion, new Set(['hull', ...features.map(f => f.name)]),
  )

  return {
    kit: 'assembly',
    palette,
    hull,
    features,
    ...(motion.length > 0 ? { motion } : {}),
    ...(def.flag !== undefined ? { flag: def.flag } : {}),
  } as AssemblyBuild
}

/**
 * Declare one species from a definition, and put it on the register.
 *
 * Returns the `AssemblyBuild`, so a species file still reads
 * `export const X_ASSEMBLY = defineCreature('animal-x', { ... })` and everything
 * downstream — `ASSEMBLED_BUILDS`, `assemblyFor`, `buildAssembled`, the tests
 * that read `.features` and `.palette` — is unchanged. Adding a species is still
 * a file and one appended line in `assembled/index.ts`.
 */
export const defineCreature = (id: string, def: CreatureDef): AssemblyBuild =>
  defineAssembly(id, creatureSpec(id, def))

/**
 * Every shape the pack used as a hull. Exported so a review surface can say why a
 * feature was refused by name rather than by rule number.
 */
export const HULL_SHAPE_IDS: readonly string[] =
  PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => p.id)
