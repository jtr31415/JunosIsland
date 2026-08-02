/** @vitest-environment jsdom */
/**
 * A4/A6 — the panel where a parent decides what their child is dealt.
 *
 * These tests drive the real DOM, because every rule worth having here is a
 * rule about what is ON SCREEN at a given moment: a tick that has not reached
 * the disk must not be shown as taken, a protected tick must say why it will
 * not come off, and a stage nobody has watched long enough must show dashes
 * rather than a score of nothing.
 *
 * The harness underneath is the REAL one. Its `canUntick` rule is the thing
 * standing between a tap on a plot and nothing happening, and a mock of it
 * would test the mock.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  showLearning, stageLabel, askWipe,
  applyWordColours, CALM_COLOURS_CLASS, WORD_COLOUR_CHOICES,
} from '../../src/island/grownups'
import type { WipeChoice } from '../../src/island/save'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { LearningDeps } from '../../src/island/grownups'
import { createAttainment, createHarness } from '../../src/island/harness'
import type { Attainment, Harness, Mode, Path } from '../../src/island/harness'
import type { AttemptEvent } from '../../src/island/attempts'

afterEach(() => { document.body.innerHTML = '' })

/**
 * The panel's dependencies, over a real harness.
 *
 * `harness` is now ALWAYS handed in, because `LearningDeps` requires it: the
 * panel used to build its own when the field was left out, which meant a
 * second `createHarness` inside `src/` (forbidden by barrier.test.ts) reading
 * B's day boundaries off the wall clock instead of the island's. The `wired`
 * argument is now only about WHICH island — a fresh one, or one whose gate has
 * already fired.
 */
function makeDeps(wired?: { attainment: Attainment; harness: Harness }) {
  const attainment = wired?.attainment ?? createAttainment()
  const harness = wired?.harness ?? createHarness(attainment)
  /** Which writer was called, in the order the panel called it. */
  const order: string[] = []

  const deps: LearningDeps = {
    attainment,
    harness,
    setTicked: vi.fn((p: Path, s: number, t: boolean) => {
      order.push('setTicked')
      return harness.setTicked(p, s, t)
    }),
    canUntick: vi.fn((p: Path, s: number) => harness.canUntick(p, s)),
    setMode: vi.fn((p: Path, m: Mode) => {
      order.push('setMode')
      return harness.setMode(p, m)
    }),
    persist: vi.fn(() => { order.push('persist'); return Promise.resolve() }),
    stageLabel,
  }
  return { deps, attainment, harness, order }
}

/**
 * An island where B's gate has actually fired: twenty right answers on sums 1
 * across two days, so subtraction's introduction is standing on the third.
 *
 * Reached by answering questions through the real harness rather than by
 * writing the offer in by hand — the whole point of the line is that it and the
 * gate cannot come apart.
 */
function offered() {
  const attainment = createAttainment()
  let today = '2026-07-01'
  const harness = createHarness(attainment, () => Date.parse(`${today}T09:00:00Z`))
  const right: AttemptEvent = {
    kind: 'sum', index: 0, correct: true, latencyMs: 1000,
    helped: false, rescued: false, at: 0,
  }
  harness.dealt('sums', 1)
  for (const d of ['2026-07-01', '2026-07-02']) {
    today = d
    for (let i = 0; i < 10; i++) harness.recordAttempt({ ...right })
  }
  today = '2026-07-03'
  return makeDeps({ attainment, harness })
}

function open(deps: LearningDeps): HTMLElement {
  const root = document.createElement('div')
  document.body.append(root)
  void showLearning(root, deps)
  return root
}

const sectionOf = (root: HTMLElement, path: string): HTMLElement =>
  root.querySelector(`.grownups-path[data-path="${path}"]`) as HTMLElement

const rowOf = (section: HTMLElement, stage: number): HTMLElement =>
  section.querySelector(`.grownups-row[data-stage="${stage}"]`) as HTMLElement

const tickOf = (row: HTMLElement): HTMLElement =>
  row.querySelector('.grownups-tick') as HTMLElement

/** The one line on a section that says what the island is about to do. */
const autoLine = (root: HTMLElement, path: string): string =>
  sectionOf(root, path).querySelector('.grownups-auto')?.textContent ?? ''

/** grownups.ts binds `onclick`; jsdom has no PointerEvent constructor. */
const tap = (el: HTMLElement): void => {
  el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
  el.dispatchEvent(new Event('click', { bubbles: true }))
}

