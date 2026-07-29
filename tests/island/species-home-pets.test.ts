/**
 * Home Pets, tested as DATA against the roster and as GEOMETRY against the kit.
 *
 * `kit-quadruped.test.ts` proves the kit builds things `pets.ts` can survive.
 * This file proves that this collection's ten records are the right ten, that
 * each one actually constructs, and — the assertion that matters most on a page
 * with six small brown rodents on it — that no two of them are silhouette
 * twins. Roster §4 flags confusable groups so "the Pet-o-matic veto pass has a
 * checklist"; six rodents in one collection is that problem in its hardest form,
 * so the checklist is executable here rather than written down.
 *
 * The deferred-member test is the other one worth defending. This collection
 * ships PARTIAL by design (four songbirds, a snake and a goldfish need kits that
 * do not exist), and a partial collection is indistinguishable from a forgotten
 * one unless somebody writes down which absences are deliberate. Naming all six
 * and asserting they are absent means a quadruped budgie added "to finish the
 * page" turns the suite red with a message that says why.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { HOME_PETS_SPECIES } from '../../src/island/species/collections/home-pets'
import { collection, SPECIES_NAMES } from '../../src/island/species/roster'
import { buildSpecies } from '../../src/island/species/kit'
import type { QuadrupedBuild, Species } from '../../src/island/species/types'

/** The ten, in the order the collection file writes them. */
const BUILT = [
  'animal-hamster', 'animal-guinea-pig', 'animal-gerbil', 'animal-pony',
  'animal-ferret', 'animal-gecko', 'animal-chinchilla', 'animal-terrapin',
  'animal-rat', 'animal-degu',
]

/**
 * The six the roster lists and this collection does not build, each with the
 * kit it is waiting on. Not a TODO list — a statement that the gap is known.
 */
const DEFERRED: Readonly<Record<string, string>> = {
  'animal-budgie': 'songbird',
  'animal-canary': 'songbird',
  'animal-cockatiel': 'songbird',
  'animal-lovebird': 'songbird',
  'animal-corn-snake': 'bespoke',
  'animal-goldfish': 'swim',
}

/** The six small rodents that share this page and must not share a silhouette. */
const RODENTS = [
  'animal-hamster', 'animal-guinea-pig', 'animal-gerbil',
  'animal-chinchilla', 'animal-rat', 'animal-degu',
]

const byId = new Map(HOME_PETS_SPECIES.map(s => [s.id, s]))

const quad = (s: Species): QuadrupedBuild => {
  const b = s.build
  if (!b || b.kit !== 'quadruped') throw new Error(`${s.id} has no quadruped build`)
  return b
}

