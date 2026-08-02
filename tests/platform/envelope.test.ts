import { describe, it, expect } from 'vitest'
import {
  canonical, checksum, seal, intact, isEnvelope, migrate, migrate_v1_v2,
  SCHEMA_VERSION,
} from '../../src/platform/envelope'
import type { Envelope, Migration } from '../../src/platform/envelope'

describe('canonical', () => {
  it('does not care what order the keys were written in', () => {
    /*
     * The whole reason it exists. A checksum over JSON.stringify is a checksum
     * over key INSERTION order, so moving a field in an interface would make
     * every existing save report itself corrupt on the next load.
     */
    expect(canonical({ a: 1, b: 2 })).toBe(canonical({ b: 2, a: 1 }))
  })

  it('sorts at every depth, not just the top', () => {
    expect(canonical({ x: { p: 1, q: 2 } })).toBe(canonical({ x: { q: 2, p: 1 } }))
  })

  it('keeps array order, because array order is data', () => {
    // [grass, water] is not [water, grass]. Sorting these would be a bug that
    // rearranged the child's island.
    expect(canonical(['grass', 'water'])).not.toBe(canonical(['water', 'grass']))
  })

  it('drops undefined rather than emitting a hole', () => {
    expect(canonical({ a: 1, b: undefined })).toBe(canonical({ a: 1 }))
  })

  it('handles the awkward scalars', () => {
    expect(canonical(null)).toBe('null')
    expect(canonical(0)).toBe('0')
    expect(canonical(false)).toBe('false')
    expect(canonical('')).toBe('""')
  })

  it('survives a whole island-shaped payload', () => {
    const island = {
      tiles: [['0,0', 'grass'], ['1,0', 'water']],
      pets: [{ id: 'p1', species: 'animal-fox', name: 'Bimo', at: { q: 0, r: 0 } }],
      bankedTiles: 0, openingSeen: true, childName: 'Juno',
    }
    expect(() => canonical(island)).not.toThrow()
    expect(canonical(island)).toBe(canonical(JSON.parse(JSON.stringify(island))))
  })
})

describe('checksum', () => {
  it('is stable for the same text', () => {
    expect(checksum('Bimo')).toBe(checksum('Bimo'))
  })

  it('changes when the text changes', () => {
    expect(checksum('Bimo')).not.toBe(checksum('Bimp'))
  })

  it('notices a truncated string — the failure it exists for', () => {
    const full = canonical({ tiles: ['0,0', '1,0', '2,0'], pets: ['a', 'b'] })
    expect(checksum(full.slice(0, -12))).not.toBe(checksum(full))
  })

  it('is always eight hex digits', () => {
    for (const s of ['', 'a', 'Juno', '{"tiles":[]}', 'éè']) {
      expect(checksum(s)).toMatch(/^[0-9a-f]{8}$/)
    }
  })

  it('stays inside 32 bits for a long payload', () => {
    // The multiply-by-shifts form exists because a plain multiply overflows
    // into a double and silently stops being FNV.
    const long = 'x'.repeat(50_000)
    expect(checksum(long)).toMatch(/^[0-9a-f]{8}$/)
  })
})

describe('seal and intact', () => {
  const payload = { tiles: [['0,0', 'grass']], pets: [], bankedTiles: 2 }

  it('seals a payload that verifies', () => {
    expect(intact(seal(payload, 1, 1000))).toBe(true)
  })

  it('records the version, revision and time it was given', () => {
    const env = seal(payload, 7, 12345)
    expect(env.schemaVersion).toBe(SCHEMA_VERSION)
    expect(env.rev).toBe(7)
    expect(env.updatedAt).toBe(12345)
    expect(env.data).toEqual(payload)
  })

  it('catches a payload edited underneath the checksum', () => {
    const env = seal(payload, 1, 1000) as Envelope<typeof payload>
    env.data.bankedTiles = 99
    expect(intact(env)).toBe(false)
  })

  it('does not care that the keys came back in a different order', () => {
    // A save round-tripped through storage may deserialise its keys in any
    // order. That must not read as corruption.
    const env = seal({ a: 1, b: 2 }, 1, 1000)
    const reordered = { ...env, data: { b: 2, a: 1 } }
    expect(intact(reordered)).toBe(true)
  })
})

