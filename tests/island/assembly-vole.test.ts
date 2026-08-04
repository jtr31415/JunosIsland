/**
 * The vole. Garden's fourth small brown ground creature, and the earless one.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a vole can say.
 *
 * Which is three claims. **It has no ears and that is the animal.** **Its tail is
 * the bank's only stub, and it is only a tail once it has been turned round.**
 * And **rule 9's FLOOR is what shaped its face** — the one species so far that
 * ran into the bottom of the budget rather than the top, so the reason is pinned
 * here rather than left in a comment.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, VOLE_ASSEMBLY, HULL_FRONT_Z_USUAL, MODEL_VERTS_MIN,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-vole',
  parts: [
    'blade-02', 'box-01', 'box-03', 'box-08', 'box-09', 'box-18', 'plate-01',
    'wedge-01', 'wedge-04',
  ],
  height: 1.5504,
  verts: 430,
  tris: 591,
  // Nothing on this animal is a tenth of the hull. The stub tail is the largest
  // thing after it and the hull is twenty-one times its volume — which is what
  // "no ears, no whip, no muzzle" costs a silhouette, and is the number the
  // separation has to be earned against.
  massRatio: 20,
  // One: the tail. Rule 4's "no node carries a rotation" would pass vacuously
  // otherwise, and on this animal the rotation is the whole point.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-vole')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const world = (g: THREE.Group, name: string): THREE.Vector3 =>
  g.getObjectByName(name)!.getWorldPosition(new THREE.Vector3())

/* The cube's flat faces are only 0.625 square — `box-03` cuts every edge AND
 * every corner, so its 32 welded points are the permutations of
 * (+/-0.625, +/-0.3125, +/-0.3125) and (+/-0.5, +/-0.5, +/-0.5). Off the hull
 * centre's y = 0.80625 that puts the flat rear face between these two. §8 step 1
 * says assuming it once put a whole row 0.09 out. */
const FLAT_LO = 0.80625 - 0.3125
const FLAT_HI = 0.80625 + 0.3125

/**
 * A donor recovery, checked at the BANK's own resolution.
 *
 * `bank.generated.ts` stores positions rounded to four decimals and three.js
 * hands them to the GPU as float32, so a recovered centre agrees with a recorded
 * `offset` to about 1e-5 and no closer — `box-08`'s half-height is written 0.1636
 * against a true 0.1635515, which is 4.9e-5 of the answer on its own. Asserting
 * six decimals here would be asserting the rounding, not the transfer. So the
 * tolerance is the bank's own last digit, once, with its reason.
 */
const BANK_DP = 1e-4
const recovers = (got: number, recorded: number, what: string): void => {
  expect(Math.abs(got - recorded), `${what}: ${got} did not recover ${recorded}`)
    .toBeLessThan(BANK_DP)
}

