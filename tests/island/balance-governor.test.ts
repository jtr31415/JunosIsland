import { describe, it, expect } from 'vitest'
import {
  balance,
  emptySteps, crowdedSteps,
  emptyPriceSteps, crowdedPriceSteps,
  graceHolds, tilesShortOfCorridor, petsShortOfCorridor,
  eggCostPast, tileCostPast,
} from '../../src/island/balance'

/*
 * PB-042. The WARNING and the PRICE used to fire at the same wall, so a child
 * was told and billed in the same instant and had no move that was merely
 * warned. Joe ruled them apart: `corridor` is where Fred speaks, `price` is
 * where the till opens, and `price` is strictly further out on both sides.
 *
 * These tests assert the CONTRACT — the band, the ordering, the scaling and the
 * exactness of the way back — rather than the four numbers, so a retune of
 * balance.json's five governor lines does not rewrite the file. The one test
 * that DOES pin numbers pins their ORDER, which is the thing a retune must not
 * break. Every sweep below is exhaustive over the island sizes a child reaches.
 */

const FIELDS = 40      // more tiles than a long save reaches
const PETS = 12        // more animals than the unlock table asks for

describe('the price wall stands outside the warn wall — PB-042', () => {
  it('is ordered: price walls outside the corridor, corridor around the target', () => {
    const { corridor, price } = balance.governor
    // Tiles per pet, ascending: crowded price < crowded warn < 2.0 target <
    // empty warn < empty price. Any retune that breaks this ordering has put
    // the bill before the warning, which is the whole of the ruling.
    expect(price.crowded).toBeLessThan(corridor.crowded)
    expect(corridor.crowded).toBeLessThan(2.0)
    expect(2.0).toBeLessThan(corridor.empty)
    expect(corridor.empty).toBeLessThan(price.empty)
  })

  it('leaves a told-but-not-charged band on the crowded side, at every size 6..12', () => {
    // Not one worked example: a band must exist at EVERY pet count out of grace.
    for (let pets = 6; pets <= PETS; pets++) {
      const band: number[] = []
      for (let fields = 0; fields <= 60; fields++) {
        if (crowdedSteps(fields, pets) > 0 && crowdedPriceSteps(fields, pets) === 0) {
          band.push(fields)
        }
      }
      expect(band.length, `no warned-but-free band at ${pets} animals`)
        .toBeGreaterThan(0)
    }
  })

  it('leaves a told-but-not-charged band on the empty side, at every size 6..12', () => {
    for (let pets = 6; pets <= PETS; pets++) {
      const band: number[] = []
      for (let fields = 0; fields <= 80; fields++) {
        if (emptySteps(fields, pets) > 0 && emptyPriceSteps(fields, pets) === 0) {
          band.push(fields)
        }
      }
      expect(band.length, `no warned-but-free band at ${pets} animals`)
        .toBeGreaterThan(0)
    }
  })

  it('never charges before it warns — every island up to 40 tiles and 12 animals', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        expect(crowdedPriceSteps(fields, pets), `${fields} tiles, ${pets} animals`)
          .toBeLessThanOrEqual(crowdedSteps(fields, pets))
        expect(emptyPriceSteps(fields, pets), `${fields} tiles, ${pets} animals`)
          .toBeLessThanOrEqual(emptySteps(fields, pets))
      }
    }
  })

  it('is silent at the price wall where the warn wall already bit — the wall she stands on', () => {
    // The measured reason for 1.2: standing exactly ON the crowded warn wall
    // leaves ZERO animals of headroom at every size, so before PB-042 the next
    // egg was always already a charged egg. It must not be any more.
    for (let pets = 6; pets <= PETS; pets++) {
      const fields = Math.ceil(pets * balance.governor.corridor.crowded)
      expect(crowdedSteps(fields, pets + 1), `${pets} animals`).toBeGreaterThan(0)
      expect(crowdedPriceSteps(fields, pets + 1), `${pets} animals`).toBe(0)
    }
  })

  it('is silent at the FIRST tile past the empty warn wall, at every size', () => {
    // And the measured reason for 4.0: `emptySteps` is already 1 one hex past
    // the wall, for every pet count. That first overshoot must now be free.
    for (let pets = 1; pets <= PETS; pets++) {
      const fields = Math.floor(balance.governor.corridor.empty * pets) + 1
      expect(emptySteps(fields, pets), `${pets} animals`).toBe(1)
      expect(emptyPriceSteps(fields, pets), `${pets} animals`).toBe(0)
    }
  })
})

describe('the buffer scales with the island', () => {
  /* The gap must not be a fixed few — a buffer that stays 2 animals wide is
   * generous on a nine-tile island and nothing on a ninety-tile one. Both
   * assertions below pin the RATE, not a single point. */

  const spareAnimals = (fields: number): number =>
    // With more animals than either wall can hold, both step counts are live
    // and their difference is exactly the buffer in animals.
    crowdedSteps(fields, 500) - crowdedPriceSteps(fields, 500)

  const spareTiles = (pets: number): number => {
    const fields = 4 * pets + 5   // past both walls, so both step counts are live
    return emptySteps(fields, pets) - emptyPriceSteps(fields, pets)
  }

  it('crowded: the spare animals never shrink as the island grows', () => {
    for (let fields = 1; fields <= 200; fields++) {
      expect(spareAnimals(fields), `${fields} tiles`)
        .toBeGreaterThanOrEqual(spareAnimals(fields - 1))
    }
  })

  it('crowded: the spare animals grow by exactly one every six tiles', () => {
    for (let fields = 0; fields <= 200; fields++) {
      expect(spareAnimals(fields + 6), `${fields} tiles`).toBe(spareAnimals(fields) + 1)
    }
    expect(spareAnimals(60)).toBe(10)
  })

  it('empty: the spare tiles are exactly one per animal, and grow with every animal', () => {
    for (let pets = 0; pets <= 60; pets++) {
      expect(spareTiles(pets), `${pets} animals`).toBe(pets)
      if (pets > 0) expect(spareTiles(pets)).toBeGreaterThan(spareTiles(pets - 1))
    }
  })
})

