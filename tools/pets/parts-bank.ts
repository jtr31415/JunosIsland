/**
 * Taking the whole pack apart into a BANK of distinct part shapes.
 *
 *   npm run pets:parts             bake src/island/species/parts/bank.generated.ts
 *   npm run pets:parts -- --census print the census and bake nothing
 *
 * ## Why this exists
 *
 * `anatomy.ts` can split ONE animal in a browser, asynchronously, after a
 * GLTFLoader has fetched a `.glb`. A kit that ASSEMBLES animals cannot work that
 * way: it needs real geometry in hand, synchronously, in node (for tests) and in
 * the browser (for the game), with no async load and no `.glb` on the critical
 * path. So the 24 pack models are taken apart once, here, and the DISTINCT
 * shapes are written out as a plain TypeScript array.
 *
 * Nothing in the emitted file is authored. Every vertex, normal, index and band
 * is copied out of a real `.glb` under `src/island/public/pets/`.
 *
 * ## It reuses the real split, it does not reimplement it
 *
 * `weldedComponents` is imported from `tools/workbench/public/anatomy.ts` — the
 * same function the anatomy gallery and `tests/tools/anatomy.test.ts` use — so
 * the bank cannot drift from the gallery by having its own idea of what a
 * component is. That import is why this is a `.ts` run under node's type
 * stripping rather than an `.mjs` like its neighbours: `anatomy.ts` is TypeScript
 * and duplicating its union-find a fourth time was the alternative. The
 * `register` call below exists only because `anatomy.ts` imports
 * `./anatomy-names` without a file extension, which node's ESM resolver will not
 * take and a bundler will; the hook adds the extension and nothing else.
 *
 * ## bands, and why a swatch COLUMN is the honest unit
 *
 * The atlas is a 16 x 16 grid of 32-texel swatches (`tools/pets/reserve.mjs`),
 * u picks the column and v runs down a gradient inside it. Measured over all
 * 15,333 triangles in the pack: 0 have corners in two different columns, while
 * 8,636 have corners in two or three different ROWS. So the column is a genuine
 * per-triangle constant and the row is not — `bands[t]` is the column, 0..15, of
 * which only 1, 3, 5, 7, 9, 13 and 15 are ever used. That is what lets a
 * two-tone lifted part be split into texture regions later: group its triangles
 * by band.
 *
 * ## The origin convention
 *
 * Every part is translated so its own bounding-box centre is at the origin, on
 * all three axes, with no per-kind exception. A ground convention for legs was
 * considered and rejected: it would make the rule kind-dependent for no gain,
 * because `offset` records the world-space point the centre was moved from, so
 * the foot of a leg is exactly `offset[1] - size[1] / 2` and every attachment
 * fact stays recoverable by arithmetic. `offset` is the placement fact; the
 * geometry is placeless on purpose.
 *
 * Normals are copied verbatim and never recomputed. The pack is smooth-shaded —
 * one averaged normal per welded corner — and recomputing them per part would
 * turn a smooth hull into a faceted one at every seam the split just made.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { register } from 'node:module'

/* `anatomy.ts` imports `./anatomy-names` extensionless; node's resolver needs the
 * extension. This adds it for relative specifiers and defers everything else. */
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx) } catch (e) {
    if (spec.startsWith('.') && !/\\.[cm]?[jt]s$/.test(spec)) return next(spec + '.ts', ctx)
    throw e
  }
}`))
const { weldedComponents, componentFacts, orderComponents, namesFor } =
  await import('../workbench/public/anatomy.ts')

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')
const OUT = resolve(here, '../../src/island/species/parts/bank.generated.ts')

/* ------------------------------------------------------------------ glb --- */

interface Gltf {
  nodes?: { name?: string; mesh?: number; children?: number[]; matrix?: number[]
    translation?: number[]; rotation?: number[]; scale?: number[] }[]
  meshes?: { primitives?: { attributes: Record<string, number>; indices?: number }[] }[]
  accessors?: { bufferView: number; componentType: number; type: string
    count: number; byteOffset?: number }[]
  bufferViews?: { byteOffset?: number; byteStride?: number }[]
  scenes?: { nodes?: number[] }[]
}

/** Same chunk walk as `tools/pets/atlas.mjs` and `tests/island/pack-axioms.test.ts`. */
export function readGlb(path: string): { g: Gltf; bin: Buffer } {
  const buf = readFileSync(path)
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error('not a glb: ' + path)
  const total = buf.readUInt32LE(8)
  let off = 12
  let g: Gltf = {}
  let bin = Buffer.alloc(0)
  while (off < total) {
    const len = buf.readUInt32LE(off)
    const type = buf.readUInt32LE(off + 4)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 0x4e4f534a) g = JSON.parse(data.toString('utf8')) as Gltf
    if (type === 0x004e4942) bin = data
    off += 8 + len + ((4 - (len % 4)) % 4)
  }
  return { g, bin }
}

const SIZE: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const WIDE: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

/** One accessor, flattened — three floats per vertex, one integer per index. */
function accessor(g: Gltf, bin: Buffer, i: number): number[] {
  const acc = g.accessors![i]!
  const bv = g.bufferViews![acc.bufferView]!
  const size = SIZE[acc.componentType]!
  const n = WIDE[acc.type]!
  const stride = bv.byteStride ?? size * n
  const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
  const read = (p: number): number => acc.componentType === 5126 ? bin.readFloatLE(p)
    : acc.componentType === 5125 ? bin.readUInt32LE(p)
      : acc.componentType === 5123 ? bin.readUInt16LE(p) : bin.readUInt8(p)
  const out: number[] = []
  for (let k = 0; k < acc.count; k++) {
    const o = base + k * stride
    for (let c = 0; c < n; c++) out.push(read(o + c * size))
  }
  return out
}

/* ---------------------------------------------------------- transforms --- */

type M16 = number[]
const IDENT: M16 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function mul(a: M16, b: M16): M16 {
  const o: M16 = new Array<number>(16).fill(0)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r]! * b[c * 4 + k]!
      o[c * 4 + r] = s
    }
  }
  return o
}

function trs(node: NonNullable<Gltf['nodes']>[number]): M16 {
  if (node.matrix) return node.matrix.slice()
  const t = node.translation ?? [0, 0, 0]
  const r = node.rotation ?? [0, 0, 0, 1]
  const s = node.scale ?? [1, 1, 1]
  const x = r[0]!, y = r[1]!, z = r[2]!, w = r[3]!
  const sx = s[0]!, sy = s[1]!, sz = s[2]!
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    t[0]!, t[1]!, t[2]!, 1,
  ]
}

const xform = (m: M16, x: number, y: number, z: number): [number, number, number] => [
  m[0]! * x + m[4]! * y + m[8]! * z + m[12]!,
  m[1]! * x + m[5]! * y + m[9]! * z + m[13]!,
  m[2]! * x + m[6]! * y + m[10]! * z + m[14]!,
]

/** Every mesh node of one file, with the world matrix its geometry sits under. */
export interface MeshNode {
  name: string; world: M16
  pos: number[]; nor: number[]; uv: number[]; idx: number[]
}

export function meshNodes(g: Gltf, bin: Buffer): MeshNode[] {
  const out: MeshNode[] = []
  const walk = (i: number, m: M16): void => {
    const node = g.nodes![i]!
    const world = mul(m, trs(node))
    if (node.mesh !== undefined) {
      for (const pr of g.meshes![node.mesh]!.primitives ?? []) {
        if (pr.indices === undefined) continue
        out.push({
          name: node.name ?? '?', world,
          pos: accessor(g, bin, pr.attributes['POSITION']!),
          nor: pr.attributes['NORMAL'] !== undefined ? accessor(g, bin, pr.attributes['NORMAL']!) : [],
          uv: pr.attributes['TEXCOORD_0'] !== undefined ? accessor(g, bin, pr.attributes['TEXCOORD_0']!) : [],
          idx: accessor(g, bin, pr.indices),
        })
      }
    }
    for (const c of node.children ?? []) walk(c, world)
  }
  for (const r of g.scenes?.[0]?.nodes ?? []) walk(r, IDENT)
  return out
}

/* ------------------------------------------------------- role and shape --- */

/**
 * The ROLE a part plays in the animal Kenney authored — provenance, not a label.
 *
 * This is what the part WAS, and the census reports by it because the §7
 * inventory needs to read as "so many distinct ears". It is deliberately NOT
 * what the bank calls a shape. Joe's point: the hog's ear is also a hedgehog
 * spike, a dragon's back ridge and a crocodile's scute, and a shape filed under
 * `ear` will never be reached for when something needs a spike. A part's
 * identity comes from where it is put, how many there are and how far it is
 * sunk — so the bank names shapes by their FORM and keeps the role here.
 *
 * For a mesh NODE the role is Kenney's own name and is a fact. For a component
 * inside `body` the input is OUR name from `anatomy-names.ts`, which is a guess
 * about what a shape is, so the role is a guess too. Two names are genuinely
 * ambiguous and are recorded rather than hidden: `horn/ear-*` (the cow) is filed
 * under `horn`, `side-appendage (ear/arm/claw)-*` under `claw`. Both are flagged
 * in the census output.
 */
export type Role =
  | 'hull' | 'leg' | 'ear' | 'tail' | 'wing' | 'eye' | 'nose' | 'horn'
  | 'tooth' | 'claw' | 'band' | 'card' | 'oddment'

export function roleOf(name: string, nodeName: string): Role {
  if (nodeName.startsWith('leg')) return 'leg'
  if (nodeName === 'tail') return 'tail'
  if (nodeName.startsWith('wing')) return 'wing'
  if (nodeName === 'Group') return 'oddment'
  if (/fused hull/.test(name)) return 'hull'
  if (/torso shell-ring/.test(name)) return 'band'
  if (/^eye card/.test(name)) return 'eye'
  if (/^ear-/.test(name)) return 'ear'
  if (/^antler-|^ossicone-|head-tuft\/crest|^horn\/ear-|brow\/forehead/.test(name)) return 'horn'
  if (/^nose|^muzzle|^beak|^nostril/.test(name)) return 'nose'
  if (/tooth\/tusk\/cheek/.test(name)) return 'tooth'
  if (/^claw-|^arm-|side-appendage/.test(name)) return 'claw'
  if (/face-plate|flank-patch/.test(name)) return 'card'
  return 'oddment'
}

/**
 * WHAT A SHAPE IS, measured off its own vertices and nothing else.
 *
 * The point of this block is generative. An agent building a hedgehog has to be
 * able to ask "what in here is a small tapering spike, that I can repeat and
 * sink?" and get the hog's tusk AND the hog's ear back, without knowing either
 * name and without anyone having had the idea by hand first. That is what makes
 * the bank scale past the species someone has personally thought about.
 *
 * Every field is derived. None of them is assigned by opinion, and none of them
 * consults the role — a classification that peeked at "this was an ear" would
 * just be the role wearing a hat.
 */
export interface ShapeFacts {
  /** The family, from the cross-section's behaviour along the long axis. */
  form: 'plate' | 'spike' | 'cone' | 'blade' | 'wedge' | 'tube' | 'box'
  /** Bounding box over its own longest extent: [1, mid, thin], descending. */
  aspect: [number, number, number]
  /**
   * Cross-section at the narrow end over the wide end, along the long axis.
   * 0 is a point, 1 is a bar of constant section. The axis that separates a
   * tusk from a peg.
   */
  taper: number
  /** Mirror-symmetric about some plane, radial about the long axis, or handed. */
  symmetry: 'mirror' | 'radial' | 'handed'
  /** Absolute extent in model units — the pack is authored at one scale. */
  size: [number, number, number]
  /** Longest extent in model units, the one number a size query wants. */
  longest: number
}

/** Extent across the two axes perpendicular to `axis`, over a slice of it. */
function crossSection(positions: readonly number[], axis: number,
  from: number, to: number): number {
  const n = positions.length / 3
  let lo = Infinity, hi = -Infinity
  for (let v = 0; v < n; v++) {
    lo = Math.min(lo, positions[v * 3 + axis]!)
    hi = Math.max(hi, positions[v * 3 + axis]!)
  }
  const span = hi - lo
  let widest = 0
  for (const a of [0, 1, 2]) {
    if (a === axis) continue
    let mn = Infinity, mx = -Infinity
    for (let v = 0; v < n; v++) {
      const t = span > 1e-9 ? (positions[v * 3 + axis]! - lo) / span : 0
      if (t < from || t > to) continue
      mn = Math.min(mn, positions[v * 3 + a]!)
      mx = Math.max(mx, positions[v * 3 + a]!)
    }
    if (mx > mn) widest = Math.max(widest, mx - mn)
  }
  return widest
}

/**
 * Mirror symmetry, tested rather than assumed.
 *
 * Reflect the point set through the bounding-box centre plane of each axis and
 * ask whether it lands on itself. This is what stops a search handing back a
 * left ear when it was asked for a right one: a handed part says so.
 */
function symmetryOf(positions: readonly number[], longAxis: number):
ShapeFacts['symmetry'] {
  const n = positions.length / 3
  const pts: [number, number, number][] = []
  for (let v = 0; v < n; v++) {
    pts.push([positions[v * 3]!, positions[v * 3 + 1]!, positions[v * 3 + 2]!])
  }
  const centre = [0, 1, 2].map(a => {
    let mn = Infinity, mx = -Infinity
    for (const p of pts) { mn = Math.min(mn, p[a]!); mx = Math.max(mx, p[a]!) }
    return (mn + mx) / 2
  })
  const mirrors = [0, 1, 2].filter(a => {
    for (const p of pts) {
      const want = [p[0], p[1], p[2]]
      want[a] = 2 * centre[a]! - p[a]!
      let hit = false
      for (const q of pts) {
        if (Math.abs(want[0]! - q[0]) <= SHAPE_TOL && Math.abs(want[1]! - q[1]) <= SHAPE_TOL
          && Math.abs(want[2]! - q[2]) <= SHAPE_TOL) { hit = true; break }
      }
      if (!hit) return false
    }
    return true
  })
  /* Mirrored on both axes across the long one reads as radial for placement. */
  const across = [0, 1, 2].filter(a => a !== longAxis)
  if (across.every(a => mirrors.includes(a))) return 'radial'
  return mirrors.length ? 'mirror' : 'handed'
}

/**
 * The measured classification of one part.
 *
 * `form` comes from two ratios and nothing else: how thin the part is relative
 * to its length, and how much its cross-section collapses along that length. A
 * plate is a cut-out card with no thickness; a spike collapses to nearly nothing
 * and is long with it; a cone collapses but is stubby; a blade is thin but does
 * not collapse; a wedge half-collapses; a tube keeps a near-square section down
 * a long axis; a box is everything else.
 */
export function shapeFacts(size: readonly number[], positions: readonly number[]): ShapeFacts {
  const sorted = [...size].sort((a, b) => b - a)
  const [long, mid, thin] = [sorted[0]!, sorted[1]!, sorted[2]!]
  const axis = size.indexOf(long)

  const head = crossSection(positions, axis, 0, 0.12)
  const tail = crossSection(positions, axis, 0.88, 1)
  const taper = Math.max(head, tail) > 1e-9
    ? Math.min(head, tail) / Math.max(head, tail) : 1

  const flat = long > 1e-9 ? thin / long : 1
  const reach = mid > 1e-9 ? long / mid : 1
  const square = mid > 1e-9 ? thin / mid : 1

  const form: ShapeFacts['form'] =
    flat < 0.05 ? 'plate'
      : taper < 0.35 ? (reach > 1.5 ? 'spike' : 'cone')
        : taper < 0.72 ? 'wedge'
          : flat < 0.3 ? 'blade'
            : reach > 1.6 && square > 0.75 ? 'tube'
              : 'box'

  return {
    form,
    aspect: [1, q(mid / (long || 1)), q(thin / (long || 1))],
    taper: q(taper),
    symmetry: symmetryOf(positions, axis),
    size: [q(size[0]!), q(size[1]!), q(size[2]!)],
    longest: q(long),
  }
}

/* ------------------------------------------------------------ the parts --- */

/** One part as it came out of one file, before any deduplication. */
export interface Instance {
  species: string
  /** The node it came from — Kenney's name, a fact. */
  node: string
  /** Position within `orderComponents` order, or -1 for a whole-node part. */
  ordinal: number
  /** OUR name from `anatomy-names.ts`, or the node name for a whole-node part. */
  name: string
  /** What it was in the animal it came out of. Provenance, not the bank's label. */
  role: Role
  /** Local-space geometry, verbatim, reindexed to just this part's vertices. */
  positions: number[]; normals: number[]; indices: number[]; bands: number[]
  /** Local bbox centre — the translation removed by origin-centring. */
  localCentre: [number, number, number]
  /** World bbox, which is where placement is measured. */
  worldMin: [number, number, number]; worldMax: [number, number, number]
  size: [number, number, number]
  tris: number; verts: number
  /** Translation-invariant identity of the welded position set. */
  shapeKey: string
}

const SPECIES = readdirSync(PETS).filter(f => f.endsWith('.glb')).sort()
  .map(f => f.replace(/^animal-|\.glb$/g, ''))

/** The pack is on a 1/16 grid; this holds every authored value exactly. */
const q = (v: number): number => Math.round(v * 1e6) / 1e6

/**
 * Emitted precision: four decimal places, for positions and normals alike.
 *
 * The authored coordinates are 1/16 multiples and survive this exactly; what
 * does not is the origin-centring, which subtracts a bbox centre that can be a
 * half-grid value, and the smooth normals, which are irrational. Four places
 * bounds the error at 5e-5 model units — 1/25000 of a 1.25-unit body, far below
 * one texel of the atlas — and it is the difference between a 472 KB module and
 * one the island can import without thinking about it.
 *
 * `tests/island/parts-bank.test.ts` checks the round trip against the real GLBs
 * with a tolerance derived from this constant rather than a guessed one.
 */
export const EMIT_DP = 4
const qe = (v: number): number => Math.round(v * 10 ** EMIT_DP) / 10 ** EMIT_DP

/**
 * Pull one component out of a mesh node as a standalone, origin-centred part.
 *
 * Geometry stays in NODE-LOCAL space. That is what makes the 86 legs collapse to
 * one shape: four of them sit under a rotated node, and baking world-space
 * positions would have made those four different shapes for a reason that is
 * placement, not form. The world matrix is used only to measure where the part
 * sits, never to bake it.
 */
function extract(species: string, mn: MeshNode, triangles: readonly number[],
  ordinal: number, name: string): Instance {
  /* Reindex: only the vertices this component's triangles actually use. */
  const remap = new Map<number, number>()
  const positions: number[] = [], normals: number[] = [], indices: number[] = []
  const bands: number[] = []
  for (const t of triangles) {
    for (let k = 0; k < 3; k++) {
      const v = mn.idx[t * 3 + k]!
      let n = remap.get(v)
      if (n === undefined) {
        n = remap.size
        remap.set(v, n)
        positions.push(mn.pos[v * 3]!, mn.pos[v * 3 + 1]!, mn.pos[v * 3 + 2]!)
        normals.push(mn.nor[v * 3] ?? 0, mn.nor[v * 3 + 1] ?? 0, mn.nor[v * 3 + 2] ?? 0)
      }
      indices.push(n)
    }
    /* Every triangle in the pack has all three corners in one swatch column,
     * so the first corner decides the band and the other two agree. */
    const v0 = mn.idx[t * 3]!
    bands.push(Math.min(15, Math.floor((mn.uv[v0 * 2] ?? 0) * 16)))
  }

  const lmin: [number, number, number] = [Infinity, Infinity, Infinity]
  const lmax: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  const wmin: [number, number, number] = [Infinity, Infinity, Infinity]
  const wmax: [number, number, number] = [-Infinity, -Infinity, -Infinity]
  for (let v = 0; v * 3 < positions.length; v++) {
    const x = positions[v * 3]!, y = positions[v * 3 + 1]!, z = positions[v * 3 + 2]!
    const l = [x, y, z]
    const w = xform(mn.world, x, y, z)
    for (let a = 0; a < 3; a++) {
      if (l[a]! < lmin[a]!) lmin[a] = l[a]!
      if (l[a]! > lmax[a]!) lmax[a] = l[a]!
      if (w[a]! < wmin[a]!) wmin[a] = w[a]!
      if (w[a]! > wmax[a]!) wmax[a] = w[a]!
    }
  }
  const localCentre: [number, number, number] =
    [(lmin[0] + lmax[0]) / 2, (lmin[1] + lmax[1]) / 2, (lmin[2] + lmax[2]) / 2]

  /*
   * Identity: the welded position set, anchored at the bounding-box MIN.
   *
   * Min rather than centre on purpose. The centre is a half value, so centring
   * turns authored 1/16 coordinates into ones that can sit exactly on a rounding
   * boundary, and two instances of the SAME shape can then round opposite ways
   * and be counted as two — which is precisely what happened (88 shapes became
   * 91) when the key was taken after centring. The min is itself an authored
   * coordinate, so `p - min` is a difference of two grid values and is stable.
   */
  const pts = new Set<string>()
  for (let v = 0; v * 3 < positions.length; v++) {
    pts.add([0, 1, 2].map(a =>
      Math.round((positions[v * 3 + a]! - lmin[a]!) * 1e4)).join(','))
  }

  /* Origin-centre: same rule for every kind, see the header. */
  for (let v = 0; v * 3 < positions.length; v++) {
    positions[v * 3] = qe(positions[v * 3]! - localCentre[0])
    positions[v * 3 + 1] = qe(positions[v * 3 + 1]! - localCentre[1])
    positions[v * 3 + 2] = qe(positions[v * 3 + 2]! - localCentre[2])
  }
  for (let i = 0; i < normals.length; i++) normals[i] = qe(normals[i]!)

  return {
    species, node: mn.name, ordinal, name, role: roleOf(name, mn.name),
    positions, normals, indices, bands,
    localCentre: localCentre.map(q) as [number, number, number],
    worldMin: wmin.map(q) as [number, number, number],
    worldMax: wmax.map(q) as [number, number, number],
    size: [q(lmax[0] - lmin[0]), q(lmax[1] - lmin[1]), q(lmax[2] - lmin[2])],
    tris: triangles.length, verts: remap.size,
    shapeKey: [...pts].sort().join(';'),
  }
}

/** Every part of every pack animal, in species then component order. */
export function allInstances(): Instance[] {
  const out: Instance[] = []
  for (const species of SPECIES) {
    const { g, bin } = readGlb(join(PETS, `animal-${species}.glb`))
    for (const mn of meshNodes(g, bin)) {
      const comps = weldedComponents(mn.pos, mn.idx)
      if (mn.name === 'body') {
        const facts = comps.map(c => componentFacts(mn.pos, mn.idx, c))
        const paired = orderComponents(comps.map((c, i) => ({ tris: c, facts: facts[i]! })))
        const names = namesFor(species, paired.map(p => p.facts))
        paired.forEach((p, i) => out.push(extract(species, mn, p.tris, i, names[i]!.name)))
      } else {
        /* Measured: every non-body node is exactly one welded component. */
        comps.forEach((c, i) => out.push(extract(species, mn, c, -1, mn.name + (comps.length > 1 ? `#${i}` : ''))))
      }
    }
  }
  return out
}

