/**
 * The pony — Home Pets' only large quadruped, and the FIRST species to wear
 * JT-044's two-tone leg as a HOOF.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts`. This file is what only a pony can say, and its first job
 * is not the pony at all: **five Farm species (horse, donkey, mule, cow, pig)
 * will copy the hoof off this animal, so the mechanism is pinned here as a set of
 * FACTS rather than described in a comment.** If any of them changes, this file
 * goes red and names which.
 *
 * What it pins, in the order it pins it:
 *
 *   1. **There is no hoof in the bank.** Zero occurrences, over every id, every
 *      role and every provenance row — re-measured here rather than believed, so
 *      "do not author one" is a statement about the data.
 *   2. **The patch line, exactly**, and the arithmetic off `box-01`'s own three
 *      vertex rows that chose `at: 0.25` rather than `0.1875`.
 *   3. **The three constraints**: `at` is on the pack's 1/16 grid and the guard
 *      throws otherwise; the patch is on the BASE slot and is never combined with
 *      `byBand`; and the legs carry no spin, because a spun boundary rakes.
 *   4. **The IMAGE**, read texel by texel: four rows of hoof under twelve of leg.
 *      That is the mechanism's output and it is exact, where the interpolated
 *      boundary on the mesh is a whisker off — see the species file.
 *
 * Then the things that are the pony: the ear the bank does not have, the tail
 * turned upside down, the mane that could not be a `ridge`, and four parts
 * refused with the measurement that refused them.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, creatureSpec, assemblyTexture, PONY_ASSEMBLY,
  EYE_CARD_Z, HULL_FRONT_Z_USUAL, HULL_BOTTOM_Y, HEIGHT_FLOOR, LEG_ROW,
  OTHER_HULLS, PACK_PUPIL, SLOT_PX, SLOT_W,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-pony',
  parts: ['box-01', 'box-03', 'box-14', 'box-38', 'cone-01', 'plate-01', 'tube-06'],
  // The mane and the forelock, and nothing else. JT-041 sanctioned the three base
  // shapes for everybody permanently, so this needs no `flag` and gets none —
  // `assembly-assert.ts` only demands one for a COMMISSIONED bespoke part.
  authored: ['bespoke-square-01'],
  height: 1.7066,
  verts: 439,
  tris: 586,
  // The hull is five and a third times the tail, which is the next biggest thing
  // on the animal. A pony is a barrel and everything else on it is a detail.
  massRatio: 5,
  // Two: the tail turned upside down and the forelock turned onto the brow
  // chamfer. Said as a number, because rule 4's "no node carries a rotation"
  // passes vacuously on an animal with none.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-pony')
  g.updateMatrixWorld(true)
  return g
}
const feature = (name: string): (typeof PONY_ASSEMBLY)['features'][number] =>
  PONY_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/** How far a shape stands proud of the face it joins, at its OWN measured burial. */
const shown = (id: string): number => {
  const p = partById(id)!
  return p.size[1]! * (1 - p.attachment!.sunkFractionMean)
}

/* ===================================================================== *
 * JT-044 — A HOOF IS A TWO-TONE LEG. FIVE FARM SPECIES COPY THIS BLOCK.
 * ===================================================================== */

