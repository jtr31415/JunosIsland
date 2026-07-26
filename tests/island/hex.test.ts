import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { key, parse, neighbours, toWorld, distance, DIRECTIONS } from '../../src/island/world/hex'

describe('hex', () => {
  it('round-trips a coordinate through its key', () => {
    expect(parse(key({ q: 2, r: -3 }))).toEqual({ q: 2, r: -3 })
    expect(parse(key({ q: 0, r: 0 }))).toEqual({ q: 0, r: 0 })
  })

  it('has exactly six neighbours, all distance 1', () => {
    const n = neighbours({ q: 0, r: 0 })
    expect(n).toHaveLength(6)
    expect(new Set(n.map(key)).size).toBe(6)
    for (const a of n) expect(distance({ q: 0, r: 0 }, a)).toBe(1)
  })

  it('the neighbour relation is symmetric', () => {
    // If A can reach B, B can reach A — otherwise sockets appear on one side
    // of a tile only, and the island grows lopsided.
    const a = { q: 1, r: 2 }
    for (const b of neighbours(a)) {
      expect(neighbours(b).map(key)).toContain(key(a))
    }
  })

  it('places the origin at the world origin', () => {
    expect(toWorld({ q: 0, r: 0 }, 1)).toEqual({ x: 0, z: 0 })
  })

  it('spaces every adjacent tile by exactly one tile width', () => {
    // The whole visual premise: hexes must tile without gaps or overlap.
    const size = 1
    const centre = toWorld({ q: 0, r: 0 }, size)
    for (const n of neighbours({ q: 0, r: 0 })) {
      const w = toWorld(n, size)
      const d = Math.hypot(w.x - centre.x, w.z - centre.z)
      expect(d).toBeCloseTo(Math.sqrt(3) * size, 5)
    }
  })

  it('keeps that spacing away from the origin too', () => {
    const size = 1.7
    const a = { q: 4, r: -2 }
    const wa = toWorld(a, size)
    for (const n of neighbours(a)) {
      const w = toWorld(n, size)
      expect(Math.hypot(w.x - wa.x, w.z - wa.z)).toBeCloseTo(Math.sqrt(3) * size, 5)
    }
  })

  it('never places two different coordinates at the same spot', () => {
    const seen = new Set<string>()
    for (let q = -5; q <= 5; q++) {
      for (let r = -5; r <= 5; r++) {
        const w = toWorld({ q, r }, 1)
        const at = `${w.x.toFixed(4)},${w.z.toFixed(4)}`
        expect(seen.has(at)).toBe(false)
        seen.add(at)
      }
    }
  })

  it('distance is symmetric and zero to itself', () => {
    expect(distance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0)
    expect(distance({ q: 3, r: -1 }, { q: 0, r: 2 }))
      .toBe(distance({ q: 0, r: 2 }, { q: 3, r: -1 }))
  })

  it('distance counts steps — a ring of radius 2 is all distance 2', () => {
    const origin = { q: 0, r: 0 }
    const ring = new Set<string>()
    for (const a of neighbours(origin)) {
      for (const b of neighbours(a)) {
        if (key(b) !== key(origin) && distance(origin, b) === 2) ring.add(key(b))
      }
    }
    expect(ring.size).toBe(12)
  })

  it('exposes six distinct directions', () => {
    expect(DIRECTIONS).toHaveLength(6)
    expect(new Set(DIRECTIONS.map(key)).size).toBe(6)
  })
})

describe('layout matches the actual KayKit tile', () => {
  // Read the real asset rather than trusting a remembered convention. The
  // orientation is a property of the ART, and getting it wrong tiles the
  // island with seams or overlaps.
  const gltf = JSON.parse(
    readFileSync(resolve(__dirname, '../../src/island/public/tiles/hex_grass.gltf'), 'utf8'),
  )
  const acc = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION]
  const halfX = (acc.max[0] - acc.min[0]) / 2
  const halfZ = (acc.max[2] - acc.min[2]) / 2

  it('the tile really is pointy-top', () => {
    // Pointy-top: depth (2R) exceeds width (sqrt(3)R), so halfZ > halfX.
    expect(halfZ).toBeGreaterThan(halfX)
    expect(halfZ / halfX).toBeCloseTo(2 / Math.sqrt(3), 4)
  })

  it('tiles laid out at the measured size meet exactly, with no seam or overlap', () => {
    const size = halfZ                     // circumradius, as tiles.ts measures it
    const centre = toWorld({ q: 0, r: 0 }, size)
    for (const n of neighbours({ q: 0, r: 0 })) {
      const w = toWorld(n, size)
      const gap = Math.hypot(w.x - centre.x, w.z - centre.z)
      // Two adjacent hexes touch when their centres are sqrt(3)*R apart,
      // which for this asset is exactly its flat-to-flat width.
      expect(gap).toBeCloseTo(Math.sqrt(3) * size, 5)
      expect(gap).toBeCloseTo(halfX * 2, 4)
    }
  })
})
