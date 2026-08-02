/**
 * Sum generators. Ports of generateAdd (v0:974) and generateSub (v0:991).
 *
 * The do/while with `g++ < 5` is the anti-repeat guard: it retries up to six
 * times to avoid showing the same sum twice running, then gives up rather than
 * loop forever. Keep the limit exactly — it is observable in the output.
 */
import { ri } from '../rng'
import type { Rng } from '../rng'

export interface SumItem { a: number; b: number; op: 'add' | 'sub' }
export interface SumState { history: SumItem[]; idx: number }

export function generateAdd(s: SumState, rng: Rng, level: number): void {
  const last = s.history[s.history.length - 1]
  let a: number, b: number, g = 0
  do {
    if (level === 1) {
      a = 1 + ri(rng, 9)
      b = 1 + ri(rng, 10 - a)
    } else if (level === 3) {
      /*
       * THE RUNG THAT WAS MISSING: adding units to a teen number WITHOUT
       * regrouping.
       *
       * Level 1 never reaches ten and level 2 bridges it on EVERY item, so
       * before this there was nothing in between — a child went from sums
       * inside their fingers to sums that all need the ten broken open, with
       * no step where the ten simply sits there and the units are counted on.
       * That step is the place-value idea bridging is built out of, and
       * subtraction's ladder has always had it (`STAGE_LABELS.takingAway`:
       * to ten / teens minus units / anything to twenty). This is addition's
       * exact analogue.
       *
       * `u` is the units digit of `a`, and capping `b` at `9 - u` is the whole
       * of the guarantee: (a % 10) + b <= 9, so the units never carry and the
       * ten is never touched. Two draws, in the same order as the branches
       * either side of it, because the golden file pins those streams.
       */
      a = 10 + ri(rng, 9)
      const u = a - 10
      b = 1 + ri(rng, 9 - u)
    } else {
      a = 1 + ri(rng, 10)
      const bmin = Math.max(1, 11 - a)
      b = bmin + ri(rng, 10 - bmin + 1)
    }
  } while (last && last.a === a && last.b === b && g++ < 5)
  s.history.push({ a, b, op: 'add' })
  s.idx = s.history.length - 1
}

export function generateSub(s: SumState, rng: Rng, level: number): void {
  const last = s.history[s.history.length - 1]
  let a: number, b: number, g = 0
  do {
    if (level === 1) {
      a = 1 + ri(rng, 9)
      b = 1 + ri(rng, a)
    } else if (level === 2) {
      a = 11 + ri(rng, 10)
      b = 1 + ri(rng, 9)
    } else {
      a = 1 + ri(rng, 20)
      b = 1 + ri(rng, a)
    }
  } while (last && last.a === a && last.b === b && g++ < 5)
  s.history.push({ a, b, op: 'sub' })
  s.idx = s.history.length - 1
}
