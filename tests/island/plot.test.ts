/**
 * The plot on the island is the plot the flow describes.
 *
 * Joe, 28 July: *"when user selects a mountain tile to be completed, the
 * incremental build at the side shows a propped grass tile, not a mountain tile.
 * then the grass tile is placed on the island and only on reloading the page does
 * it change to a mountain."*
 *
 * BOTH HALVES OF THAT ARE ONE FAULT, and it is not in `createGrowingPlot` — that
 * builds a mountain correctly when it is told to (`increments.test.ts`). It is in
 * the glue: the plot was only ever built ONCE, when nothing was standing, so
 * changing her mind about what is being built here left the old scaffolding on
 * screen. She then finished a grass plot, `props.adopt` gave the finished hex
 * exactly what the scaffolding had grown — and marked it dressed, so `props.sync`
 * never planted the peak. The save recorded 'rock' all along, which is why a
 * reload put the mountain there.
 *
 * So the rule this file pins is the general one rather than the mountain: what is
 * on screen must track what the flow says is being built. `plotHost` compares the
 * two on every refresh, and a difference means the scaffolding is rebuilt.
 *
 * Driven through the REAL tap path — askForLand, tileOffer, chooseTile,
 * askToRetype — because a test that constructs the flow by hand tests the
 * comparison and not the promise (HANDOFF §6, "test the coastline by BUILDING
 * islands").
 */
import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'
import { createPlotHost } from '../../src/island/plot'
import type { PlotPorts } from '../../src/island/plot'
import {
  createFlow, askForLand, chooseTile, askToRetype, tileOffer, tapSum, challengePassed,
  sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { place } from '../../src/island/world/grid'
import { mountainHexFor } from '../../src/island/world/props'
import { PALETTE } from '../../src/island/world/increments'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const models = {
  size: 1.1547,
  geometry: { grass: new THREE.BufferGeometry(), water: new THREE.BufferGeometry() },
  material: new THREE.MeshStandardMaterial(),
} as never

/** Let the prop promises settle; every piece is installed in a `.then`. */
const settle = (): Promise<void> => new Promise(r => { setTimeout(r, 0) })

interface Rig {
  ports: PlotPorts
  asked: string[]
  scene: THREE.Group
  unstaged: THREE.Object3D[]
  pickable: Array<THREE.Object3D | null>
  /** Every piece the host has actually been handed, in order. */
  made: THREE.Object3D[]
  /** The one object every prop request resolves to, so it can be inspected. */
  piece: THREE.Object3D
}

function rig(): Rig {
  const asked: string[] = []
  const scene = new THREE.Group()
  const unstaged: THREE.Object3D[] = []
  const pickable: Array<THREE.Object3D | null> = []
  const piece = new THREE.Group()
  piece.add(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial()))
  const made: THREE.Object3D[] = []
  return {
    asked, scene, unstaged, pickable, piece, made,
    ports: {
      models,
      scene,
      worldOf: a => new THREE.Vector3(a.q, 0, a.r),
      prop: n => {
        asked.push(n)
        const o = piece.clone(true)
        made.push(o)
        return Promise.resolve(o)
      },
      setPickable: g => { pickable.push(g) },
      unstage: g => { unstaged.push(g) },
      farewellMs: 40,
    },
  }
}

/**
 * A grass plot standing at (1,0) on an island where mountains are unlocked.
 *
 * Fifteen of her own tiles, because that is the rung `rockUnlocked` reads — the
 * offer has to really contain the mountain button for the sequence below to be
 * the one a child can actually perform.
 */
