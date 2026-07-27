/**
 * Mountains: the third kind of tile.
 *
 * Joe, 28 July: *"it needs to be pickable in the selector after she has placed
 * 15 tiles already. for that, i want the rocky tiles, including their supplied
 * pre-assembles with gras and gras plus mountains. once available, they need no
 * rules, they can be placed anywhere that does not neighbour water and water
 * cannot be placed next to a mountain tile. we can update those rules later
 * though."*
 *
 * The rules are deliberately pinned as SEPARATE tests from the unlock, because
 * he has said the rules will change and the unlock will not. When they change,
 * the tests to rewrite should be obvious and few.
 *
 * The reason this file exists at all, though, is the third type itself. Every
 * rule in the coastline was written when there were exactly two, so it asks
 * `=== 'grass'` and lets everything else mean water — correct for two types and
 * silently wrong for three. TypeScript cannot find those places: they compare
 * values rather than switching exhaustively. So the first block below is not
 * about mountains, it is about the eight places rock could have been mistaken
 * for open sea.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createIsland, place, isLand, tileAt } from '../../src/island/world/grid'
import { key } from '../../src/island/world/hex'
import type { Island, TileType } from '../../src/island/world/grid'
import {
  waterMask, canBeWater, canBeGrass, canBeRock, mustBeWater, lookFor,
} from '../../src/island/world/coast'
import { createFlow, tileOffer, tileTypeFor, rockUnlocked } from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { spaceSurplus } from '../../src/island/governors'
import { PALETTE } from '../../src/island/world/increments'
import { MOUNTAIN_HEXES, mountainHexFor, mountainSpinFor } from '../../src/island/world/props'
import { balance } from '../../src/island/balance'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '../../src/island/public')

/**
 * The widest horizontal extent of a glTF, read straight from its accessors.
 *
 * `max(x, z)`, matching how `fitInto` defines width — measuring a different axis
 * is the mistake that pack already cost this project once, on the hex itself.
 */
function widthOf(rel: string): number {
  const j = JSON.parse(readFileSync(resolve(PUBLIC, rel), 'utf8')) as {
    meshes?: Array<{ primitives: Array<{ attributes: { POSITION: number } }> }>
    accessors: Array<{ min?: number[]; max?: number[] }>
  }
  let lo = [Infinity, Infinity, Infinity]
  let hi = [-Infinity, -Infinity, -Infinity]
  for (const mesh of j.meshes ?? []) {
    for (const prim of mesh.primitives) {
      const acc = j.accessors[prim.attributes.POSITION]
      if (!acc?.min || !acc.max) continue
      for (let i = 0; i < 3; i++) {
        lo[i] = Math.min(lo[i] as number, acc.min[i] as number)
        hi[i] = Math.max(hi[i] as number, acc.max[i] as number)
      }
    }
  }
  return Math.max((hi[0] as number) - (lo[0] as number), (hi[2] as number) - (lo[2] as number))
}

/** Ring of six around the origin, in the order `neighbours` returns them. */
const RING: Array<[number, number]> = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]

/** An island from a sketch: origin plus whichever ring slots are named. */
function sketch(origin: TileType, ring: Partial<Record<number, TileType>>): Island {
  let i: Island = { tiles: new Map([['0,0', origin]]) }
  for (const [slot, type] of Object.entries(ring)) {
    const [q, r] = RING[Number(slot)] as [number, number]
    i = place(i, { q, r }, type as TileType)
  }
  return i
}

/** A flow with a given island, at the point where she is choosing a kind. */
const placing = (island: Island, pending: { q: number; r: number } | null): Flow => ({
  ...createFlow(), island, phase: 'placing', pending, chosen: null,
})

