/**
 * Home Pets, tested as DATA against the roster and as GEOMETRY against its kits.
 *
 * `kit-quadruped.test.ts` and `kit-songbird.test.ts` prove the kits build things
 * `pets.ts` can survive. This file proves that this collection's fourteen
 * records are the right fourteen, that each one actually constructs, and — the
 * assertion that matters most on a page carrying six small brown rodents AND
 * four small cage birds — that no two of them are silhouette twins. Roster §4
 * flags confusable groups so "the Pet-o-matic veto pass has a checklist"; this
 * collection is that problem in its hardest form twice over, so the checklist is
 * executable here rather than written down.
 *
 * THE DEFERRED-MEMBER TEST CHANGED SHAPE IN PB-036 PHASE 3 and the change is
 * worth reading. It used to name all six unbuilt members and assert they were
 * absent. Four of the six — the cage birds — are now built on the songbird kit,
 * so a straight deletion of their rows would have thrown away the invariant they
 * were carrying, which was never "these four do not exist" but "no member of
 * this page may resolve to something it is not": not a frozen pack animal, not a
 * kit that does not exist, not a budgie on four legs. That invariant is asserted
 * below in its own right, and the two members that genuinely are still deferred
 * (the corn snake, which roster §1 puts in `bespoke`, and the goldfish, which
 * wants the unbuilt swim kit) keep the original absent-by-design assertion.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { HOME_PETS_SPECIES } from '../../src/island/species/collections/home-pets'
import { collection, SPECIES_NAMES } from '../../src/island/species/roster'
import { BASE_SPECIES } from '../../src/island/species/registry'
import { buildSpecies } from '../../src/island/species/kit'
import type { QuadrupedBuild, SongbirdBuild, Species } from '../../src/island/species/types'

/** The fourteen, in the order the collection file writes them — roster order. */
const BUILT = [
  'animal-hamster', 'animal-guinea-pig', 'animal-budgie', 'animal-gerbil',
  'animal-pony', 'animal-ferret', 'animal-gecko', 'animal-chinchilla',
  'animal-canary', 'animal-cockatiel', 'animal-terrapin', 'animal-rat',
  'animal-lovebird', 'animal-degu',
]

/**
 * The two the roster lists and this collection does not build, each with the
 * kit it is waiting on. Not a TODO list — a statement that the gap is known.
 */
const DEFERRED: Readonly<Record<string, string>> = {
  'animal-corn-snake': 'bespoke',
  'animal-goldfish': 'swim',
}

/** The six small rodents that share this page and must not share a silhouette. */
const RODENTS = [
  'animal-hamster', 'animal-guinea-pig', 'animal-gerbil',
  'animal-chinchilla', 'animal-rat', 'animal-degu',
]

/**
 * The four cage birds — three parrots and a finch, all of them small, all of
 * them on one album page, and all of them in the same game as `animal-parrot`.
 */
const CAGE_BIRDS = [
  'animal-budgie', 'animal-canary', 'animal-cockatiel', 'animal-lovebird',
]

/**
 * `animal-parrot`, the frozen pack's own bird and the SHORTEST of the live 24
 * (`kits/songbird.ts:16-17`). Every cage bird must measure under it: a budgie is
 * not a parrot, and the one lever that says so before colour does is size.
 */
const PACK_PARROT_HEIGHT = 1.55

const byId = new Map(HOME_PETS_SPECIES.map(s => [s.id, s]))

const quad = (s: Species): QuadrupedBuild => {
  const b = s.build
  if (!b || b.kit !== 'quadruped') throw new Error(`${s.id} has no quadruped build`)
  return b
}

const bird = (s: Species): SongbirdBuild => {
  const b = s.build
  if (!b || b.kit !== 'songbird') throw new Error(`${s.id} has no songbird build`)
  return b
}

