/**
 * A part gets a colour of its OWN — the contract, sampled off the real texture.
 *
 * Joe's bug, verbatim: *"the colour panel does not let me colour a newly added
 * primitive in my own colour, eg i dont seem to be able to colour a mouth with
 * the colour i want."*
 *
 * The cause was never the engine. `spec.palette` is an open record, the atlas is
 * `SLOT_W x slots.length * SLOT_PX`, and a part paints by slot NAME — so a
 * palette may hold any number of slots and adding one just makes the strip
 * taller. The cause was that `insertPart` writes `{ part, name }` with no paint
 * at all, `creature.ts` then paints it from the COAT by default, and the colour
 * panel's only two acts were "recolour a slot the palette already has" and
 * "point this part at a slot the palette already has". Neither can give one part
 * a colour nothing else wears. Recolouring `coat` to suit a mouth repaints the
 * body, which is the symptom exactly.
 *
 * So the claims below are about pixels, not about calls. Four dead features
 * shipped in this repo behind tests that only proved a mock ran; nothing here
 * mocks anything. Every assertion goes through the real `creatureSpec`, the real
 * `buildAssembly`, and the real `assemblyTexture` the material carries — a mesh's
 * colour is READ OUT of the texture at the mesh's own baked UV.
 *
 * The claims, in the order they would hurt:
 *
 *   1. **The part renders in its new slot's colour, and NOTHING ELSE MOVES.**
 *      Sampled per mesh, before and after, across the whole animal.
 *   2. **BRIEF §19: a species already on disk does not change colour.** Appending
 *      leaves every existing slot at its own index, so every existing part reads
 *      the same cell. Proved against every shipped species, pixel for pixel.
 *      Note the nuance: the UV NUMBERS do change, because `slotUv(i, n)` divides
 *      by a taller atlas. The ROW does not, and the row is what is sampled.
 *   3. **It survives the way an edit leaves the editor** — the draft save, which
 *      is `JSON` of the definition, and the push, which is `defToModuleSource`.
 *   4. **A name already in the palette is disambiguated, never reused.** Reusing
 *      one would recolour it in place — `rebuiltPalette` says so — which is the
 *      original bug wearing a new button.
 *   5. **`paintSlotOf` mirrors `creature.ts` and has not drifted from it**, role
 *      by role, checked against what the real builder resolved.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  addPaletteSlot, giveOwnPaletteSlot, insertPart, listParts, paintSlotOf,
  defToModuleSource, setPaletteColour, uniquePaletteSlot, warningsFor,
} from '../../tools/workbench/public/editor/def'
import type { DefPath } from '../../tools/workbench/public/editor/def'
import { loadBuiltDefs } from '../../tools/workbench/public/editor/capture'
import { buildAssembly, creatureSpec } from '../../src/island/species/parts'
import type { CreatureDef } from '../../src/island/species/parts'
import { SLOT_PX, SLOT_W } from '../../src/island/species/parts/texture'
import type { Group, Mesh, MeshStandardMaterial, DataTexture } from 'three'

const ID = 'animal-test'

/**
 * A real species on real bank shapes, deliberately NOT a fixture of empty
 * objects: four slots, a part painted from each of the three defaults, and one
 * extra that names its slot outright.
 */
const BASE: CreatureDef = {
  palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, tip: 0x4e361d },
  eyes: { y: 0.95 },
  ears: { part: 'cone-04' },
  snout: { part: 'cone-06' },
  extras: [{ name: 'wart', part: 'cone-01', paint: 'tip', at: [0, 1.43125, 0.2] }],
}

/**
 * The colour a mesh actually renders, read out of the atlas at its own UV.
 *
 * This is the whole method. `bakeGeometry` writes `slotUv(slot, slots.length)`
 * on every corner of every triangle, `assemblyTexture` fills row `i * SLOT_PX +
 * k` of the strip with slot `i`'s colour, and the material's `map` is that
 * strip — so sampling the texture at the vertex's uv is what the fragment
 * shader will do, done in a test. Nothing here restates a UV convention: it
 * reads the numbers the kit baked.
 *
 * Sampled at every distinct uv the mesh carries, not just the first, so a part
 * split by `byBand` or by a `patch` reports every colour it wears.
 */
