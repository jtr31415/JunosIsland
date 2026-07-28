/**
 * The attempt model (Run A, item A2): what the island actually knows about how
 * a page went.
 *
 * ONE ATTEMPT PER TARGET, and the three rules are the spec's:
 *
 *   - find  · one attempt per WORD, correct iff its first tap is right
 *   - build · one per word, correct iff completed with zero wrong tile taps
 *   - sum   · one, correct iff the first pad tap is right
 *
 * All three reduce to the same test — *did any wrong tap land before the right
 * one?* — which is why this is one state machine and not three.
 *
 * WHY IT IS A MODULE AND NOT A CLOSURE IN `overlay.ts`. The survey said "a
 * small host-side state machine in the overlay", and it is host-side; but the
 * overlay is a 700-line DOM file whose tests need jsdom, fake timers and a
 * stubbed WAAPI to say anything at all. The rules above are arithmetic over an
 * event order, and arithmetic deserves to be tested as arithmetic. The overlay
 * keeps the wiring; this keeps the judgement. `tests/island/attempts.test.ts`
 * drives it directly and `tests/island/overlay.test.ts` proves the wiring.
 *
 * NOTHING HERE IS PERSISTED. It emits an `AttemptEvent` per resolved attempt
 * and forgets it; the stage it belongs to, the EWMA it moves and the ring it
 * lands in are all A3/A5's business (`harness.recordAttempt`). A2 is the
 * witness, not the ledger.
 */
import { MASH_WRONGS } from './governors'

/** Which renderer produced the attempt. `overlay.ts` already tracks it. */
export type PageKind = 'find' | 'build' | 'sum'

/**
 * One resolved attempt.
 *
 * "Resolved" is load-bearing: an attempt that was never finished — she left
 * mid-word, or she peeked — is never emitted at all. See `pageEnded` and
 * `help('peek')`.
 */
export interface AttemptEvent {
  kind: PageKind
  /**
   * Which target within the page, in the order they were asked. Always 0 on
   * build and sum, which put one question each; a five-word find page emits
   * 0..4 as she works down it.
   */
  index: number
  correct: boolean
  /**
   * Question put → first tap, in milliseconds, or null if she tapped before
   * the prompt was ever issued (possible on find and build, where the prompt
   * runs off a timer that `quietUntil` can defer).
   *
   * STORED RAW. The report takes correct-only MEDIANS of these and never the
   * mean — a child who wanders off mid-page and comes back leaves a
   * twenty-minute latency in the ring, and one of those moves a mean by more
   * than a month of genuine improvement does.
   */
  latencyMs: number | null
  /**
   * A dot-box was opened or Fred sounded the word out during this attempt.
   *
   * IT DOES NOT EXCLUDE, and that is Joe's ruling (JT-008(2)) overturning the
   * spec's "help is free but uncounted". His reasoning: a hinted answer is
   * still an answer, it takes longer, and the speed measure is where that
   * shows up — so hiding it from accuracy would throw away a real answer to
   * protect a number that has its own way of telling the truth.
   *
   * Carried anyway because it is free to carry and expensive to reconstruct.
   * No Run A estimate reads it.
   */
  helped: boolean
  /**
   * Her wrong taps on this attempt reached the mash threshold, so the
   * renderer's own rescue fired (the word again slowly, or the dots opening).
   *
   * Recorded rather than excluded, and by construction it changes no accuracy:
   * a rescue needs `MASH_WRONGS` wrongs to summon it, so the attempt it lands
   * on is already incorrect under all three rules above. It exists for A6's
   * CONSISTENCY tier, which asks for recent sessions with no rescue in them.
   */
  rescued: boolean
  /** When it resolved. */
  at: number
}

