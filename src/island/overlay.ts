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
import { mountSum } from '../challenges/sum'
import type { ChallengeDeps, ChallengeHandle, Holds } from '../challenges/mount'
import type { Speaker } from '../platform/speech'
import type { Sfx } from '../platform/audio'
import type { ReadPick } from '../core/generators/read'
import type { SumItem } from '../core/generators/sums'

export interface OverlayHost {
  speech: Speaker
  sfx: Sfx
  /** Fired when the child finishes a round: hatch the egg, or bank a tile. */
  onPassed(): void
  /** Fired when the overlay is dismissed without finishing. Costs nothing. */
  onDismissed(): void
}

export interface Overlay {
  openWordFind(picks: ReadPick[]): void
  openSum(item: SumItem): void
  close(): void
  say(text: string, onTap?: () => void): void
  clearSay(): void
  showName(name: string): void
  toast(msg: string): void
  isOpen(): boolean
}

export function createOverlay(root: HTMLElement, host: OverlayHost): Overlay {
  const layer = document.createElement('div')
  layer.className = 'overlay hide'

  const shell = document.createElement('div')
  shell.className = 'chunk overlay-panel'

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
  shell.append(panel, back)
  layer.append(shell)

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
       world itself changes. So the star just sparkles where it was earned. */
    flyToScore: () => {},
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
    /* For a word-find, celebrate fires when every word has been found. */
    celebrate: () => { finish() },
  })

  function teardown(): void {
    if (handle) { handle.teardown(); handle = null }
    layer.classList.add('hide')
    targetCard.classList.add('hide')
  }

  function finish(): void {
    teardown()
    host.onPassed()
  }

  back.onclick = () => {
    const wasOpen = !layer.classList.contains('hide')
    teardown()
    if (wasOpen) host.onDismissed()
  }

  return {
    openWordFind(picks) {
      teardown()
      layer.classList.remove('hide')
      handle = mountWordFind(picks, deps())
    },

    openSum(item) {
      teardown()
      layer.classList.remove('hide')
      handle = mountSum(item, deps())
    },

    close() {
      const wasOpen = !layer.classList.contains('hide')
      teardown()
      if (wasOpen) host.onDismissed()
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

    showName(name) {
      nameEl.textContent = name
      nameEl.classList.remove('hide')
      setTimeout(() => nameEl.classList.add('hide'), 2600)
    },

    toast,

    isOpen: () => !layer.classList.contains('hide'),
  }
}
