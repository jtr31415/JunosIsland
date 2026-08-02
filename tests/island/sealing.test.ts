/**
 * PB-052 at the SEAM: the flow-level question, and the §19 property.
 *
 * `walk.test.ts` proves the geometry (mountains are wider than their hexes) and
 * `mountains.test.ts` keeps the measured tables honest against the real `.gltf`
 * files. Neither is repeated here. This file tests the two things that only
 * exist once the geometry is wired to the rules layer:
 *
 *   1. `sealsAPet(f, a, t)` — the question `tileTypeFor` cannot ask today. Asked
 *      through a real `Flow`, on a real 31-tile island, with the real
 *      `keepOutFor` tables rather than a mesh reader.
 *   2. `sealedLand(f)` SURVIVES A SAVE. Brief §19: nothing a child owns is lost.
 *      A save written in the wild can already be sealed, so the rescue that
 *      JT-033 may one day authorise has to be able to FIND the pocket after a
 *      reload. That is a property of the save format, not of the geometry, and
 *      it is the important test in this file.
 *
 * DETECTION ONLY, still. Nothing here changes what placement accepts. Two of the
 * blocks below are deliberate records of the defect standing — they assert what
 * the code does TODAY, and each says in its own comment that it must be UPDATED
 * rather than deleted when JT-033 is ruled.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { createIsland, place, tileAt } from '../../src/island/world/grid'
import type { Island, TileType } from '../../src/island/world/grid'
import { key, distance } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
import {
  createFlow, tileTypeFor, rockUnlocked, sealsAPet, sealedLand,
  tapEgg, challengePassed,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { canBeRock } from '../../src/island/world/coast'
import {
  MOUNTAIN_KEEPOUT, NATIVE_HEX_SIZE,
} from '../../src/island/world/mountains'
import { saveIsland, loadIsland } from '../../src/island/save'
import { createLocalStore } from '../../src/platform/storage'

/* -------------------------------------------------------------- the fixture */

/** Ring of six around the origin, in the order `neighbours` returns them. */
const RING: Array<[number, number]> = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]

const ringHex = (i: number): Axial => {
  const [q, r] = RING[i] as [number, number]
  return { q, r }
}

/**
 * The island `walk.test.ts` builds for PB-052, reused verbatim.
 *
 * A grass island with a NOTCH in it: everything at two and three steps out,
 * plus the grass origin. The six hexes at one step are left as open sockets they
 * can tap, and the thirty tiles behind them are what unlocks rock.
 */
function notchedIsland(): Island {
  let island: Island = createIsland()
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      const d = distance({ q: 0, r: 0 }, { q, r })
      if (d === 2 || d === 3) island = place(island, { q, r }, 'grass')
    }
  }
  return island
}

/** A flow standing on `island`, mid-placement, the way `rock.test.ts` builds one. */
const flowOn = (island: Island, pending: Axial | null = null): Flow => ({
  ...createFlow(), island, phase: 'placing', pending, chosen: null,
})

/** The notched island with the first `n` hexes of the ring turned to rock. */
function ringRocks(n: number): Island {
  let island = notchedIsland()
  for (let k = 0; k < n; k++) island = place(island, ringHex(k), 'rock')
  return island
}

/** The widest measured pet in the pack — `flow.ts:567` quotes it as ~0.19. */
const WIDEST_PET = 0.19

/* ------------------------------------------------- 1. the trap, via the flow */