describe('animal-vole: the tail is the elephant\'s TRUNK, and Kenney\'s name is wrong', () => {
  it('is the only tail shape in the bank that points FORWARD, which is what gives it away', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    expect(tails).toHaveLength(7)
    // Six of the seven are `z -1`: already pointing backwards off a rump, because
    // that is what they are. This one is `z +1` — it comes off a FACE — and the
    // bank's `tail` role is inherited from the elephant's node name, not measured.
    for (const t of tails) {
      if (t.id === 'box-18') continue
      expect(t.attachment!.axis, `${t.id}`).toBe('z')
      expect(t.attachment!.dir, `${t.id}`).toBe(-1)
    }
    const trunk = partById('box-18')!
    expect(trunk.attachment!.axis).toBe('z')
    expect(trunk.attachment!.dir).toBe(1)
    expect(trunk.provenance.map(p => p.species)).toEqual(['elephant'])
  })

  it('is the bank\'s only STUB — shortest by 0.24, and the shallowest behind the hull', () => {
    const tails = PARTS_BANK.filter(p => p.roles.includes('tail'))
    const lengths = tails.map(t => t.shape.longest).sort((a, b) => a - b)
    expect(lengths[0]).toBeCloseTo(0.623004, 6)          // box-18
    expect(lengths[1]).toBeCloseTo(0.862191, 6)          // wedge-03, the beaver's
    // And it is the cheapest one to walk between two trees with: what a tail
    // costs an animal is what it adds along z, and `pets.ts:652` charges keep-out
    // from max(width, depth) / 2.
    const behind = Math.min(...tails.map(t => t.size[2]!))
    expect(behind).toBeCloseTo(partById('box-18')!.size[2]!, 6)
    expect(partById('wedge-07')!.size[2]).toBeCloseTo(0.555215, 6) // the mouse's whip
  })

  it('SPINS 180 degrees and the stub really does point backwards', () => {
    const tail = VOLE_ASSEMBLY.features.find(f => f.name === 'tail')!
    // Rule 4 as amended: baked into the copy's vertices, and it is a turn about
    // y — not a `dir` override, which would flip the facing and leave the TIP
    // against the hull with the base out in the air.
    expect(tail.spin).toEqual([{ axis: 'y', deg: 180 }])
    expect(tail.dir).toBeUndefined()
    expect(tail.axis).toBeUndefined()

    const g = build()
    const hull = boxOf(g, 'hull')
    const t = boxOf(g, 'tail')
    /* Wholly behind the hull's rear plane, and reaching 0.1913 further back.
     *
     * SHRUNK SINCE 84cd17a, AND THE STUB IS NOW SCALED. Joe opened this animal in
     * the workbench editor and pushed it back carrying `stretch: [0.45, 0.45,
     * 0.45]` on the tail. The reach is therefore no longer the shape's own
     * 0.425211 depth — which is what the old 0.425211 here was saying, and it was
     * saying it precisely to show that nothing had been scaled. It is 0.45 of that
     * depth, 0.191340, and the height below is 0.45 of the shape's own 0.623004.
     * The uniform scale is the whole of the change: the join plane has not moved
     * and the facing has not moved. */
    expect(t.max.z).toBeCloseTo(hull.min.z, 6)
    recovers(t.min.z, hull.min.z - 0.191340, 'the stub reaches 0.45 of its depth back')
    // Still a stub and not a whip: taller than it is long, which no other tail in
    // the bank is. A uniform scale cannot change that, and this is what says so.
    expect(t.max.y - t.min.y).toBeCloseTo(0.280350, 5)
    expect(t.max.y - t.min.y).toBeGreaterThan(t.max.z - t.min.z)
  })

  it('recovers the bank\'s own recorded offset, mirrored — which is the evidence', () => {
    const trunk = partById('box-18')!
    const tail = VOLE_ASSEMBLY.features.find(f => f.name === 'tail')!
    expect(tail.placement.kind).toBe('single')
    if (tail.placement.kind === 'single') {
      // Joined at THIS hull's rear face, on the midline.
      expect(tail.placement.at[2]).toBeCloseTo(-HULL_FRONT_Z_USUAL, 9)
      expect(tail.placement.at[0]).toBe(0)
      /* The HEIGHT is no longer pinned to the bank's recorded offset for the
       * shape. It was 0.482248, the elephant's own; Joe raised it to 0.725 in
       * the editor, which is a carry decision and his to make. */
    }
    // Sunk the elephant's own 0.000 — the pack did not bury it, so neither does
    // this.
    expect(tail.sink).toBe(0)
    expect(trunk.attachment!.sunkFractionMean).toBe(0)
    /* The centre used to be required to land on the bank's recorded offset with
     * the sign flipped, which was the evidence that the donor transfer was
     * exact. Joe shrank the stub to 0.45 in the editor, so a scaled copy cannot
     * recover the full-size offset and never will again. The claim that
     * survives — the base sits ON the flat rear face, nothing floating — is the
     * next test down, and it is the one that would show on screen. */
  })

  it('lands its base on the FLAT rear face — §3, nothing floats', () => {
    const g = build()
    const mesh = g.getObjectByName('tail') as THREE.Mesh
    const pos = mesh.geometry.getAttribute('position')
    const centre = world(g, 'tail')
    let maxZ = -Infinity
    for (let i = 0; i < pos.count; i++) maxZ = Math.max(maxZ, pos.getZ(i))
    let lo = Infinity, hi = -Infinity
    for (let i = 0; i < pos.count; i++) {
      if (Math.abs(pos.getZ(i) - maxZ) > 1e-4) continue
      lo = Math.min(lo, pos.getY(i)); hi = Math.max(hi, pos.getY(i))
    }
    /* The join cross-section, in world y. Sunk zero, it sits ON the plane — so
     * it has to be inside the FLAT part of that plane or its lower edge hangs
     * over a chamfer that has already fallen away.
     *
     * BOTH NUMBERS MOVED AT 84cd17a, and neither of them is this test's claim.
     * Joe's editor push gave the tail `at: [0, 0.725, -0.625]` and a 0.45 scale,
     * so the section is both higher and 0.45 as deep: 0.1345 of run where it used
     * to be 0.2988, and it clears the bottom of the flat face by 0.2369 where the
     * transfer used to clear it by 0.00115. The claim is the two gates below, and
     * §3 is satisfied with far more room than before, not less. */
    expect(lo + centre.y).toBeCloseTo(0.730685, 5)
    expect(hi + centre.y).toBeCloseTo(0.865145, 5)
    expect(lo + centre.y).toBeGreaterThan(FLAT_LO)   // by 0.2369
    expect(hi + centre.y).toBeLessThan(FLAT_HI)      // by 0.2536
  })
})

