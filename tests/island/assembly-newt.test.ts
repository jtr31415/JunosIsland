/**
 * The newt. Garden's amphibian, and the animal whose whole job is to not be the
 * salamander.
 *
 * The eight invariants every assembled species carries are `assertAssembly` in
 * `assembly-assert.ts` — one mass, lineage back to the bank, the absolute eye,
 * nothing at a node, rule 9's budgets, the shared texture, the measured pupil,
 * the leg row, height checked first. This file is what only a newt can say.
 *
 * **And the first thing it says is what does NOT separate the pair.**
 * `collections/garden.ts` names newt/salamander as confusable, and the honest
 * reading is that the TAILS will not do it: both animals want the pack's thin
 * family, both will end up with a tapering blade off the rump, and at 0.16 scale
 * nobody tells two whips apart. The separation is the EXTRA — a dorsal crest,
 * which changes the top edge of the silhouette, the one edge a tail never
 * touches — and the orange painted under the waterline. Every claim below is
 * about the crest, the belly, or about being clear that the tail is just a tail.
 */
/* The species module FIRST, and by path rather than through the barrel: it is
 * what puts the newt on the register, so this file builds the same animal
 * whatever else is or is not wired up alongside it. */
import { NEWT_ASSEMBLY } from '../../src/island/species/parts/assembled/animal-newt'
import { describe, it, expect } from 'vitest'
import * as THREE from 'three'
import { buildAssembled, EYE_CARD_Z, HULL_BOTTOM_Y, hullFrontZ } from '../../src/island/species/parts'
import { partById } from '../../src/island/species/parts/bank.generated'
import { assertAssembly } from './assembly-assert'

assertAssembly({
  id: 'animal-newt',
  parts: ['blade-03', 'box-01', 'box-31', 'plate-01', 'wedge-07'],
  height: 1.7062,
  verts: 422,
  tris: 617,
  // The tail is the biggest thing after the hull and it is a fifteenth of it.
  massRatio: 15,
  // Five: every crest blade is the dog's nose turned through two quarter turns,
  // and rule 4 as amended bakes both into the copy's vertices.
  spinsAtLeast: 5,
})

const build = (): THREE.Group => {
  const g = buildAssembled('animal-newt')
  g.updateMatrixWorld(true)
  return g
}
const box = (g: THREE.Group, name: string): THREE.Box3 =>
  new THREE.Box3().setFromObject(g.getObjectByName(name)!)
const crests = (): typeof NEWT_ASSEMBLY.features =>
  NEWT_ASSEMBLY.features.filter(f => f.name.startsWith('crest-'))

/** The hull's own back, which is where the crest is joined. */
const BACK_Y = 1.43125

describe('animal-newt: low is a HULL, not a ground clearance', () => {
  it('takes one of Kenney\'s own hulls at Kenney\'s own size, never a stretch', () => {
    /* A newt is long and low in life and the pack has no room for that at all:
     * a bare cube on standard legs is already 1.43125 against a floor of 1.43.
     *
     * This used to pin `box-31`, the lion's 1.125-deep body, as the way that was
     * paid for. Joe moved the animal onto `box-03` on 4 August. The claim worth
     * keeping is the one that survives him choosing a different hull: whatever
     * he picks, it is an AUTHORED shape used unmodified — no stretch — which is
     * rule 1's purest case and the thing a `stretchWhy` would have to excuse. */
    expect(partById(NEWT_ASSEMBLY.hull.part), 'the hull is not a bank shape').toBeTruthy()
    expect(NEWT_ASSEMBLY.hull.stretch).toBeUndefined()
    // Same bottom as every other hull, so the leg row did not have to move.
    expect(box(build(), 'hull').min.y).toBeCloseTo(HULL_BOTTOM_Y, 3)
  })

  it('leaves the eye card at the absolute plane, floating proud of a 0.500 face', () => {
    // The constant that looks wrong and is not. `box-31`'s front face is 0.500,
    // the card is still at 0.6350, and it therefore stands 0.135 clear — which
    // is exactly what the lion does with its own hull. Never "corrected".
    expect(hullFrontZ('box-31')).toBe(0.5)
    const eye = NEWT_ASSEMBLY.features.find(f => f.name === 'eye')!
    if (eye.placement.kind === 'pair') expect(eye.placement.at[2]).toBe(EYE_CARD_Z)
    expect(EYE_CARD_Z - hullFrontZ('box-31')).toBeCloseTo(0.135, 6)
    // Gold, not orange: the pale slot on this animal is its belly, and a great
    // crested newt's iris is golden.
    expect(eye.paint.base).toBe('accent')
    expect(NEWT_ASSEMBLY.palette['accent']).toBe(0xe0b23f)
  })
})

