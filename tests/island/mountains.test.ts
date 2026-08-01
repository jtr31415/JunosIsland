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
 * THE FIX, and what it may not disturb. A refused rock hex now asks
 * `mountainFallbackFor` for a narrower peak and tries once more, so the bare hex
 * is gone: the sweep that measured 2763 bare hexes over 19182 adjacent pairs
 * measures none. What did NOT change is the PRIMARY chooser — the same 2763
 * pairs still collide on first choice, `{q:1,r:0}` and `{q:2,r:0}` still both
 * hash to `mountain_C_grass_trees`, and every mountain that stands today stands
 * in the same place tomorrow. Those pins are kept below, deliberately, as the
 * statement that existing saves render identically.
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
  MOUNTAIN_FALLBACKS, mountainFallbackFor,
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
    expect(asKeepOut(FIRST, 'rock')).toBeGreaterThan(1.0)
  })

  /*
   * CHANGED BY PB-053, and this is the honest form of the old assertion.
   *
   * It used to be `toBe(MOUNTAIN_KEEPOUT[mountainHexFor(a)])` — the radius of
   * the mountain the hex grows. A hex may now grow either the primary model or,
   * where the primary was refused, the fallback, and which of the two happened
   * depends on the NEIGHBOURS and on Map insertion order. `keepOutFor(a, t)` is
   * given a coordinate and a tile type and can see neither, so it cannot answer
   * exactly and does not pretend to: it answers with the larger of the two.
   *
   * The direction is the point. The fallback family is narrower at PLACEMENT
   * size (that is why it fits) and WIDER at walking height, so quoting the
   * primary for a hex that grew a fallback would under-report the space a pet
   * needs — and `walk.ts` under-reporting is a pet sealed into a pocket the
   * rules swore was open. Over-reporting only costs a refused tile placement.
   */
  it('gives a rock hex a radius no smaller than either mountain it might grow', () => {
    for (const a of [FIRST, SECOND, { q: 0, r: 0 }, { q: -3, r: 2 }, { q: 7, r: -4 }]) {
      const primary = MOUNTAIN_KEEPOUT[mountainHexFor(a)] as number
      const fallback = MOUNTAIN_KEEPOUT[mountainFallbackFor(a)] as number
      expect(keepOutFor(a, 'rock')).toBe(Math.max(primary, fallback))
      expect(keepOutFor(a, 'rock')).toBeGreaterThanOrEqual(primary)
      expect(keepOutFor(a, 'rock')).toBeGreaterThan(1.0)
    }
  })

  it('never under-reports, on any hex, and never invents a radius', () => {
    // The bound is conservative but not arbitrary: it is always the keep-out of
    // a REAL model, never a number no mountain has.
    const real = new Set(Object.values(MOUNTAIN_KEEPOUT))
    const widest = Math.max(...Object.values(MOUNTAIN_KEEPOUT))
    for (let q = -12; q <= 12; q++) {
      for (let r = -12; r <= 12; r++) {
        const a = { q, r }
        const out = keepOutFor(a, 'rock')
        expect(out).toBeGreaterThanOrEqual(MOUNTAIN_KEEPOUT[mountainHexFor(a)] as number)
        expect(out).toBeLessThanOrEqual(widest)
        expect(real.has(out)).toBe(true)
      }
    }
  })

  it('gives open ground nothing to walk round', () => {
    expect(keepOutFor(FIRST, 'grass')).toBe(0)
    expect(keepOutFor(FIRST, 'water')).toBe(0)
  })
})

/* ------------------------------------------------------ the second chooser */

