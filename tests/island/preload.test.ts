/**
 * @vitest-environment jsdom
 *
 * Joe, from playtesting: *"preloaded the animal otherwise there is a render
 * delay and disappointment."*
 *
 * The hatch is the emotional peak of the whole game — the shell breaks, the
 * stage holds, and she meets her friend. The ceremony already began the fetch
 * as the egg cracked, which buys about 700ms; a ~140KB GLB over a tablet's wifi
 * does not fit in 700ms, so the plinth was empty at exactly the moment it
 * mattered and the friend appeared afterwards, out of nowhere.
 *
 * TWO things have to hold, and the second is the one that is easy to get wrong
 * and impossible to see:
 *
 *  1. The species is decided in ADVANCE, so there is something to preload. It
 *     used to be drawn on the line that hatched it.
 *  2. A load already IN FLIGHT is joined rather than started again. A cache of
 *     finished models is only consulted once a load has completed, so a warm
 *     that has not landed yet is invisible to the hatch — which then fetches
 *     the same file a second time and waits the full cold time anyway. Both
 *     requests succeed, nothing logs, and the preload buys precisely nothing
 *     while costing the bandwidth twice.
 *
 * HANDOFF §5: verify with a cold cache. A pet-model fetch budget of 1200ms
 * passed every time locally and failed every time cleared, because the model
 * was simply always cached. So the loader here is GATED rather than merely
 * counted: a test that asserts "the friend is ready" holds the network open,
 * and anything that reaches for the network fails the assertion instead of
 * quietly succeeding from a cache the tablet will not have.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as THREE from 'three'

/** What the stubbed loader was asked for, and whether it may answer yet. */
const net = vi.hoisted(() => ({
  urls: [] as string[],
  /** Held open while this is set — the cold network, on demand. */
  gate: null as Promise<void> | null,
  /** Next load fails, the way a dropped request on flaky wifi does. */
  fail: false,
}))

vi.mock('three/examples/jsm/loaders/GLTFLoader.js', async () => {
  const T = await import('three')
  class GLTFLoader {
    async loadAsync(url: string): Promise<{ scene: THREE.Group }> {
      net.urls.push(url)
      if (net.gate) await net.gate
      if (net.fail) throw new Error('the network dropped it')
      const scene = new T.Group()
      const body = new T.Mesh(
        new T.BoxGeometry(1.25, 1.55, 1.43), new T.MeshStandardMaterial())
      body.position.y = 1.55 / 2
      scene.add(body)
      return { scene }
    }
  }
  return { GLTFLoader }
})

import { createPetField } from '../../src/island/pets'
import { createLighting } from '../../src/island/lighting'
import meadowDay from '../../src/island/lighting/presets/meadow-day.json'
import type { LightingPreset } from '../../src/island/lighting'

/** How many times the network was asked for this species. */
const fetches = (species: string): number =>
  net.urls.filter(u => u.includes(species)).length

/** A network that never answers — held open for the length of an assertion. */
const holdOpen = (): (() => void) => {
  let release = (): void => {}
  net.gate = new Promise<void>(r => { release = r })
  return () => { const r = release; net.gate = null; r() }
}

/** Resolves to 'waited' if the promise has not settled by the next few turns. */
async function settlesWithoutNetwork<T>(p: Promise<T>): Promise<T | 'waited'> {
  const ticks = (async (): Promise<'waited'> => {
    for (let i = 0; i < 50; i++) await Promise.resolve()
    return 'waited'
  })()
  return Promise.race([p, ticks])
}

beforeEach(() => {
  net.urls = []
  net.gate = null
  net.fail = false
  createLighting(null, meadowDay as LightingPreset)
})

describe('the friend is fetched before she is needed', () => {
  it('leaves the species ready with the network held shut afterwards', async () => {
    /*
     * The promise the whole change exists to make: once the friend has been
     * warmed, the hatch gets her without touching the network. The gate is
     * closed for the second half, so a `preview` that went back out would
     * hang here rather than be quietly rescued by a cache the tablet has not
     * got.
     */
    const field = createPetField()
    await field.warm('animal-cat')
    expect(fetches('animal-cat')).toBe(1)

    const shut = holdOpen()
    const friend = await settlesWithoutNetwork(field.preview('animal-cat'))
    shut()

    expect(friend).not.toBe('waited')
    expect(friend).toBeInstanceOf(THREE.Object3D)
    expect(fetches('animal-cat')).toBe(1)
  })

  it('gives the hatch a CLONE, not the shared prototype', async () => {
    /*
     * A warm must not change what `preview` hands back. HANDOFF: a three.js
     * clone shares geometry and materials with the original, and `stage.showTemp`
     * detaches rather than disposes precisely because of that — so handing out
     * the cached original instead of a clone would put the same object on the
     * turntable and on the island at once.
     */
    const field = createPetField()
    await field.warm('animal-fox')
    const a = await field.preview('animal-fox')
    const b = await field.preview('animal-fox')
    expect(a).not.toBe(b)
  })
})