/* ------------------------------------------------------------- the bank --- */

/**
 * How the pack actually joined this shape on, measured across every instance.
 *
 * This is what makes repeat-and-sink safe rather than a gamble. `sunkFraction`
 * is the share of the part's own extent that lies inside the hull along the axis
 * it protrudes on — so a spike meant to be half-buried says 0.5 and a kit can
 * repeat it down a back at a depth the pack itself demonstrates, instead of one
 * someone guessed. The min/max are the RANGE over all donors, because a range is
 * a parameter and a single number would be a rule.
 */
export interface Attachment {
  /** The axis the part protrudes along, most common across donors. */
  axis: 'x' | 'y' | 'z'
  /** +1 if it protrudes towards the hull's max on that axis, -1 towards min. */
  dir: 1 | -1
  sunkUnitsMin: number; sunkUnitsMean: number; sunkUnitsMax: number
  sunkFractionMin: number; sunkFractionMean: number; sunkFractionMax: number
  /** How many donor instances the range was measured over. */
  n: number
}

export interface Baked {
  id: string
  /** What the geometry IS, measured. The bank's label. */
  shape: ShapeFacts
  /** How the pack joined it on, with the range over every donor. */
  attachment: Attachment | null
  /** Every role the pack put this shape to. Provenance, not a label. */
  roles: Role[]
  provenance: { species: string; node: string; ordinal: number; name: string; role: Role }[]
  positions: number[]; normals: number[]; indices: number[]; bands: number[]
  size: [number, number, number]; tris: number; verts: number
  /** Triangle counts seen across donors — >1 means the pack triangulates it two ways. */
  triVariants: number[]
  offset: [number, number, number]
}

