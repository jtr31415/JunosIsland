/**
 * The raptor kit: every bird of prey in the roster, and the owls with them.
 *
 * Roster §1 — "Kits before species. Build the kit once; species become data" —
 * so there is one reference silhouette at module level, a BUZZARD, and every
 * part is derived from it by the multipliers in `RaptorBuild`. The primitives,
 * the colour maths and the fit all come from `shared.ts`, which the quadruped
 * and songbird kits already use; three kits with three private copies of
 * `box()` is three kits drifting away from each other.
 *
 * WHY THE REFERENCE IS A BUZZARD. The Raptors collection is sixteen birds and
 * the buzzard is the honest middle of it in every axis at once: mid-sized where
 * the eagle owl is huge and the merlin tiny, broad-winged where the peregrine
 * is pointed and the sparrowhawk rounded, deep-hooked where the owl's beak is
 * lost in feather, a plain fan tail against the kite's fork and the eagle's
 * wedge. Picking an eagle would make every other bird a shrunken eagle; picking
 * a kestrel would make every other bird an inflated kestrel. The buzzard makes
 * the multipliers read symmetrically in both directions, which is the whole
 * reason a reference silhouette exists.
 *
 * WHAT THIS KIT IS NOT. It is not `songbird.ts` with a hook bolted on, and the
 * two departures are deliberate and are argued in `types.ts` beside the
 * interface:
 *
 *   - NO `neck`. The songbird has one because a swan, a stork and a heron are
 *     separated by nothing else. Not one raptor in the roster has a neck worth
 *     a mesh; every species would author 0, and a field that is always 0 is a
 *     field that gets set to 1 by accident.
 *   - `talons` IS A NUMBER. Every raptor has talons — that is what the word
 *     means — so a flag in the extras list would be true sixteen times out of
 *     sixteen and would hand an osprey and a kestrel the same feet.
 *
 * THE HOOK LIVES HERE AND NOWHERE ELSE. `types.ts:172-180` left `'hooked'` out
 * of `SongbirdBuild.beak` on purpose so an owl could not be smuggled in as a
 * songbird; this file is the other end of that decision. There are no cones in
 * this repo (see `shared.ts`) and a hooked beak is the single part that most
 * tempts one: it is built as TWO BOXES, a tapered base off the face and a
 * shorter box hanging off its far end, plus one small third box for the
 * falcon's tomial notch. Read from three metres that is a hook.
 *
 * WHAT THE OUTPUT HAS TO SURVIVE — `pets.ts`, measured, not re-derived. The
 * quadruped and songbird headers state the contract at length and all of it
 * holds here unchanged. The two that bite differently for a raptor:
 *
 *   - `pets.ts:652` takes the keep-out radius from `max(width, depth) / 2` and
 *     the fit is UNIFORM and solves for HEIGHT. A raptor's long parts all run
 *     in z — the wings folded down the back, the tail behind them, the beak in
 *     front — so DEPTH is the axis this kit spends, and every tail below is
 *     swept UP off the body rather than trailed behind it for exactly that
 *     reason. The `pointed` wing of a peregrine is the single most expensive
 *     shape in the file and it is still cheaper than a fox.
 *   - `pets.ts:690` collects flap targets with `/^wing-/` and `pets.ts:858`
 *     then OVERWRITES those nodes' `rotation.z` every frame, alternating the
 *     sign by traversal index. THE DECISION, identical to the songbird's and
 *     for the identical reason: this kit names EXACTLY TWO nodes `wing-left`
 *     and `wing-right`, in that order, and nothing else in the file carries the
 *     `wing-` prefix. The wing meshes therefore author no `rotation.z`, because
 *     it would be thrown away, and their lean lives in `rotation.x`. Nothing
 *     flaps today — flapping is gated on `species/moves.ts`, where whether an
 *     animal flies is set per species in the workbench editor, not a constant
 *     anyone edits here — but the day an eagle is marked as flying, its wings
 *     move and the correct one leads.
 *
 * NOTHING BUILT HERE IS EVER DISPOSED PER PET — `pets.ts:592` hands out
 * `.clone(true)` and a clone shares geometry and materials. See the quadruped
 * header for the full reason; it applies here unchanged.
 */
