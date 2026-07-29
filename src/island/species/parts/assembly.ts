/**
 * The assembly kit: an animal made of the pack's own parts and nothing else.
 *
 * `docs/building-animals-from-parts.md` is the spec; this file is the ten rules
 * turned into a type and a function. Every one of them shows up as a decision
 * here, so they are named where they bite rather than listed once at the top:
 *
 *   1. **Adapt before authoring** — `stretch` on a part copy. It is a property
 *      of the COPY's vertices, baked into the geometry, never a node transform.
 *   3. **One mass** — `AssemblyBuild.hull` is singular and there is no way to
 *      say "and another hull". A `Feature` is a detail bolted to the mass. This
 *      is the fault that scrapped the 72 and the type is the guard against it.
 *   4. **No placed node carries a transform** — a placed node's `quaternion` is
 *      identity and its `scale` is (1,1,1), always. Mirroring negates x on the
 *      COPY's vertices and flips its winding; rotation (`Feature.spin`) is baked
 *      into the copy's vertices and normals the same way. Never `scale.x = -1`
 *      and never `rotation.y`. See the spec's rule 4 as amended 29 July: Joe
 *      asked for the hedgehog's spikes turned 180 degrees backwards and a set of
 *      them turned 45 degrees onto the chamfer, and the rule now says how.
 *   5. **Absolute sizes for face features** — nothing forces `stretch`, and the
 *      hedgehog's eye cards simply do not carry one. The spec cannot express
 *      "scale this with the head" because there is no proportional mode.
 *   6. **Paired parts are one mesh, mirrored** — `Placement` has no way to place
 *      a left part and a right part independently. `pair` and `row.mirror`
 *      derive the far side from the near one.
 *   7. **Smooth-shaded** — the bank's own normals are copied verbatim into every
 *      geometry and the material never sets `flatShading`. `kits/shared.ts` has
 *      told every kit "flat-shaded" since the first kit existed; that is wrong,
 *      and this kit does not repeat it.
 *   8. **One hue per part** — `Paint` resolves to a slot index, and a slot is a
 *      flat swatch. Two-tone comes from `byBand`, splitting a part's own
 *      triangles between slots, which is Kenney's mechanism (see `texture.ts`).
 *   9. **Low vertex budget** — nothing is de-indexed wholesale. Only the
 *      vertices that actually sit on a colour boundary are duplicated.
 *
 * ## Repeat-and-sink is first class, because it is the least proven idea here
 *
 * §3.1 is Joe's: "the hog ears could potentially double up as dragon or croc
 * back ridges as well as hedgehog spikes (if added sunk into the torso, say 6 on
 * each side". So `Placement.row` takes a count and a line, and `Feature.sink`
 * takes a DEPTH — a share of the part's own extent buried past the surface it
 * joins. Depth is a dial with a measured range, never a floor to be clamped to;
 * a rule that assumed one-per-side at the surface would make Joe's idea
 * unbuildable, quietly.
 *
 * ## What `at` means, and why it is a surface point
 *
 * A feature's `at` is the point on the mass where the part JOINS, not where its
 * centre goes. The centre is then derived from `sink`: at `sink: 0` the part
 * sits entirely outside `at`, at `sink: 1` it is entirely buried. That is the
 * same quantity the bank measured off the pack (`attachment.sunkFraction*`), so
 * a spec's number can be checked against what Kenney actually did.
 *
 * ## Which way a lifted part faces, and how a builder turns it
 *
 * Every part in the bank carries a measured `attachment.axis` and
 * `attachment.dir`, and together they are the part's FACING: the unit direction
 * its mass runs in, away from the surface it joins. `cone-01` is `y +1`, so an
 * unspun copy stands UP out of whatever it is placed on; `cone-06` is `z +1`, so
 * a copy points FORWARD. That is the default and it is never guessed.
 *
 * `Feature.spin` turns it. A spin rotates the copy's vertices, its normals AND
 * its facing together, about the part's own centre, so the sink still measures
 * along the direction the part actually points. `[{ axis: 'z', deg: -90 }]`
 * takes a `y +1` part and makes it point `x +1`; `-45` puts it halfway between,
 * which is the chamfer idiom (spec §8). `{ axis: 'y', deg: 180 }` turns a part
 * back to front without changing which way it stands.
 */
import * as THREE from 'three'
import { partById, type BakedPart } from './bank.generated'
import { assemblyTexture, slotUv } from './texture'

