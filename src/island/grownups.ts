/**
 * The grown-ups' dialogs, in the game's own interface.
 *
 * These were `prompt()` and `confirm()`, which is fine for a debug affordance
 * and wrong for something a parent is meant to use. A browser dialog on a
 * tablet is a grey system slab in a different typeface, it cannot be styled,
 * it looks like the page has broken, and `prompt()` for a PIN shows a text
 * keyboard when what is wanted is four digits.
 *
 * So: the same panel the name prompt already uses, a real keypad, and buttons
 * big enough for a thumb. Everything here resolves a promise, so the calling
 * code reads exactly as it did with the browser dialogs.
 *
 * Deliberately NOT part of `overlay.ts`. That owns the challenge surface —
 * what the child sees while they are working — and this is the one part of the
 * game they are not meant to be using.
 *
 * `showLearning` (A4/A6) is the exception to "dialogs": it is a panel a parent
 * READS as much as taps. It lives here anyway, because it is behind the same
 * PIN, wears the same bones, and belongs to the same audience.
 */
import { LIVE_PATHS, RESERVED_PATHS, STAGES } from './harness'
import type { Attainment, Harness, Mode, Path, ReservedPath } from './harness'
import { TIER_WORDS, autoWouldDo, stageReport } from './report'
import type { Measure } from './report'
import type { WipeChoice } from './save'

/** A modal panel over the world, dismissible by tapping outside it. */
function panel(root: HTMLElement, build: (box: HTMLElement) => void,
  onDismiss: () => void): () => void {
  const wrap = document.createElement('div')
  wrap.className = 'overlay grownups'

  const box = document.createElement('div')
  box.className = 'chunk overlay-panel grownups-panel'
  build(box)

  wrap.append(box)
  root.append(wrap)

  const close = (): void => { wrap.remove() }
  wrap.addEventListener('pointerdown', e => {
    // Only a tap on the backdrop itself, never one that bubbled from a button.
    if (e.target === wrap) { close(); onDismiss() }
  })
  return close
}

const heading = (text: string): HTMLElement => {
  const h = document.createElement('div')
  h.className = 'grownups-title'
  h.textContent = text
  return h
}

const note = (text: string): HTMLElement => {
  const p = document.createElement('div')
  p.className = 'grownups-note'
  p.textContent = text
  return p
}

/**
 * Four digits, on a keypad.
 *
 * The PIN is the day and month (v0:2095-2122) — a grown-up knows today's date
 * and a six-year-old does not reliably, and it needs no account, no server and
 * no secret to store. A keypad rather than a text field because that is what
 * four digits deserve, and because a text input summons a full keyboard over
 * half the screen on the device this actually runs on.
 *
 * Resolves true when the PIN is right, false if they back out. A wrong PIN
 * shakes and clears rather than closing: mistyping is not the same as changing
 * your mind, and a parent should not have to start the journey again.
 */
export function askPin(root: HTMLElement, expected: string): Promise<boolean> {
  return new Promise(resolve => {
    let entered = ''
    let dots: HTMLElement
    let close: () => void

    const render = (): void => {
      dots.textContent = '••••'.slice(0, entered.length) + '––––'.slice(entered.length)
    }

    const press = (digit: string): void => {
      if (entered.length >= 4) return
      entered += digit
      render()
      if (entered.length < 4) return
      if (entered === expected) { close(); resolve(true); return }
      // Wrong: say so without scolding, and let them try again.
      dots.classList.add('grownups-wrong')
      setTimeout(() => {
        entered = ''
        dots.classList.remove('grownups-wrong')
        render()
      }, 450)
    }

    close = panel(root, box => {
      box.append(heading('Grown-ups'))
      box.append(note('Today’s date — day then month, four digits.'))

      dots = document.createElement('div')
      dots.className = 'grownups-dots'
      box.append(dots)
      render()

      const pad = document.createElement('div')
      pad.className = 'grownups-pad'
      for (const key of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']) {
        if (key === '') { pad.append(document.createElement('span')); continue }
        const b = document.createElement('button')
        b.className = 'chunk chunk-button grownups-key'
        b.textContent = key
        b.onclick = () => {
          if (key === '⌫') { entered = entered.slice(0, -1); render(); return }
          press(key)
        }
        pad.append(b)
      }
      box.append(pad)

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'never mind'
      back.onclick = () => { close(); resolve(false) }
      box.append(back)
    }, () => resolve(false))
  })
}

