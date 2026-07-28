/**
 * Economy constants and the cost curve (slice-1 spec §4, §8).
 *
 * Nothing about pacing is hardcoded anywhere else. The whole point of the
 * curve is that the first of anything is nearly free and the tenth is real
 * work, without a cliff between them — so it is tuned by editing JSON, not by
 * hunting constants through the code.
 */
import raw from './balance.json'

export interface CostCurve { base: number; cap: number; tau: number }

export interface Balance {
  tile: CostCurve
  egg: CostCurve
  /**
   * What one completed item is worth (Run A7).
   *
   * Costs used to be denominated in items: one sum paid 1, and a tile cost 8
   * sums. They are now denominated in UNITS, and one item pays 2 — every cost
   * on both curves doubled with it, so nothing about the pacing changed. It
   * exists to buy fractions the old denomination could not express: Run B pays
   * 3 for probe questions and honeymoon periods, and there is no such thing as
   * paying 1.5.
   *
   * This is also the curve's rounding quantum — see `cost()`, which is where
   * the invisibility is actually enforced.
   */
  pay: { item: number }
  pages: { wordsPerFindPage: number; mix: PageKind[] }
  governor: {
    /**
     * The two walls of the corridor she is free to play inside, in TILES PER PET.
     *
     * Joe, JT-012: *"target ratio i think should be 1 animal per 2 tiles, with a
     * buffer to 2:3 either way, then it starts to become increasingly tougher to
     * get either."*
     *
     * TARGET: 2.0 tiles per pet — one animal per two tiles. It is not a knob
     * because nothing reads it; it is the middle of the corridor these two walls
     * describe, and it supersedes the old `tilesPerPet: 1.5` in its role as the
     * TARGET. The 1.5 itself survives, as `crowded`.
     *
     * WHY THEY LOOK LOPSIDED. 1.5 and 3.0 are not symmetric about 2.0, and that
     * is deliberate rather than a slip. Joe stated the target in ANIMALS PER
     * TILE — "1 animal per 2 tiles", "a buffer to 2:3 either way" — and in that
     * unit the three numbers are 2/3, 1/2, 1/3: evenly spaced, a sixth apart
     * either side of the target. Inverting each to tiles per pet gives 1.5, 2.0,
     * 3.0, which is only lopsided because reciprocals do not preserve midpoints.
     * The buffer is even in the unit he said it in.
     *
     * `crowded` — 1.5 tiles per pet, two animals for every three tiles. Breached
     * when `habitableFields < 1.5 · pets`: too many friends for the land, so the
     * EGG gets dearer and Fred asks for maths.
     *
     * `empty` — 3.0 tiles per pet, one animal for every three tiles. Breached
     * when `habitableFields > 3 · pets`: bare land with nobody on it, so the
     * TILE gets dearer and Fred asks her to read.
     *
     * See `emptySteps` and `crowdedSteps`, which are the only place either
     * number is compared against anything — the governors and the prices read
     * the SAME two functions, so an announcement and a rise cannot drift apart.
     */
    corridor: { crowded: number; empty: number }
    /**
     * How much dearer a reward gets for each whole step past its wall.
     *
     * Joe, JT-012: *"let the user run with whatever they want to do up to a
     * point... we then make the reward really really tough to reach if it pushes
     * imbalance further if its too far out of balance."*
     *
     * LINEAR, not exponential: `1 + steps · slope`, so the first step past the
     * wall costs a quarter more and the eighth costs treble. A curve that bit
     * harder early would make the wall a lockout in everything but name, and
     * §19 does not allow a lockout.
     *
     * `capMultiple` is the "up to a point" at the far end: nothing is ever more
     * than three times its list price, however far out of balance she runs. With
     * the shipped caps that is 96 units of sums for a tile and 84 of pages for an
     * egg — a lot of work, reachable work, and it never grows again.
     */
    escalation: { slope: number; capMultiple: number }
  }
  pets: {
    /**
     * How many recent hatches the species draw refuses to repeat.
     *
     * Joe, from playtesting: *"investigate: two cats spawned in a row."* The
     * draw was uniform over the 24 species with no memory at all, so a repeat
     * came up one hatch in 24 — often enough that a child collecting friends
     * meets one early and reads it as her work not counting.
     *
     * FIVE, of 24. An egg is several pages of reading apart, so five covers a
     * whole sitting's worth of hatches: within one session she cannot meet the
     * same animal twice. It still leaves 19 candidates on every draw, so the
     * next friend is genuinely a surprise, and a favourite can come back after
     * six hatches rather than after the whole pack. Raising it toward 23 turns
     * the collection into a checklist; dropping it to 1 fixes only the literal
     * back-to-back case and leaves cat-dog-cat, which reads the same to her.
     */
    speciesMemory: number
  }
  /**
   * Where the grown-ups panel's three measures turn into words (Run A6).
   *
   * These are thresholds on a child's numbers, which is precisely why they are
   * data. The spec asks for them here in terms — *"thresholds in balance,
   * tunable"* — because the honest answer to "is .84 steady or solid?" is that
   * nobody knows yet, and a number nobody knows yet does not belong in a
   * compiled constant where changing it is a code change and a test rewrite.
   *
   * `accuracy` and `consistency` are the spec's own numbers. TWO of these are
   * not, and are flagged as chosen where they are used in `report.ts`: the spec
   * names one speed threshold (15%) and a three-tier scale needs two, so
   * `speed.solid` is a mechanical call; and the spec defines consistency as one
   * boolean, so the middle rung `report.ts` reads out of it is likewise. Both
   * sit here rather than in code so that retuning them is an edit to a data
   * file and not an argument with the type checker.
   *
   * `samples` is the small-sample honesty gate — below these counts the panel
   * shows dashes rather than a tier, because a verdict drawn from four attempts
   * is a statement about the sample and not about the child.
   */
  report: {
    accuracy: { steady: number; solid: number }
    speed: { steady: number; solid: number }
    consistency: { session: number; sessions: number; days: number }
    samples: { accuracy: number; speed: number; sessions: number }
  }
  /**
   * How long the opening story waits on each of Fred's lines before moving
   * itself on. Scaled to the LINE, not flat: a flat wait makes a short line
   * sit there as long as a long one, which is what makes an intro drag.
   */
  story: { beatMinMs: number; beatPerCharMs: number; beatMaxMs: number }
  stage: {
    spinSec: number; progressDots: boolean; flyBackMs: number
    /** How long the friend stands on the plinth before the stage dissolves. */
    hatchHoldMs: number
    /**
     * How long the ceremony will wait for a pet model before going on.
     *
     * Generous, because a COLD fetch of a pet on a first hatch genuinely
     * takes over a second and an empty plinth is the failure this all exists
     * to prevent — but bounded, because the exits are locked while it waits
     * and an unbounded wait on a stalled request is a permanent soft-lock.
     */
    petLoadMs: number
    /** The album chip's flight. */
    chipMs: number
    /** How long the finished plot shows its flourish on the turntable. */
    flourishMs: number
    /** How high, and how far out, the fly-back arcs from. */
    landHeight: number
    landReach: number
  }
  firstRun: { tileOffer: string[]; egg2DelaySec: number }
  unlocks: Array<{ type: string; tiles: number; pets: number }>
}

