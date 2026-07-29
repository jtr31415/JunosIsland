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
 *
 * The one import below is TYPE-ONLY and erases under `verbatimModuleSyntax`, so
 * the claim that nothing here knows three.js still holds at runtime.
 */
import type { AssemblyBuild } from './parts/assembly'

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
 * The songbird kit's data. Every bird that is not a raptor rides on this.
 *
 * Same discipline as `QuadrupedBuild`: every number is a MULTIPLIER off the
 * kit's reference silhouette — a robin — except `height`, which is absolute in
 * Kenney units and holds to the same 1.2–2.6 family range for the same reason.
 *
 * `neck` is a PROPORTION and not an extra part, which is the one place this
 * interface deliberately departs from the quadruped's shape. This single kit
 * has to stretch from a wren to a flamingo, and neck length is the largest axis
 * of that distance by a long way — a `'long-neck'` entry in the extras list
 * would be a boolean where the data needs a dial, and a swan, a stork and a
 * heron would all get the same neck.
 */
export interface SongbirdBuild {
  kit: 'songbird'
  /** Absolute standing height in Kenney units, as quadruped. */
  height: number
  /** Body length against height. A wren is a round ball; a heron is a long boat. */
  body: number
  /** Head size against body. The strongest read of "what bird is this". */
  head: number
  /** Leg length. A robin sits low; a flamingo is stilted. */
  legs: number
  /** Neck length against body. 0 for a wren or a robin, 1+ for a swan or heron. */
  neck: number
  /**
   * Which beak it wears.
   *
   * `'hooked'` is deliberately absent. A hooked beak is the single strongest
   * read of a bird of prey, and the raptor kit — declared in `KitId`, not built
   * yet — is the one that owns it. Adding it here would let an owl be built as
   * a songbird with a hook on, which is exactly the "quietly rebuild the
   * sculpting" failure the closed extras list below exists to stop.
   */
  beak: 'fine' | 'short' | 'stout' | 'long' | 'flat' | 'dagger'
  /** Which tail it wears. */
  tail: 'fan' | 'short' | 'long' | 'forked' | 'pointed' | 'none'
  /** How the wings sit. Folded is the default resting bird. */
  wings: 'folded' | 'broad' | 'pointed' | 'tiny'
  /** Up to three extra parts, kit-defined. Roster §1's "two or three detail parts". */
  extras?: readonly SongbirdExtra[]
  palette: KitPalette
}

/**
 * The detail parts a songbird may wear.
 *
 * Closed, for the reason `QuadrupedExtra` above is closed, and the pressure to
 * open it is worse here. This one kit carries roster §4's hardest confusable
 * groups: duck against goose; swan against stork against heron against pelican
 * against flamingo; and the corvids, where a crow, a rook, a raven and a
 * jackdaw are four names for one silhouette. The tempting fix for each of those
 * is a new part — a `'goose-bill'`, a `'raven-throat'` — and thirty species
 * later the kit is a sculpting workshop with a data file bolted to it, which
 * roster §1 rules out in its first three words.
 *
 * So the list stays shut and those groups are separated where the roster says
 * they must be: by PROPORTION and PALETTE. A swan and a heron differ by `neck`,
 * `body` and `legs`; a rook and a jackdaw differ by `head`, `height` and the
 * grey of a collar. That constraint is also what gives the Pet-o-matic veto
 * pass a checklist it can actually run.
 */
export type SongbirdExtra =
  | 'crest' | 'plume' | 'eye-stripe' | 'cheek-patch' | 'throat-bib' | 'collar'
  | 'wing-bar' | 'speckles' | 'ruff' | 'tail-streamer' | 'webbed-feet' | 'wattle'

/**
 * The raptor kit's data. Every bird of prey, and the owls with them.
 *
 * Same discipline as the two kits above: every number is a MULTIPLIER off the
 * kit's reference silhouette — a BUZZARD, which is the honest middle of this
 * collection in every axis — except `height`, which is absolute in Kenney units
 * and holds to the same 1.2–2.6 family range for the same reason.
 *
 * THIS KIT IS NOT A SONGBIRD WITH A HOOK BOLTED ON, and the two places it
 * departs are the two that carry the whole collection:
 *
 *   - There is no `neck`. The songbird grew one because a swan, a stork and a
 *     heron are separated by nothing else; not one bird of prey in the roster
 *     has a neck worth a mesh, and a field that every species would set to 0 is
 *     a field that will eventually be set to 1 by accident.
 *   - `talons` is a NUMBER where a lesser design would have put a flag in the
 *     extras list. Every raptor has talons — that is what the word means — so a
 *     boolean would be true sixteen times out of sixteen and would give an
 *     osprey and a kestrel the same feet. What actually differs is how much
 *     foot the bird is: an osprey is a pair of grappling hooks with a bird
 *     attached, a kestrel is a bird with claws. That is a dial.
 */
