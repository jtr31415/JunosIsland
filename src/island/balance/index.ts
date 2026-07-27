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
 * cost(n) = round(cap − (cap − base) · e^((1 − n) / tau))
 *
 * The nth thing of its kind costs this many pages or sums. Asymptotic to
 * `cap`, so the curve flattens rather than running away: the twentieth tile
 * is a fair amount of work, the fiftieth is not punishment.
 *
 * `n` is 1-based — the first egg costs `base`.
 */
export function cost(curve: CostCurve, n: number): number {
  const i = Math.max(1, n)
  return Math.round(curve.cap - (curve.cap - curve.base) * Math.exp((1 - i) / curve.tau))
}

/** Pages needed for the nth egg (1-based). */
export const eggCost = (n: number): number => cost(balance.egg, n)

/** Sums needed for the nth tile (1-based). */
export const tileCost = (n: number): number => cost(balance.tile, n)

/**
 * Pages alternate find/build (§3), so reading practice is never all one shape.
 * Which kind the nth page of an egg is.
 */
export function pageKind(pageIndex: number): PageKind {
  const mix = balance.pages.mix
  return mix[pageIndex % mix.length] as PageKind
}
