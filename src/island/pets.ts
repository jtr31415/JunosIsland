/**
 * Cube pets: hatching, wandering, and being tapped.
 *
 * No needs, no hunger, no decay, no death (brief section 5). A pet that has
 * come home stays home. Wandering exists because a still island looks asleep,
 * not because anything depends on it.
 */
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createBlobShadow, castShadow } from './juice'
import { flattenImported } from './lighting'
import { wearFaceUVs } from './variants/facedecals'
import { FITS } from './world/props'
import { toWorld, parse, key } from './world/hex'
import type { Axial } from './world/hex'
import { rescueHexFor } from './world/walk'
import { keepOutFor } from './world/mountains'
import { defaultRng } from '../core/rng'
import type { Rng } from '../core/rng'
import type { Island } from './world/grid'
import type { Pet } from './flow'
import { flies } from './species/moves'
import { speciesRecord } from './species/registry'
import { buildAssembly } from './species/parts/assembly'

/** The 24 Kenney species, by GLB basename. */
export const SPECIES = [
  'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat', 'animal-caterpillar',
  'animal-chick', 'animal-cow', 'animal-crab', 'animal-deer', 'animal-dog',
  'animal-elephant', 'animal-fish', 'animal-fox', 'animal-giraffe', 'animal-hog',
  'animal-koala', 'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
  'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
] as const

/**
 * Who flies, and therefore who hovers instead of bobbing along the grass.
 *
 * The judgement itself now lives in `species/moves.ts`, not here: it is Joe's
 * call, one species at a time, set in the workbench editor — and it cannot be
 * read off the mesh, because a penguin carries the same wing nodes as a
 * parrot and does not fly. See that file's header for the reasoning; `flies()`
 * is the predicate this module asks.
 */

/**
 * How high "tree height" is.
 *
 * DERIVED from the scenery rather than picked, so a flyer stays among the
 * branches if the trees are ever resized. `FITS` is the one place the game
 * decides how big a piece of landscape may be: `feature` is the budget a tile's
 * own tree is fitted into and `grown` the smaller budget for the eight pieces
 * a plot they built themselves carries. The taller of the two is the canopy a
 * bee has to clear.
 *
 * Measured against the real island: a tile's tree fits a 0.95-unit height
 * budget and a pet stands about 0.25, so this is roughly four pets up — high
 * enough to read as flight, low enough to stay in frame under the orbit camera.
 */
export const TREE_HEIGHT = Math.max(FITS.feature[1], FITS.grown[1])

/**
 * How fast a flyer's wings beat, in radians of phase per second.
 *
 * Fast and shallow against a bob that is small and slow — that contrast is what
 * reads as hovering rather than floating. Exported so a test can sample a whole
 * wingbeat rather than copy the number and drift from it: two instants picked
 * without knowing the period can straddle a turning point and find no movement
 * in a wing that is beating perfectly well.
 */
export const WINGBEAT = 14

/**
 * The shot a tap target is sized against, and a real touch-target standard.
 *
 * Joe, watching them play: "the tap area for a spawn animal needs to be a bit
 * larger. she wants to tap them but regularly misses and is taken to a
 * challenge. it really frustrates her." Missing a pet is not a near-miss that
 * does nothing — `pickFrom` answers with whatever IS under the ray, so they get
 * the egg's reading round, a tile offer, or a plot resuming into a sum. Three
 * different ways of being taken somewhere they did not ask to go, during the
 * play they chose for themselves.
 *
 * The cause is arithmetic, not code: a pet is scaled to 0.16 and stands about
 * a quarter of a unit against a hex circumradius of 1.15, so under the island's
 * own framing the disc a finger can reliably land in is TWENTY pixels across,
 * measured. A six-year-old's finger is nearer fifty. With the proxy it is 47.5.
 *
 * Every number here is taken from something rather than picked:
 *
 * - `px` is 48, Material's minimum touch target (48dp ≈ 7.7mm at baseline
 *   density). A child's finger is bigger than an adult's target, not smaller.
 * - `viewportPx` is the short side of a mid-range Android tablet in landscape,
 *   which is 1280 × 800 CSS pixels on essentially all of them.
 * - `fov` and `distance` are `camera.ts`'s own — `PerspectiveCamera(46, …)` and
 *   `let distance = 14`, the shot the island opens on and returns to. There is
 *   a test that constructs the real orbit camera and pins both, so a change of
 *   framing over there cannot silently shrink the target over here.
 *
 * `distance` is therefore the shot this is CALIBRATED at, not the only shot it
 * holds at — see `pickRadiusAt`.
 */
export const TAP_TARGET = {
  px: 48,
  viewportPx: 800,
  fov: 46,
  distance: 14,
} as const

/**
 * Half the tap target, in world units at that shot.
 *
 * The frustum is `2·d·tan(fov/2)` tall at distance d, spread over `viewportPx`
 * pixels — so a target of `px` pixels is `px/viewportPx · 2d·tan(fov/2)` wide,
 * and half of that is the radius. Measured out: 0.357 units, which is a sphere
 * 0.71 across against a hex 2.31 across, so a pet owns under a third of the
 * tile it stands on and cannot reach across a neighbour's.
 */
export const PICK_RADIUS =
  (TAP_TARGET.px / TAP_TARGET.viewportPx) * TAP_TARGET.distance
  * Math.tan((TAP_TARGET.fov * Math.PI) / 360)

/**
 * The same 48 pixels, in world units, at whatever distance the camera is now.
 *
 * A FIXED world radius is a shrinking tap target, and it shrinks exactly when
 * they need it most. `frame()` pulls the camera back as their island grows,
 * and the frustum is proportional to distance, so a sphere that answers to
 * 47.5px at the opening shot answers to 39px at fifteen tiles and **26px at
 * the 26-unit clamp** — a whisker off the 20.5px bug the proxy was added to
 * fix, on the late-game island that is full of animals to go looking for.
 * Fable found it; the arithmetic is `0.357 × 26/14`.
 *
 * So the radius is scaled by the camera's own distance, which makes the target
 * the same SIZE OF FINGER at every shot — which is what "48dp" meant in the
 * first place. Zooming in shrinks it in world units too, and that is right for
 * the same reason: 48 pixels is 48 pixels, and it stops a pinched-in pet
 * swallowing the tile it stands on.
 *
 * **No cap is needed, and this is why.** At the 26-unit clamp the radius is
 * 0.66 units, still inside the hex's own incircle (1.0 at `hexSize` 1.1545),
 * so even at the furthest shot the game allows, a pet cannot reach across onto
 * a neighbouring tile. The pull-back is clamped and the target is bounded by it.
 */
