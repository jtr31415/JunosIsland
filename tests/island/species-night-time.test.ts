/**
 * Night Time — the collection, as opposed to its sixteen animals.
 *
 * Each species has its own `assembly-<id>.test.ts` carrying the numbers only it
 * can defend, plus the shared harness in `assembly-assert.ts`. **This file is
 * for the claims that are only true of the SET**, and there are four kinds:
 *
 *   1. the collection is exactly the roster, all sixteen of it since 6 August
 *      2026 — and the shapes the last three were once blocked on are still
 *      measured rather than remembered, in both directions;
 *   2. **nothing here goes through a kit** — Joe's 2 August ruling, asserted
 *      rather than assumed, because this is the first collection built that way
 *      and the thing most likely to be quietly undone is a `build` reappearing;
 *   3. no two members are silhouette twins, which matters more here than in any
 *      collection so far — Night Time holds three big-eyed nocturnal primates,
 *      two long-tailed climbers and two glowing beetles, and if any pair
 *      collapses into one animal the collection is smaller than it says;
 *   4. the whole thing is deterministic.
 *
 * WHY THE ABSENCES ARE WRITTEN AS MEASUREMENTS. `species-africa.test.ts` is the
 * precedent and the reasoning is worth repeating: a sentence saying "the bank
 * has no wing" rots the day somebody bakes one. A test that COUNTS the wing
 * shapes goes red at exactly that moment and tells the reader the ruling can be
 * reopened. That is the only moment anybody should reopen it.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { NIGHT_TIME_SPECIES } from '../../src/island/species/collections/night-time'
import { buildAssembled } from '../../src/island/species/parts'
import { PARTS_BANK, type PartRole } from '../../src/island/species/parts/bank.generated'
import { COLLECTIONS, SPECIES_NAMES } from '../../src/island/species/roster'
import type { Species } from '../../src/island/species/types'

/**
 * All SIXTEEN, in the roster's own order for `night-time`.
 *
 * It was thirteen until 6 August 2026, when `animal-bat`, `animal-sugar-glider`
 * and `animal-scorpion` were built — the last three unbuilt animals anywhere in
 * the roster. The `NOT_BUILT` table that used to sit under this one is gone, and
 * `LAST_THREE` below is what replaced it: the same three ids, still carrying the
 * shape each one wanted, but asserted PRESENT rather than absent.
 */
const BUILT = [
  'animal-bat', 'animal-raccoon', 'animal-wolf', 'animal-firefly',
  'animal-opossum', 'animal-sugar-glider', 'animal-nightjar', 'animal-tarsier',
  'animal-bushbaby', 'animal-scorpion', 'animal-fennec-fox', 'animal-civet',
  'animal-aye-aye', 'animal-kiwi', 'animal-kinkajou', 'animal-glow-worm',
]

/**
 * The three that were held out, and what each of them actually wears now.
 *
 * Data rather than prose in a comment, for the reason the old `NOT_BUILT` table
 * gave: the test prints the reason at the moment anybody reads it, which is the
 * moment it fails.
 *
 * Two of the three were never blocked on effort — they were blocked on a
 * sentence. `wing` was baked for the budgie on 4 August and went from zero
 * shapes to six, and nobody carried the correction back to this file for two
 * days. The third, the scorpion, ships on Joe's 5 August ruling — *"put
 * something in for the unbuildable ones anyway so i can do it manually"* — and
 * is labelled a placeholder in its own header and its own flag.
 */
const LAST_THREE: readonly [string, string][] = [
  ['animal-bat', 'blade-06, the bee-and-penguin wing, re-axised as one membrane on one spar'],
  ['animal-sugar-glider', 'blade-05, the lion\'s flat muzzle plate laid horizontal — not a wing at all'],
  ['animal-scorpion', 'two opposed wedge-11 tusks, and it says PLACEHOLDER because the claw role is empty'],
]

const byId: ReadonlyMap<string, Species> = new Map(NIGHT_TIME_SPECIES.map(s => [s.id, s]))

const dims = (g: THREE.Object3D): [number, number, number] => {
  g.updateMatrixWorld(true)
  const b = new THREE.Box3().setFromObject(g)
  return [b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z]
}

/**
 * Enough of a built group to tell two of them apart.
 *
 * Vertex count AND the set of bank shapes AND the measured box, because none
 * alone is enough: two different ear shapes can share a vertex count, and two
 * animals on the same hull with the same features but different paint have the
 * same box. The bank ids are the load-bearing third, and they are what a child
 * actually sees — a dish ear against an upright ear.
 */
const signature = (g: THREE.Object3D): string => {
  let verts = 0
  const parts: string[] = []
  g.traverse(n => {
    if ((n as THREE.Mesh).isMesh) {
      verts += (n as THREE.Mesh).geometry.getAttribute('position').count
      parts.push(String((n as THREE.Mesh).userData['part']))
    }
  })
  return `${verts}|${[...new Set(parts)].sort().join(',')}|${dims(g).map(v => v.toFixed(4)).join(',')}`
}

