/**
 * Farm, tested as DATA and as GEOMETRY — and as the first COMPLETE collection.
 *
 * Modelled on `species-woodland.test.ts`, which guards two different failures
 * with two different kinds of evidence, and adds a third that is new here.
 *
 *   1. A record that disagrees with the roster. `defineSpecies` already throws on
 *      an invented id, so what is left to prove is membership and kit: sixteen of
 *      sixteen, in roster order, nine on the quadruped kit and seven on the
 *      songbird kit, each on the kit its animal actually needs.
 *   2. A build that reads as another species. Roster §4's densest cluster is in
 *      this file — four equids, three bovines, two camelids, three galliforms —
 *      and four of those groups reach OUTSIDE it into `animal-pony` (built,
 *      home-pets), `animal-buffalo` (built, africa) and the frozen `animal-cow`
 *      and `animal-chick`, none of which this collection may edit. Every one of
 *      those separations is asserted here, by name, so the next reader knows why
 *      the test exists.
 *   3. COMPLETENESS. Woodland's equivalent test was written to assert that two
 *      members are ABSENT on purpose, because a bird pressed into the quadruped
 *      kit is a four-legged pheasant. Farm is the first collection with no such
 *      hole to argue about: both kits it needs exist, so it ships 16 of 16 and
 *      that is asserted outright rather than counted. If a member ever
 *      disappears from this file to make a number pass, this test goes red.
 *
 * The geometry assertions run the real kits and measure the real group, the way
 * `pets.ts:650-660` does before it decides a pet's keep-out radius and shadow. A
 * proportion that only differs on paper is not a difference.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { FARM_SPECIES } from '../../src/island/species/collections/farm'
import { buildSpecies } from '../../src/island/species/kit'
import { COLLECTIONS, SPECIES_NAMES } from '../../src/island/species/roster'
import { speciesRecord } from '../../src/island/species/registry'
import type {
  KitId, KitPalette, QuadrupedBuild, SongbirdBuild, Species,
} from '../../src/island/species/types'

const ROSTER_MEMBERS = COLLECTIONS.find(c => c.id === 'farm')!.members

const byId = new Map(FARM_SPECIES.map(s => [s.id, s]))

/**
 * Which kit each member rides, stated here as well as in the collection.
 *
 * Deliberately a second copy. The collection file could be edited to move a
 * member between kits and every other assertion in this file would still pass —
 * a goose built as a quadruped is a four-legged goose, which is the exact
 * failure roster §1's "kits before species" rule exists to prevent, and it is
 * cheap to pin.
 */
const KIT_OF: Readonly<Record<string, KitId>> = {
  'animal-sheep': 'quadruped',
  'animal-goat': 'quadruped',
  'animal-horse': 'quadruped',
  'animal-donkey': 'quadruped',
  'animal-goose': 'songbird',
  'animal-turkey': 'songbird',
  'animal-llama': 'quadruped',
  'animal-alpaca': 'quadruped',
  'animal-rooster': 'songbird',
  'animal-ox': 'quadruped',
  'animal-mule': 'quadruped',
  'animal-chicken': 'songbird',
  'animal-guinea-fowl': 'songbird',
  'animal-quail': 'songbird',
  'animal-water-buffalo': 'quadruped',
  'animal-pigeon': 'songbird',
}

const record = (id: string): Species => {
  const s = byId.get(id)
  if (!s) throw new Error(`no Farm record for ${id}`)
  return s
}

/** The build of one quadruped member, typed. Throws if it is not one. */
const quad = (id: string): QuadrupedBuild => {
  const b = record(id).build
  if (b?.kit !== 'quadruped') throw new Error(`${id} is not a quadruped`)
  return b
}

