/**
 * Verbatim-literal guard.
 *
 * Several core/ modules are specified as "copy this literal from the original
 * unchanged" — word lists, grapheme inventories, decoy pools, sound maps,
 * theme palettes. Hand-written assertions cannot really check that: they check
 * whatever the author happened to think of.
 *
 * This test instead executes the ORIGINAL's own literals out of the frozen
 * file and deep-compares them with ours. A transcription slip anywhere in this
 * data fails here, immediately and specifically, rather than surfacing later as
 * a mysterious golden-diff mismatch.
 *
 * v0/junos-words.html is read-only.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { GREEN, RED, CONFUSABLE, groupOf } from '../../src/core/wordlists'
import { GRAPHS } from '../../src/core/segmentation'
import { buildPool, buildNeighbours } from '../../src/core/neighbours'
import { AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, AL_CODAS_LONG, REAL_BLOCK } from '../../src/core/alien'
import { THEMES } from '../../src/core/themes'

const src = readFileSync(resolve(__dirname, '../../v0/junos-words.html'), 'utf8').split(/\r?\n/)

/** Execute a 1-indexed inclusive line range of the original and return its bindings. */
function evalRange(a: number, b: number, ret: string): Record<string, unknown> {
  return new Function(src.slice(a - 1, b).join('\n') + `; return {${ret}};`)() as Record<string, unknown>
}

describe('core data matches the frozen original verbatim', () => {
  it('wordlists (v0:368-395)', () => {
    const o = evalRange(368, 395, 'GREEN, RED, CONFUSABLE, groupOf')
    expect(GREEN).toEqual(o.GREEN)
    expect(RED).toEqual(o.RED)
    expect(CONFUSABLE).toEqual(o.CONFUSABLE)
    expect(groupOf).toEqual(o.groupOf)
  })

  it('GRAPHS inventory and order (v0:412-415)', () => {
    // Order is matching priority, not decoration — a sorted copy would break
    // longest-first matching, so compare the sequence, not the set.
    const o = evalRange(412, 415, 'GRAPHS')
    expect(GRAPHS).toEqual(o.GRAPHS)
  })

  it('the whole neighbour map is identical, entry for entry (v0:432-460)', () => {
    // Derived rather than copied, but comparing the entire built map against
    // the original's is the strongest available check on lev1, buildPool and
    // the group-exclusion filter all at once — including iteration order.
    const code = [[368, 395], [398, 428], [432, 460]] as const
    const o = new Function(
      code.map(([a, b]) => src.slice(a - 1, b).join('\n')).join('\n') + '; return NEIGH;',
    )() as Record<string, unknown>
    expect(buildNeighbours(buildPool())).toEqual(o)
  })

  it('alien pools and the REAL_BLOCK set (v0:463-489)', () => {
    // REAL_BLOCK is 200+ hand-listed words; this is the only realistic way to
    // know ours matches. AL_VOWELS repeats the short vowels deliberately, so
    // compare sequences rather than sets.
    const code = [[368, 395], [398, 428], [463, 489]] as const
    const o = new Function(
      code.map(([a, b]) => src.slice(a - 1, b).join('\n')).join('\n') +
      '; return {AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, AL_CODAS_LONG, REAL_BLOCK};',
    )() as Record<string, unknown>
    expect(AL_ONSETS).toEqual(o.AL_ONSETS)
    expect(AL_VOWELS).toEqual(o.AL_VOWELS)
    expect(AL_CODAS_SHORT).toEqual(o.AL_CODAS_SHORT)
    expect(AL_CODAS_LONG).toEqual(o.AL_CODAS_LONG)
    expect([...REAL_BLOCK].sort()).toEqual([...(o.REAL_BLOCK as Set<string>)].sort())
  })

  it('theme palettes, including every hex value (v0:507-515)', () => {
    // A transposed hex digit is invisible to a shape-only test but changes the
    // particle colours, so compare the whole structure.
    const o = evalRange(507, 515, 'THEMES')
    expect(THEMES).toEqual(o.THEMES)
  })
})
