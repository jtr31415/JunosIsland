/**
 * Joe's four axioms about the Kenney pack, measured against the 24 binaries.
 *
 * His words, verbatim:
 *
 *   *"there are for example 2 eye shapes, at least for the sclerae, a somewhat
 *   oval shape and a round one. also one animal axiom is head = body. all the
 *   created animals have head and body, so none of them match. another axiom:
 *   all eyes are flat. another: all legs under the body/head."*
 *
 * ## What this file is for, and what it deliberately is not
 *
 * These are invariants over the PACK — the 24 authored `.glb` files under
 * `src/island/public/pets/`. They are not assertions about our kits. Three of
 * the four axioms hold of the pack and one holds only in a weaker form than
 * Joe stated it, and every number below is re-derived from the binaries on
 * every run rather than quoted from a table.
 *
 * Two of the axioms our KITS violate — every built species emits a `head` box
 * separate from its `body` box (`kits/quadruped.ts:229` and `:269`,
 * `kits/raptor.ts:289` and `:372`, `kits/songbird.ts:205` and `:268`), which is
 * the opposite of what the pack does. That is a finding for a ruling, not a
 * failing test, so nothing here asserts a kit obeys an axiom it does not obey.
 * The pack side is locked instead, so that a future re-measurement cannot
 * silently contradict this one.
 *
 * ## Why the parser is duplicated rather than imported
 *
 * Same reasoning as `facedecals.test.ts`: a shared parser lets a bug in the
 * parser agree with itself. Nothing here imports `tools/pets/*`.
 *
 * ## The one measurement trap this file hit, recorded so it is not re-hit
 *
 * "Flat" cannot be tested with an area-weighted normal alone. A CLOSED solid —
 * a leg, a torso — sums its per-triangle normals to (0, 0, 0), and dividing
 * that by its own near-zero length gives an essentially random unit vector,
 * which passes `nz >= 0.9998` about a sixth of the time. The first run of this
 * measurement reported 107 "flat cards" and 32 distinct outlines on exactly
 * that error. Dividing the summed normal by AREA instead of by its own length
 * gives a real coherence figure: 1.0 for a sheet whose triangles all face one
 * way, ~0 for anything closed. That is `coherence` below, and it cuts 107 to
 * the 69 sheets that are actually there.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SPECIES } from '../../src/island/pets'

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')

/* ------------------------------------------------------------------ glb --- */

interface Gltf {
  nodes?: { name?: string; mesh?: number; children?: number[]
    matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }[]
  meshes?: { primitives?: { attributes: Record<string, number>; indices?: number }[] }[]
  accessors?: { bufferView: number; componentType: number; type: string
    count: number; byteOffset?: number }[]
  bufferViews?: { byteOffset?: number; byteStride?: number }[]
  scenes?: { nodes?: number[] }[]
}

function readGlb(path: string): { json: Gltf; bin: Buffer } {
  const buf = readFileSync(path)
  const total = buf.readUInt32LE(8)
  let off = 12
  let json: Gltf = {}
  let bin = Buffer.alloc(0)
  while (off < total) {
    const len = buf.readUInt32LE(off)
    const type = buf.readUInt32LE(off + 4)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 0x4e4f534a) json = JSON.parse(data.toString('utf8')) as Gltf
    if (type === 0x004e4942) bin = data
    off += 8 + len + ((4 - (len % 4)) % 4)
  }
  return { json, bin }
}

const SIZE: Record<number, number> = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }
const WIDE: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }

function accessor(g: Gltf, bin: Buffer, i: number): number[][] {
  const acc = (g.accessors as NonNullable<Gltf['accessors']>)[i] as
    NonNullable<Gltf['accessors']>[number]
  const bv = (g.bufferViews as NonNullable<Gltf['bufferViews']>)[acc.bufferView] as
    NonNullable<Gltf['bufferViews']>[number]
  const size = SIZE[acc.componentType] as number
  const n = WIDE[acc.type] as number
  const stride = bv.byteStride ?? size * n
  const base = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
  const read = (p: number): number =>
    acc.componentType === 5126 ? bin.readFloatLE(p)
      : acc.componentType === 5125 ? bin.readUInt32LE(p)
        : acc.componentType === 5123 ? bin.readUInt16LE(p) : bin.readUInt8(p)
  const out: number[][] = []
  for (let k = 0; k < acc.count; k++) {
    const o = base + k * stride
    const tuple: number[] = []
    for (let c = 0; c < n; c++) tuple.push(read(o + c * size))
    out.push(tuple)
  }
  return out
}

