/**
 * Scene furniture that is not lighting: the sea, and blob shadows.
 *
 * Lighting, sky and fog all moved to lighting/ when the lighting brief landed.
 * Nothing outside that module may create a light or set a fog — see its header
 * for why the rig is exactly three lights.
 */
import * as THREE from 'three'
import { sunShadow } from './lighting'

/**
 * Where the water surface sits. The KayKit water hex's top face is at -0.2 and
 * the coast ramps run down to meet it, so everything wet shares this height.
 */
export const SEA_LEVEL = -0.21

/**
 * The sea: a big soft plane the island sits in. Not a simulation — a mood.
 * It bobs very slightly so the world is never completely still.
 */
export function createSea(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(400, 400, 1, 1)
  /*
   * Bright and friendly, NOT the atlas water swatch.
   *
   * Matching the swatch (#2473b4) was tried and looked wrong for an obvious
   * reason in hindsight: on the tiles that colour is a pond, a few hexes of
   * deep water ringed by land. Stretched across the whole horizon under a
   * bright sky it turns the world navy and gloomy, which brief §1.2 rules out
   * in as many words — bright, never scary. The shoreline mismatch that
   * prompted the experiment was really the coast tiles' own water slabs, and
   * the waterless models fixed that instead.
   */
  const mat = new THREE.MeshStandardMaterial({ color: 0x4fb8e8, metalness: 0, roughness: 1 })
  const sea = new THREE.Mesh(geo, mat)
  sea.rotation.x = -Math.PI / 2
  /*
   * Just under the water hex's own surface, which sits at y = -0.2. The sand
   * ramps on the coast tiles stop at that height expecting water there, so a
   * sea at the old -0.34 left them ending in mid-air above it. A hair below
   * rather than exactly level, so the two never z-fight where they overlap.
   */
  sea.position.y = SEA_LEVEL
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

/** Reused per call, so sixty frames a second allocate nothing. */
const _sunDir = new THREE.Vector3()
const _parentSpin = new THREE.Quaternion()

/**
 * A soft radial falloff, so a blob has an EDGE like a shadow rather than like
 * a sticker (lighting brief §3, "soft radial-gradient sprite").
 *
 * One 64px texture, shared by every blob in the game and built once. Returns
 * null where there is no 2D canvas — jsdom under the test runner — and the
 * blob falls back to a flat disc, which is what it was before.
 */
let softEdge: THREE.Texture | null | undefined
function shadowFalloff(): THREE.Texture | null {
  if (softEdge !== undefined) return softEdge
  softEdge = null
  if (typeof document === 'undefined') return softEdge
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const g = c.getContext('2d')
  if (!g) return softEdge
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  // Solid through the middle, then away over the outer third: a shadow's
  // penumbra, not a vignette. A gradient that starts fading at the centre
  // makes the blob read as a smudge and stops gluing anything to the ground.
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.62, 'rgba(255,255,255,0.95)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  // CircleGeometry's UVs map the disc onto the unit square, so the gradient's
  // outer stop lands exactly on the rim.
  softEdge = new THREE.CanvasTexture(c)
  return softEdge
}

/**
 * A soft dark ellipse cast BY a character ON the ground.
 *
 * Note "on the ground": a blob shadow is not part of the body, and the single
 * most common way to get one wrong is to parent it to the thing it belongs to.
 * Then it rises when the body hops — and since the ground is solid, a shadow
 * that rises sinks straight through the tile on the way back down. Real
 * shadows stay put and change SIZE with height, which is what castShadow does.
 *
 * `bodyHeight` is how tall the thing casting it stands, in the BLOB'S OWN
 * units — measured by the caller, because a chick and an elephant do not throw
 * the same shadow. Keeping it in local units means a blob hung under a scaled
 * parent (the egg group is at 0.62) needs no correction: the parent shrinks
 * the caster and its shadow together, which is the right answer.
 */
export function createBlobShadow(radius = 0.42, bodyHeight = radius * 2): THREE.Mesh {
  const geo = new THREE.CircleGeometry(radius, 20)
  const mat = new THREE.MeshBasicMaterial({
    color: 0x123044, transparent: true, opacity: 0.22, depthWrite: false,
    // Belt and braces with SHADOW_LIFT: the offset biases the depth test
    // toward the camera, so a blob on a slightly uneven tile still wins.
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
  })
  const falloff = shadowFalloff()
  if (falloff) mat.alphaMap = falloff
  const blob = new THREE.Mesh(geo, mat)
  blob.rotation.x = -Math.PI / 2
  blob.position.y = SHADOW_LIFT
  blob.renderOrder = 1
  blob.name = 'blobShadow'
  blob.userData.baseOpacity = 0.22
  blob.userData.radius = radius
  blob.userData.bodyHeight = bodyHeight
  /*
   * Shaped once, immediately, for a body sitting on the ground.
   *
   * Not everything that owns a blob animates it — the egg's is made and then
   * left alone for the rest of the game. A shadow that only pointed the right
   * way once something moved would leave the most tapped object on the island
   * as the one thing lit from directly overhead.
   */
  castShadow(blob, 0)
  return blob
}

/**
 * Put a blob under a body that is `height` above the ground, in the blob's own
 * coordinate space, and shape it to agree with the sun.
 *
 * Three things, and the last two are the fix for Joe's note that the shadows
 * disagreed with the light:
 *
 *   - Higher means smaller and fainter. That is doctrine (§3, "scales down
 *     with hop height"), and it is what sells a hop as a hop rather than a
 *     glide. Physically a directional light would not shrink it; readability
 *     wins, and the brief says so in as many words.
 *   - It is OFFSET. A body's shadow is thrown away from the sun by
 *     cot(elevation) per unit of height — at the preset's 35° that is 1.43
 *     units of ground for every unit up. The centre of the ellipse tracks the
 *     body's MID height, so a creature standing on the ground still has a
 *     shadow reaching out from its feet rather than a disc under them.
 *   - It is STRETCHED along that same direction, because a round caster lit
 *     from 35° above casts a long ellipse, not a circle. Its far end is where
 *     the top of the body lands; its near end stays at the contact point.
 *
 * `anchorX`/`anchorZ` are where the body touches down, in the blob's parent's
 * space. They default to the origin, which is right for a blob parented to the
 * thing it belongs to.
 */
export function castShadow(
  blob: THREE.Mesh, height: number, anchorX = 0, anchorZ = 0,
): void {
  const air = Math.max(0, height)
  const k = 1 / (1 + air * 1.6)
  const mat = blob.material as THREE.MeshBasicMaterial
  const sun = sunShadow()

  if (!sun) {
    // No rig, no sun, no direction to fall in. Straight down is the honest
    // answer rather than a direction invented here (lighting §7).
    blob.rotation.set(-Math.PI / 2, 0, 0)
    blob.position.set(anchorX, SHADOW_LIFT, anchorZ)
    blob.scale.set(k, k, 1)
    mat.opacity = (blob.userData.baseOpacity as number) * (0.4 + 0.6 * k)
    return
  }

  const body = (blob.userData.bodyHeight as number) ?? 0
  const radius = (blob.userData.radius as number) || 1

  _sunDir.set(sun.x, 0, sun.z)
  /*
   * The sun's direction is a WORLD fact and the blob is positioned in its
   * parent's space. Fred's blob hangs under a group that turns to face wherever
   * he last hopped, so without this his shadow would swing round with him —
   * which is exactly the "inconsistent with a single light source" complaint,
   * only worse for being animated.
   */
  const parent = blob.parent
  if (parent) {
    parent.getWorldQuaternion(_parentSpin)
    _sunDir.applyQuaternion(_parentSpin.invert())
  }

  /*
   * The circle lies in the blob's local xy plane after the -90° x rotation, so
   * the in-plane spin is rotation.z and local +x maps to world (cos, 0, -sin).
   * Aim that axis down the sun's ground direction and the stretch lands along
   * it rather than across it.
   */
  blob.rotation.set(-Math.PI / 2, 0, Math.atan2(-_sunDir.z, _sunDir.x))

  /*
   * Semi-major reaches from the contact point to where the body's top lands,
   * which is what makes a tall thin creature throw a longer shadow than a
   * squat one under the same sun. Floored at the stretch a plain sphere would
   * get, so a low wide caster is never drawn rounder than the light allows.
   */
  const along = Math.max(sun.stretch, 1 + (body * sun.reach) / (2 * radius))
  blob.scale.set(k * along, k, 1)

  /*
   * Where the ellipse's centre lands — and it is PULLED OUT so the near edge
   * never falls on the sun side of the thing casting it.
   *
   * Joe: *"shadown needs to be pulled away from the sun, most places show it
   * staring in front of the prop. good rule may be the edge of the elipse sits
   * on the centre of the prop."*
   *
   * The mid-height projection alone is `(air + body/2) * reach`, and with a
   * semi-major of `radius + body*reach/2` that puts the near edge at
   * `air*reach - radius`. For anything on the ground that is `-radius`: the
   * ellipse reaches a whole caster-radius back toward the sun. That is
   * PHYSICALLY RIGHT — a cylinder's silhouette does extend its own radius past
   * the contact point — and it still looks wrong, because a soft blob decal is
   * read as "the dark patch belonging to that object" rather than as a
   * silhouette, and a dark patch creeping out in front of a tree reads as
   * another object. Measured on a tree (body 1.0, radius 0.3): centre 0.72
   * against a semi-major of 1.01, so 0.30 units of it sat in front.
   *
   * Joe's rule is the fix, and it is a READABILITY choice over a physical one —
   * the same bargain as shrinking a shadow with hop height, which the brief
   * already asks for in as many words (§3). Taking the MAX means it only ever
   * pulls a shadow further out, never pulls one in: a hovering bee's shadow is
   * already far beyond this floor and keeps its honest physical offset.
   */
  const semiMajor = radius * k * along
  const drop = Math.max((air + body / 2) * sun.reach, semiMajor)
  blob.position.set(anchorX + _sunDir.x * drop, SHADOW_LIFT, anchorZ + _sunDir.z * drop)

  /*
   * Fainter with height, and faster than the size falls away. A hovering pet's
   * shadow is thrown a long way from it — a bee at tree height is a metre and
   * a half from its own shadow — and at full strength that far out it reads as
   * a separate object sitting on the grass rather than as the bee's shadow.
   */
  mat.opacity = (blob.userData.baseOpacity as number) * (0.25 + 0.75 * k * k)
}
