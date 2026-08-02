/**
 * Motion, as data. A species SAYS how it moves; nothing writes code to move it.
 *
 * Joe, 29 July, having watched a bee:
 *
 * > *"one consideration. the wings are currently animated. can that be done
 * > deterministically as well, or specified in the the editor."*
 *
 * The answer to the first half is yes, and the second half is why this file is
 * shaped the way it is. `creature.ts` turned a species into a short declarative
 * record and the geometry builder into something that derives rather than
 * chooses. Motion belongs in exactly the same place: `motion: [{ kind: 'flap',
 * parts: ['wing'] }]` is in keeping, and a species that needs bespoke animation
 * code would be a failure of that design.
 *
 * ## WHERE THE WING MOTION ACTUALLY COMES FROM — measured, 29 July
 *
 * This was unmeasured when the question was asked, and it changes the answer.
 * Both things are true and only one of them is doing anything:
 *
 *   1. **Every one of the 24 Kenney `.glb` files carries EIGHT animation clips**
 *      — `static`, `idle`, `walk`, `run`, `eat`, `dance`, `gesture-positive`,
 *      `gesture-negative` — with channels targeting every node by name,
 *      `wing-left` and `wing-right` among them (24 channels on the bee, 18 on
 *      the chick, 21 on the crab). They are real, and they are TRS channels on
 *      named nodes.
 *
 *   2. **Nothing in this game has ever played one of them.** There is no
 *      `AnimationMixer`, no `clipAction`, no read of `gltf.animations` anywhere
 *      under `src/` — every loader in the codebase takes `gltf.scene` and drops
 *      the rest on the floor. The clips are inert payload in the bundle.
 *
 * The motion Joe is looking at is OURS, and it is nine lines:
 * `pets.ts:690` finds the wing nodes by the regex `/^wing-/` at load time,
 * `pets.ts:855-859` rotates them `Math.sin(t * WINGBEAT + phase) * 0.5` about z
 * with the two sides opposed, and `WINGBEAT` is 14 rad/s at `pets.ts:74`.
 *
 * ## THE REGRESSION, and it is real
 *
 * A lifted part is baked geometry: `tools/pets/parts-bank.ts` walks the donor's
 * node tree, multiplies each mesh by its accumulated world matrix, re-centres it
 * on its own bounding box and records the donor's node name as a PROVENANCE
 * STRING and nothing more. No channel, no sampler, no node identity survives.
 * So the answer is the one that was suspected: **a lifted part cannot keep a
 * glTF clip, because the clip targets a node that no longer exists.**
 *
 * That is currently a regression nobody can hit, for two reasons worth writing
 * down rather than rediscovering:
 *
 *   - The clips were never played, so a rebuilt bee loses nothing it had.
 *   - There is no wing in the bank at all. The parts bank holds nose, ear, eye,
 *     hull, tail, tooth, band, card, leg and oddment — `roleOf` has a `wing`
 *     branch (`parts-bank.ts:224`) and not one part came out under it. A
 *     rebuilt bee has no wing to flap until somebody authors or lifts one.
 *
 * And one accident that IS load-bearing, because it decides whether the rebuilt
 * bee flaps or stands there: `buildAssembly` names a paired feature's meshes
 * `<name>-r` and `<name>-l` (`assembly.ts:549`, `copiesOf` tags at `:406-407`).
 * A definition whose feature is called `wing` therefore emits meshes named
 * `wing-r` and `wing-l`, which `pets.ts:690`'s `/^wing-/` matches exactly. The
 * old flap code would find them. That is luck, not design, and this file is the
 * design: the species says `flap`, and the consumer is told which meshes rather
 * than guessing them off a regex.
 *
 * ## The shape, and what it deliberately is not
 *
 * **This is a table, not an animation system.** Four named motions, two
 * parameters each, one pure function that turns (motion, time, phase) into a
 * number. A fifth motion is a fifth row of `MOTIONS`; it is not new machinery.
 * That is the acceptance test for the design and it is the reason there is no
 * curve, no easing, no blending, no state machine and no clip.
 *
 * The roster already anticipates where this has to grow — *"every species
 * carries its signature behaviour — perch, cling, curl, sentry, pet-to-pet
 * landing, dusk-active"*. Those are not motions, they are BEHAVIOURS: where a
 * creature goes and what it does when it gets there. They will want their own
 * field beside this one, and the split is deliberate — `motion` is what a
 * creature's parts do while it stands still, and every item on that list is
 * something a creature's whole body does over minutes. Keeping them apart is
 * what stops this table growing a scheduler.
 *
 * ## Determinism
 *
 * Same definition, same motion, every time. Nothing here reads a clock or a
 * random source; `t` is passed in. The one thing that could have been random is
 * the phase offset, and `motionPhase` seeds it off a string exactly the way
 * `naming.ts:154 nameSeed` seeds a given name — FNV-1a, `Math.imul`, no
 * platform-dependent arithmetic. See its own comment for which string, because
 * the choice is not the obvious one.
 */