/** Let the awaits inside a handler run. */
const settle = (): Promise<void> => new Promise(r => { setTimeout(r, 0) })

function deferred(): { promise: Promise<void>; resolve: () => void; reject: () => void } {
  let resolve!: () => void
  let reject!: () => void
  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = () => { rej(new Error('the disk said no')) }
  })
  return { promise, resolve, reject }
}

describe('what the panel puts on screen', () => {
  it('talks about the child as "they" (PB-056)', () => {
    /*
     * This panel is the only screen in the game that talks ABOUT the child
     * rather than to them, so it is the one place a pronoun can hide — and all
     * six of the gendered strings PB-056 corrected were here or in the menu
     * that opens it. Asserted over the whole rendered subtree rather than over
     * the copy tables, because the heading, the note and the three mode
     * descriptions are written in three different places and only the DOM sees
     * all of them at once.
     *
     * `tests/copy/pronouns.test.ts` sweeps every string literal in src/; this
     * one proves the strings that reach the screen are among the ones swept.
     */
    const { deps } = makeDeps()
    const root = open(deps)
    expect(root.querySelector('.grownups-title')?.textContent).toBe('What they are working on')
    expect(root.querySelector('.grownups-note')?.textContent)
      .toBe('Only you see this. Nothing on this page is shown to them.')
    expect(root.textContent ?? '').not.toMatch(/\b(she|her|hers|herself|he|him|his)\b/i)
  })

  it('gives every live path its own section, in the ladder’s order', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const live = [...root.querySelectorAll('.grownups-path:not(.grownups-reserved)')]
    expect(live.map(s => (s as HTMLElement).dataset.path))
      .toEqual(['sums', 'takingAway', 'reading', 'building'])
    expect((live[1] as HTMLElement).querySelector('.grownups-path-title')?.textContent)
      .toBe('Taking away')
    expect((live[3] as HTMLElement).querySelector('.grownups-path-title')?.textContent)
      .toBe('Building words')
  })

  it('lists one row per built stage, in Joe’s words rather than in numbers', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const rows = [...sectionOf(root, 'takingAway').querySelectorAll('.grownups-row')]
    expect(rows).toHaveLength(3)
    expect(rows.map(r => r.querySelector('.grownups-stage-label')?.textContent))
      .toEqual(['to ten', 'teens minus units', 'anything to twenty'])
  })

  it('greys the reserved paths and gives them nothing to press', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const reserved = [...root.querySelectorAll('.grownups-reserved')]
    expect(reserved.map(s => (s as HTMLElement).dataset.path))
      .toEqual(['storySums', 'fractions', 'multiplication', 'division'])
    for (const s of reserved) {
      expect(s.querySelector('.grownups-stage-label')?.textContent).toBe('coming later')
      const tick = s.querySelector('.grownups-tick') as HTMLButtonElement
      expect(tick.disabled).toBe(true)
      tap(tick)
    }
    expect(deps.setTicked).not.toHaveBeenCalled()
  })

  it('says what Auto would do, and on a fresh island that is watching', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const lines = [...root.querySelectorAll('.grownups-auto')]
    expect(lines).toHaveLength(4)
    for (const line of lines) expect(line.textContent).toContain('watching')
  })

  it('puts a standing offer on the path it is about, and nowhere else', () => {
    /*
     * B2: the line is a read of the real gate. One offer stands island-wide, so
     * every section asks the same non-null question and only the path it names
     * may answer it — sums reports the probing it is actually doing, and the
     * reading paths report nothing at all.
     */
    const { deps } = offered()
    const root = open(deps)
    expect(autoLine(root, 'takingAway')).toBe('What Auto would do: offering taking away')
    expect(autoLine(root, 'sums'))
      .toBe('What Auto would do: slipping in a harder question now and then')
    expect(autoLine(root, 'reading')).toBe('What Auto would do: watching')
  })

  it('changes the line the moment a parent takes the path off Auto', async () => {
    // The mode switch is six inches above this line. A line written once at
    // open time would tell them their tap did nothing.
    const { deps } = makeDeps()
    const root = open(deps)
    expect(autoLine(root, 'sums')).toBe('What Auto would do: watching')

    tap(sectionOf(root, 'sums')
      .querySelector('.grownups-mode[data-mode="hold"]') as HTMLElement)
    await settle()

    expect(autoLine(root, 'sums'))
      .toBe('What Auto would do: standing back while this path is on hold')
    // And only that path: the switch is per-path and so is the line.
    expect(autoLine(root, 'reading')).toBe('What Auto would do: watching')
  })

  it('never uses the class that the overlay rule hides', () => {
    /*
     * tokens.css:115 hides `.say` under any open `.overlay`, and this panel's
     * wrapper IS an `.overlay`. That selector has eaten visible text three
     * times in this project; this is the tripwire.
     */
    const { deps } = makeDeps()
    const root = open(deps)
    expect(root.querySelector('.overlay.grownups')).not.toBeNull()
    expect(root.querySelectorAll('.say')).toHaveLength(0)
  })
})

