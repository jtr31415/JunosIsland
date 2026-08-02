/**
 * The chinchilla. Home Pets' EAR animal, and the species that carries the
 * six-rodent separation `collections/home-pets.ts` sets out in its own header.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a chinchilla can say, and it says
 * five things the next builder needs and cannot get from a screenshot:
 *
 *   1. **`box-25` is the biggest ear in the bank and the only LARGE round one**,
 *      re-derived over all 23 ear shapes rather than believed — and reconciled
 *      with `animal-fennec-fox.ts`, which calls `box-06` the biggest and is right
 *      on a different axis.
 *   2. **The stretch was refused and the refusal is measured.** The dish's x and y
 *      are already equal, so roundness cannot improve; if a later builder ever
 *      reaches for one, this file says what it would and would not buy.
 *   3. **The ears cost WIDTH and not height**, which is the opposite of how it
 *      looks, and it is why the keep-out is charged against the tail.
 *   4. **`box-23`, the fox's brush, is pinned as refused** with the measurement
 *      that refuses it, so nobody puts it back on the strength of the collection
 *      header's word "bushy".
 *   5. **The whiskers and the outsized hind feet cannot be drawn**, and both are
 *      pinned as facts about the BANK rather than as opinions in a comment. If the
 *      bank ever gains a thin card or a second leg shape, this file goes red and
 *      the omissions are reconsidered — which is exactly what
 *      `assembly-badger.test.ts` does for the stripe.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, CHINCHILLA_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, HEIGHT_FLOOR, LEG_ROW,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-chinchilla',
  parts: ['blade-01', 'box-01', 'box-03', 'box-25', 'plate-14', 'tube-07', 'wedge-03'],
  height: 1.482,
  verts: 482,
  tris: 679,
  // The hull is 5.3 times the tail, which is the next biggest mesh. Stated above
  // the generic floor of 3 because this animal can carry it: its two headline
  // features are a disc and a stub, and neither is close to body-sized.
  massRatio: 5,
  // NONE. Every part here is worn the way its donor wore it, so rule 4's "no node
  // carries a rotation" would pass vacuously — said as a number, out loud.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-chinchilla')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/** Every ear shape the bank holds, with the numbers this species chose on. */
const EARS = PARTS_BANK.filter(p => p.roles.includes('ear'))
/** The cube's own half-extent — the face every transfer below joins at. */
const HALF = partById('box-03')!.size[0]! / 2
const volume = (id: string): number => {
  const s = partById(id)!.size
  return s[0]! * s[1]! * s[2]!
}

