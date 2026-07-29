/**
 * The kit registry: which builder makes a species, and what a set colour means
 * to something that has no texture.
 *
 * `types.ts` says what a species IS; this says how one becomes geometry. Today
 * there are two kits — quadruped, which roster §1 puts at ~150 of the 296 new
 * species, and songbird, which carries every bird that is not a raptor — and
 * four that are declared but unbuilt. Asking for one of those four is an ERROR,
 * loudly, because HANDOFF §6:565 records the failure mode a
 * quiet fallback produces: a widened union is invisible to the compiler and the
 * bug surfaces as a creature that renders as nothing, weeks later, on a child's
 * tablet. An empty group is the worst possible answer here.
 */
import * as THREE from 'three'
import type { BuildSpec, KitId, KitPalette, Rgb } from './types'
import { buildQuadruped } from './kits/quadruped'
import { buildSongbird } from './kits/songbird'
import type { SetPalette } from '../variants/recolour'
import { isNatural, shade, STRIPE, patterned } from '../variants/recolour'

/** One kit: an id and a way to turn a spec into a standing creature. */
export interface Kit {
  id: KitId
  build(spec: BuildSpec): THREE.Group
}

/**
 * Asking for a kit that cannot build.
 *
 * Named, and carrying the kit as a field rather than only in the message, so a
 * caller can branch on it without parsing English — a roster validation pass
 * wants the kit, a crash report wants the sentence.
 */
export class UnbuiltKitError extends Error {
  readonly kit: string
  constructor(kit: string, why: string) {
    super(`kit '${kit}' cannot build: ${why}`)
    this.name = 'UnbuiltKitError'
    this.kit = kit
  }
}

const quadruped: Kit = {
  id: 'quadruped',
  build(spec) {
    // The registry is keyed by KitId and the union is discriminated by the same
    // field, but a lookup cannot prove that to the compiler — so the kit checks
    // its own spec rather than casting. A mismatch here is a data fault worth
    // hearing about.
    if (spec.kit !== 'quadruped') {
      throw new UnbuiltKitError(spec.kit, "the quadruped kit was handed another kit's spec")
    }
    return buildQuadruped(spec)
  },
}

const songbird: Kit = {
  id: 'songbird',
  build(spec) {
    // Same guard, same reason as the quadruped's above: the registry is keyed
    // by KitId and the union is discriminated by the same field, but a lookup
    // cannot prove that to the compiler.
    if (spec.kit !== 'songbird') {
      throw new UnbuiltKitError(spec.kit, "the songbird kit was handed another kit's spec")
    }
    return buildSongbird(spec)
  },
}

/** Every kit that can build, by id. Four of the six are still missing. */
export const KITS: Readonly<Partial<Record<KitId, Kit>>> = { quadruped, songbird }

/**
 * Why a kit is not here yet, in words a stack trace can carry.
 *
 * `kenney` is not "unbuilt" in the same sense and must never be given a builder:
 * the live 24 are authored GLBs loaded by `pets.ts:560`, frozen by roster §1,
 * and a procedural stand-in for one of them would replace a friend she already
 * owns — brief §19.
 */
const WHY: Readonly<Record<KitId, string>> = {
  kenney: 'the live 24 are authored GLBs, loaded by pets.ts:560 and never built',
  quadruped: 'built',
  songbird: 'built',
  raptor: 'declared in types.ts PendingBuild but not built yet (quadruped and songbird are built)',
  swim: 'declared in types.ts PendingBuild but not built yet (quadruped and songbird are built)',
  minibeast: 'declared in types.ts PendingBuild but not built yet (quadruped and songbird are built)',
  bespoke: 'declared in types.ts PendingBuild but not built yet (quadruped and songbird are built)',
}

/**
 * Build a species from its spec.
 *
 * Throws rather than returning an empty group for anything without a kit. The
 * `kenney` case is reachable at runtime even though `BuildSpec` excludes it —
 * a species record is data, and data arrives from JSON where the type is a
 * promise rather than a guarantee.
 */
export function buildSpecies(spec: BuildSpec): THREE.Group {
  const kit = (spec as { kit: KitId }).kit
  const found = KITS[kit]
  if (!found) throw new UnbuiltKitError(kit, WHY[kit] ?? 'no such kit')
  return found.build(spec)
}

/* --------------------------------------------------------------- colour --- */

