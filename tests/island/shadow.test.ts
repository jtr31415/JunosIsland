/**
 * @vitest-environment jsdom
 *
 * Joe, playing: "drop shadow location and shape is inconsistent with single
 * point sun light source."
 *
 * It was. There are no shadow maps anywhere in this build — no
 * `renderer.shadowMap`, no `castShadow` flag on a single object — so every
 * shadow on the island is a blob decal, and every blob was a CIRCLE drawn
 * CONCENTRICALLY under its object. That is the shadow you get from a lamp
 * directly overhead. The rig's sun (lighting brief §2.2, and the only shadow
 * caster it permits) sits at 35° elevation and 40° azimuth.
 *
 * These tests pin the two properties that were missing: a shadow is thrown
 * AWAY from the sun in proportion to how high its caster is, and it is
 * STRETCHED along that same direction. Both come from the preset, so nothing
 * here hardcodes a light — which is itself a lighting-brief §7 sin.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import * as THREE from 'three'
import { createLighting, sunShadow } from '../../src/island/lighting'
import type { LightingPreset } from '../../src/island/lighting'
import { createBlobShadow, castShadow, SHADOW_LIFT } from '../../src/island/juice'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'

const MEADOW = meadowDay as LightingPreset

/** A preset that differs only in where the sun is. */
const sunAt = (elevation: number, azimuth: number): LightingPreset =>
  ({ ...MEADOW, sun: { ...MEADOW.sun, elevation, azimuth } })

/** Where the sun itself sits on the horizon ring, per the rig's own maths. */
const sunBearing = (azimuthDeg: number): { x: number; z: number } => {
  const az = (azimuthDeg * Math.PI) / 180
  return { x: Math.sin(az), z: Math.cos(az) }
}

describe('sunShadow — one sun, one answer', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('throws the shadow AWAY from the sun', () => {
    const s = sunShadow()
    expect(s).not.toBeNull()
    const sun = sunBearing(MEADOW.sun.azimuth)
    // Directly opposite: the dot product of two opposed unit vectors is -1.
    expect((s as NonNullable<typeof s>).x * sun.x
      + (s as NonNullable<typeof s>).z * sun.z).toBeCloseTo(-1, 6)
  })

  it('reaches cot(elevation) of ground per unit of height', () => {
    // The preset's 35° sun: 1.428 units of ground for every unit up.
    expect((sunShadow() as { reach: number }).reach)
      .toBeCloseTo(1 / Math.tan((35 * Math.PI) / 180), 6)
  })

  it('stretches a round caster by 1/sin(elevation)', () => {
    expect((sunShadow() as { stretch: number }).stretch)
      .toBeCloseTo(1 / Math.sin((35 * Math.PI) / 180), 6)
  })

  it('follows the preset rather than a number written here', () => {
    createLighting(null, sunAt(35, 220))
    const s = sunShadow() as { x: number; z: number }
    const sun = sunBearing(220)
    expect(s.x * sun.x + s.z * sun.z).toBeCloseTo(-1, 6)
  })

  it('floors the elevation, so a low sun cannot throw a blob to the horizon', () => {
    /*
     * cot(elevation) runs away at the horizon — a 2° sun would put a pet's
     * shadow twenty-nine times its own height across the island, which is
     * neither readable nor a blob. Nothing in the presets goes near it and the
     * floor means nothing can.
     */
    createLighting(null, sunAt(2, 40))
    expect((sunShadow() as { reach: number }).reach)
      .toBeCloseTo(1 / Math.tan((10 * Math.PI) / 180), 6)
  })
})