export interface RaptorBuild {
  kit: 'raptor'
  /** Absolute standing height in Kenney units, as quadruped and songbird. */
  height: number
  /** Body length against height. A merlin is a compact fist; an eagle is a barrel. */
  body: number
  /** Head size against body. A sparrowhawk's head is small; an owl's is most of it. */
  head: number
  /** Leg length. A goshawk is long in the leg; an owl sits down over its feet. */
  legs: number
  /**
   * Which hooked beak it wears. THE HOOK LIVES HERE AND ONLY HERE.
   *
   * `SongbirdBuild.beak` (line 172 above) deliberately has no `'hooked'`, so an
   * owl cannot be smuggled in as a songbird. This is the other end of that
   * decision, and it is three values rather than one because the hook is this
   * kit's strongest read and a single shape would make an eagle, a falcon and a
   * barn owl the same bird from the front:
   *
   *   - `'deep-hook'` — an eagle's, a buzzard's, an osprey's, a kite's. Heavy
   *     and deep, the whole front of the face.
   *   - `'notched-hook'` — a falcon's: finer, with the tomial notch, the tooth
   *     on the cutting edge that a peregrine kills with and no hawk has.
   *   - `'small-hook'` — an owl's, a sparrowhawk's. Short and neat, mostly
   *     buried in feather, which is why an owl reads as a face and not a beak.
   *
   * And no more. A fourth shape would be a species wearing a costume.
   */
  beak: 'deep-hook' | 'notched-hook' | 'small-hook'
  /**
   * The wing plan. The strongest read after the beak, and a PROPORTION rather
   * than a part: broad soaring wings (eagle, buzzard), long pointed ones
   * (peregrine, hobby) and short rounded ones (sparrowhawk, goshawk) are three
   * shapes of the same two meshes, not three new meshes.
   */
  wings: 'broad' | 'pointed' | 'rounded'
  /**
   * Which tail it wears. Five, because a raptor's tail does real work: the red
   * kite's fork IS the red kite, the harrier's is long, the goshawk's is square
   * and the golden eagle's is a wedge.
   */
  tail: 'fan' | 'square' | 'long' | 'wedge' | 'forked'
  /**
   * How much foot the bird is. 1 is the buzzard; ~0.6 a kestrel, ~1.7 an osprey.
   *
   * A size dial and not a boolean — see the interface header. It is also the
   * cheapest axis in the kit: talons are small and low, so a big-footed bird
   * costs almost nothing in keep-out radius.
   */
  talons: number
  /** Up to three extra parts, kit-defined. Roster §1's "two or three detail parts". */
  extras?: readonly RaptorExtra[]
  palette: KitPalette
}

