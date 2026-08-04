/**
 * The nightjar. Night Time's first bird, on a bank with no wing shape in it.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a nightjar can say.
 *
 * Which is five things: **the bank still has no wing**, measured rather than
 * asserted, so the day somebody banks one this file says the absence has
 * changed; **it stands on TWO legs, on the pack's own bird leg row**; **its eye
 * is the biggest card in the pack and there is nothing bigger to reach for**;
 * **its gape is two mouth cards abutted at the midline and is wider than its
 * bill**; and **its bill and its tail are both the pack's own bird parts, placed
 * by the donor transfer and recovered onto the bank's own recorded offsets**.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, NIGHTJAR_ASSEMBLY, LEG_ROW, EYE_CARD_Z, HULL_FRONT_Z_USUAL,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type PartRole }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-nightjar',
  parts: [
    'box-01', 'box-03', 'box-38', 'cone-01', 'plate-03', 'plate-10', 'plate-11',
    'plate-14', 'tube-02',
  ],
  height: 1.5559,
  verts: 469,
  tris: 514,
  // TWO legs, not four. A bird.
  legs: 2,
  // The fan tail is the biggest thing it wears and the hull is five times it.
  massRatio: 5,
  // The bristles, and the two mottling rows turned onto the back.
  spinsAtLeast: 3,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-nightjar')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof NIGHTJAR_ASSEMBLY.features[number] =>
  NIGHTJAR_ASSEMBLY.features.find(f => f.name === name)!

describe('animal-nightjar: the bank has no wing, and this bird needs none', () => {
  it('measures the absence rather than asserting it', () => {
    /*
     * `africa.ts` holds the ostrich and the vulture off the shelf for this and
     * `night-time.ts` holds the bat and the sugar glider off for it. The role
     * exists in the union and nothing in the data carries it — so this is the
     * line that goes red the day somebody banks a wing shape, at which point the
     * ruling is reopened rather than quietly still true.
     */
    const declared: PartRole[] = ['horn', 'claw']  // 'wing' was baked 4 Aug — see note above
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
      /* They DO donate a wing now — the parrot's is `wedge-19`/`wedge-20`, baked
       * on 4 August. What is still true, and is what this species relies on, is
       * that a bird is buildable without one: a fused hull, a beak, two legs and
       * eye cards, every one of them in the bank. */
      for (const need of ['hull', 'leg', 'eye']) {
        expect(roles, `${bird} donated no ${need}`).toContain(need)
      }
    }
    // Nothing on this animal claims to be one, and nothing was authored to fake
    // one either — the harness pins the authored set to empty for this species.
    for (const f of NIGHTJAR_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `"${f.name}" wears a wing`).not.toContain('wing')
    }
  })

  it('wears the hull TWO of the pack\'s three birds wear', () => {
    // Not a default taken for want of a better one. `box-03` is the parrot's and
    // the chick's own shell, which is what makes every donor transfer on this
    // animal a recovery rather than an inference.
    const hull = partById('box-03')!
    const donors = hull.provenance.map(q => q.species)
    expect(donors).toContain('parrot')
    expect(donors).toContain('chick')
    expect(NIGHTJAR_ASSEMBLY.hull.part).toBe('box-03')
  })
})

describe('animal-nightjar: two legs, and both stations are recovered', () => {
  it('stands on ONE mirrored pair, at box-01\'s own x and the hull\'s own midline', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    // The pack's own three birds carry `leg-front-left` and `leg-front-right`
    // and nothing else, which is where the name comes from.
    expect(leg.placement.kind).toBe('pair')
    if (leg.placement.kind === 'pair') {
      // x is `box-01`'s OWN recorded offset — the pack's leg at the x the pack
      // records for it — and z = 0 is the hull's midline. A biped's legs stand
      // under its centre of mass; only a quadruped has a wheelbase to choose.
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0]);
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)
    }
    // And there is exactly one leg feature, so this is two legs and not four.
    expect(NIGHTJAR_ASSEMBLY.features.filter(f => f.part === LEG_ROW.part)).toHaveLength(1)
    expect(NIGHTJAR_ASSEMBLY.features.some(f => f.name === 'leg')).toBe(false)
  })
})