describe('animal-chinchilla: the ear is the animal, and it is the biggest in the bank', () => {
  it('is the largest ear shape by bounding volume, over all 23 of them', () => {
    // If this goes red the collection's whole six-rodent separation is gone: the
    // chinchilla's share of it is "the biggest ears", and this is the claim.
    expect(EARS.length).toBeGreaterThan(20)
    const biggest = [...EARS].sort((a, b) => volume(b.id) - volume(a.id))
    expect(biggest[0]!.id).toBe('box-25')
    expect(volume('box-25')).toBeCloseTo(0.191943, 6)
    // And by a margin, not by a hair. The bunny's upright ear is the runner-up.
    expect(biggest[1]!.id === 'box-06' || biggest[1]!.id === 'box-07').toBe(true)
    expect(volume('box-25') / volume('box-06')).toBeCloseTo(1.4258, 3)
    // Nine times the beaver's round button, which is what the dormouse wears.
    expect(volume('box-25') / volume('box-02')).toBeGreaterThan(9)
  })

  it('does not contradict the fennec — `box-06` is the TALLEST, this is the biggest', () => {
    // `animal-fennec-fox.ts` calls `box-06` "the biggest ear in the pack by a
    // distance". Both claims are true on different measured axes and this pins
    // that, so neither file has to be softened if the other is read next.
    const tallest = [...EARS].sort((a, b) => b.size[1]! - a.size[1]!)[0]!
    expect(tallest.id === 'box-06' || tallest.id === 'box-07').toBe(true)
    expect(partById('box-06')!.size[1]!).toBeGreaterThan(partById('box-25')!.size[1]!)
    // The two are separated by SHAPE and not by size alone: the bunny's is handed
    // and tapers, this one is radial and does not narrow at all.
    expect(partById('box-06')!.shape.symmetry).toBe('handed')
    expect(partById('box-25')!.shape.symmetry).toBe('radial')
  })

  it('is the only LARGE round one — three ears are radial and the other two are tiny', () => {
    // "Round, and nearly the size of its head" is the whole read. This is the
    // measurement behind it, and it is why no other ear could have been used.
    const radial = EARS.filter(p => p.shape.symmetry === 'radial').map(p => p.id)
    expect(radial.sort()).toEqual(['box-02', 'box-05', 'box-25'])
    for (const id of ['box-02', 'box-05']) {
      expect(partById(id)!.shape.longest, `${id} is a rival for the round ear`)
        .toBeLessThan(partById('box-25')!.shape.longest / 2)
    }
    const dish = partById('box-25')!
    expect(dish.size[0]!).toBeCloseTo(dish.size[1]!, 6)   // a disc, to six decimals
    expect(dish.shape.taper).toBe(1)                      // and it does not narrow
    // 0.594 of the hull's own width. That number IS "nearly the size of its head".
    expect(dish.size[0]! / partById('box-03')!.size[0]!).toBeCloseTo(0.594, 3)
  })

  it('IS NOT STRETCHED, and the refusal is a measurement rather than a taste', () => {
    // The reach was to thin the dish and round it further. Roundness cannot
    // improve — x and y are already equal — and the thinning would be a
    // NON-UNIFORM stretch, of which Joe has three unruled examples in front of him
    // (goldfish, corn snake, crocodile). If this goes red somebody has stretched
    // the ear and owes that argument.
    const ear = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'ear')!
    expect(ear.stretch).toBeUndefined()
    expect(CHINCHILLA_ASSEMBLY.features.every(f => f.stretch === undefined)).toBe(true)
    // It is already under half as deep as it is wide before anything is done to it.
    const dish = partById('box-25')!
    expect(dish.size[2]! / dish.size[0]!).toBeCloseTo(0.46857, 5)
  })

  it('joins at the head\'s SIDE and recovers the koala\'s own centre', () => {
    const dish = partById('box-25')!
    // Side-mounting is what puts a disc on the side of a head at all, and only
    // TWO shapes in the ear bank do it — this and the elephant's flap, which is a
    // third of its volume and is `animal-bushbaby.ts`'s. Everything else stands on
    // the top face or points forward.
    expect(dish.attachment!.axis).toBe('x')
    expect(dish.attachment!.dir).toBe(1)
    expect(EARS.filter(p => p.attachment!.axis === 'x').map(p => p.id).sort())
      .toEqual(['box-25', 'tube-04', 'tube-05'])
    expect(volume('box-25') / volume('tube-04')).toBeGreaterThan(3)
    const ear = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'ear')!
    // The join is this cube's own side face — its half-width, measured, not typed.
    expect(ear.placement).toEqual({
      kind: 'pair', at: [HALF, dish.offset[1], dish.offset[2]],
    })
    expect(ear.sink).toBe(dish.attachment!.sunkFractionMean)
    // Solved from the join, then checked against a number the solve never used.
    // Four decimals: the built attribute is float32, which is the noise floor.
    expect(world(build(), 'ear-r').x).toBeCloseTo(dish.offset[0]!, 4)
  })

  it('costs WIDTH and not height — which is the opposite of how it looks', () => {
    const g = build()
    const ear = boxOf(g, 'ear-r')
    // The dish tops out UNDER the bare cube's own crown, so a pair of ears three
    // fifths of the body's width adds nothing at all to the silhouette's height.
    expect(ear.max.y).toBeLessThan(HEIGHT_FLOOR)
    expect(ear.max.y).toBeCloseTo(1.4283, 3)
    // What they do cost is width: 1.9426 across, 1.55 times the hull.
    const s = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3())
    expect(s.x).toBeCloseTo(1.9426, 3)
    expect(s.x / partById('box-03')!.size[0]!).toBeGreaterThan(1.55)
    // Buried 0.396, more than three times §3's 0.125 floor. §3: nothing floats.
    expect(partById('box-25')!.attachment!.sunkUnitsMean).toBeCloseTo(0.396338, 6)
    // And the two-tone is Kenney's own cut: band 1 is the inner disc, 10 of 92
    // triangles, so a two-colour ear costs no geometry at all (§4's first way).
    const bands = partById('box-25')!.bands
    expect(bands.filter(b => b === 1)).toHaveLength(10)
    expect(CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'ear')!.paint.byBand)
      .toEqual({ 1: 'inner' })
  })
})

