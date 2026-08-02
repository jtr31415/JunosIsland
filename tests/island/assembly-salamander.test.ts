/**
 * The salamander. The fire salamander: black, with yellow blotches you can see
 * from above.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a salamander can say,
 * and it is three things:
 *
 *   1. **`plate-04` really is a solid black eye with no sclera, and it still
 *      cannot be worn.** The survey was right about the shape and the refusal is
 *      for a reason nobody would guess. §2's escape-clause discipline says the
 *      rejected candidate and the reason get pinned so the next builder does not
 *      helpfully "fix" it back; this is that pin.
 *   2. **Every card lands edge-on to a face the pack had already sized it to.**
 *      Eight flat marking sheets, zero thickness, on the pack's own 0.635 shell —
 *      and, since Joe's editor push (`84cd17a`), a ninth: the bee's face plate on
 *      the midline of the face, below the eye cards. It arrived carrying the
 *      editor's own defaults for its name and its palette slot, so what it is and
 *      where it lands are recorded below rather than left to be guessed at.
 *   3. **What actually separates it from the newt** — which is not the tail, and
 *      this file says so out loud rather than claiming a difference nobody can
 *      see at 0.16 scale.
 */
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, SALAMANDER_ASSEMBLY, EYE_CARD_Z, PACK_PUPIL, HULL_BOTTOM_Y,
} from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { speciesRecord } from '../../src/island/species/registry'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-salamander',
  // `plate-03` is the ninth card. Joe added it in the editor and pushed it in
  // `84cd17a`; the face-card test below says where it lands and what it costs.
  parts: ['box-01', 'box-03', 'plate-01', 'plate-03', 'plate-10', 'plate-11', 'wedge-18'],
  height: 1.71,
  // Re-pinned off the built animal after that push. Was 432/582; the face card
  // is 14 welded vertices and 12 triangles, so both moved by exactly its own
  // cost and both are still well inside rule 9's 405-1626 and 422-951 bands.
  verts: 446,
  tris: 594,
  // The tiger's whip is the biggest thing after the hull and it is a sixteenth
  // of it — everything else on this animal is a sheet with no volume at all.
  massRatio: 16,
  // Two: the dorsal blotch rows, turned 90 degrees onto the back. Said as a
  // number because rule 4's "no node carries a rotation" passes vacuously
  // otherwise, and because the turn is the placement, not a detail of it.
  spinsAtLeast: 2,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-salamander')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
/**
 * The hull's world centre, MEASURED rather than quoted.
 *
 * The rig is grounded in y so the feet sit exactly on zero, and the leg's sink is
 * the bank's rounded 0.408163 rather than the exact 20/49, so the whole animal
 * rides 0.0000295 below its nominal height. Every y below is therefore taken
 * against the hull's own box: the cards and the hull carry the same offset, and
 * the claim being made is about where a card sits ON THE HULL, not about where
 * either of them sits in the world.
 */
const hullCentre = (g: THREE.Group): THREE.Vector3 =>
  boxOf(g, 'hull').getCenter(new THREE.Vector3())
const feature = (name: string): (typeof SALAMANDER_ASSEMBLY.features)[number] =>
  SALAMANDER_ASSEMBLY.features.find(f => f.name === name)!

/** `box-03` cuts every edge AND every corner, so each flat face is 0.625 square. */
const FLAT_HALF = 0.3125
/** The hull's own centre — the bank's recorded offset for `box-03`. */
const HULL_C = [0, 0.80625, 0] as const
/** The pack's flat-card shell: `EYE_CARD_Z` is this number on the z axis. */
const CARD_SHELL = 0.635

