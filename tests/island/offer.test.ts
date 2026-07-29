/** @vitest-environment jsdom */
/**
 * Run B's offer surface: the panel that asks her, and the wire it hangs on.
 *
 * WHY THIS FILE IS SHAPED THE WAY IT IS. `docs/HANDOFF.md:588-601` records
 * that the plot/flow seam produced three faults in two days that no unit test
 * on either side could see, because each side was individually correct and
 * only their AGREEMENT was wrong. The offer is the same shape: `harness.ts`
 * decides that an offer is due and `overlay.ts` renders one, and every fault
 * worth catching lives between them — a panel that renders the wrong kind, a
 * yes that never reaches `noteOffer`, a tick that is never written down.
 *
 * So the centrepiece here drives BOTH SIDES FOR REAL, in the manner of
 * `fred.test.ts`'s `no child is ever read a placeholder — JT-019`: a real
 * `createHarness(createAttainment())` walked into a state where `pendingOffer()`
 * actually returns, the real `createOverlay(...).offer(...)` mounted in jsdom,
 * a real button tapped, and then the HARNESS asked whether anything moved.
 * Nothing here is mocked except the speaker and the sound.
 *
 * `main.ts` cannot be imported (it boots a WebGL island), so the wiring itself
 * is pinned by source text, the way `stretch.test.ts:505-523` pins the stretch
 * handover.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOverlay } from '../../src/island/overlay'
import type { Overlay, OverlayHost } from '../../src/island/overlay'
import { createAttainment, createHarness } from '../../src/island/harness'
import type { Attainment, Harness, Offer, Path } from '../../src/island/harness'
import type { AttemptEvent } from '../../src/island/attempts'
import type { SumItem } from '../../src/core/generators/sums'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string): string => readFileSync(resolve(here, rel), 'utf8')

/* ------------------------------------------------------------ the wording */

/**
 * The two lines, as bytes.
 *
 * Written out here rather than imported, because the point of every assertion
 * below is that four places hold the same string: this file, `main.ts`,
 * `voice/scripts.json` and the spec. Importing one of them would make the test
 * agree with itself.
 */
const TRICKIER =
  'You are doing really well! Would you like some trickier questions? They will get you eggs and tiles faster.'
const TAKING_AWAY = 'Would you like to do some taking away?'

const LINE_FOR: Record<Offer['kind'], string> = {
  trickier: TRICKIER,
  takingAway: TAKING_AWAY,
}

/* -------------------------------------------------------------- the rig */

