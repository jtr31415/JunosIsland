/**
 * What a species IS, as data.
 *
 * PB-036, phase 1. The roster (`docs/pet-island-species-roster.md`) asks for
 * ~296 new creatures across 20 collections, and §1 gives the whole architecture
 * in three words: **kits before species**. Build the kit once; a species is then
 * proportions, a palette and two or three detail parts. This file is the shape
 * that makes that true — nothing here builds geometry, and nothing here knows
 * three.js.
 *
 * THE ONE THING THAT MAY NEVER CHANGE is `Species.id`. It is written into every
 * save as `Pet.species` (flow.ts:106) and it is the key the collection deck
 * deals (collection.ts:87). Renaming one loses a child's friend, which brief §19
 * forbids. Display names are free; ids are forever.
 *
 * The live 24 are frozen (roster §1). They carry `kit: 'kenney'`, which means
 * "there is an authored GLB for this, do not build it" — `pets.ts` keeps loading
 * them exactly as it does today. Every NEW species carries a real kit and a
 * `build`, and is constructed from primitives in the Fred style.
 */

/**
 * Which kit builds a species.
 *
 * Six kits from roster §1, plus `kenney` for the frozen 24. The counts in the
 * roster are the reason the list is this shape and not longer: quadruped covers
 * ~150 of the 296, so it earns its generality, and `bespoke` is the honest
 * admission that an octopus and a jellyfish are not a kit — they are one-offs
 * that happen to share a look.
 */
export type KitId =
  | 'kenney'
  | 'quadruped'
  | 'songbird'
  | 'raptor'
  | 'swim'
  | 'minibeast'
  | 'bespoke'

/** Every kit except the frozen pack. These are the ones that BUILD. */
export const BUILT_KITS: readonly KitId[] = [
  'quadruped', 'songbird', 'raptor', 'swim', 'minibeast', 'bespoke',
]

/**
 * Conservation status, recorded as data with the date it was checked.
 *
 * Roster §5: "Statuses are recorded as data with a `checkedDate`, not baked into
 * prose, so a future reassessment is an edit, not a rewrite." The stored value
 * is the IUCN category as a slug. WHAT A CHILD IS SHOWN is not settled — roster
 * §6 asks whether the badge prints the IUCN name or a softer phrase, and that is
 * Joe's question, so no wording lives in this file at all.
 *
 * `fictional` is for the Legendary collection, which has no status and must not
 * be given one; `prehistoric` is for animals that are gone and were never
 * assessed, which is not the same statement as `extinct`.
 */
export type ThreatStatus =
  | 'least-concern'
  | 'near-threatened'
  | 'vulnerable'
  | 'endangered'
  | 'critically-endangered'
  | 'prehistoric'
  | 'fictional'
  | 'unassessed'

export interface Threat {
  status: ThreatStatus
  /** ISO date the status was last checked against the Red List. */
  checkedDate: string
}

/**
 * A colour, as the kits speak it.
 *
 * Plain 24-bit RGB, the way `fred.ts:31-38` writes its palette, because a built
 * creature is per-part materials rather than a recoloured atlas. See
 * `kit.ts` for why that fork exists and what it costs.
 */
export type Rgb = number

/**
 * The palette a kit paints with.
 *
 * Three named coats and an open `accent`, which is as far as the roster's "two
 * or three detail parts" reaches. A kit reads whichever of these it has parts
 * for and ignores the rest, so adding a field here never breaks a kit.
 */
export interface KitPalette {
  /** The main coat. Every kit uses this. */
  coat: Rgb
  /** Underside, chest, muzzle. Falls back to a lightened `coat`. */
  belly?: Rgb
  /** Ears, paws, beak, fins — whatever the kit calls its second colour. */
  detail?: Rgb
  /** Stripes, spots, patches, a mane. Falls back to a darkened `coat`. */
  accent?: Rgb
}

/**
 * The quadruped kit's data. ~150 species ride on this one interface.
 *
 * Every number is a MULTIPLIER off the kit's reference silhouette, not a
 * measurement, so the kit can be retuned in one place without touching 150
 * species records. 1 means "the reference"; the kit clamps anything absurd.
 *
 * `height` is the exception and is absolute, in Kenney units — the live pack
 * runs 1.55 (parrot) to 2.13 (bunny) before the field's uniform 0.16 scale
 * (pets.ts:643, 656-659). A species outside roughly 1.2–2.6 will not sit beside
 * `animal-fox` without looking like a guest, which roster §1 forbids.
 */
export interface QuadrupedBuild {
  kit: 'quadruped'
  height: number
  /** Body length against height. A stoat is long and low; a hog is short and deep. */
  body: number
  /** Head size against body. The single strongest read of "what animal is this". */
  head: number
  /** Leg length. Below ~0.5 the creature reads as a minibeast, not a quadruped. */
  legs: number
  /** Which ears it wears. */
  ears: 'round' | 'pointed' | 'long' | 'tufted' | 'none'
  /** Which tail it wears. */
  tail: 'bushy' | 'thin' | 'stub' | 'tuft' | 'flat' | 'none'
  /** Up to three extra parts, kit-defined. Roster §1's "two or three detail parts". */
  extras?: readonly QuadrupedExtra[]
  palette: KitPalette
}

