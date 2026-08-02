/**
 * The songbird kit: every bird in the roster that is not a bird of prey.
 *
 * Roster §1 again — "Kits before species. Build the kit once; species become
 * data" — so there is one reference silhouette at module level, a robin, and
 * every part is derived from it by the multipliers in `SongbirdBuild`. The
 * primitives, the colour maths and the fit come from `shared.ts`, which the
 * quadruped kit now also uses; six kits with six private copies of `box()` is
 * six kits drifting away from each other.
 *
 * WHY THE REFERENCE IS A ROBIN AND NOT A FOX. The quadruped kit's `REF` is
 * fox-shaped because `animal-fox` is the species roster §1 names as the one a
 * newcomer must not look like a guest beside. A bird's neutral case is a
 * different animal entirely: no four legs to hang the body off, a breast that
 * is deep rather than long, and a head that sits on the shoulders instead of in
 * front of them. The live pack's own bird — `animal-parrot`, 1.55 tall, the
 * SHORTEST of the 24 — is the height anchor, and a robin is the shape.
 *
 * THE ONE AXIS THAT MAKES THIS KIT WORK IS `neck`. Roster §4's hardest
 * confusable group lives entirely inside this kit: swan, stork, heron, pelican,
 * flamingo. They are not separable by a detail part, and `types.ts` refuses to
 * grow one for them. They ARE separable by neck length against body length,
 * which is why `neck` is a number rather than a flag.
 *
 * WHAT THE OUTPUT HAS TO SURVIVE — `pets.ts`, measured, not re-derived. All of
 * it is identical to the quadruped kit's contract and its header says it at
 * length; the two that bite differently here are:
 *
 *   - `pets.ts:652` takes the keep-out radius from `max(width, depth) / 2`, and
 *     the fit is UNIFORM and solves for HEIGHT. A long neck therefore makes a
 *     bird NARROW, not wide: the raw silhouette gets taller, the fit scale
 *     drops, and the body shrinks in world units. That is the right answer for
 *     a heron and the reason a long tail is swept UP rather than back — depth
 *     spent behind the bird is depth every tree has to give it.
 *   - `pets.ts:690` collects flap targets with `/^wing-/`, and `pets.ts:858`
 *     then OVERWRITES those nodes' `rotation.z` every frame, alternating the
 *     sign by traversal index. THE DECISION, made deliberately: this kit names
 *     exactly two nodes `wing-left` and `wing-right`, in that order, and
 *     nothing else in the file carries the `wing-` prefix — the `wing-bar`
 *     extra builds nodes called `wingbar-*` precisely so it cannot be mistaken
 *     for a third wing and break the index parity. Two consequences follow and
 *     both are honoured below: the wing meshes carry no authored `rotation.z`,
 *     because it would be thrown away; and no songbird flaps today, because
 *     flapping is gated on `species/moves.ts`, where whether an animal flies is
 *     set per species in the workbench editor. A perching robin is therefore
 *     still, which is correct, and the day a swallow is marked as flying its
 *     wings already move.
 *
 * NOTHING BUILT HERE IS EVER DISPOSED PER PET — `pets.ts:592` hands out
 * `.clone(true)` and a clone shares geometry and materials. See the quadruped
 * header for the full reason; it applies here unchanged.
 */
import * as THREE from 'three'
import type { KitPalette, Rgb, SongbirdBuild, SongbirdExtra } from '../types'
import { darker, fitRig, lighter, parts } from './shared'

/**
 * The reference silhouette, in Kenney units, with every multiplier at 1 and
 * `neck` at 0 — a robin, standing.
 *
 * PROPORTIONS TAKEN FROM THE PACK, not from a field guide. The 24 GLBs under
 * `src/island/public/pets/` measure mean width/height 0.97 and depth/height
 * 0.95: a Kenney pet is very nearly as wide as it is tall. The quadruped kit's
 * first pass built at W/H 0.37 — anatomically correct and a total stranger
 * beside `animal-fox` — and a bird is the easier animal to make that mistake
 * with, because a real small bird IS slight. So the body below is a deep round
 * breast, not a slender one, and the reference lands around W/H 0.8.
 *
 * These are pre-fit numbers. The finished rig is scaled so its measured height
 * is exactly `spec.height`, so REF's own height only sets the proportions the
 * other fields are read against — it is not a promise about the output.
 */