function sitedGrass(tilesEarned = 8): Flow {
  let island = createFlow().island
  for (let q = 2; q <= 16; q++) island = place(island, { q, r: 0 }, 'grass')
  /*
   * SIX FRIENDS ON SIXTEEN FIELDS, which is inside the balance corridor (JT-012).
   * Without them the fixture is sixteen bare fields with nobody on it — as far
   * out of balance as the island gets — and the tile carries the full treble
   * surcharge, so a single sum no longer reaches the second increment. This file
   * is about the scaffolding, not the economy, so it buys at the list price.
   */
  const pets = Array.from({ length: 6 }, (_, i) => ({
    id: 'p' + i, name: 'P' + i, species: 'animal-fox', at: { q: 0, r: 0 },
  }))
  const f: Flow = { ...createFlow(), island, phase: 'free', tilesEarned, pets }
  const asked = askForLand(f, { q: 1, r: 0 })
  expect(tileOffer(asked)).toContain('rock')
  return chooseTile(asked, 'grass')
}

describe('the scaffolding follows the flow, not the first thing she picked', () => {
  it('builds the mountain when she changes her mind to one', async () => {
    const r = rig()
    const host = createPlotHost(r.ports)

    let f = sitedGrass()
    expect(f.plot).toEqual({ at: { q: 1, r: 0 }, type: 'grass' })
    host.show(f)
    await settle()
    /*
     * The grass plot she started: scattered cover, no peak. Up to eight pieces
     * and sometimes fewer — `layOut` drops one that cannot stand clear of its
     * neighbours, which is deliberate (a bare patch beats a tree inside a rock).
     */
    expect(r.asked.length).toBeGreaterThan(4)
    expect(r.asked.every(n => PALETTE.grass.includes(n))).toBe(true)

    r.asked.length = 0
    f = chooseTile(askToRetype(f), 'rock')
    expect(f.plot?.type, 'the flow itself must agree, or this tests nothing').toBe('rock')

    host.show(f)
    await settle()
    /*
     * The peak `props.ts` will plant at touchdown, and nothing else — the same
     * two-paths-agree rule the first fix established, now holding across a change
     * of mind as well as across a first choice.
     */
    expect(r.asked).toEqual([mountainHexFor({ q: 1, r: 0 })])
    expect(r.asked.filter(n => PALETTE.rock.includes(n))).toEqual([])
  })

  it('leaves the old scaffolding nowhere — one plot in the scene, not two', async () => {
    const r = rig()
    const host = createPlotHost(r.ports)
    let f = sitedGrass()
    host.show(f)
    const first = host.current()
    f = chooseTile(askToRetype(f), 'rock')
    host.show(f)
    await settle()

    expect(host.current()).not.toBe(first)
    expect(first?.group.parent, 'the grass plot is off the island').toBeNull()
    const plots = r.scene.children.filter(o => o.name === 'growing-plot')
    expect(plots).toEqual([host.current()?.group])
  })

  it('hands the plot back off the challenge stage before destroying it', () => {
    /*
     * The other half of the 28 July landmine: a group that is re-parented onto
     * the stage's turntable and then disposed leaves the stage holding a corpse.
     * A rebuild is a disposal, so it goes through the same door as `drop`.
     */
    const r = rig()
    const host = createPlotHost(r.ports)
    let f = sitedGrass()
    host.show(f)
    const going = host.current()?.group
    f = chooseTile(askToRetype(f), 'rock')
    host.show(f)
    expect(r.unstaged).toEqual([going])
  })

  it('keeps every sum she has already answered, and shows them', async () => {
    /*
     * `sumProgress` lives on the Flow rather than on the plot, which is what makes
     * changing her mind free (retype.test.ts). The REBUILD must not throw that
     * away visually either: nine sums in, the new scaffolding starts nine sums
     * built, not from bare ground.
     */
    const r = rig()
    const host = createPlotHost(r.ports)
    let f = sitedGrass()
    expect(sumsForTile(f)).toBeGreaterThan(2)
    f = challengePassed(tapSum({ ...f, phase: 'free' }))
    expect(f.sumProgress).toBeGreaterThan(0)
    expect(f.plot).not.toBeNull()

    f = chooseTile(askToRetype(f), 'rock')
    host.show(f)
    await settle()

    /*
     * One sum buys the second increment, and on a mountain plot the second
     * increment IS the peak — so the mountain she has already paid for stands
     * there in stone rather than as a golden promise she has to earn twice.
     */
    const peak = r.made.at(-1)
    expect(peak, 'the peak was asked for').toBeDefined()
    expect(peak?.visible, 'the sum she already answered still counts').toBe(true)
  })

  it('does not churn: an unchanged flow keeps the very same scaffolding', async () => {
    /*
     * `refresh()` runs on every tap. Rebuilding on any of them would restart the
     * grow animation, re-fetch every model, and reset the build she is watching —
     * so the comparison has to be an identity, not a redraw.
     */
    const r = rig()
    const host = createPlotHost(r.ports)
    const f = sitedGrass()
    host.show(f)
    await settle()
    const first = host.current()
    const fetched = r.asked.length
    host.show(f)
    host.show({ ...f, sumProgress: f.sumProgress })
    await settle()
    expect(host.current()).toBe(first)
    expect(r.asked.length).toBe(fetched)
  })

  it('rebuilds when the site moves, not only when the kind changes', async () => {
    // Nothing in the flow moves a plot today, so this is a guard rather than a
    // report: a plot drawn at the wrong socket is the same class of lie.
    const r = rig()
    const host = createPlotHost(r.ports)
    const f = sitedGrass()
    host.show(f)
    const first = host.current()
    host.show({ ...f, plot: { at: { q: 0, r: 1 }, type: 'grass' } })
    expect(host.current()).not.toBe(first)
    expect(host.sitedAt()).toEqual({ q: 0, r: 1 })
  })
})

