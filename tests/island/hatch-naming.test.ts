/**
 * THE REGRESSION GATE FOR *DEFUCK*.
 *
 * On 2 August 2026 the game hatched a rabbit and told a six-year-old its name
 * was **Defuck**. The line responsible was in `src/island/main.ts`:
 *
 *     const name = petName(defaultRng)
 *
 * — an unseeded draw off `Math.random`, a fresh name every hatch, answerable to
 * nobody. `src/core/names.ts` screens its own output, but its `FORBIDDEN` list
 * carries `shit`, `cock`, `dick`, `piss` and `arse` and does NOT carry `fuck`
 * or `cunt`, and the generator glues syllables, so `de` + `fuck` was a shape it
 * could reach. Enumerated, that is one accepted draw in 678. It was not bad
 * luck; it was the table.
 *
 * The fix is the two lines this file guards:
 *
 *     const species = nextSpecies
 *     const name = givenName(species)
 *
 * `givenName` returns the FROZEN, per-species, collision-free name the roster
 * already allocated — 320 of them, every one screened by
 * `tests/island/name-screen.test.ts`. A hatch is now a lookup, not a coin toss.
 *
 * ## What this file can and cannot prove — read this before adding to it
 *
 * IT CANNOT DRIVE THE HATCH. I looked, because a source-text check is the
 * weakest thing a test can do and `docs/HANDOFF.md` §5 counts four features that
 * shipped dead behind a green suite. The finding is negative and it is
 * structural:
 *
 *   - `flow.ts challengePassed(f, hatch)` and `interactions.ts
 *     handleChallengePassed(flow, hatch)` both take the name as an INPUT
 *     (`HatchDetails { name, species }`). The flow never names anything. It
 *     copies `hatch.name` into the pet and into the pet's id and returns.
 *   - So `tests/island/deal-assembled.test.ts` "drives the real hatch path" and
 *     is right to say so — but it passes `'Prickle'` in by hand. Every
 *     assertion it makes about a name would pass just as well against
 *     `petName(defaultRng)`, because the naming happens strictly UPSTREAM of
 *     everything importable.
 *   - The only place the name is CHOSEN is `main.ts`, which exports nothing and
 *     self-boots into a WebGL context on import. There is no seam.
 *
 * So driving the flow here would look meaningful and prove nothing about the
 * wiring, and this file does not do it. What it does instead is four honest
 * things: read `main.ts` off disk and assert the wiring (§1, weak but the only
 * guard there is), screen every name the LIVE pool can actually deal (§2,
 * behavioural and load-bearing), pin the determinism (§3), and prove the fix is
 * not retroactive (§4).
 *
 * To make §1 behavioural, `main.ts` would have to hand the choice to something
 * importable — a `hatchName(species)` one-liner beside `givenName`, called from
 * `passed()` — and this suite would assert on that. That is a change to `src/`
 * and is not this file's to make. `deal-assembled.test.ts` keeps the same
 * backstop for `dealPool` and says the same thing about it.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { givenName } from '../../src/island/species/naming'
import { screenName } from '../../src/island/species/name-screen'
import { dealPool } from '../../src/island/species/pool'
import { SPECIES } from '../../src/island/pets'
import { createFlow } from '../../src/island/flow'
import type { Pet } from '../../src/island/flow'
import { toSave, fromSave } from '../../src/island/save'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const MAIN = 'src/island/main.ts'
const main = readFileSync(resolve(REPO, MAIN), 'utf8')

/**
 * `main.ts` with its comments removed.
 *
 * NOT a nicety. The fix's own comment block quotes the old line verbatim — *"This
 * line used to be `petName(defaultRng)`"* — because the next person to read that
 * code needs to know what it replaced and why. A raw `includes('petName(')` would
 * therefore be red on a correct file and green on nothing, so the negative
 * assertions below run against CODE and the prose is left free to say the word.
 *
 * The `[^:]` guard keeps a `//` inside a `https://` string literal from eating
 * the rest of its line. Nothing downstream cares if a URL is mangled — this text
 * is only ever searched for absences and for the order of two statements.
 */
const code = main
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/.*$/gm, '$1')

/* ------------------------------------------------------- §1 the wiring --- */

