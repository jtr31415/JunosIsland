/**
 * The rooster. Farm's cock, and `animal-chicken.ts` with three things added.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing rotated at a node, rule 9's budgets, the shared texture, the measured
 * pupil, the leg row, the height band. This file is what only a rooster can say,
 * and because it is DERIVED it asserts the derivation itself: every number below
 * that separates this bird from the hen is computed against
 * `CHICKEN_ASSEMBLY`'s own, so the pair cannot drift apart silently.
 *
 *   1. **The COMB is the hen's dial, inverted.** She buries `cone-01` at 8/16
 *      and says in writing that the shape's own burial is the rooster's; this
 *      one omits `sink` and recovers the bank's recorded y as evidence.
 *   2. **FIVE points fit and SIX do not**, and the bound is computed rather than
 *      quoted — which is the same assertion her test makes from the other side.
 *   3. **The step stays at 2/16 and the reason is the footprint, not the meet.**
 *      At this burial 3/16 WOULD meet, so the test proves that first and then
 *      proves it does not fit.
 *   4. **The extra comb is all BLADE**: both birds carry the identical free
 *      serration and differ only in solid wall.
 *   5. **The wattle is `box-09` refused on her own number**, and the ratio is
 *      asserted rather than asserted about.
 *   6. **`chamfer: true` was reserved for this animal and cannot be used**, and
 *      the test builds the rotation it would have emitted to show why.
 *   7. **`TAIL_SINK` is forced by `PACK_HEIGHT_MAX`**, with the two shallower
 *      burials measured off the real geometry rather than described.
 *   8. **What is still unspent** — the fan, `box-41`, `belly`, `byBand` and the
 *      tail's own second band — because four siblings are still to come.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, ROOSTER_ASSEMBLY, CHICKEN_ASSEMBLY, COCKATIEL_ASSEMBLY,
  CANARY_ASSEMBLY, LEG_ROW, PACK_HEIGHT_MAX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { MOTIONS } from '../../src/island/species/parts/motion'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-rooster',
  parts: ['box-01', 'box-03', 'box-06', 'cone-01', 'plate-08', 'tube-02', 'wedge-15'],
  // The TAIL, not the comb: the sickle's topmost vertex, 0.0489 under the pack's
  // own 2.02 ceiling, which is what chose its burial.
  height: 1.9711,
  verts: 611,
  tris: 810,
  // TWO legs, not four. A bird.
  legs: 2,
  // The sickle is the biggest thing it wears now, not the wing — which is the
  // whole of what 212 triangles bought.
  massRatio: 9,
  // The tail, the wing pair, and the wattle pair turned upside down. The comb is
  // NOT one: five cones stand the way their own attachment does.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-rooster')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof ROOSTER_ASSEMBLY.features[number] =>
  ROOSTER_ASSEMBLY.features.find(f => f.name === name)!
const hen = (name: string): typeof CHICKEN_ASSEMBLY.features[number] =>
  CHICKEN_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** How far one of `box-03`'s flat faces reaches along another axis. */
const flatReach = (face: 0 | 1 | 2, along: 0 | 1 | 2): number => Math.max(
  ...points('box-03')
    .filter(q => Math.abs(Math.abs(q[face]) - 0.625) < 1e-6)
    .map(q => Math.abs(q[along])),
)

/** How far a part sticks out of the face it joins, at a given burial. */
const proud = (id: string, axis: 0 | 1 | 2, sink: number): number =>
  partById(id)!.size[axis]! * (1 - sink)

/**
 * `cone-01`'s own height along its attachment, measured off its POINTS — the
 * builder solves `shift = -s.lo - sink x extent` off the built span, and
 * `size[1]` is the same value rounded.
 */
const CONE_H = 2 * Math.max(...points('cone-01').map(q => Math.abs(q[1])))

/** The cone is a true point, so its cross-section falls linearly to zero. */
const coneWidth = (above: number): number =>
  partById('cone-01')!.size[2]! * (1 - above / CONE_H)

/** How far above its own base two cones a `step` apart stop touching. */
const separateAt = (step: number): number =>
  CONE_H * (1 - step / partById('cone-01')!.size[2]!)

const OWN_BURIAL = partById('cone-01')!.attachment!.sunkUnitsMean