const dims = (g: THREE.Object3D): [number, number, number] => {
  g.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

/**
 * Enough of a built group to tell two of them apart — the same idea as
 * `kit-quadruped.test.ts:59`, for the same reason: vertex count alone collides
 * between two part choices, and the height fit means dimensions alone cannot be
 * trusted either. Both together are a real fingerprint.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  const names: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      verts += ((n as THREE.Mesh).geometry.getAttribute('position') as THREE.BufferAttribute).count
      names.push(n.name)
    }
  })
  return `${verts}|${names.sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

/**
 * What counts as a REAL difference in a proportion, not a rounding difference.
 *
 * Set deliberately coarse. Two species 0.02 apart in `body` are the same animal
 * wearing different numbers, and a test that accepted that would pass while the
 * album page filled up with identical brown blobs. These margins are roughly
 * "you could see it standing next to each other".
 */
const MARGIN = { height: 0.10, body: 0.12, head: 0.10, legs: 0.10 } as const

const partsDiffer = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  a.ears !== b.ears ||
  a.tail !== b.tail ||
  [...(a.extras ?? [])].sort().join(',') !== [...(b.extras ?? [])].sort().join(',')

const proportionsDiffer = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  (Object.keys(MARGIN) as (keyof typeof MARGIN)[]).some(
    k => Math.abs(a[k] - b[k]) >= MARGIN[k],
  )

describe('the Home Pets collection, as data', () => {
  it('builds exactly the ten members it claims, in order', () => {
    expect(HOME_PETS_SPECIES.map(s => s.id)).toEqual(BUILT)
  })

  it('takes every printed name from the roster, so the two cannot disagree', () => {
    for (const s of HOME_PETS_SPECIES) expect(s.name).toBe(SPECIES_NAMES[s.id])
  })

  it('files every member under home-pets, and every one is in the roster row', () => {
    const row = collection('home-pets')
    expect(row).toBeDefined()
    for (const s of HOME_PETS_SPECIES) {
      expect(s.collection).toBe('home-pets')
      expect(row?.members).toContain(s.id)
    }
  })

  it('adds nothing the roster row does not list', () => {
    // The invention guard again, from the other side. `defineSpecies` already
    // throws on an id the roster has never heard of; this catches the subtler
    // fault of a real species filed into the wrong collection.
    const members = new Set(collection('home-pets')?.members ?? [])
    expect(HOME_PETS_SPECIES.filter(s => !members.has(s.id))).toEqual([])
  })

  it('leaves the six deferred members OUT, and says which kit each waits on', () => {
    /*
     * The whole point of this test. Home Pets is 16 in the roster and 10 here,
     * and that gap is deliberate: no songbird kit, no swim kit, and roster §1
     * puts a snake in `bespoke` because a legless animal is not a quadruped.
     * If someone adds one of these six as a quadruped to "finish" the page, the
     * failure should be here and loud rather than a budgie on four legs in a
     * child's album.
     */
    for (const [id, kit] of Object.entries(DEFERRED)) {
      expect(byId.has(id), `${id} still needs the ${kit} kit — do not build it as a quadruped`)
        .toBe(false)
    }
    const row = collection('home-pets')
    expect(row?.members).toHaveLength(16)
    expect(HOME_PETS_SPECIES).toHaveLength(16 - Object.keys(DEFERRED).length)
    // Every rostered member is either built or deliberately deferred: no member
    // may be silently unaccounted for.
    for (const id of row?.members ?? []) {
      expect(byId.has(id) || id in DEFERRED, `${id} is neither built nor listed as deferred`)
        .toBe(true)
    }
  })

  it('gives every member a quadruped build and no threat status', () => {
    for (const s of HOME_PETS_SPECIES) {
      expect(s.kit).toBe('quadruped')
      expect(s.build?.kit).toBe('quadruped')
      // Roster §5 wants checkable facts with a date; none of these has been read
      // off the Red List, and an absent status is the honest way to say so.
      expect(s.threat).toBeUndefined()
    }
  })
})

describe('the Home Pets collection, as geometry', () => {
  it('every build actually constructs a real, non-empty group', () => {
    for (const s of HOME_PETS_SPECIES) {
      const g = buildSpecies(quad(s))
      expect(g, s.id).toBeInstanceOf(THREE.Group)
      let meshes = 0
      g.traverse(n => { if ((n as THREE.Mesh).isMesh) meshes++ })
      expect(meshes, `${s.id} built no meshes`).toBeGreaterThan(8)
      const [w, h, d] = dims(g)
      for (const v of [w, h, d]) expect(Number.isFinite(v), s.id).toBe(true)
      expect(h, s.id).toBeCloseTo(quad(s).height, 5)
    }
  })

  it('keeps every member inside the Kenney pack size and a walkable keep-out', () => {
    /*
     * `pets.ts:652` charges LENGTH: the obstacle radius is max(width, depth)/2,
     * and the kit scales the whole rig up until it is `height` tall — so a long
     * low animal built by pushing `body` gets scaled up hardest and ends up with
     * a keep-out it cannot walk between two trees with. The measured pack's own
     * worst is the fox at 1.17 (quadruped.ts:65-68); 1.35 is the backstop here,
     * loose enough for the ferret and the gecko and tight enough to catch a
     * `body` that crept up.
     */
    for (const s of HOME_PETS_SPECIES) {
      const [w, h, d] = dims(buildSpecies(quad(s)))
      expect(h, `${s.id} is outside the measured pack's 1.43-2.02`).toBeGreaterThanOrEqual(1.35)
      expect(h, `${s.id} is taller than the pack — a pony is not a horse`).toBeLessThanOrEqual(2.02)
      expect(Math.max(w, d) / 2, `${s.id} keep-out`).toBeLessThan(1.35)
    }
  })

  it('is stocky rather than anatomically correct, the way the pack is', () => {
    // quadruped.ts:56-74: the measured pack has mean W/H 0.97 and the kit's own
    // reference lands at 0.69. A creature much below that is a correctly
    // proportioned animal and a total stranger beside `animal-fox`.
    for (const s of HOME_PETS_SPECIES) {
      const [w, h] = dims(buildSpecies(quad(s)))
      expect(w / h, `${s.id} is too narrow for this pack`).toBeGreaterThan(0.5)
    }
  })
})

describe('no two Home Pets are silhouette twins', () => {
  it('separates every pair by parts or by a real margin of proportion', () => {
    for (let i = 0; i < HOME_PETS_SPECIES.length; i++) {
      for (let j = i + 1; j < HOME_PETS_SPECIES.length; j++) {
        const a = HOME_PETS_SPECIES[i] as Species
        const b = HOME_PETS_SPECIES[j] as Species
        const qa = quad(a)
        const qb = quad(b)
        expect(
          partsDiffer(qa, qb) || proportionsDiffer(qa, qb),
          `${a.id} and ${b.id} wear the same ears, tail and extras and are within ` +
          `${JSON.stringify(MARGIN)} on every proportion — they will read as one animal`,
        ).toBe(true)
      }
    }
  })

  it('gives the six rodents a distinct ear/tail/extras signature each', () => {
    /*
     * Stricter than the all-pairs rule above, and on purpose. Hamster, guinea
     * pig, gerbil, chinchilla, rat and degu are six small brown rodents on one
     * album page; proportion alone will not carry them at 0.16 scale from the
     * island's three-quarter camera, so each must be separable by a part a child
     * can point at. The tails genuinely differ in life — see the header of
     * `collections/home-pets.ts` — so this costs no honesty.
     *
     * Gerbil and degu share `tuft`, which is true of the real animals; they are
     * separated by the ear, which the parts signature below still catches.
     */
    const seen = new Map<string, string>()
    for (const id of RODENTS) {
      const q = quad(byId.get(id) as Species)
      const sig = `${q.ears}/${q.tail}/${[...(q.extras ?? [])].sort().join('+')}`
      const clash = seen.get(sig)
      expect(clash, `${id} and ${clash} both wear ${sig}`).toBeUndefined()
      seen.set(sig, id)
    }
  })

  it('separates the six rodents pairwise on proportion as well', () => {
    for (let i = 0; i < RODENTS.length; i++) {
      for (let j = i + 1; j < RODENTS.length; j++) {
        const a = RODENTS[i] as string
        const b = RODENTS[j] as string
        expect(
          proportionsDiffer(quad(byId.get(a) as Species), quad(byId.get(b) as Species)),
          `${a} and ${b} are the same size and shape; a part difference alone is ` +
          `too thin a thread for six rodents on one page`,
        ).toBe(true)
      }
    }
  })

  it('builds ten measurably different creatures, not ten recoloured ones', () => {
    // The end-to-end version: palette is excluded from the signature entirely,
    // so this fails if two species differ only in colour. Roster §4's whole
    // point is that colour is not enough.
    const sigs = HOME_PETS_SPECIES.map(s => `${s.id}=${signature(buildSpecies(quad(s)))}`)
    const shapes = sigs.map(s => (s.split('=')[1] as string))
    expect(new Set(shapes).size, sigs.join('\n')).toBe(HOME_PETS_SPECIES.length)
  })
})