export interface Choice { id: string; label: string; detail?: string }

/**
 * A list of things a grown-up might do, one button each.
 *
 * Replaces a numbered `prompt()`, which asked someone to read a list and then
 * type a digit — two steps and a chance to mistype, where a tap is neither.
 */
export function askChoice(
  root: HTMLElement, title: string, choices: readonly Choice[],
): Promise<string | null> {
  return new Promise(resolve => {
    const close = panel(root, box => {
      box.append(heading(title))
      const list = document.createElement('div')
      list.className = 'grownups-list'
      for (const choice of choices) {
        const b = document.createElement('button')
        b.className = 'chunk chunk-button grownups-choice'
        const label = document.createElement('span')
        label.className = 'grownups-choice-label'
        label.textContent = choice.label
        b.append(label)
        if (choice.detail) {
          const d = document.createElement('span')
          d.className = 'grownups-choice-detail'
          d.textContent = choice.detail
          b.append(d)
        }
        b.onclick = () => { close(); resolve(choice.id) }
        list.append(b)
      }
      box.append(list)

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'close'
      back.onclick = () => { close(); resolve(null) }
      box.append(back)
    }, () => resolve(null))
  })
}

/**
 * Yes or no, with the consequence spelled out.
 *
 * `danger` colours the confirming button, because the two questions asked
 * through this — replace an island from a backup, wipe one — are the only
 * irreversible things in the whole game, and they should not look like the
 * same button as "back up to a file".
 */
export function askConfirm(
  root: HTMLElement, title: string, body: string,
  yes: string, danger = false,
): Promise<boolean> {
  return new Promise(resolve => {
    const close = panel(root, box => {
      box.append(heading(title))

      const text = document.createElement('div')
      text.className = 'grownups-body'
      // Line by line, so a summary of what is about to be replaced reads as a
      // summary rather than as one long sentence.
      for (const line of body.split('\n')) {
        const row = document.createElement('div')
        row.textContent = line
        if (line === '') row.className = 'grownups-gap'
        text.append(row)
      }
      box.append(text)

      const row = document.createElement('div')
      row.className = 'overlay-controls'

      const go = document.createElement('button')
      go.className = `chunk chunk-button ${danger ? 'grownups-danger' : 'overlay-again'}`
      go.textContent = yes
      go.onclick = () => { close(); resolve(true) }

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'cancel'
      back.onclick = () => { close(); resolve(false) }

      row.append(go, back)
      box.append(row)
    }, () => resolve(false))
  })
}

/* ------------------------------------------------------------- the wipe ---
 *
 * PB-047. "Start again" used to be one red button that took everything, and
 * Joe's card is that it should not be: *"it should be at least a question to
 * the adult ... wipe should offer 3 options with tick boxes."*
 *
 * Three things about the shape of this screen are deliberate, because this is
 * the ONE place the game is allowed to destroy what a child owns (brief §19):
 *
 * - EVERY BOX STARTS OFF. A wipe screen that opens with anything pre-ticked is
 *   a screen where a mis-tap on the red button destroys something nobody asked
 *   to destroy. Nothing happens here until a grown-up has said what.
 * - EACH ROW SAYS WHAT IT TAKES, IN COUNTS — "3 friends and 12 pieces of
 *   land", not "island data". A parent does this once, under pressure, and
 *   should not have to infer what a word covers.
 * - EACH ROW ALSO SAYS WHAT IT LEAVES. The whole point of the card is that the
 *   three are independent, and a parent cannot be expected to trust that from
 *   the layout alone.
 *
 * The red button is dead until something is ticked, and the confirm that
 * follows reads the ticked rows back line by line. So a wipe is: the PIN, the
 * menu, a tick, the red button, and a yes — and the two steps that name what
 * is going are the last two.
 */