describe('castShadow — location', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  const offsetOf = (blob: THREE.Mesh, ax = 0, az = 0): { x: number; z: number } =>
    ({ x: blob.position.x - ax, z: blob.position.z - az })

  it('does not sit concentrically under a body standing on the ground', () => {
    /*
     * THE BUG, in one assertion. A creature 0.25 tall lit from 35° above
     * throws a shadow that reaches out from its feet; it does not stand in the
     * middle of a disc.
     */
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0, 3, -2)
    const off = offsetOf(blob, 3, -2)
    expect(Math.hypot(off.x, off.z)).toBeGreaterThan(0.1)
  })

  it('moves along the sun direction, by mid-height times reach', () => {
    const s = sunShadow() as { x: number; z: number; reach: number }
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0.4, 3, -2)
    const want = (0.4 + 0.25 / 2) * s.reach
    expect(blob.position.x - 3).toBeCloseTo(s.x * want, 6)
    expect(blob.position.z + 2).toBeCloseTo(s.z * want, 6)
  })

  it('keeps the blob flat on the ground however far it is thrown', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 2, 0, 0)
    expect(blob.position.y).toBeCloseTo(SHADOW_LIFT, 9)
  })

  it('throws two casters at different heights in the SAME direction', () => {
    // The property Joe's note is really about: one light source, one bearing,
    // whatever is casting and wherever it stands.
    const low = createBlobShadow(0.17, 0.25)
    const high = createBlobShadow(0.4, 1.2)
    castShadow(low, 0.1, -4, 7)
    castShadow(high, 1.6, 11, 0.5)
    const a = offsetOf(low, -4, 7)
    const b = offsetOf(high, 11, 0.5)
    const dot = (a.x * b.x + a.z * b.z) / (Math.hypot(a.x, a.z) * Math.hypot(b.x, b.z))
    expect(dot).toBeCloseTo(1, 6)
    // ...and the higher one is thrown further, which is the other half of it.
    expect(Math.hypot(b.x, b.z)).toBeGreaterThan(Math.hypot(a.x, a.z))
  })

  it('ignores which way its owner is facing', () => {
    /*
     * Fred's blob hangs under a group that turns to face wherever he last
     * hopped. Offsetting in the blob's own space would swing his shadow round
     * with him — an animated version of the very complaint, and the reason
     * castShadow converts the sun into the parent's frame.
     */
    const still = new THREE.Group()
    const turned = new THREE.Group()
    turned.rotation.y = 1.1
    const a = createBlobShadow(0.16, 0.36)
    const b = createBlobShadow(0.16, 0.36)
    still.add(a)
    turned.add(b)
    castShadow(a, 0)
    castShadow(b, 0)

    const inWorld = (blob: THREE.Mesh): THREE.Vector3 => {
      blob.updateMatrixWorld(true)
      return blob.getWorldPosition(new THREE.Vector3())
    }
    const wa = inWorld(a)
    const wb = inWorld(b)
    expect(wb.x).toBeCloseTo(wa.x, 6)
    expect(wb.z).toBeCloseTo(wa.z, 6)
  })

  it('is already pointing the right way the moment it is made', () => {
    /*
     * Not everything animates its blob — the egg's is created and then left
     * alone for the rest of the game. A shadow that only turned to face the
     * sun once something moved would leave the most-tapped object on the
     * island as the one thing lit from overhead.
     */
    const blob = createBlobShadow(0.28)
    expect(Math.hypot(blob.position.x, blob.position.z)).toBeGreaterThan(0.1)
  })
})

describe('castShadow — shape', () => {
  beforeEach(() => { createLighting(null, MEADOW) })

  it('is an ellipse, not a circle', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0)
    expect(blob.scale.x).toBeGreaterThan(blob.scale.y * 1.5)
  })

  it('is stretched ALONG the direction it is thrown, not across it', () => {
    const blob = createBlobShadow(0.17, 0.25)
    castShadow(blob, 0, 0, 0)
    /*
     * The circle lies in the blob's local xy plane after the -90° x rotation,
     * so the major axis is local +x. Push it through the blob's own matrix and
     * it must come out parallel to the offset.
     */
    blob.updateMatrixWorld(true)
    const major = new THREE.Vector3(1, 0, 0)
      .transformDirection(blob.matrixWorld).normalize()
    const along = new THREE.Vector3(blob.position.x, 0, blob.position.z).normalize()
    expect(major.dot(along)).toBeCloseTo(1, 5)
  })

  it('stretches further for a taller body', () => {
    const short = createBlobShadow(0.17, 0.25)
    const tall = createBlobShadow(0.17, 0.9)
    castShadow(short, 0)
    castShadow(tall, 0)
    expect(tall.scale.x).toBeGreaterThan(short.scale.x)
    expect(tall.scale.y).toBeCloseTo(short.scale.y, 9)
  })

  it('still shrinks and fades with height (brief §3, airborne = smaller)', () => {
    const low = createBlobShadow(0.17, 0.25)
    const high = createBlobShadow(0.17, 0.25)
    castShadow(low, 0)
    castShadow(high, 1)
    expect(high.scale.y).toBeLessThan(low.scale.y)
    expect((high.material as THREE.MeshBasicMaterial).opacity)
      .toBeLessThan((low.material as THREE.MeshBasicMaterial).opacity)
  })
})
