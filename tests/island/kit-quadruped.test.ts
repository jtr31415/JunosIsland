/**
 * The quadruped kit, tested against the CONTRACT rather than against itself.
 *
 * Every assertion here is something `pets.ts` will actually do to the group, or
 * something roster §1 forbids. No renderer is needed and none is made: the kit
 * builds geometry and the test measures it, which is exactly what
 * `pets.ts:650-660` does before it decides a pet's keep-out radius and shadow.
 *
 * The two assertions worth defending:
 *
 *   - Running the REAL `flattenImported` over a built group and proving nothing
 *     moved. It is the one function in the import path that rewrites materials,
 *     and "Fred's material makes it a no-op" is a claim, not a fact, until it
 *     is run.
 *   - Every ear, every tail and every extra producing a distinguishable result.
 *     `types.ts:142` closes the extras list precisely so phase 2 cannot invent a
 *     part per species; the matching risk is a part in the list that the kit
 *     quietly does nothing for, which ships as a species that renders as a lie.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildQuadruped } from '../../src/island/species/kits/quadruped'
import { buildSpecies, paletteFor, UnbuiltKitError } from '../../src/island/species/kit'
import type { BuildSpec, KitPalette, QuadrupedBuild, QuadrupedExtra } from '../../src/island/species/types'
import { flattenImported } from '../../src/island/lighting/index'
import type { SetPalette } from '../../src/island/variants/recolour'

const PALETTE: KitPalette = { coat: 0xc46a2f, belly: 0xfff2e0, detail: 0x2f2620, accent: 0x8a3f18 }

const spec = (over: Partial<QuadrupedBuild> = {}): QuadrupedBuild => ({
  kit: 'quadruped',
  height: 1.8,
  body: 1,
  head: 1,
  legs: 1,
  ears: 'pointed',
  tail: 'bushy',
  palette: PALETTE,
  ...over,
})

const measure = (g: THREE.Object3D): THREE.Box3 => {
  g.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(g)
}

const dims = (g: THREE.Object3D): [number, number, number] => {
  const b = measure(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

/**
 * Enough of a built group to tell two of them apart.
 *
 * Vertex count AND measurements together, because either alone can collide:
 * two ear shapes can share a vertex count, and the height fit means every
 * variant ends up exactly `spec.height` tall so height alone proves nothing.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  const names: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      const geo = (n as THREE.Mesh).geometry
      verts += geo.getAttribute('position').count
      names.push(n.name)
    }
  })
  return `${verts}|${names.sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

describe('the built group survives what pets.ts does to it', () => {
  it('is finite, non-empty, feet on the ground and centred on x/z', () => {
    const box = measure(buildQuadruped(spec()))
    for (const v of [box.min, box.max]) {
      for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n)).toBe(true)
    }
    expect(box.isEmpty()).toBe(false)
    expect(box.min.y).toBeCloseTo(0, 6)
    expect((box.min.x + box.max.x) / 2).toBeCloseTo(0, 6)
    expect((box.min.z + box.max.z) / 2).toBeCloseTo(0, 6)
  })

  it('stands exactly as tall as the spec asks', () => {
    for (const h of [1.3, 1.55, 1.8, 2.13, 2.5]) {
      expect(dims(buildQuadruped(spec({ height: h })))[1]).toBeCloseTo(h, 6)
    }
  })

  it('keeps plausible species inside the live pack range', () => {
    // The pack runs 1.55 (parrot) to 2.13 (bunny) — pets.ts:656-659.
    const plausible: QuadrupedBuild[] = [
      spec({ height: 1.45, body: 1.7, legs: 0.4, ears: 'round', tail: 'thin' }),   // stoat
      spec({ height: 2.1, body: 0.8, legs: 1.4, ears: 'long', tail: 'stub' }),     // hare
      spec({ height: 2.4, body: 1.2, legs: 1.6, ears: 'round', tail: 'tuft' }),    // giraffe-ish
      spec({ height: 1.35, body: 0.9, legs: 0.35, ears: 'none', tail: 'flat' }),   // beaver
    ]
    for (const s of plausible) {
      const h = dims(buildQuadruped(s))[1]
      expect(h).toBeGreaterThanOrEqual(1.2)
      expect(h).toBeLessThanOrEqual(2.6)
    }
  })

  it('keeps a plausible species inside a walkable keep-out', () => {
    /*
     * pets.ts:652 charges LENGTH: `radius = max(width, depth) / 2`, and that
     * radius is what keeps a pet out of the trees. The 24 GLBs measure 1.25 to
     * 2.34 wide and 1.26 to 2.31 deep, so the pack's own worst keep-out is
     * 1.17 — an unclamped body multiplier used to give a stoat 2.0, which is a
     * creature that cannot walk between two trees. 2.0 is the backstop.
     */
    const shapes: QuadrupedBuild[] = [
      spec({ height: 1.35, body: 1.9, legs: 0.4, ears: 'round', tail: 'thin' }),
      spec({ height: 2.6, body: 1.2, head: 1.1, legs: 1.2, extras: ['trunk', 'tusks'] }),
      spec({ height: 2.0, body: 1.1, legs: 1.1, tail: 'tuft', extras: ['mane'] }),
    ]
    for (const s of shapes) {
      const [w, , d] = dims(buildQuadruped(s))
      expect(Math.max(w as number, d as number) / 2).toBeLessThan(2)
    }
  })

  it('is built as wide as the pack it has to stand in', () => {
    /*
     * Measured from all 24 GLBs under src/island/public/pets: mean width/height
     * 0.97, and the plain quadrupeds run 0.74 (fox) to 0.83 (polar bear). The
     * first pass of this kit built at 0.37 — anatomically fine and a total
     * stranger beside `animal-fox`, which roster §1 forbids. Nothing else in
     * the suite would have caught it, because a slim creature satisfies every
     * other assertion here.
     */
    const [w, h] = dims(buildQuadruped(spec()))
    expect((w as number) / (h as number)).toBeGreaterThan(0.55)
    expect((w as number) / (h as number)).toBeLessThan(1.2)
  })

  it('clamps a mad spec instead of building a monument', () => {
    const mad = buildQuadruped(spec({ height: 40, body: 12, head: 12, legs: 30 }))
    const [w, h, d] = dims(mad)
    expect(h).toBeCloseTo(2.6, 6)
    // Clamped proportions, not just a clamped height: a head multiplier of 12
    // left unchecked makes something twice as wide as it is tall.
    expect(w).toBeLessThan(h)
    expect(d).toBeLessThan(h * 1.6)
    // NaN in the data must not reach a transform — pets.ts measures a Box3 off
    // this and a NaN there poisons the keep-out radius for the whole field.
    const broken = dims(buildQuadruped(spec({ height: Number.NaN, body: Number.NaN })))
    for (const n of broken) expect(Number.isFinite(n)).toBe(true)
  })

  it('sets userData.pick on nothing — pets.ts:663 owns it', () => {
    buildQuadruped(spec({ extras: ['mane', 'horns', 'whiskers'] })).traverse(n => {
      expect(n.userData.pick).toBeUndefined()
    })
  })

  it('names no node wing-, because quadrupeds do not fly', () => {
    // pets.ts:690 collects flap targets with exactly this test.
    const all = spec({ extras: ['crest', 'spines', 'shell'] })
    buildQuadruped(all).traverse(n => expect(/^wing-/.test(n.name)).toBe(false))
  })

  it('leaves no detail part buried inside another part', () => {
    /*
     * THE BUG THIS EXISTS FOR: the first build put the eye whites at 0.36 of a
     * head-width forward with a half-depth of 0.10, against a head whose front
     * face is at 0.50. Both eyes were entirely inside the skull. Every other
     * assertion in this file passed — the group was finite, centred, the right
     * height, the right materials — and the pet had no face.
     *
     * So: a part that decorates another part must break its surface. A mesh
     * strictly inside another mesh is a mesh nobody will ever see, and at 0.16
     * scale nobody will notice it is missing either.
     */
    const g = buildQuadruped(spec({ tail: 'bushy', ears: 'round' }))
    const part = (name: string): THREE.Box3 => {
      let hit: THREE.Object3D | undefined
      g.traverse(n => { if (n.name === name) hit = n })
      if (!hit) throw new Error(`no part named ${name}`)
      return measure(hit)
    }
    const buried = (inner: THREE.Box3, outer: THREE.Box3): boolean =>
      outer.containsBox(inner)

    for (const [inner, outer] of [
      ['eye-left', 'head'], ['eye-right', 'head'], ['pupil-left', 'head'],
      ['nose', 'head'], ['ear-left', 'head'], ['ear-right', 'head'],
      ['belly', 'body'], ['tail', 'body'], ['paw-front-left', 'leg-front-left'],
    ] as const) {
      expect(buried(part(inner), part(outer)), `${inner} is inside ${outer}`).toBe(false)
    }
  })

  it('gives its parts stable, findable names', () => {
    const found = new Set<string>()
    buildQuadruped(spec()).traverse(n => found.add(n.name))
    for (const want of [
      'body', 'head', 'ear-left', 'ear-right', 'tail',
      'leg-front-left', 'leg-front-right', 'leg-back-left', 'leg-back-right',
      'eye-left', 'eye-right',
    ]) expect(found.has(want)).toBe(true)
  })
})

