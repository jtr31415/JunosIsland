/**
 * The budgie. Home Pets' first cage bird, and the first species in the project
 * that WEARS a wing on a bank that has none.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a budgie can say,
 * and it says five things the next three cage birds need and cannot get from a
 * screenshot:
 *
 *   1. **THE BANK STILL HAS NO WING**, measured rather than asserted, so the day
 *      somebody bakes the role this file goes red and the substitute below is
 *      reconsidered instead of quietly inherited by four birds. That is exactly
 *      what `animal-badger.ts`'s test does for its stripe.
 *   2. **The substitute is `box-06`, and BOTH halves of the choice are
 *      measured** — that it is the longest ear shape in the bank, and that the
 *      two cheap flat alternatives have an exactly-zero axis where it has none.
 *   3. **The wing's three numbers are solved**, including the one place a donor
 *      transfer had to be overruled, and the built part is checked against the
 *      hull's own face planes rather than believed.
 *   4. **`box-21` is a cube wearing the fox's EARS**, re-derived here from the
 *      shell's own vertices — which is why this bird is not the tallest of four
 *      and why the cockatiel should wear that hull instead.
 *   5. **Three things could not be said** — the barring, a cere pad and the
 *      throat spots — and each refusal is pinned as a fact about the BANK or the
 *      HULL, not as an opinion in a comment.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, BUDGIE_ASSEMBLY, EYE_CARD_Z, HULL_FRONT_Z_USUAL, LEG_ROW,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById, type PartRole }
  from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-budgie',
  parts: [
    'box-01', 'box-03', 'box-06', 'cone-06', 'plate-08', 'plate-10', 'plate-16',
    'wedge-15',
  ],
  height: 1.4312,
  verts: 478,
  tris: 592,
  // TWO legs, not four. A bird.
  legs: 2,
  // The tail is the biggest thing it wears and the hull is eleven times it.
  massRatio: 11,
  // The tail, turned to point straight back, and the wing pair turned onto the
  // flank. Said as a number, because rule 4's "no node carries a rotation"
  // passes vacuously on an animal with none.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-budgie')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const feature = (name: string): typeof BUDGIE_ASSEMBLY.features[number] =>
  BUDGIE_ASSEMBLY.features.find(f => f.name === name)!

/** A part's referenced points, as the bank stores them: origin-centred. */
const points = (id: string): [number, number, number][] => {
  const p = partById(id)!
  const out: [number, number, number][] = []
  for (const vi of new Set(p.indices)) {
    out.push([p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!])
  }
  return out
}

/**
 * How far a WORLD point sits inside `box-03`, measured against every one of the
 * shell's own face planes.
 *
 * `box-03` is convex, so the nearest plane is the binding one and a positive
 * number means embedded. Written out here rather than asked of the builder,
 * because the thing being checked is whether the BUILDER's arithmetic put the
 * wing inside the body — a shared implementation would let that agree with
 * itself. Positive is inside; the number is a perpendicular distance.
 */
function insideHull(w: readonly [number, number, number]): number {
  const p = partById('box-03')!
  const at = p.offset
  const q = [w[0] - at[0]!, w[1] - at[1]!, w[2] - at[2]!]
  let worst = Infinity
  for (let t = 0; t < p.indices.length; t += 3) {
    const v = [0, 1, 2].map(k => {
      const vi = p.indices[t + k]!
      return [p.positions[vi * 3]!, p.positions[vi * 3 + 1]!, p.positions[vi * 3 + 2]!]
    })
    const a = [0, 1, 2].map(k => v[1]![k]! - v[0]![k]!)
    const b = [0, 1, 2].map(k => v[2]![k]! - v[0]![k]!)
    const n = [
      a[1]! * b[2]! - a[2]! * b[1]!,
      a[2]! * b[0]! - a[0]! * b[2]!,
      a[0]! * b[1]! - a[1]! * b[0]!,
    ]
    const len = Math.hypot(n[0]!, n[1]!, n[2]!)
    if (len < 1e-12) continue
    const dot = (u: readonly number[], w2: readonly number[]): number =>
      u[0]! * w2[0]! + u[1]! * w2[1]! + u[2]! * w2[2]!
    /* The shell is origin-centred, so the outward normal is the one that points
     * away from the origin at the face's own corner. */
    const sgn = dot(n, v[0]!) < 0 ? -1 : 1
    const nn = n.map(c => (c * sgn) / len)
    const d = dot(nn, v[0]!) - dot(nn, q)
    if (d < worst) worst = d
  }
  return worst
}

