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
  challengeFailed, sumsForTile,
} from '../../src/island/flow'
import type { Flow } from '../../src/island/flow'
import { handleWorldTap } from '../../src/island/interactions'
import type { InteractionPorts } from '../../src/island/interactions'
import { TILE_QUESTION } from '../../src/island/script'
import { place, sockets } from '../../src/island/world/grid'
import { buildableSockets } from '../../src/island/world/coast'
import { key } from '../../src/island/world/hex'
import type { Axial } from '../../src/island/world/hex'
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

/**
 * PB-048 — SHE WALKED AWAY FROM A TILE, AND CAME BACK TO SOMETHING ELSE.
 *
 * Joe, reporting it live: Juno taps an ANIMAL on her island, misses — `pickFrom`
 * answers with whatever IS under the ray, so a near-miss falls through to
 * `kind: 'tile'` — and is dropped straight back into building a tile she had
 * walked away from. `askForLand` RESUMED a standing plot, so any tap on her own
 * land carried on a build she had left.
 *
 * His ruling: *"if she abandons a tile, the progress towards reward is saved, the
 * location and type is not. so when she then taps another glowing tile to build
 * one, progress picks up but location and type is rechosen by her on entry."*
 *
 * A standing `flow.plot` while `phase === 'free'` IS the abandoned state: the sum
 * overlay stays open across every sum of a tile, so the only way she lands back on
 * the island mid-build is by leaving. So:
 *
 *   - a tap on an animal or any tile is a CAMERA MOVE and nothing else;
 *   - a tap on the standing plot is unchanged (askToRetype, change-your-mind);
 *   - a tap on a DIFFERENT glowing socket discards the old plot's LOCATION and
 *     TYPE, asks the type question on entry, and carries `sumProgress` — which
 *     lives on the Flow, not on the plot — across untouched.
 *
 * Driven through the REAL `handleWorldTap` and the REAL `createPlotHost`, because
 * every fault in this seam has lived in the glue between two units that each
 * behaved correctly.
 */
function askOnce() {
  let asked: string | null = null
  return vi.fn((which: 'space-surplus' | 'nursery-queue'): 'asked' | 'again' => {
    if (asked === which) { asked = null; return 'again' }
    asked = which
    return 'asked'
  })
}

/** The interaction ports, copied from `interactions.test.ts` rather than invented. */
function ports(over: Partial<InteractionPorts> = {}): InteractionPorts {
  return {
    challengeOpen: () => false,
    eggsPaused: () => false,
    landPaused: () => false,
    invite: askOnce(),
    storyPlaying: () => false,
    openRead: vi.fn(),
    openSum: vi.fn(),
    greetFred: vi.fn(),
    bouncePet: vi.fn(),
    focusOn: vi.fn(),
    say: vi.fn(),
    clearSay: vi.fn(),
    speak: vi.fn(),
    win: vi.fn(),
    ...over,
  }
}

/** The grass plot at (1,0), with one sum genuinely answered toward it. */
function partBuilt(): Flow {
  const f = challengePassed(tapSum({ ...sitedGrass(), phase: 'free' }))
  expect(f.plot, 'the fixture must still be mid-build').not.toBeNull()
  expect(f.sumProgress, 'the fixture must have real work in it').toBeGreaterThan(0)
  return f
}

/**
 * Another glowing socket, somewhere else, that really does take water.
 *
 * Found rather than typed: the assertion below is that the new type is HER new
 * choice, so the socket has to be one where water is genuinely on offer —
 * otherwise `tileTypeFor` would answer grass and the test would pass on a plot
 * that had not changed kind at all.
 */
function elsewhere(f: Flow): Axial {
  const open = buildableSockets(f.island, sockets(f.island))
  const b = open.find(s => key(s) !== key(f.plot!.at)
    && tileOffer({ ...f, phase: 'placing', pending: s, plot: null }).includes('water'))
  expect(b, 'the fixture needs a second socket that really takes water').toBeDefined()
  return b as Axial
}