function setup() {
  const root = document.createElement('div')
  document.body.append(root)

  const spoken: string[] = []
  const host = {
    speech: {
      speak: vi.fn((t: string) => { spoken.push(t); return true }),
      ready: () => true,
      cancel: vi.fn(),
      noticeShown: vi.fn(() => false),
      markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    onPassed: vi.fn(),
    onDismissed: vi.fn(),
    onAttempt: vi.fn(),
  } satisfies OverlayHost

  const overlay: Overlay = createOverlay(root, host)
  return { root, host, overlay, spoken }
}

beforeEach(() => {
  // v0:956 scores inside an Animation's onfinish; jsdom has no WAAPI.
  Element.prototype.animate = vi.fn(() => ({ onfinish: null })) as never
})

afterEach(() => { document.body.innerHTML = '' })

/** The panel's own bits, once `offer()` has put them up. */
const panelOf = (root: HTMLElement) => ({
  box: root.querySelector('.ask-offer') as HTMLElement | null,
  wrap: root.querySelector('.ask-offer')?.parentElement as HTMLElement | null,
  text: root.querySelector('.ask-offer-text') as HTMLElement | null,
  yes: root.querySelector('.ask-offer-yes') as HTMLButtonElement | null,
  no: root.querySelector('.ask-offer-no') as HTMLButtonElement | null,
})

/** A tap, as a browser delivers one to a button. */
const tap = (el: Element | null): void => {
  el?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  el?.dispatchEvent(new Event('pointerup', { bubbles: true }))
  el?.dispatchEvent(new Event('click', { bubbles: true }))
}

/* ------------------------------------------------------- the real island */

const right: AttemptEvent = {
  kind: 'sum', index: 0, correct: true, latencyMs: 1000,
  helped: false, rescued: false, at: 0,
}

interface Island { a: Attainment; h: Harness; on(day: string): void }

const island = (): Island => {
  const a = createAttainment()
  let today = '2026-07-01'
  const h = createHarness(a, () => Date.parse(`${today}T09:00:00Z`))
  return { a, h, on: (d: string) => { today = d } }
}

/** Twenty right answers on sums 1 across two days: the mastery half of B's gate. */
function masterSums1(it: Island): void {
  it.h.dealt('sums', 1)
  for (const d of ['2026-07-01', '2026-07-02']) {
    it.on(d)
    for (let i = 0; i < 10; i++) it.h.recordAttempt({ ...right })
  }
}

/**
 * An island with the TAKING-AWAY introduction standing.
 *
 * Nothing is written in by hand: `takingAway` 1 is unticked because that is
 * how an island starts, and the gate is passed by answering real questions
 * through the real harness. If `pendingOffer` and this recipe ever come apart,
 * the `expect` below is what says so.
 */
function introReady(): Island {
  const it = island()
  masterSums1(it)
  it.on('2026-07-03')
  expect(it.h.pendingOffer()).toEqual(
    { path: 'takingAway', stage: 1, kind: 'takingAway' })
  return it
}

/**
 * ...and one with the TRICKIER offer standing, on `sums` 3 — the ladder is [1, 3, 2], so the rung above 1 is 3.
 *
 * `takingAway` 1 is ticked up front deliberately: its introduction outranks a
 * trickier offer (harness.ts:818-842), so leaving it open would mean this
 * function quietly produced the other kind.
 */
function trickierReady(): Island {
  const it = island()
  it.a.takingAway.stages[1]!.ticked = true
  masterSums1(it)
  it.h.dealt('sums', 3, true)
  for (let i = 0; i < 8; i++) it.h.recordAttempt({ ...right, correct: i < 7 })
  it.h.dealt('sums', 1)
  it.on('2026-07-03')
  expect(it.h.pendingOffer()).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
  return it
}

/**
 * THE FIVE STEPS, exactly as `main.ts` performs them.
 *
 * Ask once, render whatever came back, collect the answer, hand it BACK to the
 * harness against `due.path`. Nothing is re-derived in between — that absence
 * is the thing the source assertions further down defend, and this is the
 * thing that proves the sequence works when it is honoured.
 */
async function putTheOffer(
  h: Harness, overlay: Overlay, speak: (t: string) => void,
): Promise<Offer | null> {
  const due = h.pendingOffer()
  if (due === null) return null
  const line = LINE_FOR[due.kind]
  speak(line)
  const accepted = await overlay.offer(line)
  h.noteOffer(due.path, accepted)
  return due
}

/* ================================================================== tests */

describe('the offer the harness makes is the offer she is shown — B2', () => {
  it('renders the trickier line, and a yes ticks the stage it was about', async () => {
    const { root, overlay, spoken, host } = setup()
    const it = trickierReady()

    const run = putTheOffer(it.h, overlay, t => { host.speech.speak(t) })
    await Promise.resolve()

    const p = panelOf(root)
    expect(p.text?.textContent).toBe(TRICKIER)
    expect(spoken).toEqual([TRICKIER])

    tap(p.yes)
    const due = await run

    expect(due).toEqual({ path: 'sums', stage: 3, kind: 'trickier' })
    // The harness MOVED: the rung she was offered is now hers, and the
    // honeymoon marker the economy reads is stamped.
    expect(it.a.sums.stages[3]!.ticked).toBe(true)
    expect(it.h.honeymoonActive('sums')).toBe(true)
    // ...and there is nothing left standing, because one offer is a session.
    expect(it.h.pendingOffer()).toBeNull()
    // The panel took itself down.
    expect(panelOf(root).box).toBeNull()
  })

  it('renders the taking-away line, and a yes opens subtraction', async () => {
    const { root, overlay, spoken, host } = setup()
    const it = introReady()

    const run = putTheOffer(it.h, overlay, t => { host.speech.speak(t) })
    await Promise.resolve()

    expect(panelOf(root).text?.textContent).toBe(TAKING_AWAY)
    expect(spoken).toEqual([TAKING_AWAY])

    tap(panelOf(root).yes)
    const due = await run

    expect(due).toEqual({ path: 'takingAway', stage: 1, kind: 'takingAway' })
    expect(it.a.takingAway.stages[1]!.ticked).toBe(true)
    expect(it.h.honeymoonActive('takingAway')).toBe(true)
    // Her first take-away has not happened yet, which is what makes the next
    // one a debut. See the pop tests below.
    expect(it.a.takingAway.stages[1]!.attempts).toBe(0)
  })

  it('costs her nothing when she says no, and buys two sessions of quiet', async () => {
    const { root, overlay } = setup()
    const it = trickierReady()
    const before = JSON.stringify(it.a.sums.stages[3])

    const run = putTheOffer(it.h, overlay, () => {})
    await Promise.resolve()
    tap(panelOf(root).no)
    await run

    // NOTHING TICKED, nothing recorded against her, no stat moved (runA.md:231).
    expect(it.a.sums.stages[3]!.ticked).toBe(false)
    expect(JSON.stringify(it.a.sums.stages[3])).toBe(before)
    expect(it.h.honeymoonActive('sums')).toBe(false)

    // The only thing a decline writes is the cooldown.
    expect(it.a.sums.offer.declinedDay).toBe('2026-07-03')
    expect(it.a.sums.offer.daysSinceDecline).toBe(0)
    expect(it.h.pendingOffer()).toBeNull()

    // ...and it is still quiet on the next day she plays, which is the whole
    // point of a cooldown counted in sessions.
    it.on('2026-07-04')
    expect(it.h.pendingOffer()).toBeNull()
  })

  it('is one question, never two — the second offer waits for another session',
    async () => {
      const { root, overlay } = setup()
      const it = introReady()

      const run = putTheOffer(it.h, overlay, () => {})
      await Promise.resolve()
      tap(panelOf(root).yes)
      await run

      /*
       * Subtraction has just opened, and `sums` 2 is standing behind it — but
       * asking both in one sitting is the sales pitch harness.ts:809-813
       * refuses to make, and the second question is the one a tired
       * five-year-old says yes to just to make it stop.
       */
      expect(await putTheOffer(it.h, overlay, () => {})).toBeNull()
      expect(panelOf(root).box).toBeNull()
    })

  it('cannot be answered by a stale panel', async () => {
    /*
     * A double tap, a replayed event, a panel left over from a previous
     * moment: `noteOffer` re-resolves against `pendingOffer()`, so the second
     * answer must find nothing to spend. Driven through the real surface
     * because that is where the duplicate would come from.
     */
    const { root, overlay } = setup()
    const it = trickierReady()

    const run = putTheOffer(it.h, overlay, () => {})
    await Promise.resolve()
    tap(panelOf(root).yes)
    await run

    const ticked = JSON.stringify(it.a.sums)
    it.h.noteOffer('sums', false)
    expect(JSON.stringify(it.a.sums)).toBe(ticked)
  })
})

describe('the panel itself — nothing expires and nothing defaults', () => {
  it('shows both answers as words she can read', async () => {
    const { root, overlay } = setup()
    void overlay.offer(TAKING_AWAY)
    await Promise.resolve()
    const p = panelOf(root)
    expect(p.yes?.textContent).toBe('Yes please!')
    expect(p.no?.textContent).toBe('Not now')
  })

  it('dresses the two answers as equals, not as a choice and a consolation', async () => {
    /*
     * `.overlay-back` — what `askName`'s skip button uses — is 75% opacity and
     * a smaller font. A decline costs her nothing (runA.md:231), so the screen
     * must not imply she has picked the disappointing button.
     */
    const { root, overlay } = setup()
    void overlay.offer(TAKING_AWAY)
    await Promise.resolve()
    const p = panelOf(root)
    for (const b of [p.yes, p.no]) {
      expect(b?.classList.contains('chunk-button')).toBe(true)
      expect(b?.classList.contains('ask-offer-choice')).toBe(true)
      expect(b?.classList.contains('overlay-back')).toBe(false)
      expect(b?.classList.contains('overlay-again')).toBe(false)
    }
    const css = read('../../src/ui/tokens.css')
    expect(css).toContain('.ask-offer-choice')
    // One rule sizes both, so they cannot drift apart.
    expect(css).toMatch(/\.ask-offer-choice\s*\{[^}]*font-size/)
    expect(css).not.toMatch(/\.ask-offer-no\s*\{[^}]*opacity/)
  })

  it('carries its own question, because .say is hidden under a panel', async () => {
    /*
     * `body:has(.overlay:not(.hide)) .say { display: none }` blanks Fred's
     * card for exactly as long as any panel is up. A question asked through
     * `say()` would therefore be invisible for precisely the time its own
     * buttons were on screen — the fault that cost the tile offer a day.
     */
    const { root, overlay } = setup()
    void overlay.offer(TRICKIER)
    await Promise.resolve()
    const box = panelOf(root).box
    expect(box?.textContent).toContain(TRICKIER)
    expect(box?.closest('.overlay')).not.toBeNull()
    expect(read('../../src/ui/tokens.css'))
      .toContain('body:has(.overlay:not(.hide)) .say')
  })

  it('does NOT resolve on a backdrop tap — a decline is a real answer', async () => {
    /*
     * The deliberate divergence from `askName`, which dismisses on the
     * backdrop. A decline buys two sessions of silence on a path; a palm
     * landing on the dim area beside the panel, or a stray tap left over from
     * the ceremony that just ended, must not be able to spend it.
     */
    const { root, overlay } = setup()
    const answers: boolean[] = []
    const p = overlay.offer(TRICKIER).then(v => { answers.push(v); return v })
    await Promise.resolve()

    const wrap = panelOf(root).wrap as HTMLElement
    expect(wrap.classList.contains('overlay')).toBe(true)
    tap(wrap)
    tap(document.body)
    await Promise.resolve()
    await Promise.resolve()

    // Nothing answered, and the panel is still there waiting.
    expect(answers).toEqual([])
    expect(panelOf(root).box).not.toBeNull()

    // Only the buttons resolve it.
    tap(panelOf(root).no)
    expect(await p).toBe(false)
    expect(panelOf(root).box).toBeNull()
  })

  it('sets no timer, so nothing can answer for her', async () => {
    vi.useFakeTimers()
    try {
      const { root, overlay } = setup()
      const answers: boolean[] = []
      void overlay.offer(TRICKIER).then(v => answers.push(v))
      await Promise.resolve()

      vi.advanceTimersByTime(10 * 60 * 1000)
      await Promise.resolve()

      expect(answers).toEqual([])
      expect(panelOf(root).box).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('the wording is the spec\'s, to the byte', () => {
  /**
   * The spec paragraph, unwrapped.
   *
   * `docs/pet-island-runA.md:230-236` hard-wraps at about 68 columns and marks
   * the quotations with `*`, so the sentence has to be reassembled before it
   * can be compared. Everything else is left exactly as written — this is a
   * byte comparison, not a fuzzy one.
   */
  const spec = read('../../docs/pet-island-runA.md')
    .split('\n').join(' ').replace(/\*/g, '')

  it('quotes runA.md:230-232 for the trickier offer', () => {
    expect(spec).toContain(TRICKIER)
  })

  it('quotes runA.md:234-235 for the taking-away offer', () => {
    expect(spec).toContain(TAKING_AWAY)
  })

  it('is the wording main.ts actually speaks', () => {
    const main = read('../../src/island/main.ts')
    expect(main).toContain(`'${TRICKIER}'`)
    expect(main).toContain(`'${TAKING_AWAY}'`)
  })

  it('has an entry in voice/scripts.json for both, verbatim', () => {
    // voice/scripts.json's own first rule (voice.md §5.1): no spoken line
    // reaches the island without an entry here.
    const scripts = JSON.parse(read('../../voice/scripts.json')) as
      { lines: Array<{ id: string; character: string; text?: string }> }
    const texts = scripts.lines.map(l => l.text)
    expect(texts, 'the trickier offer has no entry').toContain(TRICKIER)
    expect(texts, 'the taking-away offer has no entry').toContain(TAKING_AWAY)
    // One voice asks both. Fred is the island's host; the teacher owns words
    // and names, and an offer is neither.
    for (const t of [TRICKIER, TAKING_AWAY]) {
      expect(scripts.lines.find(l => l.text === t)?.character).toBe('fred')
    }
  })

  it('leaves no slot in either — an offer is a whole line', () => {
    // Nothing to splice, so nothing to get wrong at speak time (JT-019).
    for (const t of [TRICKIER, TAKING_AWAY]) expect(t).not.toMatch(/[{}|]/)
  })
})

describe('main.ts puts it at the completion high, and re-derives nothing', () => {
  const source = read('../../src/island/main.ts')
  /** Comments stripped, so prose about a rule is never mistaken for the rule. */
  const code = source
    .split('\n')
    .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
    .join('\n')

  const indicesOf = (hay: string, needle: string): number[] => {
    const out: number[] = []
    for (let i = hay.indexOf(needle); i >= 0; i = hay.indexOf(needle, i + 1)) out.push(i)
    return out
  }

  const calls = indicesOf(code, 'await putTheOffer()')
  const ceremonies = indicesOf(code, 'await ceremony(')

  it('offers on both completion paths, and only there', () => {
    expect(ceremonies).toHaveLength(2)
    expect(calls).toHaveLength(2)
    // One in the reading branch, one in the maths branch.
    const split = code.indexOf("} else if (flow.challenge === 'sum') {")
    expect(split).toBeGreaterThan(-1)
    expect(calls[0] as number).toBeLessThan(split)
    expect(calls[1] as number).toBeGreaterThan(split)
  })

  it('waits until AFTER the ceremony, never inside it', () => {
    /*
     * `ceremony()` locks the island's exits for the length of its body. An
     * offer with no timer behind it, asked in there, would hold them shut
     * until she answered — a lock on a child, which brief §19 forbids.
     */
    for (const at of ceremonies) {
      const close = code.indexOf('\n        })', at)
      expect(close).toBeGreaterThan(at)
      expect(code.slice(at, close), 'an offer inside a ceremony holds the exits')
        .not.toContain('putTheOffer')
    }
    for (const [i, at] of ceremonies.entries()) {
      expect(calls[i] as number).toBeGreaterThan(code.indexOf('\n        })', at))
    }
  })

  it('lets the opening resume win — Fred is mid-sentence', () => {
    const at = code.indexOf('void runOpening(at) }, 2200)')
    expect(at).toBeGreaterThan(-1)
    const after = code.slice(at, at + 300)
    expect(after).toContain('} else {')
    expect(after.indexOf('await putTheOffer()'))
      .toBeGreaterThan(after.indexOf('} else {'))
  })

  it('never chases the offer with a stretch — two questions is a sales pitch', () => {
    for (const at of calls) {
      expect(code.slice(at, at + 80), 'something follows the offer in the same breath')
        .toMatch(/await putTheOffer\(\)\s*\}?\s*return/)
    }
    // ...and the three stretch call sites are untouched: the declaration plus
    // the three deliveries stretch.test.ts counts.
    expect(code.match(/offerAStretch\(\)/g) ?? []).toHaveLength(4)
  })

  it('answers with the offer that was due, not with a literal', () => {
    expect(code).toMatch(/harness\.noteOffer\(\s*due\.path\s*,\s*accepted\s*\)/)
    expect(code, 'a hard-coded path cannot be the offer that was actually made')
      .not.toMatch(/noteOffer\(\s*['"]/)
  })

  const helper = code.slice(code.indexOf('async function putTheOffer()'))
  const body = helper.slice(0, helper.indexOf('\n  }'))

  it('asks the harness once and re-derives NOTHING', () => {
    expect(body.length).toBeGreaterThan(100)
    expect(body).toContain('harness.pendingOffer()')
    /*
     * `pendingOffer()` is COMPLETE on its own — priority, cadence, the
     * two-session cooldown, one-offer-per-session island-wide and the Auto
     * check are all inside it. A second copy of any of those out here would be
     * two sets of rules that have to agree, which is HANDOFF §5's four-time
     * offender. So the absence is asserted as hard as the presence.
     */
    for (const banned of [
      'offerDue', 'cadence', 'mode', 'session', 'lastOfferDay', 'declinedDay',
      'daysSinceDecline', 'honeymoonActive', 'probeWanted', 'dayKey', 'clock.now',
      'attainment[', 'levelFor', 'setTicked',
    ]) {
      expect(body, `putTheOffer re-derives \`${banned}\``).not.toContain(banned)
    }
    // Exactly two words with the harness: what is due, and what she said.
    expect(body.match(/harness\./g) ?? []).toHaveLength(2)
  })

  it('returns immediately when nothing is due', () => {
    expect(body).toMatch(/if \(due === null\) return/)
  })

  it('persists the tick, or her yes dies with the tab', () => {
    /*
     * THE MOST LIKELY THING TO BE SILENTLY WRONG. An accepted offer ticks a
     * stage and stamps the honeymoon, and both live in `attainment` — a write
     * that never happens looks perfect for the rest of the session and is gone
     * on reload.
     *
     * Through `commit` on the attainment record, exactly as the grown-ups
     * panel's ticks are (main.ts's `learning()`), and NOT through
     * `commitState()`: barrier.test.ts counts those receipts one-for-one
     * against ceremonies, and an offer is not one.
     */
    expect(body).toContain('await commit(attainment, () => persist())')
    expect(body).not.toContain('commitState')
    expect(body).not.toContain('void persist()')
    // ...and after the answer, never before it.
    expect(body.indexOf('await commit('))
      .toBeGreaterThan(body.indexOf('harness.noteOffer('))
  })

  it('shows the line as well as speaking it', () => {
    expect(body).toContain('speech.speak(line)')
    expect(body).toContain('await overlay.offer(line)')
    expect(body.indexOf('speech.speak(line)'))
      .toBeLessThan(body.indexOf('await overlay.offer(line)'))
  })
})

describe('the minus sign pops on debut — runA.md:236', () => {
  const SUB: SumItem = { a: 5, b: 2, op: 'sub' }
  const ADD: SumItem = { a: 2, b: 3, op: 'add' }
  const MINUS = '−'

  const opsOf = (root: HTMLElement): HTMLElement[] =>
    [...root.querySelectorAll('.op')] as HTMLElement[]
  const glyph = (root: HTMLElement, ch: string): HTMLElement | undefined =>
    opsOf(root).find(o => o.textContent === ch)

  it('draws a real minus sign, not a hyphen', () => {
    const { root, overlay } = setup()
    overlay.openSum(SUB, false, true)
    expect(glyph(root, MINUS)).toBeDefined()
    expect(glyph(root, '-')).toBeUndefined()
  })

  it('pops the minus, and only the minus', () => {
    const { root, overlay } = setup()
    overlay.openSum(SUB, false, true)
    expect(glyph(root, MINUS)?.classList.contains('op-debut')).toBe(true)
    // The equals sign is not news. She has seen one on every sum she has done.
    expect(glyph(root, '=')?.classList.contains('op-debut')).toBe(false)
    expect(opsOf(root).filter(o => o.classList.contains('op-debut'))).toHaveLength(1)
  })

  it('does not pop on the take-aways after the first', () => {
    const { root, overlay } = setup()
    overlay.openSum(SUB)
    expect(glyph(root, MINUS)?.classList.contains('op-debut')).toBe(false)
  })

  it('does not pop a plus, whatever it is told', () => {
    // There is nothing new about a `+`, and a debut flag that leaked onto one
    // would be the island making a fuss about a sum she has done a hundred of.
    const { root, overlay } = setup()
    overlay.openSum(ADD, false, true)
    expect(glyph(root, '+')?.classList.contains('op-debut')).toBe(false)
  })

  it('has one animation behind it, on the island\'s own easing', () => {
    const css = read('../../src/ui/tokens.css')
    expect(css).toContain('@keyframes op-debut-pop')
    expect(css).toMatch(/\.op-debut\s*\{\s*animation:\s*op-debut-pop[^}]*var\(--ease-pop\)/)
    /*
     * NOT `hatch-pop`. That one is written for a fixed, centred card and
     * carries `translate(-50%, -50%)` in both of its keyframes, so borrowing
     * it would fling the glyph out of the sum.
     */
    expect(css).not.toMatch(/\.op-debut\s*\{\s*animation:\s*hatch-pop/)
  })

  it('is the FIRST take-away she is ever dealt, read off the real record', () => {
    /*
     * The both-sides half of the pop: `main.ts` decides debut-ness from the
     * attainment record, so the predicate is walked here against a real
     * harness rather than asserted as a string. `dealt()` must not spend it —
     * only an answered question may — or the pop would be gone before the
     * question she was dealt it for.
     */
    const it = introReady()
    const debut = (path: Path): boolean =>
      path === 'takingAway' && (it.a.takingAway.stages[1]?.attempts ?? 0) === 0

    it.h.noteOffer('takingAway', true)
    expect(it.a.takingAway.stages[1]!.ticked).toBe(true)
    expect(debut('takingAway')).toBe(true)

    it.h.dealt('takingAway', 1)
    expect(debut('takingAway'), 'dealing it must not spend the debut').toBe(true)

    it.h.recordAttempt({ ...right })
    expect(debut('takingAway')).toBe(false)
    // ...and an addition is never a debut.
    expect(debut('sums')).toBe(false)
  })

  it('is computed at the deal site and passed through, in main.ts', () => {
    const main = read('../../src/island/main.ts')
    expect(main).toContain("const debut = dealtSum.path === 'takingAway'")
    expect(main).toContain('(attainment.takingAway.stages[1]?.attempts ?? 0) === 0')
    expect(main).toContain('overlay.openSum(item, staged, debut)')
  })
})

describe('the grown-ups panel reads the island\'s own harness', () => {
  it('is handed one rather than building a second', () => {
    /*
     * `LearningDeps.harness` was optional and `grownups.ts` fell back to
     * `createHarness(deps.attainment)`. That is a second harness inside
     * `src/` — barrier.test.ts's *"builds one, in main.ts, and nowhere else in
     * src"* — over a record the first one holds by reference, and it read B's
     * day boundaries off the wall clock instead of the island's.
     */
    const grownups = read('../../src/island/grownups.ts')
    expect(grownups).not.toContain('createHarness')
    expect(grownups).toMatch(/^\s*harness: Harness$/m)
    expect(read('../../src/island/main.ts')).toMatch(/showLearning\(document\.body, \{[\s\S]{0,600}?\n\s+harness,/)
  })
})

describe('the honeymoon reaches the till', () => {
  it('prices a maths round against the path the sum came from', () => {
    /*
     * runA.md:232-233 — *"accept = tick + honeymoon (pay 3, 2 sessions)"*.
     * The harness stamps WHEN and `flow.ts` owns what a round is worth; this
     * one line is the whole join, and it asks about `dealtSum.path` rather
     * than about maths in general, because a honeymoon on `takingAway` must
     * not quietly pay three for addition too.
     */
    const main = read('../../src/island/main.ts')
    expect(main).toContain(
      "flow = challengePassed(flow, undefined, harness.honeymoonActive(dealtSum?.path ?? 'sums'))")
    // Reading pays 2 in a honeymoon or out of one, by ruling (flow.ts:288-299).
    expect(main).not.toMatch(/handleChallengePassed\([^)]*honeymoon/)
  })
})
