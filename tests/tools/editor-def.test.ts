/**
 * The species editor's edit model — the CONTRACT, on a real definition.
 *
 * Four dead features shipped in this repo behind tests that only proved a mock
 * ran, so nothing below asserts that a function was called. Every `it` here
 * either builds the definition an operation produced, or measures the thing the
 * operation claims about it.
 *
 * The claims worth the file, in the order they would hurt:
 *
 *   1. **EVERY OP LEAVES A BUILDABLE DEFINITION.** An editor whose drag handle
 *      can produce a species that throws at module load is an editor that breaks
 *      `src/` from a mouse gesture. So each op runs against a real definition on
 *      real bank shapes and the result goes through `creatureSpec` — the same
 *      function `defineCreature` calls, with all thirteen rule checks in it.
 *   2. **A PICK RESOLVES.** `pathFromUserData` is checked against the `userData`
 *      of a REAL `buildAssembly` run, mesh by mesh, rather than against a
 *      hand-typed record that could drift from what the kit actually writes.
 *   3. **OPS ARE PURE.** One snapshot, taken before, compared after everything.
 *      Undo is a stack of old objects and nothing else.
 *   4. **RULE 6 SURVIVES A MIRROR BUTTON.** `setMirrored(true)` sets `kind:
 *      'pair'` — one mesh placed twice — and does not add a second part.
 *   5. **EACH WARNING FIRES, AND EACH ONE STAYS QUIET.** A warning that cannot
 *      be shown not firing is a warning nobody should trust.
 */
import { describe, it, expect } from 'vitest'
import {
  addPaletteSlot, cloneAs, defFrom, defToModuleSource, deletePart, duplicatePart, listParts,
  partAt, pathFromUserData, pathKey, setJoin, setMirrored, setPaint, setPaletteColour,
  setPartShape, setSpin, setStretch, uniqueExtraName, warningsFor,
} from '../../tools/workbench/public/editor/def'
import type { DefPath } from '../../tools/workbench/public/editor/def'
import { buildAssembly, creatureSpec } from '../../src/island/species/parts'
import type { CreatureDef, PartDef } from '../../src/island/species/parts'
import { EYE_CARD_Z, LEG_ROW } from '../../src/island/species/parts/hulls'

const ID = 'animal-test'

/**
 * A real species, on real bank shapes: the 1.250 cube, the hog's ear, the
 * parrot's beak, a two-station ridge and one extra. Deliberately not a fixture
 * of empty objects — every id below is one the pack itself drew, so
 * `creatureSpec` has something to check.
 */
const BASE: CreatureDef = {
  palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, tip: 0x4e361d },
  eyes: { y: 0.95, paint: 'belly' },
  ears: { part: 'cone-04' },
  snout: { part: 'cone-06' },
  ridge: { part: 'cone-01', paint: 'coat', count: 2, rows: ['top'], spin: [{ axis: 'y', deg: 180 }] },
  extras: [{ name: 'wart', part: 'cone-01', paint: 'tip', at: [0, 1.43125, 0.2] }],
}

const SNAPSHOT = JSON.parse(JSON.stringify(BASE)) as CreatureDef

const builds = (def: CreatureDef): void => {
  expect(() => creatureSpec(ID, def)).not.toThrow()
}

/** The slot a path names, as the `PartDef` it normalises to. `chamfer` is a tail's. */
const partOf = (def: CreatureDef, p: DefPath): PartDef & { chamfer?: boolean } =>
  partAt(def, p) as PartDef & { chamfer?: boolean }