describe('animal-newt: the tail is a swimming tail, and it is NOT the difference', () => {
  it('is the bank\'s thinnest tail, which is what a newt sculls with', () => {
    const whip = partById('wedge-07')!
    // §7 splits the pack's seven tails on THICKNESS, not length. This is the
    // thin end of the thin family: 0.200 across against 1.047 tall, so it is a
    // laterally flattened blade rather than a rope.
    expect(whip.size[0]).toBeCloseTo(0.2, 6)
    expect(whip.size[1] / whip.size[0]!).toBeGreaterThan(5)
    const built = box(build(), 'tail').getSize(new THREE.Vector3())
    expect(built.x).toBeCloseTo(0.2, 4)
    expect(built.y).toBeCloseTo(1.046587, 4)
  })

  it('leaves the body on the body\'s own axis, not up on the rump', () => {
    const whip = partById('wedge-07')!
    const tail = NEWT_ASSEMBLY.features.find(f => f.name === 'tail')!
    // Joined at THIS hull's rear face, at the hull's OWN recorded centre height.
    // The donor transfer would have left it at the cat's 1.186701, carried up;
    // a newt's tail is its spine continuing, so it goes out on the spine.
    if (tail.placement.kind === 'single') {
      expect(tail.placement.at).toEqual([0, 0.80625, -0.625])
      expect(tail.placement.at[1]).not.toBeCloseTo(whip.offset[1]!, 3)
    }
    // Everything else is the pack's own: its measured mean burial over its two
    // donors, and no spin and no stretch at all.
    expect(tail.sink).toBeCloseTo(whip.attachment!.sunkFractionMean, 9)
    expect(tail.spin).toBeUndefined()
    expect(tail.stretch).toBeUndefined()
    // It clears the ground by a third of the animal rather than dragging.
    expect(box(build(), 'tail').min.y).toBeGreaterThan(0.25)
  })

  it('carries no ears, which is true of the salamander too and separates nothing', () => {
    // Said out loud because it is the thing a reader would otherwise assume was
    // doing work. No amphibian in this collection has an external ear, so the
    // pair cannot be told apart on the first axis the brief usually reaches for.
    expect(NEWT_ASSEMBLY.features.some(f => f.name === 'ear')).toBe(false)
  })
})

