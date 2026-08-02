/**
 * The JOIN between a gallery and its data source, which is the seam that broke.
 *
 * On 29 July Joe reported that the viewer's "Built animals" gallery listed the
 * PROPS. 1791 tests were green at the time and every one of them was right: the
 * bench was built from the species registry, and the registry tests proved the
 * props catalogue is the props catalogue. Nothing asserted that the fourth
 * gallery is wired to the first source, so nothing noticed when it wasn't.
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
 *
 * The `built` gallery itself is gone — see the fourth block in this file, which
 * is where the removal is held down. What survives it is the RULE, because the
 * rule was never about that one gallery.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { Box3, Vector3 } from 'three'
import { packsFor, GALLERIES, type Gallery, type Pack } from '../../tools/workbench/public/registry'
import { assembledSpecies, buildAssembled } from '../../src/island/species/parts'

const REPO = resolve(__dirname, '../..')

const viewerHtml = (): string => readFileSync(resolve(REPO, 'tools/workbench/public/viewer.html'), 'utf8')
const viewerTs = (): string => readFileSync(resolve(REPO, 'tools/workbench/public/viewer.ts'), 'utf8')

/**
 * Every gallery the tab rail actually names, in the order the tabs appear.
 *
 * Parsed out of the real HTML rather than listed here, because a second typed
 * copy of the set is the precise fault this file was opened to stop — see the
 * note in `registry.ts` about the list that held `['built','species','tiles',
 * 'props']` and so could not see a fifth gallery at all.
 */
const galleriesIn = (html: string): string[] =>
  [...html.matchAll(/data-gallery="([^"]*)"/g)].map(m => m[1]!)

/**
 * A name the union does not hold, forced through the door on purpose.
 *
 * Going through `string` rather than writing `'built' as Gallery` because the
 * literal form does not compile — and that failure to compile is itself the
 * guard working, so it is worth saying out loud rather than deleting. What the
 * tests below need is the RUNTIME behaviour of `packsFor` when a caller
 * nonetheless hands it a name nobody wrote an arm for, which is what a fifth
 * gallery would be on the day somebody adds one.
 */
const outsideTheUnion = (name: string): Gallery => name as Gallery

describe('packsFor: which disk packs a gallery may list', () => {
  it('keeps the three pack-owning galleries on their own packs, so a swap fails here', () => {
    expect(packsFor('species')).toEqual(['pets'])
    expect(packsFor('tiles')).toEqual(['tiles'])
    expect(packsFor('props')).toEqual(['props', 'forest'])
  })

  /*
   * The whole point of naming this rule: the galleries whose honest answer is
   * NOTHING still have an arm written out. Both of these put real pack GLBs on
   * the turntable — `assembled` stands one of ours beside `pets/animal-fox.glb`
   * and `anatomy` takes that same fox apart — so claiming `pets` would look
   * reasonable in both cases and would be wrong in both. The species gallery
   * owns that pack and is the one place a missing or unused pet file is
   * reported; a second claim reports all 24 twice and trips the guard below.
   * These two BORROW their models, and borrowing is not owning.
   */
  it('gives the two borrowing galleries no pack at all', () => {
    expect(packsFor('assembled')).toEqual([])
    expect(packsFor('anatomy')).toEqual([])
  })

  /*
   * THE LATENT TRAP, and what it cost to find it.
   *
   * This test used to hold its own copy of the gallery list —
   * `['built','species','tiles','props']`, typed inline — so the very test
   * written to stop a gallery inheriting another's source could not see a fifth
   * gallery at all. Adding one would have compiled, run green here, and been
   * silently uncovered: exactly the shape of the fault of 29 July, one level up.
   *
   * `GALLERIES` in `registry.ts` is now the single place the set exists, and the
   * union is DERIVED from it. So this loop cannot fall behind the union, and a
   * gallery added without an arm in `packsFor` fails to compile before it ever
   * reaches here.
   */
  it('never lets one gallery reach another gallery data', () => {
    const seen = new Map<Pack, Gallery>()
    for (const gallery of GALLERIES) {
      for (const pack of packsFor(gallery)) {
        expect(seen.has(pack), `${pack} is claimed by ${seen.get(pack)} and ${gallery}`).toBe(false)
        seen.set(pack, gallery)
      }
    }
  })

  it('answers for every gallery there is, off the one list there is', () => {
    /* Not `.length === 5`: the point is that the loop follows the union, not
     * that the union is a particular size today. */
    expect(GALLERIES.length).toBeGreaterThan(0)
    expect(new Set(GALLERIES).size).toBe(GALLERIES.length)
    for (const gallery of GALLERIES) {
      expect(Array.isArray(packsFor(gallery)), `${gallery} has no arm in packsFor`).toBe(true)
    }
  })

  /*
   * AND THE ARMS ARE COLLECTIVELY EXHAUSTIVE, which is a different claim from
   * the one above and is the one that would actually have caught 29 July.
   *
   * "Every gallery has an arm" passes just as happily when the switch ends in a
   * `default:` that hands out the props — that IS what the old inline ternary
   * did, and it is why a gallery nobody had thought about got a full listing of
   * somebody else's files instead of an error. So this asks the opposite
   * question: given a name that is NOT a gallery, does `packsFor` invent an
   * answer? It must not. `undefined` here means there is no unwritten else for a
   * future gallery to fall into, and TypeScript's exhaustiveness check over the
   * union is what turns that into a compile error rather than a surprise.
   */
  it('has no unwritten else for a new gallery to fall into', () => {
    expect(packsFor(outsideTheUnion('not-a-gallery'))).toBeUndefined()
    expect(packsFor(outsideTheUnion('built'))).toBeUndefined()
    expect(packsFor(outsideTheUnion('primitives'))).toBeUndefined()
  })
})

