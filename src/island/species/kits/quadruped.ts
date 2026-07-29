/**
 * The quadruped kit: ~150 of the roster's 296 new species come out of this file.
 *
 * Roster §1: "Kits before species. Build the kit once; species become data
 * (proportions, palette, two or three detail parts)." So there is exactly ONE
 * reference silhouette here, at module level, and every number a part uses is
 * derived from it by the multipliers in `QuadrupedBuild`. Retuning 150 species
 * is one edit to `REF`.
 *
 * THE LOOK IS NOT FREE CHOICE. Roster §1 also binds the kit: "Match the live
 * Kenney cube-pet look. Same proportions, same flat palette language. A new
 * species must sit beside `animal-fox` without looking like a guest." Measured
 * from the code rather than assumed: `src/` contains no ConeGeometry,
 * CylinderGeometry or CapsuleGeometry anywhere, and the repo's only procedural
 * creature — Fred, `fred.ts:77-95` — is boxes plus non-uniformly-scaled spheres,
 * one `MeshStandardMaterial({ color, metalness: 0, roughness: 1 })` per part.
 * That is the whole vocabulary available, and it is the whole vocabulary used.
 * Fred's own note at `fred.ts:87-89` is the rule of thumb followed here: the
 * torso and limbs stay boxy, so the rounded parts read as anatomy rather than
 * as a different art style.
 *
 * WHAT THE OUTPUT HAS TO SURVIVE — `pets.ts`, measured, not re-derived:
 *   - `pets.ts:643` does `root.scale.setScalar(0.16)` UNCONDITIONALLY, so this
 *     builds at Kenney scale (~1.2-2.6 units tall) and never at Fred's 0.3 BASE.
 *     Nothing here may depend on the returned group's own `.scale`, because
 *     that field is overwritten a frame later; the fit lives on a child.
 *   - `pets.ts:650-660` takes a `Box3` of the holder and pulls two numbers out
 *     of it: `radius = max(width, depth) / 2` is the obstacle keep-out, and
 *     `standing = max.y - min.y` sizes the blob shadow. Every part is therefore
 *     real geometry with a finite transform, and every decorative part is kept
 *     inside a sane silhouette — a tail that trails a body-length behind would
 *     hand a stoat a badger's keep-out circle and stretch its shadow to match.
 *   - `pets.ts:663` sets `holder.userData.pick` itself. NOTHING built here sets
 *     `userData` at all; a nested pick payload confuses picking.
 *   - `pets.ts:690` collects flap targets with `/^wing-/`. Quadrupeds do not
 *     fly, so no node here is named that way, deliberately.
 *   - `flattenImported` (lighting/index.ts:297) clamps `metalness = 0` and
 *     `roughness = max(0.9, roughness)`. Matching Fred's material exactly means
 *     it is a no-op on a built pet, which the test proves by running it.
 *
 * NOTHING BUILT HERE IS EVER DISPOSED PER PET. `pets.ts:592` hands out
 * `.clone(true)`, and a three.js clone SHARES geometry and materials with the
 * prototype. Disposing one pet's materials would blank every pet of that
 * species — including friends she already owns, which brief §19 forbids. The
 * prototype is built once and lives as long as the session.
 */
import * as THREE from 'three'
import type { KitPalette, QuadrupedBuild, QuadrupedExtra, Rgb } from '../types'
// The primitives, the colour maths and the fit block moved to `shared.ts`
// unchanged when the songbird kit arrived — six kits copy-pasting the same
// helpers is six kits drifting apart. Nothing about this file's output moved
// with them; the collection silhouette tests are the proof.
import { darker, fitRig, lighter, parts } from './shared'

