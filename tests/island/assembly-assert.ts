/**
 * `assertAssembly` — the invariants EVERY assembled species has to satisfy,
 * written once so a species' own test file is its own claims and nothing else.
 *
 * The hedgehog's test and the squirrel's were 1,154 and 672 lines, and roughly
 * four hundred of those lines were the same eight facts re-derived. Thirteen
 * Garden species doing that again is thirteen chances for one of the eight to be
 * quietly re-derived WRONG — which is the failure mode that matters here, because
 * a species that skips an invariant looks exactly like a species that passes it.
 *
 * So the eight live here, they are not optional, and a species file is
 * `assertAssembly({ ... })` plus the things that are true of that animal alone.
 *
 * ## What it asserts, in the order it asserts them
 *
 *   0. **HEIGHT FIRST.** Inside the pack's measured 1.43-2.02, feet on y = 0.
 *      First and not last because 1.43 is a FLOOR: a bare 1.250 cube on standard
 *      legs already measures 1.43125, margin 0.00125, so a species designed low
 *      fails this before a single feature is added and there is no fixing it
 *      afterwards. See `HEIGHT_FLOOR` in `parts/hulls.ts`.
 *   1. **ONE mass.** The fault that scrapped 72 animals — a head box beside a
 *      body box, never merged — and it must be impossible to ship again. Three
 *      statements, because no single one of them is enough: exactly one mesh is
 *      the hull; NO feature wears a shape the pack used as a hull (which is what
 *      a second body actually is, and is exact rather than a threshold); and the
 *      hull is the largest thing on the animal by a stated margin.
 *   1b. **The hull is the STANDARD SIZE.** Its built bounding box equals its bank
 *      shell's own size, on all three axes. Joe raised body size twice — "body
 *      cubic, its currently too wide", then "the body/cube should always be the
 *      standard size, its often bigger" — and the first fix was per species,
 *      which is why there was a second. A bigger body is a different real shell
 *      (`OTHER_HULLS`), never a scaled one, and this is where that generalises.
 *   2. **Lineage.** Every mesh's VERTICES are matched back to a bank record —
 *      found, not trusted — and it is the shape the builder says it is. A mesh
 *      that matches nothing is only allowed if it is `bespoke-*`, in which case
 *      it must be in `authored.ts`, absent from `PARTS_BANK`, have no donor, and
 *      the species must carry a `flag` naming rule 1. Rule 1 is adapt-before-
 *      author; Joe overruled it once, deliberately, for the hedgehog's nose.
 *   3. **The eye card is absolute.** `EYE_CARD_Z` and the card's own measured
 *      size, `sink: 0`, no `stretch` anywhere in the chain. Rule 5, and the one
 *      rule a fit-to-height would break without a bounding box noticing.
 *   4. **No placed node carries a rotation or a scale.** Rule 4 as amended: a
 *      spin is baked into the copy's VERTICES. The check is worth nothing unless
 *      something is actually spun, so `spinsAtLeast` makes that explicit.
 *   5. **Rule 9's budgets**, against the pack's measured ranges. Over is allowed
 *      and is not free: it must be declared, pinned exactly, and named in the
 *      species' `flag` where Joe reads it.
 *   6. **The texture is cached, and DETACHED rather than disposed.** Disposing
 *      one breaks every pet of that set including ones a child already owns
 *      (brief §19). A comment cannot enforce it, so this listens for the
 *      `dispose` event and fails if it ever fires.
 *   7. **The pupil is `PACK_PUPIL`.** Every eye card that sends band 15 anywhere
 *      must send it to a slot painted the pack's own measured grey. Joe's note
 *      was about every animal built this way, not about one of them.
 *
 * Plus the leg row, whenever a species has one, because `LEG_ROW` is a constant
 * and a species that retypes it wrong should not reach a screenshot.
 *
 * ## What it deliberately does NOT do
 *
 * It never weakens. Where a species can claim something stronger than the
 * generic floor — the hedgehog's hull is ten times its next mesh, not three — it
 * passes the stronger number in and the harness uses it. Anything that does not
 * generalise stays in that species' own file: the hedgehog's twenty spikes, the
 * squirrel's painted belly line, every donor-offset recovery. This file is the
 * floor, not the ceiling.
 *
 * Helpers here are written out rather than imported from `src/`, which is the
 * discipline `parts-bank.test.ts` applies to its glTF reader: a shared
 * implementation lets a bug agree with itself.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, assembledSpecies, assemblyTextureCount, detachAssemblyTextures,
  ASSEMBLED_BUILDS, PACK_PUPIL, SLOT_PX, SLOT_W,
  EYE_CARD_Z, LEG_ROW, PACK_HEIGHT_MIN, PACK_HEIGHT_MAX,
  BODY_VERTS_MIN, BODY_VERTS_MAX, MODEL_VERTS_MIN, MODEL_VERTS_MAX,
  MODEL_TRIS_MIN, MODEL_TRIS_MAX,
  type AssemblyBuild, type Spin,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { authoredById, isPrimitive } from '../../src/island/species/parts/authored'
import { SPECIES_NAMES, SPECIES_COLLECTION } from '../../src/island/species/roster'
import { speciesRecord } from '../../src/island/species/registry'

/* ---------------------------------------------------------------- claims --- */