describe('the edit model addresses the definition, not the mesh', () => {
  it('resolves every mesh of a real build back to the slot that made it', () => {
    const group = buildAssembly(creatureSpec(ID, BASE))
    const seen = new Map<string, string>()
    expect(group.children.length).toBeGreaterThan(8)
    for (const m of group.children) {
      /* Typed as the record `pathFromUserData` takes: `Object3D.userData` loses its
       * index signature through the spread, so `u['part']` below is otherwise an
       * implicit `any`. */
      const u: Record<string, unknown> = { ...m.userData, name: m.name }
      const path = pathFromUserData(u, BASE)
      expect(path, `mesh "${m.name}" did not resolve to a slot`).not.toBeNull()
      const slot = partAt(BASE, path!)
      expect(slot, `slot ${pathKey(path!)} is empty`).not.toBeNull()
      /* The slot the pick resolved to must wear the shape the mesh is made of. */
      expect((slot as { part: string }).part).toBe(u['part'] as string)
      seen.set(pathKey(path!), m.name)
    }
    /* All seven slots this species has are reachable by picking. */
    expect([...seen.keys()].sort()).toEqual(
      ['eyes', 'extras:0', 'hull', 'legs', 'ridge', 'snout'].concat(['ears']).sort(),
    )
  })

  it('says null rather than offering a dead handle', () => {
    expect(pathFromUserData({})).toBeNull()
    expect(pathFromUserData({ role: 'floof' })).toBeNull()
    /* An extra is nothing but a name, so it is unmappable without the definition. */
    expect(pathFromUserData({ role: 'wart' })).toBeNull()
    expect(pathFromUserData({ role: 'wart' }, BASE)).toEqual({ role: 'extras', index: 0 })
  })

  it('keys a path stably, per slot', () => {
    expect(pathKey({ role: 'ears' })).toBe('ears')
    expect(pathKey({ role: 'extras', index: 3 })).toBe('extras:3')
    expect(pathKey({ role: 'extras', index: 3 })).toBe(pathKey({ role: 'extras', index: 3 }))
  })

  it('normalises a slot to object form, filling the shape default only', () => {
    expect(partAt({ palette: { coat: 1 } }, { role: 'hull' })).toEqual({ part: 'box-03' })
    expect(partAt({ palette: { coat: 1 }, ears: 'cone-04' }, { role: 'ears' }))
      .toEqual({ part: 'cone-04' })
    expect(partAt(BASE, { role: 'legs' })).toEqual({ part: LEG_ROW.part, sink: LEG_ROW.sink })
    expect(partAt(BASE, { role: 'eyes' })).toEqual({ part: 'plate-01', sink: 0, paint: 'belly' })
    expect(partAt({ palette: { coat: 1 }, legs: false }, { role: 'legs' })).toBeNull()
    expect(partAt(BASE, { role: 'tail' })).toBeNull()
    expect(partAt(BASE, { role: 'extras', index: 9 })).toBeNull()
  })

  it('lists every editable slot, legs and eyes included even when unsaid', () => {
    const rows = listParts({ palette: { coat: 1 } })
    expect(rows.map(r => pathKey(r.path))).toEqual(['hull', 'legs', 'eyes'])
    expect(rows.map(r => r.part)).toEqual(['box-03', LEG_ROW.part, 'plate-01'])

    expect(listParts(BASE).map(r => pathKey(r.path)))
      .toEqual(['hull', 'legs', 'eyes', 'ears', 'snout', 'ridge', 'extras:0'])
    expect(listParts(BASE).map(r => r.label)).toContain('wart')
    expect(listParts({ ...BASE, legs: false, eyes: false }).map(r => pathKey(r.path)))
      .toEqual(['hull', 'ears', 'snout', 'ridge', 'extras:0'])
  })
})

