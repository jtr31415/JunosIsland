/**
 * The ferret. Home Pets' long carnivore, and the first species whose whole claim
 * is a RATIO rather than a part.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a ferret can say, and it says five
 * things the next builder needs and cannot get from a screenshot:
 *
 *   1. **The proportion is real and it is not a stretch.** 2.0439 deep against
 *      1.2500 across, off a hull that is the pack's own 1.250 cube at its own
 *      size, and every millimetre past the shell is accounted for by name.
 *   2. **"LOW" IS UNSAYABLE, and it is pinned as a fact about the BANK and the
 *      constants rather than as an opinion in a comment.** The one flat hull in
 *      the pack cannot carry legs, and the leg row already sits at the deepest
 *      burial the pack ever used. If either ever changes this file goes red, and
 *      it should: the ferret would be worth rebuilding.
 *   3. **The wheelbase is bounded by `box-03`'s own chamfer**, re-derived here
 *      from the hull's own vertices rather than restated.
 *   4. **Three tails were measured and two were refused**, each on a number taken
 *      over every tail in the bank rather than quoted from another file.
 *   5. **The mask cannot be drawn**, exactly as `animal-badger.ts` found and
 *      `animal-civet.ts` found again — and the two escape routes this species
 *      tried and rejected (a dark eye card, JT-044's two-tone leg) are pinned as
 *      refused WITH the measurement that refused them, so that if either ever
 *      becomes right the test says so instead of a comment being ignored.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, FERRET_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW,
  HEIGHT_FLOOR, PACK_HEIGHT_MIN, PACK_PUPIL, SLOT_PX,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type BakedPart } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-ferret',
  parts: ['box-01', 'box-02', 'box-03', 'box-10', 'box-38', 'plate-06', 'tube-06'],
  height: 1.5012,
  verts: 420,
  tris: 575,
  // The cube against the parrot's fan, which is the next biggest thing here and
  // is a fifth of it. Nothing on a ferret competes with its body.
  massRatio: 5,
  // Nothing is spun. Said out loud, because rule 4's "no node carries a rotation"
  // passes vacuously on an animal with none and silence would look the same.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-ferret')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const worldOf = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

const TAILS = PARTS_BANK.filter(p => p.roles.includes('tail'))
/** Every ear the pack stood on a TOP face — the family this animal chose from. */
const TOP_EARS = PARTS_BANK.filter(
  p => p.roles.includes('ear') && p.attachment?.axis === 'y' && p.attachment.dir === 1)

/** Where the leg row puts a leg's TOP: the join point plus its own burial. */
const LEG_TOP = LEG_ROW.y + LEG_ROW.sink * partById(LEG_ROW.part)!.size[1]!

/** The two SMALLER of a part's three extents, as a ratio: how round its section is. */
const section = (p: BakedPart): number => {
  const s = [...p.size].sort((a, b) => a - b)
  return s[0]! / s[1]!
}

/** Rec. 709 relative luminance of a packed 0xRRGGBB, for the eye-card refusal. */
const luma = (hex: number): number =>
  0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255)

