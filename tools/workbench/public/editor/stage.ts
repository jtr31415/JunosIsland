/**
 * JOE_WORKBENCH_ONLY — the editor's viewport.
 *
 * ## The one thing to hold on to
 *
 * **This module never edits geometry.** It renders a `CreatureDef` by handing it
 * to the game's own `creatureSpec` + `buildAssembly`, and when Joe drags a gizmo
 * it converts that drag into NUMBERS FOR THE DEFINITION and hands them back to
 * `main.ts`, which writes them with `def.ts` and asks for a rebuild. So a drag is
 * a round trip through the deterministic builder every time. If you ever find
 * yourself keeping the dragged mesh and writing its vertices out, stop: the
 * whole point is that a later builder improvement lifts every animal Joe has
 * made, and it can only do that if his edits are definitions.
 *
 * ## Size
 *
 * `SHARED_SCALE` is the viewer's, restated here from the same measured constant
 * and for the same reason (`60666d2`): a view that divides each model by its own
 * height invents a 1.38x swing in apparent body size, which is what made Joe
 * report the animals as too big. One divisor, everywhere, never per-model. The
 * camera is framed from a FIXED radius for the same reason — framing on the
 * model's own bounds is per-model normalisation wearing a different hat.
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'

import { buildAssembly, creatureSpec } from '../../../../src/island/species/parts'
import type { CreatureDef } from '../../../../src/island/species/parts'
import type { Spin, Vec3 } from '../../../../src/island/species/parts/assembly'
import { explodeOffset } from '../anatomy'
import { pathFromUserData, pathKey, round6, type DefPath } from './def'

/** The measured median height of the 24 originals. See `viewer.ts:301`. */
const PACK_HEIGHT_MEDIAN = 1.611185
const SHARED_SCALE = 1 / PACK_HEIGHT_MEDIAN

/** A fixed frame. Never the model's own bounds — that is normalisation. */
const FRAME_RADIUS = 1.15

export type GizmoMode = 'translate' | 'rotate' | 'scale'

/** What a finished drag means for the definition. One of the three ops. */
export type Gesture =
  | { kind: 'move'; path: DefPath; at: Vec3 }
  | { kind: 'rotate'; path: DefPath; spin: Spin[]; anchor: Vec3 | undefined }
  | { kind: 'resize'; path: DefPath; stretch: Vec3 }

export interface Stage {
  /** Rebuild from a definition. Returns the builder's error rather than throwing. */
  show(speciesId: string, def: CreatureDef): { ok: true } | { ok: false; error: string }
  /** Highlight a slot and put the gizmo on it. `null` clears. */
  select(path: DefPath | null): void
  setMode(mode: GizmoMode): void
  setSnap(on: boolean): void
  setExplode(on: boolean): void
  /** Which mesh names a slot produced — for the part list's `4 meshes` tag. */
  meshCount(path: DefPath): number
  dispose(): void
}

export interface StageHooks {
  /** A click on the canvas. `null` means the click hit nothing editable. */
  onPick(path: DefPath | null): void
  /** A gizmo drag finished. `main.ts` writes it and calls `show` again. */
  onGesture(gesture: Gesture): void
  /** Something the person should read — the gizmo declining, mostly. */
  onSay(text: string, bad?: boolean): void
}

/* ---------------------------------------------------- a drag, as arithmetic */

/** Round every component to the snap step, or just to the bank's six decimals. */
const quantise = (v: Vec3, step: number): Vec3 =>
  step > 0
    ? [round6(Math.round(v[0] / step) * step), round6(Math.round(v[1] / step) * step), round6(Math.round(v[2] / step) * step)]
    : [round6(v[0]), round6(v[1]), round6(v[2])]

