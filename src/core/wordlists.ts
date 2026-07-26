/**
 * Word lists, ported verbatim from v0/junos-words.html:368-395.
 *
 * Array ORDER is load-bearing: makeDeck deals from these arrays, so reordering
 * changes every generated round and fails the golden diff.
 *
 * GREEN = fully decodable with the taught code.
 * RED   = common exception / "tricky" words (UK style).
 */

/** A word that may carry [bracket] markup around its tricky bit, e.g. "s[ai]d". */
export type MarkedWord = string
/** A word with markup stripped, e.g. "said". */
export type PlainWord = string
export type WordClass = 'green' | 'red'

export const GREEN: PlainWord[] = [
  'a','am','an','and','as','at','back','big','but','can','dad','did',
  'for','from','get','got','had','has','help','him','his','if','in','is',
  'it','jump','just','let','look','mum','no','not','off','on','pull',
  'push','put','ran','red','run','sat','see','sit','stop','that','them',
  'then','this','too','up','us','went','when','will','with','yes'
]

/* RED words carry [brackets] around the tricky bit — the grapheme that
   breaks the taught code. Everything outside the brackets is decodable. */
export const RED: MarkedWord[] = [
  '[a]ll','[are]','b[e]','b[y]','c[o]m[e]','d[o]','d[oes]','d[ow]n',
  'g[o]','hav[e]','h[e]','h[er]','h[ere]','[I]','int[o]','l[i]k[e]',
  'l[o]v[e]','m[e]','m[y]','n[ow]','o[f]','[oh]','[one]','[ou]t','s[ai]d',
  'sh[e]','s[o]','s[o]m[e]','th[e]','th[ey]','t[o]','t[wo]','w[a]nt',
  'w[a]s','w[e]','w[ere]','wh[a]t','[who]','wh[y]','y[ou]','y[our]'
]

/* Words that sound the same (or nearly the same) — never shown in the
   same batch, because a listening game with "too" AND "two" on screen
   is a trap, not a test. Extend freely. */
export const CONFUSABLE: PlainWord[][] = [
  ['to','too','two'],
  ['of','off'],
  ['an','and'],
  ['then','them']
]

/** Word -> confusable group index. Port of v0:394-395. */
export const groupOf: Record<PlainWord, number> = {}
CONFUSABLE.forEach((g, gi) => g.forEach(w => { groupOf[w] = gi }))
