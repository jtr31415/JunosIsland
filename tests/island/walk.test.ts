/**
 * PB-052: six mountains in a ring, and a pet that cannot get out.
 *
 * The tile map says the middle hex is grass with six land neighbours, so every
 * proof written against the tile map — `hasOutwardCorridor` above all — reports
 * a healthy island. The proof is answering a different question. Mountains are
 * GEOMETRY: each one grows a keep-out disc a little over 1.03 units across at
 * walking height, and adjacent hex centres are 2.0000 apart, so two mountains
 * on neighbouring hexes OVERLAP. Six of them close a wall no pet can pass, and
 * nothing in the placement path can see it.
 *
 * This file measures the real mountain meshes off disk rather than quoting a
 * number, for the same reason `coast.test.ts` re-measures the coast meshes: a
 * fact about a binary file that nothing checks is a fact that goes stale the
 * first time someone re-exports the art. The radius IS the test here — if the
 * mountains were 0.9 across the ring would not seal and there would be no bug.
 *
 * `walk.ts` is DETECTION ONLY. Nothing here changes what placement accepts, and
 * the second block below is a deliberate record of the defect standing.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createIsland, place } from '../../src/island/world/grid'
import type { Island, TileType } from '../../src/island/world/grid'
import { key, distance, toWorld } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
import { MOUNTAIN_HEXES, mountainHexFor, mountainSpinFor } from '../../src/island/world/props'
import { createFlow, tileTypeFor, rockUnlocked } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { canBeRock, hasOutwardCorridor } from '../../src/island/world/coast'
import {
  NON_ADJACENT_SPACING, PINCH_LIMIT,
  gapBetween, cornerId, cornersOf, walkableRegions, regionOf, sealedHexes, wouldSeal,
} from '../../src/island/world/walk'
import type { KeepOut } from '../../src/island/world/walk'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '../../src/island/public')

/* ------------------------------------------------------------ real geometry */

/**
 * Every POSITION out of a glTF + .bin pair. No loader, no GPU.
 *
 * Lifted from `coast.test.ts:42` — the same accessor walk, honouring
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

/**
 * `footprintBelow(obj, WALKING_HEIGHT)` (props.ts:391), recomputed from the file.
 *
 * The XZ bounding-box centre of the whole model, then the furthest any vertex
 * BELOW `minY + 0.3` reaches from it. Below walking height, because that is the
 * only part of a mountain a pet can bump into, and it is what `sync` pushes
 * into `blocks` for `clearOf` to clamp against.
 *
 * NO SCALE FACTOR. `props.ts:1209` skips `fitInto` entirely when `rockTile` is
 * true — "NATIVE SIZE for a mountain hex, and no size variation either" — and
 * every mountain glTF is a single node with no transform on it, so the vertices
 * on disk are the vertices in the world. The only transform the game does apply
 * is the Y spin from `mountainSpinFor`, which is passed in here.
 */
const radiusCache = new Map<string, number>()

function keepOutRadius(stem: string, spin: number): number {
  // Memoised: `walkableRegions` asks for a gap per side, and re-reading a glTF
  // a few hundred times makes a fast test look like a slow one.
  const ck = `${stem}@${spin.toFixed(6)}`
  const hit = radiusCache.get(ck)
  if (hit !== undefined) return hit
  const r = measureKeepOut(stem, spin)
  radiusCache.set(ck, r)
  return r
}

function measureKeepOut(stem: string, spin: number): number {
  const pts = positionsOf(`props/${stem}.gltf`)
  const cos = Math.cos(spin)
  const sin = Math.sin(spin)
  // Spun about the object's own origin, exactly as `obj.rotation.y` does before
  // `footprintBelow` takes the world box.
  const spun = pts.map(([x, y, z]) => [
    (x as number) * cos + (z as number) * sin,
    y as number,
    -(x as number) * sin + (z as number) * cos,
  ] as [number, number, number])

  let minX = Infinity, maxX = -Infinity, minY = Infinity, minZ = Infinity, maxZ = -Infinity
  for (const [x, y, z] of spun) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z)
    minY = Math.min(minY, y)
  }
  const cx = (minX + maxX) / 2
  const cz = (minZ + maxZ) / 2
  const ceiling = minY + 0.3                                    // props.WALKING_HEIGHT

  let reach = 0
  for (const [x, y, z] of spun) {
    if (y > ceiling) continue
    reach = Math.max(reach, Math.hypot(x - cx, z - cz))
  }
  return reach
}