/**
 * How close two point sets have to be to be the same shape — and why a rounded
 * key was the wrong tool for the job.
 *
 * The first version of this hashed each min-anchored point to a 1e-4 grid and
 * compared keys. It reported 91 shapes where there are 88, and the three extra
 * were the left/right ear pairs of the beaver, the lion and the panda. Measured
 * at full precision, those pairs differ by 2.98e-8 — one float32 unit in the
 * last place, the exporter writing the same authored number twice — and a
 * hard-edged bucket splits such a pair whenever the two values happen to sit
 * across a boundary.
 *
 * So the comparison is a tolerance, not a hash. The tolerance is chosen from a
 * measured gap rather than taste. Two numbers bound it:
 *
 *   NOISE   the largest difference between two instances that ought to be one
 *           shape is 3e-8, one float32 ulp. Comparison happens on the EMITTED
 *           coordinates, though, so the real floor is the emit quantum: two
 *           values either side of a 4-dp boundary land 1e-4 apart.
 *   SIGNAL  the smallest difference between two shapes that are genuinely
 *           different — the mirrored eye cards and nose tips — is 0.045, the
 *           1/16 authoring grid showing through.
 *
 * 1e-3 is the only order of magnitude that clears both: ten times the emit
 * quantum, forty-five times below the smallest real difference. 1e-4 was tried
 * and is wrong — it sits exactly ON the emit quantum, and it split the 86 legs
 * into four "shapes" that are one leg rounded four ways.
 */
