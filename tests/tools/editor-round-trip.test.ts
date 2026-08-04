/**
 * The editor's round trip: what Joe opens is what he pushes back.
 *
 * The workbench species editor has exactly one shape. `loadBuiltDefs()` reads a
 * shipped species' `CreatureDef` off `CREATURE_DEFS`, Joe edits that object, and
 * `defToModuleSource()` writes it back out as the text of
 * `src/island/species/parts/assembled/animal-<slug>.ts`. Nothing in between
 * checks that the second function can say everything the first can hand it — so
 * a field the emitter does not know about is not an error anywhere. It is a
 * silent deletion, applied to a shipped animal, at the moment Joe saves.
 *
 * So this file measures the composition, over every species on the register,
 * enumerated from the register and never listed here:
 *
 *   1. **SEMANTIC LOSSLESSNESS.** Emit a species, import the emitted module for
 *      real, and read the definition back off `CREATURE_DEFS` — the same route
 *      the editor itself uses. The recovered definition must deep-equal the one
 *      that went in.
 *   2. **PALETTE ORDER**, which `toEqual` cannot see. Insertion order IS the
 *      texture layout, so a definition that comes back with its slots shuffled
 *      is a different animal wearing the same numbers.
 *   3. **BYTE FIDELITY**, which is a MEASUREMENT and not a requirement: does the
 *      emitted text equal the file on disk? `defToModuleSource`'s own doc says
 *      the prose is not reproduced, so this is expected to fail and is recorded
 *      skipped, with what differs written down beside it.
 *   4. **NO FIELD IS DROPPED.** The emitter walks a hardcoded key list. A field
 *      added to `CreatureDef` and forgotten there vanishes on save.
 *
 * **Nothing here asserts what any species IS.** No species name and no part id,
 * colour or coordinate appear together in any assertion below, deliberately: the
 * animals are Joe's to change from the editor, and a test that pinned one to its
 * current geometry would lock him out of his own tool. Every claim is of the
 * form "what went in came out", which stays true whatever he draws.
 *
 * ===========================================================================
 * ## WHY THIS IS ONE CASE PER SPECIES — PB-082, and it is packaging, not scope
 * ===========================================================================
 *
 * Claims 1 and 2 used to be two `it`s, each looping over the whole register.
 * That shape cost the same per species and spent it in two places, and by 86
 * species it no longer fitted vitest's 5 s default UNDER FULL-SUITE LOAD while
 * still passing alone — which made `npm test` red and blocked every deploy, not
 * only the animals. PB-082 was raised for exactly that and deliberately did NOT
 * raise the timeout: the standing rule here is that moving a constant to make a
 * gate green buries real faults. It asked for a measurement and a decision.
 *
 * **The measurement, taken at 86 species on 4 August 2026:**
 *
 *       whole file, alone                2438 ms   (29 ms per species)
 *       whole file, under full load     ~9900 ms  (116 ms per species)
 *
 * Contention is the multiplier, not the species count — the same work is ~4x
 * dearer when vitest is running 133 files across its workers. And the second
 * failure was DOWNSTREAM of the first: alone, claim 2 costs 299 ms because
 * claim 1 has already cached every dynamic import; under load claim 1 was
 * aborted part-way, so nothing was cached and claim 2 paid for it all again.
 *
 * **So the fix is the packaging.** One `it` per species, each doing the
 * emit-write-import ONCE and answering both claims off it:
 *
 *   - **No constant moved and no assertion relaxed.** All 86 still round-trip
 *     and all 86 still keep their palette order. Coverage is identical.
 *   - **116 ms against a 5 s budget is a 43x margin**, and it holds at the full
 *     roster of 320 — where the old shape would have wanted ~37 s.
 *   - **The report gets better.** "2 of 86 failed" becomes the names of the two.
 *   - **It is 86 cases and not 172**, because merging the two loops into one is
 *     the free half of this: the trip was being made twice per species to answer
 *     two questions about the same journey.
 *
 * **The count guard below is load-bearing and is new.** A parameterised suite
 * over an empty map generates no cases and reports green, which is the one way
 * this shape can fail silently where the old one could not. `assembly-engine`
 * carries the same guard for the same reason.
 */
import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defToModuleSource } from '../../tools/workbench/public/editor/def'
import { loadBuiltDefs } from '../../tools/workbench/public/editor/capture'
import { CREATURE_DEFS } from '../../src/island/species/parts/creature'
import type { CreatureDef } from '../../src/island/species/parts'