describe('mountainFallbackFor: the peak a refused hex gets instead', () => {
  const SPACING = Math.sqrt(3) * NATIVE_HEX_SIZE

  it('is a pure function of the hex, and stable', () => {
    for (let q = -20; q <= 20; q++) {
      for (let r = -20; r <= 20; r++) {
        const a = { q, r }
        const name = mountainFallbackFor(a)
        // Twice the same question, twice the same answer — and the same answer
        // for a freshly built coordinate object, so nothing is keyed on identity.
        expect(mountainFallbackFor(a)).toBe(name)
        expect(mountainFallbackFor({ q, r })).toBe(name)
      }
    }
  })

  it('only ever names a model that exists in the table', () => {
    const names = new Set(MOUNTAIN_HEXES.map(m => m.name))
    for (let q = -12; q <= 12; q++) {
      for (let r = -12; r <= 12; r++) {
        expect(names.has(mountainFallbackFor({ q, r }))).toBe(true)
      }
    }
  })

  /**
   * THE ASSERTION THE FIX RESTS ON.
   *
   * A retry that can be refused for the same reason is not a retry. Derived from
   * the MEASURED table rather than from a list of names, so a re-export that
   * widened `mountain_A` past the point where two of them fit side by side fails
   * here instead of quietly reinstating the bare hex.
   */
  it('every fallback actually fits where the primary did not', () => {
    for (const m of MOUNTAIN_FALLBACKS) {
      const r = MOUNTAIN_FOOTPRINT[m.name] as number
      // Beside another of itself...
      expect(2 * r).toBeLessThan(SPACING)
      // ...and beside the widest thing that could already be standing there,
      // which is the case that actually arises: the fallback fires precisely
      // when a neighbour has taken the room.
      expect(r + Math.max(...Object.values(MOUNTAIN_FOOTPRINT))).toBeLessThan(SPACING)
    }
    expect(MOUNTAIN_FALLBACKS.length).toBeGreaterThan(0)
  })

  it('the narrow list is the A/B family, by measurement and not by name', () => {
    // Stated as arithmetic, then checked against what the table happens to hold
    // today, so the two cannot drift apart silently.
    const narrow = MOUNTAIN_HEXES
      .filter(m => (MOUNTAIN_FOOTPRINT[m.name] as number) < SPACING / 2)
      .map(m => m.name).sort()
    expect(MOUNTAIN_FALLBACKS.map(m => m.name).sort()).toEqual(narrow)
    expect(narrow).toEqual([
      'mountain_A', 'mountain_A_grass', 'mountain_A_grass_trees',
      'mountain_B', 'mountain_B_grass',
    ])
  })

  it('is DISJOINT from the models that can be refused', () => {
    /*
     * The C family is the only family wide enough to be refused, and it is
     * exactly the family the fallback cannot name. So the retry is never a
     * re-run of the choice that just failed — which is what makes "try again"
     * different from "try again and lose again".
     */
    const fallbacks = new Set(MOUNTAIN_FALLBACKS.map(m => m.name))
    const wide = MOUNTAIN_HEXES
      .filter(m => 2 * (MOUNTAIN_FOOTPRINT[m.name] as number) > SPACING)
      .map(m => m.name)
    expect(wide.length).toBeGreaterThan(0)
    for (const name of wide) expect(fallbacks.has(name)).toBe(false)
    // ...and said the other way round, over the hexes that really collide.
    for (let q = -12; q <= 12; q++) {
      for (let r = -12; r <= 12; r++) {
        const a = { q, r }
        const primary = mountainHexFor(a)
        if (2 * (MOUNTAIN_FOOTPRINT[primary] as number) <= SPACING) continue
        expect(mountainFallbackFor(a)).not.toBe(primary)
      }
    }
  })

  it('reaches every model in the narrow list, so the retry is not one peak', () => {
    const seen = new Set<string>()
    for (let q = -12; q <= 12; q++) {
      for (let r = -12; r <= 12; r++) seen.add(mountainFallbackFor({ q, r }))
    }
    expect(seen.size).toBe(MOUNTAIN_FALLBACKS.length)
  })

  it('leaves the PRIMARY chooser alone — the pins that saves depend on', () => {
    /*
     * Island geometry is deterministic from the coordinate and existing saves
     * must render byte-identically. The fallback runs only where nothing stood
     * before, so nothing that stands may move.
     */
    expect(mountainHexFor(FIRST)).toBe('mountain_C_grass_trees')
    expect(mountainHexFor(SECOND)).toBe('mountain_C_grass_trees')
    expect(MOUNTAIN_HEXES.map(m => `${m.name}:${m.weight}`)).toEqual([
      'mountain_A:2', 'mountain_B:2', 'mountain_C:2',
      'mountain_A_grass:3', 'mountain_B_grass:3', 'mountain_C_grass:3',
      'mountain_A_grass_trees:3', 'mountain_C_grass_trees:3',
    ])
  })
})