/** What one species tells the harness about itself. Only `id` is required. */
export interface AssemblyClaims {
  /** The species id, as the roster and `parts/assembled/index.ts` know it. */
  id: string
  /**
   * Every BANK shape this animal is allowed to wear, sorted. Pin it: the check
   * that each mesh traces to the bank cannot catch a species that quietly grew a
   * shape nobody meant it to have.
   */
  parts?: readonly string[]
  /**
   * Authored (`bespoke-*`) shapes it wears. Defaults to none, which is the
   * answer rule 1 wants. Anything here forces a `flag` naming rule 1.
   */
  authored?: readonly string[]
  /** Exact height, pinned. The band is checked either way. */
  height?: number
  /**
   * Why this species sits OUTSIDE the pack's measured height band, on purpose.
   *
   * The band is `PACK_HEIGHT_MIN`..`PACK_HEIGHT_MAX`, and it is a MEASUREMENT OF
   * KENNEY'S TWENTY-FOUR — not a law anybody agreed to. It earned its place while
   * the job was making new animals sit convincingly beside that pack. It stops
   * earning it the moment Joe is DESIGNING rather than matching, because then a
   * deliberate silhouette arrives looking like a regression with an authoritative
   * number attached. That is not hypothetical: six of his animals were reported
   * to him as damaged on 3 Aug 2026 and every one turned out to be his own edit.
   *
   * So a species may opt out — but it must SAY SO and the claim is checked in
   * both directions: the height really must fall outside the band, or this line
   * has gone stale and the test fails. An opt-out that quietly becomes untrue is
   * the same disease as the band itself.
   *
   * Feet on `y = 0` is NOT waived by this and never is. `buildAssembly` grounds
   * every species by translating its lowest point to the floor, so that one is a
   * genuine invariant rather than a description of the pack.
   */
  outsideHeightBand?: string
  /**
   * Why this species' legs sit outside the pack's own sunk-fraction range.
   *
   * `legs: { y }` is a control the editor gives Joe on purpose — PB-062's third
   * piece, his words: *"bottom of feet stays datum. essentially when i move the
   * legs up..."*. Raising them buries more of the leg in the hull, which is the
   * POINT, and `sunkFractionMin`/`Max` are measurements of how deep Kenney's own
   * twenty-four bury theirs. A feature built for him to use cannot also be a
   * thing the suite fails him for using.
   *
   * Same contract as `outsideHeightBand`: say so, give a reason, and the claim is
   * checked both ways so it cannot rot into a lie.
   *
   * Feet on `y = 0` is NOT waived and never is.
   */
  legRowMoved?: string
  /** Exact whole-model vertex count, pinned. The band is checked either way. */
  verts?: number
  /** Exact whole-model triangle count, pinned. The band is checked either way. */
  tris?: number
  /**
   * A budget this species knowingly exceeds, and the pattern its `flag` must
   * match to say so. Over is a decision Joe can see, never a silent overrun —
   * and the count above is still pinned exactly, so a further regression is red.
   */
  overBudget?: Partial<Record<'bodyVerts' | 'verts' | 'tris', RegExp>>
  /**
   * How many times bigger the hull must be than the next largest mesh, by
   * bounding-box volume. Defaults to 3 — the squirrel's raised tail is a third
   * of its hull and is still a detail on it. Pass a bigger number when the
   * animal supports one; the hedgehog's is 10.
   */
  massRatio?: number
  /**
   * How many features carry a `spin`. Rule 4's "nothing is rotated at the node"
   * passes vacuously on an animal with no rotation in it, so a species that
   * spins something says how many, and one that spins nothing says 0.
   */
  spinsAtLeast?: number
  /** How many legs. Defaults to 4; pass 0 for a species with no leg feature. */
  legs?: number
}

/* ----------------------------------------------------------------- tools --- */

type P3 = readonly [number, number, number]

const meshesOf = (g: THREE.Object3D): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh) })
  return out
}

const posOf = (m: THREE.Mesh): P3[] => {
  const a = m.geometry.getAttribute('position')
  const out: P3[] = []
  for (let i = 0; i < a.count; i++) out.push([a.getX(i), a.getY(i), a.getZ(i)])
  return out
}

