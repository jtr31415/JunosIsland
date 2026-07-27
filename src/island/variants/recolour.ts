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
/**
 * Solid or stripy — the same twelve colours, worn two ways.
 *
 * Discovered by accident: a bug that recoloured only the exact sampled rows of
 * the atlas gradient banded every animal like a deckchair, and the banding
 * looked rather good.
 *
 * SPOTS ARE NOT EXPRESSIBLE HERE, and that is measured rather than a matter of
 * effort. Joe reported that every set marked "dotted" was striped, and the cause
 * is that all 15,333 triangles in the pack have a u-span of 0.00 atlas pixels —
 * every triangle sits inside a single column. The old dotty rule was
 * `(floor(y/5) + floor(x/5)) % 3`, so its x term was CONSTANT per triangle and
 * the whole thing collapsed to a function of y: stripes with an offset.
 *
 * Nor is there a positional signal to reach for instead. Atlas v correlates with
 * local vertex position at r = 0.015 (x), −0.081 (y) and −0.011 (z) — v is the
 * shade the artist assigned a face, not where that face is on the animal. So a
 * pattern painted into this atlas is a function of SHADE, and any spot would
 * land wherever the shading happened to pass through it.
 *
 * Real spots therefore need a positional signal the texture does not carry —
 * object-space in a shader, or per-part meshes. Joe's call, having seen this:
 * *"we drop the dots for now, too much work for the value it brings."*
 */
export type Pattern = 'solid' | 'stripy'