/**
 * The detail parts a raptor may wear.
 *
 * Closed, for the reason the two lists above are closed, and this collection is
 * where that discipline is tested hardest after the corvids. Sixteen birds,
 * three confusable groups inside them, and every one of the three has an
 * obvious wrong answer that is a new part:
 *
 *   - sparrowhawk against goshawk. Same wings, same tail, same barred front.
 *     They are separated by SIZE and head-to-body proportion, because that is
 *     genuinely what separates them in a hedge.
 *   - kestrel against merlin against hobby. All three are small falcons. The
 *     kestrel is spotted above with a long barred tail, the merlin is plain and
 *     square-tailed and compact, the hobby is all wing with rufous trousers.
 *     Every one of those is a proportion or a marking already in this list.
 *   - tawny owl against eagle owl. Ear tufts and half again the height.
 *
 * Thirty species later, a list that grew a part per bird is a sculpting
 * workshop with a data file bolted to it, which roster §1 rules out in its
 * first three words. So the list stays shut and the birds are separated by
 * PROPORTION and PALETTE.
 *
 * The owls are the one genuine exception and they are IN the list rather than
 * an argument against it: a facial disc and ear tufts are not a re-labelled
 * hawk face, they are a different face — round, flat, forward, with the beak
 * lost in it. Everything else here is a MARKING that a group of birds share,
 * not a shape one bird needs.
 *
 *   - `facial-disc` — the owl's dish, and the harrier's, which has one for the
 *     same reason: it hunts by ear.
 *   - `ear-tufts`  — eagle owl, long-eared owl. The one thing that separates an
 *     eagle owl from a tawny at silhouette.
 *   - `brow`       — the supraorbital scowl. Every diurnal raptor has it and no
 *     owl does, so it is what says "hawk, not owl" once the disc is off.
 *   - `crest`      — harpy eagle and the crested hawk-eagles. The same three
 *     blades the other two kits wear, because a shared shape is a family look.
 *   - `hood`       — a contrasting crown and nape: the bald eagle's white head,
 *     the osprey's crown, the male hen harrier's grey. The skull is built in
 *     `coat`, so without this a two-tone head is not expressible at all.
 *   - `moustache`  — the falcon's malar stripe. Peregrine, hobby, merlin,
 *     kestrel — the group above that needs the most help.
 *   - `barred-breast` — the barred underparts of the accipiters, the buzzard
 *     and the kestrel, against a falcon's plainer front.
 *   - `tail-bands` — the barred tail. Sparrowhawk, kestrel, harrier, goshawk.
 *   - `speckles`   — a spotted mantle: kestrel, eagle owl, most juveniles. It
 *     is what a kestrel has and a merlin has not.
 *   - `trousers`   — feathered tarsi. Golden eagle against bald eagle, eagle
 *     owl against tawny, and the hobby's rufous leggings.
 */
export type RaptorExtra =
  | 'facial-disc' | 'ear-tufts' | 'brow' | 'crest' | 'hood'
  | 'moustache' | 'barred-breast' | 'tail-bands' | 'speckles' | 'trousers'

/**
 * The other three kits are DECLARED, not yet built.
 *
 * PB-036 phase 1 built the quadruped kit, which covers ~150 of the 296, phase 2
 * built the songbird and phase 4 built the raptor. The remaining three are
 * named here so a species record can honestly say which kit it wants before
 * that kit exists, and so `speciesKit()` can refuse to build it rather than
 * guessing. Each becomes a real interface the way `QuadrupedBuild` is one, when
 * its kit is built.
 *
 * Do NOT widen this into a permissive record to unblock a collection. HANDOFF
 * §6 (line 565): widening a value union is invisible to the compiler, and the
 * failure surfaces as a creature that renders as nothing.
 */
export interface PendingBuild {
  kit: Exclude<KitId, 'kenney' | 'quadruped' | 'songbird' | 'raptor'>
  height: number
  palette: KitPalette
}

export type BuildSpec = QuadrupedBuild | SongbirdBuild | RaptorBuild | PendingBuild

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
  /**
   * The assembly-kit build, when one exists. ADDITIVE, never a replacement.
   *
   * `docs/building-animals-from-parts.md` §6: "Assembled species carry an
   * `assembly` build spec, kept alongside the old `build` field rather than
   * replacing it, so the scrapped 72 stay visible for comparison until Joe rules
   * on JT-034 and nothing he can see today disappears." So `build` above is
   * untouched on a species that gains one of these, and both render.
   *
   * The import is type-only and erases, so this file still knows no three.js —
   * `AssemblyBuild` is data all the way down and `parts/assembly.ts` is where
   * the renderer lives.
   */
  assembly?: AssemblyBuild
  /** Absent means "not recorded yet", which is not the same as least-concern. */
  threat?: Threat
}

/**
 * One collection — a shipping unit, not a category.
 *
 * Roster's header is emphatic that the 20-row table is "not a build order":
 * collections ship ONE AT A TIME on the unlock cadence. So a collection
 *
 * (That cadence was quoted as "the existing 85%" in the brief and in phase 1's
 * comments. PB-036 phase 2 went looking for it and it DID NOT EXIST — the only
 * 0.85 in the island layer is `PROMOTE_EWMA` in `harness.ts`, an unrelated
 * maths dial. Joe then set it himself in JT-027: **80%**, with a cap of four
 * active collections. It is implemented in `species/unlock.ts`. So 80 is not a
 * correction of 85; it is the first real number there has ever been, and
 * nobody should "restore" 85.)
 *
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
