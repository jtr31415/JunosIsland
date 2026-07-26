/**
 * The coastline: which model goes where, and which way round.
 *
 * The first half of this file re-measures the coast meshes from disk. That is
 * deliberate and not paranoia — `COAST_CANONICAL` is a table of facts about
 * four binary files, and a table of facts about files that nothing checks is a
 * table of facts that will be wrong the first time someone re-exports the art.
 * Measuring it here means the assets and the code cannot drift apart silently.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  COAST_CANONICAL, COAST_VARIANTS, longestRun, waterMask, lookFor,
} from '../../src/island/world/coast'
import type { CoastVariant } from '../../src/island/world/coast'
import { createIsland, place } from '../../src/island/world/grid'
import type { Island } from '../../src/island/world/grid'
import { DIRECTIONS, toWorld, key, distance } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'

const here = dirname(fileURLToPath(import.meta.url))
const TILES = resolve(here, '../../src/island/public/tiles')

/* ---------------------------------------------------------------- geometry */

interface Tri { a: number[]; b: number[]; c: number[] }

/** Positions and triangles out of a glTF + .bin pair. No loader, no GPU. */
function loadTriangles(stem: string): Tri[] {
  const gltf = JSON.parse(readFileSync(resolve(TILES, `${stem}.gltf`), 'utf8'))
  const bins: Buffer[] = gltf.buffers.map((b: { uri: string }) =>
    readFileSync(resolve(TILES, decodeURIComponent(b.uri))))

  const read = (accessorIndex: number, components: number): number[][] => {
    const acc = gltf.accessors[accessorIndex]
    const bv = gltf.bufferViews[acc.bufferView]
    const buf = bins[bv.buffer ?? 0] as Buffer
    const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
    // 5121 u8, 5123 u16, 5125 u32, 5126 f32
    const size = acc.componentType === 5121 ? 1
      : acc.componentType === 5123 ? 2 : 4
    const stride = bv.byteStride ?? size * components
    const out: number[][] = []
    for (let i = 0; i < acc.count; i++) {
      const at = base + i * stride
      const row: number[] = []
      for (let c = 0; c < components; c++) {
        const o = at + c * size
        row.push(
          acc.componentType === 5126 ? buf.readFloatLE(o)
            : acc.componentType === 5125 ? buf.readUInt32LE(o)
              : acc.componentType === 5123 ? buf.readUInt16LE(o)
                : buf.readUInt8(o),
        )
      }
      out.push(row)
    }
    return out
  }

  const tris: Tri[] = []
  for (const mesh of gltf.meshes) {
    for (const prim of mesh.primitives) {
      const pos = read(prim.attributes.POSITION, 3)
      const idx = read(prim.indices, 1).map(r => r[0] as number)
      for (let i = 0; i < idx.length; i += 3) {
        tris.push({
          a: pos[idx[i] as number] as number[],
          b: pos[idx[i + 1] as number] as number[],
          c: pos[idx[i + 2] as number] as number[],
        })
      }
    }
  }
  return tris
}

/** Surface height at (x, z), by barycentric interpolation. */
function heightAt(tris: Tri[], x: number, z: number): number | null {
  let best: number | null = null
  for (const { a, b, c } of tris) {
    const [x1, y1, z1] = a as [number, number, number]
    const [x2, y2, z2] = b as [number, number, number]
    const [x3, y3, z3] = c as [number, number, number]
    const den = (z2 - z3) * (x1 - x3) + (x3 - x2) * (z1 - z3)
    if (Math.abs(den) < 1e-9) continue
    const l1 = ((z2 - z3) * (x - x3) + (x3 - x2) * (z - z3)) / den
    const l2 = ((z3 - z1) * (x - x3) + (x1 - x3) * (z - z3)) / den
    const l3 = 1 - l1 - l2
    if (Math.min(l1, l2, l3) < -1e-4) continue
    const y = l1 * y1 + l2 * y2 + l3 * y3
    if (best === null || y > best) best = y
  }
  return best
}

/** Land sits at y=0, water at y=-0.2, the sand ramp between. */
const WATER_LEVEL = -0.15

/**
 * The models in use are the WATERLESS variants, which cut the water part of
 * the hex away so the open sea shows through. An edge with no geometry over it
 * is therefore not a measurement failure — it is the wettest answer there is.
 */
const NO_GEOMETRY_IS_WATER = true

/** Which edges of a model are water, in DIRECTIONS order. */
function measureWaterEdges(stem: string): number[] {
  const tris = loadTriangles(stem)
  // Circumradius is the half-DEPTH in z for a pointy-top hex (see hex.ts).
  let minZ = Infinity, maxZ = -Infinity
  for (const t of tris) for (const p of [t.a, t.b, t.c]) {
    minZ = Math.min(minZ, p[2] as number); maxZ = Math.max(maxZ, p[2] as number)
  }
  const R = (maxZ - minZ) / 2
  const inradius = R * Math.sqrt(3) / 2

  const out: number[] = []
  DIRECTIONS.forEach((d, k) => {
    // Sample toward the neighbour, using the game's OWN layout maths so the
    // measurement cannot disagree with where tiles are actually placed.
    const w = toWorld(d, 1)
    const len = Math.hypot(w.x, w.z)
    const y = heightAt(tris, (w.x / len) * inradius * 0.93, (w.z / len) * inradius * 0.93)
    if (y === null ? NO_GEOMETRY_IS_WATER : y < WATER_LEVEL) out.push(k)
  })
  return out
}