/* ----------------------------------------------------- world transforms --- */

type M16 = number[]
const IDENT: M16 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function mul(a: M16, b: M16): M16 {
  const o: M16 = new Array<number>(16).fill(0)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += (a[k * 4 + r] as number) * (b[c * 4 + k] as number)
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
  const x = r[0] as number, y = r[1] as number, z = r[2] as number, w = r[3] as number
  const sx = s[0] as number, sy = s[1] as number, sz = s[2] as number
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    t[0] as number, t[1] as number, t[2] as number, 1,
  ]
}

const xform = (m: M16, p: number[]): number[] => [
  (m[0] as number) * (p[0] as number) + (m[4] as number) * (p[1] as number)
    + (m[8] as number) * (p[2] as number) + (m[12] as number),
  (m[1] as number) * (p[0] as number) + (m[5] as number) * (p[1] as number)
    + (m[9] as number) * (p[2] as number) + (m[13] as number),
  (m[2] as number) * (p[0] as number) + (m[6] as number) * (p[1] as number)
    + (m[10] as number) * (p[2] as number) + (m[14] as number),
]

/* --------------------------------------------------------------- harvest --- */

interface Tri { nodeName: string; world: number[][]; centroid: number[]
  area: number; normal: number[] }
/** A mesh node, with the half-open range of `tris` it contributed. */
interface MeshNode { name: string; translation: number[]; first: number; last: number }

function harvest(g: Gltf, bin: Buffer): { tris: Tri[]; nodes: MeshNode[] } {
  const tris: Tri[] = []
  const nodes: MeshNode[] = []
  const walk = (i: number, m: M16): void => {
    const node = (g.nodes as NonNullable<Gltf['nodes']>)[i] as
      NonNullable<Gltf['nodes']>[number]
    const wm = mul(m, trs(node))
    if (node.mesh !== undefined) {
      const first = tris.length
      const mesh = (g.meshes as NonNullable<Gltf['meshes']>)[node.mesh] as
        NonNullable<Gltf['meshes']>[number]
      for (const pr of mesh.primitives ?? []) {
        if (pr.indices === undefined) continue
        const po = accessor(g, bin, pr.attributes['POSITION'] as number)
        const ix = accessor(g, bin, pr.indices)
        for (let k = 0; k + 2 < ix.length; k += 3) {
          const c = [ix[k]?.[0] as number, ix[k + 1]?.[0] as number, ix[k + 2]?.[0] as number]
          const p = c.map(v => xform(wm, po[v] as number[]))
          const a = p[0] as number[], b = p[1] as number[], d = p[2] as number[]
          const e1 = [(b[0] as number) - (a[0] as number), (b[1] as number) - (a[1] as number),
            (b[2] as number) - (a[2] as number)]
          const e2 = [(d[0] as number) - (a[0] as number), (d[1] as number) - (a[1] as number),
            (d[2] as number) - (a[2] as number)]
          const cr = [
            (e1[1] as number) * (e2[2] as number) - (e1[2] as number) * (e2[1] as number),
            (e1[2] as number) * (e2[0] as number) - (e1[0] as number) * (e2[2] as number),
            (e1[0] as number) * (e2[1] as number) - (e1[1] as number) * (e2[0] as number),
          ]
          const len = Math.hypot(cr[0] as number, cr[1] as number, cr[2] as number) || 1
          tris.push({
            nodeName: node.name ?? '', world: p,
            centroid: [0, 1, 2].map(j =>
              ((a[j] as number) + (b[j] as number) + (d[j] as number)) / 3),
            area: 0.5 * len, normal: cr.map(v => v / len),
          })
        }
      }
      nodes.push({ name: node.name ?? '', translation: [wm[12] as number,
        wm[13] as number, wm[14] as number], first, last: tris.length })
    }
    for (const child of node.children ?? []) walk(child, wm)
  }
  for (const root of g.scenes?.[0]?.nodes ?? []) walk(root, IDENT)
  return { tris, nodes }
}

/* ------------------------------------------------------------- the weld --- */

