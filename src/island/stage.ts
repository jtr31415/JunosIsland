/**
 * The challenge stage (slice-1 spec §6): the work and its reason, side by side.
 *
 * The child reads on one half of the screen and watches her egg crack on the
 * other. That adjacency IS the pedagogy — continuous cause-and-effect between
 * an abstract page of words and a thing she owns getting closer. It matters
 * more since the overlay started staying open across pages: without a stage
 * she now works through five pages seeing nothing change at all.
 *
 * The vignette is a SEPARATE little scene rendered into a scissored corner of
 * the same canvas. One GL context, its own lighting rig, and the egg or the
 * growing plot re-parented onto its turntable for the duration — three.js
 * moves an object between scenes on add(), so nothing is rebuilt or cloned and
 * the piece the child watches is literally the one she owns.
 *
 * Serene-right rule (§6): NOTHING here reacts to a wrong answer. Wobble and
 * rescue live in the challenge panel; the stage only ever moves forward.
 */
import * as THREE from 'three'
import { createLighting } from './lighting'
import type { LightingPreset } from './lighting'
import meadowDay from './lighting/presets/meadow-day.json'
import { balance } from './balance'
import { fitInto } from './world/props'
import { makeSparkle } from './world/increments'

/**
 * Seconds per revolution, from balance.json.
 *
 * §8: "All constants live in balance.json; nothing hardcoded." This one was,
 * and the schema already had a slot waiting for it.
 */
const TURN_SECONDS = balance.stage.spinSec

/** How fast the ceremony's guest pops into being, and how far it overshoots. */
const POP_SPEED = 3.4
const POP_OVERSHOOT = 0.22

/**
 * How many progress dots to draw, and how many are filled.
 *
 * "How much longer" with no numbers (§6). Deliberately a fixed number of dots
 * whatever the cost: a sixteen-sum tile drawn as sixteen dots is a wall of
 * pips that reads as further away than it is, which is the opposite of
 * encouraging. Five is enough to feel movement and few enough to take in.
 */
export const DOT_COUNT = 5

export function dotsFilled(done: number, cost: number): number {
  if (cost <= 0) return DOT_COUNT
  const share = Math.max(0, Math.min(1, done / cost))
  /*
   * Floor, not round, with a guaranteed first dot the moment any work lands.
   * Rounding lights the first dot before she has done anything, which reads
   * as a lie; flooring alone leaves her at zero after real work on a long
   * tile, which reads as being ignored.
   */
  if (share <= 0) return 0
  return Math.max(1, Math.floor(share * DOT_COUNT))
}

/**
 * A rectangle of the page, in CSS pixels, measured from the TOP-left.
 *
 * The layout itself belongs to CSS — the 55/45 split and the portrait flip
 * live in challenges.css where they can be read and where media queries work.
 * This module only asks where `.stage-slot` ended up and draws into it. An
 * earlier version duplicated the split here in TypeScript, which was dead
 * code the moment the CSS shipped, and its tests asserted a layout nothing
 * consulted.
 */
export interface StageRect {
  x: number
  y: number
  width: number
  height: number
}

export interface Stage {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  /**
   * Put an object on the turntable, re-parenting it out of the world.
   *
   * Pass null to send whatever is up there back where it came from.
   */
  show(object: THREE.Object3D | null, home: THREE.Object3D): void
  /**
   * Forget the guest WITHOUT sending it home.
   *
   * For when the caller is about to destroy it — a finished plot is disposed
   * and rebuilt, and returning a corpse to the world scene, or holding a
   * pointer to one, is how a stale hex ends up floating over the island.
   */
  release(): void
  /** Is this object the one currently on the turntable? */
  holds(object: THREE.Object3D | null): boolean
  /**
   * Is there anything on the turntable at all?
   *
   * The vignette must not be DRAWN when it is empty. A tile under
   * construction now hovers over the real island instead of being lifted in
   * here, so on a sums round the slot beside the panel is meant to be a
   * transparent hole onto the world — and rendering an empty scene into it
   * put back exactly the green container that hole exists to remove.
   */
  isShowing(): boolean
  /**
   * Stand a temporary object on the turntable, popping it into being.
   *
   * Detached by the stage on the next call or on dispose() — DETACHED, never
   * disposed. For things that belong to the ceremony rather than to the world:
   * the pet that has just hatched has no place on the island yet, and must
   * not be re-parented back into one.
   *
   * NEVER dispose what is passed here. A preview is a clone, and a three.js
   * clone SHARES geometry and materials with the cached original — freeing
   * them would break every other pet of that species, on the stage and on the
   * island, including friends she already owns (brief §18). Dropping the
   * scene-graph link is the whole of the cleanup, and it is enough.
   *
   * Pass null to clear.
   */
  showTemp(object: THREE.Object3D | null, height?: number): void
  /**
   * A burst of sparks on the turntable.
   *
   * The shell breaking, seen where she has been watching it (§3, §6). Lives
   * on the stage rather than in the world because that is where her attention
   * has been for the last five pages — the whole point of the ceremony is
   * that it happens on the thing she was working toward, not somewhere else.
   */
  burst(): void
  /**
   * Frame the turntable for an object of roughly this size.
   *
   * `lookHeight` is what the camera AIMS at and `eyeHeight` is where it sits,
   * both as fractions of the radius — and they are separate because a flat
   * object needs them pulled in opposite directions. A tile lying on the
   * ground wants the eye HIGH and the aim LOW, so you look down onto its
   * surface. Tying the two together dropped the camera to ground level and
   * showed the tile edge-on as a gold sliver.
   */
  frame(radius: number, lookHeight?: number, eyeHeight?: number): void
  update(dt: number, t: number): void
  /** Draw into a scissored rect of the shared renderer. */
  render(renderer: THREE.WebGLRenderer, rect: StageRect): void
  dispose(): void
}