/** The build every member has, whichever kit it rides. */
const anyBuild = (s: Species): QuadrupedBuild | SongbirdBuild => {
  const b = s.build
  if (!b || (b.kit !== 'quadruped' && b.kit !== 'songbird')) {
    throw new Error(`${s.id} has no build on a kit that exists`)
  }
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

const extrasOf = (b: QuadrupedBuild | SongbirdBuild): string =>
  [...(b.extras ?? [])].sort().join(',')

/**
 * The part signature — what a child can point at. Kit-aware, because the two
 * kits do not wear the same parts: a quadruped is separated by ears and tail, a
 * bird by beak, tail and wings. Two builds on DIFFERENT kits are never the same
 * animal, which is the one comparison that needs no thought.
 */
const partsDiffer = (
  a: QuadrupedBuild | SongbirdBuild,
  b: QuadrupedBuild | SongbirdBuild,
): boolean => {
  if (a.kit !== b.kit) return true
  if (a.kit === 'quadruped' && b.kit === 'quadruped') {
    return a.ears !== b.ears || a.tail !== b.tail || extrasOf(a) !== extrasOf(b)
  }
  const x = a as SongbirdBuild
  const y = b as SongbirdBuild
  return x.beak !== y.beak || x.tail !== y.tail || x.wings !== y.wings ||
    extrasOf(x) !== extrasOf(y)
}

const proportionsDiffer = (
  a: QuadrupedBuild | SongbirdBuild,
  b: QuadrupedBuild | SongbirdBuild,
): boolean =>
  (Object.keys(MARGIN) as (keyof typeof MARGIN)[]).some(
    k => Math.abs(a[k] - b[k]) >= MARGIN[k],
  )

describe('the Home Pets collection, as data', () => {
  it('builds exactly the fourteen members it claims, in roster order', () => {
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

  it('leaves the two deferred members OUT, and says which kit each waits on', () => {
    /*
     * Home Pets is 16 in the roster and 14 here, and that gap is deliberate: no
     * swim kit, and roster §1 puts a snake in `bespoke` because a legless animal
     * is not a quadruped. If someone adds either of these two as a quadruped to
     * "finish" the page, the failure should be here and loud rather than a
     * goldfish on four legs in a child's album.
     *
     * This test used to name six. The four cage birds left it by being BUILT, on
     * the kit they were always waiting for — which is the only honest way off
     * this list.
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

  it('never resolves a member to a frozen pack animal or to an unbuilt kit', () => {
    /*
     * THE INVARIANT THE DEFERRED LIST WAS REALLY CARRYING, now asserted in its
     * own right so it survives members leaving that list.
     *
     * Two failures it catches. The first: a member of this page silently
     * becoming one of the frozen 24 — roster §1 freezes `animal-beaver …
     * animal-tiger` and `registry.ts:41-51` says a kit may never touch them, so
     * a Home Pets record sharing an id with one would either be an invention or
     * a restyle of an animal Juno already owns. The second, and the one that was
     * live while the birds were unbuilt: a record claiming a kit that does not
     * exist, or claiming one kit in `Species.kit` and another in `build.kit`,
     * which `buildSpecies` would resolve to the WRONG BUILDER — a budgie on four
     * legs is exactly that fault.
     */
    const frozen = new Set(BASE_SPECIES.map(s => s.id))
    for (const s of HOME_PETS_SPECIES) {
      expect(frozen.has(s.id), `${s.id} is one of the frozen 24 — it may never be rebuilt`)
        .toBe(false)
      expect(['quadruped', 'songbird'], `${s.id} rides a kit that is not built`).toContain(s.kit)
      expect(s.build?.kit, `${s.id} declares ${s.kit} and builds ${s.build?.kit}`).toBe(s.kit)
    }
  })

  it('puts every cage bird on the songbird kit and every other member on the quadruped', () => {
    for (const s of HOME_PETS_SPECIES) {
      const want = CAGE_BIRDS.includes(s.id) ? 'songbird' : 'quadruped'
      expect(s.kit, `${s.id} should be a ${want}`).toBe(want)
    }
    expect(HOME_PETS_SPECIES.filter(s => s.kit === 'songbird').map(s => s.id)).toEqual(CAGE_BIRDS)
  })

  it('gives every member a build and no threat status', () => {
    for (const s of HOME_PETS_SPECIES) {
      expect(() => anyBuild(s), s.id).not.toThrow()
      // Roster §5 wants checkable facts with a date; none of these has been read
      // off the Red List, and an absent status is the honest way to say so.
      expect(s.threat).toBeUndefined()
    }
  })
})

describe('the Home Pets collection, as geometry', () => {
  it('every build actually constructs a real, non-empty group', () => {
    for (const s of HOME_PETS_SPECIES) {
      const g = buildSpecies(anyBuild(s))
      expect(g, s.id).toBeInstanceOf(THREE.Group)
      let meshes = 0
      g.traverse(n => { if ((n as THREE.Mesh).isMesh) meshes++ })
      expect(meshes, `${s.id} built no meshes`).toBeGreaterThan(8)
      const [w, h, d] = dims(g)
      for (const v of [w, h, d]) expect(Number.isFinite(v), s.id).toBe(true)
      expect(h, s.id).toBeCloseTo(anyBuild(s).height, 5)
    }
  })

  it('keeps every cage bird smaller than the pack\'s own parrot', () => {
    /*
     * The size half of the anti-parrot separation, measured rather than
     * declared. `animal-parrot` is frozen, 1.55 tall and the shortest of the
     * live 24; three of these four ARE parrots and would read as it if they were
     * built at its size. 1.2 is the songbird kit's own floor (`types.ts:151`) and
     * the point below which a bird stops sitting beside the pack at all.
     */
    for (const id of CAGE_BIRDS) {
      const [, h] = dims(buildSpecies(bird(byId.get(id) as Species)))
      expect(h, `${id} is as big as the frozen parrot`).toBeLessThan(PACK_PARROT_HEIGHT)
      expect(h, `${id} is below the kit's family floor`).toBeGreaterThanOrEqual(1.2)
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
     *
     * THE FLOOR IS PER KIT and the birds' is lower on purpose: the quadrupeds
     * are held to 1.35 because a mammal below that is not in the pack's family,
     * but the pack's own bird is its SHORTEST member and a canary is smaller
     * again. `types.ts:151` puts the songbird family range at 1.2 up, so that is
     * the bar the four are held to. The keep-out ceiling is shared, because a
     * keep-out is about the island and not about the animal.
     */
    for (const s of HOME_PETS_SPECIES) {
      const [w, h, d] = dims(buildSpecies(anyBuild(s)))
      const floor = s.kit === 'songbird' ? 1.2 : 1.35
      expect(h, `${s.id} is below its kit's family floor of ${floor}`).toBeGreaterThanOrEqual(floor)
      expect(h, `${s.id} is taller than the pack — a pony is not a horse`).toBeLessThanOrEqual(2.02)
      expect(Math.max(w, d) / 2, `${s.id} keep-out`).toBeLessThan(1.35)
    }
  })

  it('is stocky rather than anatomically correct, the way the pack is', () => {
    // quadruped.ts:56-74: the measured pack has mean W/H 0.97 and the kit's own
    // reference lands at 0.69. A creature much below that is a correctly
    // proportioned animal and a total stranger beside `animal-fox`. The birds
    // are held to the same floor and it is the assertion they are nearest to:
    // a long tail or a big head raises the raw silhouette, which lowers the
    // uniform fit scale and NARROWS the finished bird — see the lovebird.
    for (const s of HOME_PETS_SPECIES) {
      const [w, h] = dims(buildSpecies(anyBuild(s)))
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
        const qa = anyBuild(a)
        const qb = anyBuild(b)
        expect(
          partsDiffer(qa, qb) || proportionsDiffer(qa, qb),
          `${a.id} and ${b.id} wear the same parts and are within ` +
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

  it('builds fourteen measurably different creatures, not fourteen recoloured ones', () => {
    // The end-to-end version: palette is excluded from the signature entirely,
    // so this fails if two species differ only in colour. Roster §4's whole
    // point is that colour is not enough.
    const sigs = HOME_PETS_SPECIES.map(s => `${s.id}=${signature(buildSpecies(anyBuild(s)))}`)
    const shapes = sigs.map(s => (s.split('=')[1] as string))
    expect(new Set(shapes).size, sigs.join('\n')).toBe(HOME_PETS_SPECIES.length)
  })
})

describe('the four cage birds are four birds', () => {
  /*
   * The bird half of roster §4, and the reason this collection was the hard one
   * in PB-036 phase 3. Budgie, canary, cockatiel and lovebird are four small
   * perching birds on one album page — three of them parrots — and `types.ts`
   * withholds the one part that would have separated the parrots from the finch
   * for free, the hooked beak, because the raptor kit owns it. So the separation
   * is spent on the axes that remain and every one of them is asserted, because
   * a child who hatches a budgie and then a lovebird must see two animals.
   */
  const birds = CAGE_BIRDS.map(id => byId.get(id) as Species)

  it('gives each one a distinct beak, tail, wings and extras signature', () => {
    const seen = new Map<string, string>()
    for (const s of birds) {
      const b = bird(s)
      const sig = `${b.beak}/${b.tail}/${b.wings}/${extrasOf(b)}`
      const clash = seen.get(sig)
      expect(clash, `${s.id} and ${clash} both wear ${sig}`).toBeUndefined()
      seen.set(sig, s.id)
    }
  })

  it('gives no two of them the same tail, the same wings or the same extras', () => {
    /*
     * Stricter than the signature above, which a single shared axis would still
     * pass. At 0.16 scale from the island's three-quarter camera the tail is the
     * loudest thing on a small bird, so no two may share one — and the same goes
     * for the wing and for the marking. The BEAK is deliberately exempt: three
     * of the four are parrots and share `'stout'`, which is honest.
     */
    for (const axis of ['tail', 'wings'] as const) {
      const seen = new Map<string, string>()
      for (const s of birds) {
        const v = bird(s)[axis]
        expect(seen.get(v), `${s.id} and ${seen.get(v)} both wear ${axis} '${v}'`).toBeUndefined()
        seen.set(v, s.id)
      }
    }
    const marks = new Map<string, string>()
    for (const s of birds) {
      const e = extrasOf(bird(s))
      expect(marks.get(e), `${s.id} and ${marks.get(e)} wear the same markings`).toBeUndefined()
      marks.set(e, s.id)
    }
  })

  it('separates every pair on proportion as well, not on parts alone', () => {
    for (let i = 0; i < birds.length; i++) {
      for (let j = i + 1; j < birds.length; j++) {
        const a = birds[i] as Species
        const b = birds[j] as Species
        expect(
          proportionsDiffer(bird(a), bird(b)),
          `${a.id} and ${b.id} are the same size and shape; a part difference alone ` +
          `is too thin a thread for four cage birds on one page`,
        ).toBe(true)
      }
    }
  })

  it('measures four different birds — keep-out, height and W/H all told apart', () => {
    /*
     * The same fingerprint `species-silhouette.test.ts` takes across every
     * shipped species, run here on the four alone so a collision inside this
     * group is reported as a bird problem rather than as a registry problem.
     */
    const seen = new Map<string, string>()
    const lines: string[] = []
    for (const s of birds) {
      const [w, h, d] = dims(buildSpecies(bird(s)))
      const key = [(Math.max(w, d) / 2).toFixed(3), h.toFixed(3), (w / h).toFixed(3)].join('|')
      lines.push(`${s.id} ${key}`)
      expect(seen.get(key), `${s.id} and ${seen.get(key)} measure identically`).toBeUndefined()
      seen.set(key, s.id)
    }
    expect(seen.size, lines.join('\n')).toBe(birds.length)
  })

  it('costs the collection nothing on keep-out — the ferret is still the widest', () => {
    /*
     * `species-silhouette.test.ts:88-93` ratchets Home Pets at 1.28, which the
     * ferret holds. Cage birds should be nowhere near it, and the assertion is
     * here rather than assumed because the budgie's `'long'` tail is swept up
     * and BACK and depth is exactly what the keep-out charges for.
     */
    const keepOut = (s: Species): number => {
      const [w, , d] = dims(buildSpecies(anyBuild(s)))
      return Math.max(w, d) / 2
    }
    const ferret = keepOut(byId.get('animal-ferret') as Species)
    for (const s of birds) {
      expect(keepOut(s), `${s.id} keep-out`).toBeLessThan(1.0)
      expect(keepOut(s), `${s.id} is wider than the ferret`).toBeLessThan(ferret)
    }
  })
})
