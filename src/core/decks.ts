import { ri, shuffle } from './rng'
import type { Rng } from './rng'

/**
 * No-repeat-until-exhausted dealer. Port of makeDeck (v0/junos-words.html:714).
 *
 * Copies the source before shuffling, so the caller's array is never mutated,
 * and reshuffles a fresh copy when the deck runs dry. The shuffle is lazy —
 * creating a deck consumes no randomness, which matters because the golden
 * reproduction shares one RNG across both decks and all generators.
 */
export function makeDeck<T>(rng: Rng, src: readonly T[]): () => T {
  let d: T[] = []
  return () => {
    if (!d.length) d = shuffle(rng, [...src])
    return d.pop() as T
  }
}

/** A dealer with a short memory. Callable; `remember` seeds what it has seen. */
export interface MemoryDeck<T> {
  (): T
  /**
   * Tell the deck what was recently dealt — by something else, or before a
   * reload. REPLACES whatever it was holding rather than adding to it, because
   * the caller is stating the history, not appending to it. Only the last
   * `memory` items matter and anything outside `src` is ignored.
   */
  remember(seen: readonly T[]): void
}

/**
 * Uniform draw that will not repeat anything dealt in the last `memory` draws.
 *
 * The gentler cousin of `makeDeck`. A full deck guarantees variety by dealing
 * all 24 before any repeat, which is exactly what you want for spelling
 * practice and exactly what you do not want for a collection: it makes the
 * order predictable and puts a favourite 24 hatches away, every time. A short
 * memory instead forbids only the repeats a person can actually NOTICE. The
 * long-run rate is unchanged — a species is still drawn about once every
 * `src.length` deals either way — so nothing becomes rarer; the clumping goes
 * and the sense of chance stays.
 *
 * Never starves and never throws: `memory` is clamped to `src.length - 1`, so
 * at least one item is always eligible however large a window is asked for. A
 * one-item source therefore deals that item forever, as `makeDeck` does.
 *
 * Lazy in the same way as `makeDeck` — creating one consumes no randomness.
 */
export function makeMemoryDeck<T>(
  rng: Rng, src: readonly T[], memory: number,
): MemoryDeck<T> {
  const keep = Math.max(0, Math.min(Math.trunc(memory) || 0, src.length - 1))
  let recent: T[] = []

  const push = (v: T): void => {
    if (!keep) return
    recent.push(v)
    if (recent.length > keep) recent.splice(0, recent.length - keep)
  }

  const deck = ((): T => {
    const free = keep ? src.filter(v => !recent.includes(v)) : src
    // `free` is only ever empty for an empty source, and then so is `src`.
    const pool = free.length ? free : src
    const drawn = pool[ri(rng, pool.length)] as T
    push(drawn)
    return drawn
  }) as MemoryDeck<T>

  deck.remember = (seen: readonly T[]): void => {
    recent = []
    for (const v of seen) if (src.includes(v)) push(v)
  }
  return deck
}
