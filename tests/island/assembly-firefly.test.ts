/**
 * The firefly. Night Time's first insect, and the first species anywhere in this
 * repo built around a part the bank does NOT have.
 *
 * The invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a firefly can say,
 * and it is four things:
 *
 *   1. **The wing absence is MEASURED, not asserted.** `wing` is a declared
 *      `PartRole` with zero records in all 94, and the day somebody bakes one
 *      this test goes red so the absence cannot change quietly underneath the
 *      argument this species is built on.
 *   2. **The lantern is the bank's only REAR-worn band**, and the two concentric
 *      ones were refused for a reason that is an axis rather than a taste.
 *   3. **Rule 3 is why it is halved**, and a uniform shrink provably cannot do it.
 *   4. **Rule 9's vertex FLOOR is what this animal is shaped by** — the same
 *      species without its lamp is built here and measured under it.
 */
/* The species module FIRST, and deliberately: it registers itself as it defines
 * its build (see `assembled/register.ts`), so importing it here is what puts it
 * on the register before `parts/index.ts` snapshots `ASSEMBLED_BUILDS` below. */
import { FIREFLY_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-firefly'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import {
  buildAssembled, buildAssembly, creatureSpec, MODEL_VERTS_MIN, EYE_CARD_Z,
} from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-firefly',
  parts: ['box-01', 'box-18', 'box-35', 'box-36', 'cone-01', 'plate-03', 'plate-14'],
  // The antennae are the tallest thing on it: cone-01's own recovered centre
  // 1.506428 plus half its own 0.400356.
  height: 1.7066,
  verts: 446,
  tris: 614,
  // The lantern ring is the biggest thing after the hull, and 4.35 is exactly the
  // number the halving below was solved for. See the rule 3 test.
  massRatio: 4,
  // One: the tip is turned a half turn so the bank's `z +1` stub faces the rear.
  spinsAtLeast: 1,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-firefly')
  g.updateMatrixWorld(true)
  return g
}
const boxOf = (o: THREE.Object3D): THREE.Box3 => new THREE.Box3().setFromObject(o)
const sizeOf = (o: THREE.Object3D): THREE.Vector3 =>
  boxOf(o).getSize(new THREE.Vector3())
/** Half a shape's own vertex extent on one axis — the exact number, not `size`. */
const outer2d = (p: { positions: readonly number[] }, axis: 0 | 1): number => {
  let out = 0
  for (let i = axis; i < p.positions.length; i += 3) out = Math.max(out, Math.abs(p.positions[i]!))
  return out
}
const vertsOf = (g: THREE.Object3D): number => {
  let n = 0
  g.traverse(o => {
    const m = o as THREE.Mesh
    if (m.isMesh) n += m.geometry.getAttribute('position').count
  })
  return n
}