/**
 * The detail parts a quadruped may wear.
 *
 * A closed list on purpose. Roster §4 flags eight groups of species that "will
 * read as duplicates unless size, palette and marking are deliberately
 * separated" — a wolf beside a dire wolf beside a dingo. An open string field
 * would let phase 2 invent a part per species and quietly rebuild the sculpting
 * that roster §1 rules out; a closed list forces the differentiation into
 * proportion and palette, where it belongs, and gives the Pet-o-matic veto pass
 * a checklist it can actually run.
 */
export type QuadrupedExtra =
  | 'horns' | 'antlers' | 'tusks' | 'snout' | 'mane' | 'hump'
  | 'spines' | 'shell' | 'trunk' | 'pouch' | 'crest' | 'whiskers'

/**
 * The other five kits are DECLARED, not yet built.
 *
 * PB-036 phase 1 built the quadruped kit, which covers ~150 of the 296. The
 * remaining five are named here so a species record can honestly say which kit
 * it wants before that kit exists, and so `speciesKit()` can refuse to build it
 * rather than guessing. Each becomes a real interface the way `QuadrupedBuild`
 * is one, when its kit is built.
 *
 * Do NOT widen this into a permissive record to unblock a collection. HANDOFF
 * §6 (line 565): widening a value union is invisible to the compiler, and the
 * failure surfaces as a creature that renders as nothing.
 */
export interface PendingBuild {
  kit: Exclude<KitId, 'kenney' | 'quadruped'>
  height: number
  palette: KitPalette
}

export type BuildSpec = QuadrupedBuild | PendingBuild

/**
 * One species.
 *
 * `build` is absent exactly when `kit` is `'kenney'`, and present otherwise —
 * enforced by `tests/island/species-roster.test.ts` rather than by the type,
 * because the roster is data and the check has to run against the data.
 */
export interface Species {
  /**
   * Stable identity, `animal-<slug>`. SAVED. May never be renamed.
   *
   * The prefix is not decoration: `facedecals.ts:92` and `atlas.ts:106` strip
   * exactly `animal-` to reach their JSON tables, and `pets.ts:560` spells it
   * into a GLB path. A species whose id does not start `animal-` will load a
   * file that is not there.
   */
  id: string
  /**
   * The real species name, printed in the album. Roster §3's "playground
   * currency" — "Have you got the pangolin?" has to work across every island.
   * UK English, and free to change.
   */
  name: string
  kit: KitId
  /** The collection it belongs to, by `Collection.id`. */
  collection: string
  build?: BuildSpec
  /** Absent means "not recorded yet", which is not the same as least-concern. */
  threat?: Threat
}

/**
 * One collection — a shipping unit, not a category.
 *
 * Roster's header is emphatic that the 20-row table is "not a build order":
 * collections ship ONE AT A TIME on the 85% unlock cadence. So a collection
 * carries its own ship order and its own name band, and the roster's row order
 * is not authority for either.
 */
export interface Collection {
  /** Stable identity. Saved once collections gate unlocks. May never be renamed. */
  id: string
  /** The album page's title. Free to change. */
  name: string
  /** Species ids, in the roster's own order. */
  members: readonly string[]
  /**
   * Where this collection sits in the ship queue, 0 = live already.
   *
   * PROVISIONAL. Roster §6 lists ship order as one of Joe's own open questions
   * and proposes Garden → Home Pets → Birds → Ocean → Farm → Critters. That
   * proposal is recorded here as the starting order and is HIS to settle; see
   * the workbench. Nothing is unlocked off this number yet.
   */
  ship: number
  /**
   * Which name band this collection's given names are drawn from.
   *
   * Roster §3: "Fixed names cannot adapt to a child's phonics level, so name
   * difficulty rides collection order: early collections draw short CVC-ish
   * names; later collections may draw longer ones." The band is a property of
   * the collection because that is the only place the difficulty can live once
   * a name is frozen.
   */
  band: NameBand
}

/**
 * How long a given name may be, per collection.
 *
 * The existing generator (`src/core/names.ts:81`) makes two-syllable names of 5
 * to 9 letters and takes no length argument. Rather than change it — it sits in
 * `src/core/`, which `parity` guards, and `golden.json` pins generator
 * behaviour — the island layer filters its seeded output into these bands.
 * Every band is a subrange of 5–9, so every band is reachable and no band can
 * starve.
 */
export type NameBand = 'short' | 'medium' | 'long'

export const NAME_BANDS: Readonly<Record<NameBand, { min: number; max: number }>> = {
  /** Bimo, Tapo, Neg. The first collections a child ever reads. */
  short: { min: 5, max: 6 },
  medium: { min: 6, max: 7 },
  /** Only for collections a child reaches after months of play. */
  long: { min: 7, max: 9 },
}
