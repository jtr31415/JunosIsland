/**
 * THE WING: that it is in the bank, and that wearing one is enough to flap.
 *
 * Joe, 4 August 2026: *"i need the wings from the parrot and the bee in as
 * primitives with the wing flap motion automatically applied. i need to update
 * all the flying bird drafts, but will do myself."*
 *
 * Two halves, and this file is both of them.
 *
 * ## 1. The shapes exist, and the ids they were given cannot move
 *
 * `wing` was declared in the role union from the beginning and censused at ten
 * instances across five species, but `BAKED_ROLES` deliberately left it out — so
 * every bird in the game improvises a wing out of `box-06`, the RABBIT'S EAR.
 * Baking it turns those ten instances into six shapes.
 *
 * The id-stability half is the important one, and it is not decoration. A part
 * id is `<form>-<NN>` handed out by a running counter to the groups that get
 * baked, so adding a role RENUMBERS everything after the first newly-eligible
 * group in each form. Doing it naively on 4 August moved:
 *
 *     box-31    the LION'S HULL   ->  the lion's mane band
 *     blade-03  the DOG'S NOSE    ->  the BEE'S WING
 *     box-23    the FOX'S BRUSH   ->  the fox's hull
 *
 * Every species names these ids as plain strings. Nothing fails to compile,
 * nothing fails to build, and the newt's five crest blades quietly become bee
 * wings — the first anyone would know is Joe looking at his daughter's island.
 * The COUNT does not catch it either: all 94 ids still existed afterwards, they
 * just meant different shapes.
 *
 * `NUMBERING_FROZEN_BY` in `parts-bank.ts` is the fix — new roles are numbered in
 * a second pass and can only append — and the anchors below are what would catch
 * it going wrong again. They are deliberately the three that DID move.
 *
 * ## 2. A wing flaps without being asked
 *
 * `withDefaultFlap` in `creature.ts`. The trigger is the PART'S ROLE and not the
 * feature's name, because the editor's push names an extra after the part it
 * wears — that is how the dormouse's tail became a feature called `wedge-07` —
 * so a name-based trigger would miss every wing Joe places in the editor, and
 * miss it silently: a flap that never attaches looks exactly like a bird nobody
 * animated.
 */
import { describe, it, expect } from 'vitest'
import { creatureSpec, type CreatureDef } from '../../src/island/species/parts'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'

/* ------------------------------------------------------------- the shapes --- */

describe('the pack\'s wings are in the bank', () => {
  it('bakes ten instances into six shapes, and names their donors', () => {
    const wings = PARTS_BANK.filter(p => p.roles.includes('wing'))
    expect(wings.map(p => p.id).sort())
      .toEqual(['blade-06', 'blade-07', 'box-42', 'box-43', 'wedge-19', 'wedge-20'])
    // All ten instances the census found are accounted for by those six.
    expect(wings.reduce((n, p) => n + p.provenance.length, 0)).toBe(10)
  })

  it('has the two Joe asked for, and they are shared rather than duplicated', () => {
    const donors = (id: string): readonly string[] =>
      partById(id)!.provenance.map(q => q.species).sort()

    /* THE BEE'S. The penguin's are the same geometry, which is why one shape
     * carries both — that is the clustering working, not a mix-up. */
    expect(donors('blade-06')).toEqual(['bee', 'penguin'])
    expect(donors('blade-07')).toEqual(['bee', 'penguin'])

    /* THE PARROT'S, and the reason it is filed under the chick: identical
     * geometry. A search for "the parrot's wing" that went by species name alone
     * would report it missing, so the provenance is what answers. */
    expect(donors('wedge-19')).toEqual(['chick', 'parrot'])
    expect(donors('wedge-20')).toEqual(['chick', 'parrot'])
  })

  it('mounts the bird\'s on the FLANK and the bee\'s on the BACK, both sunk', () => {
    /*
     * The two wings Joe asked for do not attach the same way, and that is
     * measured off the pack rather than decided here — it matters to anyone
     * placing one, because the join axis is what `at` is solved against.
     *
     *   the parrot's / chick's  x  — out of the side, a bird's shoulder
     *   the bee's / penguin's   y  — up off the back, an insect's thorax
     *
     * Both are sunk into the body, which is §3: nothing floats.
     */
    for (const id of ['wedge-19', 'wedge-20']) {
      expect(partById(id)!.attachment!.axis, `${id} is not a flank mount`).toBe('x')
    }
    for (const id of ['blade-06', 'blade-07']) {
      expect(partById(id)!.attachment!.axis, `${id} is not a back mount`).toBe('y')
    }
    for (const id of ['blade-06', 'blade-07', 'wedge-19', 'wedge-20']) {
      expect(partById(id)!.attachment!.sunkUnitsMean, `${id} floats`).toBeGreaterThan(0)
    }
  })
})