/*
 * THE TAB RAIL AND THE UNION ARE THE SAME SET, IN THE SAME ORDER.
 *
 * The direction that already existed — every gallery has a tab — catches a
 * gallery nobody can open. It does NOT catch the opposite, a tab for a gallery
 * that no longer exists, and that is the hole this run walked through: two
 * galleries were taken out of `GALLERIES` and every test here would have stayed
 * green while the rail was still offering them. A stale tab is worse than a
 * missing one, because it opens something. So both directions are asserted, and
 * the order with them, since the rail is read left to right and the union is the
 * list a reader checks it against.
 */
describe('the tab rail and the gallery union are the same set', () => {
  it('gives every gallery in the union a tab, so none is unreachable', () => {
    const html = viewerHtml()
    for (const gallery of GALLERIES) {
      expect(html, `no tab for the ${gallery} gallery`).toContain(`data-gallery="${gallery}"`)
    }
  })

  it('has no tab for anything that is not a gallery, so none is stale', () => {
    const union = new Set<string>(GALLERIES)
    for (const tab of galleriesIn(viewerHtml())) {
      expect(union.has(tab), `the rail offers ${tab}, which is not in GALLERIES`).toBe(true)
    }
  })

  it('lists them in the union own order, so the rail can be read against the list', () => {
    expect(galleriesIn(viewerHtml())).toEqual([...GALLERIES])
  })

  /*
   * And the reader above has teeth. Fed a rail carrying a tab for a removed
   * gallery it must name that gallery — otherwise the two tests before this one
   * would pass by finding nothing at all, which is how a check written against a
   * regex ends up quietly asserting only that a file exists.
   */
  it('finds a stale tab when there is one to find', () => {
    const stale = viewerHtml().replace(
      '<button data-gallery="anatomy"',
      '<button data-gallery="built">Built animals</button>\n      <button data-gallery="anatomy"',
    )
    const union = new Set<string>(GALLERIES)
    expect(galleriesIn(stale).filter(tab => !union.has(tab))).toEqual(['built'])
  })
})

/*
 * THE SCRAPPED ANIMALS ARE UNREACHABLE, AND THAT IS DELIBERATE.
 *
 * Joe, 29 July 2026: *"everything built already in terms of animals is scrap.
 * names and facts ok, but the 3D part is junk i'm afraid."* The seventy-two
 * animals the kits built were retired on that sentence, and `primitives` — the
 * bench of shape decisions those kits were tuned against — went with them,
 * because with the kits scrapped there is nothing left for that sign-off to
 * unblock.
 *
 * The reason this is a test and not a deletion left to speak for itself: the one
 * job of this workbench is Joe's approval, and an approval is only worth
 * something if he cannot give it to the wrong thing. A scrapped model he can
 * still put on a turntable is a scrapped model he can approve by accident, or
 * stand a real assembly beside and judge the real one against. So the galleries
 * are GONE rather than relabelled, and every route back to them is closed here:
 * the data module, the loader, the tab, the union.
 *
 * A FUTURE AGENT READING THIS: these tabs were not lost in a refactor and must
 * not be "restored". `tools/workbench/public/primitives.ts` and
 * `joe/primitives-audit.json` are still on disk on purpose, because the
 * reasoning written into them is worth keeping, but nothing in the viewer may
 * reach them. If the scrapped seventy-two are ever wanted back, that is a
 * decision for Joe and not a tidy-up.
 */
