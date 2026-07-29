/**
 * PB-053: the mountain that was refused, and the bare hex nobody notices.
 *
 * `props.ts` dresses one hex at a time and keeps a running list of what it has
 * already put down. A mountain sits DEAD CENTRE on its hex — `spread` is 0 for a
 * rock tile (props.ts:1179), so unlike a tree it gets exactly one candidate
 * position and no second chance. If that one position stands inside a mountain
 * already placed, `firstClear` returns null, props.ts:1232 marks the hex done
 * and moves on, and the hex stays BARE for the rest of the session: a rock tile
 * with no rock on it, never retried.
 *
 * That happens because two mountains are wider than the hexes they stand on.
 * Adjacent centres are 2.0000 apart and the C-family models measure 1.0115 in
 * placement radius, so a C beside a C overlaps by 0.023 and one of the two is
 * silently dropped. Which one is decided by nothing more principled than Map
 * insertion order.
 *
 * TWO METRICS, and the gap between them is the whole family of bugs. Placement
 * asks `footprintOf` — half the widest axis-aligned box extent. Pets collide on
 * `footprintBelow(obj, 0.3)` — the furthest any vertex below walking height
 * reaches from the box centre. The second is LARGER for every mountain model, so
 * there is a band of separations where placement says "these two are fine" and a
 * walking pet says "there is no way between them" (PB-052). Both tables are
 * pinned below, and the last test in the file states the inequality outright.
 *
 * Everything here re-measures the real `.gltf` files rather than quoting a
 * number, for the reason `coast.test.ts` and `walk.test.ts` do: a fact about a
 * binary asset that nothing checks is a fact that goes stale the first time
 * someone re-exports the art. The tables in `mountains.ts` exist so that pure
 * code can reason about the geometry without Three.js; this file is the thing
 * that keeps them honest.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { place } from '../../src/island/world/grid'
import type { Island, TileType } from '../../src/island/world/grid'
import { key, distance, toWorld, DIRECTIONS } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
import {
  MOUNTAIN_HEXES, mountainHexFor,
  MOUNTAIN_KEEPOUT, MOUNTAIN_FOOTPRINT, NATIVE_HEX_SIZE,
  keepOutFor, bareRockHexes,
} from '../../src/island/world/mountains'
import type { KeepOut } from '../../src/island/world/walk'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '../../src/island/public')

/* ------------------------------------------------------------ real geometry */

/**
 * Every POSITION out of a glTF + .bin pair. No loader, no GPU.
 *
 * The same accessor walk as `coast.test.ts:42` and `walk.test.ts:51`, honouring
 * `byteStride` and the four component types, because a glTF that packs its
 * positions interleaved reads as garbage without it.
 */
