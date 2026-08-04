/**
 * `CARD_STANDOFF` — that a flat card the transfer placed is IN FRONT of the face
 * it joined, and not in it.
 *
 * A card has zero thickness, so it has no extent along its own facing, so §8's
 * donor transfer used to join it and finish it in the same plane: a single-sided
 * quad exactly coplanar with the hull. That does not look wrong on a screen, it
 * looks like nothing at all — two surfaces at the same depth, no bias anywhere in
 * `assembly.ts` or `texture.ts` to break the tie. It cost the shrew its mouth, and
 * it is why the goldfish, the firefly and the glow-worm all reach for the same
 * hand-written `at: [..., 0.635]`.
 *
 * The number that fixes it is not chosen. `plate-03`'s own recorded offset is
 * `[0, 0.686849, 0.635]` and `box-03`'s front face is 0.625, so the standoff that
 * recovers the donor's own placement on the donor's own hull is 0.010 — the same
 * 0.010 `hulls.ts` measures between `EYE_CARD_Z` and the seven usual front faces,
 * and the same 0.010 `docs/HANDOFF.md` §6 measures off Kenney's own face-decal
 * sheet. Three derivations, one number, and this file is the arithmetic run.
 *
 * Every def below goes through `creatureSpec` and is BUILT — nothing here asserts
 * against a hand-made `AssemblyBuild`, because a placement bug is exactly the kind
 * a mock reproduces happily.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  creatureSpec, buildAssembly, CARD_STANDOFF, EYE_CARD_Z, HULL_FRONT_Z,
  type CreatureDef,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'

/** The default hull, and the face every card below joins. */
const FRONT = HULL_FRONT_Z['box-03']!

/* The palette is the one thing a definition must carry, and it is not what any of
 * this is about, so every def below is the FEATURE and nothing else. */
const PALETTE = { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, nose: 0x4e361d }
type Body = Omit<CreatureDef, 'palette'>

const spec = (def: Body): ReturnType<typeof creatureSpec> =>
  creatureSpec('test-card-standoff', { ...def, palette: PALETTE })

const build = (def: Body): THREE.Group => {
  const g = buildAssembly(spec(def))
  g.updateMatrixWorld(true)
  return g
}

const joinOf = (def: Body, name: string): readonly number[] => {
  const p = spec(def).features.find(f => f.name === name)!.placement
  if (p.kind === 'row') throw new Error(`"${name}" is a row and has no single join point`)
  return p.at
}

const worldZ = (def: Body, mesh: string): number =>
  build(def).getObjectByName(mesh)!.getWorldPosition(new THREE.Vector3()).z

describe('a SOLVED card stands proud of the face it joined', () => {
  /* The bee's, the caterpillar's and the fish's mouth, said in the shortest way a
   * definition can say it: a part id and nothing else. */
  const SOLVED: Body = { extras: [{ name: 'mouth', part: 'plate-03', paint: 'limb' }] }

  it('lands at the front face plus CARD_STANDOFF, and NOT in the front face', () => {
    expect(CARD_STANDOFF).toBe(0.01)
    expect(partById('plate-03')!.size[2]).toBe(0)     // it really has no thickness
    expect(joinOf(SOLVED, 'mouth')[2]).toBeCloseTo(FRONT + CARD_STANDOFF, 9)
    // The regression, pinned as its own line: coplanar is the failure mode, and
    // "close to the face" is not the claim — "off it, by the pack's own daylight"
    // is. A card at 0.625 z-fights the hull and reads as absent.
    expect(joinOf(SOLVED, 'mouth')[2]).not.toBe(FRONT)
    expect(joinOf(SOLVED, 'mouth')[2]! - FRONT).toBeCloseTo(0.01, 9)
  })

  it('lands on EYE_CARD_Z — the constant three species had already typed by hand', () => {
    // 0.625 + 0.010 = 0.635, which is not a coincidence and is the whole argument
    // for the number: it is `EYE_CARD_Z`, it is `plate-03`'s OWN recorded offset,
    // and it is what the goldfish, the firefly and the glow-worm each wrote out
    // because the default let them down.
    expect(joinOf(SOLVED, 'mouth')[2]).toBeCloseTo(EYE_CARD_Z, 9)
    // Every coordinate recovered, not one of them chosen: the midline, the card's
    // own recorded y, and its own recorded z, on the hull its donor wore.
    expect(partById('plate-03')!.offset).toEqual([0, 0.686849, 0.635])
    expect(joinOf(SOLVED, 'mouth')).toEqual([0, 0.686849, 0.635])
  })

  it('actually MOVES THE MESH, which is the only version of this that matters', () => {
    // The standoff rides on the join point rather than on the anchor arithmetic,
    // because `assembly.ts` re-solves the shift from the built geometry when it
    // places the copy. A fix that only moved the anchor would leave the card
    // exactly where it was and this line is what would catch it.
    const g = build(SOLVED)
    const mouth = g.getObjectByName('mouth')!.getWorldPosition(new THREE.Vector3())
    const hull = new THREE.Box3().setFromObject(g.getObjectByName('hull')!)
    expect(mouth.z).toBeCloseTo(EYE_CARD_Z, 6)
    expect(mouth.z - hull.max.z).toBeCloseTo(CARD_STANDOFF, 6)
    expect(mouth.z).toBeGreaterThan(hull.max.z)
  })
})