describe('animal-pony: JT-044, and there is no hoof in the bank to author instead', () => {
  it('has ZERO hooves in the bank — every id, every role, every provenance row', () => {
    // Joe's ruling is "just use a two tone leg for hooves", and this is the half
    // of it that is a fact about the data rather than a preference: there is
    // nothing to search for, so `findShapes` cannot answer a hoof query and a
    // builder that goes looking will end up authoring one. It must not.
    const hits: string[] = []
    for (const p of PARTS_BANK) {
      if (/hoof/i.test(p.id)) hits.push(p.id)
      for (const q of p.provenance) {
        if (/hoof/i.test(q.name) || /hoof/i.test(q.node)) hits.push(`${p.id}<-${q.species}`)
      }
    }
    expect(hits, 'the bank grew a hoof; JT-044 may no longer be the answer').toEqual([])
    /* And no role for one either. `wing` joined this vocabulary on 4 August when
     * Joe had the parrot's and the bee's baked in — it is listed so the set stays
     * an equality rather than becoming a subset check, which would stop noticing
     * a HOOF role arriving, and that is the thing this test is actually for. */
    const roles = [...new Set(PARTS_BANK.flatMap(p => p.roles))].sort()
    expect(roles).toEqual([
      'band', 'card', 'ear', 'eye', 'hull', 'leg', 'nose', 'oddment', 'tail', 'tooth', 'wing',
    ])
    // Nothing on this animal is authored except the two base shapes, so nobody
    // slipped a hoof in through `authored.ts` either.
    expect(PONY_ASSEMBLY.features.filter(f => f.part.startsWith('bespoke-'))
      .map(f => f.part)).toEqual(['bespoke-square-01', 'bespoke-square-01'])
  })

  it('IS THE PATCH LINE, verbatim — the thing five Farm species copy', () => {
    // If this object changes shape, the mechanism changed. Deep-equalled rather
    // than probed field by field, so an added key is red too.
    expect(feature('leg').paint).toEqual({
      base: 'limb',
      patch: { below: 'hoof', at: 0.25 },
    })
    // `hoof` is an APPENDED palette slot, which is sanctioned: `palette` is an
    // open record and insertion order IS the texture layout. Pinned in order,
    // because moving a slot moves a cell and the whole image with it.
    expect(Object.keys(PONY_ASSEMBLY.palette))
      .toEqual(['coat', 'belly', 'mane', 'limb', 'hoof', 'pupil'])
    expect(PONY_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
  })

  it('chose 4/16 off `box-01`\'s OWN vertex rows, not off a preference', () => {
    const leg = partById('box-01')!
    expect(leg.size).toEqual([0.375, 0.30625, 0.375])
    // Three rows and no more: the sole, the full-width ring, the top. These are
    // the bank's own 4dp positions, which is why the span is 0.3062 where the
    // recorded `size` is 0.30625 — the pack's rounding, not a disagreement.
    const ys = [...new Set(points('box-01').map(p => p[1]!.toFixed(6)))].map(Number)
      .sort((a, b) => a - b)
    expect(ys).toEqual([-0.1531, -0.0906, 0.1531])

    // The foot's bevel runs from the sole to the ring — 0.0625, which is one
    // 1/16 of a model unit exactly — so the leg reaches full width at:
    const bevelTop = (ys[1]! - ys[0]!) / leg.size[1]!
    expect(ys[1]! - ys[0]!).toBeCloseTo(0.0625, 6)
    expect(bevelTop).toBeCloseTo(0.204082, 6)

    // `at` must be k/16, which puts the two candidates either side of that. 3/16
    // lands INSIDE the bevel, where the hoof's top edge would follow a sloping
    // face instead of ringing the leg; 4/16 clears it and lands on the straight
    // shank. So 4/16 is the LOWEST grid point that works, and it is the one spent.
    expect(3 / 16).toBeLessThan(bevelTop)
    expect(4 / 16).toBeGreaterThan(bevelTop)
    expect(feature('leg').paint.patch!.at).toBe(4 / 16)

    // Two checks on it that the choice never used. The hoof is exactly one of the
    // pack's own chamfer cuts deep — 0.25 of the part's smallest dimension,
    // `authored.ts`'s `CHAMFER_OF_SMALLEST`, measured off `box-03`...
    const hoofHeight = 0.25 * leg.size[1]!
    expect(hoofHeight).toBeCloseTo(0.0765625, 7)
    expect(hoofHeight).toBeCloseTo(0.25 * Math.min(...leg.size), 7)
    // ...and it is 42.2% of the leg a child can actually see, because the rest of
    // the leg is buried: the visible stub is HULL_BOTTOM_Y by construction.
    const visible = leg.size[1]! * (1 - leg.attachment!.sunkFractionMax)
    expect(visible).toBeCloseTo(HULL_BOTTOM_Y, 6)
    expect(hoofHeight / visible).toBeCloseTo(0.4224, 4)
    // And the boundary is clear of the belly by more than its own height, so a
    // hoof can never be mistaken for a sock that reaches the body.
    expect(visible - hoofHeight).toBeCloseTo(0.1046875, 6)
  })

  it('keeps all three of the mechanism\'s constraints, and each one bites', () => {
    // (1) THE GRID. `texture.ts` refuses a boundary that cannot be named in the
    // pack's own units, and the refusal is proved here rather than quoted.
    expect(feature('leg').paint.patch!.at * SLOT_PX).toBe(4)
    expect(Number.isInteger(feature('leg').paint.patch!.at * SLOT_PX)).toBe(true)
    expect(() => assemblyTexture(
      ['limb', 'hoof'], { limb: 0x6d4525, hoof: 0x2b2724 },
      { limb: { below: 'hoof', at: 0.2 } },
    )).toThrow(/1\/16 grid/)

    // (2) THE BASE SLOT ONLY. A triangle a `byBand` has already sent elsewhere
    // keeps its flat colour, so a part carrying both would silently ignore the
    // line over part of itself. NOTHING on this animal does both — asserted over
    // every feature and the hull, not just over the legs.
    for (const p of [PONY_ASSEMBLY.hull.paint, ...PONY_ASSEMBLY.features.map(f => f.paint)]) {
      expect(p.patch === undefined || p.byBand === undefined,
        `${p.base} carries a patch and a byBand at once`).toBe(true)
    }
    expect(feature('leg').paint.byBand).toBeUndefined()

    // (3) A SPUN BOUNDARY RAKES. The line is defined on the part's own y, which
    // is world-parallel only while the part is unspun. The leg row is safe by
    // construction — `CreatureDef.legs` has no `spin` field to reach for — and
    // this says so out loud for the next builder, who may spin something.
    expect(feature('leg').spin).toBeUndefined()
    expect(PONY_ASSEMBLY.features.filter(f => (f.spin ?? []).length > 0).map(f => f.name))
      .toEqual(['tail', 'forelock'])

    // And the one that throws at BUILD time: two parts patching the same slot at
    // different heights is one cell asked to hold two pictures. This animal
    // patches `limb` for the hoof and `coat` for the belly, and `limb` exactly
    // once.
    const patched = [PONY_ASSEMBLY.hull.paint, ...PONY_ASSEMBLY.features.map(f => f.paint)]
      .filter(p => p.patch).map(p => p.base)
    expect(patched.sort()).toEqual(['coat', 'limb'])
  })

  it('DRAWS the hoof — four texel rows under twelve, read off the image', () => {
    // The exact pin. `at` is a claim about a definition; this is the picture the
    // definition actually produced, and it is what a child sees.
    const g = build()
    const tex = ((g.getObjectByName('hull') as THREE.Mesh).material as
      THREE.MeshStandardMaterial).map!
    const img = tex.image as ImageData
    const slots = Object.keys(PONY_ASSEMBLY.palette)
    expect(img.width).toBe(SLOT_W)
    expect(img.height).toBe(slots.length * SLOT_PX)
    const rowHex = (row: number): number => {
      const o = row * img.width * 4
      return (img.data[o]! << 16) | (img.data[o + 1]! << 8) | img.data[o + 2]!
    }
    const limb = slots.indexOf('limb')
    for (let k = 0; k < SLOT_PX; k++) {
      const want = k < 4 ? PONY_ASSEMBLY.palette['hoof'] : PONY_ASSEMBLY.palette['limb']
      expect(rowHex(limb * SLOT_PX + k), `limb cell row ${k}`).toBe(want)
    }
    // The belly line, in the same cell-and-row terms: 8/16, the tiger's own
    // mammal boundary made exact and this hull's own equator.
    const coat = slots.indexOf('coat')
    for (let k = 0; k < SLOT_PX; k++) {
      const want = k < 8 ? PONY_ASSEMBLY.palette['belly'] : PONY_ASSEMBLY.palette['coat']
      expect(rowHex(coat * SLOT_PX + k), `coat cell row ${k}`).toBe(want)
    }
    // Every other cell is one flat colour, which is rule 8 and is what makes the
    // two above visible as decisions rather than as noise.
    for (const name of ['belly', 'mane', 'hoof', 'pupil']) {
      const i = slots.indexOf(name)
      const seen = new Set<number>()
      for (let k = 0; k < SLOT_PX; k++) seen.add(rowHex(i * SLOT_PX + k))
      expect([...seen], `${name} is not one flat colour`).toEqual([PONY_ASSEMBLY.palette[name]!])
    }
  })

  it('makes the leg READ ACROSS its cell, which is the half a comment cannot say', () => {
    // The correction §4 records: if every corner of every triangle reads the same
    // point, nothing painted around that point can be seen. A patched part maps
    // one v per VERTEX. So the leg has three distinct rows where an unpatched
    // part of the same shape would have one, and the ear beside it still has one.
    const g = build()
    const rowsOf = (name: string): number[] => {
      const uv = (g.getObjectByName(name) as THREE.Mesh).geometry.getAttribute('uv')
      const out = new Set<string>()
      for (let i = 0; i < uv.count; i++) {
        expect(uv.getX(i), `${name} reads off the cell's centre column`).toBeCloseTo(0.5, 6)
        out.add(uv.getY(i).toFixed(6))
      }
      return [...out].map(Number).sort((a, b) => a - b)
    }
    const n = Object.keys(PONY_ASSEMBLY.palette).length
    const legRows = rowsOf('leg-r0').map(v => v * n * SLOT_PX)
    expect(legRows).toHaveLength(3)
    // The clamp keeps the end rows half a texel off the cell's own edge, so a
    // vertex never samples its neighbour's colour on some driver: the sole reads
    // 48.5 rather than 48 and the top 63.5 rather than 64. The middle row is the
    // bevel top and is NOT clamped — 0.0625 / 0.3062 x 16 = 3.2658 above the cell
    // base, measured against the BUILT span rather than the recorded 0.30625.
    expect(legRows[0]!).toBeCloseTo(3 * SLOT_PX + 0.5, 3)
    expect(legRows[1]! - 3 * SLOT_PX).toBeCloseTo((0.0625 / 0.3062) * SLOT_PX, 3)
    expect(legRows[1]! - 3 * SLOT_PX).toBeCloseTo(3.2658, 3)
    expect(legRows[2]!).toBeCloseTo(4 * SLOT_PX - 0.5, 3)
    // Which puts the DRAWN boundary at 0.0771 above the sole against the ideal
    // 0.0766 — three tenths of one percent of the visible leg, and the price of
    // the half-texel guard rather than an error in the arithmetic. Written down
    // because a Farm species measuring its own hoof should recognise the number.
    const drawn = 0.0625 + ((4 - (legRows[1]! - 3 * SLOT_PX)) / (15.5 - (legRows[1]! - 3 * SLOT_PX)))
      * (0.1531 - (-0.0906))
    expect(drawn).toBeCloseTo(0.07712, 4)
    expect(drawn - 0.25 * 0.30625).toBeLessThan(0.001)
    // The ear is flat-coloured and proves the contrast: one point, three corners.
    expect(rowsOf('ear-r')).toHaveLength(1)
    // All four legs are one geometry, mirrored — rule 6, and it means the hoof
    // is drawn once however many feet the animal has.
    const geos = new Set(['leg-r0', 'leg-l0', 'leg-r1', 'leg-l1']
      .map(nm => (g.getObjectByName(nm) as THREE.Mesh).geometry.uuid))
    expect(geos.size).toBe(2)  // one for the +x copies, one for the mirrored -x
  })
})

/* ===================================================================== *
 * THE ANIMAL
 * ===================================================================== */

describe('animal-pony: the ear the bank does not have', () => {
  it('takes the tallest upright ear that is NOT the rabbit\'s, measured over all ten', () => {
    // How far each y+-attached ear stands proud of the head at its own recorded
    // burial. The handed pairs measure identically, so ten shapes and fifteen
    // records; `box-06` is an outlier at 4.25x the median of the ten.
    const up = PARTS_BANK.filter(p => p.roles.includes('ear')
      && p.attachment?.axis === 'y' && p.attachment.dir === 1)
    expect(up).toHaveLength(15)
    const distinct = [...new Set(up.map(p => p.id.replace(
      /^(box-07|cone-03|cone-05|wedge-05|wedge-17)$/,
      m => ({ 'box-07': 'box-06', 'cone-03': 'cone-02', 'cone-05': 'cone-04',
        'wedge-05': 'wedge-04', 'wedge-17': 'wedge-16' }[m]!),
    )))]
    expect(distinct).toHaveLength(10)
    const sorted = distinct.map(shown).sort((a, b) => b - a)
    expect(sorted[0]).toBeCloseTo(shown('box-06'), 6)   // 0.5788, the bunny's
    expect(sorted[1]).toBeCloseTo(shown('cone-01'), 6)  // 0.2754, and this pony's
    const median = (sorted[4]! + sorted[5]!) / 2
    expect(sorted[0]! / median).toBeCloseTo(4.25, 2)

    // `box-06` REFUSED, with the number that refuses it: on this hull it makes
    // the animal 2.0101 tall, which is `animal-fennec-fox`'s own height and an
    // animal whose whole claim is that its height is ear. A Shetland is short.
    expect(HEIGHT_FLOOR + shown('box-06')).toBeCloseTo(2.0100, 3)
    expect(PONY_ASSEMBLY.features.some(f => f.part === 'box-06' || f.part === 'box-07'))
      .toBe(false)
    // What it took instead, and the two other reasons it is right: it comes to a
    // POINT where every ear of its size is blunt, and its own burial is §3's
    // nothing-floats floor exactly, so nothing about its depth was invented.
    expect(feature('ear').part).toBe('cone-01')
    expect(partById('cone-01')!.shape.taper).toBe(0)
    for (const id of ['wedge-06', 'cone-02', 'wedge-04', 'wedge-16']) {
      expect(partById(id)!.shape.taper, `${id} is as pointed as cone-01`).toBeGreaterThan(0.2)
    }
    expect(partById('cone-01')!.attachment!.sunkUnitsMean).toBe(0.125)
  })

  it('widens it 2x in x ONLY, from a blade to a base that is round', () => {
    // `cone-01` is the bee's ANTENNA and an antenna is flat: 0.1600 across
    // against 0.3286 deep. A horse's ear is round at the base, so the copy is
    // doubled on x alone and lands at 0.3200 x 0.3286 — round to 2.6%. §3
    // measures ears varying 2.97x naturally and names them one of the two kinds
    // a stretch is safe on; nothing else on this animal is stretched at all.
    const ear = partById('cone-01')!
    expect(ear.size[2]! / ear.size[0]!).toBeCloseTo(2.054, 3)
    expect(feature('ear').stretch).toEqual([2, 1, 1])
    expect(Math.abs(2 * ear.size[0]! - ear.size[2]!) / ear.size[2]!).toBeLessThan(0.03)
    expect(PONY_ASSEMBLY.features.filter(f => f.stretch !== undefined).map(f => f.name))
      .toEqual(['ear', 'mane', 'forelock'])
    expect(PONY_ASSEMBLY.hull.stretch).toBeUndefined()
  })

  it('keeps the donor\'s HEIGHT and moves only its z, because the bee\'s z floats', () => {
    const ear = partById('cone-01')!
    const at = feature('ear').placement
    if (at.kind === 'pair') {
      // The x and the y are the bee's own, recovered: joined at this hull's top
      // face and sunk cone-01's own 0.3122, the centre lands on the bank's
      // recorded offset. The bee wears this shape on `box-03`, which is this
      // hull, so the transfer is a recovery rather than an inference.
      expect(at.at[0]).toBeCloseTo(ear.offset[0]!, 4)
      expect(at.at[1]).toBe(HEIGHT_FLOOR)
      const shift = ear.size[1]! / 2 - ear.attachment!.sunkFractionMean * ear.size[1]!
      expect(HEIGHT_FLOOR + shift).toBeCloseTo(ear.offset[1]!, 4)
      // The z is NOT taken over, and this is why. `box-03`'s flat top face
      // reaches only |z| <= 0.3125 and the chamfer then falls away 1:1, so at the
      // bee's own 0.4697 the surface has receded to 1.27405 while the ear's
      // underside is at 1.30625 — it would stand 0.032 CLEAR of the hull. §3 says
      // nothing floats. Recorded so nobody restores the donor's number.
      const flatHalf = Math.max(...points('box-03').filter(p => p[1]! > 0.6249).map(p => p[2]!))
      expect(flatHalf).toBeCloseTo(0.3125, 6)
      const surface = HEIGHT_FLOOR - (ear.offset[2]! - flatHalf)
      const underside = HEIGHT_FLOOR + shift - ear.size[1]! / 2
      expect(underside - surface).toBeCloseTo(0.0322, 3)
      // At 4/16 — on the pack's own grid — the join is on flat geometry.
      expect(at.at[2]).toBe(4 / 16)
      expect(at.at[2]).toBeLessThan(flatHalf + 1e-9)
    }
    // And the ears are the tallest thing on the animal, which is what makes them
    // read: 1.7066, with the mane's crest 0.025 under them.
    const g = build()
    const top = (n: string): number => new THREE.Box3()
      .setFromObject(g.getObjectByName(n)!).max.y
    expect(top('ear-r')).toBeCloseTo(1.7066, 3)
    expect(top('mane')).toBeLessThan(top('ear-r'))
    expect(top('hull')).toBeCloseTo(HEIGHT_FLOOR, 4)
  })
})

describe('animal-pony: the tail is the parrot\'s fan, upside down', () => {
  it('is in §7\'s THICK group, which is what refuses the four long thin ones', () => {
    // §7 splits the seven tails on thickness, not length: thin 0.200-0.345, thick
    // 0.589-0.744, a 1.7x gap with nothing in it. A horse's tail is emphatically
    // thick, and saying so refuses four shapes at once and costs nothing.
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    const thin = (id: string): number => Math.min(...partById(id)!.size)
    const thick = tails.filter(p => thin(p.id) > 0.4).map(p => p.id).sort()
    expect(thick).toEqual(['box-23', 'box-38', 'wedge-03'])
    expect(Math.min(...thick.map(thin)) / Math.max(...tails.filter(p => thin(p.id) < 0.4)
      .map(p => thin(p.id)))).toBeGreaterThan(1.7)
    expect(feature('tail').part).toBe('box-38')
    // `box-23` is the fox's brush and `animal-wolf.ts` has already measured why it
    // is left alone. `wedge-15` is refused twice over: it is in the THIN group and
    // at 212 triangles it is more than four times this tail's 48.
    expect(PONY_ASSEMBLY.features.some(f => f.part === 'box-23')).toBe(false)
    expect(partById('wedge-15')!.tris / partById('box-38')!.tris).toBeGreaterThan(4)
    expect(thin('wedge-15')).toBeCloseTo(0.28, 6)
  })

  it('turns it over, and the SPIN is the difference between a parrot and a horse', () => {
    // The fan arrives stalk-down and fans upward. Its stalk is the ONLY part of
    // it inboard of the join plane — twelve points, at the two lowest rows — so
    // turning the shape over turns a fan into a fall hanging off a dock.
    const fan = partById('box-38')!
    const buried = fan.size[2]! / 2 - fan.attachment!.sunkFractionMean * fan.size[2]!
    const root = points('box-38').filter(p => p[2]! >= buried - 1e-9)
    expect(root).toHaveLength(12)
    expect(Math.min(...root.map(p => p[1]!))).toBeCloseTo(-0.4561, 3)
    expect(Math.max(...root.map(p => p[1]!))).toBeCloseTo(-0.3561, 3)
    expect(Math.max(...root.map(p => Math.abs(p[0]!)))).toBeCloseTo(0.0850, 3)
    // A z-180 negates x and y and leaves the `z -1` facing untouched, which is
    // what lets the donor transfer still solve the rear-face join.
    expect(feature('tail').spin).toEqual([{ axis: 'z', deg: 180 }])
    expect(fan.attachment!.axis).toBe('z')
    expect(fan.attachment!.dir).toBe(-1)
  })

  it('hangs from the HIGHEST join whose root is still on flat geometry', () => {
    // 0.662654 is solved, not chosen. `box-03`'s flat rear face stops at
    // 0.80625 + 0.3125 = 1.11875, and the spun root's upper end is its own
    // 0.4560955 above the centre — so this is the one height at which the whole
    // root lands on real flat face rather than off a chamfer that has receded.
    const fan = partById('box-38')!
    const hull = partById('box-03')!
    const flatTop = hull.offset[1]! + Math.max(...points('box-03')
      .filter(p => p[2]! < -0.6249).map(p => p[1]!))
    expect(flatTop).toBeCloseTo(1.11875, 6)
    const at = feature('tail').placement
    if (at.kind === 'single') {
      expect(at.at[1]! + fan.size[1]! / 2).toBeCloseTo(flatTop, 4)
      expect(at.at[2]).toBe(-HULL_FRONT_Z_USUAL)
    }
    const g = build()
    const t = new THREE.Box3().setFromObject(g.getObjectByName('tail')!)
    expect(t.max.y).toBeCloseTo(flatTop, 3)
    // It falls the whole depth of the barrel and stops a shade short of the
    // belly, and it never breaks the back line — which is the whole difference
    // between this and the beaver's and the lion's tails, both of which stand
    // proud of the hull top at their donors' own heights.
    expect(t.min.y).toBeCloseTo(0.2066, 3)
    expect(t.min.y).toBeGreaterThan(HULL_BOTTOM_Y)
    expect(t.min.y - HULL_BOTTOM_Y).toBeLessThan(0.03)
    expect(t.max.y).toBeLessThan(HEIGHT_FLOOR)
    // Everything else about it is the transfer: its centre recovers the parrot's
    // own recorded z, which the solve never used.
    expect(g.getObjectByName('tail')!.position.z).toBeCloseTo(fan.offset[2]!, 4)
  })
})

describe('animal-pony: the mane, which could not be a ridge', () => {
  it('CANNOT be a ridge, because a ridge resolves its part off the bank alone', () => {
    // The obvious route, and it does not exist. `creatureSpec`'s ridge branch
    // calls `partById` and never `authoredById`, so JT-041's three base shapes —
    // the only thing in the project that could BE a lock of hair — are unreachable
    // from a ridge. Proved by making it throw, not by reading the source.
    expect(() => creatureSpec('animal-pony', {
      palette: { coat: 0x9a5f33, pupil: PACK_PUPIL },
      ridge: { part: 'bespoke-square-01', count: 4 },
    })).toThrow(/ridge shape "bespoke-square-01" is not in the bank/)
    // And it is the PRIMITIVE that is refused, not the ridge: a bank shape in the
    // same place is fine. So this is a real gap in the builder and not a mistake
    // in the definition above.
    expect(() => creatureSpec('animal-pony', {
      palette: { coat: 0x9a5f33, pupil: PACK_PUPIL },
      ridge: { part: 'cone-01', count: 4, rows: ['top'] },
    })).not.toThrow()
    expect(PONY_ASSEMBLY.features.some(f => f.name.includes('spike'))).toBe(false)
  })

  it('is a CONTINUOUS crest the length of the hull\'s own flat top face', () => {
    // A row of discrete parts along a back is a hedgehog, a dragon or a
    // crocodile; a mane is one unbroken crest. It is a single mesh, and its
    // 0.625 of run is not a chosen number — it is exactly what `box-03`'s flat
    // top face measures, so the crest ends where the body does.
    const g = build()
    const m = new THREE.Box3().setFromObject(g.getObjectByName('mane')!)
    const flatHalf = Math.max(...points('box-03').filter(p => p[1]! > 0.6249).map(p => p[2]!))
    expect(m.max.z - m.min.z).toBeCloseTo(flatHalf * 2, 4)
    expect(m.max.x - m.min.x).toBeCloseTo(0.125, 4)
    // Half buried at the primitive's own declared sink, so it stands 0.250 proud
    // — 4/16 — and is embedded 0.250 at the front and 0.1875 at its rear end,
    // where the chamfer has already fallen 0.0625. §3: nothing floats.
    expect(HEIGHT_FLOOR - m.min.y).toBeCloseTo(0.25, 4)
    expect(m.max.y - HEIGHT_FLOOR).toBeCloseTo(0.25, 4)
    const rearDrop = Math.abs(m.min.z) - flatHalf
    expect(rearDrop).toBeGreaterThan(0)
    expect(0.25 - rearDrop).toBeGreaterThan(0.125)
    // It runs between the ears and back, and it is painted the black-points slot
    // with the forelock and the tail — one colour doing the pony's signature.
    for (const n of ['mane', 'forelock', 'tail']) expect(feature(n).paint.base).toBe('mane')
  })

  it('hangs the FORELOCK on `box-03`\'s own measured chamfer, at 45 degrees', () => {
    // §8's chamfer idiom spent on one part rather than a row. The midpoint is
    // 0.46875 on both axes — NOT the 0.5625 an uncut 1.000 face would give, which
    // §8 says costs a whole row when it is assumed. Re-derived here off the hull.
    const pts = points('box-03')
    const half = Math.max(...pts.map(p => p[1]!))
    const inset = Math.max(...pts.filter(p => p[2]! > 0.6249).map(p => p[1]!))
    expect((half + inset) / 2).toBeCloseTo(0.46875, 6)
    const at = feature('forelock').placement
    if (at.kind === 'single') {
      expect(at.at).toEqual([0, 0.80625 + 0.46875, 0.46875])
    }
    expect(feature('forelock').spin).toEqual([{ axis: 'x', deg: 45 }])
    // And it is proud enough to be IN the silhouette rather than filling the
    // chamfer flush — past the hull's top face and past its front face at once,
    // which is the thing a still image hides best.
    const g = build()
    const f = new THREE.Box3().setFromObject(g.getObjectByName('forelock')!)
    expect(f.max.y).toBeGreaterThan(HEIGHT_FLOOR)
    expect(f.max.z).toBeGreaterThan(HULL_FRONT_Z_USUAL)
  })
})

describe('animal-pony: the face, and the four parts refused', () => {
  it('wears the fox\'s muzzle for Kenney\'s cut, painted the INVERSE of the badger\'s', () => {
    // `tube-06` and the deer's `tube-03` are the same bounding box to six
    // decimals and `tube-06` is the one he split. The badger and the wolf both
    // paint the base pale and band 7 dark; this is the other way round — coat
    // over the bridge, pale pangare mealy muzzle underneath — which is one part
    // reading as a different animal for one line.
    expect(partById('tube-06')!.size).toEqual(partById('tube-03')!.size)
    expect(feature('snout').paint).toEqual({ base: 'coat', byBand: { 3: 'belly' } })
    // Band 3 is the LOWER half and band 7 the upper. Measured off the part,
    // because getting this backwards is invisible in a definition.
    const p = partById('tube-06')!
    const meanY = (band: number): number => {
      const ys: number[] = []
      for (let t = 0; t < p.bands.length; t++) {
        if (p.bands[t] !== band) continue
        for (let k = 0; k < 3; k++) ys.push(p.positions[p.indices[t * 3 + k]! * 3 + 1]!)
      }
      return ys.reduce((a, b) => a + b, 0) / ys.length
    }
    expect(meanY(3)).toBeLessThan(meanY(7))
    // Joined at the front face sunk its own 0.000, its centre recovers the fox's
    // own recorded z to four decimals — the noise floor of a float32 attribute.
    expect(feature('snout').sink).toBe(0)
    expect(build().getObjectByName('snout')!.position.z).toBeCloseTo(p.offset[2]!, 4)
  })

  it('hangs the deer\'s nose on the muzzle\'s own plane, and refuses `wedge-10`', () => {
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    const nose = g.getObjectByName('nose')!
    expect((nose.userData['joinedAt'] as number[])[2]).toBeCloseTo(front, 6)
    expect(feature('nose').part).toBe('box-14')
    // The pack's ungulate nose, and small — a horse has nothing like a dog's pad.
    expect(partById('box-14')!.provenance.map(q => q.species)).toEqual(['deer'])
    expect(partById('box-14')!.size[0]!).toBeLessThan(partById('box-26')!.size[0]!)
    // Not `wedge-10`, which is measurably a nose TIP and reads as a tongue. Joe
    // rejected that one by name on the hedgehog and the lesson is not its own.
    expect(PONY_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })

  it('has NO MOUTH CARD, and the measurement is why rather than an oversight', () => {
    // `CARD_STANDOFF` made a mouth placeable and this species still cannot use
    // one. Solved, a card joins the HULL's front face and finishes at the eye
    // plane — 0.635 — which on this animal is 0.22 INSIDE its own muzzle, because
    // the muzzle reaches 0.85642. Anchored `on: 'snout'` instead it lands dead
    // centre on the plane the nose already occupies. A horse's mouth is UNDER its
    // muzzle, and neither route takes an offset within a plane.
    const g = build()
    const front = new THREE.Box3().setFromObject(g.getObjectByName('snout')!).max.z
    expect(front).toBeCloseTo(0.85642, 4)
    expect(EYE_CARD_Z).toBeLessThan(front - 0.2)
    expect(PONY_ASSEMBLY.features.some(f => f.part === 'plate-03' || f.part === 'plate-13'))
      .toBe(false)
    // And nothing here hard-codes a card plane. The `at: [0, 0.686849, 0.635]`
    // that three older species carry was a workaround for a bug that is fixed;
    // inventing a fresh one would be the same mistake with a new number.
    for (const f of PONY_ASSEMBLY.features) {
      expect(partById(f.part)?.roles.includes('card') ?? false, `${f.name} is a card`).toBe(false)
    }
  })

  it('refuses the two likelier hulls, each on its own measurement', () => {
    expect(PONY_ASSEMBLY.hull.part).toBe('box-03')
    // `box-41`, the tiger's, is the obvious barrel and it would BURY THE EYES:
    // its front face stands at 0.725 over a world y range that takes in the eye
    // card's own 0.933646, and EYE_CARD_Z is 0.6350 and is not a parameter.
    const big = partById(OTHER_HULLS.bigger)!
    const frontZ = big.offset[2]! + big.size[2]! / 2
    expect(frontZ).toBeCloseTo(0.725, 6)
    expect(frontZ - EYE_CARD_Z).toBeCloseTo(0.09, 6)
    const cardY = partById('plate-01')!.offset[1]!
    expect(cardY).toBeGreaterThan(big.offset[1]! - big.size[1]! / 2)
    expect(cardY).toBeLessThan(big.offset[1]! + big.size[1]! / 2)
    // `box-12`, the cow's, is refused for the badger's reason: its extra width is
    // two fused EAR LUGS on a 1.250 cube, so it is four ears or no upright ears.
    const wide = partById(OTHER_HULLS.wider)!
    const body = points('box-12').filter(q => Math.abs(q[2]!) <= 0.3125)
    expect(Math.max(...body.map(q => Math.abs(q[0]!)))).toBeCloseTo(0.625, 6)
    expect(wide.size[0]!).toBeGreaterThan(1.5)
    expect(PONY_ASSEMBLY.hull.part).not.toBe(OTHER_HULLS.wider)
  })

  it('leaves the leg row and the eye plane entirely alone, and says so', () => {
    const leg = feature('leg')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'row') {
      // The builder's own defaults on a 1.250 hull: 0.27 across, 0.25 fore-and-aft.
      // A Shetland is short-legged and could not have said so with the row anyway
      // — `LEG_ROW.y` is what puts the feet on zero — so nothing here is tuned.
      expect(leg.placement.from).toEqual([0.27, LEG_ROW.y, 0.25])
      expect(leg.placement.count * 2).toBe(4)
    }
    const card = partById('plate-01')!
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
  })
})

describe('animal-pony: what a child names it by, and what the island charges for it', () => {
  it('carries all six naming features, and three of them are its silhouette', () => {
    // Long face, upright ears, mane, forelock, long tail, dark hooves. The MANE
    // plus the HOOVES plus the falling TAIL is the signature: nothing else in
    // Home Pets has any of the three, and no two of them can be reached by tuning
    // a proportion, which is what `species-garden.test.ts:261` asks of a member.
    const names = PONY_ASSEMBLY.features.map(f => f.name).sort()
    expect(names).toEqual(['ear', 'eye', 'forelock', 'leg', 'mane', 'nose', 'snout', 'tail'])
    expect(PONY_ASSEMBLY.palette['hoof']).toBeDefined()
    // A red bay, and deliberately not a colour a sandy rodent or a cage bird
    // would want. `home-pets.ts` gives this species no colours at all, so every
    // one is a first proposal — see the file's UNREVIEWED note.
    expect(PONY_ASSEMBLY.palette['coat']).toBe(0x9a5f33)
    expect(PONY_ASSEMBLY.palette['hoof']).not.toBe(PONY_ASSEMBLY.palette['limb'])
    // It swishes and it flicks. Both name features it actually has, which
    // `resolveMotion` checks at definition time.
    expect(PONY_ASSEMBLY.motion?.map(m => `${m.kind}:${m.parts.join()}`))
      .toEqual(['wag:tail', 'twitch:ear'])
  })

  it('fits between two trees, and it is the DEPTH that costs, not the width', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The barrel is the
    // pack's own 1.250 across; the muzzle in front and the tail behind make 2.077
    // of depth, and that is what the island pays for.
    expect(s.x).toBeCloseTo(1.25, 3)
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.038, 2)
    // Inside the fox's 1.15, which is the pack's worst and the number the island
    // already copes with.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    // Stocky, which is the whole of what a Shetland is: width over height, inside
    // the 0.55-1.35 the pack itself spans.
    expect(s.x / s.y).toBeCloseTo(0.732, 2)
    expect(s.x / s.y).toBeGreaterThan(0.55)
    // Nothing is over budget and no rule was strained, so there is no flag.
    expect(PONY_ASSEMBLY.flag).toBeUndefined()
  })
})