function coloursOf(mesh: Mesh): number[] {
  const tex = (mesh.material as MeshStandardMaterial).map as DataTexture
  const { data, width, height } = tex.image as { data: Uint8Array; width: number; height: number }
  expect(width).toBe(SLOT_W)
  const uv = mesh.geometry.getAttribute('uv')
  const seen = new Set<number>()
  const out: number[] = []
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i), v = uv.getY(i)
    const x = Math.min(width - 1, Math.max(0, Math.floor(u * width)))
    const y = Math.min(height - 1, Math.max(0, Math.floor(v * height)))
    const o = (y * width + x) * 4
    const rgb = (data[o]! << 16) | (data[o + 1]! << 8) | data[o + 2]!
    if (!seen.has(rgb)) { seen.add(rgb); out.push(rgb) }
  }
  return out
}

/** Every mesh of a real build, by name, and the colours it renders. */
function rendered(id: string, def: CreatureDef): Map<string, number[]> {
  const group: Group = buildAssembly(creatureSpec(id, def))
  const out = new Map<string, number[]>()
  for (const child of group.children) out.set(child.name, coloursOf(child as Mesh))
  expect(out.size).toBeGreaterThan(4)
  return out
}

/** The palette's insertion order, which IS the atlas row order. */
const order = (def: CreatureDef): string[] => Object.keys(def.palette)

describe('a part can be given a colour of its own', () => {
  /*
   * Joe's case, built the way the editor builds it: insert a primitive with the
   * real `insertPart`, which writes `{ part, name }` and no paint whatsoever.
   */
  const inserted = insertPart(BASE, 'cone-02')
  const MOUTH = inserted.path!
  const WITH_MOUTH = inserted.def
  /* The mesh `buildAssembly` will name it. An extra's mesh takes its `name`. */
  const MESH = 'cone-02'

  it('arrives sharing the coat, which is the bug', () => {
    /* Not an implementation detail — it is the whole complaint. A part that says
     * nothing about paint is painted from the coat, so it is the same colour as
     * the body and the only swatch that moves it moves the body too. */
    expect(paintSlotOf(WITH_MOUTH, MOUTH)).toBe('coat')
    const before = rendered(ID, WITH_MOUTH)
    expect(before.get(MESH)).toEqual([BASE.palette['coat']])
    expect(before.get('hull')).toEqual([BASE.palette['coat']])
  })

  it('renders in its own new slot\'s colour, and no other part moves', () => {
    const before = rendered(ID, WITH_MOUTH)

    const made = giveOwnPaletteSlot(WITH_MOUTH, MOUTH)
    expect(made.slot).toBe('cone-02')
    /* Seeded with the colour it already wore, so taking a slot changes nothing. */
    expect(made.def.palette[made.slot!]).toBe(BASE.palette['coat'])
    expect(rendered(ID, made.def)).toEqual(before)

    /* And NOW the colour Joe wanted. */
    const own = setPaletteColour(made.def, made.slot!, 0x18a558)
    const after = rendered(ID, own)

    expect(after.get(MESH)).toEqual([0x18a558])
    /* Every other mesh, pixel for pixel. This is the claim; the one above is
     * only half of it, because a fix that recoloured the mouth by recolouring
     * the coat would pass it. */
    for (const [name, was] of before) {
      if (name === MESH) continue
      expect(after.get(name), `mesh "${name}" changed colour`).toEqual(was)
    }
    expect(after.get('hull')).toEqual([BASE.palette['coat']])
  })

  it('keeps a byBand block and repoints only its base', () => {
    /* The badger's snout is a slot AND a band. Rebuilding it as a bare slot name
     * to grant the first colour would throw away the second. */
    const banded: CreatureDef = {
      ...BASE, ears: { part: 'cone-04', paint: { base: 'coat', byBand: { 13: 'belly' } } },
    }
    const made = giveOwnPaletteSlot(banded, { role: 'ears' })
    expect(made.slot).toBe('ear')
    expect(made.def.ears).toEqual({
      part: 'cone-04', paint: { base: 'ear', byBand: { 13: 'belly' } },
    })
    expect(() => creatureSpec(ID, made.def)).not.toThrow()
  })

  it('declines rather than leaving an orphan slot in the atlas', () => {
    /* A legless species has no leg paint to repoint. The definition must come
     * back untouched — an appended slot nothing points at is a silent row added
     * to every texture of that species by a gesture that did nothing. */
    const legless: CreatureDef = { ...BASE, legs: false }
    const made = giveOwnPaletteSlot(legless, { role: 'legs' })
    expect(made.slot).toBeNull()
    expect(made.def).toBe(legless)
    expect(order(made.def)).toEqual(order(BASE))
  })

  it('does not touch the definition it was given', () => {
    const snapshot = JSON.parse(JSON.stringify(WITH_MOUTH)) as CreatureDef
    giveOwnPaletteSlot(WITH_MOUTH, MOUTH)
    giveOwnPaletteSlot(WITH_MOUTH, { role: 'hull' })
    giveOwnPaletteSlot(WITH_MOUTH, { role: 'eyes' })
    expect(WITH_MOUTH).toEqual(snapshot)
  })
})