/** Positions a part's indices actually reference, three at a time. */
const referenced = (p: BakedPart): P3[] => {
  const seen = new Set<number>()
  const out: P3[] = []
  for (const vi of p.indices) {
    if (seen.has(vi)) continue
    seen.add(vi)
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

const bbox = (ps: readonly P3[]): { min: P3; max: P3; size: P3 } => {
  const min: [number, number, number] = [Infinity, Infinity, Infinity]
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (const p of ps) for (let i = 0; i < 3; i++) {
    if (p[i]! < min[i]!) min[i] = p[i]!
    if (p[i]! > max[i]!) max[i] = p[i]!
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] }
}

/**
 * Snap to a thousandth before comparing or ordering.
 *
 * Both halves are load-bearing. Float32 attributes put the pack's 0.1135 back as
 * 0.11349999, so a raw key straddles the rounding boundary; and a 180-degree
 * rotation leaves `sin` dust of 1e-16, which turns an exact x = 0 into +/-2e-18 —
 * enough for a sort that ties on x to stop tying, after which two point lists
 * come out in different orders and compare as different shapes.
 */
const snap = (n: number): number => Math.round(n * 1000) / 1000

const uniqueSorted = (ps: readonly P3[]): P3[] => {
  const seen = new Map<string, P3>()
  for (const p of ps) seen.set(p.map(n => snap(n)).join(','), p)
  return [...seen.values()].sort((a, b) =>
    snap(a[0]) - snap(b[0]) || snap(a[1]) - snap(b[1]) || snap(a[2]) - snap(b[2]))
}

/** Rotate a point. Written out rather than imported, so the kit cannot agree with itself. */
function turn(p: P3, s: Spin): P3 {
  const t = (s.deg * Math.PI) / 180
  const c = Math.cos(t), n = Math.sin(t)
  if (s.axis === 'x') return [p[0], p[1] * c - p[2] * n, p[1] * n + p[2] * c]
  if (s.axis === 'y') return [p[0] * c + p[2] * n, p[1], -p[0] * n + p[2] * c]
  return [p[0] * c - p[1] * n, p[0] * n + p[1] * c, p[2]]
}

/** Undo a spin list: reverse the order and negate every angle. */
const unspin = (ps: readonly P3[], spins: readonly Spin[]): P3[] => {
  const inverse = [...spins].reverse().map(s => ({ axis: s.axis, deg: -s.deg }))
  return ps.map(p => inverse.reduce(turn, p))
}

/**
 * Does this point set come out of `part`, allowing a per-axis stretch and an
 * x-mirror — the only two things the kit may do to a copy beyond a declared spin,
 * which the caller has already undone?
 *
 * The stretch is RECOVERED from the two bounding boxes rather than taken from the
 * spec, so a mesh that claims a stretch it does not have still fails.
 */
function isCopyOf(points: readonly P3[], part: BakedPart, mirror: boolean): boolean {
  const mp = mirror ? points.map(p => [-p[0], p[1], p[2]] as P3) : points
  const pp = referenced(part)
  const bm = bbox(mp), bp = bbox(pp)
  const s: P3 = [0, 1, 2].map(i =>
    bp.size[i]! < 1e-9 ? 1 : bm.size[i]! / bp.size[i]!) as unknown as P3
  const cm = uniqueSorted(mp.map(p => [
    p[0] - (bm.min[0] + bm.max[0]) / 2,
    p[1] - (bm.min[1] + bm.max[1]) / 2,
    p[2] - (bm.min[2] + bm.max[2]) / 2,
  ] as P3))
  const cp = uniqueSorted(pp.map(p => [
    p[0] * s[0] - (bp.min[0] + bp.max[0]) / 2 * s[0],
    p[1] * s[1] - (bp.min[1] + bp.max[1]) / 2 * s[1],
    p[2] * s[2] - (bp.min[2] + bp.max[2]) / 2 * s[2],
  ] as P3))
  if (cm.length !== cp.length) return false
  for (let i = 0; i < cm.length; i++) {
    for (let k = 0; k < 3; k++) if (Math.abs(cm[i]![k]! - cp[i]![k]!) > 2e-3) return false
  }
  return true
}

/**
 * A rigid-motion invariant fingerprint: distances from the vertex centroid.
 *
 * The centroid moves with the shape under any rotation, reflection or
 * translation, so this identifies a shape WITHOUT knowing what was done to it —
 * which is what makes "the spikes are still the pack's geometry" checkable
 * independently of the spin the builder claims. It is not scale-invariant, and
 * that is the point: an undeclared stretch fails it.
 */
function fingerprint(ps: readonly P3[]): string[] {
  const u = uniqueSorted(ps)
  const c = u.reduce((a, p) => [a[0] + p[0] / u.length, a[1] + p[1] / u.length,
    a[2] + p[2] / u.length] as P3, [0, 0, 0] as P3)
  return u.map(p => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2]).toFixed(3)).sort()
}

