/**
 * Joe's ratified roster, as data.
 *
 * PB-036, phase 1. `docs/pet-island-species-roster.md` §2 is a table of twenty
 * collections and 296 creatures, ratified in conversation on 28 Jul. This file
 * is that table TRANSCRIBED and nothing else. Every species name here comes off
 * that page; not one was invented, reworded or quietly improved. If a creature
 * looks wrong, the brief is where it is wrong, and the brief is where it gets
 * fixed — then here.
 *
 * WHY THE ROSTER IS DATA AND NOT PROSE. Species ids are saved (`Pet.species`,
 * flow.ts:106) and dealt (collection.ts:87), so the set of legal ids has to be
 * something the code can enumerate, count and test. `tests/island/
 * species-roster.test.ts` is the other half of this file: it holds the
 * transcription honest against the brief's own `n` column, proves the brief's
 * "no species appears twice anywhere" claim rather than trusting it, and — the
 * one that matters most — pins every base-24 display name to `SPECIES_NAME` in
 * `script.ts`, so this new table can never quietly rename an animal a child
 * already lives with (brief §19).
 *
 * THE ID RULE, applied mechanically to all 296 and stated once so nobody has to
 * reverse-engineer it from the data:
 *
 *     id = 'animal-' + name, lowercased,
 *          accents folded to ASCII       (Galápagos -> galapagos)
 *          apostrophes deleted           (Spix's    -> spixs)
 *          any run of non-alphanumerics collapsed to a single '-'
 *
 * Accents are folded and apostrophes deleted because an id is not a label: it
 * is spelled into a GLB path (`pets.ts:560`) and stripped to index JSON tables
 * (`facedecals.ts:92`, `atlas.ts:106`). It has to be filesystem- and URL-safe on
 * every machine that ever builds this. The PRINTED name keeps its accent —
 * "Galápagos Penguin" is how the album spells it, because §3 makes the species
 * name playground currency and the currency should be spelled properly.
 *
 * The base 24 are the exception to the id rule and always will be: their ids
 * come from the Kenney pack's GLB basenames, which is why `animal-hog` prints
 * as "Wild Boar" and `animal-polar` as "Polar Bear". Those names are copied
 * byte-for-byte from `script.ts` and the test fails if they ever drift.
 */
import type { Collection, NameBand } from './types'

/**
 * Every collection, base first, then the brief's twenty in the brief's own row
 * order.
 *
 * Row order is NOT ship order and NOT difficulty order — the brief's header
 * says so in as many words ("Not a build order"). Both of those live in the
 * `ship` and `band` fields below, and both are read off §6 rather than off the
 * table's numbering.
 *
 * >>> PROVISIONAL: the `ship` numbers.
 *
 * Ship order is an OPEN QUESTION in roster §6 — it is listed there among Joe's
 * own unanswered questions, not among the ratified decisions. What is encoded
 * here is precisely §6's proposal and no more: Garden -> Home Pets -> Birds ->
 * Ocean -> Farm -> Critters first (ships 1-6), then the remaining biome
 * collections in table order (7-14), then Prehistoric (15), then "Legendary and
 * the conservation tiers late" — the four Red List tiers at 16-19 and Legendary
 * last at 20. Base is 0 because base is already live.
 *
 * This is Joe's to settle and mine only to have written down. NOTHING UNLOCKS
 * OFF THESE NUMBERS YET: no cadence, no gate and no save reads `ship`, so
 * reordering it today costs a diff and nothing else. That stops being true the
 * moment the unlock cadence starts consuming it, which is the point at which
 * this comment needs deleting and the numbers need his signature.
 *
 * The `band` values are NOT provisional — they are mechanical. Roster §3: "name
 * difficulty rides collection order", because a fixed given name cannot adapt to
 * a child's phonics level, so the only place the difficulty can live is the
 * collection. Ships 0-6 draw `short`, 7-14 `medium`, 15-20 `long`. If the ship
 * order changes, the bands follow it — they are a function of it, not a separate
 * opinion.
 */
