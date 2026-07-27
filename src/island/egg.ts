/**
 * The egg, and its visible progress toward hatching.
 *
 * Reading progress is made PHYSICAL (slice-1 spec §3): the egg is not a
 * progress bar with a shell drawn on it, it is the progress bar. Every page
 * read moves it along a fixed sequence of states, so a child can see how close
 * her friend is without a number anywhere.
 *
 *   intact → hairline → crack → big cracks → wobble → hatch
 *
 * Thresholds at 25% / 50% / 75% / 90% of the egg's page cost. The stages are
 * how the rest of the game talks about the egg; what the CHILD sees is a shell
 * of ten pieces easing further apart with every page, so the progress is
 * continuous rather than four drawn states.
 *
 * It never expires and never regresses: cracks do not heal, and a wrong answer
 * changes nothing here (brief §19, and the spec's serene-right rule).
 */
import * as THREE from 'three'
import { createBlobShadow, SHADOW_LIFT } from './juice'

export type EggStage = 'intact' | 'hairline' | 'crack' | 'big' | 'wobble'

/** Which stage a given 0..1 progress shows. Pure, so it can be tested. */
export function stageFor(progress: number): EggStage {
  if (progress >= 0.9) return 'wobble'
  if (progress >= 0.75) return 'big'
  if (progress >= 0.5) return 'crack'
  if (progress >= 0.25) return 'hairline'
  return 'intact'
}

export interface Egg {
  group: THREE.Group
  setPosition(x: number, z: number): void
  /** Show the state for this 0..1 progress toward hatching. */
  setProgress(progress: number): void
  update(dt: number, t: number): void
  /**
   * Arrive, rather than simply be there.
   *
   * Every egg — including the very first — used to blink into existence at
   * full size. A thing that appears has always been there as far as a child
   * is concerned; a thing that ARRIVES came from somewhere, and the whole
   * premise is that eggs wash up on her shore.
   */
  arrive(): void
  /** Crack open: a shudder, a burst, then hide. Resolves when done. */
  hatch(): Promise<void>
  reset(): void
}

