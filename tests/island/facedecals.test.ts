/**
 * The eyes: found in the geometry, moved out of the recolour, and checked here
 * against the actual .glb files rather than against a table someone wrote down.
 *
 * Joe: *"penguin pupils should stay black, panda and polar bear and cow white of
 * eye should stay white; rest of the animal colouring slice is accepted."*
 *
 * This file re-derives the whole classification from the 24 binary models —
 * union-find over triangles welded by world position, then the flat/forward/
 * front/small rule — and asserts that `species-face.json` says exactly what the
 * models say. Same reasoning as the coast test: a table of facts about binary
 * files that nothing re-measures is a table that goes wrong the first time
 * somebody re-exports the art, and it goes wrong silently, as berry eyeballs.
 *
 * NOTHING HERE IMPORTS THE TOOL. tools/pets/atlas.mjs writes the table; this
 * measures the models and compares. A shared parser would let a bug in the
 * parser agree with itself, which is the mock-agreeing-with-the-mock failure
 * this project has already paid for four times over.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  wearFaceUVs, faceVertexCount, speciesWithFaces,
} from '../../src/island/variants/facedecals'
import {
  recolourInto, reserved, RESERVE, ATLAS_WIDTH,
} from '../../src/island/variants/recolour'
import { SETS, setById } from '../../src/island/variants/sets'
import { SPECIES } from '../../src/island/pets'
import speciesBase from '../../src/island/variants/species-base.json'
import faceTable from '../../src/island/variants/species-face.json'

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')

/* ------------------------------------------------------------------ png --- */

interface Image { w: number; h: number; bpp: number; stride: number; px: Buffer }

/** The same minimal decoder recolour.test.ts and tools/pets/png.mjs use. */
function decode(path: string): Image {
  const buf = readFileSync(path)
  let off = 8, w = 0, h = 0, depth = 0, colour = 0
  const idat: Buffer[] = []
  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4)
      depth = data[8] as number; colour = data[9] as number
    }
    if (type === 'IDAT') idat.push(data)
    if (type === 'IEND') break
    off += 12 + len
  }
  const channels = ({ 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 } as Record<number, number>)[colour] as number
  const raw = inflateSync(Buffer.concat(idat))
  const bpp = channels * (depth / 8)
  const stride = w * bpp
  const px = Buffer.alloc(h * stride)
  let p = 0
  for (let y = 0; y < h; y++) {
    const f = raw[p++]
    const line = raw.subarray(p, p + stride); p += stride
    const prev = y > 0 ? px.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride)
    const cur = px.subarray(y * stride, (y + 1) * stride)
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? (cur[x - bpp] as number) : 0
      const b = prev[x] as number
      const c = x >= bpp ? (prev[x - bpp] as number) : 0
      let v = line[x] as number
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) {
        const q = a + b - c
        const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c)
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c)
      }
      cur[x] = v & 0xff
    }
  }
  return { w, h, bpp, stride, px }
}

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
  const o = new Array<number>(16).fill(0)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += (a[k * 4 + r] as number) * (b[c * 4 + k] as number)
      o[c * 4 + r] = s
    }
  }
  return o
}

/**
 * The FULL transform, not just scale.
 *
 * The whole rule turns on which way a component faces, and a normal computed in
 * the wrong frame answers a different question. Built by hand rather than with
 * three.js's Matrix4 so that nothing in this file shares arithmetic with the
 * renderer either.
 */
