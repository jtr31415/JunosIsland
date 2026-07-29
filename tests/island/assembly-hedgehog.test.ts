/**
 * The assembled hedgehog, checked against the bank it claims to be made of.
 *
 * Four dead features shipped in this repo behind tests that only proved a mock
 * ran, so nothing below asserts that a function was called. Every assertion here
 * measures the geometry that came out and compares it to a number that was
 * measured off Kenney's own `.glb` files — the same discipline
 * `tests/island/parts-bank.test.ts` applies to the bank itself.
 *
 * The five that would catch a real regression, in the order they matter:
 *
 *   1. ONE MASS. Two boxes at the neck is what scrapped the 72
 *      (`docs/building-animals-from-parts.md` §0), and it is invisible in a
 *      screenshot at tablet size until it is not. Measured as a bounding-box
 *      volume ratio, because §3's own rule of thumb is "rank components by
 *      bounding-box volume, never by triangle count" — in 6 of the 24 the
 *      largest-by-triangles part is an ear.
 *   2. NOTHING AUTHORED. Every mesh's vertices are matched back to a bank record
 *      by position, not by the label the builder stapled on. A mesh whose
 *      `userData` says `box-03` and whose vertices are something else fails.
 *   3. THE EYE IS ABSOLUTE. z = 0.6350 and the card's own 0.4000 x 0.3202, with
 *      no scale anywhere in the chain. Rule 5, and the one rule a fit-to-height
 *      would break silently.
 *   4. REPEAT-AND-SINK. Twelve, six a side, genuinely mirrored, each buried
 *      inside the range the pack itself demonstrated for that shape.
 *   5. THE TEXTURE IS DETACHED, NOT DISPOSED. Disposing one breaks every pet of
 *      the set including ones a child already owns (brief §19). A comment cannot
 *      enforce that, so the test listens for the `dispose` event and fails if it
 *      ever fires.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  assembledSpecies, buildAssembled, findShapes, SPIKE_QUERY,
  assemblyTextureCount, detachAssemblyTextures, HEDGEHOG_ASSEMBLY,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart }
  from '../../src/island/species/parts/bank.generated'
import { GARDEN_SPECIES } from '../../src/island/species/collections/garden'
import { SPECIES_NAMES, SPECIES_COLLECTION } from '../../src/island/species/roster'

/* ---------------------------------------------------------------- tools --- */

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

const uniqueSorted = (ps: readonly P3[]): P3[] => {
  const seen = new Map<string, P3>()
  for (const p of ps) seen.set(p.map(n => n.toFixed(3)).join(','), p)
  return [...seen.values()].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])
}

/**
 * Does this mesh's geometry come out of `part`, allowing a per-axis stretch and
 * an x-mirror — the only two things the kit is permitted to do to a part copy?
 *
 * The stretch is RECOVERED from the two bounding boxes rather than taken from
 * the spec, so a mesh that claims a stretch it does not have still fails.
 */