export const SHAPE_TOL = 1e-3

/** A part's distinct points, translated so the bounding-box min is the origin. */
function anchored(inst: Instance): [number, number, number][] {
  const n = inst.positions.length / 3
  const min = [Infinity, Infinity, Infinity]
  for (let v = 0; v < n; v++) {
    for (let a = 0; a < 3; a++) min[a] = Math.min(min[a]!, inst.positions[v * 3 + a]!)
  }
  const seen = new Set<string>()
  const out: [number, number, number][] = []
  for (let v = 0; v < n; v++) {
    const p: [number, number, number] = [
      inst.positions[v * 3]! - min[0]!,
      inst.positions[v * 3 + 1]! - min[1]!,
      inst.positions[v * 3 + 2]! - min[2]!,
    ]
    const k = p.map(c => c.toFixed(7)).join(',')
    if (seen.has(k)) continue
    seen.add(k)
    out.push(p)
  }
  return out
}

/** Equal point sets up to translation, every point within `SHAPE_TOL`. */
function sameShape(a: readonly [number, number, number][],
  b: readonly [number, number, number][]): boolean {
  if (a.length !== b.length) return false
  for (const p of a) {
    let hit = false
    for (const q of b) {
      if (Math.abs(p[0] - q[0]) <= SHAPE_TOL && Math.abs(p[1] - q[1]) <= SHAPE_TOL
        && Math.abs(p[2] - q[2]) <= SHAPE_TOL) { hit = true; break }
    }
    if (!hit) return false
  }
  return true
}

/**
 * Group every instance in the pack by shape, ACROSS roles.
 *
 * Role is deliberately not part of the key. If an "ear" and a "horn" are the
 * same geometry they are one entry in the bank with two roles in its provenance,
 * and the census says so loudly — that is a shape the kit gets to use twice.
 * Keying on role would have hidden exactly the multiplier the bank exists for.
 *
 * The key is the WELDED POINT SET and nothing else, which is the brief's
 * definition and, twice over, not an obvious one:
 *
 *   NOT vertex count. `verts` counts buffer vertices, which an exporter splits
 *   at UV seams, so two copies of one shape can carry different counts. Bucketing
 *   on it meant those copies were never compared — that split the 86 legs into
 *   four.
 *
 *   NOT triangle count either. Three of the 86 legs (the deer's and the fox's
 *   back legs) carry 46 triangles where the other 83 carry 44 — over the SAME 24
 *   welded points, to the last bit. Two extra faces over an identical hull is a
 *   triangulation difference, not a shape one, and the pack's own "all 86 legs
 *   are one 24-point shape" only reads true if it is treated as one. The count
 *   is not thrown away: `triVariants` records it.
 *
 * Bucketed on the number of welded points, which is exactly the quantity being
 * compared, so the quadratic comparison stays local.
 */
export function clusters(instances: readonly Instance[]): Instance[][] {
  const buckets = new Map<number, { pts: [number, number, number][]; group: Instance[] }[]>()
  const order: Instance[][] = []
  for (const inst of instances) {
    const pts = anchored(inst)
    const bucket = buckets.get(pts.length) ?? []
    let placed = false
    for (const entry of bucket) {
      if (sameShape(pts, entry.pts)) { entry.group.push(inst); placed = true; break }
    }
    if (!placed) {
      const group = [inst]
      bucket.push({ pts, group })
      order.push(group)
    }
    buckets.set(pts.length, bucket)
  }
  return order
}

/**
 * The roles whose shapes get real geometry, and why the rest are only counted.
 *
 * Baking all thirteen roles came to 763.8 KB, too much for a module the island
 * imports eagerly. The brief's fallback is taken as written: the shapes the
 * Garden collection needs are baked, the rest are censused but not emitted. The
 * census still walks every instance, so the numbers cover the whole pack
 * whatever is in the file.
 *
 * A cluster is baked if ANY of its instances plays a Garden role — which is the
 * point of clustering across roles. A shape that is only ever a horn is left
 * out; a shape that is a horn on the cow and an ear on the hog is in, and its
 * provenance records both.
 *
 * `tooth` is in the list for a reason worth writing down: it is not a Garden
 * role, but the hog's tusks are the shape a hedgehog's spikes want, and the
 * day-one query "small tapering spikes, many, sunk" has to be able to return
 * them. Eight small parts cost about 4 KB. The rest — wing, horn, claw, oddment
 * — are censused only.
 */
export const BAKED_ROLES: ReadonlySet<Role> =
  new Set<Role>(['hull', 'leg', 'ear', 'tail', 'eye', 'nose', 'band', 'card', 'tooth', 'wing'])

/**
 * THE ROLES THAT FIX THE NUMBERING, and why this is not the same list.
 *
 * A part's id is `<form>-<NN>` where NN is a running counter per form, handed
 * out in group order to the groups that get baked. That makes the id a function
 * of WHICH ROLES ARE BAKED — and adding a role to `BAKED_ROLES` therefore
 * renumbers everything after the first newly-eligible group in each form.
 *
 * That is not a hypothetical. Adding `wing` on 4 August and regenerating moved:
 *
 *     box-31    the LION'S HULL          -> the lion's mane band
 *     blade-03  the DOG'S NOSE           -> the BEE'S WING
 *     box-23    the FOX'S BRUSH          -> the fox's hull
 *
 * Every species file names these ids as strings. Nothing would have failed to
 * compile and nothing would have failed to build — the newt's five crest blades
 * would simply have become bee wings, and the first anyone would know is Joe
 * looking at his daughter's island. The count of ids does not catch it either:
 * all 94 ids still existed afterwards, they just meant different shapes.
 *
 * So the ORDER ids are handed out in is frozen to the nine roles that were baked
 * when the current ids were minted. A role added later cannot disturb them: its
 * groups are numbered in a second pass and land after the highest number already
 * used for their form. `tests/island/parts-bank-ids.test.ts` holds the anchors.
 *
 * To deliberately renumber the whole bank — which means rewriting every species
 * file that names a part — add the role here as well as to `BAKED_ROLES`.
 */
const NUMBERING_FROZEN_BY: ReadonlySet<Role> =
  new Set<Role>(['hull', 'leg', 'ear', 'tail', 'eye', 'nose', 'band', 'card', 'tooth'])

