/**
 * The measured facts a species build must NOT derive a fourth time.
 *
 * Three numbers were each worked out from scratch by the hedgehog, then again by
 * the squirrel, then again in review. They are the same numbers every time
 * because they are properties of the PACK, not of an animal — so they live here,
 * once, with the derivation beside them, and a species build imports them.
 *
 * Nothing in this file is three.js and nothing in it is a choice. Every value is
 * either measured off `bank.generated.ts` or solved from values that were.
 * `tests/island/assembly-constants.test.ts` re-derives all of it from the bank on
 * every run, so a constant that drifts from the pack is a red test rather than a
 * comment that used to be true.
 */
import { PARTS_BANK } from './bank.generated'

/* ------------------------------------------------------- 1. the leg row --- */

/**
 * **Every hull's bottom is y = 0.18125.** Nine of the pack's ten hulls, to within
 * the bank's own six-decimal rounding.
 *
 * `box-03`, `box-12`, `box-20`, `box-21`, `box-31`, `box-33`, `box-36`, `box-39`
 * and `box-41` all sit with their lowest point on this plane, whatever their
 * size — the cow's wider hull, the fox's taller one, the tiger's bigger one. Only
 * the crab's `box-13` differs (0.320972), and a crab has no legs in the sense
 * this constant is about.
 *
 * It is also SOLVED, which is why it is exact rather than approximately shared:
 * the pack's leg `box-01` is 0.30625 tall and its measured `sunkFractionMax` is
 * 0.408163, so a leg joined at a hull bottom `B` puts its foot at
 * `B - 0.30625 x (1 - 0.408163)` = `B - 0.18125`. Feet on y = 0 therefore wants
 * `B = 0.18125`, and that is where Kenney put every hull he drew.
 *
 * **The consequence is that the leg row never moves.** Whatever hull a species
 * picks and whatever it does on top of it, the four legs are `box-01`, sunk
 * 0.408163, on a row at y = 0.18125. Use `LEG_ROW`.
 */
export const HULL_BOTTOM_Y = 0.18125

/**
 * The leg row, whole. Four legs from one shape and one line, on every species.
 *
 * `part` and `sink` are the pack's own — `box-01` at its measured
 * `attachment.sunkFractionMax` — and `y` is `HULL_BOTTOM_Y`, which is what puts
 * the feet on zero. Spread it rather than retyping it:
 *
 * ```ts
 * {
 *   name: 'leg',
 *   part: LEG_ROW.part,
 *   paint: { base: 'limb' },
 *   sink: LEG_ROW.sink,
 *   placement: {
 *     kind: 'row',
 *     from: [0.27, LEG_ROW.y, 0.25],
 *     to: [0.27, LEG_ROW.y, -0.25],
 *     count: 2,
 *     mirror: true,
 *   },
 * }
 * ```
 *
 * The x and z stations are the species' own — how wide it stands and how long it
 * is — and are the only part of a leg row worth thinking about.
 */
export const LEG_ROW = {
  part: 'box-01',
  sink: 0.408163,
  y: HULL_BOTTOM_Y,
} as const

/* ----------------------------------------------------- 2. the front face --- */

/**
 * Where each hull's FRONT face is — measured, and not the same on all of them.
 *
 * Seven of the ten sit at z = 0.625: `box-03`, `box-12`, `box-20`, `box-21`,
 * `box-33`, `box-36`, `box-39`. `box-31` (the lion's) is 0.500, because it is the
 * one hull that is shallower than it is wide — 1.125 deep — and it is offset back
 * 0.0625 as well. `box-41` (the tiger's) is 0.725. The crab's `box-13` is
 * 0.673689 and is a special case in every other respect too.
 *
 * A snout, a beak or a muzzle joins the front face, so it wants THIS number for
 * the hull it is actually on. An eye card does not — see `EYE_CARD_Z`.
 */
export const HULL_FRONT_Z: Readonly<Record<string, number>> = {
  'box-03': 0.625,
  'box-12': 0.625,
  'box-13': 0.673689,
  'box-20': 0.625,
  'box-21': 0.625,
  'box-31': 0.5,
  'box-33': 0.625,
  'box-36': 0.625,
  'box-39': 0.625,
  'box-41': 0.725,
}

/** The front face seven of the ten hulls share. The exceptions are in `HULL_FRONT_Z`. */
export const HULL_FRONT_Z_USUAL = 0.625

/** One hull's front face, by id. Throws by name rather than returning a guess. */
export function hullFrontZ(id: string): number {
  const z = HULL_FRONT_Z[id]
  if (z === undefined) {
    throw new Error(`hulls: "${id}" is not one of the pack's ten hulls — see hullShapes()`)
  }
  return z
}

/**
 * **The eye card sits at z = 0.6350, whatever the hull is.** Absolute, measured,
 * and the same across all 48 cards in the pack — standard deviation 0.0000.
 *
 * This is the constant that looks wrong and is not. On the seven usual hulls the
 * card floats 0.010 proud of the front face, which is the daylight the pack
 * gives it. On `box-31` the front face is 0.500 and the card is STILL at 0.6350,
 * so it floats 0.135 proud — and that is exactly what the lion does, because
 * `box-31` is the lion's own hull and 0.6350 is the lion's own eye card. The
 * shallow hull is the lion's cheekbones; the face is still a face at face depth.
 *
 * So do not "correct" an eye card onto the hull it happens to sit on, and never
 * scale one (rule 5). `sink: 0` and this z, always.
 */