describe('every op leaves a buildable definition', () => {
  it('moves', () => {
    builds(setJoin(BASE, { role: 'hull' }, [0, 0.80625, 0]))
    builds(setJoin(BASE, { role: 'legs' }, [0.3, 0, 0.28]))
    builds(setJoin(BASE, { role: 'eyes' }, [0.2625, 1.02, 999]))
    builds(setJoin(BASE, { role: 'ears' }, [0.3, 1.43125, 0.1]))
    builds(setJoin(BASE, { role: 'snout' }, [0, 0.72, 0.625]))
    builds(setJoin(BASE, { role: 'extras', index: 0 }, [0, 1.43125, -0.2]))
  })

  it('rotates, resizes, reshapes, repaints', () => {
    builds(setSpin(BASE, { role: 'ears' }, [{ axis: 'x', deg: 180 }]))
    builds(setSpin(BASE, { role: 'ears' }, [{ axis: 'x', deg: 30 }], [0.3, 1.43125, 0.1]))
    builds(setSpin(BASE, { role: 'ridge' }, [{ axis: 'z', deg: 30 }]))
    builds(setSpin(BASE, { role: 'ridge' }, []))
    builds(setStretch(BASE, { role: 'ears' }, [2, 2, 2]))
    builds(setStretch(setStretch(BASE, { role: 'ears' }, [2, 2, 2]), { role: 'ears' }, undefined))
    builds(setPartShape(BASE, { role: 'ears' }, 'cone-01'))
    builds(setPartShape(BASE, { role: 'hull' }, 'box-21'))
    builds(setPartShape(BASE, { role: 'ridge' }, 'cone-04'))
    builds(setPaint(BASE, { role: 'ears' }, 'limb'))
    builds(setPaint(BASE, { role: 'eyes' }, { base: 'belly' }))
    builds(setPaletteColour(BASE, 'coat', 0x112233))
    builds(addPaletteSlot(BASE, 'tuft', 0x445566))
    builds(setMirrored(BASE, { role: 'snout' }, true))
    builds(deletePart(BASE, { role: 'ears' }))
    builds(deletePart(BASE, { role: 'ridge' }))
    builds(duplicatePart(BASE, { role: 'ears' }).def)
  })

  it('writes the JOIN point, and drops what the role cannot say', () => {
    /* Rule 5: the eye card's z is EYE_CARD_Z on every animal in the pack, so a
     * drag in z has nowhere to go and the definition has no field for it. */
    const eyes = setJoin(BASE, { role: 'eyes' }, [0.3, 1.02, 999])
    expect(eyes.eyes).toEqual({ y: 1.02, x: 0.3, paint: 'belly' })
    expect(creatureSpec(ID, eyes).features.find(f => f.name === 'eye')!.placement)
      .toEqual({ kind: 'pair', at: [0.3, 1.02, EYE_CARD_Z] })

    /* The leg row's y is what puts the feet on zero and is not a species' choice. */
    const legs = setJoin(BASE, { role: 'legs' }, [0.3, 999, 0.28])
    expect(legs.legs).toEqual({ x: 0.3, z: 0.28 })

    /* A ridge has no join point at all — its rows are solved off the hull. */
    expect(setJoin(BASE, { role: 'ridge' }, [0, 1, 0])).toBe(BASE)
  })

  it('a spin off the quarter turns will not ship without its join point', () => {
    /* The donor transfer joins a part to the face its facing points at. Turned 30
     * degrees it points at no face, and `creature.ts` throws by name — so a spin
     * that would do that to a part with no `at` of its own is declined outright
     * rather than allowed to produce a species that will not load. */
    expect(setSpin(BASE, { role: 'ears' }, [{ axis: 'x', deg: 30 }])).toBe(BASE)
    expect(() => creatureSpec(ID, { ...BASE, ears: { part: 'cone-04', spin: [{ axis: 'x', deg: 30 }] } }))
      .toThrow(/DONOR TRANSFER/)

    /* Quarter turns keep the facing on an axis, so they need nothing. */
    const quarter = setSpin(BASE, { role: 'ears' }, [{ axis: 'z', deg: -90 }])
    expect(partOf(quarter, { role: 'ears' }).spin).toHaveLength(1)
    expect(partOf(quarter, { role: 'ears' }).at).toBeUndefined()
    builds(quarter)

    /* With the join point the caller read off the picked mesh, it lands. */
    const free = setSpin(BASE, { role: 'ears' }, [{ axis: 'x', deg: 30 }], [0.3, 1.43125, 0.1])
    expect(partOf(free, { role: 'ears' }).at).toEqual([0.3, 1.43125, 0.1])
    builds(free)
  })

  it('unpacks the tail chamfer idiom rather than letting it throw', () => {
    const tailed: CreatureDef = { ...BASE, tail: { part: 'cone-01', chamfer: true } }
    builds(tailed)
    /* `creature.ts` refuses `chamfer` beside an `at` or a `spin` of its own. */
    expect(() => creatureSpec(ID, { ...BASE, tail: { part: 'cone-01', chamfer: true, at: [0, 1.2, -0.6] } }))
      .toThrow(/CHAMFER IDIOM/)

    const moved = setJoin(tailed, { role: 'tail' }, [0, 1.275, -0.46875])
    expect(partOf(moved, { role: 'tail' }).chamfer).toBeUndefined()
    /* The 45-degree turn the flag stood for is written out, so nothing moves. */
    expect(partOf(moved, { role: 'tail' }).spin).toEqual([{ axis: 'x', deg: 45 }])
    builds(moved)

    /* A chamfer tail is an anchored part: a spin on it needs the join point. */
    expect(setSpin(tailed, { role: 'tail' }, [{ axis: 'x', deg: 60 }])).toBe(tailed)
    const spun = setSpin(tailed, { role: 'tail' }, [{ axis: 'x', deg: 60 }], [0, 1.275, -0.46875])
    expect(partOf(spun, { role: 'tail' }).chamfer).toBeUndefined()
    builds(spun)

    /* And a copy of one is a fresh part at the donor transfer, not a floating one. */
    const copied = duplicatePart(tailed, { role: 'tail' })
    expect((copied.def.extras ?? []).at(-1)).toEqual({ part: 'cone-01', name: 'tail-2' })
    builds(copied.def)
  })

  it('rounds every numeric write to six decimals', () => {
    const moved = setJoin(BASE, { role: 'ears' }, [1 / 3, 0.6350000000000001, -0])
    expect(partOf(moved, { role: 'ears' }).at).toEqual([0.333333, 0.635, 0])
    const sized = setStretch(BASE, { role: 'ears' }, [2 / 3, 1, 1])
    expect(partOf(sized, { role: 'ears' }).stretch).toEqual([0.666667, 1, 1])
    /* And the rounding happens BEFORE the quarter-turn test, so a dial that
     * stopped a millionth short of 90 is a quarter turn and needs no anchor. */
    const spun = setSpin(BASE, { role: 'ears' }, [{ axis: 'y', deg: 89.9999999 }])
    expect(partOf(spun, { role: 'ears' }).spin![0]!.deg).toBe(90)
    expect(partOf(spun, { role: 'ears' }).at).toBeUndefined()
    const off = setSpin(BASE, { role: 'ears' }, [{ axis: 'y', deg: 44.9999999 }], [1 / 3, 1, 0])
    expect(partOf(off, { role: 'ears' }).spin![0]!.deg).toBe(45)
    expect(partOf(off, { role: 'ears' }).at).toEqual([0.333333, 1, 0])
  })

  it('does not touch the definition it was given', () => {
    const paths: DefPath[] = [
      { role: 'hull' }, { role: 'legs' }, { role: 'eyes' }, { role: 'ears' },
      { role: 'snout' }, { role: 'ridge' }, { role: 'extras', index: 0 },
    ]
    for (const p of paths) {
      setJoin(BASE, p, [1, 2, 3])
      setSpin(BASE, p, [{ axis: 'z', deg: 90 }])
      setStretch(BASE, p, [2, 1, 1])
      setStretch(BASE, p, undefined)
      setPartShape(BASE, p, 'cone-02')
      setPaint(BASE, p, 'tip')
      setMirrored(BASE, p, true)
      setMirrored(BASE, p, false)
      duplicatePart(BASE, p)
      deletePart(BASE, p)
    }
    setPaletteColour(BASE, 'coat', 0)
    addPaletteSlot(BASE, 'new', 0xffffff)
    expect(BASE).toEqual(SNAPSHOT)
  })
})