describe('the scrapped animals cannot be reached, reviewed or compared against', () => {
  it('has no built.ts left to bench them from', () => {
    expect(existsSync(resolve(REPO, 'tools/workbench/public/built.ts'))).toBe(false)
  })

  it('has no loader in the viewer that could put one on the turntable', () => {
    const source = viewerTs()
    expect(source).not.toContain('loadBuilt')
    expect(source).not.toMatch(/from\s+'\.\/built'/)
  })

  it('offers no tab to either of the two removed galleries', () => {
    const html = viewerHtml()
    expect(html).not.toContain('data-gallery="built"')
    expect(html).not.toContain('data-gallery="primitives"')
  })

  it('holds neither of them in the one list of galleries there is', () => {
    const union: readonly string[] = GALLERIES
    expect(union).not.toContain('built')
    expect(union).not.toContain('primitives')
  })
})

/*
 * THE VIEWER MUST NOT NORMALISE SIZE AWAY, WHICH IS WHY IT IS ASSERTED HERE.
 *
 * Joe, on the first fourteen assembled animals: *"the new animals look genuinely
 * really good. general criticism is size. the body/cube should always be the
 * standard size, its often bigger."* Every one of the fourteen wears a hull of
 * exactly 1.250 and no node in any of them carries a scale — the difference he
 * could see was manufactured by the VIEWER, which divided every model by its own
 * total height so each arrived one unit tall. Our heights run 1.431 to 1.976, so
 * the identical cube was drawn across a 1.38x range, and the same divisor was
 * applied to the pack half of each pair by ITS own height, so the one comparison
 * the gallery exists for misled in both directions at once.
 *
 * WHY THIS IS A SOURCE TEST. `viewer.ts` builds a `WebGLRenderer` and queries
 * `#stage` at module load, so it cannot be imported into a test at all — which is
 * the same reason `loadBuilt` is asserted by reading the file, thirty lines up.
 * What is NOT source-read is the geometry: the heights below come out of
 * `buildAssembled` for real, so the spread the fix is answering is measured rather
 * than quoted, and the last test in the block feeds a DOCTORED source back through
 * the same reader to prove the reader has teeth.
 */
const viewerSource = (): string => viewerTs()

/** The body of a top-level `function name(...)`, brace-matched. */
const bodyOf = (source: string, name: string): string => {
  const at = source.indexOf(`function ${name}(`)
  expect(at, `no function ${name} in viewer.ts`).toBeGreaterThan(-1)
  const open = source.indexOf('{', source.indexOf(')', at))
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) return source.slice(open, i + 1)
  }
  throw new Error(`function ${name} never closes`)
}

/**
 * Every line that derives a SCALE from something it just measured.
 *
 * That shape — `1 / <something about this model's bounds>` — is the fault itself,
 * in all three of the places it used to live: `toUnitHeight`'s
 * `1 / (box.max.y - box.min.y)`, and the grid's `1 / Math.max(size.x, size.y,
 * size.z)`. Any of them coming back means one animal is being drawn relative to
 * itself again.
 */
