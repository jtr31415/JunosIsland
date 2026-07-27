/**
 * The learning overlay: ordinary DOM above the 3D canvas.
 *
 * This is the whole point of the M0 extraction. The word-find, the tile
 * builder and the number pad are NOT reimplemented here — they are the exact
 * modules the 2D game ships, mounted into a div over the island. If they
 * behave differently here than they do for Juno today, that is a bug.
 *
 * The overlay knows nothing about Three.js, and the world knows nothing about
 * challenges. `flow.ts` is the only thing that talks to both.
 */
import '../ui/tokens.css'
import '../ui/challenges.css'
import { mountWordFind } from '../challenges/wordFind'
import { mountBuild } from '../challenges/build'
import { mountSum } from '../challenges/sum'
import type { ChallengeDeps, ChallengeHandle, Holds } from '../challenges/mount'
import type { Speaker } from '../platform/speech'
import type { Sfx } from '../platform/audio'
import type { ReadPick } from '../core/generators/read'
import type { BuildItem } from '../core/generators/build'
import type { SumItem } from '../core/generators/sums'
import { balance } from './balance'

export interface OverlayHost {
  speech: Speaker
  sfx: Sfx
  /**
   * The child finished a round: hatch the egg, or bank a tile.
   *
   * THE OVERLAY IS STILL OPEN when this fires, and it stays open until the
   * host either opens the next round or calls close(). That is the wrong way
   * round from most modals, and it is deliberate: the child stays in the work
   * until the reward lands (brief §13). The first attempt had the overlay
   * close itself and the host reopen it a beat later, which meant the island
   * flashed past between every page — the very trip the rule exists to avoid.
   *
   * `more` is false when the child asked to leave with work already banked, so
   * the host collects the reward but does NOT deal another page.
   */
  onPassed(more: boolean): void
  /** Fired when the overlay is dismissed without finishing. Costs nothing. */
  onDismissed(): void
}

export interface Overlay {
  /**
   * Mount a round, optionally beside the 3D vignette.
   *
   * `staged` is an ARGUMENT rather than a separate call, and that is the whole
   * point: every open*() tears the previous round down first, and teardown
   * drops the staged layout. Raising the stage as its own step before the
   * mount therefore set a flag that was wiped microseconds later — the split
   * view never appeared once. Passing it in makes mounting and staging a
   * single act that cannot be sequenced wrongly.
   */
  openWordFind(picks: ReadPick[], staged?: boolean): void
  /** A build page: assemble one word from grapheme tiles (slice-1 spec §3). */
  openBuild(item: BuildItem, staged?: boolean): void
  openSum(item: SumItem, staged?: boolean): void
  close(): void
  /**
   * Raise or drop the split layout outside of a mount.
   *
   * Prefer the `staged` argument on open*(); this exists for the paths that
   * take the vignette down without opening anything.
   */
  setStaged(v: boolean): void
  /**
   * Ignore every way out, briefly.
   *
   * For a ceremony: the seconds between the last correct answer and the
   * friend arriving are an ANIMATION, not a moment of choice, and a tap
   * during them used to tear the egg off the stage mid-hatch and could strand
   * the flow in a challenge with no overlay to finish or dismiss.
   *
   * Deliberately not a lockout of the child — nothing is greyed out, nothing
   * is refused twice, and it lasts under two seconds (brief §19 forbids
   * pressure, not choreography).
   */
  setBusy(v: boolean): void
  /** Where the vignette should be drawn, in CSS pixels, or null if unstaged. */
  stageRect(): { x: number; y: number; width: number; height: number } | null
  /** "How much longer", with no numbers (§6). */
  setDots(filled: number, total: number): void
  say(text: string, onTap?: () => void): void
  clearSay(): void
  showName(name: string): void
  /** Take the name card down early, e.g. when the chip carries the name on. */
  clearName(): void
  /**
   * Send a chip flying from the middle of the screen into the album button.
   *
   * §3's last beat. It answers the question a six-year-old actually has at
   * the end of a hatch — "where did my friend GO?" — by drawing the line
   * between the ceremony and the place her friends are kept. Without it the
   * album is a button she has no reason to believe in.
   *
   * Silently does nothing if the target is missing or the browser has no
   * WAAPI: a decoration that throws would take the ceremony with it.
   */
  flyToAlbum(name: string, target: Element | null): void
  /**
   * Ask the child her name, once, before the story starts.
   *
   * In-page rather than window.prompt: a browser dialog is grey, system-font
   * and frightening in a way the brief rules out (§1.2, bright never scary),
   * and on a tablet it covers the game with an OS panel. Resolves with '' if
   * she skips, which must always be allowed — a name prompt cannot be a wall
   * between a child and the game.
   */
  askName(): Promise<string>
  toast(msg: string): void
  isOpen(): boolean
}

