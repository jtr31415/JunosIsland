/**
 * POINTY-TOP hexagonal grid on axial coordinates.
 *
 * Pure maths over plain data — no Three.js, no DOM — so the geometry the
 * whole island rests on is unit-tested without a GPU.
 *
 * Orientation is dictated by the art, not by preference: the KayKit hex has a
 * z-extent of 2.309 against an x-extent of 2.0, which is pointy-top (width
 * sqrt(3)*R, depth 2*R). Laying it out flat-top leaves visible seams that look
 * like a bug in this file rather than a mismatched convention — so the
 * orientation is asserted against the real asset in the tests.
 *
 * `size` is the circumradius (centre to point). Adjacent centres are therefore
 * sqrt(3)*size apart, which is true of both orientations and is what makes
 * tiles meet without gaps or overlap.
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
 * Pointy-top layout: rows step by 3/2*size in z, columns shear in x.
 */
export function toWorld(a: Axial, size: number): { x: number; z: number } {
  const SQRT3 = Math.sqrt(3)
  return {
    x: size * SQRT3 * (a.q + a.r / 2),
    z: size * 1.5 * a.r,
  }
}

/** Steps between two hexes — the cube distance, expressed in axial terms. */
export function distance(a: Axial, b: Axial): number {
  const dq = a.q - b.q
  const dr = a.r - b.r
  return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2
}
