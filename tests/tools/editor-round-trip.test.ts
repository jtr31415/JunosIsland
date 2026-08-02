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
 *   2. **BYTE FIDELITY**, which is a MEASUREMENT and not a requirement: does the
 *      emitted text equal the file on disk? `defToModuleSource`'s own doc says
 *      the prose is not reproduced, so this is expected to fail and is recorded
 *      skipped, with what differs written down beside it.
 *   3. **NO FIELD IS DROPPED.** The emitter walks a hardcoded key list. A field
 *      added to `CreatureDef` and forgotten there vanishes on save.
 *
 * **Nothing here asserts what any species IS.** No species name and no part id,
 * colour or coordinate appear together in any assertion below, deliberately: the
 * animals are Joe's to change from the editor, and a test that pinned one to its
 * current geometry would lock him out of his own tool. Every claim is of the
 * form "what went in came out", which stays true whatever he draws.
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

/** Read once. Later `-roundtrip` registrations must not appear in the subject list. */
const DEFS = loadBuiltDefs()

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
  it('recovers every registered species from its own emitted module', async () => {
    const defs = await DEFS
    expect(defs.size).toBeGreaterThan(0)
    const lost: string[] = []
    for (const [id, def] of defs) {
      const back = await recover(id, defToModuleSource(id, def))
      /* `toEqual` and not a string compare: top-level key order is the emitter's
       * own (`DEF_KEYS`) and is not data. Palette order IS data, and `toEqual`
       * on the palette object would miss a reorder — so it is checked separately
       * below, by key sequence. */
      try {
        expect(back).toEqual(def)
      } catch {
        lost.push(`${id}\n${fieldDiffs(def, back).join('\n')}`)
      }
    }
    expect(lost, `${lost.length} of ${defs.size} species do not survive the round trip`)
      .toEqual([])
  })

  it('keeps the palette in its own order, which is the texture layout', async () => {
    const defs = await DEFS
    const reordered: string[] = []
    for (const [id, def] of defs) {
      const back = await recover(id, defToModuleSource(id, def))
      const before = Object.keys(def.palette)
      const after = Object.keys(back?.palette ?? {})
      if (before.join(',') !== after.join(',')) {
        reordered.push(`${id}: in [${before.join(', ')}] -> out [${after.join(', ')}]`)
      }
    }
    expect(reordered).toEqual([])
  })

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
   */
  it.skip('emits the file it was loaded from, byte for byte', async () => {
    const defs = await DEFS
    const differ: string[] = []
    for (const [id, def] of defs) {
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

  it('writes down every field the shipped species between them use', async () => {
    const defs = await DEFS
    const missing: string[] = []
    for (const [id, def] of defs) {
      const written = emittedKeys(defToModuleSource(id, def))
      for (const k of Object.keys(def)) if (!written.includes(k)) missing.push(`${id}.${k}`)
    }
    expect(missing).toEqual([])
  })
})
