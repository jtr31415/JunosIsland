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

/** A soft dark ellipse under a character, standing in for a shadow map. */
export function createBlobShadow(radius = 0.42): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 20)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x123044, transparent: true, opacity: 0.22, depthWrite: false,
  })
  const blob = new THREE.Mesh(geo, mat)
  blob.rotation.x = -Math.PI / 2
  blob.renderOrder = 1
  blob.name = 'blobShadow'
  return blob
}
