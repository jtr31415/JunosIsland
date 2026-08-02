import type { Sfx } from '../platform/audio'
import type { Speaker } from '../platform/speech'

/**
 * Timing gates that live OUTSIDE any one challenge.
 *
 * All three are module-level in the original (v0:842, v0:1531) and are the
 * reason challenges do not talk over celebrations or advance through them:
 *
 *  - rewardUntil / quietUntil are written by the HOST — reward() sets both
 *    (v0:1811-1812), befriend() sets quietUntil (v0:1922) — and only read by
 *    challenges (v0:893, v0:1120, v0:1281).
 *  - inputLock is written by the challenges themselves (v0:934, 1141, 1298)
 *    and read by all of them. It is shared rather than per-mount on purpose:
 *    in the original a mash-rescue lock set in maths still applies if the
 *    child immediately switches to reading. Closure state would lose that.
 */
export interface Holds {
  /** Timestamp until which auto-advance must wait. */
  rewardUntil(): number
  /** Timestamp until which TTS must stay silent. */
  quietUntil(): number
  /** Timestamp until which taps are ignored. */
  inputLock(): number
  /** Ignore taps until the given timestamp. */
  lockInput(until: number): void
}

/**
 * The ways a child can ask a round for help — the one thing the attempt model
 * could not already see.
 *
 * Every help affordance is PRIVATE to its renderer: the dot-boxes toggle a
 * local `shown` (sum.ts), Fred-talk lives behind the returned handle
 * (build.ts), and the grey `?` sets `solved` and nothing else. None of it ever
 * left the module, so a host counting attempts could not tell an answer that
 * was worked out from one that was revealed.
 *
 * `sayAgain` is deliberately absent. It repeats the PROMPT and adds nothing to
 * it — on a listen-then-tap page, hearing the word again is the task rather
 * than a hint (and it is the host's own button, `overlay.ts`, so it never
 * needed a channel out of a renderer in the first place).
 */
export type HelpKind =
  /** A counting dot-box was opened, by their hand or by the mash rescue. */
  | 'dots'
  /** Fred sounded the word out, grapheme by grapheme (build only). */
  | 'fred'
  /**
   * The grey `?` was tapped and the answer revealed. NOT help — the round goes
   * inert and they never answer it at all, which is why it needs its own kind
   * rather than a flag on one. See `attempts.ts` for what the host does with it.
   */
  | 'peek'

/**
 * Everything a challenge needs from its host. The 2D shell and the island
 * overlay supply different implementations; the challenge itself is identical.
 */
export interface ChallengeDeps {
  /** The container to render into. Replaces $('words'). */
  el: HTMLElement
  /**
   * The whole Speaker, not just speak(): challenges need cancel() for the
   * teardown (v0:847) and the shared voice-notice flag for the no-voice
   * fallback (v0:905-907).
   */
  speech: Speaker
  sfx: Sfx
  holds: Holds
  /** True while this challenge's mode is the active one (ports the `mode !==` guards). */
  isActive(): boolean
  /**
   * Fly a star from this element to the score. The HOST owns it, because the
   * animation's onfinish is where scoring actually happens (v0:956) — literacy
   * pays 2, maths pays 1.
   */
  flyToScore(el: HTMLElement): void
  /**
   * A wrong answer landed. Additive observability hook with no counterpart in
   * the original: words2d passes a no-op, so its behaviour is unchanged, while
   * the island overlay can react to a stumble.
   */
  onWrong(): void
  /**
   * A help affordance was used. Optional, and additive on exactly the same
   * argument that sanctioned `onWrong`: words2d does not pass it, an unpassed
   * optional dep is a no-op, and no attribute or node changes — so
   * `npm run parity` still diffs like with like.
   */
  onHelp?(kind: HelpKind): void
  /** The round is finished; the host advances to the next item. */
  onAdvance(): void
  /** No voice available: show the word instead of saying it (v0:900-904). */
  showTarget(html: string): void
  hideTarget(): void
  toast(msg: string): void
  burst(x: number, y: number): void
  celebrate(): void
  /**
   * How long a solved sum sits before the next one arrives, in milliseconds.
   *
   * v0 waits 2000 (v0:1129) because the star it just launched has to reach the
   * score bar and be counted before the board changes underneath it. The
   * island has no score bar and no star — flyToScore only records that the
   * answer was right — so the whole two seconds is dead air there, and dead
   * air between pages is the one thing a child in the middle of a run will
   * notice. Injected rather than edited: omit it and the 2D game keeps the
   * frozen constant exactly.
   */
  advanceDelay?: number
}

/**
 * What a mounted challenge hands back to its host.
 *
 * `sayAgain` and `fred` exist because the help buttons must NOT restart the
 * round. In the original, btnSay repeats the audio only (v0:2086) and btnFred
 * sounds the word out grapheme by grapheme (v0:2087) — both leaving found
 * words and placed tiles exactly where the child left them. Re-mounting
 * instead would wipe their progress and reshuffle the target order, which
 * punishes the child for asking for help.
 */
export interface ChallengeHandle {
  /**
   * Cancels pending timers and speech. Does the job of clearRound
   * (v0:844-849); the host MUST call it before mounting the next challenge,
   * or a pending Fred sequence or auto-advance keeps running.
   */
  teardown(): void
  /** Repeat the prompt without disturbing progress (btnSay, v0:2086). */
  sayAgain(): void
  /** Sound it out grapheme by grapheme (btnFred, v0:2087). Build mode only. */
  fred?(): void
}
