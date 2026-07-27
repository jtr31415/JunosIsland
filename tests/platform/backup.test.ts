import { describe, it, expect } from 'vitest'
import {
  backupFilename, readBackup, summarise, confirmText,
} from '../../src/platform/backup'
import { seal } from '../../src/platform/envelope'

/**
 * The only route off the device. Brief §19 permits no accounts and no network
 * calls beyond static hosting, so a file the grown-up keeps IS the off-device
 * copy — the difference between a lost tablet costing an afternoon and costing
 * everything she has built.
 */

describe('backupFilename', () => {
  const june = new Date(2026, 5, 3)

  it('names the file after the child and the day', () => {
    expect(backupFilename('Juno', june)).toBe('pet-island-save-juno-2026-06-03.json')
  })

  it('pads the month and day', () => {
    // Otherwise "2026-6-3" sorts oddly in a folder of backups, which is where
    // a parent will be looking when they need one.
    expect(backupFilename('a', new Date(2026, 10, 20)))
      .toBe('pet-island-save-a-2026-11-20.json')
  })

  it('survives a name the filesystem would refuse', () => {
    // A real six-year-old may be Siobhán, or type an emoji into the prompt.
    expect(backupFilename("Siobhán O'Neill", june))
      .toBe('pet-island-save-siobh-n-o-neill-2026-06-03.json')
    expect(backupFilename('🐱', june)).toBe('pet-island-save-island-2026-06-03.json')
  })

  it('falls back when she never gave a name', () => {
    expect(backupFilename('', june)).toBe('pet-island-save-island-2026-06-03.json')
  })
})

describe('readBackup', () => {
  it('accepts one of ours', () => {
    const env = seal({ pets: [] }, 3, 1000)
    expect(readBackup(JSON.stringify(env))?.rev).toBe(3)
  })

  it('refuses everything else, without throwing', () => {
    /*
     * Every failure here has to be "nothing happened". An import is the one
     * moment a parent can destroy an island on purpose, so a wrong file picked
     * in a hurry must not leave a half-applied save behind.
     */
    expect(readBackup('')).toBeNull()
    expect(readBackup('not json')).toBeNull()
    expect(readBackup('{"hello":"world"}')).toBeNull()
    expect(readBackup('[]')).toBeNull()
    expect(readBackup('{"rev":1,"data":{}}')).toBeNull()
    // A truncated download: valid prefix, invalid whole.
    expect(readBackup(JSON.stringify(seal({ pets: [] }, 1, 1)).slice(0, 30))).toBeNull()
  })
})

describe('summarise', () => {
  it('reads the name and the friend count out of a save', () => {
    const env = seal({ childName: 'Juno', pets: [{ id: 'a' }, { id: 'b' }] }, 1, 0)
    const s = summarise(env)
    expect(s.name).toBe('Juno')
    expect(s.pets).toBe(2)
  })

  it('copes with a save that has neither', () => {
    const s = summarise(seal({}, 1, 0))
    expect(s.name).toBe('unnamed')
    expect(s.pets).toBe(0)
  })

  it('copes with fields of the wrong type', () => {
    // Hand-edited files exist, and a crash in the confirm dialog would leave a
    // parent unable to restore at all.
    const s = summarise(seal({ childName: 42, pets: 'lots' }, 1, 0))
    expect(s.name).toBe('unnamed')
    expect(s.pets).toBe(0)
  })
})

describe('confirmText', () => {
  it('says whose island, how many friends, and that it can be undone', () => {
    const text = confirmText(
      { name: 'Juno', savedAt: '3/6/2026, 10:00:00', pets: 7 },
      { name: 'Juno', savedAt: '', pets: 2 },
    )
    expect(text).toContain("Restore Juno's island?")
    expect(text).toContain('7 friends')
    expect(text).toContain('2 friends')
    expect(text).toContain('can be undone')
  })

  it('does not say "1 friends"', () => {
    const text = confirmText(
      { name: 'A', savedAt: 'x', pets: 1 }, { name: 'A', savedAt: '', pets: 1 })
    expect(text).toContain('1 friend,')
    expect(text).not.toContain('1 friends')
  })
})