/* --------------------------------------------------------- the id anchors --- */

describe('baking a new role cannot renumber the parts that already exist', () => {
  it('holds the three ids that moved when this was done naively', () => {
    /*
     * If any of these three fails, STOP: the bank has been renumbered and every
     * species file that names a part now means something else. The fix is not to
     * update these numbers — it is `NUMBERING_FROZEN_BY` in `parts-bank.ts`.
     */
    const donor = (id: string): string => partById(id)!.provenance[0]!.species
    const role = (id: string): string => partById(id)!.provenance[0]!.role

    expect([donor('box-31'), role('box-31')], 'box-31 is not the lion\'s hull')
      .toEqual(['lion', 'hull'])
    expect([donor('blade-03'), role('blade-03')], 'blade-03 is not the dog\'s nose')
      .toEqual(['dog', 'nose'])
    expect([donor('box-23'), role('box-23')], 'box-23 is not the fox\'s brush')
      .toEqual(['fox', 'tail'])
  })

  it('leaves every id that a species names still pointing at a real shape', () => {
    // The general form of the above: a dangling id is the other way this fails.
    for (const p of PARTS_BANK) {
      expect(partById(p.id), `${p.id} does not resolve`).toBeTruthy()
      expect(p.provenance.length, `${p.id} has no donor`).toBeGreaterThan(0)
    }
  })
})

/* -------------------------------------------------------------- the flap --- */

const PALETTE = { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, nose: 0x4e361d }
const spec = (def: Omit<CreatureDef, 'palette'>): ReturnType<typeof creatureSpec> =>
  creatureSpec('test-wing-flap', { ...def, palette: PALETTE })

describe('a species that wears a wing flaps it, without saying so', () => {
  it('attaches a flap to a wing the editor named after its part', () => {
    /* The realistic case: this is exactly the shape `push.mjs` emits, with the
     * feature named `wedge-19` rather than `wing`. A name-based trigger finds
     * nothing here, which is the whole reason the role is what is asked. */
    const s = spec({
      extras: [{ part: 'wedge-19', name: 'wedge-19', kind: 'pair', at: [0.6, 0.9, 0] }],
    })
    expect(s.motion).toBeDefined()
    expect(s.motion!.map(m => m.kind)).toEqual(['flap'])
    expect(s.motion![0]!.parts).toEqual(['wedge-19'])
  })

  it('attaches it to a wing named `wing` too, which is what the drafts do', () => {
    const s = spec({
      extras: [{ part: 'blade-06', name: 'wing', kind: 'pair', at: [0.6, 0.9, 0] }],
    })
    expect(s.motion!.map(m => m.kind)).toEqual(['flap'])
    expect(s.motion![0]!.parts).toEqual(['wing'])
  })

  it('leaves a species alone that has already spoken for its wing', () => {
    /* No second flap fighting the first for the same channel — `resolveMotion`
     * fails the build for that, so this is also the test that the two features
     * do not collide. A species that deliberately says `wag` keeps `wag`. */
    const s = spec({
      extras: [{ part: 'wedge-19', name: 'wing', kind: 'pair', at: [0.6, 0.9, 0] }],
      motion: [{ kind: 'wag', parts: ['wing'] }],
    })
    expect(s.motion!.map(m => m.kind)).toEqual(['wag'])
  })

  it('adds nothing at all to an animal with no wing on it', () => {
    // The hedgehog case: no wing role anywhere, so no motion appears from here.
    const s = spec({ ears: { part: 'box-02' } })
    expect(s.motion).toBeUndefined()
  })

  it('does not mistake the rabbit\'s ear — the wing every bird wears today', () => {
    /* `box-06` is what the budgie, canary, lovebird and cockatiel improvise a
     * wing from, and it is filed as an EAR. Those four declare their own flap
     * explicitly, and this must not add a second one on top. */
    expect(partById('box-06')!.roles).toEqual(['ear'])
    const s = spec({
      extras: [{ part: 'box-06', name: 'wing', kind: 'pair', at: [0.6, 0.9, 0] }],
    })
    expect(s.motion).toBeUndefined()
  })
})
