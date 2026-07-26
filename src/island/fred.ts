/**
 * Fred, built in code from primitives (brief section 3).
 *
 * Deliberately NOT a purchased asset. He is the one character who must read as
 * "character, not catchable": slightly larger than a collectible pet, with a
 * leaf hat, and he never appears in the album.
 *
 * FROG SHAPE, SECOND PASS. The first build gave him tucked-under feet like a
 * cube pet, so he read as a green box with a face. A frog's silhouette is
 * splayed hind legs BESIDE the body with the knees up above the back line,
 * long front arms propping the chest up, and a wide low body. That posture is
 * what makes him a frog at a glance, from any camera angle.
 *
 * Procedural animation, all from the same construction:
 *   hop    — crouch, launch, land, with the hind legs pushing off
 *   talk   — jaw flap with the throat pouch swelling in time
 *   blink  — the eye cubes squash flat
 *   look   — the HEAD turns toward what he mentions, not the whole body
 *   idle   — breathing, an occasional throat pulse, and an unprompted hop,
 *            because a completely still Fred reads as broken rather than calm
 */
import * as THREE from 'three'
import { createBlobShadow, castShadow } from './juice'

/*
 * Kenney-ish greens: saturated but soft, nothing murky. Deliberately BRIGHTER
 * and yellower than the Summer grass swatch (#3b903a) — at the first pass Fred
 * was the same green as the tile and read as a face embedded in the ground.
 */
const BODY = 0x9ae84f
const BODY_DARK = 0x74c634
const BELLY = 0xfaffe8
const THROAT = 0xd6f58a
const EYE_WHITE = 0xfffdf6
const PUPIL = 0x23404f
const LEAF = 0x3f8f2c
const MOUTH = 0x2b5f3a

export interface Fred {
  group: THREE.Group
  hop(): void
  talk(seconds: number): void
  pointAt(target: THREE.Vector3 | null): void
  update(dt: number, t: number): void
}