describe('the Night Time collection is exactly the roster, all sixteen of it', () => {
  const rostered = COLLECTIONS.find(c => c.id === 'night-time')

  it('is a collection the roster actually declares, at ship 8 and band medium', () => {
    expect(rostered).toBeDefined()
    expect(rostered?.members).toHaveLength(16)
    expect(rostered?.ship).toBe(8)
    expect(rostered?.band).toBe('medium')
  })

  it('ships all sixteen members, in the roster order for night-time', () => {
    expect(NIGHT_TIME_SPECIES.map(s => s.id)).toEqual(BUILT)
    const order = (rostered?.members ?? []).filter(id => BUILT.includes(id))
    expect(NIGHT_TIME_SPECIES.map(s => s.id)).toEqual(order)
  })

  it('invents nothing — every member is in the roster and in this collection', () => {
    for (const s of NIGHT_TIME_SPECIES) {
      expect(rostered?.members).toContain(s.id)
      expect(s.collection).toBe('night-time')
      // `defineSpecies` takes the printed name off the roster, so this can only
      // fail if somebody hand-wrote a record instead of calling the guard.
      expect(s.name).toBe(SPECIES_NAMES[s.id])
    }
  })

  it('INCLUDES bat, sugar glider and scorpion — the three it used to leave out', () => {
    /*
     * The inverse of the test that stood here for four days, kept in the same
     * place so the change is legible rather than silent. It said: "delete this
     * test only by BANKING the shape each of these wants, or by Joe
     * commissioning one under the escape clause." Neither happened, and the
     * three are here anyway, which is worth being precise about:
     *
     *   - the WING was banked, on 4 August, for the budgie — so for two of the
     *     three the old test's own exit condition was met and nobody noticed;
     *   - the CLAW was not, and the scorpion is a PLACEHOLDER on Joe's 5 August
     *     ruling instead, which is a different door out of the same room.
     */
    for (const [id, wears] of LAST_THREE) {
      expect(rostered?.members, `${id} should be rostered`).toContain(id)
      expect(byId.has(id), `${id} is missing again: it wears ${wears}`).toBe(true)
    }
    expect(NIGHT_TIME_SPECIES).toHaveLength(16)
  })

  it('THE WING IS STILL THERE AND THE CLAW IS STILL NOT — measured, not remembered', () => {
    /*
     * The half of the old test that still earns its place, and the reason is the
     * one `species-africa.test.ts` gave first: a sentence saying "the bank has no
     * claw" rots the day somebody bakes one, and a test that COUNTS goes red at
     * exactly that moment.
     *
     * BOTH DIRECTIONS MATTER NOW, which they did not before. The wing assertion
     * guards two built animals — if `wing` went back to zero, `animal-bat` would
     * stop being buildable and this is what would say so. The claw assertion
     * guards a claim in `animal-scorpion.ts`'s own flag: it tells Joe the crab's
     * pincer is not in the module and that baking it is his call (PB-096). The
     * day somebody bakes `claw`, that flag becomes a lie and this test is what
     * catches it — so read a red here as "go and rewrite the scorpion", not as a
     * failure.
     */
    const wings = PARTS_BANK.filter(p => p.roles.includes('wing')).map(p => p.id)
    expect(wings.length, 'the wing has gone again — animal-bat depends on it').toBeGreaterThan(0)

    const stillMissing: readonly PartRole[] = ['horn', 'claw']
    for (const role of stillMissing) {
      const have = PARTS_BANK.filter(p => p.roles.includes(role)).map(p => p.id)
      expect(have, `the bank now has a "${role}" shape: ${have.join(', ')} — reopen the ruling`)
        .toHaveLength(0)
    }

    /* The scorpion says so where Joe reads it, and that has to stay true while
     * the role is absent. */
    expect(byId.get('animal-scorpion')?.assembly?.flag).toMatch(/PLACEHOLDER/)
  })
})

describe('NOTHING in Night Time goes through a kit — Joe\'s ruling, asserted', () => {
  /*
   * 2 August 2026: "only the garden animals have been built to spec. the ones i
   * can see in outline in the album for africa and home pets are the old blocky
   * ones that can be deleted to be honest. do not build any more of them."
   *
   * Every other collection in the registry is kit-built and awaiting that
   * deletion. This is the first that is not, and the failure mode worth guarding
   * is somebody "completing" a member later by adding a `build` object, which is
   * cheap to type and is exactly the thing he rejected. So it is asserted in
   * both directions: every member has an assembly, and no member has a build.
   */
  it('gives every one of the sixteen an assembly and NONE of them a build', () => {
    for (const s of NIGHT_TIME_SPECIES) {
      expect(s.kit, `${s.id} is not bespoke`).toBe('bespoke')
      expect(s.assembly, `${s.id} has no assembly`).toBeDefined()
      expect(s.assembly?.kit).toBe('assembly')
      expect(s.build, `${s.id} has grown a kit build — see the ruling above`).toBeUndefined()
    }
  })

  it('records a threat status on none of them, because none has been checked', () => {
    // `Threat.checkedDate` exists so a status is a DATED reading of the Red List
    // rather than a memory. `registry.ts` makes the argument in full. The
    // aye-aye is the one that most deserves a badge and it still does not get a
    // guessed one.
    for (const s of NIGHT_TIME_SPECIES) expect(s.threat, s.id).toBeUndefined()
  })
})

