/**
 * The Garden collection, tested against the ROSTER and against the geometry it
 * actually produces.
 *
 * Garden is roster row 1 and ship 1 — the first collection a child meets after
 * the base 24 — so two things have to be true and neither is provable by
 * reading the data file. First, that every record names a species the roster
 * lists and no record invents one (`defineSpecies` throws on an unknown id, and
 * that guard is exercised here rather than assumed). Second, and this is the
 * one that matters, that the thirteen creatures are THIRTEEN DIFFERENT ANIMALS
 * once built.
 *
 * Roster §4 flags toad/frog by name as species that "will read as duplicates
 * unless size, palette and marking are deliberately separated", and this
 * collection contains three more of the same problem the roster does not list:
 * newt/salamander, and the four small brown ground creatures. So the central
 * test here is a full pairwise sweep — no two members may be silhouette twins —
 * plus a measured signature check that catches the case where two records LOOK
 * different in data and build the same creature anyway.
 *
 * No renderer is made and none is needed: the kit builds geometry and this
 * measures it, which is exactly what `pets.ts:650-660` does before it decides a
 * pet's keep-out radius and its shadow.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { GARDEN_SPECIES } from '../../src/island/species/collections/garden'
import { COLLECTIONS, SPECIES_NAMES } from '../../src/island/species/roster'
import { buildSpecies } from '../../src/island/species/kit'
import type { QuadrupedBuild, Species } from '../../src/island/species/types'

/** The roster's own member list for `garden`, all fourteen of them. */
const ROSTERED = (COLLECTIONS.find(c => c.id === 'garden') as { members: readonly string[] }).members

/**
 * Every member with a record, in roster order — all fourteen of them now.
 *
 * It was thirteen for the whole of phases 1-3, and the slow worm was the gap: no
 * kit could express a legless lizard. The ASSEMBLY kit can, and `assembly` is
 * additive rather than a kit swap (§9.2 of `docs/building-animals-from-parts.md`),
 * so its record is here carrying an assembly and no `build` at all — the first
 * such record in the repo.
 */
const BUILT = [
  'animal-hedgehog', 'animal-squirrel', 'animal-mouse', 'animal-mole',
  'animal-badger', 'animal-frog', 'animal-toad', 'animal-tortoise',
  'animal-newt', 'animal-shrew', 'animal-dormouse', 'animal-vole',
  'animal-slow-worm', 'animal-salamander',
]

const quad = (s: Species): QuadrupedBuild => s.build as QuadrupedBuild

const byId = new Map(GARDEN_SPECIES.map(s => [s.id, s]))

/**
 * The thirteen members the QUADRUPED kit builds, which is what most of this file
 * is about.
 *
 * Filtered on the presence of a `build` rather than counted, and every sweep
 * below that reaches into a `QuadrupedBuild` walks this list instead of
 * `GARDEN_SPECIES`. The slow worm has no `build`, so a sweep that included it
 * would read `undefined.ears` — and, worse, `buildSpecies` would be handed
 * nothing and throw, which would look like a broken kit rather than an animal
 * that was never a quadruped. Its own invariants are `assembly-slow-worm.test.ts`
 * and the shared harness in `assembly-assert.ts`.
 */
const QUADRUPEDS: readonly Species[] = GARDEN_SPECIES.filter(s => s.build !== undefined)
const build = (id: string): QuadrupedBuild => quad(byId.get(id) as Species)

const measure = (g: THREE.Object3D): THREE.Box3 => {
  g.updateMatrixWorld(true)
  return new THREE.Box3().setFromObject(g)
}

