/**
 * PB-056 — the child is "they", and stays "they".
 *
 * Joe's ruling, verbatim: *"Make it gender agnostic - users (children) should
 * be referred to as \"they\". Fred stays male, other animals have no gender,
 * teacher has a female voice but otherwise their gender is irrelevant. the owl
 * later shall be female, if we ever use her"*.
 *
 * Fixing today's copy is the small half of that card. The large half is that it
 * STAYS fixed: the next person to write a sentence for the grown-ups panel has
 * no way of knowing the rule exists, and the six strings this card corrected had
 * been sitting in `grownups.ts` for weeks without a single test noticing them.
 * So the rule is enforced here rather than remembered.
 *
 * WHAT THIS GUARDS: every string literal in `src/` — which is every word the
 * game can put in front of a person — plus the HTML shells. A gendered pronoun
 * in shipped copy fails this test with a file, a line and the offending text.
 *
 * WHAT IT DELIBERATELY DOES NOT GUARD:
 * - **Comments.** They are prose for developers, and the scanner skips them by
 *   construction. They were neutralised by the same commit, but a comment guard
 *   would be a permanent tax on writing about Fred, about Joe, or about a real
 *   animal's sex, and it would catch nothing a child can read.
 * - **`he/him/his` for Fred.** Fred is male and stays male. He does not refer to
 *   himself in the third person, so no shipped string needs the pronoun today;
 *   if one ever does, add it to ALLOWED with its reason, exactly as the two
 *   entries about Joe are.
 * - **"male" / "female" as words.** The teacher's voice is female by ruling, and
 *   `joe/species-facts.json` teaches real sexual dimorphism ("Male deer grow new
 *   antlers"). Banning the words would forbid both, so the pattern is pronouns
 *   and gendered nouns for a PERSON, not the adjectives.
 *
 * The scanner is hand-rolled because TypeScript 7 no longer ships the legacy
 * compiler API (`ts.createSourceFile` is gone), so the AST route is closed. A
 * hand-rolled tokeniser is only worth trusting if it is itself tested, which is
 * what the first describe block does — a regex over raw source would flag every
 * comment in the repo and would then have to be neutered until it caught
 * nothing.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'

import { WORD_COLOUR_CHOICES, STAGE_LABELS } from '../../src/island/grownups'

const SRC = resolve(__dirname, '../../src')

/**
 * Gendered reference to a PERSON.
 *
 * `hers`/`herself`/`himself` are included for completeness even though nothing
 * uses them; `boy`, `girl` and `daughter` are here because "a girl who has done
 * nine sums" is the shape the prose in this repo actually reaches for, and it
 * would read as copy the moment someone moved it into a string.
 */
const GENDERED = /\b(she|her|hers|herself|he|him|his|himself|girl|girls|boy|boys|daughter|son)\b/i

/**
 * Strings that carry a gendered word for a reason, each with that reason.
 *
 * Matched as a substring of the literal, against the file it appears in. Adding
 * an entry is meant to be an argued act, not a way of silencing the test.
 */
const ALLOWED: ReadonlyArray<{ file: string; text: string; why: string }> = [
  {
    file: 'core/wordlists.ts',
    text: 'him',
    why: 'GREEN phonics vocabulary, not a reference to anyone. `him` and `his` are '
      + 'words the child decodes, and tools/golden/golden.json (FROZEN) pins 85 and 124 '
      + 'deals of them respectively — removing either would redden a frozen file and '
      + 'change what the learning engine produces.',
  },
  {
    file: 'core/wordlists.ts',
    text: 'his',
    why: 'as above — GREEN phonics vocabulary, pinned by the frozen golden capture.',
  },
  {
    file: 'core/alien.ts',
    text: 'son',
    why: 'a REAL_BLOCK word, held back so the alien-word generator never coins a real '
      + 'English word by accident. It is vocabulary the generator must KNOW in order to '
      + 'avoid, not a way of addressing anybody.',
  },
  {
    file: 'island/species/parts/assembled/animal-hedgehog.ts',
    text: 'His words,',
    why: 'attributes a verbatim quotation to Joe, who is male. Developer-facing text in '
      + 'the workbench. Neutralising it would falsify an attribution.',
  },
  {
    file: 'island/species/parts/creature.ts',
    text: 'where he reads it',
    why: 'a build-time error message telling an author where JOE will read their `flag`. '
      + 'Developer-facing, and about Joe rather than about a child.',
  },
]

/* ------------------------------------------------------------- the scanner */

interface Literal { text: string; line: number }

/**
 * Every string, template and quoted literal in a TypeScript source, with the
 * comments skipped.
 *
 * Walks the file as a tiny state machine rather than matching quotes with a
 * regex, because an apostrophe inside a comment ("Joe's own words") opens a
 * literal that then swallows the rest of the file. Template interpolations are
 * replaced by a space so that `${n} friends` does not have its expression
 * scanned as prose.
 */
