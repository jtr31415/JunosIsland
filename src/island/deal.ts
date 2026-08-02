/**
 * Dealing a card — generate a new one, or hand back the one they are holding.
 *
 * This is the island's version of v0's `forward()` (v0:1320-1331), which only
 * ever calls a generator when `idx` sits at the end of history and otherwise
 * re-renders `history[idx]` as it stands. The 2D game has had that behaviour
 * since the beginning; the island lost it by calling `generate*` on the way in
 * to every round.
 *
 * That was not merely a re-roll. `generateRead` ramps its set size off
 * `s.history.length` (read.ts:45), so a card dealt twice was a HARDER card the
 * second time; the sum generator's anti-repeat guard reads the last entry; and
 * every deal draws from finite word decks. So an X and a re-tap re-rolled the
 * question, permanently inflated the difficulty, and burned words — three
 * costs for a button whose whole promise is that leaving costs nothing.
 *
 * It lives here rather than in `main.ts` because main.ts is untested glue and
 * this is a decision. It lives here rather than in `flow.ts` because the state
 * machine must go on knowing nothing about `ReadPick`, `BuildItem` or
 * `SumItem` — `flow.ts` imports nothing from `core/` and this keeps it that
 * way. The flow carries one bit; the card stays where it already was.
 */
import { generateRead } from '../core/generators/read'
import type { ReadDeps, ReadPick, ReadState } from '../core/generators/read'
import { generateBuild } from '../core/generators/build'
import type { BuildItem, BuildState } from '../core/generators/build'
import { generateAdd, generateSub } from '../core/generators/sums'
import type { SumItem, SumState } from '../core/generators/sums'
import type { Rng } from '../core/rng'
import type { PageKind } from './balance'

/** The shape every generator state shares: a history, and a finger in it. */
interface Dealt<T> { history: T[]; idx: number }

/**
 * The one rule, in one place.
 *
 * `held` is the flow's bit: was the card at `history[idx]` dealt and left
 * unfinished? The bounds check is not decoration — it is what makes a held bit
 * safe when the store it refers to is empty, which is exactly the state a
 * restored save or a changed page mix can produce. Generate then, rather than
 * index into nothing.
 */
function deal<T>(s: Dealt<T>, held: boolean, generate: () => void): T {
  if (!held || s.idx < 0 || s.idx >= s.history.length) generate()
  return s.history[s.idx] as T
}

/** The two stores a reading page can draw from. */
export interface ReadingStores { read: ReadState; build: BuildState }

/** What was dealt, and therefore which renderer the overlay should mount. */
export type ReadingCard =
  | { kind: 'find'; picks: ReadPick[] }
  | { kind: 'build'; item: BuildItem }

/**
 * A reading page: find a heard word, or build one from graphemes.
 *
 * WHICH OF THE TWO IS NO LONGER DECIDED HERE (A3). It used to be `pageKind` of
 * the page index, read straight off this file; it is now the harness's, because
 * the choice has to answer to the tickboxes as well as to the mix — a parent
 * who says their child cannot build words yet outranks a data file that would
 * like them to. What is preserved is the property that made the index right in
 * the first place: the harness is asked with the same stable page number, so
 * leaving a page and coming back asks for the same kind of card and finds it in
 * the same store. The alternation still cannot be re-rolled by an X.
 */
export function dealReading(
  s: ReadingStores, d: ReadDeps, kind: PageKind, held: boolean,
): ReadingCard {
  if (kind === 'build') {
    const item = deal(s.build, held,
      () => generateBuild(s.build, { rng: d.rng, drawGreen: d.drawGreen, level: d.level }))
    return { kind: 'build', item }
  }
  return { kind: 'find', picks: deal(s.read, held, () => generateRead(s.read, d)) }
}

/**
 * A sum. Same rule, one store, and now either operation.
 *
 * ONE STORE FOR BOTH, deliberately. `SumItem` carries its own `op`, the
 * anti-repeat guard reads the last entry whatever it was, and `held` +
 * `history[idx]` therefore hand back the very take-away they walked away from
 * with no further machinery. Two stores would need two held bits and would let
 * an X flip a subtraction they did not fancy into an addition — which is the
 * exact skip this file exists to prevent.
 */
export function dealSum(
  s: SumState, rng: Rng, level: number, op: 'add' | 'sub', held: boolean,
): SumItem {
  return deal(s, held, () =>
    op === 'sub' ? generateSub(s, rng, level) : generateAdd(s, rng, level))
}