/** Positions are welded at 1e-5, the tolerance the component census used. */
const q = (x: number): number => Math.round(x * 1e5)
const key = (p: number[]): string =>
  `${q(p[0] as number)},${q(p[1] as number)},${q(p[2] as number)}`

/**
 * A connected component of the welded triangle graph, plus everything the four
 * axioms need to ask of it.
 *
 * `coherence` is |Σ area·n̂| / Σ area — 1 for a sheet whose triangles all face
 * one way, ~0 for a closed solid. See the trap note in the file header.
 */
interface Comp {
  tris: Tri[]; count: number; area: number; share: number
  bb: number[][]; ext: number[]; minExt: number
  centroid: number[]; unitNormal: number[]; coherence: number
  sheet: boolean; forward: boolean; nodeNames: string[]
}

interface Pet { name: string; tris: Tri[]; nodes: MeshNode[]; comps: Comp[]; total: number }

function analyse(name: string): Pet {
  const { json: g, bin } = readGlb(join(PETS, `${name}.glb`))
  const { tris, nodes } = harvest(g, bin)
  const total = tris.reduce((s, t) => s + t.area, 0)

  const parent = tris.map((_, i) => i)
  const find = (a: number): number => {
    while ((parent[a] as number) !== a) {
      parent[a] = parent[parent[a] as number] as number
      a = parent[a] as number
    }
    return a
  }
  const at = new Map<string, number[]>()
  tris.forEach((t, i) => {
    for (const p of t.world) {
      const k = key(p)
      const list = at.get(k)
      if (list) list.push(i)
      else at.set(k, [i])
    }
  })
  for (const list of at.values()) {
    for (let i = 1; i < list.length; i++) {
      const ra = find(list[0] as number), rb = find(list[i] as number)
      if (ra !== rb) parent[ra] = rb
    }
  }
  const groups = new Map<number, number[]>()
  tris.forEach((_, i) => {
    const r = find(i)
    const list = groups.get(r)
    if (list) list.push(i)
    else groups.set(r, [i])
  })

  const comps: Comp[] = [...groups.values()].map(idx => {
    const ts = idx.map(i => tris[i] as Tri)
    const bb = [[1e9, -1e9], [1e9, -1e9], [1e9, -1e9]]
    let area = 0
    const n = [0, 0, 0], c = [0, 0, 0]
    for (const t of ts) {
      area += t.area
      for (let d = 0; d < 3; d++) {
        n[d] = (n[d] as number) + (t.normal[d] as number) * t.area
        c[d] = (c[d] as number) + (t.centroid[d] as number) * t.area
      }
      for (const p of t.world) {
        for (let d = 0; d < 3; d++) {
          const row = bb[d] as number[]
          row[0] = Math.min(row[0] as number, p[d] as number)
          row[1] = Math.max(row[1] as number, p[d] as number)
        }
      }
    }
    const ext = [0, 1, 2].map(d =>
      ((bb[d] as number[])[1] as number) - ((bb[d] as number[])[0] as number))
    const unitNormal = n.map(v => (v as number) / area)
    const coherence = Math.hypot(unitNormal[0] as number, unitNormal[1] as number,
      unitNormal[2] as number)
    return {
      tris: ts, count: ts.length, area, share: area / total, bb, ext,
      minExt: Math.min(...ext), centroid: c.map(v => (v as number) / area),
      unitNormal, coherence,
      sheet: ext.some(e => e === 0) || coherence >= 0.9998,
      forward: (unitNormal[2] as number) >= 0.9998,
      nodeNames: [...new Set(ts.map(t => t.nodeName))],
    }
  })
  return { name, tris, nodes, comps, total }
}

/**
 * The outer silhouette of a sheet: the vertices of every edge used by exactly
 * one triangle. A pupil cut into the same sheet is interior, so it does not
 * appear here — this is the OUTLINE, which is what Joe's axiom is about.
 */
function outline(c: Comp): number[][] {
  const used = new Map<string, number>()
  for (const t of c.tris) {
    for (let e = 0; e < 3; e++) {
      const a = key(t.world[e] as number[]), b = key(t.world[(e + 1) % 3] as number[])
      const k = a < b ? `${a}|${b}` : `${b}|${a}`
      used.set(k, (used.get(k) ?? 0) + 1)
    }
  }
  const verts = new Set<string>()
  for (const [k, n] of used) {
    if (n !== 1) continue
    const [a, b] = k.split('|')
    verts.add(a as string); verts.add(b as string)
  }
  return [...verts].map(k => k.split(',').map(v => Number(v) / 1e5))
}

