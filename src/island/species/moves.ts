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
 * crocodile is already built and a crocodile is honestly both. The word was
 * available before anything wore it, so the truth about the crocodile never had
 * to be authored as a lie first and unwound afterwards.
 *
 * >>> IT HAS THREE WEARERS NOW, AND THEY ARE THE ONE PLACE THIS FILE GUESSES.
 * >>> This block used to say that nothing is *assigned* `amphibian` here because
 * >>> that is Joe's call. Woodland arrived on 4 August with an otter, a mink and
 * >>> a coypu in it, and every one of the sixteen was given an entry rather than
 * >>> left absent. Thirteen of them say `land`, which is `DEFAULT_LOCOMOTION` and
 * >>> therefore changes nothing whichever way it is read. **The other three are a
 * >>> judgement and they are Joe's to overrule in the editor**: `land` for an
 * >>> otter would have been a false entry rather than a neutral one, and only
 * >>> `air` has teeth today, so neither reading alters a single frame until
 * >>> PB-069 lands. The two GAME BIRDS were deliberately NOT marked `air` — a
 * >>> pheasant flies in bursts and lives on the ground, and `air` means hovering
 * >>> at `TREE_HEIGHT`.
 * >>>
 * >>> AFRICA'S SIXTEEN WENT IN THE SAME WAY ON 5 AUGUST, and two of them settle
 * >>> a sentence further down this file that says the CROCODILE is Joe's to rule
 * >>> on and is therefore absent. It is not absent any more: it and the hippo
 * >>> say `amphibian`, which is the word this file's own header says was put in
 * >>> the union *because* a crocodile is honestly both. The OSTRICH is `land`
 * >>> and not `air`, the game birds' reading — a flightless bird hovering at
 * >>> `TREE_HEIGHT` is the exact failure that list was written to prevent — and
 * >>> the VULTURE is the only `air` in the collection. All sixteen are his to
 * >>> overrule in the editor and none of them changes a frame until PB-069.
 * >>>
 * >>> JUNGLE'S SIXTEEN WENT IN ON 5 AUGUST and three of them are judgements
 * >>> rather than the neutral default. The HUMMINGBIRD is the only `air`, and it
 * >>> is the one entry here with teeth — `air` hovers a pet at `TREE_HEIGHT`,
 * >>> which is the nearest this game has to a hover and is why the word is worth
 * >>> spending on it. The CAPYBARA and the TAPIR say `amphibian` on the same
 * >>> reading the otter and the hippo already have: both genuinely feed and rest
 * >>> in water, `land` would be a false entry rather than a neutral one, and
 * >>> `amphibian` deliberately does NOT confine them. The TREE FROG joins the
 * >>> frog, the toad and the newt. The other twelve say `land`, which is
 * >>> `DEFAULT_LOCOMOTION` and therefore changes nothing whichever way it is
 * >>> read — including the TARANTULA and the SNAKE, neither of which the union
 * >>> has a better word for.
 * >>>
 * >>> OUTBACK'S SIXTEEN WENT IN ON 5 AUGUST and only three are judgements. The
 * >>> COCKATOO and the KOOKABURRA are `air`, which is the entry with teeth, and
 * >>> both are real flyers. The PLATYPUS is `amphibian` on the otter's and the
 * >>> hippo's reading: it feeds entirely in water and rests entirely out of it,
 * >>> `land` would be a false entry rather than a neutral one, and `amphibian`
 * >>> deliberately does not confine it. The EMU and the LYREBIRD are `land` and
 * >>> NOT `air` — the ostrich's and the game birds' reading, since a flightless
 * >>> bird hovering at `TREE_HEIGHT` is the exact failure this list exists to
 * >>> prevent — and so is the FRILLED LIZARD, which the union has no better word
 * >>> for. The other eleven say `land`, which is `DEFAULT_LOCOMOTION`.
 * >>>
 * >>> ICE'S SIXTEEN WENT IN ON 5 AUGUST and it is the collection with the most
 * >>> non-default entries so far: seven of the sixteen. Three are `water` and
 * >>> are not judgements at all — the ORCA, the BELUGA and the NARWHAL are
 * >>> whales and a whale that walks is a bug. Two are `amphibian` on the otter's
 * >>> and the platypus's reading, and they are the judgements: a SEAL and a
 * >>> WALRUS feed entirely in water and haul out onto ice to rest, so `water`
 * >>> would confine an animal that is famously seen lying about on a floe and
 * >>> `land` would be false; `amphibian` deliberately confines neither. Two are
 * >>> `air` and both are real flyers — the SNOWY OWL and the SNOW PETREL, the
 * >>> latter a bird that spends most of its life on the wing over open sea. The
 * >>> PTARMIGAN is `land` and NOT `air`, which is the game birds' and the
 * >>> ostrich's reading taken a fourth time: it flies in bursts and lives on the
 * >>> ground, and `air` means hovering at `TREE_HEIGHT`. The other nine say
 * >>> `land`, which is `DEFAULT_LOCOMOTION` and changes nothing either way.
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
  'animal-aardvark': 'land',
  'animal-anglerfish': 'water',
  'animal-ant': 'land',
  'animal-anteater': 'land',
  'animal-antelope': 'land',
  'animal-arctic-fox': 'land',
  'animal-arctic-hare': 'land',
  'animal-baboon': 'land',
  'animal-badger': 'land',
  'animal-bandicoot': 'land',
  'animal-bear': 'land',
  'animal-bee': 'air',
  'animal-beetle': 'land',
  'animal-beluga': 'water',
  'animal-bilby': 'land',
  'animal-blackbird': 'air',
  'animal-blue-tit': 'air',
  'animal-budgie': 'air',
  'animal-buffalo': 'land',
  'animal-butterfly': 'air',
  'animal-canary': 'air',
  'animal-capercaillie': 'land',
  'animal-capybara': 'amphibian',
  'animal-centipede': 'land',
  'animal-chameleon': 'land',
  'animal-cheetah': 'land',
  'animal-chinchilla': 'land',
  'animal-chipmunk': 'land',
  'animal-clownfish': 'water',
  'animal-coati': 'land',
  'animal-cockatiel': 'air',
  'animal-cockatoo': 'air',
  'animal-corn-snake': 'land',
  'animal-coypu': 'amphibian',
  'animal-crocodile': 'amphibian',
  'animal-dall-sheep': 'land',
  'animal-degu': 'land',
  'animal-dingo': 'land',
  'animal-dolphin': 'water',
  'animal-dormouse': 'land',
  'animal-dragonfly': 'air',
  'animal-duck': 'amphibian',
  'animal-echidna': 'land',
  'animal-eel': 'water',
  'animal-elk': 'land',
  'animal-emu': 'land',
  'animal-ermine': 'land',
  'animal-ferret': 'land',
  'animal-flamingo': 'amphibian',
  'animal-frilled-lizard': 'land',
  'animal-frog': 'amphibian',
  'animal-gecko': 'land',
  'animal-gerbil': 'land',
  'animal-gibbon': 'land',
  'animal-goldfish': 'water',
  'animal-gorilla': 'land',
  'animal-grasshopper': 'land',
  'animal-guinea-pig': 'land',
  'animal-hamster': 'land',
  'animal-hare': 'land',
  'animal-hedgehog': 'land',
  'animal-heron': 'land',
  'animal-hippo': 'amphibian',
  'animal-howler-monkey': 'land',
  'animal-hummingbird': 'air',
  'animal-husky': 'land',
  'animal-hyena': 'land',
  'animal-iguana': 'land',
  'animal-jaguar': 'land',
  'animal-jellyfish': 'water',
  'animal-kangaroo': 'land',
  'animal-kingfisher': 'air',
  'animal-kookaburra': 'air',
  'animal-ladybird': 'land',
  'animal-lemming': 'land',
  'animal-lemur': 'land',
  'animal-lobster': 'water',
  'animal-lovebird': 'air',
  'animal-lyrebird': 'land',
  'animal-lynx': 'land',
  'animal-magpie': 'air',
  'animal-mantis': 'land',
  'animal-meerkat': 'land',
  'animal-mink': 'amphibian',
  'animal-mole': 'land',
  'animal-mongoose': 'land',
  'animal-moth': 'air',
  'animal-mouse': 'land',
  'animal-musk-ox': 'land',
  'animal-narwhal': 'water',
  'animal-newt': 'amphibian',
  'animal-numbat': 'land',
  'animal-ocelot': 'land',
  'animal-octopus': 'water',
  'animal-orca': 'water',
  'animal-ostrich': 'land',
  'animal-otter': 'amphibian',
  'animal-owlet': 'air',
  'animal-parrot': 'air',
  'animal-peacock': 'land',
  'animal-pelican': 'amphibian',
  'animal-pheasant': 'land',
  'animal-pine-marten': 'land',
  'animal-platypus': 'amphibian',
  'animal-pony': 'land',
  'animal-porcupine': 'land',
  'animal-ptarmigan': 'land',
  'animal-pufferfish': 'water',
  'animal-puffin': 'air',
  'animal-quokka': 'land',
  'animal-ray': 'water',
  'animal-reindeer': 'land',
  'animal-robin': 'air',
  'animal-salamander': 'land',
  'animal-sea-urchin': 'water',
  'animal-seagull': 'air',
  'animal-seahorse': 'water',
  'animal-seal': 'amphibian',
  'animal-shark': 'water',
  'animal-shrew': 'land',
  'animal-skunk': 'land',
  'animal-sloth': 'land',
  'animal-slow-worm': 'land',
  'animal-slug': 'land',
  'animal-snail': 'land',
  'animal-snake': 'land',
  'animal-snow-petrel': 'air',
  'animal-snowy-owl': 'air',
  'animal-spider': 'land',
  'animal-squid': 'water',
  'animal-squirrel': 'land',
  'animal-starfish': 'water',
  'animal-stick-insect': 'land',
  'animal-stoat': 'land',
  'animal-stork': 'land',
  'animal-swan': 'amphibian',
  'animal-tapir': 'amphibian',
  'animal-tarantula': 'land',
  'animal-tassie-devil': 'land',
  'animal-terrapin': 'land',
  'animal-thorny-devil': 'land',
  'animal-toad': 'amphibian',
  'animal-tortoise': 'land',
  'animal-toucan': 'air',
  'animal-tree-frog': 'amphibian',
  'animal-turtle': 'water',
  'animal-vulture': 'air',
  'animal-walrus': 'amphibian',
  'animal-warthog': 'land',
  'animal-wasp': 'air',
  'animal-whale': 'water',
  'animal-wildcat': 'land',
  'animal-wildebeest': 'land',
  'animal-wolverine': 'land',
  'animal-wombat': 'land',
  'animal-woodlouse': 'land',
  'animal-woodpecker': 'air',
  'animal-worm': 'land',
  'animal-wren': 'air',
  'animal-zebra': 'land',
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
