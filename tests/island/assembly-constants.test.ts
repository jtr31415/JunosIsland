/**
 * The three measured constants, re-derived from the bank on every run — and the
 * wiring that makes adding a species a file and a line.
 *
 * `parts/hulls.ts` exists so that no species build ever derives these a fourth
 * time. That is only worth something if the constants are still true, so nothing
 * below quotes them: every number is measured off `PARTS_BANK` here and then
 * compared to the export. A constant that drifts from the pack is a red test
 * rather than a comment that used to be right.
 *
 * The second half is the fan-out's own safety net. Twelve species are being built
 * in parallel and each is a new file under `parts/assembled/` plus one line in
 * that directory's `index.ts`. The two failures that costs — a file with no line,
 * and a collection that stopped importing the barrel — are both silent: the
 * species simply does not appear. So they are checked, by reading the directory.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  HULL_BOTTOM_Y, LEG_ROW, HULL_FRONT_Z, HULL_FRONT_Z_USUAL, EYE_CARD_Z,
  PACK_HEIGHT_MIN, HEIGHT_FLOOR, HEIGHT_FLOOR_MARGIN, OTHER_HULLS,
  hullFrontZ, hullFacts, ASSEMBLED_BUILDS, assemblyFor, PACK_PUPIL,
} from '../../src/island/species/parts'
/* Straight from `creature.ts` and not the barrel above: the barrel re-exports
 * `defineCreature` but not the map, and the map is the thing under test. The
 * barrel import is still what POPULATES it — a map does not fill itself. */
import { CREATURE_DEFS } from '../../src/island/species/parts/creature'
import { PARTS_BANK, partById } from '../../src/island/species/parts/bank.generated'
import { speciesRecord } from '../../src/island/species/registry'

const here = dirname(fileURLToPath(import.meta.url))
const ASSEMBLED = resolve(here, '../../src/island/species/parts/assembled')

/* ------------------------------------------------- 1. the leg row never moves --- */

describe('every hull\'s bottom is y = 0.18125, so the leg row never moves', () => {
  it('is where nine of the pack\'s ten hulls actually sit', () => {
    const facts = hullFacts()
    expect(facts).toHaveLength(10)
    /* 1e-5, not zero: the bank records offsets and sizes to six decimals, so a
     * hull whose height is 1.5051 recovers its bottom as 0.1812505. That is the
     * pack's own rounding and it is four orders below the 1/16 authoring grid. */
    const on = facts.filter(h => Math.abs(h.bottom - HULL_BOTTOM_Y) < 1e-5)
    expect(on).toHaveLength(9)
    // The crab is the one that differs, and a crab has no legs in the sense this
    // constant is about.
    const off = facts.filter(h => Math.abs(h.bottom - HULL_BOTTOM_Y) >= 1e-5)
    expect(off.map(h => h.id)).toEqual(['box-13'])
    expect(off[0]!.donors).toEqual(['crab'])
  })

  it('is SOLVED from the pack\'s own leg, which is why it is exact', () => {
    // `box-01` is 0.30625 tall with a measured sunkFractionMax of 0.408163, so a
    // leg joined at a hull bottom B has its foot at B - 0.30625 x (1 - 0.408163).
    // Feet on zero therefore wants B = 0.18125 — and that is where Kenney put
    // every hull he drew, which is the evidence rather than the intention.
    const leg = partById(LEG_ROW.part)!
    expect(leg.size[1]).toBeCloseTo(0.30625, 6)
    expect(leg.attachment!.sunkFractionMax).toBeCloseTo(LEG_ROW.sink, 6)
    expect(leg.size[1]! * (1 - leg.attachment!.sunkFractionMax)).toBeCloseTo(HULL_BOTTOM_Y, 6)
    expect(LEG_ROW.y).toBe(HULL_BOTTOM_Y)
  })
})

/* ------------------------------------------------------- 2. the front face --- */