/**
 * How long a finished round holds before the host is told, in milliseconds.
 *
 * Long enough to register that the last answer landed and to let the win
 * sound start; short enough that a child working through five pages is never
 * waiting on the game. These were 800 and 2000, which stacked with the host's
 * own page gap into a pause that read as the app thinking.
 */
const FINISHED_HOLD_MS = 420
const SUM_ADVANCE_MS = 420

export function createOverlay(root: HTMLElement, host: OverlayHost): Overlay {
  const layer = document.createElement('div')
  layer.className = 'overlay hide'

  const shell = document.createElement('div')
  shell.className = 'chunk overlay-panel'

  /**
   * Say it again.
   *
   * The single most-needed control in a listen-then-tap game: a child who
   * missed the word has no way forward without it, and guessing is not
   * reading. It repeats the prompt WITHOUT restarting the round — found words
   * and placed tiles stay exactly where she left them.
   */
  const again = document.createElement('button')
  again.className = 'chunk chunk-button overlay-again'
  again.textContent = '\u{1F50A} say it again'
  again.setAttribute('aria-label', 'say it again')

  /**
   * A way out. THIS IS NOT OPTIONAL.
   *
   * Without it a child can be trapped: peeking at a sum's answer sets the
   * renderer's `solved` flag and disables the number pad (a faithful port of
   * v0), but the island has no forward-tap navigation like the 2D game does,
   * so nothing can ever fire onAdvance. The only exit was reloading the page.
   *
   * Leaving costs nothing — challengeFailed takes no tile and no pet.
   */
  const back = document.createElement('button')
  back.className = 'chunk chunk-button overlay-back'
  back.textContent = '← back to the island'
  back.setAttribute('aria-label', 'back to the island')

  const panel = document.createElement('div')
  panel.id = 'words'          // the ported renderers style themselves from this

  /*
   * The slot the 3D vignette is drawn into.
   *
   * Deliberately EMPTY and transparent: it is a hole in the layout, not a
   * container. The renderer scissors into the rect this element happens to
   * occupy, which lets CSS own the responsive split (§6's 55/45, and the
   * landscape/portrait flip) without the 3D code knowing anything about it.
   */
  const stageSlot = document.createElement('div')
  stageSlot.className = 'stage-slot'

  const dots = document.createElement('div')
  dots.className = 'stage-dots'
  stageSlot.append(dots)

  const controls = document.createElement('div')
  controls.className = 'overlay-controls'
  controls.append(again, back)

  shell.append(panel, controls)
  layer.append(shell, stageSlot)

  const sayEl = document.createElement('div')
  sayEl.className = 'chunk say hide'

  const nameEl = document.createElement('div')
  nameEl.className = 'chunk hatch-name hide'

  const toastEl = document.createElement('div')
  toastEl.className = 'chunk say hide'
  toastEl.style.bottom = 'auto'
  toastEl.style.top = '4vh'

  const targetCard = document.createElement('div')
  targetCard.className = 'chunk say hide'

  root.append(layer, sayEl, nameEl, toastEl, targetCard)

  let handle: ChallengeHandle | null = null
  let toastTimer: ReturnType<typeof setTimeout> | null = null
  let nameTimer: ReturnType<typeof setTimeout> | null = null
  /**
   * Set the moment a correct answer lands, before the renderer's own
   * auto-advance has fired.
   *
   * Without it there is a two-second window in which the child has answered
   * correctly, the star has flown, and tapping "back to the island" throws the
   * work away — completed work discarded, which section 18 forbids. Leaving
   * after earning therefore COLLECTS rather than dismisses.
   */
  let earned = false
  /**
   * Shared timing gates. The island has no spectacles yet, so reward and quiet
   * are always zero — but inputLock is real, because the mash rescues in the
   * ported renderers write to it.
   */
  let inputLock = 0
  const holds: Holds = {
    rewardUntil: () => 0,
    quietUntil: () => 0,
    inputLock: () => inputLock,
    lockInput: (until: number) => { inputLock = until },
  }

  const toast = (msg: string): void => {
    toastEl.textContent = msg
    toastEl.classList.remove('hide')
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toastEl.classList.add('hide'), 3200)
  }

  const deps = (): ChallengeDeps => ({
    el: panel,
    speech: host.speech,
    sfx: host.sfx,
    holds,
    isActive: () => !layer.classList.contains('hide'),
    /* No score bar on the island — finishing the round is the reward, and the
       world itself changes. But this is also the renderer's signal that an
       answer was CORRECT, which is what makes leaving safe below. */
    flyToScore: () => { earned = true },
    onWrong: () => {},
    /* For a sum, the first correct answer completes the round. */
    onAdvance: () => { finish() },
    showTarget: html => {
      targetCard.innerHTML = html
      targetCard.classList.remove('hide')
    },
    hideTarget: () => targetCard.classList.add('hide'),
    toast,
    burst: () => {},
    /* No score bar and no star to wait for — see ChallengeDeps.advanceDelay. */
    advanceDelay: SUM_ADVANCE_MS,
    /*
     * For a word-find, celebrate fires when every word has been found.
     *
     * The 2D game plays 'win', says "Well done!" and bursts for 1.7s before
     * advancing (v0:959-971). Here the hatch carries the praise, but two
     * things were genuinely lost: the last tap sounded like every other tap,
     * and the overlay vanished on the same frame, which reads as "did that
     * count?". So: the win sound and a half-beat to breathe.
     *
     * Deliberately NOT the spoken "Well done!" — speak() cancels the previous
     * utterance (v0:749, faithfully ported), so the hatch line moments later
     * would behead it. A stutter is worse than no praise; the hatch line is
     * already personalised and world-lawful.
     */
    celebrate: () => {
      earned = true
      host.sfx.play('win')
      setTimeout(() => finish(), FINISHED_HOLD_MS)
    },
  })

  function teardown(): void {
    busy = false
    if (handle) { handle.teardown(); handle = null }
    layer.classList.add('hide')
    layer.classList.remove('staged')
    targetCard.classList.add('hide')
  }

  /**
   * A round completed on its own terms — every word found, or the sum
   * answered.
   *
   * Note what is NOT here: no teardown and no hide. The finished page stays
   * exactly as the child left it, and whatever the host does next decides its
   * fate. If the host deals another page, open*() tears this one down and
   * remounts in the same synchronous step, so the layer is never painted
   * hidden and there is no blink. If the host is done, it calls close().
   */
  function finish(): void {
    earned = false
    host.onPassed(true)
  }

  again.onclick = () => { handle?.sayAgain() }

  /*
   * Tapping outside the panel goes back to the island.
   *
   * The first thing anyone tries with a modal, and the backdrop was dead. It
   * takes exactly the same path as the button — which means work already
   * earned is COLLECTED rather than thrown away (brief §19); a dismissal that
   * silently discarded a correct answer would be much worse than a dead
   * backdrop. The target check matters: without it, every tap inside the
   * panel would bubble up and close the round mid-word.
   */
  /** While true, the ways out are ignored. See setBusy(). */
  let busy = false
  let backdropPress = false
  layer.addEventListener('pointerdown', e => { backdropPress = !busy && e.target === layer })
  layer.addEventListener('pointerup', e => {
    // On RELEASE, and only if the press began out here too. Acting on contact
    // would dismiss a round the moment a finger landed to drag the island
    // behind the panel — the very gesture the canvas was just fixed for.
    if (backdropPress && e.target === layer) back.click()
    backdropPress = false
  })

  back.onclick = () => {
    const wasOpen = !layer.classList.contains('hide')
    if (!wasOpen || busy) return
    // Already answered correctly? Then leaving COLLECTS. Never discard work
    // the child has actually done (brief section 18). But she asked to go, so
    // the reward lands on the island and no further page is dealt.
    const collect = earned
    earned = false
    teardown()
    if (collect) host.onPassed(false)
    else host.onDismissed()
  }

  return {
    openWordFind(picks, staged = false) {
      teardown()
      earned = false
      layer.classList.toggle('staged', staged)
      again.classList.remove('hide')
      layer.classList.remove('hide')
      handle = mountWordFind(picks, deps())
    },

    openBuild(item, staged = false) {
      teardown()
      earned = false
      layer.classList.toggle('staged', staged)
      again.classList.remove('hide')
      layer.classList.remove('hide')
      handle = mountBuild(item, deps())
    },

    openSum(item, staged = false) {
      teardown()
      earned = false
      layer.classList.toggle('staged', staged)
      // A sum is on screen to be read, so there is no prompt to repeat — and
      // a button that does nothing is worse than no button.
      again.classList.add('hide')
      layer.classList.remove('hide')
      handle = mountSum(item, deps())
    },

    /**
     * Shut the overlay and go back to the island.
     *
     * Silent on purpose: this is the host saying "we are done here", so
     * firing onDismissed would report the child's own completed sitting back
     * to the host as an abandonment and un-arm the opening story.
     */
    setStaged(v) {
      layer.classList.toggle('staged', v)
    },

    setBusy(v) { busy = v },

    stageRect() {
      if (!layer.classList.contains('staged')) return null
      const r = stageSlot.getBoundingClientRect()
      return { x: r.left, y: r.top, width: r.width, height: r.height }
    },

    setDots(filled, total) {
      if (dots.childElementCount !== total) {
        dots.replaceChildren()
        for (let i = 0; i < total; i++) {
          const d = document.createElement('span')
          d.className = 'stage-dot'
          dots.append(d)
        }
      }
      ;[...dots.children].forEach((d, i) => {
        d.classList.toggle('on', i < filled)
      })
    },

    close() { teardown() },

    askName() {
      return new Promise<string>(resolve => {
        const box = document.createElement('div')
        box.className = 'chunk overlay-panel ask-name'

        const title = document.createElement('div')
        title.className = 'ask-name-title'
        title.textContent = "What's your name?"

        const field = document.createElement('input')
        field.className = 'chunk ask-name-input'
        field.type = 'text'
        field.autocomplete = 'off'
        // A first name, not an essay. Long enough for anyone, short enough
        // to fit on a signpost.
        field.maxLength = 16
        field.setAttribute('aria-label', 'your name')

        const go = document.createElement('button')
        go.className = 'chunk chunk-button overlay-again'
        go.textContent = "that's me!"

        const skip = document.createElement('button')
        skip.className = 'chunk chunk-button overlay-back'
        skip.textContent = 'not now'

        const row = document.createElement('div')
        row.className = 'overlay-controls'
        row.append(go, skip)
        box.append(title, field, row)

        const wrap = document.createElement('div')
        wrap.className = 'overlay'
        wrap.append(box)
        root.append(wrap)
        setTimeout(() => field.focus(), 60)

        const done = (value: string): void => {
          wrap.remove()
          resolve(value.trim().slice(0, 16))
        }
        go.onclick = () => done(field.value)
        skip.onclick = () => done('')
        field.addEventListener('keydown', e => {
          if ((e as KeyboardEvent).key === 'Enter') done(field.value)
        })
      })
    },

    say(text, onTap) {
      sayEl.textContent = text
      sayEl.classList.remove('hide')
      sayEl.onclick = onTap ? () => onTap() : null
    },

    clearSay() {
      sayEl.classList.add('hide')
      sayEl.onclick = null
    },

    flyToAlbum(name, target) {
      if (!target || typeof Element.prototype.animate !== 'function') return
      const to = target.getBoundingClientRect()

      const chip = document.createElement('div')
      chip.className = 'chunk album-chip'
      chip.textContent = name
      chip.setAttribute('aria-hidden', 'true')   // the name was already spoken
      root.append(chip)

      const from = chip.getBoundingClientRect()
      const dx = (to.left + to.width / 2) - (from.left + from.width / 2)
      const dy = (to.top + to.height / 2) - (from.top + from.height / 2)

      /*
       * Every keyframe carries the -50% centring.
       *
       * A WAAPI animation on `transform` REPLACES the base transform for its
       * whole duration, so keyframes that only translate threw the chip's own
       * centring away — it jumped half its width and height on the first
       * frame, exactly as the eye landed on it, and then aimed past the
       * button by the same amount all the way to the end.
       */
      const at = (x: number, y: number, k: number): string =>
        `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${k})`

      const flight = chip.animate([
        { transform: at(0, 0, 1), opacity: 1 },
        // Up and over, so it arcs rather than sliding along a ruler.
        { transform: at(dx * 0.5, dy * 0.3 - 48, 0.86), opacity: 1, offset: 0.5 },
        { transform: at(dx, dy, 0.3), opacity: 0 },
      ], {
        duration: balance.stage.chipMs,
        // Gentler than it was: it used to snap away, which read as the name
        // being taken rather than being put somewhere safe.
        easing: 'cubic-bezier(.25,.6,.3,1)',
        // HOLD the last frame. Without it the chip snaps back to mid-screen at
        // full opacity the instant the animation ends, and sits there until
        // the backstop — turning a dropped onfinish from invisible into ugly.
        fill: 'forwards',
      })
      flight.onfinish = () => chip.remove()
      // A dropped animation must not leave litter on the island.
      setTimeout(() => chip.remove(), balance.stage.chipMs + 600)
    },

    clearName() {
      nameEl.classList.add('hide')
      if (nameTimer) { clearTimeout(nameTimer); nameTimer = null }
    },

    showName(name) {
      nameEl.textContent = name
      nameEl.classList.remove('hide')
      if (nameTimer) clearTimeout(nameTimer)
      // Tracked, so clearName() can take it down early when the album chip
      // picks the name up — two copies of the same name on screen at once
      // reads as the name duplicating itself, not as one flying away.
      nameTimer = setTimeout(() => { nameEl.classList.add('hide'); nameTimer = null }, 2600)
    },

    toast,

    isOpen: () => !layer.classList.contains('hide'),
  }
}