export interface AttemptTally {
  /** A fresh page is on screen. Anything in flight from the last one is lost. */
  pageStarted(kind: PageKind): void
  /**
   * The question was actually PUT — spoken, or painted on a voiceless device.
   *
   * Not the mount: on find and build the prompt is issued from a timer that
   * `quietUntil` can defer, so timing from the mount would measure the timer
   * rather than the child. Idempotent within an attempt — the first prompt
   * starts the clock and the re-reads (`sayAgain`, the 650ms retry, the slow
   * rescue) leave it alone, because they are not a fresh question.
   */
  prompted(): void
  /** A wrong tap landed (`ChallengeDeps.onWrong`). */
  wrong(): void
  /**
   * The right answer landed (`ChallengeDeps.flyToScore`). Resolves the current
   * attempt and opens the next one.
   */
  right(): void
  /** A help affordance was used (`ChallengeDeps.onHelp`). */
  help(kind: 'dots' | 'fred' | 'peek'): void
  /** The page ended, however it ended. */
  pageEnded(): void
}

export function createAttemptTally(
  emit: (e: AttemptEvent) => void,
  now: () => number = Date.now,
): AttemptTally {
  let kind: PageKind | null = null
  let index = 0
  let wrongs = 0
  let helped = false
  let rescued = false
  /** She revealed the answer, so there is nothing here to judge. */
  let voided = false
  let askedAt: number | null = null
  let firstTapAt: number | null = null

  /** Everything that is true of ONE target, cleared as the next one opens. */
  const openAttempt = (): void => {
    wrongs = 0
    helped = false
    rescued = false
    voided = false
    askedAt = null
    firstTapAt = null
  }

  const tapped = (): void => { if (firstTapAt === null) firstTapAt = now() }

  return {
    pageStarted(k) {
      kind = k
      index = 0
      openAttempt()
      /*
       * A sum is on screen at mount — the numbers, the operator and the grey
       * `?` are all painted in the same synchronous step — so the question is
       * put the moment the page is. Find and build wait for their prompt.
       */
      if (k === 'sum') askedAt = now()
    },

    prompted() {
      if (kind && askedAt === null) askedAt = now()
    },

    wrong() {
      if (!kind) return
      tapped()
      /*
       * `>=` rather than `===` because the renderers reset their own counters
       * the moment a rescue fires, so a badly-stuck target can summon two. One
       * rescue and three are the same fact here: help arrived uninvited.
       */
      if (++wrongs >= MASH_WRONGS) rescued = true
    },

    right() {
      if (!kind) return
      tapped()
      if (!voided) {
        emit({
          kind,
          index,
          correct: wrongs === 0,
          latencyMs: askedAt !== null && firstTapAt !== null ? firstTapAt - askedAt : null,
          helped,
          rescued,
          at: now(),
        })
      }
      index++
      openAttempt()
    },

    help(k) {
      if (!kind) return
      /*
       * THE PEEK IS NOT HELP, and the difference is the whole of JT-008(1).
       * Tapping the grey `?` reveals the answer and the round goes inert — she
       * never answers it, so there is no answer to be right or wrong about.
       * Joe: *"peeking is not rewarded — it is counted as no attempt."* So the
       * attempt is voided rather than marked, and `right()` will emit nothing
       * even if the pad somehow fires afterwards.
       *
       * A peeked stage therefore reads as UNPRACTISED (dashes, until she does
       * fifteen real ones) rather than as fine. That is the honest reading: the
       * report should not tell you she can do something she has not done.
       */
      if (k === 'peek') voided = true
      else helped = true
    },

    pageEnded() {
      /*
       * The attempt in flight is DISCARDED, never failed.
       *
       * She tapped the X in the middle of a word. Joe's ruling (JT-008(3)):
       * *"abandoned challenges should be measured as paused and answers made
       * so far count towards proficiency."* Both halves are here, and the
       * second one needs no code — every target she DID answer was emitted the
       * moment it resolved, so walking away cannot reach back and unmake them.
       * Only the unfinished one goes, and it goes silently: leaving is not
       * evidence of getting it wrong, and a model that counted it would mean
       * the safest thing a struggling child could do was guess.
       */
      kind = null
      index = 0
      openAttempt()
    },
  }
}
