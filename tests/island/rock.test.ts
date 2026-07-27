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
import { existsSync } from 'node:fs'
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
import { balance } from '../../src/island/balance'

const here = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(here, '../../src/island/public')

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

  it('counts as somewhere a pet can live', () => {
    /*
     * The governors measure habitable land against pets. Counting rock out
     * would make a mountain range read as no room at all, and set Fred asking
     * her to read on an island with space to spare.
     */
    const f = { ...createFlow(), island: sketch('grass', { 0: 'rock', 1: 'rock' }) }
    expect(spaceSurplus(f)).toBe(3)          // three tiles of land, no pets yet
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