/**
 * Where one instance sits relative to its hull: protrusion axis and sink depth.
 *
 * The axis is the one on which the part's centre is furthest from the hull's, in
 * units of hull size — the direction it sticks out. The depth is how much of the
 * part's extent lies on the hull's side of that face. A part entirely inside the
 * hull reports its whole extent; one floating clear reports zero.
 */
function sinkOf(inst: Instance, hull: Instance):
{ axis: number; dir: 1 | -1; units: number; frac: number } {
  const pc = [0, 1, 2].map(a => (inst.worldMin[a]! + inst.worldMax[a]!) / 2)
  const hc = [0, 1, 2].map(a => (hull.worldMin[a]! + hull.worldMax[a]!) / 2)
  const hs = [0, 1, 2].map(a => hull.worldMax[a]! - hull.worldMin[a]!)
  let axis = 0, best = -1
  for (let a = 0; a < 3; a++) {
    const d = hs[a]! > 1e-9 ? Math.abs(pc[a]! - hc[a]!) / hs[a]! : 0
    if (d > best) { best = d; axis = a }
  }
  const dir: 1 | -1 = pc[axis]! >= hc[axis]! ? 1 : -1
  const units = dir === 1
    ? Math.max(0, Math.min(hull.worldMax[axis]!, inst.worldMax[axis]!) - inst.worldMin[axis]!)
    : Math.max(0, inst.worldMax[axis]! - Math.max(hull.worldMin[axis]!, inst.worldMin[axis]!))
  const span = inst.size[axis]!
  return { axis, dir, units, frac: span > 1e-9 ? Math.min(1, units / span) : 0 }
}

function attachmentOf(group: readonly Instance[],
  hullOf: ReadonlyMap<string, Instance>): Attachment | null {
  const rows = group
    .filter(i => i.role !== 'hull' && hullOf.has(i.species))
    .map(i => sinkOf(i, hullOf.get(i.species)!))
  if (!rows.length) return null
  const tally = new Map<number, number>()
  for (const r of rows) tally.set(r.axis, (tally.get(r.axis) ?? 0) + 1)
  const axis = [...tally].sort((a, b) => b[1] - a[1])[0]![0]
  const on = rows.filter(r => r.axis === axis)
  const units = on.map(r => r.units), frac = on.map(r => r.frac)
  const avg = (xs: number[]): number => q(xs.reduce((a, b) => a + b, 0) / xs.length)
  return {
    axis: (['x', 'y', 'z'] as const)[axis]!,
    dir: on[0]!.dir,
    sunkUnitsMin: q(Math.min(...units)), sunkUnitsMean: avg(units), sunkUnitsMax: q(Math.max(...units)),
    sunkFractionMin: q(Math.min(...frac)), sunkFractionMean: avg(frac), sunkFractionMax: q(Math.max(...frac)),
    n: on.length,
  }
}

/**
 * Distinct shapes as bank records. First instance donates the geometry.
 *
 * Ids are SHAPE names with an ordinal — `blade-taper-03`, not `hog-ear`. What
 * the donors called the part lives in `provenance` and in `roles`, where it is
 * measurement rather than a label, and where it cannot stop a kit reaching for a
 * hog's ear when it wants a row of spikes.
 */
export function bake(groups: readonly Instance[][], instances: readonly Instance[]): Baked[] {
  const hullOf = new Map<string, Instance>()
  for (const i of instances) if (i.role === 'hull') hullOf.set(i.species, i)

  const seen = new Map<string, number>()
  const out: Baked[] = []

  /*
   * TWO PASSES, and the order between them is the whole point — see
   * `NUMBERING_FROZEN_BY`. The groups that were eligible when today's ids were
   * minted are numbered first, in their original order, so every existing id
   * keeps its shape. Groups that qualify only because a role was added later are
   * numbered afterwards and can only ever APPEND.
   */
  const frozen = groups.filter(g => g.some(i => NUMBERING_FROZEN_BY.has(i.role)))
  const added = groups.filter(g =>
    !g.some(i => NUMBERING_FROZEN_BY.has(i.role)) && g.some(i => BAKED_ROLES.has(i.role)))

  for (const group of [...frozen, ...added]) {
    const first = group[0]!
    const shape = shapeFacts(first.size, first.positions)
    const n = (seen.get(shape.form) ?? 0) + 1
    seen.set(shape.form, n)
    out.push({
      id: `${shape.form}-${String(n).padStart(2, '0')}`,
      shape,
      attachment: attachmentOf(group, hullOf),
      roles: [...new Set(group.map(i => i.role))].sort(),
      provenance: group.map(i => ({
        species: i.species, node: i.node, ordinal: i.ordinal, name: i.name, role: i.role,
      })),
      positions: first.positions, normals: first.normals,
      indices: first.indices, bands: first.bands,
      size: first.size, tris: first.tris, verts: first.verts,
      triVariants: [...new Set(group.map(i => i.tris))].sort((a, b) => a - b),
      offset: [
        q((first.worldMin[0] + first.worldMax[0]) / 2),
        q((first.worldMin[1] + first.worldMax[1]) / 2),
        q((first.worldMin[2] + first.worldMax[2]) / 2),
      ],
    })
  }
  return out.sort((a, b) => a.id.localeCompare(b.id))
}

/* ----------------------------------------------------------------- emit --- */

const HEADER = `/**
 * The distinct part shapes of the 24 Kenney pack pets, as real geometry.
 *
 * GENERATED — never hand-edit. Run \`npm run pets:parts\`
 * (\`tools/pets/parts-bank.ts\`) to rebuild it from the \`.glb\` files in
 * \`src/island/public/pets/\`. Every number below was copied out of one of those
 * files; nothing here is authored.
 *
 * A kit assembles an animal by picking records out of \`PARTS_BANK\` and placing
 * them, synchronously, with no GLTFLoader and no async load — which is the whole
 * reason the bank exists.
 *
 * ## A shape is named for what it IS, never for what it was
 *
 * \`id\` and \`shape\` describe the FORM — \`spike-02\`, \`plate-01\` — and are derived
 * from the geometry's own proportions, taper and symmetry. They deliberately say
 * nothing about the animal it came from, because the same shape does several
 * jobs: the hog's ear is also a hedgehog's spike, a dragon's back ridge and a
 * crocodile's scute, and a record filed under \`ear\` would never be reached for
 * when a kit wants a row of spikes. What a part WAS lives in \`roles\` and
 * \`provenance\`, where it is measurement rather than a label.
 *
 * The classification is meant to be QUERIED, not read. \`findParts\` at the bottom
 * answers things like "small tapering spikes I can repeat and sink" without the
 * caller knowing a single species name — which is what lets a kit build an
 * animal nobody has personally thought about.
 *
 * Two parts are the SAME SHAPE when their vertex position sets are equal after
 * translation, to 1e-4 — a tolerance three orders of magnitude above the
 * exporter's float32 noise (3e-8) and nearly three below the smallest genuine
 * difference in the pack (0.045). A shape appears ONCE however many species and
 * however many roles donate it, and roles are not part of the key: where an ear
 * and a horn are one shape, that is one record with two roles.
 *
 * Geometry is origin-centred on its own bounding-box centre, on every axis and
 * for every shape; \`offset\` is the world-space point that centre was moved from,
 * so placement stays recoverable (a leg's foot is \`offset[1] - size[1] / 2\`).
 *
 * \`bands[t]\` is the atlas swatch COLUMN, 0..15, that triangle \`t\`'s original UVs
 * point at — the palette band. Measured over the pack, no triangle's three
 * corners ever land in two different columns, so this is exact rather than a
 * majority vote. Group a part's triangles by band to split a two-tone part into
 * texture regions.
 *
 * Normals are the file's own smooth-shaded normals, copied and never recomputed.
 */

/** What a part was in the animal it came out of. Provenance, not a label. */
export type PartRole =
  | 'hull' | 'leg' | 'ear' | 'tail' | 'wing' | 'eye' | 'nose' | 'horn'
  | 'tooth' | 'claw' | 'band' | 'card' | 'oddment'

/** Where one instance of a shape was found. \`name\` is ours for body components. */
export interface PartProvenance {
  species: string
  /** The GLB node it came out of — Kenney's own name. */
  node: string
  /** Its index in \`orderComponents\` order, or -1 for a whole-node part. */
  ordinal: number
  name: string
  role: PartRole
}

/**
 * What a shape IS, measured off its own vertices. Never consults the role.
 *
 * \`taper\` is the load-bearing one: cross-section at the narrow end over the wide
 * end along the long axis, 0 for a point and 1 for a bar. It is what separates a
 * tusk from a peg when both are the same size and proportion.
 */
export interface PartShape {
  form: 'plate' | 'spike' | 'cone' | 'blade' | 'wedge' | 'tube' | 'box'
  /** Bounding box over its own longest extent: [1, mid, thin], descending. */
  aspect: readonly [number, number, number]
  taper: number
  /** A search for a right ear must not return a left one; handed parts say so. */
  symmetry: 'mirror' | 'radial' | 'handed'
  /** Absolute extent in model units — the pack is authored at one scale. */
  size: readonly [number, number, number]
  longest: number
}

/**
 * How the pack joined this shape on, as a RANGE over every donor.
 *
 * \`sunkFraction*\` is the share of the part's own extent buried in the hull. A
 * range rather than a number on purpose: burial depth is a parameter to choose,
 * not a rule to obey, and it is what tells a kit how far to sink a spike.
 */
export interface PartAttachment {
  axis: 'x' | 'y' | 'z'
  dir: 1 | -1
  sunkUnitsMin: number; sunkUnitsMean: number; sunkUnitsMax: number
  sunkFractionMin: number; sunkFractionMean: number; sunkFractionMax: number
  n: number
}

/** One distinct part shape, ready to build a BufferGeometry from. */
export interface BakedPart {
  /** \`<form>-<ordinal>\`. Describes the form; says nothing about a role. */
  id: string
  /** The measured classification. */
  shape: PartShape
  /** Measured attachment, or null for the hulls, which attach to nothing. */
  attachment: PartAttachment | null
  /** Every role the pack put this shape to — often more than one. */
  roles: readonly PartRole[]
  /** Every place this shape occurs in the pack; the first donated the geometry. */
  provenance: readonly PartProvenance[]
  /** Origin-centred, three floats per vertex. */
  positions: readonly number[]
  /** Verbatim from the file, three floats per vertex. */
  normals: readonly number[]
  /** Three per triangle, into \`positions\`. */
  indices: readonly number[]
  /**
   * Every triangle count the pack gives this shape. More than one means the same
   * welded hull is triangulated two ways — three of the 86 legs carry two extra
   * faces over the identical 24 points. The baked geometry is the first donor's.
   */
  triVariants: readonly number[]
  /** One atlas swatch column per triangle. */
  bands: readonly number[]
  /** Bounding-box size. */
  size: readonly [number, number, number]
  tris: number
  verts: number
  /** World-space point the bbox centre was translated from. */
  offset: readonly [number, number, number]
}
`