/* ------------------------------------------------------------- the table --- */

/** The four. A fifth is a fifth row below, and nothing else. */
export type MotionKind = 'flap' | 'wag' | 'bob' | 'twitch'

/** What a motion drives on the mesh it names. */
export type MotionChannel = 'rotation' | 'position'

/** The axis it drives, in the creature's own model space. */
export type MotionAxis = 'x' | 'y' | 'z'

/**
 * One row of the table: everything about a KIND that is not a per-species dial.
 *
 * `opposed` is what makes a flap a flap rather than two wings waving the same
 * way: the left copy runs a half cycle behind the right. It is a property of the
 * motion, not a phase offset somebody tuned, and it is why the two sides staying
 * in step is impossible to express rather than merely discouraged.
 */
export interface MotionRow {
  channel: MotionChannel
  axis: MotionAxis
  /** Radians for a `rotation`, model units for a `position`. */
  amplitude: number
  /** Seconds for one full cycle. */
  period: number
  /** Do a pair's two sides run in anti-phase? */
  opposed: boolean
}

/**
 * The four motions, and where every number came from.
 *
 * **`flap` and `bob` are MEASURED** — off the live game, not picked. The bee and
 * the parrot are hovering on screen right now at `Math.sin(t * 14) * 0.5`
 * radians of wing and `Math.sin(t * 1.9) * 0.05` units of body
 * (`pets.ts:854-858`), and those are the two rates Joe has actually looked at
 * and not sent a note about. Written as `2π / rate` rather than as a decimal so
 * the provenance is in the expression: a period is what a definition author
 * thinks in, radians per second is what the old loop thought in, and they are
 * the same beat.
 *
 * **`wag` and `twitch` are STATED, not measured**, because nothing in this game
 * has ever wagged or twitched — there is no number to recover. They are placed
 * against the two that are real: a wag is slower than a wingbeat and much faster
 * than the hover bob; a twitch is the slowest thing here, an ear that never
 * quite settles. These are the two rows to expect a note about, and moving one
 * moves every species that uses it, which is the point of a table.
 *
 * **`twitch` is a slow sway and not an intermittent flick**, and that is a
 * deliberate limit rather than an oversight. A real twitch — still, still,
 * still, SNAP — needs a duty cycle, which is a third parameter, which is the
 * first step of the animation system this file exists not to be. If Joe wants
 * the flick, that is his call to make and it costs one more field on this row.
 */
export const MOTIONS: Readonly<Record<MotionKind, MotionRow>> = {
  /** The bee's and the parrot's own wingbeat: `pets.ts:74`, WINGBEAT = 14 rad/s. */
  flap: { channel: 'rotation', axis: 'z', amplitude: 0.5, period: (2 * Math.PI) / 14, opposed: true },
  /** A tail, about the creature's up axis. Stated. */
  wag: { channel: 'rotation', axis: 'y', amplitude: 0.35, period: 0.6, opposed: false },
  /** The hover: `pets.ts:854`, `Math.sin(t * 1.9) * 0.05`. */
  bob: { channel: 'position', axis: 'y', amplitude: 0.05, period: (2 * Math.PI) / 1.9, opposed: false },
  /** An ear or a nose that never settles. Stated, and the slowest of the four. */
  twitch: { channel: 'rotation', axis: 'x', amplitude: 0.18, period: 2.4, opposed: false },
}

/** The kinds, in table order, for a picker that must not invent a fifth. */
export const MOTION_KINDS = Object.keys(MOTIONS) as readonly MotionKind[]

/* --------------------------------------------------------- what a species says --- */

/** The two dials, on every kind. Absent means the kind's own measured default. */
interface MotionTuning {
  /** Radians for a rotation, model units for a position. Must be finite and > 0. */
  amplitude?: number
  /** Seconds for one full cycle. Must be finite and > 0. */
  period?: number
}

/**
 * One motion, as a species says it.
 *
 * `parts` names FEATURE names — `wing`, `tail`, `ear` — the same words the
 * definition used, not mesh names. A `pair` feature is one name and covers both
 * sides; the consumer resolves `wing` to the meshes `wing-r` and `wing-l` and
 * gets the anti-phase from the `-l`/`-r` tag rather than from a traverse order.
 *
 * The union is doing work: **a flap that names no parts does not compile.** Only
 * `bob` may omit `parts`, because a bob with no parts is the whole creature
 * drifting, which is what a hovering bee's body does and is a real thing to say.
 * Everything else moving nothing is a typo, and the house rule is that a
 * violation which can be made not to compile is.
 */