/** The mean of one coordinate over every corner of every triangle in a band. */
const bandMean = (id: string, band: number, axis: 0 | 1 | 2): number => {
  const p = partById(id)!
  const vals: number[] = []
  for (let t = 0; t < p.bands.length; t++) {
    if (p.bands[t] !== band) continue
    for (let k = 0; k < 3; k++) vals.push(p.positions[p.indices[t * 3 + k]! * 3 + axis]!)
  }
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

describe('animal-budgie: the bank has no wing, and this bird cannot do without one', () => {
  it('measures the absence rather than asserting it', () => {
    /*
     * `animal-nightjar.ts` and `animal-kiwi.ts` both pin this and both were
     * entitled to — a perched nightjar's wings are inside its own outline and a
     * kiwi has none. A budgie has neither excuse, so this species had to
     * improvise one (JT-043). This is the line that goes red the day somebody
     * bakes the role, at which point the substitute is reconsidered rather than
     * quietly still in four birds.
     */
    const declared: PartRole[] = ['wing', 'horn', 'claw']
    for (const role of declared) {
      const have = PARTS_BANK.filter(p => p.roles.includes(role)).map(p => p.id)
      expect(have, `the bank now has a "${role}" shape: ${have.join(', ')} — reopen the wing`)
        .toHaveLength(0)
    }
    // The pack's own three birds donated no wing to this module either.
    const roleOf = (species: string): string[] => [...new Set(
      PARTS_BANK.flatMap(p => p.provenance.filter(q => q.species === species).map(q => q.role)),
    )].sort()
    for (const bird of ['parrot', 'chick', 'penguin']) {
      const roles = roleOf(bird)
      expect(roles, `${bird} is not in the bank at all`).not.toHaveLength(0)
      expect(roles, `${bird} donated a wing`).not.toContain('wing')
    }
    // And nothing on this animal claims to be one.
    for (const f of BUDGIE_ASSEMBLY.features) {
      expect(partById(f.part)!.roles, `"${f.name}" wears a wing`).not.toContain('wing')
    }
  })

  it('reaches for the LONGEST EAR in the bank, and the measurement is the reason', () => {
    // 0.913298 against the koala's 0.742676 and the elephant's 0.618750 — 1.23x
    // and 1.48x. On a 1.250-deep body a folded wing wants to run most of the
    // length, and nothing in the bank that is not a TAIL does.
    const ears = PARTS_BANK.filter(p => p.roles.includes('ear'))
    expect(ears.length).toBeGreaterThan(20)
    const longest = Math.max(...ears.map(p => p.shape.longest))
    expect(longest).toBeCloseTo(partById('box-06')!.shape.longest, 9)
    expect(longest).toBeCloseTo(0.913298, 6)
    expect(partById('box-25')!.shape.longest).toBeLessThan(0.75)
    expect(feature('wing').part).toBe('box-06')
    // And the pair is the pack's OWN pair: `box-07` is the same point set
    // mirrored, so rule 6's "author once, place twice" costs nothing invented.
    const mirror = (q: [number, number, number]): string =>
      [-q[0], q[1], q[2]].map(v => v.toFixed(4)).join(',')
    const right = new Set(points('box-06').map(mirror))
    for (const q of points('box-07')) {
      expect(right.has(q.map(v => v.toFixed(4)).join(',')), 'box-07 is not box-06 mirrored')
        .toBe(true)
    }
  })

  it('refuses the two FLAT wings, and the refusal is a measurement', () => {
    /*
     * The cheap wing is a flank card — `plate-10`/`plate-11`, side-mounted, which
     * `animal-nightjar.ts` and `animal-salamander.ts` both wear — or a stretched
     * `bespoke-triangle-01`, which JT-041 sanctions without a flag and which is
     * genuinely the right OUTLINE. Both are ZERO THICKNESS, and the island's
     * camera looks DOWN: the nightjar moves two of its four cards onto the BACK
     * for exactly that reason. A wing edge-on from the only angle a child plays
     * at is not a wing.
     */
    for (const id of ['plate-10', 'plate-11']) {
      expect(Math.min(...partById(id)!.size), `${id} has thickness`).toBe(0)
    }
    expect(Math.min(...partById('box-06')!.size)).toBeCloseTo(0.305836, 6)
    // The card is spent as the wing BAR instead, on the wing's own outer face —
    // which is a marking, and a marking is what a zero-thickness card is for.
    expect(feature('wing-bar').part).toBe('plate-10')
    expect(BUDGIE_ASSEMBLY.features.some(f => f.part.startsWith('bespoke-'))).toBe(false)
    expect(BUDGIE_ASSEMBLY.flag).not.toMatch(/RULE 1|RULE 9/i)
  })
})

describe('animal-budgie: the wing is that ear turned onto the flank', () => {
  it('runs its long axis FORE-AND-AFT while the join stays on the side face', () => {
    const wing = feature('wing')
    // An ear's long axis and its facing are the same direction, so the composite
    // has to move the length onto z while the facing lands on +x. Two spins are
    // the fewest that can: no single axis-aligned turn does a three-cycle.
    expect(wing.spin).toEqual([{ axis: 'z', deg: -90 }, { axis: 'y', deg: -90 }])
    expect(wing.axis).toBe('z')
    expect(wing.dir).toBe(-1)

    const g = build()
    const b = boxOf(g, 'wing-r')
    const own = partById('box-06')!.size
    // own x -> y (height), own y -> z (length), own z -> x (thickness). Measured
    // off the built mesh, so the composite is checked rather than reasoned about.
    expect(b.max.x - b.min.x).toBeCloseTo(own[2]!, 3)
    expect(b.max.y - b.min.y).toBeCloseTo(own[0]!, 3)
    expect(b.max.z - b.min.z).toBeCloseTo(own[1]!, 3)
    // And it faces out of the flank, with the mirror carrying the left one the
    // other way for free (rule 6).
    const fr = g.getObjectByName('wing-r')!.userData['facing'] as number[]
    const fl = g.getObjectByName('wing-l')!.userData['facing'] as number[]
    expect(fr[0]!).toBeCloseTo(1, 6)
    expect(fl[0]!).toBeCloseTo(-1, 6)
  })

  it('joins at three numbers that are all the HULL\'S OWN', () => {
    const hull = partById('box-03')!
    const wing = feature('wing')
    if (wing.placement.kind === 'pair') {
      // The side face, the shell's own recorded centre height, and its midline.
      // A bird's wing hangs at the shoulder, which is the body's mid-height, and
      // the number was not invented — it was the hull's. `animal-badger.ts`
      // makes the same move for its tail and for the same reason.
      expect(wing.placement.at[0]).toBe(hull.size[0]! / 2)
      expect(wing.placement.at[1]).toBe(hull.offset[1])
      expect(wing.placement.at[2]).toBe(0)
    }
  })

  it('is sunk to the depth its own TIP needs, snapped to the pack\'s 1/16 grid', () => {
    const part = partById('box-06')!
    const hull = partById('box-03')!
    const thickness = part.size[2]!            // the axis the spin puts across the join
    const tip = part.shape.longest / 2         // how far the wing reaches fore and aft
    // How far the flat side face reaches along z before the chamfer starts. The
    // measurement §8 step 1 says costs a whole row when it is assumed instead.
    const flat = Math.max(...points('box-03')
      .filter(q => Math.abs(Math.abs(q[0]) - hull.size[0]! / 2) < 1e-6)
      .map(q => Math.abs(q[2])))
    expect(flat).toBeCloseTo(0.3125, 6)
    // Taking §8 step 4's 1:1 fall — the CONSERVATIVE reading of a chamfer PB-063
    // measured as two bevel quads at 56.31 degrees, whose real surface bows
    // outward of the straight line — the tip stands over a surface that has
    // receded by this much, and §3's "nothing floats" makes it the floor.
    const needed = (tip - flat) / thickness
    expect(tip - flat).toBeCloseTo(0.144149, 6)
    expect(needed).toBeCloseTo(0.471328, 5)
    // The donor's own burial is NOT enough — the one place on this animal where a
    // donor transfer had to be overruled, and it is overruled by a measurement.
    expect(part.attachment!.sunkFractionMean).toBeLessThan(needed)
    expect(feature('wing').sink).toBeGreaterThan(needed)
    // Snapped UP to the pack's own 1/16 grid, which is `ridgeSpan`'s discipline.
    expect(feature('wing').sink! * 16).toBe(8)
    // Buried over §3's own 0.125 floor for an embedded part, and standing proud
    // of the flank by the same amount, because half of it is buried.
    expect(feature('wing').sink! * thickness).toBeCloseTo(0.152918, 6)
    expect(feature('wing').sink! * thickness).toBeGreaterThan(0.125)
  })

  it('has all four corners of its inner face INSIDE the hull, measured', () => {
    // §3, nothing floats — checked against the shell's own face planes rather
    // than against the arithmetic that placed it. The margin is bigger than the
    // 1:1 solve above predicts, which is PB-063's chamfer bowing outward.
    const g = build()
    const b = boxOf(g, 'wing-r')
    for (const y of [b.min.y, b.max.y]) {
      for (const z of [b.min.z, b.max.z]) {
        const d = insideHull([b.min.x, y, z])
        expect(d, `the wing's inner face is outside the hull at y=${y}, z=${z}`)
          .toBeGreaterThan(0)
        expect(d).toBeCloseTo(0.0473, 3)
      }
    }
    // And the outer face is outside it, so the wing is a wing and not a bulge.
    expect(insideHull([b.max.x, 0.80625, 0])).toBeLessThan(0)
    expect(b.max.x).toBeCloseTo(0.777918, 4)
  })

  it('carries the wing bar on the wing\'s OWN outer face, solved and not typed', () => {
    const bar = feature('wing-bar')
    // `plate-10` attaches `x +1` and is zero-thickness, so it needs no spin at
    // all to lie flat on a flank-facing surface.
    expect(bar.spin).toBeUndefined()
    expect(bar.sink).toBe(0)
    expect(partById('plate-10')!.attachment!.axis).toBe('x')
    const g = build()
    const wing = boxOf(g, 'wing-r'), b = boxOf(g, 'wing-bar-r')
    // The builder solved the join off the wing's own BUILT vertices, and gave it
    // the 0.010 of daylight the pack gives every flat card (`CARD_STANDOFF`).
    expect(b.min.x).toBeCloseTo(b.max.x, 9)             // still flat
    expect(b.min.x - wing.max.x).toBeCloseTo(0.01, 6)
    // On the wing rather than beside it, in both other axes.
    expect(b.min.y).toBeGreaterThan(wing.min.y)
    expect(b.max.y).toBeLessThan(wing.max.y)
    expect(b.min.z).toBeGreaterThan(wing.min.z)
    expect(b.max.z).toBeLessThan(wing.max.z)
  })
})

describe('animal-budgie: the tail is the longest in the bank, pointing straight back', () => {
  it('is the longest tail there is, and the second thinnest', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails.length).toBeGreaterThan(5)
    expect(Math.max(...tails.map(p => p.shape.longest)))
      .toBeCloseTo(partById('wedge-15')!.shape.longest, 9)
    expect(partById('wedge-15')!.shape.longest).toBeCloseTo(1.0824, 4)
    // Thin as well as long, which is the other half of "slim, longest tail":
    // 0.280 across against the parrot's own fan at 0.6259 and the beaver's
    // paddle at 0.726. Only the cat's and the tiger's whips are thinner.
    const thin = (id: string): number => Math.min(...partById(id)!.size)
    expect(thin('wedge-15')).toBeCloseTo(0.28, 6)
    expect(thin('box-38')).toBeGreaterThan(0.6)
    expect(tails.filter(p => thin(p.id) < thin('wedge-15'))).toHaveLength(2)
    expect(feature('tail').part).toBe('wedge-15')
  })

  it('turns the shape\'s long axis onto -z while the facing still lands on the rear', () => {
    const tail = feature('tail')
    expect(tail.spin).toEqual([{ axis: 'x', deg: -90 }])
    // `axis: 'y', dir: 1` is the facing that THIS spin turns into `z -1`, so the
    // sink still measures along the direction the tail actually runs. The same
    // override `animal-tortoise.ts` and `animal-slow-worm.ts` use.
    expect(tail.axis).toBe('y')
    expect(tail.dir).toBe(1)
    const g = build()
    const b = boxOf(g, 'tail')
    // Long fore-and-aft, and it runs BACKWARD rather than up: the squirrel's
    // chamfer idiom is the other posture and it is not a budgie's.
    expect(b.max.z - b.min.z).toBeCloseTo(partById('wedge-15')!.shape.longest, 3)
    expect(b.min.z).toBeLessThan(-1.3)
    expect(b.max.y).toBeLessThan(boxOf(g, 'hull').max.y)
  })

  it('joins at the HULL\'S own centre — the only height its root fits', () => {
    const hull = partById('box-03')!
    const tail = feature('tail')
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, hull.offset[1], -hull.size[2]! / 2])
    }
    // Spun, the root section is the shape's own z-extent, 0.555215 tall, and the
    // flat rear face reaches 0.3125 either side of the hull's centre. So the
    // centre may move only 0.0349 before the root hangs off a chamfer that has
    // fallen away — the lion's own recorded 1.204607 is 0.398 out.
    const rootHalf = partById('wedge-15')!.size[2]! / 2
    const flat = Math.max(...points('box-03')
      .filter(q => Math.abs(Math.abs(q[2]) - hull.size[2]! / 2) < 1e-6)
      .map(q => Math.abs(q[1])))
    expect(flat).toBeCloseTo(0.3125, 6)
    expect(flat - rootHalf).toBeCloseTo(0.034892, 5)
    expect(Math.abs(partById('wedge-15')!.offset[1]! - hull.offset[1]!))
      .toBeGreaterThan(flat - rootHalf)
    const g = build()
    const b = boxOf(g, 'tail'), h = boxOf(g, 'hull')
    expect(b.min.y).toBeGreaterThan(h.min.y + 0.3125)
    expect(b.max.y).toBeLessThan(h.max.y - 0.3125)
  })

  it('puts the LION\'S TUFT at the tip, and the spin is what takes it there', () => {
    // Band 5 is the top of the lion's tail — its 40 triangles average y +0.4103
    // against band 15's -0.0493 — and `{ axis: 'x', deg: -90 }` maps +y to -z, so
    // those triangles end up at the rearmost quarter. A blue tail flash from
    // Kenney's own cut and no geometry at all.
    expect(bandMean('wedge-15', 5, 1)).toBeGreaterThan(bandMean('wedge-15', 15, 1))
    expect(bandMean('wedge-15', 5, 1)).toBeCloseTo(0.4103, 3)
    expect(feature('tail').paint).toEqual({ base: 'bar', byBand: { 5: 'cere' } })
  })

  it('is sunk past its own donor\'s burial, and the reason is the KEEP-OUT', () => {
    // The one number on this animal reached for because of `pets.ts:652` rather
    // than because of the animal. It is still the pack's own: `wedge-03`, the
    // beaver's, is the deepest burial of the bank's seven tails.
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(Math.max(...tails.map(p => p.attachment!.sunkFractionMean)))
      .toBeCloseTo(partById('wedge-03')!.attachment!.sunkFractionMean, 9)
    expect(feature('tail').sink).toBeCloseTo(0.2943, 6)
    expect(feature('tail').sink).toBeGreaterThan(partById('wedge-15')!.attachment!.sunkFractionMean)
    // What it buys, measured: depth is what binds on this bird, exactly as
    // `home-pets.ts:150-155` predicted, and it stays inside the fox's 1.15.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(s.z).toBeGreaterThan(s.x)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(1.0986, 3)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})

describe('animal-budgie: the face is a parrot\'s, and two things could not go on it', () => {
  it('recovers the PARROT\'S OWN BEAK onto the bank\'s recorded offset', () => {
    const beak = partById('cone-06')!
    // Spec §5 called a hooked beak one of four shapes the pack did not have. It
    // has one, nothing had spent it, and a budgie is a parrot.
    expect(beak.provenance.map(q => q.species)).toEqual(['parrot'])
    expect(beak.shape.taper).toBe(0)
    // Nothing is said about the placement, so it is a pure donor transfer — and
    // exact rather than inferred, because the donor wears it on THIS shell.
    expect(partById('box-03')!.provenance.map(q => q.species)).toContain('parrot')
    expect(feature('snout').sink).toBeCloseTo(beak.attachment!.sunkFractionMean, 9)
    expect(feature('snout').placement).toEqual({
      kind: 'single', at: [0, beak.offset[1], HULL_FRONT_Z_USUAL],
    })
    const g = build()
    // Solved from the join, then checked against a number the solve never used.
    expect(g.getObjectByName('snout')!.position.z).toBeCloseTo(beak.offset[2]!, 4)
    expect(g.getObjectByName('snout')!.position.y).toBeCloseTo(beak.offset[1]!, 4)
  })

  it('paints the UPPER mandible as the cere, and which band that is was measured', () => {
    // Getting this backwards is invisible in a definition, so it is measured off
    // the part: band 15 averages y +0.0409 over its 14 triangles and band 13
    // -0.1221 over the other 14. Blue on band 15 is blue on top of the bill,
    // which is where a cere sits.
    expect(bandMean('cone-06', 15, 1)).toBeGreaterThan(bandMean('cone-06', 13, 1))
    expect(bandMean('cone-06', 15, 1)).toBeCloseTo(0.0409, 3)
    expect(feature('snout').paint).toEqual({ base: 'limb', byBand: { 15: 'cere' } })
  })

  it('cannot wear a separate CERE PAD — the bill already overlaps the eye card', () => {
    /*
     * `blade-02`, the bunny's 0.4017 x 0.2700 x 0.0500 nose plate, is exactly the
     * shape of a cere and there is nowhere to put it. Recorded so the next
     * builder does not helpfully add it back (§2's third establishment).
     */
    const g = build()
    const bill = boxOf(g, 'snout'), eye = boxOf(g, 'eye-r')
    expect(bill.max.y).toBeCloseTo(0.918751, 4)
    // The bill's top is INSIDE the eye card's own height, so there is no band of
    // clear face between them for a pad to sit on without occluding the eye —
    // and brief §5 keeps the eye constant per species.
    expect(bill.max.y).toBeGreaterThan(eye.min.y)
    expect(bill.max.y).toBeLessThan(eye.max.y)
    expect(BUDGIE_ASSEMBLY.features.some(f => f.part === 'blade-02')).toBe(false)
  })

  it('cannot place the THROAT SPOTS, and the window is 0.0236 tall', () => {
    const hull = partById('box-03')!
    const g = build()
    const billBottom = boxOf(g, 'snout').min.y
    // How far down the flat front face reaches before the chamfer starts.
    const flat = Math.max(...points('box-03')
      .filter(q => Math.abs(Math.abs(q[2]) - hull.size[2]! / 2) < 1e-6)
      .map(q => Math.abs(q[1])))
    const faceBottom = hull.offset[1]! - flat
    // Four decimals on the bill, because it is measured off the BUILT float32
    // attribute, which puts the bank's 0.517321 back as 0.517306.
    expect(billBottom).toBeCloseTo(0.5173, 4)
    expect(faceBottom).toBeCloseTo(0.49375, 5)
    // A budgie wears three to six black spots across the throat under the bill.
    // The bank's two nostril dots are exactly the shape and neither fits: the
    // smallest is 0.080 across and the window is smaller than that.
    const dots = ['plate-12', 'plate-16'].map(id => partById(id)!.size[1]!)
    expect(billBottom - faceBottom).toBeCloseTo(0.0236, 4)
    for (const d of dots) expect(d).toBeGreaterThan(billBottom - faceBottom)
    // And hung where they belong — tucked under the bill, on the pack's own card
    // plane — each one's LOWER EDGE would stand this far clear of a face that has
    // already fallen away: 0.0664 for `plate-12` and 0.0996 for `plate-16`.
    const clearance = (d: number): number => {
      const bottom = billBottom - d
      const recession = (hull.offset[1]! - bottom) - flat
      return EYE_CARD_Z - (hull.size[2]! / 2 - recession)
    }
    for (const d of dots) {
      expect(clearance(d), 'a throat spot would sit ON the face after all')
        .toBeGreaterThan(0.06)
    }
    expect(clearance(partById('plate-16')!.size[1]!)).toBeCloseTo(0.0996, 3)
    expect(BUDGIE_ASSEMBLY.features.some(f => f.name.startsWith('spot'))).toBe(false)
    expect(BUDGIE_ASSEMBLY.flag).toMatch(/THROAT\s+SPOTS/i)
  })

  it('solves both CHEEK stations off the eye card and off the flat face', () => {
    const hull = partById('box-03')!
    const dot = partById('plate-16')!.size[0]! / 2
    const g = build()
    const eye = boxOf(g, 'eye-r'), cheek = boxOf(g, 'cheek-r')
    // The patch's top edge touches the eye card's own lower edge, exactly.
    expect(cheek.max.y).toBeCloseTo(eye.min.y, 4)
    // Its outer edge lands on the front face's own flat reach and not one
    // thousandth past it onto the chamfer — which puts it 0.0066 inboard of the
    // eye's own x, as nearly under the eye as this shell allows.
    const flat = Math.max(...points('box-03')
      .filter(q => Math.abs(Math.abs(q[2]) - hull.size[2]! / 2) < 1e-6)
      .map(q => Math.abs(q[0])))
    expect(flat).toBeCloseTo(0.3125, 6)
    expect(cheek.max.x).toBeCloseTo(flat, 4)
    expect(flat - dot).toBeLessThan(partById('plate-08')!.offset[0]!)
    // On the pack's own card plane, the same 0.010 of daylight every eye card
    // gets over this cube's 0.625 face.
    expect(cheek.max.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(cheek.max.z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.01, 6)
  })

  it('takes the pack\'s own BIRD eye — the only round card in the bank', () => {
    const card = partById('plate-08')!
    // 0.400 x 0.400 and `radial`: three of its five donors are the pack's three
    // birds. `animal-nightjar.ts` took the biggest card and `animal-kiwi.ts` the
    // smallest; this is the third distinct answer in three birds.
    expect(card.shape.symmetry).toBe('radial')
    expect(card.size[0]).toBe(card.size[1])
    const donors = card.provenance.map(q => q.species)
    for (const bird of ['chick', 'parrot', 'penguin']) expect(donors).toContain(bird)
    const round = PARTS_BANK.filter(p => p.roles.includes('eye') && p.size[0] === p.size[1])
    expect(round.map(p => p.id).sort()).toEqual(['plate-08', 'plate-09'])
    expect(feature('eye').placement).toEqual({
      kind: 'pair', at: [card.offset[0], card.offset[1], EYE_CARD_Z],
    })
  })
})

describe('animal-budgie: box-21 is a cube wearing the fox\'s EARS, not a taller body', () => {
  it('has a 1.250 cube BODY — every millimetre of its extra height is off the midline', () => {
    const fox = partById('box-21')!
    expect(fox.size[1]).toBeCloseTo(1.505075, 6)
    const pts = points('box-21')
    // Below its own +0.4975 it is the cube: the side faces reach 0.625 and the
    // shell closes on a top ring at 0.3125, exactly as `box-03` does at +0.625.
    const body = pts.filter(q => q[1] <= 0.4975 + 1e-4)
    expect(Math.max(...body.map(q => Math.abs(q[0])))).toBeCloseTo(0.625, 4)
    expect(Math.max(...body.map(q => Math.abs(q[2])))).toBeCloseTo(0.625, 4)
    const top = body.filter(q => Math.abs(q[1] - 0.4975) < 1e-4)
    expect(Math.max(...top.map(q => Math.abs(q[0])))).toBeCloseTo(0.3125, 4)
    // In world terms that body is `box-03`'s own span, to four decimals.
    const cube = partById('box-03')!
    expect(fox.offset[1]! - 0.7525).toBeCloseTo(cube.offset[1]! - cube.size[1]! / 2, 4)
    expect(fox.offset[1]! + 0.4975).toBeCloseTo(cube.offset[1]! + cube.size[1]! / 2, 4)
  })

  it('carries the extra height as TWO LUGS, with nothing at all on the midline', () => {
    const above = points('box-21').filter(q => q[1] > 0.4975 + 1e-4)
    expect(above.length).toBeGreaterThan(20)
    for (const q of above) {
      // Two clusters, forward and to each side. Not a taller body, not a crown:
      // ears. The confirmation the geometry cannot give is that the fox has NO
      // separate ear record anywhere in the bank — they are in the shell, which
      // is why this shape is 184 triangles against the cube's 60.
      expect(Math.abs(q[0]), 'a point on the midline above the body').toBeGreaterThan(0.2)
      expect(Math.abs(q[0])).toBeLessThan(0.46)
      expect(q[2]).toBeGreaterThan(0.2)
    }
    const ears = PARTS_BANK.filter(p => p.provenance.some(
      q => q.species === 'fox' && q.role === 'ear'))
    expect(ears).toHaveLength(0)
    expect(partById('box-21')!.tris).toBe(184)
  })

  it('is refused here, and the HEIGHT axis goes with it', () => {
    // A bird cannot wear ears, so this species is on `box-03` — the parrot's and
    // the chick's own shell — and stands on the pack's own HEIGHT_FLOOR. Nine of
    // the ten hulls are 1.25 tall or less and the tenth is bigger on all three
    // axes, so `home-pets.ts:194`'s "tallest cage bird" is not buildable and
    // these four separate on tail, depth, colour and extras instead.
    expect(BUDGIE_ASSEMBLY.hull.part).toBe('box-03')
    const hulls = PARTS_BANK.filter(p => p.roles.includes('hull'))
    const taller = hulls.filter(p => p.size[1]! > 1.25 + 1e-9).map(p => p.id).sort()
    expect(taller).toEqual(['box-21', 'box-41'])
    expect(partById('box-41')!.size[0]).toBeGreaterThan(1.25)   // bigger, not taller
    expect(BUDGIE_ASSEMBLY.flag).toMatch(/CANNOT BE THE TALLEST/i)
  })
})

describe('animal-budgie: the coat, the barring, and what is not stretched', () => {
  it('paints §4\'s second way UPSIDE DOWN — yellow above, green below', () => {
    // A wild green budgie is yellow above and green below, which is a level
    // boundary and the only marking on this animal the mechanism can say
    // exactly. So the BASE is the yellow and the patch paints the green under
    // it, which is the inverse of every belly line shipped so far.
    expect(BUDGIE_ASSEMBLY.hull.paint.base).toBe('mask')
    expect(BUDGIE_ASSEMBLY.hull.paint.patch).toEqual({ below: 'coat', at: 0.5 })
    // 8/16 is the hull's own equator and the pack's own mammal line (§7), and it
    // lands over the bill's centre and under the eye cards'.
    const hull = partById('box-03')!
    const line = hull.offset[1]! - hull.size[1]! / 2 + 0.5 * hull.size[1]!
    expect(line).toBeCloseTo(hull.offset[1]!, 9)
    expect(line).toBeGreaterThan(partById('cone-06')!.offset[1]!)
    expect(line).toBeLessThan(partById('plate-08')!.offset[1]!)
    // No geometry was added to draw it.
    const mesh = build().getObjectByName('hull') as THREE.Mesh
    expect(mesh.geometry.getIndex()!.count / 3).toBe(hull.tris)
  })

  it('cannot draw the BARRING, and every route is closed by a measurement', () => {
    // `byBand` can only cut where Kenney already cut, and this shell has ONE band.
    expect([...new Set(partById('box-03')!.bands)]).toHaveLength(1)
    // A patch is one level plane: { below, at }, and `at` is a HEIGHT. A budgie's
    // barring is twenty lines across a curved back.
    expect(Object.keys(BUDGIE_ASSEMBLY.hull.paint.patch!).sort()).toEqual(['at', 'below'])
    // And the bank has no card that could carry a bar — `animal-badger.ts`
    // measured this for its own stripe and it is re-measured here because it is
    // the reason this species' wings are one flat tone.
    for (const p of PARTS_BANK.filter(q => q.roles.includes('card'))) {
      const d = [...p.size].sort((a, b) => b - a)
      expect(d[0], `${p.id} is longer than any marking card was`).toBeLessThan(0.44)
      expect(d[0]! / d[1]!, `${p.id} is thin enough to be a bar`).toBeLessThan(2.5)
    }
    expect(BUDGIE_ASSEMBLY.flag).toMatch(/BARRING CANNOT BE DRAWN/i)
  })

  it('wears JT-044\'s two-tone foot on the pack\'s own leg row, at its own x', () => {
    const leg = feature('leg-front')
    expect(leg.part).toBe(LEG_ROW.part)
    expect(leg.sink).toBe(LEG_ROW.sink)
    if (leg.placement.kind === 'pair') {
      // `box-01`'s own recorded offset — the narrowest station the pack
      // demonstrates, and the right one for the slimmest of four birds, where
      // `animal-kiwi.ts` stands at 0.4375 for the opposite reason.
      expect(leg.placement.at[0]).toBe(partById('box-01')!.offset[0])
      expect(leg.placement.at[1]).toBe(LEG_ROW.y)
      expect(leg.placement.at[2]).toBe(0)   // a biped stands under its own mass
    }
    // The patch is on the BASE slot only and is 4/16 on the pack's own grid, so
    // the bottom quarter of each leg is the darker toe under the pale shank.
    expect(leg.paint).toEqual({ base: 'limb', patch: { below: 'foot', at: 0.25 } })
    expect(leg.paint.byBand).toBeUndefined()
    expect(leg.paint.patch!.at * 16).toBe(4)
    expect(BUDGIE_ASSEMBLY.features.filter(f => f.part === LEG_ROW.part)).toHaveLength(1)
  })

  it('carries no stretch anywhere — not one part, and no hull scale', () => {
    // Joe flagged a non-uniform stretch on three animals on 2 August. This one
    // carries none of either kind, and the reason is worth pinning: every shape
    // it wears was already the right size, including the wing.
    for (const f of BUDGIE_ASSEMBLY.features) {
      expect(f.stretch, `"${f.name}" is stretched`).toBeUndefined()
    }
    expect(BUDGIE_ASSEMBLY.hull.stretch).toBeUndefined()
    for (const m of build().children) {
      expect((m as THREE.Mesh).userData['stretch'] ?? [1, 1, 1]).toEqual([1, 1, 1])
    }
  })

  it('is the first species to declare a MOTION, and it names a part it has', () => {
    // Joe, 29 July: "the wings are currently animated. can that be done
    // deterministically as well, or specified in the editor." `motion.ts` is the
    // answer and nothing had used it; a bird with a wing is the species that
    // should. The table's own measured defaults — the bee's and the parrot's own
    // wingbeat off `pets.ts:74` — with nothing tuned.
    const motion = BUDGIE_ASSEMBLY.motion!
    expect(motion).toHaveLength(1)
    expect(motion[0]!.kind).toBe('flap')
    expect(motion[0]!.parts).toEqual(['wing'])
    expect(motion[0]!.opposed).toBe(true)
    expect(motion[0]!.amplitude).toBe(0.5)
    // And the name resolves to meshes that exist, which is the check
    // `resolveMotion` exists for — its symptom otherwise is nothing moving.
    const g = build()
    for (const n of ['wing-r', 'wing-l']) expect(g.getObjectByName(n)).toBeDefined()
  })
})
