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

/**
 * The SECOND egg, and every egg after it.
 *
 * Joe: "once the first egg has been completed, the next shows the brown
 * underlay at top and bottom and that makes for the cracking animation not
 * look good. it fixes itself on page reload, but thats hardly the fix."
 *
 * A reload rebuilding it correctly is the whole diagnosis: the shell is fine
 * as constructed and wrong as reset, so the fault is in what hatch() leaves
 * behind and reset() fails to put back — not in the geometry.
 *
 * These assert the shape of the shell itself rather than that reset() ran,
 * because "reset was called" is exactly the sort of test that passed while the
 * bug was on screen.
 */
describe('a second egg is as whole as the first', () => {
  /** Run a hatch to completion without waiting 700ms of real time. */
  async function hatchNow(egg: { hatch(): Promise<void> }): Promise<void> {
    const raf = globalThis.requestAnimationFrame
    const realNow = performance.now.bind(performance)
    let now = 0
    ;(performance as unknown as { now(): number }).now = () => now
    ;(globalThis as unknown as { requestAnimationFrame: unknown })
      .requestAnimationFrame = (cb: (t: number) => void): number => {
        now += 120
        queueMicrotask(() => cb(now))
        return 0
      }
    try { await egg.hatch() } finally {
      ;(globalThis as unknown as { requestAnimationFrame: unknown })
        .requestAnimationFrame = raf
      ;(performance as unknown as { now(): number }).now = realNow
    }
  }

  /** The ten shell patches, in build order. Excludes the dark inside. */
  function shellPieces(group: import('three').Object3D): import('three').Mesh[] {
    const out: import('three').Mesh[] = []
    group.traverse(o => {
      const m = o as unknown as { isMesh?: boolean; geometry?: { type?: string } }
      if (m.isMesh && m.geometry?.type === 'SphereGeometry') out.push(o as never)
    })
    // The inside is built first, so it is the first sphere encountered.
    return out.slice(1)
  }

  it('puts the shell back at the proportions it was built with', async () => {
    const { createEgg } = await import('../../src/island/egg')
    const THREE = await import('three')

    const fresh = createEgg()
    const asBuilt = shellPieces(fresh.group).map(m => m.scale.clone())

    const egg = createEgg()
    egg.setProgress(1)
    await hatchNow(egg)
    egg.reset()

    const after = shellPieces(egg.group).map(m => m.scale.clone())
    expect(after.length).toBe(asBuilt.length)
    after.forEach((s, i) => {
      const want = asBuilt[i] as import('three').Vector3
      /*
       * The y is the one that mattered. The shell is an OVOID: every piece is
       * built stretched in y, and hatch() shrank the pieces with a uniform
       * setScalar which threw that stretch away. reset() then restored a
       * uniform 1 — a perfect sphere, shorter than the dark inside it is
       * meant to cover, so the inside showed at top and bottom.
       */
      expect(s.x).toBeCloseTo(want.x, 6)
      expect(s.y).toBeCloseTo(want.y, 6)
      expect(s.z).toBeCloseTo(want.z, 6)
    })
    void THREE
  })

  it('covers the dark inside completely, so no brown shows at top or bottom', async () => {
    const { createEgg } = await import('../../src/island/egg')
    const THREE = await import('three')

    const egg = createEgg()
    egg.setProgress(1)
    await hatchNow(egg)
    egg.reset()
    // As the world would leave it: a brand-new egg, no progress at all.
    egg.setProgress(0)
    egg.group.updateMatrixWorld(true)

    // The dark inside, which must not be seen until a seam opens.
    let inside: import('three').Mesh | null = null
    egg.group.traverse(o => {
      const m = o as unknown as { isMesh?: boolean; geometry?: { type?: string } }
      if (!inside && m.isMesh && m.geometry?.type === 'SphereGeometry') inside = o as never
    })
    expect(inside).not.toBeNull()

    const dark = new THREE.Box3().setFromObject(inside as unknown as import('three').Object3D)
    const shell = new THREE.Box3()
    for (const p of shellPieces(egg.group)) shell.union(new THREE.Box3().setFromObject(p))

    // Top and bottom: the shell must reach at least as far as the inside does.
    expect(shell.max.y).toBeGreaterThanOrEqual(dark.max.y)
    expect(shell.min.y).toBeLessThanOrEqual(dark.min.y)
  })
})