export type MotionDef =
  | ({ kind: 'bob'; parts?: readonly string[] } & MotionTuning)
  | ({ kind: Exclude<MotionKind, 'bob'>; parts: readonly string[] } & MotionTuning)

/**
 * One motion after the defaults are filled in and the names are checked. This is
 * what rides on the build and what a consumer reads.
 *
 * Every field is present and every field is a number or a string — no
 * `undefined`, no optionality to re-handle downstream, and nothing to look up in
 * `MOTIONS` a second time. The table is consulted once, here.
 */
export interface ResolvedMotion {
  kind: MotionKind
  /** Feature names. `[]` means the creature's own group — see `MotionDef`. */
  parts: readonly string[]
  channel: MotionChannel
  axis: MotionAxis
  amplitude: number
  period: number
  opposed: boolean
}

/* ------------------------------------------------------------ resolution --- */

const RULES = 'docs/building-animals-from-parts.md'

function fail(id: string, what: string, instead: string): never {
  throw new Error(`${id}: MOTION — ${what}. ${instead} (${RULES})`)
}

/**
 * Fill the defaults, check every name against the features this species actually
 * has, and refuse two motions fighting over one part.
 *
 * Called from `creatureSpec`, which is module load, so a motion naming a part
 * the species does not have takes the import down rather than showing Joe a
 * still wing on a tablet three weeks later. **That is the whole reason this
 * validates against `known` rather than trusting the string** — the failure it
 * catches is a typo, the symptom is nothing moving, and nothing moving is
 * exactly what a species with no motion looks like.
 *
 * `known` is the feature names the build emits, plus `hull`. Pure: same
 * definition and same feature set in, same records out.
 */
export function resolveMotion(
  id: string, defs: readonly MotionDef[] | undefined, known: ReadonlySet<string>,
): readonly ResolvedMotion[] {
  if (defs === undefined || defs.length === 0) return []

  const out: ResolvedMotion[] = []
  const spokenFor = new Map<string, MotionKind>()

  for (const d of defs) {
    const row = MOTIONS[d.kind]
    if (row === undefined) {
      fail(id, `"${String(d.kind)}" is not one of the ${MOTION_KINDS.length} named motions`,
        `They are ${MOTION_KINDS.join(', ')}. A new one is a new row in MOTIONS, not a new field.`)
    }

    const amplitude = d.amplitude ?? row.amplitude
    const period = d.period ?? row.period
    if (!Number.isFinite(amplitude) || amplitude <= 0) {
      fail(id, `${d.kind} has amplitude ${String(d.amplitude)}`,
        'An amplitude is finite and greater than zero; a motion that does not move is said by '
        + 'leaving the motion out.')
    }
    if (!Number.isFinite(period) || period <= 0) {
      fail(id, `${d.kind} has period ${String(d.period)}`,
        'A period is finite seconds and greater than zero.')
    }

    const parts = d.parts ?? []
    for (const p of parts) {
      if (!known.has(p)) {
        fail(id, `${d.kind} moves "${p}", which is not a feature of this species`,
          `It has ${[...known].map(k => `"${k}"`).join(', ')}. Name the FEATURE — a pair is one `
          + 'name and covers both sides.')
      }
      const had = spokenFor.get(p)
      if (had !== undefined) {
        fail(id, `"${p}" is moved by both ${had} and ${d.kind}`,
          'Two motions on one part fight over the same channel and the winner is whichever ran '
          + 'last. One part, one motion.')
      }
      spokenFor.set(p, d.kind)
    }

    out.push({
      kind: d.kind,
      parts,
      channel: row.channel,
      axis: row.axis,
      amplitude,
      period,
      opposed: row.opposed,
    })
  }
  return out
}

/* ----------------------------------------------------------------- phase --- */

/**
 * A stable phase offset in [0, 2π), seeded off a string.
 *
 * **Why there is no `Math.random` here, and why the old one was worse than
 * non-deterministic.** `pets.ts:695` seeds each pet's phase with
 * `Math.random() * Math.PI * 2` at load. That is not merely undeterministic in
 * the test sense — it means a creature Juno has owned for a month is in a
 * different part of its wingbeat every time the island opens. Nobody would ever
 * report that as a bug and it is still the wrong behaviour: their friends
 * should be the same friends.
 *
 * **Why the key is NOT the species id, which is the obvious answer and the wrong
 * one.** The reason a phase offset is wanted at all is so that two of the SAME
 * species do not beat in lockstep — and a species id is by construction the same
 * string for both of them. Seeding off it would produce two bees flapping as one
 * bee, deterministically. So the key is whatever is stable and PER CREATURE:
 *
 *   - on the island, `Pet.id` — stable for the life of the save, so a bee keeps
 *     its own beat forever and two bees differ;
 *   - on a bench or in an album portrait, where there is exactly one of the
 *     species and no pet, the species id, which is stable and sufficient.
 *
 * The consumer chooses; this function only promises that the same string gives
 * the same number on every machine and every run. FNV-1a and `Math.imul`, which
 * is the same construction `naming.ts:154` uses to seed a given name — and a
 * different domain prefix, so a creature's phase and its name can never be
 * drawn off one stream and drift together if either changes.
 */