export interface WipeSummary {
  pets: number
  tiles: number
  childName: string
}

const friendCount = (n: number): string => `${n} friend${n === 1 ? '' : 's'}`
const landCount = (n: number): string =>
  `${n} piece${n === 1 ? '' : 's'} of land`

interface WipeRow {
  key: keyof WipeChoice
  label: string
  detail: string
  /** How the confirm reads this row back. */
  going: string
}

const wipeRows = (s: WipeSummary): WipeRow[] => [
  {
    key: 'island',
    label: 'Their island and their animals',
    detail: `${friendCount(s.pets)} and ${landCount(s.tiles)}, and the work saved up`
      + ' toward the next of each. The story plays again from the top.'
      + ' What they are working on stays exactly where it is.',
    going: `their island and their animals — ${friendCount(s.pets)}, ${landCount(s.tiles)}`,
  },
  {
    key: 'academic',
    label: 'What they are working on',
    detail: 'Back to the start of Year 1: every tick, and everything the game has'
      + ' worked out about how they are getting on. Their island, their animals'
      + ' and their name all stay.',
    going: 'what they are working on — back to the start of Year 1',
  },
  {
    key: 'name',
    label: 'Their name',
    detail: (s.childName ? `They are called ${s.childName}. ` : '')
      + 'They are asked again next time they play. Nothing else changes.',
    going: s.childName ? `their name — ${s.childName}` : 'their name',
  },
]

/**
 * Which of the three to wipe, or null if the grown-up backed out.
 *
 * Resolves ONLY after the confirm, so a caller that gets a value has been told
 * yes twice about a named list of things. Nothing here writes; the caller does
 * that, and reloads.
 */
export function askWipe(
  root: HTMLElement, summary: WipeSummary,
): Promise<WipeChoice | null> {
  return new Promise(resolve => {
    const picked: WipeChoice = { island: false, academic: false, name: false }
    const rows = wipeRows(summary)
    let go: HTMLButtonElement
    let close: () => void

    const anyTicked = (): boolean => picked.island || picked.academic || picked.name

    const refresh = (): void => {
      go.disabled = !anyTicked()
      go.textContent = anyTicked() ? 'wipe what is ticked' : 'nothing ticked'
    }

    close = panel(root, box => {
      box.classList.add('grownups-wipe')
      box.append(heading('Start again'))
      box.append(note('Tick what to clear. Anything left unticked is not touched.'))

      const list = document.createElement('div')
      list.className = 'grownups-stages'

      for (const row of rows) {
        const line = document.createElement('div')
        line.className = 'grownups-row grownups-row-off'

        const tick = document.createElement('button')
        tick.className = 'chunk chunk-button grownups-tick'
        tick.setAttribute('aria-label', row.label)
        tick.setAttribute('aria-pressed', 'false')

        const body = document.createElement('div')
        body.className = 'grownups-stage'

        const label = document.createElement('div')
        label.className = 'grownups-stage-label'
        label.textContent = row.label

        const detail = document.createElement('div')
        detail.className = 'grownups-stage-meta'
        detail.textContent = row.detail

        body.append(label, detail)
        line.append(tick, body)

        const toggle = (): void => {
          picked[row.key] = !picked[row.key]
          const on = picked[row.key]
          tick.classList.toggle('on', on)
          tick.textContent = on ? '✓' : ''
          tick.setAttribute('aria-pressed', String(on))
          line.classList.toggle('grownups-row-off', !on)
          refresh()
        }
        // The whole row, not only the 2.1rem square: a thumb, not a pointer.
        tick.onclick = toggle
        body.onclick = toggle

        list.append(line)
      }
      box.append(list)

      const controls = document.createElement('div')
      controls.className = 'overlay-controls'

      go = document.createElement('button')
      go.className = 'chunk chunk-button grownups-danger'
      go.onclick = () => {
        if (!anyTicked()) return
        const going = rows.filter(r => picked[r.key]).map(r => `• ${r.going}`)
        close()
        void askConfirm(root, 'Wipe these?',
          ['This will clear:', ...going, '', 'It cannot be undone.'].join('\n'),
          'wipe it', true,
        ).then(sure => { resolve(sure ? picked : null) })
      }

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'never mind'
      back.onclick = () => { close(); resolve(null) }

      controls.append(go, back)
      box.append(controls)
      refresh()
    }, () => resolve(null))
  })
}

