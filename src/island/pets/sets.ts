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
 * Each is a rotation away from the natural palette rather than an absolute
 * colour, because the atlas is a set of gradients and the shading has to
 * survive: see recolour.ts. The natural coats sit around hue 25, so a rotation
 * of 180 lands them in the blues, and each family below is named for where its
 * MAJORITY ends up — individual species will differ, which is the point.
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
const vivid = (hue: number): SetPalette => ({ hue, sat: 1.45, light: 1.05 })
const pastel = (hue: number): SetPalette => ({ hue, sat: 0.5, light: 1.3 })
const deep = (hue: number): SetPalette => ({ hue, sat: 1.2, light: 0.68 })

export const SETS: readonly PetSet[] = [
  /*
   * Set one is the natural palette, untouched, and `isNatural` makes that a
   * literal no-op: the base texture is reused rather than recomposited, so the
   * friends Juno already owns are bit-identical to before this engine existed.
   * A golden test pins it.
   */
  { id: 'natural', name: 'Natural', hue: 0, sat: 1, light: 1 },

  // Yellows and golds
  { id: 'sunshine', name: 'Sunshine', ...vivid(30) },
  { id: 'butter', name: 'Butter', ...pastel(30) },
  { id: 'toffee', name: 'Toffee', ...deep(30) },

  // Yellow-greens
  { id: 'lime', name: 'Lime', ...vivid(60) },
  { id: 'pistachio', name: 'Pistachio', ...pastel(60) },
  { id: 'olive', name: 'Olive', ...deep(60) },

  // Greens
  { id: 'meadow', name: 'Meadow', ...vivid(90) },
  { id: 'mint', name: 'Mint', ...pastel(90) },
  { id: 'moss', name: 'Moss', ...deep(90) },

  // Green-teals
  { id: 'emerald', name: 'Emerald', ...vivid(120) },
  { id: 'seafoam', name: 'Seafoam', ...pastel(120) },
  { id: 'pine', name: 'Pine', ...deep(120) },

  // Cyans
  { id: 'turquoise', name: 'Turquoise', ...vivid(150) },
  { id: 'icicle', name: 'Icicle', ...pastel(150) },
  { id: 'lagoon', name: 'Lagoon', ...deep(150) },

  // Blues
  { id: 'sky', name: 'Sky', ...vivid(180) },
  { id: 'cloud', name: 'Cloud', ...pastel(180) },
  { id: 'ocean', name: 'Ocean', ...deep(180) },

  // Deeper blues
  { id: 'bluebell', name: 'Bluebell', ...vivid(210) },
  { id: 'forgetmenot', name: 'Forget-me-not', ...pastel(210) },
  { id: 'denim', name: 'Denim', ...deep(210) },

  // Indigos
  { id: 'indigo', name: 'Indigo', ...vivid(240) },
  { id: 'wisteria', name: 'Wisteria', ...pastel(240) },
  { id: 'midnight', name: 'Midnight', ...deep(240) },

  // Purples
  { id: 'violet', name: 'Violet', ...vivid(270) },
  { id: 'lilac', name: 'Lilac', ...pastel(270) },
  { id: 'grape', name: 'Grape', ...deep(270) },

  // Magentas
  { id: 'orchid', name: 'Orchid', ...vivid(300) },
  { id: 'candyfloss', name: 'Candyfloss', ...pastel(300) },
  { id: 'plum', name: 'Plum', ...deep(300) },

  // Pinks
  { id: 'bubblegum', name: 'Bubblegum', ...vivid(330) },
  { id: 'blossom', name: 'Blossom', ...pastel(330) },
  { id: 'berry', name: 'Berry', ...deep(330) },

  // Reds, back round the wheel
  { id: 'cherry', name: 'Cherry', ...vivid(355) },
  { id: 'coral', name: 'Coral', ...pastel(355) },
  { id: 'ruby', name: 'Ruby', ...deep(355) },

  /*
   * Three that are not a hue rotation at all, so the run of forty does not
   * read as one idea repeated. Saturation alone changes these.
   */
  { id: 'storm', name: 'Storm', hue: 200, sat: 0.18, light: 0.85 },
  { id: 'chalk', name: 'Chalk', hue: 0, sat: 0.12, light: 1.35 },
  { id: 'sherbet', name: 'Sherbet', hue: 45, sat: 0.75, light: 1.4 },
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
