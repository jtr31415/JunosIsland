/**
 * The growing plot: maths progress made physical (slice-1 spec §2).
 *
 * IT SHOWS THE WHOLE TILE FROM THE FIRST MOMENT, as a golden outline hanging
 * in the air, and each completed page turns one more piece of it real.
 *
 * That is Joe's call and it is a better game than the first version, which
 * revealed pieces one at a time out of nothing: seeing the finished tile from
 * the start means the work has a SHAPE. She can see there are four things
 * left, and which four, without being told a number — which is the same job
 * the progress dots do, done by the thing itself.
 *
 * A tile is not awarded finished. It is BUILT, in view, as sums land — so a
 * child watches her arithmetic turn into ground she owns. That continuous
 * cause-and-effect is the entire pedagogical point of building it this way
 * rather than handing over a completed hex.
 *
 * THE TILE COMES FIRST, then the scenery on it. That order matters: the hex
 * appearing is the moment the plot stops being an idea and becomes a place,
 * and everything after it is decoration of somewhere that already exists. The
 * first version instead began with a soil mound and flooded colour across it,
 * which spent three of its ten steps before anything looked like land.
 *
 * Everything here is the REAL asset — the same hex mesh the finished tile
 * uses, the same KayKit props the island grows everywhere else. Building out
 * of stand-in primitives and swapping them at the end would make completion a
 * visual discontinuity rather than the last step of a sequence.
 *
 * Two rules from the spec, both load-bearing:
 *   - Pieces NEVER un-grow. A wrong answer advances nothing and removes
 *     nothing (the serene-right rule).
 *   - When a tile costs fewer than ten sums — which the early curve
 *     guarantees — each sum advances SEVERAL increments, and the intro tile
 *     plays all ten at once. The queue simply runs faster; the sequence
 *     itself never changes.
 */
import * as THREE from 'three'
import type { TileType } from './grid'
import type { TileModels } from './tiles'
import { balance } from '../balance'
import { fitInto, FITS } from './props'

/**
 * The ten canonical steps, in order.
 *
 * One tile, eight pieces of scenery, one flourish. The names are what each
 * step PUTS DOWN, so the sequence reads as a build rather than as a list of
 * animation cues.
 */
export const INCREMENTS = [
  'tile', 'rock', 'tufts', 'bush', 'shrub',
  'sapling', 'tree', 'stones', 'grass', 'flourish',
] as const

export type Increment = typeof INCREMENTS[number]

/**
 * How many increments are visible after `sumsDone` of `cost` sums.
 *
 * The "plays faster" rule as arithmetic: ten steps spread across however many
 * sums the tile actually costs, so a one-sum intro tile shows all ten and a
 * sixteen-sum tile shows roughly one every other sum. This is also what makes
 * increments NOT one-per-page — the ratio does the pacing, not the page count.
 */
export function incrementsShown(sumsDone: number, cost: number): number {
  if (cost <= 0) return INCREMENTS.length
  const done = Math.max(0, Math.min(cost, sumsDone))
  /*
   * THE TILE IS FREE. It appears the instant the plot is sited, before a
   * single sum — spec §2's "pick a socket -> ghost hex appears -> each
   * correct sum advances the build". Spreading all ten steps across the cost
   * meant a freshly sited plot rendered nothing at all: the child chose a
   * spot, heard the chime, and watched the island not change.
   *
   * So the hex is step one and the remaining nine are what the sums buy.
   */
  const rest = INCREMENTS.length - 1
  return 1 + Math.round((done / cost) * rest)
}

export const isComplete = (sumsDone: number, cost: number): boolean =>
  incrementsShown(sumsDone, cost) >= INCREMENTS.length

/**
 * The scenery each biome grows, in the order the increments place it.
 *
 * Eight entries, matching increments 2..9. Grass gets the hexagon pack's own
 * trees and rocks with Forest Nature ground cover between them; water gets
 * reeds and lilies, because a pond that sprouted a pine would be funny once.
 */
const PIECES: Record<TileType, readonly string[]> = {
  grass: [
    'rock_single_A', 'Grass_1_A_Color1', 'Bush_1_A_Color1', 'Bush_2_A_Color1',
    'tree_single_B', 'trees_A_small', 'Rock_1_A_Color1', 'Grass_2_A_Color1',
  ],
  water: [
    'waterplant_A', 'waterlily_A', 'waterplant_B', 'waterlily_B',
    'waterplant_C', 'waterlily_A', 'waterplant_A', 'waterlily_B',
  ],
}

/**
 * How much room each piece gets on the plot, matching how props.ts plants it.
 *
 * Measured and fitted in BOTH dimensions, never a scale factor: these packs
 * disagree about size by up to ninefold within one family, and fitting by a
 * single dimension turns a lily pad into a disc the size of the hex.
 */
const fitFor = (name: string): readonly [number, number] =>
  name.startsWith('waterlily') ? FITS.lily
    : name.startsWith('waterplant') ? FITS.reed
      : /^(Grass|Bush|Rock)/.test(name) ? FITS.cover
        : FITS.feature