/**
 * The hex circumradius, measured the way `tiles.ts:130` measures it: HALF THE
 * Z-EXTENT of the grass hex, not the x-extent. There is no hex-size constant in
 * the source and there must not be one here either.
 */
function measuredHexSize(): number {
  const pts = positionsOf('tiles/hex_grass.gltf')
  let lo = Infinity, hi = -Infinity
  for (const p of pts) { lo = Math.min(lo, p[2] as number); hi = Math.max(hi, p[2] as number) }
  return (hi - lo) / 2
}

const HEX_SIZE = measuredHexSize()
const SPACING = Math.sqrt(3) * HEX_SIZE

/**
 * The largest pet in the pack, measured from its GLB.
 *
 * `pets.ts:643-653` scales every animal by 0.16 and then takes half its widest
 * horizontal box extent as `radius`. This repeats that from the accessor
 * min/max in the GLB's JSON chunk. CAVEAT, stated because it matters to the
 * premise below: this ignores node transforms and skinning, where the real
 * `Box3.setFromObject` would not. Twenty-four of the twenty-six models carry no
 * transform at all, so the number is right to within a rounding, and the
 * premise it feeds has better than a unit of headroom either way.
 */
function largestPetRadius(): { species: string; radius: number } {
  const dir = resolve(PUBLIC, 'pets')
  let best = { species: '', radius: 0 }
  for (const f of PET_FILES) {
    const b = readFileSync(resolve(dir, f))
    let off = 12
    let json: { meshes?: Array<{ primitives: Array<{ attributes: { POSITION: number } }> }>
      accessors: Array<{ min?: number[]; max?: number[] }> } | null = null
    while (off < b.length) {
      const len = b.readUInt32LE(off)
      const type = b.readUInt32LE(off + 4)
      if (type === 0x4E4F534A) { json = JSON.parse(b.slice(off + 8, off + 8 + len).toString('utf8')); break }
      off += 8 + len
    }
    if (!json) continue
    let lo = [Infinity, Infinity, Infinity]
    let hi = [-Infinity, -Infinity, -Infinity]
    for (const m of json.meshes ?? []) {
      for (const p of m.primitives) {
        const acc = json.accessors[p.attributes.POSITION]
        if (!acc?.min || !acc.max) continue
        for (let i = 0; i < 3; i++) {
          lo[i] = Math.min(lo[i] as number, acc.min[i] as number)
          hi[i] = Math.max(hi[i] as number, acc.max[i] as number)
        }
      }
    }
    const r = Math.max((hi[0] as number) - (lo[0] as number), (hi[2] as number) - (lo[2] as number)) / 2 * 0.16
    if (r > best.radius) best = { species: f, radius: r }
  }
  return best
}

/** The pack, as it sits in `public/pets`. */
const PET_FILES = [
  'animal-beaver.glb', 'animal-bee.glb', 'animal-bunny.glb', 'animal-cat.glb',
  'animal-caterpillar.glb', 'animal-chick.glb', 'animal-cow.glb', 'animal-crab.glb',
  'animal-deer.glb', 'animal-dog.glb', 'animal-elephant.glb', 'animal-fish.glb',
  'animal-fox.glb', 'animal-giraffe.glb', 'animal-hog.glb', 'animal-koala.glb',
  'animal-lion.glb', 'animal-monkey.glb', 'animal-panda.glb', 'animal-parrot.glb',
  'animal-penguin.glb', 'animal-pig.glb', 'animal-polar.glb', 'animal-tiger.glb',
]

/* ---------------------------------------------------------------- the world */

/** Ring of six around the origin, in the order `neighbours` returns them. */
const RING: Array<[number, number]> = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]

const ringHex = (i: number): Axial => {
  const [q, r] = RING[i] as [number, number]
  return { q, r }
}

/**
 * What a pet must walk round, from the REAL mesh a rock hex will grow.
 *
 * `mountainHexFor` and `mountainSpinFor` are the game's own deterministic
 * choices (props.ts:194), so this is not a stand-in for the geometry — it is
 * the geometry, for the hex it is asked about.
 */