function isCopyOf(mesh: THREE.Mesh, part: BakedPart, mirror: boolean): boolean {
  const raw = posOf(mesh)
  const mp = mirror ? raw.map(p => [-p[0], p[1], p[2]] as P3) : raw
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

/** Which bank record this mesh's vertices came out of — found, not trusted. */
function traceToBank(mesh: THREE.Mesh): string | null {
  for (const p of PARTS_BANK) {
    if (isCopyOf(mesh, p, false) || isCopyOf(mesh, p, true)) return p.id
  }
  return null
}

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

const build = (): THREE.Group => {
  const g = buildAssembled('animal-hedgehog')
  g.updateMatrixWorld(true)
  return g
}

/* ------------------------------------------------------------- the mass --- */

describe('the assembled hedgehog is ONE mass', () => {
  it('has one hull and no second large shape', () => {
    const g = build()
    const vols = meshesOf(g)
      .map(m => {
        const s = worldBox(m).getSize(new THREE.Vector3())
        return { name: m.name, vol: s.x * s.y * s.z, part: m.userData['part'] as string }
      })
      .sort((a, b) => b.vol - a.vol)

    // The 72 were scrapped for emitting a head box and a body box and never
    // merging them. A separate head would be roughly a quarter of the hull's
    // volume; the largest detail here is the snout at 2.4% of it.
    expect(vols[0]!.name).toBe('hull')
    expect(vols[0]!.vol / vols[1]!.vol).toBeGreaterThan(10)
    expect(meshesOf(g).filter(m => m.userData['role'] === 'hull')).toHaveLength(1)
  })

  it('builds its one mass out of a shape the pack used as a hull', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    const id = traceToBank(hull)
    expect(id).toBe('box-03')
    expect(partById(id!)!.roles).toContain('hull')
    // The 1.250 cube 14 of the 24 share, adapted (rule 1) rather than authored.
    expect(partById('box-03')!.size).toEqual([1.25, 1.25, 1.25])
    const s = worldBox(hull).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.35, 3)
    expect(s.y).toBeCloseTo(1.15, 3)
    // z is NOT stretched, and that is what keeps the eye card's absolute z real.
    expect(s.z).toBeCloseTo(1.25, 3)
  })
})

/* -------------------------------------------------------------- lineage --- */

describe('nothing in the hedgehog is authored', () => {
  it('traces every mesh back to a bank record by its vertices', () => {
    const g = build()
    const found = new Set<string>()
    for (const m of meshesOf(g)) {
      const id = traceToBank(m)
      expect(id, `${m.name} matches no shape in the bank`).not.toBeNull()
      // And it is the shape the builder SAYS it is.
      expect(id, `${m.name} claims ${m.userData['part']}`).toBe(m.userData['part'])
      found.add(id!)
    }
    expect([...found].sort())
      .toEqual(['box-01', 'box-03', 'cone-01', 'cone-06', 'plate-01'])
  })

  it('places by translation only — no node carries a rotation or a scale', () => {
    const g = build()
    expect(g.scale.toArray()).toEqual([1, 1, 1])
    expect(g.quaternion.toArray()).toEqual([0, 0, 0, 1])
    // The whole rig is grounded in y and nowhere else, so z stays absolute.
    expect(g.position.x).toBe(0)
    expect(g.position.z).toBe(0)
    for (const m of meshesOf(g)) {
      expect(m.scale.toArray(), m.name).toEqual([1, 1, 1])
      expect(m.quaternion.toArray(), m.name).toEqual([0, 0, 0, 1])
    }
  })

  it('is smooth-shaded on the pack\'s own normals, not recomputed ones', () => {
    const g = build()
    const hull = g.getObjectByName('hull') as THREE.Mesh
    expect((hull.material as THREE.MeshStandardMaterial).flatShading).toBe(false)

    const n = hull.geometry.getAttribute('normal')
    const got = new Set<string>()
    for (let i = 0; i < n.count; i++) {
      got.add([n.getX(i), n.getY(i), n.getZ(i)].map(v => v.toFixed(3)).join(','))
    }
    const part = partById('box-03')!
    const want = new Set<string>()
    for (const vi of new Set(part.indices)) {
      want.add([part.normals[vi * 3]!, part.normals[vi * 3 + 1]!, part.normals[vi * 3 + 2]!]
        .map(v => v.toFixed(3)).join(','))
    }
    // Recomputing normals on a hull stretched 1.08 x 0.92 would move every
    // chamfer normal off the pack's; copying them verbatim cannot.
    expect([...got].sort()).toEqual([...want].sort())
  })
})

/* ------------------------------------------------------------ the face --- */

