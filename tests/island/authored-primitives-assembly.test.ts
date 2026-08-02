/**
 * The three base shapes, THROUGH the kit — the seam, not the generator.
 *
 * `authored-primitives.test.ts` next door asserts what `primitiveStretched`
 * produces. That is worth nothing on its own: a re-cut solid nobody calls is a
 * dead feature, and this repo has shipped four of those because a mock was
 * asserted instead of the thing. So every claim here is measured off a
 * `BufferGeometry` that came out of `buildAssembly`, by way of a `CreatureDef`
 * that a species could actually be written as.
 *
 * Two claims:
 *
 *   1. **A primitive needs no `flag`.** Rule 1's gate in `creature.ts` exists to
 *      surface an UNSANCTIONED authored shape to Joe. `JT-041` sanctioned these
 *      three by name, for everybody, permanently, so the gate must be silent for
 *      them and must still fire for `bespoke-sphere-01` — which is the half of it
 *      that proves the mechanism is intact rather than removed.
 *   2. **A resize REGENERATES.** Stretched 3x on x, the built mesh's chamfer is
 *      still 0.3125 — 0.25 of the smallest dimension, which the x-stretch did not
 *      touch — and NOT 0.9375, which is what multiplying the baked positions
 *      gives. Revert the substitution in `assembly.ts` and that assertion is the
 *      one that goes red.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  creatureSpec, buildAssembly, type CreatureDef,
} from '../../src/island/species/parts'
import {
  PRIMITIVE_IDS, PRIMITIVE_SIZE, primitiveStretched,
} from '../../src/island/species/parts/authored'
import type { BakedPart } from '../../src/island/species/parts/bank.generated'

/** Four colours and a name — the minimal definition, as `creature.ts` documents it. */
const MINIMAL: CreatureDef = {
  palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, nose: 0x4e361d },
}

const wearing = (part: string, stretch?: [number, number, number]): CreatureDef => ({
  ...MINIMAL,
  extras: [{ name: 'block', part, paint: 'coat', ...(stretch ? { stretch } : {}) }],
})

const build = (def: CreatureDef): THREE.Group => {
  const g = buildAssembly(creatureSpec('test-primitive', def))
  g.updateMatrixWorld(true)
  return g
}

const blockOf = (g: THREE.Group): THREE.Mesh => {
  const m = g.getObjectByName('block')
  expect(m, 'the definition placed no mesh called "block"').toBeTruthy()
  return m as THREE.Mesh
}

type P3 = [number, number, number]

/** A mesh's own local positions — bbox-centred, which is what the baker emits. */
const pointsOf = (m: THREE.Mesh): P3[] => {
  const a = m.geometry.getAttribute('position')
  const out: P3[] = []
  for (let i = 0; i < a.count; i++) out.push([a.getX(i), a.getY(i), a.getZ(i)])
  return out
}

/** A part record's own positions, three at a time. */
const vertsOf = (p: BakedPart): P3[] => {
  const out: P3[] = []
  for (let i = 0; i < p.positions.length; i += 3) {
    out.push([p.positions[i]!, p.positions[i + 1]!, p.positions[i + 2]!])
  }
  return out
}

const dedup = (ps: readonly P3[]): P3[] => {
  const seen = new Map<string, P3>()
  for (const p of ps) seen.set(p.map(n => n.toFixed(4)).join(','), p)
  return [...seen.values()]
}

/**
 * How far the worst point of `a` is from the nearest point of `b`.
 *
 * A DISTANCE rather than a snapped string key, and the difference is not
 * fastidiousness: one side of every comparison below has been through a
 * `Float32BufferAttribute` and the other has not, so a coordinate that ought to
 * be 0.3125 arrives as 0.31249997 — which lands exactly on a thousandth's
 * rounding boundary and snaps to 0.312 on one side and 0.313 on the other. Two
 * identical solids then compare as different, on nothing. A distance has no
 * boundary to straddle, and the two answers this separates are 0.6 apart.
 */
function maxNearest(a: readonly P3[], b: readonly P3[]): number {
  let worst = 0
  for (const p of a) {
    let best = Infinity
    for (const q of b) {
      const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
      if (d < best) best = d
    }
    if (best > worst) worst = best
  }
  return worst
}

