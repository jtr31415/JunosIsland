/**
 * The editor's translate gesture — the ARITHMETIC of it, on real numbers.
 *
 * Joe reported that "some parts snap to a location, even though snap is off —
 * eyes are fine and i can move them perfectly, 3d components snap to somewhere."
 * That was a DOUBLE unit conversion. `TransformControls` writes `object.position`
 * in the object's PARENT space — it divides the world offset by the parent's
 * world scale at `three/examples/jsm/controls/TransformControls.js:561` and adds
 * `_positionStart` at `:565` — and the parent is the built group that `stage.ts`
 * scales by `SHARED_SCALE`. `commit` then divided by `SHARED_SCALE` again.
 *
 * The two shapes of the damage, which are the two claims this file pins:
 *
 *   1. **A DRAG OF D LANDS AT D.** The second divide multiplied every translate
 *      by 1/0.6207 = 1.611185, so the part ended up two thirds again past the
 *      cursor. Nothing about that is a snap, but it is the half of the fault a
 *      person feels as "it does not go where I put it".
 *   2. **A ZERO-LENGTH DRAG MOVES THE HULL NOWHERE.** This is the "snaps to a
 *      location" itself. The hull's base is an ABSOLUTE position, not a delta,
 *      so dividing it wrote `at = 1.611 * at`: a fixed destination, reachable
 *      from anywhere, reached again on the next nudge. And because
 *      `creature.ts:494` frames the whole animal off `hull.at`, every other part
 *      moved with it.
 *
 * Nothing here is mocked. `joinFromDrag` is the real function `commit` calls,
 * given the real numbers a real build puts on a mesh — `PACK_HEIGHT_MEDIAN` is
 * restated below from `stage.ts` so that a regression shows up as the exact
 * 1.611185 factor rather than as an unexplained near-miss.
 */
import { describe, it, expect } from 'vitest'

import { joinFromDrag } from '../../tools/workbench/public/editor/stage'
import type { Vec3 } from '../../src/island/species/parts/assembly'

/** `stage.ts:36`. The divisor whose reappearance is the bug. */
const PACK_HEIGHT_MEDIAN = 1.611185

/** The `at` of the test species' hull, in definition units. */
const HULL_AT: Vec3 = [0, 0.625, 0]
/** The join point a build wrote onto an ear mesh, in definition units. */
const EAR_JOINED_AT: Vec3 = [0.3125, 1.1875, 0.125]
/**
 * A part's mesh sits a measured `shift` along its facing AWAY from its join
 * point (`assembly.ts:582`), so its position is never its `at`. The gap is the
 * whole reason the non-hull path works in deltas.
 */
const EAR_MESH_AT: Vec3 = [0.3125, 1.3125, 0.125]

const drag = (over: Partial<Parameters<typeof joinFromDrag>[0]>): Vec3 =>
  joinFromDrag({
    from: [0, 0, 0], to: [0, 0, 0],
    absolute: false, joinedAt: undefined, mirror: false, step: 0,
    ...over,
  })

describe('a translate travels exactly as far as the gizmo did', () => {
  it('moves a part by D when the gizmo moved it by D', () => {
    const D: Vec3 = [0.25, -0.125, 0.0625]
    const at = drag({
      joinedAt: EAR_JOINED_AT,
      from: EAR_MESH_AT,
      to: [EAR_MESH_AT[0] + D[0], EAR_MESH_AT[1] + D[1], EAR_MESH_AT[2] + D[2]],
    })
    expect(at).toEqual([
      EAR_JOINED_AT[0] + D[0], EAR_JOINED_AT[1] + D[1], EAR_JOINED_AT[2] + D[2],
    ])
  })

  it('does not overshoot by the view scale — the 1.611x the double divide added', () => {
    const D = 0.25
    const at = drag({
      joinedAt: EAR_JOINED_AT,
      from: EAR_MESH_AT,
      to: [EAR_MESH_AT[0] + D, EAR_MESH_AT[1], EAR_MESH_AT[2]],
    })
    const travelled = at[0] - EAR_JOINED_AT[0]
    expect(travelled).toBeCloseTo(D, 9)
    /* Stated as the factor itself, so a regression reads as what it is. */
    expect(travelled).not.toBeCloseTo(D * PACK_HEIGHT_MEDIAN, 6)
  })

  it('keeps the mesh-to-join gap out of the answer entirely', () => {
    /* The mesh is 0.125 above its join point; a drag of nothing must not
     * discover that gap and write it into the definition. */
    const at = drag({ joinedAt: EAR_JOINED_AT, from: EAR_MESH_AT, to: EAR_MESH_AT })
    expect(at).toEqual(EAR_JOINED_AT)
  })
})

describe('the hull does not snap to a fixed destination', () => {
  it('leaves `at` untouched when the drag went nowhere', () => {
    /* The symptom, exactly: press and release the hull's handle without moving
     * it. `at` was coming back as 1.611 * at — a destination that does not
     * depend on where the hull was, which is what "snaps to a location" means. */
    const at = drag({ absolute: true, from: HULL_AT, to: HULL_AT })
    expect(at).toEqual(HULL_AT)
    expect(at[1]).not.toBeCloseTo(HULL_AT[1] * PACK_HEIGHT_MEDIAN, 6)
  })

  it('lands one nudge exactly one nudge away, from wherever it started', () => {
    const D = 0.0625
    for (const start of [HULL_AT, [0.5, 0.9, -0.25] as Vec3]) {
      const at = drag({
        absolute: true, from: start, to: [start[0], start[1] + D, start[2]],
      })
      expect(at).toEqual([start[0], start[1] + D, start[2]])
    }
  })

  it('is stable under repetition — ten nudges are ten nudges, not a runaway', () => {
    const D = 0.0125
    let at: Vec3 = HULL_AT
    for (let i = 0; i < 10; i++) {
      at = drag({ absolute: true, from: at, to: [at[0], at[1] + D, at[2]] })
    }
    expect(at[1]).toBeCloseTo(HULL_AT[1] + 10 * D, 9)
  })
})

describe('the rest of the sum still holds', () => {
  it('negates x for the mirrored copy, because `setJoin` wants the +x one', () => {
    const at = drag({
      joinedAt: EAR_JOINED_AT, mirror: true,
      from: EAR_MESH_AT, to: [EAR_MESH_AT[0] + 0.25, EAR_MESH_AT[1], EAR_MESH_AT[2]],
    })
    expect(at[0]).toBeCloseTo(-(EAR_JOINED_AT[0] + 0.25), 9)
    expect(at[1]).toBeCloseTo(EAR_JOINED_AT[1], 9)
  })

  it('rounds to the snap step in DEFINITION units, not world ones', () => {
    /* 0.0125 is the step `commit` passes. A step measured in world units would
     * quantise to 0.00776 and leave numbers no one typed in the source file. */
    const at = drag({
      joinedAt: [0, 0, 0], absolute: false,
      from: [0, 0, 0], to: [0.017, 0.0311, 0], step: 0.0125,
    })
    expect(at).toEqual([0.0125, 0.025, 0])
  })

  it('rounds to the bank\'s six decimals when snap is off', () => {
    const at = drag({ joinedAt: [0, 0, 0], from: [0, 0, 0], to: [0.12345678, 0, -0] })
    expect(at).toEqual([0.123457, 0, 0])
  })

  it('falls back to the origin for a part the build wrote no join point on', () => {
    const at = drag({ joinedAt: undefined, from: [1, 2, 3], to: [1.5, 2, 3] })
    expect(at).toEqual([0.5, 0, 0])
  })
})