function emit(bank: readonly Baked[]): string {
  const num = (v: number): string => Object.is(v, -0) ? '0' : String(v)
  const rows = bank.map(p => {
    const prov = p.provenance.map(d =>
      `{ species: ${JSON.stringify(d.species)}, node: ${JSON.stringify(d.node)}, `
      + `ordinal: ${d.ordinal}, role: ${JSON.stringify(d.role)}, `
      + `name: ${JSON.stringify(d.name)} }`).join(',\n      ')
    const s = p.shape
    const a = p.attachment
    return `  {
    id: ${JSON.stringify(p.id)},
    shape: {
      form: ${JSON.stringify(s.form)}, taper: ${num(s.taper)}, `
      + `symmetry: ${JSON.stringify(s.symmetry)}, longest: ${num(s.longest)},
      aspect: [${s.aspect.map(num).join(', ')}],
      size: [${s.size.map(num).join(', ')}],
    },
    attachment: ${a === null ? 'null' : `{
      axis: ${JSON.stringify(a.axis)}, dir: ${a.dir}, n: ${a.n},
      sunkUnitsMin: ${num(a.sunkUnitsMin)}, sunkUnitsMean: ${num(a.sunkUnitsMean)}, `
      + `sunkUnitsMax: ${num(a.sunkUnitsMax)},
      sunkFractionMin: ${num(a.sunkFractionMin)}, `
      + `sunkFractionMean: ${num(a.sunkFractionMean)}, `
      + `sunkFractionMax: ${num(a.sunkFractionMax)},
    }`},
    roles: [${p.roles.map(r => JSON.stringify(r)).join(', ')}],
    tris: ${p.tris},
    verts: ${p.verts},
    triVariants: [${p.triVariants.join(', ')}],
    size: [${p.size.map(num).join(', ')}],
    offset: [${p.offset.map(num).join(', ')}],
    provenance: [
      ${prov},
    ],
    positions: [${p.positions.map(num).join(',')}],
    normals: [${p.normals.map(num).join(',')}],
    indices: [${p.indices.join(',')}],
    bands: [${p.bands.join(',')}],
  },`
  })
  return `${HEADER}
export const PARTS_BANK: readonly BakedPart[] = [
${rows.join('\n')}
]

/** Shapes of one measured form, in bank order. */
export const partsOfForm = (form: PartShape['form']): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.shape.form === form)

/**
 * Shapes the pack ever used for a given role.
 *
 * A lookup into provenance, NOT a category. A kit is free to ask for the shapes
 * that were ears and then use them as spikes — that is the point of naming the
 * records by form.
 */
export const partsUsedAs = (role: PartRole): readonly BakedPart[] =>
  PARTS_BANK.filter(p => p.roles.includes(role))

/** What a kit asks the bank for when it does not know any species names. */
export interface PartQuery {
  form?: PartShape['form'] | readonly PartShape['form'][]
  /** Longest extent in model units, inclusive. */
  maxLongest?: number
  minLongest?: number
  /** Cross-section ratio: \`maxTaper: 0.5\` means "must narrow to at most half". */
  maxTaper?: number
  symmetry?: PartShape['symmetry']
  /** Only shapes the pack demonstrably buried at least this deep. */
  minSunkFraction?: number
}

/**
 * Find shapes by what they ARE — the query a kit builds an unknown animal with.
 *
 * The motivating case, and the one \`tests/island/parts-bank.test.ts\` pins:
 *
 *   findParts({ form: ['spike', 'cone'], maxLongest: 0.5, maxTaper: 0.5,
 *               minSunkFraction: 0.2 })
 *
 * — "small tapering spikes I can repeat and sink" — which must return the hog's
 * tusk and the hog's ear without naming either. Results are sorted smallest
 * first, because a repeated row wants the small end of the range.
 */
export const findParts = (q: PartQuery): readonly BakedPart[] => {
  const forms = q.form === undefined ? null
    : (Array.isArray(q.form) ? q.form : [q.form]) as readonly PartShape['form'][]
  return PARTS_BANK
    .filter(p => (forms === null || forms.includes(p.shape.form))
      && (q.maxLongest === undefined || p.shape.longest <= q.maxLongest)
      && (q.minLongest === undefined || p.shape.longest >= q.minLongest)
      && (q.maxTaper === undefined || p.shape.taper <= q.maxTaper)
      && (q.symmetry === undefined || p.shape.symmetry === q.symmetry)
      && (q.minSunkFraction === undefined
        || (p.attachment !== null && p.attachment.sunkFractionMax >= q.minSunkFraction)))
    .slice()
    .sort((a, b) => a.shape.longest - b.shape.longest)
}

/** One shape by id, or \`undefined\` if the id is not in the bank. */
export const partById = (id: string): BakedPart | undefined =>
  PARTS_BANK.find(p => p.id === id)
`
}

/* ---------------------------------------------------------------- census --- */

const mean = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
const sd = (xs: readonly number[]): number => {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length)
}
const f3 = (v: number): string => (v < 0 ? '' : ' ') + v.toFixed(3)

