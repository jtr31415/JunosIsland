/**
 * Markup helpers, ported from v0/junos-words.html:398-428.
 * [brackets] mark the tricky bit; digraphs are found automatically.
 *
 * Powers both the wavy tricky-bit underlines in the word-find and the
 * grapheme tiles in word-building.
 */
import type { MarkedWord, PlainWord } from './wordlists'

export type SegKind = 'plain' | 'tricky'
export interface Seg { txt: string; k: SegKind }

export type DiKind = 'plain' | 'di'
export interface DiSeg { txt: string; k: DiKind }

/** Strip [bracket] markup. Port of plainWord (v0:398). */
export function plainWord(str: MarkedWord): PlainWord {
  return str.replace(/[[\]]/g, '')
}

/** Split a marked word into plain and tricky runs. Port of parseMark (v0:400). */
export function parseMark(str: MarkedWord): Seg[] {
  const segs: Seg[] = []
  let buf = ''
  let inB = false
  for (const ch of str) {
    if (ch === '[') { if (buf) segs.push({ txt: buf, k: 'plain' }); buf = ''; inB = true }
    else if (ch === ']') { if (buf) segs.push({ txt: buf, k: 'tricky' }); buf = ''; inB = false }
    else buf += ch
  }
  if (buf) segs.push({ txt: buf, k: inB ? 'tricky' : 'plain' })
  return segs
}

/**
 * Common Reception/Y1 graphemes, longest first so trigraphs win (v0:411-415).
 * Order is the matching priority — do not sort.
 */
export const GRAPHS: string[] = ['igh','ear','air','ure',
  'ch','sh','th','wh','ph','ng','nk','qu','ck','ff','ll','ss','zz',
  'ai','ay','ee','ea','ie','oa','oo','ou','ow','oi','oy',
  'or','ar','ur','er','ir','aw','au','ew','ue','oe']

/** Segment into graphemes, coalescing plain letters. Port of markDigraphs (v0:417). */
export function markDigraphs(txt: PlainWord): DiSeg[] {
  const out: DiSeg[] = []
  let i = 0
  outer: while (i < txt.length) {
    for (const g of GRAPHS) {
      if (txt.startsWith(g, i)) { out.push({ txt: g, k: 'di' }); i += g.length; continue outer }
    }
    const last = out[out.length - 1]
    if (last && last.k === 'plain') last.txt += txt[i]
    else out.push({ txt: txt[i] as string, k: 'plain' })
    i++
  }
  return out
}