describe('animal-ferret: the proportion IS the animal, and it is not a stretch', () => {
  it('is 1.63 times longer than it is wide, off a hull that is a plain cube', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `collections/home-pets.ts` gives this species one sentence — "a ferret is a
    // tube on short legs and the proportion is the whole read" — and this is that
    // sentence as a number. If it ever drops toward 1.2 the animal has become a
    // rodent and the collection's separation has gone with it.
    expect(s.z / s.x).toBeGreaterThan(1.6)
    expect(s.x).toBeCloseTo(1.25, 4)
    expect(s.z).toBeCloseTo(2.0439, 3)
    // And the body underneath it is the pack's own cube at the pack's own size:
    // there is no hull stretch, ever, so the ratio above had to be bought
    // somewhere else entirely.
    expect(FERRET_ASSEMBLY.hull.part).toBe('box-03')
    expect(FERRET_ASSEMBLY.hull.stretch).toBeUndefined()
    expect(partById('box-03')!.size).toEqual([1.25, 1.25, 1.25])
  })

  it('accounts for every millimetre past the shell — a muzzle in front, a tail behind', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    // 0.625 each way is the cube. Everything beyond it is named, and between them
    // the two account for the whole of the overhang: nothing here is slack.
    expect(boxOf(g, 'nose').max.z).toBeCloseTo(0.9499, 3)
    expect(boxOf(g, 'tail').min.z).toBeCloseTo(-1.094, 3)
    expect(whole.max.z).toBeCloseTo(boxOf(g, 'nose').max.z, 4)
    expect(whole.min.z).toBeCloseTo(boxOf(g, 'tail').min.z, 4)
    // The legs buy length for FREE, because they stay inside the body's own box —
    // which is what keeps the keep-out at the badger's 1.02 rather than the fox's.
    for (const n of ['leg-r0', 'leg-l0', 'leg-r1', 'leg-l1']) {
      const b = boxOf(g, n)
      expect(Math.max(Math.abs(b.max.z), Math.abs(b.min.z)), `${n} pushes the keep-out out`)
        .toBeLessThanOrEqual(0.625 + 1e-6)
    }
    expect(Math.max(whole.max.x - whole.min.x, whole.max.z - whole.min.z) / 2)
      .toBeLessThan(1.15)   // the fox's own, the pack's worst, what the island copes with
  })
})

describe('animal-ferret: LOW is unsayable, and here is the bank saying so', () => {
  it('has no hull to stand low on — `box-13` is the only flat one and it cannot carry legs', () => {
    const crab = partById('box-13')!
    const hulls = PARTS_BANK.filter(p => p.roles.includes('hull'))
    // It is the obvious answer twice over: the only shell in the bank under 1.0
    // tall, and deeper than the cube as well, which is exactly what "long and
    // low" asks for.
    expect(hulls.filter(p => p.size[1]! < 1).map(p => p.id)).toEqual(['box-13'])
    expect(crab.size[2]!).toBeGreaterThan(partById('box-03')!.size[2]!)

    // And it is refused on two measurements. Its underside sits ABOVE the leg
    // row's own top, so §3's "nothing floats" breaks before anything else does:
    expect(LEG_TOP).toBeCloseTo(0.30625, 6)
    expect(crab.offset[1]! - crab.size[1]! / 2, 'box-13 has dropped within the leg row\'s reach')
      .toBeGreaterThan(LEG_TOP)
    // ...and the whole animal would stand barely half the pack's own floor.
    expect(crab.offset[1]! + crab.size[1]! / 2).toBeCloseTo(0.771528, 6)
    expect(crab.offset[1]! + crab.size[1]! / 2).toBeLessThan(PACK_HEIGHT_MIN)
  })

  it('gains nothing from the tiger\'s bigger shell, because a RATIO is what it wants', () => {
    const tiger = partById('box-41')!, cube = partById('box-03')!
    // `box-41` is the one hull deeper than the crab's and it is the reflex answer
    // to "make it longer". It is refused because it is just as much WIDER: the
    // body's depth-against-width comes out at the cube's own 1.000 either way, so
    // it buys size and not proportion — for 202 of the 951-triangle budget.
    expect(tiger.size[2]!).toBeGreaterThan(cube.size[2]!)
    expect(tiger.size[2]! / tiger.size[0]!).toBeCloseTo(cube.size[2]! / cube.size[0]!, 6)
    expect(tiger.tris - cube.tris).toBe(202)
    expect(FERRET_ASSEMBLY.hull.part).not.toBe('box-41')
  })

  it('cannot sink the body either — the leg row is already the pack\'s deepest burial', () => {
    const leg = partById(LEG_ROW.part)!
    // `legs.y` became settable on Joe's 2 Aug ruling and raising it does drop the
    // body. It buys nothing HERE, because the row already sits at the deepest the
    // pack ever buried a leg: 86 instances over 23 species, and this is their max.
    expect(LEG_ROW.sink).toBeCloseTo(leg.attachment!.sunkFractionMax, 6)
    expect(leg.attachment!.sunkFractionMin).toBe(0)
    // So the ferret stands where every cube-bodied animal stands, and the only
    // thing above the pack's own floor is 0.070 of ear.
    const g = build()
    expect(boxOf(g, 'hull').max.y).toBeCloseTo(HEIGHT_FLOOR, 4)
    const h = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()).y
    expect(h - HEIGHT_FLOOR).toBeLessThan(0.071)
    expect(boxOf(g, 'ear-r').max.y).toBeCloseTo(h, 4)   // the ears ARE the height
  })
})