describe('materials', () => {
  const materials = (g: THREE.Object3D): THREE.Material[] => {
    const out: THREE.Material[] = []
    g.traverse(n => {
      const m = (n as THREE.Mesh).material
      if (!m) return
      for (const one of Array.isArray(m) ? m : [m]) out.push(one)
    })
    return out
  }

  it('is Standard, unlit-safe and metalness 0 throughout', () => {
    const built = buildQuadruped(spec({ extras: ['tusks', 'trunk'] }))
    const mats = materials(built)
    expect(mats.length).toBeGreaterThan(0)
    for (const m of mats) {
      expect(m).toBeInstanceOf(THREE.MeshStandardMaterial)
      expect((m as THREE.MeshStandardMaterial).metalness).toBe(0)
    }
  })

  it('survives flattenImported unchanged — it is a genuine no-op here', () => {
    const built = buildQuadruped(spec({ extras: ['mane'] }))
    const before = materials(built).map(m => {
      const s = m as THREE.MeshStandardMaterial
      return { m, colour: s.color.getHex(), metal: s.metalness, rough: s.roughness }
    })
    flattenImported(built)
    const after = materials(built)
    expect(after.length).toBe(before.length)
    for (const [i, was] of before.entries()) {
      const now = after[i] as THREE.MeshStandardMaterial
      expect(now).toBe(was.m)
      expect(now.color.getHex()).toBe(was.colour)
      expect(now.metalness).toBe(was.metal)
      expect(now.roughness).toBe(was.rough)
    }
  })
})