describe('rock is dry land, everywhere the code asks', () => {
  /*
   * THE BUG THIS FILE WAS WRITTEN FOR. Each of these read `=== 'grass'` before
   * rock existed, so a mountain would have presented open water to its
   * neighbours — cutting beaches into the middle of her island, and doing it
   * silently, because nothing throws when a hex merely looks wrong.
   */

  it('isLand covers both kinds of land and no water', () => {
    expect(isLand('grass')).toBe(true)
    expect(isLand('rock')).toBe(true)
    expect(isLand('water')).toBe(false)
    // Off the edge of the island is open sea, and must not read as land.
    expect(isLand(undefined)).toBe(false)
  })

  it('presents LAND to the coast mask, not open water', () => {
    // A water hex with six rock neighbours is landlocked on all six sides. Were
    // rock read as water the mask would be 0b111111 — a pond in open sea.
    const ring: Partial<Record<number, TileType>> = {}
    for (let k = 0; k < 6; k++) ring[k] = 'rock'
    expect(waterMask(sketch('water', ring), { q: 0, r: 0 })).toBe(0)
  })

  it('is drawn as a grass hex, since there is no rocky hex model in the pack', () => {
    // The mountain is a PROP on top; the hex underneath is the grass model. If
    // this ever becomes its own mesh, tiles.ts needs a new RenderKind first.
    const i = place(createIsland(), { q: 1, r: 0 }, 'rock')
    expect(lookFor(i, { q: 1, r: 0 })).toEqual({ kind: 'grass', turns: 0 })
  })

  it('is land, but is NOT counted as lodging for a pet', () => {
    /*
     * THE ONE PLACE `isLand` IS THE WRONG QUESTION, and it is deliberate.
     *
     * A mountain hex is planted at the model's native size and centred, so the
     * mound covers its tile and blocks nearly the whole hex below walking
     * height. There is nowhere on it for a pet to stand. Were it counted as
     * room, the governor would believe she has space she cannot use and pets
     * would fail placement silently — worse than a visible shortage.
     *
     * So: rock counts as land for the COASTLINE (it is dry, it can be built
     * from) and not as habitat for the GOVERNORS. If these two ever agree
     * again, one of them has been changed without the other being considered.
     */
    const f = { ...createFlow(), island: sketch('grass', { 0: 'rock', 1: 'rock' }) }
    expect(spaceSurplus(f)).toBe(1)          // the one field, not the two peaks
  })

  it('does not let mustBeWater fire beside it', () => {
    /*
     * Two of her ponds round a socket and none of her fields forces water into
     * it, so a green plug never blocks a channel. A ROCK neighbour is her land
     * too — and water beside rock is illegal — so forcing water there would be
     * a contradiction the placement rules could not satisfy.
     *
     * The rock sits at (-1,0), two hexes from either pond, because a rock
     * adjacent to water is not a state the rules permit and building the
     * counterexample out of one would prove nothing.
     */
    const ponds = new Map<string, TileType>([['1,0', 'water'], ['1,-1', 'water']])
    expect(mustBeWater({ tiles: ponds }, { q: 0, r: 0 }), 'the control: it fires')
      .toBe(true)
    const withRock = new Map(ponds).set('-1,0', 'rock')
    expect(mustBeWater({ tiles: withRock }, { q: 0, r: 0 })).toBe(false)
  })

  it('survives a hand-edited save rather than crashing the island', () => {
    // save.ts validates the plot's type against the union by hand.
    const i = place(createIsland(), { q: 1, r: 0 }, 'rock')
    expect(tileAt(i, { q: 1, r: 0 })).toBe('rock')
  })
})