export type PageKind = 'find' | 'build'

export const balance = raw as Balance

/** Injected by Vite. See vite.island.config.ts and platform/flags.ts. */
declare const __CHANNEL__: string

/**
 * Pull in the compressed-time overlay, or prove there is nothing to pull.
 *
 * The brief requires `balance.dev.json` to be "structurally unloadable in
 * production", and that is stronger than a runtime check. Because
 * `__CHANNEL__` is a build-time constant, this comparison folds to `false` in
 * a production build and Rollup deletes the whole branch — the dynamic import
 * with it, so the JSON is never emitted as a chunk and its contents appear
 * nowhere in the output. `tests/island/channel.test.ts` greps the built bundle
 * for a marker string to prove exactly that, because "I believe Rollup drops
 * it" is not the same as knowing.
 *
 * It MUTATES the exported object rather than returning a new one. Every call
 * site imports `balance` directly and reads it whenever it likes, so handing
 * back a copy would leave most of the game reading the un-overlaid original —
 * a tuning switch that appeared to work and mostly did not.
 */
export async function applyDevBalance(enabled: boolean): Promise<boolean> {
  if (!enabled) return false
  if (__CHANNEL__ === 'production') return false
  const overlay = (await import('./balance.dev.json')).default as Partial<Balance>
  for (const [key, value] of Object.entries(overlay)) {
    if (key.startsWith('__')) continue          // the marker, not a setting
    ;(balance as unknown as Record<string, unknown>)[key] = value
  }
  return true
}