/**
 * How high above its socket the finished plot starts, and how far to the side.
 *
 * Enough to read as arriving from somewhere; not so far that it comes in from
 * off-screen, which looks like a mistake rather than a delivery. The lateral
 * reach is what makes it an ARC rather than a drop — §6 asks for the tile to
 * "arc across the screen to its chosen socket", and a purely vertical fall is
 * a different sentence: something dropped, not something delivered.
 */
const LAND_HEIGHT = balance.stage.landHeight

/** Where in the arc the tile meets the ground; the rest is the settle. */
const TOUCHDOWN = 0.72

export interface PlotDeps {
  /** The finished tile's own mesh, so the ghost hex IS the real hex. */
  models: TileModels
  /** Load a scenery piece by name, textured and ready to add. */
  prop(name: string): Promise<THREE.Object3D>
}

export interface GrowingPlot {
  group: THREE.Group
  /** Show the state for this many completed sums. Never regresses. */
  setProgress(sumsDone: number, cost: number): void
  /**
   * Drop the finished plot onto its socket with a bounce (§6's fly-back).
   *
   * "The connective payoff between abstract work and world position" — the
   * spec's own phrase, and the reason this exists rather than the tile simply
   * being there when the stage clears. She did sums on one side of the
   * screen; the land arrives on the other; the arc is the sentence that joins
   * them.
   *
   * A WORLD-SPACE arc, deliberately, not a screen-space flight from the
   * vignette: the plot has to end up at its socket in three dimensions, and a
   * cross-scene screen-space tween buys a nicer first second at the cost of
   * being wrong about where the land actually is.
   */
  land(ms: number, reach?: number): void
  /** Ease the newly-revealed pieces in. Call per frame. */
  update(dt: number): void
  dispose(): void
}

/**
 * The visible plot under construction.
 *
 * Assets load asynchronously while the child is already answering, so the
 * pieces arrive into a fixed set of SLOTS rather than being appended as they
 * download. A slot that is still loading simply shows nothing yet and pops in
 * when it is ready — which keeps the sequence in its intended order however
 * the network behaves, and means a slow load can never reorder the build.
 */
