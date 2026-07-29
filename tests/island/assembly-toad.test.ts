/**
 * The toad. Garden's warty one, and the near half of the pair the roster names.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a toad can say.
 *
 * Which is two claims, and the first one is the animal:
 *
 *   1. **`box-05` is a DOME and not a spike.** A toad that reads as spiny is a
 *      hedgehog, and the hedgehog is in this same collection. So the shape is
 *      measured here rather than asserted in a comment: taper, profile, and how
 *      much of it stands above the skin against how wide it is.
 *   2. **It is not the frog.** Neither animal has an ear or a tail, so every
 *      separation has to be carried somewhere else, and each place it is carried
 *      is checked: the warty back, the blunt face against the mouth plate, the
 *      hull's depth, and a palette that is duller in all four slots.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, TOAD_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-toad',
  parts: ['box-01', 'box-03', 'box-05', 'plate-01', 'tube-03'],
  // 1.43125 (the bare cube on standard legs) + 0.116, the half-wart standing
  // proud of its own back. Nothing else on this animal reaches above the hull.
  height: 1.5472,
  verts: 472,
  tris: 744,
  // Nine warts and a blunt nose: the next biggest mesh after the hull is a LEG,
  // and the hull is forty-five times it.
  massRatio: 40,
  // The two chamfer rows are one spun feature. The top row is not turned at all.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-toad')
  g.updateMatrixWorld(true)
  return g
}
const meshes = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    if ((o as THREE.Mesh).isMesh && o.name.startsWith(prefix)) out.push(o as THREE.Mesh)
  })
  return out
}
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/** How far a wart's facing is turned around the body, in degrees. */
const facingDeg = (m: THREE.Mesh): number => {
  const f = m.userData['facing'] as readonly number[]
  return Math.round((Math.atan2(f[0]!, f[1]!) * 180) / Math.PI)
}

describe('animal-toad: box-05 is a DOME, which is the whole distance from the hedgehog', () => {
  it('has no point on it at all — taper 1.000, against the spike\'s 0.000', () => {
    const wart = partById('box-05')!
    const spike = partById('cone-01')!
    // Taper is the ratio of the two ends. The spike's is zero because one end IS
    // a point; the wart's is one because its two ends are the same, and what is
    // between them is wider than either.
    expect(wart.shape.taper).toBe(1)
    expect(spike.shape.taper).toBe(0)
    expect(wart.shape.symmetry).toBe('radial')
    // And the hedgehog's shape is nowhere on this animal, so the two collections-
    // mates cannot converge by accident.
    expect(TOAD_ASSEMBLY.features.some(f => f.part === 'cone-01')).toBe(false)
  })

  it('is widest in the MIDDLE, measured off its own 108 points', () => {
    const wart = partById('box-05')!
    const rings = new Map<string, number>()
    for (let i = 0; i < wart.positions.length; i += 3) {
      const y = wart.positions[i + 1]!.toFixed(4)
      const r = Math.hypot(wart.positions[i]!, wart.positions[i + 2]!)
      rings.set(y, Math.max(rings.get(y) ?? 0, r))
    }
    const byHeight = [...rings.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))
    // Six rings. Radius 0.000 at both poles, 0.068 next to each, and the widest
    // pair at the equator — a squashed ball, not a cone.
    expect(byHeight.map(e => Number(e[1].toFixed(4))))
      .toEqual([0, 0.0682, 0.1103, 0.1103, 0.0682, 0])
    expect(Number(byHeight[0]![0])).toBeCloseTo(-0.116, 4)
    expect(Number(byHeight[5]![0])).toBeCloseTo(0.116, 4)
  })

  it('stands WIDER than it stands proud, and the spike does the opposite', () => {
    const wart = partById('box-05')!
    const spike = partById('cone-01')!
    // Half of it is buried (see the sink test below), so what a child sees is
    // 0.116 tall and 0.221 across: 1.90 times wider than high. A bump.
    const proud = wart.size[1]! * 0.5
    expect(proud).toBeCloseTo(0.116, 4)
    expect(wart.size[0]! / proud).toBeGreaterThan(1.8)
    // The hedgehog's quill, on its own measured burial, is the other way round by
    // about the same factor: 0.275 standing out of a 0.160 footprint.
    const quill = spike.size[1]! * (1 - spike.attachment!.sunkFractionMean)
    expect(quill / spike.size[0]!).toBeGreaterThan(1.7)
  })
})