describe('rule 6: a pair is one mesh placed twice', () => {
  it('setMirrored(true) writes kind:pair and adds no second part', () => {
    const before = (BASE.extras ?? []).length
    const next = setMirrored(BASE, { role: 'snout' }, true)
    expect(partOf(next, { role: 'snout' }).kind).toBe('pair')
    expect((next.extras ?? []).length).toBe(before)
    const spec = creatureSpec(ID, next)
    const snout = spec.features.filter(f => f.name === 'snout')
    expect(snout).toHaveLength(1)
    expect(snout[0]!.placement.kind).toBe('pair')

    const off = setMirrored(next, { role: 'snout' }, false)
    expect(partOf(off, { role: 'snout' }).kind).toBe('single')
    expect(creatureSpec(ID, off).features.filter(f => f.name === 'snout')[0]!.placement.kind)
      .toBe('single')
  })

  it('declines on the slots whose count is not a species\' choice', () => {
    for (const role of ['hull', 'legs', 'eyes', 'ridge'] as const) {
      expect(setMirrored(BASE, { role }, true)).toBe(BASE)
    }
  })
})

describe('duplicate, and the names that must not collide', () => {
  it('is unique after three copies, and still builds', () => {
    let def = BASE
    const paths: DefPath[] = []
    for (let i = 0; i < 3; i++) {
      const r = duplicatePart(def, { role: 'ears' })
      def = r.def
      paths.push(r.path)
    }
    const names = (def.extras ?? []).map(e => e.name)
    expect(names).toEqual(['wart', 'ear-2', 'ear-3', 'ear-4'])
    expect(new Set(names).size).toBe(names.length)
    expect(paths.map(pathKey)).toEqual(['extras:1', 'extras:2', 'extras:3'])
    builds(def)
    /* Every copy wears the original's shape, and the original is still there. */
    expect((def.extras ?? []).slice(1).every(e => e.part === 'cone-04')).toBe(true)
    expect(def.ears).toEqual(BASE.ears)
  })

  it('declines the one mass, and the two the placement kinds already count', () => {
    for (const role of ['hull', 'legs', 'eyes', 'ridge'] as const) {
      const r = duplicatePart(BASE, { role })
      expect(r.def).toBe(BASE)
      expect(r.path).toEqual({ role })
    }
  })

  it('uniqueExtraName avoids the role names too, not just the extras', () => {
    expect(uniqueExtraName(BASE, 'tuft')).toBe('tuft')
    expect(uniqueExtraName(BASE, 'wart')).toBe('wart-2')
    expect(uniqueExtraName(BASE, 'ear')).toBe('ear-2')
    expect(uniqueExtraName(BASE, 'leg')).toBe('leg-2')
    expect(uniqueExtraName(BASE, 'spike-top')).toBe('spike-top-2')
  })
})