function positionsOf(rel: string): number[][] {
  const dir = dirname(resolve(PUBLIC, rel))
  const gltf = JSON.parse(readFileSync(resolve(PUBLIC, rel), 'utf8')) as {
    buffers: Array<{ uri: string }>
    bufferViews: Array<{ buffer?: number; byteOffset?: number; byteStride?: number }>
    accessors: Array<{ bufferView: number; byteOffset?: number; componentType: number; count: number }>
    meshes: Array<{ primitives: Array<{ attributes: { POSITION: number } }> }>
  }
  const bins = gltf.buffers.map(b => readFileSync(resolve(dir, decodeURIComponent(b.uri))))

  const read = (accessorIndex: number, components: number): number[][] => {
    const acc = gltf.accessors[accessorIndex]!
    const bv = gltf.bufferViews[acc.bufferView]!
    const buf = bins[bv.buffer ?? 0] as Buffer
    const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
    // 5121 u8, 5123 u16, 5125 u32, 5126 f32
    const size = acc.componentType === 5121 ? 1 : acc.componentType === 5123 ? 2 : 4
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

  const pts: number[][] = []
  for (const mesh of gltf.meshes) {
    for (const prim of mesh.primitives) pts.push(...read(prim.attributes.POSITION, 3))
  }
  return pts
}

const pointsCache = new Map<string, number[][]>()
const mountainPoints = (stem: string): number[][] => {
  const hit = pointsCache.get(stem)
  if (hit) return hit
  const pts = positionsOf(`props/${stem}.gltf`)
  pointsCache.set(stem, pts)
  return pts
}

/**
 * `footprintOf(obj)` (props.ts:363), recomputed from the file.
 *
 * Half the WIDER of the two horizontal box extents. Measured PRE-ROTATION and
 * at NATIVE SIZE, because that is the state the object is in at props.ts:1214:
 * `fitInto` is gated behind `if (!rockTile)` at props.ts:1209 so no scale is
 * ever applied to a mountain, and `obj.rotation.y` is not set until
 * props.ts:1240 — twenty-six lines AFTER the radius has been taken and used.
 *
 * That ordering is not a detail. It means placement judges a mountain by its
 * unrotated box even though the mountain that ends up on screen is spun.
 */
function measureFootprint(stem: string): number {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
  for (const p of mountainPoints(stem)) {
    const x = p[0] as number, z = p[2] as number
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
  }
  return Math.max(maxX - minX, maxZ - minZ) / 2
}

/**
 * `footprintBelow(obj, WALKING_HEIGHT)` (props.ts:391), recomputed from the file.
 *
 * The XZ box centre of the whole model, then the furthest any vertex BELOW
 * `minY + 0.3` reaches from it. Below walking height, because that is the only
 * part of a mountain a pet can bump into. Unrotated, matching the tables: the
 * spin is per-hex and a table cannot hold it.
 */
function measureKeepOut(stem: string): number {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, minZ = Infinity, maxZ = -Infinity
  const pts = mountainPoints(stem)
  for (const p of pts) {
    const x = p[0] as number, y = p[1] as number, z = p[2] as number
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
    minY = Math.min(minY, y)
  }
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const ceiling = minY + 0.3                                    // props.WALKING_HEIGHT

  let reach = 0
  for (const p of pts) {
    const x = p[0] as number, y = p[1] as number, z = p[2] as number
    if (y > ceiling) continue
    reach = Math.max(reach, Math.hypot(x - cx, z - cz))
  }
  return reach
}

/**
 * The hex circumradius, measured the way `tiles.ts:130` measures it: HALF THE
 * Z-EXTENT of the grass hex, not the x-extent. There is no hex-size constant in
 * the runtime source and `NATIVE_HEX_SIZE` must agree with what the game
 * actually computes off the mesh at load.
 */
function measureHexSize(): number {
  const pts = positionsOf('tiles/hex_grass.gltf')
  let lo = Infinity, hi = -Infinity
  for (const p of pts) { lo = Math.min(lo, p[2] as number); hi = Math.max(hi, p[2] as number) }
  return (hi - lo) / 2
}

/* ---------------------------------------------------------------- the world */

/**
 * An island built with the tiles in a KNOWN insertion order.
 *
 * `place` refuses an occupied hex and `createIsland` seeds the origin, so
 * neither can express "these two, in this order" — and order is the entire
 * subject of half this file. The Map is therefore built by hand.
 */
function islandOf(entries: ReadonlyArray<readonly [Axial, TileType]>): Island {
  const tiles = new Map<string, TileType>()
  for (const [a, t] of entries) tiles.set(key(a), t)
  return { tiles }
}

/**
 * An adjacent pair that really does collide, found by asking `mountainHexFor`
 * rather than by assuming. Both are `mountain_C_grass_trees`, whose placement
 * radius is 1.0115 — and 2 x 1.0115 = 2.0230, wider than the 2.0000 between
 * adjacent hex centres. This is the nearest such pair to the origin.
 */
const FIRST: Axial = { q: 1, r: 0 }
const SECOND: Axial = { q: 2, r: 0 }

/** Everything within `d` steps of the origin, all grass. */
function meadow(d: number): Island {
  const entries: Array<readonly [Axial, TileType]> = []
  for (let q = -d; q <= d; q++) {
    for (let r = -d; r <= d; r++) {
      if (distance({ q: 0, r: 0 }, { q, r }) > d) continue
      entries.push([{ q, r }, 'grass'])
    }
  }
  return islandOf(entries)
}

/* --------------------------------------------------------------- the pins */

describe('the measured tables are the real geometry', () => {
  it('re-measures every keep-out radius off disk', () => {
    for (const { name } of MOUNTAIN_HEXES) {
      expect(measureKeepOut(name)).toBeCloseTo(MOUNTAIN_KEEPOUT[name] as number, 4)
    }
  })

  it('re-measures every placement footprint off disk', () => {
    for (const { name } of MOUNTAIN_HEXES) {
      expect(measureFootprint(name)).toBeCloseTo(MOUNTAIN_FOOTPRINT[name] as number, 4)
    }
  })

  it('re-measures the hex size the way tiles.ts does', () => {
    expect(measureHexSize()).toBeCloseTo(NATIVE_HEX_SIZE, 4)
    // ...and the number that follows from it, which is the one every argument
    // about mountains overlapping is actually about.
    expect(Math.sqrt(3) * NATIVE_HEX_SIZE).toBeCloseTo(2.0, 4)
  })

  it('has a number for every model and no model without one', () => {
    /*
     * The point of the assertion. A ninth mountain added to `MOUNTAIN_HEXES`
     * with no measured radius beside it would make `keepOutFor` return
     * undefined and `bareRockHexes` compare against NaN — silently, and only
     * for the hexes that happened to hash to it. Fail here instead.
     */
    const names = MOUNTAIN_HEXES.map(m => m.name).sort()
    expect(Object.keys(MOUNTAIN_KEEPOUT).sort()).toEqual(names)
    expect(Object.keys(MOUNTAIN_FOOTPRINT).sort()).toEqual(names)
    expect(names).toHaveLength(8)
  })
})

/* ------------------------------------------------------------- keepOutFor */

describe('keepOutFor', () => {
  it('is a KeepOut, structurally — walk.ts can be handed it directly', () => {
    const asKeepOut: KeepOut = keepOutFor
    expect(asKeepOut(FIRST, 'rock')).toBeCloseTo(MOUNTAIN_KEEPOUT['mountain_C_grass_trees'] as number, 6)
  })

  it('gives a rock hex the radius of the mountain it actually grows', () => {
    for (const a of [FIRST, SECOND, { q: 0, r: 0 }, { q: -3, r: 2 }, { q: 7, r: -4 }]) {
      expect(keepOutFor(a, 'rock')).toBe(MOUNTAIN_KEEPOUT[mountainHexFor(a)])
      expect(keepOutFor(a, 'rock')).toBeGreaterThan(1.0)
    }
  })

  it('gives open ground nothing to walk round', () => {
    expect(keepOutFor(FIRST, 'grass')).toBe(0)
    expect(keepOutFor(FIRST, 'water')).toBe(0)
  })
})

/* ----------------------------------------------------------------- PB-053 */

describe('PB-053: a rock hex whose mountain is refused stays bare', () => {
  it('drops the SECOND of two colliding neighbours', () => {
    // Not assumed — the pair is a genuine hash outcome, checked here so that a
    // change to `hash` or the weights fails loudly rather than quietly making
    // this test vacuous.
    expect(mountainHexFor(FIRST)).toBe('mountain_C_grass_trees')
    expect(mountainHexFor(SECOND)).toBe('mountain_C_grass_trees')
    const wa = toWorld(FIRST, NATIVE_HEX_SIZE)
    const wb = toWorld(SECOND, NATIVE_HEX_SIZE)
    const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(FIRST)] as number)
      + (MOUNTAIN_FOOTPRINT[mountainHexFor(SECOND)] as number)
    expect(Math.hypot(wa.x - wb.x, wa.z - wb.z)).toBeLessThan(sum)

    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    expect(bareRockHexes(island).map(key)).toEqual([key(SECOND)])
  })

  it('the survivor keeps its mountain — exactly one of the two is lost', () => {
    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    expect(bareRockHexes(island)).toHaveLength(1)
    expect(bareRockHexes(island).map(key)).not.toContain(key(FIRST))
  })

  it('ORDER decides it — the same two hexes the other way round', () => {
    /*
     * The sharpest statement of the defect. Nothing about the geometry changed;
     * the only difference is which key went into the Map first. A bug whose
     * victim depends on iteration order is a bug that will look intermittent to
     * anyone who meets it in the browser.
     */
    const forward = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    const backward = islandOf([[SECOND, 'rock'], [FIRST, 'rock']])
    expect(bareRockHexes(forward).map(key)).toEqual([key(SECOND)])
    expect(bareRockHexes(backward).map(key)).toEqual([key(FIRST)])
  })

  it('is unaffected by grass tiles sharing the map', () => {
    // Grass hexes grow features too, but this model only knows about mountains
    // and says so in its header. What it must not do is trip over them.
    const island = islandOf([
      [{ q: 0, r: 0 }, 'grass'], [FIRST, 'rock'],
      [{ q: 0, r: 1 }, 'grass'], [SECOND, 'rock'],
      [{ q: 3, r: -1 }, 'grass'],
    ])
    expect(bareRockHexes(island).map(key)).toEqual([key(SECOND)])
  })
})