export function pickRadiusAt(cameraDistance: number): number {
  return PICK_RADIUS * (cameraDistance / TAP_TARGET.distance)
}

/**
 * One geometry and one material for every pet's tap proxy, in the whole game.
 *
 * Shared for the reason the blob's falloff texture and the set atlases are
 * shared, and NEVER disposed per pet: freeing either would blank the tap target
 * of every other pet at once, including friends they already own (brief §19).
 * A unit sphere scaled per creature keeps it to one buffer.
 */
let proxyGeo: THREE.SphereGeometry | undefined
let proxyMat: THREE.MeshBasicMaterial | undefined

/**
 * An invisible, finger-sized sphere that answers taps on a pet's behalf.
 *
 * ## It is invisible by MATERIAL, and it must stay that way
 *
 * The obvious `proxy.visible = false` silently undoes the whole fix, and does
 * it without failing anything: `picking.ts`'s `isShowing()` walks the parent
 * chain and rejects a hit on anything hidden — it has to, or the egg would
 * catch taps before it has washed ashore. A hidden proxy is therefore skipped
 * by the one function it exists to be found by, and the pet's tap target is the
 * pet again.
 *
 * So the proxy is `visible`, and draws nothing: `colorWrite: false` puts no
 * pixels on the screen, `depthWrite: false` keeps it from occluding anything
 * behind it, and `opacity: 0` says the same thing a third way. It costs one
 * no-op draw call per pet.
 *
 * `DoubleSide` because `Mesh.raycast` honours `material.side`, and a finger
 * that lands inside the sphere — they can pinch right in — would otherwise find
 * only back faces and miss the pet at point-blank range.
 *
 * ## Sphere, not box
 *
 * The holder is turned to face wherever the pet is walking, so a box would give
 * them a target that changed size as their friend wandered about. A sphere is
 * the same circle from every angle, concentric with what they can see.
 *
 * ## Measured, then floored
 *
 * The radius is the half-diagonal of the creature's OWN measured box — so the
 * proxy always contains the pet, whatever the pack does next — or a finger's
 * width at the current shot if that is bigger, which for all 24 species at
 * every distance the camera can reach it is. No fixed factor and no single
 * dimension anywhere in it (HANDOFF §5).
 *
 * The floor MOVES, because the shot does: see `pickRadiusAt` and `sizeProxy`.
 */
function pickProxy(body: THREE.Box3, pick: unknown, cameraDistance: number): THREE.Mesh {
  proxyGeo ??= new THREE.SphereGeometry(1, 16, 12)
  proxyMat ??= new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: false,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  })
  const proxy = new THREE.Mesh(proxyGeo, proxyMat)
  proxy.name = 'pet-pick'
  proxy.position.copy(body.getCenter(new THREE.Vector3()))
  sizeProxy(proxy, bodyHalfOf(body), cameraDistance)
  // The same answer the holder gives, so `nearestPickable` needs no walk up.
  proxy.userData.pick = pick
  /*
   * And a declaration that this is a stand-in rather than a thing.
   *
   * `picking.ts` answers with whatever is nearest the camera, which is the
   * right rule for objects they can SEE and the wrong one for a shell they
   * cannot: a pet standing beside the egg puts an invisible sphere in front of
   * it, so a tap on the egg bounced the pet instead of opening the round —
   * on "the one thing on the island they are always meant to be able to reach".
   * Flagged rather than sniffed out of the material, because `colorWrite`
   * false is how it draws nothing, not what it means.
   */
  proxy.userData.proxy = true
  // Nothing invisible should throw anything. There are no shadow maps in this
  // game at all, but a rig that ever gains one must not find this.
  proxy.castShadow = false
  proxy.receiveShadow = false
  return proxy
}

/** The half-diagonal of a creature's own measured box. */
function bodyHalfOf(body: THREE.Box3): number {
  return body.getSize(new THREE.Vector3()).multiplyScalar(0.5).length()
}

/**
 * Fit a proxy to its creature and to the shot, in that order of precedence.
 *
 * Separated out from `pickProxy` because it is called again every time the
 * camera's distance changes, which on a growing island is most frames of a
 * re-frame and every frame of a pinch.
 */
function sizeProxy(proxy: THREE.Mesh, bodyHalf: number, cameraDistance: number): void {
  proxy.scale.setScalar(Math.max(bodyHalf, pickRadiusAt(cameraDistance)))
}

interface Live {
  pet: Pet
  root: THREE.Group
  /** The blob on the ground. NOT a child of root — see clearOf(). */
  shadow: THREE.Mesh
  /** Where it is walking to, in world space. */
  goal: THREE.Vector3
  phase: number
  /** Set on tap; drives a squash-stretch bounce. */
  bounce: number
  /** Seconds left to stand still before wandering again. */
  restFor: number
  /** Seconds spent trying to travel without getting anywhere. */
  stuckFor: number
  /**
   * Half the creature's own width, measured after scaling.
   *
   * Species differ — an elephant is not a chick — so this is measured per pet
   * rather than assumed, and it is what keeps the pet's SURFACE out of the
   * scenery rather than merely its centre.
   */
  radius: number
  /** Does it fly? Settled once, at load, from `species/moves.ts`. */
  flying: boolean
  /** The wing nodes, if this one has any, so a hover looks like flying. */
  wings: THREE.Object3D[]
  /** The invisible sphere that answers taps for it. Re-sized with the shot. */
  proxy: THREE.Mesh
  /**
   * Half the diagonal of the creature's own box, measured once at load.
   *
   * Kept so the proxy can be re-sized without re-measuring — and re-measuring
   * is exactly what must not happen, because by then the proxy is INSIDE the
   * box and a creature would grow its own tap target every frame.
   */
  bodyHalf: number
}

export interface Obstacle { x: number; z: number; r: number }

/**
 * How many times `clearOf` will re-ask before it settles for what it has.
 *
 * Two overlapping keep-outs are resolved exactly, in one pass, by the crossing
 * below — the passes are headroom for three or more piled on the same spot,
 * which the scenery does not build but an egg beside a rock beside Fred could.
 * Bounded on purpose: a pet wedged in a corner where no clear point exists must
 * cost one frame's arithmetic, not a hang.
 */
export const CLEAR_PASSES = 4