describe("Joe's two rules, both directions", () => {
  it('rock may go where nothing beside it is water', () => {
    expect(canBeRock(createIsland(), { q: 1, r: 0 })).toBe(true)
  })

  it('rock may NOT go beside her water', () => {
    const i = sketch('grass', { 0: 'water' })
    // (2,-1) touches the pond at (1,0).
    expect(canBeRock(i, { q: 2, r: -1 })).toBe(false)
  })

  it('water may NOT go beside her rock — the same rule, read the other way', () => {
    const i = sketch('grass', { 0: 'rock' })
    expect(canBeWater(i, { q: 2, r: -1 })).toBe(false)
  })

  it('leaves grass alone: rock is no obstacle to a field', () => {
    const i = sketch('grass', { 0: 'rock' })
    expect(canBeGrass(i, { q: 2, r: -1 })).toBe(true)
  })

  it('keeps rock out of the coastline entirely, which is what saves the table', () => {
    /*
     * The load-bearing consequence. Because rock and water can never be
     * neighbours, no water cell ever sees a rock edge — so the nineteen drawable
     * neighbourhoods need no new entries and the pack needs no new models. If
     * this test ever fails, the coast table is suddenly incomplete.
     */
    /*
     * Asserted through the GUARDS, not by building an island by hand. `place`
     * enforces nothing — it is the dumb store, and the rules live in `allows` —
     * so hand-placing water beside rock succeeds and would prove only that the
     * test author can write an illegal island.
     */
    let i: Island = createIsland()
    i = place(i, { q: 1, r: 0 }, 'rock')
    i = place(i, { q: 2, r: 0 }, 'rock')

    // Every empty hex touching her rock refuses water...
    const empties = new Set<string>()
    for (const k of i.tiles.keys()) {
      const [q, r] = k.split(',').map(Number) as [number, number]
      for (const [dq, dr] of RING) {
        const n = { q: q + dq, r: r + dr }
        if (tileAt(i, n) !== undefined) continue
        const touchesRock = RING.some(([eq, er]) =>
          tileAt(i, { q: n.q + eq, r: n.r + er }) === 'rock')
        if (!touchesRock) continue
        empties.add(key(n))
        expect(canBeWater(i, n), `water allowed beside rock at ${key(n)}`).toBe(false)
      }
    }
    expect(empties.size, 'no sockets were actually examined').toBeGreaterThan(5)

    // ...and symmetrically, rock refuses to go beside her water.
    let j: Island = place(createIsland(), { q: 1, r: 0 }, 'water')
    expect(canBeRock(j, { q: 2, r: -1 })).toBe(false)
    expect(canBeRock(j, { q: 2, r: 0 })).toBe(false)
  })
})

describe('the unlock: fifteen of her own tiles', () => {
  /** An island of `n` tiles she placed, plus the home hex, all dry and in a line. */
  const line = (n: number): Island => {
    let i: Island = createIsland()
    for (let q = 1; q <= n; q++) i = place(i, { q, r: 0 }, 'grass')
    return i
  }

  it('reads its threshold from balance.json, not from a constant in the code', () => {
    const rung = balance.unlocks.find(u => u.type === 'rock')
    expect(rung).toBeDefined()
    expect(rung?.tiles).toBe(15)
  })

  it('does not count the home hex Fred was already standing on', () => {
    // "after she has placed 15 tiles already" — fifteen of HERS.
    expect(rockUnlocked({ ...createFlow(), island: line(14) })).toBe(false)
    expect(rockUnlocked({ ...createFlow(), island: line(15) })).toBe(true)
  })

  it('is absent from the offer before it is earned, and present after', () => {
    const before = placing(line(14), { q: 15, r: 0 })
    expect(tileOffer(before)).not.toContain('rock')
    const after = placing(line(15), { q: 16, r: 0 })
    expect(tileOffer(after)).toContain('rock')
  })

  it('puts mountains LAST, so the two buttons she knows do not move', () => {
    const offer = tileOffer(placing(line(15), { q: 16, r: 0 }))
    expect(offer[offer.length - 1]).toBe('rock')
    expect(offer.indexOf('grass')).toBeLessThan(offer.indexOf('rock'))
  })
})

describe('the offer never shows a button that does something else', () => {
  /*
   * The rule the whole offer exists to keep (flow.ts): a button must show what
   * `tileTypeFor` is going to do. A mountain button at a socket beside her pond
   * would place grass, and a six-year-old would be right to conclude the
   * mountain button is broken.
   */
  it('withholds mountains at a socket beside water', () => {
    let i: Island = createIsland()
    for (let q = 1; q <= 15; q++) i = place(i, { q, r: 0 }, 'grass')
    i = place(i, { q: 16, r: 0 }, 'water')
    const beside = { q: 17, r: -1 }
    expect(canBeRock(i, beside)).toBe(false)
    expect(tileOffer(placing(i, beside))).not.toContain('rock')
  })

  it('and where it is offered, choosing it actually yields rock', () => {
    let i: Island = createIsland()
    for (let q = 1; q <= 15; q++) i = place(i, { q, r: 0 }, 'grass')
    const at = { q: 16, r: 0 }
    const f = placing(i, at)
    expect(tileOffer(f)).toContain('rock')
    expect(tileTypeFor(f, at, 'rock')).toBe('rock')
  })

  it('falls back to grass — never water — if rock is asked for illegally', () => {
    /*
     * Reachable from a restored save or the opening script, which chooses a kind
     * before it knows the socket. She asked for land; grass is the gentler
     * reading, and it never re-cuts her fields.
     */
    const i = sketch('grass', { 0: 'water' })
    expect(tileTypeFor(placing(i, null), { q: 2, r: -1 }, 'rock')).toBe('grass')
  })
})