/* ------------------------------------------------------------- the rate */

describe('how often it happens', () => {
  /** Every adjacent pair inside a disc of radius R, each side counted once. */
  function adjacentPairs(R: number): Array<readonly [Axial, Axial]> {
    const out: Array<readonly [Axial, Axial]> = []
    for (let q = -R; q <= R; q++) {
      for (let r = -R; r <= R; r++) {
        const a = { q, r }
        if (distance({ q: 0, r: 0 }, a) > R) continue
        for (const d of DIRECTIONS) {
          const b = { q: q + d.q, r: r + d.r }
          if (distance({ q: 0, r: 0 }, b) > R) continue
          if (key(a) >= key(b)) continue
          out.push([a, b] as const)
        }
      }
    }
    return out
  }

  it('about one adjacent rock pair in seven leaves a bare hex', () => {
    const pairs = adjacentPairs(46)
    expect(pairs.length).toBe(19182)

    let collide = 0
    for (const [a, b] of pairs) {
      const wa = toWorld(a, NATIVE_HEX_SIZE)
      const wb = toWorld(b, NATIVE_HEX_SIZE)
      const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(a)] as number)
        + (MOUNTAIN_FOOTPRINT[mountainHexFor(b)] as number)
      if (Math.hypot(wa.x - wb.x, wa.z - wb.z) < sum) collide++
    }

    /*
     * MEASURED: 2763 of 19182 adjacent pairs, 14.4041%. Phase 4 measured 14.5%
     * over 19,440 pairs by a slightly different enumeration and the two agree.
     *
     * And the number is not a coincidence. Only the C family is wide enough to
     * overlap a neighbour — 2 x 1.0115 = 2.0230 against the 2.0000 between
     * centres, where A and B reach only 2 x 0.9381 = 1.8762 and a mixed pair
     * 1.9496. The C models carry weight 2 + 3 + 3 of 21, so a hash that is
     * anywhere near uniform gives (8/21)^2 = 14.51% of pairs both-C. This test
     * is therefore also a check that `hash` has not developed a bias.
     *
     * The band is deliberately wide. It is here to catch a re-export that moves
     * the geometry or a change that reweights the table — not to pin four
     * decimal places of a statistic.
     */
    const rate = collide / pairs.length
    expect(rate).toBeGreaterThan(0.08)
    expect(rate).toBeLessThan(0.25)
    expect(collide).toBe(2763)
  })

  it('every colliding pair really does produce a bare hex', () => {
    // The rate above is arithmetic on the table; this walks the same pairs
    // through `bareRockHexes` so the statistic and the function cannot drift.
    let checked = 0
    for (const [a, b] of adjacentPairs(8)) {
      const wa = toWorld(a, NATIVE_HEX_SIZE)
      const wb = toWorld(b, NATIVE_HEX_SIZE)
      const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(a)] as number)
        + (MOUNTAIN_FOOTPRINT[mountainHexFor(b)] as number)
      const overlaps = Math.hypot(wa.x - wb.x, wa.z - wb.z) < sum
      const bare = bareRockHexes(islandOf([[a, 'rock'], [b, 'rock']]))
      expect(bare.map(key)).toEqual(overlaps ? [key(b)] : [])
      checked++
    }
    expect(checked).toBeGreaterThan(500)
  })
})