describe('no part of the data is a silent no-op', () => {
  it('builds a distinguishable creature for every ears value', () => {
    const seen = new Map<string, string>()
    for (const ears of ['round', 'pointed', 'long', 'tufted', 'none'] as const) {
      const sig = signature(buildQuadruped(spec({ ears })))
      expect(seen.has(sig), `ears '${ears}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, ears)
    }
  })

  it('builds a distinguishable creature for every tail value', () => {
    const seen = new Map<string, string>()
    for (const tail of ['bushy', 'thin', 'stub', 'tuft', 'flat', 'none'] as const) {
      const sig = signature(buildQuadruped(spec({ tail })))
      expect(seen.has(sig), `tail '${tail}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, tail)
    }
  })

  it('builds something for every extra, and nothing twice', () => {
    const all: QuadrupedExtra[] = [
      'horns', 'antlers', 'tusks', 'snout', 'mane', 'hump',
      'spines', 'shell', 'trunk', 'pouch', 'crest', 'whiskers',
    ]
    const bare = signature(buildQuadruped(spec()))
    const seen = new Map<string, string>([[bare, 'no extras']])
    for (const e of all) {
      const sig = signature(buildQuadruped(spec({ extras: [e] })))
      expect(seen.has(sig), `extra '${e}' matches '${seen.get(sig)}'`).toBe(false)
      seen.set(sig, e)
    }
  })

  it('puts every extra somewhere a camera can see it', () => {
    /*
     * The same fault as the buried eyes, one level up: `pouch` first sat inside
     * the belly slab and `tusks` inside the muzzle. Both built real geometry,
     * both changed the vertex count, and both would have shipped as a species
     * whose named detail part is not on screen.
     *
     * Checked against the head, and against the body and belly MERGED. Testing
     * the three boxes separately was the first attempt and it let the buried
     * pouch straight through: the pouch escaped the body downward and the belly
     * upward while sitting entirely inside the two together. The merged box
     * over-approximates their union, which is the stricter direction and is
     * what a torso actually looks like from outside.
     */
    const base = new Set<string>()
    buildQuadruped(spec()).traverse(n => base.add(n.name))
    const all: QuadrupedExtra[] = [
      'horns', 'antlers', 'tusks', 'snout', 'mane', 'hump',
      'spines', 'shell', 'trunk', 'pouch', 'crest', 'whiskers',
    ]
    for (const e of all) {
      const g = buildQuadruped(spec({ extras: [e] }))
      const boxes = new Map<string, THREE.Box3>()
      const added: { name: string; box: THREE.Box3 }[] = []
      g.traverse(n => {
        if (!(n as THREE.Mesh).isMesh) return
        const b = measure(n)
        boxes.set(n.name, b)
        if (!base.has(n.name)) added.push({ name: n.name, box: b })
      })
      expect(added.length, `extra '${e}' added no mesh`).toBeGreaterThan(0)
      const torso = (boxes.get('body') as THREE.Box3).clone()
        .union(boxes.get('belly') as THREE.Box3)
      const hosts: [string, THREE.Box3][] = [
        ['the torso', torso], ['the head', boxes.get('head') as THREE.Box3],
      ]
      for (const a of added) {
        for (const [label, h] of hosts) {
          expect(h.containsBox(a.box), `${a.name} is buried in ${label}`).toBe(false)
        }
      }
    }
  })

  it('does not let an extra run away with the keep-out radius', () => {
    // pets.ts:652 takes radius from max(width, depth)/2, so a decorative part
    // that doubles either is a part every tree on the island has to make room
    // for. Roster §1's "no bespoke sculpting" is also a size discipline.
    const bare = dims(buildQuadruped(spec()))
    for (const e of ['antlers', 'trunk', 'whiskers', 'shell', 'mane'] as const) {
      const [w, , d] = dims(buildQuadruped(spec({ extras: [e] })))
      expect(w, `${e} width`).toBeLessThan((bare[0] as number) * 1.6)
      expect(d, `${e} depth`).toBeLessThan((bare[2] as number) * 1.6)
    }
  })
})

describe('species read as different animals', () => {
  it('separates a wolf from a fox by more than its palette', () => {
    /*
     * Roster §4 flags eight groups that "will read as duplicates unless size,
     * palette and marking are deliberately separated". Proportion has to carry
     * its share, so the silhouettes must differ before a set is applied.
     *
     * NOT tested as a depth/height ratio, which was the first attempt and is a
     * bad proxy: a fox's bigger head adds height and depth at once and the two
     * cancel, so a wolf and a fox came out 7% apart on a measure that says
     * almost nothing about what a child sees. What a child sees is HOW MUCH
     * DAYLIGHT IS UNDER THE ANIMAL and HOW BIG ITS HEAD IS, so those are what
     * this measures — off the named parts, which is what the names are for.
     */
    const read = (s: QuadrupedBuild): { tall: number; clearance: number; head: number } => {
      const g = buildQuadruped(s)
      const tall = dims(g)[1] as number
      const find = (name: string): THREE.Box3 => {
        let hit: THREE.Object3D | undefined
        g.traverse(n => { if (n.name === name) hit = n })
        if (!hit) throw new Error(`no part named ${name}`)
        return measure(hit)
      }
      return {
        tall,
        clearance: find('body').min.y / tall,
        head: (find('head').max.y - find('head').min.y) / tall,
      }
    }
    const wolf = read(spec({ height: 2.2, body: 1.15, head: 0.95, legs: 1.45 }))
    const fox = read(spec({ height: 1.55, body: 1.05, head: 1.15, legs: 0.75 }))

    expect(Math.abs(wolf.tall - fox.tall)).toBeGreaterThan(0.5)
    // The wolf is long in the leg: a good third of it is daylight.
    expect(wolf.clearance - fox.clearance).toBeGreaterThan(0.1)
    // The fox is the one with the big head.
    expect(fox.head - wolf.head).toBeGreaterThan(0.05)
  })

  it('is deterministic — no Math.random anywhere in the kit', () => {
    const s = spec({ height: 1.93, body: 1.3, head: 0.8, legs: 1.1, ears: 'tufted', tail: 'tuft', extras: ['mane', 'spines'] })
    expect(signature(buildQuadruped(s))).toBe(signature(buildQuadruped(s)))
  })
})

describe('the registry refuses what it cannot build', () => {
  it('throws for every declared-but-unbuilt kit, naming it', () => {
    // `songbird` left this list when PB-036 phase 2 built it and `raptor` when
    // phase 4 built it; the assertions that they no longer throw live at
    // `kit-songbird.test.ts` and `kit-raptor.test.ts`, so the three files still
    // cover the whole of `KitId` between them.
    for (const kit of ['swim', 'minibeast', 'bespoke'] as const) {
      const pending = { kit, height: 1.6, palette: PALETTE } as BuildSpec
      expect(() => buildSpecies(pending)).toThrow(UnbuiltKitError)
      expect(() => buildSpecies(pending)).toThrow(new RegExp(kit))
    }
  })

  it('throws for kenney, which is loaded and never built', () => {
    // Not in BuildSpec, but reachable from JSON — the cast is the point.
    const frozen = { kit: 'kenney', height: 1.6, palette: PALETTE } as unknown as BuildSpec
    expect(() => buildSpecies(frozen)).toThrow(/kenney/)
  })

  it('builds a quadruped through the registry', () => {
    expect(dims(buildSpecies(spec({ height: 1.7 })))[1]).toBeCloseTo(1.7, 6)
  })
})

describe('sets reach a textureless pet', () => {
  const natural: SetPalette = { hue: 0, sat: -1, light: 1 }

  it('leaves the natural set bit-identical', () => {
    // recolour.ts:361-365 and recolour.test.ts:585 hold the atlas-path
    // equivalent: natural has to be provably unchanged, not merely close.
    expect(paletteFor(PALETTE, natural)).toBe(PALETTE)
  })

  it('recolours every authored role and invents none', () => {
    const berry: SetPalette = { hue: 320, sat: 0.7, light: 1 }
    const full = paletteFor(PALETTE, berry)
    expect(full.coat).not.toBe(PALETTE.coat)
    expect(Object.keys(full).sort()).toEqual(['accent', 'belly', 'coat', 'detail'])
    // A species that authored only a coat keeps only a coat: the kit's own
    // fallbacks decide what an absent role looks like, not the set.
    const sparse = paletteFor({ coat: 0x445566 }, berry)
    expect(Object.keys(sparse)).toEqual(['coat'])
  })

  it('keeps the roles apart so a built pet still reads as shaded', () => {
    const sky = paletteFor(PALETTE, { hue: 205, sat: 0.55, light: 1 })
    expect(sky.belly).not.toBe(sky.coat)
    expect(sky.accent).not.toBe(sky.coat)
    // And a built pet takes the colour it was given: every role is in range.
    for (const v of Object.values(sky)) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(0xffffff)
    }
  })

  it('paints a stripy set as a bold two-tone rather than nothing at all', () => {
    const solid = paletteFor(PALETTE, { hue: 120, sat: 0.6, light: 1 })
    const stripy = paletteFor(PALETTE, { hue: 120, sat: 0.6, light: 1, pattern: 'stripy' })
    expect(stripy.coat).not.toBe(solid.coat)
    expect(stripy.belly).not.toBe(stripy.coat)
  })

  it('builds happily from a set palette', () => {
    const dressed = buildQuadruped(spec({ palette: paletteFor(PALETTE, { hue: 45, sat: 0.8, light: 1 }) }))
    expect(dims(dressed)[1]).toBeCloseTo(1.8, 6)
  })
})
