/**
 * The sentence-to-clip table, held against the two files it claims to describe.
 *
 * Nothing here mocks anything. The REAL ledger and the REAL manifest are read
 * off disk, because every claim this file makes is about the script Juno will
 * actually hear: that the wording in the table is still the ledger's wording to
 * the byte, that every id it can name is a clip that exists, and that the three
 * clips a counted line splices together all come out of one larynx.
 *
 * The failure this is written to catch is a QUIET one. A line reworded in the
 * code without the ledger does not crash — `resolveLine` stops recognising it
 * and the player falls back to synthesis, which is the correct degradation and
 * completely inaudible as a mistake. So it has to go red here or it goes
 * unnoticed until somebody wonders why Fred sounds different on one sentence.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  VOICE_LINES, NOT_PLAYED, COUNT_MIN, COUNT_MAX, renderTemplate, resolveLine,
  type TemplateLine, type WholeLine,
} from '../../src/platform/voice-lines'
import { governorLine, type Nudge } from '../../src/island/governors'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

interface LedgerLine { id: string; character?: string; text?: string }
const ledger = JSON.parse(
  readFileSync(resolve(REPO, 'voice/scripts.json'), 'utf8'),
) as { lines: LedgerLine[] }

const byId = new Map(ledger.lines.map(l => [l.id, l]))
const fredIds = new Set(ledger.lines.filter(l => l.character === 'fred').map(l => l.id))

interface Clip { file: string; character: string; voice: string }
const manifest = JSON.parse(
  readFileSync(resolve(REPO, 'src/island/public/voice/manifest.json'), 'utf8'),
) as { clips: Record<string, Clip> }

const wholes = VOICE_LINES.filter((l): l is WholeLine => l.kind === 'whole')
const templates = VOICE_LINES.filter((l): l is TemplateLine => l.kind === 'template')

/** The ledger's own text for a line, named so a missing entry reads as one. */
const ledgerText = (id: string): string => {
  const line = byId.get(id)
  if (!line || typeof line.text !== 'string') {
    throw new Error(`no ledger entry with text for ${id} — the table names a line the ledger has lost`)
  }
  return line.text
}

/**
 * The two governor ids as `governorLine` knows them.
 *
 * `satisfies` rather than a bare object, so a renamed `Nudge` key fails at the
 * typecheck instead of quietly turning test 6 into an assertion about nothing.
 */
const NUDGE = {
  'gov.spaceSurplus': 'space-surplus',
  'gov.nurseryQueue': 'nursery-queue',
} as const satisfies Record<string, Nudge>

describe('the table against the ledger', () => {
  it('holds the ledger wording to the byte, ellipsis and em dash included', () => {
    for (const line of VOICE_LINES) {
      const mine = line.kind === 'whole' ? line.text : line.template
      const theirs = byId.get(line.id)?.text
      expect(theirs, `${line.id} is not a line in voice/scripts.json at all`).toBeDefined()
      expect(
        theirs,
        `${line.id} has drifted from the ledger — the clip will never play, the sentence will be synthesized\n` +
        `  table:  ${JSON.stringify(mine)}\n` +
        `  ledger: ${JSON.stringify(theirs)}`,
      ).toBe(mine)
    }
  })

  it("accounts for every one of Fred's lines, as played or as deliberately not", () => {
    /*
     * The point of this one is the WORD "every". A Fred line that is in neither
     * list is a line nobody decided about: it would fall back to synthesis
     * forever and there would be no record that the silence was intended.
     */
    const played = VOICE_LINES.map(l => l.id)
    const notPlayed = NOT_PLAYED.map(l => l.id)

    expect(played).toHaveLength(11)
    expect(notPlayed).toHaveLength(6)
    expect(fredIds.size).toBe(17)

    const overlap = played.filter(id => notPlayed.includes(id))
    expect(overlap, 'a line cannot both play and not play').toEqual([])

    expect([...played, ...notPlayed].sort()).toEqual([...fredIds].sort())
  })

  it('gives a reason for each line it refuses to play', () => {
    /* All six are the splice law, so each `why` has to say which name is in the way. */
    for (const { id, why } of NOT_PLAYED) {
      expect(why, id).not.toBe('')
      expect(fredIds.has(id), `${id} is not a Fred line`).toBe(true)
    }
  })
})

