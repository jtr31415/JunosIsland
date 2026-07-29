/**
 * Africa — the collection, tested as DATA and as GEOMETRY.
 *
 * PB-036 phase 2. Two failures are worth a suite of their own here, and they are
 * the two this file is built around.
 *
 * THE FIRST is the half-filled collection. Africa ships thirteen of its sixteen
 * rostered members because three of them — crocodile, ostrich, vulture — are not
 * quadrupeds and the kits they want are declared but unbuilt (`types.ts:159`).
 * That is a ruling, and rulings rot: the next person to open `africa.ts` sees a
 * roster of sixteen and a file of thirteen and "finishes" it by improvising a
 * shape, which is exactly what roster §1's "kits before species" forbids. So the
 * three absences are asserted BY NAME, with the reason, rather than left as a
 * count that happens to be right.
 *
 * THE SECOND is the silhouette twin. Roster §4: distinct species "will read as
 * duplicates unless size, palette and marking are deliberately separated". A
 * collection of thirteen African animals built from one kit is where that goes
 * wrong first — two antelope-shaped things with different hex codes are one
 * animal as far as a child is concerned. So every PAIR is checked, twice: once
 * against the data (something in ears / tail / extras / a proportion must really
 * differ) and once against the built geometry (no two produce the same measured
 * signature). The data check says the separation was intended; the geometry
 * check says it survived the kit.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { AFRICA_SPECIES } from '../../src/island/species/collections/africa'
import { buildSpecies } from '../../src/island/species/kit'
import { COLLECTIONS, SPECIES_NAMES } from '../../src/island/species/roster'
import type { QuadrupedBuild, Species } from '../../src/island/species/types'

/** The thirteen that ship, in the roster's own order for `africa`. */
const BUILT = [
  'animal-zebra', 'animal-hippo', 'animal-cheetah', 'animal-meerkat',
  'animal-warthog', 'animal-gorilla', 'animal-antelope', 'animal-mongoose',
  'animal-hyena', 'animal-baboon', 'animal-wildebeest', 'animal-buffalo',
  'animal-aardvark',
]

/**
 * The three the quadruped kit cannot honestly express, with the kit each wants.
 *
 * Kept as data rather than as prose in a comment so the test can print the
 * reason when it fails, which is the moment anyone reads it.
 */
const NOT_BUILT: readonly [string, string][] = [
  ['animal-crocodile', 'a sprawled, long-jawed reptile — wants bespoke'],
  ['animal-ostrich', 'two legs and a neck longer than its body — wants songbird/bespoke'],
  ['animal-vulture', 'hooked beak, broad wings, tail fan — wants raptor'],
]

const byId: ReadonlyMap<string, Species> = new Map(AFRICA_SPECIES.map(s => [s.id, s]))

/** The build, narrowed. Every member of this collection is a quadruped. */
const quad = (id: string): QuadrupedBuild => {
  const s = byId.get(id)
  if (!s) throw new Error(`africa has no ${id}`)
  const b = s.build
  if (!b || b.kit !== 'quadruped') throw new Error(`${id} is not a quadruped build`)
  return b
}

const measure = (g: THREE.Object3D): THREE.Box3 => {
  g.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(g)
}