const REF = {
  height: 1.55,
  /**
   * Torso extent along z, breast to tail-root.
   *
   * SHORTER THAN THE WIDTH, which is the opposite way round from the quadruped
   * kit and is the whole difference between a bird and a fox. Measured: at
   * `bodyLength: 0.92` the reference robin came out D/H 1.21 — deeper against
   * its height than any plain quadruped in the pack — because a bird pays for
   * length three times, in the body, the beak in front of it and the tail
   * behind it. At 0.80 it lands near 1.0, which is the pack's own mean.
   */
  bodyLength: 0.8,
  /** Torso extent along x. Wide, because the pack is wide — see above. */
  bodyWidth: 0.88,
  /** Torso extent along y. A bird is deep-chested where a fox is not. */
  bodyDepth: 0.84,
  /** Ground to belly. Short: a robin sits low over its feet. */
  legLength: 0.32,
  legThick: 0.12,
  /** Head cube edge. */
  head: 0.5,
  /**
   * What ONE unit of `neck` is worth, in pre-fit units.
   *
   * Sized so `neck: 1` reads as a swan's — 0.6 against a 0.92 body — and
   * `neck: 0` builds no neck mesh at all, which is a robin with its head on its
   * shoulders. A wren and a heron are then the same interface.
   */
  neck: 0.6,
  /** Beak length at `head: 1`, before the per-beak multipliers. */
  beak: 0.34,
  /** Tail length at `body: 1`. */
  tail: 0.46,
} as const

/**
 * What a multiplier is allowed to be.
 *
 * Same argument as `quadruped.ts:96-143`: the data will be hand-written species
 * records, one `head: 12` where `1.2` was meant is a bird the size of a tree,
 * and clamping is cheaper than trusting. The bounds are songbird-shaped rather
 * than borrowed —
 *
 *   - `body` reaches 1.7 rather than the quadruped's 1.55 because a heron
 *     genuinely is a long boat and there is no four-legged equivalent, and
 *     bottoms out at 0.5 for a wren, which is rounder than any quadruped.
 *   - `legs` runs to 3.0. The quadruped's 2.0 was a giraffe; a flamingo against
 *     a robin is a wider spread than that, and legs are thin, so the keep-out
 *     cost of the extra reach is small.
 *   - `neck` starts at 0, which is a real value and not a degenerate one: it
 *     means "no neck mesh", the robin case, and it is the commonest value in
 *     the kit.
 *
 * `height` is clamped to `types.ts`'s stated 1.2–2.6 for the reason stated
 * there: outside it a species stops sitting beside the live pack.
 *
 * A NOTE ON WHAT CLAMPING CANNOT DO, carried over because it cost three
 * collections to learn: the fit is uniform and solves for height, so pushing
 * `legs` or `neck` DOWN raises the fit scale and stretches the bird in world
 * units. Tune against `tests/island/species-silhouette.test.ts`, which holds
 * every shipped species to the keep-out envelope, and not against intuition.
 */
const LIMIT = {
  height: [1.2, 2.6],
  body: [0.5, 1.7],
  head: [0.5, 1.9],
  legs: [0.15, 3.0],
  neck: [0, 2.2],
} as const

const clamp = (v: number, lo: number, hi: number): number =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo

/**
 * Fred's eye colours, `fred.ts:35-36`, repeated rather than imported — the same
 * reasoning as `quadruped.ts:156-163`. A shared constant would tie every
 * species' eyes to a retune of the frog.
 */
