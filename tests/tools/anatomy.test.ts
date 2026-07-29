/**
 * The anatomy gallery's arithmetic: the split, the order, the names, the join.
 *
 * Joe asked to see "one example of an original animal, ripped apart in the
 * viewer with a label against each part", to judge two claims he has made about
 * the art with his own eyes rather than from screenshots — that a Kenney pet's
 * head IS its body, one fused form, and that every eye in the pack is a flat
 * card. The picture is three.js and cannot be asserted about from here. What can
 * be, and is all of what the picture rests on, is `anatomy.ts`: whether the
 * position weld actually joins an exporter's duplicated corners, whether two
 * shells that touch nowhere stay two, whether the order is total, and whether a
 * name is ever shown that the table cannot vouch for.
 *
 * The fox case at the bottom is the one that matters most and is the only test
 * here that reads a real file. It decodes `animal-fox.glb` off disk with a
 * twenty-line glTF reader — no three.js, no browser — runs the same split the
 * viewer runs, and checks it against the numbers in the emitted name table. If
 * the pack is ever re-exported this goes red, which is exactly when a label in
 * the viewer would have started lying.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  weldedComponents, componentFacts, orderComponents, namesFor, unnamed,
  explodeOffset, sizeLabel, ANATOMY_SPECIES, DEFAULT_SPECIES, SPLIT_NODE, petIdOf,
  WELD_TOLERANCE, type ComponentFacts,
} from '../../tools/workbench/public/anatomy'
import { COMPONENT_NAMES } from '../../tools/workbench/public/anatomy-names'
import { GALLERIES, packsFor, type Gallery, type Pack } from '../../tools/workbench/public/registry'

const REPO = resolve(__dirname, '../..')

/** A component's facts, hand-made, for the ordering and naming tests. */
const facts = (tris: number, centroid: [number, number, number]): ComponentFacts => ({
  tris, verts: tris * 3,
  min: [0, 0, 0], max: [1, 1, 1], size: [1, 1, 1],
  centroid,
})

describe('the position weld, which is what makes the split mean anything', () => {
  /*
   * Two triangles that share nothing. The plain case, and the one that would
   * pass even with a broken weld — it is here so that the case below can be
   * read as the difference between them.
   */
  it('keeps two disjoint triangles apart', () => {
    const positions = [
      0, 0, 0, 1, 0, 0, 0, 1, 0,
      10, 0, 0, 11, 0, 0, 10, 1, 0,
    ]
    const parts = weldedComponents(positions, null)
    expect(parts.length).toBe(2)
    expect(parts.map(p => p.length).sort()).toEqual([1, 1])
  })

  /*
   * THE CASE THE WHOLE GALLERY RESTS ON. Two triangles that touch at a corner,
   * where the corner is written TWICE into the buffer with two different vertex
   * indices — which is what a GLB exporter does at every hard edge. By index
   * they share nothing; by position they are one solid. Welding by position is
   * the only reason the fox comes apart into 5 shells instead of 298.
   */
  it('joins two triangles at a corner that is duplicated but coincident', () => {
    const positions = [
      0, 0, 0, 1, 0, 0, 0, 1, 0,
      1, 0, 0, 2, 0, 0, 1, 1, 0,       // 1,0,0 again, as its own vertex
    ]
    const parts = weldedComponents(positions, null)
    expect(parts.length).toBe(1)
    expect(parts[0]).toEqual([0, 1])
  })

  it('joins a corner that agrees only to the tolerance, and not one that misses it', () => {
    const near = (delta: number) => weldedComponents([
      0, 0, 0, 1, 0, 0, 0, 1, 0,
      1 + delta, 0, 0, 2, 0, 0, 1 + delta, 1, 0,
    ], null).length
    expect(near(1e-9)).toBe(1)
    expect(near(0.01)).toBe(2)
  })

  it('follows an index buffer when there is one, and shares its vertices', () => {
    /* One quad as two triangles sharing indices 1 and 2 — connected by INDEX. */
    const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]
    expect(weldedComponents(positions, [0, 1, 2, 1, 3, 2]).length).toBe(1)
  })

  it('has nothing to say about an empty buffer', () => {
    expect(weldedComponents([], null)).toEqual([])
  })

  /* The tolerance is a knob and the test below is what it is worth: at zero,
   * an exporter's duplicated corner stops welding and the split falls apart. */
  it('is the tolerance doing the work, not luck', () => {
    expect(WELD_TOLERANCE).toBeLessThan(1e-4)
    expect(WELD_TOLERANCE).toBeGreaterThan(0)
  })
})