function trs(node: NonNullable<Gltf['nodes']>[number]): M16 {
  if (node.matrix) return node.matrix.slice()
  const t = node.translation ?? [0, 0, 0]
  const q = node.rotation ?? [0, 0, 0, 1]
  const s = node.scale ?? [1, 1, 1]
  const x = q[0] as number, y = q[1] as number, z = q[2] as number, w = q[3] as number
  const x2 = x + x, y2 = y + y, z2 = z + z
  const xx = x * x2, xy = x * y2, xz = x * z2
  const yy = y * y2, yz = y * z2, zz = z * z2
  const wx = w * x2, wy = w * y2, wz = w * z2
  const s0 = s[0] as number, s1 = s[1] as number, s2 = s[2] as number
  return [
    (1 - (yy + zz)) * s0, (xy + wz) * s0, (xz - wy) * s0, 0,
    (xy - wz) * s1, (1 - (xx + zz)) * s1, (yz + wx) * s1, 0,
    (xz + wy) * s2, (yz - wx) * s2, (1 - (xx + yy)) * s2, 0,
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

interface Tri {
  nodeName: string
  v: number[]
  world: number[][]
  centroid: number[]
  area: number
  normal: number[]
  uv: number[][]
}

interface MeshNode { name: string; mesh: number; uv: number[][] }

function harvest(g: Gltf, bin: Buffer): { tris: Tri[]; meshNodes: MeshNode[] } {
  const tris: Tri[] = []
  const meshNodes: MeshNode[] = []
  const walk = (i: number, m: M16): void => {
    const node = (g.nodes as NonNullable<Gltf['nodes']>)[i] as
      NonNullable<Gltf['nodes']>[number]
    const wm = mul(m, trs(node))
    if (node.mesh !== undefined) {
      const mesh = (g.meshes as NonNullable<Gltf['meshes']>)[node.mesh] as
        NonNullable<Gltf['meshes']>[number]
      for (const pr of mesh.primitives ?? []) {
        if (pr.attributes['TEXCOORD_0'] === undefined || pr.indices === undefined) continue
        const uv = accessor(g, bin, pr.attributes['TEXCOORD_0'] as number)
        const po = accessor(g, bin, pr.attributes['POSITION'] as number)
        const ix = accessor(g, bin, pr.indices)
        meshNodes.push({ name: node.name ?? '', mesh: node.mesh, uv })
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
            nodeName: node.name ?? '', v: c, world: p,
            centroid: [0, 1, 2].map(k2 =>
              ((a[k2] as number) + (b[k2] as number) + (d[k2] as number)) / 3),
            area: 0.5 * len,
            normal: cr.map(n => n / len),
            uv: c.map(v => uv[v] as number[]),
          })
        }
      }
    }
    for (const child of node.children ?? []) walk(child, wm)
  }
  for (const root of g.scenes?.[0]?.nodes ?? []) walk(root, IDENT)
  return { tris, meshNodes }
}

/* ------------------------------------------------------------- the rule --- */

const PLANAR_EPS = 1e-6
const FORWARD_DOT = 0.9998
const FACE_MAX_SHARE = 0.10

interface Comp {
  tris: Tri[]; area: number; extent: number[]
  centroidX: number; centroidZ: number; normal: number[]
  flat: boolean; forward: boolean; front: boolean; small: boolean; isFace: boolean
}

interface Species {
  name: string
  tris: Tri[]
  meshNodes: MeshNode[]
  comps: Comp[]
  decals: Comp[]
  total: number
}