/* --------------------------------------------------------- colour comfort */

/**
 * The class that repaints red word cards green, and where it goes.
 *
 * On <body>, NOT on the word. The renderers still emit `.word.red` exactly as
 * they always have, so `src/challenges/`, its tests and the 2D parity shell
 * are untouched by this setting — the only thing that reads it is one CSS rule
 * in `src/ui/challenges.css`. A setting that changed the challenge DOM would
 * be a setting that could diverge the two shells, and that is the one thing
 * this must not do.
 *
 * Why anyone wants it: red marks a phonics "tricky word", not a mistake, but
 * Juno reads red as WRONG and stops tapping those cards. Off by default —
 * nothing changes for anyone until a grown-up asks for it.
 */
export const CALM_COLOURS_CLASS = 'calm-colours'

/** Paint the word cards. Idempotent, and safe to call before the first round. */
export function applyWordColours(root: HTMLElement, calm: boolean): void {
  root.classList.toggle(CALM_COLOURS_CLASS, calm)
}

/**
 * The two options, in a parent's words.
 *
 * Plainly about comfort, never about correctness: a grown-up choosing this is
 * not marking work, and the wording must not suggest the red words were wrong
 * or that turning it on makes anything easier.
 */
export const WORD_COLOUR_CHOICES: readonly Choice[] = [
  { id: 'mixed', label: 'Green and red', detail: 'red marks a tricky word' },
  { id: 'green', label: 'All green', detail: 'gentler if red puts them off' },
]

/* ----------------------------------------- A4/A6: what they are working on */

/**
 * The stages, in words a parent can act on.
 *
 * The harness knows stages as numbers because that is what a generator takes;
 * nobody outside it should have to. "sums 2" is a fact about an array index,
 * "bridging ten (to twenty)" is the thing Joe is actually deciding to switch
 * on, and the tick he is about to make is only as good as the sentence next
 * to it.
 */
export const STAGE_LABELS: Record<Path, Record<number, string>> = {
  /*
   * IN LADDER ORDER, not id order — the object is written the way the rungs
   * climb so a parent reading the source sees the progression. `STAGES.sums` is
   * the authority on the order; this is the wording beside each rung.
   */
  sums: {
    4: 'within five',
    1: 'to ten',
    3: 'teens plus units',
    5: 'whole tens (to a hundred)',
    2: 'bridging ten (to twenty)',
    6: 'two-digit plus units',
    7: 'two-digit, bridging ten',
  },
  takingAway: { 1: 'to ten', 2: 'teens minus units', 3: 'anything to twenty' },
  reading: { 1: 'reading words' },
  building: { 1: 'building words' },
}

/** The wording for one stage, with a plain fallback if a rung outruns the table. */
export function stageLabel(path: Path, stage: number): string {
  return STAGE_LABELS[path]?.[stage] ?? `stage ${stage}`
}

const PATH_TITLES: Record<Path, string> = {
  sums: 'Sums',
  takingAway: 'Taking away',
  reading: 'Reading',
  building: 'Building words',
}

const RESERVED_TITLES: Record<ReservedPath, string> = {
  storySums: 'Story sums',
  fractions: 'Fractions',
  multiplication: 'Multiplication',
  division: 'Division',
}

/** The three modes, in the order they are offered, each with its one line. */
const MODES: ReadonlyArray<{ mode: Mode; label: string; detail: string }> = [
  {
    mode: 'auto', label: 'Auto',
    detail: 'Moves them on by itself, and only ever forward. Right now it is watching, not ticking.',
  },
  {
    mode: 'manual', label: 'Manual',
    detail: 'Your hand. Tick or untick any stage yourself.',
  },
  {
    mode: 'hold', label: 'Hold',
    detail: 'Pins them exactly where they are. Nothing moves on its own.',
  },
]

