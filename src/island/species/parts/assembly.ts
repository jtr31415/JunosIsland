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
 *   4. **Placement by translation only** — a placed node's `quaternion` is
 *      identity and its `scale` is (1,1,1), always. Mirroring is done by
 *      negating x on the copy's vertices and flipping its winding, not by
 *      `scale.x = -1`, which would be a transform.
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
 */
import * as THREE from 'three'
import { partById, type BakedPart } from './bank.generated'
import { assemblyTexture, slotUv } from './texture'

export type Vec3 = readonly [number, number, number]
export type Axis = 'x' | 'y' | 'z'

const AXIS: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

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
  placement: Placement
}

/** The one mass. Singular, and there is no second one. */
export interface Hull {
  /** A bank id. `box-03` is the 1.250 cube that 14 of the 24 share. */
  part: string
  paint: Paint
  /** Its bounding-box centre, in model units. */
  at: Vec3
  /** Rule 1. The only way this kit expresses a body proportion. */
  stretch?: Vec3
}

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
 * carries a band, and therefore a slot. A vertex shared by two triangles in
 * different slots is the only vertex that gets duplicated — which for the eye
 * card is a handful, against the 3x a blanket de-index would have cost.
 */
function bakeGeometry(
  part: BakedPart,
  stretch: Vec3,
  mirror: boolean,
  paint: Paint,
  slots: readonly string[],
): THREE.BufferGeometry {
  const sx = stretch[0] * (mirror ? -1 : 1)
  const pos: number[] = []
  const nrm: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const seen = new Map<string, number>()
  const order = mirror ? [0, 2, 1] : [0, 1, 2]

  for (let t = 0; t < part.tris; t++) {
    const band = part.bands[t] ?? -1
    const name = paint.byBand?.[band] ?? paint.base
    const slot = slots.indexOf(name)
    if (slot < 0) throw new Error(`assembly: part "${part.id}" paints slot "${name}", which is not in the palette`)
    const [u, v] = slotUv(slot, slots.length)

    for (const k of order) {
      const vi = part.indices[t * 3 + k]!
      const key = `${vi}:${slot}`
      let ni = seen.get(key)
      if (ni === undefined) {
        ni = pos.length / 3
        seen.set(key, ni)
        pos.push(
          part.positions[vi * 3]! * sx,
          part.positions[vi * 3 + 1]! * stretch[1],
          part.positions[vi * 3 + 2]! * stretch[2],
        )
        // Rule 7: the file's own smooth normals, copied. Not recomputed, and no
        // inverse-transpose correction for `stretch` either — the spec says
        // verbatim, and the pack's own stretched shells are shaded the same way.
        nrm.push(
          part.normals[vi * 3]! * (mirror ? -1 : 1),
          part.normals[vi * 3 + 1]!,
          part.normals[vi * 3 + 2]!,
        )
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
  const geom = (part: BakedPart, stretch: Vec3, mirror: boolean, paint: Paint): THREE.BufferGeometry => {
    const key = `${part.id}|${stretch.join(',')}|${mirror}|${paint.base}|${JSON.stringify(paint.byBand ?? {})}`
    const hit = geoms.get(key)
    if (hit) return hit
    const made = bakeGeometry(part, stretch, mirror, paint, slots)
    geoms.set(key, made)
    return made
  }

  /* The one mass, placed by its centre. Rule 3: there is exactly one of these. */
  const hullPart = lookup(spec.hull.part)
  const hullStretch = spec.hull.stretch ?? ([1, 1, 1] as Vec3)
  const hull = new THREE.Mesh(geom(hullPart, hullStretch, false, spec.hull.paint), material)
  hull.name = 'hull'
  hull.position.set(spec.hull.at[0], spec.hull.at[1], spec.hull.at[2])
  hull.userData = { part: hullPart.id, stretch: hullStretch, mirror: false, role: 'hull' }
  group.add(hull)

  for (const f of spec.features) {
    const part = lookup(f.part)
    const stretch = f.stretch ?? ([1, 1, 1] as Vec3)
    const axis: Axis = f.axis ?? part.attachment?.axis ?? 'y'
    const baseDir = f.dir ?? part.attachment?.dir ?? 1
    const ai = AXIS[axis]
    const extent = part.size[ai]! * stretch[ai]!
    const sink = f.sink ?? 0

    for (const c of copiesOf(f.placement)) {
      // A part joined along x has its direction mirrored with it; y and z do not.
      const dir = (axis === 'x' && c.mirror ? -baseDir : baseDir) as 1 | -1
      const shift = dir * (extent / 2 - sink * extent)
      const at: [number, number, number] = [c.at[0], c.at[1], c.at[2]]
      at[ai] += shift
      const m = new THREE.Mesh(geom(part, stretch, c.mirror, f.paint), material)
      m.name = `${f.name}${c.tag}`
      m.position.set(at[0], at[1], at[2])
      m.userData = {
        part: part.id, stretch, mirror: c.mirror, role: f.name,
        sink, axis, dir, joinedAt: c.at,
      }
      group.add(m)
    }
  }

  /* Feet on y = 0. A y translation cannot move the eye card off z = 0.6350. */
  group.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(group)
  group.position.y = -box.min.y

  group.userData = { kit: 'assembly', slots, flag: spec.flag, texture: texture.name }
  return group
}