/**
 * Where two keep-out circles cross, whichever crossing is nearer `from`.
 *
 * Null when there is no crossing to slide to: circles that do not reach each
 * other, or one swallowed whole by the other. Both mean the boundary of `a`
 * has no point clear of `b`, so the caller must push out of `b` instead.
 */
function crossing(
  a: Obstacle, ka: number, b: Obstacle, kb: number, fx: number, fz: number,
): { x: number; z: number } | null {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const d = Math.hypot(dx, dz)
  if (d < 1e-6 || d > ka + kb || d < Math.abs(ka - kb)) return null
  // Standard circle-circle intersection: t along the centre line, h across it.
  const t = (ka * ka - kb * kb + d * d) / (2 * d)
  const h2 = ka * ka - t * t
  if (h2 <= 0) return null
  const h = Math.sqrt(h2)
  const mx = a.x + (dx / d) * t
  const mz = a.z + (dz / d) * t
  const px = (-dz / d) * h
  const pz = (dx / d) * h
  const one = { x: mx + px, z: mz + pz }
  const two = { x: mx - px, z: mz - pz }
  return Math.hypot(one.x - fx, one.z - fz) <= Math.hypot(two.x - fx, two.z - fz)
    ? one : two
}

/**
 * Move a point out of anything it is standing inside, onto the boundary.
 *
 * This is a CONSTRAINT, not a force, and the distinction is the whole fix. The
 * previous version applied a gentle per-frame push, which a pet walking at
 * full speed simply out-ran: it strolled into a tree, was nudged a fraction of
 * the distance back out, and kept going — so pets walked through the scenery.
 * A push can always be beaten by a bigger push in the other direction.
 *
 * Clamping the position afterwards cannot be beaten, because it does not
 * compete with the movement, it corrects it. And since the correction is
 * purely radial while the goal-seek keeps its tangential component, a pet that
 * meets a tree slides around the trunk instead of stopping dead at it.
 *
 * `self` is the pet's OWN radius, and leaving it out was the other half of the
 * clipping. Clamping a pet's centre to the surface of a rock buries half a pet
 * in the rock; what has to touch is the two surfaces, not a point and a
 * surface. Joe's rule: a hard collision on the SURFACES of any moving object.
 *
 * ## Overlapping keep-outs, which is where this used to lose
 *
 * Clamping out of each obstacle IN LIST ORDER quietly undoes itself wherever
 * two keep-outs overlap: the pet is pushed onto the first circle, lands inside
 * the second, is pushed onto the second — and that push puts it back inside the
 * first. The last clamp wins and the pet is left buried in something. It fired
 * about one run in twelve of the "keeps the scenery solid as well, not instead"
 * test, on the random goal directions that aim the pet into the overlap.
 *
 * Order is therefore not list order but DEPTH: resolve whatever the pet is
 * furthest inside. And a push that lands inside something else is not left
 * there — the pet slides along the circle it was just put on until it reaches
 * the point where the two boundaries CROSS, which is by construction clear of
 * both. That is exact for two, so the ordinary case is solved rather than
 * iterated at; the passes above are for a genuine pile-up.
 *
 * It is not a promise. Three or more mutually overlapping keep-outs can leave
 * a residue, and a pet in a pocket with no clear point at all has nowhere to be
 * put. Bounded work, best effort, and never a hang.
 */
export function clearOf(
  pos: THREE.Vector3, obstacles: readonly Obstacle[], self = 0,
): void {
  // Where it wanted to be. Every crossing is judged against this, so a pet
  // comes out of a pinch on the side it walked in from.
  const fx = pos.x
  const fz = pos.z

  for (let pass = 0; pass < CLEAR_PASSES; pass++) {
    /** The obstacle the pet is deepest inside, if any. */
    let worst: Obstacle | undefined
    let deepest = 0
    for (const ob of obstacles) {
      const into = ob.r + self - Math.hypot(pos.x - ob.x, pos.z - ob.z)
      if (into > deepest) { deepest = into; worst = ob }
    }
    if (!worst) return                       // standing clear of everything

    const keep = worst.r + self
    const dx = pos.x - worst.x
    const dz = pos.z - worst.z
    const d = Math.hypot(dx, dz)
    if (d < 1e-4) {                          // dead centre: any way out
      pos.x = worst.x + keep
      pos.z = worst.z
    } else {
      pos.x = worst.x + (dx / d) * keep
      pos.z = worst.z + (dz / d) * keep
    }

    // Landed inside something else? Slide round to where the two boundaries
    // cross rather than clamping again and undoing this one.
    let second: Obstacle | undefined
    let over = 0
    for (const ob of obstacles) {
      if (ob === worst) continue
      const into = ob.r + self - Math.hypot(pos.x - ob.x, pos.z - ob.z)
      if (into > over) { over = into; second = ob }
    }
    if (second) {
      const at = crossing(worst, keep, second, second.r + self, fx, fz)
      if (at) { pos.x = at.x; pos.z = at.z }
    }
  }
}

/*
 * ---------------------------------------------------------------------------
 * WALLED IN (PB-052), and the rescue Joe asked for
 * ---------------------------------------------------------------------------
 *
 * Six rock hexes around one grass hex seal a pet in for good. The mountains are
 * a little over 1.03 units wide at walking height while adjacent hex centres
 * are exactly 2.0000 apart, so every consecutive pair of keep-outs OVERLAPS and
 * the ring is a closed wall. `clearOf` above is a hard positional clamp and not
 * a push, so it can never carry a pet through one; the stuck handler in
 * `update` rerolls the GOAL and never the position; and there is no pathfinder,
 * deliberately. A pet in that pocket lives in a disc of radius ~0.6 forever and
 * it reads, accurately, as "that bunny never goes anywhere".
 *
 * Joe ruled it as JT-033 and his ruling is much smaller than the fix the card
 * proposed: *"C - just relocate the animal from a trapped position, that is no
 * issue at all"*. So there is no walkability layer wired into placement, no
 * corridor check, and no rock tap that silently becomes grass. The child may
 * build the ring. If a friend ends up inside it, the friend is moved.
 *
 * WHY THE WHOLE REMEDY LIVES IN THIS FILE, and nothing of it in `flow.ts`:
 * `flow.pets[].at` is the HATCH hex and is never written back as a pet wanders
 * (see `positionOf` above). So a rescue recorded in the flow would be a first
 * ever post-hatch write to a saved field, and it would still not cover the pet
 * that was already out walking when the sixth mountain landed. Doing it here
 * instead is STATELESS: `sync` re-sites every pet from `at` on load, so the
 * check runs again on every load, an island that is ALREADY sealed is repaired
 * the next time the child opens the game, and no save changes shape. It also
 * picks up the hazard the card raised separately — `firstFreeSpot` can hatch a
 * new pet straight into a sealed pocket, and under recovery that fixes itself.
 */