describe('BRIEF §19: appending cannot repaint a species already on disk', () => {
  it('leaves every pre-existing slot at its own atlas index', () => {
    const made = giveOwnPaletteSlot(BASE, { role: 'ears' })
    const was = order(BASE), now = order(made.def)
    expect(now).toEqual([...was, 'ear'])
    for (const slot of was) {
      expect(now.indexOf(slot), `slot "${slot}" moved column`).toBe(was.indexOf(slot))
    }
    /* The axiom that exists to catch a shifted layout stays silent, which is the
     * same guarantee said by the warning system rather than by an index. */
    expect(warningsFor(made.def, BASE).filter(w => w.axiom === 'palette-order')).toEqual([])
  })

  it('changes every UV NUMBER and no part\'s colour — the nuance worth naming', () => {
    /* `slotUv(i, n)` is `(i + 0.5) / n`, so a taller atlas moves every uv. What
     * does NOT move is `floor(v * height)`, the row: slot i still starts at row
     * `i * SLOT_PX`. A test that compared uv arrays would fail here and would be
     * asserting the wrong thing; a test that compares COLOUR is the guarantee. */
    const made = giveOwnPaletteSlot(BASE, { role: 'ears' })
    const a = buildAssembly(creatureSpec(ID, BASE))
    const b = buildAssembly(creatureSpec(ID, made.def))
    const uvOf = (g: Group, name: string): number =>
      (g.children.find(c => c.name === name) as Mesh).geometry.getAttribute('uv').getY(0)
    expect(uvOf(b, 'hull')).not.toBe(uvOf(a, 'hull'))
    expect(Math.floor(uvOf(a, 'hull') * order(BASE).length * SLOT_PX))
      .toBe(Math.floor(uvOf(b, 'hull') * order(made.def).length * SLOT_PX))
  })

  it('repaints not one pixel of any species already shipped', async () => {
    /*
     * The §19 answer, demonstrated rather than assumed, on the real definitions
     * the game loads. A pushed species and a pet Juno already owns are both
     * rebuilt from these — `buildAssembly` off the same `CreatureDef` — so if a
     * slot appended today left any of them a different colour, this fails.
     */
    const defs = await loadBuiltDefs()
    expect(defs.size).toBeGreaterThan(10)
    for (const [id, def] of defs) {
      const before = rendered(id, def)
      /* Append to the LAST thing every animal has, so the case is the real one. */
      const made = giveOwnPaletteSlot(def, { role: 'hull' })
      expect(made.slot, `${id} refused a slot for its hull`).not.toBeNull()
      const after = rendered(id, made.def)
      for (const [mesh, was] of before) {
        if (mesh === 'hull') continue
        expect(after.get(mesh), `${id}: mesh "${mesh}" changed colour`).toEqual(was)
      }
      /* The hull itself is unchanged too, because the new slot is seeded with the
       * colour it already wore. Nothing on screen moves until a swatch is dragged. */
      expect(after.get('hull'), `${id}: the hull changed colour`).toEqual(before.get('hull'))
      expect(order(made.def).slice(0, order(def).length)).toEqual(order(def))
    }
  })
})

describe('the new slot survives the way an edit leaves the editor', () => {
  const put = insertPart(BASE, 'cone-02')
  const made = giveOwnPaletteSlot(put.def, put.path!)
  const OWN = setPaletteColour(made.def, made.slot!, 0x18a558)

  it('round-trips through the draft save, which is JSON', () => {
    /* `main.ts`'s `save()` posts the definition itself to `/api/save`, so the
     * serialisation is `JSON.stringify`/`parse` — which preserves string-key
     * insertion order, and that order is the texture layout. */
    const back = JSON.parse(JSON.stringify(OWN)) as CreatureDef
    expect(order(back)).toEqual(order(OWN))
    expect(back.palette[made.slot!]).toBe(0x18a558)
    expect(rendered(ID, back)).toEqual(rendered(ID, OWN))
  })

  it('round-trips through the push, which is a module file', () => {
    const src = defToModuleSource(ID, OWN)
    /* Emitted LAST, because that is the row it occupies. Quoted, because the
     * name came off a bank id and `cone-02` is not a JavaScript identifier —
     * `key()` handles that, and a module that would not parse is not a save. */
    const at = (s: string): number => src.indexOf(s)
    for (const slot of order(BASE)) {
      expect(at(`${slot}: 0x`), `"${slot}" is not before the new slot`)
        .toBeLessThan(at("'cone-02': 0x"))
    }
    expect(src).toContain("'cone-02': 0x18a558,")
    /* And the part that points at it points at it by name. */
    expect(src).toContain("paint: 'cone-02'")
    expect(src).not.toContain('\r')
  })

  it('emits a quoted key when the slot name is not an identifier', () => {
    /* `uniquePaletteSlot` keeps hyphens rather than mangling them away, so a
     * disambiguated `tip-2` must reach the file as a QUOTED key or the module
     * will not parse. `key()` does that; this is the assertion that it is used. */
    const clash = addPaletteSlot(BASE, 'tip-2', 0x123456)
    expect(defToModuleSource(ID, clash)).toContain("'tip-2': 0x123456,")
  })
})

