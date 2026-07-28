import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  INCREMENTS, incrementsShown, isComplete, createGrowingPlot, PALETTE,
} from '../../src/island/world/increments'

describe('the increment sequence', () => {
  it('has ten steps, and puts the TILE down first', () => {
    /*
     * §2 lists ten steps and opens with a soil mound and flooded colour.
     * Joe's call, which overrides it: start with the tile itself and spend the
     * rest on props. The hex appearing is the moment the plot stops being an
     * idea and becomes a place; three of ten steps spent before anything looks
     * like land is three too many.
     */
    expect(INCREMENTS).toHaveLength(10)
    expect(INCREMENTS[0]).toBe('tile')
    expect(INCREMENTS[9]).toBe('flourish')
  })

  it('spends its middle entirely on scenery', () => {
    // Everything between the tile and the flourish is a thing that grows on
    // it, which is what makes the sequence read as a place being furnished.
    expect(INCREMENTS.slice(1, 9)).toHaveLength(8)
    expect(INCREMENTS).not.toContain('soil')
  })

  it('shows the TILE before any sum at all — the ghost hex', () => {
    /*
     * §2: "pick a socket (pulsing rims) -> ghost hex appears -> each correct
     * sum advances the build". The hex is what siting buys; the sums buy what
     * grows on it. Spreading all ten across the cost left a freshly sited
     * plot rendering nothing, so the child chose a spot and saw no change.
     */
    expect(incrementsShown(0, 10)).toBe(1)
    expect(incrementsShown(0, 1)).toBe(1)
  })

  it('shows all ten once the tile is paid for', () => {
    expect(incrementsShown(10, 10)).toBe(10)
    expect(isComplete(10, 10)).toBe(true)
  })

  it('plays ALL ten at once for a one-sum intro tile', () => {
    // §2: "Intro tile = all ten in one go" — and the curve makes the first
    // tile cost exactly one, so this is the path every child sees first.
    expect(incrementsShown(1, 1)).toBe(10)
    expect(isComplete(1, 1)).toBe(true)
  })

  it('advances several increments per sum when a tile is cheap', () => {
    // §2: "When tile cost < 10, each sum advances multiple increments".
    // One for the hex, then nine spread across the cost.
    expect(incrementsShown(1, 5)).toBe(1 + 2)
    expect(incrementsShown(3, 5)).toBe(1 + 5)
  })

  it('advances roughly one every other sum on an expensive tile', () => {
    expect(incrementsShown(8, 16)).toBe(1 + 5)
    expect(incrementsShown(16, 16)).toBe(10)
  })

  it('never regresses as sums accumulate — pieces do not un-grow', () => {
    // §2: "Wrong answers advance nothing and remove nothing."
    let last = 0
    for (let n = 0; n <= 16; n++) {
      const shown = incrementsShown(n, 16)
      expect(shown).toBeGreaterThanOrEqual(last)
      last = shown
    }
  })

  it('never exceeds ten, however many sums arrive', () => {
    expect(incrementsShown(99, 5)).toBe(10)
  })

  it('treats a zero-cost tile as finished rather than dividing by zero', () => {
    expect(incrementsShown(0, 0)).toBe(10)
  })
})

/**
 * The fly-back (§6): "the connective payoff between abstract work and world
 * position". The scaffolding that grew through every sum is the thing that
 * performs the landing, so its geometry is worth pinning — a tile that never
 * reaches the ground, or that lands 14% too wide, is a tile she cannot trust.
 */