const dims = (g: THREE.Object3D): [number, number, number] => {
  const b = measure(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

const part = (g: THREE.Object3D, name: string): THREE.Box3 => {
  let hit: THREE.Object3D | undefined
  g.traverse(n => { if (n.name === name) hit = n })
  if (!hit) throw new Error(`no part named ${name}`)
  return measure(hit)
}

const meshNames = (g: THREE.Object3D): string[] => {
  const names: string[] = []
  g.traverse(n => { if ((n as THREE.Mesh).isMesh) names.push(n.name) })
  return names
}

/**
 * Enough of a built creature to tell two of them apart, borrowed from
 * `kit-quadruped.test.ts:59`.
 *
 * Vertex count AND parts AND measurements together, because each alone can
 * collide: two species can share a part list, and the kit fits every creature
 * to exactly `spec.height`, so height alone proves nothing at all.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) verts += (n as THREE.Mesh).geometry.getAttribute('position').count
  })
  return `${verts}|${meshNames(g).sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

const extrasKey = (b: QuadrupedBuild): string => [...(b.extras ?? [])].sort().join('+')

/**
 * Why two species do not read as the same animal — every reason, listed.
 *
 * A pair with an empty list is a silhouette twin and the collection is wrong.
 * The margins are what a child can see at 0.16 scale from the island's
 * three-quarter camera, not what a diff can see: 0.12 on a proportion
 * multiplier is roughly a tenth of the animal, and anything under that is a
 * rounding difference dressed up as differentiation.
 */
const separations = (a: QuadrupedBuild, b: QuadrupedBuild): string[] => {
  const out: string[] = []
  if (a.ears !== b.ears) out.push(`ears ${a.ears}/${b.ears}`)
  if (a.tail !== b.tail) out.push(`tail ${a.tail}/${b.tail}`)
  if (extrasKey(a) !== extrasKey(b)) out.push(`extras [${extrasKey(a)}]/[${extrasKey(b)}]`)
  for (const [field, margin] of [
    ['height', 0.08], ['body', 0.12], ['head', 0.12], ['legs', 0.12],
  ] as const) {
    const gap = Math.abs(a[field] - b[field])
    if (gap >= margin) out.push(`${field} by ${gap.toFixed(2)}`)
  }
  return out
}

const pairs = <T>(xs: readonly T[]): [T, T][] => {
  const out: [T, T][] = []
  for (let i = 0; i < xs.length; i++) {
    for (let j = i + 1; j < xs.length; j++) out.push([xs[i] as T, xs[j] as T])
  }
  return out
}

describe('the Garden collection is exactly what the roster says it is', () => {
  it('holds all fourteen members, in the roster\'s own order', () => {
    expect(GARDEN_SPECIES.map(s => s.id)).toEqual(BUILT)
    // Thirteen on the quadruped kit, one on the assembly kit and nothing else.
    expect(QUADRUPEDS).toHaveLength(13)
  })

  it('invents nothing — every member is a Garden member of the roster', () => {
    for (const s of GARDEN_SPECIES) {
      expect(ROSTERED, `${s.id} is not a rostered Garden species`).toContain(s.id)
      expect(s.collection).toBe('garden')
      // `defineSpecies` takes the printed name from the roster rather than
      // repeating it, so the two can never drift apart.
      expect(s.name).toBe(SPECIES_NAMES[s.id])
    }
  })

  it('LEAVES NOTHING OUT — the slow worm was the gap and it is closed', () => {
    /*
     * This test used to assert `missing` was exactly `['animal-slow-worm']`, and
     * said in its own comment: "the day the bespoke kit lands, this test goes red
     * and someone has to come and delete it rather than quietly leaving the slow
     * worm out forever." This is that day, near enough — it was the ASSEMBLY kit
     * and not the bespoke kit that closed it, and the reasoning is unchanged
     * either way. So the assertion is INVERTED rather than deleted: Garden is
     * complete, and if a member ever goes missing again this says so instead of
     * quietly accepting a fourteenth hole.
     *
     * `legs` is still structural in the quadruped kit and still clamps at 0.25,
     * so there is still no `QuadrupedBuild` for a legless lizard and there is
     * still no `bespoke` kit. The slow worm's geometry comes off the assembly
     * kit, and its record carries `assembly` and no `build`.
     */
    const missing = ROSTERED.filter(id => !byId.has(id))
    expect(missing, 'Garden is complete — no member may be absent').toEqual([])
    expect(byId.get('animal-slow-worm')?.build).toBeUndefined()
    expect(byId.get('animal-slow-worm')?.assembly).toBeDefined()
  })

  it('gives every quadruped member a build the kit will accept', () => {
    for (const s of QUADRUPEDS) {
      expect(s.kit).toBe('quadruped')
      expect(s.build, `${s.id} has no build`).toBeDefined()
      const b = quad(s)
      expect(b.kit).toBe('quadruped')
      // Roster §1's "two or three detail parts" is a budget, not a suggestion.
      expect((b.extras ?? []).length, `${s.id} extras`).toBeLessThanOrEqual(3)
      expect(new Set(b.extras ?? []).size).toBe((b.extras ?? []).length)
    }
  })
})

describe('every Garden species actually builds', () => {
  it('produces a real, non-empty, finite group for all thirteen', () => {
    for (const s of QUADRUPEDS) {
      const g = buildSpecies(quad(s))
      expect(g, s.id).toBeInstanceOf(THREE.Group)
      expect(meshNames(g).length, `${s.id} built no meshes`).toBeGreaterThan(10)
      const box = measure(g)
      expect(box.isEmpty(), `${s.id} measures empty`).toBe(false)
      for (const v of [box.min, box.max]) {
        for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n), s.id).toBe(true)
      }
      // pets.ts:650-660 measures this box for the shadow and the keep-out, so
      // feet on the ground and centred is a contract, not a nicety.
      expect(box.min.y, s.id).toBeCloseTo(0, 6)
      expect(dims(g)[1] as number, s.id).toBeCloseTo(quad(s).height, 6)
    }
  })

  it('wears every part its record asked for', () => {
    // The failure this catches is a record naming an extra the kit builds
    // nothing for — a species whose named detail part is not on screen.
    const WANTS: Readonly<Record<string, string>> = {
      spines: 'spine-1', snout: 'snout', shell: 'shell', crest: 'crest-1',
      whiskers: 'whisker-left-1',
    }
    for (const s of QUADRUPEDS) {
      const names = new Set(meshNames(buildSpecies(quad(s))))
      for (const e of quad(s).extras ?? []) {
        expect(names.has(WANTS[e] as string), `${s.id} asked for ${e}`).toBe(true)
      }
    }
  })

  it('is built as stocky as the pack it has to stand beside', () => {
    /*
     * Roster §1: a new species "must sit beside `animal-fox` without looking
     * like a guest". Measured from the 24 GLBs, the pack's mean width/height is
     * 0.97 and the plain quadrupeds run 0.74 to 0.83. A garden shrew at true
     * anatomical proportions lands nearer 0.4 — a correct animal and a total
     * stranger — and nothing else in this file would catch it, because a slim
     * creature satisfies every other assertion here.
     *
     * The upper bound is 1.35 rather than the kit test's 1.2 because the
     * tortoise is genuinely a wide low dome and that is what a tortoise is.
     */
    for (const s of QUADRUPEDS) {
      const [w, h] = dims(buildSpecies(quad(s)))
      const ratio = (w as number) / (h as number)
      expect(ratio, `${s.id} W/H ${ratio.toFixed(2)}`).toBeGreaterThan(0.55)
      expect(ratio, `${s.id} W/H ${ratio.toFixed(2)}`).toBeLessThan(1.35)
    }
  })

  it('keeps every member inside a walkable keep-out', () => {
    // pets.ts:652 charges LENGTH: radius = max(width, depth) / 2, and that is
    // what keeps a pet out of the trees. The measured pack's own worst is 1.17
    // (the fox, tail included), so nothing in the first collection a child
    // plays with may exceed it.
    for (const s of QUADRUPEDS) {
      const [w, , d] = dims(buildSpecies(quad(s)))
      const radius = Math.max(w as number, d as number) / 2
      expect(radius, `${s.id} keep-out ${radius.toFixed(2)}`).toBeLessThan(1.17)
    }
  })
})