describe('a mountain tile actually looks like one', () => {
  it('grows its scenery from the same pack, and every piece exists', () => {
    /*
     * THE SECOND PLACEMENT PATH — `increments.ts` for the plot she builds,
     * `props.ts` for the finished hex. Trees-inside-rocks was reported twice
     * because a fix touched only one of them (HANDOFF §6). Widening `TileType`
     * made the compiler demand this palette, which is the only reason it did not
     * get forgotten a third time.
     */
    const missing = PALETTE.rock.filter(n => {
      const dir = /_Color\d+$/.test(n) ? 'forest' : 'props'
      return !existsSync(resolve(PUBLIC, dir, `${n}.gltf`))
        && !existsSync(resolve(PUBLIC, dir, `${n}.glb`))
    })
    expect(missing).toEqual([])
    expect(PALETTE.rock.length).toBeGreaterThan(8)
  })

  it('grows no mountain on the PLOT, because the plot samples uniformly', () => {
    // `piecesFor` draws eight names at random from the palette, so a mountain in
    // this list would put eight of them on one hex. The peak is planted by
    // props.ts when the tile completes.
    expect(PALETTE.rock.filter(n => n.startsWith('mountain'))).toEqual([])
  })

  it('is stony rather than leafy — no forest trees in the rock palette', () => {
    expect(PALETTE.rock.filter(n => /^Tree_|^tree_|^trees_/.test(n))).toEqual([])
  })
})

describe('the finished mountain hex is the pack\'s pre-assembled one', () => {
  /*
   * Joe, 28 July, with the pack's own promo render: *"the mountain tiles are not
   * as expected... the tiles from the hex set that i am expecting for the
   * moutnain selection."* In that render each mound COVERS its hex. The first
   * attempt drew them through the ordinary feature path, which fits to
   * `FITS.big` and off-centres by `spread` on purpose — a mountain ON a meadow
   * rather than a mountain hex — so they came out as boulders on grass.
   */

  it('every mountain model exists on disk', () => {
    const missing = MOUNTAIN_HEXES
      .map(m => m.name)
      .filter(n => !existsSync(resolve(PUBLIC, 'props', `${n}.gltf`))
        && !existsSync(resolve(PUBLIC, 'props', `${n}.glb`)))
    expect(missing).toEqual([])
  })

  it('offers all three dressings Joe asked for, twice', () => {
    // "pure grey, with green and with green and trees" — 27 July, and again on
    // the 28th. The bare variants had been left out of the highland table.
    const names = MOUNTAIN_HEXES.map(m => m.name)
    expect(names.some(n => /^mountain_[A-C]$/.test(n)), 'no pure grey').toBe(true)
    expect(names.some(n => /_grass$/.test(n)), 'none with green').toBe(true)
    expect(names.some(n => /_grass_trees$/.test(n)), 'none with green and trees').toBe(true)
  })

  it('is a table SEPARATE from the highland features, and that is the point', () => {
    /*
     * If these ever become the same list, the distinction that fixed this bug is
     * gone: `FEATURES.highland` is fitted and off-centred to leave a green rim,
     * and `MOUNTAIN_HEXES` is planted native and centred to cover the hex.
     */
    expect(MOUNTAIN_HEXES.length).toBeGreaterThanOrEqual(6)
    for (const m of MOUNTAIN_HEXES) expect(m.name).toMatch(/^mountain_/)
    // Nothing in here may carry `big`, which is what routes a piece through the
    // shrinking path it must avoid.
    for (const m of MOUNTAIN_HEXES) {
      expect((m as { big?: boolean }).big, m.name).toBeUndefined()
    }
  })

  it('is wide enough to cover its hex at native size', () => {
    /*
     * The measurement the fix rests on, asserted against the ASSETS so a
     * re-export cannot quietly break it. The hex is 2.31 deep; a mountain is
     * ~1.88, which is the thin rim in Joe's screenshot. Fitted to FITS.big it
     * came out at 1.7 and the variation took it lower still.
     */
    const w = widthOf('props/mountain_A_grass.gltf')
    const hex = widthOf('tiles/hex_grass.gltf')
    expect(w / hex).toBeGreaterThan(0.75)
    expect(w).toBeGreaterThan(1.7)   // i.e. bigger than FITS.big would allow
  })
})