describe('a slot name already in the palette is disambiguated, never reused', () => {
  it('never returns a name the palette already has', () => {
    expect(uniquePaletteSlot(BASE, 'mouth')).toBe('mouth')
    expect(uniquePaletteSlot(BASE, 'coat')).toBe('coat-2')
    expect(uniquePaletteSlot(addPaletteSlot(BASE, 'coat-2', 0), 'coat')).toBe('coat-3')
    /* Reduced to a palette word, and never to the empty string. */
    expect(uniquePaletteSlot(BASE, 'Cone-02')).toBe('cone-02')
    expect(uniquePaletteSlot(BASE, '  ')).toBe('slot')
  })

  it('appends beside a colliding name instead of recolouring it', () => {
    /*
     * The trap this exists for: `addPaletteSlot` on a name the palette HAS
     * recolours it in place and appends nothing — so a part handed the colliding
     * name would repaint every part already on it, which is the original bug
     * wearing a new button.
     */
    const clashing: CreatureDef = {
      ...BASE, extras: [{ name: 'tip', part: 'cone-01', at: [0, 1.43125, 0.2] }],
    }
    const before = rendered(ID, clashing)
    const made = giveOwnPaletteSlot(clashing, { role: 'extras', index: 0 })
    expect(made.slot).toBe('tip-2')
    expect(order(made.def)).toEqual([...order(BASE), 'tip-2'])
    /* `tip` kept its colour AND its column. */
    expect(made.def.palette['tip']).toBe(BASE.palette['tip'])
    expect(rendered(ID, made.def)).toEqual(before)

    const own = setPaletteColour(made.def, 'tip-2', 0xff00ff)
    const after = rendered(ID, own)
    expect(after.get('tip')).toEqual([0xff00ff])
    /* Two parts named for the same slot word, and only the one asked for moved. */
    expect(after.get('hull')).toEqual(before.get('hull'))
  })

  it('gives two parts two slots, not one shared one', () => {
    const one = giveOwnPaletteSlot(BASE, { role: 'ears' })
    const two = giveOwnPaletteSlot(one.def, { role: 'snout' })
    expect([one.slot, two.slot]).toEqual(['ear', 'snout'])
    const a = setPaletteColour(two.def, 'ear', 0x112233)
    const b = setPaletteColour(a, 'snout', 0x445566)
    const out = rendered(ID, b)
    expect(out.get('ear-r')).toEqual([0x112233])
    expect(out.get('snout')).toEqual([0x445566])
  })
})

/**
 * The panel is DOM glue and glue is where this repo has repeatedly shipped a
 * finished mechanism nobody could reach — the album and the ceremonies are both
 * pinned this same way (`tests/island/album.test.ts`, `barrier.test.ts`): read
 * the source, assert the wiring is there. Without this, every claim above would
 * still pass with the button deleted, and Joe would still not be able to colour
 * his mouth. That is the exact failure mode the rest of this file exists for.
 */