/**
 * What a finished translate means for the definition — the whole sum, in one
 * place with no WebGL under it, so it can be measured rather than trusted.
 *
 * ## `from` and `to` are ALREADY in definition units. Do not divide them.
 *
 * `TransformControls` converts a drag into the object's PARENT space before it
 * ever writes `object.position`: it divides the world-space offset by the
 * parent's world scale — `three/examples/jsm/controls/TransformControls.js:561`
 * for the world-space axes, `:557` for the local ones, both
 * `.divide( this._parentScale )` — and adds `_positionStart` at `:565`.
 * `_parentScale` is decomposed from `object.parent.matrixWorld` at `:1139`, so
 * it INCLUDES the `SHARED_SCALE` that `show` puts on the built group. The
 * conversion has already happened.
 *
 * Dividing by `SHARED_SCALE` a second time here is what made Joe's parts "snap
 * to a location even though snap is off". It pushed every translate 1/0.6207 =
 * 1.611x past the cursor, and for the hull — whose base is an ABSOLUTE position
 * rather than a delta — one nudge wrote `1.611 * at + 1.611 * delta`, a fixed
 * repeatable destination. The eyes escaped it because `def.ts`'s `setJoin` keeps
 * only x and y of an eye drag and `creature.ts` pins z to `EYE_CARD_Z`, so the
 * same error only slid the card along the face plane, where nobody saw it.
 *
 * Two places nearby DO scale, correctly and in opposite directions, and are not
 * this: `applyExplode` divides a WORLD push to get a local offset, and
 * `setSnap` multiplies a definition-unit step because `translationSnap` really
 * is measured in world units (`TransformControls.js:597` snaps the world
 * position). Their existence is not a reason to scale here.
 *
 * ## Deltas, not centres
 *
 * The gizmo moves the mesh's CENTRE, while the definition holds the JOIN point a
 * measured `shift` away along the part's facing. So everything works in DELTAS
 * off `joinedAt`, where the shift cancels exactly. The hull is the exception:
 * `hull.at` really is a centre, and `assembly.ts:549` writes it straight onto
 * the mesh, which is why its base is the mesh's own start position.
 */
export function joinFromDrag(drag: {
  /** `handle.position` when the drag began, in DEFINITION units. */
  from: Vec3
  /** `handle.position` now, in DEFINITION units. */
  to: Vec3
  /** True for the hull alone: its `at` is an absolute centre, not a join point. */
  absolute: boolean
  /** `userData.joinedAt` — where the build joined this part to the mass. */
  joinedAt: Vec3 | undefined
  /** The `-l` copy of a pair. `setJoin` wants the +x one, so the answer flips. */
  mirror: boolean
  /** The snap step in DEFINITION units, or 0 when snap is off. */
  step: number
}): Vec3 {
  const delta: Vec3 = [
    drag.to[0] - drag.from[0], drag.to[1] - drag.from[1], drag.to[2] - drag.from[2],
  ]
  const base: Vec3 = drag.absolute ? drag.from : (drag.joinedAt ?? [0, 0, 0])
  const at: Vec3 = [base[0] + delta[0], base[1] + delta[1], base[2] + delta[2]]
  return quantise(drag.mirror ? [-at[0], at[1], at[2]] : at, drag.step)
}

