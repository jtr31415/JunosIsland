/**
 * The "find the word" round. Ported from v0/junos-words.html:840-971.
 *
 * Every timing constant, class name and DOM shape is the original's. The only
 * changes are dependency injection — see the fourteen permitted changes in the
 * M0 plan. In particular the mash rescue (3 wrongs -> 1800ms lock + slow
 * re-read) is field-tested behaviour, not a guess.
 */
import { plainWord, parseMark, markDigraphs } from '../core/segmentation'
import { defaultRng, shuffle } from '../core/rng'
import type { ReadPick } from '../core/generators/read'
import type { ChallengeDeps, ChallengeHandle } from './mount'

export function mountWordFind(picks: ReadPick[], deps: ChallengeDeps): ChallengeHandle {
  // Renderer-owned state (v0:840-842). fredToken has no role here, but the
  // teardown must still cancel this mount's pending timer and speech.
  let round = {
    order: shuffle(defaultRng, picks.map((_, i) => i)),
    ti: 0,
    wrongs: 0,
    picks,
    els: [] as HTMLElement[],
  }
  let roundTimer: ReturnType<typeof setTimeout> | null = null
  let torn = false

  const box = deps.el
  box.classList.remove('maths', 'build')
  box.innerHTML = ''

  const ws = Math.max(6.5, 19 - picks.length * 1.05)
  // Deliberately writes to the ROOT element, not the container (v0:857).
  document.documentElement.style.setProperty('--ws', ws + 'vmin')

  const currentWord = (): string => plainWord(round.picks[round.order[round.ti] as number]!.w)

  const speakTarget = (): void => {
    if (torn || !deps.isActive() || round.ti >= round.order.length) return
    if (Date.now() < deps.holds.quietUntil()) {
      roundTimer = setTimeout(speakTarget, deps.holds.quietUntil() - Date.now() + 200)
      return
    }
    const w = currentWord()
    const ok = deps.speech.speak(w)
    if (!ok) {
      /* no UK voice available: show the word to find instead */
      deps.showTarget('Find: <b>' + w + '</b>')
      if (!deps.speech.noticeShown()) {
        deps.speech.markNoticeShown()
        deps.toast('No UK English voice on this device — showing the word instead')
      }
    }
  }

  const wordTap = (i: number): void => {
    if (torn || !deps.isActive() || round.ti >= round.order.length) return
    if (Date.now() < deps.holds.inputLock()) return
    const el = round.els[i] as HTMLElement
    if (el.classList.contains('found')) return
    if (i === round.order[round.ti]) {
      round.wrongs = 0
      el.classList.add('found')
      el.style.pointerEvents = 'none'
      deps.flyToScore(el)
      deps.sfx.play('up')
      round.ti++
      if (round.ti >= round.order.length) deps.celebrate()
      else roundTimer = setTimeout(() => speakTarget(), 800)
    } else {
      el.animate(
        [{ translate: '0 0' }, { translate: '-7px 0' }, { translate: '7px 0' },
         { translate: '-5px 0' }, { translate: '0 0' }],
        { duration: 340, easing: 'ease-in-out' })
      deps.sfx.play('bump')
      deps.onWrong()
      if (++round.wrongs >= 3) {
        /* button-mashing detected: brief pause, then the word again, slowly */
        round.wrongs = 0
        deps.holds.lockInput(Date.now() + 1800)
        deps.toast('Listen carefully \u{1F442}')
        roundTimer = setTimeout(() => {
          if (deps.isActive()) deps.speech.speak(currentWord(), 0.6)
        }, 500)
      } else {
        roundTimer = setTimeout(() => speakTarget(), 650)
      }
    }
  }

  picks.forEach((p, i) => {
    const s = document.createElement('span')
    s.className = 'word ' + p.cls
    parseMark(p.w).forEach(sg => {
      if (sg.k === 'tricky') {
        const sp = document.createElement('span')
        sp.className = 'tk'
        sp.textContent = sg.txt
        s.appendChild(sp)
      } else {
        markDigraphs(sg.txt).forEach(d => {
          const sp = document.createElement('span')
          if (d.k === 'di') sp.className = 'di'
          sp.textContent = d.txt
          s.appendChild(sp)
        })
      }
    })
    s.style.setProperty('--rot', (defaultRng() * 8 - 4).toFixed(1) + 'deg')
    s.style.animationDelay = (i * 0.06) + 's, ' + (defaultRng() * 2).toFixed(2) + 's'
    s.style.pointerEvents = 'auto'
    s.addEventListener('pointerdown', ev => { ev.stopPropagation(); wordTap(i) })
    round.els.push(s)
    box.appendChild(s)
  })

  roundTimer = setTimeout(() => speakTarget(), 900 + picks.length * 60)

  return {
    /* btnSay (v0:2086): repeat the target, leaving found words untouched. */
    sayAgain: () => { if (roundTimer) clearTimeout(roundTimer); speakTarget() },
    teardown: () => {
      torn = true
      if (roundTimer) { clearTimeout(roundTimer); roundTimer = null }
      deps.speech.cancel()
      deps.hideTarget()
      box.innerHTML = ''
    },
  }
}
