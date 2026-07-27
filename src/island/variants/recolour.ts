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

/**
 * How a set differs from the natural palette.
 *
 * ASSIGNED, not rotated — and that correction is Joe's, from playing with the
 * Pet-o-matic: *"the hue never works for all of them, because it only changes
 * one channel and an animal may not have that channel. The polar bear is
 * almost always white."*
 *
 * Exactly right, and it is a whole-design problem rather than a tuning one. A
 * hue rotation moves a colour around the wheel, so it does nothing at all to a
 * colour that has no hue to move: white stays white, grey stays grey. Rotate
 * the palette and the fox becomes a berry fox while the polar bear, the panda,
 * the penguin and the elephant stay exactly as they were — near enough half
 * the roster refusing to join in.
 *
 * So a set now NAMES a colour rather than nudging one, and each species is
 * normalised onto it: every coat colour keeps its position in that species'
 * own light-to-dark ordering and takes the set's hue and saturation. A white
 * bear becomes a properly berry bear, because "how light was this pixel
 * relative to this animal's other pixels" survives while "what colour was it"
 * does not.
 */
export interface SetPalette {
  /** The set's colour, in degrees. This is where the coat ends up. */
  hue: number
  /** How vivid, 0..1. Applied absolutely, not as a multiplier. */
  sat: number
  /**
   * How light the coat sits overall, as a multiplier on the normalised ramp —
   * so a set can be pale or deep without losing the shading that makes the
   * models read as solid.
   */
  light: number
}

/**
 * Darker than this and a pixel is the SOUL — a pupil, a nostril, an outline.
 *
 * Saturation used to come into this too, and that was the mistake Joe caught
 * from the Pet-o-matic. Protecting every low-saturation pixel protects a POLAR
 * BEAR, whose entire coat is low-saturation — along with the panda, the
 * penguin, the elephant and the rest. Half the roster sat out every set. The
 * face is now defended by darkness alone.
 *
 * The eye-whites are consequently recoloured with everything else, ending up
 * as a very pale tint of the set rather than pure white. A deliberate trade,
 * and a forced one: these models have no separate face mesh — measured, the
 * face is painted onto `body` — and no texel belongs only to faces, so the one
 * way to keep whites white is to keep white animals white. A faintly berry
 * sclera under a black pupil reads as a cartoon animal; a bear that refuses to
 * change colour reads as a bug.
 */
export const SOUL_VALUE = 78

/** Is this pixel part of the face rather than the coat? */
export function isSoul(r: number, g: number, b: number): boolean {
  return Math.max(r, g, b) < SOUL_VALUE
}

/**
 * How wide one colour role is in the atlas.
 *
 * Item 5 measured seven sampled columns at u = 48, 112, 176, 240, 304, 432 and
 * 496 — evenly spaced, 64 pixels apart. Each band is one role: a coat, a
 * belly, a beak. Normalising per band is what lets a single texture per set
 * serve all 24 species, because a species' colours live in particular bands.
 */
export const BAND = 64

/**
 * Where a normalised coat sits, darkest to lightest.
 *
 * Not 0..1: pure black and pure white at the ends of every ramp would flatten
 * the models at both extremes and lose the shading that makes them read solid.
 */
export const RAMP_LOW = 0.34
export const RAMP_HIGH = 1.0

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
 * Recolour one pixel, given where it sits in its band's light-to-dark range.
 *
 * `t` is that normalised position: 0 is the darkest coat colour in the band, 1
 * the lightest. That ordering IS the shading, and it is the only thing carried
 * over — hue and saturation come wholly from the set. It is what makes a white
 * bear and a brown fox arrive at equally berry versions of themselves.
 */
export function shade(t: number, p: SetPalette): [number, number, number] {
  const ramp = RAMP_LOW + (RAMP_HIGH - RAMP_LOW) * Math.max(0, Math.min(1, t))
  return hsvToRgb(
    p.hue,
    Math.max(0, Math.min(1, p.sat)),
    Math.max(0, Math.min(1, ramp * p.light)),
  )
}

/**
 * Is this palette a no-op?
 *
 * A sentinel rather than arithmetic, now that hue and saturation are assigned
 * rather than nudged: no combination of an absolute hue and an absolute
 * saturation means "leave it alone". A negative saturation is the natural set
 * and nothing else, and the natural set has to be bit-identical rather than
 * merely close — that is what makes the friends she already owns provably
 * unchanged.
 */
export const isNatural = (p: SetPalette): boolean => p.sat < 0

/**
 * Recolour a whole RGBA buffer in place, returning how many pixels moved.
 *
 * Two passes. The first measures each band's own light-to-dark range; the
 * second maps every coat pixel onto the set's colour at its position in that
 * range. That normalisation is the whole answer to "the hue never works for
 * all of them": a band of near-identical whites is stretched across the ramp
 * exactly as a band of browns is, so a polar bear takes a set as completely as
 * a fox does.
 *
 * In place because these are 512×512×4 — a megabyte a set, and forty sets is
 * not the moment to be casually copying.
 */
export function recolourInto(
  rgba: Uint8ClampedArray, p: SetPalette, width: number, band = BAND,
): number {
  if (isNatural(p)) return 0

  const bands = Math.max(1, Math.ceil(width / band))
  const lo = new Array<number>(bands).fill(Infinity)
  const hi = new Array<number>(bands).fill(-Infinity)
  const bandOf = (i: number): number =>
    Math.min(bands - 1, Math.floor(((i / 4) % width) / band))

  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    if (isSoul(r, g, b)) continue
    const v = Math.max(r, g, b) / 255
    const k = bandOf(i)
    if (v < (lo[k] as number)) lo[k] = v
    if (v > (hi[k] as number)) hi[k] = v
  }

  let moved = 0
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    if (isSoul(r, g, b)) continue
    const k = bandOf(i)
    const min = lo[k] as number, max = hi[k] as number
    /*
     * A band holding one flat colour has no range to normalise. Put it in the
     * middle of the ramp rather than at an end, so a species whose coat is a
     * single tone lands somewhere sensible instead of at black or white.
     */
    const t = max > min ? (Math.max(r, g, b) / 255 - min) / (max - min) : 0.5
    const [nr, ng, nb] = shade(t, p)
    if (nr !== r || ng !== g || nb !== b) moved++
    rgba[i] = nr; rgba[i + 1] = ng; rgba[i + 2] = nb
  }
  return moved
}