describe('sealsAPet: the six-rock trap, asked through the flow', () => {
  it('the SIXTH rock of the ring seals the middle — and the fifth does not', () => {
    const five = flowOn(ringRocks(5))
    const four = flowOn(ringRocks(4))

    // Thirty tiles behind the sockets: this is a child who really can build rock.
    expect(rockUnlocked(five)).toBe(true)

    /*
     * THE SEAL CLOSES ON THE LAST ONE. Five mountains leave one side of the
     * middle hex open, so a pet of radius zero still walks out; the sixth is the
     * tap that strands it. Asserting both directions is what makes this a test
     * of the QUESTION rather than of a coincidence — a `sealsAPet` that answered
     * true for every rock would pass the first line and fail the second.
     */
    expect(sealsAPet(five, ringHex(5), 'rock')).toBe(true)
    expect(sealsAPet(four, ringHex(4), 'rock')).toBe(false)

    // And nothing is stranded YET on either board: it is a prediction, not a
    // report of damage already done.
    expect(sealedLand(five)).toHaveLength(0)
    expect(sealedLand(four)).toHaveLength(0)
  })

  it('it is the ROCK that seals, not the tap — grass on the same socket is safe', () => {
    const five = flowOn(ringRocks(5))
    // Same hex, same island, same moment. Only the tile type differs, and a
    // grass hex grows nothing for a pet to walk round.
    expect(sealsAPet(five, ringHex(5), 'grass')).toBe(false)
    expect(sealsAPet(five, ringHex(5), 'water')).toBe(false)
  })

  it('a rock on the rim of the same island seals nothing', () => {
    // A negative control on the fixture itself: the ring is special, rock is not.
    const f = flowOn(ringRocks(5))
    expect(sealsAPet(f, { q: 4, r: 0 }, 'rock')).toBe(false)
    expect(sealsAPet(f, { q: 0, r: 4 }, 'rock')).toBe(false)
  })
})

/* --------------------------------------------- 2. the seam is inert (record) */

/*
 * A RECORD OF THE DEFECT, NOT A SPECIFICATION.
 *
 * `tileTypeFor` (flow.ts:513) carries the remedy seam in its comment and calls
 * NOTHING in it. This asserts that: the sixth rock is accepted as rock, on the
 * exact board where `sealsAPet` above says it strands a pet.
 *
 * >>> WHEN JT-033 IS RULED AND A REMEDY IS WIRED IN, THIS ASSERTION MUST BE
 * >>> UPDATED TO THE NEW BEHAVIOUR — NEVER DELETED. Under remedy (a) it becomes
 * >>> `'grass'`; under (b) the socket never glows and this test moves to the
 * >>> socket list; under (c) it stays `'rock'` and the rescue is asserted at the
 * >>> pet layer instead. It is the only place that records what the bug was.
 */
describe('PB-052 is live at the seam', () => {
  it('tileTypeFor still says rock for the hex that seals', () => {
    const island = ringRocks(5)
    const sixth = ringHex(5)
    const f: Flow = { ...flowOn(island, sixth), chosen: 'rock' as TileType }

    // The seam's own question says yes...
    expect(sealsAPet(f, sixth, 'rock')).toBe(true)
    // ...and the placement path takes the tap anyway.
    expect(canBeRock(island, sixth)).toBe(true)
    expect(tileTypeFor(f, sixth, 'rock')).toBe('rock')

    // Not downgraded, not refused: the island really does end up sealed.
    const after = flowOn(place(island, sixth, 'rock'))
    expect(sealedLand(after).map(key)).toEqual(['0,0'])
  })
})

/* ------------------------------------------- 3 & 4. the §19 save round trip */

class MemStorage implements Storage {
  private m = new Map<string, string>()
  get length(): number { return this.m.size }
  clear(): void { this.m.clear() }
  getItem(k: string): string | null { return this.m.get(k) ?? null }
  key(i: number): string | null { return [...this.m.keys()][i] ?? null }
  removeItem(k: string): void { this.m.delete(k) }
  setItem(k: string, v: string): void { this.m.set(k, v) }
  [name: string]: unknown
}

let mem: MemStorage
beforeEach(() => { mem = new MemStorage() })

/** The notched island with all six mountains up: PB-052 as they would leave it. */
const sealedFlow = (): Flow => flowOn(ringRocks(6))

