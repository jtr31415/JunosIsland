/**
 * The forty sets.
 *
 * Phase 3 item 6. Each set is 24 creatures — one per species — and one
 * recoloured atlas, which is what item 5's autopsy makes possible (HANDOFF
 * §6). Forty sets is a little over a thousand creatures.
 *
 * THE ORDER IS LOAD-BEARING, in two ways, and cannot be shuffled casually.
 *
 *   - Sets unlock in this order, so it is the shape of the whole collection
 *     over months of play.
 *   - It is also a READING ladder. Names are fixed per variant and graded by
 *     set (brief §5, voice.md §2), so set 1's twenty-four names sit at band 1
 *     and later sets climb. Reordering sets reorders the reading difficulty
 *     with them.
 *
 * The palettes are mine to design per the brief — "funky, distinct, judged in
 * the Pet-o-matic; no palettes specified here" — so these are a first pass for
 * Joe's veto rather than anything settled. `npm run dev` with the petOMatic
 * flag shows every one of them.
 *
 * Each names an ABSOLUTE colour, and every species is normalised onto it —
 * see recolour.ts. Rotations were tried first and were wrong: a rotation moves
 * a colour around the wheel, so it does nothing at all to an animal with no
 * hue to move, and the polar bear, panda, penguin and elephant sat out every
 * set. Assigning the colour and keeping only each species' own light-to-dark
 * ordering makes them all adapt equally.
 */
import type { SetPalette } from './recolour'

export interface PetSet extends SetPalette {
  /** Stable identity. Saved, so it may never be renamed. */
  id: string
  /** What the album page calls it. This may be changed freely. */
  name: string
}

/**
 * Three treatments per colour family, so a family reads as a family without
 * three sets looking like one another.
 */
const vivid = (hue: number): SetPalette => ({ hue, sat: 0.78, light: 1.0 })
const pastel = (hue: number): SetPalette => ({ hue, sat: 0.28, light: 1.0 })
const deep = (hue: number): SetPalette => ({ hue, sat: 0.85, light: 0.7 })

export const SETS: readonly PetSet[] = [
  /*
   * Set one is the natural palette, untouched, and `isNatural` makes that a
   * literal no-op: the base texture is reused rather than recomposited, so the
   * friends Juno already owns are bit-identical to before this engine existed.
   * A golden test pins it.
   */
  { id: 'natural', name: 'Natural', hue: 0, sat: -1, light: 1 },

  // Yellows and golds
  { id: 'sunshine', name: 'Sunshine', ...vivid(45) },
  { id: 'butter', name: 'Butter', ...pastel(45) },
  { id: 'toffee', name: 'Toffee', ...deep(38) },

  // Yellow-greens
  { id: 'lime', name: 'Lime', ...vivid(75) },
  { id: 'pistachio', name: 'Pistachio', ...pastel(75) },
  { id: 'olive', name: 'Olive', ...deep(70) },

  // Greens
  { id: 'meadow', name: 'Meadow', ...vivid(105) },
  { id: 'mint', name: 'Mint', ...pastel(105) },
  { id: 'moss', name: 'Moss', ...deep(100) },

  // Green-teals
  { id: 'emerald', name: 'Emerald', ...vivid(178) },
  { id: 'seafoam', name: 'Seafoam', ...pastel(178) },
  { id: 'pine', name: 'Pine', ...deep(145) },

  // Cyans
  { id: 'turquoise', name: 'Turquoise', ...vivid(150) },
  { id: 'icicle', name: 'Icicle', ...pastel(150) },
  { id: 'lagoon', name: 'Lagoon', ...deep(185) },

  // Blues
  { id: 'sky', name: 'Sky', ...vivid(200) },
  { id: 'cloud', name: 'Cloud', ...pastel(200) },
  { id: 'ocean', name: 'Ocean', ...deep(205) },

  // Deeper blues
  { id: 'bluebell', name: 'Bluebell', ...vivid(218) },
  { id: 'forgetmenot', name: 'Forget-me-not', ...pastel(218) },
  { id: 'denim', name: 'Denim', ...deep(222) },

  // Indigos
  { id: 'indigo', name: 'Indigo', ...vivid(245) },
  { id: 'wisteria', name: 'Wisteria', ...pastel(245) },
  { id: 'midnight', name: 'Midnight', ...deep(250) },

  // Purples
  { id: 'violet', name: 'Violet', ...vivid(272) },
  { id: 'lilac', name: 'Lilac', ...pastel(272) },
  { id: 'grape', name: 'Grape', ...deep(278) },

  // Magentas
  { id: 'orchid', name: 'Orchid', ...vivid(300) },
  { id: 'candyfloss', name: 'Candyfloss', ...pastel(300) },
  { id: 'plum', name: 'Plum', ...deep(305) },

  // Pinks
  { id: 'bubblegum', name: 'Bubblegum', ...vivid(325) },
  { id: 'blossom', name: 'Blossom', ...pastel(325) },
  { id: 'berry', name: 'Berry', ...deep(332) },

  // Reds, back round the wheel
  { id: 'cherry', name: 'Cherry', ...vivid(0) },
  { id: 'coral', name: 'Coral', ...pastel(14) },
  { id: 'ruby', name: 'Ruby', ...deep(352) },

  /*
   * Three that are not a hue rotation at all, so the run of forty does not
   * read as one idea repeated. Saturation alone changes these.
   */
  { id: 'storm', name: 'Storm', hue: 210, sat: 0.10, light: 0.82 },
  { id: 'chalk', name: 'Chalk', hue: 40, sat: 0.07, light: 1.0 },
  { id: 'sherbet', name: 'Sherbet', hue: 20, sat: 0.42, light: 1.0 },
] as const

/** Every creature is one of these. Saved as `{setId, speciesId}`. */
export interface VariantId {
  setId: string
  speciesId: string
}

export const setById = (id: string): PetSet | undefined =>
  SETS.find(s => s.id === id)

/** The natural set, which is where every island starts. */
export const NATURAL = SETS[0] as PetSet

/** How many creatures the whole ladder holds, for the record. */
export const totalVariants = (species: number): number => SETS.length * species

/**
 * A stable key for one creature.
 *
 * Used for the name table, the album and the save. Deliberately not an index:
 * inserting a set later must not renumber every creature Juno owns.
 */
export const variantKey = (v: VariantId): string => `${v.setId}/${v.speciesId}`