export function createFred(): Fred {
  const group = new THREE.Group()
  group.name = 'fred'

  const body = new THREE.Group()

  const mat = (c: number): THREE.Material =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 1 })
  const box = (w: number, h: number, d: number, c: number): THREE.Mesh =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c))

  /**
   * A rounded lump: a sphere squashed to the given proportions.
   *
   * Frogs have no hard edges. Cubes gave Fred a made-of-bricks look that read
   * as construction rather than creature, so the parts a child actually looks
   * at — the eyes and the legs — are spheres. The torso stays boxy on purpose:
   * it keeps him in the same chunky family as the cube pets, and the contrast
   * is what makes the rounded parts read as anatomy.
   */
  const lump = (w: number, h: number, d: number, c: number): THREE.Mesh => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), mat(c))
    m.scale.set(w, h, d)
    return m
  }

  // Wide and low, the way a sitting frog is.
  const torso = lump(0.9, 0.6, 0.76, BODY)
  torso.position.y = 0.3
  body.add(torso)

  // The head is its own group so it can turn independently.
  const head = new THREE.Group()
  const skull = lump(0.74, 0.44, 0.58, BODY)
  skull.position.set(0, 0.6, 0.06)
  head.add(skull)

  // Eye cubes PROTRUDING above the skull, not set into it.
  // Bulging domes on stalks, the way a frog's eyes actually sit.
  const eyes = new THREE.Group()
  for (const side of [-1, 1]) {
    const socket = lump(0.28, 0.28, 0.28, BODY)
    socket.position.set(side * 0.2, 0.82, 0.04)
    const white = lump(0.2, 0.2, 0.14, EYE_WHITE)
    white.position.set(side * 0.2, 0.84, 0.14)
    const pupil = lump(0.1, 0.13, 0.07, PUPIL)
    pupil.position.set(side * 0.2, 0.84, 0.2)
    eyes.add(socket, white, pupil)
  }
  head.add(eyes)

  // Wide smile with upturned corners, so it is a smile and not a line.
  const smile = box(0.38, 0.05, 0.04, MOUTH)
  smile.position.set(0, 0.52, 0.32)
  head.add(smile)
  for (const side of [-1, 1]) {
    const corner = box(0.085, 0.05, 0.04, MOUTH)
    corner.position.set(side * 0.19, 0.55, 0.32)
    corner.rotation.z = side * 0.6
    head.add(corner)
  }

  const jaw = lump(0.68, 0.2, 0.5, BODY_DARK)
  jaw.position.set(0, 0.42, 0.1)
  head.add(jaw)

  const throat = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 9), mat(THROAT))
  throat.position.set(0, 0.36, 0.27)
  throat.scale.set(1, 0.7, 0.8)
  head.add(throat)

  body.add(head)

  const chin = lump(0.34, 0.18, 0.1, BELLY)
  chin.position.set(0, 0.16, 0.34)
  body.add(chin)

  /*
   * HIND LEGS — the change that actually makes him a frog.
   * Splayed at the sides, knee above the back line, foot forward. Grouped so
   * a hop can straighten them.
   */
  const hindLegs: THREE.Group[] = []
  for (const side of [-1, 1]) {
    const leg = new THREE.Group()
    const thigh = lump(0.26, 0.4, 0.32, BODY)
    thigh.position.set(side * 0.44, 0.4, -0.04)
    thigh.rotation.z = side * -0.35
    const shin = lump(0.2, 0.34, 0.26, BODY_DARK)
    shin.position.set(side * 0.5, 0.16, 0.1)
    const foot = lump(0.26, 0.11, 0.38, BODY_DARK)
    foot.position.set(side * 0.5, 0.05, 0.26)
    leg.add(thigh, shin, foot)
    hindLegs.push(leg)
    body.add(leg)
  }

  // FRONT ARMS: long and straight, propping the chest up.
  const arms: THREE.Mesh[] = []
  for (const side of [-1, 1]) {
    const arm = lump(0.15, 0.34, 0.15, BODY)
    arm.position.set(side * 0.29, 0.17, 0.3)
    const hand = lump(0.2, 0.09, 0.24, BODY_DARK)
    hand.position.set(side * 0.29, 0.03, 0.36)
    body.add(arm, hand)
    arms.push(arm)
  }

  // The leaf hat: the clearest signal that he is not collectible.
  const stalk = lump(0.055, 0.15, 0.055, LEAF)
  stalk.position.set(0.05, 1.02, 0)
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 7), mat(LEAF))
  leaf.scale.set(1, 0.26, 0.6)
  leaf.position.set(0.16, 1.09, 0)
  leaf.rotation.z = -0.4
  body.add(stalk, leaf)

  /*
   * Sized RELATIVE TO A PET, which is the only comparison that matters: the
   * brief asks for "slightly larger than a collectible pet" so he reads as
   * character rather than catchable. Pets render at 0.16 of their ~1.5-unit
   * models; this puts Fred about half again their height, not triple it.
   */
  const BASE = 0.3
  body.scale.setScalar(BASE)
  group.add(body)
  // Sibling of the body, so a hop leaves it on the ground where it belongs.
  const shadow = createBlobShadow(0.16)
  group.add(shadow)
  group.userData.pick = { kind: 'fred' }

  let hopT = -1
  let talkUntil = 0
  let blinkAt = 2 + Math.random() * 4
  let blinkT = -1
  let lean = 0
  let leanWant = 0
  let headYaw = 0
  let headYawWant = 0
  let idleHopAt = 4 + Math.random() * 5

  return {
    group,

    hop() { if (hopT < 0) hopT = 0 },

    talk(seconds) { talkUntil = performance.now() / 1000 + seconds },

    pointAt(target) {
      if (!target) { leanWant = 0; headYawWant = 0; return }
      const to = target.clone().sub(group.position)
      // Turn the HEAD toward it rather than snapping the whole body round: a
      // body snap looks mechanical, a head turn looks like attention.
      let want = Math.atan2(to.x, to.z) - group.rotation.y
      while (want > Math.PI) want -= Math.PI * 2
      while (want < -Math.PI) want += Math.PI * 2
      headYawWant = Math.max(-0.8, Math.min(0.8, want))
      leanWant = 0.14
    },

    update(dt, t) {
      // A frog at rest is never quite still: he hops now and then unprompted.
      idleHopAt -= dt
      if (idleHopAt <= 0 && hopT < 0) { hopT = 0; idleHopAt = 5 + Math.random() * 7 }

      if (hopT >= 0) {
        hopT += dt * 1.7
        if (hopT >= 1) {
          hopT = -1
          body.position.y = 0
          body.scale.setScalar(BASE)
          for (const l of hindLegs) l.rotation.x = 0
          for (const a of arms) a.rotation.x = 0
        } else {
          // Crouch, launch, land — the hind legs straighten through the arc.
          const crouch = hopT < 0.18 ? hopT / 0.18 : 0
          const arc = Math.sin(Math.max(0, (hopT - 0.18) / 0.82) * Math.PI)
          body.position.y = arc * 0.42
          body.scale.set(
            BASE * (1 + crouch * 0.1 - arc * 0.09),
            BASE * (1 - crouch * 0.16 + arc * 0.18),
            BASE * (1 + crouch * 0.1 - arc * 0.09),
          )
          for (const l of hindLegs) l.rotation.x = -arc * 0.5
          for (const a of arms) a.rotation.x = arc * 0.7
        }
      } else {
        const breathe = Math.sin(t * 1.4) * 0.02
        body.scale.set(BASE * (1 - breathe), BASE * (1 + breathe), BASE * (1 - breathe))
        body.position.y = Math.sin(t * 1.4) * 0.012
      }

      // Talk: jaw flaps and the throat pouch swells with it.
      const talking = performance.now() / 1000 < talkUntil
      const flap = talking ? Math.abs(Math.sin(t * 15)) : 0
      jaw.position.y = 0.44 - flap * 0.07
      jaw.rotation.x = flap * 0.3
      // Even when quiet the throat pulses occasionally — frogs do that.
      const pulse = talking ? flap : Math.max(0, Math.sin(t * 0.6) * 0.5 - 0.35)
      throat.scale.set(1 + pulse * 0.3, 0.7 + pulse * 0.45, 0.8 + pulse * 0.3)

      blinkAt -= dt
      if (blinkAt <= 0 && blinkT < 0) { blinkT = 0; blinkAt = 2.5 + Math.random() * 4 }
      if (blinkT >= 0) {
        blinkT += dt * 7
        if (blinkT >= 1) { blinkT = -1; eyes.scale.y = 1 }
        else eyes.scale.y = 1 - Math.sin(blinkT * Math.PI) * 0.85
      }

      // He is a heavy frog and his hop is low, so the blob tightens rather
      // than disappearing — but it does have to react, or the hop reads as
      // the whole frog sliding upward with his shadow glued underneath.
      castShadow(shadow, body.position.y)

      lean += (leanWant - lean) * 0.1
      body.rotation.x = lean
      headYaw += (headYawWant - headYaw) * 0.12
      head.rotation.y = headYaw
    },
  }
}