describe('delete', () => {
  it('legs become false, and the species still builds', () => {
    const next = deletePart(BASE, { role: 'legs' })
    expect(next.legs).toBe(false)
    builds(next)
    expect(creatureSpec(ID, next).features.some(f => f.name === 'leg')).toBe(false)

    const noEyes = deletePart(BASE, { role: 'eyes' })
    expect(noEyes.eyes).toBe(false)
    builds(noEyes)
    expect(creatureSpec(ID, noEyes).features.some(f => f.name === 'eye')).toBe(false)
  })

  it('a role with no false in its type loses the key entirely', () => {
    const next = deletePart(BASE, { role: 'ears' })
    expect('ears' in next).toBe(false)
    expect('ridge' in deletePart(BASE, { role: 'ridge' })).toBe(false)
    builds(next)
    /* A nose anchored to a deleted snout falls back to the donor transfer. */
    const noSnout = deletePart({ ...BASE, nose: { part: 'wedge-10' } }, { role: 'snout' })
    builds(noSnout)
  })

  it('splices the right extra, and drops the key with the last one', () => {
    const three: CreatureDef = {
      ...BASE,
      extras: [
        { name: 'a', part: 'cone-01', paint: 'tip', at: [0, 1.43125, 0.3] },
        { name: 'b', part: 'cone-01', paint: 'tip', at: [0, 1.43125, 0] },
        { name: 'c', part: 'cone-01', paint: 'tip', at: [0, 1.43125, -0.3] },
      ],
    }
    const next = deletePart(three, { role: 'extras', index: 1 })
    expect((next.extras ?? []).map(e => e.name)).toEqual(['a', 'c'])
    builds(next)
    expect('extras' in deletePart(BASE, { role: 'extras', index: 0 })).toBe(false)
  })

  it('will not remove the one mass', () => {
    expect(deletePart(BASE, { role: 'hull' })).toBe(BASE)
  })
})

