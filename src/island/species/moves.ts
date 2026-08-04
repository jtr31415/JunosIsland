/**
 * How each animal gets about: Joe's judgement, one word per species.
 *
 * ## Why this is a field he sets and not a rule anyone derives
 *
 * This table replaces `FLYERS` in `pets.ts`, which was a hardcoded set of two
 * ids. Read the comment that stood above it, because the reasoning survives the
 * move and is the whole reason this file exists:
 *
 * > "Deliberately a list rather than a rule derived from the mesh. A rule that
 * > said 'has wings' would put a penguin in the canopy, and every rule anyone
 * > could write to exclude it is this list wearing a disguise."
 *
 * That argument is correct, and it has a consequence the old constant did not
 * draw: if no rule can decide it, then it is a JUDGEMENT, and the judge is Joe
 * rather than whoever last edited a constant. Joe, 2 August 2026: *"editor also
 * needs to let me decide if it flys or bounces on land."* So the value is
 * authored in the workbench editor, per species, and lands here.
 *
 * A bee and a parrot fly. A chick, a penguin and a fish all carry `wing-left`
 * and `wing-right` nodes and none of them flies. Night Time's nightjar is a bird
 * that cannot fly and the kiwi correctly does not — and until this table existed
 * there was no way for the game to tell those two apart from a parrot.
 *
 * ## Why one word and not three booleans
 *
 * Because Joe sets it, and he sets it one animal at a time. A set of flags
 * (`{ air, land, water }`) can express `{ air: true, water: true, land: false }`
 * for a pangolin — eight combinations of which about half are nonsense, and an
 * editor that can express a mistake is an editor that will eventually record
 * one. One choice from a short list is the control that matches the decision.
 *
 * `amphibian` is in the union from the start rather than added later, because a
 * crocodile is already built and a crocodile is honestly both. Nothing is
 * *assigned* `amphibian` here — that is Joe's call to make in the editor, not
 * mine to make on his behalf — but the word is available the moment he wants it,
 * so the truth about the crocodile never has to be authored as a lie first and
 * unwound afterwards.
 *
 * ## Why a lookup table and not a field on the collection record
 *
 * Exactly the reasoning `define.ts` gives for `assembly`: a value looked up by
 * id means adding or changing one touches no collection file. That matters twice
 * over here.
 *
 * First, the collection files are comment-dense — every entry in
 * `collections/garden.ts` is wrapped in a paragraph explaining the animal — and
 * a codegen splice into them is the kind of edit that quietly eats a paragraph
 * nobody can tell was there.
 *
 * Second, and decisively: `push.mjs`'s `withRecord` refuses to touch a
 * `defineSpecies(...)` record that already exists, by design. Thirty animals are
 * already pushed. Had this value lived on those records, Joe could have set
 * "flies" on the nightjar, pressed push, and watched nothing happen — the field
 * would have been unreachable for precisely the animals it was built for. A flat
 * table the workbench owns end to end can be rewritten entry by entry, so
 * changing his mind about an animal costs one line.
 *
 * ## Why this module imports nothing
 *
 * Same reason `parts/assembled/register.ts` imports nothing: it is reached from
 * both ends. `define.ts` folds it onto every species record, and `pets.ts` reads
 * it every frame to decide who hovers. If this file pulled the registry behind
 * it, `pets.ts` — which knows nothing about species records today — would drag
 * the whole collection graph and `texture.ts`'s three.js into the island's
 * hottest loop. Data all the way down, and no cycle to reason about.
 */

/**
 * The four ways an animal can get about.
 *
 * Only `air` changes behaviour today: a flyer hovers at `TREE_HEIGHT` instead of
 * bobbing along the grass. `water` and `amphibian` are authored but not yet
 * enforced — PB-069 ("confine sea creatures to water tiles only and stop land
 * animals from going into the water") is explicitly LATER, and it reads THIS
 * field rather than adding a second one beside it. So an animal Joe marks now
 * starts behaving correctly the day that card is built, with no migration and no
 * re-authoring.
 */
export type Locomotion = 'land' | 'air' | 'water' | 'amphibian'

/** Every value `Locomotion` allows, in the order the editor offers them. */
export const LOCOMOTIONS: readonly Locomotion[] = ['land', 'air', 'water', 'amphibian']

/**
 * What each choice says, in Joe's terms rather than the type's.
 *
 * Exported so the editor's control and any test naming these options read from
 * one place; a label that drifts from the value it sets is how an animal ends up
 * marked something nobody meant.
 */