describe('the clips it can name', () => {
  /** Every id `resolveLine` could ever return, gathered from the function itself. */
  const reachable = new Set<string>()
  for (const line of wholes) for (const id of resolveLine(line.text) ?? []) reachable.add(id)
  for (const line of templates) {
    for (let n = COUNT_MIN; n <= COUNT_MAX; n++) {
      for (const id of resolveLine(renderTemplate(line.template, n)) ?? []) reachable.add(id)
    }
  }

  it('names nine whole clips, six template pieces and twenty numerals', () => {
    expect(reachable.size).toBe(35)
    for (const line of wholes) expect(reachable.has(line.id), line.id).toBe(true)
    for (const line of templates) {
      for (const suffix of ['head', 'tail.one', 'tail.many']) {
        expect(reachable.has(`${line.id}.${suffix}`)).toBe(true)
      }
    }
    for (let n = COUNT_MIN; n <= COUNT_MAX; n++) expect(reachable.has(`count.${n}`)).toBe(true)
  })

  it("is Fred, in the manifest, and on disk — every one of them", () => {
    /*
     * A named id with no clip behind it is the worst case for the player: it
     * would ask for a file, get a 404 mid-sentence, and the child would hear
     * half a line. The manifest AND the file are both checked, because a
     * manifest entry whose `.opus` never got committed sounds the same.
     */
    for (const id of [...reachable].sort()) {
      const clip = manifest.clips[id]
      expect(clip, `${id} is not in the manifest — the player would ask for a clip that was never baked`).toBeDefined()
      expect(clip?.character, id).toBe('fred')
      expect(existsSync(resolve(REPO, clip?.file ?? '')), `${id} is in the manifest but ${clip?.file} is not on disk`).toBe(true)
    }
  })

  it('splices one larynx and never two (voice.md §3)', () => {
    /*
     * The law the double bake and Fred's own numerals exist for. If the numerals
     * were ever recast to the teacher — the obvious economy, since they own the
     * taught words — every counted sentence would change voice mid-sentence on
     * the number and back again. Asserted per template, over the exact set of
     * clips that template chains.
     */
    for (const line of templates) {
      const chain = [
        `${line.id}.head`, `${line.id}.tail.one`, `${line.id}.tail.many`,
        ...Array.from({ length: COUNT_MAX }, (_, i) => `count.${i + 1}`),
      ]
      const voices = new Set(chain.map(id => manifest.clips[id]?.character))
      expect(voices, `${line.id} splices across ${[...voices].join(' + ')}`).toEqual(new Set(['fred']))
    }
  })
})

describe('resolving a counted line', () => {
  it('renders exactly as governorLine does, for every count either side of the range', () => {
    for (const line of templates) {
      const nudge = NUDGE[line.id as keyof typeof NUDGE]
      for (let n = 0; n <= 25; n++) {
        expect(renderTemplate(line.template, n), `${line.id} at ${n}`).toBe(governorLine(nudge, n))
      }
    }
  })

  it('round-trips its own rendering into three clips, and only inside the baked range', () => {
    for (const line of templates) {
      for (let n = 0; n <= 25; n++) {
        const said = renderTemplate(line.template, n)
        const got = resolveLine(said)
        if (n < COUNT_MIN || n > COUNT_MAX) {
          /* No count.0 and no count.21 — the whole sentence falls back rather
           * than playing a chain with a hole where the number goes. */
          expect(got, `${line.id} at ${n} must not resolve; there is no clip for ${n}`).toBeNull()
          continue
        }
        expect(got, `${line.id} at ${n}`).toEqual([
          `${line.id}.head`, `count.${n}`, `${line.id}.tail.${n === 1 ? 'one' : 'many'}`,
        ])
      }
    }
  })

  it('takes the singular tail for one and only for one', () => {
    for (const line of templates) {
      for (let n = COUNT_MIN; n <= COUNT_MAX; n++) {
        const tail = resolveLine(renderTemplate(line.template, n))?.[2]
        expect(tail, `${line.id} at ${n}`).toBe(`${line.id}.tail.${n === 1 ? 'one' : 'many'}`)
      }
    }
  })

  it('refuses a sentence whose noun disagrees with its number', () => {
    /*
     * This is what the re-render proof is for. Both of these match the pattern
     * perfectly well — a number, then one of the two nouns — and both would
     * otherwise chain a clip that says something the caller never wrote. The
     * plural-with-one case is the sentence the double bake exists to prevent.
     */
    for (const line of templates) {
      const one = renderTemplate(line.template, 1)
      const many = renderTemplate(line.template, 2)
      expect(resolveLine(many.replace(/\b2\b/, '1'))).toBeNull()
      expect(resolveLine(one.replace(/\b1\b/, '3'))).toBeNull()
      /* A padded numeral parses to a number the sentence does not show. */
      expect(resolveLine(many.replace(/\b2\b/, '02'))).toBeNull()
    }
  })
})

