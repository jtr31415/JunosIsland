/**
 * The crocodile. Africa's fourteenth, and the first of that collection's three
 * declared absences to be filled.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, the standard-size hull, lineage back to the
 * bank, the absolute eye, nothing at a node, rule 9's budgets, the shared
 * texture, the measured pupil, the leg row, height checked first. This file is
 * what only a crocodile can say, and for this animal that is four things:
 *
 *   1. **THE LEGS ARE ON THE EXACT EDGE OF THE HULL'S FOOTPRINT.** The pack's own
 *      axiom — checked over 23 of 23 animals — is that a leg sits inside the
 *      body's outline, and 0.4375 puts each leg's outer face on 0.625, which is
 *      the hull's own side and not one thousandth past it. This is that axiom AT
 *      ITS LIMIT, so it is asserted from the built meshes AND the counterfactual
 *      is built: one notch wider and the animal is standing outside itself.
 *   2. **THE JAW IS ON FLAT GEOMETRY.** `box-18`'s own recorded height would hang
 *      it off the chamfer, where it floats — §3. So 0.6875 is a solved bound and
 *      the way to prove that is to build the donor's own number and watch it drop
 *      off the face.
 *   3. **ONE ROW OF SCUTES, ON THE TOP ONLY**, which no other assembled species
 *      does. The chamfer idiom exists to make a cubic back read ROUND; a
 *      crocodile is the one animal here that must not. And it is mounted on
 *      `wedge-06` for its PROUD HEIGHT, which is the trap that cost the corn
 *      snake a rebuild: a donor's burial only transfers to a radial mount if its
 *      attachment axis is `y +1`.
 *   4. **IT HAS NO TEETH, AND THAT IS AN ASSERTION.** The bank carries eight
 *      `tooth`-role shapes and two of them would have mounted on this jaw for
 *      free. Brief §19 is "bright, never scary". Nobody gets to add them without
 *      deleting a test that says why they are not there.
 */
/* The species module FIRST, and deliberately: it registers itself as it defines
 * its build (see `assembled/register.ts`), so importing it here is what puts it
 * on the register before `parts/index.ts` snapshots `ASSEMBLED_BUILDS` below. */
import { CROCODILE_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-crocodile'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  ASSEMBLED_BUILDS, buildAssembled, buildAssembly, creatureSpec,
} from '../../src/island/species/parts'
import { CREATURE_DEFS, type CreatureDef, type PartDef }
  from '../../src/island/species/parts/creature'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-crocodile',
  parts: ['box-01', 'box-03', 'box-18', 'plate-01', 'wedge-03', 'wedge-06'],
  // The bare cube's 1.43125 floor, plus the 0.1545 the top row of scutes shows.
  height: 1.5857,
  verts: 573,
  tris: 772,
  // The beaver's paddle is the biggest thing after the hull and it is under a
  // fifth of it. Stronger than the generic 3, because nothing on this animal was
  // stretched to make it look bigger than it is.
  massRatio: 5,
  // NOTHING is spun. Said out loud, because rule 4's "no node carries a rotation"
  // passes vacuously otherwise — and because a `rows: ['top']` ridge is the one
  // ridge shape that carries no turn onto a face, which is the point of §5 below.
  spinsAtLeast: 0,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-crocodile')
  g.updateMatrixWorld(true)
  return g
}
const meshes = (g: THREE.Group): THREE.Mesh[] => {
  const out: THREE.Mesh[] = []
  g.traverse(o => { if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh) })
  return out
}
const named = (g: THREE.Group, prefix: string): THREE.Mesh[] =>
  meshes(g).filter(m => m.name === prefix || m.name.startsWith(`${prefix}-`))
