/**
 * The twenty-five sets.
 *
 * Phase 3 item 6. Each set is 24 creatures — one per species — and one
 * recoloured atlas, which is what item 5's autopsy makes possible (HANDOFF
 * §6). Twenty-five sets is 600 creatures; the spotted twelve that would have
 * taken it near a thousand are gone, for the measured reason recorded below.
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
import type { Pattern, SetPalette } from './recolour'

export interface PetSet extends SetPalette {
  /** Stable identity. Saved, so it may never be renamed. */
  id: string
  /** What the album page calls it. This may be changed freely. */
  name: string
}

/**
 * TWELVE BOLD COLOURS, worn two ways.
 *
 * Joe, after the first pass: "there are too many samey colours. Let's go for
 * the bold ones only, say around 10-12. Then we go stripy and dotty with the
 * same colours." The dotty half then proved unbuildable in this texture and was
 * dropped — see the note where it used to be.
 *
 * He was right — forty sets built as vivid, pastel and deep versions of
 * thirteen families gave twenty-six palettes that were mostly *dilutions* of
 * each other, and pale-of-a-colour reads as much the same whichever colour it
 * started from. Twelve confident colours around the wheel are legible at a
 * glance; the variety comes from PATTERN instead, which is a difference you
 * can see across a room.
 */
const BOLD: ReadonlyArray<
  { id: string; name: string; hue: number; sat?: number; light?: number; floor?: number }
> = [
  { id: 'cherry', name: 'Cherry', hue: 2 },
  { id: 'tangerine', name: 'Tangerine', hue: 28 },
  { id: 'sunshine', name: 'Sunshine', hue: 48 },
  { id: 'lime', name: 'Lime', hue: 88 },
  /*
   * Three of the twelve carry their own saturation or lightness, from Joe's
   * second Pet-o-matic pass. One flat SAT and light=1 for all twelve made these
   * three wrong in ways only the eye catches: a mid-green at full brightness
   * reads as lime's neighbour rather than as emerald, and 198° at high
   * saturation is a swimming-pool blue rather than a sky.
   */
  // "emerald needs to be a deeper green" — darker, and nudged off lime's side.
  { id: 'emerald', name: 'Emerald', hue: 152, sat: 0.86, light: 0.74 },
  { id: 'turquoise', name: 'Turquoise', hue: 176 },
  /*
   * "make the sky colour lighter." Lifting the ramp FLOOR, not dropping
   * saturation — the first attempt took sat to 0.46 and produced a dusty teal,
   * because desaturating makes a colour greyer rather than lighter. The
   * saturation stays near bold and the whole coat sits in the top third of the
   * ramp.
   */
  { id: 'sky', name: 'Sky', hue: 200, sat: 0.58, floor: 0.8 },
  /*
   * "the bluebell one deeper blue, like a royal blue without moving too close to
   * indigo." Depth comes from `light`; the hue barely moves, and stays 28° clear
   * of indigo at 250 so the two remain telling apart at pet scale.
   */
  { id: 'bluebell', name: 'Bluebell', hue: 222, sat: 0.92, light: 0.76 },
  { id: 'indigo', name: 'Indigo', hue: 250 },
  { id: 'violet', name: 'Violet', hue: 278 },
  { id: 'orchid', name: 'Orchid', hue: 305 },
  { id: 'bubblegum', name: 'Bubblegum', hue: 330 },
]

/** Bold means bold: one saturation, high, unless a colour asks for its own. */
const SAT = 0.82

const wearing = (pattern: Pattern, label: string): PetSet[] =>
  BOLD.map(c => ({
    id: pattern === 'solid' ? c.id : `${c.id}${pattern}`,
    name: pattern === 'solid' ? c.name : `${label} ${c.name}`,
    hue: c.hue,
    sat: c.sat ?? SAT,
    light: c.light ?? 1,
    ...(c.floor === undefined ? {} : { floor: c.floor }),
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

  /*
   * THE SPOTTED TWELVE ARE GONE, and this is where the creature count went.
   *
   * They were shipped as a third wearing and every one of them came out striped.
   * The cause is measured in recolour.ts: every triangle in the pack sits inside
   * a single atlas column, so a pattern in this texture can only ever be a
   * function of one axis. Joe, having seen that: *"we drop the dots for now, too
   * much work for the value it brings."*
   *
   * The consequence is a SHORTER LADDER: 25 sets across 24 species is 600
   * creatures, not the ~1,000 the brief sketches. Item 7 is where that has to be
   * faced — either a third wearing arrives with a positional signal behind it
   * (object-space in a shader, or per-part meshes), or the album ladder is 600
   * long and the pacing re-bases on that. It is not a gap to be quietly padded
   * with palettes that are dilutions of each other; that was the first pass and
   * Joe rejected it.
   */

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