describe('animal-nightjar: the eye is the biggest card the pack drew', () => {
  it('takes plate-14, and nothing in the bank is bigger to reach for', () => {
    const card = partById('plate-14')!
    const area = (id: string): number => partById(id)!.size[0]! * partById(id)!.size[1]!
    // The top of the pack's whole eye range, which is only 1.44x wide. A species
    // whose character is enormous eyes gets this card and there is no next one.
    const eyes = PARTS_BANK.filter(p => p.roles.includes('eye'))
    expect(Math.max(...eyes.map(p => area(p.id)))).toBeCloseTo(area('plate-14'), 9)
    expect(card.provenance.map(q => q.species)).toEqual(['panda'])
    // Never stretched, and it cannot be: rule 5 is unsayable in `CreatureDef`.
    expect(feature('eye').stretch).toBeUndefined()
    expect(feature('eye').sink).toBe(0)
    const g = build()
    for (const n of ['eye-r', 'eye-l']) {
      const b = boxOf(g, n)
      expect(b.max.z).toBeCloseTo(EYE_CARD_Z, 4)
      // Against the part's OWN referenced vertices, exactly — the bank's `size`
      // field is 6dp and its positions 4dp, so the field cannot be the standard
      // for this card. See the test below and `assembly-assert.ts` §3.
      expect(b.max.x - b.min.x).toBeCloseTo(0.4354, 4)
      expect(b.max.y - b.min.y).toBeCloseTo(0.4426, 4)
    }
  })

  it('pins the rounding that made this card unwearable until 2 August', () => {
    /*
     * `plate-14` was the obvious card for this animal and for the tarsier and it
     * could not be worn, for a reason that was a latent bug in the harness
     * rather than a property of any species: `assembly-assert.ts` §3 compared a
     * built eye against the bank's `shape.size` FIELD at four decimals, and the
     * bank stores `positions` at four decimals and `size` at SIX. For any card
     * whose true extent has a sixth decimal the two cannot agree past the
     * fourth, so four of the bank's ten eye records failed an assertion about a
     * stretch none of them had.
     *
     * Every species built before this collection wore `plate-01` or `plate-08`,
     * which are 0.400 wide to the digit, which is why seventeen animals never
     * exposed it. The harness now says it twice — 3dp against the field, exactly
     * at 4dp against the part's own vertices — and this pins the measurement
     * behind that so nobody "tightens" it back.
     */
    const drift = (id: string): number => {
      const p = partById(id)!
      const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]
      for (const vi of new Set(p.indices)) {
        for (let k = 0; k < 3; k++) {
          const v = p.positions[vi * 3 + k]!
          if (v < lo[k]!) lo[k] = v
          if (v > hi[k]!) hi[k] = v
        }
      }
      return Math.max(...[0, 1, 2].map(k => Math.abs((hi[k]! - lo[k]!) - p.size[k]!)))
    }
    // Four records cannot match their own `size` field at 4dp, and two of them
    // are the biggest and the smallest cards in the pack — the two ends of rule
    // 5's only dial, which is exactly what this collection needed.
    const FIELD_4DP = 5e-5
    expect(drift('plate-14')).toBeGreaterThan(FIELD_4DP)
    expect(drift('plate-06')).toBeGreaterThan(FIELD_4DP)
    // And every card that DID pass is 0.400 wide to the digit.
    for (const p of PARTS_BANK.filter(q => q.roles.includes('eye'))) {
      if (drift(p.id) <= FIELD_4DP) expect(p.size[0]).toBe(0.4)
    }
    // Against the part's own vertices there is no drift at all, which is why the
    // exact half of the harness's pair is the one that carries the invariant.
    const g = build()
    const b = boxOf(g, 'eye-r')
    const p = partById('plate-14')!
    const own = [0, 1].map(k => {
      let lo = Infinity, hi = -Infinity
      for (const vi of new Set(p.indices)) {
        const v = p.positions[vi * 3 + k]!
        if (v < lo) lo = v
        if (v > hi) hi = v
      }
      return hi - lo
    })
    expect(b.max.x - b.min.x).toBeCloseTo(own[0]!, 4)
    expect(b.max.y - b.min.y).toBeCloseTo(own[1]!, 4)
  })

  it('paints the sclera dark, so the card reads as one black bead', () => {
    // The card arrives pre-split at Kenney's own cut — bands 3 and 15 — so a big
    // dark eye with a grey glint is two texture slots and no geometry at all.
    // `animal-salamander.ts` makes the same move for the same reason.
    expect([...new Set(partById('plate-14')!.bands)].sort((a, b) => a - b)).toEqual([3, 15])
    expect(feature('eye').paint.base).toBe('mark')
    expect(feature('eye').paint.byBand?.[15]).toBe('pupil')
    expect(NIGHTJAR_ASSEMBLY.palette['mark']).toBe(0x53442f)
  })
})