/**
 * Read once, at module scope, because the case list is derived from it.
 *
 * The await is here and not inside a case so that `describe` can name one `it`
 * per species. It hides no cost: all this does is import the species barrel,
 * which vitest already reports under `import` and which the old shape paid for
 * too. Every emit, write and dynamic import — the work PB-082 is about — still
 * happens inside a case, inside the 5 s default, and is not moved anywhere.
 *
 * Later `-roundtrip` registrations must not appear in the subject list, which is
 * why this is a copy taken before any of them exist.
 */
const DEFS = await loadBuiltDefs()

const ASSEMBLED = resolve(__dirname, '../../src/island/species/parts/assembled')
const CREATURE_MODULE = resolve(__dirname, '../../src/island/species/parts/creature.ts')

const OUT = mkdtempSync(join(tmpdir(), 'editor-round-trip-'))

afterAll(() => {
  rmSync(OUT, { recursive: true, force: true })
})

/**
 * A definition, out through the emitter and back in through a real module load.
 *
 * The emitted text is written to a file and `import`ed, so what recovers the
 * definition is the TypeScript pipeline and `defineCreature` itself rather than
 * anything this test understands about the format. Two rewrites make that
 * possible and neither touches the data:
 *
 *   - the relative `'../creature'` specifier is repointed at the real module by
 *     absolute URL, because the emitted file is not sitting in `assembled/`;
 *   - the species id is suffixed, because `defineAssembly` refuses to register
 *     one id twice with two different builds and the original is already on the
 *     register. The id is not part of the definition, so this changes nothing
 *     that is compared.
 *
 * **This is the expensive call and it is made ONCE per species**, which is the
 * whole of PB-082's fix. Two claims are read off the one result.
 */
const recover = async (speciesId: string, source: string): Promise<CreatureDef | undefined> => {
  const roundTripId = `${speciesId}-roundtrip`
  const module = source
    .replace("'../creature'", `'${pathToFileURL(CREATURE_MODULE).href}'`)
    .replace(`defineCreature('${speciesId}'`, `defineCreature('${roundTripId}'`)
  const file = join(OUT, `${speciesId}.ts`)
  writeFileSync(file, module, 'utf8')
  await import(/* @vite-ignore */ pathToFileURL(file).href)
  return CREATURE_DEFS.get(roundTripId)
}

/** Which fields of two definitions disagree, as one readable line each. */
const fieldDiffs = (before: CreatureDef, after: CreatureDef | undefined): string[] => {
  /* Through `unknown`: `CreatureDef` has no index signature, and this only reads. */
  const a = before as unknown as Record<string, unknown>
  const b = (after ?? {}) as unknown as Record<string, unknown>
  const out: string[] = []
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = JSON.stringify(a[k])
    const y = JSON.stringify(b[k])
    if (x !== y) out.push(`  ${k}: in ${x} -> out ${y}`)
  }
  return out
}

/** Every top-level key the emitted module actually writes down, in its order. */
const emittedKeys = (source: string): string[] =>
  source.split('\n')
    .map(l => /^ {2}([A-Za-z_$][A-Za-z0-9_$]*):/.exec(l)?.[1])
    .filter((k): k is string => k !== undefined)