describe('a sealed island survives a save — brief §19', () => {
  it('sealedLand still finds the trapped hex after a real reload', async () => {
    const before = sealedFlow()
    expect(sealedLand(before).map(key)).toEqual(['0,0'])

    /*
     * THE CLAIM: a save made in the wild is DETECTABLE AFTER A RELOAD.
     *
     * Through the real save layer, not a hand-built flow — `saveIsland`
     * (save.ts:309) writes `toSave`, whose `tiles` is the Map flattened to
     * entries (save.ts:170), and `loadIsland` rebuilds the island from it
     * (save.ts:212). Anything that dropped a tile type, re-sorted the entries or
     * rounded a coordinate on the way through would break the geometry the query
     * depends on, and this is the only test that would notice.
     *
     * It matters because remedy (c) on JT-033 — rescue the pet — is the ONLY one
     * of the three that can repair an island that is ALREADY sealed, and it can
     * only run against a save it can still read the pocket out of.
     */
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', before, true)
    const { flow: restored } = await loadIsland(store, 'p1')

    expect(sealedLand(restored).map(key)).toEqual(['0,0'])
    // ...and for a real animal, which is only more stranded.
    expect(sealedLand(restored, WIDEST_PET).map(key)).toContain('0,0')

    // The seal is a fact about the RESTORED tiles, not a leftover reference:
    // the two islands are different objects saying the same thing.
    expect(restored.island).not.toBe(before.island)
    expect(tileAt(restored.island, { q: 1, r: 0 })).toBe('rock')
    expect(tileAt(restored.island, { q: 0, r: 0 })).toBe('grass')
  })

  it('tile-map INSERTION ORDER survives the round trip', async () => {
    /*
     * Not a detail. `bareRockHexes` (mountains.ts:242) walks `island.tiles` in
     * insertion order and lets whichever mountain comes FIRST win the overlap,
     * and `props.ts` dresses the whole island in that same order. So the order of
     * the Map is load-bearing state: reorder it across a save and the child comes
     * back to a differently dressed island, with a different rock hex left bare.
     *
     * `toSave` writes `[...tiles.entries()]` and `fromSave` does `new Map(...)`,
     * both of which are order-preserving — this test PINS that rather than
     * discovering it.
     */
    const before = sealedFlow()
    const store = createLocalStore(mem)
    await saveIsland(store, 'p1', before, true)
    const { flow: restored } = await loadIsland(store, 'p1')

    expect([...restored.island.tiles.keys()]).toEqual([...before.island.tiles.keys()])
    expect([...restored.island.tiles.entries()]).toEqual([...before.island.tiles.entries()])
    // The origin is still first, which is what makes `firstFreeSpot` below a
    // hazard rather than a curiosity.
    expect([...restored.island.tiles.keys()][0]).toBe('0,0')
  })
})

/* ------------------------------------------- 5. the negative control */

describe('sealedLand is empty for an ordinary played island', () => {
  it('twenty-odd tiles of grass and water, with rocks scattered apart', () => {
    /*
     * A plausible island a child would actually have: a solid field, a bay of
     * water down one side, and two mountains that are nowhere near each other.
     * If `sealedLand` reported anything here the query would be worthless — every
     * assertion in this file would pass for the wrong reason.
     */
    let island: Island = createIsland()
    for (let q = -2; q <= 2; q++) {
      for (let r = -2; r <= 2; r++) {
        if (distance({ q: 0, r: 0 }, { q, r }) > 2) continue
        island = place(island, { q, r }, 'grass')
      }
    }
    // A little coastline.
    for (const a of [{ q: 3, r: -1 }, { q: 3, r: -2 }, { q: 2, r: 1 }] as Axial[]) {
      island = place(island, a, 'water')
    }
    // Two mountains, four steps apart — no pair of them can pinch anything.
    island = place(island, { q: -2, r: 0 }, 'rock')
    island = place(island, { q: 2, r: -2 }, 'rock')
    // ...and a couple more tiles, so this is comfortably a played island.
    island = place(island, { q: -3, r: 1 }, 'grass')
    island = place(island, { q: 0, r: 3 }, 'grass')

    expect(island.tiles.size).toBeGreaterThanOrEqual(20)
    const f = flowOn(island)

    expect(sealedLand(f)).toEqual([])
    // True for the widest animal in the pack as well, which is the form the
    // product actually cares about.
    expect(sealedLand(f, WIDEST_PET)).toEqual([])
  })
})

