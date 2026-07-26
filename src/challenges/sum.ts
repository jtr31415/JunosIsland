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
import type { ChallengeDeps, Teardown } from './mount'

export function mountSum(p: SumItem, deps: ChallengeDeps): Teardown {
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
  box.append(A, op(p.op === 'add' ? '+' : '−'), B, op('='), ANS)

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
    h.addEventListener('pointerdown', e => {
      e.stopPropagation()
      shown = !shown
      shown ? dots() : chip()
    })
    dotOpeners.push(() => { if (!shown) { shown = true; dots() } })
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
        roundTimer = setTimeout(adv, 2000)
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

  return () => {
    torn = true
    if (roundTimer) { clearTimeout(roundTimer); roundTimer = null }
    deps.speech.cancel()
    deps.hideTarget()
    box.innerHTML = ''
  }
}
