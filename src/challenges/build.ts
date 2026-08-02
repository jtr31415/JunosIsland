/**
 * Grapheme-tile word building, with Fred sounding the word out.
 * Ported from v0/junos-words.html:1181-1308.
 *
 * THE MASH RESCUE NO LONGER SOUNDS OUT GRAPHEMES. The 2D game had Fred say
 * each grapheme in turn ("buh", "tuh", "shh"), which works when a human says
 * it and is genuinely unpleasant through a speech synthesiser — stop
 * consonants come out as a schwa-laden bark. Product owner's call, and the
 * right one.
 *
 * The rescue it replaces it with does the same job: the whole word again,
 * slowly, with the next tile the child needs gently highlighted. Help, not
 * shame (brief §19), and no worse audio than the prompt they already heard.
 *
 * fredTalk and FRED_SOUNDS are kept and still exported — the sequencing is
 * sound and a real recorded voice would make it excellent — but nothing calls
 * fredTalk automatically any more.
 */
import type { BuildItem } from '../core/generators/build'
import type { ChallengeDeps, ChallengeHandle } from './mount'

/**
 * Best-effort sound map (v0:1204-1211). Continuants (sss, mmm, shh) come out
 * well on TTS; stop consonants carry an unavoidable schwa (buh, tuh), and the
 * slot highlight paces the sounding-out either way.
 */
export const FRED_SOUNDS: Record<string, string> = {
  a: 'ah', e: 'eh', i: 'ih', o: 'oh', u: 'uh',
  b: 'buh', c: 'cuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh', j: 'juh', k: 'kuh',
  l: 'lll', m: 'mmm', n: 'nnn', p: 'puh', r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv',
  w: 'wuh', y: 'yuh', z: 'zzz',
  ch: 'chuh', sh: 'shh', th: 'thuh', wh: 'wuh', ng: 'ing', ck: 'kuh',
  ll: 'lll', ss: 'sss', ff: 'fff', ee: 'ee', oo: 'oo', or: 'or',
}

export function mountBuild(item: BuildItem, deps: ChallengeDeps): ChallengeHandle {
  let roundTimer: ReturnType<typeof setTimeout> | null = null
  let fredToken = 0
  let torn = false

  const box = deps.el
  box.classList.remove('maths')
  box.classList.add('build')
  box.innerHTML = ''

  const slotRow = document.createElement('div')
  slotRow.className = 'slotrow'
  const slots = item.segs.map(() => {
    const sl = document.createElement('span')
    sl.className = 'slot'
    slotRow.appendChild(sl)
    return sl
  })

  const speakBuildWord = (): void => {
    if (torn || !deps.isActive()) return
    if (Date.now() < deps.holds.quietUntil()) {
      roundTimer = setTimeout(speakBuildWord, deps.holds.quietUntil() - Date.now() + 200)
      return
    }
    const ok = deps.speech.speak(item.w)
    if (!ok) {
      /* no voice: show the word — copying it tile by tile is early spelling,
         still a win */
      deps.showTarget('Build: <b>' + item.w + '</b>')
    }
  }

  /* Fred talk: sound the word out, one grapheme at a time (v0:1213). */
  const fredTalk = (): void => {
    if (torn || !deps.isActive()) return
    deps.onHelp?.('fred')
    const token = ++fredToken
    const seq = item.segs.map(sg => FRED_SOUNDS[sg] ?? sg)
    let k = 0
    const stepFred = (): void => {
      if (torn || token !== fredToken || !deps.isActive()) return
      slots.forEach(sl => sl.classList.remove('fredhl'))
      if (k >= seq.length) {
        deps.speech.speak(item.w)
        return
      }
      slots[k]?.classList.add('fredhl')
      const spoke = deps.speech.speak(seq[k] as string, 0.9, () => setTimeout(stepFred, 320))
      k++
      if (!spoke) setTimeout(stepFred, 850)   /* no voice: visual pacing only */
    }
    setTimeout(stepFred, 350)
  }

  /**
   * The gentle rescue: say the word slowly, and show which tile comes next by
   * pulsing its slot. No grapheme-by-grapheme synthesis.
   */
  const rescue = (): void => {
    if (torn || !deps.isActive()) return
    deps.speech.speak(item.w, 0.6)
    const slot = slots[pos]
    if (slot) {
      slot.classList.add('fredhl')
      setTimeout(() => slot.classList.remove('fredhl'), 1600)
    }
  }

  const tray = document.createElement('div')
  tray.className = 'tray'
  let pos = 0, doneB = false, wrongsB = 0

  item.tray.forEach((tk, i) => {
    const t = document.createElement('span')
    t.className = 'tile' + (tk.length > 1 ? ' di2' : '')
    t.textContent = tk
    t.style.animationDelay = (i * 0.05) + 's'
    t.addEventListener('pointerdown', e => {
      e.stopPropagation()
      if (torn || doneB || t.classList.contains('used') ||
          Date.now() < deps.holds.inputLock()) return
      if (tk === item.segs[pos]) {
        wrongsB = 0
        t.classList.add('used')
        const slot = slots[pos] as HTMLElement
        slot.textContent = tk
        slot.classList.add('filled')
        if (tk.length > 1) slot.classList.add('di2')
        pos++
        deps.sfx.play('up')
        if (pos >= item.segs.length) {
          doneB = true
          deps.speech.speak(item.w)
          const r = slotRow.getBoundingClientRect()
          deps.burst(r.left + r.width / 2, r.top + r.height / 2)
          deps.flyToScore(slotRow)
          deps.sfx.play('win')
          const nextB = (): void => {
            if (torn || !deps.isActive()) return
            if (Date.now() < deps.holds.rewardUntil()) {
              roundTimer = setTimeout(nextB, deps.holds.rewardUntil() - Date.now() + 60)
              return
            }
            deps.onAdvance()
          }
          roundTimer = setTimeout(nextB, 1600)
        }
      } else {
        t.animate(
          [{ translate: '0 0' }, { translate: '-6px 0' }, { translate: '6px 0' },
           { translate: '-4px 0' }, { translate: '0 0' }],
          { duration: 300, easing: 'ease-in-out' })
        deps.sfx.play('bump')
        deps.onWrong()
        if (++wrongsB >= 3) {
          /* Three stumbles summon help: the word again, slowly, and a nudge
             toward the tile they need next. Never a scolding. */
          wrongsB = 0
          deps.holds.lockInput(Date.now() + 1800)
          rescue()
        }
      }
    })
    tray.appendChild(t)
  })

  box.append(slotRow, tray)
  roundTimer = setTimeout(() => speakBuildWord(), 900)

  return {
    /* btnSay (v0:2086) and btnFred (v0:2087): help WITHOUT wiping the tiles
       the child has already placed. */
    sayAgain: () => { if (roundTimer) clearTimeout(roundTimer); speakBuildWord() },
    /* Still available if a button wants it; nothing triggers it automatically. */
    fred: () => fredTalk(),
    teardown: () => {
      torn = true
      fredToken++          /* cancels any in-flight Fred sequence (v0:845) */
      if (roundTimer) { clearTimeout(roundTimer); roundTimer = null }
      deps.speech.cancel()
      deps.hideTarget()
      box.innerHTML = ''
    },
  }
}
