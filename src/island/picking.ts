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
  /**
   * The half-built plot. Its own kind rather than a `socket`, because it is not
   * one: `scene.setIsland` deliberately removes the socket outline underneath a
   * standing plot (#19 — the outline and the plot clipped through one another),
   * so nothing else answers for that hex and a tap there used to fall through to
   * the sea. Tapping it is how she changes her mind about what she is building.
   */
  | { kind: 'plot' }
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
  /** The growing plot, while one stands. */
  plot?: THREE.Object3D | null
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
 *
 * **The corollary, and it has teeth: a thing that is meant to be UNSEEN but
 * TAPPABLE cannot use `visible`.** Each pet carries an invisible sphere so a
 * six-year-old's finger has something to hit (`pets.ts`, `pickProxy`), and
 * hiding it the obvious way would make this function skip it — the fix would
 * do nothing, quietly, with every test still green. Such a proxy stays
 * `visible` and draws nothing, via `colorWrite`/`depthWrite`/`opacity`.
 */
export function isShowing(o: THREE.Object3D | null): boolean {
  for (let n: THREE.Object3D | null = o; n; n = n.parent) if (!n.visible) return false
  return true
}

interface Candidate { hit: Hit; distance: number }

/** The nearest pet, egg or Fred under the ray — skipping anything hidden. */
function nearestPickable(ray: THREE.Raycaster, pickables: THREE.Object3D[]): Candidate | null {
  /**
   * Anything she can SEE outranks a proxy, however near the proxy is.
   *
   * "Nearest the camera" is the right rule between objects, because whatever
   * is nearest is what she is looking at and therefore what she aimed for. It
   * is the wrong rule the moment one of them is invisible: every pet carries a
   * finger-wide sphere so a six-year-old can hit it (`pets.ts`, `pickProxy`),
   * and a pet standing beside the egg puts that sphere in front of the egg's
   * rim. Nearest-wins hands her a bouncing pet where she tapped an egg — and
   * the egg is the one thing she is always meant to be able to reach.
   *
   * It got worse, not better, when the proxy learned to hold its size on
   * screen: at the camera's 26-unit pull-back a finger is 1.7 world units
   * across, which is wider than the whole egg is drawn.
   *
   * So a proxy is a FALLBACK. It answers for the pixels where nothing is
   * drawn — exactly the near-miss it exists to catch — and takes nothing off
   * anything with a surface of its own. A tap on a pet is still that pet: its
   * own body is drawn, and it is nearer than whatever stands behind it.
   */
  let proxy: Candidate | null = null
  // intersectObjects returns them sorted, nearest first.
  for (const h of ray.intersectObjects(pickables, true)) {
    if (!isShowing(h.object)) continue
    let o: THREE.Object3D | null = h.object
    while (o && !o.userData.pick) o = o.parent
    if (!o?.userData.pick) continue
    const found = { hit: o.userData.pick as Hit, distance: h.distance }
    if (h.object.userData.proxy) { proxy ??= found; continue }
    return found
  }
  return proxy
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
 * The growing plot, if the ray reaches it.
 *
 * Recursive, unlike the two above: the plot is an ordinary group of meshes that
 * grows a piece at a time, not one instanced mesh, so its children are nested
 * and arrive over the course of the build.
 */
function nearestPlot(ray: THREE.Raycaster, t: PickTargets): Candidate | null {
  if (!t.plot || !isShowing(t.plot)) return null
  const hits = ray.intersectObject(t.plot, true)
  const h = hits[0]
  return h ? { hit: { kind: 'plot' }, distance: h.distance } : null
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
 * 3. **The PLOT RANKS WITH THE SOCKETS**, nearest of the two winning.
 *
 *    It is the same sort of thing — a place rather than an object — and the two
 *    can never occupy the same hex, because `scene.setIsland` removes the socket
 *    under a standing plot. But they are neighbours, and a socket hex is a whole
 *    hex wide: from a good many camera angles one is drawn across the plot.
 *
 *    Ranking the plot BELOW sockets, which is how this was first written, meant
 *    any socket under the cursor won outright and the plot could not be tapped at
 *    all — verified in the browser, where tapping the half-built hex opened a sum
 *    instead of the chooser. Distance is the honest test here for exactly the
 *    reason it is with the egg: it answers with whatever she can actually see.
 *
 * 4. Then the island itself, then the sea.
 */
export function pickFrom(ray: THREE.Raycaster, t: PickTargets): Hit {
  const near = nearestPickable(ray, t.pickables)
  const socket = nearestSocket(ray, t)
  const plot = nearestPlot(ray, t)

  // The nearer of the two places under the ray.
  const place = socket && plot
    ? (plot.distance < socket.distance ? plot : socket)
    : (socket ?? plot)

  if (place && (!near || place.distance <= near.distance)) return place.hit
  if (near) return near.hit

  const tile = nearestTile(ray, t)
  if (tile) return tile.hit

  return { kind: 'sea' }
}