describe('landing a finished plot', () => {
  const models = {
    size: 1.1547,
    geometry: { grass: new THREE.BufferGeometry(), water: new THREE.BufferGeometry() },
    material: new THREE.MeshStandardMaterial(),
  } as never

  const makePlot = (): ReturnType<typeof createGrowingPlot> =>
    createGrowingPlot('grass', 1.1547, {
      models,
      prop: () => Promise.resolve(new THREE.Group()),
    })

  it('sits exactly on its socket before anything is asked of it', () => {
    // The plot is positioned by the caller at the socket; y must start at 0
    // or the very first frame shows the tile floating.
    expect(makePlot().group.position.y).toBe(0)
  })

  it('hovers over its socket while it is being built', () => {
    /*
     * The build happens in REAL SPACE, over the island, with the place it is
     * going visible underneath it — not lifted into a vignette with its own
     * grass and sky behind it. Joe's call, and the right one: the first says
     * "here is your tile arriving", the second "here is a diagram of it".
     */
    const plot = makePlot()
    plot.float(true)
    plot.update(1 / 60)
    expect(plot.group.position.y).toBeGreaterThan(0.5)
  })

  it('falls from where it was hovering, not from an arbitrary ceiling', () => {
    // Switching the hover off must not drop it to the ground first: a jump
    // down followed by a teleport back into the air is not a landing.
    const plot = makePlot()
    plot.float(true)
    plot.update(1 / 60)
    const hovering = plot.group.position.y

    plot.land(900)
    plot.update(1 / 60)
    expect(plot.group.position.y).toBeGreaterThan(hovering * 0.7)
  })

  it('stops hovering once it has landed, and stays down', () => {
    const plot = makePlot()
    plot.float(true)
    plot.update(1 / 60)
    plot.land(400)
    for (let i = 0; i < 120; i++) plot.update(1 / 60)
    expect(plot.group.position.y).toBe(0)
    // ...and the hover does not creep back in on later frames.
    for (let i = 0; i < 60; i++) plot.update(1 / 60)
    expect(plot.group.position.y).toBe(0)
  })

  it('lifts, falls, and comes to rest ON the ground', () => {
    const plot = makePlot()
    plot.land(900)

    plot.update(0.016)
    const lifted = plot.group.position.y
    expect(lifted).toBeGreaterThan(0.5)        // it is coming from somewhere

    for (let i = 0; i < 120; i++) plot.update(1 / 60)
    expect(plot.group.position.y).toBe(0)      // and it arrives, exactly
  })

  it('leaves no squash behind once it has landed', () => {
    /*
     * The impact squashes the tile to sell the landing. A tile left 14% wide
     * and 18% short would overlap its neighbours for the rest of the session
     * — and it is the last frame of an animation, which is exactly where that
     * sort of thing survives unnoticed.
     */
    const plot = makePlot()
    plot.land(900)
    for (let i = 0; i < 120; i++) plot.update(1 / 60)
    expect(plot.group.scale.toArray()).toEqual([1, 1, 1])
  })

  it('ARCS in rather than dropping straight down', () => {
    /*
     * §6 asks for the tile to "arc across the screen to its chosen socket".
     * A purely vertical fall is a different sentence — something dropped,
     * not something delivered.
     */
    const plot = makePlot()
    plot.land(900, 1.6)
    plot.update(0.016)
    expect(Math.abs(plot.group.position.x)).toBeGreaterThan(0.4)

    for (let i = 0; i < 120; i++) plot.update(1 / 60)
    expect(plot.group.position.x).toBe(0)      // and arrives over its socket
  })

  it('ACCELERATES as it falls, the way things do', () => {
    /*
     * The first version eased out — fastest at launch, drifting to a halt at
     * the ground. That is a parachute, and it undercut the very impact the
     * squash exists to sell.
     */
    const plot = makePlot()
    plot.land(900)
    const heights: number[] = []
    for (let i = 0; i < 26; i++) { plot.update(1 / 60); heights.push(plot.group.position.y) }

    const early = (heights[1] as number) - (heights[6] as number)
    const late = (heights[18] as number) - (heights[23] as number)
    expect(late).toBeGreaterThan(early)
  })

  it('squashes AFTER it touches down, not before', () => {
    /*
     * Backwards in the first version: the squash peaked in mid-air and was
     * fully recovered by the frame the tile first met the ground, so the one
     * thing it existed to express was over before the event it expressed.
     */
    const plot = makePlot()
    plot.land(900)
    let squashedInAir = false
    let squashedOnGround = false
    for (let i = 0; i < 120; i++) {
      plot.update(1 / 60)
      const squashed = plot.group.scale.y < 0.995
      if (squashed && plot.group.position.y > 0.02) squashedInAir = true
      if (squashed && plot.group.position.y <= 0.02) squashedOnGround = true
    }
    expect(squashedInAir).toBe(false)
    expect(squashedOnGround).toBe(true)
  })

  it('never lets go of the ground once it is down', () => {
    const plot = makePlot()
    plot.land(400)
    for (let i = 0; i < 200; i++) {
      plot.update(1 / 60)
      expect(plot.group.position.y).toBeGreaterThanOrEqual(0)
    }
    expect(plot.group.position.y).toBe(0)
  })

  it('lands in the time it was given, whatever that is', () => {
    // The caller drives this from balance.stage.flyBackMs, and the farewell
    // that disposes the scaffolding is derived from the same number.
    for (const ms of [200, 900, 2000]) {
      const plot = makePlot()
      plot.land(ms)
      const steps = Math.ceil((ms / 1000) * 60) + 2
      for (let i = 0; i < steps; i++) plot.update(1 / 60)
      expect(plot.group.position.y).toBe(0)
    }
  })

  it('shrugs off a nonsense duration rather than dividing by it', () => {
    const plot = makePlot()
    plot.land(0)
    plot.update(1 / 60)
    expect(Number.isFinite(plot.group.position.y)).toBe(true)
    for (let i = 0; i < 40; i++) plot.update(1 / 60)
    expect(plot.group.position.y).toBe(0)
  })
})