export function motionPhase(key: string): number {
  const s = `motion/${key}`
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 0) / 0x100000000) * Math.PI * 2
}

/**
 * Which way round a mesh runs, from the name `buildAssembly` gave it.
 *
 * A pair emits `<feature>-r` and `<feature>-l` (`assembly.ts:549`), so the side
 * is IN THE NAME and does not have to be inferred from the order a traverse
 * happened to hand the meshes back. `pets.ts:858` uses `i % 2` for this, which
 * is correct only for as long as the traverse yields exactly two wings in a
 * stable order — true today, and not a thing anyone would notice breaking.
 */
export function motionSide(meshName: string): 1 | -1 {
  return meshName.endsWith('-l') ? -1 : 1
}

/**
 * The value of one motion at time `t`. The whole of the runtime, and it is one
 * line of arithmetic.
 *
 * Radians for a `rotation` kind, model units for a `position` kind — add it to
 * the mesh's rest value on the named axis, do not assign over it, because a
 * placed node's translation IS its placement (rule 4) and a `bob` that assigned
 * would drop every creature to the origin.
 *
 * `side` comes from `motionSide`; on an `opposed` motion the left copy runs a
 * half cycle behind, which is what makes two wings meet in the middle instead of
 * sweeping together.
 */
export function motionAt(m: ResolvedMotion, t: number, phase: number, side: 1 | -1 = 1): number {
  const turn = (2 * Math.PI * t) / m.period + phase + (m.opposed && side < 0 ? Math.PI : 0)
  return Math.sin(turn) * m.amplitude
}

/* ----------------------------------------------------------- fingerprint --- */

/**
 * A stable hash of one species' resolved motion. **A SECOND fingerprint, beside
 * `creatureFingerprint`, and not folded into it.**
 *
 * The geometry fingerprint states its own contract in as many words:
 * *"everything about the geometry a viewer can see and nothing about how it got
 * there"* (`fingerprint.ts:22`). Motion is not geometry — it moves no vertex,
 * and `groupFingerprint` takes an already-built group in which there is nothing
 * about motion to hash. Three reasons to keep them apart, in ascending order of
 * how much they matter:
 *
 *   1. A hash that moves for two unrelated reasons tells you less than two
 *      hashes. "The hedgehog changed" is a worse signal than "the hedgehog's
 *      geometry changed and its motion did not".
 *   2. Motion is a property of the DEFINITION; geometry is a property of the
 *      built meshes. Hashing them together would mean stuffing motion into
 *      `group.userData` purely so the geometry hash could find it, which is a
 *      build artefact invented to satisfy a test.
 *   3. **Every geometry pin in `assembly-fingerprint.test.ts` stays valid.**
 *      Folding motion in would turn thirteen species' pinned hashes red on a
 *      change that moved not one vertex, while eleven agents are writing species
 *      files — a red hash that means nothing is a red hash people learn to
 *      ignore.
 *
 * The empty case is a real value and not a special case: a species with no
 * motion hashes the empty list, gets a constant, and is pinned like any other.
 *
 * Same FNV-1a pair as `fingerprint.ts`, deliberately — one spelling of "notice a
 * change" in this codebase.
 */
function fnv(s: string): string {
  let a = 0x811c9dc5, b = 0x1000193
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    a = Math.imul(a ^ c, 0x01000193)
    b = Math.imul(b ^ c, 0x85ebca6b)
  }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0')
}

/** 1e-6, and `-0` folded to `0`. `fingerprint.ts:63`'s own quantiser. */
const q = (n: number): string => {
  const v = Math.round(n * 1e6) / 1e6
  return Object.is(v, -0) ? '0' : String(v)
}

/**
 * Hash a resolved motion list. Order-INDEPENDENT, for the same reason the
 * geometry hash is: re-ordering a definition's motions changes nothing anybody
 * can see, so it must not move the hash.
 */
export function motionFingerprint(list: readonly ResolvedMotion[]): string {
  const rows = list.map(m => [
    m.kind, [...m.parts].sort().join('+'), m.channel, m.axis,
    q(m.amplitude), q(m.period), String(m.opposed),
  ].join(':'))
  rows.sort()
  return fnv(`${rows.length}|${rows.join('|')}`)
}
