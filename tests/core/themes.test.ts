import { describe, it, expect } from 'vitest'
import { THEMES } from '../../src/core/themes'

describe('THEMES', () => {
  it('has the seven established themes', () => {
    // v0:507-515 — halloween and christmas ride the real calendar (brief section 4)
    expect(Object.keys(THEMES).sort()).toEqual(
      ['christmas', 'garden', 'halloween', 'ocean', 'space', 'summer', 'unicorn'],
    )
  })

  it('every theme has three burst colours as hex values', () => {
    for (const t of Object.values(THEMES)) {
      expect(t.burst).toHaveLength(3)
      for (const c of t.burst) expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('every theme has a sensible audio range', () => {
    // lo/hi feed popSound's frequency sweeps (v0:2021)
    for (const t of Object.values(THEMES)) {
      expect(t.lo).toBeGreaterThan(0)
      expect(t.hi).toBeGreaterThan(t.lo)
    }
  })
})