describe('the hatch names from the species, not from a coin toss', () => {
  it('calls no random name generator anywhere in its code', () => {
    expect(
      code.includes('petName('),
      `${MAIN} calls petName() again. That is an UNSEEDED Math.random draw and it `
      + 'puts a 1-in-678 chance of an obscene name — the real, enumerated rate — '
      + 'in front of a child on every single hatch. It is the line that produced '
      + '"Defuck" on 2 August 2026. Do not reinstate it: the name must come from '
      + 'givenName(species), which is frozen and screened.',
    ).toBe(false)
  })

  it('does not import from src/core/names at all', () => {
    /*
     * The import is the loaded gun. `src/core/` is pinned byte-for-byte by
     * `tools/golden/golden.json` and its FORBIDDEN list cannot be extended
     * without reshuffling the seeded stream and renaming animals children
     * already own (brief §19) — so `petName` can never be made safe where it
     * stands. Keeping it out of this module's imports is what stops somebody
     * reaching for it in a hurry.
     */
    for (const spelling of ["'../core/names'", '"../core/names"']) {
      expect(
        code.includes(spelling),
        `${MAIN} imports from ${spelling}. Nothing in the island's entry point may `
        + 'draw a name at random; a hatch is a lookup. Whoever added this import '
        + 'is one keystroke from putting "Defuck" back in front of a six-year-old.',
      ).toBe(false)
    }
  })

  it('names the friend with givenName(species)', () => {
    expect(
      code.includes('givenName(species)'),
      `${MAIN} no longer calls givenName(species). That call IS the fix for the `
      + '"Defuck" incident: it returns the frozen, screened, per-species name the '
      + 'roster allocated, all 320 of which are asserted clean by '
      + 'tests/island/name-screen.test.ts. Without it the name is unscreened.',
    ).toBe(true)
    expect(
      main.includes("import { givenName } from './species/naming'"),
      `${MAIN} does not import givenName from './species/naming'.`,
    ).toBe(true)
  })

  it('reads the species BEFORE naming it, and re-arms the egg after', () => {
    /*
     * ORDER IS THE SECOND BUG WAITING TO HAPPEN, and it is silent.
     *
     * `nextSpecies` is drawn a whole egg AHEAD so the model can be preloaded,
     * and `passed()` re-arms it with `nextSpecies = drawSpecies()` once the pet
     * has landed. Name after that re-arm and every child gets the NEXT friend's
     * name — a hedgehog called by the badger's name, forever, in the save and in
     * the pet's id. Nothing else in the codebase would notice: the name would
     * still be frozen, still screened, still collision-free, and still wrong.
     */
    const read = code.indexOf('const species = nextSpecies')
    const named = code.indexOf('const name = givenName(species)')
    const rearm = code.indexOf('nextSpecies = drawSpecies()', named)

    expect(read, `${MAIN} has no \`const species = nextSpecies\``).toBeGreaterThan(-1)
    expect(named, `${MAIN} has no \`const name = givenName(species)\``).toBeGreaterThan(-1)
    expect(rearm, `${MAIN} never re-arms nextSpecies after the hatch`).toBeGreaterThan(-1)

    expect(
      read,
      `${MAIN} names the pet before it has read nextSpecies into \`species\`. `
      + 'The friend in the egg must be fixed before it is named.',
    ).toBeLessThan(named)
    expect(
      named,
      `${MAIN} names the pet AFTER \`nextSpecies = drawSpecies()\` has re-armed the `
      + 'egg, so every child would be given the NEXT friend\'s name — baked into '
      + 'the pet, its id and the save. Name the species you hatched, then re-arm.',
    ).toBeLessThan(rearm)
  })
})

/* -------------------------------------------- §2 the live pool is clean --- */

/**
 * Exactly the species an egg can hold today: the base pack plus every id Joe has
 * signed off, which is what `main.ts:489` deals from — `dealPool(SPECIES)`.
 *
 * Narrower than the 320-wide sweep in `name-screen.test.ts`, and more
 * load-bearing for being narrower: this is the set of names Juno can actually
 * meet. It grows on its own the day Joe ticks a row, with nothing to edit here.
 */
const LIVE_POOL = dealPool(SPECIES)