import * as THREE from 'three'
import type { KitPalette, RaptorBuild, RaptorExtra, Rgb } from '../types'
import { darker, fitRig, lighter, parts } from './shared'

/**
 * The reference silhouette, in Kenney units, with every multiplier at 1 — a
 * buzzard, perched.
 *
 * PROPORTIONS TAKEN FROM THE PACK, not from a field guide, the same discipline
 * the songbird's `REF` records: the 24 shipped GLBs measure mean width/height
 * 0.97 and depth/height 0.95, so a Kenney pet is very nearly as wide as it is
 * tall, and a first pass built to real anatomy reads as a total stranger beside
 * `animal-fox`. Against the songbird's robin this bird is heavier everywhere —
 * a deeper chest, a bigger head, thicker legs, a longer tail — which is what a
 * buzzard actually is next to a robin, and is also what keeps the two kits from
 * producing the same bird from the same numbers.
 *
 * These are pre-fit numbers. The finished rig is scaled so its measured height
 * is exactly `spec.height`, so `REF.height` below sets no promise about the
 * output at all — it is the height the other proportions were judged against.
 */
const REF = {
  /** A buzzard against the pack's own birds: taller than `animal-parrot`'s 1.55. */
  height: 1.9,
  /**
   * Torso extent along z, breast to tail-root.
   *
   * Longer than the robin's 0.8 and still SHORTER THAN THE WIDTH, because the
   * depth budget in this kit is spent on the wings and the tail rather than on
   * the body. A buzzard perched is a barrel, not a boat.
   */
  bodyLength: 0.86,
  /** Torso extent along x. Wide, because the pack is wide — see above. */
  bodyWidth: 0.96,
  /** Torso extent along y. The deepest chest of the three kits: it is all flight muscle. */
  bodyDepth: 0.94,
  /** Ground to belly. Short — a perched raptor sits down over its feet. */
  legLength: 0.34,
  /** Thick. A buzzard's tarsus is a wrist; a robin's is a wire. */
  legThick: 0.17,
  /** Head cube edge. Bigger than the songbird's 0.5: the head is the weapon mount. */
  head: 0.56,
  /** Beak length at `head: 1`, before the per-beak multipliers. */
  beak: 0.28,
  /** Tail length at `body: 1`. Longer than the songbird's 0.46 — raptors steer with it. */
  tail: 0.56,
  /**
   * What ONE unit of `talons` is worth, in pre-fit units.
   *
   * Small on purpose. Talons are low and forward, so they land in the shadow of
   * the beak on the depth axis and cost the keep-out radius almost nothing even
   * at `talons: 2` — which is what makes a size dial affordable where a bigger
   * part would have forced a boolean.
   */
  talon: 0.11,
} as const

/**
 * What a multiplier is allowed to be.
 *
 * Same argument as `quadruped.ts:96-143` and `songbird.ts:108-134`: the data
 * will be hand-written species records, one `head: 12` where `1.2` was meant is
 * a bird the size of a tree, and clamping is cheaper than trusting. The bounds
 * are raptor-shaped rather than borrowed —
 *
 *   - `body` runs 0.6 to 1.5, a NARROWER spread than the songbird's 0.5–1.7.
 *     That kit had to stretch from a wren to a heron; this one runs from a
 *     merlin to a golden eagle, and both of those are the same compact plan at
 *     different sizes. Most of the difference between them is `height`.
 *   - `head` reaches 1.7. An owl's head is genuinely most of the bird, and it
 *     is the axis that separates a tawny owl from a sparrowhawk of the same
 *     height without a single new part.
 *   - `legs` stops at 2.0 rather than the songbird's 3.0. There is no wader
 *     here; a goshawk is the longest-legged bird in the collection and it is
 *     nowhere near a flamingo.
 *   - `talons` starts at 0.2 rather than 0, because 0 would be a bird of prey
 *     with no feet and there is no such thing. The floor is "a kestrel's",
 *     which is small, not "none".
 *
 * `height` is clamped to `types.ts`'s stated 1.2–2.6 for the reason stated
 * there: outside it a species stops sitting beside the live pack.
 *
 * A NOTE ON WHAT CLAMPING CANNOT DO, carried over because it cost three
 * collections to learn: the fit is uniform and solves for height, so pushing
 * `legs` DOWN raises the fit scale and stretches the bird in world units. Tune
 * against `tests/island/kit-raptor.test.ts`'s worked examples and against
 * `species-silhouette.test.ts`, not against intuition.
 */