export interface SetPalette {
  /** The set's colour, in degrees. This is where the coat ends up. */
  hue: number
  /** How vivid, 0..1. Applied absolutely, not as a multiplier. */
  sat: number
  /** How the colour is worn. Defaults to solid. */
  pattern?: Pattern
  /**
   * How light the coat sits overall, as a multiplier on the normalised ramp —
   * so a set can be pale or deep without losing the shading that makes the
   * models read as solid.
   */
  light: number
  /**
   * Where the ramp STARTS, for a set that has to read as light.
   *
   * Joe: *"make the sky colour lighter"*. Dropping saturation was the first
   * attempt and it produced a dusty teal — desaturated is not the same as light.
   * Value is the lever, and `light` cannot raise it: the ramp already reaches
   * RAMP_HIGH, so a multiplier above 1 only clips. Lifting the FLOOR is what
   * lightens a set, because it narrows the ramp upward and leaves the top alone.
   *
   * Defaults to RAMP_LOW.
   */
  floor?: number
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
 * How much of its own contrast a species must have before its coat is stretched
 * across the whole ramp.
 *
 * Normalising a species onto its own light-to-dark range is what lets a penguin
 * and a fox take a set equally. Done without a limit it also AMPLIFIES: a polar
 * bear's coat spans 0.137 of value, so stretching it over a ramp 0.66 wide is a
 * gain of 4.8, and the atlas's own gradient steps come up with it as horizontal
 * contour banding — visible on solid sets, and reading as exactly the corrugation
 * the stripes were criticised for.
 *
 * So the gain is capped. A species with ordinary contrast — the beaver's coat
 * spans 0.397, half-width 0.199 — is stretched fully, as before. A species with
 * less than that keeps its shading gentle and CENTRED on the ramp, which is
 * still the whole point: centred means clearly coloured, whether the coat started
 * near-white or near-black.
 *
 * Expressed as a half-width, to match the arithmetic that uses it.
 */
export const CONTRAST_REFERENCE = 0.2

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
/** The patch of colour space a species' base coat occupies. */
export interface Region {
  /** Circular mean hue of the base colours, in degrees. */
  hue: number
  /** True when the base is essentially colourless — a polar bear, a panda. */
  pale: boolean
}

/**
 * Describe a species' base coat as a region, from the colours it samples.
 *
 * Derived rather than stored, so `species-base.json` stays a plain list of
 * observed colours — a fact about the models — while the interpretation of
 * that list lives here where it can be changed without regenerating anything.
 */
export function regionOf(base: ReadonlySet<string>): Region | null {
  let x = 0, y = 0, chromatic = 0, pale = 0
  for (const key of base) {
    const [r, g, b] = key.split(',').map(Number) as [number, number, number]
    const [h, s] = rgbToHsv(r, g, b)
    if (s < MARKING_SATURATION) { pale++; continue }
    chromatic++
    x += Math.cos(h * Math.PI / 180)
    y += Math.sin(h * Math.PI / 180)
  }
  if (chromatic === 0 && pale === 0) return null
  if (pale > chromatic) return { hue: 0, pale: true }
  const hue = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  return { hue, pale: false }
}

/** Is this colour part of that region — the coat rather than a marking? */
export function inRegion(r: number, g: number, b: number, region: Region): boolean {
  const [h, s] = rgbToHsv(r, g, b)
  if (region.pale) return s < MARKING_SATURATION
  if (s < MARKING_SATURATION) return false
  const d = Math.abs(((h - region.hue) % 360 + 540) % 360 - 180)
  return d <= BASE_HUE_SPREAD
}

/**
 * How tall a stripe is, in atlas rows.
 *
 * Chosen against the measurement rather than by taste, then checked by eye at
 * three values. A triangle's v-span is 16.8 atlas rows at the median and 81.5 at
 * p90, so the pitch decides whether a stripe is smaller or larger than a face:
 *
 *   - 6 (the original) put 1.4 stripe cycles across the median face and up to
 *     6.8 across a large one. That is finer than the geometry, and it read as
 *     knitwear ribbing rather than as markings — the thing Joe's first
 *     Pet-o-matic screenshot shows.
 *   - 40 put most faces entirely inside one band. The corrugation went, and so
 *     did the pattern: it became indistinguishable from the solid set with
 *     slightly uneven lighting.
 *   - 14 gives roughly one cycle across a median face, so a body carries three
 *     to five broad bands. Bold at pet scale and legible across a room.
 */
export const STRIPE = 14

/**
 * Push a pixel's place on the ramp light or dark, to make a pattern.
 *
 * The whole trick is that it stays the SET's colour throughout — a stripy
 * berry pet is berry in both its stripes, one lighter than the other, rather
 * than berry crossed with something else. Joe's brief for these was "stripy
 * and dotty with the same colours".
 *
 * Deliberately painted into the ramp rather than as a second hue, because a
 * face samples one point of the atlas: whatever lands there is a flat colour
 * on that face, so the pattern is made of which faces get which shade.
 *
 * `x` is accepted and unused. It is kept in the signature because the only
 * pattern this atlas could ever carry is a function of y — see the note on
 * `Pattern` — and a caller passing a position deserves to be told that by the
 * type rather than by a surprise.
 */
export function patterned(
  t: number, _x: number, y: number, pattern: Pattern = 'solid',
): number {
  if (pattern === 'stripy') {
    const band = Math.floor(y / STRIPE) % 2 === 0
    return Math.max(0, Math.min(1, band ? t * 0.55 : t * 0.55 + 0.45))
  }
  return t
}

export function shade(t: number, p: SetPalette): [number, number, number] {
  const low = Math.max(0, Math.min(RAMP_HIGH, p.floor ?? RAMP_LOW))
  const ramp = low + (RAMP_HIGH - low) * Math.max(0, Math.min(1, t))
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
    /*
     * A REGION of colour space, not a list of exact colours.
     *
     * The first attempt tested membership by exact RGB match against the
     * texels a species samples — and the atlas is a smooth vertical gradient,
     * so only those exact rows recoloured while every row between them stayed
     * as it was. Every animal came out banded like a deckchair, which is what
     * Joe's screenshot shows. The sampled colours DESCRIBE a region; the whole
     * region has to move together, or the gradient tears.
     */
    const region = regionOf(base)
    if (!region) return 0

    /*
     * The light-to-dark range comes from the SPECIES' OWN colours, not from
     * every atlas pixel that happens to share its hue.
     *
     * Joe, on the penguin: *"the black should change and is changing, but seems
     * to maintain the underlying black, making any colour change just very
     * dark."* Measured, and he is describing a normalisation bug rather than a
     * palette one. A penguin's coat occupies value 0.31–0.39 — a narrow, dark
     * slice. `inRegion` is a hue WINDOW, so scanning the atlas for everything
     * within 42° of hue 230 also swept up the elephant's pale blue-grey at 0.90
     * and the cat's and koala's greys. That set hi ≈ 0.9 against the penguin's
     * own lo ≈ 0.31, so its coat landed at t ≈ 0.07 — the bottom of the ramp,
     * for every set. Dark, whatever colour it was told to be.
     *
     * Normalising against its own 14 recorded colours stretches that slice
     * across the whole ramp, so a penguin takes a set as fully as a fox does —
     * the same correction as the pale animals, one level up. Pixels outside the
     * species' own range clamp to the ends, which keeps the gradient continuous
     * rather than tearing it; they are pixels this species does not sample, and
     * the texture is built per species precisely so that does not matter.
     */
    let lo = Infinity, hi = -Infinity
    for (const key of base) {
      const [r, g, b] = key.split(',').map(Number) as [number, number, number]
      if (isSoul(r, g, b)) continue
      const v = Math.max(r, g, b) / 255
      if (v < lo) lo = v
      if (v > hi) hi = v
    }

    let changed = 0
    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] === 0) continue
      const r = rgba[i] as number, g = rgba[i + 1] as number, b = rgba[i + 2] as number
      if (isSoul(r, g, b) || !inRegion(r, g, b, region)) continue
      const v = Math.max(r, g, b) / 255
      /*
       * Centred on the ramp, with the gain capped at CONTRAST_REFERENCE. Writing
       * it around the CENTRE rather than the low end is what makes the cap mean
       * something: a low-contrast coat then sits in the middle of the ramp and
       * reads as a coloured animal, instead of being pinned to whichever end its
       * darkest colour happened to fall on.
       */
      const t = hi > lo
        ? Math.max(0, Math.min(1,
          0.5 + (v - (lo + hi) / 2) / (2 * Math.max((hi - lo) / 2, CONTRAST_REFERENCE))))
        : 0.5
      const px = (i / 4) % width
      const py = Math.floor((i / 4) / width)
      const [nr, ng, nb] = shade(patterned(t, px, py, p.pattern), p)
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