const dims = (g: THREE.Object3D): [number, number, number] => {
  const b = measure(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

/**
 * Enough of a built group to tell two of them apart, `kit-quadruped.test.ts:59`.
 *
 * Vertex count AND part names AND measurements, because none alone is enough:
 * two ear shapes can share a vertex count, and every creature is fitted to
 * exactly `spec.height` so height alone proves nothing at all.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  const names: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      verts += (n as THREE.Mesh).geometry.getAttribute('position').count
      names.push(n.name)
    }
  })
  return `${verts}|${names.sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

const meshCount = (g: THREE.Object3D): number => {
  let n = 0
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) n += 1 })
  return n
}

describe('the Africa collection is exactly the roster, minus the three it cannot build', () => {
  const rostered = COLLECTIONS.find(c => c.id === 'africa')

  it('is a collection the roster actually declares', () => {
    expect(rostered).toBeDefined()
    expect(rostered?.members).toHaveLength(16)
  })

  it('ships thirteen members, in the roster order for africa', () => {
    expect(AFRICA_SPECIES.map(s => s.id)).toEqual(BUILT)
    const order = (rostered?.members ?? []).filter(id => BUILT.includes(id))
    expect(AFRICA_SPECIES.map(s => s.id)).toEqual(order)
  })

  it('invents nothing — every member is in the roster and in this collection', () => {
    for (const s of AFRICA_SPECIES) {
      expect(rostered?.members).toContain(s.id)
      expect(s.collection).toBe('africa')
      // defineSpecies takes the printed name from the roster, so this can only
      // fail if someone hand-wrote a record instead of calling the guard.
      expect(s.name).toBe(SPECIES_NAMES[s.id])
    }
  })

  it('LEAVES OUT crocodile, ostrich and vulture — not an oversight, a ruling', () => {
    /*
     * Delete this test only by BUILDING the kit each of these wants. If it ever
     * goes red because one of them appeared in `africa.ts`, the question is not
     * "why is the test failing" — it is "what shape did someone improvise for a
     * crocodile out of a kit whose legs stand under the body". Roster §1 rules
     * that improvisation out; `types.ts:155-157` records what it costs.
     */
    for (const [id, why] of NOT_BUILT) {
      expect(rostered?.members, `${id} should still be rostered`).toContain(id)
      expect(byId.has(id), `${id} must stay unbuilt: ${why}`).toBe(false)
    }
    expect(AFRICA_SPECIES).toHaveLength(16 - NOT_BUILT.length)
  })

  it('carries a quadruped build on every member and a threat status on none', () => {
    for (const s of AFRICA_SPECIES) {
      expect(s.kit).toBe('quadruped')
      expect(s.build?.kit).toBe('quadruped')
      // Roster §5 wants statuses "true, checkable" and `Threat.checkedDate`
      // exists so one is a dated reading rather than a memory. Absent is honest;
      // remembered only looks checked. registry.ts:55-76.
      expect(s.threat).toBeUndefined()
    }
  })
})

describe('every Africa species actually constructs', () => {
  it('builds a real, non-empty, finite group for all thirteen', () => {
    for (const s of AFRICA_SPECIES) {
      const g = buildSpecies(s.build as QuadrupedBuild)
      expect(g, s.id).toBeInstanceOf(THREE.Group)
      expect(meshCount(g), `${s.id} built no meshes`).toBeGreaterThan(10)
      const box = measure(g)
      expect(box.isEmpty(), `${s.id} has empty bounds`).toBe(false)
      for (const v of [box.min, box.max]) {
        for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n), s.id).toBe(true)
      }
      // pets.ts:650-660 measures this same box for the shadow and the keep-out.
      expect(box.min.y, `${s.id} floats or sinks`).toBeCloseTo(0, 6)
      expect(dims(g)[1], `${s.id} height`).toBeCloseTo((s.build as QuadrupedBuild).height, 6)
    }
  })

  it('stands every one of them beside animal-fox without looking like a guest', () => {
    /*
     * Roster §1's one hard aesthetic rule, measured three ways off the pack
     * itself (all 24 GLBs walked, see quadruped.ts REF): the pack is 1.43-2.02
     * tall, mean width/height 0.97, and its worst keep-out radius is 1.17.
     *
     * The stocky bound is the one that matters. A cheetah at true anatomical
     * proportions is a correct animal and a total stranger here — the kit's own
     * first pass built at W/H 0.37 and passed every other check.
     */
    for (const s of AFRICA_SPECIES) {
      const [w, h, d] = dims(buildSpecies(s.build as QuadrupedBuild))
      expect(h, `${s.id} too short for the pack`).toBeGreaterThan(1.39)
      expect(h, `${s.id} too tall for the pack`).toBeLessThan(2.21)
      expect((w as number) / (h as number), `${s.id} is too slim`).toBeGreaterThan(0.55)
      expect((w as number) / (h as number), `${s.id} is too wide`).toBeLessThan(1.2)
      expect(Math.max(w as number, d as number) / 2, `${s.id} keep-out`).toBeLessThan(1.6)
    }
  })
})