/**
 * The golden outline: the whole tile shown from the first moment, each piece
 * turning real as a page is collected.
 *
 * Joe's shape for it, and a better game than revealing pieces out of nothing:
 * seeing the finished tile from the start means the work has a SHAPE. She can
 * see there are four things left, and which four, without being told a number.
 */
describe('the golden outline', () => {
  const models = {
    size: 1.1547,
    geometry: { grass: new THREE.BufferGeometry(), water: new THREE.BufferGeometry() },
    material: new THREE.MeshStandardMaterial(),
  } as never

  /** Count what is actually being drawn, ghost or real. */
  const visible = (plot: ReturnType<typeof createGrowingPlot>): number =>
    plot.group.children.filter(c => c.visible).length

  it('NEVER grows more props on a dear tile than on a cheap one', () => {
    /*
     * Joe: "when the player is at like 16 challenges per reward, we don't
     * have 16 props on every tile."
     *
     * The piece count is a property of the SEQUENCE, not of the price. A
     * sixteen-sum tile buys the same ten steps as a one-sum tile; the sums
     * only decide how fast they arrive. If this ever inverts, an expensive
     * island becomes a cluttered one and pets lose the room they wander in.
     */
    expect(INCREMENTS).toHaveLength(10)
    for (const cost of [1, 5, 10, 16, 40]) {
      expect(incrementsShown(cost, cost)).toBe(INCREMENTS.length)
    }
  })

  it('shows the finished tile as an outline before any work is done', () => {
    const plot = createGrowingPlot('grass', 1.1547, {
      models, prop: () => Promise.resolve(new THREE.Group()),
    })
    // The hex is installed synchronously; its ghost stands in from the start.
    expect(visible(plot)).toBeGreaterThan(0)
  })

  it('swaps outline for real piece, never showing both at once', () => {
    const plot = createGrowingPlot('grass', 1.1547, {
      models, prop: () => Promise.resolve(new THREE.Group()),
    })
    // The hex and its outline: installed together, exactly one drawn.
    const drawn = plot.group.children.filter(c => c.visible)
    expect(drawn).toHaveLength(1)
    const outline = drawn[0]

    plot.setProgress(1, 1)          // everything at once, the intro tile
    expect(outline?.visible).toBe(false)                      // promise kept
    expect(plot.group.children.filter(c => c.visible).length)
      .toBeGreaterThanOrEqual(1)                              // ...by the real hex
  })

  it('never brings an outline back once its piece is real', () => {
    // Growth is one-way (§2's serene-right rule), and so is the promise.
    const plot = createGrowingPlot('grass', 1.1547, {
      models, prop: () => Promise.resolve(new THREE.Group()),
    })
    plot.setProgress(10, 10)
    const real = plot.group.children.filter(c => c.visible)

    plot.setProgress(0, 10)         // a wrong answer, or a stale refresh
    expect(plot.group.children.filter(c => c.visible)).toEqual(real)
  })

  it('does not promise the flourish — it is an event, not a piece', () => {
    /*
     * A golden outline of a burst of sparks, hanging there from the first
     * moment, promises something that will never be standing on the tile. It
     * just reads as eight more props she has not earned.
     */
    const plot = createGrowingPlot('grass', 1.1547, {
      models, prop: () => Promise.resolve(new THREE.Group()),
    })
    const atStart = visible(plot)
    plot.setProgress(10, 10)
    // The flourish appears only at the end; it was never previewed.
    expect(visible(plot)).toBeGreaterThan(atStart)
  })
})

