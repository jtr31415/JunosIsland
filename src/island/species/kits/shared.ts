/**
 * The primitives every kit builds out of.
 *
 * PB-036 phase 1 built ONE kit, so its primitives lived inside
 * `quadruped.ts`'s `buildQuadruped`. Roster §1 names six, and copying a
 * colour-mixer and a box helper five more times is how six kits quietly drift
 * into six different looks — the exact failure roster §1 forbids when it says a
 * new species "must sit beside `animal-fox` without looking like a guest".
 *
 * So this file is a MOVE, not a redesign. Every number, every comment and every
 * behaviour here came out of `quadruped.ts` unchanged; the geometry tests that
 * pin five shipped collections to fixed measurements
 * (`tests/island/species-silhouette.test.ts` and the four `species-*.test.ts`
 * collection files) are the proof, and they were green before the move and are
 * green after it with not one expectation edited.
 *
 * THE VOCABULARY IS CLOSED, and that is the point of putting it here. Boxes and
 * non-uniformly-scaled spheres, one `MeshStandardMaterial({ color, metalness:
 * 0, roughness: 1 })` per colour. `src/` contains no ConeGeometry,
 * CylinderGeometry or CapsuleGeometry anywhere and must not gain one: the
 * chunky flat Kenney read comes from boxes and lumps. A beak is a tapered box.
 */
import * as THREE from 'three'
import type { Rgb } from '../types'

/* ---------------------------------------------------------------- colour --- */

export const mix = (c: Rgb, towards: Rgb, t: number): Rgb => {
  const lerp = (a: number, b: number): number => Math.round(a + (b - a) * t)
  return (
    (lerp((c >> 16) & 255, (towards >> 16) & 255) << 16) |
    (lerp((c >> 8) & 255, (towards >> 8) & 255) << 8) |
    lerp(c & 255, towards & 255)
  )
}
export const lighter = (c: Rgb, t: number): Rgb => mix(c, 0xffffff, t)
export const darker = (c: Rgb, t: number): Rgb => mix(c, 0x000000, t)

/* ------------------------------------------------------------ primitives --- */

/** The three ways a kit puts matter on the screen. */
export interface Parts {
  /** The one material for this colour, in this build. */
  mat(colour: number): THREE.MeshStandardMaterial
  /** A box. */
  box(name: string, w: number, h: number, d: number, colour: number): THREE.Mesh
  /** A rounded lump. */
  lump(name: string, w: number, h: number, d: number, colour: number): THREE.Mesh
}

/**
 * A fresh set of primitives for ONE built creature.
 *
 * Per-build rather than module-level on purpose: the material cache and the two
 * unit geometries are scoped to the creature that is being built, which is
 * exactly how `buildQuadruped` had them and is what keeps this a pure move. A
 * module-level cache would also be defensible, but it would be a change, and a
 * change is not what this extraction is for.
 */
export function parts(): Parts {
  /*
   * One material per colour, shared by every part that asks for it.
   *
   * Not an optimisation — it is the same reason `pets.ts` keeps one prototype:
   * a clone shares materials, so the fewer distinct materials a species has,
   * the fewer objects exist per hundred pets. Never disposed; see the kit file
   * headers.
   */
  const mats = new Map<number, THREE.MeshStandardMaterial>()
  const mat = (colour: number): THREE.MeshStandardMaterial => {
    const hit = mats.get(colour)
    if (hit) return hit
    // Identical to `fred.ts:77-78`, which is what makes `flattenImported`
    // (lighting/index.ts:297) a no-op rather than a silent material rewrite.
    const m = new THREE.MeshStandardMaterial({ color: colour, metalness: 0, roughness: 1 })
    mats.set(colour, m)
    return m
  }

  /**
   * A box. The chunky, flat-shaded read the Kenney pack has.
   *
   * One shared unit BoxGeometry scaled per part rather than a BoxGeometry per
   * part: same silhouette, one buffer. Fred can afford 30 geometries because
   * there is one of him; a species is cloned per pet.
   */
  const unitBox = new THREE.BoxGeometry(1, 1, 1)
  const unitBall = new THREE.SphereGeometry(0.5, 12, 9)

  const box = (name: string, w: number, h: number, d: number, colour: number): THREE.Mesh => {
    const m = new THREE.Mesh(unitBox, mat(colour))
    m.scale.set(w, h, d)
    m.name = name
    return m
  }
  /** A rounded lump, `fred.ts:91-95`: a sphere squashed to the given box. */
  const lump = (name: string, w: number, h: number, d: number, colour: number): THREE.Mesh => {
    const m = new THREE.Mesh(unitBall, mat(colour))
    m.scale.set(w, h, d)
    m.name = name
    return m
  }

  return { mat, box, lump }
}

/* -------------------------------------------------------------------fit --- */

/**
 * MEASURED, then fitted — never assumed.
 *
 * `pets.ts:650-660` measures the same box for the keep-out radius and the
 * shadow, so the promise a kit makes has to be true of the geometry that
 * actually got built: feet on y = 0, centred on x and z, and exactly
 * `height` tall including whatever the ears and antlers added. Computing the
 * height forward from the multipliers would drift the moment a part moved.
 *
 * The fit is applied to `rig`, NOT to the returned group, because
 * `pets.ts:643` overwrites the returned group's scale with 0.16.
 *
 * NOTE FOR EVERY KIT AFTER THE FIRST: the fit is UNIFORM and solves for
 * `height`, so a part that raises the raw silhouette LOWERS the fit scale and a
 * proportion that lowers it RAISES the scale. Dropping `legs` to make a long
 * low animal stretches it in world units and costs keep-out radius — see the
 * block at `quadruped.ts:112-136`, where three collections measured it
 * independently. Length is charged for on the way out, not on the way in.
 */
export function fitRig(rig: THREE.Group, height: number): void {
  rig.updateMatrixWorld(true)
  const bounds = new THREE.Box3().setFromObject(rig)
  const raw = bounds.max.y - bounds.min.y
  const fit = raw > 1e-6 ? height / raw : 1
  rig.scale.setScalar(fit)
  rig.position.set(
    -((bounds.min.x + bounds.max.x) / 2) * fit,
    -bounds.min.y * fit,
    -((bounds.min.z + bounds.max.z) / 2) * fit,
  )
}