describe('no two Garden species are silhouette twins', () => {
  it('separates every pair on ears, tail, extras or a real proportion margin', () => {
    /*
     * THE CENTRAL TEST OF THIS FILE. Roster §4 demands deliberate
     * differentiation for the confusable groups; this enforces it for the whole
     * collection, because the flagged list is not exhaustive and this collection
     * proves it — newt/salamander are not on it and are the same problem.
     */
    for (const [a, b] of pairs(QUADRUPEDS)) {
      const why = separations(quad(a), quad(b))
      expect(why.length, `${a.id} and ${b.id} are silhouette twins`).toBeGreaterThan(0)
    }
  })

  it('builds thirteen measurably different creatures', () => {
    // The data check above can be satisfied by numbers that build the same
    // shape; this one measures the geometry that comes out. Both are needed.
    const seen = new Map<string, string>()
    for (const s of QUADRUPEDS) {
      const sig = signature(buildSpecies(quad(s)))
      expect(seen.has(sig), `${s.id} builds the same creature as ${seen.get(sig)}`).toBe(false)
      seen.set(sig, s.id)
    }
    expect(seen.size).toBe(13)
  })

  it('gives every member its own coat colour', () => {
    // Palette cannot carry differentiation on its own (roster §4 is explicit),
    // but two species sharing a coat is a copy-paste, not a decision.
    // The slow worm is not counted here and must not be: its four slots are the
    // first ever proposed for it and they are UNREVIEWED, carried on the species
    // file's own `flag` rather than agreed in `garden.ts` like these thirteen.
    const coats = QUADRUPEDS.map(s => quad(s).palette.coat)
    expect(new Set(coats).size).toBe(13)
  })
})