describe('animal-salamander: the no-sclera eye is real, and is refused anyway', () => {
  it('confirms `plate-04` IS a solid eye card — one band, and that band is the pupil\'s', () => {
    const solid = partById('plate-04')!
    // The survey said "solid black eye, no sclera at all". It is exactly that:
    // the pack used it as an eye, and all 34 of its triangles are band 15 — the
    // pupil column — so there is no second region to paint a sclera into.
    expect(solid.roles).toContain('eye')
    expect(solid.tris).toBe(34)
    expect(new Set(solid.bands)).toEqual(new Set([15]))
    // Against the standard card, which arrives already cut in two.
    expect(new Set(partById('plate-01')!.bands)).toEqual(new Set([3, 15]))
  })

  it('refuses it for the PRE-SPLIT rule, not for the pupil rule, and wears the standard card', () => {
    // It satisfies the pupil rule perfectly — band 15 goes to PACK_PUPIL and
    // covers the whole card. What it cannot satisfy is `assembly-assert.ts` §7:
    // an eye card must read TWO texture slots, so two-tone costs no geometry,
    // and a one-band card reads one. Weakening that for one animal is not on the
    // table, so the bead is made in the palette instead.
    expect(SALAMANDER_ASSEMBLY.features.some(f => f.part === 'plate-04')).toBe(false)
    const eye = feature('eye')
    expect(eye.part).toBe('plate-01')
    // The sclera takes the coat — near-black — and the pupil the pack's own grey.
    expect(eye.paint.base).toBe('coat')
    expect(SALAMANDER_ASSEMBLY.palette['coat']).toBe(0x2c2c32)
    expect(eye.paint.byBand).toEqual({ 15: 'pupil' })
    expect(SALAMANDER_ASSEMBLY.palette['pupil']).toBe(PACK_PUPIL)
    // And the card is still absolutely placed: rule 5 is unsayable, not obeyed.
    expect(eye.placement).toEqual({
      kind: 'pair',
      at: [partById('plate-01')!.offset[0], partById('plate-01')!.offset[1], EYE_CARD_Z],
    })
  })
})

describe('animal-salamander: the tail is a donor transfer and nothing else', () => {
  it('joins the tiger\'s whip at this cube\'s rear face and recovers the bank\'s own centre', () => {
    const tiger = partById('wedge-18')!
    const tail = feature('tail')
    expect(tail.part).toBe('wedge-18')
    if (tail.placement.kind === 'single') {
      // z: this hull's rear face. y and z untouched by the join, so y is the
      // bank's recorded offset and x is the midline.
      expect(tail.placement.at).toEqual([0, tiger.offset[1], -0.625])
    }
    // Sunk the tiger's own measured burial, and the pack gave exactly one value.
    expect(tail.sink).toBeCloseTo(tiger.attachment!.sunkFractionMean, 9)
    expect(tiger.attachment!.sunkFractionMin).toBe(tiger.attachment!.sunkFractionMax)
    expect(tail.spin).toBeUndefined()
    // THE RECOVERY (§8). Solve for the join, then check the answer against a
    // number that was not used in solving it: the centre lands on the bank's
    // recorded -0.826000. That agreement is the evidence the transfer is
    // legitimate rather than a placement that happens to look right.
    const centre = build().getObjectByName('tail')!.getWorldPosition(new THREE.Vector3())
    expect(centre.z).toBeCloseTo(tiger.offset[2]!, 4)
    // And the residual is the BANK's, not ours: `bank.generated.ts` stores
    // positions to four decimals, so a solve that runs through them cannot agree
    // to better than about 5e-6. It agrees to 4.8e-6.
    expect(Math.abs(centre.z - tiger.offset[2]!)).toBeLessThan(1e-5)
  })

  it('is worth its 212 triangles because it sweeps UP, which is what keep-out charges', () => {
    const tiger = partById('wedge-18')!
    // The shape is 1.047 long and only 0.555 deep: it leaves the rump low and
    // arcs up and back. Laid flat it would spend the long axis on depth.
    expect(tiger.size[1]!).toBeCloseTo(1.046587, 6)
    expect(tiger.size[2]!).toBeCloseTo(0.555215, 6)
    expect(tiger.size[2]!).toBeLessThan(tiger.size[1]! * 0.6)
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The fox is the
    // pack's worst at 1.15 and is the number the island already copes with.
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
    expect(Math.max(s.x, s.z) / 2).toBeCloseTo(0.869, 3)
  })
})