describe('a definition survives the trip out of the editor and back', () => {
  /*
   * THE GUARD ON THE SHAPE ITSELF. Every case below is generated from `DEFS`, so
   * an empty map is zero cases and a green run — the one failure mode a
   * parameterised suite has that a loop inside one case does not. Asserted
   * rather than assumed, and deliberately not folded into a species case, where
   * it would only run if there were already a species to run it.
   */
  it('finds species to sweep, so a silent zero cannot pass as green', () => {
    expect(DEFS.size).toBeGreaterThan(50)
  })

  /*
   * ONE CASE PER SPECIES, ONE TRIP EACH, TWO CLAIMS OFF IT. See the header for
   * why the shape is this and what it is not: no timeout moved, no assertion
   * relaxed, every species still checked for both things.
   */
  for (const [id, def] of DEFS) {
    it(`${id}: recovers from its own emitted module, palette order and all`, async () => {
      const back = await recover(id, defToModuleSource(id, def))

      /* CLAIM 1. `toEqual` and not a string compare: top-level key order is the
       * emitter's own (`DEF_KEYS`) and is not data. */
      expect(back, `${id} does not survive the round trip:\n${fieldDiffs(def, back).join('\n')}`)
        .toEqual(def)

      /* CLAIM 2, and it is not implied by claim 1: `toEqual` compares an
       * object's entries and ignores their ORDER, while palette order is the
       * texture layout and therefore data. Checked as a key sequence, which is
       * the only way to see it. */
      const before = Object.keys(def.palette)
      const after = Object.keys(back?.palette ?? {})
      expect(after, `${id}: the palette came back in a different order — `
        + `in [${before.join(', ')}] -> out [${after.join(', ')}]`).toEqual(before)
    })
  }

  /**
   * MEASURED 2 Aug 2026, AND IT FAILS: 0 of 30 species emit byte-identical to the
   * file they were loaded from. Skipped rather than deleted, because the number
   * is the finding and the day the generator is asked to reproduce a file this is
   * the assertion that says whether it does.
   *
   * What differs, all of it prose or layout and none of it data:
   *
   *   - **The leading doc comment, 30 of 30.** The generator writes the same
   *     eleven-line placeholder every time; the shipped files carry the
   *     derivations. `animal-mouse` is 108 lines on disk against 29 emitted,
   *     `animal-hedgehog` 286 against 50. `defToModuleSource`'s own doc says this
   *     — "the comments in an existing file are not reproduced and must not be
   *     lost" — so it is a stated non-goal, not a defect.
   *   - **A second import line, 30 of 30.** Every species file on disk carries
   *     `import { PACK_PUPIL } from '../texture'` and writes `pupil: PACK_PUPIL,`;
   *     the emitter writes the literal `0x…` and a comment saying where it came
   *     from, deliberately, so that `def.ts` stays free of three.js.
   *   - **Field order.** Disk files are in whatever order they were written in;
   *     the emitter imposes `DEF_KEYS`. Two species differ only by an adjacent
   *     pair swapping.
   *   - **`flag` line breaks.** Both wrap at 88 columns but break at different
   *     words, because the hand-written ones break at sentence ends too.
   *   - **Per-field derivation comments** inside the definition block, which the
   *     generator does not have and cannot invent.
   *
   * Strip every comment and blank line and the DATA lines still differ in all 30,
   * on the `PACK_PUPIL` line alone in the mildest cases.
   *
   * LEFT AS ONE LOOPING CASE by PB-082 rather than split per species, because it
   * is skipped and costs nothing, and because the day it is unskipped the thing
   * worth reading is the COUNT — how many of them reproduce — rather than which.
   */
  it.skip('emits the file it was loaded from, byte for byte', () => {
    const differ: string[] = []
    for (const [id, def] of DEFS) {
      const disk = readFileSync(join(ASSEMBLED, `${id}.ts`), 'utf8')
      if (defToModuleSource(id, def) !== disk) differ.push(id)
    }
    expect(differ).toEqual([])
  })
})

describe('the emitter can say everything a definition can', () => {
  /**
   * A definition that uses a field `DEF_KEYS` does not list.
   *
   * `motion` is `CreatureDef`'s newest field and is declared at
   * `src/island/species/parts/creature.ts:330`. No shipped species uses one yet,
   * which is exactly why the union of keys across the register cannot catch it:
   * the first animal Joe gives a wingbeat to would lose it on the first save,
   * silently, with the editor reporting success.
   *
   * The rest of the object is the smallest thing that is a definition at all.
   */
  const WITH_A_NEW_FIELD: CreatureDef = {
    palette: { coat: 0x9a6a3c, belly: 0xdcc7a6, limb: 0x74502c, tip: 0x4e361d },
    ears: { part: 'cone-04' },
    motion: [{ kind: 'flap', parts: ['ears'] }],
  }

  it('writes down every field of the definition it is given', () => {
    const src = defToModuleSource('animal-test', WITH_A_NEW_FIELD)
    const missing = Object.keys(WITH_A_NEW_FIELD).filter(k => !emittedKeys(src).includes(k))
    expect(missing, 'fields dropped on the way out of the editor').toEqual([])
  })

  /*
   * ONE CASE AND NOT ONE PER SPECIES, on purpose: this is `defToModuleSource`
   * alone with no write and no import, it measured 11-22 ms over the whole
   * register, and PB-082 is about the trip rather than about the emitter. Split
   * only what is expensive.
   */
  it('writes down every field the shipped species between them use', () => {
    const missing: string[] = []
    for (const [id, def] of DEFS) {
      const written = emittedKeys(defToModuleSource(id, def))
      for (const k of Object.keys(def)) if (!written.includes(k)) missing.push(`${id}.${k}`)
    }
    expect(missing).toEqual([])
  })
})
