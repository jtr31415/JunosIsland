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
})