describe('the hull front face varies, and the eye card does not', () => {
  it('measures each hull\'s front face off the bank, exactly', () => {
    for (const h of hullFacts()) {
      expect(hullFrontZ(h.id), h.id).toBeCloseTo(h.front, 6)
    }
    expect(() => hullFrontZ('box-99')).toThrow(/box-99/)
  })

  it('is 0.625 on seven of them, 0.500 on box-31 and 0.725 on box-41', () => {
    const usual = Object.entries(HULL_FRONT_Z).filter(([, z]) => z === HULL_FRONT_Z_USUAL)
    expect(usual.map(([id]) => id).sort())
      .toEqual(['box-03', 'box-12', 'box-20', 'box-21', 'box-33', 'box-36', 'box-39'])
    expect(HULL_FRONT_Z['box-31']).toBe(0.5)
    expect(HULL_FRONT_Z['box-41']).toBe(0.725)
    // box-31 is the shallow one — 1.125 deep, and pushed back 0.0625 as well.
    expect(partById('box-31')!.size[2]).toBeCloseTo(1.125, 6)
  })

  it('puts EVERY eye card in the pack at z = 0.6350, whatever hull it is on', () => {
    const cards = PARTS_BANK.filter(p => p.roles.includes('eye'))
    expect(cards).toHaveLength(10)
    // 48 instances across the 24 species, standard deviation 0.0000.
    expect(cards.reduce((n, p) => n + p.provenance.length, 0)).toBe(48)
    for (const c of cards) expect(c.offset[2], c.id).toBeCloseTo(EYE_CARD_Z, 6)
  })

  it('floats 0.135 proud on box-31, which is exactly what the LION does', () => {
    // The one that looks like a bug and is not. `box-31` is the lion's own hull,
    // its front face is 0.500, and the lion donates `plate-01` — at 0.635, like
    // everything else. So an eye card is never corrected onto the hull under it.
    const lionHull = hullFacts().find(h => h.donors.includes('lion'))!
    expect(lionHull.id).toBe('box-31')
    expect(EYE_CARD_Z - lionHull.front).toBeCloseTo(0.135, 6)
    expect(partById('plate-01')!.provenance.map(p => p.species)).toContain('lion')
    // On the seven usual hulls it is 0.010 of daylight, which is the same card.
    expect(EYE_CARD_Z - HULL_FRONT_Z_USUAL).toBeCloseTo(0.01, 6)
  })
})

/* --------------------------------------------------- 3. the height is a FLOOR --- */

describe('1.43 is a floor and not a range, so height is decided first', () => {
  it('measures a bare cube on standard legs at 1.43125 — margin 0.00125', () => {
    const cube = partById('box-03')!
    expect(cube.size).toEqual([1.25, 1.25, 1.25])
    // Hull bottom on the leg row's own y, plus the cube. Nothing else on it.
    expect(HULL_BOTTOM_Y + cube.size[1]!).toBeCloseTo(HEIGHT_FLOOR, 9)
    expect(HEIGHT_FLOOR - PACK_HEIGHT_MIN).toBeCloseTo(HEIGHT_FLOOR_MARGIN, 9)
    expect(HEIGHT_FLOOR).toBeGreaterThan(PACK_HEIGHT_MIN)
  })

  it('leaves NO headroom underneath — nothing can be shorter than the cube', () => {
    // The point of the constant. A species designed low fails the height band
    // before a single feature is added to it, and no amount of feature work
    // afterwards recovers it. Low is expressed by choosing a different hull, or
    // it is not expressed: the pack has no short animals in it either.
    expect(HEIGHT_FLOOR_MARGIN).toBeLessThan(0.002)
    const shortest = Math.min(...hullFacts().map(h => h.bottom + h.size[1]!))
    // Only the crab's hull is shorter than the band, and the crab is not a
    // quadruped standing on `box-01` legs.
    expect(shortest).toBeLessThan(PACK_HEIGHT_MIN)
    expect(hullFacts().find(h => h.bottom + h.size[1]! === shortest)!.id).toBe('box-13')
  })
})

/* ------------------------ a bigger body is a different real shell --- */

describe('a different authored hull is the ONLY way to change a body proportion', () => {
  it('is wider, taller or shallower than the cube WITHOUT a stretch', () => {
    // Joe rejected a STRETCHED cube, twice — the second time over the whole built
    // set ("the body/cube should always be the standard size, its often bigger"),
    // and `Hull.stretch` is now `never`. He did not rule that every animal is
    // box-03: these are authored geometry at the proportions Kenney gave it, so
    // they are the whole vocabulary of body size and they need no reason at all.
    expect(partById(OTHER_HULLS.wider)!.size[0]).toBeCloseTo(1.5395, 4)
    expect(partById(OTHER_HULLS.taller)!.size[1]).toBeCloseTo(1.5051, 4)
    expect(partById(OTHER_HULLS.shallower)!.size[2]).toBeCloseTo(1.125, 4)
    expect(partById(OTHER_HULLS.bigger)!.size).toEqual([1.35, 1.3, 1.35])
    const cube = partById('box-03')!
    expect(partById(OTHER_HULLS.wider)!.size[0]).toBeGreaterThan(cube.size[0]!)
    expect(partById(OTHER_HULLS.taller)!.size[1]).toBeGreaterThan(cube.size[1]!)
    expect(partById(OTHER_HULLS.shallower)!.size[2]).toBeLessThan(cube.size[2]!)
  })

  it('leaves the leg row exactly where it was, on every one of them', () => {
    for (const id of Object.values(OTHER_HULLS)) {
      const h = hullFacts().find(q => q.id === id)!
      expect(h.bottom, id).toBeCloseTo(HULL_BOTTOM_Y, 5)
      expect(h.donors.length, id).toBeGreaterThan(0)
    }
  })

  it('is a route `creatureSpec` will actually take — each one carries the hull role', () => {
    // The builder refuses a hull that is in the bank but was never a BODY, which
    // is the half of that check that bites. So the four ids it points a refused
    // species at have to pass it themselves, or the message sends them nowhere.
    for (const id of Object.values(OTHER_HULLS)) {
      expect(partById(id)!.roles, id).toContain('hull')
    }
  })
})