describe('animal-newt: the crest is the dog\'s NOSE, and §3.1 is why that is allowed', () => {
  it('wears a shape the bank files under `nose`, turned until it is a fin', () => {
    const blade = partById('blade-03')!
    // The bank names shapes for what they ARE and records what they were. This
    // one's only donor is the dog, and its only role is `nose`.
    expect(blade.roles).toEqual(['nose'])
    expect(blade.provenance.map(p => p.species)).toEqual(['dog'])
    expect(blade.attachment!.axis).toBe('z')
    expect(blade.attachment!.dir).toBe(1)
    // 0.400 x 0.321 x 0.100 — a blade, and its 0.100 is the axis a crest has to
    // be thin on.
    expect(blade.size[0]).toBeCloseTo(0.4, 6)
    expect(blade.size[2]).toBeCloseTo(0.1, 6)
  })

  it('stands it on end so the THIN axis becomes the animal\'s width', () => {
    const g = build()
    for (const f of crests()) {
      // Two quarter turns, baked into the copy's vertices (rule 4 as amended).
      expect(f.spin).toEqual([{ axis: 'z', deg: 90 }, { axis: 'y', deg: 90 }])
      // And the attachment override that goes with them: the part's measured
      // `z +1` lands on `+x` under that pair, so `axis: 'x'` is what points the
      // facing at the direction the fin actually grows — straight up.
      expect(f.axis).toBe('x')
      const m = g.getObjectByName(f.name)!
      expect(m.userData['facing']).toEqual([0, 1, 0])
      // The built blade, measured: 0.100 across, 0.400 tall, 0.321 along the
      // back. If this ever comes back 0.400 across it is a plate lying on the
      // animal's back, not a crest.
      const s = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3())
      expect(s.x).toBeCloseTo(0.1, 4)
      expect(s.y).toBeCloseTo(0.4, 4)
      expect(s.z).toBeCloseTo(0.320711, 3)
      expect(f.stretch).toBeUndefined()
    }
  })

  it('is five copies of ONE shape at ONE size — the taper is DEPTH', () => {
    const c = crests()
    expect(c).toHaveLength(5)
    expect(new Set(c.map(f => f.part))).toEqual(new Set(['blade-03']))
    // The five sinks are five different numbers, and that is the whole argument
    // for `extras` over `ridge:`: a row is one shape at one depth repeated along
    // a line, so a row could not have made this crest rise and fall. (It could
    // not have made it stand up either — a ridge row takes its facing from the
    // part's own attachment axis and has no override.)
    expect(c.map(f => f.sink)).toEqual([0.5, 0.375, 0.3125, 0.4375, 0.5625])
    expect(new Set(c.map(f => f.sink)).size).toBe(5)
    // §3.1: depth is a dial, not a floor — but never below the pack's own 0.125
    // for an embedded part, which is what stops a blade reading as loose.
    for (const f of c) expect((f.sink ?? 0) * 0.4).toBeGreaterThanOrEqual(0.125 - 1e-9)
  })

  it('rises off the head, peaks over the hull\'s centre and falls to the tail', () => {
    const g = build()
    const proud = crests().map(f => new THREE.Box3().setFromObject(
      g.getObjectByName(f.name)!).max.y - BACK_Y)
    // The profile, in millimetres of the pack's own units. Front to back.
    expect(proud.map(v => Math.round(v * 1000) / 1000))
      .toEqual([0.2, 0.25, 0.275, 0.225, 0.175])
    // A crest, therefore, and not a fence: it goes up and then it comes down.
    expect(Math.max(...proud)).toBeCloseTo(proud[2]!, 9)
    expect(proud[4]).toBeLessThan(proud[0]!)
  })

  it('spaces them 3/16 apart so they overlap into ONE fin', () => {
    const at = crests().map(f => (f.placement.kind === 'single' ? f.placement.at[2] : NaN))
    expect(at).toEqual([0.3125, 0.125, -0.0625, -0.25, -0.4375])
    /* Every station is on the pack's 1/16 grid, and the five are evenly spaced.
     * The row used to be asserted as centred on the hull's own z as well; that
     * stopped being true on 4 August when Joe moved the newt from `box-31` (z
     * centre -0.0625) onto `box-03` (z centre 0) and left the crest where it
     * was. The crest is carried slightly forward of the hull's middle now, which
     * is his call — the spacing below is what makes it read as one fin. */
    for (const z of at) expect(Number.isInteger(z * 16)).toBe(true)
    // Spacing 0.1875 against a blade 0.3208 long: they overlap, on purpose, so
    // the five read as a continuous wavy fin rather than as five fence posts.
    expect(at[0]! - at[1]!).toBeCloseTo(3 / 16, 9)
    expect(3 / 16).toBeLessThan(partById('blade-03')!.size[1]!)
  })

  it('keeps every blade EMBEDDED, checked at its far CORNER and not its station', () => {
    const g = build()
    const hull = box(g, 'hull')
    /* `box-31`'s flat top runs to z = +/-0.375 of its own centre and its y/z
     * chamfer then falls 0.125 over 0.1875. A blade is 0.321 long, so its outer
     * corner reaches past the flat face even when its station does not — which
     * is the case §8 step 4 says a build gets wrong by checking the station. */
    const surfaceY = (z: number): number => {
      const local = Math.abs(z - NEWT_ASSEMBLY.hull.at[2])
      const drop = local <= 0.375 ? 0 : ((local - 0.375) / 0.1875) * 0.125
      return hull.max.y - drop
    }
    for (const f of crests()) {
      const b = new THREE.Box3().setFromObject(g.getObjectByName(f.name)!)
      const far = Math.abs(b.min.z - NEWT_ASSEMBLY.hull.at[2])
        > Math.abs(b.max.z - NEWT_ASSEMBLY.hull.at[2]) ? b.min.z : b.max.z
      // The blade's base is under the hull's surface at its own worst corner,
      // by a real margin rather than by a rounding.
      expect(surfaceY(far) - b.min.y, `${f.name} floats at z = ${far}`)
        .toBeGreaterThan(0.05)
    }
  })

  it('is what makes the animal 1.7062 — the top of the silhouette is the fin', () => {
    const g = build()
    const whole = new THREE.Box3().setFromObject(g)
    // The hull's own back is 1.43125, the pack's floor, and every millimetre
    // above it is crest. That is the separation from the salamander stated as a
    // measurement: it is on the TOP edge, which is the edge a tail cannot reach.
    expect(box(g, 'hull').max.y).toBeCloseTo(BACK_Y, 3)
    expect(whole.max.y - BACK_Y).toBeCloseTo(0.275, 3)
    expect(whole.max.y - whole.min.y).toBeCloseTo(1.7062, 4)
  })
})