describe('componentFacts: what gets printed beside a part', () => {
  it('measures the box, the size and the centroid in model units', () => {
    const positions = [0, 0, 0, 2, 0, 0, 0, 4, 0]
    const f = componentFacts(positions, null, [0])
    expect(f.tris).toBe(1)
    expect(f.verts).toBe(3)
    expect(f.min).toEqual([0, 0, 0])
    expect(f.max).toEqual([2, 4, 0])
    expect(f.size).toEqual([2, 4, 0])
    expect(f.centroid).toEqual([2 / 3, 4 / 3, 0])
  })

  /*
   * A vertex two triangles share counts ONCE, or the centroid drifts towards
   * whichever corner happens to be used by the most faces. Averaging corners
   * instead of vertices moves the fox's hull centroid by 0.009 units — small,
   * but it is a different quantity from the one the name table holds, and
   * `namesFor` compares the two.
   */
  it('counts a shared vertex once when taking the centroid', () => {
    const quad = [0, 0, 0, 2, 0, 0, 0, 2, 0, 2, 2, 0]
    const f = componentFacts(quad, [0, 1, 2, 1, 3, 2], [0, 1])
    expect(f.verts).toBe(4)
    expect(f.centroid).toEqual([1, 1, 0])
  })

  it('prints a size the way the label prints it', () => {
    expect(sizeLabel([1.25, 1.5050747, 1.5596501])).toBe('1.250 × 1.505 × 1.560')
    expect(sizeLabel([0.4, 0.320208, 0])).toBe('0.400 × 0.320 × 0.000')
  })
})

describe('orderComponents: total, so two loads label the same shell the same way', () => {
  it('puts the biggest shell first', () => {
    const out = orderComponents([
      { facts: facts(27, [0, 0, 0]) },
      { facts: facts(184, [0, 1, 0]) },
      { facts: facts(34, [0, 2, 0]) },
    ])
    expect(out.map(o => o.facts.tris)).toEqual([184, 34, 27])
  })

  it('breaks a tie on centroid x descending, then y, then z', () => {
    const out = orderComponents([
      { facts: facts(27, [-0.24, 0.7, 0.6]) },
      { facts: facts(27, [0.24, 0.7, 0.6]) },
      { facts: facts(27, [0.24, 0.9, 0.6]) },
      { facts: facts(27, [0.24, 0.9, 0.9]) },
    ])
    expect(out.map(o => o.facts.centroid)).toEqual([
      [0.24, 0.9, 0.9], [0.24, 0.9, 0.6], [0.24, 0.7, 0.6], [-0.24, 0.7, 0.6],
    ])
  })

  it('does not disturb what it was given', () => {
    const input = [{ facts: facts(1, [0, 0, 0]) }, { facts: facts(2, [0, 0, 0]) }]
    orderComponents(input)
    expect(input.map(i => i.facts.tris)).toEqual([1, 2])
  })
})

