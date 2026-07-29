/**
 * The number-pad sum round. Ported from v0/junos-words.html:1010-1158.
 *
 * The pad is a number track: 0 apart, then 1-10 with 11-20 aligned directly
 * beneath so the +10 pattern is visible, fives colour-blocked to match the
 * counting-dot groups. The battery gate that sat inside the auto-advance
 * (v0:1127-1128) is the one sanctioned deletion — brief section 4 retires it.
 */
import { defaultRng } from '../core/rng'
import type { SumItem } from '../core/generators/sums'
import type { ChallengeDeps, ChallengeHandle } from './mount'

/**
 * @param debut The very first take-away this child has ever been dealt, so the
 *   minus sign is a glyph she has not met — runA.md:236, *"dealt MIXED with the
 *   minus sign popping on debut"*. It pops ONCE, on the sign only, and it is
 *   the host that knows whether this is the debut (see `main.ts`'s deal site);
 *   this module is only told. Ignored on an addition, because there is nothing
 *   new about a plus.
 */
export function mountSum(
  p: SumItem, deps: ChallengeDeps, debut = false,
): ChallengeHandle {
  let roundTimer: ReturnType<typeof setTimeout> | null = null
  let torn = false

  const box = deps.el
  box.classList.remove('build')
  box.classList.add('maths')
  box.innerHTML = ''
  document.documentElement.style.setProperty('--ws', '12vmin')

  const pill = (txt: string | number, cls: string): HTMLElement => {
    const el = document.createElement('span')
    el.className = 'word ' + cls
    el.textContent = String(txt)
    el.style.setProperty('--rot', (defaultRng() * 6 - 3).toFixed(1) + 'deg')
    return el
  }
  const op = (t: string): HTMLElement => {
    const el = document.createElement('span')
    el.className = 'op'
    el.textContent = t
    return el
  }

  const A = pill(p.a, 'blue'), B = pill(p.b, 'blue'), ANS = pill('?', 'mystery')
  /*
   * U+2212 MINUS SIGN, not a hyphen, and it pops the first time she meets it.
   *
   * The pop is one CSS animation on the glyph itself and nothing else: no
   * toast, no held input, no beat she has to sit through. runA.md:236 asks for
   * the sign to be INTRODUCED rather than explained, and a symbol that moves
   * once is how a five-year-old is told "this one is new" without a sentence.
   * The `=` never pops — she has seen that on every sum she has ever done.
   */
  const sign = op(p.op === 'add' ? '+' : '−')
  if (debut && p.op === 'sub') sign.classList.add('op-debut')
  box.append(A, sign, B, op('='), ANS)

  const answer = p.op === 'add' ? p.a + p.b : p.a - p.b
  let solved = false, wrongs = 0
  const dotOpeners: Array<() => void> = []
  const pad = document.createElement('div')

  const helper = (n: number, col: string): HTMLElement => {
    const h = document.createElement('div')
    h.className = 'helper'
    h.style.gridColumn = col
    h.style.gridRow = '2'
    const chip = (): void => {
      h.innerHTML = ''
      const c = document.createElement('div')
      c.className = 'qchip'
      c.textContent = '?'
      h.appendChild(c)
    }
    const dots = (): void => {
      h.innerHTML = ''
      const d = document.createElement('div')
      d.className = 'dotbox'
      for (let i = 0; i < n; i++) {
        const dt = document.createElement('span')
        dt.className = 'dot ' + (Math.floor(i / 5) % 2 === 0 ? 'o' : 'b')
        d.appendChild(dt)
      }
      h.appendChild(d)
    }
    let shown = false
    /* Opening is the reportable half; closing it again tells the host nothing
       it does not already know, and would double-count a fidget. */
    const open = (): void => { shown = true; dots(); deps.onHelp?.('dots') }
    h.addEventListener('pointerdown', e => {
      e.stopPropagation()
      if (shown) { shown = false; chip() } else open()
    })
    dotOpeners.push(() => { if (!shown) open() })
    chip()
    return h
  }
  box.append(helper(p.a, '1'), helper(p.b, '3'))

  const revealAns = (): void => {
    solved = true
    pad.classList.add('done')
    ANS.textContent = String(answer)
    ANS.classList.remove('mystery')
    ANS.classList.add('blue')
    ANS.style.animation = 'none'; void ANS.offsetWidth; ANS.style.animation = ''
    const r = ANS.getBoundingClientRect()
    deps.burst(r.left + r.width / 2, r.top + r.height / 2)
  }

  /* the grey ? still reveals, but earns nothing — peeking is free, not profitable */
  ANS.style.pointerEvents = 'auto'
  ANS.addEventListener('pointerdown', e => {
    e.stopPropagation()
    if (solved) return
    revealAns()
    deps.sfx.play('win')
    /* Reported AFTER the reveal, so a host that reacts sees the round already
       inert. It earns nothing here and it is counted as nothing upstairs —
       Joe's ruling, JT-008(1): a peeked sum is no attempt at all. */
    deps.onHelp?.('peek')
  })

  pad.className = 'numpad'
  pad.style.gridColumn = '1 / -1'
  pad.style.gridRow = '3'

  const mkChip = (n: number): HTMLElement => {
    const c = document.createElement('span')
    c.className = 'nchip ' + (n === 0 ? 'zero'
      : (Math.floor((n - 1) / 5) % 2 === 0 ? 'five-a' : 'five-b'))
    c.textContent = String(n)
    c.style.animationDelay = (n * 0.02) + 's'
    c.addEventListener('pointerdown', e => {
      e.stopPropagation()
      if (torn || solved || Date.now() < deps.holds.inputLock()) return
      if (n === answer) {
        wrongs = 0
        c.classList.add('hit')
        revealAns()
        deps.flyToScore(c)       /* the star landing banks the point */
        deps.sfx.play('win')
        /* auto-advance to the next sum, waiting out any reward show plus its
           one-second breath */
        const adv = (): void => {
          if (torn || !deps.isActive()) return
          if (Date.now() < deps.holds.rewardUntil()) {
            roundTimer = setTimeout(adv, deps.holds.rewardUntil() - Date.now() + 60)
            return
          }
          deps.onAdvance()
        }
        roundTimer = setTimeout(adv, deps.advanceDelay ?? 2000)
      } else {
        c.animate(
          [{ translate: '0 0' }, { translate: '-6px 0' }, { translate: '6px 0' },
           { translate: '-4px 0' }, { translate: '0 0' }],
          { duration: 300, easing: 'ease-in-out' })
        deps.sfx.play('bump')
        deps.onWrong()
        if (++wrongs >= 3) {
          /* button-mashing detected: pause the pad and open the counting dots */
          wrongs = 0
          deps.holds.lockInput(Date.now() + 2000)
          dotOpeners.forEach(f => f())
          deps.toast('Count the dots! \u{1F440}')
          deps.sfx.play('down')
        }
      }
    })
    return c
  }

  const zrow = document.createElement('div')
  zrow.className = 'zrow'
  zrow.appendChild(mkChip(0))
  const tgrid = document.createElement('div')
  tgrid.className = 'tgrid'
  for (let n = 1; n <= 20; n++) tgrid.appendChild(mkChip(n))
  pad.append(zrow, tgrid)
  box.appendChild(pad)

  return {
    /* btnSay is hidden in maths modes (v0:2045), so there is nothing to repeat. */
    sayAgain: () => {},
    teardown: () => {
      torn = true
      if (roundTimer) { clearTimeout(roundTimer); roundTimer = null }
      deps.speech.cancel()
      deps.hideTarget()
      box.innerHTML = ''
    },
  }
}
