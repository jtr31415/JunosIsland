/** A random source returning a float in [0, 1) — same contract as Math.random. */
export type Rng = () => number

/** Production default. Ported code consumes an Rng so tests can seed it. */
export const defaultRng: Rng = Math.random

/**
 * Small deterministic PRNG, used by tests and by the golden-output harness.
 * The harness patches the same algorithm over Math.random inside the frozen
 * original, so core/ and the original consume an identical number stream.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random integer in [0, n). Port of `ri` (v0/junos-words.html:719). */
export const ri = (rng: Rng, n: number): number => Math.floor(rng() * n)

/** In-place Fisher-Yates. Port of `shuffle` (v0/junos-words.html:713). */
export function shuffle<T>(rng: Rng, a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j] as T, a[i] as T]
  }
  return a
}
