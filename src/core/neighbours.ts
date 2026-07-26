/**
 * Neighbour map: pool words one letter apart, minus sound-alike pairs.
 * Ported from v0/junos-words.html:432-460.
 *
 * These are the near-twin distractors (sat/sit) that make first-letter
 * guessing lose. The original built NEIGH as a load-time side effect; here it
 * is a function so tests can build from fixtures, but the default call
 * produces an identical map.
 */
import { GREEN, RED, groupOf } from './wordlists'
import type { MarkedWord, PlainWord, WordClass } from './wordlists'
import { plainWord } from './segmentation'

export interface PoolEntry { raw: MarkedWord; cls: WordClass }
export type NeighbourMap = Record<PlainWord, PoolEntry[]>

/** True when a and b are exactly one edit apart. Port of lev1 (v0:432). */
export function lev1(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false
  if (a.length === b.length) {
    let d = 0
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && ++d > 1) return false
    return d === 1
  }
  const long = a.length > b.length ? a : b
  const short = a.length > b.length ? b : a
  let i = 0, j = 0, skips = 0
  while (i < long.length && j < short.length) {
    if (long[i] === short[j]) { i++; j++ }
    else if (++skips > 1) return false
    else i++
  }
  return true
}

/** The full word pool, green then red. Port of POOL (v0:448). Order matters. */
export function buildPool(): PoolEntry[] {
  return [
    ...GREEN.map((w): PoolEntry => ({ raw: w, cls: 'green' })),
    ...RED.map((w): PoolEntry => ({ raw: w, cls: 'red' })),
  ]
}

/** Port of the NEIGH builder (v0:452), which ran at load time. */
export function buildNeighbours(pool: PoolEntry[]): NeighbourMap {
  const neigh: NeighbourMap = {}
  pool.forEach(a => {
    const pa = plainWord(a.raw)
    neigh[pa] = pool.filter(b => {
      const pb = plainWord(b.raw)
      return pa !== pb && lev1(pa, pb) &&
        !(groupOf[pa] !== undefined && groupOf[pa] === groupOf[pb])
    })
  })
  return neigh
}