describe('every Night Time species actually constructs', () => {
  it('builds a real, non-empty, finite group for all sixteen', () => {
    for (const s of NIGHT_TIME_SPECIES) {
      const g = buildAssembled(s.id)
      const box = new THREE.Box3().setFromObject(g)
      expect(box.isEmpty(), `${s.id} built nothing`).toBe(false)
      for (const v of [box.min, box.max]) {
        for (const c of [v.x, v.y, v.z]) expect(Number.isFinite(c), s.id).toBe(true)
      }
      // Feet on the ground, every one. The leg row never moves.
      expect(box.min.y, `${s.id} does not stand on y = 0`).toBeCloseTo(0, 3)
    }
  })

  it('gives every species its own palette', () => {
    // Two animals with the same palette IN THE SAME ORDER share one texture
    // object — that is the cache key, deliberately (§9.3). So a duplicate
    // palette is not merely a look problem, it silently welds two species
    // together in the texture cache.
    const seen = new Map<string, string>()
    for (const s of NIGHT_TIME_SPECIES) {
      const key = JSON.stringify(s.assembly?.palette)
      const had = seen.get(key)
      expect(had, `${s.id} and ${had} share a palette, and therefore a texture`).toBeUndefined()
      seen.set(key, s.id)
    }
  })
})

describe('no two Night Time species are silhouette twins', () => {
  /*
   * This collection is the hardest test of that so far, and it is worth naming
   * the three pairs it has to survive rather than trusting a sweep to catch them:
   *
   *   - tarsier / bushbaby / aye-aye — three small nocturnal primates, all with
   *     enormous eyes, big ears and a long tail;
   *   - opossum / civet / kinkajou / SUGAR GLIDER — four long-tailed climbers,
   *     and the fourth is the sharpest pair in the file: `collections/
   *     night-time.ts` held the sugar glider out for two months on the ground
   *     that without a membrane it IS the opossum, so the membrane is not a
   *     decoration on this animal, it is the separation;
   *   - firefly / glow-worm — the SAME BEETLE at two life stages.
   *
   * The pack itself reuses one leg 86 times, so shared parts are not the fault.
   * Producing the same measured silhouette is.
   */
  it('produces sixteen distinguishable built signatures', () => {
    const sigs = new Map<string, string>()
    for (const s of NIGHT_TIME_SPECIES) {
      const sig = signature(buildAssembled(s.id))
      const had = sigs.get(sig)
      expect(had, `${s.id} builds the same silhouette as ${had}`).toBeUndefined()
      sigs.set(sig, s.id)
    }
    expect(sigs.size).toBe(16)
  })

  it('separates each of the three confusable groups on the parts they wear', () => {
    const partsOf = (id: string): string[] => {
      const out: string[] = []
      buildAssembled(id).traverse(n => {
        if ((n as THREE.Mesh).isMesh) out.push(String((n as THREE.Mesh).userData['part']))
      })
      return [...new Set(out)].sort()
    }
    const groups: readonly (readonly string[])[] = [
      ['animal-tarsier', 'animal-bushbaby', 'animal-aye-aye'],
      ['animal-opossum', 'animal-civet', 'animal-kinkajou', 'animal-sugar-glider'],
      ['animal-firefly', 'animal-glow-worm'],
    ]
    for (const group of groups) {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const a = partsOf(group[i]!), b = partsOf(group[j]!)
          const only = [...a.filter(p => !b.includes(p)), ...b.filter(p => !a.includes(p))]
          expect(only, `${group[i]} and ${group[j]} wear exactly the same shapes`)
            .not.toHaveLength(0)
        }
      }
    }
  })
})

describe('the collection is deterministic', () => {
  it('builds the same geometry twice — no clock and no random source reaches a species', () => {
    for (const s of NIGHT_TIME_SPECIES) {
      expect(signature(buildAssembled(s.id)), s.id).toBe(signature(buildAssembled(s.id)))
    }
  })

  it('carries no node transform on any mesh, on any member', () => {
    // Rule 4 as amended: a rotation is baked into the copy's vertices and a
    // mirror negates x on them, so after every build the node itself is clean.
    // The shared harness asserts this per species; asserted again over the whole
    // collection because it is the invariant a bulk edit would break in one go.
    for (const s of NIGHT_TIME_SPECIES) {
      buildAssembled(s.id).traverse(n => {
        if (!(n as THREE.Mesh).isMesh) return
        expect(n.quaternion.equals(new THREE.Quaternion()), `${s.id}/${n.name} is rotated`).toBe(true)
        expect(n.scale.equals(new THREE.Vector3(1, 1, 1)), `${s.id}/${n.name} is scaled`).toBe(true)
      })
    }
  })
})