describe('animal-firefly: the wing the bank does not have', () => {
  it('THE WING ARRIVED — 4 August — and horn and claw are still missing', () => {
    /*
     * This test used to assert the opposite, and it was written to go red on
     * exactly this day: *"A `wing` record arriving is a good thing — it unblocks
     * three species — and it should arrive as a red test rather than as a
     * silently stale argument."* It did. This is that argument, updated.
     *
     * Joe, 4 August: *"i need the wings from the parrot and the bee in as
     * primitives with the wing flap motion automatically applied."* `wing` was
     * declared in the role union, censused at 10 instances across 5 species, and
     * deliberately left out of `BAKED_ROLES`. It is baked now, and the ten
     * instances cluster into six shapes:
     *
     *     blade-06 / blade-07   the BEE's wings   (the penguin's are identical)
     *     wedge-19 / wedge-20   the CHICK's       (the PARROT's are identical)
     *     box-42   / box-43     the fish's
     *
     * `horn` and `claw` are still declared-and-absent, so the bat, the sugar
     * glider and the scorpion are still blocked — on those two, no longer on
     * this one.
     */
    const wings = PARTS_BANK.filter(p => p.roles.includes('wing'))
    expect(wings.map(p => p.id).sort())
      .toEqual(['blade-06', 'blade-07', 'box-42', 'box-43', 'wedge-19', 'wedge-20'])
    for (const absent of ['horn', 'claw'] as const) {
      expect(PARTS_BANK.filter(p => p.roles.includes(absent)), absent).toHaveLength(0)
    }
    // And the pack's own birds DID donate, which is where the parrot's went.
    const donors = new Set(wings.flatMap(p => p.provenance.map(q => q.species)))
    expect(donors).toContain('parrot')
    expect(donors).toContain('bee')
  })

  it('does not need one: nothing on this animal stands in for a wing', () => {
    // The collection's line is that a species blocked on a missing part is left
    // unbuilt and a species merely MISSING it is built and flagged. A firefly
    // signals at rest with its hindwings folded away under closed elytra, so the
    // pose this is modelled in has no visible wing at all — and nothing here was
    // bent into the shape of one. Every feature is a lamp, a sense organ or a leg.
    expect(FIREFLY_ASSEMBLY.features.map(f => f.name).sort())
      .toEqual(['antenna', 'eye', 'lantern', 'leg', 'mouth', 'tip'])
    // The flag carries both halves where Joe reads them: what cannot be said, and
    // that the bank has no wing.
    expect(FIREFLY_ASSEMBLY.flag).toMatch(/NO WING/i)
    expect(FIREFLY_ASSEMBLY.flag).toMatch(/ELYTRA/i)
    expect(FIREFLY_ASSEMBLY.flag).toMatch(/UNREVIEWED/)
  })

  it('cannot say the elytral seam either, and the hull\'s bands are why', () => {
    // `byBand` can only cut where Kenney already cut. `box-36` has TWO bands,
    // which looks like the seam and is not: band 3 is 28 scattered chamfer facets
    // whose points span BOTH flanks and BOTH ends, so no band is the left wing
    // case and none is the right. Measured here so the flag is checkable.
    const hull = partById('box-36')!
    const bands = [...new Set(hull.bands)].sort((a, b) => a - b)
    expect(bands).toEqual([3, 15])
    const xs: number[] = []
    for (let t = 0; t < hull.tris; t++) {
      if (hull.bands[t] !== 3) continue
      for (let k = 0; k < 3; k++) xs.push(hull.positions[hull.indices[t * 3 + k]! * 3]!)
    }
    // Both signs, symmetric: band 3 is not a side, so it is not a wing case.
    expect(Math.min(...xs)).toBeCloseTo(-Math.max(...xs), 6)
    expect(Math.max(...xs)).toBeGreaterThan(0.6)
  })
})