const mountains: KeepOut = (a, t) =>
  t === 'rock' ? keepOutRadius(mountainHexFor(a), mountainSpinFor(a)) : 0

/** Grass origin, six rock neighbours: PB-052 as she built it. */
function ringOfSix(): Island {
  let i = createIsland()                                   // origin is grass already
  for (let k = 0; k < 6; k++) i = place(i, ringHex(k), 'rock')
  return i
}

/* ------------------------------------------------------------- the geometry */

describe('the mountains a rock hex grows are wider than the hex it stands on', () => {
  it('measures every mountain model at walking height, native size', () => {
    for (const { name } of MOUNTAIN_HEXES) {
      const r = keepOutRadius(name, 0)
      /*
       * The band that makes PB-052 a bug rather than a near miss. If a
       * re-export moves these below 1.0 the ring stops sealing and the
       * reproduction below becomes a false alarm — so fail HERE, loudly, and
       * not three tests down where it would look like a logic error.
       */
      expect(r).toBeGreaterThan(1.0)
      expect(r).toBeLessThan(1.1)
    }
  })

  it('two mountains on adjacent hexes overlap — the gap is NEGATIVE', () => {
    const island = ringOfSix()
    expect(SPACING).toBeCloseTo(2.0, 3)
    for (let k = 0; k < 6; k++) {
      const gap = gapBetween(island, ringHex(k), ringHex((k + 1) % 6), HEX_SIZE, mountains)
      expect(gap).toBeLessThan(0)
      // Joe's measured band: -0.066 to -0.125, with a little slack either side.
      expect(gap).toBeGreaterThan(-0.2)
    }
  })

  it('a mountain leaves room beside plain grass — the middle is not filled in', () => {
    const island = ringOfSix()
    for (let k = 0; k < 6; k++) {
      // Origin is grass, so only one disc stands in this passage.
      expect(gapBetween(island, { q: 0, r: 0 }, ringHex(k), HEX_SIZE, mountains))
        .toBeGreaterThan(0.9)
    }
  })
})

/* ---------------------------------------------------------- the corner model */

describe('the corner graph', () => {
  it('names a corner by its three hexes, in any order', () => {
    const a = { q: 0, r: 0 }
    const b = { q: 1, r: 0 }
    const c = { q: 0, r: 1 }
    expect(cornerId(a, b, c)).toBe(cornerId(c, a, b))
    expect(cornerId(a, b, c)).toBe(cornerId(b, c, a))
    // No floating point in the id — it is three hex keys and nothing else.
    expect(cornerId(a, b, c)).toMatch(/^[-\d,]+\|[-\d,]+\|[-\d,]+$/)
    expect(cornerId(a, b, c).split('|')).toContain(key(a))
  })

  it('gives every hex six corners, shared with its neighbours', () => {
    const mine = cornersOf({ q: 0, r: 0 })
    expect(new Set(mine).size).toBe(6)
    // Each corner of the origin is also a corner of the two hexes it names.
    for (let k = 0; k < 6; k++) {
      const theirs = new Set(cornersOf(ringHex(k)))
      const shared = mine.filter(c => theirs.has(c))
      expect(shared).toHaveLength(2)                    // the two ends of one side
    }
  })

  it('the premise: only ADJACENT hexes can pinch each other', () => {
    // Every hex two or more steps away is at least this far off.
    for (let q = -4; q <= 4; q++) {
      for (let r = -4; r <= 4; r++) {
        const a = { q, r }
        if (distance({ q: 0, r: 0 }, a) < 2) continue
        const w = toWorld(a, HEX_SIZE)
        expect(Math.hypot(w.x, w.z)).toBeGreaterThanOrEqual(NON_ADJACENT_SPACING * HEX_SIZE - 1e-9)
      }
    }
    // ...and the same number said as a multiple of the adjacent spacing.
    expect(PINCH_LIMIT * SPACING).toBeCloseTo(NON_ADJACENT_SPACING * HEX_SIZE, 9)
  })

  it('the premise holds for the widest mountain and the largest pet', () => {
    let widest = 0
    for (const { name } of MOUNTAIN_HEXES) {
      for (let spin = 0; spin < 6; spin++) {
        widest = Math.max(widest, keepOutRadius(name, spin * (Math.PI / 3)))
      }
    }
    const pet = largestPetRadius()
    expect(pet.radius).toBeGreaterThan(0)

    /*
     * THE TRIPWIRE. `walk.ts` only ever asks whether ADJACENT obstacles pinch.
     * That is sound while the widest pair of discs, dilated by the widest pet,
     * still cannot reach across a non-adjacent gap. If a future prop is wide
     * enough to break this, the corner model starts UNDER-REPORTING seals and
     * this assertion is the only thing that will say so.
     */
    expect(2 * widest + 2 * pet.radius).toBeLessThan(NON_ADJACENT_SPACING * HEX_SIZE)

    // And the model is not vacuous: adjacent mountains genuinely do pinch.
    expect(2 * widest).toBeGreaterThan(SPACING)
  })
})