export type Vec3 = readonly [number, number, number]
export type Axis = 'x' | 'y' | 'z'

const AXIS: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

/**
 * One rotation, baked into a part COPY's vertices. Rule 4, as amended.
 *
 * Degrees, right-handed about the named axis, applied to the origin-centred part
 * before it is placed. A list is applied in order. Nothing here ever reaches a
 * node's `quaternion` — that is the whole point of baking it.
 */
export interface Spin { axis: Axis; deg: number }

/** Quarter turns are exact, so a 90 or a 180 leaves no 1e-16 dust behind. */
function cosSin(deg: number): readonly [number, number] {
  const d = ((deg % 360) + 360) % 360
  if (d % 90 === 0) return ([[1, 0], [0, 1], [-1, 0], [0, -1]] as const)[d / 90]!
  const t = (d * Math.PI) / 180
  return [Math.cos(t), Math.sin(t)]
}

function rotate(v: readonly [number, number, number], s: Spin): [number, number, number] {
  const [c, n] = cosSin(s.deg)
  const [x, y, z] = v
  if (s.axis === 'x') return [x, y * c - z * n, y * n + z * c]
  if (s.axis === 'y') return [x * c + z * n, y, -x * n + z * c]
  return [x * c - y * n, x * n + y * c, z]
}

const spun = (
  v: readonly [number, number, number], spins: readonly Spin[],
): [number, number, number] => spins.reduce(rotate, v as [number, number, number])

/**
 * Which palette slot each of a part's triangles is painted from.
 *
 * `base` covers the part. `byBand` overrides by the part's OWN measured atlas
 * band, so a lifted part that the pack had already split into two colour regions
 * arrives split — the eye card's sclera and pupil are bands 3 and 15 and need no
 * geometry work at all.
 */
export interface Paint {
  base: string
  byBand?: Readonly<Record<number, string>>
}

/**
 * Where the copies of one part go. Positions only — there is no rotation here
 * and there is no scale here, and that is rule 4 rather than an omission.
 */
export type Placement =
  /** One copy, at a point. */
  | { kind: 'single'; at: Vec3 }
  /** Two copies. `at` is the +x one; the -x one is its mirror. */
  | { kind: 'pair'; at: Vec3 }
  /**
   * `count` copies evenly along the line `from` -> `to`, and the whole line
   * mirrored in x as well when `mirror` is set. Twelve spikes, six a side, is
   * one of these.
   */
  | { kind: 'row'; from: Vec3; to: Vec3; count: number; mirror?: boolean }

/** One detail attached to the one mass. */
export interface Feature {
  /** Names the meshes: `spike`, `leg`, `eye`. Copies get a suffix. */
  name: string
  /** A bank id — `cone-01`, `box-01`. Never a species name. */
  part: string
  paint: Paint
  /**
   * Share of the part's own extent buried past `at`, along the attachment axis.
   * Defaults to 0, which is flush. Compare against the part's measured
   * `attachment.sunkFraction*` range: outside it is not forbidden, it is a
   * choice worth being able to see.
   */
  sink?: number
  /** Defaults to the part's own measured attachment axis. */
  axis?: Axis
  /** Defaults to the part's own measured attachment direction. */
  dir?: 1 | -1
  /** Rule 1: adapt the SHAPE of this copy. Baked into vertices, not a transform. */
  stretch?: Vec3
  /**
   * Rule 4, as amended: turn this copy. Baked into its vertices and normals, and
   * applied to its facing too, so `sink` still measures along the way it points.
   */
  spin?: readonly Spin[]
  placement: Placement
}

/**
 * The one mass. Singular, and there is no second one.
 *
 * ## Why a hull stretch has to say why
 *
 * The hedgehog shipped with the shared 1.250 cube stretched to 1.350 x 1.150 and
 * Joe's first note back was *"body cubic, its currently too wide"*. The stretch
 * itself was argued for at length in a comment — but a comment is not where he
 * reviews, and `stretch?: Vec3` sat in the type as an ordinary optional number
 * that any species could reach for. Ten more Garden species would each have
 * inherited the same silent dial.
 *
 * So a hull stretch is now a PAIR. `stretch` without `stretchWhy` does not
 * compile, `buildAssembly` throws on it at runtime for callers that are not
 * TypeScript, and the reason travels out on the group's `userData` and on
 * `assembledSpecies()` so it reaches the surface Joe judges from. A hull that
 * departs from its authored proportions is now something he can see, which is
 * the only kind of departure worth allowing.
 *
 * Deliberately NOT applied to `Feature.stretch`: §3 measured ears at 2.97x and
 * snouts at 2.90x natural variation and says in as many words that stretching a
 * copy is safe *for those two kinds and only those two*. The hull is the one
 * shape 14 of the 24 share unmodified, and it is the one that reads as the
 * animal's proportions at tablet distance.
 */