describe('the report beside each stage', () => {
  it('shows dashes, not empty dots and not a word, before there is anything to say', () => {
    // A fresh island has no attempts at all, so all three measures are null.
    const { deps } = makeDeps()
    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 1)
    expect(row.querySelectorAll('.grownups-dashes')).toHaveLength(3)
    expect(row.querySelectorAll('.grownups-dot')).toHaveLength(0)
    expect(row.querySelectorAll('.grownups-word')).toHaveLength(0)
  })

  it('names the three measures and how much work the stage has had', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 1)
    expect([...row.querySelectorAll('.grownups-measure-name')].map(n => n.textContent))
      .toEqual(['accuracy', 'speed', 'consistency'])
    expect(row.querySelector('.grownups-stage-meta')?.textContent).toBe('not tried yet')
  })
})

describe('who is allowed to move a tick', () => {
  it('does nothing at all while the path is on Auto', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 2)
    expect(tickOf(row).classList.contains('on')).toBe(false)
    tap(tickOf(row))
    expect(deps.setTicked).not.toHaveBeenCalled()
    expect(deps.persist).not.toHaveBeenCalled()
    expect(tickOf(row).classList.contains('on')).toBe(false)
  })

  it('does nothing at all while the path is on Hold', () => {
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'hold'
    const root = open(deps)
    tap(tickOf(rowOf(sectionOf(root, 'sums'), 2)))
    expect(deps.setTicked).not.toHaveBeenCalled()
  })

  it('still shows the tick state in a mode that cannot be touched', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const section = sectionOf(root, 'sums')
    expect(tickOf(rowOf(section, 1)).classList.contains('on')).toBe(true)
    expect(tickOf(rowOf(section, 2)).classList.contains('on')).toBe(false)
  })

  it('marks the mode that is actually running', () => {
    const { deps, attainment } = makeDeps()
    attainment.reading.mode = 'hold'
    const root = open(deps)
    const on = sectionOf(root, 'reading').querySelector('.grownups-mode.on') as HTMLElement
    expect(on.dataset.mode).toBe('hold')
    expect(sectionOf(root, 'sums')
      .querySelector<HTMLElement>('.grownups-mode.on')?.dataset.mode).toBe('auto')
  })

  it('switches mode through the harness and saves it', async () => {
    const { deps, attainment, order } = makeDeps()
    const root = open(deps)
    const section = sectionOf(root, 'sums')
    tap(section.querySelector('.grownups-mode[data-mode="manual"]') as HTMLElement)
    await settle()

    expect(deps.setMode).toHaveBeenCalledWith('sums', 'manual')
    expect(attainment.sums.mode).toBe('manual')
    expect(order).toEqual(['setMode', 'persist'])
    expect(section.querySelector<HTMLElement>('.grownups-mode.on')?.dataset.mode)
      .toBe('manual')
  })
})

describe('a tick is a promise about the disk', () => {
  it('ticks through the harness and only then saves', async () => {
    const { deps, attainment, order } = makeDeps()
    attainment.sums.mode = 'manual'
    const root = open(deps)
    tap(tickOf(rowOf(sectionOf(root, 'sums'), 2)))
    await settle()

    expect(deps.setTicked).toHaveBeenCalledWith('sums', 2, true)
    // The order is the rule, not an incidental: A5 says the tick persists
    // before anything announces it.
    expect(order).toEqual(['setTicked', 'persist'])
    expect(attainment.sums.stages[2]?.ticked).toBe(true)
    expect(tickOf(rowOf(sectionOf(root, 'sums'), 2)).classList.contains('on')).toBe(true)
  })

  it('does not show the tick while the write is still in flight', async () => {
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'manual'
    const write = deferred()
    deps.persist = vi.fn(() => write.promise)

    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 2)
    tap(tickOf(row))
    await settle()

    expect(deps.persist).toHaveBeenCalled()
    expect(tickOf(row).classList.contains('on')).toBe(false)

    write.resolve()
    await settle()
    expect(tickOf(row).classList.contains('on')).toBe(true)
  })

  it('takes the tick back when the write fails', async () => {
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'manual'
    const write = deferred()
    deps.persist = vi.fn(() => write.promise)

    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 2)
    tap(tickOf(row))
    write.reject()
    await settle()

    // A tick that did not survive the write is not a tick a parent made.
    expect(attainment.sums.stages[2]?.ticked).toBe(false)
    expect(tickOf(row).classList.contains('on')).toBe(false)
  })

  it('ignores a second tap while the first one is still being written', async () => {
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'manual'
    const write = deferred()
    deps.persist = vi.fn(() => write.promise)

    const root = open(deps)
    const tick = tickOf(rowOf(sectionOf(root, 'sums'), 2))
    tap(tick)
    tap(tick)
    expect(deps.setTicked).toHaveBeenCalledTimes(1)
    write.resolve()
    await settle()
  })
})