describe('namesFor: our names, and the silence that is better than a wrong one', () => {
  const fox = COMPONENT_NAMES.fox!
  const asMeasured = (): ComponentFacts[] => fox.map(c => facts(c.tris, [...c.c] as [number, number, number]))

  it('names the fox its five, and marks every one of them as OURS', () => {
    const names = namesFor('fox', asMeasured())
    expect(names.map(n => n.name)).toEqual(fox.map(c => c.name))
    expect(names.every(n => n.ours)).toBe(true)
  })

  /*
   * The left/right trap. Two eye cards of 27 triangles each: the ordinal alone
   * cannot tell them apart, so they are paired to the table by centroid. Fed
   * back in the WRONG order, the names must swap with them rather than staying
   * put — otherwise a mirrored pair would silently be labelled the wrong way
   * round, which for `ear-left` / `ear-right` is a lie nobody would see.
   */
  it('pairs same-sized shells to the table by position, not by their turn', () => {
    const measured = asMeasured()
    const swapped = [...measured]
    swapped[2] = measured[3]!
    swapped[3] = measured[2]!
    const names = namesFor('fox', swapped)
    expect(names[2]!.name).toBe(fox[3]!.name)
    expect(names[3]!.name).toBe(fox[2]!.name)
  })

  it('says nothing it cannot vouch for when a species is not in the table', () => {
    const names = namesFor('unicorn', asMeasured())
    expect(names.map(n => n.name)).toEqual([
      'unnamed component 1', 'unnamed component 2', 'unnamed component 3',
      'unnamed component 4', 'unnamed component 5',
    ])
    expect(names.every(n => n.ours)).toBe(true)
  })

  it('falls back wholesale when the component COUNT disagrees', () => {
    const names = namesFor('fox', asMeasured().slice(0, 4))
    expect(names.map(n => n.name)).toEqual(unnamed(0).name === 'unnamed component 1'
      ? ['unnamed component 1', 'unnamed component 2', 'unnamed component 3', 'unnamed component 4']
      : [])
  })

  /* The re-export case: same number of shells, one of them a different size.
   * Everything falls back, not just the shell that moved — because once the
   * table and the model disagree at all, no ordinal in it can be trusted. */
  it('falls back wholesale when one TRIANGLE COUNT disagrees', () => {
    const measured = asMeasured()
    measured[1] = facts(35, [...fox[1]!.c] as [number, number, number])
    const names = namesFor('fox', measured)
    expect(names.every(n => n.name.startsWith('unnamed component'))).toBe(true)
  })
})

describe('explodeOffset: assembled at 0, apart at 1', () => {
  it('moves nothing at all at 0', () => {
    expect(explodeOffset([1, 2, 3], [0, 0, 0], 2, 0)).toEqual([0, 0, 0])
  })

  it('pushes out along the part own direction, by the reach', () => {
    expect(explodeOffset([2, 0, 0], [0, 0, 0], 0.5, 1)).toEqual([0.5, 0, 0])
    expect(explodeOffset([-2, 0, 0], [0, 0, 0], 0.5, 1)).toEqual([-0.5, 0, 0])
  })

  it('leaves a part sitting on the centre where it is, having no way to go', () => {
    expect(explodeOffset([1, 1, 1], [1, 1, 1], 5, 1)).toEqual([0, 0, 0])
  })

  it('is linear in the slider, so half way is half way', () => {
    const [x] = explodeOffset([0, 3, 0], [0, 0, 0], 1, 0.5)
    const half = explodeOffset([0, 3, 0], [0, 0, 0], 1, 0.5)
    expect(x).toBe(0)
    expect(half[1]).toBeCloseTo(0.5, 12)
  })
})

describe('the anatomy gallery is registered, and claims nobody else pack', () => {
  it('is in the one list of galleries there is', () => {
    expect(GALLERIES).toContain('anatomy')
  })

  /*
   * No pack, for the same reason `primitives` has none: this gallery puts real
   * pack GLBs on the turntable but it BORROWS them from the species gallery,
   * which owns `pets`. A borrowed model is not this gallery's to be an orphan
   * of, and claiming `pets` here would make every pet file appear twice over.
   */
  it('draws from no disk pack of its own', () => {
    expect(packsFor('anatomy' as Gallery)).toEqual([])
  })

  it('leaves the other five exactly as they were', () => {
    expect(packsFor('species')).toEqual(['pets'])
    expect(packsFor('tiles')).toEqual(['tiles'])
    expect(packsFor('props')).toEqual(['props', 'forest'])
    expect(packsFor('built')).toEqual([])
    expect(packsFor('primitives')).toEqual([])
  })

  it('never reaches another gallery data', () => {
    const seen = new Map<Pack, Gallery>()
    for (const gallery of GALLERIES) {
      for (const pack of packsFor(gallery)) {
        expect(seen.has(pack), `${pack} is claimed by ${seen.get(pack)} and ${gallery}`).toBe(false)
        seen.set(pack, gallery)
      }
    }
  })

  it('has a tab in the chrome, a species picker and an explode slider', () => {
    const html = readFileSync(resolve(REPO, 'tools/workbench/public/viewer.html'), 'utf8')
    expect(html).toContain('data-gallery="anatomy"')
    expect(html).toContain('id="speciesSelect"')
    expect(html).toContain('id="explodeRange"')
  })
})