const perModelDivisors = (source: string): string[] =>
  source.split('\n')
    .map(l => l.trim())
    /* Comments are prose about the fault and are meant to mention it. */
    .filter(l => !l.startsWith('*') && !l.startsWith('//') && !l.startsWith('/*'))
    .filter(l => /1(e-6)?\s*\/\s*[^\n]*\b(box|size|sphere)\b/.test(l)
      || /\/\s*Math\.max\([^\n]*\b(box|size|sphere)\b/.test(l))

/** The one divisor, read off the source rather than copied into this file. */
const packHeightMedian = (source: string): number => {
  const m = /const PACK_HEIGHT_MEDIAN = ([\d.]+)/.exec(source)
  expect(m, 'viewer.ts states no PACK_HEIGHT_MEDIAN').not.toBeNull()
  return Number(m![1])
}

/** The shared hull cube, and the whole of what Joe said must not change size. */
const STANDARD_HULL = 1.25

describe('the viewer is truthful about absolute size', () => {
  it('scales both halves of a pair by the SAME constant, and measures neither', () => {
    const source = viewerSource()
    const pair = bodyOf(source, 'loadAssembled')
    /* One function, one constant, called once per half — so the two models cannot
     * be scaled by two different numbers however their heights differ. */
    expect(pair).toContain('toSharedScale(pack)')
    expect(pair).toContain('toSharedScale(mine)')

    const fn = bodyOf(source, 'toSharedScale')
    expect(fn).toContain('multiplyScalar(SHARED_SCALE)')
    expect(perModelDivisors(fn)).toEqual([])
    expect(source).toMatch(/const SHARED_SCALE = 1 \/ PACK_HEIGHT_MEDIAN/)
  })

  it('leaves no per-model divisor anywhere in the file, grid view included', () => {
    expect(perModelDivisors(viewerSource())).toEqual([])
    /* And the grid takes the same constant, so a cube cannot change apparent size
     * between one animal and a collection of them. */
    expect(bodyOf(viewerSource(), 'showGrid')).toContain('SHARED_SCALE')
  })

  it('does not put the normalisation back through the camera', () => {
    const source = viewerSource()
    /* A camera distance derived from each model's own bounds pushes a big animal
     * away and pulls a small one in, which is the same normalisation by another
     * route. The comparison gallery therefore frames from a CONSTANT. */
    expect(source).toMatch(/const PAIR_FRAME_RADIUS = /)
    expect(bodyOf(source, 'select')).toContain('frame(object, 1.6, frameRadius())')
    expect(source).toMatch(/gallery === 'assembled' && !showingGrid \? PAIR_FRAME_RADIUS/)
    /* And the true height in model units is on screen beside each name, so the
     * question the picture now raises — how much bigger? — has an answer. */
    expect(bodyOf(source, 'drawPairTags')).toContain('units tall')
  })

  /*
   * THE PROPERTY THAT MATTERS, on the real fourteen: two models of DIFFERENT total
   * height are scaled by the SAME factor, so the shared 1.250 hull is the same
   * on-screen size in both.
   */
  it('draws the identical 1.250 hull at one size across the real spread of heights', () => {
    const heights = assembledSpecies()
      .map(s => new Box3().setFromObject(buildAssembled(s.id)).getSize(new Vector3()).y)
    expect(heights.length).toBeGreaterThan(1)
    const lo = Math.min(...heights)
    const hi = Math.max(...heights)

    /* The spread is real, so the fixture is not proving something about one animal. */
    expect(hi / lo).toBeGreaterThan(1.3)

    /*
     * WHAT THE OLD PER-ANIMAL DIVISOR DID to that cube: `1.250 / thisAnimalHeight`,
     * so the cube's on-screen size was the RECIPROCAL of the height spread — 1.38x
     * apart on the two ends of the same fourteen.
     */
    const asBefore = (height: number): number => STANDARD_HULL / height
    expect(asBefore(lo)).toBeCloseTo(0.873, 2)
    /*
     * 0.622 SINCE 2 AUGUST, WAS 0.633, AND THE ANIMAL UNDERNEATH IT CHANGED.
     *
     * This pins what the OLD per-animal divisor did at the tall end, so it moves
     * whenever the tallest assembled species does. It was the squirrel at 1.9763
     * (1.250 / 1.9763 = 0.6325); Night Time's `animal-fennec-fox` is 2.0100 and
     * is now the tallest thing built by this method (1.250 / 2.0100 = 0.6219).
     * The fennec is all ear — `box-06`, the bunny's upright pair, is the biggest
     * ear in the bank and it clears the pack's own 2.02 ceiling by 0.0100.
     *
     * The spread this fixture exists to demonstrate therefore got WIDER, not
     * narrower: 1.404x across the assembled set against the 1.38x quoted above,
     * so the fault the shared divisor fixed would have been worse today than it
     * was when it was found. Update the number when a taller animal lands; do
     * not relax the tolerance.
     */
    expect(asBefore(hi)).toBeCloseTo(0.622, 2)
    expect(new Set(heights.map(h => asBefore(h).toFixed(6))).size).toBeGreaterThan(1)

    /*
     * AND WHAT THE SHARED DIVISOR DOES. `asNow` takes the height and does not use
     * it, which is the property in one line — and it is not this test asserting it
     * of itself: the two tests above pin that `toSharedScale` and `showGrid` contain
     * no expression of the `asBefore` shape, and the last one proves that reader
     * catches such an expression when there is one.
     */
    const shared = 1 / packHeightMedian(viewerSource())
    const asNow = (_height: number): number => STANDARD_HULL * shared
    expect(new Set(heights.map(h => asNow(h).toFixed(9))).size).toBe(1)
    expect(asNow(lo)).toBe(asNow(hi))
    expect(asNow(lo)).toBeCloseTo(0.7758, 4)

    /* And the page does not lurch: the old rule drew every animal at 1.000 and this
     * draws all fourteen inside a band around it, so the framing Joe knows holds. */
    for (const h of heights) {
      expect(h * shared).toBeGreaterThan(0.85)
      expect(h * shared).toBeLessThan(1.30)
    }
  })

  /*
   * The reader has teeth. Fed the divisor it exists to forbid, it must name the
   * line — otherwise the two tests above pass by matching nothing at all, which is
   * exactly how a source assertion decays into "the file still exists".
   */
  it('catches a per-model divisor when there is one to catch', () => {
    const doctored = viewerSource().replace(
      '  object.scale.multiplyScalar(SHARED_SCALE)',
      '  const scale = 1 / Math.max(1e-6, box.max.y - box.min.y)\n  object.scale.multiplyScalar(scale)',
    )
    expect(perModelDivisors(doctored)).toHaveLength(1)
    const grid = viewerSource().replace(
      "  const scale = gallery === 'assembled' ? 1 : SHARED_SCALE",
      '  const scale = 1 / Math.max(size.x, size.y, size.z, 0.001)',
    )
    expect(perModelDivisors(grid)).toHaveLength(1)
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