/**
 * Where each coat sits on the set's light-to-dark ramp.
 *
 * The atlas path gets this for free: `recolour.ts` normalises each species'
 * own light-to-dark range per 64px band and maps it onto the ramp, so a polar
 * bear takes a set as completely as a fox does. A built pet has no bands to
 * measure — its coats are four numbers — so the ramp positions are stated here
 * instead, once, and every built species shares them. That is what keeps a
 * built stoat and a built fox recognisably the SAME set.
 */
const RAMP: Readonly<Record<keyof KitPalette, number>> = {
  belly: 0.95,
  coat: 0.62,
  detail: 0.44,
  accent: 0.22,
}

/**
 * Which stripe band each coat is treated as sitting in.
 *
 * `Pattern` (`recolour.ts:61`) has exactly two values because the atlas can
 * only carry a function of v — see the note there, and Joe's ruling that the
 * dots were dropped. A built pet has no texels at all, so 'stripy' cannot be
 * bands across a face; what it CAN be, honestly, is the same two shades of the
 * set's colour worn as a bold two-tone, which is what `patterned()` already
 * computes. The y values below are one STRIPE apart so adjacent coats land on
 * opposite sides of the band test.
 */
const BAND_Y: Readonly<Record<keyof KitPalette, number>> = {
  belly: STRIPE,
  coat: 0,
  detail: STRIPE,
  accent: 0,
}

const pack = ([r, g, b]: [number, number, number]): Rgb => (r << 16) | (g << 8) | b

/**
 * The set colour, for something with no texture.
 *
 * THE FORK, stated once: the live 24 get their set colour from a recoloured
 * atlas — `variants/atlas.ts:146 dress()` assigns a `map`. A built pet has no
 * atlas UVs, so `dress()` must NEVER be applied to it; it would paste atlas
 * texels through garbage coordinates. Built species take their set colour here
 * instead, as per-part material colour, Fred's way, which is why `KitPalette`
 * (`types.ts:90`) is plain RGB and not a texture.
 *
 * THE NATURAL SET IS A TRUE NO-OP. `recolour.ts:361-365`: the natural set "has
 * to be bit-identical rather than merely close — that is what makes the friends
 * she already owns provably unchanged". The atlas path holds the equivalent
 * line at `recolour.test.ts:585`. Here it is the same base object, returned
 * unchanged, so there is not even a rounding trip to argue about.
 *
 * The returned palette has exactly the keys the base had: a species that
 * authored no `accent` does not acquire one from a set, because the kit's own
 * fallback (`quadruped.ts` `coatsOf`) is what decides what an absent accent
 * looks like, and a set must not quietly overrule it.
 */
export function paletteFor(base: KitPalette, set: SetPalette): KitPalette {
  if (isNatural(set)) return base
  const of = (role: keyof KitPalette): Rgb =>
    pack(shade(patterned(RAMP[role], 0, BAND_Y[role], set.pattern), set))
  const out: KitPalette = { coat: of('coat') }
  if (base.belly !== undefined) out.belly = of('belly')
  if (base.detail !== undefined) out.detail = of('detail')
  if (base.accent !== undefined) out.accent = of('accent')
  return out
}

/* ----------------------------------------------------------------- seam --- */

/*
 * THE INTEGRATION SEAM — documented, deliberately NOT wired.
 *
 * Nothing built ships this run: there is no built species in the roster data
 * yet, so wiring this now would be dead code sitting next to live work in
 * `pets.ts`. When the first collection ships, the whole change is one early
 * return at the top of `prototype()`, `src/island/pets.ts:554`, before the
 * `loader.loadAsync` line at `pets.ts:560`:
 *
 *     const spec = SPECIES.get(species)?.build
 *     if (spec) return cache.set(species, Promise.resolve(buildSpecies(spec))).get(species)!
 *
 * Three things about that line are load-bearing:
 *
 *   1. It goes INSIDE `prototype()` and not in `model()`, so the built group is
 *      cached and every pet of the species clones one prototype — the same
 *      sharing the GLB path gets from `cache` (`pets.ts:555`).
 *   2. It returns BEFORE `flattenImported` and `wearFaceUVs`. Both are no-ops
 *      on built geometry (the materials already match, and `facedecals.ts:91`
 *      returns 0 for an unknown species), so skipping them costs nothing and
 *      saves a traverse per species.
 *   3. It must NOT be joined by a `dress()` call. See `paletteFor` above: the
 *      set colour for a built pet is material colour, not a map.
 */