/**
 * The reference silhouette, in Kenney units, with every multiplier at 1.
 *
 * Fox-shaped on purpose: `animal-fox` is the species roster §1 names as the
 * one a newcomer must not look like a guest beside, so the neutral case IS
 * roughly a fox.
 *
 * THE NUMBERS COME FROM THE PACK, MEASURED. All 24 GLBs under
 * `src/island/public/pets/` were walked node-by-node and their world-space
 * bounds taken, which says something the source comments do not. The pack is
 * 1.43 (elephant) to 2.02 (bee) tall, mean 1.65 — NOT the 1.55-2.13 that
 * `pets.ts:657` and `types.ts:110` quote. And it is far CHUNKIER than a
 * natural-history drawing would suggest: mean width/height 0.97, mean
 * depth/height 0.95. The plain quadrupeds cluster tightly —
 *
 *     animal-dog    1.26 x 1.58 x 1.50   W/H 0.80   D/H 0.95
 *     animal-pig    1.25 x 1.58 x 1.46   W/H 0.79   D/H 0.92
 *     animal-polar  1.25 x 1.50 x 1.50   W/H 0.83   D/H 1.00
 *     animal-fox    1.25 x 1.69 x 2.31   W/H 0.74   D/H 1.37  (that is the tail)
 *
 * — and the first pass of this kit built creatures at W/H 0.37, which is a
 * correctly-proportioned animal and a total stranger to that pack. A Kenney pet
 * is nearly as wide as it is tall. The reference below lands at roughly
 * W/H 0.69, D/H 1.09 with a bushy tail on, which puts it between the dog and
 * the fox.
 *
 * These are pre-fit numbers. The finished rig is scaled so its measured height
 * is exactly `spec.height`, so REF's own height only sets the proportions the
 * other fields are read against — it is not a promise about the output.
 */
const REF = {
  height: 1.8,
  /** Torso extent along z, nose-to-tail direction. */
  bodyLength: 1.05,
  /** Torso extent along x. Wide, because the pack is wide — see above. */
  bodyWidth: 1.22,
  /** Torso extent along y — how deep-chested it is. */
  bodyDepth: 0.62,
  /** Ground to belly. */
  legLength: 0.44,
  /** Stubby, not spindly. The pack's legs are cubes. */
  legThick: 0.3,
  /** Head cube edge. */
  head: 0.68,
} as const

/**
 * What a multiplier is allowed to be.
 *
 * The data is 150 hand-written species records and one typo — a `head: 12`
 * where `1.2` was meant — is a creature the size of a tree standing in a child's
 * garden. Clamping is cheaper than trusting, and the ranges are wide enough
 * that no honest animal is bent by them: 0.6 is a hedgehog's stubby body, 1.55
 * is a stoat's; 0.25 legs is a badger low to the ground and 2.0 is a giraffe's.
 *
 * `body` is the one clamp that is tighter than the anatomy would like, and the
 * reason is `pets.ts:652`: the obstacle keep-out is `max(width, depth) / 2`, so
 * LENGTH IS CHARGED FOR. At 1.9 this kit made a stoat 4.0 units deep — a
 * keep-out three times the measured pack's widest (the fox, 2.31) and a creature
 * that could not walk between two trees. A long low animal is expressed by
 * dropping `legs` and `height` instead, which costs nothing.
 *
 * >>> THAT LAST SENTENCE IS WRONG, and PB-036 phase 2 proved it three times.
 * It does not cost nothing — it can cost MORE than pushing `body` does.
 *
 * The fit is uniform and solves for `height`: the rig is scaled until it stands
 * `height` tall. So dropping `legs` lowers the raw silhouette, which RAISES the
 * fit scale, which stretches the body in world units. Length is charged for on
 * the way out, not on the way in, and `legs` is a lever on it in the opposite
 * direction to the one this comment used to claim.
 *
 * Measured by three collections independently, none of which had seen the
 * others:
 *   - a stoat at `body: 1.55, legs: 0.28` came out 3.56 deep — keep-out 1.78,
 *     worse than the pack's widest (the fox, 1.16) and worse than this kit's own
 *     worked "plausible stoat" at `kit-quadruped.test.ts:93`, which is 1.59;
 *   - a ferret at `legs: 0.46` gave 1.45, and the same animal at `legs: 0.58`
 *     gave 1.28 while looking identical;
 *   - separately, `ears: 'long'` inflates the pre-fit height, so a long-eared
 *     species silently measures SLIM — an antelope at `legs: 1.75` read W/H
 *     0.59 and only reached 0.61 at 1.62.
 *
 * WHAT TO DO INSTEAD: measure. `tests/island/species-silhouette.test.ts` holds
 * every shipped species to the keep-out envelope, so a species that is too wide
 * fails on the number rather than on somebody's intuition about legs. Tune
 * against that test, not against this paragraph.
 * <<<
 *
 * `height` is clamped to the range `types.ts:110-111` states outright: outside
 * roughly 1.2-2.6 a species "will not sit beside `animal-fox` without looking
 * like a guest", which roster §1 forbids. The measured pack is narrower still
 * (1.43-2.02, see REF), so this clamp is a backstop against typos rather than a
 * style guide — a species at 2.6 is already at the edge of the family.
 */