describe('animal-salamander: nine flat cards on the pack\'s own 0.635 shell', () => {
  it('carries a NINTH card since the push — the bee\'s face plate, on the eye plane', () => {
    // Added in the editor and pushed in `84cd17a`, and it arrived with the
    // editor's defaults intact: the part id doing duty as the feature name AND as
    // a palette slot. Recording it here is what stops it reading as a mystery.
    const card = partById('plate-03')!
    const face = feature('plate-03')
    expect(face.part).toBe('plate-03')
    // Another zero-thickness cut-out sheet, and the pack never buried one, so
    // this one is unsunk like the other eight.
    expect(card.roles).toEqual(['card'])
    expect(card.size[2]).toBe(0)
    expect(card.attachment!.sunkFractionMean).toBe(0)
    expect(face.sink).toBe(0)
    // Placed on the bank's own recorded offset for the card, untouched — which
    // puts it on the midline and on the same 0.635 shell everything else here
    // lands on, so it does not float and does not z-fight the face it marks.
    expect(face.placement).toEqual({
      kind: 'single', at: [0, card.offset[1], EYE_CARD_Z],
    })
    const g = build()
    const b = boxOf(g, 'plate-03')
    expect(b.min.z).toBeCloseTo(CARD_SHELL, 6)
    expect(b.max.z).toBeCloseTo(CARD_SHELL, 6)
    expect(b.min.x).toBeCloseTo(-b.max.x, 9)
    // Below the eye cards, not beside them: a yellow blaze on the muzzle rather
    // than a tenth blotch. 0.7372 against the eye card's own 0.7735.
    expect(b.max.y).toBeLessThan(boxOf(g, 'eye-r').min.y)
    expect(b.max.y).toBeCloseTo(0.73722, 5)
    // And the slot it paints from is a DUPLICATE of `mark` — the same hex, on its
    // own texture row. Said out loud because a sixth slot is a sixth row of the
    // shared atlas bought for a colour the animal already had.
    expect(SALAMANDER_ASSEMBLY.palette['plate-03'])
      .toBe(SALAMANDER_ASSEMBLY.palette['mark'])
  })

  it('takes marking sheets that have NO thickness, and gives them none', () => {
    for (const id of ['plate-10', 'plate-11']) {
      const card = partById(id)!
      // Exactly zero, not nearly: these are cut-out sheets.
      expect(card.size[0]).toBe(0)
      expect(card.roles).toContain('card')
      // And the pack never buried one, so neither does this.
      expect(card.attachment!.sunkFractionMean).toBe(0)
    }
    for (const f of SALAMANDER_ASSEMBLY.features) {
      if (!f.name.startsWith('blotch')) continue
      expect(f.stretch, `${f.name} carries a stretch`).toBeUndefined()
      expect(f.sink, `${f.name} is sunk`).toBe(0)
      expect(f.paint.base, `${f.name} is not the loud slot`).toBe('mark')
    }
  })

  it('puts every card on the shell 0.635 from the hull\'s centre — the eye card\'s own number', () => {
    const g = build()
    // The flanks: the bank's own recorded x for both cards, which is also
    // EYE_CARD_Z on the other axis. On this cube that is 0.010 of daylight over
    // a 0.625 face — the same daylight rule 5 gives the eye, and the reason the
    // cards do not z-fight the face they mark.
    expect(EYE_CARD_Z).toBe(CARD_SHELL)
    for (const n of ['blotch-upper-r', 'blotch-lower-r']) {
      const b = boxOf(g, n)
      expect(b.min.x, n).toBeCloseTo(HULL_C[0] + CARD_SHELL, 6)
      expect(b.max.x, n).toBeCloseTo(HULL_C[0] + CARD_SHELL, 6)
    }
    expect(boxOf(g, 'blotch-upper-l').max.x).toBeCloseTo(HULL_C[0] - CARD_SHELL, 6)
    // The back: the same shell, measured up from the hull's own centre.
    const c = hullCentre(g)
    expect(c.y).toBeCloseTo(HULL_C[1], 4)
    for (const n of ['blotch-back-fore-r', 'blotch-back-aft-l']) {
      const b = boxOf(g, n)
      expect(b.min.y, n).toBeCloseTo(c.y + CARD_SHELL, 6)
      expect(b.max.y, n).toBeCloseTo(c.y + CARD_SHELL, 6)
    }
    // Which is 0.010 proud of the top face, exactly as the flanks are of theirs.
    expect(boxOf(g, 'blotch-back-fore-r').max.y - boxOf(g, 'hull').max.y)
      .toBeCloseTo(0.01, 6)
  })

  it('lands every card EDGE-ON to the flat face Kenney sized it for — §3, nothing floats', () => {
    const g = build()
    const c = hullCentre(g)
    // `box-03`'s flat faces are 0.625 square, so the bound is ±0.3125 about the
    // hull's centre on the two axes the face runs along. These are not NEAR it:
    // they are on it to four decimals, which is as fine as the bank stores a
    // position — Kenney sized these cards to this face and we did not touch them.
    expect(boxOf(g, 'blotch-upper-r').max.y).toBeCloseTo(c.y + FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-upper-r').min.z).toBeCloseTo(HULL_C[2] - FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-lower-r').min.y).toBeCloseTo(c.y - FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-lower-r').max.z).toBeCloseTo(HULL_C[2] + FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-back-fore-r').max.x).toBeCloseTo(HULL_C[0] + FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-back-fore-r').max.z).toBeCloseTo(HULL_C[2] + FLAT_HALF, 4)
    expect(boxOf(g, 'blotch-back-aft-r').min.z).toBeCloseTo(HULL_C[2] - FLAT_HALF, 4)
    // Inside the bound, never past it — §3 binds in one direction only. The
    // upper flank card sits ON the bound to 1.4e-9, which is float32 dust on a
    // coincidence rather than a margin, so the tolerance here is the dust.
    expect(boxOf(g, 'blotch-upper-r').max.y).toBeLessThan(c.y + FLAT_HALF + 1e-6)
    expect(boxOf(g, 'blotch-back-fore-r').max.x).toBeLessThan(HULL_C[0] + FLAT_HALF + 1e-6)
    // And the two dorsal rows do not touch each other, so no two coplanar sheets
    // ever fight for the same pixels.
    expect(boxOf(g, 'blotch-back-fore-r').min.z)
      .toBeGreaterThan(boxOf(g, 'blotch-back-aft-r').max.z)
  })

  it('turns the back pair onto the top face by BAKING the spin, and keeps the stations', () => {
    for (const n of ['blotch-back-fore', 'blotch-back-aft']) {
      // `x +1` to `y +1`. Rule 4 as amended: the copy's vertices are turned, and
      // the harness separately asserts every node's quaternion is still identity.
      expect(feature(n).spin).toEqual([{ axis: 'z', deg: 90 }])
    }
    // The lateral station is the flank card's own recorded height above the hull
    // centre, carried round by the same 90 degrees the geometry was — a recovery,
    // not a choice. And the two z stations are one station and its reflection.
    const card = partById('plate-10')!
    const fore = feature('blotch-back-fore'), aft = feature('blotch-back-aft')
    if (fore.placement.kind === 'pair' && aft.placement.kind === 'pair') {
      expect(fore.placement.at[0]).toBeCloseTo(card.offset[1]! - HULL_C[1], 6)
      expect(aft.placement.at[0]).toBe(fore.placement.at[0])
      expect(aft.placement.at[2]).toBeCloseTo(card.offset[2]!, 6)
      expect(fore.placement.at[2]).toBeCloseTo(-card.offset[2]!, 6)
    }
  })
})