describe('animal-ferret: the wheelbase, and the chamfer that bounds it', () => {
  it('stands at 6/16 — the widest station on the grid with daylight left', () => {
    const leg = FERRET_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') {
      expect(leg.placement.from[1]).toBe(LEG_ROW.y)
      expect(leg.placement.from[2] * SLOT_PX).toBe(6)      // on the pack's own grid
      expect(leg.placement.from[0]).toBeCloseTo(0.27, 6)   // x untouched: one dial, one reason
    }
    // `box-01` is 0.375 deep, so at that station the outer face lands exactly one
    // sixteenth inside the hull's own side. The crocodile's 0.4375 lands it flush.
    expect(0.375 + partById(LEG_ROW.part)!.size[2]! / 2).toBeCloseTo(0.625 - 1 / SLOT_PX, 6)
  })

  it('refuses the crocodile\'s 0.4375, because that is where the chamfer meets the leg', () => {
    // Measured off `box-03`'s own points rather than assumed: its flat bottom face
    // reaches |z| = 0.3125 and the chamfer then falls away 1:1, so the hull's
    // underside at |z| beyond that is 0.18125 + (|z| - 0.3125).
    const bottom = points('box-03').filter(q => Math.abs(q[1] + 0.625) < 1e-6)
    expect(Math.max(...bottom.map(q => Math.abs(q[2])))).toBeCloseTo(0.3125, 6)
    const graze = 0.3125 + (LEG_TOP - LEG_ROW.y)
    // 0.4375 exactly — the crocodile's own station, and the station at which a leg
    // would GRAZE this hull rather than bed into it.
    expect(graze).toBeCloseTo(0.4375, 6)
    const leg = FERRET_ASSEMBLY.features.find(f => f.name === 'leg')!
    if (leg.placement.kind === 'row') expect(leg.placement.from[2]).toBeLessThan(graze)
  })
})