describe('the roster this gallery takes apart', () => {
  it('is 24 animals, the default among them, each with a file on disk', () => {
    expect(ANATOMY_SPECIES.length).toBe(24)
    expect(new Set(ANATOMY_SPECIES).size).toBe(24)
    expect(ANATOMY_SPECIES).toContain(DEFAULT_SPECIES)
    for (const species of ANATOMY_SPECIES) {
      const file = resolve(REPO, `src/island/public/pets/${petIdOf(species)}.glb`)
      expect(existsSync(file), `no GLB for ${species}`).toBe(true)
      expect(COMPONENT_NAMES[species], `no name table for ${species}`).toBeDefined()
    }
  })

  it('holds a name table already in the viewer own order', () => {
    for (const [species, table] of Object.entries(COMPONENT_NAMES)) {
      const resorted = orderComponents(table.map(c => ({
        facts: facts(c.tris, [...c.c] as [number, number, number]),
        name: c.name,
      })))
      expect(resorted.map(r => r.name), `${species} table is out of order`)
        .toEqual(table.map(c => c.name))
    }
  })
})

/* -------------------------------------------------------------- the fox */

/**
 * Enough glTF to read one mesh's positions and indices out of a .glb.
 *
 * Not a loader and not trying to be. It exists so the test above the picture can
 * be run against the SAME BYTES the browser loads, with no three.js and no DOM,
 * which is the only way the claim "the fox is five shells" is worth anything.
 */
function readMesh(file: string, meshName: string): { positions: Float32Array; index: Uint32Array | null } {
  const bytes = readFileSync(file)
  let at = 12
  let json: any = null
  let bin: Buffer | null = null
  while (at < bytes.length) {
    const length = bytes.readUInt32LE(at)
    const kind = bytes.readUInt32LE(at + 4)
    const body = bytes.subarray(at + 8, at + 8 + length)
    if (kind === 0x4e4f534a) json = JSON.parse(body.toString('utf8'))
    if (kind === 0x004e4942) bin = body
    at += 8 + length + ((4 - (length % 4)) % 4)
  }
  if (!json || !bin) throw new Error(`${file} is not a GLB with a JSON and a BIN chunk`)

  const mesh = json.meshes.find((m: any) => m.name === meshName)
  if (!mesh) throw new Error(`no mesh named ${meshName} in ${file}`)
  const primitive = mesh.primitives[0]

  const read = (accessorIndex: number): number[] => {
    const accessor = json.accessors[accessorIndex]
    const view = json.bufferViews[accessor.bufferView]
    const per = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[accessor.type as string]!
    const width = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }[accessor.componentType as number]!
    const stride = view.byteStride || per * width
    const base = (view.byteOffset || 0) + (accessor.byteOffset || 0)
    const out: number[] = []
    for (let i = 0; i < accessor.count; i++) {
      for (let k = 0; k < per; k++) {
        const at = base + i * stride + k * width
        out.push(accessor.componentType === 5126 ? bin!.readFloatLE(at)
          : accessor.componentType === 5125 ? bin!.readUInt32LE(at)
            : accessor.componentType === 5123 ? bin!.readUInt16LE(at)
              : bin!.readUInt8(at))
      }
    }
    return out
  }

  return {
    positions: new Float32Array(read(primitive.attributes.POSITION)),
    index: primitive.indices === undefined ? null : new Uint32Array(read(primitive.indices)),
  }
}

