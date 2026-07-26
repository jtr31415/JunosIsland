/**
 * Decodable pet names (brief section 5): Bimo, Sheptun, Corbell.
 *
 * The one genuinely new module in M0 — there is no original to port from.
 * alienWord gives single CVC syllables; petName composes two so names sound
 * like creatures rather than test items, while staying built only from taught
 * graphemes. Every pet's name is itself a piece of reading practice: it is
 * shown large at hatch, spoken via TTS, and tappable forever after.
 *
 * M1 uses the full grapheme pool. M3 constrains it to the child's taught set.
 */
import { AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, REAL_BLOCK } from './alien'
import { ri } from './rng'
import type { Rng } from './rng'

/**
 * Fragments a pet name must never contain.
 *
 * The two-syllable space is ~647,000 names, and REAL_BLOCK is a CVC curriculum
 * list holding almost nothing at five-plus letters — so it screens virtually
 * none of them. Left unchecked the generator can build "Satan", "Demon",
 * "Vomit", "Moron" and "Poobum" (all verified constructible from the pools).
 *
 * Any single one is about one in a million per draw. That is precisely the
 * wrong way to think about it: the game is for a five-year-old, the brief's
 * first principle is "bright, never scary" (section 1.2) and section 18 forbids
 * darkness-as-threat, and the name is the emotional peak of the hatch. The cost
 * of a rare hit is enormous and the cost of over-blocking is zero — we are
 * discarding a handful of names from six hundred thousand.
 *
 * Matched as substrings, so embedded cases ("Bumbo", "Hellox") go too.
 */
const FORBIDDEN = [
  // scary / religious
  'satan', 'demon', 'devil', 'hell', 'evil', 'curse', 'damn', 'sin', 'hades',
  'reaper', 'grave', 'tomb', 'coffin', 'corpse', 'morgue', 'witch', 'hex',
  // death and violence
  'kill', 'die', 'dead', 'death', 'murder', 'blood', 'gore', 'stab', 'shoot',
  'gun', 'war', 'hurt', 'wound', 'pain', 'bomb',
  // bodily and rude
  'poo', 'pee', 'wee', 'bum', 'fart', 'snot', 'vomit', 'puke', 'spew', 'turd',
  'crap', 'arse', 'ass', 'shit', 'piss', 'willy', 'knob', 'cock', 'dick',
  'tit', 'boob', 'fanny', 'minge', 'sex', 'anus', 'bogey', 'phlegm', 'butt',
  // insults
  'moron', 'idiot', 'stupid', 'dumb', 'thick', 'loser', 'ugly', 'fat',
  'freak', 'weirdo', 'nutter', 'mental', 'spaz', 'retard', 'slut', 'whore',
  // substances and hate
  'beer', 'wine', 'vodka', 'drug', 'dope', 'weed', 'fag', 'nazi', 'hitler',
  'rape', 'homo', 'queer',
]

/** One open syllable: onset + vowel, e.g. "bi", "she". */
function openSyllable(rng: Rng): string {
  return (AL_ONSETS[ri(rng, AL_ONSETS.length)] as string) +
         (AL_VOWELS[ri(rng, AL_VOWELS.length)] as string)
}

/** One closed syllable: onset + vowel + coda, e.g. "tun", "bell". */
function closedSyllable(rng: Rng): string {
  return openSyllable(rng) + (AL_CODAS_SHORT[ri(rng, AL_CODAS_SHORT.length)] as string)
}

/**
 * Reject a candidate name.
 *
 * Beyond safety, two readability rules. A triple letter across the syllable
 * join ("Belllo") is not decodable by any taught pattern. A final bare 'e'
 * ("Tunbe") invites the silent-e reading the child is taught, and TTS renders
 * it unpredictably — bad at the one moment the name is shown and spoken
 * together.
 */
function rejected(w: string): boolean {
  if (w.length < 5 || w.length > 9) return true
  if (REAL_BLOCK.has(w)) return true
  if (FORBIDDEN.some(bad => w.includes(bad))) return true
  if (/(.)\1\1/.test(w)) return true
  if (w.endsWith('e')) return true
  return false
}

export function petName(rng: Rng): string {
  for (let g = 0; g < 60; g++) {
    const closedFirst = ri(rng, 2) === 0
    const w = closedFirst
      ? closedSyllable(rng) + openSyllable(rng)
      : openSyllable(rng) + closedSyllable(rng)
    if (rejected(w)) continue
    return (w[0] as string).toUpperCase() + w.slice(1)
  }
  return 'Bimo'
}

/** Exposed for tests: the screen a candidate must pass. */
export const _rejected = rejected