describe('animal-newt: the orange is PAINTED, and it is an underside', () => {
  it('patches the coat at 6/16, deliberately below the tiger\'s mammal line', () => {
    // §4's second way. 8/16 is the tiger's own belly boundary made exact and it
    // is where the mouse and the squirrel put theirs — but that line paints a
    // pale FLANK, and a great crested newt's orange is strictly underneath.
    expect(NEWT_ASSEMBLY.hull.paint.patch).toEqual({ below: 'belly', at: 0.375 })
    expect(NEWT_ASSEMBLY.hull.paint.patch!.at).not.toBe(0.5)
    expect(NEWT_ASSEMBLY.palette['belly']).toBe(0xe8992c)
  })

  it('costs no geometry: the same shape Kenney drew, with one seam split', () => {
    // Read off the hull the species actually wears, so it survives Joe changing
    // it — which he did on 4 August, from `box-31` to `box-03`.
    const hull = build().getObjectByName('hull') as THREE.Mesh
    expect(hull.geometry.getIndex()!.count / 3).toBe(partById(NEWT_ASSEMBLY.hull.part)!.tris)
  })

  it('paints the legs and the crest from the dark slot, not the coat', () => {
    const dark = NEWT_ASSEMBLY.palette['detail']
    expect(dark).toBe(0x35322a)
    expect(NEWT_ASSEMBLY.features.find(f => f.name === 'leg')!.paint.base).toBe('detail')
    for (const f of crests()) expect(f.paint.base).toBe('detail')
  })
})

describe('animal-newt: what it costs', () => {
  it('strains nothing, so it carries no flag', () => {
    expect(NEWT_ASSEMBLY.flag).toBeUndefined()
    expect(NEWT_ASSEMBLY.features.every(f => !f.part.startsWith('bespoke-'))).toBe(true)
  })

  it('fits between two trees — the tail is the length, and it is under the fox\'s', () => {
    const s = new THREE.Box3().setFromObject(build()).getSize(new THREE.Vector3())
    // `pets.ts:652` charges keep-out from max(width, depth) / 2. The tail is the
    // whole of the depth here. The fox's own 1.15 is the constraint; the exact
    // figure is not pinned, since it moves whenever Joe re-sites the tail.
    expect(Math.max(s.x, s.z) / 2).toBeLessThan(1.15)
  })
})
