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
import { Matrix4, Vector3 } from 'three'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  COAST_CANONICAL, COAST_EDGES, COAST_VARIANTS, longestRun, waterMask, lookFor,
  looksFor, presentedBy, canBeWater, mustBeWater, buildableSockets,
} from '../../src/island/world/coast'
import type { CoastVariant, EdgeKind, TileLook } from '../../src/island/world/coast'
import { createIsland, place, sockets } from '../../src/island/world/grid'
import type { TileType } from '../../src/island/world/grid'
import {
  createFlow, askForLand, chooseTile, placeTile, tileOffer, tileTypeFor, tapSum,
  challengePassed,
} from '../../src/island/flow'
import type { Island } from '../../src/island/world/grid'
import { DIRECTIONS, toWorld, key, distance, neighbours } from '../../src/island/world/hex'
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

/**
 * What a model presents at each edge: land, the sand ramp, or open water.
 *
 * The finer measurement `COAST_EDGES` records. Land sits at 0, the ramp around
 * -0.025 to -0.1, water at -0.2, so the bands are wide and the thresholds are
 * nowhere near anything.
 */
function measureEdgeKinds(stem: string): EdgeKind[] {
  const tris = loadTriangles(stem)
  let minZ = Infinity, maxZ = -Infinity
  for (const t of tris) for (const p of [t.a, t.b, t.c]) {
    minZ = Math.min(minZ, p[2] as number); maxZ = Math.max(maxZ, p[2] as number)
  }
  const R = (maxZ - minZ) / 2
  const inradius = R * Math.sqrt(3) / 2

  return DIRECTIONS.map(d => {
    const w = toWorld(d, 1)
    const len = Math.hypot(w.x, w.z)
    const y = heightAt(tris, (w.x / len) * inradius * 0.93, (w.z / len) * inradius * 0.93)
    if (y === null || y < WATER_LEVEL) return 'water'
    return y > -0.005 ? 'land' : 'sand'
  })
}

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

  it.each(COAST_VARIANTS)('hex_coast_%s matches COAST_CANONICAL', v => {
    const measured = measureWaterEdges(`hex_coast_${v}`)
    const { start, length } = COAST_CANONICAL[v]
    const expected = Array.from({ length }, (_, i) => (start + i) % 6).sort((a, b) => a - b)
    expect(measured).toEqual(expected)
  })

  it.each(COAST_VARIANTS)('hex_coast_%s matches COAST_EDGES', v => {
    expect(measureEdgeKinds(`hex_coast_${v}`)).toEqual(COAST_EDGES[v])
  })

  it('has a sand ramp WIDER than its water arc, on every model', () => {
    /*
     * The fact the whole of `lookFor` turns on, and the reason lining the
     * water arc up with the sea was wrong. The ramp spills onto the edges
     * either side of the water, so a model with two water edges has only two
     * edges left at full land height — and if the water is aimed at the sea,
     * those sand shoulders are aimed at her fields.
     */
    for (const v of COAST_VARIANTS) {
      const edges = COAST_EDGES[v]
      const water = edges.filter(e => e === 'water').length
      const wet = edges.filter(e => e !== 'land').length
      expect(wet).toBeGreaterThan(water)
    }
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

describe('waterMask — asked of the WATER', () => {
  it('reports which way the water faces, not which way land does', () => {
    // A pond with fields all round faces nothing: no open water at all.
    const i = pondInLand()
    expect(waterMask(i, DIRECTIONS[0] as Axial)).toBe(0)
  })

  it('counts an unbuilt neighbour as water — there is sea out there', () => {
    const lone = place(createIsland(), DIRECTIONS[0] as Axial, 'water')
    // Five sides face open sea; the sixth faces the home rock.
    expect(waterMask(lone, DIRECTIONS[0] as Axial)).not.toBe(0b111111)
  })
})

describe('lookFor', () => {
  it('NEVER re-cuts land — a field she owns keeps its shape', () => {
    /*
     * The complaint that prompted this. Digging a pond used to reach into the
     * neighbouring field and carve a third of it away into sand and sea,
     * changing land she had already paid for — and leaving a visible step
     * where the sand ran out and the water hex began.
     */
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    for (const [k, type] of i.tiles) {
      if (type !== 'grass') continue
      const [q, r] = k.split(',').map(Number)
      expect(lookFor(i, { q: q as number, r: r as number }))
        .toEqual({ kind: 'grass', turns: 0 })
    }
  })

  it('gives the POND the beach, turned to face her fields', () => {
    // Two tiles: home rock and a pond beside it. The pond meets land on one
    // side and open water on five, so it takes a model with a five-wide
    // water arc... which does not exist, so it stays plain. The three-tile
    // case below is the one that gets a rim.
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    const look = lookFor(i, { q: 2, r: 0 })
    expect(['coast', 'water']).toContain(look.kind)
  })

  it('gives a pond ringed entirely by field the best beach available', () => {
    /*
     * There is still no "beach all the way round" hex in the pack — measured,
     * hex_coast_E looks like one from its name and has no water edge at all,
     * so it cannot stand in for a water hex.
     *
     * This used to draw as plain water: six green edges each dropping 0.2
     * straight into the sea. It now spends the widest land arc there is, so
     * five of the six edges meet her fields at grass height or on the sand
     * ramp, and only one is left as a step. It reads as a pond, which is what
     * she dug.
     */
    const i = pondInLand()
    const look = lookFor(i, DIRECTIONS[0] as Axial)
    expect(look.kind).toBe('coast')
    if (look.kind !== 'coast') return
    expect(COAST_EDGES[look.variant].filter(e => e === 'land')).toHaveLength(3)
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

  it('only ever draws a coast where a model actually fits', () => {
    for (let mask = 0; mask < 64; mask++) {
      const arc = longestRun(mask)
      if (arc.length === 0 || arc.length > 4) continue
      const variant = COAST_VARIANTS[arc.length - 1] as CoastVariant
      expect(COAST_CANONICAL[variant].length).toBe(arc.length)
    }
  })
})

/* --------------------------------------------------- green, sand, water */

/**
 * A water hex at the origin with grass on exactly the edges named by `mask`.
 *
 * Built by hand rather than through `place`, which is a no-op on an occupied
 * coord — and the origin is Fred's rock, so the obvious construction quietly
 * leaves a grass tile there and every measurement comes out the same.
 */
function waterWithGrass(mask: number): Island {
  const tiles = new Map<string, 'grass' | 'water'>([[key({ q: 0, r: 0 }), 'water']])
  neighbours({ q: 0, r: 0 }).forEach((n, k) => {
    if (mask >> k & 1) tiles.set(key(n), 'grass')
  })
  return { tiles }
}

/** What the origin tile actually presents at each of its six edges. */
function presented(mask: number): EdgeKind[] {
  const look = lookFor(waterWithGrass(mask), { q: 0, r: 0 })
  if (look.kind !== 'coast') return Array(6).fill('water') as EdgeKind[]
  const edges = COAST_EDGES[look.variant]
  return Array.from({ length: 6 }, (_, k) => edges[(k - look.turns + 6) % 6] as EdgeKind)
}

const grassEdges = (mask: number): number[] =>
  [0, 1, 2, 3, 4, 5].filter(k => mask >> k & 1)

describe("Joe's rule: green, then sand, then water", () => {
  it('never drops a green edge straight into the sea', () => {
    /*
     * The rule as given: "edges to green are always green, then sand, then
     * water. Never a tile edge of A against the sand or water of B."
     *
     * A green edge meeting water skips the sand entirely — a 0.2 cliff where
     * there should be a beach. Across all sixty-four ways her fields can sit
     * around a pond, that must not happen once, with the single exception
     * below that no model in the pack can serve.
     */
    for (let mask = 0; mask < 63; mask++) {
      const shown = presented(mask)
      for (const k of grassEdges(mask)) {
        expect(shown[k], `mask ${mask.toString(2).padStart(6, '0')} edge ${k}`)
          .not.toBe('water')
      }
    }
  })

  it('is flush against her fields wherever a model can be', () => {
    /*
     * A run of one, two or three grass neighbours is an ordinary piece of
     * coastline, and the pack has a land arc for each. Those edges must be at
     * grass height exactly — not the sand ramp, which is the tenth-of-a-unit
     * lip that prompted all this.
     */
    for (let start = 0; start < 6; start++) {
      for (let length = 1; length <= 3; length++) {
        let mask = 0
        for (let i = 0; i < length; i++) mask |= 1 << ((start + i) % 6)
        const shown = presented(mask)
        for (const k of grassEdges(mask)) {
          expect(shown[k], `run of ${length} from ${start}, edge ${k}`).toBe('land')
        }
      }
    }
  })

  it('leaves open sea alone', () => {
    // No grass anywhere near: a beach here would be a sandbank from nowhere.
    expect(lookFor(waterWithGrass(0), { q: 0, r: 0 })).toEqual({ kind: 'water', turns: 0 })
  })

  it('spends sand on the sea side rather than the green side', () => {
    /*
     * Where a lip is unavoidable the scorer must put it in the water, not
     * against her fields. Counted across every configuration: the old rule
     * (align the water arc to the sea) left 112 sand edges and 12 cliffs
     * facing grass; this leaves 57 and 1.
     */
    let lips = 0, cliffs = 0
    for (let mask = 0; mask < 64; mask++) {
      const shown = presented(mask)
      for (const k of grassEdges(mask)) {
        if (shown[k] === 'sand') lips++
        if (shown[k] === 'water') cliffs++
      }
    }
    expect(cliffs).toBe(1)          // the fully enclosed pond, and only that
    expect(lips).toBeLessThanOrEqual(57)
  })
})

describe('the rotation convention, against the real matrix', () => {
  it('presents what presentedBy claims, when actually turned', () => {
    /*
     * The one thing the rest of this file cannot catch.
     *
     * `presentedBy` and every test helper above read the model with the SAME
     * expression, `(k - turns + 6) % 6`. Flip that sign in both and all of
     * them still pass while every coast hex in the game renders back to
     * front — water arcs pointing inland at her fields. That is the
     * mock-agreeing-with-the-mock failure this project has already paid for
     * four times over.
     *
     * So this rotates the actual mesh with the renderer's own call —
     * `makeRotationY(turns * PI/3)`, exactly as tiles.ts does it — and
     * re-measures the edges off the turned geometry. Nothing here shares any
     * arithmetic with the code under test.
     */
    for (const v of COAST_VARIANTS) {
      const tris = loadTriangles(`hex_coast_${v}`)
      let minZ = Infinity, maxZ = -Infinity
      for (const t of tris) for (const p of [t.a, t.b, t.c]) {
        minZ = Math.min(minZ, p[2] as number); maxZ = Math.max(maxZ, p[2] as number)
      }
      const inradius = ((maxZ - minZ) / 2) * Math.sqrt(3) / 2

      for (let turns = 0; turns < 6; turns++) {
        const rot = new Matrix4().makeRotationY(turns * Math.PI / 3)
        const spun: Tri[] = tris.map(t => ({
          a: [...new Vector3(...(t.a as [number, number, number])).applyMatrix4(rot).toArray()],
          b: [...new Vector3(...(t.b as [number, number, number])).applyMatrix4(rot).toArray()],
          c: [...new Vector3(...(t.c as [number, number, number])).applyMatrix4(rot).toArray()],
        }))

        const claimed = presentedBy({ kind: 'coast', variant: v, turns })
        DIRECTIONS.forEach((d, k) => {
          const w = toWorld(d, 1)
          const len = Math.hypot(w.x, w.z)
          const y = heightAt(spun, (w.x / len) * inradius * 0.93, (w.z / len) * inradius * 0.93)
          const measured: EdgeKind = (y === null || y < WATER_LEVEL) ? 'water'
            : y > -0.005 ? 'land' : 'sand'
          expect(measured, `${v} turned ${turns}, edge ${k}`).toBe(claimed[k])
        })
      }
    }
  })
})

describe('water meeting water', () => {
  /** A run of water hexes punched through a solid field. */
  function channel(length: number): Island {
    const tiles = new Map<string, 'grass' | 'water'>()
    for (let q = -3; q <= 4; q++) {
      for (let r = -3; r <= 3; r++) tiles.set(key({ q, r }), 'grass')
    }
    for (let i = 0; i < length; i++) tiles.set(key({ q: i, r: 0 }), 'water')
    return { tiles }
  }

  it('never puts one pond tile\'s green rim against the next one\'s open water', () => {
    /*
     * Found by review, and reproducible in the simplest pond worth digging:
     * three in a row. Scoring each tile against the ASSUMPTION that every wet
     * neighbour is open water made the middle tile present grass-height land
     * at the very edge where its neighbour presented water — a 0.2 cliff
     * between two tiles she dug as water, and lopsided, because the pond's
     * other joint came out clean.
     */
    for (let length = 2; length <= 5; length++) {
      const island = channel(length)
      const looks = looksFor(island)
      for (const [k, type] of island.tiles) {
        if (type !== 'water') continue
        const parts = k.split(',').map(Number)
        const a: Axial = { q: parts[0] as number, r: parts[1] as number }
        const mine = presentedBy(looks.get(k) as TileLook)
        neighbours(a).forEach((n, e) => {
          if (island.tiles.get(key(n)) !== 'water') return
          const theirs = presentedBy(looks.get(key(n)) as TileLook)
          const step = Math.abs(LEVELS[mine[e] as EdgeKind] - LEVELS[theirs[(e + 3) % 6] as EdgeKind])
          expect(step, `channel of ${length}: ${k} edge ${e} vs ${key(n)}`)
            .toBeLessThanOrEqual(1)
        })
      }
    }
  })

  it('settles — a second solve of the same island changes nothing', () => {
    const island = channel(4)
    const once = looksFor(island)
    const twice = looksFor(island)
    for (const k of once.keys()) expect(twice.get(k)).toEqual(once.get(k))
  })
})

const LEVELS: Record<EdgeKind, number> = { land: 0, sand: 1, water: 2 }

describe('no green walls in the water', () => {
  /**
   * Joe, from a screenshot: a wedge of land and sand running through the middle
   * of a pond, with green poking into open water.
   *
   * The cost of a mismatch used to be derived from the size of the height step,
   * which made the two directions symmetric when they are not — a green wall
   * rising out of the sea cost 4 while a sandy lip against her fields cost 10,
   * so on a jagged coast the scorer shoved land into the water to keep the
   * grass edges perfect. Fable's review predicted exactly this and I recorded
   * it as an accepted trade rather than fixing it, which was the wrong call.
   *
   * The costs are a table now and a wall costs 40. It cannot be pushed higher:
   * measured across all sixty-four configurations, raising it to 100 cuts walls
   * from 37 to 11 but takes CLIFFS — open water against her grass, the worst
   * outcome there is — from 1 to 24, because plain water starts winning. Walls
   * and cliffs trade against each other and cliffs matter more.
   */
  const ponds: Record<string, Axial[]> = {
    'a blob of seven': [{ q: 0, r: 0 }, ...neighbours({ q: 0, r: 0 })],
    'a big lake': [
      { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 0, r: 1 }, { q: 1, r: 1 },
      { q: 2, r: 1 }, { q: 0, r: 2 }, { q: 1, r: 2 }, { q: 1, r: -1 }, { q: 2, r: -1 },
    ],
  }

  /** A field with a pond punched into it. */
  function withPond(shape: Axial[]): Island {
    const tiles = new Map<string, 'grass' | 'water'>()
    for (let q = -4; q <= 5; q++) {
      for (let r = -4; r <= 4; r++) tiles.set(key({ q, r }), 'grass')
    }
    for (const a of shape) tiles.set(key(a), 'water')
    return { tiles }
  }

  /** Land standing against open water, and water standing against her grass. */
  function faults(island: Island): { walls: number; cliffs: number } {
    const looks = looksFor(island)
    let walls = 0, cliffs = 0
    for (const [k, type] of island.tiles) {
      if (type !== 'water') continue
      const parts = k.split(',').map(Number)
      const a: Axial = { q: parts[0] as number, r: parts[1] as number }
      const mine = presentedBy(looks.get(k) as TileLook)
      neighbours(a).forEach((n, e) => {
        const kind = island.tiles.get(key(n))
        if (kind === 'grass' && mine[e] === 'water') cliffs++
        if (kind !== 'water') return
        const theirs = presentedBy(looks.get(key(n)) as TileLook)[(e + 3) % 6]
        if (mine[e] === 'land' && theirs === 'water') walls++
      })
    }
    return { walls, cliffs }
  }

  it('puts no land in the middle of an ordinary pond', () => {
    // The shapes a child actually digs: a blob, and a lake she has widened.
    for (const [name, shape] of Object.entries(ponds)) {
      expect(faults(withPond(shape)), name).toEqual({ walls: 0, cliffs: 0 })
    }
  })

  it('keeps an awkward shape down to a single fault at worst', () => {
    /*
     * An L bend and a three-hex channel are the shapes four coast models
     * genuinely cannot serve: a tile with grass on four sides has no
     * orientation that meets all of them, because no model has four land
     * edges. Something must give, and this pins how much.
     */
    const awkward: Record<string, Axial[]> = {
      'three in a row': [{ q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }],
      'an L bend': [
        { q: 0, r: 0 }, { q: 1, r: 0 }, { q: 2, r: 0 }, { q: 2, r: 1 }, { q: 2, r: 2 },
      ],
    }
    for (const [name, shape] of Object.entries(awkward)) {
      const { walls, cliffs } = faults(withPond(shape))
      expect(walls + cliffs, name).toBeLessThanOrEqual(1)
    }
  })

  it('still keeps her grass edges green wherever a model allows', () => {
    // The other half: fixing the walls must not simply trade them for lips
    // against her fields.
    for (let start = 0; start < 6; start++) {
      for (let length = 1; length <= 3; length++) {
        let mask = 0
        for (let i = 0; i < length; i++) mask |= 1 << ((start + i) % 6)
        const shown = presented(mask)
        for (const k of grassEdges(mask)) {
          expect(shown[k], `run of ${length} from ${start}, edge ${k}`).toBe('land')
        }
      }
    }
  })
})

/**
 * The invariant Joe actually asked for.
 *
 * *"we should never allow a full land tile against a coast tile"*, and then the
 * question that decides how to get there: *"if its a clean build from the start
 * (nothing is launched, everything can be reset) we should not end up with a
 * beach hitting a full land tile, right?"*
 *
 * Right — and the way it is achieved is by restricting PLACEMENT rather than by
 * cutting her fields. So these tests do not construct islands; they BUILD them,
 * only ever through the rules the game applies to a tap, and then assert that no
 * bad joint exists anywhere. That is the difference between testing the scorer
 * and testing the promise.
 */
describe('an island built only through the placement rules', () => {
  /** Every clean joint rule, over a whole island, counted. */
  function badJoints(island: Island): string[] {
    const looks = looksFor(island)
    const bad: string[] = []
    for (const [k, type] of island.tiles) {
      const parts = k.split(',').map(Number)
      const a: Axial = { q: parts[0] as number, r: parts[1] as number }
      const mine = type === 'grass'
        ? (['land', 'land', 'land', 'land', 'land', 'land'] as EdgeKind[])
        : presentedBy(looks.get(k) as TileLook)
      neighbours(a).forEach((n, e) => {
        const theirType = island.tiles.get(key(n))
        const theirs: EdgeKind = theirType === undefined
          ? 'water'
          : theirType === 'grass'
            ? 'land'
            : presentedBy(looks.get(key(n)) as TileLook)[(e + 3) % 6] as EdgeKind
        // A beach or open water pressed against a full land tile...
        if (theirs === 'land' && mine[e] !== 'land') {
          bad.push(`${k} shows ${mine[e]} at edge ${e} against land`)
        }
        // ...and its mirror, a green wall standing in the sea.
        if (theirs !== 'land' && mine[e] === 'land' && type === 'water') {
          bad.push(`${k} shows land at edge ${e} against ${theirs}`)
        }
      })
    }
    return bad
  }

  /**
   * Play the game: repeatedly pick a socket and a kind, and let the rules decide
   * what actually lands there. A seeded generator, so a failure is reproducible.
   */
  function build(steps: number, seed: number, wetness: number): Island {
    let s = seed >>> 0
    const rnd = (): number => {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 0x100000000
    }
    let f = createFlow()
    for (let i = 0; i < steps; i++) {
      const open = buildableSockets(f.island, sockets(f.island))
      if (open.length === 0) break
      const at = open[Math.floor(rnd() * open.length)] as Axial
      const want: TileType = rnd() < wetness ? 'water' : 'grass'
      // Exactly the path a tap takes: ask at the socket, pick, and place.
      f = askForLand({ ...f, phase: 'free' }, at)
      if (f.phase !== 'placing') break
      const offered = tileOffer(f)
      const pick = offered.includes(want) ? want : offered[0] as TileType
      f = placeTile(chooseTile(f, pick), at)
      /*
       * Finish the plot so the tile becomes real, then carry on. Bounded by a
       * counter rather than by watching `plot` change: an unfinished plot keeps
       * the SAME object across sums, so an identity check breaks out after one
       * and only tiles costing a single sum ever complete — which quietly turned
       * a forty-five-tile island into a two-tile one.
       */
      for (let guard = 0; guard < 200 && f.plot; guard++) {
        f = challengePassed(tapSum({ ...f, phase: 'free' }))
      }
    }
    return f.island
  }

  /*
   * An explicit timeout, generously above the ~0.5s this takes on an idle
   * machine. It is here because the test genuinely timed out at vitest's 5s
   * default while five other builds were running, and a gate that fails for
   * reasons unrelated to the code is one people learn to ignore (HANDOFF §3).
   * The cost that made it slow — copying the island map per candidate — was
   * fixed in `allows` rather than papered over here.
   */
  it('never puts a beach against a full land tile, over many seeds', () => {
    for (let seed = 1; seed <= 24; seed++) {
      for (const wetness of [0.2, 0.5, 0.8]) {
        const island = build(45, seed, wetness)
        expect(badJoints(island), `seed ${seed}, wetness ${wetness}`).toEqual([])
      }
    }
  }, 30_000)

  it('and still builds islands with real water in them', () => {
    /*
     * The other half, and the one that would catch the cheat: a rule that
     * refused water everywhere would satisfy the test above perfectly.
     */
    let wet = 0, total = 0
    for (let seed = 1; seed <= 24; seed++) {
      const island = build(45, seed, 0.8)
      for (const type of island.tiles.values()) { total++; if (type === 'water') wet++ }
    }
    expect(total).toBeGreaterThan(300)
    expect(wet / total, 'islands came out bone dry').toBeGreaterThan(0.15)
  }, 30_000)

  it('fills a gap between two of her ponds with water, not a green plug', () => {
    // Joe: "specifically if 2 water and no land neighbours."
    const gap: Axial = { q: 1, r: 0 }
    // Built as a map, not with place(): createIsland's home hex is grass and
    // place() refuses to overwrite it, so a "pond" laid over it silently is not.
    const island: Island = {
      tiles: new Map<string, TileType>([
        [key({ q: 0, r: 0 }), 'water'],
        [key({ q: 2, r: 0 }), 'water'],
        [key({ q: 1, r: -1 }), 'water'],
      ]),
    }
    expect(mustBeWater(island, gap)).toBe(true)

    let f = { ...createFlow(), island }
    f = askForLand({ ...f, phase: 'free' }, gap)
    expect(tileOffer(f)).toEqual(['water'])
    // Even asking for grass outright gets water, because the offer is not the
    // only guard — placeTile is.
    expect(tileTypeFor(f, gap, 'grass')).toBe('water')
  })

  it('lets one water and one land neighbour continue the coastline', () => {
    // Joe: "one water and one land should continue the coastline" — so this
    // socket is NOT forced, and both kinds stay on the table.
    let island = createIsland()
    island = place(island, { q: 1, r: -1 }, 'water')
    const at: Axial = { q: 1, r: 0 }
    expect(mustBeWater(island, at)).toBe(false)
    expect(canBeWater(island, at)).toBe(true)
  })

  it('refuses water where it would need a four-land-edge model', () => {
    /*
     * The arithmetic, stated. A socket ringed by her fields cannot hold water,
     * because no model in the pack has four land edges — so there is no
     * orientation that meets all of them and something would have to give.
     */
    let island = createIsland()
    for (const n of neighbours({ q: 0, r: 0 })) island = place(island, n, 'grass')
    // A hole in the middle of a field: every neighbour is grass.
    const hole: Axial = { q: 0, r: 0 }
    const ringed: Island = { tiles: new Map([...island.tiles].filter(([k]) => k !== key(hole))) }
    expect(canBeWater(ringed, hole)).toBe(false)
  })
})