/* ------------------------------------------------------- negative controls */

describe('bareRockHexes does not cry wolf', () => {
  it('finds nothing on a grass island', () => {
    expect(bareRockHexes(meadow(3))).toHaveLength(0)
    expect(bareRockHexes(meadow(0))).toHaveLength(0)
  })

  it('never strands a lone mountain', () => {
    for (const a of [{ q: 0, r: 0 }, FIRST, SECOND, { q: -5, r: 3 }]) {
      const island = place(meadow(3), a, 'rock')
      expect(bareRockHexes(islandOf([[a, 'rock']]))).toHaveLength(0)
      // ...and the same hex inside a field of grass, which changes nothing.
      expect(bareRockHexes(island)).toHaveLength(0)
    }
  })

  it('never collides two hexes TWO steps apart', () => {
    /*
     * The premise this model shares with `walk.ts`: only neighbours can reach
     * each other. The closest non-adjacent pair sits 3.4641 apart and the two
     * widest footprints sum to 2.0230, so there is better than a unit and a
     * half of headroom. If a re-export ever broke that, `bareRockHexes` would
     * start UNDER-reporting, and this is the tripwire.
     */
    const widest = Math.max(...Object.values(MOUNTAIN_FOOTPRINT))
    expect(2 * widest).toBeLessThan(3 * NATIVE_HEX_SIZE)

    let checked = 0
    for (let q = -6; q <= 6; q++) {
      for (let r = -6; r <= 6; r++) {
        const b = { q, r }
        if (distance({ q: 0, r: 0 }, b) !== 2) continue
        expect(bareRockHexes(islandOf([[{ q: 0, r: 0 }, 'rock'], [b, 'rock']]))).toHaveLength(0)
        checked++
      }
    }
    expect(checked).toBe(12)
  })

  it('is deterministic and does not mutate the island', () => {
    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock'], [{ q: 3, r: 0 }, 'rock']])
    const before = [...island.tiles.entries()].map(([k, v]) => `${k}=${v}`)
    const a = bareRockHexes(island).map(key)
    const b = bareRockHexes(island).map(key)
    expect(a).toEqual(b)
    expect([...island.tiles.entries()].map(([k, v]) => `${k}=${v}`)).toEqual(before)
  })

  it('scales the geometry when asked about a different hex size', () => {
    // Twice the hex, same models: the mountains no longer reach each other.
    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    expect(bareRockHexes(island, 2 * NATIVE_HEX_SIZE)).toHaveLength(0)
    // ...and half the hex puts every neighbouring pair on top of each other.
    expect(bareRockHexes(island, NATIVE_HEX_SIZE / 2)).toHaveLength(1)
  })
})