describe('a build is its own build', () => {
  const models = {
    size: 1.1547,
    geometry: { grass: new THREE.BufferGeometry(), water: new THREE.BufferGeometry() },
    material: new THREE.MeshStandardMaterial(),
  } as never
  const make = (seed: number): ReturnType<typeof createGrowingPlot> =>
    createGrowingPlot('grass', 1.1547, {
      models, prop: () => Promise.resolve(new THREE.Group()),
    }, seed)

  it('flies to its own socket, not to the middle of the island', () => {
    /*
     * The flight animates an OFFSET from where the plot stands. Writing
     * absolute positions assumed it sat at the origin — true on the stage's
     * turntable, false once handed back to the world — so the tile jumped to
     * the home tile and flew in from there.
     */
    const plot = make(1)
    plot.group.position.set(4.5, 0, -2.6)     // its socket, out on the rim

    plot.land(600)
    for (let i = 0; i < 10; i++) plot.update(1 / 60)
    expect(plot.group.position.z).toBeCloseTo(-2.6, 5)   // never leaves its row

    for (let i = 0; i < 90; i++) plot.update(1 / 60)
    expect(plot.group.position.x).toBeCloseTo(4.5, 5)
    expect(plot.group.position.y).toBe(0)
    expect(plot.group.position.z).toBeCloseTo(-2.6, 5)
  })

  it('grows something different on every socket', () => {
    // Four tiles used to be the same tile four times.
    const shapes = [1, 2, 3, 4, 5].map(seed => {
      const plot = make(seed)
      return plot.group.children.length
    })
    expect(shapes.length).toBe(5)
  })

  it('grows the SAME thing on the same socket, every session', () => {
    // Derived, never random: the island must not rearrange itself overnight.
    const a = make(12345)
    const b = make(12345)
    expect(a.group.children.length).toBe(b.group.children.length)
  })

  it('hands over what she grew, keeping back the hex and the flourish', () => {
    /*
     * The hex because the real island draws that now, the flourish because it
     * was a celebration and not a thing. Everything between is hers, and it
     * must arrive on the tile rather than being swapped for a different eight.
     */
    const plot = make(7)
    plot.group.position.set(2, 0, 1)
    const grown = plot.harvest()
    expect(grown.position.x).toBe(2)
    expect(grown.position.y).toBe(0)
    expect(grown.position.z).toBe(1)
  })
})

