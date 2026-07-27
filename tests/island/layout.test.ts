import { describe, it, expect } from 'vitest'
import { layOut } from '../../src/island/world/increments'
import { FITS } from '../../src/island/world/props'

/**
 * Joe, twice: "trees are still inside the bigger rock pieces."
 *
 * The first fix went into props.ts, which dresses tiles the island grows on
 * its own — but the tiles she BUILDS come through the growing plot, which is a
 * second placement path and had no overlap check at all. It spread eight
 * pieces at fixed angles on a jittered radius and hoped; with features up to a
 * hex wide, that is not a spread, it is a pile.
 */

const HEX = 1.155                       // the measured circumradius
const radiusOf = (name: string): number =>
  ((/^(Grass|Bush|Rock)/.test(name) ? FITS.cover : FITS.grown)[0] / 2) * 0.85

/** Real seeds come from `hash(coord)`, so they are large and well mixed. */
const realistic = (n: number): number => (n * 2654435761) % 4294967296

const asPoints = (names: string[], seed: number): Array<{ x: number; z: number; r: number }> =>
  layOut(names, seed, HEX)
    .map((s, i) => s && ({
      x: Math.cos(s.angle) * s.radius,
      z: Math.sin(s.angle) * s.radius,
      r: radiusOf(names[i] as string),
    }))
    .filter((p): p is { x: number; z: number; r: number } => p !== null)

/**
 * The worst case that produced the report: eight big pieces on one hex.
 * Nothing stops the palette drawing this, so it must still come out tidy.
 */
const ALL_BIG = ['tree_single_A', 'tree_single_B', 'trees_A_small', 'rock_single_A',
  'rock_single_B', 'tree_single_A_cut', 'trees_B_small', 'rock_single_C']

/**
 * A realistic plot. The grass palette is twenty entries, eight of them
 * hexagon-pack features and twelve forest-pack cover, so a drawn plot is
 * roughly forty per cent big pieces.
 */
const TYPICAL = ['tree_single_A', 'Grass_1_A_Color1', 'rock_single_B',
  'Bush_2_A_Color1', 'Grass_2_C_Color1', 'trees_B_small',
  'Rock_1_A_Color1', 'Bush_3_A_Color1']

describe('the growing plot lays its pieces out', () => {
  it('never overlaps two pieces, across a thousand seeds', () => {
    for (let seed = 1; seed <= 1000; seed++) {
      const pts = asPoints(ALL_BIG, seed)
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i] as { x: number; z: number; r: number }
          const b = pts[j] as { x: number; z: number; r: number }
          const gap = Math.hypot(a.x - b.x, a.z - b.z) - (a.r + b.r)
          expect(gap, `seed ${seed}: pieces ${i} and ${j} intersect`).toBeGreaterThanOrEqual(-1e-9)
        }
      }
    }
  })

  it('is deterministic — the same hex grows the same plot every load', () => {
    /*
     * The rule that governs this whole file. Positions are decided up front
     * and synchronously for exactly this reason: the model loads resolve out
     * of order, so anything decided inside a `.then` would depend on network
     * timing and the island would rearrange itself between sessions.
     */
    for (const seed of [1, 7, 999, 123456]) {
      expect(layOut(TYPICAL, seed, HEX)).toEqual(layOut(TYPICAL, seed, HEX))
    }
  })

  it('gives different hexes different plots', () => {
    // Real seeds are hashes of the coordinate, so they are large and well
    // mixed; neighbouring small integers share too many low bits to differ.
    const a = JSON.stringify(layOut(TYPICAL, realistic(11), HEX))
    const b = JSON.stringify(layOut(TYPICAL, realistic(12), HEX))
    expect(a).not.toBe(b)
  })

  it('keeps everything on its own hex', () => {
    for (let seed = 1; seed <= 200; seed++) {
      for (const spot of layOut(TYPICAL, seed, HEX)) {
        if (!spot) continue
        expect(spot.radius).toBeLessThanOrEqual(HEX * 0.78 + 1e-9)
        expect(spot.radius).toBeGreaterThanOrEqual(HEX * 0.1 - 1e-9)
      }
    }
  })

  it('plants nearly all of a typical plot', () => {
    /*
     * Dropping a piece is allowed — a barer tile beats a tree in a boulder —
     * but a rule that dropped a quarter of every plot would make her tiles
     * look unfinished, which is the failure the sizing was measured to avoid.
     */
    let planted = 0
    const plots = 400
    for (let seed = 1; seed <= plots; seed++) {
      planted += layOut(TYPICAL, realistic(seed), HEX).filter(Boolean).length
    }
    // Stated as a product fact rather than as whatever the number happens to
    // be: a plot of eight still grows at least six pieces, which is a full
    // tile. Measured average is a little over six and a quarter.
    expect(planted / plots).toBeGreaterThanOrEqual(6)
  })

  it('degrades rather than piles up on an all-big plot', () => {
    // Eight hex-wide pieces genuinely cannot fit round one hex. The rule drops
    // what will not fit instead of stacking it, which is the whole point.
    let planted = 0
    const plots = 400
    for (let seed = 1; seed <= plots; seed++) {
      planted += layOut(ALL_BIG, realistic(seed), HEX).filter(Boolean).length
    }
    // Four or more big pieces still land; the rest are dropped rather than
    // stacked, which is the whole point.
    expect(planted / plots).toBeGreaterThanOrEqual(4)
  })

  it('plants all the small stuff, which has always fitted', () => {
    const cover = ['Grass_1_A_Color1', 'Bush_1_A_Color1', 'Rock_1_C_Color1',
      'Grass_2_B_Color1', 'Bush_2_A_Color1', 'Rock_2_D_Color1',
      'Grass_1_C_Color1', 'Bush_3_A_Color1']
    for (let seed = 1; seed <= 100; seed++) {
      expect(layOut(cover, seed, HEX).filter(Boolean).length).toBe(cover.length)
    }
  })
})