/** The build of one songbird member, typed. Throws if it is not one. */
const bird = (id: string): SongbirdBuild => {
  const b = record(id).build
  if (b?.kit !== 'songbird') throw new Error(`${id} is not a songbird`)
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

const built = (id: string): THREE.Group => buildSpecies(record(id).build!)

/** What `pets.ts:652` will charge this animal: `max(width, depth) / 2`. */
const keepOut = (id: string): number => {
  const [w, , d] = dims(built(id))
  return Math.max(w, d) / 2
}

/**
 * Enough of a built group to tell two of them apart — the same signature
 * `species-woodland.test.ts` and `kit-quadruped.test.ts` use, for the same
 * reason: vertex count alone collides between ear shapes, and every creature is
 * fitted to exactly its `height`, so height alone proves nothing either.
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

/** Relative luminance, the way the Woodland test computes it. */
const lum = (c: number): number =>
  (0.299 * ((c >> 16) & 255) + 0.587 * ((c >> 8) & 255) + 0.114 * (c & 255)) / 255

/** How far apart two coat colours are, per channel summed. */
const colourGap = (a: number, b: number): number =>
  Math.abs(((a >> 16) & 255) - ((b >> 16) & 255)) +
  Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)) +
  Math.abs((a & 255) - (b & 255))

const sameQuadParts = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  a.ears === b.ears &&
  a.tail === b.tail &&
  [...(a.extras ?? [])].sort().join(',') === [...(b.extras ?? [])].sort().join(',')

const sameBirdParts = (a: SongbirdBuild, b: SongbirdBuild): boolean =>
  a.beak === b.beak &&
  a.tail === b.tail &&
  a.wings === b.wings &&
  [...(a.extras ?? [])].sort().join(',') === [...(b.extras ?? [])].sort().join(',')

/**
 * What counts as a REAL difference in proportion — the Woodland test's margins,
 * roughly a tenth of each field's useful range, which is about the smallest gap
 * that survives the kits' uniform height fit and still reads at 0.16 scale.
 */
const MARGIN = { height: 0.14, body: 0.1, head: 0.1, legs: 0.1 } as const

const farApartQuad = (a: QuadrupedBuild, b: QuadrupedBuild): boolean =>
  (Object.keys(MARGIN) as (keyof typeof MARGIN)[]).some(
    k => Math.abs(a[k] - b[k]) >= MARGIN[k],
  )

const farApartBird = (a: SongbirdBuild, b: SongbirdBuild): boolean =>
  (Object.keys(MARGIN) as (keyof typeof MARGIN)[]).some(
    k => Math.abs(a[k] - b[k]) >= MARGIN[k],
  ) || Math.abs(a.neck - b.neck) >= 0.25

describe('the Farm collection is exactly what the roster says it is', () => {
  it('holds all sixteen members, in the roster\'s own order', () => {
    expect(FARM_SPECIES.map(s => s.id)).toEqual([
      'animal-sheep', 'animal-goat', 'animal-horse', 'animal-donkey',
      'animal-goose', 'animal-turkey', 'animal-llama', 'animal-alpaca',
      'animal-rooster', 'animal-ox', 'animal-mule', 'animal-chicken',
      'animal-guinea-fowl', 'animal-quail', 'animal-water-buffalo', 'animal-pigeon',
    ])
    expect(FARM_SPECIES).toHaveLength(16)
  })

  it('SHIPS COMPLETE: 16 of 16, with no member waiting on an unbuilt kit', () => {
    /*
     * Every collection built before this run has a hole in it and its own test
     * names the missing members — Garden's slow-worm, Home Pets' six, Africa's
     * three, Woodland's two game birds. Farm's entire membership lands on kits
     * that exist: nine on quadruped, seven on songbird.
     *
     * DO NOT "FIX" A FAILURE HERE BY DELETING A MEMBER. If a Farm species ever
     * has to be dropped, this assertion is the one that must be edited, in a
     * commit that says which animal was dropped and why — which is the whole
     * point of asserting completeness rather than counting to sixteen.
     */
    expect(ROSTER_MEMBERS).toHaveLength(16)
    const missing = ROSTER_MEMBERS.filter(id => !byId.has(id))
    expect(missing, 'Farm is complete — no member may be absent').toEqual([])
    expect(new Set(FARM_SPECIES.map(s => s.id)).size).toBe(16)
  })

  it('contains nothing that is not a Farm member of the roster', () => {
    for (const s of FARM_SPECIES) {
      expect(ROSTER_MEMBERS, `${s.id} is not in roster collection 'farm'`).toContain(s.id)
      expect(s.collection).toBe('farm')
      // `defineSpecies` takes the printed name from the roster; this proves it
      // was not overridden on the way past.
      expect(s.name).toBe(SPECIES_NAMES[s.id])
    }
  })

  it('puts every member on the kit its animal actually needs', () => {
    // Nine quadrupeds and seven songbirds. A bird on the quadruped kit is a
    // four-legged goose — roster §1's "kits before species" exists to stop that
    // and nothing else in the repo would notice.
    for (const s of FARM_SPECIES) {
      expect(s.kit, `${s.id} kit`).toBe(KIT_OF[s.id])
      expect(s.build?.kit, `${s.id} build kit`).toBe(KIT_OF[s.id])
    }
    const kits = FARM_SPECIES.map(s => s.kit)
    expect(kits.filter(k => k === 'quadruped')).toHaveLength(9)
    expect(kits.filter(k => k === 'songbird')).toHaveLength(7)
  })

  it('records no guessed threat status', () => {
    // Roster §5 wants statuses "true, checkable" with a real `checkedDate`.
    // Absent is honest; remembered only looks checked. See `registry.ts`.
    for (const s of FARM_SPECIES) expect(s.threat).toBeUndefined()
  })

  it('shares no id with the frozen live 24, and is in the registry', () => {
    // The live 24 are frozen (roster §1). A Farm record colliding with one would
    // restyle an animal a child already owns — brief §19.
    for (const s of FARM_SPECIES) {
      const r = speciesRecord(s.id)
      expect(r, `${s.id} must be in the registry`).toBeDefined()
      expect(r!.kit, `${s.id} must not resolve to a frozen GLB`).not.toBe('kenney')
      expect(r!.collection).toBe('farm')
    }
  })
})