describe('no two Africa species are silhouette twins', () => {
  /**
   * A margin that a child could see, per field.
   *
   * Not one global epsilon: `height` is absolute in Kenney units and the whole
   * collection lives inside 0.7 of them, whereas `legs` is a multiplier where
   * 0.60 and 1.20 are different animals. So each field states its own.
   */
  const MARGIN: Readonly<Record<'height' | 'body' | 'head' | 'legs', number>> = {
    height: 0.20, body: 0.15, head: 0.15, legs: 0.25,
  }

  const extrasOf = (b: QuadrupedBuild): string => [...(b.extras ?? [])].sort().join('+')

  it('separates every pair on ears, tail, extras or a real proportion margin', () => {
    for (const [i, a] of BUILT.entries()) {
      for (const b of BUILT.slice(i + 1)) {
        const x = quad(a)
        const y = quad(b)
        const reasons: string[] = []
        if (x.ears !== y.ears) reasons.push(`ears ${x.ears}/${y.ears}`)
        if (x.tail !== y.tail) reasons.push(`tail ${x.tail}/${y.tail}`)
        if (extrasOf(x) !== extrasOf(y)) reasons.push(`extras ${extrasOf(x)}/${extrasOf(y)}`)
        for (const f of ['height', 'body', 'head', 'legs'] as const) {
          if (Math.abs(x[f] - y[f]) >= MARGIN[f]) reasons.push(`${f} ${x[f]}/${y[f]}`)
        }
        expect(reasons, `${a} and ${b} are the same animal`).not.toHaveLength(0)
      }
    }
  })

  it('produces thirteen distinguishable built silhouettes', () => {
    // The data check above says the separation was INTENDED. This one says it
    // survived the kit — a difference the builder collapses (two extras that
    // land in the same place, a proportion inside a clamp) is a difference that
    // does not exist on screen.
    const seen = new Map<string, string>()
    for (const s of AFRICA_SPECIES) {
      const sig = signature(buildSpecies(s.build as QuadrupedBuild))
      expect(seen.has(sig), `${s.id} builds identically to ${seen.get(sig)}`).toBe(false)
      seen.set(sig, s.id)
    }
    expect(seen.size).toBe(13)
  })

  it('gives every species its own palette', () => {
    const seen = new Map<string, string>()
    for (const s of AFRICA_SPECIES) {
      const p = (s.build as QuadrupedBuild).palette
      const key = [p.coat, p.belly, p.detail, p.accent].join(',')
      expect(seen.has(key), `${s.id} is painted like ${seen.get(key)}`).toBe(false)
      seen.set(key, s.id)
      // Kenney palette language: flat, bright, real-animal. Nothing neon —
      // a channel pinned at 0xff on a coat is a highlighter, not a hide.
      for (const c of [p.coat, p.belly, p.detail, p.accent]) {
        expect(c, `${s.id} colour`).toBeGreaterThanOrEqual(0)
        expect(c, `${s.id} colour`).toBeLessThanOrEqual(0xffffff)
      }
    }
  })
})

/*
 * The named confusable groups. Each of these exists because two records could
 * quietly drift back together in a future edit and nothing else in the suite
 * would notice — the generic pair check above only demands SOME difference, and
 * these demand the RIGHT one, in the direction the animal actually differs.
 */
