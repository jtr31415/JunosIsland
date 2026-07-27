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

/**
 * Seconds per revolution, from balance.json.
 *
 * §8: "All constants live in balance.json; nothing hardcoded." This one was,
 * and the schema already had a slot waiting for it.
 */
const TURN_SECONDS = balance.stage.spinSec

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
   * A burst of sparks on the turntable.
   *
   * The shell breaking, seen where she has been watching it (§3, §6). Lives
   * on the stage rather than in the world because that is where her attention
   * has been for the last five pages — the whole point of the ceremony is
   * that it happens on the thing she was working toward, not somewhere else.
   */
  burst(): void
  /** Frame the turntable for an object of roughly this size. */
  frame(radius: number): void
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
  lighting.attach(scene)

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
   * A small plinth, so the piece stands on something rather than floating.
   *
   * SIZED TO THE GUEST, in frame(). At a fixed radius it was built for a hex,
   * and under an egg — a third the width — it filled the lower half of the
   * vignette and read as a beige desert the egg happened to be sitting in.
   */
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1.08, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x66b83f, metalness: 0, roughness: 1 }),
  )
  turntable.add(plinth)

  /*
   * A patch of ground under everything.
   *
   * Without one the sky dome's LOWER hemisphere fills the bottom of the
   * vignette — in the world the sea covers that, and the stage has no sea, so
   * the first version framed the egg against a beige desert. Grass, in the
   * Summer atlas's own green, so the turntable reads as a corner of her
   * island lifted up for a closer look.
   *
   * Outside the turntable, so it does not spin: rotating ground is a
   * fairground ride, and this is meant to be somewhere she recognises.
   */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshStandardMaterial({ color: 0x59a43c, metalness: 0, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.08
  scene.add(ground)

  /*
   * The hatch burst, built once and replayed. Building it on demand would
   * allocate geometry in the middle of the one moment that must not stutter.
   */
  const sparks = new THREE.Group()
  sparks.visible = false
  const SPARKS = 14
  for (let i = 0; i < SPARKS; i++) {
    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 6, 5),
      new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0xfff2a8 : i % 3 === 1 ? 0xffd166 : 0xffffff,
        metalness: 0, roughness: 1, transparent: true,
      }),
    )
    spark.userData.dir = new THREE.Vector3(
      Math.cos((i / SPARKS) * Math.PI * 2),
      0.55 + (i % 4) * 0.28,
      Math.sin((i / SPARKS) * Math.PI * 2),
    ).normalize()
    sparks.add(spark)
  }
  scene.add(sparks)
  /** 0..1 through the burst, or -1 when it is not playing. */
  let burstT = -1

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

    release() {
      if (guest) guest.removeFromParent()
      guest = null
      guestHome = null
    },

    holds: object => !!object && guest === object,

    burst() {
      burstT = 0
      sparks.visible = true
    },

    frame(radius) {
      // A saucer just wider than the piece, never a landscape of its own.
      const disc = Math.max(0.35, radius * 1.35)
      plinth.scale.set(disc, 1, disc)
      plinth.position.y = -0.06
      // Wide enough that the horizon stays out of frame at any framing.
      ground.scale.setScalar(Math.max(24, radius * 40))

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
      camera.position.set(0, radius * 1.2, distance)
      camera.lookAt(0, radius * 0.8, 0)
    },

    update(dt, t) {
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
            const m = (spark as THREE.Mesh).material as THREE.MeshStandardMaterial
            m.opacity = 1 - burstT * burstT
            spark.scale.setScalar(1 - burstT * 0.45)
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

      renderer.setScissorTest(true)
      renderer.setViewport(rect.x, y, rect.width, rect.height)
      renderer.setScissor(rect.x, y, rect.width, rect.height)
      renderer.render(scene, camera)

      // Hand the whole canvas back, in the same units, or the next world
      // frame draws into this corner.
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, canvasSize.x, canvasSize.y)
      renderer.setScissor(0, 0, canvasSize.x, canvasSize.y)
    },

    dispose() {
      if (guest && guestHome) { guestHome.add(guest); guest.position.copy(guestAt) }
      plinth.geometry.dispose()
      ;(plinth.material as THREE.Material).dispose()
      ground.geometry.dispose()
      ;(ground.material as THREE.Material).dispose()
      sparks.traverse(o => {
        const m = o as THREE.Mesh
        if (!m.isMesh) return
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
    },
  }
}