const LIMIT = {
  height: [1.2, 2.6],
  body: [0.6, 1.5],
  head: [0.6, 1.7],
  legs: [0.3, 2.0],
  talons: [0.2, 2.2],
} as const

const clamp = (v: number, lo: number, hi: number): number =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo

/**
 * The eye, as a kit constant rather than as a palette entry.
 *
 * The songbird repeats Fred's `EYE_WHITE`/`PUPIL` (`fred.ts:35-36`) rather than
 * importing them, so that a retune of the frog cannot move every bird's eyes;
 * the same reasoning applies here and the same shape is used, but the COLOUR is
 * different on purpose. A raptor shows no white at all — the eye is one huge
 * iris with a black pupil in it, and that ring of hard yellow is the second
 * thing a child reads after the hook. Making it a palette field instead would
 * let a species record hand a buzzard pink eyes, which is not a differentiation
 * anyone needs.
 */
const IRIS = 0xf2c14a
const PUPIL = 0x1b2a33

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
 * The three hooks, as fractions of the head cube.
 *
 * `[baseW, baseH, baseD, hookW, hookH, hookD]`, plus whether the shape carries
 * a tomial notch. The BASE is the tapered box off the face and the HOOK is the
 * shorter box hanging off its far end — two boxes, which is the entire trick
 * that keeps a `ConeGeometry` out of `src/`.
 */
const BEAK: Readonly<Record<RaptorBuild['beak'], readonly [number, number, number, number, number, number, boolean]>> = {
  //             baseW, baseH, baseD, hookW, hookH, hookD, notch
  'deep-hook': [0.36, 0.34, 0.5, 0.28, 0.46, 0.22, false],
  'notched-hook': [0.25, 0.26, 0.46, 0.18, 0.34, 0.17, true],
  'small-hook': [0.27, 0.25, 0.32, 0.19, 0.27, 0.15, false],
}

/**
 * The three wing plans, as fractions of the body box.
 *
 * `[thickness/width, chord/depth, reach/length, outX/width, lean]`. All three
 * are the SAME TWO MESHES at different proportions — that is the claim
 * `types.ts` makes when it calls the wing a proportion and not a part, and this
 * table is what makes it true.
 */
const WING: Readonly<Record<RaptorBuild['wings'], readonly [number, number, number, number, number]>> = {
  /** Eagle, buzzard, owl: a barn door. Deep chord, moderate reach. */
  broad: [0.26, 0.6, 0.92, 0.56, 0.0],
  /** Peregrine, hobby, merlin: a scythe. Narrow chord, reaching past the tail root. */
  pointed: [0.15, 0.46, 1.18, 0.5, 0.1],
  /** Sparrowhawk, goshawk: short and blunt, for turning inside a hedge. */
  rounded: [0.22, 0.52, 0.7, 0.54, 0.0],
}

/**
 * The five tails, as `[width/bodyWidth, thickness/bodyDepth, reach/tailLen, tilt]`.
 *
 * EVERY ONE IS SWEPT UP rather than trailed back. `pets.ts:652` charges depth,
 * and a red kite that trailed its fork a body-length behind it would hand the
 * lightest bird in the collection an eagle's keep-out circle and stretch its
 * blob shadow to match. The songbird kit learned this on the magpie and the
 * quadruped kit on the fox's brush.
 *
 * The tilt is what turns the plate's length into HEIGHT: a slab of reach `L`
 * rotated by `t` about x spends `L·sin|t|` in y and only `L·cos|t|` in z.
 */