describe('the confusable groups are separated on purpose', () => {
  it('separates the frog from the toad by how it stands, not by its colour', () => {
    /*
     * The pair roster §4 names. They share `none` ears and `none` tail — a frog
     * with an ear would be a lie — so every bit of the separation is carried by
     * proportion, and it is measured here off the built geometry rather than
     * read back out of the record.
     *
     * What a child sees is HOW MUCH DAYLIGHT IS UNDER THE ANIMAL, the same
     * measure `kit-quadruped.test.ts:350-372` uses to hold a wolf off a fox.
     */
    const frog = build('animal-frog')
    const toad = build('animal-toad')
    expect(frog.legs - toad.legs).toBeGreaterThan(0.5)
    expect(frog.height - toad.height).toBeGreaterThan(0.1)

    const clearance = (b: QuadrupedBuild): number => {
      const g = buildSpecies(b)
      return part(g, 'body').min.y / (dims(g)[1] as number)
    }
    expect(clearance(frog) - clearance(toad)).toBeGreaterThan(0.08)

    // And the toad is the squatter of the two: wider for its height.
    const wh = (b: QuadrupedBuild): number => {
      const [w, h] = dims(buildSpecies(b))
      return (w as number) / (h as number)
    }
    expect(wh(toad) - wh(frog)).toBeGreaterThan(0.15)
  })

  it('separates the newt from the salamander, which roster §4 forgot to flag', () => {
    const newt = build('animal-newt')
    const sal = build('animal-salamander')
    // The crest is the newt's and only the newt's — a great crested newt wears
    // exactly that, so the part is honest as well as convenient.
    expect(newt.extras).toContain('crest')
    expect(sal.extras ?? []).not.toContain('crest')
    expect(meshNames(buildSpecies(newt))).toContain('crest-1')
    expect(meshNames(buildSpecies(sal))).not.toContain('crest-1')
    // Plus size, so they are still two animals with the crest covered up.
    expect(sal.height - newt.height).toBeGreaterThan(0.15)
    expect(separations(newt, sal).length).toBeGreaterThan(2)
  })

  it('separates all four small ground creatures on ears and tail', () => {
    /*
     * Mouse, shrew, dormouse and vole: four small brown animals, the hardest
     * job in the collection, and the one place palette provably cannot do the
     * work — a set recolour (`kit.ts paletteFor`) rewrites all four coats onto
     * the same ramp, so any separation that lives only in colour is gone the
     * moment a child unlocks a set.
     *
     * So the separation must survive a recolour, which means it must be shape:
     * every one of the four carries a DIFFERENT ears/tail pair.
     */
    const small = ['animal-mouse', 'animal-shrew', 'animal-dormouse', 'animal-vole']
    const shapes = small.map(id => `${build(id).ears}/${build(id).tail}`)
    expect(new Set(shapes).size, `ears/tail pairs: ${shapes.join(' ')}`).toBe(4)

    for (const [a, b] of pairs(small)) {
      const why = separations(build(a), build(b))
      const shape = why.filter(w => w.startsWith('ears') || w.startsWith('tail'))
      expect(shape.length, `${a} and ${b} differ only as ${why.join(', ')}`).toBeGreaterThan(0)
    }

    // And the mouse keeps the big head that makes it the default small rodent.
    for (const id of ['animal-shrew', 'animal-vole']) {
      expect(build('animal-mouse').head - build(id).head).toBeGreaterThanOrEqual(0.12)
    }
  })
})
