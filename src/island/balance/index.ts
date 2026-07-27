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
  governor: { maxWaitingPets: number; maxEmptySurplus: number }
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