const TAIL: Readonly<Record<RaptorBuild['tail'], readonly [number, number, number, number]>> = {
  /** Buzzard, owl, harpy: wide and short, spread like a hand. */
  fan: [0.84, 0.13, 0.85, -0.85],
  /** Goshawk, merlin, sparrowhawk: narrower, square-ended, no taper. */
  square: [0.54, 0.15, 1.0, -0.78],
  /** Harrier, kestrel: long and narrow, and cocked hardest so the length is spent in y. */
  long: [0.36, 0.12, 1.55, -1.0],
  /** Golden eagle: a taper, built as two boxes because there are no cones here. */
  wedge: [0.6, 0.14, 1.15, -0.84],
  /** Red kite, and only the red kite. Two blades splaying out and up. */
  forked: [0.44, 0.12, 1.3, -0.8],
}

/**
 * Build one raptor, standing at the origin with its feet on y = 0.
 *
 * The returned group's own transform is left at identity because `pets.ts:643`
 * overwrites its scale. All the fitting lives on a single child, `rig`.
 */
export function buildRaptor(spec: RaptorBuild): THREE.Group {
  const height = clamp(spec.height, LIMIT.height[0], LIMIT.height[1])
  const bodyM = clamp(spec.body, LIMIT.body[0], LIMIT.body[1])
  const headM = clamp(spec.head, LIMIT.head[0], LIMIT.head[1])
  const legM = clamp(spec.legs, LIMIT.legs[0], LIMIT.legs[1])
  const talonM = clamp(spec.talons, LIMIT.talons[0], LIMIT.talons[1])
  const c = coatsOf(spec.palette)

  /*
   * Roughly constant volume, as both older kits do it, so `body` reads the way
   * `types.ts` describes it — a merlin is a fist, an eagle is a barrel. Length
   * up, the two cross-sections down with it; a single length multiplier at
   * fixed girth makes a long bird look inflated rather than lean.
   */
  const len = REF.bodyLength * bodyM
  const depth = REF.bodyDepth / Math.sqrt(bodyM)
  const wide = REF.bodyWidth / Math.pow(bodyM, 0.25)
  const legLen = REF.legLength * legM
  const legThick = REF.legThick * (wide / REF.bodyWidth)
  const hd = REF.head * headM
  const tal = REF.talon * talonM

  const { box, lump } = parts()

  const rig = new THREE.Group()
  rig.name = 'rig'

  /* ---- body ---- */

  const bellyY = legLen
  const body = box('body', wide, depth, len, c.coat)
  body.position.y = bellyY + depth / 2
  rig.add(body)

  /*
   * The breast, PROUD of the body rather than flush with it — the fault the
   * quadruped's belly had and the songbird inherited the fix for: a mesh inset
   * on every axis is a mesh entirely inside another mesh, and the second colour
   * never reaches the screen. A raptor wears it on the FRONT, which is where a
   * buzzard's pale band and a sparrowhawk's barring actually are.
   */
  const breast = lump('breast', wide * 0.86, depth * 0.86, len * 0.5, c.belly)
  breast.position.set(0, bellyY + depth * 0.48, len * 0.3)
  rig.add(breast)

  /* ---- legs, feet and talons ---- */

  const legX = wide * 0.24
  const legZ = len * 0.08

  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const leg = box(`leg-${side}`, legThick, legLen, legThick, c.detail)
    leg.position.set(s * legX, legLen / 2, legZ)
    rig.add(leg)
    const foot = box(`foot-${side}`, legThick * 1.7, legLen * 0.18, legThick * 2.4, c.detail)
    foot.position.set(s * legX, legLen * 0.09, legZ + legThick * 0.6)
    rig.add(foot)

    /*
     * THREE CLAWS PER FOOT, sized by `talons`.
     *
     * Three rather than four because the fourth is the hallux and it points
     * BACKWARD, where it would be hidden by the foot from every angle the
     * island's three-quarter camera can reach — and would still be charged for
     * on the depth axis. Three forward claws is what a child sees.
     *
     * They sit ON the ground (`y = talH / 2`), which matters: `fitRig` measures
     * the built box and puts its lowest point on y = 0, so the claws and the
     * feet touch down together instead of the claws hanging in the air or
     * levering the whole bird upward.
     */
    const talH = tal * 0.5
    const talW = tal * 0.44
    for (const [i, j] of [-1, 0, 1].entries()) {
      const claw = box(`talon-${side}-${i + 1}`, talW, talH, tal, c.accent)
      claw.position.set(
        s * legX + j * talW * 1.7,
        talH / 2,
        // In FRONT of the toe box, by a fraction of the claw's own length, so
        // the projection scales with the dial. MEASURED: sat at a fixed offset
        // the claws were entirely inside the foot at every setting — real
        // geometry, real vertex count, and invisible from every angle, which is
        // the buried-eye fault the two older kits both shipped once.
        legZ + legThick * 1.8 + tal * 0.42,
      )
      rig.add(claw)
    }
  }

  /* ---- head ---- */

  /*
   * No neck mesh and no neck field — see the file header. The skull sits down
   * onto the shoulders and slightly forward, which is a perched raptor's whole
   * posture: hunched, with the head pushed out over the breast.
   */
  /*
   * MEASURED, and the numbers are load-bearing at the SMALL end of `head`
   * rather than the large one. A first pass sat the skull at `depth * 0.84` and
   * pushed it forward by `hd * 0.15`; at `head: 0.6` — a sparrowhawk, and a
   * legal value — the whole face then fell inside the bounding box of the body
   * and breast, so the beak, the eyes and the malar stripe were real geometry
   * that no camera could reach. The fix is to hang the head off the SHOULDER
   * height rather than off the head's own size: the skull clears the back at
   * every legal `head`, and the beak clears the breast, because neither offset
   * shrinks when the head does.
   */
  const shoulderY = bellyY + depth * 0.92
  const headY = shoulderY + hd * 0.4
  const headZ = len * 0.26 + hd * 0.06
  const crownY = headY + hd * 0.46
  const faceZ = headZ + hd * 0.47

  const head = box('head', hd, hd * 0.92, hd * 0.94, c.coat)
  head.position.set(0, headY, headZ)
  rig.add(head)

  /*
   * EYES FORWARD, and this is the one place the raptor's face is built
   * differently from the songbird's rather than merely differently proportioned.
   * A robin's eyes break the SIDE faces of its skull because a songbird's eyes
   * are on the sides of its head; a raptor's are on the FRONT, both looking the
   * same way, because it hunts in binocular vision. That is the difference
   * between a face that looks at you and a face that looks past you, and at
   * 0.16 scale it is most of what says "predator".
   *
   * They protrude rather than being set in — `fred.ts:108-109` and the bug at
   * `kit-quadruped.test.ts:164-175`, where both eye meshes sat entirely inside
   * the skull and every other assertion still passed.
   */
  const eyeY = headY + hd * 0.14
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const iris = lump(`eye-${side}`, hd * 0.34, hd * 0.34, hd * 0.22, IRIS)
    iris.position.set(s * hd * 0.28, eyeY, faceZ)
    const pupil = lump(`pupil-${side}`, hd * 0.2, hd * 0.2, hd * 0.14, PUPIL)
    pupil.position.set(s * hd * 0.28, eyeY, faceZ + hd * 0.07)
    rig.add(iris, pupil)
  }

  /* ---- beak: the hook, and the only place in the codebase it exists ---- */

  /*
   * Two boxes and, for a falcon, a third the size of a tooth. `beak` is the
   * tapered base off the face; `beak-hook` hangs off its far end and overlaps
   * it at the top, so the two read as one curve rather than as two blocks;
   * `beak-tooth` is the tomial notch, which is the falcon's and nothing else's.
   *
   * There is no `'straight'` value and there never will be — a raptor without a
   * hook is a songbird, and `types.ts:172-180` says which kit owns which.
   */
  const [bw, bh, bd, kw, kh, kd, notch] = BEAK[spec.beak]
  const beakY = headY - hd * 0.08
  const baseLen = REF.beak * bd * headM

  const beak = box('beak', hd * bw, hd * bh, baseLen, c.detail)
  beak.position.set(0, beakY, faceZ + baseLen * 0.5)
  const hook = box('beak-hook', hd * kw, hd * kh, REF.beak * kd * headM, darker(c.detail, 0.22))
  hook.position.set(
    0,
    beakY - hd * bh * 0.4 - hd * kh * 0.34,
    faceZ + baseLen * 0.88,
  )
  rig.add(beak, hook)
  if (notch) {
    // The tomial tooth: the notch on the cutting edge a peregrine kills with,
    // and the one thing that separates a falcon's profile from a hawk's.
    const tooth = box('beak-tooth', hd * kw * 0.8, hd * kh * 0.34, baseLen * 0.16, darker(c.detail, 0.22))
    tooth.position.set(0, beakY - hd * bh * 0.5, faceZ + baseLen * 0.52)
    rig.add(tooth)
  }

  /* ---- tail ---- */

  const tailLen = REF.tail * bodyM
  const tailRootZ = -len / 2
  const tailRootY = bellyY + depth * 0.6
  const [tw, tt, tr, tilt] = TAIL[spec.tail]
  const tailW = wide * tw
  const tailThick = depth * tt
  const reach = tailLen * tr
  /*
   * Where the plate's centre sits, and the axis it runs along. Both are hoisted
   * out of the switch because the `tail-bands` extra has to place itself on
   * whichever tail was built — a barred tail is a marking on the tail, not a
   * fifth tail shape, and duplicating this frame inside the extra is how the
   * two would silently drift apart.
   */
  const tailCY = tailRootY + reach * 0.34
  const tailCZ = tailRootZ - reach * 0.2
  /** Local +z after `rotation.x = tilt`: (0, -sin t, cos t). */
  const axisY = -Math.sin(tilt)
  const axisZ = Math.cos(tilt)

  switch (spec.tail) {
    case 'fan': {
      const t = box('tail', tailW, tailThick, reach, c.coat)
      t.position.set(0, tailCY, tailCZ)
      t.rotation.x = tilt
      const edge = box('tail-tip', tailW * 0.94, tailThick * 0.8, reach * 0.2, c.accent)
      edge.position.set(0, tailCY + axisY * reach * 0.42, tailCZ + axisZ * reach * 0.42)
      edge.rotation.x = tilt
      rig.add(t, edge)
      break
    }
    case 'square': {
      // No taper and no tip: a goshawk's tail ends in a straight line, and that
      // squared-off end is exactly what tells it from a wedge at distance.
      const t = box('tail', tailW, tailThick, reach, c.coat)
      t.position.set(0, tailCY, tailCZ)
      t.rotation.x = tilt
      rig.add(t)
      break
    }
    case 'long': {
      const t = box('tail', tailW, tailThick, reach, c.coat)
      t.position.set(0, tailCY, tailCZ)
      t.rotation.x = tilt
      const tip = box('tail-tip', tailW * 0.9, tailThick * 0.85, reach * 0.22, c.accent)
      tip.position.set(0, tailCY + axisY * reach * 0.4, tailCZ + axisZ * reach * 0.4)
      tip.rotation.x = tilt
      rig.add(t, tip)
      break
    }
    case 'wedge': {
      // Two boxes, the outer one narrower — the same taper trick the beak uses,
      // for the same reason: `src/` has no cone and is not getting one.
      const t = box('tail', tailW, tailThick, reach * 0.72, c.coat)
      t.position.set(0, tailCY, tailCZ)
      t.rotation.x = tilt
      const tip = box('tail-tip', tailW * 0.55, tailThick * 0.85, reach * 0.42, c.accent)
      tip.position.set(0, tailCY + axisY * reach * 0.5, tailCZ + axisZ * reach * 0.5)
      tip.rotation.x = tilt
      rig.add(t, tip)
      break
    }
    case 'forked': {
      // The red kite, and the red kite is this tail. Two blades splaying out
      // and up, with a real gap between them — the fork IS the bird.
      for (const [side, s] of [['left', -1], ['right', 1]] as const) {
        const t = box(`tail-${side}`, tailW * 0.42, tailThick, reach, c.coat)
        t.position.set(s * tailW * 0.32, tailCY, tailCZ)
        t.rotation.x = tilt
        t.rotation.y = s * 0.2
        rig.add(t)
      }
      break
    }
  }

  /* ---- wings ---- */

  /*
   * EXACTLY TWO NODES CARRY THE `wing-` PREFIX, left first then right, and no
   * `rotation.z` is authored on either. See the file header: `pets.ts:690`
   * collects them and `pets.ts:858` overwrites `rotation.z` by traversal index,
   * so a third `wing-*` node would flip which wing gets which sign, and an
   * authored roll would be silently discarded on the first animated frame.
   * Both constraints are cheap to honour and free to forget, which is why they
   * are written down twice.
   */
  const wingY = bellyY + depth * 0.58
  const [ww, wh, wd, wx, wlean] = WING[spec.wings]
  for (const [side, s] of [['left', -1], ['right', 1]] as const) {
    const wing = box(`wing-${side}`, wide * ww, depth * wh, len * wd, c.coat)
    wing.position.set(s * wide * wx, wingY, -len * 0.06)
    wing.rotation.x = wlean
    rig.add(wing)
  }

  /* ---- extras ---- */

  const backY = bellyY + depth

  const extra = (kind: RaptorExtra): void => {
    switch (kind) {
      case 'facial-disc': {
        /*
         * The owl's dish, and the harrier's. A flat plate across the whole
         * front of the skull, wider and taller than the head so it reads as a
         * rim rather than as a repainted face, with the eyes still standing
         * proud of it — an owl is a face with two eyes in it, and if the disc
         * swallowed them it would be a plate.
         */
        const disc = lump('facial-disc', hd * 1.2, hd * 1.1, hd * 0.34, c.belly)
        disc.position.set(0, headY + hd * 0.06, headZ + hd * 0.4)
        rig.add(disc)
        break
      }
      case 'ear-tufts':
        // Eagle owl, long-eared owl. TWO blades at the corners of the crown,
        // splayed outward — deliberately not the three centred blades `crest`
        // builds, because the whole job of this part is to be tellable from a
        // crest at silhouette.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const tuft = box(`ear-tuft-${side}`, hd * 0.16, hd * 0.62, hd * 0.2, c.accent)
          tuft.position.set(s * hd * 0.3, crownY + hd * 0.26, headZ - hd * 0.02)
          tuft.rotation.z = s * 0.3
          rig.add(tuft)
        }
        break
      case 'brow':
        /*
         * The supraorbital ridge — the scowl. Every diurnal raptor has one and
         * no owl does, which is what makes this the part that says "hawk" once
         * the facial disc is off. Angled DOWN toward the middle: that inward
         * slope is the entire expression, and a level ridge reads as a hat.
         */
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const ridge = box(`brow-${side}`, hd * 0.42, hd * 0.15, hd * 0.24, c.accent)
          ridge.position.set(s * hd * 0.26, headY + hd * 0.32, headZ + hd * 0.46)
          ridge.rotation.z = -s * 0.25
          rig.add(ridge)
        }
        break
      case 'crest': {
        // Harpy eagle and the crested hawk-eagles. The same three blades the
        // quadruped and songbird kits wear — a shared shape is a family look,
        // and this is the one extra all three kits have in common.
        for (const [i, t] of [-0.4, 0, 0.4].entries()) {
          const blade = box(`crest-${i + 1}`, hd * 0.09, hd * 0.44, hd * 0.2, c.accent)
          blade.position.set(Math.sin(t) * hd * 0.18, crownY + hd * 0.2, headZ - hd * 0.06)
          blade.rotation.z = t
          rig.add(blade)
        }
        break
      }
      case 'hood': {
        /*
         * A contrasting crown and nape: the bald eagle's white head, the
         * osprey's crown, the male hen harrier's grey.
         *
         * THIS PART EXISTS BECAUSE THE SKULL IS BUILT IN `coat`. Without it a
         * two-tone head is not expressible by any combination of palette and
         * proportion, and a bald eagle is a two-tone head. It is a CAP over the
         * crown and back of the skull rather than a shell around it, so the
         * face, the eyes and the beak all stay in their own colours.
         */
        const cap = lump('hood', hd * 1.04, hd * 0.56, hd * 1.06, c.belly)
        cap.position.set(0, headY + hd * 0.3, headZ - hd * 0.04)
        rig.add(cap)
        break
      }
      case 'moustache':
        // The falcon's malar stripe, hanging from under the eye down the cheek.
        // Peregrine, hobby, merlin, kestrel — the confusable group `types.ts`
        // flags as needing the most help, and this is the marking a field guide
        // actually uses on them.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const bar = box(`moustache-${side}`, hd * 0.16, hd * 0.4, hd * 0.18, c.accent)
          bar.position.set(s * hd * 0.3, headY - hd * 0.18, headZ + hd * 0.45)
          rig.add(bar)
        }
        break
      case 'barred-breast':
        /*
         * The barred underparts of the accipiters, the buzzard and the kestrel.
         * Three bars ACROSS the breast, standing proud of the breast lump's
         * front face — sat flush they were a mesh entirely inside another mesh,
         * which is the buried-eye fault the two older kits both shipped once.
         */
        for (const i of [0, 1, 2]) {
          const bar = box(`breast-bar-${i + 1}`, wide * 0.6, depth * 0.08, len * 0.1, c.accent)
          bar.position.set(0, bellyY + depth * (0.34 + i * 0.2), len * 0.55)
          rig.add(bar)
        }
        break
      case 'tail-bands':
        /*
         * The barred tail — sparrowhawk, kestrel, harrier, goshawk. Placed on
         * the tail's own frame (`tailCY`/`tailCZ`/`tilt`, hoisted above the
         * switch) so it lands correctly on whichever of the five tails was
         * built, and made WIDER and THICKER than the plate it sits on so it
         * stands proud of every one of them instead of vanishing inside the
         * fan.
         */
        for (const [i, u] of [0.12, -0.22].entries()) {
          const band = box(
            `tail-band-${i + 1}`,
            tailW * 1.1, tailThick * 1.6, reach * 0.12, c.accent,
          )
          band.position.set(0, tailCY + axisY * reach * u, tailCZ + axisZ * reach * u)
          band.rotation.x = tilt
          rig.add(band)
        }
        break
      case 'speckles': {
        /*
         * A spotted mantle: kestrel, eagle owl, most juveniles. Four lumps
         * along the back, standing above the body's top face.
         *
         * THE RUN IS FITTED TO THE BACK THE SKULL LEAVES, not written as four
         * fixed offsets. The songbird kit's first pass used fixed offsets and
         * the leading speckle sat entirely inside the skull of every bird with
         * `neck: 0`; this kit hit the same fault harder, because an owl at
         * `head: 1.7` is mostly head and its skull overhangs a third of its own
         * back. So the run starts behind whichever is further back — the
         * shoulder or the rear of the skull — and is spaced to reach the tail
         * root from wherever that is.
         */
        const rear = -len * 0.46
        const front = Math.max(rear + len * 0.06, Math.min(-len * 0.04, headZ - hd * 0.55))
        const step = (front - rear) / 3
        for (const i of [0, 1, 2, 3]) {
          const sp = lump(`speckle-${i + 1}`, wide * 0.24, depth * 0.14, len * 0.16, c.accent)
          sp.position.set(0, backY + depth * 0.04, front - step * i)
          rig.add(sp)
        }
        break
      }
      case 'trousers':
        // Feathered tarsi: golden eagle against bald eagle, eagle owl against
        // tawny, the hobby's rufous leggings. A shaggy block around the top of
        // each leg, tucked just under the belly so it never enters the body.
        for (const [side, s] of [['left', -1], ['right', 1]] as const) {
          const leg = box(`trouser-${side}`, legThick * 2.6, legLen * 0.72, legThick * 2.6, c.accent)
          leg.position.set(s * legX, legLen * 0.6, legZ)
          rig.add(leg)
        }
        break
    }
  }
  for (const kind of spec.extras ?? []) extra(kind)

  /* ---- fit ---- */

  // Measured, then fitted — never assumed. See `shared.ts`'s `fitRig`. Ear
  // tufts and a cocked tail both raise the raw silhouette, and both are paid
  // for here rather than guessed at.
  fitRig(rig, height)

  const root = new THREE.Group()
  root.name = 'raptor'
  root.add(rig)
  // No `userData` is set anywhere in this file: `pets.ts:663` owns
  // `userData.pick`, and a nested payload confuses picking.
  return root
}
