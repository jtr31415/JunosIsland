/** @vitest-environment jsdom */
/**
 * The third governor: a run of struggle across successive pages.
 *
 * Joe: *"we have a button mash guard, but repeated mashing on successive pages
 * should lead to a suggestion for a break or to get up, run around for a minute
 * and then come back."*
 *
 * The guard that existed fired at three wrongs, reset its counter on the spot,
 * and was PER ROUND — so three mashed pages in a row were indistinguishable
 * from three unrelated pages, and nothing in the game had any memory at all.
 * That absence is the whole ticket.
 *
 * Two things these tests exist to defend, above the counting:
 *
 *   1. Brief §19, "no timers, no expiry". The suggestion is a sentence. It must
 *      not lock input, start a cooldown, take a tile back or bar a single tap,
 *      and a child who ignores it entirely must be able to carry straight on.
 *   2. Brief §19, "three stumbles summon help and NEVER SHAME". The line must
 *      not be readable as a report on how they are doing.
 *
 * The tests run the REAL renderers through the REAL overlay, because HANDOFF §5
 * is emphatic about what mocking this seam has cost here four times: `onWrong`
 * is a port, and a port asserted to have been called is not a feature.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOverlay } from '../../src/island/overlay'
import type { Overlay, OverlayHost } from '../../src/island/overlay'
import {
  createBreakWatch, MASH_WRONGS, MASH_PAGES, GOVERNOR_LINE,
} from '../../src/island/governors'
import type { SumItem } from '../../src/core/generators/sums'
import type { BuildItem } from '../../src/core/generators/build'
import type { ReadPick } from '../../src/core/generators/read'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string): string => readFileSync(resolve(here, rel), 'utf8')

/** Comments stripped, so prose about a rule cannot stand in for the rule. */
const stripComments = (s: string): string => s
  .split('\n')
  .filter(l => !/^\s*(\/\/|\/\*|\*)/.test(l))
  .join('\n')

const SUM: SumItem = { a: 2, b: 3, op: 'add' }   // answer 5
const SUM_ANSWER = 5
const NOT_THE_ANSWER = 1
const PICKS: ReadPick[] = [
  { w: 'sat', cls: 'green' },
  { w: 'him', cls: 'green' },
]
/**
 * A build page with a decoy that is NEVER the next tile needed.
 *
 * 'm' is not in 'sat', so tapping it is a guaranteed wrong answer at any point
 * in the word — which is what makes a mashed build page reproducible. The real
 * generator always plants exactly three such decoys (core/generators/build.ts).
 */
const BUILD: BuildItem = { w: 'sat', segs: ['s', 'a', 't'], tray: ['s', 'a', 't', 'm'] }
const BUILD_DECOY = 'm'

function setup() {
  const root = document.createElement('div')
  document.body.append(root)

  const host = {
    speech: {
      speak: vi.fn(() => true),
      ready: () => true,
      cancel: vi.fn(),
      noticeShown: vi.fn(() => false),
      markNoticeShown: vi.fn(),
    },
    sfx: { play: vi.fn(), enabled: true, setTheme: vi.fn() },
    onPassed: vi.fn(),
    onDismissed: vi.fn(),
  } satisfies OverlayHost

  const overlay: Overlay = createOverlay(root, host)
  const layer = root.querySelector('.overlay') as HTMLElement
  const q = (sel: string): HTMLElement => root.querySelector(sel) as HTMLElement
  return { root, host, overlay, layer, q, isOpen: () => !layer.classList.contains('hide') }
}