/** Symmetric, so a subset cannot pass for the whole cloud. */
const cloudGap = (a: readonly P3[], b: readonly P3[]): number =>
  Math.max(maxNearest(a, b), maxNearest(b, a))

const halfExtent = (ps: readonly P3[], axis: 0 | 1 | 2): number =>
  Math.max(...ps.map(p => Math.abs(p[axis])))

/**
 * The chamfer, MEASURED off the built mesh: how far the plateau of the face on
 * `face` stops short of the solid's own extent along `along`.
 *
 * This is `box-03`'s own measurement generalised — its top face is 0.625 square
 * inside a 1.250 cube, so the cut is 0.3125 — and it is the only measurement that
 * separates a re-cut solid from a multiplied one. Measuring the cut on an axis
 * the stretch did not touch cannot: an x-stretch leaves the y and z numbers alone
 * either way. It is the cut ALONG the stretched axis that triples under a
 * multiply and stays put under a re-cut.
 */
function chamfer(ps: readonly P3[], face: 0 | 1 | 2, along: 0 | 1 | 2): number {
  const h = halfExtent(ps, face)
  const onFace = ps.filter(p => Math.abs(Math.abs(p[face]) - h) < 1e-4)
  expect(onFace.length, 'no vertex sits on the outer face').toBeGreaterThan(0)
  return halfExtent(ps, along) - halfExtent(onFace, along)
}

/* ------------------------------------------------- 1. no flag needed --- */

describe('the three base shapes are worn without a per-species RULE 1 flag', () => {
  it('takes a bespoke-square-01 feature with no flag at all', () => {
    const def = wearing('bespoke-square-01')
    expect(def.flag, 'the definition under test must carry no flag').toBeUndefined()
    expect(() => creatureSpec('test-primitive', def)).not.toThrow()

    const block = blockOf(build(def))
    // It really is the authored shape, and it says so where anything can read it.
    expect(block.userData['part']).toBe('bespoke-square-01')
    expect(block.geometry.getIndex()!.count / 3).toBe(60)
  })

  it('takes the triangle and the circle on the same terms', () => {
    for (const id of ['bespoke-triangle-01', 'bespoke-circle-01']) {
      expect(() => creatureSpec('test-primitive', wearing(id)), id).not.toThrow()
      expect(blockOf(build(wearing(id))).userData['part']).toBe(id)
    }
  })

  it('STILL refuses bespoke-sphere-01 with no flag — the gate is intact', () => {
    // The mechanism is not weakened, only excepted: a part Joe commissioned once,
    // for one animal, is still a thing the species has to declare where he reads
    // it. If this ever passes, the exception has swallowed the rule.
    expect(() => creatureSpec('test-primitive', wearing('bespoke-sphere-01')))
      .toThrow(/RULE 1.*AUTHORED shape bespoke-sphere-01/s)
  })

  it('and takes bespoke-sphere-01 when the flag says RULE 1', () => {
    expect(() => creatureSpec('test-primitive', {
      ...wearing('bespoke-sphere-01'),
      flag: 'RULE 1 OVERRULED, BY JOE: a bespoke sphere.',
    })).not.toThrow()
  })
})

/* --------------------------------------- 2. the resize REGENERATES --- */