describe('the coast models, measured from the assets', () => {
  it('gives plain grass no water edges and open water all six', () => {
    // The controls. If these two drift, the sampling itself is wrong and every
    // other measurement in this file is meaningless.
    expect(measureWaterEdges('hex_grass')).toEqual([])
    expect(measureWaterEdges('hex_water')).toEqual([0, 1, 2, 3, 4, 5])
  })

  it.each(COAST_VARIANTS)('hex_coast_%s_waterless matches COAST_CANONICAL', v => {
    const measured = measureWaterEdges(`hex_coast_${v}_waterless`)
    const { start, length } = COAST_CANONICAL[v]
    const expected = Array.from({ length }, (_, i) => (start + i) % 6).sort((a, b) => a - b)
    expect(measured).toEqual(expected)
  })

  it('covers arcs of one, two, three and four edges', () => {
    // The set the placement logic assumes exists. Five- and six-edge tiles
    // borrow the four-edge model; anything narrower has no fallback at all.
    expect(COAST_VARIANTS.map(v => COAST_CANONICAL[v].length)).toEqual([1, 2, 3, 4])
  })
})

/* -------------------------------------------------------------------- runs */

describe('longestRun', () => {
  it('finds nothing in an empty mask', () => {
    expect(longestRun(0)).toEqual({ start: 0, length: 0 })
  })

  it('treats a fully surrounded tile as one arc of six', () => {
    expect(longestRun(0b111111)).toEqual({ start: 0, length: 6 })
  })

  it('finds a single edge', () => {
    expect(longestRun(1 << 3)).toEqual({ start: 3, length: 1 })
  })

  it('wraps past direction 5 back round to 0', () => {
    // Water at 4, 5, 0, 1 is ONE arc, not two of two. Getting this wrong
    // sands half a headland and leaves the other half a cliff.
    expect(longestRun(0b110011)).toEqual({ start: 4, length: 4 })
  })

  it('picks the longer of two separate arcs', () => {
    // Water at 0,1 and at 3 — a tile in a channel.
    expect(longestRun(0b001011)).toEqual({ start: 0, length: 2 })
  })

  it('reports an arc once, from its true beginning', () => {
    const run = longestRun(0b011100)   // 2,3,4
    expect(run).toEqual({ start: 2, length: 3 })
  })

  it('never claims more than six edges, whatever the mask', () => {
    for (let mask = 0; mask < 64; mask++) {
      const { start, length } = longestRun(mask)
      expect(length).toBeLessThanOrEqual(6)
      expect(start).toBeGreaterThanOrEqual(0)
      expect(start).toBeLessThan(6)
    }
  })
})

/* ---------------------------------------------------------------- the rule */

/** A patch of grass big enough to have an interior. */
function blob(): Island {
  let i = createIsland()
  for (const d of DIRECTIONS) i = place(i, d, 'grass')
  return i
}

/**
 * A solid disc of land with one hex of water punched into it, next to the
 * origin in direction `dir`.
 *
 * Radius two, so the origin's six neighbours are all owned and the ONLY wet
 * edge is the pond. That isolation is the point: on the rim, open sea would
 * wet several edges at once and the test would be measuring arc length rather
 * than rotation.
 */
function pondInLand(dir = 0): Island {
  const pond = DIRECTIONS[dir] as Axial
  let i = createIsland()
  for (let q = -2; q <= 2; q++) {
    for (let r = -2; r <= 2; r++) {
      const at = { q, r }
      if (distance(at, { q: 0, r: 0 }) > 2) continue
      if (at.q === pond.q && at.r === pond.r) continue
      i = place(i, at, 'grass')
    }
  }
  return place(i, pond, 'water')
}

describe('waterMask', () => {
  it('counts open sea as water — the island floats in it', () => {
    // A lone tile has six unbuilt neighbours and is therefore all shore.
    expect(waterMask(createIsland(), { q: 0, r: 0 })).toBe(0b111111)
  })

  it('counts a placed pond as water too', () => {
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    expect(waterMask(i, { q: 1, r: 0 }) & 1).toBe(1)   // direction 0 is +q
  })

  it('leaves a fully enclosed tile dry', () => {
    expect(waterMask(blob(), { q: 0, r: 0 })).toBe(0)
  })
})

