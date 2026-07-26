import { shuffle } from './rng'
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