/** A card's outline in its own bbox, in the XY plane it lives in, 0..1. */
function normalised(c: Comp): { pts: number[][]; w: number; h: number } {
  const v = outline(c)
  const lo = [0, 1].map(d => Math.min(...v.map(p => p[d] as number)))
  const hi = [0, 1].map(d => Math.max(...v.map(p => p[d] as number)))
  const w = (hi[0] as number) - (lo[0] as number)
  const h = (hi[1] as number) - (lo[1] as number)
  return {
    pts: v.map(p => [
      ((p[0] as number) - (lo[0] as number)) / (w || 1),
      ((p[1] as number) - (lo[1] as number)) / (h || 1),
    ]),
    w, h,
  }
}

/**
 * Two outlines are the same shape if no point of either is further than `tol`
 * from the other, after normalising both to their own bbox. Compared BOTH ways
 * round in x, so a left eye and its mirrored right eye are one shape.
 *
 * A hash of quantised coordinates cannot do this job and the first run of this
 * measurement proved it: at 1e-4 the cow's left and right eye — exact mirrors —
 * landed in different buckets because three of their fifteen boundary vertices
 * rounded across a tie by one unit in the last place (0.0402 against 0.0403).
 * A tolerance is the honest comparison; a bucket boundary is not.
 */
function hausdorff(a: number[][], b: number[][]): number {
  let m = 0
  for (const p of a) {
    m = Math.max(m, Math.min(...b.map(qq =>
      Math.hypot((p[0] as number) - (qq[0] as number), (p[1] as number) - (qq[1] as number)))))
  }
  for (const p of b) {
    m = Math.max(m, Math.min(...a.map(qq =>
      Math.hypot((p[0] as number) - (qq[0] as number), (p[1] as number) - (qq[1] as number)))))
  }
  return m
}

const sameShape = (a: number[][], b: number[][]): number => Math.min(
  hausdorff(a, b),
  hausdorff(a, b.map(p => [1 - (p[0] as number), p[1] as number])),
)

/* ---------------------------------------------------------------- setup --- */

const PACK = SPECIES.map(s => analyse(s))

/** Every forward-facing sheet in the pack: the face decals. */
interface Card { pet: string; comp: Comp; sig: string; w: number; h: number; pts: number[][] }
const CARDS: Card[] = []
for (const pet of PACK) {
  for (const c of pet.comps) {
    if (!c.sheet || !c.forward) continue
    const n = normalised(c)
    CARDS.push({ pet: pet.name, comp: c, w: n.w, h: n.h, pts: n.pts,
      sig: `${n.w.toFixed(3)}x${n.h.toFixed(3)}/${c.count}t` })
  }
}
const bySig = new Map<string, Card[]>()
for (const c of CARDS) {
  const l = bySig.get(c.sig)
  if (l) l.push(c)
  else bySig.set(c.sig, [c])
}

/**
 * The eyes: in each species, the decal signature with the largest card. Every
 * other decal on the face — the nostril quads, the muzzle, the mouth bar — is
 * strictly smaller, so this needs no hand-written list of which is which.
 */
const EYES: Card[] = []
for (const pet of PACK) {
  const mine = CARDS.filter(c => c.pet === pet.name)
  const g = new Map<string, Card[]>()
  for (const c of mine) {
    const l = g.get(c.sig)
    if (l) l.push(c)
    else g.set(c.sig, [c])
  }
  const biggest = [...g.values()].sort((a, b) =>
    (b[0] as Card).w * (b[0] as Card).h - (a[0] as Card).w * (a[0] as Card).h)[0] as Card[]
  EYES.push(...biggest)
}

/** The two families Joe names, by their measured signature. */
const OVAL = '0.400x0.320/27t'
const ROUND = '0.400x0.400/30t'

/* ================================================================ axiom 1 == */

