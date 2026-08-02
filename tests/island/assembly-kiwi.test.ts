/**
 * The kiwi. A wingless, tailless bird whose whole animal is a shape the bank
 * does not contain.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a kiwi can say.
 *
 * Which is six things: **the bank still has no wing**, measured rather than
 * asserted; **it has no tail, on a bank that holds seven of them**; **its bill
 * is a CHAIN and not a stretch**, which is the claim this species exists to
 * make; **its two legs stand at the widest station that is still inside the
 * body's footprint**; **its plumage is buried almost twice as deep as the
 * hedgehog's**, which is the whole difference between hair and spines; and
 * **its eye is the smallest card that can be worn**, with the measurement of why
 * the smaller ones cannot.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, KIWI_ASSEMBLY, HEDGEHOG_ASSEMBLY, LEG_ROW, HULL_FRONT_Z_USUAL,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type PartRole }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-kiwi',
  parts: ['box-01', 'box-03', 'cone-01', 'plate-06', 'tube-02'],
  height: 1.6122,
  verts: 567,
  tris: 774,
  // TWO legs, not four. A bird.
  legs: 2,
  // Nothing it wears is a fortieth of its body: a kiwi IS its hull, which is
  // most of why the bill has to work as hard as it does.
  massRatio: 40,
  // The bill, and the two plumage rows.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-kiwi')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof KIWI_ASSEMBLY.features[number] =>
  KIWI_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-kiwi: the bank has no wing, and a kiwi is the bird that needs none', () => {
  it('measures the absence rather than asserting it', () => {
    /*
     * `africa.ts` holds the ostrich and the vulture off the shelf for this and
     * `night-time.ts` holds the bat and the sugar glider off for it. The role
     * exists in the union and nothing in the data carries it — so this is the
     * line that goes red the day somebody banks a wing shape, at which point the
     * ruling is reopened rather than quietly still true.
     */
    const declared: PartRole[] = ['wing', 'horn', 'claw']
    for (const role of declared) {
      const have = PARTS_BANK.filter(p => p.roles.includes(role)).map(p => p.id)
      expect(have, `the bank now has a "${role}" shape: ${have.join(', ')} — reopen the ruling`)
        .toHaveLength(0)
    }
    // And the pack's own three birds donated no wing either, which is why a bird
    // is buildable here at all: their answer to "what is a bird" is a fused hull,
    // a beak, two legs and eye cards, and every one of those four is in the bank.
    const roleOf = (species: string): string[] => [...new Set(
      PARTS_BANK.flatMap(p => p.provenance.filter(q => q.species === species).map(q => q.role)),
    )].sort()
    for (const bird of ['parrot', 'chick', 'penguin']) {
      const roles = roleOf(bird)
      expect(roles, `${bird} is not in the bank at all`).not.toHaveLength(0)
      expect(roles, `${bird} donated a wing`).not.toContain('wing')
    }
    for (const f of KIWI_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `"${f.name}" wears a wing`).not.toContain('wing')
    }
  })

  it('has NO TAIL, on a bank that holds seven of them', () => {
    // A kiwi has none: no rectrices, a rump that runs straight into the body.
    // The second half of that sentence is what this checks — it is a choice the
    // species made, not a shape it could not find, exactly as
    // `animal-mole.ts` says about its own missing ears.
    expect(PARTS_BANK.filter(p => p.roles.includes('tail')).length).toBeGreaterThan(6)
    for (const f of KIWI_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `"${f.name}" wears a tail`).not.toContain('tail')
    }
    expect(KIWI_ASSEMBLY.features.some(f => f.name === 'tail')).toBe(false)
    // And the absence pays for itself: with nothing on the rump the plumage runs
    // all the way back to the hull's own rear stations without colliding.
    const g = build()
    expect(boxOf(g, 'plume-top-4').min.z).toBeLessThan(-0.625)
  })
})