describe('animal-rooster: the comb takes back the burial the hen gave up', () => {
  it('omits `sink` entirely, which recovers cone-01\'s OWN recorded y', () => {
    /*
     * `animal-chicken.ts` buries the same shape at 8/16 and says in as many
     * words that the shape's own 0.312222 is "the dial the ROOSTER needs". The
     * strongest way to take it back is not to write a number at all: with `sink`
     * omitted the builder uses the part's own `sunkFractionMean`, and at that
     * burial the shift lands each cone's centre on the bank's recorded offset —
     * the bee wears this cone on a crown at this hull's height.
     */
    const cone = partById('cone-01')!
    // The source omits `sink`; the builder fills in the part's own record, which
    // is what "no number of ours" looks like once it is resolved.
    for (let i = 1; i <= 5; i++) {
      expect(feature(`comb-${i}`).sink, `comb-${i}`).toBe(cone.attachment!.sunkFractionMean)
    }
    expect(hen('comb-front').sink).toBe(0.5)
    expect(hen('comb-front').sink).not.toBe(cone.attachment!.sunkFractionMean)
    expect(cone.attachment!.sunkFractionMean).toBeCloseTo(0.312222, 6)
    expect(OWN_BURIAL).toBeCloseTo(0.125, 6)
    const g = build()
    for (let i = 1; i <= 5; i++) {
      // Recovered to 0.0000084, and the whole of that gap is the bank's own
      // rounding: the builder solves the shift off the POINTS, which span
      // 0.4004, where `sunkFractionMean` is a fraction of the recorded 0.400356.
      const y = g.getObjectByName(`comb-${i}`)!.position.y
      expect(Math.abs(y - cone.offset[1]!), `comb-${i}`).toBeLessThan(1e-5)
    }
    expect(cone.offset[1]).toBeCloseTo(1.506428, 6)
    expect(Math.abs(CONE_H - partById('cone-01')!.size[1]!)).toBeLessThan(5e-5)
    // And it is the cockatiel's crest height exactly, because it is its number.
    expect(COCKATIEL_ASSEMBLY.features.find(f => f.name === 'crest')!.sink)
      .toBeCloseTo(cone.attachment!.sunkFractionMean, 9)
  })

  it('stands 37.55% more comb than the hen, with no stretch on either bird', () => {
    const mine = proud('cone-01', 1, partById('cone-01')!.attachment!.sunkFractionMean)
    const hers = proud('cone-01', 1, 0.5)
    expect(mine).toBeCloseTo(0.275356, 6)
    expect(hers).toBeCloseTo(0.200178, 6)
    expect(mine / hers - 1).toBeCloseTo(0.3755, 3)
    // Measured off the built meshes, not off the record.
    const g = build()
    expect(boxOf(g, 'comb-1').max.y - boxOf(g, 'hull').max.y).toBeCloseTo(mine, 4)
    // `stretch` is what the easy answer would have been, on either animal.
    for (const f of [...ROOSTER_ASSEMBLY.features, ...CHICKEN_ASSEMBLY.features]) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(ROOSTER_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('fits FIVE points on the crown and could not fit six', () => {
    /*
     * "Nothing floats" as arithmetic, the hen's own framing: the flat top ends
     * and the chamfer falls away 1:1, so a base buried `d` stays in real
     * geometry out to `topFlat + d`. The bound is computed here, not quoted.
     */
    const topFlat = flatReach(1, 2)
    expect(topFlat).toBeCloseTo(0.3125, 6)
    const bound = topFlat + OWN_BURIAL
    expect(bound).toBeCloseTo(0.4375, 6)
    const depth = partById('cone-01')!.size[2]!
    const footprint = (n: number): number => (n - 1) * 0.125 + depth
    expect(footprint(5)).toBeCloseTo(0.82857, 5)
    expect(footprint(5)).toBeLessThan(2 * bound)
    expect(2 * bound - footprint(5)).toBeCloseTo(0.04643, 5)
    expect(footprint(6)).toBeGreaterThan(2 * bound)
    // Five of them, all `cone-01`, all unspun, all on the midline.
    const comb = ROOSTER_ASSEMBLY.features.filter(f => f.name.startsWith('comb-'))
    expect(comb).toHaveLength(5)
    expect(CHICKEN_ASSEMBLY.features.filter(f => f.name.startsWith('comb-'))).toHaveLength(3)
    for (const f of comb) {
      expect(f.part).toBe('cone-01')
      expect(f.spin, `"${f.name}" is spun`).toBeUndefined()
      if (f.placement.kind === 'single') expect(f.placement.at[0]).toBe(0)
    }
    // CENTRED on the crown, which is both the anatomy and the only place it
    // goes: 0.023215 of slack at each end, and every station on the 1/16 grid.
    const g = build()
    const z = [1, 2, 3, 4, 5].map(i => g.getObjectByName(`comb-${i}`)!.position.z)
    expect(z).toEqual([0.25, 0.125, 0, -0.125, -0.25])
    for (const q of z) expect(Number.isInteger(q * 16)).toBe(true)
    expect(z[0]! + z[4]!).toBeCloseTo(0, 9)
    expect(bound - (z[0]! + depth / 2)).toBeCloseTo(0.023215, 5)
    // The hen's row is NOT centred: hers starts at the flat top's front edge.
    const front = hen('comb-front').placement
    if (front.kind === 'single') expect(front.at[2]).toBeCloseTo(topFlat - depth / 2, 9)
  })

  it('keeps 2/16 even though 3/16 would MEET here, because five would not fit', () => {
    /*
     * This is the one number of the hen's that does not invert, and the reason
     * is not the one she used. At her burial 3/16 leaves the points 0.023215
     * apart; at this shallower one the cone leaves the crown much wider and 3/16
     * genuinely overlaps. It is refused on FOOTPRINT instead.
     */
    const mineAtCrown = coneWidth(OWN_BURIAL)
    const hersAtCrown = coneWidth(CONE_H * 0.5)
    expect(hersAtCrown).toBeCloseTo(0.164285, 5)
    expect(mineAtCrown).toBeCloseTo(0.225994, 5)
    expect(0.1875).toBeGreaterThan(hersAtCrown)      // three spikes on a hen
    expect(0.1875).toBeLessThan(mineAtCrown)         // one blade on a cock
    expect(mineAtCrown - 0.1875).toBeCloseTo(0.038494, 5)
    // And it still cannot be had: five at 3/16, and even four, overrun the crown.
    const depth = partById('cone-01')!.size[2]!
    const bound = 2 * (flatReach(1, 2) + OWN_BURIAL)
    expect(4 * 0.1875 + depth).toBeGreaterThan(bound)
    expect(3 * 0.1875 + depth).toBeGreaterThan(bound)
    // So the step is the hen's, and the built stations prove it.
    const g = build()
    for (let i = 1; i < 5; i++) {
      const a = g.getObjectByName(`comb-${i}`)!.position.z
      const b = g.getObjectByName(`comb-${i + 1}`)!.position.z
      expect(a - b).toBeCloseTo(0.125, 9)
    }
    expect(mineAtCrown - 0.125).toBeCloseTo(0.100994, 5)
    expect(hersAtCrown - 0.125).toBeCloseTo(0.039285, 5)
  })

  it('spends all of the extra comb on BLADE, and carries the hen\'s own points', () => {
    /*
     * The finding this species is really about. Two cones a step apart separate
     * where the section has narrowed to the step, which is the same height above
     * the base on both birds because it is the same cone and the same 2/16. So
     * the free serrations are identical and every bit of the extra comb is the
     * solid wall carrying them — which is exactly what a cock's comb is.
     */
    const apart = separateAt(0.125)
    expect(apart).toBeCloseTo(0.248073, 5)
    const myBlade = apart - OWN_BURIAL
    const herBlade = apart - CONE_H * 0.5
    expect(myBlade).toBeCloseTo(0.123073, 5)
    expect(herBlade).toBeCloseTo(0.047873, 5)
    expect(myBlade / herBlade).toBeCloseTo(2.571, 3)
    // And the free point is IDENTICAL on the two birds, exactly rather than
    // nearly: it is `(H - burial) - (separation - burial)`, so the burial
    // cancels and it is `H - separation` for any burial at all. A deeper comb
    // cannot have shorter teeth; it can only have a deeper wall under them.
    const myPoints = (CONE_H - OWN_BURIAL) - myBlade
    const herPoints = (CONE_H - CONE_H * 0.5) - herBlade
    expect(myPoints).toBeCloseTo(herPoints, 12)
    expect(myPoints).toBeCloseTo(CONE_H - apart, 12)
    expect(myPoints).toBeCloseTo(0.152327, 5)
    // Costed, not waved through: five cones against the hen's three.
    expect(partById('cone-01')!.tris).toBe(34)
    expect(5 * 34 - 3 * 34).toBe(68)
  })
})

describe('animal-rooster: the wattle is taken, and box-09 is refused on the hen\'s number', () => {
  it('hangs cone-01 upside down in a PAIR, at 4.12x what box-09 could stand', () => {
    /*
     * `animal-chicken.ts` §5 refused a wattle three times over and the first
     * reason — "it is a third of the ROOSTER's separation" — is spent here. What
     * is left is her arithmetic, and it does not say "no wattle", it says "not
     * `box-09`": overruling that shape's own 0.000000 burial to 8/16 opens her
     * 0.108 window but leaves 0.039913 standing, 3.2% of the hull's width.
     */
    const boxProud = partById('box-09')!.size[2]! * 0.5
    expect(boxProud).toBeCloseTo(0.039913, 5)
    const mineProud = partById('cone-01')!.size[2]! / 2
    expect(mineProud).toBeCloseTo(0.164285, 5)
    expect(mineProud / boxProud).toBeCloseTo(4.12, 2)
    for (const id of ['box-09', 'box-10', 'plate-12', 'plate-16']) {
      expect(ROOSTER_ASSEMBLY.features.some(f => f.part === id), `${id} is worn`).toBe(false)
    }
    // The two flat cards were never candidates: `animal-budgie.ts` measured them
    // for this exact job and refused them for reading FLAT.
    for (const id of ['plate-12', 'plate-16']) expect(Math.min(...partById(id)!.size)).toBe(0)
    // Turned upside down, and a cock has TWO.
    const w = feature('wattle')
    expect(w.part).toBe('cone-01')
    expect(w.spin).toEqual([{ axis: 'x', deg: 180 }])
    expect(w.placement.kind).toBe('pair')
    expect(CHICKEN_ASSEMBLY.features.some(f => f.name.includes('wattle'))).toBe(false)
  })

  it('hangs the hen\'s whole comb\'s worth below the bill, and clears her window', () => {
    /*
     * `sink: 0.5` solves the shift to 0.000022, so the join plane is the cone's
     * own middle: half up inside the head and the bill, half hanging. The
     * hanging half is 0.200178 — the same length as the HEN'S ENTIRE COMB.
     */
    const bill = partById('tube-02')!
    const billBottom = bill.offset[1]! - bill.size[1]! / 2
    expect(billBottom).toBeCloseTo(0.60175, 5)
    const place = feature('wattle').placement
    if (place.kind === 'pair') {
      expect(place.at[1]).toBeCloseTo(billBottom, 9)
      expect(place.at[2]).toBe(0.625)
      // Each wattle is centred under one side of the bill's own half-width.
      expect(place.at[0]).toBeCloseTo(bill.size[0]! / 4, 5)
    }
    const g = build()
    const w = boxOf(g, 'wattle-r')
    expect(billBottom - w.min.y).toBeCloseTo(proud('cone-01', 1, 0.5), 3)
    expect(billBottom - w.min.y).toBeCloseTo(0.200178, 3)
    // It reaches 0.064285 clear IN FRONT of the bill, which is where a wattle
    // hangs — and its lower 0.09220 hangs past the flat face, held by the rest.
    expect(w.max.z).toBeCloseTo(0.789285, 4)
    expect(w.max.z - (bill.offset[2]! + bill.size[2]! / 2)).toBeCloseTo(0.064285, 4)
    const faceBottom = partById('box-03')!.offset[1]! - flatReach(2, 1)
    expect(faceBottom).toBeCloseTo(0.49375, 5)
    expect(faceBottom - w.min.y).toBeCloseTo(0.0922, 3)
    // One tissue, one slot: the comb and the wattle are painted from the same.
    expect(feature('wattle').paint.base).toBe('comb')
    expect(feature('comb-1').paint.base).toBe('comb')
  })
})

describe('animal-rooster: the sickle runs UP the chamfer, and the idiom could not', () => {
  it('refuses box-23 on silhouette and takes the bank\'s longest, thinnest tail', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    expect(feature('tail').part).toBe('wedge-15')
    // The longest of the seven, and 3.87 to one.
    const w = partById('wedge-15')!
    expect(Math.max(...tails.map(p => p.shape.longest))).toBeCloseTo(w.shape.longest, 9)
    expect(w.size[1]! / w.size[0]!).toBeCloseTo(3.87, 2)
    // `box-23` is a cylinder of fur: round to six decimals, and it barely tapers.
    const brush = partById('box-23')!
    expect(brush.size[1]).toBeCloseTo(brush.size[2]!, 6)
    expect(brush.shape.taper).toBeGreaterThan(0.96)
    expect(w.shape.taper).toBeLessThan(0.52)
    expect(ROOSTER_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    // Costed rather than waved through: 212 triangles, 2.65x the hen's stub.
    expect(w.tris).toBe(212)
    expect(w.tris / partById('box-18')!.tris).toBeCloseTo(2.65, 2)
  })

  it('cannot use `chamfer: true`, and the reason is the rotation it emits', () => {
    /*
     * The idiom was reserved for this animal by `animal-chicken.ts` and is the
     * one thing it left that could not be spent. It solves the chamfer midpoint
     * and the 45-degree turn together and emits the turn as `{ x: +45 }`, which
     * is right for `animal-squirrel.ts` because `box-23`'s section is ROUND. On
     * a blade 3.87 to one it matters: +45 lands the long axis up and FORWARD,
     * lying across the back; -45 with the facing overridden to `y +1` lands it
     * ON the chamfer normal, and the tail RUNS up and back.
     */
    const up = new THREE.Vector3(0, 1, 0)
    const forward = up.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 4)
    const back = up.clone().applyAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 4)
    expect(forward.z).toBeCloseTo(Math.SQRT1_2, 6)     // up and FORWARD
    expect(back.z).toBeCloseTo(-Math.SQRT1_2, 6)       // up and BACK, the normal
    const t = feature('tail')
    expect(t.spin).toEqual([{ axis: 'x', deg: -45 }])
    expect(t.axis).toBe('y')
    expect(t.dir).toBe(1)
    // `axis: 'y'` is `animal-budgie.ts`'s own override on this same shape, so
    // the sink measures along the 1.0824 the tail runs, not across its 0.555215.
    expect(partById('wedge-15')!.attachment!.axis).toBe('z')
    expect(CANARY_ASSEMBLY.features.find(f => f.name === 'tail')!.part).toBe('box-38')
    // The idiom's ARITHMETIC is kept: the measured chamfer midpoint, by hand.
    const pts = points('box-03')
    const hy = Math.max(...pts.map(q => Math.abs(q[1])))
    const insetY = Math.max(...pts
      .filter(q => Math.abs(Math.abs(q[2]) - Math.max(...pts.map(r => Math.abs(r[2])))) < 1e-6)
      .map(q => Math.abs(q[1])))
    expect((hy + insetY) / 2).toBeCloseTo(0.46875, 6)
    if (t.placement.kind === 'single') {
      expect(t.placement.at).toEqual([0, 0.80625 + 0.46875, -0.46875])
    }
  })

  it('is buried 4/16 because PACK_HEIGHT_MAX chose it, not because 4/16 is nice', () => {
    /*
     * The three burials, measured off the real vertex that sets the top rather
     * than off the bounding box: the shape's own overruns the ceiling, 3/16
     * clears it by less than the bank's own rounding, and 4/16 clears it by
     * 0.0489 while still standing 0.8118 of sickle proud.
     */
    const w = partById('wedge-15')!
    const run = 2 * Math.max(...points('wedge-15').map(q => Math.abs(q[1])))
    expect(run).toBeCloseTo(1.0824, 4)
    const topOf = (sink: number): number => {
      const shift = run / 2 - sink * run
      const rise = Math.max(...points('wedge-15').map(q => Math.SQRT1_2 * (q[1] + q[2])))
      return 0.80625 + 0.46875 + Math.SQRT1_2 * shift + rise
    }
    expect(topOf(w.attachment!.sunkFractionMean)).toBeGreaterThan(PACK_HEIGHT_MAX)
    expect(topOf(3 / 16)).toBeLessThan(PACK_HEIGHT_MAX)
    // 3/16 "fits" by one part in 1,850, which is a graze rather than a fit. The
    // comparison that settles it is `animal-goose.ts` — the animal that FOUND
    // this ceiling, leaned its neck 60 degrees to get under it, and still
    // shipped with tens of times this much room.
    const graze = PACK_HEIGHT_MAX - topOf(3 / 16)
    expect(graze).toBeCloseTo(0.0011, 4)
    expect(PACK_HEIGHT_MAX / graze).toBeGreaterThan(1800)
    const goose = buildAssembled('animal-goose')
    goose.updateMatrixWorld(true)
    const gooseRoom = PACK_HEIGHT_MAX
      - new THREE.Box3().setFromObject(goose).getSize(new THREE.Vector3()).y
    expect(gooseRoom / graze).toBeGreaterThan(40)
    expect(feature('tail').sink).toBe(0.25)
    expect(feature('tail').sink! * 16).toBe(4)
    expect(PACK_HEIGHT_MAX - topOf(0.25)).toBeCloseTo(0.0489, 3)
    // Which is the whole animal's height: the tail, not the comb.
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    expect(whole.max.y).toBeCloseTo(boxOf(g, 'tail').max.y, 6)
    expect(boxOf(g, 'tail').max.y).toBeGreaterThan(boxOf(g, 'comb-1').max.y)
    // And it still stands 1.91x the reach of the hen's whole tail.
    expect(run * 0.75).toBeCloseTo(0.8118, 4)
    expect(run * 0.75 / partById('box-18')!.size[2]!).toBeCloseTo(1.91, 2)
  })

  it('leaves the tail\'s SECOND BAND unspent, and the fan to the turkey', () => {
    // `wedge-15` carries two bands and band 5 is the lion's TUFT — this spin
    // puts it on the sickle tips, a green flash for no geometry at all. It is
    // declined because `animal-chicken.ts` reserves the painted mechanisms for
    // the guinea fowl's spots and the quail's mottling, and they have nothing
    // else. So the tail is ONE flat slot on 212 triangles, deliberately.
    expect([...new Set(partById('wedge-15')!.bands)].sort((a, b) => a - b)).toEqual([5, 15])
    expect(feature('tail').paint).toEqual({ base: 'sickle' })
    // And every other reservation is still standing.
    for (const id of ['box-38', 'box-41', 'box-23']) {
      expect(ROOSTER_ASSEMBLY.features.some(f => f.part === id), `${id} is spent`).toBe(false)
    }
    expect(ROOSTER_ASSEMBLY.hull.part).toBe('box-03')
    expect(ROOSTER_ASSEMBLY.hull.paint.byBand).toBeUndefined()
    expect(ROOSTER_ASSEMBLY.hull.paint.patch).toBeUndefined()
    // Nothing but the eye card, which arrives pre-split at Kenney's own cut.
    for (const f of ROOSTER_ASSEMBLY.features) {
      if (f.name === 'eye') continue
      expect(f.paint.byBand, f.name).toBeUndefined()
    }
  })
})

describe('animal-rooster: what it shares with the hen, and what it does not', () => {
  it('wears her wing, her bill, her eye and her leg row, byte for byte', () => {
    for (const name of ['wing', 'leg-front', 'snout', 'eye']) {
      const mine = feature(name)
      const theirs = hen(name)
      expect(mine.part, name).toBe(theirs.part)
      expect(mine.sink, name).toBe(theirs.sink)
      expect(mine.spin, name).toEqual(theirs.spin)
      expect(mine.axis, name).toBe(theirs.axis)
      expect(mine.dir, name).toBe(theirs.dir)
      expect(mine.placement, name).toEqual(theirs.placement)
    }
    // Ten birds, one wing — and it is a SOLID, not a card.
    expect(feature('wing').sink)
      .toBe(CANARY_ASSEMBLY.features.find(f => f.name === 'wing')!.sink)
    expect(feature('wing').sink).toBe(0.5)
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
    // JT-044's foot on the pack's own grid, and it is hers unchanged.
    expect(feature('leg-front').paint).toEqual(hen('leg-front').paint)
    expect(feature('leg-front').paint.patch!.at * 16).toBe(4)
    expect(feature('leg-front').part).toBe(LEG_ROW.part)
    // Two legs, not four.
    expect(ROOSTER_ASSEMBLY.features.filter(f => f.name.startsWith('leg'))).toHaveLength(1)
  })

  it('separates on saturation and value, and keeps three of her slots exactly', () => {
    // A cock has a hen's shanks, a hen's toes and a hen's eye; inventing
    // differences there would be inventing. The amber iris is still unspent.
    for (const slot of ['limb', 'foot', 'eye']) {
      expect(ROOSTER_ASSEMBLY.palette[slot], slot).toBe(CHICKEN_ASSEMBLY.palette[slot])
    }
    // And the three that move, move on saturation and value rather than hue.
    const hsl = (n: number): { h: number; s: number; l: number } =>
      new THREE.Color(n).getHSL({ h: 0, s: 0, l: 0 })
    const mine = hsl(ROOSTER_ASSEMBLY.palette['coat']!)
    const hers = hsl(CHICKEN_ASSEMBLY.palette['coat']!)
    expect(Math.abs(mine.h - hers.h) * 360).toBeCloseTo(9.1, 1)
    expect(mine.s).toBeGreaterThan(hers.s)
    expect(mine.l).toBeLessThan(hers.l)
    // The sickle is the darkest thing on the animal by a distance.
    const sickle = hsl(ROOSTER_ASSEMBLY.palette['sickle']!)
    expect(sickle.l).toBeLessThan(0.2)
    expect(sickle.l).toBeLessThan(hsl(CHICKEN_ASSEMBLY.palette['flight']!).l)
    // Every slot defined is a slot spent: no colour is declared and unused.
    const used = new Set<string>(['pupil'])
    for (const f of [...ROOSTER_ASSEMBLY.features, ROOSTER_ASSEMBLY.hull]) {
      used.add(f.paint.base)
      for (const s of Object.values(f.paint.byBand ?? {})) used.add(s)
      if (f.paint.patch) used.add(f.paint.patch.below)
    }
    expect([...used].sort()).toEqual(Object.keys(ROOSTER_ASSEMBLY.palette).sort())
  })

  it('bobs the WATTLE, which is the part the hen\'s refusal was always about', () => {
    /*
     * She declined `bob` because it is a POSITION channel that raises and lowers
     * a part, "which is what a crest does and is precisely what a comb does not
     * — a comb is fixed flesh". Still true of the comb here. Not true of a
     * wattle, which is the only loose tissue on the bird.
     */
    const motion = ROOSTER_ASSEMBLY.motion!
    expect(motion).toHaveLength(2)
    expect(CHICKEN_ASSEMBLY.motion!).toHaveLength(1)
    expect(motion.map(m => m.kind).sort()).toEqual(['bob', 'flap'])
    const bob = motion.find(m => m.kind === 'bob')!
    expect(bob.parts).toEqual(['wattle'])
    expect(bob.channel).toBe('position')
    expect(bob.amplitude).toBe(MOTIONS.bob.amplitude)
    // It never unseats: 0.05 of travel against 0.200178 of burial.
    expect(bob.amplitude).toBeLessThan(proud('cone-01', 1, 0.5))
    // And nothing bobs the comb.
    for (const m of motion) expect(m.parts.some(p => p.startsWith('comb'))).toBe(false)
    expect(motion.find(m => m.kind === 'flap')!.parts).toEqual(['wing'])
    for (const n of ['wing-r', 'wing-l', 'wattle-r', 'wattle-l']) {
      expect(build().getObjectByName(n), n).toBeDefined()
    }
  })

  it('has no spur, and the arithmetic is one line', () => {
    // The one thing on a cock this file does not say. The smallest true point in
    // the bank is longer than the whole leg it would grow on.
    const point = partById('cone-01')!.size[1]!
    const leg = partById('box-01')!.size[1]!
    expect(point / leg).toBeCloseTo(1.307, 3)
    expect(ROOSTER_ASSEMBLY.features.filter(f => f.part === 'cone-01')).toHaveLength(6)
    expect(ROOSTER_ASSEMBLY.features.some(f => f.name.includes('spur'))).toBe(false)
    // Nothing authored, and the flag says what to look at first.
    expect(ROOSTER_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(ROOSTER_ASSEMBLY.flag).toMatch(/chamfer: true WAS RESERVED FOR THIS ANIMAL/)
  })
})
