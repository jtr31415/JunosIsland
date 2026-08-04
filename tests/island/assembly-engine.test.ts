/**
 * THE BUILDER, SWEPT OVER EVERY ANIMAL — and nothing about any animal.
 *
 * ## What replaced 24,324 lines
 *
 * Joe, 4 August 2026: *"we do not need to test the animals. if they look good in
 * the editor, they go. its costing a shit ton of time for needless tests. they
 * should turn from the editor into code pretty much the instant i press the
 * button."*
 *
 * Sixty per-animal test files went with that ruling — one per species, ~400
 * lines each, every one of them a description of a draft: this hull, that
 * station, this exact keep-out radius. They were written when an agent was
 * assembling animals out of the bank and the reasoning needed to be checkable.
 * Joe designs these in the workbench now and reviews them on screen, so every
 * edit he made arrived as a wall of red describing the animal he had just
 * replaced. Three separate times today a push of his was reported as damage on
 * the strength of one of those files.
 *
 * **His eyes on the animal in the editor are the gate.** `signed-off.json` is
 * where that gate is recorded, and `pool.ts` is what enforces it. Nothing in
 * this file second-guesses either.
 *
 * ## Why this file still exists
 *
 * Because his OTHER ruling has not changed, and the two are about different
 * things. From the 3 August block, on what not to cut: *the gates cost CPU
 * rather than context and they stopped a broken build reaching his daughter more
 * than once — cutting them would be optimising the wrong axis entirely.*
 *
 * The distinction that makes both true at once:
 *
 *   - **A claim about an ANIMAL** — "the shrew's tail is carried at 0.907957" —
 *     is Joe's to make and unmake, in the editor, without asking anyone. It has
 *     no business in a test, and none of it is here.
 *   - **A claim about the BUILDER** — "whatever anyone builds, it stands on the
 *     floor and every mesh is a rigid copy of a bank shape" — cannot be
 *     falsified by any edit he makes. If one of these goes red, `assembly.ts` or
 *     `creature.ts` is broken and EVERY animal is wrong, which is exactly the
 *     class of bug that reached his daughter's island before.
 *
 * So the harness is unchanged and the CLAIMS ARE GONE. Every species is swept
 * with `{ id }` and nothing else — no parts list, no vertex count, no height, no
 * mass ratio, no expected stations. There is no per-animal number left in the
 * test tree to re-pin, which is the property that makes a push cost nothing.
 *
 * It also means a NEW animal is covered the moment its file exists: this reads
 * the register rather than a list somebody has to remember to extend, so Joe
 * pressing the button adds an animal to this sweep and to nothing else.
 */
import { describe, it, expect } from 'vitest'
import { assembledSpecies } from '../../src/island/species/parts'
import { assertAssembly } from './assembly-assert'

describe('the register is not empty', () => {
  it('finds animals to sweep, so a silent zero cannot pass as green', () => {
    // The failure mode this whole file would otherwise have: an import that
    // stopped registering species turns every sweep below into nothing at all.
    expect(assembledSpecies().length).toBeGreaterThan(50)
  })
})

/*
 * ONE PASS PER SPECIES, WITH NO CLAIMS. `assertAssembly` registers the builder's
 * invariants for the id it is given; handed nothing else, every assertion it
 * makes is about `buildAssembly` rather than about the creature.
 */
for (const record of assembledSpecies()) assertAssembly({ id: record.id })
