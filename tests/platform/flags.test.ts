import { describe, it, expect } from 'vitest'
import { readFlags, FLAGS } from '../../src/platform/flags'

/**
 * Item 4's runtime half. The build-output half — proving `balance.dev.json` is
 * absent from a production bundle rather than merely unreachable — is
 * `tools/smoke/channel.mjs`, run in CI against the real build.
 *
 * The rule these enforce: in production every flag is off and NOTHING can turn
 * one on. Not "off by default". A parent handing over a tablet is not going to
 * audit a link, so no URL a child could conceivably arrive at may enable an
 * unfinished feature.
 */

describe('production', () => {
  it('has every flag off', () => {
    const flags = readFlags('', 'production')
    for (const name of FLAGS) expect(flags.on(name)).toBe(false)
    expect(flags.enabled()).toEqual([])
  })

  it('cannot be talked into turning one on', () => {
    // The query string is not consulted at all in production — these are the
    // strings someone would reach for, and every one of them does nothing.
    for (const search of [
      '?only=sets', '?off=', '?sets=1', '?preview=1', '?flags=all',
      '?only=sets,quests,wonders', '?debug', '?fast',
    ]) {
      const flags = readFlags(search, 'production')
      expect(flags.enabled(), `production must ignore ${search}`).toEqual([])
    }
  })
})

describe('preview', () => {
  it('has everything on, which is what preview is for', () => {
    const flags = readFlags('', 'preview')
    for (const name of FLAGS) expect(flags.on(name)).toBe(true)
  })

  it('turns individual ones off for comparing', () => {
    const flags = readFlags('?off=sets,quests', 'preview')
    expect(flags.on('sets')).toBe(false)
    expect(flags.on('quests')).toBe(false)
    expect(flags.on('visitor')).toBe(true)
  })

  it('narrows to a single feature with only=', () => {
    const flags = readFlags('?only=wonders', 'preview')
    expect(flags.enabled()).toEqual(['wonders'])
  })

  it('lets off= win over only=, so a pair of flags cannot contradict', () => {
    expect(readFlags('?only=sets,quests&off=quests', 'preview').enabled()).toEqual(['sets'])
  })

  it('ignores names that are not flags', () => {
    // A typo must not silently mean "everything", nor throw.
    expect(readFlags('?only=nonsense', 'preview').enabled()).toEqual([])
    expect(readFlags('?off=nonsense', 'preview').enabled()).toHaveLength(FLAGS.length)
  })

  it('copes with a search string given with or without its question mark', () => {
    expect(readFlags('off=sets', 'preview').on('sets')).toBe(false)
    expect(readFlags('?off=sets', 'preview').on('sets')).toBe(false)
  })

  it('tolerates spaces, because people type them', () => {
    expect(readFlags('?off=sets, quests', 'preview').on('quests')).toBe(false)
  })
})

describe('the flag list itself', () => {
  it('has no duplicates', () => {
    expect(new Set(FLAGS).size).toBe(FLAGS.length)
  })

  it('covers the features this phase is not finishing', () => {
    // Adding a name here is how a feature becomes deployable; removing one is
    // how it becomes real. A flag never retired is a branch nobody dares
    // delete, so this list is meant to shrink.
    for (const expected of ['sets', 'habitats', 'quests', 'visitor', 'wonders']) {
      expect(FLAGS).toContain(expected)
    }
  })
})