describe('animal-nightjar: the gape is wider than the bill, which is the animal', () => {
  it('abuts two mouth cards at the midline, at the card\'s own half-width', () => {
    const card = partById('plate-03')!
    const gape = feature('gape')
    expect(gape.placement.kind).toBe('pair')
    if (gape.placement.kind === 'pair') {
      // The station IS the measurement: half the card's own width, so the two
      // copies meet at x = 0 exactly and read as one line rather than two.
      expect(gape.placement.at[0]).toBeCloseTo(card.size[0]! / 2, 6)
    }
    const g = build()
    const r = boxOf(g, 'gape-r'), l = boxOf(g, 'gape-l')
    // To four decimals, which is the precision the bank stores a position at.
    expect(r.min.x).toBeCloseTo(0, 4)
    expect(l.max.x).toBeCloseTo(0, 4)
    const width = r.max.x - l.min.x
    expect(width).toBeCloseTo(2 * card.size[0]!, 4)
    // And the whole point: the mouth is WIDER than the bill above it. One card
    // on its own would have said the opposite.
    expect(width).toBeGreaterThan(partById('tube-02')!.size[0]!)
    expect(card.size[0]!).toBeLessThan(partById('tube-02')!.size[0]!)
  })

  it('opens at the base of the bill, on the pack\'s own 1/16 grid', () => {
    const g = build()
    const gape = boxOf(g, 'gape-r'), bill = boxOf(g, 'snout')
    // 9/16 is the one notch that tucks the line's top edge under the bill's own
    // lower edge. The gape therefore starts where the bill ends.
    const gapeAt = feature('gape').placement
    if (gapeAt.kind === 'pair') expect(gapeAt.at[1]! * 16).toBe(9)
    expect(gape.max.y).toBeGreaterThan(bill.min.y)
    expect(gape.min.y).toBeLessThan(bill.min.y)
    // On the pack's own flat-card shell, 0.010 proud of this cube's front face —
    // the same daylight every eye card in the pack gets, quoted not invented.
    expect(gape.max.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(gape.max.z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.01, 6)
  })

  it('sweeps the bristles UP and OUT rather than straight forward', () => {
    // Two spikes pointing forward beside a mouth read as TUSKS, and brief 19 is
    // "bright, never scary" — the same guardrail that leaves the crocodile its
    // teeth off. Swept up 35 degrees and splayed outward they read as whiskers.
    const bristle = feature('bristle')
    expect(bristle.part).toBe('cone-01')
    expect(bristle.spin).toEqual([{ axis: 'x', deg: 55 }, { axis: 'y', deg: 25 }])
    const g = build()
    const r = g.getObjectByName('bristle-r') as THREE.Mesh
    const l = g.getObjectByName('bristle-l') as THREE.Mesh
    // Rule 4 as amended: the copy's vertices carry the rotation, the node none.
    expect(r.quaternion.toArray()).toEqual([0, 0, 0, 1])
    expect(r.scale.toArray()).toEqual([1, 1, 1])
    // Forward, up and outward — and the mirror carries the left one the other
    // way for free, which is rule 6.
    const fr = r.userData['facing'] as number[]
    const fl = l.userData['facing'] as number[]
    expect(fr[2]!).toBeGreaterThan(0.5)
    expect(fr[1]!).toBeGreaterThan(0.2)
    expect(fr[0]!).toBeGreaterThan(0)
    expect(fl[0]!).toBeCloseTo(-fr[0]!, 9)
    // Rooted at the gape's own outer edge and the gape's own height: three
    // coordinates, all three recovered from numbers already on this animal.
    const at = bristle.placement, gapeAt = feature('gape').placement
    if (at.kind === 'pair' && gapeAt.kind === 'pair') {
      expect(at.at[0]).toBeCloseTo(partById('plate-03')!.size[0]!, 6)
      expect(at.at[1]).toBe(gapeAt.at[1])
      expect(at.at[2]).toBe(HULL_FRONT_Z_USUAL)
    }
  })
})

describe('animal-nightjar: the bill and the tail are the pack\'s own bird parts', () => {
  it('recovers tube-02 and box-38 onto the bank\'s own recorded offsets', () => {
    const beak = partById('tube-02')!, fan = partById('box-38')!
    // The chick's and the penguin's beak, and the parrot's fan tail. Both were
    // unspent before this species, and both donors wear them on `box-03`.
    expect(beak.provenance.map(q => q.species).sort()).toEqual(['chick', 'penguin'])
    expect(fan.provenance.map(q => q.species)).toEqual(['parrot'])
    // Nothing is said about either placement, so both are pure donor transfers —
    // and the centres land on offsets that were never used to solve for them.
    // That agreement is the evidence (§8).
    expect(feature('snout').sink).toBeCloseTo(beak.attachment!.sunkFractionMean, 9)
    expect(feature('tail').sink).toBeCloseTo(fan.attachment!.sunkFractionMean, 9)
    expect(feature('tail').spin).toBeUndefined()
    expect(feature('tail').stretch).toBeUndefined()
    const g = build()
    expect(g.getObjectByName('snout')!.position.z).toBeCloseTo(beak.offset[2]!, 4)
    expect(g.getObjectByName('snout')!.position.y).toBeCloseTo(beak.offset[1]!, 4)
    expect(g.getObjectByName('tail')!.position.z).toBeCloseTo(fan.offset[2]!, 4)
    expect(g.getObjectByName('tail')!.position.y).toBeCloseTo(fan.offset[1]!, 4)
  })

  it('takes the shape the pack buries the DEEPEST of any nose it drew', () => {
    // A nightjar's bill is almost nothing, and this shape is built to mostly not
    // be there: `tube-02` is 0.200 deep and the pack buries exactly half of it,
    // which is the largest burial fraction of any nose in the bank. So 0.100
    // stands proud. It is one measured value, not a mean over disagreeing
    // donors — `sunkFractionMin` and `sunkFractionMax` are both 0.500 — which is
    // why `pets:creature` marking it THIN is a print and not a fault.
    const beak = partById('tube-02')!
    expect(beak.attachment!.sunkFractionMin).toBe(beak.attachment!.sunkFractionMax)
    expect(beak.attachment!.sunkFractionMean).toBe(0.5)
    // Over the noses that mount on a FACE, which is every one of them but the
    // bunny's `box-08` — that is a muzzle worn on the TOP of the head (`y +1`)
    // and buried 0.752, and it is not competing for the same job.
    const noses = PARTS_BANK.filter(p => p.roles.includes('nose') && p.attachment?.axis === 'z')
    expect(Math.max(...noses.map(p => p.attachment!.sunkFractionMean))).toBe(0.5)
    expect(beak.size[2]! * (1 - beak.attachment!.sunkFractionMean)).toBeCloseTo(0.1, 6)
  })
})

describe('animal-nightjar: the mottling is the survival strategy, and the camera looks down', () => {
  it('puts two of the four card rows on the BACK, turned onto the top face', () => {
    const back = ['mottle-back-fore', 'mottle-back-aft'].map(feature)
    for (const f of back) {
      // `{ axis: 'z', deg: 90 }` takes an `x +1` card to `y +1`. A flank card is
      // edge-on from above, and above is where a child sees this animal from.
      expect(f.spin).toEqual([{ axis: 'z', deg: 90 }])
      expect(partById(f.part)!.attachment!.axis).toBe('x')
    }
    const g = build()
    for (const n of ['mottle-back-fore-r', 'mottle-back-aft-r']) {
      const b = boxOf(g, n)
      expect(b.max.y - b.min.y).toBeCloseTo(0, 6)   // flat, and now horizontal
      expect(b.min.y).toBeCloseTo(1.44125, 4)
    }
  })

  it('paints no belly line, because a cryptic bird has nothing to counter-shade', () => {
    // §4's second way is free and it is declined, which is `animal-mole.ts`'s
    // argument from the opposite direction: a mole is uniform because it lives
    // where there is no light, and a nightjar is uniform because it spends the
    // day in plain sight pretending to be bark. A pale underside would be the
    // one part of it that did not match the log.
    expect(NIGHTJAR_ASSEMBLY.hull.paint.patch).toBeUndefined()
    expect(NIGHTJAR_ASSEMBLY.palette['belly']).toBeUndefined()
    // Zero-thickness cards, given no stretch and no sink — marking sheets, not
    // geometry, exactly as `animal-salamander.ts` places the same four.
    for (const n of ['mottle-upper', 'mottle-lower', 'mottle-back-fore', 'mottle-back-aft']) {
      const f = feature(n)
      expect(f.stretch, `${n} carries a stretch`).toBeUndefined()
      expect(f.sink, `${n} is sunk`).toBe(0)
      expect(partById(f.part)!.size[0]).toBe(0)
    }
  })
})

describe('animal-nightjar: nothing on it is stretched, and it says so', () => {
  it('carries no stretch anywhere — not one part, and no hull scale', () => {
    // Joe looked at the three newest animals on 2 August and every one carried a
    // NON-UNIFORM part stretch. This one carries none of either kind, and the
    // reason is worth pinning: every shape it wears was already the right size.
    for (const f of NIGHTJAR_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(NIGHTJAR_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
  })
})
