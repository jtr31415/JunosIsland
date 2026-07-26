/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest'
import { inDeadZone, DEAD_ZONE_SELECTOR } from '../../src/challenges/deadzone'

function rectEl(left: number, top: number, width: number, height: number): Element {
  const el = document.createElement('div')
  el.getBoundingClientRect = () => ({
    left, top, width, height, right: left + width, bottom: top + height,
    x: left, y: top, toJSON: () => ({}),
  }) as DOMRect
  return el
}

describe('inDeadZone', () => {
  const els = [rectEl(100, 100, 50, 50)]   // left 100, right 150, top 100, bottom 150

  it('is true inside an element', () => {
    // v0:2071
    expect(inDeadZone(120, 120, els)).toBe(true)
  })

  it('is true within the 16px padding around an element', () => {
    // v0:2066 pad = 16 — near-misses beside a control must not turn the page
    expect(inDeadZone(90, 120, els)).toBe(true)
    expect(inDeadZone(160, 120, els)).toBe(true)
  })

  it('is false well outside', () => {
    expect(inDeadZone(400, 400, els)).toBe(false)
  })

  it('excludes the exact boundary pixel — comparisons are strict', () => {
    // v0:2071 uses `x > r.left - pad`, NOT `>=`. This is the ONLY assertion
    // that can tell the two apart: at x = 100 - 16 = 84 exactly, strict gives
    // false and inclusive gives true. Without it, a regression to `>=` passes
    // every other test in this file.
    expect(inDeadZone(84, 120, els)).toBe(false)
    expect(inDeadZone(85, 120, els)).toBe(true)
    expect(inDeadZone(166, 120, els)).toBe(false)   // right 150 + 16
    expect(inDeadZone(120, 84, els)).toBe(false)    // top 100 - 16
    expect(inDeadZone(120, 166, els)).toBe(false)   // bottom 150 + 16
  })

  it('is false when there are no elements', () => {
    expect(inDeadZone(120, 120, [])).toBe(false)
  })

  it('the shell selector covers the number pad and the dot hints', () => {
    // v0:2067-2068 verbatim. .nchip and .helper are easy to drop by accident
    // and their absence only shows up as stray page-turns mid-sum.
    expect(DEAD_ZONE_SELECTOR).toBe(
      '#hudLeft,#hudRight,#footer,#words .word,#words .nchip,#words .tile,#words .helper,#words .slot,.visitor',
    )
  })
})