describe('the palette, whose insertion order IS the texture layout', () => {
  it('recolours in place and never reorders', () => {
    const next = setPaletteColour(BASE, 'belly', 0x010203)
    expect(Object.keys(next.palette)).toEqual(Object.keys(BASE.palette))
    expect(next.palette['belly']).toBe(0x010203)
    expect(warningsFor(next, BASE)).toEqual([])
  })

  it('will not invent a slot, and appends only at the end', () => {
    expect(setPaletteColour(BASE, 'nope', 1)).toBe(BASE)
    const added = addPaletteSlot(BASE, 'tuft', 0x0f0f0f)
    expect(Object.keys(added.palette)).toEqual([...Object.keys(BASE.palette), 'tuft'])
    expect(warningsFor(added, BASE)).toEqual([])
    /* An existing slot keeps its column. */
    const same = addPaletteSlot(BASE, 'coat', 0x0)
    expect(Object.keys(same.palette)).toEqual(Object.keys(BASE.palette))
  })
})

describe('the axioms warn, and never block', () => {
  const of = (ws: { axiom: string }[], axiom: string): { axiom: string; severity?: string }[] =>
    ws.filter(w => w.axiom === axiom)

  it('a clean definition is silent', () => {
    expect(warningsFor(BASE)).toEqual([])
    expect(warningsFor(BASE, BASE)).toEqual([])
  })

  it('one-mass: a second hull shape is loud, and still builds nothing quietly', () => {
    const two: CreatureDef = {
      ...BASE,
      extras: [{ name: 'head', part: 'box-12', at: [0, 1.43125, 0] }],
    }
    const w = of(warningsFor(two), 'one-mass')
    expect(w).toHaveLength(1)
    expect(w[0]!.severity).toBe('loud')
    expect(warningsFor(two)[0]!.path).toEqual({ role: 'extras', index: 0 })
    expect(warningsFor(two)[0]!.text).toContain('box-12')
    /* And the hard rule is still the hard rule: it does not silently build. */
    expect(() => creatureSpec(ID, two)).toThrow(/RULE 3/)
    expect(of(warningsFor(BASE), 'one-mass')).toEqual([])
  })

  it('eye-size: any stretch on an eye card is loud', () => {
    const card: CreatureDef = {
      ...BASE,
      extras: [{ name: 'third-eye', part: 'plate-01', paint: 'belly', stretch: [1.5, 1.5, 1.5], at: [0, 1.2, 0.635] }],
    }
    const w = of(warningsFor(card), 'eye-size')
    expect(w).toHaveLength(1)
    expect(w[0]!.severity).toBe('loud')

    /* `CreatureDef.eyes` has no `stretch` field — rule 5 is unsayable, not merely
     * discouraged — so this is only reachable from a definition that came in as
     * data. It is still caught. */
    const smuggled = { ...BASE, eyes: { ...(BASE.eyes as object), stretch: [2, 2, 2] } } as CreatureDef
    expect(of(warningsFor(smuggled), 'eye-size')[0]!.severity).toBe('loud')

    const plain: CreatureDef = {
      ...BASE,
      extras: [{ name: 'third-eye', part: 'plate-01', paint: 'belly', at: [0, 1.2, 0.635] }],
    }
    expect(of(warningsFor(plain), 'eye-size')).toEqual([])
  })

  /*
   * THE CONTRACT REVERSED, and deliberately kept rather than deleted.
   *
   * This used to read "a hull stretch must say why": the editor offered the dial
   * and `warningsFor` demanded a `stretchWhy` sentence beside it. That contract is
   * gone. `HullDef.stretch` is typed `never` (see `Hull` in `assembly.ts`) after the
   * hedgehog shipped with the shared 1.250 cube quietly stretched and Joe's note
   * back was "body cubic, its currently too wide" — so a stretched hull is now
   * unexpressible rather than explained, and an editor that still offered the dial
   * would be the exact recurrence the ruling exists to stop.
   *
   * So the coverage stays and the assertion flips: the op is a NO-OP, and there is
   * no warning left to fire because there is no state left to warn about.
   */
  it('placement: a hull stretch is not offered at all, and a spin never warns', () => {
    const tried = setStretch(BASE, { role: 'hull' }, [1.2, 1, 1])
    expect(tried).toBe(BASE)
    expect(of(warningsFor(tried), 'placement')).toEqual([])
    expect(of(warningsFor(tried), 'scale')).toEqual([])

    /* Clearing is a no-op too — it must not normalise `hull` into existence. */
    expect(setStretch(BASE, { role: 'hull' }, undefined)).toBe(BASE)

    /* And one smuggled past the type through a cast raises nothing HERE either:
     * `creatureSpec` throws by name on it, which is a better message than any
     * warning this module could word, and a warning about a state the editor cannot
     * reach only teaches Joe that the dial exists. */
    const smuggled = {
      ...BASE, hull: { part: 'box-03', stretch: [1.2, 1, 1] },
    } as unknown as CreatureDef
    expect(of(warningsFor(smuggled), 'placement')).toEqual([])
    expect(of(warningsFor(smuggled), 'scale')).toEqual([])
    expect(() => creatureSpec(ID, smuggled)).toThrow(/HULL/)

    /* Rule 4 as amended: a spin is baked into the copy's vertices. Not a warning. */
    const spun = setSpin(BASE, { role: 'ears' }, [{ axis: 'x', deg: 45 }])
    expect(warningsFor(spun)).toEqual([])
  })

  it('scale: notable everywhere, a note on ears and snouts under 3x', () => {
    const ear = setStretch(BASE, { role: 'ears' }, [2.5, 2.5, 2.5])
    expect(of(warningsFor(ear), 'scale')[0]!.severity).toBe('note')
    expect(warningsFor(ear)[0]!.text).toContain('uniform 2.50x')

    const big = setStretch(BASE, { role: 'ears' }, [3.5, 3.5, 3.5])
    expect(of(warningsFor(big), 'scale')[0]!.severity).toBe('warn')

    const snout = setStretch(BASE, { role: 'snout' }, [1, 1, 2])
    const sw = of(warningsFor(snout), 'scale')
    expect(sw[0]!.severity).toBe('note')
    expect(warningsFor(snout)[0]!.text).toContain('NON-UNIFORM')

    /* Every other part: §3 measured stretch as safe on those two kinds only. */
    const extra = setStretch(BASE, { role: 'extras', index: 0 }, [1.2, 1.2, 1.2])
    expect(of(warningsFor(extra), 'scale')[0]!.severity).toBe('warn')

    /* A stretch of exactly 1 is not a stretch. */
    expect(of(warningsFor(setStretch(BASE, { role: 'ears' }, [1, 1, 1])), 'scale')).toEqual([])
    expect(of(warningsFor(BASE), 'scale')).toEqual([])
  })

  it('palette-order: removal and reordering are loud, appending is silent', () => {
    const gone: CreatureDef = { ...BASE, palette: { coat: 1, limb: 2, tip: 3 } }
    expect(of(warningsFor(gone, BASE), 'palette-order')[0]!.severity).toBe('loud')

    const swapped: CreatureDef = { ...BASE, palette: { belly: 1, coat: 2, limb: 3, tip: 4 } }
    const w = of(warningsFor(swapped, BASE), 'palette-order')
    expect(w).toHaveLength(1)
    expect(w[0]!.severity).toBe('loud')

    expect(of(warningsFor(addPaletteSlot(BASE, 'tuft', 1), BASE), 'palette-order')).toEqual([])
    /* No baseline, nothing to compare against — the other axioms still run. */
    expect(of(warningsFor(gone), 'palette-order')).toEqual([])
  })
})

