/**
 * Night Time — the collection, as opposed to its thirteen animals.
 *
 * Each species has its own `assembly-<id>.test.ts` carrying the numbers only it
 * can defend, plus the shared harness in `assembly-assert.ts`. **This file is
 * for the claims that are only true of the SET**, and there are four kinds:
 *
 *   1. the collection is exactly the roster minus the three it cannot build,
 *      and the three absences are a measurement rather than a to-do list;
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

/** The thirteen that ship, in the roster's own order for `night-time`. */
const BUILT = [
  'animal-raccoon', 'animal-wolf', 'animal-firefly', 'animal-opossum',
  'animal-nightjar', 'animal-tarsier', 'animal-bushbaby', 'animal-fennec-fox',
  'animal-civet', 'animal-aye-aye', 'animal-kiwi', 'animal-kinkajou',
  'animal-glow-worm',
]

/**
 * The three the PACK cannot express, with the exact shape each one needed.
 *
 * Data rather than prose in a comment, so the test prints the reason at the
 * moment anybody reads it — which is the moment it fails.
 *
 * Note what these three are NOT. They are not waiting on a kit; there is no kit
 * coming and the kit route is closed. They are waiting on a SHAPE that does not
 * exist in the pack, and the only two honest ways out are Joe commissioning
 * authored geometry under §2's escape clause (which he has done exactly once,
 * for the hedgehog's nose) or the species staying unbuilt.
 */
const NOT_BUILT: readonly [string, string][] = [
  ['animal-bat', 'a membranous wing — the bank has no membrane and no wing at all'],
  ['animal-sugar-glider', 'a patagium; without it, it is animal-opossum in the same collection'],
  ['animal-scorpion', 'a pincer, and a segmented tail — the claw role is empty'],
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

describe('the Night Time collection is exactly the roster, minus the three the PACK cannot make', () => {
  const rostered = COLLECTIONS.find(c => c.id === 'night-time')

  it('is a collection the roster actually declares, at ship 8 and band medium', () => {
    expect(rostered).toBeDefined()
    expect(rostered?.members).toHaveLength(16)
    expect(rostered?.ship).toBe(8)
    expect(rostered?.band).toBe('medium')
  })

  it('ships thirteen members, in the roster order for night-time', () => {
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

  it('LEAVES OUT bat, sugar glider and scorpion — a measurement, not an oversight', () => {
    /*
     * Delete this test only by BANKING the shape each of these wants, or by Joe
     * commissioning one under the escape clause. If it goes red because one of
     * them appeared in `night-time.ts`, the question is not "why is the test
     * failing" — it is "what shape did somebody improvise for a wing".
     */
    for (const [id, why] of NOT_BUILT) {
      expect(rostered?.members, `${id} should still be rostered`).toContain(id)
      expect(byId.has(id), `${id} must stay unbuilt: it needs ${why}`).toBe(false)
    }
    expect(NIGHT_TIME_SPECIES).toHaveLength(16 - NOT_BUILT.length)
  })

  it('THE WING ARRIVED — the bat and the sugar glider are unblocked, and unbuilt', () => {
    /*
     * THIS TEST DID ITS JOB ON 4 AUGUST. It said one banked wing shape reopens
     * five species, not three, and that both this file and
     * `species-africa.test.ts` should go red together the day it changed. Joe
     * had the parrot's and the bee's wings baked into the bank that day, so
     * `wing` is six shapes where it was zero.
     *
     * WHAT THAT MEANS, AND WHAT IT DOES NOT. The bat and the sugar glider were
     * held out of this collection for ONE reason — rule 1's "adapt before
     * authoring" had nothing to work on, because there was no wing to adapt.
     * That reason is gone. They are not built yet, and building them is Joe's
     * call rather than a consequence of this commit: a bat's membrane is not a
     * bird's wing, and whether `blade-06` can honestly stand in for one is a
     * question about the animal, not about the bank.
     *
     * The SCORPION is untouched by any of it. It needs a `claw`, which is still
     * declared-and-absent, so it stays out for exactly the reason it always did.
     */
    const wings = PARTS_BANK.filter(p => p.roles.includes('wing')).map(p => p.id)
    expect(wings.length, 'the wing has gone again').toBeGreaterThan(0)

    // Still nothing to adapt for the scorpion.
    const stillMissing: readonly PartRole[] = ['horn', 'claw']
    for (const role of stillMissing) {
      const have = PARTS_BANK.filter(p => p.roles.includes(role)).map(p => p.id)
      expect(have, `the bank now has a "${role}" shape: ${have.join(', ')} — reopen the ruling`)
        .toHaveLength(0)
    }

    /* And the three are still OUT of the collection, which is the state this
     * commit leaves them in deliberately. When Joe builds the bat and the sugar
     * glider, `NOT_BUILT` shrinks and the test above is what says so. */
    for (const [id] of NOT_BUILT) expect(byId.has(id), `${id} is built now`).toBe(false)
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
  it('gives every one of the thirteen an assembly and NONE of them a build', () => {
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
  it('builds a real, non-empty, finite group for all thirteen', () => {
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
   *   - opossum / civet / kinkajou — three long-tailed climbers on the same hull;
   *   - firefly / glow-worm — the SAME BEETLE at two life stages.
   *
   * The pack itself reuses one leg 86 times, so shared parts are not the fault.
   * Producing the same measured silhouette is.
   */
  it('produces thirteen distinguishable built signatures', () => {
    const sigs = new Map<string, string>()
    for (const s of NIGHT_TIME_SPECIES) {
      const sig = signature(buildAssembled(s.id))
      const had = sigs.get(sig)
      expect(had, `${s.id} builds the same silhouette as ${had}`).toBeUndefined()
      sigs.set(sig, s.id)
    }
    expect(sigs.size).toBe(13)
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
      ['animal-opossum', 'animal-civet', 'animal-kinkajou'],
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