describe('the tick that will not come off', () => {
  it('says why, and does not pretend to have tried', async () => {
    /*
     * A fresh island has sums 1 ticked and nothing else in the maths moment,
     * so it is the last tick there — and JT-010(3) holds it down, because a
     * child tapping a plot must never find nothing to do.
     */
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'manual'
    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 1)

    expect(deps.canUntick('sums', 1)).toBe(false)
    expect(row.querySelector('.grownups-held')?.classList.contains('grownups-show'))
      .toBe(true)

    tap(tickOf(row))
    await settle()

    expect(deps.setTicked).not.toHaveBeenCalled()
    expect(deps.persist).not.toHaveBeenCalled()
    expect(attainment.sums.stages[1]?.ticked).toBe(true)
    expect(tickOf(row).classList.contains('on')).toBe(true)
  })

  it('lets go once the moment has a second tick to stand on', async () => {
    const { deps, attainment } = makeDeps()
    attainment.sums.mode = 'manual'
    attainment.takingAway.stages[1]!.ticked = true
    const root = open(deps)
    const row = rowOf(sectionOf(root, 'sums'), 1)

    expect(row.querySelector('.grownups-held')?.classList.contains('grownups-show'))
      .toBe(false)
    tap(tickOf(row))
    await settle()

    expect(deps.setTicked).toHaveBeenCalledWith('sums', 1, false)
    expect(attainment.sums.stages[1]?.ticked).toBe(false)
    expect(tickOf(row).classList.contains('on')).toBe(false)
  })
})

describe('the way out', () => {
  it('closes on the back button and resolves', async () => {
    const { deps } = makeDeps()
    const root = document.createElement('div')
    document.body.append(root)
    const done = showLearning(root, deps)
    tap(root.querySelector('.overlay-back') as HTMLElement)
    await done
    expect(root.querySelector('.overlay.grownups')).toBeNull()
  })
})

describe('colour comfort — the switch that repaints red words green', () => {
  /*
   * `red` is a phonics CATEGORY here — "tricky word", the sibling of `green`'s
   * "sound it out" (src/core/wordlists.ts:15) — not a wrong answer. Joe's
   * report is that Juno reads it as wrong anyway and avoids those cards, so a
   * grown-up may put them into the green palette.
   *
   * Two things make that safe, and both are asserted below: the switch never
   * touches the challenge DOM, and it is one CSS rule that must actually exist.
   */
  it('puts the switch on the root, never on the word', () => {
    const host = document.createElement('div')
    const word = document.createElement('span')
    word.className = 'word red'
    host.append(word)

    applyWordColours(host, true)
    expect(host.classList.contains(CALM_COLOURS_CLASS)).toBe(true)
    // The renderers' contract with the frozen 2D shell is untouched.
    expect(word.className).toBe('word red')

    applyWordColours(host, false)
    expect(host.classList.contains(CALM_COLOURS_CLASS)).toBe(false)
    expect(word.className).toBe('word red')
  })

  it('is the only thing standing between the two palettes', () => {
    /*
     * Asserts the STYLESHEET, not a mock. The setting IS one CSS rule; if that
     * rule is renamed or dropped the panel goes on toggling a class happily
     * and Joe sees no change whatever on the tablet. Nothing else catches it —
     * no renderer test reads colour.
     */
    // From cwd, not import.meta.url: under jsdom that is an http: URL.
    const css = readFileSync(resolve(process.cwd(), 'src/ui/challenges.css'), 'utf8')
    const body = (re: RegExp): string => re.exec(css)?.[1]?.trim() ?? ''
    const green = body(/^\.word\.green\s*\{([^}]*)\}/m)
    expect(CALM_COLOURS_CLASS).toBe('calm-colours')
    const calm = body(/^body\.calm-colours \.word\.red\s*\{([^}]*)\}/m)
    expect(green).toBeTruthy()
    expect(calm).toBe(green)
    // And the default red is untouched: off means exactly as it was.
    expect(css).toMatch(/^\.word\.red\s+\{ color: #8c2b3f; background: #ffe9ee; \}$/m)
  })

  it('offers a grown-up two options, in plain words about comfort', () => {
    expect(WORD_COLOUR_CHOICES.map(c => c.id)).toEqual(['mixed', 'green'])
    const words = WORD_COLOUR_CHOICES
      .flatMap(c => [c.label, c.detail ?? '']).join(' ').toLowerCase()
    // Never framed as marking: this changes paint, not whether they are right.
    for (const forbidden of ['wrong', 'correct', 'mistake', 'error']) {
      expect(words).not.toContain(forbidden)
    }
  })
})

