/**
 * What a tap hit, and which of several answers wins.
 *
 * Extracted out of `scene.ts` for the usual reason: `scene.ts` cannot be
 * instantiated without a GL context, so the *ordering* rule — the part that
 * actually decides what a child's finger did — was the one part of picking no
 * test could reach. Raycasting itself is pure CPU maths, so everything here
 * runs headlessly against the real meshes and the real `THREE.Raycaster`,
 * rather than against a mock that agrees with whatever it is told.
 */
import * as THREE from 'three'
import type { Axial } from './world/hex'

export type Hit =
  | { kind: 'tile'; axial: Axial }
  | { kind: 'socket'; axial: Axial }
  | { kind: 'pet'; id: string }
  | { kind: 'egg' }
  | { kind: 'fred' }
  | { kind: 'sea' }

export interface PickTargets {
  /** The ghost hexes offering places to build. Consulted only while shown. */
  sockets: THREE.Object3D
  socketAt(instanceId: number): Axial | undefined
  /** Things that stand up off the ground: pets, the egg, Fred. */
  pickables: THREE.Object3D[]
  /** The island itself. */
  tiles: THREE.Object3D
  tileAt(kind: string, instanceId: number): Axial | undefined
}

/**
 * Is this object actually on screen?
 *
 * `THREE.Raycaster` does NOT skip hidden objects — `Mesh.raycast` never looks
 * at `visible`, and neither does the traversal around it. So an egg that has
 * not washed ashore yet, or one hidden mid-hatch, is still sitting there
 * catching taps for the tile underneath it. Anything given precedence has to
 * be checked, or the precedence is handed to something nobody can see.
 */
export function isShowing(o: THREE.Object3D | null): boolean {
  for (let n: THREE.Object3D | null = o; n; n = n.parent) if (!n.visible) return false
  return true
}

interface Candidate { hit: Hit; distance: number }

/** The nearest pet, egg or Fred under the ray — skipping anything hidden. */
function nearestPickable(ray: THREE.Raycaster, pickables: THREE.Object3D[]): Candidate | null {
  // intersectObjects returns them sorted, nearest first.
  for (const h of ray.intersectObjects(pickables, true)) {
    if (!isShowing(h.object)) continue
    let o: THREE.Object3D | null = h.object
    while (o && !o.userData.pick) o = o.parent
    if (o?.userData.pick) return { hit: o.userData.pick as Hit, distance: h.distance }
  }
  return null
}

/** The nearest buildable socket under the ray. */
function nearestSocket(ray: THREE.Raycaster, t: PickTargets): Candidate | null {
  if (!isShowing(t.sockets)) return null
  for (const h of ray.intersectObjects(t.sockets.children, false)) {
    if (h.instanceId === undefined) continue
    const a = t.socketAt(h.instanceId)
    if (a) return { hit: { kind: 'socket', axial: a }, distance: h.distance }
  }
  return null
}

/** The nearest real tile under the ray. */
function nearestTile(ray: THREE.Raycaster, t: PickTargets): Candidate | null {
  for (const h of ray.intersectObjects(t.tiles.children, false)) {
    if (h.instanceId === undefined) continue
    const kind = (h.object as THREE.InstancedMesh).userData.tileType as string
    const a = t.tileAt(kind, h.instanceId)
    if (a) return { hit: { kind: 'tile', axial: a }, distance: h.distance }
  }
  return null
}

/**
 * Resolve one tap.
 *
 * The precedence, and why:
 *
 * 1. **Sockets outrank the GROUND.** While she is placing, an invitation
 *    outranks the tile it is drawn over — a ghost hex you cannot tap is not an
 *    invitation, it is decoration.
 *
 * 2. **But not something standing in FRONT of them.** Joe: "when the island is
 *    rotated in a way that the egg is in front of an empty tile, the empty tile
 *    selection fires when tapping the egg. i think the egg can always be in the
 *    foreground, clickablility wise."
 *
 *    Sockets used to win outright, so an egg drawn over a socket was a lie: she
 *    tapped an egg and the island offered to put a tile behind it. The egg is
 *    the one thing on the island she is always meant to be able to reach.
 *
 *    So a socket only outranks a pickable that is BEHIND it. That is stricter
 *    than "the egg always wins" and better for the same reason: it answers with
 *    whatever is actually nearest the camera, which is whatever she can see and
 *    therefore whatever she aimed at. If a socket really is in front, tapping
 *    where it is drawn still offers the socket.
 *
 * 3. Then the island itself, then the sea.
 */
export function pickFrom(ray: THREE.Raycaster, t: PickTargets): Hit {
  const near = nearestPickable(ray, t.pickables)
  const socket = nearestSocket(ray, t)

  if (socket && (!near || socket.distance <= near.distance)) return socket.hit
  if (near) return near.hit

  const tile = nearestTile(ray, t)
  if (tile) return tile.hit

  return { kind: 'sea' }
}