/**
 * The two things main.ts must keep true about the host, asserted in the source.
 *
 * Same kind of test, and the same reason, as the `overlay.close()` sweep in
 * `retype.test.ts`: the fault this file was written for lived entirely in the
 * glue, where every unit behaved correctly and the sequence still showed her the
 * wrong tile.
 */
describe('main.ts wires the host the only way that works', () => {
  const MAIN = resolve(here, '../../src/island/main.ts')
  const code = (): string => readFileSync(MAIN, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')

  it('builds the plot before it looks for one to stage', () => {
    /*
     * `stageFor('sum')` shows whatever plot is standing — and a retype rebuilds
     * that plot, so reading it first would put the OLD scaffolding on the
     * vignette and destroy it a line later. Build, then look.
     */
    const src = code()
    const built = src.indexOf("if (kind === 'sum') showPlot(state)")
    const read = src.indexOf('plots.current()?.group')
    expect(built, 'the build-before-looking line is still there').toBeGreaterThan(-1)
    expect(read).toBeGreaterThan(built)
  })

  it('has no second way to make a plot', () => {
    // One creation path, so the identity rule cannot be sidestepped by a caller
    // that grows its own scaffolding and never compares it to anything.
    expect(code()).not.toContain('createGrowingPlot')
  })
})

describe('the plot the ceremony needs is still there when the flow lets go', () => {
  it('remembers where it was sited past the flow clearing the plot', async () => {
    /*
     * `commitPlot` nulls `flow.plot` in the same transition that makes the tile
     * real, and the fly-back then needs to know which socket to adopt the grown
     * scenery onto. That outlives the flow's own record of it.
     */
    const r = rig()
    const host = createPlotHost(r.ports)
    const f = sitedGrass()
    host.show(f)
    host.show({ ...f, plot: null })
    expect(host.sitedAt()).toEqual({ q: 1, r: 0 })
  })

  it('lets the last increment play before the scaffolding goes', async () => {
    vi.useFakeTimers()
    try {
      const r = rig()
      const host = createPlotHost(r.ports)
      const f = sitedGrass()
      host.show(f)
      const going = host.current()
      host.show({ ...f, plot: null })
      // Still up, showing its flourish.
      expect(host.current()).toBe(going)
      vi.advanceTimersByTime(41)
      expect(host.current()).toBeNull()
      expect(going?.group.parent).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