export function createEgg(): Egg {
  const group = new THREE.Group()
  group.name = 'egg'

  /*
   * The egg proper. Everything that ROCKS lives in here; the ring and the
   * shadow stay on the outer group and never move.
   *
   * Tilting them with the egg was what made the shadow slice into the tile:
   * a flat disc lying on the ground has nowhere to go when you rotate it
   * except through the surface. Ground decals belong to the ground.
   */
  const body = new THREE.Group()
  group.add(body)

  const mat = (c: number): THREE.MeshStandardMaterial =>
    new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 1 })

  /*
   * A SHELL MADE OF PIECES, not a ball with cracks drawn on it.
   *
   * Joe's design, and it is a better idea than what it replaces: "the egg is
   * always composed from say 10 cracked shell pieces moving in unison so they
   * appear as one; as the challenge progresses the edges become more
   * pronounced, looking like cracks, until the egg falls apart revealing the
   * animal."
   *
   * The old egg faked the same story by toggling dark slivers on a solid
   * ovoid, which reads as a prop that changes rather than as a shell under
   * strain — and it could never fall apart at the end, so hatching had to hide
   * the egg and hope.
   *
   * Ten lat-long patches: two rows of five. At rest they sit flush and read as
   * one egg. Every page eases them apart, so the seams between them open into
   * real cracks with the dark inside showing through, and the hatch is then
   * simply the same movement continued until the pieces leave.
   */
  const CENTRE = 0.38
  const R = 0.30
  const ROWS = 2, COLS = 5

  /** The dark inside, so an opening seam reads as a crack and not a hole. */
  const inside = new THREE.Mesh(new THREE.SphereGeometry(R * 0.94, 16, 12), mat(0x6b5a41))
  inside.scale.set(1, 1.28, 1)
  inside.position.y = CENTRE
  body.add(inside)

  interface Piece {
    mesh: THREE.Mesh
    /** Which way this piece moves as the shell opens. */
    out: THREE.Vector3
    /** Its own tumble, so the break never looks machined. */
    spin: THREE.Vector3
  }
  const pieces: Piece[] = []

  // Warm and bright: it must never be mistaken for the grey rocks it shares a
  // tile with.
  const shellMat = mat(0xfff8e0)
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      /*
       * A hair of overlap on each patch. Butted exactly edge to edge, the
       * seams show as dark lines even at rest — floating point and shading
       * normals do not agree well enough for an invisible join — and an egg
       * that starts out already cracked has nowhere to go.
       */
      const phi = (col / COLS) * Math.PI * 2
      const theta = (row / ROWS) * Math.PI
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(R, 8, 6,
          phi - 0.02, (Math.PI * 2) / COLS + 0.04,
          theta - 0.015, Math.PI / ROWS + 0.03),
        shellMat,
      )
      mesh.scale.set(1, 1.28, 1)
      mesh.position.y = CENTRE

      // Outward from the egg's centre, through the middle of this patch.
      const midPhi = phi + Math.PI / COLS
      const midTheta = theta + Math.PI / (2 * ROWS)
      const out = new THREE.Vector3(
        Math.sin(midTheta) * Math.cos(midPhi),
        Math.cos(midTheta) * 1.28,
        Math.sin(midTheta) * Math.sin(midPhi),
      ).normalize()

      const seed = row * COLS + col
      const spin = new THREE.Vector3(
        Math.sin(seed * 2.3), Math.cos(seed * 1.7), Math.sin(seed * 3.1),
      ).multiplyScalar(0.6)

      pieces.push({ mesh, out, spin })
      body.add(mesh)
    }
  }

  /** Ease the shell apart by `gap` world units, with `tumble` of rotation. */
  const openBy = (gap: number, tumble = 0): void => {
    for (const p of pieces) {
      p.mesh.position.set(
        p.out.x * gap, CENTRE + p.out.y * gap, p.out.z * gap)
      p.mesh.rotation.set(
        p.spin.x * tumble, p.spin.y * tumble, p.spin.z * tumble)
    }
  }

  /*
   * A soft ring on the ground beneath, always gently pulsing.
   *
   * The egg is THE thing to tap, and once the island grew scenery it sat
   * among rocks of a similar size and colour and simply read as another
   * stone. The ring is the island asking (brief §13) — an invitation that
   * survives whatever grows up around it, without making the egg garish.
   */
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.6, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfff0b8, transparent: true, opacity: 0.5,
      side: THREE.DoubleSide, depthWrite: false,
      // A ground decal like the blob, and it needs the same depth bias: the
      // egg group is scaled to 0.62, so a lift in local units shrinks to
      // almost nothing in the world and stops clearing the tile beneath.
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2,
    }),
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = SHADOW_LIFT
  group.add(ring)

  group.add(createBlobShadow(0.28))
  /*
   * Sized against the pets: bigger than the friend it holds, so it reads as
   * something a creature comes out of — but never a boulder. Raised from 0.42
   * because at that size it disappeared among the rocks.
   */
  group.scale.setScalar(0.62)
  group.userData.pick = { kind: 'egg' }

  let shudder = false
  /** How far the seams currently stand open, in world units. */
  let openAmount = 0
  /** 0..1 through the arrival, or -1 when it is not playing. */
  let arriveT = -1
  let stage: EggStage = 'intact'

  return {
    group,

    setPosition(x, z) { group.position.set(x, 0, z) },

    arrive() { arriveT = 0 },

    setProgress(progress) {
      stage = stageFor(progress)
      /*
       * The seams open with PROGRESS, continuously, rather than snapping
       * between drawn states. The named stages still exist because the rest of
       * the game speaks in them, but what she sees is a shell easing apart a
       * little further with every page she reads.
       */
      openAmount = Math.max(0, Math.min(1, progress)) ** 1.4 * 0.055
      openBy(openAmount, openAmount * 6)
    },

    update(dt, t) {
      if (arriveT >= 0) {
        arriveT = Math.min(1, arriveT + dt * 1.5)
        if (arriveT >= 1) { arriveT = -1; group.scale.setScalar(0.62) }
        else {
          // Drops in and settles, with a squash as it meets the ground.
          const fall = 1 - Math.pow(1 - arriveT, 2)
          const bounce = Math.max(0, Math.sin((arriveT - 0.7) / 0.3 * Math.PI))
          group.position.y = 2.2 * (1 - fall)
          group.scale.set(
            0.62 * (1 + bounce * 0.16), 0.62 * (1 - bounce * 0.2), 0.62 * (1 + bounce * 0.16))
          return
        }
      }
      if (shudder) return
      /*
       * An egg on the ground ROCKS; it does not hover. The first version bobbed
       * it vertically by 0.04 world units, which at this scale is an eighth of
       * the egg's own height — enough to read as levitation rather than life.
       *
       * So the resting motion is a slow tilt around the base, with an
       * impatient shiver that grows more insistent as it nears hatching. The
       * island gently asking, never nagging (brief §13).
       */
      group.position.y = 0
      const breathe = Math.sin(t * 1.5) * 0.022
      const eager = stage === 'wobble' ? 1 : stage === 'big' ? 0.45 : 0.18
      const due = Math.sin(t * 0.7) > (0.93 - eager * 0.5)
      const shiver = due ? Math.sin(t * 26) * 0.09 * eager : 0
      body.rotation.z = breathe + shiver
      body.rotation.x = Math.cos(t * 1.1) * 0.015
      /*
       * Near hatching the seams breathe, so the last stretch feels like
       * something straining to get out rather than a static cracked prop.
       */
      if (stage === 'wobble') {
        const breath = openAmount + Math.abs(Math.sin(t * 3.2)) * 0.012
        openBy(breath, breath * 6)
      }
      // The invitation breathes, a little more insistently near hatching.
      const ringMat = ring.material as THREE.MeshBasicMaterial
      ringMat.opacity = 0.34 + Math.sin(t * 2.1) * 0.16 + eager * 0.12
    },

    hatch() {
      /*
       * The same movement, carried through to its end.
       *
       * The old hatch shook a solid egg, flashed a glow and then simply turned
       * the whole thing invisible — the shell did not break, it was removed.
       * Now the seams that have been opening all along keep opening: the
       * pieces push out, tumble, fall under their own gravity and fade, and
       * what is left standing is the friend inside.
       */
      return new Promise<void>(resolve => {
        shudder = true
        const from = openAmount
        const start = performance.now()
        const step = (): void => {
          const p = Math.min(1, (performance.now() - start) / 700)

          // A last shiver, then the break.
          const shiver = Math.sin(p * Math.PI * 9) * 0.34 * (1 - p) * (p < 0.35 ? 1 : 0)
          body.rotation.z = shiver

          const burst = Math.max(0, (p - 0.3) / 0.7)
          const gap = from + burst * 0.55
          for (const piece of pieces) {
            piece.mesh.position.set(
              piece.out.x * gap,
              // Out, then down: they are falling, not floating away.
              CENTRE + piece.out.y * gap - burst * burst * 0.5,
              piece.out.z * gap,
            )
            const tumble = burst * 3.2
            piece.mesh.rotation.set(
              piece.spin.x * tumble, piece.spin.y * tumble, piece.spin.z * tumble)
            piece.mesh.scale.setScalar(1 - burst * 0.35)
          }
          inside.visible = burst < 0.45          // the dark goes with the shell

          if (p < 1) { requestAnimationFrame(step); return }
          group.visible = false
          shudder = false
          resolve()
        }
        requestAnimationFrame(step)
      })
    },

    reset() {
      group.visible = true
      arriveT = 0                     // and it arrives again, rather than pops
      body.scale.setScalar(1)
      body.rotation.set(0, 0, 0)
      stage = 'intact'
      openAmount = 0
      openBy(0, 0)
      // The hatch shrinks and drops the pieces; a fresh egg needs them whole.
      for (const piece of pieces) piece.mesh.scale.setScalar(1)
      inside.visible = true
    },
  }
}