describe('animal-kiwi: the bill is a CHAIN, and that is the point of this species', () => {
  it('builds it from two parts, neither of them stretched', () => {
    // The root is the chick's and the penguin's own beak, placed by the donor
    // transfer alone: joined at the front face, sunk its own 0.500, centre
    // recovered onto the bank's recorded z. §8, and the agreement is evidence.
    const beak = partById('tube-02')!
    expect(beak.provenance.map(q => q.species).sort()).toEqual(['chick', 'penguin'])
    expect(feature('snout').sink).toBeCloseTo(beak.attachment!.sunkFractionMean, 9)
    const g = build()
    expect(g.getObjectByName('snout')!.position.z).toBeCloseTo(beak.offset[2]!, 4)

    // The shaft is the bee's antenna, spun so its LONG axis points forward. It
    // is the only genuinely slender thing in the bank: 0.160 across against
    // 0.4004 along, an aspect of 2.5 : 1, tapering to a true point.
    const shaft = partById('cone-01')!
    expect(shaft.shape.taper).toBe(0)
    expect(shaft.size[1]! / shaft.size[0]!).toBeGreaterThan(2.4)
    expect(feature('bill').spin).toEqual([{ axis: 'x', deg: 90 }])

    // NOT ONE STRETCH, of either kind, anywhere on this animal. Joe looked at the
    // three newest species on 2 August and every one carried a NON-UNIFORM part
    // stretch; this is the species that had the best excuse for one and does not
    // have one.
    for (const f of KIWI_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(KIWI_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of g.children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
  })

  it('anchors the shaft on the beak\'s OWN built front plane, so it cannot float', () => {
    // `on: 'snout'` is the field that exists for this. The builder solves the
    // anchor off the beak's built vertices rather than off an arithmetic this
    // file would otherwise carry a copy of — `animal-badger.ts` uses it for its
    // nose and says the same. A bill that floats or buries cannot happen quietly.
    const g = build()
    const beak = boxOf(g, 'snout'), shaft = boxOf(g, 'bill')
    expect(shaft.min.z).toBeLessThan(beak.max.z)          // embedded, not abutted
    const bill = feature('bill').placement
    expect(bill.kind).toBe('single')
    if (bill.kind === 'single') {
      // The join point IS the beak's front plane, to the digit.
      expect(bill.at[2]).toBeCloseTo(beak.max.z, 6)
      expect(bill.at[1]).toBeCloseTo(partById('tube-02')!.offset[1]!, 6)
    }
    // Buried 0.12503 in units — the depth the pack itself buries this shape at,
    // and §3's own floor. The spin means it is NOT a transferred attachment
    // fraction, so the number is quoted as a depth and checked as one.
    const shaftPart = partById('cone-01')!
    const depth = shaftPart.size[1]! * shaftPart.attachment!.sunkFractionMean
    expect(depth).toBeCloseTo(0.125, 3)
    expect(beak.max.z - shaft.min.z).toBeCloseTo(depth, 3)
  })

  it('reaches 0.375 clear of the face, which no single bank part does unstretched', () => {
    const g = build()
    const reach = boxOf(g, 'bill').max.z - HULL_FRONT_Z_USUAL
    expect(reach).toBeCloseTo(0.375, 3)
    // Longer than anything the bank can put on a face in one piece. The best
    // single part is `box-18`, the elephant's trunk, at 0.4252 with a recorded
    // burial of zero — and it is a MUZZLE BLOCK, 0.345 wide by 0.623 TALL.
    const single = PARTS_BANK
      .filter(p => p.attachment?.axis === 'z' && p.attachment.dir === 1 && p.size[2]! > 0)
      .map(p => p.size[2]! * (1 - p.attachment!.sunkFractionMean))
    expect(reach).toBeGreaterThan(Math.max(...single.filter(v => v < 0.42)))
  })

  it('records WHY box-18 was refused, so nobody stretches one back in', () => {
    /*
     * `animal-crocodile.ts` solves this same problem with a NON-UNIFORM stretch
     * of [1.812, 0.502, 1.000] on `box-18`, and that is one of the three Joe
     * flagged by name on 2 August. The reason it is needed at all is geometric
     * and is checked here rather than asserted: the shape's LONGEST axis is
     * perpendicular to the face it attaches to, so no spin brings the length
     * forward without taking the attachment off the front face with it.
     */
    const trunk = partById('box-18')!
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    // Its long axis is y, not its attachment's z — which is the whole problem.
    const longest = Math.max(...trunk.size)
    expect(longest).toBe(trunk.size[1])
    expect(trunk.size[2]).toBeLessThan(trunk.size[1]!)
    // And it is taller than it is long: a muzzle block, not a bill.
    expect(trunk.size[1]! / trunk.size[2]!).toBeGreaterThan(1.4)
    // Nothing here wears it.
    expect(KIWI_ASSEMBLY.features.some(f => f.part === 'box-18')).toBe(false)
  })

  it('hangs no nostril dot on the tip, because a cone\'s apex has no width', () => {
    // A kiwi's nostrils at the END of its bill is the fact a child would be told,
    // and it is unsayable. `animal-mole.ts` refuses a nose button on this exact
    // shape for this exact measured reason: the anchor would be a single point.
    for (const id of ['plate-12', 'plate-16']) {
      expect(partById(id)!.size[0]!, `${id} is not a flat dot any more`).toBeGreaterThan(0)
      expect(partById(id)!.size[2]).toBe(0)
    }
    expect(partById('cone-01')!.shape.taper).toBe(0)
    expect(KIWI_ASSEMBLY.features.some(f => f.name === 'nose')).toBe(false)
    // Which is what the flag is for, and it says so where Joe reads it.
    expect(KIWI_ASSEMBLY.flag).toMatch(/NOSTRILS AT THE TIP/)
  })
})

describe('animal-kiwi: two legs, stout and wide-set, said with the stations', () => {
  it('stands at the widest x that is still inside the body\'s own footprint', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    expect(leg.placement.kind).toBe('pair')
    if (leg.placement.kind === 'pair') {
      // A solved bound, not a taste: `box-01` is 0.375 across, so at 0.4375 the
      // outer face lands on 0.625 — flush with the hull's own side and not one
      // thousandth past it. The same number `animal-crocodile.ts` solved for.
      const half = partById('box-01')!.size[0]! / 2
      expect(leg.placement.at[0]! + half).toBeCloseTo(0.625, 9)
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      // z = 0: a biped's legs stand under its centre of mass. Only a quadruped
      // has a wheelbase to choose.
      expect(leg.placement.at[2]).toBe(0)
    }
    // One leg feature, so this is two legs and not four — and the pack's own
    // three birds carry `leg-front-left`/`leg-front-right` and nothing else.
    expect(KIWI_ASSEMBLY.features.filter(f => f.part === LEG_ROW.part)).toHaveLength(1)
    const g = build()
    // Flush, and checked on the built geometry rather than on the spec.
    expect(boxOf(g, 'leg-front-r').max.x).toBeCloseTo(boxOf(g, 'hull').max.x, 3)
    // The pack is never resized: the leg is the leg, at the size it always is.
    for (const n of ['leg-front-r', 'leg-front-l']) {
      const s = boxOf(g, n).getSize(new THREE.Vector3())
      expect(s.x).toBeCloseTo(partById('box-01')!.size[0]!, 4)
      expect(s.y).toBeCloseTo(partById('box-01')!.size[1]!, 3)
    }
  })
})

describe('animal-kiwi: the plumage is hair, and the difference is the burial', () => {
  it('buries each one at the pack\'s MEAN ear depth, not at the shape\'s own', () => {
    const shaft = partById('cone-01')!
    const hedgehog = HEDGEHOG_ASSEMBLY.features.find(f => f.name === 'spike-top')!
    // Same shape, same rows idiom, same 180-degree turn — and a different depth,
    // which is the only dial this vocabulary has for shaggy against spiny.
    const hedgehogSink = hedgehog.sink ?? 0
    expect(feature('plume-top').part).toBe(hedgehog.part)
    expect(hedgehogSink).toBeCloseTo(shaft.attachment!.sunkFractionMean, 9)
    expect(feature('plume-top').sink).toBe(0.548)
    expect(feature('plume-top').sink).toBeGreaterThan(hedgehogSink)
    // 0.548 is §8's measured mean burial for an ear over the whole pack, whose
    // range is 0.00 to 1.00 — a number quoted, not a dial turned.
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear') && p.attachment !== undefined)
    expect(Math.min(...ears.map(p => p.attachment!.sunkFractionMean))).toBeLessThan(0.548)
    expect(Math.max(...ears.map(p => p.attachment!.sunkFractionMean))).toBeGreaterThan(0.548)
    // Two thirds the height, measured on the built model.
    const proud = (sink: number): number => shaft.size[1]! * (1 - sink)
    expect(proud(0.548)).toBeCloseTo(0.181, 3)
    expect(proud(hedgehogSink)).toBeCloseTo(0.275, 3)
    const g = build()
    expect(boxOf(g, 'plume-top-2').max.y - 1.43125).toBeCloseTo(proud(0.548), 3)
  })

  it('runs TWO rows and not five, so the flanks stay smooth', () => {
    // The hedgehog is spiny all the way round and steps five facings through a
    // half turn. A kiwi is shaggy on the back and smooth on the sides, so it
    // takes the top and the chamfers and leaves the side row off — three facings
    // rather than five, fifteen copies rather than twenty.
    const rows = KIWI_ASSEMBLY.features.filter(f => f.name.startsWith('plume-'))
    expect(rows.map(f => f.name).sort()).toEqual(['plume-chamfer', 'plume-top'])
    expect(HEDGEHOG_ASSEMBLY.features.filter(f => f.name.startsWith('spike-'))).toHaveLength(3)
    const g = build()
    const facings = new Set(g.children
      .filter(m => m.name.startsWith('plume-'))
      .map(m => (m.userData['facing'] as number[]).map(v => Math.round(v * 100) / 100).join(',')))
    expect(facings.size, 'the plumage should step three facings, not five').toBe(3)
    expect(g.children.filter(m => m.name.startsWith('plume-'))).toHaveLength(15)
    // Turned 180 degrees, so every one of them sweeps back over the rump — Joe's
    // own instruction on the hedgehog, and which way hair lies.
    for (const f of rows) expect(f.spin?.[0]).toEqual({ axis: 'y', deg: 180 })
  })
})

describe('animal-kiwi: the eye is the SMALLEST card in the pack', () => {
  it('takes the bottom of rule 5\'s one dial, where the nightjar takes the top', () => {
    // A kiwi has the smallest eye relative to body size of any bird alive. The
    // pack's whole eye range is 1.44x wide and this is the bottom of it — and
    // `animal-nightjar.ts`, in the same collection, wears the top. That is as
    // far apart as two birds can be put without stretching anything, which rule
    // 5 makes unsayable in `CreatureDef` anyway.
    const area = (id: string): number => partById(id)!.size[0]! * partById(id)!.size[1]!
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    expect(Math.min(...eyes.map(p => area(p.id)))).toBeCloseTo(area('plate-06'), 9)
    expect(feature('eye').part).toBe('plate-06')
    expect(partById('plate-06')!.provenance.map(q => q.species)).toEqual(['caterpillar'])
    expect(area('plate-06') / area('plate-14')).toBeLessThan(0.5)
    // Absolute, unstretched, on the plane that never moves.
    expect(feature('eye').stretch).toBeUndefined()
    expect(feature('eye').sink).toBe(0)
  })

  it('pins the rounding that made this card unwearable until 2 August', () => {
    /*
     * `plate-06` is exactly what a nearly-blind bird wants and it could not be
     * worn, for a reason that was a latent bug in the harness rather than a
     * property of any species: `assembly-assert.ts` §3 compared a built eye
     * against the bank's `shape.size` FIELD at four decimals, and the bank
     * stores `positions` at four decimals and `size` at SIX. For any card whose
     * true extent has a sixth decimal the two cannot agree past the fourth, so
     * that guard had ZERO discriminating power for this card — it failed at a
     * scale of exactly 1 and at every other scale alike.
     *
     * Every species built before this collection wore `plate-01` or `plate-08`,
     * the two that round exactly, which is why seventeen animals never exposed
     * it. The harness now compares against the part's OWN referenced vertices at
     * 4dp with no allowance, plus the field at 3dp, which is strictly stronger.
     * `animal-nightjar.ts` carries the same note from the other end.
     */
    const p = partById('plate-06')!
    const own = (k: number): number => {
      let lo = Infinity, hi = -Infinity
      for (const vi of new Set(p.indices)) {
        const v = p.positions[vi * 3 + k]!
        if (v < lo) lo = v
        if (v > hi) hi = v
      }
      return hi - lo
    }
    // The field and the vertices disagree by more than a 4dp comparison allows.
    expect(Math.abs(own(1) - p.size[1]!)).toBeGreaterThan(5e-5)
    // And against the vertices themselves there is no drift at all, which is why
    // the exact half of the harness's pair is the one carrying the invariant.
    const g = build()
    const b = boxOf(g, 'eye-r')
    expect(b.max.x - b.min.x).toBeCloseTo(own(0), 4)
    expect(b.max.y - b.min.y).toBeCloseTo(own(1), 4)
  })

  it('makes the small dark eye in the palette rather than in the geometry', () => {
    // Rule 5 makes the eye absolute and structural and all 24 originals carry
    // one, so a nearly-blind animal keeps its cards — `animal-mole.ts`'s
    // argument. The card arrives pre-split at Kenney's own cut, so a dark bead
    // with a grey glint is two texture slots and no geometry at all.
    expect([...new Set(partById('plate-06')!.bands)].sort((a, b) => a - b)).toEqual([3, 15])
    expect(feature('eye').paint.base).toBe('plume')
    expect(feature('eye').paint.byBand?.[15]).toBe('pupil')
    expect(KIWI_ASSEMBLY.palette['plume']).toBe(0x5b4834)
    // And no belly line: a flightless nocturnal ground bird has nothing to
    // counter-shade against, which is `animal-mole.ts` from the same direction.
    expect(KIWI_ASSEMBLY.hull.paint.patch).toBeUndefined()
  })
})