describe('confusable: wildebeest and buffalo are both large horned bovines', () => {
  const gnu = quad('animal-wildebeest')
  const buf = quad('animal-buffalo')

  it('separates them on size — the buffalo is the wall, the wildebeest is the runner', () => {
    expect(buf.height).toBeGreaterThan(gnu.height)
    // Half a reference leg apart. This is the one a child sees from across the
    // island: how much daylight is under the animal.
    expect(gnu.legs - buf.legs).toBeGreaterThanOrEqual(0.4)
    expect(buf.head).toBeGreaterThan(gnu.head)
  })

  it("separates them on how the same 'horns' part reads", () => {
    // Both wear the kit's one horn part; what changes its read is what else is
    // on the head. The wildebeest's horns sit among pointed ears and a mane; the
    // buffalo's are alone above round ears, so they read as a heavy boss.
    expect(gnu.extras).toContain('horns')
    expect(buf.extras).toContain('horns')
    expect(gnu.ears).not.toBe(buf.ears)
    expect(gnu.extras).toContain('mane')
    expect(buf.extras).not.toContain('mane')
    expect((buf.extras ?? []).length).toBeLessThan((gnu.extras ?? []).length)
  })

  it('separates them on palette — slate grey against warm brown-black', () => {
    expect(gnu.palette.coat).not.toBe(buf.palette.coat)
    const blue = (c: number): number => (c & 0xff) - ((c >> 16) & 0xff)
    // The gnu is cool (blue >= red), the buffalo is warm (red > blue).
    expect(blue(gnu.palette.coat)).toBeGreaterThan(blue(buf.palette.coat))
  })
})

describe('confusable: meerkat and mongoose are close cousins in the same build', () => {
  const meer = quad('animal-meerkat')
  const mon = quad('animal-mongoose')

  it('makes the meerkat smaller, paler and uprighter, all three', () => {
    expect(meer.height).toBeLessThan(mon.height)
    // Paler: a brighter coat and a brighter belly, not one or the other.
    expect(meer.palette.coat).toBeGreaterThan(mon.palette.coat)
    expect(meer.palette.belly as number).toBeGreaterThan(mon.palette.belly as number)
    // Uprighter: short trunk carried high, against long trunk carried low.
    expect(meer.body).toBeLessThan(mon.body)
    expect(meer.legs).toBeGreaterThan(mon.legs)
    expect(mon.body - meer.body).toBeGreaterThanOrEqual(0.4)
    expect(meer.legs - mon.legs).toBeGreaterThanOrEqual(0.4)
  })

  it('gives them different tails, which is what a child sees first', () => {
    expect(meer.tail).toBe('thin')
    expect(mon.tail).toBe('bushy')
  })
})

describe('confusable: the cheetah must not read as the frozen tiger or lion', () => {
  const cat = quad('animal-cheetah')

  it('is leggier and lighter than any big cat this pack already has', () => {
    // The live 24 are FROZEN (roster §1), so every bit of the separation is on
    // this side. Leggiest in the collection, and effectively the smallest skull
    // in it — the antelope is the only thing with a smaller head, by 0.08.
    const legs = BUILT.map(id => quad(id).legs)
    const heads = BUILT.map(id => quad(id).head)
    expect(cat.legs).toBe(Math.max(...legs))
    expect(cat.head).toBeLessThanOrEqual(Math.min(...heads) + 0.1)
    // A lion's read is the maned head; the cheetah must never borrow it.
    expect(cat.extras ?? []).not.toContain('mane')
    expect(cat.tail).not.toBe('tuft')
  })

  it('carries its spots in the PALETTE, because the kit has no spot geometry', () => {
    /*
     * The trap this test exists for: someone reads "spotted", finds no spot in
     * `QuadrupedExtra`, and adds one. The list is closed (`types.ts:142`) and
     * that is the point — the marking is a bright coat against near-black points,
     * which is what the spots do at three metres anyway.
     */
    const p = cat.palette
    const lum = (c: number): number =>
      0.2126 * ((c >> 16) & 255) + 0.7152 * ((c >> 8) & 255) + 0.0722 * (c & 255)
    expect(lum(p.coat)).toBeGreaterThan(120)
    expect(lum(p.detail as number)).toBeLessThan(60)
    expect(lum(p.accent as number)).toBeLessThan(60)
  })
})