/* ------------------------------------------- 6. what the pet radius buys */

describe('the pet radius widens the net — or, here, provably cannot', () => {
  /**
   * NO SUCH CONFIGURATION EXISTS, and the geometry says so outright.
   *
   * The brief asked for a board where a point-sized pet escapes but a real one
   * (radius 0.19) does not. There is none, and it is not a limit of the search:
   * `walk.ts` only ever compares `gapBetween` against `2 * petRadius`, and on an
   * island made of grass, water and mountains there are exactly three kinds of
   * side —
   *
   *   mountain | mountain :  2.0000 - 2*[1.0269..1.0625]  =  -0.054 .. -0.125
   *   mountain | open     :  2.0000 -   [1.0269..1.0625]  =   0.937 ..  0.973
   *   open     | open     :  2.0000                       =   2.000
   *
   * — and the widest pet needs 0.38. Every side is therefore either ALREADY shut
   * at radius zero or wider than any pet in the pack, so no radius between 0 and
   * 0.19 can change a single link in the corner graph. The band a pet radius
   * could act in is empty by construction.
   */
  it('there is no gap a real pet fails and a point-sized pet passes', () => {
    const SPACING = Math.sqrt(3) * NATIVE_HEX_SIZE
    const radii = Object.values(MOUNTAIN_KEEPOUT)
    const widest = Math.max(...radii)
    const narrowest = Math.min(...radii)
    expect(SPACING).toBeCloseTo(2.0, 3)

    // Two mountains never leave a gap at all: shut for everyone, including 0.
    expect(SPACING - 2 * narrowest).toBeLessThan(0)
    // One mountain always leaves more than the widest pet needs.
    expect(SPACING - widest).toBeGreaterThan(2 * WIDEST_PET)
    // Which is the statement above, said once: the actionable band is empty.
    expect(2 * WIDEST_PET).toBeLessThan(SPACING - widest)
  })

  it('a search over every ring configuration finds no radius-sensitive tap', () => {
    /*
     * The argument above, checked by exhaustion rather than believed. All 64
     * subsets of the six ring sockets, and for each, every socket still open as
     * the candidate tap: 0 and 0.19 agree on all of them. If a future prop ever
     * lands in the empty band, this is the test that turns red first.
     */
    let compared = 0
    let disagreed = 0
    let sealing = 0
    for (let mask = 0; mask < 64; mask++) {
      let island = notchedIsland()
      for (let k = 0; k < 6; k++) if (mask & (1 << k)) island = place(island, ringHex(k), 'rock')
      const f = flowOn(island)
      for (let k = 0; k < 6; k++) {
        if (mask & (1 << k)) continue
        const a = ringHex(k)
        compared++
        const point = sealsAPet(f, a, 'rock', 0)
        if (point) sealing++
        if (point !== sealsAPet(f, a, 'rock', WIDEST_PET)) disagreed++
      }
    }
    expect(compared).toBeGreaterThan(100)      // the search covered real ground
    /*
     * AND IT SAW BOTH ANSWERS. "The two radii agree everywhere" is trivially
     * true of a `sealsAPet` that always says no, so the search must be shown to
     * have found seals for the agreement to mean anything. Exactly the six
     * five-rock boards seal, one per socket left open.
     */
    expect(sealing).toBe(6)
    expect(disagreed).toBe(0)
  })

  it('MONOTONICITY, the weaker property that does hold: a fatter pet is never freer', () => {
    /*
     * The fallback the brief named. Wherever a point-sized pet is sealed in, the
     * widest pet is too — a bigger animal can never walk through a gap a smaller
     * one could not. Sampled over every hex of the notched island at each stage
     * of the ring going up, so it covers boards that seal and boards that do not.
     */
    let witnessed = 0
    for (let n = 0; n <= 5; n++) {
      const f = flowOn(ringRocks(n))
      for (let q = -4; q <= 4; q++) {
        for (let r = -4; r <= 4; r++) {
          const a = { q, r }
          if (distance({ q: 0, r: 0 }, a) > 4) continue
          if (!sealsAPet(f, a, 'rock', 0)) continue
          witnessed++
          expect(sealsAPet(f, a, 'rock', WIDEST_PET)).toBe(true)
        }
      }
      // ...and the same for land already standing.
      for (const a of sealedLand(f, 0)) {
        expect(sealedLand(f, WIDEST_PET).map(key)).toContain(key(a))
      }
    }
    // "P implies Q" is free where P never holds. The five-rock board supplies
    // the antecedent, so the implication above is actually exercised.
    expect(witnessed).toBeGreaterThan(0)
    // 30s because this is a genuine exhaustive search — 64 socket subsets by
    // every still-open socket, against the REAL placement code and the REAL
    // mountain glTFs, which is the whole point of it. It measured 9.2s alone
    // and more under a full concurrent suite, so the 5s default was never
    // going to hold. Do not make it cheaper by sampling: the exhaustion IS
    // the assertion, and this is the test that turns red first if a future
    // prop ever lands in the empty band.
  }, 30_000)
})