describe('a load already in flight is joined, not started again', () => {
  it('does not fetch twice when the hatch arrives mid-warm', async () => {
    /*
     * THE failure this is really about, and it is silent. If the cache only
     * remembers FINISHED models, a warm that is still in the air is invisible:
     * the hatch misses, opens a second request for the same file, and waits the
     * whole cold time regardless. Every test passes, both fetches succeed, and
     * the preload does nothing except cost the download twice.
     */
    const field = createPetField()
    const open = holdOpen()

    const warmed = field.warm('animal-panda')
    const shown = field.preview('animal-panda')
    expect(fetches('animal-panda')).toBe(1)

    open()
    await warmed
    expect(await shown).toBeInstanceOf(THREE.Object3D)
    expect(fetches('animal-panda')).toBe(1)
  })

  it('collapses two live pets of one species into a single request', async () => {
    const field = createPetField()
    const open = holdOpen()
    const both = Promise.all([
      field.preview('animal-bunny'), field.preview('animal-bunny')])
    open()
    await both
    expect(fetches('animal-bunny')).toBe(1)
  })
})

describe('a preload that fails costs nothing', () => {
  it('never rejects, because nobody is awaiting it', async () => {
    /*
     * It is fired with `void` alongside a ceremony that locks the exits. A
     * rejection there is an unhandled rejection at best; at worst somebody
     * later awaits it and the lock never comes off.
     */
    const field = createPetField()
    net.fail = true
    await expect(field.warm('animal-bee')).resolves.toBeUndefined()
  })

  it('does not poison the species for the rest of the session', async () => {
    /*
     * Brief §19: nothing she owns can be lost. One dropped request must not
     * mean that species can never hatch again until she reloads — so a failure
     * is evicted rather than remembered, and the hatch tries for itself.
     */
    const field = createPetField()
    net.fail = true
    await field.warm('animal-deer')

    net.fail = false
    const friend = await field.preview('animal-deer')
    expect(friend).toBeInstanceOf(THREE.Object3D)
    expect(fetches('animal-deer')).toBe(2)
  })

  it('lets the hatch retry after its own load failed', async () => {
    const field = createPetField()
    net.fail = true
    await expect(field.preview('animal-crab')).rejects.toThrow()

    net.fail = false
    expect(await field.preview('animal-crab')).toBeInstanceOf(THREE.Object3D)
  })
})

/*
 * The trigger itself lives in main.ts, which is untested glue and the repeat
 * offender HANDOFF §5 names. Same backstop as opening.test.ts and barrier.test.ts
 * use, and for the same reason: `warm` cannot reach the place where somebody
 * forgets to call it, or calls it too late to be worth anything.
 */
const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(resolve(here, '../../src/island/main.ts'), 'utf8')

/** Comments stripped, so prose about the rule cannot stand in for the rule. */
const code = source
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

/** The body of `passed`, where a completed page becomes a friend. */
const passed = ((): string => {
  const at = code.indexOf('async function passed(')
  expect(at, 'passed() must still exist').toBeGreaterThan(-1)
  const rest = code.slice(at)
  const end = rest.indexOf('\n  function ')
  return end > 0 ? rest.slice(0, end) : rest
})()

describe('main.ts decides the species early enough to preload it', () => {
  it('does not draw the species on the line that hatches it', () => {
    /*
     * The original: `SPECIES[ri(defaultRng, SPECIES.length)]` sat two lines
     * above `handleChallengePassed`, so the friend was not known until the
     * instant she was needed and there was nothing at all to preload.
     */
    expect(passed).not.toMatch(/SPECIES\s*\[\s*ri\(/)
    expect(passed).toContain('const species = nextSpecies')
  })

  it('draws it once, outside the hatch, where it can be warmed', () => {
    /*
     * `drawSpecies` was a bare uniform pick — `SPECIES[ri(...)]` — and is now a
     * remembered draw (see species.test.ts for why). What this test cares about
     * is unchanged and is not the implementation: ONE named function, defined
     * outside `passed`, whose result is seated in `nextSpecies` where the
     * preload can reach it.
     */
    expect(code).toMatch(/const drawSpecies = makeMemoryDeck<string>\(\s*defaultRng, SPECIES,/)
    expect(code).toContain('let nextSpecies = drawSpecies()')
  })

  it('warms it at boot, and again as soon as an egg is spent', () => {
    /*
     * Two triggers, and both are needed. Boot covers the first egg, which is
     * several minutes of reading away; the re-warm covers every egg after it,
     * since the species that was warmed has just been used up.
     */
    expect(code.match(/pets\.warm\(/g) ?? []).toHaveLength(2)
    expect(passed).toContain('nextSpecies = drawSpecies()')
    expect(passed).toContain('void pets.warm(nextSpecies)')
  })

  it('never awaits the warm', () => {
    /*
     * HANDOFF §5: anything async in main.ts races live input, and the hatch is
     * a ceremony that holds the exits shut in a `finally`. A preload awaited
     * anywhere inside that could extend the lock over a network fetch — which
     * is the exact soft-lock `petLoadMs` was added to bound. Fire and forget,
     * always.
     */
    expect(code).not.toContain('await pets.warm(')
  })

  it('warms the first friend after the world has started, not before', () => {
    /*
     * The island's own models are the boot critical path. A pet nobody can see
     * for several minutes must not compete with them for a tablet's bandwidth —
     * the preload is for spending the quiet time, not the busy time.
     */
    const start = code.indexOf('world.start()')
    const boot = code.lastIndexOf('void pets.warm(nextSpecies)')
    expect(start).toBeGreaterThan(-1)
    expect(boot).toBeGreaterThan(start)
  })
})