/**
 * Nearest ground a pet at `from` could actually walk about on, or null when it
 * is not walled in — which is the answer almost every time this is asked.
 *
 * Memoised on the island OBJECT, which is safe because an island is immutable:
 * `grid.place` returns a new one rather than mutating, so a stale entry cannot
 * outlive the shape it was computed for, and a WeakMap lets the old island and
 * its answers be collected together. Without this the region flood would run on
 * every stuck pet on every 1.2s tick.
 */
const rescueMemo = new WeakMap<Island, Map<string, Axial | null>>()

function rescueFrom(
  island: Island, hexSize: number, from: Axial, self: number,
): Axial | null {
  let answers = rescueMemo.get(island)
  if (!answers) { answers = new Map(); rescueMemo.set(island, answers) }
  const k = `${key(from)}|${hexSize}|${self}`
  if (answers.has(k)) return answers.get(k) ?? null
  const to = rescueHexFor(island, from, hexSize, keepOutFor, self)
  answers.set(k, to)
  return to
}

/**
 * Which hex a pet is standing on.
 *
 * Nearest owned centre, which for a hex lattice IS the cell the point falls in
 * — the cells are the Voronoi regions of their centres. Restricting it to the
 * tiles a child owns means a pet nudged a little off the edge answers with the
 * tile it came off rather than with open sea, which is what the caller wants.
 */
function hexUnder(
  island: Island, hexSize: number, x: number, z: number,
): Axial | null {
  let best: Axial | null = null
  let nearest = Infinity
  for (const k of island.tiles.keys()) {
    const a = parse(k)
    const w = toWorld(a, hexSize)
    const d = Math.hypot(x - w.x, z - w.z)
    if (d < nearest) { nearest = d; best = a }
  }
  return best
}

export interface PetField {
  group: THREE.Group
  /** Bring the scene in line with flow state, loading any new species. */
  sync(pets: readonly Pet[], island: Island, hexSize: number): Promise<void>
  /** Squash-stretch bounce, e.g. when tapped. */
  bounce(id: string): void
  /**
   * Where a friend is standing RIGHT NOW, or null if it is not out yet.
   *
   * The album's "find it on the map" needs this and cannot use `flow.pets[].at`,
   * which is the HATCH spot: wandering happens on these live roots and is never
   * written back to `Flow` — deliberately, since a save write per frame per pet
   * would be absurd. So the coordinate the camera flies to has to be read off
   * the scene graph, and only this module has it.
   *
   * A COPY, never the live vector. Handing out `l.root.position` would let any
   * caller teleport a pet by accident, and the one caller here is a camera that
   * wants a point rather than a handle.
   *
   * Null when the id is unknown OR when its ~140KB GLB is still in flight —
   * `sync` creates nothing until the model lands. The caller decides what to do
   * about that; it must not be told a pet is at the origin.
   */
  positionOf(id: string): THREE.Vector3 | null
  /**
   * A standalone copy of a species, for showing off.
   *
   * Not a live pet — no id, no wandering, no place on the island. The hatch
   * ceremony needs one to stand on the turntable while the stage is still up.
   *
   * The caller detaches it when done and MUST NOT dispose it: this is a
   * clone, and a three.js clone shares geometry and materials with the cached
   * original, so freeing them would break every other pet of that species —
   * including friends they already own (brief §19). It comes from the same
   * loader and the same cache as the real thing, which is the point: the
   * friend they meet on the stage is the friend that walks out onto the
   * island.
   */
  preview(species: string): Promise<THREE.Object3D>
  /**
   * Fetch a species AHEAD of needing it, and keep the prototype.
   *
   * Joe, from playtesting: "preloaded the animal otherwise there is a render
   * delay and disappointment." The hatch is the emotional peak — the shell
   * breaks, the stage holds, and the plinth is empty because a ~140KB GLB is
   * still in flight. The ceremony already starts the fetch while the egg is
   * breaking, but ~700ms of shell only covers a model that is ALREADY cached,
   * which is exactly the condition every local test accidentally satisfies
   * (HANDOFF §5: a 1200ms budget passed every time locally and failed every
   * time cold).
   *
   * Fire-and-forget by contract: it never rejects and never resolves to
   * anything, so a caller cannot accidentally make a ceremony wait on it. A
   * failed warm leaves NOTHING cached, so the hatch's own `preview` still
   * tries — a preload that could poison the real load would be worse than no
   * preload at all.
   *
   * ONE species at a time is the intended use. The 24 GLBs total 3.21MiB
   * measured, against a 5MB budget on the target tablet, so warming the pack
   * is not free and is not what this is for.
   */
  warm(species: string): Promise<void>
  /** Trees and rocks to walk around rather than through. */
  setObstacles(list: Obstacle[]): void
  /**
   * How far the camera is from what it is looking at, this frame.
   *
   * Called from the frame loop, because the answer changes with every pinch
   * and with every tile they build — `frame()` pulls back as the island grows.
   * The tap proxies are re-sized so a pet stays a finger wide ON SCREEN at any
   * shot, rather than a fixed lump of world that shrinks to 26px by the time
   * their island is big enough to be worth walking round (`pickRadiusAt`).
   *
   * It re-sizes the PROXIES and nothing else. A pet's keep-out radius and the
   * stretch of its blob are measured once in `sync`, from a box taken before
   * the proxy is attached, and neither is touched here — a camera that pulled
   * back must not give a chick an elephant's keep-out or a longer shadow.
   */
  setCameraDistance(d: number): void
  /**
   * Things that are solid AND move, asked afresh every frame.
   *
   * Fred. He is the only one, and he was the whole of Joe's "animals can still
   * clip through the frog": scenery is published once when it grows, so
   * `setObstacles` is the wrong door for something that potters about between
   * hops — a circle left where he was standing a minute ago blocks empty grass
   * and lets pets through the frog.
   */
  setMovers(fn: () => readonly Obstacle[]): void
  update(dt: number, t: number, island: Island, hexSize: number): void
}

