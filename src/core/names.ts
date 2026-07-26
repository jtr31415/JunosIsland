/**
 * Decodable pet names (brief section 5): Bimo, Sheptun, Corbell.
 *
 * The one genuinely new module in M0. alienWord gives single CVC syllables;
 * petName composes two so names sound like creatures rather than test items,
 * while staying built only from taught graphemes — every pet's name is itself
 * a piece of reading practice.
 *
 * M1 uses the full grapheme pool. M3 constrains it to the child's taught set.
 */
import { AL_ONSETS, AL_VOWELS, AL_CODAS_SHORT, REAL_BLOCK } from './alien'
import { ri } from './rng'
import type { Rng } from './rng'

/** One open syllable: onset + vowel, e.g. "bi", "she". */
function openSyllable(rng: Rng): string {
  return (AL_ONSETS[ri(rng, AL_ONSETS.length)] as string) +
         (AL_VOWELS[ri(rng, AL_VOWELS.length)] as string)
}

/** One closed syllable: onset + vowel + coda, e.g. "tun", "bell". */
function closedSyllable(rng: Rng): string {
  return openSyllable(rng) + (AL_CODAS_SHORT[ri(rng, AL_CODAS_SHORT.length)] as string)
}

export function petName(rng: Rng): string {
  for (let g = 0; g < 60; g++) {
    const closedFirst = ri(rng, 2) === 0
    const w = closedFirst
      ? closedSyllable(rng) + openSyllable(rng)
      : openSyllable(rng) + closedSyllable(rng)
    if (w.length < 3 || w.length > 9) continue
    if (REAL_BLOCK.has(w)) continue
    return (w[0] as string).toUpperCase() + w.slice(1)
  }
  return 'Bimo'
}