describe('animal-vole: no ears at all, and that is the separation', () => {
  it('has no ear feature, and wears none of the shapes the others wear as ears', () => {
    expect(VOLE_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
    // Named, because these are the two this animal is confused with: the mouse's
    // 0.743 koala dish and the dormouse's round beaver button.
    const worn = new Set(VOLE_ASSEMBLY.features.map(f => f.part))
    expect(worn.has('box-25')).toBe(false)
    expect(worn.has('box-02')).toBe(false)
    expect(partById('box-25')!.size[0]).toBeCloseTo(0.742676, 6)
  })

  it('uses `wedge-04` as a CHEEK, and nothing about it reads as an ear', () => {
    // §3.1: a part's identity is its placement, not Kenney's label. The bank
    // gives this shape BOTH roles and the pack itself is undecided — its own
    // provenance calls it "front-of-face feature (tooth/tusk/cheek)".
    expect(partById('wedge-04')!.roles).toEqual(['ear', 'tooth'])
    const cheek = VOLE_ASSEMBLY.features.find(f => f.name === 'cheek')!
    expect(cheek.placement.kind).toBe('pair')
    if (cheek.placement.kind === 'pair') {
      // The bunny's own x, which is 0.171 off the midline — an ear is not there.
      expect(cheek.placement.at[0]).toBeCloseTo(partById('wedge-04')!.offset[0]!, 9)
      expect(cheek.placement.at[0]).toBeCloseTo(0.171215, 6)
    }
    // And it stands 0.119 proud of the head, sunk the bunny's own 0.650856. The
    // mouse's ear is six times that across and hangs off the head's SIDE.
    const g = build()
    const proud = boxOf(g, 'cheek-r').max.y - boxOf(g, 'hull').max.y
    expect(proud).toBeCloseTo(0.1191, 3)
    expect(cheek.sink).toBeCloseTo(0.650856, 6)
  })
})

describe('animal-vole: the face is the bunny\'s, worn whole, and every piece recovers', () => {
  /* All four are the bunny's, and the bunny wears them on THIS hull — `box-03`
   * is its own torso+head shell — so each transfer is exact rather than an
   * inference, and the check is the recovered offset against a number the solve
   * did not use. §8. */
  it('joins the muzzle at the cube\'s TOP face and recovers the bunny\'s own height', () => {
    const bunny = partById('box-08')!
    const muzzle = VOLE_ASSEMBLY.features.find(f => f.name === 'muzzle')!
    expect(muzzle.placement).toEqual({ kind: 'single', at: [0, 1.43125, bunny.offset[2]] })
    expect(muzzle.sink).toBeCloseTo(0.75198, 6)
    recovers(world(build(), 'muzzle').y, bunny.offset[1]!, 'the muzzle')
  })

  it('is BLUNT — three quarters buried, and it projects forward not at all', () => {
    const g = build()
    const hull = boxOf(g, 'hull')
    const muzzle = boxOf(g, 'muzzle')
    // 0.0811 proud of the head, and its front is 0.026 BEHIND the hull's own
    // front plane. The mouse's `tube-01` barrel juts off that plane and the
    // shrew's snout runs to a point; this animal has no projecting face at all,
    // and that is the whole of the separation from both.
    expect(muzzle.max.y - hull.max.y).toBeCloseTo(0.0811, 3)
    expect(muzzle.max.z).toBeLessThan(hull.max.z)
    expect(VOLE_ASSEMBLY.features.some(f => f.part === 'tube-01')).toBe(false)
    // Nothing on the whole animal reaches more than 0.101 in front of the face.
    let front = -Infinity
    g.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || m.name === 'hull') return
      front = Math.max(front, new THREE.Box3().setFromObject(m).max.z)
    })
    expect(front - hull.max.z).toBeLessThan(0.101)
  })

  it('puts the nose button and its plate on the front face at the bunny\'s own heights', () => {
    for (const [name, id] of [['nose', 'box-09'], ['nose-plate', 'blade-02']] as const) {
      const part = partById(id)!
      const f = VOLE_ASSEMBLY.features.find(x => x.name === name)!
      expect(f.part).toBe(id)
      expect(f.placement).toEqual({
        kind: 'single', at: [0, part.offset[1], HULL_FRONT_Z_USUAL],
      })
      expect(f.sink).toBe(0)
      // Sunk nothing, so the centre lands on the bank's own recorded z.
      recovers(world(build(), name).z, part.offset[2]!, name)
    }
    // A BUTTON, deliberately. `wedge-10` is measurably the better nose tip on
    // every axis the classification has and reads as a tongue — Joe rejected it
    // by name on the hedgehog, and the lesson is not the hedgehog's alone.
    expect(VOLE_ASSEMBLY.features.some(f => f.part === 'wedge-10')).toBe(false)
  })

  it('wears the BEAVER\'s incisors, because the beaver is the pack\'s one rodent', () => {
    const beaver = partById('wedge-01')!
    expect(beaver.provenance.map(p => p.species)).toEqual(['beaver'])
    const teeth = VOLE_ASSEMBLY.features.find(f => f.name === 'incisor')!
    expect(teeth.placement.kind).toBe('pair')
    if (teeth.placement.kind === 'pair') {
      // At the midline at mouth height — 0.073 off centre, y 0.561, below the
      // eye plane's 0.933646. Every other tooth shape in the bank sits out at a
      // tusk's spread; these are the only ones that are a rodent's.
      expect(teeth.placement.at[0]).toBeCloseTo(beaver.offset[0]!, 9)
      expect(teeth.placement.at[0]).toBeCloseTo(0.072621, 6)
      expect(teeth.placement.at[1]).toBeCloseTo(0.561036, 6)
      expect(teeth.placement.at[2]).toBe(HULL_FRONT_Z_USUAL)
    }
    expect(teeth.sink).toBeCloseTo(beaver.attachment!.sunkFractionMean, 9)
    recovers(world(build(), 'incisor-r').z, beaver.offset[2]!, 'the incisors')
  })
})

