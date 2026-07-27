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

/**
 * How far from its band's base colour a hue may sit and still be the coat.
 *
 * Beyond this it is a MARKING and keeps the colour the artist gave it — the
 * tiger's stripes, the tortoiseshell's patches. Wide enough that the shading
 * either side of a base colour travels with it, narrow enough that a genuinely
 * different colour does not.
 */
export const BASE_HUE_SPREAD = 42

/**
 * Below this saturation a pixel is treated as pale rather than coloured.
 *
 * Which side of the line that puts it depends on its band: on a coloured coat
 * a pale pixel is a marking (a penguin's belly, a badger's stripe) and stays;
 * on a coat that is ITSELF pale — the polar bear — the pale pixels are the
 * coat and are what must change.
 */
export const MARKING_SATURATION = 0.12

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
  rgba: Uint8ClampedArray, p: SetPalette, width: number,
  base?: ReadonlySet<string>, band = BAND,
): number {
  if (isNatural(p)) return 0

  /*
   * The species' OWN base coat, when we know which species this is for.
   *
   * Joe: "for pig, polar bear, penguin, goat and panda you picked the wrong
   * base colour to change." The band heuristic below decides base-versus-
   * marking from a whole atlas band, and a band is shared by up to 23 species
   * — so the vote goes to whatever most of them use it for, and the pale,
   * monochrome animals lose it every time. Their coat gets treated as somebody
   * else's marking and never changes.
   *
   * A base coat is a fact about an ANIMAL. `species-base.json` records it,
   * computed from each model's own UVs by tools/pets/atlas.mjs, and when it is
   * supplied it settles the question outright.
   */
  if (base) {
    let lo = Infinity, hi = -Infinity
    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] === 0) continue
      if (!base.has(`${rgba[i]},${rgba[i + 1]},${rgba[i + 2]}`)) continue
      const v = Math.max(rgba[i] as number, rgba[i + 1] as number, rgba[i + 2] as number) / 255
      if (v < lo) lo = v
      if (v > hi) hi = v
    }
    let changed = 0
    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] === 0) continue
      const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
      if (!base.has(`${r},${g},${b}`)) continue        // a marking, or the face
      const v = Math.max(r, g, b) / 255
      const t = hi > lo ? (v - lo) / (hi - lo) : 0.5
      const [nr, ng, nb] = shade(t, p)
      if (nr !== r || ng !== g || nb !== b) changed++
      rgba[i] = nr; rgba[i + 1] = ng; rgba[i + 2] = nb
    }
    return changed
  }

  const bands = Math.max(1, Math.ceil(width / band))
  const bandOf = (i: number): number =>
    Math.min(bands - 1, Math.floor(((i / 4) % width) / band))

  /* -- pass one: what is each band's BASE COAT? ---------------------------- */

  const BUCKETS = 24                                   // 15° apiece
  const hist = Array.from({ length: bands }, () => new Array<number>(BUCKETS).fill(0))
  const pale = new Array<number>(bands).fill(0)
  const chromatic = new Array<number>(bands).fill(0)

  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    if (isSoul(r, g, b)) continue
    const k = bandOf(i)
    const [h, s] = rgbToHsv(r, g, b)
    if (s < MARKING_SATURATION) { pale[k] = (pale[k] as number) + 1; continue }
    chromatic[k] = (chromatic[k] as number) + 1
    const bucket = Math.floor(h / (360 / BUCKETS)) % BUCKETS
    const row = hist[k] as number[]
    row[bucket] = (row[bucket] as number) + 1
  }

  /** The band's own base colour, and whether that base is a pale one. */
  const baseHue = new Array<number>(bands).fill(0)
  const baseIsPale = new Array<boolean>(bands).fill(false)
  for (let k = 0; k < bands; k++) {
    baseIsPale[k] = (pale[k] as number) > (chromatic[k] as number)
    const row = hist[k] as number[]
    let best = 0
    for (let bkt = 1; bkt < BUCKETS; bkt++) {
      if ((row[bkt] as number) > (row[best] as number)) best = bkt
    }
    baseHue[k] = (best + 0.5) * (360 / BUCKETS)
  }

  /**
   * Is this pixel part of the band's base coat, or one of its MARKINGS?
   *
   * Joe, on the first version: "it's now applied across the board. Highlights
   * and eyes need to maintain the original colour — tiger stripes, penguin
   * belly, tortoiseshell, panda stripe."
   *
   * Quite right. Recolouring every non-black pixel to one hue turns a tiger
   * into a solid berry cat: the stripes survive only as a shade difference,
   * and the thing that made it a tiger is gone. So each band keeps its base
   * coat — the colour most of it is made of — and anything far from that in
   * hue, or pale where the base is not, is a marking and is left exactly as
   * the artist drew it.
   */
  const isBase = (h: number, s: number, k: number): boolean => {
    if (baseIsPale[k] === true) return s < MARKING_SATURATION
    if (s < MARKING_SATURATION) return false           // a pale belly on a coloured coat
    const d = Math.abs(((h - (baseHue[k] as number)) % 360 + 540) % 360 - 180)
    return d <= BASE_HUE_SPREAD
  }

  /* -- pass two: normalise the base coat, and only the base coat ----------- */

  const lo = new Array<number>(bands).fill(Infinity)
  const hi = new Array<number>(bands).fill(-Infinity)
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    if (isSoul(r, g, b)) continue
    const k = bandOf(i)
    const [h, s, v] = rgbToHsv(r, g, b)
    if (!isBase(h, s, k)) continue
    if (v < (lo[k] as number)) lo[k] = v
    if (v > (hi[k] as number)) hi[k] = v
  }

  let moved = 0
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue
    const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
    if (isSoul(r, g, b)) continue
    const k = bandOf(i)
    const [h, s, v] = rgbToHsv(r, g, b)
    if (!isBase(h, s, k)) continue                     // a marking: leave it be
    const min = lo[k] as number, max = hi[k] as number
    /*
     * A band whose base is one flat colour has no range to normalise. Put it
     * in the middle of the ramp rather than at an end, so a species whose coat
     * is a single tone lands somewhere sensible instead of at black or white.
     */
    const t = max > min ? (v - min) / (max - min) : 0.5
    const [nr, ng, nb] = shade(t, p)
    if (nr !== r || ng !== g || nb !== b) moved++
    rgba[i] = nr; rgba[i + 1] = ng; rgba[i + 2] = nb
  }
  return moved
}