describe('the eye cards are absolute (rule 5)', () => {
  it('sits at the pack\'s measured z = 0.6350, on the face and not in it', () => {
    const g = build()
    const eyes = named(g, 'eye')
    expect(eyes).toHaveLength(2)
    for (const e of eyes) expect(world(e).z).toBeCloseTo(0.635, 4)
    // The hull's front plane. 0.010 of daylight, which is what the pack does.
    const front = worldBox(g.getObjectByName('hull')!).max.z
    expect(front).toBeCloseTo(0.625, 3)
    expect(0.635 - front).toBeCloseTo(0.01, 3)
  })

  it('is never scaled — its size is the bank card\'s, to the digit', () => {
    const g = build()
    const card = partById('plate-01')!
    for (const e of named(g, 'eye')) {
      const s = worldBox(e).getSize(new THREE.Vector3())
      expect(s.x).toBeCloseTo(card.size[0], 4)
      expect(s.y).toBeCloseTo(card.size[1], 4)
      expect(s.z).toBeCloseTo(card.size[2], 4)
      expect(e.userData['stretch']).toEqual([1, 1, 1])
      expect(e.userData['sink']).toBe(0)
    }
    // And nothing in the spec can quietly grow one later.
    const eye = HEDGEHOG_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.stretch).toBeUndefined()
  })

  it('is one mesh mirrored, so the bank\'s two eye records collapse to one', () => {
    const g = build()
    const [r, l] = named(g, 'eye')
    const rp = uniqueSorted(posOf(r!).map(p => [-p[0], p[1], p[2]] as P3))
    const lp = uniqueSorted(posOf(l!))
    expect(rp).toHaveLength(lp.length)
    for (let i = 0; i < rp.length; i++) {
      for (let k = 0; k < 3; k++) expect(rp[i]![k]).toBeCloseTo(lp[i]![k]!, 4)
    }
    expect(world(r!).x).toBeCloseTo(-world(l!).x, 4)
  })
})

/* ------------------------------------------------------ repeat-and-sink --- */

describe('twelve spikes, six a side, sunk (§3.1 — Joe\'s own idea)', () => {
  it('places twelve, evenly, six each side, mirrored', () => {
    const g = build()
    const spikes = named(g, 'spike')
    expect(spikes).toHaveLength(12)

    const right = spikes.filter(s => world(s).x > 0).sort((a, b) => world(b).z - world(a).z)
    const left = spikes.filter(s => world(s).x < 0).sort((a, b) => world(b).z - world(a).z)
    expect(right).toHaveLength(6)
    expect(left).toHaveLength(6)

    for (let i = 0; i < 6; i++) {
      const wr = world(right[i]!), wl = world(left[i]!)
      expect(wl.x).toBeCloseTo(-wr.x, 4)
      expect(wl.y).toBeCloseTo(wr.y, 4)
      expect(wl.z).toBeCloseTo(wr.z, 4)
    }
    // Evenly spaced along one line, which is what `row` promises.
    const gaps: number[] = []
    for (let i = 1; i < 6; i++) gaps.push(world(right[i - 1]!).z - world(right[i]!).z)
    for (const gp of gaps) expect(gp).toBeCloseTo(gaps[0]!, 4)
  })

  it('buries each one inside the depth the pack itself used for that shape', () => {
    const g = build()
    const part = partById('cone-01')!
    const att = part.attachment!
    const top = worldBox(g.getObjectByName('hull')!).max.y
    for (const s of named(g, 'spike')) {
      const buried = top - worldBox(s).min.y
      const frac = buried / part.size[1]
      expect(frac, `${s.name} sunk ${frac.toFixed(3)}`)
        .toBeGreaterThanOrEqual(att.sunkFractionMin - 1e-3)
      expect(frac, `${s.name} sunk ${frac.toFixed(3)}`)
        .toBeLessThanOrEqual(att.sunkFractionMax + 1e-3)
      // §3: "every eared species embeds its ear into the hull by at least 0.125".
      expect(buried).toBeGreaterThanOrEqual(0.125 - 1e-3)
    }
  })

  it('found its spike by measurement, and the query still returns both hog parts', () => {
    const hits = findShapes(SPIKE_QUERY).map(p => p.id)
    // §3.2's acceptance test, verbatim: the hog's ear AND the hog's tusk, from a
    // query that names no species, no role and no form.
    expect(hits).toContain('cone-04')  // hog/ear-right
    expect(hits).toContain('wedge-13') // hog/front-of-face tusk-right
    expect(hits).toContain('cone-01')  // what the hedgehog actually wears

    // And this is WHY `form` is a label and never a filter. Filtering the same
    // query to the cone/spike forms keeps the ear and throws the tusk away — the
    // two shapes are one job on opposite sides of a bucket boundary.
    const coney = findShapes(SPIKE_QUERY).filter(p => p.shape.form === 'cone')
    expect(coney.map(p => p.id)).toContain('cone-04')
    expect(coney.map(p => p.id)).not.toContain('wedge-13')
  })
})