function census(instances: readonly Instance[], groups: readonly Instance[][],
  bank: readonly Baked[]): void {
  const ROLES: Role[] = ['hull', 'leg', 'ear', 'tail', 'wing', 'eye', 'nose',
    'horn', 'tooth', 'claw', 'band', 'card', 'oddment']

  /* Which cluster each instance ended up in, so distinct counts can be taken
   * per role from the SAME clustering the bank uses. */
  const clusterOf = new Map<Instance, number>()
  groups.forEach((g, i) => { for (const inst of g) clusterOf.set(inst, i) })

  console.log('\n=== CENSUS A: by ROLE — what the pack calls things (the §7 inventory) ===\n')
  console.log('(bkd = shapes reach the bank; roles outside BAKED_ROLES are counted only)\n')
  console.log('role      inst  dist bkd  bbox size range (x / y / z)                  donor species')
  for (const k of ROLES) {
    const inst = instances.filter(i => i.role === k)
    if (!inst.length) continue
    const dist = new Set(inst.map(i => clusterOf.get(i)!))
    const rng = (a: number): string => {
      const vs = inst.map(i => i.size[a]!)
      return `${Math.min(...vs).toFixed(3)}-${Math.max(...vs).toFixed(3)}`
    }
    const donors = [...new Set(inst.map(i => i.species))].sort()
    console.log(`${k.padEnd(9)} ${String(inst.length).padStart(4)}  ${String(dist.size).padStart(4)} `
      + `${BAKED_ROLES.has(k) ? ' y ' : ' - '} `
      + `${(rng(0) + ' / ' + rng(1) + ' / ' + rng(2)).padEnd(44)} ${donors.length}: ${donors.join(' ')}`)
  }
  console.log(`${'TOTAL'.padEnd(9)} ${String(instances.length).padStart(4)}  `
    + `${String(groups.length).padStart(4)}`)

  console.log('\n=== CENSUS B: by measured FORM — what the bank ships ===\n')
  console.log('form     shapes  inst   longest range     taper range      symmetry        roles')
  const byForm = new Map<string, {
    n: number; inst: number; roles: Set<Role>; long: number[]; taper: number[]; sym: Set<string>
  }>()
  for (const g of groups) {
    const s = shapeFacts(g[0]!.size, g[0]!.positions)
    const e = byForm.get(s.form)
      ?? { n: 0, inst: 0, roles: new Set<Role>(), long: [], taper: [], sym: new Set<string>() }
    e.n++; e.inst += g.length
    e.long.push(s.longest); e.taper.push(s.taper); e.sym.add(s.symmetry)
    for (const i of g) e.roles.add(i.role)
    byForm.set(s.form, e)
  }
  for (const [s, e] of [...byForm].sort((a, b) => b[1].n - a[1].n)) {
    console.log(`${s.padEnd(8)} ${String(e.n).padStart(6)}  ${String(e.inst).padStart(4)}  `
      + `${(Math.min(...e.long).toFixed(3) + '-' + Math.max(...e.long).toFixed(3)).padEnd(16)}  `
      + `${(Math.min(...e.taper).toFixed(2) + '-' + Math.max(...e.taper).toFixed(2)).padEnd(14)}  `
      + `${[...e.sym].sort().join('/').padEnd(14)}  ${[...e.roles].sort().join(' ')}`)
  }

  console.log('\n=== CENSUS C: ONE SHAPE, SEVERAL ROLES — the bank multipliers ===\n')
  const multi = groups.filter(g => new Set(g.map(i => i.role)).size > 1)
  if (!multi.length) console.log('  none')
  for (const g of multi) {
    const roles = [...new Set(g.map(i => i.role))].sort()
    console.log(`  ${shapeFacts(g[0]!.size, g[0]!.positions).form.padEnd(8)} `
      + `${String(g[0]!.tris).padStart(3)} tris   roles: ${roles.join(' + ')}`)
    for (const r of roles) {
      const who = g.filter(i => i.role === r)
      console.log(`      as ${r.padEnd(8)} ${[...new Set(who.map(i => i.species))].join(' ')}`
        + `  (${who[0]!.name})`)
    }
  }

  console.log('\n=== PLACEMENT: part bbox centre as a fraction of its species hull bbox ===\n')
  console.log('role      n     x mean   sd       y mean   sd       z mean   sd')
  const hullOf = new Map<string, Instance>()
  for (const i of instances) if (i.role === 'hull') hullOf.set(i.species, i)
  for (const k of ROLES) {
    if (k === 'hull') continue
    const fr: number[][] = [[], [], []]
    for (const i of instances.filter(x => x.role === k)) {
      const h = hullOf.get(i.species)
      if (!h) continue
      for (let a = 0; a < 3; a++) {
        const span = h.worldMax[a]! - h.worldMin[a]!
        if (span < 1e-9) continue
        fr[a]!.push(((i.worldMin[a]! + i.worldMax[a]!) / 2 - h.worldMin[a]!) / span)
      }
    }
    if (!fr[0]!.length) continue
    console.log(`${k.padEnd(9)} ${String(fr[0]!.length).padStart(3)}  `
      + [0, 1, 2].map(a => `${f3(mean(fr[a]!))}  ${sd(fr[a]!).toFixed(3)}`).join('   '))
  }

  /*
   * SINK DEPTH — how far a part is buried in the hull.
   *
   * Load-bearing for repeat-and-sink placement: a row of spikes down a back is
   * the same shape placed N times at a chosen depth, so depth has to be a
   * measured parameter with a real range and not a minimum to be enforced.
   *
   * The axis is the one the part protrudes along — the axis on which its centre
   * is furthest from the hull's centre, in units of hull size — and the depth is
   * how much of the part's extent lies on the hull's side of that face.
   */
  console.log('\n=== SINK DEPTH: how far each part is buried in its hull ===\n')
  console.log('role      n    axis (most common)   depth in units          depth / part size')
  console.log('                                   min   mean   max        min   mean   max')
  for (const k of ROLES) {
    if (k === 'hull') continue
    const units: number[] = [], frac: number[] = [], axes: string[] = []
    for (const i of instances.filter(x => x.role === k)) {
      const h = hullOf.get(i.species)
      if (!h) continue
      const pc = [0, 1, 2].map(a => (i.worldMin[a]! + i.worldMax[a]!) / 2)
      const hc = [0, 1, 2].map(a => (h.worldMin[a]! + h.worldMax[a]!) / 2)
      const hs = [0, 1, 2].map(a => h.worldMax[a]! - h.worldMin[a]!)
      let axis = 0, best = -1
      for (let a = 0; a < 3; a++) {
        const d = hs[a]! > 1e-9 ? Math.abs(pc[a]! - hc[a]!) / hs[a]! : 0
        if (d > best) { best = d; axis = a }
      }
      const outward = pc[axis]! >= hc[axis]!
      /* Extent of the part lying inside the hull's slab on that axis. */
      const depth = outward
        ? Math.max(0, Math.min(h.worldMax[axis]!, i.worldMax[axis]!) - i.worldMin[axis]!)
        : Math.max(0, i.worldMax[axis]! - Math.max(h.worldMin[axis]!, i.worldMin[axis]!))
      const span = i.size[axis]!
      units.push(depth)
      if (span > 1e-9) frac.push(Math.min(1, depth / span))
      axes.push('xyz'[axis]!)
    }
    if (!units.length) continue
    const common = [...new Set(axes)]
      .map(a => [a, axes.filter(x => x === a).length] as const)
      .sort((a, b) => b[1] - a[1])
    /* A flat card has zero extent on the axis it protrudes along, so there is
     * no fraction to take — depth in units is the only meaningful figure. */
    const fr = frac.length
      ? `${Math.min(...frac).toFixed(3)} ${mean(frac).toFixed(3)} ${Math.max(...frac).toFixed(3)}`
      : '   n/a (zero extent on that axis)'
    console.log(`${k.padEnd(9)} ${String(units.length).padStart(3)}  `
      + `${common.map(([a, n]) => `${a}:${n}`).join(' ').padEnd(18)} `
      + `${Math.min(...units).toFixed(3)} ${mean(units).toFixed(3)} ${Math.max(...units).toFixed(3)}`
      + `      ${fr}`)
  }

  const eyeZ = instances.filter(i => i.role === 'eye')
    .map(i => q((i.worldMin[2]! + i.worldMax[2]!) / 2))
  console.log(`\neye card world z: n=${eyeZ.length} mean=${mean(eyeZ).toFixed(4)} `
    + `sd=${sd(eyeZ).toFixed(4)} min=${Math.min(...eyeZ)} max=${Math.max(...eyeZ)}`)
  console.log(`  distinct values: ${[...new Set(eyeZ)].sort((a, b) => a - b).join(' ')}`)

  console.log('\n=== THE TORSO QUESTION: the alternative hulls against the shared cube ===\n')
  /* Reuse the SAME clustering the bank uses, so "10 distinct hulls" here and
   * the hull records in the file are one number and not two. */
  const ranked = groups
    .filter(g => g.some(i => i.role === 'hull'))
    .sort((a, b) => b.length - a.length)
  /* Count HULLS, not cluster members: the crab's `Group` oddment is the same
   * cube and rightly shares the cluster, but it is not a torso. */
  const hullsIn = (g: readonly Instance[]): Instance[] => g.filter(i => i.role === 'hull')
  const shared = ranked[0]!
  const sharedHulls = hullsIn(shared)
  const sharedPts = new Set(shared[0]!.shapeKey.split(';'))
  console.log(`shared hull: ${sharedHulls.length}/24 species, size `
    + `${shared[0]!.size.join(' x ')}, ${shared[0]!.tris} tris`)
  console.log(`  ${sharedHulls.map(h => h.species).join(' ')}`)
  const alsoAs = shared.filter(i => i.role !== 'hull')
  if (alsoAs.length) {
    console.log(`  same shape also appears as: `
      + alsoAs.map(i => `${i.species}/${i.role} (${i.name})`).join(', '))
  }
  console.log()
  /* Colour: does an instance of the SAME shape point at a different palette? */
  const bandsOf = (i: Instance): string => [...new Set(i.bands)].sort((a, b) => a - b).join(',')
  const sharedBands = new Set(sharedHulls.map(bandsOf))
  console.log(`  band sets among the shared group: ${[...sharedBands].map(b => '{' + b + '}').join(' ')}`)

  /*
   * "Is this hull the cube plus something?" is a question about the two point
   * sets under SOME translation, not under the origin-centring — a taller hull
   * re-centres, so comparing centred coordinates would call every one of them
   * different for a reason that is bookkeeping. So: try the translation that
   * takes one cube corner onto each alt corner in turn, and keep the best.
   */
  const parse = (key: string): [number, number, number][] =>
    key.split(';').map(s => s.split(',').map(Number) as [number, number, number])
  const bestOverlap = (a: [number, number, number][], b: [number, number, number][]) => {
    const bSet = new Set(b.map(p => p.join(',')))
    let best = 0, at: [number, number, number] = [0, 0, 0]
    for (const anchor of b) {
      const d: [number, number, number] =
        [anchor[0] - a[0]![0], anchor[1] - a[0]![1], anchor[2] - a[0]![2]]
      let hit = 0
      for (const p of a) if (bSet.has(`${p[0] + d[0]},${p[1] + d[1]},${p[2] + d[2]}`)) hit++
      if (hit > best) { best = hit; at = d }
    }
    return { best, at }
  }

  const cubePts = parse(shared[0]!.shapeKey)
  console.log('\nalt hull            n  tris  size                    verdict')
  for (const grp of ranked.slice(1)) {
    const h = hullsIn(grp)[0]!
    const altPts = parse(h.shapeKey)
    const fwd = bestOverlap(cubePts, altPts)
    const rev = bestOverlap(altPts, cubePts)
    const verdict = fwd.best === cubePts.length
      ? `(a) CUBE + EXTRA — every one of the ${cubePts.length} cube corners is present, `
        + `plus ${altPts.length - cubePts.length} more`
      : rev.best === altPts.length
        ? `(a-) CUBE MINUS — all ${altPts.length} of its corners are cube corners, `
          + `${cubePts.length - altPts.length} of the cube's are gone`
        : `(c) DIFFERENT — best alignment matches only ${fwd.best}/${cubePts.length} cube corners`
    console.log(`  ${hullsIn(grp).map(g => g.species).join("+").padEnd(18)} ${String(hullsIn(grp).length).padStart(1)}  `
      + `${String(h.tris).padStart(4)}  ${h.size.join(' x ').padEnd(22)}  ${verdict}`)
    const shift = (fwd.best === cubePts.length ? fwd.at : rev.at).map(v => v / 1e4)
    console.log(`      corners ${altPts.length} vs cube ${cubePts.length}`
      + `   nesting shift [${shift.join(', ')}]   bands {${bandsOf(h)}}`)
  }

  /*
   * The day-one query. If this does not return the hog's tusk and the hog's ear
   * without either being named, the classification is the wrong classification.
   *
   * Note what it does NOT filter on: `form`. Asking for form spike-or-cone loses
   * the hog's tusk, which is a `wedge` at taper 0.59 while the hog's ear is a
   * `cone` at 0.25 — the same job, either side of a bucket boundary. Taper is
   * the real axis and `form` is a lossy name for a range of it, so the query
   * uses the number. That is the single most useful thing this classification
   * taught, and it is why `form` is reported as the weakest axis.
   *
   * "Many" is not a shape property and is deliberately not queryable — it is a
   * placement parameter, answered by `attachment` telling a kit how deep to sink
   * a repeated part, not by the bank.
   */
  console.log('\n=== THE DAY-ONE QUERY: "small tapering spikes, many, sunk" ===\n')
  const runQuery = (maxTaper: number, form?: string[]): Baked[] => bank
    .filter(p => (!form || form.includes(p.shape.form))
      && p.shape.longest <= 0.5 && p.shape.taper <= maxTaper
      && p.attachment !== null && p.attachment.sunkFractionMax >= 0.2)
    .sort((a, b) => a.shape.taper - b.shape.taper)
  const show = (hits: readonly Baked[]): void => {
    if (!hits.length) { console.log('    NOTHING'); return }
    for (const p of hits) {
      const who = [...new Set(p.provenance.map(d => `${d.species}/${d.name}`))]
      console.log(`    ${p.id.padEnd(9)} taper=${p.shape.taper.toFixed(2)} `
        + `longest=${p.shape.longest.toFixed(3)} sym=${p.shape.symmetry.padEnd(7)} `
        + `sunk<=${p.attachment!.sunkFractionMax.toFixed(2)}  `
        + `${who.slice(0, 2).join(' | ')}${who.length > 2 ? ' …' : ''}`)
    }
  }
  console.log('  findParts({ maxLongest: 0.5, maxTaper: 0.6, minSunkFraction: 0.2 })')
  console.log('  — taper, size and burial. No form filter, no species named.\n')
  const hits = runQuery(0.6)
  show(hits)
  const gotTusk = hits.some(p => p.provenance.some(d => d.species === 'hog' && d.role === 'tooth'))
  const gotEar = hits.some(p => p.provenance.some(d => d.species === 'hog' && d.role === 'ear'))
  console.log(`\n  hog tusk returned: ${gotTusk}     hog ear returned: ${gotEar}`
    + `${gotTusk && gotEar ? '   <- the motivating case passes' : '   <- FAILED'}`)
  console.log('\n  For contrast, the same query filtered by form spike|cone:')
  show(runQuery(0.6, ['spike', 'cone']))
  console.log('  — the tusk is gone. form is the axis that costs you recall.')

  console.log('\n=== AMBIGUOUS NAMES (ours, not Kenney\'s) ===')
  for (const n of ['horn/ear', 'side-appendage']) {
    const hits = instances.filter(i => i.name.includes(n))
    console.log(`  ${n}: ${hits.length} — ${[...new Set(hits.map(h => h.species))].join(' ')} `
      + `-> filed as '${hits[0]?.role}'`)
  }
}

/* ----------------------------------------------------------------- main --- */

/* Only when run as a script. Importing this module — which the probes and any
 * future tool do — must never write a file as a side effect. */
const RUN_DIRECTLY = /parts-bank\.ts$/.test(process.argv[1] ?? '')

if (RUN_DIRECTLY) main()

function main(): void {
  const instances = allInstances()
  const groups = clusters(instances)
  const bank = bake(groups, instances)

  if (process.argv.includes('--census')) {
    census(instances, groups, bank)
    return
  }
  mkdirSync(dirname(OUT), { recursive: true })
  const text = emit(bank)
  writeFileSync(OUT, text, 'utf8')
  console.log(`${instances.length} instances -> ${groups.length} distinct shapes`)
  console.log(`${bank.length} baked, ${groups.length - bank.length} censused only`)
  console.log(`wrote ${OUT}`)
  console.log(`${(Buffer.byteLength(text, 'utf8') / 1024).toFixed(1)} KB`)
  census(instances, groups, bank)
}