describe('isEnvelope', () => {
  it('accepts a real one', () => {
    expect(isEnvelope(seal({ x: 1 }, 1, 0))).toBe(true)
  })

  it('rejects the things that actually turn up on disk', () => {
    // Untrusted input: hand-edited, half written, or from a build that no
    // longer exists. None of these is an error to report to a child — each is
    // a reason to reach for the snapshot ring.
    expect(isEnvelope(null)).toBe(false)
    expect(isEnvelope('{"rev":1}')).toBe(false)
    expect(isEnvelope({})).toBe(false)
    expect(isEnvelope({ schemaVersion: 1, rev: 1, checksum: 'abc' })).toBe(false)
    expect(isEnvelope({ schemaVersion: '1', rev: 1, checksum: 'a', updatedAt: 0, data: {} }))
      .toBe(false)
  })

  it('accepts an envelope whose data is legitimately null', () => {
    expect(isEnvelope({ schemaVersion: 1, rev: 1, checksum: 'a', updatedAt: 0, data: null }))
      .toBe(true)
  })
})

describe('migrations', () => {
  it('v1 to v2 makes the optional progress fields explicit', () => {
    const v1 = { tiles: [], pets: [], bankedTiles: 0, openingSeen: true }
    const v2 = migrate_v1_v2(v1)
    expect(v2.readProgress).toBe(0)
    expect(v2.sumProgress).toBe(0)
    expect(v2.persistGranted).toBeNull()
  })

  it('v1 to v2 keeps progress they had actually made', () => {
    // The point of the whole exercise: a migration that zeroes real work is
    // worse than no migration at all.
    const v2 = migrate_v1_v2({ readProgress: 3, sumProgress: 5, bankedTiles: 1 })
    expect(v2.readProgress).toBe(3)
    expect(v2.sumProgress).toBe(5)
    expect(v2.bankedTiles).toBe(1)
  })

  it('v1 to v2 leaves tilesEarned alone', () => {
    /*
     * Deliberately NOT defaulted here. A save written before the field existed
     * must fall back to the island's own size, or the cost curve resets and a
     * twelve-tile island prices its next tile at a single sum. That rule lives
     * in fromSave; a migration that disagreed with the loader would be worse
     * than none.
     */
    expect('tilesEarned' in migrate_v1_v2({ tiles: [] })).toBe(false)
  })

  it('walks a payload up to the current version', () => {
    const out = migrate({ bankedTiles: 4 }, 1)
    expect(out).not.toBeNull()
    expect(out?.persistGranted).toBeNull()
    expect(out?.bankedTiles).toBe(4)
  })

  it('is a no-op when the save is already current', () => {
    const data = { bankedTiles: 4, persistGranted: true }
    expect(migrate(data, SCHEMA_VERSION)).toEqual(data)
  })

  it('chains rather than special-cases — proved with a synthetic ladder', () => {
    /*
     * There is only one real migration so far, so this proves the FRAMEWORK
     * with fake ones. Adding v3 must mean writing one function, never
     * revisiting v1.
     */
    const steps: Record<number, Migration> = {
      1: d => ({ ...d, one: true }),
      2: d => ({ ...d, two: true }),
      3: d => ({ ...d, three: true }),
    }
    expect(migrate({}, 1, 4, steps)).toEqual({ one: true, two: true, three: true })
    expect(migrate({}, 2, 4, steps)).toEqual({ two: true, three: true })
  })

  it('refuses a save from the future rather than guessing', () => {
    // Down-migrating means inventing fields we have never heard of. Null sends
    // the caller to the snapshot ring instead of overwriting a good save.
    expect(migrate({ x: 1 }, SCHEMA_VERSION + 1)).toBeNull()
  })

  it('refuses when a step in the ladder is missing', () => {
    const gappy: Record<number, Migration> = { 1: d => d }
    expect(migrate({}, 1, 4, gappy)).toBeNull()
  })

  it('does not mutate the payload it was handed', () => {
    const original = { bankedTiles: 2 }
    migrate(original, 1)
    expect(original).toEqual({ bankedTiles: 2 })
  })
})