/**
 * The mesh's points put back the way the bank stores them: un-mirrored and
 * un-spun, both ways round.
 *
 * The kit builds M . R . v — spin, then mirror — so the inverse has to un-mirror
 * BEFORE it un-spins. Both candidates are returned, so neither the declared spin
 * nor the declared mirror is taken on trust.
 */
const unbuilt = (mesh: THREE.Mesh): P3[][] => {
  const spins = (mesh.userData['spin'] ?? []) as readonly Spin[]
  const raw = posOf(mesh)
  return [unspin(raw, spins), unspin(raw.map(p => [-p[0], p[1], p[2]] as P3), spins)]
}

/**
 * Does this mesh come out of the record it CLAIMS?
 *
 * Deliberately checked against the claimed part rather than searched for across
 * the whole bank, and the reason is a real ambiguity rather than a shortcut:
 * `isCopyOf` recovers a per-axis stretch from the two bounding boxes, so a
 * search finds `box-09` for the beaver's `tube-01` — two shapes the same to
 * within a stretch, and the search returns whichever the bank lists first. A
 * true statement about the wrong shape is worse than no statement.
 *
 * So the claim is what is tested, and it is tested twice: rigidly, by a
 * fingerprint that no rotation or reflection changes and no scale survives, and
 * then structurally, allowing exactly the stretch the mesh declares.
 */
const isTheClaimedShape = (mesh: THREE.Mesh, part: BakedPart): boolean =>
  unbuilt(mesh).some(c => isCopyOf(c, part, false))

const world = (o: THREE.Object3D): THREE.Vector3 => {
  o.updateMatrixWorld(true)
  return o.getWorldPosition(new THREE.Vector3())
}

const worldBox = (o: THREE.Object3D): THREE.Box3 => {
  o.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(o)
}

const named = (g: THREE.Group, prefix: string): THREE.Mesh[] =>
  meshesOf(g).filter(m => m.name === prefix || m.name.startsWith(`${prefix}-`))

