/**
 * The goldfish. Home Pets' sixteenth, the one that CLOSES the collection, and
 * its second legless member.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a goldfish can say,
 * and for this animal that is four things:
 *
 *   1. **`legs: false` takes 0.18125 out from under the hull, and the FIN RING
 *      puts it back — with the part that makes Kenney's fish a fish.** Measured
 *      here rather than cross-referenced, for the reason the corn snake's is: a
 *      species that inherits an argument instead of making it is a species
 *      nobody checked.
 *   2. **`box-19` IS ALSO THE TORTOISE'S SHELL RIM, and the whole difference
 *      between those two animals is one quarter turn.** The tortoise lays it
 *      FLAT into the ground plane; this one leaves it in its donor's own plane.
 *      Asserted both ways round, exactly as the corn snake asserts its coil
 *      against the slow worm's, so neither can drift into the other.
 *   3. **THE RIDGE COUNT IS EVEN, AND THAT IS A MEASUREMENT AND NOT A TASTE.**
 *      An odd count puts a station at z = 0, which is inside the fin ring's own
 *      0.130 half-thickness, and that part builds invisible inside the hoop and
 *      is paid for in full. The first build did it four times over. This is the
 *      most valuable assertion in the file: a future edit to `count` or `span`
 *      must go red here.
 *   4. **`wedge-04` is the corn snake's saddle too, and the two share nothing
 *      else.** Both are Home Pets, so the pair is asserted apart on rows, count
 *      and station set as well as on which shape they take.
 */
/* The species modules FIRST, and deliberately: each registers itself as it
 * defines its build (see `assembled/register.ts`), so importing them here is
 * what puts them on the register before `parts/index.ts` snapshots
 * `ASSEMBLED_BUILDS` below. The tortoise and the corn snake are here because
 * this animal shares a shape with each of them and says so. */
