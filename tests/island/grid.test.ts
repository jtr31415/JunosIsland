import { describe, it, expect } from 'vitest'
import { createIsland, place, sockets, has, count, tileAt } from '../../src/island/world/grid'
import { key } from '../../src/island/world/hex'

describe('island grid', () => {
  it("starts as Fred's one lonely rock", () => {
    // Brief section 3: the opening is one hex in a calm sea
    const i = createIsland()
    expect(count(i)).toBe(1)
    expect(has(i, { q: 0, r: 0 })).toBe(true)
  })

  it('offers exactly six sockets around a single tile', () => {
    expect(sockets(createIsland())).toHaveLength(6)
  })

  it('never offers a socket where a tile already is', () => {
    let i = createIsland()
    i = place(i, { q: 1, r: 0 }, 'grass')
    const s = sockets(i).map(key)
    expect(s).not.toContain(key({ q: 0, r: 0 }))
    expect(s).not.toContain(key({ q: 1, r: 0 }))
  })

  it('grows the socket ring as the island grows', () => {
    let i = createIsland()
    const before = sockets(i).length
    i = place(i, { q: 1, r: 0 }, 'grass')
    expect(sockets(i).length).toBeGreaterThan(before)
    expect(count(i)).toBe(2)
  })

  it('every socket touches the island — you cannot build in open sea', () => {
    let i = createIsland()
    i = place(i, { q: 1, r: 0 }, 'grass')
    i = place(i, { q: 2, r: 0 }, 'water')
    const owned = new Set([...i.tiles.keys()])
    for (const s of sockets(i)) {
      const touches = [...owned].some(k => {
        const parts = k.split(',').map(Number)
        const q = parts[0] as number, r = parts[1] as number
        return Math.abs(q - s.q) <= 1 && Math.abs(r - s.r) <= 1
      })
      expect(touches).toBe(true)
    }
  })

  it('placing is immutable — the previous island is unchanged', () => {
    // The flow machine keeps history; mutation would corrupt it.
    const a = createIsland()
    const b = place(a, { q: 1, r: 0 }, 'water')
    expect(count(a)).toBe(1)
    expect(count(b)).toBe(2)
  })

  it('remembers each tile type', () => {
    const i = place(createIsland(), { q: 1, r: 0 }, 'water')
    expect(tileAt(i, { q: 1, r: 0 })).toBe('water')
    expect(tileAt(i, { q: 0, r: 0 })).toBe('grass')
    expect(tileAt(i, { q: 9, r: 9 })).toBeUndefined()
  })

  it('sockets are unique — a coord adjacent to two tiles appears once', () => {
    let i = createIsland()
    i = place(i, { q: 1, r: 0 }, 'grass')
    const s = sockets(i).map(key)
    expect(new Set(s).size).toBe(s.length)
  })

  it('placing on an occupied coord replaces nothing and never loses a tile', () => {
    // Nothing a child owns can be lost (brief section 18)
    let i = createIsland()
    i = place(i, { q: 1, r: 0 }, 'grass')
    const before = count(i)
    i = place(i, { q: 1, r: 0 }, 'water')
    expect(count(i)).toBe(before)
    expect(tileAt(i, { q: 1, r: 0 })).toBe('grass')
  })

  it('an island of twenty tiles still reports a coherent socket ring', () => {
    let i = createIsland()
    let placed = 0
    while (placed < 19) {
      const s = sockets(i)
      i = place(i, s[0]!, placed % 3 === 0 ? 'water' : 'grass')
      placed++
    }
    expect(count(i)).toBe(20)
    expect(sockets(i).length).toBeGreaterThan(0)
    for (const s of sockets(i)) expect(has(i, s)).toBe(false)
  })
})