beforeEach(() => {
  vi.useFakeTimers()
  Element.prototype.animate = vi.fn(() => ({ onfinish: null })) as never
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

/** v0:882 binds pointerdown, and jsdom has no PointerEvent constructor. */
const poke = (el: Element | null | undefined): void => {
  el?.dispatchEvent(new Event('pointerdown', { bubbles: true }))
}

const tapChip = (root: HTMLElement, n: number): void => {
  poke([...root.querySelectorAll('.nchip')].find(c => c.textContent === String(n)))
}

const tapTile = (root: HTMLElement, txt: string): void => {
  poke([...root.querySelectorAll('.tray .tile')]
    .find(t => t.textContent === txt && !t.classList.contains('used')))
}

/**
 * Answer one sum page wrongly `wrongs` times, then correctly.
 *
 * Waits out the renderer's OWN mash rescue between taps — it locks input for
 * 2000ms at three wrongs (sum.ts:140), which is the pre-existing behaviour this
 * change sits above and must not disturb. Without the wait the next tap is
 * swallowed by that lock and the page is under-counted: a fact about the real
 * port that a mocked one would have hidden.
 */
function playSum(root: HTMLElement, overlay: Overlay, wrongs: number): void {
  overlay.openSum(SUM)
  for (let i = 0; i < wrongs; i++) {
    tapChip(root, NOT_THE_ANSWER)
    vi.advanceTimersByTime(2100)
  }
  tapChip(root, SUM_ANSWER)
  vi.advanceTimersByTime(2500)                  // the auto-advance -> finish()
}

/** The same, on a build page: `wrongs` decoy taps, then spell the word. */
function playBuild(root: HTMLElement, overlay: Overlay, wrongs: number): void {
  overlay.openBuild(BUILD)
  for (let i = 0; i < wrongs; i++) {
    tapTile(root, BUILD_DECOY)
    vi.advanceTimersByTime(1900)                // past build.ts:154's own lock
  }
  for (const seg of BUILD.segs) tapTile(root, seg)
  vi.advanceTimersByTime(2000)                  // the auto-advance -> finish()
}

/* ------------------------------------------------------------------ *
 * The watch itself: the threshold and the reset rule, in isolation.
 * ------------------------------------------------------------------ */

describe('the break watch', () => {
  it('says nothing on a first mashed page — the per-page rescue owns that', () => {
    const w = createBreakWatch()
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    expect(w.pageEnded()).toBe(false)
    expect(w.streak()).toBe(1)
  })

  it('suggests a stretch only once MASH_PAGES pages in a row have been mashed', () => {
    const w = createBreakWatch()
    const fired: boolean[] = []
    for (let page = 0; page < MASH_PAGES; page++) {
      for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
      fired.push(w.pageEnded())
    }
    expect(fired).toEqual([...Array(MASH_PAGES - 1).fill(false), true])
  })

  it('does NOT fire on a clean run — the case that must never be a false alarm', () => {
    /*
     * A whole sitting of ordinary work. Nothing here is a stumble worth naming,
     * and a suggestion arriving in the middle of it would be the game commenting
     * on a child who is doing fine.
     */
    const w = createBreakWatch()
    for (let page = 0; page < MASH_PAGES * 4; page++) {
      expect(w.pageEnded()).toBe(false)
    }
    expect(w.streak()).toBe(0)
  })

  it('does not fire for one or two wrong taps a page, however many pages', () => {
    // Under the threshold is ORDINARY LEARNING and must not accumulate.
    const w = createBreakWatch()
    for (let page = 0; page < MASH_PAGES * 4; page++) {
      for (let i = 0; i < MASH_WRONGS - 1; i++) w.wrong()
      expect(w.pageEnded()).toBe(false)
    }
    expect(w.streak()).toBe(0)
  })

  it('a clean page in the middle clears the streak completely', () => {
    // The RUN is what is being detected. A page that went well is evidence the
    // wobble has passed, so the count starts again rather than carrying over.
    const w = createBreakWatch()
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    expect(w.pageEnded()).toBe(false)          // mashed: streak 1
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    expect(w.pageEnded()).toBe(false)          // mashed: streak 2
    expect(w.pageEnded()).toBe(false)          // clean:  streak 0
    expect(w.streak()).toBe(0)

    // ...so two more mashed pages are NOT enough to fire.
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    expect(w.pageEnded()).toBe(false)
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    expect(w.pageEnded()).toBe(false)
  })

  it('suggests once per rough patch, not after every page from then on', () => {
    const w = createBreakWatch()
    const fired: boolean[] = []
    for (let page = 0; page < MASH_PAGES * 2; page++) {
      for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
      fired.push(w.pageEnded())
    }
    expect(fired.filter(Boolean)).toHaveLength(2)   // once per MASH_PAGES run
    expect(fired[MASH_PAGES - 1]).toBe(true)
    expect(fired[MASH_PAGES]).toBe(false)
  })

  it('starts a fresh page from nothing, so half a page cannot bleed into the next', () => {
    const w = createBreakWatch()
    for (let i = 0; i < MASH_WRONGS; i++) w.wrong()
    w.pageStarted()
    expect(w.pageEnded()).toBe(false)
    expect(w.streak()).toBe(0)
  })
})

/* ------------------------------------------------------------------ *
 * Through the real overlay and the real renderers.
 * ------------------------------------------------------------------ */

describe('mashing successive pages, through the real number pad', () => {
  it('asks for no further page once the run is long enough', () => {
    const { root, overlay, host } = setup()

    for (let page = 0; page < MASH_PAGES - 1; page++) {
      playSum(root, overlay, MASH_WRONGS)
      // Still going: the host is told to deal another page, as always.
      expect(host.onPassed).toHaveBeenLastCalledWith(true)
      expect(overlay.stretchDue()).toBe(false)
    }

    playSum(root, overlay, MASH_WRONGS)

    /*
     * `more: false` is the existing, tested "collect it but let me out" path —
     * so the sum they just got RIGHT is banked exactly as it would have been,
     * and the host hands the child back the island instead of dealing another
     * page. That handover is the entire mechanism: it is what makes "get up and
     * run about" something a child can actually act on.
     */
    expect(host.onPassed).toHaveBeenLastCalledWith(false)
    expect(overlay.stretchDue()).toBe(true)
  })

  it('never fires when the child is answering well', () => {
    const { root, overlay, host } = setup()
    for (let page = 0; page < MASH_PAGES + 2; page++) {
      playSum(root, overlay, 0)
      expect(host.onPassed).toHaveBeenLastCalledWith(true)
      expect(overlay.stretchDue()).toBe(false)
    }
  })

  it('does not fire on pages they get wrong twice and then answer', () => {
    // Two wrongs a page is not mashing, and it is the commonest shape of an
    // ordinary page. This is the false-alarm case in the real renderer.
    const { root, overlay, host } = setup()
    for (let page = 0; page < MASH_PAGES + 2; page++) {
      playSum(root, overlay, MASH_WRONGS - 1)
      expect(host.onPassed).toHaveBeenLastCalledWith(true)
      expect(overlay.stretchDue()).toBe(false)
    }
  })

  it('counts a mixed run, because a page is a page either way', () => {
    /*
     * Reading and maths share one watch on purpose. `balance.pages.mix` is one
     * find to three builds, so a guard that only watched the number pad would
     * miss most of a rough afternoon — and a child does not experience "three
     * reading pages" and "three sums" as separate afternoons.
     */
    const { root, overlay, host } = setup()
    playBuild(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(false)
    playSum(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(false)
    playBuild(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(true)
    expect(host.onPassed).toHaveBeenLastCalledWith(false)
  })

  it('counts the page they walk out of', () => {
    const { root, overlay, host, q } = setup()
    for (let page = 0; page < MASH_PAGES - 1; page++) playSum(root, overlay, MASH_WRONGS)

    overlay.openSum(SUM)
    for (let i = 0; i < MASH_WRONGS; i++) {
      tapChip(root, NOT_THE_ANSWER)
      vi.advanceTimersByTime(2100)
    }
    q('.overlay-x').click()

    // Leaving costs nothing (brief §19) — still a dismissal, never a collection
    // — and the run is recognised on the way out.
    expect(host.onDismissed).toHaveBeenCalled()
    // The two earlier pages they FINISHED were collected, as they should be;
    // the page they walked out of was not collected and was not meant to be.
    expect(host.onPassed).not.toHaveBeenLastCalledWith(false)
    expect(overlay.stretchDue()).toBe(true)
  })
})

/* ------------------------------------------------------------------ *
 * Brief §19: nothing is locked, nothing expires, nothing is lost.
 * ------------------------------------------------------------------ */

describe('the suggestion locks nothing and expires nothing (§19)', () => {
  it('does not close the overlay itself — the host still owns that', () => {
    // A suggestion that shut the page would be a lockout in a kind voice, and it
    // would throw away the finished page underneath it as well.
    const { root, overlay, isOpen } = setup()
    for (let page = 0; page < MASH_PAGES; page++) playSum(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(true)
    expect(isOpen()).toBe(true)
  })

  it('collects the page they just finished rather than discarding it', () => {
    const { root, overlay, host } = setup()
    for (let page = 0; page < MASH_PAGES; page++) playSum(root, overlay, MASH_WRONGS)
    // onPassed, never onDismissed: they answered it, so it counts.
    expect(host.onPassed).toHaveBeenLastCalledWith(false)
    expect(host.onDismissed).not.toHaveBeenCalled()
  })

  it('never expires, however long they are away', () => {
    /*
     * The point of the guardrail, and the reason this is not a cooldown. "Come
     * back in a minute" cannot be enforced in either direction: nothing may be
     * lost while they are gone, and nothing may quietly time out and forget
     * that they were asked.
     */
    const { root, overlay } = setup()
    for (let page = 0; page < MASH_PAGES; page++) playSum(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(true)
    vi.advanceTimersByTime(60 * 60 * 1000)      // an hour on the sofa
    expect(overlay.stretchDue()).toBe(true)
  })

  it('lets the child carry straight on if they ignore Fred entirely', () => {
    /*
     * The anti-lockout test. They may tap the egg on the very next frame, and
     * the page must answer normally — no cooldown to sit through, no dead taps.
     */
    const { root, overlay, host, isOpen } = setup()
    for (let page = 0; page < MASH_PAGES; page++) playSum(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(true)

    host.onPassed.mockClear()
    overlay.openSum({ a: 4, b: 1, op: 'add' })
    expect(isOpen()).toBe(true)
    tapChip(root, 5)
    vi.advanceTimersByTime(2500)
    expect(host.onPassed).toHaveBeenCalledWith(true)
    // ...and the suggestion is spent, so it cannot arrive again unearned.
    expect(overlay.stretchDue()).toBe(false)
  })

  it('is spent by the next page, so it can never surface out of nowhere', () => {
    const { root, overlay } = setup()
    for (let page = 0; page < MASH_PAGES; page++) playSum(root, overlay, MASH_WRONGS)
    expect(overlay.stretchDue()).toBe(true)
    overlay.openWordFind(PICKS)
    expect(overlay.stretchDue()).toBe(false)
  })

  it('has no clock, no storage and no lock in the governor at all', () => {
    /*
     * A source assertion, because it is the cheapest possible proof of a
     * negative and because "no timers, no expiry" is a rule about what the code
     * may CONTAIN, not about what one test path happens to observe.
     */
    const body = stripComments(read('../../src/island/governors.ts'))
    for (const forbidden of ['setTimeout', 'setInterval', 'Date.now', 'Date(',
      'lockInput', 'inputLock', 'localStorage', 'requestAnimationFrame']) {
      expect(body, `governors.ts must not reach for ${forbidden}`)
        .not.toContain(forbidden)
    }
  })

  it('adds no input lock of its own to the overlay', () => {
    // The renderers write `holds.inputLock` and always have (mount.ts). The
    // cross-page guard above them writes nothing: only the three ported
    // renderers may ever lock a tap, and only for their own 1.8-2s rescue.
    const body = stripComments(read('../../src/island/overlay.ts'))
    expect(body.match(/lockInput/g) ?? []).toHaveLength(1)   // the Holds port
    expect(body).not.toContain('breaks.wrong() ; lockInput')
  })
})

/* ------------------------------------------------------------------ *
 * Brief §19: never shame.
 * ------------------------------------------------------------------ */

describe("Fred's line", () => {
  const line = GOVERNOR_LINE['wriggle-break']

  it('never mentions the child, their answers or the work', () => {
    /*
     * The anti-shame test, and it is a test about GRAMMAR rather than tone,
     * because tone cannot be asserted. A six-year-old reads any sentence about
     * their own performance as a report on it, so the line may not contain one.
     */
    expect(line).not.toMatch(/wrong|mistake|try again|too hard|difficult|tricky/i)
    expect(line).not.toMatch(/\byou'?re\b|\byou are\b|\byou keep\b|\byou can'?t\b/i)
    expect(line).not.toMatch(/struggl|tired|stuck|silly|careless|score|rest\b/i)
  })

  it('is want-framed and bars nothing, like the other two governors', () => {
    expect(line).not.toMatch(/can'?t|cannot|not allowed|no more|must|stop|wait for/i)
  })

  it("puts the need for the break in FRED's mouth, not theirs", () => {
    // The whole design of the sentence: it is HIS legs, and the child is
    // invited along. That is what makes it unreadable as "you are bad at this".
    expect(line).toMatch(/\bmy\b/)
    expect(line).toMatch(/let'?s/i)
  })

  it("says what to do — get up, run about, come back (Joe's own framing)", () => {
    expect(line).toMatch(/jump up|get up|up you/i)
    expect(line).toMatch(/run about|run around/i)
    expect(line).toMatch(/come back/i)
  })

  it('promises out loud that nothing is lost while they are away (§19)', () => {
    expect(line).toMatch(/island will be right here|island will wait|be right here/i)
  })

  it('is short enough to be heard before a six-year-old walks off', () => {
    // Fred's beats cap at balance.story.beatMaxMs (5.2s). Well under it.
    expect(line.length).toBeLessThan(140)
  })
})

/* ------------------------------------------------------------------ *
 * The wiring in main.ts, pinned.
 * ------------------------------------------------------------------ */

const main = stripComments(read('../../src/island/main.ts'))

/**
 * HANDOFF §5, and the same backstop opening.test.ts carries: main.ts is
 * untested glue and this project's repeat offender. An undefended wiring line
 * here has silently reverted a fix twice in two days, and the failure mode is
 * invisible — the governor keeps counting perfectly and Fred simply never
 * speaks.
 */
describe('main.ts actually delivers the suggestion', () => {
  it('asks the overlay, in the one helper that owns the delivery', () => {
    expect(main).toContain('function offerAStretch()')
    // Exactly one place decides. Two would be two lines that could drift.
    expect(main.match(/overlay\.stretchDue\(\)/g) ?? []).toHaveLength(1)
  })

  it("speaks it through Fred's own channel, not a toast", () => {
    /*
     * `invite()` is `overlay.say()` + `speech.speak()` + Fred talking, and the
     * say card is the established want-framed channel for exactly this. A toast
     * would be wrong twice over: it is small, and `.chunk.say` — which the toast
     * element also is — is hidden by `body:has(.overlay:not(.hide)) .say`
     * whenever any panel is up.
     */
    expect(main.match(/invite\('wriggle-break'\)/g) ?? []).toHaveLength(1)
    const helper = main.slice(main.indexOf('function offerAStretch()'))
    expect(helper.slice(0, helper.indexOf('\n  }'))).toContain("invite('wriggle-break')")
  })

  it('delivers it on every path a page can end on', () => {
    /*
     * Three call sites, and all three are needed: a completed reading page, a
     * completed maths page, and a page they walked out of. Miss one and the
     * suggestion is dead on whichever half of the loop they happen to be
     * playing. (Four matches: the three calls plus the declaration.)
     */
    expect(main.match(/offerAStretch\(\)/g) ?? []).toHaveLength(4)
  })

  it('delivers it AFTER the panel is down, or the card would be invisible', () => {
    /*
     * `body:has(.overlay:not(.hide)) .say { display: none }`. That rule made
     * "Which tile would you like?" unreadable for a day, so the order of these
     * statements is load-bearing rather than tidy. Speech has the same
     * constraint from the other side: teardown calls cancel() (v0:847), so a
     * line spoken before the close is beheaded mid-word.
     */
    const passed = main.slice(main.indexOf('async function passed('))
    const body = passed.slice(0, passed.indexOf('\n  /* ---------- the opening'))
    expect(body.length).toBeGreaterThan(100)

    // The maths handover, on one line so it cannot be reordered by accident.
    expect(body).toContain('overlay.close(); offerAStretch(); return')

    // The reading handover: close first, then the offer.
    const closeAt = body.indexOf('stageFor(null); overlay.close()')
    const offerAt = body.indexOf('offerAStretch()')
    expect(closeAt).toBeGreaterThan(-1)
    expect(offerAt).toBeGreaterThan(closeAt)
  })

  it("lets Fred's story win if it is mid-sentence", () => {
    // The opening hands over exactly one page and then resumes; talking over it
    // would be two Freds at once. The suggestion simply keeps — it has no expiry.
    const at = main.indexOf('void runOpening(at) }, 600)')
    expect(at).toBeGreaterThan(-1)
    expect(main.slice(at, at + 120)).toContain('offerAStretch()')
  })

  it("does not double up with the island's ordinary greeting", () => {
    // Two say() calls in a row and only the last one is visible, which is how
    // the suggestion would silently disappear on the dismissal path.
    const dismissed = main.slice(main.indexOf('onDismissed: () => {'))
    expect(dismissed.slice(0, dismissed.indexOf('\n    },')))
      .toContain('if (!offerAStretch()) {')
  })
})

/**
 * No spoken line reaches the island without a voice script entry —
 * voice/scripts.json's own first rule, per docs/pet-island-voice.md §5.1.
 */
describe('the voice script', () => {
  interface Line { id: string; character: string; text?: string; ref?: string }
  interface Family { idPrefix: string; character: string }
  const scripts = JSON.parse(read('../../voice/scripts.json')) as
    { generated: Family[]; lines: Line[] }

  /** A line with a slot in it: `{n}`, or `{one|many}`. See governors.ts. */
  const isTemplate = (s: string): boolean => /\{/.test(s)

  /**
   * TEMPLATES ARE STORED WHOLE, so this stays a verbatim comparison.
   *
   * JT-019 turned two of the three nudges into templates, and the tempting fix
   * was to compare only the parts either side of `{n}` — which would have made
   * the assertion weaker exactly where the wording is newest, since the fixed
   * head of a sentence can match while its tail has drifted. `scripts.json`
   * carries the template as written instead (see its `about`), so the check is
   * unchanged: the script and the code hold the same string or this is red.
   */
  it("carries every one of Fred's nudges, verbatim", () => {
    const texts = scripts.lines.map(l => l.text)
    for (const [id, line] of Object.entries(GOVERNOR_LINE)) {
      expect(texts, `${id} has no entry in voice/scripts.json`).toContain(line)
    }
  })

  /**
   * ...and a template is not a recordable line on its own.
   *
   * A number cannot be baked into the sentence, so the entry has to say where
   * the numerals come from — otherwise the ledger claims to cover every spoken
   * thing while the numbers Fred actually says have no entry at all, which is
   * the one failure the file exists to prevent. The insert must also be the
   * SAME CHARACTER as the line it lands in: voice.md §3, the splice law.
   */
  it('says where a templated line gets its insert, in the same voice', () => {
    /*
     * Driven off the CODE's templates, not off a list written here, so a fourth
     * nudge with a count in it is caught by the test that already exists rather
     * than by someone remembering to extend one.
     */
    const templates = Object.entries(GOVERNOR_LINE).filter(([, l]) => isTemplate(l))
    expect(templates.length, 'JT-019 templated two of the nudges').toBeGreaterThan(0)

    for (const [id, line] of templates) {
      const entry = scripts.lines.find(l => l.text === line)
      expect(entry, `${id} has no entry in voice/scripts.json`).toBeDefined()
      const family = scripts.generated.find(g => g.idPrefix === entry?.ref)
      expect(family, `${entry?.id} has a slot but no \`ref\` to fill it from`)
        .toBeDefined()
      expect(family?.character, `${entry?.id} splices across voices — voice.md §3`)
        .toBe(entry?.character)
    }
  })

  /**
   * ...and from the other side: nothing in the script may carry a slot it has
   * not declared, whether or not the code has caught up with it yet.
   */
  it('leaves no slot in the script undeclared', () => {
    for (const line of scripts.lines) {
      if (!line.text || !isTemplate(line.text)) continue
      expect(scripts.generated.map(g => g.idPrefix),
        `${line.id} has a slot but no \`ref\` to fill it from`).toContain(line.ref)
    }
  })
})