/* -------------------------------------------------------------- PB-052 */

describe('PB-052: a ring of six mountains seals the hex in the middle', () => {
  it('strands a pet of radius ZERO — the strongest form of the claim', () => {
    const island = ringOfSix()
    const regions = walkableRegions(island, HEX_SIZE, mountains, 0)

    // A point-sized pet cannot get out, so no pet can.
    expect(regions.length).toBeGreaterThan(1)

    const mine = regionOf(island, { q: 0, r: 0 }, HEX_SIZE, mountains, 0)
    expect(mine).not.toBeNull()
    const main = regions[0] as readonly string[]
    // Not merely a different list — no corner in common with the main body.
    for (const c of mine as readonly string[]) expect(main).not.toContain(c)
    expect(mine).not.toEqual(main)

    // The middle hex has exactly its own six corners and nowhere else to go.
    expect(mine).toHaveLength(6)
    expect([...(mine as readonly string[])].sort())
      .toEqual([...cornersOf({ q: 0, r: 0 })].sort())

    /*
     * The middle hex and NOTHING ELSE. The six rocks are not stranded: a pet
     * never stands inside a mountain, and their outward corners open onto the
     * rest of the world. Reporting them would be the model crying wolf.
     */
    expect(sealedHexes(island, HEX_SIZE, mountains, 0).map(key)).toEqual(['0,0'])
  })

  it('is still sealed for a real pet, which is only more so', () => {
    const island = ringOfSix()
    const pet = largestPetRadius().radius
    expect(sealedHexes(island, HEX_SIZE, mountains, pet).map(key)).toContain('0,0')
  })

  it('the sixth rock is the one that closes it', () => {
    let five = createIsland()
    for (let k = 0; k < 5; k++) five = place(five, ringHex(k), 'rock')

    // Five leaves a way out, so nothing is stranded yet...
    expect(sealedHexes(five, HEX_SIZE, mountains, 0)).toHaveLength(0)
    // ...and the sixth is the tap that would strand her.
    expect(wouldSeal(five, ringHex(5), 'rock', HEX_SIZE, mountains, 0)).toBe(true)
  })
})

/*
 * A RECORD OF THE DEFECT, NOT A SPECIFICATION.
 *
 * This asserts what the placement path does TODAY: it takes all six rocks and
 * the corridor proof sees nothing wrong. When the remedy lands — Joe's call,
 * JT-033 — this test must be UPDATED to the new behaviour, never deleted. It is
 * the only place that records what the bug actually was.
 */
describe('PB-052 is live', () => {
  it('the placement path accepts all six rocks today, and the corridor proof cannot see it', () => {
    /*
     * A grass island with a notch in it: everything two and three steps out,
     * plus the middle. The six hexes at one step are open sockets she can tap,
     * and there are 30 tiles behind them, which is what unlocks rock.
     */
    let island: Island = createIsland()
    for (let q = -3; q <= 3; q++) {
      for (let r = -3; r <= 3; r++) {
        const d = distance({ q: 0, r: 0 }, { q, r })
        if (d === 2 || d === 3) island = place(island, { q, r }, 'grass')
      }
    }
    const before: Flow = { ...createFlow(), island, phase: 'placing', pending: null, chosen: null }
    expect(rockUnlocked(before)).toBe(true)

    // Six taps, each judged against the island as it stood at the time.
    for (let k = 0; k < 6; k++) {
      const at = ringHex(k)
      const f: Flow = { ...before, island, pending: at, chosen: 'rock' as TileType }
      expect(canBeRock(island, at)).toBe(true)
      // ACCEPTED. Not downgraded to grass, not refused.
      expect(tileTypeFor(f, at, 'rock')).toBe('rock')
      island = place(island, at, 'rock')
    }

    /*
     * And here is the blind spot. `hasOutwardCorridor` walks EMPTY cells of the
     * tile map, so a hex surrounded by land it can see through reads as fine —
     * and `tileTypeFor` (flow.ts:524) never asks it about rock in the first
     * place. Both are true statements about the tile map. Neither is true about
     * the world the pet walks in.
     */
    expect(hasOutwardCorridor(island)).toBe(true)
    expect(sealedHexes(island, HEX_SIZE, mountains, 0).map(key)).toContain('0,0')
  })
})