describe('axiom 1 — a Kenney pet is ONE form, not a head joined to a body', () => {
  /**
   * Joe: *"one animal axiom is head = body."* The pack side of the claim, which
   * a prior census already established and this locks: welding by position at
   * 1e-5, no `body` mesh ever falls apart into a head piece and a torso piece.
   */
  it('welds the 24 body meshes into 206 components, 4 to 12 each', () => {
    let total = 0
    for (const pet of PACK) {
      const n = pet.comps.filter(c => c.nodeNames.includes('body')).length
      expect(n, pet.name).toBeGreaterThanOrEqual(4)
      expect(n, pet.name).toBeLessThanOrEqual(12)
      total += n
    }
    expect(total).toBe(206)
  })

  it('and in none of the 24 is the head a piece you could lift off', () => {
    /*
     * The biggest hull in each body covers at least 49% of the body's whole
     * height, and in 23 of 24 it reaches from the top third down into the
     * bottom third — one form, spanning head and torso. The exception is the
     * CRAB, whose 0.493 is not a failure of the axiom but the absence of its
     * subject: a crab has no raised head to separate.
     */
    let spanning = 0
    const exceptions: string[] = []
    for (const pet of PACK) {
      const body = pet.comps.filter(c => c.nodeNames.includes('body'))
      let lo = 1e9, hi = -1e9
      for (const t of pet.tris) {
        if (t.nodeName !== 'body') continue
        for (const p of t.world) {
          lo = Math.min(lo, p[1] as number); hi = Math.max(hi, p[1] as number)
        }
      }
      const big = body.slice().sort((a, b) => b.area - a.area)[0] as Comp
      const row = big.bb[1] as number[]
      const frac = ((row[1] as number) - (row[0] as number)) / (hi - lo)
      expect(frac, pet.name).toBeGreaterThanOrEqual(0.49)
      if ((row[1] as number) >= lo + (hi - lo) * 2 / 3 && (row[0] as number) <= lo + (hi - lo) / 3) {
        spanning++
      } else exceptions.push(pet.name)
    }
    expect(spanning).toBe(23)
    expect(exceptions).toEqual(['animal-crab'])
  })
})

/* ================================================================ axiom 2 == */

describe('axiom 2 — the sclera comes in two shapes, an oval and a round one', () => {
  it('finds 63 forward-facing sheets on the 24 faces', () => {
    expect(CARDS.length).toBe(63)
    for (const c of CARDS) expect(c.comp.unitNormal[2] as number).toBeGreaterThanOrEqual(0.9998)
  })

  it('gives every species exactly two eyes, and never an odd one', () => {
    expect(EYES.length).toBe(48)
    for (const pet of PACK) {
      expect(EYES.filter(e => e.pet === pet.name).length, pet.name).toBe(2)
    }
  })

  it('reduces the 63 to exactly TEN distinct outlines', () => {
    /*
     * `docs/how-the-animals-are-made.md:132-133` says ten, and thirty-two of
     * the sixty-three the same 27-triangle mesh. Both re-derive here.
     */
    expect(bySig.size).toBe(10)
    expect((bySig.get(OVAL) as Card[]).length).toBe(32)
  })

  it('and each of those ten really is ONE shape, not a bucket of near-misses', () => {
    /*
     * The strongest form of the claim: within a signature, every card matches
     * the first one to better than 1e-4 of its own width, mirrors included.
     * The worst pair in the pack is 9.92e-5, so no signature is hiding two
     * different silhouettes that merely share a bounding box.
     */
    let worst = 0
    for (const [sig, l] of bySig) {
      const ref = (l[0] as Card).pts
      for (const c of l) {
        const d = sameShape(ref, c.pts)
        expect(d, `${sig} / ${c.pet}`).toBeLessThan(1e-4)
        worst = Math.max(worst, d)
      }
    }
    expect(worst).toBeLessThan(1e-4)
  })

  it('the 32 oval cards are one mesh across SIXTEEN species, to 3.2e-5', () => {
    const l = bySig.get(OVAL) as Card[]
    expect(new Set(l.map(c => c.pet)).size).toBe(16)
    for (const c of l) expect(c.comp.count, c.pet).toBe(27)
    const ref = (l[0] as Card).pts
    for (const c of l) expect(sameShape(ref, c.pts), c.pet).toBeLessThan(3.2e-5)
  })

  it('the oval is 1.25 : 1 and the round is 1.00 : 1, exactly', () => {
    const oval = (bySig.get(OVAL) as Card[])[0] as Card
    const round = (bySig.get(ROUND) as Card[])[0] as Card
    expect(oval.w).toBeCloseTo(0.400, 3)
    expect(oval.h).toBeCloseTo(0.320, 3)
    expect(oval.w / oval.h).toBeCloseTo(1.25, 2)
    expect(round.w).toBeCloseTo(0.400, 3)
    expect(round.h).toBeCloseTo(0.400, 3)
    expect(round.w / round.h).toBeCloseTo(1.0, 3)
    expect((bySig.get(ROUND) as Card[]).length).toBe(10)
    expect(new Set((bySig.get(ROUND) as Card[]).map(c => c.pet)).size).toBe(5)
  })

  it('but the axiom covers 42 of the 48 eyes, not all of them', () => {
    /*
     * REFUTED AS STATED, AND ONLY JUST. Joe's two families are 21 of the 24
     * species and 42 of the 48 eyes. Three animals are bespoke: the cat
     * (0.400 x 0.350, 34 triangles), the caterpillar (0.330 x 0.276, 25) and
     * the panda (0.435 x 0.443, 57 — its eye and its black patch are one
     * welded sheet, which is why it is the largest of the five).
     *
     * All three sit inside the aspect band the two families bracket: cat 1.14,
     * caterpillar 1.20, panda 0.98, against oval 1.25 and round 1.00. So the
     * axiom is right about the LOOK and wrong about the MESH COUNT, and any
     * kit rule derived from it should be written on the aspect ratio.
     */
    const inFamily = EYES.filter(e => e.sig === OVAL || e.sig === ROUND)
    expect(inFamily.length).toBe(42)
    expect(new Set(inFamily.map(e => e.pet)).size).toBe(21)

    const rest = EYES.filter(e => e.sig !== OVAL && e.sig !== ROUND)
    expect(rest.length).toBe(6)
    expect([...new Set(rest.map(e => e.pet))].sort())
      .toEqual(['animal-cat', 'animal-caterpillar', 'animal-panda'])
    for (const e of rest) {
      expect(e.w / e.h, e.pet).toBeGreaterThan(0.98)
      expect(e.w / e.h, e.pet).toBeLessThan(1.25)
    }
  })
})