/**
 * Everything the panel needs, handed to it.
 *
 * The panel is the one grown-up surface with real consequences behind it, so
 * it is built to be driven by a test rather than by the game: the harness, the
 * save and the wording all arrive as functions. Nothing here reaches for a
 * module-level singleton, which is what lets the persist-before-announce rule
 * below be proved with a promise a test controls.
 */
export interface LearningDeps {
  attainment: Attainment
  /**
   * The island's own harness, for the one line that ASKS rather than writes.
   *
   * "What Auto would do" is a read of B's gate — the standing offer, the
   * honeymoon, the probes — and the gate lives in one place on purpose.
   *
   * REQUIRED, and it was briefly optional, which was wrong twice over. The
   * fallback built a SECOND harness inside `src/`, which is exactly what
   * `tests/island/barrier.test.ts` — *"builds one, in main.ts, and nowhere
   * else in src"* — exists to forbid: the harness holds `attainment` by
   * reference, so two of them over one record is the silent-divergence shape
   * this project has been bitten by four times. And the stand-in did not
   * inherit the island's clock, so a game running on an offset clock had the
   * panel reading B's day boundaries — today's offer, the cooldown, the
   * honeymoon — off the real one. A required field costs one word at the only
   * call site there is.
   */
  harness: Harness
  setTicked(path: Path, stage: number, ticked: boolean): boolean
  canUntick(path: Path, stage: number): boolean
  setMode(path: Path, mode: Mode): boolean
  /** Resolves when the change is durably written. Rejects if it was not. */
  persist(): Promise<void>
  stageLabel(path: Path, stage: number): string
}

/** Three dots and a soft word, or dashes when there is not enough to say. */
function measure(name: string, m: Measure): HTMLElement {
  const el = document.createElement('div')
  el.className = 'grownups-measure'

  const label = document.createElement('span')
  label.className = 'grownups-measure-name'
  label.textContent = name
  el.append(label)

  /*
   * A6's small-sample honesty, rendered rather than computed: no tier means
   * dashes. NOT zero dots and NOT a word — an empty row of dots reads as
   * "measured, and bad", which is a verdict on a child nobody has watched long
   * enough to have one about.
   */
  if (m.tier === null) {
    const dashes = document.createElement('span')
    dashes.className = 'grownups-dashes'
    dashes.textContent = '–––'
    el.append(dashes)
    return el
  }

  const dots = document.createElement('span')
  dots.className = 'grownups-measure-dots'
  for (let i = 0; i < 3; i++) {
    const d = document.createElement('span')
    d.className = 'grownups-dot'
    // The `.stage-dot` precedent from overlay.ts: a class, not a checkbox.
    d.classList.toggle('on', i < m.filled)
    dots.append(d)
  }

  const word = document.createElement('span')
  word.className = 'grownups-word'
  word.textContent = TIER_WORDS[m.tier]

  el.append(dots, word)
  return el
}

const pathTitle = (text: string): HTMLElement => {
  const el = document.createElement('div')
  el.className = 'grownups-path-title'
  el.textContent = text
  return el
}

/** How much work a stage has had, in a line. */
function stageMeta(attempts: number, lastActive: string | null): string {
  if (attempts === 0) return 'not tried yet'
  const tries = `${attempts} ${attempts === 1 ? 'try' : 'tries'}`
  return lastActive ? `${tries} · last ${lastActive}` : tries
}