describe('animal-toad: nine warts, three rows, on the back and nowhere else', () => {
  it('is nine — three on the top and three on each shoulder chamfer', () => {
    const g = build()
    const warts = meshes(g, 'wart')
    expect(warts).toHaveLength(9)
    expect(meshes(g, 'wart-top')).toHaveLength(3)
    expect(meshes(g, 'wart-chamfer')).toHaveLength(6)
    // The chamfer idiom's third row is deliberately absent: a toad is warty on
    // its back, not down its flanks, and dropping it is what makes the count
    // nine rather than the fifteen all three rows would give.
    expect(meshes(g, 'wart-side')).toHaveLength(0)
    for (const m of warts) expect(m.userData['part']).toBe('box-05')
  })

  it('steps its facings evenly through a half turn, so a cube reads round', () => {
    const g = build()
    // §8's acceptance test, and it is Joe's stated intent rather than the
    // arithmetic: the distinct facings must step evenly. The hedgehog's five are
    // -90/-45/0/+45/+90; these are the middle three.
    expect([...new Set(meshes(g, 'wart').map(facingDeg))].sort((a, b) => a - b))
      .toEqual([-45, 0, 45])
  })

  it('uses the SAME three stations on every row, on the pack\'s own 1/16 grid', () => {
    const g = build()
    for (const row of ['wart-top', 'wart-chamfer']) {
      const z = [...new Set(meshes(g, row).map(m => Number(world(g, m.name).z.toFixed(4))))]
      expect(z.sort((a, b) => a - b)).toEqual([-0.375, 0, 0.375])
    }
    // 0.375 is 6/16. It is not chosen: the flat top face reaches 0.3125 and a
    // wart buried 0.116 stays embedded to 0.4285, inside which the builder snaps
    // the spacing down to the grid. §3's "nothing floats" sets it, not taste.
    expect(0.375 * 16).toBe(6)
    expect(0.3125 + 0.116).toBeGreaterThan(0.375)
  })

  it('leaves DAYLIGHT between neighbours, which a ridge of spikes does not', () => {
    const wart = partById('box-05')!
    // This is the difference between nine warts and a serrated back. The spacing
    // is 0.375 against a footprint of 0.221, so each is a separate lump; the
    // hedgehog's stations are 0.250 apart on a 0.329 depth, so its row overlaps
    // by a quarter and welds into one edge.
    expect(0.375).toBeGreaterThan(wart.size[0]!)
    expect(0.25).toBeLessThan(partById('cone-01')!.size[2]!)
  })
})

describe('animal-toad: sunk to its own equator, which is the one number chosen', () => {
  it('buries exactly half, so every wart\'s centre IS its join point', () => {
    const g = build()
    const rows = TOAD_ASSEMBLY.features.filter(f => f.name.startsWith('wart'))
    expect(rows).toHaveLength(2)
    for (const f of rows) expect(f.sink).toBe(0.5)
    // The consequence, and the reason 0.5 needs no argument: for a shape whose
    // two ends are identical, half-sunk puts the centre on the surface it joins.
    // To four decimals, which is what a float32 position attribute carries; the
    // alternative depth — the shape's own measured 0.000 — would be 0.116 out.
    for (const m of meshes(g, 'wart')) {
      const at = m.userData['joinedAt'] as readonly number[]
      const p = world(g, m.name)
      expect(p.x).toBeCloseTo(at[0]!, 4)
      expect(p.y).toBeCloseTo(at[1]!, 4)
      expect(p.z).toBeCloseTo(at[2]!, 4)
    }
  })

  it('joins the top row on the cube\'s top face and the others on its real chamfer', () => {
    const g = build()
    for (const m of meshes(g, 'wart-top')) {
      expect((m.userData['joinedAt'] as number[])[1]).toBeCloseTo(1.43125, 6)
      expect((m.userData['joinedAt'] as number[])[0]).toBeCloseTo(0, 9)
    }
    for (const m of meshes(g, 'wart-chamfer')) {
      const at = m.userData['joinedAt'] as number[]
      // 0.46875 off the centre in both axes — box-03 cuts every edge AND every
      // corner, so its chamfer midpoint is NOT the 0.5625 an uncut 1.000 face
      // would give. §8 step 1; assuming it once put a whole row 0.09 out.
      expect(Math.abs(at[0]!)).toBeCloseTo(0.46875, 6)
      expect(at[1]!).toBeCloseTo(0.80625 + 0.46875, 6)
    }
  })

  it('is embedded and standing proud at once — §3, nothing floats', () => {
    const g = build()
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    for (const m of meshes(g, 'wart-top')) {
      const b = new THREE.Box3().setFromObject(m)
      expect(b.min.y).toBeLessThan(hull.max.y)
      expect(b.max.y).toBeGreaterThan(hull.max.y)
      expect(hull.max.y - b.min.y).toBeCloseTo(0.116, 3)
    }
    // box-05's own measured burial is 0.000 — the bee wore it on a round head,
    // where a tangent ball is fine. On a flat face that is a ball balanced on the
    // skin, and §3 says depth is "a dial rather than a floor".
    expect(partById('box-05')!.attachment!.sunkFractionMean).toBe(0)
  })

  it('is the top row, and only the top row, that decides the height', () => {
    const box = new THREE.Box3().setFromObject(build())
    // 1.43125 is the bare 1.250 cube on standard legs — the pack's own floor,
    // cleared by 0.00125 before anything is added. The warts add their own half.
    expect(box.max.y - box.min.y).toBeCloseTo(1.43125 + 0.116, 4)
  })
})