describe('abandoning a tile', () => {
  it('a tap on her own land never resumes the build — the reported bug', () => {
    /*
     * The miss, exactly as it reaches this layer. She aimed at an animal, the ray
     * answered with the tile it was standing on, and she was handed a sum toward
     * a tile she had walked away from.
     */
    const p = ports()
    const f = partBuilt()
    const next = handleWorldTap(f, { kind: 'tile', axial: { q: 5, r: 0 } }, p)
    expect(next, 'a tile tap changes nothing at all').toBe(f)
    expect(p.openSum).not.toHaveBeenCalled()
    // It is a camera move, and only a camera move.
    expect(p.focusOn).toHaveBeenCalledWith({ q: 5, r: 0 })
  })

  it('a tap on a different socket rechooses where and what, and keeps the sums', () => {
    const p = ports()
    const f = partBuilt()
    const B = elsewhere(f)
    const banked = f.sumProgress

    const asked = handleWorldTap(f, { kind: 'socket', axial: B }, p)
    expect(asked.phase).toBe('placing')
    expect(asked.pending, 'the new socket is the one she tapped').toEqual(B)
    expect(asked.chosen, 'the type is asked again on entry').toBeNull()
    expect(asked.sumProgress, 'nothing she has answered is spent').toBe(banked)
    expect(p.say).toHaveBeenCalledWith(TILE_QUESTION)
    expect(p.openSum, 'a socket tap never opens a sum straight off').not.toHaveBeenCalled()
    // The offer really contains the button she is about to press, so the
    // assertion below cannot pass against an empty offer.
    expect(tileOffer(asked)).toContain('water')

    const built = chooseTile(asked, 'water')
    expect(built.plot?.at, 'the old location is discarded').toEqual(B)
    expect(built.plot?.type, 'and so is the old type').toBe('water')
    expect(built.sumProgress, 'the progress is hers — brief §19').toBe(banked)
    expect(built.phase).toBe('free')
  })

  it('moves the scaffolding, and never plays the completion bow', async () => {
    /*
     * `flow.plot` must go straight from the old plot to the new one. If it were
     * ever transiently null, `plot.ts` would take the farewell branch — pin the
     * scaffolding to full progress and bow — and an ABANDONED tile would look
     * exactly like a finished one.
     */
    const r = rig()
    const host = createPlotHost(r.ports)
    const f = partBuilt()
    const B = elsewhere(f)

    host.show(f)
    await settle()
    const first = host.current()
    expect(first).not.toBeNull()

    /** Every progress the old scaffolding is ever put to. A bow is (n, n). */
    const shown: Array<[number, number]> = []
    const real = first!.setProgress.bind(first)
    first!.setProgress = (done: number, cost: number): void => {
      shown.push([done, cost]); real(done, cost)
    }

    const asked = handleWorldTap(f, { kind: 'socket', axial: B }, ports())
    expect(asked.plot, 'the plot is never transiently null').not.toBeNull()
    host.show(asked)
    const built = chooseTile(asked, 'water')
    expect(built.plot, 'nor here').not.toBeNull()
    host.show(built)
    await settle()

    expect(shown.filter(([d, c]) => d >= c), 'no completion bow was played')
      .toEqual([])
    expect(host.current(), 'a live plot, rebuilt').not.toBe(first)
    expect(host.current()).not.toBeNull()
    expect(r.unstaged, 'the old one was handed back off the stage').toContain(first?.group)
    expect(first?.group.parent, 'and taken off the island').toBeNull()
    // Exactly one scaffolding in the scene, standing at the NEW socket.
    const plots = r.scene.children.filter(o => o.name === 'growing-plot')
    expect(plots).toEqual([host.current()?.group])
    expect(host.current()?.group.position.toArray())
      .toEqual(new THREE.Vector3(B.q, 0, B.r).toArray())
    expect(host.sitedAt()).toEqual(B)
  })

  it('still opens the bank at a socket when nothing is standing', () => {
    // The ordinary first build, pinned so the fix cannot silently break it.
    const p = ports()
    const f = createFlow()
    const next = handleWorldTap(f, { kind: 'socket', axial: { q: 1, r: 0 } }, p)
    expect(next.phase).toBe('placing')
    expect(next.pending).toEqual({ q: 1, r: 0 })
    expect(next.chosen).toBeNull()
    expect(next.plot).toBeNull()
    expect(p.say).toHaveBeenCalledWith(TILE_QUESTION)
    expect(p.openSum).not.toHaveBeenCalled()
  })

  it('loses nothing at all when she walks out of a sum and starts again elsewhere', () => {
    /*
     * Brief §19, over the whole of what she owns. The walk-away is the REAL
     * `challengeFailed` — the card is held, so she comes back to the same sum —
     * and the restart is the real socket tap.
     */
    const f = partBuilt()
    const left = challengeFailed(tapSum({ ...f, phase: 'free' }))
    expect(left.phase).toBe('free')
    expect(left.sumHeld, 'the card she left is held for her').toBe(true)

    const B = elsewhere(left)
    const back = chooseTile(handleWorldTap(left, { kind: 'socket', axial: B }, ports()), 'water')

    // She really did restart, at the new socket and on a new kind...
    expect(back.plot?.at).toEqual(B)
    expect(back.plot?.type).toBe('water')
    expect(back.phase).toBe('free')
    // ...and not one thing she owns moved while she did it.
    expect(back.sumProgress).toBe(left.sumProgress)
    expect(back.island.tiles.size).toBe(left.island.tiles.size)
    expect(back.tilesEarned).toBe(left.tilesEarned)
    expect(back.bankedTiles).toBe(left.bankedTiles)
    expect(back.pets).toEqual(left.pets)
    expect(back.readProgress).toBe(left.readProgress)
    expect(back.eggPresent).toBe(true)
    expect(back.sumHeld, 'and still held after she restarts').toBe(true)
  })
})