/** One live path: its mode switch, its stages, and what Auto would do. */
function livePathSection(path: Path, deps: LearningDeps, h: Harness): HTMLElement {
  const section = document.createElement('div')
  section.className = 'grownups-path'
  section.dataset.path = path
  section.append(pathTitle(PATH_TITLES[path]))

  /*
   * ONE WRITE AT A TIME, per path.
   *
   * Every change here is "set it, wait for the disk, then show it", and a
   * second tap arriving inside that window would race the first one's revert.
   * A parent tapping twice is not a bug they should pay for, so the second tap
   * is simply ignored until the first one has landed.
   */
  let busy = false
  const redraws: Array<() => void> = []
  const redraw = (): void => { for (const f of redraws) f() }

  const modes = document.createElement('div')
  modes.className = 'grownups-modes'
  for (const { mode, label, detail } of MODES) {
    const b = document.createElement('button')
    b.className = 'chunk chunk-button grownups-mode'
    b.dataset.mode = mode

    const name = document.createElement('span')
    name.className = 'grownups-mode-label'
    name.textContent = label
    const why = document.createElement('span')
    why.className = 'grownups-mode-detail'
    why.textContent = detail
    b.append(name, why)

    redraws.push(() => {
      const on = deps.attainment[path].mode === mode
      b.classList.toggle('on', on)
      b.setAttribute('aria-pressed', String(on))
    })

    b.onclick = () => { void chooseMode(mode) }
    modes.append(b)
  }
  section.append(modes)

  async function chooseMode(mode: Mode): Promise<void> {
    const was = deps.attainment[path].mode
    if (busy || mode === was) return
    busy = true
    if (!deps.setMode(path, mode)) { busy = false; return }
    try {
      // A5: the change is on the disk before the panel says it happened.
      await deps.persist()
    } catch {
      deps.setMode(path, was)
    }
    busy = false
    redraw()
  }

  const stages = document.createElement('div')
  stages.className = 'grownups-stages'
  for (const stage of STAGES[path]) stages.append(stageRow(path, stage))
  section.append(stages)

  const auto = document.createElement('div')
  auto.className = 'grownups-auto'
  /*
   * REDRAWN WITH THE REST OF THE SECTION, and not written once.
   *
   * The line's fourth branch is the mode, and the mode switch is six inches
   * above it. A line computed at open time would go on saying "watching" the
   * instant a parent moved the path to Hold — which is the panel telling them
   * their tap did nothing, about the one control here whose whole purpose is
   * to stop Auto.
   */
  redraws.push(() => {
    auto.textContent =
      `What Auto would do: ${autoWouldDo(path, h, deps.attainment[path].mode)}`
  })
  section.append(auto)

  redraw()
  return section

  function stageRow(path2: Path, stage: number): HTMLElement {
    const row = document.createElement('div')
    row.className = 'grownups-row'
    row.dataset.stage = String(stage)

    const tick = document.createElement('button')
    tick.className = 'chunk chunk-button grownups-tick'
    tick.setAttribute('aria-label', deps.stageLabel(path2, stage))

    const body = document.createElement('div')
    body.className = 'grownups-stage'

    const label = document.createElement('div')
    label.className = 'grownups-stage-label'
    label.textContent = deps.stageLabel(path2, stage)
    body.append(label)

    const stats = deps.attainment[path2].stages[stage]
    const report = stats ? stageReport(stats) : null

    const measures = document.createElement('div')
    measures.className = 'grownups-measures'
    if (report) {
      measures.append(
        measure('accuracy', report.accuracy),
        measure('speed', report.speed),
        measure('consistency', report.consistency))
    }
    body.append(measures)

    const meta = document.createElement('div')
    meta.className = 'grownups-stage-meta'
    meta.textContent = report ? stageMeta(report.attempts, report.lastActive) : ''
    body.append(meta)

    /*
     * WHY A TICK CAN REFUSE TO COME OFF, said out loud.
     *
     * The last ticked stage of a deal moment is held down (JT-010(3)): a child
     * tapping a plot, or an egg, must never find nothing there. A tap that
     * quietly did nothing would read as the panel being broken, so the reason
     * is on screen the whole time the tick is protected, and the tap nudges it.
     */
    const held = document.createElement('div')
    held.className = 'grownups-held'
    held.textContent =
      'Kept on — it is the last one here, and a tap must always find something to do.'
    body.append(held)

    row.append(tick, body)

    redraws.push(() => {
      const st = deps.attainment[path2].stages[stage]
      const ticked = st?.ticked === true
      const manual = deps.attainment[path2].mode === 'manual'
      const protectedTick = ticked && !deps.canUntick(path2, stage)
      tick.classList.toggle('on', ticked)
      tick.classList.toggle('grownups-tick-held', !manual || protectedTick)
      tick.textContent = ticked ? '✓' : ''
      tick.setAttribute('aria-pressed', String(ticked))
      row.classList.toggle('grownups-row-off', !ticked)
      held.classList.toggle('grownups-show', manual && protectedTick)
    })

    const nudge = (): void => {
      held.classList.add('grownups-nudge')
      setTimeout(() => held.classList.remove('grownups-nudge'), 400)
    }

    tick.onclick = () => { void toggle() }

    async function toggle(): Promise<void> {
      const st = deps.attainment[path2].stages[stage]
      if (busy || !st) return
      /*
       * A4: Auto only ever ticks and Hold pins, so neither of them is a thing
       * a finger does. The row still SHOWS its state in those modes — the
       * report is worth reading whoever is driving — it just does not move.
       */
      if (deps.attainment[path2].mode !== 'manual') return

      const wanted = !st.ticked
      if (!wanted && !deps.canUntick(path2, stage)) { nudge(); return }

      busy = true
      if (!deps.setTicked(path2, stage, wanted)) { busy = false; nudge(); return }
      try {
        /*
         * A5, spec line 107: the tick persists BEFORE anything announces it.
         * Nothing is redrawn between the setter and this await, so the row
         * cannot show a tick that is still in flight — and if the write fails
         * the model goes back to what the disk still says, because a tick that
         * did not survive is not a tick a parent made.
         */
        await deps.persist()
      } catch {
        deps.setTicked(path2, stage, !wanted)
        busy = false
        redraw()
        return
      }
      busy = false
      redraw()
    }

    return row
  }
}