describe('animal-toad: the face is blunt, and it is a donor transfer', () => {
  it('joins the deer\'s broad nose at the cube\'s front face and RECOVERS its centre', () => {
    const deer = partById('tube-03')!
    const snout = TOAD_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, deer.offset[1], HULL_FRONT_Z_USUAL],
    })
    // Sunk 0.000 — the deer did not bury it, so neither does this — and its
    // centre therefore lands on the deer's own recorded z, which was not used to
    // put it there. That agreement is the evidence the transfer is legitimate.
    expect(snout.sink).toBe(0)
    expect(world(build(), 'snout').z).toBeCloseTo(deer.offset[2]!, 4)
    expect(deer.offset[2]).toBeCloseTo(0.740710, 6)
  })

  it('is BLUNT: wide, low and shallow, and it does not taper', () => {
    const deer = partById('tube-03')!
    expect(deer.shape.taper).toBe(1)
    // 0.532 across, 0.300 tall, and only 0.231 of it in front of the face. A
    // snub jaw, not a muzzle and not a beak.
    expect(deer.size[0]!).toBeGreaterThan(deer.size[1]!)
    expect(deer.size[2]!).toBeLessThan(0.25)
  })

  it('wears no ear, no tail and no nose button', () => {
    const names = TOAD_ASSEMBLY.features.map(f => f.name)
    // Ears and tail are anatomy: a toad has neither, so the separation from the
    // frog cannot come from either and has to come from the back and the face.
    expect(names).not.toContain('ear')
    expect(names).not.toContain('tail')
    // The nose is a deliberate absence. The pack's nose family is mammal buttons
    // and beaks; the one honest alternative is a two-triangle nostril card that
    // would have to float off a z nobody measured.
    expect(names).not.toContain('nose')
  })

  it('leaves the eye where the pack put it, because the frog is the one that moved', () => {
    const card = partById('plate-01')!
    const eye = TOAD_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
    expect(card.offset[1]).toBeCloseTo(0.933646, 6)
    expect(eye.sink).toBe(0)
    expect(eye.stretch).toBeUndefined()
  })
})

describe('animal-toad: what separates it from the frog', () => {
  it('is the deeper animal of the pair — the cube, not the lion\'s shallow hull', () => {
    expect(TOAD_ASSEMBLY.hull.part).toBe('box-03')
    expect(TOAD_ASSEMBLY.hull.at).toEqual([0, 0.80625, 0])
    expect(TOAD_ASSEMBLY.hull.stretch).toBeUndefined()
    // 1.250 deep against box-31's 1.125. Taking a different authored hull is not
    // a stretch and needs no `stretchWhy` — see OTHER_HULLS in hulls.ts.
    expect(partById('box-03')!.size[2]).toBe(1.25)
    expect(partById('box-31')!.size[2]).toBeLessThan(1.25)
  })

  it('is DULLER in all four slots than the frog\'s own signed-off four', () => {
    /* garden.ts's records, quoted: the frog is bright green and the toad is drab
     * olive, and both sets are signed-off data that neither species file may
     * touch. Saturation is the measurable form of "drier and duller". */
    const frog = [0x5fae33, 0xf0f2cf, 0x3f7c1f, 0x2c5b16]
    const toad = [0x8e7c4c, 0xd8ca9f, 0x6a5b33, 0x4c4023]
    const sat = (hex: number): number => {
      const c = [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
      const hi = Math.max(...c), lo = Math.min(...c)
      if (hi === lo) return 0
      return hi + lo > 255 ? (hi - lo) / (510 - hi - lo) : (hi - lo) / (hi + lo)
    }
    for (let i = 0; i < 4; i++) expect(sat(toad[i]!)).toBeLessThan(sat(frog[i]!))
    // And they are this species' palette verbatim, in the order that IS the
    // texture layout.
    expect(Object.values(TOAD_ASSEMBLY.palette).slice(0, 4)).toEqual(toad)
  })

  it('paints its belly at the pack\'s own line and adds no geometry for it', () => {
    expect(TOAD_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    // Same 32 welded points as an unpatched cube; only the seam splits.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })

  it('fits between two trees, and strains nothing, so it carries no flag', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The blunt nose
    // is the only thing outside the cube in plan, and 0.74 is well inside the
    // fox's own 1.15 — the pack's worst, and the number the island copes with.
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.741, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    // 744 triangles against the pack's 422-951, and nine domes cost 432 of them.
    expect(TOAD_ASSEMBLY.flag).toBeUndefined()
  })
})