const LIMIT = {
  height: [1.2, 2.6],
  body: [0.6, 1.55],
  head: [0.5, 1.9],
  legs: [0.25, 2.0],
} as const

const clamp = (v: number, lo: number, hi: number): number =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo

/* ---------------------------------------------------------------- colour --- */

/**
 * Fred's eye colours, `fred.ts:35-36`, repeated rather than imported.
 *
 * `fred.ts` does not export its palette and must not be edited to make it do
 * so — he is one character with one look, and a shared constant would tie 150
 * species' eyes to a retune of the frog. The values are copied so the family
 * resemblance is deliberate rather than accidental.
 */
const EYE_WHITE = 0xfffdf6
const PUPIL = 0x23404f
/** Tusks, teeth and claws. Warm rather than white, so they read as bone. */
const BONE = 0xfff6e4

/**
 * The four coats a part may ask for, with `types.ts:90-99`'s fallbacks applied
 * once so no part has to know which fields a species bothered to fill in.
 */
interface Coats {
  coat: Rgb
  belly: Rgb
  detail: Rgb
  accent: Rgb
}

const coatsOf = (p: KitPalette): Coats => ({
  coat: p.coat,
  belly: p.belly ?? lighter(p.coat, 0.42),
  detail: p.detail ?? darker(p.coat, 0.2),
  accent: p.accent ?? darker(p.coat, 0.42),
})

/* ----------------------------------------------------------------- build --- */

/**
 * Build one quadruped, standing at the origin with its feet on y = 0.
 *
 * The returned group's own transform is left at identity because `pets.ts:643`
 * overwrites its scale. All the fitting lives on a single child, `rig`.
 */
