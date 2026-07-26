/**
 * Tap handling — the wiring layer, extracted so it can be tested.
 *
 * Every blocker found at the M0 and M1 gates lived HERE: not in the flow
 * machine (which no-ops correctly in every bad sequence) and not in the
 * renderers (which are the proven M0 modules), but in the glue that decides
 * which one to call. `flow.ts` would refuse a transition, this layer would
 * proceed as though it had happened, and the child would do real work for
 * nothing.
 *
 * So the glue lives in its own module, takes everything it touches as an
 * injected dependency, and returns the next flow state rather than mutating
 * anything. That makes the sequences that actually broke — tap Fred while
 * placing, tap a socket with no tile chosen, finish a round that never
 * legitimately opened — assertable in a plain unit test.
 */
import { tapEgg, tapSum, challengePassed, challengeFailed, placeTile } from './flow'
import type { Flow, HatchDetails } from './flow'
import type { Hit } from './scene'

export interface InteractionPorts {
  /** True while a challenge is on screen. Taps on the world are ignored then. */
  challengeOpen(): boolean
  /** True while the opening is playing; it owns taps for its duration. */
  storyPlaying(): boolean
  openRead(): void
  openSum(): void
  replayStory(): void
  bouncePet(id: string): void
  say(text: string): void
  clearSay(): void
  speak(text: string): void
  win(): void
}

/**
 * Handle one tap on the world.
 *
 * Returns the next flow state. The caller re-renders from it; nothing here
 * touches the scene directly, which is what keeps it testable.
 */
export function handleWorldTap(flow: Flow, hit: Hit | null, p: InteractionPorts): Flow {
  if (!hit) return flow
  if (p.challengeOpen() || p.storyPlaying()) return flow

  switch (hit.kind) {
    case 'egg': {
      // Reading hatches eggs (brief section 4).
      const next = tapEgg(flow)
      if (next === flow) return flow          // wrong phase: do nothing, loudly
      p.openRead()
      return next
    }

    case 'fred': {
      // "tell me again?" — replayable forever (brief section 3), but only from
      // free play, or the story would call transitions that cannot fire.
      if (flow.phase === 'free') p.replayStory()
      return flow
    }

    case 'socket': {
      if (flow.phase !== 'placing' || !flow.chosen) return flow
      const next = placeTile(flow, hit.axial)
      if (next === flow) return flow          // not a legal socket; tile kept
      p.clearSay()
      p.win()
      return next
    }

    case 'pet': {
      p.bouncePet(hit.id)
      const pet = flow.pets.find(x => x.id === hit.id)
      if (pet) p.speak(pet.name)
      return flow
    }

    case 'tile': {
      // Asking the island for land: a sum earns a tile.
      const next = tapSum(flow)
      if (next === flow) return flow
      p.openSum()
      return next
    }

    default:
      return flow
  }
}

/**
 * A challenge round finished successfully.
 *
 * `hatch` is only consulted for a reading round. If the flow is not actually
 * in a challenge — the exact shape of the swallowed-work bug — nothing
 * happens and the caller can see it, because the returned state is identical.
 */
export function handleChallengePassed(flow: Flow, hatch: HatchDetails): Flow {
  if (flow.phase !== 'challenge') return flow
  return challengePassed(flow, hatch)
}

/** The child left a challenge. Costs nothing (brief section 18). */
export function handleChallengeDismissed(flow: Flow): Flow {
  return challengeFailed(flow)
}