describe('animal-vole: rule 9 has a FLOOR, and this is the animal that found it', () => {
  it('would be 294 vertices without the face, which is a hundred and eleven UNDER', () => {
    const g = build()
    let all = 0, face = 0
    g.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const n = m.geometry.getAttribute('position').count
      all += n
      // Everything but the muzzle: the cheeks, the nose, its plate, the teeth.
      if (/^(cheek|nose|nose-plate|incisor)(-|$)/.test(m.name)) face += n
    })
    expect(all).toBe(430)
    expect(all - face).toBe(294)
    // `assembly-creature.test.ts` pins the finding this species ran into: the
    // pack has no animal as bare as a hull, legs and eye cards, and
    // `assertAssembly` enforces the floors with NO escape clause — there is an
    // `overBudget` for going over and nothing at all for coming under. An
    // earless species is the one that meets it, so the vertices were spent on a
    // face a vole actually has rather than on an ear it does not.
    expect(all - face).toBeLessThan(MODEL_VERTS_MIN)
    expect(all).toBeGreaterThan(MODEL_VERTS_MIN)
  })

  it('strains nothing, so it carries no flag', () => {
    expect(VOLE_ASSEMBLY.flag).toBeUndefined()
    expect(VOLE_ASSEMBLY.hull.stretch).toBeUndefined()
    /*
     * "NOT ONE HAND-CHOSEN COORDINATE" WAS RETIRED HERE. It walked every `at` on
     * the animal and required each number to be either a hull face, a station on
     * the pack's grid, or a value lifted whole out of the bank's record for that
     * shape — anything else failed as having "come from nowhere".
     *
     * That was a good rule for the period when an agent was assembling animals
     * out of the bank and a number with no provenance meant somebody had eyeballed
     * it. It is the wrong rule now: Joe designs these in the workbench editor, and
     * choosing a coordinate by eye is what the editor is FOR. He moved this tail
     * to y = 0.725 there, so the test failed him for using the tool that was built
     * for him — the same class of mistake as the pack norms, and it is his
     * ruling of 3 August that settles it.
     *
     * `assertAssembly` still requires every mesh to be a rigid copy of a bank
     * shape and every placement to be translation-only. What a number is ALLOWED
     * TO BE is no longer this file's business.
     */
  })

  it('fits between two trees more easily than the mouse does', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    /* `pets.ts:652` charges keep-out from max(width, depth) / 2. The stub tail and
     * the absent ears are what make this animal cheap to walk past.
     *
     * 0.771 SINCE 84cd17a, WAS 0.888. Joe shrank the stub to 0.45 in the workbench
     * editor and pushed it, which takes 0.234 off the DEPTH and is all of the
     * difference — the width is the cube's own 1.250 and has not moved, so the
     * binding dimension is still the depth. It has more room than it was asserted
     * to have, not less, and the gate below is the claim: comfortably under the
     * mouse's 0.984, and further under the fox's own 1.15, which is the pack's
     * worst and the number the island already copes with. */
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.771, 2)
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(0.984)
  })
})
