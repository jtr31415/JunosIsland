/**
 * Near-misses around buttons, words, tiles and chips must NOT turn the page.
 * Port of inDeadZone (v0/junos-words.html:2064-2074).
 *
 * The 16px padding and the STRICT comparisons are both field-tuned. The
 * original's element list is a selector owned by the shell:
 *
 *   #hudLeft,#hudRight,#footer,#words .word,#words .nchip,#words .tile,
 *   #words .helper,#words .slot,.visitor
 *
 * (v0:2067-2068 — note .nchip is the number pad and .helper the dot hints;
 * dropping either makes a near-miss beside them turn the page.)
 */
export function inDeadZone(x: number, y: number, els: readonly Element[]): boolean {
  const pad = 16
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (x > r.left - pad && x < r.right + pad &&
        y > r.top - pad && y < r.bottom + pad) return true
  }
  return false
}

/** The shell's dead-zone selector, verbatim from v0:2067-2068. */
export const DEAD_ZONE_SELECTOR =
  '#hudLeft,#hudRight,#footer,#words .word,#words .nchip,#words .tile,#words .helper,#words .slot,.visitor'