export function createGrowingPlot(
  type: TileType, hexSize: number, deps: PlotDeps,
): GrowingPlot {
  const group = new THREE.Group()
  group.name = 'growing-plot'

  /**
   * One entry per increment.
   *
   * `object` is the real piece and `ghost` is its golden preview; both are
   * null until the asset lands. Exactly one of them is ever visible.
   */
  const slots: Array<{
    object: THREE.Object3D | null
    ghost: THREE.Object3D | null
    shown: boolean
    ease: number
  }> = INCREMENTS.map(() => ({ object: null, ghost: null, shown: false, ease: 0 }))

  /**
   * The look of a piece that is coming but is not here yet.
   *
   * Gold rather than grey, and glowing rather than faint, because this is a
   * PROMISE and not an absence — the tile she is going to have, shown to her
   * while she earns it. Depth-write off so the ghosts never occlude the real
   * pieces standing among them.
   */
  const ghostMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcf5a,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  })

  /** A golden stand-in with the same shape and pose as the real thing. */
  const makeGhost = (object: THREE.Object3D): THREE.Object3D => {
    const ghost = object.clone(true)
    ghost.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) m.material = ghostMaterial
    })
    ghost.renderOrder = 2
    return ghost
  }

  let disposed = false
  /** 0..1 through the landing arc, or -1 when it is not playing. */
  let landT = -1
  let landMs = 900
  let landReach = 1.6

  const install = (index: number, object: THREE.Object3D, preview = true): void => {
    if (disposed) return
    const slot = slots[index]
    if (!slot) return

    /*
     * The promise and the thing promised, in the same place and pose.
     *
     * `preview` is false for the completion flourish: it is an EVENT, not a
     * piece of the tile, and showing a golden outline of a burst of sparks
     * from the first moment promises something that will never be standing
     * there — it just looks like eight more props she has not earned yet.
     */
    const ghost = preview ? makeGhost(object) : null
    slot.ghost = ghost
    slot.object = object
    if (ghost) group.add(ghost)
    group.add(object)

    if (slot.shown) {
      // Already earned by the time the asset arrived: skip straight to real.
      if (ghost) ghost.visible = false
      object.visible = true
      object.scale.setScalar(0.001)
      slot.ease = 0
    } else {
      object.visible = false
      if (ghost) ghost.visible = true
    }
  }

  /*
   * Increment 1: the hex itself.
   *
   * It gets the same treatment as everything else — a golden outline first,
   * turning real when the first page is collected. The earlier version made
   * the hex a translucent WHITE ghost that firmed up gradually, which was a
   * different idea in the middle of this one; one visual language for "coming
   * soon" is easier to read than two.
   */
  const tile = new THREE.Mesh(
    deps.models.geometry[type === 'water' ? 'water' : 'grass'],
    deps.models.material,
  )
  install(0, tile)

  /*
   * Increments 2..9: scenery, arranged around the hex rather than scattered.
   *
   * Fixed angles rather than random ones, so the pieces spread evenly instead
   * of clumping — with only eight of them a random scatter leaves obvious
   * bald patches, which reads as unfinished rather than natural.
   */
  const names = PIECES[type]
  names.forEach((name, i) => {
    const angle = (i / names.length) * Math.PI * 2 + 0.4
    const radius = hexSize * (0.24 + (i % 3) * 0.14)
    void deps.prop(name).then(object => {
      object.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
      object.rotation.y = angle + i
      const [fw, fh] = fitFor(name)
      fitInto(object, fw, fh)
      object.userData.fullScale = object.scale.x
      install(i + 1, object)
    }).catch(() => { /* a missing piece leaves a gap, never a broken build */ })
  })

  /* Increment 10: the completion flourish. */
  const flourish = new THREE.Group()
  for (let i = 0; i < 8; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 5),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0xfff2a8 : 0xffd166,
        metalness: 0, roughness: 1, transparent: true, opacity: 0.9,
      }),
    )
    const a = (i / 8) * Math.PI * 2
    spark.position.set(
      Math.cos(a) * hexSize * 0.6, 0.7 + Math.sin(a * 2) * 0.2, Math.sin(a) * hexSize * 0.6)
    flourish.add(spark)
  }
  install(INCREMENTS.length - 1, flourish, false)

  return {
    group,

    setProgress(sumsDone, cost) {
      const show = incrementsShown(sumsDone, cost)
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]
        if (!slot || i >= show || slot.shown) continue
        slot.shown = true
        slot.ease = 0
        // The promise is kept: the outline goes, the real piece pops in.
        if (slot.ghost) slot.ghost.visible = false
        if (slot.object) {
          slot.object.visible = true
          slot.object.scale.setScalar(0.001)
        }
      }
      // Nothing here ever hides a piece already shown: growth is one-way, and
      // a ghost once redeemed never comes back.

    },

    land(ms, reach = balance.stage.landReach) {
      landMs = Math.max(120, ms)
      landReach = reach
      landT = 0
    },

    update(dt) {
      if (landT >= 0) {
        landT = Math.min(1, landT + dt * (1000 / landMs))
        if (landT >= 1) {
          landT = -1
          group.position.set(0, 0, 0)
          group.scale.set(1, 1, 1)
        } else if (landT < TOUCHDOWN) {
          /*
           * Falling. ACCELERATING, not easing out.
           *
           * The first version used an ease-out — fastest at launch, drifting
           * to a halt at the ground — which is a parachute, and it undercut
           * the impact the squash exists to sell. Things fall the other way.
           */
          const t = landT / TOUCHDOWN
          const fall = t * t
          group.position.y = LAND_HEIGHT * (1 - fall)
          // ...and swing in from the side, so it arcs rather than drops.
          group.position.x = landReach * (1 - t) * (1 - t * 0.35)
          group.scale.set(1, 1, 1)
        } else {
          /*
           * Landed. Squash, then settle.
           *
           * AFTER touchdown, which is the whole point and was backwards: the
           * squash used to peak in mid-air and be fully recovered by the frame
           * the tile first touched the ground, so the one thing it existed to
           * express was over before the event it was expressing.
           */
          group.position.set(0, 0, 0)
          const settle = (landT - TOUCHDOWN) / (1 - TOUCHDOWN)
          const impact = Math.sin(settle * Math.PI) * (1 - settle * 0.4)
          group.scale.set(1 + impact * 0.16, 1 - impact * 0.2, 1 + impact * 0.16)
        }
      }

      for (const slot of slots) {
        if (!slot.shown || !slot.object || slot.ease >= 1) continue
        slot.ease = Math.min(1, slot.ease + dt * 3.2)
        const full = (slot.object.userData.fullScale as number) ?? 1
        // Overshoot slightly then settle, so a piece arrives rather than appears.
        // Overshoot early, settle back to exactly 1 — not a monotonic climb
        // to 1.12 followed by a one-frame snap down, which reads as a pop.
        const k = 1 + 0.16 * Math.sin(slot.ease * Math.PI) * (1 - slot.ease)
        slot.object.scale.setScalar(Math.max(0.001, k * full))
      }
    },

    dispose() {
      disposed = true
      /*
       * Only the flourish is ours to free.
       *
       * The hex borrows its geometry and material from TileModels, which the
       * whole island renders with. The props are Object3D.clone()s, and a
       * three.js clone SHARES geometry and material with the cached original
       * — so disposing them would reach into every other tree of that species
       * on the island and into the loader cache every future one comes from.
       * A plot is torn down on every completed tile, so that churn would be
       * constant. Dropping the references is enough; nothing here is uniquely
       * owned except the sparks.
       */
      ghostMaterial.dispose()         // ours alone
      flourish.traverse(o => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.geometry.dispose()
        const mat = m.material
        if (Array.isArray(mat)) mat.forEach(x => x.dispose())
        else mat.dispose()
      })
      group.clear()
    },
  }
}
