/**
 * The number-pad sum round. Ported from v0/junos-words.html:1010-1158.
 *
 * The pad is a number track: 0 apart, then 1-10 with 11-20 aligned directly
 * beneath so the +10 pattern is visible, fives colour-blocked to match the
 * counting-dot groups. The battery gate that sat inside the auto-advance
 * (v0:1127-1128) is the one sanctioned deletion — brief section 4 retires it.
 *
 * PAST TWENTY the track stops being a pad at all. Addition rungs 5-7 (whole
 * tens to a hundred, then two-digit-plus-units either side of a carry) answer
 * above twenty, and a track that stops at twenty does not contain the answer:
 * the child cannot respond, right or wrong. So when the answer needs more than
 * the track can carry, the pad becomes ten DIGIT keys and the answer is spelled
 * out most significant digit first, one `?` per digit until each is found.
 *
 * The two are different objects and carry different classes. A track chip is a
 * QUANTITY — that is what the fives colour-blocking means, and why it matches
 * the counting dots. A digit chip is a SYMBOL standing in a column, where
 * blocking it in fives would be a lie. Hence `.drow`/`.dchip` rather than a
 * bent `.tgrid`; both keep `.nchip`, which is the shell's dead-zone contract
 * (deadzone.ts) and not a look.
 *
 * The switch is decided on the ANSWER and never on a level. This module is
 * handed a, b and op and knows nothing about ladders, which is exactly the
 * property that lets the generators move rungs around without touching it.
 */
import { defaultRng } from '../core/rng'
import type { SumItem } from '../core/generators/sums'
import type { ChallengeDeps, ChallengeHandle } from './mount'

/**
 * @param debut The very first take-away this child has ever been dealt, so
 *   the minus sign is a glyph they have not met — runA.md:236, *"dealt MIXED
 *   with the minus sign popping on debut"*. It pops ONCE, on the sign only,
 *   and it is the host that knows whether this is the debut (see `main.ts`'s
 *   deal site); this module is only told. Ignored on an addition, because
 *   there is nothing new about a plus.
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

  const answer = p.op === 'add' ? p.a + p.b : p.a - p.b
  /*
   * TRACK_TOP is the last answer the 0-20 number track can carry. Above it the
   * digit row takes over, and the answer wears one `?` per digit — normally two
   * (`??`), but `String(answer).length` rather than a hardcoded 2 because rung 5
   * can draw 10 + 90 and a hundred is three columns, not two.
   */
  const TRACK_TOP = 20
  const digits = String(answer).split('')
  const bigAns = answer > TRACK_TOP
  /** How many of `digits`, left to right, the child has found so far. */
  let found = 0

  const A = pill(p.a, 'blue'), B = pill(p.b, 'blue')
  const ANS = pill(bigAns ? '?'.repeat(digits.length) : '?', 'mystery')
  /*
   * U+2212 MINUS SIGN, not a hyphen, and it pops the first time they meet it.
   *
   * The pop is one CSS animation on the glyph itself and nothing else: no
   * toast, no held input, no beat they have to sit through. runA.md:236 asks
   * for the sign to be INTRODUCED rather than explained, and a symbol that
   * moves once is how a five-year-old is told "this one is new" without a
   * sentence. The `=` never pops — they have seen it on every sum ever done.
   */
  const sign = op(p.op === 'add' ? '+' : '−')
  if (debut && p.op === 'sub') sign.classList.add('op-debut')
  box.append(A, sign, B, op('='), ANS)

  let solved = false, wrongs = 0
  /* Each returns whether it actually opened a box — see the mash rescue. */
  const dotOpeners: Array<() => boolean> = []
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
    /*
     * The MASH RESCUE may open this box, but only if it would be a hint.
     *
     * One dot per unit is a rescue at 7 + 5 and a wall at 20 + 30: fifty dots
     * is more counting than the sum was, and it arrives at the moment the child
     * is already floundering. So above DOT_WALL the rescue leaves the box shut
     * — the child may still tap it open themselves, which is a choice rather
     * than something dumped on them, and a lopsided sum still gets its small
     * side opened (34 + 5 shows the five).
     */
    const DOT_WALL = 20
    dotOpeners.push(() => {
      if (shown || n > DOT_WALL) return false
      open()
      return true
    })
    chip()
    return h
  }
  box.append(helper(p.a, '1'), helper(p.b, '3'))

  /** Repaint the part-found answer: the digits so far, then `?` for the rest. */
  const paintAns = (): void => {
    ANS.textContent = digits.slice(0, found).join('') + '?'.repeat(digits.length - found)
  }

  const revealAns = (): void => {
    solved = true
    found = digits.length
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

  /** The whole round is won: reveal, bank the point, queue the next sum. */
  const winRound = (c: HTMLElement): void => {
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
  }

  /** A miss: wobble, bump, tell the host — and rescue a child who is mashing. */
  const missed = (c: HTMLElement): void => {
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
      const opened = dotOpeners.map(f => f()).some(Boolean)
      /* The toast has to match what actually appeared: pointing at dots that
         are not there is worse than not pointing at all. */
      deps.toast(opened ? 'Count the dots! \u{1F440}' : 'Have another think! \u{1F914}')
      deps.sfx.play('down')
    }
  }

  const dead = (): boolean => torn || solved || Date.now() < deps.holds.inputLock()

  const mkChip = (n: number): HTMLElement => {
    const c = document.createElement('span')
    c.className = 'nchip ' + (n === 0 ? 'zero'
      : (Math.floor((n - 1) / 5) % 2 === 0 ? 'five-a' : 'five-b'))
    c.textContent = String(n)
    c.style.animationDelay = (n * 0.02) + 's'
    c.addEventListener('pointerdown', e => {
      e.stopPropagation()
      if (dead()) return
      if (n === answer) winRound(c)
      else missed(c)
    })
    return c
  }

  /**
   * A digit key on the big-answer pad. It answers ONE column, the leftmost one
   * still hidden, so the same key can be right twice in a row (44) and a key
   * that was wrong a moment ago can be right next.
   */
  const drow = document.createElement('div')
  const mkDigit = (n: number): HTMLElement => {
    const c = document.createElement('span')
    c.className = 'nchip dchip'
    c.textContent = String(n)
    c.style.animationDelay = (n * 0.02) + 's'
    c.addEventListener('pointerdown', e => {
      e.stopPropagation()
      if (dead()) return
      /* The previous key's glow belongs to the previous column; clear it before
         anything else so the highlight never reads as two answers at once. */
      drow.querySelectorAll('.hit').forEach(h => h.classList.remove('hit'))
      if (String(n) !== digits[found]) { missed(c); return }
      wrongs = 0
      found++
      if (found >= digits.length) { winRound(c); return }
      /*
       * A digit is not an answer. It gets the chip's hit state and 'up' — the
       * sound the word-builder uses for a letter that lands — and NOT 'win',
       * no star, no burst and no advance: nothing that would tell a child the
       * sum is over when there is another column to go.
       */
      paintAns()
      c.classList.add('hit')
      deps.sfx.play('up')
    })
    return c
  }

  if (bigAns) {
    drow.className = 'drow'
    for (let n = 0; n <= 9; n++) drow.appendChild(mkDigit(n))
    pad.append(drow)
  } else {
    const zrow = document.createElement('div')
    zrow.className = 'zrow'
    zrow.appendChild(mkChip(0))
    const tgrid = document.createElement('div')
    tgrid.className = 'tgrid'
    for (let n = 1; n <= 20; n++) tgrid.appendChild(mkChip(n))
    pad.append(zrow, tgrid)
  }
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