describe('copying an animal to edit it into another one', () => {
  it('is deep: an edit to the copy cannot reach the original', () => {
    const copy = cloneAs(BASE, 'animal-other')
    expect(copy).toEqual(BASE)
    expect(copy).not.toBe(BASE)
    expect(copy.palette).not.toBe(BASE.palette)
    expect(copy.extras).not.toBe(BASE.extras)
    expect(copy.extras![0]).not.toBe(BASE.extras![0])
    expect(copy.extras![0]!.at).not.toBe(BASE.extras![0]!.at)
    /* Mutating the copy in place — which no op here does, but a caller might. */
    /* `CreatureDef.extras` is `readonly`, so the write needs the `unknown` hop —
     * which is the point of the line: a caller CAN do this, and the clone must
     * still be deep enough that it does not reach `BASE`. */
    ;(copy.extras as unknown as { name: string }[])[0]!.name = 'moved'
    expect(BASE.extras![0]!.name).toBe('wart')
    builds(copy)
  })

  it('preserves palette insertion order exactly, because it is the texture layout', () => {
    const wide: CreatureDef = {
      ...BASE,
      palette: { z: 1, a: 2, coat: 3, belly: 4, limb: 5, tip: 6, m: 7 },
    }
    expect(Object.keys(cloneAs(wide, 'animal-other').palette)).toEqual(Object.keys(wide.palette))
    expect(warningsFor(cloneAs(wide, 'animal-other'), wide)).toEqual([])
  })

  it('insists on an id, because that is what makes it a new animal', () => {
    expect(() => cloneAs(BASE, '  ')).toThrow(/species id/)
  })

  it('cannot recover a shipped species\' definition, and says so by returning null', () => {
    /* Only the COMPILED `AssemblyBuild` is reachable: a species file passes its
     * `CreatureDef` straight into `defineCreature` as an object literal and
     * exports what comes back. Nothing keeps the definition. */
    expect(defFrom('animal-hedgehog')).toBeNull()
    expect(defFrom('animal-nonesuch')).toBeNull()
  })
})