export type Hull = {
  /** A bank id. `box-03` is the 1.250 cube that 14 of the 24 share. */
  part: string
  paint: Paint
  /** Its bounding-box centre, in model units. */
  at: Vec3
} & (
  | { stretch?: never; stretchWhy?: never }
  /** Rule 1. The only way this kit expresses a body proportion — and it must say why. */
  | { stretch: Vec3; stretchWhy: string }
)

/**
 * A whole animal, as data.
 *
 * Model units throughout, at the pack's own authoring scale, because that is the
 * scale the bank's parts are at and rule 5 means absolute sizes have to survive
 * to the screen. There is deliberately NO uniform fit-to-height here (compare
 * `kits/shared.ts:128`): a uniform fit would multiply the eye card's measured
 * z = 0.6350 by whatever the spikes did to the silhouette, and rule 5 exists
 * precisely to stop that. An assembled species is authored at final size and a
 * test asserts it lands inside the pack's measured 1.43-2.02 height band.
 */
export interface AssemblyBuild {
  kit: 'assembly'
  hull: Hull
  features: readonly Feature[]
  /**
   * Slot name -> colour. INSERTION ORDER IS THE TEXTURE LAYOUT, so it is part of
   * the data rather than an implementation detail.
   */
  palette: Readonly<Record<string, number>>
  /**
   * §2's escape clause, made visible. Set when a rule was strained, or was about
   * to be and the build changed instead — say which, in Joe's direction, in one
   * sentence. `undefined` means nothing strained.
   */
  flag?: string
}

/* ------------------------------------------------------------- geometry --- */

/**
 * One part copy, as a `BufferGeometry`.
 *
 * The loop walks TRIANGLES rather than vertices because a triangle is what
 * carries a band, and therefore a slot. A vertex is duplicated only where it
 * genuinely has to be.
 *
 * ## The weld, and why it is not a micro-optimisation
 *
 * The key is POSITION + NORMAL + slot, not the donor file's vertex index.
 *
 * The exporter splits a vertex wherever the UVs seam, so `box-03` arrives as 120
 * vertices over 32 distinct positions and `cone-01` as 68 over 20. Those splits
 * exist to carry Kenney's atlas coordinates — and §4 is that WE own the UVs, so
 * every one of our vertices in one slot reads one point on the swatch column and
 * the splits carry nothing at all. Keying on the index kept all 120.
 *
 * Position AND normal, never position alone: rule 7 is "smooth-shaded, WITH
 * split corners where a hard edge is wanted", and a hard edge is exactly a
 * position that appears twice with two different normals. Welding on position
 * would round the pack's own chamfers off. Welding on both removes only what
 * duplicates in every respect we care about, so the geometry that comes out is
 * bit-for-bit the same surface.
 *
 * Measured: hull 120 -> 32, leg 80 -> 32, spike 68 -> 24, snout 48 -> 23, eye
 * card 31 -> 22. It is what makes Joe's twenty spikes fit rule 9's vertex budget
 * at all — 20 x 68 is 1,360 against a measured body ceiling of 1,114.
 */
