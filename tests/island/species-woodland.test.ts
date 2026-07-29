/**
 * Woodland, tested as DATA and as GEOMETRY.
 *
 * Two different failures are guarded here and they need different evidence.
 *
 *   1. A record that disagrees with the roster, or a collection quietly
 *      half-filled. `defineSpecies` already throws on an invented id, so what is
 *      left to prove is membership: fourteen of sixteen, in roster order, with
 *      the two game birds ABSENT BY NAME. Woodland ships partial on purpose and
 *      a test that only counted would let a later reader "finish" it with two
 *      four-legged pheasants.
 *   2. A build that reads as another species. Roster §4 lists eight groups that
 *      "will read as duplicates unless size, palette and marking are
 *      deliberately separated", and Woodland carries more of that list than any
 *      other collection — otter/mink/coypu/beaver, hare/bunny, bear/polar/panda,
 *      plus three mustelids and two cats internally. The live 24 are frozen, so
 *      every one of those separations is one-sided and every one is asserted
 *      here, named, so the next reader knows why the test exists.
 *
 * The geometry assertions run the real kit and measure the real group, the way
 * `pets.ts:650-660` does before it decides a pet's keep-out radius and shadow.
 * A proportion that only differs on paper is not a difference.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { WOODLAND_SPECIES } from '../../src/island/species/collections/woodland'
import { buildSpecies } from '../../src/island/species/kit'
import { COLLECTIONS, SPECIES_NAMES } from '../../src/island/species/roster'
import { speciesRecord } from '../../src/island/species/registry'
import type { QuadrupedBuild, Species } from '../../src/island/species/types'

/** The two game birds. Named as constants so the absence test cannot drift. */
const UNBUILT_BIRDS = ['animal-pheasant', 'animal-capercaillie'] as const

const ROSTER_MEMBERS = COLLECTIONS.find(c => c.id === 'woodland')!.members

const byId = new Map(WOODLAND_SPECIES.map(s => [s.id, s]))