/* ------------------------------------------- 7. hatching into the pocket */

/*
 * A RECORD OF A LIVE HAZARD, NOT A SPECIFICATION.
 *
 * `firstFreeSpot` (flow.ts:793) picks the first tile key that no other pet's
 * RECORDED hatch hex sits on. It checks no tile type, nothing standing on the
 * hex, and NO REACHABILITY — so a new pet can be hatched straight into a pocket
 * that is already sealed, and this drives it through the public hatch path to
 * prove it rather than asserting it about a private function.
 *
 * The fix is one condition on that loop — skip a key that `sealedLand(f)`
 * reports — and it is deliberately NOT applied, because where an animal appears
 * is something a child sees and JT-033 is open.
 *
 * >>> UPDATE THIS TEST, DO NOT DELETE IT, when the ruling lands.
 */
describe('PB-052 hazard: a new pet can hatch inside a sealed pocket', () => {
  it('hatches an animal onto a hex sealedLand names', () => {
    let f: Flow = { ...sealedFlow(), phase: 'free', pending: null }

    // The pocket is already shut before any animal exists.
    expect(sealedLand(f).map(key)).toEqual(['0,0'])
    expect(f.pets).toHaveLength(0)
    // And the sealed hex is the FIRST key in the map, which is what
    // `firstFreeSpot` will hand back.
    expect([...f.island.tiles.keys()][0]).toBe('0,0')

    // The public path: read pages until an egg hatches. Nothing here reaches
    // into `firstFreeSpot` — it is the ordinary way a pet arrives.
    let guard = 0
    while (f.pets.length === 0 && guard++ < 64) {
      f = challengePassed(tapEgg({ ...f, phase: 'free' }), { name: 'Bimo', species: 'animal-fox' })
    }
    expect(f.pets).toHaveLength(1)

    const pet = f.pets[0]!
    const trapped = sealedLand(f).map(key)
    // IT IS IN THE POCKET. Hatched by the game, onto land it cannot leave.
    expect(trapped).toContain(key(pet.at))
    expect(key(pet.at)).toBe('0,0')
    // And no wider a pet than a fox helps: the pocket is shut for it too.
    expect(sealedLand(f, WIDEST_PET).map(key)).toContain(key(pet.at))
  })
})
