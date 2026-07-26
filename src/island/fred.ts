/**
 * Fred, built in code from primitives (brief section 3).
 *
 * Deliberately NOT a purchased asset. He is the one character who must read as
 * "character, not catchable": slightly larger than a collectible pet, with a
 * leaf hat, and he never appears in the album. Building him from cubes in the
 * same flat chunky language as the Kenney pets keeps him on-style while making
 * him obviously not one of them.
 *
 * Procedural animation comes free from that construction:
 *   hop   — squash and stretch the whole body
 *   talk  — flap the jaw while TTS is speaking
 *   blink — scale the eye cubes flat for a moment
 *   point — lean towards what he is talking about
 */
import * as THREE from 'three'
import { createBlobShadow } from './juice'

/*
 * Kenney-ish greens: saturated but soft, nothing murky.
 *
 * Deliberately BRIGHTER and yellower than the Summer grass swatch (#3b903a).
 * At the first pass Fred was the same green as the tile and read as a face
 * embedded in the grass rather than a frog sitting on it — a character has to
 * separate from his own ground.
 */
const BODY = 0x9ae84f
const BODY_DARK = 0x74c634
const BELLY = 0xfaffe8
const EYE_WHITE = 0xfffdf6
const PUPIL = 0x23404f
const LEAF = 0x3f8f2c
const MOUTH = 0x2b5f3a

export interface Fred {
  group: THREE.Group
  /** Start a hop. Purely decorative; nothing depends on it. */
  hop(): void
  /** Flap the jaw for roughly this long, to match a spoken line. */
  talk(seconds: number): void
  /** Lean towards a world position, e.g. the egg he is pointing at. */
  pointAt(target: THREE.Vector3 | null): void
  update(dt: number, t: number): void
}

export function createFred(): Fred {
  const group = new THREE.Group()
  group.name = 'fred'

  /** The whole body, so squash-stretch can scale it without moving the shadow. */
  const body = new THREE.Group()

  const mat = (c: number): THREE.Material => new THREE.MeshLambertMaterial({ color: c })
  const box = (w: number, h: number, d: number, c: number): THREE.Mesh =>
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c))

  // Body: a rounded-ish cube. Frogs are wider than they are tall.
  const torso = box(0.86, 0.68, 0.72, BODY)
  torso.position.y = 0.34
  body.add(torso)

  // A small chin patch, not a chest plate: at full width it read as a screen.
  const belly = box(0.34, 0.16, 0.05, BELLY)
  belly.position.set(0, 0.16, 0.37)
  body.add(belly)

  // The frog silhouette: two eye cubes PROTRUDING from the top of the head.
  const eyes = new THREE.Group()
  for (const side of [-1, 1]) {
    const socket = box(0.26, 0.26, 0.26, BODY)
    socket.position.set(side * 0.24, 0.78, 0.06)
    const white = box(0.17, 0.17, 0.06, EYE_WHITE)
    white.position.set(side * 0.24, 0.79, 0.2)
    const pupil = box(0.08, 0.1, 0.04, PUPIL)
    pupil.position.set(side * 0.24, 0.79, 0.24)
    eyes.add(socket, white, pupil)
  }
  body.add(eyes)

  // A wide painted smile, as a flat decal rather than geometry.
  const smile = box(0.4, 0.055, 0.04, MOUTH)
  smile.position.set(0, 0.30, 0.375)
  body.add(smile)
  for (const side of [-1, 1]) {
    // Little upturned corners, so the smile is a smile and not a line.
    const corner = box(0.09, 0.055, 0.04, MOUTH)
    corner.position.set(side * 0.20, 0.335, 0.375)
    corner.rotation.z = side * 0.6
    body.add(corner)
  }

  // The jaw: what flaps when he talks.
  const jaw = box(0.5, 0.16, 0.5, BODY_DARK)
  jaw.position.set(0, 0.06, 0.12)
  body.add(jaw)

  // Stubby feet.
  for (const side of [-1, 1]) {
    const foot = box(0.26, 0.12, 0.34, BODY_DARK)
    foot.position.set(side * 0.25, 0.06, 0.14)
    body.add(foot)
  }

  // The leaf hat: the single clearest signal that he is not collectible.
  const stalk = box(0.05, 0.14, 0.05, LEAF)
  stalk.position.set(0.06, 0.99, 0)
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 7), mat(LEAF))
  leaf.scale.set(1, 0.28, 0.62)
  leaf.position.set(0.17, 1.06, 0)
  leaf.rotation.z = -0.4
  body.add(stalk, leaf)

  // Slightly larger than a collectible pet (which sits at 0.5), so he reads as
  // character rather than catchable — but never as big as the rock he is on.
  const BASE = 0.68
  body.scale.setScalar(BASE)
  group.add(body)
  group.add(createBlobShadow(0.3))
  group.userData.pick = { kind: 'fred' }

  let hopT = -1          // -1 = not hopping
  let talkUntil = 0
  let blinkAt = 2 + Math.random() * 4
  let blinkT = -1
  let lean = 0
  let leanWant = 0

  return {
    group,

    hop() { if (hopT < 0) hopT = 0 },

    talk(seconds) { talkUntil = performance.now() / 1000 + seconds },

    pointAt(target) {
      if (!target) { leanWant = 0; return }
      const to = target.clone().sub(group.position)
      group.rotation.y = Math.atan2(to.x, to.z)
      leanWant = 0.16
    },

    update(dt, t) {
      // Hop: a short arc with squash on landing and stretch at the top.
      if (hopT >= 0) {
        hopT += dt * 1.9
        if (hopT >= 1) { hopT = -1; body.position.y = 0; body.scale.setScalar(BASE) }
        else {
          const arc = Math.sin(hopT * Math.PI)
          body.position.y = arc * 0.34
          body.scale.set(BASE * (1 - arc * 0.1), BASE * (1 + arc * 0.16), BASE * (1 - arc * 0.1))
        }
      } else {
        // Idle: breathe, so he never looks like a statue.
        const breathe = Math.sin(t * 1.4) * 0.02
        body.scale.set(BASE * (1 - breathe), BASE * (1 + breathe), BASE * (1 - breathe))
        body.position.y = Math.sin(t * 1.4) * 0.012
      }

      // Talk: flap the jaw while a line is being spoken.
      const talking = performance.now() / 1000 < talkUntil
      jaw.position.y = talking ? 0.06 - Math.abs(Math.sin(t * 15)) * 0.07 : 0.06
      jaw.rotation.x = talking ? Math.abs(Math.sin(t * 15)) * 0.3 : 0

      // Blink: squash the eye cubes flat for a moment.
      blinkAt -= dt
      if (blinkAt <= 0 && blinkT < 0) { blinkT = 0; blinkAt = 2.5 + Math.random() * 4 }
      if (blinkT >= 0) {
        blinkT += dt * 7
        if (blinkT >= 1) { blinkT = -1; eyes.scale.y = 1 }
        else eyes.scale.y = 1 - Math.sin(blinkT * Math.PI) * 0.85
      }

      // Lean: eased, so pointing has weight.
      lean += (leanWant - lean) * 0.1
      body.rotation.x = lean
    },
  }
}