export function literalsIn(src: string): Literal[] {
  const out: Literal[] = []
  const n = src.length
  let i = 0
  let line = 1
  /* `string | undefined` because tsconfig runs noUncheckedIndexedAccess. */
  const bump = (c: string | undefined): void => { if (c === '\n') line++ }

  while (i < n) {
    const c = src[i]
    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { bump(src[i]); i++ }
      i += 2
      continue
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c
      const startLine = line
      let buf = ''
      i++
      while (i < n) {
        if (src[i] === '\\') { buf += src[i + 1] ?? ''; bump(src[i + 1] ?? ''); i += 2; continue }
        if (src[i] === quote) break
        if (quote === '`' && src[i] === '$' && src[i + 1] === '{') {
          let depth = 1
          i += 2
          while (i < n && depth > 0) {
            if (src[i] === '{') depth++
            if (src[i] === '}') depth--
            bump(src[i])
            i++
          }
          buf += ' '
          continue
        }
        buf += src[i] ?? ''
        bump(src[i])
        i++
      }
      i++
      out.push({ text: buf, line: startLine })
      continue
    }
    bump(c)
    i++
  }
  return out
}

/** Every `.ts` and `.html` under a directory. `public/` is binary assets. */
function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) { if (entry !== 'public') sources(p, out) }
    else if (/\.(ts|html)$/.test(entry)) out.push(p)
  }
  return out
}

const posix = (p: string): string => relative(SRC, p).split('\\').join('/')

const excused = (file: string, text: string): boolean =>
  ALLOWED.some(a => file === a.file && text.includes(a.text))

/* ------------------------------------------------------ the scanner itself */

describe('the literal scanner, so the guard below can be believed', () => {
  it('reads strings and ignores line comments', () => {
    const found = literalsIn('const a = "keep me" // she is not here\n')
    expect(found.map(l => l.text)).toEqual(['keep me'])
  })

  it('ignores block comments, including their apostrophes', () => {
    // The apostrophe is the whole reason this is a state machine: a regex for
    // quoted runs treats it as an opening quote and eats the rest of the file.
    const found = literalsIn("/* Joe's own words about her */\nconst a = 'kept'\n")
    expect(found.map(l => l.text)).toEqual(['kept'])
  })

  it('reads template literals but not their interpolations', () => {
    const found = literalsIn('const a = `${her.name} friends`\n')
    expect(found).toHaveLength(1)
    // The expression becomes one space, so the identifier `her` is not read as
    // prose. That is the whole point: `${n} friend${n === 1 ? '' : 's'}` in
    // main.ts must not be scanned as English.
    expect(found.map(l => l.text)).toEqual(['  friends'])
    expect(found.map(l => l.text).join('')).not.toMatch(GENDERED)
  })

  it('does not end a literal on an escaped quote', () => {
    const found = literalsIn("const a = 'Joe\\'s call, and she said so'\n")
    expect(found.map(l => l.text)).toEqual(["Joe's call, and she said so"])
  })

  it('reports the line the literal opened on', () => {
    const found = literalsIn('const a = 1\n// pad\nconst b = "here"\n')
    expect(found.map(l => l.line)).toEqual([3])
  })

  it('finds the gendered text it is pointed at', () => {
    // Guards the guard: if GENDERED or the scanner ever stopped matching, the
    // sweep below would pass by finding nothing at all.
    const found = literalsIn('const a = "Pins her exactly where she is"\n')
    expect(found.some(l => GENDERED.test(l.text))).toBe(true)
  })
})

/* -------------------------------------------------------------- the sweep */

describe('PB-056: no shipped string genders the child', () => {
  it('has sources to scan at all', () => {
    // A broken walk would make every assertion below vacuously true.
    expect(sources(SRC).length).toBeGreaterThan(50)
  })

  it('finds no gendered pronoun in any string literal in src/', () => {
    const offences: string[] = []
    for (const path of sources(SRC).filter(p => p.endsWith('.ts'))) {
      const file = posix(path)
      for (const lit of literalsIn(readFileSync(path, 'utf8'))) {
        if (!GENDERED.test(lit.text)) continue
        if (excused(file, lit.text)) continue
        offences.push(`${file}:${lit.line}  ${JSON.stringify(lit.text.slice(0, 90))}`)
      }
    }
    expect(offences, 'the child is "they" — see tests/copy/pronouns.test.ts').toEqual([])
  })

  it('finds no gendered pronoun in the HTML shells', () => {
    const offences: string[] = []
    for (const path of sources(SRC).filter(p => p.endsWith('.html'))) {
      readFileSync(path, 'utf8').split('\n').forEach((text, k) => {
        if (GENDERED.test(text)) offences.push(`${posix(path)}:${k + 1}  ${text.trim()}`)
      })
    }
    expect(offences).toEqual([])
  })

  it('every excuse is still earning its place', () => {
    // An allowlist nobody prunes becomes a list of things that used to be true.
    for (const a of ALLOWED) {
      const src = readFileSync(join(SRC, a.file), 'utf8')
      expect(literalsIn(src).some(l => l.text.includes(a.text)), `${a.file} no longer contains ${a.text}`)
        .toBe(true)
      expect(a.why.length, `${a.file} excuse needs a reason`).toBeGreaterThan(40)
    }
  })
})

/* --------------------------------------------- the copy tables themselves */

describe('PB-056: the grown-ups copy reads naturally in the singular they', () => {
  it('the word-colour choice no longer says "puts her off"', () => {
    const green = WORD_COLOUR_CHOICES.find(c => c.id === 'green')
    expect(green?.detail).toBe('gentler if red puts them off')
  })

  it('no stage label carries a pronoun at all', () => {
    // These are read aloud by a parent to a child; they were already clean and
    // this pins that they stay so.
    for (const path of Object.values(STAGE_LABELS)) {
      for (const label of Object.values(path)) expect(label).not.toMatch(GENDERED)
    }
  })
})