describe('animal-ferret: the tail is the parrot\'s fan, carried low', () => {
  it('is in the THICK half of §7\'s split, and is the cheapest tail in the bank', () => {
    // §7: thickness separates the seven, not length, and there is a 1.7x gap with
    // nothing in it. A ferret's tail is furred, so it is on the far side of that
    // gap — which is also what keeps it off the rat, the gerbil and the degu, whose
    // tails are the ropes on the near side.
    const thin = (p: BakedPart): number => Math.min(...p.size)
    expect(TAILS).toHaveLength(7)
    expect(thin(partById('box-38')!)).toBeGreaterThan(0.5)
    expect(Math.max(...TAILS.filter(p => thin(p) < 0.5).map(thin))).toBeLessThan(0.36)
    // And it is the cheapest of all seven, which is what pays for the ears.
    expect(Math.min(...TAILS.map(p => p.tris))).toBe(partById('box-38')!.tris)
    expect(partById('box-38')!.tris).toBe(48)
  })

  it('refuses the brush for its taper and its bulk, and the paddle for its section', () => {
    const fan = partById('box-38')!, brush = partById('box-23')!, paddle = partById('wedge-03')!
    const bulk = (p: BakedPart): number => p.size[0]! * p.size[1]! * p.size[2]!
    // THE BRUSH, on `animal-wolf.ts`'s own two numbers: it barely narrows, and it
    // is 1.67x the bulk of any other tail in the bank. It reads as a fox whatever
    // it is painted, and `animal-gecko.ts` already wears it on this page.
    expect(brush.shape.taper).toBeGreaterThan(0.96)
    for (const p of TAILS.filter(q => q.id !== 'box-23')) {
      expect(bulk(brush) / bulk(p), `${p.id} is as bulky as the fox's brush`)
        .toBeGreaterThan(1.6)
    }
    // THE PADDLE tapers nearly twice as hard as the fan, and among the three THICK
    // tails only the fan is round in section — the two smaller of its three
    // extents agree within 3%, where the brush and the paddle are 18% out. A
    // flattened tail is a paddle, and `animal-chinchilla.ts` has it on this page.
    expect(paddle.shape.taper).toBeLessThan(0.6)
    expect(fan.shape.taper).toBeGreaterThan(0.8)
    expect(section(fan)).toBeGreaterThan(0.97)
    expect(section(brush)).toBeLessThan(0.83)
    expect(section(paddle)).toBeLessThan(0.83)
    expect(FERRET_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    expect(FERRET_ASSEMBLY.features.some(f => f.part === 'wedge-03')).toBe(false)
  })

  it('hangs at y = 1.0 — SOLVED off the fan\'s root and the cube\'s flat rear face', () => {
    const fan = partById('box-38')!
    // The join moves the copy along z and nothing else, so the join point's y IS
    // the centre's y and the root's world y is a straight offset from it. The
    // material inboard of the join plane is everything at local z >= this.
    const inboard = fan.size[2]! / 2 - fan.attachment!.sunkFractionMean * fan.size[2]!
    const rootY = points('box-38').filter(q => q[2] >= inboard - 1e-4).map(q => q[1])
    expect(Math.min(...rootY)).toBeCloseTo(-0.4561, 4)
    expect(Math.max(...rootY)).toBeCloseTo(-0.3561, 4)
    // `box-03` cuts every edge and every corner, so its flat rear face is only
    // 0.625 square: world y 0.49375 to 1.11875. Measured, not assumed.
    const rear = points('box-03').filter(q => Math.abs(q[2] + 0.625) < 1e-6)
      .map(q => q[1] + 0.80625)
    expect(Math.min(...rear)).toBeCloseTo(0.49375, 6)
    expect(Math.max(...rear)).toBeCloseTo(1.11875, 6)
    // So the whole root is backed by flat face only from 0.94985 up, and 16/16 is
    // the lowest notch on the pack's own grid inside that. Nothing here was picked.
    const lowest = Math.min(...rear) - Math.min(...rootY)
    expect(lowest).toBeCloseTo(0.94985, 4)
    expect(Math.ceil(lowest * SLOT_PX) / SLOT_PX).toBe(1)
    const tail = FERRET_ASSEMBLY.features.find(f => f.name === 'tail')!
    if (tail.placement.kind === 'single') expect(tail.placement.at).toEqual([0, 1, -0.625])
    // It TRAILS rather than being carried: 0.0998 below the parrot's own recorded
    // height, and low enough that the tail is not this animal's height.
    expect(fan.offset[1]! - 1).toBeCloseTo(0.099846, 6)
    const g = build()
    expect(boxOf(g, 'tail').max.y).toBeLessThan(boxOf(g, 'ear-r').max.y)
    // ...while its z is the pure donor transfer, recovered rather than chosen.
    expect(worldOf(g, 'tail').z).toBeCloseTo(fan.offset[2]!, 4)
  })
})

describe('animal-ferret: the ears are the pack\'s only small ROUND one', () => {
  it('is circular in front view, and no other TOP-mounted ear in the bank is', () => {
    const ear = partById('box-02')!
    expect(ear.size[0]).toBeCloseTo(ear.size[1]!, 6)
    expect(TOP_EARS.length).toBeGreaterThan(8)
    for (const p of TOP_EARS.filter(q => q.id !== 'box-02')) {
      // `box-34` is the panda's and is the SAME box to six decimals — the one
      // exception, refused below on triangles rather than on shape.
      if (p.id === 'box-34') { expect(p.size).toEqual(ear.size); continue }
      const r = Math.min(p.size[0]!, p.size[1]!) / Math.max(p.size[0]!, p.size[1]!)
      expect(r, `${p.id} is as round as box-02`).toBeLessThan(0.999)
    }
    // 116 triangles against 92, for an identical silhouette and one band instead
    // of two. Recorded so nobody swaps it in.
    expect(partById('box-34')!.tris).toBeGreaterThan(ear.tris)
    expect(FERRET_ASSEMBLY.features.some(f => f.part === 'box-34')).toBe(false)
    // And the bank's OTHER round ear is the koala's dish — round, but 2.36x across
    // and SIDE-mounted, and `animal-chinchilla.ts`'s headline on this same page.
    const koala = partById('box-25')!
    expect(koala.size[0]).toBeCloseTo(koala.size[1]!, 6)
    expect(koala.size[0]! / ear.size[0]!).toBeGreaterThan(2.3)
    expect(koala.attachment!.axis).toBe('x')
  })

  it('sits at the widest and rearmost station of any top-mounted ear in the bank', () => {
    const ear = partById('box-02')!
    // "Small round ears set wide and back" is a PLACEMENT, and Kenney wrote it
    // down: no ear standing on a top face is further out or further back.
    expect(Math.max(...TOP_EARS.map(p => Math.abs(p.offset[0]!)))).toBeCloseTo(0.4475, 6)
    expect(Math.min(...TOP_EARS.map(p => p.offset[2]!))).toBeCloseTo(0.2475, 6)
    expect(Math.abs(ear.offset[0]!)).toBeCloseTo(0.4475, 6)
    expect(ear.offset[2]).toBeCloseTo(0.2475, 6)
    // The tiger's is the unspent alternative and it is refused on both axes at
    // once — 0.096 narrower, 0.135 further forward, and measurably not round.
    const tiger = partById('wedge-16')!
    expect(tiger.offset[0]! - 0.4475).toBeLessThan(-0.09)
    expect(tiger.offset[2]! - 0.2475).toBeGreaterThan(0.13)
    expect(tiger.size[0]).not.toBeCloseTo(tiger.size[1]!, 2)
  })

  it('recovers the beaver\'s own centre from the join, which is the evidence', () => {
    const ear = partById('box-02')!
    // Joined at this cube's top face and sunk the donors' own 0.777778, the centre
    // lands on the bank's recorded offset — solved for, then checked against a
    // number the solve never used (§8). The beaver wears this ear on THIS hull.
    expect(ear.attachment!.sunkFractionMean).toBeCloseTo(0.777778, 6)
    const solved = HEIGHT_FLOOR + ear.size[1]! / 2 - ear.attachment!.sunkFractionMean * ear.size[1]!
    expect(solved).toBeCloseTo(ear.offset[1]!, 6)
    const g = build()
    expect(worldOf(g, 'ear-r').y).toBeCloseTo(ear.offset[1]!, 4)
    // It stands 0.070 proud, and that is the whole of what this animal reaches up.
    const proud = ear.size[1]! - ear.attachment!.sunkFractionMean * ear.size[1]!
    expect(proud).toBeCloseTo(0.07, 4)
    expect(boxOf(g, 'ear-r').max.y - HEIGHT_FLOOR).toBeCloseTo(proud, 3)
    // Kenney's band-7 inner disc is left UNPAINTED deliberately: it reaches local
    // y 0.1057 and only y above 0.0875 is out of the hull, so a `byBand` entry
    // would buy a 0.018 crescent rather than an inner ear. If the sink is ever
    // raised this goes red and the disc is worth having.
    const b7 = points('box-02').length > 0
      ? Math.max(...[...ear.bands.keys()].filter(t => ear.bands[t] === 7)
        .flatMap(t => [0, 1, 2].map(k => ear.positions[ear.indices[t * 3 + k]! * 3 + 1]!)))
      : 0
    expect(b7).toBeCloseTo(0.1057, 4)
    expect(b7 - (ear.size[1]! / 2 - proud)).toBeLessThan(0.02)
    expect(FERRET_ASSEMBLY.features.find(f => f.name === 'ear')!.paint).toEqual({ base: 'sable' })
  })
})

describe('animal-ferret: the face, and the mask that cannot be drawn', () => {
  it('wears the only MUZZLE in the bank that Kenney split, and joins it by transfer', () => {
    // Four shapes in the bank are muzzles — wide enough to carry a face and deep
    // enough to project — and exactly one of them arrives with a horizontal cut in
    // it. That is why `animal-badger.ts`, `animal-civet.ts`, `animal-wolf.ts` and
    // this species all wear `tube-06`: a masked mammal has no other option. If the
    // bank ever gains a second split muzzle this goes red, and it should.
    const muzzles = PARTS_BANK.filter(
      p => p.roles.includes('nose') && p.size[0]! >= 0.46 && p.size[2]! >= 0.2)
    expect(muzzles.map(p => p.id).sort()).toEqual(['tube-02', 'tube-03', 'tube-06', 'tube-07'])
    expect(muzzles.filter(p => new Set(p.bands).size > 1).map(p => p.id)).toEqual(['tube-06'])

    const fox = partById('tube-06')!
    const snout = FERRET_ASSEMBLY.features.find(f => f.name === 'snout')!
    expect(snout.placement).toEqual({
      kind: 'single', at: [0, fox.offset[1], HULL_FRONT_Z_USUAL],
    })
    expect(snout.sink).toBe(0)
    expect(snout.paint).toEqual({ base: 'belly', byBand: { 7: 'sable' } })
    // Band 7 is the UPPER half and band 3 the lower, so painting 7 puts the dark
    // over the bridge rather than under the chin. Measured, because getting this
    // backwards is invisible in a definition.
    const meanY = (band: number): number => {
      const ys: number[] = []
      for (let t = 0; t < fox.bands.length; t++) {
        if (fox.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) ys.push(fox.positions[fox.indices[t * 3 + k]! * 3 + 1]!)
      }
      return ys.reduce((a, b) => a + b, 0) / ys.length
    }
    expect(meanY(7)).toBeGreaterThan(meanY(3))
    // Solved from the join, then checked against a number the solve never used.
    expect(worldOf(build(), 'snout').z).toBeCloseTo(fox.offset[2]!, 4)
  })

  it('hangs the nose on the muzzle\'s own placed front plane, backed everywhere', () => {
    const g = build()
    const front = boxOf(g, 'snout').max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    // 0.182434 across on a 0.532000 face: nothing overhangs, which is the test
    // `animal-mole.ts`'s cone apex fails and `animal-opossum.ts` passes. And not
    // `wedge-10`, which is measurably a nose TIP and reads as a tongue — Joe
    // rejected that one by name on the hedgehog.
    expect(partById('box-10')!.size[0]!).toBeLessThan(partById('tube-06')!.size[0]!)
    expect(FERRET_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })

  it('takes the pack\'s SMALLEST and closest-set eye card, at its own absolute plane', () => {
    const card = partById('plate-06')!
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (p: BakedPart): number => p.size[0]! * p.size[1]!
    expect(Math.min(...eyes.map(area))).toBeCloseTo(area(card), 6)
    // And the closest-set: 0.227390 against the pack's usual 0.262500. A small
    // pointed face with small beady eyes, which is what separates this animal from
    // the big-eyed rodents on the same page — `animal-chinchilla.ts` and
    // `animal-gecko.ts` both spend the pack's biggest, `plate-14`.
    expect(Math.min(...eyes.map(p => Math.abs(p.offset[0]!)))).toBeCloseTo(0.22739, 5)
    const eye = FERRET_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
  })

  it('cannot say "the FACE is dark": a patch carries a height and the cube has ONE band', () => {
    // Structural, and the whole reason this species is flagged. `Paint.patch` is
    // { below, at } — `at` is a fraction of the part's HEIGHT, so the boundary is a
    // level plane with no z term at all; `byBand` can only cut where Kenney already
    // cut, and `box-03` has exactly one band over all sixty of its triangles; and
    // rule 3 is one mass, so there is no head to paint on its own.
    const patch = FERRET_ASSEMBLY.hull.paint.patch!
    expect(Object.keys(patch).sort()).toEqual(['at', 'below'])
    expect(typeof patch.at).toBe('number')
    expect(new Set(partById('box-03')!.bands).size).toBe(1)
    expect(FERRET_ASSEMBLY.hull.paint.byBand).toBeUndefined()
  })

  it('refuses a DARK EYE CARD for the mask, on the pupil\'s own luminance', () => {
    // The eye card is the one piece of geometry already sitting where the mask is,
    // so painting its sclera sable is the obvious escape. It is refused because the
    // pack's own measured pupil is LIGHTER than any sable: the pupil would read as
    // a catch-light on a dark disc and the eye would invert.
    const sable = FERRET_ASSEMBLY.palette['sable']!
    expect(luma(PACK_PUPIL)).toBeGreaterThan(luma(sable))
    // So the sclera stays pale, and the pupil is still the pack's own grey.
    const eye = FERRET_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.paint.base).toBe('belly')
    expect(FERRET_ASSEMBLY.palette[eye.paint.byBand![15]!]).toBe(PACK_PUPIL)
  })

  it('refuses JT-044\'s TWO-TONE LEG, and the arithmetic is why', () => {
    const leg = partById(LEG_ROW.part)!
    // Only the bottom 0.18125 of a leg is visible — the hull's underside cuts it
    // there — which is 0.591837 of its own 0.30625 height.
    const visible = LEG_ROW.y / leg.size[1]!
    expect(visible).toBeCloseTo(0.591837, 6)
    // `Paint.patch` must land on the pack's 1/16 grid, so the highest boundary it
    // can draw and still SHOW is 9/16, and that sits 0.008984 BELOW the belly.
    const highest = Math.floor(visible * SLOT_PX) / SLOT_PX
    expect(highest).toBe(9 / SLOT_PX)
    expect(LEG_ROW.y - highest * leg.size[1]!).toBeCloseTo(0.008984, 6)
    // A sable ferret's leg carries no boundary at all — it is dark from the paw to
    // the shoulder — so every line this tool can draw here would be a marking the
    // animal does not have. The line a child DOES see there is the hull's own
    // bottom face, which is geometry and free. `animal-hamster.ts` and
    // `animal-gecko.ts` spend the same tool on the same page, correctly, because
    // their animals do change colour partway up a leg.
    const legs = FERRET_ASSEMBLY.features.find(f => f.name === 'leg')!
    expect(legs.paint.patch, 'the ferret grew a stocking it does not have').toBeUndefined()
    expect(legs.paint).toEqual({ base: 'sable' })
    // What JT-044 does buy is that a leg has its own slot at all, so "dark legs
    // against a cream body" is sayable — and it is the SAME slot as the ears, the
    // nose and the tail, because on this animal those are one marking.
    const sable = FERRET_ASSEMBLY.features.filter(f => f.paint.base === 'sable').map(f => f.name)
    expect(sable.sort()).toEqual(['ear', 'leg', 'nose', 'tail'])
    expect(FERRET_ASSEMBLY.hull.paint.base).not.toBe('sable')
  })

  it('flags the mask where Joe reads it, and authors nothing to fake it', () => {
    const flag = FERRET_ASSEMBLY.flag!
    expect(flag).toMatch(/CANNOT BE EXPRESSED/)
    expect(flag).toMatch(/mask/i)
    expect(flag).toMatch(/UNREVIEWED/)
    // Flagged for the marking and the palette, and for nothing else: no bespoke
    // shape, no stretch anywhere, and no budget declared because none is over.
    expect(flag).not.toMatch(/RULE 1|RULE 9/i)
    expect(FERRET_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(FERRET_ASSEMBLY.features.some(f => f.stretch !== undefined)).toBe(false)
    // Four slots, every one of them doing a job the animal names.
    expect(Object.keys(FERRET_ASSEMBLY.palette)).toEqual(['coat', 'belly', 'sable', 'pupil'])
  })
})