/* -------------------------------------------------- the metric mismatch */

describe('placement and pets do not measure the same mountain', () => {
  it('the walking-height radius is LARGER than the placement radius, for every model', () => {
    /*
     * THE ROOT OF PB-052 AND PB-053, in one inequality.
     *
     * `footprintOf` takes half the widest box extent — a diagonal measurement
     * of a box, which for a mountain whose widest part is a corner of its own
     * bounding box UNDERSTATES the distance from the centre to that corner.
     * `footprintBelow` measures radially instead, from the box centre to the
     * furthest vertex, and radial always wins.
     *
     * So placement accepts two mountains whose walking-height discs already
     * overlap. PB-052 is what a pet does about it (nothing: it cannot get
     * through). PB-053 is the other end — the cases where even the SMALLER
     * metric overlaps, and placement silently drops the second mountain.
     *
     * Which also means the two defects cannot both be fixed by picking one
     * metric. Tightening placement to the walking radius would make PB-052
     * impossible and PB-053 UNIVERSAL: the smallest walking radius is 1.0269
     * and two of them sum to 2.0538, wider than every adjacent gap on the
     * board. That is asserted below rather than left as a remark.
     */
    for (const { name } of MOUNTAIN_HEXES) {
      expect(MOUNTAIN_FOOTPRINT[name] as number).toBeLessThan(MOUNTAIN_KEEPOUT[name] as number)
    }
  })

  it('every pair of adjacent mountains overlaps at WALKING height', () => {
    const smallest = Math.min(...Object.values(MOUNTAIN_KEEPOUT))
    const spacing = Math.sqrt(3) * NATIVE_HEX_SIZE
    // No pair of neighbours, of any two models, leaves a pet room to pass.
    expect(2 * smallest).toBeGreaterThan(spacing)
  })

  it('but only some pairs overlap at PLACEMENT size', () => {
    // Which is why PB-053 is intermittent and PB-052 is not.
    const smallest = Math.min(...Object.values(MOUNTAIN_FOOTPRINT))
    const widest = Math.max(...Object.values(MOUNTAIN_FOOTPRINT))
    const spacing = Math.sqrt(3) * NATIVE_HEX_SIZE
    expect(2 * smallest).toBeLessThan(spacing)                  // A beside A: fine
    expect(2 * widest).toBeGreaterThan(spacing)                 // C beside C: not
  })
})
