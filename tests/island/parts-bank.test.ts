/**
 * The baked parts bank, checked against the binaries it claims to come from.
 *
 * `src/island/species/parts/bank.generated.ts` is 94 lumps of geometry, and the
 * `provenance` beside each one is a CLAIM — that these numbers were copied out
 * of a named node of a named `.glb` under `src/island/public/pets/`. Nothing
 * about reading the module back can tell you whether that claim is true. A test
 * that imported the bank and checked it was self-consistent would pass just as
 * happily on geometry someone typed. So this file re-derives the parts from the
 * 24 binaries on every run and compares.
 *
 * ## Why the glTF reader is duplicated a fourth time
 *
 * Same reasoning `pack-axioms.test.ts` gives for duplicating it a third: a
 * shared parser lets a bug in the parser agree with itself. If
 * `tools/pets/parts-bank.ts` decoded an accessor wrongly and this file imported
 * that decoder, the bank and the check would be wrong together and green.
 * `weldedComponents` IS imported, because the bank's definition of a part is "a
 * component as `anatomy.ts` splits them" — importing it is what makes the two
 * agree by construction rather than by luck, and `tests/tools/anatomy.test.ts`
 * already holds that function down against the fox.
 *
 * ## The tolerance is derived, not guessed
 *
 * The generator emits four decimal places, so a baked coordinate can sit half a
 * unit in the last place from the file's, and two rounded copies of one shape can
 * differ by a whole 1e-4. `EPS` is the generator's own `SHAPE_TOL` — ten times
 * that quantum, and forty-five times below the smallest genuine difference in
 * the pack (0.045, the 1/16 authoring grid). It is written out rather than
 * imported so that changing the generator's mind does not silently change what
 * this file is willing to accept.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { weldedComponents } from '../../tools/workbench/public/anatomy'
import { PARTS_BANK, partsUsedAs, findParts, type BakedPart }
  from '../../src/island/species/parts/bank.generated'

const here = dirname(fileURLToPath(import.meta.url))
const PETS = resolve(here, '../../src/island/public/pets')

/** The generator's `SHAPE_TOL`: ten emit quanta, well under the 1/16 grid. */
const EPS = 1e-3

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

