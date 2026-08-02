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
  looksFor, presentedBy, canBeWater, canBeGrass, mustBeWater, mustBeLand,
  buildableSockets, dryLandSockets, dryAfter, LAND_FLOOR,
  allows, settledType, landedType, isGrowableWitness, canStillGrow,
  hasOutwardCorridor, withTile,
} from '../../src/island/world/coast'
import type { CoastVariant, EdgeKind, TileLook } from '../../src/island/world/coast'
import { createIsland, place, sockets } from '../../src/island/world/grid'
import type { TileType } from '../../src/island/world/grid'
import {
  createFlow, askForLand, chooseTile, placeTile, tileOffer, tileTypeFor, tapSum,
  challengePassed,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
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
     * those sand shoulders are aimed at the child's fields.
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
  it('NEVER re-cuts land — a field they own keeps its shape', () => {
    /*
     * The complaint that prompted this. Digging a pond used to reach into the
     * neighbouring field and carve a third of it away into sand and sea,
     * changing land the child had already paid for — and leaving a visible
     * step where the sand ran out and the water hex began.
     */
    const i = place(blob(), { q: 2, r: 0 }, 'water')
    for (const [k, type] of i.tiles) {
      if (type !== 'grass') continue
      const [q, r] = k.split(',').map(Number)
      expect(lookFor(i, { q: q as number, r: r as number }))
        .toEqual({ kind: 'grass', turns: 0 })
    }
  })

  it('gives the POND the beach, turned to face the child\'s fields', () => {
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
     * five of the six edges meet the child's fields at grass height or on the
     * sand ramp, and only one is left as a step. It reads as a pond, which is
     * what they dug.
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
     * there should be a beach. Across all sixty-four ways the child's fields
     * can sit around a pond, that must not happen once, with the single
     * exception below that no model in the pack can serve.
     */
    for (let mask = 0; mask < 63; mask++) {
      const shown = presented(mask)
      for (const k of grassEdges(mask)) {
        expect(shown[k], `mask ${mask.toString(2).padStart(6, '0')} edge ${k}`)
          .not.toBe('water')
      }
    }
  })

  it('is flush against the child\'s fields wherever a model can be', () => {
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
     * against the child's fields. Counted across every configuration: the old
     * rule (align the water arc to the sea) left 112 sand edges and 12 cliffs
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
     * front — water arcs pointing inland at the child's fields. That is the
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
     * between two tiles the child dug as water, and lopsided, because the
     * pond's other joint came out clean.
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
   * rising out of the sea cost 4 while a sandy lip against their fields cost 10,
   * so on a jagged coast the scorer shoved land into the water to keep the
   * grass edges perfect. Fable's review predicted exactly this and I recorded
   * it as an accepted trade rather than fixing it, which was the wrong call.
   *
   * The costs are a table now and a wall costs 40. It cannot be pushed higher:
   * measured across all sixty-four configurations, raising it to 100 cuts walls
   * from 37 to 11 but takes CLIFFS — open water against the child's grass, the
   * worst outcome there is — from 1 to 24, because plain water starts winning.
   * Walls and cliffs trade against each other and cliffs matter more.
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

  /** Land standing against open water, and water standing against the grass. */
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
    // The shapes a child actually digs: a blob, and a lake they have widened.
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

  it('still keeps the child\'s grass edges green wherever a model allows', () => {
    // The other half: fixing the walls must not simply trade them for lips
    // against the child's fields.
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
 * cutting the child's fields. So these tests do not construct islands; they
 * BUILD them, only ever through the rules the game applies to a tap, and then
 * assert that no bad joint exists anywhere. That is the difference between
 * testing the scorer and testing the promise.
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
   *
   * Returns the whole FLOW, not just the island, so a caller can ask questions
   * of the game state — "could they still put a field down?" is a question
   * about the placement rules, not about a tile map, and answering it from a
   * map alone is exactly the shortcut that let three coast faults through.
   *
   * `watch` is called with the flow before the first tile and after every one, so
   * an invariant can be checked at every state the child would actually see
   * rather than only at the end. `choose` is how they pick a socket, so a test
   * can play a deliberate strategy rather than a random walk.
   */
  interface Strategy {
    watch?: (f: Flow, step: number) => void
    choose?: (open: readonly Axial[], f: Flow, rnd: () => number) => Axial
    /**
     * Take the OPENING SCRIPT's path instead of a tap's: pick the kind with no
     * socket in hand, then site it.
     *
     * Fred asks for land on the child's behalf and has nowhere in mind, so
     * nothing filters the choice and `tileTypeFor` is the only thing standing
     * between what was picked and what lands. Which is exactly why the rules
     * live there and not in the offer — and a test that only ever goes through
     * the offer cannot tell the difference, because the offer would have removed
     * the button before the choke point was ever asked.
     */
    viaScript?: boolean
  }

  function play(steps: number, seed: number, wetness: number, how: Strategy = {}): Flow {
    const watch = how.watch ?? ((): void => {})
    const choose = how.choose
      ?? ((open: readonly Axial[], _f: Flow, rnd: () => number): Axial =>
        open[Math.floor(rnd() * open.length)] as Axial)
    let s = seed >>> 0
    const rnd = (): number => {
      s = (s * 1664525 + 1013904223) >>> 0
      return s / 0x100000000
    }
    let f = createFlow()
    watch(f, 0)
    for (let i = 0; i < steps; i++) {
      const open = buildableSockets(f.island, sockets(f.island))
      if (open.length === 0) break
      const at = choose(open, f, rnd)
      const want: TileType = rnd() < wetness ? 'water' : 'grass'
      if (how.viaScript) {
        // Fred's path: a kind chosen with nowhere in mind, then a socket.
        f = askForLand({ ...f, phase: 'free' })
        if (f.phase !== 'placing') break
        f = placeTile(chooseTile(f, want), at)
      } else {
        // Exactly the path a tap takes: ask at the socket, pick, and place.
        f = askForLand({ ...f, phase: 'free' }, at)
        if (f.phase !== 'placing') break
        const offered = tileOffer(f)
        const pick = offered.includes(want) ? want : offered[0] as TileType
        f = placeTile(chooseTile(f, pick), at)
      }
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
      watch(f, i + 1)
    }
    return f
  }

  /** The same, for the tests that only care what the island came out like. */
  const build = (steps: number, seed: number, wetness: number): Island =>
    play(steps, seed, wetness).island

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

  /**
   * Are the child's FIELDS walled off from themselves — can their island still grow?
   *
   * Not "can a tile go somewhere", and the difference is the whole fault. Once a
   * ring of ponds closes round the child's land, tiles can still be placed all
   * day, and grass comes back too once the lake is a ring wider and there is a
   * pond tile with no green edge yet — but it comes back ACROSS THE WATER. The
   * island is walled in permanently, because the ring tiles keep the green edge
   * they have and any field outside would give them a second on the far side.
   *
   * So the question is asked only of sockets that touch their fields, and it is
   * asked through the choke point a tap goes through, because "grass is allowed
   * here" and "grass is what would actually land here" are different questions —
   * `mustBeWater` can override a socket `canBeGrass` was perfectly happy with.
   */
  const fieldsCanStillGrow = (f: Flow): boolean =>
    buildableSockets(f.island, sockets(f.island))
      .some(s => neighbours(s).some(n => f.island.tiles.get(key(n)) === 'grass')
        && tileTypeFor(f, s, 'grass') === 'grass')

  /**
   * A child who only ever wants water, and only puts it against their island.
   *
   * Joe, from playtesting: *"kids cant snooker their islands by surrounding it
   * with just water"*. This is that child. Picking sockets at random wanders out
   * to sea, where water is free and nothing is ever at stake; hugging their
   * fields is what actually rings the island, so the strategy prefers a socket
   * touching their grass, falling back to the open sea only when there is none.
   *
   * It matters that this is a STRATEGY and not more seeds. The random walk never
   * once walled an island in, at any wetness, over hundreds of seeds — the fault
   * Joe found in ten minutes of a six-year-old playing needs a player who wants
   * water and wants it next to their island, which is what a six-year-old is.
   */
  const hugTheLand: Strategy['choose'] = (open, f, rnd) => {
    const touching = open.filter(s =>
      neighbours(s).some(n => f.island.tiles.get(key(n)) === 'grass'))
    const from = touching.length > 0 ? touching : open
    return from[Math.floor(rnd() * from.length)] as Axial
  }

  /**
   * ...and a child playing to WIN at walling themselves in.
   *
   * Not a child, obviously. It is here because the floor is a number, and a
   * number is only as good as the worst player who meets it: this one taps
   * whichever socket leaves them the fewest ways out, so the floor is held at
   * its line for the whole game instead of drifting comfortably above it.
   */
  const worstCase: Strategy['choose'] = (open, f) => {
    let best = open[0] as Axial
    let fewest = Infinity
    for (const s of open) {
      const left = dryAfter(f.island, s, tileTypeFor(f, s, 'water'))
      if (left < fewest) { fewest = left; best = s }
    }
    return best
  }

  /**
   * ...and one playing to win at it against the CORRIDOR, which is the invariant
   * the guarantee actually rests on.
   *
   * `worstCase` above weighs sockets by dry connections, so it is only as sharp as
   * the floor's own measure — and the sixty-four-tap counterexample got past the
   * floor precisely by making the dry count irrelevant. This one weighs the thing
   * that matters: it will spend any number of dry sockets to cut the last way out
   * to the sea, and only falls back on counting when it cannot.
   */
  const corridorKiller: Strategy['choose'] = (open, f) => {
    let best = open[0] as Axial
    let bestScore = Infinity
    for (const s of open) {
      const t = tileTypeFor(f, s, 'water')
      const after = withTile(f.island, s, t)
      const score = (hasOutwardCorridor(after) ? 1000 : 0) + dryLandSockets(after).length
      if (score < bestScore) { bestScore = score; best = s }
    }
    return best
  }

  it('never walls their island in, however much water they ask for', () => {
    /*
     * THE property, and it is deliberately stronger than the rule that satisfies
     * it: it counts nothing and knows nothing about dry sockets, it only says
     * that at no point in a played island are the child's fields sealed off from
     * every place they could grow. They can reach that state unaided and there is
     * no undo, which is what makes it worth a floor rather than a nudge.
     *
     * It fails without the floor at seed 1, in six taps: the home hex ringed by
     * ponds, and nothing green can ever touch their land again. It also fails
     * with the floor set to Joe's two rather than three, at seed 160 — which is
     * the whole reason the seed range runs this far, and the reason this plays a
     * strategy rather than trusting `LAND_FLOOR` to be a sensible-looking number.
     */
    /*
     * The seed counts differ because the cost does: `worstCase` weighs every
     * socket on every tap, so it buys far less coverage per second, and what it
     * is for is the shape of the play rather than the breadth of it.
     */
    for (const [name, choose, seeds] of [['hugging the coast', hugTheLand, 170],
      ['playing to lose', worstCase, 25]] as const) {
      for (let seed = 1; seed <= seeds; seed++) {
        play(45, seed, 1, {
          choose,
          watch: (f, step) => {
            expect(fieldsCanStillGrow(f), `${name}, seed ${seed}, after ${step} tiles: `
              + `${[...f.island.tiles].map(([k, t]) => `${k}=${t}`).join(' ')}`).toBe(true)
          },
        })
      }
    }
  }, 30_000)

  it('holds when the kind is chosen before the socket, as Fred chooses it', () => {
    /*
     * The same property down the opening script's path, where no offer stands
     * between the choice and the tile. This is the one that says the rule is in
     * the choke point and not merely in the buttons: strip `mustBeLand` out of
     * `tileTypeFor` and leave it in `tileOffer`, and every other played-island
     * test here still passes, because they all ask the offer what to press.
     */
    for (let seed = 1; seed <= 120; seed++) {
      play(45, seed, 1, {
        choose: hugTheLand,
        viaScript: true,
        watch: (f, step) => {
          expect(fieldsCanStillGrow(f), `seed ${seed}, after ${step} tiles: `
            + `${[...f.island.tiles].map(([k, t]) => `${k}=${t}`).join(' ')}`).toBe(true)
        },
      })
    }
  }, 30_000)

  it('holds under the random walk too, at every wetness', () => {
    for (let seed = 1; seed <= 24; seed++) {
      for (const wetness of [0.2, 0.5, 0.8, 1]) {
        play(45, seed, wetness, {
          watch: (f, step) => {
            expect(fieldsCanStillGrow(f), `seed ${seed}, wetness ${wetness}, `
              + `after ${step} tiles`).toBe(true)
          },
        })
      }
    }
  }, 30_000)

  it('always leaves them a socket to tap — the floor never glows nothing', () => {
    /*
     * The other way to stop the game, and the one a floor is most likely to cause
     * by accident: refuse enough and nothing glows at all, which is every bit as
     * final as a moat and rather more baffling. This is here because the floor WAS
     * once written into `buildableSockets` and did exactly that — it refused the
     * last socket their island could have grown from, turning "walled in after
     * one more field" into "walled in now". Nothing invents a fallback, so this
     * has to hold on its own.
     */
    for (const choose of [hugTheLand, undefined]) {
      for (let seed = 1; seed <= 24; seed++) {
        play(45, seed, 1, {
          choose,
          watch: (f, step) => {
            expect(buildableSockets(f.island, sockets(f.island)).length,
              `seed ${seed}, after ${step} tiles`).toBeGreaterThan(0)
          },
        })
      }
    }
  }, 30_000)

  it('leaves a socket they can GROW from glowing, not merely a socket', () => {
    /*
     * The stronger form, and the one that says the guarantee is not vacuous.
     * `buildableSockets` refusing a socket is now possible — narrowly, where grass
     * is infeasible and water would cut the last corridor — and a guard that
     * refused their last way out while leaving a shore across the lake to build on
     * would satisfy the test above perfectly and still have ended their island.
     *
     * So this asks for a glowing socket that is BESIDE THEIR FIELDS and where
     * grass is what would land. That is `coast.isGrowableWitness`, and the proof
     * that one always glows is in `hasOutwardCorridor`: the mouth of the corridor
     * is dry-empty, so nothing can refuse it.
     */
    for (const [name, choose] of [['hugging the coast', hugTheLand],
      ['hunting the corridor', corridorKiller]] as const) {
      for (let seed = 1; seed <= 12; seed++) {
        play(45, seed, 1, {
          choose,
          watch: (f, step) => {
            const open = buildableSockets(f.island, sockets(f.island))
            expect(open.some(s => isGrowableWitness(f.island, s)),
              `${name}, seed ${seed}, after ${step} tiles: `
              + `${[...f.island.tiles].map(([k, t]) => `${k}=${t}`).join(' ')}`).toBe(true)
          },
        })
      }
    }
  }, 30_000)

  it('keeps the outward corridor against a player hunting for it', () => {
    /*
     * The invariant itself, under the one strategy built to break it. The
     * counterexample that defeated the floor is a water ring closing round their
     * fields; this plays that shape deliberately, at every tap, and the corridor is
     * what stops it — so if this ever goes red the guarantee has gone, whatever the
     * other tests say.
     *
     * Fewer seeds than the strategies above buy, and deliberately: weighing every
     * socket against a fresh flood fill is dear, and what this is for is the shape
     * of the attack rather than the breadth of it. The broad sweep is a search
     * harness rather than a gate — 120 greedy anti-play games and a beam search over
     * some quarter of a million islands, none of which sealed the child in.
     */
    for (const seed of [1, 7, 13, 29, 160]) {
      play(45, seed, 1, {
        choose: corridorKiller,
        watch: (f, step) => {
          expect(hasOutwardCorridor(f.island),
            `seed ${seed}, after ${step} tiles: `
            + `${[...f.island.tiles].map(([k, t]) => `${k}=${t}`).join(' ')}`).toBe(true)
        },
      })
    }
  }, 30_000)

  it('never shows them a button that does something else', () => {
    /*
     * The offer and the outcome are now derived from one function, so this is a
     * property rather than a habit — but it is the property the whole one-button
     * offer rests on, and it used to be two lists of conditions kept in step by
     * hand. Every kind offered lands as itself, and no kind is hidden that would.
     */
    for (let seed = 1; seed <= 16; seed++) {
      play(45, seed, seed % 2 === 0 ? 1 : 0.5, {
        watch: f => {
          for (const s of buildableSockets(f.island, sockets(f.island))) {
            const offered = tileOffer({ ...f, phase: 'placing', pending: s, chosen: null })
            for (const t of ['grass', 'water'] as TileType[]) {
              expect(offered.includes(t), `seed ${seed}, ${key(s)}, ${t}`)
                .toBe(tileTypeFor(f, s, t) === t)
            }
          }
        },
      })
    }
  }, 30_000)

  /* ------------------------------------------- the floor, close up */

  it('counts the ways out of their fields the way Joe described them', () => {
    // "land connections without water neighbours" — touching their grass, and no
    // pond in their own six. Fred's lonely rock has all six of them.
    expect(dryLandSockets(createIsland())).toHaveLength(6)

    // A pond takes the socket it sits on and both of its neighbours out of the
    // count; the three on the far side are untouched.
    const dug = place(createIsland(), { q: 1, r: 0 }, 'water')
    expect(dryLandSockets(dug)).toHaveLength(3)
    for (const s of dryLandSockets(dug)) {
      expect(neighbours(s).some(n => dug.tiles.get(key(n)) === 'grass')).toBe(true)
      expect(neighbours(s).some(n => dug.tiles.get(key(n)) === 'water')).toBe(false)
    }
  })

  it('reckons the same way out counts however it is arrived at', () => {
    /*
     * `dryAfter` works the count out from the one they have rather than deriving
     * it over a copy of the island, which is the only reason it is cheap enough
     * to ask of every socket. So it has to agree with the slow way, everywhere.
     */
    for (const seed of [3, 11, 19, 23]) {
      const island = build(30, seed, 0.6)
      for (const s of sockets(island)) {
        for (const t of ['grass', 'water'] as TileType[]) {
          expect(dryAfter(island, s, t), `seed ${seed}, ${key(s)} as ${t}`)
            .toBe(dryLandSockets(place(island, s, t)).length)
        }
      }
    }
  })

  it('never forces a field the coastline cannot draw', () => {
    /*
     * The bug `mustBeWater` shipped with, not repeated: it short-circuited ahead
     * of the drawability check and forced water into a shape no model draws.
     * Forcing yields to feasibility, in both directions and at every socket of a
     * played island.
     */
    for (const seed of [5, 13, 29]) {
      const island = build(35, seed, 0.85)
      for (const s of sockets(island)) {
        if (mustBeLand(island, s)) expect(canBeGrass(island, s), key(s)).toBe(true)
      }
    }
  })

  it('leaves water out at sea alone — the floor only guards their coast', () => {
    /*
     * A floor that turned every pond into a field would pass the property test
     * perfectly and ruin the game. Water that touches none of their ways out
     * costs them nothing, so it is never turned back, however tight the island is.
     */
    let island = createIsland()
    // A finger of land, and a pond off the end of it with open sea beyond.
    island = place(island, { q: 1, r: 0 }, 'grass')
    island = place(island, { q: 2, r: 0 }, 'water')
    const outAtSea: Axial = { q: 3, r: 0 }
    expect(neighbours(outAtSea).some(n => island.tiles.get(key(n)) === 'grass')).toBe(false)
    expect(mustBeLand(island, outAtSea)).toBe(false)

    const f = askForLand({ ...createFlow(), island, phase: 'free' }, outAtSea)
    expect(tileOffer(f)).toContain('water')
    expect(tileTypeFor(f, outAtSea, 'water')).toBe('water')
  })

  it('offers one button when a field is forced, and it is the one that lands', () => {
    /*
     * The offer's only job is to show what `tileTypeFor` will do. A second button
     * that quietly becomes the first is worse than no second button, especially
     * for a child who would learn from it that the water one is broken.
     */
    let checked = 0
    for (const seed of [7, 17, 160]) {
      const island = build(35, seed, 0.9)
      const f0 = { ...createFlow(), island }
      for (const s of buildableSockets(island, sockets(island))) {
        const f = askForLand({ ...f0, phase: 'free' }, s)
        const offer = tileOffer(f)
        expect(offer.length, key(s)).toBeGreaterThan(0)
        // Whatever is on the buttons is what arrives when it is pressed.
        for (const t of offer) expect(tileTypeFor(f, s, t), `${key(s)} as ${t}`).toBe(t)
        if (mustBeLand(island, s)) {
          /*
           * NO WATER — which is the invariant, rather than "exactly one button".
           * Rock arrived after this test and is dry land too: it cannot have water
           * beside it, so it creates ways out of their fields exactly as a field
           * does and satisfies the floor on its own terms. So where land is
           * forced, a mountain button is honest, and the loop above has already
           * proved every button lands as itself.
           */
          expect(offer, key(s)).not.toContain('water')
          expect(offer, key(s)).toContain('grass')
          checked++
        }
      }
    }
    expect(checked, 'no socket in any of these islands had a field forced').toBeGreaterThan(0)
  })

  it('lets the floor outrank the green plug where the two collide', () => {
    /*
     * The two forcings do collide, and this is a real state of a real played
     * island — found by playing them, not composed, because the shape is not one
     * anybody would think to write down: twenty-eight tiles, and a socket out
     * beyond their fields with two of their ponds beside it and none of their
     * grass, so `mustBeWater` fires; and water there would take them below the
     * floor, so the floor fires too.
     *
     * The floor wins. A green plug in a channel is a wart they can look at; a
     * wall round their island is the end of building it, and there is no undo.
     * Ordered the other way the floor would be silent for exactly the taps that
     * close water round their land, which are the only ones it exists for.
     */
    const island: Island = {
      tiles: new Map<string, TileType>(('0,0=grass 1,-1=water 2,-2=water -1,1=grass '
        + '3,-3=water 1,0=water 0,1=water -1,2=grass 2,0=water 1,-2=water -2,1=grass '
        + '-1,3=water 1,1=water 3,-4=water -2,4=water 2,-4=grass 2,-1=water 0,2=water '
        + '-2,2=water 4,-3=water 3,-5=water -3,1=grass 2,1=water -4,1=water 0,-2=water '
        + '3,0=water -4,2=water -1,0=grass').split(' ')
        .map(e => e.split('=') as [string, TileType])),
    }
    const contested: Axial = { q: 3, r: -2 }

    // It really is the plug case: two of their ponds round it, and not one field.
    expect(mustBeWater(island, contested)).toBe(true)
    expect(canBeWater(island, contested)).toBe(true)
    // ...and it really would take them below the floor.
    expect(mustBeLand(island, contested)).toBe(true)
    expect(dryAfter(island, contested, 'water')).toBeLessThan(LAND_FLOOR)

    const f = askForLand({ ...createFlow(), island, phase: 'free' }, contested)
    expect(tileOffer(f)).toEqual(['grass'])
    expect(tileTypeFor(f, contested, 'water')).toBe('grass')
  })

  it('is stated as a look-ahead because the count steps over the line', () => {
    /*
     * Why the rule asks "would this tile take them below the line" rather than
     * "are they below it already". One pond can cost them three ways out at once,
     * so the count does not fall THROUGH the line on its way down, it jumps clean
     * past it — and a rule that waited for the line to be reached would never fire.
     */
    const island = createIsland()
    expect(dryLandSockets(island)).toHaveLength(6)
    expect(dryLandSockets(island).length).toBeGreaterThan(LAND_FLOOR)
    const at = neighbours({ q: 0, r: 0 })[0] as Axial
    // Six, and one pond takes it to three: a fall of three in a single tile.
    expect(dryAfter(island, at, 'water')).toBe(3)
  })

  it('fills a gap between two of their ponds with water, not a green plug', () => {
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
     * The arithmetic, stated. A socket ringed by their fields cannot hold water,
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

describe('the outward corridor, close up', () => {
  it('holds of Fred\'s lonely rock, which is where the induction starts', () => {
    expect(hasOutwardCorridor(createIsland())).toBe(true)
  })

  it('is always a witness — the small proof the two guards rest on', () => {
    /*
     * `coast.survivable` asks the corridor question INSTEAD of the one-ply witness
     * question, not as well as it, and that is only sound because a corridor
     * implies a witness: its mouth is dry-empty, so `canBeGrass` there is
     * unconditionally true and `mustBeWater` unconditionally false, so grass is
     * what lands; it is beside their fields by definition; and the corridor runs
     * on past it, so it has an empty neighbour.
     *
     * Checked over played islands rather than argued, because the argument is only
     * as good as the code agreeing with it.
     */
    let s = 12345
    const rnd = (): number => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000 }
    for (let seed = 1; seed <= 40; seed++) {
      let island = createIsland()
      for (let n = 0; n < 30; n++) {
        const open = buildableSockets(island, sockets(island))
        if (open.length === 0) break
        const at = open[Math.floor(rnd() * open.length)] as Axial
        const want: TileType = rnd() < 0.75 ? 'water' : 'grass'
        island = place(island, at, landedType(island, at, want))
        if (!hasOutwardCorridor(island)) continue
        expect(canStillGrow(island), `seed ${seed}, after ${n + 1} tiles`).toBe(true)
      }
    }
  })

  it('is cut by water and never by a field', () => {
    /*
     * The two halves of the induction, stated as a test. A field introduces no
     * water, so no hex can gain a water neighbour and the dry set only loses the
     * hex built on — which is the whole reason `corridorAfter` may answer grass
     * without looking, and the reason `buildableSockets` can only ever refuse a
     * socket that refuses grass.
     */
    let s = 999
    const rnd = (): number => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000 }
    let sawACut = false
    for (let seed = 1; seed <= 14; seed++) {
      let island = createIsland()
      for (let n = 0; n < 28; n++) {
        const open = buildableSockets(island, sockets(island))
        if (open.length === 0) break
        for (const at of open) {
          if (!hasOutwardCorridor(island)) continue
          if (allows(island, at, 'grass')) {
            expect(hasOutwardCorridor(withTile(island, at, 'grass')),
              `a field at ${key(at)} cut the corridor`).toBe(true)
          }
          if (allows(island, at, 'water')
            && !hasOutwardCorridor(withTile(island, at, 'water'))) sawACut = true
        }
        const at = open[Math.floor(rnd() * open.length)] as Axial
        island = place(island, at, landedType(island, at, rnd() < 0.8 ? 'water' : 'grass'))
      }
    }
    // ...and the guard is not vacuous: water really can cut it.
    expect(sawACut, 'no water placement ever threatened the corridor').toBe(true)
  }, 30_000)

  it('reads a hypothetical island exactly as a real one', () => {
    /*
     * `withTile` is a VIEW over the tile map rather than a copy of it — the guards
     * ask questions of a hypothetical island on every tap, and copying the map each
     * time is the quadratic `allows` was fixed to avoid, arrived at from the other
     * side. The saving costs one cast, because the lib types `keys`/`values`/
     * `entries` as `MapIterator` and a generator is not one.
     *
     * So the cast is held to `place`'s behaviour here, on every member of the
     * interface including full iteration. If the shim is ever wrong this is the
     * test that says so, rather than a coastline fault three files away.
     */
    let island = createIsland()
    island = place(island, { q: 1, r: 0 }, 'water')
    island = place(island, { q: 0, r: 1 }, 'grass')
    for (const [at, t] of [[{ q: -1, r: 0 }, 'grass'], [{ q: 2, r: -1 }, 'water'],
      // ...and an occupied coord, where `place` is a no-op and so is the view.
      [{ q: 1, r: 0 }, 'grass']] as Array<[Axial, TileType]>) {
      const real = place(island, at, t).tiles
      const view = withTile(island, at, t).tiles
      expect(view.size).toBe(real.size)
      const every = [...real.keys(), '9,9', key(at)]
      for (const k of every) {
        expect(view.get(k), `get ${k}`).toBe(real.get(k))
        expect(view.has(k), `has ${k}`).toBe(real.has(k))
      }
      expect([...view.keys()].sort()).toEqual([...real.keys()].sort())
      expect([...view.values()].sort()).toEqual([...real.values()].sort())
      expect([...view.entries()].map(String).sort())
        .toEqual([...real.entries()].map(String).sort())
      expect([...view].map(String).sort()).toEqual([...real].map(String).sort())
      const seen: string[] = []
      view.forEach((v, k, m) => { seen.push(`${k}=${v}`); expect(m).toBe(view) })
      expect(seen.sort()).toEqual([...real].map(([k, v]) => `${k}=${v}`).sort())
    }
  })

  it('turns water into a field where a pond would cut the last way out', () => {
    /*
     * The guard doing its work at the choke point rather than in the outlines,
     * which is the case that costs them nothing: the socket still glows, and the
     * only difference is which button is on the panel.
     *
     * Built by playing rather than constructed, because a hand-built fixture for
     * this is exactly the kind that passes while the real thing is broken.
     */
    let s = 4242
    const rnd = (): number => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000 }
    let flips = 0
    for (let seed = 1; seed <= 40 && flips === 0; seed++) {
      let island = createIsland()
      for (let n = 0; n < 40; n++) {
        const open = buildableSockets(island, sockets(island))
        if (open.length === 0) break
        for (const at of open) {
          if (settledType(island, at, 'water') === 'water'
            && landedType(island, at, 'water') === 'grass') {
            flips++
            // Whatever it lands must still be something the coastline can draw.
            expect(allows(island, at, 'grass')).toBe(true)
            /*
             * ...and the offer must not be advertising the water it will not give.
             * Stated as the absence of water rather than as exactly one button:
             * rock came later and is dry land too, so it may honestly appear here
             * (see the note in "offers one button when a field is forced").
             */
            const offer = tileOffer({
              ...createFlow(), island, phase: 'placing', pending: at, chosen: null,
            })
            expect(offer).not.toContain('water')
            expect(offer).toContain('grass')
          }
        }
        const at = open[Math.floor(rnd() * open.length)] as Axial
        island = place(island, at, landedType(island, at, 'water'))
      }
    }
    expect(flips, 'the choke-point guard never fired at all').toBeGreaterThan(0)
  }, 30_000)
})

/**
 * THE COUNTEREXAMPLE THAT USED TO WORK, kept because it is the reason for the
 * backstop and the only cheap way to notice the backstop going away.
 *
 * A Fable review of the dry-connection floor falsified the property the floor was
 * written to guarantee: sixty-four taps, every one of them a button the offer
 * actually showed, ending with their fields sealed behind water. This test used
 * to assert that it succeeded — a limitation the project knew about rather than
 * one it had forgotten — and the assertion below is where that was recorded.
 *
 * IT NO LONGER SUCCEEDS. The sequence is turned back on its FIFTY-SECOND tap, at
 * (3,0), and the island it leaves behind can still grow. Both halves are asserted,
 * because the interesting regression is not "the island got sealed" but "the
 * sequence became possible again", and the second is what catches it early.
 *
 * WHICH PART OF THE FIX DOES IT, since that is the useful thing to know. Not the
 * witness backstop: replayed against that alone the sequence still seals, because
 * by its sixty-third tap the only witness left is a hex enclosed on all six sides,
 * and at the two taps before that grass is INFEASIBLE at the socket being wetted
 * so there is no other kind to fall back on. What refuses (3,0) is
 * `hasOutwardCorridor` — water there would cut the last dry way out to the open
 * sea, and grass cannot be drawn there, so the socket does not glow at all. See
 * `coast.landedType` for why one ply was never going to be enough.
 *
 * Severity, for whoever reads this next: it took a greedy anti-play harvest plus a
 * six-ply search to find. Before the floor existed, SIX natural taps walled them in.
 */
describe('the counterexample the floor could not stop', () => {
  /** Same question the played-island suite asks, asked from out here. */
  const fieldsCanGrow = (f: Flow): boolean =>
    buildableSockets(f.island, sockets(f.island))
      .some(s => neighbours(s).some(n => f.island.tiles.get(key(n)) === 'grass')
        && tileTypeFor(f, s, 'grass') === 'grass')

  const SEALED: Array<[number, number, TileType]> = [
    [-1, 0, 'water'], [-2, 1, 'water'], [-1, -1, 'water'], [-3, 1, 'water'],
    [-2, 2, 'water'], [-1, 1, 'grass'], [0, -2, 'water'], [-3, 3, 'water'],
    [-2, 3, 'water'], [-4, 1, 'water'], [-2, -1, 'water'], [-4, 3, 'water'],
    [-3, 0, 'water'], [-4, 4, 'water'], [-2, 0, 'water'], [-1, 3, 'water'],
    [-5, 5, 'water'], [-5, 3, 'water'], [0, -1, 'grass'], [-3, 4, 'water'],
    [1, -3, 'water'], [-6, 5, 'water'], [-7, 6, 'water'], [0, -3, 'water'],
    [0, -4, 'water'], [2, -4, 'water'], [0, 3, 'water'], [-4, 5, 'water'],
    [2, -3, 'water'], [-4, 2, 'water'], [1, -5, 'water'], [-1, -3, 'water'],
    [1, 2, 'water'], [0, 1, 'grass'], [0, 2, 'grass'], [-1, 2, 'grass'],
    [1, 3, 'water'], [-1, -2, 'water'], [1, -2, 'grass'], [-1, 4, 'water'],
    [2, 2, 'water'], [-2, 4, 'water'], [-3, 2, 'water'], [1, -4, 'water'],
    [3, -4, 'water'], [1, -1, 'grass'], [0, 4, 'water'], [3, -3, 'water'],
    [2, 1, 'water'], [1, 0, 'grass'], [1, 1, 'grass'], [3, 0, 'water'],
    [2, -1, 'grass'], [2, -2, 'grass'], [2, 0, 'grass'], [4, -3, 'water'],
    [3, 1, 'water'], [3, -2, 'grass'], [4, -4, 'water'], [4, -1, 'water'],
    [3, -1, 'grass'], [5, -3, 'water'], [5, -2, 'water'], [4, -2, 'grass'],
  ]

  it('is turned back, and leaves them an island that can still grow', () => {
    let f = createFlow()
    /** Where the game stopped playing along, and what it did about it. */
    let refused: string | null = null
    for (let n = 0; n < SEALED.length && refused === null; n++) {
      const [q, r, want] = SEALED[n] as [number, number, TileType]
      const at: Axial = { q, r }
      /*
       * A tap they could not have made is a step the sequence no longer has. Only
       * a glowing socket can be tapped at all — `picking.nearestSocket` reads the
       * outlines, and those are `buildableSockets` — so this is the honest test of
       * reachability and it comes before the offer.
       */
      if (!buildableSockets(f.island, sockets(f.island)).some(s => key(s) === key(at))) {
        refused = `tap ${n} at ${q},${r}: the socket does not glow`
        break
      }
      f = askForLand({ ...f, phase: 'free' }, at)
      if (f.phase !== 'placing') break
      // ...and a button they could not have pressed is the other way to be refused.
      if (!tileOffer(f).includes(want)) {
        refused = `tap ${n} at ${q},${r}: ${want} is not offered`
        break
      }
      f = placeTile(chooseTile(f, want), at)
      for (let g = 0; g < 200 && f.plot; g++) {
        f = challengePassed(tapSum({ ...f, phase: 'free' }))
      }
      expect(fieldsCanGrow(f), `after tap ${n} at ${q},${r}`).toBe(true)
    }
    /*
     * THE HEADLINE. This used to read `expect(offeredEvery).toBe(true)` — the
     * sequence was reachable, and the island it built was sealed. Both have
     * changed. Pinned at the exact tap so that a fix which merely moves the
     * failure later still shows up as a diff worth reading rather than a pass.
     */
    expect(refused).toBe('tap 51 at 3,0: the socket does not glow')
    expect(fieldsCanGrow(f), 'and their fields can still grow').toBe(true)
  })
})
