/**
 * Fred's Lonely Rock — the opening (brief section 3), verbatim.
 *
 * Twenty seconds, tap-to-advance, fully TTS-voiced. Plays once per profile,
 * skippable, and replayable forever by tapping Fred ("tell me again?").
 *
 * The wording is load-bearing. These lines establish the STANDING WORLD-LAW
 * vocabulary the rest of the game reuses: eggs *hatch when read to*, pets
 * *come home* when their name is read, land is *found* for the friends who
 * need it. Rewording them quietly breaks the game's internal logic for the
 * child, so the copy is changed only on Joe's say-so — never to suit a test,
 * a layout, or a tidier sentence.
 *
 * TWO OF THOSE THREE ARE NO LONGER THE BRIEF'S OWN WORDS, and that is
 * deliberate. Joe, twice:
 *
 *   - *"'You've counted up some land' sounds off. lets call it 'You have found
 *     some land for your friends'"* — taken at main.ts:1581.
 *   - *"change the bits that 'read something home' or 'count up land'. i dont
 *     want these weird linguistic crowbars."*
 *
 * So *counted up* is gone everywhere it was spoken or printed, and the egg is
 * *read to* rather than *read home* — which is what the opening's own earlier
 * beat already says ("they only hatch for someone who reads to them"), so the
 * crowbar was never even consistent with the line three beats above it.
 *
 * `pet-island-brief.md` §3 (lines 18, 59, 68) STILL CARRIES THE OLD WORDING and
 * now disagrees with the game. That divergence is known and is Joe's to close;
 * do not "fix" the code back to match the brief. The same divergence was
 * already opened by the first ruling above and left recorded rather than
 * reconciled, which is the established pattern here.
 */

export interface Beat {
  /** What Fred says. [NAME] is replaced with the child's name. */
  line: string
  /** What the world does as he says it. */
  cue?: 'egg-arrives' | 'point-egg' | 'first-read' | 'ask-land' | 'first-sum'
}

export const OPENING: Beat[] = [
  { line: 'Oh! Hello, [NAME].' },
  { line: "I'm Fred. It's just me on this little rock." },
  { line: "It's ever so quiet out here." },
  { line: 'Ooh! Look! An egg!', cue: 'egg-arrives' },
  {
    line: 'Eggs come from far across the sea… and they only hatch for someone who reads to them.',
    cue: 'point-egg',
  },
  { line: 'Will you read to it, [NAME]?', cue: 'first-read' },
  { line: 'You found its name! [PETNAME] has arrived.' },
  {
    line: 'Every new friend needs somewhere to live… can you find us some land?',
    cue: 'ask-land',
  },
]

/** Spoken when an egg hatches, after the opening. Brief section 3. */
/**
 * What the tile offer asks.
 *
 * Here, and named, because it was written out twice — once in `interactions.ts`
 * and once in `main.ts` — so the two could drift, and one of them would then be
 * a question the game asks in only some circumstances.
 *
 * "Tile", not "land", at Joe's request. It matches the word the rest of the game
 * uses for the thing she is choosing, and it stays right when the biome ladder
 * adds kinds that are not land at all.
 */
export const TILE_QUESTION = 'Which tile would you like?'

export const HATCH_LINES = [
  '[PETNAME] has arrived!',
  '[PETNAME] is here!',
]

export const fill = (s: string, name: string, petName = ''): string =>
  s.replace(/\[NAME\]/g, name).replace(/\[PETNAME\]/g, petName)

/**
 * What each species is CALLED — the word a six-year-old would use.
 *
 * `SPECIES` in pets.ts holds file basenames (`animal-fox`), and `pets.ts` strips
 * the prefix only to build a path. Nothing anywhere named the animals, so the
 * album pop-out had no species to show. This is COPY, and it lives here with the
 * rest of the copy rather than beside the loader — a display word is not a fact
 * about a GLB, and scattering it is how two spellings of the same animal end up
 * on screen at once.
 *
 * Keyed by the FULL id, not the stripped one, so no caller has to know that
 * `animal-` is a prefix. It is also readable content in a reading game, so it is
 * rendered in the same literacy font stack as every other word she meets
 * (`.album-fact`, tokens.css) and spoken by the same voice.
 *
 * Two of the twenty-four are judgement rather than transcription:
 *
 *   - **`animal-polar` is a Polar Bear**, not a "Polar". There is no such animal
 *     as a polar and the model is unmistakably a bear; the id is a filename.
 *   - **`animal-hog` is a Wild Boar**, and this one was settled by LOOKING at the
 *     model in the Pet-o-matic rather than by reading its filename. It has a warm
 *     brown coat (measured base 195,113,78 — the bunny's palette, not a
 *     warthog's grey), a ridge of raised bristles along its back, and one pale
 *     tusk curving up from the snout. So: not "Warthog", which would be a claim
 *     about grey warts the model does not make; and not "Pig", because
 *     `animal-pig` is also in the pack and is pink, and two friends whose cards
 *     both read "Pig" with different faces is the album contradicting itself.
 *     "Hog" on its own is a decodable CVC and tempting for that reason, but it is
 *     not a word a British six-year-old says or hears. "Wild Boar" is what the
 *     model plainly is, in two short words, and the difference from the pig
 *     becomes the interesting part rather than a collision to be dodged.
 *
 * The rest are the plain word. `animal-bunny` stays a Bunny rather than becoming
 * a Rabbit: it is the child's word, and it is the pack's own word too.
 */
export const SPECIES_NAME: Readonly<Record<string, string>> = {
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
}

/**
 * The species word, or something harmless if the id is not one we know.
 *
 * Falls back to the id with its prefix stripped and its first letter raised,
 * rather than to an empty string or the word "Unknown". A save from a future
 * build — or a pack that gains a species before this table does — must show her
 * SOMETHING for her own friend; brief §19 forbids losing what she owns, and a
 * blank where an animal's name goes is a small version of losing it.
 */
export function speciesName(id: string): string {
  const known = SPECIES_NAME[id]
  if (known) return known
  const bare = id.replace(/^animal-/, '').replace(/[-_]+/g, ' ')
  return bare.charAt(0).toUpperCase() + bare.slice(1)
}
