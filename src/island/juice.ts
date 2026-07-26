/**
 * Scene furniture that is not lighting: the sea, and blob shadows.
 *
 * Lighting, sky and fog all moved to lighting/ when the lighting brief landed.
 * Nothing outside that module may create a light or set a fog — see its header
 * for why the rig is exactly three lights.
 */
import * as THREE from 'three'

/**
 * The sea: a big soft plane the island sits in. Not a simulation — a mood.
 * It bobs very slightly so the world is never completely still.
 */
export function createSea(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(400, 400, 1, 1)
  const mat = new THREE.MeshStandardMaterial({ color: 0x4fb8e8, metalness: 0, roughness: 1 })
  const sea = new THREE.Mesh(geo, mat)
  sea.rotation.x = -Math.PI / 2
  sea.position.y = -0.34
  sea.name = 'sea'
  return sea
}

/**
 * How far a blob floats above the ground it is cast on.
 *
 * A shadow drawn exactly ON the tile surface is coplanar with it, and coplanar
 * geometry z-fights: the two surfaces trade places pixel by pixel as the camera
 * moves, which shows up as the shadow flickering and tearing along the ground.
 * A hair's clearance plus a polygon offset settles it for good.
 */
export const SHADOW_LIFT = 0.02

/**
 * A soft dark ellipse cast BY a character ON the ground.
 *
 * Note "on the ground": a blob shadow is not part of the body, and the single
 * most common way to get one wrong is to parent it to the thing it belongs to.
 * Then it rises when the body hops — and since the ground is solid, a shadow
 * that rises sinks straight through the tile on the way back down. Real
 * shadows stay put and change SIZE with height, which is what castShadow does.
 */
export function createBlobShadow(radius = 0.42): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 20)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x123044, transparent: true, opacity: 0.22, depthWrite: false,
    // Belt and braces with SHADOW_LIFT: the offset biases the depth test
    // toward the camera, so a blob on a slightly uneven tile still wins.
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
  })
  const blob = new THREE.Mesh(geo, mat)
  blob.rotation.x = -Math.PI / 2
  blob.position.y = SHADOW_LIFT
  blob.renderOrder = 1
  blob.name = 'blobShadow'
  blob.userData.baseOpacity = 0.22
  return blob
}

/**
 * Put a blob under a body that is `height` above the ground, in the blob's own
 * coordinate space.
 *
 * Higher means smaller and fainter, which is the whole reason a bobbing pet
 * needs one: the shadow shrinking as it rises is what sells the hop as a hop
 * rather than a glide. The falloff is deliberately gentle — these are hops of
 * a fifth of a unit, and a shadow that vanished at that height would flicker.
 */
export function castShadow(blob: THREE.Mesh, height: number): void {
  const k = 1 / (1 + Math.max(0, height) * 1.6)
  // The circle is rotated flat, so its local x/y are the ground plane.
  blob.scale.set(k, k, 1)
  const mat = blob.material as THREE.MeshBasicMaterial
  mat.opacity = (blob.userData.baseOpacity as number) * (0.4 + 0.6 * k)
}
