/**
 * `species/moves.ts`: the table that replaced `pets.ts`'s `FLYERS`.
 *
 * These are pure-function tests against the table and its predicates — the
 * behavioural side (does a real field HOVER a flyer and BOB everyone else)
 * lives in `pets.test.ts`'s "who flies" describe, driven through the real
 * `createPetField`. Both matter: this file pins the data and the rules read
 * off it; that one pins that `pets.ts` actually asks this module the
 * question, rather than the two files quietly drifting apart.
 */
import { describe, it, expect, afterEach } from 'vitest'
import {
  LOCOMOTIONS, LOCOMOTION_LABELS, MOVES, DEFAULT_LOCOMOTION,
  isLocomotion, movesFor, flies, mayEnterWater, mustStayInWater,
} from '../../src/island/species/moves'
import type { Locomotion } from '../../src/island/species/moves'

describe('movesFor', () => {
  it('defaults to land for an id nobody has ruled on', () => {
    expect(movesFor('animal-nobody-has-ruled-on-this-one')).toBe('land')
    expect(movesFor('animal-nobody-has-ruled-on-this-one')).toBe(DEFAULT_LOCOMOTION)
  })
})

describe('flies', () => {
  it('is true for exactly the bee and the parrot', () => {
    expect(flies('animal-bee')).toBe(true)
    expect(flies('animal-parrot')).toBe(true)
  })

  it('is false for a land species', () => {
    expect(flies('animal-cow')).toBe(false)
  })
})

/*
 * `mustStayInWater` and `mayEnterWater` both read `movesFor`, and no real
 * species is marked `water` or `amphibian` yet — that is Joe's to rule on in
 * the workbench, per `moves.ts`'s own header, and seeding a guess here would
 * be exactly the thing that file exists to stop. `MOVES` is typed `Readonly`
 * for CALLERS, not `Object.freeze`d, so a short-lived fixture id is written
 * into the real table for the length of one test and removed in `afterEach`
 * — never left behind for another file to trip over.
 */
describe('mayEnterWater and mustStayInWater', () => {
  const table = MOVES as Record<string, Locomotion>
  const WATER_FIXTURE = '__test-fixture-water__'
  const AMPHIBIAN_FIXTURE = '__test-fixture-amphibian__'

  afterEach(() => {
    delete table[WATER_FIXTURE]
    delete table[AMPHIBIAN_FIXTURE]
  })

  it('mayEnterWater is true for air, water and amphibian', () => {
    table[WATER_FIXTURE] = 'water'
    table[AMPHIBIAN_FIXTURE] = 'amphibian'
    expect(mayEnterWater('animal-bee')).toBe(true)          // air
    expect(mayEnterWater(WATER_FIXTURE)).toBe(true)
    expect(mayEnterWater(AMPHIBIAN_FIXTURE)).toBe(true)
  })

  it('mayEnterWater is false for a land species', () => {
    expect(mayEnterWater('animal-cow')).toBe(false)
  })

  it('mustStayInWater is true for water and false for an amphibian', () => {
    table[WATER_FIXTURE] = 'water'
    table[AMPHIBIAN_FIXTURE] = 'amphibian'
    expect(mustStayInWater(WATER_FIXTURE)).toBe(true)
    expect(mustStayInWater(AMPHIBIAN_FIXTURE)).toBe(false)
  })
})

describe('isLocomotion', () => {
  it('accepts every real value', () => {
    for (const l of LOCOMOTIONS) expect(isLocomotion(l)).toBe(true)
  })

  it('rejects rubbish', () => {
    expect(isLocomotion('flying')).toBe(false)
    expect(isLocomotion('')).toBe(false)
    expect(isLocomotion('LAND')).toBe(false)
    expect(isLocomotion(42)).toBe(false)
    expect(isLocomotion(null)).toBe(false)
    expect(isLocomotion(undefined)).toBe(false)
    expect(isLocomotion({})).toBe(false)
  })
})

describe('LOCOMOTION_LABELS', () => {
  it('has a non-empty entry for every member of LOCOMOTIONS', () => {
    for (const l of LOCOMOTIONS) {
      expect(typeof LOCOMOTION_LABELS[l]).toBe('string')
      expect(LOCOMOTION_LABELS[l].length).toBeGreaterThan(0)
    }
  })
})

describe('the migration guard', () => {
  it('fails loudly if animal-bee or animal-parrot ever stops flying', () => {
    /*
     * The regression this whole card must not ship: `FLYERS` is gone, and if
     * the table that replaced it ever loses these two entries — or `flies`
     * stops reading it correctly — a bee grounds itself and nobody notices
     * until a six-year-old does.
     */
    expect(flies('animal-bee')).toBe(true)
    expect(flies('animal-parrot')).toBe(true)
    expect([...LOCOMOTIONS]).toContain(MOVES['animal-bee'])
  })
})