/* ------------------------------------------------------------- the wiring --- */

describe('a species is a file and a line, and both are checked', () => {
  const files = readdirSync(ASSEMBLED)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'register.ts')
    .map(f => f.replace(/\.ts$/, ''))

  it('has every species file on the register — a file with no line is invisible', () => {
    expect(files.length).toBeGreaterThan(0)
    // The file is named for the species id, so the two lists are comparable
    // without parsing anything. A file nobody added a line for shows up here and
    // nowhere else, because the animal simply does not appear.
    expect(files.sort()).toEqual(Object.keys(ASSEMBLED_BUILDS).sort())
  })

  it('names each build after the file it lives in', () => {
    for (const id of files) {
      expect(assemblyFor(id), `${id}.ts does not register "${id}"`).toBeDefined()
      expect(ASSEMBLED_BUILDS[id]).toBe(assemblyFor(id))
    }
  })

  it('attaches every registered build to its own species record', () => {
    // `defineSpecies` looks the assembly up by id, which is what makes adding a
    // species zero lines of `collections/*.ts`. It only works if the collection
    // has evaluated the barrel first — so this is the guard on that import.
    for (const [id, spec] of Object.entries(ASSEMBLED_BUILDS)) {
      const rec = speciesRecord(id)
      expect(rec, `${id} is not in the species registry`).toBeDefined()
      expect(rec!.assembly, `${id} is registered but not attached to its record`).toBe(spec)
    }
  })

  it('paints every species\' pupil the pack\'s own measured grey', () => {
    // `assertAssembly` says this per species, but only for a species somebody
    // wrote a test file for. Joe's note was about every animal built this way —
    // "the new ones have black ones, its a bit crass" — so it is also checked
    // over the whole register, where a species with no test file still counts.
    for (const [id, spec] of Object.entries(ASSEMBLED_BUILDS)) {
      for (const f of spec.features) {
        if (!partById(f.part)?.roles.includes('eye')) continue
        const slot = f.paint.byBand?.[15]
        expect(slot, `${id}: eye card has no pupil slot`).toBeDefined()
        expect(spec.palette[slot!], `${id} paints its pupil ${slot}`).toBe(PACK_PUPIL)
      }
    }
  })

  it('keeps every species\' DEFINITION, which is what the editor opens', () => {
    // The workbench species editor edits a `CreatureDef`, and until `creature.ts`
    // kept one there was nothing to open: a species file passes an object literal
    // into `defineCreature` and exports only the build. The dev server used to
    // rewrite the fourteen leaf files to capture them; this map is what deleted
    // that plugin, so if it ever empties, the editor goes blank and blames the
    // species. Nothing is typed in here — the count is the directory's.
    expect(CREATURE_DEFS.size).toBe(files.length)
    expect([...CREATURE_DEFS.keys()].sort()).toEqual(files.sort())
    // Registration order is the barrel's order, which is the order Joe's list
    // shows, and the hedgehog is first because it shipped first.
    expect([...CREATURE_DEFS.keys()]).toEqual(Object.keys(ASSEMBLED_BUILDS))
  })

  it('keeps the definition AS AUTHORED, not the arithmetic done to it', () => {
    // The mouse, against its own file. A definition's whole point is what it does
    // NOT say — no hull, no legs, no eyes — and if this ever came back as the
    // built `AssemblyBuild`'s ~40 solved numbers instead, the editor would be
    // handing Joe a different species that merely builds the same mesh today.
    const def = CREATURE_DEFS.get('animal-mouse')
    expect(def).toBeDefined()
    expect(Object.keys(def!).sort())
      .toEqual(['belly', 'ears', 'nose', 'palette', 'snout', 'tail'])
    expect(def!.belly).toBe(0.5)
    expect(def!.snout).toBe('tube-01')
    expect(def!.tail).toEqual({ part: 'wedge-07', paint: 'limb', at: [0, 0.9, -0.625] })
    expect(def!.palette.pupil).toBe(PACK_PUPIL)
    // And it is the SAME object the species module holds, not a copy — the copy
    // is the reader's job, and `editor/capture.ts` clones on the way out.
    expect(def!.palette.coat).toBe(0xa08a76)
  })

  it('keeps the collection\'s side-effect import, which is what evaluates them', () => {
    // Read rather than inferred: the failure this guards against is somebody
    // deleting an import that looks unused, and the symptom is every Garden
    // assembly quietly vanishing from the approver bench.
    const garden = readFileSync(
      resolve(here, '../../src/island/species/collections/garden.ts'), 'utf8')
    expect(garden).toMatch(/^import '\.\.\/parts\/assembled'$/m)
  })
})