describe('animal-firefly: the lamp is the animal', () => {
  it('takes the bank\'s ONLY rear-worn band, and the axis is the whole argument', () => {
    // Five shapes carry the `band` role. The lantern is the one that joins on the
    // REAR; the other four are worn concentric or on the front, and a firefly's
    // light is at the tail and nowhere else. This is the refusal recorded in the
    // species file, made checkable: `box-04` (the bee's abdomen segment, which
    // the slow worm wears as a coil) and `box-11` (the caterpillar's, which the
    // glow-worm wears three times) would both cut this animal at the WAIST.
    const bands = PARTS_BANK.filter(p => p.roles.includes('band'))
    expect(bands.map(p => p.id).sort()).toEqual(['box-04', 'box-11', 'box-19', 'box-29', 'box-35'])
    const rear = bands.filter(p => p.attachment?.axis === 'z' && p.attachment.dir === -1)
    expect(rear.map(p => p.id)).toEqual(['box-35'])
    expect(partById('box-04')!.attachment!.axis).toBe('x')
    expect(partById('box-11')!.attachment!.axis).toBe('y')
    // And nothing else in the repo had spent it: the panda drew it, nobody wore it.
    expect(partById('box-35')!.provenance.map(p => p.species)).toEqual(['panda'])
  })

  it('is a RIM, and its 0.0467 of proud ring is the entire read', () => {
    const ring = partById('box-35')!
    // Measured off the raw positions: every one of its 48 vertices lies between
    // radius 0.695 and 0.754 and there is nothing at all inside that. It is an
    // open rim, not a disc — which is exactly why it can be worn fully buried
    // along its own axis and still be the brightest thing on the animal.
    let inner = Infinity, outer = 0, n = 0
    for (const vi of new Set(ring.indices)) {
      n += 1
      const r = Math.hypot(ring.positions[vi * 3]!, ring.positions[vi * 3 + 1]!)
      if (r < inner) inner = r
      if (r > outer) outer = r
    }
    expect(n).toBe(48)
    expect(inner).toBeCloseTo(0.6953, 4)
    expect(outer).toBeCloseTo(0.7543, 4)

    const g = build()
    const lantern = sizeOf(g.getObjectByName('lantern')!)
    const hull = sizeOf(g.getObjectByName('hull')!)
    // Untouched on x and y — the two axes that make it show — so it stands
    // 0.0467 proud of a 1.250 hull all the way round. Checked against the
    // shape's OWN VERTICES rather than its `size` field, which is the exact
    // claim: the bank rounds `positions` to four decimals and `size` to six, so
    // a built 1.343400 against a recorded 1.343347 is the pack's own rounding
    // and not a scale. `assembly-assert.ts` makes the same distinction on hulls.
    expect(lantern.x).toBeCloseTo(2 * outer2d(ring, 0), 5)
    expect(lantern.y).toBeCloseTo(2 * outer2d(ring, 1), 5)
    expect(lantern.x).toBeCloseTo(ring.size[0]!, 3)
    expect((lantern.x - hull.x) / 2).toBeCloseTo(0.0467, 4)
    // And fully inside the hull along its OWN axis, flush on the rear face: sunk
    // its recorded 1.000, which is what a band worn on the rear means.
    const box = boxOf(g.getObjectByName('lantern')!)
    const hullBox = boxOf(g.getObjectByName('hull')!)
    expect(ring.attachment!.sunkFractionMean).toBe(1)
    expect(box.min.z).toBeCloseTo(hullBox.min.z, 6)
    expect(box.max.z).toBeLessThan(hullBox.max.z)
  })

  it('halves the ring for RULE 3, and a uniform shrink provably could not', () => {
    const ring = partById('box-35')!
    const hull = partById('box-36')!
    const hullVol = hull.size[0]! * hull.size[1]! * hull.size[2]!
    // At its own thickness the hoop's bounding box is 0.897 against the hull's
    // 1.953 — a ratio of 2.18, under the 3 `assertAssembly` demands, because a
    // hoop's bounding box is mostly hole. That reading is what forced the stretch.
    const own = ring.size[0]! * ring.size[1]! * ring.size[2]!
    expect(hullVol / own).toBeCloseTo(2.175, 3)
    expect(hullVol / own).toBeLessThan(3)
    // A UNIFORM shrink cannot fix it: k^3 * own < hullVol / 3 wants k < 0.8984,
    // and at that k the hoop is 1.207 across — inside the hull's own 1.250, so it
    // stands proud of nothing. This is the measurement behind the one non-uniform
    // stretch on the animal, and the flag says so.
    const k = Math.cbrt(hullVol / (3 * own))
    expect(k).toBeCloseTo(0.8984, 4)
    expect(ring.size[0]! * k).toBeLessThan(hull.size[0]!)
    // Thinned instead, on the one axis that is not the read: 0.5, which is
    // `animal-tortoise.ts`'s own halving of `box-19` for this same rule.
    const lantern = FIREFLY_ASSEMBLY.features.find(f => f.name === 'lantern')!
    expect(lantern.stretch).toEqual([1, 1, 0.5])
    const built = sizeOf(build().getObjectByName('lantern')!)
    expect(hullVol / (built.x * built.y * built.z)).toBeCloseTo(4.3498, 4)
    expect(hullVol / (built.x * built.y * built.z)).toBeGreaterThan(3)
    // It is the ONLY stretch on the animal.
    expect(FIREFLY_ASSEMBLY.features.filter(f => f.stretch !== undefined)).toHaveLength(1)
  })

  it('puts the tip where a resting firefly\'s lit segments actually are', () => {
    // At rest the elytra cover the whole abdomen except the last two segments,
    // which protrude past them and are the ones that light up. `box-18` is the
    // bank's only stub — measured `z +1` at a burial of exactly zero, Kenney's
    // elephant trunk under the bank's wrong name — so a half turn puts it on the
    // rear face reaching its own 0.4252 clear of the body.
    const stub = partById('box-18')!
    expect(stub.attachment!.axis).toBe('z')
    expect(stub.attachment!.dir).toBe(1)
    expect(stub.attachment!.sunkFractionMean).toBe(0)
    const tip = FIREFLY_ASSEMBLY.features.find(f => f.name === 'tip')!
    expect(tip.spin).toEqual([{ axis: 'y', deg: 180 }])
    const g = build()
    const box = boxOf(g.getObjectByName('tip')!)
    const hullBox = boxOf(g.getObjectByName('hull')!)
    expect(box.max.z).toBeCloseTo(hullBox.min.z, 6)
    expect(hullBox.min.z - box.min.z).toBeCloseTo(stub.size[2]!, 4)
    // Hung at the hull's OWN centre, which is the badger's solved bound: the flat
    // rear face runs 0.49375 to 1.11875, and 0.6230 of stub centred on 0.80625 is
    // the one height that fits inside it — 0.001 to spare at each end.
    expect(box.min.y).toBeGreaterThan(0.80625 - 0.3125)
    expect(box.max.y).toBeLessThan(0.80625 + 0.3125)
    // Ring and tip are painted from the SAME slot, so they read as one lamp.
    const lantern = FIREFLY_ASSEMBLY.features.find(f => f.name === 'lantern')!
    expect(tip.paint).toEqual({ base: 'glow' })
    expect(lantern.paint).toEqual({ base: 'glow' })
    // And nothing else on the animal is lit.
    for (const f of FIREFLY_ASSEMBLY.features) {
      if (f.name !== 'tip' && f.name !== 'lantern') expect(f.paint.base).not.toBe('glow')
    }
  })
})