function readGlb(path: string): { g: Gltf; bin: Buffer } {
  const buf = readFileSync(path)
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

/** Node-local geometry of every mesh node in a file, keyed by node name. */
interface Prim { pos: number[]; uv: number[]; idx: number[] }

function meshNodes(g: Gltf, bin: Buffer): Map<string, Prim> {
  const out = new Map<string, Prim>()
  const walk = (i: number): void => {
    const node = g.nodes![i]!
    if (node.mesh !== undefined) {
      for (const pr of g.meshes![node.mesh]!.primitives ?? []) {
        if (pr.indices === undefined) continue
        out.set(node.name ?? '?', {
          pos: accessor(g, bin, pr.attributes['POSITION']!),
          uv: pr.attributes['TEXCOORD_0'] !== undefined
            ? accessor(g, bin, pr.attributes['TEXCOORD_0']!) : [],
          idx: accessor(g, bin, pr.indices),
        })
      }
    }
    for (const c of node.children ?? []) walk(c)
  }
  for (const r of g.scenes?.[0]?.nodes ?? []) walk(r)
  return out
}

const species = (name: string): Map<string, Prim> => {
  const { g, bin } = readGlb(join(PETS, `animal-${name}.glb`))
  return meshNodes(g, bin)
}

/* --------------------------------------------------------------- shapes --- */

/**
 * A part's distinct points, translated so its bounding-box min is the origin.
 *
 * Min-anchored so the comparison is translation-invariant without ever needing
 * the half-values a centre anchor produces — the same reason the generator keys
 * shapes this way, and the reason it must: rounding a centred coordinate can put
 * two mirror-image ears on the same key and quietly merge them.
 *
 * Note it returns POINTS and not a set of rounded keys. Bucketing was the first
 * attempt and it was wrong: one side of every comparison here comes out of the
 * bank already rounded to four places and the other comes raw off the disk, so
 * two coordinates 1e-9 apart can straddle a bucket edge and be called different.
 * Comparison is by tolerance, in `sameShape`, or it is not trustworthy.
 *
 * Both sides ARE quantised to the emitted four places first, though, and that is
 * not the same mistake. It is what makes the two sides commensurable: the bank
 * holds a 4-dp rendering of the geometry, and rounding can bring two raw points
 * that sat 6e-5 apart onto one — so counting distinct points at full precision
 * on one side and at 4 dp on the other gives different totals for identical
 * geometry. The fox's tail, whose 45-degree rotation makes every coordinate
 * irrational, is the part that showed it.
 */
const DP = 4

function points(xyz: readonly number[]): [number, number, number][] {
  const n = xyz.length / 3
  const min = [Infinity, Infinity, Infinity]
  for (let v = 0; v < n; v++) {
    for (let a = 0; a < 3; a++) min[a] = Math.min(min[a]!, xyz[v * 3 + a]!)
  }
  const seen = new Set<string>()
  const out: [number, number, number][] = []
  const round = (c: number): number => Math.round(c * 10 ** DP) / 10 ** DP
  for (let v = 0; v < n; v++) {
    const p: [number, number, number] = [
      round(xyz[v * 3]! - min[0]!),
      round(xyz[v * 3 + 1]! - min[1]!),
      round(xyz[v * 3 + 2]! - min[2]!),
    ]
    const k = p.join(',')
    if (seen.has(k)) continue
    seen.add(k)
    out.push(p)
  }
  return out
}

/** Same point set, up to translation, within `EPS` on every axis. */
function sameShape(a: readonly [number, number, number][],
  b: readonly [number, number, number][]): boolean {
  if (a.length !== b.length) return false
  for (const p of a) {
    let hit = false
    for (const q of b) {
      if (Math.abs(p[0] - q[0]) <= EPS && Math.abs(p[1] - q[1]) <= EPS
        && Math.abs(p[2] - q[2]) <= EPS) { hit = true; break }
    }
    if (!hit) return false
  }
  return true
}

/** The distinct positions a triangle list actually touches, from a raw mesh. */
function componentPositions(p: Prim, tris: readonly number[]): number[] {
  const seen = new Set<number>()
  const out: number[] = []
  for (const t of tris) {
    for (let k = 0; k < 3; k++) {
      const v = p.idx[t * 3 + k]!
      if (seen.has(v)) continue
      seen.add(v)
      out.push(p.pos[v * 3]!, p.pos[v * 3 + 1]!, p.pos[v * 3 + 2]!)
    }
  }
  return out
}

const bakedPositions = (b: BakedPart): number[] => b.positions as number[]

/* ---------------------------------------------------------------- tests --- */

describe('the parts bank is made of the pack, not of itself', () => {
  it('the baked leg IS the leg in animal-fox.glb', () => {
    const legs = partsUsedAs('leg')
    expect(legs).toHaveLength(1)
    const baked = legs[0]!

    const fox = species('fox')
    const leg = fox.get('leg-front-left')
    expect(leg).toBeDefined()

    /* Same triangle and vertex counts as the file's own leg node. */
    expect(baked.tris).toBe(leg!.idx.length / 3)
    expect(baked.verts).toBe(new Set(leg!.idx).size)

    /* And the same shape, point for point, once translation is removed. */
    const fromFile = points(componentPositions(leg!, [...Array(leg!.idx.length / 3).keys()]))
    const fromBank = points(bakedPositions(baked))
    expect(fromBank).toHaveLength(fromFile.length)
    expect(sameShape(fromFile, fromBank),
      'the baked leg is not the shape in animal-fox.glb').toBe(true)
  })

  it('every baked part matches its donor component in the real file', () => {
    for (const part of PARTS_BANK) {
      const d = part.provenance[0]!
      const nodes = species(d.species)
      const prim = nodes.get(d.node)
      expect(prim, `${part.id}: ${d.species} has no node ${d.node}`).toBeDefined()

      /* Re-split the donor mesh exactly as the generator did. Triangle count is
       * matched against `triVariants`, not `tris`: three of the 86 legs carry
       * 46 faces over the same 24 points where the rest carry 44. */
      const bank = points(bakedPositions(part))
      const comps = weldedComponents(prim!.pos, prim!.idx)
      const mine = comps.find(c => part.triVariants.includes(c.length)
        && sameShape(points(componentPositions(prim!, c)), bank))
      expect(mine, `${part.id}: no component of ${d.species}/${d.node} has this shape`)
        .toBeDefined()

      /* Counts must agree with the component, not merely with the bank. */
      const verts = new Set<number>()
      for (const t of mine!) for (let k = 0; k < 3; k++) verts.add(prim!.idx[t * 3 + k]!)
      expect(part.verts, `${part.id} vertex count`).toBe(verts.size)
      expect(part.tris, `${part.id} triangle count`).toBe(mine!.length)
      expect(part.positions).toHaveLength(part.verts * 3)
      expect(part.normals).toHaveLength(part.verts * 3)
      expect(part.indices).toHaveLength(part.tris * 3)
      expect(part.bands).toHaveLength(part.tris)
    }
  })

  it('every donor listed really has a component of that shape', () => {
    for (const part of PARTS_BANK) {
      for (const d of part.provenance) {
        const prim = species(d.species).get(d.node)
        expect(prim, `${part.id}: ${d.species}/${d.node}`).toBeDefined()
        const bank = points(bakedPositions(part))
        const hit = weldedComponents(prim!.pos, prim!.idx).some(c =>
          part.triVariants.includes(c.length)
          && sameShape(points(componentPositions(prim!, c)), bank))
        expect(hit, `${part.id} claims ${d.species}/${d.node} and it does not match`)
          .toBe(true)
      }
    }
  })

  it('dedup really deduped: no two baked parts are translation-identical', () => {
    /*
     * Across the WHOLE bank, not within a role. Roles are not part of the shape
     * key by design — an ear that is also a tusk is one record with two roles —
     * so a duplicate hiding behind a different role is exactly the failure this
     * has to catch.
     */
    const sets = PARTS_BANK.map(p => points(bakedPositions(p)))
    for (let i = 0; i < PARTS_BANK.length; i++) {
      for (let j = i + 1; j < PARTS_BANK.length; j++) {
        const a = PARTS_BANK[i]!, b = PARTS_BANK[j]!
        if (sets[i]!.length !== sets[j]!.length) continue
        expect(sameShape(sets[i]!, sets[j]!),
          `${a.id} and ${b.id} are the same shape and both got baked`).toBe(false)
      }
    }
  })

  it('the shared 1.250 hull appears exactly once, donated by 14 species', () => {
    /*
     * Identified by tris as well as size, because size alone does not single it
     * out — fish, monkey, panda and penguin all have a 1.250 bounding box too,
     * with more geometry inside it. That is the torso finding in miniature: the
     * alternative hulls mostly ARE the cube, plus something.
     */
    const cubes = partsUsedAs('hull')
      .filter(h => h.tris === 60 && h.size.every(s => Math.abs(s - 1.25) < EPS))
    expect(cubes).toHaveLength(1)

    const cube = cubes[0]!
    const shape = points(bakedPositions(cube))

    /* Fourteen TORSOS. The crab's `Group` is the same cube and rightly shares
     * the record, so the count is of provenance rows whose role is hull. */
    const cubeHulls = cube.provenance.filter(d => d.role === 'hull')
    expect(cubeHulls).toHaveLength(14)

    /* Exactly once in the WHOLE bank, not merely once among the 1.250 hulls. */
    const identical = PARTS_BANK.filter(p => sameShape(points(bakedPositions(p)), shape))
    expect(identical.map(p => p.id)).toEqual([cube.id])

    /* The donor list is a claim about 14 binaries; check all 14. */
    for (const d of cubeHulls) {
      const prim = species(d.species).get('body')
      const hit = weldedComponents(prim!.pos, prim!.idx).some(c =>
        c.length === 60 && sameShape(points(componentPositions(prim!, c)), shape))
      expect(hit, `${d.species} is listed as sharing the 1.250 cube but does not`).toBe(true)
    }
  })

  it('every eye card is flat and sits at z = 0.6350 in the file', () => {
    const eyes = partsUsedAs('eye')
    expect(eyes.length).toBeGreaterThan(0)
    for (const e of eyes) {
      expect(e.size[2], `${e.id} is not flat`).toBeCloseTo(0, 6)
      expect(e.offset[2], `${e.id} is not at the measured eye plane`).toBeCloseTo(0.635, 4)
    }
  })

  it('the shape classification is measured, not copied from the role', () => {
    for (const p of PARTS_BANK) {
      /* Every field has to be derivable from the geometry that is right here. */
      const size = [0, 1, 2].map(a => {
        let mn = Infinity, mx = -Infinity
        for (let v = 0; v * 3 < p.positions.length; v++) {
          mn = Math.min(mn, p.positions[v * 3 + a]!)
          mx = Math.max(mx, p.positions[v * 3 + a]!)
        }
        return mx - mn
      })
      for (const a of [0, 1, 2]) {
        expect(p.shape.size[a], `${p.id} size[${a}]`).toBeCloseTo(size[a]!, 3)
      }
      expect(p.shape.longest).toBeCloseTo(Math.max(...size), 3)
      expect(p.shape.taper).toBeGreaterThanOrEqual(0)
      expect(p.shape.taper).toBeLessThanOrEqual(1)
      expect(p.shape.aspect[0]).toBe(1)
    }
  })

  it('the day-one query finds the hog tusk and the hog ear, unnamed', () => {
    /*
     * Joe's motivating case: an agent building a hedgehog asks for "small
     * tapering spikes I can repeat and sink" WITHOUT knowing that a hog exists.
     * If this stops returning both, the classification has stopped being useful
     * and the axes need revisiting.
     */
    const hits = findParts({ maxLongest: 0.5, maxTaper: 0.6, minSunkFraction: 0.2 })
    const has = (sp: string, role: string): boolean =>
      hits.some(p => p.provenance.some(d => d.species === sp && d.role === role))
    expect(has('hog', 'tooth'), 'the hog tusk is not reachable by shape').toBe(true)
    expect(has('hog', 'ear'), 'the hog ear is not reachable by shape').toBe(true)

    /* Everything returned must genuinely be small, tapering and buried. */
    for (const p of hits) {
      expect(p.shape.longest).toBeLessThanOrEqual(0.5)
      expect(p.shape.taper).toBeLessThanOrEqual(0.6)
      expect(p.attachment!.sunkFractionMax).toBeGreaterThanOrEqual(0.2)
    }
  })

  it('attachment sink depth is real: an ear is buried, an eye card is not', () => {
    for (const p of PARTS_BANK) {
      if (p.attachment === null) continue
      expect(p.attachment.sunkFractionMin).toBeLessThanOrEqual(p.attachment.sunkFractionMean + EPS)
      expect(p.attachment.sunkFractionMean).toBeLessThanOrEqual(p.attachment.sunkFractionMax + EPS)
      expect(p.attachment.sunkUnitsMin).toBeGreaterThanOrEqual(0)
    }
    /* Eye cards sit ON the face, never in it — measured, and it must stay true. */
    for (const e of partsUsedAs('eye')) {
      expect(e.attachment!.sunkUnitsMax, `${e.id} is sunk into the hull`).toBeCloseTo(0, 6)
    }
    /* Some ear is buried at least a third of its own depth, or repeat-and-sink
     * has no measured precedent to draw a range from. */
    const deepest = Math.max(...partsUsedAs('ear').map(e => e.attachment!.sunkFractionMax))
    expect(deepest).toBeGreaterThan(0.33)
  })

  it('bands are the atlas swatch column the donor UVs actually point at', () => {
    /* The seven columns `tools/pets/atlas.mjs` measures the pack to sample. */
    const COLUMNS = new Set([1, 3, 5, 7, 9, 13, 15])
    for (const part of PARTS_BANK) {
      for (const b of part.bands) {
        expect(COLUMNS.has(b), `${part.id} has band ${b}, not an atlas column`).toBe(true)
      }
    }

    /* And for one part, recompute them from the donor's UVs. */
    const hull = partsUsedAs('hull')
      .find(h => h.provenance.some(d => d.species === 'fox'))!
    const prim = species('fox').get('body')!
    const comp = weldedComponents(prim.pos, prim.idx).find(c => c.length === hull.tris)!
    const mine = comp.map(t =>
      Math.min(15, Math.floor(prim.uv[prim.idx[t * 3]! * 2]! * 16)))
    expect([...hull.bands].sort()).toEqual([...mine].sort())
  })
})