/**
 * cost(n) = pay · round((cap − (cap − base) · e^((1 − n) / tau)) / pay)
 *
 * The nth thing of its kind costs this many UNITS. Asymptotic to `cap`, so the
 * curve flattens rather than running away: the twentieth tile is a fair amount
 * of work, the fiftieth is not punishment.
 *
 * `n` is 1-based — the first egg costs `base`.
 *
 * **Why it rounds in items and not in units.** The A7 re-base doubled `base`,
 * `cap` and the payment together, and the survey called that invisible "by
 * construction". It is not: rounding does not commute with doubling, because
 * `round(2x) ≠ 2·round(x)`. Rounding the doubled curve directly gives the
 * second tile a cost of 7 units — and at 2 a sum that is FOUR sums where it
 * has always been three, a 33% rise on the most visible price in the game.
 * Ten values on the tile curve and five on the egg curve moved that way.
 *
 * So the curve rounds to a whole ITEM and then converts. `exact / pay` is
 * identically the old pre-A7 exact curve (halving `base` and `cap` gives it
 * back exactly), so this returns `2 ×` the old cost at every n, and the items
 * a child actually answers are unchanged everywhere. That is the sense in
 * which the re-base is invisible, and `tests/island/economy.test.ts` walks a
 * month of play to hold it there.
 *
 * It also means a cost is always a whole number of standard items, so the
 * curve never asks for a half-answer. Run B's pay-3 items spend against the
 * same units without moving any price.
 */
export function cost(curve: CostCurve, n: number): number {
  const pay = Math.max(1, balance.pay.item)
  return pay * Math.round(exactCost(curve, n) / pay)
}

/**
 * The curve before it is rounded to a whole item — the list price, exactly.
 *
 * Pulled out so the surcharge can multiply it BEFORE the quantum is applied
 * (see `costPast`). Rounding twice would let a step past the wall move a price
 * by nothing at all, or by two items where the multiplier asked for one.
 */
function exactCost(curve: CostCurve, n: number): number {
  const i = Math.max(1, n)
  return curve.cap - (curve.cap - curve.base) * Math.exp((1 - i) / curve.tau)
}

/**
 * What one completed item pays, in units. Read through a function because the
 * dev overlay may replace `balance.pay` after import (see `applyDevBalance`).
 */
export const itemPay = (): number => Math.max(1, balance.pay.item)

/**
 * How many ordinary items the nth thing actually costs — the number a child
 * experiences, and the one the pacing tests pin.
 */
export const itemsFor = (curve: CostCurve, n: number): number =>
  Math.ceil(cost(curve, n) / Math.max(1, balance.pay.item))

/** Pages needed for the nth egg (1-based). */
export const eggCost = (n: number): number => cost(balance.egg, n)

/** Sums needed for the nth tile (1-based). */
export const tileCost = (n: number): number => cost(balance.tile, n)

/* ------------------------------------------------------------------------- *
 * The corridor, and what it costs to run outside it — JT-012.
 *
 * Joe: *"it should start with invitation first, then let the user run with
 * whatever they want to do up to a point otherwise we risk breaking the balance
 * of the island. we then make the reward really really tough to reach if it
 * pushes imbalance further if its too far out of balance. with an
 * announcement."*
 *
 * Three things had to be true at once, and they are why the maths lives HERE,
 * in plain numbers, rather than in `governors.ts` or `flow.ts`:
 *
 *   1. The invitation and the price must fire at the same place. Fred's ask IS
 *      the announcement Joe required, so a price that started anywhere else
 *      would be a silent tax. `activeGovernor` and `pagesForEgg`/`sumsForTile`
 *      therefore call the SAME two step functions; there is no second copy of
 *      either threshold anywhere in the tree to drift.
 *   2. `cost` must stay ratio-blind. It is called from places that have no
 *      Flow, and a month of pacing tests pin it exactly as it is.
 *   3. `governors.ts` type-imports `Flow` from `flow.ts`, so a value import
 *      back the other way would be a genuine cycle. These take three numbers
 *      and no types, so neither file has to reach for the other.
 * ------------------------------------------------------------------------- */