/* ------------------------------------------------------------------------
 * PB-047 — the wipe screen.
 *
 * The one surface in the game that is allowed to destroy what a child owns
 * (brief §19), so what is tested here is mostly the guard rails: that nothing
 * arrives pre-ticked, that the red button is dead until a grown-up has said
 * what, and above all that the three boxes are INDEPENDENT — a tick on one
 * must not quietly carry another out with it.
 *
 * What each box then clears is `wipe.test.ts`'s job; this file only cares that
 * the screen reports the grown-up's answer faithfully.
 */

const SUMMARY = { pets: 3, tiles: 12, childName: 'Juno' }

/** The tick screen, and the rows on it in the order they are shown. */
type WipeRows = [HTMLElement, HTMLElement, HTMLElement]

function openWipe(summary = SUMMARY): {
  root: HTMLElement; answer: Promise<WipeChoice | null>; rows: WipeRows
} {
  const root = document.createElement('div')
  document.body.append(root)
  const answer = askWipe(root, summary)
  return { root, answer, rows: [...root.querySelectorAll('.grownups-row')] as WipeRows }
}

const dangerIn = (root: HTMLElement): HTMLButtonElement =>
  root.querySelector('.grownups-danger') as HTMLButtonElement

const backIn = (root: HTMLElement): HTMLElement =>
  root.querySelector('.overlay-back') as HTMLElement

/** Tick some rows, press the red button, and say yes to the confirm behind it. */
async function tickAndConfirm(
  root: HTMLElement, rows: WipeRows, which: number[],
): Promise<void> {
  for (const i of which) tap(tickOf(rows[i]!))
  tap(dangerIn(root))
  await settle()
  tap(dangerIn(root))
  await settle()
}