/**
 * The plot builds the mountain she picked, and keeps it.
 *
 * Joe, 28 July: *"when selecting a mountain tile, the incremental build goes back
 * to a gras tile with props on. we need to make sure the proper rock/mountain
 * tile is already set up there so it gets placed on completion."*
 *
 * TWO PLACEMENT PATHS AGAIN — `increments.ts` grows the plot, `props.ts` plants
 * the finished hex (HANDOFF §6) — and for a mountain they must agree exactly, not
 * merely look similar: she watches one particular peak rise and that is the peak
 * she must be given. So there is ONE chooser, and both callers use it.
 */
describe('the mountain on the plot is the mountain she gets', () => {
  const MAIN = resolve(here, '../../src/island/main.ts')
  const PROPS = resolve(here, '../../src/island/world/props.ts')
  const INCREMENTS = resolve(here, '../../src/island/world/increments.ts')
  const code = (p: string): string => readFileSync(p, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')

  it('names a real model, deterministically, for any hex', () => {
    const names = new Set(MOUNTAIN_HEXES.map(m => m.name))
    for (let q = -8; q <= 8; q++) {
      for (let r = -8; r <= 8; r++) {
        const a = { q, r }
        const name = mountainHexFor(a)
        expect(names.has(name), `${q},${r} -> ${name}`).toBe(true)
        // Twice the same question, twice the same answer: the island must not
        // rearrange itself between a build and its touchdown, or between loads.
        expect(mountainHexFor(a)).toBe(name)
      }
    }
  })

  it('reaches every mountain in the table, so the range is not all one peak', () => {
    const seen = new Set<string>()
    for (let q = -12; q <= 12; q++) {
      for (let r = -12; r <= 12; r++) seen.add(mountainHexFor({ q, r }))
    }
    expect(seen.size).toBe(MOUNTAIN_HEXES.length)
  })

  it('faces a hex edge, and never a negative one', () => {
    /*
     * The signed-shift trap this project has already paid for once: `hash` is
     * unsigned 32-bit and `>>` is signed, so half of all hashes went negative.
     * There it produced `forest/undefined.gltf`; here it would silently mirror
     * the facing, and the plot and the finished hex would disagree by a turn.
     */
    for (let q = -20; q <= 20; q++) {
      for (let r = -20; r <= 20; r++) {
        const spin = mountainSpinFor({ q, r })
        expect(spin).toBeGreaterThanOrEqual(0)
        expect(spin).toBeLessThan(Math.PI * 2)
        const sixths = spin / (Math.PI / 3)
        expect(Math.abs(sixths - Math.round(sixths))).toBeLessThan(1e-9)
      }
    }
  })

  it('is the SAME function on both paths, asserted in the source', () => {
    // The agreement is by construction. A second `pick` over the same table
    // would be one edit away from disagreeing, and nothing would fail.
    expect(code(PROPS)).toContain('mountainHexFor(a)')
    expect(code(PROPS)).toContain('mountainSpinFor(a)')
    expect(code(MAIN)).toContain('mountainHexFor(state.plot.at)')
    expect(code(MAIN)).toContain('mountainSpinFor(state.plot.at)')
  })

  it('the plot takes a pre-assembled feature instead of eight scattered pieces', () => {
    const src = code(INCREMENTS)
    expect(src).toContain('feature')
    // Skipping the scatter is the point: the mound covers four fifths of the hex,
    // so cover placed on it would be cover placed INSIDE it.
    expect(src).toMatch(/feature\s*\?\s*\[\]\s*:\s*piecesFor/)
  })
})
