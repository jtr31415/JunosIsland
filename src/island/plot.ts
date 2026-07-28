/**
 * The growing plot on the island: the flow's `plot`, made visible.
 *
 * Lifted out of main.ts because this is the third fault in two days to live in
 * exactly this seam, and every one of them was invisible to the unit tests
 * either side of it. `createGrowingPlot` builds whatever it is told to build,
 * correctly, and `flow.plot` records what is being built, correctly; the bugs
 * were all in the sentence between them — a plot stranded on a closed panel, a
 * plot left standing after the thing it depicts had changed.
 *
 * THE RULE THIS FILE EXISTS TO HOLD: what is on screen tracks what the flow says.
 * Not "a plot is created when none is standing", which is what main.ts did and
 * what let a grass plot outlive her decision to build a mountain instead. The
 * comparison is by SITE AND KIND — the two things the scaffolding is constructed
 * from — so a difference in either rebuilds it.
 *
 * Joe, 28 July: *"when user selects a mountain tile to be completed, the
 * incremental build at the side shows a propped grass tile, not a mountain tile.
 * then the grass tile is placed on the island and only on reloading the page does
 * it change to a mountain."* Both halves are that one fault. The scaffolding she
 * finished was a grass plot, `props.adopt` hands the finished hex exactly what the
 * scaffolding grew — and marks the hex dressed, so `props.sync` never plants the
 * peak. Her save said 'rock' the whole time, which is why a reload corrected it.
 *
 * Everything the island proper needs from a plot is a port, so the whole
 * lifecycle can be driven headlessly (`tests/island/plot.test.ts`).
 */
import * as THREE from 'three'
import { createGrowingPlot } from './world/increments'
import type { GrowingPlot } from './world/increments'
import { plannedLook } from './world/coast'
import { mountainHexFor, mountainSpinFor } from './world/props'
import { sumsForTile } from './flow'
import type { Flow } from './flow'
import type { TileModels } from './world/tiles'
import type { TileType } from './world/grid'
import type { Axial } from './world/hex'

export interface PlotPorts {
  /** The finished tile's own meshes, so the ghost hex IS the real hex. */
  models: TileModels
  /** Where a standing plot lives — the world, not the challenge stage. */
  scene: THREE.Object3D
  worldOf(a: Axial): THREE.Vector3
  /** Load a scenery piece by name, textured and ready to add. */
  prop(name: string): Promise<THREE.Object3D>
  /** Offer taps on the plot, so she can change her mind about it. */
  setPickable(group: THREE.Object3D | null): void
  /**
   * Take this group off the challenge stage, if that is where it is.
   *
   * `stageFor('sum')` re-parents the plot onto the overlay's turntable, and the
   * turntable goes away with the panel; a plot disposed while the stage still
   * holds it leaves the stage holding a corpse. Every route that destroys a plot
   * goes through here first — dropping it, and rebuilding it.
   */
  unstage(group: THREE.Object3D): void
  /** How long the finished scaffolding stays up showing its flourish. */
  farewellMs: number
}

export interface PlotHost {
  /** The scaffolding currently standing, if any. */
  current(): GrowingPlot | null
  /**
   * Where the plot was sited, remembered past the flow clearing it.
   *
   * `commitPlot` nulls `flow.plot` in the same transition that makes the tile
   * real, and the fly-back still has to know which socket to adopt her grown
   * scenery onto.
   */
  sitedAt(): Axial | null
  /** Make the island show the plot this flow describes. */
  show(state: Flow): void
  /** Tear it down now, cancelling any farewell in progress. */
  drop(): void
  update(dt: number): void
}

/** What a standing plot was BUILT from, and therefore what would invalidate it. */
interface Built { at: Axial; type: TileType }

const same = (a: Built | null, b: Built | null): boolean =>
  !!a && !!b && a.at.q === b.at.q && a.at.r === b.at.r && a.type === b.type