const EYE_WHITE = 0xfffdf6
const PUPIL = 0x23404f

/** The four coats a part may ask for, with `types.ts`'s fallbacks applied once. */
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

/**
 * Build one songbird, standing at the origin with its feet on y = 0.
 *
 * The returned group's own transform is left at identity because `pets.ts:643`
 * overwrites its scale. All the fitting lives on a single child, `rig`.
 */
export function buildSongbird(spec: SongbirdBuild): THREE.Group {
  const height = clamp(spec.height, LIMIT.height[0], LIMIT.height[1])
  const bodyM = clamp(spec.body, LIMIT.body[0], LIMIT.body[1])
  const headM = clamp(spec.head, LIMIT.head[0], LIMIT.head[1])
  const legM = clamp(spec.legs, LIMIT.legs[0], LIMIT.legs[1])
  const neckM = clamp(spec.neck, LIMIT.neck[0], LIMIT.neck[1])
  const c = coatsOf(spec.palette)

  /*
   * Roughly constant volume, as the quadruped does it, so `body` reads the way
   * `types.ts` describes it: "A wren is a round ball; a heron is a long boat."
   * Length up, the two cross-sections down with it — a single length multiplier
   * at fixed girth makes a long bird look inflated rather than lean.
   */
  const len = REF.bodyLength * bodyM
  const depth = REF.bodyDepth / Math.sqrt(bodyM)
  const wide = REF.bodyWidth / Math.pow(bodyM, 0.25)
  const legLen = REF.legLength * legM
  const legThick = REF.legThick * (wide / REF.bodyWidth)
  const hd = REF.head * headM
  const neckLen = REF.neck * neckM

  const { box, lump } = parts()

  const rig = new THREE.Group()
  rig.name = 'rig'

  /* ---- body ---- */

  const bellyY = legLen
  const body = box('body', wide, depth, len, c.coat)
  body.position.y = bellyY + depth / 2
  rig.add(body)

  /*
   * The breast, PROUD of the body rather than flush with it — the same fault
   * the quadruped's belly had and for the same reason: a mesh inset on every
   * axis is a mesh entirely inside another mesh, and the second colour never
   * reaches the screen. A bird wears it on the FRONT rather than underneath,
   * which is where a robin's red actually is.
   */
  const breast = lump('breast', wide * 0.84, depth * 0.8, len * 0.52, c.belly)
  breast.position.set(0, bellyY + depth * 0.5, len * 0.3)
  rig.add(breast)

  /* ---- legs ---- */

  /*
   * Two legs, under the centre of mass rather than at the corners. Set forward
   * of centre because a perching bird's feet are under its breast; put at the
   * middle they read as a table.
   */
  const legX = wide * 0.24
  const legZ = len * 0.06
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const leg = box(`leg-${side}`, legThick, legLen, legThick, c.detail)
    leg.position.set(s * legX, legLen / 2, legZ)
    rig.add(leg)
    // The foot is the part that actually touches y = 0 and it is the cheapest
    // marking on the bird. Forward of the leg, because toes point forward.
    const foot = box(`foot-${side}`, legThick * 1.5, legLen * 0.16, legThick * 2.6, c.detail)
    foot.position.set(s * legX, legLen * 0.08, legZ + legThick * 0.7)
    rig.add(foot)
  }

  /* ---- neck and head ---- */

  const shoulderY = bellyY + depth * 0.82
  const shoulderZ = len * 0.24
  /*
   * A long neck carries the head UP and BACK over the body, not up and
   * forward. That is what a heron does when it stands, and it is also the only
   * way the keep-out radius survives: `max(width, depth) / 2` charges for every
   * unit the head is pushed out in front.
   */
  const headY = shoulderY + neckLen + hd * 0.42
  const headZ = shoulderZ + hd * 0.24 - neckLen * 0.18

  if (neckLen > 1e-4) {
    /*
     * One box from the shoulders to the base of the skull, leaned to join them.
     * Two boxes would taper more prettily; one is enough at 0.16 scale and it
     * keeps a flamingo's neck from becoming the most expensive part of the
     * cheapest bird.
     */
    const rise = headY - shoulderY
    const run = headZ - shoulderZ
    const neck = box('neck', hd * 0.4, Math.hypot(rise, run), hd * 0.4, c.coat)
    neck.position.set(0, (shoulderY + headY) / 2, (shoulderZ + headZ) / 2)
    neck.rotation.x = Math.atan2(run, rise)
    rig.add(neck)
  }

  const head = box('head', hd, hd * 0.92, hd, c.coat)
  head.position.set(0, headY, headZ)
  rig.add(head)

  /*
   * Eyes as geometry, protruding rather than set in — `fred.ts:108-109` and the
   * bug at `kit-quadruped.test.ts:164-175`, where both eye meshes sat entirely
   * inside the skull and every other assertion still passed. A bird's eyes are
   * on the SIDES of its head, so these break the x faces rather than the front.
   */
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const white = lump(`eye-${side}`, hd * 0.3, hd * 0.28, hd * 0.28, EYE_WHITE)
    white.position.set(s * hd * 0.42, headY + hd * 0.12, headZ + hd * 0.14)
    const pupil = lump(`pupil-${side}`, hd * 0.18, hd * 0.18, hd * 0.16, PUPIL)
    pupil.position.set(s * hd * 0.5, headY + hd * 0.12, headZ + hd * 0.16)
    rig.add(white, pupil)
  }

  /* ---- beak ---- */

  /*
   * Two boxes: a base off the face and a narrower tip beyond it. There are no
   * cones in this repo — see `shared.ts` — and a beak is the part that most
   * tempts one. Read from three metres two stacked boxes are a taper, which is
   * all a pet beak has to be, and it is the same trick the quadruped's pointed
   * ear uses.
   *
   * The six shapes are the six the roster's birds actually need: fine for a
   * wren or a warbler, short for a sparrow, stout for a finch or a parrot, long
   * for a hummingbird or a curlew, flat for a duck or a goose, dagger for a
   * heron or a kingfisher. `'hooked'` is missing on purpose and `types.ts` says
   * why: it belongs to the raptor kit.
   */
  const BEAK: Readonly<Record<SongbirdBuild['beak'], readonly [number, number, number, number, number, number]>> = {
    //        base w,  base h,  base d,   tip w,  tip h,  tip d
    fine: [0.2, 0.16, 0.5, 0.1, 0.08, 0.44],
    short: [0.3, 0.26, 0.36, 0.16, 0.14, 0.26],
    stout: [0.42, 0.4, 0.5, 0.22, 0.2, 0.34],
    long: [0.16, 0.15, 1.0, 0.09, 0.08, 0.9],
    flat: [0.56, 0.14, 0.66, 0.52, 0.11, 0.5],
    dagger: [0.24, 0.24, 0.72, 0.11, 0.11, 0.72],
  }
  const [bw, bh, bd, tw, th, td] = BEAK[spec.beak]
  const beakZ = headZ + hd * 0.5
  const beakY = headY - hd * 0.08
  const beakBase = box('beak', hd * bw, hd * bh, REF.beak * bd * headM, c.detail)
  beakBase.position.set(0, beakY, beakZ + REF.beak * bd * headM * 0.42)
  const beakTip = box('beak-tip', hd * tw, hd * th, REF.beak * td * headM, darker(c.detail, 0.18))
  beakTip.position.set(0, beakY - hd * 0.02, beakZ + REF.beak * (bd * 0.84 + td * 0.5) * headM)
  rig.add(beakBase, beakTip)

  /* ---- tail ---- */

  /*
   * Every tail is swept UP off the back of the body rather than trailed behind
   * it. `pets.ts:652` charges depth: a tail that trails a body-length back
   * hands a wren a goose's keep-out circle and stretches its blob shadow to
   * match. The quadruped kit learned this on the fox's brush.
   */
  const tailLen = REF.tail * bodyM
  const tailZ = -len / 2
  const tailY = bellyY + depth * 0.62
  switch (spec.tail) {
    case 'fan': {
      // A robin's or a wren's: wide, shallow, cocked hard upward. The angle is
      // the whole reason a robin is not as deep as a fox — see the sweep note
      // above this switch.
      const t = box('tail', wide * 0.72, depth * 0.14, tailLen * 0.8, c.coat)
      t.position.set(0, tailY + tailLen * 0.3, tailZ - tailLen * 0.16)
      t.rotation.x = -0.9
      const edge = box('tail-edge', wide * 0.66, depth * 0.1, tailLen * 0.24, c.accent)
      edge.position.set(0, tailY + tailLen * 0.62, tailZ - tailLen * 0.28)
      edge.rotation.x = -0.9
      rig.add(t, edge)
      break
    }
    case 'short': {
      // A duck's, a puffin's, a robin at rest — a stub with an edge on it.
      const t = box('tail', wide * 0.5, depth * 0.18, tailLen * 0.36, c.coat)
      t.position.set(0, tailY + tailLen * 0.08, tailZ - tailLen * 0.14)
      t.rotation.x = -0.35
      rig.add(t)
      break
    }
    case 'long': {
      // A magpie's. Long, narrow, and lifted hard so the length is spent in y.
      const t = box('tail', wide * 0.3, depth * 0.12, tailLen * 1.5, c.coat)
      t.position.set(0, tailY + tailLen * 0.62, tailZ - tailLen * 0.3)
      t.rotation.x = -1.0
      const tip = box('tail-tip', wide * 0.24, depth * 0.1, tailLen * 0.4, c.accent)
      tip.position.set(0, tailY + tailLen * 1.24, tailZ - tailLen * 0.66)
      tip.rotation.x = -1.0
      rig.add(t, tip)
      break
    }
    case 'forked': {
      // A swallow's or a tern's: two blades splaying out and up.
      for (const [side, s] of [['left', -1], ['right', 1]] as const) {
        const t = box(`tail-${side}`, wide * 0.2, depth * 0.12, tailLen * 1.1, c.coat)
        t.position.set(s * wide * 0.16, tailY + tailLen * 0.32, tailZ - tailLen * 0.32)
        t.rotation.x = -0.7
        t.rotation.y = s * 0.22
        rig.add(t)
      }
      break
    }
    case 'pointed': {
      // A pheasant's or a pigeon's: one wedge, made of two boxes so it tapers.
      const t = box('tail', wide * 0.36, depth * 0.14, tailLen * 0.9, c.coat)
      t.position.set(0, tailY + tailLen * 0.26, tailZ - tailLen * 0.26)
      t.rotation.x = -0.6
      const tip = box('tail-tip', wide * 0.16, depth * 0.1, tailLen * 0.6, c.accent)
      tip.position.set(0, tailY + tailLen * 0.66, tailZ - tailLen * 0.5)
      tip.rotation.x = -0.6
      rig.add(t, tip)
      break
    }
    case 'none':
      // A penguin, a kiwi, a grebe. Stated so the switch is exhaustive rather
      // than silently falling through — the failure `types.ts` warns about.
      break
  }

  /* ---- wings ---- */

  /*
   * EXACTLY TWO NODES CARRY THE `wing-` PREFIX, left first then right, and no
   * `rotation.z` is authored on either. See the file header: `pets.ts:690`
   * collects them and `pets.ts:858` overwrites `rotation.z` by traversal index,
   * so a third `wing-*` node would flip which wing gets which sign and an
   * authored tilt would be silently discarded. Both constraints are cheap to
   * honour and free to forget, which is why they are written down twice.
   */
  const wingY = bellyY + depth * 0.6
  const WING: Readonly<Record<SongbirdBuild['wings'], readonly [number, number, number, number, number]>> = {
    //            w,     h,     d,    outX,  lean(rot.x)
    folded: [0.16, 0.5, 0.72, 0.5, 0.06],
    broad: [0.3, 0.42, 0.92, 0.56, 0.0],
    pointed: [0.14, 0.4, 1.1, 0.48, 0.18],
    tiny: [0.12, 0.32, 0.34, 0.46, 0.0],
  }
  const [ww, wh, wd, wx, wlean] = WING[spec.wings]
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const wing = box(`wing-${side}`, wide * ww, depth * wh, len * wd, c.coat)
    wing.position.set(s * wide * wx, wingY, -len * 0.04)
    wing.rotation.x = wlean
    rig.add(wing)
  }

  /* ---- extras ---- */

  const backY = bellyY + depth
  const crownY = headY + hd * 0.46

  const extra = (kind: SongbirdExtra): void => {
    switch (kind) {
      case 'crest': {
        // Cockatiel, jay, lapwing. Three blades on the crown, the same fan the
        // quadruped kit wears — a shared shape is a shared family look.
        for (const [i, tilt] of [-0.4, 0, 0.4].entries()) {
          const blade = box(`crest-${i + 1}`, hd * 0.08, hd * 0.42, hd * 0.18, c.accent)
          blade.position.set(Math.sin(tilt) * hd * 0.16, crownY + hd * 0.18, headZ - hd * 0.04)
          blade.rotation.z = tilt
          rig.add(blade)
        }
        break
      }
      case 'plume': {
        // Two long quills off the back of the crown — a heron's, a hoopoe's,
        // a quail's. Swept BACK over the skull, not up, so they cost height
        // rather than the keep-out radius.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const q = box(`plume-${side}`, hd * 0.07, hd * 0.07, hd * 0.9, c.accent)
          q.position.set(s * hd * 0.12, crownY + hd * 0.18, headZ - hd * 0.5)
          q.rotation.x = 0.4
          rig.add(q)
        }
        break
      }
      case 'eye-stripe':
        // The single most useful marking in the kit: it is what separates a
        // chiffchaff from a willow warbler and a jackdaw from a rook. A bar
        // through the eye, standing proud of the skull's side face.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const st = box(`eye-stripe-${side}`, hd * 0.12, hd * 0.13, hd * 0.86, c.accent)
          st.position.set(s * hd * 0.5, headY + hd * 0.16, headZ)
          rig.add(st)
        }
        break
      case 'cheek-patch':
        // Great tit, chickadee, barnacle goose. A pale slab on the side of the
        // face, below the eye and outside the skull.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const p = box(`cheek-${side}`, hd * 0.12, hd * 0.4, hd * 0.5, c.belly)
          p.position.set(s * hd * 0.5, headY - hd * 0.18, headZ + hd * 0.04)
          rig.add(p)
        }
        break
      case 'throat-bib': {
        // House sparrow, great tit, robin. Under the chin and onto the top of
        // the breast, standing forward of both.
        const bib = box('throat-bib', hd * 0.62, hd * 0.5, hd * 0.36, c.accent)
        bib.position.set(0, headY - hd * 0.5, headZ + hd * 0.3)
        rig.add(bib)
        break
      }
      case 'collar': {
        /*
         * Ring-necked dove, Canada goose, ringed plover. A band around the
         * neck, placed at 60% of the way from the shoulders to the skull — the
         * one position that works for the whole kit, because a bird with
         * `neck: 0` still has a shoulder-to-skull line and still gets a band.
         *
         * MEASURED: sat at the shoulder it was a mesh entirely inside the body,
         * the same fault as the buried eyes at `kit-quadruped.test.ts:164-175`.
         * At 60% it clears the body's top face and stays below the skull, so it
         * reads from the island's three-quarter camera at either extreme.
         */
        const band = lump('collar', hd * 0.86, hd * 0.26, hd * 0.86, c.belly)
        band.position.set(
          0,
          shoulderY + (headY - shoulderY) * 0.6,
          shoulderZ + (headZ - shoulderZ) * 0.6,
        )
        rig.add(band)
        break
      }
      case 'wing-bar':
        /*
         * A pale stripe along each wing — chaffinch, brambling, teal.
         *
         * NAMED `wingbar-*` AND NOT `wing-bar-*`, and that is not a typo.
         * `pets.ts:690` matches `/^wing-/`; a node called `wing-bar-left` would
         * be collected as a third and fourth flap target, which flips the
         * left/right sign the flap assigns by index and animates a stripe as if
         * it were a limb. `wingbar-` fails that regex, which is the whole
         * point.
         */
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const bar = box(`wingbar-${side}`, wide * 0.1, depth * 0.14, len * 0.5, c.belly)
          bar.position.set(s * wide * 0.58, wingY - depth * 0.06, -len * 0.04)
          rig.add(bar)
        }
        break
      case 'speckles':
        /*
         * Starling, thrush, guinea fowl. Four lumps along the back, standing
         * above the body's top face so they catch the light.
         *
         * They start at the MIDDLE of the back and run backwards, not at the
         * shoulder: the first attempt began at `z: 0.26` and the leading
         * speckle sat entirely inside the skull of a bird with `neck: 0`,
         * which is every robin, wren and sparrow in the kit.
         */
        for (const [i, z] of [0, -0.16, -0.32, -0.48].entries()) {
          const sp = lump(`speckle-${i + 1}`, wide * 0.2, depth * 0.16, len * 0.14, c.accent)
          sp.position.set(0, backY + depth * 0.06, len * z)
          rig.add(sp)
        }
        break
      case 'ruff': {
        // Vulture-necked storks, the ruff itself, a pelican's shoulders. A
        // collar of feathers where the neck meets the body — bigger than
        // `collar` and worn lower, so the two are not the same part twice.
        const r = lump('ruff', wide * 1.02, depth * 0.44, len * 0.44, c.accent)
        r.position.set(0, shoulderY + hd * 0.04, shoulderZ - len * 0.04)
        rig.add(r)
        break
      }
      case 'tail-streamer':
        // Swallow, tropicbird, long-tailed tit. Two thin rods trailing off the
        // tail root, lifted so most of the length is spent in y — the same
        // discipline the tails themselves keep.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const st = box(`streamer-${side}`, wide * 0.06, wide * 0.06, tailLen * 1.6, c.accent)
          st.position.set(s * wide * 0.1, tailY + tailLen * 0.5, tailZ - tailLen * 0.5)
          st.rotation.x = -0.75
          st.rotation.y = s * 0.14
          rig.add(st)
        }
        break
      case 'webbed-feet':
        // Duck, goose, swan, gull. Wide paddles instead of toes, in the detail
        // colour, sat on the ground and standing proud of the plain foot.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const w = box(`web-${side}`, legThick * 3.2, legLen * 0.12, legThick * 4.2, c.accent)
          w.position.set(s * legX, legLen * 0.06, legZ + legThick * 1.1)
          rig.add(w)
        }
        break
      case 'wattle': {
        // Turkey, chicken, cassowary. A lobe hanging under the beak, forward of
        // the throat and below the jaw so it reads from the side.
        const w = lump('wattle', hd * 0.26, hd * 0.44, hd * 0.24, c.accent)
        w.position.set(0, headY - hd * 0.52, headZ + hd * 0.42)
        rig.add(w)
        break
      }
    }
  }
  for (const kind of spec.extras ?? []) extra(kind)

  /* ---- fit ---- */

  // Measured, then fitted — never assumed. See `shared.ts`'s `fitRig`.
  fitRig(rig, height)

  const root = new THREE.Group()
  root.name = 'songbird'
  root.add(rig)
  // No `userData` is set anywhere in this file: `pets.ts:663` owns
  // `userData.pick`, and a nested payload confuses picking.
  return root
}