const mapOf = (g: THREE.Group): THREE.Texture =>
  ((g.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map!

const volumeOf = (m: THREE.Mesh): number => {
  const s = worldBox(m).getSize(new THREE.Vector3())
  return s.x * s.y * s.z
}

/** Whole-model counts, and the body's own — legs excluded, as rule 9 measures it. */
function counts(g: THREE.Group): { verts: number; tris: number; body: number } {
  let verts = 0, tris = 0, body = 0
  for (const m of meshesOf(g)) {
    const n = m.geometry.getAttribute('position').count
    verts += n
    tris += m.geometry.getIndex()!.count / 3
    if (m.userData['role'] !== 'leg') body += n
  }
  return { verts, tris, body }
}

/**
 * Check one budget. Inside the band, or declared over it with a `flag` that says
 * so — never quietly over, and never relaxed to make a species fit.
 */
function budget(
  what: 'bodyVerts' | 'verts' | 'tris',
  got: number, lo: number, hi: number,
  spec: AssemblyBuild, over: AssemblyClaims['overBudget'],
): void {
  expect(got, `${what} is below the pack's own floor of ${lo}`).toBeGreaterThanOrEqual(lo)
  const said = over?.[what]
  if (got <= hi) {
    expect(said, `${what} is ${got}, inside ${lo}-${hi} — it does not need declaring`)
      .toBeUndefined()
    return
  }
  expect(said, `${what} is ${got}, over the pack's ${hi}, and nothing declares it`)
    .toBeDefined()
  expect(spec.flag, `${what} is over budget and the flag does not say so`)
    .toMatch(said!)
}

/* ---------------------------------------------------------------- the harness --- */

/**
 * Register the invariants for one assembled species.
 *
 * Call it at the top level of that species' test file. It builds the animal
 * fresh inside each `it`, so nothing it does leaks into the species' own claims.
 */
export function assertAssembly(claims: AssemblyClaims): void {
  const { id } = claims
  const spec = ASSEMBLED_BUILDS[id]
  const build = (): THREE.Group => {
    const g = buildAssembled(id)
    g.updateMatrixWorld(true)
    return g
  }

  describe(`${id}: the invariants every assembled species carries`, () => {
    it('is in the roster, on the register, and on its own collection record', () => {
      expect(spec, `${id} has no build in ASSEMBLED_BUILDS`).toBeDefined()
      const row = assembledSpecies().find(r => r.id === id)
      expect(row, `${id} is not on the assembled bench`).toBeDefined()
      // §0: the names and the facts are never regenerated. Both come off the
      // roster and neither is written in the species file.
      expect(row!.name).toBe(SPECIES_NAMES[id])
      expect(row!.collection).toBe(SPECIES_COLLECTION[id])
      expect(row!.flag).toBe(spec!.flag)
      // And the collection record picked the build up by id — the wiring that
      // makes adding a species zero lines of `collections/*.ts`.
      expect(speciesRecord(id)?.assembly, `${id} is registered but not attached`).toBe(spec)
    })

    /* --------------------------------------------- 0. height, checked FIRST --- */

    it('stands inside the pack\'s measured height band, feet on y = 0', () => {
      const b = worldBox(build())
      expect(b.min.y, 'feet are not on the ground').toBeCloseTo(0, 3)
      const h = b.max.y - b.min.y
      // 1.43 is a FLOOR and not a range: a bare 1.250 cube on standard legs is
      // already 1.43125, so there is no headroom underneath at all and a species
      // designed low fails here before anything is added to it. `HEIGHT_FLOOR`
      // in parts/hulls.ts carries the whole derivation.
      if (claims.outsideHeightBand !== undefined) {
        /* Declared out of band, with a reason. Checked BOTH ways so the opt-out
         * cannot rot into a lie: if the animal is brought back inside the band,
         * this fails and the claim has to go. */
        expect(claims.outsideHeightBand.length, 'an opt-out needs a reason').toBeGreaterThan(0)
        expect(
          h < PACK_HEIGHT_MIN || h > PACK_HEIGHT_MAX,
          `${id} claims to sit outside the pack band and ${h.toFixed(4)} is inside it — drop the claim`,
        ).toBe(true)
      } else {
        expect(h, `${h.toFixed(4)} is shorter than anything in the pack`)
          .toBeGreaterThan(PACK_HEIGHT_MIN)
        expect(h, `${h.toFixed(4)} is taller than anything in the pack`)
          .toBeLessThan(PACK_HEIGHT_MAX)
      }
      if (claims.height !== undefined) expect(h).toBeCloseTo(claims.height, 3)
    })

    /* -------------------------------------------------------- 1. ONE mass --- */

    it('is ONE mass — one hull, no second hull shape, nothing else near its size', () => {
      const g = build()
      const all = meshesOf(g)
      // (a) Structural. `AssemblyBuild.hull` is singular and there is no way to
      // say "and another hull"; this is that guarantee, measured.
      const hulls = all.filter(m => m.userData['role'] === 'hull')
      expect(hulls, 'more than one mesh claims to be the hull').toHaveLength(1)
      expect(hulls[0]!.name).toBe('hull')
      expect(hulls[0]!.userData['part']).toBe(spec!.hull.part)

      // (b) Exact, and the one that actually catches the fault that scrapped the
      // 72: a head box beside a body box IS a second hull-family shape placed as
      // a feature. No threshold can separate that from a big tail; the pack's own
      // `roles` can, and does.
      const hullShapeIds = new Set(PARTS_BANK.filter(p => p.roles.includes('hull')).map(p => p.id))
      for (const f of spec!.features) {
        expect(hullShapeIds.has(f.part), `feature "${f.name}" wears the hull shape ${f.part}`)
          .toBe(false)
      }

      // (c) And it is still the biggest thing on the animal, by a margin.
      const vols = all.map(m => ({ name: m.name, vol: volumeOf(m) }))
        .sort((a, b) => b.vol - a.vol)
      expect(vols[0]!.name, 'something is bigger than the hull').toBe('hull')
      expect(vols[0]!.vol / vols[1]!.vol, `${vols[1]!.name} is close to hull-sized`)
        .toBeGreaterThan(claims.massRatio ?? 3)
    })

    /* --------------------------------- 1b. the hull is the STANDARD SIZE --- */

    it('wears its hull shell at the shell\'s OWN standard size — never scaled', () => {
      /* Joe, twice. "body cubic, its currently too wide" on the hedgehog, and then
       * over the whole built set: "general criticism is size. the body/cube should
       * always be the standard size, its often bigger." The first was answered in
       * the species, which is exactly why there was a second — so this is the
       * assertion that answers it for all of them at once.
       *
       * Measured off the BUILT geometry and compared to the bank's record, not
       * read off the spec: `Hull.stretch` being `never` says nobody asked for a
       * bigger hull, and this says nobody got one.
       *
       * Said TWICE, at two tolerances, because the bank rounds two ways. Its
       * `positions` are 4dp and its `size` is 6dp, so a shell whose recorded width
       * is 1.539484 builds from vertices at +/-0.7697 and measures 1.5394 — off by
       * 8.4e-5, which is the pack's own rounding and not a scale. That is the
       * badger's `box-12` and it is why the comparison against `size` is at 3dp,
       * the same thousandth `snap` works to throughout this file. The EXACT claim
       * is the second one, against the shell's own referenced vertices: the hull's
       * built box is the donor's box to 4dp, no allowance at all.
       *
       * Either way it bites long before it matters: the smallest hull stretch
       * anybody has reached for was 1.08x, which is 0.1 of a unit.
       */
      const g = build()
      const shell = partById(spec!.hull.part) ?? authoredById(spec!.hull.part)
      expect(shell, `the hull claims "${spec!.hull.part}", which no record accounts for`)
        .toBeTruthy()
      const hull = g.getObjectByName('hull') as THREE.Mesh
      const size = worldBox(hull).getSize(new THREE.Vector3())
      const got = [size.x, size.y, size.z]
      const own = bbox(referenced(shell!)).size
      for (let i = 0; i < 3; i++) {
        const why = `the hull measures ${got[i]!.toFixed(4)} on ${'xyz'[i]} where ${shell!.id} `
          + `itself is ${shell!.size[i]!.toFixed(4)} — a bigger body is one of the pack's ten `
          + 'real shells (OTHER_HULLS in hulls.ts), never a scaled one'
        expect(got[i]!, why).toBeCloseTo(shell!.size[i]!, 3)
        expect(got[i]!, why).toBeCloseTo(own[i]!, 4)
      }
      // Both halves of the builder's guard, from the data side: nothing declared a
      // stretch, and the mesh records the identity the builder now always uses.
      expect(spec!.hull.stretch, 'the hull declares a stretch').toBeUndefined()
      expect(hull.userData['stretch']).toEqual([1, 1, 1])
    })

    /* --------------------------------------------------------- 2. lineage --- */

    it('traces every mesh back to the bank, and names anything that cannot', () => {
      const g = build()
      const bank = new Set<string>()
      const bespoke = new Set<string>()
      /* Deduped by geometry: the kit hands one `BufferGeometry` to every copy of
       * a part, so twenty spikes are one shape to trace, not twenty. */
      const seen = new Set<string>()
      for (const m of meshesOf(g)) {
        const claimed = m.userData['part'] as string
        const key = `${m.geometry.uuid}|${claimed}`
        if (seen.has(key)) continue
        seen.add(key)

        if (claimed.startsWith('bespoke-')) {
          // Authored, and it has to say so in three places at once: the id, the
          // absence of any donor, and the species' own flag.
          const p = authoredById(claimed)
          expect(p, `${m.name} claims ${claimed}, which is not in authored.ts`).toBeTruthy()
          expect(p!.provenance, `${claimed} claims a donor`).toHaveLength(0)
          expect(partById(claimed), `${claimed} leaked into PARTS_BANK`).toBeUndefined()
          bespoke.add(claimed)
          continue
        }
        // A shape that is neither authored nor in the bank is the failure rule 1
        // exists to stop, and it fails here by name.
        const part = partById(claimed)
        expect(part, `${m.name} claims "${claimed}", which is not in PARTS_BANK`).toBeTruthy()
        const stretch = (m.userData['stretch'] ?? [1, 1, 1]) as readonly number[]
        if (stretch.every(v => v === 1)) {
          // Rigid: whatever the kit did to this copy, it did not deform it, and
          // it did not scale it either. Rotation- and reflection-invariant, so
          // this holds without consulting the declared spin at all.
          expect(fingerprint(posOf(m)), `${m.name} is not rigidly ${claimed}`)
            .toEqual(fingerprint(referenced(part!)))
        }
        // And the point set is that record's, allowing only the mirror and the
        // spin the mesh declares — both of which are undone here, both ways
        // round, rather than believed.
        expect(isTheClaimedShape(m, part!), `${m.name} is not a copy of ${claimed}`).toBe(true)
        bank.add(claimed)
      }

      if (claims.parts !== undefined) expect([...bank].sort()).toEqual([...claims.parts].sort())
      expect([...bespoke].sort()).toEqual([...(claims.authored ?? [])].sort())
      // Rule 1 is adapt-before-author. Authoring is Joe's call, taken once, and
      // the species that wears one says so where he reads it (§2's escape clause).
      //
      // The three base shapes are the exception, and it has to be here as well as
      // in `creature.ts` or the first species to wear a square passes the builder
      // and then fails its own harness — whose obvious "fix" is a `RULE 1` flag
      // that names no strained rule, which is precisely the signal this assertion
      // exists to keep meaningful. Joe sanctioned those three by name, for
      // everybody, permanently (JT-041); a flag would be telling him something he
      // already ruled.
      const commissioned = [...bespoke].filter(p => !isPrimitive(p))
      if (commissioned.length > 0) {
        expect(spec!.flag, `${id} wears authored geometry and its flag does not say so`)
          .toMatch(/RULE 1/i)
      }
    })

    /* ----------------------------------------------- 3. the eye is absolute --- */

    it('places the eye cards at their measured absolute size and z, never scaled', () => {
      const g = build()
      const cards = spec!.features.filter(f => partById(f.part)?.roles.includes('eye'))
      expect(cards.length, `${id} has no eye card`).toBeGreaterThan(0)
      for (const f of cards) {
        const part = partById(f.part)!
        expect(f.stretch, `${f.name} carries a stretch — rule 5`).toBeUndefined()
        for (const e of named(g, f.name)) {
          // z = 0.6350, standard deviation 0.0000 across all 48 cards in the
          // pack, and it does NOT move with the hull: on box-31 the card floats
          // 0.135 proud of a 0.500 front face, which is what the lion does.
          expect(world(e).z, `${e.name} is off the eye plane`).toBeCloseTo(EYE_CARD_Z, 4)
          /* SAID TWICE, AT TWO TOLERANCES, AND THE LOOSER ONE IS NOT A CONCESSION.
           *
           * `bank.generated.ts` stores `positions` at 4dp and `shape.size` at
           * 6dp, so for a card whose true extent has a sixth decimal the two
           * CANNOT agree past the fourth. Measured over the five eye cards:
           *
           *     plate-01  field 0.400000 x 0.320208   built delta 0 / 8.0e-6
           *     plate-08  field 0.400000 x 0.400000   built delta 0 / 0
           *     plate-06  field 0.329780 x 0.276342   built delta 2.0e-5 / 5.8e-5
           *     plate-14  field 0.435472 x 0.442601   built delta 7.2e-5 / 1.0e-6
           *
           * `toBeCloseTo(x, 4)` allows 5e-5, so `plate-14` and `plate-06` both
           * fail it and `plate-01` and `plate-08` both pass. THIS WAS A LATENT
           * BUG IN THIS HARNESS, not a property of any animal: every species
           * built before Night Time wore `plate-01` or `plate-08`, which are the
           * two that happen to round exactly, so nothing ever exposed it. The
           * tarsier is the first species to spend the panda's card and it went
           * red on the pack's own rounding.
           *
           * So the comparison against the metadata field drops to 3dp, which is
           * all that field can support, and an EXACT comparison against the
           * part's own referenced vertices is added at 4dp with no allowance at
           * all. The invariant is unchanged and better evidenced: an eye card is
           * never scaled, and it is now checked against the geometry rather than
           * against a rounded description of it. */
          const s = worldBox(e).getSize(new THREE.Vector3())
          const own = bbox(referenced(part)).size
          for (let i = 0; i < 3; i++) {
            expect([s.x, s.y, s.z][i]!, `${e.name} is not ${part.id}'s own size`)
              .toBeCloseTo(part.size[i]!, 3)
            expect([s.x, s.y, s.z][i]!, `${e.name} is not ${part.id}'s own size`)
              .toBeCloseTo(own[i]!, 4)
          }
          expect(e.userData['stretch']).toEqual([1, 1, 1])
          expect(e.userData['sink']).toBe(0)
        }
      }
    })

    /* ------------------------------------------------ 4. nothing is a node --- */

    it('places by translation only — no node carries a rotation or a scale', () => {
      const g = build()
      expect(g.scale.toArray()).toEqual([1, 1, 1])
      expect(g.quaternion.toArray()).toEqual([0, 0, 0, 1])
      // The whole rig is grounded in y and nowhere else, so the eye card's z
      // stays absolute however tall the animal turned out.
      expect(g.position.x).toBe(0)
      expect(g.position.z).toBe(0)
      for (const m of meshesOf(g)) {
        expect(m.scale.toArray(), m.name).toEqual([1, 1, 1])
        expect(m.quaternion.toArray(), m.name).toEqual([0, 0, 0, 1])
      }
      // Rule 4 as amended: a rotation is baked into the copy's vertices. The loop
      // above passes for the wrong reason on an animal with no rotation in it, so
      // a species states how many it has — including zero, out loud.
      const spun = spec!.features.filter(f => (f.spin ?? []).length > 0).length
      if (claims.spinsAtLeast !== undefined) {
        expect(spun, 'fewer spun features than claimed')
          .toBeGreaterThanOrEqual(claims.spinsAtLeast)
      }
    })

    /* ------------------------------------------------------- 5. the budgets --- */

    it('stays inside rule 9\'s budgets, or declares exactly where it does not', () => {
      const g = build()
      const { verts, tris, body } = counts(g)
      budget('bodyVerts', body, BODY_VERTS_MIN, BODY_VERTS_MAX, spec!, claims.overBudget)
      budget('verts', verts, MODEL_VERTS_MIN, MODEL_VERTS_MAX, spec!, claims.overBudget)
      budget('tris', tris, MODEL_TRIS_MIN, MODEL_TRIS_MAX, spec!, claims.overBudget)
      // Pinned exactly, so a regression that stays inside the band is still red.
      if (claims.verts !== undefined) expect(verts).toBe(claims.verts)
      if (claims.tris !== undefined) expect(tris).toBe(claims.tris)
    })

    /* ---------------------------------------------------- 6. the texture --- */

    it('shares one texture, and DETACHES it rather than disposing it', () => {
      detachAssemblyTextures()
      expect(assemblyTextureCount()).toBe(0)
      const slots = Object.keys(spec!.palette)

      const a = build(), b = build()
      // One material, one map, one lookup per fragment, and the second build gets
      // the same texture object rather than a second copy of the same pixels.
      const mats = new Set(meshesOf(a).map(m => m.material as THREE.Material))
      expect(mats.size).toBe(1)
      expect(mapOf(a)).toBe(mapOf(b))
      expect(assemblyTextureCount()).toBe(1)
      const tex = mapOf(a)
      expect((tex.image as ImageData).width).toBe(SLOT_W)
      expect((tex.image as ImageData).height).toBe(slots.length * SLOT_PX)

      // Non-negotiable, brief §19: a set's textures are shared by every pet of
      // that set including ones a child already owns, so disposing one breaks a
      // pet that is on screen. "We did not dispose it" is the only part of this
      // a comment cannot enforce.
      let disposed = 0
      tex.addEventListener('dispose', () => { disposed += 1 })
      expect(detachAssemblyTextures()).toBe(1)
      expect(assemblyTextureCount()).toBe(0)
      expect(disposed, 'a texture was disposed').toBe(0)
      // Still usable: the pet on screen keeps its pixels.
      expect((tex.image as ImageData).data.length)
        .toBe(SLOT_W * slots.length * SLOT_PX * 4)
      // And the next build simply makes a new one.
      expect(mapOf(build())).not.toBe(tex)
      expect(disposed).toBe(0)
    })

    /* ------------------------------------------------------- 7. the pupil --- */

    it('paints every eye card\'s pupil the pack\'s own measured grey', () => {
      // It was `0x000000`, a number nobody measured, and Joe caught it. The fix
      // is central because his note is about every animal built this way.
      for (const f of spec!.features) {
        if (!partById(f.part)?.roles.includes('eye')) continue
        const slot = f.paint.byBand?.[15]
        expect(slot, `${id}: "${f.name}" has no pupil slot`).toBeDefined()
        expect(spec!.palette[slot!], `${id} paints its pupil ${slot}`).toBe(PACK_PUPIL)
      }
      // And the eye card arrives pre-split, so the two slots cost no geometry.
      const g = build()
      for (const f of spec!.features) {
        if (!partById(f.part)?.roles.includes('eye')) continue
        const uv = named(g, f.name)[0]!.geometry.getAttribute('uv')
        const rows = new Set<string>()
        for (let i = 0; i < uv.count; i++) {
          rows.add(uv.getY(i).toFixed(6))
          expect(uv.getX(i)).toBeCloseTo(0.5, 6)
        }
        expect(rows.size, `${f.name} reads ${rows.size} slots, not 2`).toBe(2)
      }
    })

    /* ---------------------------------------------------------- the legs --- */

    it('stands on the pack\'s own leg row, feet on zero', () => {
      const want = claims.legs ?? 4
      const g = build()
      const legs = named(g, 'leg')
      expect(legs).toHaveLength(want)
      if (want === 0) return
      const part = partById(LEG_ROW.part)!
      const hullBottom = worldBox(g.getObjectByName('hull')!).min.y
      for (const l of legs) {
        expect(l.userData['part'], `${l.name} is not ${LEG_ROW.part}`).toBe(LEG_ROW.part)
        expect(worldBox(l).min.y, `${l.name} is off the ground`).toBeCloseTo(0, 3)
        // Sunk into the belly by an amount the pack itself demonstrated.
        const frac = (worldBox(l).max.y - hullBottom) / part.size[1]!
        if (claims.legRowMoved !== undefined) {
          /* Declared off the pack's row, with a reason. Checked both ways so the
           * opt-out cannot rot: if the legs come back inside the range, this
           * fails and the claim has to go. */
          expect(claims.legRowMoved.length, 'an opt-out needs a reason').toBeGreaterThan(0)
          expect(
            frac < part.attachment!.sunkFractionMin - 1e-3
            || frac > part.attachment!.sunkFractionMax + 1e-3,
            `${id} claims a moved leg row and ${frac.toFixed(6)} is inside the pack's range — drop the claim`,
          ).toBe(true)
        } else {
          expect(frac).toBeGreaterThanOrEqual(part.attachment!.sunkFractionMin - 1e-3)
          expect(frac).toBeLessThanOrEqual(part.attachment!.sunkFractionMax + 1e-3)
          // The pack's own leg offset, arrived at by solving rather than aiming.
          expect(world(l).y).toBeCloseTo(part.offset[1]!, 4)
        }
        // Under the MIDDLE, not at the corners (§3, the leg note).
        const hull = worldBox(g.getObjectByName('hull')!)
        expect(Math.abs(world(l).x)).toBeLessThan((hull.max.x - hull.min.x) / 2)
        expect(Math.abs(world(l).z)).toBeLessThan((hull.max.z - hull.min.z) / 2)
      }
    })
  })
}