/* ------------------------------------------------------- negative controls */

describe('the model does not cry wolf', () => {
  /** Origin plus everything within `d` steps, all grass. */
  function field(d: number, at?: Axial, t: TileType = 'rock'): Island {
    let i = createIsland()
    for (let q = -d; q <= d; q++) {
      for (let r = -d; r <= d; r++) {
        if (distance({ q: 0, r: 0 }, { q, r }) > d) continue
        i = place(i, { q, r }, at && at.q === q && at.r === r ? t : 'grass')
      }
    }
    return i
  }

  it('a plain grass island is one open meadow', () => {
    const regions = walkableRegions(field(3), HEX_SIZE, mountains, 0.2)
    expect(regions).toHaveLength(1)
    expect(sealedHexes(field(3), HEX_SIZE, mountains, 0.2)).toHaveLength(0)
  })

  it('one mountain in a field seals nothing — a pet walks round it', () => {
    const island = field(3, { q: 1, r: 0 })
    expect(walkableRegions(island, HEX_SIZE, mountains, 0)).toHaveLength(1)
    expect(sealedHexes(island, HEX_SIZE, mountains, 0)).toHaveLength(0)
  })

  it('two mountains side by side pinch each other but seal nothing', () => {
    // `place` is a no-op on an occupied hex, so the pair is set directly.
    const tiles = new Map(field(3).tiles)
    tiles.set('1,0', 'rock')
    tiles.set('1,-1', 'rock')
    const two: Island = { tiles }
    expect(gapBetween(two, { q: 1, r: 0 }, { q: 1, r: -1 }, HEX_SIZE, mountains))
      .toBeLessThan(0)
    // ...and yet there is nothing behind them to strand.
    expect(sealedHexes(two, HEX_SIZE, mountains, 0)).toHaveLength(0)
  })

  it('an ordinary grass tile never seals anything', () => {
    const island = field(2)
    expect(wouldSeal(island, { q: 3, r: 0 }, 'grass', HEX_SIZE, mountains, 0)).toBe(false)
    expect(wouldSeal(island, { q: 0, r: 3 }, 'grass', HEX_SIZE, mountains, 0)).toBe(false)
  })

  it('a lone mountain on the rim never seals anything either', () => {
    const island = field(2)
    expect(wouldSeal(island, { q: 3, r: 0 }, 'rock', HEX_SIZE, mountains, 0)).toBe(false)
  })

  it('does not mutate the island it is asked about', () => {
    const island = ringOfSix()
    const snapshot = [...island.tiles.entries()].map(([k, v]) => `${k}=${v}`).sort()
    wouldSeal(island, { q: 2, r: 0 }, 'rock', HEX_SIZE, mountains, 0)
    expect([...island.tiles.entries()].map(([k, v]) => `${k}=${v}`).sort()).toEqual(snapshot)
  })

  it('is deterministic — the same island gives the same regions twice', () => {
    const island = ringOfSix()
    const a = walkableRegions(island, HEX_SIZE, mountains, 0)
    const b = walkableRegions(island, HEX_SIZE, mountains, 0)
    expect(a).toEqual(b)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    // Largest first, and every component internally sorted.
    for (let i = 1; i < a.length; i++) {
      expect((a[i] as readonly string[]).length)
        .toBeLessThanOrEqual((a[i - 1] as readonly string[]).length)
    }
    for (const comp of a) expect([...comp]).toEqual([...comp].sort())
  })

  it('answers null for a hex nobody lives on', () => {
    const island = ringOfSix()
    expect(regionOf(island, { q: 9, r: 9 }, HEX_SIZE, mountains, 0)).toBeNull()
  })
})
