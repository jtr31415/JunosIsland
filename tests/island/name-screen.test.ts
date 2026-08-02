/**
 * A child was shown a pet called "Defuck", so this file is the reason it cannot
 * happen twice.
 *
 * Joe, 2 August 2026: *"nothing that contains the letter combination fuck, cunt
 * or shit, or homophones thereof."* `src/island/species/name-screen.ts` is that
 * rule as data; this file is the rule ENFORCED, walked over every one of the 320
 * given names the roster allocates.
 *
 * All 320 pass today. That is exactly why the test matters — it is written for
 * the next roster edit, the next collection and the next pin, none of which will
 * be made by somebody who remembers `Defuck`. If it goes red, the fix is a PIN in
 * `src/island/species/name-pins.json` for the one offending species. It is NOT to
 * filter the seeded stream in `naming.ts`: skipping a name shifts every later
 * draw and renames animals children already own, which is brief §19.
 *
 * The positive controls are load-bearing. A screen that catches nothing passes
 * the gate perfectly, so the gate alone proves nothing; the controls below prove
 * the screen is awake.
 */
import { describe, it, expect } from 'vitest'
import {
  screenName, isNameClean, BANNED_PATTERNS, WATCHLIST,
} from '../../src/island/species/name-screen'
import { givenName } from '../../src/island/species/naming'
import { COLLECTIONS } from '../../src/island/species/roster'

/** Every species the roster knows, in the canonical allocation order. 320. */
const ALL_SPECIES: readonly string[] = COLLECTIONS.flatMap((c) => c.members)

describe('the gate: no allocated given name contains a banned sequence', () => {
  it('screens all 320 names clean, and names the offender loudly if not', () => {
    const offenders: string[] = []
    let screened = 0

    for (const id of ALL_SPECIES) {
      const name = givenName(id)
      screened++
      const hit = screenName(name)
      if (hit !== null) {
        offenders.push(`${id} is named "${name}" — matched "${hit.pattern}" (${hit.root})`)
      }
    }

    expect(
      offenders,
      'A species given name contains a banned sequence. Joe, 2 Aug 2026: '
      + '"nothing that contains the letter combination fuck, cunt or shit, or '
      + 'homophones thereof." FIX: pin a replacement name for the named species '
      + 'in src/island/species/name-pins.json. Do NOT filter naming.ts draw() — '
      + 'that renames animals children already own (brief §19).',
    ).toEqual([])

    // A broken import that screened zero names would otherwise pass silently.
    expect(screened).toBe(320)
  })

  it('screens the whole roster through the predicate too', () => {
    expect(ALL_SPECIES.every((id) => isNameClean(givenName(id)))).toBe(true)
  })
})

describe('positive controls: the screen is not vacuously passing', () => {
  /** The real one, plus the shapes the generator can build around each root. */
  const CAUGHT: readonly string[] = [
    'Defuck', 'Refuck', 'Fuckmoo', 'Bafuck', 'Fuggor',
    'Cnutmo', 'Kuntar', 'Zicunt',
    'Shyte', 'Sh1tza', 'Schitz',
    'Phuqel',
  ]

  for (const name of CAUGHT) {
    it(`catches ${name}`, () => {
      const hit = screenName(name)
      expect(hit).not.toBeNull()
      expect(isNameClean(name)).toBe(false)
    })
  }

  it('catches the name that actually reached a six-year-old, whatever its case', () => {
    for (const spelling of ['Defuck', 'DEFUCK', 'defuck', 'DeFuCk', 'dEfUcK']) {
      const hit = screenName(spelling)
      expect(hit, `${spelling} must be caught`).not.toBeNull()
      expect(hit?.root).toBe('fuck')
    }
  })

  it('reports the plainest spelling, so the failure message is actionable', () => {
    expect(screenName('Defuck')).toEqual({ pattern: 'fuck', root: 'fuck' })
  })

  it('matches anywhere in the name, not just at the ends', () => {
    // The prefix/suffix-only check is precisely the bug that let Defuck through.
    expect(screenName('Bafuckle')).not.toBeNull()
    expect(screenName('Zocuntic')).not.toBeNull()
  })

  it('is stable across repeated calls, so no pattern carries a global flag', () => {
    for (const p of BANNED_PATTERNS) {
      if (typeof p.pattern !== 'string') expect(p.pattern.global).toBe(false)
    }
    expect(screenName('Fuckmoo')).toEqual(screenName('Fuckmoo'))
  })
})

describe('negative controls: real allocated names pass', () => {
  const CLEAN: readonly string[] = ['Wickpi', 'Chudup', 'Zapvo', 'Bimo', 'Messpo', 'Zirep']

  for (const name of CLEAN) {
    it(`passes ${name}`, () => {
      expect(screenName(name)).toBeNull()
      expect(isNameClean(name)).toBe(true)
    })
  }
})

describe('the watchlist is surfaced, not gated', () => {
  /*
   * DELIBERATE, and pending Joe's ruling. `Fickji`, `Nefack` and `Chashet` are
   * allocated to live species today. `fick` is the German verb, `fack` has the
   * wrong vowel to be a homophone, and `Chashet` reads as "cha-shet" — none of
   * the three reads as one of Joe's words to a British child sounding a name
   * out, so they are on WATCHLIST rather than in BANNED_PATTERNS. If he rules
   * the other way: move the entry into BANNED_PATTERNS and pin a replacement
   * name for the one affected species. These assertions then invert, which is
   * the point of writing the judgement down as executable fact.
   */
  const BORDERLINE: readonly string[] = ['Fickji', 'Nefack', 'Chashet']

  for (const name of BORDERLINE) {
    it(`${name} currently screens clean`, () => {
      expect(screenName(name)).toBeNull()
    })
  }

  it('lists all three borderline sequences, with the live name that forced the call', () => {
    expect(WATCHLIST.map((w) => w.pattern)).toEqual(['fick', 'fack', 'shet'])
    for (const w of WATCHLIST) {
      expect(BORDERLINE).toContain(w.seenIn)
      expect(w.seenIn.toLowerCase()).toContain(w.pattern)
      expect(w.why.length).toBeGreaterThan(0)
    }
  })

  it('keeps the watchlist and the banned list disjoint', () => {
    const banned = BANNED_PATTERNS
      .filter((p) => typeof p.pattern === 'string')
      .map((p) => p.pattern as string)
    for (const w of WATCHLIST) expect(banned).not.toContain(w.pattern)
  })

  it('still screens the names those borderline sequences sit in', () => {
    for (const name of BORDERLINE) expect(isNameClean(name)).toBe(true)
  })
})

describe('the banned list itself', () => {
  it('covers all three of the roots Joe named', () => {
    expect(new Set(BANNED_PATTERNS.map((p) => p.root))).toEqual(
      new Set(['fuck', 'cunt', 'shit']),
    )
  })

  it('spells every literal in lower case, because matching lower-cases first', () => {
    for (const p of BANNED_PATTERNS) {
      if (typeof p.pattern === 'string') expect(p.pattern).toBe(p.pattern.toLowerCase())
    }
  })

  it('bans the three words themselves, which is the rule read literally', () => {
    for (const root of ['fuck', 'cunt', 'shit'] as const) {
      expect(screenName(`Zo${root}ra`)?.root).toBe(root)
    }
  })
})