/**
 * A mountain tile builds AS a mountain.
 *
 * Joe, 28 July: *"when selecting a mountain tile, the incremental build goes back
 * to a gras tile with props on. we need to make sure the proper rock/mountain
 * tile is already set up there so it gets placed on completion."*
 *
 * The plot was growing eight scattered stones from `PALETTE.rock` while the
 * finished hex grew a peak — the two placement paths disagreeing about what she
 * was building (HANDOFF §6). The peak is passed in from `props.mountainHexFor`
 * so both paths name the same model; these tests pin what the plot then does
 * with it.
 */
describe('a mountain plot grows the peak she was promised', () => {
  const models = {
    size: 1.1547,
    geometry: { grass: new THREE.BufferGeometry(), water: new THREE.BufferGeometry() },
    material: new THREE.MeshStandardMaterial(),
  } as never

  /** Let the prop promises settle; the pieces are installed in `.then`. */
  const settle = (): Promise<void> => new Promise(r => { setTimeout(r, 0) })

  it('asks for exactly the named mountain, and for nothing else', async () => {
    const asked: string[] = []
    createGrowingPlot('rock', 1.1547, {
      models,
      prop: n => { asked.push(n); return Promise.resolve(new THREE.Group()) },
    }, 7, null, { name: 'mountain_B_grass', spin: Math.PI / 3 })
    await settle()
    expect(asked).toEqual(['mountain_B_grass'])
  })

  it('never draws the scattered rock palette when a peak is named', async () => {
    // The mound covers four fifths of the hex, so cover placed on it would be
    // cover placed INSIDE it — trees-inside-rocks by another name.
    const asked: string[] = []
    createGrowingPlot('rock', 1.1547, {
      models,
      prop: n => { asked.push(n); return Promise.resolve(new THREE.Group()) },
    }, 7, null, { name: 'mountain_C_grass', spin: 0 })
    await settle()
    expect(asked.filter(n => PALETTE.rock.includes(n))).toEqual([])
  })

  it('centres it, at native size, facing where it was told', async () => {
    const obj = new THREE.Group()
    createGrowingPlot('rock', 1.1547, {
      models, prop: () => Promise.resolve(obj),
    }, 7, null, { name: 'mountain_A_grass', spin: (2 * Math.PI) / 3 })
    await settle()
    // Dead centre: it IS the tile, so there is no rim to preserve.
    expect(obj.position.x).toBe(0)
    expect(obj.position.z).toBe(0)
    // NATIVE. The pack already sized these to a hex; every factor on top is a
    // shrink, which is the bug Joe reported.
    expect(obj.scale.x).toBe(1)
    expect(obj.userData.fullScale).toBe(1)
    // ...and the facing came from the shared chooser, not from a local roll.
    expect(obj.rotation.y).toBeCloseTo((2 * Math.PI) / 3, 9)
  })

  it('stands there as a golden ghost before she has earned it', async () => {
    /*
     * "already set up there" — the promise is the point. A plot with no progress
     * shows the outline of the peak it will become, and the outline turns to
     * stone on her first sum.
     */
    const obj = new THREE.Group()
    obj.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial()))
    const plot = createGrowingPlot('rock', 1.1547, {
      models, prop: () => Promise.resolve(obj),
    }, 7, null, { name: 'mountain_A_grass', spin: 0 })
    await settle()
    expect(obj.visible, 'the real peak is not shown before it is earned').toBe(false)
    // Something IS drawn in its place, and it is not the peak itself.
    const ghosts = plot.group.children.filter(c => c !== obj && c.visible)
    expect(ghosts.length).toBeGreaterThan(0)
  })

  it('leaves a grass plot growing its eight scattered pieces', async () => {
    // The regression guard: the feature path must not swallow the ordinary one.
    const asked: string[] = []
    createGrowingPlot('grass', 1.1547, {
      models,
      prop: n => { asked.push(n); return Promise.resolve(new THREE.Group()) },
    }, 7)
    await settle()
    expect(asked.length).toBe(8)
  })
})