import { GOLDFISH_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-goldfish'
import { TORTOISE_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-tortoise'
import { CORN_SNAKE_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-corn-snake'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, HULL_BOTTOM_Y, PACK_HEIGHT_MIN, LEG_ROW,
  MODEL_TRIS_MIN, MODEL_VERTS_MIN,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-goldfish',
  parts: ['box-19', 'box-20', 'plate-03', 'plate-08', 'wedge-04', 'wedge-15'],
  // The hull's own 1.250 plus the leg row TWICE: the ring is concentric with the
  // body, so whatever it stands proud of the back it also reaches below the
  // belly. 2 x 0.80625, and nothing on the animal reaches past it.
  height: 1.6125,
  verts: 480,
  tris: 758,
  // The fin ring is the biggest thing after the hull and it is halved in
  // thickness to keep it there — the tortoise's own halving, reused. At the
  // ring's own 0.520 this would be 1.66 and the ring would be a second mass.
  massRatio: 3,
  // One: the chamfer row's own -45 turn onto its face. The fin is NOT spun and
  // neither is the tail, which is the point of two of the tests below, so this
  // number is deliberately small and said out loud.
  spinsAtLeast: 1,
  // The point of the species.
  legs: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-goldfish')
  g.updateMatrixWorld(true)
  return g
}
const named = (g: THREE.Group, prefix: string): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh && (m.name === prefix || m.name.startsWith(`${prefix}-`))) out.push(m)
  })
  return out
}
const counts = (g: THREE.Group): { verts: number; tris: number } => {
  let verts = 0, tris = 0
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    verts += m.geometry.getAttribute('position').count
    tris += m.geometry.getIndex()!.count / 3
  })
  return { verts, tris }
}
const boxOf = (o: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(o)
const volumeOf = (b: THREE.Box3): number => {
  const s = b.getSize(new THREE.Vector3())
  return s.x * s.y * s.z
}
/** The z stations one ridge row actually places, off the built meshes. */
const stationsZ = (g: THREE.Group, prefix: string): number[] => {
  const seen = new Set<string>()
  for (const m of named(g, prefix)) {
    m.updateMatrixWorld(true)
    seen.add(m.getWorldPosition(new THREE.Vector3()).z.toFixed(4))
  }
  return [...seen].map(Number).sort((a, b) => a - b)
}

describe('animal-goldfish: the fish the swim kit was never needed for', () => {
  it('has no legs, and nothing else stands in for them', () => {
    // `legs` is structural in the quadruped kit — four boxes, always built,
    // clamped at 0.25 — so a fish cannot live there, and the `swim` kit that
    // would have taken it was never built. This kit says it in one field.
    expect(GOLDFISH_ASSEMBLY.features.some(f => f.part === LEG_ROW.part)).toBe(false)
    expect(GOLDFISH_ASSEMBLY.features.some(f => f.name === 'leg')).toBe(false)
    // And no ears, no snout and no nose: a fish has no external ear at all and
    // no muzzle, and at 0.16 scale either one would read as a mammal.
    for (const role of ['ear', 'snout', 'nose']) {
      expect(GOLDFISH_ASSEMBLY.features.some(f => f.name === role), role).toBe(false)
    }
  })

  it('would be UNDER the pack floor without its fin ring, which is why the ring is there', () => {
    /*
     * The argument for the whole species, measured rather than asserted in a
     * comment. Strip the ring and the animal is a hull on nothing: the 0.18125
     * the leg row was holding is simply gone, and neither the tail nor the
     * scales reaches down to pay it back.
     */
    const g = build()
    const fins = named(g, 'fin')
    expect(fins, 'the fin must exist to be removed').toHaveLength(1)
    for (const f of fins) f.removeFromParent()
    g.updateMatrixWorld(true)
    const without = boxOf(g)
    // The hull's own bottom is HULL_BOTTOM_Y off the ground with nothing under it.
    expect(without.min.y).toBeCloseTo(HULL_BOTTOM_Y, 4)
    // And the legless animal is short of the pack's own floor, which is what
    // `PACK_HEIGHT_MIN` refuses. The hull's own 1.250 plus what the scales stand
    // proud of the chamfer, against 1.43.
    expect(without.max.y - without.min.y).toBeLessThan(PACK_HEIGHT_MIN)
    expect(without.max.y - without.min.y).toBeGreaterThanOrEqual(1.250)
  })

  it('stands on the fin ring, which is SYMMETRIC about the hull centre', () => {
    /*
     * The ring's height is solved and not chosen. Its donor's attachment is
     * `y +1`, so it joins the hull's TOP face and its recorded burial transfers;
     * stretched until it stands `HULL_BOTTOM_Y` proud of the back it reaches
     * exactly `HULL_BOTTOM_Y` below the belly by symmetry, which lands its
     * underside on y = 0 — the plane the feet would have stood on.
     */
    const g = build()
    const whole = boxOf(g)
    // Feet on y = 0 exactly, and it is the FIN that gets there — not the hull,
    // not the tail and not a scale.
    const fin = boxOf(named(g, 'fin')[0] as THREE.Mesh)
    expect(fin.min.y).toBeCloseTo(0, 5)
    expect(fin.min.y).toBeCloseTo(whole.min.y, 5)
    // Proud of the hull's top by the leg row, and below its bottom by the same:
    // the ring is concentric with the body, which is where its donor wore it.
    const hull = boxOf(named(g, 'hull')[0] as THREE.Mesh)
    expect(fin.max.y - hull.max.y).toBeCloseTo(HULL_BOTTOM_Y, 5)
    expect(hull.min.y - fin.min.y).toBeCloseTo(HULL_BOTTOM_Y, 5)
    // So the ring — and therefore the animal — is the hull's own 1.250 plus the
    // leg row twice, which is 2 x the hull's own centre height.
    expect(fin.max.y - fin.min.y).toBeCloseTo(2 * 0.80625, 5)
    expect(whole.max.y - whole.min.y).toBeCloseTo(fin.max.y - fin.min.y, 5)
  })

  it('wears box-19 in its DONOR\'S plane — the tortoise turns the same shape flat', () => {
    /*
     * Same shape, opposite axis, and the whole difference between a goldfish and
     * a tortoise is that one quarter turn. `animal-tortoise.ts` spins `box-19`
     * `{ axis: 'x', deg: 90 }` — FLAT, into the ground plane, as the marginal
     * rim where a carapace overhangs — and overrides the attachment to `z -1` so
     * `sink: 0.5` straddles the join. This one does none of that: it stays
     * upright and concentric, which is a dorsal fin, a ventral fin and a gill
     * line in one part.
     *
     * Asserted BOTH WAYS ROUND, as the corn snake asserts its coil against the
     * slow worm's: an assertion only about this species would still pass on the
     * day somebody unspun the tortoise's.
     */
    const mine = GOLDFISH_ASSEMBLY.features.find(f => f.name === 'fin')
    const theirs = TORTOISE_ASSEMBLY.features.find(f => f.name === 'rim')
    expect(mine, 'the goldfish must have a fin').toBeDefined()
    expect(theirs, 'the tortoise must have a rim').toBeDefined()
    // One shape, and that is the point of the test rather than an aside.
    expect(mine?.part).toBe('box-19')
    expect(theirs?.part).toBe('box-19')

    // The goldfish's is in its donor's own plane: no spin, and no axis or
    // direction override either, so the burial it transfers is measured into
    // the face `box-19`'s own `y +1` attachment names.
    expect(mine?.spin, 'the goldfish\'s fin must not be spun').toBeUndefined()
    expect(mine?.axis).toBeUndefined()
    expect(mine?.dir).toBeUndefined()
    expect(partById('box-19')?.attachment?.axis).toBe('y')
    expect(partById('box-19')?.attachment?.dir).toBe(1)

    // The tortoise's is turned a quarter turn onto the ground plane, and carries
    // the axis override that makes its own `sink: 0.5` mean half its thickness.
    expect(theirs?.spin).toEqual([{ axis: 'x', deg: 90 }])
    expect(theirs?.axis).toBe('z')
    expect(theirs?.dir).toBe(-1)
    expect(theirs?.sink).toBeCloseTo(0.5, 9)

    // And the built consequence, which is what a child would actually see: the
    // goldfish's ring is tall and thin in z, the tortoise's is wide and thin in
    // y. Measured, so a spin moved into the geometry rather than onto the
    // feature would still be caught.
    const f = boxOf(named(build(), 'fin')[0] as THREE.Mesh).getSize(new THREE.Vector3())
    const r = boxOf(
      buildAssembled('animal-tortoise').getObjectByName('rim') as THREE.Mesh,
    ).getSize(new THREE.Vector3())
    expect(f.y, 'the goldfish\'s ring must be its TALL axis').toBeGreaterThan(f.z * 4)
    expect(r.z, 'the tortoise\'s rim must be its FLAT axis').toBeGreaterThan(r.y * 4)
  })

  it('halves the ring in thickness because rule 3 says so, on the tortoise\'s own number', () => {
    /*
     * Rule 3: a feature is a detail on the one mass, never a second one, and a
     * second large mass beside a body is the exact fault that scrapped 72
     * animals. At `box-19`'s own 0.520 this ring's bounding volume against the
     * hull's is UNDER the harness's ratio of 3; halved to 0.260 it clears it.
     *
     * The 0.5 is `animal-tortoise.ts:149`'s number, reused rather than
     * re-derived — the same discipline that made the corn snake take the slow
     * worm's coil transform unchanged rather than solve a second one.
     */
    const mine = GOLDFISH_ASSEMBLY.features.find(f => f.name === 'fin')
    const theirs = TORTOISE_ASSEMBLY.features.find(f => f.name === 'rim')
    expect(mine?.stretch?.[2]).toBe(theirs?.stretch?.[2])
    expect(mine?.stretch?.[2]).toBe(0.5)

    const g = build()
    const hull = volumeOf(boxOf(named(g, 'hull')[0] as THREE.Mesh))
    const fin = boxOf(named(g, 'fin')[0] as THREE.Mesh)
    const ring = volumeOf(fin)
    // Halved: a detail on the mass, and the number is pinned so a regression
    // that still scrapes past 3 is red here as well.
    expect(hull / ring).toBeGreaterThan(3)
    expect(hull / ring).toBeCloseTo(3.32, 2)
    // And the counterfactual the halving exists for, measured on the same box:
    // at the donor's own 0.520 the ring fails rule 3 outright.
    const size = fin.getSize(new THREE.Vector3())
    expect(size.z).toBeCloseTo(0.26, 4)
    expect(hull / (ring * 2), 'at box-19\'s own 0.520 this would be a second mass')
      .toBeLessThan(3)
  })

  it('SPACES THE SCALES OFF THE RING — every station clears its half-thickness', () => {
    /*
     * THE MOST VALUABLE ASSERTION IN THIS FILE, and the one a future edit to
     * `count` or `span` has to go red on.
     *
     * The scale count is EVEN because an ODD count puts a station at z = 0,
     * which is exactly where the fin ring stands. A part there reaches 0.782 out
     * along the chamfer diagonal against the ring's own 0.788: it builds INSIDE
     * the hoop, invisible, and is paid for in full at 38 triangles a copy. The
     * first build of this species did that four times over.
     *
     * So this is not "the count is 4" — it is the measurement that makes 4 the
     * answer, taken off the built meshes: no scale may stand within the ring.
     */
    const g = build()
    const halfThick = boxOf(named(g, 'fin')[0] as THREE.Mesh).getSize(new THREE.Vector3()).z / 2
    expect(halfThick).toBeCloseTo(0.130, 4)

    const stations = stationsZ(g, 'scale')
    // Even, which is what keeps z = 0 empty, and symmetric about the middle.
    expect(stations.length % 2, `stations ${stations.join(', ')}`).toBe(0)
    expect(stations.map(z => Number((-z).toFixed(4))).sort((a, b) => a - b)).toEqual(stations)
    for (const z of stations) {
      expect(Math.abs(z), `a scale stands at z = ${z.toFixed(4)}, inside the fin ring`)
        .toBeGreaterThan(halfThick)
    }
    // The pack's own stations, pinned: +/-0.500 and +/-0.167, straddling the
    // ring's 0.130 with 0.037 to spare.
    expect(stations.map(z => Number(z.toFixed(3)))).toEqual([-0.5, -0.167, 0.167, 0.5])
    expect(Math.min(...stations.map(Math.abs)) - halfThick).toBeCloseTo(0.037, 3)
  })

  it('shares wedge-04 with the CORN SNAKE and shares nothing else with it', () => {
    /*
     * Two Home Pets on one album page wearing the pack's most-donated small
     * wedge. Sharing the shape is fine and is what rule 1 wants — the bank is
     * small and `wedge-04` is also a bunny tooth, a chick ear, a monkey ear and
     * a penguin ear — but two animals wearing it the SAME way would be one
     * animal twice, so every axis it is spent on is asserted apart.
     */
    const mine = GOLDFISH_ASSEMBLY.features.filter(f => f.name?.startsWith('scale'))
    const theirs = CORN_SNAKE_ASSEMBLY.features.filter(f => f.name?.startsWith('saddle'))
    expect(mine.every(f => f.part === 'wedge-04')).toBe(true)
    expect(theirs.every(f => f.part === 'wedge-04')).toBe(true)

    // ROWS. The snake spends §8's whole half turn — top, both chamfers, both
    // sides, five rows — to make a cylinder read round. The fish spends the
    // chamfers alone: its top face is where the dorsal fin already is.
    expect(mine.map(f => f.name)).toEqual(['scale-chamfer'])
    expect(theirs.map(f => f.name).sort())
      .toEqual(['saddle-chamfer', 'saddle-side', 'saddle-top'])

    // COUNT and STATIONS. Four against three, and the snake's odd count puts a
    // saddle on z = 0 — which is right for an animal with nothing there, and is
    // exactly what this species cannot do.
    const row = (f: typeof mine[number]): { count: number; z: number } => {
      const p = f.placement
      if (p.kind !== 'row') throw new Error(`${f.name} is not a row`)
      return { count: p.count, z: p.from[2] }
    }
    expect(row(mine[0]!).count).toBe(4)
    expect(row(theirs[0]!).count).toBe(3)
    expect(row(mine[0]!).z).toBeCloseTo(0.5, 6)
    expect(row(theirs[0]!).z).toBeCloseTo(0.375, 6)
    expect(stationsZ(build(), 'scale'))
      .not.toEqual(stationsZ(buildAssembled('animal-corn-snake'), 'saddle'))
  })

  it('takes the lion\'s tail as a PURE donor transfer except for its height', () => {
    /*
     * The bank has no fin, no flipper and no fluke — measured, and
     * `docs/how-the-animals-are-made.md` §14 names that absence as the reason
     * Ocean cannot be built at all. `wedge-15` is the only one of the pack's
     * seven tails nobody has spent, and thin, tall and pointed backwards it is
     * the one shape here that can be a vertical caudal fin.
     *
     * Everything about it is the donor's — its own facing, its own recorded
     * burial, no spin, no stretch — except the ONE number a fish disagrees with
     * the lion about: a lion's tail roots high on the rump, a fish's continues
     * the body.
     */
    const tail = GOLDFISH_ASSEMBLY.features.find(f => f.name === 'tail')
    const donor = partById('wedge-15')
    expect(tail?.part).toBe('wedge-15')
    expect(donor, 'wedge-15 must be in the bank').toBeDefined()
    expect(tail?.spin, 'the tail must not be spun').toBeUndefined()
    expect(tail?.stretch, 'the tail must not be stretched').toBeUndefined()
    expect(tail?.axis, 'the tail must keep the donor\'s own facing').toBeUndefined()
    expect(tail?.dir).toBeUndefined()
    expect(donor?.attachment?.axis).toBe('z')
    expect(donor?.attachment?.dir).toBe(-1)
    // The donor's OWN recorded burial, taken from the bank rather than retyped.
    expect(tail?.sink).toBeCloseTo(donor?.attachment?.sunkFractionMean as number, 9)

    const at = (tail?.placement as { at: readonly number[] }).at
    // x on the midline and z on this hull's own rear face: the donor transfer,
    // unchanged. Only y departs, and it departs to the body's own centre.
    expect(at[0]).toBe(0)
    expect(at[2]).toBeCloseTo(-0.625, 6)
    expect(at[1]).toBeCloseTo(0.80625, 6)
    expect(at[1]).not.toBeCloseTo(donor?.offset[1] as number, 3)
  })

  it('is held over rule 9\'s FLOOR by the tail, which is where the vertices come from', () => {
    /*
     * Rule 9's budget is a FLOOR as well as a ceiling, the floor was measured
     * over 24 animals that all carry four legs, and a fish carries none. Kenney's
     * own fish — cube, hoop, two eye cards, a mouth — is 242 triangles and 156
     * vertices against floors of 422 and 405.
     *
     * The TAIL is what closes the vertex half of that in one part, and the
     * vertex half is the binding one: take it off and the model still clears the
     * triangle floor comfortably, and falls straight through the vertex floor.
     * So the honest assertion is on vertices, and the triangle count is asserted
     * as the thing it actually is — headroom.
     */
    const g = build()
    const whole = counts(g)
    expect(whole.verts).toBe(480)
    expect(whole.tris).toBe(758)

    const tails = named(g, 'tail')
    expect(tails, 'the tail must exist to be removed').toHaveLength(1)
    // The heaviest part on the animal by a distance, and the count is the
    // bank's own rather than retyped here.
    const mesh = tails[0] as THREE.Mesh
    expect(mesh.geometry.getIndex()!.count / 3).toBe(partById('wedge-15')?.tris)
    for (const t of tails) t.removeFromParent()
    const without = counts(g)

    // THE FLOOR THE TAIL CARRIES, and nothing else on this animal is big enough
    // to pay it: the tail is 114 vertices of the model's 480, and taking them
    // off drops it through the pack's own floor of 405.
    expect(whole.verts - without.verts).toBe(114)
    expect(without.verts, 'without the lion\'s tail this fish is under the pack\'s vertex floor')
      .toBeLessThan(MODEL_VERTS_MIN)
    // And the triangle floor is NOT what the tail is holding — the scales are.
    // Said out loud rather than left implied, because the species file's own
    // "it takes the model from 242 to 454 in one step" is about the build order
    // and not about what would break first.
    expect(without.tris).toBeGreaterThan(MODEL_TRIS_MIN)
  })

  it('carries the unreviewed-palette flag, because nobody has signed these colours off', () => {
    // home-pets.ts never held a record for this species, so it never held
    // colours for it either — and the TAIL is a look rather than a measurement,
    // which is on the same flag. Both are where Joe reads them.
    expect(GOLDFISH_ASSEMBLY.flag).toBeTruthy()
    expect(GOLDFISH_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
    expect(GOLDFISH_ASSEMBLY.flag).toMatch(/TAIL/)
  })
})