describe('every Farm build actually constructs', () => {
  it('returns a real, non-empty THREE.Group for all sixteen', () => {
    for (const s of FARM_SPECIES) {
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

  it('stands every member inside a walkable keep-out and inside the pack family', () => {
    /*
     * The hard ceiling is 1.6 — the kit's own worked "plausible stoat"
     * (`kit-quadruped.test.ts:93`) measures 1.59, so it is the widest thing the
     * kit's author called plausible — and Farm's own worst is 1.379, the water
     * buffalo, with the horse just behind it at 1.371. Both were bought back
     * from over the line: the buffalo measured 1.59 while it wore a `snout`.
     *
     * The W/H window is `species-silhouette.test.ts`'s: below 0.5 a creature
     * stops looking like a member of this pack, and birds run LOW (the kit's own
     * swan is 0.552). Farm's narrowest is the rooster at 0.576.
     */
    for (const s of FARM_SPECIES) {
      const [w, h, d] = dims(buildSpecies(s.build!))
      expect(h, `${s.id} height`).toBeGreaterThanOrEqual(1.2)
      // A float hair over, because the kit fits by dividing: a 2.30 species
      // measures 2.3000000000000003 and an exact bound is a false alarm.
      expect(h, `${s.id} height`).toBeLessThanOrEqual(2.401)
      expect(w / h, `${s.id} is too narrow for this pack`).toBeGreaterThan(0.5)
      expect(w / h, `${s.id} is too wide for this pack`).toBeLessThan(1.45)
      expect(Math.max(w, d) / 2, `${s.id} keep-out`).toBeLessThan(1.6)
    }
  })

  it('holds the whole collection to the ratchet it measured', () => {
    // Farm's own worst, so this is a ratchet on measured fact exactly as
    // `species-silhouette.test.ts` keeps one per collection. Lower it when the
    // collection is retuned; never raise it to make a new species fit.
    const worst = Math.max(...FARM_SPECIES.map(s => keepOut(s.id)))
    expect(worst).toBeLessThanOrEqual(1.38)
  })
})

describe('no two Farm species are silhouette-twins', () => {
  it('differs on parts — or by a real margin of proportion', () => {
    for (const a of FARM_SPECIES) {
      for (const b of FARM_SPECIES) {
        if (a.id >= b.id) continue
        if (a.kit !== b.kit) continue // a goose and a goat are never confusable
        const why = `${a.id} and ${b.id} wear the same parts and are within a rounding error of each other`
        if (a.kit === 'quadruped') {
          const [x, y] = [quad(a.id), quad(b.id)]
          expect(!sameQuadParts(x, y) || farApartQuad(x, y), why).toBe(true)
        } else {
          const [x, y] = [bird(a.id), bird(b.id)]
          expect(!sameBirdParts(x, y) || farApartBird(x, y), why).toBe(true)
        }
      }
    }
  })

  it('builds sixteen measurably different creatures, not sixteen records', () => {
    // The paper difference above is necessary and not sufficient: both kits fit
    // every creature to exactly its `height`, so a proportion can be edited and
    // change nothing you could see. This measures what was actually built.
    const seen = new Map<string, string>()
    for (const s of FARM_SPECIES) {
      const sig = signature(buildSpecies(s.build!))
      expect(seen.has(sig), `${s.id} is identical to ${seen.get(sig)}`).toBe(false)
      seen.set(sig, s.id)
    }
    expect(seen.size).toBe(16)
  })

  it('gives every member its own height, so no two are the same size on screen', () => {
    // The field scales every pet by the same 0.16 (`pets.ts:643`), so height IS
    // size on screen and it is the first thing a child compares. With four
    // equids and three bovines in one collection, two of them landing on the
    // same height is a real risk and this is the cheapest guard against it.
    const heights = FARM_SPECIES.map(s => (s.build as { height: number }).height)
    expect(new Set(heights).size).toBe(16)
  })

  it('gives no two members the same palette', () => {
    const seen = new Set<string>()
    for (const s of FARM_SPECIES) {
      const p = (s.build as { palette: KitPalette }).palette
      const key = [p.coat, p.belly, p.detail, p.accent].join('/')
      expect(seen.has(key), `${s.id} shares a palette with another member`).toBe(false)
      seen.add(key)
    }
  })
})

/* ------------------------------------------------- roster §4, group by group --- */

describe('roster §4: the four equids — horse, donkey, mule and the built pony', () => {
  it('makes the horse plainly the big one against the already-built animal-pony', () => {
    /*
     * `animal-pony` is built in `home-pets.ts` and its own comment says why it
     * stopped at 1.95: "a horse would want to break that ceiling and a pony must
     * not". This is the animal that breaks it. Height is real size on screen
     * (`pets.ts:643` scales every pet by the same 0.16), so it is the honest
     * lever, and the gap is deliberately larger than the 0.14 margin.
     */
    const pony = speciesRecord('animal-pony')
    expect(pony, 'the pony must still be built in home-pets').toBeDefined()
    const ponyBuild = pony!.build as QuadrupedBuild
    const horse = quad('animal-horse')
    expect(horse.height - ponyBuild.height).toBeGreaterThan(0.3)
    expect(horse.legs).toBeGreaterThan(ponyBuild.legs)
    // A horse's head is small against its body; a pony's famously is not.
    expect(horse.head).toBeLessThan(ponyBuild.head)
    expect(colourGap(horse.palette.coat, ponyBuild.palette.coat)).toBeGreaterThan(60)
  })

  it('separates horse, donkey and mule on ears, mane, size and colour', () => {
    const [horse, donkey, mule] = [
      quad('animal-horse'), quad('animal-donkey'), quad('animal-mule'),
    ]
    // THE EARS. The two long-eared equids are the donkey and the mule; the horse
    // and the pony are pointed. This is the field a child names.
    expect(donkey.ears).toBe('long')
    expect(mule.ears).toBe('long')
    expect(horse.ears).toBe('pointed')
    // THE MANE. The donkey has none — a donkey's mane is a short upright brush,
    // not a horse's fall — which is what splits it from the mule, its nearest
    // relative in every other field.
    expect(horse.extras).toContain('mane')
    expect(mule.extras).toContain('mane')
    expect(donkey.extras ?? []).not.toContain('mane')
    // SIZE, in the order the three animals really stand: horse > mule > donkey,
    // each gap wider than the margin that counts as a real difference.
    expect(horse.height - mule.height).toBeGreaterThanOrEqual(MARGIN.height)
    expect(mule.height - donkey.height).toBeGreaterThanOrEqual(MARGIN.height)
    expect(horse.legs - mule.legs).toBeGreaterThanOrEqual(MARGIN.legs)
    expect(mule.legs - donkey.legs).toBeGreaterThanOrEqual(MARGIN.legs)
    // COLOUR: bay, mouse grey, bay-brown — all three visibly apart, and the
    // donkey is the only grey (its coat is near-neutral, red ≈ blue).
    expect(Math.abs(((donkey.palette.coat >> 16) & 255) - (donkey.palette.coat & 255)))
      .toBeLessThan(20)
    for (const [a, b] of [[horse, donkey], [horse, mule], [donkey, mule]] as const) {
      expect(colourGap(a.palette.coat, b.palette.coat)).toBeGreaterThan(60)
    }
  })

  it('builds four measurably different equids, counting the pony', () => {
    // The cross-file half of the check: the pony is in another collection and no
    // other test compares it with these three.
    const ids = ['animal-horse', 'animal-donkey', 'animal-mule']
    const sigs = new Map<string, string>()
    for (const id of ids) sigs.set(signature(built(id)), id)
    const pony = speciesRecord('animal-pony')!
    sigs.set(signature(buildSpecies(pony.build!)), 'animal-pony')
    expect(sigs.size, 'two equids build the same creature').toBe(4)
  })
})

describe('roster §4: the camelids — llama and alpaca', () => {
  it('separates them on height, leg, face and fleece', () => {
    const [llama, alpaca] = [quad('animal-llama'), quad('animal-alpaca')]
    // Height and leg: the llama is the tall upright one by a clear margin.
    expect(llama.height - alpaca.height).toBeGreaterThanOrEqual(0.25)
    expect(llama.legs - alpaca.legs).toBeGreaterThanOrEqual(0.25)
    // Face: the llama's is long (a `snout`, and the smallest head in Farm); the
    // alpaca's is short and blunt, so it has no snout at all.
    expect(llama.extras).toContain('snout')
    expect(alpaca.extras ?? []).not.toContain('snout')
    expect(alpaca.head - llama.head).toBeGreaterThanOrEqual(MARGIN.head)
    for (const s of FARM_SPECIES) {
      if (s.kit !== 'quadruped' || s.id === 'animal-llama') continue
      expect(llama.head, `llama v ${s.id}`).toBeLessThan(quad(s.id).head)
    }
    // Fleece: the alpaca wears it over the BACK (`hump`), the llama at the neck
    // (`mane`). Two different parts, in two different places.
    expect(alpaca.extras).toContain('hump')
    expect(llama.extras).toContain('mane')
    // And the palette a child will actually use: cream against warm tan.
    expect(lum(alpaca.palette.coat) - lum(llama.palette.coat)).toBeGreaterThan(0.1)
  })
})

describe('roster §4: the bovines — ox, water buffalo, the frozen cow, the built Cape buffalo', () => {
  it('leaves the frozen animal-cow untouched and stands both bovines apart from it', () => {
    // `animal-cow` is one of the frozen 24 (roster §1): no build, never
    // restyled, so every separation is made on this side of the line.
    expect(speciesRecord('animal-cow')?.kit).toBe('kenney')
    expect(speciesRecord('animal-cow')?.build).toBeUndefined()
    // Both of Farm's bovines are horned, which the pack's dairy cow is not, and
    // both are solid dark colours rather than the cow's black-and-white.
    for (const id of ['animal-ox', 'animal-water-buffalo']) {
      const b = quad(id)
      expect(b.extras, `${id} horns`).toContain('horns')
      expect(b.height, `${id} is the bigger animal`).toBeGreaterThan(2.0)
      expect(lum(b.palette.coat), `${id} is not a white-patched dairy cow`).toBeLessThan(0.5)
    }
  })

  it('separates the ox from the water buffalo on the shoulder, the tail and the colour', () => {
    const [ox, buffalo] = [quad('animal-ox'), quad('animal-water-buffalo')]
    // The working shoulder is the ox's and nothing else's.
    expect(ox.extras).toContain('hump')
    expect(buffalo.extras ?? []).not.toContain('hump')
    // Tail: a water buffalo's is a bare rope; an ox's is a brush.
    expect(ox.tail).toBe('tuft')
    expect(buffalo.tail).toBe('thin')
    // Size and head, in the order the two animals really stand.
    expect(buffalo.height - ox.height).toBeGreaterThanOrEqual(MARGIN.height)
    expect(ox.head - buffalo.head).toBeGreaterThanOrEqual(MARGIN.head)
    // Warm red-brown against cold blue-slate: the ox's coat is redder than it is
    // blue, and the buffalo's is bluer than it is red.
    expect(((ox.palette.coat >> 16) & 255) - (ox.palette.coat & 255)).toBeGreaterThan(40)
    expect((buffalo.palette.coat & 255) - ((buffalo.palette.coat >> 16) & 255))
      .toBeGreaterThan(5)
  })

  it('holds the water buffalo apart from Africa\'s already-built Cape buffalo', () => {
    /*
     * THE PAIR I AM LEAST CONFIDENT ABOUT, and it is asserted rather than left
     * as prose. `animal-buffalo` is the Cape buffalo, built in `africa.ts`: a big
     * dark horned bovine with round ears and a tufted tail. So is this. They are
     * two real animals that genuinely look alike, in two different collections,
     * and no other test in the repo compares them.
     *
     * Africa is not this collection's file to edit, so every separation is
     * one-sided: taller, differently tailed, and a cold grey against a warm
     * brown-black. If a future retune of Africa's buffalo makes this fail, the
     * fix is to move Farm's water buffalo further away — not to relax this.
     */
    const cape = speciesRecord('animal-buffalo')
    expect(cape, 'africa should still ship the Cape buffalo').toBeDefined()
    const capeBuild = cape!.build as QuadrupedBuild
    const buffalo = quad('animal-water-buffalo')
    expect(buffalo.height).toBeGreaterThan(capeBuild.height)
    expect(buffalo.tail).not.toBe(capeBuild.tail)
    expect(colourGap(buffalo.palette.coat, capeBuild.palette.coat)).toBeGreaterThan(30)
    expect(signature(built('animal-water-buffalo')))
      .not.toBe(signature(buildSpecies(cape!.build!)))
  })
})

describe('roster §4: the galliforms — rooster, chicken and the frozen chick', () => {
  it('leaves the frozen animal-chick alone and keeps the hen off its colour', () => {
    // `animal-chick` is frozen (roster §1): the pack's tiny yellow ball of down.
    // A yellow chicken would be a big chick, so the hen's coat is a russet brown
    // and its belly a soft buff — nowhere near the chick's yellow.
    expect(speciesRecord('animal-chick')?.kit).toBe('kenney')
    expect(speciesRecord('animal-chick')?.build).toBeUndefined()
    const hen = bird('animal-chicken')
    const [r, g, b] = [
      (hen.palette.coat >> 16) & 255, (hen.palette.coat >> 8) & 255, hen.palette.coat & 255,
    ]
    // Yellow is high red AND high green against low blue. This is high red,
    // MIDDLING green: a brown, not a yellow.
    expect(g, 'the hen must not be a big yellow chick').toBeLessThan(r * 0.8)
    expect(b).toBeLessThan(g)
  })

  it('makes the rooster the tall decorated one and the hen the small plain one', () => {
    const [rooster, hen] = [bird('animal-rooster'), bird('animal-chicken')]
    // The comb is `crest` and only the rooster wears it; both wear the wattle.
    expect(rooster.extras).toContain('crest')
    expect(rooster.extras).toContain('wattle')
    expect(hen.extras).toContain('wattle')
    expect(hen.extras ?? []).not.toContain('crest')
    // Three extras against one: a rooster IS its decorations, a hen is not.
    expect((rooster.extras ?? []).length).toBe(3)
    expect((hen.extras ?? []).length).toBe(1)
    // The arched sickle tail against a stub.
    expect(rooster.tail).toBe('long')
    expect(hen.tail).toBe('short')
    // Stance and size: it stands taller and struts on longer legs.
    expect(rooster.height - hen.height).toBeGreaterThanOrEqual(0.3)
    expect(rooster.legs - hen.legs).toBeGreaterThanOrEqual(0.3)
    expect(hen.body).toBeLessThan(rooster.body)
  })

  it('keeps the other three galliform-ish birds off both of them', () => {
    // Turkey, guinea fowl and quail share the farmyard with the pair above, and
    // each is held apart by a marking the others cannot have.
    const turkey = bird('animal-turkey')
    const guinea = bird('animal-guinea-fowl')
    const quail = bird('animal-quail')
    expect(turkey.tail).toBe('fan')
    expect(guinea.extras).toContain('speckles')
    expect(quail.extras).toContain('plume')
    // Only one bird in Farm wears each of these, which is what makes them reads.
    for (const mark of ['speckles', 'plume', 'crest'] as const) {
      const wearers = FARM_SPECIES
        .filter(s => s.kit === 'songbird')
        .filter(s => (bird(s.id).extras ?? []).includes(mark))
      expect(wearers.map(s => s.id), `${mark} must be unique in Farm`).toHaveLength(1)
    }
    // The quail is the smallest thing in the collection, by a clear margin.
    for (const s of FARM_SPECIES) {
      if (s.id === 'animal-quail') continue
      expect((s.build as { height: number }).height, `quail v ${s.id}`)
        .toBeGreaterThan(quail.height + 0.1)
    }
  })
})

describe('roster §4: the goose, and the duck that does not exist yet', () => {
  it('leaves animal-duck room by being big and long-necked', () => {
    /*
     * `animal-duck` is rostered in Birds and is NOT BUILT. Whoever builds it will
     * reach for `beak: 'flat'`, `webbed-feet` and a short tail, because that is
     * what a duck is — the songbird kit's own comments name the duck for all
     * three. So the goose cannot be separated from the duck by parts and must
     * not try; it is separated by size and neck, which a duck can never take.
     *
     * If this test ever runs with a built duck in the registry, it also checks
     * the real thing rather than the ghost.
     */
    const goose = bird('animal-goose')
    expect(goose.beak).toBe('flat')
    expect(goose.extras).toContain('webbed-feet')
    // The tallest and the longest-necked bird in Farm, both by a clear margin.
    for (const s of FARM_SPECIES) {
      if (s.kit !== 'songbird' || s.id === 'animal-goose') continue
      expect(goose.height, `goose v ${s.id}`).toBeGreaterThan(bird(s.id).height)
      expect(goose.neck - bird(s.id).neck, `goose neck v ${s.id}`).toBeGreaterThan(0.5)
    }
    const duck = speciesRecord('animal-duck')
    if (duck?.build?.kit === 'songbird') {
      expect(goose.height - duck.build.height, 'the goose must stay the big one')
        .toBeGreaterThan(0.3)
      expect(goose.neck - duck.build.neck).toBeGreaterThan(0.5)
    }
  })
})

describe('the collection is data, not geometry', () => {
  it('names only parts the closed extras lists allow, and no more than three', () => {
    // `types.ts` closes `QuadrupedExtra` and `SongbirdExtra` so a collection
    // cannot invent a part per species. The compiler enforces the names; this
    // enforces roster §1's "two or three detail parts", which nothing else does.
    const seen = new Set<string>()
    for (const s of FARM_SPECIES) {
      const extras = (s.build as { extras?: readonly string[] }).extras ?? []
      expect(extras.length, `${s.id} carries too many extras`).toBeLessThanOrEqual(3)
      expect(new Set(extras).size, `${s.id} repeats an extra`).toBe(extras.length)
      for (const e of extras) seen.add(e)
    }
    // And the collection uses its vocabulary rather than one part sixteen times.
    expect(seen.size).toBeGreaterThanOrEqual(8)
  })

  it('is a plain readonly array of Species with no shared build objects', () => {
    const builds = FARM_SPECIES.map((s: Species) => s.build)
    expect(new Set(builds).size).toBe(16)
    for (const b of builds) expect(b).toBeDefined()
  })
})