describe('the way an edit leaves the workbench', () => {
  const WITH_FLAG: CreatureDef = {
    ...BASE,
    coat: 'coat',
    belly: 6 / 16,
    flag: 'RULE 9 STRAINED: this species is a test fixture and its triangle count is '
      + 'nobody\'s problem but this file\'s, which is exactly the kind of sentence a '
      + 'flag is for — one line, in Joe\'s direction, where he reads it.',
  }

  it('emits a module that names the species and every key of the definition', () => {
    const src = defToModuleSource(ID, WITH_FLAG)
    expect(src).toContain("import { defineCreature } from '../creature'")
    expect(src).toContain("export const TEST_ASSEMBLY = defineCreature('animal-test', {")
    for (const k of Object.keys(WITH_FLAG)) {
      expect(src, `missing top-level key "${k}"`).toContain(`  ${k}:`)
    }
    expect(src).toContain('})')
  })

  it('is LF, and ends with a newline', () => {
    const src = defToModuleSource(ID, WITH_FLAG)
    expect(src.endsWith('\n')).toBe(true)
    expect(src).not.toContain('\r')
  })

  it('never carries the workbench sentinel into src/', () => {
    /* `tools/smoke/channel.mjs` greps every build for it, and this text is
     * destined for a file that IS shipped. */
    expect(defToModuleSource(ID, WITH_FLAG)).not.toContain(['JOE', 'WORKBENCH', 'ONLY'].join('_'))
  })

  it('writes the palette down in its own order, as hex', () => {
    const src = defToModuleSource(ID, BASE)
    expect(src).toContain('coat: 0x9a6a3c,')
    expect(src).toContain('belly: 0xdcc7a6,')
    const at = (s: string): number => src.indexOf(s)
    expect(at('coat: 0x')).toBeLessThan(at('belly: 0x'))
    expect(at('belly: 0x')).toBeLessThan(at('limb: 0x'))
    expect(at('limb: 0x')).toBeLessThan(at('tip: 0x'))
  })

  it('writes the numbers a definition is diffed on, not their float dust', () => {
    const src = defToModuleSource(ID, setJoin(BASE, { role: 'ears' }, [1 / 3, 1.43125, 0]))
    expect(src).toContain('at: [0.333333, 1.43125, 0]')
    expect(src).not.toMatch(/0\.33333333/)
  })

  it('names the constant the way every species file already does', () => {
    expect(defToModuleSource('animal-hedgehog', BASE)).toContain('export const HEDGEHOG_ASSEMBLY =')
    expect(defToModuleSource('animal-wood-mouse', BASE)).toContain('export const WOOD_MOUSE_ASSEMBLY =')
  })
})