describe('animal-salamander: the belly line lands on geometry that was already there', () => {
  it('paints at 4/16, which is the hull\'s lower chamfer edge AND the lower card\'s bottom', () => {
    expect(SALAMANDER_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.25 })
    // 0.18125 + 0.25 x 1.250 = 0.49375, and 0.80625 - 0.3125 = 0.49375. The line
    // is where the flat flank stops and the underside chamfer starts, so the grey
    // is the underside and nothing above it.
    const line = HULL_BOTTOM_Y + 0.25 * 1.25
    expect(line).toBeCloseTo(HULL_C[1] - FLAT_HALF, 9)
    const g = build()
    expect(boxOf(g, 'blotch-lower-r').min.y)
      .toBeCloseTo(boxOf(g, 'hull').min.y + 0.25 * 1.25, 5)
    // §4's second way: no second shape, no split triangle, no geometry at all.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById('box-03')!.tris)
  })
})

describe('animal-salamander: what separates it from the newt, said honestly', () => {
  it('does NOT claim the tail does it', () => {
    // Both are small long-bodied amphibians wearing a whip off the back of the
    // same cube. Whatever shape donates it, that is one silhouette, and a claim
    // that the two tails read apart at 0.16 scale would be a claim nobody can
    // check. So the tail is placed for keep-out and for the donor transfer, and
    // the separation is spent elsewhere — which is what the next two assertions
    // are. This test exists to say that in a place it cannot be quietly dropped.
    expect(feature('tail').part).toBe('wedge-18')
    expect(SALAMANDER_ASSEMBLY.features.filter(f => f.name === 'tail')).toHaveLength(1)
  })

  it('separates on the EXTRA — eight yellow blotches, where the newt wears a crest', () => {
    const blotches = SALAMANDER_ASSEMBLY.features.filter(f => f.name.startsWith('blotch'))
    expect(blotches).toHaveLength(4)
    expect(blotches.every(f => f.placement.kind === 'pair')).toBe(true)
    // Four of the eight are on the BACK, which is the half that matters: the
    // island's camera looks down at these animals and a flank card is edge-on
    // from up there.
    const g = build()
    const dorsal = ['blotch-back-fore-r', 'blotch-back-fore-l',
      'blotch-back-aft-r', 'blotch-back-aft-l']
    for (const n of dorsal) expect(g.getObjectByName(n), n).toBeTruthy()
    // No crest, no ridge, no ears — a salamander has none of the three, and the
    // crest is the newt's whole claim to being a different animal.
    expect(SALAMANDER_ASSEMBLY.features.some(f => f.name.startsWith('spike'))).toBe(false)
    expect(SALAMANDER_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
  })

  it('separates on the BELLY too, and every colour is `garden.ts`\'s own signed-off one', () => {
    // §0: the names and the facts survive and are never regenerated. The four
    // colours here are the collection record's, re-pointed at this kit's slots —
    // `detail` is the loud yellow on the blotches, `accent` the deeper yellow on
    // the limbs, which is garden.ts's own "black with bright yellow limbs".
    const kit = speciesRecord('animal-salamander')!.build!.palette
    expect(SALAMANDER_ASSEMBLY.palette['coat']).toBe(kit.coat)
    expect(SALAMANDER_ASSEMBLY.palette['belly']).toBe(kit.belly)
    expect(SALAMANDER_ASSEMBLY.palette['mark']).toBe(kit.detail)
    expect(SALAMANDER_ASSEMBLY.palette['limb']).toBe(kit.accent)
    // Dark grey underneath. The newt's is orange, and that is the second half of
    // the separation — visible from the island's own three-quarter camera,
    // because the underside strip is what a low animal shows it.
    expect(SALAMANDER_ASSEMBLY.palette['belly']).toBe(0x53535d)
  })

  it('strains nothing, so it carries no flag', () => {
    expect(SALAMANDER_ASSEMBLY.flag).toBeUndefined()
  })
})