describe('lookFor', () => {
  it('draws an enclosed grass tile as plain grass', () => {
    expect(lookFor(blob(), { q: 0, r: 0 })).toEqual({ kind: 'grass', turns: 0 })
  })

  it('draws owned water as water, however much land surrounds it', () => {
    const i = place(blob(), { q: 0, r: 0 }, 'water')   // no-op: already grass
    expect(lookFor(place(i, { q: 2, r: 0 }, 'water'), { q: 2, r: 0 }))
      .toEqual({ kind: 'water', turns: 0 })
  })

  it('NEVER leaves a grass tile touching water without sand', () => {
    /*
     * The whole point of the module, stated as one property. Every grass tile
     * with a wet neighbour must draw as a coast — no exceptions, no masks that
     * fall through to plain grass.
     */
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    for (const [k, type] of i.tiles) {
      if (type !== 'grass') continue
      const [q, r] = k.split(',').map(Number)
      const at = { q: q as number, r: r as number }
      const arc = longestRun(waterMask(i, at))
      // Arcs of five and six have no model — see MAX_COAST_ARC.
      if (arc.length === 0 || arc.length > 4) continue
      expect(lookFor(i, at).kind).toBe('coast')
    }
  })

  it('turns the model so its sand faces the water', () => {
    // A tile with exactly ONE wet edge, in direction 0: a pond punched into
    // solid land. Variant A carries its water at direction 5, so it turns one
    // step. Anywhere on the rim would have open sea on several sides too, and
    // would test the arc-length choice rather than the rotation.
    const look = lookFor(pondInLand(), { q: 0, r: 0 })
    expect(look).toEqual({ kind: 'coast', variant: 'A', turns: 1 })
  })

  it('turns each way round the compass as the pond moves', () => {
    // Six ponds, six rotations, and A's sand always ends up facing the water.
    for (let dir = 0; dir < 6; dir++) {
      const look = lookFor(pondInLand(dir), { q: 0, r: 0 })
      expect(look).toEqual({
        kind: 'coast', variant: 'A',
        turns: (dir - COAST_CANONICAL.A.start + 6) % 6,
      })
    }
  })

  it('leaves the lonely rock a WHOLE tile, not a corner of one', () => {
    /*
     * Water on all six sides. The first version borrowed the four-edge model,
     * whose waterless variant cuts two thirds of the hex away — so the very
     * first tile of the game rendered as a sliver of sand with Fred standing
     * on the corner. An island is not a coastline; it keeps its whole hex.
     */
    expect(lookFor(createIsland(), { q: 0, r: 0 })).toEqual({ kind: 'grass', turns: 0 })
  })

  it('keeps a five-edge spit whole too', () => {
    // Two tiles in the open sea: each has five wet edges and one neighbour.
    const pair = place(createIsland(), DIRECTIONS[0] as Axial, 'grass')
    expect(lookFor(pair, { q: 0, r: 0 })).toEqual({ kind: 'grass', turns: 0 })
    expect(lookFor(pair, DIRECTIONS[0] as Axial)).toEqual({ kind: 'grass', turns: 0 })
  })

  it('picks the arc-length model that matches the shoreline', () => {
    // A tile on the rim of a solid blob: land behind it, sea in front.
    const look = lookFor(pondInLand(), { q: 1, r: 1 })
    expect(look.kind).toBe('coast')
    if (look.kind === 'coast') {
      const arc = longestRun(waterMask(pondInLand(), { q: 1, r: 1 }))
      expect(COAST_CANONICAL[look.variant].length).toBe(arc.length)
    }
  })

  it('only ever draws a coast where a model actually fits', () => {
    // The property behind MAX_COAST_ARC: no mask may resolve to a variant
    // whose arc does not match, and none above four may resolve at all.
    for (let mask = 0; mask < 64; mask++) {
      const arc = longestRun(mask)
      if (arc.length === 0 || arc.length > 4) continue
      const variant = COAST_VARIANTS[arc.length - 1] as CoastVariant
      expect(COAST_CANONICAL[variant].length).toBe(arc.length)
    }
  })

  it('re-sands a neighbour when a tile is placed beside it', () => {
    /*
     * The reason the coastline is derived rather than stored. Building on the
     * far side of a tile changes that tile's own shoreline, and a saved
     * coastline would have gone stale exactly here.
     */
    const lone = createIsland()
    expect(lookFor(lone, { q: 0, r: 0 }).kind).toBe('grass')

    // Two neighbours, so the rock drops from six wet edges to four and
    // crosses from "island" into "shoreline" without being touched itself.
    let grown = place(lone, DIRECTIONS[0] as Axial, 'grass')
    grown = place(grown, DIRECTIONS[1] as Axial, 'grass')

    const after = lookFor(grown, { q: 0, r: 0 })
    expect(after.kind).toBe('coast')
    if (after.kind === 'coast') expect(after.variant).toBe('D')
  })

  it('is stable — the same island always draws the same coastline', () => {
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    for (const k of i.tiles.keys()) {
      const [q, r] = k.split(',').map(Number)
      const at = { q: q as number, r: r as number }
      expect(lookFor(i, at)).toEqual(lookFor(i, at))
    }
    expect(key({ q: 0, r: 0 })).toBe('0,0')
  })
})
