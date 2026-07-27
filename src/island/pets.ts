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
import { toWorld } from './world/hex'
import type { Axial } from './world/hex'
import type { Island } from './world/grid'
import type { Pet } from './flow'

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
 * Joe: "all the animals that can fly should hover at tree height and not bob
 * over the ground."
 *
 * The models do not answer this on their own. Exactly FIVE of the 24 carry
 * `wing-left`/`wing-right` nodes — bee, chick, fish, parrot, penguin — and
 * three of those cannot fly and would look absurd at the top of a tree. A
 * penguin's wings are flippers and a fish's are fins; a chick has wings and
 * spends its whole life on the ground, which is a thing six-year-olds know
 * better than most adults. So the wing nodes are evidence, not the answer, and
 * the list is the judgement: a bee and a parrot fly, and nothing else in the
 * pack does.
 *
 * Deliberately a list rather than a rule derived from the mesh. A rule that
 * said "has wings" would put a penguin in the canopy, and every rule anyone
 * could write to exclude it is this list wearing a disguise.
 */
export const FLYERS: ReadonlySet<string> = new Set(['animal-bee', 'animal-parrot'])

/**
 * How high "tree height" is.
 *
 * DERIVED from the scenery rather than picked, so a flyer stays among the
 * branches if the trees are ever resized. `FITS` is the one place the game
 * decides how big a piece of landscape may be: `feature` is the budget a tile's
 * own tree is fitted into and `grown` the smaller budget for the eight pieces
 * a plot she built herself carries. The taller of the two is the canopy a bee
 * has to clear.
 *
 * Measured against the real island: a tile's tree fits a 0.95-unit height
 * budget and a pet stands about 0.25, so this is roughly four pets up — high
 * enough to read as flight, low enough to stay in frame under the orbit camera.
 */
export const TREE_HEIGHT = Math.max(FITS.feature[1], FITS.grown[1])

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
  /** Does it fly? Settled once, at load, from FLYERS. */
  flying: boolean
  /** The wing nodes, if this one has any, so a hover looks like flying. */
  wings: THREE.Object3D[]
}

export interface Obstacle { x: number; z: number; r: number }

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
 */
export function clearOf(
  pos: THREE.Vector3, obstacles: readonly Obstacle[], self = 0,
): void {
  for (const ob of obstacles) {
    const keep = ob.r + self
    const dx = pos.x - ob.x
    const dz = pos.z - ob.z
    const d = Math.hypot(dx, dz)
    if (d >= keep) continue
    if (d < 1e-4) { pos.x = ob.x + keep; continue }  // dead centre: any way out
    pos.x = ob.x + (dx / d) * keep
    pos.z = ob.z + (dz / d) * keep
  }
}

export interface PetField {
  group: THREE.Group
  /** Bring the scene in line with flow state, loading any new species. */
  sync(pets: readonly Pet[], island: Island, hexSize: number): Promise<void>
  /** Squash-stretch bounce, e.g. when tapped. */
  bounce(id: string): void
  /**
   * A standalone copy of a species, for showing off.
   *
   * Not a live pet — no id, no wandering, no place on the island. The hatch
   * ceremony needs one to stand on the turntable while the stage is still up.
   *
   * The caller detaches it when done and MUST NOT dispose it: this is a
   * clone, and a three.js clone shares geometry and materials with the cached
   * original, so freeing them would break every other pet of that species —
   * including friends she already owns (brief §19). It comes from the same
   * loader and the same cache as the real thing, which is the point: the
   * friend she meets on the stage is the friend that walks out onto the
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

export function createPetField(base = ''): PetField {
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
  /** Bounces asked for before their pet finished loading. */
  const pendingBounce = new Set<string>()

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
     * session — and brief §19 says nothing she owns can be lost. Evicting lets
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
      const k = keys[Math.floor(Math.random() * keys.length)] as string
      const parts = k.split(',').map(Number)
      const w = toWorld({ q: parts[0] as number, r: parts[1] as number }, hexSize)
      spot.set(
        w.x + (Math.random() - 0.5) * hexSize * 0.8, 0,
        w.z + (Math.random() - 0.5) * hexSize * 0.8,
      )
      const blocked = solid.some(o =>
        Math.hypot(spot.x - o.x, spot.z - o.z) < o.r * 1.15 + self)
      if (!blocked) return spot.clone()
    }
    // Every attempt blocked: stay put rather than aim somewhere unreachable.
    return spot.clone()
  }

  return {
    group,

    async sync(pets, island, hexSize) {
      for (const pet of pets) {
        if (live.has(pet.id)) continue
        const root = await model(pet.species)
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
        const w = toWorld(pet.at as Axial, hexSize)
        holder.position.set(w.x, 0, w.z)
        holder.userData.pick = { kind: 'pet', id: pet.id }
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
        const flying = FLYERS.has(pet.species)
        const wings: THREE.Object3D[] = []
        if (flying) {
          root.traverse(n => { if (/^wing-/.test(n.name)) wings.push(n) })
        }
        live.set(pet.id, {
          pet, root: holder, shadow, radius, flying, wings,
          goal: randomSpot(island, hexSize, radius),
          phase: Math.random() * Math.PI * 2,
          bounce: 0,
          restFor: 2 + Math.random() * 6,
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
       * arrived — and a bounce that quietly does nothing turns the moment she
       * has worked five pages for into a pet that is simply, flatly, there.
       * Remembered instead, and played the moment it lands.
       */
      pendingBounce.add(id)
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
            l.restFor = 4 + Math.random() * 8
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
            l.goal = randomSpot(island, hexSize, l.radius)
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
          const beat = Math.sin(t * 14 + l.phase)
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