describe('an EXPLICIT `at` is the author naming the plane, and is left alone', () => {
  /* The goldfish's own line, lifted verbatim from `animal-goldfish.ts:269`. */
  const GIVEN: Body = {
    extras: [{ name: 'mouth', part: 'plate-03', paint: 'limb', at: [0, 0.686849, EYE_CARD_Z] }],
  }

  it('places it at exactly that `at`, with no standoff added on top', () => {
    expect(joinOf(GIVEN, 'mouth')).toEqual([0, 0.686849, EYE_CARD_Z])
    // The failure this guards is DOUBLE APPLICATION: 0.635 + 0.010 = 0.645 would
    // move three shipped mouths by the width of the fix. Pinned as the number, not
    // as a relation, so it cannot drift with the constant.
    expect(joinOf(GIVEN, 'mouth')[2]).toBe(0.635)
    expect(worldZ(GIVEN, 'mouth')).toBeCloseTo(0.635, 6)
    expect(worldZ(GIVEN, 'mouth')).not.toBeCloseTo(0.635 + CARD_STANDOFF, 6)
  })

  it('and the solve agrees with the hand-written line, which is why it can be deleted', () => {
    const SOLVED: Body = { extras: [{ name: 'mouth', part: 'plate-03', paint: 'limb' }] }
    expect(joinOf(SOLVED, 'mouth')).toEqual(joinOf(GIVEN, 'mouth'))
  })
})

describe('a part with real depth is not touched by any of this', () => {
  /* The beaver's incisor: 0.128945 deep, sunk its own 0.218566. It has extent
   * along its facing, so it was never coplanar with anything and has nothing to be
   * rescued from. */
  const SOLID: Body = { extras: [{ name: 'tooth', part: 'wedge-01', paint: 'belly' }] }

  it('recovers the bank\'s own recorded z to six decimals, unshifted', () => {
    const tooth = partById('wedge-01')!
    expect(tooth.size[2]).toBeGreaterThan(0)
    expect(joinOf(SOLID, 'tooth')[2]).toBe(FRONT)   // joined AT the face, as before
    // §8's own evidence: joined at 0.625 and sunk its own measured fraction, the
    // centre lands on 0.661290 — the donor's recorded offset, a number the solve
    // never used. An extra 0.010 anywhere in here would show up as 0.671290.
    // Four decimals, because the bank rounds both the offset and the sunk
    // fraction to six and the recovery carries that rounding — the shrew's own
    // test makes the same allowance on the same shape. 0.010 is two orders of
    // magnitude clear of it, so the claim is not weakened.
    expect(tooth.offset[2]).toBeCloseTo(0.66129, 6)
    expect(worldZ(SOLID, 'tooth')).toBeCloseTo(tooth.offset[2]!, 4)
    expect(worldZ(SOLID, 'tooth')).not.toBeCloseTo(tooth.offset[2]! + CARD_STANDOFF, 4)
  })
})

/*
 * THE SHREW'S MOUTH WAS THE WORKED EXAMPLE HERE, and it no longer exists.
 *
 * This block asserted that `animal-shrew.ts` could say `{ name: 'mouth', part:
 * 'plate-13' }` and nothing else and still be visible — the standoff solved for
 * it, so the species file needed no `at`. On 4 August Joe removed the mouth from
 * the shrew altogether and gave its teeth their own colour instead.
 *
 * Nothing is lost by retiring it: the standoff behaviour it demonstrated is
 * asserted directly by the three blocks above, against the builder rather than
 * against one species that happened to show it off.
 */