describe('animal-chinchilla: the eye is the pack\'s biggest card, worn inside out', () => {
  it('takes `plate-14`, which is the largest eye shape in the bank', () => {
    const cards = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (id: string): number => partById(id)!.size[0]! * partById(id)!.size[1]!
    expect([...cards].sort((a, b) => area(b.id) - area(a.id))[0]!.id).toBe('plate-14')
    expect(area('plate-14') / area('plate-01')).toBeGreaterThan(1.5)
    // Rule 5: absolute size, absolute z, zero sink, and no stretch to reach for.
    const eye = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.sink).toBe(0)
    expect(eye.placement).toEqual({
      kind: 'pair', at: [partById('plate-14')!.offset[0], partById('plate-14')!.offset[1],
        EYE_CARD_Z],
    })
  })

  it('gets a nearly all-dark eye from the panda\'s INVERTED bands, for no geometry', () => {
    // The whole reason this card is here rather than the default oval. On
    // `plate-01` band 15 is a small pupil inside a bigger sclera; on this one it
    // is the other way round, and the builder always sends band 15 to PACK_PUPIL.
    // If Kenney's cut is ever re-derived differently this animal's eye inverts,
    // and that should be loud rather than quiet.
    const big = partById('plate-14')!, oval = partById('plate-01')!
    const count = (id: string, band: number): number =>
      partById(id)!.bands.filter(b => b === band).length
    expect(count('plate-14', 15)).toBe(40)
    expect(count('plate-14', 3)).toBe(17)
    expect(count('plate-14', 15) / big.tris).toBeGreaterThan(0.6)   // the dark spans the card
    expect(count('plate-01', 15) / oval.tris).toBeLessThan(0.45)    // on the default it does not
  })
})

describe('animal-chinchilla: the tail is SHORT and thick, and the brush is refused', () => {
  it('is the shortest-reaching of the bank\'s three THICK tails', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    // §7 splits the seven on THICKNESS, not on length: a 1.7x gap with nothing in
    // it. These are the three on the far side of it.
    const thick = tails.filter(p => p.size[0]! > 0.5).map(p => p.id).sort()
    expect(thick).toEqual(['box-23', 'box-38', 'wedge-03'])
    const reach = (id: string): number => partById(id)!.size[2]!
    expect(Math.min(...thick.map(reach))).toBeCloseTo(reach('wedge-03'), 6)
    expect(reach('wedge-03') / reach('box-23')).toBeCloseTo(0.6466, 3)
    // And by bounding volume it is under three fifths of the fox's brush, which is
    // the difference between a chinchilla's tail and a squirrel's.
    expect(volume('wedge-03') / volume('box-23')).toBeCloseTo(0.5976, 3)
  })

  it('pins `box-23` as CONSIDERED AND REFUSED, with the measurement that refuses it', () => {
    // Recorded so nobody helpfully puts the brush back on the strength of the
    // collection header's word "bushy". The objection is not that it is wrong for
    // a chinchilla, it is that it is 3.2 times the ear by bounding volume — and
    // the rule this animal is built under is that NOTHING may out-read the ear.
    expect(CHINCHILLA_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    expect(volume('box-23') / volume('box-25')).toBeGreaterThan(3.2)
    expect(volume('wedge-03') / volume('box-25')).toBeLessThan(2)
  })

  it('is a pure donor transfer on the beaver\'s own hull, carried UP', () => {
    const paddle = partById('wedge-03')!
    const tail = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'tail')!
    // The beaver wears this on `box-03`, which is this hull, so the transfer is a
    // recovery on the same shell rather than a carry-over between two.
    expect(paddle.provenance.map(p => p.species)).toEqual(['beaver'])
    expect(CHINCHILLA_ASSEMBLY.hull.part).toBe('box-03')
    expect(tail.sink).toBe(paddle.attachment!.sunkFractionMean)
    expect(tail.spin).toBeUndefined()
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, paddle.offset[1], -HALF])
    }
    // Solved from the join, checked against a number the solve never used.
    expect(world(build(), 'tail').z).toBeCloseTo(paddle.offset[2]!, 4)

    // And the beaver's own height is a gift: the crown lands ABOVE the line of the
    // back, which is a bushy tail carried up, and it is this animal's whole height.
    const t = boxOf(build(), 'tail')
    expect(t.max.y).toBeGreaterThan(HEIGHT_FLOOR)
    expect(t.max.y - HEIGHT_FLOOR).toBeCloseTo(0.0508, 3)
    expect(t.max.y).toBeCloseTo(new THREE.Box3().setFromObject(build()).max.y, 6)
  })
})