export function createStage(): Stage {
  const scene = new THREE.Scene()
  scene.name = 'stage'

  /*
   * Its own lighting rig, from the same preset as the world.
   *
   * The stage is a separate scene, so the world's lights do not reach it — an
   * unlit egg renders as a black blob. Sharing the preset is what keeps the
   * egg on the turntable the same egg she left on the shore; a second rig
   * tuned by eye would drift from the lighting brief the moment either moved.
   */
  const lighting = createLighting(null, meadowDay as LightingPreset)
  /*
   * Lights only — no sky dome, no fog, no ground.
   *
   * Joe: "the tile / egg is in a transparent container, so it looks like it
   * floats freely." Everything the vignette used to stand on was a box around
   * the object, and a box is the one thing it must not have: what belongs
   * behind it is her island, which is already being drawn there.
   */
  lighting.attach(scene, false)

  /*
   * Far plane BEYOND the sky dome, which the rig builds at radius 220.
   *
   * At the first attempt this was 60, so every dome fragment was clipped and
   * the vignette rendered against the WebGL default clear colour: a lit egg
   * floating in a black rectangle. The lighting brief §3 rules out a flat
   * colour standing in for sky, and a black void is the opposite of the tone
   * the whole game is aiming at.
   */
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400)
  camera.position.set(0, 1.5, 4)
  camera.lookAt(0, 0.5, 0)

  /** Everything on the stage turns together, so the piece keeps its pose. */
  const turntable = new THREE.Group()
  turntable.name = 'turntable'
  scene.add(turntable)

  /*
   * The hatch burst, built once and replayed. Building it on demand would
   * allocate geometry in the middle of the one moment that must not stutter.
   */
  const sparks = new THREE.Group()
  sparks.visible = false
  const SPARKS = 16
  for (let i = 0; i < SPARKS; i++) {
    // Same sparkle as the tile's flourish: a soft glow, not a bead.
    const spark = makeSparkle(i)
    spark.userData.dir = new THREE.Vector3(
      Math.cos((i / SPARKS) * Math.PI * 2),
      0.5 + (i % 5) * 0.26,
      Math.sin((i / SPARKS) * Math.PI * 2),
    ).normalize()
    sparks.add(spark)
  }
  scene.add(sparks)
  /** 0..1 through the burst, or -1 when it is not playing. */
  let burstT = -1
  /** The ceremony's temporary guest, and how far through its pop-in it is. */
  let temp: THREE.Object3D | null = null
  let tempT = 0
  let tempScale = 1

  /** Scratch for the renderer's CSS-pixel size; allocated once, not per frame. */
  const canvasSize = new THREE.Vector2()
  let guest: THREE.Object3D | null = null
  let guestHome: THREE.Object3D | null = null
  let guestAt = new THREE.Vector3()
  let spin = 0

  return {
    scene,
    camera,

    show(object, home) {
      // Send the previous guest back exactly where it stood.
      if (guest && guestHome) {
        guestHome.add(guest)
        guest.position.copy(guestAt)
      }
      guest = object
      guestHome = object ? home : null
      if (!object) return

      guestAt = object.position.clone()
      turntable.add(object)
      object.position.set(0, 0, 0)
    },

    showTemp(object, height = 0.6) {
      // Detach only — see the note on showTemp about the shared cache.
      if (temp) { temp.removeFromParent(); temp = null }
      if (!object) return

      fitInto(object, height * 1.6, height)
      tempScale = object.scale.x
      object.position.set(0, 0, 0)
      object.scale.setScalar(0.001)
      turntable.add(object)
      temp = object
      tempT = 0
    },

    release() {
      if (guest) guest.removeFromParent()
      guest = null
      guestHome = null
    },

    holds: object => !!object && guest === object,

    isShowing: () => !!guest || !!temp,

    burst() {
      burstT = 0
      sparks.visible = true
    },

    frame(radius, lookHeight = 0.8, eyeHeight = 1.2) {
      // A saucer just wider than the piece, never a landscape of its own.
      /*
       * Pull back far enough that the piece sits inside the vignette with air
       * around it — an egg and a full hex differ by three times — and keep
       * the eye NEARLY LEVEL with it.
       *
       * A flat plane's horizon always sits at eye height, so a camera pitched
       * down to look at the piece pushes the horizon up and fills the frame
       * with grass. Almost level puts sky behind the piece, which is what
       * makes it read as standing in a place rather than on a putting green.
       */
      const distance = Math.max(1.7, radius * 3.4)
      camera.position.set(0, radius * eyeHeight, distance)
      camera.lookAt(0, radius * lookHeight, 0)
    },

    update(dt, t) {
      if (temp && tempT < 1) {
        tempT = Math.min(1, tempT + dt * POP_SPEED)
        // Overshoot and settle: a friend ARRIVES rather than appearing.
        const k = 1 + POP_OVERSHOOT * Math.sin(tempT * Math.PI) * (1 - tempT)
        temp.scale.setScalar(Math.max(0.001, tempScale * k * Math.min(1, tempT * 1.6)))
      }

      if (burstT >= 0) {
        burstT += dt * 1.15
        if (burstT >= 1) { burstT = -1; sparks.visible = false }
        else {
          // Out fast, then drift and fade — a pop rather than a firework.
          const reach = Math.sin(Math.min(1, burstT * 1.7) * Math.PI * 0.5)
          for (const spark of sparks.children) {
            const dir = spark.userData.dir as THREE.Vector3
            spark.position.copy(dir).multiplyScalar(0.2 + reach * 0.85)
            spark.position.y += 0.25 - burstT * burstT * 0.5
            const m = (spark as THREE.Sprite).material
            m.opacity = 1 - burstT * burstT
            const full = (spark.userData.size as number) ?? 0.2
            spark.scale.setScalar(full * (1 - burstT * 0.4))
          }
        }
      }

      spin += dt * (Math.PI * 2) / TURN_SECONDS
      turntable.rotation.y = spin
      // A gentle bob, so the stage is alive while she is thinking.
      turntable.position.y = Math.sin(t * 1.1) * 0.035
      lighting.update(dt)
    },

    render(renderer, rect) {
      if (rect.width < 8 || rect.height < 8) return

      /*
       * CSS pixels, NOT device pixels.
       *
       * three.js multiplies by the pixel ratio inside setViewport and
       * setScissor. Doing it here as well squared the ratio: on a DPR-2
       * tablet — which is the actual target device — the vignette landed
       * mostly off-canvas and its scissored clear wiped an arbitrary strip of
       * the world underneath. On a DPR-1 desktop the two errors cancel and it
       * looks perfect, which is exactly how it would have shipped.
       */
      renderer.getSize(canvasSize)
      // WebGL measures from the BOTTOM-left; the page measures from the top.
      const y = canvasSize.y - rect.y - rect.height

      camera.aspect = rect.width / rect.height
      camera.updateProjectionMatrix()

      /*
       * DO NOT CLEAR. The world was drawn a moment ago and is what belongs
       * behind the guest; clearing would paint a rectangle of nothing over
       * her island and put the box back.
       */
      const wasAutoClear = renderer.autoClear
      renderer.autoClear = false
      renderer.setScissorTest(true)
      renderer.setViewport(rect.x, y, rect.width, rect.height)
      renderer.setScissor(rect.x, y, rect.width, rect.height)
      renderer.render(scene, camera)
      renderer.autoClear = wasAutoClear

      // Hand the whole canvas back, in the same units, or the next world
      // frame draws into this corner.
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, canvasSize.x, canvasSize.y)
      renderer.setScissor(0, 0, canvasSize.x, canvasSize.y)
    },

    dispose() {
      if (temp) { temp.removeFromParent(); temp = null }
      if (guest && guestHome) { guestHome.add(guest); guest.position.copy(guestAt) }
      sparks.traverse(o => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
    },
  }
}