export function createPlotHost(ports: PlotPorts): PlotHost {
  let plot: GrowingPlot | null = null
  /** What the standing plot depicts. Compared against the flow on every show. */
  let built: Built | null = null
  /** Where the current plot is sited, remembered past the flow clearing it. */
  let plotAt: Axial | null = null
  /** Set while a finished plot is showing its flourish before being removed. */
  let farewell: ReturnType<typeof setTimeout> | null = null

  function drop(): void {
    if (farewell) { clearTimeout(farewell); farewell = null }
    if (!plot) return
    // It may be on the stage rather than in the world. Detach from wherever it
    // actually is, and make sure the stage is not left holding a corpse.
    ports.unstage(plot.group)
    plot.group.removeFromParent()
    plot.dispose()
    plot = null
    built = null
    // Stop offering taps on a plot that no longer exists — a stale reference
    // here would raycast against a disposed group.
    ports.setPickable(null)
  }

  function show(state: Flow): void {
    if (!state.plot) {
      /*
       * The plot is paid for and the tile is real. LET THE LAST STEP PLAY.
       *
       * The flow machine commits the tile in the same transition that reaches
       * full payment, so a plot never exists in a finished state — which meant
       * the tenth increment, the completion flourish, could not once be seen
       * and the intro tile showed no build at all. So the scaffolding stays up
       * for a beat at full progress before it comes down.
       */
      if (plot && !farewell) {
        plot.setProgress(1, 1)
        const going = plot
        farewell = setTimeout(() => {
          ports.unstage(going.group)
          going.group.removeFromParent()
          going.dispose()
          if (plot === going) { plot = null; built = null }
          farewell = null
        }, ports.farewellMs)
      }
      return
    }
    // A new plot while the old one is still bowing: clear it out at once, or
    // two hexes overlap and the farewell disposes the wrong one.
    if (farewell) drop()
    /*
     * SHE HAS CHANGED HER MIND, so the scaffolding changes with it.
     *
     * `chooseTile` retypes a plot in place — the site and every sum she has
     * already answered stay exactly as they were, which is what makes changing
     * her mind free (`flow.ts`, and `retype.test.ts`). Nothing about that reaches
     * the screen unless the thing on screen is rebuilt, and this is the only
     * place that can notice: the flow has no idea a scaffolding exists.
     *
     * Rebuilding costs her nothing. `sumProgress` lives on the Flow, so the new
     * plot is put straight to the progress she has already paid for, below.
     */
    if (!same(built, state.plot)) drop()
    if (!plot) {
      // Seeded from the socket: the same hex always grows the same thing, but
      // no two hexes grow the same thing as each other.
      const seed = (state.plot.at.q * 73856093) ^ (state.plot.at.r * 19349663)
      plot = createGrowingPlot(state.plot.type, ports.models.size, {
        models: ports.models,
        prop: name => ports.prop(name),
        /*
         * The look the finished tile WILL have, solved over the island with this
         * plot already on it. Without it a water plot built as a flat slab and
         * then arrived as a coast piece, which is a discontinuity at the one
         * moment §2 wants continuity.
         */
      }, seed >>> 0, plannedLook(state.island, state.plot.at, state.plot.type),
      /*
       * A mountain hex builds AS a mountain. Named through the shared chooser so
       * the peak she watches rise is the one props.ts plants at touchdown — the
       * two placement paths agreeing by construction rather than by luck.
       */
      state.plot.type === 'rock'
        ? { name: mountainHexFor(state.plot.at), spin: mountainSpinFor(state.plot.at) }
        : null)
      built = { at: state.plot.at, type: state.plot.type }
      plot.group.position.copy(ports.worldOf(state.plot.at))
      plotAt = state.plot.at
      ports.scene.add(plot.group)
      // Tappable, so she can change her mind about what is being built here.
      ports.setPickable(plot.group)
    }
    plot.setProgress(state.sumProgress, sumsForTile(state))
    /*
     * NOT hovering. The transparent container already says "not placed yet"
     * — that is its whole job — and raising the plot as well lifted it clean
     * out of the vignette's frame. The hover belonged to the world-space
     * version this replaced; the launch height it defined is still what the
     * fly-back falls from.
     */
    plot.float(false)
  }

  return {
    current: () => plot,
    sitedAt: () => plotAt,
    show,
    drop,
    update(dt) { plot?.update(dt) },
  }
}