/** A named slot with nothing behind it yet. Greyed, empty, unreachable. */
function reservedSection(path: ReservedPath): HTMLElement {
  const section = document.createElement('div')
  section.className = 'grownups-path grownups-reserved'
  section.dataset.path = path
  section.append(pathTitle(RESERVED_TITLES[path]))

  const row = document.createElement('div')
  row.className = 'grownups-row grownups-row-off'

  const tick = document.createElement('button')
  tick.className = 'chunk chunk-button grownups-tick grownups-tick-held'
  // Disabled as well as unbound: a slot with no generator behind it should not
  // even take a focus ring, let alone a tap that has to be explained away.
  tick.disabled = true
  tick.setAttribute('aria-disabled', 'true')

  const label = document.createElement('div')
  label.className = 'grownups-stage-label'
  label.textContent = 'coming later'

  row.append(tick, label)
  section.append(row)
  return section
}

/**
 * What they are working on: the capability model and the report, in one panel.
 *
 * A4 and A6 are one screen because they are one decision. The tickbox says
 * what they may be dealt and the three measures beside it are the only honest
 * grounds for moving it, so putting them on separate screens would mean asking
 * a parent to remember a number between two taps.
 *
 * It is never child-facing, it leaves the device nowhere, and it carries no
 * colours-as-verdict: the dots are ink, the words are soft, and a stage nobody
 * has watched long enough shows dashes rather than a score of nothing.
 */
export function showLearning(root: HTMLElement, deps: LearningDeps): Promise<void> {
  return new Promise(resolve => {
    const close = panel(root, box => {
      // Wider than a keypad or a confirmation: this one is read, not answered.
      box.classList.add('grownups-learning')
      box.append(heading('What they are working on'))
      box.append(note('Only you see this. Nothing on this page is shown to them.'))

      /*
       * ONE harness for the whole panel, and it is the ISLAND'S. Four sections
       * asking four different stand-ins about a gate that is *"one offer a
       * session, island-wide"* would be four readings of the same question,
       * and the cheapest way for them to disagree.
       */
      const h = deps.harness

      const list = document.createElement('div')
      list.className = 'grownups-paths'
      for (const path of LIVE_PATHS) list.append(livePathSection(path, deps, h))
      for (const path of RESERVED_PATHS) list.append(reservedSection(path))
      box.append(list)

      const back = document.createElement('button')
      back.className = 'chunk chunk-button overlay-back'
      back.textContent = 'close'
      back.onclick = () => { close(); resolve() }
      box.append(back)
    }, () => resolve())
  })
}