describe('confusable: gorilla and baboon are both apes out of one kit', () => {
  const gor = quad('animal-gorilla')
  const bab = quad('animal-baboon')

  it('gives the ape face to the gorilla and the dog face to the baboon', () => {
    // `snout` (quadruped.ts:481) is a long two-box muzzle. That IS a baboon and
    // it is emphatically not a gorilla, so it may only ever be on one of them.
    expect(bab.extras).toContain('snout')
    expect(gor.extras ?? []).not.toContain('snout')
    expect(gor.head).toBeGreaterThan(bab.head)
  })

  it('uses mane and tail as the other two levers', () => {
    expect(bab.extras).toContain('mane')
    expect(gor.extras ?? []).not.toContain('mane')
    // No great ape has a tail. Cheapest, loudest separation available.
    expect(gor.tail).toBe('none')
    expect(bab.tail).not.toBe('none')
  })

  it('sits the gorilla lower and heavier', () => {
    expect(gor.legs).toBeLessThan(bab.legs)
    expect(gor.height).toBeGreaterThan(bab.height)
    expect(gor.body).toBeLessThan(bab.body)
  })
})

describe('confusable: the warthog must not read as the frozen animal-hog', () => {
  const hog = quad('animal-warthog')

  it('wears tusks, as briefed', () => {
    expect(hog.extras).toContain('tusks')
  })

  it('is the long-legged, big-headed, aerial-tailed pig', () => {
    /*
     * `animal-hog` is already the wild boar and is frozen. A boar is a low,
     * heavy, short-legged wedge, so the warthog takes the opposite of each: a
     * whole reference leg under it, an oversized skull, and the one tail in the
     * kit that is literally its antenna — a bare stalk with a brush on the end.
     */
    expect(hog.legs).toBeGreaterThanOrEqual(1)
    expect(hog.head).toBeGreaterThan(1)
    expect(hog.tail).toBe('tuft')
    expect(hog.extras).toContain('mane')
  })
})

describe('confusable: the aardvark leans on snout, and the hippo on the height clamp', () => {
  it('gives the aardvark the kit part its face is made of', () => {
    const ard = quad('animal-aardvark')
    expect(ard.extras).toContain('snout')
    // The other long-eared animal here is the antelope, and it is the opposite
    // creature — tall, leggy, stub-tailed.
    const ant = quad('animal-antelope')
    expect(ard.ears).toBe('long')
    expect(ant.ears).toBe('long')
    expect(ant.legs - ard.legs).toBeGreaterThan(1)
    expect(ard.tail).not.toBe(ant.tail)
  })

  it('keeps the hippo inside the clamp and beside animal-fox', () => {
    /*
     * The clamp is 1.2-2.6 (quadruped.ts LIMIT) but the measured pack is
     * 1.43-2.02, so a hippo written at 2.6 would be clamped to nothing and still
     * be a guest. It is 2.2 and it says "big" with mass instead: the shortest
     * legs and the largest head in the collection, on the deepest body.
     */
    const hip = quad('animal-hippo')
    expect(hip.height).toBeLessThanOrEqual(2.2)
    expect(hip.height).toBe(Math.max(...BUILT.map(id => quad(id).height)))
    expect(hip.legs).toBe(Math.min(...BUILT.map(id => quad(id).legs)))
    expect(hip.head).toBe(Math.max(...BUILT.map(id => quad(id).head)))
    // Short body = deep body: the kit trades length for girth at constant volume.
    expect(hip.body).toBeLessThan(0.9)
    expect(hip.ears).toBe('none')

    // And it still measures like a member of the pack, not a monument.
    const fox = 1.69 // animal-fox, measured — quadruped.ts REF.
    const [, h] = dims(buildSpecies(byId.get('animal-hippo')?.build as QuadrupedBuild))
    expect((h as number) / fox).toBeLessThan(1.4)
  })
})

describe('the collection is deterministic', () => {
  it('builds the same geometry twice — no Math.random reaches a species record', () => {
    for (const s of AFRICA_SPECIES) {
      const a = signature(buildSpecies(s.build as QuadrupedBuild))
      const b = signature(buildSpecies(s.build as QuadrupedBuild))
      expect(a, s.id).toBe(b)
    }
  })

  it('names no node wing-, and sets userData.pick on nothing', () => {
    // pets.ts:690 collects flap targets with /^wing-/; pets.ts:663 owns pick.
    for (const s of AFRICA_SPECIES) {
      buildSpecies(s.build as QuadrupedBuild).traverse(n => {
        expect(/^wing-/.test(n.name), s.id).toBe(false)
        expect(n.userData.pick, s.id).toBeUndefined()
      })
    }
  })
})