describe('animal-chinchilla: the face is broad and blunt, and both parts are unspent', () => {
  it('wears the giraffe\'s muzzle — the broad end of the family, nearly buried', () => {
    const muzzle = partById('tube-07')!
    expect(muzzle.provenance.map(p => p.species)).toEqual(['giraffe'])
    // Broad: 1.7 times the width of the beaver's little barrel, which the mouse,
    // the squirrel, the bushbaby and the fennec all wear. That is what keeps this
    // face off theirs without a single colour being changed.
    expect(muzzle.size[0]! / partById('tube-01')!.size[0]!).toBeGreaterThan(1.7)
    // Blunt: sunk its own 0.3759, so it stands 0.166 proud of the front face and
    // does not read as a snout at all.
    const snout = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.sink).toBe(muzzle.attachment!.sunkFractionMean)
    expect(boxOf(build(), 'snout').max.z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.166, 3)
    // The transfer recovers the giraffe's own recorded centre, unused in the solve.
    expect(world(build(), 'snout').z).toBeCloseTo(muzzle.offset[2]!, 4)
  })

  it('hangs the beaver\'s own nose on the muzzle\'s placed front plane, not near it', () => {
    const g = build()
    const front = boxOf(g, 'snout').max.z
    const nose = g.getObjectByName('nose')!
    // `on: 'snout'` rather than an arithmetic this file would carry a copy of: a
    // nose that floats or buries is then a thing that cannot happen quietly.
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // The pack's one rodent's own nose, on a rodent — and deliberately not
    // `wedge-10`, which is measurably the better nose tip and reads as a TONGUE.
    // Joe ruled on that one by name on the hedgehog; the lesson is not its own.
    expect(partById('blade-01')!.provenance.map(p => p.species)).toEqual(['beaver'])
    expect(CHINCHILLA_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })

  it('takes the leg row and the painted belly line entire', () => {
    const leg = CHINCHILLA_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') expect(leg.placement.from[1]).toBe(LEG_ROW.y)
    // The tiger's own mammal line made exact — the only point on the pack's 1/16
    // grid inside its measured zone — painted, so the hull is still 60 triangles.
    expect(CHINCHILLA_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.5 })
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })
})

describe('animal-chinchilla: the two things about it the bank cannot draw', () => {
  it('has NO CARD anywhere in the bank that could carry a whisker', () => {
    // A chinchilla's whiskers are a third of its body long and hair-thin — about
    // 0.5 by 0.005 here, which is 1:100. `assembly-badger.test.ts` measures the
    // same ceiling from the other side for its face stripes. If a genuinely thin
    // card is ever added to the bank this goes red and the omission is revisited.
    const cards = PARTS_BANK.filter(p => p.roles.includes('card'))
    expect(cards.length).toBeGreaterThan(0)
    for (const p of cards) {
      const d = [...p.size].sort((a, b) => b - a)
      expect(d[0]! / d[1]!, `${p.id} is thin enough to be a whisker`).toBeLessThan(10)
    }
    // And the only two zero-thickness dots in the pack are SQUARE — nostrils, not
    // hairs — so there is nothing to lay in a row either.
    for (const id of ['plate-12', 'plate-16']) {
      const s = partById(id)!.size
      expect(s[0]!).toBeCloseTo(s[1]!, 6)
      expect(s[0]!).toBeLessThan(0.12)
    }
    expect(CHINCHILLA_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
  })

  it('cannot say "the HIND feet are bigger": the bank holds ONE leg shape', () => {
    // 86 instances, 23 species, one shape — §7 — and `CreatureDef.legs` is a
    // single ROW with no per-station size. So a chinchilla's outsized back feet
    // are not awkward here, they are unsayable, and nothing was added to fake it.
    // If the bank ever gains a second leg shape this goes red on purpose.
    const legs = PARTS_BANK.filter(p => p.roles.includes('leg'))
    expect(legs.map(p => p.id)).toEqual([LEG_ROW.part])
    expect(partById(LEG_ROW.part)!.provenance.length).toBeGreaterThan(80)
    const rows = CHINCHILLA_ASSEMBLY.features.filter(f => f.part === LEG_ROW.part)
    expect(rows).toHaveLength(1)
    // JT-044's two-tone leg was refused rather than overlooked: a pale patch says
    // "pale foot", and the feature this animal is missing is a BIG foot. Painting
    // size is the fake `animal-badger.ts` refused for its stripes.
    expect(rows[0]!.paint.patch).toBeUndefined()
  })

  it('flags NOTHING, because the animal\'s headline is the part that worked', () => {
    // The badger is flagged because its marking IS the animal and cannot be drawn.
    // Here the ears are the animal and they are said in full at the pack's own
    // size, so the two omissions above are recorded and not escalated.
    expect(CHINCHILLA_ASSEMBLY.flag).toBeUndefined()
    expect(CHINCHILLA_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('fits between two trees, and it is the DEPTH that costs, not the ears', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2, and this is
    // decided by 0.0066: the muzzle and the tail make it deeper than the ears make
    // it wide. Trimming the ear would not buy a millimetre of keep-out back, which
    // is the whole reason this measurement is here.
    expect(s.z).toBeGreaterThan(s.x)
    expect(s.z - s.x).toBeLessThan(0.01)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.9746, 3)
    // Inside the fox's own 1.154, which is the pack's worst and the number the
    // island already copes with.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