/**
 * How many whole fields past the EMPTY wall the island stands — the tile's step
 * count. Zero unless she is genuinely out of balance.
 *
 * The first field past the wall is step 1, and that is exactly the field at
 * which Fred starts asking (`activeGovernor`), which is the coherence the card
 * required: `> 0` here and 'space-surplus' there are the same condition, not two
 * conditions that happen to agree today.
 *
 * `floor` because the largest field count that does NOT breach `empty · pets` is
 * `floor(empty · pets)`, whatever `empty` is retuned to.
 */
export const emptySteps = (habitableFields: number, pets: number): number =>
  Math.max(0, habitableFields - Math.floor(balance.governor.corridor.empty * pets))

/**
 * How many whole pets past the CROWDED wall the island stands — the egg's step
 * count. The mirror of `emptySteps`, and its exact mirror by construction.
 *
 * Measured in PETS rather than fields, because the egg is what gets dearer at
 * this wall and a pet is the thing she is buying. The most pets `habitableFields`
 * can hold without breaching is `floor(fields / crowded)`; every pet beyond that
 * is one step.
 */
export const crowdedSteps = (habitableFields: number, pets: number): number =>
  Math.max(0, pets - Math.floor(habitableFields / balance.governor.corridor.crowded))

/**
 * What a reward costs, as a multiple of its list price, this many steps out.
 *
 * `1 + steps/4`, capped at 3: one step out is a quarter dearer, eight steps out
 * is treble and nothing is ever dearer than that. Inside the corridor `steps` is
 * 0 and this is exactly 1, so every price in a balanced island is the price it
 * has always been — the whole scheme is invisible until she leaves the corridor.
 */
export function scarcityMultiplier(steps: number): number {
  const { slope, capMultiple } = balance.governor.escalation
  return Math.min(capMultiple, 1 + Math.max(0, steps) * slope)
}

/**
 * The nth thing of its kind, `steps` past its wall, in units.
 *
 * The multiplier goes on the EXACT curve and the quantum is applied once, at the
 * end — so every price is still a whole number of items and a multiple of `pay`,
 * the steps climb monotonically, and no price is rounded twice.
 */
export function costPast(curve: CostCurve, n: number, steps: number): number {
  const pay = Math.max(1, balance.pay.item)
  return pay * Math.round(exactCost(curve, n) * scarcityMultiplier(steps) / pay)
}

/** Pages needed for the nth egg when the island is `steps` past the crowded wall. */
export const eggCostPast = (n: number, steps: number): number =>
  costPast(balance.egg, n, steps)

/** Sums needed for the nth tile when the island is `steps` past the empty wall. */
export const tileCostPast = (n: number, steps: number): number =>
  costPast(balance.tile, n, steps)

/**
 * How many reading PAGES the progress toward an egg represents.
 *
 * `readProgress` is denominated in units and a page pays one item, so the two
 * are the same number only while an item is worth one unit — which it stopped
 * being at A7. Without this conversion the page index advances 0, 2, 4, 6 and
 * reads the four-long mix at every other slot: one find page in two, where the
 * data says one in four (`PB-038`, Joe's ruling JT-010(2)).
 *
 * Exact rather than rounded, because a reading page pays exactly one item.
 * `floor` guards only the case of a save re-denominated across a re-base
 * leaving a part-item behind, which cannot buy a page either.
 */
export const pagesRead = (readProgress: number): number =>
  Math.floor(readProgress / itemPay())

/**
 * Pages alternate find/build (§3), so reading practice is never all one shape.
 * Which kind the nth page of an egg is — the index is in PAGES, not units.
 */
export function pageKind(pageIndex: number): PageKind {
  const mix = balance.pages.mix
  return mix[pageIndex % mix.length] as PageKind
}

/**
 * The A6 report's thresholds, read through a function for the same reason
 * `itemPay` is: the dev overlay may replace `balance.report` wholesale after
 * import (see `applyDevBalance`), and a module that destructured it at load
 * time would go on reading the original and quietly ignore the tuning.
 */
export const reportRules = (): Balance['report'] => balance.report