/* ================================================================ axiom 3 == */

describe('axiom 3 — every eye in the pack is flat', () => {
  /**
   * The invariant, stated so it can be tested: a component of the welded
   * triangle graph whose area-weighted unit normal has nz >= 0.9998 — a
   * coherent sheet facing the camera — has a bounding-box axis of zero. There
   * is no such thing in the pack as a forward-facing eye with thickness.
   */
  it('is exactly flat on all 48 eyes — the thin axis is 0, not nearly 0', () => {
    for (const e of EYES) expect(e.comp.minExt, e.pet).toBe(0)
  })

  it('and on 62 of the 63 decals, the 63rd being the cat mouth at 9.1e-9', () => {
    const exact = CARDS.filter(c => c.comp.minExt === 0)
    expect(exact.length).toBe(62)
    const rest = CARDS.filter(c => c.comp.minExt !== 0)
    expect(rest.length).toBe(1)
    const only = rest[0] as Card
    expect(only.pet).toBe('animal-cat')
    expect(only.comp.count).toBe(21)
    expect(only.comp.minExt).toBeLessThan(1e-8)
    for (const c of CARDS) expect(c.comp.minExt, c.pet).toBeLessThan(1e-8)
  })

  it('and NOTHING in the 24 protrudes forward as a solid', () => {
    /*
     * The converse, which is the half that makes the axiom worth having: over
     * all 315 welded components in the pack, no component with real thickness
     * faces forward coherently. Every forward-facing thing is a sheet.
     */
    let total = 0, solidForward = 0
    for (const pet of PACK) {
      for (const c of pet.comps) {
        total++
        if (c.forward && c.minExt > 1e-8) {
          solidForward++
          expect.unreachable(`${pet.name}: a solid faces +Z, ext ${c.ext.join()}`)
        }
      }
    }
    expect(total).toBe(315)
    expect(solidForward).toBe(0)
  })
})

/* ================================================================ axiom 4 == */

