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
 * TWELVE BOLD COLOURS, worn three ways.
 *
 * Joe, after the first pass: "there are too many samey colours. Let's go for
 * the bold ones only, say around 10-12. Then we go stripy and dotty with the
 * same colours."
 *
 * He was right — forty sets built as vivid, pastel and deep versions of
 * thirteen families gave twenty-six palettes that were mostly *dilutions* of
 * each other, and pale-of-a-colour reads as much the same whichever colour it
 * started from. Twelve confident colours around the wheel are legible at a
 * glance; the variety comes from PATTERN instead, which is a difference you
 * can see across a room.
 */
const BOLD: ReadonlyArray<{ id: string; name: string; hue: number }> = [
  { id: 'cherry', name: 'Cherry', hue: 2 },
  { id: 'tangerine', name: 'Tangerine', hue: 28 },
  { id: 'sunshine', name: 'Sunshine', hue: 48 },
  { id: 'lime', name: 'Lime', hue: 88 },
  { id: 'emerald', name: 'Emerald', hue: 148 },
  { id: 'turquoise', name: 'Turquoise', hue: 176 },
  { id: 'sky', name: 'Sky', hue: 198 },
  { id: 'bluebell', name: 'Bluebell', hue: 220 },
  { id: 'indigo', name: 'Indigo', hue: 250 },
  { id: 'violet', name: 'Violet', hue: 278 },
  { id: 'orchid', name: 'Orchid', hue: 305 },
  { id: 'bubblegum', name: 'Bubblegum', hue: 330 },
]

/** Bold means bold: one saturation, high, for all of them. */
const SAT = 0.82

const wearing = (pattern: 'solid' | 'stripy' | 'dotty', label: string): PetSet[] =>
  BOLD.map(c => ({
    id: pattern === 'solid' ? c.id : `${c.id}${pattern}`,
    name: pattern === 'solid' ? c.name : `${label} ${c.name}`,
    hue: c.hue,
    sat: SAT,
    light: 1,
    pattern,
  }))

export const SETS: readonly PetSet[] = [
  /*
   * Set one is the natural palette, untouched, and `isNatural` makes that a
   * literal no-op: the base texture is reused rather than recomposited, so the
   * friends Juno already owns are bit-identical to before this engine existed.
   */
  { id: 'natural', name: 'Natural', hue: 0, sat: -1, light: 1, pattern: 'solid' },

  // Twelve bold colours, solid.
  ...wearing('solid', ''),
  // The same twelve, striped.
  ...wearing('stripy', 'Stripy'),
  // ...and spotted.
  ...wearing('dotty', 'Spotty'),

  /*
   * THE LEGENDARY TEN are deliberately absent.
   *
   * Joe: "the last 10 sets we will do with props at a later stage. Those will
   * be the legendary sets that will be around 750 challenges in." They are not
   * a palette at all — they are creatures wearing things — so they belong with
   * the wonders work rather than here, and putting placeholders in now would
   * only mean the album promised something that did not exist.
   */
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