describe('the way back — tilesShortOfCorridor and petsShortOfCorridor', () => {
  it('names the tiles that clear the crowded warning, exactly', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        const need = tilesShortOfCorridor(fields, pets)
        expect(crowdedSteps(fields + need, pets), `${fields} tiles, ${pets} animals`).toBe(0)
      }
    }
  })

  it('is not one tile more than it has to be — one fewer still breaches', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        const need = tilesShortOfCorridor(fields, pets)
        if (need === 0) continue
        expect(crowdedSteps(fields + need - 1, pets), `${fields} tiles, ${pets} animals`)
          .toBeGreaterThan(0)
      }
    }
  })

  it('names the animals that clear the empty warning, exactly', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        const need = petsShortOfCorridor(fields, pets)
        expect(emptySteps(fields, pets + need), `${fields} tiles, ${pets} animals`).toBe(0)
      }
    }
  })

  it('is not one animal more than it has to be — one fewer still breaches', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        const need = petsShortOfCorridor(fields, pets)
        if (need === 0) continue
        expect(emptySteps(fields, pets + need - 1), `${fields} tiles, ${pets} animals`)
          .toBeGreaterThan(0)
      }
    }
  })

  it('asks for nothing at all while she is inside the corridor', () => {
    for (let fields = 0; fields <= FIELDS; fields++) {
      for (let pets = 0; pets <= PETS; pets++) {
        if (crowdedSteps(fields, pets) === 0) expect(tilesShortOfCorridor(fields, pets)).toBe(0)
        if (emptySteps(fields, pets) === 0) expect(petsShortOfCorridor(fields, pets)).toBe(0)
        // And it always asks for something when she is outside it.
        if (crowdedSteps(fields, pets) > 0) {
          expect(tilesShortOfCorridor(fields, pets)).toBeGreaterThan(0)
        }
        if (emptySteps(fields, pets) > 0) {
          expect(petsShortOfCorridor(fields, pets)).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('grace — JT-016', () => {
  it('holds at five animals and ten tiles', () => {
    expect(graceHolds(5, 10)).toBe(true)
    expect(graceHolds(0, 0)).toBe(true)
    expect(graceHolds(1, 4)).toBe(true)
  })

  it('ends when either number grows up — a sixth animal, or an eleventh tile', () => {
    expect(graceHolds(6, 10)).toBe(false)
    expect(graceHolds(5, 11)).toBe(false)
    expect(graceHolds(6, 11)).toBe(false)
  })

  it('is an AND, so a lopsided island leaves grace on the number that grew', () => {
    // Three animals on fourteen tiles is out of grace, and so is eight animals
    // on six tiles. Grace is the opening stretch, not a small-in-one-way test.
    expect(graceHolds(3, 14)).toBe(false)
    expect(graceHolds(8, 6)).toBe(false)
  })
})

describe('§19 — nothing already banked becomes unreachable', () => {
  it('can only ever make a reward cheaper than the warn wall did', () => {
    // The shipped scheme priced off `*Steps`. Every price under the new walls
    // is less than or equal to that, at every rank and every island size — so
    // no target a child was already saving toward moved further away.
    for (let n = 1; n <= 40; n++) {
      for (let fields = 0; fields <= FIELDS; fields++) {
        for (let pets = 0; pets <= PETS; pets++) {
          expect(eggCostPast(n, crowdedPriceSteps(fields, pets)))
            .toBeLessThanOrEqual(eggCostPast(n, crowdedSteps(fields, pets)))
          expect(tileCostPast(n, emptyPriceSteps(fields, pets)))
            .toBeLessThanOrEqual(tileCostPast(n, emptySteps(fields, pets)))
        }
      }
    }
  })

  it('keeps every price finite and capped at treble, however far out of balance', () => {
    const capEgg = balance.egg.cap * balance.governor.escalation.capMultiple
    const capTile = balance.tile.cap * balance.governor.escalation.capMultiple
    for (let n = 1; n <= 200; n++) {
      for (const steps of [0, 1, 5, 50, 5000]) {
        expect(eggCostPast(n, steps)).toBeLessThanOrEqual(capEgg)
        expect(tileCostPast(n, steps)).toBeLessThanOrEqual(capTile)
        expect(Number.isFinite(eggCostPast(n, steps))).toBe(true)
        expect(Number.isFinite(tileCostPast(n, steps))).toBe(true)
      }
    }
  })

  it('charges nothing in the warned band either — list price, exactly', () => {
    // 9 animals on 12 tiles is past the crowded warn wall; 20 tiles for 6
    // animals is past the empty one. Both are inside their price wall, so both
    // must cost what they have always cost, at every rank.
    expect(crowdedSteps(12, 9)).toBeGreaterThan(0)
    expect(emptySteps(20, 6)).toBeGreaterThan(0)
    for (let n = 1; n <= 40; n++) {
      expect(eggCostPast(n, crowdedPriceSteps(12, 9))).toBe(eggCostPast(n, 0))
      expect(tileCostPast(n, emptyPriceSteps(20, 6))).toBe(tileCostPast(n, 0))
    }
  })
})