export const EYE_CARD_Z = 0.635

/* ---------------------------------------------- 3. the height is a FLOOR --- */

/** The pack's measured height band, over all 24: 1.43 to 2.02, mean 1.65. */
export const PACK_HEIGHT_MIN = 1.43
/** The pack's measured height band, over all 24: 1.43 to 2.02, mean 1.65. */
export const PACK_HEIGHT_MAX = 2.02

/**
 * **1.43 IS A FLOOR, NOT A RANGE, AND IT IS THE FIRST THING TO CHECK.**
 *
 * A bare 1.250 cube on standard legs measures 1.43125 tall: the hull bottom is
 * `HULL_BOTTOM_Y` = 0.18125 and the cube adds 1.250 on top of it. That clears the
 * pack's own minimum of 1.43 by **0.00125** — one part in a thousand.
 *
 * The consequences are worth stating in the direction they actually bite:
 *
 *   - **Nothing can be shorter than the cube.** There is no headroom under
 *     `PACK_HEIGHT_MIN` at all. A species designed low — a mole, a newt, a
 *     tortoise, anything whose whole character is that it is close to the
 *     ground — cannot express that by sitting lower, because it is already on
 *     the floor before a single feature is added.
 *   - **So height is decided FIRST, not last.** A build that gets its ears and
 *     its tail right and then measures 1.42 is a build that has to start again.
 *     Check this before choosing anything else.
 *   - **Low is expressed by the hull, not by the ground clearance.** `box-31` is
 *     1.125 deep and `box-21` is 1.5051 tall; a short animal is a species that
 *     picks a different hull or accepts that the pack has no short animals in it.
 *     Which is true: the pack has none.
 */
export const HEIGHT_FLOOR = 1.43125

/** How much `HEIGHT_FLOOR` clears `PACK_HEIGHT_MIN` by. One part in a thousand. */
export const HEIGHT_FLOOR_MARGIN = 0.00125

/* ------------------------------------- a different hull is not a stretch --- */

/**
 * **Choosing a different authored hull is NOT a stretch and needs no
 * `stretchWhy`.**
 *
 * This is the one every builder gets wrong, and the type will block them when
 * they do. Joe's ruling was *"body cubic, its currently too wide"* — he rejected
 * a STRETCHED cube, a shape 14 of the 24 share, silently departed from. He did
 * not rule that every animal is `box-03`. The pack drew ten hulls and using one
 * of them is adaptation of the purest kind rule 1 asks for: authored geometry,
 * unmodified, at the proportions Kenney gave it.
 *
 * So if a species needs to be wider, taller or shallower than the cube, take a
 * hull that IS. Reaching for `Hull.stretch` to get there is the wrong move twice
 * over — it needs a `stretchWhy` it cannot honestly give, and it re-does badly
 * something the pack already did well.
 *
 * Every one of these sits at `HULL_BOTTOM_Y` like the cube, so the leg row is
 * unchanged whichever is picked. `HULL_FRONT_Z` is not — check it.
 */
export const OTHER_HULLS = {
  /** 1.5395 x 1.250 x 1.250 — the cow's and the deer's. WIDER, and nothing else. */
  wider: 'box-12',
  /** 1.250 x 1.5051 x 1.250 — the fox's. TALLER, and nothing else. */
  taller: 'box-21',
  /** 1.250 x 1.250 x 1.125 — the lion's. SHALLOWER; front face 0.500, eye card still 0.6350. */
  shallower: 'box-31',
  /** 1.350 x 1.300 x 1.350 — the tiger's. Bigger on all three; front face 0.725. */
  bigger: 'box-41',
} as const

/* ------------------------------------------------------- rule 9's budgets --- */

/** Rule 9, measured over the pack: a body node runs 236-1114 vertices. */
export const BODY_VERTS_MIN = 236
/** Rule 9, measured over the pack: a body node runs 236-1114 vertices. */
export const BODY_VERTS_MAX = 1114
/** Rule 9, measured over the pack: a whole model runs 405-1626 vertices. */
export const MODEL_VERTS_MIN = 405
/** Rule 9, measured over the pack: a whole model runs 405-1626 vertices. */
export const MODEL_VERTS_MAX = 1626
/** Rule 9, measured over the pack: a whole model runs 422-951 triangles. */
export const MODEL_TRIS_MIN = 422
/** Rule 9, measured over the pack: a whole model runs 422-951 triangles. */
export const MODEL_TRIS_MAX = 951

/* -------------------------------------------------------------- the ten --- */

/**
 * The pack's hulls, with the two numbers a build needs off each: where its bottom
 * sits and where its front face is.
 *
 * Derived from the bank at call time rather than typed, so this is the thing the
 * constants above are checked against and cannot silently disagree with.
 */
export const hullFacts = (): readonly {
  id: string; size: readonly number[]; bottom: number; front: number; donors: readonly string[]
}[] => PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => ({
  id: p.id,
  size: p.size,
  bottom: p.offset[1]! - p.size[1]! / 2,
  front: p.offset[2]! + p.size[2]! / 2,
  donors: [...new Set(p.provenance.map(q => q.species))],
}))
