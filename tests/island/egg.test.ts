import { describe, it, expect } from 'vitest'
import { stageFor } from '../../src/island/egg'

describe('egg stages', () => {
  it('follows the spec thresholds', () => {
    // Slice-1 spec §3: 25% / 50% / 75% / 90%
    expect(stageFor(0)).toBe('intact')
    expect(stageFor(0.24)).toBe('intact')
    expect(stageFor(0.25)).toBe('hairline')
    expect(stageFor(0.49)).toBe('hairline')
    expect(stageFor(0.5)).toBe('crack')
    expect(stageFor(0.74)).toBe('crack')
    expect(stageFor(0.75)).toBe('big')
    expect(stageFor(0.89)).toBe('big')
    expect(stageFor(0.9)).toBe('wobble')
    expect(stageFor(1)).toBe('wobble')
  })

  it('never regresses as progress climbs — cracks do not heal', () => {
    const order = ['intact', 'hairline', 'crack', 'big', 'wobble']
    let seen = 0
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const at = order.indexOf(stageFor(p))
      expect(at).toBeGreaterThanOrEqual(seen)
      seen = at
    }
  })

  it('handles a single-page egg, where one read goes straight to hatching', () => {
    // The curve makes the first egg cost 1, so its progress jumps 0 -> 1
    expect(stageFor(1)).toBe('wobble')
  })
})

describe('the shell is made of pieces (Joe’s design)', () => {
  it('is built from ten of them', async () => {
    /*
     * "The egg is always composed from say 10 cracked shell pieces moving in
     * unison so they appear as one; as the challenge progresses the edges
     * become more pronounced, looking like cracks, until the egg falls apart
     * revealing the animal."
     *
     * The old egg faked that by toggling dark slivers on a solid ovoid, which
     * reads as a prop that changes rather than a shell under strain — and it
     * could never fall apart, so hatching had to hide the egg and hope.
     */
    const { createEgg } = await import('../../src/island/egg')
    const egg = createEgg()
    let shells = 0
    egg.group.traverse(o => {
      const m = o as unknown as { isMesh?: boolean; geometry?: { type?: string } }
      if (m.isMesh && m.geometry?.type === 'SphereGeometry') shells++
    })
    // Ten pieces plus the dark inside that makes a seam read as a crack.
    expect(shells).toBe(11)
  })

  it('opens further with every page, rather than snapping between states', async () => {
    const { createEgg } = await import('../../src/island/egg')
    const egg = createEgg()
    const spread = (): number => {
      let far = 0
      egg.group.traverse(o => {
        const m = o as unknown as { isMesh?: boolean; position?: { length(): number } }
        if (m.isMesh && m.position) far = Math.max(far, m.position.length())
      })
      return far
    }
    egg.setProgress(0)
    const closed = spread()
    egg.setProgress(0.5)
    const half = spread()
    egg.setProgress(0.95)
    const nearly = spread()

    expect(half).toBeGreaterThan(closed)
    expect(nearly).toBeGreaterThan(half)
  })

  it('closes right up again when reset', async () => {
    // A fresh egg must not inherit the last one's cracks.
    const { createEgg } = await import('../../src/island/egg')
    const egg = createEgg()
    egg.setProgress(0.95)
    egg.reset()
    let scaled = true
    egg.group.traverse(o => {
      const m = o as unknown as { isMesh?: boolean; scale?: { x: number } }
      if (m.isMesh && m.scale && Math.abs(m.scale.x - 1) > 1e-6) scaled = false
    })
    expect(scaled).toBe(true)
  })
})