export const LOCOMOTION_LABELS: Readonly<Record<Locomotion, string>> = {
  land: 'Walks on land',
  air: 'Flies at tree height',
  water: 'Lives in water',
  amphibian: 'Both land and water',
}

/** Narrowing guard, so a value off disk or out of a form is checked once. */
export function isLocomotion(value: unknown): value is Locomotion {
  return typeof value === 'string' && (LOCOMOTIONS as readonly string[]).includes(value)
}

/**
 * What an unmarked species does.
 *
 * `land` — which is what every species that is not a bee or a parrot did before
 * this file existed, so an animal nobody has ruled on behaves today exactly as it
 * behaved yesterday. Absence means "not decided yet", and the safe reading of
 * "not decided yet" is the ground: a wrong guess there is an animal walking, and
 * a wrong guess the other way is a tortoise in a tree.
 */
export const DEFAULT_LOCOMOTION: Locomotion = 'land'

/**
 * The table. Written by the workbench when Joe pushes a species.
 *
 * The two entries below are the whole of the old `FLYERS` set, migrated
 * unchanged and deliberately not "tidied". `tests/island/pets.test.ts` pins them:
 * a bee and a parrot flew before this file existed and they fly after it, and a
 * migration that silently grounded the bee is a regression a six-year-old would
 * be the first to see.
 *
 * Everything else is absent on purpose. Absent is `land`, and the goldfish, the
 * crocodile, the nightjar and the kiwi are all Joe's to rule on in the editor —
 * seeding guesses here would be inventing his judgement, which is the one thing
 * this file exists to stop.
 */
/* >>> WORKBENCH-OWNED TABLE — entries below are written by the workbench's own
 * `push.mjs` when Joe pushes a species. Keep one `'id': 'value',` per line,
 * sorted, and keep both markers: the splice finds the table by them and refuses
 * to write if either is missing.
 *
 * The path to that script is deliberately not spelt out here. `npm run channel`
 * greps every file under `src/` for the workbench's directory name and fails on
 * a match — in a COMMENT as readily as in an import, since the check is textual.
 * That is the correct severity: `src/` ships and the workbench does not, so the
 * rule is that shipped code cannot so much as name it. This comment tripped that
 * gate once already. */
export const MOVES: Readonly<Record<string, Locomotion>> = {
  'animal-badger': 'land',
  'animal-bee': 'air',
  'animal-dormouse': 'land',
  'animal-frog': 'amphibian',
  'animal-guinea-pig': 'land',
  'animal-hamster': 'land',
  'animal-hedgehog': 'land',
  'animal-mole': 'land',
  'animal-mouse': 'land',
  'animal-newt': 'amphibian',
  'animal-parrot': 'air',
  'animal-salamander': 'land',
  'animal-shrew': 'land',
  'animal-slow-worm': 'land',
  'animal-squirrel': 'land',
  'animal-toad': 'amphibian',
  'animal-tortoise': 'land',
}
/* <<< WORKBENCH-OWNED TABLE */

/** How a species gets about, with the default applied. Never throws. */
export function movesFor(species: string): Locomotion {
  return MOVES[species] ?? DEFAULT_LOCOMOTION
}

/**
 * Who hovers at tree height instead of bobbing along the grass.
 *
 * The one predicate with teeth today. Callers ask this rather than comparing
 * `movesFor(id) === 'air'` themselves, so that when PB-069 arrives and the union
 * grows, there is one place that decides what "flies" means and not one per
 * call site.
 */
export function flies(species: string): boolean {
  return movesFor(species) === 'air'
}

/**
 * Whether water is somewhere this animal may be. PB-069's half of the ruling
 * that stops a land animal walking into the sea.
 *
 * Not yet consulted by anything — stated here so the card that needs it finds a
 * predicate rather than inventing a second field. A flyer may cross water; it is
 * never *in* it, and at `TREE_HEIGHT` the distinction does not arise.
 */
export function mayEnterWater(species: string): boolean {
  const how = movesFor(species)
  return how === 'water' || how === 'amphibian' || how === 'air'
}

/**
 * Whether water is the only place this animal may be. PB-069's other half, the
 * one that confines a sea creature to water tiles.
 *
 * An amphibian is deliberately NOT confined: that is the entire difference
 * between a crocodile and a goldfish, and it is the reason the union carries
 * four words rather than three.
 */
export function mustStayInWater(species: string): boolean {
  return movesFor(species) === 'water'
}