export const COLLECTIONS: readonly Collection[] = [
  {
    id: 'base',
    name: 'Base Set',
    ship: 0,
    band: 'short',
    // The live 24, in `SPECIES` order (pets.ts:20-26). The test asserts this
    // array IS that array, element for element — not merely the same set.
    members: [
      'animal-beaver', 'animal-bee', 'animal-bunny', 'animal-cat', 'animal-caterpillar',
      'animal-chick', 'animal-cow', 'animal-crab', 'animal-deer', 'animal-dog',
      'animal-elephant', 'animal-fish', 'animal-fox', 'animal-giraffe', 'animal-hog',
      'animal-koala', 'animal-lion', 'animal-monkey', 'animal-panda', 'animal-parrot',
      'animal-penguin', 'animal-pig', 'animal-polar', 'animal-tiger',
    ],
  },
  {
    id: 'garden',
    name: 'Garden',
    ship: 1,
    band: 'short',
    members: [
      'animal-hedgehog', 'animal-squirrel', 'animal-mouse', 'animal-mole',
      'animal-badger', 'animal-frog', 'animal-toad', 'animal-tortoise',
      'animal-newt', 'animal-shrew', 'animal-dormouse', 'animal-vole',
      'animal-slow-worm', 'animal-salamander',
    ],
  },
  {
    id: 'birds',
    name: 'Birds',
    ship: 3,
    band: 'short',
    members: [
      'animal-robin', 'animal-blue-tit', 'animal-magpie', 'animal-owlet',
      'animal-puffin', 'animal-seagull', 'animal-woodpecker', 'animal-kingfisher',
      'animal-swan', 'animal-duck', 'animal-toucan', 'animal-flamingo',
      'animal-wren', 'animal-blackbird', 'animal-heron', 'animal-pelican',
      'animal-stork', 'animal-peacock',
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    ship: 4,
    band: 'short',
    members: [
      'animal-shark', 'animal-whale', 'animal-dolphin', 'animal-octopus',
      'animal-jellyfish', 'animal-pufferfish', 'animal-clownfish', 'animal-seahorse',
      'animal-starfish', 'animal-turtle', 'animal-ray', 'animal-lobster',
      'animal-squid', 'animal-eel', 'animal-anglerfish', 'animal-sea-urchin',
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    ship: 7,
    band: 'medium',
    members: [
      'animal-zebra', 'animal-hippo', 'animal-cheetah', 'animal-meerkat',
      'animal-warthog', 'animal-gorilla', 'animal-crocodile', 'animal-ostrich',
      'animal-antelope', 'animal-mongoose', 'animal-hyena', 'animal-baboon',
      'animal-wildebeest', 'animal-buffalo', 'animal-aardvark', 'animal-vulture',
    ],
  },
  {
    id: 'critters',
    name: 'Critters',
    ship: 6,
    band: 'short',
    members: [
      'animal-butterfly', 'animal-ladybird', 'animal-dragonfly', 'animal-ant',
      'animal-beetle', 'animal-spider', 'animal-worm', 'animal-grasshopper',
      'animal-moth', 'animal-woodlouse', 'animal-snail', 'animal-centipede',
      'animal-mantis', 'animal-stick-insect', 'animal-wasp', 'animal-slug',
    ],
  },
  {
    id: 'night-time',
    name: 'Night Time',
    ship: 8,
    band: 'medium',
    members: [
      'animal-bat', 'animal-raccoon', 'animal-wolf', 'animal-firefly',
      'animal-opossum', 'animal-sugar-glider', 'animal-nightjar', 'animal-tarsier',
      'animal-bushbaby', 'animal-scorpion', 'animal-fennec-fox', 'animal-civet',
      'animal-aye-aye', 'animal-kiwi', 'animal-kinkajou', 'animal-glow-worm',
    ],
  },
  {
    id: 'home-pets',
    name: 'Home Pets',
    ship: 2,
    band: 'short',
    members: [
      'animal-hamster', 'animal-guinea-pig', 'animal-budgie', 'animal-gerbil',
      'animal-pony', 'animal-ferret', 'animal-gecko', 'animal-chinchilla',
      'animal-canary', 'animal-cockatiel', 'animal-corn-snake', 'animal-terrapin',
      'animal-goldfish', 'animal-rat', 'animal-lovebird', 'animal-degu',
    ],
  },
  {
    id: 'ice',
    name: 'Ice',
    ship: 9,
    band: 'medium',
    members: [
      'animal-seal', 'animal-walrus', 'animal-arctic-fox', 'animal-reindeer',
      'animal-snowy-owl', 'animal-husky', 'animal-orca', 'animal-arctic-hare',
      'animal-musk-ox', 'animal-lemming', 'animal-beluga', 'animal-narwhal',
      'animal-ptarmigan', 'animal-ermine', 'animal-dall-sheep', 'animal-snow-petrel',
    ],
  },
  {
    id: 'woodland',
    name: 'Woodland',
    ship: 10,
    band: 'medium',
    members: [
      'animal-bear', 'animal-otter', 'animal-chipmunk', 'animal-elk',
      'animal-pine-marten', 'animal-stoat', 'animal-lynx', 'animal-skunk',
      'animal-porcupine', 'animal-wolverine', 'animal-hare', 'animal-wildcat',
      'animal-pheasant', 'animal-capercaillie', 'animal-mink', 'animal-coypu',
    ],
  },
  {
    id: 'outback',
    name: 'Outback',
    ship: 11,
    band: 'medium',
    members: [
      'animal-kangaroo', 'animal-wombat', 'animal-platypus', 'animal-emu',
      'animal-echidna', 'animal-quokka', 'animal-cockatoo', 'animal-dingo',
      'animal-frilled-lizard', 'animal-kookaburra', 'animal-tassie-devil',
      'animal-bilby', 'animal-numbat', 'animal-bandicoot', 'animal-thorny-devil',
      'animal-lyrebird',
    ],
  },
  {
    id: 'jungle',
    name: 'Jungle',
    ship: 12,
    band: 'medium',
    members: [
      'animal-sloth', 'animal-jaguar', 'animal-tree-frog', 'animal-chameleon',
      'animal-gibbon', 'animal-tapir', 'animal-snake', 'animal-tarantula',
      'animal-hummingbird', 'animal-lemur', 'animal-anteater', 'animal-capybara',
      'animal-ocelot', 'animal-howler-monkey', 'animal-iguana', 'animal-coati',
    ],
  },
  {
    id: 'farm',
    name: 'Farm',
    ship: 5,
    band: 'short',
    members: [
      'animal-sheep', 'animal-goat', 'animal-horse', 'animal-donkey',
      'animal-goose', 'animal-turkey', 'animal-llama', 'animal-alpaca',
      'animal-rooster', 'animal-ox', 'animal-mule', 'animal-chicken',
      'animal-guinea-fowl', 'animal-quail', 'animal-water-buffalo', 'animal-pigeon',
    ],
  },
  {
    id: 'raptors',
    name: 'Raptors',
    ship: 13,
    band: 'medium',
    members: [
      'animal-golden-eagle', 'animal-bald-eagle', 'animal-harpy-eagle',
      'animal-red-kite', 'animal-buzzard', 'animal-sparrowhawk', 'animal-goshawk',
      'animal-peregrine-falcon', 'animal-kestrel', 'animal-merlin', 'animal-hobby',
      'animal-osprey', 'animal-barn-owl', 'animal-tawny-owl', 'animal-eagle-owl',
      'animal-harrier',
    ],
  },
  {
    id: 'dinosaurs',
    name: 'Dinosaurs',
    ship: 14,
    band: 'medium',
    members: [
      'animal-t-rex', 'animal-triceratops', 'animal-stegosaurus',
      'animal-brachiosaurus', 'animal-pterodactyl', 'animal-velociraptor',
      'animal-ankylosaurus', 'animal-diplodocus', 'animal-spinosaurus',
      'animal-allosaurus', 'animal-parasaurolophus', 'animal-iguanodon',
      'animal-pachycephalosaurus', 'animal-dilophosaurus', 'animal-gallimimus',
      'animal-carnotaurus',
    ],
  },
  {
    id: 'prehistoric',
    name: 'Prehistoric',
    ship: 15,
    band: 'long',
    members: [
      'animal-mammoth', 'animal-sabre-tooth', 'animal-dodo', 'animal-megalodon',
      'animal-dire-wolf', 'animal-giant-sloth', 'animal-terror-bird',
      'animal-woolly-rhino', 'animal-quagga', 'animal-glyptodon',
      'animal-cave-bear', 'animal-irish-elk',
    ],
  },
  {
    id: 'legendary',
    name: 'Legendary',
    ship: 20,
    band: 'long',
    members: [
      'animal-unicorn', 'animal-dragon', 'animal-phoenix', 'animal-griffin',
      'animal-hippogriff', 'animal-yeti', 'animal-kraken', 'animal-loch-ness',
      'animal-jackalope', 'animal-thunderbird', 'animal-sphinx', 'animal-moon-rabbit',
    ],
  },
  {
    id: 'near-threatened',
    name: 'Near Threatened',
    ship: 16,
    band: 'long',
    members: [
      'animal-white-rhino', 'animal-european-bison', 'animal-maned-wolf',
      'animal-yak', 'animal-jerboa', 'animal-agouti', 'animal-harbour-porpoise',
      'animal-guanaco', 'animal-markhor', 'animal-jaguarundi',
      'animal-emperor-penguin', 'animal-striped-hyena',
    ],
  },
  {
    id: 'vulnerable',
    name: 'Vulnerable',
    ship: 17,
    band: 'long',
    members: [
      'animal-snow-leopard', 'animal-dugong', 'animal-sun-bear', 'animal-moon-bear',
      'animal-sloth-bear', 'animal-hyacinth-macaw', 'animal-mandrill',
      'animal-cassowary', 'animal-fossa', 'animal-takin', 'animal-gaur',
      'animal-manatee',
    ],
  },
  {
    id: 'endangered',
    name: 'Endangered',
    ship: 18,
    band: 'long',
    members: [
      'animal-red-panda', 'animal-chimpanzee', 'animal-bonobo', 'animal-blue-whale',
      'animal-african-wild-dog', 'animal-okapi', 'animal-giant-otter',
      'animal-komodo-dragon', 'animal-whooping-crane', 'animal-red-wolf',
      'animal-galapagos-penguin', 'animal-tree-kangaroo',
    ],
  },
  {
    id: 'critically-endangered',
    name: 'Critically Endangered',
    ship: 19,
    band: 'long',
    members: [
      'animal-black-rhino', 'animal-vaquita', 'animal-amur-leopard',
      'animal-sumatran-orangutan', 'animal-kakapo', 'animal-axolotl',
      'animal-philippine-eagle', 'animal-saola', 'animal-pangolin',
      'animal-gharial', 'animal-sumatran-rhino', 'animal-spixs-macaw',
    ],
  },
]

/**
 * The printed species name for every id in the roster. 320 of them.
 *
 * UK English and Title Case throughout, because §3 makes this the playground
 * currency — "Have you got the pangolin?" only works if every island spells it
 * the same way. That is also why this table is exhaustive rather than a set of
 * overrides on a prettify-the-slug function: "Blue Tit", "Sabre-Tooth" and
 * "Galápagos Penguin" cannot be recovered from their ids, and a function that
 * got any one of them wrong would do it silently.
 *
 * The judgement calls, made once and applied everywhere:
 *   - Hyphens in the brief's own spelling are KEPT and both halves capitalised:
 *     Slow-Worm, Glow-Worm, Aye-Aye, Sabre-Tooth, T-Rex.
 *   - Accents survive into the printed name (Galápagos) and are folded out of
 *     the id (`animal-galapagos-penguin`).
 *   - Apostrophes survive into the printed name (Spix's) and are DELETED, not
 *     hyphenated, in the id (`animal-spixs-macaw`) — `spix-s-macaw` reads as a
 *     typo and would be one to live with forever.
 *   - Proper nouns keep their capital wherever they came from a person or a
 *     place: Dall Sheep, Irish Elk, European Bison, Komodo Dragon, Amur
 *     Leopard, Sumatran Rhino, Philippine Eagle, African Wild Dog, Loch Ness.
 *   - "Tassie Devil" is the brief's word and stays the brief's word. It is the
 *     affectionate name, and §3's currency is what a child says out loud.
 *
 * THE FIRST BLOCK IS FROZEN. The base 24 are copied byte-for-byte out of
 * `SPECIES_NAME` (script.ts:95-119) and the test compares them key by key
 * against that table. `animal-hog` is a Wild Boar and `animal-polar` a Polar
 * Bear for reasons script.ts records at length; `animal-bunny` is a Bunny and
 * not a Rabbit because it is the child's word. Do not tidy any of them.
 */
export const SPECIES_NAMES: Readonly<Record<string, string>> = {
  // --- Base Set (live, frozen — mirrors script.ts:95-119) ---
  'animal-beaver': 'Beaver',
  'animal-bee': 'Bee',
  'animal-bunny': 'Bunny',
  'animal-cat': 'Cat',
  'animal-caterpillar': 'Caterpillar',
  'animal-chick': 'Chick',
  'animal-cow': 'Cow',
  'animal-crab': 'Crab',
  'animal-deer': 'Deer',
  'animal-dog': 'Dog',
  'animal-elephant': 'Elephant',
  'animal-fish': 'Fish',
  'animal-fox': 'Fox',
  'animal-giraffe': 'Giraffe',
  'animal-hog': 'Wild Boar',
  'animal-koala': 'Koala',
  'animal-lion': 'Lion',
  'animal-monkey': 'Monkey',
  'animal-panda': 'Panda',
  'animal-parrot': 'Parrot',
  'animal-penguin': 'Penguin',
  'animal-pig': 'Pig',
  'animal-polar': 'Polar Bear',
  'animal-tiger': 'Tiger',

  // --- 1. Garden (14) ---
  'animal-hedgehog': 'Hedgehog',
  'animal-squirrel': 'Squirrel',
  'animal-mouse': 'Mouse',
  'animal-mole': 'Mole',
  'animal-badger': 'Badger',
  'animal-frog': 'Frog',
  'animal-toad': 'Toad',
  'animal-tortoise': 'Tortoise',
  'animal-newt': 'Newt',
  'animal-shrew': 'Shrew',
  'animal-dormouse': 'Dormouse',
  'animal-vole': 'Vole',
  'animal-slow-worm': 'Slow-Worm',
  'animal-salamander': 'Salamander',

  // --- 2. Birds (18) ---
  'animal-robin': 'Robin',
  'animal-blue-tit': 'Blue Tit',
  'animal-magpie': 'Magpie',
  'animal-owlet': 'Owlet',
  'animal-puffin': 'Puffin',
  'animal-seagull': 'Seagull',
  'animal-woodpecker': 'Woodpecker',
  'animal-kingfisher': 'Kingfisher',
  'animal-swan': 'Swan',
  'animal-duck': 'Duck',
  'animal-toucan': 'Toucan',
  'animal-flamingo': 'Flamingo',
  'animal-wren': 'Wren',
  'animal-blackbird': 'Blackbird',
  'animal-heron': 'Heron',
  'animal-pelican': 'Pelican',
  'animal-stork': 'Stork',
  'animal-peacock': 'Peacock',

  // --- 3. Ocean (16) ---
  'animal-shark': 'Shark',
  'animal-whale': 'Whale',
  'animal-dolphin': 'Dolphin',
  'animal-octopus': 'Octopus',
  'animal-jellyfish': 'Jellyfish',
  'animal-pufferfish': 'Pufferfish',
  'animal-clownfish': 'Clownfish',
  'animal-seahorse': 'Seahorse',
  'animal-starfish': 'Starfish',
  'animal-turtle': 'Turtle',
  'animal-ray': 'Ray',
  'animal-lobster': 'Lobster',
  'animal-squid': 'Squid',
  'animal-eel': 'Eel',
  'animal-anglerfish': 'Anglerfish',
  'animal-sea-urchin': 'Sea Urchin',

  // --- 4. Africa (16) ---
  'animal-zebra': 'Zebra',
  'animal-hippo': 'Hippo',
  'animal-cheetah': 'Cheetah',
  'animal-meerkat': 'Meerkat',
  'animal-warthog': 'Warthog',
  'animal-gorilla': 'Gorilla',
  'animal-crocodile': 'Crocodile',
  'animal-ostrich': 'Ostrich',
  'animal-antelope': 'Antelope',
  'animal-mongoose': 'Mongoose',
  'animal-hyena': 'Hyena',
  'animal-baboon': 'Baboon',
  'animal-wildebeest': 'Wildebeest',
  'animal-buffalo': 'Buffalo',
  'animal-aardvark': 'Aardvark',
  'animal-vulture': 'Vulture',

  // --- 5. Critters (16) ---
  'animal-butterfly': 'Butterfly',
  'animal-ladybird': 'Ladybird',
  'animal-dragonfly': 'Dragonfly',
  'animal-ant': 'Ant',
  'animal-beetle': 'Beetle',
  'animal-spider': 'Spider',
  'animal-worm': 'Worm',
  'animal-grasshopper': 'Grasshopper',
  'animal-moth': 'Moth',
  'animal-woodlouse': 'Woodlouse',
  'animal-snail': 'Snail',
  'animal-centipede': 'Centipede',
  'animal-mantis': 'Mantis',
  'animal-stick-insect': 'Stick Insect',
  'animal-wasp': 'Wasp',
  'animal-slug': 'Slug',

  // --- 6. Night Time (16) ---
  'animal-bat': 'Bat',
  'animal-raccoon': 'Raccoon',
  'animal-wolf': 'Wolf',
  'animal-firefly': 'Firefly',
  'animal-opossum': 'Opossum',
  'animal-sugar-glider': 'Sugar Glider',
  'animal-nightjar': 'Nightjar',
  'animal-tarsier': 'Tarsier',
  'animal-bushbaby': 'Bushbaby',
  'animal-scorpion': 'Scorpion',
  'animal-fennec-fox': 'Fennec Fox',
  'animal-civet': 'Civet',
  'animal-aye-aye': 'Aye-Aye',
  'animal-kiwi': 'Kiwi',
  'animal-kinkajou': 'Kinkajou',
  'animal-glow-worm': 'Glow-Worm',

  // --- 7. Home Pets (16) ---
  'animal-hamster': 'Hamster',
  'animal-guinea-pig': 'Guinea Pig',
  'animal-budgie': 'Budgie',
  'animal-gerbil': 'Gerbil',
  'animal-pony': 'Pony',
  'animal-ferret': 'Ferret',
  'animal-gecko': 'Gecko',
  'animal-chinchilla': 'Chinchilla',
  'animal-canary': 'Canary',
  'animal-cockatiel': 'Cockatiel',
  'animal-corn-snake': 'Corn Snake',
  'animal-terrapin': 'Terrapin',
  'animal-goldfish': 'Goldfish',
  'animal-rat': 'Rat',
  'animal-lovebird': 'Lovebird',
  'animal-degu': 'Degu',

  // --- 8. Ice (16) ---
  'animal-seal': 'Seal',
  'animal-walrus': 'Walrus',
  'animal-arctic-fox': 'Arctic Fox',
  'animal-reindeer': 'Reindeer',
  'animal-snowy-owl': 'Snowy Owl',
  'animal-husky': 'Husky',
  'animal-orca': 'Orca',
  'animal-arctic-hare': 'Arctic Hare',
  'animal-musk-ox': 'Musk Ox',
  'animal-lemming': 'Lemming',
  'animal-beluga': 'Beluga',
  'animal-narwhal': 'Narwhal',
  'animal-ptarmigan': 'Ptarmigan',
  'animal-ermine': 'Ermine',
  'animal-dall-sheep': 'Dall Sheep',
  'animal-snow-petrel': 'Snow Petrel',

  // --- 9. Woodland (16) ---
  'animal-bear': 'Bear',
  'animal-otter': 'Otter',
  'animal-chipmunk': 'Chipmunk',
  'animal-elk': 'Elk',
  'animal-pine-marten': 'Pine Marten',
  'animal-stoat': 'Stoat',
  'animal-lynx': 'Lynx',
  'animal-skunk': 'Skunk',
  'animal-porcupine': 'Porcupine',
  'animal-wolverine': 'Wolverine',
  'animal-hare': 'Hare',
  'animal-wildcat': 'Wildcat',
  'animal-pheasant': 'Pheasant',
  'animal-capercaillie': 'Capercaillie',
  'animal-mink': 'Mink',
  'animal-coypu': 'Coypu',

  // --- 10. Outback (16) ---
  'animal-kangaroo': 'Kangaroo',
  'animal-wombat': 'Wombat',
  'animal-platypus': 'Platypus',
  'animal-emu': 'Emu',
  'animal-echidna': 'Echidna',
  'animal-quokka': 'Quokka',
  'animal-cockatoo': 'Cockatoo',
  'animal-dingo': 'Dingo',
  'animal-frilled-lizard': 'Frilled Lizard',
  'animal-kookaburra': 'Kookaburra',
  'animal-tassie-devil': 'Tassie Devil',
  'animal-bilby': 'Bilby',
  'animal-numbat': 'Numbat',
  'animal-bandicoot': 'Bandicoot',
  'animal-thorny-devil': 'Thorny Devil',
  'animal-lyrebird': 'Lyrebird',

  // --- 11. Jungle (16) ---
  'animal-sloth': 'Sloth',
  'animal-jaguar': 'Jaguar',
  'animal-tree-frog': 'Tree Frog',
  'animal-chameleon': 'Chameleon',
  'animal-gibbon': 'Gibbon',
  'animal-tapir': 'Tapir',
  'animal-snake': 'Snake',
  'animal-tarantula': 'Tarantula',
  'animal-hummingbird': 'Hummingbird',
  'animal-lemur': 'Lemur',
  'animal-anteater': 'Anteater',
  'animal-capybara': 'Capybara',
  'animal-ocelot': 'Ocelot',
  'animal-howler-monkey': 'Howler Monkey',
  'animal-iguana': 'Iguana',
  'animal-coati': 'Coati',

  // --- 12. Farm (16) ---
  'animal-sheep': 'Sheep',
  'animal-goat': 'Goat',
  'animal-horse': 'Horse',
  'animal-donkey': 'Donkey',
  'animal-goose': 'Goose',
  'animal-turkey': 'Turkey',
  'animal-llama': 'Llama',
  'animal-alpaca': 'Alpaca',
  'animal-rooster': 'Rooster',
  'animal-ox': 'Ox',
  'animal-mule': 'Mule',
  'animal-chicken': 'Chicken',
  'animal-guinea-fowl': 'Guinea Fowl',
  'animal-quail': 'Quail',
  'animal-water-buffalo': 'Water Buffalo',
  'animal-pigeon': 'Pigeon',

  // --- 13. Raptors (16) ---
  'animal-golden-eagle': 'Golden Eagle',
  'animal-bald-eagle': 'Bald Eagle',
  'animal-harpy-eagle': 'Harpy Eagle',
  'animal-red-kite': 'Red Kite',
  'animal-buzzard': 'Buzzard',
  'animal-sparrowhawk': 'Sparrowhawk',
  'animal-goshawk': 'Goshawk',
  'animal-peregrine-falcon': 'Peregrine Falcon',
  'animal-kestrel': 'Kestrel',
  'animal-merlin': 'Merlin',
  'animal-hobby': 'Hobby',
  'animal-osprey': 'Osprey',
  'animal-barn-owl': 'Barn Owl',
  'animal-tawny-owl': 'Tawny Owl',
  'animal-eagle-owl': 'Eagle Owl',
  'animal-harrier': 'Harrier',

  // --- 14. Dinosaurs (16) ---
  'animal-t-rex': 'T-Rex',
  'animal-triceratops': 'Triceratops',
  'animal-stegosaurus': 'Stegosaurus',
  'animal-brachiosaurus': 'Brachiosaurus',
  'animal-pterodactyl': 'Pterodactyl',
  'animal-velociraptor': 'Velociraptor',
  'animal-ankylosaurus': 'Ankylosaurus',
  'animal-diplodocus': 'Diplodocus',
  'animal-spinosaurus': 'Spinosaurus',
  'animal-allosaurus': 'Allosaurus',
  'animal-parasaurolophus': 'Parasaurolophus',
  'animal-iguanodon': 'Iguanodon',
  'animal-pachycephalosaurus': 'Pachycephalosaurus',
  'animal-dilophosaurus': 'Dilophosaurus',
  'animal-gallimimus': 'Gallimimus',
  'animal-carnotaurus': 'Carnotaurus',

  // --- 15. Prehistoric (12) ---
  'animal-mammoth': 'Mammoth',
  'animal-sabre-tooth': 'Sabre-Tooth',
  'animal-dodo': 'Dodo',
  'animal-megalodon': 'Megalodon',
  'animal-dire-wolf': 'Dire Wolf',
  'animal-giant-sloth': 'Giant Sloth',
  'animal-terror-bird': 'Terror Bird',
  'animal-woolly-rhino': 'Woolly Rhino',
  'animal-quagga': 'Quagga',
  'animal-glyptodon': 'Glyptodon',
  'animal-cave-bear': 'Cave Bear',
  'animal-irish-elk': 'Irish Elk',

  // --- 16. Legendary (12) ---
  'animal-unicorn': 'Unicorn',
  'animal-dragon': 'Dragon',
  'animal-phoenix': 'Phoenix',
  'animal-griffin': 'Griffin',
  'animal-hippogriff': 'Hippogriff',
  'animal-yeti': 'Yeti',
  'animal-kraken': 'Kraken',
  'animal-loch-ness': 'Loch Ness',
  'animal-jackalope': 'Jackalope',
  'animal-thunderbird': 'Thunderbird',
  'animal-sphinx': 'Sphinx',
  'animal-moon-rabbit': 'Moon Rabbit',

  // --- 17. Near Threatened (12) ---
  'animal-white-rhino': 'White Rhino',
  'animal-european-bison': 'European Bison',
  'animal-maned-wolf': 'Maned Wolf',
  'animal-yak': 'Yak',
  'animal-jerboa': 'Jerboa',
  'animal-agouti': 'Agouti',
  'animal-harbour-porpoise': 'Harbour Porpoise',
  'animal-guanaco': 'Guanaco',
  'animal-markhor': 'Markhor',
  'animal-jaguarundi': 'Jaguarundi',
  'animal-emperor-penguin': 'Emperor Penguin',
  'animal-striped-hyena': 'Striped Hyena',

  // --- 18. Vulnerable (12) ---
  'animal-snow-leopard': 'Snow Leopard',
  'animal-dugong': 'Dugong',
  'animal-sun-bear': 'Sun Bear',
  'animal-moon-bear': 'Moon Bear',
  'animal-sloth-bear': 'Sloth Bear',
  'animal-hyacinth-macaw': 'Hyacinth Macaw',
  'animal-mandrill': 'Mandrill',
  'animal-cassowary': 'Cassowary',
  'animal-fossa': 'Fossa',
  'animal-takin': 'Takin',
  'animal-gaur': 'Gaur',
  'animal-manatee': 'Manatee',

  // --- 19. Endangered (12) ---
  'animal-red-panda': 'Red Panda',
  'animal-chimpanzee': 'Chimpanzee',
  'animal-bonobo': 'Bonobo',
  'animal-blue-whale': 'Blue Whale',
  'animal-african-wild-dog': 'African Wild Dog',
  'animal-okapi': 'Okapi',
  'animal-giant-otter': 'Giant Otter',
  'animal-komodo-dragon': 'Komodo Dragon',
  'animal-whooping-crane': 'Whooping Crane',
  'animal-red-wolf': 'Red Wolf',
  'animal-galapagos-penguin': 'Galápagos Penguin',
  'animal-tree-kangaroo': 'Tree Kangaroo',

  // --- 20. Critically Endangered (12) ---
  'animal-black-rhino': 'Black Rhino',
  'animal-vaquita': 'Vaquita',
  'animal-amur-leopard': 'Amur Leopard',
  'animal-sumatran-orangutan': 'Sumatran Orangutan',
  'animal-kakapo': 'Kakapo',
  'animal-axolotl': 'Axolotl',
  'animal-philippine-eagle': 'Philippine Eagle',
  'animal-saola': 'Saola',
  'animal-pangolin': 'Pangolin',
  'animal-gharial': 'Gharial',
  'animal-sumatran-rhino': 'Sumatran Rhino',
  'animal-spixs-macaw': "Spix's Macaw",
}

/**
 * Species id -> collection id, built from `COLLECTIONS` at module load.
 *
 * DERIVED, never typed. A hand-written second copy of the membership is a
 * second thing to keep in step with the brief, and the two would part company
 * on the first collection anyone edits — silently, because nothing reads both.
 * The loop cannot disagree with itself.
 *
 * A species in two collections would be lost here (last write wins), which is
 * exactly why the test proves uniqueness against `COLLECTIONS` rather than
 * against this map.
 */
export const SPECIES_COLLECTION: Readonly<Record<string, string>> = (() => {
  const out: Record<string, string> = {}
  for (const c of COLLECTIONS) {
    for (const id of c.members) out[id] = c.id
  }
  return out
})()

/** Collections by id, so the two lookups below are not linear scans. */
const BY_ID: Readonly<Record<string, Collection>> = (() => {
  const out: Record<string, Collection> = {}
  for (const c of COLLECTIONS) out[c.id] = c
  return out
})()

/**
 * Which collection a species belongs to, or `undefined` for an id we do not
 * know.
 *
 * Undefined rather than a throw or a default: a save from a future build can
 * carry a species this table has not got yet (`script.ts:122-127` takes the
 * same view of names), and the caller is better placed than this file to decide
 * whether that is a missing page or a shrug.
 */
export function collectionOf(speciesId: string): Collection | undefined {
  const id = SPECIES_COLLECTION[speciesId]
  return id === undefined ? undefined : BY_ID[id]
}

/** A collection by its own id. Same undefined-means-unknown contract. */
export function collection(id: string): Collection | undefined {
  return BY_ID[id]
}

/** Every band that exists, in ship order. Handy for the album's page headers. */
export const BANDS_IN_SHIP_ORDER: readonly NameBand[] =
  [...COLLECTIONS].sort((a, b) => a.ship - b.ship).map((c) => c.band)