describe('a stretched primitive is RE-CUT by the kit, not multiplied', () => {
  /* 0.25 x 1.250. `box-03`'s own cut, and the number the whole of `authored.ts`
   * is measured against. */
  const CUT = 0.3125

  it('keeps the chamfer at 0.3125 under a 3x stretch on x — measured on the MESH', () => {
    const plain = pointsOf(blockOf(build(wearing('bespoke-square-01'))))
    const wide = pointsOf(blockOf(build(wearing('bespoke-square-01', [3, 1, 1]))))

    /* First: the stretch happened at all. Without this the chamfer claim below
     * would pass on a kit that silently dropped the stretch. */
    expect(halfExtent(plain, 0) * 2).toBeCloseTo(PRIMITIVE_SIZE[0], 4)
    expect(halfExtent(wide, 0) * 2).toBeCloseTo(PRIMITIVE_SIZE[0] * 3, 4)
    // And only on x: the other two are the box it was always cut from.
    expect(halfExtent(wide, 1) * 2).toBeCloseTo(PRIMITIVE_SIZE[1], 4)
    expect(halfExtent(wide, 2) * 2).toBeCloseTo(PRIMITIVE_SIZE[2], 4)

    /* THE ASSERTION. The cut along x, measured off the top face's plateau: the
     * smallest dimension is still 1.250, so the cut is still 0.25 of it. */
    expect(chamfer(plain, 1, 0)).toBeCloseTo(CUT, 4)
    expect(chamfer(wide, 1, 0)).toBeCloseTo(CUT, 4)
    // Said the other way round, because this is the number a multiply gives and
    // the whole point is that the kit does not give it.
    expect(chamfer(wide, 1, 0)).not.toBeCloseTo(3 * CUT, 3)
    // The same cut off the front face, so it is the solid and not one face.
    expect(chamfer(wide, 2, 0)).toBeCloseTo(CUT, 4)
    // And the untouched axes are untouched, which a multiply also gets right —
    // it is here so a regression that breaks them is not silent.
    expect(chamfer(wide, 0, 1)).toBeCloseTo(CUT, 4)
    expect(chamfer(wide, 0, 2)).toBeCloseTo(CUT, 4)

    /* Re-cut, not resampled: the same solid, so the same 32 welded points and
     * the same 60 triangles at either size. */
    expect(wide.length).toBe(plain.length)
    expect(wide.length).toBe(32)
  })

  it('leaves an unstretched primitive exactly as it was', () => {
    // `primitiveStretched` returns the base part verbatim at [1, 1, 1], so the
    // identity stretch is not a re-cut that happens to agree — it is the same
    // object, and the built geometry is point-for-point the same.
    const a = pointsOf(blockOf(build(wearing('bespoke-square-01'))))
    const b = pointsOf(blockOf(build(wearing('bespoke-square-01', [1, 1, 1]))))
    expect(b).toEqual(a)
  })

  it('hands the kit the RE-CUT solid for all three, and not the multiplied one', () => {
    /* The square's chamfer above is the measurement that says what went wrong
     * when this breaks. This is the one that covers all three exactly: the built
     * mesh's point set is `primitiveStretched`'s own, and it is NOT the baked
     * positions multiplied — which is the geometry the kit produced before the
     * substitution and the geometry it will produce again if anybody removes it.
     *
     * A circle's rim and a triangle's cut-back apex do not offset to round
     * numbers under a non-uniform stretch, so they are compared against the
     * generator rather than against an arithmetic anybody would have to redo
     * here — but the DIFFERENCE is asserted too, so agreeing with the generator
     * cannot be agreeing with nothing. */
    for (const id of PRIMITIVE_IDS) {
      const wide = dedup(pointsOf(blockOf(build(wearing(id, [3, 1, 1])))))
      const recut = dedup(vertsOf(primitiveStretched(id, [3, 1, 1])))
      const multiplied = dedup(vertsOf(primitiveStretched(id, [1, 1, 1]))
        .map(p => [p[0] * 3, p[1], p[2]] as P3))
      expect(wide.length, `${id} has the wrong number of points`).toBe(recut.length)
      expect(cloudGap(wide, recut), `${id} is not the re-cut solid`).toBeLessThan(1e-3)
      expect(cloudGap(recut, multiplied),
        `${id} re-cut and multiplied are the same shape — nothing is proven`)
        .toBeGreaterThan(0.1)
      expect(cloudGap(wide, multiplied), `${id} arrived multiplied`).toBeGreaterThan(0.1)
    }
  })

  it('feeds the regenerated extent into the join solver', () => {
    /* `spanAlong` reads the BAKED geometry, so whatever the re-cut changed about
     * the part's extent is what the sink is solved against. A square sunk half
     * its own height into the hull's top face lands with its centre ON that face
     * at any x-stretch, because the re-cut did not change its height. */
    const g = build(wearing('bespoke-square-01', [3, 1, 1]))
    const block = blockOf(g)
    const at = block.userData['joinedAt'] as readonly number[]
    expect(block.userData['extent']).toBeCloseTo(PRIMITIVE_SIZE[1], 4)
    expect(block.position.y).toBeCloseTo(at[1]!, 6)
    expect(block.userData['sink']).toBeCloseTo(0.5, 6)
  })
})