describe('the colour panel actually offers it', () => {
  const here = fileURLToPath(new URL('.', import.meta.url))
  const MAIN = resolve(here, '../../tools/workbench/public/editor/main.ts')
  const source = readFileSync(MAIN, 'utf8')

  it('imports the two ops the fix is made of', () => {
    expect(source).toMatch(/giveOwnPaletteSlot[\s\S]{0,400}?from '\.\/def'/)
    expect(source).toMatch(/paintSlotOf[\s\S]{0,400}?from '\.\/def'/)
  })

  it('gives the SELECTED part a slot of its own, through apply()', () => {
    /* `apply` is the one way a change happens: it rebuilds, it reports a refusal,
     * and it marks the definition unsaved. A call that wrote `def` directly would
     * leave the page saying "saved" over an edit. */
    const at = source.indexOf('giveOwnPaletteSlot(def, path)')
    expect(at, 'the panel never asks a part for its own slot').toBeGreaterThan(-1)
    expect(source.slice(at, at + 400)).toContain('apply(')
    /* And a refusal is said out loud rather than swallowed. */
    expect(source.slice(at, at + 400)).toMatch(/slot === null/)
  })

  it('marks the slot a part is painted from even when it says nothing', () => {
    /* The half of the bug that is pure display: the panel used to read
     * `slot.paint` and mark NO row for a part with none — which is every freshly
     * inserted part — so the mouth looked like it had no colour at all. */
    expect(source).toContain('paintSlotOf(def, path)')
    expect(source).not.toMatch(/const usedSlot = typeof paint === 'string'/)
  })

  it('offers it as a button the user can press', () => {
    expect(source).toContain('own colour')
    expect(readFileSync(resolve(here, '../../tools/workbench/public/editor/editor.css'), 'utf8'))
      .toContain('#palette li.own')
  })
})

describe('paintSlotOf mirrors creature.ts and has not drifted from it', () => {
  /**
   * The mirror is the one thing in the fix that restates a rule `creature.ts`
   * owns — the per-role fallback a part with no `paint` is given. So it is
   * checked against what the REAL builder resolved, role by role, on a
   * definition that states no paint anywhere.
   */
  const BARE: CreatureDef = {
    palette: { coat: 0x111111, belly: 0x222222, limb: 0x333333 },
    ears: { part: 'cone-04' },
    tail: { part: 'cone-01' },
    snout: { part: 'cone-06' },
    nose: { part: 'box-26' },
    extras: [{ name: 'wart', part: 'cone-01', at: [0, 1.43125, 0.2] }],
  }

  const CASES: { path: DefPath; feature: string }[] = [
    { path: { role: 'legs' }, feature: 'leg' },
    { path: { role: 'eyes' }, feature: 'eye' },
    { path: { role: 'ears' }, feature: 'ear' },
    { path: { role: 'tail' }, feature: 'tail' },
    { path: { role: 'snout' }, feature: 'snout' },
    { path: { role: 'nose' }, feature: 'nose' },
    { path: { role: 'extras', index: 0 }, feature: 'wart' },
  ]

  it('resolves the same slot the builder does, for every role', () => {
    const spec = creatureSpec(ID, BARE)
    expect(paintSlotOf(BARE, { role: 'hull' })).toBe(spec.hull.paint.base)
    for (const c of CASES) {
      const f = spec.features.find(x => x.name === c.feature)
      expect(f, `no feature "${c.feature}" in the build`).toBeDefined()
      expect(paintSlotOf(BARE, c.path), `role ${c.feature}`).toBe(f!.paint.base)
    }
  })

  it('follows the definition\'s own coat/under/limb overrides', () => {
    const over: CreatureDef = { ...BARE, coat: 'limb', under: 'coat', limb: 'belly' }
    const spec = creatureSpec(ID, over)
    expect(paintSlotOf(over, { role: 'hull' })).toBe(spec.hull.paint.base)
    for (const c of CASES) {
      const f = spec.features.find(x => x.name === c.feature)!
      expect(paintSlotOf(over, c.path), `role ${c.feature}`).toBe(f.paint.base)
    }
  })

  it('falls back to the FIRST slot when there is no slot called coat', () => {
    const odd: CreatureDef = { palette: { fur: 0xabcdef, nose: 0x010101 }, ears: { part: 'cone-04' } }
    const spec = creatureSpec(ID, odd)
    expect(paintSlotOf(odd, { role: 'ears' })).toBe('fur')
    expect(spec.features.find(f => f.name === 'ear')!.paint.base).toBe('fur')
  })

  it('says null for a slot the species does not have', () => {
    expect(paintSlotOf({ ...BASE, legs: false }, { role: 'legs' })).toBeNull()
    expect(paintSlotOf(BASE, { role: 'ridge' })).toBeNull()
    expect(paintSlotOf(BASE, { role: 'extras', index: 9 })).toBeNull()
  })

  it('is what the panel marks as used, so the default is visible at all', () => {
    /* Before the fix the panel read `slot.paint` and marked NOTHING for a part
     * that had none — the state a freshly inserted part is always in. Every part
     * of a real species must resolve to a slot the palette actually has. */
    for (const row of listParts(BARE)) {
      const slot = paintSlotOf(BARE, row.path)
      expect(slot, `${row.label} resolved to no slot`).not.toBeNull()
      expect(BARE.palette[slot!], `${row.label} -> "${slot}" is not in the palette`).toBeDefined()
    }
  })
})
