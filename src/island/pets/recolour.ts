/**
 * Turning one atlas into forty.
 *
 * Phase 3 item 6, resting entirely on item 5's autopsy (HANDOFF §6): the pets
 * carry ONE material and ONE texture between them, no vertex colours and no
 * base colour factor, so colour is purely a texture lookup. That makes a SET
 * exactly one recoloured 512×512 image, shared by all 24 species in it — forty
 * images for a thousand creatures.
 *
 * Pure, and deliberately so. Everything here is arithmetic on pixel bytes with
 * no canvas, no WebGL and no DOM, which is what lets the rule that protects
 * the pets' faces be tested rather than eyeballed.
 */

/** How a set differs from the natural palette. */
export interface SetPalette {
  /** Degrees to rotate every chromatic colour around the wheel. */
  hue: number
  /** Multiplier on saturation. Above 1 is more vivid, below 1 more muted. */
  sat: number
  /** Multiplier on brightness. */
  light: number
}

/**
 * Below this saturation a colour is the SOUL, not the coat.
 *
 * The line item 5 measured. Of the 710 texels the pets actually sample, 9% sit
 * under this and are the eyes and facial features; 64% are comfortably above
 * it and are coats. Brief §5 requires the face decal to stay constant per
 * species, and a threshold on saturation gives that by construction — the
 * alternatives, preserving shared texels or whole columns, were both measured
 * and both fail (see HANDOFF §6).
 */
export const SOUL_SATURATION = 0.10

/**
 * ...and below this brightness, too.
 *
 * A very dark colour can still be nominally saturated — the near-blacks in the
 * atlas run to a saturation of about 0.2 — and rotating those tints the pupils
 * and the outlines, which is the one thing that must not move. Cheap belt and
 * braces over a measurement taken from 24 files that could be re-exported.
 */
export const SOUL_VALUE = 90

/** Is this pixel part of the face rather than the coat? */
export function isSoul(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b)
  if (max < SOUL_VALUE) return true
  const min = Math.min(r, g, b)
  return (max - min) / max < SOUL_SATURATION
}

/* --------------------------------------------------------------- colour --- */

/** RGB bytes to HSV, with h in degrees and s, v in 0..1. */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === R) h = ((G - B) / d) % 6
    else if (max === G) h = (B - R) / d + 2
    else h = (R - G) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, max === 0 ? 0 : d / max, max]
}

/** ...and back. */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const hh = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))
  const [r1, g1, b1] =
    hh < 1 ? [c, x, 0] : hh < 2 ? [x, c, 0] : hh < 3 ? [0, c, x]
      : hh < 4 ? [0, x, c] : hh < 5 ? [x, 0, c] : [c, 0, x]
  const m = v - c
  const to = (n: number): number => Math.max(0, Math.min(255, Math.round((n + m) * 255)))
  return [to(r1), to(g1), to(b1)]
}

/**
 * Recolour one pixel for a set, or leave it exactly as it was.
 *
 * The gradient down each atlas column is what gives the models their shading,
 * so brightness is scaled rather than replaced: flatten it and every pet turns
 * into a cardboard cut-out of itself.
 */
export function shift(
  r: number, g: number, b: number, p: SetPalette,
): [number, number, number] {
  if (isSoul(r, g, b)) return [r, g, b]
  const [h, s, v] = rgbToHsv(r, g, b)
  return hsvToRgb(
    h + p.hue,
    Math.max(0, Math.min(1, s * p.sat)),
    Math.max(0, Math.min(1, v * p.light)),
  )
}

/** Is this palette a no-op? The natural set must be bit-identical, not close. */
export const isNatural = (p: SetPalette): boolean =>
  p.hue % 360 === 0 && p.sat === 1 && p.light === 1

/**
 * Recolour a whole RGBA buffer in place, returning how many pixels moved.
 *
 * In place because these are 512×512×4 — a megabyte a set, and forty sets is
 * not the moment to be casually copying.
 */
export function recolourInto(rgba: Uint8ClampedArray, p: SetPalette): number {
  if (isNatural(p)) return 0
  let moved = 0
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue                    // fully transparent
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    const [nr, ng, nb] = shift(r, g, b, p)
    if (nr !== r || ng !== g || nb !== b) moved++
    rgba[i] = nr; rgba[i + 1] = ng; rgba[i + 2] = nb
  }
  return moved
}
