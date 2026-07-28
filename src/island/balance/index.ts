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
    maxWaitingPets: number
    maxEmptySurplus: number
    /**
     * How many fields the island wants per pet.
     *
     * Joe, 28 July: *"for every tile, there needs to be one animal. we can be a
     * bit more relaxed with that, say 3 tiles for 2 animals. bit more maths than
     * reading since the maths goes quicker."*
     *
     * A RATIO, which is the whole point — the governors used to hold an absolute
     * difference, and an absolute difference cannot express a ratio. See
     * `spaceSurplus`.
     */
    tilesPerPet: number
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
  const i = Math.max(1, n)
  const pay = Math.max(1, balance.pay.item)
  const exact = curve.cap - (curve.cap - curve.base) * Math.exp((1 - i) / curve.tau)
  return pay * Math.round(exact / pay)
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