describe('the fox, out of the real file, is five shells', () => {
  const fox = readMesh(resolve(REPO, `src/island/public/pets/${petIdOf(DEFAULT_SPECIES)}.glb`), SPLIT_NODE)
  const parts = orderComponents(
    weldedComponents(fox.positions, fox.index)
      .map(triangles => ({ facts: componentFacts(fox.positions, fox.index, triangles) })),
  )

  it('comes apart into exactly five, of 184, 34, 27, 27 and 26 triangles', () => {
    expect(parts.length).toBe(5)
    expect(parts.map(p => p.facts.tris)).toEqual([184, 34, 27, 27, 26])
    /* And nothing is lost: the shells add back up to the mesh. */
    expect(parts.reduce((n, p) => n + p.facts.tris, 0)).toBe(298)
    expect(parts.reduce((n, p) => n + p.facts.verts, 0)).toBe(493)
  })

  it('is named off the table, every name ours, none of them a fallback', () => {
    const names = namesFor(DEFAULT_SPECIES, parts.map(p => p.facts))
    expect(names.map(n => n.name)).toEqual([
      'torso+head fused hull (torso, neck, head, cheeks in one shell)',
      'nose',
      'eye card (flat cut-out)',
      'eye card (flat cut-out)',
      'nose-tip',
    ])
    expect(names.every(n => n.ours)).toBe(true)
  })

  /*
   * HEAD = BODY, measured. The biggest shell is 184 of 298 triangles and its
   * box is the full height of the body — 0 at the feet to the top of the ears.
   * If a head were a separate form there would be a shell for it; there is not,
   * and the one shell that exists spans the whole animal.
   */
  it('has no head shell, because the head is the body', () => {
    const hull = parts[0]!.facts
    expect(hull.tris / 298).toBeGreaterThan(0.6)
    expect(hull.min[1]).toBeCloseTo(0, 5)
    expect(hull.size[1]).toBeCloseTo(1.505075, 4)
  })

  /*
   * ALL EYES ARE FLAT, measured. Both 27-triangle shells have a bounding box
   * with a zero dimension: they are cut-out cards, not domes. Mirrored in x, at
   * the same height and the same depth.
   */
  it('has two eye cards with a bounding box exactly zero thick', () => {
    const eyes = parts.filter(p => p.facts.tris === 27).map(p => p.facts)
    expect(eyes.length).toBe(2)
    for (const eye of eyes) expect(Math.min(...eye.size)).toBe(0)
    expect(eyes[0]!.centroid[0]).toBeCloseTo(-eyes[1]!.centroid[0], 5)
    expect(eyes[0]!.centroid[1]).toBeCloseTo(eyes[1]!.centroid[1], 5)
  })

  /*
   * The census recorded a centroid per component and this recomputes them from
   * the file. They must agree, or `namesFor` would be pairing a left ear to a
   * right one on a model where the ordinal alone cannot decide.
   */
  it('agrees with the emitted table on where every shell sits', () => {
    const table = COMPONENT_NAMES[DEFAULT_SPECIES]!
    parts.forEach((part, i) => {
      expect(part.facts.centroid[0]).toBeCloseTo(table[i]!.c[0], 4)
      expect(part.facts.centroid[1]).toBeCloseTo(table[i]!.c[1], 4)
      expect(part.facts.centroid[2]).toBeCloseTo(table[i]!.c[2], 4)
      expect(part.facts.verts).toBe(table[i]!.verts)
    })
  })
})

/*
 * And the harder animals, because the fox is the easy case: the deer's antlers
 * and the panda's ears are separate shells and the fox has neither. Every one of
 * the 24 must split into exactly what the table says, or the viewer will be
 * showing `unnamed component N` for that animal and nobody would know why.
 */
describe('all 24 bodies split into what the table expects', () => {
  for (const species of ANATOMY_SPECIES) {
    it(`${species}`, () => {
      const mesh = readMesh(resolve(REPO, `src/island/public/pets/${petIdOf(species)}.glb`), SPLIT_NODE)
      const parts = orderComponents(
        weldedComponents(mesh.positions, mesh.index)
          .map(triangles => ({ facts: componentFacts(mesh.positions, mesh.index, triangles) })),
      )
      const table = COMPONENT_NAMES[species]!
      expect(parts.length, `${species} component count`).toBe(table.length)
      expect(parts.map(p => p.facts.tris)).toEqual(table.map(c => c.tris))
      const names = namesFor(species, parts.map(p => p.facts))
      expect(names.some(n => n.name.startsWith('unnamed component')), `${species} fell back`).toBe(false)
    })
  }
})