describe('animal-firefly: rule 9\'s FLOOR is what shaped this animal', () => {
  it('is UNDER the vertex floor without its lamp, which is why the lamp is two parts', () => {
    // The same species with the ring and the tip taken off. `creatureSpec` builds
    // the spec without registering it, so this costs no invented pet.
    //
    // What is left is the pack's own insect: a hull, antennae, eye cards, a face
    // card and four legs. It clears the TRIANGLE floor comfortably and fails the
    // VERTEX floor, which is the trap the goldfish documented and the opposite way
    // round from what it looks like. The bank's `verts` field is RAW and the built
    // geometry is welded on position and normal, so estimating from the bank tells
    // you you are fine when you are not.
    const bare = creatureSpec('animal-firefly', {
      palette: FIREFLY_ASSEMBLY.palette,
      hull: 'box-36',
      belly: 0.375,
      ears: { part: 'cone-01', name: 'antenna', paint: 'limb' },
      eyes: { part: 'plate-14' },
      extras: [{ name: 'mouth', part: 'plate-03', paint: 'pupil', at: [0, 0.686849, EYE_CARD_Z] }],
    })
    const g = buildAssembly(bare)
    g.updateMatrixWorld(true)
    expect(vertsOf(g)).toBe(350)
    expect(vertsOf(g)).toBeLessThan(MODEL_VERTS_MIN)
    // And neither part alone would have paid it: 350 + 48 is still 398.
    expect(350 + partById('box-35')!.tris).toBeGreaterThan(0) // (bank tris are not the count)
    expect(350 + 48).toBeLessThan(MODEL_VERTS_MIN)
    expect(vertsOf(build())).toBe(446)
  })

  it('buys its hull\'s geometry without changing its silhouette', () => {
    // `box-36` is the panda's cube and it is the same 1.250 shell as the default
    // `box-03`: same size on all three axes, same bottom, same front face. It
    // costs 72 triangles against 60 — which on an animal threatened by the FLOOR
    // is geometry wanted rather than wasted, the goldfish's own argument for
    // `box-20`. The lineage is the real reason: the lantern is this hull's own
    // donor pair, so the two are worn together the way Kenney built them.
    const here = partById('box-36')!, cube = partById('box-03')!
    expect(here.size).toEqual(cube.size)
    expect(here.offset).toEqual(cube.offset)
    expect(here.tris).toBeGreaterThan(cube.tris)
    expect(here.provenance.map(p => p.species)).toEqual(['panda'])
    expect(partById('box-35')!.provenance.map(p => p.species)).toEqual(['panda'])
    expect(partById('plate-14')!.provenance.map(p => p.species)).toEqual(['panda'])
  })
})