describe('every name the live pool can deal is clean', () => {
  it('has a pool to screen in the first place', () => {
    // Guards the whole suite against passing vacuously on a broken import or an
    // empty pool — "no names were dirty" is worthless if there were no names.
    expect(LIVE_POOL.length, 'dealPool(SPECIES) is empty').toBeGreaterThanOrEqual(
      SPECIES.length)
    expect(SPECIES.length).toBeGreaterThan(0)
    expect(new Set(LIVE_POOL).size).toBe(LIVE_POOL.length)
  })

  it('screens clean for every id an egg can hold', () => {
    for (const id of LIVE_POOL) {
      const name = givenName(id)
      expect(name.length, `${id} has no name at all`).toBeGreaterThan(0)
      const hit = screenName(name)
      expect(
        hit,
        `${id} is called "${name}", which contains ${hit ? `"${hit.pattern}" (${hit.root})` : ''}. `
        + 'This is a name a child can be handed. Do NOT fix it by filtering the '
        + 'generator — that shifts every later draw and renames animals children '
        + 'already own (brief §19). Pin a replacement for THIS species in '
        + 'src/island/species/name-pins.json, which moves nobody else.',
      ).toBeNull()
    }
  })

  it('would have caught the name that caused all this', () => {
    // The control. Without it, "nothing was dirty" is equally consistent with a
    // screen that answers null to everything.
    expect(screenName('Defuck')).toEqual({ pattern: 'fuck', root: 'fuck' })
  })
})

/* ---------------------------------------------------- §3 the determinism --- */

describe('a species has one name, forever', () => {
  it('gives the bunny the same name every time it is asked', () => {
    /*
     * The bunny is the species of Joe's Defuck rabbit, so this literal is
     * precisely the name that REPLACED the random draw. It is pinned as a string
     * here for the same reason `naming.test.ts` pins the Garden fourteen: if this
     * goes red, revert whatever moved the generator — do not re-pin. A child who
     * knows her rabbit's name is not served by a test that agrees with whatever
     * the code happens to say today.
     */
    expect(givenName('animal-bunny')).toBe('Chudup')
    expect(givenName('animal-bunny')).toBe(givenName('animal-bunny'))
    const once = givenName('animal-bunny')
    for (let i = 0; i < 10; i++) expect(givenName('animal-bunny')).toBe(once)
    expect(screenName(once)).toBeNull()
  })

  it('gives the same name on every id in the live pool, call after call', () => {
    // Determinism across the whole dealable surface, not one lucky species. An
    // unseeded draw would fail this on the second call.
    for (const id of LIVE_POOL) {
      const first = givenName(id)
      expect(givenName(id), id).toBe(first)
      expect(givenName(id), id).toBe(first)
    }
  })
})

/* ------------------------------------------ §4 brief §19: nobody is renamed --- */

describe('brief §19: a pet a child already owns keeps its name', () => {
  it('round-trips a pet whose stored name disagrees with givenName, verbatim', () => {
    /*
     * THE HONEST LIMIT OF THE FIX, stated as an assertion rather than a caveat.
     *
     * The fix is forward-only. Any rabbit hatched before 2 August 2026 is still
     * called whatever the coin toss called it, and this test proves the code does
     * not go back and tidy that up — because tidying it up is exactly what brief
     * §19 forbids. A friend whose name changed is a friend lost, even though the
     * record survived. `Pet.id` embeds the name (`flow.ts:329`), so a "correction"
     * would break the id that addresses the pet as well.
     *
     * `Defuck` itself is the fixture, deliberately: the single worst name in the
     * game is the one this asserts must survive untouched, because the child who
     * has it did not ask to lose her rabbit.
     */
    const pet: Pet = {
      id: 'pet1-Defuck', name: 'Defuck', species: 'animal-bunny', at: { q: 0, r: 0 },
    }
    // The premise: the generator disagrees with this stored name, so a rename
    // would be visible if one happened.
    expect(givenName('animal-bunny')).not.toBe(pet.name)
    expect(screenName(pet.name)).not.toBeNull()

    // Through the real save path and back through JSON, as the store writes it.
    const f = { ...createFlow(), pets: [pet] }
    const back = fromSave(JSON.parse(JSON.stringify(toSave(f, true, 'Juno')))).flow

    expect(back.pets, 'the pet did not survive the round trip').toHaveLength(1)
    const kept = back.pets[0] as Pet
    expect(
      kept.name,
      'the save path renamed a pet a child already owns. The screen is an '
      + 'ASSERTION GATE on future names, never a filter over stored ones — brief '
      + '§19: a child\'s friend may never be lost, and a renamed friend is lost.',
    ).toBe('Defuck')
    expect(
      kept.id,
      'the pet\'s id changed. Pet.id embeds the name, so rewriting one breaks the '
      + 'other and the pet stops being addressable.',
    ).toBe('pet1-Defuck')
    expect(kept.species).toBe('animal-bunny')
    expect(kept).toEqual(pet)
    // Genuinely round-tripped rather than the same object handed straight back.
    expect(kept).not.toBe(pet)
  })
})
