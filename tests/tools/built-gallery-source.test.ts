/**
 * The JOIN between a gallery and its data source, which is the seam that broke.
 *
 * On 29 July Joe reported that the viewer's "Built animals" gallery listed the
 * PROPS. 1791 tests were green at the time and every one of them was right:
 * `built-bench.test.ts` proves the bench is built from the species registry,
 * and the registry tests prove the props catalogue is the props catalogue.
 * Nothing asserted that the fourth gallery is wired to the first source, so
 * nothing noticed when it wasn't.
 *
 * Two faults met, and this file pins both:
 *
 *   THE UNNAMED ELSE. `viewer.ts shown()` chose a gallery's disk packs with an
 *   inline ternary — `species ? pets : tiles ? tiles : props|forest`. Three arms
 *   for four galleries, so `built` fell out of the ELSE and inherited the props.
 *   A gallery added to the union could not fail to compile and could not fail a
 *   test; it silently acquired another gallery's data. That rule is now
 *   `packsFor()` in `registry.ts`, exhaustive and asserted below.
 *
 *   THE STALE SERVER. What Joe was actually served was a Vite dev server from
 *   the previous day, still holding a module graph whose `Gallery` union had no
 *   `built` in it at all — see `vite.workbench.config.ts` and the `strictPort`
 *   assertion at the bottom of this file. Today's `npm run workbench` had found
 *   4173 taken and moved quietly to 4174, so the agent that verified the viewer
 *   and the man who reported it broken were looking at two different servers,
 *   and both were telling the truth.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { builtBench } from '../../tools/workbench/public/built'
import { buildCatalogue, packsFor, type Gallery, type Pack } from '../../tools/workbench/public/registry'
import { SHIPPED_SPECIES, speciesRecord } from '../../src/island/species/registry'

const REPO = resolve(__dirname, '../..')

describe('the built-animals gallery is fed by the species registry', () => {
  it('yields species records, and not one prop id among them', () => {
    const bench = builtBench([])
    expect(bench.length).toBeGreaterThan(0)

    /* The exact confusion Joe saw: every id the props gallery can deal. */
    const props = new Set(buildCatalogue().filter(e => e.gallery === 'props').map(e => e.id))
    expect(props.size).toBeGreaterThan(0)

    for (const creature of bench) {
      /* In the SPECIES registry — the source the gallery claims to read. */
      expect(speciesRecord(creature.speciesId), `${creature.speciesId} is not a species`).toBeDefined()
      /* And not in the prop registry, which is the source it must never read. */
      expect(props.has(creature.speciesId), `${creature.speciesId} is a prop`).toBe(false)
    }
  })

  it('benches every species a kit builds, so an empty bench cannot pass as a full one', () => {
    const bench = builtBench([])
    const buildable = SHIPPED_SPECIES.filter(s => s.build !== undefined)
    expect(bench.map(c => c.speciesId).sort()).toEqual(buildable.map(s => s.id).sort())
  })
})

describe('packsFor: which disk packs a gallery may list', () => {
  /*
   * The whole point of naming this rule. `built` draws from NO pack — a built
   * animal is constructed at runtime and has no file, so there is nothing on
   * disk it could be an orphan of, and an empty list is the honest answer.
   */
  it('gives the built gallery no pack at all', () => {
    expect(packsFor('built')).toEqual([])
  })

  it('keeps the other three on their own packs, so a swap fails here', () => {
    expect(packsFor('species')).toEqual(['pets'])
    expect(packsFor('tiles')).toEqual(['tiles'])
    expect(packsFor('props')).toEqual(['props', 'forest'])
  })

  it('never lets one gallery reach another gallery data', () => {
    const galleries: Gallery[] = ['built', 'species', 'tiles', 'props']
    const seen = new Map<Pack, Gallery>()
    for (const gallery of galleries) {
      for (const pack of packsFor(gallery)) {
        expect(seen.has(pack), `${pack} is claimed by ${seen.get(pack)} and ${gallery}`).toBe(false)
        seen.set(pack, gallery)
      }
    }
    /* Exhaustive: no gallery is served by an unwritten else. */
    expect(galleries.every(g => Array.isArray(packsFor(g)))).toBe(true)
  })
})

describe('the workbench serves what is on disk, or it does not serve', () => {
  /*
   * `strictPort` is the fix for the fault that actually reached Joe. Without
   * it Vite finds 4173 busy, takes 4174, prints it in a line nobody re-reads,
   * and the URL in the bookmark keeps answering — from yesterday's process,
   * with yesterday's module graph. A dev server that quietly moves is a dev
   * server that lets a stale bundle impersonate the current one.
   */
  it('pins port 4173 rather than drifting to the next free one', () => {
    const config = readFileSync(resolve(REPO, 'vite.workbench.config.ts'), 'utf8')
    expect(config).toMatch(/strictPort:\s*true/)
    expect(config).toMatch(/port:\s*4173/)
  })
})