describe('animal-firefly: the face, and the transfer that proves itself', () => {
  it('recovers cone-01\'s own recorded centre, which was never an input', () => {
    // THE DONOR TRANSFER (§8). The antennae are given no `at` and no `sink`, so
    // the builder joins them at this hull's top face and sinks them the shape's
    // own measured 0.312222 — and the centre that falls out is the bank's recorded
    // offset for the shape, which was never an input. That agreement is the
    // evidence the transfer is legitimate rather than a copy.
    const cone = partById('cone-01')!
    const g = build()
    const p = g.getObjectByName('antenna-r')!.getWorldPosition(new THREE.Vector3())
    // x and z are the two coordinates the join does not move: exact.
    expect(p.x).toBeCloseTo(cone.offset[0]!, 6)
    expect(p.z).toBeCloseTo(cone.offset[2]!, 6)
    // y is the one it solves, and it lands 0.000021 under the record. That is the
    // bank's own rounding and not a placement bug — the sink is a fraction of the
    // shape's own VERTEX extent along its facing (0.400400), not of the 0.400356
    // in the rounded `size` summary. `animal-slow-worm.ts`'s test pins the same
    // fourth-decimal disagreement on `box-08`, for the same reason.
    expect(p.y).toBeCloseTo(cone.offset[1]!, 4)
    expect(Math.abs(p.y - cone.offset[1]!)).toBeLessThan(1e-4)
    const extent = g.getObjectByName('antenna-r')!.userData['extent'] as number
    expect(extent).toBeCloseTo(0.4004, 6)
    expect(extent).not.toBeCloseTo(cone.size[1]!, 6)
    // It is the bee's and the caterpillar's own antenna — the pack's two insects —
    // and a true point, taper 0.000.
    expect([...new Set(cone.provenance.map(q => q.species))].sort())
      .toEqual(['bee', 'caterpillar'])
    // And they are what the animal's height is.
    expect(boxOf(g).max.y).toBeCloseTo(1.706607, 5)
  })

  it('wears the biggest eye card in the pack, and nothing had spent it', () => {
    // Rule 5 forbids stretching one, so `plate-14` is as big as an eye is allowed
    // to get: 0.435 x 0.443 against the default oval's 0.400 x 0.320. A firefly's
    // compound eyes take up nearly the whole head, and this is Night Time.
    const cards = PARTS_BANK.filter(p => p.roles.includes('eye'))
    const area = (p: typeof cards[number]): number => p.size[0]! * p.size[1]!
    const biggest = cards.slice().sort((a, b) => area(b) - area(a))[0]!
    expect(biggest.id).toBe('plate-14')
    const eye = FIREFLY_ASSEMBLY.features.find(f => f.name === 'eye')!
    expect(eye.part).toBe('plate-14')
    // Absolute size and absolute z, and this species chose neither: the card's own
    // recorded (0.258676, 0.920023) on the plane all 48 cards in the pack share.
    if (eye.placement.kind === 'pair') {
      expect(eye.placement.at[0]).toBeCloseTo(biggest.offset[0]!, 6)
      expect(eye.placement.at[1]).toBeCloseTo(biggest.offset[1]!, 6)
      expect(eye.placement.at[2]).toBe(EYE_CARD_Z)
    }
  })

  it('is a BEETLE and not the glow-worm, which is the same insect grown up', () => {
    // The two are one animal at two life stages and they must not be one model.
    // This one is a compact hard-shelled beetle: no segmentation anywhere, the
    // pack's BIGGEST eye, and long antennae. `assembly-glow-worm.test.ts` says the
    // other half of this, both ways round, so neither can drift into the other.
    const worn = new Set(FIREFLY_ASSEMBLY.features.map(f => f.part))
    // `box-11` repeated is what segmentation IS in this kit, and it is the whole
    // of the grub's read. A beetle's back is one smooth shell.
    expect(worn.has('box-11')).toBe(false)
    // No ridge either: a `ridge` builds `<name>-top`, `<name>-chamfer` and
    // `<name>-side` rows, and there is not one repeated row on this animal.
    expect(FIREFLY_ASSEMBLY.features.filter(f => f.placement.kind === 'row'))
      .toHaveLength(1)
    expect(FIREFLY_ASSEMBLY.features.find(f => f.placement.kind === 'row')!.name).toBe('leg')
    // The smallest eye card in the pack is the larva's, not this animal's.
    expect(worn.has('plate-06')).toBe(false)
    // Every feature part appears exactly once except the legs and the eyes, which
    // are a row and a pair: nothing on this animal repeats along the body.
    const singles = FIREFLY_ASSEMBLY.features.filter(f => f.placement.kind === 'single')
    expect(singles.map(f => f.part).sort()).toEqual(['box-18', 'box-35', 'plate-03'])
  })
})