/* ------------------------------------------------------------ the body --- */

describe('the hedgehog stands where the pack stands', () => {
  it('puts four legs on y = 0, sunk into the belly by a measured amount', () => {
    const g = build()
    const legs = named(g, 'leg')
    expect(legs).toHaveLength(4)
    const part = partById('box-01')!
    const bottom = worldBox(g.getObjectByName('hull')!).min.y
    for (const l of legs) {
      const b = worldBox(l)
      expect(b.min.y).toBeCloseTo(0, 3)
      const frac = (b.max.y - bottom) / part.size[1]
      expect(frac).toBeGreaterThanOrEqual(part.attachment!.sunkFractionMin - 1e-3)
      expect(frac).toBeLessThanOrEqual(part.attachment!.sunkFractionMax + 1e-3)
    }
    // Under the MIDDLE, not at the corners (§3, the leg note).
    for (const l of legs) {
      expect(Math.abs(world(l).x)).toBeLessThan(1.35 / 2)
      expect(Math.abs(world(l).z)).toBeLessThan(1.25 / 2)
    }
  })

  it('lands inside the pack\'s measured height band, feet on zero', () => {
    const g = build()
    const b = worldBox(g)
    expect(b.min.y).toBeCloseTo(0, 4)
    const h = b.max.y - b.min.y
    // The 24 run 1.43-2.02, mean 1.65. A stranger in that line-up is the one
    // failure roster §1 names.
    expect(h).toBeGreaterThan(1.43)
    expect(h).toBeLessThan(2.02)
  })

  it('stays inside the pack\'s vertex and triangle budget (rule 9)', () => {
    const g = build()
    let verts = 0, tris = 0, body = 0
    for (const m of meshesOf(g)) {
      const n = m.geometry.getAttribute('position').count
      verts += n
      tris += m.geometry.getIndex()!.count / 3
      if (m.userData['role'] !== 'leg') body += n
    }
    // Measured off the 24 `.glb` files: whole-model 405-1626 verts and 422-951
    // triangles; the `body` NODE alone, which is what rule 9 quotes, 236-1114.
    expect(body).toBeGreaterThanOrEqual(236)
    expect(body).toBeLessThanOrEqual(1114)
    expect(verts).toBeGreaterThanOrEqual(405)
    expect(verts).toBeLessThanOrEqual(1626)
    expect(tris).toBeGreaterThanOrEqual(422)
    expect(tris).toBeLessThanOrEqual(951)
  })
})

/* ------------------------------------------------------------- texture --- */