export function createStage(canvas: HTMLCanvasElement, hooks: StageHooks): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2b2b2b)
  /*
   * Plain lights rather than the game's `createLighting`. The editor is a
   * measuring tool: a hemisphere plus one directional reads every face of every
   * part evenly, and a shadowed preset hides the very geometry Joe is judging.
   * The galleries are where an animal is seen in its own light.
   */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404048, 1.15))
  const sun = new THREE.DirectionalLight(0xffffff, 1.1)
  sun.position.set(2.4, 3.2, 2.0)
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200)
  camera.position.set(1.9, 1.35, 2.6)

  const orbit = new OrbitControls(camera, canvas)
  orbit.enableDamping = true
  orbit.dampingFactor = 0.08
  orbit.target.set(0, 0.45, 0)

  const gizmo = new TransformControls(camera, canvas)
  /*
   * three moved the gizmo's drawable to a separate helper object some versions
   * back; adding the controls themselves puts nothing in the scene on 0.185.
   */
  const helper = (gizmo as unknown as { getHelper?: () => THREE.Object3D }).getHelper?.()
  scene.add(helper ?? (gizmo as unknown as THREE.Object3D))
  gizmo.setSize(0.7)

  /* The animal, at shared scale, inside a holder that never itself moves. */
  const stand = new THREE.Group()
  scene.add(stand)

  const grid = new THREE.GridHelper(4, 16, 0x3a3a40, 0x2f2f34)
  grid.position.y = -0.001
  scene.add(grid)

  let built: THREE.Group | null = null
  let currentDef: CreatureDef | null = null
  let selected: DefPath | null = null
  let snap = true
  let exploded = false
  let dragging = false

  /* Every mesh the last build produced, grouped by the slot that made it. */
  const bySlot = new Map<string, THREE.Mesh[]>()
  /* The mesh the gizmo is actually attached to, and its state when the drag began. */
  let handle: THREE.Mesh | null = null
  let before: { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 } | null = null

  const highlight = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x7fb2ff, wireframe: true, transparent: true, opacity: 0.55 }),
  )
  highlight.visible = false
  highlight.renderOrder = 2
  scene.add(highlight)

  /* --------------------------------------------------------------- building */

  function show(speciesId: string, def: CreatureDef): { ok: true } | { ok: false; error: string } {
    let group: THREE.Group
    try {
      group = buildAssembly(creatureSpec(speciesId, def))
    } catch (error) {
      /*
       * The builder throwing is a REAL answer, not a crash: it is how an
       * unexpressible animal says so (an oversized hull, a part that is not in
       * the bank). Keep the last good model on screen and report the sentence,
       * because a blank canvas teaches nothing about which gesture was refused.
       */
      return { ok: false, error: error instanceof Error ? error.message : String(error) }
    }

    if (built) {
      stand.remove(built)
      built.traverse(node => {
        const mesh = node as THREE.Mesh
        if (mesh.isMesh) mesh.geometry.dispose()
      })
    }
    /*
     * The MATERIAL is never disposed. Every species of a set shares one, the
     * set's textures are cached and detached deliberately, and disposing one
     * breaks every pet of that set including ones Juno already owns.
     */

    group.scale.multiplyScalar(SHARED_SCALE)
    group.position.multiplyScalar(SHARED_SCALE)
    stand.add(group)
    built = group
    currentDef = def

    bySlot.clear()
    group.traverse(node => {
      const mesh = node as THREE.Mesh
      if (!mesh.isMesh) return
      const path = pathFromUserData({ ...mesh.userData, name: mesh.name }, def)
      if (!path) return
      const key = pathKey(path)
      const list = bySlot.get(key)
      if (list) list.push(mesh)
      else bySlot.set(key, [mesh])
    })

    /* Re-attach to the same slot, on the mesh that now stands for it. */
    select(selected)
    applyExplode()
    return { ok: true }
  }

  /* ------------------------------------------------------------- selection */

  function representative(path: DefPath): THREE.Mesh | null {
    const list = bySlot.get(pathKey(path))
    if (!list || list.length === 0) return null
    /*
     * The +x copy of a pair, when there is one. Dragging the unmirrored copy
     * means `setJoin` takes the numbers as written — for the `-l` mesh they must
     * be negated on x first, and one less negation is one less place to be wrong.
     */
    return list.find(m => m.userData['mirror'] !== true) ?? list[0]!
  }

  function select(path: DefPath | null): void {
    selected = path
    handle = path ? representative(path) : null
    if (!handle) {
      gizmo.detach()
      highlight.visible = false
      return
    }
    gizmo.attach(handle)
    applyMode()
    frameHighlight()
  }

  function frameHighlight(): void {
    if (!handle) { highlight.visible = false; return }
    handle.geometry.computeBoundingBox()
    const box = handle.geometry.boundingBox!
    const size = box.getSize(new THREE.Vector3())
    const centre = box.getCenter(new THREE.Vector3())
    highlight.scale.set(Math.max(size.x, 1e-3) * 1.12, Math.max(size.y, 1e-3) * 1.12, Math.max(size.z, 1e-3) * 1.12)
    handle.updateMatrixWorld(true)
    highlight.position.copy(centre).applyMatrix4(handle.matrixWorld)
    highlight.quaternion.copy(handle.getWorldQuaternion(new THREE.Quaternion()))
    highlight.visible = true
  }

  const ray = new THREE.Raycaster()
  canvas.addEventListener('pointerdown', event => {
    if (dragging || (gizmo as unknown as { dragging: boolean }).dragging) return
    if (event.button !== 0 || !built) return
    const rect = canvas.getBoundingClientRect()
    const point = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    )
    ray.setFromCamera(point, camera)
    const hits = ray.intersectObject(built, true)
    for (const hit of hits) {
      const mesh = hit.object as THREE.Mesh
      if (!mesh.isMesh) continue
      hooks.onPick(pathFromUserData({ ...mesh.userData, name: mesh.name }, currentDef ?? undefined))
      return
    }
    hooks.onPick(null)
  })

  /* ----------------------------------------------------------- the gestures */

  function applyMode(): void {
    if (!handle || !selected) return
    if (mode === 'scale' && !canResize(selected)) {
      /*
       * The hull is its shell's own size on every animal — `b5afc00` made an
       * oversized hull unexpressible in the type and `setStretch` no-ops on it.
       * A gizmo that moves and then snaps back teaches that the dial exists, so
       * do not offer it at all.
       */
      gizmo.setMode('translate')
      hooks.onSay(`${pathKey(selected)} has no size of its own — pick one of the ten shells instead`)
      return
    }
    gizmo.setMode(mode)
  }

  const canResize = (path: DefPath): boolean =>
    path.role !== 'hull' && path.role !== 'legs' && path.role !== 'eyes' && path.role !== 'ridge'

  let mode: GizmoMode = 'translate'

  gizmo.addEventListener('dragging-changed', event => {
    const on = (event as unknown as { value: boolean }).value
    orbit.enabled = !on
    dragging = on
    if (on) {
      before = handle
        ? {
            position: handle.position.clone(),
            quaternion: handle.quaternion.clone(),
            scale: handle.scale.clone(),
          }
        : null
      return
    }
    commit()
  })

  gizmo.addEventListener('objectChange', frameHighlight)

  function commit(): void {
    if (!handle || !selected || !before) return
    const path = selected
    const u = handle.userData as Record<string, unknown>

    if (mode === 'translate') {
      /*
       * `handle.position` is in DEFINITION units on both ends — three has already
       * divided the drag by the parent's world scale, `SHARED_SCALE` included,
       * before writing it (`TransformControls.js:561`, `:565`). `joinFromDrag`
       * carries the whole argument; do not reintroduce a divisor here.
       */
      const at = joinFromDrag({
        from: [before.position.x, before.position.y, before.position.z],
        to: [handle.position.x, handle.position.y, handle.position.z],
        absolute: path.role === 'hull',
        joinedAt: u['joinedAt'] as Vec3 | undefined,
        mirror: u['mirror'] === true,
        step: snap ? 0.0125 : 0,
      })

      /*
       * Two slots keep only PART of a drag — `setJoin` in `def.ts` says which —
       * and a gizmo that moves and then reverts without a word is how a person
       * learns to distrust the tool. The ridge keeps nothing at all, so put its
       * spike back here and say so, rather than leave it sitting where the gizmo
       * dropped it until some later rebuild jumps it home.
       */
      if (path.role === 'ridge') {
        handle.position.copy(before.position)
        frameHighlight()
        hooks.onSay('the ridge has no join point — its rows are solved off the hull’s own faces', true)
        return
      }
      const liftedY = Math.abs(handle.position.y - before.position.y) > 1e-6
      /* `show` rebuilds inside this call and `handle` becomes a new mesh — so the
       * measurement above is taken first, and the notice goes AFTER, or the
       * editor's own "moved legs" would write over it. */
      hooks.onGesture({ kind: 'move', path, at })
      if (path.role === 'legs' && liftedY) {
        hooks.onSay('legs stand on the ground — the up-down of that drag was dropped, only across and along were kept', true)
      }
      return
    }

    if (mode === 'rotate') {
      /*
       * The geometry is built PRE-SPUN — `geom()` turns the vertices, so a built
       * mesh always arrives at identity. Whatever the gizmo put on it is
       * therefore a turn to APPEND to the part's spin list, in that order,
       * because it is applied after the baked ones.
       */
      const turn = before.quaternion.clone().invert().premultiply(handle.quaternion)
      const euler = new THREE.Euler().setFromQuaternion(turn, 'XYZ')
      const deg = (r: number): number => {
        const d = (r * 180) / Math.PI
        return snap ? Math.round(d / 90) * 90 : Math.round(d * 10) / 10
      }
      const spin: Spin[] = ([['x', euler.x], ['y', euler.y], ['z', euler.z]] as const)
        .map(([axis, r]) => ({ axis, deg: deg(r) }))
        .filter(s => s.deg !== 0)
      if (spin.length === 0) { hooks.onSay('no turn to record'); return }
      hooks.onGesture({ kind: 'rotate', path, spin, anchor: u['joinedAt'] as Vec3 | undefined })
      return
    }

    const was = (u['stretch'] as Vec3 | undefined) ?? [1, 1, 1]
    const stretch: Vec3 = quantise([
      was[0] * (handle.scale.x / before.scale.x),
      was[1] * (handle.scale.y / before.scale.y),
      was[2] * (handle.scale.z / before.scale.z),
    ], 0.01)
    hooks.onGesture({ kind: 'resize', path, stretch })
  }

  /* --------------------------------------------------------------- explode */

  function applyExplode(): void {
    if (!built) return
    const box = new THREE.Box3().setFromObject(built)
    const centre = box.getCenter(new THREE.Vector3())
    for (const list of bySlot.values()) {
      for (const mesh of list) {
        const home = (mesh.userData['home'] as THREE.Vector3 | undefined) ?? mesh.position.clone()
        mesh.userData['home'] = home
        if (!exploded) { mesh.position.copy(home); continue }
        mesh.updateMatrixWorld(true)
        const world = mesh.getWorldPosition(new THREE.Vector3())
        const push = explodeOffset(
          [world.x, world.y, world.z], [centre.x, centre.y, centre.z], 0.35, 1,
        )
        mesh.position.set(home.x + push[0] / SHARED_SCALE, home.y + push[1] / SHARED_SCALE, home.z + push[2] / SHARED_SCALE)
      }
    }
    frameHighlight()
  }

  /* ------------------------------------------------------------ the frame */

  function resize(): void {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }
  new ResizeObserver(resize).observe(canvas)
  resize()

  /* A fixed distance, from a stated radius. Never from the model's own bounds. */
  const fitted = FRAME_RADIUS / Math.sin((camera.fov * Math.PI) / 360)
  camera.position.setLength(fitted)

  renderer.setAnimationLoop(() => {
    orbit.update()
    renderer.render(scene, camera)
  })

  return {
    show,
    select,
    setMode(next) { mode = next; applyMode() },
    setSnap(on) {
      snap = on
      gizmo.translationSnap = on ? 0.0125 * SHARED_SCALE : null
      gizmo.rotationSnap = on ? Math.PI / 2 : null
      gizmo.scaleSnap = on ? 0.05 : null
    },
    setExplode(on) { exploded = on; applyExplode() },
    meshCount(path) { return bySlot.get(pathKey(path))?.length ?? 0 },
    dispose() { renderer.setAnimationLoop(null); gizmo.dispose(); orbit.dispose(); renderer.dispose() },
  }
}
