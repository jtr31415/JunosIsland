/**
 * Flat-top hexagonal grid on axial coordinates.
 *
 * Pure maths over plain data — no Three.js, no DOM — so the geometry the
 * whole island rests on is unit-tested without a GPU.
 *
 * Convention follows Red Blob Games' axial layout. `size` is the hex's
 * circumradius (centre to corner); adjacent centres are therefore sqrt(3)*size
 * apart, which is what makes tiles meet without gaps or overlap.
 */

export interface Axial { q: number; r: number }

/** Stable string form, for Map keys and save files. */
export const key = (a: Axial): string => `${a.q},${a.r}`

export function parse(k: string): Axial {
  const [q, r] = k.split(',')
  return { q: Number(q), r: Number(r) }
}

/** The six axial steps, in order. */
export const DIRECTIONS: readonly Axial[] = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
]

export const neighbours = (a: Axial): Axial[] =>
  DIRECTIONS.map(d => ({ q: a.q + d.q, r: a.r + d.r }))

/**
 * Axial to world position on the ground plane (y is always 0).
 * Flat-top layout: columns step by 3/2*size in x, rows shear in z.
 */
export function toWorld(a: Axial, size: number): { x: number; z: number } {
  const SQRT3 = Math.sqrt(3)
  return {
    x: size * 1.5 * a.q,
    z: size * SQRT3 * (a.r + a.q / 2),
  }
}

/** Steps between two hexes — the cube distance, expressed in axial terms. */
export function distance(a: Axial, b: Axial): number {
  const dq = a.q - b.q
  const dr = a.r - b.r
  return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2
}