describe('the wipe screen', () => {
  it('opens with all three boxes empty, so a mis-tap destroys nothing', () => {
    /*
     * The anti-mis-tap guarantee, and the reason it is first. A wipe screen
     * that opened with anything already ticked would let one stray thumb on
     * the red button take a child's animals — which is the single thing brief
     * §19 is most emphatic they cannot lose.
     */
    const { root, rows } = openWipe()
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(tickOf(row).getAttribute('aria-pressed')).toBe('false')
      expect(tickOf(row).classList.contains('on')).toBe(false)
    }
    expect(dangerIn(root).disabled).toBe(true)
    expect(dangerIn(root).textContent).toBe('nothing ticked')
  })

  it('will not fire while nothing is ticked', async () => {
    const { root } = openWipe()
    tap(dangerIn(root))
    await settle()
    // Still the tick screen: no confirm was raised behind it.
    expect(root.querySelector('.grownups-body')).toBeNull()
    expect(root.querySelector('.grownups-wipe')).not.toBeNull()
  })

  it('wakes the red button up as soon as a grown-up has said what', () => {
    const { root, rows } = openWipe()
    tap(tickOf(rows[0]))
    expect(dangerIn(root).disabled).toBe(false)
    expect(dangerIn(root).textContent).toBe('wipe what is ticked')
  })

  it('lets a tick come back off again', () => {
    const { root, rows } = openWipe()
    tap(tickOf(rows[1]))
    expect(tickOf(rows[1]).getAttribute('aria-pressed')).toBe('true')
    tap(tickOf(rows[1]))
    expect(tickOf(rows[1]).getAttribute('aria-pressed')).toBe('false')
    expect(dangerIn(root).disabled).toBe(true)
  })

  it('takes a tap anywhere on the row, not only on the little square', () => {
    // A thumb on a tablet, not a mouse pointer.
    const { rows } = openWipe()
    tap(rows[2].querySelector('.grownups-stage-label') as HTMLElement)
    expect(tickOf(rows[2]).getAttribute('aria-pressed')).toBe('true')
  })

  it('reports the island box, and only the island box', async () => {
    const { root, rows, answer } = openWipe()
    await tickAndConfirm(root, rows, [0])
    expect(await answer).toEqual({ island: true, academic: false, name: false })
  })

  it('reports the academic box, and only the academic box', async () => {
    const { root, rows, answer } = openWipe()
    await tickAndConfirm(root, rows, [1])
    expect(await answer).toEqual({ island: false, academic: true, name: false })
  })

  it('reports the name box, and only the name box', async () => {
    const { root, rows, answer } = openWipe()
    await tickAndConfirm(root, rows, [2])
    expect(await answer).toEqual({ island: false, academic: false, name: true })
  })

  it('reports two boxes without dragging the third along', async () => {
    const { root, rows, answer } = openWipe()
    await tickAndConfirm(root, rows, [1, 2])
    expect(await answer).toEqual({ island: false, academic: true, name: true })
  })

  it('reads back only what is going, in the confirm', async () => {
    /*
     * A parent does this once, under pressure, and the last thing on screen
     * before it happens has to name what it is about to take. A confirm that
     * mentioned animals while only the maths box was ticked would be worse
     * than no confirm at all.
     */
    const { root, rows } = openWipe()
    tap(tickOf(rows[1]))
    tap(dangerIn(root))
    await settle()
    const body = (root.querySelector('.grownups-body')?.textContent ?? '').toLowerCase()
    expect(body).toContain('year 1')
    expect(body).not.toContain('animal')
    expect(body).toContain('cannot be undone')
  })

  it('counts their friends and their land in the confirm, rather than saying "data"', async () => {
    const { root, rows } = openWipe()
    tap(tickOf(rows[0]))
    tap(dangerIn(root))
    await settle()
    const body = (root.querySelector('.grownups-body')?.textContent ?? '').toLowerCase()
    expect(body).toContain('3 friends')
    expect(body).toContain('12 pieces of land')
    expect(body).not.toContain('year 1')
  })

  it('names the child in the name row when there is a name to give back', () => {
    const { rows } = openWipe()
    expect(rows[2].textContent).toContain('Juno')
    // And says nothing about a name they have not given yet.
    document.body.innerHTML = ''
    const unnamed = openWipe({ pets: 0, tiles: 1, childName: '' })
    expect(unnamed.rows[2].textContent).not.toContain('called')
  })

  it('says what each box LEAVES, not only what it takes', () => {
    // The independence is the point of the card, and a parent cannot be
    // expected to infer it from the layout.
    const { rows } = openWipe()
    expect(rows[0].textContent?.toLowerCase())
      .toContain('what they are working on stays')
    expect(rows[1].textContent?.toLowerCase())
      .toContain('their island, their animals and their name all stay')
    expect(rows[2].textContent?.toLowerCase()).toContain('nothing else changes')
  })

  it('wipes nothing when the confirm is cancelled', async () => {
    const { root, rows, answer } = openWipe()
    tap(tickOf(rows[0]))
    tap(dangerIn(root))
    await settle()
    tap(backIn(root))
    expect(await answer).toBeNull()
  })

  it('wipes nothing when a grown-up backs out of the tick screen', async () => {
    const { root, answer } = openWipe()
    tap(backIn(root))
    expect(await answer).toBeNull()
  })

  it('wipes nothing when the backdrop is tapped', async () => {
    const { root, rows, answer } = openWipe()
    tap(tickOf(rows[0]))
    const wrap = root.querySelector('.overlay.grownups') as HTMLElement
    wrap.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(await answer).toBeNull()
  })

  it('never uses the class that the overlay rule hides', () => {
    /*
     * tokens.css:115 hides `.say` under any open `.overlay`, and this panel's
     * wrapper IS an `.overlay`. Same tripwire as the learning panel above.
     */
    const { root } = openWipe()
    expect(root.querySelector('.overlay.grownups')).not.toBeNull()
    expect(root.querySelectorAll('.say')).toHaveLength(0)
  })
})
