/**
 * Alien word generator, ported from v0/junos-words.html:463-504.
 *
 * Pronounceable non-words built from taught graphemes — pure decoding with no
 * shape memory and no first-letter shortcuts. Also the source of decodable pet
 * names (see names.ts).
 */
import { GREEN, RED } from './wordlists'
import { plainWord } from './segmentation'
import { ri } from './rng'
import type { Rng } from './rng'

/* Short vowels appear twice: deliberate weighting, not a duplication slip. */
export const AL_ONSETS = ['b','d','f','g','h','j','l','m','n','p','r','s','t','v','w','z','ch','sh','th'];
export const AL_VOWELS = ['a','e','i','o','u','a','e','i','o','u','ee','oo','or'];
export const AL_CODAS_SHORT = ['b','d','g','m','n','p','t','ck','ll','ss','ff','ng','sh','th'];
export const AL_CODAS_LONG  = ['b','d','g','m','n','p','t','l','f'];

/**
 * Real words the generator must never accidentally produce. The first line
 * spreads the entire taught curriculum in, so an "alien" word can never
 * collide with a word the child is learning. Verbatim from v0:467-489.
 */
export const REAL_BLOCK = new Set<string>([
  ...GREEN.map(plainWord), ...RED.map(plainWord),
  'cat','dog','man','pig','sun','bed','leg','hat','pen','cup','bus','fox','zip',
  'jam','web','van','mud','rat','mat','map','top','pot','pin','bin','tin','fan',
  'fun','bug','bat','bit','ten','net','wet','pet','set','sad','lot','dot','hot',
  'gun','peg','vat','yap','nab','sob','rob','rub','rug','mug','hug','jug','tub',
  'moon','food','soon','root','boot','week','seek','peek','feed','need','seed',
  'fort','sort','port','cork','fork','ship','shop','chip','chop','chat','wish',
  'dish','fish','cash','path','bath','moth','sock','rock','lock','tick','lick',
  'kick','pick','sick','pack','sack','neck','peck','deck','duck','luck','muck',
  'suck','tuck','bell','tell','sell','fell','well','hill','fill','till','pill',
  'mill','doll','dull','mess','less','boss','loss','kiss','miss','fuss','puff',
  'huff','cuff','song','long','ring','king','sing','wing','bang','rang','hang',
  'gong','lung','sung','rung','book','took','cook','hook','good','wood','hood',
  'foot','wool','poor','door','born','corn','horn','torn','worn','form','sash',
  'mash','dash','rash','bash','fog','log','jog','dig','fig','wig','rig','jig',
  'hem','gem','rim','dim','ham','ram','yam','dam','tom','pop','mop','hop','cop',
  'cod','rod','nod','pod','gap','lap','nap','rap','sap','tap','zap','cap','lad',
  'pad','mad','fad','sup','pup','cub','nib','fib','rib','bib','pub','sum','gum',
  'hum','bun','nun','pun','won','son','ton','den','hen','men','led','fed','wed',
  'vet','jet','met','yet','bet','gut','hut','jut','nut','rut','cut','kit','fit',
  'hit','lit','wit','pit','cot','jot','rot','tot'
]);

/** Pronounceable non-word from taught graphemes. Port of alienWord (v0:491).
 *  RNG order is vowel -> onset -> coda (v0:493-496); reordering changes every
 *  generated word and fails the golden diff. */
export function alienWord(rng: Rng): string {
  for (let g = 0; g < 60; g++) {
    const v  = AL_VOWELS[ri(rng, AL_VOWELS.length)] as string
    const on = AL_ONSETS[ri(rng, AL_ONSETS.length)] as string
    const codas = v.length === 1 ? AL_CODAS_SHORT : AL_CODAS_LONG
    const co = codas[ri(rng, codas.length)] as string
    if (on === co) continue
    const w = on + v + co
    if (w.length > 5) continue
    if (REAL_BLOCK.has(w)) continue
    return w
  }
  return 'vap'
}