function bakeGeometry(
  part: BakedPart,
  stretch: Vec3,
  spins: readonly Spin[],
  mirror: boolean,
  paint: Paint,
  slots: readonly string[],
): THREE.BufferGeometry {
  const pos: number[] = []
  const nrm: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const seen = new Map<string, number>()
  /* A mirror flips handedness and a rotation does not, so only x-negation needs
   * the winding put back. */
  const order = mirror ? [0, 2, 1] : [0, 1, 2]
  const flip = mirror ? -1 : 1

  for (let t = 0; t < part.tris; t++) {
    const band = part.bands[t] ?? -1
    const name = paint.byBand?.[band] ?? paint.base
    const slot = slots.indexOf(name)
    if (slot < 0) throw new Error(`assembly: part "${part.id}" paints slot "${name}", which is not in the palette`)
    const [u, v] = slotUv(slot, slots.length)

    for (const k of order) {
      const vi = part.indices[t * 3 + k]!
      const px = part.positions[vi * 3]!, py = part.positions[vi * 3 + 1]!, pz = part.positions[vi * 3 + 2]!
      const nx = part.normals[vi * 3]!, ny = part.normals[vi * 3 + 1]!, nz = part.normals[vi * 3 + 2]!
      /* Keyed on the BANK's own numbers, which are exact 4-dp values, so the key
       * never depends on float arithmetic the transform happens to do. */
      const key = `${px},${py},${pz}|${nx},${ny},${nz}|${slot}`
      let ni = seen.get(key)
      if (ni === undefined) {
        ni = pos.length / 3
        seen.set(key, ni)
        const p = spun([px * stretch[0], py * stretch[1], pz * stretch[2]], spins)
        pos.push(p[0] * flip, p[1], p[2])
        // Rule 7: the file's own smooth normals, copied. Not recomputed, and no
        // inverse-transpose correction for `stretch` either — the spec says
        // verbatim, and the pack's own stretched shells are shaded the same way.
        // A spin DOES turn them, because a rotation is its own inverse-transpose
        // and a spun part lit by unspun normals is lit from the wrong side.
        const n = spun([nx, ny, nz], spins)
        nrm.push(n[0] * flip, n[1], n[2])
        uv.push(u, v)
      }
      idx.push(ni)
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.name = mirror ? `${part.id}-mirror` : part.id
  return g
}

/**
 * How far the built copy runs along `facing`, and where its near end sits.
 *
 * For an axis-aligned facing on an unspun part this is exactly the old
 * `part.size[axis] * stretch[axis]` — the geometry is bbox-centred, so the span
 * is symmetric about zero. It is written as a projection because a spun part's
 * facing is a diagonal, and the chamfer idiom needs the sink measured along the
 * direction the spike actually points rather than along x or y.
 */
function spanAlong(g: THREE.BufferGeometry, f: readonly [number, number, number]):
{ lo: number; extent: number } {
  const p = g.getAttribute('position')
  let lo = Infinity, hi = -Infinity
  for (let i = 0; i < p.count; i++) {
    const d = p.getX(i) * f[0] + p.getY(i) * f[1] + p.getZ(i) * f[2]
    if (d < lo) lo = d
    if (d > hi) hi = d
  }
  return { lo, extent: hi - lo }
}

/* ------------------------------------------------------------ placement --- */

interface Copy { at: Vec3; mirror: boolean; tag: string }

function copiesOf(p: Placement): Copy[] {
  if (p.kind === 'single') return [{ at: p.at, mirror: false, tag: '' }]
  if (p.kind === 'pair') {
    return [
      { at: p.at, mirror: false, tag: '-r' },
      { at: [-p.at[0], p.at[1], p.at[2]], mirror: true, tag: '-l' },
    ]
  }
  const out: Copy[] = []
  for (let i = 0; i < p.count; i++) {
    const f = p.count === 1 ? 0 : i / (p.count - 1)
    const at: Vec3 = [
      p.from[0] + (p.to[0] - p.from[0]) * f,
      p.from[1] + (p.to[1] - p.from[1]) * f,
      p.from[2] + (p.to[2] - p.from[2]) * f,
    ]
    out.push({ at, mirror: false, tag: p.mirror ? `-r${i}` : `-${i}` })
    if (p.mirror) out.push({ at: [-at[0], at[1], at[2]], mirror: true, tag: `-l${i}` })
  }
  return out
}

/* --------------------------------------------------------------- build --- */

const lookup = (id: string): BakedPart => {
  const p = partById(id)
  if (!p) throw new Error(`assembly: "${id}" is not in the parts bank`)
  return p
}

/**
 * Build one animal.
 *
 * The returned group is grounded — feet on y = 0 — by a TRANSLATION in y only.
 * x and z are left exactly where the spec put them, because the eye card's
 * z = 0.6350 is a measured absolute and re-centring on the bounding box would
 * quietly move it whenever a snout got longer.
 */
export function buildAssembly(spec: AssemblyBuild): THREE.Group {
  const slots = Object.keys(spec.palette)
  const texture = assemblyTexture(slots, spec.palette)
  // One material, one texture, one map lookup per fragment. Never disposed, for
  // the same reason the texture is not: a clone shares it.
  const material = new THREE.MeshStandardMaterial({
    map: texture, metalness: 0, roughness: 1,
  })
  material.name = 'assembly'

  const group = new THREE.Group()
  group.name = 'assembly'
  const geoms = new Map<string, THREE.BufferGeometry>()
  const geom = (
    part: BakedPart, stretch: Vec3, spins: readonly Spin[], mirror: boolean, paint: Paint,
  ): THREE.BufferGeometry => {
    const key = `${part.id}|${stretch.join(',')}|${spins.map(s => s.axis + s.deg).join('/')}`
      + `|${mirror}|${paint.base}|${JSON.stringify(paint.byBand ?? {})}`
    const hit = geoms.get(key)
    if (hit) return hit
    const made = bakeGeometry(part, stretch, spins, mirror, paint, slots)
    geoms.set(key, made)
    return made
  }

  /* The one mass, placed by its centre. Rule 3: there is exactly one of these. */
  const hullPart = lookup(spec.hull.part)
  const hullStretch = spec.hull.stretch ?? ([1, 1, 1] as Vec3)
  /* A hull that leaves its authored proportions has to say why, out loud, where
   * Joe reads it. See the `Hull` doc comment — this is the runtime half of a
   * guard the type already makes a compile error. */
  const stretched = hullStretch.some(v => v !== 1)
  const why = spec.hull.stretchWhy?.trim() ?? ''
  if (stretched && why === '') {
    throw new Error(
      `assembly: hull "${hullPart.id}" is stretched to [${hullStretch.join(', ')}] with no `
      + '`stretchWhy`. A hull stretch is a deliberate, visible act — say why, in one sentence, '
      + 'in Joe\'s direction (docs/building-animals-from-parts.md rule 1).',
    )
  }
  const hull = new THREE.Mesh(geom(hullPart, hullStretch, [], false, spec.hull.paint), material)
  hull.name = 'hull'
  hull.position.set(spec.hull.at[0], spec.hull.at[1], spec.hull.at[2])
  hull.userData = {
    part: hullPart.id, stretch: hullStretch, mirror: false, role: 'hull',
    stretched, stretchWhy: stretched ? why : undefined,
  }
  group.add(hull)

  for (const f of spec.features) {
    const part = lookup(f.part)
    const stretch = f.stretch ?? ([1, 1, 1] as Vec3)
    const spins = f.spin ?? []
    const axis: Axis = f.axis ?? part.attachment?.axis ?? 'y'
    const baseDir = f.dir ?? part.attachment?.dir ?? 1
    const sink = f.sink ?? 0

    /* The part's FACING: its measured attachment direction, turned by the same
     * spin its vertices were, and mirrored with them. Everything else follows
     * from this one vector, which is what lets a spike sit on a 45-degree
     * chamfer without the kit knowing what a chamfer is. */
    const base: [number, number, number] = [0, 0, 0]
    base[AXIS[axis]] = baseDir
    const turned = spun(base, spins)

    for (const c of copiesOf(f.placement)) {
      const facing: [number, number, number] =
        c.mirror ? [-turned[0], turned[1], turned[2]] : [turned[0], turned[1], turned[2]]
      const g = geom(part, stretch, spins, c.mirror, f.paint)
      const { lo, extent } = spanAlong(g, facing)
      /* Put the copy's NEAR end `sink * extent` past the join point, so `sink: 0`
       * is flush and `sink: 1` is buried. Reduces exactly to the old
       * `dir * (extent / 2 - sink * extent)` whenever the facing is axis-aligned. */
      const shift = -lo - sink * extent
      const m = new THREE.Mesh(g, material)
      m.name = `${f.name}${c.tag}`
      m.position.set(
        c.at[0] + facing[0] * shift,
        c.at[1] + facing[1] * shift,
        c.at[2] + facing[2] * shift,
      )
      m.userData = {
        part: part.id, stretch, spin: spins, mirror: c.mirror, role: f.name,
        sink, axis, dir: baseDir, facing, extent, joinedAt: c.at,
      }
      group.add(m)
    }
  }

  /* Feet on y = 0. A y translation cannot move the eye card off z = 0.6350. */
  group.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(group)
  group.position.y = -box.min.y

  group.userData = {
    kit: 'assembly', slots, flag: spec.flag, texture: texture.name,
    hullStretch, hullStretchWhy: stretched ? why : undefined,
  }
  return group
}