describe('resolving a whole line', () => {
  it('gives back the one clip that says it', () => {
    for (const line of wholes) {
      expect(resolveLine(ledgerText(line.id)), line.id).toEqual([line.id])
    }
  })

  it('refuses a near miss rather than playing something close', () => {
    /*
     * A clip is a recording of ONE sentence. "Nearly that sentence" is a
     * different sentence, and the honest answer is synthesis — so every one of
     * these has to be null, including the three dots, which look identical on
     * the page and are not the bytes that were spoken.
     */
    for (const line of wholes) {
      expect(resolveLine(`${line.text} `), `${line.id} with a trailing space`).toBeNull()
      expect(resolveLine(line.text.trimEnd().slice(0, -1)), `${line.id} truncated`).toBeNull()
      if (line.text.includes('…')) {
        expect(resolveLine(line.text.replace('…', '...')), `${line.id} with straight dots`).toBeNull()
      }
      if (line.text.includes("'")) {
        expect(resolveLine(line.text.replace(/'/g, '’')), `${line.id} with a curly apostrophe`).toBeNull()
      }
      if (line.text.includes('—')) {
        expect(resolveLine(line.text.replace('—', '-')), `${line.id} with a hyphen for the dash`).toBeNull()
      }
    }
  })

  it('leaves the six name-bearing lines on synthesis', () => {
    /*
     * The splice law again, from the player's end. These are the ledger's TARGET
     * wordings, and the code does not speak them yet (item 11 / PB-020) — but
     * even once it does, what plays is a chain of three, never one clip of Fred
     * saying a name. Nothing here may resolve.
     */
    for (const { id } of NOT_PLAYED) {
      expect(resolveLine(ledgerText(id)), `${id} must not resolve to a clip`).toBeNull()
    }
  })
})

describe('what it does with anything else', () => {
  it('is silent rather than sorry', () => {
    /*
     * `resolveLine` is called on every line the island speaks, most of which are
     * the teacher's or a lesson's. Null is the ordinary answer, not an error, so
     * nothing here may throw and nothing may log.
     */
    expect(resolveLine('')).toBeNull()
    expect(resolveLine('Fred!')).toBeNull()
    expect(resolveLine('.*+?^${}()|[]\\ (?:a|b) (\\d+) ^$')).toBeNull()
    expect(resolveLine('x'.repeat(50_000))).toBeNull()
    expect(resolveLine('Let\'s read with the egg — {n} more {friend|friends} will fill it up!')).toBeNull()
    expect(resolveLine('Let\'s read with the egg — many more friends will fill it up!')).toBeNull()
  })

  it('answers a number too big to be a count with silence, not a wrong clip', () => {
    for (const line of templates) {
      expect(resolveLine(renderTemplate(line.template, 99))).toBeNull()
      expect(resolveLine(renderTemplate(line.template, 1_000_000))).toBeNull()
    }
  })
})