/* ----------------------------------------------------------------- PB-053 */

describe('PB-053: a refused mountain becomes a smaller mountain, not a bare hex', () => {
  it('the two neighbours still collide on FIRST choice — and both stand anyway', () => {
    // Not assumed — the pair is a genuine hash outcome, checked here so that a
    // change to `hash` or the weights fails loudly rather than quietly making
    // this test vacuous. THE COLLISION IS UNCHANGED; only the outcome is.
    expect(mountainHexFor(FIRST)).toBe('mountain_C_grass_trees')
    expect(mountainHexFor(SECOND)).toBe('mountain_C_grass_trees')
    const wa = toWorld(FIRST, NATIVE_HEX_SIZE)
    const wb = toWorld(SECOND, NATIVE_HEX_SIZE)
    const gap = Math.hypot(wa.x - wb.x, wa.z - wb.z)
    const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(FIRST)] as number)
      + (MOUNTAIN_FOOTPRINT[mountainHexFor(SECOND)] as number)
    expect(gap).toBeLessThan(sum)

    /*
     * CHANGED BY THE FIX. This assertion read `.toEqual([key(SECOND)])` — the
     * second hex of a colliding pair went bare and stayed bare. It is the whole
     * card, so it is the assertion that must now say the opposite.
     */
    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    expect(bareRockHexes(island)).toEqual([])

    // ...and the reason it fits: the retry asks for a peak narrow enough that
    // the sum no longer exceeds the gap.
    const retry = (MOUNTAIN_FOOTPRINT[mountainHexFor(FIRST)] as number)
      + (MOUNTAIN_FOOTPRINT[mountainFallbackFor(SECOND)] as number)
    expect(retry).toBeLessThan(gap)
  })

  it('the FIRST hex is untouched — the survivor did not have to move', () => {
    /*
     * The fix may not disturb what already worked. `bareRockHexes` cannot report
     * a position, but the model it walks is the one that decides: the first hex
     * takes its primary radius, is never refused, and the second is fitted
     * around it rather than the other way about.
     */
    const island = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    expect(bareRockHexes(island).map(key)).not.toContain(key(FIRST))
    expect(bareRockHexes(islandOf([[FIRST, 'rock']]))).toEqual([])
  })

  it('ORDER NO LONGER DECIDES IT — the same two hexes the other way round', () => {
    /*
     * CHANGED BY THE FIX, and this is the sharpest statement of it. This test
     * used to assert that the victim depended on which key went into the Map
     * first — `[SECOND]` forward and `[FIRST]` backward — a bug that looked
     * intermittent to anyone who met it in the browser. Both orders now dress
     * both hexes, so insertion order stops being a thing the child can see.
     */
    const forward = islandOf([[FIRST, 'rock'], [SECOND, 'rock']])
    const backward = islandOf([[SECOND, 'rock'], [FIRST, 'rock']])
    expect(bareRockHexes(forward)).toEqual([])
    expect(bareRockHexes(backward)).toEqual([])
  })

  it('is unaffected by grass tiles sharing the map', () => {
    // Grass hexes grow features too, but this model only knows about mountains
    // and says so in its header. What it must not do is trip over them.
    const island = islandOf([
      [{ q: 0, r: 0 }, 'grass'], [FIRST, 'rock'],
      [{ q: 0, r: 1 }, 'grass'], [SECOND, 'rock'],
      [{ q: 3, r: -1 }, 'grass'],
    ])
    expect(bareRockHexes(island)).toEqual([])
  })

  it('a whole range of mountains, every hex of it, keeps its peak', () => {
    /*
     * The shape the child actually builds: not a pair, but a solid block where
     * every hex has up to six neighbours and each refusal has to be repaired
     * against everything already standing. The retry survives that because the
     * arithmetic has room — the widest primary plus the widest fallback is
     * 1.949578 against 2.0000 — so no chain of refusals can run out of models.
     */
    for (const R of [1, 2, 3, 4]) {
      const entries: Array<readonly [Axial, TileType]> = []
      for (let q = -R; q <= R; q++) {
        for (let r = -R; r <= R; r++) {
          if (distance({ q: 0, r: 0 }, { q, r }) > R) continue
          entries.push([{ q, r }, 'rock'])
        }
      }
      const island = islandOf(entries)
      expect(island.tiles.size).toBeGreaterThan(0)
      expect(bareRockHexes(island).map(key)).toEqual([])
    }
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

  it('about one adjacent rock pair in seven is REFUSED on first choice', () => {
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
     *
     * KEPT UNCHANGED THROUGH THE FIX, on purpose. This is arithmetic on the
     * PRIMARY chooser, so it is the pin that says the primary chooser did not
     * move: the same 2763 pairs collide on first choice as before PB-053 was
     * fixed. What changed is only what happens next, asserted below.
     */
    const rate = collide / pairs.length
    expect(rate).toBeGreaterThan(0.08)
    expect(rate).toBeLessThan(0.25)
    expect(collide).toBe(2763)
  })

  /**
   * THE ACCEPTANCE TEST FOR PB-053.
   *
   * The same 19182 adjacent pairs that produced 2763 bare hexes, walked through
   * `bareRockHexes` — which models the retry because `props.ts` performs it — and
   * every one of them now dresses both hexes. Not "fewer": none.
   *
   * This test used to be `'every colliding pair really does produce a bare hex'`
   * and asserted `[key(b)]` for exactly the pairs that overlap. It is the same
   * sweep with the opposite expectation, which is the point of the card.
   */
  it('and NONE of them leaves a bare hex — 2763 refusals, 0 bare', () => {
    const pairs = adjacentPairs(46)
    expect(pairs.length).toBe(19182)

    let refused = 0
    let bare = 0
    for (const [a, b] of pairs) {
      const wa = toWorld(a, NATIVE_HEX_SIZE)
      const wb = toWorld(b, NATIVE_HEX_SIZE)
      const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(a)] as number)
        + (MOUNTAIN_FOOTPRINT[mountainHexFor(b)] as number)
      if (Math.hypot(wa.x - wb.x, wa.z - wb.z) < sum) refused++
      bare += bareRockHexes(islandOf([[a, 'rock'], [b, 'rock']])).length
    }

    // The sweep really did exercise the defect — otherwise zero is vacuous.
    expect(refused).toBe(2763)
    expect(bare).toBe(0)
  })

  it('the retry is what fixes it, pair by pair', () => {
    // The count above is a total; this checks the mechanism on every pair that
    // was actually refused, so the statistic and the function cannot drift.
    let checked = 0
    for (const [a, b] of adjacentPairs(8)) {
      const wa = toWorld(a, NATIVE_HEX_SIZE)
      const wb = toWorld(b, NATIVE_HEX_SIZE)
      const gap = Math.hypot(wa.x - wb.x, wa.z - wb.z)
      const sum = (MOUNTAIN_FOOTPRINT[mountainHexFor(a)] as number)
        + (MOUNTAIN_FOOTPRINT[mountainHexFor(b)] as number)
      expect(bareRockHexes(islandOf([[a, 'rock'], [b, 'rock']]))).toEqual([])
      if (gap < sum) {
        // Refused — so the second hex must be standing on its fallback, and
        // that fallback must genuinely clear the first hex's primary.
        const retry = (MOUNTAIN_FOOTPRINT[mountainHexFor(a)] as number)
          + (MOUNTAIN_FOOTPRINT[mountainFallbackFor(b)] as number)
        expect(retry).toBeLessThan(gap)
        checked++
      }
    }
    expect(checked).toBeGreaterThan(50)
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