/**
 * A species that is BUILT rather than fetched, or null if this is not one.
 *
 * The second route out of `prototype()`, and the seam `species/kit.ts:195` wrote
 * down and deliberately left unwired until a built collection shipped. Thirty
 * have now shipped: they have no GLB beside `pets/`, so before this every one of
 * them 404'd, `sync`'s `.catch(() => null)` swallowed it, and the pet simply
 * never appeared.
 *
 * Assembly FIRST and no fallback, which is `album.ts:176 shapeOf`'s order — a
 * record that carries an `assembly` is answered here and `loader.loadAsync` is
 * never reached for it, so a built species puts no request on the wire at all.
 * `flattenImported` and `wearFaceUVs` are skipped for the reason the seam note
 * gives: both are no-ops on assembled geometry (its material is already the flat
 * Standard this rig wants, and `facedecals` returns 0 for a species with no
 * atlas UVs), so running them would cost a traverse and buy nothing. `dress()`
 * must never be applied to one and is not called from this module.
 *
 * ## THE WRAPPER GROUP IS LOAD-BEARING. It looks removable. It is not.
 *
 * `buildAssembly` grounds its animal by setting `group.position.y = -box.min.y`
 * ON THE GROUP IT RETURNS (`parts/assembly.ts:617-619`) — a translation on that
 * node itself rather than on its children. A node's local matrix is T·R·S, so
 * its own `position` is NOT scaled by its own `scale`: `sync` doing
 * `root.scale.setScalar(0.16)` on that same group shrinks the geometry to 16%
 * and leaves the lift at full size, so the two stop cancelling and the feet come
 * off the ground by `lift * (1 - 0.16)`.
 *
 * Putting the assembly INSIDE a plain wrapper fixes it exactly: the 0.16 lands
 * on the wrapper, so the child's position is scaled with the child's geometry
 * and the feet stay on y = 0. No `fitInto` and no rescale — an assembly is
 * authored at the pack's own scale (height band 1.43-2.02,
 * `parts/hulls.ts:131`), which is the same units as a Kenney pet GLB, so 0.16 is
 * already the right number for it.
 *
 * HOW BIG IS THE ERROR TODAY? Tiny, and that is worth writing down rather than
 * overstating. Measured over all thirty shipped assemblies, the largest lift any
 * of them carries is -2.951e-5: they are authored with their feet on zero
 * already, so `-box.min.y` is correcting float dust and not lifting an animal.
 * Unwrapped, a hedgehog's feet sit 2.479e-5 below the grass — wrong, and
 * invisible. The wrapper is kept anyway because the lift's SIZE is the accident
 * and the cancellation is the contract: a species whose geometry does not happen
 * to start at zero would sink or float by the whole of it, and one node costs
 * nothing. `tests/island/pets-assembly.test.ts` asserts the cancellation
 * exactly, at 1e-9, so the day that lift grows this is already red.
 *
 * Throws rather than falling back if the build fails. A rejection is not cached
 * (see `prototype`), and `sync` now says so out loud instead of dropping the pet
 * in silence.
 */
function assembledPrototype(species: string): THREE.Group | null {
  const spec = speciesRecord(species)?.assembly
  if (!spec) return null
  const wrapper = new THREE.Group()
  wrapper.name = `assembled:${species}`
  wrapper.add(buildAssembly(spec))
  return wrapper
}

/**
 * A field of pets.
 *
 * `rng` is the repo's ordinary injection (`src/core/rng.ts`), and it is here
 * because of a test defect rather than a product one. Where a pet WANTS to go,
 * how long it rests before wanting somewhere else, and the phase of its hop are
 * all drawn at random — correctly, because a field of pets that all move in step
 * looks mechanical. But a test that asserts on a pet's position without
 * controlling that draw is asserting on a coin toss, and
 * `pettap.test.ts > does NOT let the camera into the keep-out or the blob` was
 * doing exactly that: about one run in six the pet's opening goal landed within
 * the "arrived" radius, the pet re-planned mid-frame, and the two frames the test
 * compares stopped being the same frame.
 *
 * Production passes nothing and gets `Math.random`, so the island is as varied
 * as it ever was. Nothing about a save is seeded from this — pets wander
 * differently every session by design, and always have.
 */
