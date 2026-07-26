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
