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
    } else if (level === 4) {
      /*
       * WITHIN FIVE — the gentlest rung, and the one the difficulty spec always
       * had and the code never did. `docs/pet-island-difficulty.md` §2 lists the
       * strata as *"S0 add-within-5 · S1 add-within-10 · ..."*, and S0 was
       * missing: the game's easiest sum was anything up to ten, which is already
       * two hands.
       *
       * It sits BELOW where every island starts (`STARTS_TICKED` ticks sums 1),
       * so no child is moved onto it by the cadence — it is there for a grown-up
       * to drop to when ten is too much, which is the one direction the ladder
       * could not go before.
       */
      a = 1 + ri(rng, 4)
      b = 1 + ri(rng, 5 - a)
    } else if (level === 5) {
      /*
       * WHOLE TENS TO A HUNDRED — 20 + 30, never 24 + 30.
       *
       * The first rung past twenty, and deliberately the one that adds no new
       * arithmetic: a child who can do 2 + 3 can do 20 + 30 the moment they see
       * that the tens count like units. That is the whole idea being taught, and
       * it is why this comes before two-digit work rather than after it.
       */
      a = 10 * (1 + ri(rng, 8))
      b = 10 * (1 + ri(rng, (100 - a) / 10))
    } else if (level === 6) {
      /*
       * TWO-DIGIT PLUS UNITS, NO REGROUPING — 34 + 5.
       *
       * Level 3 generalised past twenty. The tens digit sits still and the units
       * are counted on, so the place-value idea is the same one, practised where
       * the number is too big to hold on fingers.
       *
       * TWO DRAWS, like every other branch — see the test that pins it. The
       * tens digit and the units digit come out of ONE draw (`n / 8` and
       * `n % 8`) rather than two, because a branch that cost three would shift
       * the shared stream for every deal after it whenever a child happened to
       * be dealt this rung.
       *
       * `u` therefore lands in 0..7 and `b` is capped at `9 - u`, so
       * `(a % 10) + b <= 9` and the ten is never touched — the same guarantee
       * level 3 makes, and the reason the units are constructed rather than
       * taken from a freely drawn `a`.
       */
      const n = ri(rng, 64)
      const u = n % 8
      a = 10 * (2 + Math.floor(n / 8)) + u
      b = 1 + ri(rng, 9 - u)
    } else if (level === 7) {
      /*
       * TWO-DIGIT PLUS UNITS, BRIDGING — 37 + 5.
       *
       * The top rung: level 2's skill at level 6's size, so the ten has to be
       * broken open again with a bigger number in front of it. `bmin = 10 - u`
       * forces the carry on every item, exactly as level 2 does.
       *
       * Two draws, for the reason level 6 gives: the tens and the units come
       * out of one (`n / 9` and `n % 9`), leaving the second for `b`.
       */
      const n = ri(rng, 72)
      const u = 1 + (n % 9)
      a = 10 * (1 + Math.floor(n / 9)) + u
      const bmin = 10 - u
      b = bmin + ri(rng, 10 - bmin)
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