export function createPetField(base = '', rng: Rng = defaultRng): PetField {
  const group = new THREE.Group()
  group.name = 'pets'
  const loader = new GLTFLoader()
  /**
   * Species prototypes, cached as PROMISES rather than as finished models.
   *
   * The promise is the load-bearing part and it is what makes preloading work
   * at all. A cache of finished models is only consulted once a load has
   * COMPLETED, so a warm that is still in flight is invisible: the hatch's own
   * `preview` misses, starts a second fetch of the same file, and waits the
   * full cold time anyway — the preload costs bandwidth and buys nothing. That
   * is the failure mode, and it is silent, because both fetches succeed.
   *
   * Caching the in-flight promise means the second caller JOINS the first. It
   * also collapses the ordinary duplicate: `sync` loading two pets of the same
   * species in one pass used to fetch it twice, since neither had finished by
   * the time the other started.
   */
  const cache = new Map<string, Promise<THREE.Group>>()
  const live = new Map<string, Live>()
  let obstacles: Obstacle[] = []
  let movers: () => readonly Obstacle[] = () => []
  /**
   * The shot the tap targets are currently sized for.
   *
   * Starts at the distance `TAP_TARGET` is calibrated at, so a field nobody
   * tells about the camera behaves exactly as it did before this existed.
   */
  let cameraDistance: number = TAP_TARGET.distance
  /** Bounces asked for before their pet finished loading. */
  const pendingBounce = new Set<string>()
  /**
   * Species whose failure to build or load has already been said out loud.
   *
   * ONCE PER SPECIES, and both halves of that matter. Once, because `sync` is
   * called from the frame loop's own `void pets.sync(...)` and a `console.error`
   * per pet per frame at 60fps is a second bug wearing the first one's clothes.
   * Per SPECIES rather than per pet, because the fact being reported is about
   * the species — thirty of them had no GLB and nobody noticed for weeks, since
   * the catch below threw the reason away rather than printing it.
   *
   * Reporting is all it does. Nothing is added to `live` and nothing is
   * remembered as unbuildable, so the retry the comment below describes is
   * untouched: the next sync tries the same species again, and a friend that
   * fails once on flaky wifi still arrives on the second attempt.
   */
  const reported = new Set<string>()

  function reportDrop(species: string, why: unknown): null {
    if (!reported.has(species)) {
      reported.add(species)
      console.error(
        `pets: could not build or load species "${species}" — no pet of it will `
        + 'appear on the island until this is fixed.', why,
      )
    }
    return null
  }

  /** The solid world this frame: scenery that stays put, plus Fred. */
  function solidNow(): readonly Obstacle[] {
    const moving = movers()
    return moving.length ? [...obstacles, ...moving] : obstacles
  }

  /**
   * The one shared prototype for a species: fetched at most once, ever.
   *
   * Returns the SAME promise to every caller, so a preload in flight and a
   * hatch that wants the model now are one request. Nobody gets this object
   * directly — `model` clones it — because it is the original that every pet
   * of the species shares geometry and materials with.
   */
  function prototype(species: string): Promise<THREE.Group> {
    const hit = cache.get(species)
    if (hit) return hit
    /*
     * BUILT, not fetched — and cached in the same map, as an already-resolved
     * promise.
     *
     * The cache is a map of PROMISES on purpose (see its own comment above), and
     * an assembled species joins it as one rather than getting a second cache of
     * its own. That is what makes `preview`, `warm` and `sync` share a single
     * prototype per species: `model()` clones whatever comes out of here, so the
     * animal is assembled ONCE however many of it a child owns, exactly as a GLB
     * is fetched once.
     *
     * Above the `loadAsync` line and returning before it, so a built species
     * never puts a request on the wire. `assembledPrototype` explains the
     * wrapper it hands back, which is the difference between a pet on its tile
     * and a pet floating over it.
     */
    const built = assembledPrototype(species)
    if (built) {
      const ready = Promise.resolve(built)
      cache.set(species, ready)
      return ready
    }
    // NOTE: these GLBs are NOT self-contained — each references an external
    // Textures/colormap.png beside it. Without that file every pet renders
    // pure white, which looks like a material bug rather than a missing asset.
    const loading = loader.loadAsync(`${base}pets/${species}.glb`).then(gltf => {
      const root = gltf.scene
      // Flat-colour packs often arrive metallic and render black under this rig
      // (lighting brief §1), so clamp on the way in rather than swapping the
      // material — Standard is what picks up the hemisphere's warm underside.
      flattenImported(root)
      /*
       * Point the face decals at the reserved swatches, ONCE, on the shared
       * prototype — before anything clones it, and a three.js `clone()` shares
       * geometry, so every pet of this species inherits the corrected UVs for
       * free. `dress()` calls this too and it is idempotent; the belt and braces
       * are deliberate, since a pet that reaches the screen unpatched shows
       * recoloured eye-whites and that is the whole bug.
       */
      wearFaceUVs(root, species)
      return root
    })
    /*
     * A failure is NOT remembered.
     *
     * Caching a rejected promise would turn one dropped request on a tablet's
     * flaky wifi into a species that can never hatch for the rest of the
     * session — and brief §19 says nothing they own can be lost. Evicting lets
     * the next caller start clean. The `.catch` also means this promise always
     * has a handler even when nobody is awaiting it, which is the normal state
     * of a preload.
     */
    loading.catch(() => { if (cache.get(species) === loading) cache.delete(species) })
    cache.set(species, loading)
    return loading
  }

  async function model(species: string): Promise<THREE.Group> {
    return (await prototype(species)).clone(true)
  }

  /**
   * Somewhere for a pet to go: a random owned tile, on ground it can actually
   * stand on.
   *
   * Candidates inside a tree or rock are REJECTED rather than corrected. The
   * first version let a pet aim anywhere, including into scenery, so the
   * obstacle push shoved it out and it immediately walked back in — and
   * several pets oscillating around the same clear pocket looked, accurately,
   * like a group dance. Picking a reachable goal is the fix; pushing harder
   * would only have made the dance more energetic.
   */
  function randomSpot(island: Island, hexSize: number, self = 0): THREE.Vector3 {
    const keys = [...island.tiles.keys()]
    const spot = new THREE.Vector3()
    const solid = solidNow()

    for (let attempt = 0; attempt < 12; attempt++) {
      const k = keys[Math.floor(rng() * keys.length)] as string
      const parts = k.split(',').map(Number)
      const w = toWorld({ q: parts[0] as number, r: parts[1] as number }, hexSize)
      spot.set(
        w.x + (rng() - 0.5) * hexSize * 0.8, 0,
        w.z + (rng() - 0.5) * hexSize * 0.8,
      )
      const blocked = solid.some(o =>
        Math.hypot(spot.x - o.x, spot.z - o.z) < o.r * 1.15 + self)
      if (!blocked) return spot.clone()
    }
    // Every attempt blocked: stay put rather than aim somewhere unreachable.
    return spot.clone()
  }

  /**
   * A clear standing place on ONE named hex — where a rescued pet is put down.
   *
   * Not `randomSpot`: that samples the whole island and would undo the rescue
   * about as often as not, because most of the island is not the hex we chose.
   * The centre first, then the six facings at half a hex out, then the centre
   * anyway. DETERMINISTIC on purpose — a pet rescued to a different spot every
   * time the child opens the game is a pet that will not stay put, and `sync`
   * re-runs this on every load.
   *
   * The last resort cannot be "nowhere": `clearOf` runs on the next frame and
   * will slide the pet off anything it has been set down inside, which is the
   * ordinary machinery doing its ordinary job.
   */
  function openSpotOn(a: Axial, hexSize: number, self = 0): THREE.Vector3 {
    const w = toWorld(a, hexSize)
    const solid = solidNow()
    const blocked = (x: number, z: number): boolean =>
      solid.some(o => Math.hypot(x - o.x, z - o.z) < o.r * 1.15 + self)

    if (!blocked(w.x, w.z)) return new THREE.Vector3(w.x, 0, w.z)
    for (let i = 0; i < 6; i++) {
      const turn = (i * Math.PI) / 3
      const x = w.x + Math.cos(turn) * hexSize * 0.5
      const z = w.z + Math.sin(turn) * hexSize * 0.5
      if (!blocked(x, z)) return new THREE.Vector3(x, 0, z)
    }
    return new THREE.Vector3(w.x, 0, w.z)
  }

  return {
    group,

    async sync(pets, island, hexSize) {
      for (const pet of pets) {
        if (live.has(pet.id)) continue
        /*
         * A friend who will not load costs THAT friend, not the rest of them.
         *
         * `void pets.sync(...)` is how main.ts calls this, so a rejection here
         * was both an unhandled rejection and an abandoned loop: one flaky fetch
         * and every pet after it in the list simply did not appear on the island
         * — including, on the worst ordering, the one they had just hatched.
         *
         * And unlike the scenery, this one RETRIES for free. Nothing has been
         * added to the group or to `live` at this point, so the pet is still
         * unbuilt by every test in this module and the next sync builds it
         * properly. `bounce` already knows how to wait for a late arrival.
         *
         * It is no longer SILENT, though, and that was the whole of PB-070's
         * second half. `.catch(() => null)` threw the reason away as well as the
         * pet, so thirty species that had no model at all looked exactly like
         * thirty species that were still loading, from every console and every
         * log, for as long as it took somebody to go looking. `reportDrop` says
         * which species and why, once, and changes nothing else.
         */
        const root = await model(pet.species).catch(why => reportDrop(pet.species, why))
        if (!root) continue
        const holder = new THREE.Group()
        // Kenney pets stand ~1.5 units tall against a 2.0-wide hex, which
        // reads as a monument rather than a pet. Scale so one comfortably
        // fits its tile with room to wander.
        // A pet should sit ON its tile with room around it, not fill it. The
        // Kenney models stand ~1.5 units against a 2.0-wide hex, so they need
        // taking right down before they read as little creatures in a world
        // rather than statues on a plinth.
        root.scale.setScalar(0.16)
        holder.add(root)
        /*
         * Measured while the holder still sits at the origin, so the box is
         * the creature's own size rather than its size plus wherever it
         * happens to stand.
         */
        holder.updateMatrixWorld(true)
        const body = new THREE.Box3().setFromObject(holder)
        const radius = Math.max(
          body.max.x - body.min.x, body.max.z - body.min.z) / 2
        /*
         * How tall this one stands, measured for the same reason as its width:
         * the pack runs from a 1.55-unit parrot to a 2.13-unit bunny, and the
         * shadow a body throws under a 35° sun is proportional to its height.
         * A single assumed height would give the elephant a bunny's shadow.
         */
        const standing = body.max.y - body.min.y
        /*
         * ON ITS HATCH HEX — unless a pet standing there could never walk off
         * it (PB-052, ruled as recovery by JT-033).
         *
         * This is the load path as well as the hatch path, so it is also the
         * repair for an island that is ALREADY sealed: `pet.at` is never
         * written back as a pet wanders, so every reload comes through here and
         * asks the question again. And `firstFreeSpot` in the flow checks no
         * reachability at all, so a brand new pet can be dealt a hex inside an
         * existing pocket — same question, same answer, nothing special needed
         * for it.
         *
         * `rescueFrom` returns null for ordinary ground, which is what it
         * returns for every pet on every island that has no ring on it. The
         * untrapped case is untouched.
         */
        const home = pet.at as Axial
        const rescue = rescueFrom(island, hexSize, home, radius)
        const w = rescue
          ? openSpotOn(rescue, hexSize, radius)
          : toWorld(home, hexSize)
        holder.position.set(w.x, 0, w.z)
        holder.userData.pick = { kind: 'pet', id: pet.id }
        /*
         * The tap target, added AFTER the two measurements above and never
         * before them.
         *
         * `radius` is what keeps a pet's SURFACE out of the trees and out of
         * Fred, and `standing` is what sizes its blob — both come from a box
         * around the holder, so a proxy inside that box at measuring time would
         * hand a chick an elephant's keep-out and stretch its shadow to match.
         * The creature is measured; then the target is fitted to the creature.
         */
        const bodyHalf = bodyHalfOf(body)
        const proxy = pickProxy(body, holder.userData.pick, cameraDistance)
        holder.add(proxy)
        group.add(holder)
        // The shadow is a SIBLING of the pet, not a child. Parented, it rose
        // with every hop and sank under the tile on the way down.
        const shadow = createBlobShadow(0.17, standing)
        group.add(shadow)
        /*
         * A hovering creature with rigid wings reads as levitating rather than
         * flying, and the models come with the parts already separated out —
         * so the wings are found once, here, and flapped in update().
         */
        const flying = flies(pet.species)
        const wings: THREE.Object3D[] = []
        if (flying) {
          root.traverse(n => { if (/^wing-/.test(n.name)) wings.push(n) })
        }
        live.set(pet.id, {
          pet, root: holder, shadow, radius, flying, wings, proxy, bodyHalf,
          goal: randomSpot(island, hexSize, radius),
          phase: rng() * Math.PI * 2,
          bounce: 0,
          restFor: 2 + rng() * 6,
          stuckFor: 0,
        })
        // Arrived at last: play the welcome that was asked for too early.
        if (pendingBounce.delete(pet.id)) {
          const l = live.get(pet.id)
          if (l) l.bounce = 1
        }
      }
    },

    preview: species => model(species),

    async warm(species) {
      // Swallowed on purpose: a preload has no screen to fail on, and
      // `prototype` has already evicted the entry so the hatch can retry.
      try { await prototype(species) } catch { /* try again when it matters */ }
    },

    bounce(id) {
      const l = live.get(id)
      if (l) { l.bounce = 1; pendingBounce.delete(id); return }
      /*
       * Not here yet. A pet's model loads asynchronously, so the hatch
       * ceremony asks a brand-new friend to hop in before the file has
       * arrived — and a bounce that quietly does nothing turns the moment they
       * have worked five pages for into a pet that is simply, flatly, there.
       * Remembered instead, and played the moment it lands.
       */
      pendingBounce.add(id)
    },

    positionOf(id) {
      const l = live.get(id)
      return l ? l.root.position.clone() : null
    },

    setObstacles(list) {
      obstacles = list
      // A tile that has just grown a tree may now contain someone's goal.
      // Send those pets somewhere else rather than letting them push at it.
      for (const l of live.values()) {
        const blocked = obstacles.some(o =>
          Math.hypot(l.goal.x - o.x, l.goal.z - o.z) < o.r * 1.15 + l.radius)
        if (blocked) l.restFor = 0
      }
    },

    setCameraDistance(d) {
      // Guarded rather than trusted: `distanceTo` on a camera mid-ease is a
      // float, and a NaN or a zero here would collapse every tap target in the
      // game at once. Same-value calls are the normal case — the shot only
      // changes while they are pinching or the island is growing — so the
      // early return keeps this to one comparison on almost every frame.
      if (!Number.isFinite(d) || d <= 0 || d === cameraDistance) return
      cameraDistance = d
      for (const l of live.values()) sizeProxy(l.proxy, l.bodyHalf, d)
    },

    setMovers(fn) { movers = fn },

    update(dt, t, island, hexSize) {
      const others = [...live.values()]
      /*
       * Asked ONCE per frame rather than once per pet: Fred's position is the
       * same fact for all of them, and on a full island this is the difference
       * between one query and thirty.
       */
      const solid = solidNow()

      for (const l of live.values()) {
        const pos = l.root.position
        const was = { x: pos.x, z: pos.z }
        const to = l.goal.clone().sub(pos)
        const dist = to.length()

        if (dist < 0.12) {
          /*
           * Arrived. REST, properly — a countdown rather than a per-frame dice
           * roll, so a pet that has just walked somewhere stays there long
           * enough to look settled. Constant re-seeking is what made the
           * island look busy and anxious rather than calm.
           */
          l.restFor -= dt
          if (l.restFor <= 0) {
            l.goal = randomSpot(island, hexSize, l.radius)
            l.restFor = 4 + rng() * 8
          }
        } else {
          to.normalize()
          pos.addScaledVector(to, Math.min(dist, dt * 0.9))
          l.root.rotation.y = Math.atan2(to.x, to.z)
        }

        /*
         * Gentle separation: pets nudge apart rather than standing inside one
         * another, and walk around trees instead of through them. Deliberately
         * a soft push, not collision — a pet that got stuck against a rock
         * would look broken, and nothing here is worth a pathfinder.
         */
        const SEP = hexSize * 0.2
        for (const o of others) {
          if (o === l) continue
          const dx = pos.x - o.root.position.x
          const dz = pos.z - o.root.position.z
          const d = Math.hypot(dx, dz)
          if (d > 0.0001 && d < SEP) {
            const push = (SEP - d) / SEP * dt * 2.2
            pos.x += (dx / d) * push
            pos.z += (dz / d) * push
          }
        }
        /*
         * Scenery is SOLID, and so is Fred. Applied last, after seeking and
         * separation, so nothing downstream can push a pet back inside a tree
         * — or through the frog.
         *
         * ONE authority, deliberately. Fred does not check for pets on his own
         * account: he hops where he likes and this clamp answers for it on the
         * next frame, which is what stops two objects both correcting for the
         * same overlap and jittering against each other.
         */
        clearOf(pos, solid, l.radius)

        /*
         * Wedged? Go somewhere else.
         *
         * A hard constraint can trap a pet whose goal lies directly behind a
         * rock: it slides to the point where the only way on is straight
         * through, and there it stays. Rather than build a pathfinder for a
         * cube animal on a nine-hex island, notice that it has stopped
         * getting anywhere and pick a different place to want to be.
         */
        if (dist >= 0.12) {
          const moved = Math.hypot(pos.x - was.x, pos.z - was.z)
          l.stuckFor = moved < dt * 0.25 ? l.stuckFor + dt : 0
          if (l.stuckFor > 1.2) {
            /*
             * WEDGED, or WALLED IN? They look identical from here and the
             * answers are different, so ask rather than guess.
             *
             * Wedged is the ordinary case — a goal directly behind a tree —
             * and a different goal fixes it. Walled in is PB-052, and a
             * different goal fixes NOTHING: on an N-tile island roughly
             * (N-1)/N of goals are outside the pocket, so the pet would reroll
             * here every 1.2 seconds for the life of the save.
             *
             * The question is exact and it is not a heuristic about how long
             * something has been stuck: `rescueFrom` floods the free-space
             * region graph and answers null unless this pet genuinely cannot
             * reach the island's main body. A pet merely leaning on a rock
             * gets the reroll it always got.
             */
            const on = hexUnder(island, hexSize, pos.x, pos.z)
            const to = on ? rescueFrom(island, hexSize, on, l.radius) : null
            if (to) {
              // Relocated, per Joe's ruling. The goal moves with it — put down
              // on open ground still wanting the pocket, it would walk back to
              // the wall and be stuck against the inside of it again.
              const out = openSpotOn(to, hexSize, l.radius)
              pos.x = out.x
              pos.z = out.z
              l.goal = out.clone()
              l.restFor = 2 + rng() * 4
            } else {
              l.goal = randomSpot(island, hexSize, l.radius)
            }
            l.stuckFor = 0
          }
        } else l.stuckFor = 0

        const moving = dist >= 0.12
        let sy = 1
        let sxz = 1

        if (l.flying) {
          /*
           * FLYING, not bobbing. A bee that skims the grass with a walking
           * hop is a bee pretending to be a rabbit; up among the branches it
           * is unmistakably a bee, and Joe asked for exactly that.
           *
           * No squash and stretch, because nothing is pushing off anything:
           * what a hovering creature does is drift on the spot. The bob is
           * small and slow next to the wingbeat, which is fast and shallow —
           * that contrast is what reads as hovering rather than as floating.
           */
          pos.y = TREE_HEIGHT + Math.sin(t * 1.9 + l.phase) * 0.05
          const beat = Math.sin(t * WINGBEAT + l.phase)
          for (let i = 0; i < l.wings.length; i++) {
            const wing = l.wings[i] as THREE.Object3D
            wing.rotation.z = (i % 2 ? -1 : 1) * beat * 0.5
          }
        } else {
          // A hop rather than a glide: squash on the ground, stretch in the air.
          const hop = Math.abs(Math.sin(t * 3.4 + l.phase))
          pos.y = moving ? hop * 0.16 : Math.sin(t * 1.6 + l.phase) * 0.03
          sy = moving ? 1 + hop * 0.12 : 1
          sxz = moving ? 1 - hop * 0.07 : 1
        }

        if (l.bounce > 0) {
          l.bounce = Math.max(0, l.bounce - dt * 2.2)
          const b = Math.sin(l.bounce * Math.PI)
          sy += b * 0.45
          sxz -= b * 0.18
          pos.y += b * 0.25
        }

        l.root.scale.set(sxz, sy, sxz)

        /*
         * The shadow stays flat on the ground beneath — but NOT directly
         * beneath. castShadow throws it away from the sun, so the anchor it is
         * given is where the pet touches down rather than where the blob ends
         * up. That is Joe's third note: every blob used to be a circle drawn
         * concentrically under its object, which is the shadow of a lamp
         * directly overhead, and this rig's sun is at 35°.
         */
        castShadow(l.shadow, pos.y, pos.x, pos.z)
      }
    },
  }
}