function analyse(file: string): Species {
  const { json: g, bin } = readGlb(join(PETS, file))
  const { tris, meshNodes } = harvest(g, bin)
  const total = tris.reduce((s, t) => s + t.area, 0)

  /* Connected components of the WHOLE pet, welded by quantised world position. */
  const parent = tris.map((_, i) => i)
  const find = (a: number): number => {
    while ((parent[a] as number) !== a) {
      parent[a] = parent[parent[a] as number] as number
      a = parent[a] as number
    }
    return a
  }
  const at = new Map<string, number[]>()
  const q = (x: number): number => Math.round(x * 1e5)
  tris.forEach((t, i) => {
    for (const p of t.world) {
      const k = `${q(p[0] as number)},${q(p[1] as number)},${q(p[2] as number)}`
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
    let area = 0, nx = 0, ny = 0, nz = 0, cx = 0, cz = 0
    for (const t of ts) {
      area += t.area
      nx += (t.normal[0] as number) * t.area
      ny += (t.normal[1] as number) * t.area
      nz += (t.normal[2] as number) * t.area
      cx += (t.centroid[0] as number) * t.area
      cz += (t.centroid[2] as number) * t.area
      for (const p of t.world) {
        for (let d = 0; d < 3; d++) {
          const row = bb[d] as number[]
          row[0] = Math.min(row[0] as number, p[d] as number)
          row[1] = Math.max(row[1] as number, p[d] as number)
        }
      }
    }
    const len = Math.hypot(nx, ny, nz) || 1
    const extent = [0, 1, 2].map(d =>
      ((bb[d] as number[])[1] as number) - ((bb[d] as number[])[0] as number))
    return {
      tris: ts, area, extent, centroidX: cx / area, centroidZ: cz / area,
      normal: [nx / len, ny / len, nz / len],
      flat: extent.some(e => e < PLANAR_EPS),
      forward: nz / len >= FORWARD_DOT,
      front: false, small: area / total < FACE_MAX_SHARE, isFace: false,
    }
  })

  const zmid = comps.reduce((s, c) => s + c.centroidZ * c.area, 0) / total
  for (const c of comps) {
    c.front = c.centroidZ > zmid
    c.isFace = c.flat && c.forward && c.front && c.small
  }
  return {
    name: file.replace('animal-', '').replace('.glb', ''),
    tris, meshNodes, comps, decals: comps.filter(c => c.isFace), total,
  }
}

/* --------------------------------------------------------------- shared --- */

/** One species' real UVs, as the three.js objects the runtime patch expects. */
function asObject(s: Species): THREE.Group {
  const group = new THREE.Group()
  const seen = new Set<string>()
  for (const n of s.meshNodes) {
    if (seen.has(n.name)) continue
    seen.add(n.name)
    const geometry = new THREE.BufferGeometry()
    const uv = new Float32Array(n.uv.length * 2)
    n.uv.forEach((p, i) => { uv[i * 2] = p[0] as number; uv[i * 2 + 1] = p[1] as number })
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
    const mesh = new THREE.Mesh(geometry)
    mesh.name = n.name
    group.add(mesh)
  }
  return group
}

const img = decode(join(PETS, 'Textures/colormap.png'))
/** Measured once. Twenty-four models is three seconds of union-find. */
const pack = SPECIES.map(s => analyse(`${s}.glb`))
const byName = new Map(pack.map(s => [s.name, s]))

type Runs = number[][]
const table = faceTable as Record<string, Record<string, Record<string, Runs>>>
const base = speciesBase as Record<string, string[]>

const texelOf = (u: number, v: number): [number, number] => [
  Math.min(img.w - 1, Math.max(0, Math.round(u * img.w - 0.5))),
  Math.min(img.h - 1, Math.max(0, Math.round(v * img.h - 0.5))),
]

const rgbAt = (buf: Uint8ClampedArray, x: number, y: number): number[] => {
  const j = (y * img.w + x) * 4
  return [buf[j] as number, buf[j + 1] as number, buf[j + 2] as number]
}

/** The shipped atlas as the RGBA buffer recolourInto consumes. */
function buffer(): Uint8ClampedArray {
  const out = new Uint8ClampedArray(img.w * img.h * 4)
  for (let i = 0, j = 0; i < img.px.length; i += img.bpp, j += 4) {
    out[j] = img.px[i] as number
    out[j + 1] = img.px[i + 1] as number
    out[j + 2] = img.px[i + 2] as number
    out[j + 3] = 255
  }
  return out
}

const NATURAL_ATLAS = buffer()

const drift = (a: number[], b: number[]): number => Math.max(
  Math.abs((a[0] as number) - (b[0] as number)),
  Math.abs((a[1] as number) - (b[1] as number)),
  Math.abs((a[2] as number) - (b[2] as number)))

/* =========================================================== the models === */

describe('the face decals, re-measured from the 24 models', () => {
  it('finds 63 of them, and every planar thing it rejects faces sideways', () => {
    /*
     * THE MARGINS, which are the whole reason this rule is trustworthy. Decals
     * are flat to ~9e-9 where the next flattest thing in the pack has an extent
     * of 0.05 — a factor of five million. Every decal's area-weighted normal z
     * is 1.000000 and every planar non-decal's is 0.000000, a gap of 1.0 on a
     * scale of 1.0. Any threshold in a very wide range gives the same answer.
     *
     * The six rejected are the cow's, dog's and giraffe's flank patches: planar,
     * but facing ±x. They are markings, and markings are inRegion's job.
     */
    let planar = 0, decals = 0
    let worstDecalExtent = 0, bestNonDecalNz = 0
    for (const s of pack) {
      for (const c of s.comps) {
        if (!c.flat) continue
        planar++
        if (c.isFace) {
          decals++
          worstDecalExtent = Math.max(worstDecalExtent, Math.min(...c.extent))
        } else {
          bestNonDecalNz = Math.max(bestNonDecalNz, c.normal[2] as number)
        }
      }
    }
    expect(planar).toBe(69)
    expect(decals).toBe(63)
    expect(worstDecalExtent).toBeLessThan(1e-7)
    expect(bestNonDecalNz).toBeLessThan(0.5)
  })

  it('gives every species at least two, as a mirrored pair', () => {
    for (const s of pack) {
      expect(s.decals.length, s.name).toBeGreaterThanOrEqual(2)
      const [a, b] = [...s.decals].sort((x, y) => y.area - x.area)
      expect(Math.abs((a as Comp).area - (b as Comp).area), s.name).toBeLessThan(1e-6)
      expect(Math.abs((a as Comp).centroidX + (b as Comp).centroidX), s.name)
        .toBeLessThan(1e-4)
    }
  })

  it('costs between 1% and 3% of each pet, not the 70% a colour rule costs', () => {
    /*
     * The comparison that settles the design. A rule protecting near-achromatic
     * texels — the obvious one, and the one recolour.ts documents failing —
     * would freeze 69.7% of a polar bear, because a polar bear's whole coat IS
     * the colour of its sclera. The geometric rule freezes 2.00% of the same
     * animal.
     */
    for (const s of pack) {
      const share = s.decals.reduce((n, c) => n + c.area, 0) / s.total
      expect(share, `${s.name} froze ${(100 * share).toFixed(2)}%`).toBeGreaterThan(0.010)
      expect(share, `${s.name} froze ${(100 * share).toFixed(2)}%`).toBeLessThan(0.030)
    }
  })

  it('draws them from exactly the two columns the reserve copies', () => {
    const sources = new Set(RESERVE.map(([from]) => from))
    const found = new Set<number>()
    for (const s of pack) {
      for (const c of s.decals) {
        for (const t of c.tris) {
          for (const uv of t.uv) found.add(Math.round((uv[0] as number) * ATLAS_WIDTH))
        }
      }
    }
    expect([...found].sort((a, b) => a - b)).toEqual([...sources].sort((a, b) => a - b))
  })

  it('never shares a vertex with the coat, in any of the 24', () => {
    // If it did, moving the decal's UVs would drag coat into the reserve and
    // freeze it. Zero across the pack: the decals really are separate sheets.
    for (const s of pack) {
      const decalTris = new Set(s.decals.flatMap(c => c.tris))
      const mine = new Map<string, Set<number>>()
      for (const t of decalTris) {
        let set = mine.get(t.nodeName)
        if (!set) { set = new Set(); mine.set(t.nodeName, set) }
        for (const v of t.v) set.add(v)
      }
      for (const t of s.tris) {
        if (decalTris.has(t)) continue
        const set = mine.get(t.nodeName)
        if (!set) continue
        for (const v of t.v) expect(set.has(v), `${s.name} vertex ${v}`).toBe(false)
      }
    }
  })

  it('can be addressed by node name and vertex index at all', () => {
    /*
     * What the runtime patch rests on, and the only thing it assumes about
     * GLTFLoader. Every mesh-bearing node is named, no name repeats within a
     * file, no node's mesh holds more than one primitive, and no two nodes share
     * a mesh — that last one because they would arrive as two Meshes SHARING one
     * BufferGeometry, and the patch would write one buffer twice.
     */
    let nodes = 0
    for (const s of pack) {
      const names = new Set<string>(), meshes = new Set<number>()
      for (const n of s.meshNodes) {
        nodes++
        expect(n.name, `${s.name} has an unnamed mesh node`).not.toBe('')
        expect(names.has(n.name), `${s.name} repeats the name ${n.name}`).toBe(false)
        expect(meshes.has(n.mesh), `${s.name} shares glTF mesh ${n.mesh}`).toBe(false)
        names.add(n.name); meshes.add(n.mesh)
      }
    }
    expect(nodes).toBe(133)
  })

  it('nothing in the pack samples the reserved columns today', () => {
    // Which is what makes overwriting them provably invisible: the 24,576
    // texels colormap.png gains are texels no pet has ever read.
    for (const s of pack) {
      for (const t of s.tris) {
        for (const uv of t.uv) {
          const [x] = texelOf(uv[0] as number, uv[1] as number)
          expect(reserved(x), `${s.name} already samples column ${x}`).toBe(false)
        }
      }
    }
  })
})

/* ====================================================== the shipped table === */

describe('species-face.json says exactly what the models say', () => {
  it('covers all 24 species and nothing else', () => {
    expect(speciesWithFaces().sort())
      .toEqual(SPECIES.map(s => s.replace('animal-', '')).sort())
  })

  it('names the same vertices the classifier finds, species by species', () => {
    /*
     * The point of this whole file. If someone re-exports the models and the
     * decals move, this fails — instead of the game quietly shipping a berry
     * sclera on every panda.
     */
    for (const s of pack) {
      const want = new Map<string, Map<number, number>>()
      for (const c of s.decals) {
        for (const t of c.tris) {
          for (let i = 0; i < 3; i++) {
            const column = Math.round((t.uv[i] as number[])[0] as number * ATLAS_WIDTH)
            const to = RESERVE.find(([from]) => from === column)?.[1]
            expect(to, `${s.name} decal samples column ${column}`).toBeDefined()
            let mine = want.get(t.nodeName)
            if (!mine) { mine = new Map(); want.set(t.nodeName, mine) }
            mine.set(t.v[i] as number, to as number)
          }
        }
      }

      const said = new Map<string, Map<number, number>>()
      for (const [node, spec] of Object.entries(table[s.name] ?? {})) {
        const mine = new Map<number, number>()
        for (const [column, runs] of Object.entries(spec)) {
          for (const run of runs) {
            for (let i = 0; i < (run[1] as number); i++) {
              mine.set((run[0] as number) + i, Number(column))
            }
          }
        }
        said.set(node, mine)
      }

      expect([...said.keys()].sort(), s.name).toEqual([...want.keys()].sort())
      for (const [node, mine] of want) {
        const theirs = said.get(node) as Map<number, number>
        expect([...theirs.entries()].sort((a, b) => a[0] - b[0]), `${s.name}/${node}`)
          .toEqual([...mine.entries()].sort((a, b) => a[0] - b[0]))
      }
    }
  })

  it('is 1,755 vertices across the pack, in 48 runs', () => {
    // Written down because it is the size of the whole change: 6.8% of the
    // pack's vertices, and a table small enough to be a rounding error.
    let verts = 0, runs = 0
    for (const spec of Object.values(table)) {
      for (const byColumn of Object.values(spec)) {
        for (const list of Object.values(byColumn)) {
          runs += list.length
          for (const run of list) verts += run[1] as number
        }
      }
    }
    expect(verts).toBe(1755)
    expect(runs).toBe(48)
    expect(SPECIES.reduce((n, s) => n + faceVertexCount(s), 0)).toBe(1755)
  })
})

/* ========================================================= the patch ====== */

describe('wearFaceUVs, over the real UVs', () => {
  it('moves every decal vertex and nothing else', () => {
    for (const s of pack) {
      const model = asObject(s)
      const before = new Map<string, Float32Array>()
      model.traverse(n => {
        const m = n as THREE.Mesh
        if (!m.isMesh) return
        before.set(m.name, Float32Array.from(
          (m.geometry.getAttribute('uv') as THREE.BufferAttribute).array as Float32Array))
      })

      const moved = wearFaceUVs(model, s.name)
      expect(moved, s.name).toBe(faceVertexCount(s.name))

      /* Every vertex that moved was on a source column and landed on ITS copy;
       * every vertex that did not move is byte for byte where it was. */
      const wanted = new Map<string, Map<number, number>>()
      for (const [node, spec] of Object.entries(table[s.name] ?? {})) {
        const mine = new Map<number, number>()
        for (const [column, runs] of Object.entries(spec)) {
          for (const run of runs) {
            for (let i = 0; i < (run[1] as number); i++) {
              mine.set((run[0] as number) + i, Number(column))
            }
          }
        }
        wanted.set(node, mine)
      }
      model.traverse(n => {
        const m = n as THREE.Mesh
        if (!m.isMesh) return
        const now = (m.geometry.getAttribute('uv') as THREE.BufferAttribute)
        const was = before.get(m.name) as Float32Array
        const mine = wanted.get(m.name)
        for (let i = 0; i < now.count; i++) {
          const to = mine?.get(i)
          if (to === undefined) {
            expect(now.getX(i), `${s.name}/${m.name} vertex ${i} moved`)
              .toBe(was[i * 2] as number)
            continue
          }
          const from = RESERVE.find(([, dst]) => dst === to)?.[0] as number
          expect(was[i * 2] as number, `${s.name}/${m.name} vertex ${i}`)
            .toBeCloseTo(from / ATLAS_WIDTH, 6)
          expect(now.getX(i), `${s.name}/${m.name} vertex ${i}`)
            .toBeCloseTo(to / ATLAS_WIDTH, 6)
          expect(now.getY(i), 'v must never move').toBe(was[i * 2 + 1] as number)
        }
      })
    }
  })

  it('is idempotent, so it cannot matter who calls it first', () => {
    /*
     * The property that makes the safety net in atlas.ts safe. `dress()` calls
     * this as well as the loader, and a clone shares its geometry with the
     * original, so the same buffer may be offered several times.
     */
    for (const s of pack) {
      const model = asObject(s)
      expect(wearFaceUVs(model, s.name), s.name).toBe(faceVertexCount(s.name))
      expect(wearFaceUVs(model, s.name), s.name).toBe(0)
      expect(wearFaceUVs(model, `animal-${s.name}`), s.name).toBe(0)
    }
  })

  it('accepts the prefixed species id the game actually uses', () => {
    const s = byName.get('polar') as Species
    expect(wearFaceUVs(asObject(s), 'animal-polar')).toBe(faceVertexCount('polar'))
  })

  it('marks the attribute so the GPU picks the change up', () => {
    /*
     * The one three.js-side risk this carries. A pet may be drawn before the
     * patch runs — the loader is async and `dress()` awaits a texture — and an
     * attribute already uploaded is only re-sent when its version moves.
     */
    const s = byName.get('penguin') as Species
    const model = asObject(s)
    const versions = (): number[] => {
      const out: number[] = []
      model.traverse(n => {
        const m = n as THREE.Mesh
        if (m.isMesh) out.push((m.geometry.getAttribute('uv') as THREE.BufferAttribute).version)
      })
      return out
    }
    const before = versions()
    wearFaceUVs(model, 'penguin')
    expect(versions().some((v, i) => v > (before[i] as number))).toBe(true)
  })

  it('does nothing at all for a species it has never heard of', () => {
    expect(wearFaceUVs(new THREE.Group(), 'animal-dragon')).toBe(0)
  })
})

/* ================================================== the acceptance test === */

/**
 * Each species' UVs AFTER the real runtime patch has been run over them.
 *
 * Read back out of the three.js attribute rather than recomputed from the
 * table, so the measurement below goes through `wearFaceUVs` itself. Recomputing
 * would let the acceptance test pass with the patch function doing nothing —
 * which is the mock-agreeing-with-the-mock failure this project has already
 * paid for four times (HANDOFF §5).
 */
const PATCHED = new Map<string, Map<string, Float32Array>>()
for (const s of pack) {
  const model = asObject(s)
  wearFaceUVs(model, s.name)
  const per = new Map<string, Float32Array>()
  model.traverse(n => {
    const m = n as THREE.Mesh
    if (!m.isMesh) return
    per.set(m.name, Float32Array.from(
      (m.geometry.getAttribute('uv') as THREE.BufferAttribute).array as Float32Array))
  })
  PATCHED.set(s.name, per)
}

/**
 * What a decal reads, before and after the patch, out of a given atlas.
 *
 * `worst` is the largest channel difference from the colour that decal shows
 * TODAY on the natural atlas — which is the thing Joe is asking to preserve.
 */
function eyeDrift(s: Species, atlas: Uint8ClampedArray, patched: boolean): number {
  const uvs = PATCHED.get(s.name) as Map<string, Float32Array>
  let worst = 0
  for (const c of s.decals) {
    for (const t of c.tris) {
      for (let i = 0; i < 3; i++) {
        const orig = t.uv[i] as number[]
        const [x0, y0] = texelOf(orig[0] as number, orig[1] as number)
        const now = uvs.get(t.nodeName) as Float32Array
        const [x, y] = patched
          ? texelOf(now[(t.v[i] as number) * 2] as number,
            now[(t.v[i] as number) * 2 + 1] as number)
          : [x0, y0]
        worst = Math.max(worst, drift(rgbAt(NATURAL_ATLAS, x0, y0), rgbAt(atlas, x, y)))
      }
    }
  }
  return worst
}

/** How far the COAT moves, which must not shrink. */
function coatDrift(s: Species, atlas: Uint8ClampedArray): number {
  const decalTris = new Set(s.decals.flatMap(c => c.tris))
  let worst = 0
  for (const t of s.tris) {
    if (decalTris.has(t)) continue
    for (const uv of t.uv) {
      const [x, y] = texelOf(uv[0] as number, uv[1] as number)
      worst = Math.max(worst, drift(rgbAt(NATURAL_ATLAS, x, y), rgbAt(atlas, x, y)))
    }
  }
  return worst
}

describe('the acceptance criteria, end to end through the real recolourer', () => {
  /** The four Joe named, and the exact complaint he made about each. */
  const NAMED = ['cow', 'panda', 'polar', 'penguin']

  it('reproduces the bug it fixes, on exactly the animals Joe named', () => {
    /*
     * The strongest evidence available that the diagnosis is right: measure the
     * complaint BEFORE fixing it. Without the UV patch — decals still reading
     * columns 112 and 496 — the cow, panda and polar bear lose their white of
     * eye and the penguin loses its pupil, on the Cherry set, and nothing else
     * does.
     */
    const cherry = setById('cherry')
    const damaged: string[] = []
    for (const s of pack) {
      const atlas = buffer()
      recolourInto(atlas, cherry!, img.w, new Set(base[s.name]))
      if (eyeDrift(s, atlas, false) > 100) damaged.push(s.name)
    }
    expect(damaged.sort()).toEqual([...NAMED].sort())
  }, 30_000)

  it('and fixes it: zero eye drift for all 24 species, on every set', () => {
    /*
     * The whole matrix would be 600 recolours of a 512×512 image, which is a
     * minute of test time to say what two slices say. So: every species against
     * the set Joe judges on, and the four he named against every set there is.
     */
    const offenders: string[] = []
    const cherry = setById('cherry')
    for (const s of pack) {
      const atlas = buffer()
      recolourInto(atlas, cherry!, img.w, new Set(base[s.name]))
      const eye = eyeDrift(s, atlas, true)
      if (eye !== 0) offenders.push(`${s.name} on cherry drifted ${eye}`)
      // ...and the coat still moves, which is the half that catches a fix that
      // works by recolouring nothing.
      const coat = coatDrift(s, atlas)
      if (coat < 60) offenders.push(`${s.name}'s coat only moved ${coat} on cherry`)
    }
    for (const name of NAMED) {
      const s = byName.get(name) as Species
      for (const set of SETS.slice(1)) {
        const atlas = buffer()
        recolourInto(atlas, set, img.w, new Set(base[name]))
        const eye = eyeDrift(s, atlas, true)
        if (eye !== 0) offenders.push(`${name} on ${set.id} drifted ${eye}`)
        const coat = coatDrift(s, atlas)
        if (coat < 60) offenders.push(`${name}'s coat only moved ${coat} on ${set.id}`)
      }
    }
    expect(offenders).toEqual([])
  }, 60_000)

  it('leaves the natural set bit-identical, because nothing she owns may change', () => {
    // Brief §19. The natural set reuses the base texture untouched, and the
    // decals read a verbatim copy — so a natural pet is the same pet whether or
    // not its geometry has been patched.
    for (const s of pack) {
      const atlas = buffer()
      recolourInto(atlas, SETS[0]!, img.w, new Set(base[s.name]))
      expect(eyeDrift(s, atlas, true), s.name).toBe(0)
      expect(eyeDrift(s, atlas, false), s.name).toBe(0)
      expect(coatDrift(s, atlas), s.name).toBe(0)
    }
  })
})