export function buildQuadruped(spec: QuadrupedBuild): THREE.Group {
  const height = clamp(spec.height, LIMIT.height[0], LIMIT.height[1])
  const bodyM = clamp(spec.body, LIMIT.body[0], LIMIT.body[1])
  const headM = clamp(spec.head, LIMIT.head[0], LIMIT.head[1])
  const legM = clamp(spec.legs, LIMIT.legs[0], LIMIT.legs[1])
  const c = coatsOf(spec.palette)

  /*
   * Roughly constant volume, so `body` reads the way `types.ts:116` describes
   * it: "A stoat is long and low; a hog is short and deep." A single length
   * multiplier with a fixed girth made a long animal look inflated rather than
   * slender, so length goes up and the two cross-sections come down with it.
   */
  const len = REF.bodyLength * bodyM
  const depth = REF.bodyDepth / Math.sqrt(bodyM)
  const wide = REF.bodyWidth / Math.pow(bodyM, 0.25)
  const legLen = REF.legLength * legM
  const legThick = REF.legThick * (wide / REF.bodyWidth)
  const hd = REF.head * headM

  // The material cache and the two unit geometries, per build — `shared.ts`.
  const { box, lump } = parts()

  const rig = new THREE.Group()
  rig.name = 'rig'

  /* ---- torso ---- */

  const bellyY = legLen
  const torso = box('body', wide, depth, len, c.coat)
  torso.position.y = bellyY + depth / 2
  rig.add(torso)

  /*
   * The underside, PROUD of the torso by a few percent rather than flush with
   * it.
   *
   * Flush was the first attempt and the belly colour never appeared on screen:
   * inset in x and z and level at the bottom, it is a mesh entirely inside
   * another mesh. Standing a little below and a little forward of the torso
   * gives a light strip along the lower edge, which is exactly how the pack
   * wears it — `animal-pig` and `animal-dog` both read as a coat with a paler
   * underline from the island's three-quarter camera.
   */
  const under = box('belly', wide * 0.9, depth * 0.44, len * 0.94, c.belly)
  under.position.set(0, bellyY + depth * 0.17, len * 0.03)
  rig.add(under)

  /* ---- legs ---- */

  const legX = (wide - legThick) / 2
  const legZ = len / 2 - legThick * 0.6
  for (const [zName, z] of [['front', legZ], ['back', -legZ]] as const) {
    for (const [xName, s] of [['left', -1], ['right', 1]] as const) {
      const leg = box(`leg-${zName}-${xName}`, legThick, legLen, legThick, c.coat)
      leg.position.set(s * legX, legLen / 2, z)
      rig.add(leg)
      // Paws in the detail colour: the cheapest marking that reads at pet
      // scale, and the one the live pack uses on nearly every species.
      const paw = box(`paw-${zName}-${xName}`, legThick * 1.06, legLen * 0.22, legThick * 1.14, c.detail)
      paw.position.set(s * legX, legLen * 0.11, z + legThick * 0.04)
      rig.add(paw)
    }
  }

  /* ---- head ---- */

  const headY = bellyY + depth * 0.92 + hd * 0.3
  const headZ = len / 2 + hd * 0.28
  const head = box('head', hd, hd * 0.9, hd, c.coat)
  head.position.set(0, headY, headZ)
  rig.add(head)

  const cheeks = box('muzzle', hd * 0.56, hd * 0.34, hd * 0.36, c.belly)
  cheeks.position.set(0, headY - hd * 0.22, headZ + hd * 0.4)
  rig.add(cheeks)

  const nose = box('nose', hd * 0.2, hd * 0.14, hd * 0.12, c.accent)
  nose.position.set(0, headY - hd * 0.12, headZ + hd * 0.56)
  rig.add(nose)

  /*
   * Eyes as their own meshes, `fred.ts:110-120`.
   *
   * The live 24 wear their eyes as face decals off the atlas
   * (`variants/facedecals.ts:91`), and that table is keyed by species — it
   * returns 0 for anything absent, so it is a safe no-op here but it is also no
   * help. A built pet with no eyes reads as a bar of soap, so the eyes are
   * geometry.
   */
  /*
   * The head box's front face is at `hd * 0.5`. Both eye meshes therefore sit
   * FORWARD of that — the first pass put the white at 0.36 with a half-depth of
   * 0.1, which is a mesh completely inside the skull and a pet with no face at
   * all. Fred has the same note at `fred.ts:108-109`: protruding, not set in.
   */
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const white = lump(`eye-${side}`, hd * 0.26, hd * 0.26, hd * 0.22, EYE_WHITE)
    white.position.set(s * hd * 0.27, headY + hd * 0.1, headZ + hd * 0.46)
    const pupil = lump(`pupil-${side}`, hd * 0.14, hd * 0.16, hd * 0.12, PUPIL)
    pupil.position.set(s * hd * 0.28, headY + hd * 0.1, headZ + hd * 0.54)
    rig.add(white, pupil)
  }

  /* ---- ears ---- */

  const earY = headY + hd * 0.44
  const earX = hd * 0.3
  const ears = (side: 'left' | 'right', s: number): void => {
    switch (spec.ears) {
      case 'round': {
        const ear = lump(`ear-${side}`, hd * 0.3, hd * 0.32, hd * 0.14, c.detail)
        ear.position.set(s * earX, earY + hd * 0.06, headZ - hd * 0.04)
        rig.add(ear)
        break
      }
      case 'pointed': {
        // No cones in this repo, so the taper is made of two boxes: a wide
        // base and a narrower cap, leaning outward. Read from three metres it
        // is a triangle, which is all a pet ear has to be.
        const base = box(`ear-${side}`, hd * 0.24, hd * 0.3, hd * 0.1, c.detail)
        base.position.set(s * earX, earY + hd * 0.11, headZ - hd * 0.02)
        base.rotation.z = s * -0.18
        const tip = box(`ear-${side}-tip`, hd * 0.11, hd * 0.2, hd * 0.08, c.detail)
        tip.position.set(s * (earX + hd * 0.08), earY + hd * 0.32, headZ - hd * 0.02)
        tip.rotation.z = s * -0.18
        rig.add(base, tip)
        break
      }
      case 'long': {
        // Bunny and hare. Tall enough to matter, laid back a little so the
        // length costs depth rather than the keep-out radius.
        const ear = box(`ear-${side}`, hd * 0.2, hd * 0.86, hd * 0.12, c.detail)
        ear.position.set(s * earX * 0.8, earY + hd * 0.38, headZ - hd * 0.12)
        ear.rotation.x = -0.22
        ear.rotation.z = s * -0.1
        const inner = box(`ear-${side}-inner`, hd * 0.1, hd * 0.6, hd * 0.06, c.belly)
        inner.position.set(s * earX * 0.8, earY + hd * 0.36, headZ - hd * 0.02)
        inner.rotation.x = -0.22
        inner.rotation.z = s * -0.1
        rig.add(ear, inner)
        break
      }
      case 'tufted': {
        // Lynx and caracal: a round ear with a spike of hair off the tip. The
        // tuft is accent-coloured because a tuft the same colour as the ear is
        // invisible at 0.16 scale.
        const ear = box(`ear-${side}`, hd * 0.22, hd * 0.28, hd * 0.1, c.detail)
        ear.position.set(s * earX, earY + hd * 0.1, headZ - hd * 0.02)
        const tuft = box(`ear-${side}-tuft`, hd * 0.07, hd * 0.24, hd * 0.07, c.accent)
        tuft.position.set(s * earX, earY + hd * 0.34, headZ - hd * 0.02)
        tuft.rotation.z = s * -0.24
        rig.add(ear, tuft)
        break
      }
      case 'none':
        // Deliberately nothing. A hippo has no ears worth a mesh at this size,
        // and the empty case is stated so the switch is exhaustive rather than
        // silently falling through — the failure `types.ts:155-157` warns about.
        break
    }
  }
  ears('left', -1)
  ears('right', 1)

  /* ---- tail ---- */

  const tailZ = -len / 2
  const tailY = bellyY + depth * 0.72
  switch (spec.tail) {
    case 'bushy': {
      // A fox's. Big and rounded, swept UP rather than back: the keep-out
      // radius (`pets.ts:652`) is max(width, depth)/2, so depth spent behind
      // the animal is depth every tree has to give it.
      const t = lump('tail', wide * 0.62, len * 0.42, len * 0.34, c.coat)
      t.position.set(0, tailY + len * 0.14, tailZ - len * 0.12)
      const tip = lump('tail-tip', wide * 0.44, len * 0.18, len * 0.16, c.belly)
      tip.position.set(0, tailY + len * 0.3, tailZ - len * 0.16)
      rig.add(t, tip)
      break
    }
    case 'thin': {
      const t = box('tail', wide * 0.14, wide * 0.14, len * 0.4, c.coat)
      t.position.set(0, tailY + len * 0.1, tailZ - len * 0.16)
      t.rotation.x = 0.5
      rig.add(t)
      break
    }
    case 'stub': {
      const t = lump('tail', wide * 0.26, wide * 0.26, wide * 0.24, c.belly)
      t.position.set(0, tailY, tailZ - wide * 0.08)
      rig.add(t)
      break
    }
    case 'tuft': {
      // A lion's or a donkey's: a bare stalk with a brush on the end.
      const t = box('tail', wide * 0.11, wide * 0.11, len * 0.38, c.coat)
      t.position.set(0, tailY + len * 0.08, tailZ - len * 0.15)
      t.rotation.x = 0.7
      const brush = lump('tail-tuft', wide * 0.26, wide * 0.3, wide * 0.26, c.accent)
      brush.position.set(0, tailY - len * 0.06, tailZ - len * 0.24)
      rig.add(t, brush)
      break
    }
    case 'flat': {
      // Beaver and platypus. Wide and paddle-flat, angled down to the ground.
      const t = box('tail', wide * 0.72, wide * 0.12, len * 0.42, c.accent)
      t.position.set(0, tailY - depth * 0.34, tailZ - len * 0.18)
      t.rotation.x = 0.35
      rig.add(t)
      break
    }
    case 'none':
      break
  }

  /* ---- extras ---- */

  const backY = bellyY + depth

  const extra = (kind: QuadrupedExtra): void => {
    switch (kind) {
      case 'horns':
        // Goat and rhino kept as one part on purpose: two short curved-back
        // stubs off the crown. Short, because a horn is a keep-out too.
        for (const s of [-1, 1]) {
          const h = box(`horn-${s < 0 ? 'left' : 'right'}`, hd * 0.12, hd * 0.42, hd * 0.12, BONE)
          h.position.set(s * hd * 0.24, earY + hd * 0.2, headZ - hd * 0.06)
          h.rotation.z = s * -0.3
          h.rotation.x = -0.25
          rig.add(h)
        }
        break
      case 'antlers':
        // A beam and two tines a side. Kept inside the body's own width so a
        // stag does not walk round the island with a hedge's keep-out.
        for (const s of [-1, 1]) {
          const side = s < 0 ? 'left' : 'right'
          const beam = box(`antler-${side}`, hd * 0.08, hd * 0.66, hd * 0.08, BONE)
          beam.position.set(s * hd * 0.22, earY + hd * 0.34, headZ - hd * 0.08)
          beam.rotation.z = s * -0.32
          rig.add(beam)
          for (const [i, up] of [0.28, 0.56].entries()) {
            const tine = box(`antler-${side}-tine-${i + 1}`, hd * 0.24, hd * 0.06, hd * 0.06, BONE)
            tine.position.set(s * (hd * 0.3 + hd * up * 0.34), earY + hd * (0.16 + up), headZ - hd * 0.08)
            tine.rotation.z = s * -0.55
            rig.add(tine)
          }
        }
        break
      case 'tusks':
        for (const s of [-1, 1]) {
          // Outside the muzzle in x and below the skull in y: a tusk tucked
          // inside the face is a part that does not exist.
          const t = box(`tusk-${s < 0 ? 'left' : 'right'}`, hd * 0.08, hd * 0.34, hd * 0.08, BONE)
          t.position.set(s * hd * 0.3, headY - hd * 0.42, headZ + hd * 0.44)
          t.rotation.z = s * 0.24
          t.rotation.x = 0.4
          rig.add(t)
        }
        break
      case 'snout': {
        // A long muzzle — anteater, tapir, wolf. Two boxes so it tapers, the
        // same trick as the pointed ear.
        const s1 = box('snout', hd * 0.38, hd * 0.3, hd * 0.5, c.coat)
        s1.position.set(0, headY - hd * 0.2, headZ + hd * 0.6)
        const s2 = box('snout-tip', hd * 0.26, hd * 0.22, hd * 0.3, c.accent)
        s2.position.set(0, headY - hd * 0.24, headZ + hd * 0.94)
        rig.add(s1, s2)
        break
      }
      case 'mane': {
        // Lion and horse. A collar behind the head rather than a hood over it,
        // so the face stays readable.
        const collar = lump('mane', wide * 1.25, depth * 1.2, len * 0.3, c.accent)
        collar.position.set(0, headY - hd * 0.1, len * 0.34)
        rig.add(collar)
        break
      }
      case 'hump': {
        const h = lump('hump', wide * 0.86, depth * 0.62, len * 0.44, c.coat)
        h.position.set(0, backY - depth * 0.06, len * 0.12)
        rig.add(h)
        break
      }
      case 'spines':
        // Hedgehog and porcupine. A ridge of diamonds down the spine: a box
        // turned 45 degrees reads as a spike from the front and costs nothing
        // but a rotation.
        for (const [i, z] of [0.3, 0.1, -0.1, -0.3].entries()) {
          const sp = box(`spine-${i + 1}`, wide * 0.22, wide * 0.22, len * 0.1, c.accent)
          sp.position.set(0, backY + wide * 0.05, len * z)
          sp.rotation.z = Math.PI / 4
          rig.add(sp)
        }
        break
      case 'shell': {
        // Tortoise, armadillo, pangolin. One dome over the back, plus a rim so
        // the edge catches light and the shell reads as worn rather than fused.
        const dome = lump('shell', wide * 1.14, depth * 0.95, len * 0.86, c.accent)
        dome.position.set(0, backY - depth * 0.16, 0)
        const rim = box('shell-rim', wide * 1.16, depth * 0.12, len * 0.84, c.detail)
        rim.position.set(0, backY - depth * 0.42, 0)
        rig.add(dome, rim)
        break
      }
      case 'trunk': {
        // Elephant and tapir: four shortening boxes curving down and forward.
        // Held close to the face, again for the keep-out.
        for (const [i, seg] of [0, 1, 2, 3].entries()) {
          const t = box(`trunk-${i + 1}`, hd * (0.26 - seg * 0.04), hd * 0.2, hd * (0.22 - seg * 0.02), c.coat)
          t.position.set(0, headY - hd * (0.4 + seg * 0.19), headZ + hd * (0.46 + seg * 0.05))
          rig.add(t)
        }
        break
      }
      case 'pouch': {
        // Kangaroo, wombat, opossum. On the FRONT of the belly and standing
        // proud of the torso — sat over the underside it was invisible, which
        // is the same fault the eyes had.
        const p = lump('pouch', wide * 0.62, depth * 0.5, len * 0.3, c.belly)
        p.position.set(0, bellyY + depth * 0.3, len * 0.4)
        rig.add(p)
        break
      }
      case 'crest': {
        // A fan of three blades on the crown — cockatoo, basilisk, hoopoe.
        for (const [i, tilt] of [-0.45, 0, 0.45].entries()) {
          const blade = box(`crest-${i + 1}`, hd * 0.06, hd * 0.36, hd * 0.16, c.accent)
          blade.position.set(Math.sin(tilt) * hd * 0.18, earY + hd * 0.16, headZ + Math.cos(tilt) * hd * 0.04)
          blade.rotation.z = tilt
          rig.add(blade)
        }
        break
      }
      case 'whiskers':
        // Cat, otter, seal. Three a side, swept forward more than out: an
        // honest whisker span would widen the obstacle radius by a third for a
        // part two pixels wide on screen.
        for (const s of [-1, 1]) {
          const side = s < 0 ? 'left' : 'right'
          for (const [i, lift] of [-0.18, 0, 0.18].entries()) {
            const w = box(`whisker-${side}-${i + 1}`, hd * 0.03, hd * 0.03, hd * 0.44, c.belly)
            w.position.set(s * hd * 0.24, headY - hd * 0.16 + hd * lift * 0.5, headZ + hd * 0.6)
            w.rotation.y = s * -0.35
            w.rotation.x = lift
            rig.add(w)
          }
        }
        break
    }
  }
  for (const kind of spec.extras ?? []) extra(kind)

  /* ---- fit ---- */

  // Measured, then fitted — never assumed. See `shared.ts`'s `fitRig`.
  fitRig(rig, height)

  const root = new THREE.Group()
  root.name = 'quadruped'
  root.add(rig)
  // No `userData` is set anywhere in this file: `pets.ts:663` owns
  // `userData.pick`, and a nested payload confuses picking.
  return root
}