const box = (o: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(o)

/**
 * The animal as it was AUTHORED, with one number changed.
 *
 * Every "and a wider setting would break it" below is built rather than argued:
 * `creatureSpec` registers nothing, so a counterfactual can be assembled and
 * measured without putting an invented species on the bench. The definition is
 * the shipped one out of `CREATURE_DEFS` — not a retyped copy — so a change in
 * `src/` moves the counterfactual with it.
 */
const DEF = CREATURE_DEFS.get('animal-crocodile') as CreatureDef
const variant = (over: Partial<CreatureDef>): THREE.Group => {
  const g = buildAssembly(creatureSpec('animal-crocodile', { ...DEF, ...over }))
  g.updateMatrixWorld(true)
  return g
}

describe('animal-crocodile: the sprawl, the jaw and the scutes', () => {
  it('stands its legs on the EXACT edge of the hull footprint and not past it', () => {
    /*
     * THE MOST VALUABLE TEST IN THIS FILE. The pack's own axiom — every leg sits
     * inside the body's outline, true of 23 of 23 animals — held at its exact
     * limit. `box-01` is 0.375 across, so x = 0.4375 lands each leg's outer face
     * on 0.625, which is `box-03`'s own side. A crocodile sprawls and this is as
     * far as a kit whose leg row is a constant can honestly go; one notch further
     * and the animal is standing outside itself.
     */
    const g = build()
    const hull = box(g.getObjectByName('hull') as THREE.Mesh)
    const legs = named(g, 'leg')
    expect(legs).toHaveLength(4)
    for (const l of legs) {
      const b = box(l)
      expect(b.min.x, `${l.name} hangs off the near side`).toBeGreaterThanOrEqual(hull.min.x - 1e-9)
      expect(b.max.x, `${l.name} hangs off the far side`).toBeLessThanOrEqual(hull.max.x + 1e-9)
      expect(b.min.z, `${l.name} hangs off the back`).toBeGreaterThanOrEqual(hull.min.z - 1e-9)
      expect(b.max.z, `${l.name} hangs off the front`).toBeLessThanOrEqual(hull.max.z + 1e-9)
      // AT THE LIMIT, not merely inside it: the outer face IS the hull's side.
      expect(Math.max(Math.abs(b.min.x), Math.abs(b.max.x))).toBeCloseTo(hull.max.x, 6)
    }

    // And the counterfactual, built rather than argued. The next notch up the
    // pack's 1/16 grid puts 0.0625 of every leg outside the body.
    const wide = variant({ legs: { ...(DEF.legs as { x: number; z: number }), x: 0.5 } })
    const wider = box(named(wide, 'leg')[0] as THREE.Mesh)
    expect(wider.max.x, 'x = 0.5 must break the axiom, or this test proves nothing')
      .toBeGreaterThan(hull.max.x)
    expect(wider.max.x).toBeCloseTo(0.6875, 6)
  })

  it('hangs the whole jaw on the hull\'s FLAT front face, where the donor\'s own height would float', () => {
    /*
     * §3, "nothing floats", as a solved bound rather than a taste. `box-03` cuts
     * every edge, so its front face is only flat across the middle 0.625 of
     * itself; below that the chamfer starts falling away and a part joined at the
     * nominal plane leaves the hull. The flat band is MEASURED off the hull's own
     * built vertices here rather than quoted, so a different shell would move it.
     */
    const g = build()
    const hullMesh = g.getObjectByName('hull') as THREE.Mesh
    const hull = box(hullMesh)
    const centre = hullMesh.getWorldPosition(new THREE.Vector3())
    const pos = hullMesh.geometry.getAttribute('position')
    let front = -Infinity
    for (let i = 0; i < pos.count; i++) front = Math.max(front, pos.getZ(i))
    let flatLo = Infinity, flatHi = -Infinity
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getZ(i) - front) > 1e-6) continue
      flatLo = Math.min(flatLo, pos.getY(i) + centre.y)
      flatHi = Math.max(flatHi, pos.getY(i) + centre.y)
    }
    expect(front).toBeCloseTo(hull.max.z, 6)
    // The hull centre plus and minus its own topFlatZ of 0.3125. At 4dp, because
    // the bank stores positions at 4dp and float32 puts 0.3125 back 3e-5 short.
    expect(flatLo).toBeCloseTo(0.49375, 4)
    expect(flatHi).toBeCloseTo(1.11875, 4)

    const jaw = box(named(g, 'snout')[0] as THREE.Mesh)
    expect(jaw.min.y, 'the jaw hangs off the bottom of the flat face').toBeGreaterThanOrEqual(flatLo)
    expect(jaw.max.y, 'the jaw rides up over the top of the flat face').toBeLessThanOrEqual(flatHi)
    expect(jaw.min.y).toBeCloseTo(0.53125, 4)
    expect(jaw.max.y).toBeCloseTo(0.84375, 4)

    // THE DONOR'S OWN NUMBER, built. `box-18` is the elephant's trunk and it was
    // recorded at 0.482248 — the height of an elephant's face, not of a
    // crocodile's, and 0.16 of it would be off the face and in mid air.
    const own = partById('box-18')!.offset[1]!
    expect(own).toBeCloseTo(0.482248, 6)
    const low = variant({ snout: { ...(DEF.snout as PartDef), at: [0, own, 0.625] } })
    const dropped = box(named(low, 'snout')[0] as THREE.Mesh)
    expect(dropped.min.y, 'the donor height must fall off the flat face, or this proves nothing')
      .toBeLessThan(flatLo)
    expect(dropped.min.y).toBeCloseTo(0.326, 3)
  })

  it('is a crocodile because the jaw is TWICE AS WIDE as it is deep', () => {
    /*
     * The ratio is the animal. `box-18` at its own 0.345 x 0.623004 is a tall
     * narrow stub — a muzzle, and on this hull it would read as a mammal. Rule 1
     * sanctions the stretch and §3 measured the pack's own snouts at 2.97x and
     * 2.90x, so 1.81x and 0.50x are well inside what has already been shown to
     * hold. 10/16 by 5/16 is that ratio on the pack's own authoring grid.
     */
    const jaw = box(named(build(), 'snout')[0] as THREE.Mesh)
    const w = jaw.max.x - jaw.min.x
    const h = jaw.max.y - jaw.min.y
    expect(w).toBeCloseTo(0.625, 5)
    expect(h).toBeCloseTo(0.3125, 5)
    // 4dp, not 5: the bank stores its positions at 4dp and float32 puts 0.3125
    // back with a thousandth of a thousandth on it. `snap` in assembly-assert.ts
    // works to the same thousandth for the same reason.
    expect(w / h, 'the jaw is no longer 2:1 in plan').toBeCloseTo(2, 4)

    // And the donor's own ratio, so the claim that this is a CHANGE is checked
    // rather than asserted: 0.55:1 is a muzzle, standing on its end.
    const own = partById('box-18')!
    expect(own.size[0]! / own.size[1]!).toBeCloseTo(0.5537, 3)
  })

  it('does NOT stretch the jaw on z — that reach is what the keep-out is spent on', () => {
    // 0.425211 is the longest forward reach in the bank and it is the donor's own
    // recorded number. Stretching it would buy a longer snout with keep-out the
    // island charges for at `pets.ts:652`, so the depth is left exactly alone.
    const bank = partById('box-18')!
    const jaw = box(named(build(), 'snout')[0] as THREE.Mesh)
    expect(jaw.max.z - jaw.min.z).toBeCloseTo(bank.size[2]!, 4)
    expect(bank.size[2]!).toBeCloseTo(0.425211, 6)
    // Said on the spec too, because a stretch of exactly 1 is easy to add and
    // hard to see: the third component is the one that must stay untouched.
    const f = CROCODILE_ASSEMBLY.features.find(x => x.name === 'snout')
    expect(f?.stretch?.[2]).toBe(1)
    // Flush on the front face, at a recorded burial of ZERO, so every part of it
    // is outside the body — which is what makes the reach worth spending.
    expect(f?.sink).toBe(0)
    expect(jaw.min.z).toBeCloseTo(0.625, 5)
  })

  it('wears ONE ROW OF SCUTES, ON THE TOP ONLY — the one animal here that must not read round', () => {
    /*
     * The chamfer idiom's whole purpose is to make a cubic body read ROUND, and a
     * crocodile is flat-backed with its scutes in a single line down the spine.
     * A top row is also the only one that is not mirrored, so five stations are
     * five parts rather than fifteen.
     */
    const g = build()
    const scutes = named(g, 'scute')
    expect(scutes).toHaveLength(5)
    const hull = box(g.getObjectByName('hull') as THREE.Mesh)
    const stations: number[] = []
    for (const s of scutes) {
      expect(s.name).toMatch(/^scute-top-\d$/)
      const b = box(s)
      // ON THE SPINE. Every one of them is centred on x = 0; there is no left
      // scute and no right scute, which is what "not mirrored" means on screen.
      expect((b.min.x + b.max.x) / 2, `${s.name} is off the midline`).toBeCloseTo(0, 9)
      expect(b.min.y, `${s.name} does not reach into the back`).toBeLessThan(hull.max.y)
      stations.push((b.min.z + b.max.z) / 2)
    }
    // Span 0.5, five copies: the pack's own 1/16 grid, and inside the 0.5203 §3
    // allows this shape before its outer station leaves the hull.
    expect(stations.map(z => Number(z.toFixed(4))).sort((a, b) => a - b))
      .toEqual([-0.5, -0.25, 0, 0.25, 0.5])

    // No other row exists on this animal, on the spec as well as in the meshes.
    const rows = CROCODILE_ASSEMBLY.features.filter(f => /-(top|chamfer|side)$/.test(f.name))
    expect(rows.map(f => f.name)).toEqual(['scute-top'])

    /*
     * AND NO OTHER ASSEMBLED SPECIES DOES THIS. The hedgehog, the slow worm and
     * the corn snake run all three rows; the toad and the tortoise run top plus
     * chamfer; the goldfish runs chamfer alone. If a second top-only species ever
     * appears, the sentence in `animal-crocodile.ts` that says this is unusual
     * has stopped being true and should be rewritten rather than left standing.
     */
    const topOnly = Object.entries(ASSEMBLED_BUILDS)
      .filter(([, s]) => {
        const suffixes = s!.features
          .map(f => /-(top|chamfer|side)$/.exec(f.name)?.[1])
          .filter((x): x is string => x !== undefined)
        return suffixes.length > 0 && suffixes.every(x => x === 'top')
      })
      .map(([id]) => id)
    expect(topOnly).toEqual(['animal-crocodile'])
  })

  it('could not afford a second row anyway — the top row is what keeps it inside rule 9', () => {
    // The affordability half of "one row", built rather than claimed. `wedge-06`
    // is 62 triangles and a chamfer row is MIRRORED, so it is ten more copies and
    // not five: 772 becomes 1392 against the pack's measured ceiling of 951. The
    // builder refuses it at definition time, which is module load.
    expect(() => creatureSpec('animal-crocodile', {
      ...DEF,
      ridge: { ...DEF.ridge!, rows: ['top', 'chamfer'] },
    })).toThrow(/RULE 9/)
  })

  it('mounts the scutes on a y +1 shape, so the donor burial transfers and 0.1545 stands PROUD', () => {
    /*
     * THE TRAP, kept because it already cost one species a rebuild. A ridge mounts
     * RADIALLY, so a donor's measured burial only means anything if that burial
     * was measured into the same face — an attachment of `y +1`. `box-27` was
     * picked for the corn snake on a 0.933 burial, predicted 0.019 proud and
     * delivered 0.141, because it is a FORWARD-facing koala ear.
     *
     * `wedge-06` is the cat's ear, it is `y +1`, and the pack wears it at 0.573575
     * — the SHALLOWEST burial of any `y +1` wedge, which is exactly why it is
     * here. A crocodile's scutes are the tallest thing on a crocodile.
     */
    const scute = partById('wedge-06')!
    expect(scute.attachment?.axis).toBe('y')
    expect(scute.attachment?.dir).toBe(1)
    const proud = scute.size[1]! * (1 - scute.attachment!.sunkFractionMean)
    expect(proud).toBeCloseTo(0.1545, 4)

    // Measured on the built model, not only in the bank: the scutes are what
    // takes this animal above the bare cube's 1.43125.
    const g = build()
    const hull = box(g.getObjectByName('hull') as THREE.Mesh)
    const whole = box(g)
    expect(whole.max.y - hull.max.y).toBeCloseTo(proud, 3)

    // THE TALLEST KEELED PLATE THIS BANK CAN STAND ON A BACK. Measured over every
    // `y +1` wedge rather than quoted, so a regenerated bank moves the claim.
    const rivals = PARTS_BANK
      .filter(p => p.id.startsWith('wedge-')
        && p.attachment?.axis === 'y' && p.attachment.dir === 1)
      .map(p => ({ id: p.id, proud: p.size[1]! * (1 - p.attachment!.sunkFractionMean) }))
      .sort((a, b) => b.proud - a.proud)
    expect(rivals[0]!.id).toBe('wedge-06')
    // The two it beats, by name: the corn snake's saddle and the slow worm's
    // annulation. Neither is a wedge in the slow worm's case, so it is read off
    // its own record rather than off the sort above.
    expect(partById('wedge-04')!.size[1]!
      * (1 - partById('wedge-04')!.attachment!.sunkFractionMean)).toBeCloseTo(0.119, 3)
    expect(partById('box-08')!.size[1]!
      * (1 - partById('box-08')!.attachment!.sunkFractionMean)).toBeCloseTo(0.081, 3)

    // And the shape that was rejected for the corn snake really is the wrong
    // axis, so the story above stays checkable if the bank is ever regenerated.
    expect(partById('box-27')?.attachment?.axis).toBe('z')
  })

  it('transfers the beaver\'s paddle WHOLE — its own facing, its own burial, only the height moved', () => {
    /*
     * `wedge-03` is the only tail in the bank that is flat and strongly tapering
     * rather than round and whippy, which is what a crocodile's laterally
     * flattened tail is, and nothing else in the pack had spent it. A pure donor
     * transfer: no spin, no stretch, no overridden axis, the donor's own 0.2943.
     * The ONE thing that moved is the height — a beaver's paddle roots high and
     * drops, and a crocodile's tail continues the line of the back.
     */
    const bank = partById('wedge-03')!
    const f = CROCODILE_ASSEMBLY.features.find(x => x.name === 'tail')
    expect(f?.part).toBe('wedge-03')
    expect(f?.spin).toBeUndefined()
    expect(f?.stretch).toBeUndefined()
    expect(f?.axis).toBeUndefined()
    expect(f?.dir).toBeUndefined()
    expect(f?.sink).toBeCloseTo(bank.attachment!.sunkFractionMean, 9)
    expect(bank.attachment!.sunkFractionMean).toBeCloseTo(0.2943, 6)
    expect(bank.attachment!.dir).toBe(-1)
    expect(bank.attachment!.axis).toBe('z')

    const g = build()
    const tail = box(named(g, 'tail')[0] as THREE.Mesh)
    // Unstretched on all three axes, which is what "whole" means. At 3dp, the
    // same thousandth `assembly-assert.ts` compares a hull's own size at: the
    // bank rounds `positions` to 4dp and `size` to 6dp, so a shape recorded at
    // 0.588533 builds from vertices that measure 0.5886.
    expect(tail.max.x - tail.min.x).toBeCloseTo(bank.size[0]!, 3)
    expect(tail.max.y - tail.min.y).toBeCloseTo(bank.size[1]!, 3)
    expect(tail.max.z - tail.min.z).toBeCloseTo(bank.size[2]!, 3)

    // The burial, measured: how far the paddle reaches back INTO the hull is the
    // donor's own recorded 0.173205 units, which is the 0.2943 fraction spent.
    const hull = box(g.getObjectByName('hull') as THREE.Mesh)
    expect(tail.max.z - hull.min.z).toBeCloseTo(bank.attachment!.sunkUnitsMean, 3)

    // And the one number that is NOT the donor's: the height.
    expect((tail.min.y + tail.max.y) / 2).toBeCloseTo(0.80625, 4)
    expect(bank.offset[1]!).toBeCloseTo(1.050919, 6)
    expect((tail.min.y + tail.max.y) / 2).not.toBeCloseTo(bank.offset[1]!, 2)
  })

  it('has NO TEETH, because brief 19 is "bright, never scary" — not because nobody noticed', () => {
    /*
     * DELETING THIS TEST IS THE ONLY WAY TO PUT TEETH ON THIS ANIMAL, and that is
     * the design. The bank carries eight `tooth`-role shapes; `wedge-04` and
     * `wedge-05` are two of them and they would have mounted on the jaw's own
     * anchor without a chosen number anywhere — free, and wrong. A crocodile is
     * precisely the animal where "bright, never scary" bites, and the same
     * guardrail already bans predation framing in the species facts. A child
     * meeting this animal should want to keep it.
     */
    const teeth = new Set(PARTS_BANK.filter(p => p.roles.includes('tooth')).map(p => p.id))
    // Not a vacuous check: the two obvious candidates really are in there.
    expect(teeth.has('wedge-04')).toBe(true)
    expect(teeth.has('wedge-05')).toBe(true)

    for (const f of CROCODILE_ASSEMBLY.features) {
      expect(teeth.has(f.part), `feature "${f.name}" wears the tooth shape ${f.part}`).toBe(false)
    }
    for (const m of meshes(build())) {
      expect(teeth.has(m.userData['part'] as string), `${m.name} is a tooth`).toBe(false)
    }
    // And the reason is where Joe reads it, so the absence reads as a decision.
    expect(CROCODILE_ASSEMBLY.flag).toMatch(/NO TEETH/)
  })

  it('spends its keep-out on the jaw and the tail together, and still comes in under the fox', () => {
    /*
     * `pets.ts:652` charges the obstacle keep-out at max(width, depth) / 2, so a
     * long low animal pays for its length in trees it cannot walk between. This
     * one is 1.045 against the fox's measured 1.15 — and it is the DEPTH that
     * sets it, which is why neither the jaw nor the tail was stretched on z.
     */
    const g = build()
    const whole = box(g)
    const w = whole.max.x - whole.min.x
    const d = whole.max.z - whole.min.z
    expect(Math.max(w, d) / 2, 'the crocodile now needs more room than the fox')
      .toBeLessThan(1.15)
    expect(Math.max(w, d) / 2).toBeCloseTo(1.045, 3)
    // Depth, not width: the width is still the hull's own 1.250.
    expect(d).toBeGreaterThan(w)
    expect(w).toBeCloseTo(1.25, 4)

    // And it is those two features that reach the ends, nothing else.
    expect(whole.max.z).toBeCloseTo(box(named(g, 'snout')[0] as THREE.Mesh).max.z, 6)
    expect(whole.min.z).toBeCloseTo(box(named(g, 'tail')[0] as THREE.Mesh).min.z, 6)
  })

  it('carries the unreviewed-palette flag, because nobody has signed these colours off', () => {
    // africa.ts never held a record for this species, so it never held colours
    // for it either — the four here are the first ever proposed. The flag is
    // where Joe reads that.
    expect(CROCODILE_ASSEMBLY.flag).toBeTruthy()
    expect(CROCODILE_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
  })
})
