/** @vitest-environment jsdom */
/**
 * A4/A6 — the panel where a parent decides what his daughter is dealt.
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
import { showLearning, stageLabel } from '../../src/island/grownups'
import type { LearningDeps } from '../../src/island/grownups'
import { createAttainment, createHarness } from '../../src/island/harness'
import type { Mode, Path } from '../../src/island/harness'

afterEach(() => { document.body.innerHTML = '' })

function makeDeps() {
  const attainment = createAttainment()
  const harness = createHarness(attainment)
  /** Which writer was called, in the order the panel called it. */
  const order: string[] = []

  const deps: LearningDeps = {
    attainment,
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

  it('says what Auto would do, and in Run A that is watching', () => {
    const { deps } = makeDeps()
    const root = open(deps)
    const lines = [...root.querySelectorAll('.grownups-auto')]
    expect(lines).toHaveLength(4)
    for (const line of lines) expect(line.textContent).toContain('watching')
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