/** The build of one member, typed. Every Woodland member rides the quadruped kit. */
const build = (id: string): QuadrupedBuild => {
  const s = byId.get(id)
  if (!s) throw new Error(`no Woodland record for ${id}`)
  return s.build as QuadrupedBuild
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
 * Enough of a built group to tell two of them apart — the same signature
 * `kit-quadruped.test.ts:59` uses, for the same reason: vertex count alone
 * collides between ear shapes, and every creature is fitted to exactly its
 * `height`, so height alone proves nothing either.
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

const sameParts = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  a.ears === b.ears &&
  a.tail === b.tail &&
  [...(a.extras ?? [])].sort().join(',') === [...(b.extras ?? [])].sort().join(',')

/**
 * What counts as a REAL difference in proportion.
 *
 * Not "any difference": two species three thousandths apart in `legs` are the
 * same creature with a typo between them. These margins are roughly a tenth of
 * each field's useful range, which is about the smallest gap that survives the
 * kit's uniform height fit and still reads at 0.16 scale.
 */
const MARGIN = { height: 0.14, body: 0.1, head: 0.1, legs: 0.1 } as const

const farApart = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  (Object.keys(MARGIN) as (keyof typeof MARGIN)[]).some(
    k => Math.abs(a[k] - b[k]) >= MARGIN[k],
  )

describe('the Woodland collection is exactly what the roster says it is', () => {
  it('holds fourteen members, in the roster\'s own order', () => {
    expect(WOODLAND_SPECIES.map(s => s.id)).toEqual([
      'animal-bear', 'animal-otter', 'animal-chipmunk', 'animal-elk',
      'animal-pine-marten', 'animal-stoat', 'animal-lynx', 'animal-skunk',
      'animal-porcupine', 'animal-wolverine', 'animal-hare', 'animal-wildcat',
      'animal-mink', 'animal-coypu',
    ])
    expect(WOODLAND_SPECIES).toHaveLength(14)
  })

  it('contains nothing that is not a Woodland member of the roster', () => {
    for (const s of WOODLAND_SPECIES) {
      expect(ROSTER_MEMBERS, `${s.id} is not in roster collection 'woodland'`)
        .toContain(s.id)
      expect(s.collection).toBe('woodland')
      // `defineSpecies` takes the printed name from the roster; this proves it
      // was not overridden on the way past.
      expect(s.name).toBe(SPECIES_NAMES[s.id])
    }
    expect(new Set(WOODLAND_SPECIES.map(s => s.id)).size).toBe(14)
  })

  it('SHIPS PARTIAL: animal-pheasant and animal-capercaillie are absent, on purpose', () => {
    /*
     * Both are game birds. They want the songbird kit (or a bespoke one) and
     * neither is built — `kit.ts` throws `UnbuiltKitError` for both by name. A
     * bird pressed into the quadruped kit is a four-legged pheasant, which is
     * the failure roster §1's "kits before species" rule exists to prevent.
     *
     * DO NOT DELETE THIS TEST to make the collection "complete". Delete it the
     * day the songbird kit exists and these two get real records — which will
     * fail the order assertion above at the same moment, deliberately.
     */
    for (const id of UNBUILT_BIRDS) {
      expect(ROSTER_MEMBERS, `${id} should still be rostered`).toContain(id)
      expect(byId.has(id), `${id} must NOT be built by the quadruped kit`).toBe(false)
    }
    expect(ROSTER_MEMBERS).toHaveLength(16)
    expect(ROSTER_MEMBERS.filter(id => !byId.has(id))).toEqual([...UNBUILT_BIRDS])
  })

  it('gives every member a quadruped build and no guessed threat status', () => {
    for (const s of WOODLAND_SPECIES) {
      expect(s.kit).toBe('quadruped')
      expect(s.build?.kit).toBe('quadruped')
      // Roster §5 wants statuses "true, checkable" with a real `checkedDate`.
      // Absent is honest; remembered only looks checked. `registry.ts:55-76`.
      expect(s.threat).toBeUndefined()
    }
  })

  it('shares no id with the frozen live 24', () => {
    // The live 24 are frozen (roster §1). A Woodland record colliding with one
    // would restyle an animal a child already owns — brief §19.
    //
    // This asserted `speciesRecord(id)` was UNDEFINED when it was written,
    // because Woodland was not yet in the registry. The manager then wired the
    // four phase-2 collections in, so a record now exists for every one of
    // them — and an `undefined` check would silently stop testing anything the
    // moment it was "fixed" by deleting it. The real invariant was never
    // absence; it was that a Woodland id must not resolve to a FROZEN pack
    // animal. That is what is checked now.
    for (const s of WOODLAND_SPECIES) {
      const record = speciesRecord(s.id)
      expect(record, `${s.id} must be in the registry`).toBeDefined()
      expect(record!.kit, `${s.id} must not resolve to a frozen GLB`).not.toBe('kenney')
      expect(record!.collection).toBe('woodland')
    }
  })
})

describe('every Woodland build actually constructs', () => {
  it('returns a real, non-empty THREE.Group for all fourteen', () => {
    for (const s of WOODLAND_SPECIES) {
      const g = buildSpecies(s.build!)
      expect(g, s.id).toBeInstanceOf(THREE.Group)
      let meshes = 0
      g.traverse(n => { if ((n as THREE.Mesh).isMesh) meshes++ })
      expect(meshes, `${s.id} built no meshes`).toBeGreaterThan(10)
      const box = measure(g)
      expect(box.isEmpty(), `${s.id} has an empty bounding box`).toBe(false)
      for (const v of [box.min, box.max]) {
        for (const n of [v.x, v.y, v.z]) expect(Number.isFinite(n), s.id).toBe(true)
      }
      expect(box.min.y, `${s.id} is not standing on the ground`).toBeCloseTo(0, 6)
    }
  })

  it('stands every member inside the measured pack, and inside a walkable keep-out', () => {
    /*
     * The 24 GLBs measure 1.43 to 2.02 tall (the `REF` comment in
     * `kits/quadruped.ts`), mean width/height 0.97, and their worst obstacle
     * keep-out — `max(width, depth) / 2`, `pets.ts:652` — is 1.17. A Woodland
     * creature outside that family looks like a guest beside `animal-fox`, which
     * roster §1 forbids; one with a bigger keep-out cannot walk between trees.
     *
     * The keep-out ceiling held here is 1.6, and it is not arbitrary: the kit's
     * own worked "plausible stoat" (`kit-quadruped.test.ts:93`) measures 1.59,
     * so 1.6 is the widest thing the kit's author called plausible. Woodland's
     * long mustelids sit right under it — an earlier stoat at `body: 1.55,
     * legs: 0.28` measured 1.78 and this assertion is what caught it.
     */
    for (const s of WOODLAND_SPECIES) {
      const [w, h, d] = dims(buildSpecies(s.build!))
      expect(h, `${s.id} height`).toBeGreaterThanOrEqual(1.4)
      // 2.0 plus a float hair: the kit fits by dividing, so a 2.0 species
      // measures 2.0000000000000004 and an exact bound is a false alarm.
      expect(h, `${s.id} height`).toBeLessThanOrEqual(2.001)
      expect(w / h, `${s.id} is too narrow for this pack`).toBeGreaterThan(0.5)
      expect(Math.max(w, d) / 2, `${s.id} keep-out`).toBeLessThan(1.6)
    }
  })
})

describe('no two Woodland species are silhouette-twins', () => {
  it('differs on ears, tail or extras — or by a real margin of proportion', () => {
    for (const a of WOODLAND_SPECIES) {
      for (const b of WOODLAND_SPECIES) {
        if (a.id >= b.id) continue
        const [x, y] = [build(a.id), build(b.id)]
        expect(
          !sameParts(x, y) || farApart(x, y),
          `${a.id} and ${b.id} wear the same parts and are within a rounding error of each other`,
        ).toBe(true)
      }
    }
  })

  it('builds fourteen measurably different creatures, not fourteen records', () => {
    // The paper difference above is necessary and not sufficient: the kit fits
    // every creature to exactly its `height`, so a proportion can be edited and
    // change nothing you could see. This measures what was actually built.
    const seen = new Map<string, string>()
    for (const s of WOODLAND_SPECIES) {
      const sig = signature(buildSpecies(s.build!))
      expect(seen.has(sig), `${s.id} is identical to ${seen.get(sig)}`).toBe(false)
      seen.set(sig, s.id)
    }
    expect(seen.size).toBe(14)
  })

  it('gives no two members the same palette', () => {
    const seen = new Set<string>()
    for (const s of WOODLAND_SPECIES) {
      const p = build(s.id).palette
      const key = [p.coat, p.belly, p.detail, p.accent].join('/')
      expect(seen.has(key), `${s.id} shares a palette with another member`).toBe(false)
      seen.add(key)
    }
  })
})

/* ------------------------------------------------- roster §4, group by group --- */

describe('roster §4: otter / mink / coypu against each other and against the frozen beaver', () => {
  it('leaves the paddle tail to animal-beaver — no Woodland member wears `flat`', () => {
    // `animal-beaver` is frozen (roster §1) and its whole read is the paddle, so
    // the separation can only be made here. `tail: 'flat'` is the beaver's and
    // the platypus's; a coypu's tail is a bare rat's tail and an otter's tapers.
    expect(speciesRecord('animal-beaver')?.kit).toBe('kenney')
    expect(speciesRecord('animal-beaver')?.build).toBeUndefined()
    for (const s of WOODLAND_SPECIES) expect(build(s.id).tail, s.id).not.toBe('flat')
  })

  it('separates the three of them by body length, tail and whiskers', () => {
    const [otter, mink, coypu] = [build('animal-otter'), build('animal-mink'), build('animal-coypu')]
    // The otter is the longest and lowest; the coypu is a short-bodied rodent.
    expect(otter.body - coypu.body).toBeGreaterThan(0.25)
    expect(coypu.head - otter.head).toBeGreaterThan(0.05)
    // Tail: the otter's and the coypu's taper, the mink's is bushy.
    expect(mink.tail).toBe('bushy')
    expect(otter.tail).toBe('thin')
    expect(coypu.tail).toBe('thin')
    // …so otter and coypu, which share a tail, are split by the arched back.
    expect(coypu.extras).toContain('hump')
    expect(otter.extras ?? []).not.toContain('hump')
    // …and mink against otter by whiskers, which only the otter carries.
    expect(otter.extras).toContain('whiskers')
    expect(mink.extras ?? []).not.toContain('whiskers')
    // Coat: chestnut, near-black, coarse mid-brown. All three visibly apart.
    const lum = (c: number): number =>
      (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255
    expect(lum(otter.palette.coat) - lum(mink.palette.coat)).toBeGreaterThan
      (0.1)
    expect(Math.abs(lum(coypu.palette.coat) - lum(mink.palette.coat))).toBeGreaterThan(0.1)
  })
})

describe('roster §4: hare against the frozen animal-bunny', () => {
  it('stands the hare up on the longest legs in the collection', () => {
    /*
     * `animal-bunny` is the tallest thing in the frozen pack (2.13) and is built
     * as a compact sitting rabbit, so height cannot do this work. The legs can:
     * a hare stands off the ground, and that is the difference a child points at.
     */
    expect(speciesRecord('animal-bunny')?.kit).toBe('kenney')
    const hare = build('animal-hare')
    expect(hare.ears).toBe('long')
    for (const s of WOODLAND_SPECIES) {
      if (s.id === 'animal-hare') continue
      expect(hare.legs - build(s.id).legs, `hare v ${s.id}`).toBeGreaterThan(0.1)
    }
  })
})

describe('roster §4: bear against the frozen animal-polar and animal-panda', () => {
  it('makes the brown bear bigger, humped and warm-coloured — all three one-sided', () => {
    // Both of the frozen bears are `kenney` with no build, so nothing about them
    // can be adjusted; every separation below is made on the Woodland side.
    for (const id of ['animal-polar', 'animal-panda']) {
      expect(speciesRecord(id)?.kit).toBe('kenney')
      expect(speciesRecord(id)?.build).toBeUndefined()
    }
    const bear = build('animal-bear')
    // Size: the field scales every pet by the same 0.16 (`pets.ts:643`), so
    // height IS size on screen. The polar bear GLB measures 1.50 tall.
    expect(bear.height).toBeGreaterThan(1.9)
    // Shape: the grizzly shoulder, which neither frozen bear has.
    expect(bear.extras).toContain('hump')
    // Colour: warm brown, not the polar bear's white nor the panda's neutral
    // black-and-white — a real hue, measured as red well clear of blue.
    const coat = bear.palette.coat
    expect(((coat >> 16) & 255) - (coat & 255)).toBeGreaterThan(40)
  })
})

describe('roster §4 (internal): stoat / pine marten / mink, three mustelids', () => {
  it('buys length by dropping legs and height, never by pushing body past the clamp', () => {
    /*
     * `body` clamps at 1.55 for a reason the kit header records: at 1.9 this kit
     * made a stoat 4.0 units deep — a keep-out three times the measured pack's
     * widest, and a creature that could not walk between two trees, because
     * `pets.ts:652` charges for length.
     */
    for (const s of WOODLAND_SPECIES) {
      expect(build(s.id).body, `${s.id} body`).toBeLessThanOrEqual(1.55)
    }
    const [stoat, marten, mink] = [
      build('animal-stoat'), build('animal-pine-marten'), build('animal-mink'),
    ]
    /*
     * The stoat is the extreme: longest body, lowest legs, smallest head — but
     * held BELOW the clamp, not at it. See the corollary in `woodland.ts`: the
     * kit fits uniformly to height, so low legs raise the fit scale and a
     * `1.55 / 0.28` stoat measured 3.56 deep, a keep-out of 1.78 against the
     * measured pack's worst of 1.17. The clamp is not the target.
     */
    for (const s of WOODLAND_SPECIES) {
      if (s.id === 'animal-stoat') continue
      expect(stoat.body, `stoat v ${s.id}`).toBeGreaterThan(build(s.id).body)
    }
    expect(stoat.body).toBeLessThan(1.55)
    expect(stoat.legs).toBeLessThan(mink.legs)
    expect(mink.legs).toBeLessThan(marten.legs)
    for (const other of [marten, mink]) expect(stoat.head).toBeLessThan(other.head)
    // The marten climbs, so it is the tallest-legged and shortest-bodied.
    expect(marten.legs - stoat.legs).toBeGreaterThan(0.2)
    expect(stoat.body - marten.body).toBeGreaterThan(0.2)
    // And they wear three different combinations of ears and tail.
    const parts = [stoat, marten, mink].map(b => `${b.ears}/${b.tail}`)
    expect(new Set(parts).size).toBe(3)
  })
})

describe('roster §4 (internal): lynx / wildcat, two cats', () => {
  it('separates them on tufted ears, leg length and tail', () => {
    const [lynx, cat] = [build('animal-lynx'), build('animal-wildcat')]
    expect(lynx.ears).toBe('tufted')
    expect(cat.ears).toBe('pointed')
    // The tuft is drawn in the accent colour precisely so it reads at 0.16 scale
    // (`quadruped.ts:363-366`), so a lynx whose accent matches its coat has no
    // tufts at all. Assert the contrast exists.
    expect(lynx.palette.accent).not.toBe(lynx.palette.coat)
    expect(lynx.height - cat.height).toBeGreaterThan(0.2)
    expect(lynx.legs - cat.legs).toBeGreaterThan(0.25)
    // A lynx is bob-tailed; the wildcat's thick tail is its real field mark.
    expect(lynx.tail).toBe('stub')
    expect(cat.tail).toBe('bushy')
    // Only one of them may be confused with the frozen house cat, and it is held
    // apart from it by weight of body rather than by anything the house cat does.
    expect(speciesRecord('animal-cat')?.kit).toBe('kenney')
    expect(cat.body).toBeGreaterThan(1.05)
  })
})

describe('roster §4 (internal): skunk / wolverine, the two round-eared bushy-tailed snouts', () => {
  it('separates the only pair in the collection that wears identical parts', () => {
    // Every other pair differs somewhere in ears/tail/extras. These two do not,
    // so the whole separation is proportion and palette, and it is deliberately
    // wide enough to survive the kit's height fit.
    const [skunk, wolverine] = [build('animal-skunk'), build('animal-wolverine')]
    expect(sameParts(skunk, wolverine)).toBe(true)
    expect(wolverine.height - skunk.height).toBeGreaterThanOrEqual(MARGIN.height)
    expect(wolverine.legs - skunk.legs).toBeGreaterThanOrEqual(MARGIN.legs)
    // The skunk is the one animal here identified by marking, and the kit has no
    // stripe part — so its accent is LIGHTER than its coat (the facial blaze),
    // which is true of nothing else in the collection.
    const lum = (c: number): number =>
      (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255
    expect(lum(skunk.palette.accent!)).toBeGreaterThan(lum(skunk.palette.coat))
    for (const s of WOODLAND_SPECIES) {
      if (s.id === 'animal-skunk') continue
      const p = build(s.id).palette
      if (build(s.id).extras?.includes('spines')) continue // porcupine's pale quills
      expect(lum(p.accent!), `${s.id} accent`).toBeLessThan(lum(p.coat))
    }
  })
})

describe('the collection is data, not geometry', () => {
  it('names only parts the closed extras list allows', () => {
    // `types.ts:142` closes `QuadrupedExtra` so phase 2 cannot invent a part per
    // species. The compiler enforces the names; this enforces roster §1's "two
    // or three detail parts", which nothing else checks.
    const seen = new Set<string>()
    for (const s of WOODLAND_SPECIES) {
      const extras = build(s.id).extras ?? []
      expect(extras.length, `${s.id} carries too many extras`).toBeLessThanOrEqual(3)
      for (const e of extras) seen.add(e)
    }
    // And the collection actually uses its vocabulary rather than one part
    // fourteen times.
    expect(seen.size).toBeGreaterThanOrEqual(5)
  })

  it('is a plain readonly array of Species with no shared build objects', () => {
    const builds = WOODLAND_SPECIES.map((s: Species) => s.build)
    expect(new Set(builds).size).toBe(14)
    for (const b of builds) expect(b).toBeDefined()
  })
})