describe('the texture is cached, and detached rather than disposed', () => {
  it('paints the whole animal from one material and one texture', () => {
    const g = build()
    const mats = new Set(meshesOf(g).map(m => m.material as THREE.Material))
    expect(mats.size).toBe(1)
    const mat = [...mats][0] as THREE.MeshStandardMaterial
    expect(mat.map).not.toBeNull()
    // Five slots, four pixels each: 4 x 20. A column, not an atlas.
    const img = mat.map!.image as ImageData
    expect(img.width).toBe(4)
    expect(img.height).toBe(Object.keys(HEDGEHOG_ASSEMBLY.palette).length * 4)
    // Rule 8: a single-slot part reads ONE point on that column, so the hull is
    // one hue and cannot be a blend of two.
    const uv = (g.getObjectByName('hull') as THREE.Mesh).geometry.getAttribute('uv')
    const pts = new Set<string>()
    for (let i = 0; i < uv.count; i++) pts.add(`${uv.getX(i).toFixed(5)},${uv.getY(i).toFixed(5)}`)
    expect(pts.size).toBe(1)
  })

  it('gives two builds the same texture object', () => {
    detachAssemblyTextures()
    expect(assemblyTextureCount()).toBe(0)
    const a = build(), b = build()
    const ta = ((a.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    const tb = ((b.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    expect(ta).toBe(tb)
    expect(assemblyTextureCount()).toBe(1)
  })

  it('never disposes one — a child may already own a pet wearing it', () => {
    detachAssemblyTextures()
    const a = build()
    const ta = ((a.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map!
    let disposed = 0
    ta.addEventListener('dispose', () => { disposed += 1 })

    const let_go = detachAssemblyTextures()
    expect(let_go).toBe(1)
    expect(assemblyTextureCount()).toBe(0)
    expect(disposed).toBe(0)
    // Still usable: the pet on screen keeps its pixels.
    expect((ta.image as ImageData).data.length).toBe(4 * 20 * 4)

    const c = build()
    const tc = ((c.getObjectByName('hull') as THREE.Mesh).material as THREE.MeshStandardMaterial).map
    expect(tc).not.toBe(ta)
    expect(disposed).toBe(0)
  })

  it('splits the eye card into two slots off its own measured bands', () => {
    const g = build()
    const eye = named(g, 'eye')[0]!
    const uv = eye.geometry.getAttribute('uv')
    const vs = new Set<string>()
    for (let i = 0; i < uv.count; i++) vs.add(uv.getY(i).toFixed(4))
    // The bank measured `plate-01` as bands 3 and 15; the paint sends 15 to the
    // pupil slot and the rest to the eye slot, so exactly two rows are read.
    expect(new Set(partById('plate-01')!.bands).size).toBe(2)
    expect(vs.size).toBe(2)
    for (let i = 0; i < uv.count; i++) expect(uv.getX(i)).toBeCloseTo(0.5, 6)
  })
})

/* --------------------------------------------------------------- roster --- */

describe('the roster stays the authority on names and facts', () => {
  it('reads name and collection off the roster and carries the flag', () => {
    const rows = assembledSpecies()
    expect(rows.map(r => r.id)).toEqual(['animal-hedgehog'])
    const row = rows[0]!
    expect(row.name).toBe(SPECIES_NAMES['animal-hedgehog'])
    expect(row.name).toBe('Hedgehog')
    expect(row.collection).toBe(SPECIES_COLLECTION['animal-hedgehog'])
    expect(row.flag).toBe(HEDGEHOG_ASSEMBLY.flag)
    expect(row.flag).toMatch(/cone-01/)
  })

  it('adds the assembly beside the scrapped kit build, changing nothing', () => {
    const hog = GARDEN_SPECIES.find(s => s.id === 'animal-hedgehog')!
    expect(hog.assembly).toBe(HEDGEHOG_ASSEMBLY)
    // JT-034 is Joe's to rule on; until then the old build stays exactly as it
    // shipped so he can put the two side by side.
    expect(hog.kit).toBe('quadruped')
    expect(hog.build).toEqual({
      kit: 'quadruped', height: 1.52, body: 0.9, head: 0.9, legs: 0.4,
      ears: 'round', tail: 'stub', extras: ['spines', 'snout'],
      palette: { coat: 0xb2946c, belly: 0xf4e6cc, detail: 0x6b533a, accent: 0x53412c },
    })
  })

  it('refuses a species it has no build for, by name', () => {
    expect(() => buildAssembled('animal-squirrel')).toThrow(/animal-squirrel/)
  })
})