describe('axiom 4 — every leg sits under the body', () => {
  /**
   * The rule, as an inequality a test can assert. For every `leg-*` node L and
   * the `body` node's world bbox B of the same pet:
   *
   *     B.min.x <= L.x <= B.max.x                      (inside the footprint)
   *     B.min.z <= L.z <= B.max.z
   *     max(y of L's own triangles) <= (B.min.y + B.max.y) / 2      (below it)
   *
   * The first two hold with 0.375 of margin everywhere. The third is the
   * WEAKER of the two readings of "under" and it is the one that is true: the
   * stronger reading — a leg entirely below the body's bbox MIN y — fails in
   * 22 of 23, because the pack deliberately sinks each leg into the belly. See
   * the third test for the number.
   */
  const legged = PACK.filter(p => p.nodes.some(n => n.name.startsWith('leg-')))

  function bodyBox(pet: Pet): number[][] {
    const bb = [[1e9, -1e9], [1e9, -1e9], [1e9, -1e9]]
    for (const t of pet.tris) {
      if (t.nodeName !== 'body') continue
      for (const p of t.world) {
        for (let d = 0; d < 3; d++) {
          const row = bb[d] as number[]
          row[0] = Math.min(row[0] as number, p[d] as number)
          row[1] = Math.max(row[1] as number, p[d] as number)
        }
      }
    }
    return bb
  }

  const legTop = (pet: Pet, n: MeshNode): number => {
    let top = -1e9
    for (let i = n.first; i < n.last; i++) {
      for (const p of (pet.tris[i] as Tri).world) top = Math.max(top, p[1] as number)
    }
    return top
  }

  it('counts 23 legged species and 86 legs, on six translations only', () => {
    expect(legged.length).toBe(23)
    const legs = PACK.flatMap(p => p.nodes.filter(n => n.name.startsWith('leg-')))
    expect(legs.length).toBe(86)
    const places = new Set(legs.map(n => n.translation.map(v => v.toFixed(5)).join(',')))
    expect(places.size).toBe(6)
    for (const n of legs) {
      expect(Math.abs(n.translation[0] as number)).toBeCloseTo(0.25, 5)
      expect(n.translation[1] as number).toBeCloseTo(0.30, 5)
      expect(Math.abs(n.translation[2] as number)).toBeLessThanOrEqual(0.25)
    }
  })

  it('puts every leg inside the body footprint, with 0.375 to spare', () => {
    let worst = -1e9
    for (const pet of legged) {
      const bb = bodyBox(pet)
      const bx = bb[0] as number[], bz = bb[2] as number[]
      for (const n of pet.nodes) {
        if (!n.name.startsWith('leg-')) continue
        const x = n.translation[0] as number, z = n.translation[2] as number
        const overhang = Math.max(
          (bx[0] as number) - x, x - (bx[1] as number),
          (bz[0] as number) - z, z - (bz[1] as number),
        )
        expect(overhang, `${pet.name}/${n.name}`).toBeLessThan(0)
        worst = Math.max(worst, overhang)
      }
    }
    /* The tightest fit in the pack is 0.375 of clearance on every side — to
     * float precision, so it is compared as such rather than as `<= -0.375`. */
    expect(worst).toBeCloseTo(-0.375, 6)
  })

  it('and every leg entirely below the body vertical centre, by 0.47 at worst', () => {
    let worst = -1e9
    for (const pet of legged) {
      const by = bodyBox(pet)[1] as number[]
      const mid = ((by[0] as number) + (by[1] as number)) / 2
      for (const n of pet.nodes) {
        if (!n.name.startsWith('leg-')) continue
        const d = legTop(pet, n) - mid
        expect(d, `${pet.name}/${n.name}`).toBeLessThan(0)
        worst = Math.max(worst, d)
      }
    }
    expect(worst).toBeLessThanOrEqual(-0.4715)
  })

  it('but NOT below the body bbox — the legs sink into the belly by up to 0.225', () => {
    /*
     * The record of why the rule above uses the mid-point and not the bbox
     * floor. Twenty-two of the twenty-three pets fail the strict reading, the
     * lion worst at 0.225 of overlap. Anyone tightening this test will find
     * that out here rather than by breaking the build.
     */
    let strict = 0, worst = -1e9
    for (const pet of legged) {
      const floor = (bodyBox(pet)[1] as number[])[0] as number
      let over = -1e9
      for (const n of pet.nodes) {
        if (!n.name.startsWith('leg-')) continue
        over = Math.max(over, legTop(pet, n) - floor)
      }
      if (over <= 0) strict++
      worst = Math.max(worst, over)
    }
    expect(strict).toBe(1)
    expect(worst).toBeCloseTo(0.225, 3)
  })
})
